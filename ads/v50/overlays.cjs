// Calques de la vidéo 50 s : SARL MYF (comme sur le site) + remplacement de « Représentant EGGER en Algérie ».
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path'), fs = require('fs');
const SITE = path.resolve(__dirname, '../../site');
const css = `@font-face{font-family:C;src:url(file://${SITE}/assets/fonts/fira-sans-extra-condensed-800.woff2)}
@font-face{font-family:F;font-weight:600;src:url(file://${SITE}/assets/fonts/fira-sans-600.woff2)}
*{margin:0}html,body{width:1080px;height:1920px;background:transparent}
.myf{position:absolute;font-family:C;font-weight:800;line-height:1;letter-spacing:-.01em;padding-bottom:10px;border-bottom:12px solid #e2001a}
.url{position:absolute;font-family:F;font-weight:600;letter-spacing:.02em}.patch{position:absolute;background:#f6f6f3}
.lab{position:absolute;font-family:F;font-weight:600;font-size:22px;letter-spacing:.16em;text-transform:uppercase;color:#e2001a}`;
const pages = {
  intro: `<div class="myf" style="left:84px;top:96px;font-size:118px;color:#000">SARL MYF</div><div class="url" style="left:86px;top:244px;font-size:32px;color:#151412">lamaisonduparquet.org</div>
          <div class="patch" style="left:70px;top:796px;width:600px;height:36px"></div>
          <div class="lab" style="left:86px;top:802px">Parquet EGGER · en stock à Alger</div>`,
  end: `<div class="myf" style="left:79px;top:100px;font-size:104px;color:#fff">SARL MYF</div><div class="url" style="left:79px;top:1540px;font-size:44px;color:#fff;background:#e2001a;padding:16px 32px;border-radius:50px">lamaisonduparquet.org</div>`,
};
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  for (const [k, h] of Object.entries(pages)) {
    const f = path.join(__dirname, '_t.html'); fs.writeFileSync(f, `<!doctype html><meta charset=utf-8><style>${css}</style>${h}`);
    await p.goto('file://' + f); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(150);
    await p.screenshot({ path: path.join(__dirname, k + '.png'), omitBackground: true });
  }
  fs.unlinkSync(path.join(__dirname, '_t.html')); await b.close(); console.log('ok');
})();
