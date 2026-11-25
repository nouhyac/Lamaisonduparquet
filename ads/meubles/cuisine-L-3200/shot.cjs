// node shot.cjs stills '[{"f":"v1.png","a":[45,14,4200]}]' outdir WxH
// node shot.cjs frames outdir N WxH   (turntable path)
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const mode = process.argv[2];
  const size = (mode === 'stills' ? process.argv[5] : process.argv[5]) || '1600x1200';
  const [w, h] = size.split('x').map(Number);
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: w, height: h } });
  p.on('pageerror', e => console.log('err:', e.message));
  const D = __dirname;
  await p.route('http://lmdp.local/**', async rt => {
    const f = path.join(D, new URL(rt.request().url()).pathname); const ext = path.extname(f);
    const ct = { '.html': 'text/html', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.png': 'image/png' }[ext] || 'application/octet-stream';
    try { await rt.fulfill({ body: fs.readFileSync(f), contentType: ct }) } catch (e) { await rt.fulfill({ status: 404 }) }
  });
  await p.goto('http://lmdp.local/kitchen.html');
  await p.waitForFunction('window.ready===true', null, { timeout: 180000 });
  await p.waitForTimeout(1500);
  if (mode === 'stills') {
    const views = JSON.parse(process.argv[3]); const out = process.argv[4]; fs.mkdirSync(out, { recursive: true });
    for (const v of views) { await p.evaluate(a => window.renderAt(...a), v.a); await p.screenshot({ path: path.join(out, v.f) }); console.log(v.f); }
  } else {
    const out = process.argv[3]; const N = +process.argv[4]; fs.mkdirSync(out, { recursive: true });
    for (let i = 0; i < N; i++) { if (fs.existsSync(path.join(out, String(i).padStart(4, '0') + '.jpg'))) continue;
      const t = i / (N - 1); const e = 0.5 - 0.5 * Math.cos(Math.PI * t);
      const az = 72 - 52 * e, el = 22 - 12 * e, d = 5200 - 1300 * e;
      await p.evaluate(a => window.renderAt(...a), [az, el, d, 1300, 1250 - 150 * e, 1150]);
      await p.screenshot({ path: path.join(out, String(i).padStart(4, '0') + '.jpg'), type: 'jpeg', quality: 93 });
      if (i % 20 === 0) console.log('frame', i);
    }
  }
  await b.close(); console.log('ok');
})();
