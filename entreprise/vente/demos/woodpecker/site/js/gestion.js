/* =====================================================================
   Wood Pecker Draria · espace gérant
   ---------------------------------------------------------------------
   Connexion par code PIN et rôles :
     0328 gérant (tout) · 1111 cuisine · 2222 caisse · 3333 livreur
   Pages : tableau de bord, commandes, cuisine, caisse, livraisons,
   réservations (+ anniversaires), plat & poisson du jour, carte,
   clients & fidélité, réglages, mise en service.
   Toutes les données sont partagées avec le site via localStorage
   (« wpk- ») et synchronisées en direct entre onglets.
   ===================================================================== */
(function () {
  'use strict';
  const W = window.WPK;
  const T = window.T_GESTION;
  const D = window.WPK_DATA;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const t = cle => W.tr(T, cle);
  const esc = W.echapper;
  const ar = () => W.langue() === 'ar';

  W.initialiser();
  W.poserFavicon();

  /* ------------------------------------------------------------------
     Rôles et pages
     ------------------------------------------------------------------ */
  const CODES = { '0328': 'gerant', '1111': 'cuisine', '2222': 'caisse', '3333': 'livreur' };
  const PAGES = [
    ['tableau', 'p-tableau', 'horloge', ['gerant']],
    ['commandes', 'p-commandes', 'panier', ['gerant', 'caisse']],
    ['cuisine', 'p-cuisine', 'imprimer', ['gerant', 'cuisine']],
    ['caisse', 'p-caisse', 'table', ['gerant', 'caisse']],
    ['livraisons', 'p-livraisons', 'livraison', ['gerant', 'livreur']],
    ['reservations', 'p-reservations', 'calendrier', ['gerant', 'caisse']],
    ['jour', 'p-jour', 'check', ['gerant']],
    ['carte', 'p-carte', 'menu', ['gerant']],
    ['clients', 'p-clients', 'sac', ['gerant']],
    ['reglages', 'p-reglages', 'horloge', ['gerant']],
    ['service', 'p-service', 'deconnexion', ['gerant']]
  ];
  const ICONES_PAGES = { tableau: 'horloge', commandes: 'panier', cuisine: 'imprimer', caisse: 'table', livraisons: 'livraison', reservations: 'calendrier', jour: 'check', carte: 'menu', clients: 'sac', reglages: 'horloge', service: 'poubelle' };

  /* Session propre à l'onglet (plusieurs rôles possibles dans le même navigateur) */
  const session = {
    get() { try { return JSON.parse(sessionStorage.getItem('wpk-session') || 'null'); } catch (e) { return null; } },
    set(v) { try { sessionStorage.setItem('wpk-session', JSON.stringify(v)); } catch (e) {} },
    effacer() { try { sessionStorage.removeItem('wpk-session'); } catch (e) {} }
  };
  let role = null, page = null;

  /* ------------------------------------------------------------------
     Outils
     ------------------------------------------------------------------ */
  const PREP = { pizzas: 15, viandes: 20, volailles: 20, pasta: 15, chaudes: 10, froides: 8, menus: 12, enfant: 12, desserts: 5, cocktails: 4, shakes: 4, boissons: 1, chaudesb: 3, jour: 15 };
  const prepCible = c => Math.max(...c.lignes.map(l => PREP[l.cat] || 10));
  const duJour = c => c.cree >= W.debutJournee();
  const actives = c => !['livree', 'refusee'].includes(c.statut);
  const modeLib = c => c.mode === 'table' ? t('m-table') + ' ' + c.table : t('m-' + c.mode);
  const statutLib = c => t('st-' + c.statut);
  const depuis = ts => { const m = Math.max(0, Math.floor((Date.now() - ts) / 60000)); return m < 60 ? m + ' min' : Math.floor(m / 60) + ' h ' + W.deux(m % 60); };
  const chrono = ms => { const s = Math.max(0, Math.floor(ms / 1000)); return W.deux(Math.floor(s / 60)) + ':' + W.deux(s % 60); };

  function majCommande(id, fn) {
    const L = W.commandes();
    const c = L.find(x => x.id === id);
    if (!c) return null;
    fn(c);
    W.ecrire('commandes', L);
    return c;
  }
  function changerStatut(id, st) {
    return majCommande(id, c => {
      c.statut = st; c.hist[st] = Date.now();
      if (st !== 'refusee') c.accepte = true;
      if (st === 'livree' && c.source === 'site') c.encaisse = true;
    });
  }
  /* Étape suivante logique selon le mode */
  function suivant(c) {
    if (c.statut === 'recue') return 'preparation';
    if (c.statut === 'preparation') return 'prete';
    if (c.statut === 'prete') return c.mode === 'livraison' ? 'livraison' : 'livree';
    if (c.statut === 'livraison') return 'livree';
    return null;
  }
  const libSuivant = (c, st) => st === 'livree' ? (c.mode === 'livraison' ? t('a-livree') : t('a-remise')) : t('a-' + st);

  function lignesHTML(c, compact) {
    return '<ul class="g-lignes' + (compact ? ' compact' : '') + '">' + c.lignes.map(l => {
      const lib = W.libelleLigne(l);
      return '<li><span class="q">' + l.qte + '×</span><span class="n"><b>' + esc(lib.nom) + '</b>' + (lib.det ? '<small>' + esc(lib.det) + '</small>' : '') + '</span>' + (compact ? '' : '<span class="p">' + W.prix(l.pu * l.qte) + '</span>') + '</li>';
    }).join('') + '</ul>';
  }
  const adresseTxt = a => a ? [a.zone, a.cite, a.batiment, a.etage ? (ar() ? 'طابق ' : 'ét. ') + a.etage : '', a.repere].filter(Boolean).join(', ') : '';
  const waClient = (tel, txt) => W.lienWhatsApp(W.telInternational(tel), txt);
  const lienMaps = a => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent([a.cite, a.batiment, a.zone, 'Alger'].filter(Boolean).join(', '));

  /* ------------------------------------------------------------------
     Son (nouvelle commande)
     ------------------------------------------------------------------ */
  let audio = null;
  function bip() {
    if (!W.lire('son', true)) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      [0, 0.18, 0.36].forEach((d, i) => {
        const o = audio.createOscillator(), g = audio.createGain();
        o.frequency.value = [880, 1175, 1568][i]; o.type = 'sine';
        g.gain.setValueAtTime(0.0001, audio.currentTime + d);
        g.gain.exponentialRampToValueAtTime(0.25, audio.currentTime + d + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + d + 0.16);
        o.connect(g).connect(audio.destination); o.start(audio.currentTime + d); o.stop(audio.currentTime + d + 0.18);
      });
    } catch (e) { /* audio indisponible */ }
  }
  let connues = new Set(W.commandes().map(c => c.id));
  function detecterNouvelles() {
    const L = W.commandes();
    const nouv = L.filter(c => !connues.has(c.id) && c.source === 'site');
    L.forEach(c => connues.add(c.id));
    if (nouv.length && role && role !== 'livreur') {
      bip();
      W.toast(t('nouvelle-commande') + ' ' + nouv.map(c => c.id).join(', '));
    }
  }

  /* ------------------------------------------------------------------
     Ticket 80 mm
     ------------------------------------------------------------------ */
  function imprimerTicket(id) {
    const c = W.commandes().find(x => x.id === id);
    if (!c) return;
    const R = W.reglages();
    const z = $('#ticket');
    z.innerHTML = '<div class="tk">' +
      '<div class="tk-c"><b>WOOD PECKER DRARIA</b><br>' + esc(R.tel1) + ' · ' + esc(R.tel2) + '</div><hr>' +
      '<div class="tk-c tk-big">' + c.id + '</div>' +
      '<div>' + new Date(c.cree).toLocaleString('fr-FR') + '</div>' +
      '<div><b>' + esc(modeLib(c)) + '</b>' + (c.programme ? ' · ' + t('pour') + ' ' + W.heure(c.programme) : '') + '</div>' +
      (c.client && c.client.nom ? '<div>' + esc(c.client.nom) + ' · ' + esc(c.client.tel) + '</div>' : '') +
      (c.adresse ? '<div>' + esc(adresseTxt(c.adresse)) + '</div>' : '') + '<hr>' +
      c.lignes.map(l => { const lib = W.libelleLigne(l); return '<div class="tk-l"><span>' + l.qte + ' ' + esc(lib.nom) + '</span><span>' + W.prix(l.pu * l.qte) + '</span></div>' + (lib.det ? '<div class="tk-d">' + esc(lib.det) + '</div>' : ''); }).join('') +
      '<hr>' + (c.frais ? '<div class="tk-l"><span>' + t('livraison') + '</span><span>' + W.prix(c.frais) + '</span></div>' : '') +
      '<div class="tk-l tk-big"><span>' + t('total') + '</span><span>' + W.prix(c.total) + '</span></div>' +
      (c.remarque ? '<hr><div>' + t('remarque') + ' : ' + esc(c.remarque) + '</div>' : '') +
      '<hr><div class="tk-c">' + t('merci-ticket') + '</div></div>';
    window.print();
  }

  /* ------------------------------------------------------------------
     Fenêtre générique
     ------------------------------------------------------------------ */
  function fenetre(titre, corps, onOuvrir) {
    $('#dlg-g-contenu').innerHTML = '<header class="fg-entete"><h2 id="dlg-g-titre">' + titre + '</h2><button type="button" class="btn-fermer" data-fermer-dlg aria-label="' + t('fermer') + '">' + W.icone('fermer', 20) + '</button></header><div class="fg-corps">' + corps + '</div>';
    const d = $('#dlg-g');
    if (!d.open) d.showModal();
    if (onOuvrir) onOuvrir($('#dlg-g-contenu'));
  }
  const fermerFenetre = () => { if ($('#dlg-g').open) $('#dlg-g').close(); };

  /* ==================================================================
     PAGES
     ================================================================== */
  const VUES = {};

  /* ---------- Tableau de bord ---------- */
  VUES.tableau = () => {
    const L = W.commandes().filter(c => duJour(c) && c.statut !== 'refusee');
    const ca = L.reduce((s, c) => s + c.total, 0);
    const nb = L.length;
    const enCours = L.filter(actives).length;
    const top = {};
    L.forEach(c => c.lignes.forEach(l => { const k = l.nom; top[k] = top[k] || { nom: l.nom, ar: l.ar, pre: l.pre, q: 0, ca: 0 }; top[k].q += l.qte; top[k].ca += l.pu * l.qte; }));
    const tops = Object.values(top).sort((a, b) => b.q - a.q).slice(0, 6);
    const maxQ = tops.length ? tops[0].q : 1;
    // Commandes par heure (11 h → 1 h)
    const heures = []; for (let h = 11; h <= 24; h++) heures.push(h % 24);
    const parHeure = heures.map(h => L.filter(c => new Date(c.cree).getHours() === h).length);
    const R = W.reservations().filter(r => r.jour === W.isoJour(Date.now()) && r.statut !== 'refusee').sort((a, b) => a.heure.localeCompare(b.heure));
    const enLivraison = L.filter(c => c.statut === 'livraison');
    const maxH = Math.max(1, ...parHeure);
    const hBar = 150;
    const larg = 100 / heures.length;
    const svg = '<svg class="graphe" viewBox="0 0 700 190" role="img" aria-labelledby="g-titre g-desc" preserveAspectRatio="none"><title id="g-titre">' + t('graphe-titre') + '</title><desc id="g-desc">' + heures.map((h, i) => W.deux(h) + 'h : ' + parHeure[i]).join(', ') + '</desc>' +
      [0.25, 0.5, 0.75, 1].map(f => '<line x1="0" x2="700" y1="' + (160 - hBar * f) + '" y2="' + (160 - hBar * f) + '" class="grille"/>').join('') +
      heures.map((h, i) => {
        const v = parHeure[i]; const hh = v / maxH * hBar; const x = i * 700 / heures.length + 7;
        const w = 700 / heures.length - 14;
        return '<g class="barre-g"><rect x="' + (x - 6) + '" y="0" width="' + (w + 12) + '" height="175" fill="transparent"><title>' + W.deux(h) + ' h : ' + v + ' ' + t('commandes-min') + '</title></rect>' +
          (v ? '<path d="M' + x + ' 160 V' + (160 - hh + 4) + ' q0 -4 4 -4 h' + (w - 8) + ' q4 0 4 4 V160 z" class="barre"/>' : '') +
          '<text x="' + (x + w / 2) + '" y="178" text-anchor="middle">' + W.deux(h) + '</text>' +
          (v ? '<text x="' + (x + w / 2) + '" y="' + (160 - hh - 6) + '" text-anchor="middle" class="val">' + v + '</text>' : '') + '</g>';
      }).join('') + '<line x1="0" x2="700" y1="160" y2="160" class="axe"/></svg>';

    return '<div class="kpis">' +
      kpi(t('k-ca'), W.prix(ca), 'k-ca') + kpi(t('k-cmd'), nb) + kpi(t('k-panier'), W.prix(nb ? ca / nb : 0)) + kpi(t('k-encours'), enCours) +
      '</div>' +
      '<div class="grille-2">' +
        '<section class="panneau"><h2>' + t('graphe-titre') + '</h2>' + svg + '</section>' +
        '<section class="panneau"><h2>' + t('top-plats') + '</h2><ol class="top">' + tops.map(p => '<li><span class="top-nom">' + esc((p.pre ? p.pre + ' ' : '') + (ar() && p.ar ? p.ar : p.nom)) + '</span><span class="top-barre"><i style="width:' + Math.round(p.q / maxQ * 100) + '%"></i></span><b>' + p.q + '</b></li>').join('') + '</ol></section>' +
      '</div>' +
      '<div class="grille-2">' +
        '<section class="panneau"><h2>' + t('res-jour') + ' <span class="compteur">' + R.length + '</span></h2>' +
          (R.length ? '<ul class="liste-simple">' + R.map(r => '<li><b>' + r.heure + '</b><span>' + esc(r.nom) + ' · ' + r.personnes + ' ' + t('pers') + (r.bebe ? ' · ' + r.bebe + ' ' + t('bebe-court') : '') + '</span><span class="pastille-st ' + r.statut + '">' + t('rs-' + r.statut) + '</span></li>').join('') + '</ul>' : '<p class="vide">' + t('aucune') + '</p>') +
        '</section>' +
        '<section class="panneau"><h2>' + t('en-livraison') + ' <span class="compteur">' + enLivraison.length + '</span></h2>' +
          (enLivraison.length ? '<ul class="liste-simple">' + enLivraison.map(c => '<li><b>' + c.id + '</b><span>' + esc(c.client.nom) + ' · ' + esc(c.adresse ? c.adresse.zone : '') + ' · ' + esc(c.livreur || '') + '</span><span>' + depuis(c.hist.livraison || c.cree) + '</span></li>').join('') + '</ul>' : '<p class="vide">' + t('aucune') + '</p>') +
          '<h2 class="mt">' + t('dernieres') + '</h2><ul class="liste-simple">' + L.slice().sort((a, b) => b.cree - a.cree).slice(0, 5).map(c => '<li><b>' + c.id + '</b><span>' + W.heure(c.cree) + ' · ' + esc(c.client.nom || modeLib(c)) + ' · ' + W.prix(c.total) + '</span><span class="pastille-st ' + c.statut + '">' + statutLib(c) + '</span></li>').join('') + '</ul>' +
        '</section>' +
      '</div>';
  };
  const kpi = (lib, val, cls) => '<div class="kpi ' + (cls || '') + '"><span>' + lib + '</span><b>' + val + '</b></div>';

  /* ---------- Commandes en temps réel ---------- */
  let filtreCmd = 'actives', cmdSel = null;
  VUES.commandes = () => {
    const L = W.commandes().filter(duJour).sort((a, b) => b.cree - a.cree);
    const F = {
      attente: L.filter(c => c.statut === 'recue' && !c.accepte),
      actives: L.filter(actives),
      terminees: L.filter(c => !actives(c)),
      toutes: L
    };
    const liste = F[filtreCmd];
    if (!cmdSel || !L.find(c => c.id === cmdSel)) cmdSel = liste[0] ? liste[0].id : null;
    const sel = L.find(c => c.id === cmdSel);
    return '<div class="filtres" role="group" aria-label="' + t('filtre') + '">' +
      ['attente', 'actives', 'terminees', 'toutes'].map(f => '<button type="button" class="filtre' + (f === filtreCmd ? ' actif' : '') + '" data-filtre="' + f + '" aria-pressed="' + (f === filtreCmd) + '">' + t('f-' + f) + ' <span class="compteur">' + F[f].length + '</span></button>').join('') +
      '</div><div class="cmd-grille"><ul class="cmd-liste" aria-label="' + t('p-commandes') + '">' +
      (liste.length ? liste.map(c => '<li><button type="button" class="cmd-item' + (c.id === cmdSel ? ' actif' : '') + (c.statut === 'recue' && !c.accepte ? ' nouvelle' : '') + '" data-cmd="' + c.id + '">' +
        '<span class="ci-haut"><b>' + c.id + '</b><span class="pastille-st ' + c.statut + '">' + statutLib(c) + '</span></span>' +
        '<span class="ci-bas"><span>' + W.heure(c.cree) + ' · ' + esc(modeLib(c)) + (c.client.nom ? ' · ' + esc(c.client.nom) : '') + '</span><b>' + W.prix(c.total) + '</b></span></button></li>').join('') : '<li class="vide">' + t('aucune') + '</li>') +
      '</ul><section class="cmd-detail panneau" aria-live="polite">' + (sel ? detailCommande(sel) : '<p class="vide">' + t('choisir-cmd') + '</p>') + '</section></div>';
  };
  function detailCommande(c) {
    const R = W.reglages();
    const st = suivant(c);
    const msg = t('wa-client').replace('{id}', c.id).replace('{statut}', statutLib(c));
    return '<header class="cd-entete"><div><h2>' + c.id + '</h2><p>' + W.heure(c.cree) + ' · ' + esc(modeLib(c)) + (c.programme ? ' · <b>' + t('pour') + ' ' + W.heure(c.programme) + '</b>' : '') + '</p></div><span class="pastille-st grand ' + c.statut + '">' + statutLib(c) + '</span></header>' +
      (c.client.nom ? '<p class="cd-client"><b>' + esc(c.client.nom) + '</b> · <a href="tel:' + W.normaliserTel(c.client.tel) + '" dir="ltr">' + esc(c.client.tel) + '</a></p>' : '') +
      (c.adresse ? '<p class="cd-adresse">' + W.icone('carte', 16) + ' ' + esc(adresseTxt(c.adresse)) + '</p>' : '') +
      (c.remarque ? '<p class="cd-remarque">« ' + esc(c.remarque) + ' »</p>' : '') +
      lignesHTML(c) +
      (c.frais ? '<p class="g-total petit"><span>' + t('livraison') + '</span><span>' + W.prix(c.frais) + '</span></p>' : '') +
      '<p class="g-total"><span>' + t('total') + '</span><b>' + W.prix(c.total) + '</b></p>' +
      '<p class="aide">' + t('paiement') + ' : ' + (c.paiement === 'livraison' ? t('pay-livraison') : t('pay-comptoir')) + (c.encaisse ? ' · <b class="ok">' + t('encaisse') + '</b>' : '') + '</p>' +
      (c.mode === 'livraison' && c.statut !== 'livree' && c.statut !== 'refusee'
        ? '<label class="champ en-ligne"><span>' + t('livreur') + '</span><select data-livreur="' + c.id + '"><option value="">—</option>' + R.livreurs.map(l => '<option' + (l === c.livreur ? ' selected' : '') + '>' + esc(l) + '</option>').join('') + '</select></label>' : '') +
      '<div class="cd-actions">' +
        (c.statut === 'recue' && !c.accepte ? '<button type="button" class="btn btn-vert" data-accepter="' + c.id + '">' + W.icone('check', 18) + t('accepter') + '</button><button type="button" class="btn btn-rouge" data-refuser="' + c.id + '">' + t('refuser') + '</button>' : '') +
        (st && !(c.statut === 'recue' && !c.accepte) ? '<button type="button" class="btn btn-or" data-statut="' + c.id + '" data-vers="' + st + '">' + libSuivant(c, st) + '</button>' : '') +
        '<button type="button" class="btn btn-ligne" data-ticket="' + c.id + '">' + W.icone('imprimer', 18) + t('ticket') + '</button>' +
        (c.client.tel ? '<a class="btn btn-wa" target="_blank" rel="noopener" href="' + waClient(c.client.tel, msg) + '">' + W.icone('whatsapp', 18) + 'WhatsApp</a>' : '') +
      '</div>';
  }

  /* ---------- Cuisine ---------- */
  VUES.cuisine = () => {
    const L = W.commandes().filter(c => duJour(c) && ['recue', 'preparation', 'prete'].includes(c.statut)).sort((a, b) => a.cree - b.cree);
    const col = (st, titre) => {
      const cs = L.filter(c => c.statut === st);
      return '<section class="col-cuisine col-' + st + '" aria-labelledby="col-' + st + '"><h2 id="col-' + st + '">' + titre + ' <span class="compteur">' + cs.length + '</span></h2>' +
        (cs.length ? cs.map(carteCuisine).join('') : '<p class="vide">' + t('rien') + '</p>') + '</section>';
    };
    return '<div class="cuisine">' + col('recue', t('c-nouvelles')) + col('preparation', t('c-prep')) + col('prete', t('c-pretes')) + '</div>';
  };
  function carteCuisine(c) {
    const cible = prepCible(c);
    let timer = '';
    if (c.statut === 'preparation') {
      const ecoule = Date.now() - (c.hist.preparation || c.cree);
      const etat = ecoule > cible * 60e3 ? 'retard' : ecoule > cible * 0.75 * 60e3 ? 'bientot' : 'ok';
      timer = '<span class="minuteur ' + etat + '" data-depart="' + (c.hist.preparation || c.cree) + '" data-cible="' + cible + '">' + chrono(ecoule) + ' / ' + cible + ':00</span>';
    } else if (c.statut === 'recue') timer = '<span class="minuteur attente">' + depuis(c.cree) + '</span>';
    else timer = '<span class="minuteur ok">' + t('st-prete') + ' ' + W.heure(c.hist.prete || Date.now()) + '</span>';
    const btn = c.statut === 'recue' ? '<button type="button" class="btn btn-or large" data-statut="' + c.id + '" data-vers="preparation">' + t('a-preparation') + '</button>'
      : c.statut === 'preparation' ? '<button type="button" class="btn btn-vert large" data-statut="' + c.id + '" data-vers="prete">' + t('a-prete') + '</button>'
      : (c.mode !== 'livraison' ? '<button type="button" class="btn btn-ligne large" data-statut="' + c.id + '" data-vers="livree">' + t('a-remise') + '</button>' : '<p class="aide centre">' + t('attente-livreur') + (c.livreur ? ' · ' + esc(c.livreur) : '') + '</p>');
    return '<article class="ticket-cuisine' + (c.statut === 'recue' && !c.accepte ? ' nouvelle' : '') + '"><header><b>' + c.id + '</b><span>' + esc(modeLib(c)) + '</span>' + timer + '</header>' +
      (c.programme ? '<p class="prog">' + t('pour') + ' ' + W.heure(c.programme) + '</p>' : '') +
      lignesHTML(c, true) + (c.remarque ? '<p class="cd-remarque">« ' + esc(c.remarque) + ' »</p>' : '') + btn + '</article>';
  }

  /* ---------- Caisse ---------- */
  let caisse = { cible: 'comptoir', table: null, lignes: [], cat: 'pizzas' };
  VUES.caisse = () => {
    const R = W.reglages();
    const C = W.carte();
    const ouvertes = W.commandes().filter(c => duJour(c) && c.source === 'caisse' && c.mode === 'table' && !c.encaisse && c.statut !== 'refusee');
    const occupees = new Set(ouvertes.map(c => String(c.table)));
    const tables = []; for (let i = 1; i <= R.tables; i++) tables.push(i);
    const plats = C.plats.filter(p => p.cat === caisse.cat && p.dispo);
    const total = caisse.lignes.reduce((s, l) => s + l.pu * l.qte, 0);
    const surTable = caisse.cible === 'table' ? ouvertes.filter(c => String(c.table) === String(caisse.table)) : [];
    const dejaTable = surTable.reduce((s, c) => s + c.total, 0);
    return '<div class="caisse">' +
      '<section class="panneau plan"><h2>' + t('plan-salle') + '</h2><div class="tables">' +
        '<button type="button" class="table-btn comptoir' + (caisse.cible === 'comptoir' ? ' actif' : '') + '" data-cible="comptoir">' + W.icone('sac', 18) + t('m-comptoir') + '</button>' +
        tables.map(n => '<button type="button" class="table-btn' + (occupees.has(String(n)) ? ' occupee' : '') + (caisse.cible === 'table' && String(caisse.table) === String(n) ? ' actif' : '') + '" data-table="' + n + '" aria-label="' + t('m-table') + ' ' + n + (occupees.has(String(n)) ? ' (' + t('occupee') + ')' : '') + '">' + n + '</button>').join('') +
      '</div><p class="aide">' + t('tables-aide') + '</p>' +
      '<button type="button" class="btn btn-ligne large" data-action="cloture">' + t('cloture') + '</button></section>' +
      '<section class="panneau menu-caisse"><div class="cats-caisse">' + C.categories.map(c => '<button type="button" class="filtre' + (c.id === caisse.cat ? ' actif' : '') + '" data-cat-caisse="' + c.id + '" aria-pressed="' + (c.id === caisse.cat) + '">' + esc(W.nomL(c)) + '</button>').join('') +
      '<button type="button" class="filtre' + (caisse.cat === 'jour' ? ' actif' : '') + '" data-cat-caisse="jour" aria-pressed="' + (caisse.cat === 'jour') + '">' + t('p-jour-court') + '</button></div>' +
      '<div class="plats-caisse">' + (caisse.cat === 'jour' ? W.jour().plats.filter(p => p.actif).map(p => '<button type="button" class="plat-caisse" data-jour-caisse="' + p.id + '"><span>' + esc(W.nomL(p)) + '</span><b>' + W.prix(p.prix) + '</b></button>').join('')
        : plats.map(p => '<button type="button" class="plat-caisse" data-plat-caisse="' + p.id + '"><span>' + esc((p.pre ? p.pre + ' ' : '') + W.nomL(p)) + '</span><b>' + (p.tailles ? W.prix(p.tailles.mini) + '+' : W.prix(p.prix)) + '</b></button>').join('')) + '</div></section>' +
      '<section class="panneau ticket-caisse"><h2>' + (caisse.cible === 'table' ? t('m-table') + ' ' + caisse.table : t('m-comptoir')) + '</h2>' +
        (surTable.length ? '<div class="deja"><p class="aide">' + t('deja-envoye') + '</p>' + surTable.map(c => '<p class="g-total petit"><span>' + c.id + ' · ' + statutLib(c) + '</span><span>' + W.prix(c.total) + '</span></p>').join('') + '</div>' : '') +
        (caisse.lignes.length ? '<ul class="g-lignes">' + caisse.lignes.map((l, i) => { const lib = W.libelleLigne(l); return '<li><span class="q">' + l.qte + '×</span><span class="n"><b>' + esc(lib.nom) + '</b>' + (lib.det ? '<small>' + esc(lib.det) + '</small>' : '') + '</span><span class="p">' + W.prix(l.pu * l.qte) + '</span><button type="button" class="btn-icone petit" data-retirer="' + i + '" aria-label="' + t('retirer') + '">' + W.icone('moins', 16) + '</button></li>'; }).join('') + '</ul>' : '<p class="vide">' + t('ticket-vide') + '</p>') +
        '<p class="g-total"><span>' + t('total') + '</span><b>' + W.prix(total + dejaTable) + '</b></p>' +
        '<div class="cd-actions colonne">' +
          '<button type="button" class="btn btn-or large" data-action="envoyer-cuisine"' + (caisse.lignes.length ? '' : ' disabled') + '>' + t('envoyer-cuisine') + '</button>' +
          '<button type="button" class="btn btn-vert large" data-action="encaisser"' + (caisse.lignes.length || surTable.length ? '' : ' disabled') + '>' + t('encaisser') + '</button>' +
        '</div></section></div>';
  };
  function ajouterCaisse(plat, opts) {
    const C = W.carte();
    const l = { id: plat.id, nom: plat.fr, ar: plat.ar, pre: plat.pre || '', cat: plat.cat, qte: 1 };
    if (plat.tailles) l.taille = opts.taille;
    if (opts.choix != null && plat.choix) { const o = plat.choix.opts[opts.choix]; l.choix = o[0]; l.choixAr = o[1]; }
    if (opts.sauce !== '' && opts.sauce != null && plat.sauce) { const s = C.sauces[opts.sauce]; l.sauce = s.fr; l.sauceAr = s.ar; }
    l.pu = W.prixLigne(plat, { taille: l.taille, sauce: plat.sauce === 'option' ? l.sauce : '' }, C);
    const ex = caisse.lignes.find(x => x.id === l.id && x.taille === l.taille && x.choix === l.choix && x.sauce === l.sauce);
    if (ex) ex.qte++; else caisse.lignes.push(l);
    rendre();
  }
  function optionsCaisse(plat) {
    const C = W.carte();
    if (!plat.tailles && !plat.choix && !plat.sauce) return ajouterCaisse(plat, {});
    let h = '<form id="f-opt-caisse">';
    if (plat.tailles) h += '<fieldset class="g-fs"><legend>' + t('taille') + '</legend><div class="choix-rapides">' + D.TAILLES.map((tl, i) => '<label><input type="radio" name="taille" value="' + tl.id + '"' + (i === 1 ? ' checked' : '') + '><span>' + esc(W.nomL(tl)) + '<small>' + W.prix(plat.tailles[tl.id]) + '</small></span></label>').join('') + '</div></fieldset>';
    if (plat.choix) h += '<fieldset class="g-fs"><legend>' + esc(W.nomL(plat.choix)) + '</legend><div class="choix-rapides">' + plat.choix.opts.map((o, i) => '<label><input type="radio" name="choix" value="' + i + '"' + (i === 0 ? ' checked' : '') + '><span>' + esc(ar() ? o[1] : o[0]) + '</span></label>').join('') + '</div></fieldset>';
    if (plat.sauce) h += '<fieldset class="g-fs"><legend>' + t('sauce') + '</legend><div class="choix-rapides">' + (plat.sauce === 'option' ? '<label><input type="radio" name="sauce" value="" checked><span>' + t('sans-sauce') + '</span></label>' : '') + C.sauces.map((s, i) => '<label><input type="radio" name="sauce" value="' + i + '"' + (plat.sauce === 'incluse' && i === 0 ? ' checked' : '') + '><span>' + esc(W.nomL(s)) + '</span></label>').join('') + '</div></fieldset>';
    h += '<button type="submit" class="btn btn-or large">' + t('ajouter') + '</button></form>';
    fenetre(esc(W.nomL(plat)), h, z => {
      $('#f-opt-caisse', z).onsubmit = ev => {
        ev.preventDefault();
        const fd = new FormData(ev.target);
        ajouterCaisse(plat, { taille: fd.get('taille'), choix: fd.get('choix') != null ? Number(fd.get('choix')) : null, sauce: fd.get('sauce') == null || fd.get('sauce') === '' ? '' : Number(fd.get('sauce')) });
        fermerFenetre();
      };
    });
  }
  function creerCommandeCaisse(encaisser) {
    const n = W.prochainNumero('cmd');
    const lignes = caisse.lignes.map(l => Object.assign({}, l, { total: l.pu * l.qte }));
    const total = lignes.reduce((s, l) => s + l.total, 0);
    const c = {
      id: 'WP-' + n, n, cree: Date.now(), source: 'caisse', mode: caisse.cible === 'table' ? 'table' : 'comptoir', table: caisse.table,
      client: { nom: '', tel: '' }, adresse: null, programme: '', remarque: '', lignes, sousTotal: total, frais: 0, total,
      paiement: 'comptoir', statut: 'recue', hist: { recue: Date.now() }, accepte: true, livreur: '', encaisse: !!encaisser
    };
    const L = W.commandes(); L.push(c); connues.add(c.id); W.ecrire('commandes', L);
    caisse.lignes = [];
    return c;
  }
  function encaisser() {
    const ouvertes = caisse.cible === 'table' ? W.commandes().filter(c => duJour(c) && c.source === 'caisse' && c.mode === 'table' && String(c.table) === String(caisse.table) && !c.encaisse && c.statut !== 'refusee') : [];
    const aPayer = caisse.lignes.reduce((s, l) => s + l.pu * l.qte, 0) + ouvertes.reduce((s, c) => s + c.total, 0);
    fenetre(t('encaisser') + ' · ' + W.prix(aPayer),
      '<form id="f-encaisse"><p class="g-total"><span>' + t('a-payer') + '</span><b>' + W.prix(aPayer) + '</b></p>' +
      '<label class="champ"><span>' + t('recu') + '</span><input type="number" id="recu" min="0" step="50" value="' + aPayer + '"></label>' +
      '<p class="g-total"><span>' + t('rendu') + '</span><b id="rendu">' + W.prix(0) + '</b></p>' +
      '<button type="submit" class="btn btn-vert large">' + t('valider-encaisse') + '</button></form>', z => {
        const maj = () => { $('#rendu', z).textContent = W.prix(Math.max(0, Number($('#recu', z).value) - aPayer)); };
        $('#recu', z).oninput = maj; maj();
        $('#f-encaisse', z).onsubmit = ev => {
          ev.preventDefault();
          if (caisse.lignes.length) creerCommandeCaisse(true);
          if (ouvertes.length) { const L = W.commandes(); L.forEach(c => { if (ouvertes.find(o => o.id === c.id)) c.encaisse = true; }); W.ecrire('commandes', L); }
          fermerFenetre(); W.toast(t('encaisse-ok') + ' · ' + W.prix(aPayer)); rendre();
        };
      });
  }
  function cloture() {
    const zs = W.lire('zs', []);
    const depuisZ = zs.length ? zs[zs.length - 1].a : W.debutJournee();
    const L = W.commandes().filter(c => c.encaisse && (c.hist.livree || c.cree) > depuisZ && c.statut !== 'refusee');
    const parMode = {};
    L.forEach(c => { const k = c.source === 'caisse' ? (c.mode === 'table' ? 'table' : 'comptoir') : c.mode; parMode[k] = (parMode[k] || 0) + c.total; });
    const total = L.reduce((s, c) => s + c.total, 0);
    fenetre(t('cloture') + ' · Z n° ' + (zs.length + 1),
      '<p class="aide">' + t('depuis') + ' ' + new Date(depuisZ).toLocaleString(ar() ? 'ar-DZ' : 'fr-FR') + '</p>' +
      '<ul class="liste-simple">' + Object.keys(parMode).map(k => '<li><span>' + t('m-' + k) + '</span><b>' + W.prix(parMode[k]) + '</b></li>').join('') + '</ul>' +
      '<p class="g-total"><span>' + L.length + ' ' + t('commandes-min') + '</span><b>' + W.prix(total) + '</b></p>' +
      '<button type="button" class="btn btn-or large" id="valider-z">' + t('valider-z') + '</button>' +
      (zs.length ? '<h3 class="mt">' + t('historique-z') + '</h3><ul class="liste-simple">' + zs.slice().reverse().map(z => '<li><b>Z ' + z.n + '</b><span>' + new Date(z.a).toLocaleString(ar() ? 'ar-DZ' : 'fr-FR') + ' · ' + z.nb + '</span><b>' + W.prix(z.total) + '</b></li>').join('') + '</ul>' : ''),
      z => { $('#valider-z', z).onclick = () => { zs.push({ n: zs.length + 1, de: depuisZ, a: Date.now(), nb: L.length, total, parMode }); W.ecrire('zs', zs); fermerFenetre(); W.toast(t('z-ok')); }; });
  }

  /* ---------- Livraisons (livreur) ---------- */
  VUES.livraisons = () => {
    const R = W.reglages();
    const moi = W.lire('livreur-actif', R.livreurs[0]);
    const L = W.commandes().filter(c => duJour(c) && c.mode === 'livraison');
    const aPrendre = L.filter(c => ['recue', 'preparation', 'prete'].includes(c.statut) && c.accepte && (!c.livreur || c.livreur === moi));
    const enCours = L.filter(c => c.statut === 'livraison' && c.livreur === moi);
    const faites = L.filter(c => c.statut === 'livree' && c.livreur === moi);
    const carte = c => '<article class="carte-livraison"><header><b>' + c.id + '</b><span class="pastille-st ' + c.statut + '">' + statutLib(c) + '</span></header>' +
      '<p class="cl-client"><b>' + esc(c.client.nom) + '</b> · <a href="tel:' + W.normaliserTel(c.client.tel) + '" dir="ltr">' + esc(c.client.tel) + '</a></p>' +
      '<p>' + W.icone('carte', 16) + ' ' + esc(adresseTxt(c.adresse)) + '</p>' +
      '<p class="g-total"><span>' + t('a-encaisser') + '</span><b>' + W.prix(c.total) + '</b></p>' +
      '<div class="cd-actions">' +
        (c.statut === 'prete' || c.statut === 'preparation' || c.statut === 'recue' ? (c.livreur ? '' : '<button type="button" class="btn btn-ligne" data-prendre="' + c.id + '">' + t('prendre') + '</button>') + (c.statut === 'prete' ? '<button type="button" class="btn btn-or" data-statut="' + c.id + '" data-vers="livraison">' + t('a-livraison') + '</button>' : '<span class="aide">' + t('en-cuisine') + '</span>') : '') +
        (c.statut === 'livraison' ? '<button type="button" class="btn btn-vert" data-statut="' + c.id + '" data-vers="livree">' + t('a-livree') + '</button>' : '') +
        '<a class="btn btn-ligne" href="tel:' + W.normaliserTel(c.client.tel) + '">' + W.icone('tel', 18) + t('appeler') + '</a>' +
        '<a class="btn btn-ligne" target="_blank" rel="noopener" href="' + lienMaps(c.adresse) + '">' + W.icone('carte', 18) + t('itineraire') + '</a>' +
        '<a class="btn btn-wa" target="_blank" rel="noopener" href="' + waClient(c.client.tel, t('wa-livreur').replace('{id}', c.id)) + '">' + W.icone('whatsapp', 18) + 'WhatsApp</a>' +
      '</div></article>';
    return '<label class="champ en-ligne"><span>' + t('je-suis') + '</span><select id="livreur-actif">' + R.livreurs.map(l => '<option' + (l === moi ? ' selected' : '') + '>' + esc(l) + '</option>').join('') + '</select></label>' +
      '<div class="grille-3">' +
        '<section><h2 class="h-col">' + t('l-en-cours') + ' <span class="compteur">' + enCours.length + '</span></h2>' + (enCours.map(carte).join('') || '<p class="vide">' + t('rien') + '</p>') + '</section>' +
        '<section><h2 class="h-col">' + t('l-a-prendre') + ' <span class="compteur">' + aPrendre.length + '</span></h2>' + (aPrendre.map(carte).join('') || '<p class="vide">' + t('rien') + '</p>') + '</section>' +
        '<section><h2 class="h-col">' + t('l-faites') + ' <span class="compteur">' + faites.length + '</span></h2>' + (faites.length ? '<ul class="liste-simple">' + faites.map(c => '<li><b>' + c.id + '</b><span>' + esc(c.adresse.zone) + ' · ' + W.heure(c.hist.livree || c.cree) + '</span><b>' + W.prix(c.total) + '</b></li>').join('') + '</ul><p class="g-total"><span>' + t('total') + '</span><b>' + W.prix(faites.reduce((s, c) => s + c.total, 0)) + '</b></p>' : '<p class="vide">' + t('rien') + '</p>') + '</section>' +
      '</div>';
  };

  /* ---------- Réservations & anniversaires ---------- */
  let resVue = 'jour', resDate = W.isoJour(Date.now());
  VUES.reservations = () => {
    const R = W.reglages();
    const toutes = W.reservations();
    const jours = resVue === 'jour' ? [resDate] : Array.from({ length: 7 }, (_, i) => W.isoJour(new Date(resDate + 'T12:00:00').getTime() + i * 86400e3));
    const bloc = iso => {
      const rs = toutes.filter(r => r.jour === iso).sort((a, b) => a.heure.localeCompare(b.heure));
      const couverts = rs.filter(r => r.statut !== 'refusee').reduce((s, r) => s + r.personnes, 0);
      const parCreneau = {};
      rs.filter(r => r.statut !== 'refusee').forEach(r => { const h = r.heure.slice(0, 2); parCreneau[h] = (parCreneau[h] || 0) + r.personnes; });
      const sature = Object.values(parCreneau).some(v => v > R.capacite);
      return '<section class="panneau jour-res"><h2>' + W.dateLongue(iso) + ' <span class="compteur">' + rs.length + '</span> <small>' + couverts + ' ' + t('couverts') + '</small>' + (sature ? ' <span class="pastille-st refusee">' + t('complet') + '</span>' : '') + '</h2>' +
        (Object.keys(parCreneau).length ? '<div class="creneaux">' + Object.keys(parCreneau).sort().map(h => '<span class="creneau"><b>' + h + ' h</b><i><em style="width:' + Math.min(100, Math.round(parCreneau[h] / R.capacite * 100)) + '%"></em></i><small>' + parCreneau[h] + ' / ' + R.capacite + '</small></span>').join('') + '</div>' : '') +
        (rs.length ? '<ul class="res-liste">' + rs.map(r => '<li class="res ' + r.statut + '"><div class="res-h"><b>' + r.heure + '</b><span class="pastille-st ' + r.statut + '">' + t('rs-' + r.statut) + '</span></div>' +
          '<div class="res-info"><b>' + esc(r.nom) + '</b> · ' + r.personnes + ' ' + t('pers') + (r.bebe ? ' · ' + r.bebe + ' ' + t('bebe-court') : '') + (r.occasion ? ' · ' + t('occ-' + r.occasion) : '') + ' · <a href="tel:' + W.normaliserTel(r.tel) + '" dir="ltr">' + esc(r.tel) + '</a>' +
          (r.remarque ? '<br><small>« ' + esc(r.remarque) + ' »</small>' : '') +
          (r.precommande && r.precommande.length ? '<br><small>' + t('precommande') + ' : ' + r.precommande.map(l => l.qte + '× ' + esc(W.libelleLigne(l).nom)).join(', ') + '</small>' : '') + '</div>' +
          '<div class="cd-actions">' + (r.statut === 'attente' ? '<button type="button" class="btn btn-vert" data-res="' + r.id + '" data-res-st="confirmee">' + t('confirmer') + '</button><button type="button" class="btn btn-rouge" data-res="' + r.id + '" data-res-st="refusee">' + t('refuser') + '</button>' : '') +
          '<a class="btn btn-wa" target="_blank" rel="noopener" href="' + waClient(r.tel, t('wa-res').replace('{id}', r.id).replace('{date}', r.jour + ' ' + r.heure).replace('{statut}', t('rs-' + r.statut))) + '">' + W.icone('whatsapp', 18) + 'WhatsApp</a></div></li>').join('') + '</ul>' : '<p class="vide">' + t('aucune') + '</p>') +
        '</section>';
    };
    const ann = W.demandes().slice().sort((a, b) => a.jour.localeCompare(b.jour));
    const C = W.carte();
    const nomPlat = id => { const p = C.plats.find(x => x.id === id); return p ? W.nomL(p) : '—'; };
    return '<div class="barre-outils">' +
        '<div class="filtres" role="group" aria-label="' + t('affichage') + '"><button type="button" class="filtre' + (resVue === 'jour' ? ' actif' : '') + '" data-res-vue="jour" aria-pressed="' + (resVue === 'jour') + '">' + t('v-jour') + '</button><button type="button" class="filtre' + (resVue === 'semaine' ? ' actif' : '') + '" data-res-vue="semaine" aria-pressed="' + (resVue === 'semaine') + '">' + t('v-semaine') + '</button></div>' +
        '<div class="nav-date"><button type="button" class="btn-icone" data-res-dec="-1" aria-label="' + t('precedent') + '">‹</button><input type="date" id="res-date-g" value="' + resDate + '" aria-label="' + t('date') + '"><button type="button" class="btn-icone" data-res-dec="1" aria-label="' + t('suivant') + '">›</button></div>' +
        '<label class="champ en-ligne"><span>' + t('capacite') + '</span><input type="number" id="capacite" min="1" max="500" value="' + R.capacite + '"></label>' +
      '</div>' + jours.map(bloc).join('') +
      '<section class="panneau"><h2>' + t('anniv-titre') + ' <span class="compteur">' + ann.length + '</span></h2>' +
      (ann.length ? '<ul class="res-liste">' + ann.map(a => '<li class="res ' + a.statut + '"><div class="res-h"><b>' + a.id + '</b><span class="pastille-st ' + a.statut + '">' + t('rs-' + a.statut) + '</span></div>' +
        '<div class="res-info"><b>' + esc(a.nom) + '</b> · ' + W.dateLongue(a.jour) + ' ' + a.heure + ' · ' + a.enfants + ' ' + t('enfants') + (a.adultes ? ' + ' + a.adultes + ' ' + t('adultes') : '') + '<br><small>' + esc(nomPlat(a.menu)) + (a.dessert ? ' + ' + esc(nomPlat(a.dessert)) : '') + ' · ' + t('estimation') + ' ' + W.prix(a.estimation) + '</small>' + (a.remarque ? '<br><small>« ' + esc(a.remarque) + ' »</small>' : '') + '</div>' +
        '<div class="cd-actions">' + (a.statut === 'attente' ? '<button type="button" class="btn btn-vert" data-ann="' + a.id + '" data-ann-st="confirmee">' + t('confirmer') + '</button><button type="button" class="btn btn-rouge" data-ann="' + a.id + '" data-ann-st="refusee">' + t('refuser') + '</button>' : '') +
        '<a class="btn btn-wa" target="_blank" rel="noopener" href="' + waClient(a.tel, t('wa-anniv').replace('{id}', a.id)) + '">' + W.icone('whatsapp', 18) + 'WhatsApp</a></div></li>').join('') + '</ul>' : '<p class="vide">' + t('aucune') + '</p>') + '</section>';
  };

  /* ---------- Plat du jour & poisson du jour ---------- */
  VUES.jour = () => {
    const J = W.jour();
    const P = J.poisson;
    return '<div class="grille-2">' +
      '<section class="panneau"><h2>' + t('pdj') + '</h2><p class="aide">' + t('pdj-aide') + '</p>' +
      '<form id="f-pdj">' + J.plats.map((p, i) => '<fieldset class="g-fs ligne-pdj" data-i="' + i + '"><legend class="sr-only">' + t('pdj') + ' ' + (i + 1) + '</legend>' +
        '<label class="champ"><span>' + t('nom-fr') + '</span><input name="fr" value="' + esc(p.fr) + '"></label>' +
        '<label class="champ"><span>' + t('nom-ar') + '</span><input name="ar" value="' + esc(p.ar) + '" dir="rtl"></label>' +
        '<label class="champ"><span>' + t('prix') + ' (DA)</span><input name="prix" type="number" min="0" step="50" value="' + p.prix + '"></label>' +
        '<label class="case"><input type="checkbox" name="actif"' + (p.actif ? ' checked' : '') + '> <span>' + t('visible-site') + '</span></label>' +
        '<button type="button" class="btn-icone" data-suppr-pdj="' + i + '" aria-label="' + t('supprimer') + '">' + W.icone('poubelle', 18) + '</button></fieldset>').join('') +
      '<div class="cd-actions"><button type="button" class="btn btn-ligne" data-action="ajout-pdj">' + W.icone('plus', 18) + t('ajouter-pdj') + '</button><button type="submit" class="btn btn-or">' + t('enregistrer') + '</button></div></form></section>' +
      '<section class="panneau"><h2>' + t('poisson') + '</h2><form id="f-poisson">' +
        '<label class="case"><input type="checkbox" name="actif"' + (P.actif ? ' checked' : '') + '> <span>' + t('arrivage-aujourdhui') + '</span></label>' +
        '<label class="champ"><span>' + t('especes-fr') + '</span><input name="fr" value="' + esc(P.especes.fr) + '"></label>' +
        '<label class="champ"><span>' + t('especes-ar') + '</span><input name="ar" value="' + esc(P.especes.ar) + '" dir="rtl"></label>' +
        '<label class="champ"><span>' + t('prix-kg') + '</span><input name="prixKg" type="number" min="0" step="100" value="' + (P.prixKg || 0) + '"></label>' +
        '<p class="aide">' + t('prix-kg-aide') + '</p>' +
        '<button type="submit" class="btn btn-or">' + t('enregistrer') + '</button></form>' +
        '<figure class="cadre-photo petit"><img src="img/etal-poissons.jpg" alt="' + t('alt-etal') + '" width="1179" height="1380"></figure></section></div>';
  };

  /* ---------- Carte modifiable ---------- */
  let carteCat = 'pizzas', carteRecherche = '';
  VUES.carte = () => {
    const C = W.carte();
    const q = carteRecherche.toLowerCase();
    const plats = C.plats.filter(p => q ? (p.fr + ' ' + p.ar).toLowerCase().includes(q) : p.cat === carteCat);
    const cat = C.categories.find(c => c.id === carteCat);
    return '<div class="barre-outils"><div class="cats-caisse">' + C.categories.map(c => '<button type="button" class="filtre' + (c.id === carteCat && !q ? ' actif' : '') + '" data-cat-carte="' + c.id + '" aria-pressed="' + (c.id === carteCat && !q) + '">' + esc(W.nomL(c)) + '</button>').join('') + '</div>' +
      '<label class="champ en-ligne recherche-g"><span class="sr-only">' + t('rechercher') + '</span><input type="search" id="carte-recherche" placeholder="' + t('rechercher') + '" value="' + esc(carteRecherche) + '"></label></div>' +
      (!q ? '<section class="panneau"><h2>' + t('categorie') + '</h2><div class="ligne-champs-g"><label class="champ"><span>' + t('nom-fr') + '</span><input data-cat-nom="fr" value="' + esc(cat.fr) + '"></label><label class="champ"><span>' + t('nom-ar') + '</span><input data-cat-nom="ar" dir="rtl" value="' + esc(cat.ar) + '"></label></div></section>' : '') +
      '<section class="panneau"><h2>' + t('plats') + ' <span class="compteur">' + plats.length + '</span></h2><div class="table-defile"><table class="table-carte"><thead><tr><th scope="col">' + t('photo') + '</th><th scope="col">' + t('plat') + '</th><th scope="col">' + t('prix') + '</th><th scope="col">' + t('dispo') + '</th></tr></thead><tbody>' +
      plats.map(p => '<tr data-plat-edit="' + p.id + '"><td class="td-photo">' + (p.photo ? '<img src="' + esc(p.photo) + '" alt="" width="64" height="48">' : '<span class="picto-vide">' + W.picto((C.categories.find(c => c.id === p.cat) || {}).icone, 26) + '</span>') +
        '<label class="btn-icone" title="' + t('ajouter-photo') + '">' + W.icone('photo', 18) + '<span class="sr-only">' + t('ajouter-photo') + ' ' + esc(p.fr) + '</span><input type="file" accept="image/*" capture="environment" data-photo="' + p.id + '" hidden></label>' +
        (p.photo ? '<button type="button" class="btn-icone" data-suppr-photo="' + p.id + '" aria-label="' + t('retirer-photo') + '">' + W.icone('poubelle', 16) + '</button>' : '') + '</td>' +
        '<td><input class="in-nom" data-champ="fr" value="' + esc(p.fr) + '" aria-label="' + t('nom-fr') + '"><input class="in-nom ar" data-champ="ar" dir="rtl" value="' + esc(p.ar) + '" aria-label="' + t('nom-ar') + '"></td>' +
        '<td>' + (p.tailles ? '<div class="prix-tailles">' + D.TAILLES.map(tl => '<label><span>' + esc(W.nomL(tl)) + '</span><input type="number" min="0" step="50" data-taille="' + tl.id + '" value="' + p.tailles[tl.id] + '"></label>').join('') + '</div>'
          : '<input type="number" min="0" step="50" data-champ="prix" value="' + p.prix + '" aria-label="' + t('prix') + ' ' + esc(p.fr) + '">') + '</td>' +
        '<td><label class="interrupteur"><input type="checkbox" data-champ="dispo"' + (p.dispo ? ' checked' : '') + '><span class="sr-only">' + t('dispo') + ' ' + esc(p.fr) + '</span><i aria-hidden="true"></i></label></td></tr>').join('') +
      '</tbody></table></div>' + (!q ? '<button type="button" class="btn btn-ligne" data-action="ajout-plat">' + W.icone('plus', 18) + t('ajouter-plat') + '</button>' : '') + '</section>' +
      (carteCat === 'pizzas' && !q ? '<section class="panneau"><h2>' + t('supplements') + '</h2><div class="table-defile"><table class="table-carte"><thead><tr><th scope="col">' + t('supplement') + '</th><th scope="col">Simple</th><th scope="col">Méga</th></tr></thead><tbody>' +
        C.supplements.map(s => '<tr data-supp-edit="' + s.id + '"><td>' + esc(W.nomL(s)) + '</td><td><input type="number" min="0" step="50" data-supp-champ="simple" value="' + s.simple + '" aria-label="' + esc(s.fr) + ' Simple"></td><td><input type="number" min="0" step="50" data-supp-champ="mega" value="' + s.mega + '" aria-label="' + esc(s.fr) + ' Méga"></td></tr>').join('') +
        '</tbody></table></div><p class="aide">' + t('supps-regle') + '</p></section>' : '');
  };
  function majPlat(id, fn) {
    const C = W.carte();
    const p = C.plats.find(x => x.id === id);
    if (!p) return;
    fn(p, C);
    W.ecrire('carte', C);
  }
  /* Photo depuis le téléphone : compressée (max 720 px, JPEG 0,72) */
  function compresserPhoto(fichier) {
    return new Promise((ok, ko) => {
      const lecteur = new FileReader();
      lecteur.onload = () => {
        const img = new Image();
        img.onload = () => {
          const max = 720, r = Math.min(1, max / Math.max(img.width, img.height));
          const cv = document.createElement('canvas');
          cv.width = Math.round(img.width * r); cv.height = Math.round(img.height * r);
          cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
          ok(cv.toDataURL('image/jpeg', 0.72));
        };
        img.onerror = ko; img.src = lecteur.result;
      };
      lecteur.onerror = ko; lecteur.readAsDataURL(fichier);
    });
  }

  /* ---------- Clients & fidélité ---------- */
  let clientsRecherche = '';
  VUES.clients = () => {
    const R = W.reglages();
    const F = R.fidelite;
    const parTel = {};
    W.commandes().filter(c => c.client && c.client.tel && c.statut !== 'refusee').forEach(c => {
      const k = W.normaliserTel(c.client.tel);
      const e = parTel[k] = parTel[k] || { nom: c.client.nom, tel: c.client.tel, nb: 0, total: 0, dernier: 0 };
      e.nb++; e.total += c.total; if (c.cree > e.dernier) { e.dernier = c.cree; e.nom = c.client.nom; }
    });
    let L = Object.values(parTel).sort((a, b) => b.total - a.total);
    if (clientsRecherche) L = L.filter(c => (c.nom + ' ' + c.tel).toLowerCase().includes(clientsRecherche.toLowerCase()));
    const pts = c => Math.floor(c.total / 100) * F.pointsPar100;
    return '<div class="grille-2 large-gauche"><section class="panneau"><h2>' + t('clients') + ' <span class="compteur">' + L.length + '</span></h2>' +
      '<label class="champ"><span class="sr-only">' + t('rechercher') + '</span><input type="search" id="clients-recherche" placeholder="' + t('rechercher-client') + '" value="' + esc(clientsRecherche) + '"></label>' +
      '<div class="table-defile"><table class="table-carte"><thead><tr><th scope="col">' + t('client') + '</th><th scope="col">' + t('k-cmd') + '</th><th scope="col">' + t('total') + '</th>' + (F.actif ? '<th scope="col">' + t('points') + '</th>' : '') + '<th scope="col"><span class="sr-only">WhatsApp</span></th></tr></thead><tbody>' +
      L.map(c => '<tr><td><b>' + esc(c.nom) + '</b><br><small dir="ltr">' + esc(c.tel) + '</small></td><td>' + c.nb + '</td><td>' + W.prix(c.total) + '</td>' +
        (F.actif ? '<td>' + pts(c) + (pts(c) >= F.seuil ? ' <span class="pastille-st confirmee">' + t('remise-dispo') + ' ' + W.prix(F.remise) + '</span>' : '') + '</td>' : '') +
        '<td><a class="btn-icone" target="_blank" rel="noopener" href="' + waClient(c.tel, t('wa-client-simple')) + '" aria-label="WhatsApp ' + esc(c.nom) + '">' + W.icone('whatsapp', 18) + '</a></td></tr>').join('') +
      '</tbody></table></div></section>' +
      '<section class="panneau"><h2>' + t('fidelite') + '</h2><form id="f-fidelite">' +
        '<label class="case"><input type="checkbox" name="actif"' + (F.actif ? ' checked' : '') + '> <span>' + t('fid-actif') + '</span></label>' +
        '<label class="champ"><span>' + t('fid-points') + '</span><input type="number" name="pointsPar100" min="0" value="' + F.pointsPar100 + '"></label>' +
        '<label class="champ"><span>' + t('fid-seuil') + '</span><input type="number" name="seuil" min="1" value="' + F.seuil + '"></label>' +
        '<label class="champ"><span>' + t('fid-remise') + '</span><input type="number" name="remise" min="0" step="50" value="' + F.remise + '"></label>' +
        '<button type="submit" class="btn btn-or">' + t('enregistrer') + '</button></form></section></div>';
  };

  /* ---------- Réglages ---------- */
  VUES.reglages = () => {
    const R = W.reglages();
    const jours = t('jours');
    return '<form id="f-reglages" class="grille-2">' +
      '<section class="panneau"><h2>' + t('etablissement') + '</h2>' +
        '<label class="champ"><span>' + t('tel') + ' 1</span><input name="tel1" value="' + esc(R.tel1) + '"></label>' +
        '<label class="champ"><span>' + t('tel') + ' 2</span><input name="tel2" value="' + esc(R.tel2) + '"></label>' +
        '<label class="champ"><span>' + t('whatsapp-num') + '</span><input name="whatsapp" value="' + esc(R.whatsapp) + '"></label>' +
        '<label class="champ"><span>' + t('prix-sauce') + '</span><input type="number" name="prixSauce" min="0" step="50" value="' + R.prixSauce + '"></label>' +
        '<label class="champ"><span>' + t('nb-tables') + '</span><input type="number" name="tables" min="1" max="80" value="' + R.tables + '"></label>' +
        '<label class="champ"><span>' + t('capacite') + '</span><input type="number" name="capacite" min="1" max="500" value="' + R.capacite + '"></label>' +
        '<label class="champ"><span>' + t('livreurs') + '</span><input name="livreurs" value="' + esc(R.livreurs.join(', ')) + '"></label>' +
      '</section>' +
      '<section class="panneau"><h2>' + t('horaires') + '</h2><div class="table-defile"><table class="table-carte horaires-g"><thead><tr><th scope="col">' + t('jour') + '</th><th scope="col">' + t('ouvert') + '</th><th scope="col">' + t('de') + '</th><th scope="col">' + t('a') + '</th></tr></thead><tbody>' +
        [6, 0, 1, 2, 3, 4, 5].map(j => { const h = R.horaires[j]; return '<tr><th scope="row">' + jours[j] + '</th><td><input type="checkbox" name="ouvert-' + j + '"' + (h.ouvert ? ' checked' : '') + ' aria-label="' + t('ouvert') + ' ' + jours[j] + '"></td><td><input type="time" name="de-' + j + '" value="' + h.de + '" aria-label="' + t('de') + ' ' + jours[j] + '"></td><td><input type="time" name="a-' + j + '" value="' + h.a + '" aria-label="' + t('a') + ' ' + jours[j] + '"></td></tr>'; }).join('') +
      '</tbody></table></div><p class="aide">' + t('horaires-aide') + '</p></section>' +
      '<section class="panneau pleine"><h2>' + t('zones') + '</h2><div class="table-defile"><table class="table-carte"><thead><tr><th scope="col">' + t('zone') + '</th><th scope="col">' + t('frais') + '</th><th scope="col">' + t('minimum') + '</th><th scope="col">' + t('delai') + '</th><th scope="col">' + t('active') + '</th><th scope="col"><span class="sr-only">' + t('supprimer') + '</span></th></tr></thead><tbody>' +
        R.zones.map((z, i) => '<tr><td><input name="z-nom-' + i + '" value="' + esc(z.nom) + '" aria-label="' + t('zone') + '"></td><td><input type="number" name="z-frais-' + i + '" min="0" step="50" value="' + z.frais + '" aria-label="' + t('frais') + ' ' + esc(z.nom) + '"></td><td><input type="number" name="z-min-' + i + '" min="0" step="100" value="' + z.min + '" aria-label="' + t('minimum') + ' ' + esc(z.nom) + '"></td><td><input type="number" name="z-delai-' + i + '" min="5" step="5" value="' + z.delai + '" aria-label="' + t('delai') + ' ' + esc(z.nom) + '"></td><td><input type="checkbox" name="z-actif-' + i + '"' + (z.actif ? ' checked' : '') + ' aria-label="' + t('active') + ' ' + esc(z.nom) + '"></td><td><button type="button" class="btn-icone" data-suppr-zone="' + i + '" aria-label="' + t('supprimer') + ' ' + esc(z.nom) + '">' + W.icone('poubelle', 16) + '</button></td></tr>').join('') +
      '</tbody></table></div><button type="button" class="btn btn-ligne" data-action="ajout-zone">' + W.icone('plus', 18) + t('ajouter-zone') + '</button></section>' +
      '<div class="pleine barre-enregistrer"><button type="submit" class="btn btn-or">' + t('enregistrer') + '</button></div></form>';
  };
  function lireReglages(f) {
    const R = W.reglages();
    const fd = new FormData(f);
    ['tel1', 'tel2', 'whatsapp'].forEach(k => { R[k] = String(fd.get(k) || '').trim(); });
    R.prixSauce = Number(fd.get('prixSauce')) || 0;
    R.tables = Math.max(1, Number(fd.get('tables')) || 1);
    R.capacite = Math.max(1, Number(fd.get('capacite')) || 1);
    R.livreurs = String(fd.get('livreurs') || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!R.livreurs.length) R.livreurs = ['Livreur 1'];
    R.horaires = R.horaires.map(h => ({ j: h.j, ouvert: !!fd.get('ouvert-' + h.j), de: fd.get('de-' + h.j) || h.de, a: fd.get('a-' + h.j) || h.a }));
    R.zones = R.zones.map((z, i) => ({ nom: String(fd.get('z-nom-' + i) || z.nom).trim(), frais: Number(fd.get('z-frais-' + i)) || 0, min: Number(fd.get('z-min-' + i)) || 0, delai: Number(fd.get('z-delai-' + i)) || 30, actif: !!fd.get('z-actif-' + i) })).filter(z => z.nom);
    return R;
  }

  /* ---------- Mise en service ---------- */
  VUES.service = () => {
    const prod = W.lire('production', false);
    return '<section class="panneau etroit"><h2>' + t('service-titre') + '</h2><p>' + t('service-txt') + '</p>' +
      '<ul class="liste-coches"><li>' + W.icone('check', 16) + t('garde-carte') + '</li><li>' + W.icone('check', 16) + t('garde-reglages') + '</li><li>' + W.icone('fermer', 16) + t('efface-donnees') + '</li></ul>' +
      '<p class="statut-prod">' + (prod ? t('mode-prod') : t('mode-demo')) + '</p>' +
      '<div class="cd-actions"><button type="button" class="btn btn-rouge" data-action="mise-en-service">' + t('mettre-en-service') + '</button>' +
      '<button type="button" class="btn btn-ligne" data-action="recharger-demo">' + t('recharger-demo') + '</button></div></section>';
  };

  /* ==================================================================
     Navigation, rendu, évènements
     ================================================================== */
  function pagesAutorisees() { return PAGES.filter(p => p[3].includes(role)); }
  function rendreNav() {
    const nbAttente = W.commandes().filter(c => duJour(c) && c.statut === 'recue' && !c.accepte).length;
    const nbRes = W.reservations().filter(r => r.statut === 'attente').length + W.demandes().filter(a => a.statut === 'attente').length;
    $('#nav-gestion').innerHTML = pagesAutorisees().map(([id, lib]) => '<a href="#' + id + '" class="bl-lien' + (id === page ? ' actif' : '') + '"' + (id === page ? ' aria-current="page"' : '') + ' data-page="' + id + '">' + W.icone(ICONES_PAGES[id], 20) + '<span>' + t(lib) + '</span>' +
      (id === 'commandes' && nbAttente ? '<span class="bulle">' + nbAttente + '</span>' : '') + (id === 'reservations' && nbRes ? '<span class="bulle">' + nbRes + '</span>' : '') + '</a>').join('');
  }
  function rendre() {
    if (!role) return;
    const autor = pagesAutorisees().map(p => p[0]);
    if (!autor.includes(page)) page = autor[0];
    rendreNav();
    const def = PAGES.find(p => p[0] === page);
    $('#titre-page').textContent = t(def[1]);
    // Conserver la position de défilement et le focus lors des rafraîchissements en direct
    const y = window.scrollY;
    const actif = document.activeElement && document.activeElement.id;
    $('#vue').innerHTML = VUES[page]();
    $('#vue').dataset.page = page;
    window.scrollTo(0, y);
    if (actif && document.getElementById(actif) && /recherche/.test(actif)) { const el = document.getElementById(actif); el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
  }
  function allerA(p) { page = p; try { history.replaceState(null, '', '#' + p); } catch (e) {} rendre(); $('#vue').focus({ preventScroll: true }); window.scrollTo(0, 0); }

  function connecter(code) {
    const r = CODES[code];
    if (!r) { $('#pin-erreur').textContent = t('pin-faux'); $('#pin').value = ''; return; }
    role = r; session.set({ role });
    $('#connexion').hidden = true; $('#app').hidden = false;
    $('#role-badge').textContent = t('r-' + role);
    const h = location.hash.slice(1);
    page = pagesAutorisees().some(p => p[0] === h) ? h : pagesAutorisees()[0][0];
    rendre();
  }
  function deconnecter() { session.effacer(); role = null; $('#app').hidden = true; $('#connexion').hidden = false; $('#pin').value = ''; $('#pin').focus(); }

  function appliquerLangue() {
    W.appliquerLangue(T);
    $('#pave').innerHTML = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'OK'].map(k => '<button type="button" data-touche="' + k + '"' + (k === 'C' ? ' aria-label="' + t('effacer') + '"' : '') + '>' + (k === 'C' ? '⌫' : k) + '</button>').join('');
    $('#btn-son').innerHTML = W.icone('son', 20) + '<span class="sr-only">' + t('son') + '</span>';
    $('#btn-son').setAttribute('aria-pressed', String(W.lire('son', true)));
    $('#btn-son').title = t('son');
    $('#btn-sortir').innerHTML = W.icone('deconnexion', 20) + '<span class="sr-only">' + t('sortir') + '</span>';
    $('#btn-sortir').title = t('sortir');
    if (role) $('#role-badge').textContent = t('r-' + role);
    rendre();
  }

  function brancher() {
    $('#logo-connexion').innerHTML = W.logoSVG(96, 'Wood Pecker Draria');
    $('#logo-app').innerHTML = W.logoSVG(40, 'Wood Pecker Draria');
    $$('[data-lang-btn]').forEach(b => b.addEventListener('click', () => { W.ecrire('langue', b.dataset.langBtn); appliquerLangue(); }));
    $('#form-pin').addEventListener('submit', ev => { ev.preventDefault(); connecter($('#pin').value); });
    $('#pin').addEventListener('input', ev => { ev.target.value = ev.target.value.replace(/\D/g, '').slice(0, 4); $('#pin-erreur').textContent = ''; if (ev.target.value.length === 4) connecter(ev.target.value); });
    $('#pave').addEventListener('click', ev => {
      const k = ev.target.closest('[data-touche]'); if (!k) return;
      const i = $('#pin');
      if (k.dataset.touche === 'C') i.value = i.value.slice(0, -1);
      else if (k.dataset.touche === 'OK') connecter(i.value);
      else if (i.value.length < 4) { i.value += k.dataset.touche; if (i.value.length === 4) connecter(i.value); }
    });
    $('#btn-sortir').addEventListener('click', deconnecter);
    $('#btn-son').addEventListener('click', () => { const v = !W.lire('son', true); W.ecrire('son', v); $('#btn-son').setAttribute('aria-pressed', String(v)); if (v) bip(); });
    $('#nav-gestion').addEventListener('click', ev => { const a = ev.target.closest('[data-page]'); if (a) { ev.preventDefault(); allerA(a.dataset.page); } });
    $('#dlg-g').addEventListener('click', ev => { if (ev.target === $('#dlg-g') || ev.target.closest('[data-fermer-dlg]')) fermerFenetre(); });

    /* Clics dans la vue */
    $('#vue').addEventListener('click', async ev => {
      const el = ev.target.closest('button, a, [data-cmd]');
      if (!el) return;
      const d = el.dataset;
      if (d.filtre) { filtreCmd = d.filtre; cmdSel = null; rendre(); }
      else if (d.cmd) { cmdSel = d.cmd; rendre(); }
      else if (d.accepter) { changerStatut(d.accepter, 'recue'); majCommande(d.accepter, c => { c.accepte = true; }); W.toast(t('acceptee') + ' · ' + d.accepter); rendre(); }
      else if (d.refuser) { if (confirm(t('confirmer-refus'))) { changerStatut(d.refuser, 'refusee'); rendre(); } }
      else if (d.statut) { changerStatut(d.statut, d.vers); rendre(); }
      else if (d.ticket) imprimerTicket(d.ticket);
      else if (d.prendre) { const moi = W.lire('livreur-actif', W.reglages().livreurs[0]); majCommande(d.prendre, c => { c.livreur = moi; }); rendre(); }
      else if (d.cible) { caisse.cible = 'comptoir'; caisse.table = null; rendre(); }
      else if (d.table) { caisse.cible = 'table'; caisse.table = d.table; rendre(); }
      else if (d.catCaisse) { caisse.cat = d.catCaisse; rendre(); }
      else if (d.platCaisse) optionsCaisse(W.carte().plats.find(p => p.id === d.platCaisse));
      else if (d.jourCaisse) { const p = W.jour().plats.find(x => x.id === d.jourCaisse); caisse.lignes.push({ id: p.id, nom: p.fr, ar: p.ar, cat: 'jour', qte: 1, pu: p.prix }); rendre(); }
      else if (d.retirer != null && d.retirer !== '') { const l = caisse.lignes[Number(d.retirer)]; if (l.qte > 1) l.qte--; else caisse.lignes.splice(Number(d.retirer), 1); rendre(); }
      else if (d.resVue) { resVue = d.resVue; rendre(); }
      else if (d.resDec) { resDate = W.isoJour(new Date(resDate + 'T12:00:00').getTime() + Number(d.resDec) * (resVue === 'jour' ? 1 : 7) * 86400e3); rendre(); }
      else if (d.res) { const L = W.reservations(); L.find(r => r.id === d.res).statut = d.resSt; W.ecrire('reservations', L); rendre(); }
      else if (d.ann) { const L = W.demandes(); L.find(r => r.id === d.ann).statut = d.annSt; W.ecrire('demandes', L); rendre(); }
      else if (d.catCarte) { carteCat = d.catCarte; carteRecherche = ''; rendre(); }
      else if (d.supprPhoto) { majPlat(d.supprPhoto, p => { p.photo = ''; }); rendre(); }
      else if (d.supprPdj != null && d.supprPdj !== '') { const J = W.jour(); J.plats.splice(Number(d.supprPdj), 1); W.ecrire('jour', J); rendre(); }
      else if (d.supprZone != null && d.supprZone !== '') { const R = lireReglages($('#f-reglages')); R.zones.splice(Number(d.supprZone), 1); W.ecrire('reglages', R); rendre(); }
      else if (d.action) actions(d.action);
    });

    /* Changements de champs (carte, livreur, capacité…) */
    $('#vue').addEventListener('change', async ev => {
      const el = ev.target;
      const tr = el.closest('[data-plat-edit]');
      if (tr && el.dataset.photo) {
        const f = el.files && el.files[0];
        if (f) { const url = await compresserPhoto(f); majPlat(el.dataset.photo, p => { p.photo = url; }); W.toast(t('photo-ok')); rendre(); }
        return;
      }
      if (tr) {
        const id = tr.dataset.platEdit;
        majPlat(id, p => {
          if (el.dataset.taille) p.tailles[el.dataset.taille] = Number(el.value) || 0, p.prix = p.tailles.simple;
          else if (el.dataset.champ === 'prix') p.prix = Number(el.value) || 0;
          else if (el.dataset.champ === 'dispo') p.dispo = el.checked;
          else if (el.dataset.champ) p[el.dataset.champ] = el.value.trim();
        });
        W.toast(t('enregistre'));
        return;
      }
      const se = el.closest('[data-supp-edit]');
      if (se) { const C = W.carte(); const s = C.supplements.find(x => x.id === se.dataset.suppEdit); s[el.dataset.suppChamp] = Number(el.value) || 0; W.ecrire('carte', C); W.toast(t('enregistre')); return; }
      if (el.dataset.catNom) { const C = W.carte(); C.categories.find(c => c.id === carteCat)[el.dataset.catNom] = el.value.trim(); W.ecrire('carte', C); W.toast(t('enregistre')); return; }
      if (el.dataset.livreur) { majCommande(el.dataset.livreur, c => { c.livreur = el.value; }); W.toast(t('enregistre')); return; }
      if (el.id === 'livreur-actif') { W.ecrire('livreur-actif', el.value); rendre(); return; }
      if (el.id === 'capacite') { const R = W.reglages(); R.capacite = Math.max(1, Number(el.value) || 1); W.ecrire('reglages', R); rendre(); return; }
      if (el.id === 'res-date-g') { resDate = el.value || resDate; rendre(); }
    });
    $('#vue').addEventListener('input', ev => {
      if (ev.target.id === 'carte-recherche') { carteRecherche = ev.target.value; rendre(); }
      if (ev.target.id === 'clients-recherche') { clientsRecherche = ev.target.value; rendre(); }
    });

    /* Formulaires */
    $('#vue').addEventListener('submit', ev => {
      ev.preventDefault();
      const f = ev.target;
      if (f.id === 'f-pdj') {
        const J = W.jour();
        J.plats = $$('.ligne-pdj', f).map((fs, i) => ({ id: (J.plats[i] && J.plats[i].id) || 'pj' + Date.now() + i, fr: $('[name="fr"]', fs).value.trim(), ar: $('[name="ar"]', fs).value.trim(), prix: Number($('[name="prix"]', fs).value) || 0, actif: $('[name="actif"]', fs).checked })).filter(p => p.fr);
        W.ecrire('jour', J); W.toast(t('pdj-ok')); rendre();
      }
      if (f.id === 'f-poisson') {
        const J = W.jour(); const fd = new FormData(f);
        J.poisson = { actif: !!fd.get('actif'), especes: { fr: String(fd.get('fr')).trim(), ar: String(fd.get('ar')).trim() }, prixKg: Number(fd.get('prixKg')) || 0 };
        W.ecrire('jour', J); W.toast(t('enregistre')); rendre();
      }
      if (f.id === 'f-fidelite') {
        const R = W.reglages(); const fd = new FormData(f);
        R.fidelite = { actif: !!fd.get('actif'), pointsPar100: Number(fd.get('pointsPar100')) || 0, seuil: Number(fd.get('seuil')) || 1, remise: Number(fd.get('remise')) || 0 };
        W.ecrire('reglages', R); W.toast(t('enregistre')); rendre();
      }
      if (f.id === 'f-reglages') { W.ecrire('reglages', lireReglages(f)); W.toast(t('enregistre')); rendre(); }
    });
  }

  function actions(a) {
    if (a === 'envoyer-cuisine') { const c = creerCommandeCaisse(false); W.toast(t('envoye-cuisine') + ' · ' + c.id); rendre(); }
    if (a === 'encaisser') encaisser();
    if (a === 'cloture') cloture();
    if (a === 'ajout-pdj') { const J = W.jour(); J.plats.push({ id: 'pj' + Date.now(), fr: '', ar: '', prix: 0, actif: true }); W.ecrire('jour', J, true); rendre(); const ins = $$('.ligne-pdj [name="fr"]'); if (ins.length) ins[ins.length - 1].focus(); }
    if (a === 'ajout-zone') { const R = lireReglages($('#f-reglages')); R.zones.push({ nom: t('nouvelle-zone'), frais: 300, min: 1500, delai: 45, actif: false }); W.ecrire('reglages', R); rendre(); }
    if (a === 'ajout-plat') {
      fenetre(t('ajouter-plat'), '<form id="f-nouveau"><label class="champ"><span>' + t('nom-fr') + '</span><input name="fr" required></label><label class="champ"><span>' + t('nom-ar') + '</span><input name="ar" dir="rtl"></label><label class="champ"><span>' + t('prix') + ' (DA)</span><input type="number" name="prix" min="0" step="50" required></label><button type="submit" class="btn btn-or large">' + t('ajouter') + '</button></form>', z => {
        $('#f-nouveau', z).onsubmit = ev => {
          ev.preventDefault(); const fd = new FormData(ev.target);
          const C = W.carte(); const prix = Number(fd.get('prix')) || 0;
          const p = { id: 'x' + Date.now(), cat: carteCat, fr: String(fd.get('fr')).trim(), ar: String(fd.get('ar')).trim(), prix, dispo: true, photo: '' };
          if (carteCat === 'pizzas') p.tailles = { mini: prix, simple: prix, semi: prix, mega: prix };
          C.plats.push(p); W.ecrire('carte', C); fermerFenetre(); rendre();
        };
      });
    }
    if (a === 'mise-en-service') {
      if (!confirm(t('confirmer-service'))) return;
      ['commandes', 'reservations', 'demandes', 'zs', 'mes-commandes', 'mes-reservations'].forEach(k => W.ecrire(k, []));
      W.ecrire('compteurs', { cmd: 1000, res: 0, ann: 0 });
      W.ecrire('production', true);
      connues = new Set();
      W.toast(t('service-ok')); rendre();
    }
    if (a === 'recharger-demo') { W.ecrire('production', false); window.WPK_SEED.generer(); W.ecrire('commandes', W.commandes()); connues = new Set(W.commandes().map(c => c.id)); W.toast(t('demo-ok')); rendre(); }
  }

  /* Synchronisation en direct avec le site et les autres postes */
  W.surChangement((cle, local) => {
    if (cle === 'commandes') detecterNouvelles();
    if (local || !role) { if (cle === 'langue' && !local) appliquerLangue(); return; }
    // Ne pas écraser un formulaire en cours de saisie
    const saisie = document.activeElement && $('#vue').contains(document.activeElement) && /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) && !/recherche/.test(document.activeElement.id);
    if (['commandes', 'reservations', 'demandes', 'carte', 'jour', 'reglages'].includes(cle) && !saisie) rendre();
    else rendreNav();
  });

  /* Horloge + minuteurs cuisine (chaque seconde, sans tout redessiner) */
  setInterval(() => {
    $('#horloge').textContent = W.heure(Date.now());
    $$('.minuteur[data-depart]').forEach(m => {
      const e = Date.now() - Number(m.dataset.depart), c = Number(m.dataset.cible);
      m.textContent = chrono(e) + ' / ' + c + ':00';
      m.className = 'minuteur ' + (e > c * 60e3 ? 'retard' : e > c * 0.75 * 60e3 ? 'bientot' : 'ok');
    });
  }, 1000);
  $('#horloge').textContent = W.heure(Date.now());

  brancher();
  appliquerLangue();
  const s = session.get();
  if (s && s.role) { role = s.role; $('#connexion').hidden = true; $('#app').hidden = false; const h = location.hash.slice(1); page = pagesAutorisees().some(p => p[0] === h) ? h : pagesAutorisees()[0][0]; appliquerLangue(); }
  else $('#pin').focus();
})();
