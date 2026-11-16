/* Espace gérant General Electric dz : tableau de bord, commandes, caisse, stock, clients, réglages */
(function () {
  'use strict';
  const $ = s => document.querySelector(s), $$ = s => document.querySelectorAll(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = n => n == null || isNaN(n) ? '—' : Math.round(n).toLocaleString('fr-FR').replace(/ | /g, ' ') + ' DA';
  const get = (k, d) => { try { const v = localStorage.getItem('ads-' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
  let bc = null; try { bc = new BroadcastChannel('ads-sync'); } catch (e) { /* ancien navigateur */ }
  const put = (k, v) => { try { localStorage.setItem('ads-' + k, JSON.stringify(v)); } catch (e) { /* bloqué */ } try { bc && bc.postMessage(k); } catch (e) { /* ok */ } };
  const SHOP = window.SHOP, KIT = 'Kit alarme Dahua AirShield (4 pièces)';
  const DEF = { price: SHOP.price, oldPrice: SHOP.oldPrice, available: true, stock: 12, stockAlert: 3, pins: { manager: SHOP.pin || '0328', cash: '2222' } };
  const S = () => { const s = Object.assign({}, DEF, get('settings', {})); s.pins = Object.assign({}, DEF.pins, s.pins); return s; };
  const save = p => put('settings', Object.assign(S(), p));
  const DAY = 864e5, today = () => new Date().toDateString();
  let tt; const toast = m => { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 2300); };
  const phoneFmt = p => String(p || '').replace(/(\d{4})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
  const wa = (p, msg) => 'https://wa.me/213' + String(p).replace(/^0/, '') + (msg ? '?text=' + encodeURIComponent(msg) : '');

  /* ---------- données de démonstration (une seule fois) ---------- */
  function seed() {
    if (get('seeded', false)) return;
    const n = Date.now(), names = [['Samir Belkacem', '0661452317', '16 Alger', 'Bab Ezzouar'], ['Nadia Haddad', '0770381256', '35 Boumerdès', 'Boudouaou'], ['Yacine Mansouri', '0552906144', '09 Blida', 'Ouled Yaïch'], ['Karima Saadi', '0699213487', '16 Alger', 'Dar El Beïda'], ['Mehdi Ouali', '0540778920', '15 Tizi Ouzou', 'Azazga'], ['Rania Benali', '0771620043', '42 Tipaza', 'Koléa'], ['Hocine Ferhat', '0663318872', '16 Alger', 'Rouïba']];
    const st = ['livrée', 'livrée', 'expédiée', 'confirmée', 'nouvelle', 'nouvelle', 'livrée'];
    const orders = get('orders', []);
    names.forEach((c, i) => orders.push({ id: 'demo' + i, demo: true, at: n - (i * 0.8 + 0.2) * DAY, name: c[0], phone: c[1], wil: c[2], com: c[3], adr: '', qty: i === 2 ? 2 : 1, price: null, status: st[i] }));
    put('orders', orders.sort((a, b) => b.at - a.at));
    put('sales', [{ id: 's1', demo: true, at: n - 3.1 * DAY, items: [{ name: KIT, kit: true, qty: 1, price: null }], pay: 'Espèces', client: '' }, { id: 's2', demo: true, at: n - 1.2 * DAY, items: [{ name: KIT, kit: true, qty: 1, price: null }], pay: 'Carte', client: 'Comptoir' }]);
    put('moves', [{ at: n - 6.5 * DAY, qty: 15, note: 'Réception fournisseur (démo)' }]);
    put('seeded', true);
  }

  /* ---------- connexion ---------- */
  let role = null, pin = '';
  try { role = sessionStorage.getItem('ads-role'); } catch (e) { /* bloqué */ }
  $('#pad').innerHTML = [1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'].map(k => k === '' ? '<span></span>' : '<button data-k="' + k + '">' + k + '</button>').join('');
  $('#pad').addEventListener('click', e => {
    const b = e.target.closest('[data-k]'); if (!b) return;
    pin = b.dataset.k === '⌫' ? pin.slice(0, -1) : (pin + b.dataset.k).slice(0, 4);
    $$('#dots i').forEach((d, i) => d.classList.toggle('on', i < pin.length));
    if (pin.length === 4) {
      const p = S().pins; role = pin === p.manager ? 'manager' : pin === p.cash ? 'cash' : null;
      if (role) { try { sessionStorage.setItem('ads-role', role); } catch (x) { /* bloqué */ } start(); } else $('#gErr').textContent = 'Code incorrect';
      pin = ''; setTimeout(() => $$('#dots i').forEach(d => d.classList.remove('on')), 200);
    }
  });
  document.addEventListener('keydown', e => { if (!$('#gate').hidden && /^\d$/.test(e.key)) { const b = $('#pad [data-k="' + e.key + '"]'); b && b.click(); } });
  $('#out').onclick = () => { try { sessionStorage.removeItem('ads-role'); } catch (e) { /* bloqué */ } location.reload(); };

  const TABS = { manager: [['dash', '📊 Tableau de bord'], ['orders', '🛒 Commandes'], ['pos', '💳 Caisse'], ['stock', '📦 Stock'], ['clients', '👥 Clients'], ['settings', '⚙️ Réglages']], cash: [['pos', '💳 Caisse'], ['orders', '🛒 Commandes']] };
  let view = 'dash';
  function start() { seed(); $('#gate').hidden = true; $('#app').hidden = false; $('#tabs').innerHTML = TABS[role].map(([k, l]) => '<button data-v="' + k + '">' + l + '</button>').join(''); go(TABS[role][0][0]); }
  $('#tabs').addEventListener('click', e => { const b = e.target.closest('[data-v]'); if (b) go(b.dataset.v); });
  function go(v) { view = v; $$('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.v === v)); render(); scrollTo(0, 0); }
  function render() { ({ dash, orders, pos, stock, clients, settings })[view](); }

  /* ---------- calculs ---------- */
  const priceOf = x => x.price != null ? x.price : S().price;
  const orderTotal = o => priceOf(o) == null ? null : priceOf(o) * o.qty;
  const saleTotal = s => s.items.reduce((a, i) => a == null || (i.price == null && S().price == null) ? null : a + (i.price != null ? i.price : S().price) * i.qty, 0);
  const kitSold = () => get('orders', []).filter(o => o.status !== 'annulée' && o.status !== 'nouvelle').reduce((a, o) => a + o.qty, 0) + get('sales', []).reduce((a, s) => a + s.items.filter(i => i.kit).reduce((b, i) => b + i.qty, 0), 0);
  const stockLeft = () => get('moves', []).reduce((a, m) => a + m.qty, 0) - kitSold();

  /* ---------- tableau de bord ---------- */
  function dash() {
    const s = S(), O = get('orders', []), SL = get('sales', []);
    const days = [...Array(7)].map((_, i) => { const d = new Date(Date.now() - (6 - i) * DAY); return d; });
    const per = days.map(d => O.filter(o => o.status !== 'annulée' && new Date(o.at).toDateString() === d.toDateString()).reduce((a, o) => a + o.qty, 0) + SL.filter(x => new Date(x.at).toDateString() === d.toDateString()).reduce((a, x) => a + x.items.filter(i => i.kit).reduce((b, i) => b + i.qty, 0), 0));
    const max = Math.max(1, ...per);
    const ca = s.price == null ? null : O.filter(o => o.status === 'livrée').reduce((a, o) => a + (orderTotal(o) || 0), 0) + SL.reduce((a, x) => a + (saleTotal(x) || 0), 0);
    const todo = O.filter(o => o.status === 'nouvelle').length, left = stockLeft();
    const wil = {}; O.forEach(o => { wil[o.wil] = (wil[o.wil] || 0) + 1; });
    const top = Object.entries(wil).sort((a, b) => b[1] - a[1]).slice(0, 5);
    $('#view').innerHTML = '<div class="hd"><div><h2>Bonjour 👋</h2><p>' + esc(SHOP.name) + ' · ' + new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) + '</p></div></div>' +
      (s.price == null ? '<p class="note" style="margin:0 0 14px">💡 Indiquez le prix du kit dans <b>Réglages</b> : il s\'affiche aussitôt sur la page et le chiffre d\'affaires se calcule tout seul.</p>' : '') +
      '<div class="kp"><div><small>Chiffre d\'affaires</small><b>' + money(ca) + '</b><em>commandes livrées + caisse</em></div>' +
      '<div class="' + (todo ? 'warn' : '') + '"><small>À confirmer</small><b>' + todo + '</b><em>commandes en attente d\'appel</em></div>' +
      '<div><small>Kits vendus</small><b>' + kitSold() + '</b><em>site + magasin</em></div>' +
      '<div class="' + (left <= s.stockAlert ? 'warn' : '') + '"><small>Stock</small><b>' + left + '</b><em>' + (left <= s.stockAlert ? '⚠️ à recommander' : 'kits en magasin') + '</em></div></div>' +
      '<div class="grid2"><div class="pn"><h3>Kits vendus · 7 derniers jours</h3><div class="bars">' + per.map((v, i) => '<div><em>' + v + '</em><i style="height:' + (v / max * 100) + '%"></i><span>' + days[i].toLocaleDateString('fr-FR', { weekday: 'short' }) + '</span></div>').join('') + '</div><div style="height:22px"></div></div>' +
      '<div class="pn"><h3>Commandes par wilaya</h3><div class="lst">' + (top.map(([w, c]) => '<div class="r"><span>' + esc(w) + '</span><b>' + c + '</b></div>').join('') || '<div class="empty">Pas encore de commande.</div>') + '</div></div></div>' +
      '<div class="pn" style="margin-top:12px"><h3>Dernières commandes</h3>' + orderTable(O.slice(0, 5)) + '</div>' +
      '<p class="note" style="margin-top:12px">Démo : quelques commandes et ventes d\'exemple sont préremplies. Vos commandes test depuis la page s\'ajoutent en direct.</p>';
  }

  /* ---------- commandes ---------- */
  const ST = ['nouvelle', 'confirmée', 'expédiée', 'livrée', 'annulée'];
  let filt = 'toutes';
  function orderTable(L) {
    if (!L.length) return '<div class="empty">Aucune commande.</div>';
    return '<div class="tw"><table class="t"><thead><tr><th>Date</th><th>Client</th><th>Livraison</th><th>Qté</th><th>Montant</th><th>Statut</th><th>Actions</th></tr></thead><tbody>' + L.map(o => {
      const msg = 'Bonjour ' + o.name.split(' ')[0] + ', ici ' + SHOP.name + '. Nous confirmons votre commande du kit alarme Dahua AirShield (quantité : ' + o.qty + ')' + (priceOf(o) != null ? ', total ' + money(orderTotal(o)) : '') + '. Livraison à ' + o.com + ' (' + o.wil + '). Merci !';
      return '<tr><td>' + new Date(o.at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) + '</td><td><b>' + esc(o.name) + '</b><br><small>' + phoneFmt(o.phone) + '</small></td><td>' + esc(o.wil) + '<br><small>' + esc(o.com) + (o.adr ? ' · ' + esc(o.adr) : '') + '</small></td><td>' + o.qty + '</td><td>' + money(orderTotal(o)) + '</td>' +
        '<td><select data-st="' + o.id + '" aria-label="Statut">' + ST.map(s => '<option' + (s === o.status ? ' selected' : '') + '>' + s + '</option>').join('') + '</select></td>' +
        '<td><div class="acts"><a class="mb wa" target="_blank" rel="noopener" href="' + wa(o.phone, msg) + '">Confirmer WhatsApp</a><a class="mb" href="tel:' + o.phone + '">Appeler</a></div></td></tr>';
    }).join('') + '</tbody></table></div>';
  }
  function orders() {
    const O = get('orders', []), L = filt === 'toutes' ? O : O.filter(o => o.status === filt);
    $('#view').innerHTML = '<div class="hd"><div><h2>Commandes du site</h2><p>Chaque commande passée sur la page arrive ici en direct.</p></div><button class="mb" id="csv">Copier pour Excel</button></div>' +
      '<div class="flt" style="margin-bottom:12px">' + ['toutes'].concat(ST).map(s => '<button data-f="' + s + '" class="' + (s === filt ? 'on' : '') + '">' + s + ' <b>' + (s === 'toutes' ? O.length : O.filter(o => o.status === s).length) + '</b></button>').join('') + '</div><div class="pn">' + orderTable(L) + '</div>';
    $('#csv').onclick = () => { const rows = [['Date', 'Nom', 'Téléphone', 'Wilaya', 'Commune', 'Adresse', 'Qté', 'Montant', 'Statut']].concat(O.map(o => [new Date(o.at).toLocaleString('fr-FR'), o.name, o.phone, o.wil, o.com, o.adr, o.qty, orderTotal(o) || '', o.status])); const txt = rows.map(r => r.join('\t')).join('\n'); (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => toast('✓ Copié : collez dans Excel')).catch(() => toast('Copie impossible ici')); };
  }
  document.addEventListener('click', e => { const f = e.target.closest('[data-f]'); if (f) { filt = f.dataset.f; orders(); } });
  document.addEventListener('change', e => {
    const s = e.target.closest('[data-st]'); if (!s) return;
    const O = get('orders', []), o = O.find(x => x.id === s.dataset.st); if (!o) return;
    o.status = s.value; put('orders', O); toast('✓ Commande ' + s.value); render();
  });

  /* ---------- caisse ---------- */
  let ticket = [], pay = 'Espèces', last = null;
  function pos() {
    const s = S(), t = ticket.reduce((a, i) => a + i.price * i.qty, 0);
    $('#view').innerHTML = '<div class="hd"><div><h2>Caisse</h2><p>Vente au comptoir du magasin. Le stock se met à jour tout seul.</p></div></div><div class="pos"><div>' +
      '<div class="tiles"><button class="tile" id="tKit"' + (s.available === false ? ' disabled style="opacity:.5"' : '') + '><img src="img/boite.webp" alt=""><b>Kit alarme Dahua AirShield</b><small>' + (s.price != null ? money(s.price) : 'prix à saisir') + '</small><span class="note" style="padding:4px 8px">Stock : ' + stockLeft() + '</span></button>' +
      '<div class="tile free"><b>Autre article du magasin</b><input id="fName" placeholder="Désignation (ex. câble 2,5 mm²)"><input id="fPrice" type="number" min="0" step="10" placeholder="Prix en DA"><button class="mb red" id="fAdd">Ajouter</button></div></div>' +
      (last ? '<div class="pn" style="margin-top:14px"><h3>Dernier ticket</h3><div class="rcpt">' + esc(last) + '</div></div>' : '') + '</div>' +
      '<aside class="tk"><b style="font-size:17px">Ticket en cours</b>' + (ticket.length ? ticket.map((i, k) => '<div class="ln"><div class="nm"><b>' + esc(i.name) + '</b><br><small>' + money(i.price) + '</small></div><div class="mini"><button data-q="' + k + '" data-d="-1">−</button><b>' + i.qty + '</b><button data-q="' + k + '" data-d="1">+</button></div></div>').join('') : '<div class="empty">Touchez un article pour l\'ajouter.</div>') +
      '<div class="tot"><span>Total</span><span>' + money(t) + '</span></div><div class="seg2"><button data-p="Espèces" class="' + (pay === 'Espèces' ? 'on' : '') + '">💵 Espèces</button><button data-p="Carte" class="' + (pay === 'Carte' ? 'on' : '') + '">💳 Carte</button></div>' +
      '<input id="cl" placeholder="Client (facultatif)"><button class="btn btn-red big full" id="enc"' + (ticket.length ? '' : ' disabled') + '>Encaisser ' + money(t) + '</button></aside></div>';
    $('#tKit').onclick = () => { const p = S().price; if (!p) { toast('Indiquez d\'abord le prix du kit dans Réglages'); return; } const ex = ticket.find(i => i.kit); if (ex) ex.qty++; else ticket.push({ name: KIT, kit: true, price: p, qty: 1 }); pos(); };
    $('#fAdd').onclick = () => { const n = $('#fName').value.trim(), p = Math.round(+$('#fPrice').value); if (!n || !p) { toast('Désignation et prix'); return; } ticket.push({ name: n, kit: false, price: p, qty: 1 }); pos(); };
    $('#enc').onclick = () => {
      if (!ticket.length) return;
      const t2 = ticket.reduce((a, i) => a + i.price * i.qty, 0), at = Date.now();
      const sl = get('sales', []); sl.unshift({ id: 's' + at.toString(36), at, items: ticket, pay, client: $('#cl').value.trim() }); put('sales', sl);
      last = SHOP.name + '\nEl Hamiz · WhatsApp ' + (SHOP.whatsappShow || '') + '\n' + new Date(at).toLocaleString('fr-FR') + '\n------------------------------\n' + ticket.map(i => i.qty + ' x ' + i.name + '\n   ' + money(i.price * i.qty)).join('\n') + '\n------------------------------\nTOTAL : ' + money(t2) + '\nPaiement : ' + pay + '\nMerci de votre visite !';
      ticket = []; toast('✓ Vente encaissée · ' + money(t2)); pos();
    };
  }
  document.addEventListener('click', e => {
    if (view !== 'pos') return;
    const q = e.target.closest('[data-q]'); if (q) { const i = ticket[+q.dataset.q]; i.qty += +q.dataset.d; if (i.qty <= 0) ticket.splice(+q.dataset.q, 1); pos(); return; }
    const p = e.target.closest('[data-p]'); if (p) { pay = p.dataset.p; pos(); }
  });

  /* ---------- stock ---------- */
  function stock() {
    const s = S(), left = stockLeft(), M = get('moves', []);
    const hist = M.map(m => ({ at: m.at, q: m.qty, note: m.note })).concat(get('sales', []).map(x => ({ at: x.at, q: -x.items.filter(i => i.kit).reduce((a, i) => a + i.qty, 0), note: 'Vente caisse' })).filter(x => x.q), get('orders', []).filter(o => o.status !== 'annulée' && o.status !== 'nouvelle').map(o => ({ at: o.at, q: -o.qty, note: 'Commande ' + o.name }))).sort((a, b) => b.at - a.at);
    $('#view').innerHTML = '<div class="hd"><div><h2>Stock</h2><p>Kit alarme Dahua AirShield · réf. DHI-ART-ARC3000H-03-GW2(868)</p></div></div><div class="grid2"><div class="pn"><h3>En magasin</h3><div class="stockbig ' + (left <= s.stockAlert ? 'low' : '') + '">' + left + '</div><p class="note" style="margin-top:10px">' + (left <= s.stockAlert ? '⚠️ Stock bas : pensez à recommander (seuil ' + s.stockAlert + ').' : 'Alerte quand il reste ' + s.stockAlert + ' kits ou moins.') + '</p>' +
      '<div class="frm" style="margin-top:12px"><div class="row2"><div class="f"><label for="inQ">Réception (+)</label><input id="inQ" type="number" min="1" value="10"></div><div class="f"><label for="inN">Note</label><input id="inN" placeholder="Fournisseur, bon n°…"></div></div><button class="btn btn-red" id="inB">Ajouter au stock</button></div></div>' +
      '<div class="pn"><h3>Mouvements</h3><div class="lst">' + (hist.slice(0, 12).map(h => '<div class="r"><span>' + new Date(h.at).toLocaleDateString('fr-FR') + ' · ' + esc(h.note) + '</span><b style="color:' + (h.q > 0 ? '#16A34A' : 'var(--ink)') + '">' + (h.q > 0 ? '+' : '') + h.q + '</b></div>').join('') || '<div class="empty">Aucun mouvement.</div>') + '</div></div></div>';
    $('#inB').onclick = () => { const q = Math.round(+$('#inQ').value); if (!q) return; const m = get('moves', []); m.push({ at: Date.now(), qty: q, note: $('#inN').value.trim() || 'Réception' }); put('moves', m); toast('✓ +' + q + ' kits en stock'); stock(); };
  }

  /* ---------- clients ---------- */
  function clients() {
    const map = {}; get('orders', []).forEach(o => { const k = o.phone; map[k] = map[k] || { name: o.name, phone: o.phone, wil: o.wil, n: 0, q: 0, last: 0 }; map[k].n++; map[k].q += o.qty; map[k].last = Math.max(map[k].last, o.at); });
    const L = Object.values(map).sort((a, b) => b.last - a.last);
    $('#view').innerHTML = '<div class="hd"><div><h2>Clients</h2><p>' + L.length + ' clients · utile pour les relancer (accessoires, nouveaux produits).</p></div></div><div class="pn">' + (L.length ? '<div class="tw"><table class="t"><thead><tr><th>Client</th><th>Wilaya</th><th>Commandes</th><th>Kits</th><th>Dernière</th><th></th></tr></thead><tbody>' + L.map(c => '<tr><td><b>' + esc(c.name) + '</b><br><small>' + phoneFmt(c.phone) + '</small></td><td>' + esc(c.wil) + '</td><td>' + c.n + '</td><td>' + c.q + '</td><td>' + new Date(c.last).toLocaleDateString('fr-FR') + '</td><td><a class="mb wa" target="_blank" rel="noopener" href="' + wa(c.phone) + '">WhatsApp</a></td></tr>').join('') + '</tbody></table></div>' : '<div class="empty">Pas encore de client.</div>') + '</div>';
  }

  /* ---------- réglages ---------- */
  function settings() {
    const s = S();
    $('#view').innerHTML = '<div class="hd"><div><h2>Réglages</h2><p>Chaque changement s\'applique tout de suite à la page publique.</p></div></div><div class="grid2"><div class="pn"><h3>Prix et disponibilité du kit</h3><div class="frm">' +
      '<div class="row2"><div class="f"><label for="pP">Prix de vente (DA)</label><input id="pP" type="number" min="0" step="100" value="' + (s.price == null ? '' : s.price) + '" placeholder="ex. 45000"></div><div class="f"><label for="pO">Ancien prix barré (facultatif)</label><input id="pO" type="number" min="0" step="100" value="' + (s.oldPrice == null ? '' : s.oldPrice) + '"></div></div>' +
      '<div class="swr"><button class="sw ' + (s.available !== false ? 'on' : '') + '" id="av" role="switch" aria-checked="' + (s.available !== false) + '" aria-label="Disponible"></button><span>' + (s.available !== false ? 'En stock : on prend les commandes' : 'Rupture : la page propose de réserver') + '</span></div>' +
      '<div class="f"><label for="sA">Alerte de stock bas (kits)</label><input id="sA" type="number" min="0" value="' + s.stockAlert + '"></div><button class="btn btn-red" id="sv">Enregistrer</button></div></div>' +
      '<div class="pn"><h3>Codes d\'accès</h3><div class="frm"><div class="row2"><div class="f"><label for="cM">Gérant</label><input id="cM" inputmode="numeric" maxlength="4" value="' + s.pins.manager + '"></div><div class="f"><label for="cC">Caisse</label><input id="cC" inputmode="numeric" maxlength="4" value="' + s.pins.cash + '"></div></div><button class="btn btn-ghost" style="color:var(--ink);border-color:var(--ink)" id="svp">Changer les codes</button>' +
      '<p class="note">Démo : vous pouvez tout remettre à zéro.</p><button class="mb" id="rst">Réinitialiser la démo</button></div></div></div>';
    $('#av').onclick = () => { save({ available: S().available === false }); toast(S().available === false ? '⛔ Rupture affichée sur la page' : '✓ De nouveau en stock'); settings(); };
    $('#sv').onclick = () => { const p = $('#pP').value === '' ? null : Math.round(+$('#pP').value), o = $('#pO').value === '' ? null : Math.round(+$('#pO').value); save({ price: p, oldPrice: o && p && o > p ? o : null, stockAlert: Math.max(0, Math.round(+$('#sA').value)) }); toast('✓ Prix mis à jour sur la page'); settings(); };
    $('#svp').onclick = () => { const a = $('#cM').value, b = $('#cC').value; if (!/^\d{4}$/.test(a) || !/^\d{4}$/.test(b) || a === b) { toast('2 codes différents de 4 chiffres'); return; } save({ pins: { manager: a, cash: b } }); toast('✓ Codes changés'); };
    $('#rst').onclick = () => { ['orders', 'sales', 'moves', 'settings', 'seeded'].forEach(k => { try { localStorage.removeItem('ads-' + k); } catch (e) { /* bloqué */ } }); try { bc && bc.postMessage('settings'); } catch (e) { /* ok */ } seed(); toast('✓ Démo réinitialisée'); settings(); };
  }

  /* ---------- direct ---------- */
  if (bc) bc.onmessage = () => { if (!$('#app').hidden && view !== 'settings' && view !== 'pos') render(); };
  addEventListener('storage', e => { if (e.key && e.key.indexOf('ads-') === 0 && !$('#app').hidden && view !== 'settings' && view !== 'pos') render(); });
  if (role) start();
})();
