import { useEffect, useMemo, useState } from 'react';
import { BookMarked, CalendarClock, CalendarX2, Plus } from 'lucide-react';
import { cancelBooking, createBooking, getAssets, getBookings } from '../api/dataApi';
import {
  EmptyState,
  LoadingState,
  MetricCard,
  PageHeader,
  StatusPill,
  SurfaceCard,
  formatDateTime,
} from '../components/ui';

function BookingsPage() {
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
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    getAssets({ isBookable: 'true', limit: 100 })
      .then((res) => setBookableAssets(res.data.data.assets))
      .catch(() => setBookableAssets([]));
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await createBooking(form);
      setShowForm(false);
      setForm({});
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking');
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await cancelBooking(id, {});
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const stats = useMemo(() => ({
    upcoming: bookings.filter((booking) => booking.status === 'Upcoming').length,
    ongoing: bookings.filter((booking) => booking.status === 'Ongoing').length,
    cancelled: bookings.filter((booking) => booking.status === 'Cancelled').length,
  }), [bookings]);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Shared resource scheduling"
        title="Time-slot booking control"
        description="Reserve shared rooms, vehicles, and equipment while keeping overlap-sensitive scheduling visible to every team."
        actions={[
          <button key="booking" className="button button-primary" onClick={() => setShowForm((value) => !value)}>
            <Plus size={18} />
            <span>{showForm ? 'Close booking form' : 'Book resource'}</span>
          </button>,
        ]}
      />

      <section className="kpi-grid">
        <MetricCard title="Upcoming bookings" value={stats.upcoming} icon={CalendarClock} tone="var(--brand-primary)" index={0} footer="Reservations waiting to start" />
        <MetricCard title="In progress now" value={stats.ongoing} icon={BookMarked} tone="var(--success)" index={1} footer="Resources currently in use" />
        <MetricCard title="Cancelled" value={stats.cancelled} icon={CalendarX2} tone="var(--danger)" index={2} footer="Recently released slots" />
      </section>

      <SurfaceCard title="Booking board" description="Create bookings and track their live status across shared resources." index={0}>
        <div className="page-stack">
          {error ? <div className="alert">{error}</div> : null}

          {showForm ? (
            <form onSubmit={handleCreate} style={{ display: 'grid', gap: '1rem', padding: '1.2rem', borderRadius: 22, background: 'rgba(8, 18, 34, 0.54)', border: '1px solid rgba(148, 163, 184, 0.08)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div className="field">
                  <label>Shared resource</label>
                  <select className="select" value={form.asset || ''} onChange={(event) => setForm({ ...form, asset: event.target.value })} required>
                    <option value="">Select resource</option>
                    {bookableAssets.map((asset) => (
                      <option key={asset._id} value={asset._id}>{asset.name} ({asset.assetTag})</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Start time</label>
                  <input className="input" type="datetime-local" value={form.startTime || ''} onChange={(event) => setForm({ ...form, startTime: event.target.value })} required />
                </div>
                <div className="field">
                  <label>End time</label>
                  <input className="input" type="datetime-local" value={form.endTime || ''} onChange={(event) => setForm({ ...form, endTime: event.target.value })} required />
                </div>
                <div className="field">
                  <label>Purpose</label>
                  <input className="input" value={form.purpose || ''} onChange={(event) => setForm({ ...form, purpose: event.target.value })} placeholder="Workshop, review, transport..." />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button type="submit" className="button button-primary">Create booking</button>
                <button type="button" className="button button-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          ) : null}

          {loading ? (
            <LoadingState label="Loading bookings..." />
          ) : bookings.length === 0 ? (
            <EmptyState icon={BookMarked} title="No bookings yet" description="Shared resource reservations will appear here once users start scheduling equipment or rooms." />
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Resource</th>
                    <th>Window</th>
                    <th>Booked by</th>
                    <th>Purpose</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking._id}>
                      <td>
                        <div style={{ fontWeight: 800 }}>{booking.asset?.name}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{booking.asset?.assetTag}</div>
                      </td>
                      <td>
                        <div>{formatDateTime(booking.startTime)}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>to {formatDateTime(booking.endTime)}</div>
                      </td>
                      <td>{booking.bookedBy?.name || '--'}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{booking.purpose || 'Not specified'}</td>
                      <td><StatusPill>{booking.status}</StatusPill></td>
                      <td>
                        {booking.status === 'Upcoming' ? (
                          <button className="button button-danger button-sm" onClick={() => handleCancel(booking._id)}>Cancel</button>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No action</span>
                        )}
                      </td>
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

export default BookingsPage;
