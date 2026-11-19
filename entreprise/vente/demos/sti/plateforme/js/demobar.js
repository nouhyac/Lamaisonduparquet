/* Barre de démo Dzign Studio : passer du site aux espaces de gestion */
(function () {
  const page = /gestion\.html/.test(location.pathname) ? (location.hash.slice(1) || 'gestion') : 'site';
  const L = [['site', 'index.html', '🛋️ Site client'], ['manager', 'gestion.html#manager', '🔑 Gérant'], ['sales', 'gestion.html#sales', '💼 Commercial'], ['driver', 'gestion.html#driver', '🚚 Livreur']];
  const bar = document.createElement('div');
  bar.className = 'dbar'; bar.setAttribute('role', 'navigation'); bar.setAttribute('aria-label', 'Espaces de la démo');
  bar.innerHTML = '<div class="wrap"><span class="dlab">Démo Dzign Studio · espaces :</span><nav>' + L.map(([k, h, t]) => '<a href="' + h + '"' + (k === page ? ' aria-current="page"' : '') + '>' + t + '</a>').join('') + '</nav></div>';
  document.body.insertBefore(bar, document.body.firstChild);
  window.addEventListener('hashchange', () => bar.querySelectorAll('a').forEach(a => { if (a.getAttribute('href') === 'gestion.html' + location.hash) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); }));
})();
