/* =========================================================================
   Banet el Baraka — site client
   Sections : héros · self du jour · carte · fiche plat · panier & commande ·
              suivi en temps réel · traiteur (configurateur de devis) · infos
   ========================================================================= */
(function () {
  'use strict';
  const B = window.BNB;
  const { t, esc } = B;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  B.installer();

  /* ---------------- État ---------------- */
  let carte, R, zones, T;
  function charger() {
    carte = B.lire('carte');
    R = B.lire('reglages');
    zones = B.lire('zones');
    T = B.lire('traiteur');
  }
  charger();
  const plat = (id) => carte.plats.find((p) => p.id === id);
  const filtres = new Set();
  let recherche = '';

  /* ---------------- Icônes ---------------- */
  const ICO = {
    plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
    fermer: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    moto: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="17" r="3" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="18" cy="17" r="3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M9 17h5l3-6h-4l-2-3H8m6 3-2 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    sac: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 8a3 3 0 0 1 6 0" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
    table: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9h18M5 9v10M19 9v10M8 9l1-4h6l1 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    wa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l1.3-4A8 8 0 1 1 8 18.7L4 20Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 9.5c.3 2 2.3 4.2 4.6 4.8l1.1-1.1 1.6.8c-.3 1-1.2 1.6-2.2 1.5-3.2-.4-6-3.3-6.3-6.4 0-1 .6-1.9 1.6-2.1l.8 1.6L9 9.5Z" fill="currentColor"/></svg>',
    lieu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="9.5" r="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
    tel: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    horloge: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 7.5V12l3 2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    insta: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3.6" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17" cy="7" r="1.1" fill="currentColor"/></svg>',
    coche: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5 10 17 19 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    panierVide: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 7h12l-1 13H7L6 7Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M9 7a3 3 0 0 1 6 0" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>'
  };

  /* ---------------- Outils plats ---------------- */
  // Un plat se commande s'il est disponible ET, pour le fait maison, préparé aujourd'hui (self)
  function commandable(p) { return p.dispo && p.self !== false; }
  function raisonIndispo(p) { if (!p.dispo) return t('badge.epuise'); if (p.self === false) return t('badge.pas_self'); return ''; }
  function media(p, cls) {
    return p.photo
      ? '<img src="' + esc(p.photo) + '" alt="" loading="lazy" decoding="async" width="300" height="300">'
      : B.visuelTypo(p);
  }
  function nomPlat(p) { return esc(B.nom(p)); }
  function autreNom(p) { return B.langue === 'ar' ? p.fr : p.ar; }
  function descPlat(p) { return esc(B.langue === 'ar' ? (p.dar || p.dfr) : p.dfr); }
  function badgesTags(p) {
    return (p.tags || []).map((g) => '<span class="badge badge--' + g + '">' + esc(t('tag.' + g)) + '</span>').join('');
  }
  const sansAccents = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  /* ---------------- En-tête, héros, infos ---------------- */
  function rendreHeros() {
    $('#accroche').textContent = B.nom(R, 'accroche');
    const e = B.etatOuverture();
    const el = $('#etatOuverture');
    el.classList.toggle('ferme', !e.ouvert);
    el.textContent = e.ouvert ? t('etat.ouvert', { h: e.fermeture }) : t('etat.ferme', { h: e.ouverture });
    $('#delaiLivraison').textContent = t('heros.delai', { d: R.delaiLivraison });
    $('#btnLangue').innerHTML = B.langue === 'ar' ? '<span class="long">Français</span><span class="court" aria-hidden="true">FR</span>' : '<span class="long">العربية</span><span class="court" aria-hidden="true">ع</span>';
    $('#btnLangue').setAttribute('aria-label', B.langue === 'ar' ? 'Français' : 'العربية');
    $('#btnLangue').lang = B.langue === 'ar' ? 'fr' : 'ar';
    $('#annee').textContent = new Date().getFullYear();
  }

  function rendreInfos() {
    const carteUrl = B.lienCarte(R.lat, R.lng);
    const blocs = [
      { ico: ICO.lieu, titre: t('infos.adresse'), corps: '<p>' + esc(B.nom(R, 'adresse')) + '</p><a href="' + carteUrl + '" target="_blank" rel="noopener">' + esc(t('infos.itineraire')) + '</a>' },
      { ico: ICO.tel, titre: t('infos.tel'), corps: '<a href="tel:' + esc(R.tel.replace(/\s/g, '')) + '" dir="ltr">' + esc(R.tel) + '</a><a href="' + B.lienWhatsApp(R.whatsapp, t('wa.bonjour')) + '" target="_blank" rel="noopener">WhatsApp</a>' },
      { ico: ICO.horloge, titre: t('infos.horaires'), corps: '<p dir="ltr">' + esc(R.ouverture) + ' – ' + esc(R.fermeture) + '</p><small>' + esc(t('infos.tous_jours')) + '</small>' },
      { ico: ICO.insta, titre: t('infos.suivre'), corps: '<a href="https://www.instagram.com/' + esc(R.instagram) + '/" target="_blank" rel="noopener" dir="ltr">@' + esc(R.instagram) + '</a><a href="https://delivery.yassir.com/fr/restaurants/6a0c42bd6a8d6ab0758af922/Banet-al-Baraka" target="_blank" rel="noopener">' + esc(t('heros.yassir')) + '</a>' }
    ];
    $('#infosGrille').innerHTML = blocs.map((b) => '<article class="info"><span class="info__ico">' + b.ico + '</span><h3>' + esc(b.titre) + '</h3>' + b.corps + '</article>').join('');
  }

  /* ---------------- Le self du jour ---------------- */
  function rendreSelf() {
    const duJour = carte.plats.filter((p) => p.self === true);
    const une = plat(R.platDuJour);
    const zoneUne = $('#selfUne');
    if (une && une.self && une.dispo) {
      zoneUne.innerHTML =
        '<article class="une"><div class="une__media">' + media(une) + '</div><div>' +
        '<span class="badge badge--une">★ ' + esc(t('self.une')) + '</span>' +
        '<h3>' + nomPlat(une) + '</h3><p>' + descPlat(une) + '</p>' +
        '<div class="une__bas"><span class="une__prix">' + B.prix(une.prix) + '</span>' +
        '<button class="btn btn--plein" type="button" data-ouvrir="' + une.id + '">' + esc(t('fiche.ajouter_court')) + '</button></div></div></article>';
    } else zoneUne.innerHTML = '';
    $('#selfListe').innerHTML = duJour.length
      ? duJour.map((p) => {
          const off = !p.dispo;
          return '<li><button type="button" class="self-item' + (off ? ' epuise' : '') + '" data-ouvrir="' + p.id + '">' +
            '<span class="self-item__media">' + media(p) + (off ? '<span class="badge badge--epuise">' + esc(t('badge.epuise')) + '</span>' : '') + '</span>' +
            '<span class="self-item__nom">' + nomPlat(p) + '</span><span class="self-item__prix">' + B.prix(p.prix) + '</span></button></li>';
        }).join('')
      : '<li class="vide">' + esc(t('self.vide')) + '</li>';
  }

  /* ---------------- La carte ---------------- */
  function correspond(p) {
    for (const f of filtres) if (!(p.tags || []).includes(f)) return false;
    if (!recherche) return true;
    const q = sansAccents(recherche);
    return sansAccents(p.fr).includes(q) || String(p.ar).includes(recherche) || sansAccents(p.dfr).includes(q);
  }
  function rendreCarte() {
    const sections = [];
    const onglets = [];
    carte.categories.forEach((c) => {
      const liste = carte.plats.filter((p) => p.cat === c.id && correspond(p));
      if (!liste.length) return;
      onglets.push('<a class="onglet" href="#cat-' + c.id + '" data-cat="' + c.id + '">' + esc(B.nom(c)) + '</a>');
      sections.push(
        '<section class="categorie" id="cat-' + c.id + '" aria-labelledby="h-' + c.id + '">' +
        '<h3 class="categorie__titre" id="h-' + c.id + '">' + esc(B.nom(c)) + ' <small>' + liste.length + '</small></h3>' +
        (c.id === 'maison' ? '<p class="categorie__note">' + esc(t('carte.note_maison')) + '</p>' : '') +
        '<div class="grille">' + liste.map(cartePlat).join('') + '</div></section>');
    });
    $('#onglets').innerHTML = onglets.join('');
    $('#carteContenu').innerHTML = sections.join('');
    $('#carteVide').hidden = sections.length > 0;
    observerOnglets();
  }
  function cartePlat(p) {
    const ok = commandable(p);
    const raison = raisonIndispo(p);
    return '<button type="button" class="plat' + (ok ? '' : ' indispo') + '" data-ouvrir="' + p.id + '">' +
      '<span class="plat__texte"><span class="plat__nom">' + nomPlat(p) + '</span>' +
      '<span class="plat__ar" lang="' + (B.langue === 'ar' ? 'fr' : 'ar') + '">' + esc(autreNom(p)) + '</span>' +
      (p.dfr ? '<span class="plat__desc">' + descPlat(p) + '</span>' : '') +
      '<span class="plat__badges">' + (raison ? '<span class="badge ' + (p.dispo ? 'badge--off' : 'badge--epuise') + '">' + esc(raison) + '</span>' : '') + badgesTags(p) + '</span>' +
      '<span class="plat__bas"><span class="plat__prix">' + B.prix(p.prix) + '</span></span></span>' +
      '<span class="plat__media">' + media(p) + '<span class="plat__plus">' + ICO.plus + '</span></span>' +
      '<span class="sr">' + esc(ok ? t('fiche.voir') : raison) + '</span></button>';
  }
  // onglet actif selon la section visible
  let obs;
  function observerOnglets() {
    if (obs) obs.disconnect();
    if (!('IntersectionObserver' in window)) return;
    obs = new IntersectionObserver((entrees) => {
      entrees.forEach((e) => {
        if (!e.isIntersecting) return;
        const id = e.target.id.replace('cat-', '');
        $$('.onglet').forEach((o) => {
          const actif = o.dataset.cat === id;
          o.classList.toggle('actif', actif);
          if (actif) { o.setAttribute('aria-current', 'true'); const n = $('#onglets'); n.scrollTo({ left: o.offsetLeft - n.clientWidth / 2 + o.clientWidth / 2, behavior: 'smooth' }); }
          else o.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-140px 0px -60% 0px' });
    $$('.categorie').forEach((s) => obs.observe(s));
  }

  /* ---------------- Modales ---------------- */
  function ouvrir(dlg) { if (!dlg.open) dlg.showModal(); }
  function fermer(dlg) { if (dlg.open) dlg.close(); }
  $$('dialog').forEach((d) => {
    d.addEventListener('click', (e) => { if (e.target === d) fermer(d); }); // clic sur le fond
  });
  const btnFermer = () => '<button type="button" class="modale__fermer" data-fermer aria-label="' + esc(t('a11y.fermer')) + '">' + ICO.fermer + '</button>';
  document.addEventListener('click', (e) => {
    const f = e.target.closest('[data-fermer]');
    if (f) fermer(f.closest('dialog'));
    const o = e.target.closest('[data-ouvrir]');
    if (o) ouvrirFiche(o.dataset.ouvrir);
  });

  /* ---------------- Fiche plat ---------------- */
  let ficheEtat = null;
  function groupesPour(p) {
    const S = carte.supplements;
    const ids = (S.parCategorie[p.cat] || []);
    const excl = (S.exclusions && S.exclusions[p.cat]) || [];
    return ids.map((id) => {
      const g = S.groupes.find((x) => x.id === id);
      return Object.assign({}, g, { choix: g.choix.filter((c) => !excl.includes(c.id)) });
    });
  }
  function ouvrirFiche(id) {
    const p = plat(id); if (!p) return;
    ficheEtat = { id, qte: 1, opts: {}, note: '' };
    groupesPour(p).forEach((g) => { if (g.type === 'unique') ficheEtat.opts[g.id] = [g.choix[0].id]; else ficheEtat.opts[g.id] = []; });
    rendreFiche();
    ouvrir($('#fiche'));
  }
  function prixFiche(p) {
    let extra = 0;
    groupesPour(p).forEach((g) => (ficheEtat.opts[g.id] || []).forEach((cid) => { const c = g.choix.find((x) => x.id === cid); if (c) extra += c.prix; }));
    return (p.prix + extra) * ficheEtat.qte;
  }
  function rendreFiche() {
    const p = plat(ficheEtat.id); const ok = commandable(p);
    const groupes = groupesPour(p);
    $('#fiche').innerHTML = btnFermer() +
      '<div class="fiche"><div class="fiche__media">' + media(p) + '</div><div class="modale__corps">' +
      '<div class="plat__badges">' + badgesTags(p) + '</div>' +
      '<h2 id="ficheNom">' + nomPlat(p) + '</h2><p class="fiche__ar" lang="' + (B.langue === 'ar' ? 'fr' : 'ar') + '">' + esc(autreNom(p)) + '</p>' +
      '<p class="fiche__desc">' + descPlat(p) + '</p><p class="fiche__prix">' + B.prix(p.prix) + '</p>' +
      (ok ? '' : '<p class="fiche__info">' + esc(raisonIndispo(p)) + ' — ' + esc(t(p.dispo ? 'fiche.pas_self_txt' : 'fiche.epuise_txt')) + '</p>') +
      (ok ? groupes.map((g) => '<fieldset class="groupe"><legend>' + esc(B.nom(g)) + '</legend>' + g.choix.map((c) =>
        '<label class="option"><input type="' + (g.type === 'unique' ? 'radio' : 'checkbox') + '" name="g-' + g.id + '" value="' + c.id + '" data-groupe="' + g.id + '"' +
        ((ficheEtat.opts[g.id] || []).includes(c.id) ? ' checked' : '') + '><span>' + esc(B.nom(c)) + '</span>' +
        (c.prix ? '<span class="plus">+' + B.prix(c.prix) + '</span>' : '') + '</label>').join('') + '</fieldset>').join('') +
        '<label class="champ groupe"><span>' + esc(t('fiche.note')) + '</span><textarea id="ficheNote" rows="2" placeholder="' + esc(t('fiche.note_ph')) + '"></textarea></label>' : '') +
      '</div>' +
      (ok ? '<div class="fiche__pied"><div class="quantite" role="group" aria-label="' + esc(t('fiche.quantite')) + '">' +
        '<button type="button" data-q="-1" aria-label="' + esc(t('a11y.moins')) + '">−</button><output id="ficheQte" aria-live="polite">' + ficheEtat.qte + '</output>' +
        '<button type="button" data-q="1" aria-label="' + esc(t('a11y.plus')) + '">+</button></div>' +
        '<button type="button" class="btn btn--plein btn--grand" id="ficheAjouter">' + esc(t('fiche.ajouter')) + ' · <span id="fichePrix">' + B.prix(prixFiche(p)) + '</span></button></div>' : '') +
      '</div>';
    B.appliquerTextes($('#fiche'));
  }
  $('#fiche').addEventListener('change', (e) => {
    const i = e.target; if (!i.dataset.groupe) return;
    ficheEtat.opts[i.dataset.groupe] = $$('input[data-groupe="' + i.dataset.groupe + '"]:checked', $('#fiche')).map((x) => x.value);
    $('#fichePrix').textContent = B.prix(prixFiche(plat(ficheEtat.id)));
  });
  $('#fiche').addEventListener('click', (e) => {
    const q = e.target.closest('[data-q]');
    if (q) {
      ficheEtat.qte = Math.max(1, Math.min(50, ficheEtat.qte + Number(q.dataset.q)));
      $('#ficheQte').textContent = ficheEtat.qte;
      $('#fichePrix').textContent = B.prix(prixFiche(plat(ficheEtat.id)));
    }
    if (e.target.closest('#ficheAjouter')) {
      const p = plat(ficheEtat.id);
      const opts = [];
      groupesPour(p).forEach((g) => (ficheEtat.opts[g.id] || []).forEach((cid) => { if (cid !== 'aucune') opts.push(g.id + ':' + cid); }));
      ajouterAuPanier({ id: p.id, qte: ficheEtat.qte, opts, note: ($('#ficheNote') || {}).value || '' });
      fermer($('#fiche'));
      B.toast(t('panier.ajoute', { n: B.nom(p) }), 'ok');
    }
  });

  /* ---------------- Panier ---------------- */
  let panier = B.lire('panier', []);
  function optionsDe(ligne) {
    // reconstruit les options à partir de la carte actuelle (les prix suivent les modifications du gérant)
    return (ligne.opts || []).map((k) => {
      const [gid, cid] = k.split(':');
      const g = carte.supplements.groupes.find((x) => x.id === gid);
      const c = g && g.choix.find((x) => x.id === cid);
      return c ? { fr: c.fr, ar: c.ar, prix: c.prix } : null;
    }).filter(Boolean);
  }
  function lignesDetaillees() {
    return panier.map((l) => {
      const p = plat(l.id); if (!p) return null;
      return { cle: l.cle, id: p.id, fr: p.fr, ar: p.ar, prix: p.prix, qte: l.qte, opts: optionsDe(l), note: l.note, p, ok: commandable(p) };
    }).filter(Boolean);
  }
  function sousTotal() { return lignesDetaillees().filter((l) => l.ok).reduce((s, l) => s + B.totalLigne(l), 0); }
  function nbArticles() { return panier.reduce((s, l) => s + l.qte, 0); }
  function sauverPanier() { B.ecrire('panier', panier); majBadgePanier(true); }
  function ajouterAuPanier(l) {
    const cle = l.id + '|' + l.opts.slice().sort().join(',') + '|' + l.note;
    const ex = panier.find((x) => x.cle === cle);
    if (ex) ex.qte += l.qte; else panier.push(Object.assign({ cle }, l));
    sauverPanier();
  }
  function majBadgePanier(anim) {
    const n = nbArticles();
    const pa = $('#nbPanier'); pa.textContent = n;
    if (anim) { pa.classList.remove('saute'); void pa.offsetWidth; pa.classList.add('saute'); }
    $('#barrePanier').hidden = n === 0;
    $('#barreNb').textContent = n;
    $('#barreTotal').textContent = B.prix(sousTotal());
  }

  /* ---------------- Tunnel de commande ---------------- */
  const profil = B.lire('profil', {});
  const cmd = { etape: 'panier', mode: 'livraison', zone: profil.zone || '', cite: profil.cite || '', batiment: profil.batiment || '', etage: profil.etage || '', repere: profil.repere || '', quand: 'asap', heure: '', nom: profil.nom || '', tel: profil.tel || '', remarque: '' };
  const ETAPES = ['panier', 'mode', 'infos'];
  function ouvrirPanier() { cmd.etape = 'panier'; rendrePanier(); ouvrir($('#panier')); }
  function zoneCourante() { return zones.find((z) => z.id === cmd.zone); }
  function fraisLivraison() { const z = zoneCourante(); return cmd.mode === 'livraison' && z ? z.frais : 0; }

  // créneaux horaires (toutes les 15 min) pour une commande programmée
  function creneaux() {
    const e = B.etatOuverture();
    const now = new Date();
    const o = B.minutes(R.ouverture), f = B.minutes(R.fermeture);
    let depart, demain = false;
    const m = now.getHours() * 60 + now.getMinutes();
    if (e.ouvert) depart = m + 30;
    else if (m < o) depart = o + 30;
    else { depart = o + 30; demain = true; }
    depart = Math.ceil(depart / 15) * 15;
    const liste = [];
    for (let x = depart; x <= f - 15; x += 15) liste.push(B.pad(Math.floor(x / 60)) + ':' + B.pad(x % 60));
    return { liste, demain };
  }

  function rendrePanier() {
    const d = $('#panier');
    const lignes = lignesDetaillees();
    const idx = ETAPES.indexOf(cmd.etape);
    const titres = { panier: t('panier.titre'), mode: t('tunnel.mode'), infos: t('tunnel.infos') };
    let corps = '', pied = '';
    if (cmd.etape === 'panier') {
      if (!lignes.length) {
        corps = '<div class="vide">' + ICO.panierVide + '<p>' + esc(t('panier.vide')) + '</p></div>';
        pied = '<button type="button" class="btn btn--plein btn--grand" data-fermer>' + esc(t('panier.voir_carte')) + '</button>';
      } else {
        corps = lignes.map((l) =>
          '<div class="ligne-panier"><span class="ligne-panier__media">' + media(l.p) + '</span><div><div class="ligne-panier__nom">' + esc(B.nom(l)) + '</div>' +
          (l.opts.length ? '<div class="ligne-panier__opts">' + l.opts.map((o) => esc(B.nom(o))).join(', ') + '</div>' : '') +
          (l.note ? '<div class="ligne-panier__opts">« ' + esc(l.note) + ' »</div>' : '') +
          (l.ok ? '' : '<span class="badge badge--epuise">' + esc(raisonIndispo(l.p)) + '</span>') + '</div>' +
          '<div class="ligne-panier__droite"><span class="ligne-panier__prix">' + B.prix(B.totalLigne(l)) + '</span>' +
          '<div class="quantite quantite--petit" role="group" aria-label="' + esc(t('fiche.quantite')) + '"><button type="button" data-lq="-1" data-cle="' + esc(l.cle) + '" aria-label="' + esc(t('a11y.moins')) + '">−</button><span>' + l.qte + '</span><button type="button" data-lq="1" data-cle="' + esc(l.cle) + '" aria-label="' + esc(t('a11y.plus')) + '">+</button></div></div></div>'
        ).join('') +
          '<dl class="totaux"><div class="grand"><dt>' + esc(t('panier.sous_total')) + '</dt><dd>' + B.prix(sousTotal()) + '</dd></div></dl>' +
          (lignes.some((l) => !l.ok) ? '<p class="encart encart--alerte" style="margin-top:12px">' + esc(t('panier.indispo_retire')) + '</p>' : '');
        pied = '<button type="button" class="btn btn--plein btn--grand" data-etape="mode"' + (sousTotal() ? '' : ' disabled') + '>' + esc(t('tunnel.continuer')) + '</button>';
      }
    }
    if (cmd.etape === 'mode') {
      const modes = [['livraison', ICO.moto, t('mode.livraison'), t('mode.livraison_sous', { d: R.delaiLivraison })], ['emporter', ICO.sac, t('mode.emporter'), t('mode.emporter_sous')], ['surplace', ICO.table, t('mode.surplace'), t('mode.surplace_sous')]];
      corps = '<div class="cartes-choix" role="radiogroup" aria-label="' + esc(t('tunnel.mode')) + '">' + modes.map(([v, ico, l, s]) =>
        '<label class="carte-choix"><input type="radio" name="mode" value="' + v + '"' + (cmd.mode === v ? ' checked' : '') + '>' + ico + '<strong>' + esc(l) + '</strong><small>' + esc(s) + '</small></label>').join('') + '</div>';
      if (cmd.mode === 'livraison') {
        const z = zoneCourante();
        corps += '<div class="tunnel__section"><h3>' + esc(t('liv.adresse')) + '</h3><div class="champs-grille">' +
          '<label class="champ champ--large"><span>' + esc(t('liv.zone')) + '</span><select id="cZone" required><option value="">' + esc(t('liv.choisir_zone')) + '</option>' +
          zones.map((zz) => '<option value="' + zz.id + '"' + (cmd.zone === zz.id ? ' selected' : '') + '>' + esc(B.nom(zz)) + ' · ' + B.prix(zz.frais) + ' · ' + zz.temps + ' min</option>').join('') + '</select></label>' +
          (z ? '<p class="encart encart--info champ--large">' + esc(t('liv.zone_info', { f: B.prix(z.frais), m: B.prix(z.min), d: z.temps })) + '</p>' : '') +
          '<label class="champ champ--large"><span>' + esc(t('liv.cite')) + '</span><input id="cCite" value="' + esc(cmd.cite) + '" autocomplete="address-line1" required></label>' +
          '<label class="champ"><span>' + esc(t('liv.batiment')) + '</span><input id="cBat" value="' + esc(cmd.batiment) + '"></label>' +
          '<label class="champ"><span>' + esc(t('liv.etage')) + '</span><input id="cEtage" value="' + esc(cmd.etage) + '" inputmode="numeric"></label>' +
          '<label class="champ champ--large"><span>' + esc(t('liv.repere')) + '</span><input id="cRepere" value="' + esc(cmd.repere) + '" placeholder="' + esc(t('liv.repere_ph')) + '" required></label>' +
          '</div></div>';
      }
      corps += '<p class="erreur" id="cErreur" role="alert"></p>';
      pied = '<button type="button" class="btn btn--ligne btn--grand" data-etape="panier">' + esc(t('tunnel.retour')) + '</button><button type="button" class="btn btn--plein btn--grand" data-valider="mode">' + esc(t('tunnel.continuer')) + '</button>';
    }
    if (cmd.etape === 'infos') {
      const e = B.etatOuverture();
      if (!e.ouvert) cmd.quand = 'prog';
      const cr = creneaux();
      if (!cmd.heure || !cr.liste.includes(cmd.heure)) cmd.heure = cr.liste[0] || '';
      const st = sousTotal(), fr = fraisLivraison();
      corps =
        '<div class="tunnel__section"><h3>' + esc(t('quand.titre')) + '</h3>' +
        (!e.ouvert ? '<p class="encart encart--alerte">' + esc(t('quand.ferme', { h: R.ouverture })) + '</p>' : '') +
        '<div class="cartes-choix" style="grid-template-columns:1fr 1fr">' +
        '<label class="carte-choix"><input type="radio" name="quand" value="asap"' + (cmd.quand === 'asap' ? ' checked' : '') + (e.ouvert ? '' : ' disabled') + '><strong>' + esc(t('quand.asap')) + '</strong><small>' + esc(cmd.mode === 'livraison' ? (zoneCourante() || {}).temps + ' min' : '15-20 min') + '</small></label>' +
        '<label class="carte-choix"><input type="radio" name="quand" value="prog"' + (cmd.quand === 'prog' ? ' checked' : '') + '><strong>' + esc(t('quand.prog')) + '</strong><small>' + esc(cr.demain ? t('quand.demain') : t('quand.aujourdhui')) + '</small></label></div>' +
        (cmd.quand === 'prog' ? '<label class="champ" style="margin-top:10px"><span>' + esc(t('quand.heure')) + '</span><select id="cHeure">' + cr.liste.map((h) => '<option' + (h === cmd.heure ? ' selected' : '') + '>' + h + '</option>').join('') + '</select></label>' : '') +
        '</div>' +
        '<div class="tunnel__section"><h3>' + esc(t('tunnel.coordonnees')) + '</h3><div class="champs-grille">' +
        '<label class="champ"><span>' + esc(t('f.nom')) + '</span><input id="cNom" value="' + esc(cmd.nom) + '" autocomplete="name" required></label>' +
        '<label class="champ"><span>' + esc(t('f.tel')) + '</span><input id="cTel" type="tel" inputmode="tel" value="' + esc(cmd.tel) + '" autocomplete="tel" placeholder="05 / 06 / 07 …" required aria-describedby="cTelAide"><span class="aide" id="cTelAide">' + esc(t('f.tel_aide')) + '</span></label>' +
        '<label class="champ champ--large"><span>' + esc(t('f.remarque')) + '</span><textarea id="cRemarque" rows="2" placeholder="' + esc(t('f.remarque_ph')) + '">' + esc(cmd.remarque) + '</textarea></label></div></div>' +
        '<div class="tunnel__section"><h3>' + esc(t('paiement.titre')) + '</h3><p class="encart">' + esc(t(cmd.mode === 'livraison' ? 'paiement.livraison' : 'paiement.comptoir')) + '</p></div>' +
        '<dl class="totaux"><div><dt>' + esc(t('panier.sous_total')) + '</dt><dd>' + B.prix(st) + '</dd></div>' +
        (cmd.mode === 'livraison' ? '<div><dt>' + esc(t('panier.frais', { z: B.nom(zoneCourante()) })) + '</dt><dd>' + B.prix(fr) + '</dd></div>' : '') +
        '<div class="grand"><dt>' + esc(t('panier.total')) + '</dt><dd>' + B.prix(st + fr) + '</dd></div></dl>' +
        '<p class="erreur" id="cErreur" role="alert"></p>';
      pied = '<button type="button" class="btn btn--ligne btn--grand" data-etape="mode">' + esc(t('tunnel.retour')) + '</button><button type="button" class="btn btn--or btn--grand" data-valider="infos">' + esc(t('tunnel.valider')) + '</button>';
    }
    d.innerHTML = btnFermer() + '<div class="tunnel__tete"><h2 id="panierTitre">' + esc(titres[cmd.etape]) + '</h2>' +
      '<div class="progression" aria-hidden="true">' + ETAPES.map((_, i) => '<span class="' + (i <= idx ? 'ok' : '') + '"></span>').join('') + '</div></div>' +
      '<div class="modale__corps">' + corps + '</div>' + (pied ? '<div class="tunnel__pied">' + pied + '</div>' : '');
  }
  function lireChamps() {
    const v = (id) => { const el = $('#' + id); return el ? el.value.trim() : undefined; };
    if (v('cZone') !== undefined) cmd.zone = v('cZone');
    if (v('cCite') !== undefined) { cmd.cite = v('cCite'); cmd.batiment = v('cBat'); cmd.etage = v('cEtage'); cmd.repere = v('cRepere'); }
    if (v('cNom') !== undefined) { cmd.nom = v('cNom'); cmd.tel = v('cTel'); cmd.remarque = v('cRemarque'); }
    if (v('cHeure') !== undefined) cmd.heure = v('cHeure');
  }
  function erreur(msg, champ) {
    $('#cErreur').textContent = msg;
    $$('#panier [aria-invalid]').forEach((x) => x.removeAttribute('aria-invalid'));
    if (champ) { const el = $('#' + champ); el.setAttribute('aria-invalid', 'true'); el.focus(); }
  }
  $('#panier').addEventListener('click', (e) => {
    const lq = e.target.closest('[data-lq]');
    if (lq) {
      const l = panier.find((x) => x.cle === lq.dataset.cle);
      if (l) { l.qte += Number(lq.dataset.lq); if (l.qte <= 0) panier = panier.filter((x) => x !== l); sauverPanier(); rendrePanier(); }
      return;
    }
    const et = e.target.closest('[data-etape]');
    if (et) { lireChamps(); cmd.etape = et.dataset.etape; rendrePanier(); $('#panier').scrollTop = 0; return; }
    const va = e.target.closest('[data-valider]');
    if (!va) return;
    lireChamps();
    if (va.dataset.valider === 'mode') {
      if (cmd.mode === 'livraison') {
        const z = zoneCourante();
        if (!z) return erreur(t('err.zone'), 'cZone');
        if (!cmd.cite) return erreur(t('err.cite'), 'cCite');
        if (!cmd.repere) return erreur(t('err.repere'), 'cRepere');
        if (sousTotal() < z.min) return erreur(t('err.minimum', { m: B.prix(z.min), z: B.nom(z) }));
      }
      cmd.etape = 'infos'; rendrePanier(); $('#panier').scrollTop = 0;
    } else {
      if (cmd.nom.length < 2) return erreur(t('err.nom'), 'cNom');
      if (!B.telValide(cmd.tel)) return erreur(t('err.tel'), 'cTel');
      if (cmd.quand === 'prog' && !cmd.heure) return erreur(t('err.heure'));
      validerCommande();
    }
  });
  $('#panier').addEventListener('change', (e) => {
    if (e.target.name === 'mode') { lireChamps(); cmd.mode = e.target.value; rendrePanier(); }
    if (e.target.id === 'cZone') { lireChamps(); rendrePanier(); }
    if (e.target.name === 'quand') { lireChamps(); cmd.quand = e.target.value; rendrePanier(); }
  });

  function validerCommande() {
    const lignes = lignesDetaillees().filter((l) => l.ok).map((l) => ({ id: l.id, fr: l.fr, ar: l.ar, prix: l.prix, qte: l.qte, opts: l.opts, note: l.note }));
    const st = lignes.reduce((s, l) => s + B.totalLigne(l), 0);
    const fr = fraisLivraison();
    const cr = creneaux();
    const c = {
      id: B.prochainNumero('commande'), cree: Date.now(), mode: cmd.mode, canal: 'site',
      client: { nom: cmd.nom, tel: cmd.tel }, zone: cmd.mode === 'livraison' ? cmd.zone : '',
      adresse: cmd.mode === 'livraison' ? { cite: cmd.cite, batiment: cmd.batiment, etage: cmd.etage, repere: cmd.repere } : null,
      heure: cmd.quand === 'asap' ? 'asap' : cmd.heure, demain: cmd.quand === 'prog' && cr.demain,
      lignes, sousTotal: st, frais: fr, total: st + fr,
      statut: 'recue', historique: [{ s: 'recue', t: Date.now() }], livreur: '', remarque: cmd.remarque,
      paye: false, modePaiement: '', zId: ''
    };
    const toutes = B.lire('commandes', []); toutes.push(c); B.ecrire('commandes', toutes);
    // fichier clients + fidélité
    const clients = B.lire('clients', {}); const k = cmd.tel.replace(/\D/g, '').replace(/^213/, '0');
    const f = clients[k] || { nom: cmd.nom, tel: cmd.tel, nb: 0, total: 0, offertes: 0 };
    f.nom = cmd.nom; f.nb += 1; f.total += c.total; f.derniere = c.cree; clients[k] = f; B.ecrire('clients', clients);
    // mémorise le client (pour la prochaine fois) et la commande à suivre
    B.ecrire('profil', { nom: cmd.nom, tel: cmd.tel, zone: cmd.zone, cite: cmd.cite, batiment: cmd.batiment, etage: cmd.etage, repere: cmd.repere });
    const mes = B.lire('mes-commandes', []); mes.unshift(c.id); B.ecrire('mes-commandes', mes.slice(0, 10));
    panier = []; sauverPanier(); cmd.remarque = '';
    fermer($('#panier'));
    ouvrirSuivi(c.id);
  }

  /* ---------------- Suivi en temps réel ---------------- */
  let suiviId = null;
  function ouvrirSuivi(id) { suiviId = id; rendreSuivi(); ouvrir($('#suivi')); }
  function texteWhatsAppCommande(c) {
    const lignes = c.lignes.map((l) => '• ' + l.qte + ' × ' + B.nom(l) + (l.opts && l.opts.length ? ' (' + l.opts.map((o) => B.nom(o)).join(', ') + ')' : '') + ' — ' + B.prix(B.totalLigne(l))).join('\n');
    const z = zones.find((x) => x.id === c.zone);
    return t('wa.commande', { n: c.id }) + '\n\n' + lignes + '\n\n' +
      t('panier.total') + ' : ' + B.prix(c.total) + '\n' +
      t('mode.' + c.mode) + (c.heure !== 'asap' ? ' · ' + t('quand.prog') + ' ' + c.heure : '') + '\n' +
      (c.adresse ? t('liv.adresse') + ' : ' + [B.nom(z), c.adresse.cite, c.adresse.batiment, c.adresse.etage && (t('liv.etage') + ' ' + c.adresse.etage), c.adresse.repere].filter(Boolean).join(', ') + '\n' : '') +
      c.client.nom + ' · ' + c.client.tel + (c.remarque ? '\n' + c.remarque : '');
  }
  function rendreSuivi() {
    const c = B.lire('commandes', []).find((x) => x.id === suiviId);
    const d = $('#suivi');
    if (!c) { d.innerHTML = btnFermer() + '<div class="modale__corps"><p>' + esc(t('suivi.introuvable')) + '</p></div>'; return; }
    const etapes = B.etapesPour(c.mode);
    const pos = etapes.indexOf(c.statut === 'prete' && c.mode === 'livraison' ? 'preparation' : c.statut);
    const heures = {}; (c.historique || []).forEach((h) => { heures[h.s] = h.t; });
    const z = zones.find((x) => x.id === c.zone);
    const eta = c.heure !== 'asap' ? t('suivi.prevue', { h: c.heure }) : (c.mode === 'livraison' ? t('suivi.eta', { d: z ? z.temps : R.delaiLivraison }) : t('suivi.eta', { d: '15-20' }));
    const clients = B.lire('clients', {}); const fi = clients[c.client.tel.replace(/\D/g, '').replace(/^213/, '0')];
    const seuil = (R.fidelite || {}).seuil || 10;
    const nbF = fi ? fi.nb % seuil : 0;
    d.innerHTML = btnFermer() +
      '<div class="suivi__tete"><p>' + esc(t('suivi.commande')) + '</p><h2 id="suiviTitre" class="num">' + esc(c.id) + '</h2>' +
      '<p>' + esc(t('suivi.merci', { n: c.client.nom })) + '</p>' +
      (c.statut !== 'refusee' && c.statut !== 'livree' ? '<span class="suivi__eta">' + ICO.horloge.replace('<svg', '<svg width="18" height="18"') + esc(eta) + '</span>' : '') + '</div>' +
      '<div class="modale__corps">' +
      (c.statut === 'refusee'
        ? '<p class="encart encart--alerte">' + esc(t('suivi.refusee', { tel: R.tel })) + '</p>'
        : '<ol class="etapes" aria-live="polite">' + etapes.map((s, i) => {
            const cls = i < pos || (i === pos && s === 'livree') ? 'fait' : i === pos ? 'encours' : '';
            return '<li class="' + cls + '"><span class="rond">' + (i < pos || cls === 'fait' ? ICO.coche.replace('<svg', '<svg width="16" height="16"') : i + 1) + '</span><span>' + esc(B.libelleStatut(s, c.mode)) +
              (s === 'livraison' && c.livreur && i <= pos ? ' · ' + esc(c.livreur) : '') + '</span><span class="h">' + (heures[s] ? B.heure(heures[s]) : '') + '</span></li>';
          }).join('') + '</ol>') +
      '<div class="suivi__recap"><ul>' + c.lignes.map((l) => '<li><span>' + l.qte + ' × ' + esc(B.nom(l)) + '</span><span>' + B.prix(B.totalLigne(l)) + '</span></li>').join('') +
      (c.frais ? '<li><span>' + esc(t('panier.frais_court')) + '</span><span>' + B.prix(c.frais) + '</span></li>' : '') +
      '<li><strong>' + esc(t('panier.total')) + '</strong><strong>' + B.prix(c.total) + '</strong></li></ul></div>' +
      (fi ? '<div class="fidelite">' + esc(t('fid.texte', { n: nbF === 0 ? seuil : nbF, s: seuil, r: B.nom(R.fidelite) })) + '<div class="jauge"><span style="width:' + ((nbF === 0 ? seuil : nbF) / seuil * 100) + '%"></span></div></div>' : '') +
      '<div class="suivi__actions"><a class="btn btn--wa btn--grand" target="_blank" rel="noopener" href="' + B.lienWhatsApp(R.whatsapp, texteWhatsAppCommande(c)) + '">' + ICO.wa + esc(t('suivi.whatsapp')) + '</a>' +
      '<a class="btn btn--ligne" href="tel:' + esc(R.tel.replace(/\s/g, '')) + '">' + ICO.tel + esc(t('suivi.appeler')) + '</a></div></div>';
  }
  function majBoutonSuivi() {
    const mes = B.lire('mes-commandes', []);
    const actives = B.lire('commandes', []).filter((c) => mes.includes(c.id) && !['livree', 'refusee'].includes(c.statut));
    $('#btnSuivi').hidden = actives.length === 0;
    $('#btnSuivi').dataset.id = actives.length ? actives[actives.length - 1].id : '';
  }
  $('#btnSuivi').addEventListener('click', () => ouvrirSuivi($('#btnSuivi').dataset.id));

  /* ---------------- Traiteur ---------------- */
  const dv = { type: 'mariage', date: '', heure: '19:00', invites: 100, mode: 'formule', formule: 'prestige', pieces: {}, options: [], nom: profil.nom || '', tel: profil.tel || '', lieu: '', remarques: '' };
  let calMois = null;
  function dateMin() { const d = new Date(); d.setDate(d.getDate() + (T.delaiMin || 3)); return B.isoJour(d); }

  function rendreTraiteurStatique() {
    $('#evenements').innerHTML = T.evenements.filter((e) => e.id !== 'autre').map((e) => '<li><button type="button" data-evt="' + e.id + '">' + esc(B.nom(e)) + '</button></li>').join('');
    $('#formules').innerHTML = T.formules.map((f, i) =>
      '<article class="formule' + (i === 1 ? ' formule--phare' : '') + '"><div class="formule__photos">' +
      f.photos.map((id) => { const p = plat(id); return p && p.photo ? '<img src="' + esc(p.photo) + '" alt="' + esc(B.nom(p)) + '" loading="lazy" width="200" height="200">' : ''; }).join('') + '</div>' +
      '<div class="formule__corps"><span class="formule__ex">' + esc(t('tr.formule_ex')) + '</span><div class="formule__nom"><h3>' + esc(B.nom(f)) + '</h3><span class="formule__prix">' + B.prix(f.prix) + ' <small>' + esc(t('tr.par_pers')) + '</small></span></div>' +
      '<ul>' + f.contenu.map((c) => '<li>' + esc(B.nom(c)) + '</li>').join('') + '</ul>' +
      '<button type="button" class="btn ' + (i === 1 ? 'btn--or' : 'btn--sombre') + '" data-choisir="' + f.id + '">' + esc(t('tr.choisir')) + '</button></div></article>').join('');
    $('#dvTypes').innerHTML = T.evenements.map((e) => '<label><input type="radio" name="dvType" value="' + e.id + '"' + (dv.type === e.id ? ' checked' : '') + '><span>' + esc(B.nom(e)) + '</span></label>').join('');
    $('#dvFormules').innerHTML = T.formules.map((f) => '<label class="carte-choix"><input type="radio" name="dvFormule" value="' + f.id + '"' + (dv.formule === f.id ? ' checked' : '') + '><strong>' + esc(B.nom(f)) + '</strong><small>' + B.prix(f.prix) + ' ' + esc(t('tr.par_pers')) + '</small></label>').join('');
    const ligne = (id, unite) => {
      const p = plat(id); if (!p) return '';
      return '<label class="piece">' + (p.photo ? '<img src="' + esc(p.photo) + '" alt="" loading="lazy" width="48" height="48">' : '<span></span>') +
        '<span><span class="piece__nom">' + esc(B.nom(p)) + '</span><br><span class="piece__prix">' + B.prix(p.prix) + ' / ' + esc(t(unite)) + '</span></span>' +
        '<input type="number" min="0" max="5000" step="' + (unite === 'tr.piece' ? 10 : 5) + '" value="' + (dv.pieces[id] || 0) + '" data-piece="' + id + '" aria-label="' + esc(t('tr.quantite_de', { n: B.nom(p) })) + '"></label>';
    };
    $('#dvPlateaux').innerHTML = '<div><h4>' + esc(t('tr.plateaux')) + '</h4><div class="pieces">' + T.pieces.map((id) => ligne(id, 'tr.piece')).join('') + '</div></div>' +
      '<div><h4>' + esc(t('tr.volumes')) + '</h4><div class="pieces">' + T.volumes.map((id) => ligne(id, 'tr.portion')).join('') + '</div></div>';
    $('#dvOptions').innerHTML = T.options.map((o) => {
      const detail = o.mode === 'pers' ? B.prix(o.prix) + ' ' + t('tr.par_pers') : o.mode === 'serveur' ? t('tr.serveur_detail', { p: B.prix(o.prix), r: o.ratio }) : B.prix(o.prix) + ' · ' + t('tr.forfait');
      return '<label class="option"><input type="checkbox" value="' + o.id + '" data-option' + (dv.options.includes(o.id) ? ' checked' : '') + '><span>' + esc(B.nom(o)) + '</span><span class="plus">' + esc(detail) + '</span></label>';
    }).join('');
    $('#dvNom').value = dv.nom; $('#dvTel').value = dv.tel; $('#dvLieu').value = dv.lieu; $('#dvRemarques').value = dv.remarques;
    $('#dvHeure').value = dv.heure;
    $('#dvInvites').value = dv.invites; $('#dvInvitesRange').value = dv.invites;
    $$('input[name="dvMode"]').forEach((r) => { r.checked = r.value === dv.mode; });
  }

  function rendreCalendrier() {
    const min = dateMin();
    if (!calMois) { const d = new Date(min + 'T12:00:00'); calMois = new Date(d.getFullYear(), d.getMonth(), 1); }
    const an = calMois.getFullYear(), mo = calMois.getMonth();
    const premier = new Date(an, mo, 1);
    const decal = (premier.getDay() + 6) % 7; // semaine commençant lundi
    const nbJours = new Date(an, mo + 1, 0).getDate();
    const loc = B.langue === 'ar' ? 'ar-DZ-u-nu-latn' : 'fr-FR';
    const jsem = []; for (let i = 0; i < 7; i++) jsem.push(new Date(2024, 0, 1 + i).toLocaleDateString(loc, { weekday: 'narrow' }));
    const minMois = new Date(new Date(min + 'T12:00:00').getFullYear(), new Date(min + 'T12:00:00').getMonth(), 1);
    let html = '<div class="cal__tete"><button type="button" class="cal__nav" data-cal="-1" aria-label="' + esc(t('cal.precedent')) + '"' + (calMois <= minMois ? ' disabled' : '') + '>' + (B.langue === 'ar' ? '›' : '‹') + '</button>' +
      '<strong aria-live="polite">' + esc(premier.toLocaleDateString(loc, { month: 'long', year: 'numeric' })) + '</strong>' +
      '<button type="button" class="cal__nav" data-cal="1" aria-label="' + esc(t('cal.suivant')) + '">' + (B.langue === 'ar' ? '‹' : '›') + '</button></div><div class="cal__grille">' +
      jsem.map((j) => '<span class="cal__jsem" aria-hidden="true">' + esc(j) + '</span>').join('');
    for (let i = 0; i < decal; i++) html += '<span></span>';
    for (let j = 1; j <= nbJours; j++) {
      const iso = an + '-' + B.pad(mo + 1) + '-' + B.pad(j);
      const avant = iso < min;
      const etat = avant ? '' : B.etatDate(iso, T);
      const off = avant || etat === 'bloquee' || etat === 'complet';
      const lib = B.dateLongue(iso) + (etat === 'demandee' ? ' — ' + t('cal.demandee') : etat === 'bloquee' || etat === 'complet' ? ' — ' + t('cal.indispo') : '');
      html += '<button type="button" class="cal__jour ' + etat + '" data-jour="' + iso + '" aria-pressed="' + (dv.date === iso) + '" aria-label="' + esc(lib) + '"' + (off ? ' disabled' : '') + '>' + j + '</button>';
    }
    html += '</div><div class="cal__legende"><span><i style="background:#B3561B"></i>' + esc(t('cal.demandee')) + '</span><span><i style="background:#D8CBB5"></i>' + esc(t('cal.indispo')) + '</span></div>';
    $('#dvCalendrier').innerHTML = html;
    const info = $('#dvDateInfo');
    if (dv.date) {
      const e = B.etatDate(dv.date, T);
      info.textContent = B.dateLongue(dv.date) + (e === 'demandee' ? ' · ' + t('cal.demandee_txt') : '');
    } else info.textContent = t('cal.choisir', { n: T.delaiMin || 3 });
  }

  function rendreRecap() {
    const r = B.calculDevis(dv, T, carte.plats);
    const evt = T.evenements.find((e) => e.id === dv.type);
    const f = T.formules.find((x) => x.id === dv.formule);
    const lignes = [
      [t('dv.evenement'), evt ? B.nom(evt) : '—'],
      [t('dv.date'), dv.date ? B.dateCourte(dv.date) + ' · ' + dv.heure : '—'],
      [t('dv.invites'), dv.invites + ' ' + t('dv.personnes')],
      [dv.mode === 'formule' ? t('dv.formule') + ' ' + (f ? B.nom(f) : '') : t('dv.plateaux_unites', { n: r.unites }), B.prix(r.base)]
    ];
    let html = lignes.map(([a, b]) => '<div><dt>' + esc(a) + '</dt><dd>' + esc(b) + '</dd></div>').join('');
    if (r.remise) html += '<div class="remise"><dt>' + esc(t('dv.remise', { p: r.pct })) + '</dt><dd>−' + B.prix(r.remise) + '</dd></div>';
    r.detail.forEach((d) => { html += '<div><dt>' + esc(B.nom(d.o)) + (d.o.mode === 'serveur' ? ' × ' + d.q : '') + '</dt><dd>' + B.prix(d.montant) + '</dd></div>'; });
    $('#dvRecap').innerHTML = html;
    $('#dvTotal').textContent = B.prix(r.total);
    $('#dvParPers').textContent = r.parPers ? t('dv.par_pers_val', { p: B.prix(r.parPers) }) : '';
    $('#dvAcompte').textContent = t('dv.acompte', { p: T.acompte, m: B.prix(r.acompte) });
    // indication de remise
    const unite = dv.mode === 'formule' ? t('dv.personnes') : t('tr.pieces_portions');
    const prochaine = (T.remises || []).slice().sort((a, b) => a.des - b.des).find((x) => r.unites < x.des);
    $('#dvRemiseInfo').textContent = r.pct ? t('dv.remise_ok', { p: r.pct }) : prochaine ? t('dv.remise_prochaine', { p: prochaine.pct, n: prochaine.des, u: unite }) : '';
  }

  function rendreTraiteur() { rendreTraiteurStatique(); rendreCalendrier(); rendreRecap(); $('#dvFormules').hidden = dv.mode !== 'formule'; $('#dvPlateaux').hidden = dv.mode !== 'plateaux'; }

  const form = $('#formDevis');
  form.addEventListener('input', (e) => {
    const el = e.target;
    if (el.id === 'dvInvitesRange' || el.id === 'dvInvites') {
      const v = Math.max(0, Math.min(500, Number(el.value) || 0));
      dv.invites = v;
      if (el.id === 'dvInvitesRange') $('#dvInvites').value = v; else $('#dvInvitesRange').value = v;
    }
    if (el.dataset.piece) dv.pieces[el.dataset.piece] = Math.max(0, Number(el.value) || 0);
    if (el.id === 'dvNom') dv.nom = el.value;
    if (el.id === 'dvTel') { dv.tel = el.value; el.removeAttribute('aria-invalid'); }
    if (el.id === 'dvLieu') dv.lieu = el.value;
    if (el.id === 'dvRemarques') dv.remarques = el.value;
    if (el.id === 'dvHeure') dv.heure = el.value;
    rendreRecap();
  });
  form.addEventListener('change', (e) => {
    const el = e.target;
    if (el.name === 'dvType') dv.type = el.value;
    if (el.name === 'dvFormule') dv.formule = el.value;
    if (el.name === 'dvMode') { dv.mode = el.value; $('#dvFormules').hidden = dv.mode !== 'formule'; $('#dvPlateaux').hidden = dv.mode !== 'plateaux'; }
    if (el.dataset.option !== undefined) dv.options = $$('[data-option]:checked').map((x) => x.value);
    if (el.id === 'dvInvites') { dv.invites = Math.max(20, Math.min(500, Number(el.value) || 20)); el.value = dv.invites; $('#dvInvitesRange').value = dv.invites; }
    rendreRecap();
  });
  form.addEventListener('click', (e) => {
    const c = e.target.closest('[data-cal]');
    if (c) { calMois = new Date(calMois.getFullYear(), calMois.getMonth() + Number(c.dataset.cal), 1); rendreCalendrier(); return; }
    const j = e.target.closest('[data-jour]');
    if (j && !j.disabled) { dv.date = j.dataset.jour; rendreCalendrier(); rendreRecap(); const b = $('[data-jour="' + dv.date + '"]'); if (b) b.focus(); }
  });
  document.addEventListener('click', (e) => {
    const ch = e.target.closest('[data-choisir]');
    if (ch) { dv.mode = 'formule'; dv.formule = ch.dataset.choisir; rendreTraiteur(); form.scrollIntoView({ behavior: 'smooth' }); }
    const ev = e.target.closest('[data-evt]');
    if (ev) { dv.type = ev.dataset.evt; rendreTraiteurStatique(); rendreRecap(); form.scrollIntoView({ behavior: 'smooth' }); }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const err = (m, champ) => { $('#dvErreur').textContent = m; if (champ) { const el = $('#' + champ); el.setAttribute('aria-invalid', 'true'); el.focus(); } };
    $$('#formDevis [aria-invalid]').forEach((x) => x.removeAttribute('aria-invalid'));
    if (!dv.date) return err(t('err.date'));
    if (dv.invites < 20 || dv.invites > 500) return err(t('err.invites'), 'dvInvites');
    const r = B.calculDevis(dv, T, carte.plats);
    if (dv.mode === 'plateaux' && !r.unites) return err(t('err.pieces'));
    if (dv.nom.trim().length < 2) return err(t('err.nom'), 'dvNom');
    if (!B.telValide(dv.tel)) return err(t('err.tel'), 'dvTel');
    if (!dv.lieu.trim()) return err(t('err.lieu'), 'dvLieu');
    $('#dvErreur').textContent = '';
    const d = {
      id: B.prochainNumero('devis'), cree: Date.now(), type: dv.type, date: dv.date, heure: dv.heure, invites: dv.invites,
      mode: dv.mode, formule: dv.mode === 'formule' ? dv.formule : '', pieces: dv.mode === 'plateaux' ? Object.fromEntries(Object.entries(dv.pieces).filter(([, q]) => q > 0)) : {},
      options: dv.options.slice(), nom: dv.nom.trim(), tel: dv.tel.trim(), lieu: dv.lieu.trim(), remarques: dv.remarques.trim(),
      statut: 'nouvelle', acompteRecu: 0, prixFinal: 0, note: '', estimation: r.total
    };
    const tous = B.lire('devis', []); tous.push(d); B.ecrire('devis', tous);
    ouvrirConfirmation(d);
  });

  function texteDevis(d) {
    const r = B.calculDevis(d, T, carte.plats);
    const evt = T.evenements.find((e) => e.id === d.type);
    const f = T.formules.find((x) => x.id === d.formule);
    let s = t('wa.devis', { n: d.id }) + '\n\n' +
      t('dv.evenement') + ' : ' + B.nom(evt) + '\n' + t('dv.date') + ' : ' + B.dateLongue(d.date) + ' · ' + d.heure + '\n' +
      t('dv.invites') + ' : ' + d.invites + '\n';
    if (d.mode === 'formule') s += t('dv.formule') + ' : ' + B.nom(f) + ' (' + B.prix(f.prix) + ' ' + t('tr.par_pers') + ')\n';
    else s += Object.entries(d.pieces).map(([id, q]) => '• ' + q + ' × ' + B.nom(plat(id))).join('\n') + '\n';
    if (d.options.length) s += t('dv.services') + ' : ' + d.options.map((id) => B.nom(T.options.find((o) => o.id === id))).join(', ') + '\n';
    s += t('dv.lieu') + ' : ' + d.lieu + '\n' + t('dv.total') + ' : ' + B.prix(r.total) + '\n' + d.nom + ' · ' + d.tel + (d.remarques ? '\n' + d.remarques : '');
    return s;
  }
  function ouvrirConfirmation(d) {
    const r = B.calculDevis(d, T, carte.plats);
    const evt = T.evenements.find((e) => e.id === d.type);
    const f = T.formules.find((x) => x.id === d.formule);
    const lignes = [
      [t('dv.evenement'), B.nom(evt)], [t('dv.date'), B.dateLongue(d.date) + ' · ' + d.heure], [t('dv.invites'), d.invites + ' ' + t('dv.personnes')],
      [t('dv.lieu'), d.lieu]
    ];
    if (d.mode === 'formule') lignes.push([t('dv.formule') + ' ' + B.nom(f), B.prix(r.base)]);
    else Object.entries(d.pieces).forEach(([id, q]) => { const p = plat(id); lignes.push([q + ' × ' + B.nom(p), B.prix(q * p.prix)]); });
    if (r.remise) lignes.push([t('dv.remise', { p: r.pct }), '−' + B.prix(r.remise)]);
    r.detail.forEach((x) => lignes.push([B.nom(x.o) + (x.o.mode === 'serveur' ? ' × ' + x.q : ''), B.prix(x.montant)]));
    const table = lignes.map(([a, b]) => '<div><dt>' + esc(a) + '</dt><dd>' + esc(b) + '</dd></div>').join('');
    $('#confDevis').innerHTML = btnFermer() +
      '<div class="conf__tete"><div class="conf__coche">' + ICO.coche + '</div><p>' + esc(t('conf.recue')) + '</p><h2 id="confTitre" class="num">' + esc(d.id) + '</h2><p>' + esc(t('conf.rappel')) + '</p></div>' +
      '<div class="modale__corps"><dl class="recap-lignes">' + table + '</dl>' +
      '<div class="recap-total"><span>' + esc(t('dv.total')) + '</span><strong>' + B.prix(r.total) + '</strong></div>' +
      '<p class="recap-pp">' + esc(t('dv.par_pers_val', { p: B.prix(r.parPers) })) + '</p>' +
      '<p class="recap-acompte">' + esc(t('dv.acompte', { p: T.acompte, m: B.prix(r.acompte) })) + '</p>' +
      '<p class="recap-mention">' + esc(t('dv.mention')) + '</p>' +
      '<div class="suivi__actions"><a class="btn btn--wa btn--grand" target="_blank" rel="noopener" href="' + B.lienWhatsApp(R.whatsapp, texteDevis(d)) + '">' + ICO.wa + esc(t('conf.whatsapp')) + '</a>' +
      '<button type="button" class="btn btn--ligne" id="btnImprimer">' + esc(t('conf.imprimer')) + '</button></div></div>';
    $('#btnImprimer').onclick = () => imprimerDevis(d, lignes, r);
    ouvrir($('#confDevis'));
  }
  function imprimerDevis(d, lignes, r) {
    let z = $('#zoneImpression');
    if (!z) { z = document.createElement('div'); z.id = 'zoneImpression'; document.body.appendChild(z); }
    z.innerHTML = '<div class="logo-imp">' + B.logoSVG() + '</div><h1>' + esc(t('imp.titre')) + ' ' + esc(d.id) + '</h1><p>Banet el Baraka · ' + esc(B.nom(R, 'adresse')) + ' · ' + esc(R.tel) + '</p>' +
      '<p>' + esc(d.nom) + ' · ' + esc(d.tel) + '</p><table>' + lignes.map(([a, b]) => '<tr><td>' + esc(a) + '</td><td>' + esc(b) + '</td></tr>').join('') +
      '<tr><td><strong>' + esc(t('dv.total')) + '</strong></td><td><strong>' + B.prix(r.total) + '</strong></td></tr></table>' +
      '<p>' + esc(t('dv.acompte', { p: T.acompte, m: B.prix(r.acompte) })) + '</p><p>' + esc(t('dv.mention')) + '</p>';
    document.body.classList.add('impression');
    const fin = () => { document.body.classList.remove('impression'); window.removeEventListener('afterprint', fin); };
    window.addEventListener('afterprint', fin);
    window.print();
    setTimeout(fin, 1000);
  }

  /* ---------------- Événements globaux ---------------- */
  $('#btnPanier').addEventListener('click', ouvrirPanier);
  $('#barrePanier').addEventListener('click', ouvrirPanier);
  $('#btnLangue').addEventListener('click', () => { B.changerLangue(B.langue === 'ar' ? 'fr' : 'ar'); rendreTout(); });
  let minuteur;
  $('#recherche').addEventListener('input', (e) => { clearTimeout(minuteur); minuteur = setTimeout(() => { recherche = e.target.value.trim(); rendreCarte(); }, 120); });
  $$('[data-filtre]').forEach((b) => b.addEventListener('click', () => {
    const f = b.dataset.filtre; if (filtres.has(f)) filtres.delete(f); else filtres.add(f);
    b.setAttribute('aria-pressed', filtres.has(f)); rendreCarte();
  }));

  function rendreTout() {
    B.appliquerTextes();
    rendreHeros(); rendreSelf(); rendreCarte(); rendreTraiteur(); rendreInfos(); majBadgePanier(); majBoutonSuivi();
    if ($('#fiche').open && ficheEtat) rendreFiche();
    if ($('#panier').open) { lireChamps(); rendrePanier(); }
    if ($('#suivi').open) rendreSuivi();
  }

  /* Synchro temps réel : le gérant / la cuisine agit dans un autre onglet */
  B.surChangement((cle) => {
    if (['carte', 'reglages', 'zones', 'traiteur'].includes(cle)) { charger(); rendreTout(); }
    if (cle === 'commandes') { majBoutonSuivi(); if ($('#suivi').open) rendreSuivi(); }
    if (cle === 'devis') { rendreCalendrier(); }
    if (cle === 'version') { location.reload(); }
  });
  setInterval(rendreHeros, 60e3);

  B.poserLogos(); B.poserFavicon();
  rendreTout();
})();
