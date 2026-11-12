const { chromium } = require('/opt/node22/lib/node_modules/playwright'); const path=require('path'),fs=require('fs');
(async()=>{ const D=__dirname; const views=JSON.parse(process.argv[2]); const outdir=process.argv[3];
 const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 for(const v of views){ const p=await b.newPage({viewport:{width:1600,height:1200}}); p.on('pageerror',e=>console.log('err:',e.message));
  await p.route('http://lmdp.local/**',async rt=>{const f=path.join(D,new URL(rt.request().url()).pathname);const ext=path.extname(f);
   const ct={'.html':'text/html','.js':'text/javascript','.jpg':'image/jpeg','.json':'application/json','.woff2':'font/woff2'}[ext]||'application/octet-stream';
   try{await rt.fulfill({body:fs.readFileSync(f),contentType:ct})}catch(e){await rt.fulfill({status:404})}});
  await p.goto('http://lmdp.local/ayham.html?'+new URLSearchParams(v.q)); await p.waitForFunction('window.ready===true',null,{timeout:120000});
  await p.screenshot({path:path.join(outdir,v.f)}); await p.close(); console.log(v.f);}
 await b.close();})();
