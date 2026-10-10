// Rendu d'une scène HTML en vidéo : node render.cjs <scene> <durée_s> [sortie.mp4]
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path'), fs = require('fs'), { execFileSync } = require('child_process');
const FF = process.env.FF || execFileSync('python3', ['-c', 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())']).toString().trim();
const [scene, dur, outArg] = process.argv.slice(2); const FPS = 30, n = Math.round(+dur * FPS);
const frames = path.join(__dirname, 'frames', scene); fs.rmSync(frames, { recursive: true, force: true }); fs.mkdirSync(frames, { recursive: true });
const out = outArg || path.join(__dirname, 'out', scene + '.mp4'); fs.mkdirSync(path.dirname(out), { recursive: true });
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto('file://' + path.join(__dirname, scene + '.html')); await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(400);
  for (let i = 0; i < n; i++) {
    await p.evaluate(t => window.seek(t), i / FPS);
    await p.screenshot({ path: path.join(frames, String(i).padStart(5, '0') + '.jpg'), type: 'jpeg', quality: 93 });
  }
  await b.close();
  execFileSync(FF, ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(frames, '%05d.jpg'),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', out]);
  fs.rmSync(frames, { recursive: true, force: true }); console.log('ok', out, n, 'images');
})();
