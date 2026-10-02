// Génère les textes à l'écran (PNG transparents 1080x1920) et la carte de fin, aux couleurs du site.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path');
const SITE = path.resolve(__dirname, '../../site');
const OUT = path.resolve(__dirname, 'cards');

const css = `
@font-face{font-family:C;src:url(file://${SITE}/assets/fonts/fira-sans-extra-condensed-800.woff2)}
@font-face{font-family:C6;src:url(file://${SITE}/assets/fonts/fira-sans-extra-condensed-600.woff2)}
@font-face{font-family:F;font-weight:400;src:url(file://${SITE}/assets/fonts/fira-sans-400.woff2)}
@font-face{font-family:F;font-weight:600;src:url(file://${SITE}/assets/fonts/fira-sans-600.woff2)}
*{margin:0;box-sizing:border-box}html,body{width:1080px;height:1920px;background:transparent}
.t{position:absolute;left:72px;right:72px;color:#fff;font-family:C;text-transform:uppercase;line-height:.92;font-size:118px;
  text-shadow:0 4px 30px rgba(0,0,0,.55),0 2px 6px rgba(0,0,0,.4)}
.t .r{color:#ff3347}.t .s{display:block;font-family:C6;font-size:62px;line-height:1.05;margin-top:18px;color:#f3efe9}
.top{top:190px}.bot{bottom:300px}
.sc{position:absolute;left:0;right:0;height:1000px}.sc.t0{top:0;background:linear-gradient(180deg,rgba(10,9,8,.62),rgba(10,9,8,.35) 45%,rgba(10,9,8,0))}.sc.b0{bottom:0;background:linear-gradient(0deg,rgba(10,9,8,.66),rgba(10,9,8,.35) 45%,rgba(10,9,8,0))}
.tag{display:inline-block;background:#e2001a;color:#fff;font-family:C;font-size:44px;letter-spacing:.04em;padding:10px 22px;margin-bottom:22px;text-shadow:none}
`;
const cards = {
  t1: `<div class="t top">Changez de sol<br><span class="r">sans casser</span><br>votre carrelage.</div>`,
  t2: `<div class="t bot"><span class="tag">Parquet EGGER</span><br>Clipsé<br>par-dessus.<span class="s">Pas de démolition. Pas de gravats. Pas de poussière.</span></div>`,
  t3: `<div class="t top">Posé en<br><span class="r">une journée.</span></div>`,
  t4: `<div class="t bot"><span class="tag">Version Aqua</span><br>24 h de<br>résistance<br>à l'eau.</div>`,
  t5: `<div class="t top">Plus chaud<br>que le<br><span class="r">carrelage.</span><span class="s">Compatible chauffage au sol</span></div>`,
  t6: `<div class="t bot">5 décors<br>de chêne<br><span class="r">en stock.</span><span class="s">Fabriqués par EGGER</span></div>`,
  t7: `<div class="t top">Venez<br>les toucher.<span class="s">Showroom de Dar El Beïda · devis sur place</span></div>`,
};

const decors = [["EL2863","Chêne Asgil miel"],["EL1061","Chêne Achensee"],["EL2970","Chêne du Nord naturel"],["EL2416","Chêne Melba beige"],["EL1055","Chêne Bardolino"]];
decors.forEach(([r,n],i)=>{ cards['d'+i] = `<div class="t bot" style="bottom:240px"><span class="tag">${r}</span><br>${n}</div>`; });
const end = `
<style>body{background:#fff}.w{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:56px;font-family:F;color:#151412;text-align:center}
.myf{font-family:C;font-size:150px;line-height:1;border-bottom:16px solid #e2001a;padding-bottom:10px}
.logos{display:flex;align-items:center;gap:60px}.logos img{height:150px}.logos img.e{height:70px}
.h{font-family:C;text-transform:uppercase;font-size:96px;line-height:.95}.h b{color:#e2001a;font-weight:inherit}
.wa{background:#1f8a4c;color:#fff;border-radius:18px;padding:36px 60px;font-family:C;font-size:110px;line-height:1}
.wa small{display:block;font-family:F;font-weight:600;font-size:40px;margin-bottom:12px;opacity:.9}
.u{font-size:46px;font-weight:600}.u span{display:block;font-weight:400;font-size:38px;color:#5f5a52;margin-top:10px}</style>
<div class="w"><div class="myf">SARL MYF</div>
<div class="logos"><img src="file://${SITE}/img/brand-lmdp.png"><img class="e" src="file://${SITE}/img/brand-egger.png"></div>
<div class="h">Parquet EGGER<br><b>posé sur carrelage</b></div>
<div class="wa"><small>WhatsApp · Appel</small>0549 50 68 57</div>
<div class="u">www.lamaisonduparquet.org<span>Showroom Dar El Beïda · Alger · Livraison partout en Algérie</span></div></div>`;

// page écrite sur disque : les polices et logos en file:// se chargent (bloqués depuis about:blank)
async function show(p, html) {
  const f = path.join(OUT, '_tmp.html'); require('fs').writeFileSync(f, `<!doctype html><meta charset="utf-8">${html}`);
  await p.goto('file://' + f); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(150);
}
(async () => {
  require('fs').mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  for (const [k, h] of Object.entries(cards)) {
    const sc = h.includes('t top') ? '<div class="sc t0"></div>' : '<div class="sc b0"></div>';
    await show(p, `<style>${css}</style>${sc}${h}`);
    await p.screenshot({ path: `${OUT}/${k}.png`, omitBackground: true });
  }
  await show(p, `<style>${css}</style>${end}`);
  await p.screenshot({ path: `${OUT}/end.png` });
  await b.close(); console.log('ok');
})();
