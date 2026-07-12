import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAuditCycles, createAuditCycle, getAuditEntries, createAuditEntry, closeAuditCycle, getDiscrepancyReport } from '../api/dataApi';

const AuditsPage = () => {
  const { user, hasRole } = useAuth();
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ scope: { type: 'Department', value: '' }, auditors: '' });
  const [error, setError] = useState('');
  const [selectedCycle, setSelectedCycle] = useState(null);
  const [entries, setEntries] = useState([]);
  const [entryForm, setEntryForm] = useState({});
  const [report, setReport] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getAuditCycles({ limit: 50 });
      setCycles(res.data.data.cycles);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = {
        ...form,
        auditors: form.auditors.split(',').map((s) => s.trim()).filter(Boolean),
      };
      await createAuditCycle(data);
      setShowForm(false);
      setForm({ scope: { type: 'Department', value: '' }, auditors: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    }
  };

  const handleViewCycle = async (cycle) => {
    setSelectedCycle(cycle);
    setReport(null);
    try {
      const res = await getAuditEntries(cycle._id);
      setEntries(res.data.data.entries);
    } catch { setEntries([]); }
  };

  const handleEntry = async (e) => {
    e.preventDefault();
    try {
      await createAuditEntry(selectedCycle._id, entryForm);
      setEntryForm({});
      handleViewCycle(selectedCycle);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const handleClose = async (id) => {
    if (!confirm('Close this audit cycle? This will lock all entries.')) return;
    try { await closeAuditCycle(id); load(); setSelectedCycle(null); } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const handleReport = async (id) => {
    try {
      const res = await getDiscrepancyReport(id);
      setReport(res.data.data.report);
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const statusBadge = { Open: 'badge-info', InProgress: 'badge-warning', Closed: 'badge-neutral' };
  const resultBadge = { Verified: 'badge-success', Missing: 'badge-danger', Damaged: 'badge-warning' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Asset Audits</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>Run structured audit cycles</p>
        </div>
        {hasRole('Admin') && <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ Create Audit Cycle</button>}
      </div>

      {error && <div style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.1)', borderRadius: '0.5rem', color: '#f87171', fontSize: '0.8125rem', marginBottom: '1rem' }}>{error}</div>}

      {showForm && (
        <form onSubmit={handleCreate} className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>New Audit Cycle</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            <div><label className="label">Name *</label><input className="input" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div><label className="label">Scope Type *</label>
              <select className="input" value={form.scope.type} onChange={(e) => setForm({ ...form, scope: { ...form.scope, type: e.target.value } })}>
                <option value="Department">Department</option><option value="Location">Location</option>
              </select>
            </div>
            <div><label className="label">Scope Value *</label><input className="input" placeholder="Dept name or location" value={form.scope.value} onChange={(e) => setForm({ ...form, scope: { ...form.scope, value: e.target.value } })} required /></div>
            <div><label className="label">Start Date *</label><input className="input" type="date" value={form.startDate || ''} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required /></div>
            <div><label className="label">End Date *</label><input className="input" type="date" value={form.endDate || ''} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required /></div>
            <div><label className="label">Auditor IDs * (comma-separated)</label><input className="input" placeholder="id1, id2" value={form.auditors} onChange={(e) => setForm({ ...form, auditors: e.target.value })} required /></div>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
            <button type="submit" className="btn btn-primary">Create</button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {selectedCycle && (
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 600 }}>{selectedCycle.name} <span className={`badge ${statusBadge[selectedCycle.status]}`} style={{ marginLeft: '0.5rem' }}>{selectedCycle.status}</span></h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {hasRole('Admin', 'AssetManager') && <button className="btn btn-sm btn-secondary" onClick={() => handleReport(selectedCycle._id)}>View Report</button>}
              {selectedCycle.status !== 'Closed' && hasRole('Admin') && <button className="btn btn-sm btn-danger" onClick={() => handleClose(selectedCycle._id)}>Close Cycle</button>}
              <button className="btn btn-sm btn-secondary" onClick={() => setSelectedCycle(null)}>✕</button>
            </div>
          </div>

          {selectedCycle.status !== 'Closed' && (
            <form onSubmit={handleEntry} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div><label className="label">Asset ID</label><input className="input" value={entryForm.asset || ''} onChange={(e) => setEntryForm({ ...entryForm, asset: e.target.value })} required /></div>
              <div><label className="label">Result</label>
                <select className="input" value={entryForm.result || ''} onChange={(e) => setEntryForm({ ...entryForm, result: e.target.value })} required>
                  <option value="">Select...</option><option value="Verified">Verified</option><option value="Missing">Missing</option><option value="Damaged">Damaged</option>
                </select>
              </div>
              <div><label className="label">Notes</label><input className="input" value={entryForm.notes || ''} onChange={(e) => setEntryForm({ ...entryForm, notes: e.target.value })} /></div>
              <button type="submit" className="btn btn-primary btn-sm">Submit Entry</button>
            </form>
          )}

          <div style={{ fontSize: '0.875rem' }}>
            <h4 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Entries ({entries.length})</h4>
            {entries.map((en) => (
              <div key={en._id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                <span>{en.asset?.name} ({en.asset?.assetTag}) — by {en.auditor?.name}</span>
                <span className={`badge ${resultBadge[en.result]}`}>{en.result}</span>
              </div>
            ))}
          </div>

          {report && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem' }}>
              <h4 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Discrepancy Report</h4>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Total: {report.totalDiscrepancies} · Missing: {report.missing} · Damaged: {report.damaged}
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {cycles.map((c) => (
          <div key={c._id} className="card" style={{ padding: '1rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => handleViewCycle(c)}>
            <div>
              <div style={{ fontWeight: 600 }}>{c.name}</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Scope: {c.scope?.type} — {c.scope?.value} · {c.auditors?.length || 0} auditor(s)</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(c.startDate).toLocaleDateString()} → {new Date(c.endDate).toLocaleDateString()}</div>
            </div>
            <span className={`badge ${statusBadge[c.status]}`}>{c.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuditsPage;
