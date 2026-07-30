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
  const [rooms, setRooms] = useState([]);
  const [roomForm, setRoomForm] = useState({ name: '', price: '', description: '', capacity: '', amenities: '', image_url: '', is_available: true });
  const [editingRoomId, setEditingRoomId] = useState('');
  const [roomState, setRoomState] = useState('');
  const [uploadingRoomImage, setUploadingRoomImage] = useState(false);

  useEffect(() => {
    fetch('/api/admin/session')
      .then(res => res.json())
      .then(data => { setAuthenticated(Boolean(data.authenticated)); })
      .catch(() => setAuthState('Could not check your admin session.'))
      .finally(() => setCheckingSession(false));
  }, []);

  useEffect(() => {
    if (authenticated) { loadBookings(); loadRooms(); }
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

  async function loadRooms() {
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not load rooms.');
      setRooms(data.rooms || []);
    } catch (err) { setRoomState(`❌ ${err.message}`); }
  }

  function resetRoomForm() {
    setRoomForm({ name: '', price: '', description: '', capacity: '', amenities: '', image_url: '', is_available: true });
    setEditingRoomId('');
  }

  async function saveRoom(event) {
    event.preventDefault();
    try {
      setRoomState(editingRoomId ? 'Updating room…' : 'Adding room…');
      const body = { ...roomForm, price: Number(roomForm.price), amenities: roomForm.amenities.split(',').map(item => item.trim()).filter(Boolean) };
      if (editingRoomId) body.id = editingRoomId;
      const res = await fetch('/api/rooms', { method: editingRoomId ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save room.');
      setRooms(items => editingRoomId ? items.map(room => room.id === data.room.id ? data.room : room) : [data.room, ...items]);
      resetRoomForm();
      setRoomState('✓ Room saved. It is now visible on the Rooms page.');
    } catch (err) { setRoomState(`❌ ${err.message}`); }
  }

  async function uploadRoomImage(event) {
    const image = event.target.files?.[0];
    if (!image) return;
    try {
      setUploadingRoomImage(true); setRoomState('Uploading image…');
      const formData = new FormData(); formData.append('image', image);
      const res = await fetch('/api/rooms/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not upload image.');
      setRoomForm(form => ({ ...form, image_url: data.image_url }));
      setRoomState('✓ Image uploaded. Save the room to publish it.');
    } catch (err) { setRoomState(`❌ ${err.message}`); }
    finally { setUploadingRoomImage(false); event.target.value = ''; }
  }

  function editRoom(room) {
    setEditingRoomId(room.id);
    setRoomForm({ name: room.name || '', price: room.price ?? '', description: room.description || '', capacity: room.capacity || '', amenities: (room.amenities || []).join(', '), image_url: room.image_url || '', is_available: room.is_available !== false });
    setRoomState(`Editing ${room.name}.`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function deleteRoom(room) {
    if (!window.confirm(`Remove ${room.name}? This will remove it from the public Rooms page.`)) return;
    try {
      const res = await fetch('/api/rooms', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: room.id }) });
      const data = await res.json(); if (!res.ok) throw new Error(data.error || 'Could not remove room.');
      setRooms(items => items.filter(item => item.id !== room.id));
      if (editingRoomId === room.id) resetRoomForm();
      setRoomState('✓ Room removed from the website.');
    } catch (err) { setRoomState(`❌ ${err.message}`); }
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
      <section className="rooms-admin-panel">
        <div className="rooms-admin-heading"><div><p>Website rooms</p><h2>{editingRoomId ? 'Edit room' : 'Add a room'}</h2><span>Add its photo, price and details. Changes publish directly to the public Rooms page.</span></div><Link href="/rooms" target="_blank">Preview Rooms ↗</Link></div>
        <form className="room-form" onSubmit={saveRoom}>
          <label>Room name<input required value={roomForm.name} onChange={e => setRoomForm(form => ({ ...form, name: e.target.value }))} placeholder="e.g. Deluxe Double Room" /></label>
          <label>Price per night (NPR)<input required min="0" type="number" value={roomForm.price} onChange={e => setRoomForm(form => ({ ...form, price: e.target.value }))} placeholder="2500" /></label>
          <label>Guests / capacity<input value={roomForm.capacity} onChange={e => setRoomForm(form => ({ ...form, capacity: e.target.value }))} placeholder="Up to 2 guests" /></label>
          <label>Amenities <small>separate with commas</small><input value={roomForm.amenities} onChange={e => setRoomForm(form => ({ ...form, amenities: e.target.value }))} placeholder="WiFi, Hot shower, TV" /></label>
          <label className="room-description">Description<textarea value={roomForm.description} onChange={e => setRoomForm(form => ({ ...form, description: e.target.value }))} placeholder="Describe the room and what guests can expect." /></label>
          <div className="room-image-field"><span>Room picture</span><input type="file" accept="image/*" onChange={uploadRoomImage} disabled={uploadingRoomImage} /><small>{uploadingRoomImage ? 'Uploading…' : 'JPG, PNG or WebP up to 5 MB'}</small>{roomForm.image_url && <img src={roomForm.image_url} alt="Room preview" />}</div>
          <label className="available-check"><input type="checkbox" checked={roomForm.is_available} onChange={e => setRoomForm(form => ({ ...form, is_available: e.target.checked }))} /> Show as available on the website</label>
          <div className="room-form-actions"><button className="btn" type="submit" disabled={uploadingRoomImage}>{editingRoomId ? 'Save room changes' : 'Publish room'}</button>{editingRoomId && <button className="btn secondary" type="button" onClick={resetRoomForm}>Cancel edit</button>}</div>
        </form>
        {roomState && <p className="room-state">{roomState}</p>}
        <div className="managed-rooms"><h3>Managed rooms <span>{rooms.length}</span></h3>{rooms.length ? <div className="managed-rooms-grid">{rooms.map(room => <article key={room.id}><div className="managed-room-image">{room.image_url ? <img src={room.image_url} alt="" /> : '🛏️'}</div><div><strong>{room.name}</strong><p>NPR {Number(room.price).toLocaleString()} / night</p><small>{room.is_available ? 'Visible to guests' : 'Hidden from guests'}</small></div><div className="managed-room-actions"><button onClick={() => editRoom(room)}>Edit</button><button onClick={() => deleteRoom(room)}>Remove</button></div></article>)}</div> : <p className="managed-rooms-empty">No rooms have been added yet.</p>}</div>
      </section>
      <div className="toolbar"><input className="control" id="search" placeholder="Search name, phone, email, branch..." value={search} onChange={e => setSearch(e.target.value)} /><select className="control" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="">All statuses</option><option>Pending</option><option>Confirmed</option><option>Rejected</option></select><button className="btn" onClick={loadBookings}>Refresh bookings</button></div>
      <div className="statusbar"><div className="stat"><strong>{bookings.length}</strong><span>Total Bookings</span></div><div className="stat"><strong>{pendingCount}</strong><span>Pending</span></div><div className="stat"><strong>{todayCount}</strong><span>Today</span></div><div className="stat"><strong>{branchCount}</strong><span>Branches Active</span></div></div>
      <section className="panel"><div className="table-wrap"><table><thead><tr><th>Booking</th><th>Customer</th><th>Stay</th><th>Room</th><th>Food</th><th>Payment</th><th>Status</th><th>Action</th><th>Received</th></tr></thead><tbody>{filtered.map(b => <tr key={b.id}><td><strong>{b.id}</strong><div className="muted">{b.branch || '-'}</div></td><td><strong>{b.name}</strong><div className="muted">{b.email}</div><div className="muted">{b.phone}</div></td><td>{b.checkin || '-'} → {b.checkout || '-'}<div className="muted">{b.guests} guest{(parseInt(b.guests) || 1) > 1 ? 's' : ''}</div></td><td>{b.room_type || '-'}</td><td>{b.food || '-'}</td><td>{b.payment_method || 'TBD'}</td><td><span className={`pill ${(b.status || 'Pending').toLowerCase()}`}>{b.status || 'Pending'}</span></td><td>{b.status === 'Pending' ? <div className="actions"><button className="decision accept" disabled={updatingId === b.id} onClick={() => decideBooking(b.id, 'Confirmed')}>Accept</button><button className="decision reject" disabled={updatingId === b.id} onClick={() => decideBooking(b.id, 'Rejected')}>Reject</button></div> : <span className="muted">Decision sent</span>}</td><td className="muted">{fmt(b.created_at)}</td></tr>)}</tbody></table></div>{filtered.length === 0 && <div className="empty">No bookings yet.</div>}</section>
    </main>
  </>;
}
