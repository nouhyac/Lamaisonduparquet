/* =====================================================================
   Wood Pecker Draria · noyau commun (site client + espace gérant)
   ---------------------------------------------------------------------
   - Stockage local préfixé « wpk- » + synchronisation entre onglets
     (BroadcastChannel + évènement « storage » en secours)
   - Horaires (ouvert / fermé, créneaux de réservation)
   - Formats (prix, heures, téléphone algérien)
   - Langue FR / AR (RTL)
   - Logo SVG redessiné + pictogrammes de catégories
   ===================================================================== */
(function () {
  'use strict';
  const D = window.WPK_DATA;
  const PREFIXE = 'wpk-';
  const VERSION = 3; // à incrémenter si la structure de la carte par défaut change

  /* ------------------------------------------------------------------
     1. Stockage + synchronisation
     ------------------------------------------------------------------ */
  const ecouteurs = [];
  let canal = null;
  try { canal = new BroadcastChannel('wpk-sync'); } catch (e) { canal = null; }

  function lire(cle, defaut) {
    try {
      const brut = localStorage.getItem(PREFIXE + cle);
      return brut == null ? clone(defaut) : JSON.parse(brut);
    } catch (e) { return clone(defaut); }
  }
  function ecrire(cle, valeur, silencieux) {
    try { localStorage.setItem(PREFIXE + cle, JSON.stringify(valeur)); } catch (e) { /* quota : on ignore */ }
    if (!silencieux) {
      if (canal) { try { canal.postMessage({ cle }); } catch (e) {} }
      ecouteurs.forEach(f => f(cle, true));
    }
  }
  function surChangement(fn) { ecouteurs.push(fn); }
  if (canal) canal.onmessage = ev => ecouteurs.forEach(f => f(ev.data && ev.data.cle, false));
  window.addEventListener('storage', ev => {
    if (ev.key && ev.key.indexOf(PREFIXE) === 0 && !canal) ecouteurs.forEach(f => f(ev.key.slice(PREFIXE.length), false));
  });
  function clone(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }

  /* Accès typés */
  const carte = () => lire('carte', null);
  const reglages = () => lire('reglages', D.REGLAGES);
  const jour = () => lire('jour', D.JOUR);
  const commandes = () => lire('commandes', []);
  const reservations = () => lire('reservations', []);
  const demandes = () => lire('demandes', []);

  /* Initialisation de la carte (copie modifiable par le gérant) */
  function initialiser() {
    if (lire('version', 0) !== VERSION || !carte()) {
      ecrire('carte', { categories: D.CATEGORIES, plats: D.PLATS, supplements: D.SUPPLEMENTS, sauces: D.SAUCES }, true);
      ecrire('version', VERSION, true);
      if (!localStorage.getItem(PREFIXE + 'reglages')) ecrire('reglages', D.REGLAGES, true);
      if (!localStorage.getItem(PREFIXE + 'jour')) ecrire('jour', D.JOUR, true);
    }
    if (window.WPK_SEED && !lire('production', false)) window.WPK_SEED.peutEtreGenerer();
  }

  /* Numéros de commande / réservation */
  function prochainNumero(type) {
    const cpt = lire('compteurs', { cmd: 1000, res: 100, ann: 10 });
    cpt[type] = (cpt[type] || 0) + 1;
    ecrire('compteurs', cpt, true);
    return cpt[type];
  }

  /* ------------------------------------------------------------------
     2. Formats
     ------------------------------------------------------------------ */
  function prix(n) {
    const s = Math.round(n || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return s + (langue() === 'ar' ? ' دج' : ' DA');
  }
  const deux = n => String(n).padStart(2, '0');
  const heure = ts => { const d = new Date(ts); return deux(d.getHours()) + ':' + deux(d.getMinutes()); };
  const isoJour = d => { d = new Date(d); return d.getFullYear() + '-' + deux(d.getMonth() + 1) + '-' + deux(d.getDate()); };
  function dateLongue(iso) {
    const d = new Date(iso + 'T12:00:00');
    return d.toLocaleDateString(langue() === 'ar' ? 'ar-DZ' : 'fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  }
  function echapper(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  /* Téléphone algérien : mobiles 05/06/07 (10 chiffres) ou fixe 02/03/04 (9 chiffres), +213 accepté */
  function normaliserTel(t) {
    let s = String(t || '').replace(/[\s.\-()]/g, '');
    if (s.indexOf('+213') === 0) s = '0' + s.slice(4);
    else if (s.indexOf('00213') === 0) s = '0' + s.slice(5);
    return s;
  }
  const telValide = t => /^0[567]\d{8}$/.test(normaliserTel(t)) || /^0[234]\d{7}$/.test(normaliserTel(t));
  const telInternational = t => '213' + normaliserTel(t).slice(1);
  function lienWhatsApp(numeroIntl, texte) {
    return 'https://wa.me/' + numeroIntl + '?text=' + encodeURIComponent(texte);
  }

  /* ------------------------------------------------------------------
     3. Horaires
     ------------------------------------------------------------------ */
  const enMinutes = hhmm => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };

  /* Renvoie { ouvert, jusqua, prochaine } pour l'instant donné */
  function etat(maintenant) {
    const H = reglages().horaires;
    const now = maintenant ? new Date(maintenant) : new Date();
    const m = now.getHours() * 60 + now.getMinutes();
    const auj = H[now.getDay()], hier = H[(now.getDay() + 6) % 7];
    // Créneau d'hier qui déborde après minuit
    if (hier.ouvert && enMinutes(hier.a) <= enMinutes(hier.de) && m < enMinutes(hier.a)) return { ouvert: true, jusqua: hier.a };
    if (auj.ouvert) {
      const de = enMinutes(auj.de), a = enMinutes(auj.a);
      const finJour = a <= de ? 24 * 60 : a;
      if (m >= de && m < finJour) return { ouvert: true, jusqua: auj.a };
      if (m < de) return { ouvert: false, prochaine: { jour: 0, heure: auj.de } };
    }
    for (let i = 1; i <= 7; i++) {
      const h = H[(now.getDay() + i) % 7];
      if (h.ouvert) return { ouvert: false, prochaine: { jour: i, heure: h.de } };
    }
    return { ouvert: false };
  }

  /* Créneaux de réservation (toutes les 30 min, jusqu'à 1 h avant la fermeture, au plus tard 23:30) */
  function creneaux(iso) {
    const h = reglages().horaires[new Date(iso + 'T12:00:00').getDay()];
    if (!h.ouvert) return [];
    const de = enMinutes(h.de);
    let a = enMinutes(h.a); if (a <= de) a += 24 * 60;
    const fin = Math.min(a - 60, 23 * 60 + 30);
    const out = [];
    for (let x = Math.ceil(de / 30) * 30; x <= fin; x += 30) out.push(deux(Math.floor(x / 60)) + ':' + deux(x % 60));
    return out;
  }

  /* Début de la « journée de service » (05:00) : sert aux statistiques du jour */
  function debutJournee(ts) {
    const d = ts ? new Date(ts) : new Date();
    if (d.getHours() < 5) d.setDate(d.getDate() - 1);
    d.setHours(5, 0, 0, 0);
    return d.getTime();
  }

  /* ------------------------------------------------------------------
     4. Langue
     ------------------------------------------------------------------ */
  const langue = () => lire('langue', 'fr');
  function appliquerLangue(dict) {
    const L = langue();
    document.documentElement.lang = L === 'ar' ? 'ar' : 'fr';
    document.documentElement.dir = L === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-t]').forEach(el => { el.textContent = tr(dict, el.dataset.t); });
    document.querySelectorAll('[data-t-ph]').forEach(el => { el.placeholder = tr(dict, el.dataset.tPh); });
    document.querySelectorAll('[data-t-aria]').forEach(el => { el.setAttribute('aria-label', tr(dict, el.dataset.tAria)); });
    document.querySelectorAll('[data-lang-btn]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.langBtn === L)));
  }
  function tr(dict, cle) {
    const e = dict[cle];
    if (!e) return cle;
    return langue() === 'ar' ? e[1] : e[0];
  }
  /* Nom localisé d'un objet {fr, ar} */
  const nomL = o => (o ? (langue() === 'ar' && o.ar ? o.ar : o.fr) : '');

  /* ------------------------------------------------------------------
     5. Calcul d'une ligne de panier (prix unitaire)
     ------------------------------------------------------------------ */
  function prixLigne(plat, opts, c) {
    c = c || carte();
    let pu = plat.tailles ? plat.tailles[opts.taille || 'simple'] : plat.prix;
    if (plat.tailles && (opts.taille === 'simple' || opts.taille === 'mega')) {
      (opts.supps || []).forEach(id => {
        const s = c.supplements.find(x => x.id === id);
        if (s) pu += s[opts.taille];
      });
    }
    if (plat.sauce === 'option' && opts.sauce) pu += reglages().prixSauce;
    return pu;
  }

  /* ------------------------------------------------------------------
     6. Logo redessiné (SVG inline) et pictogrammes
     ------------------------------------------------------------------ */
  // Tête de pivert stylisée : chapeau rouge à bandeau noir, plume jaune,
  // bec ocre souriant, huppe rouge, dans un disque blanc cerclé de noir + « WP ».
  function logoSVG(taille, titre) {
    const t = taille || 48;
    return '<svg class="logo-svg" width="' + t + '" height="' + t + '" viewBox="0 0 120 120" role="img" aria-label="' + echapper(titre || 'Wood Pecker Draria') + '">' +
      '<circle cx="60" cy="60" r="57" fill="#fff" stroke="#111" stroke-width="4"/>' +
      // Monogramme WP
      '<text x="80" y="60" font-family="Georgia,serif" font-weight="900" font-size="30" fill="#111" text-anchor="middle">W</text>' +
      '<text x="84" y="92" font-family="Georgia,serif" font-weight="900" font-size="30" fill="#111" text-anchor="middle">P</text>' +
      '<path d="M76 96 l14 0 l-7 -12 z" fill="#c62828"/>' +
      // Anneau de la tête
      '<circle cx="48" cy="70" r="29" fill="#f4f1ec" stroke="#111" stroke-width="3.5"/>' +
      // Huppe rouge à l'arrière
      '<path d="M62 50 q17 6 13 30 q-7 -8 -15 -7 z" fill="#c62828" stroke="#111" stroke-width="1.5"/>' +
      // Bec ocre + bouche
      '<path d="M44 72 q-22 -6 -27 2 q4 10 24 10 q10 0 16 -6 z" fill="#e2b56b" stroke="#111" stroke-width="1.8"/>' +
      '<path d="M41 83 q8 12 18 4 q-2 -9 -9 -9 z" fill="#d6455a" stroke="#111" stroke-width="1.4"/>' +
      // Yeux
      '<ellipse cx="46" cy="62" rx="5" ry="6.5" fill="#fff" stroke="#111" stroke-width="1.6"/>' +
      '<ellipse cx="57" cy="62" rx="5" ry="6.5" fill="#fff" stroke="#111" stroke-width="1.6"/>' +
      '<circle cx="47.5" cy="63" r="2.4" fill="#111"/><circle cx="58.5" cy="63" r="2.4" fill="#111"/>' +
      // Chapeau rouge (calotte + bord) avec bandeau noir
      '<path d="M30 48 q-2 -20 20 -21 q20 0 19 21 z" fill="#c62828" stroke="#111" stroke-width="2"/>' +
      '<rect x="30" y="40" width="39" height="7" fill="#111"/>' +
      '<ellipse cx="49" cy="50" rx="30" ry="6.5" fill="#c62828" stroke="#111" stroke-width="2"/>' +
      // Plume jaune
      '<path d="M64 38 q4 -22 16 -30 q0 18 -12 31 z" fill="#f2d33b" stroke="#111" stroke-width="1.4"/>' +
      '<path d="M66 37 q5 -14 12 -24" stroke="#8a7a12" stroke-width="1" fill="none"/>' +
      '</svg>';
  }

  // Pictogrammes au trait (or) par catégorie : système visuel sans photo
  const PICTOS = {
    pizza: '<path d="M8 12 Q24 4 40 12 L24 44 Z"/><path d="M10.5 16 Q24 9 37.5 16"/><circle cx="20" cy="20" r="2.2"/><circle cx="28" cy="22" r="2.2"/><circle cx="24" cy="31" r="2.2"/>',
    salade: '<path d="M6 24 h36 q-2 14 -18 16 q-16 -2 -18 -16 z"/><path d="M14 24 q-2 -10 8 -12 q2 6 -2 12"/><path d="M24 24 q2 -12 12 -10 q-2 8 -8 10"/>',
    soupe: '<path d="M6 24 h36 q-2 14 -18 16 q-16 -2 -18 -16 z"/><path d="M17 18 q-3 -4 0 -8 q3 -4 0 -8"/><path d="M25 18 q-3 -4 0 -8 q3 -4 0 -8"/><path d="M33 18 q-3 -4 0 -8 q3 -4 0 -8"/>',
    pasta: '<ellipse cx="24" cy="32" rx="19" ry="8"/><path d="M14 30 q10 -6 20 0 M16 34 q8 -4 16 0"/><path d="M32 6 v16 M29 6 v8 q0 4 3 4 q3 0 3 -4 v-8"/>',
    viande: '<path d="M10 20 q2 -12 16 -12 q14 0 14 12 q0 16 -16 18 q-16 0 -14 -18 z"/><circle cx="28" cy="20" r="4"/><path d="M16 28 q6 2 12 0"/>',
    volaille: '<path d="M30 8 q12 2 10 14 q-2 10 -14 10 l-8 8"/><path d="M30 8 q-12 0 -12 12 q0 8 8 12"/><path d="M18 40 l-4 4 M14 38 l-6 2 M20 42 l-2 6"/>',
    burger: '<path d="M8 22 q0 -14 16 -14 q16 0 16 14 z"/><path d="M6 27 h36"/><path d="M8 32 h32 q0 8 -8 8 h-16 q-8 0 -8 -8 z"/><circle cx="18" cy="15" r="1"/><circle cx="26" cy="13" r="1"/><circle cx="31" cy="17" r="1"/>',
    cadeau: '<rect x="8" y="20" width="32" height="22" rx="2"/><path d="M6 14 h36 v6 h-36 z"/><path d="M24 14 v28"/><path d="M24 14 q-10 -10 -12 -2 q0 4 12 2 q10 -10 12 -2 q0 4 -12 2"/>',
    gateau: '<path d="M8 40 h32 v-14 h-32 z"/><path d="M8 32 q4 3 8 0 q4 3 8 0 q4 3 8 0 q4 3 8 0"/><path d="M24 26 v-8"/><path d="M24 18 q-3 -4 0 -8 q3 4 0 8"/>',
    cocktail: '<path d="M8 8 h32 l-16 18 z"/><path d="M24 26 v14 M16 42 h16"/><circle cx="34" cy="10" r="4"/><path d="M30 4 l-6 10"/>',
    shake: '<path d="M14 14 h20 l-3 30 h-14 z"/><path d="M12 14 q12 -8 24 0"/><path d="M26 8 l6 -6"/><path d="M16 24 h16"/>',
    bouteille: '<path d="M20 4 h8 v8 q6 4 6 12 v18 q0 2 -2 2 h-16 q-2 0 -2 -2 v-18 q0 -8 6 -12 z"/><path d="M14 26 h20"/>',
    tasse: '<path d="M8 18 h26 v12 q0 10 -13 10 q-13 0 -13 -10 z"/><path d="M34 21 q8 0 8 6 q0 6 -8 6"/><path d="M15 12 q-2 -3 0 -6 M21 12 q-2 -3 0 -6 M27 12 q-2 -3 0 -6"/><path d="M6 44 h32"/>',
    poisson: '<path d="M6 24 q12 -14 28 0 q-16 14 -28 0 z"/><path d="M34 24 l8 -8 v16 z"/><circle cx="14" cy="22" r="1.6"/><path d="M20 18 q3 6 0 12"/>',
    etoile: '<path d="M24 4 l5 11 l12 -2 l-7 10 l7 10 l-12 -2 l-5 11 l-5 -11 l-12 2 l7 -10 l-7 -10 l12 2 z"/>'
  };
  function picto(nom, taille, classe) {
    const t = taille || 40;
    return '<svg class="picto ' + (classe || '') + '" width="' + t + '" height="' + t + '" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (PICTOS[nom] || PICTOS.etoile) + '</svg>';
  }

  /* Étoile art déco à 6 branches (deux triangles entrelacés) */
  function etoile6(t, classe) {
    t = t || 22;
    return '<svg class="etoile6 ' + (classe || '') + '" width="' + t + '" height="' + t + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M12 2 L21 17 H3 Z"/><path d="M12 22 L3 7 H21 Z"/><circle cx="12" cy="12" r="2.2"/></svg>';
  }

  /* Icônes d'interface (trait) */
  const ICONES = {
    panier: '<path d="M4 6 h2 l2 11 h10 l2 -8 H7"/><circle cx="9" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/>',
    tel: '<path d="M5 4 h4 l2 5 l-3 2 q2 4 5 5 l2 -3 l5 2 v4 q0 1 -1 1 Q4 20 4 5 q0 -1 1 -1 z"/>',
    calendrier: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10 h16 M9 3 v4 M15 3 v4"/>',
    loupe: '<circle cx="11" cy="11" r="6"/><path d="M16 16 l4 4"/>',
    fermer: '<path d="M6 6 l12 12 M18 6 l-12 12"/>',
    plus: '<path d="M12 5 v14 M5 12 h14"/>',
    moins: '<path d="M5 12 h14"/>',
    whatsapp: '<path d="M5 19 l1.2 -3.6 A8 8 0 1 1 9 18.6 z"/><path d="M9.5 9 q0 4 4.5 5.5 l1.2 -1.2 l1.6 0.8 q-0.3 1.6 -2 1.7 q-5 -0.6 -6.6 -5.8 q0 -1.6 1.6 -2 l0.8 1.6 z"/>',
    instagram: '<rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.6"/><circle cx="17" cy="7" r="0.8"/>',
    facebook: '<path d="M14 21 v-8 h3 l0.5 -3 H14 V8 q0 -1.5 1.5 -1.5 H17.5 V4 h-3 Q11 4 11 7.5 V10 H8 v3 h3 v8"/>',
    carte: '<path d="M12 21 s-6 -6 -6 -11 a6 6 0 0 1 12 0 c0 5 -6 11 -6 11 z"/><circle cx="12" cy="10" r="2.2"/>',
    horloge: '<circle cx="12" cy="12" r="8"/><path d="M12 7 v5 l3 2"/>',
    imprimer: '<path d="M7 9 V4 h10 v5"/><rect x="4" y="9" width="16" height="7" rx="1"/><path d="M7 14 h10 v6 H7 z"/>',
    livraison: '<path d="M3 7 h11 v8 H3 z M14 10 h4 l3 3 v2 h-7"/><circle cx="7" cy="17" r="1.6"/><circle cx="17" cy="17" r="1.6"/>',
    sac: '<path d="M6 8 h12 l-1 12 H7 z"/><path d="M9 8 V6 a3 3 0 0 1 6 0 v2"/>',
    table: '<path d="M4 9 h16 M6 9 v10 M18 9 v10 M8 13 h8"/>',
    check: '<path d="M5 12 l4 4 l10 -10"/>',
    son: '<path d="M4 9 h4 l5 -4 v14 l-5 -4 H4 z"/><path d="M16 9 q2 3 0 6 M18 7 q4 5 0 10"/>',
    deconnexion: '<path d="M10 4 H5 v16 h5 M15 8 l4 4 l-4 4 M19 12 H9"/>',
    menu: '<path d="M4 7 h16 M4 12 h16 M4 17 h16"/>',
    photo: '<rect x="3" y="6" width="18" height="14" rx="2"/><circle cx="12" cy="13" r="3.5"/><path d="M8 6 l2 -2 h4 l2 2"/>',
    poubelle: '<path d="M5 7 h14 M9 7 V4 h6 v3 M7 7 l1 13 h8 l1 -13"/>'
  };
  function icone(nom, t) {
    t = t || 20;
    return '<svg class="ico" width="' + t + '" height="' + t + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONES[nom] || '') + '</svg>';
  }

  /* Favicon : logo SVG en data-URI */
  function poserFavicon() {
    const l = document.createElement('link');
    l.rel = 'icon'; l.type = 'image/svg+xml';
    l.href = 'data:image/svg+xml,' + encodeURIComponent(logoSVG(64).replace('class="logo-svg" ', 'xmlns="http://www.w3.org/2000/svg" '));
    document.head.appendChild(l);
  }

  /* Petit message flottant */
  function toast(texte, type) {
    let zone = document.getElementById('toasts');
    if (!zone) { zone = document.createElement('div'); zone.id = 'toasts'; zone.setAttribute('role', 'status'); zone.setAttribute('aria-live', 'polite'); document.body.appendChild(zone); }
    const t = document.createElement('div');
    t.className = 'toast ' + (type || '');
    t.textContent = texte;
    zone.appendChild(t);
    setTimeout(() => { t.classList.add('sort'); setTimeout(() => t.remove(), 400); }, 3200);
  }

  /* Libellé d'une ligne de commande (nom + options) dans la langue active */
  function libelleLigne(l) {
    const nom = (l.pre ? l.pre + ' ' : '') + (langue() === 'ar' && l.ar ? l.ar : l.nom);
    const det = [];
    if (l.taille) det.push(nomL(D.TAILLES.find(t => t.id === l.taille)));
    if (l.choix) det.push(langue() === 'ar' && l.choixAr ? l.choixAr : l.choix);
    if (l.sauce) det.push((langue() === 'ar' ? 'صلصة ' : 'Sauce ') + (langue() === 'ar' && l.sauceAr ? l.sauceAr : l.sauce));
    (l.supps || []).forEach(s => det.push('+ ' + (langue() === 'ar' && s.ar ? s.ar : s.fr)));
    if (l.olives) det.push(langue() === 'ar' ? 'زيتون' : 'Olives');
    return { nom, det: det.join(' · ') };
  }

  window.WPK = {
    lire, ecrire, surChangement, carte, reglages, jour, commandes, reservations, demandes,
    initialiser, prochainNumero, prix, heure, isoJour, dateLongue, echapper, deux,
    normaliserTel, telValide, telInternational, lienWhatsApp,
    etat, creneaux, enMinutes, debutJournee, langue, appliquerLangue, tr, nomL,
    prixLigne, logoSVG, picto, etoile6, icone, poserFavicon, toast, libelleLigne, clone
  };
})();
