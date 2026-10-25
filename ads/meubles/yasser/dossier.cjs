// Dossier de présentation : node dossier.cjs <dossier fonts> <sortie.pdf>
const { chromium } = require('/opt/node22/lib/node_modules/playwright'); const fs = require('fs'); const path = require('path');
const [FONTS, OUT] = process.argv.slice(2); const dir = __dirname;
const img = f => 'data:image/jpeg;base64,' + fs.readFileSync(path.join(dir, 'brut', f)).toString('base64');
const rooms = [
 ['yasser-1.jpg','Salon','Mur TV signature',['Mur TV pleine hauteur en panneaux chêne, tasseaux verticaux','Niche TV et meuble suspendu noir mat sans poignée, LED au sol','Bibliothèques rétroéclairées de chaque côté','Parquet chêne miel posé sur le carrelage']],
 ['yasser-2.jpg','Chambre parentale','Esprit suite d\'hôtel',['Habillage mural chêne avec joints noirs et LED cachée','Tête de lit tapissée intégrée, 2 chevets suspendus noir mat','Armoire sans poignée du sol au plafond, niche noire éclairée','Parquet chêne miel, tapis laine']],
 ['yasser-3.jpg','Chambre 2','Chambre et bureau',['Mur complet en chêne clair : armoire, étagères LED, bureau suspendu','Caisson 4 tiroirs noir mat sous le bureau','Tête de lit et lambris bas en chêne, chevet noir suspendu','Parquet Chêne du Nord naturel, lumineux']],
 ['yasser-4.jpg','Cuisine','Îlot central',['Colonnes chêne avec four et frigo intégrés','Meubles hauts et îlot noir mat sans poignée','Joue de l\'îlot en chêne « cascade », plan quartz blanc','Sol Chêne Melba beige Aqua : 24 h de résistance à l\'eau']]];
const css = `@font-face{font-family:F;src:url(file://${FONTS}/fira-sans-400.woff2)}@font-face{font-family:F;font-weight:600;src:url(file://${FONTS}/fira-sans-600.woff2)}@font-face{font-family:C;src:url(file://${FONTS}/fira-sans-extra-condensed-800.woff2)}
@page{size:A4 landscape;margin:0}*{box-sizing:border-box;margin:0}body{font-family:F;color:#1a1a1a}
.p{width:297mm;height:210mm;display:flex;page-break-after:always;overflow:hidden}
.im{width:168mm;height:210mm;background-size:cover;background-position:center}
.tx{flex:1;padding:16mm 14mm;display:flex;flex-direction:column}
.n{font-family:C;color:#e2001a;font-size:15pt;letter-spacing:.08em}h1{font-family:C;font-size:38pt;line-height:1;margin:3mm 0 2mm}
h2{font-weight:400;font-size:14pt;color:#666;margin-bottom:9mm}ul{padding-left:5mm}li{font-size:12pt;line-height:1.45;margin-bottom:4mm}
.f{margin-top:auto;border-top:2px solid #1a1a1a;padding-top:4mm;font-size:10pt;color:#555}.f b{font-family:C;font-size:15pt;color:#000;display:block}
.cv{position:relative;width:297mm;height:210mm;background-size:cover;background-position:center;page-break-after:always}
.cv .bx{position:absolute;left:16mm;bottom:16mm;background:rgba(255,255,255,.94);padding:10mm 12mm;border-left:3mm solid #e2001a}
.cv h1{font-size:46pt}.cv p{font-size:13pt;color:#444;margin-top:3mm}`;
const foot = `<div class="f"><b>SARL MYF · La Maison du Parquet</b>Panneaux et parquet EGGER · Showroom Dar El Beïda · WhatsApp 0794 70 93 23 · lamaisonduparquet.org</div>`;
let html = `<html><head><meta charset="utf-8"><style>${css}</style></head><body>
<div class="cv" style="background-image:url(${img('yasser-1.jpg')})"><div class="bx"><div class="n">PROJET D'AMÉNAGEMENT INTÉRIEUR</div><h1>Appartement Yasser</h1><p>120 m² · Salon · 2 chambres · Cuisine<br>Style japandi chic : chêne EGGER et noir mat</p></div></div>`;
rooms.forEach((r,i)=>{ html += `<div class="p"><div class="im" style="background-image:url(${img(r[0])})"></div><div class="tx"><div class="n">0${i+1} / 04</div><h1>${r[1]}</h1><h2>${r[2]}</h2><ul>${r[3].map(x=>`<li>${x}</li>`).join('')}</ul>${foot}</div></div>`; });
html += `</body></html>`;
(async()=>{ const t = path.join(require('os').tmpdir(),'dossier-yasser.html'); fs.writeFileSync(t, html);
 const b = await chromium.launch(); const p = await b.newPage(); await p.goto('file://'+t); await p.waitForTimeout(500);
 await p.pdf({path:OUT, width:'297mm', height:'210mm', printBackground:true}); await b.close(); console.log(OUT); })();
