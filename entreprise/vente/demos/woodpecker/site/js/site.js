/* =====================================================================
   Wood Pecker Draria · site client
   ---------------------------------------------------------------------
   Héros + statut ouvert/fermé, plat & poisson du jour, carte avec
   onglets collants et recherche, options (tailles, suppléments, sauces,
   choix imposés), panier, commande, suivi en temps réel, réservation,
   demande d'anniversaire, infos pratiques. FR / AR.
   ===================================================================== */
(function () {
  'use strict';
  const W = window.WPK;
  const T = window.T_SITE;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const t = cle => W.tr(T, cle);
  const esc = W.echapper;
  const ar = () => W.langue() === 'ar';

  W.initialiser();
  W.poserFavicon();

  /* ------------------------------------------------------------------
     Panier (propre à ce navigateur)
     ------------------------------------------------------------------ */
  const panier = {
    lignes: () => W.lire('panier', []),
    sauver(l) { W.ecrire('panier', l); majCompteur(); },
    ajouter(ligne) {
      const l = panier.lignes();
      const cle = JSON.stringify([ligne.id, ligne.taille, ligne.choix, ligne.sauce, (ligne.supps || []).map(s => s.id).sort(), !!ligne.olives]);
      const ex = l.find(x => x.cle === cle);
      if (ex) ex.qte += ligne.qte; else l.push(Object.assign({ cle }, ligne));
      panier.sauver(l);
    },
    sousTotal: () => panier.lignes().reduce((s, l) => s + l.pu * l.qte, 0),
    nb: () => panier.lignes().reduce((s, l) => s + l.qte, 0),
    vider() { panier.sauver([]); }
  };
  function majCompteur() {
    const n = panier.nb();
    $('#nb-panier').textContent = n;
    $('#nb-panier').classList.toggle('vide', n === 0);
  }

  /* ------------------------------------------------------------------
     Icônes et logos statiques
     ------------------------------------------------------------------ */
  function poserIcones() {
    $('#logo-entete').innerHTML = W.logoSVG(44, 'Wood Pecker Draria');
    $('#logo-pied').innerHTML = W.logoSVG(56, 'Wood Pecker Draria');
    $('#ico-panier').innerHTML = W.icone('panier', 22);
    $('#ico-tel').innerHTML = W.icone('tel', 18);
    $('#ico-loupe').innerHTML = W.icone('loupe', 18);
    $('#ico-maps').innerHTML = W.icone('carte', 18);
    $('#ico-ig').innerHTML = W.icone('instagram', 18);
    $('#ico-fb').innerHTML = W.icone('facebook', 18);
    $$('.ornement').forEach(o => { o.innerHTML = '<i></i>' + W.etoile6(20) + '<i></i>'; });
  }

  /* ------------------------------------------------------------------
     Statut ouvert / fermé
     ------------------------------------------------------------------ */
  function majStatut() {
    const e = W.etat();
    const el = $('#statut');
    if (e.ouvert) {
      el.className = 'statut ouvert';
      el.innerHTML = '<span class="point"></span>' + t('ouvert') + ' · ' + t('jusqua') + ' ' + e.jusqua;
    } else {
      el.className = 'statut ferme';
      let suite = '';
      if (e.prochaine) {
        if (e.prochaine.jour === 0) suite = ' · ' + t('ouvre-a') + ' ' + e.prochaine.heure;
        else if (e.prochaine.jour === 1) suite = ' · ' + t('ouvre-demain') + ' ' + e.prochaine.heure;
        else suite = ' · ' + t('ouvre-le') + ' ' + t('jours')[(new Date().getDay() + e.prochaine.jour) % 7].toLowerCase() + ' ' + e.prochaine.heure;
      }
      el.innerHTML = '<span class="point"></span>' + t('ferme') + suite;
    }
  }

  /* ------------------------------------------------------------------
     Plat du jour & poisson du jour (choisis par le gérant)
     ------------------------------------------------------------------ */
  function rendreJour() {
    const J = W.jour();
    const plats = J.plats.filter(p => p.actif);
    $('#liste-pdj').innerHTML = plats.length ? plats.map(p =>
      '<li><span class="nom-jour">' + esc(W.nomL(p)) + '</span><span class="pointilles" aria-hidden="true"></span>' +
      '<span class="prix-jour">' + W.prix(p.prix) + '</span>' +
      '<button type="button" class="btn-mini" data-ajout-jour="' + esc(p.id) + '" aria-label="' + esc(t('ajouter') + ' ' + W.nomL(p)) + '">' + W.icone('plus', 16) + '<span>' + t('ajouter') + '</span></button></li>'
    ).join('') : '<li class="vide">' + t('pdj-vide') + '</li>';

    const P = J.poisson;
    const R = W.reglages();
    $('#bloc-poisson').innerHTML = P.actif
      ? '<p class="especes">' + esc(W.nomL(P.especes)) + '</p>' +
        '<p>' + t('poisson-txt') + '</p>' +
        '<p class="prix-poisson">' + (P.prixKg > 0 ? W.prix(P.prixKg) + ' <small>/ ' + t('le-kg') + '</small>' : t('selon-arrivage')) + '</p>' +
        '<div class="boutons-ligne"><a class="btn btn-or" href="tel:' + W.normaliserTel(R.tel1) + '">' + W.icone('tel', 18) + '<span>' + t('poisson-appel') + '</span></a>' +
        '<a class="btn btn-ligne" href="#reserver">' + t('reserver-table') + '</a></div>'
      : '<p>' + t('poisson-off') + '</p>';
  }

  /* ------------------------------------------------------------------
     La carte : onglets collants, recherche, cartes typographiques
     ------------------------------------------------------------------ */
  const sansAccents = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  let filtre = '';

  function rendreOnglets() {
    const C = W.carte();
    $('#onglets').innerHTML = C.categories.map(c =>
      '<a href="#cat-' + c.id + '" class="onglet" data-cat="' + c.id + '">' + W.picto(c.icone, 18) + '<span>' + esc(W.nomL(c)) + '</span></a>').join('');
  }

  function prixAffiche(plat) {
    return W.prix(plat.prix);
  }

  function carteHTML(plat, cat) {
    const nom = W.nomL(plat);
    const nomSec = ar() ? plat.fr : '';
    const desc = plat.desc ? W.nomL(plat.desc) : '';
    const visuel = plat.photo
      ? '<div class="plat-photo"><img src="' + esc(plat.photo) + '" alt="' + esc(nom) + '" loading="lazy"></div>'
      : '<div class="plat-picto" aria-hidden="true">' + W.picto(cat.icone, 34) + '</div>';
    const besoinOptions = plat.tailles || plat.choix || plat.sauce;
    let corps = '';
    if (plat.tailles) {
      corps = '<dl class="grille-tailles">' + window.WPK_DATA.TAILLES.map(tl =>
        '<div><dt>' + esc(W.nomL(tl)) + '</dt><dd>' + W.prix(plat.tailles[tl.id]) + '</dd></div>').join('') + '</dl>';
    }
    const badges = [];
    if (plat.sauce === 'option') badges.push(t('sauce-option').replace('300 DA', W.prix(W.reglages().prixSauce)).replace('300 دج', W.prix(W.reglages().prixSauce)));
    if (plat.sauce === 'incluse') badges.push(t('sauce-incluse'));
    if (plat.choix) badges.push(W.nomL(plat.choix) + ' : ' + plat.choix.opts.map(o => ar() ? o[1] : o[0]).join(' / '));
    return '<article class="plat' + (plat.dispo ? '' : ' indispo') + (plat.tailles ? ' plat-pizza' : '') + '" data-id="' + plat.id + '">' +
      visuel +
      '<div class="plat-corps">' +
        '<h4 class="plat-nom">' + esc((plat.pre && !ar() ? plat.pre + ' ' : '') + nom) + '</h4>' +
        (nomSec ? '<p class="plat-nom-fr" lang="fr" dir="ltr">' + esc((plat.pre ? plat.pre + ' ' : '') + nomSec) + '</p>' : '') +
        (desc ? '<p class="plat-desc">' + esc(desc) + '</p>' : '') +
        (badges.length ? '<p class="plat-badges">' + badges.map(b => '<span>' + esc(b) + '</span>').join('') + '</p>' : '') +
        corps +
      '</div>' +
      '<div class="plat-pied">' +
        (plat.tailles ? '<span class="plat-prix"><small>' + (ar() ? 'من ' : 'dès ') + '</small>' + W.prix(plat.tailles.mini) + '</span>' : '<span class="plat-prix">' + prixAffiche(plat) + '</span>') +
        (plat.dispo
          ? '<button type="button" class="btn-ajout" data-plat="' + plat.id + '" aria-label="' + esc((besoinOptions ? t('choisir') : t('ajouter')) + ' : ' + nom) + '">' + W.icone('plus', 16) + '<span>' + (besoinOptions ? t('choisir') : t('ajouter')) + '</span></button>'
          : '<span class="etiquette-indispo">' + t('indispo') + '</span>') +
      '</div>' +
    '</article>';
  }

  function noteCategorie(cat, C) {
    if (cat.id === 'pizzas') {
      return '<p class="note-cat">' + t('tailles-pizza') + ' · ' + t('olives-note') + '</p>';
    }
    if (cat.id === 'viandes' || cat.id === 'volailles') {
      return '<p class="note-cat"><strong>' + t('sauces-titre') + ' :</strong> ' + C.sauces.map(s => esc(W.nomL(s))).join(', ') + ' · ' + W.prix(W.reglages().prixSauce) + '</p>';
    }
    if (cat.id === 'enfant') return '<p class="note-cat cadeau">' + W.picto('cadeau', 18) + ' ' + t('enfant-note') + '</p>';
    return '';
  }

  function tableauSupplements(C) {
    return '<details class="supps-tableau"><summary>' + t('supps-titre') + ' <small>(Simple / Méga)</small></summary>' +
      '<ul>' + C.supplements.map(s => '<li><span>' + esc(W.nomL(s)) + '</span><span>' + W.prix(s.simple) + ' / ' + W.prix(s.mega) + '</span></li>').join('') + '</ul>' +
      '<p class="aide">' + t('supps-indispo') + '</p></details>';
  }

  function rendreCarte() {
    const C = W.carte();
    const q = sansAccents(filtre.trim());
    let html = '', total = 0;
    C.categories.forEach(cat => {
      const plats = C.plats.filter(p => p.cat === cat.id && (!q ||
        sansAccents(p.fr + ' ' + p.ar + ' ' + (p.pre || '') + ' ' + (p.desc ? p.desc.fr + ' ' + p.desc.ar : '') + ' ' + cat.fr + ' ' + cat.ar).includes(q)));
      if (!plats.length) return;
      total += plats.length;
      html += '<section class="categorie" id="cat-' + cat.id + '" aria-labelledby="h-' + cat.id + '">' +
        '<header class="cat-entete"><span class="cat-picto" aria-hidden="true">' + W.picto(cat.icone, 30) + '</span>' +
        '<h3 id="h-' + cat.id + '">' + esc(W.nomL(cat)) + '</h3><span class="cat-filet" aria-hidden="true"></span></header>' +
        noteCategorie(cat, C) +
        '<div class="grille-plats">' + plats.map(p => carteHTML(p, cat)).join('') + '</div>' +
        (cat.id === 'pizzas' ? tableauSupplements(C) : '') +
        '</section>';
    });
    $('#contenu-carte').innerHTML = total ? html : '<p class="aucun">' + t('aucun-resultat') + '</p>';
    observerCategories();
  }

  /* Onglet actif selon la section visible */
  let observateur = null;
  function observerCategories() {
    if (observateur) observateur.disconnect();
    if (!('IntersectionObserver' in window)) return;
    observateur = new IntersectionObserver(entrees => {
      entrees.forEach(e => {
        if (e.isIntersecting) {
          const id = e.target.id.replace('cat-', '');
          $$('.onglet').forEach(o => {
            const actif = o.dataset.cat === id;
            o.classList.toggle('actif', actif);
            if (actif) { o.setAttribute('aria-current', 'true'); centrerOnglet(o); } else o.removeAttribute('aria-current');
          });
        }
      });
    }, { rootMargin: '-140px 0px -60% 0px' });
    $$('.categorie').forEach(s => observateur.observe(s));
  }
  function centrerOnglet(o) {
    const barre = $('#onglets');
    const cible = o.offsetLeft - barre.clientWidth / 2 + o.clientWidth / 2;
    barre.scrollTo({ left: cible, behavior: 'smooth' });
  }

  /* ------------------------------------------------------------------
     Fenêtre d'options d'un plat
     ------------------------------------------------------------------ */
  function ouvrirOptions(plat) {
    const C = W.carte();
    const R = W.reglages();
    const D = window.WPK_DATA;
    const f = $('#form-options');
    let h = '<header class="fenetre-entete"><div><p class="surtitre">' + esc(W.nomL(C.categories.find(c => c.id === plat.cat))) + '</p>' +
      '<h2 id="opt-titre">' + esc((plat.pre && !ar() ? plat.pre + ' ' : '') + W.nomL(plat)) + '</h2>' +
      (plat.desc ? '<p class="plat-desc">' + esc(W.nomL(plat.desc)) + '</p>' : '') + '</div>' +
      '<button type="button" class="btn-fermer" value="annuler" data-fermer aria-label="' + t('fermer') + '">' + W.icone('fermer', 20) + '</button></header><div class="fenetre-corps">';

    if (plat.tailles) {
      h += '<fieldset class="choix-groupe"><legend>' + t('taille') + '</legend><div class="choix-tailles">' +
        D.TAILLES.map((tl, i) => '<label class="pastille-choix"><input type="radio" name="taille" value="' + tl.id + '"' + (tl.id === 'mega' ? ' checked' : '') + '><span><b>' + esc(W.nomL(tl)) + '</b><em>' + W.prix(plat.tailles[tl.id]) + '</em></span></label>').join('') +
        '</div></fieldset>';
    }
    if (plat.choix) {
      h += '<fieldset class="choix-groupe"><legend>' + esc(W.nomL(plat.choix)) + '</legend><div class="choix-liste">' +
        plat.choix.opts.map((o, i) => '<label class="pastille-choix"><input type="radio" name="choix" value="' + i + '"' + (i === 0 ? ' checked' : '') + '><span><b>' + esc(ar() ? o[1] : o[0]) + '</b></span></label>').join('') +
        '</div></fieldset>';
    }
    if (plat.sauce) {
      h += '<fieldset class="choix-groupe"><legend>' + t('sauce') + (plat.sauce === 'option' ? ' <small>+' + W.prix(R.prixSauce) + '</small>' : '') + '</legend><div class="choix-liste">' +
        (plat.sauce === 'option' ? '<label class="pastille-choix"><input type="radio" name="sauce" value="" checked><span><b>' + t('sans-sauce') + '</b></span></label>' : '') +
        C.sauces.map((s, i) => '<label class="pastille-choix"><input type="radio" name="sauce" value="' + i + '"' + (plat.sauce === 'incluse' && i === 0 ? ' checked' : '') + '><span><b>' + esc(W.nomL(s)) + '</b></span></label>').join('') +
        '</div></fieldset>';
    }
    if (plat.tailles) {
      h += '<fieldset class="choix-groupe" id="groupe-supps"><legend>' + t('supplements') + '</legend>' +
        '<p class="aide" id="supps-note"></p><div class="choix-supps">' +
        C.supplements.map(s => '<label class="case-supp"><input type="checkbox" name="supp" value="' + s.id + '"><span>' + esc(W.nomL(s)) + '</span><em data-supp-prix="' + s.id + '"></em></label>').join('') +
        '</div><label class="case olives"><input type="checkbox" name="olives"> <span>' + t('olives') + '</span></label></fieldset>';
    }
    h += '</div><footer class="fenetre-pied"><div class="quantite" role="group" aria-label="' + t('quantite') + '">' +
      '<button type="button" data-qte="-1" aria-label="-">' + W.icone('moins', 18) + '</button><output id="opt-qte">1</output>' +
      '<button type="button" data-qte="1" aria-label="+">' + W.icone('plus', 18) + '</button></div>' +
      '<button type="submit" class="btn btn-degrade" id="opt-valider" value="ok"></button></footer>';
    f.innerHTML = h;

    let qte = 1;
    const lireOptions = () => {
      const fd = new FormData(f);
      const taille = fd.get('taille') || null;
      const suppsOk = taille === 'simple' || taille === 'mega';
      return {
        taille,
        choixIdx: fd.get('choix'),
        sauceIdx: fd.get('sauce'),
        supps: suppsOk ? fd.getAll('supp') : [],
        olives: !!fd.get('olives')
      };
    };
    const maj = () => {
      const o = lireOptions();
      if (plat.tailles) {
        const ok = o.taille === 'simple' || o.taille === 'mega';
        $$('input[name="supp"]', f).forEach(i => { i.disabled = !ok; if (!ok) i.checked = false; });
        $$('[data-supp-prix]', f).forEach(e => {
          const s = C.supplements.find(x => x.id === e.dataset.suppPrix);
          e.textContent = ok ? '+' + W.prix(s[o.taille]) : '';
        });
        $('#supps-note').textContent = ok ? '' : t('supps-indispo');
        $('#groupe-supps').classList.toggle('desactive', !ok);
      }
      const pu = W.prixLigne(plat, { taille: o.taille, supps: o.supps, sauce: o.sauceIdx !== null && o.sauceIdx !== '' ? 'x' : '' }, C);
      $('#opt-qte').textContent = qte;
      $('#opt-valider').textContent = t('ajouter-panier') + ' · ' + W.prix(pu * qte);
    };
    f.onchange = maj;
    f.onclick = ev => {
      const b = ev.target.closest('[data-qte]');
      if (b) { qte = Math.max(1, Math.min(30, qte + Number(b.dataset.qte))); maj(); }
      if (ev.target.closest('[data-fermer]')) $('#dlg-options').close();
    };
    f.onsubmit = ev => {
      ev.preventDefault();
      const o = lireOptions();
      const ligne = { id: plat.id, nom: plat.fr, ar: plat.ar, pre: plat.pre || '', cat: plat.cat, qte };
      if (plat.tailles) ligne.taille = o.taille;
      if (plat.choix && o.choixIdx != null) { const op = plat.choix.opts[Number(o.choixIdx)]; ligne.choix = op[0]; ligne.choixAr = op[1]; }
      if (plat.sauce && o.sauceIdx !== null && o.sauceIdx !== '') { const s = C.sauces[Number(o.sauceIdx)]; ligne.sauce = s.fr; ligne.sauceAr = s.ar; }
      if (o.supps.length) ligne.supps = o.supps.map(id => { const s = C.supplements.find(x => x.id === id); return { id, fr: s.fr, ar: s.ar }; });
      if (o.olives) ligne.olives = true;
      ligne.pu = W.prixLigne(plat, { taille: ligne.taille, supps: o.supps, sauce: plat.sauce === 'option' ? ligne.sauce : '' }, C);
      panier.ajouter(ligne);
      $('#dlg-options').close();
      W.toast(W.nomL(plat) + ' · ' + t('ajoute'));
    };
    maj();
    $('#dlg-options').showModal();
  }

  function ajouterDirect(plat) {
    panier.ajouter({ id: plat.id, nom: plat.fr, ar: plat.ar, pre: plat.pre || '', cat: plat.cat, qte: 1, pu: plat.prix });
    W.toast(W.nomL(plat) + ' · ' + t('ajoute'));
  }

  /* ------------------------------------------------------------------
     Tiroir : panier → commande → suivi
     ------------------------------------------------------------------ */
  let vue = 'panier';
  let suiviId = null;
  const tiroir = () => $('#dlg-panier');

  function ouvrirTiroir(v, id) {
    vue = v || 'panier';
    if (id) suiviId = id;
    rendreTiroir();
    if (!tiroir().open) tiroir().showModal();
  }

  function enteteTiroir(titre) {
    return '<header class="tiroir-entete"><h2 id="panier-titre">' + titre + '</h2>' +
      '<button type="button" class="btn-fermer" data-action="fermer" aria-label="' + t('fermer') + '">' + W.icone('fermer', 20) + '</button></header>';
  }

  function lignesHTML(lignes, editable) {
    return '<ul class="lignes">' + lignes.map((l, i) => {
      const lib = W.libelleLigne(l);
      return '<li class="ligne"><div class="ligne-txt"><b>' + esc(lib.nom) + '</b>' + (lib.det ? '<small>' + esc(lib.det) + '</small>' : '') + '</div>' +
        (editable
          ? '<div class="quantite petite" role="group" aria-label="' + t('quantite') + ' ' + esc(lib.nom) + '"><button type="button" data-moins="' + i + '" aria-label="-">' + W.icone('moins', 16) + '</button><output>' + l.qte + '</output><button type="button" data-plus="' + i + '" aria-label="+">' + W.icone('plus', 16) + '</button></div>'
          : '<span class="ligne-qte">× ' + l.qte + '</span>') +
        '<span class="ligne-prix">' + W.prix(l.pu * l.qte) + '</span></li>';
    }).join('') + '</ul>';
  }

  function rendreTiroir() {
    const z = $('#tiroir-contenu');
    if (vue === 'panier') {
      const L = panier.lignes();
      z.innerHTML = enteteTiroir(t('panier-titre')) + (L.length
        ? '<div class="tiroir-corps">' + lignesHTML(L, true) + '</div>' +
          '<footer class="tiroir-pied"><p class="total-ligne"><span>' + t('sous-total') + '</span><b>' + W.prix(panier.sousTotal()) + '</b></p>' +
          '<button type="button" class="btn btn-degrade large" data-action="commande">' + t('continuer') + '</button></footer>'
        : '<div class="tiroir-corps vide"><p>' + t('panier-vide') + '</p><button type="button" class="btn btn-or" data-action="voir-carte">' + t('voir-carte') + '</button></div>');
    } else if (vue === 'commande') {
      rendreFormulaireCommande(z);
    } else if (vue === 'suivi') {
      rendreSuivi(z);
    }
    W.appliquerLangue(T);
  }

  /* Heures programmables : par pas de 15 min, uniquement pendant les heures d'ouverture */
  function heuresProgrammables() {
    const out = [];
    const base = new Date(Date.now() + 30 * 60e3);
    base.setMinutes(Math.ceil(base.getMinutes() / 15) * 15, 0, 0);
    for (let i = 0; i < 96 && out.length < 40; i++) {
      const ts = base.getTime() + i * 15 * 60e3;
      if (W.etat(ts).ouvert) out.push(ts);
    }
    return out;
  }

  let brouillon = null;
  function rendreFormulaireCommande(z) {
    const R = W.reglages();
    const b = brouillon || (brouillon = Object.assign({ mode: 'livraison', zone: R.zones.filter(x => x.actif)[0].nom, quand: 'vite' }, W.lire('client', {})));
    const ouvert = W.etat().ouvert;
    if (!ouvert) b.quand = 'prog';
    const zone = R.zones.find(x => x.nom === b.zone) || R.zones[0];
    const st = panier.sousTotal();
    const frais = b.mode === 'livraison' ? zone.frais : 0;
    const progs = heuresProgrammables();
    const jours = t('jours');
    const libProg = ts => (W.isoJour(ts) === W.isoJour(Date.now()) ? t('aujourdhui') : jours[new Date(ts).getDay()]) + ' ' + W.heure(ts);

    z.innerHTML = enteteTiroir(t('panier-titre')) +
      '<form class="tiroir-corps formulaire-cmd" id="form-cmd" novalidate>' +
      '<fieldset class="modes"><legend>' + t('mode') + '</legend>' +
        ['livraison', 'emporter', 'surplace'].map(m => '<label class="mode-choix"><input type="radio" name="mode" value="' + m + '"' + (b.mode === m ? ' checked' : '') + '><span>' + W.icone(m === 'livraison' ? 'livraison' : m === 'emporter' ? 'sac' : 'table', 22) + t(m) + '</span></label>').join('') +
      '</fieldset>' +
      (b.mode === 'livraison'
        ? '<label><span>' + t('zone') + '</span><select name="zone">' + R.zones.filter(x => x.actif).map(x => '<option value="' + esc(x.nom) + '"' + (x.nom === zone.nom ? ' selected' : '') + '>' + esc(x.nom) + ' · ' + W.prix(x.frais) + '</option>').join('') + '</select></label>' +
          '<p class="aide">' + t('min-commande') + ' ' + W.prix(zone.min) + ' · ' + t('delai') + ' ≈ ' + zone.delai + ' ' + t('minutes') + '</p>' +
          '<label><span>' + t('cite') + '</span><input name="cite" value="' + esc(b.cite || '') + '" autocomplete="address-line1" required></label>' +
          '<div class="ligne-champs"><label><span>' + t('batiment') + '</span><input name="batiment" value="' + esc(b.batiment || '') + '"></label>' +
          '<label><span>' + t('etage') + '</span><input name="etage" value="' + esc(b.etage || '') + '"></label></div>' +
          '<label><span>' + t('repere') + '</span><input name="repere" value="' + esc(b.repere || '') + '" placeholder="' + esc(t('repere-ph')) + '"></label>'
        : '') +
      '<fieldset class="quand"><legend>' + t('quand') + '</legend>' +
        (ouvert ? '<label class="case"><input type="radio" name="quand" value="vite"' + (b.quand === 'vite' ? ' checked' : '') + '> <span>' + t('des-que-possible') + '</span></label>' : '') +
        '<label class="case"><input type="radio" name="quand" value="prog"' + (b.quand === 'prog' ? ' checked' : '') + '> <span>' + t('programmer') + '</span></label>' +
        (b.quand === 'prog' ? '<select name="prog" aria-label="' + t('heure') + '">' + progs.map(ts => '<option value="' + ts + '"' + (String(b.prog) === String(ts) ? ' selected' : '') + '>' + libProg(ts) + '</option>').join('') + '</select>' : '') +
      '</fieldset>' +
      '<div class="ligne-champs"><label><span>' + t('nom') + '</span><input name="nom" value="' + esc(b.nom || '') + '" autocomplete="name" required></label>' +
      '<label><span>' + t('tel') + '</span><input name="tel" type="tel" inputmode="tel" value="' + esc(b.tel || '') + '" placeholder="0770 00 00 00" autocomplete="tel" required></label></div>' +
      '<label><span>' + t('remarque') + '</span><textarea name="remarque" rows="2" placeholder="' + esc(t('remarque-ph')) + '">' + esc(b.remarque || '') + '</textarea></label>' +
      '<div class="paiement"><b>' + t('paiement') + ' :</b> ' + (b.mode === 'livraison' ? t('paie-livraison') : t('paie-comptoir')) + '</div>' +
      '<p class="erreur" id="cmd-erreur" role="alert"></p>' +
      '</form>' +
      '<footer class="tiroir-pied">' +
        '<p class="total-ligne petit"><span>' + t('sous-total') + '</span><span>' + W.prix(st) + '</span></p>' +
        (b.mode === 'livraison' ? '<p class="total-ligne petit"><span>' + t('frais-livraison') + '</span><span>' + W.prix(frais) + '</span></p>' : '') +
        '<p class="total-ligne"><span>' + t('total') + '</span><b>' + W.prix(st + frais) + '</b></p>' +
        '<div class="boutons-ligne"><button type="button" class="btn btn-ligne" data-action="panier">' + t('retour') + '</button>' +
        '<button type="button" class="btn btn-degrade" data-action="valider">' + t('valider') + '</button></div>' +
      '</footer>';

    const f = $('#form-cmd');
    f.addEventListener('change', ev => {
      lireBrouillon(f);
      if (['mode', 'zone', 'quand'].includes(ev.target.name)) rendreTiroir();
    });
    f.addEventListener('input', () => lireBrouillon(f));
  }

  function lireBrouillon(f) {
    const fd = new FormData(f);
    ['mode', 'zone', 'cite', 'batiment', 'etage', 'repere', 'quand', 'prog', 'nom', 'tel', 'remarque'].forEach(k => { if (fd.has(k)) brouillon[k] = fd.get(k); });
  }

  function validerCommande() {
    const f = $('#form-cmd');
    lireBrouillon(f);
    const b = brouillon;
    const R = W.reglages();
    const err = m => { $('#cmd-erreur').textContent = m; return false; };
    const zone = R.zones.find(x => x.nom === b.zone);
    const st = panier.sousTotal();
    if (b.mode === 'livraison' && !String(b.cite || '').trim()) return err(t('err-adresse'));
    if (b.mode === 'livraison' && zone && st < zone.min) return err(t('err-min') + ' (' + W.prix(zone.min) + ')');
    if (b.quand === 'vite' && !W.etat().ouvert) return err(t('err-ferme'));
    if (b.quand === 'prog' && !b.prog) b.prog = String(heuresProgrammables()[0] || '');
    if (!String(b.nom || '').trim()) return err(t('err-nom'));
    if (!W.telValide(b.tel)) return err(t('err-tel'));

    const frais = b.mode === 'livraison' && zone ? zone.frais : 0;
    const n = W.prochainNumero('cmd');
    const lignes = panier.lignes().map(l => Object.assign({}, l, { total: l.pu * l.qte }));
    const cmd = {
      id: 'WP-' + n, n, cree: Date.now(), source: 'site', mode: b.mode,
      client: { nom: b.nom.trim(), tel: b.tel.trim() },
      adresse: b.mode === 'livraison' ? { zone: b.zone, cite: b.cite.trim(), batiment: b.batiment || '', etage: b.etage || '', repere: b.repere || '' } : null,
      programme: b.quand === 'prog' && b.prog ? Number(b.prog) : '',
      remarque: (b.remarque || '').trim(),
      lignes, sousTotal: st, frais, total: st + frais,
      paiement: b.mode === 'livraison' ? 'livraison' : 'comptoir',
      statut: 'recue', hist: { recue: Date.now() }, accepte: false, livreur: '', encaisse: false
    };
    const toutes = W.commandes(); toutes.push(cmd); W.ecrire('commandes', toutes);
    const mes = W.lire('mes-commandes', []); mes.push(cmd.id); W.ecrire('mes-commandes', mes);
    W.ecrire('client', { nom: b.nom, tel: b.tel, cite: b.cite, batiment: b.batiment, etage: b.etage, repere: b.repere, zone: b.zone, mode: b.mode });
    panier.vider();
    brouillon = null;
    ouvrirTiroir('suivi', cmd.id);
    majFlottant();
    return true;
  }

  /* Message WhatsApp récapitulatif */
  function texteWhatsApp(c) {
    const lignes = c.lignes.map(l => { const lib = W.libelleLigne(l); return '• ' + l.qte + ' × ' + lib.nom + (lib.det ? ' (' + lib.det + ')' : '') + ' : ' + W.prix(l.pu * l.qte); });
    const a = c.adresse;
    return [t('wa-intro') + ' ' + c.id + ' :', ...lignes,
      t('total') + ' : ' + W.prix(c.total) + (c.frais ? ' (' + t('frais-livraison') + ' ' + W.prix(c.frais) + ')' : ''),
      t('mode') + ' : ' + t(c.mode),
      a ? (a.zone + ', ' + a.cite + (a.batiment ? ', ' + a.batiment : '') + (a.etage ? ', ' + a.etage : '') + (a.repere ? ' (' + a.repere + ')' : '')) : '',
      c.programme ? t('programmee') + ' ' + W.heure(c.programme) : '',
      t('nom') + ' : ' + c.client.nom + ' · ' + c.client.tel,
      c.remarque ? t('remarque') + ' : ' + c.remarque : ''].filter(Boolean).join('\n');
  }

  /* Étapes du suivi selon le mode */
  function etapes(c) {
    return c.mode === 'livraison'
      ? [['recue', 'et-recue'], ['preparation', 'et-preparation'], ['livraison', 'et-livraison'], ['livree', 'et-livree']]
      : [['recue', 'et-recue'], ['preparation', 'et-preparation'], ['prete', 'et-prete'], ['livree', 'et-remise']];
  }
  function indexEtape(c) {
    const ordre = c.mode === 'livraison' ? ['recue', 'preparation', 'prete', 'livraison', 'livree'] : ['recue', 'preparation', 'prete', 'livree'];
    let i = ordre.indexOf(c.statut);
    if (c.mode === 'livraison') { if (c.statut === 'prete') i = 1; else if (i > 2) i -= 1; }
    return i;
  }

  function rendreSuivi(z) {
    const c = W.commandes().find(x => x.id === suiviId);
    if (!c) { vue = 'panier'; rendreTiroir(); return; }
    const E = etapes(c);
    const idx = indexEtape(c);
    const R = W.reglages();
    let etapesHTML = '';
    if (c.statut === 'refusee') {
      etapesHTML = '<p class="refus">' + t('et-refusee') + ' · ' + t('refusee-txt') + '</p>';
    } else {
      etapesHTML = '<ol class="etapes" aria-label="' + t('suivi-titre') + '">' + E.map(([cle, lib], i) => {
        const ts = c.hist[cle] || (cle === 'livraison' ? null : null);
        const etat = i < idx ? 'faite' : i === idx ? 'en-cours' : 'a-venir';
        return '<li class="etape ' + etat + '"' + (i === idx ? ' aria-current="step"' : '') + '><span class="etape-point">' + (i < idx || (i === idx && cle === 'livree') ? W.icone('check', 14) : '') + '</span><span class="etape-txt"><b>' + t(lib) + '</b>' + (ts ? '<small>' + W.heure(ts) + '</small>' : '') + '</span></li>';
      }).join('') + '</ol>' +
      (c.accepte && c.statut === 'recue' ? '<p class="aide centre">' + t('et-acceptee') + '</p>' : '') +
      (c.livreur && c.statut === 'livraison' ? '<p class="aide centre">' + t('livreur') + ' : ' + esc(c.livreur) + '</p>' : '');
    }
    z.innerHTML = enteteTiroir(t('suivi-titre')) +
      '<div class="tiroir-corps suivi" data-statut="' + c.statut + '">' +
      '<p class="merci">' + t('merci') + '</p>' +
      '<p class="num-cmd">' + t('commande-n') + ' <b>' + c.id + '</b>' + (c.programme ? ' · ' + t('programmee') + ' ' + W.heure(c.programme) : '') + '</p>' +
      '<p class="direct"><span class="point"></span>' + t('mise-a-jour') + '</p>' +
      etapesHTML +
      lignesHTML(c.lignes, false) +
      '<p class="total-ligne"><span>' + t('a-payer') + ' (' + (c.paiement === 'livraison' ? t('paie-livraison') : t('paie-comptoir')) + ')</span><b>' + W.prix(c.total) + '</b></p>' +
      '</div>' +
      '<footer class="tiroir-pied"><a class="btn btn-wa large" target="_blank" rel="noopener" href="' + W.lienWhatsApp(R.whatsapp, texteWhatsApp(c)) + '">' + W.icone('whatsapp', 20) + '<span>' + t('envoyer-wa') + '</span></a>' +
      '<button type="button" class="btn btn-ligne large" data-action="voir-carte">' + t('nouvelle-cmd') + '</button></footer>';
  }

  /* Bouton flottant « Suivre ma commande » */
  function majFlottant() {
    const mes = W.lire('mes-commandes', []);
    const toutes = W.commandes();
    const active = mes.map(id => toutes.find(c => c.id === id)).filter(c => c && c.statut !== 'livree' && c.statut !== 'refusee').pop();
    const b = $('#suivi-flottant');
    if (active) {
      const E = etapes(active);
      b.hidden = false;
      b.dataset.id = active.id;
      b.innerHTML = '<span class="point"></span><span>' + t('suivre') + ' · <b>' + active.id + '</b> · ' + t(E[Math.max(0, indexEtape(active))][1]) + '</span>';
    } else b.hidden = true;
  }

  /* ------------------------------------------------------------------
     Réservation de table
     ------------------------------------------------------------------ */
  function remplirHeures(sel, iso) {
    let cr = iso ? W.creneaux(iso) : [];
    if (iso === W.isoJour(Date.now())) {
      const m = new Date().getHours() * 60 + new Date().getMinutes() + 30;
      cr = cr.filter(h => W.enMinutes(h) >= m);
    }
    const ancien = sel.value;
    sel.innerHTML = cr.length ? cr.map(h => '<option' + (h === ancien ? ' selected' : '') + '>' + h + '</option>').join('') : '<option value="">' + t('ferme-jour') + '</option>';
    if (!ancien && cr.includes('20:00')) sel.value = '20:00';
  }
  /* Premier jour (à partir d'aujourd'hui) où il reste un créneau */
  function premierJourDispo(decalage) {
    for (let i = decalage || 0; i < 14; i++) {
      const iso = W.isoJour(Date.now() + i * 86400e3);
      const s = document.createElement('select');
      remplirHeures(s, iso);
      if (s.value) return iso;
    }
    return W.isoJour(Date.now());
  }

  function initReservation() {
    const d = $('#res-date');
    d.min = W.isoJour(Date.now());
    d.max = W.isoJour(Date.now() + 60 * 86400e3);
    d.value = premierJourDispo(0);
    remplirHeures($('#res-heure'), d.value);
    d.addEventListener('change', () => remplirHeures($('#res-heure'), d.value));
    $('#res-precommande').addEventListener('change', infoPrecommande);
    $('#form-res').addEventListener('submit', ev => {
      ev.preventDefault();
      const err = m => { $('#res-erreur').textContent = m; };
      const pers = Number($('#res-pers').value);
      if (!d.value || !$('#res-heure').value) return err(t('err-date'));
      if (!(pers >= 1 && pers <= 40)) return err(t('err-pers'));
      if (!$('#res-nom').value.trim()) return err(t('err-nom'));
      if (!W.telValide($('#res-tel').value)) return err(t('err-tel'));
      err('');
      const pre = $('#res-precommande').checked ? panier.lignes().map(l => Object.assign({}, l, { total: l.pu * l.qte })) : [];
      const r = {
        id: 'RES-' + String(W.prochainNumero('res')).padStart(4, '0'),
        jour: d.value, heure: $('#res-heure').value, personnes: pers, bebe: Number($('#res-bebe').value) || 0,
        occasion: $('#res-occasion').value, nom: $('#res-nom').value.trim(), tel: $('#res-tel').value.trim(),
        remarque: $('#res-remarque').value.trim(), statut: 'attente', cree: Date.now(), precommande: pre
      };
      const L = W.reservations(); L.push(r); W.ecrire('reservations', L);
      const mes = W.lire('mes-reservations', []); mes.push(r.id); W.ecrire('mes-reservations', mes);
      if (pre.length) panier.vider();
      $('#res-precommande').checked = false; infoPrecommande();
      afficherConfirmationRes(r.id);
    });
  }
  function infoPrecommande() {
    const coche = $('#res-precommande').checked;
    const n = panier.nb();
    $('#res-precommande-info').textContent = coche ? (n ? n + ' ' + t('precommande-n') : t('precommande-vide')) : '';
  }
  function afficherConfirmationRes(id) {
    const r = W.reservations().find(x => x.id === id);
    if (!r) return;
    const R = W.reglages();
    const z = $('#res-ok');
    z.hidden = false;
    const lib = { attente: 'res-attente', confirmee: 'res-confirmee', refusee: 'res-refusee' }[r.statut];
    z.dataset.id = id;
    z.innerHTML = '<p class="conf-titre">' + W.icone('check', 18) + ' ' + t('res-ok') + ' · <b>' + r.id + '</b></p>' +
      '<p>' + W.dateLongue(r.jour) + ' · ' + r.heure + ' · ' + r.personnes + ' ' + (ar() ? 'أشخاص' : 'pers.') + '</p>' +
      '<p>' + t('statut-res') + ' : <b class="statut-res ' + r.statut + '">' + t(lib) + '</b></p>' +
      '<a class="btn btn-wa" target="_blank" rel="noopener" href="' + W.lienWhatsApp(R.whatsapp, t('wa-res') + ' : ' + r.id + ' · ' + r.jour + ' ' + r.heure + ' · ' + r.personnes + ' pers. · ' + r.nom + ' ' + r.tel) + '">' + W.icone('whatsapp', 18) + '<span>' + t('envoyer-wa') + '</span></a>';
  }

  /* ------------------------------------------------------------------
     Anniversaires & groupes d'enfants
     ------------------------------------------------------------------ */
  function initAnniversaire() {
    const C = W.carte();
    const menus = C.plats.filter(p => p.cat === 'enfant' && p.dispo);
    const desserts = C.plats.filter(p => p.cat === 'desserts' && p.dispo);
    $('#an-menu').innerHTML = menus.map(p => '<option value="' + p.id + '">' + esc(W.nomL(p)) + ' · ' + W.prix(p.prix) + '</option>').join('');
    $('#an-dessert').innerHTML = '<option value="">' + t('sans-dessert') + '</option>' + desserts.map(p => '<option value="' + p.id + '"' + (p.id === 'de01' ? ' selected' : '') + '>' + esc(W.nomL(p)) + ' · ' + W.prix(p.prix) + '</option>').join('');
    $('#liste-menus-enfants').innerHTML = menus.map(p => '<li>' + W.picto('cadeau', 22) + '<span>' + esc(W.nomL(p)) + (p.choix ? ' <small>(' + p.choix.opts.map(o => ar() ? o[1] : o[0]).join(' / ') + ')</small>' : '') + '</span><b>' + W.prix(p.prix) + '</b></li>').join('');
    const d = $('#an-date');
    d.min = W.isoJour(Date.now() + 86400e3);
    d.max = W.isoJour(Date.now() + 90 * 86400e3);
    if (!d.value) d.value = premierJourDispo(3);
    remplirHeures($('#an-heure'), d.value);
    if (Array.from($('#an-heure').options).some(o => o.value === '15:00')) $('#an-heure').value = '15:00';
    estimer();
  }
  function estimer() {
    const C = W.carte();
    const n = Math.max(0, Number($('#an-enfants').value) || 0);
    const m = C.plats.find(p => p.id === $('#an-menu').value);
    const de = C.plats.find(p => p.id === $('#an-dessert').value);
    const total = n * ((m ? m.prix : 0) + (de ? de.prix : 0));
    $('#an-estimation').innerHTML = '<p><span>' + t('estimation') + '</span><b>' + W.prix(total) + '</b></p>' +
      '<small>' + n + ' × (' + (m ? esc(W.nomL(m)) + ' ' + W.prix(m.prix) : '') + (de ? ' + ' + esc(W.nomL(de)) + ' ' + W.prix(de.prix) : '') + ') · ' + t('enfant-note') + '. ' + t('estimation-note') + '</small>';
    return total;
  }
  function brancherAnniversaire() {
    ['an-enfants', 'an-menu', 'an-dessert'].forEach(id => $('#' + id).addEventListener('input', estimer));
    $('#an-date').addEventListener('change', () => remplirHeures($('#an-heure'), $('#an-date').value));
    $('#form-anniv').addEventListener('submit', ev => {
      ev.preventDefault();
      const err = m => { $('#an-erreur').textContent = m; };
      const n = Number($('#an-enfants').value);
      if (!(n >= 1)) return err(t('err-pers'));
      if (!$('#an-date').value || !$('#an-heure').value) return err(t('err-date'));
      if (!$('#an-nom').value.trim()) return err(t('err-nom'));
      if (!W.telValide($('#an-tel').value)) return err(t('err-tel'));
      err('');
      const dmd = {
        id: 'ANN-' + String(W.prochainNumero('ann')).padStart(3, '0'),
        jour: $('#an-date').value, heure: $('#an-heure').value, enfants: n, adultes: Number($('#an-adultes').value) || 0,
        menu: $('#an-menu').value, dessert: $('#an-dessert').value, nom: $('#an-nom').value.trim(), tel: $('#an-tel').value.trim(),
        remarque: $('#an-remarque').value.trim(), estimation: estimer(), statut: 'attente', cree: Date.now()
      };
      const L = W.demandes(); L.push(dmd); W.ecrire('demandes', L);
      const z = $('#an-ok'); z.hidden = false;
      z.innerHTML = '<p class="conf-titre">' + W.icone('check', 18) + ' ' + t('anniv-ok') + '</p><p>' + t('anniv-ok-txt') + ' <b>' + dmd.id + '</b> · ' + W.dateLongue(dmd.jour) + ' ' + dmd.heure + '</p>';
    });
  }

  /* ------------------------------------------------------------------
     Infos pratiques
     ------------------------------------------------------------------ */
  function rendreInfos() {
    const R = W.reglages();
    $('#tels').innerHTML = [R.tel1, R.tel2].filter(Boolean).map(n => '<a class="lien-or" href="tel:' + W.normaliserTel(n) + '">' + W.icone('tel', 18) + '<span dir="ltr">' + esc(n) + '</span></a>').join('');
    $('#btn-appel').href = 'tel:' + W.normaliserTel(R.tel1);
    $('#lien-maps').href = R.maps;
    const jours = t('jours');
    const auj = new Date().getDay();
    const ordre = [6, 0, 1, 2, 3, 4, 5]; // semaine algérienne : samedi → vendredi
    $('#table-horaires').innerHTML = '<caption class="sr-only">' + t('horaires') + '</caption><tbody>' + ordre.map(j => {
      const h = R.horaires[j];
      return '<tr' + (j === auj ? ' class="aujourdhui"' : '') + '><th scope="row">' + jours[j] + '</th><td dir="ltr">' + (h.ouvert ? h.de + ' – ' + h.a : t('ferme')) + '</td></tr>';
    }).join('') + '</tbody>';
  }

  /* ------------------------------------------------------------------
     Langue
     ------------------------------------------------------------------ */
  function appliquerTout() {
    W.appliquerLangue(T);
    $$('[data-t-alt]').forEach(i => { i.alt = t(i.dataset.tAlt); });
    majStatut(); rendreJour(); rendreOnglets(); rendreCarte(); rendreInfos();
    initAnniversaire(); majFlottant();
    remplirHeures($('#res-heure'), $('#res-date').value);
    if ($('#res-ok').dataset.id) afficherConfirmationRes($('#res-ok').dataset.id);
    if (tiroir().open) rendreTiroir();
  }

  /* ------------------------------------------------------------------
     Évènements
     ------------------------------------------------------------------ */
  function brancher() {
    $$('[data-lang-btn]').forEach(b => b.addEventListener('click', () => { W.ecrire('langue', b.dataset.langBtn); appliquerTout(); }));
    $('#ouvrir-panier').addEventListener('click', () => ouvrirTiroir('panier'));
    $('#suivi-flottant').addEventListener('click', ev => ouvrirTiroir('suivi', ev.currentTarget.dataset.id));
    $('#recherche').addEventListener('input', ev => { filtre = ev.target.value; rendreCarte(); });

    document.addEventListener('click', ev => {
      const b = ev.target.closest('[data-plat]');
      if (b) {
        const plat = W.carte().plats.find(p => p.id === b.dataset.plat);
        if (!plat || !plat.dispo) return;
        if (plat.tailles || plat.choix || plat.sauce) ouvrirOptions(plat); else ajouterDirect(plat);
      }
      const j = ev.target.closest('[data-ajout-jour]');
      if (j) {
        const p = W.jour().plats.find(x => x.id === j.dataset.ajoutJour);
        if (p) { panier.ajouter({ id: p.id, nom: p.fr, ar: p.ar, cat: 'jour', qte: 1, pu: p.prix }); W.toast(W.nomL(p) + ' · ' + t('ajoute')); }
      }
      const o = ev.target.closest('.onglet');
      if (o) {
        ev.preventDefault();
        const cible = document.getElementById('cat-' + o.dataset.cat);
        if (cible) window.scrollTo({ top: cible.getBoundingClientRect().top + window.scrollY - 150, behavior: 'smooth' });
      }
    });

    // Actions du tiroir
    $('#dlg-panier').addEventListener('click', ev => {
      if (ev.target === tiroir()) { tiroir().close(); return; } // clic sur le fond
      const a = ev.target.closest('[data-action]');
      const L = panier.lignes();
      const plus = ev.target.closest('[data-plus]'), moins = ev.target.closest('[data-moins]');
      if (plus) { L[plus.dataset.plus].qte++; panier.sauver(L); rendreTiroir(); }
      if (moins) { const i = moins.dataset.moins; L[i].qte--; if (L[i].qte <= 0) L.splice(i, 1); panier.sauver(L); rendreTiroir(); }
      if (!a) return;
      const act = a.dataset.action;
      if (act === 'fermer') tiroir().close();
      if (act === 'commande') { vue = 'commande'; rendreTiroir(); }
      if (act === 'panier') { vue = 'panier'; rendreTiroir(); }
      if (act === 'valider') validerCommande();
      if (act === 'voir-carte') { tiroir().close(); vue = 'panier'; document.getElementById('carte').scrollIntoView({ behavior: 'smooth' }); }
    });
    $('#dlg-options').addEventListener('click', ev => { if (ev.target === $('#dlg-options')) $('#dlg-options').close(); });

    // Synchronisation avec l'espace gérant (autre onglet)
    W.surChangement(cle => {
      if (cle === 'commandes') { majFlottant(); if (tiroir().open && vue === 'suivi') rendreTiroir(); }
      if (cle === 'jour') rendreJour();
      if (cle === 'carte') { rendreOnglets(); rendreCarte(); initAnniversaire(); }
      if (cle === 'reglages') { majStatut(); rendreInfos(); rendreCarte(); }
      if (cle === 'reservations' && $('#res-ok').dataset.id) afficherConfirmationRes($('#res-ok').dataset.id);
      if (cle === 'panier') majCompteur();
    });
    setInterval(majStatut, 60e3);
  }

  /* ------------------------------------------------------------------
     Démarrage
     ------------------------------------------------------------------ */
  poserIcones();
  initReservation();
  brancherAnniversaire();
  brancher();
  appliquerTout();
  majCompteur();
})();
