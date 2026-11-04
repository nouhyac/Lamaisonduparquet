const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path'), fs = require('fs'); const SITE = path.resolve(__dirname, '../../site');
const css = `@font-face{font-family:C;src:url(file://${SITE}/assets/fonts/fira-sans-extra-condensed-800.woff2)}
@font-face{font-family:P;font-weight:600;src:url(file://${SITE}/assets/fonts/fira-sans-600.woff2)}
*{margin:0}body{background:transparent}#t{display:inline-block;padding:2px 4px}
.myf{font-family:C;font-weight:800;font-size:54px;line-height:1;letter-spacing:-.01em;padding-bottom:7px;border-bottom:8px solid #e2001a}
.url{font-family:P;font-weight:600;font-size:23px;letter-spacing:.02em}.lab{font-family:P;font-weight:600;font-size:19px;letter-spacing:.22em;text-transform:uppercase}`;
const tags = { 'url-black': '<div class="url" style="color:#151412">lamaisonduparquet.org</div>', 'url-white': '<div class="url" style="color:#fff">lamaisonduparquet.org</div>', 'myf-black': '<div class="myf" style="color:#000">SARL MYF</div>', 'myf-white': '<div class="myf" style="color:#fff">SARL MYF</div>',
  'label14': '<div class="lab" style="color:#956936">Parquet EGGER · en stock à Alger</div>' };
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1000, height: 300 }, deviceScaleFactor: 1 });
  for (const [k, h] of Object.entries(tags)) { const f = path.join(__dirname, '_t.html');
    fs.writeFileSync(f, `<!doctype html><meta charset=utf-8><style>${css}</style><div id="t">${h}</div>`);
    await p.goto('file://' + f); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(100);
    await (await p.$('#t')).screenshot({ path: path.join(__dirname, k + '.png'), omitBackground: true }); }
  fs.unlinkSync(path.join(__dirname, '_t.html')); await b.close(); console.log('ok'); })();
