// Exemple visuel : console suspendue de salon 200 × 40 × 30 cm, 4 tiroirs + niche, sur parquet EGGER (rendu 1080 × 1350).
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path');
const R = p => 'file://' + path.resolve(__dirname, p);
const SITE = path.resolve(__dirname, '../../site');
const html = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:F;font-weight:400;src:url(file://${SITE}/assets/fonts/fira-sans-300.woff2)}
@font-face{font-family:F;font-weight:600;src:url(file://${SITE}/assets/fonts/fira-sans-600.woff2)}
@font-face{font-family:C;src:url(file://${SITE}/assets/fonts/fira-sans-extra-condensed-800.woff2)}
*{margin:0;box-sizing:border-box}body{width:1080px;height:1350px;font-family:F;color:#151412;background:#f6f3ee;overflow:hidden;position:relative}
.wall{position:absolute;left:0;right:0;top:0;height:930px;background:linear-gradient(180deg,#efebe4,#e6e0d6)}
.floor{position:absolute;left:0;right:0;top:930px;height:420px;background:url(${R('../sources/ref-decor-el2863.jpg')}) center/540px auto;transform-origin:top;filter:saturate(1.05)}
.floor:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.25),rgba(0,0,0,0) 30%)}
.plinthe{position:absolute;left:0;right:0;top:912px;height:18px;background:#f4f1ec;box-shadow:0 2px 3px rgba(0,0,0,.12)}
.tv{position:absolute;left:300px;top:250px;width:480px;height:272px;background:#121212;border-radius:6px;box-shadow:0 20px 40px rgba(0,0,0,.25);border:6px solid #1c1c1c}
.tv:after{content:"55\\"";position:absolute;right:12px;bottom:8px;color:#555;font:600 14px F}
.glow{position:absolute;left:90px;top:780px;width:900px;height:150px;background:radial-gradient(ellipse at top,rgba(255,206,140,.75),rgba(255,206,140,0) 70%)}
.cons{position:absolute;left:90px;top:640px;width:900px;height:135px;background:#fbfaf8;border-radius:3px;box-shadow:0 26px 30px -14px rgba(60,40,20,.45),inset 0 -3px 0 rgba(0,0,0,.05)}
.dr{position:absolute;top:8px;height:119px;background:url(${R('../sources/ref-decor-el2970.jpg')}) center/600px auto;border-radius:2px;box-shadow:inset 0 0 0 1px rgba(0,0,0,.06)}
.dr:after{content:"";position:absolute;left:50%;top:6px;width:70px;height:3px;margin-left:-35px;background:rgba(0,0,0,.18);border-radius:2px}
.niche{position:absolute;right:8px;top:8px;width:108px;height:119px;background:#e9e4dc;box-shadow:inset 0 6px 12px rgba(0,0,0,.18)}
.box{position:absolute;left:14px;bottom:12px;width:66px;height:22px;background:#2a2a2a;border-radius:3px}
.dim{position:absolute;font:600 22px F;color:#e2001a;display:flex;align-items:center;justify-content:center}
.h{left:90px;width:900px;top:590px;height:30px;border-left:2px solid #e2001a;border-right:2px solid #e2001a}
.h:before{content:"";position:absolute;left:0;right:0;top:50%;border-top:2px solid #e2001a}
.h span,.v span{background:#efebe4;padding:0 10px;position:relative}
.v{flex-direction:column}
.v1{left:1004px;top:640px;height:135px;width:30px;border-top:2px solid #e2001a;border-bottom:2px solid #e2001a}
.v1:before,.v2:before{content:"";position:absolute;top:0;bottom:0;left:50%;border-left:2px solid #e2001a}
.v1 span{position:absolute;left:-150px;top:150px;white-space:nowrap;background:none}
.v2{left:40px;top:775px;height:137px;width:30px;border-top:2px solid #e2001a;border-bottom:2px solid #e2001a}
.v2 span{position:absolute;left:40px;white-space:nowrap;background:none;text-align:left}
.lab{position:absolute;font:400 20px F;color:#5f5a52}
.head{position:absolute;left:60px;top:46px;right:60px;display:flex;justify-content:space-between;align-items:flex-start}
.t1{font:600 18px F;letter-spacing:.2em;text-transform:uppercase;color:#8a6a3e}
.t2{font-family:C;font-size:66px;line-height:.95;margin-top:10px}
.myf{font-family:C;font-size:44px;border-bottom:6px solid #e2001a;line-height:1;text-align:right}
.url{font:600 18px F;margin-top:8px;text-align:right}
.card{position:absolute;left:60px;right:60px;bottom:50px;background:rgba(21,20,18,.92);color:#fff;border-radius:22px;padding:26px 32px;display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
.card b{display:block;font:600 15px F;letter-spacing:.14em;text-transform:uppercase;color:#d8ba8b;margin-bottom:6px}
.card p{font:400 21px F;line-height:1.3}
</style>
<div class="wall"></div><div class="floor"></div><div class="plinthe"></div>
<div class="head"><div><div class="t1">Exemple · meuble suspendu salon</div><div class="t2">Console TV<br>4 tiroirs + niche</div></div><div><div class="myf">SARL MYF</div><div class="url">lamaisonduparquet.org</div></div></div>
<div class="tv"></div>
<div class="glow"></div>
<div class="cons"><div class="dr" style="left:8px;width:188px;background-position:0px 0"></div><div class="dr" style="left:202px;width:188px;background-position:-190px 0"></div><div class="dr" style="left:396px;width:188px;background-position:-380px 0"></div><div class="dr" style="left:590px;width:188px;background-position:-570px 0"></div><div class="niche"><div class="box"></div></div></div>
<div class="dim h"><span>200 cm</span></div>
<div class="dim v v1"><span>30 cm<br><small style="font-weight:400;color:#5f5a52">prof. 40 cm</small></span></div>
<div class="dim v v2"><span>40 cm<br><small style="font-weight:400;color:#5f5a52">du sol</small></span></div>
<div class="lab" style="left:300px;top:530px">TV 55" · centre de l'écran à ±1,05 m</div>
<div class="lab" style="left:660px;top:960px;color:#fff;text-shadow:0 1px 6px rgba(0,0,0,.6)">Sol : parquet EGGER Chêne Asgil miel</div>
<div class="card">
 <div><b>Caisson</b><p>Blanc mat<br>panneau 19 mm</p></div>
 <div><b>Façades</b><p>Décor chêne<br>4 tiroirs « push »</p></div>
 <div><b>Niche</b><p>24 cm · box TV<br>passe-câble Ø 60</p></div>
 <div><b>Fixation</b><p>Rail mural en Z<br>LED 3000 K dessous</p></div>
</div>`;
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 2 });
  const f = path.join(__dirname, '_tmp.html'); require('fs').writeFileSync(f, html); await p.goto('file://' + f); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(__dirname, 'console-salon-200-4tiroirs.png') }); await b.close(); require('fs').unlinkSync(f); console.log('ok');
})();
