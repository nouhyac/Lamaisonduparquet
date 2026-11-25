const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path=require('path'),fs=require('fs');
(async()=>{
 const mode=process.argv[2]||'still', out=process.argv[3];
 const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:1080,height:1350}});
 p.on('console',m=>console.log('console:',m.text()));p.on('pageerror',e=>console.log('err:',e.message));
 // servir les fichiers locaux via route (modules ES interdits en file://)
 const D=__dirname;
 await p.route('http://lmdp.local/**',async rt=>{const f=path.join(D,new URL(rt.request().url()).pathname);const ext=path.extname(f);
   const ct={'.html':'text/html','.js':'text/javascript','.jpg':'image/jpeg','.woff2':'font/woff2'}[ext]||'application/octet-stream';
   try{await rt.fulfill({body:fs.readFileSync(f),contentType:ct})}catch(e){await rt.fulfill({status:404})}});
 await p.goto('http://lmdp.local/'+(process.env.SCENE||'scene.html')+'');
 await p.waitForFunction('window.ready===true',null,{timeout:120000});await p.evaluate(()=>document.fonts.ready);
 if(mode==='still'){await p.screenshot({path:out});}
 else{fs.mkdirSync(out,{recursive:true});const N=+process.argv[4]||120;
   for(let i=0;i<N;i++){const a=0.42+Math.sin(i/N*Math.PI*2)*0.55;await p.evaluate(a=>window.renderAt(a),a);await p.screenshot({path:path.join(out,String(i).padStart(4,'0')+'.jpg'),type:'jpeg',quality:92});}}
 await b.close();console.log('ok');
})();
