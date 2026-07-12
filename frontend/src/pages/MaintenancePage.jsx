import { useEffect, useMemo, useState } from 'react';
import { BadgeAlert, Plus, ShieldCheck, Wrench } from 'lucide-react';
import {
  approveMaintenance,
  assignTechnician,
  createMaintenance,
  getMaintenanceRequests,
  rejectMaintenance,
  resolveMaintenance,
  startMaintenance,
} from '../api/dataApi';
import { useAuth } from '../context/AuthContext';
import {
  EmptyState,
  FiltersBar,
  LoadingState,
  MetricCard,
  PageHeader,
  StatusPill,
  SurfaceCard,
  formatDate,
} from '../components/ui';

function MaintenancePage() {
  const { hasRole } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ priority: 'Medium' });
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await getMaintenanceRequests({ limit: 50, status: filter || undefined });
      setRequests(res.data.data.requests);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter]);

  const handleCreate = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await createMaintenance(form);
      setShowForm(false);
      setForm({ priority: 'Medium' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create request');
    }
  };

  const handleAction = async (id, action) => {
    try {
      if (action === 'approve') await approveMaintenance(id);
      if (action === 'reject') {
        const reason = prompt('Rejection reason:');
        if (!reason) return;
        await rejectMaintenance(id, { rejectionReason: reason });
      }
      if (action === 'assign') {
        const tech = prompt('Technician name:');
        if (!tech) return;
        await assignTechnician(id, { assignedTechnician: tech });
      }
      if (action === 'start') await startMaintenance(id);
      if (action === 'resolve') {
        const notes = prompt('Resolution notes:');
        if (!notes) return;
        await resolveMaintenance(id, { resolutionNotes: notes });
      }
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Maintenance action failed');
    }
  };

  const stats = useMemo(() => ({
    pending: requests.filter((item) => item.status === 'Pending').length,
    inProgress: requests.filter((item) => item.status === 'InProgress').length,
    critical: requests.filter((item) => item.priority === 'Critical').length,
  }), [requests]);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Repair workflow"
        title="Maintenance intake and resolution"
        description="Route requests through approval, technician assignment, execution, and resolution while keeping asset availability visible."
        actions={[
          <button key="new" className="button button-primary" onClick={() => setShowForm((value) => !value)}>
            <Plus size={18} />
            <span>{showForm ? 'Close request form' : 'Raise request'}</span>
          </button>,
        ]}
      />

      <section className="kpi-grid">
        <MetricCard title="Pending review" value={stats.pending} icon={ShieldCheck} tone="var(--warning)" index={0} footer="Requests waiting for asset manager approval" />
        <MetricCard title="In progress" value={stats.inProgress} icon={Wrench} tone="var(--brand-primary)" index={1} footer="Work already underway" />
        <MetricCard title="Critical priority" value={stats.critical} icon={BadgeAlert} tone="var(--danger)" index={2} footer="Highest urgency maintenance items" />
      </section>

      <SurfaceCard title="Maintenance queue" description="Filter request status and keep transitions moving." index={0}>
        <div className="page-stack">
          <FiltersBar>
            <select className="select" style={{ maxWidth: 220 }} value={filter} onChange={(event) => setFilter(event.target.value)}>
              <option value="">All statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="TechnicianAssigned">Technician assigned</option>
              <option value="InProgress">In progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </FiltersBar>

          {error ? <div className="alert">{error}</div> : null}

          {showForm ? (
            <form onSubmit={handleCreate} style={{ display: 'grid', gap: '1rem', padding: '1.2rem', borderRadius: 22, background: 'rgba(8, 18, 34, 0.54)', border: '1px solid rgba(148, 163, 184, 0.08)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div className="field">
                  <label>Asset ID</label>
                  <input className="input" value={form.asset || ''} onChange={(event) => setForm({ ...form, asset: event.target.value })} required />
                </div>
                <div className="field">
                  <label>Priority</label>
                  <select className="select" value={form.priority || 'Medium'} onChange={(event) => setForm({ ...form, priority: event.target.value })}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div className="field" style={{ gridColumn: '1 / -1' }}>
                  <label>Description</label>
                  <textarea className="textarea" value={form.description || ''} onChange={(event) => setForm({ ...form, description: event.target.value })} required minLength={10} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button type="submit" className="button button-primary">Submit request</button>
                <button type="button" className="button button-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          ) : null}

          {loading ? (
            <LoadingState label="Loading maintenance queue..." />
          ) : requests.length === 0 ? (
            <EmptyState icon={Wrench} title="No maintenance requests" description="Requests raised by employees or managers will appear here for approval and resolution." />
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Description</th>
                    <th>Requester</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Technician</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request._id}>
                      <td>
                        <div style={{ fontWeight: 800 }}>{request.asset?.name}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{request.asset?.assetTag}</div>
                      </td>
                      <td>
                        <div style={{ maxWidth: 300 }}>{request.description}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.35rem' }}>{formatDate(request.createdAt)}</div>
                      </td>
                      <td>{request.requestedBy?.name || '--'}</td>
                      <td><StatusPill>{request.priority}</StatusPill></td>
                      <td><StatusPill>{request.status}</StatusPill></td>
                      <td>{request.assignedTechnician || '--'}</td>
                      <td>
                        {hasRole('Admin', 'AssetManager') ? (
                          <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap' }}>
                            {request.status === 'Pending' ? (
                              <>
                                <button className="button button-success button-sm" onClick={() => handleAction(request._id, 'approve')}>Approve</button>
                                <button className="button button-danger button-sm" onClick={() => handleAction(request._id, 'reject')}>Reject</button>
                              </>
                            ) : null}
                            {request.status === 'Approved' ? (
                              <button className="button button-secondary button-sm" onClick={() => handleAction(request._id, 'assign')}>Assign tech</button>
                            ) : null}
                            {request.status === 'TechnicianAssigned' ? (
                              <button className="button button-secondary button-sm" onClick={() => handleAction(request._id, 'start')}>Start</button>
                            ) : null}
                            {['Approved', 'TechnicianAssigned', 'InProgress'].includes(request.status) ? (
                              <button className="button button-primary button-sm" onClick={() => handleAction(request._id, 'resolve')}>Resolve</button>
                            ) : null}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>View only</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </SurfaceCard>

      <style>{`
        @media (max-width: 1200px) {
          .kpi-grid > * { grid-column: span 4 !important; }
        }
        @media (max-width: 780px) {
          .kpi-grid > * { grid-column: span 2 !important; }
        }
      `}</style>
    </div>
  );
}

export default MaintenancePage;
