import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowRightLeft,
  Box,
  CalendarRange,
  CheckCircle2,
  ClockAlert,
  ClipboardCheck,
  Wrench,
} from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../api/dataApi';
import {
  EmptyState,
  MetricCard,
  MiniStat,
  PageHeader,
  SurfaceCard,
  formatNumber,
  quickStat,
} from '../components/ui';

const kpiConfig = [
  { key: 'assetsAvailable', label: 'Assets Available', icon: CheckCircle2, tone: 'var(--success)', footer: 'Ready for allocation or booking' },
  { key: 'assetsAllocated', label: 'Assets Allocated', icon: Box, tone: 'var(--info)', footer: 'Currently assigned across departments' },
  { key: 'maintenanceToday', label: 'Maintenance Today', icon: Wrench, tone: 'var(--warning)', footer: 'Requests requiring attention' },
  { key: 'activeBookings', label: 'Active Bookings', icon: CalendarRange, tone: 'var(--brand-accent)', footer: 'Shared resources in active use' },
  { key: 'pendingTransfers', label: 'Pending Transfers', icon: ArrowRightLeft, tone: '#f472b6', footer: 'Transfer decisions waiting approval' },
  { key: 'upcomingReturns', label: 'Upcoming Returns', icon: Activity, tone: '#22d3ee', footer: 'Assets due back soon' },
];

const defaultTrendData = [
  { name: 'Mon', allocations: 0, bookings: 0 },
  { name: 'Tue', allocations: 0, bookings: 0 },
  { name: 'Wed', allocations: 0, bookings: 0 },
  { name: 'Thu', allocations: 0, bookings: 0 },
  { name: 'Fri', allocations: 0, bookings: 0 },
  { name: 'Sat', allocations: 0, bookings: 0 },
  { name: 'Sun', allocations: 0, bookings: 0 },
];

const quickActions = [
  { label: 'Register asset', description: 'Add equipment, furniture, or vehicles to the central registry.', path: '/assets' },
  { label: 'Allocate resource', description: 'Assign available inventory and manage return commitments.', path: '/allocations' },
  { label: 'Book shared asset', description: 'Reserve rooms, vehicles, or bookable equipment without overlaps.', path: '/bookings' },
  { label: 'Raise maintenance', description: 'Move repair issues into the approval workflow.', path: '/maintenance' },
];

function DashboardPage() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getDashboardStats()
      .then((res) => setStats(res.data.data))
      .catch(() => setStats({}))
      .finally(() => setLoading(false));
  }, []);

  const chartData = stats.trendData || defaultTrendData;

  const overviewStats = useMemo(
    () => [
      quickStat('Overdue returns', formatNumber(stats.overdueReturns), 'Requires follow-up with current holders'),
      quickStat('Transfer queue', formatNumber(stats.pendingTransfers), 'Pending approval or reassignment'),
      quickStat('Booking load', `${formatNumber(stats.activeBookings)} active`, 'Current shared resource demand'),
      quickStat('Maintenance pressure', `${formatNumber(stats.maintenanceToday)} today`, 'Requests to triage this shift'),
    ],
    [stats],
  );

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Executive command center"
        title="Enterprise asset operations"
        description="Monitor allocation pressure, booking demand, maintenance flow, and return risk from one live operational overview."
      />

      <section className="kpi-grid">
        {kpiConfig.map((item, index) => (
          <MetricCard
            key={item.key}
            title={item.label}
            value={loading ? '--' : formatNumber(stats[item.key])}
            icon={item.icon}
            tone={item.tone}
            index={index}
            footer={item.footer}
          />
        ))}
      </section>

      <div className="dashboard-split dashboard-split-primary" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1rem' }}>
        <SurfaceCard title="Utilization trend" description="Real-time weekly asset movement combining allocation and booking activity." index={0}>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="allocationsFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.55} />
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="bookingsFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(148, 163, 184, 0.08)" vertical={false} />
                <XAxis dataKey="name" stroke="#6f84a6" tickLine={false} axisLine={false} />
                <YAxis stroke="#6f84a6" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid rgba(148,163,184,0.12)', background: 'rgba(8,18,34,0.96)', color: '#e5eefb' }} />
                <Area type="monotone" dataKey="allocations" stroke="#60a5fa" fill="url(#allocationsFill)" strokeWidth={3} />
                <Area type="monotone" dataKey="bookings" stroke="#818cf8" fill="url(#bookingsFill)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SurfaceCard>

        <SurfaceCard title="Operational watchlist" description="Where teams usually need action first." index={1}>
          <div style={{ display: 'grid', gap: '0.85rem' }}>
            {overviewStats.map((item) => (
              <MiniStat key={item.label} label={item.label} value={item.value} detail={item.detail} icon={ClockAlert} />
            ))}
          </div>
        </SurfaceCard>
      </div>

      <div className="dashboard-split dashboard-split-secondary" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <SurfaceCard title="Quick actions" description="Jump directly into the highest-frequency ERP workflows." index={0}>
          <div style={{ display: 'grid', gap: '0.85rem' }}>
            {quickActions.map((action) => (
              <button
                key={action.label}
                className="button button-secondary"
                style={{ justifyContent: 'space-between', padding: '1rem 1.05rem', minHeight: 74 }}
                onClick={() => navigate(action.path)}
              >
                <span style={{ textAlign: 'left' }}>
                  <strong style={{ display: 'block', marginBottom: '0.25rem' }}>{action.label}</strong>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{action.description}</span>
                </span>
                <ArrowRightLeft size={18} />
              </button>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard title="Workflow priorities" description="Translate KPI movement into operating posture." index={1}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ padding: '1rem', borderRadius: 18, background: 'rgba(52, 211, 153, 0.08)', border: '1px solid rgba(52, 211, 153, 0.18)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.45rem' }}>
                <CheckCircle2 size={18} color="var(--success)" />
                <strong>Healthy inventory pool</strong>
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>Available assets remain clearly visible, making reallocation and booking decisions faster.</div>
            </div>
            <div style={{ padding: '1rem', borderRadius: 18, background: 'rgba(251, 191, 36, 0.08)', border: '1px solid rgba(251, 191, 36, 0.18)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.45rem' }}>
                <Wrench size={18} color="var(--warning)" />
                <strong>Maintenance gating matters</strong>
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>Keep approval and technician assignment moving so blocked assets return to service quickly.</div>
            </div>
            <div style={{ padding: '1rem', borderRadius: 18, background: 'rgba(96, 165, 250, 0.08)', border: '1px solid rgba(96, 165, 250, 0.18)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.45rem' }}>
                <ClipboardCheck size={18} color="var(--brand-primary)" />
                <strong>Audit readiness</strong>
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>Use the audit module to verify high-movement assets and close discrepancy loops with evidence.</div>
            </div>
          </div>
        </SurfaceCard>
      </div>

      {!loading && Object.keys(stats).length === 0 ? (
        <EmptyState title="Dashboard data is not available yet" description="Once backend metrics are reachable, the executive snapshot will populate automatically without further frontend changes." />
      ) : null}

      <style>{`
        @media (max-width: 1200px) {
          .kpi-grid > * { grid-column: span 4 !important; }
        }
        @media (max-width: 920px) {
          .dashboard-split {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 720px) {
          .kpi-grid > * { grid-column: span 2 !important; }
        }
      `}</style>
    </div>
  );
}

export default DashboardPage;
