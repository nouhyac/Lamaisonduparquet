// Exemple original : console « Arche » suspendue 200 × 40 × 32 cm, 4 tiroirs cannelés, niche en arche rétroéclairée,
// panneau de tasseaux bois derrière la TV, sur parquet EGGER Chêne Asgil miel (rendu 1080 × 1350).
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path'), fs = require('fs');
const R = p => 'file://' + path.resolve(__dirname, p);
const SITE = path.resolve(__dirname, '../../site');
const OAK = R('../sources/ref-decor-el2970.jpg'), FLOOR = R('../sources/ref-decor-el2863.jpg');
const S = 4.5; // px par cm
const html = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:F;font-weight:300;src:url(file://${SITE}/assets/fonts/fira-sans-300.woff2)}
@font-face{font-family:F;font-weight:600;src:url(file://${SITE}/assets/fonts/fira-sans-600.woff2)}
@font-face{font-family:C;src:url(file://${SITE}/assets/fonts/fira-sans-extra-condensed-800.woff2)}
*{margin:0;box-sizing:border-box}body{width:1080px;height:1350px;font-family:F;color:#151412;overflow:hidden;position:relative;background:#e9e2d6}
.wall{position:absolute;inset:0 0 420px 0;background:radial-gradient(120% 90% at 50% 30%,#efe8dc,#ddd3c3)}
.slats{position:absolute;left:300px;width:480px;top:150px;height:780px;background:
 repeating-linear-gradient(90deg,rgba(0,0,0,.28) 0 3px,transparent 3px 24px),url(${OAK}) center/700px auto;box-shadow:0 0 0 1px rgba(0,0,0,.05),0 30px 60px rgba(60,40,20,.25)}
.slats:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(255,230,190,.0),rgba(255,230,190,.18),rgba(255,230,190,0))}
.tv{position:absolute;left:330px;top:250px;width:420px;height:238px;background:#111;border:6px solid #1b1b1b;border-radius:6px;box-shadow:0 18px 40px rgba(0,0,0,.35)}
.floor{position:absolute;left:0;right:0;bottom:0;height:420px;background:url(${FLOOR}) center/560px auto}
.floor:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.28),rgba(0,0,0,0) 35%)}
.plinthe{position:absolute;left:0;right:0;top:912px;height:18px;background:#f4f1ec}
.glow{position:absolute;left:110px;top:790px;width:860px;height:140px;background:radial-gradient(ellipse at top,rgba(255,200,130,.85),rgba(255,200,130,0) 70%)}
.cons{position:absolute;left:90px;top:640px;width:${200*S}px;height:${32*S}px;background:#f7f4ef;border-radius:${16*S}px;box-shadow:0 30px 34px -16px rgba(60,40,20,.5)}
.dr{position:absolute;top:10px;bottom:10px;background:repeating-linear-gradient(90deg,rgba(0,0,0,.22) 0 2px,rgba(255,255,255,.12) 2px 4px,transparent 4px 16px),url(${OAK}) center/520px auto;border-radius:3px}
.dr.first{border-radius:${15*S}px 3px 3px ${15*S}px}
.arch{position:absolute;top:10px;bottom:10px;width:${30*S}px;background:#2a211a;border-radius:${15*S}px ${15*S}px 3px 3px;overflow:hidden;box-shadow:inset 0 8px 18px rgba(0,0,0,.5)}
.arch:before{content:"";position:absolute;inset:0;background:radial-gradient(70% 60% at 50% 30%,rgba(255,196,120,.95),rgba(255,160,80,.35) 60%,rgba(0,0,0,0) 80%)}
.vase{position:absolute;left:50%;bottom:0;width:34px;height:62px;margin-left:-17px;background:#efe6d6;border-radius:40% 40% 8px 8px}
.dim{position:absolute;font:600 22px F;color:#e2001a}
.h{left:90px;width:${200*S}px;top:600px;height:24px;border-left:2px solid #e2001a;border-right:2px solid #e2001a;text-align:center}
.h:before{content:"";position:absolute;left:0;right:0;top:50%;border-top:2px solid #e2001a}
.h span{background:#e6ddd0;padding:0 10px;position:relative}
.head{position:absolute;left:60px;top:44px;right:60px;display:flex;justify-content:space-between}
.t1{font:600 18px F;letter-spacing:.2em;text-transform:uppercase;color:#8a6a3e}
.t2{font-family:C;font-size:70px;line-height:.92;margin-top:8px}
.t2 i{font-style:normal;color:#8a6a3e}
.myf{font-family:C;font-size:44px;border-bottom:6px solid #e2001a;line-height:1;text-align:right}
.url{font:600 18px F;margin-top:8px;text-align:right}
.card{position:absolute;left:60px;right:60px;bottom:46px;background:rgba(21,20,18,.93);color:#fff;border-radius:22px;padding:24px 30px;display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.card b{display:block;font:600 14px F;letter-spacing:.14em;text-transform:uppercase;color:#d8ba8b;margin-bottom:6px}
.card p{font:300 20px F;line-height:1.3}
.tag{position:absolute;font:600 17px F;color:#fff;background:rgba(21,20,18,.78);padding:8px 14px;border-radius:30px}
</style>
<div class="wall"></div><div class="floor"></div><div class="plinthe"></div>
<div class="slats"></div><div class="tv"></div>
<div class="glow"></div>
<div class="cons">
 <div class="dr first" style="left:10px;width:${44*S}px"></div>
 <div class="dr" style="left:${10+44*S+6}px;width:${36*S}px"></div>
 <div class="arch" style="left:${10+80*S+12}px"><div class="vase"></div></div>
 <div class="dr" style="left:${10+110*S+18}px;width:${36*S}px"></div>
 <div class="dr" style="left:${10+146*S+24}px;width:${200*S-(10+146*S+24)-10}px;border-radius:3px ${15*S}px ${15*S}px 3px"></div>
</div>
<div class="dim h"><span>200 cm · 4 tiroirs cannelés + niche en arche</span></div>
<div class="tag" style="left:800px;top:330px">Tasseaux chêne · 107 × 175 cm</div>
<div class="tag" style="left:470px;top:808px">Niche arche éclairée</div>
<div class="head"><div><div class="t1">Création originale · salon</div><div class="t2">Console <i>Arche</i></div></div><div><div class="myf">SARL MYF</div><div class="url">lamaisonduparquet.org</div></div></div>
<div class="card">
 <div><b>Forme</b><p>Bouts arrondis<br>suspendue à 40 cm</p></div>
 <div><b>Tiroirs</b><p>4 façades cannelées<br>ouverture « push »</p></div>
 <div><b>Niche</b><p>Arche 30 cm<br>LED ambrée</p></div>
 <div><b>Mur TV</b><p>Tasseaux chêne<br>câbles cachés</p></div>
</div>`;
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 2 });
  const f = path.join(__dirname, '_tmp.html'); fs.writeFileSync(f, html);
  await p.goto('file://' + f); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(__dirname, 'console-arche.png') }); await b.close(); fs.unlinkSync(f); console.log('ok');
})();
