/* =====================================================================
   STI Bureautique — cœur commun (site public + espace de gestion)
   Données locales « sti-* » synchronisées en direct (BroadcastChannel).
   ===================================================================== */
(function () {
  'use strict';
  const STI = {
    name: 'STI Bureautique',
    tagline: 'Mobilier de bureau · Vente en gros et détail',
    phones: ['0555 59 05 43', '0555 59 05 44'],
    whatsapp: '213555590543',
    email: 'sti.commercial.01@gmail.com',
    address: 'Pins Maritimes, Mohammadia, Alger',
    maps: 'https://maps.google.com/?q=36.7334654,3.1697895',
    hours: 'Samedi – jeudi : 8 h 30 – 17 h 00',
    hoursAr: 'السبت – الخميس: 8:30 – 17:00',
    social: { instagram: 'https://www.instagram.com/sti_bureautique/', facebook: 'https://www.facebook.com/Stibureautique1', tiktok: 'https://www.tiktok.com/@sti.bureautique', youtube: 'https://www.youtube.com/@stibureautique1' },
    refs: [['sonatrach', 'Sonatrach'], ['sonelgaz', 'Sonelgaz'], ['cnas', 'CNAS'], ['algerie-poste', 'Algérie Poste'], ['sogral', 'Sogral'], ['sntf', 'SNTF'], ['partner-1', 'Cosider Engineering'], ['partner-2', 'Setram'], ['partner-3', 'Rail Logistic']]
  };
  const SOURCES = [['ig', 'Instagram'], ['fb', 'Facebook'], ['tt', 'TikTok'], ['gg', 'Google'], ['ok', 'Ouedkniss'], ['wa', 'WhatsApp'], ['li', 'LinkedIn'], ['bo', 'Bouche-à-oreille'], ['sh', 'Showroom'], ['au', 'Autre']];
  const srcName = k => (SOURCES.find(s => s[0] === k) || [0, 'Non renseigné'])[1];

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = n => n == null || isNaN(n) ? '—' : Math.round(n).toLocaleString('fr-FR').replace(/ | /g, ' ') + ' DA';
  const get = (k, d) => { try { const v = localStorage.getItem('sti-' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
  let bc = null; try { bc = new BroadcastChannel('sti-sync'); } catch (e) { /* ancien navigateur */ }
  const put = (k, v) => { try { localStorage.setItem('sti-' + k, JSON.stringify(v)); } catch (e) { return false; } try { bc && bc.postMessage(k); } catch (e) { /* ok */ } return true; };
  const L = []; const onChange = fn => L.push(fn); const fire = k => L.forEach(fn => { try { fn(k); } catch (e) { /* vue pas prête */ } });
  if (bc) bc.onmessage = e => fire(e.data);
  addEventListener('storage', e => { if (e.key && e.key.indexOf('sti-') === 0) fire(e.key.slice(4)); });

  /* ---------- réglages ---------- */
  const DEF = { zones: {}, pins: { manager: '0328', sales: '1111', driver: '3333' }, devisN: 0 };
  const S = () => { const s = Object.assign({}, DEF, get('settings', {})); s.pins = Object.assign({}, DEF.pins, s.pins); s.zones = s.zones || {}; return s; };
  const save = p => put('settings', Object.assign(S(), p));
  const feeFor = w => { const z = S().zones; return w && z[w] != null && z[w] !== '' ? +z[w] : null; };

  /* ---------- catalogue (données réelles + réglages du gérant) ---------- */
  const BASE = window.STI_CATALOGUE || [];
  function products() {
    const ov = get('prod', {});
    return BASE.map(b => { const o = ov[b.id] || {}; const v = b.v.map((x, i) => Object.assign({}, x, (o.v || [])[i] || {}));
      return Object.assign({}, b, { v, web: o.web !== false, stock: o.stock == null ? null : o.stock, best: !!o.best }); });
  }
  const prod = id => products().find(p => p.id === id);
  const minP = p => Math.min(...p.v.map(x => x.p));
  const maxP = p => Math.max(...p.v.map(x => x.p));
  const vPrice = (p, i) => (p.v[i] || p.v[0]).p;
  const vName = (p, i) => (p.v[i] || p.v[0]).t;
  const lineName = (p, i) => p.name + (vName(p, i) ? ' · ' + vName(p, i) : '');
  const CATS = ['Chaises ergonomiques', 'Chaises opérateurs', 'Fauteuils responsable', 'Chaises visiteurs & réunion', 'Bureaux', 'Armoires & rangement', 'Tables & tabourets', 'Chaises gamer'];
  const CAT_AR = { 'Chaises ergonomiques': 'كراسي مريحة', 'Chaises opérateurs': 'كراسي الموظفين', 'Fauteuils responsable': 'كراسي المدراء', 'Chaises visiteurs & réunion': 'الزوار والاجتماعات', 'Bureaux': 'المكاتب', 'Armoires & rangement': 'الخزائن', 'Tables & tabourets': 'طاولات ومقاعد', 'Chaises gamer': 'ألعاب' };

  /* ---------- commandes et devis ---------- */
  const lineTotal = l => l.price * l.qty;
  const sub = lines => lines.reduce((a, l) => a + lineTotal(l), 0);
  const orderTotal = o => sub(o.lines) + (o.fee || 0);
  const devisTotal = d => { const s = sub(d.lines); return Math.round(s * (1 - (d.disc || 0) / 100)); };

  /* ---------- mesure d'audience (marketing) ---------- */
  const day = t => new Date(t || Date.now()).toISOString().slice(0, 10);
  function track(type, pid) {
    const E = get('ev', {}); const k = day(); E[k] = E[k] || {}; const e = E[k];
    e[type] = (e[type] || 0) + 1;
    if (pid) { e.p = e.p || {}; e.p[pid] = e.p[pid] || {}; e.p[pid][type] = (e.p[pid][type] || 0) + 1; }
    const keys = Object.keys(E).sort(); while (keys.length > 120) delete E[keys.shift()];
    put('ev', E);
  }
  function source() { try { return sessionStorage.getItem('sti-src') || ''; } catch (e) { return ''; } }
  (function () { const h = location.hash.slice(1).split('.')[0]; if (SOURCES.some(s => s[0] === h)) { try { sessionStorage.setItem('sti-src', h); } catch (e) { /* bloqué */ } } })();

  const WILAYAS = ['01 Adrar', '02 Chlef', '03 Laghouat', '04 Oum El Bouaghi', '05 Batna', '06 Béjaïa', '07 Biskra', '08 Béchar', '09 Blida', '10 Bouira', '11 Tamanrasset', '12 Tébessa', '13 Tlemcen', '14 Tiaret', '15 Tizi Ouzou', '16 Alger', '17 Djelfa', '18 Jijel', '19 Sétif', '20 Saïda', '21 Skikda', '22 Sidi Bel Abbès', '23 Annaba', '24 Guelma', '25 Constantine', '26 Médéa', '27 Mostaganem', '28 M\'Sila', '29 Mascara', '30 Ouargla', '31 Oran', '32 El Bayadh', '33 Illizi', '34 Bordj Bou Arréridj', '35 Boumerdès', '36 El Tarf', '37 Tindouf', '38 Tissemsilt', '39 El Oued', '40 Khenchela', '41 Souk Ahras', '42 Tipaza', '43 Mila', '44 Aïn Defla', '45 Naâma', '46 Aïn Témouchent', '47 Ghardaïa', '48 Relizane', '49 Timimoun', '50 Bordj Badji Mokhtar', '51 Ouled Djellal', '52 Béni Abbès', '53 In Salah', '54 In Guezzam', '55 Touggourt', '56 Djanet', '57 El M\'Ghair', '58 El Meniaa'];
  window.STI_WILAYAS = WILAYAS;
  window.STIX = { WILAYAS, STI, SOURCES, srcName, esc, money, get, put, onChange, S, save, feeFor, products, prod, minP, maxP, vPrice, vName, lineName, CATS, CAT_AR, lineTotal, sub, orderTotal, devisTotal, track, source, day };
})();
