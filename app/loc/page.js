'use client';
import Link from 'next/link';
import Image from 'next/image';
import './loc.css';

const branches = [
  {
    num: '01',
    name: 'Laxmipur, Jhapa',
    tag: 'Main Branch',
    address: 'Laxmipur, Jhapa',
    phones: ['9828776126'],
    hours: '6:00 AM – 10:00 PM',
    mapLink: 'https://www.google.com/maps/search/?api=1&query=Laxmipur%2C%20Jhapa%2C%20Nepal',
  },
  {
    num: '02',
    name: 'Birtamod',
    tag: 'New Branch',
    address: 'Birtamod, Jhapa',
    phones: ['9705557306'],
    hours: '7:00 AM – 10:00 PM',
    mapLink: 'https://www.google.com/maps/search/?api=1&query=Birtamod%2C%20Jhapa%2C%20Nepal',
  },
];

export default function LocPage() {
  return (
    <>
      {/* NAV */}
      <nav id="navbar">
        <div className="nav-inner">
          <Link className="nav-logo" href="/">
            <div className="logo-wrap">
              <Image src="/logo.jpg" alt="Atithi Logo" width={50} height={50} style={{borderRadius:'50%',objectFit:'cover'}} />
            </div>
            <div className="brand-text">
              <strong>Atithi</strong>
              <span>Restro &amp; Lodge</span>
            </div>
          </Link>
          <ul className="nav-links">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/loc">Locations</Link></li>
            <li><Link href="/menu">Menu</Link></li>
            <li><Link href="/rooms">Rooms</Link></li>
            <li><Link href="/#booking" className="nav-cta">Book Now</Link></li>
          </ul>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="orb orb1"/><div className="orb orb2"/>
        <div className="hero-content">
          <div className="hero-badge"><span>📍</span> Find Us Near You</div>
          <h1>Our <em>Locations</em></h1>
          <p className="hero-tagline">Two Branches, One Heart</p>
          <p className="hero-desc">
            Visit us at either of our two branches in Laxmipur, Jhapa and Birtamod. We are always ready to serve you with the best of Nepali hospitality.
          </p>
          <div className="hero-actions">
            <Link href="/#booking" className="btn-3d btn-gold-3d">Book a Room</Link>
            <Link href="/menu" className="btn-3d btn-ghost-3d">View Menu</Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="logo-3d">
            <div className="logo-3d-ring"/><div className="logo-3d-ring2"/><div className="logo-glow"/>
            <Image className="logo-3d-img" src="/logo.jpg" alt="Atithi" width={360} height={360} style={{borderRadius:'50%',objectFit:'cover'}} />
          </div>
        </div>
      </section>

      {/* BRANCHES */}
      <section className="section-wrap" id="branches">
        <div className="s-eyebrow">All Branches</div>
        <h2 className="s-title">Visit Us Today</h2>
        <p className="s-sub">Both our branches offer the full Atithi experience — warm hospitality, authentic food, and comfortable accommodation.</p>
        <div className="branches-grid">
          {branches.map(b => (
            <div className="branch-card-3d" key={b.num}>
              <div className="bc-top">
                <div className="bc-num">Branch {b.num}</div>
                <div className="bc-name">{b.name}</div>
                <div className="bc-tag">{b.tag}</div>
              </div>
              <div className="bc-body">
                <div className="bc-row">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
                  <div><strong>Address</strong>{b.address}</div>
                </div>
                <div className="bc-row">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <div><strong>Hours</strong>{b.hours}</div>
                </div>
                <div className="bc-phones">
                  {b.phones.map(ph => (
                    <a key={ph} href={`tel:${ph}`} className="ph-btn">📞 {ph}</a>
                  ))}
                  <a href={b.mapLink} target="_blank" rel="noreferrer" className="ph-btn">🗺️ Map</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BOOKING CTA */}
      <section className="section-wrap booking-section" style={{paddingTop:64,paddingBottom:64}}>
        <div style={{textAlign:'center',position:'relative',zIndex:2}}>
          <div className="s-eyebrow" style={{color:'rgba(245,166,35,0.9)',justifyContent:'center'}}>Ready to Visit?</div>
          <h2 className="s-title" style={{color:'#fff',textAlign:'center'}}>Book Your Stay Today</h2>
          <p className="s-sub" style={{color:'rgba(255,255,255,0.6)',textAlign:'center',maxWidth:480,margin:'0 auto 32px'}}>
            Reserve a room at either of our branches and enjoy the full Atithi experience.
          </p>
          <div style={{display:'flex',gap:16,justifyContent:'center',flexWrap:'wrap'}}>
            <Link href="/#booking" className="btn-3d btn-gold-3d">Book a Room</Link>
            <a href="https://wa.me/9779828776126" target="_blank" rel="noreferrer" className="btn-3d btn-ghost-3d" style={{color:'#fff',border:'1px solid rgba(255,255,255,0.25)'}}>WhatsApp Us</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo-wrap">
              <Image src="/logo.jpg" alt="Atithi" width={52} height={52} style={{borderRadius:'50%',objectFit:'cover'}} />
            </div>
            <p>Atithi Restro &amp; Lodge — Where every guest is treated like family.</p>
          </div>
          <div className="footer-col">
            <h5>Quick Links</h5>
            <ul><li><Link href="/">Home</Link></li><li><Link href="/loc">Locations</Link></li><li><Link href="/menu">Menu</Link></li><li><Link href="/rooms">Rooms</Link></li></ul>
          </div>
          <div className="footer-col">
            <h5>Contact</h5>
            <ul><li><a href="tel:9828776126">9828776126</a></li><li><a href="tel:9705557306">9705557306</a></li></ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">© 2025 Atithi Restro &amp; Lodge. All rights reserved.</div>
          <div className="footer-motto">Atithi Devo Bhava</div>
        </div>
      </footer>
    </>
  );
}
