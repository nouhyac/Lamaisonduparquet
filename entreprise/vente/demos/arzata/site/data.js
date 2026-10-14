// Données partagées entre le site client Arzata Pizza (index.html) et l'espace gérant (gestion.js).
// Démo : l'état vit dans le navigateur (localStorage) et se synchronise entre onglets
// (BroadcastChannel). La version livrée utilisera une base de données en ligne.
(function () {
  // Carte Arzata Pizza (photos de la carte, octobre 2026) · tailles Normale / Méga
  var NM = ['Normale', 'Méga'], SUPP = [['Ricotta', 100], ['Fromagère', 100], ['Stracciatella', 100]];
  function T(p) { return NM.map(function (x, i) { return [x, p[i]]; }); }
  var P = [];
  // Pizzas du moment (stories Instagram) · prix à confirmer avec la pizzeria
  [['Figue & noisettes', 'Crème, mozzarella, figues fraîches, noisettes, miel', [1590, 2990], ['veg', 'chef']],
   ['Magret & foie gras', 'Crème, mozzarella, magret de canard, foie gras, oignons confits, framboises', [2490, 3990], ['chef']]
  ].forEach(function (x, i) { P.push({ id: 'm' + i, cat: 'Du moment', nom: x[0], desc: x[1], img: 'img3d/m' + i + '.jpg', tailles: T(x[2]), extra: SUPP, tags: x[3], moitie: 'creme' }); });
  [['Marguerite', 'Sauce tomate, mozzarella, cheddar, olives', [490, 1390], ['veg']],
   ['Veggie', 'Sauce tomate, mozzarella, aubergine, courgette, poivrons rôtis, champignons frais, tomates cerises, oignons caramélisés', [690, 1690], ['veg']],
   ['Thon', 'Sauce tomate, mozzarella, thon, poivrons, oignons rouges, olives', [790, 1790], ['mer']],
   ['Orientale', 'Sauce tomate, mozzarella, merguez, poivrons, oignons, olives', [790, 1990], ['epice']],
   ['Reine', 'Sauce tomate, mozzarella, viande fumée, champignons frais, olives', [790, 1990], []],
   ['4 Fromages', 'Sauce tomate, mozzarella, boursin, cheddar, camembert, olives', [890, 1990], ['veg', 'fromage']],
   ['Chorizo', 'Sauce tomate, mozzarella, cheddar, chorizo, oignons caramélisés, poivrons, olives', [890, 2290], ['epice']],
   ['Pastrami', 'Sauce tomate, mozzarella, pastrami, tomates cerises, camembert, roquefort, poivrons, olives', [890, 2390], ['fromage']],
   ['Fermière', 'Sauce tomate, poulet, champignons, persillade, tomates cerises, herbes de Provence, olives', [890, 2490], []],
   ['Spicy', 'Sauce tomate, mozzarella, poulet mariné épicé, poivrons verts, huile pimentée, olives', [990, 2490], ['epice']],
   ['Buffalo', 'Sauce tomate, mozzarella, viande hachée assaisonnée, chorizo, cheddar, olives', [990, 2690], ['epice']],
   ['Moussaka', 'Sauce tomate, mozzarella, viande hachée marinée, aubergine, tomate, parmesan, olives', [990, 2690], []],
   ['Napolitaine', 'Sauce tomate, mozzarella, anchois, câpres, oignons caramélisés, herbes de Provence', [1090, 2690], ['mer']],
   ['Burrata', 'Sauce tomate, pesto, mozzarella, tomates cerises, burrata entière, roquette, pastrami, parmesan, crème balsamique', [1890, 3090], ['fromage', 'chef']]
  ].forEach(function (x, i) { P.push({ id: 't' + i, cat: 'Base tomate', nom: x[0], desc: x[1], img: 'img3d/t' + i + '.jpg', tailles: T(x[2]), extra: SUPP, tags: x[3], moitie: 'tomate' }); });
  [['Chèvre miel', 'Crème, mozzarella, noix, chèvre, miel, olives', [890, 2090], ['veg', 'fromage']],
   ['Boursin', 'Crème, mozzarella, jambon de dinde, boursin, oignons confits, persil, champignons, poivrons, olives', [990, 2390], []],
   ['Gruyère', 'Crème, mozzarella, poulet, gruyère, oignons rouges, tomates cerises, sauce blanche', [990, 2390], ['fromage']],
   ["L'Escoffier", 'Crème, champignons frais, jambon de dinde, camembert, poivrons', [990, 2390], []],
   ['6 Fromages', 'Crème, mozzarella, emmental, roquefort, edam, cheddar, camembert, olives', [990, 2490], ['veg', 'fromage']],
   ['Chef Pepito', 'Crème, mozzarella, poivrons rôtis, gruyère fumé, lamelles de viande, champignons, viande hachée marinée, olives', [990, 2490], ['chef']],
   ['Boisée', 'Crème, mozzarella, poulet, poivrons, champignons, persillade, sauce fromagère, olives', [990, 2490], []],
   ['Pizza Crispy', 'Crème, mozzarella, poulet croustillant, sauce fromagère, tomates cerises, olives', [1090, 2590], []],
   ['Saumon', 'Crème, mozzarella, saumon fumé, boursin, oignons confits, citron, olives, roquette', [1190, 2690], ['mer']],
   ['Océane', 'Crème, mozzarella, crevettes, saumon fumé, persillade, citron, olives', [1290, 2890], ['mer']],
   ['Bresaola', 'Crème, mozzarella, bresaola, roquette, tomates cerises, parmesan, perles de mozzarella, pesto, crème balsamique, oignons caramélisés', [1990, 3190], ['chef']],
   ['Pêcheur', 'Crème, mozzarella, calamars, crevettes, moules, pesto, citron, olives', [1990, 3190], ['mer', 'chef']]
  ].forEach(function (x, i) { P.push({ id: 'c' + i, cat: 'Base crème', nom: x[0], desc: x[1], img: 'img3d/c' + i + '.jpg', tailles: T(x[2]), extra: SUPP, tags: x[3], moitie: 'creme' }); });
  [['Poulet', 'Poulet, pommes de terre, poivrons, fromage fondant', 600, 0, []], ['Viande', 'Viande hachée, pommes de terre, poivrons, oignons, fromage fondant', 650, 1, []],
   ['Cheezy', 'Généreusement fromagé, sauce fromagère', 650, 0, ['fromage']], ['Spicy', 'Version relevée, sauce piquante', 650, 1, ['epice']],
   ['Montagnard', 'Version montagnarde, fromage fondu', 700, 1, ['fromage']], ['Hot-dog', 'Saucisses de bœuf, fromage, sauces', 700, 1, []], ['Fusion', 'Le mélange poulet et viande', 700, 0, []]
  ].forEach(function (x, i) { P.push({ id: 'z' + i, cat: 'Pizzouich', nom: 'Pizzouich ' + x[0], desc: 'Le sandwich-pizza cuit au feu de bois · ' + x[1], img: 'img3d/z' + x[3] + '.jpg', prix: x[2], tags: x[4] }); });
  P.push({ id: 'h0', cat: 'Tartines', nom: 'Tartine Hot-dog', desc: 'Pâte au feu de bois, saucisses de bœuf, champignons, poivrons, oignons, cheddar, ketchup et moutarde', img: 'img3d/h0.jpg', prix: 700, tags: [] });
  [['Rustique', 'Poulet mariné grillé, légumes grillés, maïs, œufs, laitue, tomates, vinaigrette', 790, []],
   ['César', 'Laitue romaine, poulet grillé, croûtons, parmesan, sauce César', 790, []],
   ['Gourmet Toast', 'Roquette, laitue, burrata, mozzarella, tomates cerises, pesto, roquefort, toasts', 1200, ['veg', 'fromage']],
   ['Terre et Mer', 'Roquette, laitue, pesto, moules, calamars, crevettes, pastrami, citron, concombre', 1390, ['mer']]
  ].forEach(function (x, i) { P.push({ id: 's' + i, cat: 'Salades', nom: 'Salade ' + x[0], desc: x[1], img: 'img3d/s' + i + '.jpg', prix: x[2], tags: x[3] }); });

  // ----- Stockage + synchronisation -----
  function lire(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function ecrire(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var canal = null; try { canal = new BroadcastChannel('arz'); } catch (e) {}
  var abonnes = [];
  function signaler(type) { if (canal) try { canal.postMessage(type); } catch (e) {} setTimeout(function () { notifier(type); }, 0); }
  function surChangement(fn) { abonnes.push(fn); }
  function notifier(t) { abonnes.forEach(function (f) { f(t); }); }
  if (canal) canal.onmessage = function (e) { notifier(e.data); };
  window.addEventListener('storage', function (e) { if (e.key && e.key.indexOf('arz-') === 0) notifier(e.key); });

  // Prix et disponibilités modifiés depuis le back-office
  function menu() {
    var dispo = lire('arz-dispo', {}), prix = lire('arz-prix', {}), C = lire('arz-carte', null) || P;
    return C.map(function (p) {
      var q = JSON.parse(JSON.stringify(p));
      if (prix[p.id]) { if (q.tailles) q.tailles.forEach(function (t, i) { if (prix[p.id][i] != null) t[1] = prix[p.id][i]; }); else if (prix[p.id][0] != null) q.prix = prix[p.id][0]; }
      if (q.tailles) q.prix = q.tailles[0][1];
      q.dispo = dispo[p.id] !== false;
      var pr = lire('arz-promo', null);
      if (pr && pr.actif && pr.plat === p.id && pr.remise) { q.promo = pr.remise; q.avant = q.prix; var k = 1 - pr.remise / 100; if (q.tailles) { q.tailles.forEach(function (t) { t[1] = Math.round(t[1] * k / 10) * 10; }); q.prix = q.tailles[0][1]; } else q.prix = Math.round(q.prix * k / 10) * 10; }
      return q;
    });
  }

  // Commandes d'exemple : la journée a déjà commencé quand on ouvre la démo
  function amorcer() {
    if (lire('arz-mode', 'demo') === 'prod') { if (!lire('arz-cmds', null)) { ecrire('arz-cmds', []); ecrire('arz-no', 1); } return; }
    if (lire('arz-v', 0) !== 1) { ['arz-cmds', 'arz-no', 'arz-dispo', 'arz-prix', 'arz-recep', 'arz-service', 'arz-z', 'arz-charges', 'arz-promo'].forEach(function (k) { try { localStorage.removeItem(k); } catch (e) {} }); ecrire('arz-v', 1); }
    if (lire('arz-cmds', null)) return;
    var now = Date.now(), d = new Date(); d.setHours(11, 40, 0, 0); if (d.getTime() > now - 60 * 60000) d.setDate(d.getDate() - 1);
    var base = d.getTime(), cmds = [], no = 1;
    var modes = ['place', 'emporter', 'livraison'], noms = ['Amine', 'Sara', 'Karim', 'Lina', 'Yacine', 'Nour', 'Rayan', 'Inès', 'Walid', 'Meriem'];
    var choix = [['t13', 0], ['c5', 1], ['t0', 1], ['z1', 0], ['c8', 0], ['t9', 1], ['c0', 0], ['s1', 0], ['t5', 1], ['c7', 0], ['t3', 0], ['z0', 0]];
    var M = P.map(function (p) { var q = JSON.parse(JSON.stringify(p)); if (q.tailles) q.prix = q.tailles[0][1]; return q; });
    var span = Math.max(30, Math.min(600, (now - base) / 60000 - 25));
    for (var k = 0; k < 26; k++) {
      var t = base + (span * (k / 26) + (k * 7) % 11) * 60000;
      var lignes = [], n = 1 + (k % 3);
      for (var j = 0; j < n; j++) {
        var c = choix[(k * 5 + j * 3) % choix.length], p = M.find(function (x) { return x.id === c[0]; });
        var ti = p.tailles ? Math.min(c[1], p.tailles.length - 1) : -1;
        lignes.push({ id: p.id, nom: p.nom, det: ti >= 0 ? [p.tailles[ti][0]] : [], px: ti >= 0 ? p.tailles[ti][1] : p.prix, q: 1 + ((k + j) % 4 === 0 ? 1 : 0) });
      }
      cmds.push({ no: no++, resto: 'dar', t: t, mode: modes[k % 3], table: String(1 + (k % 12)), heure: 'Dès que possible', adresse: 'Cité 1200 logements, bât. 4', zone: 'Dar El Beïda', frais: 0, nom: noms[k % noms.length], tel: '05' + (50 + k % noms.length) + ' 12 34 56', lignes: lignes, total: lignes.reduce(function (a, l) { return a + l.px * l.q; }, 0), st: 'fin', fin: t + (9 + k % 7) * 60000, paye: true, pay: ['especes', 'especes', 'cib', 'baridimob'][k % 4] });
    }
    cmds.forEach(function (c) { if (c.mode === 'livraison') { c.livreur = ['sofiane', 'bilal', 'hamza'][Math.floor(c.no / 3) % 3]; c.livree = c.fin + (12 + c.no % 10) * 60000; } });
    function cmd(st, mode, il, lignes, nom, resto) { var l = lignes.map(function (x) { var p = M.find(function (y) { return y.id === x[0]; }); var ti = p.tailles ? x[1] : -1; return { id: p.id, nom: p.nom, det: (ti >= 0 ? [p.tailles[ti][0]] : []).concat(x[2] ? [x[2]] : []), px: (ti >= 0 ? p.tailles[ti][1] : p.prix) + (x[2] ? 100 : 0), q: x[3] || 1 }; }); cmds.push({ no: no++, resto: resto, t: now - il * 60000, mode: mode, table: '3', heure: 'Dans 15 min', adresse: 'Cité 1200 logements, bât. 4, 2e étage', zone: 'Dar El Beïda', frais: mode === 'livraison' ? 150 : 0, nom: nom, tel: '0661 22 33 44', lignes: l, total: l.reduce(function (a, x) { return a + x.px * x.q; }, 0) + (mode === 'livraison' ? 150 : 0), st: st, four: st === 'prep' ? now - 50000 : null }); }
    cmd('prete', 'place', 11, [['t13', 0], ['c8', 0]], 'Sara', 'dar');
    cmd('prep', 'emporter', 4, [['c5', 1, 'Stracciatella'], ['s1', 0]], 'Amine', 'dar');
    cmd('nouv', 'livraison', 1, [['t0', 1, false, 2], ['z1', 0]], 'Karim', 'dar');
    ecrire('arz-cmds', cmds); ecrire('arz-no', no);
  }

  // Les deux restaurants (bio Instagram)
  // Configuration de l'établissement, modifiable par le gérant (Réglages › Établissement)
  var CONF0 = {
    nom: 'Arzata Pizza', slogan: 'Goût authentique · Feu de bois', insta: 'arzatapizza',
    restos: [{ id: 'dar', nom: 'Dar El Beïda', ouv: 11, ferm: 23, tel: '0772 08 73 87', tel2: '0551 11 75 78', adresse: 'Dar El Beïda, en face de la banque BNP' }],
    cats: ['Du moment', 'Base tomate', 'Base crème', 'Pizzouich', 'Tartines', 'Salades'],
    // Zones de livraison et frais (modifiables par le gérant)
    zones: [['Dar El Beïda', 150], ['El Hamiz', 200], ['Bab Ezzouar', 250], ['Mohammadia', 300], ['Bordj El Kiffan', 300], ['Rouiba', 350]], offerte: 4000,
    pins: { gerant: '0328', cuisine: '1111', caisse: '2222' }
  };
  function config() { var c = lire('arz-config', null) || {}, o = JSON.parse(JSON.stringify(CONF0)); for (var k in c) if (c[k] != null) o[k] = c[k]; for (var q in CONF0.pins) if (!o.pins[q]) o.pins[q] = CONF0.pins[q]; return o; }
  function heure(n) { n = n % 24; return (n < 10 ? '0' : '') + n + 'h'; }
  var RESTOS = [], CATS = [];
  function appliquerConfig() {
    var c = config(); RESTOS.length = 0; CATS.length = 0;
    c.restos.forEach(function (r) { RESTOS.push({ id: r.id, nom: r.nom, ouv: +r.ouv, ferm: +r.ferm, tel: r.tel, tel2: r.tel2 || '', adresse: r.adresse || r.nom, h: heure(+r.ouv).replace(/^0/, '') + ' – ' + heure(+r.ferm), maps: 'https://www.google.com/maps/search/' + encodeURIComponent(c.nom + ' ' + (r.adresse || r.nom)) }); });
    c.cats.forEach(function (x) { CATS.push(x); });
  }
  appliquerConfig();
  abonnes.push(function (t) { if (t === 'arz-config') appliquerConfig(); });
  function ouvert(r, d) { d = d || new Date(); var h = d.getHours() + d.getMinutes() / 60; return (h >= r.ouv && h < Math.min(24, r.ferm)) || (r.ferm > 24 && h < r.ferm - 24); }
  function resto(id) { return RESTOS.find(function (r) { return r.id === id; }) || RESTOS[0]; }
  // Réception des commandes : le restaurant choisit ses canaux (back-office › Réception)
  var RECEP0 = { ecran: true, bons: true, copies: 2, format: '80', whatsapp: true, sms: false, email: false, emailAdr: 'commandes@arzatapizza.dz', caisse: 'csv', webhook: '', acceptation: 'manuelle', clientWa: true };
  function reception() { var r = lire('arz-recep', {}); var o = {}; for (var k in RECEP0) o[k] = r[k] === undefined ? RECEP0[k] : r[k]; return o; }
  function texteBon(c) {
    var r = resto(c.resto), m = c.mode === 'place' ? 'Sur place · table ' + c.table : c.mode === 'emporter' ? 'À emporter · ' + c.heure : 'Livraison · ' + (c.zone ? c.zone + ', ' : '') + c.adresse + (c.heure && c.heure !== 'Dès que possible' ? ' · ' + c.heure : '');
    return '🍕 *' + config().nom.toUpperCase() + ' · ' + r.nom.toUpperCase() + '*\nCommande *' + '#' + String(c.no).padStart(3, '0') + '* · ' + m + '\n\n' +
      c.lignes.map(function (l) { return l.q + '× ' + l.nom + (l.det.length ? ' (' + l.det.join(', ') + ')' : '') + ' · ' + (l.px * l.q) + ' DA'; }).join('\n') +
      (c.frais ? '\nLivraison · ' + c.frais + ' DA' : '') + '\n\n*Total : ' + c.total + ' DA* · ' + (c.mode === 'livraison' ? 'paiement à la livraison' : 'paiement au comptoir') + '\nClient : ' + c.nom + ' · ' + c.tel;
  }
  function lienWa(tel, txt) { var n = String(tel).replace(/\D/g, '').replace(/^0/, '213'); return 'https://wa.me/' + n + '?text=' + encodeURIComponent(txt); }
  // Service en cours, réglé depuis la cuisine : commandes en ligne ouvertes ou en pause, temps d'attente annoncé
  function service() { var s = lire('arz-service', {}); var o = {}; RESTOS.forEach(function (r) { var x = s[r.id] || {}; o[r.id] = { pause: !!x.pause, attente: x.attente || 20 }; }); return o; }
  window.IMS = {
    service: service, majService: function (o) { ecrire('arz-service', o); signaler('arz-service'); },
    reception: reception, majReception: function (o) { ecrire('arz-recep', o); signaler('arz-recep'); signaler('arz-service'); }, texteBon: texteBon, lienWa: lienWa,
    RESTOS: RESTOS, resto: resto, ouvert: ouvert,
    CATS: CATS, config: config,
    majConfig: function (o) { ecrire('arz-config', o); appliquerConfig(); signaler('arz-config'); signaler('arz-menu'); },
    catalogue: function () { return JSON.parse(JSON.stringify(lire('arz-carte', null) || P)); },
    majCatalogue: function (L) { ecrire('arz-carte', L); signaler('arz-menu'); },
    mode: function () { return lire('arz-mode', 'demo'); },
    // Remise au client : on vide les commandes, les clients et les statistiques ; le menu et les réglages restent
    miseEnService: function () { ecrire('arz-mode', 'prod'); ecrire('arz-cmds', []); ecrire('arz-no', 1); ['arz-z', 'arz-service', 'arz-promo'].forEach(function (k) { try { localStorage.removeItem(k); } catch (e) {} }); signaler('arz-cmds'); signaler('arz-menu'); signaler('arz-service'); },
    modeDemo: function () { ecrire('arz-mode', 'demo'); ['arz-cmds', 'arz-no'].forEach(function (k) { try { localStorage.removeItem(k); } catch (e) {} }); amorcer(); signaler('arz-cmds'); },
    sauvegarde: function () { var o = {}; ['arz-config', 'arz-carte', 'arz-dispo', 'arz-prix', 'arz-recep', 'arz-charges', 'arz-promo'].forEach(function (k) { var v = lire(k, null); if (v !== null) o[k] = v; }); return JSON.stringify({ app: 'dzign-pizza', v: 1, date: new Date().toISOString(), data: o }); },
    restaurer: function (txt) { var j = JSON.parse(txt); if (!j || j.app !== 'dzign-pizza') throw new Error('format'); for (var k in j.data) ecrire(k, j.data[k]); appliquerConfig(); ['arz-config', 'arz-menu', 'arz-recep'].forEach(signaler); },
    menu: menu, lire: lire, ecrire: ecrire, amorcer: amorcer,
    commandes: function () { return lire('arz-cmds', []); },
    enregistrer: function (cmds) { ecrire('arz-cmds', cmds); signaler('arz-cmds'); },
    nouvelleCommande: function (c) { var n = lire('arz-no', 1); c.no = n; if (reception().acceptation === 'auto' && c.st === 'nouv') { c.st = 'prep'; c.four = Date.now(); c.auto = true; } ecrire('arz-no', n + 1); var L = lire('arz-cmds', []); L.push(c); ecrire('arz-cmds', L); signaler('arz-cmds'); return c; },
    promo: function () { return lire('arz-promo', { actif: false, texte: '', plat: 't13', remise: 15, banniere: false }); },
    majPromo: function (o) { ecrire('arz-promo', o); signaler('arz-menu'); },
    majMenu: function (dispo, prix) { ecrire('arz-dispo', dispo); ecrire('arz-prix', prix); signaler('arz-menu'); },
    surChangement: surChangement,
    reinitialiser: function () { ['arz-cmds', 'arz-no', 'arz-dispo', 'arz-prix', 'arz-recep', 'arz-service', 'arz-z', 'arz-charges', 'arz-promo', 'arz-config', 'arz-carte', 'arz-mode'].forEach(function (k) { try { localStorage.removeItem(k); } catch (e) {} }); appliquerConfig(); amorcer(); signaler('arz-config'); signaler('arz-cmds'); signaler('arz-menu'); signaler('arz-recep'); signaler('arz-service'); },
    fmt: function (n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' DA'; },
    numero: function (n) { return '#' + String(n).padStart(3, '0'); }
  };
  amorcer();
})();
