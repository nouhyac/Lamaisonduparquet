// Données partagées entre le site client Arzata Pizza (index.html) et l'espace gérant (gestion.js).
// Démo : l'état vit dans le navigateur (localStorage) et se synchronise entre onglets
// (BroadcastChannel). La version livrée utilisera une base de données en ligne.
(function () {
  // Carte Arzata Pizza, recopiée mot pour mot de leur menu (avril 2026) · tailles Normale / Méga
  var NM = ['Normale', 'Méga'], SUPP = [['Ricotta', 100], ['Fromagère', 100], ['Stracciatella', 100]];
  function T(p) { return NM.map(function (x, i) { return [x, p[i]]; }); }
  var P = [];
  // Pizzas du moment (stories Instagram) · prix à confirmer avec la pizzeria
  [['Figue & noisettes', 'Crème, mozzarella, figues fraîches, noisettes, miel', [1590, 2990], ['veg', 'chef']],
   ['Magret & foie gras', 'Crème, mozzarella, magret de canard, foie gras, oignons confits, framboises', [2490, 3990], ['chef']]
  ].forEach(function (x, i) { P.push({ id: 'm' + i, cat: 'Du moment', nom: x[0], desc: x[1], img: 'img3d/m' + i + '.jpg', tailles: T(x[2]), extra: SUPP, tags: x[3], moitie: 'creme' }); });
  [['Marguerite', 'Sauce tomate, mozza, cheddar, olives', [490, 1390], ['veg']],
   ['Veggie', 'Sauce tomate, mozza, aubergines, courgettes, poivrons au four, champignons frais, tomate cerise, oignons caramélisés', [690, 1690], ['veg']],
   ['Thon', 'Sauce tomate, mozza, thon, poivrons, oignons, olives', [790, 1790], ['mer']],
   ['Orientale', 'Sauce tomate, mozza, merguez, poivrons, oignons, olives', [790, 1990], ['epice']],
   ['Reine', 'Sauce tomate, mozza, lardons, champignons frais, olives', [790, 1990], []],
   ['4 Fromages', 'Sauce tomate, mozza, boursin, cheddar, camembert, olives', [890, 1990], ['veg', 'fromage']],
   ['Chorizo', 'Sauce tomate, mozza, cheddar, chorizo, oignons caramélisés, poivrons, olives', [890, 2290], ['epice']],
   ['Pastrami', 'Sauce tomate, mozza, bœuf pastrami, tomate cerise, camembert, roquefort, poivrons, olives', [890, 2390], ['fromage']],
   ['Fermière', 'Sauce tomate, poulet, champignons frais, persillade, tomate cerise, herbes de Provence, olives', [890, 2490], []],
   ['Spicy', 'Sauce tomate, mozza, poulet épicé, poivrons, huile piquante, olives', [990, 2490], ['epice']],
   ['Buffalo', 'Sauce tomate, mozza, viande hachée, chorizo, cheddar, olives', [990, 2690], ['epice']],
   ['Moussaka', 'Sauce tomate, mozza, viande hachée marinée, aubergines au four, tomate, parmesan, olives', [990, 2690], []],
   ['Napolitaine', 'Sauce tomate, mozza, anchois à l\'huile d\'olive, câpres, oignons caramélisés, herbes de Provence', [1090, 2690], ['mer']],
   ['Burrata', 'Sauce tomate, pesto, mozza, tomate cerise, huile de basilic, boule de burrata, roquette, pastrami, parmesan, gouda fumé, vinaigre balsamique', [1890, 3090], ['fromage', 'chef']]
  ].forEach(function (x, i) { P.push({ id: 't' + i, cat: 'Base tomate', nom: x[0], desc: x[1], img: 'img3d/t' + i + '.jpg', tailles: T(x[2]), extra: SUPP, tags: x[3], moitie: 'tomate' }); });
  [['Chèvre miel', 'Crème fraîche, mozza, noix, emmental, cheddar, chèvre, miel, olives', [890, 2090], ['veg', 'fromage']],
   ['Boursin', 'Crème fraîche, mozza, jambon, lardons, boursin, oignons confits, persillade, champignons frais, poivrons cuits, olives', [990, 2390], []],
   ['Gruyère', 'Crème fraîche, mozza, poulet, tranches de gruyère, oignons, olives', [990, 2390], ['fromage']],
   ["L'Escoffier", 'Crème fraîche, champignons frais, jambon, camembert, poivrons colorés', [990, 2390], []],
   ['6 Fromages', 'Crème fraîche, mozza, emmental, roquefort, fromage rouge, cheddar, édam, camembert, olives', [990, 2490], ['veg', 'fromage']],
   ['Chef Pepito', 'Crème fraîche, mozza, poivrons au four, gruyère fumé, lardons, champignons frais, viande hachée marinée, olives', [990, 2490], ['chef']],
   ['Boisée', 'Crème fraîche, mozza, poulet, poivrons colorés, champignons frais, persillade, sauce fromagère maison, olives', [990, 2490], []],
   ['Pizza Crispy', 'Crème fraîche, mozza, poulet crispy, sauce fromagère, tomate cerise, olives', [1090, 2590], []],
   ['Saumon', 'Crème fraîche, mozza, saumon fumé, boursin, oignons confits, citron, olives', [1190, 2690], ['mer']],
   ['Océane', 'Crème fraîche, mozza, crevettes, saumon fumé, persillade, citron, olives', [1290, 2890], ['mer']],
   ['Bresaola', 'Crème fraîche, mozza, cornichons, oignons caramélisés, roquette, bresaola artisanale, parmesan, tomate cerise, sauce pesto, crème de vinaigre balsamique, billes de mozzarella', [1990, 3190], ['chef']],
   ['Pêcheur', 'Crème fraîche, mozza, calamar frais, crevettes, moules, sauce pesto, citron, olives', [1990, 3190], ['mer', 'chef']]
  ].forEach(function (x, i) { P.push({ id: 'c' + i, cat: 'Base crème', nom: x[0], desc: x[1], img: 'img3d/c' + i + '.jpg', tailles: T(x[2]), extra: SUPP, tags: x[3], moitie: 'creme' }); });
  [['Poulet', 'Sauce fromagère, poulet, patates, oignons, poivrons, fromage', 600, 0, []], ['Viande', 'Sauce fromagère, viande hachée, patates, poivrons, oignons', 650, 1, []],
   ['Cheezy', 'Camembert, boursin, cheddar, mozza, patates, emmental, champignons frais', 650, 0, ['fromage']], ['Spicy', 'Sauce fromagère, poulet épicé, patates sautées au four, poivrons, oignons', 650, 1, ['epice']],
   ['Montagnard', 'Camembert, lardons, jambon, cheddar, mozza, champignons, sauce fromagère', 700, 1, ['fromage']], ['Hot-dog', 'Hot-dog artisanal, poivrons, oignons, champignons, cheddar, sauce ketchup', 700, 1, []], ['Fusion', 'Mozza, sauce fromagère, merguez, patates, poulet grillé, pastrami, champignons, persillade', 700, 0, []]
  ].forEach(function (x, i) { P.push({ id: 'z' + i, cat: 'Pizzouich', nom: 'Pizzouich ' + x[0], desc: x[1], img: 'img3d/z' + x[3] + '.jpg', prix: x[2], tags: x[4] }); });
  P.push({ id: 'h0', cat: 'Tartines', nom: 'Tartine Hot-dog', desc: 'Sauce tomate, hot-dog, champignons, poivrons colorés, oignons, cheddar, sauce ketchup, moutarde', img: 'img3d/h0.jpg', prix: 700, tags: [] });
  [['Rustique', 'Poulet mariné, légumes grillés, maïs, œuf, salade fraîche, lamelles de tomate, vinaigrette maison onctueuse', 790, []],
   ['César', 'Laitue fraîche, lamelles de poulet grillé, croûtons dorés, copeaux de parmesan, sauce César onctueuse', 790, []],
   ['Gourmet Toast', 'Roquette, laitue, burrata, pousse de mozzarella, tomates cerises, pesto, roquefort, tartine', 1200, ['veg', 'fromage']],
   ['Terre et Mer', 'Roquette, laitue, pesto, moules, calamar, pastrami, crevettes, citron, concombre', 1390, ['mer']]
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
    if (lire('arz-v', 0) !== 2) { ['arz-cmds', 'arz-no', 'arz-dispo', 'arz-prix', 'arz-recep', 'arz-service', 'arz-z', 'arz-charges', 'arz-promo', 'arz-config'].forEach(function (k) { try { localStorage.removeItem(k); } catch (e) {} }); ecrire('arz-v', 2); }
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
      cmds.push({ no: no++, resto: 'dar', t: t, mode: modes[k % 3], table: String(1 + (k % 12)), heure: 'Dès que possible', adresse: 'Cité 1200 logements, bât. 4', zone: CONF0.zones[k % 6][0], frais: CONF0.zones[k % 6][1], eta: CONF0.zones[k % 6][2], dest: [CONF0.zones[k % 6][4], CONF0.zones[k % 6][5]], adr: { cite: 'Cité 1200 logements', bat: '4', etage: '2', repere: 'À côté de la pharmacie' }, nom: noms[k % noms.length], tel: '05' + (50 + k % noms.length) + ' 12 34 56', lignes: lignes, total: lignes.reduce(function (a, l) { return a + l.px * l.q; }, 0), st: 'fin', fin: t + (9 + k % 7) * 60000, paye: true, pay: ['especes', 'especes', 'cib', 'baridimob'][k % 4] });
    }
    cmds.forEach(function (c) { if (c.mode === 'livraison') { c.livreur = ['sofiane', 'bilal', 'hamza'][Math.floor(c.no / 3) % 3]; c.livree = c.fin + (c.eta || 20) * 60000 * (0.85 + (c.no % 5) / 20); c.total += c.frais || 0; } else { c.zone = ''; c.frais = 0; delete c.dest; delete c.adr; } });
    function cmd(st, mode, il, lignes, nom, resto) { var l = lignes.map(function (x) { var p = M.find(function (y) { return y.id === x[0]; }); var ti = p.tailles ? x[1] : -1; return { id: p.id, nom: p.nom, det: (ti >= 0 ? [p.tailles[ti][0]] : []).concat(x[2] ? [x[2]] : []), px: (ti >= 0 ? p.tailles[ti][1] : p.prix) + (x[2] ? 100 : 0), q: x[3] || 1 }; }); cmds.push({ no: no++, resto: resto, t: now - il * 60000, mode: mode, table: '3', heure: 'Dans 15 min', adresse: 'Cité 1200 logements, bât. 4, 2e étage', zone: 'Dar El Beïda', frais: mode === 'livraison' ? 150 : 0, eta: 10, dest: [36.7165, 3.2085], adr: { cite: 'Cité 1200 logements', bat: '4', etage: '2e', repere: 'En face de la boulangerie' }, nom: nom, tel: '0661 22 33 44', lignes: l, total: l.reduce(function (a, x) { return a + x.px * x.q; }, 0) + (mode === 'livraison' ? 150 : 0), st: st, four: st === 'prep' ? now - 50000 : null }); }
    cmd('prete', 'place', 11, [['t13', 0], ['c8', 0]], 'Sara', 'dar');
    cmd('prep', 'emporter', 4, [['c5', 1, 'Stracciatella'], ['s1', 0]], 'Amine', 'dar');
    cmd('nouv', 'livraison', 1, [['t0', 1, false, 2], ['z1', 0]], 'Karim', 'dar');
    // Une livraison déjà en route vers Bordj El Kiffan, pour voir le suivi sur la carte
    var lr = M.filter(function (y) { return y.id === 'm1' || y.id === 's1'; }), now2 = Date.now();
    cmds.push({ no: no++, resto: 'dar', t: now2 - 24 * 60000, mode: 'livraison', table: '', heure: 'Dès que possible', adresse: 'Cité Ben Zerga, bât. B3, 4e étage', zone: 'Bordj El Kiffan', frais: 300, eta: 20, dest: [36.7445, 3.1905], adr: { cite: 'Cité Ben Zerga', bat: 'B3', etage: '4e', repere: 'Derrière la mosquée', note: 'Sonner deux fois' }, nom: 'Lina', tel: '0770 45 12 98', lignes: lr.map(function (p) { var ti = p.tailles ? 0 : -1; return { id: p.id, nom: p.nom, det: ti >= 0 ? [p.tailles[0][0]] : [], px: ti >= 0 ? p.tailles[0][1] : p.prix, q: 1 }; }), st: 'fin', four: now2 - 19 * 60000, fin: now2 - 8 * 60000, livreur: 'bilal' });
    cmds[cmds.length - 1].total = cmds[cmds.length - 1].lignes.reduce(function (a, x) { return a + x.px; }, 0) + 300;
    ecrire('arz-cmds', cmds); ecrire('arz-no', no);
  }

  // Les deux restaurants (bio Instagram)
  // Configuration de l'établissement, modifiable par le gérant (Réglages › Établissement)
  var CONF0 = {
    nom: 'Arzata Pizza', slogan: 'Le goût de vous faire plaisir', insta: 'arzatapizza',
    restos: [{ id: 'dar', nom: 'Dar El Beïda', ouv: 11, ferm: 23, tel: '0772 08 73 87', tel2: '0551 11 75 78', adresse: 'Dar El Beïda, en face de la banque BNP' }],
    cats: ['Du moment', 'Base tomate', 'Base crème', 'Pizzouich', 'Tartines', 'Salades'],
    // Zones de livraison et frais (modifiables par le gérant)
    // [commune, frais DA, trajet en min, minimum de commande DA, latitude, longitude] : calculés selon la distance depuis la pizzeria
    zones: [['Dar El Beïda', 150, 10, 0, 36.714, 3.212], ['El Hamiz', 250, 20, 0, 36.732, 3.232], ['Bab Ezzouar', 250, 20, 0, 36.726, 3.183], ['Bordj El Kiffan', 300, 20, 0, 36.742, 3.193], ['Oued Smar', 300, 25, 0, 36.705, 3.163],
      ['Mohammadia', 400, 30, 0, 36.727, 3.149], ['Rouiba', 400, 30, 1500, 36.738, 3.281], ['El Harrach', 400, 30, 1500, 36.718, 3.135], ['Les Eucalyptus', 450, 35, 1500, 36.665, 3.146], ['Bordj El Bahri', 500, 40, 1500, 36.789, 3.248],
      ['Bachdjerrah', 500, 35, 1500, 36.717, 3.113], ['Aïn Taya', 550, 40, 1500, 36.785, 3.287], ['Hussein Dey', 550, 40, 1500, 36.737, 3.098], ['Réghaïa', 600, 45, 1500, 36.735, 3.34], ['Kouba', 600, 45, 1500, 36.725, 3.085],
      ['Baraki', 600, 45, 1500, 36.665, 3.096], ['Belouizdad', 650, 50, 2500, 36.752, 3.074], ['Birkhadem', 700, 55, 2500, 36.712, 3.05], ['Alger Centre', 750, 55, 2500, 36.766, 3.058], ['Hydra', 750, 55, 2500, 36.744, 3.04],
      ['Bab El Oued', 800, 60, 2500, 36.786, 3.05], ['Ben Aknoun', 850, 65, 2500, 36.758, 3.012], ['Chéraga', 1050, 80, 2500, 36.766, 2.959]],
    offerte: 4000, offerteMax: 300, pos: [36.714, 3.212],
    pins: { gerant: '0328', cuisine: '1111', caisse: '2222', livreur: '3333' }
  };
  function config() { var c = lire('arz-config', null) || {}, o = JSON.parse(JSON.stringify(CONF0)); for (var k in c) if (c[k] != null) o[k] = c[k]; for (var q in CONF0.pins) if (!o.pins[q]) o.pins[q] = CONF0.pins[q];
    o.zones = (o.zones || []).map(function (z) { var b = CONF0.zones.filter(function (x) { return x[0] === z[0]; })[0] || []; return [z[0], +z[1] || 0, +(z[2] || b[2] || 30), +(z[3] != null ? z[3] : (b[3] || 0)), z[4] != null ? z[4] : (b[4] != null ? b[4] : null), z[5] != null ? z[5] : (b[5] != null ? b[5] : null)]; });
    if (o.offerteMax == null) o.offerteMax = CONF0.offerteMax; if (!o.pos) o.pos = CONF0.pos; return o; }
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
    var r = resto(c.resto), m = c.mode === 'place' ? 'Sur place · table ' + c.table : c.mode === 'emporter' ? 'À emporter · ' + c.heure : 'Livraison · ' + (c.zone ? c.zone + ', ' : '') + c.adresse + (c.adr && c.adr.repere ? ' (repère : ' + c.adr.repere + ')' : '') + (c.heure && c.heure !== 'Dès que possible' ? ' · ' + c.heure : '');
    return '🍕 *' + config().nom.toUpperCase() + ' · ' + r.nom.toUpperCase() + '*\nCommande *' + '#' + String(c.no).padStart(3, '0') + '* · ' + m + '\n\n' +
      c.lignes.map(function (l) { return l.q + '× ' + l.nom + (l.det.length ? ' (' + l.det.join(', ') + ')' : '') + ' · ' + (l.px * l.q) + ' DA'; }).join('\n') +
      (c.frais ? '\nLivraison · ' + c.frais + ' DA' : '') + '\n\n*Total : ' + c.total + ' DA* · ' + (c.mode === 'livraison' ? 'paiement à la livraison' : 'paiement au comptoir') + '\nClient : ' + c.nom + ' · ' + c.tel;
  }
  function lienWa(tel, txt) { var n = String(tel).replace(/\D/g, '').replace(/^0/, '213'); return 'https://wa.me/' + n + '?text=' + encodeURIComponent(txt); }
  // Service en cours, réglé depuis la cuisine : commandes en ligne ouvertes ou en pause, temps d'attente annoncé
  function service() { var s = lire('arz-service', {}); var o = {}; RESTOS.forEach(function (r) { var x = s[r.id] || {}; o[r.id] = { pause: !!x.pause, attente: x.attente || 20 }; }); return o; }
  // ----- Livraison : livreurs, plan d'Alger, suivi -----
  var LIVREURS = [['sofiane', 'Sofiane', '0770 11 22 33'], ['bilal', 'Bilal', '0550 44 55 66'], ['hamza', 'Hamza', '0661 77 88 99']];
  function livreur(id) { return LIVREURS.filter(function (l) { return l[0] === id; })[0] || ['', '', '']; }
  function zone(nom) { return config().zones.filter(function (z) { return z[0] === nom; })[0] || null; }
  // Plan stylisé de l'Est algérois (projection simple, à l'échelle) : 1000 × 525
  var BOX = { lo0: 2.93, lo1: 3.38, la0: 36.64, la1: 36.83 };
  function xy(la, lo) { return [Math.round((lo - BOX.lo0) / (BOX.lo1 - BOX.lo0) * 1000), Math.round((BOX.la1 - la) / (BOX.la1 - BOX.la0) * 525)]; }
  var COTE = [[36.800, 2.93], [36.790, 2.97], [36.800, 3.00], [36.800, 3.03], [36.795, 3.045], [36.785, 3.055], [36.772, 3.065], [36.762, 3.075], [36.752, 3.09], [36.745, 3.11], [36.738, 3.135], [36.740, 3.16], [36.748, 3.18], [36.758, 3.20], [36.772, 3.22], [36.790, 3.235], [36.808, 3.24], [36.805, 3.255], [36.800, 3.27], [36.797, 3.29], [36.790, 3.31], [36.778, 3.34], [36.770, 3.38]];
  // Avancement d'une livraison : départ (c.fin), durée prévue (c.eta min) ; position GPS réelle si le livreur la partage
  function suiviLiv(c) {
    if (c.mode !== 'livraison') return null;
    var eta = (c.eta || 25) * 60000;
    if (c.livree) return { etat: 'livree', prog: 1, arrivee: c.livree };
    if (c.st === 'fin' && c.livreur) return { etat: 'route', prog: Math.max(0.03, Math.min(0.96, (Date.now() - (c.fin || Date.now())) / eta)), arrivee: (c.fin || Date.now()) + eta, gps: c.gps || null };
    return { etat: 'cuisine', prog: 0, arrivee: null };
  }
  function courbe(a, b, t) { var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 - Math.max(30, Math.abs(b[0] - a[0]) * .18); var u = 1 - t; return [u * u * a[0] + 2 * u * t * mx + t * t * b[0], u * u * a[1] + 2 * u * t * my + t * t * b[1]]; }
  // o : { zones: true (points cliquables), sel: nom de zone, cmds: [commandes à tracer], noms: true (étiquettes), titre }
  function carte(o) {
    o = o || {}; var C = config(), P = xy(C.pos[0], C.pos[1]), sea = COTE.map(function (p) { var q = xy(p[0], p[1]); return q[0] + ',' + q[1]; });
    var vb = [0, 0, 1000, 525];
    if (o.zoom) { var pts = [P]; (o.cmds || []).forEach(function (c) { var d = c.dest || (zone(c.zone) ? [zone(c.zone)[4], zone(c.zone)[5]] : null); if (d && d[0] != null) pts.push(xy(d[0], d[1])); if (c.gps) pts.push(xy(c.gps[0], c.gps[1])); });
      if (o.sel && zone(o.sel) && zone(o.sel)[4] != null) pts.push(xy(zone(o.sel)[4], zone(o.sel)[5]));
      var x0 = Math.min.apply(null, pts.map(function (q) { return q[0]; })), x1 = Math.max.apply(null, pts.map(function (q) { return q[0]; })), y0 = Math.min.apply(null, pts.map(function (q) { return q[1]; })), y1 = Math.max.apply(null, pts.map(function (q) { return q[1]; }));
      var w = Math.max(260, (x1 - x0) + 160), h = w * 0.62; if ((y1 - y0) + 140 > h) { h = (y1 - y0) + 140; w = h / 0.62; }
      var cx = (x0 + x1) / 2, cy = (y0 + y1) / 2 - h * 0.06; vb = [Math.round(Math.max(0, Math.min(1000 - w, cx - w / 2))), Math.round(Math.max(0, Math.min(525 - h, cy - h / 2))), Math.round(Math.min(1000, w)), Math.round(Math.min(525, h))]; }
    var k = Math.max(0.42, vb[2] / 1000) / (o.zoom ? 0.62 : 1);
    var s = '<svg class="plan" viewBox="' + vb.join(' ') + '" role="' + (o.zones ? 'group' : 'img') + '" aria-label="' + (o.titre || 'Plan des livraisons à Alger') + '"><rect width="1000" height="525" fill="#EFE7D6"/>' +
      '<polygon points="' + sea.join(' ') + ' 1000,0 0,0" fill="#BFD8D2"/><polyline points="' + sea.join(' ') + '" fill="none" stroke="#9CC0B8" stroke-width="3"/>' +
      (o.zoom ? '' : '<text x="470" y="40" font-size="22" font-style="italic" fill="#5E8F86" font-family="Fraunces,Georgia,serif">Baie d\'Alger</text>') +
      '<path d="M' + xy(36.765, 2.96).join(',') + ' Q' + xy(36.74, 3.05).join(',') + ' ' + xy(36.725, 3.12).join(',') + ' T' + P.join(',') + ' L' + xy(36.737, 3.34).join(',') + '" fill="none" stroke="#DCCFB4" stroke-width="7" stroke-linecap="round"/>';
    C.zones.forEach(function (z) { if (z[4] == null) return; var q = xy(z[4], z[5]), on = o.sel === z[0];
      if (o.zones) s += '<g class="pz" data-zone="' + z[0] + '" role="button" tabindex="0" aria-label="' + z[0] + ', livraison ' + z[1] + ' DA"><circle cx="' + q[0] + '" cy="' + q[1] + '" r="20" fill="transparent"/>';
      s += '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="' + (on ? 11 : o.zones ? 9 : 6) * k + '" fill="' + (on ? '#B3122A' : '#14402F') + '" stroke="#FFF8EC" stroke-width="' + 2.5 * k + '" opacity="' + (on ? 1 : .75) + '"/>';
      if (o.noms || on) s += '<text x="' + q[0] + '" y="' + (q[1] + (on ? 32 : 20) * k) + '" text-anchor="middle" font-size="' + (on ? 26 : 13) * k + '" font-weight="700" fill="#1C1A16" font-family="DM Sans,sans-serif" paint-order="stroke" stroke="#EFE7D6" stroke-width="' + 4 * k + '">' + z[0] + '</text>';
      if (o.zones) s += '</g>'; });
    s += '<g transform="translate(' + P.join(',') + ') scale(' + k + ')"><circle r="17" fill="#14402F" stroke="#F3C969" stroke-width="3"/><text y="7" text-anchor="middle" font-size="18">🍕</text><text y="40" text-anchor="middle" font-size="16" font-weight="800" fill="#14402F" font-family="DM Sans,sans-serif" paint-order="stroke" stroke="#EFE7D6" stroke-width="4">Arzata</text></g>';
    (o.cmds || []).forEach(function (c) { var d = c.dest || (zone(c.zone) ? [zone(c.zone)[4], zone(c.zone)[5]] : null); if (!d || d[0] == null) return; var D = xy(d[0], d[1]), S = suiviLiv(c) || { prog: 0 };
      var M = [(P[0] + D[0]) / 2, (P[1] + D[1]) / 2 - Math.max(30, Math.abs(D[0] - P[0]) * .18)];
      s += '<path d="M' + P.join(',') + ' Q' + M.join(',') + ' ' + D.join(',') + '" fill="none" stroke="#B3122A" stroke-width="' + 5 * k + '" stroke-dasharray="' + 2 * k + ' ' + 12 * k + '" stroke-linecap="round"/>' +
        '<g transform="translate(' + D.join(',') + ') scale(' + k + ')"><path d="M0,0 C-14,-20 -14,-36 0,-36 C14,-36 14,-20 0,0Z" fill="#B3122A" stroke="#FFF8EC" stroke-width="2.5"/><circle cy="-25" r="5" fill="#FFF8EC"/></g>';
      if (S.etat === 'route' || S.etat === 'livree') { var g = S.gps ? xy(S.gps[0], S.gps[1]) : courbe(P, D, S.prog); s += '<g class="scoot" transform="translate(' + Math.round(g[0]) + ',' + Math.round(g[1]) + ') scale(' + k + ')"><circle r="22" fill="#FFF8EC" stroke="#14402F" stroke-width="3"/><text y="8" text-anchor="middle" font-size="24">' + (S.etat === 'livree' ? '✅' : '🛵') + '</text>' + (o.noms && c.no ? '<text y="-28" text-anchor="middle" font-size="15" font-weight="800" fill="#14402F" font-family="DM Sans,sans-serif" paint-order="stroke" stroke="#EFE7D6" stroke-width="4">#' + String(c.no).padStart(3, '0') + '</text>' : '') + '</g>'; } });
    return s + '</svg>';
  }
  window.IMS = {
    LIVREURS: LIVREURS, livreur: livreur, zone: zone, carte: carte, suiviLiv: suiviLiv,
    // Lien d'itinéraire Google Maps vers l'adresse du client
    itineraire: function (c) { var a = (c.adr && c.adr.cite ? c.adr.cite + ', ' : c.adresse + ', ') + (c.zone || '') + ', Alger'; return 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(c.loc ? c.loc.join(',') : a); },
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
