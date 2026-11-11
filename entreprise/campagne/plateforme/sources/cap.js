// Captures marketing de la plateforme sous la marque neutre « Forno » (aucun nom de client, aucun lieu)
const { chromium } = require('playwright');const fs=require('fs');const w=ms=>new Promise(r=>setTimeout(r,ms));const O=__dirname+'/cap/';fs.mkdirSync(O,{recursive:true});
const LOGO=fs.readFileSync(__dirname+'/logo-forno.jpg');
async function neutre(ctx){
 await ctx.route('**/img/logo.jpg',r=>r.fulfill({body:LOGO,headers:{'content-type':'image/jpeg'}}));
 for(const f of ['index.html','data.js','gestion.js']) await ctx.route('**/'+f,async r=>{const res=await r.fetch();let t=await res.text();t=t.split('Arzata').join('Forno').split('ARZATA').join('FORNO').split('Dar El Beïda').join('Centre-ville').split('arzatapizza').join('fornopizza');
   if(f==='index.html'){t=t.replace('<div class="demo" role="region"','<div class="demo" hidden role="region"');t='<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}</style>'+t}
   await r.fulfill({response:res,body:t,headers:{'content-type':f.endsWith('.js')?'application/javascript':'text/html'}})});
}
module.exports={neutre};
if(require.main===module)(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
 const m=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:3});await neutre(m);const p=await m.newPage();
 await p.goto('http://localhost:8797/index.html');await p.evaluate(()=>{localStorage.clear();sessionStorage.clear()});await p.reload();await w(2200);
 await p.screenshot({path:O+'tel-accueil.jpg',type:'jpeg',quality:88});
 await p.evaluate(()=>{document.querySelectorAll('.revele').forEach(e=>e.classList.add('vu'));document.querySelector('#onglets [data-c="Base crème"]').click()});await w(1500);await p.screenshot({path:O+'tel-carte.jpg',type:'jpeg',quality:88});
 await p.evaluate(()=>document.getElementById('b-moitie').click());await w(600);await p.evaluate(()=>{document.querySelector('input[name=taille][value="1"]').click();document.querySelector('input[name=extra][value="2"]').click()});await w(500);await p.screenshot({path:O+'tel-moitie.jpg',type:'jpeg',quality:88});
 await p.evaluate(()=>document.getElementById('b-ok').click());await w(1000);await p.evaluate(()=>{const s=document.querySelector('.toast');if(s)s.hidden=true;document.getElementById('b-flot').click()});await w(600);
 await p.evaluate(()=>{const s=document.getElementById('c-heure');s.value=s.options[2].value;s.dispatchEvent(new Event('change'))});await w(300);
 await p.evaluate(()=>{document.getElementById('t-contenu').scrollTo(0,0)});await w(300);await p.screenshot({path:O+'tel-panier.jpg',type:'jpeg',quality:88});
 await p.evaluate(()=>{const e=document.getElementById('c-cite');e.value='Cité des Oliviers';e.dispatchEvent(new Event('input'));const s=document.getElementById('c-zone');s.value=s.options[0].value;s.dispatchEvent(new Event('change'))});await w(300);
 await p.evaluate(()=>{const e=document.getElementById('c-cite');e.value='Cité des Oliviers';e.dispatchEvent(new Event('input'));document.getElementById('b-cmd').click()});await w(900);
 await p.evaluate(()=>{const L=IMS.commandes();const c=L[L.length-1];c.st='prep';c.four=Date.now()-75000;IMS.enregistrer(L)});await w(2700);await p.evaluate(()=>{document.getElementById('t-contenu').scrollTo(0,430)});await w(400);await p.screenshot({path:O+'tel-four.jpg',type:'jpeg',quality:88});
 const d=await b.newContext({viewport:{width:1280,height:800},deviceScaleFactor:2});await neutre(d);const q=await d.newPage();
 await q.goto('http://localhost:8797/index.html');await q.evaluate(()=>{localStorage.clear();sessionStorage.setItem('arz-acces','1')});await q.reload();await w(1500);
 for(const pg of ['accueil','cuisine','compta','caisse']){await q.evaluate(pg=>IMSG.ouvrir({page:pg}),pg);await w(900);await q.evaluate(()=>document.querySelectorAll('.g-voile,.g-toast').forEach(e=>e.remove()));await q.screenshot({path:O+'pc-'+pg+'.jpg',type:'jpeg',quality:88})}
 await b.close()})();
