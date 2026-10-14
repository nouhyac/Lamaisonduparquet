// Données partagées entre le site client (index.html) et le back-office (cuisine.html).
// Démo : l'état vit dans le navigateur (localStorage) et se synchronise entre onglets
// (BroadcastChannel). La version livrée utilisera une base de données en ligne.
(function () {
  var SDT = ['Simple', 'Double', 'Triple'], ML = ['M', 'L'],
      SM = ['M · double steak', 'L · triple steak', 'XL · quadruple', 'XXL · quintuple'];
  function T(n, p) { return n.map(function (x, i) { return [x, p[i]]; }); }
  var B = [
    ['Classique', 'Steak haché, cheddar, salade, tomate'],
    ['Au poivre', 'Steak haché, sauce au poivre, salade, tomate'],
    ['Forestier', 'Steak haché, cheddar, champignons, salade, tomate'],
    ['Campagnard', 'Steak haché, cheddar, oignons, salade, tomate'],
    ['Italien', 'Steak haché, courgette et aubergine grillées, salade, tomate'],
    ['Continental', 'Steak haché, cheddar, œuf, salade, tomate'],
    ['Starving', 'Steak haché, poulet, cheddar, œuf, oignons caramélisés, sauce poivre']
  ];
  var PB = [[450,650,800],[450,650,800],[500,700,850],[500,700,850],[500,700,850],[500,700,850],[800,950,1100]];
  var PC = [[550,750,900],[550,750,900],[650,850,1000],[650,850,1000],[650,850,1000],[650,850,1000],[850,1050,1200]];
  var P = [];
  B.forEach(function (b, i) { P.push({ id: 'crg' + i, cat: 'Crogers', nom: 'Croger ' + b[0], desc: 'Le burger dans un croissant · ' + b[1], img: 'img3d/crg' + i + '.jpg', tailles: T(SDT, PC[i]) }); });
  P.push({ id: 'smc', cat: 'Smash', nom: 'Smash Croger', desc: 'Steaks écrasés, cheddar, salade, tomate, dans un croissant.', img: 'img3d/smc.jpg', tailles: T(SM, [650,800,950,1050]) });
  P.push({ id: 'smb', cat: 'Smash', nom: 'Smash Burger', desc: 'Steaks écrasés, cheddar, salade, tomate. Du double au quintuple.', img: 'img3d/smb.jpg', tailles: T(SM, [550,700,850,950]) });
  B.forEach(function (b, i) { P.push({ id: 'bur' + i, cat: 'Burgers', nom: 'Burger ' + b[0], desc: 'Pain brioché · ' + b[1], img: 'img3d/bur' + i + '.jpg', tailles: T(SDT, PB[i]) }); });
  [['Poulet', 'Poulet, frites, sauce fromagère, sauce algérienne', [450,650]],
   ['Poulet curry', 'Poulet, frites, sauce curry, sauce algérienne', [450,650]],
   ['Viande', 'Steak haché, frites, sauce fromagère, sauce algérienne', [550,750]],
   ['Mixte', 'Viande, poulet, frites, sauce fromagère, sauce algérienne', [650,800]]
  ].forEach(function (t, i) { P.push({ id: 'tac' + i, cat: 'Tacos', nom: 'Tacos ' + t[0], desc: t[1], img: 'img3d/tac' + i + '.jpg', tailles: T(ML, t[2]), extra: [['Fromage gratiné', 150]] }); });
  [['Poulet', 'Poulet, sauce crémeuse, fromage gratiné, frites', [550,750]],
   ['Poulet curry', 'Poulet, sauce curry, fromage gratiné, frites', [550,750]],
   ['Steak haché', 'Steak haché, sauce fromagère, fromage gratiné, frites', [650,850]],
   ['Steak haché au poivre', 'Steak haché, sauce au poivre, fromage gratiné, frites', [650,850]],
   ['Mixte', 'Poulet, steak haché, sauce au poivre, fromage gratiné, frites', [750,950]]
  ].forEach(function (t, i) { P.push({ id: 'stv' + i, cat: 'Starvation', nom: 'Starvation ' + t[0], desc: t[1], img: 'img3d/stv' + i + '.jpg', tailles: T(ML, t[2]) }); });
  [['Poulet', 'Pain brioché, poulet, sauce fromagère, frites, tomate, salade', [350,550,700]],
   ['Poulet curry', 'Pain brioché, poulet, sauce curry, frites, tomate, salade', [350,550,700]],
   ['Steak haché', 'Pain brioché, steak haché, sauce fromagère, oignons caramélisés, frites', [400,600,750]],
   ['Steak haché poivre', 'Pain brioché, steak haché, sauce poivre, oignons caramélisés, frites', [400,600,750]],
   ['Mix', 'Pain brioché, steak haché, poulet, oignons caramélisés, frites', [500,700,850]]
  ].forEach(function (t, i) { P.push({ id: 'san' + i, cat: 'Sandwichs', nom: 'Sandwich ' + t[0], desc: t[1], img: 'img3d/san' + i + '.jpg', tailles: T(SDT, t[2]) }); });
  [['Sauce fromagère', 'Penne, sauce fromagère', 650],
   ['Sauce curry', 'Penne, poulet, sauce curry, cheddar', 750],
   ['Sauce crémeuse', 'Penne, poulet, champignons, sauce crémeuse, cheddar', 850],
   ['Sauce bolognaise', 'Penne, sauce bolognaise, cheddar', 900]
  ].forEach(function (t, i) { P.push({ id: 'pat' + i, cat: 'Pâtes', nom: 'Pâtes ' + t[0], desc: t[1], img: 'img3d/pat' + i + '.jpg', prix: t[2] }); });

  // ----- Stockage + synchronisation -----
  function lire(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function ecrire(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var canal = null; try { canal = new BroadcastChannel('ims'); } catch (e) {}
  var abonnes = [];
  function signaler(type) { if (canal) try { canal.postMessage(type); } catch (e) {} }
  function surChangement(fn) { abonnes.push(fn); }
  function notifier(t) { abonnes.forEach(function (f) { f(t); }); }
  if (canal) canal.onmessage = function (e) { notifier(e.data); };
  window.addEventListener('storage', function (e) { if (e.key && e.key.indexOf('ims-') === 0) notifier(e.key); });

  // Prix et disponibilités modifiés depuis le back-office
  function menu() {
    var dispo = lire('ims-dispo', {}), prix = lire('ims-prix', {});
    return P.map(function (p) {
      var q = JSON.parse(JSON.stringify(p));
      if (prix[p.id]) { if (q.tailles) q.tailles.forEach(function (t, i) { if (prix[p.id][i] != null) t[1] = prix[p.id][i]; }); else if (prix[p.id][0] != null) q.prix = prix[p.id][0]; }
      if (q.tailles) q.prix = q.tailles[0][1];
      q.dispo = dispo[p.id] !== false;
      return q;
    });
  }

  // Commandes d'exemple : la journée a déjà commencé quand on ouvre la démo
  function amorcer() {
    if (lire('ims-v', 0) !== 4) { ['ims-cmds', 'ims-no', 'ims-dispo', 'ims-prix', 'ims-recep', 'ims-service', 'ims-z', 'ims-charges'].forEach(function (k) { try { localStorage.removeItem(k); } catch (e) {} }); ecrire('ims-v', 4); }
    if (lire('ims-cmds', null)) return;
    var now = Date.now(), d = new Date(); d.setHours(11, 40, 0, 0); if (d.getTime() > now - 60 * 60000) d.setDate(d.getDate() - 1);
    var base = d.getTime(), cmds = [], no = 1;
    var modes = ['place', 'emporter', 'livraison'], noms = ['Amine', 'Sara', 'Karim', 'Lina', 'Yacine', 'Nour', 'Rayan', 'Inès', 'Walid', 'Meriem'];
    var choix = [['crg6', 1], ['smc', 3], ['tac3', 1], ['stv4', 0], ['crg0', 1], ['bur2', 1], ['smb', 1], ['san4', 1], ['pat2', 0], ['tac0', 0], ['crg2', 0], ['stv1', 1]];
    var M = menu();
    var span = Math.max(30, Math.min(600, (now - base) / 60000 - 25));
    for (var k = 0; k < 26; k++) {
      var t = base + (span * (k / 26) + (k * 7) % 11) * 60000;
      var lignes = [], n = 1 + (k % 3);
      for (var j = 0; j < n; j++) {
        var c = choix[(k * 5 + j * 3) % choix.length], p = M.find(function (x) { return x.id === c[0]; });
        var ti = p.tailles ? Math.min(c[1], p.tailles.length - 1) : -1;
        lignes.push({ id: p.id, nom: p.nom, det: ti >= 0 ? [p.tailles[ti][0]] : [], px: ti >= 0 ? p.tailles[ti][1] : p.prix, q: 1 + ((k + j) % 4 === 0 ? 1 : 0) });
      }
      cmds.push({ no: no++, resto: k % 5 < 3 ? 'bab' : 'ain', t: t, mode: modes[k % 3], table: String(1 + (k % 12)), heure: 'Dès que possible', adresse: 'Résidence, bât. 4', nom: noms[k % noms.length], tel: '05' + (50 + k) + ' 12 34 56', lignes: lignes, total: lignes.reduce(function (a, l) { return a + l.px * l.q; }, 0), st: 'fin', fin: t + (9 + k % 7) * 60000, paye: true, pay: ['especes', 'especes', 'cib', 'baridimob'][k % 4] });
    }
    function cmd(st, mode, il, lignes, nom, resto) { var l = lignes.map(function (x) { var p = M.find(function (y) { return y.id === x[0]; }); var ti = p.tailles ? x[1] : -1; return { id: p.id, nom: p.nom, det: (ti >= 0 ? [p.tailles[ti][0]] : []).concat(x[2] ? ['Fromage gratiné'] : []), px: (ti >= 0 ? p.tailles[ti][1] : p.prix) + (x[2] ? 150 : 0), q: x[3] || 1 }; }); cmds.push({ no: no++, resto: resto, t: now - il * 60000, mode: mode, table: '3', heure: 'Dans 15 min', adresse: 'Résidence, bât. 4, 2e étage', nom: nom, tel: '0661 22 33 44', lignes: l, total: l.reduce(function (a, x) { return a + x.px * x.q; }, 0), st: st }); }
    cmd('prete', 'place', 11, [['crg6', 1], ['smb', 1]], 'Sara', 'bab');
    cmd('prep', 'emporter', 4, [['tac3', 1, true], ['stv1', 0]], 'Amine', 'ain');
    cmd('nouv', 'livraison', 1, [['bur2', 1, false, 2], ['pat2', 0]], 'Karim', 'bab');
    ecrire('ims-cmds', cmds); ecrire('ims-no', no);
  }

  // Les deux restaurants (bio Instagram)
  var RESTOS = [
    { id: 'bab', nom: 'Bab Ezzouar', ouv: 11, ferm: 23, h: '11h – 23h', tel: '0659 56 46 11', maps: "https://www.google.com/maps/search/I'm+Starving+Food+Bab+Ezzouar" },
    { id: 'ain', nom: 'Aïn Allah', ouv: 11, ferm: 26, h: '11h – 02h', tel: '07 97 88 38 97', maps: "https://www.google.com/maps/search/I'm+Starving+Food+Ain+Allah" }
  ];
  function ouvert(r, d) { d = d || new Date(); var h = d.getHours() + d.getMinutes() / 60; return (h >= r.ouv && h < Math.min(24, r.ferm)) || (r.ferm > 24 && h < r.ferm - 24); }
  function resto(id) { return RESTOS.find(function (r) { return r.id === id; }) || RESTOS[0]; }
  // Réception des commandes : le restaurant choisit ses canaux (back-office › Réception)
  var RECEP0 = { ecran: true, bons: true, copies: 2, format: '80', whatsapp: true, sms: false, email: false, emailAdr: 'commandes@imstarving.dz', caisse: 'csv', webhook: '', acceptation: 'manuelle', clientWa: true };
  function reception() { var r = lire('ims-recep', {}); var o = {}; for (var k in RECEP0) o[k] = r[k] === undefined ? RECEP0[k] : r[k]; return o; }
  function texteBon(c) {
    var r = resto(c.resto), m = c.mode === 'place' ? 'Sur place · table ' + c.table : c.mode === 'emporter' ? 'À emporter · ' + c.heure : 'Livraison · ' + c.adresse;
    return '🍔 *I\'M STARVING ' + r.nom.toUpperCase() + '*\nCommande *' + '#' + String(c.no).padStart(3, '0') + '* · ' + m + '\n\n' +
      c.lignes.map(function (l) { return l.q + '× ' + l.nom + (l.det.length ? ' (' + l.det.join(', ') + ')' : '') + ' · ' + (l.px * l.q) + ' DA'; }).join('\n') +
      '\n\n*Total : ' + c.total + ' DA* · ' + (c.mode === 'livraison' ? 'paiement à la livraison' : 'paiement au comptoir') + '\nClient : ' + c.nom + ' · ' + c.tel;
  }
  function lienWa(tel, txt) { var n = String(tel).replace(/\D/g, '').replace(/^0/, '213'); return 'https://wa.me/' + n + '?text=' + encodeURIComponent(txt); }
  // Service en cours, réglé depuis la cuisine : commandes en ligne ouvertes ou en pause, temps d'attente annoncé
  function service() { var s = lire('ims-service', {}); var o = {}; RESTOS.forEach(function (r) { var x = s[r.id] || {}; o[r.id] = { pause: !!x.pause, attente: x.attente || 20 }; }); return o; }
  window.IMS = {
    service: service, majService: function (o) { ecrire('ims-service', o); signaler('ims-service'); },
    reception: reception, majReception: function (o) { ecrire('ims-recep', o); signaler('ims-recep'); signaler('ims-service'); }, texteBon: texteBon, lienWa: lienWa,
    RESTOS: RESTOS, resto: resto, ouvert: ouvert,
    CATS: ['Crogers', 'Smash', 'Burgers', 'Tacos', 'Starvation', 'Sandwichs', 'Pâtes'],
    menu: menu, lire: lire, ecrire: ecrire, amorcer: amorcer,
    commandes: function () { return lire('ims-cmds', []); },
    enregistrer: function (cmds) { ecrire('ims-cmds', cmds); signaler('ims-cmds'); },
    nouvelleCommande: function (c) { var n = lire('ims-no', 1); c.no = n; if (reception().acceptation === 'auto' && c.st === 'nouv') { c.st = 'prep'; c.auto = true; } ecrire('ims-no', n + 1); var L = lire('ims-cmds', []); L.push(c); ecrire('ims-cmds', L); signaler('ims-cmds'); return c; },
    majMenu: function (dispo, prix) { ecrire('ims-dispo', dispo); ecrire('ims-prix', prix); signaler('ims-menu'); },
    surChangement: surChangement,
    reinitialiser: function () { ['ims-cmds', 'ims-no', 'ims-dispo', 'ims-prix', 'ims-recep', 'ims-service', 'ims-z', 'ims-charges'].forEach(function (k) { try { localStorage.removeItem(k); } catch (e) {} }); amorcer(); signaler('ims-cmds'); signaler('ims-menu'); signaler('ims-recep'); signaler('ims-service'); },
    fmt: function (n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' DA'; },
    numero: function (n) { return '#' + String(n).padStart(3, '0'); }
  };
  amorcer();
})();
