const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.goto('file://'+process.cwd()+'/fin.html');await p.waitForTimeout(2500);await p.screenshot({path:'fin.png'});await b.close();})();
