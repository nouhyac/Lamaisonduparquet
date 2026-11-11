// Enregistre les écrans du vrai site Samir Drive (et sa version neutre « Nova ») pour la pub
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const D=__dirname,O=D+'/rec/',SITE='http://localhost:8798/';const w=ms=>new Promise(r=>setTimeout(r,ms));
const NOVA=fs.readFileSync(D+'/logo-nova.jpg');
async function neutre(ctx,garde){
  if(!garde)await ctx.route('**/img/logo.jpg',r=>r.fulfill({body:NOVA,headers:{'content-type':'image/jpeg'}}));
  for(const f of ['index.html','data.js','site.js','loueur.js'])await ctx.route('**/'+f,async r=>{const res=await r.fetch();let t=await res.text();
    if(!garde)t=t.split('SAMIR DRIVE').join('NOVA DRIVE').split('Samir Drive').join('Nova Drive').split('Samir').join('Nova').split('SAMIR').join('NOVA');t=t.split('Location de voitures · Alger').join('Location de voitures').split('· Alger').join('').split('ALGER').join('').split("aéroport d'Alger").join('aéroport').split("l'aéroport d'Alger").join("l'aéroport").split(' à Alger').join('').split('Bordj El Kiffan').join('centre-ville')
      .split("Aéroport d'Alger · Terminal 1").join('Aéroport · Terminal 1').split("Aéroport d'Alger").join('Aéroport').split('Agence Bordj El Kiffan').join('Agence centre-ville')
      .split('Bordj El Kiffan, Alger').join('Centre-ville').split('Bordj El Kiffan').join('Centre-ville').split(' (Alger)').join('').split(', Alger').join('').split("à l'aéroport d'Alger").join("à l'aéroport");
    if(!garde)t=t.replace(/plaque:'[^']*'/g,"plaque:'00000 125 00'");
    await r.fulfill({response:res,body:t,headers:{'content-type':f.endsWith('.js')?'application/javascript':'text/html'}})});
}
const RECHERCHE=q=>`<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><style>
body{margin:0;height:100vh;background:radial-gradient(120% 60% at 50% 0%,#1d1810,#0a0a0b 70%);font-family:Inter,system-ui,sans-serif;color:#f5f1e8;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:26px}
.b{width:86%;display:flex;align-items:center;gap:12px;background:#f5f1e8;color:#17171a;border-radius:99px;padding:18px 22px;font-size:21px;font-weight:600;box-shadow:0 20px 60px rgba(212,175,97,.25)}
.b svg{width:22px;height:22px;flex:none}.c{display:inline-block;width:2px;height:24px;background:#c6922f;vertical-align:-4px;animation:k .8s steps(1) infinite}@keyframes k{50%{opacity:0}}
.r{width:86%;background:#17171a;border:1px solid rgba(212,175,97,.35);border-radius:20px;padding:16px 20px;opacity:0;transform:translateY(10px);transition:.35s}.r.on{opacity:1;transform:none}
.r small{color:#d4af61;font-size:13px;letter-spacing:.12em;text-transform:uppercase;font-weight:700}.r b{display:block;font-size:20px;margin-top:4px}.r span{color:#a9a49a;font-size:14px}
.tap{position:fixed;width:60px;height:60px;border-radius:50%;background:rgba(212,175,97,.45);transform:scale(0);transition:.4s}.tap.on{transform:scale(1.4);opacity:0}
</style><div class=b><svg viewBox="0 0 24 24" fill="none" stroke="#17171a" stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><span id=t></span><span class=c></span></div>
<div class=r id=r><small>Résultat</small><b>${q.res}</b><span>${q.sous}</span></div><div class=tap id=tap></div>
<script>const s=${JSON.stringify(q.txt)};let i=0;setTimeout(function f(){document.getElementById('t').textContent=s.slice(0,++i);if(i<s.length)setTimeout(f,55+Math.random()*40);else setTimeout(()=>{document.getElementById('r').classList.add('on');setTimeout(()=>{const r=document.getElementById('r').getBoundingClientRect(),t=document.getElementById('tap');t.style.left=(r.left+r.width/2-30)+'px';t.style.top=(r.top+r.height/2-30)+'px';t.classList.add('on')},420)},150)},250)</script>`;
async function clip(nom,opts,fn,dur){
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
  const hd=opts.deviceScaleFactor>1&&opts.taille.width>opts.viewport.width;
  const ctx=await b.newContext(hd?{...opts}:{...opts,recordVideo:{dir:O+'tmp-'+nom,size:opts.taille}});
  if(opts.nova||opts.sanslieu)await neutre(ctx,!!opts.sanslieu);
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  let fr=[],cdp,dir=O+'fr-'+nom+'/';
  if(hd){fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir);cdp=await ctx.newCDPSession(p);
    cdp.on('Page.screencastFrame',f=>{fr.push([f.metadata.timestamp,f.data]);cdp.send('Page.screencastFrameAck',{sessionId:f.sessionId}).catch(()=>{})});
    await cdp.send('Page.startScreencast',{format:'jpeg',quality:92,maxWidth:opts.taille.width,maxHeight:opts.taille.height,everyNthFrame:1})}
  await fn(p,ctx);await w(dur);
  if(hd){await cdp.send('Page.stopScreencast');const tf=Date.now()/1000;await ctx.close();await b.close();
    let L='ffconcat version 1.0\n';fr.forEach(([t,d],i)=>{fs.writeFileSync(dir+i+'.jpg',Buffer.from(d,'base64'));const n=i+1<fr.length?fr[i+1][0]:tf;L+=`file ${i}.jpg\nduration ${Math.max(0.001,n-t).toFixed(4)}\n`});
    L+=`file ${fr.length-1}.jpg\n`;fs.writeFileSync(dir+'l.txt',L);
    require('child_process').execSync(`ffmpeg -v error -y -f concat -safe 0 -i ${dir}l.txt -vf "scale=${opts.taille.width}:${opts.taille.height}:force_original_aspect_ratio=decrease,pad=${opts.taille.width}:${opts.taille.height}:(ow-iw)/2:0:black,fps=30" -c:v libvpx-vp9 -b:v 6M -deadline realtime -cpu-used 8 ${O+nom}.webm`);
    fs.rmSync(dir,{recursive:true,force:true});console.log(nom,fr.length+' images',errs.length?errs:'ok');return}
  const v=p.video();await ctx.close();await b.close();
  fs.renameSync(await v.path(),O+nom+'.webm');fs.rmSync(O+'tmp-'+nom,{recursive:true,force:true});console.log(nom,errs.length?errs:'ok');
}
const TEL={viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,taille:{width:780,height:1688}};
const PC={viewport:{width:1280,height:800},deviceScaleFactor:1.5,taille:{width:1280,height:800}};
const prep=async(p,url='index.html')=>{await p.goto(SITE+url);await p.evaluate(()=>{localStorage.clear();sessionStorage.clear();sessionStorage.setItem('sd-ok','1')});await p.goto(SITE+url);await p.addStyleTag({content:'aside.demo{display:none!important}'});await w(900)};
const lisse=(p,y,ms)=>p.evaluate(([y,ms])=>new Promise(res=>{const y0=scrollY,t0=performance.now();(function g(t){const k=Math.min(1,(t-t0)/ms);scrollTo(0,y0+(y-y0)*(k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2));k<1?requestAnimationFrame(g):res()})(t0)}),[y,ms]);
const signer=p=>p.evaluate(()=>new Promise(res=>{const c=document.getElementById('sig'),r=c.getBoundingClientRect();const pts=[];for(let i=0;i<=60;i++){const x=.12+i/60*.7;pts.push([x,.55+Math.sin(i/4)*.18*(1-i/80)+(i>40?(i-40)*.004:0)])}
  let i=0;const ev=(t,[x,y])=>c.dispatchEvent(new PointerEvent(t,{clientX:r.left+x*r.width,clientY:r.top+y*r.height,pointerId:1,bubbles:true}));c.setPointerCapture=()=>{};ev('pointerdown',pts[0]);
  (function g(){i++;if(i<pts.length){ev('pointermove',pts[i]);setTimeout(g,14)}else{ev('pointerup',pts[i-1]);res()}})()}));
(async()=>{
  fs.mkdirSync(O,{recursive:true});
  const which=process.argv[2]||'tout';
  if(which==='tout'||which==='a'){
    await clip('a-samir',{...TEL},async p=>{await p.setContent(RECHERCHE({txt:'samir drive',res:'Samir Drive · Location de voitures',sous:'Réservez en 2 minutes · Livraison aéroport 24 h/24'}))},2600);
    await clip('a-nova',{...TEL},async p=>{await p.setContent(RECHERCHE({txt:'louer une voiture',res:'Votre agence · Location de voitures',sous:'Réservation en ligne en 2 minutes'}))},2600);
  }
  if(which==='tout'||which==='b'){
    await clip('b-samir',{...TEL},async p=>{await prep(p);await w(1300);const y=await p.evaluate(()=>document.getElementById('grille').getBoundingClientRect().top+scrollY-150);await lisse(p,y,1400);await w(600);await lisse(p,y+430,1900)},700);
  }
  for(const v of ['samir','nova','samirl','samirsl']){ if(!(which==='tout'||which==='c'||which===v))continue;
    const court=v==='samir';
    await clip('c-'+v,{...TEL,nova:v==='nova',sanslieu:v==='samirsl'},async p=>{await prep(p);await p.evaluate(()=>{R.d1=J(1);R.d2=J(4);ouvrirTunnel('v1')});await w(700);
      await p.click('#tu-suiv');await w(court?700:900);await p.locator('.cp').nth(2).click();await w(court?700:900);
      await p.evaluate(()=>{lireEtape();T.opts=['siege'];Object.assign(T.c,{civ:'M.',prenom:'Karim',nom:'Benali',naiss:'1990-05-05',tel:'0550 12 34 56',numPiece:'109876543',permis:'P1234567',datePermis:'2010-01-01',adresse:'Centre-ville'});T.docs={permisR:'img/flotte/arkana-int2.jpg',piece:'img/flotte/arkana-pano.jpg'}});
      if(!court){await p.evaluate(()=>etape(4));await p.evaluate(()=>{document.querySelectorAll('.doc').forEach((d,i)=>{if(i<2){d.classList.add('ok');d.querySelector('small').textContent='Reçu ✓'}})});await w(500);await p.evaluate(()=>document.getElementById('tu-form').scrollTo({top:520,behavior:'smooth'}));await w(1100)}
      await p.evaluate(()=>{T.cgl=true;T.exact=true;etape(5)});await w(300);await p.evaluate(()=>document.getElementById('tu-form').scrollTo({top:900,behavior:'smooth'}));await w(500);await signer(p);await w(300);
      await p.evaluate(()=>{T.cgl=true;T.exact=true});await p.click('#tu-suiv');await w(200)},court?1300:1600);
  }
  for(const v of ['nova','samir','samirsl'])if(which==='tout'||which==='d'||which==='d'+v){
    await clip('d-'+v,{...PC,nova:v==='nova',sanslieu:v==='samirsl'},async p=>{await prep(p);await p.evaluate(()=>{document.querySelector('[data-loueur]').click()});await w(500);await p.click('#g-nav [data-page=planning]');await w(1500);
      await p.locator('.barre').nth(1).click();await w(900);await p.locator('#modale [data-contrat]').click();await w(1300);await p.keyboard.press('Escape');await p.keyboard.press('Escape');await w(150);
      await p.click('#g-nav [data-page=resas]');await w(250);await p.locator('.resa [data-remise]').first().click();await w(500);
      await p.evaluate(()=>{DOM=[{x:60,y:110,t:'Rayure'},{x:140,y:300,t:'Bosse'}];majSchema()});await p.evaluate(()=>document.querySelector('#modale .in').scrollIntoView());await p.locator('#edl-s').scrollIntoViewIfNeeded();await w(400);
      for(const c of await p.locator('.cote').all())await c.check();await w(300)},900);
  }
})();
