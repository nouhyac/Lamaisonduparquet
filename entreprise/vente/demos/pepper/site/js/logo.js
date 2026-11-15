/* Logo Pepper redessiné en vectoriel d'après leur logo officiel :
   « PEPPER » en capitales Art déco noires, légère ombre portée,
   signature « LES ARTISANS DU BURGER » (ardoise du restaurant). */
window.PEPPER_LOGO = function (opt) {
  opt = opt || {};
  const ink = opt.ink || '#1B1714';
  const shadow = opt.shadow || 'rgba(27,23,20,.22)';
  const sub = opt.sub !== false;
  const h = sub ? 96 : 70;
  const txt = (x, y, fill) => '<text x="' + x + '" y="' + y + '" text-anchor="middle" font-family="Federo,\'Josefin Sans\',\'Century Gothic\',sans-serif" font-size="64" letter-spacing="9" fill="' + fill + '">PEPPER</text>';
  return '<svg viewBox="0 0 320 ' + h + '" role="img" aria-label="Pepper, les artisans du burger">' +
    txt(163.5, 61.5, shadow) + txt(160, 58, ink) +
    (sub ? '<text x="160" y="88" text-anchor="middle" font-family="\'Josefin Sans\',\'Century Gothic\',sans-serif" font-weight="600" font-size="13.5" letter-spacing="4.2" fill="' + ink + '">LES ARTISANS DU BURGER</text>' : '') +
    '</svg>';
};
