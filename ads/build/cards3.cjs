// Textes sobres du film 1:10 (PNG transparents 1080x1920) + carte de fin, polices du site.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path'), fs = require('fs');
const SITE = path.resolve(__dirname, '../../site');
const OUT = path.resolve(__dirname, 'cards3');

const css = `
@font-face{font-family:F;font-weight:300;src:url(file://${SITE}/assets/fonts/fira-sans-300.woff2)}
@font-face{font-family:F;font-weight:500;src:url(file://${SITE}/assets/fonts/fira-sans-500.woff2)}
@font-face{font-family:F;font-weight:600;src:url(file://${SITE}/assets/fonts/fira-sans-600.woff2)}
@font-face{font-family:C;src:url(file://${SITE}/assets/fonts/fira-sans-extra-condensed-800.woff2)}
*{margin:0;box-sizing:border-box}html,body{width:1080px;height:1920px;background:transparent}
.sc{position:absolute;left:0;right:0;bottom:0;height:760px;background:linear-gradient(0deg,rgba(8,7,6,.62),rgba(8,7,6,.28) 55%,rgba(8,7,6,0))}
.t{position:absolute;left:84px;right:84px;bottom:330px;color:#fff;font-family:F;font-weight:600;font-size:76px;line-height:1.08;letter-spacing:-.005em;
  text-shadow:0 2px 24px rgba(0,0,0,.35)}
.t:before{content:"";display:block;width:84px;height:8px;background:#e2001a;margin-bottom:30px}
.t small{display:block;font-weight:300;font-size:40px;margin-top:16px;opacity:.92}`;

const lines = {
  c1: 'Votre carrelage reste.',
  c2: 'Votre maison change.',
  c3: 'Le parquet EGGER<br>se pose par-dessus.',
  c4: 'La vraie texture du bois.',
  c5: 'Aqua : 24 h de résistance à l’eau.',
  c6: 'Plus chaud que le carrelage.',
  c7: 'Posé en une journée.',
  c8: '5 décors en stock à Alger.',
  c9: 'Choisissez-le en vrai.',
  c10: 'Showroom de Dar El Beïda<small>Devis sur place · livraison partout en Algérie</small>',
};
const end = `<style>body{background:#fbfaf8}.w{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:64px;font-family:F;color:#151412;text-align:center}
.myf{font-family:C;font-size:132px;line-height:1;border-bottom:14px solid #e2001a;padding-bottom:8px}
.logos{display:flex;align-items:center;gap:56px}.logos img{height:132px}.logos img.e{height:62px}
.h{font-weight:300;font-size:64px;line-height:1.15}.h b{font-weight:600}
.wa{display:flex;flex-direction:column;align-items:center;gap:10px}.wa small{font-weight:500;font-size:36px;letter-spacing:.08em;text-transform:uppercase;color:#1f8a4c}
.wa span{font-family:C;font-size:120px;line-height:1}
.u{font-weight:500;font-size:42px;color:#5f5a52}</style>
<div class="w"><div class="myf">SARL MYF</div>
<div class="logos"><img src="file://${SITE}/img/brand-lmdp.png"><img class="e" src="file://${SITE}/img/brand-egger.png"></div>
<div class="h">Votre carrelage reste.<br><b>Votre maison change.</b></div>
<div class="wa"><small>WhatsApp · Appel</small><span>0549 50 68 57</span></div>
<div class="u">www.lamaisonduparquet.org</div></div>`;

async function show(p, html) {
  const f = path.join(OUT, '_tmp.html'); fs.writeFileSync(f, `<!doctype html><meta charset="utf-8"><style>${css}</style>${html}`);
  await p.goto('file://' + f); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(150);
}
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  for (const [k, t] of Object.entries(lines)) { await show(p, `<div class="sc"></div><div class="t">${t}</div>`); await p.screenshot({ path: `${OUT}/${k}.png`, omitBackground: true }); }
  await show(p, end); await p.screenshot({ path: `${OUT}/end.png` });
  fs.unlinkSync(path.join(OUT, '_tmp.html')); await b.close(); console.log('ok');
})();
