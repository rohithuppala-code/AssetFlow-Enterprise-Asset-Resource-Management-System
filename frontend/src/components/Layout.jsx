import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUnreadNotificationCount } from '../api/dataApi';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊', roles: null },
  { path: '/assets', label: 'Assets', icon: '📦', roles: null },
  { path: '/allocations', label: 'Allocations', icon: '🔄', roles: null },
  { path: '/bookings', label: 'Bookings', icon: '📅', roles: null },
  { path: '/maintenance', label: 'Maintenance', icon: '🔧', roles: null },
  { path: '/audits', label: 'Audits', icon: '📋', roles: ['Admin', 'AssetManager'] },
  { path: '/org-setup', label: 'Organization', icon: '🏢', roles: ['Admin'] },
  { path: '/reports', label: 'Reports', icon: '📈', roles: ['Admin', 'AssetManager', 'DepartmentHead'] },
  { path: '/notifications', label: 'Notifications', icon: '🔔', roles: null },
  { path: '/activity-logs', label: 'Activity Logs', icon: '📝', roles: ['Admin'] },
];

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    getUnreadNotificationCount()
      .then((res) => setUnreadCount(res.data.data.count))
      .catch(() => {});

    const interval = setInterval(() => {
      getUnreadNotificationCount()
        .then((res) => setUnreadCount(res.data.data.count))
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const filteredItems = navItems.filter((item) => !item.roles || item.roles.includes(user?.role));

  const roleBadge = {
    Admin: 'badge-danger',
    AssetManager: 'badge-info',
    DepartmentHead: 'badge-warning',
    Employee: 'badge-success',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside
        className="glass animate-slideIn"
        style={{
          width: sidebarOpen ? '260px' : '70px',
          transition: 'width 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 50,
          overflow: 'hidden',
        }}
      >
        {/* Logo */}
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '0.5rem',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.125rem', fontWeight: 700, color: 'white', flexShrink: 0,
          }}>
            AF
          </div>
          {sidebarOpen && (
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }} className="gradient-text">AssetFlow</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Enterprise ERP</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0.75rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {filteredItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.625rem 0.75rem', borderRadius: '0.5rem',
                textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500,
                color: isActive ? 'white' : 'var(--text-secondary)',
                background: isActive ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))' : 'transparent',
                borderLeft: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
                transition: 'all 0.2s ease',
                position: 'relative',
              })}
            >
              <span style={{ fontSize: '1.125rem', flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
              {item.label === 'Notifications' && unreadCount > 0 && sidebarOpen && (
                <span style={{
                  marginLeft: 'auto', background: 'var(--color-danger)',
                  color: 'white', borderRadius: '9999px', fontSize: '0.6875rem',
                  padding: '0.125rem 0.5rem', fontWeight: 600, minWidth: '20px', textAlign: 'center',
                }}>{unreadCount}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Toggle & User */}
        <div style={{ borderTop: '1px solid var(--border-color)', padding: '0.75rem' }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              width: '100%', padding: '0.5rem', background: 'none', border: 'none',
              color: 'var(--text-muted)', cursor: 'pointer', borderRadius: '0.5rem',
              fontSize: '0.8125rem', textAlign: 'center',
            }}
          >
            {sidebarOpen ? '◀ Collapse' : '▶'}
          </button>
          {sidebarOpen && user && (
            <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>{user.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{user.email}</div>
              <span className={`badge ${roleBadge[user.role] || 'badge-neutral'}`}>{user.role}</span>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: '0.75rem' }}>
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main
        style={{
          flex: 1,
          marginLeft: sidebarOpen ? '260px' : '70px',
          transition: 'margin-left 0.3s ease',
          padding: '2rem',
          minHeight: '100vh',
        }}
      >
        <div className="animate-fadeIn">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
