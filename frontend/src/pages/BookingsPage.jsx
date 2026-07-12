import { useState, useEffect } from 'react';
import { getBookings, createBooking, cancelBooking, getAssets } from '../api/dataApi';

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [bookableAssets, setBookableAssets] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getBookings({ limit: 50 });
      setBookings(res.data.data.bookings);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    getAssets({ isBookable: 'true', limit: 100 }).then((res) => setBookableAssets(res.data.data.assets)).catch(() => {});
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createBooking(form);
      setShowForm(false);
      setForm({});
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    try { await cancelBooking(id, {}); load(); } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const statusBadge = { Upcoming: 'badge-info', Ongoing: 'badge-success', Completed: 'badge-neutral', Cancelled: 'badge-danger' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Resource Booking</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>Book shared resources by time slot</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ Book Resource</button>
      </div>

      {error && <div style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.1)', borderRadius: '0.5rem', color: '#f87171', fontSize: '0.8125rem', marginBottom: '1rem' }}>{error}</div>}

      {showForm && (
        <form onSubmit={handleCreate} className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>New Booking</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            <div><label className="label">Resource *</label>
              <select className="input" value={form.asset || ''} onChange={(e) => setForm({ ...form, asset: e.target.value })} required>
                <option value="">Select resource...</option>
                {bookableAssets.map((a) => <option key={a._id} value={a._id}>{a.name} ({a.assetTag})</option>)}
              </select>
            </div>
            <div><label className="label">Start Time *</label><input className="input" type="datetime-local" value={form.startTime || ''} onChange={(e) => setForm({ ...form, startTime: e.target.value })} required /></div>
            <div><label className="label">End Time *</label><input className="input" type="datetime-local" value={form.endTime || ''} onChange={(e) => setForm({ ...form, endTime: e.target.value })} required /></div>
            <div><label className="label">Purpose</label><input className="input" placeholder="Meeting, etc." value={form.purpose || ''} onChange={(e) => setForm({ ...form, purpose: e.target.value })} /></div>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
            <button type="submit" className="btn btn-primary">Book</button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {bookings.map((b) => (
          <div key={b._id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600 }}>{b.asset?.name} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({b.asset?.assetTag})</span></div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                {new Date(b.startTime).toLocaleString()} → {new Date(b.endTime).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>By: {b.bookedBy?.name} {b.purpose ? `· ${b.purpose}` : ''}</div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span className={`badge ${statusBadge[b.status]}`}>{b.status}</span>
              {b.status === 'Upcoming' && <button className="btn btn-sm btn-danger" onClick={() => handleCancel(b._id)}>Cancel</button>}
            </div>
          </div>
        ))}
        {bookings.length === 0 && <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No bookings found</div>}
      </div>
    </div>
  );
};

export default BookingsPage;
