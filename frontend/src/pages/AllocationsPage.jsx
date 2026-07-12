import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllocations, createAllocation, returnAsset, getOverdueAllocations, getAssets, getUsers, getTransfers, createTransfer, approveTransfer, rejectTransfer } from '../api/dataApi';

const AllocationsPage = () => {
  const { hasRole } = useAuth();
  const [tab, setTab] = useState(0);
  const [allocations, setAllocations] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [returnForm, setReturnForm] = useState(null);

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
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, [tab]);

  const handleAllocate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createAllocation(form);
      setShowForm(false);
      setForm({});
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    }
  };

  const handleReturn = async (e) => {
    e.preventDefault();
    try {
      await returnAsset(returnForm.id, { returnCondition: returnForm.condition, returnNotes: returnForm.notes });
      setReturnForm(null);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const handleApproveTransfer = async (id) => {
    try { await approveTransfer(id); load(); } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const handleRejectTransfer = async (id) => {
    const reason = prompt('Rejection reason:');
    if (reason) {
      try { await rejectTransfer(id, { rejectionReason: reason }); load(); } catch (err) { alert(err.response?.data?.message || 'Failed'); }
    }
  };

  const statusBadge = { Active: 'badge-success', Returned: 'badge-neutral', Overdue: 'badge-danger', Transferred: 'badge-info', Requested: 'badge-warning', Approved: 'badge-info', Rejected: 'badge-danger', Completed: 'badge-success' };

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Allocations & Transfers</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: '1.5rem' }}>Manage asset assignments and transfer requests</p>

      <div style={{ display: 'flex', gap: '0.25rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
        {['Allocations', 'Transfers'].map((t, i) => (
          <button key={t} onClick={() => setTab(i)} style={{ padding: '0.75rem 1.25rem', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, background: 'none', color: tab === i ? 'var(--color-primary)' : 'var(--text-secondary)', borderBottom: tab === i ? '2px solid var(--color-primary)' : '2px solid transparent' }}>{t}</button>
        ))}
      </div>

      {error && <div style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.1)', borderRadius: '0.5rem', color: '#f87171', fontSize: '0.8125rem', marginBottom: '1rem' }}>{error}</div>}

      {tab === 0 && (
        <div>
          {hasRole('Admin', 'AssetManager', 'DepartmentHead') && (
            <div style={{ marginBottom: '1rem' }}>
              <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>+ Allocate Asset</button>
            </div>
          )}
          {showForm && (
            <form onSubmit={handleAllocate} className="card" style={{ padding: '1.25rem', marginBottom: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div><label className="label">Asset ID *</label><input className="input" placeholder="Asset ObjectId" value={form.asset || ''} onChange={(e) => setForm({ ...form, asset: e.target.value })} required /></div>
              <div><label className="label">User ID *</label><input className="input" placeholder="User ObjectId" value={form.allocatedTo || ''} onChange={(e) => setForm({ ...form, allocatedTo: e.target.value })} required /></div>
              <div><label className="label">Return Date</label><input className="input" type="date" value={form.expectedReturnDate || ''} onChange={(e) => setForm({ ...form, expectedReturnDate: e.target.value })} /></div>
              <button type="submit" className="btn btn-primary btn-sm">Allocate</button>
            </form>
          )}
          {returnForm && (
            <form onSubmit={handleReturn} className="card" style={{ padding: '1.25rem', marginBottom: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div><label className="label">Return Condition *</label>
                <select className="input" value={returnForm.condition || ''} onChange={(e) => setReturnForm({ ...returnForm, condition: e.target.value })} required>
                  <option value="">Select...</option><option value="Good">Good</option><option value="Fair">Fair</option><option value="Poor">Poor</option><option value="Damaged">Damaged</option>
                </select>
              </div>
              <div><label className="label">Notes</label><input className="input" value={returnForm.notes || ''} onChange={(e) => setReturnForm({ ...returnForm, notes: e.target.value })} /></div>
              <button type="submit" className="btn btn-success btn-sm">Process Return</button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setReturnForm(null)}>Cancel</button>
            </form>
          )}
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {allocations.map((a) => (
              <div key={a._id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{a.asset?.name} ({a.asset?.assetTag})</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>To: {a.allocatedTo?.name} · By: {a.allocatedBy?.name}</div>
                  {a.expectedReturnDate && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Return by: {new Date(a.expectedReturnDate).toLocaleDateString()}</div>}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span className={`badge ${statusBadge[a.status]}`}>{a.status}</span>
                  {a.status === 'Active' && hasRole('Admin', 'AssetManager') && (
                    <button className="btn btn-sm btn-secondary" onClick={() => setReturnForm({ id: a._id, condition: '', notes: '' })}>Return</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 1 && (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {transfers.map((t) => (
            <div key={t._id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{t.asset?.name} ({t.asset?.assetTag})</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Requested by: {t.requestedBy?.name} · Current: {t.currentHolder?.name}</div>
                {t.reason && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reason: {t.reason}</div>}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span className={`badge ${statusBadge[t.status]}`}>{t.status}</span>
                {t.status === 'Requested' && hasRole('Admin', 'AssetManager', 'DepartmentHead') && (
                  <>
                    <button className="btn btn-sm btn-success" onClick={() => handleApproveTransfer(t._id)}>Approve</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleRejectTransfer(t._id)}>Reject</button>
                  </>
                )}
              </div>
            </div>
          ))}
          {transfers.length === 0 && <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No transfer requests</div>}
        </div>
      )}
    </div>
  );
};

export default AllocationsPage;
