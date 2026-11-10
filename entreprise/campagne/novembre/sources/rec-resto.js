// Tournage « Le Comptoir » (démo restaurant en marque neutre) : téléphone client + écran cuisine,
// deux contextes enregistrés en même temps (CDP screencast), synchronisés comme un vrai site.
const fs = require('fs'), path = require('path'), cp = require('child_process');
const { chromium, w, TEL, PC, contexte, lisse, EXE } = require('./commun');
const WP = '/home/user/Lamaisonduparquet/entreprise/vente/demos/woodpecker/site';
const U = 'http://localhost:8811/';
const O = process.env.REC || path.join(__dirname, '../../../../..', 'rec');
const DBG = process.env.DBG;
const RIPPLE = `(()=>{const st=document.createElement('style');st.textContent='.__tap{position:fixed;z-index:2147483647;width:54px;height:54px;margin:-27px 0 0 -27px;border-radius:50%;background:rgba(255,255,255,.55);border:2px solid rgba(255,255,255,.9);pointer-events:none;animation:__t .5s ease-out forwards}@keyframes __t{0%{transform:scale(.4);opacity:1}100%{transform:scale(1.5);opacity:0}}';
 addEventListener('DOMContentLoaded',()=>document.head.appendChild(st));window.__ripple=(x,y)=>{const d=document.createElement('div');d.className='__tap';d.style.left=x+'px';d.style.top=y+'px';document.body.appendChild(d);setTimeout(()=>d.remove(),600)}})()`;

async function filmer(ctx, page, nom, W_, H_) {
  const dir = path.join(O, 'fr-' + nom); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const cdp = await ctx.newCDPSession(page); const fr = [];
  cdp.on('Page.screencastFrame', f => { fr.push([f.metadata.timestamp, f.data]); cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {}); });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: W_, maxHeight: H_, everyNthFrame: 1 });
  return async (t0) => {
    await cdp.send('Page.stopScreencast'); const tf = Date.now() / 1000;
    let L = 'ffconcat version 1.0\n';
    // la vidéo démarre à t0 (horloge commune) : on répète la 1re image si besoin
    fr.forEach(([t, d], i) => { fs.writeFileSync(dir + '/' + i + '.jpg', Buffer.from(d, 'base64')); const n = i + 1 < fr.length ? fr[i + 1][0] : tf; const debut = i === 0 ? t0 : t; L += `file ${i}.jpg\nduration ${Math.max(0.001, n - debut).toFixed(4)}\n`; });
    L += `file ${fr.length - 1}.jpg\n`; fs.writeFileSync(dir + '/l.txt', L);
    cp.execSync(`ffmpeg -v error -y -f concat -safe 0 -i ${dir}/l.txt -vf "scale=${W_}:${H_}:force_original_aspect_ratio=decrease,pad=${W_}:${H_}:(ow-iw)/2:0:black,fps=30,format=yuv420p" -c:v libx264 -crf 14 -preset fast ${O}/${nom}.mp4`);
    console.log(nom, fr.length, 'images');
  };
}
const tap = async (p, sel, idx = 0) => {
  const ok = await p.evaluate(([s, i]) => { const e = [...document.querySelectorAll(s)].filter(x => x.offsetParent !== null || x.getClientRects().length)[i]; if (!e) return false; const r = e.getBoundingClientRect(); window.__ripple(r.left + r.width / 2, r.top + r.height / 2); return true; }, [sel, idx]);
  if (!ok) { console.log('MANQUE', sel); return; }
  await w(170);
  await p.evaluate(([s, i]) => { const e = [...document.querySelectorAll(s)].filter(x => x.offsetParent !== null || x.getClientRects().length)[i]; e.click(); }, [sel, idx]);
};
const taper = async (p, sel, txt) => { await p.evaluate(s => { const e = document.querySelector(s); e.focus(); e.value = ''; }, sel); for (const c of txt) { await p.evaluate(([s, c]) => { const e = document.querySelector(s); e.value += c; e.dispatchEvent(new Event('input', { bubbles: true })); }, [sel, c]); await w(45 + Math.random() * 35); } await p.evaluate(s => { const e = document.querySelector(s); e.dispatchEvent(new Event('change', { bubbles: true })); e.blur(); }, sel); };

(async () => {
  fs.mkdirSync(O, { recursive: true });
  const b = await chromium.launch({ executablePath: EXE });
  const ct = await contexte(b, TEL, 'woodpecker', WP); await ct.addInitScript(RIPPLE);
  const cg = await contexte(b, PC, 'woodpecker', WP); await cg.addInitScript(RIPPLE);
  // pages relais (même origine) pour synchroniser les commandes entre téléphone et cuisine
  const rt = await ct.newPage(); await rt.goto(U + 'css/commun.css');
  const rg = await cg.newPage(); await rg.goto(U + 'css/commun.css');
  const versCuisine = async () => { const v = await rt.evaluate(() => localStorage.getItem('wpk-commandes')); await rg.evaluate(v => localStorage.setItem('wpk-commandes', v), v); };
  const versClient = async () => { const v = await rg.evaluate(() => localStorage.getItem('wpk-commandes')); await rt.evaluate(v => localStorage.setItem('wpk-commandes', v), v); };

  const t = await ct.newPage(); const g = await cg.newPage();
  for (const p of [t, g]) p.on('pageerror', e => console.log('ERR', e.message));
  await t.goto(U + 'index.html'); await g.goto(U + 'gestion.html');
  await w(1500);
  // cuisine : connexion gérant puis écran Cuisine
  for (const d of '0328') { await g.evaluate(d => { const b = [...document.querySelectorAll('#pave button')].find(x => x.textContent.trim() === d); b && b.click(); }, d); await w(120); }
  await w(800);
  await g.evaluate(() => { const a = [...document.querySelectorAll('.barre-laterale button, .barre-laterale a')].find(x => x.textContent.trim().startsWith('Cuisine')); a && a.click(); });
  await w(800);
  // même état de départ des deux côtés
  await versClient(); await t.reload(); await w(1800);
  if (DBG) { await t.screenshot({ path: O + '/d0.png' }); await g.screenshot({ path: O + '/d0g.png' }); }

  const finT = await filmer(ct, t, 'tel', 780, 1688);
  const finG = await filmer(cg, g, 'cuisine', 2160, 1350);
  const T0 = Date.now() / 1000; const M = {}; const mark = k => { M[k] = +(Date.now() / 1000 - T0).toFixed(2); };
  await w(1200);
  // 1. le client va aux pizzas
  mark('scroll');
  const y = await t.evaluate(() => { const e = document.querySelector('[data-plat="pz19"]').closest('.plat'); return e.getBoundingClientRect().top + scrollY - 240; });
  await lisse(t, y, 1600); await w(500);
  mark('choisir'); await tap(t, '[data-plat="pz19"]'); await w(900);
  if (DBG) await t.screenshot({ path: O + '/d1.png' });
  await tap(t, '#form-options input[name="taille"][value="semi"]'); await w(450);
  await tap(t, '#form-options input[name="taille"][value="mega"]'); await w(500);
  await tap(t, '#form-options [data-qte="1"]'); await w(500);
  if (DBG) await t.screenshot({ path: O + '/d2.png' });
  mark('ajout'); await tap(t, '#opt-valider'); await w(1000);
  // 2. panier → formulaire
  mark('panier'); await tap(t, '#barre-panier-btn'); await w(1000);
  if (DBG) await t.screenshot({ path: O + '/d3.png' });
  await tap(t, '#dlg-panier [data-action="commande"]'); await w(900);
  mark('form');
  await taper(t, '#form-cmd [name="cite"]', 'Résidence Les Jardins, bât. 3'); await w(250);
  await t.evaluate(() => { const c = document.querySelector('#form-cmd [name="nom"]'); c.scrollIntoView({ behavior: 'smooth', block: 'center' }); }); await w(500);
  await taper(t, '#form-cmd [name="nom"]', 'Amine'); await w(200);
  await taper(t, '#form-cmd [name="tel"]', '0555 12 34 56'); await w(400);
  if (DBG) await t.screenshot({ path: O + '/d4.png' });
  mark('valider'); await tap(t, '#dlg-panier [data-action="valider"]'); await w(300);
  // 3. la commande arrive en cuisine
  await versCuisine(); mark('arrivee'); await w(2600);
  if (DBG) { await t.screenshot({ path: O + '/d5.png' }); await g.screenshot({ path: O + '/d5g.png' }); }
  mark('prep'); await tap(g, '.col-recue .ticket-cuisine:last-child [data-vers="preparation"]'); await w(500); await versClient(); await w(2200);
  if (DBG) { await t.screenshot({ path: O + '/d6.png' }); await g.screenshot({ path: O + '/d6g.png' }); }
  mark('prete'); await tap(g, '.col-preparation .ticket-cuisine:last-child [data-vers="prete"]'); await w(500); await versClient(); await w(1600);
  // 4. le livreur part : suivi en direct côté client
  await rg.evaluate(() => { const L = JSON.parse(localStorage.getItem('wpk-commandes')); const c = L[L.length - 1]; c.statut = 'livraison'; c.livreur = 'Livreur 1'; c.hist.livraison = Date.now(); localStorage.setItem('wpk-commandes', JSON.stringify(L)); });
  await versClient(); mark('livraison'); await w(2500);
  if (DBG) { await t.screenshot({ path: O + '/d7.png' }); await g.screenshot({ path: O + '/d7g.png' }); }
  mark('fin');
  await finT(T0); await finG(T0);
  fs.writeFileSync(O + '/marks-resto.json', JSON.stringify(M, null, 1)); console.log(M);
  await b.close();
})();
