import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../api/dataApi';

const kpiConfig = [
  { key: 'assetsAvailable', label: 'Available Assets', icon: '✅', color: 'var(--color-success)' },
  { key: 'assetsAllocated', label: 'Allocated Assets', icon: '📦', color: 'var(--color-info)' },
  { key: 'maintenanceToday', label: 'Maintenance Today', icon: '🔧', color: 'var(--color-warning)' },
  { key: 'activeBookings', label: 'Active Bookings', icon: '📅', color: 'var(--color-accent)' },
  { key: 'pendingTransfers', label: 'Pending Transfers', icon: '🔄', color: '#f472b6' },
  { key: 'upcomingReturns', label: 'Upcoming Returns', icon: '📥', color: '#22d3ee' },
  { key: 'overdueReturns', label: 'Overdue Returns', icon: '⚠️', color: 'var(--color-danger)' },
];

const quickActions = [
  { label: 'Register Asset', icon: '➕', path: '/assets', color: 'var(--color-primary)' },
  { label: 'Book Resource', icon: '📅', path: '/bookings', color: 'var(--color-accent)' },
  { label: 'Raise Maintenance', icon: '🔧', path: '/maintenance', color: 'var(--color-warning)' },
];

const DashboardPage = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getDashboardStats()
      .then((res) => setStats(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>Real-time operational snapshot</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {kpiConfig.map((kpi, i) => (
          <div key={kpi.key} className="card" style={{ padding: '1.25rem', animationDelay: `${i * 0.05}s` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '1.5rem' }}>{kpi.icon}</span>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: kpi.color, boxShadow: `0 0 8px ${kpi.color}` }} />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: kpi.color, marginBottom: '0.25rem' }}>
              {loading ? '—' : (stats[kpi.key] ?? 0)}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Quick Actions</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="card"
              style={{
                padding: '1rem 1.5rem', cursor: 'pointer', border: 'none',
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                background: 'var(--bg-card)', color: 'var(--text-primary)',
                fontSize: '0.875rem', fontWeight: 500, transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = action.color; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
            >
              <span style={{ fontSize: '1.25rem' }}>{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
