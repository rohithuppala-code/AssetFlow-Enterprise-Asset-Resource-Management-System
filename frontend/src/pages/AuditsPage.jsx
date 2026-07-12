import { useEffect, useMemo, useState } from 'react';
import { ClipboardCheck, FileSearch, Lock, PlusCircle } from 'lucide-react';
import {
  closeAuditCycle,
  createAuditCycle,
  createAuditEntry,
  getAuditCycles,
  getAuditEntries,
  getDiscrepancyReport,
  getUsers,
  getAssets,
} from '../api/dataApi';
import { useAuth } from '../context/AuthContext';
import {
  EmptyState,
  KeyValueList,
  LoadingState,
  MetricCard,
  PageHeader,
  StatusPill,
  SurfaceCard,
  formatDate,
} from '../components/ui';

function AuditsPage() {
  const { hasRole } = useAuth();
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ scope: { type: 'Department', value: '' }, auditors: [] });
  const [error, setError] = useState('');
  const [selectedCycle, setSelectedCycle] = useState(null);
  const [entries, setEntries] = useState([]);
  const [entryForm, setEntryForm] = useState({});
  const [report, setReport] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [scopedAssets, setScopedAssets] = useState([]);

  useEffect(() => {
    if (showForm) {
      getUsers({ limit: 100 })
        .then((res) => setUsersList(res.data.data.users || []))
        .catch(() => setUsersList([]));
    }
  }, [showForm]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getAuditCycles({ limit: 50 });
      setCycles(res.data.data.cycles);
    } catch {
      setCycles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await createAuditCycle({
        ...form,
        auditors: form.auditors || [],
      });
      setShowForm(false);
      setForm({ scope: { type: 'Department', value: '' }, auditors: [] });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create audit cycle');
    }
  };

  const handleViewCycle = async (cycle) => {
    setSelectedCycle(cycle);
    setReport(null);
    try {
      const res = await getAuditEntries(cycle._id);
      setEntries(res.data.data.entries);
      getAssets({ limit: 200 })
        .then((assetRes) => {
          const list = assetRes.data.data.assets || [];
          const filtered = list.filter((a) => {
            if (cycle.scope?.type === 'Department') {
              return a.department?.name === cycle.scope.value || a.department?._id === cycle.scope.value;
            } else if (cycle.scope?.type === 'Location') {
              return a.location?.toLowerCase().includes(cycle.scope.value.toLowerCase());
            }
            return true;
          });
          setScopedAssets(filtered.length > 0 ? filtered : list);
        })
        .catch(() => setScopedAssets([]));
    } catch {
      setEntries([]);
      setScopedAssets([]);
    }
  };

  const handleEntry = async (event) => {
    event.preventDefault();
    try {
      await createAuditEntry(selectedCycle._id, entryForm);
      setEntryForm({});
      handleViewCycle(selectedCycle);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit audit entry');
    }
  };

  const handleClose = async (id) => {
    if (!confirm('Close this audit cycle? This will lock all entries.')) return;
    try {
      await closeAuditCycle(id);
      load();
      setSelectedCycle(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to close cycle');
    }
  };

  const handleReport = async (id) => {
    try {
      const res = await getDiscrepancyReport(id);
      setReport(res.data.data.report);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load discrepancy report');
    }
  };

  const stats = useMemo(() => ({
    open: cycles.filter((cycle) => cycle.status === 'Open').length,
    inProgress: cycles.filter((cycle) => cycle.status === 'InProgress').length,
    closed: cycles.filter((cycle) => cycle.status === 'Closed').length,
  }), [cycles]);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Verification workflows"
        title="Structured audit cycles"
        description="Launch scoped audits, collect verification entries, and close cycles with discrepancy visibility and traceable evidence."
        actions={
          hasRole('Admin') ? [
            <button key="new" className="button button-primary" onClick={() => setShowForm((value) => !value)}>
              <PlusCircle size={18} />
              <span>{showForm ? 'Close audit form' : 'Create audit cycle'}</span>
            </button>,
          ] : null
        }
      />

      <section className="kpi-grid">
        <MetricCard title="Open cycles" value={stats.open} icon={ClipboardCheck} tone="var(--brand-primary)" index={0} footer="Not yet actively underway" />
        <MetricCard title="In progress" value={stats.inProgress} icon={FileSearch} tone="var(--warning)" index={1} footer="Currently collecting entries" />
        <MetricCard title="Closed cycles" value={stats.closed} icon={Lock} tone="var(--success)" index={2} footer="Locked with verified outcomes" />
      </section>

      <SurfaceCard title="Audit command board" description="Manage audit schedules, entries, and discrepancy visibility." index={0}>
        <div className="page-stack">
          {error ? <div className="alert">{error}</div> : null}

          {showForm ? (
            <form onSubmit={handleCreate} style={{ display: 'grid', gap: '1rem', padding: '1.2rem', borderRadius: 22, background: 'rgba(8, 18, 34, 0.54)', border: '1px solid rgba(148, 163, 184, 0.08)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div className="field">
                  <label>Cycle name</label>
                  <input className="input" value={form.name || ''} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
                </div>
                <div className="field">
                  <label>Scope type</label>
                  <select className="select" value={form.scope.type} onChange={(event) => setForm({ ...form, scope: { ...form.scope, type: event.target.value } })}>
                    <option value="Department">Department</option>
                    <option value="Location">Location</option>
                  </select>
                </div>
                <div className="field">
                  <label>Scope value</label>
                  <input className="input" value={form.scope.value} onChange={(event) => setForm({ ...form, scope: { ...form.scope, value: event.target.value } })} required />
                </div>
                <div className="field">
                  <label>Start date</label>
                  <input className="input" type="date" value={form.startDate || ''} onChange={(event) => setForm({ ...form, startDate: event.target.value })} required />
                </div>
                <div className="field">
                  <label>End date</label>
                  <input className="input" type="date" value={form.endDate || ''} onChange={(event) => setForm({ ...form, endDate: event.target.value })} required />
                </div>
                <div className="field" style={{ gridColumn: 'span 2' }}>
                  <label>Assigned Auditors</label>
                  <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', maxHeight: 120, overflowY: 'auto', padding: '0.6rem', borderRadius: 16, background: 'rgba(148, 163, 184, 0.06)', border: '1px solid rgba(148, 163, 184, 0.08)' }}>
                    {usersList.map((u) => {
                      const isChecked = (form.auditors || []).includes(u._id);
                      return (
                        <label key={u._id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', padding: '0.2rem 0.5rem', background: 'rgba(148, 163, 184, 0.06)', borderRadius: 8 }}>
                          <input 
                            type="checkbox" 
                            checked={isChecked} 
                            onChange={(e) => {
                              const current = form.auditors || [];
                              const updated = e.target.checked 
                                ? [...current, u._id] 
                                : current.filter((id) => id !== u._id);
                              setForm({ ...form, auditors: updated });
                            }} 
                          />
                          <span style={{ fontSize: '0.85rem' }}>{u.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button type="submit" className="button button-primary">Create cycle</button>
                <button type="button" className="button button-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          ) : null}

          {selectedCycle ? (
            <div style={{ padding: '1.2rem', borderRadius: 22, background: 'rgba(8, 18, 34, 0.54)', border: '1px solid rgba(148, 163, 184, 0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: 0 }}>{selectedCycle.name}</h3>
                  <div style={{ color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                    {selectedCycle.scope?.type}: {selectedCycle.scope?.value}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <StatusPill>{selectedCycle.status}</StatusPill>
                  {hasRole('Admin', 'AssetManager') ? <button className="button button-secondary button-sm" onClick={() => handleReport(selectedCycle._id)}>View report</button> : null}
                  {selectedCycle.status !== 'Closed' && hasRole('Admin') ? <button className="button button-danger button-sm" onClick={() => handleClose(selectedCycle._id)}>Close cycle</button> : null}
                  <button className="button button-secondary button-sm" onClick={() => setSelectedCycle(null)}>Dismiss</button>
                </div>
              </div>

              <KeyValueList
                items={[
                  { label: 'Start', value: formatDate(selectedCycle.startDate) },
                  { label: 'End', value: formatDate(selectedCycle.endDate) },
                  { label: 'Auditors', value: selectedCycle.auditors?.length || 0 },
                  { label: 'Entries logged', value: entries.length },
                ]}
              />

              {selectedCycle.status !== 'Closed' ? (
                <form onSubmit={handleEntry} style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                    <div className="field">
                      <label>Asset</label>
                      <select className="select" value={entryForm.asset || ''} onChange={(event) => setEntryForm({ ...entryForm, asset: event.target.value })} required>
                        <option value="">Select scoped asset...</option>
                        {scopedAssets.map((asset) => (
                          <option key={asset._id} value={asset._id}>
                            {asset.name} ({asset.assetTag})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="field">
                      <label>Result</label>
                      <select className="select" value={entryForm.result || ''} onChange={(event) => setEntryForm({ ...entryForm, result: event.target.value })} required>
                        <option value="">Select result</option>
                        <option value="Verified">Verified</option>
                        <option value="Missing">Missing</option>
                        <option value="Damaged">Damaged</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>Notes</label>
                      <input className="input" value={entryForm.notes || ''} onChange={(event) => setEntryForm({ ...entryForm, notes: event.target.value })} />
                    </div>
                  </div>
                  <div>
                    <button type="submit" className="button button-primary">Submit entry</button>
                  </div>
                </form>
              ) : null}

              <div style={{ marginTop: '1rem' }}>
                <div style={{ fontWeight: 800, marginBottom: '0.65rem' }}>Cycle entries</div>
                {entries.length === 0 ? (
                  <EmptyState icon={ClipboardCheck} title="No entries yet" description="Audit entries submitted by assigned auditors will accumulate here." />
                ) : (
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Asset</th>
                          <th>Auditor</th>
                          <th>Result</th>
                          <th>Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {entries.map((entry) => (
                          <tr key={entry._id}>
                            <td>{entry.asset?.name} ({entry.asset?.assetTag})</td>
                            <td>{entry.auditor?.name || '--'}</td>
                            <td><StatusPill>{entry.result}</StatusPill></td>
                            <td>{entry.notes || 'No notes'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {report ? (
                <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: 18, background: 'rgba(248, 113, 113, 0.08)', border: '1px solid rgba(248, 113, 113, 0.16)' }}>
                  <div style={{ fontWeight: 800, marginBottom: '0.4rem' }}>Discrepancy report</div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    Total discrepancies: {report.totalDiscrepancies} • Missing: {report.missing} • Damaged: {report.damaged}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {loading ? (
            <LoadingState label="Loading audit cycles..." />
          ) : cycles.length === 0 ? (
            <EmptyState icon={ClipboardCheck} title="No audit cycles created" description="Create a cycle to assign auditors, verify assets, and generate discrepancy reports." />
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Cycle</th>
                    <th>Scope</th>
                    <th>Dates</th>
                    <th>Auditors</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {cycles.map((cycle) => (
                    <tr key={cycle._id} className="table-row-clickable" onClick={() => handleViewCycle(cycle)}>
                      <td style={{ fontWeight: 800 }}>{cycle.name}</td>
                      <td>{cycle.scope?.type} • {cycle.scope?.value}</td>
                      <td>{formatDate(cycle.startDate)} to {formatDate(cycle.endDate)}</td>
                      <td>{cycle.auditors?.length || 0}</td>
                      <td><StatusPill>{cycle.status}</StatusPill></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </SurfaceCard>

      <style>{`
        @media (max-width: 1200px) {
          .kpi-grid > * { grid-column: span 4 !important; }
        }
        @media (max-width: 780px) {
          .kpi-grid > * { grid-column: span 2 !important; }
        }
      `}</style>
    </div>
  );
}

export default AuditsPage;
