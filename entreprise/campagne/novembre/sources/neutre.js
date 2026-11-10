// Marque neutre à la volée : les démos prospects (sans accord) sont filmées sous un nom fictif,
// sans logo, sans lieu, sans téléphone, sans Instagram, sans bandeau « Démo réalisée par… ».
const fs = require('fs');
const D = __dirname;
const TEL = [[/(\b0[5-7]\d{2}) ?\d{2} ?\d{2} ?\d{2}\b/g, '0555 12 34 56'], [/213[5-7]\d{8}/g, '213555123456'], [/tel:0\d{9}/g, 'tel:0555123456']];
const LIEUX = [[/Alg[ée]rie|Algeria/g, ''], [/\bAlger\b/g, ''], [/\bOran\b/g, ''], [/وهران/g, ''], [/الجزائر العاصمة/g, ''], [/الجزائر/g, '']];

const MONO_LC = `function logoSVG(taille,titre){const t=taille||48;return '<svg class="logo-svg" width="'+t+'" height="'+t+'" viewBox="0 0 120 120" role="img" aria-label="Le Comptoir"><circle cx="60" cy="60" r="57" fill="#14120f" stroke="#e9c478" stroke-width="3"/><text x="60" y="73" font-family="Georgia,serif" font-weight="700" font-size="40" fill="#e9c478" text-anchor="middle">LC</text></svg>'}
  function _ancienLogo(taille, titre) {`;
const MONO_MC = `function logo(opts){opts=opts||{};if(opts.word)return '<svg class="brew-word" viewBox="0 0 250 64" role="img" aria-label="Maison Café"><text x="125" y="46" font-family="Georgia,serif" font-weight="700" font-size="40" fill="'+(opts.color||'#F5ECDC')+'" text-anchor="middle">Maison Café</text></svg>';
    const s=opts.mark?160:320;return '<svg class="'+(opts.mark?'brew-mark':'brew-badge')+'" viewBox="0 0 '+s+' '+s+'" role="img" aria-label="Maison Café"><circle cx="'+s/2+'" cy="'+s/2+'" r="'+s/2+'" fill="#2B201C"/><circle cx="'+s/2+'" cy="'+s/2+'" r="'+s*.44+'" fill="none" stroke="#F5ECDC" stroke-width="'+s*.012+'"/><text x="'+s/2+'" y="'+s*.62+'" font-family="Georgia,serif" font-weight="700" font-size="'+s*.34+'" fill="#F5ECDC" text-anchor="middle">MC</text></svg>'}
  function _ancienLogo(opts) {`;

const R = {
  woodpecker: [
    [/Démo réalisée par Dzign Studio pour Wood Pecker Draria/g, ''],
    [/نسخة تجريبية من إنجاز Dzign Studio لمطعم وود بيكر الدرارية/g, ''],
    ['<span class="ligne1">Wood</span>', '<span class="ligne1">Le</span>'],
    ['<span class="ligne2">Pecker</span>', '<span class="ligne2">Comptoir</span>'],
    ["'draria': ['Draria', 'الدرارية']", "'draria': ['Restaurant', 'مطعم']"],
    ['data-t="draria">Draria<', 'data-t="draria">Restaurant<'],
    ['Wood Pecker <small>Draria</small>', 'Le Comptoir <small>Restaurant</small>'],
    [/Draria, Alger/g, 'Centre-ville'],
    [/Wood ?Pecker Draria/gi, 'Le Comptoir'], [/WOOD ?PECKER/g, 'LE COMPTOIR'], [/Wood Pecker/g, 'Le Comptoir'], [/WoodPecker/g, 'Comptoir'],
    [/Surprise Wood/g, 'Surprise du chef'], [/'WP-'/g, "'LC-'"], [/WP-(\d)/g, 'LC-$1'], [/سوربريز وود/g, 'مفاجأة الشيف'], [/وود بيكر/g, 'لو كونتوار'], [/الدرارية/g, ''],
    [/woodpecker\.draria/g, 'lecomptoir'], [/WoodPecker%20Draria/g, 'lecomptoir'], [/https:\/\/maps\.app\.goo\.gl\/\w+/g, '#'],
    [/Baba Hassen/g, 'Quartier Nord'], [/Saoula/g, 'Quartier Sud'], [/Douera/g, 'Les Jardins'], [/Khraicia/g, 'Les Oliviers'],
    [/El Achour/g, 'Quartier Est'], [/Ouled Fayet/g, 'Quartier Ouest'], [/Dely Ibrahim/g, 'Les Pins'], [/Chéraga/g, 'La Gare'],
    [/Ben Aknoun/g, 'Le Parc'], [/Birkhadem/g, 'Les Vergers'], [/Hydra/g, 'Les Hauteurs'], [/Draria/g, 'Centre-ville'],
    ['function logoSVG(taille, titre) {', MONO_LC],
    ...LIEUX, ...TEL,
  ],
  brew: [
    [/Démo réalisée par Dzign Studio pour BREW/g, ''], [/نسخة تجريبية من إنجاز Dzign Studio لـ BREW/g, ''],
    [/BREW Signature Drinks/g, 'Signatures de la maison'], [/مشروبات BREW المميّزة/g, 'مشروبات البيت المميّزة'],
    [/@?brew\.coffee\.brunch/g, 'maisoncafe'], [/'Brew /g, "'Maison "], [/Brew (Passion|Strawberry|Red|Scrambled|Breakfast)/g, 'Maison $1'],
    [/BREW(?![_A-Za-z])/g, 'Maison Café'],
    ['function logo(opts) {', MONO_MC],
    ...LIEUX, ...TEL,
  ],
  dzign: [...LIEUX, [/\.dz\b/g, '.com']],
};
// images remplacées
const IMG = {
  woodpecker: { 'logo-wp.png': 'logo-comptoir.png', 'facade.jpg': '@pizza-garnie.jpg', 'enseigne.jpg': '@pizza-garnie.jpg', 'etal-poissons.jpg': '@pizza-garnie.jpg', 'plat-du-jour-tableau.jpg': '@pizza-garnie.jpg' },
  brew: { 'logo.png': 'logo-maisoncafe.png', 'sac-brew-recadre.jpg': 'photo-maisoncafe.jpg', 'sac-brew.jpg': 'photo-maisoncafe.jpg', 'favicon.svg': null },
};
const CSS = {
  woodpecker: '.bandeau-demo,.pied-demo{display:none!important}',
  brew: '.demo-bar{display:none!important}',
  dzign: '',
};
function appliquer(t, site) { for (const [a, b] of R[site]) t = typeof a === 'string' ? t.split(a).join(b) : t.replace(a, b); return t; }
async function neutre(ctx, site, racine) {
  for (const [nom, rep] of Object.entries(IMG[site] || {})) {
    await ctx.route('**/img/' + nom, r => {
      if (rep === null) return r.fulfill({ body: '<svg xmlns="http://www.w3.org/2000/svg"/>', headers: { 'content-type': 'image/svg+xml' } });
      const f = rep[0] === '@' ? racine + '/img/' + rep.slice(1) : D + '/' + rep;
      r.fulfill({ body: fs.readFileSync(f), headers: { 'content-type': f.endsWith('.png') ? 'image/png' : 'image/jpeg' } });
    });
  }
  await ctx.route(/\.(html|js|css)(\?.*)?$|\/$/, async r => {
    const u = r.request().url(); if (!u.startsWith('http://localhost')) return r.continue();
    const res = await r.fetch(); let t = await res.text();
    t = appliquer(t, site);
    const ct = u.match(/\.js(\?|$)/) ? 'application/javascript' : u.match(/\.css(\?|$)/) ? 'text/css' : 'text/html; charset=utf-8';
    if (ct.startsWith('text/html') && CSS[site]) t = t.replace('</head>', '<style>' + CSS[site] + '</style></head>');
    await r.fulfill({ response: res, body: t, headers: { ...res.headers(), 'content-type': ct } });
  });
}
module.exports = { neutre, appliquer };
