const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.goto('file://'+process.cwd()+'/ov2.html');await p.waitForTimeout(2500);
const S={
'hook':'<div class="hook"><span>Votre futur site<br><em>en 10 secondes.</em></span></div>',
'lab-essai':'<div class="lab"><span>Tapez votre nom… <em>voilà !</em></span></div>',
'lab-offre':'<div class="lab"><span>Choisissez <em>votre offre.</em></span></div>',
'lab-portfolio':'<div class="lab"><span>Des sites <em>qui vendent.</em></span></div>',
'lab-3d':'<div class="lab"><span>Et même <em>en 3D.</em></span></div>',
'b-5050':'<div class="badge" style="top:250px"><span>50 % au début<br><em>50 % à la fin</em><small>Paiement BaridiMob · 100 % à distance</small></span></div>',
'b-rembourse':'<div class="badge" style="top:250px"><span>Maquette <em>satisfaite</em><br>ou <em>remboursée</em></span></div>',
'b-20':'<div class="badge" style="top:250px"><span><em>-20 %</em><br>pour nos 5 premiers<small>Programme Fondateurs</small></span></div>',
'b-voyez':'<div class="badge" style="top:250px"><span>Voyez <em>votre site</em><br>maintenant ↓</span></div>'};
for(const [k,h] of Object.entries(S)){await p.evaluate(h=>document.body.innerHTML=h,h);await p.waitForTimeout(250);await p.screenshot({path:'ov-'+k+'.png',omitBackground:true});}
await b.close();})();
