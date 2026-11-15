/* =====================================================================
   PEPPER — données partagées (site client, écran comptoir, espace gérant)
   Tout est stocké en local (localStorage, clés « ppr- »). Chaque écriture
   est diffusée aux autres onglets (BroadcastChannel) : le client voit sa
   commande avancer dès que la cuisine appuie sur « Prêt ».
   ===================================================================== */
(function () {
  'use strict';
  const D = window.PEPPER_DATA;
  const P = 'ppr-';
  const listeners = [];
  let ch = null;
  try { ch = new BroadcastChannel('ppr-sync'); } catch (e) { /* ancien navigateur */ }

  function read(k, def) { try { const r = localStorage.getItem(P + k); return r == null ? def : JSON.parse(r); } catch (e) { return def; } }
  function write(k, v) {
    try { localStorage.setItem(P + k, JSON.stringify(v)); } catch (e) { /* stockage bloqué */ }
    if (ch) ch.postMessage({ k });
    listeners.forEach(fn => fn(k, true));
  }
  function on(fn) { listeners.push(fn); }
  if (ch) ch.onmessage = ev => listeners.forEach(fn => fn(ev.data && ev.data.k, false));
  window.addEventListener('storage', ev => { if (ev.key && ev.key.indexOf(P) === 0) listeners.forEach(fn => fn(ev.key.slice(P.length), false)); });

  /* ---------- Réglages ---------- */
  const DEF = {
    branch: 'gc',
    online: true,              // commandes en ligne ouvertes
    prepMin: 12,               // temps de préparation annoncé (min)
    loyaltyGoal: 8,            // 8 burgers = le 9e offert
    loyaltyOn: true,
    pins: { manager: '0328', kitchen: '1111', cash: '2222' },
    hours: {}                  // surcharge des horaires par restaurant
  };
  function settings() { const s = Object.assign({}, DEF, read('settings', {})); s.pins = Object.assign({}, DEF.pins, s.pins); return s; }
  function saveSettings(p) { write('settings', Object.assign(settings(), p)); }

  /* ---------- Carte ---------- */
  function overrides() { return read('menu', {}); }
  function product(id) {
    const b = D.products.find(p => p.id === id); if (!b) return null;
    const o = overrides()[id] || {};
    const price = o.price != null ? o.price : b.price;
    const delta = b.sizes && price != null ? price - b.sizes[0] : 0;
    return Object.assign({}, b, {
      price,
      sizes: b.sizes ? b.sizes.map(x => x + delta) : null,
      available: o.available != null ? o.available : !b.soldout && price != null
    });
  }
  function products() { return D.products.map(p => product(p.id)); }
  function setProduct(id, patch) { const o = overrides(); o[id] = Object.assign({}, o[id], patch); write('menu', o); }

  /* ---------- Horaires ---------- */
  function branch(id) { return D.branches.find(b => b.id === id) || D.branches[0]; }
  function hoursFor(id, day) {
    const b = branch(id); const s = settings().hours[id] || {};
    const key = day === 5 ? 'fri' : day === 6 ? 'sat' : 'def';
    return s[key] || b.hours[key] || s.def || b.hours.def;
  }
  function isOpen(id, now) {
    now = now || new Date();
    const h = hoursFor(id, now.getDay());
    const m = now.getHours() * 60 + now.getMinutes();
    const [o, c] = h.map(t => { const [a, b] = t.split(':').map(Number); return a * 60 + b; });
    return m >= o && m < c;
  }

  /* ---------- Commandes ---------- */
  function orders() { return read('orders', []); }
  function saveOrders(list) { write('orders', list); }
  function nextNum(br) {
    const today = new Date().toDateString();
    const c = read('counter', {});
    if (!c[br] || c[br].day !== today) c[br] = { day: today, n: 100 };
    c[br].n += 1; write('counter', c);
    return c[br].n;
  }
  function addOrder(o) {
    const list = orders();
    o.id = 'o' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    o.num = nextNum(o.branch);
    o.status = 'new';
    o.t = { created: Date.now() };
    list.push(o); saveOrders(list);
    if (o.phone) addStamps(o.phone, o.items.filter(i => { const p = product(i.pid); return p && (p.cat === 'beef' || p.cat === 'chicken'); }).reduce((a, i) => a + i.qty, 0));
    return o;
  }
  function setStatus(id, status) {
    const list = orders(); const o = list.find(x => x.id === id); if (!o) return;
    o.status = status; o.t[status] = Date.now();
    if (status === 'done') o.paid = true;
    saveOrders(list);
  }
  function getOrder(id) { return orders().find(o => o.id === id); }

  /* ---------- Fidélité (par numéro de téléphone) ---------- */
  function cleanPhone(p) { return String(p || '').replace(/\D/g, '').replace(/^213/, '0'); }
  function stamps(phone) { return (read('loyalty', {})[cleanPhone(phone)] || 0); }
  function addStamps(phone, n) {
    if (!n) return; const l = read('loyalty', {}); const k = cleanPhone(phone);
    l[k] = (l[k] || 0) + n; write('loyalty', l);
  }

  /* ---------- Démo : quelques commandes du jour pour le tableau de bord ---------- */
  function seed() {
    if (read('seeded', null) === new Date().toDateString()) return;
    const list = orders().filter(o => new Date(o.t.created).toDateString() === new Date().toDateString() && !o.demo);
    const pick = ['pepper', 'cheese', 'bbq', 'algerian', 'chk', 'chkcrispy', 'rossini', 'pickle', 'egg', 'chili', 'nicois', 'keftaji'];
    const now = new Date(); const start = new Date(now); start.setHours(10, 20, 0, 0);
    const span = Math.max(30, (now - start) / 60000);
    let n = 100; const brs = ['gc', 'gc', 'gc', 'hy', 'sy', 'aa'];
    const total = Math.min(46, Math.round(span / 9));
    for (let i = 0; i < total; i++) {
      const t = start.getTime() + (span * 60000) * (i / total);
      const items = [];
      const nb = 1 + (i % 3 === 0 ? 1 : 0);
      for (let k = 0; k < nb; k++) {
        const p = product(pick[(i * 7 + k * 5) % pick.length]);
        const s = p.sizes ? (i + k) % 3 === 0 ? 1 : 0 : 0;
        items.push({ pid: p.id, size: p.sizes ? s : null, qty: 1, price: p.sizes ? p.sizes[s] : p.price });
      }
      if (i % 2 === 0) items.push({ pid: 'frites', qty: 1, price: 200 });
      if (i % 3 !== 1) items.push({ pid: 'soda', qty: 1, price: 150 });
      const br = brs[i % brs.length];
      list.push({ id: 'd' + i, demo: true, num: ++n, branch: br, mode: i % 4 === 0 ? 'emporter' : 'surplace', source: i % 3 === 0 ? 'caisse' : 'web',
        items, total: items.reduce((a, x) => a + x.price * x.qty, 0), name: '', phone: '', status: 'done', paid: true,
        t: { created: t, prep: t + 60000, ready: t + (9 + i % 6) * 60000, done: t + (12 + i % 6) * 60000 } });
    }
    const c = read('counter', {}); c.gc = { day: now.toDateString(), n: n }; write('counter', c);
    saveOrders(list); write('seeded', now.toDateString());
  }

  function money(n) { return n == null ? '' : n.toLocaleString('fr-FR').replace(/ | /g, ' ') + ' DA'; }

  window.PPR = { D, read, write, on, settings, saveSettings, product, products, setProduct, branch, hoursFor, isOpen,
    orders, saveOrders, addOrder, setStatus, getOrder, stamps, cleanPhone, seed, money };
})();
