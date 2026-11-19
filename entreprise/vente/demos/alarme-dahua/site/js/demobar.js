/* Barre de démo : passer d'un espace à l'autre (page client, gérant, caisse, livreur) */
(function () {
  const here = /gestion\.html/.test(location.pathname) ? (location.hash.slice(1) || 'gestion') : 'client';
  const L = [['client', 'index.html', '🛒 Page client'], ['manager', 'gestion.html#manager', '🔑 Gérant · 0328'], ['cash', 'gestion.html#cash', '🧾 Caisse · 2222'], ['driver', 'gestion.html#driver', '🛵 Livreur · 3333']];
  const bar = document.createElement('div');
  bar.className = 'dbar'; bar.setAttribute('role', 'navigation'); bar.setAttribute('aria-label', 'Espaces de la démo');
  bar.innerHTML = '<div class="wrap"><span class="dlab">Démo Dzign Studio · espaces :</span><nav>' +
    L.map(([k, h, t]) => '<a href="' + h + '"' + (k === here ? ' aria-current="page"' : '') + '>' + t + '</a>').join('') + '</nav></div>';
  document.body.insertBefore(bar, document.body.firstChild);
  window.addEventListener('hashchange', () => bar.querySelectorAll('a').forEach(a => {
    if (a.getAttribute('href') === 'gestion.html' + location.hash) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  }));
})();
