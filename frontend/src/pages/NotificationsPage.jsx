import { useState, useEffect } from 'react';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../api/dataApi';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (filter) params.isRead = filter;
      const res = await getNotifications(params);
      setNotifications(res.data.data.notifications);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  const handleMarkRead = async (id) => {
    try { await markNotificationRead(id); load(); } catch { /* ignore */ }
  };

  const handleMarkAllRead = async () => {
    try { await markAllNotificationsRead(); load(); } catch { /* ignore */ }
  };

  const typeIcon = {
    AssetAssigned: '📦', MaintenanceApproved: '✅', MaintenanceRejected: '❌',
    BookingConfirmed: '📅', BookingCancelled: '🚫', BookingReminder: '⏰',
    TransferApproved: '🔄', TransferRejected: '❌', OverdueReturnAlert: '⚠️',
    AuditDiscrepancy: '📋', RoleChanged: '👤', General: '📢',
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Notifications</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>Stay informed about important events</p>
        </div>
        <button className="btn btn-secondary" onClick={handleMarkAllRead}>Mark All Read</button>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <select className="input" style={{ maxWidth: '160px' }} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All</option>
          <option value="false">Unread</option>
          <option value="true">Read</option>
        </select>
      </div>

      <div style={{ display: 'grid', gap: '0.5rem' }}>
        {notifications.map((n) => (
          <div key={n._id} className="card" style={{
            padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            opacity: n.isRead ? 0.7 : 1,
            borderLeft: n.isRead ? '3px solid var(--border-color)' : '3px solid var(--color-primary)',
          }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{typeIcon[n.type] || '📢'}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{n.title}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.125rem' }}>{n.message}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{new Date(n.createdAt).toLocaleString()}</div>
              </div>
            </div>
            {!n.isRead && (
              <button className="btn btn-sm btn-secondary" onClick={() => handleMarkRead(n._id)} style={{ flexShrink: 0 }}>Mark Read</button>
            )}
          </div>
        ))}
        {notifications.length === 0 && <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No notifications</div>}
      </div>
    </div>
  );
};

export default NotificationsPage;
