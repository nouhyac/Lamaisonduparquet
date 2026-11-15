/* Logo Pepper Burger redessiné en vectoriel (d'après leur logo : « PE » rouge, flamme, filets rouge/or, « BURGER ») */
window.PEPPER_LOGO = function (opt) {
  opt = opt || {};
  const ink = opt.ink || '#F7F1EA';
  const sub = opt.sub !== false;
  return '<svg viewBox="0 0 300 ' + (sub ? 112 : 84) + '" role="img" aria-label="Pepper Burger">' +
    '<path d="M150 4c6 9 13 14 13 24a13 13 0 0 1-26 0c0-5 2-8 5-11 0 5 2 8 5 8-1-8 1-14 3-21z" fill="#E1262D"/>' +
    '<path d="M150 22c3 4 6 6 6 10a6 6 0 0 1-12 0c0-3 3-6 6-10z" fill="#F4B629"/>' +
    '<rect x="14" y="26" width="116" height="4" rx="2" fill="#E1262D"/><rect x="170" y="26" width="116" height="4" rx="2" fill="#F4B629"/>' +
    '<text x="150" y="82" text-anchor="middle" font-family="\'Archivo Black\',\'Arial Black\',Impact,sans-serif" font-size="56" letter-spacing="1">' +
    '<tspan fill="#E1262D">PE</tspan><tspan fill="' + ink + '">PPER</tspan></text>' +
    (sub ? '<rect x="40" y="96" width="70" height="3.5" rx="2" fill="#E1262D"/><rect x="190" y="96" width="70" height="3.5" rx="2" fill="#F4B629"/>' +
      '<text x="150" y="104" text-anchor="middle" font-family="\'Archivo Black\',\'Arial Black\',sans-serif" font-size="17" letter-spacing="3" fill="' + ink + '">BURGER</text>' : '') +
    '</svg>';
};
