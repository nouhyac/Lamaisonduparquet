// Visuels fixes de la campagne : avant/après et 4 offres, en 4:5 (1080×1350) et en story 9:16 (1080×1920).
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const D = __dirname, OUT = path.join(D, '..'); const C = 'captures/';
const CSS = `*{box-sizing:border-box}html,body{margin:0;overflow:hidden;font-family:'Hanken Grotesk';color:#F5F3EE;background:#0B0B0F}
.page{position:relative;width:1080px;overflow:hidden;background:radial-gradient(ellipse 80% 50% at 50% 40%,#2a2418 0%,#14120f 48%,#0B0B0F 82%)}
em{font-style:normal;color:#C8A96A}
.logo{position:absolute;left:56px;top:48px;font-family:Syne;font-weight:800;font-size:44px;letter-spacing:-.03em}.logo b{color:#C8A96A}.logo small{font-family:'Hanken Grotesk';font-weight:600;font-size:13px;letter-spacing:.42em;margin-left:10px;vertical-align:8px;color:#E9E4D8}
h1{font-family:Syne;font-weight:800;letter-spacing:-.02em;line-height:1.06;margin:0;text-align:center}
.sous{text-align:center;font-weight:600;color:#E9E4D8}
.tel{position:relative;border-radius:46px;border:3px solid #C8A96A;background:#0e0e12;padding:11px;box-shadow:0 30px 70px rgba(0,0,0,.6)}
.tel img{display:block;width:100%;border-radius:35px}
.etiq{display:inline-block;font-weight:800;font-size:22px;letter-spacing:.24em;text-transform:uppercase;padding:10px 20px;border-radius:999px}
.av{background:#2A2A33;color:#bdb6a6}.ap{background:#C8A96A;color:#0B0B0F}
.dm{background:#121216;border:3px solid #3a3a44;border-radius:46px;padding:26px 22px;display:flex;flex-direction:column;gap:14px;box-shadow:0 30px 70px rgba(0,0,0,.6)}
.dm .h{display:flex;align-items:center;gap:12px;padding-bottom:14px;border-bottom:1px solid #2a2a33;font-weight:700;font-size:22px;color:#E9E4D8}
.dm .h i{width:40px;height:40px;border-radius:50%;background:#2A2A33;display:inline-block}
.b{align-self:flex-start;max-width:86%;background:#24242c;color:#F5F3EE;border-radius:22px 22px 22px 6px;padding:13px 18px;font-size:22px;font-weight:600;line-height:1.25}
.b small{display:block;color:#8d877b;font-size:15px;margin-top:4px;font-weight:600}
.n{align-self:center;color:#d06a5a;font-weight:700;font-size:19px;margin-top:4px}
.fl{position:absolute;font-family:Syne;font-weight:800;color:#C8A96A}
.cta{display:inline-flex;align-items:center;gap:14px;background:#25D366;color:#06210f;font-family:'Hanken Grotesk';font-weight:800;border-radius:999px}
.cta svg{width:1.1em;height:1.1em}
.of{display:flex;flex-direction:column}
.of div{display:flex;justify-content:space-between;align-items:center;border:1.5px solid rgba(200,169,106,.4);border-radius:26px;background:rgba(11,11,15,.55)}
.of span{font-weight:700}.of span small{display:block;font-weight:600;color:#bdb6a6}
.of b{font-family:Syne;font-weight:800;color:#C8A96A;white-space:nowrap}.of b small{font-family:'Hanken Grotesk';font-weight:600;color:#bdb6a6;margin-right:8px}
.gar{display:flex;flex-wrap:wrap;justify-content:center;gap:12px}
.gar span{border:1.5px solid rgba(200,169,106,.55);border-radius:999px;font-weight:700;color:#F5F3EE}
.gar b{color:#C8A96A}`;
const WA = '<svg viewBox="0 0 32 32"><path fill="#06210f" d="M16 3C9 3 3.3 8.6 3.3 15.6c0 2.3.6 4.5 1.8 6.4L3 29l7.2-1.9c1.8 1 3.8 1.5 5.8 1.5 7 0 12.7-5.6 12.7-12.6S23 3 16 3zm0 23.2c-1.9 0-3.7-.5-5.3-1.4l-.4-.2-4.3 1.1 1.1-4.1-.3-.4a10.4 10.4 0 0 1-1.6-5.6C5.2 9.8 10 5.1 16 5.1s10.8 4.7 10.8 10.5S22 26.2 16 26.2zm5.9-7.8c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2l-1 1.2c-.2.2-.4.2-.7.1-.3-.2-1.4-.5-2.6-1.6-1-.9-1.6-1.9-1.8-2.2-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.4.3-.6.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.9s1.2 3.3 1.4 3.6c.2.2 2.4 3.6 5.8 5 .8.4 1.4.6 1.9.7.8.3 1.5.2 2.1.1.6-.1 1.9-.8 2.2-1.5.3-.7.3-1.4.2-1.5-.1-.1-.3-.2-.6-.4z"/></svg>';
const LOGO = '<div class="logo">d<b>z</b>ign<small>STUDIO</small></div>';
const DM = `<div class="dm"><div class="h"><i></i>Messages · 23</div>
 <div class="b">Salam, c'est combien la pizza&nbsp;?<small>il y a 2 h</small></div>
 <div class="b">Vous livrez ce soir&nbsp;?<small>il y a 1 h</small></div>
 <div class="b">Prix svp<small>il y a 52 min</small></div>
 <div class="b">Toujours ouvert&nbsp;??<small>il y a 40 min</small></div>
 <div class="b">Laissez tomber, j'ai commandé ailleurs.<small>il y a 12 min</small></div>
 <div class="n">23 messages sans réponse</div></div>`;
const avantApres = (H, story) => `<div class="page" style="height:${H}px">${LOGO}
 <h1 style="position:absolute;left:40px;right:40px;top:${story ? 200 : 125}px;font-size:${story ? 54 : 54}px;white-space:nowrap">Fini les commandes<br><em>perdues en message.</em></h1>
 <div style="position:absolute;left:56px;top:${story ? 420 : 300}px;width:440px;text-align:center"><span class="etiq av">Avant · Instagram seul</span>
   <div style="margin-top:22px;text-align:left">${DM}</div></div>
 <div style="position:absolute;right:56px;top:${story ? 420 : 300}px;width:470px;text-align:center"><span class="etiq ap">Après · votre propre site</span>
   <div class="tel" style="margin-top:22px;height:${story ? 940 : 780}px;overflow:hidden"><img src="${C}tel-pizza.jpg" style="height:auto;margin-top:-96px"></div></div>
 <div class="fl" style="left:487px;top:${story ? 860 : 660}px;font-size:70px">→</div>
 <p class="sous" style="position:absolute;left:40px;right:40px;top:${story ? 1440 : 1150}px;font-size:${story ? 32 : 28}px;margin:0">Carte, panier, suivi en direct. <em>Sans commission.</em><br>Vous voyez votre site gratuitement avant de payer quoi que ce soit.</p>
 ${story ? `<div style="position:absolute;left:0;right:0;top:1650px;text-align:center"><span class="cta" style="font-size:40px;padding:24px 44px;white-space:nowrap">${WA}Envoyez le nom de votre commerce</span><p class="sous" style="font-size:30px;margin:22px 0 0">WhatsApp · 0549 50 68 57 · dzignstudio.store</p></div>`
    : `<p class="sous" style="position:absolute;left:0;right:0;top:1270px;margin:0;font-size:26px;color:#C8A96A;font-weight:700">Démo gratuite à votre nom · WhatsApp 0549 50 68 57</p>`}
</div>`;
const OFFRES = [['Site vitrine', 'Présentez votre commerce', '20 000 DA'], ['Boutique en ligne', 'Catalogue, panier, livraison', '50 000 DA'], ['Plateforme commerçants', 'Commandes, cuisine, suivi en direct', '80 000 DA'], ['Application', 'Sur le téléphone de vos clients', '150 000 DA']];
const offres = (H, story) => { const s = story ? 1.12 : 1; return `<div class="page" style="height:${H}px">${LOGO}
 <h1 style="position:absolute;left:40px;right:40px;top:${story ? 200 : 125}px;font-size:${story ? 56 : 52}px;white-space:nowrap">Votre site,<br><em>vu avant d'être payé.</em></h1>
 <div class="of" style="position:absolute;left:60px;right:60px;top:${story ? 470 : 315}px;gap:${story ? 22 : 16}px">
  ${OFFRES.map(([a, d, p]) => `<div style="padding:${story ? 30 : 22}px 34px"><span style="font-size:${38 * s}px">${a}<small style="font-size:${22 * s}px">${d}</small></span><b style="font-size:${44 * s}px"><small style="font-size:${22 * s}px">dès</small>${p}</b></div>`).join('')}
 </div>
 <div class="gar" style="position:absolute;left:50px;right:50px;top:${story ? 1330 : 890}px">
  ${['<b>Démo gratuite</b> à votre nom', '<b>0 DA</b> avant de voir votre site', '<b>50 %</b> à la validation · <b>50 %</b> à la livraison', 'Satisfait ou <b>remboursé</b>'].map(x => `<span style="font-size:${26 * s}px;padding:${story ? 16 : 12}px ${story ? 26 : 22}px">${x}</span>`).join('')}
 </div>
 ${story ? `<div style="position:absolute;left:0;right:0;top:1650px;text-align:center"><span class="cta" style="font-size:40px;padding:24px 44px;white-space:nowrap">${WA}Envoyez le nom de votre commerce</span><p class="sous" style="font-size:30px;margin:22px 0 0">WhatsApp · 0549 50 68 57 · dzignstudio.store</p></div>`
   : `<div style="position:absolute;left:0;right:0;top:1085px;text-align:center"><p class="sous" style="font-size:28px;margin:0 0 26px">Vous voyez votre site gratuitement<br>avant de payer quoi que ce soit.</p><span class="cta" style="font-size:34px;padding:18px 38px;white-space:nowrap">${WA}0549 50 68 57</span></div>`}
</div>`; };
const V = { 'post-avant-apres': [1350, avantApres(1350, false)], 'story-avant-apres': [1920, avantApres(1920, true)], 'post-4-offres': [1350, offres(1350, false)], 'story-4-offres': [1920, offres(1920, true)] };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  for (const [nom, [H, html]] of Object.entries(V)) {
    const p = await b.newPage({ viewport: { width: 1080, height: H } });
    fs.writeFileSync(D + '/_v.html', `<!doctype html><html><head><meta charset="utf-8"><link href="polices/polices.css" rel="stylesheet"><style>${CSS}</style></head><body>${html}</body></html>`);
    await p.goto('file://' + D + '/_v.html'); await p.waitForTimeout(900);
    await p.screenshot({ path: OUT + '/' + nom + '.png' }); await p.close(); console.log(nom);
  }
  fs.rmSync(D + '/_v.html'); await b.close();
})();
