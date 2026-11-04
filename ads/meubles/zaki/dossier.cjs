// Dossier Appartement Zaki : node dossier.cjs <fonts> <sortie.pdf>
const { chromium } = require('/opt/node22/lib/node_modules/playwright'); const fs = require('fs'), path = require('path');
const [FONTS, OUT] = process.argv.slice(2); const d = __dirname;
const img = f => 'data:image/jpeg;base64,' + fs.readFileSync(path.join(d, 'brut', f)).toString('base64');
const rooms = [
 ['zaki-1.jpg','Salon','Mur TV à joints lumineux',['Mur pleine largeur en panneaux noir mat','Joints creux verticaux éclairés en LED','Niche centrale effet pierre anthracite','Meuble TV suspendu 2,40 m sans poignée']],
 ['zaki-2.jpg','Cuisine','Noir, pierre claire et chêne',['Façades noir mat sans poignée, profils gola laiton','Colonne en chêne clair pour casser le noir','Plan et crédence effet pierre claire','Îlot noir avec tabourets noir et laiton']],
 ['zaki-3.jpg','Espace de vie','Salon, repas, cuisine',['Un seul sol en parquet chêne clair','Table ronde en chêne fumé','Suspension linéaire noir et laiton','Faux plafond avec éclairage indirect']],
 ['zaki-4.jpg','Entrée','Dressing caché',['Habillage noir mat du sol au plafond','Portes affleurantes : penderie et chaussures derrière','Intérieur chêne clair éclairé','Banc suspendu chêne et miroir bord laiton']],
 ['zaki-5.jpg','Chambre parentale','Calme et luxe',['Tête de lit pleine largeur noir mat','Bandeau chêne clair et ligne LED cachée','2 chevets suspendus, poignées laiton','Armoire noire du sol au plafond, poignées laiton']],
 ['zaki-6.jpg','Chambre 2 · bureau','Bibliothèque et bureau',['Mur bibliothèque noir mat','Étagères chêne clair éclairées en LED','Bureau suspendu noir avec plateau chêne','Lit d\'appoint intégré']]];
const sw = [['noir','Noir mat EGGER U999 PM','Façades, murs, armoires'],['pierre','Effet pierre anthracite','Niche du mur TV'],['laiton','Laiton brossé','Profils gola, poignées, filets'],['chene','Chêne clair','Colonnes, étagères, bandeaux'],['parquet','Parquet EGGER chêne clair','Chêne du Nord ou Achensee · Melba Aqua en cuisine']];
const css = `@font-face{font-family:F;src:url(file://${FONTS}/fira-sans-400.woff2)}@font-face{font-family:F;font-weight:600;src:url(file://${FONTS}/fira-sans-600.woff2)}@font-face{font-family:C;src:url(file://${FONTS}/fira-sans-extra-condensed-800.woff2)}
@page{size:A4 landscape;margin:0}*{box-sizing:border-box;margin:0}body{font-family:F;color:#1a1a1a}
.p{width:297mm;height:210mm;display:flex;page-break-after:always;overflow:hidden}.im{width:168mm;height:210mm;background-size:cover;background-position:center}
.tx{flex:1;padding:16mm 14mm;display:flex;flex-direction:column}.n{font-family:C;color:#e2001a;font-size:15pt;letter-spacing:.08em}h1{font-family:C;font-size:38pt;line-height:1;margin:3mm 0 2mm}
h2{font-weight:400;font-size:14pt;color:#666;margin-bottom:9mm}ul{padding-left:5mm}li{font-size:12pt;line-height:1.45;margin-bottom:4mm}
.f{margin-top:auto;border-top:2px solid #1a1a1a;padding-top:4mm;font-size:10pt;color:#555}.f b{font-family:C;font-size:15pt;color:#000;display:block}
.cv{position:relative;width:297mm;height:210mm;background-size:cover;background-position:center;page-break-after:always}
.cv .bx{position:absolute;left:16mm;bottom:16mm;background:rgba(255,255,255,.94);padding:10mm 12mm;border-left:3mm solid #e2001a}.cv h1{font-size:46pt}.cv p{font-size:13pt;color:#444;margin-top:3mm}
.mt{width:297mm;height:210mm;padding:16mm;page-break-after:always}.g{display:grid;grid-template-columns:repeat(5,1fr);gap:6mm;margin-top:10mm}.g img{width:100%;aspect-ratio:1;object-fit:cover}.g b{display:block;margin-top:3mm;font-size:12pt}.g span{font-size:10pt;color:#666}`;
const foot = `<div class="f"><b>SARL MYF · La Maison du Parquet</b>Showroom EGGER · Cité ONAB, Lot 148, Dar El Beïda · WhatsApp 0794 70 93 23 · lamaisonduparquet.org</div>`;
let html = `<html><head><meta charset="utf-8"><style>${css}</style></head><body>
<div class="cv" style="background-image:url(${img('zaki-3.jpg')})"><div class="bx"><div class="n">PROJET D'AMÉNAGEMENT INTÉRIEUR</div><h1>Appartement Zaki</h1><p>100 m² · Salon · Cuisine · Entrée · 2 chambres<br>Concept « Graphite » : noir mat, pierre, laiton et chêne clair</p></div></div>
<div class="mt"><div class="n">LA PALETTE</div><h1>Le noir mat, réchauffé par le chêne et le laiton</h1><div class="g">${sw.map(s=>`<div><img src="${img('sw/'+s[0]+'.jpg')}"><b>${s[1]}</b><span>${s[2]}</span></div>`).join('')}</div>
<p style="margin-top:12mm;font-size:12pt;line-height:1.5;max-width:230mm">Meubles fabriqués en panneaux EGGER 18-19 mm, chants assortis, quincaillerie à fermeture amortie et LED intégrées. Le parquet EGGER se pose directement sur le carrelage existant, en une journée par pièce. Venez voir les panneaux et les parquets au showroom de Dar El Beïda, sur rendez-vous.</p></div>`;
rooms.forEach((r,i)=>{ html += `<div class="p"><div class="im" style="background-image:url(${img(r[0])})"></div><div class="tx"><div class="n">0${i+1} / 0${rooms.length}</div><h1>${r[1]}</h1><h2>${r[2]}</h2><ul>${r[3].map(x=>`<li>${x}</li>`).join('')}</ul>${foot}</div></div>`; });
html += `</body></html>`;
(async()=>{ const t=path.join(require('os').tmpdir(),'dossier-zaki.html'); fs.writeFileSync(t,html); const b=await chromium.launch(); const p=await b.newPage(); await p.goto('file://'+t); await p.waitForTimeout(500);
 await p.pdf({path:OUT,width:'297mm',height:'210mm',printBackground:true}); await p.setViewportSize({width:1123,height:794}); await p.screenshot({path:'/tmp/zaki-check.png',fullPage:true}); await b.close(); console.log(OUT); })();
