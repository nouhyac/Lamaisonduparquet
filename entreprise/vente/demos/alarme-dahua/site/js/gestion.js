/* =====================================================================
   General Electric dz — système de gestion v3
   Multi-produits · 2 points de vente (stock séparé, transferts, inventaire)
   Rôles : gérant (tout) · caisse · livreur · magasinier
   ===================================================================== */
(function () {
  'use strict';
  const G = window.GE, SHOP = G.SHOP, esc = G.esc, money = G.money, get = G.get, put = G.put, S = G.S, save = G.save;
  const $ = s => document.querySelector(s), $$ = s => document.querySelectorAll(s);
  const DAY = 864e5;
  let role = null, pin = '', view = '';
  const ROLE_NAME = { manager: 'Gérant', cash: 'Caisse', driver: 'Livreur', store: 'Magasinier' };
  function log(txt) { const l = get('log', []); l.unshift({ at: Date.now(), who: ROLE_NAME[role] || '—', txt }); put('log', l.slice(0, 400)); }
  let tt; const toast = m => { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 2600); };
  const phoneFmt = p => String(p || '').replace(/(\d{4})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
  const wa = (p, msg) => 'https://wa.me/213' + String(p).replace(/^0/, '') + (msg ? '?text=' + encodeURIComponent(msg) : '');
  const dfmt = (t, o) => new Date(t).toLocaleString('fr-FR', o || { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  const sameDay = (a, b) => new Date(a).toDateString() === new Date(b).toDateString();
  const num = v => v === '' || v == null ? null : Math.max(0, Math.round(+v));
  const short = p => p ? (p.short || p.name) : 'Article';
  const itemsTxt = o => G.items(o).map(i => i.qty + ' × ' + i.name).join(', ');

  /* point de vente de travail (caisse, réception) */
  let here = 'mag'; try { here = sessionStorage.getItem('ads-depot') || 'mag'; } catch (e) { /* bloqué */ }
  const setHere = d => { here = d; try { sessionStorage.setItem('ads-depot', d); } catch (e) { /* bloqué */ } };

  /* ---------- données de démonstration ---------- */
  function seed() {
    const n = Date.now();
    if (!get('seeded', false)) {
      const names = [['Samir Belkacem', '0661452317', '16 Alger', 'Bab Ezzouar'], ['Nadia Haddad', '0770381256', '35 Boumerdès', 'Boudouaou'], ['Yacine Mansouri', '0552906144', '09 Blida', 'Ouled Yaïch'], ['Karima Saadi', '0699213487', '16 Alger', 'Dar El Beïda'], ['Mehdi Ouali', '0540778920', '15 Tizi Ouzou', 'Azazga'], ['Rania Benali', '0771620043', '42 Tipaza', 'Koléa'], ['Hocine Ferhat', '0663318872', '16 Alger', 'Rouïba']];
      const st = ['livrée', 'livrée', 'expédiée', 'confirmée', 'nouvelle', 'nouvelle', 'livrée'];
      const orders = get('orders', []);
      names.forEach((c, i) => orders.push({ id: 'demo' + i, demo: true, at: n - (i * 0.8 + 0.2) * DAY, name: c[0], phone: c[1], wil: c[2], com: c[3], adr: '', mode: 'livraison', depot: i % 3 === 1 ? 'dep' : 'mag', items: [{ pid: 'kit', name: G.KIT_NAME, price: S().price || 55000, qty: i === 2 ? 2 : 1 }], fee: null, status: st[i] }));
      put('orders', orders.sort((a, b) => b.at - a.at));
      put('sales', [{ id: 's1', demo: true, at: n - 3.1 * DAY, depot: 'mag', items: [{ pid: 'kit', name: G.KIT_NAME, qty: 1, price: S().price || 55000 }], pay: 'Espèces', client: '' }]);
      put('moves', [{ at: n - 6.5 * DAY, qty: 10, note: 'Réception fournisseur (démo)', pid: 'kit', depot: 'mag', kind: 'in' }, { at: n - 6.4 * DAY, qty: 6, note: 'Réception fournisseur (démo)', pid: 'kit', depot: 'dep', kind: 'in' }]);
      put('seeded', true); put('seed3', true);
    }
    if (!get('seed3', false)) { /* données v2 existantes : on ajoute le stock du dépôt */
      const m = get('moves', []); m.push({ at: n - 6.4 * DAY, qty: 6, note: 'Réception fournisseur (démo)', pid: 'kit', depot: 'dep', kind: 'in' }); put('moves', m);
      put('seed3', true);
    }
    if (!get('products', null)) put('products', []);
  }

  /* ---------- connexion ---------- */
  try { role = sessionStorage.getItem('ads-role'); } catch (e) { /* bloqué */ }
  if (role && !ROLE_NAME[role]) role = null;
  const GATE_T = { manager: 'Espace gérant', cash: 'Espace caisse', driver: 'Espace livreur', store: 'Espace magasinier' };
  function wanted() { const h = location.hash.slice(1); return GATE_T[h] ? h : null; }
  function showGate() {
    const w = wanted(); $('#gTitle').textContent = GATE_T[w || 'manager'];
    $('#gErr').textContent = ''; pin = ''; $$('#dots i').forEach(d => d.classList.remove('on'));
    $('#app').hidden = true; $('#gate').hidden = false;
  }
  function logout() { role = null; try { sessionStorage.removeItem('ads-role'); } catch (e) { /* bloqué */ } }
  if (wanted() && role && wanted() !== role) logout();
  window.addEventListener('hashchange', () => { const w = wanted(); if (!w || w === role) return; logout(); showGate(); window.scrollTo(0, 0); });
  if (!role) showGate();
  $('#pad').innerHTML = [1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'].map(k => k === '' ? '<span></span>' : '<button data-k="' + k + '" aria-label="' + (k === '⌫' ? 'Effacer' : k) + '">' + k + '</button>').join('');
  $('#pad').addEventListener('click', e => {
    const b = e.target.closest('[data-k]'); if (!b) return;
    pin = b.dataset.k === '⌫' ? pin.slice(0, -1) : (pin + b.dataset.k).slice(0, 4);
    $$('#dots i').forEach((d, i) => d.classList.toggle('on', i < pin.length));
    if (pin.length === 4) {
      const p = S().pins; role = Object.keys(ROLE_NAME).find(r => p[r] === pin) || null;
      if (role) { try { sessionStorage.setItem('ads-role', role); } catch (x) { /* bloqué */ } try { history.replaceState(null, '', '#' + role); window.dispatchEvent(new Event('hashchange')); } catch (x) { /* bloqué */ } log('Connexion'); start(); } else $('#gErr').textContent = 'Code incorrect';
      pin = ''; setTimeout(() => $$('#dots i').forEach(d => d.classList.remove('on')), 200);
    }
  });
  document.addEventListener('keydown', e => { if (!$('#gate').hidden && /^\d$/.test(e.key)) { const b = $('#pad [data-k="' + e.key + '"]'); b && b.click(); } });
  $('#out').onclick = () => { logout(); location.reload(); };

  const TABS = {
    manager: [['dash', '📊 Tableau de bord'], ['orders', '🛒 Commandes'], ['delivery', '🚚 Livraisons'], ['pos', '💳 Caisse'], ['catalog', '🏷️ Produits'], ['stock', '📦 Stock & dépôts'], ['clients', '👥 Clients'], ['journal', '🕓 Journal'], ['settings', '⚙️ Réglages']],
    cash: [['pos', '💳 Caisse'], ['orders', '🛒 Commandes']],
    driver: [['delivery', '🚚 Mes livraisons']],
    store: [['stock', '📦 Stock & dépôts'], ['catalog', '🏷️ Produits']]
  };
  function depSelect() {
    if (role === 'driver') { $('#depWrap').hidden = true; return; }
    $('#depWrap').hidden = false;
    $('#dep').innerHTML = G.depots().map(d => '<option value="' + esc(d.id) + '"' + (d.id === here ? ' selected' : '') + '>' + esc(d.name) + '</option>').join('');
  }
  $('#dep').onchange = e => { setHere(e.target.value); toast('📍 ' + G.depName(here)); render(); };
  function start() { seed(); $('#gate').hidden = true; $('#app').hidden = false; $('#tabs').innerHTML = TABS[role].map(([k, l]) => '<button data-v="' + k + '">' + l + '</button>').join(''); $('#who').textContent = ROLE_NAME[role]; depSelect(); go(TABS[role][0][0]); }
  $('#tabs').addEventListener('click', e => { const b = e.target.closest('[data-v]'); if (b) go(b.dataset.v); });
  function go(v) { view = v; edit = null; $$('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.v === v)); render(); scrollTo(0, 0); }
  function render() { ({ dash, orders, delivery, pos, catalog, stock, clients, journal, settings })[view](); }
  document.addEventListener('click', e => { const g = e.target.closest('[data-go]'); if (g) go(g.dataset.go); });
  function copy(txt, ok) { (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => toast(ok)).catch(() => toast('Copie impossible ici : sélectionnez le texte')); }

  /* ---------- coûts et marge ---------- */
  function costLines() { /* [coût connu ?, coût total] des ventes encaissées */
    let known = true, cost = 0;
    const add = (pid, qty) => { const p = G.prod(pid); if (!p || p.cost == null) known = false; else cost += p.cost * qty; };
    get('orders', []).filter(o => o.status === 'livrée').forEach(o => G.items(o).forEach(i => add(i.pid, i.qty)));
    get('sales', []).forEach(x => x.items.forEach(i => { if (i.disc) return; const pid = G.ipid(i); if (pid) add(pid, i.qty); else known = false; }));
    return [known, cost];
  }

  /* ---------- tableau de bord ---------- */
  function dash() {
    const O = get('orders', []), SL = get('sales', []), now = Date.now(), D = G.depots(), P = G.products();
    const days = [...Array(7)].map((_, i) => now - (6 - i) * DAY);
    const delivered = O.filter(o => o.status === 'livrée');
    const revOn = d => delivered.filter(o => sameDay(o.t_livree || o.at, d)).reduce((a, o) => a + (G.orderTotal(o) || 0), 0) + SL.filter(x => sameDay(x.at, d)).reduce((a, x) => a + G.saleTotal(x), 0);
    const per = days.map(revOn), max = Math.max(1, ...per);
    const caDep = id => delivered.filter(o => G.odep(o) === id).reduce((a, o) => a + (G.orderTotal(o) || 0), 0) + SL.filter(x => G.sdep(x) === id).reduce((a, x) => a + G.saleTotal(x), 0);
    const ca = D.reduce((a, d) => a + caDep(d.id), 0);
    const [known, cost] = costLines(), fees = delivered.reduce((a, o) => a + (o.fee || 0), 0);
    const marge = known ? ca - cost - fees : null;
    let valKnown = true; const val = P.reduce((a, p) => { const st = Math.max(0, G.stockOf(p.id)); if (st && p.cost == null) valKnown = false; return a + (p.cost || 0) * st; }, 0);
    const decided = O.filter(o => o.status !== 'nouvelle'), conf = decided.length ? Math.round(decided.filter(o => o.status !== 'annulée').length / decided.length * 100) : null;
    const todo = O.filter(o => o.status === 'nouvelle').length, toDeliver = O.filter(o => (o.status === 'confirmée' || o.status === 'expédiée') && o.mode !== 'retrait').length, pick = O.filter(o => o.status === 'confirmée' && o.mode === 'retrait').length;
    const lows = []; P.forEach(p => D.forEach(d => { const st = G.stockOf(p.id, d.id); if (st <= G.lowOf(p)) lows.push(short(p) + ' · ' + d.name + ' (' + st + ')'); }));
    const sold = {}; delivered.forEach(o => G.items(o).forEach(i => { sold[i.pid] = (sold[i.pid] || 0) + i.qty; })); SL.forEach(x => x.items.forEach(i => { const pid = G.ipid(i); if (pid) sold[pid] = (sold[pid] || 0) + i.qty; }));
    const top = Object.entries(sold).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const todayN = O.filter(o => sameDay(o.at, now)).length;
    $('#view').innerHTML = '<div class="hd"><div><h2>Bonjour 👋</h2><p>' + esc(SHOP.name) + ' · ' + new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) + '</p></div><div class="acts"><button class="mb" data-go="orders">À confirmer : <b>' + todo + '</b></button><button class="mb" data-go="delivery">À livrer : <b>' + toDeliver + '</b></button>' + (pick ? '<button class="mb" data-go="orders">Retraits à préparer : <b>' + pick + '</b></button>' : '') + '</div></div>' +
      (lows.length ? '<p class="note warnline">⚠️ Stock bas : ' + lows.slice(0, 6).map(esc).join(' · ') + (lows.length > 6 ? ' …' : '') + ' <button class="mb" data-go="stock">Voir le stock</button></p>' : '') +
      '<div class="kp"><div><small>Chiffre d\'affaires encaissé</small><b>' + money(ca) + '</b><em>commandes livrées + caisses</em></div>' +
      '<div><small>Marge</small><b>' + (marge == null ? '—' : money(marge)) + '</b><em>' + (marge == null ? 'indiquez les prix d\'achat (Produits)' : 'après prix d\'achat et livraisons') + '</em></div>' +
      '<div><small>Valeur du stock</small><b>' + (valKnown ? money(val) : '—') + '</b><em>' + (valKnown ? 'au prix d\'achat, ' + D.length + ' points de vente' : 'indiquez les prix d\'achat') + '</em></div>' +
      '<div><small>Commandes</small><b>' + todayN + ' <span style="font-size:15px;color:var(--muted)">aujourd\'hui</span></b><em>' + O.length + ' au total · confirmation ' + (conf == null ? '—' : conf + ' %') + '</em></div></div>' +
      '<div class="grid2"><div class="pn"><h3>Chiffre d\'affaires · 7 derniers jours</h3><div class="bars">' + per.map((v, i) => '<div title="' + money(v) + '"><em>' + (v ? Math.round(v / 1000) + 'k' : '0') + '</em><i style="height:' + (v / max * 100) + '%"></i><span>' + new Date(days[i]).toLocaleDateString('fr-FR', { weekday: 'short' }) + '</span></div>').join('') + '</div><div style="height:22px"></div></div>' +
      '<div class="pn"><h3>Par point de vente</h3><div class="lst">' + D.map(d => { const c = caDep(d.id), w = ca ? Math.round(c / ca * 100) : 0; return '<div class="r col"><div class="rr"><span>📍 ' + esc(d.name) + '</span><b>' + money(c) + '</b></div><div class="meter"><i style="width:' + w + '%"></i></div><small>' + w + ' % du chiffre d\'affaires · ' + P.reduce((a, p) => a + Math.max(0, G.stockOf(p.id, d.id)), 0) + ' articles en stock</small></div>'; }).join('') + '</div></div></div>' +
      '<div class="grid2" style="margin-top:12px"><div class="pn"><h3>Dernières commandes</h3>' + orderTable(O.slice(0, 5), true) + '</div>' +
      '<div class="pn"><h3>Meilleures ventes</h3><div class="lst">' + (top.map(([pid, c]) => '<div class="r"><span>' + esc(short(G.prod(pid))) + '</span><b>' + c + '</b></div>').join('') || '<div class="empty">Pas encore de vente.</div>') + '</div></div></div>' +
      '<p class="note" style="margin-top:12px">Démo : quelques commandes d\'exemple sont préremplies (Réglages → Réinitialiser pour repartir de zéro). Les commandes passées sur la boutique arrivent ici en direct.</p>';
  }

  /* ---------- commandes ---------- */
  const ST = ['nouvelle', 'confirmée', 'expédiée', 'livrée', 'annulée'];
  let filt = 'toutes', q = '';
  const where = o => o.mode === 'retrait' ? 'Retrait au ' + G.depName(G.odep(o)) : 'Livraison à ' + o.com + ' (' + o.wil + ')';
  const confirmMsg = o => 'Bonjour ' + o.name.split(' ')[0] + ', ici ' + SHOP.name + '. Nous confirmons votre commande : ' + itemsTxt(o) + (G.orderSub(o) != null ? ' = ' + money(G.orderSub(o)) : '') +
    (o.mode === 'retrait' ? '. Elle vous attend au ' + G.depName(G.odep(o)) + ' : ' + G.depot(G.odep(o)).maps + '. Paiement au retrait.' : (o.fee != null ? ', livraison ' + (o.fee ? money(o.fee) : 'offerte') + ', total ' + money(G.orderTotal(o)) : ', frais de livraison à confirmer') + '. ' + where(o) + '.') + ' Merci de votre confiance !';
  const bon = o => SHOP.name + ' · WhatsApp ' + (SHOP.whatsappShow || '') + '\n' + (o.mode === 'retrait' ? 'BON DE RETRAIT' : 'BON DE LIVRAISON') + ' n° ' + String(o.id).toUpperCase() + '\nDate : ' + dfmt(o.at) + '\nPréparé au : ' + G.depName(G.odep(o)) + '\n------------------------------\nClient : ' + o.name + '\nTél. : ' + phoneFmt(o.phone) + '\n' + (o.mode === 'retrait' ? 'Retrait en magasin' : 'Adresse : ' + (o.adr ? o.adr + ', ' : '') + o.com + ', ' + o.wil) + '\n------------------------------\n' +
    G.items(o).map(i => i.qty + ' x ' + i.name + '\n   ' + (i.price == null ? '—' : money(i.price * i.qty))).join('\n') + (o.mode === 'retrait' ? '' : '\nLivraison : ' + (o.fee == null ? 'à confirmer' : o.fee ? money(o.fee) : 'offerte')) + '\nTOTAL À ENCAISSER : ' + money(G.orderTotal(o)) + '\n------------------------------\nSignature client :';
  function orderTable(L, compact) {
    if (!L.length) return '<div class="empty">Aucune commande.</div>';
    const D = G.depots();
    return '<div class="tw"><table class="t"><thead><tr><th>Date</th><th>Client</th><th>Articles</th><th>Livraison / retrait</th>' + (compact ? '' : '<th>Préparée au</th>') + '<th>Total</th><th>Statut</th>' + (compact ? '' : '<th>Actions</th>') + '</tr></thead><tbody>' + L.map(o =>
      '<tr><td>' + dfmt(o.at) + (o.src ? '<br><small>' + esc(o.src) + '</small>' : '') + '</td><td><b>' + esc(o.name) + '</b><br><small>' + phoneFmt(o.phone) + '</small></td><td>' + G.items(o).map(i => '<div>' + i.qty + ' × ' + esc(i.name) + '</div>').join('') + '</td>' +
      '<td>' + (o.mode === 'retrait' ? '🏬 Retrait<br><small>' + esc(G.depName(G.odep(o))) + '</small>' : esc(o.wil) + '<br><small>' + esc(o.com) + (o.adr ? ' · ' + esc(o.adr) : '') + '</small>') + '</td>' +
      (compact ? '' : '<td><select data-od="' + esc(o.id) + '" aria-label="Point de vente qui prépare">' + D.map(d => '<option value="' + esc(d.id) + '"' + (d.id === G.odep(o) ? ' selected' : '') + '>' + esc(d.name) + '</option>').join('') + '</select></td>') +
      '<td>' + money(G.orderTotal(o)) + (o.fee == null && o.mode !== 'retrait' ? '<br><small>+ livraison</small>' : '') + '</td>' +
      '<td>' + (compact ? '<span class="st2 s-' + o.status + '">' + o.status + '</span>' : '<select data-st="' + esc(o.id) + '" aria-label="Statut">' + ST.map(s => '<option' + (s === o.status ? ' selected' : '') + '>' + s + '</option>').join('') + '</select>') + '</td>' +
      (compact ? '' : '<td><div class="acts"><a class="mb wa" target="_blank" rel="noopener" href="' + wa(o.phone, confirmMsg(o)) + '">Confirmer WhatsApp</a><a class="mb" href="tel:' + esc(o.phone) + '">Appeler</a><button class="mb" data-bon="' + esc(o.id) + '">Bon</button></div></td>') + '</tr>' +
      (compact ? '' : '<tr class="bonrow" id="bon-' + esc(o.id) + '" hidden><td colspan="8"><div class="rcpt">' + esc(bon(o)) + '</div><button class="mb" data-copy="' + esc(o.id) + '">Copier le bon</button></td></tr>')).join('') + '</tbody></table></div>';
  }
  function orders() {
    const O = get('orders', []);
    const L = O.filter(o => (filt === 'toutes' || o.status === filt) && (!q || (o.name + ' ' + o.phone + ' ' + o.wil + ' ' + o.com + ' ' + itemsTxt(o)).toLowerCase().includes(q.toLowerCase())));
    $('#view').innerHTML = '<div class="hd"><div><h2>Commandes</h2><p>Boutique en ligne et page produit, en direct. Choisissez le point de vente qui prépare : le stock sort de chez lui.</p></div><button class="mb" id="csv">Copier pour Excel</button></div>' +
      '<div class="bar2"><div class="flt">' + ['toutes'].concat(ST).map(s => '<button data-f="' + s + '" class="' + (s === filt ? 'on' : '') + '">' + s + ' <b>' + (s === 'toutes' ? O.length : O.filter(o => o.status === s).length) + '</b></button>').join('') + '</div><input id="q" placeholder="Rechercher : nom, téléphone, wilaya, produit…" value="' + esc(q) + '" aria-label="Rechercher une commande"></div><div class="pn">' + orderTable(L) + '</div>';
    $('#q').oninput = e => { q = e.target.value; const p = e.target.selectionStart; orders(); const i = $('#q'); i.focus(); i.setSelectionRange(p, p); };
    $('#csv').onclick = () => { const rows = [['Date', 'Nom', 'Téléphone', 'Mode', 'Wilaya', 'Commune', 'Adresse', 'Articles', 'Point de vente', 'Livraison', 'Total', 'Statut']].concat(O.map(o => [dfmt(o.at), o.name, o.phone, o.mode || 'livraison', o.wil || '', o.com || '', o.adr || '', itemsTxt(o), G.depName(G.odep(o)), o.fee == null ? '' : o.fee, G.orderTotal(o) || '', o.status])); copy(rows.map(r => r.join('\t')).join('\n'), '✓ Copié : collez dans Excel'); };
  }
  document.addEventListener('click', e => {
    const f = e.target.closest('[data-f]'); if (f) { filt = f.dataset.f; orders(); return; }
    const b = e.target.closest('[data-bon]'); if (b) { const r = document.getElementById('bon-' + b.dataset.bon); if (r) r.hidden = !r.hidden; return; }
    const c = e.target.closest('[data-copy]'); if (c) { const o = get('orders', []).find(x => x.id === c.dataset.copy); if (o) copy(bon(o), '✓ Bon copié'); }
  });
  function setStatus(id, st, note) {
    const O = get('orders', []), o = O.find(x => x.id === id); if (!o) return;
    if (!G.counts(o) && st !== 'nouvelle' && st !== 'annulée') { const short_ = G.items(o).filter(i => G.stockOf(i.pid, G.odep(o)) - i.qty < 0); if (short_.length) toast('⚠️ Stock insuffisant au ' + G.depName(G.odep(o)) + ' : ' + short_.map(i => i.name).join(', ')); }
    o.status = st; if (st === 'livrée') { o.paid = true; o.t_livree = o.t_livree || Date.now(); } if (note) o.note = note; put('orders', O); log('Commande ' + o.name + ' → ' + st);
  }
  document.addEventListener('change', e => {
    const s = e.target.closest('[data-st]'); if (s) { setStatus(s.dataset.st, s.value); toast('✓ Commande ' + s.value); render(); return; }
    const d = e.target.closest('[data-od]'); if (d) { const O = get('orders', []), o = O.find(x => x.id === d.dataset.od); if (o) { o.depot = d.value; put('orders', O); log('Commande ' + o.name + ' préparée au ' + G.depName(d.value)); toast('📍 Préparée au ' + G.depName(d.value)); render(); } }
  });

  /* ---------- livraisons ---------- */
  function delivery() {
    const all = get('orders', []).filter(o => o.mode !== 'retrait');
    const L = all.filter(o => o.status === 'confirmée' || o.status === 'expédiée').sort((a, b) => a.at - b.at);
    const done = all.filter(o => o.status === 'livrée' && sameDay(o.t_livree || o.at, Date.now()));
    $('#view').innerHTML = '<div class="hd"><div><h2>' + (role === 'driver' ? 'Mes livraisons' : 'Livraisons') + '</h2><p>' + L.length + ' à livrer · où récupérer le colis et combien encaisser sont indiqués sur chaque carte.</p></div></div>' +
      (L.length ? '<div class="dl">' + L.map(o => {
        const adr = (o.adr ? o.adr + ', ' : '') + o.com + ', ' + o.wil.replace(/^\d+ /, ''), dp = G.depot(G.odep(o));
        return '<div class="dcard"><div class="dtop"><b>' + esc(o.name) + '</b><span class="st2 s-' + o.status + '">' + o.status + '</span></div>' +
          '<div class="dpick">📦 Récupérer au <b>' + esc(dp.name) + '</b> · <a href="' + esc(dp.maps) + '" target="_blank" rel="noopener">itinéraire</a></div>' +
          '<div class="dadr">📍 ' + esc(adr) + '</div><div class="ditems">' + G.items(o).map(i => i.qty + ' × ' + esc(i.name)).join('<br>') + '</div><div class="dmt">À encaisser : <b>' + money(G.orderTotal(o)) + '</b>' + (o.fee == null ? ' <small>+ livraison</small>' : '') + '</div>' +
          '<div class="acts"><a class="mb" href="tel:' + esc(o.phone) + '">📞 Appeler</a><a class="mb wa" target="_blank" rel="noopener" href="' + wa(o.phone, 'Bonjour ' + o.name.split(' ')[0] + ', ici le livreur de ' + SHOP.name + '. Je suis en route pour vous livrer votre commande. À tout de suite !') + '">WhatsApp</a><a class="mb" target="_blank" rel="noopener" href="https://maps.google.com/?q=' + encodeURIComponent(adr + ', Algérie') + '">🗺️ Itinéraire client</a></div>' +
          '<div class="acts">' + (o.status === 'confirmée' ? '<button class="mb" data-dl="' + esc(o.id) + '" data-to="expédiée">🚚 En route</button>' : '') + '<button class="mb red" data-dl="' + esc(o.id) + '" data-to="livrée">✓ Livrée et encaissée</button><button class="mb" data-dl="' + esc(o.id) + '" data-to="report">↩︎ Reporter</button></div>' + (o.note ? '<small class="dnote">Note : ' + esc(o.note) + '</small>' : '') + '</div>'; }).join('') + '</div>' : '<div class="pn"><div class="empty">Rien à livrer pour l\'instant. 👍</div></div>') +
      '<div class="pn" style="margin-top:12px"><h3>Livrées aujourd\'hui</h3><div class="lst">' + (done.map(o => '<div class="r"><span>' + esc(o.name) + ' · ' + esc(o.com) + '</span><b>' + money(G.orderTotal(o)) + '</b></div>').join('') || '<div class="empty">Aucune pour l\'instant.</div>') + '</div></div>';
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-dl]'); if (!b) return;
    if (b.dataset.to === 'report') { setStatus(b.dataset.dl, 'confirmée', 'Reportée le ' + dfmt(Date.now())); toast('↩︎ Livraison reportée'); }
    else { setStatus(b.dataset.dl, b.dataset.to); toast(b.dataset.to === 'livrée' ? '✓ Livrée et encaissée' : '🚚 En route'); }
    render();
  });

  /* ---------- caisse ---------- */
  let ticket = [], pay = 'Espèces', last = null, disc = 0, pq = '', pcat = '';
  function pos() {
    const P = G.products().filter(p => p.price), cs = G.cats();
    const L = P.filter(p => (!pcat || p.cat === pcat) && (!pq || (p.name + ' ' + (p.ref || '') + ' ' + (p.brand || '')).toLowerCase().includes(pq.toLowerCase())));
    const sub = ticket.reduce((a, i) => a + i.price * i.qty, 0), tot = Math.max(0, sub - disc);
    $('#view').innerHTML = '<div class="hd"><div><h2>Caisse · ' + esc(G.depName(here)) + '</h2><p>Le stock sort du point de vente choisi en haut. Douchette code-barres : scannez dans la recherche.</p></div></div><div class="pos"><div>' +
      '<div class="bar2"><input id="pq" placeholder="🔍 Nom, marque, référence ou code-barres…" value="' + esc(pq) + '" aria-label="Rechercher un produit">' + (cs.length > 1 ? '<div class="flt">' + [''].concat(cs).map(c => '<button data-pc="' + esc(c) + '" class="' + (c === pcat ? 'on' : '') + '">' + esc(c || 'Tout') + '</button>').join('') + '</div>' : '') + '</div>' +
      '<div class="tiles">' + L.map(p => { const st = G.stockOf(p.id, here); return '<button class="tile" data-add="' + esc(p.id) + '"' + (st <= 0 ? ' aria-disabled="true"' : '') + '>' + (p.img ? '<img src="' + esc(p.img) + '" alt="">' : '<span class="ph">🔌</span>') + '<b>' + esc(short(p)) + '</b><small>' + money(p.price) + '</small><span class="stk' + (st <= G.lowOf(p) ? ' low' : '') + '">Stock ici : ' + st + '</span></button>'; }).join('') +
      '<div class="tile free"><b>Article libre</b><input id="fName" placeholder="Désignation" aria-label="Désignation"><input id="fPrice" type="number" min="0" step="10" placeholder="Prix en DA" aria-label="Prix"><button class="mb red" id="fAdd">Ajouter</button></div></div>' +
      (L.length ? '' : '<div class="pn" style="margin-top:10px"><div class="empty">Aucun produit trouvé.</div></div>') +
      (last ? '<div class="pn" style="margin-top:14px"><h3>Dernier ticket</h3><div class="rcpt">' + esc(last) + '</div><button class="mb" id="cpT">Copier le ticket</button></div>' : '') + '</div>' +
      '<aside class="tk"><b style="font-size:17px">Ticket en cours</b>' + (ticket.length ? ticket.map((i, k) => '<div class="ln"><div class="nm"><b>' + esc(i.name) + '</b><br><small>' + money(i.price) + '</small></div><div class="mini"><button data-q="' + k + '" data-d="-1" aria-label="Moins">−</button><b>' + i.qty + '</b><button data-q="' + k + '" data-d="1" aria-label="Plus">+</button></div></div>').join('') : '<div class="empty">Touchez un article pour l\'ajouter.</div>') +
      '<div class="ln"><span>Remise (DA)</span><input id="disc" type="number" min="0" step="100" value="' + (disc || '') + '" style="width:120px;padding:8px" aria-label="Remise"></div>' +
      '<div class="tot"><span>Total</span><span>' + money(tot) + '</span></div><div class="seg2"><button data-p="Espèces" class="' + (pay === 'Espèces' ? 'on' : '') + '">💵 Espèces</button><button data-p="Carte" class="' + (pay === 'Carte' ? 'on' : '') + '">💳 Carte (CIB / Edahabia)</button></div>' +
      '<input id="clN" placeholder="Nom du client (facultatif)" aria-label="Nom du client"><input id="clP" inputmode="tel" placeholder="Téléphone du client (facultatif)" aria-label="Téléphone du client"><button class="btn btn-red big full" id="enc"' + (ticket.length ? '' : ' disabled') + '>Encaisser ' + money(tot) + '</button></aside></div>';
    $('#pq').oninput = e => { pq = e.target.value; const p = e.target.selectionStart; pos(); const i = $('#pq'); i.focus(); i.setSelectionRange(p, p); };
    $('#pq').onkeydown = e => { if (e.key !== 'Enter') return; const v = pq.trim().toLowerCase(); const m = G.products().find(p => p.price && p.ref && p.ref.toLowerCase() === v) || (L.length === 1 ? L[0] : null); if (m) { addTicket(m); pq = ''; pos(); $('#pq').focus(); } };
    $('#fAdd').onclick = () => { const n = $('#fName').value.trim(), p = Math.round(+$('#fPrice').value); if (!n || !(p > 0)) { toast('Désignation et prix'); return; } ticket.push({ pid: null, name: n, price: p, qty: 1 }); pos(); };
    $('#disc').onchange = e => { disc = Math.max(0, Math.round(+e.target.value || 0)); pos(); };
    if ($('#cpT')) $('#cpT').onclick = () => copy(last, '✓ Ticket copié');
    $('#enc').onclick = () => {
      if (!ticket.length) return;
      for (const i of ticket) if (i.pid && G.stockOf(i.pid, here) - i.qty < 0) { toast('⚠️ Stock insuffisant au ' + G.depName(here) + ' : ' + i.name); return; }
      const at = Date.now(), total = Math.max(0, ticket.reduce((a, i) => a + i.price * i.qty, 0) - disc);
      const items = ticket.slice(); if (disc) items.push({ pid: null, name: 'Remise', price: -disc, qty: 1, disc: true });
      const sl = get('sales', []); sl.unshift({ id: 's' + at.toString(36), at, depot: here, items, pay, client: $('#clN').value.trim(), phone: $('#clP').value.replace(/\D/g, '') }); put('sales', sl);
      last = SHOP.name + ' · ' + G.depName(here) + '\nWhatsApp ' + (SHOP.whatsappShow || '') + '\n' + dfmt(at, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + '\n------------------------------\n' + items.map(i => i.qty + ' x ' + i.name + '\n   ' + money(i.price * i.qty)).join('\n') + '\n------------------------------\nTOTAL : ' + money(total) + '\nPaiement : ' + pay + '\nMerci de votre visite !';
      log('Vente caisse ' + G.depName(here) + ' · ' + money(total)); ticket = []; disc = 0; toast('✓ Vente encaissée · ' + money(total)); pos();
    };
  }
  function addTicket(p) { if (G.stockOf(p.id, here) - ((ticket.find(i => i.pid === p.id) || {}).qty || 0) <= 0) { toast('⚠️ Plus de stock au ' + G.depName(here) + ' : ' + short(p)); return; } const ex = ticket.find(i => i.pid === p.id); if (ex) ex.qty++; else ticket.push({ pid: p.id, name: short(p), price: p.price, qty: 1 }); }
  document.addEventListener('click', e => {
    if (view !== 'pos') return;
    const a = e.target.closest('[data-add]'); if (a) { const p = G.prod(a.dataset.add); if (p && p.price) { addTicket(p); pos(); } return; }
    const c = e.target.closest('[data-pc]'); if (c) { pcat = c.dataset.pc; pos(); return; }
    const qb = e.target.closest('[data-q]'); if (qb) { const i = ticket[+qb.dataset.q]; if (+qb.dataset.d > 0 && i.pid && G.stockOf(i.pid, here) - i.qty <= 0) { toast('⚠️ Plus de stock ici'); return; } i.qty += +qb.dataset.d; if (i.qty <= 0) ticket.splice(+qb.dataset.q, 1); pos(); return; }
    const p = e.target.closest('[data-p]'); if (p) { pay = p.dataset.p; pos(); }
  });

  /* ---------- produits (catalogue) ---------- */
  let edit = null, cq = '', ccat = '', imp = null, newImg = null;
  const canPrice = () => role === 'manager';
  function catalog() {
    const P = G.products(), cs = G.cats(), D = G.depots();
    const L = P.filter(p => (!ccat || p.cat === ccat) && (!cq || (p.name + ' ' + (p.ref || '') + ' ' + (p.brand || '') + ' ' + (p.cat || '')).toLowerCase().includes(cq.toLowerCase())));
    const e0 = edit && edit !== 'new' ? G.prod(edit) : null;
    $('#view').innerHTML = '<div class="hd"><div><h2>Produits</h2><p>' + P.length + ' produit' + (P.length > 1 ? 's' : '') + ' · ' + cs.length + ' catégorie' + (cs.length > 1 ? 's' : '') + '. Tout ce qui est « en ligne » apparaît tout de suite dans la boutique.</p></div>' +
      (canPrice() ? '<div class="acts"><button class="mb red" id="pNew">+ Nouveau produit</button><button class="mb" id="pImp">⬆︎ Importer depuis Excel</button></div>' : '') + '</div>' +
      (edit ? editor(e0) : '') + (imp ? importer() : '') +
      '<div class="bar2"><input id="cq" placeholder="🔍 Rechercher un produit, une marque, une référence…" value="' + esc(cq) + '" aria-label="Rechercher un produit">' + (cs.length > 1 ? '<div class="flt">' + [''].concat(cs).map(c => '<button data-cc="' + esc(c) + '" class="' + (c === ccat ? 'on' : '') + '">' + esc(c || 'Toutes') + '</button>').join('') + '</div>' : '') + '</div>' +
      '<div class="pn"><div class="tw"><table class="t"><thead><tr><th>Produit</th><th>Catégorie</th><th>Prix de vente</th>' + (canPrice() ? '<th>Achat</th><th>Marge</th>' : '') + D.map(d => '<th>' + esc(d.name) + '</th>').join('') + '<th>En ligne</th>' + (canPrice() ? '<th></th>' : '') + '</tr></thead><tbody>' +
      (L.map(p => '<tr><td><div class="pcell">' + (p.img ? '<img src="' + esc(p.img) + '" alt="">' : '<span class="ph">🔌</span>') + '<div><b>' + esc(short(p)) + '</b><br><small>' + esc([p.brand, p.ref].filter(Boolean).join(' · ')) + '</small></div></div></td><td>' + esc(p.cat || '—') + '</td><td>' + money(p.price) + (p.oldPrice ? '<br><small><s>' + money(p.oldPrice) + '</s></small>' : '') + '</td>' +
        (canPrice() ? '<td>' + money(p.cost) + '</td><td>' + (p.price && p.cost != null ? money(p.price - p.cost) + '<br><small>' + Math.round((p.price - p.cost) / p.price * 100) + ' %</small>' : '—') + '</td>' : '') +
        D.map(d => { const st = G.stockOf(p.id, d.id); return '<td><b class="' + (st <= G.lowOf(p) ? 'lowt' : '') + '">' + st + '</b></td>'; }).join('') +
        '<td>' + (canPrice() ? '<button class="sw ' + (p.web ? 'on' : '') + '" data-web="' + esc(p.id) + '" role="switch" aria-checked="' + !!p.web + '" aria-label="En ligne : ' + esc(short(p)) + '"></button>' : (p.web ? 'Oui' : 'Non')) + '</td>' +
        (canPrice() ? '<td><div class="acts"><button class="mb" data-ed="' + esc(p.id) + '">Modifier</button>' + (p.kit ? '' : '<button class="mb" data-del="' + esc(p.id) + '" aria-label="Supprimer ' + esc(short(p)) + '">🗑</button>') + '</div></td>' : '') + '</tr>').join('') || '<tr><td colspan="9"><div class="empty">Aucun produit trouvé.</div></td></tr>') +
      '</tbody></table></div></div>' +
      (canPrice() ? '<p class="note" style="margin-top:12px">Astuce : pour mettre tout le magasin en ligne d\'un coup, utilisez « Importer depuis Excel » (copier-coller de votre fichier).</p>' : '');
    $('#cq').oninput = ev => { cq = ev.target.value; const p = ev.target.selectionStart; catalog(); const i = $('#cq'); i.focus(); i.setSelectionRange(p, p); };
    if ($('#pNew')) $('#pNew').onclick = () => { edit = 'new'; imp = null; newImg = null; catalog(); $('#eN').focus(); };
    if ($('#pImp')) $('#pImp').onclick = () => { imp = imp ? null : { rows: [] }; edit = null; catalog(); };
    if (edit) bindEditor(e0); if (imp) bindImporter();
  }
  function editor(p) {
    const D = G.depots(), cs = G.cats();
    return '<div class="pn edit" style="margin-bottom:12px"><h3>' + (p ? 'Modifier · ' + esc(short(p)) : 'Nouveau produit') + '</h3><div class="frm wide">' +
      '<div class="row2"><div class="f"><label for="eN">Désignation</label><input id="eN" value="' + esc(p ? p.name : '') + '"' + (p && p.kit ? ' disabled' : '') + ' placeholder="ex. Câble FTP Cat6 (bobine 305 m)"></div><div class="f"><label for="eC">Catégorie</label><input id="eC" list="catL" value="' + esc(p ? p.cat || '' : '') + '"' + (p && p.kit ? ' disabled' : '') + ' placeholder="ex. Câbles & fils"><datalist id="catL">' + cs.map(c => '<option value="' + esc(c) + '">').join('') + '</datalist></div></div>' +
      '<div class="row2"><div class="f"><label for="eB">Marque</label><input id="eB" value="' + esc(p ? p.brand || '' : '') + '"' + (p && p.kit ? ' disabled' : '') + '></div><div class="f"><label for="eR">Référence / code-barres</label><input id="eR" value="' + esc(p ? p.ref || '' : '') + '"' + (p && p.kit ? ' disabled' : '') + '></div></div>' +
      '<div class="row3"><div class="f"><label for="eP">Prix de vente (DA)</label><input id="eP" type="number" min="0" step="10" value="' + (p && p.price != null ? p.price : '') + '"></div><div class="f"><label for="eO">Ancien prix barré</label><input id="eO" type="number" min="0" step="10" value="' + (p && p.oldPrice != null ? p.oldPrice : '') + '" placeholder="facultatif"></div><div class="f"><label for="eK">Prix d\'achat (DA)</label><input id="eK" type="number" min="0" step="10" value="' + (p && p.cost != null ? p.cost : '') + '" placeholder="pour la marge"></div></div>' +
      '<div class="f"><label for="eD">Description (affichée dans la boutique)</label><textarea id="eD" rows="3"' + (p && p.kit ? ' disabled' : '') + '>' + esc(p ? p.desc || '' : '') + '</textarea></div>' +
      '<div class="row2"><div class="f"><label for="eI">Photo</label><input id="eI" type="file" accept="image/*"' + (p && p.kit ? ' disabled' : '') + '><div id="eIp" class="eip">' + ((p && p.img) || newImg ? '<img src="' + esc(newImg || p.img) + '" alt="Aperçu de la photo">' : '') + '</div></div><div class="f"><label for="eA">Alerte stock bas (par point de vente)</label><input id="eA" type="number" min="0" value="' + (p ? G.lowOf(p) : 3) + '"></div></div>' +
      (p ? '' : '<div class="row2">' + D.map(d => '<div class="f"><label for="eS-' + esc(d.id) + '">Stock initial · ' + esc(d.name) + '</label><input id="eS-' + esc(d.id) + '" type="number" min="0" value="0"></div>').join('') + '</div>') +
      '<div class="swr"><button class="sw ' + (!p || p.web ? 'on' : '') + '" id="eW" role="switch" aria-checked="' + (!p || !!p.web) + '" aria-label="En ligne dans la boutique"></button><span>En ligne dans la boutique</span></div>' +
      (p && p.kit ? '<p class="note">Kit Dahua : nom, photo et fiche viennent de la fiche officielle. Prix, prix d\'achat, alerte et mise en ligne sont modifiables ici.</p>' : '') +
      '<div class="acts"><button class="btn btn-red" id="eSave">' + (p ? 'Enregistrer' : 'Ajouter le produit') + '</button><button class="btn btn-ghost dk" id="eCancel">Annuler</button></div></div></div>';
  }
  function resizeImg(file) {
    return new Promise((res, rej) => {
      const r = new FileReader(); r.onerror = rej;
      r.onload = () => { const im = new Image(); im.onerror = rej; im.onload = () => { const m = 480, k = Math.min(1, m / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', 0.78)); }; im.src = r.result; };
      r.readAsDataURL(file);
    });
  }
  function bindEditor(p) {
    $('#eW').onclick = ev => { const on = !ev.currentTarget.classList.contains('on'); ev.currentTarget.classList.toggle('on', on); ev.currentTarget.setAttribute('aria-checked', on); };
    $('#eI').onchange = ev => { const f = ev.target.files[0]; if (!f) return; resizeImg(f).then(d => { newImg = d; $('#eIp').innerHTML = '<img src="' + d + '" alt="Aperçu de la photo">'; }).catch(() => toast('Photo illisible')); };
    $('#eCancel').onclick = () => { edit = null; newImg = null; catalog(); };
    $('#eSave').onclick = () => {
      const price = num($('#eP').value), old = num($('#eO').value), cost = num($('#eK').value), alert = num($('#eA').value) || 0, web = $('#eW').classList.contains('on');
      if (!(price > 0)) { toast('Indiquez le prix de vente'); return; }
      if (old != null && old <= price) { toast('L\'ancien prix doit être plus élevé'); return; }
      if (p && p.kit) { save({ price, oldPrice: old, cost, stockAlert: alert, available: web }); log('Kit Dahua : ' + money(price)); toast('✓ Kit mis à jour (page et boutique)'); edit = null; catalog(); return; }
      const name = $('#eN').value.trim(); if (!name) { toast('Indiquez la désignation'); return; }
      const L = get('products', []), data = { name, short: name, cat: $('#eC').value.trim() || 'Divers', brand: $('#eB').value.trim(), ref: $('#eR').value.trim(), price, oldPrice: old, cost, alert, desc: $('#eD').value.trim(), web };
      if (p) { Object.assign(L.find(x => x.id === p.id), data, newImg ? { img: newImg } : {}); if (!put('products', L)) { toast('⚠️ Mémoire pleine : photo trop lourde'); return; } log('Produit modifié : ' + name); toast('✓ ' + name + ' enregistré'); }
      else {
        const id = 'p' + Date.now().toString(36); L.push(Object.assign({ id, img: newImg || '' }, data)); if (!put('products', L)) { toast('⚠️ Mémoire pleine : photo trop lourde'); return; }
        const m = get('moves', []); G.depots().forEach(d => { const q0 = num($('#eS-' + d.id).value); if (q0) m.push({ at: Date.now(), qty: q0, pid: id, depot: d.id, kind: 'in', note: 'Stock initial · ' + name }); }); put('moves', m);
        log('Produit ajouté : ' + name); toast('✓ ' + name + ' ajouté' + (web ? ' et en ligne' : ''));
      }
      edit = null; newImg = null; catalog();
    };
  }
  /* import Excel : copier-coller (tabulations) ou fichier .csv / .xlsx */
  const COLS = [['name', /désignation|designation|produit|article|nom|libell/i], ['cat', /catégorie|categorie|famille|rayon/i], ['brand', /marque/i], ['ref', /réf|ref|code/i], ['price', /prix.*vente|^prix$|pv|tarif/i], ['cost', /achat|pa\b|co[uû]t/i], ['s0', /stock.*(magasin|1)|^stock$|quantit/i], ['s1', /stock.*(d[ée]p[oô]t|2)/i]];
  const TEMPLATE = 'Désignation\tCatégorie\tMarque\tRéférence\tPrix de vente\tPrix d\'achat\tStock magasin\tStock dépôt';
  function parseRows(rows) {
    rows = rows.filter(r => r.some(c => String(c).trim() !== ''));
    if (rows.length < 2) return [];
    const head = rows[0].map(h => String(h).trim()), map = {};
    COLS.forEach(([k, re]) => { const i = head.findIndex((h, j) => re.test(h) && !Object.values(map).includes(j)); if (i >= 0) map[k] = i; });
    if (map.name == null) return null;
    const n = v => { const x = String(v == null ? '' : v).replace(/[^\d,.-]/g, '').replace(/\s/g, '').replace(',', '.'); return x === '' ? null : Math.round(+x); };
    return rows.slice(1).map(r => ({ name: String(r[map.name] || '').trim(), cat: map.cat != null ? String(r[map.cat] || '').trim() : '', brand: map.brand != null ? String(r[map.brand] || '').trim() : '', ref: map.ref != null ? String(r[map.ref] || '').trim() : '', price: map.price != null ? n(r[map.price]) : null, cost: map.cost != null ? n(r[map.cost]) : null, s0: map.s0 != null ? n(r[map.s0]) || 0 : 0, s1: map.s1 != null ? n(r[map.s1]) || 0 : 0 })).filter(r => r.name);
  }
  function importer() {
    const R = imp.rows || [], D = G.depots(), ok = R.filter(r => r.price > 0);
    return '<div class="pn edit" style="margin-bottom:12px"><h3>Importer des produits depuis Excel</h3>' +
      '<p class="note">1. Ouvrez votre fichier Excel · 2. Sélectionnez les colonnes avec la ligne des titres · 3. Copiez puis collez ci-dessous. Colonnes reconnues : <b>' + esc(TEMPLATE.split('\t').join(' · ')) + '</b> (seule la désignation et le prix sont obligatoires). Ou choisissez directement le fichier.</p>' +
      '<div class="frm wide"><textarea id="iT" rows="5" placeholder="Collez ici (Ctrl+V)…" aria-label="Coller les lignes Excel">' + esc(imp.text || '') + '</textarea><div class="acts"><input id="iF" type="file" accept=".csv,.txt,.xlsx,.xls" aria-label="Choisir un fichier Excel ou CSV"><button class="mb" id="iTpl">Copier la ligne des titres</button></div>' +
      (imp.err ? '<p class="err2">' + esc(imp.err) + '</p>' : '') +
      (R.length ? '<div class="tw"><table class="t sm"><thead><tr><th>Désignation</th><th>Catégorie</th><th>Marque</th><th>Réf.</th><th>Prix</th><th>Achat</th><th>' + esc(D[0].name) + '</th><th>' + esc((D[1] || D[0]).name) + '</th></tr></thead><tbody>' + R.slice(0, 50).map(r => '<tr' + (r.price > 0 ? '' : ' class="bad"') + '><td>' + esc(r.name) + '</td><td>' + esc(r.cat || 'Divers') + '</td><td>' + esc(r.brand) + '</td><td>' + esc(r.ref) + '</td><td>' + (r.price > 0 ? money(r.price) : 'manquant') + '</td><td>' + money(r.cost) + '</td><td>' + r.s0 + '</td><td>' + r.s1 + '</td></tr>').join('') + '</tbody></table></div><p>' + ok.length + ' produit(s) prêt(s)' + (R.length - ok.length ? ' · ' + (R.length - ok.length) + ' ignoré(s) (prix manquant)' : '') + (R.length > 50 ? ' · aperçu des 50 premiers' : '') + '</p><div class="acts"><button class="btn btn-red" id="iGo"' + (ok.length ? '' : ' disabled') + '>Importer ' + ok.length + ' produit(s)</button></div>' : '') +
      '</div></div>';
  }
  function bindImporter() {
    const D = G.depots();
    $('#iT').oninput = ev => { const t = ev.target.value; const sep = t.indexOf('\t') >= 0 ? '\t' : ';'; const rows = t.split(/\r?\n/).map(l => l.split(sep)); const R = parseRows(rows); imp = R === null ? { rows: [], text: t, err: 'Colonne « Désignation » introuvable : copiez aussi la ligne des titres.' } : { rows: R, text: t }; catalog(); };
    $('#iTpl').onclick = () => copy(TEMPLATE, '✓ Titres copiés : collez-les dans Excel (ligne 1)');
    $('#iF').onchange = ev => {
      const f = ev.target.files[0]; if (!f) return;
      const done = rows => { const R = parseRows(rows); imp = R === null ? { rows: [], err: 'Colonne « Désignation » introuvable dans le fichier.' } : { rows: R }; catalog(); };
      if (/\.xlsx?$/i.test(f.name)) {
        const go = () => { const r = new FileReader(); r.onload = () => { try { const wb = window.XLSX.read(r.result, { type: 'array' }); done(window.XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: false })); } catch (e) { imp = { rows: [], err: 'Fichier Excel illisible.' }; catalog(); } }; r.readAsArrayBuffer(f); };
        if (window.XLSX) go(); else { const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'; s.onload = go; s.onerror = () => { imp = { rows: [], err: 'Lecture Excel indisponible : utilisez le copier-coller.' }; catalog(); }; document.head.appendChild(s); }
      } else { const r = new FileReader(); r.onload = () => { const t = String(r.result); const sep = t.indexOf('\t') >= 0 ? '\t' : t.split('\n')[0].indexOf(';') >= 0 ? ';' : ','; done(t.split(/\r?\n/).map(l => l.split(sep).map(c => c.replace(/^"|"$/g, '')))); }; r.readAsText(f); }
    };
    if ($('#iGo')) $('#iGo').onclick = () => {
      const ok = imp.rows.filter(r => r.price > 0), L = get('products', []), m = get('moves', []), at = Date.now();
      ok.forEach((r, k) => { const id = 'p' + (at + k).toString(36); L.push({ id, name: r.name, short: r.name, cat: r.cat || 'Divers', brand: r.brand, ref: r.ref, price: r.price, oldPrice: null, cost: r.cost, alert: 3, desc: '', img: '', web: true });
        if (r.s0) m.push({ at, qty: r.s0, pid: id, depot: D[0].id, kind: 'in', note: 'Import Excel · ' + r.name }); if (r.s1 && D[1]) m.push({ at, qty: r.s1, pid: id, depot: D[1].id, kind: 'in', note: 'Import Excel · ' + r.name }); });
      if (!put('products', L)) { toast('⚠️ Mémoire pleine'); return; } put('moves', m); log('Import Excel : ' + ok.length + ' produits'); toast('✓ ' + ok.length + ' produits importés et en ligne'); imp = null; catalog();
    };
  }
  document.addEventListener('click', e => {
    if (view !== 'catalog') return;
    const c = e.target.closest('[data-cc]'); if (c) { ccat = c.dataset.cc; catalog(); return; }
    const ed = e.target.closest('[data-ed]'); if (ed) { edit = ed.dataset.ed; imp = null; newImg = null; catalog(); scrollTo(0, 0); return; }
    const w = e.target.closest('[data-web]'); if (w) { const id = w.dataset.web; if (id === 'kit') save({ available: S().available === false }); else { const L = get('products', []), p = L.find(x => x.id === id); if (p) { p.web = !p.web; put('products', L); } } const p2 = G.prod(id); toast(p2.web ? '✓ En ligne : ' + short(p2) : 'Retiré de la boutique : ' + short(p2)); catalog(); return; }
    const d = e.target.closest('[data-del]'); if (d) { const p = G.prod(d.dataset.del); if (d.dataset.sure !== '1') { d.dataset.sure = '1'; d.textContent = 'Confirmer ?'; d.classList.add('red'); return; } put('products', get('products', []).filter(x => x.id !== p.id)); log('Produit supprimé : ' + short(p)); toast('Produit supprimé'); catalog(); }
  });

  /* ---------- stock & points de vente ---------- */
  let sq = '', mvKind = 'in';
  function stock() {
    const P = G.products(), D = G.depots();
    const L = P.filter(p => !sq || (p.name + ' ' + (p.ref || '') + ' ' + (p.cat || '')).toLowerCase().includes(sq.toLowerCase()));
    const card = d => { const units = P.reduce((a, p) => a + Math.max(0, G.stockOf(p.id, d.id)), 0), low = P.filter(p => G.stockOf(p.id, d.id) <= G.lowOf(p)).length; return '<div><small>📍 ' + esc(d.name) + '</small><b>' + units + ' <span style="font-size:15px;color:var(--muted)">articles</span></b><em>' + (low ? '⚠️ ' + low + ' produit(s) en stock bas' : 'Aucune alerte') + ' · <a href="' + esc(d.maps) + '" target="_blank" rel="noopener">itinéraire</a></em></div>'; };
    const opt = (sel) => P.map(p => '<option value="' + esc(p.id) + '"' + (p.id === sel ? ' selected' : '') + '>' + esc(short(p)) + (p.ref ? ' · ' + esc(p.ref) : '') + '</option>').join('');
    const dopt = (sel) => D.map(d => '<option value="' + esc(d.id) + '"' + (d.id === sel ? ' selected' : '') + '>' + esc(d.name) + '</option>').join('');
    const other = (D.find(d => d.id !== here) || D[0]).id;
    $('#view').innerHTML = '<div class="hd"><div><h2>Stock & points de vente</h2><p>Chaque point de vente a son propre stock. Ventes en caisse et commandes sortent du stock de celui qui les prépare.</p></div></div>' +
      '<div class="kp k2">' + D.map(card).join('') + '</div>' +
      '<div class="pn" style="margin-bottom:12px"><h3>Mouvement de stock</h3><div class="seg3" role="group" aria-label="Type de mouvement">' + [['in', '📥 Réception'], ['tr', '🔁 Transfert'], ['adj', '📝 Inventaire']].map(([k, l]) => '<button data-mk="' + k + '" class="' + (k === mvKind ? 'on' : '') + '" aria-pressed="' + (k === mvKind) + '">' + l + '</button>').join('') + '</div>' +
      '<div class="frm wide"><div class="row3"><div class="f"><label for="mP">Produit</label><select id="mP">' + opt() + '</select></div>' +
      (mvKind === 'tr' ? '<div class="f"><label for="mF">De</label><select id="mF">' + dopt(here) + '</select></div><div class="f"><label for="mT">Vers</label><select id="mT">' + dopt(other) + '</select></div>' : '<div class="f"><label for="mD">Point de vente</label><select id="mD">' + dopt(here) + '</select></div><div class="f"><label for="mQ">' + (mvKind === 'adj' ? 'Quantité comptée' : 'Quantité reçue') + '</label><input id="mQ" type="number" min="0" value="' + (mvKind === 'adj' ? '' : '1') + '"></div>') + '</div>' +
      (mvKind === 'tr' ? '<div class="row2"><div class="f"><label for="mQ">Quantité à transférer</label><input id="mQ" type="number" min="1" value="1"></div><div class="f"><label for="mN">Note</label><input id="mN" placeholder="ex. chauffeur, bon n°"></div></div>' : '<div class="f"><label for="mN">Note</label><input id="mN" placeholder="' + (mvKind === 'adj' ? 'ex. inventaire de fin de mois' : 'ex. fournisseur, facture n°') + '"></div>') +
      '<div class="acts"><button class="btn btn-red" id="mGo">' + ({ in: 'Valider la réception', tr: 'Valider le transfert', adj: 'Corriger le stock' })[mvKind] + '</button></div></div></div>' +
      '<div class="bar2"><input id="sq" placeholder="🔍 Rechercher un produit…" value="' + esc(sq) + '" aria-label="Rechercher dans le stock"></div>' +
      '<div class="pn"><div class="tw"><table class="t"><thead><tr><th>Produit</th>' + D.map(d => '<th>' + esc(d.name) + '</th>').join('') + '<th>Total</th><th>Alerte</th></tr></thead><tbody>' +
      (L.map(p => { const sts = D.map(d => G.stockOf(p.id, d.id)); return '<tr><td><b>' + esc(short(p)) + '</b><br><small>' + esc(p.cat || '') + '</small></td>' + sts.map(st => '<td><b class="' + (st <= G.lowOf(p) ? 'lowt' : '') + '">' + st + '</b>' + (st <= G.lowOf(p) ? ' ⚠️' : '') + '</td>').join('') + '<td><b>' + sts.reduce((a, b) => a + b, 0) + '</b></td><td>≤ ' + G.lowOf(p) + '</td></tr>'; }).join('') || '<tr><td colspan="5"><div class="empty">Aucun produit.</div></td></tr>') + '</tbody></table></div></div>' +
      '<div class="pn" style="margin-top:12px"><h3>Derniers mouvements</h3><div class="lst">' + (movesList().slice(0, 18).map(h => '<div class="r"><span>' + dfmt(h.at, { day: '2-digit', month: '2-digit' }) + ' · <b>' + esc(h.dep) + '</b> · ' + esc(h.note) + '</span><b style="color:' + (h.q > 0 ? '#16A34A' : 'var(--ink)') + '">' + (h.q > 0 ? '+' : '') + h.q + '</b></div>').join('') || '<div class="empty">Aucun mouvement.</div>') + '</div></div>';
    $('#sq').oninput = ev => { sq = ev.target.value; const p = ev.target.selectionStart; stock(); const i = $('#sq'); i.focus(); i.setSelectionRange(p, p); };
    $('#mGo').onclick = () => {
      const pid = $('#mP').value, p = G.prod(pid), qn = num($('#mQ').value), note = $('#mN').value.trim(), m = get('moves', []), at = Date.now();
      if (mvKind === 'in') { if (!(qn > 0)) { toast('Quantité reçue ?'); return; } const d = $('#mD').value; m.push({ at, qty: qn, pid, depot: d, kind: 'in', note: 'Réception · ' + short(p) + (note ? ' · ' + note : '') }); put('moves', m); log('Réception +' + qn + ' · ' + short(p) + ' · ' + G.depName(d)); toast('✓ +' + qn + ' au ' + G.depName(d)); }
      if (mvKind === 'tr') { const f = $('#mF').value, t = $('#mT').value; if (f === t) { toast('Choisissez deux points de vente différents'); return; } if (!(qn > 0)) { toast('Quantité ?'); return; } if (G.stockOf(pid, f) < qn) { toast('⚠️ Seulement ' + G.stockOf(pid, f) + ' au ' + G.depName(f)); return; }
        m.push({ at, qty: -qn, pid, depot: f, kind: 'tr', note: 'Transfert vers ' + G.depName(t) + ' · ' + short(p) + (note ? ' · ' + note : '') }, { at, qty: qn, pid, depot: t, kind: 'tr', note: 'Transfert depuis ' + G.depName(f) + ' · ' + short(p) + (note ? ' · ' + note : '') }); put('moves', m); log('Transfert ' + qn + ' × ' + short(p) + ' : ' + G.depName(f) + ' → ' + G.depName(t)); toast('🔁 ' + qn + ' × ' + short(p) + ' transféré(s)'); }
      if (mvKind === 'adj') { if (qn == null) { toast('Quantité comptée ?'); return; } const d = $('#mD').value, diff = qn - G.stockOf(pid, d); if (!diff) { toast('✓ Stock déjà juste'); return; } m.push({ at, qty: diff, pid, depot: d, kind: 'adj', note: 'Inventaire · ' + short(p) + ' (' + (diff > 0 ? '+' : '') + diff + ')' + (note ? ' · ' + note : '') }); put('moves', m); log('Inventaire ' + short(p) + ' · ' + G.depName(d) + ' : ' + qn); toast('✓ Stock corrigé : ' + qn); }
      stock();
    };
  }
  function movesList() {
    return get('moves', []).map(m => ({ at: m.at, q: m.qty, dep: G.depName(m.depot || 'mag'), note: m.note || ('Réception · ' + short(G.prod(m.pid || 'kit'))) }))
      .concat(get('sales', []).flatMap(x => x.items.filter(i => G.ipid(i)).map(i => ({ at: x.at, q: -i.qty, dep: G.depName(G.sdep(x)), note: 'Vente caisse · ' + i.name }))))
      .concat(get('orders', []).filter(G.counts).flatMap(o => G.items(o).map(i => ({ at: o.at, q: -i.qty, dep: G.depName(G.odep(o)), note: 'Commande ' + o.name + ' · ' + i.name }))))
      .sort((a, b) => b.at - a.at);
  }
  document.addEventListener('click', e => { if (view !== 'stock') return; const k = e.target.closest('[data-mk]'); if (k) { mvKind = k.dataset.mk; stock(); } });

  /* ---------- clients ---------- */
  function clients() {
    const map = {};
    get('orders', []).forEach(o => { const k = o.phone; map[k] = map[k] || { name: o.name, phone: o.phone, wil: o.wil || 'Retrait', n: 0, total: 0, last: 0 }; map[k].n++; if (o.status === 'livrée') map[k].total += G.orderTotal(o) || 0; map[k].last = Math.max(map[k].last, o.at); });
    get('sales', []).filter(x => x.phone).forEach(x => { const k = x.phone; map[k] = map[k] || { name: x.client || 'Client magasin', phone: x.phone, wil: G.depName(G.sdep(x)), n: 0, total: 0, last: 0 }; map[k].n++; map[k].total += G.saleTotal(x); map[k].last = Math.max(map[k].last, x.at); });
    const L = Object.values(map).sort((a, b) => b.last - a.last);
    $('#view').innerHTML = '<div class="hd"><div><h2>Clients</h2><p>' + L.length + ' clients (boutique, page produit et caisses). Relancez-les quand vous recevez du nouveau.</p></div><button class="mb" id="cpC">Copier les numéros</button></div><div class="pn">' + (L.length ? '<div class="tw"><table class="t"><thead><tr><th>Client</th><th>Wilaya / magasin</th><th>Achats</th><th>Total encaissé</th><th>Dernier achat</th><th></th></tr></thead><tbody>' + L.map(c => '<tr><td><b>' + esc(c.name) + '</b><br><small>' + phoneFmt(c.phone) + '</small></td><td>' + esc(c.wil) + '</td><td>' + c.n + '</td><td>' + money(c.total) + '</td><td>' + dfmt(c.last, { day: '2-digit', month: '2-digit', year: 'numeric' }) + '</td><td><a class="mb wa" target="_blank" rel="noopener" href="' + wa(c.phone, 'Bonjour ' + c.name.split(' ')[0] + ', ici ' + SHOP.name + '. Merci pour votre achat ! Nous avons reçu du nouveau en électricité et sécurité : écrivez-nous pour les prix.') + '">Relancer</a></td></tr>').join('') + '</tbody></table></div>' : '<div class="empty">Pas encore de client.</div>') + '</div>';
    $('#cpC').onclick = () => copy(L.map(c => c.name + '\t' + c.phone).join('\n'), '✓ Numéros copiés');
  }

  /* ---------- journal ---------- */
  function journal() {
    const L = get('log', []);
    $('#view').innerHTML = '<div class="hd"><div><h2>Journal</h2><p>Qui a fait quoi, et quand (gérant, caisse, livreur, magasinier).</p></div></div><div class="pn"><div class="lst">' + (L.slice(0, 150).map(l => '<div class="r"><span>' + dfmt(l.at) + ' · <b>' + esc(l.who) + '</b> · ' + esc(l.txt) + '</span></div>').join('') || '<div class="empty">Rien pour l\'instant.</div>') + '</div></div>';
  }

  /* ---------- réglages ---------- */
  function settings() {
    const s = S(), W = window.WILAYAS, Z = s.zones, D = s.depots;
    $('#view').innerHTML = '<div class="hd"><div><h2>Réglages</h2><p>Chaque changement s\'applique tout de suite à la boutique et à la page produit.</p></div></div>' +
      '<div class="grid2"><div class="pn"><h3>Points de vente</h3><div class="frm">' + D.map((d, i) => '<div class="row2"><div class="f"><label for="dN' + i + '">Nom</label><input id="dN' + i + '" value="' + esc(d.name) + '"></div><div class="f"><label for="dM' + i + '">Lien Google Maps</label><input id="dM' + i + '" value="' + esc(d.maps) + '"></div></div>').join('') + '<button class="btn btn-ghost dk" id="dSv">Enregistrer les points de vente</button></div></div>' +
      '<div class="pn"><h3>Frais de livraison par wilaya</h3><p class="note">Affichés au client avant de commander. Wilaya non renseignée : « confirmés par téléphone ». 0 = livraison offerte.</p><div class="frm"><div class="row2"><div class="f"><label for="zW">Wilaya</label><select id="zW"><option value="">Choisir…</option><option value="*">Toutes les wilayas</option>' + W.map(w => '<option>' + esc(w) + '</option>').join('') + '</select></div><div class="f"><label for="zF">Frais (DA)</label><input id="zF" type="number" min="0" step="50"></div></div><button class="btn btn-ghost dk" id="zAdd">Enregistrer ce tarif</button>' +
      '<div class="lst">' + (Object.keys(Z).sort().map(w => '<div class="r"><span>' + esc(w) + '</span><span><b>' + (+Z[w] === 0 ? 'Offerte' : money(+Z[w])) + '</b> <button class="mb" data-zd="' + esc(w) + '" aria-label="Retirer ' + esc(w) + '">✕</button></span></div>').join('') || '<div class="empty">Aucun tarif pour l\'instant.</div>') + '</div></div></div></div>' +
      '<div class="grid2" style="margin-top:12px"><div class="pn"><h3>Codes d\'accès</h3><div class="frm"><div class="row2">' + [['cM', 'manager', 'Gérant'], ['cC', 'cash', 'Caisse'], ['cD', 'driver', 'Livreur'], ['cS', 'store', 'Magasinier']].map(([id, k, l]) => '<div class="f"><label for="' + id + '">' + l + '</label><input id="' + id + '" inputmode="numeric" maxlength="4" value="' + esc(s.pins[k]) + '"></div>').join('') + '</div><button class="btn btn-ghost dk" id="svp">Changer les codes</button></div></div>' +
      '<div class="pn"><h3>Sauvegarde et démo</h3><p class="note">Copiez toutes les données (produits, commandes, ventes, stock) pour les garder.</p><div class="acts"><button class="mb" id="bk">Copier la sauvegarde</button><button class="mb" id="rst">Réinitialiser la démo</button></div></div></div>';
    $('#dSv').onclick = () => { const nd = D.map((d, i) => ({ id: d.id, name: $('#dN' + i).value.trim() || d.name, maps: $('#dM' + i).value.trim() || d.maps })); save({ depots: nd }); depSelect(); log('Points de vente modifiés'); toast('✓ Points de vente enregistrés'); settings(); };
    $('#zAdd').onclick = () => { const w = $('#zW').value, f = $('#zF').value; if (!w || f === '' || +f < 0) { toast('Choisissez une wilaya et un montant'); return; } const z = Object.assign({}, S().zones); if (w === '*') W.forEach(x => { z[x] = Math.round(+f); }); else z[w] = Math.round(+f); save({ zones: z }); log('Livraison ' + (w === '*' ? 'toutes wilayas' : w) + ' : ' + money(+f)); toast('✓ Tarif enregistré'); settings(); };
    $('#svp').onclick = () => { const v = ['cM', 'cC', 'cD', 'cS'].map(id => $('#' + id).value); if (!v.every(x => /^\d{4}$/.test(x)) || new Set(v).size < 4) { toast('4 codes différents de 4 chiffres'); return; } save({ pins: { manager: v[0], cash: v[1], driver: v[2], store: v[3] } }); log('Codes d\'accès changés'); toast('✓ Codes changés'); };
    $('#bk').onclick = () => { const data = {}; ['settings', 'orders', 'sales', 'moves', 'products', 'log'].forEach(k => { data[k] = get(k, null); }); copy(JSON.stringify(data), '✓ Sauvegarde copiée'); };
    $('#rst').onclick = ev => { if (ev.currentTarget.dataset.sure !== '1') { ev.currentTarget.dataset.sure = '1'; ev.currentTarget.textContent = 'Confirmer la réinitialisation ?'; ev.currentTarget.classList.add('red'); return; } ['orders', 'sales', 'moves', 'settings', 'products', 'log', 'seeded', 'seeded2', 'seed3'].forEach(k => { try { localStorage.removeItem('ads-' + k); } catch (e) { /* bloqué */ } }); put('settings', {}); seed(); depSelect(); toast('✓ Démo réinitialisée'); settings(); };
  }
  document.addEventListener('click', e => { const z = e.target.closest('[data-zd]'); if (!z) return; const zz = Object.assign({}, S().zones); delete zz[z.dataset.zd]; save({ zones: zz }); toast('Tarif retiré'); settings(); });

  /* ---------- direct ---------- */
  G.onChange(() => { if (!$('#app').hidden && ['settings', 'pos', 'catalog', 'stock'].indexOf(view) < 0) render(); });
  if (role) start();
})();
