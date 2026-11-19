/* =====================================================================
   STI Bureautique — espace de gestion
   Rôles : gérant (tout) · commercial (devis, commandes, clients) · livreur
   ===================================================================== */
(function () {
  'use strict';
  const X = window.STIX, STI = X.STI, esc = X.esc, money = X.money, get = X.get, put = X.put;
  const $ = s => document.querySelector(s), $$ = s => document.querySelectorAll(s);
  const DAY = 864e5;
  let role = null, pin = '', view = '';
  const ROLE_NAME = { manager: 'Gérant', sales: 'Commercial', driver: 'Livreur' };
  function log(txt) { const l = get('log', []); l.unshift({ at: Date.now(), who: ROLE_NAME[role] || '—', txt }); put('log', l.slice(0, 400)); }
  let tt; const toast = m => { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 2600); };
  const phoneFmt = p => String(p || '').replace(/(\d{4})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
  const wa = (p, msg) => 'https://wa.me/213' + String(p).replace(/^0/, '') + (msg ? '?text=' + encodeURIComponent(msg) : '');
  const dfmt = (t, o) => new Date(t).toLocaleString('fr-FR', o || { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  const sameDay = (a, b) => new Date(a).toDateString() === new Date(b).toDateString();
  function copy(txt, ok) { (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => toast(ok)).catch(() => toast('Copie impossible ici : sélectionnez le texte')); }
  const pct = (a, b) => b ? Math.round(a / b * 1000) / 10 : 0;

  /* ---------- démonstration (clairement marquée) ---------- */
  function seed() {
    if (get('seeded', false)) return;
    const n = Date.now(), P = X.products(), by = id => P.find(p => p.id === id);
    const L = (id, vi, q) => { const p = by(id); return p ? { pid: id, vi, name: X.lineName(p, vi), price: X.vPrice(p, vi), qty: q } : null; };
    const O = [['Amine B. (démo)', '0661203344', '16 Alger', 'Bab Ezzouar', [['chaise-ergonomique-galaxy', 0, 1]], 'livrée', 'ig', 'livraison'], ['Sara K. (démo)', '0770552210', '09 Blida', 'Ouled Yaïch', [['chaise-ergonomique-3250', 0, 1]], 'livrée', 'fb', 'livraison'],
      ['Yacine M. (démo)', '0552108899', '', '', [['chaise-gamer-kirogi-5d', 0, 1]], 'livrée', 'tt', 'retrait'], ['Lina H. (démo)', '0698771245', '31 Oran', 'Bir El Djir', [['bureau-fonctionnel', 1, 1], ['chaise-operateur-nova-grise', 0, 1]], 'expédiée', 'gg', 'livraison'],
      ['Karim T. (démo)', '0540339012', '16 Alger', 'Hydra', [['fauteuil-pdg-luxe-6037', 1, 1]], 'confirmée', 'ig', 'livraison'], ['Nour A. (démo)', '0663441987', '35 Boumerdès', 'Boudouaou', [['chaise-ergonomique-extra', 0, 2]], 'nouvelle', 'ok', 'livraison']];
    put('orders', get('orders', []).concat(O.map((o, i) => ({ id: 'demo' + i, demo: true, at: n - (i * 0.9 + 0.3) * DAY, name: o[0], phone: o[1], wil: o[2], com: o[3], adr: '', lines: o[4].map(x => L(...x)).filter(Boolean), fee: null, status: o[5], src: o[6], mode: o[7], t_livree: o[5] === 'livrée' ? n - (i * 0.9) * DAY : null }))).sort((a, b) => b.at - a.at));
    const D = [['Cabinet d\'expertise (démo)', 'M. Rahmani', '0555102030', '16 Alger', [['chaise-operateur-nova-grise', 0, 8], ['bureau-fonctionnel', 1, 8], ['armoire-metallique-02-porte', 0, 2]], 'nouveau', 'li', 0.4],
      ['École privée (démo)', 'Mme Ouali', '0661908070', '09 Blida', [['chaise-visiteur-en-couleur', 0, 30]], 'envoyé', 'gg', 2.2], ['Clinique (démo)', 'M. Ferhat', '0770123456', '15 Tizi Ouzou', [['chaise-salle-dattente-k02', 0, 20], ['chaise-ergonomique-3250', 0, 4]], 'négociation', 'fb', 4.5],
      ['Agence de voyage (démo)', 'Mme Saadi', '0699887766', '16 Alger', [['chaise-ergonomique-galaxy', 0, 6], ['bureau-petits-espaces', 0, 6]], 'gagné', 'ig', 6.1]];
    put('devis', get('devis', []).concat(D.map((x, i) => ({ id: 'dd' + i, demo: true, ref: 'DV-DEMO-' + (i + 1), at: n - x[7] * DAY, company: x[0], name: x[1], phone: x[2], email: '', wil: x[3], nif: '', msg: '', lines: x[4].map(y => L(...y)).filter(Boolean), disc: x[5] === 'gagné' ? 5 : 0, status: x[5], src: x[6], t_sent: x[5] !== 'nouveau' ? n - (x[7] - 0.6) * DAY : null }))).sort((a, b) => b.at - a.at));
    const ev = {}, top = ['chaise-ergonomique-galaxy', 'chaise-gamer-kirogi-5d', 'chaise-ergonomique-3250', 'fauteuil-pdg-luxe-6037', 'chaise-ergonomique-extra', 'bureau-fonctionnel', 'chaise-operateur-nova-grise', 'standing-desk'];
    for (let k = 20; k >= 1; k--) { const day = X.day(n - k * DAY), s = 0.8 + 0.4 * Math.sin(k); const e = { visit: Math.round(95 * s + k % 7 * 6), view: Math.round(210 * s), cart: Math.round(14 * s), devis: Math.round(6 * s), order: k % 3 === 0 ? 1 : 0, wa: Math.round(9 * s), p: {} };
      top.forEach((id, j) => { e.p[id] = { view: Math.round((60 - j * 6) * s), cart: Math.max(0, Math.round((5 - j * 0.6) * s)) }; }); ev[day] = e; }
    const old = get('ev', {}); Object.keys(old).forEach(k => { ev[k] = old[k]; }); put('ev', ev); put('seeded', true);
  }

  /* ---------- connexion ---------- */
  try { role = sessionStorage.getItem('sti-role'); } catch (e) { /* bloqué */ }
  if (role && !ROLE_NAME[role]) role = null;
  const GATE_T = { manager: 'Espace gérant', sales: 'Espace commercial', driver: 'Espace livreur' };
  const wanted = () => { const h = location.hash.slice(1); return GATE_T[h] ? h : null; };
  function showGate() { $('#gTitle').textContent = GATE_T[wanted() || 'manager']; $('#gErr').textContent = ''; pin = ''; $$('#dots i').forEach(d => d.classList.remove('on')); $('#app').hidden = true; $('#gate').hidden = false; }
  function logout() { role = null; try { sessionStorage.removeItem('sti-role'); } catch (e) { /* bloqué */ } }
  if (wanted() && role && wanted() !== role) logout();
  addEventListener('hashchange', () => { const w = wanted(); if (!w || w === role) return; logout(); showGate(); scrollTo(0, 0); });
  if (!role) showGate();
  $('#pad').innerHTML = [1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'].map(k => k === '' ? '<span></span>' : '<button data-k="' + k + '" aria-label="' + (k === '⌫' ? 'Effacer' : k) + '">' + k + '</button>').join('');
  $('#pad').addEventListener('click', e => {
    const b = e.target.closest('[data-k]'); if (!b) return;
    pin = b.dataset.k === '⌫' ? pin.slice(0, -1) : (pin + b.dataset.k).slice(0, 4);
    $$('#dots i').forEach((d, i) => d.classList.toggle('on', i < pin.length));
    if (pin.length === 4) {
      const p = X.S().pins; role = Object.keys(ROLE_NAME).find(r => p[r] === pin) || null;
      if (role) { try { sessionStorage.setItem('sti-role', role); history.replaceState(null, '', '#' + role); dispatchEvent(new Event('hashchange')); } catch (x) { /* bloqué */ } log('Connexion'); start(); } else $('#gErr').textContent = 'Code incorrect';
      pin = ''; setTimeout(() => $$('#dots i').forEach(d => d.classList.remove('on')), 200);
    }
  });
  document.addEventListener('keydown', e => { if (!$('#gate').hidden && /^\d$/.test(e.key)) { const b = $('#pad [data-k="' + e.key + '"]'); b && b.click(); } });
  $('#out').onclick = () => { logout(); location.reload(); };
  const TABS = {
    manager: [['dash', '📊 Tableau de bord'], ['orders', '🛒 Commandes'], ['devis', '📄 Devis B2B'], ['delivery', '🚚 Livraisons'], ['catalog', '🏷️ Catalogue'], ['clients', '👥 Clients'], ['mkt', '📈 Marketing'], ['journal', '🕓 Journal'], ['settings', '⚙️ Réglages']],
    sales: [['devis', '📄 Devis B2B'], ['orders', '🛒 Commandes'], ['clients', '👥 Clients']],
    driver: [['delivery', '🚚 Mes livraisons']]
  };
  function start() { seed(); $('#gate').hidden = true; $('#app').hidden = false; $('#tabs').innerHTML = TABS[role].map(([k, l]) => '<button data-v="' + k + '">' + l + '</button>').join(''); $('#who').textContent = ROLE_NAME[role]; go(TABS[role][0][0]); }
  $('#tabs').addEventListener('click', e => { const b = e.target.closest('[data-v]'); if (b) go(b.dataset.v); });
  function go(v) { view = v; $$('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.v === v)); render(); scrollTo(0, 0); }
  function render() { ({ dash, orders, devis, delivery, catalog, clients, mkt, journal, settings })[view](); }
  document.addEventListener('click', e => { const g = e.target.closest('[data-go]'); if (g) go(g.dataset.go); });

  /* ---------- calculs partagés ---------- */
  const isLate = d => d.status === 'nouveau' && Date.now() - d.at > DAY;
  const evRange = days => { const E = get('ev', {}), out = { visit: 0, view: 0, cart: 0, devis: 0, order: 0, quote: 0, wa: 0, quiz: 0, pack: 0, p: {} }; const lim = X.day(Date.now() - days * DAY);
    Object.keys(E).filter(k => k >= lim).forEach(k => { const e = E[k]; Object.keys(out).forEach(t => { if (t !== 'p') out[t] += e[t] || 0; }); Object.entries(e.p || {}).forEach(([id, v]) => { out.p[id] = out.p[id] || {}; Object.entries(v).forEach(([t, c]) => { out.p[id][t] = (out.p[id][t] || 0) + c; }); }); }); return out; };
  function sourcesTable() {
    const O = get('orders', []), D = get('devis', []), m = {};
    const add = (k, f) => { m[k] = m[k] || { o: 0, ca: 0, d: 0, dv: 0, won: 0 }; f(m[k]); };
    O.forEach(o => add(o.src || '', r => { r.o++; if (o.status === 'livrée') r.ca += X.orderTotal(o); }));
    D.forEach(d => add(d.src || '', r => { r.d++; r.dv += X.devisTotal(d); if (d.status === 'gagné') { r.won++; r.ca += X.devisTotal(d); } }));
    return Object.entries(m).sort((a, b) => b[1].ca - a[1].ca);
  }

  /* ---------- tableau de bord ---------- */
  function dash() {
    const O = get('orders', []), D = get('devis', []), now = Date.now();
    const deliv = O.filter(o => o.status === 'livrée'), won = D.filter(d => d.status === 'gagné');
    const ca = deliv.reduce((a, o) => a + X.orderTotal(o), 0) + won.reduce((a, d) => a + X.devisTotal(d), 0);
    const open = D.filter(d => ['nouveau', 'envoyé', 'négociation'].includes(d.status)), pipe = open.reduce((a, d) => a + X.devisTotal(d), 0);
    const closed = D.filter(d => d.status === 'gagné' || d.status === 'perdu'), wr = closed.length ? Math.round(won.length / closed.length * 100) : null;
    const nOrd = deliv.length + won.length, basket = nOrd ? ca / nOrd : null;
    const days = [...Array(14)].map((_, i) => now - (13 - i) * DAY);
    const per = days.map(t => deliv.filter(o => sameDay(o.t_livree || o.at, t)).reduce((a, o) => a + X.orderTotal(o), 0) + won.filter(d => sameDay(d.t_won || d.at, t)).reduce((a, d) => a + X.devisTotal(d), 0)), max = Math.max(1, ...per);
    const late = D.filter(isLate), todo = O.filter(o => o.status === 'nouvelle');
    const E = evRange(30), conv = pct(E.order + E.quote, E.visit);
    const sold = {}; deliv.forEach(o => o.lines.forEach(l => { sold[l.pid] = (sold[l.pid] || 0) + l.qty; })); won.forEach(d => d.lines.forEach(l => { sold[l.pid] = (sold[l.pid] || 0) + l.qty; }));
    const top = Object.entries(sold).sort((a, b) => b[1] - a[1]).slice(0, 5);
    $('#view').innerHTML = '<div class="hd"><div><h2>Bonjour 👋</h2><p>STI Bureautique · ' + new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) + '</p></div><div class="acts"><button class="mb" data-go="orders">Commandes à confirmer : <b>' + todo.length + '</b></button><button class="mb' + (late.length ? ' red' : '') + '" data-go="devis">Devis en retard (> 24 h) : <b>' + late.length + '</b></button></div></div>' +
      '<div class="kp"><div><small>Chiffre d\'affaires encaissé</small><b>' + money(ca) + '</b><em>commandes livrées + devis gagnés</em></div><div><small>Devis en cours</small><b>' + money(pipe) + '</b><em>' + open.length + ' devis · transformation ' + (wr == null ? '—' : wr + ' %') + '</em></div>' +
      '<div><small>Panier moyen</small><b>' + money(basket) + '</b><em>' + nOrd + ' ventes</em></div><div><small>Conversion du site</small><b>' + conv + ' %</b><em>' + E.visit + ' visites · 30 jours</em></div></div>' +
      '<div class="grid2"><div class="pn"><h3>Chiffre d\'affaires · 14 jours</h3><div class="bars">' + per.map((v, i) => '<div title="' + money(v) + '"><em>' + (v ? Math.round(v / 1000) + 'k' : '') + '</em><i style="height:' + (v / max * 100) + '%"></i><span>' + new Date(days[i]).getDate() + '</span></div>').join('') + '</div><div style="height:22px"></div></div>' +
      '<div class="pn"><h3>Meilleures ventes</h3><div class="lst">' + (top.map(([id, c]) => { const p = X.prod(id); return '<div class="r"><span>' + esc(p ? p.name : id) + '</span><b>' + c + '</b></div>'; }).join('') || '<div class="empty">Pas encore de vente.</div>') + '</div></div></div>' +
      '<div class="grid2" style="margin-top:12px"><div class="pn"><h3>À faire maintenant</h3>' + actions().slice(0, 5).map(a => '<div class="act"><span>' + a[0] + '</span><div><b>' + esc(a[1]) + '</b><small>' + esc(a[2]) + '</small></div></div>').join('') + '</div>' +
      '<div class="pn"><h3>D\'où viennent les clients</h3><div class="lst">' + sourcesTable().map(([k, r]) => '<div class="r"><span>' + esc(X.srcName(k)) + '</span><b>' + money(r.ca) + '</b></div>').join('') + '</div><button class="mb" data-go="mkt" style="margin-top:10px">Voir le détail marketing →</button></div></div>' +
      '<p class="note" style="margin-top:12px">Démo : commandes, devis et statistiques d\'exemple marqués « (démo) ». Réglages → Réinitialiser pour repartir de zéro. Les commandes et devis envoyés depuis le site arrivent ici en direct.</p>';
  }
  function actions() {
    const A = [], O = get('orders', []), D = get('devis', []), E = evRange(30), P = X.products();
    const late = D.filter(isLate); if (late.length) A.push(['⏰', late.length + ' devis attendent depuis plus de 24 h', 'La promesse « devis sous 24 h » est affichée sur le site : envoyez-les en priorité.']);
    const todo = O.filter(o => o.status === 'nouvelle'); if (todo.length) A.push(['📞', todo.length + ' commande(s) à confirmer par téléphone', 'Une commande rappelée dans l\'heure est rarement annulée.']);
    const neg = D.filter(d => d.status === 'envoyé' && Date.now() - (d.t_sent || d.at) > 2 * DAY); if (neg.length) A.push(['🔁', neg.length + ' devis envoyé(s) sans réponse depuis 48 h', 'Relancez sur WhatsApp avec une question simple : « Avez-vous pu le consulter ? »']);
    const S = sourcesTable().filter(([k]) => k); if (S.length) A.push(['📣', 'Meilleure source : ' + X.srcName(S[0][0]), 'C\'est elle qui rapporte le plus de chiffre d\'affaires : renforcez-la en priorité (publications, budget pub).']);
    const opp = Object.entries(E.p).map(([id, v]) => ({ id, v: v.view || 0, c: v.cart || 0 })).filter(x => x.v >= 30 && x.c / x.v < 0.06).sort((a, b) => b.v - a.v)[0];
    if (opp) { const p = X.prod(opp.id); if (p) A.push(['🔍', p.name + ' : beaucoup vue, peu ajoutée', opp.v + ' vues pour ' + opp.c + ' ajouts : ajoutez une vidéo de réglage, un avis client, ou testez une offre.']); }
    const best = P.filter(p => p.best).length; if (best > 6) A.push(['🏷️', best + ' produits marqués « Meilleure vente »', 'Au-delà de 6, le badge ne veut plus rien dire : gardez seulement les vraies meilleures ventes.']);
    if (!A.length) A.push(['✅', 'Tout est à jour', 'Rien d\'urgent : publiez un contenu « preuve » (livraison, avis client) aujourd\'hui.']);
    return A;
  }

  /* ---------- commandes ---------- */
  const ST = ['nouvelle', 'confirmée', 'expédiée', 'livrée', 'annulée'];
  let filt = 'toutes', q = '';
  const itemsTxt = o => o.lines.map(l => l.qty + ' × ' + l.name).join(', ');
  const confirmMsg = o => 'Bonjour ' + o.name.split(' ')[0] + ', ici STI Bureautique. Nous confirmons votre commande : ' + itemsTxt(o) + ' = ' + money(X.sub(o.lines)) + (o.mode === 'retrait' ? '. Retrait au showroom (' + STI.address + ', ' + STI.hours + ') : ' + STI.maps : (o.fee != null ? ', livraison ' + (o.fee ? money(o.fee) : 'offerte') + ', total ' + money(X.orderTotal(o)) : ', frais de livraison à confirmer') + '. Livraison à ' + o.com + ' (' + o.wil + '), paiement à la livraison.') + ' Merci de votre confiance !';
  const bon = o => 'STI BUREAUTIQUE · ' + STI.phones.join(' / ') + '\n' + (o.mode === 'retrait' ? 'BON DE RETRAIT' : 'BON DE LIVRAISON') + ' n° ' + String(o.id).toUpperCase() + '\nDate : ' + dfmt(o.at) + '\n------------------------------\nClient : ' + o.name + '\nTél. : ' + phoneFmt(o.phone) + '\n' + (o.mode === 'retrait' ? 'Retrait au showroom' : 'Adresse : ' + (o.adr ? o.adr + ', ' : '') + o.com + ', ' + o.wil) + '\n------------------------------\n' + o.lines.map(l => l.qty + ' x ' + l.name + '\n   ' + money(l.price * l.qty)).join('\n') + (o.mode === 'retrait' ? '' : '\nLivraison : ' + (o.fee == null ? 'à confirmer' : o.fee ? money(o.fee) : 'offerte')) + '\nTOTAL À ENCAISSER : ' + money(X.orderTotal(o)) + '\n------------------------------\nSignature client :';
  function orders() {
    const O = get('orders', []);
    const L = O.filter(o => (filt === 'toutes' || o.status === filt) && (!q || (o.name + ' ' + o.phone + ' ' + o.wil + ' ' + o.com + ' ' + itemsTxt(o)).toLowerCase().includes(q.toLowerCase())));
    $('#view').innerHTML = '<div class="hd"><div><h2>Commandes</h2><p>Les commandes du site arrivent ici en direct, avec la source du client (Instagram, Google…).</p></div><button class="mb" id="csv">Copier pour Excel</button></div>' +
      '<div class="bar2"><div class="flt">' + ['toutes'].concat(ST).map(s => '<button data-f="' + s + '" class="' + (s === filt ? 'on' : '') + '">' + s + ' <b>' + (s === 'toutes' ? O.length : O.filter(o => o.status === s).length) + '</b></button>').join('') + '</div><input id="q" placeholder="Rechercher : nom, téléphone, produit…" value="' + esc(q) + '" aria-label="Rechercher"></div>' +
      '<div class="pn">' + (L.length ? '<div class="tw"><table class="t"><thead><tr><th>Date</th><th>Client</th><th>Articles</th><th>Livraison</th><th>Total</th><th>Source</th><th>Statut</th><th>Actions</th></tr></thead><tbody>' + L.map(o =>
        '<tr><td>' + dfmt(o.at) + '</td><td><b>' + esc(o.name) + '</b><br><small>' + phoneFmt(o.phone) + '</small></td><td>' + o.lines.map(l => '<div>' + l.qty + ' × ' + esc(l.name) + '</div>').join('') + '</td><td>' + (o.mode === 'retrait' ? '🏬 Showroom' : esc(o.wil) + '<br><small>' + esc(o.com) + '</small>') + '</td><td><b>' + money(X.orderTotal(o)) + '</b>' + (o.fee == null && o.mode !== 'retrait' ? '<br><small>+ livraison</small>' : '') + '</td><td><span class="bdg blu">' + esc(X.srcName(o.src)) + '</span></td>' +
        '<td><select data-st="' + esc(o.id) + '" aria-label="Statut">' + ST.map(s => '<option' + (s === o.status ? ' selected' : '') + '>' + s + '</option>').join('') + '</select></td><td><div class="acts"><a class="mb wa" target="_blank" rel="noopener" href="' + wa(o.phone, confirmMsg(o)) + '">Confirmer WhatsApp</a><a class="mb" href="tel:' + esc(o.phone) + '">Appeler</a><button class="mb" data-bon="' + esc(o.id) + '">Bon</button></div></td></tr>' +
        '<tr id="bon-' + esc(o.id) + '" hidden><td colspan="8"><div class="rcpt">' + esc(bon(o)) + '</div><button class="mb" data-cpb="' + esc(o.id) + '">Copier le bon</button></td></tr>').join('') + '</tbody></table></div>' : '<div class="empty">Aucune commande.</div>') + '</div>';
    $('#q').oninput = e => { q = e.target.value; const p = e.target.selectionStart; orders(); const i = $('#q'); i.focus(); i.setSelectionRange(p, p); };
    $('#csv').onclick = () => copy([['Date', 'Nom', 'Téléphone', 'Mode', 'Wilaya', 'Commune', 'Articles', 'Total', 'Source', 'Statut']].concat(O.map(o => [dfmt(o.at), o.name, o.phone, o.mode, o.wil, o.com, itemsTxt(o), X.orderTotal(o), X.srcName(o.src), o.status])).map(r => r.join('\t')).join('\n'), '✓ Copié : collez dans Excel');
  }
  document.addEventListener('click', e => {
    const f = e.target.closest('[data-f]'); if (f) { filt = f.dataset.f; orders(); return; }
    const b = e.target.closest('[data-bon]'); if (b) { const r = document.getElementById('bon-' + b.dataset.bon); if (r) r.hidden = !r.hidden; return; }
    const c = e.target.closest('[data-cpb]'); if (c) { const o = get('orders', []).find(x => x.id === c.dataset.cpb); if (o) copy(bon(o), '✓ Bon copié'); }
  });
  function setStatus(id, st, note) { const O = get('orders', []), o = O.find(x => x.id === id); if (!o) return; o.status = st; if (st === 'livrée') o.t_livree = Date.now(); if (note) o.note = note; put('orders', O); log('Commande ' + o.name + ' → ' + st); }
  document.addEventListener('change', e => { const s = e.target.closest('[data-st]'); if (s) { setStatus(s.dataset.st, s.value); toast('✓ Commande ' + s.value); render(); } });

  /* ---------- devis B2B ---------- */
  const DST = [['nouveau', 'Nouveaux'], ['envoyé', 'Envoyés'], ['négociation', 'Négociation'], ['gagné', 'Gagnés'], ['perdu', 'Perdus']];
  let selD = null;
  const devisTxt = d => 'STI BUREAUTIQUE · Mobilier de bureau\n' + STI.address + ' · ' + STI.phones.join(' / ') + '\n' + STI.email + '\n\nDEVIS ' + d.ref + ' · ' + dfmt(Date.now(), { day: '2-digit', month: '2-digit', year: 'numeric' }) + '\nClient : ' + d.company + (d.nif ? ' (NIF/RC ' + d.nif + ')' : '') + '\nÀ l\'attention de : ' + d.name + ' · ' + phoneFmt(d.phone) + '\nWilaya : ' + d.wil + '\n------------------------------------------\n' +
    d.lines.map(l => l.qty + ' × ' + l.name + '\n     PU ' + money(l.price) + '   =   ' + money(l.price * l.qty)).join('\n') + '\n------------------------------------------\nTotal TTC : ' + money(X.sub(d.lines)) + (d.disc ? '\nRemise ' + d.disc + ' % : −' + money(X.sub(d.lines) - X.devisTotal(d)) + '\nNET À PAYER TTC : ' + money(X.devisTotal(d)) : '') + '\n\nLivraison 58 wilayas · paiement à la livraison · tout produit endommagé est remplacé.\nDevis valable 15 jours.';
  function devis() {
    const D = get('devis', []); if (selD && !D.find(x => x.id === selD)) selD = null;
    const s = selD ? D.find(x => x.id === selD) : null;
    $('#view').innerHTML = '<div class="hd"><div><h2>Devis entreprises</h2><p>Les demandes du site (panier de devis, configurateur) arrivent dans « Nouveaux ». Promesse affichée : réponse sous 24 h.</p></div></div>' +
      '<div class="pipe">' + DST.map(([k, l]) => { const L = D.filter(x => x.status === k); return '<div class="col"><h4>' + l + ' <b>' + money(L.reduce((a, x) => a + X.devisTotal(x), 0)) + '</b></h4>' + (L.map(x => '<button class="dvc' + (isLate(x) ? ' late' : '') + '" data-dv="' + esc(x.id) + '" aria-pressed="' + (x.id === selD) + '"><b>' + esc(x.company) + '</b><small>' + esc(x.ref) + ' · ' + dfmt(x.at, { day: '2-digit', month: '2-digit' }) + (isLate(x) ? ' · ⏰ en retard' : '') + '</small><span>' + money(X.devisTotal(x)) + '</span></button>').join('') || '<small style="color:var(--muted)">—</small>') + '</div>'; }).join('') + '</div>' +
      (s ? '<div class="grid2"><div class="pn"><h3>' + esc(s.ref) + ' · ' + esc(s.company) + ' <span class="bdg blu">' + esc(X.srcName(s.src)) + '</span></h3><p style="margin:0 0 10px;color:var(--muted)">' + esc(s.name) + ' · ' + phoneFmt(s.phone) + (s.email ? ' · ' + esc(s.email) : '') + ' · ' + esc(s.wil) + (s.nif ? ' · NIF/RC ' + esc(s.nif) : '') + '</p>' + (s.msg ? '<p class="note">💬 ' + esc(s.msg) + '</p>' : '') +
        s.lines.map((l, i) => '<div class="dvl"><span>' + esc(l.name) + '</span><input type="number" min="1" value="' + l.qty + '" data-dq="' + i + '" aria-label="Quantité"><input type="number" min="0" step="100" value="' + l.price + '" data-dp="' + i + '" aria-label="Prix unitaire"><b class="lt">' + money(l.price * l.qty) + '</b></div>').join('') +
        '<div class="frm" style="margin-top:12px;max-width:none"><div class="row3"><div class="f"><label for="dDisc">Remise (%)</label><input id="dDisc" type="number" min="0" max="50" value="' + (s.disc || 0) + '"></div><div class="f"><label for="dSt">Statut</label><select id="dSt">' + DST.map(([k, l]) => '<option value="' + k + '"' + (k === s.status ? ' selected' : '') + '>' + l + '</option>').join('') + '</select></div><div class="f"><label>Net TTC</label><b style="font-size:24px">' + money(X.devisTotal(s)) + '</b></div></div></div>' +
        '<div class="acts" style="margin-top:12px"><a class="mb wa" target="_blank" rel="noopener" href="' + wa(s.phone, devisTxt(s)) + '" id="dSend">📤 Envoyer le devis sur WhatsApp</a><button class="mb" id="dCopy">Copier le devis</button>' + (s.status === 'gagné' && !s.order ? '<button class="mb red" id="dOrd">Créer la commande</button>' : '') + '<a class="mb" href="tel:' + esc(s.phone) + '">Appeler</a></div></div>' +
        '<div class="pn"><h3>Aperçu du devis</h3><div class="rcpt">' + esc(devisTxt(s)) + '</div></div></div>' : '<div class="pn"><div class="empty">Choisissez un devis pour l\'ouvrir.</div></div>');
    if (!s) return;
    const upd = fn => { const D2 = get('devis', []), x = D2.find(y => y.id === s.id); fn(x); put('devis', D2); devis(); };
    $$('[data-dq]').forEach(i => i.onchange = () => upd(x => { x.lines[+i.dataset.dq].qty = Math.max(1, Math.round(+i.value || 1)); }));
    $$('[data-dp]').forEach(i => i.onchange = () => upd(x => { x.lines[+i.dataset.dp].price = Math.max(0, Math.round(+i.value || 0)); }));
    $('#dDisc').onchange = e => upd(x => { x.disc = Math.max(0, Math.min(50, +e.target.value || 0)); });
    $('#dSt').onchange = e => upd(x => { x.status = e.target.value; if (x.status === 'envoyé') x.t_sent = Date.now(); if (x.status === 'gagné') x.t_won = Date.now(); log('Devis ' + x.ref + ' → ' + x.status); toast('✓ Devis ' + x.status); });
    $('#dSend').onclick = () => { if (s.status === 'nouveau') upd(x => { x.status = 'envoyé'; x.t_sent = Date.now(); log('Devis ' + x.ref + ' envoyé'); }); };
    $('#dCopy').onclick = () => copy(devisTxt(s), '✓ Devis copié');
    if ($('#dOrd')) $('#dOrd').onclick = () => { const O = get('orders', []); O.unshift({ id: 'o' + Date.now().toString(36), at: Date.now(), src: s.src, mode: 'livraison', name: s.company + ' · ' + s.name, phone: s.phone, wil: s.wil, com: '', adr: '', lines: s.lines.map(l => Object.assign({}, l, { price: Math.round(l.price * (1 - (s.disc || 0) / 100)) })), fee: null, status: 'confirmée', fromDevis: s.ref }); put('orders', O); upd(x => { x.order = true; }); log('Commande créée depuis ' + s.ref); toast('✓ Commande créée'); };
  }
  document.addEventListener('click', e => { if (view !== 'devis') return; const b = e.target.closest('[data-dv]'); if (b) { selD = b.dataset.dv; devis(); } });

  /* ---------- livraisons ---------- */
  function delivery() {
    const L = get('orders', []).filter(o => o.mode !== 'retrait' && (o.status === 'confirmée' || o.status === 'expédiée')).sort((a, b) => a.at - b.at);
    $('#view').innerHTML = '<div class="hd"><div><h2>' + (role === 'driver' ? 'Mes livraisons' : 'Livraisons') + '</h2><p>' + L.length + ' à livrer · montant à encaisser indiqué sur chaque carte.</p></div></div>' +
      (L.length ? '<div class="dl">' + L.map(o => { const adr = (o.adr ? o.adr + ', ' : '') + (o.com ? o.com + ', ' : '') + String(o.wil).replace(/^\d+ /, '');
        return '<div class="dcard"><div class="dtop"><b>' + esc(o.name) + '</b><span class="st2 s-' + o.status + '">' + o.status + '</span></div><div class="dadr">📍 ' + esc(adr) + '</div><div>' + o.lines.map(l => l.qty + ' × ' + esc(l.name)).join('<br>') + '</div><div class="dmt">À encaisser : <b>' + money(X.orderTotal(o)) + '</b>' + (o.fee == null ? ' <small>+ livraison</small>' : '') + '</div>' +
          '<div class="acts"><a class="mb" href="tel:' + esc(o.phone) + '">📞 Appeler</a><a class="mb wa" target="_blank" rel="noopener" href="' + wa(o.phone, 'Bonjour, ici le livreur de STI Bureautique. Je suis en route avec votre commande. À tout de suite !') + '">WhatsApp</a><a class="mb" target="_blank" rel="noopener" href="https://maps.google.com/?q=' + encodeURIComponent(adr + ', Algérie') + '">🗺️ Itinéraire</a></div>' +
          '<div class="acts">' + (o.status === 'confirmée' ? '<button class="mb" data-dl="' + esc(o.id) + '" data-to="expédiée">🚚 En route</button>' : '') + '<button class="mb red" data-dl="' + esc(o.id) + '" data-to="livrée">✓ Livrée et encaissée</button><button class="mb" data-dl="' + esc(o.id) + '" data-to="report">↩︎ Reporter</button></div>' + (o.note ? '<small class="dnote">' + esc(o.note) + '</small>' : '') + '</div>'; }).join('') + '</div>' : '<div class="pn"><div class="empty">Rien à livrer pour l\'instant. 👍</div></div>');
  }
  document.addEventListener('click', e => { const b = e.target.closest('[data-dl]'); if (!b) return; if (b.dataset.to === 'report') { setStatus(b.dataset.dl, 'confirmée', 'Reportée le ' + dfmt(Date.now())); toast('↩︎ Reportée'); } else { setStatus(b.dataset.dl, b.dataset.to); toast(b.dataset.to === 'livrée' ? '✓ Livrée et encaissée' : '🚚 En route'); } render(); });

  /* ---------- catalogue ---------- */
  let cq = '', ccat = '';
  function catalog() {
    const P = X.products(), E = evRange(30);
    const L = P.filter(p => (!ccat || p.cat === ccat) && (!cq || (p.name + ' ' + p.raw).toLowerCase().includes(cq.toLowerCase())));
    const nb = P.filter(p => p.best).length;
    $('#view').innerHTML = '<div class="hd"><div><h2>Catalogue</h2><p>' + P.length + ' modèles réels · prix, prix barré, stock, badge et mise en ligne modifiables. Chaque changement s\'applique tout de suite au site.</p></div></div>' +
      (nb > 6 ? '<p class="note warnline">⚠️ ' + nb + ' produits ont le badge « Meilleure vente » : au-delà de 6, il ne veut plus rien dire pour le client.</p>' : '') +
      '<div class="bar2"><input id="cq" placeholder="🔍 Rechercher un modèle…" value="' + esc(cq) + '" aria-label="Rechercher"><div class="flt">' + [''].concat(X.CATS).map(c => '<button data-cc="' + esc(c) + '" class="' + (c === ccat ? 'on' : '') + '">' + esc(c || 'Tous') + '</button>').join('') + '</div></div>' +
      '<div class="pn"><div class="tw"><table class="t"><thead><tr><th>Modèle</th><th>Prix TTC (par option)</th><th>Stock</th><th>Vues 30 j</th><th>Badge</th><th>En ligne</th></tr></thead><tbody>' + L.map(p => { const v = (E.p[p.id] || {}).view || 0;
        return '<tr><td><div class="pcell">' + (p.img.length ? '<img src="' + esc(p.img[0]) + '" alt="">' : '') + '<div><b>' + esc(p.name) + '</b><br><small>' + esc(p.cat) + '</small></div></div></td><td><div class="vin">' + p.v.map((x, i) => '<label>' + esc(x.t || 'Prix') + '<input type="number" min="0" step="100" value="' + x.p + '" data-vp="' + esc(p.id) + '|' + i + '" aria-label="Prix ' + esc(p.name + ' ' + x.t) + '"></label><label>Barré<input type="number" min="0" step="100" value="' + (x.o || '') + '" placeholder="—" data-vo="' + esc(p.id) + '|' + i + '" aria-label="Prix barré ' + esc(p.name + ' ' + x.t) + '"></label>').join('') + '</div></td>' +
          '<td><input type="number" min="0" style="width:84px;padding:8px" value="' + (p.stock == null ? '' : p.stock) + '" placeholder="non suivi" data-stk="' + esc(p.id) + '" aria-label="Stock ' + esc(p.name) + '"></td><td>' + v + '</td>' +
          '<td><button class="sw ' + (p.best ? 'on' : '') + '" data-best="' + esc(p.id) + '" role="switch" aria-checked="' + p.best + '" aria-label="Meilleure vente : ' + esc(p.name) + '"></button></td><td><button class="sw ' + (p.web ? 'on' : '') + '" data-web="' + esc(p.id) + '" role="switch" aria-checked="' + p.web + '" aria-label="En ligne : ' + esc(p.name) + '"></button></td></tr>'; }).join('') + '</tbody></table></div></div>';
    $('#cq').oninput = e => { cq = e.target.value; const p = e.target.selectionStart; catalog(); const i = $('#cq'); i.focus(); i.setSelectionRange(p, p); };
  }
  const setProd = (id, fn) => { const ov = get('prod', {}); ov[id] = ov[id] || {}; fn(ov[id]); put('prod', ov); };
  document.addEventListener('click', e => {
    if (view !== 'catalog') return;
    const c = e.target.closest('[data-cc]'); if (c) { ccat = c.dataset.cc; catalog(); return; }
    const w = e.target.closest('[data-web]'); if (w) { setProd(w.dataset.web, o => { o.web = o.web === false; }); const p = X.prod(w.dataset.web); log((p.web ? 'En ligne : ' : 'Retiré du site : ') + p.name); toast(p.web ? '✓ En ligne' : 'Retiré du site'); catalog(); return; }
    const b = e.target.closest('[data-best]'); if (b) { setProd(b.dataset.best, o => { o.best = !o.best; }); catalog(); }
  });
  document.addEventListener('change', e => {
    if (view !== 'catalog') return;
    const vp = e.target.closest('[data-vp],[data-vo]'); if (vp) { const [id, i] = (vp.dataset.vp || vp.dataset.vo).split('|'), val = vp.value === '' ? null : Math.max(0, Math.round(+vp.value)); const p = X.prod(id);
      if (vp.dataset.vp && !(val > 0)) { toast('Prix invalide'); catalog(); return; }
      setProd(id, o => { o.v = o.v || []; o.v[+i] = Object.assign({}, o.v[+i], vp.dataset.vp ? { p: val } : { o: val }); }); log('Prix ' + X.lineName(p, +i) + ' : ' + money(val)); toast('✓ Prix mis à jour sur le site'); catalog(); return; }
    const s = e.target.closest('[data-stk]'); if (s) { setProd(s.dataset.stk, o => { o.stock = s.value === '' ? null : Math.max(0, Math.round(+s.value)); }); toast('✓ Stock enregistré'); }
  });

  /* ---------- clients ---------- */
  function clients() {
    const m = {};
    get('orders', []).forEach(o => { const k = o.phone; m[k] = m[k] || { name: o.name, phone: o.phone, wil: o.wil || 'Showroom', type: 'Particulier', n: 0, total: 0, last: 0, src: o.src }; m[k].n++; if (o.status === 'livrée') m[k].total += X.orderTotal(o); m[k].last = Math.max(m[k].last, o.at); });
    get('devis', []).forEach(d => { const k = d.phone; m[k] = m[k] || { name: d.name, phone: d.phone, wil: d.wil, n: 0, total: 0, last: 0, src: d.src }; m[k].type = 'Entreprise'; m[k].company = d.company; m[k].n++; if (d.status === 'gagné') m[k].total += X.devisTotal(d); m[k].last = Math.max(m[k].last, d.at); });
    const L = Object.values(m).sort((a, b) => b.last - a.last);
    $('#view').innerHTML = '<div class="hd"><div><h2>Clients</h2><p>' + L.length + ' clients · ' + L.filter(c => c.type === 'Entreprise').length + ' entreprises. Relancez-les pour équiper un autre bureau ou recommander.</p></div><button class="mb" id="cpC">Copier les numéros</button></div><div class="pn"><div class="tw"><table class="t"><thead><tr><th>Client</th><th>Type</th><th>Wilaya</th><th>Achats</th><th>Total encaissé</th><th>Source</th><th></th></tr></thead><tbody>' +
      L.map(c => '<tr><td><b>' + esc(c.company || c.name) + '</b><br><small>' + (c.company ? esc(c.name) + ' · ' : '') + phoneFmt(c.phone) + '</small></td><td><span class="bdg ' + (c.type === 'Entreprise' ? 'blu' : '') + '">' + c.type + '</span></td><td>' + esc(c.wil) + '</td><td>' + c.n + '</td><td>' + money(c.total) + '</td><td>' + esc(X.srcName(c.src)) + '</td><td><a class="mb wa" target="_blank" rel="noopener" href="' + wa(c.phone, 'Bonjour ' + c.name.split(' ')[0] + ', ici STI Bureautique. Merci pour votre confiance ! Tout se passe bien avec votre mobilier ? Nous restons disponibles pour vos prochains aménagements.') + '">Relancer</a></td></tr>').join('') + '</tbody></table></div></div>';
    $('#cpC').onclick = () => copy(L.map(c => (c.company || c.name) + '\t' + c.phone).join('\n'), '✓ Numéros copiés');
  }

  /* ---------- marketing ---------- */
  let mDays = 30, base = 'https://stibureautique.dz/', lkP = 'chaise-ergonomique-galaxy', lkS = 'ig';
  function mkt() {
    const E = evRange(mDays), adds = E.cart + E.devis, conv = E.order + E.quote;
    const F = [['Visites', E.visit], ['Fiches produit vues', E.view], ['Ajouts panier / devis', adds], ['Commandes + devis', conv]], mx = Math.max(1, F[0][1]);
    const S = sourcesTable();
    const prods = Object.entries(E.p).map(([id, v]) => ({ p: X.prod(id), v: v.view || 0, c: (v.cart || 0) + (v.devis || 0) })).filter(x => x.p).sort((a, b) => b.v - a.v).slice(0, 8);
    $('#view').innerHTML = '<div class="hd"><div><h2>Marketing</h2><p>Ce qui fait venir les clients, et ce qui les fait acheter. Chiffres mesurés sur le site + source déclarée par chaque client.</p></div><div class="flt">' + [7, 30, 90].map(n => '<button data-md="' + n + '" class="' + (n === mDays ? 'on' : '') + '">' + n + ' jours</button>').join('') + '</div></div>' +
      '<div class="kp"><div><small>Visites</small><b>' + E.visit + '</b><em>' + mDays + ' derniers jours</em></div><div><small>Taux de conversion</small><b>' + pct(conv, E.visit) + ' %</b><em>commandes + devis / visites</em></div><div><small>Clics WhatsApp</small><b>' + E.wa + '</b><em>conversations ouvertes</em></div><div><small>Conseiller & configurateur</small><b>' + (E.quiz + E.pack) + '</b><em>' + E.quiz + ' conseils · ' + E.pack + ' configurations</em></div></div>' +
      '<div class="grid2"><div class="pn"><h3>Entonnoir de vente</h3><div class="funnel">' + F.map((f, i) => '<div class="fn"><span>' + f[0] + '</span><div class="bar"><i style="width:' + Math.max(2, f[1] / mx * 100) + '%"></i></div><em>' + f[1] + (i === 1 ? ' · ' + (F[0][1] ? (f[1] / F[0][1]).toFixed(1).replace('.', ',') : 0) + ' / visite' : i ? ' · ' + pct(f[1], F[i - 1][1]) + ' %' : '') + '</em></div>').join('') + '</div><p class="note" style="margin-top:12px">Le pourcentage indique combien passent à l\'étape suivante : c\'est l\'étape la plus faible qu\'il faut améliorer en premier.</p></div>' +
      '<div class="pn"><h3>Recommandations</h3>' + actions().map(a => '<div class="act"><span>' + a[0] + '</span><div><b>' + esc(a[1]) + '</b><small>' + esc(a[2]) + '</small></div></div>').join('') + '</div></div>' +
      '<div class="pn" style="margin-top:12px"><h3>Performance par source</h3><div class="tw"><table class="t"><thead><tr><th>Source</th><th>Commandes</th><th>Devis</th><th>Devis gagnés</th><th>Valeur des devis</th><th>Chiffre d\'affaires</th></tr></thead><tbody>' + S.map(([k, r]) => '<tr><td><b>' + esc(X.srcName(k)) + '</b></td><td>' + r.o + '</td><td>' + r.d + '</td><td>' + r.won + '</td><td>' + money(r.dv) + '</td><td><b>' + money(r.ca) + '</b></td></tr>').join('') + '</tbody></table></div></div>' +
      '<div class="grid2" style="margin-top:12px"><div class="pn"><h3>Produits : intérêt et ajout</h3><div class="tw"><table class="t" style="min-width:480px"><thead><tr><th>Modèle</th><th>Vues</th><th>Ajouts</th><th>Taux</th></tr></thead><tbody>' + prods.map(x => { const r = pct(x.c, x.v); return '<tr><td>' + esc(x.p.name) + '</td><td>' + x.v + '</td><td>' + x.c + '</td><td><span class="bdg ' + (r < 6 ? 'red' : r > 10 ? 'grn' : '') + '">' + r + ' %</span></td></tr>'; }).join('') + '</tbody></table></div><p class="note" style="margin-top:10px">Taux faible = le produit attire mais ne convainc pas : photos, vidéo de réglage, avis client ou prix à revoir.</p></div>' +
      '<div class="pn"><h3>Liens de campagne</h3><p class="note">Mettez ces liens dans la bio, les pubs et les messages : chaque visite est attribuée à la bonne source, et la source est pré-remplie dans le formulaire du client.</p><div class="frm" style="max-width:none;margin:10px 0"><div class="f"><label for="mBase">Adresse du site</label><input id="mBase" value="' + esc(base) + '"></div></div>' +
        X.SOURCES.filter(s => !['bo', 'sh', 'au'].includes(s[0])).map(s => '<div class="lk"><span>' + esc(s[1]) + '</span><code>' + esc(base.replace(/#.*$/, '') + '#' + s[0]) + '</code><button class="mb" data-lk="' + s[0] + '">Copier</button></div>').join('') + '<h3 style="margin-top:18px">Lien direct vers un produit</h3><p class="note">Pour une publication sur un modèle : le client arrive directement sur sa fiche, et la vente est attribuée à la bonne source.</p><div class="frm" style="max-width:none;margin-top:10px"><div class="row2"><div class="f"><label for="lkP">Produit</label><select id="lkP">' + X.products().map(p => '<option value="' + esc(p.id) + '"' + (p.id === lkP ? ' selected' : '') + '>' + esc(p.name) + '</option>').join('') + '</select></div><div class="f"><label for="lkS">Source</label><select id="lkS">' + X.SOURCES.filter(s => !['bo', 'sh', 'au'].includes(s[0])).map(s => '<option value="' + s[0] + '"' + (s[0] === lkS ? ' selected' : '') + '>' + esc(s[1]) + '</option>').join('') + '</select></div></div><div class="lk" style="grid-template-columns:minmax(0,1fr) auto"><code id="lkOut">' + esc(base.replace(/#.*$/, '') + '#' + lkS + '.' + lkP) + '</code><button class="mb red" id="lkCp">Copier</button></div></div></div></div>';
    $('#mBase').onchange = e => { base = e.target.value.trim() || base; mkt(); };
    $('#lkP').onchange = e => { lkP = e.target.value; mkt(); }; $('#lkS').onchange = e => { lkS = e.target.value; mkt(); }; $('#lkCp').onclick = () => copy($('#lkOut').textContent, '✓ Lien produit copié');
  }
  document.addEventListener('click', e => {
    if (view !== 'mkt') return;
    const b = e.target.closest('[data-md]'); if (b) { mDays = +b.dataset.md; mkt(); return; }
    const l = e.target.closest('[data-lk]'); if (l) copy(base.replace(/#.*$/, '') + '#' + l.dataset.lk, '✓ Lien ' + X.srcName(l.dataset.lk) + ' copié');
  });

  /* ---------- journal, réglages ---------- */
  function journal() { const L = get('log', []); $('#view').innerHTML = '<div class="hd"><div><h2>Journal</h2><p>Qui a fait quoi, et quand.</p></div></div><div class="pn"><div class="lst">' + (L.slice(0, 150).map(l => '<div class="r"><span>' + dfmt(l.at) + ' · <b>' + esc(l.who) + '</b> · ' + esc(l.txt) + '</span></div>').join('') || '<div class="empty">Rien pour l\'instant.</div>') + '</div></div>'; }
  function settings() {
    const s = X.S(), W = window.STI_WILAYAS || [], Z = s.zones;
    $('#view').innerHTML = '<div class="hd"><div><h2>Réglages</h2><p>Les frais de livraison s\'affichent au client avant qu\'il commande.</p></div></div><div class="grid2"><div class="pn"><h3>Frais de livraison par wilaya</h3><p class="note">Wilaya non renseignée : « confirmés par téléphone ». 0 = livraison offerte.</p><div class="frm"><div class="row2"><div class="f"><label for="zW">Wilaya</label><select id="zW"><option value="">Choisir…</option><option value="*">Toutes les wilayas</option>' + W.map(w => '<option>' + esc(w) + '</option>').join('') + '</select></div><div class="f"><label for="zF">Frais (DA)</label><input id="zF" type="number" min="0" step="50"></div></div><button class="btn btn-dk" id="zAdd">Enregistrer ce tarif</button>' +
      '<div class="lst">' + (Object.keys(Z).sort().map(w => '<div class="r"><span>' + esc(w) + '</span><span><b>' + (+Z[w] === 0 ? 'Offerte' : money(+Z[w])) + '</b> <button class="mb" data-zd="' + esc(w) + '" aria-label="Retirer ' + esc(w) + '">✕</button></span></div>').join('') || '<div class="empty">Aucun tarif.</div>') + '</div></div></div>' +
      '<div class="pn"><h3>Codes d\'accès</h3><div class="frm"><div class="row3">' + [['cM', 'manager', 'Gérant'], ['cS', 'sales', 'Commercial'], ['cD', 'driver', 'Livreur']].map(([id, k, l]) => '<div class="f"><label for="' + id + '">' + l + '</label><input id="' + id + '" inputmode="numeric" maxlength="4" value="' + esc(s.pins[k]) + '"></div>').join('') + '</div><button class="btn btn-dk" id="svp">Changer les codes</button></div>' +
      '<h3 style="margin-top:20px">Sauvegarde et démo</h3><div class="acts"><button class="mb" id="bk">Copier la sauvegarde</button><button class="mb" id="rst">Réinitialiser la démo</button></div></div></div>';
    $('#zAdd').onclick = () => { const w = $('#zW').value, f = $('#zF').value; if (!w || f === '' || +f < 0) { toast('Choisissez une wilaya et un montant'); return; } const z = Object.assign({}, X.S().zones); if (w === '*') W.forEach(x => { z[x] = Math.round(+f); }); else z[w] = Math.round(+f); X.save({ zones: z }); log('Livraison ' + (w === '*' ? 'toutes wilayas' : w) + ' : ' + money(+f)); toast('✓ Tarif enregistré'); settings(); };
    $('#svp').onclick = () => { const v = ['cM', 'cS', 'cD'].map(id => $('#' + id).value); if (!v.every(x => /^\d{4}$/.test(x)) || new Set(v).size < 3) { toast('3 codes différents de 4 chiffres'); return; } X.save({ pins: { manager: v[0], sales: v[1], driver: v[2] } }); log('Codes changés'); toast('✓ Codes changés'); };
    $('#bk').onclick = () => { const data = {}; ['settings', 'orders', 'devis', 'prod', 'log'].forEach(k => { data[k] = get(k, null); }); copy(JSON.stringify(data), '✓ Sauvegarde copiée'); };
    $('#rst').onclick = e => { if (e.currentTarget.dataset.sure !== '1') { e.currentTarget.dataset.sure = '1'; e.currentTarget.textContent = 'Confirmer ?'; e.currentTarget.classList.add('red'); return; } ['orders', 'devis', 'prod', 'settings', 'log', 'ev', 'seeded'].forEach(k => { try { localStorage.removeItem('sti-' + k); } catch (x) { /* bloqué */ } }); seed(); toast('✓ Démo réinitialisée'); settings(); };
  }
  document.addEventListener('click', e => { const z = e.target.closest('[data-zd]'); if (!z) return; const zz = Object.assign({}, X.S().zones); delete zz[z.dataset.zd]; X.save({ zones: zz }); toast('Tarif retiré'); settings(); });

  X.onChange(() => { if (!$('#app').hidden && ['settings', 'catalog', 'devis'].indexOf(view) < 0) render(); });
  if (role) start();
})();
