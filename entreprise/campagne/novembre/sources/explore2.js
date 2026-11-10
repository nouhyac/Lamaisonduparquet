const {chromium,w,TEL,contexte,lisse,EXE}=require('./commun');const O=process.env.X;
(async()=>{const b=await chromium.launch({executablePath:EXE});
 const c=await contexte(b,TEL,'brew','/home/user/Lamaisonduparquet/entreprise/vente/demos/brew/site');const p=await c.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
 await p.goto('http://localhost:8812/index.html');await w(2500);await p.screenshot({path:O+'/b1.png'});await p.screenshot({path:O+'/bfull.png',fullPage:true});
 const d=await contexte(b,TEL,'dzign','/home/user/Lamaisonduparquet/entreprise/site-dzign');const q=await d.newPage();q.on('pageerror',e=>console.log('ERR',e.message));
 await q.goto('http://localhost:8813/index.html');await w(2500);
 await q.evaluate(()=>document.querySelector('.site-carte[data-i="1"]').click());await w(1500);await q.screenshot({path:O+'/v1.png'});
 console.log(await q.evaluate(()=>document.getElementById('vue').scrollHeight));
 await b.close()})();
