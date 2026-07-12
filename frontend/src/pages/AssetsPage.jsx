import { useEffect, useMemo, useState } from 'react';
import { Boxes, CircleDollarSign, ClipboardList, History, Plus, Warehouse } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createAsset, getAssetHistory, getAssets, getCategories } from '../api/dataApi';
import {
  EmptyState,
  FiltersBar,
  KeyValueList,
  LoadingState,
  MetricCard,
  PageHeader,
  SearchField,
  StatusPill,
  SurfaceCard,
  formatNumber,
} from '../components/ui';

function AssetsPage() {
  const { hasRole } = useAuth();
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [history, setHistory] = useState(null);
  const [form, setForm] = useState({ isBookable: false, condition: 'Good' });
  const [filters, setFilters] = useState({ search: '', status: '', page: 1 });
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await getAssets(filters);
      setAssets(res.data.data.assets);
      setPagination(res.data.data.pagination);
    } catch {
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filters]);

  useEffect(() => {
    getCategories({ limit: 100 })
      .then((res) => setCategories(res.data.data.categories))
      .catch(() => setCategories([]));
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await createAsset(form);
      setShowForm(false);
      setForm({ isBookable: false, condition: 'Good' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register asset');
    }
  };

  const viewHistory = async (asset) => {
    setShowDetail(asset);
    try {
      const res = await getAssetHistory(asset._id);
      setHistory(res.data.data);
    } catch {
      setHistory(null);
    }
  };

  const stats = useMemo(() => {
    const bookableCount = assets.filter((asset) => asset.isBookable).length;
    const allocatedCount = assets.filter((asset) => asset.status === 'Allocated').length;
    const costTracked = assets.reduce((sum, asset) => sum + Number(asset.acquisitionCost || 0), 0);
    return { bookableCount, allocatedCount, costTracked };
  }, [assets]);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Asset registry"
        title="Lifecycle-aware asset directory"
        description="Register inventory, track current holders, and inspect maintenance or allocation history from a unified operational catalog."
        actions={
          hasRole('Admin', 'AssetManager') ? [
            <button key="create" className="button button-primary" onClick={() => { setShowForm((value) => !value); setShowDetail(null); }}>
              <Plus size={18} />
              <span>{showForm ? 'Close form' : 'Register asset'}</span>
            </button>,
          ] : null
        }
      />

      <section className="kpi-grid">
        <MetricCard title="Visible assets" value={formatNumber(pagination.total || assets.length)} icon={Boxes} tone="var(--brand-primary)" index={0} footer="Records currently available in this view" />
        <MetricCard title="Allocated in view" value={formatNumber(stats.allocatedCount)} icon={ClipboardList} tone="var(--info)" index={1} footer="Assets actively assigned to users or departments" />
        <MetricCard title="Bookable resources" value={formatNumber(stats.bookableCount)} icon={Warehouse} tone="var(--success)" index={2} footer="Shared assets available for scheduling" />
        <MetricCard title="Tracked acquisition cost" value={`₹${formatNumber(stats.costTracked)}`} icon={CircleDollarSign} tone="var(--warning)" index={3} footer="Useful for reporting and prioritization" />
      </section>

      <SurfaceCard title="Asset workspace" description="Search, filter, inspect, and register assets without leaving the registry view." index={0}>
        <div className="page-stack">
          <FiltersBar>
            <SearchField
              value={filters.search}
              onChange={(event) => setFilters({ ...filters, search: event.target.value, page: 1 })}
              placeholder="Search by name, tag, or serial number"
              style={{ flex: 1, minWidth: 260 }}
            />
            <select className="select" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value, page: 1 })} style={{ maxWidth: 220 }}>
              <option value="">All statuses</option>
              <option value="Available">Available</option>
              <option value="Allocated">Allocated</option>
              <option value="Reserved">Reserved</option>
              <option value="UnderMaintenance">Under maintenance</option>
              <option value="Lost">Lost</option>
              <option value="Retired">Retired</option>
              <option value="Disposed">Disposed</option>
            </select>
          </FiltersBar>

          {error ? <div className="alert">{error}</div> : null}

          {showForm ? (
            <div style={{ padding: '1.2rem', borderRadius: 22, background: 'rgba(8, 18, 34, 0.54)', border: '1px solid rgba(148, 163, 184, 0.08)' }}>
              <form onSubmit={handleCreate} style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div className="field">
                    <label>Name</label>
                    <input className="input" value={form.name || ''} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
                  </div>
                  <div className="field">
                    <label>Category</label>
                    <select className="select" value={form.category || ''} onChange={(event) => setForm({ ...form, category: event.target.value })} required>
                      <option value="">Select category</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>Serial number</label>
                    <input className="input" value={form.serialNumber || ''} onChange={(event) => setForm({ ...form, serialNumber: event.target.value })} />
                  </div>
                  <div className="field">
                    <label>Location</label>
                    <input className="input" value={form.location || ''} onChange={(event) => setForm({ ...form, location: event.target.value })} placeholder="Building / room" />
                  </div>
                  <div className="field">
                    <label>Condition</label>
                    <select className="select" value={form.condition || 'Good'} onChange={(event) => setForm({ ...form, condition: event.target.value })}>
                      <option value="New">New</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Poor">Poor</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Bookable resource</label>
                    <select className="select" value={form.isBookable ? 'true' : 'false'} onChange={(event) => setForm({ ...form, isBookable: event.target.value === 'true' })}>
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Acquisition cost</label>
                    <input className="input" type="number" min="0" value={form.acquisitionCost || ''} onChange={(event) => setForm({ ...form, acquisitionCost: Number(event.target.value) })} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button type="submit" className="button button-primary">Save asset</button>
                  <button type="button" className="button button-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          ) : null}

          {showDetail ? (
            <div style={{ padding: '1.2rem', borderRadius: 22, background: 'rgba(8, 18, 34, 0.54)', border: '1px solid rgba(148, 163, 184, 0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: 0 }}>{showDetail.name}</h3>
                  <div style={{ color: 'var(--text-secondary)', marginTop: '0.35rem' }}>{showDetail.assetTag}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <StatusPill>{showDetail.status}</StatusPill>
                  <button className="button button-secondary button-sm" onClick={() => setShowDetail(null)}>Close detail</button>
                </div>
              </div>

              <KeyValueList
                items={[
                  { label: 'Category', value: showDetail.category?.name || '--' },
                  { label: 'Current holder', value: showDetail.currentHolder?.name || 'Unassigned' },
                  { label: 'Location', value: showDetail.location || '--' },
                  { label: 'Condition', value: showDetail.condition || '--' },
                  { label: 'Bookable', value: showDetail.isBookable ? 'Yes' : 'No' },
                  { label: 'Maintenance records', value: history?.maintenanceRequests?.length ?? '--' },
                ]}
              />

              <div style={{ marginTop: '1rem', display: 'grid', gap: '0.7rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                  <History size={16} color="var(--text-secondary)" />
                  <strong>History snapshot</strong>
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>
                  {history ? `${history.allocations?.length || 0} allocation records and ${history.maintenanceRequests?.length || 0} maintenance requests captured.` : 'History could not be loaded for this asset.'}
                </div>
              </div>
            </div>
          ) : null}

          {loading ? (
            <LoadingState label="Loading asset registry..." />
          ) : assets.length === 0 ? (
            <EmptyState icon={Boxes} title="No assets match this view" description="Adjust filters or register your first asset to begin tracking lifecycle and allocation activity." />
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Status</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Holder</th>
                    <th>Flags</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => (
                    <tr key={asset._id} className="table-row-clickable" onClick={() => viewHistory(asset)}>
                      <td>
                        <div style={{ fontWeight: 800 }}>{asset.name}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{asset.assetTag} {asset.serialNumber ? `• ${asset.serialNumber}` : ''}</div>
                      </td>
                      <td><StatusPill>{asset.status}</StatusPill></td>
                      <td>{asset.category?.name || '--'}</td>
                      <td>{asset.location || '--'}</td>
                      <td>{asset.currentHolder?.name || 'Available pool'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {asset.isBookable ? <StatusPill tone="pill pill-info">Bookable</StatusPill> : null}
                          <StatusPill>{asset.condition || 'Unknown'}</StatusPill>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pagination.pages > 1 ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Page {pagination.page} of {pagination.pages}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="button button-secondary button-sm" disabled={filters.page <= 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })}>Previous</button>
                <button className="button button-secondary button-sm" disabled={filters.page >= pagination.pages} onClick={() => setFilters({ ...filters, page: filters.page + 1 })}>Next</button>
              </div>
            </div>
          ) : null}
        </div>
      </SurfaceCard>

      <style>{`
        @media (max-width: 1200px) {
          .kpi-grid > * { grid-column: span 3 !important; }
        }
        @media (max-width: 780px) {
          .kpi-grid > * { grid-column: span 2 !important; }
        }
      `}</style>
    </div>
  );
}

export default AssetsPage;
