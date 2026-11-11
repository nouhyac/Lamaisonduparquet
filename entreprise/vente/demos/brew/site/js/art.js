/* =====================================================================
   BREW — système d'illustrations au trait (style du logo)
   ---------------------------------------------------------------------
   Toutes les illustrations partagent les mêmes règles :
   - trait brun très foncé (#2B201C), 3 px, bouts arrondis ;
   - aplats crème + une couleur d'accent douce par catégorie ;
   - une petite nappe à carreaux sous l'objet (clin d'œil au logo).
   BREW_ART.draw('latte', 'pistache') renvoie un <svg> prêt à insérer.
   ===================================================================== */
(function () {
  'use strict';

  const INK = '#2B201C', CREAM = '#FBF3D9', MILK = '#FFF9EA';
  const GOLD = '#E9B266', GOLD2 = '#F6D9A2', COFFEE = '#8A5A3C', DARK = '#5A3A2B';
  const RED = '#E4606B', GREEN = '#86A85A', YOLK = '#F4B63F';

  /* Palette des accents : fond doux (bg) + couleur pleine (c) */
  const TINTS = {
    passion:  { bg: '#FCDDB0', c: '#F29A3A' },
    fraise:   { bg: '#F9D3D3', c: '#E46F7C' },
    hibiscus: { bg: '#F4CAD3', c: '#B9405F' },
    caramel:  { bg: '#F4DCB8', c: '#C98340' },
    sky:      { bg: '#DCE7EA', c: '#7FA6B4' },
    pistache: { bg: '#E0E8C2', c: '#9DB35C' },
    matcha:   { bg: '#D9E6C6', c: '#7FA35A' },
    cocoa:    { bg: '#E8D5C7', c: '#7A4B36' },
    citrus:   { bg: '#FDE3B8', c: '#F39A2B' },
    lemon:    { bg: '#F8EDB4', c: '#E3C335' },
    vanilla:  { bg: '#F7ECCD', c: '#E9D49B' },
    cheese:   { bg: '#F8E6B0', c: '#F0C04A' }
  };

  /* ---------- Petits éléments réutilisés ---------- */
  const table = () => '<path d="M22 95H98L106 109H14Z" fill="' + CREAM + '"/>' +
    '<path d="M42 95 38 109M60 95V109M78 95 82 109M18 102H102" stroke-width="2"/>';
  const steam = (x, y) => '<path d="M' + x + ' ' + y + 'q-5-6 0-11t0-11" fill="none" stroke-width="2.5"/>';
  const straw = (x1, y1, x2, y2, col) => '<path d="M' + x1 + ' ' + y1 + 'L' + x2 + ' ' + y2 + '" stroke-width="8"/>' +
    '<path d="M' + x1 + ' ' + y1 + 'L' + x2 + ' ' + y2 + '" stroke="' + col + '" stroke-width="3.5"/>';
  const ice = (x, y, r) => '<rect x="' + x + '" y="' + y + '" width="12" height="12" rx="3" fill="' + MILK + '" stroke-width="2" transform="rotate(' + r + ' ' + (x + 6) + ' ' + (y + 6) + ')"/>';
  const heart = (x, y, col) => '<path d="M' + x + ' ' + (y + 6) + 'l-6-5c-3-3 0-8 4-6l2 2 2-2c4-2 7 3 4 6z" fill="' + col + '" stroke-width="2"/>';
  const slice = (x, y, r, col) => '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + col + '"/>' +
    '<circle cx="' + x + '" cy="' + y + '" r="' + (r - 3.5) + '" fill="' + MILK + '" stroke-width="1.5" opacity=".9"/>' +
    '<path d="M' + (x - r + 4) + ' ' + y + 'H' + (x + r - 4) + 'M' + x + ' ' + (y - r + 4) + 'V' + (y + r - 4) + '" stroke="' + col + '" stroke-width="2"/>';
  const berry = (x, y) => '<path d="M' + x + ' ' + (y + 7) + 'c-6-3-7-10-3-12 2-1 3 0 3 0s1-1 3 0c4 2 3 9-3 12z" fill="' + RED + '" stroke-width="2"/>' +
    '<path d="M' + (x - 2) + ' ' + (y - 5) + 'l2 2 2-2" fill="none" stroke="' + GREEN + '" stroke-width="2"/>';
  const banana = (x, y) => '<circle cx="' + x + '" cy="' + y + '" r="5" fill="#FAEAB0" stroke-width="2"/><circle cx="' + x + '" cy="' + y + '" r="1" fill="' + INK + '" stroke="none"/>';
  const scoop = (x, y) => '<path d="M' + (x - 13) + ' ' + y + 'q0-15 13-15t13 15q-3 4-6 1-3 6-7 1-4 4-7 0-3 2-6-2z" fill="' + MILK + '"/>';
  const drizzle = (x, y, w, col) => '<path d="M' + x + ' ' + y + 'q' + w / 8 + ' -6 ' + w / 4 + ' 0t' + w / 4 + ' 0 ' + w / 4 + ' 0 ' + w / 4 + ' 0" fill="none" stroke="' + col + '" stroke-width="2.5"/>';
  const saucer = '<ellipse cx="58" cy="92" rx="32" ry="6" fill="' + CREAM + '"/>';

  /* Tasse classique : surface du café + décor optionnel */
  const cup = (surface, deco, small) => {
    const w = small ? 14 : 22, h = small ? 12 : 18, top = small ? 70 : 60;
    return saucer +
      '<path d="M' + (58 - w) + ' ' + top + 'H' + (58 + w) + 'V' + (top + h) + 'Q' + (58 + w) + ' 90 58 90Q' + (58 - w) + ' 90 ' + (58 - w) + ' ' + (top + h) + 'Z" fill="' + CREAM + '"/>' +
      '<path d="M' + (58 + w) + ' ' + (top + 4) + 'q11 0 11 8.5t-12 8.5" fill="none"/>' +
      '<ellipse cx="58" cy="' + top + '" rx="' + w + '" ry="' + (small ? 3.5 : 5.5) + '" fill="' + surface + '"/>' + (deco || '');
  };

  /* Grand verre (boissons glacées) avec couches de liquide */
  const glass = (layers, extra) => {
    // layers : [[yHaut, couleur], ...] du haut vers le bas
    let s = '<path d="M38 30H82L77 92H43Z" fill="' + MILK + '" stroke="none"/>';
    layers.forEach((l, i) => {
      const y = l[0], x1 = 38 + (y - 30) * 5 / 62, x2 = 82 - (y - 30) * 5 / 62;
      s += '<path d="M' + x1.toFixed(1) + ' ' + y + 'H' + x2.toFixed(1) + 'L77 92H43Z" fill="' + l[1] + '" stroke="none"/>';
      if (i) s += '<path d="M' + (x1 + 2).toFixed(1) + ' ' + y + 'q5-3 10 0t10 0 10 0 9 0" fill="none" stroke-width="1.6" opacity=".55"/>';
    });
    return s + (extra || '') + '<path d="M38 30H82L77 92H43Z" fill="none"/>' +
      '<path d="M44 38V60" stroke="#fff" stroke-width="3" opacity=".7"/>';
  };

  /* Pain toasté (base des toasts) */
  const bread = '<path d="M34 92V62c-7-2-9-8-9-12 0-12 13-16 22-16h26c9 0 22 4 22 16 0 4-2 10-9 12v30z" fill="' + GOLD + '"/>' +
    '<path d="M40 88V60c-6-1-8-5-8-9 0-8 9-11 16-11h24c7 0 16 3 16 11 0 4-2 8-8 9v28z" fill="' + GOLD2 + '" stroke="none"/>';

  /* Brownie en perspective */
  const brownieBlock = '<path d="M30 76L54 66 90 72 66 84Z" fill="' + DARK + '"/>' +
    '<path d="M30 76V90L66 98V84ZM66 84V98L90 86V72Z" fill="#432A1F"/>' +
    '<path d="M44 74l6-2m10 2 5-3m-15 8 6-1" stroke="' + CREAM + '" stroke-width="2" opacity=".6"/>';

  /* Bol (granola, salade) */
  const bowl = (col) => '<path d="M24 66H96Q94 96 60 96Q26 96 24 66Z" fill="' + col + '"/>' +
    '<path d="M30 76q30 6 60 0" fill="none" stroke-width="2" opacity=".4"/>';

  /* Croissant à 5 lobes */
  const croissant = (y) => {
    y = y || 0;
    return '<g transform="translate(0 ' + y + ')">' +
      '<ellipse cx="27" cy="82" rx="7" ry="11" transform="rotate(-62 27 82)" fill="' + GOLD + '"/>' +
      '<ellipse cx="93" cy="82" rx="7" ry="11" transform="rotate(62 93 82)" fill="' + GOLD + '"/>' +
      '<ellipse cx="41" cy="74" rx="11" ry="15" transform="rotate(-38 41 74)" fill="' + GOLD + '"/>' +
      '<ellipse cx="79" cy="74" rx="11" ry="15" transform="rotate(38 79 74)" fill="' + GOLD + '"/>' +
      '<ellipse cx="60" cy="70" rx="14" ry="19" fill="' + GOLD + '"/>' +
      '<path d="M54 60q6-4 12 0M52 72q8-4 16 0M36 70q4-4 9-2M75 68q5-2 9 2" fill="none" stroke-width="2" opacity=".55"/></g>';
  };

  /* ---------- Catalogue des dessins ---------- */
  const ART = {
    cup: (t) => cup(COFFEE, '<path d="M48 63q10 3 20 0" fill="none" stroke="' + GOLD2 + '" stroke-width="2"/>') + steam(50, 46) + steam(66, 46),
    espresso: (t) => cup('#5A3423', '<ellipse cx="58" cy="70" rx="9" ry="2" fill="#B57A4A" stroke="none"/>', true) + steam(58, 58),
    latte: (t) => cup('#C08A5E', heart(58, 54, MILK)) + steam(48, 44) + steam(68, 44),
    matcha: (t) => cup('#8DB060', heart(58, 54, MILK)) + steam(58, 44),
    choco: (t) => '<path d="M38 56H78V86Q78 92 72 92H44Q38 92 38 86Z" fill="' + CREAM + '"/>' +
      '<path d="M78 62q12 0 12 10t-12 10" fill="none"/>' +
      '<path d="M36 57q2-11 11-9 3-9 12-5 7-7 13 1 9-1 9 10z" fill="' + MILK + '"/>' +
      drizzle(44, 50, 28, (TINTS[t] || TINTS.cocoa).c) + heart(58, 70, (TINTS[t] || TINTS.cocoa).c),
    iced: (t) => {
      const c = t === 'cocoa' ? '#6B3F2C' : '#A26B45';
      return glass([[44, MILK], [62, c]], ice(44, 36, -14) + ice(60, 40, 10)) + straw(70, 14, 64, 58, (TINTS[t] || TINTS.sky).c);
    },
    coldbrew: (t) => glass([[42, '#4B2E20']], ice(46, 38, -10) + ice(62, 44, 16)) + straw(68, 14, 63, 56, TINTS.sky.c),
    icedmatcha: (t) => {
      const lay = t === 'fraise' ? [[40, '#9CBB66'], [58, MILK], [76, '#E9868F']] : [[40, '#9CBB66'], [62, MILK]];
      return glass(lay, ice(46, 34, -12)) + straw(70, 14, 64, 56, TINTS.matcha.c);
    },
    sparkle: (t) => {
      const c = (TINTS[t] || TINTS.passion).c;
      let b = '';
      [[50, 58], [64, 66], [56, 76], [68, 82], [52, 86]].forEach(p => { b += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="2.4" fill="' + MILK + '" stroke-width="1.5"/>'; });
      return glass([[40, c]], b + ice(46, 32, -10)) + slice(82, 32, 11, t === 'fraise' ? RED : t === 'hibiscus' ? '#E8A33B' : '#F4C542') + straw(66, 12, 61, 50, CREAM);
    },
    juice: (t) => glass([[40, '#F6A23A']], '') + slice(82, 32, 11, '#F39A2B') + straw(66, 12, 61, 50, CREAM),
    lemonade: (t) => glass([[40, '#F6E79A']], ice(46, 44, -10) + ice(60, 56, 14) +
      '<path d="M52 36q6-10 14-6-4 9-14 6z" fill="' + GREEN + '" stroke-width="2"/>') + slice(82, 32, 11, '#E3C335') + straw(68, 12, 62, 50, CREAM),
    shake: (t) => {
      const c = (TINTS[t] || TINTS.vanilla).c;
      return '<path d="M40 46H80L72 84H48Z" fill="' + c + '"/>' +
        '<path d="M48 84H72M55 84V91M65 84V91M46 93H74" fill="none"/>' +
        straw(70, 12, 64, 40, RED) +
        '<path d="M37 48q1-12 11-10 3-10 13-6 9-7 14 3 10 1 8 13z" fill="' + MILK + '"/>' +
        '<path d="M48 40l3 2m9-6 1 3m8 1 3-2m-20 7 2-2" stroke="' + RED + '" stroke-width="2.4"/>' +
        (t === 'sky' ? '<circle cx="76" cy="40" r="7" fill="#2E2A2A"/><path d="M72 40h8" stroke="' + MILK + '" stroke-width="1.5"/>' : '') +
        '<path d="M50 52v26" stroke="#fff" stroke-width="3" opacity=".6"/>';
    },
    frappe: (t) => '<path d="M42 52H78L73 94H47Z" fill="#C98F5E"/>' +
      '<path d="M44 66q8-4 16 0t16 0" fill="none" stroke-width="1.8" opacity=".5"/>' +
      straw(64, 10, 61, 40, CREAM) +
      '<path d="M40 52Q60 22 80 52Z" fill="' + MILK + '"/>' + drizzle(47, 44, 26, '#B8692F') +
      '<path d="M37 52H83" stroke-width="4"/>',
    teapot: (t) => '<path d="M38 72q0-24 22-24t22 24q0 18-22 18t-22-18z" fill="' + CREAM + '"/>' +
      '<path d="M39 70q-12-1-15-16l6-1q3 9 10 10" fill="' + CREAM + '"/>' +
      '<path d="M82 60q12 0 12 11t-13 11" fill="none"/>' +
      '<path d="M48 49q12-10 24 0z" fill="' + CREAM + '"/><circle cx="60" cy="41" r="3.5" fill="' + CREAM + '"/>' +
      '<path d="M52 72q8-12 16 0-8 6-16 0zM60 66v12" fill="' + GREEN + '" stroke-width="2"/>' + steam(30, 46) + table(),
    teacup: (t) => cup('#D99A3E', slice(70, 54, 7, '#E3C335')) + steam(52, 44),
    toast: (t) => bread + '<path d="M40 54h40v10c-3 6-6-2-9 4s-6-3-9 3-6-4-9 1-6-2-8 2-5-4-5-4z" fill="' + YOLK + '" stroke-width="2.4"/>' +
      '<circle cx="50" cy="74" r="6" fill="' + RED + '" stroke-width="2"/><circle cx="68" cy="76" r="6" fill="' + RED + '" stroke-width="2"/>' +
      '<path d="M54 84q6-4 12 0" fill="none" stroke="#9B5C9C" stroke-width="2.4"/>' + table(),
    eggtoast: (t) => bread + '<path d="M40 70q-4-10 6-12 2-8 12-6 6-6 14 0 10 0 8 10 6 6-2 12-6 6-14 2-8 4-16-2-8-2-4-8z" fill="#F8D25E" stroke-width="2.4"/>' +
      '<path d="M48 64l3-3m10 9 3-3m6-7 2 3m-20 11 3 1" stroke="' + GREEN + '" stroke-width="2.4"/>' + table(),
    avotoast: (t) => bread + '<path d="M40 70q2-16 20-16t20 16q-8 8-20 8t-20-8z" fill="#A8C46E" stroke-width="2.4"/>' +
      '<path d="M46 66q4-6 10-6M58 64q4-6 10-5" fill="none" stroke-width="1.8"/>' +
      '<path d="M54 76q-1-10 8-11 9 1 8 10-2 7-8 7-7 0-8-6z" fill="' + MILK + '" stroke-width="2.4"/><circle cx="62" cy="73" r="4" fill="' + YOLK + '" stroke-width="2"/>' +
      '<circle cx="44" cy="80" r="4" fill="' + RED + '" stroke-width="2"/><path d="M76 78h1m-4 4h1m-28-24h1" stroke-width="3"/>' + table(),
    pbtoast: (t) => bread + '<path d="M40 58h40v20q-20 6-40 0z" fill="#B97A43" stroke-width="2.4"/>' +
      banana(48, 64) + banana(60, 70) + banana(72, 64) + banana(54, 80) + banana(68, 80) + table(),
    brioche: (t) => '<path d="M32 62q0-26 28-26t28 26z" fill="' + GOLD + '"/>' +
      '<path d="M46 48l2-1m10-4 2 1m8 3 2 1m-18 5 2-1" stroke="' + MILK + '" stroke-width="2.4"/>' +
      '<path d="M30 64q5-5 10 0t10 0 10 0 10 0 10 0 10 0v4H30z" fill="' + GREEN + '" stroke-width="2.4"/>' +
      '<path d="M34 68h52l-6 8-6-3-6 4-6-3-6 4-6-3-6 3z" fill="#F0B33C" stroke-width="2.4"/>' +
      '<path d="M32 74q2-4 6-2 4-4 8 0 4-4 8 0 4-4 8 0 4-4 8 0 4-4 8 0 6-2 6 3l-2 7H34z" fill="#B66B34" stroke-width="2.4"/>' +
      '<path d="M34 82h52q0 12-12 12H46q-12 0-12-12z" fill="' + GOLD + '"/>' + table(),
    plate: (t) => '<ellipse cx="60" cy="74" rx="44" ry="22" fill="' + CREAM + '"/><ellipse cx="60" cy="74" rx="34" ry="15" fill="none" stroke-width="2" opacity=".35"/>' +
      '<path d="M32 70q-2-10 9-10 4-6 12 0 7 3 2 10-5 6-14 4-8-1-9-4z" fill="' + MILK + '" stroke-width="2.4"/><circle cx="42" cy="68" r="4.5" fill="' + YOLK + '" stroke-width="2"/>' +
      '<rect x="58" y="60" width="26" height="8" rx="4" fill="#A9583A" stroke-width="2.4"/><rect x="60" y="70" width="24" height="8" rx="4" fill="#A9583A" stroke-width="2.4"/>' +
      '<rect x="40" y="78" width="8" height="8" rx="2" fill="' + YOLK + '" stroke-width="2"/><rect x="50" y="80" width="8" height="8" rx="2" fill="' + YOLK + '" stroke-width="2"/>' +
      '<path d="M66 82q4-8 14-6-2 9-14 6z" fill="' + GREEN + '" stroke-width="2"/>' +
      '<path d="M84 76l12-8 4 12z" fill="' + GOLD + '" stroke-width="2.4"/>',
    burrata: (t) => '<ellipse cx="60" cy="76" rx="44" ry="20" fill="' + CREAM + '"/>' +
      '<path d="M30 76q6-10 16-6M74 82q10-2 16-10M34 82q8 2 14-2" fill="none" stroke="' + GREEN + '" stroke-width="4"/>' +
      '<circle cx="60" cy="68" r="15" fill="' + MILK + '"/><path d="M52 62q4-5 10-4" fill="none" stroke-width="2"/>' +
      '<path d="M44 82q16 6 30-2" fill="none" stroke="#5F8A3A" stroke-width="3" stroke-dasharray="1 5"/>' +
      '<circle cx="82" cy="70" r="6" fill="' + RED + '" stroke-width="2.4"/><circle cx="40" cy="70" r="6" fill="' + RED + '" stroke-width="2.4"/><circle cx="72" cy="86" r="5" fill="' + RED + '" stroke-width="2.4"/>',
    bowl: (t) => '<path d="M36 64q-4-14 8-14 2-10 12-4 6-8 14 0 12-4 12 10" fill="' + GREEN + '" stroke-width="2.4"/>' +
      '<path d="M44 64l10-10 6 4 8-8" fill="none" stroke-width="2"/>' +
      '<rect x="50" y="56" width="18" height="7" rx="3" fill="#C97D45" stroke-width="2.2" transform="rotate(-10 59 60)"/>' +
      '<rect x="40" y="58" width="7" height="7" rx="1.5" fill="' + GOLD + '" stroke-width="2"/><rect x="72" y="57" width="7" height="7" rx="1.5" fill="' + GOLD + '" stroke-width="2"/>' +
      bowl(MILK) + '<path d="M40 82l4 2m30-2 4-2" stroke="' + (TINTS[t] || TINTS.matcha).c + '" stroke-width="3"/>' + table(),
    club: (t) => {
      const layer = (y, col) => '<path d="M28 ' + y + 'H92" stroke="' + col + '" stroke-width="6"/>';
      return '<path d="M28 88L60 34 92 88Z" fill="' + GOLD2 + '"/>' +
        '<path d="M37 72H83" stroke="' + GREEN + '" stroke-width="5"/><path d="M33 80H87" stroke="#E7A04B" stroke-width="5"/>' +
        '<path d="M41 64H79" stroke="' + RED + '" stroke-width="4"/><path d="M45 57H75" stroke="#F0C04A" stroke-width="4"/>' +
        '<path d="M28 88L60 34 92 88Z" fill="none"/><path d="M60 34V18" stroke-width="2.5"/><circle cx="60" cy="16" r="3" fill="' + RED + '" stroke-width="2"/>' + table();
    },
    croissant: (t) => {
      let top = '';
      if (t === 'caramel') top = drizzle(38, 66, 44, '#B8692F') + banana(50, 60) + banana(70, 60);
      else if (t === 'pistache') top = '<path d="M44 62q16-8 32 0" fill="none" stroke="#9DB35C" stroke-width="6"/>' + berry(52, 56) + berry(68, 56);
      else if (t === 'cheese') top = '<path d="M44 60q6-8 16-6 10-2 16 6-4 6-6 2-4 6-8 1-5 5-8 0-4 4-10-3z" fill="#F4C54A" stroke-width="2.4"/>';
      return croissant(4) + top + table();
    },
    brownie: (t) => brownieBlock + (t === 'fraise' ? berry(50, 66) + banana(66, 68) + drizzle(42, 72, 32, '#3A231A') : '') + table(),
    brownieice: (t) => brownieBlock + scoop(60, 70) + drizzle(48, 64, 24, t === 'caramel' ? '#B8692F' : '#3A231A') +
      (t === 'caramel' ? '<path d="M44 74h5m22 0h5" stroke="' + GOLD + '" stroke-width="3"/>' : '<path d="M46 74h2m24-1h2" stroke="' + GOLD + '" stroke-width="3"/>') + table(),
    frenchtoast: (t) => '<path d="M28 78q0-8 8-8h48q8 0 8 8v8q0 6-6 6H34q-6 0-6-6z" fill="' + GOLD + '"/>' +
      '<path d="M32 64q0-8 8-8h40q8 0 8 8v6q0 4-4 4H36q-4 0-4-4z" fill="#EFC07A"/>' +
      drizzle(38, 62, 44, '#5A3423') + berry(48, 52) + berry(70, 52) + '<circle cx="60" cy="52" r="4" fill="#5B5BA0" stroke-width="2"/>' + table(),
    granola: (t) => {
      let top = '<ellipse cx="60" cy="66" rx="36" ry="7" fill="' + MILK + '"/>' +
        '<path d="M40 64l3 2m6-4 2 3m26-3 3 2m4 2 2-2" stroke="#B5793D" stroke-width="4"/>';
      if (t === 'caramel') top += banana(52, 62) + banana(64, 63) + '<path d="M70 60q6 4 12 0" fill="none" stroke="#B97A43" stroke-width="3"/>';
      else if (t === 'fraise') top += berry(52, 58) + berry(66, 58) + '<circle cx="78" cy="62" r="3.5" fill="#5B5BA0" stroke-width="2"/>';
      else top += '<rect x="46" y="58" width="8" height="8" rx="2" fill="#F5B53D" stroke-width="2"/><rect x="58" y="57" width="8" height="8" rx="2" fill="#F5B53D" stroke-width="2"/>' +
        '<path d="M70 64q0-8 8-8t8 8z" fill="#E7C64A" stroke-width="2"/><path d="M74 62h1m3-2h1" stroke-width="2.5"/>';
      return bowl(CREAM) + top + table();
    },
    turkish: (t) => '<ellipse cx="60" cy="76" rx="44" ry="20" fill="' + CREAM + '"/>' +
      '<ellipse cx="56" cy="74" rx="28" ry="12" fill="' + MILK + '" stroke-width="2"/>' +
      '<path d="M50 72q-1-8 7-8 8 0 7 8-1 6-7 6-6 0-7-6z" fill="' + MILK + '" stroke-width="2.4"/><circle cx="57" cy="71" r="3.5" fill="' + YOLK + '" stroke-width="2"/>' +
      '<path d="M34 76q10 6 16 2m14 2q8 2 14-4" fill="none" stroke="#D2552F" stroke-width="3"/>' +
      '<path d="M84 68l14 4-4 12-14-4z" fill="' + GOLD + '" stroke-width="2.4"/>',
    cookie: (t) => '<circle cx="60" cy="72" r="24" fill="' + GOLD + '"/>' +
      '<path d="M50 62l3 2m10-6 2 3m6 8-2 3m-22 6 3 1m12 6 2-2m8-6 3 1" stroke="#3A231A" stroke-width="5"/>' +
      '<path d="M42 92l2 1m32-2 2 1" stroke-width="2.5"/>' + table(),
    cheesecake: (t) => '<path d="M28 70L82 58 92 68 38 82Z" fill="' + RED + '"/>' +
      '<path d="M38 82V90L92 76V68ZM28 70V78L38 90V82Z" fill="#FFF3D2"/>' +
      '<path d="M28 78L38 90 92 76" fill="none" stroke="#B5793D" stroke-width="5"/>' + berry(76, 56) + table(),
    tiramisu: (t) => '<path d="M30 66L60 56 90 66 60 76Z" fill="#7A4B36"/>' +
      '<path d="M30 66V86L60 96V76ZM60 76V96L90 86V66Z" fill="' + MILK + '"/>' +
      '<path d="M30 76L60 86 90 76" fill="none" stroke="#9A6440" stroke-width="5"/>' +
      '<path d="M44 63h1m8 3h1m10-6h1m6 6h1" stroke="' + CREAM + '" stroke-width="2.5"/>',
    cinnamon: (t) => '<ellipse cx="60" cy="74" rx="30" ry="22" fill="' + GOLD + '"/>' +
      '<path d="M60 74c2-3 6-1 5 2-1 5-9 5-10-1-1-7 8-11 15-7 8 5 6 17-4 19-12 2-21-7-18-17 3-11 18-16 28-9" fill="none" stroke="#9A5B2E" stroke-width="3.5"/>' +
      '<path d="M36 64q6-6 12-2l-2 6m30-6q6-2 8 6" fill="none" stroke="' + MILK + '" stroke-width="3.5"/>' + table()
  };

  /* Rendu final : fond rond coloré + dessin */
  function draw(kind, tint, opts) {
    const t = TINTS[tint] || TINTS.caramel;
    const body = (ART[kind] || ART.cup)(tint);
    const bg = opts && opts.nobg ? '' : '<circle cx="60" cy="62" r="54" fill="' + t.bg + '"/>' +
      '<path d="M20 40l3-3m74 4 3 2m-6-22 2-3" stroke="' + INK + '" stroke-width="2.5" stroke-linecap="round" opacity=".35"/>';
    return '<svg class="art" viewBox="0 0 120 120" aria-hidden="true" focusable="false">' + bg +
      '<g stroke="' + INK + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">' + body + '</g></svg>';
  }

  /* ---------- Logo BREW recréé en SVG ----------
     Personnage aux cheveux bouclés, yeux fermés, tasse fumante,
     nappe à carreaux (effet « sticker » avec liseré crème)
     + lettrage BREW épais et arrondi. */
  const SHAPES = {
    body: 'M30 122C28 92 46 72 80 72S132 92 130 122Z',
    hair: 'M57 47c-6-2-6-10 0-12-2-7 5-12 11-8 2-7 11-8 14-2 5-4 13-1 12 6 7 0 9 8 4 12 5 4 1 10-3 9',
    cloth: 'M22 120H138L145 136H15Z'
  };
  const figure = (ink, cream) => {
    const head = '<circle cx="80" cy="47" r="22"/>';
    return '<g stroke-linecap="round" stroke-linejoin="round">' +
      // 1) liseré crème (sticker) qui détache le dessin du fond brun
      '<g fill="' + cream + '" stroke="' + cream + '" stroke-width="12">' +
      '<path d="' + SHAPES.body + '"/>' + head + '<path d="' + SHAPES.hair + '"/><path d="' + SHAPES.cloth + '"/></g>' +
      // 2) dessin au trait
      '<g stroke="' + ink + '" stroke-width="3" fill="' + cream + '">' +
      '<path d="' + SHAPES.body + '"/>' + head + '<path d="' + SHAPES.hair + '"/>' +
      '<path d="M63 36c2-3 6-2 6 1m5-6c2-3 6-2 6 1m5 2c2-3 6-2 6 1" fill="none" stroke-width="2.2"/>' +
      '<path d="M68 51q4 3 8 0M84 51q4 3 8 0M76 59q4 3 8 0" fill="none" stroke-width="2.4"/>' +
      '<path d="M40 114C44 98 54 92 68 93M120 114C116 98 106 92 92 93" fill="none"/>' +
      '<path d="M70 84H90V101Q90 107 84 107H76Q70 107 70 101Z" fill="' + ink + '"/>' +
      '<path d="M74 88H86" stroke="' + cream + '" stroke-width="1.8"/>' +
      '<path d="M76 80q-3-4 0-7t0-7M84 80q-3-4 0-7t0-7" fill="none" stroke-width="2.2"/>' +
      '<path d="M64 96q0-6 7-6 3 0 3 5t-5 7q-5 0-5-6zM96 96q0-6-7-6-3 0-3 5t5 7q5 0 5-6z"/>' +
      '<path d="' + SHAPES.cloth + '"/>' +
      '<path d="M18 128H142M36 120 34 136M52 120 51 136M68 120V136M84 120 85 136M100 120 102 136M116 120 119 136M130 120 134 136" fill="none" stroke-width="2"/>' +
      '</g></g>';
  };

  /* Lettrage « BReW » : traits très épais à bouts ronds, larges et bas comme le logo */
  const letters = (col) => {
    const hole = col === CREAM ? INK : CREAM;
    return '<g fill="none" stroke="' + col + '" stroke-width="18" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M14 12V52M14 12H36Q48 12 48 22T36 32H15M15 32H38Q50 32 50 42T38 52H14"/>' +
      '<path d="M68 12V52M68 12H90Q102 12 102 22T90 32H69M86 33 102 52"/>' +
      '<path d="M120 34H156Q156 15 138 15T120 34 138 53Q150 53 156 46"/>' +
      '<path d="M174 12 182 52 204 27 226 52 234 12"/></g>' +
      '<g fill="' + hole + '"><rect x="23" y="19" width="12" height="6" rx="3"/><rect x="23" y="39" width="14" height="6" rx="3"/>' +
      '<rect x="77" y="19" width="12" height="6" rx="3"/><rect x="130" y="25" width="16" height="5" rx="2.5"/></g>';
  };

  function logo(opts) {
    opts = opts || {};
    const ink = INK, cream = CREAM;
    const label = 'BREW Coffee & Brunch';
    if (opts.mark) {
      // version compacte : disque brun + personnage (favicon, en-tête)
      return '<svg class="brew-mark" viewBox="0 0 160 160" role="img" aria-label="' + label + '"><circle cx="80" cy="80" r="80" fill="' + ink + '"/>' +
        '<g transform="translate(17 12) scale(.79)">' + figure(ink, cream) + '</g></svg>';
    }
    if (opts.word) {
      return '<svg class="brew-word" viewBox="0 0 250 64" role="img" aria-label="BREW">' + letters(opts.color || cream) + '</svg>';
    }
    // badge complet (comme le logo officiel)
    return '<svg class="brew-badge" viewBox="0 0 320 320" role="img" aria-label="' + label + '"><circle cx="160" cy="160" r="160" fill="' + ink + '"/>' +
      '<g transform="translate(108 70) scale(.65)">' + figure(ink, cream) + '</g>' +
      '<g transform="translate(66 178) scale(.75)">' + letters(cream) + '</g></svg>';
  }

  window.BREW_ART = { draw, logo, TINTS, kinds: Object.keys(ART) };
})();
