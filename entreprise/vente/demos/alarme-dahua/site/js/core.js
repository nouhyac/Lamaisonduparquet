/* =====================================================================
   General Electric dz — cœur commun (boutique, page produit, gestion)
   Données locales « ads-* » + synchronisation en direct (BroadcastChannel
   « ads-sync » + événement storage). Multi-produits, multi-points de vente.
   ===================================================================== */
(function () {
  'use strict';
  const SHOP = window.SHOP;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = n => n == null || isNaN(n) ? '—' : Math.round(n).toLocaleString('fr-FR').replace(/ | /g, ' ') + ' DA';
  const get = (k, d) => { try { const v = localStorage.getItem('ads-' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
  let bc = null; try { bc = new BroadcastChannel('ads-sync'); } catch (e) { /* ancien navigateur */ }
  const put = (k, v) => {
    try { localStorage.setItem('ads-' + k, JSON.stringify(v)); }
    catch (e) { return false; } /* mémoire pleine (photos trop nombreuses) : l'appelant prévient */
    try { bc && bc.postMessage(k); } catch (e) { /* ok */ } return true;
  };
  const listeners = [];
  const onChange = fn => listeners.push(fn);
  const fire = () => listeners.forEach(fn => { try { fn(); } catch (e) { /* vue pas prête */ } });
  if (bc) bc.onmessage = fire;
  addEventListener('storage', e => { if (e.key && e.key.indexOf('ads-') === 0) fire(); });

  const KIT_NAME = 'Kit alarme Dahua AirShield (4 pièces)';
  const DEF_DEPOTS = [
    { id: 'mag', name: 'Magasin El Hamiz', maps: SHOP.maps },
    { id: 'dep', name: 'Dépôt', maps: 'https://maps.app.goo.gl/AZBY7heeLM4SRT1V7' }
  ];
  const DEF = { price: SHOP.price, oldPrice: SHOP.oldPrice, cost: null, available: true, stockAlert: 3, zones: {}, depots: DEF_DEPOTS,
    pins: { manager: SHOP.pin || '0328', cash: '2222', driver: '3333', store: '4444' } };
  const S = () => {
    const s = Object.assign({}, DEF, get('settings', {}));
    s.pins = Object.assign({}, DEF.pins, s.pins); s.zones = s.zones || {};
    s.depots = (s.depots && s.depots.length ? s.depots : DEF_DEPOTS).map((d, i) => Object.assign({}, DEF_DEPOTS[i] || {}, d));
    return s;
  };
  const save = p => put('settings', Object.assign(S(), p));
  const depots = () => S().depots;
  const depot = id => depots().find(d => d.id === id) || depots()[0];
  const depName = id => depot(id).name;

  /* ---------- produits ---------- */
  const KIT_CAT = 'Alarme & sécurité';
  function products() {
    const s = S();
    return [{ id: 'kit', name: KIT_NAME, short: 'Kit alarme Dahua AirShield', cat: KIT_CAT, brand: 'Dahua', ref: 'DHI-ART-ARC3000H-03-GW2(868)',
      price: s.price, oldPrice: s.oldPrice, cost: s.cost, alert: s.stockAlert, img: 'img/boite.webp', web: s.available !== false, kit: true, page: 'index.html',
      desc: 'Centrale + détecteur d\'ouverture + détecteur de mouvement + télécommande. Wi-Fi, câble et carte SIM, appel et SMS vers 5 numéros, batterie de secours 12 h.' }]
      .concat(get('products', []));
  }
  const prod = id => products().find(p => p.id === id);
  const cats = () => [...new Set(products().map(p => p.cat).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fr'));

  /* ---------- commandes ---------- */
  const counts = o => o.status !== 'nouvelle' && o.status !== 'annulée';
  const items = o => o.items && o.items.length ? o.items : [{ pid: 'kit', name: KIT_NAME, price: o.price != null ? o.price : S().price, qty: o.qty || 1 }];
  const orderSub = o => { let t = 0; for (const i of items(o)) { if (i.price == null) return null; t += i.price * i.qty; } return t; };
  const orderTotal = o => { const s = orderSub(o); return s == null ? null : s + (o.fee || 0); };
  const orderQty = o => items(o).reduce((a, i) => a + i.qty, 0);
  const odep = o => o.depot || 'mag';
  const saleTotal = x => x.items.reduce((a, i) => a + i.price * i.qty, 0);
  const sdep = x => x.depot || 'mag';
  const ipid = i => i.pid || (i.kit ? 'kit' : null);

  /* ---------- stock par point de vente ---------- */
  function stockOf(pid, dep) {
    const inD = m => dep == null || (m.depot || 'mag') === dep;
    const moves = get('moves', []).filter(m => (m.pid || 'kit') === pid && inD(m)).reduce((a, m) => a + m.qty, 0);
    const site = get('orders', []).filter(o => counts(o) && (dep == null || odep(o) === dep)).reduce((a, o) => a + items(o).filter(i => i.pid === pid).reduce((b, i) => b + i.qty, 0), 0);
    const shop = get('sales', []).filter(x => dep == null || sdep(x) === dep).reduce((a, x) => a + x.items.filter(i => ipid(i) === pid).reduce((b, i) => b + i.qty, 0), 0);
    return moves - site - shop;
  }
  const lowOf = p => p.alert != null ? p.alert : 3;

  /* ---------- livraison ---------- */
  const feeFor = w => { const z = S().zones; return w && z[w] != null && z[w] !== '' ? +z[w] : null; };

  window.GE = { SHOP, esc, money, get, put, onChange, S, save, depots, depot, depName, products, prod, cats, KIT_NAME, KIT_CAT,
    counts, items, orderSub, orderTotal, orderQty, odep, saleTotal, sdep, ipid, stockOf, lowOf, feeFor };
})();
