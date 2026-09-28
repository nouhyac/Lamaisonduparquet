'use strict';
/* ============================================================
   Pilotage Instagram · La Maison du Parquet (EGGER)
   core.js : utilitaires, données d'exemple, import Windsor.ai,
   enrichissement (déductions), score, statistiques de groupe.
   ============================================================ */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const NA = "Cette métrique n'est pas disponible dans la source de données connectée.";

/* ---------- formats ---------- */
const nf = new Intl.NumberFormat('fr-FR');
const isNum = v => typeof v === 'number' && isFinite(v);
const fmtN = v => isNum(v) ? nf.format(Math.round(v)) : '—';
const fmt1 = v => isNum(v) ? v.toFixed(1).replace('.', ',') : '—';
const fmtK = v => {
  if (!isNum(v)) return '—';
  const a = Math.abs(v);
  if (a >= 1e6) return (v / 1e6).toFixed(1).replace('.', ',') + ' M';
  if (a >= 1e4) return nf.format(Math.round(v / 1e3)) + ' k';
  if (a >= 1e3) return (v / 1e3).toFixed(1).replace('.', ',') + ' k';
  return fmtN(v);
};
const fmtP = (v, d = 1) => isNum(v) ? (v * 100).toFixed(d).replace('.', ',') + ' %' : '—';
const fmtX = v => isNum(v) ? '×' + v.toFixed(v >= 10 ? 0 : 1).replace('.', ',') : '—';
const fmtS = v => isNum(v) ? (v < 10 ? v.toFixed(1).replace('.', ',') : Math.round(v)) + ' s' : '—';
const signed = (v, f) => (v > 0 ? '+' : v < 0 ? '−' : '') + f(Math.abs(v));

/* ---------- dates (chaînes AAAA-MM-JJ, calculs en UTC) ---------- */
const toD = s => new Date(s + 'T00:00:00Z');
const dstr = d => d.toISOString().slice(0, 10);
const addDays = (s, n) => { const d = toD(s); d.setUTCDate(d.getUTCDate() + n); return dstr(d); };
const diffDays = (a, b) => Math.round((toD(b) - toD(a)) / 864e5);
const dfLong = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const dfShort = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const dfMonth = new Intl.DateTimeFormat('fr-FR', { month: 'short', year: '2-digit', timeZone: 'UTC' });
const fmtDate = s => s ? dfLong.format(toD(s)) : '—';
const fmtDay = s => s ? dfShort.format(toD(s)) : '—';
const DOW = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const DOW_S = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const DOW_ORDER = [6, 0, 1, 2, 3, 4, 5]; // semaine algérienne : samedi → vendredi
const SLOTS = [
  { id: 'nuit', name: 'Nuit (0h-6h)', short: 'Nuit', test: h => h < 7 },
  { id: 'matin', name: 'Matin (7h-11h)', short: 'Matin', test: h => h >= 7 && h < 12 },
  { id: 'midi', name: 'Midi (12h-14h)', short: 'Midi', test: h => h >= 12 && h < 15 },
  { id: 'aprem', name: 'Après-midi (15h-18h)', short: 'Après-midi', test: h => h >= 15 && h < 19 },
  { id: 'soir', name: 'Soir (19h-23h)', short: 'Soir', test: h => h >= 19 },
];
const slotOf = h => SLOTS.find(s => s.test(h)).id;
const DUR = [
  { id: 'd1', name: '< 10 s', max: 9.99 }, { id: 'd2', name: '10-20 s', max: 20.99 }, { id: 'd3', name: '21-30 s', max: 30.99 },
  { id: 'd4', name: '31-45 s', max: 45.99 }, { id: 'd5', name: '46-60 s', max: 60.99 }, { id: 'd6', name: '61-90 s', max: 90.99 }, { id: 'd7', name: '> 90 s', max: Infinity },
];
const durOf = s => isNum(s) ? DUR.find(d => s <= d.max).id : null;

/* ---------- statistiques ---------- */
const vals = (a, f) => a.map(f).filter(isNum);
const sum = a => a.reduce((s, v) => s + (isNum(v) ? v : 0), 0);
const mean = a => a.length ? sum(a) / a.length : null;
const quant = (a, q) => {
  if (!a.length) return null;
  const s = [...a].sort((x, y) => x - y), p = (s.length - 1) * q, lo = Math.floor(p), hi = Math.ceil(p);
  return s[lo] + (s[hi] - s[lo]) * (p - lo);
};
const median = a => quant(a, .5);
const ratio = (a, b) => isNum(a) && isNum(b) && b > 0 ? a / b : null;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ---------- aléatoire reproductible (données d'exemple) ---------- */
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/* ============================================================
   Référentiels métier (déductions à partir du texte)
   ============================================================ */
const FORMATS = {
  REEL: { name: 'Reel', short: 'REEL', c: 'var(--s1)' },
  CAROUSEL: { name: 'Carrousel', short: 'CARR', c: 'var(--s2)' },
  IMAGE: { name: 'Image', short: 'IMG', c: 'var(--s3)' },
  VIDEO: { name: 'Vidéo', short: 'VID', c: 'var(--s4)' },
  STORY: { name: 'Story', short: 'STORY', c: 'var(--s5)' },
};

const THEMES = [
  { id: 'real', name: 'Réalisations clients', re: /\bclient|chantier|réalisation|livré|villa|appartement|chez (?:[A-ZÉ]|nos|un|une)|projet/i, cat: 'Autorité' },
  { id: 'reno', name: 'Rénovation sur carrelage', re: /carrelage|rénov|avant\s*\/?\s*après|sans casser|transform/i, cat: 'Éducatif' },
  { id: 'tech', name: 'Technique et résistance', re: /classe 3[12]|aqua|l'eau|résist|rayure|chauffage au sol|abrasion|norme|épaisseur|\b[78] ?mm/i, cat: 'Éducatif' },
  { id: 'pose', name: 'Conseils de pose', re: /\bpose|poser|sous-couche|plinthe|erreur|joint|dilatation|clips|lame[s]? .*sens|entretien|nettoy/i, cat: 'Éducatif' },
  { id: 'promo', name: 'Offres et arrivages', re: /arrivage|promo|offre|en stock|disponible|devis|réassort|dernier[s]? carton/i, cat: 'Promotionnel' },
  { id: 'show', name: 'Showroom et coulisses', re: /showroom|coulisse|équipe|dar el be[iï]da|entrepôt|dépôt|nos conseillers/i, cat: 'Personnel' },
  { id: 'comm', name: 'Communauté et sondages', re: /sondage|votre avis|vous préférez|dites-nous|on vous répond|vos questions|lequel/i, cat: 'Communauté' },
  { id: 'deco', name: 'Décors et inspiration', re: /chêne|décor|EL\d{4}|teinte|ambiance|inspiration|salon|chambre|style/i, cat: 'Inspiration' },
];
const THEME_OTHER = { id: 'autre', name: 'Autre / non classé', cat: 'Autre' };
const themeById = id => THEMES.find(t => t.id === id) || THEME_OTHER;

const HOOKS = [
  { id: 'avap', name: 'Avant / après', re: /^(?:avant|après|de .* à |avant\s*\/\s*après)|avant\s*\/\s*après|transformation/i },
  { id: 'err', name: 'Erreur courante', re: /erreur|faute|ne faites (?:jamais|pas)|évitez|on voit trop souvent/i },
  { id: 'warn', name: 'Avertissement', re: /^attention|avant d'acheter|ne .* pas avant|stop\b/i },
  { id: 'myth', name: 'Mythe', re: /mythe|idée reçue|on entend souvent|c'est faux|vrai ou faux/i },
  { id: 'demo', name: 'Démonstration', re: /on a (?:versé|testé|rayé|laissé)|test\b|crash-test|regardez ce qui|démonstration/i },
  { id: 'cmp', name: 'Comparaison', re: /\bvs\b|comparatif|différence entre|ou bien|classe 31 ou/i },
  { id: 'list', name: 'Liste', re: /^\d+\s|(?:^|\s)\d+ (?:astuces|raisons|erreurs|décors|choses|questions|étapes|conseils)/i },
  { id: 'tuto', name: 'Tutoriel', re: /^comment|étape par étape|tuto|en \d+ étapes|la méthode/i },
  { id: 'res', name: 'Résultat', re: /résultat|en une journée|en \d+ (?:heures|jours)|livré en/i },
  { id: 'case', name: 'Cas réel', re: /^(?:chez|ce client|notre client|ce chantier)|cas réel|projet de la semaine/i },
  { id: 'secret', name: 'Secret', re: /secret|personne ne vous (?:dit|dira)|ce qu'on ne vous dit pas/i },
  { id: 'news', name: 'Actualité', re: /^(?:nouveau|nouveauté|arrivage|c'est arrivé|enfin disponible)|vient d'arriver/i },
  { id: 'pain', name: 'Douleur ou problème', re: /marre|sol froid|problème|fissur|abîmé|vieux carrelage|bruit/i },
  { id: 'desire', name: 'Désir ou aspiration', re: /rêve|idéal|chaleureux|cocooning|comme à l'hôtel|maison de rêve/i },
  { id: 'opin', name: 'Opinion', re: /franchement|notre avis|on assume|à notre avis|impopulaire/i },
  { id: 'story', name: 'Histoire personnelle', re: /^(?:il y a \d+ ans|on a commencé|notre histoire|quand on a)/i },
  { id: 'q', name: 'Question', re: /\?/ },
  { id: 'prom', name: 'Promesse', re: /^(?:voici|découvrez|vous allez)|vous saurez/i },
];
const HOOK_OTHER = { id: 'other', name: 'Affirmation simple' };
const hookById = id => HOOKS.find(h => h.id === id) || HOOK_OTHER;

const CTAS = [
  { id: 'save', name: 'Enregistrer', re: /enregistre|sauvegarde/i },
  { id: 'share', name: 'Partager', re: /partage|envoyez[- ]le|envoie[- ]le|envoyez ce/i },
  { id: 'tag', name: 'Identifier quelqu’un', re: /identifie|taguez|mentionnez/i },
  { id: 'dm', name: 'Envoyer un message', re: /whatsapp|\bdm\b|message privé|écrivez-nous|en privé/i },
  { id: 'visit', name: 'Réserver une visite', re: /réserv|rendez-vous|venez (?:les )?voir|passez au showroom/i },
  { id: 'link', name: 'Cliquer sur le lien', re: /lien en bio|lien dans la bio|cliquez/i },
  { id: 'follow', name: 'S’abonner', re: /abonnez|suivez-nous|abonne-toi/i },
  { id: 'comment', name: 'Commenter', re: /commentaire|commentez|dites-nous|répondez/i },
  { id: 'profile', name: 'Visiter le profil', re: /sur notre profil|voir le profil|en visitant/i },
];
const CTA_NONE = { id: 'none', name: 'Sans CTA' };
const ctaById = id => CTAS.find(c => c.id === id) || CTA_NONE;

const OBJECTIVES = {
  portee: { name: 'Portée', desc: 'fait découvrir le compte' },
  croissance: { name: 'Croissance', desc: 'convertit en abonnés' },
  autorite: { name: 'Autorité', desc: 'est enregistré comme référence' },
  communaute: { name: 'Communauté', desc: 'fait réagir en commentaires' },
  consideration: { name: 'Considération', desc: 'amène vers le profil' },
  conversion: { name: 'Conversion', desc: 'génère des messages / contacts' },
};

/* ============================================================
   Données d'exemple (clairement marquées comme telles)
   ============================================================ */
const DECORS = [
  { ref: 'EL2863', n: 'Chêne Asgil miel' }, { ref: 'EL1061', n: 'Chêne Achensee' }, { ref: 'EL2970', n: 'Chêne du Nord naturel' },
  { ref: 'EL2416', n: 'Chêne Melba beige' }, { ref: 'EL1055', n: 'Chêne Bardolino' },
];
const CITIES = ['Alger', 'Oran', 'Blida', 'Tipaza', 'Boumerdès', 'Sétif', 'Constantine', 'Tizi Ouzou', 'Béjaïa', 'Annaba'];
const ROOMS = ['salon', 'chambre', 'entrée', 'bureau', 'séjour', 'couloir'];

const DEMO_THEMES = {
  reno: { w: .16, reach: 1.7, like: 1.1, cm: 1.0, save: 1.2, share: 2.1, pv: 1.2, fol: 1.35, fmt: { REEL: .75, CAROUSEL: .25 }, cta: ['share', 'save', 'visit', 'none'],
    tpl: [
      ['avap', 'Avant / après : un {room} en carrelage beige devenu {d} en une journée.'],
      ['pain', 'Marre de votre vieux carrelage froid ? On pose le {d} ({r}) directement dessus, sans casser.'],
      ['res', 'Résultat : 42 m² rénovés en une journée, sans poussière, sur le carrelage existant.'],
      ['q', 'Peut-on poser un parquet EGGER sur du carrelage ? Oui, voici la condition à vérifier.'],
      ['avap', 'Transformation à {w} : carrelage des années 90 → {d}.'],
    ] },
  pose: { w: .15, reach: 1.0, like: .9, cm: 1.3, save: 2.4, share: 1.2, pv: 1.0, fol: 1.1, fmt: { REEL: .6, CAROUSEL: .4 }, cta: ['save', 'save', 'comment', 'share'],
    tpl: [
      ['err', "L'erreur n°1 quand on pose un stratifié : oublier le joint de dilatation."],
      ['list', '3 erreurs de pose qui font gonfler un parquet en moins d’un an.'],
      ['tuto', 'Comment choisir la bonne sous-couche pour votre parquet EGGER, étape par étape.'],
      ['secret', "Ce qu'on ne vous dit pas sur les plinthes : c'est là que tout se joue."],
      ['warn', "Attention : ne posez jamais votre parquet avant d'avoir vérifié ce point."],
    ] },
  tech: { w: .10, reach: .8, like: .8, cm: 1.4, save: 1.6, share: .9, pv: 1.6, fol: 1.2, fmt: { REEL: .55, CAROUSEL: .45 }, cta: ['comment', 'save', 'visit', 'dm'],
    tpl: [
      ['cmp', 'Classe 31 ou classe 32 : laquelle choisir pour votre salon ?'],
      ['demo', "On a versé de l'eau sur le {d} Aqua pendant 24 h. Regardez ce qui se passe."],
      ['myth', 'Idée reçue : « le stratifié ne supporte pas le chauffage au sol ». C’est faux.'],
      ['demo', 'Crash-test : on a rayé un parquet EGGER 8 mm avec des clés.'],
      ['q', '7 mm ou 8 mm : quelle épaisseur pour une maison avec enfants ?'],
    ] },
  deco: { w: .20, reach: 1.25, like: 1.5, cm: .8, save: 1.0, share: .8, pv: .7, fol: .55, fmt: { REEL: .45, CAROUSEL: .25, IMAGE: .3 }, cta: ['none', 'comment', 'visit', 'none'],
    tpl: [
      ['desire', 'Le {room} chaleureux dont vous rêvez commence par le sol : {d} {r}.'],
      ['other', '{d} ({r}) : une teinte naturelle qui éclaire toute la pièce.'],
      ['q', 'Plutôt clair ou plutôt miel pour un {room} lumineux ?'],
      ['list', '5 décors EGGER pour un intérieur style scandinave.'],
      ['desire', 'Un sol comme à l’hôtel pour votre {room} : le {d}.'],
    ] },
  real: { w: .12, reach: 1.05, like: 1.2, cm: 1.1, save: .9, share: 1.0, pv: 1.7, fol: 1.9, fmt: { REEL: .6, CAROUSEL: .4 }, cta: ['follow', 'visit', 'dm', 'none'],
    tpl: [
      ['case', 'Chez Karim à {w} : 120 m² de {d} livrés et posés.'],
      ['case', 'Projet de la semaine : une villa à {w} entièrement en {d}.'],
      ['res', 'Livré en 3 jours : l’appartement de nos clients à {w} en {d}.'],
      ['story', 'Il y a 2 ans, ce client est venu au showroom avec un simple plan. Voici son salon.'],
    ] },
  show: { w: .10, reach: .8, like: 1.0, cm: .9, save: .5, share: .6, pv: 1.4, fol: 1.0, fmt: { REEL: .5, IMAGE: .2, STORY: .3 }, cta: ['visit', 'visit', 'dm', 'none'],
    tpl: [
      ['other', 'Dans les coulisses du showroom de Dar El Beïda : les décors EGGER en vrai.'],
      ['prom', 'Voici comment se passe une visite au showroom : 30 minutes, un conseiller, un devis.'],
      ['story', 'Notre équipe vous présente le décor préféré du mois : {d}.'],
    ] },
  promo: { w: .10, reach: .55, like: .6, cm: 1.2, save: .6, share: .5, pv: 2.0, fol: .8, fmt: { IMAGE: .35, REEL: .25, STORY: .4 }, cta: ['dm', 'visit', 'link', 'dm'],
    tpl: [
      ['news', 'Arrivage : le {d} ({r}) est de nouveau en stock.'],
      ['news', 'Nouveau au showroom : la collection EGGER disponible immédiatement.'],
      ['other', 'Derniers cartons de {d} disponibles avant le réassort.'],
      ['prom', 'Découvrez nos décors en stock et obtenez votre devis sur place.'],
    ] },
  comm: { w: .07, reach: .75, like: .9, cm: 3.0, save: .4, share: .7, pv: .8, fol: .7, fmt: { CAROUSEL: .3, IMAGE: .3, STORY: .4 }, cta: ['comment', 'comment', 'tag', 'comment'],
    tpl: [
      ['q', 'Sondage : vous préférez le {d} ou le Chêne Bardolino ?'],
      ['opin', 'Franchement : le parquet gris, c’est fini ? Donnez-nous votre avis.'],
      ['q', 'Vos questions sur le parquet, on vous répond : quelle pièce rénovez-vous ?'],
    ] },
};
const CTA_TXT = {
  save: 'Enregistrez ce post pour votre chantier.', share: 'Envoyez-le à quelqu’un qui rénove en ce moment.',
  comment: 'Dites-nous en commentaire quelle pièce vous voulez refaire.', dm: 'Écrivez-nous sur WhatsApp au 0549 50 68 57 pour un devis.',
  visit: 'Réservez votre visite au showroom de Dar El Beïda.', link: 'Lien en bio pour voir tous les décors en stock.',
  follow: 'Abonnez-vous pour voir la suite du chantier.', tag: 'Identifiez la personne qui doit voir ça.', none: '',
};
const HOOK_FX = { avap: [1.3, .06], err: [1.2, .05], warn: [1.15, .04], myth: [1.12, .03], demo: [1.28, .07], cmp: [1.08, .02], list: [1.05, .01], tuto: [1, .03], res: [1.1, .03], case: [1.05, .02], secret: [1.02, .02], news: [.8, -.03], pain: [1.12, .03], desire: [1, 0], opin: [1.1, .02], story: [.98, .01], q: [.95, 0], prom: [.88, -.02], other: [.85, -.03] };
const DUR_FX = { d1: [.8, .78], d2: [1.05, .66], d3: [1.15, .6], d4: [1, .5], d5: [.86, .42], d6: [.72, .34], d7: [.6, .26] };
const DOW_FX = [.95, .95, 1, 1, 1.2, 1.12, 1];
const SLOT_FX = { nuit: .6, matin: .85, midi: 1, aprem: .9, soir: 1.25 };

function genDemo() {
  const R = mulberry32(20260928);
  const nrm = () => { let u = 0, v = 0; while (!u) u = R(); while (!v) v = R(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const pick = a => a[Math.floor(R() * a.length)];
  const wpick = o => { const e = Object.entries(o), t = sum(e.map(x => x[1])); let r = R() * t; for (const [k, w] of e) { if ((r -= w) <= 0) return k; } return e[0][0]; };
  const END = '2026-09-27', START = addDays(END, -729);
  const days = diffDays(START, END) + 1;
  const acc = [], posts = [];
  const fut = { reach: new Float64Array(days + 10), pv: new Float64Array(days + 10), fol: new Float64Array(days + 10), clk: new Float64Array(days + 10) };
  const RSPREAD = [.55, .22, .1, .06, .04, .03], FSPREAD = [.6, .25, .15];
  let followers = 5870, id = 0;
  const hours = { 9: 1, 10: 1, 12: 2.4, 13: 2, 17: 1, 18: 1.6, 19: 2.4, 20: 2.6, 21: 1.6, 23: .5 };
  for (let i = 0; i < days; i++) {
    const day = addDays(START, i), dow = toD(day).getUTCDay();
    const gap = day >= '2026-07-18' && day <= '2026-08-09';
    const push = day >= '2026-08-12';
    const ramp = clamp(i / 420, 0, 1); // le compte progresse en qualité sur la 1re année
    let p = gap ? .04 : push ? .68 : .38 + .12 * ramp;
    const nToday = R() < p ? (push && R() < .22 ? 2 : 1) : 0;
    for (let k = 0; k < nToday; k++) {
      const tw = push ? { ...Object.fromEntries(Object.entries(DEMO_THEMES).map(([t, o]) => [t, o.w])), promo: .2, deco: .26, pose: .1 } : Object.fromEntries(Object.entries(DEMO_THEMES).map(([t, o]) => [t, o.w]));
      const th = wpick(tw), T = DEMO_THEMES[th];
      let type = wpick(T.fmt);
      if (type === 'REEL' && R() < .05) type = 'VIDEO';
      const [hk, tpl] = pick(T.tpl);
      const dec = pick(DECORS), city = pick(CITIES), room = pick(ROOMS);
      const cta = type === 'STORY' ? pick(['dm', 'visit', 'none']) : pick(T.cta);
      const hook = tpl.replace('{d}', dec.n).replace('{r}', dec.ref).replace('{w}', city).replace('{room}', room);
      const caption = hook + (CTA_TXT[cta] ? ' ' + CTA_TXT[cta] : '') + (type !== 'STORY' ? ' #parquet #egger #renovation #alger' : '');
      const hr = +wpick(hours), mn = pick([0, 5, 15, 30, 45]);
      const slot = slotOf(hr);
      let dur = null;
      if (type === 'REEL' || type === 'VIDEO') {
        const dk = wpick(th === 'pose' || th === 'tech' ? { d2: 1, d3: 2, d4: 2.2, d5: 1.6, d6: 1, d7: .5 } : { d1: .8, d2: 2, d3: 2.4, d4: 1.4, d5: .8, d6: .4, d7: .2 });
        const lo = { d1: 6, d2: 10, d3: 21, d4: 31, d5: 46, d6: 61, d7: 91 }[dk], hi = { d1: 9, d2: 20, d3: 30, d4: 45, d5: 60, d6: 90, d7: 150 }[dk];
        dur = Math.round(lo + R() * (hi - lo));
      }
      const hf = HOOK_FX[hk] || HOOK_FX.other;
      const df = dur ? DUR_FX[durOf(dur)] : [1, 0];
      const fmtR = { REEL: .34, VIDEO: .2, CAROUSEL: .22, IMAGE: .15, STORY: .11 }[type];
      const quality = (push ? .86 : 1) * (.82 + .3 * ramp);
      let reach = followers * fmtR * T.reach * hf[0] * df[0] * DOW_FX[dow] * SLOT_FX[slot] * quality * Math.exp(nrm() * .45);
      let viral = type === 'REEL' && R() < .03 ? 3 + R() * 4 : 1;
      if (th === 'reno' && type === 'REEL' && R() < .06) viral = Math.max(viral, 2.5 + R() * 3);
      reach *= viral;
      const cf = { save: cta === 'save' ? 1.4 : 1, share: cta === 'share' ? 1.3 : cta === 'tag' ? 1.12 : 1, cm: cta === 'comment' ? 1.6 : cta === 'tag' ? 1.35 : 1, pv: cta === 'visit' || cta === 'link' ? 1.3 : cta === 'dm' ? 1.15 : 1, fol: cta === 'follow' ? 1.18 : 1 };
      const jit = () => Math.exp(nrm() * .3);
      const P = { id: 'exemple-' + (++id), day, time: String(hr).padStart(2, '0') + ':' + String(mn).padStart(2, '0'), type, caption, duration: dur, sponsored: type !== 'STORY' && th === 'promo' && R() < .3, _demo: true };
      P.reach = Math.round(reach);
      if (type === 'STORY') {
        P.impressions = Math.round(reach * 1.18);
        P.views = null; P.likes = null; P.comments = null; P.saves = null;
        P.shares = Math.round(reach * .004 * jit());
        P.replies = Math.round(reach * (cta === 'dm' ? .012 : .004) * jit() * (th === 'promo' ? 1.6 : 1));
        P.profile_visits = Math.round(reach * .012 * T.pv * cf.pv * jit());
        P.follows = Math.round(P.profile_visits * .05 * jit());
        P.avg_watch = null;
      } else {
        const ret = dur ? clamp(df[1] + hf[1] + nrm() * .06, .12, .95) : null;
        P.impressions = Math.round(reach * (1.25 + R() * .25));
        P.views = type === 'REEL' || type === 'VIDEO' ? Math.round(reach * (1.35 + (ret || .5) * .6) * jit()) : Math.round(reach * (type === 'CAROUSEL' ? 1.6 : 1.2) * jit());
        P.likes = Math.round(reach * .042 * T.like * jit() * (viral > 1 ? .8 : 1));
        P.comments = Math.round(reach * .0035 * T.cm * cf.cm * jit());
        P.saves = Math.round(reach * .011 * T.save * cf.save * (type === 'CAROUSEL' ? 1.35 : 1) * (dur && dur > 45 ? 1.15 : 1) * jit());
        P.shares = Math.round(reach * .0075 * T.share * cf.share * (viral > 1 ? 1.35 : 1) * jit());
        P.profile_visits = Math.round(reach * .011 * T.pv * cf.pv * (viral > 1 ? .7 : 1) * jit());
        P.follows = Math.round(P.profile_visits * .13 * T.fol * cf.fol * (viral > 1 ? .75 : 1) * jit());
        P.replies = null;
        P.avg_watch = dur ? Math.round(dur * ret * 10) / 10 : null;
      }
      P.interactions = sum([P.likes, P.comments, P.saves, P.shares]);
      posts.push(P);
      RSPREAD.forEach((w, j) => { fut.reach[i + j] += P.reach * w; fut.pv[i + j] += P.profile_visits * w; });
      FSPREAD.forEach((w, j) => { fut.fol[i + j] += P.follows * w; });
      if (th === 'promo' || cta === 'link' || cta === 'visit') fut.clk[i] += P.profile_visits * .08;
    }
    const gained = Math.round(3 + followers * .0004 + fut.fol[i] + R() * 3);
    const lost = Math.round(followers * .00055 + R() * 2 + (push ? 1.5 : 0));
    followers += gained - lost;
    const reach = Math.round(followers * .045 * Math.exp(nrm() * .15) + fut.reach[i]);
    const pv = Math.round(followers * .0022 * Math.exp(nrm() * .2) + fut.pv[i]);
    acc.push({ day, followers, new_follows: gained, reach, impressions: Math.round(reach * (1.45 + R() * .15)), profile_views: pv, website_clicks: Math.round(pv * .04 + fut.clk[i]) });
  }
  const audience = {
    cities: [['Alger', 41.2], ['Blida', 9.6], ['Oran', 8.1], ['Tipaza', 6.4], ['Boumerdès', 5.9], ['Tizi Ouzou', 4.2], ['Sétif', 3.6], ['Constantine', 3.1], ['Béjaïa', 2.4], ['Annaba', 1.9]],
    countries: [['Algérie', 88.4], ['France', 6.1], ['Canada', 1.4], ['Tunisie', 1.1], ['Autres', 3.0]],
    ages: [['18-24', 11.8], ['25-34', 38.6], ['35-44', 29.4], ['45-54', 13.2], ['55+', 7.0]],
    gender: [['Femmes', 46.5], ['Hommes', 53.5]],
    online: [2, 1, 1, 1, 1, 2, 4, 8, 11, 12, 13, 15, 19, 20, 16, 14, 15, 18, 24, 31, 36, 33, 21, 9],
    followerReachShare: null,
  };
  return { source: 'demo', name: 'lamaisonduparquet (exemple)', posts, account: acc, audience, fields: null };
}

/* ============================================================
   Import Windsor.ai (CSV ou JSON)
   ============================================================ */
const ALIAS = {
  id: ['media_id', 'id', 'media_ig_id', 'post_id', 'story_id', 'ig_media_id'],
  ts: ['timestamp', 'media_timestamp', 'created_time', 'media_created_time', 'story_timestamp', 'published_at'],
  type: ['media_type', 'type', 'story_media_type'],
  ptype: ['media_product_type', 'product_type'],
  caption: ['caption', 'media_caption', 'message', 'text', 'story_caption'],
  permalink: ['media_permalink', 'permalink', 'url', 'link', 'story_permalink'],
  reach: ['media_reach', 'post_reach', 'story_reach', 'reach_media', 'media_reach_total'],
  impressions: ['media_impressions', 'story_impressions', 'post_impressions'],
  views: ['media_views', 'media_plays', 'plays', 'video_views', 'media_video_views', 'media_ig_reels_aggregated_all_plays_count', 'story_views'],
  likes: ['media_like_count', 'like_count', 'likes', 'media_likes'],
  comments: ['media_comments_count', 'comments_count', 'comments', 'media_comments'],
  saves: ['media_saved', 'saved', 'saves', 'media_saves'],
  shares: ['media_shares', 'shares', 'story_shares'],
  interactions: ['media_total_interactions', 'total_interactions', 'media_engagement', 'story_total_interactions'],
  profile_visits: ['media_profile_visits', 'profile_visits', 'story_profile_visits'],
  follows: ['media_follows', 'follows', 'story_follows'],
  replies: ['story_replies', 'replies', 'media_replies'],
  avg_watch: ['media_ig_reels_avg_watch_time', 'ig_reels_avg_watch_time', 'avg_watch_time', 'media_avg_watch_time'],
  total_watch: ['media_ig_reels_video_view_total_time', 'ig_reels_video_view_total_time', 'video_view_total_time'],
  duration: ['media_duration', 'duration', 'video_duration', 'media_video_duration'],
  sponsored: ['is_paid', 'boosted', 'is_boosted', 'ad_id', 'paid'],
  collab: ['collaborators', 'media_collaborators', 'is_collab'],
};
const ACC_ALIAS = {
  day: ['date', 'day', 'date_start'],
  followers: ['followers_count', 'follower_count_total', 'followers_total', 'total_followers'],
  new_follows: ['follower_count', 'new_followers', 'followers_gained', 'follows_and_unfollows_follows'],
  unfollows: ['unfollows', 'follows_and_unfollows_unfollows', 'followers_lost'],
  reach: ['reach', 'account_reach', 'reach_total', 'accounts_reached'],
  impressions: ['impressions', 'account_impressions'],
  views: ['views', 'account_views'],
  profile_views: ['profile_views', 'profile_visits_total'],
  website_clicks: ['website_clicks', 'profile_links_taps', 'total_link_taps', 'link_clicks'],
  messages: ['messaging_conversations_started', 'messages', 'conversations'],
  username: ['username', 'account_name', 'instagram_username'],
};
const pickF = (row, keys) => { for (const k of keys) { if (row[k] !== undefined && row[k] !== '' && row[k] !== null) return row[k]; } return undefined; };
const toNum = v => { if (v === undefined || v === null || v === '') return null; if (typeof v === 'number') return v; const n = parseFloat(String(v).replace(/\s/g, '').replace(',', '.')); return isFinite(n) ? n : null; };

function parseCSV(text) {
  text = text.replace(/^﻿/, '');
  const first = text.split(/\r?\n/)[0] || '';
  const delim = (first.match(/;/g) || []).length > (first.match(/,/g) || []).length ? ';' : (first.includes('\t') ? '\t' : ',');
  const rows = []; let row = [], cur = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
    else if (c === '"') q = true;
    else if (c === delim) { row.push(cur); cur = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cur); rows.push(row); row = []; cur = ''; }
    else cur += c;
  }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  const head = (rows.shift() || []).map(h => h.trim().toLowerCase());
  return rows.filter(r => r.some(x => x.trim())).map(r => Object.fromEntries(head.map((h, i) => [h, r[i]])));
}

function algiersParts(ts) {
  const d = new Date(ts);
  if (isNaN(d)) return null;
  const f = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Algiers', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(d);
  const g = t => f.find(p => p.type === t)?.value;
  return { day: `${g('year')}-${g('month')}-${g('day')}`, time: `${g('hour') === '24' ? '00' : g('hour')}:${g('minute')}` };
}

function normType(t, pt) {
  t = String(t || '').toUpperCase(); pt = String(pt || '').toUpperCase();
  if (pt === 'STORY' || t === 'STORY') return 'STORY';
  if (pt === 'REELS' || t === 'REEL' || t === 'REELS') return 'REEL';
  if (t.includes('CAROUSEL')) return 'CAROUSEL';
  if (t === 'VIDEO') return pt === 'FEED' ? 'VIDEO' : 'REEL';
  if (t === 'IMAGE' || t === 'PHOTO') return 'IMAGE';
  return t ? 'IMAGE' : 'IMAGE';
}

function importRows(rows, fileName) {
  rows = rows.map(r => Object.fromEntries(Object.entries(r).map(([k, v]) => [String(k).trim().toLowerCase(), v])));
  const keys = new Set(rows.flatMap(r => Object.keys(r)));
  const found = {};
  const postMap = new Map(), accMap = new Map();
  const aud = { cities: {}, countries: {}, ages: {}, gender: {} };
  let username = null;
  for (const r of rows) {
    const u = pickF(r, ACC_ALIAS.username); if (u) username = u;
    const pid = pickF(r, ALIAS.id);
    const isPost = pid !== undefined && (pickF(r, ALIAS.type) !== undefined || pickF(r, ALIAS.caption) !== undefined || pickF(r, ALIAS.reach) !== undefined || pickF(r, ALIAS.ts) !== undefined);
    if (isPost) {
      let P = postMap.get(pid);
      if (!P) {
        const ts = pickF(r, ALIAS.ts) || pickF(r, ACC_ALIAS.day);
        const parts = ts ? (String(ts).length > 10 ? algiersParts(ts) : { day: String(ts).slice(0, 10), time: null }) : null;
        P = { id: String(pid), day: parts?.day || null, time: parts?.time || null, type: normType(pickF(r, ALIAS.type), pickF(r, ALIAS.ptype)), caption: pickF(r, ALIAS.caption) || '', permalink: pickF(r, ALIAS.permalink) || null, sponsored: false };
        postMap.set(pid, P);
      }
      for (const m of ['reach', 'impressions', 'views', 'likes', 'comments', 'saves', 'shares', 'interactions', 'profile_visits', 'follows', 'replies', 'avg_watch', 'total_watch', 'duration']) {
        const v = toNum(pickF(r, ALIAS[m]));
        if (v !== null) { found[m] = true; P[m] = Math.max(P[m] ?? -Infinity, v); }
      }
      const sp = pickF(r, ALIAS.sponsored); if (sp !== undefined && sp !== '' && sp !== '0' && String(sp).toLowerCase() !== 'false') { P.sponsored = true; found.sponsored = true; }
      const cb = pickF(r, ALIAS.collab); if (cb) { P.collab = true; found.collab = true; }
      if (!P.caption) P.caption = pickF(r, ALIAS.caption) || '';
      continue;
    }
    const day = pickF(r, ACC_ALIAS.day);
    // audience (lignes dimension + valeur)
    const dimVal = toNum(pickF(r, ['value', 'follower_count_value', 'audience_value', 'count', 'followers']));
    const city = pickF(r, ['audience_city', 'city', 'audience_city_name']); const country = pickF(r, ['audience_country', 'country', 'audience_country_name']);
    const ag = pickF(r, ['audience_gender_age', 'gender_age', 'age_gender']); const age = pickF(r, ['audience_age', 'age']); const gen = pickF(r, ['audience_gender', 'gender']);
    if (dimVal !== null && (city || country || ag || age || gen)) {
      if (city) aud.cities[city] = (aud.cities[city] || 0) + dimVal;
      if (country) aud.countries[country] = (aud.countries[country] || 0) + dimVal;
      if (ag) { const [g, a] = String(ag).split('.'); if (a) aud.ages[a] = (aud.ages[a] || 0) + dimVal; if (g) aud.gender[g] = (aud.gender[g] || 0) + dimVal; }
      if (age) aud.ages[age] = (aud.ages[age] || 0) + dimVal;
      if (gen) aud.gender[gen] = (aud.gender[gen] || 0) + dimVal;
      continue;
    }
    if (day) {
      const d = String(day).slice(0, 10);
      const A = accMap.get(d) || { day: d };
      for (const m of ['followers', 'new_follows', 'unfollows', 'reach', 'impressions', 'views', 'profile_views', 'website_clicks', 'messages']) {
        const v = toNum(pickF(r, ACC_ALIAS[m]));
        if (v !== null) { found['acc_' + m] = true; A[m] = (m === 'followers') ? Math.max(A[m] ?? 0, v) : (A[m] ?? 0) + v; }
      }
      accMap.set(d, A);
    }
  }
  const toPct = o => { const e = Object.entries(o); const t = sum(e.map(x => x[1])); return t ? e.sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, v]) => [k, Math.round(v / t * 1000) / 10]) : null; };
  const G = { F: 'Femmes', M: 'Hommes', U: 'Non précisé', f: 'Femmes', m: 'Hommes', female: 'Femmes', male: 'Hommes' };
  const audience = { cities: toPct(aud.cities), countries: toPct(aud.countries), ages: toPct(aud.ages)?.sort((a, b) => a[0].localeCompare(b[0])), gender: toPct(Object.fromEntries(Object.entries(aud.gender).map(([k, v]) => [G[k] || k, v]))), online: null, followerReachShare: null };
  const posts = [...postMap.values()].filter(p => p.day);
  posts.forEach(p => { if (!isNum(p.interactions)) { const s = [p.likes, p.comments, p.saves, p.shares].filter(isNum); p.interactions = s.length ? sum(s) : null; } if (isNum(p.avg_watch) && p.avg_watch > 600) p.avg_watch = p.avg_watch / 1000; });
  const account = [...accMap.values()].sort((a, b) => a.day.localeCompare(b.day));
  return { posts, account, audience, found, keys: [...keys], fileName, username };
}

function mergeImports(parts) {
  const posts = new Map(), acc = new Map(); const found = {}; const aud = {}; let username = null; const names = [];
  for (const p of parts) {
    p.posts.forEach(x => posts.set(x.id, { ...(posts.get(x.id) || {}), ...x }));
    p.account.forEach(x => acc.set(x.day, { ...(acc.get(x.day) || {}), ...x }));
    Object.assign(found, p.found);
    for (const k of ['cities', 'countries', 'ages', 'gender']) if (p.audience[k]) aud[k] = p.audience[k];
    if (p.username) username = p.username;
    names.push(p.fileName);
  }
  return { source: 'import', name: username ? '@' + username : 'Compte importé', files: names, posts: [...posts.values()], account: [...acc.values()].sort((a, b) => a.day.localeCompare(b.day)), audience: { cities: null, countries: null, ages: null, gender: null, online: null, ...aud }, fields: found };
}

/* ============================================================
   Enrichissement : déductions + score
   ============================================================ */
const METRICS = ['reach', 'impressions', 'views', 'likes', 'comments', 'saves', 'shares', 'interactions', 'profile_visits', 'follows', 'replies', 'avg_watch', 'duration', 'clicks'];
const ACC_METRICS = ['followers', 'new_follows', 'unfollows', 'reach', 'impressions', 'views', 'profile_views', 'website_clicks', 'messages'];

const WEIGHTS = {
  equilibre: { reach: 20, retention: 20, shares: 15, saves: 15, comments: 10, pv: 10, follows: 10 },
  portee: { reach: 40, retention: 20, shares: 20, saves: 5, comments: 5, pv: 5, follows: 5 },
  croissance: { reach: 10, retention: 10, shares: 10, saves: 10, comments: 5, pv: 25, follows: 30 },
  leads: { reach: 10, retention: 10, shares: 5, saves: 15, comments: 10, pv: 35, follows: 15 },
  communaute: { reach: 10, retention: 10, shares: 15, saves: 10, comments: 40, pv: 5, follows: 10 },
};
const WLABEL = { reach: 'Portée et lectures', retention: 'Rétention', shares: 'Partages', saves: 'Enregistrements', comments: 'Commentaires', pv: 'Visites du profil', follows: 'Abonnés générés' };

function gradeOf(s) {
  if (!isNum(s)) return { id: 'na', name: 'Non noté', c: 'var(--data-soft)' };
  if (s >= 88) return { id: 'ex', name: 'Exceptionnelle', c: 'var(--good)' };
  if (s >= 74) return { id: 'tb', name: 'Très bonne', c: 'color-mix(in srgb,var(--good) 78%,var(--data-2))' };
  if (s >= 60) return { id: 'b', name: 'Bonne', c: 'color-mix(in srgb,var(--good) 50%,var(--data-2))' };
  if (s >= 42) return { id: 'm', name: 'Dans la moyenne', c: 'var(--data-2)' };
  if (s >= 28) return { id: 'em', name: 'En dessous de la moyenne', c: 'color-mix(in srgb,var(--bad) 45%,var(--data-2))' };
  if (s >= 14) return { id: 'mv', name: 'Mauvaise', c: 'color-mix(in srgb,var(--bad) 75%,var(--data-2))' };
  return { id: 'tm', name: 'Très mauvaise', c: 'var(--bad)' };
}

function followersAt(D, day) {
  const a = D.account; if (!a.length || !a.some(x => isNum(x.followers))) return null;
  let lo = 0, hi = a.length - 1, best = null;
  while (lo <= hi) { const m = (lo + hi) >> 1; if (a[m].day <= day) { best = a[m]; lo = m + 1; } else hi = m - 1; }
  return (best && isNum(best.followers)) ? best.followers : a.find(x => isNum(x.followers))?.followers ?? null;
}

function enrich(D, goal) {
  const allDays = [...D.posts.map(p => p.day), ...D.account.map(a => a.day)].filter(Boolean).sort();
  D.minDay = allDays[0]; D.maxDay = allDays[allDays.length - 1];
  D.ref = addDays(D.maxDay, 1);
  // disponibilité des métriques
  D.avail = {};
  for (const m of METRICS) D.avail[m] = D.posts.some(p => isNum(p[m]));
  for (const m of ACC_METRICS) D.avail['acc_' + m] = D.account.some(a => isNum(a[m]));
  D.avail.sponsored = D.source === 'demo' || !!D.fields?.sponsored;
  D.avail.collab = !!D.fields?.collab;
  const themeCount = {};
  const sorted = [...D.posts].sort((a, b) => (a.day + (a.time || '')).localeCompare(b.day + (b.time || '')));
  sorted.forEach((p, i) => {
    const cap = String(p.caption || '');
    const firstLine = cap.split(/(?<=[.!?…])\s|\n/)[0].trim();
    p.hookText = firstLine.slice(0, 160);
    p.theme = (THEMES.find(t => t.re.test(firstLine)) || THEMES.find(t => t.re.test(cap.replace(/#[\wÀ-ÿ]+/g, ''))) || THEME_OTHER).id;
    p.hook = (HOOKS.find(h => h.re.test(firstLine)) || HOOK_OTHER).id;
    const rest = cap.slice(firstLine.length);
    p.cta = (CTAS.find(c => c.re.test(rest)) || (/\?\s*$/.test(firstLine) && p.theme === 'comm' ? CTAS.find(c => c.id === 'comment') : null) || CTA_NONE).id;
    p.category = themeById(p.theme).cat;
    const prod = cap.match(/EL\d{4}/); p.product = prod ? prod[0] : null;
    p.collab = p.collab || /@[\w.]+/.test(cap.replace(/#\w+/g, ''));
    const hr = p.time ? +p.time.slice(0, 2) : null;
    p.hour = hr; p.slot = hr === null ? null : slotOf(hr);
    p.dow = toD(p.day).getUTCDay();
    p.durB = durOf(p.duration);
    p.age = diffDays(p.day, D.ref);
    p.recent = p.age < 3;
    p.fol0 = followersAt(D, p.day);
    // taux
    p.er = ratio(p.interactions, p.reach);
    p.erF = ratio(p.interactions, p.fol0);
    p.saveR = ratio(p.saves, p.reach); p.shareR = ratio(p.shares, p.reach); p.cmR = ratio(p.comments, p.reach);
    p.pvR = ratio(p.profile_visits, p.reach); p.folR = ratio(p.follows, p.reach); p.fol1k = isNum(p.folR) ? p.folR * 1000 : null;
    p.pvFol = ratio(p.follows, p.profile_visits);
    p.ret = isNum(p.avg_watch) && isNum(p.duration) && p.duration > 0 ? clamp(p.avg_watch / p.duration, 0, 1.5) : null;
    const af = 1 - Math.exp(-(p.age + .3) / 2.2); // maturité : une publication récente n'a pas fini de circuler
    p.reachAdj = isNum(p.reach) ? p.reach / Math.max(af, .25) : null;
    p.reachN = isNum(p.reachAdj) ? (p.fol0 ? p.reachAdj / p.fol0 : p.reachAdj) : null;
    // lassitude : même thème publié 3 fois ou plus dans les 14 jours précédents
    const prev = sorted.slice(Math.max(0, i - 12), i).filter(q => q.theme === p.theme && diffDays(q.day, p.day) <= 14).length;
    p.fatigue = prev >= 3;
    themeCount[p.theme] = (themeCount[p.theme] || 0) + 1;
  });
  score(D, goal);
  return D;
}

/* rang centile de v dans le tableau trié s */
function pctRank(s, v) {
  if (!isNum(v) || !s.length) return null;
  let lo = 0, hi = s.length; while (lo < hi) { const m = (lo + hi) >> 1; if (s[m] < v) lo = m + 1; else hi = m; }
  let eq = lo; while (eq < s.length && s[eq] === v) eq++;
  return ((lo + eq) / 2) / s.length;
}

function score(D, goal) {
  const W = WEIGHTS[goal] || WEIGHTS.equilibre;
  const comp = { reach: p => p.reachN, retention: p => p.ret, shares: p => p.shareR, saves: p => p.saveR, comments: p => p.cmR, pv: p => p.pvR, follows: p => p.folR };
  const byF = {};
  D.posts.forEach(p => (byF[p.type] = byF[p.type] || []).push(p));
  D.formatMed = {};
  for (const [f, arr] of Object.entries(byF)) {
    const base = arr.filter(p => !p.recent);
    const ref = base.length >= 3 ? base : arr;
    const dist = {};
    for (const k in comp) dist[k] = vals(ref, comp[k]).sort((a, b) => a - b);
    D.formatMed[f] = { reach: median(vals(ref, p => p.reach)), reachAdj: median(vals(ref, p => p.reachAdj)), views: median(vals(ref, p => p.views)), saves: median(vals(ref, p => p.saves)), shares: median(vals(ref, p => p.shares)), comments: median(vals(ref, p => p.comments)), likes: median(vals(ref, p => p.likes)), profile_visits: median(vals(ref, p => p.profile_visits)), follows: median(vals(ref, p => p.follows)), interactions: median(vals(ref, p => p.interactions)), er: median(vals(ref, p => p.er)), ret: median(vals(ref, p => p.ret)), saveR: median(vals(ref, p => p.saveR)), shareR: median(vals(ref, p => p.shareR)), cmR: median(vals(ref, p => p.cmR)), pvR: median(vals(ref, p => p.pvR)), folR: median(vals(ref, p => p.folR)), avg_watch: median(vals(ref, p => p.avg_watch)), n: ref.length };
    for (const p of arr) {
      let tw = 0, ts = 0; p.parts = {};
      for (const k in comp) {
        const r = pctRank(dist[k], comp[k](p));
        if (r === null || dist[k].length < 3) continue;
        p.parts[k] = r; tw += W[k]; ts += W[k] * r;
      }
      p.score = tw ? Math.round(ts / tw * 100) : null;
      p.grade = gradeOf(p.score);
      const M = D.formatMed[f];
      p.idx = { reach: ratio(p.reachAdj, M.reachAdj), views: ratio(p.views, M.views), saves: ratio(p.saves, M.saves), shares: ratio(p.shares, M.shares), comments: ratio(p.comments, M.comments), pv: ratio(p.profile_visits, M.profile_visits), follows: ratio(p.follows, M.follows), er: ratio(p.er, M.er), ret: ratio(p.ret, M.ret), saveR: ratio(p.saveR, M.saveR), shareR: ratio(p.shareR, M.shareR), cmR: ratio(p.cmR, M.cmR), pvR: ratio(p.pvR, M.pvR), folR: ratio(p.folR, M.folR) };
      // objectif atteint : la dimension la plus au-dessus de la médiane du format
      const cand = [['portee', p.parts.reach], ['croissance', p.parts.follows], ['autorite', p.parts.saves], ['communaute', p.parts.comments], ['consideration', p.parts.pv], ['conversion', p.type === 'STORY' && isNum(p.replies) ? pctRank(vals(arr, q => ratio(q.replies, q.reach)).sort((a, b) => a - b), ratio(p.replies, p.reach)) : null]].filter(x => isNum(x[1]));
      cand.sort((a, b) => b[1] - a[1]);
      p.objective = cand[0]?.[0] || 'portee';
      p.viral = isNum(p.idx.reach) && p.idx.reach >= 3;
    }
  }
}

/* groupement + confiance */
function groupBy(posts, keyFn) {
  const m = new Map();
  for (const p of posts) { const k = keyFn(p); if (k === null || k === undefined) continue; if (!m.has(k)) m.set(k, []); m.get(k).push(p); }
  return m;
}
function gstats(arr) {
  const g = f => vals(arr, f);
  const sc = g(p => p.score);
  return {
    n: arr.length, posts: arr,
    reachSum: sum(g(p => p.reach)), reach: mean(g(p => p.reach)), reachMed: median(g(p => p.reach)),
    impressions: mean(g(p => p.impressions)), views: mean(g(p => p.views)), viewsMed: median(g(p => p.views)),
    inter: mean(g(p => p.interactions)), likes: mean(g(p => p.likes)), saves: mean(g(p => p.saves)), shares: mean(g(p => p.shares)), comments: mean(g(p => p.comments)),
    pv: mean(g(p => p.profile_visits)), follows: mean(g(p => p.follows)), followsSum: sum(g(p => p.follows)), er: median(g(p => p.er)), erMean: mean(g(p => p.er)),
    ret: median(g(p => p.ret)), watch: median(g(p => p.avg_watch)), full: g(p => p.ret).length ? g(p => p.ret).filter(r => r >= .9).length / g(p => p.ret).length : null,
    saveR: median(g(p => p.saveR)), shareR: median(g(p => p.shareR)), cmR: median(g(p => p.cmR)), pvR: median(g(p => p.pvR)), folR: median(g(p => p.folR)), fol1k: median(g(p => p.fol1k)),
    score: mean(sc), scoreMed: median(sc), scoreP25: quant(sc, .25), scoreP75: quant(sc, .75),
    top: sc.length ? arr.reduce((b, p) => (p.reach || 0) > (b.reach || 0) ? p : b, arr[0]) : null,
    topShare: (() => { const t = sum(g(p => p.reach)); const mx = Math.max(0, ...g(p => p.reach)); return t ? mx / t : null; })(),
    spread: (() => { const q1 = quant(sc, .25), q3 = quant(sc, .75); return isNum(q1) ? q3 - q1 : null; })(),
  };
}
function confOf(n, spread) {
  if (n >= 12 && (spread === null || spread < 40)) return { id: 'hi', name: 'Confiance élevée', why: `${n} publications, résultats réguliers` };
  if (n >= 6) return { id: 'md', name: 'Confiance moyenne', why: `${n} publications${spread !== null && spread >= 40 ? ', résultats dispersés' : ''}` };
  return { id: 'lo', name: 'Confiance faible', why: `seulement ${n} publication${n > 1 ? 's' : ''}` };
}
