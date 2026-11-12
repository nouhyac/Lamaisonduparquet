const { chromium } = require('/opt/node22/lib/node_modules/playwright'); const path = require('path');
(async () => { const b = await chromium.launch(); const p = await b.newPage();
 await p.goto('file://' + path.join(__dirname, 'dossier.html')); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(800);
 await p.pdf({ path: process.argv[2], format: 'A4', landscape: true, printBackground: true, preferCSSPageSize: true });
 await p.setViewportSize({ width: 1123, height: 794 }); await p.screenshot({ path: 'dossier-preview.png', fullPage: true }); await b.close(); console.log('ok'); })();
