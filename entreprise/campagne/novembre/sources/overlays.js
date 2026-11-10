// Incrustations (PNG transparents 1080×1920) dans le style Dzign : Syne + Hanken Grotesk, noir + or champagne.
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const O = process.env.OV || path.join(__dirname, 'ov'); fs.mkdirSync(O, { recursive: true });
const CSS = `html,body{margin:0;background:transparent;width:1080px;height:1920px;overflow:hidden;font-family:'Hanken Grotesk'}
em{font-style:normal;color:#C8A96A}
.hook{position:absolute;left:0;right:0;top:150px;text-align:center}
.hook span{display:inline-block;font-family:Syne;font-weight:800;font-size:68px;line-height:1.08;letter-spacing:-.02em;color:#F5F3EE;background:rgba(11,11,15,.78);padding:24px 40px 28px;border-radius:24px;border:1.5px solid rgba(200,169,106,.6)}
.pill{position:absolute;left:0;right:0;text-align:center}
.pill span{display:inline-block;font-family:Syne;font-weight:800;font-size:46px;color:#0B0B0F;background:#C8A96A;padding:14px 36px 18px;border-radius:999px;box-shadow:0 12px 40px rgba(0,0,0,.45)}
.lab{position:absolute;left:0;right:0;top:175px;text-align:center}
.lab span{display:inline-block;font-family:Syne;font-weight:800;font-size:50px;line-height:1.1;letter-spacing:-.02em;color:#F5F3EE;background:rgba(11,11,15,.72);padding:16px 32px 20px;border-radius:20px;border:1.5px solid rgba(200,169,106,.45)}
.lab small{display:block;font-family:'Hanken Grotesk';font-weight:600;font-size:28px;letter-spacing:.02em;color:#E9E4D8;margin-top:6px}
.num{display:inline-grid;place-items:center;width:58px;height:58px;border-radius:50%;background:#C8A96A;color:#0B0B0F;font-size:34px;margin-right:16px;vertical-align:4px}
.carte{position:absolute;left:70px;right:70px;text-align:center;background:rgba(11,11,15,.86);border:1.5px solid rgba(200,169,106,.6);border-radius:32px;padding:54px 46px 56px;box-shadow:0 30px 80px rgba(0,0,0,.55);color:#F5F3EE}
.carte h2{font-family:Syne;font-weight:800;font-size:76px;line-height:1.06;letter-spacing:-.02em;margin:0}
.carte p{font-weight:600;font-size:36px;line-height:1.35;color:#E9E4D8;margin:26px 0 0}
.carte .sur{font-weight:700;font-size:26px;letter-spacing:.32em;text-transform:uppercase;color:#C8A96A;margin:0 0 22px}
.puces{display:flex;flex-direction:column;gap:18px;margin-top:38px}
.puces div{font-weight:700;font-size:36px;border:1.5px solid rgba(200,169,106,.55);border-radius:999px;padding:16px 26px;color:#F5F3EE}
.puces b{color:#C8A96A}
.wa{display:inline-flex;align-items:center;gap:18px;margin-top:44px;background:#25D366;color:#06210f;font-weight:800;font-size:52px;border-radius:999px;padding:24px 50px 26px;font-family:Syne}
.wa svg{width:56px;height:56px}
.offres{display:flex;flex-direction:column;gap:16px;margin-top:36px;text-align:left}
.offres div{display:flex;justify-content:space-between;align-items:baseline;border-bottom:1.5px solid rgba(200,169,106,.3);padding:14px 6px 18px}
.offres span{font-weight:700;font-size:40px}
.offres b{font-family:Syne;font-weight:800;font-size:46px;color:#C8A96A;white-space:nowrap}
.offres small{font-weight:600;font-size:24px;color:#bdb6a6;margin-right:10px}
.cache{visibility:hidden}
.fin{position:absolute;left:0;right:0;top:1150px;text-align:center;color:#F5F3EE}
.logo{font-family:Syne;font-weight:800;font-size:170px;letter-spacing:-.03em;line-height:1;text-shadow:0 10px 50px rgba(0,0,0,.7)}
.logo b{color:#C8A96A}
.st{font-weight:600;font-size:28px;letter-spacing:.5em;margin:8px 0 46px;color:#E9E4D8;padding-left:.5em}
.fin .url{font-family:Syne;font-weight:800;font-size:50px;color:#C8A96A}
.fin .tel{font-weight:700;font-size:38px;margin-top:18px;color:#F5F3EE}`;
const WA = '<svg viewBox="0 0 32 32"><path fill="#06210f" d="M16 3C9 3 3.3 8.6 3.3 15.6c0 2.3.6 4.5 1.8 6.4L3 29l7.2-1.9c1.8 1 3.8 1.5 5.8 1.5 7 0 12.7-5.6 12.7-12.6S23 3 16 3zm0 23.2c-1.9 0-3.7-.5-5.3-1.4l-.4-.2-4.3 1.1 1.1-4.1-.3-.4a10.4 10.4 0 0 1-1.6-5.6C5.2 9.8 10 5.1 16 5.1s10.8 4.7 10.8 10.5S22 26.2 16 26.2zm5.9-7.8c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2l-1 1.2c-.2.2-.4.2-.7.1-.3-.2-1.4-.5-2.6-1.6-1-.9-1.6-1.9-1.8-2.2-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.4.3-.6.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.9s1.2 3.3 1.4 3.6c.2.2 2.4 3.6 5.8 5 .8.4 1.4.6 1.9.7.8.3 1.5.2 2.1.1.6-.1 1.9-.8 2.2-1.5.3-.7.3-1.4.2-1.5-.1-.1-.3-.2-.6-.4z"/></svg>';
const offres = n => '<div class="carte" style="top:330px"><p class="sur">Nos 4 offres</p><h2>Votre site, <em>à votre prix</em></h2><div class="offres">' +
  [['Site vitrine', '20 000 DA'], ['Boutique en ligne', '50 000 DA'], ['Plateforme commerçants', '80 000 DA'], ['Application', '150 000 DA']]
    .map(([a, b], i) => `<div class="${i < n ? '' : 'cache'}"><span>${a}</span><b><small>dès</small>${b}</b></div>`).join('') +
  `</div><p class="${n < 5 ? 'cache' : ''}" style="margin-top:34px"><em>Démo gratuite à votre nom</em><br>Satisfait ou remboursé</p></div>`;
const S = {
  // ---- Vidéo A (restaurants)
  'a-hook': '<div class="hook"><span>Vos clients commandent<br>sur <em>VOTRE site.</em></span></div>',
  'a-hook2': '<div class="pill" style="top:395px"><span>Sans commission.</span></div>',
  'a-lab1': '<div class="lab"><span><b class="num">1</b>Le client commande<br><em>depuis son téléphone</em></span></div>',
  'a-lab2': '<div class="lab" style="top:150px"><span><b class="num">2</b>La commande arrive<br><em>direct en cuisine</em></span></div>',
  'a-lab3': '<div class="lab" style="top:150px"><span><b class="num">3</b>Le client suit<br><em>sa commande en direct</em></span></div>',
  'a-offre1': '<div class="carte" style="top:520px"><p class="sur">Notre offre</p><h2>Démo gratuite<br><em>à votre nom</em><br>en 24 h</h2><p>Vous payez seulement<br>si ça vous plaît.</p></div>',
  'a-offre2': '<div class="carte" style="top:420px"><h2 style="font-size:64px">Vous voyez votre site <em>gratuitement</em> avant de payer quoi que ce soit.</h2><div class="puces"><div><b>0 DA</b> avant de voir votre site</div><div><b>50 %</b> à la validation · <b>50 %</b> à la livraison</div><div>Satisfait ou <b>remboursé</b></div></div></div>',
  'a-cta': '<div class="carte" style="top:470px"><h2 style="font-size:66px">Envoyez-nous<br><em>le nom de votre restaurant</em><br>sur WhatsApp</h2><p>Votre démo est prête en 24 h.</p><div class="wa">' + WA + '0549 50 68 57</div></div>',
  'fin': '<div class="fin"><div class="logo">d<b>z</b>ign</div><div class="st">STUDIO</div><div class="url">dzignstudio.store</div><div class="tel">WhatsApp · 0549 50 68 57</div></div>',
  // ---- Vidéo B (tous commerces)
  'b-hook': '<div class="hook"><span>Votre site<br>à partir de <em>20 000 DA</em></span></div>',
  'b-hook2': '<div class="pill" style="top:395px"><span>Vous payez après l\'avoir vu.</span></div>',
  'b-resto': '<div class="lab"><span><em>Restaurant</em><small>Commandes en ligne · suivi en direct</small></span></div>',
  'b-cafe': '<div class="lab"><span><em>Coffee shop</em><small>Click &amp; collect · commande à table</small></span></div>',
  'b-boutique': '<div class="lab"><span><em>Boutique</em><small>Catalogue · panier · livraison</small></span></div>',
  'b-offres1': offres(1), 'b-offres2': offres(2), 'b-offres3': offres(3), 'b-offres4': offres(4), 'b-offres5': offres(5),
  'b-cta': '<div class="carte" style="top:470px"><h2 style="font-size:66px">Envoyez-nous<br><em>le nom de votre commerce</em><br>sur WhatsApp</h2><p>Démo gratuite à votre nom en 24 h.</p><div class="wa">' + WA + '0549 50 68 57</div></div>',
  // ---- Vidéo C (présentatrice) : nouveau badge paiement
  'c-paiement': '<div class="badge" style="top:250px"><span><em>0 DA</em> avant de voir<br>votre site<small>50 % à la validation · 50 % à la livraison</small></span></div>',
};
const CSSC = `.badge{position:absolute;left:0;right:0;text-align:center}
.badge span{display:inline-block;font-family:Syne;font-weight:800;font-size:60px;line-height:1.12;letter-spacing:-.02em;color:#F5F3EE;background:rgba(11,11,15,.74);padding:20px 36px 24px;border-radius:22px;border:1.5px solid rgba(200,169,106,.6)}
.badge em{font-style:normal;color:#C8A96A}
.badge small{display:block;font-family:'Hanken Grotesk';font-weight:600;font-size:30px;letter-spacing:.04em;color:#E9E4D8;margin-top:8px}`;
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  fs.writeFileSync(__dirname + '/polices/_ov.html', `<!doctype html><html><head><meta charset="utf-8"><link href="polices.css" rel="stylesheet"><style>${CSS}${CSSC}</style></head><body><span style="font-family:Syne">.</span><span style="font-family:'Hanken Grotesk'">.</span></body></html>`);
  await p.goto('file://' + __dirname + '/polices/_ov.html');
  await p.waitForTimeout(2500); await p.evaluate(() => document.fonts.ready);
  console.log('Syne chargée :', await p.evaluate(() => document.fonts.check('800 40px Syne')), 'Hanken :', await p.evaluate(() => document.fonts.check("600 20px 'Hanken Grotesk'")));
  const only = process.argv[2];
  for (const [k, h] of Object.entries(S)) { if (only && !k.startsWith(only)) continue; await p.evaluate(h => document.body.innerHTML = h, h); await p.waitForTimeout(120); await p.screenshot({ path: O + '/' + k + '.png', omitBackground: true }); }
  await b.close();
})();
