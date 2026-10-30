/* =====================================================================
   Wood Pecker Draria · données d'exemple (« journée commencée »)
   ---------------------------------------------------------------------
   Une vingtaine de commandes réalistes avec LEURS plats, quelques
   réservations, une demande d'anniversaire et une livraison en cours.
   Regénérées chaque nouveau jour tant que l'établissement n'est pas
   « mis en service » (clé wpk-production).
   ===================================================================== */
(function () {
  'use strict';

  /* Commandes types : [prénom, téléphone, mode, zone, lignes, statut]
     ligne = [idPlat, qté, options] ; options : {taille, supps, choix, sauce, olives} */
  const MODELES = [
    ['Yacine', '0661 23 45 18', 'livraison', 'Draria', [['pz19', 1, { taille: 'mega', supps: ['su09'] }], ['bo1', 1]], 'livree'],
    ['Amina', '0555 41 22 90', 'emporter', '', [['pz08', 2, { taille: 'simple' }], ['bo3', 2]], 'livree'],
    ['Karim', '0770 88 12 03', 'surplace', '', [['vi4', 2, { sauce: 'Poivre' }], ['of3', 1], ['bo5', 1]], 'livree'],
    ['Meriem', '0698 10 57 44', 'livraison', 'Baba Hassen', [['pa1', 2], ['of7', 1], ['de03', 2]], 'livree'],
    ['Sofiane', '0550 32 76 61', 'emporter', '', [['me3', 2, { choix: 'Poulet' }], ['me4', 1]], 'livree'],
    ['Lina', '0779 64 03 25', 'livraison', 'Saoula', [['en3', 2, { choix: 'Fromage' }], ['en1', 1, { choix: 'Frites' }], ['ms1', 3]], 'livree'],
    ['Walid', '0662 45 98 70', 'surplace', '', [['pz11', 1, { taille: 'semi', choix: 'Sauce blanche' }], ['ju1', 2]], 'livree'],
    ['Nesrine', '0556 71 34 82', 'livraison', 'Draria', [['vo6', 1], ['pa5', 1], ['bo2', 1]], 'livree'],
    ['Mehdi', '0771 20 66 19', 'emporter', '', [['pz05', 1, { taille: 'mega', supps: ['su02', 'su15'], olives: true }]], 'livree'],
    ['Imane', '0697 58 11 36', 'surplace', '', [['vo5', 1], ['oc3', 1], ['de02', 1], ['bc2', 1]], 'livree'],
    ['Riad', '0552 09 87 43', 'livraison', 'Douera', [['pz20', 1, { taille: 'mega' }], ['pz01', 1, { taille: 'simple' }], ['bo1', 2]], 'livree'],
    ['Khadidja', '0663 74 52 08', 'emporter', '', [['me2', 3], ['bo3', 1]], 'livree'],
    ['Nassim', '0773 15 40 92', 'surplace', '', [['vi3', 1, { sauce: 'Forestière' }], ['vo4', 1], ['of2', 1]], 'livree'],
    ['Feriel', '0551 63 28 75', 'livraison', 'El Achour', [['pa3', 2, { choix: 'Tagliatelle' }], ['co4', 1]], 'livree'],
    ['Anis', '0699 82 07 31', 'emporter', '', [['oc5', 4, { choix: 'Viande hachée' }], ['oc4', 2]], 'prete'],
    ['Sarah', '0664 36 91 50', 'livraison', 'Draria', [['pz12', 1, { taille: 'mega', supps: ['su03'] }], ['de10', 2], ['bo1', 1]], 'livraison'],
    ['Hocine', '0774 51 23 67', 'surplace', '', [['vi5', 1, { sauce: 'Roquefort' }], ['of4', 1], ['bc1', 1]], 'preparation'],
    ['Bilal', '0557 28 64 13', 'livraison', 'Ouled Fayet', [['pz07', 1, { taille: 'semi' }], ['pz09', 1, { taille: 'semi' }], ['bo1', 1]], 'preparation'],
    ['Rania', '0665 90 14 82', 'emporter', '', [['en2', 2, { choix: 'Purée' }], ['ms5', 2]], 'recue'],
    ['Samir', '0775 47 36 20', 'livraison', 'Dely Ibrahim', [['pz16', 1, { taille: 'mega', supps: ['su08'] }], ['co3', 1]], 'recue']
  ];

  /* Construit une ligne de commande depuis la carte */
  function ligne(c, id, qte, o) {
    o = o || {};
    const plat = c.plats.find(p => p.id === id);
    const L = { id, nom: plat.fr, ar: plat.ar, pre: plat.pre || '', cat: plat.cat, qte };
    if (plat.tailles) L.taille = o.taille || 'simple';
    if (o.choix && plat.choix) { L.choix = o.choix; const op = plat.choix.opts.find(x => x[0] === o.choix); L.choixAr = op ? op[1] : ''; }
    if (o.sauce) { L.sauce = o.sauce; const s = c.sauces.find(x => x.fr === o.sauce); L.sauceAr = s ? s.ar : ''; }
    if (o.supps) L.supps = o.supps.map(sid => { const s = c.supplements.find(x => x.id === sid); return { id: sid, fr: s.fr, ar: s.ar }; });
    if (o.olives) L.olives = true;
    L.pu = WPK.prixLigne(plat, { taille: L.taille, supps: o.supps, sauce: o.sauce }, c);
    L.total = L.pu * qte;
    return L;
  }

  function generer() {
    const c = WPK.carte();
    const R = WPK.reglages();
    const now = Date.now();
    // Les commandes s'étalent sur les heures de service écoulées (au moins 6 h d'historique)
    const ouverture = new Date(); ouverture.setHours(new Date().getDay() === 5 ? 16 : 11, 0, 0, 0);
    let debut = ouverture.getTime();
    if (now - debut < 3 * 3600e3) debut = now - 6 * 3600e3;
    const pas = (now - 25 * 60e3 - debut) / MODELES.length;

    const ordres = MODELES.map((m, i) => {
      const [prenom, tel, mode, zoneNom, lignes, statut] = m;
      const cree = Math.round(debut + pas * i + (i % 3) * 4 * 60e3);
      const L = lignes.map(([id, q, o]) => ligne(c, id, q, o));
      const sousTotal = L.reduce((s, l) => s + l.total, 0);
      const zone = R.zones.find(z => z.nom === zoneNom);
      const frais = mode === 'livraison' && zone ? zone.frais : 0;
      const etapes = ['recue', 'preparation', 'prete', 'livraison', 'livree'];
      const hist = {}; let t = cree;
      for (const e of etapes) {
        if (mode !== 'livraison' && e === 'livraison') continue;
        hist[e] = t; t += (e === 'recue' ? 3 : e === 'preparation' ? 18 : 12) * 60e3;
        if (e === statut) break;
      }
      const n = 1001 + i;
      return {
        id: 'WP-' + n, n, cree, source: 'site', mode,
        client: { nom: prenom, tel },
        adresse: mode === 'livraison' ? { zone: zoneNom, cite: ['Cité 200 Logements', 'Cité 150 Logements', 'Lotissement 84', 'Cité 500 Logements'][i % 4], batiment: 'Bât. ' + (i % 9 + 1), etage: String(i % 5), repere: '' } : null,
        programme: '', remarque: i === 4 ? 'Sans oignon svp' : '',
        lignes: L, sousTotal, frais, total: sousTotal + frais,
        paiement: mode === 'livraison' ? 'livraison' : 'comptoir',
        statut, hist, accepte: statut !== 'recue' || i === 18,
        livreur: mode === 'livraison' && (statut === 'livraison' || statut === 'livree') ? R.livreurs[i % R.livreurs.length] : '',
        encaisse: statut === 'livree'
      };
    });
    WPK.ecrire('commandes', ordres, true);
    WPK.ecrire('compteurs', { cmd: 1000 + MODELES.length, res: 104, ann: 11 }, true);

    // Réservations : aujourd'hui et demain
    const auj = WPK.isoJour(now);
    const dem = WPK.isoJour(now + 86400e3);
    WPK.ecrire('reservations', [
      { id: 'RES-0101', jour: auj, heure: '20:00', personnes: 6, bebe: 1, occasion: 'famille', nom: 'Famille Benali', tel: '0661 72 18 40', remarque: '', statut: 'confirmee', cree: now - 5 * 3600e3, precommande: [] },
      { id: 'RES-0102', jour: auj, heure: '21:00', personnes: 4, bebe: 0, occasion: 'anniversaire', nom: 'Yasmine', tel: '0554 39 20 71', remarque: 'Table au calme si possible', statut: 'attente', cree: now - 2 * 3600e3, precommande: [] },
      { id: 'RES-0103', jour: auj, heure: '13:00', personnes: 2, bebe: 0, occasion: '', nom: 'Omar', tel: '0776 05 63 28', remarque: '', statut: 'confirmee', cree: now - 26 * 3600e3, precommande: [] },
      { id: 'RES-0104', jour: dem, heure: '20:30', personnes: 8, bebe: 2, occasion: 'famille', nom: 'Famille Hamidi', tel: '0698 44 17 52', remarque: '', statut: 'attente', cree: now - 3600e3, precommande: [] }
    ], true);

    // Demande d'anniversaire (estimation basée sur leurs prix)
    const d2 = WPK.isoJour(now + 5 * 86400e3);
    WPK.ecrire('demandes', [
      { id: 'ANN-011', jour: d2, heure: '15:00', enfants: 10, adultes: 4, menu: 'en3', dessert: 'de01', nom: 'Souad', tel: '0662 18 95 30', remarque: 'Anniversaire de Ilyes, 7 ans', estimation: 10 * 1000 + 10 * 400, statut: 'attente', cree: now - 4 * 3600e3 }
    ], true);

    WPK.ecrire('zs', [], true);
    WPK.ecrire('demo-jour', auj, true);
  }

  window.WPK_SEED = {
    generer,
    peutEtreGenerer() {
      if (WPK.lire('demo-jour', '') !== WPK.isoJour(Date.now())) generer();
    }
  };
})();
