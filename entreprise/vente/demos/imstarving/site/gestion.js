// Espace gérant I'm Starving : une seule application pour la cuisine, la caisse, la comptabilité et la gestion.
// Elle s'ouvre par-dessus le site client (même page, donc tout reste synchronisé) ou seule (gestion.html).
(function () {
  var IMS = window.IMS, fmt = IMS.fmt, CODE = '0328';
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function pct(a, b) { return b ? Math.round((a - b) / b * 100) : 0; }
  function hh(t) { var d = new Date(t); return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); }
  function lireS(k, d) { try { var v = sessionStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } }
  function ecrireS(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }

  // Journée de service : de 6 h du matin à 6 h le lendemain (Aïn Allah ferme à 2 h)
  function jour(t) { var d = new Date(t - 6 * 3600e3); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  var J = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];

  // Historique simulé des jours précédents (la démo n'a que la journée en cours)
  function rng(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function hist(r, decal) {
    var d = new Date(Date.now() - 6 * 3600e3); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - decal);
    var R = rng(Math.floor(d.getTime() / 864e5) * 31 + (r === 'ain' ? 7 : 3)), dow = d.getDay();
    var f = dow === 4 ? 1.25 : dow === 5 ? 1.35 : dow === 6 ? 1.12 : 1, n = Math.round((r === 'ain' ? 13 : 18) * f * (0.86 + R() * 0.28)), p = 1760 + Math.round(R() * 280);
    return { n: n, ca: Math.round(n * p / 50) * 50, d: d, mix: { place: Math.round(n * .38), emporter: Math.round(n * .34), livraison: n - Math.round(n * .38) - Math.round(n * .34) } };
  }

  // ----- État -----
  var st = { page: 'accueil', resto: 'tous', kds: 'nouv', per: 'jour', cat: 'Crogers', q: '', son: false, ouvert: false, autonome: false, dernier: 0, qrN: 12, qrR: 'bab' };
  try { st.resto = localStorage.getItem('ims-g-resto') || 'tous'; } catch (e) {}
  var ctx = null, root, corps, minuteur;

  function restos() { return IMS.RESTOS.filter(function (r) { return st.resto === 'tous' || r.id === st.resto; }); }
  function toutes() { return IMS.commandes(); }
  function filtrer(L) { return L.filter(function (c) { return st.resto === 'tous' || (c.resto || 'bab') === st.resto; }); }
  function duJour(L) { var j = jour(Date.now()); return L.filter(function (c) { return jour(c.t) === j; }); }
  function nomR(c) { return IMS.resto(c.resto).nom; }
  function modeTxt(c) { return c.mode === 'place' ? 'Table ' + c.table : c.mode === 'emporter' ? 'À emporter' : 'Livraison'; }
  function age(c) { return Math.max(0, Math.floor((Date.now() - c.t) / 60000)); }
  var PAY = { especes: 'Espèces', cib: 'Carte CIB', baridimob: 'BaridiMob', edahabia: 'Edahabia' };

  // ----- Icônes -----
  var I = {
    accueil: '<svg viewBox="0 0 24 24"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg>',
    cuisine: '<svg viewBox="0 0 24 24"><path d="M6 13a4 4 0 1 1 2-7.5A4.5 4.5 0 0 1 16 5.5 4 4 0 1 1 18 13"/><path d="M6 13v7h12v-7"/><path d="M6 17h12"/></svg>',
    caisse: '<svg viewBox="0 0 24 24"><path d="M6 2h12v20l-3-2-3 2-3-2-3 2z"/><path d="M9 7h6M9 11h6M9 15h4"/></svg>',
    compta: '<svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
    menu: '<svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h10"/></svg>',
    reglages: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>'
  };
  var PAGES = [['accueil', 'Tableau de bord'], ['cuisine', 'Cuisine'], ['caisse', 'Caisse'], ['compta', 'Comptabilité'], ['menu', 'Menu'], ['reglages', 'Réglages']];
  var COURT = { accueil: 'Accueil', cuisine: 'Cuisine', caisse: 'Caisse', compta: 'Compta', menu: 'Menu' };

  // ----- Construction -----
  function construire() {
    root = document.createElement('div'); root.className = 'g'; root.hidden = true; root.setAttribute('role', 'dialog'); root.setAttribute('aria-label', 'Espace gérant');
    root.innerHTML =
      '<aside class="g-side"><div class="g-marque"><img src="img/logo.jpg" alt=""><div><b>I\'M STARVING</b><small>Espace gérant</small></div></div>' +
      '<nav class="g-nav">' + PAGES.map(function (p) { return '<button data-p="' + p[0] + '">' + I[p[0]] + '<span>' + p[1] + '</span></button>'; }).join('') + '</nav>' +
      '<div class="bas"><button data-act="verrou">🔒 Verrouiller</button><button class="retour" data-act="fermer">← Retour au site client</button></div></aside>' +
      '<div class="g-main"><header class="g-haut"><div><h1 id="g-titre">Tableau de bord</h1><div class="date" id="g-date"></div></div>' +
      '<div class="droite"><select class="g-sel" id="g-resto" aria-label="Restaurant"><option value="tous">Les 2 restaurants</option><option value="bab">Bab Ezzouar</option><option value="ain">Aïn Allah</option></select>' +
      '<button class="g-pil masque" id="g-son" aria-pressed="false">🔔 Sonnerie</button><span class="g-horloge" id="g-heure"></span>' +
      '<button class="g-x" data-p="reglages" aria-label="Réglages">⚙</button><button class="g-x" data-act="fermer" aria-label="Retour au site client">✕</button></div></header>' +
      '<div class="g-corps" id="g-corps"></div></div>' +
      '<nav class="g-tabbar">' + PAGES.slice(0, 5).map(function (p) { return '<button data-p="' + p[0] + '">' + I[p[0]] + '<span>' + COURT[p[0]] + '</span></button>'; }).join('') + '</nav>' +
      '<div class="g-tip" id="g-tip" hidden></div>';
    document.body.appendChild(root);
    corps = $('#g-corps', root);
    $('#g-resto', root).value = st.resto;
    $('#g-resto', root).onchange = function () { st.resto = this.value; try { localStorage.setItem('ims-g-resto', st.resto); } catch (e) {} rendre(); };
    $('#g-son', root).onclick = function () { try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); ctx.resume(); } catch (e) {} st.son = !st.son; this.setAttribute('aria-pressed', st.son); this.textContent = st.son ? '🔔 Sonnerie active' : '🔔 Sonnerie'; if (st.son) sonner(); };
    root.addEventListener('click', clic);
    root.addEventListener('change', change);
    root.addEventListener('input', saisie);
    root.addEventListener('pointermove', function (e) { var t = e.target.closest && e.target.closest('[data-tip]'), tip = $('#g-tip', root); if (t) { tip.hidden = false; tip.textContent = t.getAttribute('data-tip'); tip.style.left = Math.min(innerWidth - 180, e.clientX + 12) + 'px'; tip.style.top = (e.clientY - 34) + 'px'; } else tip.hidden = true; });
    IMS.surChangement(function () { if (!st.ouvert) return; verifier(); rendre(); });
    st.dernier = maxNo();
  }
  function maxNo() { return toutes().reduce(function (a, c) { return Math.max(a, c.no); }, 0); }

  // ----- Verrou -----
  function verrou() {
    if (lireS('ims-acces', '') === '1') return false;
    var v = document.createElement('div'); v.className = 'g-verrou'; var code = '';
    v.innerHTML = '<div class="boite"><img src="img/logo.jpg" alt=""><h1>Espace gérant</h1><p>I\'m Starving · réservé à l\'équipe</p><div class="pts">' + '<i></i>'.repeat(4) + '</div><div class="err" aria-live="polite"></div>' +
      '<div class="pave">' + ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map(function (k) { return k ? '<button data-k="' + k + '" aria-label="' + (k === '⌫' ? 'Effacer' : k) + '">' + k + '</button>' : '<span></span>'; }).join('') + '</div>' +
      '<p>Code de démonstration : <b style="color:#fff">' + CODE + '</b></p>' + (st.autonome ? '' : '<button class="quit">Retour au site client</button>') + '</div>';
    root.appendChild(v);
    function pts() { $$('.pts i', v).forEach(function (e, i) { e.className = i < code.length ? 'p' : ''; }); }
    function k(x) {
      if (x === '⌫') code = code.slice(0, -1); else if (code.length < 4) code += x; pts();
      if (code.length === 4) { if (code === CODE) { ecrireS('ims-acces', '1'); v.remove(); document.removeEventListener('keydown', kb); verifier(); rendre(); } else { $('.err', v).textContent = 'Code incorrect'; code = ''; setTimeout(function () { pts(); $('.err', v).textContent = ''; }, 900); } }
    }
    function kb(e) { if (/^[0-9]$/.test(e.key)) k(e.key); if (e.key === 'Backspace') k('⌫'); }
    v.addEventListener('click', function (e) { var b = e.target.closest('[data-k]'); if (b) k(b.dataset.k); if (e.target.closest('.quit')) fermer(); });
    document.addEventListener('keydown', kb);
    return true;
  }

  // ----- Ouvrir / fermer -----
  function ouvrir(o) {
    o = o || {}; if (!root) construire();
    if (o.autonome) { st.autonome = true; $$('[data-act="fermer"]', root).forEach(function (b) { b.hidden = true; }); }
    if (o.page) st.page = o.page;
    root.hidden = false; st.ouvert = true; document.documentElement.style.overflow = 'hidden';
    rendre(); verrou() || verifier();
    clearInterval(minuteur); minuteur = setInterval(function () { horloge(); if (st.page === 'cuisine' || st.page === 'accueil') rendre(true); }, 20000);
  }
  function fermer() { if (!root || st.autonome) return; root.hidden = true; st.ouvert = false; document.documentElement.style.overflow = ''; clearInterval(minuteur); $$('.g-voile').forEach(function (e) { e.remove(); }); }

  // ----- Nouvelles commandes : sonnerie, alerte, bon imprimé -----
  function sonner() { if (!st.son || !ctx) return; var n = ctx.currentTime; [0, .18, .36].forEach(function (dt, i) { var o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = [988, 1320, 1568][i]; g.gain.setValueAtTime(.0001, n + dt); g.gain.exponentialRampToValueAtTime(.25, n + dt + .02); g.gain.exponentialRampToValueAtTime(.0001, n + dt + .3); o.connect(g).connect(ctx.destination); o.start(n + dt); o.stop(n + dt + .35); }); }
  function toast(t) { var e = document.createElement('div'); e.className = 'g-toast'; e.innerHTML = '<i></i><span>' + t + '</span>'; root.appendChild(e); setTimeout(function () { e.remove(); }, 3600); }
  function verifier() {
    if (lireS('ims-acces', '') !== '1') return;
    var L = toutes(), nv = L.filter(function (c) { return c.no > st.dernier; });
    st.dernier = Math.max(st.dernier, maxNo());
    nv = filtrer(nv); if (!nv.length) return;
    var c = nv[nv.length - 1]; st.neuf = {}; nv.forEach(function (x) { st.neuf[x.no] = 1; });
    sonner(); toast('Nouvelle commande ' + IMS.numero(c.no) + ' · ' + nomR(c) + ' · ' + fmt(c.total));
    if (IMS.reception().bons) voirBon(c, true);
  }

  // ----- Rendu -----
  function horloge() { var e = $('#g-heure', root); if (e) e.textContent = hh(Date.now()); }
  function rendre(doux) {
    if (!root || root.hidden) return;
    var nouv = filtrer(toutes()).filter(function (c) { return c.st === 'nouv'; }).length;
    $$('[data-p]', root).forEach(function (b) { if (b.classList.contains('g-x')) return; b.setAttribute('aria-current', b.dataset.p === st.page ? 'page' : 'false'); var p = $('.pas', b); if (p) p.remove(); if (b.dataset.p === 'cuisine' && nouv) b.insertAdjacentHTML('beforeend', '<span class="pas">' + nouv + '</span>'); });
    $('#g-titre', root).textContent = PAGES.filter(function (p) { return p[0] === st.page; })[0][1];
    var d = new Date(); $('#g-date', root).textContent = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) + ' · ' + (st.resto === 'tous' ? 'Bab Ezzouar et Aïn Allah' : IMS.resto(st.resto).nom);
    horloge();
    var y = corps.scrollTop;
    corps.innerHTML = '<div class="g-page">' + ({ accueil: pAccueil, cuisine: pCuisine, caisse: pCaisse, compta: pCompta, menu: pMenu, reglages: pReglages })[st.page]() + '</div>';
    if (doux) corps.scrollTop = y;
    if (st.page === 'reglages') qr();
    st.neuf = null;
  }

  // ----- Graphique en barres (une série, ou deux empilées : Bab Ezzouar / Aïn Allah) -----
  var COUL = { bab: '#0B1640', ain: '#D7262D' };
  function graphe(D, o) {
    o = o || {}; var etroit = innerWidth < 700, W = etroit ? 360 : 640, H = Math.round((o.h || 220) * (etroit ? .8 : 1)), ml = 44, mb = 24, mt = 8, n = D.length || 1;
    var max = Math.max.apply(null, D.map(function (d) { return d.parts ? d.parts.reduce(function (a, p) { return a + p.v; }, 0) : d.v; }).concat([1]));
    var pas = Math.pow(10, Math.floor(Math.log10(max / 4))); [1, 2, 2.5, 5, 10].some(function (m) { if (max / (pas * m) <= 4) { pas *= m; return true; } }); var top = pas * Math.ceil(max / pas);
    var y = function (v) { return mt + (H - mt - mb) * (1 - v / top); }, lw = (W - ml - 4) / n, bw = Math.max(3, Math.min(30, lw - (n > 20 ? 2 : etroit ? 5 : 8)));
    var s = '<svg class="g-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(o.titre || '') + '">';
    for (var g = 0; g <= top + 1e-9; g += pas) s += '<line x1="' + ml + '" x2="' + W + '" y1="' + y(g) + '" y2="' + y(g) + '" stroke="#E2E5EE"/><text x="' + (ml - 6) + '" y="' + (y(g) + 4) + '" text-anchor="end">' + (o.court ? court(g) : g) + '</text>';
    D.forEach(function (d, i) {
      var x = ml + lw * i + (lw - bw) / 2, base = H - mb, parts = d.parts || [{ v: d.v, c: o.c || '#0B1640', n: '' }], acc = 0;
      parts.forEach(function (p, k) {
        if (!p.v) return; var y0 = y(acc), y1 = y(acc + p.v); acc += p.v; var h = y0 - y1 - (k ? 2 : 0); if (h <= 0) return;
        var haut = k === parts.length - 1 || !parts.slice(k + 1).some(function (q) { return q.v; }), r = haut ? Math.min(4, bw / 2, h) : 0;
        s += '<path class="barre" data-tip="' + esc(d.l + (p.n ? ' · ' + p.n : '') + ' : ' + (o.f ? o.f(p.v) : p.v)) + '" fill="' + p.c + '" d="M' + x + ',' + (y0 - (k ? 2 : 0)) + 'V' + (y1 + r) + 'q0,-' + r + ' ' + r + ',-' + r + 'h' + (bw - 2 * r) + 'q' + r + ',0 ' + r + ',' + r + 'V' + (y0 - (k ? 2 : 0)) + 'Z"/>';
      });
      var lab = o.lab ? o.lab(d, i) : d.l; if (lab) s += '<text x="' + (x + bw / 2) + '" y="' + (H - 7) + '" text-anchor="middle">' + lab + '</text>';
    });
    return s + '</svg>';
  }
  function court(v) { return v >= 1e6 ? (v / 1e6).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' M' : v >= 1e3 ? Math.round(v / 1e3) + ' k' : v; }
  function legende() { return st.resto === 'tous' ? '<div class="g-leg"><span><i style="background:' + COUL.bab + '"></i>Bab Ezzouar</span><span><i style="background:' + COUL.ain + '"></i>Aïn Allah</span></div>' : ''; }

  // ----- Page : tableau de bord -----
  function pAccueil() {
    var T = filtrer(duJour(toutes())), ca = T.reduce(function (a, c) { return a + c.total; }, 0), n = T.length;
    var hier = restos().reduce(function (a, r) { var h = hist(r.id, 1); a.ca += h.ca; a.n += h.n; return a; }, { ca: 0, n: 0 });
    var fin = T.filter(function (c) { return c.fin; }), prep = fin.length ? Math.round(fin.reduce(function (a, c) { return a + (c.fin - c.t); }, 0) / fin.length / 60000) : 0;
    var heures = new Date().getHours(), part = Math.max(.15, Math.min(1, ((heures < 6 ? heures + 24 : heures) - 11) / 15));
    function cmp(a, b) { var p = pct(a, b * part); return '<em class="' + (p >= 0 ? 'haut' : 'bas') + '">' + (p >= 0 ? '▲ +' : '▼ ') + p + ' % vs hier à la même heure</em>'; }
    var S = IMS.service(), A = toutes();
    var srv = restos().map(function (r) {
      var o = S[r.id], L = A.filter(function (c) { return (c.resto || 'bab') === r.id; }), cours = L.filter(function (c) { return c.st !== 'fin'; }).length, ret = L.filter(function (c) { return (c.st === 'nouv' || c.st === 'prep') && age(c) > 15; }).length, ouv = IMS.ouvert(r);
      return '<div class="g-carte g-srv' + (o.pause ? ' pause' : '') + '"><div class="t"><h3><span class="g-point ' + (!ouv ? 'n' : o.pause ? 'a' : '') + '"></span>' + r.nom + '</h3><span class="g-badge ' + (ouv ? 'v' : 'n') + '">' + (ouv ? 'Ouvert' : 'Fermé') + ' · ' + r.h + '</span></div>' +
        '<div class="l"><button class="g-sw" role="switch" aria-checked="' + !o.pause + '" data-pause="' + r.id + '"><i></i>' + (o.pause ? 'Commandes en ligne en pause' : 'Commandes en ligne ouvertes') + '</button></div>' +
        '<div class="l"><span>Attente annoncée</span><div class="g-seg">' + [15, 20, 30, 45].map(function (m) { return '<button data-att="' + r.id + '" data-m="' + m + '" aria-pressed="' + (o.attente === m) + '">' + m + ' min</button>'; }).join('') + '</div></div>' +
        '<div class="l"><span>En cours : <b style="color:var(--encre)">' + cours + '</b></span><span>En retard : <b style="color:' + (ret ? 'var(--rouge)' : 'var(--encre)') + '">' + ret + '</b></span></div></div>';
    }).join('');
    var h0 = 11, h1 = Math.max(h0 + 1, (heures < 6 ? heures + 24 : heures)), D = [];
    for (var h = h0; h <= h1; h++) { var hx = h % 24; D.push({ l: hx + 'h', parts: restos().map(function (r) { return { n: r.nom, c: COUL[r.id], v: T.filter(function (c) { return (c.resto || 'bab') === r.id && new Date(c.t).getHours() === hx; }).reduce(function (a, c) { return a + c.total; }, 0) }; }) }); }
    var att = filtrer(A).filter(function (c) { return c.st === 'nouv' || c.st === 'prete'; }).sort(function (a, b) { return a.t - b.t; });
    return '<div class="g-grille g-k4">' +
      kpi('Chiffre du jour', fmt(ca), cmp(ca, hier.ca)) + kpi('Commandes', n, cmp(n, hier.n)) + kpi('Panier moyen', fmt(n ? ca / n : 0), '<em>Hier : ' + fmt(hier.n ? hier.ca / hier.n : 0) + '</em>') + kpi('Préparation moyenne', prep + ' min', '<em>Objectif : 15 min</em>') + '</div>' +
      '<div class="g-grille g-k2 g-srvs">' + srv + '</div>' +
      '<div class="g-grille g-dash" style="grid-template-columns:minmax(0,1.6fr) minmax(0,1fr)">' +
      '<div class="g-carte"><h2>Chiffre d\'affaires par heure <small>aujourd\'hui</small></h2>' + legende() + graphe(D, { titre: 'Chiffre d\'affaires par heure', f: fmt, court: true, lab: function (d, i) { return D.length > 10 && i % 2 ? '' : d.l; } }) + '</div>' +
      '<div class="g-carte"><h2>À traiter maintenant <button class="g-lien" data-p="cuisine">Ouvrir la cuisine →</button></h2>' +
      (att.length ? '<div class="g-barres">' + att.map(function (c) { return '<div class="b" style="grid-template-columns:auto minmax(0,1fr) auto;align-items:center"><span class="g-badge ' + (c.st === 'nouv' ? 'r' : 'v') + '">' + (c.st === 'nouv' ? 'Nouvelle' : 'Prête') + '</span><span><b>' + IMS.numero(c.no) + '</b> · ' + esc(nomR(c)) + ' · ' + modeTxt(c) + '</span><span class="g-sous">' + age(c) + ' min</span></div>'; }).join('') + '</div>' : '<div class="g-vide">Rien en attente. La cuisine est à jour.</div>') +
      '</div></div>';
  }
  function kpi(t, v, s) { return '<div class="g-kpi"><span>' + t + '</span><b>' + v + '</b>' + (s || '') + '</div>'; }

  // ----- Page : cuisine -----
  function pCuisine() {
    var L = filtrer(toutes()), cols = [['nouv', 'Nouvelles'], ['prep', 'En préparation'], ['prete', 'Prêtes']], o = IMS.reception();
    var cnt = {}; cols.forEach(function (c) { cnt[c[0]] = L.filter(function (x) { return x.st === c[0]; }).length; });
    return '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><div class="g-seg g-kds-tabs">' + cols.map(function (c) { return '<button data-kds="' + c[0] + '" aria-pressed="' + (st.kds === c[0]) + '">' + c[1] + (cnt[c[0]] ? '<span class="n">' + cnt[c[0]] + '</span>' : '') + '</button>'; }).join('') + '</div>' +
      '<span class="g-sous">Acceptation ' + (o.acceptation === 'auto' ? 'automatique' : 'manuelle') + ' · bon imprimé ' + (o.bons ? 'automatiquement' : 'à la demande') + '</span></div>' +
      '<div class="g-kds">' + cols.map(function (c) {
        var X = L.filter(function (x) { return x.st === c[0]; }).sort(function (a, b) { return a.t - b.t; });
        return '<div class="g-col' + (st.kds === c[0] ? ' vis' : '') + '"><h2>' + c[1] + ' <b>' + X.length + '</b></h2><div class="g-pile">' +
          (X.length ? X.map(function (x) { return carte(x, o); }).join('') : '<div class="g-vide">' + (c[0] === 'nouv' ? 'Les nouvelles commandes arrivent ici, avec une sonnerie.' : c[0] === 'prep' ? 'Rien en préparation.' : 'Rien en attente de retrait.') + '</div>') + '</div></div>';
      }).join('') + '</div>';
  }
  function carte(c, o) {
    var a = age(c), cl = c.st === 'prete' ? '' : a > 15 ? ' r' : a > 10 ? ' w' : '';
    var btn = c.st === 'nouv' ? '<button class="g-btn go" data-st="prep" data-no="' + c.no + '">Lancer la préparation</button>' : c.st === 'prep' ? '<button class="g-btn ok" data-st="prete" data-no="' + c.no + '">Commande prête</button>' : '<button class="g-btn" data-st="fin" data-no="' + c.no + '">' + (c.mode === 'livraison' ? 'Partie en livraison' : 'Remise au client') + '</button>';
    var wa = c.st === 'prete' && o.clientWa ? '<a class="g-btn wa" target="_blank" rel="noopener" href="' + IMS.lienWa(c.tel, 'Bonjour ' + c.nom + ' 👋 Votre commande ' + IMS.numero(c.no) + ' chez I\'m Starving ' + nomR(c) + ' est prête' + (c.mode === 'livraison' ? ' et part en livraison 🛵' : c.mode === 'place' ? ', on vous l\'apporte 🍔' : ', vous pouvez venir la récupérer 🍔')) + '">Prévenir</a>' : '';
    return '<article class="g-cmd ' + c.st + (st.neuf && st.neuf[c.no] ? ' neuf' : '') + '"><div class="h"><span class="no">' + IMS.numero(c.no) + '</span><span class="age' + cl + '">' + (a < 1 ? 'à l\'instant' : a + ' min') + '</span></div>' +
      '<div class="tags">' + (st.resto === 'tous' ? '<span class="g-badge d">' + esc(nomR(c)) + '</span>' : '') + '<span class="g-badge ' + (c.mode === 'place' ? 'b' : c.mode === 'emporter' ? 'a' : 'v') + '">' + modeTxt(c) + (c.mode === 'emporter' ? ' · ' + esc(c.heure) : '') + '</span>' + (c.auto ? '<span class="g-badge n">Acceptée auto</span>' : '') + '</div>' +
      '<ul>' + c.lignes.map(function (l) { return '<li><span class="q">' + l.q + '×</span><span>' + esc(l.nom) + (l.det.length ? '<small>' + esc(l.det.join(' · ')) + '</small>' : '') + '</span></li>'; }).join('') + '</ul>' +
      '<div class="cl"><span>' + esc(c.nom) + ' · ' + esc(c.tel) + '</span><b class="num">' + fmt(c.total) + '</b></div>' + (c.mode === 'livraison' ? '<div class="cl"><span>📍 ' + esc(c.adresse) + '</span></div>' : '') +
      '<div class="act">' + btn + wa + '<button class="g-btn cl" data-bon="' + c.no + '">Bon</button></div></article>';
  }

  // ----- Bon de commande -----
  function ticket(c, k, o) {
    var r = IMS.resto(c.resto), COP = ['COPIE CUISINE', 'COPIE CAISSE', 'COPIE LIVREUR'];
    return '<div class="g-ticket">' + (o && o.copies > 1 ? '<div class="c" style="background:#1B1816;color:#FFFDF8;letter-spacing:.2em;font-size:11px;margin-bottom:6px">' + COP[k] + '</div>' : '') +
      '<div class="c gr">I\'M STARVING FOOD</div><div class="c">' + r.nom + ' · ' + r.tel + '</div><div class="c">' + hh(c.t) + ' · BON ' + IMS.numero(c.no) + '</div><hr>' +
      '<div class="c gr">' + (c.mode === 'place' ? 'SUR PLACE · TABLE ' + c.table : c.mode === 'emporter' ? 'À EMPORTER' : 'LIVRAISON') + '</div>' + (c.mode === 'emporter' ? '<div class="c">' + esc(c.heure) + '</div>' : '') + '<hr>' +
      c.lignes.map(function (l) { return '<div class="l"><span>' + l.q + 'x ' + esc(l.nom) + '</span><span>' + (k === 0 ? '' : l.px * l.q) + '</span></div>' + (l.det.length ? '<div>&nbsp;&nbsp;' + esc(l.det.join(', ')) + '</div>' : ''); }).join('') +
      (k === 0 ? '' : '<hr><div class="l gr"><span>TOTAL</span><span>' + c.total + ' DA</span></div>') + '<hr><div>' + esc(c.nom) + ' · ' + esc(c.tel) + '</div>' + (c.mode === 'livraison' ? '<div>' + esc(c.adresse) + '</div>' : '') +
      '<div class="c" style="margin-top:6px">' + (c.paye ? '*** PAYÉ · ' + (PAY[c.pay] || '').toUpperCase() + ' ***' : c.mode === 'livraison' ? 'Paiement à la livraison' : 'Paiement au comptoir') + '</div></div>';
  }
  function modale(titre, html, fn) {
    var v = document.createElement('div'); v.className = 'g-voile';
    v.innerHTML = '<div class="g-modale" role="dialog" aria-label="' + esc(titre) + '"><div class="t"><h2>' + titre + '</h2><button class="g-x" style="display:inline-grid;place-items:center" data-fermer aria-label="Fermer">✕</button></div>' + html + '</div>';
    v.addEventListener('click', function (e) { if (e.target === v || e.target.closest('[data-fermer]')) v.remove(); });
    root.appendChild(v); if (fn) fn(v); return v;
  }
  function voirBon(c, auto) {
    var o = IMS.reception();
    var v = modale(auto ? 'Nouvelle commande · bon imprimé' : 'Bon ' + IMS.numero(c.no),
      '<div style="display:grid;gap:12px">' + ticket(c, auto && o.copies > 1 ? 0 : 1, auto ? o : null) + '</div>' +
      '<div class="act"><button class="g-btn cl" data-reimp="' + c.no + '">Réimprimer</button>' + (o.whatsapp ? '<a class="g-btn wa" target="_blank" rel="noopener" href="' + IMS.lienWa(IMS.resto(c.resto).tel, IMS.texteBon(c)) + '">WhatsApp</a>' : '') + (auto ? '<button class="g-btn" data-fermer data-p="cuisine">Voir en cuisine</button>' : '') + '</div>',
      function (v) { $('.g-ticket', v).classList.add('sort'); v.addEventListener('click', function (e) { if (e.target.closest('[data-reimp]')) { var t = $('.g-ticket', v); t.classList.remove('sort'); void t.offsetWidth; t.classList.add('sort'); } }); });
    if (auto) setTimeout(function () { if (v.isConnected && !v.matches(':hover')) v.remove(); }, 5000);
  }

  // ----- Page : caisse -----
  function pCaisse() {
    var T = filtrer(duJour(toutes())).sort(function (a, b) { return b.t - a.t; }), enc = T.filter(function (c) { return c.paye; });
    var tot = function (L) { return L.reduce(function (a, c) { return a + c.total; }, 0); }, par = {}; Object.keys(PAY).forEach(function (k) { par[k] = tot(enc.filter(function (c) { return c.pay === k; })); });
    var Z = IMS.lire('ims-z', []).filter(function (z) { return st.resto === 'tous' || z.resto === st.resto || z.resto === 'tous'; }).slice(-1)[0], o = IMS.reception();
    return '<div class="g-grille g-k4">' + kpi('Encaissé', fmt(tot(enc)), '<em>' + enc.length + ' bons</em>') + kpi('À encaisser', fmt(tot(T) - tot(enc)), '<em>' + (T.length - enc.length) + ' bons</em>') + kpi('Espèces', fmt(par.especes), '<em>Dans le tiroir</em>') + kpi('Carte et BaridiMob', fmt(par.cib + par.baridimob + par.edahabia), '<em>CIB · BaridiMob · Edahabia</em>') + '</div>' +
      '<div class="g-carte"><h2>Bons du jour <span style="display:flex;gap:8px;flex-wrap:wrap"><button class="g-pil" data-act="test">🖨 Bon de test</button><button class="g-pil" data-act="copier">Copier pour Excel</button><button class="g-pil primaire" data-act="z">Clôture de caisse (Z)</button></span></h2>' +
      '<p class="g-sous" style="margin-bottom:10px">Imprimante de caisse ' + o.format + ' mm · ' + o.copies + ' copie' + (o.copies > 1 ? 's' : '') + ' par bon' + (Z ? ' · dernière clôture : ' + Z.quand + ' (' + fmt(Z.ca) + ')' : '') + '</p>' +
      '<div class="g-defile"><table class="g-table"><thead><tr><th>N°</th><th>Heure</th>' + (st.resto === 'tous' ? '<th>Restaurant</th>' : '') + '<th>Type</th><th>Client</th><th class="m">Total</th><th>Paiement</th><th></th></tr></thead><tbody>' +
      (T.map(function (c) { return '<tr class="' + (st.neuf && st.neuf[c.no] ? 'nv' : '') + '"><td><b>' + IMS.numero(c.no) + '</b></td><td>' + hh(c.t) + '</td>' + (st.resto === 'tous' ? '<td>' + esc(nomR(c)) + '</td>' : '') + '<td>' + modeTxt(c) + '</td><td>' + esc(c.nom) + '</td><td class="m"><b>' + fmt(c.total) + '</b></td><td>' + (c.paye ? '<span class="g-badge v">' + PAY[c.pay] + '</span>' : '<span class="g-badge a">À encaisser</span>') + '</td><td style="display:flex;gap:6px"><button class="g-pil" data-bon="' + c.no + '">Bon</button>' + (c.paye ? '' : '<button class="g-pil primaire" data-enc="' + c.no + '">Encaisser</button>') + '</td></tr>'; }).join('') || '<tr><td colspan="8"><div class="g-vide">Aucun bon aujourd\'hui.</div></td></tr>') +
      '</tbody></table></div></div>';
  }
  function encaisser(no) {
    var c = toutes().filter(function (x) { return x.no === no; })[0]; if (!c) return;
    modale('Encaisser ' + IMS.numero(no), '<div class="g-kpi" style="text-align:center"><span>Montant</span><b>' + fmt(c.total) + '</b></div><div class="g-grille g-k2">' + Object.keys(PAY).map(function (k) { return '<button class="g-btn ' + (k === 'especes' ? '' : 'cl') + '" data-pay="' + k + '" style="padding:16px">' + PAY[k] + '</button>'; }).join('') + '</div>',
      function (v) { v.addEventListener('click', function (e) { var b = e.target.closest('[data-pay]'); if (!b) return; var L = toutes(); L.forEach(function (x) { if (x.no === no) { x.paye = true; x.pay = b.dataset.pay; } }); IMS.enregistrer(L); v.remove(); toast(IMS.numero(no) + ' encaissé · ' + PAY[b.dataset.pay]); rendre(true); }); });
  }
  function cloture() {
    var T = filtrer(duJour(toutes())), enc = T.filter(function (c) { return c.paye; }), tot = function (L) { return L.reduce(function (a, c) { return a + c.total; }, 0); };
    var d = new Date(), q = d.toLocaleDateString('fr-FR') + ' ' + hh(d), m = { place: 0, emporter: 0, livraison: 0 }; T.forEach(function (c) { m[c.mode] += c.total; });
    var z = '<div class="g-ticket"><div class="c gr">I\'M STARVING FOOD</div><div class="c">' + (st.resto === 'tous' ? 'Bab Ezzouar + Aïn Allah' : IMS.resto(st.resto).nom) + '</div><div class="c gr" style="margin-top:6px">TICKET Z · CLÔTURE</div><div class="c">' + q + '</div><hr>' +
      '<div class="l"><span>Commandes</span><span>' + T.length + '</span></div><div class="l"><span>Panier moyen</span><span>' + Math.round(T.length ? tot(T) / T.length : 0) + ' DA</span></div><hr>' +
      Object.keys(PAY).map(function (k) { return '<div class="l"><span>' + PAY[k] + '</span><span>' + tot(enc.filter(function (c) { return c.pay === k; })) + ' DA</span></div>'; }).join('') + '<div class="l"><span>Non encaissé</span><span>' + (tot(T) - tot(enc)) + ' DA</span></div><hr>' +
      '<div class="l"><span>Sur place</span><span>' + m.place + ' DA</span></div><div class="l"><span>À emporter</span><span>' + m.emporter + ' DA</span></div><div class="l"><span>Livraison</span><span>' + m.livraison + ' DA</span></div><hr>' +
      '<div class="l gr"><span>TOTAL ENCAISSÉ</span><span>' + tot(enc) + ' DA</span></div><div class="l"><span>Annulations</span><span>0</span></div></div>';
    modale('Clôture de caisse', z + '<p class="g-sous">' + (T.length - enc.length ? '⚠ ' + (T.length - enc.length) + ' bon(s) pas encore encaissé(s).' : 'Tout est encaissé.') + '</p><div class="act"><button class="g-btn cl" data-act="copier">Copier pour Excel</button><button class="g-btn" data-valz>Valider et imprimer le Z</button></div>',
      function (v) { $('.g-ticket', v).classList.add('sort'); v.addEventListener('click', function (e) { if (!e.target.closest('[data-valz]')) return; var Z = IMS.lire('ims-z', []); Z.push({ quand: q, resto: st.resto, ca: tot(enc), n: T.length }); IMS.ecrire('ims-z', Z); v.remove(); toast('Clôture enregistrée · ' + fmt(tot(enc))); rendre(true); }); });
  }
  function copier() {
    var T = filtrer(duJour(toutes())), t = 'N°\tHeure\tRestaurant\tType\tClient\tTéléphone\tArticles\tTotal DA\tPaiement\n' + T.map(function (c) { return [IMS.numero(c.no), hh(c.t), nomR(c), modeTxt(c), c.nom, c.tel, c.lignes.map(function (l) { return l.q + 'x ' + l.nom; }).join(' + '), c.total, c.paye ? PAY[c.pay] : 'À encaisser'].join('\t'); }).join('\n');
    try { navigator.clipboard.writeText(t).then(function () { toast('Copié : collez dans Excel ou votre logiciel de caisse'); }, function () { toast('Copie impossible sur cet appareil'); }); } catch (e) { toast('Copie impossible sur cet appareil'); }
  }

  // ----- Page : comptabilité -----
  var CHARGES0 = [['Loyer Bab Ezzouar', 90000], ['Loyer Aïn Allah', 70000], ['Salaires (8 personnes)', 320000], ['Électricité, gaz, eau', 40000], ['Emballages', 25000], ['Marketing', 15000]];
  function charges() { return IMS.lire('ims-charges', CHARGES0); }
  function pCompta() {
    var nb = st.per === 'jour' ? 1 : st.per === '7' ? 7 : 30, R = restos(), T = filtrer(duJour(toutes())), jours = [];
    for (var i = nb - 1; i >= 0; i--) {
      var parts = R.map(function (r) { if (i === 0) { var X = T.filter(function (c) { return (c.resto || 'bab') === r.id; }); return { n: r.nom, c: COUL[r.id], v: X.reduce(function (a, c) { return a + c.total; }, 0), k: X.length }; } var h = hist(r.id, i); return { n: r.nom, c: COUL[r.id], v: h.ca, k: h.n }; });
      var d = new Date(Date.now() - 6 * 3600e3); d.setDate(d.getDate() - i); jours.push({ l: i === 0 ? 'Auj.' : J[d.getDay()] + ' ' + d.getDate(), parts: parts, d: d });
    }
    var ca = 0, n = 0; jours.forEach(function (j) { j.parts.forEach(function (p) { ca += p.v; n += p.k; }); });
    var tauxM = .32, mat = Math.round(ca * tauxM), chM = charges().reduce(function (a, c) { return a + c[1]; }, 0) * (st.resto === 'tous' ? 1 : .5), ch = Math.round(chM * nb / 30), ben = ca - mat - ch;
    var mix = { place: 0, emporter: 0, livraison: 0 }; T.forEach(function (c) { mix[c.mode] += c.total; });
    var top = {}; T.forEach(function (c) { c.lignes.forEach(function (l) { top[l.nom] = top[l.nom] || { q: 0, v: 0 }; top[l.nom].q += l.q; top[l.nom].v += l.px * l.q; }); });
    var TOP = Object.keys(top).map(function (k) { return [k, top[k].q, top[k].v]; }).sort(function (a, b) { return b[2] - a[2]; }).slice(0, 6), tm = TOP.length ? TOP[0][2] : 1;
    var parR = R.map(function (r) { var v = jours.reduce(function (a, j) { return a + j.parts.filter(function (p) { return p.n === r.nom; })[0].v; }, 0); return [r.nom, v, COUL[r.id]]; }), mr = Math.max.apply(null, parR.map(function (x) { return x[1]; }).concat([1]));
    st.jours = jours;
    var graph = nb === 1 ? (function () { var D = [], hn = new Date().getHours(), h1 = Math.max(12, hn < 6 ? hn + 24 : hn); for (var h = 11; h <= h1; h++) { var hx = h % 24; D.push({ l: hx + 'h', parts: R.map(function (r) { return { n: r.nom, c: COUL[r.id], v: T.filter(function (c) { return (c.resto || 'bab') === r.id && new Date(c.t).getHours() === hx; }).reduce(function (a, c) { return a + c.total; }, 0) }; }) }); } return graphe(D, { f: fmt, court: true, titre: 'Chiffre d\'affaires par heure', lab: function (d, i) { return D.length > 10 && i % 2 ? '' : d.l; } }); })()
      : graphe(jours, { f: fmt, court: true, h: 240, titre: 'Chiffre d\'affaires par jour', lab: function (d, i) { return nb === 7 ? d.l : (i % 5 === 4 || i === nb - 1 ? d.l : ''); } });
    return '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><div class="g-seg">' + [['jour', 'Aujourd\'hui'], ['7', '7 jours'], ['30', '30 jours']].map(function (p) { return '<button data-per="' + p[0] + '" aria-pressed="' + (st.per === p[0]) + '">' + p[1] + '</button>'; }).join('') + '</div><button class="g-pil" data-act="exportc">Copier le rapport pour Excel</button></div>' +
      '<div class="g-grille g-k4">' + kpi('Chiffre d\'affaires', fmt(ca), '<em>' + (nb === 1 ? 'Aujourd\'hui' : 'Sur ' + nb + ' jours') + '</em>') + kpi('Commandes', n.toLocaleString('fr-FR'), '<em>' + Math.round(n / nb) + ' par jour</em>') + kpi('Panier moyen', fmt(n ? ca / n : 0), '') + kpi('Bénéfice estimé', fmt(ben), '<em class="' + (ben >= 0 ? 'haut' : 'bas') + '">Marge ' + (ca ? Math.round(ben / ca * 100) : 0) + ' %</em>') + '</div>' +
      '<div class="g-carte"><h2>' + (nb === 1 ? 'Chiffre d\'affaires par heure' : 'Chiffre d\'affaires par jour') + ' <small>' + (nb === 1 ? 'aujourd\'hui' : nb + ' derniers jours') + '</small></h2>' + legende() + graph + '</div>' +
      '<div class="g-grille" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr))">' +
      '<div class="g-carte"><h2>Résultat estimé <button class="g-lien" data-act="charges">Modifier les charges</button></h2><table class="g-table"><tbody>' +
      '<tr><td>Chiffre d\'affaires</td><td class="m"><b>' + fmt(ca) + '</b></td></tr><tr><td>Matières premières (' + Math.round(tauxM * 100) + ' %)</td><td class="m">− ' + fmt(mat) + '</td></tr><tr><td>Charges fixes (' + (nb === 1 ? '1 jour' : nb + ' jours') + ')</td><td class="m">− ' + fmt(ch) + '</td></tr>' +
      '<tr><td><b>Bénéfice estimé</b></td><td class="m"><b style="color:' + (ben >= 0 ? 'var(--vert)' : 'var(--rouge)') + '">' + fmt(ben) + '</b></td></tr></tbody></table><p class="g-sous" style="margin-top:10px">Estimation à titre indicatif, à confirmer avec votre comptable.</p></div>' +
      '<div class="g-carte"><h2>Par restaurant</h2><div class="g-barres">' + parR.map(function (x) { return '<div class="b"><span>' + x[0] + '</span><b>' + fmt(x[1]) + '</b><span class="j"><i style="width:' + (x[1] / mr * 100) + '%;background:' + x[2] + '"></i></span></div>'; }).join('') + '</div>' +
      '<h2 style="font-size:16px;margin:18px 0 10px">Par type <small style="font-weight:600;color:var(--encre3);font-size:13px">aujourd\'hui</small></h2><div class="g-barres">' + [['Sur place', mix.place], ['À emporter', mix.emporter], ['Livraison', mix.livraison]].map(function (x) { var m = Math.max(mix.place, mix.emporter, mix.livraison, 1); return '<div class="b"><span>' + x[0] + '</span><b>' + fmt(x[1]) + '</b><span class="j"><i style="width:' + (x[1] / m * 100) + '%"></i></span></div>'; }).join('') + '</div></div>' +
      '<div class="g-carte"><h2>Plats les plus vendus <small>aujourd\'hui</small></h2>' + (TOP.length ? '<div class="g-barres">' + TOP.map(function (x) { return '<div class="b"><span>' + esc(x[0]) + ' <span class="g-sous" style="display:inline">· ' + x[1] + ' vendus</span></span><b>' + fmt(x[2]) + '</b><span class="j"><i style="width:' + (x[2] / tm * 100) + '%;background:var(--rouge)"></i></span></div>'; }).join('') + '</div>' : '<div class="g-vide">Pas encore de ventes aujourd\'hui.</div>') + '</div>' +
      '</div>';
  }
  function editerCharges() {
    var C = charges();
    modale('Charges fixes mensuelles', '<div style="display:grid;gap:8px">' + C.map(function (c, i) { return '<label style="display:grid;grid-template-columns:minmax(0,1fr) 130px;gap:10px;align-items:center;font-weight:600;font-size:14px">' + esc(c[0]) + '<input class="g-rech" style="max-width:none;text-align:right" type="number" step="1000" min="0" data-ch="' + i + '" value="' + c[1] + '"></label>'; }).join('') + '</div><div class="act"><button class="g-btn" data-savech>Enregistrer</button></div>',
      function (v) { v.addEventListener('click', function (e) { if (!e.target.closest('[data-savech]')) return; $$('[data-ch]', v).forEach(function (inp) { C[+inp.dataset.ch][1] = Math.max(0, +inp.value || 0); }); IMS.ecrire('ims-charges', C); v.remove(); toast('Charges mises à jour'); rendre(true); }); });
  }
  function exportCompta() {
    var t = 'Jour\t' + restos().map(function (r) { return r.nom + ' CA DA\t' + r.nom + ' commandes'; }).join('\t') + '\n' + (st.jours || []).map(function (j) { return [j.d.toLocaleDateString('fr-FR')].concat(j.parts.map(function (p) { return p.v + '\t' + p.k; })).join('\t'); }).join('\n');
    try { navigator.clipboard.writeText(t).then(function () { toast('Rapport copié : collez-le dans Excel'); }, function () { toast('Copie impossible sur cet appareil'); }); } catch (e) { toast('Copie impossible sur cet appareil'); }
  }

  // ----- Page : menu -----
  function pMenu() {
    var M = IMS.menu(), q = st.q.trim().toLowerCase(), X = M.filter(function (p) { return q ? (p.nom + ' ' + p.desc).toLowerCase().indexOf(q) >= 0 : p.cat === st.cat; }), off = M.filter(function (p) { return !p.dispo; }).length;
    return '<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;justify-content:space-between"><input class="g-rech" id="g-q" type="search" placeholder="Rechercher un plat…" value="' + esc(st.q) + '" aria-label="Rechercher un plat"><span class="g-sous">' + M.length + ' plats · ' + (off ? '<b style="color:var(--rouge)">' + off + ' en rupture</b>' : 'tout est disponible') + ' · les changements apparaissent tout de suite sur le site</span></div>' +
      (q ? '' : '<div class="g-cats">' + IMS.CATS.map(function (c) { return '<button data-cat="' + c + '" aria-pressed="' + (st.cat === c) + '">' + c + '</button>'; }).join('') + '</div>') +
      '<div class="g-carte" style="padding-block:6px">' + (X.map(function (p) {
        var px = p.tailles ? p.tailles : [['Prix', p.prix]];
        return '<div class="g-prod' + (p.dispo ? '' : ' off') + '"><img src="' + p.img + '" alt=""><div><div class="n">' + esc(p.nom) + '</div><div class="d">' + (p.dispo ? 'En vente' : 'Rupture : affiché « épuisé » sur le site') + '</div></div>' +
          '<div class="g-prix">' + px.map(function (t, i) { return '<label>' + esc(t[0].split(' ·')[0]) + '<input type="number" min="0" step="50" value="' + t[1] + '" data-pid="' + p.id + '" data-i="' + i + '" aria-label="Prix ' + esc(p.nom + ' ' + t[0]) + '"></label>'; }).join('') + '</div>' +
          '<button class="g-sw" role="switch" aria-checked="' + p.dispo + '" data-dispo="' + p.id + '" aria-label="Disponible"><i></i></button></div>';
      }).join('') || '<div class="g-vide">Aucun plat trouvé.</div>') + '</div>';
  }

  // ----- Page : réglages -----
  function pReglages() {
    var o = IMS.reception();
    function ligne(ic, t, p, droite, x) { return '<div class="g-reg"><span class="ic">' + ic + '</span><div><b>' + t + '</b><p>' + p + '</p></div>' + (droite || '<span></span>') + (x ? '<div class="x">' + x + '</div>' : '') + '</div>'; }
    function sw(k) { return '<button class="g-sw" role="switch" aria-checked="' + !!o[k] + '" data-rk="' + k + '" aria-label="Activer"><i></i></button>'; }
    function seg(k, V) { return '<div class="g-seg">' + V.map(function (v) { return '<button data-rs="' + k + '" data-v="' + v[0] + '" aria-pressed="' + (String(o[k]) === String(v[0])) + '">' + v[1] + '</button>'; }).join('') + '</div>'; }
    return '<div class="g-carte"><h2>Réception des commandes <small>activez autant de canaux que vous voulez</small></h2>' +
      ligne('📺', 'Écran cuisine', 'Commandes en direct sur la tablette, avec sonnerie.', sw('ecran')) +
      ligne('🧾', 'Bons imprimés automatiquement', 'Chaque commande sort en bon sur l\'imprimante de la caisse (USB, réseau ou Bluetooth).', sw('bons'), seg('copies', [[1, '1 copie'], [2, '2 copies'], [3, '3 copies']]) + ' ' + seg('format', [['58', '58 mm'], ['80', '80 mm']])) +
      ligne('💬', 'WhatsApp du restaurant', 'Chaque commande arrive aussi en message WhatsApp : Bab Ezzouar 0659 56 46 11 · Aïn Allah 07 97 88 38 97.', sw('whatsapp')) +
      ligne('📲', 'Prévenir le client', 'Bouton « Prévenir » quand la commande est prête : le client reçoit un message WhatsApp.', sw('clientWa')) +
      ligne('✉️', 'SMS au gérant', 'Un SMS par commande, utile s\'il n\'y a pas d\'internet en cuisine.', sw('sms')) +
      ligne('📧', 'E-mail', 'Une copie de chaque commande et le récapitulatif de la journée à la fermeture.', sw('email')) +
      ligne('⚡', 'Acceptation des commandes', 'Automatique : la commande part directement en préparation et le bon s\'imprime.', '<span></span>', seg('acceptation', [['manuelle', 'Manuelle'], ['auto', 'Automatique']])) +
      ligne('🧮', 'Logiciel de caisse', 'Les ventes rejoignent votre caisse ou votre comptabilité.', '<span></span>', seg('caisse', [['aucune', 'Aucun'], ['csv', 'Export Excel'], ['api', 'Connexion directe']])) +
      '</div>' +
      '<div class="g-carte"><h2>Restaurants</h2>' + IMS.RESTOS.map(function (r) { var ouv = IMS.ouvert(r); return ligne('📍', r.nom, r.h + ' · ' + r.tel, '<span class="g-badge ' + (ouv ? 'v' : 'n') + '">' + (ouv ? 'Ouvert' : 'Fermé') + '</span>'); }).join('') + '</div>' +
      '<div class="g-carte"><h2>QR codes des tables <span style="display:flex;gap:8px;flex-wrap:wrap"><select class="g-sel" id="g-qrr" aria-label="Restaurant">' + IMS.RESTOS.map(function (r) { return '<option value="' + r.id + '"' + (st.qrR === r.id ? ' selected' : '') + '>' + r.nom + '</option>'; }).join('') + '</select><select class="g-sel" id="g-qrn" aria-label="Nombre de tables">' + [8, 12, 16, 20].map(function (k) { return '<option' + (st.qrN === k ? ' selected' : '') + '>' + k + '</option>'; }).join('') + '</select></span></h2><p class="g-sous" style="margin-bottom:12px">À imprimer et poser sur chaque table : le client scanne, commande, et le numéro de table arrive avec la commande.</p><div class="g-qr" id="g-qr"></div></div>' +
      '<div class="g-carte"><h2>Sécurité et démo</h2>' + ligne('🔒', 'Code d\'accès', 'Le code protège l\'espace gérant. Code actuel : ' + CODE + '.', '<button class="g-pil" data-act="verrou">Verrouiller</button>') + ligne('↺', 'Réinitialiser la démo', 'Remet les commandes, le menu et les réglages comme au départ.', '<button class="g-pil rouge" data-act="reinit">Réinitialiser</button>') + '</div>';
  }
  var qrLib = null;
  function qr() {
    var box = $('#g-qr', root); if (!box) return;
    function go() { var base = location.href.replace(/[#?].*$/, '').replace(/[^/]*$/, '') + 'index.html'; box.innerHTML = ''; for (var i = 1; i <= st.qrN; i++) { var d = document.createElement('div'); d.innerHTML = '<span></span><b>Table ' + i + '</b><small>' + IMS.resto(st.qrR).nom + ' · scannez pour commander</small>'; box.appendChild(d); try { new window.QRCode(d.firstChild, { text: base + '#' + st.qrR + '-table-' + i, width: 232, height: 232, colorDark: '#0B1640', colorLight: '#FFFFFF', correctLevel: window.QRCode.CorrectLevel.M }); } catch (e) { d.firstChild.textContent = 'QR indisponible'; } } }
    if (window.QRCode) return go();
    box.innerHTML = '<div class="g-vide" style="grid-column:1/-1">Chargement des QR codes…</div>';
    if (!qrLib) { qrLib = document.createElement('script'); qrLib.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'; document.head.appendChild(qrLib); }
    qrLib.addEventListener('load', function () { if (st.page === 'reglages') go(); });
    qrLib.addEventListener('error', function () { box.innerHTML = '<div class="g-vide" style="grid-column:1/-1">QR codes indisponibles hors connexion.</div>'; });
  }

  // ----- Interactions -----
  function majStatut(no, s) { var L = toutes(); L.forEach(function (c) { if (c.no === no) { c.st = s; if (s === 'fin') c.fin = Date.now(); } }); IMS.enregistrer(L); rendre(true); }
  function clic(e) {
    var b;
    if ((b = e.target.closest('[data-p]')) && !e.target.closest('.g-voile [data-p]:not([data-fermer])')) { st.page = b.dataset.p; corps.scrollTop = 0; rendre(); return; }
    if ((b = e.target.closest('[data-act]'))) {
      var a = b.dataset.act;
      if (a === 'fermer') return fermer();
      if (a === 'verrou') { ecrireS('ims-acces', ''); verrou(); return; }
      if (a === 'z') return cloture();
      if (a === 'copier') return copier();
      if (a === 'exportc') return exportCompta();
      if (a === 'charges') return editerCharges();
      if (a === 'test') return voirBon({ no: 0, resto: st.resto === 'ain' ? 'ain' : 'bab', t: Date.now(), mode: 'emporter', heure: 'Test', nom: 'Test imprimante', tel: '-', adresse: '', lignes: [{ q: 1, nom: 'Bon de test', det: [], px: 0 }], total: 0 }, false);
      if (a === 'reinit') { IMS.reinitialiser(); st.dernier = maxNo(); toast('Démo réinitialisée'); rendre(); return; }
    }
    if ((b = e.target.closest('[data-st]'))) return majStatut(+b.dataset.no, b.dataset.st);
    if ((b = e.target.closest('[data-bon]'))) { var c = toutes().filter(function (x) { return x.no === +b.dataset.bon; })[0]; if (c) voirBon(c, false); return; }
    if ((b = e.target.closest('[data-enc]'))) return encaisser(+b.dataset.enc);
    if ((b = e.target.closest('[data-kds]'))) { st.kds = b.dataset.kds; rendre(true); return; }
    if ((b = e.target.closest('[data-per]'))) { st.per = b.dataset.per; rendre(true); return; }
    if ((b = e.target.closest('[data-cat]'))) { st.cat = b.dataset.cat; rendre(true); return; }
    if ((b = e.target.closest('[data-pause]'))) { var S = IMS.service(); S[b.dataset.pause].pause = !S[b.dataset.pause].pause; IMS.majService(S); toast(IMS.resto(b.dataset.pause).nom + (S[b.dataset.pause].pause ? ' : commandes en ligne en pause' : ' : commandes en ligne rouvertes')); rendre(true); return; }
    if ((b = e.target.closest('[data-att]'))) { var S2 = IMS.service(); S2[b.dataset.att].attente = +b.dataset.m; IMS.majService(S2); rendre(true); return; }
    if ((b = e.target.closest('[data-dispo]'))) { var d = IMS.lire('ims-dispo', {}), id = b.dataset.dispo; if (d[id] === false) delete d[id]; else d[id] = false; IMS.majMenu(d, IMS.lire('ims-prix', {})); rendre(true); return; }
    if ((b = e.target.closest('[data-rk]'))) { var o = IMS.reception(); o[b.dataset.rk] = !o[b.dataset.rk]; IMS.majReception(o); rendre(true); return; }
    if ((b = e.target.closest('[data-rs]'))) { var o2 = IMS.reception(), v = b.dataset.v; o2[b.dataset.rs] = b.dataset.rs === 'copies' ? +v : v; IMS.majReception(o2); rendre(true); return; }
  }
  function change(e) {
    var t = e.target;
    if (t.dataset && t.dataset.pid) { var P = IMS.lire('ims-prix', {}); P[t.dataset.pid] = P[t.dataset.pid] || []; P[t.dataset.pid][+t.dataset.i] = Math.max(0, +t.value || 0); IMS.majMenu(IMS.lire('ims-dispo', {}), P); toast('Prix mis à jour sur le site'); return; }
    if (t.id === 'g-qrn') { st.qrN = +t.value; qr(); }
    if (t.id === 'g-qrr') { st.qrR = t.value; qr(); }
  }
  function saisie(e) { if (e.target.id === 'g-q') { st.q = e.target.value; var pos = e.target.selectionStart; rendre(true); var i = $('#g-q', root); if (i) { i.focus(); try { i.setSelectionRange(pos, pos); } catch (x) {} } } }

  window.IMSG = { ouvrir: ouvrir, fermer: fermer };
})();
