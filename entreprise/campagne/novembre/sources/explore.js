const {chromium,w,TEL,PC,contexte,EXE}=require('./commun');const O=process.env.X;
const WP='/home/user/Lamaisonduparquet/entreprise/vente/demos/woodpecker/site';
(async()=>{const b=await chromium.launch({executablePath:EXE});
 const c=await contexte(b,TEL,'woodpecker',WP);const p=await c.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
 await p.goto('http://localhost:8811/index.html');await w(2500);
 await p.screenshot({path:O+'/m1.png'});
 await p.screenshot({path:O+'/mfull.png',fullPage:true});
 const pc=await contexte(b,PC,'woodpecker',WP);const g=await pc.newPage();g.on('pageerror',e=>console.log('ERR',e.message));
 await g.goto('http://localhost:8811/gestion.html');await w(1500);await g.screenshot({path:O+'/g0.png'});
 for(const d of '0328'){await g.evaluate(d=>{const b=[...document.querySelectorAll('#pave button')].find(x=>x.textContent.trim()===d);b&&b.click()},d);await w(150)}
 await w(1500);await g.screenshot({path:O+'/g1.png'});
 console.log(await g.evaluate(()=>[...document.querySelectorAll('.barre-laterale [data-p], .barre-laterale button, .barre-laterale a')].map(e=>(e.dataset.p||'')+':'+e.textContent.trim()).join(' | ')));
 await b.close()})();
