// Espace gérant Arzata Pizza : une seule application pour la cuisine, la caisse, la comptabilité et la gestion.
// Elle s'ouvre par-dessus le site client (même page, donc tout reste synchronisé) ou seule (gestion.html).
(function () {
  var IMS = window.IMS, fmt = IMS.fmt;
  // Trois accès : le gérant voit tout ; la cuisine et la caisse ne voient que leur poste
  var ROLES = { gerant: { nom: 'Gérant', pages: null }, cuisine: { nom: 'Cuisine', pages: ['cuisine', 'livraisons', 'menu', 'plus'] }, caisse: { nom: 'Caisse', pages: ['caisse', 'cuisine', 'livraisons', 'clients', 'plus'] }, livreur: { nom: 'Livreur', pages: ['livreur'] } };
  function role() { var r = lireS('arz-role', 'gerant'); return ROLES[r] ? r : 'gerant'; }
  function permis(p) { var x = ROLES[role()].pages; return !x || x.indexOf(p) >= 0; }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function pct(a, b) { return b ? Math.round((a - b) / b * 100) : 0; }
  function hh(t) { var d = new Date(t); return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); }
  function lireS(k, d) { try { var v = sessionStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } }
  function ecrireS(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }

  // Journée de service : de 6 h du matin à 6 h le lendemain (le service du soir peut finir tard)
  function jour(t) { var d = new Date(t - 6 * 3600e3); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  var J = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];

  // Historique simulé des jours précédents (la démo n'a que la journée en cours)
  function rng(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function hist(r, decal) {
    var d = new Date(Date.now() - 6 * 3600e3); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - decal);
    if (IMS.mode() === 'prod') { var key = jour(d.getTime() + 6 * 3600e3), L = IMS.commandes().filter(function (c) { return (c.resto || 'dar') === r && jour(c.t) === key; }), m = { place: 0, emporter: 0, livraison: 0 }; L.forEach(function (c) { m[c.mode]++; }); return { n: L.length, ca: L.reduce(function (a, c) { return a + c.total; }, 0), d: d, mix: m }; }
    var R = rng(Math.floor(d.getTime() / 864e5) * 31 + (r === 'ain' ? 7 : 3)), dow = d.getDay();
    var f = dow === 4 ? 1.25 : dow === 5 ? 1.35 : dow === 6 ? 1.12 : 1, n = Math.round(24 * f * (0.86 + R() * 0.28)), p = 2280 + Math.round(R() * 420);
    return { n: n, ca: Math.round(n * p / 50) * 50, d: d, mix: { place: Math.round(n * .38), emporter: Math.round(n * .34), livraison: n - Math.round(n * .38) - Math.round(n * .34) } };
  }

  // ----- État -----
  var st = { page: 'accueil', resto: 'tous', kds: 'nouv', per: 'jour', cat: 'Base tomate', q: '', son: false, ouvert: false, autonome: false, dernier: 0, qrN: 12, qrR: 'dar' };
  try { st.resto = localStorage.getItem('arz-g-resto') || 'tous'; } catch (e) {}
  var ctx = null, root, corps, minuteur;

  function restos() { return IMS.RESTOS.filter(function (r) { return st.resto === 'tous' || r.id === st.resto; }); }
  function toutes() { return IMS.commandes(); }
  function filtrer(L) { return L.filter(function (c) { return st.resto === 'tous' || (c.resto || 'dar') === st.resto; }); }
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
    livraisons: '<svg viewBox="0 0 24 24"><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.5 18h7M3 14h9l2-6h4l3 6v4h-1"/><path d="M5 8h5"/></svg>',
    clients: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6.5 6.5 0 0 1 3.5 5.5"/></svg>',
    marketing: '<svg viewBox="0 0 24 24"><path d="M3 11v2a1 1 0 0 0 1 1h3l5 4V6L7 10H4a1 1 0 0 0-1 1z"/><path d="M16 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>',
    livreur: '<svg viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>',
    reglages: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>'
  };
  var PAGES = [['accueil', 'Tableau de bord'], ['cuisine', 'Cuisine'], ['livraisons', 'Livraisons'], ['caisse', 'Caisse'], ['compta', 'Comptabilité'], ['clients', 'Clients et fidélité'], ['marketing', 'Marketing'], ['menu', 'Menu'], ['reglages', 'Réglages'], ['livreur', 'Mes courses'], ['plus', 'Plus']];
  var COURT = { accueil: 'Accueil', cuisine: 'Cuisine', caisse: 'Caisse', compta: 'Compta', plus: 'Plus' }, TAB = ['accueil', 'cuisine', 'caisse', 'compta', 'plus'];

  // ----- Construction -----
  function construire() {
    root = document.createElement('div'); root.className = 'g'; root.hidden = true; root.setAttribute('role', 'dialog'); root.setAttribute('aria-label', 'Espace gérant');
    root.innerHTML =
      '<aside class="g-side"><div class="g-marque"><img src="img/logo.jpg" alt=""><div><b>Arzata</b><small>Pizza · espace gérant</small></div></div>' +
      '<nav class="g-nav">' + PAGES.filter(function (p) { return p[0] !== 'plus'; }).map(function (p) { return '<button data-p="' + p[0] + '">' + I[p[0]] + '<span>' + p[1] + '</span></button>'; }).join('') + '</nav>' +
      '<div class="bas"><button data-act="verrou">🔒 Verrouiller</button><button class="retour" data-act="fermer">← Retour au site client</button></div></aside>' +
      '<div class="g-main"><div class="g-haut"><div><h1 id="g-titre">Tableau de bord</h1><div class="date" id="g-date"></div></div>' +
      '<div class="droite"><select class="g-sel" id="g-resto" aria-label="Restaurant"></select>' +
      '<button class="g-pil masque" id="g-son" aria-pressed="false">🔔 Sonnerie</button><span class="g-horloge" id="g-heure"></span>' +
      '<button class="g-x" data-p="reglages" aria-label="Réglages">⚙</button><button class="g-x" data-act="fermer" aria-label="Retour au site client">✕</button></div></div>' +
      '<div class="g-corps" id="g-corps" tabindex="0"></div></div>' +
      '<nav class="g-tabbar">' + TAB.map(function (k) { return '<button data-p="' + k + '">' + I[k] + '<span>' + COURT[k] + '</span></button>'; }).join('') + '</nav>' +
      '<div class="g-tip" id="g-tip" hidden></div>';
    document.body.appendChild(root);
    corps = $('#g-corps', root);
    $('#g-resto', root).onchange = function () { st.resto = this.value; try { localStorage.setItem('arz-g-resto', st.resto); } catch (e) {} rendre(); };
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
    if (lireS('arz-acces', '') === '1') return false;
    var v = document.createElement('div'); v.className = 'g-verrou'; var code = '';
    v.innerHTML = '<div class="boite"><img src="img/logo.jpg" alt=""><h1>Espace gérant</h1><p>Arzata Pizza · réservé à l\'équipe</p><div class="pts">' + '<i></i>'.repeat(4) + '</div><div class="err" aria-live="polite"></div>' +
      '<div class="pave">' + ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map(function (k) { return k ? '<button data-k="' + k + '" aria-label="' + (k === '⌫' ? 'Effacer' : k) + '">' + k + '</button>' : '<span></span>'; }).join('') + '</div>' +
      (IMS.mode() === 'demo' ? '<p>Démo · gérant <b style="color:#fff">' + IMS.config().pins.gerant + '</b> · cuisine <b style="color:#fff">' + IMS.config().pins.cuisine + '</b> · caisse <b style="color:#fff">' + IMS.config().pins.caisse + '</b> · livreur <b style="color:#fff">' + IMS.config().pins.livreur + '</b></p>' : '<p>Saisissez votre code personnel.</p>') + (st.autonome ? '' : '<button class="quit">Retour au site client</button>') + '</div>';
    root.appendChild(v);
    function pts() { $$('.pts i', v).forEach(function (e, i) { e.className = i < code.length ? 'p' : ''; }); }
    function k(x) {
      if (x === '⌫') code = code.slice(0, -1); else if (code.length < 4) code += x; pts();
      if (code.length === 4) { var P = IMS.config().pins, rl = Object.keys(P).filter(function (k) { return P[k] === code; })[0]; if (rl) { ecrireS('arz-acces', '1'); ecrireS('arz-role', rl); if (!permis(st.page)) st.page = ROLES[rl].pages ? ROLES[rl].pages[0] : 'accueil'; v.remove(); document.removeEventListener('keydown', kb); verifier(); rendre(); } else { $('.err', v).textContent = 'Code incorrect'; code = ''; setTimeout(function () { pts(); $('.err', v).textContent = ''; }, 900); } }
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
  function toast(t) { $$('.g-toast', root).forEach(function (x) { x.remove(); }); var e = document.createElement('div'); e.className = 'g-toast'; e.innerHTML = '<i></i><span>' + t + '</span>'; root.appendChild(e); setTimeout(function () { e.remove(); }, 3600); }
  function verifier() {
    if (lireS('arz-acces', '') !== '1') return;
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
    if (!permis(st.page)) st.page = ROLES[role()].pages ? ROLES[role()].pages[0] : 'accueil';
    if (st.resto !== 'tous' && !IMS.RESTOS.some(function (r) { return r.id === st.resto; })) st.resto = 'tous';
    $('#g-resto', root).innerHTML = '<option value="tous">' + (IMS.RESTOS.length > 1 ? 'Tous les restaurants' : IMS.RESTOS[0].nom) + '</option>' + (IMS.RESTOS.length > 1 ? IMS.RESTOS.map(function (r) { return '<option value="' + r.id + '"' + (st.resto === r.id ? ' selected' : '') + '>' + esc(r.nom) + '</option>'; }).join('') : '');
    $('#g-resto', root).value = st.resto;
    $$('.g-nav [data-p], .g-tabbar [data-p], .g-haut [data-p]', root).forEach(function (b) { b.hidden = !permis(b.dataset.p); });
    $$('[data-p]', root).forEach(function (b) { if (b.classList.contains('g-x')) return; b.setAttribute('aria-current', (b.dataset.p === st.page || (b.closest('.g-tabbar') && b.dataset.p === 'plus' && TAB.indexOf(st.page) < 0)) ? 'page' : 'false'); var p = $('.pas', b); if (p) p.remove(); if (b.dataset.p === 'cuisine' && nouv) b.insertAdjacentHTML('beforeend', '<span class="pas">' + nouv + '</span>'); if (b.dataset.p === 'livraisons' && aLivrer()) b.insertAdjacentHTML('beforeend', '<span class="pas">' + aLivrer() + '</span>'); });
    $('#g-titre', root).textContent = PAGES.filter(function (p) { return p[0] === st.page; })[0][1];
    var d = new Date(); $('#g-date', root).textContent = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) + ' · ' + (st.resto === 'tous' ? IMS.RESTOS.map(function (r) { return r.nom; }).join(' et ') : IMS.resto(st.resto).nom) + ' · session ' + ROLES[role()].nom + (IMS.mode() === 'demo' ? ' · démo' : '');
    horloge();
    var y = corps.scrollTop;
    corps.innerHTML = '<div class="g-page">' + ({ accueil: pAccueil, cuisine: pCuisine, livraisons: pLivraisons, caisse: pCaisse, compta: pCompta, clients: pClients, livreur: pLivreur, marketing: pMarketing, menu: pMenu, reglages: pReglages, plus: pPlus })[st.page]() + '</div>';
    if (doux) corps.scrollTop = y;
    if (st.page === 'reglages') qr();
    st.neuf = null;
  }

  // ----- Graphique en barres (une série, ou deux empilées : Bab Ezzouar / Aïn Allah) -----
  var PAL = ['#143A2C', '#B3122A', '#2F5BEA', '#12955A', '#B97A05'];
  function coul(id) { var i = IMS.RESTOS.findIndex(function (r) { return r.id === id; }); return PAL[Math.max(0, i) % PAL.length]; }
  function graphe(D, o) {
    o = o || {}; var etroit = innerWidth < 700, W = etroit ? 360 : 640, H = Math.round((o.h || 220) * (etroit ? .8 : 1)), ml = 44, mb = 24, mt = 8, n = D.length || 1;
    var max = Math.max.apply(null, D.map(function (d) { return d.parts ? d.parts.reduce(function (a, p) { return a + p.v; }, 0) : d.v; }).concat([1]));
    var pas = Math.pow(10, Math.floor(Math.log10(max / 4))); [1, 2, 2.5, 5, 10].some(function (m) { if (max / (pas * m) <= 4) { pas *= m; return true; } }); var top = pas * Math.ceil(max / pas);
    var y = function (v) { return mt + (H - mt - mb) * (1 - v / top); }, lw = (W - ml - 4) / n, bw = Math.max(3, Math.min(30, lw - (n > 20 ? 2 : etroit ? 5 : 8)));
    var s = '<svg class="g-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(o.titre || '') + '">';
    for (var g = 0; g <= top + 1e-9; g += pas) s += '<line x1="' + ml + '" x2="' + W + '" y1="' + y(g) + '" y2="' + y(g) + '" stroke="#E2E5EE"/><text x="' + (ml - 6) + '" y="' + (y(g) + 4) + '" text-anchor="end">' + (o.court ? court(g) : g) + '</text>';
    D.forEach(function (d, i) {
      var x = ml + lw * i + (lw - bw) / 2, base = H - mb, parts = d.parts || [{ v: d.v, c: o.c || '#143A2C', n: '' }], acc = 0;
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
  function legende() { return st.resto === 'tous' && IMS.RESTOS.length > 1 ? '<div class="g-leg">' + IMS.RESTOS.map(function (r) { return '<span><i style="background:' + coul(r.id) + '"></i>' + esc(r.nom) + '</span>'; }).join('') + '</div>' : ''; }

  // ----- Page : tableau de bord -----
  function pAccueil() {
    var T = filtrer(duJour(toutes())), ca = T.reduce(function (a, c) { return a + c.total; }, 0), n = T.length;
    var hier = restos().reduce(function (a, r) { var h = hist(r.id, 1); a.ca += h.ca; a.n += h.n; return a; }, { ca: 0, n: 0 });
    var fin = T.filter(function (c) { return c.fin; }), prep = fin.length ? Math.round(fin.reduce(function (a, c) { return a + (c.fin - c.t); }, 0) / fin.length / 60000) : 0;
    var heures = new Date().getHours(), part = Math.max(.15, Math.min(1, ((heures < 6 ? heures + 24 : heures) - 11) / 15));
    function cmp(a, b) { if (!b) return '<em>Pas encore d\'historique pour comparer</em>'; var p = pct(a, b * part); return '<em class="' + (p >= 0 ? 'haut' : 'bas') + '">' + (p >= 0 ? '▲ +' : '▼ ') + p + ' % vs hier à la même heure</em>'; }
    var S = IMS.service(), A = toutes();
    var srv = restos().map(function (r) {
      var o = S[r.id], L = A.filter(function (c) { return (c.resto || 'dar') === r.id; }), cours = L.filter(function (c) { return c.st !== 'fin'; }).length, ret = L.filter(function (c) { return (c.st === 'nouv' || c.st === 'prep') && age(c) > 15; }).length, ouv = IMS.ouvert(r);
      return '<div class="g-carte g-srv' + (o.pause ? ' pause' : '') + '"><div class="t"><h2><span class="g-point ' + (!ouv ? 'n' : o.pause ? 'a' : '') + '"></span>' + r.nom + '</h2><span class="g-badge ' + (ouv ? 'v' : 'n') + '">' + (ouv ? 'Ouvert' : 'Fermé') + ' · ' + r.h + '</span></div>' +
        '<div class="l"><button class="g-sw" role="switch" aria-checked="' + !o.pause + '" data-pause="' + r.id + '"><i></i>' + (o.pause ? 'Commandes en ligne en pause' : 'Commandes en ligne ouvertes') + '</button></div>' +
        '<div class="l"><span>Attente annoncée</span><div class="g-seg">' + [15, 20, 30, 45].map(function (m) { return '<button data-att="' + r.id + '" data-m="' + m + '" aria-pressed="' + (o.attente === m) + '">' + m + ' min</button>'; }).join('') + '</div></div>' +
        '<div class="l"><span>En cours : <b style="color:var(--encre)">' + cours + '</b></span><span>En retard : <b style="color:' + (ret ? 'var(--rouge)' : 'var(--encre)') + '">' + ret + '</b></span></div></div>';
    }).join('');
    var h0 = 11, h1 = Math.max(h0 + 1, (heures < 6 ? heures + 24 : heures)), D = [];
    for (var h = h0; h <= h1; h++) { var hx = h % 24; D.push({ l: hx + 'h', parts: restos().map(function (r) { return { n: r.nom, c: coul(r.id), v: T.filter(function (c) { return (c.resto || 'dar') === r.id && new Date(c.t).getHours() === hx; }).reduce(function (a, c) { return a + c.total; }, 0) }; }) }); }
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
    var L = filtrer(toutes()), cols = [['nouv', 'Nouvelles'], ['prep', 'Au four'], ['prete', 'Prêtes']], o = IMS.reception();
    var cnt = {}; cols.forEach(function (c) { cnt[c[0]] = L.filter(function (x) { return x.st === c[0]; }).length; });
    return '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><div class="g-seg g-kds-tabs">' + cols.map(function (c) { return '<button data-kds="' + c[0] + '" aria-pressed="' + (st.kds === c[0]) + '">' + c[1] + (cnt[c[0]] ? '<span class="n">' + cnt[c[0]] + '</span>' : '') + '</button>'; }).join('') + '</div>' +
      '<span class="g-four-n">🔥 ' + pizzasAuFour(L) + ' pizza' + (pizzasAuFour(L) > 1 ? 's' : '') + ' au four</span><span class="g-sous">Acceptation ' + (o.acceptation === 'auto' ? 'automatique' : 'manuelle') + ' · bon imprimé ' + (o.bons ? 'automatiquement' : 'à la demande') + '</span></div>' +
      '<div class="g-kds">' + cols.map(function (c) {
        var X = L.filter(function (x) { return x.st === c[0]; }).sort(function (a, b) { return a.t - b.t; });
        return '<div class="g-col' + (st.kds === c[0] ? ' vis' : '') + '"><h2>' + c[1] + ' <b>' + X.length + '</b></h2><div class="g-pile">' +
          (X.length ? X.map(function (x) { return carte(x, o); }).join('') : '<div class="g-vide">' + (c[0] === 'nouv' ? 'Les nouvelles commandes arrivent ici, avec une sonnerie.' : c[0] === 'prep' ? 'Le four attend la prochaine pizza.' : 'Rien en attente de retrait.') + '</div>') + '</div></div>';
      }).join('') + '</div>';
  }
  function carte(c, o) {
    var a = age(c), cl = c.st === 'prete' ? '' : a > 15 ? ' r' : a > 10 ? ' w' : '';
    var btn = c.st === 'nouv' ? '<button class="g-btn go" data-st="prep" data-no="' + c.no + '">🔥 Enfourner</button>' : c.st === 'prep' ? '<button class="g-btn ok" data-st="prete" data-no="' + c.no + '">Commande prête</button>' : '<button class="g-btn" data-st="fin" data-no="' + c.no + '">' + (c.mode === 'livraison' ? 'Partie en livraison' : 'Remise au client') + '</button>';
    var wa = c.st === 'prete' && o.clientWa ? '<a class="g-btn wa" target="_blank" rel="noopener" href="' + IMS.lienWa(c.tel, 'Bonjour ' + c.nom + ' 👋 Votre commande ' + IMS.numero(c.no) + ' chez Arzata Pizza est prête' + (c.mode === 'livraison' ? ' et part en livraison 🛵' : c.mode === 'place' ? ', on vous l\'apporte 🍕' : ', vous pouvez venir la récupérer 🍕')) + '">Prévenir</a>' : '';
    return '<article class="g-cmd ' + c.st + (st.neuf && st.neuf[c.no] ? ' neuf' : '') + '"><div class="h"><span class="no">' + IMS.numero(c.no) + '</span><span class="age' + cl + '">' + (a < 1 ? 'à l\'instant' : a + ' min') + '</span></div>' +
      '<div class="tags">' + (st.resto === 'tous' ? '<span class="g-badge d">' + esc(nomR(c)) + '</span>' : '') + '<span class="g-badge ' + (c.mode === 'place' ? 'b' : c.mode === 'emporter' ? 'a' : 'v') + '">' + modeTxt(c) + (c.mode !== 'place' && c.heure && c.heure !== 'Dès que possible' ? ' · ' + esc(c.heure) : '') + '</span>' + (c.auto ? '<span class="g-badge n">Acceptée auto</span>' : '') + '</div>' +
      four(c) + '<ul>' + c.lignes.map(function (l) { return '<li><span class="q">' + l.q + '×</span><span>' + esc(l.nom) + (l.det.length ? '<small>' + esc(l.det.join(' · ')) + '</small>' : '') + '</span></li>'; }).join('') + '</ul>' +
      '<div class="cl"><span>' + esc(c.nom) + ' · ' + esc(c.tel) + '</span><b class="num">' + fmt(c.total) + '</b></div>' + (c.mode === 'livraison' ? '<div class="cl"><span>📍 ' + (c.zone ? '<b>' + esc(c.zone) + '</b> · ' : '') + esc(c.adresse) + '</span></div>' : '') +
      '<div class="act">' + btn + wa + '<button class="g-btn cl" data-bon="' + c.no + '">Bon</button></div></article>';
  }

  // Cuisson au feu de bois : barre qui avance toute seule jusqu'à la sortie du four (≈ 3 min)
  var CUISSON = 180;
  function four(c) {
    if (c.st !== 'prep') return '';
    var e = Math.max(0, (Date.now() - (c.four || c.t)) / 1000), fini = e >= CUISSON, sortie = hh((c.four || c.t) + CUISSON * 1000);
    return '<div class="g-four' + (fini ? ' fini' : '') + '"><span>' + (fini ? '✅ À sortir du four' : '🔥 Au four · sortie ≈ ' + sortie) + '</span><i><b style="animation-duration:' + CUISSON + 's;animation-delay:-' + Math.min(e, CUISSON).toFixed(1) + 's"></b></i></div>';
  }
  function pizzasAuFour(L) { return L.filter(function (c) { return c.st === 'prep'; }).reduce(function (a, c) { return a + c.lignes.reduce(function (b, l) { return b + (/^[tc]\d/.test(l.id) ? l.q : 0); }, 0); }, 0); }

  // ----- Bon de commande -----
  function ticket(c, k, o) {
    var r = IMS.resto(c.resto), COP = ['COPIE CUISINE', 'COPIE CAISSE', 'COPIE LIVREUR'];
    return '<div class="g-ticket">' + (o && o.copies > 1 ? '<div class="c" style="background:#1B1816;color:#FFFDF8;letter-spacing:.2em;font-size:11px;margin-bottom:6px">' + COP[k] + '</div>' : '') +
      '<div class="c gr">ARZATA PIZZA</div><div class="c">' + r.nom + ' · ' + r.tel + '</div><div class="c">' + hh(c.t) + ' · BON ' + IMS.numero(c.no) + '</div><hr>' +
      '<div class="c gr">' + (c.mode === 'place' ? 'SUR PLACE · TABLE ' + c.table : c.mode === 'emporter' ? 'À EMPORTER' : 'LIVRAISON') + '</div>' + (c.mode !== 'place' && c.heure ? '<div class="c">' + esc(c.heure) + '</div>' : '') + '<hr>' +
      c.lignes.map(function (l) { return '<div class="l"><span>' + l.q + 'x ' + esc(l.nom) + '</span><span>' + (k === 0 ? '' : l.px * l.q) + '</span></div>' + (l.det.length ? '<div>&nbsp;&nbsp;' + esc(l.det.join(', ')) + '</div>' : ''); }).join('') +
      (k === 0 ? '' : '<hr><div class="l gr"><span>TOTAL</span><span>' + c.total + ' DA</span></div>') + '<hr><div>' + esc(c.nom) + ' · ' + esc(c.tel) + '</div>' + (c.mode === 'livraison' ? '<div>' + (c.zone ? esc(c.zone) + ' · ' : '') + esc(c.adresse) + '</div>' + (c.adr && c.adr.repere ? '<div>Repère : ' + esc(c.adr.repere) + '</div>' : '') + (c.adr && c.adr.note ? '<div>' + esc(c.adr.note) + '</div>' : '') + (c.frais ? '<div class="l"><span>Frais de livraison</span><span>' + c.frais + '</span></div>' : '') : '') +
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
    var Z = IMS.lire('arz-z', []).filter(function (z) { return st.resto === 'tous' || z.resto === st.resto || z.resto === 'tous'; }).slice(-1)[0], o = IMS.reception();
    return '<div class="g-grille g-k4">' + kpi('Encaissé', fmt(tot(enc)), '<em>' + enc.length + ' bons</em>') + kpi('À encaisser', fmt(tot(T) - tot(enc)), '<em>' + (T.length - enc.length) + ' bons</em>') + kpi('Espèces', fmt(par.especes), '<em>Dans le tiroir</em>') + kpi('Carte et BaridiMob', fmt(par.cib + par.baridimob + par.edahabia), '<em>CIB · BaridiMob · Edahabia</em>') + '</div>' +
      '<div class="g-carte"><h2>Bons du jour <span style="display:flex;gap:8px;flex-wrap:wrap"><button class="g-pil" data-act="test">🖨 Bon de test</button><button class="g-pil" data-act="copier">Copier pour Excel</button><button class="g-pil primaire" data-act="z">Clôture de caisse (Z)</button></span></h2>' +
      '<p class="g-sous" style="margin-bottom:10px">Imprimante de caisse ' + o.format + ' mm · ' + o.copies + ' copie' + (o.copies > 1 ? 's' : '') + ' par bon' + (Z ? ' · dernière clôture : ' + Z.quand + ' (' + fmt(Z.ca) + ')' : '') + '</p>' +
      '<div class="g-defile"><table class="g-table"><thead><tr><th>N°</th><th>Heure</th>' + (st.resto === 'tous' ? '<th>Restaurant</th>' : '') + '<th>Type</th><th>Client</th><th class="m">Total</th><th>Paiement</th><th><span class="vh">Actions</span></th></tr></thead><tbody>' +
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
    var z = '<div class="g-ticket"><div class="c gr">ARZATA PIZZA</div><div class="c">' + (st.resto === 'tous' ? IMS.RESTOS.map(function (r) { return r.nom; }).join(' + ') : IMS.resto(st.resto).nom) + '</div><div class="c gr" style="margin-top:6px">TICKET Z · CLÔTURE</div><div class="c">' + q + '</div><hr>' +
      '<div class="l"><span>Commandes</span><span>' + T.length + '</span></div><div class="l"><span>Panier moyen</span><span>' + Math.round(T.length ? tot(T) / T.length : 0) + ' DA</span></div><hr>' +
      Object.keys(PAY).map(function (k) { return '<div class="l"><span>' + PAY[k] + '</span><span>' + tot(enc.filter(function (c) { return c.pay === k; })) + ' DA</span></div>'; }).join('') + '<div class="l"><span>Non encaissé</span><span>' + (tot(T) - tot(enc)) + ' DA</span></div><hr>' +
      '<div class="l"><span>Sur place</span><span>' + m.place + ' DA</span></div><div class="l"><span>À emporter</span><span>' + m.emporter + ' DA</span></div><div class="l"><span>Livraison</span><span>' + m.livraison + ' DA</span></div><hr>' +
      '<div class="l gr"><span>TOTAL ENCAISSÉ</span><span>' + tot(enc) + ' DA</span></div><div class="l"><span>Annulations</span><span>0</span></div></div>';
    modale('Clôture de caisse', z + '<p class="g-sous">' + (T.length - enc.length ? '⚠ ' + (T.length - enc.length) + ' bon(s) pas encore encaissé(s).' : 'Tout est encaissé.') + '</p><div class="act"><button class="g-btn cl" data-act="copier">Copier pour Excel</button><button class="g-btn" data-valz>Valider et imprimer le Z</button></div>',
      function (v) { $('.g-ticket', v).classList.add('sort'); v.addEventListener('click', function (e) { if (!e.target.closest('[data-valz]')) return; var Z = IMS.lire('arz-z', []); Z.push({ quand: q, resto: st.resto, ca: tot(enc), n: T.length }); IMS.ecrire('arz-z', Z); v.remove(); toast('Clôture enregistrée · ' + fmt(tot(enc))); rendre(true); }); });
  }
  function copier() {
    var T = filtrer(duJour(toutes())), t = 'N°\tHeure\tRestaurant\tType\tClient\tTéléphone\tArticles\tTotal DA\tPaiement\n' + T.map(function (c) { return [IMS.numero(c.no), hh(c.t), nomR(c), modeTxt(c), c.nom, c.tel, c.lignes.map(function (l) { return l.q + 'x ' + l.nom; }).join(' + '), c.total, c.paye ? PAY[c.pay] : 'À encaisser'].join('\t'); }).join('\n');
    try { navigator.clipboard.writeText(t).then(function () { toast('Copié : collez dans Excel ou votre logiciel de caisse'); }, function () { toast('Copie impossible sur cet appareil'); }); } catch (e) { toast('Copie impossible sur cet appareil'); }
  }

  // ----- Page : comptabilité -----
  var CHARGES0 = [['Loyer Bab Ezzouar', 90000], ['Loyer Aïn Allah', 70000], ['Salaires (8 personnes)', 320000], ['Électricité, gaz, eau', 40000], ['Emballages', 25000], ['Marketing', 15000]];
  function charges() { return IMS.lire('arz-charges', CHARGES0); }
  function pCompta() {
    var nb = st.per === 'jour' ? 1 : st.per === '7' ? 7 : 30, R = restos(), T = filtrer(duJour(toutes())), jours = [];
    for (var i = nb - 1; i >= 0; i--) {
      var parts = R.map(function (r) { if (i === 0) { var X = T.filter(function (c) { return (c.resto || 'dar') === r.id; }); return { n: r.nom, c: coul(r.id), v: X.reduce(function (a, c) { return a + c.total; }, 0), k: X.length }; } var h = hist(r.id, i); return { n: r.nom, c: coul(r.id), v: h.ca, k: h.n }; });
      var d = new Date(Date.now() - 6 * 3600e3); d.setDate(d.getDate() - i); jours.push({ l: i === 0 ? 'Auj.' : J[d.getDay()] + ' ' + d.getDate(), parts: parts, d: d });
    }
    var ca = 0, n = 0; jours.forEach(function (j) { j.parts.forEach(function (p) { ca += p.v; n += p.k; }); });
    var tauxM = .32, mat = Math.round(ca * tauxM), chM = charges().reduce(function (a, c) { return a + c[1]; }, 0) * (st.resto === 'tous' ? 1 : .5), ch = Math.round(chM * nb / 30), ben = ca - mat - ch;
    var mix = { place: 0, emporter: 0, livraison: 0 }; T.forEach(function (c) { mix[c.mode] += c.total; });
    var top = {}; T.forEach(function (c) { c.lignes.forEach(function (l) { top[l.nom] = top[l.nom] || { q: 0, v: 0 }; top[l.nom].q += l.q; top[l.nom].v += l.px * l.q; }); });
    var TOP = Object.keys(top).map(function (k) { return [k, top[k].q, top[k].v]; }).sort(function (a, b) { return b[2] - a[2]; }).slice(0, 6), tm = TOP.length ? TOP[0][2] : 1;
    var parR = R.map(function (r) { var v = jours.reduce(function (a, j) { return a + j.parts.filter(function (p) { return p.n === r.nom; })[0].v; }, 0); return [r.nom, v, coul(r.id)]; }), mr = Math.max.apply(null, parR.map(function (x) { return x[1]; }).concat([1]));
    st.jours = jours;
    var graph = nb === 1 ? (function () { var D = [], hn = new Date().getHours(), h1 = Math.max(12, hn < 6 ? hn + 24 : hn); for (var h = 11; h <= h1; h++) { var hx = h % 24; D.push({ l: hx + 'h', parts: R.map(function (r) { return { n: r.nom, c: coul(r.id), v: T.filter(function (c) { return (c.resto || 'dar') === r.id && new Date(c.t).getHours() === hx; }).reduce(function (a, c) { return a + c.total; }, 0) }; }) }); } return graphe(D, { f: fmt, court: true, titre: 'Chiffre d\'affaires par heure', lab: function (d, i) { return D.length > 10 && i % 2 ? '' : d.l; } }); })()
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
      function (v) { v.addEventListener('click', function (e) { if (!e.target.closest('[data-savech]')) return; $$('[data-ch]', v).forEach(function (inp) { C[+inp.dataset.ch][1] = Math.max(0, +inp.value || 0); }); IMS.ecrire('arz-charges', C); v.remove(); toast('Charges mises à jour'); rendre(true); }); });
  }
  function exportCompta() {
    var t = 'Jour\t' + restos().map(function (r) { return r.nom + ' CA DA\t' + r.nom + ' commandes'; }).join('\t') + '\n' + (st.jours || []).map(function (j) { return [j.d.toLocaleDateString('fr-FR')].concat(j.parts.map(function (p) { return p.v + '\t' + p.k; })).join('\t'); }).join('\n');
    try { navigator.clipboard.writeText(t).then(function () { toast('Rapport copié : collez-le dans Excel'); }, function () { toast('Copie impossible sur cet appareil'); }); } catch (e) { toast('Copie impossible sur cet appareil'); }
  }

  // ----- Page : livraisons -----
  var LIV = IMS.LIVREURS;
  function livreur(id) { var l = IMS.livreur(id); return l[0] ? l : ['', '—', '']; }
  function adrComplete(c) { var a = c.adr || {}; return (c.zone ? c.zone + ' · ' : '') + c.adresse + (a.repere ? ' · repère : ' + a.repere : '') + (a.note ? ' · ' + a.note : ''); }
  function msgLivreur(c) { return '🛵 Course ' + IMS.numero(c.no) + ' · Arzata Pizza\n📍 ' + adrComplete(c) + '\n👤 ' + c.nom + ' · ' + c.tel + '\n💰 À encaisser : ' + c.total + ' DA\n🗺 Itinéraire : ' + IMS.itineraire(c); }
  function confier(no, id) { var L = toutes(); L.forEach(function (c) { if (c.no === no) { c.livreur = id; c.st = 'fin'; c.fin = Date.now(); if (!c.eta) { var z = IMS.zone(c.zone); c.eta = z ? z[2] : 25; } } }); IMS.enregistrer(L); }
  function aLivrer() { return filtrer(toutes()).filter(function (c) { return c.mode === 'livraison' && c.st === 'fin' && !c.livree; }).length; }
  function pLivraisons() {
    var L = filtrer(duJour(toutes())).filter(function (c) { return c.mode === 'livraison'; }).sort(function (a, b) { return b.t - a.t; });
    var att = L.filter(function (c) { return c.st !== 'fin'; }), route = L.filter(function (c) { return c.st === 'fin' && !c.livree; }), faites = L.filter(function (c) { return c.livree; });
    var del = faites.length ? Math.round(faites.reduce(function (a, c) { return a + (c.livree - c.t); }, 0) / faites.length / 60000) : 0;
    function ligne(c) {
      var S = IMS.suiviLiv(c) || {}, et = c.livree ? '<span class="g-badge v">Livrée ' + hh(c.livree) + '</span>' : c.st === 'fin' ? '<span class="g-badge b">En route · ' + livreur(c.livreur)[1] + ' · arrivée ≈ ' + hh(S.arrivee) + '</span>' : c.st === 'prete' ? '<span class="g-badge a">Prête, à confier</span>' : '<span class="g-badge n">En cuisine</span>';
      var act = c.livree ? '' : c.st === 'fin' ? '<button class="g-btn ok" data-livree="' + c.no + '">Livrée ✓</button>' : c.st === 'prete' ? '<button class="g-btn" data-confier="' + c.no + '">Confier à un livreur</button>' : '';
      var wa = c.livreur && !c.livree ? '<a class="g-btn wa" target="_blank" rel="noopener" href="' + IMS.lienWa(livreur(c.livreur)[2], msgLivreur(c)) + '">Envoyer au livreur</a>' : '';
      var it = !c.livree ? '<a class="g-btn cl" target="_blank" rel="noopener" href="' + IMS.itineraire(c) + '">Itinéraire</a>' : '';
      var barre = c.st === 'fin' && !c.livree ? '<div class="g-trajet"><i style="width:' + Math.round((S.prog || 0) * 100) + '%"></i></div>' : '';
      return '<div class="g-reg" style="grid-template-columns:auto minmax(0,1fr) auto"><span class="ic">🛵</span><div><b>' + IMS.numero(c.no) + ' · ' + esc(c.zone || '') + ' · ' + esc(c.adresse) + '</b><p>' + (c.adr && c.adr.repere ? '📍 ' + esc(c.adr.repere) + ' · ' : '') + (c.adr && c.adr.note ? '💬 ' + esc(c.adr.note) + ' · ' : '') + esc(c.nom) + ' · ' + esc(c.tel) + ' · ' + fmt(c.total) + (c.frais ? ' (dont livraison ' + fmt(c.frais) + ')' : '') + ' · ' + hh(c.t) + (c.loc ? ' · position GPS du client' : '') + '</p>' + barre + '</div>' + et + '<div class="x" style="display:flex;gap:8px;flex-wrap:wrap">' + act + it + wa + '</div></div>';
    }
    return '<div class="g-grille g-k4">' + kpi('À préparer', att.length, '<em>En cuisine</em>') + kpi('En route', route.length, '<em>Chez les livreurs</em>') + kpi('Livrées aujourd\'hui', faites.length, '') + kpi('Délai moyen', del + ' min', '<em>De la commande à la porte</em>') + '</div>' +
      '<div class="g-carte"><h2>Carte des livraisons <small>' + route.length + ' en route · position estimée, ou GPS si le livreur la partage</small></h2><div class="g-plan">' + IMS.carte({ cmds: route.concat(att.filter(function (c) { return c.st === 'prete'; })), noms: true, titre: 'Carte des livraisons en cours' }) + '</div></div>' +
      '<div class="g-carte"><h2>Livreurs <small>accès « Mes courses » avec le code livreur</small></h2><div class="g-grille g-k3">' + LIV.map(function (l) { var enc = route.filter(function (c) { return c.livreur === l[0]; }), n = faites.filter(function (c) { return c.livreur === l[0]; }).length; return '<div class="g-kpi"><span>' + l[1] + ' · ' + l[2] + '</span><b style="font-size:20px">' + (enc.length ? '🛵 En course ' + enc.map(function (c) { return IMS.numero(c.no); }).join(', ') : '✅ Disponible') + '</b><em>' + n + ' livraison' + (n > 1 ? 's' : '') + ' aujourd\'hui</em></div>'; }).join('') + '</div></div>' +
      '<div class="g-carte"><h2>Livraisons du jour <small>' + L.length + ' commandes</small></h2>' + (L.length ? L.map(ligne).join('') : '<div class="g-vide">Pas encore de livraison aujourd\'hui.</div>') + '</div>';
  }
  function choisirLivreur(no) {
    modale('Confier ' + IMS.numero(no) + ' à un livreur', '<div class="g-grille">' + LIV.map(function (l) { return '<button class="g-btn cl" data-liv="' + l[0] + '" style="padding:16px;text-align:left">🛵 ' + l[1] + ' <span style="font-weight:600;color:var(--encre2)">· ' + l[2] + '</span></button>'; }).join('') + '</div>',
      function (v) { v.addEventListener('click', function (e) { var b = e.target.closest('[data-liv]'); if (!b) return; confier(no, b.dataset.liv); v.remove(); toast(IMS.numero(no) + ' confiée à ' + livreur(b.dataset.liv)[1] + ' · le client suit la course sur son téléphone'); rendre(true); }); });
  }

  // ----- Page : espace livreur (téléphone du livreur) -----
  var gpsWatch = null;
  function pLivreur() {
    var moi = lireS('arz-livreur', ''), T = filtrer(duJour(toutes())).filter(function (c) { return c.mode === 'livraison'; });
    if (!livreur(moi)[0]) return '<div class="g-carte"><h2>Qui êtes-vous ?</h2><div class="g-grille g-k3">' + LIV.map(function (l) { return '<button class="g-btn cl" data-moi="' + l[0] + '" style="padding:18px">🛵 ' + l[1] + '</button>'; }).join('') + '</div></div>';
    var mes = T.filter(function (c) { return c.livreur === moi && c.st === 'fin' && !c.livree; }), dispo = T.filter(function (c) { return c.st === 'prete' && !c.livreur; }), faites = T.filter(function (c) { return c.livreur === moi && c.livree; });
    function fiche(c, prendre) {
      var S = IMS.suiviLiv(c) || {}, a = c.adr || {};
      return '<div class="g-carte g-course"><div class="t"><h2>' + IMS.numero(c.no) + ' · ' + esc(c.zone || '') + '</h2><span class="g-badge ' + (prendre ? 'a' : 'b') + '">' + (prendre ? 'Prête au comptoir' : 'Arrivée ≈ ' + hh(S.arrivee)) + '</span></div>' +
        '<p class="adr"><b>' + esc(c.adresse) + '</b>' + (a.repere ? '<br>📍 Repère : ' + esc(a.repere) : '') + (a.note ? '<br>💬 ' + esc(a.note) : '') + '</p>' +
        '<p class="g-sous">👤 ' + esc(c.nom) + ' · <span dir="ltr">' + esc(c.tel) + '</span> · 💰 à encaisser <b>' + fmt(c.total) + '</b></p>' +
        (prendre ? '<button class="g-btn go" data-prendre="' + c.no + '" style="padding:15px">Je la prends, je pars</button>' :
          '<div class="g-trajet"><i style="width:' + Math.round((S.prog || 0) * 100) + '%"></i></div><div class="act"><a class="g-btn" target="_blank" rel="noopener" href="' + IMS.itineraire(c) + '">🗺 Itinéraire</a><a class="g-btn cl" href="tel:' + String(c.tel).replace(/\D/g, '') + '">📞 Appeler</a><a class="g-btn wa" target="_blank" rel="noopener" href="' + IMS.lienWa(c.tel, 'Bonjour ' + c.nom + ', ici ' + livreur(moi)[1] + ', livreur Arzata Pizza 🛵 J\'arrive dans quelques minutes avec votre commande ' + IMS.numero(c.no) + '.') + '">J\'arrive</a><button class="g-btn ok" data-livree="' + c.no + '">Livrée ✓</button></div>') + '</div>';
    }
    return '<div class="g-carte g-moi"><div><b>🛵 ' + livreur(moi)[1] + '</b><span class="g-sous">' + mes.length + ' course(s) en cours · ' + faites.length + ' livrée(s) aujourd\'hui</span></div><div class="act"><button class="g-pil" data-gps aria-pressed="' + !!gpsWatch + '">' + (gpsWatch ? '📡 Position partagée' : '📡 Partager ma position') + '</button><button class="g-pil" data-moi="">Changer</button></div><p class="g-sous" id="g-gps-msg" style="margin:0;width:100%"></p></div>' +
      (mes.length ? '<div class="g-plan">' + IMS.carte({ cmds: mes, noms: true, zoom: true, titre: 'Mes courses' }) + '</div>' : '') +
      (mes.length ? mes.map(function (c) { return fiche(c, false); }).join('') : '<div class="g-vide">Aucune course en cours.</div>') +
      (dispo.length ? '<h2 class="g-h">À récupérer au comptoir</h2>' + dispo.map(function (c) { return fiche(c, true); }).join('') : '');
  }
  function partagerPosition() {
    var m = $('#g-gps-msg', root);
    if (gpsWatch) { try { navigator.geolocation.clearWatch(gpsWatch); } catch (e) {} gpsWatch = null; rendre(true); return; }
    try {
      gpsWatch = navigator.geolocation.watchPosition(function (p) { var moi = lireS('arz-livreur', ''), L = toutes(), g = [+p.coords.latitude.toFixed(5), +p.coords.longitude.toFixed(5)], ch = false; L.forEach(function (c) { if (c.livreur === moi && c.st === 'fin' && !c.livree) { c.gps = g; ch = true; } }); if (ch) IMS.enregistrer(L); },
        function () { gpsWatch = null; var m2 = $('#g-gps-msg', root); if (m2) m2.textContent = 'Position indisponible sur cet appareil (autorisez la localisation). Le client voit une position estimée.'; }, { enableHighAccuracy: true, maximumAge: 10000 });
      if (m) m.textContent = 'Position partagée : le client voit votre scooter en direct.';
    } catch (e) { if (m) m.textContent = 'Position indisponible sur cet appareil.'; }
  }

  // ----- Page : clients et fidélité -----
  function hachage(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }
  function clients() {
    var M = {};
    filtrer(toutes()).forEach(function (c) { var k = String(c.tel).replace(/\s/g, ''); var x = M[k] = M[k] || { nom: c.nom, tel: c.tel, n: 0, total: 0, der: 0, r: {} }; x.n++; x.total += c.total; x.der = Math.max(x.der, c.t); x.r[c.resto || 'bab'] = 1; });
    return Object.keys(M).map(function (k) { var x = M[k], anc = IMS.mode() === 'demo' ? 2 + hachage(k) % 17 : 0; x.n += anc; x.total += anc * (1700 + hachage(k + 'p') % 400); return x; }).sort(function (a, b) { return b.total - a.total; });
  }
  function pClients() {
    var C = clients(), q = (st.qc || '').toLowerCase(), X = C.filter(function (c) { return !q || (c.nom + ' ' + c.tel).toLowerCase().indexOf(q) >= 0; }), fid = C.filter(function (c) { return c.n >= 10; }).length;
    var tot = C.reduce(function (a, c) { return a + c.total; }, 0);
    return '<div class="g-grille g-k4">' + kpi('Clients', C.length, '<em>Fichier constitué automatiquement</em>') + kpi('Clients fidèles', fid, '<em>10 commandes et plus</em>') + kpi('Dépense moyenne', fmt(C.length ? tot / C.length : 0), '<em>Par client, depuis le début</em>') + kpi('Récompenses à offrir', C.reduce(function (a, c) { return a + Math.floor(c.n / 10); }, 0), '<em>1 Croger offert / 10 commandes</em>') + '</div>' +
      '<div class="g-carte"><h2>Fichier clients <span style="display:flex;gap:8px;flex-wrap:wrap"><input class="g-rech" id="g-qc" style="width:220px" type="search" placeholder="Nom ou téléphone…" value="' + esc(st.qc || '') + '" aria-label="Rechercher un client"><button class="g-pil" data-act="numeros">Copier les numéros</button></span></h2>' +
      '<div class="g-defile"><table class="g-table"><thead><tr><th>Client</th><th>Téléphone</th><th class="m">Commandes</th><th class="m">Total dépensé</th><th>Dernière commande</th><th>Fidélité</th><th><span class="vh">Actions</span></th></tr></thead><tbody>' +
      X.map(function (c) { var pr = c.n % 10; return '<tr><td><b>' + esc(c.nom) + '</b></td><td>' + esc(c.tel) + '</td><td class="m">' + c.n + '</td><td class="m"><b>' + fmt(c.total) + '</b></td><td>' + hh(c.der) + (jour(c.der) === jour(Date.now()) ? ' aujourd\'hui' : '') + '</td><td><span class="g-barres" style="display:inline-grid;width:110px;vertical-align:middle"><span class="j"><i style="width:' + pr * 10 + '%;background:var(--rouge)"></i></span></span> <span class="g-sous" style="display:inline">' + pr + '/10' + (c.n >= 10 ? ' · ' + Math.floor(c.n / 10) + ' 🎁' : '') + '</span></td><td><a class="g-pil" style="text-decoration:none" target="_blank" rel="noopener" href="' + IMS.lienWa(c.tel, 'Bonjour ' + c.nom + ' 👋 Merci pour votre fidélité chez Arzata Pizza ! ' + (c.n >= 10 ? 'Votre pizza offerte vous attend 🎁' : 'Plus que ' + (10 - pr) + ' commandes avant votre pizza offerte 🍕')) + '">WhatsApp</a></td></tr>'; }).join('') +
      '</tbody></table></div><p class="g-sous" style="margin-top:10px">Chaque commande en ligne enrichit le fichier : nom, téléphone, habitudes. C\'est votre base pour les promos WhatsApp et la fidélité.</p></div>';
  }

  // ----- Page : marketing -----
  function pMarketing() {
    var o = IMS.promo(), M = IMS.menu(), p = M.filter(function (x) { return x.id === o.plat; })[0] || M[0];
    var txt = 'Bonjour 👋 Aujourd\'hui chez Arzata Pizza : ' + p.nom + ' à -' + o.remise + ' % 🔥 Commandez en ligne en 1 minute, sur place, à emporter ou en livraison !';
    return '<div class="g-grille g-k2 g-srvs">' +
      '<div class="g-carte g-srv"><div class="t"><h2>🔥 Plat du jour</h2><button class="g-sw" role="switch" aria-checked="' + !!o.actif + '" data-promo="actif" aria-label="Activer le plat du jour"><i></i></button></div>' +
      '<p class="g-sous">Le plat choisi passe en promotion sur le site, avec un badge « Plat du jour ». Le prix réduit s\'applique au panier.</p>' +
      '<label class="g-sous" style="display:grid;gap:6px">Plat<select class="g-sel" id="g-pplat">' + M.map(function (x) { return '<option value="' + x.id + '"' + (x.id === o.plat ? ' selected' : '') + '>' + esc(x.nom) + '</option>'; }).join('') + '</select></label>' +
      '<div class="l"><span>Remise</span><div class="g-seg">' + [10, 15, 20, 25].map(function (r) { return '<button data-remise="' + r + '" aria-pressed="' + (o.remise === r) + '">-' + r + ' %</button>'; }).join('') + '</div></div>' +
      '<div style="display:grid;grid-template-columns:64px minmax(0,1fr);gap:12px;align-items:center;background:var(--trait2);border-radius:12px;padding:10px"><img src="' + p.img + '" alt="" style="width:64px;height:64px;border-radius:10px;object-fit:cover"><div><b>' + esc(p.nom) + '</b><div class="g-sous">' + (o.actif ? '<s>' + fmt(p.avant || p.prix) + '</s> <b style="color:var(--rouge)">' + fmt(p.prix) + '</b> · en ligne sur le site' : 'Désactivé') + '</div></div></div></div>' +
      '<div class="g-carte g-srv"><div class="t"><h2>📣 Bannière sur le site</h2><button class="g-sw" role="switch" aria-checked="' + !!o.banniere + '" data-promo="banniere" aria-label="Afficher la bannière"><i></i></button></div>' +
      '<p class="g-sous">Un bandeau rouge en haut du site, pour une annonce : promo, nouveau plat, horaires du Ramadan, fermeture exceptionnelle…</p>' +
      '<input class="g-rech" style="max-width:none" id="g-ptxt" maxlength="90" value="' + esc(o.texte || ('-' + o.remise + ' % sur le ' + p.nom + ' aujourd\'hui seulement')) + '" aria-label="Texte de la bannière">' +
      '<div style="background:linear-gradient(90deg,#B3122A,#ff4a4f);color:#fff;font-weight:800;border-radius:10px;padding:10px 14px;text-align:center">🔥 ' + esc(o.texte || ('-' + o.remise + ' % sur le ' + p.nom + ' aujourd\'hui seulement')) + '</div></div></div>' +
      '<div class="g-carte"><h2>Message WhatsApp à vos clients <button class="g-pil" data-act="copiermsg">Copier le message</button></h2><p class="g-sous" style="margin-bottom:10px">À envoyer en liste de diffusion WhatsApp aux ' + clients().length + ' clients du fichier.</p><div style="background:#E6F8EE;border-radius:12px;padding:14px;font-size:15px" id="g-msg">' + esc(txt) + '</div></div>';
  }

  // ----- Page : plus (téléphone) -----
  function pPlus() {
    return '<div class="g-grille g-k2">' + [['livraisons', 'Livraisons', 'Livreurs, courses en route'], ['clients', 'Clients et fidélité', 'Fichier clients, récompenses'], ['marketing', 'Marketing', 'Plat du jour, bannière, WhatsApp'], ['menu', 'Menu', 'Ruptures et prix'], ['reglages', 'Réglages', 'Établissement, équipe, mise en service']].filter(function (x) { return permis(x[0]); }).map(function (x) {
      return '<button class="g-carte" data-p="' + x[0] + '" style="text-align:left;display:grid;gap:8px;cursor:pointer"><span style="width:40px;height:40px;border-radius:11px;background:var(--trait2);display:grid;place-items:center">' + I[x[0]].replace('<svg', '<svg style="width:22px;height:22px;stroke:var(--navy);fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round"') + '</span><b style="font-size:16px">' + x[1] + '</b><span class="g-sous">' + x[2] + '</span></button>';
    }).join('') + '</div>' + (st.autonome ? '' : '<button class="g-btn rg" data-act="fermer" style="padding:15px">← Retour au site client</button>');
  }

  // ----- Page : menu -----
  function pMenu() {
    var M = IMS.menu(), CB = IMS.catalogue(), q = st.q.trim().toLowerCase(), X = M.filter(function (p) { return q ? (p.nom + ' ' + p.desc).toLowerCase().indexOf(q) >= 0 : p.cat === st.cat; }), off = M.filter(function (p) { return !p.dispo; }).length;
    return '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="g-btn" data-act="addplat">+ Ajouter un plat</button><button class="g-pil" data-act="cats">Catégories</button></div>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;justify-content:space-between"><input class="g-rech" id="g-q" type="search" placeholder="Rechercher un plat…" value="' + esc(st.q) + '" aria-label="Rechercher un plat"><span class="g-sous">' + M.length + ' plats · ' + (off ? '<b style="color:var(--rouge)">' + off + ' en rupture</b>' : 'tout est disponible') + ' · les changements apparaissent tout de suite sur le site</span></div>' +
      (q ? '' : '<div class="g-cats">' + IMS.CATS.map(function (c) { return '<button data-cat="' + c + '" aria-pressed="' + (st.cat === c) + '">' + c + '</button>'; }).join('') + '</div>') +
      '<div class="g-carte" style="padding-block:6px">' + (X.map(function (p) {
        var bp = CB.filter(function (x) { return x.id === p.id; })[0] || p, px = bp.tailles ? bp.tailles : [['Prix', bp.prix]];
        return '<div class="g-prod' + (p.dispo ? '' : ' off') + '"><img src="' + p.img + '" alt=""><div><div class="n">' + esc(p.nom) + '</div><div class="d">' + (p.dispo ? 'En vente' : 'Rupture : affiché « épuisé » sur le site') + '</div></div>' +
          '<div class="g-prix">' + px.map(function (t, i) { return '<label>' + esc(t[0].split(' ·')[0]) + '<input type="number" min="0" step="10" value="' + t[1] + '" data-pid="' + p.id + '" data-i="' + i + '" aria-label="Prix ' + esc(p.nom + ' ' + t[0]) + '"></label>'; }).join('') + '</div>' +
          '<span style="display:flex;gap:10px;align-items:center"><button class="g-pil" data-edit="' + p.id + '">Modifier</button><button class="g-sw" role="switch" aria-checked="' + p.dispo + '" data-dispo="' + p.id + '" aria-label="Disponible"><i></i></button></span></div>';
      }).join('') || '<div class="g-vide">Aucun plat trouvé.</div>') + '</div>';
  }

  // ----- Éditeur de plat -----
  function editerPlat(id) {
    var C = IMS.catalogue(), p = id ? C.filter(function (x) { return x.id === id; })[0] : null, nv = !p;
    p = p || { id: 'p' + Date.now().toString(36), cat: st.cat, nom: '', desc: '', img: 'img/logo.jpg', tailles: [['Simple', 500], ['Double', 700]] };
    var T = p.tailles ? p.tailles.slice() : [['Prix unique', p.prix || 0]], img = p.img, ex = p.extra && p.extra[0] ? p.extra[0] : ['', 0];
    function lignesT() { return T.map(function (t, i) { return '<div style="display:grid;grid-template-columns:minmax(0,1fr) 110px auto;gap:8px;align-items:center"><input class="g-rech" style="max-width:none" data-tl="' + i + '" value="' + esc(t[0]) + '" placeholder="Taille (ex. Double)"><input class="g-rech" type="number" min="0" step="50" data-tp="' + i + '" value="' + t[1] + '"><button class="g-pil" data-tx="' + i + '" aria-label="Retirer">✕</button></div>'; }).join(''); }
    var v = modale(nv ? 'Ajouter un plat' : 'Modifier « ' + esc(p.nom) + ' »',
      '<div style="display:grid;grid-template-columns:96px minmax(0,1fr);gap:12px;align-items:center"><img id="e-img" src="' + img + '" alt="" style="width:96px;height:96px;border-radius:14px;object-fit:cover;background:#143A2C"><label class="g-pil" style="justify-self:start;cursor:pointer">📷 Changer la photo<input type="file" accept="image/*" id="e-file" hidden></label></div>' +
      '<label class="g-sous" style="display:grid;gap:5px;font-weight:700">Nom<input class="g-rech" style="max-width:none" id="e-nom" value="' + esc(p.nom) + '" placeholder="Ex. Pizza Truffe"></label>' +
      '<label class="g-sous" style="display:grid;gap:5px;font-weight:700">Description<input class="g-rech" style="max-width:none" id="e-desc" value="' + esc(p.desc) + '" placeholder="Ingrédients"></label>' +
      '<label class="g-sous" style="display:grid;gap:5px;font-weight:700">Catégorie<select class="g-sel" id="e-cat">' + IMS.CATS.map(function (c) { return '<option' + (c === p.cat ? ' selected' : '') + '>' + esc(c) + '</option>'; }).join('') + '</select></label>' +
      '<div style="display:grid;gap:8px"><b style="font-size:14px">Tailles et prix (DA)</b><div id="e-t" style="display:grid;gap:8px">' + lignesT() + '</div><button class="g-pil" style="justify-self:start" data-tadd>+ Ajouter une taille</button></div>' +
      '<div style="display:grid;grid-template-columns:minmax(0,1fr) 110px;gap:8px"><input class="g-rech" style="max-width:none" id="e-exn" value="' + esc(ex[0]) + '" placeholder="Supplément (optionnel)"><input class="g-rech" type="number" min="0" step="50" id="e-exp" value="' + (ex[1] || '') + '" placeholder="Prix"></div>' +
      '<div class="act">' + (nv ? '' : '<button class="g-btn cl" data-supp style="color:var(--rouge)">Supprimer</button>') + '<button class="g-btn" data-save>' + (nv ? 'Ajouter au menu' : 'Enregistrer') + '</button></div>',
      function (v) {
        function lire() { $$('[data-tl]', v).forEach(function (e) { T[+e.dataset.tl][0] = e.value; }); $$('[data-tp]', v).forEach(function (e) { T[+e.dataset.tp][1] = Math.max(0, +e.value || 0); }); }
        $('#e-file', v).addEventListener('change', function () { var f = this.files && this.files[0]; if (!f) return; var r = new FileReader(); r.onload = function () { var im = new Image(); im.onload = function () { var c = document.createElement('canvas'), z = 480; c.width = z; c.height = z; var k = Math.max(z / im.width, z / im.height), w = im.width * k, h = im.height * k; c.getContext('2d').drawImage(im, (z - w) / 2, (z - h) / 2, w, h); img = c.toDataURL('image/jpeg', .8); $('#e-img', v).src = img; }; im.src = r.result; }; r.readAsDataURL(f); });
        v.addEventListener('click', function (e) {
          var b = e.target.closest('[data-tadd],[data-tx],[data-save],[data-supp]'); if (!b) return; lire();
          if (b.hasAttribute('data-tadd')) { T.push(['', 0]); $('#e-t', v).innerHTML = lignesT(); return; }
          if (b.dataset.tx != null) { if (T.length > 1) T.splice(+b.dataset.tx, 1); $('#e-t', v).innerHTML = lignesT(); return; }
          var L = IMS.catalogue();
          if (b.hasAttribute('data-supp')) { if (b.dataset.ok !== '1') { b.dataset.ok = '1'; b.textContent = 'Confirmer la suppression'; return; } L = L.filter(function (x) { return x.id !== p.id; }); IMS.majCatalogue(L); v.remove(); toast('Plat supprimé du menu'); rendre(true); return; }
          var nom = $('#e-nom', v).value.trim(); if (!nom) { $('#e-nom', v).focus(); return toast('Indiquez le nom du plat'); }
          var q = { id: p.id, cat: $('#e-cat', v).value, nom: nom, desc: $('#e-desc', v).value.trim(), img: img };
          var TT = T.filter(function (t) { return t[1] > 0; }); if (!TT.length) return toast('Indiquez au moins un prix');
          if (TT.length === 1 && (!TT[0][0].trim() || /unique/i.test(TT[0][0]))) q.prix = TT[0][1]; else q.tailles = TT.map(function (t) { return [t[0].trim() || 'Taille', t[1]]; });
          var exn = $('#e-exn', v).value.trim(), exp = +$('#e-exp', v).value || 0; if (exn && exp) q.extra = [[exn, exp]];
          var i = L.findIndex(function (x) { return x.id === p.id; }); if (i >= 0) L[i] = q; else L.push(q);
          var P = IMS.lire('arz-prix', {}); delete P[p.id]; IMS.ecrire('arz-prix', P);
          IMS.majCatalogue(L); st.cat = q.cat; v.remove(); toast(nv ? 'Plat ajouté : visible tout de suite sur le site' : 'Plat mis à jour sur le site'); rendre(true);
        });
      });
  }
  function editerCats() {
    var K = IMS.CATS.slice(), anc = K.slice();
    function liste() { return K.map(function (c, i) { return '<div style="display:grid;grid-template-columns:minmax(0,1fr) auto auto auto;gap:6px;align-items:center"><input class="g-rech" style="max-width:none" data-ck="' + i + '" value="' + esc(c) + '"><button class="g-pil" data-up="' + i + '" aria-label="Monter">↑</button><button class="g-pil" data-dn="' + i + '" aria-label="Descendre">↓</button><button class="g-pil" data-cx="' + i + '" aria-label="Supprimer">✕</button></div>'; }).join(''); }
    modale('Catégories du menu', '<p class="g-sous">L\'ordre ici est celui des onglets du site. Une catégorie supprimée envoie ses plats dans la première.</p><div id="c-l" style="display:grid;gap:8px">' + liste() + '</div><button class="g-pil" style="justify-self:start" data-cadd>+ Ajouter une catégorie</button><div class="act"><button class="g-btn" data-csave>Enregistrer</button></div>',
      function (v) {
        var map = anc.map(function (c, i) { return i; });
        function lire() { $$('[data-ck]', v).forEach(function (e) { K[+e.dataset.ck] = e.value.trim(); }); }
        v.addEventListener('click', function (e) {
          var b = e.target.closest('[data-up],[data-dn],[data-cx],[data-cadd],[data-csave]'); if (!b) return; lire();
          function sw(a, c) { if (c < 0 || c >= K.length) return; var t = K[a]; K[a] = K[c]; K[c] = t; t = map[a]; map[a] = map[c]; map[c] = t; }
          if (b.dataset.up != null) sw(+b.dataset.up, +b.dataset.up - 1);
          else if (b.dataset.dn != null) sw(+b.dataset.dn, +b.dataset.dn + 1);
          else if (b.dataset.cx != null) { if (K.length > 1) { K.splice(+b.dataset.cx, 1); map.splice(+b.dataset.cx, 1); } }
          else if (b.hasAttribute('data-cadd')) { K.push('Nouvelle catégorie'); map.push(-1); }
          else {
            var ren = {}; map.forEach(function (o, i) { if (o >= 0) ren[anc[o]] = K[i]; });
            var L = IMS.catalogue(); L.forEach(function (p) { p.cat = ren[p.cat] || K[0]; }); IMS.majCatalogue(L);
            var C = IMS.config(); C.cats = K.filter(Boolean); IMS.majConfig(C); st.cat = C.cats[0]; v.remove(); toast('Catégories mises à jour sur le site'); rendre(true); return;
          }
          $('#c-l', v).innerHTML = liste();
        });
      });
  }

  // ----- Page : réglages -----
  function pReglages() {
    var o = IMS.reception();
    function ligne(ic, t, p, droite, x) { return '<div class="g-reg"><span class="ic">' + ic + '</span><div><b>' + t + '</b><p>' + p + '</p></div>' + (droite || '<span></span>') + (x ? '<div class="x">' + x + '</div>' : '') + '</div>'; }
    function sw(k) { return '<button class="g-sw" role="switch" aria-checked="' + !!o[k] + '" data-rk="' + k + '" aria-label="Activer"><i></i></button>'; }
    function seg(k, V) { return '<div class="g-seg">' + V.map(function (v) { return '<button data-rs="' + k + '" data-v="' + v[0] + '" aria-pressed="' + (String(o[k]) === String(v[0])) + '">' + v[1] + '</button>'; }).join('') + '</div>'; }
    var C = IMS.config(), demo = IMS.mode() === 'demo', HO = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], HF = [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28];
    function hsel(k, i, v, L) { return '<select class="g-sel" data-r="' + i + '" data-rf="' + k + '">' + L.map(function (h) { return '<option value="' + h + '"' + (+v === h ? ' selected' : '') + '>' + ((h % 24) < 10 ? '0' : '') + (h % 24) + 'h' + (h >= 24 ? ' (nuit)' : '') + '</option>'; }).join('') + '</select>'; }
    return '<div class="g-carte" style="border:2px solid ' + (demo ? 'var(--ambre)' : 'var(--vert)') + '"><h2>' + (demo ? '🧪 Mode démonstration' : '✅ Plateforme en service') + ' <span class="g-badge ' + (demo ? 'a' : 'v') + '">' + (demo ? 'Données d\'exemple' : 'Vos vraies données') + '</span></h2>' +
      (demo ? '<p class="g-sous" style="margin-bottom:12px">Les commandes, clients et statistiques affichés sont des exemples. Le jour de la remise, un clic remet tous les compteurs à zéro : commandes, numéros (#001), caisse, clôtures, clients, statistiques. <b>Votre menu, vos prix, vos restaurants et vos réglages sont conservés.</b></p><button class="g-btn rg" data-act="service">Mettre en service : compteurs à zéro</button>'
        : '<p class="g-sous" style="margin-bottom:12px">Toutes les données affichées sont réelles. Les statistiques et la comptabilité se construisent jour après jour.</p><button class="g-pil" data-act="demo">Revenir aux données de démonstration</button>') + '</div>' +
      '<div class="g-carte"><h2>Établissement <button class="g-btn" data-act="saveconf">Enregistrer</button></h2>' +
      '<div class="g-grille g-k3" style="margin-bottom:14px">' + [['nom', 'Nom affiché'], ['slogan', 'Slogan'], ['insta', 'Instagram (sans @)']].map(function (f) { return '<label class="g-sous" style="display:grid;gap:5px;font-weight:700">' + f[1] + '<input class="g-rech" style="max-width:none" data-cf="' + f[0] + '" value="' + esc(C[f[0]]) + '"></label>'; }).join('') + '</div>' +
      C.restos.map(function (r, i) { return '<div class="g-reg" style="grid-template-columns:auto minmax(0,1fr)"><span class="ic">📍</span><div class="g-grille" style="grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px">' +
        '<label class="g-sous" style="display:grid;gap:4px;font-weight:700">Nom<input class="g-rech" data-r="' + i + '" data-rf="nom" value="' + esc(r.nom) + '"></label><label class="g-sous" style="display:grid;gap:4px;font-weight:700">Téléphone<input class="g-rech" data-r="' + i + '" data-rf="tel" value="' + esc(r.tel) + '"></label>' +
        '<label class="g-sous" style="display:grid;gap:4px;font-weight:700">Adresse (Google Maps)<input class="g-rech" data-r="' + i + '" data-rf="adresse" value="' + esc(r.adresse || r.nom) + '"></label><label class="g-sous" style="display:grid;gap:4px;font-weight:700">Ouverture' + hsel('ouv', i, r.ouv, HO) + '</label><label class="g-sous" style="display:grid;gap:4px;font-weight:700">Fermeture' + hsel('ferm', i, r.ferm, HF) + '</label>' +
        (C.restos.length > 1 ? '<button class="g-lien" style="color:var(--rouge);justify-self:start;align-self:end;padding-bottom:10px" data-delr="' + i + '">Supprimer ce restaurant</button>' : '') + '</div></div>'; }).join('') +
      '<button class="g-pil" data-act="addr" style="margin-top:12px">+ Ajouter un restaurant</button></div>' +
      '<div class="g-carte"><h2>Zones de livraison <button class="g-btn" data-act="savezones">Enregistrer</button></h2><p class="g-sous" style="margin:0 0 10px">Le client choisit sa commune sur la carte : frais, délai et minimum de commande s\'appliquent tout seuls. Pré-calculés selon la distance depuis la pizzeria, modifiables.</p>' +
      '<div class="g-defile"><table class="g-table g-ztab"><thead><tr><th>Commune</th><th class="m">Frais (DA)</th><th class="m">Trajet (min)</th><th class="m">Minimum (DA)</th><th><span class="vh">Supprimer</span></th></tr></thead><tbody>' + (C.zones || []).map(function (z, i) { return '<tr><td><input class="g-rech" data-zn="' + i + '" value="' + esc(z[0]) + '" aria-label="Commune ' + (i + 1) + '"></td><td class="m"><input class="g-rech" data-zf="' + i + '" inputmode="numeric" value="' + z[1] + '" aria-label="Frais ' + esc(z[0]) + '"></td><td class="m"><input class="g-rech" data-zm="' + i + '" inputmode="numeric" value="' + z[2] + '" aria-label="Trajet ' + esc(z[0]) + '"></td><td class="m"><input class="g-rech" data-zx="' + i + '" inputmode="numeric" value="' + z[3] + '" aria-label="Minimum ' + esc(z[0]) + '"></td><td><button class="g-lien" data-delz="' + i + '" aria-label="Supprimer ' + esc(z[0]) + '">✕</button></td></tr>'; }).join('') + '</tbody></table></div>' +
      '<div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin-top:12px"><button class="g-pil" data-act="addz">+ Ajouter une zone</button><label class="g-sous" style="display:flex;gap:8px;align-items:center;font-weight:700">Livraison offerte dès <input class="g-rech" style="width:100px" id="g-offerte" inputmode="numeric" value="' + (C.offerte || 0) + '"> DA pour les zones à <input class="g-rech" style="width:80px" id="g-offmax" inputmode="numeric" value="' + (C.offerteMax || 0) + '" aria-label="Frais maximum des zones concernées"> DA de frais ou moins</label></div></div>' +
      '<div class="g-carte"><h2>Équipe et accès <button class="g-btn" data-act="savepins">Enregistrer</button></h2>' +
      [['gerant', '👑', 'Gérant', 'Accès complet : tableau de bord, caisse, comptabilité, clients, marketing, réglages.'], ['cuisine', '👨‍🍳', 'Cuisine', 'Uniquement la cuisine, les livraisons et les ruptures du menu.'], ['caisse', '🧾', 'Caisse', 'Caisse, encaissements, cuisine, livraisons et fichier clients. Pas de comptabilité.'], ['livreur', '🛵', 'Livreurs', 'Uniquement « Mes courses » : adresse, repère, itinéraire, appel du client, « Livrée », position GPS.']].map(function (x) {
        return ligne(x[1], x[2], x[3], '<input class="g-rech" style="width:96px;text-align:center;letter-spacing:.3em;font-weight:800" inputmode="numeric" maxlength="4" data-pin="' + x[0] + '" value="' + esc(C.pins[x[0]]) + '" aria-label="Code ' + x[2] + '">'); }).join('') + '</div>' +
      '<div class="g-carte"><h2>Réception des commandes <small>activez autant de canaux que vous voulez</small></h2>' +
      ligne('📺', 'Écran cuisine', 'Commandes en direct sur la tablette, avec sonnerie.', sw('ecran')) +
      ligne('🧾', 'Bons imprimés automatiquement', 'Chaque commande sort en bon sur l\'imprimante de la caisse (USB, réseau ou Bluetooth).', sw('bons'), seg('copies', [[1, '1 copie'], [2, '2 copies'], [3, '3 copies']]) + ' ' + seg('format', [['58', '58 mm'], ['80', '80 mm']])) +
      ligne('💬', 'WhatsApp du restaurant', 'Chaque commande arrive aussi en message WhatsApp sur le ' + esc(IMS.RESTOS.map(function (r) { return r.tel; }).join(' · ')) + '.', sw('whatsapp')) +
      ligne('📲', 'Prévenir le client', 'Bouton « Prévenir » quand la commande est prête : le client reçoit un message WhatsApp.', sw('clientWa')) +
      ligne('✉️', 'SMS au gérant', 'Un SMS par commande, utile s\'il n\'y a pas d\'internet en cuisine.', sw('sms')) +
      ligne('📧', 'E-mail', 'Une copie de chaque commande et le récapitulatif de la journée à la fermeture.', sw('email')) +
      ligne('⚡', 'Acceptation des commandes', 'Automatique : la commande part directement en préparation et le bon s\'imprime.', '<span></span>', seg('acceptation', [['manuelle', 'Manuelle'], ['auto', 'Automatique']])) +
      ligne('🧮', 'Logiciel de caisse', 'Les ventes rejoignent votre caisse ou votre comptabilité.', '<span></span>', seg('caisse', [['aucune', 'Aucun'], ['csv', 'Export Excel'], ['api', 'Connexion directe']])) +
      '</div>' +
      '<div class="g-carte"><h2>Restaurants</h2>' + IMS.RESTOS.map(function (r) { var ouv = IMS.ouvert(r); return ligne('📍', r.nom, r.h + ' · ' + r.tel, '<span class="g-badge ' + (ouv ? 'v' : 'n') + '">' + (ouv ? 'Ouvert' : 'Fermé') + '</span>'); }).join('') + '</div>' +
      '<div class="g-carte"><h2>QR codes des tables <span style="display:flex;gap:8px;flex-wrap:wrap"><select class="g-sel" id="g-qrr" aria-label="Restaurant">' + IMS.RESTOS.map(function (r) { return '<option value="' + r.id + '"' + (st.qrR === r.id ? ' selected' : '') + '>' + r.nom + '</option>'; }).join('') + '</select><select class="g-sel" id="g-qrn" aria-label="Nombre de tables">' + [8, 12, 16, 20].map(function (k) { return '<option' + (st.qrN === k ? ' selected' : '') + '>' + k + '</option>'; }).join('') + '</select></span></h2><p class="g-sous" style="margin-bottom:12px">À imprimer et poser sur chaque table : le client scanne, commande, et le numéro de table arrive avec la commande.</p><div class="g-qr" id="g-qr"></div></div>' +
      '<div class="g-carte"><h2>Sauvegarde et sécurité</h2>' + ligne('💾', 'Sauvegarde', 'Copie complète du menu, des prix, des restaurants et des réglages, à garder ou à transférer sur un autre appareil.', '<span style="display:flex;gap:8px;flex-wrap:wrap"><button class="g-pil" data-act="backup">Copier</button><button class="g-pil" data-act="restore">Restaurer</button></span>') + ligne('🔒', 'Verrouiller', 'Ferme la session : le code sera redemandé.', '<button class="g-pil" data-act="verrou">Verrouiller</button>') + (demo ? ligne('↺', 'Réinitialiser la démo', 'Remet la démonstration comme au départ (menu, réglages, commandes).', '<button class="g-pil rouge" data-act="reinit">Réinitialiser</button>') : '') + '</div>';
  }
  var qrLib = null;
  function qr() {
    var box = $('#g-qr', root); if (!box) return;
    function go() { var base = location.href.replace(/[#?].*$/, '').replace(/[^/]*$/, '') + 'index.html'; box.innerHTML = ''; for (var i = 1; i <= st.qrN; i++) { var d = document.createElement('div'); d.innerHTML = '<span></span><b>Table ' + i + '</b><small>' + IMS.resto(st.qrR).nom + ' · scannez pour commander</small>'; box.appendChild(d); try { var qq = new window.QRCode(d.firstChild, { text: base + '#' + st.qrR + '-table-' + i, width: 232, height: 232, colorDark: '#143A2C', colorLight: '#FFFFFF', correctLevel: window.QRCode.CorrectLevel.M }); } catch (e) { d.firstChild.textContent = 'QR indisponible'; } } setTimeout(function () { $$('.g-qr img', box).forEach(function (im, k) { im.alt = 'QR code de la table ' + (k + 1); }); }, 60); }
    if (window.QRCode) return go();
    box.innerHTML = '<div class="g-vide" style="grid-column:1/-1">Chargement des QR codes…</div>';
    if (!qrLib) { qrLib = document.createElement('script'); qrLib.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'; document.head.appendChild(qrLib); }
    qrLib.addEventListener('load', function () { if (st.page === 'reglages') go(); });
    qrLib.addEventListener('error', function () { box.innerHTML = '<div class="g-vide" style="grid-column:1/-1">QR codes indisponibles hors connexion.</div>'; });
  }

  // ----- Interactions -----
  function majStatut(no, s) { var L = toutes(), c0 = L.filter(function (c) { return c.no === no; })[0]; if (s === 'fin' && c0 && c0.mode === 'livraison' && !c0.livreur) return choisirLivreur(no); L.forEach(function (c) { if (c.no === no) { c.st = s; if (s === 'prep') c.four = Date.now(); if (s === 'fin') c.fin = Date.now(); } }); IMS.enregistrer(L); rendre(true); }
  function clic(e) {
    var b;
    if ((b = e.target.closest('[data-p]')) && !e.target.closest('.g-voile [data-p]:not([data-fermer])')) { st.page = b.dataset.p; corps.scrollTop = 0; rendre(); return; }
    if ((b = e.target.closest('[data-act]'))) {
      var a = b.dataset.act;
      if (a === 'fermer') return fermer();
      if (a === 'verrou') { ecrireS('arz-acces', ''); verrou(); return; }
      if (a === 'z') return cloture();
      if (a === 'copier') return copier();
      if (a === 'exportc') return exportCompta();
      if (a === 'charges') return editerCharges();
      if (a === 'numeros') return copierTexte(clients().map(function (c) { return c.nom + '\t' + c.tel; }).join('\n'), 'Numéros copiés : ' + clients().length + ' clients');
      if (a === 'copiermsg') return copierTexte($('#g-msg', root).textContent, 'Message copié : collez-le dans WhatsApp');
      if (a === 'test') return voirBon({ no: 0, resto: IMS.RESTOS[0].id, t: Date.now(), mode: 'emporter', heure: 'Test', nom: 'Test imprimante', tel: '-', adresse: '', lignes: [{ q: 1, nom: 'Bon de test', det: [], px: 0 }], total: 0 }, false);
      if (a === 'addplat') return editerPlat(null);
      if (a === 'cats') return editerCats();
      if (a === 'service') return modale('Mettre la plateforme en service', '<p>On remet à zéro : <b>commandes, numérotation (#001), caisse et clôtures, fichier clients, statistiques et comptabilité</b>.</p><p>On garde : <b>menu, prix, photos, restaurants, horaires, codes d\'accès et réglages</b>.</p><div class="act"><button class="g-btn cl" data-fermer>Annuler</button><button class="g-btn rg" data-go>Confirmer la mise en service</button></div>', function (v) { v.addEventListener('click', function (e) { if (!e.target.closest('[data-go]')) return; IMS.miseEnService(); st.dernier = 0; v.remove(); toast('Plateforme en service : compteurs à zéro'); st.page = 'accueil'; rendre(); }); });
      if (a === 'demo') { IMS.modeDemo(); st.dernier = maxNo(); toast('Données de démonstration rechargées'); rendre(); return; }
      if (a === 'saveconf') { var C = IMS.config(); $$('[data-cf]', root).forEach(function (e) { C[e.dataset.cf] = e.value.trim(); }); $$('[data-rf]', root).forEach(function (e) { var r = C.restos[+e.dataset.r]; r[e.dataset.rf] = e.dataset.rf === 'ouv' || e.dataset.rf === 'ferm' ? +e.value : e.value.trim(); }); IMS.majConfig(C); toast('Établissement enregistré : le site est à jour'); rendre(true); return; }
      if (a === 'savezones' || a === 'addz') { var CZ = IMS.config(); var Z0 = CZ.zones, n = function (sel, i) { var x = $('[' + sel + '="' + i + '"]', root); return Math.max(0, parseInt(x && x.value, 10) || 0); }; CZ.zones = $$('[data-zn]', root).map(function (e) { var i = e.dataset.zn, o = Z0[+i] || []; return [e.value.trim(), n('data-zf', i), n('data-zm', i) || 30, n('data-zx', i), o[4] != null ? o[4] : null, o[5] != null ? o[5] : null]; }).filter(function (z) { return z[0]; }); if (a === 'addz') CZ.zones.push(['Nouvelle zone', 400, 30, 0, null, null]); CZ.offerte = Math.max(0, parseInt($('#g-offerte', root).value, 10) || 0); CZ.offerteMax = Math.max(0, parseInt($('#g-offmax', root).value, 10) || 0); IMS.majConfig(CZ); if (a === 'savezones') toast('Zones de livraison enregistrées'); rendre(true); return; }
      if (a === 'addr') { var C2 = IMS.config(); C2.restos.push({ id: 'r' + Date.now().toString(36), nom: 'Nouveau restaurant', ouv: 11, ferm: 23, tel: '', adresse: '' }); IMS.majConfig(C2); rendre(true); return; }
      if (a === 'savepins') { var C3 = IMS.config(), ok = true, vus = {}; $$('[data-pin]', root).forEach(function (e) { var v = e.value.trim(); if (!/^\d{4}$/.test(v) || vus[v]) ok = false; vus[v] = 1; C3.pins[e.dataset.pin] = v; }); if (!ok) return toast('Chaque code : 4 chiffres, tous différents'); IMS.majConfig(C3); toast('Codes d\'accès enregistrés'); return; }
      if (a === 'backup') return copierTexte(IMS.sauvegarde(), 'Sauvegarde copiée : gardez-la dans vos notes ou un e-mail');
      if (a === 'restore') return modale('Restaurer une sauvegarde', '<p class="g-sous">Collez ici le texte de la sauvegarde.</p><textarea class="g-rech" style="max-width:none;min-height:140px;font-family:var(--f-m);font-size:12px" id="r-txt"></textarea><div class="act"><button class="g-btn" data-rest>Restaurer</button></div>', function (v) { v.addEventListener('click', function (e) { if (!e.target.closest('[data-rest]')) return; try { IMS.restaurer($('#r-txt', v).value); v.remove(); toast('Sauvegarde restaurée'); rendre(); } catch (x) { toast('Ce texte n\'est pas une sauvegarde valide'); } }); });
      if (a === 'reinit') { IMS.reinitialiser(); st.dernier = maxNo(); toast('Démo réinitialisée'); rendre(); return; }
    }
    if ((b = e.target.closest('[data-edit]'))) return editerPlat(b.dataset.edit);
    if ((b = e.target.closest('[data-delr]'))) { var Cd = IMS.config(); if (Cd.restos.length > 1) { Cd.restos.splice(+b.dataset.delr, 1); IMS.majConfig(Cd); if (st.resto !== 'tous' && !IMS.RESTOS.some(function (r) { return r.id === st.resto; })) st.resto = 'tous'; toast('Restaurant retiré'); rendre(true); } return; }
    if ((b = e.target.closest('[data-st]'))) return majStatut(+b.dataset.no, b.dataset.st);
    if ((b = e.target.closest('[data-confier]'))) return choisirLivreur(+b.dataset.confier);
    if ((b = e.target.closest('[data-moi]'))) { ecrireS('arz-livreur', b.dataset.moi); rendre(); return; }
    if ((b = e.target.closest('[data-prendre]'))) { confier(+b.dataset.prendre, lireS('arz-livreur', '')); toast(IMS.numero(+b.dataset.prendre) + ' : bonne route ! Le client vous suit sur son téléphone'); rendre(true); return; }
    if ((b = e.target.closest('[data-gps]'))) return partagerPosition();
    if ((b = e.target.closest('[data-delz]'))) { var Cz = IMS.config(); Cz.zones.splice(+b.dataset.delz, 1); IMS.majConfig(Cz); toast('Zone supprimée'); rendre(true); return; }
    if ((b = e.target.closest('[data-livree]'))) { var Lv = toutes(); Lv.forEach(function (c) { if (c.no === +b.dataset.livree) c.livree = Date.now(); }); IMS.enregistrer(Lv); toast(IMS.numero(+b.dataset.livree) + ' livrée'); rendre(true); return; }
    if ((b = e.target.closest('[data-promo]'))) { var po = IMS.promo(); po[b.dataset.promo] = !po[b.dataset.promo]; if (b.dataset.promo === 'banniere' && !po.texte) { var pt = $('#g-ptxt', root); po.texte = pt ? pt.value : ''; } IMS.majPromo(po); toast(b.dataset.promo === 'actif' ? (po.actif ? 'Plat du jour en ligne sur le site' : 'Plat du jour désactivé') : (po.banniere ? 'Bannière affichée sur le site' : 'Bannière retirée')); rendre(true); return; }
    if ((b = e.target.closest('[data-remise]'))) { var pr = IMS.promo(); pr.remise = +b.dataset.remise; IMS.majPromo(pr); rendre(true); return; }
    if ((b = e.target.closest('[data-bon]'))) { var c = toutes().filter(function (x) { return x.no === +b.dataset.bon; })[0]; if (c) voirBon(c, false); return; }
    if ((b = e.target.closest('[data-enc]'))) return encaisser(+b.dataset.enc);
    if ((b = e.target.closest('[data-kds]'))) { st.kds = b.dataset.kds; rendre(true); return; }
    if ((b = e.target.closest('[data-per]'))) { st.per = b.dataset.per; rendre(true); return; }
    if ((b = e.target.closest('[data-cat]'))) { st.cat = b.dataset.cat; rendre(true); return; }
    if ((b = e.target.closest('[data-pause]'))) { var S = IMS.service(); S[b.dataset.pause].pause = !S[b.dataset.pause].pause; IMS.majService(S); toast(IMS.resto(b.dataset.pause).nom + (S[b.dataset.pause].pause ? ' : commandes en ligne en pause' : ' : commandes en ligne rouvertes')); rendre(true); return; }
    if ((b = e.target.closest('[data-att]'))) { var S2 = IMS.service(); S2[b.dataset.att].attente = +b.dataset.m; IMS.majService(S2); rendre(true); return; }
    if ((b = e.target.closest('[data-dispo]'))) { var d = IMS.lire('arz-dispo', {}), id = b.dataset.dispo; if (d[id] === false) delete d[id]; else d[id] = false; IMS.majMenu(d, IMS.lire('arz-prix', {})); rendre(true); return; }
    if ((b = e.target.closest('[data-rk]'))) { var o = IMS.reception(); o[b.dataset.rk] = !o[b.dataset.rk]; IMS.majReception(o); rendre(true); return; }
    if ((b = e.target.closest('[data-rs]'))) { var o2 = IMS.reception(), v = b.dataset.v; o2[b.dataset.rs] = b.dataset.rs === 'copies' ? +v : v; IMS.majReception(o2); rendre(true); return; }
  }
  function copierTexte(t, ok) { try { navigator.clipboard.writeText(t).then(function () { toast(ok); }, function () { toast('Copie impossible sur cet appareil'); }); } catch (e) { toast('Copie impossible sur cet appareil'); } }
  function change(e) {
    var t = e.target;
    if (t.id === 'g-pplat') { var po = IMS.promo(); po.plat = t.value; IMS.majPromo(po); rendre(true); return; }
    if (t.id === 'g-ptxt') { var pt = IMS.promo(); pt.texte = t.value; IMS.majPromo(pt); toast('Bannière mise à jour'); rendre(true); return; }
    if (t.dataset && t.dataset.pid) { var L = IMS.catalogue(), x = L.filter(function (p) { return p.id === t.dataset.pid; })[0], val = Math.max(0, +t.value || 0); if (x) { if (x.tailles) x.tailles[+t.dataset.i][1] = val; else x.prix = val; var P = IMS.lire('arz-prix', {}); delete P[x.id]; IMS.ecrire('arz-prix', P); IMS.majCatalogue(L); toast('Prix mis à jour sur le site'); } return; }
    if (t.id === 'g-qrn') { st.qrN = +t.value; qr(); }
    if (t.id === 'g-qrr') { st.qrR = t.value; qr(); }
  }
  function saisie(e) { if (e.target.id === 'g-qc') { st.qc = e.target.value; var p2 = e.target.selectionStart; rendre(true); var i2 = $('#g-qc', root); if (i2) { i2.focus(); try { i2.setSelectionRange(p2, p2); } catch (x) {} } return; } if (e.target.id === 'g-q') { st.q = e.target.value; var pos = e.target.selectionStart; rendre(true); var i = $('#g-q', root); if (i) { i.focus(); try { i.setSelectionRange(pos, pos); } catch (x) {} } } }

  window.IMSG = { ouvrir: ouvrir, fermer: fermer };
})();
