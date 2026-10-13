// node film.js <scene> : filme une scène du site en mobile (CDP screencast) -> final/pub/rec-<scene>.mp4
const { chromium } = require('playwright');
const fs=require('fs'),path=require('path'),{execSync}=require('child_process');
const S=process.argv[2];const OUT='/tmp/claude-0/-home-user-Lamaisonduparquet/2b12aa86-da61-5f7a-876b-2b76524a1083/scratchpad/final/pub';
const TMP=OUT+'/fr-'+S;
const w=ms=>new Promise(r=>setTimeout(r,ms));
async function scrollTo(p,sel,off=0,dur=900){await p.evaluate(async([sel,off,dur])=>{const e=document.querySelector(sel);const y0=scrollY,y1=e.getBoundingClientRect().top+scrollY+off;const t0=performance.now();await new Promise(res=>{function f(t){const k=Math.min(1,(t-t0)/dur);const ease=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;scrollTo(0,y0+(y1-y0)*ease);k<1?requestAnimationFrame(f):res()}requestAnimationFrame(f)})},[sel,off,dur])}
async function smooth(p,dy,dur){await p.evaluate(async([dy,dur])=>{const y0=scrollY,t0=performance.now();await new Promise(res=>{function f(t){const k=Math.min(1,(t-t0)/dur);scrollTo(0,y0+dy*(k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2));k<1?requestAnimationFrame(f):res()}requestAnimationFrame(f)})},[dy,dur])}
(async()=>{
 fs.rmSync(TMP,{recursive:true,force:true});fs.mkdirSync(TMP,{recursive:true});
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--autoplay-policy=no-user-gesture-required']});
 const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2.5,isMobile:true,hasTouch:true});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://localhost:8790/');await w(4500);
 // préparation hors caméra
 if(S==='essai'){await scrollTo(p,'#essai',-10,10);await w(800);}
 if(S==='portfolio'){await scrollTo(p,'#portfolio',-10,10);await w(800);}
 if(S==='3d'){await p.evaluate(()=>{const e=document.querySelector('#vitrine3d');e.scrollIntoView({block:'center'})});await w(12000);}
 if(S==='offre'){await scrollTo(p,'#formules',-10,10);await w(800);}
 const cdp=await ctx.newCDPSession(p);const frames=[];
 cdp.on('Page.screencastFrame',async f=>{frames.push({t:f.metadata.timestamp,data:f.data});try{await cdp.send('Page.screencastFrameAck',{sessionId:f.sessionId})}catch(e){}});
 await cdp.send('Page.startScreencast',{format:'jpeg',quality:92,maxWidth:1080,maxHeight:2400,everyNthFrame:1});
 await w(400);
 if(S==='essai'){
   await smooth(p,140,700);await w(200);
   await p.click('#essai-nom');await p.keyboard.type('Pâtisserie Yasmine',{delay:85});await w(300);
   await p.selectOption('#essai-secteur','resto');await w(300);
   const bt=await p.$$('#essai-couleurs button');if(bt[5])await bt[5].click();await w(500);
   await p.evaluate(()=>document.getElementById('form-essai').requestSubmit());await w(2600);
   await smooth(p,0,10);await p.evaluate(async()=>{const v=document.querySelector('.v-ecran, #v-ecran, .visionneuse iframe, .v-perso');});
   await p.mouse.wheel(0,500);await w(1400);await p.mouse.wheel(0,600);await w(1500);
 }
 if(S==='portfolio'){await smooth(p,420,1600);await w(700);await smooth(p,520,1800);await w(800);}
 if(S==='3d'){const box=await (await p.$('#vitrine3d canvas')||await p.$('#vitrine3d')).boundingBox();const cx=box.x+box.width/2,cy=box.y+Math.min(box.height/2,300);await p.mouse.move(cx,cy);await p.mouse.down();for(let i=0;i<45;i++){await p.mouse.move(cx-i*5,cy+Math.sin(i/9)*6);await w(20)}await p.mouse.up();await w(1800);}
 if(S==='offre'){await smooth(p,300,1000);await w(400);const e=await p.$('[data-offre="Signature"]');await e.scrollIntoViewIfNeeded();await w(400);await e.click();await w(1800);await smooth(p,0,10);await w(1500);}
 await cdp.send('Page.stopScreencast');await w(200);await b.close();
 const liste=[];frames.forEach((f,i)=>{const n=path.join(TMP,'f'+String(i).padStart(5,'0')+'.jpg');fs.writeFileSync(n,Buffer.from(f.data,'base64'));const d=i<frames.length-1?frames[i+1].t-f.t:0.1;liste.push("file '"+n+"'",'duration '+Math.max(0.001,d).toFixed(4))});
 liste.push("file '"+path.join(TMP,'f'+String(frames.length-1).padStart(5,'0')+'.jpg')+"'");fs.writeFileSync(TMP+'/l.txt',liste.join('\n'));
 execSync(`ffmpeg -loglevel error -y -f concat -safe 0 -i ${TMP}/l.txt -vf "scale=976:-2:flags=lanczos,fps=30,format=yuv420p" -c:v libx264 -crf 17 ${OUT}/rec-${S}.mp4`);
 console.log(S,frames.length,(frames[frames.length-1].t-frames[0].t).toFixed(1)+'s',errs);fs.rmSync(TMP,{recursive:true,force:true});
})();
