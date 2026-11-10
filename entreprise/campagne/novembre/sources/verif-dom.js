// Contrôle : texte visible + attributs des pages filmées (marque neutre) → aucun nom, lieu, téléphone ou Instagram de prospect
const {chromium,w,TEL,PC,contexte,EXE}=require('./commun');
const BAD=/wood ?pecker|draria|\bbrew\b|baraka|alg[ée]ri|alger|\boran\b|wilaya|kabyl|tlemcen|hydra|chéraga|وود|بيكر|الدرارية|الجزائر|وهران|instagram\.com\/(?!lecomptoir|maisoncafe)|0770 ?17|0770 ?15 ?88|démo réalisée/i;
(async()=>{const b=await chromium.launch({executablePath:EXE});
 const cas=[['woodpecker','/home/user/Lamaisonduparquet/entreprise/vente/demos/woodpecker/site','http://localhost:8811/index.html',TEL],
  ['woodpecker','/home/user/Lamaisonduparquet/entreprise/vente/demos/woodpecker/site','http://localhost:8811/gestion.html',PC],
  ['brew','/home/user/Lamaisonduparquet/entreprise/vente/demos/brew/site','http://localhost:8812/index.html',TEL]];
 for(const [s,r,u,o] of cas){const c=await contexte(b,o,s,r);const p=await c.newPage();await p.goto(u);await w(1800);
  if(u.includes('gestion')){for(const d of '0328'){await p.evaluate(d=>{const b=[...document.querySelectorAll('#pave button')].find(x=>x.textContent.trim()===d);b&&b.click()},d);await w(120)}await w(800);
    for(const lab of ['Cuisine','Commandes','Livraisons']){await p.evaluate(l=>{const a=[...document.querySelectorAll('.barre-laterale button, .barre-laterale a')].find(x=>x.textContent.trim().startsWith(l));a&&a.click()},lab);await w(500);
     const t=await p.evaluate(()=>document.body.innerText+' '+document.title);const m=t.match(new RegExp(BAD.source,'gi'));console.log(u,lab,m?[...new Set(m)]:'OK')}}
  else{if(s==='brew')await p.evaluate(()=>document.querySelector('.seg[data-view="open"]').click());await w(500);
   const t=await p.evaluate(()=>{const vis=[...document.querySelectorAll('body *')].filter(e=>e.offsetParent!==null&&e.children.length===0).map(e=>e.textContent).join(' ');return vis+' '+document.title+' '+[...document.querySelectorAll('img')].map(i=>i.alt+' '+i.src).join(' ')});
   const m=t.match(new RegExp(BAD.source,'gi'));console.log(u,m?[...new Set(m)]:'OK')}
  await c.close()}
 // boutique (portfolio Dzign)
 const c=await contexte(b,TEL,'dzign','/home/user/Lamaisonduparquet/entreprise/site-dzign');const p=await c.newPage();await p.goto('http://localhost:8813/index.html');await w(2000);
 await p.evaluate(()=>document.querySelector('.site-carte[data-i="1"]').click());await w(1200);
 const t=await p.evaluate(()=>document.getElementById('visionneuse').innerText);const m=t.match(new RegExp(BAD.source,'gi'));console.log('boutique',m?[...new Set(m)]:'OK');
 await b.close()})();
