// Tournage des démos « coffee shop » (Maison Café, marque neutre) et « boutique » (Lalla Couture, nom fictif) pour la vidéo B
const fs=require('fs'),path=require('path'),cp=require('child_process');
const {chromium,w,TEL,contexte,lisse,EXE}=require('./commun');
const O=process.env.REC,DBG=process.env.DBG;
const RIPPLE=`(()=>{const st=document.createElement('style');st.textContent='.__tap{position:fixed;z-index:2147483647;width:54px;height:54px;margin:-27px 0 0 -27px;border-radius:50%;background:rgba(255,255,255,.55);border:2px solid rgba(255,255,255,.9);pointer-events:none;animation:__t .5s ease-out forwards}@keyframes __t{0%{transform:scale(.4);opacity:1}100%{transform:scale(1.5);opacity:0}}';addEventListener('DOMContentLoaded',()=>document.head.appendChild(st));window.__ripple=(x,y)=>{const d=document.createElement('div');d.className='__tap';d.style.left=x+'px';d.style.top=y+'px';document.body.appendChild(d);setTimeout(()=>d.remove(),600)}})()`;
async function filmer(ctx,page,nom,W_,H_){const dir=path.join(O,'fr-'+nom);fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir,{recursive:true});
 const cdp=await ctx.newCDPSession(page);const fr=[];cdp.on('Page.screencastFrame',f=>{fr.push([f.metadata.timestamp,f.data]);cdp.send('Page.screencastFrameAck',{sessionId:f.sessionId}).catch(()=>{})});
 await cdp.send('Page.startScreencast',{format:'jpeg',quality:92,maxWidth:W_,maxHeight:H_,everyNthFrame:1});const t0=Date.now()/1000;
 return async()=>{await cdp.send('Page.stopScreencast');const tf=Date.now()/1000;let L='ffconcat version 1.0\n';
  fr.forEach(([t,d],i)=>{fs.writeFileSync(dir+'/'+i+'.jpg',Buffer.from(d,'base64'));const n=i+1<fr.length?fr[i+1][0]:tf;L+=`file ${i}.jpg\nduration ${Math.max(0.001,n-(i===0?t0:t)).toFixed(4)}\n`});
  L+=`file ${fr.length-1}.jpg\n`;fs.writeFileSync(dir+'/l.txt',L);
  cp.execSync(`ffmpeg -v error -y -f concat -safe 0 -i ${dir}/l.txt -vf "scale=${W_}:${H_}:force_original_aspect_ratio=decrease,pad=${W_}:${H_}:(ow-iw)/2:0:black,fps=30,format=yuv420p" -c:v libx264 -crf 14 -preset fast ${O}/${nom}.mp4`);console.log(nom,fr.length)}}
const tapEl=async(p,fn)=>{const ok=await p.evaluate(`(()=>{const e=(${fn})();if(!e)return false;window.__el=e;const r=e.getBoundingClientRect();window.__ripple(r.left+r.width/2,r.top+r.height/2);return true})()`);if(!ok){console.log('MANQUE',fn);return}await w(170);await p.evaluate(()=>window.__el.click())};
(async()=>{fs.mkdirSync(O,{recursive:true});const b=await chromium.launch({executablePath:EXE});
 // --- coffee shop
 {const c=await contexte(b,TEL,'brew','/home/user/Lamaisonduparquet/entreprise/vente/demos/brew/site','10:30');await c.addInitScript(RIPPLE);const p=await c.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
  await p.goto('http://localhost:8812/index.html');await w(1500);await p.evaluate(()=>document.querySelector('.seg[data-view="open"]').click());await w(800);await p.evaluate(()=>scrollTo(0,0));await w(500);
  if(DBG)await p.screenshot({path:O+'/c0.png'});
  const fin=await filmer(c,p,'cafe',780,1688);await w(900);
  const y=await p.evaluate(()=>document.getElementById('sigTitle').getBoundingClientRect().top+scrollY-90);await lisse(p,y,1300);await w(400);
  await tapEl(p,"()=>document.querySelector('.sig-card')");await w(900);if(DBG)await p.screenshot({path:O+'/c1.png'});
  await tapEl(p,"()=>document.getElementById('psAdd')");await w(800);
  await tapEl(p,"()=>{const a=document.getElementById('cartBar');return a&&a.offsetParent?a:document.getElementById('cartBtn')}");await w(1600);if(DBG)await p.screenshot({path:O+'/c2.png'});
  await fin();await c.close()}
 // --- boutique (portfolio du site Dzign, nom fictif)
 {const c=await contexte(b,TEL,'dzign','/home/user/Lamaisonduparquet/entreprise/site-dzign');await c.addInitScript(RIPPLE);const p=await c.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
  await p.goto('http://localhost:8813/index.html');await w(2500);await p.evaluate(()=>document.querySelector('.site-carte[data-i="1"]').click());await w(1200);
  await w(400);
  if(DBG)await p.screenshot({path:O+'/v0.png'});
  const fin=await filmer(c,p,'boutique',780,1688);await w(900);
  await p.evaluate(()=>new Promise(r=>{const v=document.getElementById('vue');const y0=v.scrollTop,t0=performance.now();const y=y0+560;(function g(t){const k=Math.min(1,(t-t0)/1400);v.scrollTop=y0+(y-y0)*(k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2);k<1?requestAnimationFrame(g):r()})(t0)}));await w(400);
  if(DBG)await p.screenshot({path:O+'/v1.png'});
  await tapEl(p,"()=>[...document.querySelectorAll('button,a,span,div')].filter(x=>x.textContent.trim()==='Ajouter au panier'&&x.children.length===0)[2]");await w(1500);
  if(DBG)await p.screenshot({path:O+'/v2.png'});
  await fin();await c.close()}
 await b.close()})();
