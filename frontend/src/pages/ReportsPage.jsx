import { useEffect, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  getReportAssetUtilization,
  getReportAssetsDue,
  getReportBookingHeatmap,
  getReportDepartmentAllocation,
  getReportMaintenanceFrequency,
} from '../api/dataApi';
import { EmptyState, LoadingState, PageHeader, StatusPill, SurfaceCard } from '../components/ui';

const reportTypes = [
  { key: 'utilization', label: 'Asset utilization' },
  { key: 'maintenance', label: 'Maintenance frequency' },
  { key: 'department', label: 'Department allocation' },
  { key: 'heatmap', label: 'Booking heatmap' },
  { key: 'due', label: 'Assets due' },
];

function ReportsPage() {
  const [activeReport, setActiveReport] = useState('utilization');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setData(null);
    try {
      let res;
      switch (activeReport) {
        case 'utilization':
          res = await getReportAssetUtilization({});
          break;
        case 'maintenance':
          res = await getReportMaintenanceFrequency({});
          break;
        case 'department':
          res = await getReportDepartmentAllocation();
          break;
        case 'heatmap':
          res = await getReportBookingHeatmap({});
          break;
        case 'due':
          res = await getReportAssetsDue();
          break;
        default:
          res = await getReportAssetUtilization({});
      }
      setData(res.data.data.data);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [activeReport]);

  const chartStyle = {
    background: 'rgba(8,18,34,0.98)',
    borderRadius: 16,
    border: '1px solid rgba(148,163,184,0.12)',
    color: '#e5eefb',
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Analytics layer"
        title="Operational reports and trends"
        description="Move from raw activity to capacity planning with utilization, maintenance, department, and booking visibility."
      />

      <SurfaceCard title="Report switchboard" description="Choose a report and review its current data output." index={0}>
        <div className="page-stack">
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {reportTypes.map((report) => (
              <button
                key={report.key}
                className={activeReport === report.key ? 'button button-primary button-sm' : 'button button-secondary button-sm'}
                onClick={() => setActiveReport(report.key)}
              >
                {report.label}
              </button>
            ))}
          </div>

          {loading ? <LoadingState label="Loading report..." /> : null}

          {!loading && Array.isArray(data) && data.length === 0 ? (
            <EmptyState title="No report data available" description="The current dataset is empty for this report selection. Once the backend surfaces records, the chart or table will populate automatically." />
          ) : null}

          {!loading && activeReport === 'utilization' && Array.isArray(data) && data.length > 0 ? (
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.slice(0, 10).map((item) => ({ name: item.asset?.assetTag, totalUsage: item.totalUsage }))}>
                    <defs>
                      <linearGradient id="reportUtilization" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.55} />
                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(148, 163, 184, 0.08)" vertical={false} />
                    <XAxis dataKey="name" stroke="#6f84a6" tickLine={false} axisLine={false} />
                    <YAxis stroke="#6f84a6" tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={chartStyle} />
                    <Area type="monotone" dataKey="totalUsage" stroke="#38bdf8" fill="url(#reportUtilization)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Asset</th>
                      <th>Total usage</th>
                      <th>Allocations</th>
                      <th>Bookings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, index) => (
                      <tr key={`${item.asset?.assetTag}-${index}`}>
                        <td>{item.asset?.name} ({item.asset?.assetTag})</td>
                        <td>{item.totalUsage}</td>
                        <td>{item.allocationCount}</td>
                        <td>{item.bookingCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {!loading && activeReport === 'maintenance' && Array.isArray(data) && data.length > 0 ? (
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.slice(0, 10).map((item) => ({ name: item.asset?.assetTag, count: item.count }))}>
                    <CartesianGrid stroke="rgba(148, 163, 184, 0.08)" vertical={false} />
                    <XAxis dataKey="name" stroke="#6f84a6" tickLine={false} axisLine={false} />
                    <YAxis stroke="#6f84a6" tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={chartStyle} />
                    <Bar dataKey="count" fill="#f59e0b" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Asset</th>
                      <th>Requests</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, index) => (
                      <tr key={`${item.asset?.assetTag}-${index}`}>
                        <td>{item.asset?.name} ({item.asset?.assetTag})</td>
                        <td>{item.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {!loading && activeReport === 'department' && Array.isArray(data) && data.length > 0 ? (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Active allocations</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={`${item.department?.name || 'unknown'}-${index}`}>
                      <td>{item.department?.name || 'Unassigned'}</td>
                      <td><StatusPill>{item.activeAllocations} active</StatusPill></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {!loading && activeReport === 'heatmap' && Array.isArray(data) && data.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.85rem' }}>
              {data.map((item, index) => (
                <div key={index} style={{ padding: '1rem', borderRadius: 18, background: 'rgba(8, 18, 34, 0.54)', border: '1px solid rgba(148, 163, 184, 0.08)' }}>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Day {item._id?.dayOfWeek}, {item._id?.hour}:00</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{item.count}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>booking requests</div>
                </div>
              ))}
            </div>
          ) : null}

          {!loading && activeReport === 'due' && Array.isArray(data) && data.length > 0 ? (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Condition</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={`${item.assetTag}-${index}`}>
                      <td>{item.name} ({item.assetTag})</td>
                      <td><StatusPill>{item.condition}</StatusPill></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </SurfaceCard>
    </div>
  );
}

export default ReportsPage;
