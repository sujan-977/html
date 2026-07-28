'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import './admin.css';

export default function AdminPage() {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [authState, setAuthState] = useState('');
  const [liveState, setLiveState] = useState('');
  const [updatingId, setUpdatingId] = useState('');

  useEffect(() => {
    fetch('/api/admin/session')
      .then(res => res.json())
      .then(data => { setAuthenticated(Boolean(data.authenticated)); })
      .catch(() => setAuthState('Could not check your admin session.'))
      .finally(() => setCheckingSession(false));
  }, []);

  useEffect(() => {
    if (authenticated) loadBookings();
  }, [authenticated]);

  async function signIn() {
    if (!email || !password || !adminKey) {
      setAuthState('Enter your admin email, password, and admin key.');
      return;
    }
    try {
      setAuthState('Signing in securely…');
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const response = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { Authorization: `Bearer ${data.session.access_token}`, 'x-admin-key': adminKey },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not create an admin session.');
      setPassword('');
      setAdminKey('');
      setAuthenticated(true);
      setAuthState('');
    } catch (error) {
      setAuthState(error.message || 'Sign-in failed.');
    }
  }

  async function signOut() {
    await fetch('/api/admin/session', { method: 'DELETE' });
    await supabase.auth.signOut();
    setBookings([]);
    setAuthenticated(false);
    setLiveState('');
  }

  async function loadBookings() {
    try {
      setLiveState('Loading bookings…');
      const res = await fetch('/api/bookings');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Connection failed');
      setBookings(data.bookings);
      setLiveState(`Supabase — ${data.bookings.length} bookings loaded.`);
    } catch (err) {
      if (err.message === 'Unauthorized.') setAuthenticated(false);
      setLiveState(`❌ ${err.message}`);
    }
  }

  async function decideBooking(id, status) {
    if (!window.confirm(`${status === 'Confirmed' ? 'Accept' : 'Reject'} this booking? The customer will receive an email.`)) return;
    try {
      setUpdatingId(id);
      setLiveState(`Updating booking ${id}…`);
      const res = await fetch('/api/bookings', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (!res.ok || !data.booking) throw new Error(data.error || 'Could not update booking.');
      setBookings(items => items.map(b => b.id === id ? data.booking : b));
      setLiveState(data.error ? `⚠️ ${data.error}` : `✓ ${data.message}`);
    } catch (err) {
      setLiveState(`❌ ${err.message}`);
    } finally { setUpdatingId(''); }
  }

  const filtered = bookings.filter(b => {
    const text = [b.id, b.name, b.phone, b.email, b.branch, b.room_type, b.payment_method].join(' ').toLowerCase();
    return (!search || text.includes(search.toLowerCase())) && (!statusFilter || b.status === statusFilter);
  });
  const today = new Date().toISOString().slice(0, 10);
  const pendingCount = bookings.filter(b => b.status === 'Pending').length;
  const todayCount = bookings.filter(b => (b.created_at || '').slice(0, 10) === today).length;
  const branchCount = new Set(bookings.map(b => b.branch).filter(Boolean)).size;
  const fmt = value => value ? new Date(value).toLocaleString() : '-';

  if (checkingSession) return <main className="admin-loading">Checking secure admin access…</main>;
  if (!authenticated) return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <Link className="back" href="/">← Back to website</Link>
        <p className="admin-kicker">Restricted area</p>
        <h1>Admin sign in</h1>
        <p>Use your approved administrator account and the separate admin key to continue.</p>
        <label>Email<input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} /></label>
        <label>Password<input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} /></label>
        <label>Admin key<input type="password" autoComplete="off" value={adminKey} onChange={e => setAdminKey(e.target.value)} onKeyDown={e => e.key === 'Enter' && signIn()} /></label>
        {authState && <p className="admin-auth-message">{authState}</p>}
        <button className="btn" onClick={signIn}>Secure sign in</button>
      </section>
    </main>
  );

  return <>
    <header><div className="brand"><h1>Bookings Admin</h1><p id="live-state">{liveState}</p></div><div className="admin-header-actions"><button className="back" onClick={signOut}>Sign out</button><Link className="back" href="/">← Website</Link></div></header>
    <main>
      <div className="toolbar"><input className="control" id="search" placeholder="Search name, phone, email, branch..." value={search} onChange={e => setSearch(e.target.value)} /><select className="control" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="">All statuses</option><option>Pending</option><option>Confirmed</option><option>Rejected</option></select><button className="btn" onClick={loadBookings}>Refresh bookings</button></div>
      <div className="statusbar"><div className="stat"><strong>{bookings.length}</strong><span>Total Bookings</span></div><div className="stat"><strong>{pendingCount}</strong><span>Pending</span></div><div className="stat"><strong>{todayCount}</strong><span>Today</span></div><div className="stat"><strong>{branchCount}</strong><span>Branches Active</span></div></div>
      <section className="panel"><div className="table-wrap"><table><thead><tr><th>Booking</th><th>Customer</th><th>Stay</th><th>Room</th><th>Food</th><th>Payment</th><th>Status</th><th>Action</th><th>Received</th></tr></thead><tbody>{filtered.map(b => <tr key={b.id}><td><strong>{b.id}</strong><div className="muted">{b.branch || '-'}</div></td><td><strong>{b.name}</strong><div className="muted">{b.email}</div><div className="muted">{b.phone}</div></td><td>{b.checkin || '-'} → {b.checkout || '-'}<div className="muted">{b.guests} guest{(parseInt(b.guests) || 1) > 1 ? 's' : ''}</div></td><td>{b.room_type || '-'}</td><td>{b.food || '-'}</td><td>{b.payment_method || 'TBD'}</td><td><span className={`pill ${(b.status || 'Pending').toLowerCase()}`}>{b.status || 'Pending'}</span></td><td>{b.status === 'Pending' ? <div className="actions"><button className="decision accept" disabled={updatingId === b.id} onClick={() => decideBooking(b.id, 'Confirmed')}>Accept</button><button className="decision reject" disabled={updatingId === b.id} onClick={() => decideBooking(b.id, 'Rejected')}>Reject</button></div> : <span className="muted">Decision sent</span>}</td><td className="muted">{fmt(b.created_at)}</td></tr>)}</tbody></table></div>{filtered.length === 0 && <div className="empty">No bookings yet.</div>}</section>
    </main>
  </>;
}
