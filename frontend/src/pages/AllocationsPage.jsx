import { useEffect, useMemo, useState } from 'react';
import { ArrowRightLeft, PackageCheck, RefreshCcw, Undo2 } from 'lucide-react';
import {
  approveTransfer,
  createAllocation,
  getAllocations,
  getTransfers,
  rejectTransfer,
  returnAsset,
  getAssets,
  getUsers,
} from '../api/dataApi';
import { useAuth } from '../context/AuthContext';
import {
  EmptyState,
  LoadingState,
  MetricCard,
  PageHeader,
  StatusPill,
  SurfaceCard,
  formatDate,
} from '../components/ui';

const tabs = ['Allocations', 'Transfers'];

function AllocationsPage() {
  const { hasRole } = useAuth();
  const [tab, setTab] = useState(0);
  const [allocations, setAllocations] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [returnForm, setReturnForm] = useState(null);
  const [assetsList, setAssetsList] = useState([]);
  const [usersList, setUsersList] = useState([]);

  useEffect(() => {
    if (showForm) {
      getAssets({ status: 'Available', isBookable: 'false', limit: 100 })
        .then((res) => setAssetsList(res.data.data.assets || []))
        .catch(() => setAssetsList([]));

      getUsers({ limit: 100 })
        .then((res) => setUsersList(res.data.data.users || []))
        .catch(() => setUsersList([]));
    }
  }, [showForm]);

  const load = async () => {
    setLoading(true);
    try {
      if (tab === 0) {
        const res = await getAllocations({ limit: 50 });
        setAllocations(res.data.data.allocations);
      } else {
        const res = await getTransfers({ limit: 50 });
        setTransfers(res.data.data.transfers);
      }
    } catch {
      setAllocations([]);
      setTransfers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [tab]);

  const handleAllocate = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await createAllocation(form);
      setShowForm(false);
      setForm({});
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to allocate asset');
    }
  };

  const handleReturn = async (event) => {
    event.preventDefault();
    try {
      await returnAsset(returnForm.id, { returnCondition: returnForm.condition, returnNotes: returnForm.notes });
      setReturnForm(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process return');
    }
  };

  const handleApproveTransfer = async (id) => {
    try {
      await approveTransfer(id);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve transfer');
    }
  };

  const handleRejectTransfer = async (id) => {
    const reason = prompt('Rejection reason:');
    if (!reason) return;
    try {
      await rejectTransfer(id, { rejectionReason: reason });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject transfer');
    }
  };

  const stats = useMemo(() => ({
    active: allocations.filter((item) => item.status === 'Active').length,
    overdue: allocations.filter((item) => item.status === 'Overdue').length,
    requested: transfers.filter((item) => item.status === 'Requested').length,
  }), [allocations, transfers]);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Allocation operations"
        title="Assignment, return, and transfer control"
        description="Keep ownership history clean, prevent double-allocation, and move requests through approval without losing context."
        actions={
          hasRole('Admin', 'AssetManager') ? [
            <button key="allocate" className="button button-primary" onClick={() => setShowForm((value) => !value)}>
              <PackageCheck size={18} />
              <span>{showForm ? 'Close allocation form' : 'Allocate asset'}</span>
            </button>,
          ] : null
        }
      />

      <section className="kpi-grid">
        <MetricCard title="Active allocations" value={stats.active} icon={PackageCheck} tone="var(--brand-primary)" index={0} footer="Assets currently checked out" />
        <MetricCard title="Overdue returns" value={stats.overdue} icon={Undo2} tone="var(--danger)" index={1} footer="Assignments past expected return date" />
        <MetricCard title="Transfer queue" value={stats.requested} icon={ArrowRightLeft} tone="var(--warning)" index={2} footer="Requests awaiting approval" />
      </section>

  <SurfaceCard title="Workflow board" description="Switch between live allocations and transfer requests." index={0}>
    <div className="page-stack">
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {tabs.map((label, index) => (
          <button
            key={label}
            className={tab === index ? 'button button-primary button-sm' : 'button button-secondary button-sm'}
            onClick={() => setTab(index)}
          >
            {label}
          </button>
        ))}
      </div>

      {error ? <div className="alert">{error}</div> : null}

      {showForm && tab === 0 ? (
        <form onSubmit={handleAllocate} style={{ display: 'grid', gap: '1rem', padding: '1.2rem', borderRadius: 22, background: 'rgba(8, 18, 34, 0.54)', border: '1px solid rgba(148, 163, 184, 0.08)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="field">
              <label>Asset</label>
              <select className="select" value={form.asset || ''} onChange={(event) => setForm({ ...form, asset: event.target.value })} required>
                <option value="">Select available asset...</option>
                {assetsList.map((asset) => (
                  <option key={asset._id} value={asset._id}>
                    {asset.name} ({asset.assetTag})
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Assign to employee</label>
              <select className="select" value={form.allocatedTo || ''} onChange={(event) => setForm({ ...form, allocatedTo: event.target.value })} required>
                <option value="">Select employee...</option>
                {usersList.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Expected return date</label>
              <input className="input" type="date" value={form.expectedReturnDate || ''} onChange={(event) => setForm({ ...form, expectedReturnDate: event.target.value })} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button type="submit" className="button button-primary">Confirm allocation</button>
            <button type="button" className="button button-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      ) : null}

{
  returnForm ? (
    <form onSubmit={handleReturn} style={{ display: 'grid', gap: '1rem', padding: '1.2rem', borderRadius: 22, background: 'rgba(8, 18, 34, 0.54)', border: '1px solid rgba(148, 163, 184, 0.08)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="field">
          <label>Return condition</label>
          <select className="select" value={returnForm.condition || ''} onChange={(event) => setReturnForm({ ...returnForm, condition: event.target.value })} required>
            <option value="">Select condition</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Poor">Poor</option>
            <option value="Damaged">Damaged</option>
          </select>
        </div>
        <div className="field">
          <label>Check-in notes</label>
          <input className="input" value={returnForm.notes || ''} onChange={(event) => setReturnForm({ ...returnForm, notes: event.target.value })} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button type="submit" className="button button-success">Process return</button>
        <button type="button" className="button button-secondary" onClick={() => setReturnForm(null)}>Cancel</button>
      </div>
    </form>
  ) : null
}

{
  loading ? (
    <LoadingState label="Loading allocation workflow..." />
  ) : tab === 0 ? (
    allocations.length === 0 ? (
      <EmptyState icon={PackageCheck} title="No allocations yet" description="Assigned assets will appear here with return commitments and current holders." />
    ) : (
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Asset</th>
              <th>Assigned to</th>
              <th>Assigned by</th>
              <th>Return target</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {allocations.map((allocation) => (
              <tr key={allocation._id}>
                <td>
                  <div style={{ fontWeight: 800 }}>{allocation.asset?.name}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{allocation.asset?.assetTag}</div>
                </td>
                <td>{allocation.allocatedTo?.name || '--'}</td>
                <td>{allocation.allocatedBy?.name || '--'}</td>
                <td>{formatDate(allocation.expectedReturnDate)}</td>
                <td><StatusPill>{allocation.status}</StatusPill></td>
                <td>
                  {allocation.status === 'Active' && hasRole('Admin', 'AssetManager') ? (
                    <button className="button button-secondary button-sm" onClick={() => setReturnForm({ id: allocation._id, condition: '', notes: '' })}>
                      <RefreshCcw size={14} />
                      <span>Return</span>
                    </button>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No action</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  ) : transfers.length === 0 ? (
    <EmptyState icon={ArrowRightLeft} title="No transfer requests" description="Requests created to resolve allocation conflicts will appear here for approval or rejection." />
  ) : (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Asset</th>
            <th>Requested by</th>
            <th>Current holder</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Decision</th>
          </tr>
        </thead>
        <tbody>
          {transfers.map((transfer) => (
            <tr key={transfer._id}>
              <td>
                <div style={{ fontWeight: 800 }}>{transfer.asset?.name}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{transfer.asset?.assetTag}</div>
              </td>
              <td>{transfer.requestedBy?.name || '--'}</td>
              <td>{transfer.currentHolder?.name || '--'}</td>
              <td style={{ maxWidth: 260, color: 'var(--text-secondary)' }}>{transfer.reason || 'No reason provided'}</td>
              <td><StatusPill>{transfer.status}</StatusPill></td>
              <td>
                {transfer.status === 'Requested' && hasRole('Admin', 'AssetManager') ? (
                  <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <button className="button button-success button-sm" onClick={() => handleApproveTransfer(transfer._id)}>Approve</button>
                    <button className="button button-danger button-sm" onClick={() => handleRejectTransfer(transfer._id)}>Reject</button>
                  </div>
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Already processed</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
        </div >
      </SurfaceCard >

  <style>{`
        @media (max-width: 1200px) {
          .kpi-grid > * { grid-column: span 4 !important; }
        }
        @media (max-width: 780px) {
          .kpi-grid > * { grid-column: span 2 !important; }
        }
      `}</style>
    </div >
  );
}

export default AllocationsPage;
