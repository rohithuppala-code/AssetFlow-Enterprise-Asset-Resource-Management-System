import { useState, useEffect } from 'react';
import { getActivityLogs } from '../api/dataApi';

const ActivityLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = { limit: 30, page, action: actionFilter || undefined };
      const res = await getActivityLogs(params);
      setLogs(res.data.data.logs);
      setPagination(res.data.data.pagination);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, [page, actionFilter]);

  const actionIcon = {
    ASSET_CREATED: '📦', ASSET_UPDATED: '✏️', ASSET_STATUS_CHANGED: '🔄',
    ALLOCATION_MADE: '📤', ASSET_RETURNED: '📥',
    TRANSFER_REQUESTED: '🔄', TRANSFER_APPROVED: '✅', TRANSFER_REJECTED: '❌', TRANSFER_COMPLETED: '✅',
    BOOKING_CREATED: '📅', BOOKING_CANCELLED: '🚫', BOOKING_RESCHEDULED: '📅',
    MAINTENANCE_REQUESTED: '🔧', MAINTENANCE_APPROVED: '✅', MAINTENANCE_REJECTED: '❌',
    MAINTENANCE_TECHNICIAN_ASSIGNED: '👷', MAINTENANCE_STARTED: '▶️', MAINTENANCE_RESOLVED: '✅',
    AUDIT_CREATED: '📋', AUDIT_ENTRY_SUBMITTED: '📝', AUDIT_CLOSED: '🔒',
    DEPARTMENT_CREATED: '🏢', DEPARTMENT_UPDATED: '✏️', DEPARTMENT_DEACTIVATED: '⏸️',
    CATEGORY_CREATED: '📁', CATEGORY_UPDATED: '✏️',
    USER_UPDATED: '👤', ROLE_CHANGED: '👤',
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Activity Logs</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: '1.5rem' }}>Full audit trail of system actions</p>

      <div style={{ marginBottom: '1.25rem' }}>
        <input className="input" style={{ maxWidth: '250px' }} placeholder="Filter by action..." value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }} />
      </div>

      <div style={{ display: 'grid', gap: '0.5rem' }}>
        {logs.map((log) => (
          <div key={log._id} className="card" style={{ padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{actionIcon[log.action] || '📝'}</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{log.description}</span>
                <span className="badge badge-neutral" style={{ flexShrink: 0 }}>{log.action}</span>
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                By: {log.user?.name} ({log.user?.role}) · {log.entityType} · {new Date(log.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
        {logs.length === 0 && <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No activity logs</div>}
      </div>

      {pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
          <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>← Prev</button>
          <span style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Page {pagination.page} of {pagination.pages}</span>
          <button className="btn btn-secondary btn-sm" disabled={page >= pagination.pages} onClick={() => setPage(page + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
};

export default ActivityLogsPage;
