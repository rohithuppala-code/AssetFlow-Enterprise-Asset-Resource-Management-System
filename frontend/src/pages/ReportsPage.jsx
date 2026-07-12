import { useState, useEffect } from 'react';
import { getReportAssetUtilization, getReportMaintenanceFrequency, getReportDepartmentAllocation, getReportBookingHeatmap, getReportAssetsDue } from '../api/dataApi';

const reportTypes = [
  { key: 'utilization', label: 'Asset Utilization', icon: '📊' },
  { key: 'maintenance', label: 'Maintenance Frequency', icon: '🔧' },
  { key: 'department', label: 'Dept Allocation', icon: '🏢' },
  { key: 'heatmap', label: 'Booking Heatmap', icon: '🔥' },
  { key: 'due', label: 'Assets Due', icon: '⏰' },
];

const ReportsPage = () => {
  const [activeReport, setActiveReport] = useState('utilization');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setData(null);
    try {
      let res;
      switch (activeReport) {
        case 'utilization': res = await getReportAssetUtilization({}); break;
        case 'maintenance': res = await getReportMaintenanceFrequency({}); break;
        case 'department': res = await getReportDepartmentAllocation(); break;
        case 'heatmap': res = await getReportBookingHeatmap({}); break;
        case 'due': res = await getReportAssetsDue(); break;
      }
      setData(res.data.data.data);
    } catch { setData([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [activeReport]);

  const days = ['', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Reports & Analytics</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: '1.5rem' }}>Actionable operational insights</p>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {reportTypes.map((r) => (
          <button key={r.key} onClick={() => setActiveReport(r.key)}
            className={`btn ${activeReport === r.key ? 'btn-primary' : 'btn-secondary'} btn-sm`}>
            {r.icon} {r.label}
          </button>
        ))}
      </div>

      {loading && <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>}

      {!loading && data && (
        <div className="card" style={{ padding: '1.5rem' }}>
          {activeReport === 'utilization' && Array.isArray(data) && (
            <div>
              <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Asset Utilization ({data.length} assets)</h3>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {data.slice(0, 20).map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)', fontSize: '0.875rem' }}>
                    <span>{item.asset?.name} ({item.asset?.assetTag})</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.totalUsage} use(s) — {item.allocationCount} alloc, {item.bookingCount} bookings</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeReport === 'maintenance' && Array.isArray(data) && (
            <div>
              <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Maintenance Frequency</h3>
              {data.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)', fontSize: '0.875rem' }}>
                  <span>{item.asset?.name} ({item.asset?.assetTag})</span>
                  <span style={{ color: 'var(--color-warning)' }}>{item.count} request(s)</span>
                </div>
              ))}
            </div>
          )}

          {activeReport === 'department' && Array.isArray(data) && (
            <div>
              <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Department Allocation Summary</h3>
              {data.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)', fontSize: '0.875rem' }}>
                  <span style={{ fontWeight: 500 }}>{item.department?.name || 'Unassigned'}</span>
                  <span className="badge badge-info">{item.activeAllocations} active allocation(s)</span>
                </div>
              ))}
            </div>
          )}

          {activeReport === 'heatmap' && Array.isArray(data) && (
            <div>
              <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Booking Heatmap</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.5rem' }}>
                {data.map((item, i) => (
                  <div key={i} className="card" style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <div style={{ fontWeight: 600 }}>{days[item._id?.dayOfWeek] || '?'} {item._id?.hour}:00</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: item.count > 3 ? 'var(--color-danger)' : 'var(--color-success)' }}>{item.count}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>bookings</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeReport === 'due' && Array.isArray(data) && (
            <div>
              <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Assets Due for Maintenance</h3>
              {data.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)', fontSize: '0.875rem' }}>
                  <span>{item.name} ({item.assetTag})</span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span className={`badge ${item.condition === 'Damaged' ? 'badge-danger' : item.condition === 'Poor' ? 'badge-warning' : 'badge-info'}`}>{item.condition}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {(!data || (Array.isArray(data) && data.length === 0)) && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No data available for this report</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
