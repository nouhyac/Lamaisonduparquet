const {chromium}=require('playwright');const O=__dirname+'/shots/';const w=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--allow-file-access-from-files']});
 // Portfolio Dzign : 8 démos, ordinateur
 let p=await (await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1})).newPage();
 await p.goto('file:///home/user/Lamaisonduparquet/entreprise/site-dzign/index.html');await w(1500);
 await p.screenshot({path:O+'dz-hero.jpg',quality:90});
 const n=await p.locator('.site-carte').count();
 for(let i=0;i<n;i++){await p.evaluate(i=>{document.querySelectorAll('.site-carte')[i].click()},i);await w(1200);
   await p.locator('#vue').screenshot({path:O+`pf-${i}.jpg`,quality:90});
   await p.evaluate(()=>document.getElementById('v-fermer').click());await w(200)}
 // mobile
 for(let i=0;i<n;i++){await p.evaluate(i=>{document.querySelectorAll('.site-carte')[i].click()},i);await w(600);await p.evaluate(()=>document.getElementById('v-mobile').click());await w(900);
   await p.locator('#vue').screenshot({path:O+`pm-${i}.jpg`,quality:90});await p.evaluate(()=>{document.getElementById('v-ordi').click();document.getElementById('v-fermer').click()});await w(200)}
 // Samir Drive
 const S='http://localhost:8798/';const sl=async ctx=>{for(const f of ['index.html','data.js','site.js','loueur.js'])await ctx.route('**/'+f,async r=>{const res=await r.fetch();let t=await res.text();t=t.split('Location de voitures · Alger').join('Location de voitures').split('· Alger').join('').split('ALGER').join('').split("Aéroport d'Alger · Terminal 1").join('Aéroport · Terminal 1').split("l'aéroport d'Alger").join("l'aéroport").split("aéroport d'Alger").join('aéroport').split("Aéroport d'Alger").join('Aéroport').split('Bordj El Kiffan, Alger').join('Centre-ville').split('Bordj El Kiffan').join('Centre-ville').split(' (Alger)').join('').split(', Alger').join('').split(' à Alger').join('');await r.fulfill({response:res,body:t,headers:{'content-type':f.endsWith('.js')?'application/javascript':'text/html'}})})};const prep=async(p,u='index.html')=>{await p.goto(S+u);await p.evaluate(()=>{localStorage.clear();sessionStorage.setItem('sd-ok','1')});await p.goto(S+u);await p.addStyleTag({content:'aside.demo{display:none!important}'});await w(1200)};
 {const c=await b.newContext({viewport:{width:1440,height:900}});await sl(c);p=await c.newPage()}await prep(p);
 await p.screenshot({path:O+'sd-home.jpg',quality:90});
 await p.evaluate(()=>document.getElementById('grille').scrollIntoView());await w(800);await p.screenshot({path:O+'sd-flotte.jpg',quality:90});
 await p.evaluate(()=>document.querySelector('[data-loueur]').click());await w(600);await p.click('#g-nav [data-page=planning]');await w(1200);await p.screenshot({path:O+'sd-planning.jpg',quality:90});
 await p.click('#g-nav [data-page=accueil]');await w(1000);await p.screenshot({path:O+'sd-gerant.jpg',quality:90});
 const mc=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});await sl(mc);const m=await mc.newPage();await prep(m);
 await m.screenshot({path:O+'sm-home.jpg',quality:90});
 await m.evaluate(()=>{R.d1=J(1);R.d2=J(4);ouvrirTunnel('v1')});await w(800);await m.screenshot({path:O+'sm-tunnel.jpg',quality:90});
 await m.click('#tu-suiv');await w(700);await m.screenshot({path:O+'sm-protec.jpg',quality:90});
 await b.close();console.log('ok',n)})();
