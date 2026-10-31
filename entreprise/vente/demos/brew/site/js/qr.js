/* =====================================================================
   BREW — générateur de QR codes en local (aucun service externe)
   ---------------------------------------------------------------------
   Mode octet (UTF-8), correction d'erreur niveau M, versions 1 à 10
   (jusqu'à ~210 caractères : largement assez pour l'URL d'une table).
   Algorithme standard ISO/IEC 18004. BREW_QR.svg(texte) → <svg>.
   ===================================================================== */
(function () {
  'use strict';
  // Niveau M : codes de correction par bloc et nombre de blocs (versions 1 → 10)
  const ECC_PER_BLOCK = [0, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26];
  const NUM_BLOCKS = [0, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5];

  function rawModules(ver) {
    let r = (16 * ver + 128) * ver + 64;
    if (ver >= 2) { const n = Math.floor(ver / 7) + 2; r -= (25 * n - 10) * n - 55; if (ver >= 7) r -= 36; }
    return r;
  }
  const dataCodewords = (ver) => Math.floor(rawModules(ver) / 8) - ECC_PER_BLOCK[ver] * NUM_BLOCKS[ver];

  /* Arithmétique dans GF(256) + Reed-Solomon */
  function mul(x, y) { let z = 0; for (let i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11D); z ^= ((y >>> i) & 1) * x; } return z; }
  function rsDivisor(deg) {
    const r = new Array(deg).fill(0); r[deg - 1] = 1; let root = 1;
    for (let i = 0; i < deg; i++) { for (let j = 0; j < deg; j++) { r[j] = mul(r[j], root); if (j + 1 < deg) r[j] ^= r[j + 1]; } root = mul(root, 2); }
    return r;
  }
  function rsRemainder(data, div) {
    const r = div.map(() => 0);
    data.forEach(b => { const f = b ^ r.shift(); r.push(0); div.forEach((c, i) => { r[i] ^= mul(c, f); }); });
    return r;
  }

  function encode(text) {
    const bytes = Array.from(new TextEncoder().encode(text));
    let ver = 1;
    for (; ver <= 10; ver++) if (4 + (ver < 10 ? 8 : 16) + bytes.length * 8 <= dataCodewords(ver) * 8) break;
    if (ver > 10) throw new Error('Texte trop long pour le QR code');
    // flux de bits : mode octet, longueur, données, terminaison, bourrage
    const bits = [];
    const push = (v, n) => { for (let i = n - 1; i >= 0; i--) bits.push((v >>> i) & 1); };
    push(4, 4); push(bytes.length, ver < 10 ? 8 : 16); bytes.forEach(b => push(b, 8));
    const cap = dataCodewords(ver) * 8;
    push(0, Math.min(4, cap - bits.length));
    push(0, (8 - bits.length % 8) % 8);
    for (let p = 0xEC; bits.length < cap; p ^= 0xEC ^ 0x11) push(p, 8);
    const data = [];
    for (let i = 0; i < bits.length; i += 8) data.push(parseInt(bits.slice(i, i + 8).join(''), 2));

    // blocs + correction d'erreur, puis entrelacement
    const nb = NUM_BLOCKS[ver], ecl = ECC_PER_BLOCK[ver], raw = Math.floor(rawModules(ver) / 8);
    const nShort = nb - raw % nb, shortLen = Math.floor(raw / nb), div = rsDivisor(ecl);
    const blocks = []; let k = 0;
    for (let i = 0; i < nb; i++) {
      const dat = data.slice(k, k + shortLen - ecl + (i < nShort ? 0 : 1)); k += dat.length;
      const ecc = rsRemainder(dat, div);
      if (i < nShort) dat.push(0);
      blocks.push(dat.concat(ecc));
    }
    const all = [];
    for (let i = 0; i < blocks[0].length; i++) blocks.forEach((b, j) => { if (i !== shortLen - ecl || j >= nShort) all.push(b[i]); });

    // matrice + motifs fixes
    const size = ver * 4 + 17;
    const mod = Array.from({ length: size }, () => new Array(size).fill(false));
    const fn = Array.from({ length: size }, () => new Array(size).fill(false));
    const setF = (x, y, d) => { mod[y][x] = d; fn[y][x] = true; };
    for (let i = 0; i < size; i++) { setF(6, i, i % 2 === 0); setF(i, 6, i % 2 === 0); }
    [[3, 3], [size - 4, 3], [3, size - 4]].forEach(([cx, cy]) => {
      for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
        const x = cx + dx, y = cy + dy, d = Math.max(Math.abs(dx), Math.abs(dy));
        if (x >= 0 && x < size && y >= 0 && y < size) setF(x, y, d !== 2 && d !== 4);
      }
    });
    if (ver > 1) {
      const n = Math.floor(ver / 7) + 2, step = Math.ceil((ver * 4 + 4) / (n * 2 - 2)) * 2, pos = [6];
      for (let p = size - 7; pos.length < n; p -= step) pos.splice(1, 0, p);
      pos.forEach((x, i) => pos.forEach((y, j) => {
        if ((i === 0 && j === 0) || (i === 0 && j === n - 1) || (i === n - 1 && j === 0)) return;
        for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) setF(x + dx, y + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
      }));
    }
    const drawFormat = (mask) => {
      const d = (0 << 3) | mask; let r = d;          // niveau M = 00
      for (let i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537);
      const b = ((d << 10) | r) ^ 0x5412, bit = (i) => ((b >>> i) & 1) === 1;
      for (let i = 0; i <= 5; i++) setF(8, i, bit(i));
      setF(8, 7, bit(6)); setF(8, 8, bit(7)); setF(7, 8, bit(8));
      for (let i = 9; i < 15; i++) setF(14 - i, 8, bit(i));
      for (let i = 0; i < 8; i++) setF(size - 1 - i, 8, bit(i));
      for (let i = 8; i < 15; i++) setF(8, size - 15 + i, bit(i));
      setF(8, size - 8, true);
    };
    drawFormat(0);
    if (ver >= 7) {
      let r = ver; for (let i = 0; i < 12; i++) r = (r << 1) ^ ((r >>> 11) * 0x1F25);
      const b = (ver << 12) | r;
      for (let i = 0; i < 18; i++) { const v = ((b >>> i) & 1) === 1, a = size - 11 + i % 3, c = Math.floor(i / 3); setF(a, c, v); setF(c, a, v); }
    }
    // placement en zigzag
    let i = 0;
    for (let right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (let v = 0; v < size; v++) for (let j = 0; j < 2; j++) {
        const x = right - j, up = ((right + 1) & 2) === 0, y = up ? size - 1 - v : v;
        if (!fn[y][x] && i < all.length * 8) { mod[y][x] = ((all[i >>> 3] >>> (7 - (i & 7))) & 1) === 1; i++; }
      }
    }
    // choix du meilleur masque (pénalités simplifiées)
    const MASKS = [(x, y) => (x + y) % 2 === 0, (x, y) => y % 2 === 0, (x) => x % 3 === 0, (x, y) => (x + y) % 3 === 0,
      (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0, (x, y) => x * y % 2 + x * y % 3 === 0,
      (x, y) => (x * y % 2 + x * y % 3) % 2 === 0, (x, y) => ((x + y) % 2 + x * y % 3) % 2 === 0];
    const applyMask = (m) => { for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!fn[y][x] && MASKS[m](x, y)) mod[y][x] = !mod[y][x]; };
    const penalty = () => {
      let p = 0, dark = 0;
      for (let y = 0; y < size; y++) {
        let rx = 1, ry = 1;
        for (let x = 0; x < size; x++) {
          if (mod[y][x]) dark++;
          if (x > 0) { if (mod[y][x] === mod[y][x - 1]) { rx++; if (rx === 5) p += 3; else if (rx > 5) p++; } else rx = 1; }
          if (x > 0) { if (mod[x][y] === mod[x - 1][y]) { ry++; if (ry === 5) p += 3; else if (ry > 5) p++; } else ry = 1; }
          if (x > 0 && y > 0 && mod[y][x] === mod[y - 1][x] && mod[y][x] === mod[y][x - 1] && mod[y][x] === mod[y - 1][x - 1]) p += 3;
        }
      }
      return p + Math.floor(Math.abs(dark * 20 - size * size * 10) / (size * size)) * 10;
    };
    let best = 0, bestP = Infinity;
    for (let m = 0; m < 8; m++) { applyMask(m); drawFormat(m); const pp = penalty(); if (pp < bestP) { bestP = pp; best = m; } applyMask(m); }
    applyMask(best); drawFormat(best);
    return mod;
  }

  /* Rendu SVG (marge de 4 modules, net à l'impression) */
  function svg(text, opts) {
    const m = encode(text), n = m.length, q = 4;
    let d = '';
    m.forEach((row, y) => row.forEach((v, x) => { if (v) d += 'M' + (x + q) + ' ' + (y + q) + 'h1v1h-1z'; }));
    return '<svg class="qr" viewBox="0 0 ' + (n + q * 2) + ' ' + (n + q * 2) + '" shape-rendering="crispEdges" role="img" aria-label="' + ((opts && opts.label) || 'QR code') + '">' +
      '<rect width="100%" height="100%" fill="#fff"/><path d="' + d + '" fill="' + ((opts && opts.color) || '#2B201C') + '"/></svg>';
  }

  window.BREW_QR = { encode, svg };
})();
