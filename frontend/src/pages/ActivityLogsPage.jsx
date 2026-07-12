import { useEffect, useState } from 'react';
import { History } from 'lucide-react';
import { getActivityLogs } from '../api/dataApi';
import { EmptyState, LoadingState, PageHeader, SearchField, StatusPill, SurfaceCard, formatDateTime } from '../components/ui';

function ActivityLogsPage() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await getActivityLogs({ limit: 30, page, action: actionFilter || undefined });
      setLogs(res.data.data.logs);
      setPagination(res.data.data.pagination);
    } catch {
      setLogs([]);
      setPagination({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, actionFilter]);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Audit trail"
        title="System activity logs"
        description="Review who changed what, when, and against which entity across asset, maintenance, booking, and admin workflows."
      />

      <SurfaceCard title="Immutable activity feed" description="Filter by action key and move through paginated history." index={0}>
        <div className="page-stack">
          <SearchField value={actionFilter} onChange={(event) => { setActionFilter(event.target.value); setPage(1); }} placeholder="Filter by action key" style={{ maxWidth: 320 }} />

          {loading ? (
            <LoadingState label="Loading activity trail..." />
          ) : logs.length === 0 ? (
            <EmptyState icon={History} title="No log records found" description="Once operational changes are recorded by the backend, they will appear here with actor, entity, and time metadata." />
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Action</th>
                    <th>Actor</th>
                    <th>Entity</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log._id}>
                      <td style={{ fontWeight: 700 }}>{log.description}</td>
                      <td><StatusPill>{log.action}</StatusPill></td>
                      <td>{log.user?.name || '--'} {log.user?.role ? `(${log.user.role})` : ''}</td>
                      <td>{log.entityType}</td>
                      <td>{formatDateTime(log.createdAt)}</td>
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
                <button className="button button-secondary button-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
                <button className="button button-secondary button-sm" disabled={page >= pagination.pages} onClick={() => setPage(page + 1)}>Next</button>
              </div>
            </div>
          ) : null}
        </div>
      </SurfaceCard>
    </div>
  );
}

export default ActivityLogsPage;
