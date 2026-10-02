/* Effets : apparitions au défilement, compteurs animés, vidéo à la demande, menu actif.
   Tout est visible sans JavaScript ; les effets ne s'ajoutent que si le visiteur n'a pas demandé moins d'animations. */
import { $, $$, CALM } from "./dom.js";

export function initFx() {
  const io = "IntersectionObserver" in window;

  if (io && !CALM) {
    document.documentElement.classList.add("fx");
    const ro = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); ro.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
    const watch = () => $$(".rv:not(.in)").forEach(el => ro.observe(el));
    watch(); new MutationObserver(watch).observe($("#main"), { childList: true, subtree: true });

    // compteurs : 0 → valeur finale
    const co = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return; co.unobserve(e.target);
      const el = e.target, end = +el.dataset.count, t0 = performance.now(), d = 1200;
      const tick = t => { const k = Math.min(1, (t - t0) / d); el.firstChild.nodeValue = Math.round(end * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); };
      el.firstChild.nodeValue = "0"; requestAnimationFrame(tick);
    }), { threshold: .6 });
    $$("[data-count]").forEach(el => co.observe(el));
  }

  // vidéo du showroom : chargée et lue seulement quand elle est visible
  const v = $("#showVid");
  if (v && io && !CALM) new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { v.preload = "auto"; v.play().catch(() => { }); } else v.pause(); }), { threshold: .25 }).observe(v);

  // lien de menu actif
  if (io) {
    const links = $$(".nav a");
    const mo = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach(a => a.setAttribute("aria-current", a.getAttribute("href") === "#" + e.target.id)); }), { rootMargin: "-45% 0px -50% 0px" });
    links.forEach(a => { const s = $(a.getAttribute("href")); if (s) mo.observe(s); });
  }

  // en-tête compact après l'accueil
  const top = $(".top");
  const onScroll = () => top.classList.toggle("scrolled", scrollY > 40);
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
}
