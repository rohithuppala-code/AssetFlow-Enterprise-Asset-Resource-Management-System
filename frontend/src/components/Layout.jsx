import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  BookMarked,
  Boxes,
  Building2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings2,
  ShieldCheck,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { getUnreadNotificationCount } from '../api/dataApi';
import { useAuth } from '../context/AuthContext';
import { Breadcrumbs, StatusPill } from './ui';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: null, caption: 'Operational overview' },
  { path: '/assets', label: 'Assets', icon: Boxes, roles: null, caption: 'Lifecycle registry' },
  { path: '/allocations', label: 'Allocations', icon: Sparkles, roles: null, caption: 'Ownership and transfer' },
  { path: '/bookings', label: 'Bookings', icon: BookMarked, roles: null, caption: 'Shared resource calendar' },
  { path: '/maintenance', label: 'Maintenance', icon: Wrench, roles: null, caption: 'Repair workflows' },
  { path: '/audits', label: 'Audits', icon: ClipboardCheck, roles: ['Admin', 'AssetManager'], caption: 'Verification cycles' },
  { path: '/org-setup', label: 'Organization', icon: Settings2, roles: ['Admin'], caption: 'Departments and roles' },
  { path: '/reports', label: 'Reports', icon: ClipboardList, roles: ['Admin', 'AssetManager'], caption: 'Analytics and exports' },
  { path: '/notifications', label: 'Notifications', icon: Bell, roles: null, caption: 'Alerts and reminders' },
  { path: '/activity-logs', label: 'Activity Logs', icon: ShieldCheck, roles: ['Admin'], caption: 'Audit trail' },
];

const roleLabels = {
  Admin: 'Platform Admin',
  AssetManager: 'Asset Manager',
  Employee: 'Employee',
};

function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadCount = () => {
      getUnreadNotificationCount()
        .then((res) => setUnreadCount(res.data.data.count))
        .catch(() => {});
    };

    loadCount();
    const intervalId = setInterval(loadCount, 30000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const filteredItems = navItems.filter((item) => !item.roles || item.roles.includes(user?.role));
  const shellWidth = collapsed ? 92 : 308;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const renderSidebar = () => (
    <motion.aside
      className="glass-panel"
      animate={{ width: collapsed ? 92 : 308 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 2rem)',
        margin: '1rem',
        padding: '1rem',
        borderRadius: 32,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at top, rgba(96, 165, 250, 0.12), transparent 34%)', pointerEvents: 'none' }} />
      <div style={{ display: 'flex', flexDirection: collapsed ? 'column' : 'row', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', gap: '0.75rem', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', minWidth: 0, justifyContent: collapsed ? 'center' : 'flex-start' }}>
          <div style={{ width: 52, height: 52, borderRadius: 18, background: 'linear-gradient(135deg, #2563eb, #38bdf8 55%, #818cf8)', display: 'grid', placeItems: 'center', color: 'white', fontWeight: 800, fontFamily: 'var(--font-display)', flexShrink: 0 }}>AF</div>
          {!collapsed && (
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.18rem' }}>AssetFlow</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Enterprise asset command center</div>
            </div>
          )}
        </div>
        <button className="button button-ghost button-sm" onClick={() => setCollapsed((value) => !value)} aria-label="Toggle sidebar" style={{ marginTop: collapsed ? '0.5rem' : 0 }}>
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <div style={{ marginTop: '1.25rem', position: 'relative', zIndex: 1 }}>
        {!collapsed && (
          <div style={{ padding: '1rem', borderRadius: 22, background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.18), rgba(56, 189, 248, 0.08))', border: '1px solid rgba(96, 165, 250, 0.18)' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginBottom: '0.45rem' }}>Current role</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 800 }}>{roleLabels[user?.role] || user?.role}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{user?.department?.name || 'Unassigned Workspace'}</div>
              </div>
              <StatusPill>{user?.role}</StatusPill>
            </div>
          </div>
        )}
      </div>

      <nav style={{ display: 'grid', gap: '0.45rem', marginTop: '1.1rem', flex: 1, overflowY: 'auto', position: 'relative', zIndex: 1 }}>
        {filteredItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: collapsed ? '0' : '0.9rem',
                padding: collapsed ? '0.6rem' : '0.9rem 1rem',
                borderRadius: 18,
                textDecoration: 'none',
                border: isActive ? '1px solid rgba(96, 165, 250, 0.22)' : '1px solid transparent',
                background: isActive ? 'linear-gradient(135deg, rgba(37, 99, 235, 0.16), rgba(56, 189, 248, 0.08))' : 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                transition: 'padding 0.25s ease, gap 0.25s ease, justify-content 0.25s ease',
              })}
            >
              <div style={{ width: 38, height: 38, borderRadius: 14, display: 'grid', placeItems: 'center', background: 'rgba(148, 163, 184, 0.08)', flexShrink: 0 }}>
                <Icon size={18} />
              </div>
              {!collapsed && (
                <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', width: '100%' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700 }}>{item.label}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.76rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.caption}</div>
                  </div>
                  {item.path === '/notifications' && unreadCount > 0 ? (
                    <span className="pill pill-info">{unreadCount}</span>
                  ) : null}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(148, 163, 184, 0.1)', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', flexDirection: collapsed ? 'column' : 'row', gap: '0.85rem', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 46, height: 46, borderRadius: 16, background: 'rgba(148, 163, 184, 0.12)', display: 'grid', placeItems: 'center', fontWeight: 800, flexShrink: 0 }}>
            {(user?.name || 'U').slice(0, 1).toUpperCase()}
          </div>
          {!collapsed && (
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
            </div>
          )}
          {collapsed ? (
            <button className="button button-secondary button-sm" onClick={handleLogout} style={{ padding: '0.65rem', width: 46, height: 46, display: 'grid', placeItems: 'center', borderRadius: 16 }} title="Logout">
              <LogOut size={16} />
            </button>
          ) : (
            <button className="button button-secondary button-sm" onClick={handleLogout}>
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );

  return (
    <div className="app-shell">
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <div style={{ minWidth: shellWidth }} className="desktop-sidebar" />
        <div style={{ position: 'fixed', inset: 0, width: shellWidth + 32 }} className="desktop-sidebar">
          {renderSidebar()}
        </div>

        <AnimatePresence>
          {mobileOpen ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(2, 6, 23, 0.72)', zIndex: 35 }}
              onClick={() => setMobileOpen(false)}
            >
              <motion.div
                initial={{ x: -24, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -24, opacity: 0 }}
                transition={{ duration: 0.22 }}
                style={{ width: 'min(92vw, 340px)', height: '100%', background: 'transparent' }}
                onClick={(event) => event.stopPropagation()}
              >
                {renderSidebar()}
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <main style={{ flex: 1, minWidth: 0, padding: '1rem' }}>
          <div className="page-container">
            <div className="topbar-blur glass-panel" style={{ borderRadius: 28, padding: '1rem 1.2rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
                  <button className="button button-secondary button-sm mobile-only" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
                    <Menu size={16} />
                  </button>
                  <Breadcrumbs />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div 
                    onClick={() => navigate('/notifications')}
                    style={{ padding: '0.65rem 0.85rem', borderRadius: 16, background: 'rgba(148, 163, 184, 0.08)', color: 'var(--text-secondary)', fontSize: '0.82rem', cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(148, 163, 184, 0.14)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(148, 163, 184, 0.08)' }}
                  >
                    <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{unreadCount}</span> unread alerts
                  </div>
                </div>
              </div>
            </div>
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
              {children}
            </motion.div>
          </div>
        </main>
      </div>
      <style>{`
        .desktop-sidebar { display: block; }
        .mobile-only { display: none; }
        @media (max-width: 1080px) {
          .desktop-sidebar { display: none !important; }
          .mobile-only { display: inline-flex; }
        }
      `}</style>
    </div>
  );
}

export default Layout;
