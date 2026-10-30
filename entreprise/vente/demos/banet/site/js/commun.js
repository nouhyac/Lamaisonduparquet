/* =========================================================================
   Banet el Baraka — noyau commun (site client + espace gérant)
   -------------------------------------------------------------------------
   - Stockage : localStorage, clés préfixées « bnb- »
   - Synchro temps réel entre onglets : BroadcastChannel « bnb-synchro »
     (+ évènement « storage » en secours)
   - Traductions FR / العربية (dictionnaire dans textes.js)
   - Outils partagés : prix, dates, horaires, téléphone, WhatsApp, devis, logo
   ========================================================================= */
(function () {
  'use strict';

  const D = window.BNB_DONNEES;
  const VERSION = '2'; // à incrémenter quand les données de démo changent
  const PREFIXE = 'bnb-';

  /* ---------------- Stockage ---------------- */
  function lire(cle, defaut) {
    try {
      const v = localStorage.getItem(PREFIXE + cle);
      return v === null ? defaut : JSON.parse(v);
    } catch (e) { return defaut; }
  }
  let canal = null;
  try { canal = new BroadcastChannel('bnb-synchro'); } catch (e) { canal = null; }
  function ecrire(cle, valeur) {
    const brut = JSON.stringify(valeur);
    try { localStorage.setItem(PREFIXE + cle, brut); } catch (e) { /* quota plein : on ignore */ }
    if (canal) canal.postMessage({ cle, brut });
  }
  const abonnes = [];
  function surChangement(fn) { abonnes.push(fn); }
  function prevenir(cle) { abonnes.forEach((fn) => { try { fn(cle); } catch (e) { console.warn(e); } }); }
  /* Entre deux onglets, le message BroadcastChannel peut arriver AVANT que
     localStorage soit à jour dans cet onglet : on attend la nouvelle valeur
     (quelques millisecondes) avant de prévenir l'interface. */
  if (canal) canal.onmessage = (ev) => {
    const d = ev.data || {};
    let essais = 0;
    (function attendre() {
      let actuel = null; try { actuel = localStorage.getItem(PREFIXE + d.cle); } catch (e) { /* rien */ }
      if (d.brut === undefined || actuel === d.brut || essais++ > 40) prevenir(d.cle);
      else setTimeout(attendre, 25);
    })();
  };
  // secours si BroadcastChannel n'existe pas (vieux navigateurs)
  window.addEventListener('storage', (ev) => { if (!canal && ev.key && ev.key.startsWith(PREFIXE)) prevenir(ev.key.slice(PREFIXE.length)); });

  /* Premier lancement : on installe la démo */
  function installer(force) {
    if (!force && lire('version') === VERSION) return;
    const ex = D.exemples(Date.now());
    ecrire('carte', { categories: D.categories, plats: D.plats, supplements: D.supplements });
    ecrire('reglages', D.reglages);
    ecrire('zones', D.zones);
    ecrire('traiteur', D.traiteur);
    ecrire('commandes', ex.commandes);
    ecrire('devis', ex.devis);
    ecrire('clients', ex.clients);
    ecrire('clotures', []);
    ecrire('compteur', { commande: 1001 + ex.commandes.length, devis: 1036 });
    ecrire('version', VERSION);
  }

  /* Numéros de commande / devis */
  function prochainNumero(type) {
    const c = lire('compteur', { commande: 1100, devis: 1100 });
    const n = c[type]; c[type] = n + 1; ecrire('compteur', c);
    return (type === 'commande' ? 'BB-' : 'DEV-') + n;
  }

  /* ---------------- Langue ---------------- */
  let langue = lire('langue', 'fr');
  function t(cle, vars) {
    const dico = window.BNB_TEXTES || {};
    const entree = dico[cle];
    let s = entree ? (entree[langue] || entree.fr) : cle;
    if (vars) Object.keys(vars).forEach((k) => { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  }
  /* nom traduit d'un objet {fr, ar} */
  function nom(o, champ) {
    if (!o) return '';
    if (champ) return (langue === 'ar' && o[champ + 'Ar']) || o[champ + 'Fr'] || o[champ] || '';
    return (langue === 'ar' && o.ar) || o.fr || '';
  }
  function appliquerTextes(racine) {
    racine = racine || document;
    racine.querySelectorAll('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t); });
    racine.querySelectorAll('[data-t-ph]').forEach((el) => { el.placeholder = t(el.dataset.tPh); });
    racine.querySelectorAll('[data-t-aria]').forEach((el) => { el.setAttribute('aria-label', t(el.dataset.tAria)); });
    racine.querySelectorAll('[data-t-title]').forEach((el) => { el.title = t(el.dataset.tTitle); });
    racine.querySelectorAll('[data-t-alt]').forEach((el) => { el.alt = t(el.dataset.tAlt); });
    document.documentElement.lang = langue;
    document.documentElement.dir = langue === 'ar' ? 'rtl' : 'ltr';
  }
  function changerLangue(l) { langue = l; ecrire('langue', l); appliquerTextes(); }

  /* ---------------- Formats ---------------- */
  function prix(n) {
    const s = Math.round(n || 0).toLocaleString('fr-FR').replace(/[  ]/g, ' ');
    return s + ' ' + (langue === 'ar' ? 'دج' : 'DA');
  }
  const pad = (n) => String(n).padStart(2, '0');
  function heure(ts) { const d = new Date(ts); return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function dateLongue(iso) {
    const d = typeof iso === 'string' ? new Date(iso + 'T12:00:00') : new Date(iso);
    return d.toLocaleDateString(langue === 'ar' ? 'ar-DZ-u-nu-latn' : 'fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }
  function dateCourte(iso) {
    const d = typeof iso === 'string' ? new Date(iso + 'T12:00:00') : new Date(iso);
    return d.toLocaleDateString(langue === 'ar' ? 'ar-DZ-u-nu-latn' : 'fr-FR', { day: 'numeric', month: 'short' });
  }
  function isoJour(d) { d = new Date(d); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function memeJour(a, b) { return isoJour(a) === isoJour(b); }
  /* échappement HTML pour tout texte saisi par un client */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

  /* ---------------- Horaires ---------------- */
  function minutes(hhmm) { const [h, m] = String(hhmm).split(':').map(Number); return h * 60 + (m || 0); }
  function etatOuverture(maintenant) {
    const R = lire('reglages', D.reglages);
    const d = new Date(maintenant || Date.now());
    const m = d.getHours() * 60 + d.getMinutes();
    const o = minutes(R.ouverture), f = minutes(R.fermeture);
    const ouvert = f > o ? (m >= o && m < f) : (m >= o || m < f);
    return { ouvert, ouverture: R.ouverture, fermeture: R.fermeture };
  }

  /* ---------------- Téléphone algérien ----------------
     Mobiles 05/06/07 + 8 chiffres, fixes 02/03/04 + 7 chiffres,
     avec ou sans +213 / 00213 */
  function telValide(s) {
    const n = String(s || '').replace(/[\s.\-()]/g, '');
    return /^(?:\+213|00213|0)(?:[567]\d{8}|[234]\d{7})$/.test(n);
  }
  function telInternational(s) {
    let n = String(s || '').replace(/\D/g, '');
    if (n.startsWith('00213')) n = n.slice(5); else if (n.startsWith('213')) n = n.slice(3); else if (n.startsWith('0')) n = n.slice(1);
    return '213' + n;
  }
  function lienWhatsApp(numero, texte) { return 'https://wa.me/' + numero + '?text=' + encodeURIComponent(texte); }
  function lienCarte(lat, lng) { return 'https://www.google.com/maps/search/?api=1&query=' + lat + ',' + lng; }

  /* ---------------- Statuts de commande ---------------- */
  const ORDRE = ['recue', 'preparation', 'prete', 'livraison', 'livree'];
  function etapesPour(mode) { return mode === 'livraison' ? ['recue', 'preparation', 'livraison', 'livree'] : ['recue', 'preparation', 'prete', 'livree']; }
  function libelleStatut(s, mode) {
    if (s === 'livree' && mode !== 'livraison') return t(mode === 'surplace' ? 'st.servie' : 'st.recuperee');
    if (s === 'prete' && mode === 'livraison') return t('st.prete_liv');
    return t('st.' + s);
  }
  /* sous-total d'une ligne de panier */
  function totalLigne(l) { return l.qte * (l.prix + (l.opts || []).reduce((a, o) => a + (o.prix || 0), 0)); }

  /* ---------------- Calcul d'un devis traiteur ---------------- */
  function calculDevis(dv, T, plats) {
    T = T || lire('traiteur', D.traiteur);
    plats = plats || lire('carte', {}).plats || D.plats;
    const invites = Math.max(0, Number(dv.invites) || 0);
    let base = 0, unites = 0;
    const formule = T.formules.find((f) => f.id === dv.formule);
    if (dv.mode === 'plateaux') {
      Object.keys(dv.pieces || {}).forEach((id) => {
        const q = Number(dv.pieces[id]) || 0; const pl = plats.find((x) => x.id === id);
        if (pl && q > 0) { base += q * pl.prix; unites += q; }
      });
    } else if (formule) { base = invites * formule.prix; unites = invites; }
    // remise dégressive (sur la nourriture uniquement)
    let pct = 0;
    (T.remises || []).forEach((r) => { if (unites >= r.des && r.pct > pct) pct = r.pct; });
    const remise = Math.round(base * pct / 100);
    // services
    let services = 0; const detail = [];
    (dv.options || []).forEach((id) => {
      const o = T.options.find((x) => x.id === id); if (!o) return;
      let m = 0, q = 1;
      if (o.mode === 'pers') { m = o.prix * invites; q = invites; }
      else if (o.mode === 'serveur') { q = Math.max(1, Math.ceil(invites / (o.ratio || 40))); m = q * o.prix; }
      else m = o.prix;
      services += m; detail.push({ id, o, q, montant: m });
    });
    const total = base - remise + services;
    const final = dv.prixFinal > 0 ? dv.prixFinal : total;
    const acompte = Math.ceil(final * (T.acompte || 30) / 100 / 100) * 100;
    return { base, remise, pct, services, detail, total, final, unites, parPers: invites ? Math.round(final / invites) : 0, acompte };
  }

  /* couverts déjà réservés par jour (hors annulées) */
  function couvertsParJour(exclureId) {
    const res = {};
    lire('devis', []).forEach((d) => {
      if (d.statut === 'annulee' || d.id === exclureId) return;
      res[d.date] = (res[d.date] || 0) + (Number(d.invites) || 0);
    });
    return res;
  }
  /* état d'une date pour le traiteur : bloquee / complet / demandee / libre */
  function etatDate(iso, T) {
    T = T || lire('traiteur', D.traiteur);
    if ((T.datesBloquees || []).includes(iso)) return 'bloquee';
    const c = couvertsParJour()[iso] || 0;
    if (c >= T.capacite) return 'complet';
    const jour = new Date(iso + 'T12:00:00').getDay();
    if (c >= T.capacite * 0.4 || jour === 4 || jour === 5) return 'demandee'; // jeudi / vendredi = jours de fêtes
    return 'libre';
  }

  /* ---------------- Logo (SVG inline fidèle au logo d'origine) ---------------- */
  let nLogo = 0;
  function logoSVG(opts) {
    opts = opts || {};
    const id = 'lg' + (++nLogo);
    const texte = opts.texte !== false;
    const titre = opts.titre || 'Banet el Baraka — بنة البركة';
    return '<svg class="logo-svg" viewBox="0 0 200 200" role="img" aria-label="' + titre + '" xmlns="http://www.w3.org/2000/svg">' +
      '<defs>' +
        '<linearGradient id="' + id + 'b" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0" stop-color="#C08A50"/><stop offset=".35" stop-color="#8A5A2E"/><stop offset=".6" stop-color="#B27C45"/><stop offset="1" stop-color="#6A421F"/>' +
        '</linearGradient>' +
        '<radialGradient id="' + id + 'c" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#FAF2E2"/><stop offset="1" stop-color="#EEDFC2"/></radialGradient>' +
      '</defs>' +
      // anneau bois + veinage
      '<circle cx="100" cy="100" r="99" fill="url(#' + id + 'b)"/>' +
      '<circle cx="100" cy="100" r="94" fill="none" stroke="#5A3618" stroke-opacity=".35" stroke-width="1"/>' +
      '<circle cx="100" cy="100" r="96.5" fill="none" stroke="#E2B77E" stroke-opacity=".35" stroke-width=".8" stroke-dasharray="18 9 30 6"/>' +
      '<circle cx="100" cy="100" r="88" fill="url(#' + id + 'c)" stroke="#5A3618" stroke-opacity=".5" stroke-width="1.2"/>' +
      '<g fill="none" stroke="#9A6A35" stroke-linecap="round" stroke-linejoin="round">' +
        // arche ouverte en bas, extrémités rentrantes
        '<path d="M83 104H72V62a28 28 0 0 1 56 0v42h-11" stroke-width="5"/>' +
        // vapeur
        '<path d="M100.5 113c-3.5-3 3.5-5 0-8.5s3.5-5 0-8.5" stroke-width="2.6"/>' +
      '</g>' +
      '<g fill="#9A6A35">' +
        '<circle cx="100" cy="51" r="3.6"/>' +
        '<path d="M80 79a20 20 0 0 1 40 0z"/>' +
        '<rect x="76" y="80.5" width="48" height="4.2" rx="2.1"/>' +
        '<path d="M80 86.5h40l-5 5.5H85z"/>' +
      '</g>' +
      '<path d="M86.5 75a14 14 0 0 1 9-10" fill="none" stroke="#F6ECD8" stroke-width="2.2" stroke-linecap="round"/>' +
      (texte
        ? '<text x="100" y="146" text-anchor="middle" direction="rtl" font-family="\'Reem Kufi\', \'Cairo\', \'Amiri\', sans-serif" font-weight="700" font-size="36" fill="#93622F">بنة البركة</text>' +
          '<text x="100" y="168" text-anchor="middle" font-family="\'Manrope\', \'Segoe UI\', sans-serif" font-weight="800" font-size="11.5" letter-spacing="2.6" fill="#8A5A2E">RESTAURANT</text>'
        : '') +
      '</svg>';
  }
  function poserLogos(racine) {
    (racine || document).querySelectorAll('[data-logo]').forEach((el) => {
      el.innerHTML = logoSVG({ texte: el.dataset.logo !== 'icone' });
    });
  }
  /* favicon : version sans texte (illisible à 16 px) */
  function poserFavicon() {
    const svg = logoSVG({ texte: false }).replace(/'/g, '"');
    let l = document.querySelector('link[rel="icon"]');
    if (!l) { l = document.createElement('link'); l.rel = 'icon'; document.head.appendChild(l); }
    l.type = 'image/svg+xml';
    l.href = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  /* ---------------- Petits outils d'interface ---------------- */
  function toast(msg, type) {
    let z = document.getElementById('toasts');
    if (!z) { z = document.createElement('div'); z.id = 'toasts'; z.className = 'toasts'; z.setAttribute('role', 'status'); z.setAttribute('aria-live', 'polite'); document.body.appendChild(z); }
    const el = document.createElement('div');
    el.className = 'toast' + (type ? ' toast--' + type : '');
    el.textContent = msg;
    z.appendChild(el);
    setTimeout(() => el.classList.add('sort'), 2600);
    setTimeout(() => el.remove(), 3100);
  }
  /* Visuel typographique pour un plat sans photo (jamais d'image cassée) */
  function visuelTypo(pl) {
    const fr = esc(pl.fr), ar = esc(pl.ar);
    return '<div class="visuel-typo" aria-hidden="true"><span class="vt-arche"></span><span class="vt-fr">' + fr + '</span><span class="vt-ar" lang="ar">' + ar + '</span></div>';
  }

  window.BNB = {
    D, lire, ecrire, surChangement, installer, prochainNumero,
    get langue() { return langue; }, t, nom, appliquerTextes, changerLangue,
    prix, heure, dateLongue, dateCourte, isoJour, memeJour, esc, pad, minutes,
    etatOuverture, telValide, telInternational, lienWhatsApp, lienCarte,
    ORDRE, etapesPour, libelleStatut, totalLigne,
    calculDevis, couvertsParJour, etatDate,
    logoSVG, poserLogos, poserFavicon, toast, visuelTypo
  };
})();
