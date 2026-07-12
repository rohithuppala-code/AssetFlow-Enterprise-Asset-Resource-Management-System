import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAssets, createAsset, getCategories, getAssetHistory } from '../api/dataApi';

const statusBadge = { Available: 'badge-success', Allocated: 'badge-info', Reserved: 'badge-warning', UnderMaintenance: 'badge-warning', Lost: 'badge-danger', Retired: 'badge-neutral', Disposed: 'badge-neutral' };

const AssetsPage = () => {
  const { hasRole } = useAuth();
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [history, setHistory] = useState(null);
  const [form, setForm] = useState({});
  const [filters, setFilters] = useState({ search: '', status: '', page: 1 });
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await getAssets(filters);
      setAssets(res.data.data.assets);
      setPagination(res.data.data.pagination);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, [filters]);
  useEffect(() => {
    getCategories({ limit: 100 }).then((res) => setCategories(res.data.data.categories)).catch(() => {});
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createAsset(form);
      setShowForm(false);
      setForm({});
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    }
  };

  const viewHistory = async (asset) => {
    setShowDetail(asset);
    try {
      const res = await getAssetHistory(asset._id);
      setHistory(res.data.data);
    } catch { setHistory(null); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Asset Directory</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>Register and track assets</p>
        </div>
        {hasRole('Admin', 'AssetManager') && (
          <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setShowDetail(null); }}>+ Register Asset</button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <input className="input" style={{ maxWidth: '300px' }} placeholder="Search by name, tag, serial..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })} />
        <select className="input" style={{ maxWidth: '180px' }} value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}>
          <option value="">All Statuses</option>
          <option value="Available">Available</option>
          <option value="Allocated">Allocated</option>
          <option value="Reserved">Reserved</option>
          <option value="UnderMaintenance">Under Maintenance</option>
          <option value="Lost">Lost</option>
          <option value="Retired">Retired</option>
        </select>
      </div>

      {error && <div style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.1)', borderRadius: '0.5rem', color: '#f87171', fontSize: '0.8125rem', marginBottom: '1rem' }}>{error}</div>}

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>Register New Asset</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            <div><label className="label">Name *</label><input className="input" placeholder="Asset Name" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div><label className="label">Category *</label>
              <select className="input" value={form.category || ''} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
                <option value="">Select...</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div><label className="label">Serial Number</label><input className="input" placeholder="Optional" value={form.serialNumber || ''} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} /></div>
            <div><label className="label">Location</label><input className="input" placeholder="Building/Room" value={form.location || ''} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
            <div><label className="label">Condition</label>
              <select className="input" value={form.condition || 'Good'} onChange={(e) => setForm({ ...form, condition: e.target.value })}>
                <option value="New">New</option><option value="Good">Good</option><option value="Fair">Fair</option><option value="Poor">Poor</option>
              </select>
            </div>
            <div><label className="label">Bookable?</label>
              <select className="input" value={form.isBookable ? 'true' : 'false'} onChange={(e) => setForm({ ...form, isBookable: e.target.value === 'true' })}>
                <option value="false">No</option><option value="true">Yes (Shared Resource)</option>
              </select>
            </div>
            <div><label className="label">Acquisition Cost</label><input className="input" type="number" min="0" placeholder="0" value={form.acquisitionCost || ''} onChange={(e) => setForm({ ...form, acquisitionCost: Number(e.target.value) })} /></div>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
            <button type="submit" className="btn btn-primary">Register</button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {/* Detail Panel */}
      {showDetail && (
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 600 }}>{showDetail.name} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({showDetail.assetTag})</span></h3>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowDetail(null)}>✕ Close</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
            <div><span style={{ color: 'var(--text-secondary)' }}>Status:</span> <span className={`badge ${statusBadge[showDetail.status] || 'badge-neutral'}`}>{showDetail.status}</span></div>
            <div><span style={{ color: 'var(--text-secondary)' }}>Category:</span> {showDetail.category?.name}</div>
            <div><span style={{ color: 'var(--text-secondary)' }}>Location:</span> {showDetail.location || '—'}</div>
            <div><span style={{ color: 'var(--text-secondary)' }}>Condition:</span> {showDetail.condition}</div>
            <div><span style={{ color: 'var(--text-secondary)' }}>Holder:</span> {showDetail.currentHolder?.name || 'None'}</div>
            <div><span style={{ color: 'var(--text-secondary)' }}>Bookable:</span> {showDetail.isBookable ? 'Yes' : 'No'}</div>
          </div>
          {history && (
            <div>
              <h4 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>History</h4>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <div>{history.allocations?.length || 0} allocation(s), {history.maintenanceRequests?.length || 0} maintenance request(s)</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Asset List */}
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {assets.map((asset) => (
          <div key={asset._id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => viewHistory(asset)}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '0.5rem', background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>📦</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{asset.name}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{asset.assetTag} · {asset.category?.name} · {asset.location || 'No location'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {asset.currentHolder && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{asset.currentHolder.name}</span>}
              <span className={`badge ${statusBadge[asset.status] || 'badge-neutral'}`}>{asset.status}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
          <button className="btn btn-secondary btn-sm" disabled={filters.page <= 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })}>← Prev</button>
          <span style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Page {pagination.page} of {pagination.pages}</span>
          <button className="btn btn-secondary btn-sm" disabled={filters.page >= pagination.pages} onClick={() => setFilters({ ...filters, page: filters.page + 1 })}>Next →</button>
        </div>
      )}
    </div>
  );
};

export default AssetsPage;
