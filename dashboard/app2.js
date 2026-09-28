'use strict';
/* app2.js : onglets d'analyse (thèmes → données) + coque et initialisation */

const tblGroup = (rows, cols) => `<div class="tbl-wrap"><table><thead><tr>${cols.map(c => `<th class="${c.n ? 'n' : ''}">${c.l}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${cols.map(c => `<td class="${c.n ? 'n' : ''}">${c.f(r)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const colsStd = (extra = []) => [
  { l: 'Groupe', f: r => `<b>${esc(r.name)}</b>` }, { l: 'Publications', n: 1, f: r => r.n },
  { l: 'Portée moy.', n: 1, f: r => fmtN(r.reach) }, { l: 'Portée médiane', n: 1, f: r => fmtN(r.reachMed) },
  ...(S.D.avail.views ? [{ l: 'Lectures moy.', n: 1, f: r => fmtN(r.views) }] : []),
  { l: 'Interactions moy.', n: 1, f: r => fmtN(r.inter) }, { l: 'Enreg. moy.', n: 1, f: r => fmtN(r.saves) }, { l: 'Partages moy.', n: 1, f: r => fmtN(r.shares) },
  { l: 'Comm. moy.', n: 1, f: r => fmtN(r.comments) }, { l: 'Abonnés générés', n: 1, f: r => fmtN(r.followsSum) }, { l: 'Eng./portée', n: 1, f: r => fmtP(r.er, 2) },
  ...extra,
  { l: 'Score moy. / méd.', n: 1, f: r => `${scoreFmt(r.score)} / <b>${scoreFmt(r.scoreMed)}</b>` }, { l: 'Confiance', f: r => confPill(r.conf) },
];

/* ============================================================ Thèmes */
function themeClass(t, a) {
  const cl = [], A0 = a.acct;
  if (t.n >= 5 && t.scoreMed >= 58) cl.push(['Gagnant', 'c-hi']);
  if (t.n < 5 && t.scoreMed >= 58) cl.push(['Prometteur', 'c-md']);
  if (t.scoreMed >= 45 && t.scoreMed < 58 && t.spread < 35) cl.push(['Stable', '']);
  if (t.spread >= 40 || (t.topShare > .45 && t.n >= 3)) cl.push(['Irrégulier', 'c-md']);
  if (t.scoreMed < 45 && t.n >= 4) cl.push(['Peu performant', 'hi']);
  const arr = [...t.posts].sort((x, y) => x.day.localeCompare(y.day)), h = Math.floor(arr.length / 2);
  if (t.n >= 8 && median(vals(arr.slice(h), p => p.score)) < median(vals(arr.slice(0, h), p => p.score)) - 10 && t.n / a.base.length > .15) cl.push(['Saturé', 'hi']);
  if (t.reachMed > A0.reach * 1.2) cl.push(['Génère de la portée', '']);
  if (t.saveR > A0.saveR * 1.3) cl.push(["Génère de l'autorité", '']);
  if (t.cmR > A0.cmR * 1.3) cl.push(['Génère de la communauté', '']);
  if (t.pvR > A0.pvR * 1.3 || t.fol1k > A0.fol1k * 1.3) cl.push(['Génère de la conversion', '']);
  return cl;
}
function themeNuance(t, a) {
  const out = [];
  if (t.n <= 2) out.push('Résultat isolé : trop peu de publications pour conclure.');
  else if (t.topShare > .45) out.push(`Un seul contenu porte ${fmtP(t.topShare, 0)} de la portée du thème : le succès n’est pas répété.`);
  else if (t.scoreP25 >= 45) out.push('Fonctionne de manière répétée : même le quart le plus faible reste proche de la moyenne.');
  const byH = [...groupBy(t.posts, p => p.hook)].map(([k, arr]) => [k, median(vals(arr, p => p.score)), arr.length]).filter(x => x[2] >= 2).sort((x, y) => y[1] - x[1]);
  if (byH.length >= 2 && byH[0][1] - byH[byH.length - 1][1] >= 20) out.push(`Dépend de l’accroche : « ${hookById(byH[0][0]).name} » ${Math.round(byH[0][1])} contre « ${hookById(byH[byH.length - 1][0]).name} » ${Math.round(byH[byH.length - 1][1])}.`);
  const byF = [...groupBy(t.posts, p => p.type)].map(([k, arr]) => [k, median(vals(arr, p => p.score)), arr.length]).filter(x => x[2] >= 2).sort((x, y) => y[1] - x[1]);
  if (byF.length >= 2 && byF[0][1] - byF[byF.length - 1][1] >= 12) out.push(`Fonctionne mieux en ${FORMATS[byF[0][0]].name.toLowerCase()} (${Math.round(byF[0][1])}) qu’en ${FORMATS[byF[byF.length - 1][0]].name.toLowerCase()} (${Math.round(byF[byF.length - 1][1])}).`);
  if (t.reachMed > a.acct.reach * 1.15 && t.fol1k < a.acct.fol1k * .8) out.push('Génère de la portée, mais peu d’abonnés : contenu « vitrine ».');
  if (t.fol1k < a.acct.fol1k && t.pvR > a.acct.pvR * 1.3) out.push('Peu d’abonnés, mais beaucoup de visites du profil : forte intention d’achat probable.');
  return out;
}
function vThemes(a) {
  let h = sec('Thèmes et piliers de contenu', `${a.themes.length} thèmes détectés`, 'Aucune catégorie n’étant définie dans la source, les publications sont classées automatiquement à partir de la légende (mots-clés, références de décor EGGER, objet apparent).') + baseNote(a);
  h += `<div class="grid g2"><div class="panel"><h4>Score médian par thème ${pv('calc')}</h4>${hbars(a.themes.map((t, i) => ({ label: t.name, v: t.scoreMed, n: t.n, hl: i === 0 && t.n >= 4, lo: t.n < 4 })), { fmt: scoreFmt, max: 100 })}<p class="conf-note">Barres claires : moins de 4 publications.</p></div>
  <div class="panel"><h4>Abonnés pour 1 000 comptes touchés ${pv('calc')}</h4>${hbars([...a.themes].sort((x, y) => (y.fol1k ?? -1) - (x.fol1k ?? -1)).map((t, i) => ({ label: t.name, v: t.fol1k, n: t.n, hl: i === 0 && t.n >= 4, lo: t.n < 4 })), { fmt: v => fmt1(v) + ' ‰' })}</div></div>`;
  h += `<div class="block"><h3>Tableau des thèmes</h3>${tblGroup(a.themes, colsStd([{ l: 'Régularité (écart interquartile)', n: 1, f: r => isNum(r.spread) ? Math.round(r.spread) + ' pts' : '—' }]))}</div>`;
  h += `<div class="block"><h3>Classement et nuances ${pv('ded')}</h3><div class="grid g2">${a.themes.map(t => `<div class="panel"><h4>${esc(t.name)} <span class="mut small">· ${t.cat} · n=${t.n}</span></h4><div style="display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 10px">${themeClass(t, a).map(([l, c]) => `<span class="pill ${c}">${l}</span>`).join('') || '<span class="pill">Sans signal net</span>'}</div><ul class="small" style="margin:0;padding-inline-start:18px;display:grid;gap:4px">${themeNuance(t, a).map(x => `<li>${x}</li>`).join('') || '<li class="mut">Rien de particulier.</li>'}</ul></div>`).join('')}</div></div>`;
  return h;
}

/* ============================================================ Formats + durées */
function vFormats(a) {
  const F = a.formats, D = S.D;
  let h = sec('Formats et durées', 'Quel format pour quel objectif', 'Chaque format est comparé à lui-même dans le score ; les moyennes ci-dessous permettent la comparaison entre formats.') + baseNote(a);
  h += tblGroup(F, colsStd([{ l: 'Impressions moy.', n: 1, f: r => fmtN(r.impressions) }, { l: 'Visites profil moy.', n: 1, f: r => fmtN(r.pv) }, { l: 'Clics', n: 1, f: () => `<span class="mut" title="${esc(NA)}">n.d.</span>` }]));
  const pickBy = (k, min = 3) => [...F].filter(f => f.n >= min && isNum(f[k])).sort((x, y) => y[k] - x[k])[0];
  const lines = [
    ['Plus grande portée', pickBy('reachMed'), f => `${fmtN(f.reachMed)} comptes touchés en médiane`],
    ['Plus d’engagement', pickBy('er'), f => `${fmtP(f.er, 2)} d’engagement / portée`],
    ['Plus d’enregistrements', pickBy('saveR'), f => `${fmtP(f.saveR, 2)} de taux d’enregistrement`],
    ['Plus de partages', pickBy('shareR'), f => `${fmtP(f.shareR, 2)} de taux de partage`],
    ['Plus d’abonnés', pickBy('fol1k'), f => `${fmt1(f.fol1k)} abonnés / 1 000 comptes touchés`],
    ['Plus forte intention d’achat', pickBy('pvR'), f => `${fmtP(f.pvR, 2)} des personnes touchées visitent le profil`],
  ];
  const more = pickBy('scoreMed', 5), less = [...F].filter(f => f.n >= 5).sort((x, y) => x.scoreMed - y.scoreMed)[0], promising = F.filter(f => f.n < 5 && f.scoreMed >= 55);
  h += `<div class="grid g3 block">${lines.map(([l, f, t]) => `<div class="panel"><p class="lab" style="color:var(--mut)">${l}</p>${f ? `<h4>${f.name}</h4><p class="small">${t(f)} · n=${f.n}</p>` : naBlock()}</div>`).join('')}</div>`;
  h += `<div class="grid g3 block" style="margin-top:14px">
   <div class="panel soft"><h4>À publier plus souvent ${pv('reco')}</h4><p class="small">${more ? `${more.name} : meilleur score médian (${scoreFmt(more.scoreMed)}) sur ${more.n} publications.` : '—'}</p></div>
   <div class="panel soft"><h4>À réduire ${pv('reco')}</h4><p class="small">${less && less !== more ? `${less.name} : score médian ${scoreFmt(less.scoreMed)} (n=${less.n}). ${less.id === 'IMAGE' ? 'Transformer les annonces en carrousels de 3 à 5 vues.' : ''}` : '—'}</p></div>
   <div class="panel soft"><h4>Prometteur, peu de données ${pv('hyp')}</h4><p class="small">${promising.length ? promising.map(f => `${f.name} (score ${scoreFmt(f.scoreMed)}, n=${f.n})`).join(', ') + ' : à tester davantage avant de conclure.' : 'Aucun format sous-représenté avec de bons résultats.'}</p></div></div>`;
  h += `<p class="conf-note">Publications collaboratives, lives et sponsorisées : ${D.avail.sponsored ? `${a.base.filter(p => p.sponsored).length} publication(s) sponsorisée(s) identifiée(s) ; score médian ${scoreFmt(median(vals(a.base.filter(p => p.sponsored), p => p.score)))} contre ${scoreFmt(median(vals(a.base.filter(p => !p.sponsored), p => p.score)))} en organique.` : 'le statut sponsorisé n’est pas fourni par la source.'} Lives : ${NA.toLowerCase()}</p>`;
  // durée
  h += `<div class="block"><h3>Analyse de la durée (reels et vidéos)</h3><p class="sub">${a.durs.reduce((s, d) => s + d.n, 0)} vidéos avec durée connue. Une tranche n’est jugée que si elle compte au moins 3 vidéos.</p>`;
  if (!D.avail.duration) return h + naBlock() + '</div>';
  const ordered = DUR.map(d => a.durs.find(x => x.id === d.id) || { id: d.id, name: d.name, n: 0 });
  h += `<div class="grid g2"><div class="panel"><h4>% moyen visionné par durée ${pv('calc')}</h4>${D.avail.avg_watch ? hbars(ordered.map(d => ({ label: d.name, v: d.ret, n: d.n, lo: d.n < 3, hl: a.dBest && d.id === a.dBest.id })), { fmt: v => fmtP(v, 0), max: 1 }) : naBlock()}</div>
  <div class="panel"><h4>Score médian par durée ${pv('calc')}</h4>${hbars(ordered.map(d => ({ label: d.name, v: d.scoreMed, n: d.n, lo: d.n < 3, hl: a.dBest && d.id === a.dBest.id })), { fmt: scoreFmt, max: 100 })}</div></div>`;
  h += `<div class="block">${tblGroup(ordered.filter(d => d.n), [{ l: 'Durée', f: r => `<b>${r.name}</b>` }, { l: 'n', n: 1, f: r => r.n }, { l: 'Portée moy.', n: 1, f: r => fmtN(r.reach) }, { l: 'Lectures moy.', n: 1, f: r => fmtN(r.views) }, { l: 'Rétention méd.', n: 1, f: r => fmtP(r.ret, 0) }, { l: 'Visionnage complet', n: 1, f: r => fmtP(r.full, 0) }, { l: 'Temps vu méd.', n: 1, f: r => fmtS(r.watch) }, { l: 'Partages moy.', n: 1, f: r => fmtN(r.shares) }, { l: 'Enreg. moy.', n: 1, f: r => fmtN(r.saves) }, { l: 'Comm. moy.', n: 1, f: r => fmtN(r.comments) }, { l: 'Abonnés', n: 1, f: r => fmtN(r.followsSum) }, { l: 'Score méd.', n: 1, f: r => scoreFmt(r.scoreMed) }, { l: 'Confiance', f: r => confPill(r.conf) }])}</div>`;
  // durée optimale par thème / objectif
  const optBy = (fn, lab) => { const rows = []; for (const [k, arr] of groupBy(a.reelsBase.filter(p => p.durB), fn)) { const best = [...groupBy(arr, p => p.durB)].map(([d, x]) => [d, median(vals(x, p => p.score)), x.length]).filter(x => x[2] >= 2).sort((x, y) => y[1] - x[1])[0]; if (best) rows.push({ k, d: best[0], s: best[1], n: best[2], tot: arr.length }); } return rows.map(r => `<tr><td>${lab(r.k)}</td><td>${DUR.find(d => d.id === r.d).name}</td><td class="n">${Math.round(r.s)}</td><td class="n">${r.n} / ${r.tot}</td><td>${confPill(confOf(r.n, null))}</td></tr>`).join(''); };
  h += `<div class="grid g2 block"><div><h4 style="margin-bottom:8px">Durée optimale par thème ${pv('calc')}</h4><div class="tbl-wrap"><table><thead><tr><th>Thème</th><th>Durée</th><th class="n">Score</th><th class="n">n</th><th>Confiance</th></tr></thead><tbody>${optBy(p => p.theme, k => esc(themeById(k).name))}</tbody></table></div></div>
  <div><h4 style="margin-bottom:8px">Durée optimale par type d’accroche ${pv('calc')}</h4><div class="tbl-wrap"><table><thead><tr><th>Accroche</th><th>Durée</th><th class="n">Score</th><th class="n">n</th><th>Confiance</th></tr></thead><tbody>${optBy(p => p.hook, k => hookById(k).name)}</tbody></table></div></div></div>`;
  h += `<div class="verdict"><p><b>Durée optimale générale :</b> ${a.dBest ? `${a.dBest.name} (score médian ${scoreFmt(a.dBest.scoreMed)}, rétention ${fmtP(a.dBest.ret, 0)}, n=${a.dBest.n}) ${confPill(a.dBest.conf)}` : 'échantillon insuffisant.'}${a.dSecond ? ` Ensuite : ${a.dSecond.name} (${scoreFmt(a.dSecond.scoreMed)}).` : ''}</p></div></div>`;
  return h;
}

/* ============================================================ Accroches + CTA */
function vAccroches(a) {
  const H = a.hooks;
  let h = sec('Analyse des accroches', `${H.length} types d’accroche`, 'L’accroche est la première phrase de la légende (le texte à l’écran n’est pas transmis par la source). Elle est classée automatiquement en 19 catégories.') + baseNote(a);
  h += `<div class="grid g2"><div class="panel"><h4>Score médian par type d’accroche ${pv('calc')}</h4>${hbars(H.map((x, i) => ({ label: x.name, v: x.scoreMed, n: x.n, hl: i === 0 && x.n >= 3, lo: x.n < 3 })), { fmt: scoreFmt, max: 100 })}</div>
  <div class="panel"><h4>Ce que génère chaque accroche ${pv('calc')}</h4><dl class="kv">
   <dt>Portée</dt><dd>${a.hReach ? `${a.hReach.name} (${fmtN(a.hReach.reachMed)} en médiane)` : '—'}</dd>
   <dt>Abonnés</dt><dd>${a.hFol ? `${a.hFol.name} (${fmt1(a.hFol.fol1k)} ‰)` : '—'}</dd>
   <dt>Commentaires</dt><dd>${a.hCom ? `${a.hCom.name} (${fmtP(a.hCom.cmR, 2)})` : '—'}</dd>
   <dt>Enregistrements</dt><dd>${a.hSave ? `${a.hSave.name} (${fmtP(a.hSave.saveR, 2)})` : '—'}</dd>
   <dt>Partages</dt><dd>${a.hShare ? `${a.hShare.name} (${fmtP(a.hShare.shareR, 2)})` : '—'}</dd>
   <dt>À répéter ${pv('reco')}</dt><dd>${H.filter(x => x.n >= 3 && x.scoreMed >= 55).map(x => x.name).join(', ') || '—'}</dd>
   <dt>À cesser ${pv('reco')}</dt><dd>${H.filter(x => x.n >= 4 && x.scoreMed < 42).map(x => x.name).join(', ') || 'aucune de façon nette'}</dd></dl></div></div>`;
  h += `<div class="block">${tblGroup(H, [{ l: 'Accroche', f: r => `<b>${r.name}</b>` }, { l: 'n', n: 1, f: r => r.n }, { l: 'Portée moy.', n: 1, f: r => fmtN(r.reach) }, { l: 'Lectures moy.', n: 1, f: r => fmtN(r.views) }, { l: 'Rétention méd.', n: 1, f: r => fmtP(r.ret, 0) }, { l: 'Partages moy.', n: 1, f: r => fmtN(r.shares) }, { l: 'Enreg. moy.', n: 1, f: r => fmtN(r.saves) }, { l: 'Comm. moy.', n: 1, f: r => fmtN(r.comments) }, { l: 'Abonnés moy.', n: 1, f: r => fmt1(r.follows) }, { l: 'Score méd.', n: 1, f: r => scoreFmt(r.scoreMed) }, { l: 'Exemple', f: r => `<div class="cap xs">« ${esc([...r.posts].sort((x, y) => y.score - x.score)[0].hookText)} »</div>` }, { l: 'Confiance', f: r => confPill(r.conf) }])}</div>`;
  const top = H.filter(x => x.n >= 3).slice(0, 4).map(x => x.id);
  const T = [
    ['avap', 'Avant / après : [PIÈCE] en [ANCIEN SOL] → [DÉCOR] en [DURÉE].', 'Portée et partages'],
    ['err', 'L’erreur qui fait [CONSÉQUENCE] quand on pose [PRODUIT].', 'Enregistrements'],
    ['warn', 'Ne choisissez pas votre [PRODUIT] avant d’avoir vérifié [CRITÈRE].', 'Enregistrements'],
    ['demo', 'On a [TEST] sur [DÉCOR] pendant [DURÉE]. Regardez le résultat.', 'Portée et rétention'],
    ['myth', 'Idée reçue : « [MYTHE] ». Voici ce qui se passe vraiment.', 'Commentaires'],
    ['cmp', '[OPTION A] ou [OPTION B] pour [PIÈCE] : la différence en [DURÉE].', 'Enregistrements'],
    ['case', 'Chez [CLIENT] à [VILLE] : [SURFACE] de [DÉCOR] posés en [DURÉE].', 'Abonnés et visites du profil'],
    ['pain', 'Marre de [PROBLÈME] ? [RÉSULTAT] sans [CONTRAINTE].', 'Portée'],
    ['list', '[N] [ERREURS / DÉCORS / QUESTIONS] à connaître avant de [ACTION].', 'Enregistrements'],
    ['res', 'Résultat : [SURFACE] rénovés en [DURÉE], sans [DOULEUR].', 'Partages'],
    ['secret', 'Ce que les vendeurs ne vous disent pas sur [SUJET].', 'Curiosité et rétention'],
    ['q', 'Vous préférez [DÉCOR A] ou [DÉCOR B] pour [PUBLIC CIBLE] ?', 'Commentaires'],
  ].sort((x, y) => (top.includes(y[0]) ? 1 : 0) - (top.includes(x[0]) ? 1 : 0));
  h += `<div class="block"><h3>12 accroches adaptables ${pv('reco')}</h3><p class="sub">Inspirées des schémas gagnants (en premier : les types les mieux notés sur le compte), sans reprendre les légendes existantes. Remplacez les variables entre crochets.</p><div class="hooks">${T.map(([id, t, g]) => { const st = H.find(x => x.id === id); return `<div class="hook"><div>${esc(t).replace(/\[([^\]]+)\]/g, '<code>[$1]</code>')}<small>${hookById(id).name} · objectif : ${g}${st ? ` · score médian actuel ${scoreFmt(st.scoreMed)} (n=${st.n})` : ' · jamais testé sur le compte'}</small></div></div>`; }).join('')}</div></div>`;
  // CTA
  const C = a.ctas;
  h += `<div class="block"><h3>Analyse des appels à l’action</h3><p class="sub">CTA détectée dans la légende, après l’accroche. Clics et conversions par publication : ${NA.toLowerCase()}</p>`;
  h += tblGroup(C, [{ l: 'CTA', f: r => `<b>${r.name}</b>` }, { l: 'n', n: 1, f: r => r.n }, { l: 'Part des contenus', n: 1, f: r => fmtP(r.n / a.base.length, 0) }, { l: 'Tx comm.', n: 1, f: r => fmtP(r.cmR, 2) }, { l: 'Tx partage', n: 1, f: r => fmtP(r.shareR, 2) }, { l: 'Tx enreg.', n: 1, f: r => fmtP(r.saveR, 2) }, { l: 'Portée → profil', n: 1, f: r => fmtP(r.pvR, 2) }, { l: 'Abonnés ‰', n: 1, f: r => fmt1(r.fol1k) }, { l: 'Score méd.', n: 1, f: r => scoreFmt(r.scoreMed) }, { l: 'Confiance', f: r => confPill(r.conf) }]);
  const over = [...C].filter(c => c.id !== 'none').sort((x, y) => y.n - x.n)[0];
  const lowQ = C.filter(c => c.n >= 3 && c.cmR > a.acct.cmR * 1.3 && c.fol1k < a.acct.fol1k * .8 && c.pvR < a.acct.pvR)[0];
  const intent = [...C].filter(c => c.n >= 3 && c.id !== 'none').sort((x, y) => y.pvR - x.pvR)[0];
  const none = C.find(c => c.id === 'none');
  h += `<div class="grid g3 block" style="margin-top:14px">
   <div class="panel"><h4>Meilleure CTA</h4><p class="small">${a.ctaBest ? `${a.ctaBest.name} : score médian ${scoreFmt(a.ctaBest.scoreMed)} (n=${a.ctaBest.n}).` : '—'}</p></div>
   <div class="panel"><h4>Surutilisée</h4><p class="small">${over ? `${over.name} : ${fmtP(over.n / a.base.length, 0)} des contenus${over.scoreMed < 50 ? `, pour un score médian de ${scoreFmt(over.scoreMed)} seulement` : ''}.` : '—'}</p></div>
   <div class="panel"><h4>Interactions de faible qualité</h4><p class="small">${lowQ ? `${lowQ.name} : beaucoup de commentaires (${fmtP(lowQ.cmR, 2)}) mais peu de visites du profil ou d’abonnés.` : 'Aucune CTA ne génère de commentaires sans intention.'}</p></div>
   <div class="panel"><h4>Intention réelle</h4><p class="small">${intent ? `${intent.name} : ${fmtP(intent.pvR, 2)} des personnes touchées visitent le profil.` : '—'}</p></div>
   <div class="panel"><h4>CTA selon l’objectif ${pv('reco')}</h4><p class="small">Enregistrements : ${a.cSave?.name || '—'} · Commentaires : ${a.cCom?.name || '—'} · Partages : ${a.cShare?.name || '—'} · Visites : ${a.cPv?.name || '—'} · Abonnés : ${a.cFol?.name || '—'}.</p></div>
   <div class="panel"><h4>Mieux sans CTA</h4><p class="small">${none ? (() => { const th = [...groupBy(none.posts, p => p.theme)].map(([k, arr]) => [k, median(vals(arr, p => p.score)), arr.length]).filter(x => x[2] >= 3).sort((x, y) => y[1] - x[1])[0]; return th && th[1] >= 55 ? `Les contenus « ${themeById(th[0]).name} » sans CTA obtiennent ${Math.round(th[1])} de score médian (n=${th[2]}) : l’image suffit.` : 'Aucun thème ne fait mieux sans CTA.'; })() : '—'}</p></div></div></div>`;
  return h;
}

/* ============================================================ Horaires */
function vHoraires(a) {
  const D = a.dows, SL = a.slots;
  let h = sec('Jours et horaires de publication', 'Quand publier', 'Heure locale d’Alger. Médiane et moyenne sont affichées côte à côte : un écart important signale qu’un contenu viral fausse la moyenne. En Algérie, le week-end tombe le vendredi et le samedi.') + baseNote(a);
  const skew = r => r.reach > r.reachMed * 1.6 ? ' <span class="pill c-md" title="La moyenne est tirée par un contenu viral">⚑ moyenne faussée</span>' : '';
  const cols = [{ l: 'Groupe', f: r => `<b>${r.name}</b>${skew(r)}` }, { l: 'n', n: 1, f: r => r.n }, { l: 'Portée moy. / méd.', n: 1, f: r => `${fmtN(r.reach)} / ${fmtN(r.reachMed)}` }, { l: 'Lectures moy.', n: 1, f: r => fmtN(r.views) }, { l: 'Eng./portée', n: 1, f: r => fmtP(r.er, 2) }, { l: 'Partages moy.', n: 1, f: r => fmtN(r.shares) }, { l: 'Enreg. moy.', n: 1, f: r => fmtN(r.saves) }, { l: 'Comm. moy.', n: 1, f: r => fmtN(r.comments) }, { l: 'Abonnés', n: 1, f: r => fmtN(r.followsSum) }, { l: 'Score moy. / méd.', n: 1, f: r => `${scoreFmt(r.score)} / <b>${scoreFmt(r.scoreMed)}</b>` }, { l: 'Confiance', f: r => confPill(r.conf) }];
  h += `<div class="grid g2"><div class="panel"><h4>Carte de chaleur · score médian ${pv('calc')}</h4>${heatmap(a.cells, 'Score médian', v => Math.round(v))}</div>
  <div class="panel"><h4>Publications par heure ${pv('ig')}</h4>${(() => { const c = Array(24).fill(0), s = Array(24).fill(null).map(() => []); a.base.forEach(p => { if (isNum(p.hour)) { c[p.hour]++; if (isNum(p.score)) s[p.hour].push(p.score); } }); return hbars(c.map((n, i) => ({ label: i + 'h', v: n, tip: `<b>${i}h</b><br>${n} publications<br>Score médian ${s[i].length ? Math.round(median(s[i])) : '—'}`, hl: s[i].length >= 3 && median(s[i]) >= 60 })).filter(r => r.v > 0), { fmt: v => v }); })()}<p class="conf-note">En rouge : heures au score médian ≥ 60 (au moins 3 publications).</p></div></div>`;
  h += `<div class="block"><h3>Par jour de la semaine</h3>${tblGroup(DOW_ORDER.map(d => D.find(x => x.id === d)).filter(Boolean), cols)}</div>`;
  h += `<div class="block"><h3>Par tranche horaire</h3>${tblGroup(SLOTS.map(s => SL.find(x => x.id === s.id)).filter(Boolean), cols)}</div>`;
  const tops = a.dowsRank.slice(0, 3), topS = a.slotsRank.slice(0, 3);
  const most = [...SL].sort((x, y) => y.n - x.n)[0];
  const regular = [...SL].filter(s => s.n >= 5).sort((x, y) => (x.spread ?? 99) - (y.spread ?? 99))[0];
  const test = SL.filter(s => s.n < 5 && s.scoreMed >= 50);
  const worst = [...SL].filter(s => s.n >= 4).sort((x, y) => x.scoreMed - y.scoreMed)[0];
  h += `<div class="grid g3 block">
   <div class="panel"><h4>3 meilleurs jours ${pv('reco')}</h4><ol class="small" style="margin:6px 0 0;padding-inline-start:18px">${tops.map(d => `<li>${d.name} : ${scoreFmt(d.scoreMed)} (n=${d.n}) ${confPill(d.conf)}</li>`).join('') || '<li>Échantillon insuffisant</li>'}</ol></div>
   <div class="panel"><h4>3 meilleures tranches ${pv('reco')}</h4><ol class="small" style="margin:6px 0 0;padding-inline-start:18px">${topS.map(d => `<li>${d.name} : ${scoreFmt(d.scoreMed)} (n=${d.n}) ${confPill(d.conf)}</li>`).join('') || '<li>Échantillon insuffisant</li>'}</ol></div>
   <div class="panel"><h4>À retenir</h4><dl class="kv small" style="grid-template-columns:1fr"><dt>Le plus utilisé</dt><dd>${most ? `${most.name} (${most.n} publications)` : '—'}</dd><dt>Le plus régulier</dt><dd>${regular ? `${regular.name} (écart interquartile ${Math.round(regular.spread)} pts)` : '—'}</dd><dt>À continuer de tester</dt><dd>${test.map(s => s.name).join(', ') || 'aucune tranche sous-testée prometteuse'}</dd><dt>Le moins efficace</dt><dd>${worst ? `${worst.name} (${scoreFmt(worst.scoreMed)})` : '—'}</dd></dl></div></div>`;
  const cal = weekPlan(a);
  h += `<div class="block"><h3>Calendrier hebdomadaire suggéré ${pv('reco')}</h3><p class="sub">Construit à partir des meilleures combinaisons jour × tranche (au moins 3 publications) et des thèmes les plus forts par objectif.</p>${tblGroup(cal, [{ l: 'Jour', f: r => `<b>${r.day}</b>` }, { l: 'Heure', f: r => r.hour }, { l: 'Format', f: r => r.fmt }, { l: 'Thème', f: r => r.theme }, { l: 'Objectif', f: r => r.obj }, { l: 'Pourquoi ce créneau', f: r => `<span class="small">${r.why}</span>` }])}</div>`;
  return h;
}
function bestHourIn(a, slot) { const c = {}; a.base.filter(p => p.slot === slot && isNum(p.score)).forEach(p => { (c[p.hour] = c[p.hour] || []).push(p.score); }); const e = Object.entries(c).filter(x => x[1].length >= 2).sort((x, y) => median(y[1]) - median(x[1]))[0]; return e ? e[0].padStart(2, '0') + ':00' : { nuit: '22:30', matin: '10:00', midi: '12:30', aprem: '17:30', soir: '20:00' }[slot]; }
function weekPlan(a) {
  const cells = a.cellsRank.slice(0, 8), used = new Set(), pick = [];
  for (const [k, c] of cells) { const [d, s] = k.split('|'); if (used.has(d)) continue; used.add(d); pick.push({ d: +d, s, c }); if (pick.length >= 4) break; }
  while (pick.length < 4) { const d = [4, 5, 2, 0].find(x => !used.has(String(x))); used.add(String(d)); pick.push({ d, s: 'soir', c: null }); }
  const objs = [['Portée', a.tReach], ['Autorité', a.tSave], ['Croissance', a.tFol], ['Conversion', a.tPv]];
  return pick.sort((x, y) => DOW_ORDER.indexOf(x.d) - DOW_ORDER.indexOf(y.d)).map((p, i) => {
    const [obj, th] = objs[i % objs.length];
    const bf = th ? [...groupBy(th.posts, q => q.type)].map(([k, arr]) => [k, median(vals(arr, q => q.score)), arr.length]).filter(x => x[2] >= 2).sort((x, y) => y[1] - x[1])[0] : null;
    return { d: p.d, s: p.s, day: DOW[p.d], hour: bestHourIn(a, p.s), fmt: bf ? FORMATS[bf[0]].name : 'Reel', theme: th?.name || '—', themeId: th?.id, obj, why: p.c ? `Score médian ${Math.round(p.c.v)} sur ${p.c.n} publications (${SLOTS.find(x => x.id === p.s).short.toLowerCase()})` : 'Créneau à tester (données insuffisantes)' };
  });
}

/* ============================================================ Audience */
function vAudience(a) {
  const D = S.D, Au = D.audience || {}, K = a.K;
  let h = sec('Audience et croissance', 'Qui suit le compte, et comment il grandit', D.source === 'demo' ? 'Répartitions démographiques : valeurs d’exemple.' : 'Répartitions démographiques telles que transmises par Windsor.ai.');
  const dist = (t, arr, k) => `<div class="panel"><h4>${t} ${pv(D.source === 'demo' ? 'ex' : 'ig')}</h4>${arr ? hbars(arr.map(([l, v], i) => ({ label: l, v, hl: i === 0 && k !== 'ages' && k !== 'gender' })), { fmt: v => fmt1(v) + ' %', max: Math.max(...arr.map(x => x[1])) }) : naBlock()}</div>`;
  h += `<div class="grid g4">${dist('Villes', Au.cities, 'c')}${dist('Pays', Au.countries, 'p')}${dist('Âge', Au.ages, 'ages')}${dist('Genre', Au.gender, 'gender')}</div>`;
  h += `<div class="grid g2 block"><div class="panel"><h4>Heures de plus forte activité ${pv(D.source === 'demo' ? 'ex' : 'ig')}</h4>${Au.online ? (() => { const mx = Math.max(...Au.online); return chartSlot(el => drawCols(el, { x: Au.online.map((_, i) => i), v: Au.online, name: 'Abonnés en ligne (indice)', hl: Au.online.map((v, i) => v >= mx * .85 ? i : -1).filter(i => i >= 0), xfmt: i => i + 'h', fmt: v => Math.round(v), h: 170 }), 170); })() + `<p class="conf-note">Pic d’activité : ${Au.online.map((v, i) => [i, v]).sort((x, y) => y[1] - x[1]).slice(0, 3).map(x => x[0] + 'h').join(', ')}.</p>` : naBlock()}</div>
  <div class="panel"><h4>Portée abonnés / non-abonnés</h4>${Au.followerReachShare ? '' : naBlock() + '<p class="conf-note">Indicateur de remplacement : la corrélation entre portée et nouveaux abonnés (onglet Évolution) et le ratio visites → abonnés ci-dessous.</p>'}</div></div>`;
  const f1k = ratio(sum(vals(a.P, p => p.follows)), sum(vals(a.P, p => p.reach)));
  const pvR = ratio(sum(vals(a.P, p => p.profile_visits)), sum(vals(a.P, p => p.reach)));
  const pv2f = ratio(K.gained, K.pv);
  const growthD = isNum(K.net) ? K.net / a.n : null;
  h += `<div class="block"><h3>Indicateurs de croissance ${pv('calc')}</h3><div class="kpis">
   ${[['Portée → visite du profil', fmtP(pvR, 2), 'contenus de la période'], ['Visite du profil → abonné', fmtP(pv2f, 1), 'abonnés gagnés / visites du profil (compte)'], ['Abonnés / 1 000 comptes touchés', isNum(f1k) ? fmt1(f1k * 1000) : '—', 'attribués aux contenus'], ['Abonnés gagnés / publication', fmt1(K.folPost), 'attribués aux contenus'], ['Croissance nette / jour', fmt1(growthD), 'abonnés'], ['Croissance nette / semaine', fmt1(isNum(growthD) ? growthD * 7 : null), 'abonnés'], ['Croissance nette / mois', fmtN(isNum(growthD) ? growthD * 30 : null), 'abonnés']].map(([l, v, s]) => `<div class="kpi"><div class="k">${l}</div><div class="v">${v}</div><div class="na">${s}</div></div>`).join('')}</div></div>`;
  const tf = [...a.P].filter(p => isNum(p.follows)).sort((x, y) => y.follows - x.follows).slice(0, 5), tp = [...a.P].filter(p => isNum(p.profile_visits)).sort((x, y) => y.profile_visits - x.profile_visits).slice(0, 5);
  h += `<div class="grid g2 block"><div class="panel"><h4>Publications qui ont généré le plus d’abonnés</h4><div class="toplists" style="display:block"><ol>${tf.map(p => `<li><span>${plabel(p, 46)}</span><b>${fmtN(p.follows)}</b></li>`).join('') || '<li>—</li>'}</ol></div></div>
  <div class="panel"><h4>Publications qui ont généré le plus de visites du profil</h4><div class="toplists" style="display:block"><ol>${tp.map(p => `<li><span>${plabel(p, 46)}</span><b>${fmtN(p.profile_visits)}</b></li>`).join('') || '<li>—</li>'}</ol></div></div></div>`;
  // problèmes
  const pb = [];
  if (isNum(pvR) && pvR < .006) pb.push(['Beaucoup de portée, peu de visites du profil', `${fmtP(pvR, 2)} des personnes touchées visitent le profil`, 'Donner une raison de cliquer : série en plusieurs parties, « décor en stock : infos sur le profil ».']);
  if (isNum(pv2f) && pv2f < .08) pb.push(['Beaucoup de visites du profil, peu d’abonnés', `${fmtP(pv2f, 1)} des visites deviennent des abonnements`, 'Retravailler la bio (promesse claire : « Sols EGGER en stock · showroom Dar El Beïda · devis sur place ») et épingler 3 réalisations clients.']);
  const vir = a.P.filter(p => p.viral); if (vir.length && sum(vir.map(p => p.follows || 0)) > .4 * sum(vals(a.P, p => p.follows))) pb.push(['Dépendance excessive à un seul contenu', `${vir.length} contenu(s) viral(aux) apportent plus de 40 % des abonnés attribués`, 'Construire une série régulière autour du format viral plutôt que d’attendre le prochain pic.']);
  const t = a.tReach; if (t && ['deco', 'comm'].includes(t.id) && t.fol1k < a.acct.fol1k) pb.push(['Croissance portée par un thème peu monétisable', `« ${t.name} » apporte la portée mais ${fmt1(t.fol1k)} ‰ d’abonnés seulement`, 'Associer chaque contenu inspiration à une information d’achat (référence, disponibilité, visite).']);
  if (!D.avail.acc_new_follows) pb.push(['Données d’abonnés quotidiennes absentes', NA, 'Ajouter le champ follower_count dans l’export Windsor.ai.']);
  h += `<div class="block"><h3>Problèmes détectés ${pv('hyp')}</h3>${pb.length ? `<div class="alerts">${pb.map(([t, m, ac]) => `<div class="alert warn"><span class="ic">Vigilance</span><b>${t}</b><dl><dt>Métrique</dt><dd>${m}</dd><dt>Action</dt><dd>${ac}</dd></dl></div>`).join('')}</div>` : '<p class="na-msg">Aucun déséquilibre net détecté.</p>'}</div>`;
  return h;
}

/* ============================================================ Conversions */
function vConversions(a) {
  const K = a.K, D = S.D;
  const steps = [['Impressions', K.impressions], ['Portée', K.reach], ['Lectures', K.views], ['Interactions', K.inter], ['Visites du profil', K.pv], ['Abonnements', K.gained], ['Clics', K.clicks], ['Leads', null], ['Ventes', null]];
  const av = steps.filter(s => isNum(s[1]));
  let h = sec('Métriques de conversion', 'Entonnoir de la période', 'Les étapes sans donnée sont signalées et ne sont pas estimées. Leads et ventes ne transitent pas par Instagram : à relier aux devis signés au showroom.');
  const mx = Math.max(...av.map(s => s[1]));
  const convs = av.map((s, i) => i ? ratio(s[1], av[i - 1][1]) : null);
  let leakI = -1, leakV = 2; convs.forEach((c, i) => { if (isNum(c) && i >= 3 && c < leakV) { leakV = c; leakI = i; } });
  h += `<div class="panel"><div class="funnel">${steps.map(s => { const i = av.indexOf(s); if (!isNum(s[1])) return `<div class="fstep"><span>${s[0]}</span><span class="mut small">${NA}</span></div>`; return `<div class="fstep"><span>${s[0]}</span><div class="fb${i === leakI ? ' leak' : ''}" style="width:${Math.max(8, Math.sqrt(s[1] / mx) * 100)}%">${fmtK(s[1])}</div>${i ? `<span class="fconv${i === leakI ? ' leak' : ''}">${fmtP(convs[i], 2)} de l’étape précédente${i === leakI ? ' · principal point de fuite' : ''}</span>` : ''}</div>`; }).join('')}</div><p class="conf-note">Largeur en racine carrée pour garder les dernières étapes lisibles. Le passage Portée → Lectures dépasse 100 % : une personne peut voir un contenu plusieurs fois.</p></div>`;
  const leakName = leakI >= 0 ? av[leakI - 1][0] + ' → ' + av[leakI][0] : null;
  const top = (k, n = 5) => [...a.P].filter(p => isNum(p[k])).sort((x, y) => y[k] - x[k]).slice(0, n);
  h += `<div class="grid g3 block">
   <div class="panel"><h4>Plus de personnes vers le profil</h4><div class="toplists" style="display:block"><ol>${top('profile_visits').map(p => `<li><span>${plabel(p, 36)}</span><b>${fmtN(p.profile_visits)}</b></li>`).join('') || '<li>—</li>'}</ol></div></div>
   <div class="panel"><h4>Plus d’abonnés</h4><div class="toplists" style="display:block"><ol>${top('follows').map(p => `<li><span>${plabel(p, 36)}</span><b>${fmtN(p.follows)}</b></li>`).join('') || '<li>—</li>'}</ol></div></div>
   <div class="panel"><h4>Plus de messages (réponses aux stories)</h4>${D.avail.replies ? `<div class="toplists" style="display:block"><ol>${top('replies').map(p => `<li><span>${plabel(p, 36)}</span><b>${fmtN(p.replies)}</b></li>`).join('')}</ol></div>` : naBlock()}</div></div>
   <p class="conf-note">Contenus qui génèrent le plus de clics ou de conversions : ${NA.toLowerCase()} (clics disponibles uniquement au niveau du compte).</p>`;
  const recs = [
    { t: 'Portée → interactions', c: `${fmtP(ratio(K.inter, K.reach), 2)} des personnes touchées interagissent.`, i: 'Les contenus inspiration sont vus mais peu utiles à garder.', a: `Ajouter une information à enregistrer (référence, classe d’usage, épaisseur) à chaque contenu décor ; CTA « ${a.cSave?.name || 'Enregistrer'} ».`, prio: 'Moyenne', conf: confOf(a.P.length, null), m: 'Taux d’enregistrement' },
    { t: 'Interactions → visites du profil', c: `${fmtP(ratio(K.pv, K.inter), 1)} de visites par interaction.`, i: 'L’intérêt ne se transforme pas toujours en curiosité pour la marque.', a: `Terminer les reels « ${a.tPv?.name || 'Réalisations clients'} » par « tous les décors en stock sont sur notre profil ».`, prio: leakName && leakName.includes('profil') ? 'Haute' : 'Moyenne', conf: confOf(a.P.length, null), m: 'Portée → visite du profil' },
    { t: 'Visites du profil → abonnements', c: `${fmtP(ratio(K.gained, K.pv), 1)} des visites deviennent des abonnements.`, i: 'La bio et les stories à la une décident de l’abonnement.', a: 'Bio : « Représentant EGGER en Algérie · décors en stock · showroom Dar El Beïda sur RDV » + 3 stories à la une (Réalisations, Décors en stock, Visite).', prio: leakName && leakName.includes('Abonnements') ? 'Haute' : 'Moyenne', conf: { id: 'md', name: 'Confiance moyenne', why: 'bonne pratique, effet non mesuré sur ce compte' }, m: 'Visite → abonné' },
    { t: 'Visites du profil → clics', c: isNum(K.clicks) ? `${fmtP(ratio(K.clicks, K.pv), 1)} des visites cliquent sur un lien.` : NA, i: 'Le lien de la bio est le seul chemin mesurable vers la prise de rendez-vous.', a: 'Un seul lien, direct vers la prise de rendez-vous ou WhatsApp, annoncé dans les stories 2 fois par semaine.', prio: leakName && leakName.includes('Clics') ? 'Haute' : 'Moyenne', conf: { id: 'md', name: 'Confiance moyenne', why: 'clics disponibles au niveau du compte seulement' }, m: 'Clics sur les liens / visites du profil' },
  ];
  h += `<div class="block"><h3>Améliorer chaque étape ${pv('reco')}</h3>${leakName ? `<p class="sub">Principal point de fuite mesuré : <b>${leakName}</b> (${fmtP(leakV, 2)}).</p>` : ''}<div class="grid g2">${recs.map(rec).join('')}</div></div>`;
  return h;
}

/* ============================================================ Opportunités + formule */
function buildOpps(a) {
  const out = [], A0 = a.acct;
  const add = (title, obs, action, impact, ease, urg, conf, res) => out.push({ title, obs, action, impact, ease, urg, conf, res, rank: impact * 2 + ease + urg + (conf.id === 'hi' ? 2 : conf.id === 'md' ? 1 : 0) });
  const share = t => t.n / Math.max(1, a.base.length);
  for (const t of a.themes.filter(t => t.n >= 3 && t.scoreMed >= 58 && share(t) < .14)) add(`Thème performant peu publié : ${t.name}`, `Score médian ${scoreFmt(t.scoreMed)} pour ${fmtP(share(t), 0)} des publications (n=${t.n}).`, `Passer « ${t.name} » à 1 publication par semaine pendant 4 semaines.`, 3, 3, 2, t.conf, 'Faibles');
  for (const f of a.formats.filter(f => f.n >= 3 && f.n / a.base.length < .2 && f.scoreMed >= 55)) add(`Format sous-utilisé : ${f.name}`, `Score médian ${scoreFmt(f.scoreMed)} sur ${f.n} publications.`, `Publier 2 ${f.name.toLowerCase()}s supplémentaires par mois.`, 2, 3, 1, f.conf, 'Faibles');
  const old = a.base.length ? S.D.posts.filter(p => p.age > 120 && p.score >= 80 && p.type !== 'STORY').sort((x, y) => y.score - x.score).slice(0, 3) : [];
  if (old.length) add('Anciens contenus à mettre à jour', `${old.length} contenus de plus de 4 mois ont un score ≥ 80, dont « ${old[0].hookText.slice(0, 60)} » (${fmtDay(old[0].day)}).`, `Refaire « ${old[0].hookText.slice(0, 50)} » avec un autre décor en stock et une accroche plus courte.`, 3, 2, 2, { id: 'md', name: 'Confiance moyenne', why: 'succès passé, audience partiellement renouvelée' }, 'Tournage 1/2 journée');
  const reelTop = a.reelsBase.filter(p => p.score >= 80 && p.saveR > A0.saveR * 1.3)[0];
  if (reelTop) add('Reel réussi à transformer en carrousel', `« ${reelTop.hookText.slice(0, 60)} » : ${fmtX(reelTop.idx.saveR)} d’enregistrements.`, 'En faire un carrousel de 6 vues (étapes + fiche technique EGGER) : le format le plus enregistré.', 2, 3, 1, { id: 'md', name: 'Confiance moyenne', why: 'le carrousel est le format le plus enregistré du compte' }, 'Graphisme 2 h');
  const carTop = a.base.filter(p => p.type === 'CAROUSEL' && p.score >= 80)[0];
  if (carTop) add('Carrousel réussi à transformer en vidéo', `« ${carTop.hookText.slice(0, 60)} » (score ${carTop.score}).`, 'Tourner la même démonstration en reel de 20-30 s pour toucher les non-abonnés.', 2, 2, 1, { id: 'lo', name: 'Confiance faible', why: 'transfert de format non encore testé' }, 'Tournage 2 h');
  if (a.bestTheme && a.bestTheme.n >= 5) add(`Transformer « ${a.bestTheme.name} » en série`, `Meilleur thème (score médian ${scoreFmt(a.bestTheme.scoreMed)}, n=${a.bestTheme.n}).`, `Lancer une série numérotée « ${a.bestTheme.id === 'reno' ? 'Rénover sans casser' : a.bestTheme.id === 'real' ? 'Chantier de la semaine' : a.bestTheme.name} » : même ouverture, même jour, un épisode par semaine.`, 3, 2, 3, a.bestTheme.conf, 'Planning de tournage');
  const saveNoShare = a.themes.filter(t => t.n >= 4 && t.saveR > A0.saveR * 1.4 && t.shareR < A0.shareR)[0];
  if (saveNoShare) add('Beaucoup d’enregistrements, peu de partages', `« ${saveNoShare.name} » : enregistrements ${fmtP(saveNoShare.saveR, 2)}, partages ${fmtP(saveNoShare.shareR, 2)}.`, 'Ajouter un angle « à envoyer » : « Envoyez-le à la personne qui rénove en ce moment ».', 2, 3, 1, saveNoShare.conf, 'Aucune');
  const shareNoPv = a.themes.filter(t => t.n >= 4 && t.shareR > A0.shareR * 1.3 && t.pvR < A0.pvR)[0];
  if (shareNoPv) add('Beaucoup de partages, peu de visites du profil', `« ${shareNoPv.name} » circule (${fmtP(shareNoPv.shareR, 2)}) mais amène peu vers le profil (${fmtP(shareNoPv.pvR, 2)}).`, 'Nommer le showroom et « décors en stock » dans les 3 premières secondes et dans la légende.', 2, 3, 2, shareNoPv.conf, 'Aucune');
  const hiEng = a.base.filter(p => (p.idx.er ?? 0) >= 1.5 && (p.idx.reach ?? 1) < .7).length;
  if (hiEng >= 3) add('Fort engagement, peu de portée', `${hiEng} contenus engagent 1,5× plus que la médiane mais touchent moins de 70 % de la portée habituelle.`, 'Les republier en reel (format le plus diffusé) avec une accroche de type démonstration.', 2, 2, 1, confOf(hiEng, null), 'Montage 1 h / contenu');
  const noCtaTop = a.base.filter(p => p.cta === 'none' && p.score >= 75).length;
  if (noCtaTop >= 2) add('Publications performantes sans CTA', `${noCtaTop} contenus à score ≥ 75 n’ont aucun appel à l’action.`, `Tester la même structure avec une CTA « ${a.cPv?.name || 'Réserver une visite'} » pour convertir cette attention.`, 2, 3, 2, confOf(noCtaTop, null), 'Aucune');
  const comm = a.base.filter(p => (p.comments || 0) >= 10).length;
  add('Commentaires à transformer en contenus', `${comm} publications ont reçu 10 commentaires ou plus.`, 'Relever les 5 questions les plus fréquentes (prix au m², pose sur carrelage, cuisine, livraison en wilaya) et y répondre en reels « Vos questions ».', 2, 3, 1, { id: 'lo', name: 'Confiance faible', why: 'le texte des commentaires n’est pas fourni par la source' }, 'Lecture des commentaires');
  const sea = S.D.posts.filter(p => p.day.slice(5, 7) === addDays(S.D.ref, 30).slice(5, 7) && p.score >= 70 && p.age > 300);
  if (sea.length) add('Contenu saisonnier à republier', `${sea.length} contenus du même mois l’an dernier ont bien marché (ex. « ${sea[0].hookText.slice(0, 50)} »).`, 'Les actualiser pour le mois prochain (rentrée, rénovation avant l’hiver, sol chaud).', 2, 3, 2, { id: 'md', name: 'Confiance moyenne', why: 'une seule saison observée' }, 'Faibles');
  return out.sort((x, y) => y.rank - x.rank);
}
const meter = (v, max = 3) => `<span class="meter" aria-label="${v} sur ${max}">${Array.from({ length: max }, (_, i) => `<i class="${i < v ? 'on' : ''}"></i>`).join('')}</span>`;
function formula(a) {
  const F = [];
  const t2 = a.themes.filter(t => t.n >= 4).slice(0, 2);
  F.push(['Thèmes qui fonctionnent le mieux', t2.map(t => `${t.name} (${scoreFmt(t.scoreMed)})`).join(', ') || '—', t2[0]?.conf]);
  const h2 = a.hooks.filter(t => t.n >= 3).slice(0, 3);
  F.push(['Types d’accroche les plus efficaces', h2.map(t => `${t.name} (${scoreFmt(t.scoreMed)})`).join(', ') || '—', h2[0]?.conf]);
  F.push(['Durées recommandées', a.dBest ? `${a.dBest.name}${a.dSecond ? ', puis ' + a.dSecond.name : ''} (rétention ${fmtP(a.dBest.ret, 0)})` : '—', a.dBest?.conf]);
  F.push(['Formats les plus efficaces', a.formats.filter(f => f.n >= 3).slice(0, 2).map(f => `${f.name} (${scoreFmt(f.scoreMed)})`).join(', '), a.fBest?.conf]);
  const emo = h2.map(h => ({ avap: 'satisfaction de la transformation', demo: 'surprise', err: 'peur de mal faire', warn: 'prudence', case: 'confiance', res: 'satisfaction', pain: 'soulagement', myth: 'curiosité', cmp: 'besoin de choisir' }[h.id])).filter(Boolean);
  F.push(['Émotions qui génèrent les meilleurs résultats', emo.join(', ') || 'non déterminable', { id: 'lo', name: 'Confiance faible', why: 'émotion déduite du type d’accroche, pas de la vidéo' }]);
  F.push(['Structures les plus reproductibles', `Résultat montré en 1re seconde → preuve (pose, test, chantier) → nom et référence du décor → CTA`, { id: 'md', name: 'Confiance moyenne', why: 'commune aux accroches les mieux notées' }]);
  F.push(['CTA recommandées', [a.cSave && `enregistrer (${a.cSave.name})`, a.cPv && `visite (${a.cPv.name})`, a.cCom && `commentaire (${a.cCom.name})`].filter(Boolean).join(' · '), a.ctaBest?.conf]);
  F.push(['Jours et horaires favorables', `${a.dowsRank.slice(0, 2).map(d => d.name).join(', ')} · ${a.slotsRank.slice(0, 2).map(s => s.name).join(', ')}`, a.dowsRank[0]?.conf]);
  const err = [a.hWorst && `accroche « ${a.hWorst.name.toLowerCase()} »`, a.worstTheme && `thème « ${a.worstTheme.name} » seul`, a.durs.filter(d => d.n >= 3).slice(-1)[0] && `vidéos de ${a.durs.filter(d => d.n >= 3).slice(-1)[0].name}`].filter(Boolean);
  F.push(['Erreurs à éviter', err.join(', ') || '—', { id: 'md', name: 'Confiance moyenne', why: 'plus faibles scores médians avec au moins 3 publications' }]);
  return F;
}
function vOpportunites(a) {
  let h = sec('Formule du contenu gagnant', 'Les schémas qui reviennent chez les meilleurs contenus', 'Chaque conclusion porte un niveau de confiance selon le nombre de publications et la régularité des résultats. Survolez le niveau pour voir la justification.') + baseNote(a);
  h += `<div class="tbl-wrap"><table><thead><tr><th>Élément</th><th>Ce que montrent les données</th><th>Confiance</th><th>Pourquoi</th></tr></thead><tbody>${formula(a).map(([k, v, c]) => `<tr><td><b>${k}</b></td><td>${v}</td><td>${confPill(c)}</td><td class="small mut">${c ? esc(c.why) : '—'}</td></tr>`).join('')}</tbody></table></div>`;
  h += `<div class="block"><div class="sec-h" style="margin-bottom:12px"><div><p class="lab">Opportunités de croissance</p><h2>${a.opps.length} opportunités classées</h2><p class="lede">Classement : impact × 2 + facilité + urgence + confiance.</p></div></div>`;
  h += `<div class="tbl-wrap opp"><table><thead><tr><th>Opportunité</th><th>Constat</th><th>Action</th><th>Impact</th><th>Facilité</th><th>Urgence</th><th>Confiance</th><th>Ressources</th></tr></thead><tbody>${a.opps.map(o => `<tr><td><b>${o.title}</b></td><td>${o.obs}</td><td>${o.action}</td><td>${meter(o.impact)}</td><td>${meter(o.ease)}</td><td>${meter(o.urg)}</td><td>${confPill(o.conf)}</td><td>${o.res}</td></tr>`).join('')}</tbody></table></div></div>`;
  return h;
}

/* ============================================================ Plan d'action */
function vPlan(a) {
  const bt = a.bestTheme, K = a.K, wk = weekPlan(a);
  const reelD = a.dBest?.name || '21-30 s';
  const h1 = a.hShare || a.hBest, h2 = a.hSave || a.hooks[1];
  const reuse = S.D.posts.filter(p => p.age > 90 && p.score >= 80 && p.type !== 'STORY').sort((x, y) => y.score - x.score)[0];
  const freqNow = K.freq, freqRec = clamp(Math.round(isNum(freqNow) ? (a.state.some(s => s.id === 'plusmoins') ? freqNow - 1 : Math.max(3, freqNow)) : 4), 3, 5);
  const fmtMix = (() => { const r = a.formats.filter(f => f.n >= 3); const tot = sum(r.map(f => Math.max(0, f.scoreMed - 30))); return r.map(f => [f.name, Math.round(Math.max(0, f.scoreMed - 30) / tot * 100)]).filter(x => x[1] > 0); })();
  const pil = a.themes.filter(t => t.n >= 3).slice(0, 5); const pilTot = sum(pil.map(t => Math.max(1, t.scoreMed - 35)));
  let h = sec("Plan d'action", '7, 30 et 90 jours', 'Chaque recommandation est reliée à un schéma mesuré. Format : constat, interprétation, action, priorité, confiance, métrique à surveiller.') + baseNote(a);
  h += `<div class="block" style="margin-top:0"><h3>Les 7 prochains jours</h3><div class="grid g2" style="margin-top:12px">`;
  h += rec({ t: 'Quoi publier', c: `« ${bt?.name} » a le meilleur score médian (${scoreFmt(bt?.scoreMed)}, n=${bt?.n}).`, i: 'C’est le sujet que l’audience récompense le plus régulièrement.', a: `Publier ${wk.length} contenus : ${wk.map(w => `${w.day.toLowerCase()} ${w.hour} (${w.fmt.toLowerCase()}, ${w.theme})`).join(' ; ')}.`, prio: 'Haute', conf: bt?.conf, m: 'Score médian de la semaine ≥ ' + scoreFmt(a.acct.score) });
  h += rec({ t: 'Thèmes, formats et accroches', c: `Accroche « ${h1?.name} » : partages ${fmtP(h1?.shareR, 2)} ; « ${h2?.name} » : enregistrements ${fmtP(h2?.saveR, 2)}.`, i: 'Deux leviers distincts : diffusion (partages) et autorité (enregistrements).', a: `2 reels de ${reelD} sur « ${a.tShare?.name || bt?.name} » avec une accroche « ${h1?.name.toLowerCase()} » ; 1 carrousel « ${a.tSave?.name} » avec une accroche « ${h2?.name.toLowerCase()} ».`, prio: 'Haute', conf: h1?.conf, m: 'Taux de partage et taux d’enregistrement' });
  h += rec({ t: 'CTA et horaires', c: `Meilleure CTA : ${a.ctaBest?.name || '—'} ; meilleurs créneaux : ${a.cellsRank.slice(0, 2).map(([k, c]) => DOW[k.split('|')[0]] + ' ' + SLOTS.find(s => s.id === k.split('|')[1]).short.toLowerCase() + ` (${Math.round(c.v)})`).join(', ') || '—'}.`, i: 'Les créneaux cités combinent volume suffisant et score élevé.', a: `CTA « ${a.cSave?.name || 'Enregistrer'} » sur le contenu éducatif, « ${a.cPv?.name || 'Réserver une visite'} » sur la réalisation client. Tester ${a.slots.filter(s => s.n < 5)[0]?.name || 'le créneau de midi'} une fois.`, prio: 'Moyenne', conf: a.dowsRank[0]?.conf, m: 'Visites du profil par publication' });
  h += rec({ t: 'Réutiliser et expérimenter', c: reuse ? `« ${reuse.hookText.slice(0, 70)} » (${fmtDay(reuse.day)}) : score ${reuse.score}.` : 'Aucun ancien contenu à fort score.', i: 'Une partie de l’audience actuelle ne l’a jamais vu.', a: `${reuse ? 'Refaire ce contenu avec un autre décor et une accroche de 8 mots maximum.' : ''} Lancer l’expérience n°1 de l’onglet Expériences.`, prio: 'Moyenne', conf: { id: 'md', name: 'Confiance moyenne', why: 'succès passé' }, m: 'Portée vs original' });
  h += `</div></div>`;
  h += `<div class="block"><h3>Les 30 prochains jours</h3><div class="grid g2" style="margin-top:12px">`;
  h += rec({ t: 'Fréquence et répartition des formats', c: `Fréquence actuelle : ${fmt1(freqNow)} / semaine. Scores médians : ${a.formats.filter(f => f.n >= 3).map(f => `${f.name} ${scoreFmt(f.scoreMed)}`).join(', ')}.`, i: a.state.some(s => s.id === 'plusmoins') ? 'Le volume a augmenté plus vite que la qualité.' : 'Le rythme actuel est tenable ; la répartition peut être optimisée.', a: `${freqRec} publications par semaine : ${fmtMix.map(([n, p]) => `${n} ${p} %`).join(', ')}. Stories : 3 à 5 par semaine pour le showroom et les arrivages.`, prio: 'Haute', conf: a.fBest?.conf, m: 'Score médian mensuel et abonnés gagnés' });
  h += rec({ t: 'Piliers de contenu', c: pil.map(t => `${t.name} ${scoreFmt(t.scoreMed)}`).join(' · '), i: 'Pondération proportionnelle au score, pour garder de la variété.', a: pil.map(t => `${t.name} ${Math.round(Math.max(1, t.scoreMed - 35) / pilTot * 100)} %`).join(', ') + '.', prio: 'Haute', conf: pil[0]?.conf, m: 'Part des publications au-dessus de 50' });
  h += rec({ t: 'Séries et tests créatifs', c: `Thème le plus régulier : ${bt?.name}.`, i: 'Une série crée un rendez-vous et facilite la production.', a: `1 série hebdomadaire « ${bt?.id === 'reno' ? 'Rénover sans casser' : bt?.id === 'real' ? 'Chantier de la semaine' : bt?.name} » + 4 tests créatifs dans le mois (1 par semaine, voir Expériences).`, prio: 'Moyenne', conf: bt?.conf, m: 'Score médian de la série vs reste' });
  const drop = [a.hWorst && `accroches « ${a.hWorst.name.toLowerCase()} »`, a.worstTheme && `« ${a.worstTheme.name} » en publication isolée`, a.formats.filter(f => f.n >= 5).slice(-1)[0] && `${a.formats.filter(f => f.n >= 5).slice(-1)[0].name.toLowerCase()}s sans information utile`].filter(Boolean);
  h += rec({ t: 'Idées à répéter / à abandonner', c: `À répéter : ${a.hooks.filter(x => x.n >= 3).slice(0, 2).map(x => x.name).join(', ')}. À abandonner : ${drop.join(', ')}.`, i: 'Écarts de score médian supérieurs à 15 points.', a: 'Remplacer les annonces d’arrivage seules par une démonstration du décor arrivé (test, pose, rendu en pièce).', prio: 'Moyenne', conf: a.hWorst?.conf, m: 'Score médian des contenus « Offres et arrivages »' });
  h += `</div><p class="conf-note">Métriques à surveiller sur 30 jours : score médian, taux d’enregistrement, taux de partage, portée → visite du profil, visites → abonnés, clics sur le lien.</p></div>`;
  const tgtF = isNum(K.gained) ? Math.round(K.gained / a.n * 90 * 1.15) : null;
  h += `<div class="block"><h3>Les 90 prochains jours</h3><div class="grid g2" style="margin-top:12px">`;
  h += rec({ t: 'Objectifs réalistes', c: `Rythme actuel : ${isNum(K.gained) ? fmtN(K.gained / a.n * 90) : '—'} abonnés gagnés et ${fmtK(K.reach / a.n * 90)} de portée cumulée sur 90 jours.`, i: '+15 % est atteignable en appliquant la formule gagnante sans augmenter le volume.', a: `Viser ${fmtN(tgtF)} abonnés gagnés, un score médian ≥ ${Math.round((a.acct.score || 50) + 5)}, et ${fmtP((ratio(K.pv, K.reach) || .01) * 1.2, 2)} de portée → visite du profil.`, prio: 'Haute', conf: { id: 'md', name: 'Confiance moyenne', why: 'projection linéaire du rythme actuel' }, m: 'Abonnés gagnés, score médian, visites du profil' });
  h += rec({ t: 'Croissance et positionnement', c: `« ${a.tFol?.name} » convertit le mieux (${fmt1(a.tFol?.fol1k)} ‰) ; « ${a.tReach?.name} » diffuse le mieux.`, i: 'Le compte grandit quand il montre des preuves (chantiers, tests) plutôt que des visuels seuls.', a: 'Positionnement : « l’expert EGGER qui rénove sans casser ». Portée : avant/après et démonstrations. Autorité : conseils de pose et classes d’usage. Conversion : réalisations clients avec wilaya et surface.', prio: 'Haute', conf: a.tFol?.conf, m: 'Abonnés / 1 000 comptes touchés' });
  h += rec({ t: 'Conversion', c: `Visites du profil : ${fmtN(K.pv)} ; clics : ${fmtN(K.clicks)}.`, i: 'La visite au showroom reste l’étape décisive.', a: 'Lien unique de prise de rendez-vous ; code « INSTA » demandé à l’accueil du showroom pour compter les visites venues d’Instagram ; suivi mensuel dans un tableau devis / visites.', prio: 'Haute', conf: { id: 'md', name: 'Confiance moyenne', why: 'leads et ventes non mesurés aujourd’hui' }, m: 'Visites showroom avec code INSTA' });
  h += rec({ t: 'Expérimentation, réutilisation, revue', c: 'Les conclusions faibles restent à valider.', i: 'Un système régulier transforme les hypothèses en règles.', a: '1 test par semaine (une seule variable) ; chaque contenu au score ≥ 80 est redécliné sous 30 jours ; revue mensuelle : exporter Windsor.ai, recharger ce tableau de bord, mettre à jour la formule gagnante.', prio: 'Moyenne', conf: { id: 'hi', name: 'Confiance élevée', why: 'méthode' }, m: 'Nombre de tests concluants / mois' });
  h += `</div><p class="conf-note">Principaux indicateurs de réussite : abonnés gagnés, score médian, taux d’enregistrement, portée → visite du profil, visites showroom attribuées à Instagram.</p></div>`;
  return h;
}

/* ============================================================ Calendrier + idées */
const IDEAS = [
  ['portee', 'reno', 'REEL', 'avap', 'Avant / après en 15 s : entrée en carrelage → Chêne du Nord naturel.', 'Plan fixe avant, pose accélérée, révélation, référence à l’écran.', 'share'],
  ['portee', 'tech', 'REEL', 'demo', 'On a laissé un verre d’eau renversé 24 h sur le Chêne Melba beige Aqua.', 'Chrono à l’écran, essuyage, gros plan sur le joint intact.', 'share'],
  ['portee', 'reno', 'REEL', 'pain', 'Sol froid l’hiver ? La solution sans casser votre carrelage.', 'Pied nu sur carrelage → pose → pied nu sur parquet, texte « +chaleur ».', 'share'],
  ['portee', 'deco', 'REEL', 'cmp', 'Même salon, 5 décors EGGER : lequel choisiriez-vous ?', 'Transition rapide entre les 5 rendus, numéros à l’écran.', 'comment'],
  ['save', 'pose', 'CAROUSEL', 'list', '5 vérifications avant de poser un stratifié sur carrelage.', '1 vérification par vue, photo réelle + critère chiffré.', 'save'],
  ['save', 'tech', 'CAROUSEL', 'cmp', 'Classe 31 ou 32 : le tableau pour chaque pièce de la maison.', 'Tableau pièce par pièce, recommandation EGGER.', 'save'],
  ['save', 'pose', 'REEL', 'err', 'L’erreur de plinthe qui ruine une pose parfaite.', 'Erreur montrée, conséquence, bonne méthode en 3 gestes.', 'save'],
  ['save', 'tech', 'CAROUSEL', 'tuto', 'Comment entretenir un parquet stratifié : ce qu’il faut et ne faut pas utiliser.', 'Liste oui / non, produits génériques, fréquence.', 'save'],
  ['share', 'reno', 'REEL', 'res', 'Un appartement entier rénové en 2 jours, sans poussière.', 'Timelapse jour 1 / jour 2, surface et wilaya à l’écran.', 'share'],
  ['share', 'comm', 'REEL', 'opin', 'Ce qu’on entend le plus au showroom (et ce qu’on répond).', 'Face caméra d’un conseiller, 3 phrases, réponse courte.', 'tag'],
  ['share', 'pose', 'REEL', 'warn', 'Avant d’acheter votre parquet, envoyez ça à la personne qui fait les travaux.', 'Checklist rapide à l’écran, ton direct.', 'share'],
  ['share', 'tech', 'REEL', 'myth', 'Idée reçue : « le stratifié, ça ne tient pas ». Crash-test.', 'Clés, talons, chaise à roulettes : résultat en gros plan.', 'share'],
  ['comment', 'comm', 'CAROUSEL', 'q', 'Clair ou foncé pour un salon plein sud ? Deux rendus, votez.', 'Vue 1 : pièce ; vue 2 : décor A ; vue 3 : décor B.', 'comment'],
  ['comment', 'deco', 'IMAGE', 'q', 'Quel décor pour une chambre d’enfant ? Nos 3 conseils… et les vôtres.', 'Photo d’ambiance, question ouverte en légende.', 'comment'],
  ['comment', 'comm', 'STORY', 'q', 'Sondage : dans quelle pièce commencez-vous vos travaux ?', 'Sticker sondage, puis réponse en reel la semaine suivante.', 'comment'],
  ['comment', 'show', 'REEL', 'story', 'Le décor le plus demandé ce mois-ci au showroom.', 'Conseiller qui présente la lame en main, lumière du jour.', 'comment'],
  ['follow', 'real', 'REEL', 'case', 'Chantier de la semaine : villa à Tipaza, 140 m² de Chêne Bardolino.', 'Arrivée des cartons, pose, pièce finie, témoignage 5 s.', 'follow'],
  ['follow', 'real', 'CAROUSEL', 'case', 'Épisode 2 : la même villa, pièce par pièce.', 'Série numérotée, renvoi vers l’épisode 1.', 'follow'],
  ['follow', 'reno', 'REEL', 'avap', 'Partie 1/3 : on rénove un salon à Blida sans casser le carrelage.', 'Série en 3 parties, fin sur « la suite demain ».', 'follow'],
  ['follow', 'real', 'REEL', 'res', 'Livré en 3 jours : 4 chambres en Chêne Achensee.', 'Compte à rebours à l’écran, rendu final.', 'follow'],
  ['autorite', 'tech', 'REEL', 'secret', 'Ce que les vendeurs ne vous disent pas sur l’épaisseur 7 mm ou 8 mm.', 'Coupe de lame en gros plan, différence expliquée en 20 s.', 'save'],
  ['autorite', 'tech', 'CAROUSEL', 'tuto', 'Made in Germany : comment est fabriquée une lame EGGER.', 'Couches de la lame, certification, classes d’usage.', 'save'],
  ['autorite', 'pose', 'REEL', 'tuto', 'La sous-couche : le détail qui fait toute la différence.', 'Test acoustique avec et sans sous-couche.', 'save'],
  ['autorite', 'tech', 'REEL', 'cmp', 'Chauffage au sol + stratifié : ce qu’il faut vérifier.', 'Schéma simple, règle de température, décor compatible.', 'save'],
  ['communaute', 'show', 'REEL', 'story', 'Une journée au showroom de Dar El Beïda.', 'Ouverture, rendez-vous, devis, livraison qui part.', 'comment'],
  ['communaute', 'comm', 'REEL', 'q', 'Vos questions, nos réponses : épisode 1 (pose sur carrelage).', 'Question en texte, réponse face caméra 20 s.', 'comment'],
  ['communaute', 'real', 'CAROUSEL', 'case', 'Vos intérieurs : les photos envoyées par nos clients.', 'Photos clients avec accord, décor et wilaya.', 'tag'],
  ['communaute', 'show', 'STORY', 'q', 'Question du vendredi : votre plus grand doute sur le parquet ?', 'Sticker question, réponses compilées en reel.', 'dm'],
  ['conversion', 'promo', 'REEL', 'demo', 'Arrivage : le Chêne Asgil miel est là, on vous le montre en vrai.', 'Déballage, lame à la lumière du jour, pièce témoin.', 'dm'],
  ['conversion', 'show', 'REEL', 'prom', 'Comment se passe une visite : 30 minutes, un devis au carton près.', 'Étapes de la visite, apporter ses mesures.', 'visit'],
  ['conversion', 'promo', 'STORY', 'news', 'Décors en stock cette semaine : 5 références disponibles immédiatement.', '5 stories, une référence par story, sticker lien.', 'link'],
  ['conversion', 'real', 'REEL', 'case', 'Combien de cartons pour 40 m² ? Le calcul fait avec un client.', 'Calcul à l’écran, marge de coupe, invitation au devis.', 'dm'],
];
const OBJ_IDEA = { portee: 'Portée', save: 'Enregistrements', share: 'Partages', comment: 'Commentaires', follow: 'Abonnés', autorite: 'Autorité', communaute: 'Communauté', conversion: 'Leads / ventes' };
function ideaPattern(a, th, hk) {
  const t = a.themes.find(x => x.id === th), h = a.hooks.find(x => x.id === hk);
  return `${t ? `Thème « ${t.name} » : score médian ${scoreFmt(t.scoreMed)} (n=${t.n})` : 'Thème à tester'} · ${h ? `accroche « ${h.name.toLowerCase()} » ${scoreFmt(h.scoreMed)} (n=${h.n})` : 'accroche jamais testée'}`;
}
function vCalendrier(a) {
  const wk = weekPlan(a), start = S.D.ref;
  const objs = [['Portée', 'portee', a.tReach, a.hReach || a.hShare], ['Autorité', 'autorite', a.tSave, a.hSave], ['Croissance', 'follow', a.tFol, a.hFol], ['Communauté', 'communaute', a.tCom, a.hCom], ['Conversion', 'conversion', a.tPv, null]];
  const rows = []; let k = 0;
  for (let i = 0; i < 30; i++) {
    const d = addDays(start, i), dow = toD(d).getUTCDay(), slot = wk.find(w => w.d === dow);
    if (!slot) continue;
    const exp = k % 4 === 3, reuseSlot = k % 7 === 5;
    const [objName, objId, th0, hk0] = objs[k % objs.length];
    const th = th0 || a.bestTheme;
    const ideaPool = IDEAS.filter(x => x[1] === th?.id); const idea = ideaPool.length ? ideaPool[Math.floor(k / objs.length) % ideaPool.length] : IDEAS[k % IDEAS.length];
    const refP = th ? [...th.posts].sort((x, y) => y.score - x.score)[0] : null;
    const hk = exp ? (a.hooks.find(h => h.n < 3) || HOOK_OTHER) : (hk0 || a.hBest);
    const fmtId = idea[2] === 'STORY' ? 'STORY' : (slot.fmt === 'Carrousel' && idea[2] !== 'REEL' ? 'CAROUSEL' : idea[2]);
    const metric = { Portée: 'Portée et partages', Autorité: 'Taux d’enregistrement', Croissance: 'Abonnés / 1 000 comptes touchés', Communauté: 'Taux de commentaires', Conversion: 'Visites du profil et messages' }[objName];
    const target = { Portée: `≥ ${fmtN(S.D.formatMed[fmtId]?.reach)} comptes touchés`, Autorité: `≥ ${fmtP((th?.saveR || a.acct.saveR || .01), 1)} d’enregistrements`, Croissance: `≥ ${fmt1(th?.fol1k || a.acct.fol1k)} ‰`, Communauté: `≥ ${fmtP((th?.cmR || a.acct.cmR || .003), 2)} de commentaires`, Conversion: `≥ ${fmtP((th?.pvR || a.acct.pvR || .01), 2)} vers le profil` }[objName];
    rows.push({ d, dow, hour: slot.hour, fmt: FORMATS[fmtId].name, theme: th?.name || '—', obj: exp ? 'Expérience · ' + objName : reuseSlot ? 'Réutilisation · ' + objName : objName, idea: reuseSlot && refP ? `Nouvelle version de « ${refP.hookText.slice(0, 60)} » avec un autre décor` : idea[4], hook: exp ? `Test d’accroche « ${hk.name.toLowerCase()} » : ${esc(idea[4])}` : idea[4], struct: idea[5], cta: ctaById(idea[6]).name, metric, ref: refP ? `${fmtDay(refP.day)} · score ${refP.score}` : '—', hyp: exp ? `Une accroche « ${hk.name.toLowerCase()} » fait au moins aussi bien que la médiane du thème.` : `La combinaison « ${th?.name} » + « ${(hk0 || a.hBest)?.name?.toLowerCase() || 'accroche gagnante'} » reproduit le score médian du thème (${scoreFmt(th?.scoreMed)}).`, exp: target });
    k++;
  }
  let h = sec('Calendrier éditorial', `30 prochains jours · ${rows.length} publications`, `À partir du ${fmtDate(start)}. Combine schémas gagnants, expériences (1 sur 4), réutilisation d’anciens succès et les 5 objectifs (portée, autorité, croissance, communauté, conversion).`) + baseNote(a);
  h += `<div class="tbl-wrap cal big-tbl"><table><thead><tr><th>Date</th><th>Heure</th><th>Format</th><th>Thème</th><th>Objectif</th><th>Idée principale et accroche</th><th>Structure</th><th>CTA</th><th>Métrique</th><th>Référence</th><th>Hypothèse</th><th>Résultat attendu</th></tr></thead><tbody>${rows.map(r => `<tr><td><b>${DOW_S[r.dow]} ${fmtDay(r.d)}</b></td><td>${r.hour}</td><td>${r.fmt}</td><td>${esc(r.theme)}</td><td>${r.obj}</td><td>${esc(r.idea)}${r.obj.startsWith('Expérience') ? `<div class="xs mut">${r.hook}</div>` : ''}</td><td>${esc(r.struct)}</td><td>${r.cta}</td><td>${r.metric}</td><td>${r.ref}</td><td class="xs">${esc(r.hyp)}</td><td>${r.exp}</td></tr>`).join('')}</tbody></table></div>`;
  h += `<div class="block"><h3>Banque d’idées · ${IDEAS.length} idées ${pv('reco')}</h3><p class="sub">Adaptées aux sols EGGER, au showroom de Dar El Beïda et aux questions habituelles des clients algériens. Le schéma gagnant indiqué est recalculé selon la période et les filtres.</p>`;
  for (const [oid, oname] of Object.entries(OBJ_IDEA)) {
    const list = IDEAS.filter(x => x[0] === oid); if (!list.length) continue;
    h += `<h4 style="margin:18px 0 10px">Pour ${oname.toLowerCase()}</h4><div class="ideas">${list.map(x => `<div class="idea"><h4>${esc(x[4])}</h4><dl class="kv"><dt>Thème</dt><dd>${esc(themeById(x[1]).name)}</dd><dt>Format</dt><dd>${FORMATS[x[2]].name}</dd><dt>Accroche</dt><dd>${hookById(x[3]).name}</dd><dt>Développement</dt><dd>${esc(x[5])}</dd><dt>CTA</dt><dd>${ctaById(x[6]).name}</dd><dt>Objectif</dt><dd>${oname}</dd><dt>Schéma</dt><dd class="mut">${ideaPattern(a, x[1], x[3])}</dd></dl></div>`).join('')}</div>`;
  }
  return h + '</div>';
}

/* ============================================================ Expériences */
function experiments(a) {
  const bt = a.bestTheme?.name || 'Rénovation sur carrelage';
  const h1 = a.hooks.filter(h => h.n >= 3)[0], h2 = a.hooks.filter(h => h.n >= 3)[1];
  const d1 = a.dBest?.name || '21-30 s', d2 = a.dSecond?.name || '46-60 s';
  const s1 = a.slotsRank[0]?.name || 'Soir (19h-23h)', s2 = a.slotsRank[1]?.name || 'Midi (12h-14h)';
  const E = (t, hyp, v, c, n, dur, m1, m2, crit, next) => ({ t, hyp, v, c, n, dur, m1, m2, crit, next });
  return [
    E('Même thème, deux accroches', `Sur « ${bt} », « ${h1?.name.toLowerCase()} » bat « ${h2?.name.toLowerCase()} ».`, 'Accroche (1re phrase et texte à l’écran)', 'Thème, format reel, durée, créneau, CTA', '4 reels (2 par accroche)', '2 semaines', 'Score', 'Rétention, partages', 'Écart de score médian ≥ 10 points', 'Adopter l’accroche gagnante sur le thème pendant 1 mois'),
    E('Même accroche, deux durées', `${d1} fait mieux que ${d2} pour le même message.`, 'Durée (montage court / long)', 'Accroche, thème, créneau', '2 × 2 reels', '2 semaines', '% moyen visionné', 'Lectures, enregistrements', 'Rétention +15 % sans perte d’enregistrements', 'Fixer la durée cible par thème'),
    E('Reel contre carrousel', `Le même conseil de pose enregistré davantage en carrousel.`, 'Format', 'Contenu, accroche, CTA « enregistrer »', '1 reel + 1 carrousel, 2 fois', '2 semaines', 'Taux d’enregistrement', 'Portée, abonnés', 'Taux d’enregistrement × 1,3', 'Décliner systématiquement les reels éducatifs en carrousel'),
    E('CTA commentaire contre CTA enregistrement', 'Une CTA d’enregistrement crée plus de valeur durable qu’une CTA de commentaire.', 'CTA', 'Thème, format, durée, créneau', '4 contenus', '2 semaines', 'Enregistrements', 'Commentaires, visites du profil', 'Enregistrements +30 % sans baisse de portée', 'Choisir la CTA selon l’objectif du contenu'),
    E('Deux horaires, même format', `${s1} bat ${s2} pour les reels.`, 'Horaire de publication', 'Format, thème, accroche', '4 reels', '2 semaines', 'Portée à 72 h', 'Score', 'Portée à 72 h +20 %', 'Mettre à jour le calendrier hebdomadaire'),
    E('Éducatif contre opinion', 'Un avis tranché de conseiller génère plus de commentaires qu’un conseil neutre, sans perdre d’abonnés.', 'Angle (éducatif / opinion)', 'Sujet, format, durée', '2 × 2 reels', '2 semaines', 'Taux de commentaires', 'Abonnés, partages', 'Commentaires × 1,5 et abonnés stables', 'Intégrer 1 opinion par mois'),
    E('Face caméra contre voix off', 'Un conseiller visible à l’écran renforce la confiance et les visites du profil.', 'Présence humaine', 'Script, durée, décor', '2 × 2 reels', '3 semaines', 'Portée → visite du profil', 'Rétention, abonnés', 'Visites du profil +20 %', 'Définir un visage récurrent du compte'),
    E('Court contre développé (carrousel 3 vs 8 vues)', 'Un carrousel détaillé est plus enregistré qu’un carrousel court.', 'Nombre de vues du carrousel', 'Sujet, visuel, CTA', '2 × 2 carrousels', '3 semaines', 'Taux d’enregistrement', 'Portée', 'Enregistrements × 1,3', 'Standardiser le format gagnant'),
    E('Accroche positive contre négative', 'Une accroche « douleur » (sol froid, vieux carrelage) diffuse mieux qu’une accroche « désir ».', 'Tonalité de l’accroche', 'Thème rénovation, format, durée', '4 reels', '2 semaines', 'Portée', 'Partages, abonnés', 'Portée +20 %', 'Adapter le ton des séries'),
    E('Annonce d’arrivage seule contre démonstration', 'Montrer le décor arrivé en situation génère plus de messages qu’une annonce.', 'Traitement de l’annonce', 'Décor, créneau, CTA WhatsApp', '2 × 2 contenus', '3 semaines', 'Visites du profil', 'Réponses aux stories, clics', 'Visites du profil × 1,5', 'Abandonner les annonces seules'),
  ];
}
function vExperiences(a) {
  const X = experiments(a);
  let h = sec('Expériences recommandées', 'Tests contrôlés, une variable à la fois', 'Publiez les variantes dans la même semaine, au même créneau, et jugez sur la médiane. Priorité à l’expérience n°1 pour les 7 prochains jours.');
  h += `<div class="grid g2">${X.map((e, i) => `<article class="rec"><div class="hd"><h4>${i + 1}. ${e.t}</h4>${i === 0 ? '<span class="pill hi">À lancer cette semaine</span>' : ''}</div><dl>
   <dt>Hypothèse</dt><dd>${e.hyp}</dd><dt>Variable modifiée</dt><dd><b>${e.v}</b></dd><dt>Constantes</dt><dd>${e.c}</dd><dt>Contenus</dt><dd>${e.n}</dd><dt>Durée</dt><dd>${e.dur}</dd>
   <dt>Métrique principale</dt><dd>${e.m1}</dd><dt>Secondaires</dt><dd>${e.m2}</dd><dt>Critère de réussite</dt><dd>${e.crit}</dd><dt>Étape suivante</dt><dd>${e.next}</dd></dl></article>`).join('')}</div>`;
  return h;
}

/* ============================================================ Rapport (insights + rapport exécutif) */
function vRapport(a) {
  const K = a.K, Kc = a.Kc, bt = a.bestTheme, wt = a.worstTheme;
  const dR = delta(K.reach, Kc.reach), dF = delta(K.gained, Kc.gained);
  const vanity = a.themes.filter(t => t.n >= 4 && t.reachMed > a.acct.reach * 1.1 && t.fol1k < a.acct.fol1k * .8);
  const noGrowth = a.base.filter(p => (p.idx.er ?? 0) >= 1.3 && (p.idx.folR ?? 1) < .6).length;
  const hiLo = a.base.filter(p => (p.idx.reach ?? 0) >= 1.5 && (p.idx.pvR ?? 1) < .7).length;
  const reusable = a.base.filter(p => p.score >= 80).length;
  const leak = (() => { const r1 = ratio(K.pv, K.reach), r2 = ratio(K.gained, K.pv); return isNum(r1) && isNum(r2) ? (r1 < .01 ? ['portée → visite du profil', r1] : ['visite du profil → abonnement', r2]) : null; })();
  const I = [
    ['Qu’est-ce qui fonctionne ?', `« ${bt?.name} » : score médian ${scoreFmt(bt?.scoreMed)} (n=${bt?.n}).`, 'Contenus de preuve, concrets et visuels.', 'Le résultat se voit en quelques secondes.', `Garder ${bt?.name} au cœur du planning.`, bt?.conf],
    ['Qu’est-ce qui ne fonctionne pas ?', wt ? `« ${wt.name} » : ${scoreFmt(wt.scoreMed)} (n=${wt.n}).` : '—', 'Message trop commercial ou sans bénéfice pour l’utilisateur.', 'Pas de raison d’enregistrer ou de partager.', 'Associer chaque annonce à une démonstration.', wt?.conf],
    ['Pourquoi le compte progresse-t-il ou recule-t-il ?', `${a.state.map(s => s.name).join(', ')}.`, dR && dR.pct < 0 ? 'La diffusion moyenne par contenu baisse.' : 'Les contenus gagnants sont assez fréquents.', a.state[0]?.why + '.', a.state.some(s => s.id === 'plusmoins') ? 'Réduire le volume et remonter la qualité.' : 'Maintenir le rythme et la formule.', { id: 'md', name: 'Confiance moyenne', why: 'comparaison entre deux périodes' }],
    ['Quels thèmes publier davantage ?', a.themes.filter(t => t.n >= 3 && t.scoreMed >= 55).map(t => t.name).join(', ') || '—', 'Scores médians au-dessus de 55.', 'Adéquation avec les préoccupations de rénovation.', 'Leur réserver 60 % du planning.', bt?.conf],
    ['Quels thèmes réduire ?', a.themes.filter(t => t.n >= 4 && t.scoreMed < 45).map(t => t.name).join(', ') || 'aucun nettement', 'Scores médians sous 45.', 'Peu d’utilité perçue.', 'Les limiter à 1 sur 6 publications.', wt?.conf],
    ['Quels formats prioriser ?', a.formats.filter(f => f.n >= 3).slice(0, 2).map(f => `${f.name} (${scoreFmt(f.scoreMed)})`).join(', '), 'Meilleurs scores par rapport à leur propre historique.', 'Format adapté à la démonstration.', `Prioriser ${a.fBest?.name}.`, a.fBest?.conf],
    ['Quels reels ont le plus de potentiel ?', `${a.dBest?.name || '—'} · accroche ${a.hBest?.name?.toLowerCase()} · thème ${bt?.name}.`, 'Combinaison la plus fréquente parmi les meilleurs reels.', 'Rétention et partages au-dessus de la médiane.', 'Produire 2 reels par semaine sur ce modèle.', a.dBest?.conf],
    ['Quelles publications génèrent des abonnés ?', `« ${a.tFol?.name} » (${fmt1(a.tFol?.fol1k)} ‰).`, 'Preuves sociales et suites de chantier.', 'Raison claire de suivre la suite.', 'Terminer par « suite demain » ou « partie 2 ».', a.tFol?.conf],
    ['Lesquelles génèrent des interactions sans croissance ?', `${noGrowth} publications à fort engagement mais peu d’abonnés.`, 'Sondages et inspiration.', 'Réaction immédiate sans intérêt durable pour le compte.', 'Les conserver pour la communauté, sans les compter comme croissance.', confOf(noGrowth, null)],
    ['Lesquelles génèrent de la portée sans conversion ?', vanity.length ? vanity.map(t => t.name).join(', ') + ` · ${hiLo} publications` : `${hiLo} publications`, 'Métriques de vanité : vues sans visite ni abonnement.', 'Contenu plaisant sans lien avec l’offre.', 'Ajouter la référence du décor, la disponibilité et le showroom.', confOf(hiLo, null)],
    ['Quels contenus méritent d’être réutilisés ?', `${reusable} contenus au score ≥ 80.`, 'Succès démontrés.', 'Une partie de l’audience ne les a pas vus.', '1 réutilisation par semaine (nouvel angle, nouveau décor).', confOf(reusable, null)],
    ['Quel est le principal goulot d’étranglement ?', leak ? `${leak[0]} : ${fmtP(leak[1], 2)}.` : NA, 'Étape où l’on perd le plus de personnes.', 'Bio, lien ou appel à l’action insuffisants.', 'Retravailler bio, stories à la une et CTA de visite.', { id: 'md', name: 'Confiance moyenne', why: 'données au niveau du compte' }],
    ['Quelle est la plus grande opportunité ?', a.opps[0]?.title || '—', a.opps[0]?.obs || '', 'Levier le mieux classé (impact, facilité, urgence, confiance).', a.opps[0]?.action || '', a.opps[0]?.conf],
    ['Que publier cette semaine ?', weekPlan(a).map(w => `${w.day} ${w.hour} : ${w.fmt.toLowerCase()} ${w.theme}`).join(' · '), 'Meilleurs créneaux et thèmes par objectif.', 'Voir onglet Horaires.', 'Suivre le plan des 7 jours.', a.dowsRank[0]?.conf],
    ['Qu’arrêter de faire ?', [a.hWorst && `accroches « ${a.hWorst.name.toLowerCase()} »`, 'annonces d’arrivage sans démonstration'].filter(Boolean).join(', '), 'Plus faibles scores médians.', 'Peu de valeur perçue.', 'Les remplacer par des démonstrations.', a.hWorst?.conf],
    ['Que tester ensuite ?', experiments(a)[0].t, experiments(a)[0].hyp, 'Écart à confirmer.', experiments(a)[0].n + ' sur ' + experiments(a)[0].dur, { id: 'lo', name: 'Confiance faible', why: 'hypothèse à valider' }],
  ];
  let h = sec('Rapport', 'Insights automatiques', 'Chaque réponse précise la donnée observée, son interprétation, la cause possible, la recommandation et le niveau de confiance.') + baseNote(a);
  h += `<div class="tbl-wrap"><table><thead><tr><th>Question</th><th>Donnée observée</th><th>Interprétation</th><th>Cause possible</th><th>Recommandation</th><th>Confiance</th></tr></thead><tbody>${I.map(r => `<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>${r[4]}</td><td>${confPill(r[5])}</td></tr>`).join('')}</tbody></table></div>`;
  const W = summaryText(a), F = formula(a), X = experiments(a)[0];
  const steps = [...a.opps.slice(0, 3).map(o => o.action), `Appliquer la formule : ${a.hBest?.name?.toLowerCase()} + ${a.dBest?.name || '21-30 s'} + ${a.cSave?.name?.toLowerCase() || 'enregistrer'}.`, 'Mettre en place le suivi des visites showroom venues d’Instagram (code INSTA).'].slice(0, 5);
  h += `<div class="block"><div class="sec-h" style="margin-bottom:12px"><div><p class="lab">Rapport exécutif</p><h2>Ce que le compte doit faire</h2></div></div><div class="grid g2">
   <div class="panel"><h4>État actuel</h4><p class="small">${W.concl} ${a.P.length} contenus publiés (${fmt1(K.freq)} / semaine), score médian ${scoreFmt(median(vals(a.P, p => p.score)))}, ${fmtN(K.followers)} abonnés${dF ? `, abonnés gagnés ${signed(dF.pct, v => fmtP(v, 0))}` : ''}.</p></div>
   <div class="panel"><h4>Principaux constats</h4><ol class="small" style="margin:0;padding-inline-start:18px;display:grid;gap:4px">${[...W.wins.slice(0, 2), ...W.probs.slice(0, 2), F[0][0] + ' : ' + F[0][1]].map(x => `<li>${x}</li>`).join('')}</ol></div>
   <div class="panel"><h4>Contenus gagnants</h4><p class="small">${F.slice(0, 4).map(f => `<b>${f[0]}</b> : ${f[1]}`).join('. ')}.</p></div>
   <div class="panel"><h4>Contenus à améliorer</h4><p class="small">${F[8][1]}. ${W.probs[0]}</p></div>
   <div class="panel"><h4>Plus grande opportunité</h4><p class="small">${a.opps[0] ? `<b>${a.opps[0].title}.</b> ${a.opps[0].action}` : '—'}</p></div>
   <div class="panel"><h4>Plus gros problème</h4><p class="small">${leak ? `Le passage ${leak[0]} (${fmtP(leak[1], 2)}).` : ''} ${a.state.find(s => s.tone !== 'good')?.name || ''}</p></div>
   <div class="panel"><h4>Prochaines étapes (par impact)</h4><ol class="small" style="margin:0;padding-inline-start:18px;display:grid;gap:4px">${steps.map(x => `<li>${x}</li>`).join('')}</ol></div>
   <div class="panel"><h4>Contenu recommandé</h4><p class="small">Thèmes : ${F[0][1]}. Formats : ${F[3][1]}. Accroches : ${F[1][1]}. Durées : ${F[2][1]}. CTA : ${F[6][1]}.</p></div>
   <div class="panel"><h4>Expérience recommandée</h4><p class="small"><b>${X.t}.</b> ${X.hyp} ${X.n}, ${X.dur}. Réussite si : ${X.crit.toLowerCase()}.</p></div>
   <div class="panel soft"><h4>Conclusion</h4><p class="small">Le compte grandit quand il montre des preuves : transformations sans casser, tests de résistance, chantiers livrés. Il doit publier moins d’annonces seules, plus de démonstrations au format ${a.dBest?.name || 'court'}, et relier chaque contenu à la visite du showroom de Dar El Beïda.</p></div>
  </div></div>`;
  return h;
}

/* ============================================================ Données */
function vDonnees(a) {
  const D = S.D;
  let h = sec('Données', D.source === 'demo' ? 'Données d’exemple chargées' : `Compte importé : ${esc(D.name)}`, 'Importez un export Windsor.ai (CSV ou JSON) du connecteur Instagram. Plusieurs fichiers peuvent être chargés ensemble : publications, statistiques quotidiennes du compte, audience.');
  h += `<div class="grid g2"><div class="panel"><h4>Importer un export Windsor.ai</h4>
   <div class="drop" id="drop"><p>Glissez vos fichiers ici</p><label class="btn pri" for="file">Choisir des fichiers CSV / JSON</label><input type="file" id="file" accept=".csv,.json,.txt,text/csv,application/json" multiple hidden><p class="xs mut">Les données restent dans votre navigateur : rien n’est envoyé.</p></div>
   <label for="paste" class="xs mut" style="display:block;margin:14px 0 6px">Ou collez la réponse JSON de l’API Windsor.ai</label><textarea id="paste" placeholder='{"data":[{"date":"2026-09-01","media_id":"…","media_type":"REEL", …}]}'></textarea>
   <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px"><button class="btn" type="button" id="pasteBtn">Analyser le JSON collé</button>${D.source !== 'demo' ? '<button class="btn" type="button" id="demoBtn">Revenir aux données d’exemple</button>' : ''}</div>
   <p class="xs" id="impMsg" style="margin-top:8px"></p></div>
   <div class="panel"><h4>Exporter depuis Windsor.ai</h4><ol class="small" style="padding-inline-start:18px;display:grid;gap:6px;margin:6px 0 10px">
    <li>Dans Windsor.ai, connectez le compte Instagram professionnel (connecteur « Instagram »).</li>
    <li>Choisissez la période (365 jours recommandés) et les champs ci-dessous.</li>
    <li>Exportez en CSV, ou copiez l’URL API et collez sa réponse JSON ici.</li></ol>
   <p class="xs mut" style="margin-bottom:6px">Champs des publications :</p><pre class="code">media_id, timestamp, media_type, media_product_type,
caption, media_permalink, media_reach, media_views,
media_like_count, media_comments_count, media_saved,
media_shares, media_total_interactions,
media_profile_visits, media_follows,
media_ig_reels_avg_watch_time, media_duration</pre>
   <p class="xs mut" style="margin:10px 0 6px">Champs du compte (par jour) :</p><pre class="code">date, followers_count, follower_count, reach,
impressions, profile_views, website_clicks</pre>
   <p class="xs mut" style="margin:10px 0 6px">Exemple d’URL API (remplacez la clé) :</p><pre class="code">https://connectors.windsor.ai/instagram?api_key=VOTRE_CLE
&amp;date_preset=last_365d&amp;fields=date,media_id,timestamp,
media_type,caption,media_reach,media_saved,media_shares</pre>
   <p class="conf-note">La page ne peut pas appeler l’API elle-même : elle n’accepte aucune connexion vers un autre site. Ouvrez l’URL dans votre navigateur puis collez le résultat.</p></div></div>`;
  h += `<div class="block"><h3>Disponibilité des métriques</h3><p class="sub">${D.source === 'demo' ? 'Jeu d’exemple : ' : ''}${D.posts.length} publications du ${fmtDate(D.minDay)} au ${fmtDate(D.maxDay)} · ${D.account.length} jours de statistiques de compte.</p><div class="av-list">${[['reach', 'Portée par publication'], ['impressions', 'Impressions'], ['views', 'Lectures / vues'], ['likes', "J'aime"], ['comments', 'Commentaires'], ['saves', 'Enregistrements'], ['shares', 'Partages'], ['profile_visits', 'Visites du profil par publication'], ['follows', 'Abonnés par publication'], ['avg_watch', 'Temps moyen de lecture'], ['duration', 'Durée des vidéos'], ['replies', 'Réponses aux stories'], ['clicks', 'Clics par publication'], ['acc_followers', 'Abonnés (total quotidien)'], ['acc_new_follows', 'Nouveaux abonnés quotidiens'], ['acc_unfollows', 'Désabonnements'], ['acc_reach', 'Portée du compte'], ['acc_profile_views', 'Visites du profil (compte)'], ['acc_website_clicks', 'Clics sur le lien'], ['acc_messages', 'Messages privés'], ['sponsored', 'Statut sponsorisé']].map(([k, l]) => `<div><span class="${D.avail[k] ? 'ok' : 'ko'}">${D.avail[k] ? '●' : '○'}</span>${l}${D.avail[k] ? '' : ' <span class="xs mut">non disponible</span>'}</div>`).join('')}
   ${[['Rétention initiale / finale', 0], ['Lectures abonnés / non-abonnés', 0], ['Audio, tendance, campagne', 0], ['Leads et ventes', 0]].map(([l]) => `<div><span class="ko">○</span>${l} <span class="xs mut">non disponible</span></div>`).join('')}</div></div>`;
  const W = WEIGHTS[S.goal];
  h += `<div class="block"><h3>Méthode</h3><div class="grid g2">
   <div class="panel"><h4>Score de performance (0-100)</h4><p class="small">Pondération actuelle (« ${$('#goalSel option:checked')?.textContent || S.goal} ») :</p>${hbars(Object.entries(W).map(([k, v]) => ({ label: WLABEL[k], v })), { fmt: v => v + ' %', max: 40 })}
   <ul class="small" style="padding-inline-start:18px;margin:12px 0 0;display:grid;gap:4px"><li>Chaque composante est un rang centile parmi les publications <b>du même format</b> sur tout l’historique.</li><li>La portée est rapportée au nombre d’abonnés le jour de la publication et corrigée de l’ancienneté (une publication de 24 h n’a pas fini de circuler).</li><li>Une métrique absente voit son poids redistribué entre les autres.</li><li>Les autres composantes sont des taux (par personne touchée) : la taille du compte ne biaise pas le score.</li><li>Publications de moins de 3 jours : score provisoire, exclues des « moins bons ».</li></ul></div>
   <div class="panel"><h4>Classifications déduites</h4><ul class="small" style="padding-inline-start:18px;margin:0;display:grid;gap:4px"><li><b>Thème</b> : mots-clés de l’accroche, puis de la légende (réf. EGGER EL…, carrelage, pose, classe 31/32, showroom, arrivage…).</li><li><b>Accroche</b> : 1re phrase, classée en 19 types par règles.</li><li><b>CTA</b> : formules détectées après l’accroche (WhatsApp, réservez, enregistrez…).</li><li><b>Objectif atteint</b> : composante du score la plus au-dessus de la médiane du format.</li><li><b>Viral</b> : portée corrigée ≥ 3× la médiane du format.</li><li><b>Confiance</b> : élevée ≥ 12 publications régulières ; moyenne ≥ 6 ; faible en dessous.</li></ul>
   <p class="conf-note">Montage, sous-titres, rythme et visuels ne sont pas analysés : la source ne transmet pas les vidéos.</p></div></div></div>`;
  return h;
}

/* ============================================================ Coque */
const VIEWS = { resume: vResume, evolution: vEvolution, contenu: vContenu, top: vTop, flop: vFlop, themes: vThemes, formats: vFormats, accroches: vAccroches, horaires: vHoraires, audience: vAudience, conversions: vConversions, opportunites: vOpportunites, plan: vPlan, calendrier: vCalendrier, experiences: vExperiences, rapport: vRapport, donnees: vDonnees };
function toast(m) { const t = document.createElement('div'); t.className = 'toast'; t.textContent = m; document.body.appendChild(t); setTimeout(() => t.remove(), 3200); }
function setData(D) { S.raw = D; S.D = enrich(D, S.goal); if (S.period === 'custom' && (!S.from || S.from < S.D.minDay)) { S.from = addDays(S.D.maxDay, -89); S.to = S.D.maxDay; } render(); }
function shell() {
  $('#periodSeg').innerHTML = PERIODS.map(([k, l]) => `<button type="button" data-p="${k}" aria-pressed="${k === S.period}">${l}</button>`).join('');
  $('#customFld').hidden = S.period !== 'custom';
  $('#cmpSel').value = S.cmp; $('#goalSel').value = S.goal;
  $('#tabs').innerHTML = TABS.map(([k, l]) => `<button type="button" role="tab" id="t-${k}" data-tab="${k}" aria-selected="${k === S.tab}" aria-controls="view">${l}</button>`).join('');
  $('#fltPanel').innerHTML = FILTERS.map(f => f.na || (f.need && !S.D.avail[f.need]) ? `<div class="fld dis"><label>${f.label}</label><select disabled title="${esc(NA)}"><option>Non disponible</option></select></div>` : `<div class="fld"><label for="f-${f.k}">${f.label}</label><select id="f-${f.k}" data-f="${f.k}"><option value="">Tous</option>${f.opts().map(([v, l]) => `<option value="${esc(v)}" ${S.f[f.k] === v ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></div>`).join('') + `<div class="fld"><span class="l">&nbsp;</span><button class="btn" type="button" id="fReset">Effacer les filtres</button></div>`;
}
function render() {
  const D = S.D; AFTER = [];
  const demo = D.source === 'demo';
  $('#srcBadge').classList.toggle('real', !demo); $('#srcTxt').textContent = demo ? 'Données d’exemple' : 'Import Windsor.ai';
  $('#acctLine').textContent = `${D.name} · ${fmtN(D.posts.length)} publications · jusqu’au ${fmtDate(D.maxDay)}`;
  $('#footSrc').textContent = demo ? 'Données d’exemple générées pour la démonstration, pas les chiffres réels du compte.' : `Source : export Windsor.ai (${(D.files || []).join(', ')}).`;
  if (S.period === 'custom') { $('#cFrom').value = S.from || ''; $('#cTo').value = S.to || ''; $('#cFrom').min = $('#cTo').min = D.minDay; $('#cFrom').max = $('#cTo').max = D.maxDay; }
  shell();
  A = analyze();
  const nf = nFilters(); $('#fltCnt').hidden = !nf; $('#fltCnt').textContent = nf;
  $('#ctxLine').textContent = `${fmtDate(A.from)} → ${fmtDate(A.to)} · ${A.P.length} contenus${nf ? ' filtrés' : ''} · comparé à la ${A.C.label}`;
  let html = '';
  if (demo) html += `<div class="demo" role="note"><div><b>Données d’exemple.</b> Aucune source Windsor.ai n’est encore connectée : les chiffres ci-dessous sont simulés pour montrer le fonctionnement du tableau de bord. Ce ne sont pas les résultats réels du compte. Importez un export Windsor.ai pour analyser le vrai compte.</div><button class="btn pri" type="button" data-tab="donnees">Importer mes données</button></div>`;
  try { html += VIEWS[S.tab](A); } catch (e) { console.error(e); html += `<p class="na-msg">Cette section n’a pas pu être calculée avec les données actuelles (${esc(e.message)}).</p>`; }
  $('#view').innerHTML = html;
  AFTER.forEach(f => f());
  saveUI();
}
function readFiles(files) {
  const msg = $('#impMsg');
  Promise.all([...files].map(f => f.text().then(t => ({ name: f.name, t })))).then(list => {
    try {
      const parts = list.map(({ name, t }) => { const s = t.trim(); let rows; if (s.startsWith('{') || s.startsWith('[')) { const j = JSON.parse(s); rows = Array.isArray(j) ? j : (j.data || j.result || j.rows || []); } else rows = parseCSV(t); return importRows(rows, name); });
      const M = mergeImports(parts);
      if (!M.posts.length && !M.account.length) throw new Error('aucune ligne reconnue (vérifiez les noms de colonnes : media_id, timestamp, media_reach…)');
      S.f = {}; S.preset = 'all'; setData(M);
      toast(`${M.posts.length} publications et ${M.account.length} jours importés`);
    } catch (e) { if (msg) { msg.textContent = 'Import impossible : ' + e.message; msg.style.color = 'var(--bad)'; } }
  });
}
function bind() {
  document.addEventListener('click', e => {
    const b = e.target.closest('button,[data-tab]'); if (!b) return;
    if (b.dataset.p) { S.period = b.dataset.p; if (S.period === 'custom' && !S.from) { S.from = addDays(S.D.maxDay, -89); S.to = S.D.maxDay; } render(); }
    else if (b.dataset.tab) { S.tab = b.dataset.tab; render(); window.scrollTo({ top: 0 }); $('#t-' + S.tab)?.scrollIntoView({ inline: 'center', block: 'nearest' }); }
    else if (b.dataset.evo) { S.evoM = b.dataset.evo; render(); }
    else if (b.dataset.evog) { S.evoG = b.dataset.evog; render(); }
    else if (b.dataset.sort) { }
    else if (b.dataset.goto) { document.getElementById(b.dataset.goto)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }
    else if (b.id === 'fltBtn') { const p = $('#fltPanel'); p.hidden = !p.hidden; b.setAttribute('aria-expanded', String(!p.hidden)); }
    else if (b.id === 'fReset') { S.f = {}; render(); $('#fltPanel').hidden = false; }
    else if (b.id === 'srcBadge') { S.tab = 'donnees'; render(); }
    else if (b.id === 'pasteBtn') { const t = $('#paste').value.trim(); if (!t) return; readFiles([{ name: 'JSON collé', text: () => Promise.resolve(t) }]); }
    else if (b.id === 'demoBtn') { S.f = {}; setData(genDemo()); }
  });
  document.addEventListener('click', e => { const th = e.target.closest('th[data-sort]'); if (!th) return; const k = th.dataset.sort; S.sort = { k, d: S.sort.k === k ? -S.sort.d : (['day', 'time', 'type', 'hook', 'theme', 'category', 'objective'].includes(k) ? 1 : -1) }; S._presetApplied = S.preset; render(); });
  document.addEventListener('change', e => {
    const t = e.target;
    if (t.id === 'cmpSel') { S.cmp = t.value; render(); }
    else if (t.id === 'goalSel') { S.goal = t.value; S.D = enrich(S.raw, S.goal); render(); }
    else if (t.dataset.f) { S.f[t.dataset.f] = t.value; const open = !$('#fltPanel').hidden; render(); $('#fltPanel').hidden = !open; $('#fltBtn').setAttribute('aria-expanded', String(open)); }
    else if (t.id === 'cFrom' || t.id === 'cTo') { S.from = $('#cFrom').value; S.to = $('#cTo').value; if (S.from && S.to && S.from <= S.to) render(); }
    else if (t.id === 'preset') { S.preset = t.value; S._presetApplied = null; render(); }
    else if (t.id === 'file') readFiles(t.files);
  });
  let qT; document.addEventListener('input', e => { if (e.target.id === 'q') { clearTimeout(qT); qT = setTimeout(() => { S.q = e.target.value; const pos = e.target.selectionStart; render(); const q = $('#q'); if (q) { q.focus(); q.setSelectionRange(pos, pos); } }, 250); } });
  document.addEventListener('dragover', e => { const d = e.target.closest?.('#drop'); if (d) { e.preventDefault(); d.classList.add('over'); } });
  document.addEventListener('dragleave', e => { const d = e.target.closest?.('#drop'); if (d) d.classList.remove('over'); });
  document.addEventListener('drop', e => { const d = e.target.closest?.('#drop'); if (d) { e.preventDefault(); d.classList.remove('over'); readFiles(e.dataTransfer.files); } });
  document.addEventListener('keydown', e => { const t = e.target.closest?.('[role=tab]'); if (!t || !['ArrowRight', 'ArrowLeft'].includes(e.key)) return; const i = TABS.findIndex(x => x[0] === S.tab), n = (i + (e.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length; S.tab = TABS[n][0]; render(); $('#t-' + S.tab)?.focus(); });
  let rT; addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(() => { AFTER.forEach(f => f()); }, 200); });
}
const HASH_TAB = location.hash.slice(1); if (TABS.some(t => t[0] === HASH_TAB)) S.tab = HASH_TAB;
bind();
setData(genDemo());
