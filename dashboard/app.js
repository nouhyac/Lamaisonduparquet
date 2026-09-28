'use strict';
/* app.js : état, analyse de la période, coque d'interface, 5 premiers onglets */

const TABS = [
  ['resume', 'Résumé exécutif'], ['evolution', 'Évolution'], ['contenu', 'Contenu'], ['top', 'Meilleurs reels'], ['flop', 'Moins bons reels'],
  ['themes', 'Thèmes'], ['formats', 'Formats et durées'], ['accroches', 'Accroches et CTA'], ['horaires', 'Horaires'], ['audience', 'Audience'],
  ['conversions', 'Conversions'], ['opportunites', 'Opportunités'], ['plan', "Plan d'action"], ['calendrier', 'Calendrier'], ['experiences', 'Expériences'],
  ['rapport', 'Rapport'], ['donnees', 'Données'],
];
const PERIODS = [['7', '7 j'], ['30', '30 j'], ['60', '60 j'], ['90', '90 j'], ['180', '180 j'], ['365', '365 j'], ['custom', 'Personnalisée']];
const FILTERS = [
  { k: 'type', label: 'Type de contenu', opts: () => Object.entries(FORMATS).map(([k, f]) => [k, f.name]) },
  { k: 'theme', label: 'Thème (déduit)', opts: () => [...THEMES, THEME_OTHER].map(t => [t.id, t.name]) },
  { k: 'category', label: 'Catégorie (déduite)', opts: () => [...new Set([...THEMES, THEME_OTHER].map(t => t.cat))].map(c => [c, c]) },
  { k: 'objective', label: 'Objectif atteint (calcul)', opts: () => Object.entries(OBJECTIVES).map(([k, o]) => [k, o.name]) },
  { k: 'hook', label: "Type d'accroche (déduit)", opts: () => [...HOOKS, HOOK_OTHER].map(h => [h.id, h.name]) },
  { k: 'cta', label: "Appel à l'action (déduit)", opts: () => [...CTAS, CTA_NONE].map(c => [c.id, c.name]) },
  { k: 'product', label: 'Produit mis en avant (déduit)', opts: () => DECORS.map(d => [d.ref, d.ref + ' · ' + d.n]).concat([['__none', 'Aucun décor cité']]) },
  { k: 'dur', label: 'Durée de la vidéo', opts: () => DUR.map(d => [d.id, d.name]) },
  { k: 'dow', label: 'Jour de la semaine', opts: () => DOW_ORDER.map(d => [String(d), DOW[d]]) },
  { k: 'slot', label: 'Tranche horaire', opts: () => SLOTS.map(s => [s.id, s.name]) },
  { k: 'paid', label: 'Organique / sponsorisé', opts: () => [['org', 'Organique'], ['paid', 'Sponsorisé']], need: 'sponsored' },
  { k: 'collab', label: 'Collaboration (mention @)', opts: () => [['yes', 'Avec mention'], ['no', 'Sans mention']] },
  { k: 'audio', label: 'Audio utilisé', na: true }, { k: 'trend', label: 'Tendance utilisée', na: true }, { k: 'campaign', label: 'Campagne', na: true },
];

const S = { raw: null, D: null, period: '90', from: null, to: null, cmp: 'prev', goal: 'equilibre', tab: 'resume', f: {}, sort: { k: 'score', d: -1 }, preset: 'all', q: '', evoM: 'followers', evoG: 'day', imports: [] };
try { const s = JSON.parse(localStorage.getItem('ig-egger-ui') || '{}'); ['period', 'cmp', 'goal', 'tab', 'from', 'to'].forEach(k => { if (s[k]) S[k] = s[k]; }); } catch (e) { }
const saveUI = () => { try { localStorage.setItem('ig-egger-ui', JSON.stringify({ period: S.period, cmp: S.cmp, goal: S.goal, tab: S.tab, from: S.from, to: S.to })); } catch (e) { } };

/* ---------- plages ---------- */
function range() {
  const D = S.D;
  if (S.period === 'custom' && S.from && S.to && S.from <= S.to) return [S.from, S.to];
  const n = +(S.period === 'custom' ? 90 : S.period);
  return [addDays(D.maxDay, -(n - 1)), D.maxDay];
}
function cmpRange(from, to) {
  const n = diffDays(from, to) + 1, D = S.D;
  switch (S.cmp) {
    case 'yoy': return { from: addDays(from, -365), to: addDays(to, -365), scale: 1, label: 'même période N-1' };
    case 'avg30': return { from: addDays(D.maxDay, -29), to: D.maxDay, scale: n / 30, label: 'moyenne des 30 derniers jours' };
    case 'avg90': return { from: addDays(D.maxDay, -89), to: D.maxDay, scale: n / 90, label: 'moyenne des 90 derniers jours' };
    case 'hist': { const days = diffDays(D.minDay, D.maxDay) + 1; return { from: D.minDay, to: D.maxDay, scale: n / days, label: 'moyenne historique' }; }
    default: return { from: addDays(from, -n), to: addDays(from, -1), scale: 1, label: 'période précédente' };
  }
}
const passF = p => {
  const f = S.f;
  if (f.type && p.type !== f.type) return false;
  if (f.theme && p.theme !== f.theme) return false;
  if (f.category && p.category !== f.category) return false;
  if (f.objective && p.objective !== f.objective) return false;
  if (f.hook && p.hook !== f.hook) return false;
  if (f.cta && p.cta !== f.cta) return false;
  if (f.product && (f.product === '__none' ? p.product : p.product !== f.product)) return false;
  if (f.dur && p.durB !== f.dur) return false;
  if (f.dow && String(p.dow) !== f.dow) return false;
  if (f.slot && p.slot !== f.slot) return false;
  if (f.paid && (f.paid === 'paid') !== !!p.sponsored) return false;
  if (f.collab && (f.collab === 'yes') !== !!p.collab) return false;
  return true;
};
const postsIn = (from, to, filt = true) => S.D.posts.filter(p => p.day >= from && p.day <= to && (!filt || passF(p)));
const accIn = (from, to) => S.D.account.filter(a => a.day >= from && a.day <= to);
const nFilters = () => Object.values(S.f).filter(Boolean).length;

/* ---------- KPI ---------- */
function kpiVals(from, to) {
  const D = S.D, P = postsIn(from, to), A = accIn(from, to), n = diffDays(from, to) + 1;
  const accAt = d => { let b = null; for (const a of D.account) { if (a.day <= d && isNum(a.followers)) b = a; else if (a.day > d) break; } return b?.followers ?? null; };
  const fEnd = accAt(to), fStart = accAt(addDays(from, -1));
  const g = m => { const v = vals(P, p => p[m]); return v.length ? sum(v) : null; };
  const ga = m => { const v = vals(A, a => a[m]); return v.length ? sum(v) : null; };
  const gained = ga('new_follows'), net = isNum(fEnd) && isNum(fStart) ? fEnd - fStart : null;
  const unf = ga('unfollows');
  const inter = g('interactions'), reachP = g('reach');
  return {
    followers: fEnd, gained, lost: isNum(unf) ? unf : (isNum(gained) && isNum(net) ? Math.max(0, gained - net) : null), lostCalc: !isNum(unf),
    net, growth: isNum(net) && fStart ? net / fStart : null,
    reach: ga('reach') ?? reachP, reachAcc: isNum(ga('reach')), impressions: ga('impressions') ?? g('impressions'), views: g('views') ?? ga('views'),
    inter, likes: g('likes'), comments: g('comments'), saves: g('saves'), shares: g('shares'),
    pv: ga('profile_views') ?? g('profile_visits'), clicks: ga('website_clicks'), messages: ga('messages') ?? g('replies'), msgIsReplies: !isNum(ga('messages')) && isNum(g('replies')),
    posts: P.length, freq: P.length / n * 7,
    interPost: P.length && isNum(inter) ? inter / P.length : null, erReach: ratio(inter, reachP), erFol: P.length && isNum(inter) && fEnd ? inter / P.length / fEnd : null,
    reachPost: P.length && isNum(reachP) ? reachP / P.length : null, viewsPost: P.length && isNum(g('views')) ? g('views') / P.length : null,
    folPost: P.length && isNum(g('follows')) ? g('follows') / P.length : null, scoreMed: median(vals(P, p => p.score)),
  };
}
const KPI = [
  { g: 'Audience', k: 'followers', l: 'Abonnés actuels', pv: 'ig', add: false, acc: 'followers' },
  { g: 'Audience', k: 'gained', l: 'Abonnés gagnés', pv: 'ig', add: true, acc: 'new_follows' },
  { g: 'Audience', k: 'lost', l: 'Abonnés perdus', pv: 'calc', add: true, bad: true, note: 'Estimation : gagnés − croissance nette' },
  { g: 'Audience', k: 'net', l: 'Croissance nette', pv: 'calc', add: true },
  { g: 'Audience', k: 'growth', l: 'Croissance', pv: 'calc', add: true, f: v => fmtP(v, 2) },
  { g: 'Visibilité', k: 'reach', l: 'Portée totale', pv: 'ig', add: true, acc: 'reach', note: 'Somme des portées quotidiennes du compte' },
  { g: 'Visibilité', k: 'impressions', l: 'Impressions totales', pv: 'ig', add: true, acc: 'impressions' },
  { g: 'Visibilité', k: 'views', l: 'Lectures totales', pv: 'ig', add: true },
  { g: 'Visibilité', k: 'reachPost', l: 'Portée moyenne / publication', pv: 'calc', add: false },
  { g: 'Visibilité', k: 'viewsPost', l: 'Vues moyennes / publication', pv: 'calc', add: false },
  { g: 'Engagement', k: 'inter', l: 'Interactions totales', pv: 'ig', add: true },
  { g: 'Engagement', k: 'likes', l: "J'aime", pv: 'ig', add: true },
  { g: 'Engagement', k: 'comments', l: 'Commentaires', pv: 'ig', add: true },
  { g: 'Engagement', k: 'saves', l: 'Enregistrements', pv: 'ig', add: true },
  { g: 'Engagement', k: 'shares', l: 'Partages', pv: 'ig', add: true },
  { g: 'Engagement', k: 'interPost', l: 'Engagement moyen / publication', pv: 'calc', add: false },
  { g: 'Engagement', k: 'erReach', l: 'Engagement / portée', pv: 'calc', add: false, f: v => fmtP(v, 2) },
  { g: 'Engagement', k: 'erFol', l: 'Engagement / abonnés', pv: 'calc', add: false, f: v => fmtP(v, 2) },
  { g: 'Business', k: 'pv', l: 'Visites du profil', pv: 'ig', add: true, acc: 'profile_views' },
  { g: 'Business', k: 'clicks', l: 'Clics sur les liens', pv: 'ig', add: true, acc: 'website_clicks' },
  { g: 'Business', k: 'messages', l: 'Messages privés', pv: 'ig', add: true },
  { g: 'Business', k: 'folPost', l: 'Abonnés gagnés / publication', pv: 'calc', add: false, f: fmt1 },
  { g: 'Rythme', k: 'posts', l: 'Contenus publiés', pv: 'ig', add: true },
  { g: 'Rythme', k: 'freq', l: 'Publications / semaine', pv: 'calc', add: false, f: fmt1 },
];
function delta(cur, prev) {
  if (!isNum(cur) || !isNum(prev)) return null;
  const abs = cur - prev, pct = prev !== 0 ? abs / Math.abs(prev) : null;
  return { abs, pct, dir: pct === null ? (abs > 0 ? 1 : abs < 0 ? -1 : 0) : Math.abs(pct) < .03 ? 0 : pct > 0 ? 1 : -1 };
}

/* ---------- analyse de la période (recalculée à chaque changement) ---------- */
let A = null;
function analyze() {
  const D = S.D, [from, to] = range(), n = diffDays(from, to) + 1, C = cmpRange(from, to);
  const P = postsIn(from, to), Pc = postsIn(C.from, C.to);
  const K = kpiVals(from, to), Kc0 = kpiVals(C.from, C.to);
  const Kc = {}; for (const d of KPI) { const v = Kc0[d.k]; Kc[d.k] = d.add && isNum(v) && C.scale !== 1 ? (d.k === 'growth' ? v * C.scale : v * C.scale) : v; }
  if (S.cmp !== 'prev' && S.cmp !== 'yoy') { Kc.followers = kpiVals(addDays(from, -n), addDays(from, -1)).followers; }
  const baseNeeded = P.length < 30;
  const base = baseNeeded ? postsIn(addDays(to, -179), to) : P;
  const baseLabel = baseNeeded ? `180 derniers jours (${base.length} publications), car la période compte moins de 30 publications` : `période sélectionnée (${base.length} publications)`;
  const grp = (arr, fn, meta) => [...groupBy(arr, fn)].map(([k, a]) => { const st = gstats(a); return { id: k, ...meta(k), ...st, conf: confOf(st.n, st.spread) }; });
  const reelsOf = arr => arr.filter(p => p.type === 'REEL' || p.type === 'VIDEO');
  const acct = { reach: median(vals(base, p => p.reach)), saveR: median(vals(base, p => p.saveR)), shareR: median(vals(base, p => p.shareR)), cmR: median(vals(base, p => p.cmR)), pvR: median(vals(base, p => p.pvR)), folR: median(vals(base, p => p.folR)), fol1k: median(vals(base, p => p.fol1k)), score: median(vals(base, p => p.score)), er: median(vals(base, p => p.er)), ret: median(vals(base, p => p.ret)) };
  const a = {
    from, to, n, C, P, Pc, K, Kc, base, baseLabel, baseNeeded, acct,
    themes: grp(base, p => p.theme, k => ({ name: themeById(k).name, cat: themeById(k).cat })),
    formats: grp(base, p => p.type, k => ({ name: FORMATS[k]?.name || k })),
    hooks: grp(base, p => p.hook, k => ({ name: hookById(k).name })),
    ctas: grp(base, p => p.cta, k => ({ name: ctaById(k).name })),
    dows: grp(base, p => p.dow, k => ({ name: DOW[k] })),
    slots: grp(base.filter(p => p.slot), p => p.slot, k => ({ name: SLOTS.find(s => s.id === k).name })),
    durs: grp(reelsOf(base).filter(p => p.durB), p => p.durB, k => ({ name: DUR.find(d => d.id === k).name })),
    objectives: grp(base, p => p.objective, k => ({ name: OBJECTIVES[k].name })),
    cells: {},
    reelsP: reelsOf(P), reelsBase: reelsOf(base),
  };
  for (const [k, arr] of groupBy(base.filter(p => p.slot), p => p.dow + '|' + p.slot)) {
    const sc = vals(arr, p => p.score), rc = vals(arr, p => p.reach);
    a.cells[k] = { n: arr.length, v: median(sc), mean: mean(sc), skew: arr.length >= 2 && Math.max(...rc) > 3 * (median(rc) || 1) };
  }
  const order = key => (x, y) => (y[key] ?? -1) - (x[key] ?? -1);
  a.themes.sort(order('scoreMed')); a.formats.sort(order('scoreMed')); a.hooks.sort(order('scoreMed')); a.ctas.sort(order('scoreMed')); a.durs.sort(order('scoreMed'));
  const ok = (arr, min = 4) => arr.filter(x => x.n >= min);
  a.bestTheme = ok(a.themes)[0] || a.themes[0];
  a.worstTheme = ok(a.themes).slice(-1)[0];
  const by = (arr, key, min = 4) => [...ok(arr, min)].sort(order(key));
  a.tReach = by(a.themes, 'reachMed')[0]; a.tSave = by(a.themes, 'saveR')[0]; a.tShare = by(a.themes, 'shareR')[0]; a.tCom = by(a.themes, 'cmR')[0]; a.tPv = by(a.themes, 'pvR')[0]; a.tFol = by(a.themes, 'fol1k')[0];
  a.hBest = ok(a.hooks, 3)[0] || a.hooks[0]; a.hWorst = ok(a.hooks, 3).slice(-1)[0];
  a.hShare = by(a.hooks, 'shareR', 3)[0]; a.hSave = by(a.hooks, 'saveR', 3)[0]; a.hCom = by(a.hooks, 'cmR', 3)[0]; a.hFol = by(a.hooks, 'fol1k', 3)[0]; a.hReach = by(a.hooks, 'reachMed', 3)[0];
  a.fBest = ok(a.formats, 3)[0] || a.formats[0];
  a.dBest = ok(a.durs, 3)[0]; a.dSecond = ok(a.durs, 3)[1];
  a.ctaBest = ok(a.ctas, 3).filter(c => c.id !== 'none')[0];
  a.cSave = by(a.ctas, 'saveR', 3).find(c => c.id !== 'none'); a.cCom = by(a.ctas, 'cmR', 3).find(c => c.id !== 'none'); a.cPv = by(a.ctas, 'pvR', 3).find(c => c.id !== 'none'); a.cShare = by(a.ctas, 'shareR', 3).find(c => c.id !== 'none'); a.cFol = by(a.ctas, 'fol1k', 3).find(c => c.id !== 'none');
  a.dowsRank = by(a.dows, 'scoreMed', 3); a.slotsRank = by(a.slots, 'scoreMed', 3);
  a.cellsRank = Object.entries(a.cells).filter(([, c]) => c.n >= 3).sort((x, y) => y[1].v - x[1].v);
  a.state = accountState(a);
  a.alerts = buildAlerts(a);
  a.opps = buildOpps(a);
  return a;
}

/* ---------- état du compte ---------- */
function accountState(a) {
  const { K, Kc, P, Pc } = a, out = [];
  const dR = delta(K.reach, Kc.reach), dF = delta(K.gained ?? K.folPost, Kc.gained ?? Kc.folPost), dN = delta(K.posts, Kc.posts);
  const sNow = median(vals(P, p => p.score)), sPrev = median(vals(Pc, p => p.score));
  const topShare = (() => { const r = vals(P, p => p.reach); const t = sum(r); return t && r.length >= 4 ? Math.max(...r) / t : null; })();
  if (dR && dF && dR.pct > .1 && dF.pct > .1) out.push({ id: 'croissance', name: 'En croissance', tone: 'good', why: `portée ${signed(dR.pct, v => fmtP(v, 0))} et abonnés gagnés ${signed(dF.pct, v => fmtP(v, 0))} vs ${a.C.label}` });
  else if (dR && dR.pct < -.15) out.push({ id: 'perte', name: 'En perte de performance', tone: 'bad', why: `portée ${signed(dR.pct, v => fmtP(v, 0))} vs ${a.C.label}` });
  else if (dR && Math.abs(dR.pct) <= .1) out.push({ id: 'stagnation', name: 'En stagnation', tone: 'warn', why: `portée stable (${signed(dR.pct, v => fmtP(v, 0))})` });
  if (dN && isNum(sNow) && isNum(sPrev)) {
    if (dN.pct > .15 && sNow < sPrev - 4) out.push({ id: 'plusmoins', name: 'Publie davantage, avec de moins bons résultats', tone: 'bad', why: `${K.posts} publications (${signed(dN.pct, v => fmtP(v, 0))}), score médian ${Math.round(sNow)} contre ${Math.round(sPrev)}` });
    if (dN.pct < -.15 && sNow > sPrev + 4) out.push({ id: 'moinsmieux', name: 'Publie moins, avec de meilleurs résultats', tone: 'good', why: `${K.posts} publications (${signed(dN.pct, v => fmtP(v, 0))}), score médian ${Math.round(sNow)} contre ${Math.round(sPrev)}` });
  }
  if (topShare && topShare > .3) out.push({ id: 'isole', name: 'Dépendant de publications isolées', tone: 'warn', why: `une seule publication représente ${fmtP(topShare, 0)} de la portée des contenus de la période` });
  // amélioration durable : 3 derniers mois au-dessus du précédent
  const months = []; for (let i = 3; i >= 0; i--) { const t = addDays(a.to, -30 * i), f = addDays(t, -29); months.push(median(vals(postsIn(f, t), p => p.score))); }
  if (months.every(isNum) && months[1] > months[0] && months[2] > months[1] && months[3] > months[2]) out.push({ id: 'durable', name: 'En amélioration durable', tone: 'good', why: 'le score médian progresse 3 mois de suite' });
  if (!out.length) out.push({ id: 'stable', name: 'Évolution contrastée', tone: 'warn', why: 'aucun signal net dans un sens ou dans l’autre' });
  return out;
}

/* ---------- alertes ---------- */
function buildAlerts(a) {
  const { K, Kc, P, Pc } = a, out = [];
  const add = (tone, title, what, metric, why, action) => out.push({ tone, title, what, metric, why, action });
  const dR = delta(K.reach, Kc.reach), dE = delta(K.erReach, Kc.erReach), dN = delta(K.posts, Kc.posts), dPv = delta(K.pv, Kc.pv), dSh = delta(K.shares, Kc.shares);
  if (dR && dR.pct < -.2) add('bad', 'Baisse de portée', `La portée recule de ${fmtP(-dR.pct, 0)}.`, `Portée ${fmtK(K.reach)} contre ${fmtK(Kc.reach)} (${a.C.label})`, a.state.some(s => s.id === 'plusmoins') ? 'Plus de publications, mais moins fortes : l’algorithme distribue moins chaque contenu.' : 'Moins de contenus à forte diffusion (avant/après, démonstrations) sur la période.', `Replanifier 2 reels du thème « ${a.tReach?.name || '—'} » cette semaine, au créneau le plus fort.`);
  if (dE && dE.pct < -.2) add('bad', "Baisse de l'engagement", `L'engagement par portée recule de ${fmtP(-dE.pct, 0)}.`, `${fmtP(K.erReach, 2)} contre ${fmtP(Kc.erReach, 2)}`, 'Des contenus plus promotionnels ou moins utiles captent moins d’interactions.', `Remettre une CTA d’enregistrement sur les contenus « ${a.tSave?.name || '—'} ».`);
  if (isNum(K.net) && K.net < 0) add('bad', 'Baisse du nombre d’abonnés', `Le compte perd ${fmtN(-K.net)} abonnés nets.`, `Gagnés ${fmtN(K.gained)}, perdus ${fmtN(K.lost)}`, 'Les contenus récents n’attirent pas assez de nouveaux profils.', `Publier des réalisations clients, le thème qui convertit le mieux (${fmt1(a.tFol?.fol1k)} abonnés / 1 000 comptes touchés).`);
  if (dN && dN.pct < -.3) add('warn', 'Fréquence de publication en baisse', `${K.posts} publications contre ${fmtN(Kc.posts)}.`, `${fmt1(K.freq)} publications / semaine`, 'Période d’inactivité ou de moindre production.', 'Préparer 4 contenus d’avance à partir des idées de l’onglet Calendrier.');
  const below = P.filter(p => !p.recent && isNum(p.score) && p.score < 42).length / Math.max(1, P.filter(p => !p.recent).length), belowC = Pc.filter(p => isNum(p.score) && p.score < 42).length / Math.max(1, Pc.length);
  if (P.length >= 6 && below > belowC + .1) add('warn', 'Plus de publications sous la moyenne', `${fmtP(below, 0)} des contenus sont sous la moyenne, contre ${fmtP(belowC, 0)}.`, 'Score < 42 sur 100', 'La production a augmenté plus vite que la qualité, ou un thème s’essouffle.', 'Réduire les formats et thèmes les moins notés (voir onglet Thèmes) avant d’ajouter du volume.');
  const exc = [...P].filter(p => (p.type === 'REEL' || p.type === 'VIDEO') && p.score >= 88).sort((x, y) => y.score - x.score)[0];
  if (exc) add('good', 'Reel aux performances exceptionnelles', `« ${exc.hookText.slice(0, 70)} » (${fmtDay(exc.day)}).`, `Score ${exc.score}/100 · portée ${fmtX(exc.idx.reach)} la médiane des reels`, 'Combinaison thème / accroche parmi les plus fortes du compte.', 'En faire une série de 3 variations sous 14 jours (même structure, autre décor ou autre pièce).');
  const fast = P.filter(p => p.age <= 3 && isNum(p.idx.reach) && p.idx.reach >= 1.8).sort((x, y) => y.idx.reach - x.idx.reach)[0];
  if (fast) add('good', 'Démarrage rapide', `Publication du ${fmtDay(fast.day)} déjà à ${fmtX(fast.idx.reach)} la médiane de son format (portée projetée).`, `${fmtK(fast.reach)} comptes touchés en ${fast.age} jour${fast.age > 1 ? 's' : ''}`, 'Forte vitesse de démarrage, à confirmer dans les 72 h.', 'Répondre à tous les commentaires aujourd’hui et la relayer en story avec un sticker lien.');
  if (dSh && dSh.pct > .4) add('good', 'Hausse inhabituelle des partages', `Partages ${signed(dSh.pct, v => fmtP(v, 0))}.`, `${fmtN(K.shares)} partages`, 'Des contenus « à envoyer à quelqu’un » ont circulé en messages privés.', 'Identifier le contenu le plus partagé (onglet Contenu) et en décliner une version carrousel.');
  if (dPv && dPv.pct > .4) add('good', 'Hausse des visites du profil', `Visites du profil ${signed(dPv.pct, v => fmtP(v, 0))}.`, `${fmtN(K.pv)} visites`, 'Plus de personnes cherchent à en savoir plus sur le showroom.', 'Vérifier la bio : adresse de Dar El Beïda, horaires, lien WhatsApp et stories à la une « Décors en stock ».');
  const topF = [...P].filter(p => isNum(p.follows)).sort((x, y) => y.follows - x.follows)[0];
  if (topF && isNum(topF.idx.follows) && topF.idx.follows >= 3) add('good', 'Contenu qui génère beaucoup d’abonnés', `« ${topF.hookText.slice(0, 70)} » a apporté ${fmtN(topF.follows)} abonnés.`, `${fmtX(topF.idx.follows)} la médiane de son format`, 'Contenu qui donne une raison claire de suivre le compte.', 'Ajouter une suite (« partie 2 ») et épingler ce contenu sur le profil.');
  // thèmes en progression / en lassitude
  for (const t of a.themes.filter(t => t.n >= 6)) {
    const arr = [...t.posts].sort((x, y) => x.day.localeCompare(y.day)), h = Math.floor(arr.length / 2);
    const s1 = median(vals(arr.slice(0, h), p => p.score)), s2 = median(vals(arr.slice(h), p => p.score));
    if (isNum(s1) && isNum(s2) && s2 - s1 >= 15) add('good', 'Thème en progression', `« ${t.name} » progresse.`, `Score médian ${Math.round(s1)} → ${Math.round(s2)} (${t.n} publications)`, 'L’audience répond de mieux en mieux à ce sujet.', 'Lui réserver un créneau fixe chaque semaine.');
    if (isNum(s1) && isNum(s2) && s1 - s2 >= 15) add('warn', 'Thème qui montre des signes de lassitude', `« ${t.name} » recule.`, `Score médian ${Math.round(s1)} → ${Math.round(s2)} (${t.n} publications)`, 'Répétition du même angle ou de la même structure.', 'Changer d’angle (nouvelle accroche, nouveau format) ou espacer ce thème de 2 semaines.');
  }
  const topShare = (() => { const r = vals(P, p => p.reach); const t = sum(r); return t && r.length >= 4 ? Math.max(...r) / t : null; })();
  if (topShare && topShare > .3) add('warn', 'Dépendance à une seule publication', `Un contenu porte ${fmtP(topShare, 0)} de la portée de la période.`, 'Part de la publication la plus vue dans la portée totale des contenus', 'Sans ce contenu, la période serait nettement plus faible.', 'Juger la période sur la médiane plutôt que sur le total, et reproduire la structure du contenu viral.');
  // créneau dont la performance change
  for (const s of SLOTS) {
    const now = vals(P.filter(p => p.slot === s.id), p => p.score), prev = vals(Pc.filter(p => p.slot === s.id), p => p.score);
    if (now.length >= 3 && prev.length >= 3 && Math.abs(median(now) - median(prev)) >= 18) add(median(now) > median(prev) ? 'good' : 'warn', 'Créneau horaire qui change', `${s.name} : score médian ${Math.round(median(prev))} → ${Math.round(median(now))}.`, `${now.length} publications cette période, ${prev.length} avant`, 'Habitudes de l’audience ou type de contenu publié à ce créneau différent.', median(now) > median(prev) ? 'Garder ce créneau pour les contenus prioritaires.' : 'Tester un autre créneau pour ce type de contenu pendant 2 semaines.');
  }
  return out.slice(0, 10);
}

/* ---------- petits composants ---------- */
const PV = { ig: 'Donnée Instagram', calc: 'Calcul', ded: 'Déduit', hyp: 'Hypothèse', reco: 'Recommandation', ex: 'Exemple' };
const pv = k => `<span class="pv ${k}">${PV[k]}</span>`;
const PVS = { ig: 'Instagram', calc: 'Calcul', ded: 'Déduit', hyp: 'Hypothèse', reco: 'Reco.', ex: 'Exemple' };
const pvs = k => `<span class="pv ${k}" title="${PV[k]}">${PVS[k]}</span>`;
const confPill = c => c ? `<span class="pill c-${c.id}" title="${esc(c.why)}">${c.name}</span>` : '';
const prioPill = p => `<span class="pill${p === 'Haute' ? ' hi' : ''}">Priorité ${p.toLowerCase()}</span>`;
const gradePill = p => `<span class="grade" title="${esc(p.grade.name)}"><i style="background:${p.grade.c}">${isNum(p.score) ? p.score : '–'}</i>${esc(p.grade.name)}</span>`;
const thumb = p => `<span class="thumb" style="background:${FORMATS[p.type]?.c || 'var(--data-2)'}" aria-hidden="true">${FORMATS[p.type]?.short || ''}</span>`;
const plabel = (p, n = 60) => `${fmtDay(p.day)} · « ${esc(p.hookText.length > n ? p.hookText.slice(0, n - 1) + '…' : p.hookText)} »`;
const plink = p => p.permalink ? `<a href="${esc(p.permalink)}" target="_blank" rel="noopener">Ouvrir sur Instagram</a>` : `<span class="mut">${p._demo ? 'Publication d’exemple' : 'Lien non fourni'}</span>`;
const trend = (d, bad = false, f = fmtP) => {
  if (!d) return '<span class="tr eq">—</span>';
  const good = bad ? d.dir < 0 : d.dir > 0, cls = d.dir === 0 ? 'eq' : good ? 'up' : 'dn', ar = d.dir > 0 ? '▲' : d.dir < 0 ? '▼' : '■';
  return `<span class="tr ${cls}" title="${d.dir === 0 ? 'Stable' : good ? 'Tendance positive' : 'Tendance négative'}">${ar} ${isNum(d.pct) ? signed(d.pct, v => fmtP(v, 0)) : 'n/a'}</span>`;
};
function rec(o) {
  return `<article class="rec"><div class="hd"><h4>${o.t}</h4>${prioPill(o.prio)}${confPill(o.conf)}</div><dl>
  <dt>Constat</dt><dd>${o.c}</dd><dt>Interprétation</dt><dd>${o.i}</dd><dt>Action</dt><dd><b>${o.a}</b></dd><dt>Métrique à surveiller</dt><dd>${o.m}</dd></dl></article>`;
}
const naBlock = () => `<p class="na-msg">${NA}</p>`;
const sec = (lab, title, lede, extra = '') => `<div class="sec-h"><div><p class="lab">${lab}</p><h2>${title}</h2>${lede ? `<p class="lede">${lede}</p>` : ''}</div>${extra}</div>`;
const baseNote = a => `<p class="conf-note">Base d'analyse des schémas : ${a.baseLabel}.</p>`;
const scoreFmt = v => isNum(v) ? String(Math.round(v)) : '—';

/* ============================================================
   Onglet : Résumé exécutif
   ============================================================ */
function vResume(a) {
  const { K, Kc } = a, D = S.D;
  let h = sec('Résumé exécutif', `${fmtDate(a.from)} → ${fmtDate(a.to)}`, `${a.n} jours · comparaison avec la ${a.C.label} (${fmtDate(a.C.from)} → ${fmtDate(a.C.to)})${nFilters() ? ` · ${nFilters()} filtre(s) actif(s) sur les contenus` : ''}.`,
    `<div class="legend-pv">${['ig', 'calc', 'ded', 'hyp', 'reco'].map(pv).join('')}</div>`);
  const groups = [...new Set(KPI.map(k => k.g))];
  const spark = acc => { if (!acc || !D.avail['acc_' + acc]) return ''; const arr = accIn(a.from, a.to); const w = Math.max(1, Math.round(arr.length / 30)); const v = []; for (let i = 0; i < arr.length; i += w) v.push(acc === 'followers' ? arr[Math.min(arr.length - 1, i + w - 1)].followers : sum(arr.slice(i, i + w).map(x => x[acc]))); return sparkSVG(v); };
  for (const g of groups) {
    h += `<div class="kgroup"><h4>${g}</h4><div class="kpis">`;
    for (const d of KPI.filter(k => k.g === g)) {
      const v = K[d.k], c = Kc[d.k], f = d.f || fmtN;
      if (!isNum(v)) { h += `<div class="kpi"><div class="k">${d.l}</div><div class="v">—</div><div class="na">${d.k === 'messages' ? NA + ' (Instagram ne transmet pas les conversations privées à Windsor.ai.)' : NA}</div></div>`; continue; }
      const dd = delta(v, c);
      const label = d.k === 'messages' && K.msgIsReplies ? 'Réponses aux stories' : d.l;
      h += `<div class="kpi"><div class="k"><span>${label}</span>${pvs(d.k === 'lost' && !K.lostCalc ? 'ig' : d.pv)}</div><div class="v">${f(v)}</div>
      <div class="d">${trend(dd, d.bad)}<span>avant : ${isNum(c) ? f(c) : '—'}</span>${dd ? `<span>${signed(dd.abs, d.f ? (x => f(x)) : fmtN)}</span>` : ''}</div>${spark(d.acc)}${d.note && (d.k !== 'lost' || K.lostCalc) ? `<div class="na">${d.note}</div>` : ''}</div>`;
    }
    h += `</div></div>`;
  }
  // synthèse écrite
  const W = summaryText(a);
  h += `<div class="block"><h3>Synthèse de la période ${pv('reco')}</h3><p class="sub">Rédigée automatiquement à partir des chiffres ci-dessus et des schémas détectés.</p>
  <div class="sum3">
   <div class="panel"><h4><span class="dot" style="background:var(--good)"></span>Trois avancées</h4><ol>${W.wins.map(x => `<li>${x}</li>`).join('')}</ol></div>
   <div class="panel"><h4><span class="dot" style="background:var(--bad)"></span>Trois problèmes</h4><ol>${W.probs.map(x => `<li>${x}</li>`).join('')}</ol></div>
   <div class="panel"><h4><span class="dot" style="background:var(--s1)"></span>Trois opportunités</h4><ol>${W.opps.map(x => `<li>${x}</li>`).join('')}</ol></div>
  </div>
  <div class="verdict"><p><b>Conclusion.</b> ${W.concl}</p><p><b>Action immédiate.</b> ${W.now}</p></div></div>`;
  h += `<div class="block"><h3>Alertes</h3><p class="sub">Déclenchées automatiquement : baisse de plus de 20 %, contenus exceptionnels, dépendance, thèmes en progression ou en lassitude.</p>${alertsHTML(a.alerts)}</div>`;
  return h;
}
function alertsHTML(al) {
  if (!al.length) return `<p class="na-msg">Aucune alerte sur cette période.</p>`;
  const lab = { bad: 'Alerte', warn: 'Vigilance', good: 'Signal +' };
  return `<div class="alerts">${al.map(x => `<div class="alert ${x.tone}"><span class="ic">${lab[x.tone]}</span><b>${x.title}</b><dl><dt>Ce qui s'est passé</dt><dd>${x.what}</dd><dt>Métrique</dt><dd>${x.metric}</dd><dt>Explication possible</dt><dd>${x.why}</dd><dt>Action</dt><dd>${x.action}</dd></dl></div>`).join('')}</div>`;
}

function summaryText(a) {
  const { K, Kc } = a;
  const items = [
    ['reach', 'la portée'], ['gained', 'les abonnés gagnés'], ['pv', 'les visites du profil'], ['saves', 'les enregistrements'], ['shares', 'les partages'], ['comments', 'les commentaires'], ['erReach', "l'engagement par portée"], ['clicks', 'les clics vers le site'], ['folPost', 'les abonnés gagnés par publication'],
  ].map(([k, l]) => ({ k, l, d: delta(K[k], Kc[k]), v: K[k], c: Kc[k], f: (KPI.find(x => x.k === k).f || fmtN) })).filter(x => x.d && isNum(x.d.pct));
  const up = items.filter(x => x.d.pct > .03).sort((x, y) => y.d.pct - x.d.pct), dn = items.filter(x => x.d.pct < -.03).sort((x, y) => x.d.pct - y.d.pct);
  const line = x => `${x.l[0].toUpperCase() + x.l.slice(1)} : ${x.f(x.v)} (${signed(x.d.pct, v => fmtP(v, 0))} vs ${x.f(x.c)}).`;
  const wins = up.slice(0, 3).map(line);
  const bt = a.bestTheme; if (wins.length < 3 && bt) wins.push(`Le thème « ${bt.name} » obtient le meilleur score médian (${scoreFmt(bt.scoreMed)}/100 sur ${bt.n} publications).`);
  const topP = [...a.P].sort((x, y) => (y.score ?? 0) - (x.score ?? 0))[0]; if (wins.length < 3 && topP) wins.push(`Meilleur contenu : ${plabel(topP, 50)}, score ${topP.score}/100.`);
  while (wins.length < 3) wins.push('Pas d’autre progression significative sur cette période.');
  const probs = dn.slice(0, 3).map(line);
  const st = a.state.find(s => s.tone !== 'good'); if (probs.length < 3 && st) probs.push(`${st.name} : ${st.why}.`);
  if (probs.length < 3 && a.worstTheme && a.worstTheme !== a.bestTheme) probs.push(`Le thème « ${a.worstTheme.name} » reste le moins performant (score médian ${scoreFmt(a.worstTheme.scoreMed)} sur ${a.worstTheme.n} publications).`);
  const noCta = a.ctas.find(c => c.id === 'none'); if (probs.length < 3 && noCta && noCta.n / Math.max(1, a.base.length) > .25) probs.push(`${fmtP(noCta.n / a.base.length, 0)} des contenus n'ont pas d'appel à l'action explicite.`);
  while (probs.length < 3) probs.push('Pas d’autre recul significatif sur cette période.');
  const opps = a.opps.slice(0, 3).map(o => `${o.title} : ${o.action}`);
  while (opps.length < 3) opps.push('Données insuffisantes pour une opportunité supplémentaire.');
  const dR = delta(K.reach, Kc.reach), dF = delta(K.gained, Kc.gained);
  const concl = `Le compte est ${a.state.map(s => s.name.toLowerCase()).join(', ')}. ${dR ? `La portée évolue de ${signed(dR.pct, v => fmtP(v, 0))}` : 'La portée ne peut pas être comparée'}${dF ? ` et les abonnés gagnés de ${signed(dF.pct, v => fmtP(v, 0))}` : ''} par rapport à la ${a.C.label}. Les résultats viennent surtout du thème « ${a.bestTheme?.name || '—'} » ; ${a.worstTheme ? `« ${a.worstTheme.name} » tire la moyenne vers le bas.` : ''}`;
  const now = a.opps[0] ? `${a.opps[0].action}` : `Publier 2 reels « ${a.bestTheme?.name} » cette semaine.`;
  return { wins, probs, opps, concl, now };
}

/* ============================================================
   Onglet : Évolution
   ============================================================ */
const EVO = [
  ['followers', 'Abonnés', 'acc', false], ['new_follows', 'Abonnés gagnés', 'acc', true], ['reach', 'Portée', 'acc', true], ['impressions', 'Impressions', 'acc', true],
  ['views', 'Lectures', 'post', true], ['interactions', 'Interactions', 'post', true], ['profile_views', 'Visites du profil', 'acc', true], ['website_clicks', 'Clics', 'acc', true],
  ['posts', 'Publications', 'post', true], ['er', 'Engagement / portée', 'post', false], ['saves', 'Enregistrements', 'post', true], ['shares', 'Partages', 'post', true], ['comments', 'Commentaires', 'post', true],
];
function bucketKey(day, g) { if (g === 'day') return day; if (g === 'week') { const d = toD(day), dw = (d.getUTCDay() + 1) % 7; return addDays(day, -dw); } return day.slice(0, 7) + '-01'; }
function series(a, key, g) {
  const def = EVO.find(e => e[0] === key), keys = [];
  for (let d = a.from; d <= a.to; d = addDays(d, 1)) { const k = bucketKey(d, g); if (keys[keys.length - 1] !== k) keys.push(k); }
  const idx = new Map(keys.map((k, i) => [k, i])), v = keys.map(() => null), cnt = keys.map(() => 0), num = keys.map(() => 0), den = keys.map(() => 0);
  if (def[2] === 'acc') {
    for (const r of accIn(a.from, a.to)) { const i = idx.get(bucketKey(r.day, g)); if (i === undefined || !isNum(r[key])) continue; v[i] = key === 'followers' ? r[key] : (v[i] || 0) + r[key]; }
  } else {
    for (const p of a.P) { const i = idx.get(bucketKey(p.day, g)); if (i === undefined) continue; cnt[i]++; if (key === 'posts') continue; if (key === 'er') { if (isNum(p.interactions) && isNum(p.reach)) { num[i] += p.interactions; den[i] += p.reach; } continue; } if (isNum(p[key])) v[i] = (v[i] || 0) + p[key]; }
    if (key === 'posts') cnt.forEach((c, i) => v[i] = c);
    if (key === 'er') den.forEach((d, i) => v[i] = d ? num[i] / d : null);
  }
  return { keys, v };
}
function vEvolution(a) {
  const D = S.D, g = S.evoG, key = S.evoM, def = EVO.find(e => e[0] === key);
  let h = sec('Évolution du compte', 'Tendances et points de rupture', 'Choisissez l’indicateur et la granularité. Les repères sous la courbe marquent chaque publication (en rouge : score ≥ 80). Les zones grisées sont des périodes d’inactivité de 7 jours ou plus.');
  h += `<div class="block" style="margin-top:0"><h3>Diagnostic ${pv('calc')}</h3><div class="grid g3" style="margin-top:10px">${a.state.map(s => `<div class="panel"><span class="pill ${s.tone === 'good' ? 'c-hi' : s.tone === 'bad' ? 'hi' : 'c-md'}">${s.tone === 'good' ? '▲' : s.tone === 'bad' ? '▼' : '■'} ${s.name}</span><p class="small" style="margin-top:8px">${s.why}.</p></div>`).join('')}</div></div>`;
  h += `<div class="block"><div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between;margin-bottom:12px">
   <div class="seg" role="group" aria-label="Indicateur">${EVO.map(e => `<button type="button" data-evo="${e[0]}" aria-pressed="${e[0] === key}" ${e[2] === 'acc' ? (D.avail['acc_' + e[0]] ? '' : 'disabled title="' + esc(NA) + '"') : ''}>${e[1]}</button>`).join('')}</div>
   <div class="seg" role="group" aria-label="Granularité">${[['day', 'Jour'], ['week', 'Semaine'], ['month', 'Mois']].map(([k, l]) => `<button type="button" data-evog="${k}" aria-pressed="${k === g}">${l}</button>`).join('')}</div></div>`;
  const available = def[2] === 'acc' ? D.avail['acc_' + key] : key === 'posts' || key === 'er' || D.avail[key];
  if (!available) h += naBlock();
  else {
    const se = series(a, key, g);
    const fmt = key === 'er' ? (v => fmtP(v, 1)) : fmtK;
    // repères : publications + pics + inactivité
    const pIdx = new Map(se.keys.map((k, i) => [k, i]));
    const rug = a.P.map(p => ({ i: pIdx.get(bucketKey(p.day, g)), hl: p.score >= 80, tip: `<b>${fmtDay(p.day)} · ${FORMATS[p.type].name}</b><br>${esc(p.hookText.slice(0, 80))}<br>Score ${p.score ?? '—'} · portée ${fmtK(p.reach)}` })).filter(r => r.i !== undefined);
    const bands = []; const days = [...new Set(postsIn(a.from, a.to, false).map(p => p.day))].sort();
    let prev = addDays(a.from, -1);
    for (const d of [...days, addDays(a.to, 1)]) { if (diffDays(prev, d) > 7) { const s0 = pIdx.get(bucketKey(addDays(prev, 1), g)), s1 = pIdx.get(bucketKey(addDays(d, -1), g)); if (s0 !== undefined && s1 !== undefined) bands.push({ a: s0, b: s1, label: `Inactivité : ${diffDays(prev, d) - 1} jours sans publication (${fmtDay(addDays(prev, 1))} → ${fmtDay(addDays(d, -1))})` }); } prev = d; }
    const vv = se.v.filter(isNum), med = median(vv), p90 = quant(vv, .92), p10 = quant(vv, .06);
    const marks = key === 'followers' ? [] : se.v.map((v, i) => ({ i, v })).filter(x => isNum(x.v) && vv.length > 8 && (x.v >= p90 && x.v > med * 1.6)).map(x => ({ i: x.i, tip: '<b>Pic de performance</b>' }));
    const lows = key === 'followers' ? [] : se.v.map((v, i) => ({ i, v })).filter(x => isNum(x.v) && vv.length > 8 && x.v <= p10 && x.v < med * .5).map(x => ({ i: x.i, c: 'var(--data-2)', tip: '<b>Creux de performance</b>' }));
    h += `<div class="cleg"><span><i style="background:var(--data)"></i>${def[1]} (${g === 'day' ? 'par jour' : g === 'week' ? 'par semaine' : 'par mois'})</span><span><i class="sq" style="background:var(--red)"></i>Pic / publication score ≥ 80</span><span><i class="sq" style="background:var(--paper);outline:1px solid var(--line)"></i>Inactivité ≥ 7 j</span></div>`;
    h += chartSlot(el => drawLine(el, { x: se.keys, series: [{ name: def[1], v: se.v, color: 'var(--data)' }], fmt, rug: g === 'month' ? null : rug, bands, marks: [...marks, ...lows], zero: key !== 'followers', xfmt: g === 'month' ? (s => dfMonth.format(toD(s))) : fmtDay, h: 260 }), 260);
  }
  h += `</div>`;
  // fréquence
  const wk = series(a, 'posts', 'week');
  h += `<div class="grid g2 block"><div class="panel"><h4>Publications par semaine ${pv('ig')}</h4>${chartSlot(el => drawCols(el, { x: wk.keys, v: wk.v, name: 'Publications', h: 180 }), 180)}${freqNote(wk)}</div>`;
  h += `<div class="panel"><h4>Publication et croissance ${pv('calc')}</h4>${corrHTML(a)}</div></div>`;
  return h;
}
function freqNote(wk) {
  const v = wk.v; if (v.length < 4) return '';
  const h = Math.floor(v.length / 2), m1 = mean(v.slice(0, h)), m2 = mean(v.slice(h));
  const ch = m1 ? (m2 - m1) / m1 : 0;
  return `<p class="small mut" style="margin-top:8px">${Math.abs(ch) < .2 ? 'Fréquence stable' : ch > 0 ? 'Fréquence en hausse' : 'Fréquence en baisse'} : ${fmt1(m1)} → ${fmt1(m2)} publications / semaine entre la 1re et la 2e moitié de la période.</p>`;
}
function pearson(x, y) { const n = x.length; if (n < 8) return null; const mx = mean(x), my = mean(y); let a = 0, b = 0, c = 0; for (let i = 0; i < n; i++) { a += (x[i] - mx) * (y[i] - my); b += (x[i] - mx) ** 2; c += (y[i] - my) ** 2; } return b && c ? a / Math.sqrt(b * c) : null; }
function corrHTML(a) {
  const D = S.D;
  if (!D.avail.acc_new_follows) return naBlock();
  const acc = accIn(a.from, a.to), byDay = groupBy(postsIn(a.from, a.to, false), p => p.day);
  const x = [], y = [];
  acc.forEach((r, i) => { const nx = [0, 1, 2].map(k => acc[i - k]?.day).filter(Boolean).reduce((s, d) => s + sum((byDay.get(d) || []).map(p => p.reach || 0)), 0); x.push(nx); y.push(r.new_follows || 0); });
  const r = pearson(x, y);
  const withPost = acc.filter(r => byDay.has(r.day) || byDay.has(addDays(r.day, -1))).map(r => r.new_follows), without = acc.filter(r => !byDay.has(r.day) && !byDay.has(addDays(r.day, -1))).map(r => r.new_follows);
  const vir = a.P.filter(p => p.viral), afterV = vir.map(p => sum(acc.filter(r => r.day >= p.day && r.day <= addDays(p.day, 2)).map(r => r.new_follows)) / 3);
  const baseF = median(acc.map(r => r.new_follows));
  return `<dl class="kv" style="margin-top:6px">
   <dt>Corrélation portée des contenus (J à J-2) → nouveaux abonnés</dt><dd>${r === null ? 'Échantillon trop court' : `<b>r = ${r.toFixed(2).replace('.', ',')}</b> · ${Math.abs(r) >= .5 ? 'lien fort' : Math.abs(r) >= .3 ? 'lien modéré' : 'lien faible'} (${acc.length} jours)`}</dd>
   <dt>Abonnés gagnés / jour avec publication (J ou J-1)</dt><dd>${fmt1(mean(withPost))} en moyenne (${withPost.length} jours)</dd>
   <dt>Abonnés gagnés / jour sans publication</dt><dd>${fmt1(mean(without))} en moyenne (${without.length} jours)</dd>
   <dt>Après un contenu viral (3 jours)</dt><dd>${vir.length ? `${fmt1(mean(afterV))} abonnés / jour contre ${fmt1(baseF)} en temps normal (${vir.length} contenu${vir.length > 1 ? 's' : ''} viral${vir.length > 1 ? 'aux' : ''})` : 'Aucun contenu viral (portée ≥ 3× la médiane) sur la période'}</dd></dl>
   <p class="conf-note">Une corrélation ne prouve pas que la publication cause la croissance : d’autres facteurs (saison, bouche-à-oreille, campagnes) jouent aussi.</p>`;
}

/* ============================================================
   Onglet : Contenu (tableau triable)
   ============================================================ */
const COLS = [
  ['day', 'Date', p => p.day, p => fmtDay(p.day)], ['time', 'Heure', p => p.time, p => p.time || '—'], ['type', 'Type', p => p.type, p => FORMATS[p.type]?.name],
  ['hook', 'Accroche', p => p.hookText, null], ['theme', 'Thème', p => themeById(p.theme).name, null], ['category', 'Catégorie', p => p.category, null], ['duration', 'Durée', p => p.duration, p => fmtS(p.duration)],
  ['reach', 'Portée', p => p.reach, p => fmtN(p.reach)], ['impressions', 'Impr.', p => p.impressions, p => fmtN(p.impressions)], ['views', 'Lectures', p => p.views, p => fmtN(p.views)],
  ['likes', "J'aime", p => p.likes, p => fmtN(p.likes)], ['comments', 'Comm.', p => p.comments, p => fmtN(p.comments)], ['saves', 'Enreg.', p => p.saves, p => fmtN(p.saves)], ['shares', 'Partages', p => p.shares, p => fmtN(p.shares)],
  ['interactions', 'Interactions', p => p.interactions, p => fmtN(p.interactions)], ['profile_visits', 'Visites profil', p => p.profile_visits, p => fmtN(p.profile_visits)], ['follows', 'Abonnés', p => p.follows, p => fmtN(p.follows)],
  ['clicks', 'Clics', p => p.clicks, p => fmtN(p.clicks)], ['er', 'Eng./portée', p => p.er, p => fmtP(p.er, 2)], ['erF', 'Eng./abonnés', p => p.erF, p => fmtP(p.erF, 2)], ['saveR', 'Tx enreg.', p => p.saveR, p => fmtP(p.saveR, 2)],
  ['shareR', 'Tx partage', p => p.shareR, p => fmtP(p.shareR, 2)], ['cmR', 'Tx comm.', p => p.cmR, p => fmtP(p.cmR, 2)], ['pvR', 'Portée → profil', p => p.pvR, p => fmtP(p.pvR, 2)], ['folR', 'Portée → abonné', p => p.fol1k, p => isNum(p.fol1k) ? fmt1(p.fol1k) + ' ‰' : '—'],
  ['vsavg', 'vs médiane format', p => p.idx.reach, p => fmtX(p.idx.reach)], ['objective', 'Objectif atteint', p => p.objective, p => OBJECTIVES[p.objective]?.name], ['score', 'Score', p => p.score, null],
];
const PRESETS = [
  ['all', 'Toutes les publications', () => true, null], ['reach', 'Plus de portée', () => true, 'reach'], ['views', 'Plus de lectures', () => true, 'views'], ['follows', 'Plus d’abonnés générés', () => true, 'follows'],
  ['shares', 'Plus de partages', () => true, 'shares'], ['saves', 'Plus d’enregistrements', () => true, 'saves'], ['comments', 'Plus de commentaires', () => true, 'comments'], ['er', 'Meilleur engagement', () => true, 'er'],
  ['worst', 'Les moins performantes', p => !p.recent, 'score', 1], ['above', 'Au-dessus de la moyenne', p => p.score >= 50, 'score'], ['below', 'En dessous de la moyenne', p => p.score < 50 && !p.recent, 'score', 1],
  ['viral', 'Virales (portée ≥ 3× médiane)', p => p.viral, 'reach'], ['hiLo', 'Forte portée, faible conversion', p => p.idx.reach >= 1.3 && (p.idx.folR ?? 1) < .7 && (p.idx.pvR ?? 1) < .8, 'reach'],
  ['loHi', 'Faible portée, forte conversion', p => p.idx.reach < .8 && ((p.idx.folR ?? 0) >= 1.5 || (p.idx.pvR ?? 0) >= 1.5), 'folR'],
  ['under', 'Contenus sous-estimés', p => p.idx.reach < .8 && ((p.idx.saveR ?? 0) >= 1.4 || (p.idx.shareR ?? 0) >= 1.4), 'saveR'],
  ['reuse', 'Potentiel de réutilisation', p => p.score >= 70 && p.age >= 60, 'score'],
];
function vContenu(a) {
  const pr = PRESETS.find(x => x[0] === S.preset) || PRESETS[0];
  let rows = a.P.filter(pr[2]);
  const q = S.q.trim().toLowerCase(); if (q) rows = rows.filter(p => p.caption.toLowerCase().includes(q));
  let sk = S.sort.k, sd = S.sort.d;
  if (pr[3] && S._presetApplied !== S.preset) { sk = S.sort.k = pr[3] === 'folR' ? 'folR' : pr[3]; sd = S.sort.d = pr[4] ? 1 : -1; S._presetApplied = S.preset; }
  const col = COLS.find(c => c[0] === sk) || COLS[COLS.length - 1];
  rows.sort((x, y) => { const u = col[2](x), v = col[2](y); if (u === v) return 0; if (u === null || u === undefined) return 1; if (v === null || v === undefined) return -1; return (u < v ? -1 : 1) * sd; });
  const hideCols = COLS.filter(c => ['impressions', 'views', 'likes', 'comments', 'saves', 'shares', 'interactions', 'profile_visits', 'follows', 'clicks', 'duration'].includes(c[0]) && !S.D.avail[c[0]]).map(c => c[0]);
  const shown = COLS.filter(c => !hideCols.includes(c[0]));
  let h = sec('Analyse du contenu', `${rows.length} publication${rows.length > 1 ? 's' : ''}`, 'Cliquez sur un en-tête pour trier. Le score (0-100) compare chaque publication aux contenus du même format sur tout l’historique, portée corrigée de l’ancienneté et de la taille du compte.');
  h += `<div style="display:flex;flex-wrap:wrap;gap:10px;align-items:flex-end;margin-bottom:12px">
   <div class="fld"><label for="preset">Vue</label><select id="preset">${PRESETS.map(p => `<option value="${p[0]}" ${p[0] === S.preset ? 'selected' : ''}>${p[1]}</option>`).join('')}</select></div>
   <div class="fld" style="flex:1 1 220px"><label for="q">Rechercher dans les légendes</label><input type="search" id="q" value="${esc(S.q)}" placeholder="ex. Asgil, carrelage, Aqua"></div></div>`;
  if (hideCols.length) h += `<p class="conf-note" style="margin:-4px 0 10px">Colonnes masquées (${hideCols.map(k => COLS.find(c => c[0] === k)[1]).join(', ')}) : ${NA.toLowerCase()}</p>`;
  h += `<div class="tbl-wrap big-tbl"><table><thead><tr><th></th>${shown.map(c => `<th data-sort="${c[0]}" class="${['day', 'time', 'type', 'hook', 'theme', 'category', 'objective'].includes(c[0]) ? '' : 'n'}${c[0] === sk ? ' sorted' : ''}" aria-sort="${c[0] === sk ? (sd > 0 ? 'ascending' : 'descending') : 'none'}">${c[1]}${c[0] === sk ? (sd > 0 ? ' ↑' : ' ↓') : ''}</th>`).join('')}</tr></thead><tbody>`;
  for (const p of rows.slice(0, 400)) {
    h += `<tr><td>${thumb(p)}</td>${shown.map(c => {
      if (c[0] === 'hook') return `<td><div class="cap" title="${esc(p.caption)}">${esc(p.hookText)}</div><div class="xs mut">${plink(p)}${p.recent ? ' · <b>récent, score provisoire</b>' : ''}${p.sponsored ? ' · sponsorisé' : ''}</div></td>`;
      if (c[0] === 'theme') return `<td>${esc(themeById(p.theme).name)}</td>`;
      if (c[0] === 'category') return `<td>${esc(p.category)}</td>`;
      if (c[0] === 'score') return `<td class="n">${gradePill(p)}</td>`;
      if (c[0] === 'clicks') return `<td class="n mut" title="${esc(NA)}">—</td>`;
      const cls = ['day', 'time', 'type', 'objective'].includes(c[0]) ? '' : 'n';
      return `<td class="${cls}">${c[3](p) ?? '—'}</td>`;
    }).join('')}</tr>`;
  }
  h += `</tbody></table></div>${rows.length > 400 ? '<p class="conf-note">400 premières lignes affichées.</p>' : ''}
  <p class="conf-note">Couverture et miniature : non affichables ici (les images Instagram sont bloquées par la politique de sécurité de la page) ; le lien ouvre la publication. Clics par publication : ${NA.toLowerCase()} (Instagram ne fournit les clics qu’au niveau du compte).</p>`;
  return h;
}

/* ============================================================
   Onglets : Meilleurs / moins bons reels
   ============================================================ */
function reelMetrics(p) {
  const M = S.D.formatMed[p.type] || {};
  const cell = (l, v, f, ix) => `<div>${l}<b>${v === null || v === undefined ? '—' : f(v)}</b>${isNum(ix) ? `<span class="x ${ix >= 1.15 ? 'up' : ix <= .85 ? 'dn' : ''}">${fmtX(ix)} médiane</span>` : ''}</div>`;
  return `<div class="mgrid">
   ${cell('Portée', p.reach, fmtN, p.idx.reach)}${cell('Lectures', p.views, fmtN, p.idx.views)}${cell('Durée', p.duration, fmtS)}
   ${cell('Temps moyen de lecture', p.avg_watch, fmtS, ratio(p.avg_watch, M.avg_watch))}${cell('% moyen visionné', p.ret, v => fmtP(v, 0), p.idx.ret)}${cell("J'aime", p.likes, fmtN)}
   ${cell('Commentaires', p.comments, fmtN, p.idx.comments)}${cell('Enregistrements', p.saves, fmtN, p.idx.saves)}${cell('Partages', p.shares, fmtN, p.idx.shares)}
   ${cell('Visites du profil', p.profile_visits, fmtN, p.idx.pv)}${cell('Abonnés générés', p.follows, fmtN, p.idx.follows)}${cell('Score', p.score, v => v + '/100')}
  </div>
  <p class="conf-note">Non disponibles dans la source : rétention initiale et finale (courbe de rétention), lectures par abonnés / non-abonnés, clics et conversions par publication.</p>`;
}
function creative(p) {
  const cap = p.caption, words = cap.split(/\s+/).filter(Boolean).length;
  const hk = hookById(p.hook), th = themeById(p.theme), ct = ctaById(p.cta);
  const util = ['pose', 'tech', 'reno'].includes(p.theme) ? 'élevée (information pratique)' : ['deco', 'show'].includes(p.theme) ? 'moyenne (inspiration)' : 'faible à moyenne';
  const curio = ['secret', 'demo', 'myth', 'warn', 'avap'].includes(p.hook) ? 'élevée' : ['q', 'cmp', 'list', 'err'].includes(p.hook) ? 'moyenne' : 'faible';
  const contro = ['opin', 'myth'].includes(p.hook) ? 'moyenne' : 'faible';
  const emo = { avap: 'surprise, satisfaction', demo: 'surprise', err: 'inquiétude évitée', warn: 'prudence', pain: 'frustration → soulagement', desire: 'aspiration', case: 'confiance', story: 'attachement', opin: 'adhésion ou désaccord', q: 'curiosité', news: 'urgence', res: 'satisfaction' }[p.hook] || 'neutre';
  return `<dl class="kv">
   <dt>Accroche ${pv('ig')}</dt><dd>« ${esc(p.hookText)} »</dd>
   <dt>Type d’accroche ${pv('ded')}</dt><dd>${hk.name}</dd>
   <dt>Thème / angle ${pv('ded')}</dt><dd>${th.name} · ${th.cat.toLowerCase()}${p.product ? ` · décor ${p.product}` : ''}</dd>
   <dt>Promesse ${pv('ded')}</dt><dd>${/\bune journée|sans casser|24 ?h|en \d/.test(cap) ? 'Résultat concret et chiffré' : /comment|étape|choisir/.test(cap) ? 'Apprendre à bien choisir ou bien poser' : /stock|disponible|arrivage/.test(cap) ? 'Disponibilité immédiate' : 'Inspiration visuelle'}</dd>
   <dt>Curiosité / controverse ${pv('ded')}</dt><dd>Curiosité ${curio} · controverse ${contro}</dd>
   <dt>Émotion principale ${pv('hyp')}</dt><dd>${emo}</dd>
   <dt>Utilité pratique ${pv('ded')}</dt><dd>${util}</dd>
   <dt>Appel à l’action ${pv('ded')}</dt><dd>${ct.name}</dd>
   <dt>Longueur de la légende</dt><dd>${words} mots${/#/.test(cap) ? ' · hashtags présents' : ''}</dd>
   <dt>Montage, rythme, sous-titres</dt><dd class="mut">Non analysables : Windsor.ai ne transmet pas la vidéo. Conclusions limitées au texte et aux métriques.</dd></dl>`;
}
function whyWorked(p) {
  const I = p.idx, out = [];
  if (I.shareR >= 1.4) out.push(`Les données suggèrent un contenu « à envoyer » : taux de partage ${fmtP(p.shareR, 2)}, soit ${fmtX(I.shareR)} la médiane des ${FORMATS[p.type].name.toLowerCase()}s.`);
  if (I.saveR >= 1.4) out.push(`Information pratique qui incite à enregistrer : taux d’enregistrement ${fmtX(I.saveR)} la médiane.`);
  if (I.ret >= 1.12) out.push(`Rétention supérieure à la moyenne (${fmtP(p.ret, 0)} de la vidéo vue en moyenne) : l’accroche « ${hookById(p.hook).name.toLowerCase()} » semble tenir sa promesse rapidement.`);
  if (I.reach >= 2) out.push(`Diffusion très au-dessus de l’habitude (${fmtX(I.reach)}) : ce résultat semble lié à une large distribution hors abonnés (la répartition abonnés / non-abonnés n’est pas fournie par la source).`);
  if (I.cmR >= 1.5) out.push(`Le contenu fait réagir : taux de commentaires ${fmtX(I.cmR)} la médiane${p.cta === 'comment' || p.cta === 'tag' ? ', aidé par une CTA de commentaire' : ''}.`);
  if (I.folR >= 1.5) out.push(`Forte conversion en abonnés (${fmt1(p.fol1k)} pour 1 000 comptes touchés) : une explication possible est que le contenu donne une raison claire de suivre la suite.`);
  if (I.pvR >= 1.5) out.push(`Beaucoup de visites du profil par personne touchée (${fmtP(p.pvR, 2)}) : intention de découvrir le showroom ou les décors.`);
  if (p.durB && ['d2', 'd3'].includes(p.durB)) out.push(`Format court (${fmtS(p.duration)}), cohérent avec les durées qui performent le mieux sur le compte.`);
  if (!out.length) out.push('La combinaison de ces métriques indique une performance homogène, sans point saillant unique.');
  return out;
}
function lessons(p, a) {
  const th = themeById(p.theme), hk = hookById(p.hook);
  const dec = DECORS.find(d => d.ref !== p.product) || DECORS[0];
  return [
    ['À répéter', `L’accroche de type « ${hk.name.toLowerCase()} » sur le thème « ${th.name} ».`],
    ['À ne pas copier à l’identique', `Le même décor${p.product ? ` (${p.product})` : ''} et la même pièce : l’audience l’a déjà vu.`],
    ['Structure réutilisable', p.hook === 'avap' ? 'Plan « avant » 2 s → pose accélérée → révélation « après » → nom du décor à l’écran.' : p.hook === 'err' || p.hook === 'warn' ? 'Erreur nommée en 1re seconde → conséquence visible → bonne méthode → rappel.' : p.hook === 'demo' ? 'Test annoncé → test filmé sans coupe → résultat → caractéristique technique.' : 'Promesse en 1re ligne → preuve visuelle → décor et référence → CTA.'],
    ['Thème à redévelopper', `${th.name}, décliné sur une autre pièce (${p.theme === 'reno' ? 'cuisine ouverte en Chêne Melba beige Aqua' : 'chambre, entrée ou bureau'}).`],
    ['Variations', `Même format avec ${dec.n} (${dec.ref}) ; version carrousel en 5 étapes ; version « question des clients ».`],
    ['Accroche adaptable', p.hook === 'avap' ? '« Avant / après : [PIÈCE] en carrelage → [DÉCOR] en [DURÉE]. »' : p.hook === 'err' ? '« L’erreur qui [CONSÉQUENCE] quand on pose [PRODUIT]. »' : '« [RÉSULTAT] sans [DOULEUR] : voici comment. »'],
    ['CTA pour la nouvelle version', a.cShare && p.idx.shareR >= 1.2 ? `« ${ctaById('share').name} » (meilleure CTA pour les partages)` : `« ${ctaById(a.cSave?.id || 'save').name} » ou réservation de visite au showroom`],
    ['Risque', p.viral ? 'Un succès viral est rarement reproductible tel quel : juger la série sur la médiane de 3 publications.' : 'Lassitude si le même angle revient plus de 2 fois en 14 jours.'],
  ];
}
function reelCard(p, a, mode) {
  const L = mode === 'top' ? lessons(p, a) : null;
  return `<article class="reel" id="p-${esc(p.id)}"><header>${thumb(p)}<div class="t"><div class="xs mut">${fmtDate(p.day)} à ${p.time || '—'} · ${DOW[p.dow]} · ${FORMATS[p.type].name}${p.duration ? ' · ' + fmtS(p.duration) : ''}</div><p>« ${esc(p.hookText)} »</p><div class="tags">${gradePill(p)}<span class="pill">${esc(themeById(p.theme).name)}</span><span class="pill">${hookById(p.hook).name}</span><span class="pill">CTA : ${ctaById(p.cta).name}</span><span class="pill">Objectif atteint : ${OBJECTIVES[p.objective].name}</span></div></div><div class="xs">${plink(p)}</div></header>
  <div class="body"><div><h5>Données principales ${pv('ig')} ${pv('calc')}</h5>${reelMetrics(p)}</div>
  <div>${mode === 'top' ? `<h5>Pourquoi il a probablement fonctionné ${pv('hyp')}</h5><ul>${whyWorked(p).map(x => `<li>${x}</li>`).join('')}</ul><h5>Analyse créative</h5>${creative(p)}<h5>Leçons reproductibles ${pv('reco')}</h5><dl class="kv">${L.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>` : flopBody(p, a)}</div></div></article>`;
}
function vTop(a) {
  let pool = a.reelsP.filter(p => isNum(p.score)), note = '';
  if (pool.length < 8) { pool = a.reelsBase.filter(p => isNum(p.score)); note = ` La période ne compte que ${a.reelsP.length} reel(s) : sélection élargie aux 180 derniers jours.`; }
  let h = sec('Analyse des meilleurs reels', `${pool.length} reels analysés`, 'Classements par métrique ; un même reel n’est répété que lorsqu’il n’y a pas assez de candidats.' + note);
  if (!pool.length) return h + naBlock();
  const lists = [['reach', 'Portée', p => p.reach, fmtN], ['views', 'Lectures', p => p.views, fmtN], ['shares', 'Partages', p => p.shares, fmtN], ['saves', 'Enregistrements', p => p.saves, fmtN], ['comments', 'Commentaires', p => p.comments, fmtN], ['follows', 'Abonnés générés', p => p.follows, fmtN], ['score', 'Score global', p => p.score, v => v + '/100']];
  const used = new Set(), winners = [];
  h += `<div class="toplists">`;
  for (const [k, l, f, fm] of lists) {
    if (k !== 'score' && !S.D.avail[k]) { h += `<div class="panel"><h4>Top 5 · ${l}</h4>${naBlock()}</div>`; continue; }
    const sorted = [...pool].filter(p => isNum(f(p))).sort((x, y) => f(y) - f(x));
    const pick = []; for (const p of sorted) { if (pick.length >= 5) break; if (!used.has(p.id)) pick.push(p); }
    for (const p of sorted) { if (pick.length >= 5) break; if (!pick.includes(p)) pick.push(p); }
    pick.sort((x, y) => f(y) - f(x));
    pick.forEach(p => { if (!used.has(p.id)) { used.add(p.id); winners.push(p); } });
    h += `<div class="panel"><h4>Top 5 · ${l}</h4><ol>${pick.map(p => `<li><span><button class="lnk" type="button" data-goto="p-${esc(p.id)}">${plabel(p, 40)}</button></span><b>${fm(f(p))}</b></li>`).join('')}</ol></div>`;
  }
  h += `</div>`;
  const cards = winners.sort((x, y) => y.score - x.score).slice(0, 8);
  h += `<div class="block"><h3>Fiches des reels gagnants</h3><p class="sub">${cards.length} reels uniques, triés par score. Les explications sont des hypothèses fondées sur les écarts à la médiane du format.</p><div class="grid">${cards.map(p => reelCard(p, a, 'top')).join('')}</div></div>`;
  return h;
}
function flopDiag(p, a) {
  const I = p.idx, pb = [];
  if (I.reach < .6 && isNum(I.ret) && I.ret < .9) pb.push(['Accroche faible ou introduction trop longue', `portée ${fmtX(I.reach)} et rétention ${fmtX(I.ret)} la médiane`]);
  else if (I.reach < .6) pb.push(['Faible diffusion', `portée ${fmtX(I.reach)} la médiane des reels`]);
  if (p.durB && ['d5', 'd6', 'd7'].includes(p.durB) && isNum(p.ret) && p.ret < .4) pb.push(['Mauvais rapport durée / valeur', `${fmtS(p.duration)} pour ${fmtP(p.ret, 0)} de vidéo vue en moyenne`]);
  if (I.reach >= .9 && (I.saveR ?? 1) < .7 && (I.shareR ?? 1) < .7) pb.push(['Contenu vu mais peu utile ou peu partageable', `enregistrements ${fmtX(I.saveR)}, partages ${fmtX(I.shareR)} la médiane`]);
  if (I.reach < .7 && ((I.er ?? 0) >= 1.2)) pb.push(['Interactions sans diffusion', `engagement ${fmtX(I.er)} mais portée ${fmtX(I.reach)}`]);
  if (p.cta === 'none') pb.push(['Absence de CTA', 'aucun appel à l’action détecté dans la légende']);
  if (p.theme === 'promo' || p.hook === 'news' || p.hook === 'prom') pb.push(['Promesse promotionnelle peu engageante', 'les accroches « actualité / promesse » sont parmi les moins diffusées du compte']);
  if (p.slot === 'nuit' || p.slot === 'matin') pb.push(['Publication à un moment peu favorable', `${DOW[p.dow]} ${p.time}, tranche ${SLOTS.find(s => s.id === p.slot).short.toLowerCase()}`]);
  if (p.fatigue) pb.push(['Lassitude liée à un thème répété', `« ${themeById(p.theme).name} » publié 3 fois ou plus dans les 14 jours précédents`]);
  if (!pb.length) pb.push(['Bon thème, exécution moyenne', 'aucun indicateur isolé ne décroche ; l’écart vient d’un cumul de petites faiblesses']);
  return pb;
}
function flopBody(p, a) {
  const pb = flopDiag(p, a), main = pb[0];
  const th = a.themes.find(t => t.id === p.theme);
  const reuse = th && th.scoreMed >= 50;
  const altHook = { reno: '« Avant / après : ce [PIÈCE] a changé en une journée, sans casser le carrelage. »', pose: '« L’erreur qui fait gonfler un parquet en moins d’un an. »', tech: '« On a versé de l’eau sur ce parquet pendant 24 h. »', deco: '« Clair ou miel ? Le décor qui agrandit vraiment un petit salon. »', real: '« Chez [CLIENT] à [VILLE] : 120 m² posés en 3 jours. »', show: '« 30 minutes au showroom : voici ce qui se passe. »', promo: '« Il reste [N] cartons de [DÉCOR] : voici pourquoi il part si vite. »', comm: '« Clair ou foncé pour un salon plein sud ? Répondez, on vous montre le rendu. »' }[p.theme] || '« [RÉSULTAT] sans [DOULEUR]. »';
  const bestD = a.dBest ? a.dBest.name : '21-30 s';
  const cta = p.theme === 'promo' || p.theme === 'show' ? 'Écrire sur WhatsApp ou réserver une visite' : (a.cSave ? a.cSave.name : 'Enregistrer');
  return `<h5>Problèmes identifiés ${pv('hyp')}</h5><ul>${pb.map(([t, w]) => `<li><b>${t}</b> : ${w}.</li>`).join('')}</ul>
  <h5>Réponses ${pv('reco')}</h5><dl class="kv">
   <dt>Principal problème</dt><dd>${main[0]}</dd>
   <dt>À changer pour republier</dt><dd>${main[0].startsWith('Accroche') || main[0].startsWith('Faible') ? 'Montrer le résultat final dès la 1re seconde, texte à l’écran de 6 mots maximum.' : main[0].startsWith('Mauvais rapport') ? `Couper à ${bestD} en gardant uniquement la démonstration.` : main[0].startsWith('Absence') ? 'Ajouter une CTA alignée avec le thème.' : main[0].startsWith('Publication à') ? `Republier ${a.dowsRank[0] ? DOW[a.dowsRank[0].id].toLowerCase() : 'jeudi'} ${a.slotsRank[0] ? SLOTS.find(s => s.id === a.slotsRank[0].id).short.toLowerCase() : 'soir'}.` : 'Changer d’angle : passer d’une présentation à un problème résolu.'}</dd>
   <dt>L’idée mérite-t-elle d’être réutilisée ?</dt><dd>${reuse ? `Oui : le thème « ${themeById(p.theme).name} » a un score médian de ${scoreFmt(th.scoreMed)}.` : `Seulement sous un autre angle : le thème obtient ${th ? scoreFmt(th.scoreMed) : '—'} de score médian.`}</dd>
   <dt>Accroche alternative</dt><dd>${altHook}</dd>
   <dt>Durée recommandée</dt><dd>${bestD} (meilleure tranche de durée du compte${a.dBest ? `, n=${a.dBest.n}` : ''})</dd>
   <dt>CTA la plus adaptée</dt><dd>${cta}</dd>
   <dt>Enseignement</dt><dd>${main[0].startsWith('Promesse') ? 'Les annonces de stock performent mieux intégrées à une démonstration ou à une réalisation client.' : main[0].startsWith('Lassitude') ? 'Espacer un même thème d’au moins 5 jours.' : 'Chaque reel doit annoncer un bénéfice concret dans la première phrase.'}</dd></dl>`;
}
function vFlop(a) {
  let pool = a.reelsP.filter(p => !p.recent && isNum(p.score)), note = '';
  if (pool.length < 6) { pool = a.reelsBase.filter(p => !p.recent && isNum(p.score)); note = ' Sélection élargie aux 180 derniers jours.'; }
  const rec = a.reelsP.filter(p => p.recent).length;
  let h = sec('Analyse des reels les moins performants', `Les 6 reels les plus en retrait`, `Comparés à la médiane des reels du compte. Les reels publiés il y a moins de 3 jours sont exclus (${rec} concerné${rec > 1 ? 's' : ''}) : ils n’ont pas fini de circuler.` + note);
  const worst = [...pool].sort((x, y) => x.score - y.score).slice(0, 6);
  if (!worst.length) return h + naBlock();
  const counts = {}; worst.forEach(p => flopDiag(p, a).forEach(([t]) => counts[t] = (counts[t] || 0) + 1));
  h += `<div class="panel soft"><h4>Problèmes récurrents ${pv('calc')}</h4>${hbars(Object.entries(counts).sort((x, y) => y[1] - x[1]).map(([t, n], i) => ({ label: t, v: n, hl: i === 0 })), { fmt: v => v + ' / ' + worst.length })}</div>`;
  h += `<div class="grid block">${worst.map(p => reelCard(p, a, 'flop')).join('')}</div>`;
  return h;
}
