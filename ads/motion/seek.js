// Contrôle du temps : le moteur de rendu appelle seek(t) pour chaque image (rendu exact, sans saccade).
window.seek = t => {
  document.getAnimations().forEach(a => { a.pause(); a.currentTime = t * 1000; });
  if (window.onSeek) window.onSeek(t);
};
window.ease = x => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
