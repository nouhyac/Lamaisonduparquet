const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage({viewport:{width:1080,height:1920}});
const V=[['ov-demo','Fermez les yeux,','Arzata passe<br><em>en ligne</em>','La démo de votre plateforme · Dzign Studio'],['ov-lance','Nouveau chez Arzata','Commandez<br><em>en ligne</em>','Sans appeler · livraison · à emporter · sur place']];
for(const [n,s,h,pp] of V){await p.setContent(fs.readFileSync(__dirname+'/ov.html','utf8').replace('__S__',s).replace('__H__',h).replace('__P__',pp));await p.waitForTimeout(1500);await p.screenshot({path:__dirname+'/'+n+'.png',omitBackground:true})}
await b.close()})();
