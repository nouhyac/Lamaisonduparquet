/* Outils DOM partagés : sélecteurs, images, bus d'événements, mesure d'audience. */

export const $ = s => document.querySelector(s);
export const $$ = s => [...document.querySelectorAll(s)];

export const WEBP = (() => { try { return document.createElement("canvas").toDataURL("image/webp").startsWith("data:image/webp"); } catch (_) { return false; } })();
/** Chemin d'image : WebP si le navigateur le gère, sinon JPEG. */
export const img = base => `img/${base}.${WEBP ? "webp" : "jpg"}`;

export const CALM = matchMedia("(prefers-reduced-motion: reduce)").matches || !!(navigator.connection && navigator.connection.saveData);
export const scrollTo = (el, block = "start") => el && el.scrollIntoView({ behavior: CALM ? "auto" : "smooth", block });

/* Sécurité : aucun attribut style dans le HTML généré (CSP style-src 'self').
   Les fonds d'image passent par data-bg, validés puis appliqués via le CSSOM. */
const SAFE_BG = /^img\/[a-z0-9-]+\.(webp|jpg)$/;
function paintBg(root) {
  const list = root.matches?.("[data-bg]") ? [root] : [];
  list.concat([...(root.querySelectorAll?.("[data-bg]") ?? [])]).forEach(el => {
    const u = el.getAttribute("data-bg");
    if (SAFE_BG.test(u)) el.style.backgroundImage = `url("${u}")`;
    el.removeAttribute("data-bg");
  });
}
new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => n.nodeType === 1 && paintBg(n))))
  .observe(document.documentElement, { childList: true, subtree: true });

/** HTML de confiance uniquement (données du catalogue ou texte déjà échappé). */
export function html(el, markup) { el.innerHTML = markup; paintBg(el); return el; }

/* Bus d'événements : les modules communiquent sans dépendre les uns des autres. */
export const emit = (name, detail) => document.dispatchEvent(new CustomEvent("lmdp:" + name, { detail }));
export const on = (name, fn) => document.addEventListener("lmdp:" + name, e => fn(e.detail));

/** Mesure d'audience (Meta Pixel / GA4), silencieuse si non configurée. */
export function track(ev, p = {}) {
  try {
    if (window.fbq) window.fbq("track", ev, p);
    if (window.gtag) window.gtag("event", ev === "Lead" ? "generate_lead" : ev === "Contact" ? "contact" : ev, p);
  } catch (_) { /* jamais bloquant */ }
}

/** Navigation clavier dans un groupe (flèches). */
export function roving(container, sel) {
  container.addEventListener("keydown", e => {
    const items = [...container.querySelectorAll(sel)], i = items.indexOf(document.activeElement);
    if (i < 0) return;
    let j;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") j = (i + 1) % items.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") j = (i - 1 + items.length) % items.length;
    else return;
    e.preventDefault(); items[j].focus(); items[j].click();
  });
}
