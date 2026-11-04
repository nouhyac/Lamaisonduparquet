/* Anatomie 3D d'une lame : éclatement au défilement, rotation au doigt / à la souris / au clavier,
   mise en avant d'une couche, choix du décor. Tout passe par des variables CSS (compatible CSP). */
import { $, $$, html, img, CALM, track } from "./dom.js";
import { short } from "../core/format.js";

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function initPlank({ DECORS }) {
  const box = $("#plank3d"), scene = $("#scene"), stack = $("#stack");
  if (!box) return;
  const rot = { x: 58, z: -32 };
  const apply = () => { scene.style.setProperty("--rx", rot.x + "deg"); scene.style.setProperty("--rz", rot.z + "deg"); };

  // éclatement quand la lame entre à l'écran (immédiat si animations réduites)
  if (CALM || !("IntersectionObserver" in window)) box.classList.add("open");
  else new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { box.classList.add("open"); o.disconnect(); } }), { threshold: .35 }).observe(box);

  // rotation : glisser (souris ou doigt)
  let drag = null;
  box.addEventListener("pointerdown", e => { drag = { x: e.clientX, y: e.clientY, rx: rot.x, rz: rot.z }; box.classList.add("drag"); box.setPointerCapture(e.pointerId); });
  box.addEventListener("pointermove", e => {
    if (drag) {
      rot.z = clamp(drag.rz + (e.clientX - drag.x) * .35, -80, 20);
      rot.x = clamp(drag.rx - (e.clientY - drag.y) * .25, 30, 75);
      apply();
    } else if (!CALM && e.pointerType === "mouse") {
      // légère parallaxe au survol
      const r = box.getBoundingClientRect(), dx = (e.clientX - r.left) / r.width - .5, dy = (e.clientY - r.top) / r.height - .5;
      scene.style.setProperty("--rz", (rot.z + dx * 10) + "deg"); scene.style.setProperty("--rx", (rot.x - dy * 6) + "deg");
    }
  });
  const end = () => { if (drag) track("ViewContent", { content_name: "lame-3d" }); drag = null; box.classList.remove("drag"); };
  box.addEventListener("pointerup", end); box.addEventListener("pointercancel", end);
  box.addEventListener("pointerleave", () => { if (!drag) apply(); });

  // couches : survol, focus ou clic mettent la couche en avant
  const setHl = n => { n ? stack.setAttribute("data-hl", n) : stack.removeAttribute("data-hl"); $$("#layers button").forEach(b => b.classList.toggle("on", b.dataset.l === n)); };
  $$("#layers button").forEach(b => {
    b.addEventListener("mouseenter", () => setHl(b.dataset.l));
    b.addEventListener("focus", () => setHl(b.dataset.l));
    b.addEventListener("click", () => setHl(stack.getAttribute("data-hl") === b.dataset.l ? null : b.dataset.l));
  });
  $("#layers").addEventListener("mouseleave", () => setHl(null));
  $("#layers").addEventListener("focusout", e => { if (!$("#layers").contains(e.relatedTarget)) setHl(null); });

  // décor de la couche 2
  html($("#anatDec"), DECORS.map((d, i) => `<button type="button" role="radio" data-r="${d.ref.toLowerCase()}" aria-checked="${i === 0}" aria-label="${short(d.n)} (${d.ref})" title="${d.n}" data-bg="${img("sw-" + d.ref.toLowerCase())}"></button>`).join(""));
  $("#anatDec").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    stack.dataset.dec = b.dataset.r;
    $$("#anatDec button").forEach(x => x.setAttribute("aria-checked", x === b));
    setHl("2");
  });
}
