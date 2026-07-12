import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMaintenanceRequests, createMaintenance, approveMaintenance, rejectMaintenance, assignTechnician, startMaintenance, resolveMaintenance } from '../api/dataApi';

const MaintenancePage = () => {
  const { hasRole } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await getMaintenanceRequests({ limit: 50, status: filter || undefined });
      setRequests(res.data.data.requests);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createMaintenance(form);
      setShowForm(false);
      setForm({});
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    }
  };

  const handleAction = async (id, action) => {
    try {
      if (action === 'approve') await approveMaintenance(id);
      else if (action === 'reject') {
        const reason = prompt('Rejection reason:');
        if (!reason) return;
        await rejectMaintenance(id, { rejectionReason: reason });
      } else if (action === 'assign') {
        const tech = prompt('Technician name:');
        if (!tech) return;
        await assignTechnician(id, { assignedTechnician: tech });
      } else if (action === 'start') await startMaintenance(id);
      else if (action === 'resolve') {
        const notes = prompt('Resolution notes:');
        if (!notes) return;
        await resolveMaintenance(id, { resolutionNotes: notes });
      }
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const statusBadge = { Pending: 'badge-warning', Approved: 'badge-info', Rejected: 'badge-danger', TechnicianAssigned: 'badge-info', InProgress: 'badge-warning', Resolved: 'badge-success' };
  const priorityBadge = { Low: 'badge-neutral', Medium: 'badge-info', High: 'badge-warning', Critical: 'badge-danger' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Maintenance</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>Manage repair requests and workflows</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ Raise Request</button>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <select className="input" style={{ maxWidth: '180px' }} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option><option value="Approved">Approved</option>
          <option value="TechnicianAssigned">Technician Assigned</option><option value="InProgress">In Progress</option>
          <option value="Resolved">Resolved</option><option value="Rejected">Rejected</option>
        </select>
      </div>

      {error && <div style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.1)', borderRadius: '0.5rem', color: '#f87171', fontSize: '0.8125rem', marginBottom: '1rem' }}>{error}</div>}

      {showForm && (
        <form onSubmit={handleCreate} className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>New Maintenance Request</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            <div><label className="label">Asset ID *</label><input className="input" placeholder="Asset ObjectId" value={form.asset || ''} onChange={(e) => setForm({ ...form, asset: e.target.value })} required /></div>
            <div><label className="label">Priority</label>
              <select className="input" value={form.priority || 'Medium'} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option><option value="Critical">Critical</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}><label className="label">Description * (min 10 chars)</label><textarea className="input" rows={3} style={{ resize: 'vertical' }} value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} required minLength={10} /></div>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
            <button type="submit" className="btn btn-primary">Submit</button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {requests.map((r) => (
          <div key={r._id} className="card" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{r.asset?.name} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({r.asset?.assetTag})</span></div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{r.description}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>By: {r.requestedBy?.name} · {new Date(r.createdAt).toLocaleDateString()}</div>
                {r.assignedTechnician && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tech: {r.assignedTechnician}</div>}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
                <span className={`badge ${priorityBadge[r.priority]}`}>{r.priority}</span>
                <span className={`badge ${statusBadge[r.status]}`}>{r.status}</span>
              </div>
            </div>
            {hasRole('Admin', 'AssetManager') && (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                {r.status === 'Pending' && <><button className="btn btn-sm btn-success" onClick={() => handleAction(r._id, 'approve')}>Approve</button><button className="btn btn-sm btn-danger" onClick={() => handleAction(r._id, 'reject')}>Reject</button></>}
                {r.status === 'Approved' && <button className="btn btn-sm btn-primary" onClick={() => handleAction(r._id, 'assign')}>Assign Tech</button>}
                {r.status === 'TechnicianAssigned' && <button className="btn btn-sm btn-primary" onClick={() => handleAction(r._id, 'start')}>Start</button>}
                {['InProgress', 'TechnicianAssigned', 'Approved'].includes(r.status) && <button className="btn btn-sm btn-success" onClick={() => handleAction(r._id, 'resolve')}>Resolve</button>}
              </div>
            )}
          </div>
        ))}
        {requests.length === 0 && <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No maintenance requests</div>}
      </div>
    </div>
  );
};

export default MaintenancePage;
