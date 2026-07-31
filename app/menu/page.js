'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import './menu.css';
import { supabase } from '@/lib/supabase';

const sections = {
  'hot-bev': {label:'Hot Beverages',icon:'☕',items:[{n:'Black Tea',p:25},{n:'Milk Tea',p:40},{n:'Black Coffee',p:100},{n:'Milk Coffee',p:120},{n:'Lemon Tea',p:30},{n:'Hot Lemon',p:80},{n:'Special Tea',p:60}]},
  'breakfast': {label:'Breakfast',icon:'🍳',items:[{n:'Puri Sabji',p:150},{n:'Bread Omelette',p:200},{n:'Bread Toast with Honey',p:80},{n:'Butter Toast',p:120},{n:'Plain Omelette',p:80,note:'Masala: NPR 100'}]},
  'khana': {label:'Khana Sets',icon:'🍱',items:[{n:'Veg Khana Set',p:250},{n:'Chicken Khana Set',p:300},{n:'Mutton Khana Set',p:390},{n:'Fish Khana Set',p:300},{n:'Pork Khana Set',p:350}]},
  'fried-rice': {label:'Fried Rice',icon:'🍚',items:[{n:'Veg Fried Rice',p:150},{n:'Egg Fried Rice',p:170},{n:'Chicken Fried Rice',p:190},{n:'Mutton Fried Rice',p:220},{n:'Pork Fried Rice',p:200},{n:'Mix Fried Rice',p:250},{n:'Schezwan Peri Peri Rice',p:200},{n:'Triple Schezwan',p:250}]},
  'momo': {label:'Mo:Mo',icon:'🥟',items:[{n:'Jhol Mo:Mo (Veg)',p:180},{n:'Jhol Mo:Mo (Chicken)',p:200},{n:'Sadeko Mo:Mo (Veg)',p:160},{n:'Sadeko Mo:Mo (Chicken)',p:180},{n:'Steamed Mo:Mo (Veg)',p:150},{n:'Steamed Mo:Mo (Chicken)',p:180},{n:'Choila Mo:Mo (Veg)',p:180},{n:'Choila Mo:Mo (Chicken)',p:200}]},
  'sekuwa': {label:'Sekuwa & Poleko',icon:'🍖',items:[{n:'Chicken Sekuwa',p:320},{n:'Chicken Wings Poleko',p:320},{n:'Mutton Sekuwa',p:380},{n:'Pork Sekuwa',p:350},{n:'Pork Sekuwa (Per KG)',p:900}]},
  'nepali-snacks': {label:'Nepali Snacks',icon:'🥗',items:[{n:'Chicken Choila',p:290},{n:'Mutton Choila',p:400},{n:'Chicken Boil Sadeko',p:320},{n:'Aloo Jira',p:160},{n:'Masala Fried Potato',p:180},{n:'Piro Aloo',p:140},{n:'Mutton Boil',p:350},{n:'Onion Pakauda',p:160},{n:'Mutton Sadeko',p:380}]},
  'chinese': {label:'Chinese',icon:'🥢',items:[{n:'Black Pepper Chicken',p:320},{n:'Garlic Chicken',p:320},{n:'Special Wings',p:340},{n:'Chicken Lollipop',p:320},{n:'Chicken Chilli',p:320},{n:'Schezwan Chicken',p:320},{n:'Mushroom Chilli',p:280},{n:'Chicken 65',p:340},{n:'KFC Chicken',p:380}]},
  'sadeko': {label:'Sadeko & Snacks',icon:'🥜',items:[{n:'Bhatmas Sadeko',p:150},{n:'Penut Sadeko',p:170},{n:'Masala Papad',p:120},{n:'Kaju Sadeko',p:350},{n:'Fried Kaju',p:300},{n:'Special Pork Sadeko',p:300}]},
  'soup': {label:'Soups',icon:'🍲',items:[{n:'Veg Soup',p:150},{n:'Mushroom Soup',p:170},{n:'Chicken Soup',p:180},{n:'Mutton Soup',p:300},{n:'Mix Soup',p:250},{n:'Chicken Mushroom Soup',p:230},{n:'Hot & Sour Soup',p:180},{n:'Manchow Soup',p:200}]},
  'noodles': {label:'Noodles',icon:'🍜',items:[{n:'Veg Noodles',p:150},{n:'Chicken Noodles',p:180},{n:'Egg Noodles',p:170},{n:'Mutton Noodles',p:200},{n:'Mix Noodles',p:250},{n:'Chicken Keema Noodles',p:280},{n:'Schezwan Noodles',p:250}]},
  'biryani': {label:'Biryani',icon:'🍛',items:[{n:'Veg Biryani',p:280},{n:'Chicken Biryani',p:380},{n:'Egg Biryani',p:350},{n:'Mutton Biryani',p:450}]},
  'cold-bev': {label:'Cold Beverages',icon:'🥤',items:[{n:'Redbull Red',p:160},{n:'Cocacola (225ml)',p:70},{n:'Sprite (225ml)',p:70},{n:'Badam Juice',p:160},{n:'Apple Slider',p:290},{n:'Water (1 Ltr.)',p:30},{n:'Xtreem',p:170}]},
};

const ALL_CATS = Object.keys(sections);

const GROUPS = [
  { id: 'beverages', label: 'Beverages', icon: '🥤', cats: ['hot-bev', 'cold-bev'] },
  { id: 'breakfast', label: 'Breakfast', icon: '🍳', cats: ['breakfast'] },
  { id: 'meals', label: 'Meals & Rice', icon: '🍛', cats: ['khana', 'fried-rice', 'biryani', 'noodles'] },
  { id: 'momo', label: 'Mo:Mo', icon: '🥟', cats: ['momo'] },
  { id: 'sekuwa', label: 'Sekuwa & Grill', icon: '🍖', cats: ['sekuwa'] },
  { id: 'snacks', label: 'Nepali Snacks', icon: '🥗', cats: ['nepali-snacks', 'sadeko'] },
  { id: 'chinese', label: 'Chinese', icon: '🥢', cats: ['chinese'] },
  { id: 'soup', label: 'Soups', icon: '🍲', cats: ['soup'] },
];

export default function MenuPage() {
  const [cart, setCart] = useState({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState('beverages');
  const [activeCat, setActiveCat] = useState('hot-bev');
  const [currentUser, setCurrentUser] = useState(null);

  function selectGroup(group) {
    setActiveGroup(group.id);
    setActiveCat(group.cats[0]);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setCurrentUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setCurrentUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  function requireSignIn() {
    if (currentUser) return true;
    alert('Please sign up first.');
    window.location.href = '/';
    return false;
  }

  function addItem(name, price) {
    setCart(c => {
      const curr = c[name] || {qty:0,price,total:0};
      return {...c, [name]:{qty:curr.qty+1, price, total:curr.total+price}};
    });
  }
  function removeItem(name, price) {
    setCart(c => {
      if (!c[name]) return c;
      const next = {...c};
      next[name] = {...next[name], qty:next[name].qty-1, total:next[name].total-price};
      if (next[name].qty <= 0) delete next[name];
      return next;
    });
  }
  const cartCount = Object.values(cart).reduce((a,v)=>a+v.qty,0);
  const cartTotal = Object.values(cart).reduce((a,v)=>a+v.total,0);

  function orderWhatsApp() {
    if (!requireSignIn()) return;
    if (Object.keys(cart).length === 0) {
      alert('Please add food items before placing an order.');
      return;
    }
    const items = Object.entries(cart).map(([k,v])=>`${k} x${v.qty} = NPR ${v.total}`).join('\n');
    const msg = encodeURIComponent(`*Food Pre-Order — Atithi Restro*\n\n${items}\n\n*Total: NPR ${cartTotal}*\n\nPlease confirm my order.`);
    window.open(`https://wa.me/9779828776126?text=${msg}`, '_blank');
  }

  return (
    <>
      {/* NAV */}
      <nav>
        <div className="nav-inner">
          <Link className="nav-logo" href="/">
            <Image src="/logo.jpg" alt="Logo" width={44} height={44} style={{borderRadius:'50%',objectFit:'cover',border:'2px solid #F5A623'}} />
            <div className="nav-brand"><strong>Atithi Restro &amp; Lodge</strong><span>Menu</span></div>
          </Link>
          <div className="nav-right">
            <Link href="/">Home</Link>
            <Link href="/loc">Locations</Link>
            <Link href="/rooms">Rooms</Link>
            <Link href="/#booking" className="nav-book">Book a Room</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div className="menu-hero">
        <span className="menu-eyebrow">✦ Fresh Daily &middot; Made to Order</span>
        <h1>Our Menu</h1>
        <p>Authentic Nepali cuisine prepared with love and fresh ingredients</p>
        <div className="branch-preface">
          <div className="branch-card">
            <span className="branch-label">Laxmipur, Jhapa Branch</span>
            <span><a href="tel:9828776126">9828776126</a></span>
          </div>
          <div style={{width:1,background:'rgba(255,255,255,0.15)',margin:'0 8px'}} />
          <div className="branch-card">
            <span className="branch-label">Birtamod Branch</span>
            <span><a href="tel:9705557306">9705557306</a></span>
          </div>
        </div>
      </div>

      {/* STICKY CATEGORIES */}
      <div className="sticky-cats">
        <div className="group-tabs">
          {GROUPS.map(group => (
            <button key={group.id} className={`group-pill${activeGroup===group.id?' active':''}`} onClick={() => selectGroup(group)}>
              {group.icon} {group.label}
            </button>
          ))}
        </div>
        <div className="cat-tabs">
          {GROUPS.find(group => group.id === activeGroup).cats.map(cat => (
            <button key={cat} className={`cat-pill${activeCat===cat?' active':''}`} onClick={() => setActiveCat(cat)}>
              {sections[cat].icon} {sections[cat].label}
            </button>
          ))}
        </div>
      </div>

      {/* MENU ITEMS */}
      <div className="menu-body">
        {ALL_CATS.map(catKey => {
          const sec = sections[catKey];
          return (
            <div key={catKey} className="menu-section" id={catKey} style={{display:activeCat===catKey||activeCat==='all'?'block':'none'}}>
              <div className="ms-header">
                <span className="ms-icon">{sec.icon}</span>
                <span className="ms-title">{sec.label}</span>
                <span className="ms-count">{sec.items.length} items</span>
              </div>
              <div className="items-grid">
                {sec.items.map(item => {
                  const qty = cart[item.n]?.qty || 0;
                  return (
                    <div key={item.n} className="item-card">
                      <div>
                        <div className="item-name">{item.n}</div>
                        {item.note && <div className="item-note">{item.note}</div>}
                      </div>
                      <div className="item-right">
                        <div className="item-price">NPR {item.p}</div>
                        <div className="qty-ctrl">
                          {qty === 0 ? (
                            <button className="add-btn" onClick={() => addItem(item.n, item.p)}>+</button>
                          ) : (
                            <>
                              <button className="remove-btn" onClick={() => removeItem(item.n, item.p)}>−</button>
                              <span className="qty-num">{qty}</span>
                              <button className="add-btn" onClick={() => addItem(item.n, item.p)}>+</button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* CART BUTTON */}
      <button className="cart-float" onClick={() => setDrawerOpen(true)}>
        🛒 View Cart
        <span className="cart-count">{cartCount}</span>
      </button>

      {/* CART DRAWER */}
      <div className={`overlay${drawerOpen?' show':''}`} onClick={() => setDrawerOpen(false)} />
      <div className={`cart-drawer${drawerOpen?' open':''}`}>
        <div className="cart-header">
          <h3>Your Order</h3>
          <button className="close-cart" onClick={() => setDrawerOpen(false)}>×</button>
        </div>
        <div className="cart-items">
          {Object.keys(cart).length === 0 ? (
            <div className="empty-cart"><div>🛒</div><p>No items added yet</p></div>
          ) : Object.entries(cart).map(([name, v]) => (
            <div key={name} className="cart-item">
              <div><div className="ci-name">{name}</div><div className="ci-price">NPR {v.price} × {v.qty}</div></div>
              <div className="ci-total">NPR {v.total}</div>
            </div>
          ))}
        </div>
        <div className="cart-footer">
          <div className="cart-total-row"><span>Total</span><span>NPR {cartTotal}</span></div>
          <button className="checkout-now" onClick={() => {
            if (!requireSignIn()) return;
            if (Object.keys(cart).length === 0) {
              alert('Please add food items before placing an order.');
              return;
            }
            const orders = JSON.parse(localStorage.getItem('atithi_food_orders')||'[]');
            const items = Object.entries(cart).map(([k,v])=>({name:k,...v}));
            orders.push({id:'FO'+Date.now(),items,total:cartTotal,email:currentUser.email,status:'Pending',created:new Date().toISOString()});
            localStorage.setItem('atithi_food_orders', JSON.stringify(orders));
            alert('Order placed! Total: NPR '+cartTotal+'\nWe will confirm shortly.');
            setCart({}); setDrawerOpen(false);
          }}>Place Order</button>
          <button className="wa-order" onClick={orderWhatsApp}>
            <svg width="18" height="18" fill="white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/><path d="M12.05 2C6.495 2 2 6.507 2 12.067c0 1.903.504 3.683 1.376 5.224L2 22l4.85-1.273a9.98 9.98 0 0 0 5.2 1.446C17.554 22.173 22 17.666 22 12.106 22 6.547 17.605 2 12.05 2"/></svg>
            Order via WhatsApp
          </button>
        </div>
      </div>
    </>
  );
}
