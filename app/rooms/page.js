'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import './rooms.css';

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/rooms')
      .then(res => res.json())
      .then(data => setRooms(data.rooms || []))
      .catch(() => setRooms([]))
      .finally(() => setLoading(false));
  }, []);

  return <>
    <nav className="rooms-nav"><div className="rooms-nav-inner">
      <Link className="rooms-logo" href="/"><Image src="/logo.jpg" alt="Atithi logo" width={44} height={44} /><span><strong>Atithi</strong><small>Restro &amp; Lodge</small></span></Link>
      <div><Link href="/">Home</Link><Link href="/loc">Locations</Link><Link href="/menu">Menu</Link><Link className="rooms-book" href="/#booking">Book a Room</Link></div>
    </div></nav>
    <main className="rooms-page">
      <section className="rooms-hero"><p>Stay with us</p><h1>Our Rooms</h1><span>Comfortable spaces, clear prices, and warm Nepali hospitality.</span></section>
      <section className="rooms-content">
        {loading && <p className="rooms-status">Loading rooms…</p>}
        {!loading && rooms.length === 0 && <div className="rooms-empty"><span>🛏️</span><h2>Rooms coming soon</h2><p>Please contact us for current room availability and prices.</p><Link href="/#booking">Request a booking</Link></div>}
        <div className="rooms-grid">{rooms.filter(room => room.is_available).map(room => <article className="room-card" key={room.id}>
          <div className="room-image">{room.image_url ? <img src={room.image_url} alt={room.name} /> : <div className="room-placeholder">🛏️</div>}<span>Available</span></div>
          <div className="room-info"><div className="room-title"><h2>{room.name}</h2><strong>NPR {Number(room.price).toLocaleString()}<small> / night</small></strong></div>
            {room.description && <p>{room.description}</p>}
            <div className="room-meta">{room.capacity && <span>👥 {room.capacity}</span>}{(room.amenities || []).map(item => <span key={item}>✓ {item}</span>)}</div>
            <Link href="/#booking">Book this room →</Link>
          </div>
        </article>)}</div>
      </section>
    </main>
  </>;
}
