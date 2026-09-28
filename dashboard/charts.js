'use strict';
/* charts.js : graphiques SVG/HTML légers + infobulles */

let AFTER = [];
const uid = () => 'c' + Math.random().toString(36).slice(2, 9);
function chartSlot(fn, h = 220) { const id = uid(); AFTER.push(() => { const el = document.getElementById(id); if (el) fn(el); }); return `<div class="chart" id="${id}" style="min-height:${h}px"></div>`; }

/* infobulle unique */
const tip = () => $('#tip');
function showTip(html, x, y) {
  const t = tip(); t.innerHTML = html; t.hidden = false;
  const r = t.getBoundingClientRect(); let L = x + 14, T = y + 14;
  if (L + r.width > innerWidth - 8) L = x - r.width - 14;
  if (T + r.height > innerHeight - 8) T = y - r.height - 14;
  t.style.left = Math.max(8, L) + 'px'; t.style.top = Math.max(8, T) + 'px';
}
function hideTip() { tip().hidden = true; }
document.addEventListener('mousemove', e => {
  const el = e.target.closest?.('[data-tip]');
  if (el) showTip(el.getAttribute('data-tip'), e.clientX, e.clientY);
  else if (!e.target.closest?.('.ovl')) hideTip();
});
document.addEventListener('scroll', hideTip, { passive: true });
const tipAttr = html => `data-tip="${esc(html)}"`;

function niceStep(r, n) { const raw = r / n, p = Math.pow(10, Math.floor(Math.log10(raw || 1))), f = raw / p; return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p; }
function niceTicks(lo, hi, n = 4) {
  if (hi === lo) { hi = lo + 1; }
  const st = niceStep(hi - lo, n), a = Math.floor(lo / st) * st, b = Math.ceil(hi / st) * st, t = [];
  for (let v = a; v <= b + st / 2; v += st) t.push(+v.toFixed(10));
  return t;
}

/* courbes : x = libellés, series = [{name, v, color}] */
function drawLine(el, o) {
  const { x, series, fmt = fmtK, h = 230, marks = [], bands = [], rug = null, zero = true, xfmt = fmtDay } = o;
  const W = Math.max(300, el.clientWidth), H = h, m = { l: 50, r: 16, t: 14, b: rug ? 40 : 26 };
  const iw = W - m.l - m.r, ih = H - m.t - m.b;
  const all = series.flatMap(s => s.v.filter(isNum));
  if (!all.length) { el.innerHTML = `<p class="na-msg">${NA}</p>`; return; }
  let lo = Math.min(...all), hi = Math.max(...all);
  if (zero) lo = Math.min(0, lo); else { const pd = (hi - lo) * .12 || 1; lo -= pd; hi += pd; }
  const tk = niceTicks(lo, hi, 4); lo = tk[0]; hi = tk[tk.length - 1];
  const X = i => m.l + (x.length < 2 ? iw / 2 : i * iw / (x.length - 1)), Y = v => m.t + ih - (v - lo) / ((hi - lo) || 1) * ih;
  const tf = new Set(tk.map(fmt)).size < tk.length ? fmtN : fmt;
  let s = `<svg viewBox="0 0 ${W} ${H}" height="${H}" role="img" aria-label="${esc(series.map(z => z.name).join(', '))}">`;
  for (const b of bands) s += `<rect x="${X(b.a)}" y="${m.t}" width="${Math.max(2, X(b.b) - X(b.a))}" height="${ih}" fill="var(--paper)" ${tipAttr(b.label)}/>`;
  for (const t of tk) s += `<line class="gl" x1="${m.l}" x2="${W - m.r}" y1="${Y(t)}" y2="${Y(t)}"/><text x="${m.l - 8}" y="${Y(t) + 4}" text-anchor="end">${tf(t)}</text>`;
  const nl = Math.min(x.length, Math.max(2, Math.floor(iw / 90)));
  for (let k = 0; k < nl; k++) { const i = Math.round(k * (x.length - 1) / Math.max(1, nl - 1)); s += `<text x="${X(i)}" y="${H - (rug ? 4 : 6)}" text-anchor="${k === 0 ? 'start' : k === nl - 1 ? 'end' : 'middle'}">${esc(xfmt(x[i]))}</text>`; }
  series.forEach((se, si) => {
    let d = '', ad = '', open = false, first = null, last = null;
    se.v.forEach((v, i) => {
      if (!isNum(v)) { if (open && si === 0 && o.area !== false && first !== null) { ad += `L${X(last)},${Y(Math.max(lo, 0))}L${X(first)},${Y(Math.max(lo, 0))}Z`; } open = false; first = null; return; }
      d += (open ? 'L' : 'M') + X(i).toFixed(1) + ',' + Y(v).toFixed(1);
      if (si === 0 && o.area !== false) { ad += (open ? 'L' : 'M') + X(i).toFixed(1) + ',' + Y(v).toFixed(1); if (first === null) first = i; }
      last = i; open = true;
    });
    if (si === 0 && o.area !== false && first !== null && open) ad += `L${X(last)},${Y(Math.max(lo, 0))}L${X(first)},${Y(Math.max(lo, 0))}Z`;
    if (si === 0 && o.area !== false) s += `<path d="${ad}" fill="${se.color}" opacity=".09"/>`;
    s += `<path d="${d}" fill="none" stroke="${se.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" ${se.dash ? 'stroke-dasharray="4 4"' : ''}/>`;
    const li = se.v.map((v, i) => isNum(v) ? i : -1).filter(i => i >= 0).pop();
    if (li !== undefined && !se.dash) s += `<circle cx="${X(li)}" cy="${Y(se.v[li])}" r="4" fill="${se.color}" stroke="var(--bg)" stroke-width="2"/>`;
  });
  if (rug) {
    const ry = H - m.b + 8;
    rug.forEach(r => { s += `<rect x="${X(r.i) - 1.5}" y="${ry}" width="3" height="${r.hl ? 10 : 6}" rx="1" fill="${r.hl ? 'var(--red)' : 'var(--data-2)'}" ${tipAttr(r.tip)}/>`; });
  }
  for (const mk of marks) { const v = series[0].v[mk.i]; if (!isNum(v)) continue; s += `<circle cx="${X(mk.i)}" cy="${Y(v)}" r="5" fill="${mk.c || 'var(--red)'}" stroke="var(--bg)" stroke-width="2" ${tipAttr(mk.tip)}/>`; }
  s += `<line class="xh" x1="0" x2="0" y1="${m.t}" y2="${m.t + ih}" stroke="var(--mut)" stroke-dasharray="3 3" visibility="hidden"/>`;
  s += `<rect class="ovl" x="${m.l}" y="${m.t}" width="${iw}" height="${ih}" fill="transparent"/></svg>`;
  el.innerHTML = s;
  const svg = el.querySelector('svg'), ovl = el.querySelector('.ovl'), xh = el.querySelector('.xh');
  ovl.addEventListener('mousemove', e => {
    const r = svg.getBoundingClientRect(), px = (e.clientX - r.left) * (W / r.width);
    const i = clamp(Math.round((px - m.l) / (iw / Math.max(1, x.length - 1))), 0, x.length - 1);
    xh.setAttribute('x1', X(i)); xh.setAttribute('x2', X(i)); xh.setAttribute('visibility', 'visible');
    const mk = marks.find(q => q.i === i);
    showTip(`<b>${esc(xfmt(x[i]))}</b><br>` + series.map(se => `${esc(se.name)} : ${isNum(se.v[i]) ? fmt(se.v[i]) : '—'}`).join('<br>') + (mk ? '<br>' + mk.tip : ''), e.clientX, e.clientY);
  });
  ovl.addEventListener('mouseleave', () => { xh.setAttribute('visibility', 'hidden'); hideTip(); });
}

/* colonnes verticales (une série) */
function drawCols(el, o) {
  const { x, v, fmt = fmtN, h = 200, color = 'var(--data-2)', hl = [], xfmt = fmtDay, name = '' } = o;
  const W = Math.max(300, el.clientWidth), H = h, m = { l: 44, r: 12, t: 12, b: 26 };
  const iw = W - m.l - m.r, ih = H - m.t - m.b;
  const mx = Math.max(1, ...v.filter(isNum));
  const tk = niceTicks(0, mx, 3), hi = tk[tk.length - 1];
  const bw = iw / x.length, gap = Math.min(2, bw * .2);
  const Y = z => m.t + ih - z / hi * ih;
  let s = `<svg viewBox="0 0 ${W} ${H}" height="${H}" role="img" aria-label="${esc(name)}">`;
  for (const t of tk) s += `<line class="gl" x1="${m.l}" x2="${W - m.r}" y1="${Y(t)}" y2="${Y(t)}"/><text x="${m.l - 8}" y="${Y(t) + 4}" text-anchor="end">${fmt(t)}</text>`;
  v.forEach((z, i) => {
    if (!isNum(z) || z <= 0) return;
    const x0 = m.l + i * bw + gap / 2, w = Math.max(1, bw - gap), y0 = Y(z), hh = m.t + ih - y0, r = Math.min(4, w / 2, hh);
    const d = `M${x0},${m.t + ih}V${y0 + r}Q${x0},${y0} ${x0 + r},${y0}H${x0 + w - r}Q${x0 + w},${y0} ${x0 + w},${y0 + r}V${m.t + ih}Z`;
    s += `<path d="${d}" fill="${hl.includes(i) ? 'var(--red)' : color}" ${tipAttr(`<b>${esc(xfmt(x[i]))}</b><br>${esc(name)} : ${fmt(z)}`)}/>`;
  });
  const nl = Math.min(x.length, Math.max(2, Math.floor(iw / 90)));
  for (let k = 0; k < nl; k++) { const i = Math.round(k * (x.length - 1) / Math.max(1, nl - 1)); s += `<text x="${m.l + i * bw + bw / 2}" y="${H - 6}" text-anchor="${k === 0 ? 'start' : k === nl - 1 ? 'end' : 'middle'}">${esc(xfmt(x[i]))}</text>`; }
  s += `<line class="ax" x1="${m.l}" x2="${W - m.r}" y1="${m.t + ih}" y2="${m.t + ih}"/></svg>`;
  el.innerHTML = s;
}

/* barres horizontales HTML : rows [{label, v, n, tip, hl, lo, sub}] */
function hbars(rows, { fmt = fmtN, max = null } = {}) {
  rows = rows.filter(r => isNum(r.v));
  if (!rows.length) return `<p class="na-msg">${NA}</p>`;
  const mx = max ?? Math.max(...rows.map(r => r.v), 1e-9);
  return `<div class="bars">${rows.map(r => `<div class="bar${r.hl ? ' hl' : ''}${r.lo ? ' lo' : ''}" ${tipAttr(r.tip || `<b>${esc(r.label)}</b><br>${fmt(r.v)}${isNum(r.n) ? ` · ${r.n} publication${r.n > 1 ? 's' : ''}` : ''}`)}><span class="lb" title="${esc(r.label)}">${esc(r.label)}</span><span class="tk"><span class="fl" style="width:${clamp(r.v / mx * 100, 0, 100)}%;display:block"></span></span><span class="vl">${fmt(r.v)}${isNum(r.n) ? `<small>n=${r.n}</small>` : ''}</span></div>`).join('')}</div>`;
}

function sparkSVG(v, color = 'var(--data-2)') {
  const a = v.filter(isNum); if (a.length < 2) return '';
  const lo = Math.min(...a), hi = Math.max(...a), W = 200, H = 28;
  const X = i => i * W / (v.length - 1), Y = z => H - 3 - ((z - lo) / ((hi - lo) || 1)) * (H - 6);
  let d = ''; v.forEach((z, i) => { if (isNum(z)) d += (d ? 'L' : 'M') + X(i).toFixed(1) + ',' + Y(z).toFixed(1); });
  const li = v.length - 1;
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><path d="${d}" fill="none" stroke="${color}" stroke-width="1.6" vector-effect="non-scaling-stroke"/>${isNum(v[li]) ? `<circle cx="${X(li)}" cy="${Y(v[li])}" r="2.5" fill="${color}"/>` : ''}</svg>`;
}

/* carte de chaleur : 7 jours × 5 tranches */
function heatmap(cells, metricName, fmt = v => Math.round(v)) {
  const all = Object.values(cells).filter(c => c.n >= 2).map(c => c.v);
  const lo = Math.min(...all, 0), hi = Math.max(...all, 1);
  let h = `<div class="heat" role="table" aria-label="Carte de chaleur jour × tranche horaire"><div class="h"></div>${SLOTS.map(s => `<div class="h">${s.short}</div>`).join('')}`;
  for (const d of DOW_ORDER) {
    h += `<div class="h r">${DOW[d]}</div>`;
    for (const s of SLOTS) {
      const c = cells[d + '|' + s.id];
      if (!c || c.n < 2) { h += `<div class="c empty" ${tipAttr(`<b>${DOW[d]} · ${s.name}</b><br>${c ? c.n : 0} publication${c && c.n > 1 ? 's' : ''} : échantillon trop petit`)}><small>n=${c ? c.n : 0}</small></div>`; continue; }
      const t = (c.v - lo) / ((hi - lo) || 1), pct = Math.round(12 + t * 76);
      h += `<div class="c" style="background:color-mix(in srgb,var(--s1) ${pct}%,var(--bg));color:${pct > 52 ? '#fff' : 'var(--ink)'}" ${tipAttr(`<b>${DOW[d]} · ${s.name}</b><br>${metricName} : ${fmt(c.v)}<br>Moyenne : ${fmt(c.mean)}<br>${c.n} publications${c.skew ? '<br>Une publication virale tire la moyenne' : ''}`)}><b>${fmt(c.v)}</b><small>n=${c.n}${c.skew ? ' · ⚑' : ''}</small></div>`;
    }
  }
  return h + `</div><div class="scale"><span>${fmt(lo)}</span><span class="g" style="background:linear-gradient(90deg,color-mix(in srgb,var(--s1) 12%,var(--bg)),var(--s1))"></span><span>${fmt(hi)}</span><span>· hachuré : moins de 2 publications · ⚑ : moyenne faussée par un contenu viral</span></div>`;
}
