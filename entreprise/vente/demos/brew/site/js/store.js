/* =====================================================================
   BREW — magasin de données partagé (site client + espace gérant)
   ---------------------------------------------------------------------
   Tout est stocké en local (localStorage, clés préfixées « brw- »).
   Chaque écriture est diffusée aux autres onglets via BroadcastChannel :
   le client voit sa commande avancer quand le bar ou la cuisine agit.
   ===================================================================== */
(function () {
  'use strict';
  const D = window.BREW_DATA;
  const PREFIX = 'brw-';
  const listeners = [];
  let channel = null;
  try { channel = new BroadcastChannel('brw-sync'); } catch (e) { /* navigateur ancien : on garde l'événement storage */ }

  /* ---------- Lecture / écriture sûres ---------- */
  function read(key, def) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw == null ? def : JSON.parse(raw);
    } catch (e) { return def; }
  }
  function write(key, val, silent) {
    try { localStorage.setItem(PREFIX + key, JSON.stringify(val)); } catch (e) { /* stockage plein ou bloqué */ }
    if (!silent) {
      if (channel) channel.postMessage({ key });
      listeners.forEach(fn => fn(key, true));
    }
  }
  function on(fn) { listeners.push(fn); }
  if (channel) channel.onmessage = (ev) => listeners.forEach(fn => fn(ev.data && ev.data.key, false));
  window.addEventListener('storage', (ev) => {
    if (ev.key && ev.key.indexOf(PREFIX) === 0) listeners.forEach(fn => fn(ev.key.slice(PREFIX.length), false));
  });

  /* ---------- Réglages par défaut ---------- */
  const DEFAULT_SETTINGS = {
    status: 'soon',              // 'soon' = ouverture prochaine, 'open' = ouvert
    openingDate: '',             // date d'ouverture (compte à rebours) — vide = pas de date affichée
    hours: [0, 1, 2, 3, 4, 5, 6].map(d => ({ d, open: '08:00', close: '20:00', closed: false })),
    collect: true,               // commander à l'avance & retrait au comptoir
    tableOrder: true,            // commande à table par QR code
    delivery: true,              // livraison (désactivable)
    deliveryMin: 1000,
    zones: [
      { id: 'z1', fr: 'Zone 1 · proche', ar: 'المنطقة 1 · قريبة', fee: 200 },
      { id: 'z2', fr: 'Zone 2 · étendue', ar: 'المنطقة 2 · موسّعة', fee: 350 }
    ],
    loyaltyGoal: 10,             // 1 boisson offerte toutes les 10 boissons
    formuleDiscount: D.formule.discount,
    tables: 12,
    whatsapp: '',                // numéro WhatsApp de BREW (format international, ex. 213…)
    extras: { egg: true, avocado: true, salmon: true, chicken: true, veggie: true },
    extraPrices: {},
    hiddenCats: [],
    pins: { manager: '0328', bar: '1111', kitchen: '1112', cash: '2222' }
  };

  function settings() {
    const s = Object.assign({}, DEFAULT_SETTINGS, read('settings', {}));
    s.extras = Object.assign({}, DEFAULT_SETTINGS.extras, s.extras);
    s.pins = Object.assign({}, DEFAULT_SETTINGS.pins, s.pins);
    return s;
  }
  function saveSettings(patch) { write('settings', Object.assign(settings(), patch)); }

  /* ---------- Carte (prix / disponibilité modifiables) ---------- */
  function overrides() { return read('menu', {}); }
  function product(id) {
    const base = D.products.find(p => p.id === id);
    if (!base) return null;
    const o = overrides()[id] || {};
    const cat = D.categories.find(c => c.id === base.cat);
    return Object.assign({}, base, {
      price: o.price != null ? o.price : base.price,
      available: o.available !== false,
      // vitrine : le gérant coche les sweets présents aujourd'hui
      inShowcase: base.vitrine ? o.inShowcase !== false : true,
      station: cat.station,
      tint: base.tint || cat.tint,
      art: base.art || cat.art
    });
  }
  function products() { return D.products.map(p => product(p.id)); }
  function setProduct(id, patch) {
    const all = overrides();
    all[id] = Object.assign({}, all[id], patch);
    write('menu', all);
  }
  function canOrder(p) { return p && p.available && p.inShowcase; }
  function extraPrice(k) {
    const s = settings();
    return s.extraPrices[k] != null ? s.extraPrices[k] : D.extras[k].price;
  }
  function isDrink(pid) {
    const p = D.products.find(x => x.id === pid);
    return p && ['savory', 'sweet', 'healthy', 'vitrine'].indexOf(p.cat) === -1;
  }

  /* Formule Brunch : prix = somme − remise, arrondi aux 50 DA inférieurs */
  function formulePrice(dishId, drinkId) {
    const s = settings();
    const sum = product(dishId).price + product(drinkId).price + product(D.formule.juice).price;
    const price = Math.floor(sum * (100 - s.formuleDiscount) / 100 / 50) * 50;
    return { sum, price };
  }

  /* ---------- Commandes ---------- */
  function orders() { return read('orders', []); }
  function saveOrders(list) { write('orders', list); }
  function dayKey(t) { const d = new Date(t || Date.now()); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function nextNumber() {
    const s = read('seq', { day: '', n: 0 });
    if (s.day !== dayKey()) { s.day = dayKey(); s.n = 0; }
    s.n += 1;
    write('seq', s, true);
    return s.n;
  }
  function uid(p) { return (p || 'id') + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  /* Statut global déduit des postes (bar / cuisine) */
  function orderStatus(o) {
    if (o.cancelled) return 'cancelled';
    if (o.done) return 'done';
    const st = Object.keys(o.st || {}).filter(k => o.st[k]);
    if (st.length && st.every(k => o.st[k] === 'ready')) return 'ready';
    if (st.some(k => o.st[k] !== 'new')) return 'preparing';
    return 'received';
  }
  function stationsOf(lines) {
    const st = {};
    lines.forEach(l => (l.parts || [l]).forEach(p => { st[p.station] = 'new'; }));
    return st;
  }

  function addOrder(o) {
    const list = orders();
    o.id = o.id || uid('o');
    o.num = o.num || nextNumber();
    o.createdAt = o.createdAt || Date.now();
    o.st = o.st || stationsOf(o.lines);
    o.times = o.times || {};
    list.push(o);
    saveOrders(list);
    // fidélité : un tampon par boisson commandée (si numéro de téléphone)
    if (o.phone && !o.seed) addStamps(o.phone, o.name, drinkCount(o) - (o.freeDrink ? 1 : 0), o.freeDrink);
    return o;
  }
  function updateOrder(id, fn) {
    const list = orders();
    const o = list.find(x => x.id === id);
    if (!o) return null;
    fn(o);
    saveOrders(list);
    return o;
  }
  function setStation(id, station, value) {
    return updateOrder(id, o => {
      o.st[station] = value;
      o.times[station + '-' + value] = Date.now();
    });
  }
  function drinkCount(o) {
    let n = 0;
    o.lines.forEach(l => (l.parts || [l]).forEach(p => { if (isDrink(p.pid)) n += l.qty; }));
    return n;
  }

  /* ---------- Fidélité ---------- */
  function normPhone(p) { return String(p || '').replace(/[^\d+]/g, '').replace(/^\+?213/, '0'); }
  function loyalty() { return read('loyalty', {}); }
  function card(phone) { const l = loyalty()[normPhone(phone)]; return l || null; }
  function addStamps(phone, name, n, usedReward) {
    const all = loyalty(), k = normPhone(phone);
    const c = all[k] || { name: name || '', stamps: 0, rewards: 0, visits: 0 };
    const goal = settings().loyaltyGoal;
    if (usedReward) c.stamps = Math.max(0, c.stamps - goal), c.rewards += 1;
    c.stamps += Math.max(0, n);
    c.visits += 1;
    if (name) c.name = name;
    c.last = Date.now();
    all[k] = c;
    write('loyalty', all);
  }

  /* ---------- Réservations, « Prévenez-moi », clôtures ---------- */
  function resas() { return read('resas', []); }
  function addResa(r) { const l = resas(); r.id = uid('r'); r.createdAt = Date.now(); r.status = 'pending'; l.push(r); write('resas', l); return r; }
  function setResa(id, status) { const l = resas(); const r = l.find(x => x.id === id); if (r) { r.status = status; write('resas', l); } }
  function notifyList() { return read('notify', []); }
  function addNotify(phone, name) {
    const l = notifyList(), k = normPhone(phone);
    if (l.some(x => normPhone(x.phone) === k)) return false;
    l.push({ phone: phone.trim(), name: (name || '').trim(), at: Date.now() });
    write('notify', l);
    return true;
  }

  /* ---------- Données d'exemple (une journée déjà commencée) ---------- */
  function seed() {
    if (read('seeded', false)) return;
    const now = Date.now();
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const at = (minAgo) => Math.max(start.getTime() + 60000, now - minAgo * 60000);
    const L = (pid, qty, opts) => {
      const p = product(pid);
      const o = (opts || []).map(k => k.indexOf(':') > 0
        ? { k, fr: p.choice.opts.find(c => c.id === k.split(':')[1]).fr, ar: p.choice.opts.find(c => c.id === k.split(':')[1]).ar, price: 0 }
        : { k, fr: D.extras[k].fr, ar: D.extras[k].ar, price: D.extras[k].price });
      const unit = p.price + o.reduce((a, b) => a + b.price, 0);
      return { id: uid('l'), pid, name: p.name, qty, unit, opts: o, station: p.station };
    };
    const F = (dish, drink) => {
      const fp = formulePrice(dish, drink);
      return { id: uid('l'), pid: D.formule.id, name: 'Formule Brunch', qty: 1, unit: fp.price, opts: [], station: 'kitchen',
        parts: [dish, drink, D.formule.juice].map(id => ({ pid: id, name: product(id).name, station: product(id).station })) };
    };
    const S = (minAgo, o) => Object.assign({ seed: true, createdAt: at(minAgo), paid: true, pay: 'cash', done: true }, o);
    const sample = [
      S(330, { name: 'Amine', mode: 'collect', phone: '0555 21 47 80', lines: [L('iced-latte', 1, ['choice:vanille']), L('croissant', 1)], pay: 'card' }),
      S(312, { name: 'Yasmine', mode: 'table', table: 4, lines: [F('avocado-sunrise', 'cappuccino'), L('spanish-latte', 1)] }),
      S(290, { name: 'Walid', mode: 'collect', lines: [L('double-espresso', 2), L('cinnamon-roll', 1)] }),
      S(268, { name: 'Rania', mode: 'table', table: 2, lines: [L('brew-scrambled-toast', 1, ['salmon']), L('hot-matcha-latte', 1, ['veggie'])], pay: 'card' }),
      S(241, { name: 'Sofiane', mode: 'collect', lines: [L('cold-brew', 1), L('cookie', 2)] }),
      S(222, { name: 'Lina', mode: 'table', table: 6, lines: [L('brioche-perdue', 1), L('strawberry-matcha', 1), L('brew-strawberry', 1)] }),
      S(205, { name: 'Karim', mode: 'delivery', zone: 'z1', address: '—', lines: [L('crispy-chicken-brioche', 2), L('fresh-orange-juice', 2)], fee: 200 }),
      S(181, { name: 'Imane', mode: 'collect', phone: '0661 08 32 15', lines: [L('pistachio-latte', 1), L('croissant-pistache-fraise', 1)], pay: 'card' }),
      S(160, { name: 'Mehdi', mode: 'table', table: 9, lines: [F('brew-breakfast-plate', 'americano'), F('oeufs-turcs', 'mint-tea')] }),
      S(138, { name: 'Nesrine', mode: 'collect', lines: [L('iced-latte', 2, ['choice:caramel']), L('brownie', 1)] }),
      S(117, { name: 'Ryad', mode: 'table', table: 1, lines: [L('burrata-garden', 1), L('brew-passion', 1), L('brew-red', 1)], pay: 'card' }),
      S(96, { name: 'Meriem', mode: 'collect', lines: [L('biscoff-milkshake', 1), L('cheesecake', 1)] }),
      S(74, { name: 'Anis', mode: 'table', table: 5, lines: [L('chicken-caesar-bowl', 1), L('fresh-lemonade', 1)] }),
      S(52, { name: 'Sarah', mode: 'collect', lines: [L('red-berry-granola', 1), L('cafe-latte', 1, ['veggie'])], pay: 'card' }),
      // commandes en cours (visibles au bar, en cuisine et en caisse)
      S(26, { name: 'Bilal', mode: 'table', table: 7, done: false, paid: false, lines: [L('strawberry-matcha', 1), L('tiramisu', 1)], st: { bar: 'ready' } }),
      S(14, { name: 'Lyna', mode: 'collect', done: false, paid: false, pickup: '', lines: [L('hazelnut-latte', 1), L('brownie-a-la-mode', 1)], st: { bar: 'doing', kitchen: 'doing' } }),
      S(6, { name: 'Yacine', mode: 'table', table: 3, done: false, paid: false, lines: [F('cheese-croissant-gratine', 'flat-white'), L('iced-mocha', 1)] }),
      S(2, { name: 'Ines', mode: 'collect', done: false, paid: false, lines: [L('caramel-frappe', 1), L('cookie', 1)] })
    ];
    const list = [];
    let n = 0;
    sample.forEach(o => {
      n += 1;
      o.id = uid('o'); o.num = n;
      o.st = Object.assign(stationsOf(o.lines), o.done ? Object.fromEntries(Object.keys(stationsOf(o.lines)).map(k => [k, 'ready'])) : {}, o.st || {});
      o.times = { received: o.createdAt };
      o.total = o.lines.reduce((a, l) => a + l.unit * l.qty, 0) + (o.fee || 0);
      list.push(o);
    });
    write('orders', list, true);
    write('seq', { day: dayKey(), n }, true);

    const day = (k) => { const d = new Date(); d.setDate(d.getDate() + k); return d.toISOString().slice(0, 10); };
    write('resas', [
      { id: uid('r'), name: 'Lina B.', phone: '0550 64 12 09', date: day(1), time: '10:30', people: 4, note: '', status: 'pending', createdAt: now - 3600e3 },
      { id: uid('r'), name: 'Sofiane K.', phone: '0770 15 88 41', date: day(2), time: '11:00', people: 2, note: '', status: 'confirmed', createdAt: now - 7200e3 },
      { id: uid('r'), name: 'Nesrine A.', phone: '0661 90 27 33', date: day(1), time: '12:00', people: 6, note: 'Anniversaire', status: 'pending', createdAt: now - 1800e3 }
    ], true);
    write('loyalty', {
      '0555214780': { name: 'Amine', stamps: 7, rewards: 1, visits: 14, last: now - 330 * 60000 },
      '0661083215': { name: 'Imane', stamps: 10, rewards: 0, visits: 9, last: now - 181 * 60000 },
      '0770158841': { name: 'Sofiane', stamps: 3, rewards: 0, visits: 3, last: now - 86400e3 }
    }, true);
    write('notify', [
      { phone: '0550 33 71 26', name: 'Selma', at: now - 5 * 86400e3 },
      { phone: '0661 42 05 98', name: 'Hichem', at: now - 4 * 86400e3 },
      { phone: '0770 81 63 10', name: 'Amel', at: now - 2 * 86400e3 },
      { phone: '0555 09 74 52', name: '', at: now - 86400e3 }
    ], true);
    write('seeded', true, true);
  }

  /* Mise en service : on vide l'activité, on garde carte + réglages */
  function resetActivity() {
    ['orders', 'resas', 'loyalty', 'notify', 'z', 'seq', 'mine'].forEach(k => { try { localStorage.removeItem(PREFIX + k); } catch (e) { } });
    write('seeded', true);
  }

  window.BREW_STORE = {
    read, write, on, settings, saveSettings, DEFAULT_SETTINGS,
    product, products, setProduct, canOrder, extraPrice, isDrink, formulePrice,
    orders, saveOrders, addOrder, updateOrder, setStation, orderStatus, drinkCount, dayKey, uid,
    loyalty, card, addStamps, normPhone,
    resas, addResa, setResa, notifyList, addNotify,
    seed, resetActivity
  };
  seed();
})();
