// Dossier technique cuisine : node dossier-technique.cjs <fonts> <sortie.pdf>
const { chromium } = require('/opt/node22/lib/node_modules/playwright'); const fs = require('fs'), path = require('path');
const [FONTS, OUT] = process.argv.slice(2); const d = __dirname;
const b64 = (f, t) => `data:${t};base64,` + fs.readFileSync(path.join(d, f)).toString('base64');
const rows = [["Panneaux EGGER chêne Bardolino H1145 ST10 (2 feuilles)",32000],["Panneaux EGGER noir mat U999 PM (2 feuilles)",36000],["Panneaux blancs caissons W980 (5 feuilles)",60000],["Fonds HDF 3 mm (3 feuilles)",7500],
["Plan de travail EGGER 38 mm marbre blanc (1 barre 4,10 m)",22000],["Crédence stratifiée assortie (2,8 ml)",16800],["Chants ABS 2 mm façades (96 ml) + 1 mm caissons (67 ml)",18420],["Charnières à amortisseur (38)",17100],["Coulisses tiroirs double paroi (7 paires)",31500],["Pieds réglables (32)",3840],["Profil gola alu noir (5,6 ml)",14000],["Ruban LED + driver (4 ml)",7200],["Grilles d'aération chauffe-eau (2)",1800],["Visserie, tourillons, colle",6000],["Fabrication + pose (4,9 ml)",88200]];
const fmt = n => n.toLocaleString('fr-FR').replace(/ /g,' ');
const css = `@font-face{font-family:F;src:url(file://${FONTS}/fira-sans-400.woff2)}@font-face{font-family:F;font-weight:600;src:url(file://${FONTS}/fira-sans-600.woff2)}@font-face{font-family:C;src:url(file://${FONTS}/fira-sans-extra-condensed-800.woff2)}
@page{size:A4 landscape;margin:0}*{box-sizing:border-box;margin:0}body{font-family:F;color:#1a1a1a}.p{width:297mm;height:210mm;padding:12mm 14mm;page-break-after:always;overflow:hidden;position:relative}
h1{font-family:C;font-size:30pt}.n{font-family:C;color:#e2001a;font-size:13pt;letter-spacing:.08em}.im{width:100%;height:160mm;object-fit:contain;margin-top:5mm}
table{border-collapse:collapse;width:100%;margin-top:5mm;font-size:10pt}td,th{border-bottom:1px solid #ddd;padding:1.4mm 3mm;text-align:left}td:last-child,th:last-child{text-align:right}th{background:#1a1a1a;color:#fff}
tr.t td{font-weight:600;border-top:2px solid #1a1a1a;font-size:13pt}.f{position:absolute;bottom:8mm;left:14mm;right:14mm;font-size:9pt;color:#666;border-top:2px solid #1a1a1a;padding-top:2mm}
.two{display:flex;gap:8mm;margin-top:5mm}.two img{width:120mm;height:150mm;object-fit:cover}.two ul{font-size:11pt;line-height:1.5;padding-left:5mm}.warn{background:#fff2a8;padding:3mm 4mm;margin-top:4mm;font-size:10pt}`;
const foot = `<div class="f">SARL MYF · La Maison du Parquet · Panneaux et parquet EGGER · Showroom Dar El Beïda · WhatsApp 0794 70 93 23 · lamaisonduparquet.org</div>`;
const html = `<html><head><meta charset="utf-8"><style>${css}</style></head><body>
<div class="p"><div class="n">DOSSIER TECHNIQUE · CUISINE SUR MESURE</div><h1>Projet cuisine chêne & noir mat</h1>
<div class="two"><img src="${b64('cuisine-3.jpg','image/jpeg')}"><div><ul>
<li><b>Mur B</b> : 4 colonnes chêne (four, garde-manger, niche café éclairée, épicerie)</li><li><b>Mur A</b> : linéaire noir mat sans poignée (évier, lave-vaisselle, tiroirs, plaque) et 4 meubles hauts</li>
<li><b>Chauffe-eau gaz</b> caché dans un caisson noir ventilé haut et bas</li><li>Plan de travail EGGER 38 mm effet marbre blanc, LED sous meubles hauts</li><li>Sol : Chêne Melba beige <b>Aqua</b> EL2416 posé sur le carrelage</li></ul>
<div class="warn"><b>Cotes estimées</b> à partir des photos et vidéos (mur A ≈ 3,40 m, mur B ≈ 2,10 m, hauteur ≈ 2,80 m). Tout se recalcule automatiquement dès réception des vraies mesures.</div></div></div>${foot}</div>
<div class="p"><div class="n">01 · PLAN ET ÉLÉVATIONS</div><img class="im" src="${b64('out/plan.png','image/png')}">${foot}</div>
<div class="p"><div class="n">02 · CALEPINAGE DES PANNEAUX 2800 × 2070 MM</div><img class="im" src="${b64('out/calepinage.png','image/png')}">${foot}</div>
<div class="p"><div class="n">03 · CHIFFRAGE ESTIMATIF (DA)</div><h1>≈ ${fmt(rows.reduce((a,r)=>a+r[1],0))} DA</h1><table><tr><th>Poste</th><th>Montant (DA)</th></tr>
${rows.map(r=>`<tr><td>${r[0]}</td><td>${fmt(r[1])}</td></tr>`).join('')}<tr class="t"><td>Total cuisine hors électroménager</td><td>${fmt(rows.reduce((a,r)=>a+r[1],0))}</td></tr></table>
<div class="warn">Prix unitaires = estimations à remplacer par les prix SARL MYF (fichier Excel, cellules jaunes). Électroménager, plomberie, gaz, électricité et dépose de l'ancienne faïence non compris.</div>${foot}</div>
</body></html>`;
(async()=>{ const t=path.join(require('os').tmpdir(),'dossier-cuisine.html'); fs.writeFileSync(t,html); const b=await chromium.launch(); const p=await b.newPage(); await p.goto('file://'+t); await p.waitForTimeout(500);
 await p.pdf({path:OUT,width:'297mm',height:'210mm',printBackground:true}); await p.setViewportSize({width:1123,height:794}); await p.screenshot({path:OUT.replace('.pdf','.png'),fullPage:true}); await b.close(); console.log(OUT); })();
