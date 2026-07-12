import { useEffect, useState } from 'react';
import { Bell, CheckCheck, MailWarning } from 'lucide-react';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../api/dataApi';
import { EmptyState, FiltersBar, LoadingState, PageHeader, StatusPill, SurfaceCard, formatDateTime } from '../components/ui';

function NotificationsPage() {
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
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter]);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      load();
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      load();
    } catch {}
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Awareness layer"
        title="Notifications and reminders"
        description="Stay on top of assignments, approvals, maintenance events, audit discrepancies, and overdue return alerts."
        actions={[
          <button key="all" className="button button-secondary" onClick={handleMarkAllRead}>
            <CheckCheck size={18} />
            <span>Mark all read</span>
          </button>,
        ]}
      />

      <SurfaceCard title="Notification stream" description="Review all account-level activity signals in one feed." index={0}>
        <div className="page-stack">
          <FiltersBar>
            <select className="select" style={{ maxWidth: 180 }} value={filter} onChange={(event) => setFilter(event.target.value)}>
              <option value="">All notifications</option>
              <option value="false">Unread</option>
              <option value="true">Read</option>
            </select>
          </FiltersBar>

          {loading ? (
            <LoadingState label="Loading notifications..." />
          ) : notifications.length === 0 ? (
            <EmptyState icon={Bell} title="No notifications right now" description="Asset assignments, maintenance decisions, booking reminders, and audit discrepancies will appear here." />
          ) : (
            <div style={{ display: 'grid', gap: '0.85rem' }}>
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  style={{
                    padding: '1rem 1.1rem',
                    borderRadius: 20,
                    border: notification.isRead ? '1px solid rgba(148, 163, 184, 0.08)' : '1px solid rgba(96, 165, 250, 0.18)',
                    background: notification.isRead ? 'rgba(8, 18, 34, 0.45)' : 'linear-gradient(135deg, rgba(37, 99, 235, 0.14), rgba(56, 189, 248, 0.06))',
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.9rem', flex: 1, minWidth: 260 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 16, display: 'grid', placeItems: 'center', background: 'rgba(56, 189, 248, 0.12)', color: 'var(--brand-secondary)', flexShrink: 0 }}>
                      <MailWarning size={18} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                        <strong>{notification.title}</strong>
                        <StatusPill>{notification.isRead ? 'Read' : 'Unread'}</StatusPill>
                      </div>
                      <div style={{ color: 'var(--text-secondary)', marginTop: '0.35rem' }}>{notification.message}</div>
                      <div style={{ color: 'var(--text-muted)', marginTop: '0.45rem', fontSize: '0.82rem' }}>{formatDateTime(notification.createdAt)}</div>
                    </div>
                  </div>
                  {!notification.isRead ? (
                    <button className="button button-secondary button-sm" onClick={() => handleMarkRead(notification._id)}>Mark read</button>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </SurfaceCard>
    </div>
  );
}

export default NotificationsPage;
