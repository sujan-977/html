'use client';
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link';
import Image from 'next/image';
import './home.css';
import { supabase } from '@/lib/supabase'

const menuItems = [
  {n:"Puri Sabji",p:150,cat:"breakfast"},{n:"Bread Omelette",p:200,cat:"breakfast"},
  {n:"Butter Toast",p:120,cat:"breakfast"},{n:"Masala Omelette",p:100,cat:"breakfast"},
  {n:"Veg Khana Set",p:250,cat:"khana"},{n:"Chicken Khana Set",p:300,cat:"khana"},
  {n:"Mutton Khana Set",p:390,cat:"khana"},{n:"Fish Khana Set",p:300,cat:"khana"},
  {n:"Pork Khana Set",p:350,cat:"khana"},
  {n:"Steamed Mo:Mo (Veg)",p:150,cat:"momo"},{n:"Jhol Mo:Mo",p:180,cat:"momo"},
  {n:"Sadeko Mo:Mo",p:160,cat:"momo"},{n:"Choila Mo:Mo",p:180,cat:"momo"},
  {n:"Chicken Choila",p:290,cat:"snacks"},{n:"Chicken Sekuwa",p:320,cat:"snacks"},
  {n:"Mutton Choila",p:400,cat:"snacks"},{n:"Bhatmas Sadeko",p:150,cat:"snacks"},
  {n:"Chicken Lollipop",p:320,cat:"snacks"},
  {n:"Black Tea",p:25,cat:"drinks"},{n:"Milk Tea",p:40,cat:"drinks"},
  {n:"Milk Coffee",p:120,cat:"drinks"},{n:"Redbull",p:160,cat:"drinks"},
  {n:"Cocacola",p:70,cat:"drinks"},{n:"Badam Juice",p:160,cat:"drinks"},
];

const offers = [
  {icon:"🛏️🍽️", title:"Stay & Dine Combo", desc:"Book any room for 2 nights or more and enjoy a complimentary breakfast set every morning of your stay.", badge:"Popular"},
  {icon:"📅", title:"Weekday Getaway", desc:"Save on room rates when you check in Sunday through Thursday. Ask us for the current weekday rate."},
  {icon:"👨‍👩‍👧‍👦", title:"Family Feast Package", desc:"Book a Family Room and get a free Mo:Mo platter for the table — perfect for family trips."},
];

const reviews = [
  {name:"Ramesh Shrestha",loc:"Kathmandu",stars:5,text:"Amazing food and very cozy rooms. The staff is incredibly welcoming. Will definitely come back!"},
  {name:"Sita Gurung",loc:"Pokhara",stars:5,text:"The momo and chicken sekuwa are absolutely delicious. Best restro in the area without doubt."},
  {name:"Hari Thapa",loc:"Chitwan",stars:5,text:"Stayed for 3 nights, room was clean and comfortable. The breakfast is wonderful. Highly recommended!"},
];

const bsMonthNames = ['Baishakh', 'Jestha', 'Asar', 'Shrawan', 'Bhadra', 'Ashoj', 'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'];
const bsMonthDays = [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 30];

function getTodayBs() {
  try {
    const formatter = new Intl.DateTimeFormat('en-NP-u-ca-bikram-sambat', { year: 'numeric', month: 'numeric', day: 'numeric' });
    if (formatter.resolvedOptions().calendar !== 'bikram-sambat') throw new Error('Bikram Sambat calendar is unavailable');
    const parts = formatter.formatToParts(new Date());
    const value = type => Number(parts.find(part => part.type === type)?.value);
    const year = value('year'), month = value('month'), day = value('day');
    if (year && month && day) return { year, month, day };
  } catch {}

  // Fallback for browsers without the Bikram Sambat Intl calendar. 2083-01-01 BS is 14 April 2026.
  const anchor = Date.UTC(2026, 3, 14);
  let remaining = Math.floor((Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()) - anchor) / 86400000);
  let year = 2083, month = 1, day = 1;
  while (remaining > 0) {
    day += 1;
    if (day > bsMonthDays[month - 1]) { day = 1; month += 1; }
    if (month > 12) { month = 1; year += 1; }
    remaining -= 1;
  }
  return { year, month, day };
}

function bsValue({ year, month, day }) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function nextBsValue(value) {
  let [year, month, day] = value.split('-').map(Number);
  day += 1;
  if (day > bsMonthDays[month - 1]) {
    day = 1;
    month += 1;
    if (month > 12) { month = 1; year += 1; }
  }
  return bsValue({ year, month, day });
}

function BsDatePicker({ label, value, onChange, minValue }) {
  const minimum = minValue || bsValue(getTodayBs());
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => { const [year, month] = value.split('-').map(Number); return { year, month }; });
  const [year, month, day] = value.split('-').map(Number);
  const [minYear, minMonth] = minimum.split('-').map(Number);
  const changeMonth = direction => setView(current => {
    const total = current.year * 12 + current.month - 1 + direction;
    const next = { year: Math.floor(total / 12), month: (total % 12) + 1 };
    return next.year < minYear || (next.year === minYear && next.month < minMonth) ? current : next;
  });
  const blanks = Array.from({ length: new Date(view.year - 57, view.month - 1, 1).getDay() });
  const choose = pickedDay => { onChange(bsValue({ year: view.year, month: view.month, day: pickedDay })); setOpen(false); };

  return <div className="fg bs-date-picker">
    <label>{label} <span>BS</span></label>
    <button type="button" className="bs-date-trigger" onClick={() => setOpen(!open)} aria-expanded={open}>
      <span>▣</span>{day} {bsMonthNames[month - 1]} {year} BS
    </button>
    {open && <div className="bs-calendar">
      <div className="bs-calendar-head"><button type="button" onClick={() => changeMonth(-1)} disabled={view.year === minYear && view.month === minMonth}>‹</button><strong>{bsMonthNames[view.month - 1]} {view.year}</strong><button type="button" onClick={() => changeMonth(1)}>›</button></div>
      <div className="bs-weekdays">{['S','M','T','W','T','F','S'].map((item, index) => <span key={`${item}${index}`}>{item}</span>)}</div>
      <div className="bs-days">{blanks.map((_, index) => <i key={`blank${index}`} />)}{Array.from({ length: bsMonthDays[view.month - 1] }, (_, index) => index + 1).map(item => {
        const date = bsValue({ year: view.year, month: view.month, day: item });
        return <button type="button" key={item} disabled={date < minimum} className={date === value ? 'selected' : ''} onClick={() => choose(item)}>{item}</button>;
      })}</div>
    </div>}
  </div>;
}

function bsNights(start, end) {
  let cursor = start, nights = 0;
  while (cursor < end && nights < 800) { cursor = nextBsValue(cursor); nights += 1; }
  return nights;
}

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [menuCat, setMenuCat] = useState('all');
  const [selPayment, setSelPayment] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMsg, setModalMsg] = useState('');
  const [showAuth, setShowAuth] = useState(false);
  const [authTab, setAuthTab] = useState('signup');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [waLink, setWaLink] = useState('');
  const [user, setUser] = useState(null)
  const [todayBs] = useState(() => bsValue(getTodayBs()));
  const [checkinBs, setCheckinBs] = useState(() => bsValue(getTodayBs()));
  const [checkoutBs, setCheckoutBs] = useState(() => nextBsValue(bsValue(getTodayBs())));
  const [checkinTime, setCheckinTime] = useState('14:00');
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [previewRooms, setPreviewRooms] = useState([]);

  useEffect(() => {
    fetch('/api/rooms')
      .then(res => res.json())
      .then(data => setPreviewRooms((data.rooms || []).filter(room => room.is_available)))
      .catch(() => setPreviewRooms([]));
  }, []);

  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession()
      const signedInUser = session?.user ?? null

      setUser(signedInUser)
      setCurrentUser(signedInUser ? { ...signedInUser, token: session.access_token } : null)
    }

  loadUser()
  }, [])

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const signedInUser = session?.user ?? null
      setUser(signedInUser)
      setCurrentUser(signedInUser ? { ...signedInUser, token: session.access_token } : null)

      if (session) setShowAuth(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const filteredMenu = menuCat === 'all' ? menuItems : menuItems.filter(i => i.cat === menuCat);

  async function handleAuth(mode) {
  if (isAuthLoading) return

  if (mode === 'signup' && currentUser) {
    alert('You are already logged in. Please sign out before creating another account.')
    return
  }

  if (!authEmail || !authPassword) {
    alert('Please enter your email and password.')
    return
  }

  if (authPassword.length < 6) {
    alert('Password must be at least 6 characters.')
    return
  }

  setIsAuthLoading(true)
  try {
    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email: authEmail,
        password: authPassword,
      })

      if (error) {
        alert(error.message)
        return
      }

      alert("Account created successfully! Please sign in.")
      setAuthTab('login')
      setAuthPassword('')
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword,
      })
      if (error) {
        alert(error.message)
        return
      }

      setUser(data.user)
      setCurrentUser({ ...data.user, token: data.session?.access_token })
      console.log('Logged in user:', data.user)

      alert('Welcome back!')

      setShowAuth(false)

      setAuthEmail('')
      setAuthPassword('')
    }
  } catch (err) {
    alert(err.message)
  } finally {
    setIsAuthLoading(false)
  }
}

  async function signOut() {
    setAccountMenuOpen(false)
    const { error } = await supabase.auth.signOut()
    if (error) {
      alert(error.message)
      return
    }
    setCurrentUser(null)
    setUser(null)
    setMobileOpen(false)
  }

  function requireSignIn() {
    if (currentUser) return true
    alert('Please sign up first.')
    setAuthTab('signup')
    setShowAuth(true)
    return false
  }

  

  async function submitBooking() {
    if (!requireSignIn()) return;
    if (isBookingLoading) return;
    const name = document.getElementById('f-name').value.trim();
    const phone = document.getElementById('f-phone').value.trim();
    const branch = document.getElementById('f-branch').value;
    const checkin = checkinBs;
    const checkout = checkoutBs;
    const room = document.getElementById('f-room').value;
    const guests = document.getElementById('f-guests').value;
    const food = document.getElementById('f-food').value;
    if (!name || !phone || !branch || !checkin || !checkout || !room) {
      alert('Please fill in all required fields.'); return;
    }
    if (checkin < todayBs || checkout < todayBs) {
      alert('Please choose today or a future date.'); return;
    }
    if (checkout <= checkin) {
      alert('Check-out must be after check-in.'); return;
    }
    const booking = {
      name,
      phone,
      email: currentUser.email,
      branch,
      checkin,
      checkout,
      checkinTime,
      room,
      guests,
      food,
      payment: selPayment,
      status: 'Pending',
      created: new Date().toISOString(),
    };
    const msg = encodeURIComponent("*New Booking — Atithi Restro & Lodge*\nName: "+name+"\nEmail: "+currentUser.email+"\nPhone: "+phone+"\nBranch: "+branch+"\nCheck-in (BS): "+checkin+" at "+checkinTime+"\nCheck-out (BS): "+checkout+"\nStay: "+bsNights(checkin, checkout)+" night(s)\nRoom: "+room+"\nGuests: "+guests+"\nFood: "+(food||"None")+"\nPayment: "+(booking.payment || "Not selected"));
    setWaLink("https://wa.me/9779828776126?text="+msg);
    setIsBookingLoading(true);
    try {
      const res = await fetch('/api/bookings', {
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':'Bearer '+currentUser.token},
        body:JSON.stringify(booking)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save the booking.');
      setModalMsg("Thank you "+name+"! Your booking has been saved successfully. We will confirm it at "+currentUser.email+".");
    } catch(err) {
      setModalMsg(err.message || 'We could not save your booking. Please try again or contact us directly.');
    } finally {
      setIsBookingLoading(false);
      setShowModal(true);
    }
  }

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
            <li><Link href="/#booking">Book Now</Link></li>
          </ul>
          <div style={{display:'flex',gap:8,alignItems:'center',position:'relative'}}>
            {currentUser ? (
              <>
                <button className="account-btn signed" onClick={() => setAccountMenuOpen(open => !open)} aria-expanded={accountMenuOpen}>
                  {currentUser.email.split('@')[0]}
                </button>
                {accountMenuOpen && <div className="account-menu">
                  <strong>Signed in</strong>
                  <span>{currentUser.email}</span>
                  <button onClick={signOut}>Sign out</button>
                </div>}
              </>
            ) : (
              <button className="account-btn" onClick={() => setShowAuth(true)}>Sign In</button>
            )}
          </div>
          <button className="hamburger" onClick={() => setMobileOpen(o => !o)} aria-label="Menu">
            <span/><span/><span/>
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div id="mobile-menu" className={`mobile-menu${mobileOpen?' open':''}`}>
        <Link href="/" onClick={() => setMobileOpen(false)}>Home</Link>
        <Link href="/loc" onClick={() => setMobileOpen(false)}>Locations</Link>
        <Link href="/menu" onClick={() => setMobileOpen(false)}>Full Menu</Link>
        <Link href="/rooms" onClick={() => setMobileOpen(false)}>Our Rooms</Link>
        <Link href="/#booking" className="m-cta" onClick={() => setMobileOpen(false)}>Book a Room</Link>
        {currentUser ? (
          <div className="mobile-account">
            <span>Signed in as {currentUser.email}</span>
            <button onClick={signOut}>Sign out</button>
          </div>
        ) : (
          <button className="mobile-sign-in" onClick={() => { setMobileOpen(false); setAuthTab('login'); setShowAuth(true); }}>Sign In</button>
        )}
      </div>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="orb orb1"/><div className="orb orb2"/>
        <div className="hero-content">
          <div className="hero-badge">
            <span>⭐</span> Authentic Nepali Experience
          </div>
          <h1>Where Every Guest<br/>is <em>Family</em></h1>
          <p className="hero-tagline">Atithi Devo Bhava — Guest is God</p>
          <p className="hero-desc">Experience the warmth of Nepali hospitality at Atithi Restro &amp; Lodge. Savor authentic cuisine, enjoy comfortable rooms, and create memories that last a lifetime.</p>
          <div className="hero-actions">
            <a href="#booking" className="btn-3d btn-gold-3d">Book a Room</a>
            <Link href="/menu" className="btn-3d btn-ghost-3d">View Menu</Link>
          </div>
          <div className="hero-stats">
            <div className="stat-item"><div className="stat-num">2+</div><div className="stat-lbl">Branches</div></div>
            <div className="stat-item"><div className="stat-num">500+</div><div className="stat-lbl">Happy Guests</div></div>
            <div className="stat-item"><div className="stat-num">50+</div><div className="stat-lbl">Menu Items</div></div>
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
      <section className="section-wrap" id="locations">
        <div className="s-eyebrow">Our Locations</div>
        <h2 className="s-title">Two Branches, One Heart</h2>
        <p className="s-sub">Visit us at either of our two branches in Laxmipur, Jhapa and Birtamod.</p>
        <div className="branches-grid">
          {/* Branch 1 */}
          <div className="branch-card-3d">
            <div className="bc-top">
              <div className="bc-num">Branch 01</div>
              <div className="bc-name">Laxmipur, Jhapa</div>
              <div className="bc-tag">Main Branch</div>
            </div>
            <div className="bc-body">
              <div className="bc-row">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
                <div><strong>Address</strong>Laxmipur, Jhapa</div>
              </div>
              <div className="bc-phones">
                <a href="tel:9828776126" className="ph-btn">📞 9828776126</a>
                <a href="https://www.google.com/maps/search/?api=1&query=Laxmipur%2C%20Jhapa%2C%20Nepal" target="_blank" rel="noreferrer" className="ph-btn">🗺️ Map</a>
              </div>
            </div>
          </div>
          {/* Branch 2 */}
          <div className="branch-card-3d">
            <div className="bc-top">
              <div className="bc-num">Branch 02</div>
              <div className="bc-name">Birtamod</div>
              <div className="bc-tag">New Branch</div>
            </div>
            <div className="bc-body">
              <div className="bc-row">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
                <div><strong>Address</strong>Birtamod, Jhapa</div>
              </div>
              <div className="bc-phones">
                <a href="tel:9705557306" className="ph-btn">📞 9705557306</a>
                <a href="https://www.google.com/maps/search/?api=1&query=Birtamod%2C%20Jhapa%2C%20Nepal" target="_blank" rel="noreferrer" className="ph-btn">🗺️ Map</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BOOKING */}
      <section className="section-wrap booking-section" id="booking">
        <div className="booking-grid">
          <div>
            <div className="s-eyebrow" style={{color:'rgba(245,166,35,0.9)'}}>Reserve Your Stay</div>
            <h2 className="s-title" style={{color:'#fff'}}>Book a Room</h2>
            <p className="s-sub" style={{color:'rgba(255,255,255,0.6)'}}>Fill in the form to request a booking. We will confirm your reservation shortly.</p>
            <div className="feat-list" style={{marginTop:28}}>
              {[["🛏️","Comfortable Rooms"],["🍽️","Delicious Food"],["📶","Free WiFi"],["🚿","Hot Shower"],["🅿️","Parking Available"],["🌿","Peaceful Environment"]].map(([ic,lb])=>(
                <div className="feat-row" key={lb}><div className="feat-icon">{ic}</div><span>{lb}</span></div>
              ))}
            </div>
          </div>
          <div className="form-3d">
            <div className="form-title">Room Booking Request</div>
            {currentUser ? (
              <p id="auth-status" style={{fontSize:13,color:'#6b7280',marginBottom:12}}>Signed in as {currentUser.email}</p>
            ) : (
              <p style={{fontSize:13,color:'#e05',marginBottom:12}}>
                Please <button style={{background:'none',border:'none',color:'#1256A8',cursor:'pointer',fontWeight:600,padding:0}} onClick={() => setShowAuth(true)}>sign in</button> to book a room.
              </p>
            )}
            <div className="fg"><label>Full Name</label><input id="f-name" type="text" placeholder="Your full name" /></div>
            <div className="fg"><label>Phone</label><input id="f-phone" type="tel" placeholder="Your phone number" /></div>
            <div className="fg-row">
              <div className="fg"><label>Branch</label>
                <select id="f-branch">
                  <option value="">Select Branch</option>
                  <option>Laxmipur Branch</option>
                  <option>Birtamod Branch</option>
                </select>
              </div>
              <div className="fg"><label>Guests</label>
                <select id="f-guests">
                  {["1","2","3","4","5","6+"].map(n=><option key={n}>{n}</option>)}
                </select>
              </div>
            </div>
            <div className="fg-row">
              <BsDatePicker label="Check-in" value={checkinBs} onChange={next => { setCheckinBs(next); if (checkoutBs <= next) setCheckoutBs(nextBsValue(next)); }} minValue={todayBs} />
              <BsDatePicker label="Check-out" value={checkoutBs} onChange={setCheckoutBs} minValue={checkinBs > todayBs ? checkinBs : todayBs} />
            </div>
            <div className="fg-row booking-details">
              <div className="fg"><label>Check-in Time</label><input type="time" value={checkinTime} onChange={e => setCheckinTime(e.target.value)} /></div>
              <div className="stay-summary"><span>Your stay</span><strong>{bsNights(checkinBs, checkoutBs)} night{bsNights(checkinBs, checkoutBs) === 1 ? '' : 's'}</strong></div>
            </div>
            <div className="fg"><label>Room Type</label>
              <select id="f-room">
                <option value="">Select Room</option>
                <option>Single Room</option><option>Double Room</option><option>Deluxe Room</option><option>Family Room</option>
              </select>
            </div>
            <div className="fg"><label>Food Preference</label>
              <select id="f-food">
                <option value="">No preference</option>
                <option>Veg Khana Set</option><option>Non-Veg Khana Set</option><option>Breakfast Only</option>
              </select>
            </div>
            <div className="fg"><label>Payment Method</label>
              <div className="pay-grid">
                {["eSewa","Khalti","Cash","Bank Transfer"].map(p => (
                  <button key={p} className={`pay-opt${selPayment===p?' sel':''}`} onClick={() => setSelPayment(p)}>{p}</button>
                ))}
              </div>
            </div>
            <button className="submit-3d" onClick={submitBooking} disabled={isBookingLoading}>{isBookingLoading ? 'Sending request…' : 'Request Booking'}</button>
            {waLink && <a id="wa-link" href={waLink} target="_blank" rel="noreferrer" className="wa-3d">
              <svg width="18" height="18" fill="white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12.05 2C6.495 2 2 6.507 2 12.067c0 1.903.504 3.683 1.376 5.224L2 22l4.85-1.273a9.98 9.98 0 0 0 5.2 1.446h.004C17.554 22.173 22 17.666 22 12.106 22 6.547 17.605 2 12.05 2m-.001 18.173a8.306 8.306 0 0 1-4.243-1.162l-.304-.181-3.15.826.842-3.072-.198-.315A8.228 8.228 0 0 1 3.73 12.067c0-4.583 3.73-8.316 8.319-8.316 4.589 0 8.32 3.733 8.32 8.316 0 4.584-3.731 8.106-8.32 8.106"/></svg>
              Send via WhatsApp
            </a>}
          </div>
        </div>
      </section>

      {/* MENU PREVIEW */}
      <section className="section-wrap" id="menu">
        <div className="s-eyebrow">What We Serve</div>
        <h2 className="s-title">Popular Menu Items</h2>
        <div className="menu-tabs">
          {['all','breakfast','khana','momo','snacks','drinks'].map(cat => (
            <button key={cat} className={`mtab${menuCat===cat?' active':''}`} onClick={() => setMenuCat(cat)}>
              {cat==='all'?'All':cat.charAt(0).toUpperCase()+cat.slice(1)}
            </button>
          ))}
        </div>
        <div className="menu-grid-3d" id="menu-grid">
          {filteredMenu.map(i => (
            <div className="mc-3d" key={i.n}>
              <div className="mc-cat-tag">{i.cat}</div>
              <div className="mc-name">{i.n}</div>
              <div className="mc-price">NPR {i.p}</div>
            </div>
          ))}
        </div>
        <Link href="/menu" className="view-menu-3d" style={{marginTop:32,display:'flex',alignItems:'center',justifyContent:'center',gap:10,textDecoration:'none'}}>
          View Full Menu →
        </Link>
      </section>

      {/* ROOMS PREVIEW */}
      <section className="section-wrap" id="rooms">
        <div className="s-eyebrow">Stay With Us</div>
        <h2 className="s-title">Our Rooms</h2>
        {previewRooms.length > 0 ? (
          <>
            <div className="rooms-grid-3d">
              {previewRooms.slice(0, 3).map(room => (
                <div className="rp-3d" key={room.id}>
                  <div className="rp-img">{room.image_url ? <img src={room.image_url} alt={room.name} /> : <span>🛏️</span>}</div>
                  <div className="rp-body">
                    <div className="rp-name">{room.name}</div>
                    <div className="rp-price">NPR {Number(room.price).toLocaleString()}<small> / night</small></div>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/rooms" className="view-menu-3d" style={{marginTop:32,display:'flex',alignItems:'center',justifyContent:'center',gap:10,textDecoration:'none'}}>
              View All Rooms →
            </Link>
          </>
        ) : (
          <p className="rooms-preview-empty">Room photos and prices are coming soon — <Link href="/#booking">contact us to book</Link>.</p>
        )}
      </section>

      {/* OFFERS */}
      <section className="section-wrap offers-section" id="offers">
        <div className="s-eyebrow">Special Offers</div>
        <h2 className="s-title">Sweeten Your Stay</h2>
        <p className="s-sub">Pair your room booking with these deals — ask our team to apply one when you reserve.</p>
        <div className="offers-grid">
          {offers.map(offer => (
            <div className="offer-card-3d" key={offer.title}>
              {offer.badge && <span className="offer-badge">{offer.badge}</span>}
              <div className="offer-icon">{offer.icon}</div>
              <h3 className="offer-title">{offer.title}</h3>
              <p className="offer-desc">{offer.desc}</p>
            </div>
          ))}
        </div>
        <div className="offers-cta-row">
          <a href="#booking" className="btn-3d btn-gold-3d">Claim an Offer</a>
        </div>
      </section>

      {/* GALLERY */}
      <section className="section-wrap gallery-bg" id="gallery">
        <div className="s-eyebrow" style={{color:'rgba(245,166,35,0.9)'}}>Our Space</div>
        <h2 className="s-title" style={{color:'#fff'}}>Explore Our Ambiance</h2>
        <div className="gallery-grid-3d">
          {[["🍽️","Restaurant","gc1"],["🛏️","Rooms","gc2"],["🌿","Garden","gc3"],["🍺","Bar","gc4"],["🎉","Events","gc5"]].map(([icon,lbl,cls])=>(
            <div className={`gc ${cls}`} key={lbl}>
              <div className="gc-overlay"/>
              <div className="gc-inner"><span className="gc-icon">{icon}</span><div className="gc-lbl">{lbl}</div></div>
            </div>
          ))}
        </div>
      </section>

      {/* REVIEWS */}
      <section className="section-wrap" id="reviews">
        <div className="s-eyebrow">Guest Reviews</div>
        <h2 className="s-title">What Our Guests Say</h2>
        <div className="reviews-grid">
          {reviews.map((r,i) => (
            <div className="rv-card" key={i}>
              <div className="rv-quote">&quot;</div>
              <div className="rv-stars">{'★'.repeat(r.stars)}</div>
              <div className="rv-text">{r.text}</div>
              <div className="rv-author">
                <div className="rv-av">{r.name[0]}</div>
                <div><div className="rv-name">{r.name}</div><div className="rv-loc">{r.loc}</div></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo-wrap">
              <Image src="/logo.jpg" alt="Atithi" width={52} height={52} style={{borderRadius:'50%',objectFit:'cover'}} />
            </div>
            <p>Atithi Restro &amp; Lodge — Where every guest is treated like family. Authentic Nepali food and comfortable rooms.</p>
          </div>
          <div className="footer-col">
            <h5>Quick Links</h5>
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/loc">Locations</Link></li>
              <li><Link href="/menu">Menu</Link></li>
              <li><Link href="/rooms">Rooms</Link></li>
              <li><Link href="/online">Online Shop</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Contact</h5>
            <ul>
              <li><a href="tel:9828776126">9828776126</a></li>
              <li><a href="tel:9705557306">9705557306</a></li>
              <li>Laxmipur, Jhapa</li>
              <li>Birtamod, Jhapa</li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Services</h5>
            <ul>
              <li>Room Booking</li><li>Dine In</li><li>Events</li><li>Catering</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">© 2025 Atithi Restro &amp; Lodge. All rights reserved.</div>
          <div className="footer-motto">Atithi Devo Bhava</div>
        </div>
      </footer>

      {/* SUCCESS MODAL */}
      {showModal && (
        <div className="modal-overlay show" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">✓</div>
            <h3>Request received</h3>
            <p id="modal-msg">{modalMsg}</p>
            {waLink && <a href={waLink} target="_blank" rel="noreferrer" className="wa-3d modal-wa">Share on WhatsApp</a>}
            <button className="modal-btn" onClick={() => setShowModal(false)}>Done</button>
          </div>
        </div>
      )}

      {/* AUTH MODAL */}
      {showAuth && (
        <div className="modal-overlay auth-modal show" onClick={() => !isAuthLoading && setShowAuth(false)}>
          <div className="modal-box auth-card" onClick={e => e.stopPropagation()}>
            <div className="auth-head">
              <div className="auth-logo"><Image src="/logo.jpg" alt="Atithi" width={54} height={54} /></div>
              <div>
                <h3>{authTab === 'signup' ? 'Create Account' : 'Welcome Back'}</h3>
                <p>{authTab === 'signup' ? 'Sign up to book a room at Atithi.' : 'Sign in to your Atithi account.'}</p>
              </div>
              <button className="auth-close" onClick={() => setShowAuth(false)} disabled={isAuthLoading} aria-label="Close authentication dialog">×</button>
            </div>
            <div className="auth-tabs">
              <button className={`auth-tab${authTab==='signup'?' active':''}`} onClick={() => setAuthTab('signup')} disabled={isAuthLoading}>Sign Up</button>
              <button className={`auth-tab${authTab==='login'?' active':''}`} onClick={() => setAuthTab('login')} disabled={isAuthLoading}>Sign In</button>
            </div>
            <div className="fg"><label>Email</label>
              <input type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} placeholder="your@email.com" disabled={isAuthLoading} />
            </div>
            <div className="fg"><label>Password</label>
              <input type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} placeholder="Min. 6 characters" disabled={isAuthLoading} />
            </div>
            <div className="auth-actions">
              <button className="auth-btn primary" onClick={() => handleAuth(authTab)} disabled={isAuthLoading} aria-busy={isAuthLoading}>
                {isAuthLoading ? <><span className="auth-spinner" aria-hidden="true" />{authTab === 'signup' ? 'Creating account…' : 'Signing in…'}</> : (authTab === 'signup' ? 'Create Account' : 'Sign In')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
