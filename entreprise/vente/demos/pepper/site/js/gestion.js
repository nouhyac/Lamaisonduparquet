/* PEPPER — espace équipe : cuisine, caisse, tableau de bord, carte, réglages */
(function () {
  'use strict';
  const S = window.PPR, D = S.D;
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const img = n => 'img/carte/' + n + '.webp';
  const SZ = D.sizeNames;
  let role = null, view = null, br = 'gc', pin = '';
  try { role = sessionStorage.getItem('ppr-role'); br = localStorage.getItem('ppr-gbr') || 'gc'; } catch (e) { /* bloqué */ }

  let tt;
  function toast(m) { const el = $('#toast'); el.textContent = m; el.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => el.classList.remove('on'), 2200); }
  const today = () => new Date().toDateString();
  const todays = () => S.orders().filter(o => new Date(o.t.created).toDateString() === today());
  const mins = ms => Math.floor(ms / 60000);
  const hm = ts => new Date(ts).toTimeString().slice(0, 5);

  /* ---------- connexion ---------- */
  $('#llogo').innerHTML = window.PEPPER_LOGO({});
  $('#pad').innerHTML = [1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'].map(k => k === '' ? '<span></span>' : '<button data-k="' + k + '">' + k + '</button>').join('');
  $('#pad').addEventListener('click', e => {
    const b = e.target.closest('[data-k]'); if (!b) return;
    const k = b.dataset.k;
    if (k === '⌫') pin = pin.slice(0, -1); else if (pin.length < 4) pin += k;
    document.querySelectorAll('#pinDots i').forEach((d, i) => d.classList.toggle('on', i < pin.length));
    if (pin.length === 4) {
      const p = S.settings().pins;
      const r = pin === p.manager ? 'manager' : pin === p.kitchen ? 'kitchen' : pin === p.cash ? 'cash' : null;
      if (r) { role = r; try { sessionStorage.setItem('ppr-role', r); } catch (x) { /* bloqué */ } start(); }
      else { $('#pinErr').textContent = 'Code incorrect.'; }
      pin = ''; setTimeout(() => document.querySelectorAll('#pinDots i').forEach(d => d.classList.remove('on')), 250);
    }
  });
  document.addEventListener('keydown', e => { if (!$('#login').hidden && /^[0-9]$/.test(e.key)) { const b = $('#pad [data-k="' + e.key + '"]'); b && b.click(); } });
  $('#logout').onclick = () => { try { sessionStorage.removeItem('ppr-role'); } catch (e) { /* bloqué */ } location.reload(); };

  const TABS = {
    manager: [['dash', '📊 Tableau de bord'], ['kitchen', '🔥 Cuisine'], ['cash', '💳 Caisse'], ['menu', '🍔 Carte'], ['settings', '⚙️ Réglages']],
    kitchen: [['kitchen', '🔥 Cuisine']],
    cash: [['cash', '💳 Caisse'], ['kitchen', '🔥 Cuisine']]
  };
  function start() {
    S.seed();
    $('#login').hidden = true; $('#app').hidden = false;
    $('#glogo').innerHTML = window.PEPPER_LOGO({ sub: false });
    $('#brSel').innerHTML = D.branches.map(b => '<option value="' + b.id + '">Pepper ' + b.name + '</option>').join('');
    $('#brSel').value = br;
    $('#gnav').innerHTML = TABS[role].map(([k, l]) => '<button data-v="' + k + '">' + l + '</button>').join('');
    go(TABS[role][0][0]);
  }
  $('#brSel').onchange = e => { br = e.target.value; try { localStorage.setItem('ppr-gbr', br); } catch (x) { /* bloqué */ } render(); };
  $('#gnav').addEventListener('click', e => { const b = e.target.closest('[data-v]'); if (b) go(b.dataset.v); });
  function go(v) { view = v; document.querySelectorAll('#gnav button').forEach(b => b.classList.toggle('on', b.dataset.v === v)); render(); window.scrollTo(0, 0); }
  function render() { ({ dash, kitchen, cash, menu, settings })[view](); }

  /* ---------- cuisine ---------- */
  const seenK = new Set(); let firstK = true;
  function itemsHTML(o) {
    return '<ul>' + o.items.map(i => { const p = S.product(i.pid);
      return '<li><b>' + i.qty + '×</b> ' + esc(p ? p.name : i.pid) + (i.size != null ? ' <span class="tag">' + SZ[i.size] + '</span>' : '') + (i.sauce ? ' · sauce ' + esc(i.sauce) : '') + '</li>'; }).join('') + '</ul>';
  }
  function kitchen() {
    const prepMin = S.settings().prepMin;
    const list = todays().filter(o => o.branch === br && !o.demo);
    const col = (st) => list.filter(o => o.status === st).sort((a, b) => a.t.created - b.t.created);
    const card = (o, acts) => {
      const age = mins(Date.now() - o.t.created), late = (o.status === 'new' || o.status === 'prep') && age >= prepMin;
      const fresh = !seenK.has(o.id) && !firstK; seenK.add(o.id);
      return '<div class="ord' + (late ? ' late' : '') + (fresh ? ' fresh' : '') + '"><div class="t"><span class="n num">' + o.num + '</span><span class="meta">' +
        (o.source === 'web' ? '<span class="tag web">En ligne</span> ' : '<span class="tag">Comptoir</span> ') + '<br>' + esc(o.name || '') + ' · ' + (o.mode === 'emporter' ? '🛍️ ' + (o.pickupAt || 'à emporter') : '🍽️ sur place') +
        '<br><span class="num">' + hm(o.t.created) + ' · ' + age + ' min</span></span></div>' + itemsHTML(o) + '<div class="acts">' + acts + '</div></div>';
    };
    const c1 = col('new'), c2 = col('prep'), c3 = col('ready');
    $('#view').innerHTML = '<div class="h"><div><h1 class="disp">Cuisine</h1><p>Pepper ' + esc(S.branch(br).name) + ' · une commande en retard passe en rouge après ' + prepMin + ' min.</p></div>' +
      '<a class="btn btn-ghost sm" href="ecran.html" target="_blank">Ouvrir l’écran comptoir ↗</a></div>' +
      '<div class="kds">' +
      '<div class="kcol"><h3>Nouvelles <b>' + c1.length + '</b></h3><div class="list">' + (c1.map(o => card(o, '<button class="btn btn-red" data-st="prep" data-id="' + o.id + '">Lancer 🔥</button>')).join('') || '<div class="empty">Les nouvelles commandes arrivent ici en direct.<br>Passe une commande sur le site pour essayer.</div>') + '</div></div>' +
      '<div class="kcol"><h3>Sur le grill <b>' + c2.length + '</b></h3><div class="list">' + (c2.map(o => card(o, '<button class="btn btn-gold" data-st="ready" data-id="' + o.id + '">Prêt ✓</button>')).join('') || '<div class="empty">Rien en préparation.</div>') + '</div></div>' +
      '<div class="kcol"><h3>Prêtes · à remettre <b>' + c3.length + '</b></h3><div class="list">' + (c3.map(o => card(o, '<button class="btn btn-ghost" data-st="done" data-id="' + o.id + '">Remise' + (o.paid ? '' : ' + payée') + '</button>')).join('') || '<div class="empty">Le client voit « Prêt » sur son téléphone et sur l’écran.</div>') + '</div></div>' +
      '</div>';
    firstK = false;
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-st]'); if (!b) return;
    S.setStatus(b.dataset.id, b.dataset.st);
    toast({ prep: '🔥 Lancée en cuisine', ready: '✓ Client prévenu : commande prête', done: '✓ Commande remise' }[b.dataset.st]);
  });

  /* ---------- caisse ---------- */
  let ticket = [], pcat = 'beef';
  function cash() {
    const ps = S.products().filter(p => p.cat === pcat);
    const tot = ticket.reduce((a, l) => a + l.price * l.qty, 0);
    const toCollect = todays().filter(o => o.branch === br && !o.demo && o.status === 'ready');
    $('#view').innerHTML = '<div class="h"><div><h1 class="disp">Caisse</h1><p>Prise de commande au comptoir · Pepper ' + esc(S.branch(br).name) + '. Le ticket part directement en cuisine.</p></div></div>' +
      '<div class="pos"><div><div class="pcats">' + D.categories.map(c => '<button data-pc="' + c.id + '" class="' + (c.id === pcat ? 'on' : '') + '">' + c.icon + ' ' + esc(c.fr) + '</button>').join('') + '</div>' +
      '<div class="pgrid">' + ps.map(p => '<button class="pbtn" data-pp="' + p.id + '"' + (p.available ? '' : ' disabled') + '><img src="' + img(p.img) + '" alt="" loading="lazy"><span>' + esc(p.name) + '</span><small class="num">' + (p.available ? S.money(p.sizes ? p.sizes[0] : p.price) : 'Épuisé') + '</small></button>').join('') + '</div>' +
      (toCollect.length ? '<h3 style="margin:22px 0 10px">Prêtes à remettre</h3><div class="kds" style="grid-template-columns:repeat(auto-fill,minmax(240px,1fr))">' + toCollect.map(o => '<div class="ord"><div class="t"><span class="n num">' + o.num + '</span><span class="meta">' + esc(o.name || 'Comptoir') + '<br><b class="num">' + S.money(o.total) + '</b> ' + (o.paid ? '<span class="tag ok">Payée</span>' : '<span class="tag pay">À encaisser</span>') + '</span></div><div class="acts"><button class="btn btn-gold" data-st="done" data-id="' + o.id + '">Encaissée + remise</button></div></div>').join('') + '</div>' : '') +
      '</div><aside class="tk"><b style="font-size:16px">Ticket en cours</b>' +
      (ticket.length ? ticket.map((l, i) => { const p = S.product(l.pid); return '<div class="row"><div class="nm"><b>' + esc(p.name) + '</b>' + (p.sizes ? '<div class="sizes">' + p.sizes.map((v, k) => '<button data-ts="' + i + '" data-k="' + k + '" class="' + (k === l.size ? 'on' : '') + '">' + SZ[k] + '</button>').join('') + '</div>' : '') + '</div>' +
        '<div class="mini"><button data-tq="' + i + '" data-d="-1">−</button><b class="num">' + l.qty + '</b><button data-tq="' + i + '" data-d="1">+</button></div><b class="num" style="min-width:70px;text-align:end">' + S.money(l.price * l.qty) + '</b></div>'; }).join('') : '<div class="empty">Touche un produit pour l’ajouter.</div>') +
      '<div class="tot"><span>Total</span><span class="num">' + S.money(tot) + '</span></div>' +
      '<input id="tkName" placeholder="Prénom du client (affiché à l’écran)" value="' + esc(tname) + '">' +
      '<div class="seg two"><button data-tm="surplace" class="' + (tmode === 'surplace' ? 'on' : '') + '" id="tmS"><b>🍽️ Sur place</b></button><button data-tm="emporter" class="' + (tmode === 'emporter' ? 'on' : '') + '" id="tmE"><b>🛍️ À emporter</b></button></div>' +
      '<button class="btn btn-red" id="tkSend"' + (ticket.length ? '' : ' disabled') + '>Encaisser & envoyer en cuisine</button></aside></div>';
  }
  let tmode = 'surplace', tname = '';
  document.addEventListener('input', e => { if (e.target.id === 'tkName') tname = e.target.value; });
  document.addEventListener('click', e => {
    if (view !== 'cash') return;
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.pc) { pcat = b.dataset.pc; cash(); return; }
    if (b.dataset.pp) { const p = S.product(b.dataset.pp); const ex = ticket.find(l => l.pid === p.id && l.size === (p.sizes ? 0 : null)); if (ex) ex.qty++; else ticket.push({ pid: p.id, size: p.sizes ? 0 : null, qty: 1, price: p.sizes ? p.sizes[0] : p.price }); cash(); return; }
    if (b.dataset.ts) { const l = ticket[+b.dataset.ts]; const p = S.product(l.pid); l.size = +b.dataset.k; l.price = p.sizes[l.size]; cash(); return; }
    if (b.dataset.tq) { const l = ticket[+b.dataset.tq]; l.qty += +b.dataset.d; if (l.qty <= 0) ticket.splice(+b.dataset.tq, 1); cash(); return; }
    if (b.dataset.tm) { tmode = b.dataset.tm; $('#tmS').classList.toggle('on', tmode === 'surplace'); $('#tmE').classList.toggle('on', tmode === 'emporter'); return; }
    if (b.id === 'tkSend' && ticket.length) {
      const o = S.addOrder({ branch: br, mode: tmode, items: ticket.map(l => Object.assign({}, l)), total: ticket.reduce((a, l) => a + l.price * l.qty, 0), name: $('#tkName').value.trim(), phone: '', source: 'caisse', paid: true });
      ticket = []; tname = ''; toast('✓ Ticket n° ' + o.num + ' envoyé en cuisine'); cash();
    }
  });

  /* ---------- tableau de bord ---------- */
  function dash() {
    const all = todays().filter(o => o.status !== 'cancel');
    const mine = all.filter(o => o.branch === br);
    const ca = mine.reduce((a, o) => a + o.total, 0);
    const done = mine.filter(o => o.t.ready);
    const avgPrep = done.length ? Math.round(done.reduce((a, o) => a + (o.t.ready - o.t.created), 0) / done.length / 60000) : 0;
    const web = mine.filter(o => o.source === 'web').length;
    const hours = []; for (let h = 10; h <= 23; h++) hours.push(h);
    const byH = hours.map(h => mine.filter(o => new Date(o.t.created).getHours() === h).length);
    const max = Math.max(1, ...byH);
    const qty = {}; mine.forEach(o => o.items.forEach(i => { const p = S.product(i.pid); if (p && p.cat !== 'drink' && p.cat !== 'side') qty[i.pid] = (qty[i.pid] || 0) + i.qty; }));
    const top = Object.entries(qty).sort((a, b) => b[1] - a[1]).slice(0, 5); const tmax = top.length ? top[0][1] : 1;
    const perBr = D.branches.map(b => ({ b, ca: all.filter(o => o.branch === b.id).reduce((a, o) => a + o.total, 0) })); const bmax = Math.max(1, ...perBr.map(x => x.ca));
    $('#view').innerHTML = '<div class="h"><div><h1 class="disp">Aujourd’hui</h1><p>Pepper ' + esc(S.branch(br).name) + ' · ' + new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) + ' · mis à jour en direct</p></div></div>' +
      '<div class="kpis">' +
      '<div class="kpi"><small>Chiffre d’affaires</small><b class="num">' + S.money(ca) + '</b><em>commandes encaissées et en cours</em></div>' +
      '<div class="kpi"><small>Commandes</small><b class="num">' + mine.length + '</b><em>panier moyen ' + S.money(mine.length ? Math.round(ca / mine.length) : 0) + '</em></div>' +
      '<div class="kpi"><small>Temps de préparation moyen</small><b class="num">' + avgPrep + ' min</b><em>objectif ' + S.settings().prepMin + ' min</em></div>' +
      '<div class="kpi"><small>Commandes en ligne</small><b class="num">' + (mine.length ? Math.round(web / mine.length * 100) : 0) + ' %</b><em>' + web + ' sans passer par la file</em></div></div>' +
      '<div class="panels"><div class="panel"><h3>Commandes par heure</h3><div class="bars" role="img" aria-label="Commandes par heure">' + hours.map((h, i) => '<div class="b" title="' + h + 'h : ' + byH[i] + ' commandes"><em class="num">' + byH[i] + '</em><i style="height:' + (byH[i] / max * 100) + '%"></i><span class="num">' + h + 'h</span></div>').join('') + '</div><div style="height:18px"></div></div>' +
      '<div class="panel"><h3>Top burgers & sandwichs</h3><div class="top5">' + (top.map(([id, n]) => { const p = S.product(id); return '<div class="r"><img src="' + img(p.img) + '" alt=""><div><b>' + esc(p.name) + '</b><div class="bar" style="width:' + (n / tmax * 100) + '%"></div></div><b class="num">' + n + '</b></div>'; }).join('') || '<div class="empty">Pas encore de ventes.</div>') + '</div></div></div>' +
      '<div class="panel" style="margin-top:12px"><h3>Les 4 restaurants aujourd’hui</h3><div class="split">' + perBr.map(x => '<div class="r"><b>' + esc(x.b.name) + '</b><div class="track2"><i style="width:' + (x.ca / bmax * 100) + '%"></i></div><span class="num" style="text-align:end">' + S.money(x.ca) + '</span></div>').join('') + '</div>' +
      '<p class="hint" style="margin-top:12px">Démo : les chiffres du jour sont simulés pour montrer le tableau de bord ; tes commandes de test s’ajoutent en direct.</p></div>';
  }

  /* ---------- carte ---------- */
  function menu() {
    $('#view').innerHTML = '<div class="h"><div><h1 class="disp">Carte</h1><p>Un produit en rupture ? Désactive-le : il passe en « Bientôt de retour » sur le site, l’écran et la caisse, tout de suite.</p></div></div>' +
      '<div class="panel tw"><table class="mtable"><thead><tr><th></th><th>Produit</th><th>Prix (Simple)</th><th>Disponible</th></tr></thead><tbody>' +
      D.categories.map(c => '<tr><td colspan="4" style="color:var(--gold);font-weight:800;padding-top:18px">' + c.icon + ' ' + esc(c.fr) + '</td></tr>' +
        S.products().filter(p => p.cat === c.id).map(p => '<tr><td><img src="' + img(p.img) + '" alt=""></td><td><b>' + esc(p.name) + '</b>' + (p.sizes ? '<br><small style="color:var(--muted)" class="num">XL ' + S.money(p.sizes[1]) + ' · XXL ' + S.money(p.sizes[2]) + '</small>' : '') + '</td>' +
          '<td><input type="number" min="0" step="50" class="num" data-price="' + p.id + '" value="' + (p.price == null ? '' : p.price) + '" placeholder="prix" aria-label="Prix ' + esc(p.name) + '"></td>' +
          '<td><button class="switch' + (p.available ? ' on' : '') + '" data-av="' + p.id + '" role="switch" aria-checked="' + p.available + '" aria-label="Disponible : ' + esc(p.name) + '"></button></td></tr>').join('')).join('') +
      '</tbody></table></div>';
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-av]'); if (!b) return;
    const p = S.product(b.dataset.av);
    if (!p.available && p.price == null) { toast('Indique d’abord un prix pour ' + p.name); return; }
    S.setProduct(p.id, { available: !p.available }); toast((p.available ? '⛔ ' : '✓ ') + p.name + (p.available ? ' en rupture' : ' de retour'));
  });
  document.addEventListener('change', e => {
    const i = e.target.closest('[data-price]'); if (!i) return;
    const v = i.value === '' ? null : Math.max(0, Math.round(+i.value));
    S.setProduct(i.dataset.price, { price: v }); toast('✓ Prix mis à jour partout');
  });

  /* ---------- réglages ---------- */
  function settings() {
    const s = S.settings(), b = S.branch(br), day = S.hoursFor(br, 0), fri = S.hoursFor(br, 5);
    $('#view').innerHTML = '<div class="h"><div><h1 class="disp">Réglages</h1><p>Chaque changement s’applique immédiatement au site, à l’écran et à la caisse.</p></div></div>' +
      '<div class="set"><div class="panel"><h3>Horaires · Pepper ' + esc(b.name) + '</h3>' +
      '<div class="f"><label>Dimanche → jeudi</label><div style="display:flex;gap:8px"><input type="time" id="hO" value="' + day[0] + '"><input type="time" id="hC" value="' + day[1] + '"></div></div>' +
      '<div class="f"><label>Vendredi & samedi</label><div style="display:flex;gap:8px"><input type="time" id="fO" value="' + fri[0] + '"><input type="time" id="fC" value="' + fri[1] + '"></div></div>' +
      '<button class="btn btn-gold" id="saveH">Enregistrer les horaires</button></div>' +
      '<div class="panel"><h3>Commande en ligne</h3>' +
      '<div class="f"><label for="prep">Temps de préparation annoncé au client (min)</label><input type="number" id="prep" min="3" max="60" value="' + s.prepMin + '"></div>' +
      '<div class="f"><label for="goal">Fidélité : nombre de burgers avant le burger offert</label><input type="number" id="goal" min="3" max="20" value="' + s.loyaltyGoal + '"></div>' +
      '<button class="btn btn-gold" id="saveO">Enregistrer</button></div>' +
      '<div class="panel"><h3>Codes d’accès</h3>' +
      '<div class="f"><label>Gérant</label><input id="pM" inputmode="numeric" maxlength="4" value="' + s.pins.manager + '"></div>' +
      '<div class="f"><label>Cuisine</label><input id="pK" inputmode="numeric" maxlength="4" value="' + s.pins.kitchen + '"></div>' +
      '<div class="f"><label>Caisse</label><input id="pC" inputmode="numeric" maxlength="4" value="' + s.pins.cash + '"></div>' +
      '<button class="btn btn-gold" id="saveP">Changer les codes</button></div>' +
      '<div class="panel"><h3>Démo</h3><p class="hint" style="font-size:14px">Remet la démo à zéro (commandes, tampons, prix modifiés).</p><button class="btn btn-ghost" id="reset">Réinitialiser la démo</button></div></div>';
    $('#saveH').onclick = () => { const h = Object.assign({}, s.hours); h[br] = { def: [$('#hO').value, $('#hC').value], fri: [$('#fO').value, $('#fC').value], sat: [$('#fO').value, $('#fC').value] }; S.saveSettings({ hours: h }); toast('✓ Horaires enregistrés'); };
    $('#saveO').onclick = () => { S.saveSettings({ prepMin: Math.max(3, +$('#prep').value || 12), loyaltyGoal: Math.max(3, +$('#goal').value || 8) }); toast('✓ Enregistré'); };
    $('#saveP').onclick = () => { const v = [$('#pM').value, $('#pK').value, $('#pC').value]; if (!v.every(x => /^\d{4}$/.test(x)) || new Set(v).size < 3) { toast('3 codes différents de 4 chiffres'); return; } S.saveSettings({ pins: { manager: v[0], kitchen: v[1], cash: v[2] } }); toast('✓ Codes changés'); };
    $('#reset').onclick = () => { try { Object.keys(localStorage).filter(k => k.indexOf('ppr-') === 0 && k !== 'ppr-me').forEach(k => localStorage.removeItem(k)); } catch (e) { /* bloqué */ } S.seed(); toast('✓ Démo réinitialisée'); render(); };
  }

  /* ---------- direct ---------- */
  let beep = null;
  S.on((k, local) => {
    if (!role || $('#app').hidden) return;
    if (k === 'orders' && !local && view === 'kitchen') {
      try { beep = beep || new (window.AudioContext || window.webkitAudioContext)(); const o = beep.createOscillator(), g = beep.createGain(); o.frequency.value = 1046; o.connect(g); g.connect(beep.destination); g.gain.setValueAtTime(.2, beep.currentTime); g.gain.exponentialRampToValueAtTime(.0001, beep.currentTime + .4); o.start(); o.stop(beep.currentTime + .42); } catch (e) { /* pas de son */ }
    }
    if (view === 'settings' || view === 'menu' && k !== 'menu') return;
    if (view === 'cash' && k !== 'orders' && k !== 'menu') return;
    render();
  });
  setInterval(() => { if (view === 'kitchen' || view === 'dash') render(); }, 30000);

  if (role) start();
})();
