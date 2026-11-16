const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const [, , lang, w, h, mode] = process.argv; const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +w, height: +h } });
  await p.goto(`file://${__dirname}/adD.html?lang=${lang}&w=${w}&h=${h}`, { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(600);
  const dur = await p.evaluate(() => DUR);
  if (mode && mode.startsWith('prev')) { for (const t of mode.slice(5).split(',').map(Number)) { await p.evaluate(x => render(x), t); await p.waitForTimeout(60); await p.screenshot({ path: `${__dirname}/pvD-${lang}-${w}x${h}-${t}.jpg`, type: 'jpeg', quality: 72 }); } await b.close(); return; }
  const dir = `${__dirname}/frD-${lang}-${w}x${h}`; fs.mkdirSync(dir, { recursive: true });
  for (let i = 0; i < Math.round(dur * 30); i++) { await p.evaluate(x => render(x), i / 30); await p.screenshot({ path: `${dir}/f${String(i).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 88 }); }
  await b.close();
})();
