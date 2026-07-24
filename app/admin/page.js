'use client';
import { useState } from 'react';
import Link from 'next/link';
import './admin.css';

export default function AdminPage() {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [liveState, setLiveState] = useState('Enter your admin key to load Supabase bookings.');
  const [updatingId, setUpdatingId] = useState('');

  async function connectServer() {
    if (!adminKey) { alert('Please enter the admin key.'); return; }
    try {
      setLiveState('Connecting…');
      const res = await fetch('/api/bookings?adminKey='+encodeURIComponent(adminKey), {
        headers: {'x-admin-key': adminKey}
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Connection failed');
      setBookings(data.bookings);
      setLiveState('Supabase — '+data.bookings.length+' bookings loaded.');
    } catch(err) {
      setLiveState('❌ '+err.message);
    }
  }

  async function decideBooking(id, status) {
    if (!adminKey) { alert('Please enter the admin key.'); return; }
    if (!window.confirm(`${status === 'Confirmed' ? 'Accept' : 'Reject'} this booking? The customer will receive an email.`)) return;

    try {
      setUpdatingId(id);
      setLiveState(`Updating booking ${id}…`);
      const res = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (!data.booking) throw new Error(data.error || 'Could not update booking.');
      setBookings(items => items.map(b => b.id === id ? data.booking : b));
      setLiveState(data.error ? `⚠️ ${data.error}` : `✓ ${data.message}`);
    } catch (err) {
      setLiveState(`❌ ${err.message}`);
    } finally {
      setUpdatingId('');
    }
  }

  const filtered = bookings.filter(b => {
    const text = [b.id,b.name,b.phone,b.email,b.branch,b.room_type,b.payment_method].join(' ').toLowerCase();
    return (!search || text.includes(search.toLowerCase())) && (!statusFilter || b.status === statusFilter);
  });

  const today = new Date().toISOString().slice(0,10);
  const pendingCount = bookings.filter(b=>b.status==='Pending').length;
  const todayCount = bookings.filter(b=>(b.created_at||'').slice(0,10)===today).length;
  const branchCount = new Set(bookings.map(b=>b.branch).filter(Boolean)).size;

  function fmt(v) {
    if (!v) return '-';
    return new Date(v).toLocaleString();
  }

  return (
    <>
      <header>
        <div className="brand">
          <h1>Bookings Admin</h1>
          <p id="live-state">{liveState}</p>
        </div>
        <Link className="back" href="/">← Back to website</Link>
      </header>
      <main>
        <div className="toolbar">
          <input className="control" id="search" placeholder="Search name, phone, email, branch..." value={search} onChange={e=>setSearch(e.target.value)} />
          <select className="control" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            <option>Pending</option>
            <option>Confirmed</option>
            <option>Rejected</option>
          </select>
          <div className="admin-key">
            <input className="control" type="password" placeholder="Admin key" value={adminKey} onChange={e=>setAdminKey(e.target.value)} />
            <button className="btn" onClick={connectServer}>Load Bookings</button>
          </div>
        </div>

        <div className="statusbar">
          <div className="stat"><strong>{bookings.length}</strong><span>Total Bookings</span></div>
          <div className="stat"><strong>{pendingCount}</strong><span>Pending</span></div>
          <div className="stat"><strong>{todayCount}</strong><span>Today</span></div>
          <div className="stat"><strong>{branchCount}</strong><span>Branches Active</span></div>
        </div>

        <section className="panel">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Booking</th><th>Customer</th><th>Stay</th><th>Room</th><th>Food</th><th>Payment</th><th>Status</th><th>Action</th><th>Received</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.id}>
                    <td><strong>{b.id}</strong><div className="muted">{b.branch||'-'}</div></td>
                    <td><strong>{b.name}</strong><div className="muted">{b.email}</div><div className="muted">{b.phone}</div></td>
                    <td>{b.checkin||'-'} → {b.checkout||'-'}<div className="muted">{b.guests} guest{(parseInt(b.guests)||1)>1?'s':''}</div></td>
                    <td>{b.room_type||'-'}</td>
                    <td>{b.food||'-'}</td>
                    <td>{b.payment_method||'TBD'}</td>
                    <td><span className={`pill ${(b.status||'Pending').toLowerCase()}`}>{b.status||'Pending'}</span></td>
                    <td>
                      {b.status === 'Pending' ? (
                        <div className="actions">
                          <button className="decision accept" disabled={updatingId === b.id} onClick={() => decideBooking(b.id, 'Confirmed')}>Accept</button>
                          <button className="decision reject" disabled={updatingId === b.id} onClick={() => decideBooking(b.id, 'Rejected')}>Reject</button>
                        </div>
                      ) : <span className="muted">Decision sent</span>}
                    </td>
                    <td className="muted">{fmt(b.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <div className="empty">No bookings yet.</div>}
        </section>
      </main>
    </>
  );
}
