/* =====================================================================
   General Electric dz — système de gestion du magasin
   Rôles : gérant (tout), caisse (caisse + commandes), livreur (livraisons)
   Données locales (localStorage « ads-* »), synchronisées en direct avec la
   page publique (BroadcastChannel « ads-sync » + événement storage).
   ===================================================================== */
(function () {
  'use strict';
  const $ = s => document.querySelector(s), $$ = s => document.querySelectorAll(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = n => n == null || isNaN(n) ? '—' : Math.round(n).toLocaleString('fr-FR').replace(/ | /g, ' ') + ' DA';
  const get = (k, d) => { try { const v = localStorage.getItem('ads-' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
  let bc = null; try { bc = new BroadcastChannel('ads-sync'); } catch (e) { /* ancien navigateur */ }
  const put = (k, v) => { try { localStorage.setItem('ads-' + k, JSON.stringify(v)); } catch (e) { /* bloqué */ } try { bc && bc.postMessage(k); } catch (e) { /* ok */ } };
  const SHOP = window.SHOP, DAY = 864e5;
  const KIT_NAME = 'Kit alarme Dahua AirShield (4 pièces)';
  const DEF = { price: SHOP.price, oldPrice: SHOP.oldPrice, cost: null, available: true, stockAlert: 3, zones: {}, pins: { manager: SHOP.pin || '0328', cash: '2222', driver: '3333' } };
  const S = () => { const s = Object.assign({}, DEF, get('settings', {})); s.pins = Object.assign({}, DEF.pins, s.pins); s.zones = s.zones || {}; return s; };
  const save = p => put('settings', Object.assign(S(), p));
  let role = null, pin = '', view = '';
  const ROLE_NAME = { manager: 'Gérant', cash: 'Caisse', driver: 'Livreur' };
  function log(txt) { const l = get('log', []); l.unshift({ at: Date.now(), who: ROLE_NAME[role] || '—', txt }); put('log', l.slice(0, 300)); }
  let tt; const toast = m => { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 2400); };
  const phoneFmt = p => String(p || '').replace(/(\d{4})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
  const wa = (p, msg) => 'https://wa.me/213' + String(p).replace(/^0/, '') + (msg ? '?text=' + encodeURIComponent(msg) : '');
  const dfmt = (t, o) => new Date(t).toLocaleString('fr-FR', o || { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  const sameDay = (a, b) => new Date(a).toDateString() === new Date(b).toDateString();

  /* ---------- produits ---------- */
  function products() {
    const s = S();
    return [{ id: 'kit', name: KIT_NAME, short: 'Kit alarme Dahua AirShield', price: s.price, cost: s.cost, alert: s.stockAlert, img: 'img/boite.webp', kit: true }].concat(get('products', []));
  }
  const prod = id => products().find(p => p.id === id);
  const counts = o => o.status !== 'nouvelle' && o.status !== 'annulée';
  function soldOf(pid) {
    const site = pid === 'kit' ? get('orders', []).filter(counts).reduce((a, o) => a + o.qty, 0) : 0;
    const shop = get('sales', []).reduce((a, x) => a + x.items.filter(i => (i.pid || (i.kit ? 'kit' : null)) === pid).reduce((b, i) => b + i.qty, 0), 0);
    return site + shop;
  }
  const inOf = pid => get('moves', []).filter(m => (m.pid || 'kit') === pid).reduce((a, m) => a + m.qty, 0);
  const stockOf = pid => inOf(pid) - soldOf(pid);

  /* ---------- montants ---------- */
  const unit = o => o.price != null ? o.price : S().price;
  const orderSub = o => unit(o) == null ? null : unit(o) * o.qty;
  const orderTotal = o => orderSub(o) == null ? null : orderSub(o) + (o.fee || 0);
  const saleTotal = x => x.items.reduce((a, i) => a + i.price * i.qty, 0);
  const costOf = (pid, qty) => { const p = prod(pid); return p && p.cost != null ? p.cost * qty : null; };

  /* ---------- données de démonstration ---------- */
  function seed() {
    if (get('seeded', false) && get('seeded2', false)) return;
    const n = Date.now();
    if (!get('seeded', false)) {
      const names = [['Samir Belkacem', '0661452317', '16 Alger', 'Bab Ezzouar'], ['Nadia Haddad', '0770381256', '35 Boumerdès', 'Boudouaou'], ['Yacine Mansouri', '0552906144', '09 Blida', 'Ouled Yaïch'], ['Karima Saadi', '0699213487', '16 Alger', 'Dar El Beïda'], ['Mehdi Ouali', '0540778920', '15 Tizi Ouzou', 'Azazga'], ['Rania Benali', '0771620043', '42 Tipaza', 'Koléa'], ['Hocine Ferhat', '0663318872', '16 Alger', 'Rouïba']];
      const st = ['livrée', 'livrée', 'expédiée', 'confirmée', 'nouvelle', 'nouvelle', 'livrée'];
      const orders = get('orders', []);
      names.forEach((c, i) => orders.push({ id: 'demo' + i, demo: true, at: n - (i * 0.8 + 0.2) * DAY, name: c[0], phone: c[1], wil: c[2], com: c[3], adr: '', qty: i === 2 ? 2 : 1, price: null, fee: null, status: st[i] }));
      put('orders', orders.sort((a, b) => b.at - a.at));
      put('sales', [{ id: 's1', demo: true, at: n - 3.1 * DAY, items: [{ pid: 'kit', name: KIT_NAME, kit: true, qty: 1, price: S().price || 55000 }], pay: 'Espèces', client: '' }]);
      put('moves', [{ at: n - 6.5 * DAY, qty: 15, note: 'Réception fournisseur (démo)', pid: 'kit' }]);
      put('seeded', true);
    }
    if (!get('seeded2', false)) {
      if (!get('products', null)) put('products', []);
      put('seeded2', true);
    }
  }

  /* ---------- connexion ---------- */
  try { role = sessionStorage.getItem('ads-role'); } catch (e) { /* bloqué */ }
  $('#pad').innerHTML = [1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'].map(k => k === '' ? '<span></span>' : '<button data-k="' + k + '">' + k + '</button>').join('');
  $('#pad').addEventListener('click', e => {
    const b = e.target.closest('[data-k]'); if (!b) return;
    pin = b.dataset.k === '⌫' ? pin.slice(0, -1) : (pin + b.dataset.k).slice(0, 4);
    $$('#dots i').forEach((d, i) => d.classList.toggle('on', i < pin.length));
    if (pin.length === 4) {
      const p = S().pins; role = pin === p.manager ? 'manager' : pin === p.cash ? 'cash' : pin === p.driver ? 'driver' : null;
      if (role) { try { sessionStorage.setItem('ads-role', role); } catch (x) { /* bloqué */ } log('Connexion'); start(); } else $('#gErr').textContent = 'Code incorrect';
      pin = ''; setTimeout(() => $$('#dots i').forEach(d => d.classList.remove('on')), 200);
    }
  });
  document.addEventListener('keydown', e => { if (!$('#gate').hidden && /^\d$/.test(e.key)) { const b = $('#pad [data-k="' + e.key + '"]'); b && b.click(); } });
  $('#out').onclick = () => { try { sessionStorage.removeItem('ads-role'); } catch (e) { /* bloqué */ } location.reload(); };

  const TABS = {
    manager: [['dash', '📊 Tableau de bord'], ['orders', '🛒 Commandes'], ['delivery', '🚚 Livraisons'], ['pos', '💳 Caisse'], ['stock', '📦 Produits & stock'], ['clients', '👥 Clients'], ['journal', '🕓 Journal'], ['settings', '⚙️ Réglages']],
    cash: [['pos', '💳 Caisse'], ['orders', '🛒 Commandes']],
    driver: [['delivery', '🚚 Mes livraisons']]
  };
  function start() { seed(); $('#gate').hidden = true; $('#app').hidden = false; $('#tabs').innerHTML = TABS[role].map(([k, l]) => '<button data-v="' + k + '">' + l + '</button>').join(''); $('#who').textContent = ROLE_NAME[role]; go(TABS[role][0][0]); }
  $('#tabs').addEventListener('click', e => { const b = e.target.closest('[data-v]'); if (b) go(b.dataset.v); });
  function go(v) { view = v; $$('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.v === v)); render(); scrollTo(0, 0); }
  function render() { ({ dash, orders, delivery, pos, stock, clients, journal, settings })[view](); }

  /* ---------- tableau de bord ---------- */
  function dash() {
    const s = S(), O = get('orders', []), SL = get('sales', []), now = Date.now();
    const days = [...Array(7)].map((_, i) => now - (6 - i) * DAY);
    const revOn = d => O.filter(o => o.status === 'livrée' && sameDay(o.at, d)).reduce((a, o) => a + (orderTotal(o) || 0), 0) + SL.filter(x => sameDay(x.at, d)).reduce((a, x) => a + saleTotal(x), 0);
    const per = days.map(revOn), max = Math.max(1, ...per);
    const ca = O.filter(o => o.status === 'livrée').reduce((a, o) => a + (orderTotal(o) || 0), 0) + SL.reduce((a, x) => a + saleTotal(x), 0);
    let costKnown = true, cost = 0;
    O.filter(o => o.status === 'livrée').forEach(o => { const c = costOf('kit', o.qty); if (c == null) costKnown = false; else cost += c; });
    SL.forEach(x => x.items.forEach(i => { if (i.disc) return; const pid = i.pid || (i.kit ? 'kit' : null); const c = pid ? costOf(pid, i.qty) : null; if (c == null) costKnown = false; else cost += c; }));
    const fees = O.filter(o => o.status === 'livrée').reduce((a, o) => a + (o.fee || 0), 0);
    const marge = costKnown ? ca - cost - fees : null;
    const decided = O.filter(o => o.status !== 'nouvelle'), conf = decided.length ? Math.round(decided.filter(o => o.status !== 'annulée').length / decided.length * 100) : null;
    const todo = O.filter(o => o.status === 'nouvelle').length, toDeliver = O.filter(o => o.status === 'confirmée' || o.status === 'expédiée').length;
    const lows = products().filter(p => stockOf(p.id) <= (p.alert != null ? p.alert : 3));
    const wil = {}; O.forEach(o => { wil[o.wil] = (wil[o.wil] || 0) + o.qty; });
    const top = Object.entries(wil).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const todayN = O.filter(o => sameDay(o.at, now)).length;
    $('#view').innerHTML = '<div class="hd"><div><h2>Bonjour 👋</h2><p>' + esc(SHOP.name) + ' · ' + new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) + '</p></div><div class="acts"><button class="mb" data-go="orders">Commandes à confirmer : <b>' + todo + '</b></button><button class="mb" data-go="delivery">À livrer : <b>' + toDeliver + '</b></button></div></div>' +
      (lows.length ? '<p class="note warnline">⚠️ Stock bas : ' + lows.map(p => esc(p.short || p.name) + ' (' + stockOf(p.id) + ')').join(', ') + '. <button class="mb" data-go="stock">Réapprovisionner</button></p>' : '') +
      '<div class="kp"><div><small>Chiffre d\'affaires encaissé</small><b>' + money(ca) + '</b><em>commandes livrées + caisse</em></div>' +
      '<div><small>Marge</small><b>' + (marge == null ? '—' : money(marge)) + '</b><em>' + (marge == null ? 'indiquez les prix d\'achat (Produits)' : 'après prix d\'achat et livraisons') + '</em></div>' +
      '<div><small>Commandes aujourd\'hui</small><b>' + todayN + '</b><em>' + O.length + ' au total</em></div>' +
      '<div><small>Taux de confirmation</small><b>' + (conf == null ? '—' : conf + ' %') + '</b><em>commandes confirmées / traitées</em></div></div>' +
      '<div class="grid2"><div class="pn"><h3>Chiffre d\'affaires · 7 derniers jours</h3><div class="bars">' + per.map((v, i) => '<div title="' + money(v) + '"><em>' + (v ? Math.round(v / 1000) + 'k' : '0') + '</em><i style="height:' + (v / max * 100) + '%"></i><span>' + new Date(days[i]).toLocaleDateString('fr-FR', { weekday: 'short' }) + '</span></div>').join('') + '</div><div style="height:22px"></div></div>' +
      '<div class="pn"><h3>Kits commandés par wilaya</h3><div class="lst">' + (top.map(([w, c]) => '<div class="r"><span>' + esc(w) + '</span><b>' + c + '</b></div>').join('') || '<div class="empty">Pas encore de commande.</div>') + '</div></div></div>' +
      '<div class="pn" style="margin-top:12px"><h3>Dernières commandes</h3>' + orderTable(O.slice(0, 5), true) + '</div>' +
      '<p class="note" style="margin-top:12px">Démo : quelques commandes d\'exemple sont préremplies (Réglages → Réinitialiser pour repartir de zéro). Vos commandes test depuis la page arrivent ici en direct.</p>';
  }
  document.addEventListener('click', e => { const g = e.target.closest('[data-go]'); if (g) go(g.dataset.go); });

  /* ---------- commandes ---------- */
  const ST = ['nouvelle', 'confirmée', 'expédiée', 'livrée', 'annulée'];
  let filt = 'toutes', q = '';
  const confirmMsg = o => 'Bonjour ' + o.name.split(' ')[0] + ', ici ' + SHOP.name + '. Nous confirmons votre commande : kit alarme Dahua AirShield × ' + o.qty + (orderSub(o) != null ? ' = ' + money(orderSub(o)) : '') + (o.fee != null ? ', livraison ' + (o.fee ? money(o.fee) : 'offerte') + ', total ' + money(orderTotal(o)) : ', frais de livraison à confirmer') + '. Livraison à ' + o.com + ' (' + o.wil + '). Merci de votre confiance !';
  const bon = o => SHOP.name + ' · ' + (SHOP.city || '') + ' · WhatsApp ' + (SHOP.whatsappShow || '') + '\nBON DE LIVRAISON n° ' + String(o.id).toUpperCase() + '\nDate : ' + dfmt(o.at) + '\n------------------------------\nClient : ' + o.name + '\nTél. : ' + phoneFmt(o.phone) + '\nAdresse : ' + (o.adr ? o.adr + ', ' : '') + o.com + ', ' + o.wil + '\n------------------------------\n' + o.qty + ' x ' + KIT_NAME + '\n   ' + money(orderSub(o)) + '\nLivraison : ' + (o.fee == null ? 'à confirmer' : o.fee ? money(o.fee) : 'offerte') + '\nTOTAL À ENCAISSER : ' + money(orderTotal(o)) + '\n------------------------------\nSignature client :';
  function orderTable(L, compact) {
    if (!L.length) return '<div class="empty">Aucune commande.</div>';
    return '<div class="tw"><table class="t"><thead><tr><th>Date</th><th>Client</th><th>Livraison</th><th>Qté</th><th>Total</th><th>Statut</th><th>Actions</th></tr></thead><tbody>' + L.map(o =>
      '<tr><td>' + dfmt(o.at) + '</td><td><b>' + esc(o.name) + '</b><br><small>' + phoneFmt(o.phone) + '</small></td><td>' + esc(o.wil) + '<br><small>' + esc(o.com) + (o.adr ? ' · ' + esc(o.adr) : '') + '</small></td><td>' + o.qty + '</td><td>' + money(orderTotal(o)) + (o.fee == null ? '<br><small>+ livraison</small>' : '') + '</td>' +
      '<td><select data-st="' + esc(o.id) + '" aria-label="Statut">' + ST.map(s => '<option' + (s === o.status ? ' selected' : '') + '>' + s + '</option>').join('') + '</select></td>' +
      '<td><div class="acts"><a class="mb wa" target="_blank" rel="noopener" href="' + wa(o.phone, confirmMsg(o)) + '">Confirmer WhatsApp</a><a class="mb" href="tel:' + esc(o.phone) + '">Appeler</a>' + (compact ? '' : '<button class="mb" data-bon="' + esc(o.id) + '">Bon de livraison</button>') + '</div></td></tr>' +
      (compact ? '' : '<tr class="bonrow" id="bon-' + esc(o.id) + '" hidden><td colspan="7"><div class="rcpt">' + esc(bon(o)) + '</div><button class="mb" data-copy="' + esc(o.id) + '">Copier le bon</button></td></tr>')).join('') + '</tbody></table></div>';
  }
  function orders() {
    const O = get('orders', []);
    const L = O.filter(o => (filt === 'toutes' || o.status === filt) && (!q || (o.name + ' ' + o.phone + ' ' + o.wil + ' ' + o.com).toLowerCase().includes(q.toLowerCase())));
    $('#view').innerHTML = '<div class="hd"><div><h2>Commandes du site</h2><p>Chaque commande passée sur la page arrive ici en direct. Appelez vite : une commande confirmée dans l\'heure est rarement annulée.</p></div><button class="mb" id="csv">Copier pour Excel</button></div>' +
      '<div class="bar2"><div class="flt">' + ['toutes'].concat(ST).map(s => '<button data-f="' + s + '" class="' + (s === filt ? 'on' : '') + '">' + s + ' <b>' + (s === 'toutes' ? O.length : O.filter(o => o.status === s).length) + '</b></button>').join('') + '</div><input id="q" placeholder="Rechercher : nom, téléphone, wilaya…" value="' + esc(q) + '"></div><div class="pn">' + orderTable(L) + '</div>';
    $('#q').oninput = e => { q = e.target.value; const pos = e.target.selectionStart; orders(); const i = $('#q'); i.focus(); i.setSelectionRange(pos, pos); };
    $('#csv').onclick = () => { const rows = [['Date', 'Nom', 'Téléphone', 'Wilaya', 'Commune', 'Adresse', 'Qté', 'Livraison', 'Total', 'Statut']].concat(O.map(o => [dfmt(o.at), o.name, o.phone, o.wil, o.com, o.adr, o.qty, o.fee == null ? '' : o.fee, orderTotal(o) || '', o.status])); copy(rows.map(r => r.join('\t')).join('\n'), '✓ Copié : collez dans Excel'); };
  }
  function copy(txt, ok) { (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => toast(ok)).catch(() => toast('Copie impossible ici : sélectionnez le texte')); }
  document.addEventListener('click', e => {
    const f = e.target.closest('[data-f]'); if (f) { filt = f.dataset.f; orders(); return; }
    const b = e.target.closest('[data-bon]'); if (b) { const r = document.getElementById('bon-' + b.dataset.bon); if (r) r.hidden = !r.hidden; return; }
    const c = e.target.closest('[data-copy]'); if (c) { const o = get('orders', []).find(x => x.id === c.dataset.copy); if (o) copy(bon(o), '✓ Bon copié'); }
  });
  function setStatus(id, st, note) {
    const O = get('orders', []), o = O.find(x => x.id === id); if (!o) return;
    if (st !== 'nouvelle' && st !== 'annulée' && o.status === 'nouvelle' && stockOf('kit') - o.qty < 0) toast('⚠️ Attention : stock insuffisant pour cette commande');
    o.status = st; if (st === 'livrée') o.paid = true; if (note) o.note = note; put('orders', O); log('Commande ' + o.name + ' → ' + st);
  }
  document.addEventListener('change', e => { const s = e.target.closest('[data-st]'); if (!s) return; setStatus(s.dataset.st, s.value); toast('✓ Commande ' + s.value); render(); });

  /* ---------- livraisons ---------- */
  function delivery() {
    const L = get('orders', []).filter(o => o.status === 'confirmée' || o.status === 'expédiée').sort((a, b) => a.at - b.at);
    const done = get('orders', []).filter(o => o.status === 'livrée' && sameDay(o.t_livree || o.at, Date.now()));
    $('#view').innerHTML = '<div class="hd"><div><h2>' + (role === 'driver' ? 'Mes livraisons' : 'Livraisons') + '</h2><p>' + L.length + ' à livrer · le montant à encaisser est indiqué sur chaque carte.</p></div></div>' +
      (L.length ? '<div class="dl">' + L.map(o => {
        const adr = (o.adr ? o.adr + ', ' : '') + o.com + ', ' + o.wil.replace(/^\d+ /, '');
        return '<div class="dcard"><div class="dtop"><b>' + esc(o.name) + '</b><span class="st2 s-' + o.status + '">' + o.status + '</span></div><div class="dadr">📍 ' + esc(adr) + '</div><div class="dmt">À encaisser : <b>' + money(orderTotal(o)) + '</b>' + (o.fee == null ? ' <small>+ livraison</small>' : '') + ' · ' + o.qty + ' kit' + (o.qty > 1 ? 's' : '') + '</div>' +
          '<div class="acts"><a class="mb" href="tel:' + esc(o.phone) + '">📞 Appeler</a><a class="mb wa" target="_blank" rel="noopener" href="' + wa(o.phone, 'Bonjour ' + o.name.split(' ')[0] + ', ici le livreur de ' + SHOP.name + '. Je suis en route pour vous livrer votre kit alarme Dahua. À tout de suite !') + '">WhatsApp</a><a class="mb" target="_blank" rel="noopener" href="https://maps.google.com/?q=' + encodeURIComponent(adr + ', Algérie') + '">🗺️ Itinéraire</a></div>' +
          '<div class="acts">' + (o.status === 'confirmée' ? '<button class="mb" data-dl="' + esc(o.id) + '" data-to="expédiée">🚚 En route</button>' : '') + '<button class="mb red" data-dl="' + esc(o.id) + '" data-to="livrée">✓ Livrée et encaissée</button><button class="mb" data-dl="' + esc(o.id) + '" data-to="report">↩︎ Reporter</button></div>' + (o.note ? '<small class="dnote">Note : ' + esc(o.note) + '</small>' : '') + '</div>'; }).join('') + '</div>' : '<div class="pn"><div class="empty">Rien à livrer pour l\'instant. 👍</div></div>') +
      '<div class="pn" style="margin-top:12px"><h3>Livrées aujourd\'hui</h3><div class="lst">' + (done.map(o => '<div class="r"><span>' + esc(o.name) + ' · ' + esc(o.com) + '</span><b>' + money(orderTotal(o)) + '</b></div>').join('') || '<div class="empty">Aucune pour l\'instant.</div>') + '</div></div>';
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-dl]'); if (!b) return;
    if (b.dataset.to === 'report') { setStatus(b.dataset.dl, 'confirmée', 'Reportée le ' + dfmt(Date.now())); toast('↩︎ Livraison reportée'); }
    else { const O = get('orders', []), o = O.find(x => x.id === b.dataset.dl); if (o && b.dataset.to === 'livrée') { o.t_livree = Date.now(); put('orders', O); } setStatus(b.dataset.dl, b.dataset.to); toast(b.dataset.to === 'livrée' ? '✓ Livrée et encaissée' : '🚚 En route'); }
    render();
  });

  /* ---------- caisse ---------- */
  let ticket = [], pay = 'Espèces', last = null, disc = 0;
  function pos() {
    const s = S(), P = products(), sub = ticket.reduce((a, i) => a + i.price * i.qty, 0), tot = Math.max(0, sub - disc);
    $('#view').innerHTML = '<div class="hd"><div><h2>Caisse</h2><p>Vente au comptoir. Le stock se met à jour tout seul.</p></div></div><div class="pos"><div>' +
      '<div class="tiles">' + P.map(p => { const st = stockOf(p.id), off = p.kit && s.available === false; return '<button class="tile" data-add="' + esc(p.id) + '"' + (off || !p.price ? ' disabled style="opacity:.5"' : '') + '>' + (p.img ? '<img src="' + p.img + '" alt="">' : '<span class="ph">🔌</span>') + '<b>' + esc(p.short || p.name) + '</b><small>' + (p.price ? money(p.price) : 'prix à définir') + '</small><span class="stk' + (st <= (p.alert != null ? p.alert : 3) ? ' low' : '') + '">Stock : ' + st + '</span></button>'; }).join('') +
      '<div class="tile free"><b>Article libre</b><input id="fName" placeholder="Désignation"><input id="fPrice" type="number" min="0" step="10" placeholder="Prix en DA"><button class="mb red" id="fAdd">Ajouter</button></div></div>' +
      (last ? '<div class="pn" style="margin-top:14px"><h3>Dernier ticket</h3><div class="rcpt">' + esc(last) + '</div><button class="mb" id="cpT">Copier le ticket</button></div>' : '') + '</div>' +
      '<aside class="tk"><b style="font-size:17px">Ticket en cours</b>' + (ticket.length ? ticket.map((i, k) => '<div class="ln"><div class="nm"><b>' + esc(i.name) + '</b><br><small>' + money(i.price) + '</small></div><div class="mini"><button data-q="' + k + '" data-d="-1" aria-label="Moins">−</button><b>' + i.qty + '</b><button data-q="' + k + '" data-d="1" aria-label="Plus">+</button></div></div>').join('') : '<div class="empty">Touchez un article pour l\'ajouter.</div>') +
      '<div class="ln"><span>Remise (DA)</span><input id="disc" type="number" min="0" step="100" value="' + (disc || '') + '" style="width:120px;padding:8px"></div>' +
      '<div class="tot"><span>Total</span><span>' + money(tot) + '</span></div><div class="seg2"><button data-p="Espèces" class="' + (pay === 'Espèces' ? 'on' : '') + '">💵 Espèces</button><button data-p="Carte" class="' + (pay === 'Carte' ? 'on' : '') + '">💳 Carte (CIB / Edahabia)</button></div>' +
      '<input id="clN" placeholder="Nom du client (facultatif)"><input id="clP" inputmode="tel" placeholder="Téléphone du client (facultatif)"><button class="btn btn-red big full" id="enc"' + (ticket.length ? '' : ' disabled') + '>Encaisser ' + money(tot) + '</button></aside></div>';
    $('#fAdd').onclick = () => { const n = $('#fName').value.trim(), p = Math.round(+$('#fPrice').value); if (!n || !(p > 0)) { toast('Désignation et prix'); return; } ticket.push({ pid: null, name: n, price: p, qty: 1 }); pos(); };
    $('#disc').onchange = e => { disc = Math.max(0, Math.round(+e.target.value || 0)); pos(); };
    if ($('#cpT')) $('#cpT').onclick = () => copy(last, '✓ Ticket copié');
    $('#enc').onclick = () => {
      if (!ticket.length) return;
      for (const i of ticket) if (i.pid && stockOf(i.pid) - i.qty < 0) { toast('⚠️ Stock insuffisant : ' + i.name); return; }
      const at = Date.now(), total = Math.max(0, ticket.reduce((a, i) => a + i.price * i.qty, 0) - disc);
      const items = ticket.slice(); if (disc) items.push({ pid: null, name: 'Remise', price: -disc, qty: 1, disc: true });
      const sl = get('sales', []); sl.unshift({ id: 's' + at.toString(36), at, items, pay, client: $('#clN').value.trim(), phone: $('#clP').value.replace(/\D/g, '') }); put('sales', sl);
      last = SHOP.name + '\n' + (SHOP.city || '') + ' · WhatsApp ' + (SHOP.whatsappShow || '') + '\n' + dfmt(at, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + '\n------------------------------\n' + items.map(i => i.qty + ' x ' + i.name + '\n   ' + money(i.price * i.qty)).join('\n') + '\n------------------------------\nTOTAL : ' + money(total) + '\nPaiement : ' + pay + '\nMerci de votre visite !';
      log('Vente caisse ' + money(total)); ticket = []; disc = 0; toast('✓ Vente encaissée · ' + money(total)); pos();
    };
  }
  document.addEventListener('click', e => {
    if (view !== 'pos') return;
    const a = e.target.closest('[data-add]'); if (a) { const p = prod(a.dataset.add); if (!p || !p.price) return; const ex = ticket.find(i => i.pid === p.id); if (ex) ex.qty++; else ticket.push({ pid: p.id, name: p.short || p.name, price: p.price, qty: 1, kit: !!p.kit }); pos(); return; }
    const qb = e.target.closest('[data-q]'); if (qb) { const i = ticket[+qb.dataset.q]; i.qty += +qb.dataset.d; if (i.qty <= 0) ticket.splice(+qb.dataset.q, 1); pos(); return; }
    const p = e.target.closest('[data-p]'); if (p) { pay = p.dataset.p; pos(); }
  });

  /* ---------- produits & stock ---------- */
  function stock() {
    const P = products();
    $('#view').innerHTML = '<div class="hd"><div><h2>Produits & stock</h2><p>Les ventes (site + caisse) sortent du stock automatiquement. Le prix d\'achat sert au calcul de la marge.</p></div></div>' +
      '<div class="pn"><div class="tw"><table class="t"><thead><tr><th>Produit</th><th>Prix de vente</th><th>Prix d\'achat</th><th>Marge / unité</th><th>Stock</th><th>Réception</th></tr></thead><tbody>' + P.map(p => { const st = stockOf(p.id), low = st <= (p.alert != null ? p.alert : 3);
        return '<tr><td><b>' + esc(p.short || p.name) + '</b>' + (p.kit ? '<br><small>réf. DHI-ART-ARC3000H-03-GW2(868) · prix réglé dans Réglages</small>' : '') + '</td><td>' + (p.kit ? money(p.price) : '<input type="number" min="0" step="10" data-pp="' + esc(p.id) + '" value="' + (p.price || '') + '" style="width:120px;padding:8px">') + '</td>' +
          '<td><input type="number" min="0" step="10" data-pc="' + esc(p.id) + '" value="' + (p.cost == null ? '' : p.cost) + '" placeholder="—" style="width:120px;padding:8px"></td><td>' + (p.price && p.cost != null ? money(p.price - p.cost) : '—') + '</td>' +
          '<td><b class="' + (low ? 'lowt' : '') + '">' + st + '</b>' + (low ? ' ⚠️' : '') + '</td><td><div class="acts"><input type="number" min="1" value="5" id="rq-' + esc(p.id) + '" style="width:70px;padding:8px" aria-label="Quantité reçue"><button class="mb red" data-rc="' + esc(p.id) + '">+ Ajouter</button>' + (p.kit ? '' : '<button class="mb" data-del="' + esc(p.id) + '" aria-label="Supprimer">🗑</button>') + '</div></td></tr>'; }).join('') + '</tbody></table></div></div>' +
      '<div class="grid2" style="margin-top:12px"><div class="pn"><h3>Ajouter un produit du magasin</h3><div class="frm"><div class="f"><label for="nN">Désignation</label><input id="nN" placeholder="ex. Câble rigide 2,5 mm² (rouleau 100 m)"></div><div class="row2"><div class="f"><label for="nP">Prix de vente (DA)</label><input id="nP" type="number" min="0" step="10"></div><div class="f"><label for="nC">Prix d\'achat (DA)</label><input id="nC" type="number" min="0" step="10"></div></div><div class="row2"><div class="f"><label for="nS">Stock initial</label><input id="nS" type="number" min="0" value="0"></div><div class="f"><label for="nA">Alerte stock bas</label><input id="nA" type="number" min="0" value="3"></div></div><button class="btn btn-red" id="nAdd">Ajouter le produit</button></div></div>' +
      '<div class="pn"><h3>Derniers mouvements</h3><div class="lst">' + movesList().slice(0, 14).map(h => '<div class="r"><span>' + dfmt(h.at, { day: '2-digit', month: '2-digit' }) + ' · ' + esc(h.note) + '</span><b style="color:' + (h.q > 0 ? '#16A34A' : 'var(--ink)') + '">' + (h.q > 0 ? '+' : '') + h.q + '</b></div>').join('') + '</div></div></div>';
    $('#nAdd').onclick = () => {
      const n = $('#nN').value.trim(), p = Math.round(+$('#nP').value), c = $('#nC').value === '' ? null : Math.round(+$('#nC').value), s0 = Math.max(0, Math.round(+$('#nS').value || 0)), al = Math.max(0, Math.round(+$('#nA').value || 0));
      if (!n || !(p > 0)) { toast('Désignation et prix de vente'); return; }
      const id = 'p' + Date.now().toString(36), L = get('products', []); L.push({ id, name: n, short: n, price: p, cost: c, alert: al }); put('products', L);
      if (s0) { const m = get('moves', []); m.push({ at: Date.now(), qty: s0, note: 'Stock initial · ' + n, pid: id }); put('moves', m); }
      log('Produit ajouté : ' + n); toast('✓ ' + n + ' ajouté'); stock();
    };
  }
  function movesList() {
    const name = id => { const p = prod(id); return p ? (p.short || p.name) : 'Article'; };
    return get('moves', []).map(m => ({ at: m.at, q: m.qty, note: m.note || ('Réception · ' + name(m.pid || 'kit')) }))
      .concat(get('sales', []).flatMap(x => x.items.filter(i => i.pid || i.kit).map(i => ({ at: x.at, q: -i.qty, note: 'Vente caisse · ' + i.name }))))
      .concat(get('orders', []).filter(counts).map(o => ({ at: o.at, q: -o.qty, note: 'Commande · ' + o.name })))
      .sort((a, b) => b.at - a.at);
  }
  document.addEventListener('click', e => {
    if (view !== 'stock') return;
    const r = e.target.closest('[data-rc]'); if (r) { const id = r.dataset.rc, qn = Math.round(+document.getElementById('rq-' + id).value); if (!(qn > 0)) return; const m = get('moves', []); m.push({ at: Date.now(), qty: qn, note: 'Réception · ' + ((prod(id) || {}).short || 'produit'), pid: id }); put('moves', m); log('Réception +' + qn + ' · ' + ((prod(id) || {}).short || id)); toast('✓ +' + qn + ' en stock'); stock(); return; }
    const d = e.target.closest('[data-del]'); if (d) { const L = get('products', []).filter(p => p.id !== d.dataset.del); put('products', L); log('Produit supprimé'); toast('Produit supprimé'); stock(); }
  });
  document.addEventListener('change', e => {
    if (view !== 'stock') return;
    const pc = e.target.closest('[data-pc]'), pp = e.target.closest('[data-pp]');
    if (pc) { const v = pc.value === '' ? null : Math.max(0, Math.round(+pc.value)); if (pc.dataset.pc === 'kit') save({ cost: v }); else { const L = get('products', []), p = L.find(x => x.id === pc.dataset.pc); if (p) { p.cost = v; put('products', L); } } toast('✓ Prix d\'achat enregistré'); stock(); }
    if (pp) { const v = Math.max(0, Math.round(+pp.value)); const L = get('products', []), p = L.find(x => x.id === pp.dataset.pp); if (p && v) { p.price = v; put('products', L); toast('✓ Prix de vente enregistré'); stock(); } }
  });

  /* ---------- clients ---------- */
  function clients() {
    const map = {};
    get('orders', []).forEach(o => { const k = o.phone; map[k] = map[k] || { name: o.name, phone: o.phone, wil: o.wil, n: 0, total: 0, last: 0 }; map[k].n++; if (o.status === 'livrée') map[k].total += orderTotal(o) || 0; map[k].last = Math.max(map[k].last, o.at); });
    get('sales', []).filter(x => x.phone).forEach(x => { const k = x.phone; map[k] = map[k] || { name: x.client || 'Client magasin', phone: x.phone, wil: 'Magasin', n: 0, total: 0, last: 0 }; map[k].n++; map[k].total += saleTotal(x); map[k].last = Math.max(map[k].last, x.at); });
    const L = Object.values(map).sort((a, b) => b.last - a.last);
    $('#view').innerHTML = '<div class="hd"><div><h2>Clients</h2><p>' + L.length + ' clients. Relancez-les pour une caméra, un détecteur en plus ou un ami à équiper.</p></div><button class="mb" id="cpC">Copier les numéros</button></div><div class="pn">' + (L.length ? '<div class="tw"><table class="t"><thead><tr><th>Client</th><th>Wilaya</th><th>Achats</th><th>Total encaissé</th><th>Dernier achat</th><th></th></tr></thead><tbody>' + L.map(c => '<tr><td><b>' + esc(c.name) + '</b><br><small>' + phoneFmt(c.phone) + '</small></td><td>' + esc(c.wil) + '</td><td>' + c.n + '</td><td>' + money(c.total) + '</td><td>' + dfmt(c.last, { day: '2-digit', month: '2-digit', year: 'numeric' }) + '</td><td><a class="mb wa" target="_blank" rel="noopener" href="' + wa(c.phone, 'Bonjour ' + c.name.split(' ')[0] + ', ici ' + SHOP.name + '. Votre alarme Dahua fonctionne bien ? Nous avons aussi des caméras et des détecteurs supplémentaires compatibles. Écrivez-nous si besoin !') + '">Relancer</a></td></tr>').join('') + '</tbody></table></div>' : '<div class="empty">Pas encore de client.</div>') + '</div>';
    $('#cpC').onclick = () => copy(L.map(c => c.name + '\t' + c.phone).join('\n'), '✓ Numéros copiés');
  }

  /* ---------- journal ---------- */
  function journal() {
    const L = get('log', []);
    $('#view').innerHTML = '<div class="hd"><div><h2>Journal</h2><p>Qui a fait quoi, et quand (gérant, caisse, livreur).</p></div></div><div class="pn"><div class="lst">' + (L.slice(0, 120).map(l => '<div class="r"><span>' + dfmt(l.at) + ' · <b>' + esc(l.who) + '</b> · ' + esc(l.txt) + '</span></div>').join('') || '<div class="empty">Rien pour l\'instant.</div>') + '</div></div>';
  }

  /* ---------- réglages ---------- */
  function settings() {
    const s = S(), W = window.WILAYAS, Z = s.zones;
    $('#view').innerHTML = '<div class="hd"><div><h2>Réglages</h2><p>Chaque changement s\'applique tout de suite à la page publique.</p></div></div>' +
      '<div class="grid2"><div class="pn"><h3>Prix et disponibilité du kit</h3><div class="frm">' +
      '<div class="row2"><div class="f"><label for="pP">Prix de vente (DA)</label><input id="pP" type="number" min="0" step="500" value="' + (s.price == null ? '' : s.price) + '"></div><div class="f"><label for="pO">Ancien prix barré (facultatif)</label><input id="pO" type="number" min="0" step="500" value="' + (s.oldPrice == null ? '' : s.oldPrice) + '"></div></div>' +
      '<div class="swr"><button class="sw ' + (s.available !== false ? 'on' : '') + '" id="av" role="switch" aria-checked="' + (s.available !== false) + '" aria-label="Disponible"></button><span>' + (s.available !== false ? 'En stock : on prend les commandes' : 'Rupture : la page propose de réserver') + '</span></div>' +
      '<div class="f"><label for="sA">Alerte de stock bas (kits)</label><input id="sA" type="number" min="0" value="' + s.stockAlert + '"></div><button class="btn btn-red" id="sv">Enregistrer</button></div></div>' +
      '<div class="pn"><h3>Frais de livraison par wilaya</h3><p class="note">Affichés au client dans le récapitulatif de commande. Wilaya non renseignée : « confirmée par téléphone ». 0 = livraison offerte.</p><div class="frm"><div class="row2"><div class="f"><label for="zW">Wilaya</label><select id="zW"><option value="">Choisir…</option><option value="*">Toutes les wilayas</option>' + W.map(w => '<option>' + esc(w) + '</option>').join('') + '</select></div><div class="f"><label for="zF">Frais (DA)</label><input id="zF" type="number" min="0" step="50"></div></div><button class="btn btn-ghost" style="color:var(--ink);border-color:var(--ink)" id="zAdd">Enregistrer ce tarif</button>' +
      '<div class="lst">' + (Object.keys(Z).sort().map(w => '<div class="r"><span>' + esc(w) + '</span><span><b>' + (+Z[w] === 0 ? 'Offerte' : money(+Z[w])) + '</b> <button class="mb" data-zd="' + esc(w) + '" aria-label="Retirer">✕</button></span></div>').join('') || '<div class="empty">Aucun tarif pour l\'instant.</div>') + '</div></div></div></div>' +
      '<div class="grid2" style="margin-top:12px"><div class="pn"><h3>Codes d\'accès</h3><div class="frm"><div class="row3"><div class="f"><label for="cM">Gérant</label><input id="cM" inputmode="numeric" maxlength="4" value="' + s.pins.manager + '"></div><div class="f"><label for="cC">Caisse</label><input id="cC" inputmode="numeric" maxlength="4" value="' + s.pins.cash + '"></div><div class="f"><label for="cD">Livreur</label><input id="cD" inputmode="numeric" maxlength="4" value="' + s.pins.driver + '"></div></div><button class="btn btn-ghost" style="color:var(--ink);border-color:var(--ink)" id="svp">Changer les codes</button></div></div>' +
      '<div class="pn"><h3>Sauvegarde et démo</h3><p class="note">Copiez toutes les données (commandes, ventes, stock) pour les garder.</p><div class="acts"><button class="mb" id="bk">Copier la sauvegarde</button><button class="mb" id="rst">Réinitialiser la démo</button></div></div></div>';
    $('#av').onclick = () => { save({ available: S().available === false }); log(S().available === false ? 'Kit mis en rupture' : 'Kit remis en stock'); toast(S().available === false ? '⛔ Rupture affichée sur la page' : '✓ De nouveau en stock'); settings(); };
    $('#sv').onclick = () => {
      const p = $('#pP').value === '' ? null : Math.round(+$('#pP').value), o = $('#pO').value === '' ? null : Math.round(+$('#pO').value);
      if (p != null && p < 1000) { toast('Prix trop bas : vérifiez'); return; }
      if (o != null && p != null && o <= p) { toast('L\'ancien prix doit être plus élevé que le prix'); return; }
      save({ price: p, oldPrice: o, stockAlert: Math.max(0, Math.round(+$('#sA').value || 0)) }); log('Prix du kit : ' + money(p) + (o ? ' (barré ' + money(o) + ')' : '')); toast('✓ Prix mis à jour sur la page'); settings();
    };
    $('#zAdd').onclick = () => { const w = $('#zW').value, f = $('#zF').value; if (!w || f === '' || +f < 0) { toast('Choisissez une wilaya et un montant'); return; } const z = Object.assign({}, S().zones); if (w === '*') W.forEach(x => { z[x] = Math.round(+f); }); else z[w] = Math.round(+f); save({ zones: z }); log('Livraison ' + (w === '*' ? 'toutes wilayas' : w) + ' : ' + money(+f)); toast('✓ Tarif enregistré'); settings(); };
    $('#svp').onclick = () => { const v = [$('#cM').value, $('#cC').value, $('#cD').value]; if (!v.every(x => /^\d{4}$/.test(x)) || new Set(v).size < 3) { toast('3 codes différents de 4 chiffres'); return; } save({ pins: { manager: v[0], cash: v[1], driver: v[2] } }); log('Codes d\'accès changés'); toast('✓ Codes changés'); };
    $('#bk').onclick = () => { const data = {}; ['settings', 'orders', 'sales', 'moves', 'products', 'log'].forEach(k => { data[k] = get(k, null); }); copy(JSON.stringify(data), '✓ Sauvegarde copiée'); };
    $('#rst').onclick = () => { ['orders', 'sales', 'moves', 'settings', 'products', 'log', 'seeded', 'seeded2'].forEach(k => { try { localStorage.removeItem('ads-' + k); } catch (e) { /* bloqué */ } }); try { bc && bc.postMessage('settings'); } catch (e) { /* ok */ } seed(); toast('✓ Démo réinitialisée'); settings(); };
  }
  document.addEventListener('click', e => { const z = e.target.closest('[data-zd]'); if (!z) return; const zz = Object.assign({}, S().zones); delete zz[z.dataset.zd]; save({ zones: zz }); toast('Tarif retiré'); settings(); });

  /* ---------- direct ---------- */
  const live = () => { if (!$('#app').hidden && ['settings', 'pos', 'stock'].indexOf(view) < 0) render(); };
  if (bc) bc.onmessage = live;
  addEventListener('storage', e => { if (e.key && e.key.indexOf('ads-') === 0) live(); });
  if (role) start();
})();
