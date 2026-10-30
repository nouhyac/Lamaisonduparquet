/* =========================================================================
   Banet el Baraka — espace gérant
   Rôles (code PIN) : gérant (tout), cuisine, caisse, livreur.
   Pages : tableau de bord · commandes · cuisine · caisse · livraisons ·
           traiteur (demandes, calendrier, réglages) · carte & self du jour ·
           clients & fidélité · réglages
   Toutes les données sont partagées avec le site client via localStorage
   (préfixe bnb-) et synchronisées en temps réel (BroadcastChannel).
   ========================================================================= */
(function () {
  'use strict';
  const B = window.BNB;
  const { esc } = B;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  // Texte bilingue en ligne : L('français', 'العربية')
  const L = (fr, ar) => (B.langue === 'ar' ? ar : fr);

  B.installer();

  /* ---------------- Icônes ---------------- */
  const svg = (d) => '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>';
  const ICO = {
    tableau: svg('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
    commandes: svg('<path d="M7 3h10l2 4v13H5V7l2-4Z"/><path d="M5 7h14M9 11h6M9 15h4"/>'),
    cuisine: svg('<path d="M5 11a7 7 0 0 1 14 0H5ZM3 14h18M12 4V2"/>'),
    caisse: svg('<rect x="3" y="9" width="18" height="11" rx="2"/><path d="M7 9V4h10v5M7 14h2M11 14h2M15 14h2"/>'),
    livreur: svg('<circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M9 17h5l3-6h-4l-2-3H8m6 3-2 6"/>'),
    traiteur: svg('<path d="M4 21h16M6 21V11h12v10M3 11h18L12 4 3 11Z"/>'),
    carte: svg('<path d="M4 4h12a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4V4Z"/><path d="M8 9h8M8 13h6"/>'),
    clients: svg('<circle cx="9" cy="8" r="3.5"/><path d="M3 20a6 6 0 0 1 12 0M16 4.5a3.5 3.5 0 0 1 0 7M21 20a6 6 0 0 0-4-5.6"/>'),
    reglages: svg('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>'),
    sonOn: svg('<path d="M4 9v6h4l5 4V5L8 9H4ZM17 8a5 5 0 0 1 0 8"/>'),
    sonOff: svg('<path d="M4 9v6h4l5 4V5L8 9H4ZM17 9l5 6M22 9l-5 6"/>'),
    quitter: svg('<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11"/>'),
    fermer: svg('<path d="m6 6 12 12M18 6 6 18"/>'),
    imprimer: svg('<path d="M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7z"/>'),
    wa: svg('<path d="M4 20l1.3-4A8 8 0 1 1 8 18.7L4 20Z"/>'),
    tel: svg('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z"/>'),
    carteMap: svg('<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>')
  };

  /* ---------------- Rôles et pages ---------------- */
  const PAGES = {
    tableau:   { ico: 'tableau',   fr: 'Tableau de bord', ar: 'لوحة القيادة' },
    commandes: { ico: 'commandes', fr: 'Commandes',       ar: 'الطلبات' },
    cuisine:   { ico: 'cuisine',   fr: 'Cuisine',         ar: 'المطبخ' },
    caisse:    { ico: 'caisse',    fr: 'Caisse',          ar: 'الصندوق' },
    livreur:   { ico: 'livreur',   fr: 'Livraisons',      ar: 'التوصيل' },
    traiteur:  { ico: 'traiteur',  fr: 'Traiteur',        ar: 'الممون' },
    carte:     { ico: 'carte',     fr: 'Carte & self',    ar: 'القائمة والخدمة الذاتية' },
    clients:   { ico: 'clients',   fr: 'Clients',         ar: 'الزبائن' },
    reglages:  { ico: 'reglages',  fr: 'Réglages',        ar: 'الإعدادات' }
  };
  const ROLES = {
    gerant:  { fr: 'Gérant',  ar: 'المسيّر', pages: ['tableau', 'commandes', 'cuisine', 'caisse', 'livreur', 'traiteur', 'carte', 'clients', 'reglages'] },
    cuisine: { fr: 'Cuisine', ar: 'المطبخ',  pages: ['cuisine'] },
    caisse:  { fr: 'Caisse',  ar: 'الصندوق', pages: ['caisse', 'commandes'] },
    livreur: { fr: 'Livreur', ar: 'عامل التوصيل', pages: ['livreur'] }
  };

  let session = (() => { try { return JSON.parse(sessionStorage.getItem('bnb-session')) || null; } catch (e) { return null; } })();
  let page = session ? ROLES[session.role].pages[0] : null;
  const ui = { filtreCmd: 'encours', ongletTraiteur: 'demandes', filtreDevis: 'tous', ongletCarte: 'self', calMois: null, calJour: null, catCaisse: 'pizzas', ticket: [], modeCaisse: 'surplace', paiement: 'especes', rechercheClient: '', livreurNom: '' };

  /* ---------------- Données ---------------- */
  const lire = {
    commandes: () => B.lire('commandes', []),
    devis: () => B.lire('devis', []),
    carte: () => B.lire('carte'),
    reglages: () => B.lire('reglages'),
    zones: () => B.lire('zones', []),
    traiteur: () => B.lire('traiteur'),
    clients: () => B.lire('clients', {})
  };
  const duJour = (c) => B.memeJour(c.cree, Date.now()) && !c.zId;
  function majCommande(id, fn) {
    const toutes = lire.commandes(); const c = toutes.find((x) => x.id === id); if (!c) return;
    fn(c); B.ecrire('commandes', toutes); rendre();
  }
  function changerStatut(id, s) {
    majCommande(id, (c) => {
      c.statut = s; c.historique = (c.historique || []).concat({ s, t: Date.now() });
      // une livraison terminée = encaissée en espèces par le livreur
      if (s === 'livree' && !c.paye) { c.paye = true; c.modePaiement = c.modePaiement || 'especes'; }
    });
  }
  function majDevis(id, fn) { const tous = lire.devis(); const d = tous.find((x) => x.id === id); if (!d) return; fn(d); B.ecrire('devis', tous); }

  /* ---------------- Son de notification (Web Audio, sans fichier) ---------------- */
  let audio = null;
  let sonActif = B.lire('son', true);
  function bip() {
    if (!sonActif) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      [0, .18, .36].forEach((dt, i) => {
        const o = audio.createOscillator(), g = audio.createGain();
        o.type = 'sine'; o.frequency.value = [880, 1175, 1568][i];
        g.gain.setValueAtTime(.0001, audio.currentTime + dt);
        g.gain.exponentialRampToValueAtTime(.25, audio.currentTime + dt + .02);
        g.gain.exponentialRampToValueAtTime(.0001, audio.currentTime + dt + .16);
        o.connect(g).connect(audio.destination); o.start(audio.currentTime + dt); o.stop(audio.currentTime + dt + .18);
      });
    } catch (e) { /* audio indisponible */ }
  }
  let connues = new Set(lire.commandes().map((c) => c.id));
  let nouvelles = new Set();
  function verifierNouvelles() {
    const cmds = lire.commandes();
    const n = cmds.filter((c) => !connues.has(c.id));
    n.forEach((c) => { connues.add(c.id); if (c.statut === 'recue') nouvelles.add(c.id); });
    if (n.some((c) => c.statut === 'recue') && session && session.role !== 'livreur') {
      bip(); B.toast(L('Nouvelle commande ', 'طلب جديد ') + n[n.length - 1].id, 'ok');
    }
  }

  /* ---------------- Connexion PIN ---------------- */
  let saisie = '';
  function rendrePin() {
    $('#pinTitre').textContent = L('Espace gérant', 'فضاء المسيّر');
    $('#pinSous').textContent = L('Entrez votre code à 4 chiffres', 'أدخلوا رمزكم المكوّن من 4 أرقام');
    $('#pinLabel').textContent = L('Code PIN', 'الرمز السري');
    $('#pinDemo').textContent = L('Codes de démo : gérant 0328 · cuisine 1111 · caisse 2222 · livreur 3333', 'رموز التجربة: المسيّر 0328 · المطبخ 1111 · الصندوق 2222 · التوصيل 3333');
    $('#pinRetour').textContent = L('← Retour au site', '→ العودة إلى الموقع');
    $('#pinLangue').textContent = B.langue === 'ar' ? 'Français' : 'العربية';
    const touches = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'eff', '0', 'ok'];
    $('#pinClavier').innerHTML = touches.map((k) => k === 'eff'
      ? '<button type="button" class="action" data-touche="eff" aria-label="' + L('Effacer', 'مسح') + '">⌫</button>'
      : k === 'ok' ? '<button type="button" class="action" data-touche="ok">' + L('Valider', 'تأكيد') + '</button>'
      : '<button type="button" data-touche="' + k + '">' + k + '</button>').join('');
    majPoints();
  }
  function majPoints() { $$('#pinPoints span').forEach((s, i) => s.classList.toggle('plein', i < saisie.length)); }
  function essayer() {
    const pins = lire.reglages().pins;
    const role = Object.keys(pins).find((r) => pins[r] === saisie);
    if (!role) {
      $('#pinErreur').textContent = L('Code incorrect', 'رمز خاطئ');
      $('#pinPoints').classList.remove('secoue'); void $('#pinPoints').offsetWidth; $('#pinPoints').classList.add('secoue');
      saisie = ''; majPoints(); return;
    }
    session = { role }; sessionStorage.setItem('bnb-session', JSON.stringify(session));
    saisie = ''; $('#pinErreur').textContent = '';
    try { audio = audio || new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { /* rien */ }
    page = ROLES[role].pages[0];
    demarrer();
  }
  $('#pinClavier').addEventListener('click', (e) => {
    const b = e.target.closest('[data-touche]'); if (!b) return;
    const k = b.dataset.touche;
    if (k === 'eff') saisie = saisie.slice(0, -1);
    else if (k === 'ok') return essayer();
    else if (saisie.length < 4) saisie += k;
    $('#pinErreur').textContent = '';
    majPoints();
    if (saisie.length === 4) setTimeout(essayer, 120);
  });
  document.addEventListener('keydown', (e) => {
    if ($('#ecranPin').hidden) return;
    if (/^\d$/.test(e.key) && saisie.length < 4) { saisie += e.key; majPoints(); if (saisie.length === 4) setTimeout(essayer, 120); }
    if (e.key === 'Backspace') { saisie = saisie.slice(0, -1); majPoints(); }
    if (e.key === 'Enter') essayer();
  });
  $('#pinLangue').addEventListener('click', () => { B.changerLangue(B.langue === 'ar' ? 'fr' : 'ar'); rendrePin(); });

  /* ---------------- Coque ---------------- */
  function demarrer() {
    $('#ecranPin').hidden = true; $('#app').hidden = false;
    rendre(); $('#vue').focus();
  }
  function compteurs() {
    const cmds = lire.commandes();
    return {
      commandes: cmds.filter((c) => c.statut === 'recue').length,
      cuisine: cmds.filter((c) => ['recue', 'preparation'].includes(c.statut)).length,
      livreur: cmds.filter((c) => c.mode === 'livraison' && c.statut === 'prete' && !c.livreur).length,
      traiteur: lire.devis().filter((d) => d.statut === 'nouvelle').length
    };
  }
  function rendreCoque() {
    const r = ROLES[session.role];
    const n = compteurs();
    const bouton = (p) => '<button type="button" data-page="' + p + '"' + (p === page ? ' aria-current="page"' : '') + '>' + ICO[PAGES[p].ico] + '<span>' + esc(B.nom(PAGES[p])) + '</span>' + (n[p] ? '<span class="compte">' + n[p] + '</span>' : '') + '</button>';
    $('#menu').innerHTML = r.pages.map(bouton).join('');
    $('#ongletsBas').innerHTML = r.pages.length > 1 ? r.pages.map(bouton).join('') : '';
    $('#ongletsBas').hidden = r.pages.length < 2;
    $('#roleNom').textContent = B.nom(r);
    $('#vueTitre').textContent = B.nom(PAGES[page]);
    $('#lienSite').textContent = L('Voir le site client ↗', 'عرض موقع الزبائن ↗');
    $('#btnSon').innerHTML = (sonActif ? ICO.sonOn : ICO.sonOff) + '<span class="txt">' + L('Son', 'الصوت') + '</span>';
    $('#btnSon').setAttribute('aria-label', sonActif ? L('Couper le son des notifications', 'إيقاف صوت التنبيهات') : L('Activer le son des notifications', 'تشغيل صوت التنبيهات'));
    $('#btnSon').setAttribute('aria-pressed', String(sonActif));
    $('#btnLangue').innerHTML = '<span lang="' + (B.langue === 'ar' ? 'fr' : 'ar') + '">' + (B.langue === 'ar' ? 'FR' : 'ع') + '</span>';
    $('#btnLangue').setAttribute('aria-label', B.langue === 'ar' ? 'Français' : 'العربية');
    $('#btnQuitter').innerHTML = ICO.quitter + '<span class="txt">' + L('Quitter', 'خروج') + '</span>';
    $('#btnQuitter').setAttribute('aria-label', L('Se déconnecter', 'تسجيل الخروج'));
    document.title = B.nom(PAGES[page]) + ' · Banet el Baraka';
  }
  document.addEventListener('click', (e) => {
    const p = e.target.closest('[data-page]');
    if (p) { page = p.dataset.page; nouvelles.clear(); rendre(); window.scrollTo(0, 0); $('#vue').focus({ preventScroll: true }); }
  });
  $('#btnSon').addEventListener('click', () => { sonActif = !sonActif; B.ecrire('son', sonActif); if (sonActif) bip(); rendreCoque(); });
  $('#btnLangue').addEventListener('click', () => { B.changerLangue(B.langue === 'ar' ? 'fr' : 'ar'); rendre(); });
  $('#btnQuitter').addEventListener('click', () => { sessionStorage.removeItem('bnb-session'); session = null; $('#app').hidden = true; $('#ecranPin').hidden = false; rendrePin(); });
  setInterval(() => { $('#horloge').textContent = B.heure(Date.now()); majMinuteurs(); }, 1000);

  /* Rendu principal (ne pas écraser une saisie en cours) */
  let rendreEnAttente = false;
  function enSaisie() { const a = document.activeElement; return a && $('#vue').contains(a) && /INPUT|TEXTAREA|SELECT/.test(a.tagName) && a.type !== 'checkbox' && a.type !== 'radio'; }
  function rendre(force) {
    if (!session) return;
    if (!force && enSaisie()) { rendreEnAttente = true; return; }
    rendreEnAttente = false;
    rendreCoque();
    const f = VUES[page]; $('#vue').innerHTML = f ? f() : '';
    if (APRES[page]) APRES[page]();
    majMinuteurs();
  }
  document.addEventListener('focusout', () => { setTimeout(() => { if (rendreEnAttente && !enSaisie()) rendre(); }, 50); });

  /* ---------------- Outils de rendu ---------------- */
  const prix = B.prix;
  const statutBadge = (c) => '<span class="statut statut--' + c.statut + '">' + esc(B.libelleStatut(c.statut, c.mode)) + '</span>';
  const modeBadge = (m) => '<span class="mode">' + esc(B.t('mode.' + m)) + '</span>';
  const zoneNom = (id) => { const z = lire.zones().find((x) => x.id === id); return z ? B.nom(z) : ''; };
  const depuis = (ts) => Math.floor((Date.now() - ts) / 60000);
  function vignette(p) { return p && p.photo ? '<img src="' + esc(p.photo) + '" alt="" loading="lazy" width="52" height="52">' : (p ? B.visuelTypo(p) : ''); }
  function adresseTexte(c) { return c.adresse ? [zoneNom(c.zone), c.adresse.cite, c.adresse.batiment, c.adresse.etage ? L('étage ', 'الطابق ') + c.adresse.etage : '', c.adresse.repere].filter(Boolean).join(' · ') : ''; }
  function ligneCmd(l) { return '<li><span>' + l.qte + ' × ' + esc(B.nom(l)) + (l.opts && l.opts.length ? '<small>' + l.opts.map((o) => esc(B.nom(o))).join(', ') + '</small>' : '') + (l.note ? '<small>« ' + esc(l.note) + ' »</small>' : '') + '</span><span>' + prix(B.totalLigne(l)) + '</span></li>'; }
  function lienWaClient(c, texte) { return B.lienWhatsApp(B.telInternational(c.client ? c.client.tel : c.tel), texte); }

  function majMinuteurs() {
    $$('[data-depuis]').forEach((el) => {
      const s = Math.floor((Date.now() - Number(el.dataset.depuis)) / 1000);
      el.textContent = B.pad(Math.floor(s / 60)) + ':' + B.pad(s % 60);
      const bon = el.closest('.bon');
      if (bon) { bon.classList.toggle('retard', s > 15 * 60 && s <= 25 * 60); bon.classList.toggle('urgent', s > 25 * 60); }
    });
  }

  /* =======================================================================
     TABLEAU DE BORD
     ======================================================================= */
  function vueTableau() {
    const cmds = lire.commandes().filter((c) => B.memeJour(c.cree, Date.now()));
    const valides = cmds.filter((c) => c.statut !== 'refusee');
    const ca = valides.reduce((s, c) => s + c.total, 0);
    const attente = cmds.filter((c) => c.statut === 'recue');
    const devisN = lire.devis().filter((d) => d.statut === 'nouvelle');
    const enCours = cmds.filter((c) => ['preparation', 'prete', 'livraison'].includes(c.statut)).length;
    // top plats
    const tops = {};
    valides.forEach((c) => c.lignes.forEach((l) => { tops[l.id] = tops[l.id] || { l, q: 0 }; tops[l.id].q += l.qte; }));
    const top = Object.values(tops).sort((a, b) => b.q - a.q).slice(0, 6);
    const maxQ = top.length ? top[0].q : 1;
    // répartition par mode
    const parMode = ['livraison', 'emporter', 'surplace'].map((m) => [m, valides.filter((c) => c.mode === m).length]);
    return '<div class="kpis">' +
      '<div class="kpi kpi--accent"><span>' + L('Chiffre d’affaires du jour', 'رقم أعمال اليوم') + '</span><strong>' + prix(ca) + '</strong><small>' + L('hors commandes refusées', 'دون الطلبات المرفوضة') + '</small></div>' +
      '<div class="kpi"><span>' + L('Commandes', 'الطلبات') + '</span><strong>' + valides.length + '</strong><small>' + enCours + ' ' + L('en cours', 'قيد التنفيذ') + '</small></div>' +
      '<div class="kpi"><span>' + L('Panier moyen', 'متوسط السلة') + '</span><strong>' + prix(valides.length ? ca / valides.length : 0) + '</strong></div>' +
      '<div class="kpi"><span>' + L('En attente', 'في الانتظار') + '</span><strong>' + attente.length + '</strong><small>' + L('à accepter', 'للقبول') + '</small></div>' +
      '<div class="kpi"><span>' + L('Demandes traiteur', 'طلبات الممون') + '</span><strong>' + devisN.length + '</strong><small>' + L('nouvelles', 'جديدة') + '</small></div></div>' +
      '<div class="grille-g grille-g--dash">' +
      '<section class="carte-g"><header><h2>' + L('Chiffre d’affaires par heure', 'رقم الأعمال حسب الساعة') + '</h2></header>' + graphique(valides) + '</section>' +
      '<section class="carte-g"><header><h2>' + L('Plats les plus vendus aujourd’hui', 'الأطباق الأكثر مبيعًا اليوم') + '</h2></header>' +
      (top.length ? '<ol class="tops">' + top.map((x) => '<li><span>' + esc(B.nom(x.l)) + '</span><span>' + x.q + '</span><span class="jauge"><span style="width:' + (x.q / maxQ * 100) + '%"></span></span></li>').join('') + '</ol>' : '<p class="vide-g">—</p>') +
      '<p class="aide" style="margin-top:12px">' + parMode.map(([m, n]) => esc(B.t('mode.' + m)) + ' : ' + n).join(' · ') + '</p></section>' +
      '<section class="carte-g"><header><h2>' + L('Commandes en attente', 'طلبات في الانتظار') + '</h2><button type="button" class="btn btn--ligne btn--petit" data-page="commandes">' + L('Toutes les commandes', 'كل الطلبات') + '</button></header>' +
      (attente.length ? '<div class="liste-g">' + attente.map(carteCommande).join('') + '</div>' : '<p class="vide-g">' + L('Aucune commande en attente.', 'لا توجد طلبات في الانتظار.') + '</p>') + '</section>' +
      '<section class="carte-g"><header><h2>' + L('Demandes traiteur à traiter', 'طلبات الممون للمعالجة') + '</h2><button type="button" class="btn btn--ligne btn--petit" data-page="traiteur">' + L('Ouvrir le traiteur', 'فتح الممون') + '</button></header>' +
      (devisN.length ? '<div class="liste-g">' + devisN.map(carteDevis).join('') + '</div>' : '<p class="vide-g">' + L('Rien à traiter.', 'لا شيء للمعالجة.') + '</p>') + '</section></div>';
  }
  /* Graphique en barres (une seule série) : CA par heure, 11h → 23h */
  function graphique(cmds) {
    const R = lire.reglages();
    const h0 = Math.min(Math.floor(B.minutes(R.ouverture) / 60), ...cmds.map((c) => new Date(c.cree).getHours()), 11);
    const h1 = Math.max(Math.ceil(B.minutes(R.fermeture) / 60) - 1, ...cmds.map((c) => new Date(c.cree).getHours()));
    const heures = []; for (let h = h0; h <= h1; h++) heures.push(h);
    const val = heures.map((h) => cmds.filter((c) => new Date(c.cree).getHours() === h).reduce((s, c) => s + c.total, 0));
    const nb = heures.map((h) => cmds.filter((c) => new Date(c.cree).getHours() === h).length);
    const max = Math.max(1000, ...val);
    const pas = max > 8000 ? 5000 : max > 4000 ? 2000 : 1000;
    const haut = Math.ceil(max / pas) * pas;
    const W = 640, H = 230, g = 44, b = 24, lb = (W - g) / heures.length;
    let s = '<div class="graph" id="graph"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + L('Chiffre d’affaires par heure', 'رقم الأعمال حسب الساعة') + '">';
    for (let v = 0; v <= haut; v += pas) {
      const y = H - b - (v / haut) * (H - b - 10);
      s += '<line class="grille-l" x1="' + g + '" x2="' + W + '" y1="' + y + '" y2="' + y + '"/><text class="axe" x="' + (g - 6) + '" y="' + (y + 4) + '" text-anchor="end">' + (v >= 1000 ? (v / 1000) + 'k' : v) + '</text>';
    }
    heures.forEach((h, i) => {
      const hb = (val[i] / haut) * (H - b - 10);
      const x = g + i * lb + lb * 0.18, w = lb * 0.64, y = H - b - hb;
      // barre arrondie en haut seulement (4 px), ancrée sur la ligne de base
      const r = Math.min(4, hb, w / 2);
      if (hb > 0) s += '<path class="barre" data-i="' + i + '" d="M' + x + ' ' + (H - b) + 'V' + (y + r) + 'q0 -' + r + ' ' + r + ' -' + r + 'H' + (x + w - r) + 'q' + r + ' 0 ' + r + ' ' + r + 'V' + (H - b) + 'Z"/>';
      s += '<rect data-i="' + i + '" x="' + (g + i * lb) + '" y="0" width="' + lb + '" height="' + (H - b) + '" fill="transparent" class="zone-survol"/>';
      s += '<text class="axe" x="' + (x + w / 2) + '" y="' + (H - 6) + '" text-anchor="middle">' + h + 'h</text>';
    });
    s += '</svg><div class="bulle" id="bulle" role="status"></div></div>';
    s += '<details class="tableau"><summary>' + L('Voir en tableau', 'عرض كجدول') + '</summary><table class="z-table"><thead><tr><th>' + L('Heure', 'الساعة') + '</th><th>' + L('Commandes', 'الطلبات') + '</th><th>' + L('Montant', 'المبلغ') + '</th></tr></thead><tbody>' +
      heures.map((h, i) => '<tr><td>' + h + 'h</td><td>' + nb[i] + '</td><td>' + prix(val[i]) + '</td></tr>').join('') + '</tbody></table></details>';
    graphique.donnees = { heures, val, nb, lb, g, W };
    return s;
  }
  function apresTableau() {
    const gr = $('#graph'); if (!gr) return;
    const bulle = $('#bulle'); const d = graphique.donnees;
    gr.addEventListener('mousemove', (e) => {
      const r = e.target.closest('[data-i]');
      $$('.barre', gr).forEach((x) => x.classList.remove('survol'));
      if (!r) { bulle.classList.remove('visible'); return; }
      const i = Number(r.dataset.i);
      const barre = $('.barre[data-i="' + i + '"]', gr); if (barre) barre.classList.add('survol');
      const box = gr.getBoundingClientRect(); const sc = box.width / d.W;
      bulle.style.left = ((d.g + (i + 0.5) * d.lb) * sc) + 'px';
      bulle.style.top = (e.clientY - box.top) + 'px';
      bulle.textContent = d.heures[i] + 'h · ' + prix(d.val[i]) + ' · ' + d.nb[i] + ' ' + L('cmd', 'طلب');
      bulle.classList.add('visible');
    });
    gr.addEventListener('mouseleave', () => { bulle.classList.remove('visible'); $$('.barre', gr).forEach((x) => x.classList.remove('survol')); });
  }

  /* =======================================================================
     COMMANDES
     ======================================================================= */
  function carteCommande(c) {
    const R = lire.reglages();
    const actions = [];
    if (c.statut === 'recue') {
      actions.push('<button type="button" class="btn btn--vert btn--petit" data-statut="preparation" data-id="' + c.id + '">' + L('Accepter', 'قبول') + '</button>');
      actions.push('<button type="button" class="btn btn--rouge btn--petit" data-statut="refusee" data-id="' + c.id + '">' + L('Refuser', 'رفض') + '</button>');
    }
    if (c.statut === 'preparation') actions.push('<button type="button" class="btn btn--plein btn--petit" data-statut="prete" data-id="' + c.id + '">' + L('Marquer prête', 'جاهز') + '</button>');
    if (c.mode === 'livraison' && ['preparation', 'prete', 'livraison'].includes(c.statut)) {
      actions.push('<select data-livreur="' + c.id + '" aria-label="' + L('Livreur', 'عامل التوصيل') + '"><option value="">' + L('Livreur…', 'عامل التوصيل…') + '</option>' + R.livreurs.map((l) => '<option' + (c.livreur === l ? ' selected' : '') + '>' + esc(l) + '</option>').join('') + '</select>');
      if (c.statut === 'prete' && c.livreur) actions.push('<button type="button" class="btn btn--plein btn--petit" data-statut="livraison" data-id="' + c.id + '">' + L('Partie en livraison', 'خرج للتوصيل') + '</button>');
      if (c.statut === 'livraison') actions.push('<button type="button" class="btn btn--vert btn--petit" data-statut="livree" data-id="' + c.id + '">' + L('Livrée', 'تم التوصيل') + '</button>');
    }
    if (c.mode !== 'livraison' && c.statut === 'prete') actions.push('<button type="button" class="btn btn--vert btn--petit" data-statut="livree" data-id="' + c.id + '">' + B.libelleStatut('livree', c.mode) + '</button>');
    actions.push('<button type="button" class="btn btn--ligne btn--petit" data-ticket="' + c.id + '">' + ICO.imprimer + L('Ticket', 'تذكرة') + '</button>');
    if (c.client && c.client.tel) actions.push('<a class="btn btn--wa btn--petit" target="_blank" rel="noopener" href="' + lienWaClient(c, L('Bonjour ', 'السلام عليكم ') + c.client.nom + L(', ici Banet el Baraka au sujet de votre commande ', '، معكم بنة البركة بخصوص طلبكم ') + c.id + '.') + '">' + ICO.wa + 'WhatsApp</a>');
    return '<article class="cmd' + (nouvelles.has(c.id) && c.statut === 'recue' ? ' nouvelle' : '') + '">' +
      '<div class="cmd__tete"><span class="cmd__id">' + esc(c.id) + '</span><span class="cmd__h">' + B.heure(c.cree) + (c.heure && c.heure !== 'asap' ? ' → ' + esc(c.heure) + (c.demain ? ' (' + L('demain', 'غدًا') + ')' : '') : '') + '</span>' + modeBadge(c.mode) + (c.canal === 'comptoir' ? '<span class="mode">' + L('Comptoir', 'الشباك') + '</span>' : '') + statutBadge(c) + (c.paye ? '<span class="mode">' + L('Payée', 'مدفوع') + '</span>' : '') + '</div>' +
      (c.client && c.client.nom ? '<div class="cmd__client">' + esc(c.client.nom) + (c.client.tel ? ' · <a href="tel:' + esc(c.client.tel.replace(/\s/g, '')) + '" dir="ltr">' + esc(c.client.tel) + '</a>' : '') + (c.livreur ? ' · ' + L('Livreur : ', 'التوصيل: ') + esc(c.livreur) : '') + '</div>' : '') +
      (c.adresse ? '<div class="cmd__adr">' + esc(adresseTexte(c)) + '</div>' : '') +
      (c.remarque ? '<div class="remarque">' + esc(c.remarque) + '</div>' : '') +
      '<ul class="cmd__lignes">' + c.lignes.map(ligneCmd).join('') + (c.frais ? '<li><span>' + L('Livraison', 'التوصيل') + '</span><span>' + prix(c.frais) + '</span></li>' : '') + '</ul>' +
      '<div class="cmd__total"><span>' + L('Total', 'المجموع') + '</span><span>' + prix(c.total) + '</span></div>' +
      '<div class="cmd__actions">' + actions.join('') + '</div></article>';
  }
  function vueCommandes() {
    const toutes = lire.commandes().filter((c) => B.memeJour(c.cree, Date.now()) || !['livree', 'refusee'].includes(c.statut)).sort((a, b) => b.cree - a.cree);
    const groupes = {
      encours: toutes.filter((c) => !['livree', 'refusee'].includes(c.statut)),
      livraison: toutes.filter((c) => c.mode === 'livraison' && !['livree', 'refusee'].includes(c.statut)),
      terminees: toutes.filter((c) => ['livree', 'refusee'].includes(c.statut)),
      toutes
    };
    const noms = { encours: L('En cours', 'قيد التنفيذ'), livraison: L('Livraisons', 'التوصيلات'), terminees: L('Terminées', 'منتهية'), toutes: L('Toutes', 'الكل') };
    const liste = groupes[ui.filtreCmd];
    return '<div class="puces-g" role="group" aria-label="' + L('Filtrer', 'تصفية') + '">' + Object.keys(noms).map((k) => '<button type="button" data-filtre-cmd="' + k + '" aria-pressed="' + (ui.filtreCmd === k) + '">' + noms[k] + '<span class="n">' + groupes[k].length + '</span></button>').join('') + '</div>' +
      (liste.length ? '<div class="liste-g liste-g--2">' + liste.map(carteCommande).join('') + '</div>' : '<p class="vide-g">' + L('Aucune commande.', 'لا توجد طلبات.') + '</p>');
  }

  /* Ticket 80 mm */
  function imprimerTicket(id) {
    const c = lire.commandes().find((x) => x.id === id); if (!c) return;
    const R = lire.reglages();
    $('#ticket').innerHTML = '<div class="logo-t">' + B.logoSVG() + '</div><h2>BANET EL BARAKA</h2><p class="c">' + esc(B.nom(R, 'adresse')) + '<br>' + esc(R.tel) + '</p><hr>' +
      '<p class="gros">' + esc(c.id) + ' · ' + esc(B.t('mode.' + c.mode)) + '</p><p>' + new Date(c.cree).toLocaleString('fr-FR') + (c.heure !== 'asap' && c.heure ? ' → ' + esc(c.heure) : '') + '</p>' +
      (c.client && c.client.nom ? '<p>' + esc(c.client.nom) + ' ' + esc(c.client.tel || '') + '</p>' : '') + (c.adresse ? '<p>' + esc(adresseTexte(c)) + '</p>' : '') + '<hr><table>' +
      c.lignes.map((l) => '<tr><td>' + l.qte + ' x ' + esc(l.fr) + (l.opts && l.opts.length ? '<br>  + ' + l.opts.map((o) => esc(o.fr)).join(', ') : '') + (l.note ? '<br>  « ' + esc(l.note) + ' »' : '') + '</td><td>' + B.totalLigne(l) + '</td></tr>').join('') +
      (c.frais ? '<tr><td>Livraison</td><td>' + c.frais + '</td></tr>' : '') + '</table><hr><p class="gros">TOTAL ' + c.total + ' DA</p>' +
      (c.remarque ? '<p>Note : ' + esc(c.remarque) + '</p>' : '') + '<p>' + (c.paye ? 'Payé (' + esc(c.modePaiement) + ')' : 'À payer ' + (c.mode === 'livraison' ? 'à la livraison' : 'au comptoir')) + '</p><hr><p class="c">Merci et bon appétit !<br>بالصحة والهناء</p>';
    document.body.classList.add('imprime-ticket');
    const fin = () => { document.body.classList.remove('imprime-ticket'); window.removeEventListener('afterprint', fin); };
    window.addEventListener('afterprint', fin);
    window.print(); setTimeout(fin, 1000);
  }

  /* =======================================================================
     CUISINE
     ======================================================================= */
  function bon(c, action) {
    return '<article class="bon"><div class="bon__tete"><span class="bon__id">' + esc(c.id) + '</span>' + modeBadge(c.mode) + '<span class="minuteur" data-depuis="' + c.cree + '" aria-label="' + L('Temps écoulé', 'الوقت المنقضي') + '"></span></div>' +
      (c.heure && c.heure !== 'asap' ? '<p class="remarque">' + L('Programmée pour ', 'مبرمج على ') + esc(c.heure) + '</p>' : '') +
      '<ul>' + c.lignes.map((l) => '<li><b>' + l.qte + '</b><span>' + esc(B.nom(l)) + (l.opts && l.opts.length ? '<small>+ ' + l.opts.map((o) => esc(B.nom(o))).join(', ') + '</small>' : '') + (l.note ? '<small>« ' + esc(l.note) + ' »</small>' : '') + '</span></li>').join('') + '</ul>' +
      (c.remarque ? '<p class="remarque">' + esc(c.remarque) + '</p>' : '') + action + '</article>';
  }
  function vueCuisine() {
    const cmds = lire.commandes().filter((c) => ['recue', 'preparation', 'prete'].includes(c.statut)).sort((a, b) => a.cree - b.cree);
    const col = (titre, liste, f) => '<section class="colonne"><h2>' + titre + '<span>' + liste.length + '</span></h2>' + (liste.length ? liste.map(f).join('') : '<p class="vide-g">—</p>') + '</section>';
    return '<div class="cuisine">' +
      col(L('Nouvelles', 'جديدة'), cmds.filter((c) => c.statut === 'recue'), (c) => bon(c, '<button type="button" class="btn btn--plein" data-statut="preparation" data-id="' + c.id + '">' + L('Lancer la préparation', 'بدء التحضير') + '</button>')) +
      col(L('En préparation', 'قيد التحضير'), cmds.filter((c) => c.statut === 'preparation'), (c) => bon(c, '<button type="button" class="btn btn--vert btn--grand" data-statut="prete" data-id="' + c.id + '">' + L('Prêt', 'جاهز') + ' ✓</button>')) +
      col(L('Prêtes', 'جاهزة'), cmds.filter((c) => c.statut === 'prete'), (c) => bon(c, c.mode === 'livraison'
        ? '<p class="info-g">' + (c.livreur ? L('Livreur : ', 'عامل التوصيل: ') + esc(c.livreur) : L('En attente d’un livreur', 'في انتظار عامل التوصيل')) + '</p>'
        : '<button type="button" class="btn btn--ligne" data-statut="livree" data-id="' + c.id + '">' + B.libelleStatut('livree', c.mode) + '</button>')) +
      '</div>';
  }

  /* =======================================================================
     CAISSE
     ======================================================================= */
  function vueCaisse() {
    const carte = lire.carte();
    const plats = carte.plats.filter((p) => p.cat === ui.catCaisse);
    const total = ui.ticket.reduce((s, l) => s + l.qte * l.prix, 0);
    const cmds = lire.commandes();
    const aEncaisser = cmds.filter((c) => !c.paye && c.statut !== 'refusee' && c.mode !== 'livraison' && B.memeJour(c.cree, Date.now()));
    const payees = cmds.filter((c) => c.paye && !c.zId && c.statut !== 'refusee');
    const modes = { especes: L('Espèces', 'نقدًا'), tpe: L('Carte (TPE)', 'بطاقة (TPE)'), baridimob: 'BaridiMob' };
    const parMode = Object.keys(modes).map((m) => [m, payees.filter((c) => (c.modePaiement || 'especes') === m)]);
    const totalZ = payees.reduce((s, c) => s + c.total, 0);
    const clotures = B.lire('clotures', []);
    return '<div class="caisse"><section class="carte-g"><header><h2>' + L('Commande au comptoir', 'طلب عند الشباك') + '</h2></header>' +
      '<div class="puces-g">' + carte.categories.map((c) => '<button type="button" data-cat-caisse="' + c.id + '" aria-pressed="' + (ui.catCaisse === c.id) + '">' + esc(B.nom(c)) + '</button>').join('') + '</div>' +
      '<div class="produits">' + plats.map((p) => { const ok = p.dispo && p.self !== false; return '<button type="button" class="produit" data-ajout="' + p.id + '"' + (ok ? '' : ' disabled') + '>' + (p.photo ? '<img src="' + esc(p.photo) + '" alt="" loading="lazy" width="120" height="90">' : '<span class="vignette">' + esc(B.nom(p)) + '</span>') + '<span>' + esc(B.nom(p)) + '</span><strong>' + prix(p.prix) + '</strong></button>'; }).join('') + '</div></section>' +
      '<div class="caisse__ticket grille-g"><section class="carte-g ticket-caisse"><header><h2>' + L('Ticket en cours', 'التذكرة الحالية') + '</h2>' + (ui.ticket.length ? '<button type="button" class="btn btn--ligne btn--petit" data-vider>' + L('Vider', 'إفراغ') + '</button>' : '') + '</header>' +
      (ui.ticket.length ? '<ul>' + ui.ticket.map((l, i) => '<li><span>' + esc(B.nom(l)) + '</span><span class="quantite quantite--petit"><button type="button" data-tq="-1" data-i="' + i + '" aria-label="' + L('Retirer un', 'إنقاص واحد') + '">−</button><span>' + l.qte + '</span><button type="button" data-tq="1" data-i="' + i + '" aria-label="' + L('Ajouter un', 'إضافة واحد') + '">+</button></span><strong>' + prix(l.qte * l.prix) + '</strong></li>').join('') + '</ul>' : '<p class="vide-g">' + L('Touchez un plat pour l’ajouter.', 'المسوا طبقًا لإضافته.') + '</p>') +
      '<div class="puces-g" style="margin-top:10px">' + ['surplace', 'emporter'].map((m) => '<button type="button" data-mode-caisse="' + m + '" aria-pressed="' + (ui.modeCaisse === m) + '">' + esc(B.t('mode.' + m)) + '</button>').join('') + '</div>' +
      '<div class="paiements" role="radiogroup" aria-label="' + L('Mode de paiement', 'طريقة الدفع') + '">' + Object.keys(modes).map((m) => '<label><input type="radio" name="paiement" value="' + m + '"' + (ui.paiement === m ? ' checked' : '') + '><span>' + modes[m] + '</span></label>').join('') + '</div>' +
      '<label class="champ"><span>' + L('Prénom du client (facultatif)', 'اسم الزبون (اختياري)') + '</span><input id="caisseNom" autocomplete="off"></label>' +
      '<div class="cmd__total" style="margin-top:12px;font-size:20px"><span>' + L('Total', 'المجموع') + '</span><span>' + prix(total) + '</span></div>' +
      '<button type="button" class="btn btn--or btn--grand btn--bloc" style="margin-top:10px" data-encaisser' + (ui.ticket.length ? '' : ' disabled') + '>' + L('Encaisser et envoyer en cuisine', 'تحصيل وإرسال إلى المطبخ') + '</button></section>' +
      '<section class="carte-g"><header><h2>' + L('À encaisser', 'للتحصيل') + '</h2></header>' + (aEncaisser.length ? '<div class="liste-g">' + aEncaisser.map((c) => '<div class="plat-g" style="grid-template-columns:1fr auto"><div><div class="plat-g__nom">' + esc(c.id) + ' · ' + esc(c.client.nom || '') + '</div><div class="plat-g__meta">' + esc(B.t('mode.' + c.mode)) + ' · ' + esc(B.libelleStatut(c.statut, c.mode)) + '</div></div><button type="button" class="btn btn--plein btn--petit" data-encaisser-cmd="' + c.id + '">' + prix(c.total) + '</button></div>').join('') + '</div>' : '<p class="vide-g">' + L('Tout est encaissé.', 'تم تحصيل كل شيء.') + '</p>') + '</section>' +
      '<section class="carte-g"><header><h2>' + L('Clôture de journée (Z)', 'إغلاق اليوم (Z)') + '</h2></header><table class="z-table"><thead><tr><th>' + L('Mode', 'الطريقة') + '</th><th>' + L('Nb', 'العدد') + '</th><th>' + L('Montant', 'المبلغ') + '</th></tr></thead><tbody>' +
      parMode.map(([m, l]) => '<tr><td>' + modes[m] + '</td><td>' + l.length + '</td><td>' + prix(l.reduce((s, c) => s + c.total, 0)) + '</td></tr>').join('') +
      '<tr><td>' + L('dont livraisons', 'منها التوصيل') + '</td><td>' + payees.filter((c) => c.mode === 'livraison').length + '</td><td>' + prix(payees.filter((c) => c.mode === 'livraison').reduce((s, c) => s + c.total, 0)) + '</td></tr>' +
      '<tr><td>' + L('dont comptoir', 'منها الشباك') + '</td><td>' + payees.filter((c) => c.canal === 'comptoir').length + '</td><td>' + prix(payees.filter((c) => c.canal === 'comptoir').reduce((s, c) => s + c.total, 0)) + '</td></tr>' +
      '</tbody><tfoot><tr><td>' + L('Total encaissé', 'مجموع المحصّل') + '</td><td>' + payees.length + '</td><td>' + prix(totalZ) + '</td></tr></tfoot></table>' +
      '<button type="button" class="btn btn--sombre btn--bloc" style="margin-top:12px" data-cloture' + (payees.length ? '' : ' disabled') + '>' + L('Clôturer la journée (ticket Z)', 'إغلاق اليوم (تذكرة Z)') + '</button>' +
      (clotures.length ? '<p class="aide" style="margin-top:10px">' + L('Dernières clôtures : ', 'آخر الإغلاقات: ') + clotures.slice(-3).reverse().map((z) => esc(z.id) + ' (' + new Date(z.t).toLocaleDateString('fr-FR') + ' · ' + prix(z.total) + ')').join(' · ') + '</p>' : '') +
      '</section></div></div>';
  }
  function encaisser() {
    if (!ui.ticket.length) return;
    const nom = ($('#caisseNom') || {}).value || '';
    const lignes = ui.ticket.map((l) => ({ id: l.id, fr: l.fr, ar: l.ar, prix: l.prix, qte: l.qte, opts: [], note: '' }));
    const total = lignes.reduce((s, l) => s + l.qte * l.prix, 0);
    const c = { id: B.prochainNumero('commande'), cree: Date.now(), mode: ui.modeCaisse, canal: 'comptoir', client: { nom: nom.trim(), tel: '' }, zone: '', adresse: null, heure: 'asap', lignes, sousTotal: total, frais: 0, total, statut: 'recue', historique: [{ s: 'recue', t: Date.now() }], livreur: '', remarque: '', paye: true, modePaiement: ui.paiement, zId: '' };
    const toutes = lire.commandes(); toutes.push(c); connues.add(c.id); B.ecrire('commandes', toutes);
    ui.ticket = [];
    B.toast(L('Encaissé : ', 'تم التحصيل: ') + c.id + ' · ' + prix(total), 'ok');
    rendre(true);
  }
  function cloturer() {
    if (!confirm(L('Clôturer la journée ? Les ventes encaissées seront archivées dans un ticket Z.', 'إغلاق اليوم؟ ستُؤرشف المبيعات المحصّلة في تذكرة Z.'))) return;
    const toutes = lire.commandes();
    const payees = toutes.filter((c) => c.paye && !c.zId && c.statut !== 'refusee');
    const clotures = B.lire('clotures', []);
    const id = 'Z-' + String(clotures.length + 1).padStart(3, '0');
    const parMode = {}; payees.forEach((c) => { const m = c.modePaiement || 'especes'; parMode[m] = (parMode[m] || 0) + c.total; });
    clotures.push({ id, t: Date.now(), nb: payees.length, total: payees.reduce((s, c) => s + c.total, 0), parMode });
    payees.forEach((c) => { c.zId = id; });
    B.ecrire('clotures', clotures); B.ecrire('commandes', toutes);
    B.toast(L('Journée clôturée : ', 'تم إغلاق اليوم: ') + id, 'ok');
    rendre(true);
  }

  /* =======================================================================
     LIVREUR
     ======================================================================= */
  function vueLivreur() {
    const R = lire.reglages();
    if (!ui.livreurNom || !R.livreurs.includes(ui.livreurNom)) ui.livreurNom = R.livreurs[0] || '';
    const cmds = lire.commandes().filter((c) => c.mode === 'livraison');
    const mes = cmds.filter((c) => c.livreur === ui.livreurNom && ['preparation', 'prete', 'livraison'].includes(c.statut));
    const aPrendre = cmds.filter((c) => !c.livreur && ['preparation', 'prete'].includes(c.statut));
    const livrees = cmds.filter((c) => c.livreur === ui.livreurNom && c.statut === 'livree' && B.memeJour(c.cree, Date.now()));
    const course = (c, mine) => {
      const q = encodeURIComponent([c.adresse && c.adresse.cite, zoneNom(c.zone), 'Oran'].filter(Boolean).join(', '));
      return '<article class="cmd"><div class="cmd__tete"><span class="cmd__id">' + esc(c.id) + '</span>' + statutBadge(c) + '<span class="cmd__h">' + B.heure(c.cree) + '</span></div>' +
        '<div class="cmd__client">' + esc(c.client.nom) + ' · <span dir="ltr">' + esc(c.client.tel) + '</span></div><div class="cmd__adr">' + esc(adresseTexte(c)) + '</div>' +
        (c.remarque ? '<div class="remarque">' + esc(c.remarque) + '</div>' : '') +
        '<div class="cmd__total"><span>' + L('À encaisser', 'للتحصيل') + '</span><span>' + prix(c.total) + '</span></div><div class="cmd__actions">' +
        (mine
          ? '<a class="btn btn--ligne btn--petit" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&origin=' + R.lat + ',' + R.lng + '&destination=' + q + '">' + ICO.carteMap + L('Itinéraire', 'المسار') + '</a>' +
            '<a class="btn btn--ligne btn--petit" href="tel:' + esc(c.client.tel.replace(/\s/g, '')) + '">' + ICO.tel + L('Appeler', 'اتصال') + '</a>' +
            (c.statut === 'prete' ? '<button type="button" class="btn btn--plein btn--petit" data-statut="livraison" data-id="' + c.id + '">' + L('Je pars', 'انطلقت') + '</button>' : '') +
            (c.statut === 'livraison' ? '<button type="button" class="btn btn--vert btn--petit" data-statut="livree" data-id="' + c.id + '">' + L('Livrée', 'تم التوصيل') + ' ✓</button>' : '') +
            (c.statut === 'preparation' ? '<span class="aide">' + L('En cuisine…', 'في المطبخ…') + '</span>' : '')
          : '<button type="button" class="btn btn--plein btn--petit" data-prendre="' + c.id + '">' + L('Je prends cette course', 'آخذ هذه التوصيلة') + '</button>') +
        '</div></article>';
    };
    return '<div class="barre-outils"><label class="champ" style="flex-direction:row;align-items:center;gap:10px"><span>' + L('Je suis', 'أنا') + '</span><select id="choixLivreur" class="input" style="max-width:200px">' + R.livreurs.map((l) => '<option' + (l === ui.livreurNom ? ' selected' : '') + '>' + esc(l) + '</option>').join('') + '</select></label>' +
      '<span class="aide">' + livrees.length + ' ' + L('livraisons aujourd’hui', 'توصيلة اليوم') + ' · ' + prix(livrees.reduce((s, c) => s + c.total, 0)) + ' ' + L('encaissés', 'محصّلة') + '</span></div>' +
      '<div class="grille-g grille-g--2"><section class="carte-g"><header><h2>' + L('Mes courses', 'توصيلاتي') + '</h2></header>' + (mes.length ? '<div class="liste-g">' + mes.map((c) => course(c, true)).join('') + '</div>' : '<p class="vide-g">' + L('Aucune course pour le moment.', 'لا توجد توصيلات حاليًا.') + '</p>') + '</section>' +
      '<section class="carte-g"><header><h2>' + L('À prendre', 'متاحة') + '</h2></header>' + (aPrendre.length ? '<div class="liste-g">' + aPrendre.map((c) => course(c, false)).join('') + '</div>' : '<p class="vide-g">' + L('Rien à prendre.', 'لا شيء متاح.') + '</p>') + '</section></div>';
  }

  /* =======================================================================
     TRAITEUR
     ======================================================================= */
  const STATUTS_DEVIS = [
    ['nouvelle', 'Nouvelle', 'جديد'], ['devis', 'Devis envoyé', 'تم إرسال العرض'], ['acompte', 'Acompte reçu', 'تم استلام العربون'],
    ['confirmee', 'Confirmée', 'مؤكد'], ['realisee', 'Réalisée', 'منجز'], ['annulee', 'Annulée', 'ملغى']
  ];
  const nomStatutDevis = (s) => { const x = STATUTS_DEVIS.find((y) => y[0] === s); return x ? L(x[1], x[2]) : s; };
  function carteDevis(d) {
    const T = lire.traiteur(); const r = B.calculDevis(d, T);
    const evt = T.evenements.find((e) => e.id === d.type);
    return '<button type="button" class="dem" data-devis="' + d.id + '"><span class="dem__id">' + esc(d.id) + ' · ' + esc(B.nom(evt)) + '</span><span class="statut statut--' + d.statut + '">' + esc(nomStatutDevis(d.statut)) + '</span>' +
      '<span class="dem__info">' + esc(d.nom) + ' · ' + esc(B.dateCourte(d.date)) + ' · ' + d.invites + ' ' + L('invités', 'مدعو') + ' · ' + (d.mode === 'formule' ? esc(B.nom(T.formules.find((f) => f.id === d.formule) || {})) : L('Plateaux', 'صوانٍ')) + '</span>' +
      '<span class="dem__prix">' + prix(r.final) + (d.prixFinal ? ' (' + L('final', 'نهائي') + ')' : '') + '</span>' + (d.acompteRecu ? '<span class="aide">' + L('Acompte ', 'عربون ') + prix(d.acompteRecu) + '</span>' : '') + '</button>';
  }
  function vueTraiteur() {
    const onglets = { demandes: L('Demandes', 'الطلبات'), calendrier: L('Calendrier', 'الرزنامة'), reglages: L('Formules & réglages', 'الصيغ والإعدادات') };
    let h = '<div class="puces-g">' + Object.keys(onglets).map((k) => '<button type="button" data-onglet-tr="' + k + '" aria-pressed="' + (ui.ongletTraiteur === k) + '">' + onglets[k] + '</button>').join('') + '</div>';
    if (ui.ongletTraiteur === 'demandes') {
      const tous = lire.devis().sort((a, b) => a.date.localeCompare(b.date));
      const liste = ui.filtreDevis === 'tous' ? tous : tous.filter((d) => d.statut === ui.filtreDevis);
      h += '<div class="puces-g" role="group" aria-label="' + L('Filtrer par statut', 'تصفية حسب الحالة') + '"><button type="button" data-filtre-devis="tous" aria-pressed="' + (ui.filtreDevis === 'tous') + '">' + L('Toutes', 'الكل') + '<span class="n">' + tous.length + '</span></button>' +
        STATUTS_DEVIS.map(([s]) => '<button type="button" data-filtre-devis="' + s + '" aria-pressed="' + (ui.filtreDevis === s) + '">' + esc(nomStatutDevis(s)) + '<span class="n">' + tous.filter((d) => d.statut === s).length + '</span></button>').join('') + '</div>' +
        (liste.length ? '<div class="liste-g liste-g--2">' + liste.map(carteDevis).join('') + '</div>' : '<p class="vide-g">' + L('Aucune demande.', 'لا توجد طلبات.') + '</p>');
    }
    if (ui.ongletTraiteur === 'calendrier') h += vueCalendrier();
    if (ui.ongletTraiteur === 'reglages') h += vueReglagesTraiteur();
    return h;
  }
  function vueCalendrier() {
    const T = lire.traiteur();
    if (!ui.calMois) { const d = new Date(); ui.calMois = new Date(d.getFullYear(), d.getMonth(), 1); }
    const an = ui.calMois.getFullYear(), mo = ui.calMois.getMonth();
    const decal = (new Date(an, mo, 1).getDay() + 6) % 7;
    const nbJ = new Date(an, mo + 1, 0).getDate();
    const devis = lire.devis().filter((d) => d.statut !== 'annulee');
    const couverts = B.couvertsParJour();
    const loc = B.langue === 'ar' ? 'ar-DZ-u-nu-latn' : 'fr-FR';
    const auj = B.isoJour(Date.now());
    let cases = '';
    for (let i = 0; i < 7; i++) cases += '<span class="cal-g__jsem" aria-hidden="true">' + new Date(2024, 0, 1 + i).toLocaleDateString(loc, { weekday: 'short' }) + '</span>';
    for (let i = 0; i < decal; i++) cases += '<span class="cal-g__jour hors" aria-hidden="true"></span>';
    for (let j = 1; j <= nbJ; j++) {
      const iso = an + '-' + B.pad(mo + 1) + '-' + B.pad(j);
      const c = couverts[iso] || 0; const evs = devis.filter((d) => d.date === iso);
      const cls = [iso === auj ? 'auj' : '', c > T.capacite ? 'plein' : '', (T.datesBloquees || []).includes(iso) ? 'bloque' : '', ui.calJour === iso ? 'sel' : ''].join(' ');
      cases += '<button type="button" class="cal-g__jour ' + cls + '" data-cal-jour="' + iso + '" aria-label="' + esc(B.dateLongue(iso) + (c ? ' · ' + c + ' ' + L('couverts', 'طبق') : '')) + '"><span class="j">' + j + '</span>' +
        (c ? '<span class="c">' + c + ' ' + L('couv.', 'ط.') + '</span>' : '') + evs.slice(0, 2).map((d) => '<span class="e">' + esc(B.nom(T.evenements.find((e) => e.id === d.type))) + '</span>').join('') + '</button>';
    }
    const depasses = Object.keys(couverts).filter((k) => couverts[k] > T.capacite && k >= auj);
    let detail = '';
    if (ui.calJour) {
      const evs = devis.filter((d) => d.date === ui.calJour); const bloque = (T.datesBloquees || []).includes(ui.calJour);
      detail = '<section class="carte-g section-g"><header><h2>' + esc(B.dateLongue(ui.calJour)) + '</h2><button type="button" class="btn btn--ligne btn--petit" data-bloquer="' + ui.calJour + '">' + (bloque ? L('Débloquer cette date', 'إلغاء حجب هذا التاريخ') : L('Bloquer cette date', 'حجب هذا التاريخ')) + '</button></header>' +
        '<p class="aide">' + (couverts[ui.calJour] || 0) + ' / ' + T.capacite + ' ' + L('couverts', 'طبق') + (bloque ? ' · ' + L('date bloquée (non proposée aux clients)', 'تاريخ محجوب (غير معروض للزبائن)') : '') + '</p>' +
        (evs.length ? '<div class="liste-g" style="margin-top:10px">' + evs.map(carteDevis).join('') + '</div>' : '<p class="vide-g">' + L('Aucun événement ce jour-là.', 'لا توجد مناسبات في هذا اليوم.') + '</p>') + '</section>';
    }
    return (depasses.length ? '<p class="alerte-g" style="margin-bottom:12px">' + L('Capacité dépassée', 'تجاوز الطاقة') + ' (' + T.capacite + ') : ' + depasses.map((k) => esc(B.dateCourte(k)) + ' (' + couverts[k] + ')').join(', ') + '</p>' : '') +
      '<section class="carte-g"><header><button type="button" class="btn btn--ligne btn--petit" data-cal-g="-1" aria-label="' + L('Mois précédent', 'الشهر السابق') + '">' + (B.langue === 'ar' ? '›' : '‹') + '</button><h2 style="text-transform:capitalize">' + esc(new Date(an, mo, 1).toLocaleDateString(loc, { month: 'long', year: 'numeric' })) + '</h2><button type="button" class="btn btn--ligne btn--petit" data-cal-g="1" aria-label="' + L('Mois suivant', 'الشهر التالي') + '">' + (B.langue === 'ar' ? '‹' : '›') + '</button></header>' +
      '<div class="cal-g">' + cases + '</div><p class="aide" style="margin-top:10px">' + L('Capacité journalière : ', 'الطاقة اليومية: ') + T.capacite + ' ' + L('couverts. Touchez un jour pour voir le détail ou le bloquer.', 'طبق. المسوا يومًا لعرض التفاصيل أو حجبه.') + '</p></section>' + detail;
  }
  function vueReglagesTraiteur() {
    const T = lire.traiteur();
    return '<form id="formTraiteur" class="grille-g"><p class="info-g">' + L('Formules et prix donnés en exemple : à remplacer par les vôtres. Le contenu ne doit citer que des plats de votre carte.', 'الصيغ والأسعار مقترحة كمثال: استبدلوها بصيغكم. يجب ألا يذكر المحتوى إلا أطباق قائمتكم.') + '</p>' +
      '<div class="grille-g grille-g--3">' + T.formules.map((f, i) => '<section class="carte-g formulaire"><h2>' + L('Formule ', 'صيغة ') + (i + 1) + '</h2>' +
        '<label class="champ"><span>' + L('Nom (FR)', 'الاسم (فرنسية)') + '</span><input name="f' + i + 'fr" value="' + esc(f.fr) + '"></label>' +
        '<label class="champ"><span>' + L('Nom (AR)', 'الاسم (عربية)') + '</span><input name="f' + i + 'ar" value="' + esc(f.ar) + '" dir="rtl"></label>' +
        '<label class="champ"><span>' + L('Prix par personne (DA)', 'السعر للشخص (دج)') + '</span><input name="f' + i + 'prix" type="number" min="0" step="50" value="' + f.prix + '"></label>' +
        '<label class="champ"><span>' + L('Contenu FR (une ligne par plat)', 'المحتوى بالفرنسية (سطر لكل طبق)') + '</span><textarea name="f' + i + 'cfr" rows="6">' + esc(f.contenu.map((c) => c.fr).join('\n')) + '</textarea></label>' +
        '<label class="champ"><span>' + L('Contenu AR (une ligne par plat)', 'المحتوى بالعربية (سطر لكل طبق)') + '</span><textarea name="f' + i + 'car" rows="6" dir="rtl">' + esc(f.contenu.map((c) => c.ar).join('\n')) + '</textarea></label></section>').join('') + '</div>' +
      '<section class="carte-g"><h2>' + L('Services (à confirmer avec le client)', 'الخدمات (تُؤكَّد مع الزبون)') + '</h2><div class="defile"><table class="tableau-g"><thead><tr><th>' + L('Service', 'الخدمة') + '</th><th>' + L('Calcul', 'الحساب') + '</th><th>' + L('Prix (DA)', 'السعر (دج)') + '</th></tr></thead><tbody>' +
        T.options.map((o, i) => '<tr><td>' + esc(B.nom(o)) + '</td><td>' + (o.mode === 'pers' ? L('par personne', 'للشخص') : o.mode === 'serveur' ? L('par serveur, 1 pour ', 'للنادل، 1 لكل ') + o.ratio : L('forfait', 'جزافي')) + '</td><td><input name="o' + i + '" type="number" min="0" step="50" value="' + o.prix + '" aria-label="' + esc(B.nom(o)) + '"></td></tr>').join('') + '</tbody></table></div></section>' +
      '<section class="carte-g formulaire formulaire--2"><h2 class="large">' + L('Conditions', 'الشروط') + '</h2>' +
        '<label class="champ"><span>' + L('Acompte (%)', 'العربون (٪)') + '</span><input name="acompte" type="number" min="0" max="100" value="' + T.acompte + '"></label>' +
        '<label class="champ"><span>' + L('Capacité journalière (couverts)', 'الطاقة اليومية (طبق)') + '</span><input name="capacite" type="number" min="10" step="10" value="' + T.capacite + '"></label>' +
        '<label class="champ"><span>' + L('Délai minimum (jours)', 'المهلة الدنيا (أيام)') + '</span><input name="delaiMin" type="number" min="0" value="' + T.delaiMin + '"></label>' +
        T.remises.map((r, i) => '<label class="champ"><span>' + L('Remise ', 'تخفيض ') + (i + 1) + ' : ' + L('dès (personnes) / %', 'ابتداءً من (شخص) / ٪') + '</span><span style="display:flex;gap:8px"><input name="r' + i + 'des" type="number" min="0" value="' + r.des + '" aria-label="' + L('Seuil', 'العتبة') + '"><input name="r' + i + 'pct" type="number" min="0" max="50" value="' + r.pct + '" aria-label="%"></span></label>').join('') +
        '<p class="aide large">' + L('Dates bloquées : ', 'التواريخ المحجوبة: ') + ((T.datesBloquees || []).length ? T.datesBloquees.map((d) => esc(B.dateCourte(d))).join(', ') : L('aucune (bloquez une date depuis le calendrier)', 'لا شيء (احجبوا تاريخًا من الرزنامة)')) + '</p></section>' +
      '<div><button type="submit" class="btn btn--plein btn--grand">' + L('Enregistrer', 'حفظ') + '</button></div></form>';
  }
  function enregistrerTraiteur(form) {
    const T = lire.traiteur(); const v = (n) => form.elements[n].value;
    T.formules.forEach((f, i) => {
      f.fr = v('f' + i + 'fr').trim() || f.fr; f.ar = v('f' + i + 'ar').trim() || f.ar; f.prix = Math.max(0, Number(v('f' + i + 'prix')) || 0);
      const fr = v('f' + i + 'cfr').split('\n').map((s) => s.trim()).filter(Boolean); const ar = v('f' + i + 'car').split('\n').map((s) => s.trim()).filter(Boolean);
      f.contenu = fr.map((x, k) => ({ fr: x, ar: ar[k] || x }));
    });
    T.options.forEach((o, i) => { o.prix = Math.max(0, Number(v('o' + i)) || 0); });
    T.acompte = Number(v('acompte')) || 0; T.capacite = Number(v('capacite')) || 0; T.delaiMin = Number(v('delaiMin')) || 0;
    T.remises.forEach((r, i) => { r.des = Number(v('r' + i + 'des')) || 0; r.pct = Number(v('r' + i + 'pct')) || 0; });
    B.ecrire('traiteur', T); B.toast(L('Réglages traiteur enregistrés', 'تم حفظ إعدادات الممون'), 'ok'); rendre(true);
  }
  /* Détail d'une demande traiteur */
  function ouvrirDevis(id) {
    const d = lire.devis().find((x) => x.id === id); if (!d) return;
    const T = lire.traiteur(); const R = lire.reglages(); const carte = lire.carte();
    const r = B.calculDevis(d, T);
    const evt = T.evenements.find((e) => e.id === d.type); const f = T.formules.find((x) => x.id === d.formule);
    const detail = [[L('Événement', 'المناسبة'), B.nom(evt)], [L('Date', 'التاريخ'), B.dateLongue(d.date) + ' · ' + d.heure], [L('Invités', 'المدعوون'), d.invites], [L('Lieu', 'المكان'), d.lieu], [L('Client', 'الزبون'), d.nom + ' · ' + d.tel]];
    if (d.mode === 'formule') detail.push([L('Formule ', 'صيغة ') + B.nom(f), prix(r.base)]);
    else Object.entries(d.pieces || {}).forEach(([pid, q]) => { const p = carte.plats.find((x) => x.id === pid); if (p) detail.push([q + ' × ' + B.nom(p), prix(q * p.prix)]); });
    if (r.remise) detail.push([L('Remise ', 'تخفيض ') + r.pct + ' %', '−' + prix(r.remise)]);
    r.detail.forEach((x) => detail.push([B.nom(x.o) + (x.o.mode === 'serveur' ? ' × ' + x.q : ''), prix(x.montant)]));
    detail.push([L('Total calculé', 'المجموع المحسوب'), prix(r.total)]);
    const wa = L('Bonjour ', 'السلام عليكم ') + d.nom + ',\n' + L('Banet el Baraka vous confirme le devis ', 'بنة البركة تؤكد لكم عرض السعر ') + d.id + ' :\n' +
      B.nom(evt) + ' · ' + B.dateLongue(d.date) + ' · ' + d.invites + L(' invités', ' مدعو') + '\n' + (d.mode === 'formule' ? L('Formule ', 'صيغة ') + B.nom(f) + '\n' : '') +
      L('Prix : ', 'السعر: ') + prix(r.final) + ' (' + prix(r.parPers) + L(' / pers.', ' للشخص') + ')\n' + L('Acompte : ', 'العربون: ') + prix(r.acompte) + L(' au restaurant ou par BaridiMob, solde le jour J.', ' في المطعم أو عبر بريدي موب، والباقي يوم المناسبة.');
    $('#modale').innerHTML = '<button type="button" class="modale__fermer" data-fermer-modale aria-label="' + L('Fermer', 'إغلاق') + '">' + ICO.fermer + '</button><div class="modale__corps">' +
      '<h2 id="modaleTitre">' + esc(d.id) + '</h2><p class="aide">' + L('Reçue le ', 'استُلم في ') + esc(new Date(d.cree).toLocaleDateString(B.langue === 'ar' ? 'ar-DZ-u-nu-latn' : 'fr-FR')) + '</p>' +
      '<div class="pipeline" role="group" aria-label="' + L('Statut', 'الحالة') + '" style="margin-top:12px">' + STATUTS_DEVIS.map(([s]) => '<button type="button" data-statut-devis="' + s + '" aria-pressed="' + (d.statut === s) + '">' + esc(nomStatutDevis(s)) + '</button>').join('') + '</div>' +
      '<dl class="detail-l">' + detail.map(([a, b]) => '<div><dt>' + esc(a) + '</dt><dd>' + esc(b) + '</dd></div>').join('') + '</dl>' +
      (d.remarques ? '<p class="remarque">' + esc(d.remarques) + '</p>' : '') +
      '<div class="formulaire formulaire--2" style="margin-top:14px"><label class="champ"><span>' + L('Prix final (DA)', 'السعر النهائي (دج)') + '</span><input id="dvPrixFinal" type="number" min="0" step="100" value="' + (d.prixFinal || '') + '" placeholder="' + r.total + '"></label>' +
      '<label class="champ"><span>' + L('Acompte reçu (DA)', 'العربون المستلم (دج)') + '</span><input id="dvAcompteRecu" type="number" min="0" step="100" value="' + (d.acompteRecu || '') + '" placeholder="' + r.acompte + '"></label>' +
      '<label class="champ large"><span>' + L('Note interne', 'ملاحظة داخلية') + '</span><textarea id="dvNote" rows="3">' + esc(d.note || '') + '</textarea></label></div>' +
      '<p class="aide" style="margin-top:8px">' + L('Acompte conseillé : ', 'العربون المقترح: ') + prix(r.acompte) + ' (' + T.acompte + ' %) · ' + L('Reste à payer : ', 'الباقي: ') + prix(Math.max(0, r.final - (d.acompteRecu || 0))) + '</p></div>' +
      '<div class="modale__pied"><a class="btn btn--wa" target="_blank" rel="noopener" href="' + B.lienWhatsApp(B.telInternational(d.tel), wa) + '">' + ICO.wa + L('Envoyer le devis', 'إرسال العرض') + '</a>' +
      '<a class="btn btn--ligne" href="tel:' + esc(d.tel.replace(/\s/g, '')) + '">' + ICO.tel + L('Appeler', 'اتصال') + '</a>' +
      '<button type="button" class="btn btn--plein" data-sauver-devis="' + d.id + '">' + L('Enregistrer', 'حفظ') + '</button></div>';
    $('#modale').dataset.devis = d.id;
    if (!$('#modale').open) $('#modale').showModal();
  }

  /* =======================================================================
     CARTE & SELF DU JOUR
     ======================================================================= */
  function vueCarte() {
    const carte = lire.carte(); const R = lire.reglages();
    const onglets = { self: L('Self du jour', 'أطباق اليوم'), plats: L('Tous les plats', 'كل الأطباق'), categories: L('Catégories', 'الأصناف') };
    let h = '<div class="puces-g">' + Object.keys(onglets).map((k) => '<button type="button" data-onglet-carte="' + k + '" aria-pressed="' + (ui.ongletCarte === k) + '">' + onglets[k] + '</button>').join('') + '</div>';
    if (ui.ongletCarte === 'self') {
      const maison = carte.plats.filter((p) => p.self !== undefined);
      const nbSelf = maison.filter((p) => p.self).length;
      h += '<p class="info-g" style="margin-bottom:12px">' + L('Cochez les plats maison préparés aujourd’hui. Ils apparaissent tout de suite sur le site dans « Le self du jour ». En cours de journée, marquez « Épuisé ».', 'اختاروا أطباق البيت المحضّرة اليوم. تظهر فورًا في الموقع ضمن «أطباق اليوم». خلال اليوم، اختاروا «نفد».') + '</p>' +
        '<div class="barre-outils"><strong>' + nbSelf + ' ' + L('plats au self aujourd’hui', 'طبق في الخدمة الذاتية اليوم') + '</strong><button type="button" class="btn btn--ligne btn--petit" data-self-tout="0">' + L('Tout décocher', 'إلغاء الكل') + '</button></div>' +
        '<div class="self-g">' + maison.map((p) => '<div class="self-g__item' + (p.self ? ' actif' : '') + '"><span class="plat-g__img">' + vignette(p) + '</span><div><div class="plat-g__nom">' + esc(B.nom(p)) + '</div><div class="plat-g__meta">' + prix(p.prix) + ' · ' + esc(B.nom(carte.categories.find((c) => c.id === p.cat))) + '</div></div>' +
          '<div class="self-g__ctrl"><label class="interrupteur"><input type="checkbox" data-self="' + p.id + '"' + (p.self ? ' checked' : '') + '>' + L('Au self aujourd’hui', 'متوفر اليوم') + '</label>' +
          '<label class="interrupteur"><input type="checkbox" data-epuise="' + p.id + '"' + (!p.dispo ? ' checked' : '') + '>' + L('Épuisé', 'نفد') + '</label>' +
          '<label class="interrupteur"><input type="radio" name="platDuJour" data-pdj="' + p.id + '"' + (R.platDuJour === p.id ? ' checked' : '') + '>' + L('Plat du jour', 'طبق اليوم') + '</label></div></div>').join('') + '</div>';
    }
    if (ui.ongletCarte === 'plats') {
      h += '<div class="barre-outils"><button type="button" class="btn btn--plein" data-editer-plat="">+ ' + L('Ajouter un plat', 'إضافة طبق') + '</button></div>';
      carte.categories.forEach((c) => {
        const liste = carte.plats.filter((p) => p.cat === c.id);
        h += '<section class="carte-g section-g"><header><h2>' + esc(B.nom(c)) + ' (' + liste.length + ')</h2></header>' + (liste.length ? liste.map((p) =>
          '<div class="plat-g"><span class="plat-g__img">' + vignette(p) + '</span><div><div class="plat-g__nom">' + esc(B.nom(p)) + (p.estime ? ' <span class="badge badge--off" title="' + L('Prix estimé, à confirmer', 'سعر تقديري، يُؤكَّد') + '">' + L('prix estimé', 'سعر تقديري') + '</span>' : '') + '</div><div class="plat-g__meta">' + prix(p.prix) + '</div></div>' +
          '<div class="plat-g__actions"><label class="interrupteur"><input type="checkbox" data-dispo="' + p.id + '"' + (p.dispo ? ' checked' : '') + '>' + L('Disponible', 'متوفر') + '</label>' +
          '<button type="button" class="btn btn--ligne btn--petit" data-editer-plat="' + p.id + '">' + L('Modifier', 'تعديل') + '</button></div></div>').join('') : '<p class="vide-g">—</p>') + '</section>';
      });
    }
    if (ui.ongletCarte === 'categories') {
      h += '<section class="carte-g"><div class="defile"><table class="tableau-g"><thead><tr><th>' + L('Nom (FR)', 'الاسم (فرنسية)') + '</th><th>' + L('Nom (AR)', 'الاسم (عربية)') + '</th><th>' + L('Plats', 'الأطباق') + '</th><th>' + L('Ordre', 'الترتيب') + '</th></tr></thead><tbody>' +
        carte.categories.map((c, i) => '<tr><td><input data-cat-fr="' + i + '" value="' + esc(c.fr) + '" aria-label="' + L('Nom (FR)', 'الاسم (فرنسية)') + '"></td><td><input data-cat-ar="' + i + '" value="' + esc(c.ar) + '" dir="rtl" aria-label="' + L('Nom (AR)', 'الاسم (عربية)') + '"></td><td>' + carte.plats.filter((p) => p.cat === c.id).length + '</td><td style="white-space:nowrap"><button type="button" class="btn btn--ligne btn--petit" data-cat-monter="' + i + '" aria-label="' + L('Monter', 'رفع') + '"' + (i ? '' : ' disabled') + '>↑</button> <button type="button" class="btn btn--ligne btn--petit" data-cat-suppr="' + i + '" aria-label="' + L('Supprimer', 'حذف') + '"' + (carte.plats.some((p) => p.cat === c.id) ? ' disabled' : '') + '>✕</button></td></tr>').join('') +
        '</tbody></table></div><div class="barre-outils" style="margin-top:12px"><button type="button" class="btn btn--ligne" data-cat-ajout>+ ' + L('Nouvelle catégorie', 'صنف جديد') + '</button><button type="button" class="btn btn--plein" data-cat-sauver>' + L('Enregistrer les noms', 'حفظ الأسماء') + '</button></div><p class="aide">' + L('Une catégorie ne peut être supprimée que si elle est vide.', 'لا يمكن حذف صنف إلا إذا كان فارغًا.') + '</p></section>';
    }
    return h;
  }
  function majPlat(id, fn) { const carte = lire.carte(); const p = carte.plats.find((x) => x.id === id); if (!p) return; fn(p, carte); B.ecrire('carte', carte); }
  let photoTemp = null;
  function editerPlat(id) {
    const carte = lire.carte(); const p = carte.plats.find((x) => x.id === id) || { id: '', cat: carte.categories[0].id, fr: '', ar: '', prix: 0, dfr: '', dar: '', photo: '', tags: [], dispo: true };
    photoTemp = null;
    $('#modale').dataset.devis = '';
    $('#modale').innerHTML = '<button type="button" class="modale__fermer" data-fermer-modale aria-label="' + L('Fermer', 'إغلاق') + '">' + ICO.fermer + '</button><form id="formPlat" class="modale__corps"><h2 id="modaleTitre">' + (id ? L('Modifier le plat', 'تعديل الطبق') : L('Nouveau plat', 'طبق جديد')) + '</h2>' +
      '<div class="formulaire formulaire--2" style="margin-top:14px">' +
      '<div class="photo-edit large"><span class="plat-g__img" id="apercuPhoto">' + vignette(p.fr ? p : null) + '</span><label class="btn btn--ligne btn--petit">' + L('Photo depuis le téléphone', 'صورة من الهاتف') + '<input type="file" accept="image/*" id="photoPlat" class="sr"></label></div>' +
      '<label class="champ"><span>' + L('Nom (FR)', 'الاسم (فرنسية)') + '</span><input name="fr" value="' + esc(p.fr) + '" required></label>' +
      '<label class="champ"><span>' + L('Nom (AR)', 'الاسم (عربية)') + '</span><input name="ar" value="' + esc(p.ar) + '" dir="rtl"></label>' +
      '<label class="champ"><span>' + L('Catégorie', 'الصنف') + '</span><select name="cat">' + carte.categories.map((c) => '<option value="' + c.id + '"' + (c.id === p.cat ? ' selected' : '') + '>' + esc(B.nom(c)) + '</option>').join('') + '</select></label>' +
      '<label class="champ"><span>' + L('Prix (DA)', 'السعر (دج)') + '</span><input name="prix" type="number" min="0" step="10" value="' + p.prix + '" required></label>' +
      '<label class="champ large"><span>' + L('Description courte (FR)', 'وصف قصير (فرنسية)') + '</span><input name="dfr" value="' + esc(p.dfr) + '"></label>' +
      '<label class="champ large"><span>' + L('Description courte (AR)', 'وصف قصير (عربية)') + '</span><input name="dar" value="' + esc(p.dar) + '" dir="rtl"></label>' +
      '<div class="large" style="display:flex;gap:16px;flex-wrap:wrap">' + [['maison', L('Fait maison (self)', 'صنع البيت')], ['epice', L('Épicé', 'حار')], ['vege', L('Végétarien', 'نباتي')]].map(([t, l]) => '<label class="interrupteur"><input type="checkbox" name="tag-' + t + '"' + ((p.tags || []).includes(t) ? ' checked' : '') + '>' + l + '</label>').join('') +
      '<label class="interrupteur"><input type="checkbox" name="dispo"' + (p.dispo ? ' checked' : '') + '>' + L('Disponible', 'متوفر') + '</label></div></div>' +
      '<p class="erreur" id="platErreur" role="alert"></p></form>' +
      '<div class="modale__pied">' + (id ? '<button type="button" class="btn btn--rouge" data-suppr-plat="' + id + '">' + L('Supprimer', 'حذف') + '</button>' : '') + '<button type="button" class="btn btn--plein" data-sauver-plat="' + (id || '') + '">' + L('Enregistrer', 'حفظ') + '</button></div>';
    if (!$('#modale').open) $('#modale').showModal();
  }
  // Compression d'une photo (600 px max, JPEG 0,8) pour tenir dans le stockage du navigateur
  function compresser(fichier) {
    return new Promise((ok, ko) => {
      const lecteur = new FileReader();
      lecteur.onload = () => {
        const img = new Image();
        img.onload = () => {
          const k = Math.min(1, 600 / Math.max(img.width, img.height));
          const cv = document.createElement('canvas'); cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
          cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
          ok(cv.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = ko; img.src = lecteur.result;
      };
      lecteur.onerror = ko; lecteur.readAsDataURL(fichier);
    });
  }
  function sauverPlat(id) {
    const f = $('#formPlat'); const v = (n) => f.elements[n].value.trim();
    if (!v('fr')) { $('#platErreur').textContent = L('Le nom est obligatoire.', 'الاسم إجباري.'); return; }
    const carte = lire.carte();
    let p = carte.plats.find((x) => x.id === id);
    if (!p) {
      let base = v('fr').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'plat';
      let nid = base, k = 2; while (carte.plats.some((x) => x.id === nid)) nid = base + '-' + k++;
      p = { id: nid, photo: '', estime: false }; carte.plats.push(p);
    }
    const tags = ['maison', 'epice', 'vege'].filter((t) => f.elements['tag-' + t].checked);
    const ancienPrix = p.prix;
    Object.assign(p, { fr: v('fr'), ar: v('ar') || v('fr'), cat: v('cat'), prix: Math.max(0, Number(v('prix')) || 0), dfr: v('dfr'), dar: v('dar'), tags, dispo: f.elements.dispo.checked });
    if (tags.includes('maison')) { if (p.self === undefined) p.self = true; } else delete p.self;
    if (photoTemp) p.photo = photoTemp;
    if (p.prix !== ancienPrix) p.estime = false; // un prix fixé par le gérant n'est plus « estimé »
    B.ecrire('carte', carte); $('#modale').close(); B.toast(L('Plat enregistré', 'تم حفظ الطبق'), 'ok'); rendre(true);
  }

  /* =======================================================================
     CLIENTS & FIDÉLITÉ
     ======================================================================= */
  function vueClients() {
    const R = lire.reglages(); const seuil = R.fidelite.seuil || 10;
    const q = ui.rechercheClient.toLowerCase();
    const liste = Object.values(lire.clients()).filter((c) => !q || c.nom.toLowerCase().includes(q) || c.tel.replace(/\s/g, '').includes(q.replace(/\s/g, ''))).sort((a, b) => b.nb - a.nb);
    const proches = liste.filter((c) => c.nb % seuil === seuil - 1);
    return '<div class="grille-g grille-g--2" style="margin-bottom:14px"><section class="carte-g"><h2>' + L('Programme de fidélité', 'برنامج الوفاء') + '</h2><form id="formFid" class="formulaire formulaire--2" style="margin-top:10px">' +
      '<label class="champ"><span>' + L('Récompense toutes les (commandes)', 'مكافأة كل (طلبات)') + '</span><input name="seuil" type="number" min="2" value="' + seuil + '"></label>' +
      '<label class="champ"><span>' + L('Récompense (FR)', 'المكافأة (فرنسية)') + '</span><input name="fr" value="' + esc(R.fidelite.fr) + '"></label>' +
      '<label class="champ"><span>' + L('Récompense (AR)', 'المكافأة (عربية)') + '</span><input name="ar" value="' + esc(R.fidelite.ar) + '" dir="rtl"></label>' +
      '<div style="align-self:end"><button class="btn btn--plein" type="submit">' + L('Enregistrer', 'حفظ') + '</button></div></form></section>' +
      '<section class="carte-g"><h2>' + L('Prochaine commande offerte', 'الطلب القادم مجاني') + '</h2>' + (proches.length ? '<ul class="tops" style="margin-top:10px">' + proches.map((c) => '<li><span>' + esc(c.nom) + ' · <span dir="ltr">' + esc(c.tel) + '</span></span><span>' + c.nb + '</span></li>').join('') + '</ul>' : '<p class="vide-g">—</p>') + '</section></div>' +
      '<section class="carte-g"><header><h2>' + L('Fichier clients', 'ملف الزبائن') + ' (' + liste.length + ')</h2><input class="input" id="rechClient" type="search" placeholder="' + L('Nom ou téléphone…', 'الاسم أو الهاتف…') + '" value="' + esc(ui.rechercheClient) + '" aria-label="' + L('Rechercher un client', 'بحث عن زبون') + '"></header>' +
      '<div class="defile"><table class="tableau-g"><thead><tr><th>' + L('Client', 'الزبون') + '</th><th>' + L('Téléphone', 'الهاتف') + '</th><th>' + L('Commandes', 'الطلبات') + '</th><th>' + L('Total', 'المجموع') + '</th><th>' + L('Fidélité', 'الوفاء') + '</th><th></th></tr></thead><tbody>' +
      liste.map((c) => '<tr><td><strong>' + esc(c.nom) + '</strong><br><span class="aide">' + (c.derniere ? L('Dernière : ', 'آخر طلب: ') + new Date(c.derniere).toLocaleDateString('fr-FR') : '') + '</span></td><td dir="ltr">' + esc(c.tel) + '</td><td>' + c.nb + '</td><td>' + prix(c.total) + '</td><td>' + (c.nb % seuil) + ' / ' + seuil + (Math.floor(c.nb / seuil) ? ' · ' + Math.floor(c.nb / seuil) + ' ' + L('offerte(s)', 'مجانية') : '') + '</td>' +
        '<td><a class="btn btn--wa btn--petit" target="_blank" rel="noopener" href="' + B.lienWhatsApp(B.telInternational(c.tel), L('Bonjour ', 'السلام عليكم ') + c.nom + ', ') + '" aria-label="WhatsApp ' + esc(c.nom) + '">' + ICO.wa + '</a></td></tr>').join('') +
      '</tbody></table></div></section>';
  }

  /* =======================================================================
     RÉGLAGES
     ======================================================================= */
  function vueReglages() {
    const R = lire.reglages(); const Z = lire.zones();
    const ch = (n, l, v, extra) => '<label class="champ"><span>' + l + '</span><input name="' + n + '" value="' + esc(v) + '"' + (extra || '') + '></label>';
    return '<form id="formReglages" class="grille-g">' +
      '<section class="carte-g formulaire formulaire--2"><h2 class="large">' + L('Établissement', 'المؤسسة') + '</h2>' +
      ch('nom', L('Nom', 'الاسم'), R.nom) + ch('nomAr', L('Nom en arabe', 'الاسم بالعربية'), R.nomAr, ' dir="rtl"') +
      ch('accrocheFr', L('Accroche (FR)', 'الشعار (فرنسية)'), R.accrocheFr) + ch('accrocheAr', L('Accroche (AR)', 'الشعار (عربية)'), R.accrocheAr, ' dir="rtl"') +
      ch('tel', L('Téléphone', 'الهاتف'), R.tel, ' type="tel"') + ch('whatsapp', L('WhatsApp (format 213…)', 'واتساب (صيغة 213…)'), R.whatsapp, ' inputmode="numeric"') +
      ch('adresseFr', L('Adresse (FR)', 'العنوان (فرنسية)'), R.adresseFr) + ch('adresseAr', L('Adresse (AR)', 'العنوان (عربية)'), R.adresseAr, ' dir="rtl"') +
      ch('instagram', 'Instagram', R.instagram) + ch('delaiLivraison', L('Délai de livraison annoncé (min)', 'مدة التوصيل المعلنة (دقيقة)'), R.delaiLivraison) +
      ch('ouverture', L('Ouverture', 'الفتح'), R.ouverture, ' type="time"') + ch('fermeture', L('Fermeture', 'الإغلاق'), R.fermeture, ' type="time"') +
      ch('livreurs', L('Livreurs (séparés par des virgules)', 'عمال التوصيل (مفصولون بفواصل)'), R.livreurs.join(', ')) + '</section>' +
      '<section class="carte-g"><h2>' + L('Zones et frais de livraison', 'مناطق ورسوم التوصيل') + '</h2><div class="defile"><table class="tableau-g" style="min-width:620px"><thead><tr><th>' + L('Zone (FR)', 'المنطقة (فرنسية)') + '</th><th>' + L('Zone (AR)', 'المنطقة (عربية)') + '</th><th>' + L('Frais', 'الرسوم') + '</th><th>' + L('Minimum', 'الحد الأدنى') + '</th><th>' + L('Temps (min)', 'المدة (د)') + '</th><th></th></tr></thead><tbody>' +
      Z.map((z, i) => '<tr><td><input name="z' + i + 'fr" value="' + esc(z.fr) + '" aria-label="' + L('Zone (FR)', 'المنطقة (فرنسية)') + '"></td><td><input name="z' + i + 'ar" value="' + esc(z.ar) + '" dir="rtl" aria-label="' + L('Zone (AR)', 'المنطقة (عربية)') + '"></td><td><input name="z' + i + 'frais" type="number" min="0" step="50" value="' + z.frais + '" aria-label="' + L('Frais', 'الرسوم') + '"></td><td><input name="z' + i + 'min" type="number" min="0" step="100" value="' + z.min + '" aria-label="' + L('Minimum', 'الحد الأدنى') + '"></td><td><input name="z' + i + 'temps" value="' + esc(z.temps) + '" aria-label="' + L('Temps', 'المدة') + '"></td><td><button type="button" class="btn btn--ligne btn--petit" data-zone-suppr="' + i + '" aria-label="' + L('Supprimer la zone', 'حذف المنطقة') + '">✕</button></td></tr>').join('') +
      '</tbody></table></div><button type="button" class="btn btn--ligne btn--petit" data-zone-ajout style="margin-top:10px">+ ' + L('Ajouter une zone', 'إضافة منطقة') + '</button></section>' +
      '<section class="carte-g formulaire formulaire--2"><h2 class="large">' + L('Codes PIN', 'الرموز السرية') + '</h2>' +
      Object.keys(ROLES).map((r) => ch('pin-' + r, B.nom(ROLES[r]), R.pins[r], ' inputmode="numeric" maxlength="4" pattern="\\d{4}"')).join('') + '</section>' +
      '<div><button type="submit" class="btn btn--plein btn--grand">' + L('Enregistrer les réglages', 'حفظ الإعدادات') + '</button></div></form>' +
      '<section class="carte-g section-g"><h2>' + L('Mode démo', 'وضع التجربة') + '</h2><p class="aide" style="margin:8px 0 12px">' + (R.modeDemo ? L('La démo contient des commandes, des demandes traiteur et des clients d’exemple.', 'تحتوي التجربة على طلبات وطلبات ممون وزبائن كأمثلة.') : L('Le restaurant est en service : les données sont réelles.', 'المطعم في الخدمة: البيانات حقيقية.')) + '</p>' +
      '<div class="barre-outils">' + (R.modeDemo ? '<button type="button" class="btn btn--sombre" data-mise-en-service>' + L('Mettre en service', 'تشغيل فعلي') + '</button>' : '') + '<button type="button" class="btn btn--ligne" data-reinstaller>' + L('Réinstaller la démo', 'إعادة تثبيت التجربة') + '</button></div>' +
      '<p class="aide">' + L('« Mettre en service » efface les commandes, demandes traiteur, clients et clôtures d’exemple, et garde la carte et les réglages.', '«تشغيل فعلي» يحذف الطلبات وطلبات الممون والزبائن والإغلاقات التجريبية، ويحتفظ بالقائمة والإعدادات.') + '</p></section>';
  }
  function enregistrerReglages(f) {
    const R = lire.reglages(); const v = (n) => f.elements[n].value.trim();
    ['nom', 'nomAr', 'accrocheFr', 'accrocheAr', 'tel', 'whatsapp', 'adresseFr', 'adresseAr', 'instagram', 'delaiLivraison', 'ouverture', 'fermeture'].forEach((k) => { R[k] = v(k); });
    R.livreurs = v('livreurs').split(',').map((s) => s.trim()).filter(Boolean);
    const pins = {}; let ok = true;
    Object.keys(ROLES).forEach((r) => { pins[r] = v('pin-' + r); if (!/^\d{4}$/.test(pins[r])) ok = false; });
    if (!ok || new Set(Object.values(pins)).size < 4) { B.toast(L('Chaque code PIN doit avoir 4 chiffres et être différent.', 'يجب أن يتكون كل رمز من 4 أرقام وأن يكون مختلفًا.'), 'erreur'); return; }
    R.pins = pins;
    const Z = lire.zones().map((z, i) => Object.assign(z, { fr: v('z' + i + 'fr'), ar: v('z' + i + 'ar'), frais: Number(v('z' + i + 'frais')) || 0, min: Number(v('z' + i + 'min')) || 0, temps: v('z' + i + 'temps') }));
    B.ecrire('reglages', R); B.ecrire('zones', Z);
    B.toast(L('Réglages enregistrés', 'تم حفظ الإعدادات'), 'ok'); rendre(true);
  }

  /* ---------------- Table des vues ---------------- */
  const VUES = { tableau: vueTableau, commandes: vueCommandes, cuisine: vueCuisine, caisse: vueCaisse, livreur: vueLivreur, traiteur: vueTraiteur, carte: vueCarte, clients: vueClients, reglages: vueReglages };
  const APRES = { tableau: apresTableau };

  /* ---------------- Délégation des actions ---------------- */
  const vue = $('#vue');
  vue.addEventListener('click', (e) => {
    const t = (s) => e.target.closest(s);
    let el;
    if ((el = t('[data-statut]'))) { changerStatut(el.dataset.id, el.dataset.statut); nouvelles.delete(el.dataset.id); B.toast(el.dataset.id + ' · ' + B.libelleStatut(el.dataset.statut, (lire.commandes().find((c) => c.id === el.dataset.id) || {}).mode), 'ok'); return; }
    if ((el = t('[data-ticket]'))) return imprimerTicket(el.dataset.ticket);
    if ((el = t('[data-filtre-cmd]'))) { ui.filtreCmd = el.dataset.filtreCmd; return rendre(true); }
    if ((el = t('[data-prendre]'))) return majCommande(el.dataset.prendre, (c) => { c.livreur = ui.livreurNom; });
    if ((el = t('[data-cat-caisse]'))) { ui.catCaisse = el.dataset.catCaisse; return rendre(true); }
    if ((el = t('[data-ajout]'))) {
      const p = lire.carte().plats.find((x) => x.id === el.dataset.ajout);
      const l = ui.ticket.find((x) => x.id === p.id); if (l) l.qte++; else ui.ticket.push({ id: p.id, fr: p.fr, ar: p.ar, prix: p.prix, qte: 1 });
      return rendre(true);
    }
    if ((el = t('[data-tq]'))) { const l = ui.ticket[Number(el.dataset.i)]; l.qte += Number(el.dataset.tq); if (l.qte <= 0) ui.ticket.splice(Number(el.dataset.i), 1); return rendre(true); }
    if (t('[data-vider]')) { ui.ticket = []; return rendre(true); }
    if ((el = t('[data-mode-caisse]'))) { ui.modeCaisse = el.dataset.modeCaisse; return rendre(true); }
    if (t('[data-encaisser]')) return encaisser();
    if ((el = t('[data-encaisser-cmd]'))) return majCommande(el.dataset.encaisserCmd, (c) => { c.paye = true; c.modePaiement = ui.paiement; });
    if (t('[data-cloture]')) return cloturer();
    if ((el = t('[data-onglet-tr]'))) { ui.ongletTraiteur = el.dataset.ongletTr; return rendre(true); }
    if ((el = t('[data-filtre-devis]'))) { ui.filtreDevis = el.dataset.filtreDevis; return rendre(true); }
    if ((el = t('[data-devis]'))) return ouvrirDevis(el.dataset.devis);
    if ((el = t('[data-cal-g]'))) { ui.calMois = new Date(ui.calMois.getFullYear(), ui.calMois.getMonth() + Number(el.dataset.calG), 1); return rendre(true); }
    if ((el = t('[data-cal-jour]'))) { ui.calJour = el.dataset.calJour; return rendre(true); }
    if ((el = t('[data-bloquer]'))) {
      const T = lire.traiteur(); const d = el.dataset.bloquer; T.datesBloquees = T.datesBloquees || [];
      T.datesBloquees = T.datesBloquees.includes(d) ? T.datesBloquees.filter((x) => x !== d) : T.datesBloquees.concat(d);
      B.ecrire('traiteur', T); return rendre(true);
    }
    if ((el = t('[data-onglet-carte]'))) { ui.ongletCarte = el.dataset.ongletCarte; return rendre(true); }
    if ((el = t('[data-editer-plat]'))) return editerPlat(el.dataset.editerPlat);
    if (t('[data-self-tout]')) { const c = lire.carte(); c.plats.forEach((p) => { if (p.self !== undefined) p.self = false; }); B.ecrire('carte', c); return rendre(true); }
    if ((el = t('[data-cat-monter]'))) { const c = lire.carte(); const i = Number(el.dataset.catMonter); [c.categories[i - 1], c.categories[i]] = [c.categories[i], c.categories[i - 1]]; B.ecrire('carte', c); return rendre(true); }
    if ((el = t('[data-cat-suppr]'))) { const c = lire.carte(); c.categories.splice(Number(el.dataset.catSuppr), 1); B.ecrire('carte', c); return rendre(true); }
    if (t('[data-cat-ajout]')) { const c = lire.carte(); c.categories.push({ id: 'cat-' + Date.now().toString(36), fr: L('Nouvelle catégorie', 'Nouvelle catégorie'), ar: 'صنف جديد' }); B.ecrire('carte', c); return rendre(true); }
    if (t('[data-cat-sauver]')) { const c = lire.carte(); c.categories.forEach((cat, i) => { cat.fr = $('[data-cat-fr="' + i + '"]').value.trim() || cat.fr; cat.ar = $('[data-cat-ar="' + i + '"]').value.trim() || cat.ar; }); B.ecrire('carte', c); B.toast(L('Catégories enregistrées', 'تم حفظ الأصناف'), 'ok'); return rendre(true); }
    if (t('[data-zone-ajout]')) { const Z = lire.zones(); Z.push({ id: 'z' + Date.now().toString(36), fr: L('Nouvelle zone', 'Nouvelle zone'), ar: 'منطقة جديدة', frais: 300, min: 1000, temps: '30-45' }); B.ecrire('zones', Z); return rendre(true); }
    if ((el = t('[data-zone-suppr]'))) { const Z = lire.zones(); Z.splice(Number(el.dataset.zoneSuppr), 1); B.ecrire('zones', Z); return rendre(true); }
    if (t('[data-mise-en-service]')) {
      if (!confirm(L('Mettre en service ? Les commandes, demandes traiteur, clients et clôtures d’exemple seront effacés. La carte et les réglages sont conservés.', 'تشغيل فعلي؟ ستُحذف الطلبات وطلبات الممون والزبائن والإغلاقات التجريبية. تبقى القائمة والإعدادات.'))) return;
      B.ecrire('commandes', []); B.ecrire('devis', []); B.ecrire('clients', {}); B.ecrire('clotures', []); B.ecrire('compteur', { commande: 1001, devis: 1001 });
      const R = lire.reglages(); R.modeDemo = false; B.ecrire('reglages', R); connues = new Set();
      B.toast(L('Restaurant en service', 'المطعم في الخدمة'), 'ok'); return rendre(true);
    }
    if (t('[data-reinstaller]')) { if (!confirm(L('Réinstaller toutes les données de démo ?', 'إعادة تثبيت كل بيانات التجربة؟'))) return; B.installer(true); connues = new Set(lire.commandes().map((c) => c.id)); B.toast(L('Démo réinstallée', 'تمت إعادة التثبيت'), 'ok'); return rendre(true); }
  });
  vue.addEventListener('change', (e) => {
    const el = e.target;
    if (el.dataset.livreur !== undefined) return majCommande(el.dataset.livreur, (c) => { c.livreur = el.value; });
    if (el.id === 'choixLivreur') { ui.livreurNom = el.value; return rendre(true); }
    if (el.name === 'paiement') { ui.paiement = el.value; return; }
    if (el.dataset.self) { majPlat(el.dataset.self, (p) => { p.self = el.checked; }); return rendre(true); }
    if (el.dataset.epuise) { majPlat(el.dataset.epuise, (p) => { p.dispo = !el.checked; }); return rendre(true); }
    if (el.dataset.dispo) { majPlat(el.dataset.dispo, (p) => { p.dispo = el.checked; }); return rendre(true); }
    if (el.dataset.pdj) { const R = lire.reglages(); R.platDuJour = el.dataset.pdj; B.ecrire('reglages', R); majPlat(el.dataset.pdj, (p) => { p.self = true; }); return rendre(true); }
  });
  vue.addEventListener('input', (e) => { if (e.target.id === 'rechClient') { ui.rechercheClient = e.target.value; const pos = e.target.selectionStart; rendre(true); const r = $('#rechClient'); r.focus(); r.setSelectionRange(pos, pos); } });
  vue.addEventListener('submit', (e) => {
    e.preventDefault();
    if (e.target.id === 'formTraiteur') enregistrerTraiteur(e.target);
    if (e.target.id === 'formReglages') enregistrerReglages(e.target);
    if (e.target.id === 'formFid') {
      const R = lire.reglages(); const f = e.target;
      R.fidelite = { seuil: Math.max(2, Number(f.elements.seuil.value) || 10), fr: f.elements.fr.value.trim(), ar: f.elements.ar.value.trim() };
      B.ecrire('reglages', R); B.toast(L('Fidélité enregistrée', 'تم حفظ برنامج الوفاء'), 'ok'); rendre(true);
    }
  });

  /* Modale (demande traiteur / fiche plat) */
  const modale = $('#modale');
  modale.addEventListener('click', async (e) => {
    const t = (s) => e.target.closest(s); let el;
    if (e.target === modale || t('[data-fermer-modale]')) return modale.close();
    if ((el = t('[data-statut-devis]'))) {
      majDevis(modale.dataset.devis, (d) => { d.statut = el.dataset.statutDevis; });
      $$('[data-statut-devis]', modale).forEach((b) => b.setAttribute('aria-pressed', String(b === el)));
      B.toast(L('Statut : ', 'الحالة: ') + nomStatutDevis(el.dataset.statutDevis), 'ok'); rendre(true); return;
    }
    if ((el = t('[data-sauver-devis]'))) {
      majDevis(el.dataset.sauverDevis, (d) => { d.prixFinal = Number($('#dvPrixFinal').value) || 0; d.acompteRecu = Number($('#dvAcompteRecu').value) || 0; d.note = $('#dvNote').value.trim(); if (d.acompteRecu && ['nouvelle', 'devis'].includes(d.statut)) d.statut = 'acompte'; });
      modale.close(); B.toast(L('Demande enregistrée', 'تم حفظ الطلب'), 'ok'); rendre(true); return;
    }
    if ((el = t('[data-sauver-plat]'))) return sauverPlat(el.dataset.sauverPlat);
    if ((el = t('[data-suppr-plat]'))) {
      if (!confirm(L('Supprimer ce plat de la carte ?', 'حذف هذا الطبق من القائمة؟'))) return;
      const c = lire.carte(); c.plats = c.plats.filter((p) => p.id !== el.dataset.supprPlat); B.ecrire('carte', c); modale.close(); rendre(true);
    }
  });
  modale.addEventListener('change', async (e) => {
    if (e.target.id !== 'photoPlat' || !e.target.files[0]) return;
    try { photoTemp = await compresser(e.target.files[0]); $('#apercuPhoto').innerHTML = '<img src="' + photoTemp + '" alt="">'; }
    catch (err) { B.toast(L('Photo illisible', 'صورة غير صالحة'), 'erreur'); }
  });
  modale.addEventListener('close', () => { if (rendreEnAttente) rendre(); });

  /* ---------------- Synchro temps réel ---------------- */
  B.surChangement((cle) => {
    if (cle === 'commandes') verifierNouvelles();
    if (cle === 'version') { connues = new Set(lire.commandes().map((c) => c.id)); }
    if (cle === 'langue') return;
    if (modale.open) { rendreEnAttente = true; return; }
    rendre();
  });

  /* ---------------- Démarrage ---------------- */
  B.poserLogos(); B.poserFavicon(); B.appliquerTextes();
  if (session && ROLES[session.role]) demarrer(); else { session = null; rendrePin(); }
})();
