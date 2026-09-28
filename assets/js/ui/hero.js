/* Accueil : avant / après plein écran, balayage automatique, choix du décor, prochain créneau. */
import { $, $$, html, img, CALM, track, emit } from "./dom.js";
import { short, hh } from "../core/format.js";
import { nextSlot, relDay } from "../core/booking.js";

let raf = null;
const stop = () => { if (raf) cancelAnimationFrame(raf); raf = null; };

/** Rend un bloc avant/après pilotable à la souris, au doigt et au clavier. */
export function makeBA(root, knob) {
  const set = p => { p = Math.max(0, Math.min(100, p)); root.style.setProperty("--pos", p + "%"); knob.setAttribute("aria-valuenow", Math.round(p)); };
  const posFrom = e => { const r = root.getBoundingClientRect(); return (e.clientX - r.left) / r.width * 100; };
  let drag = false;
  root.addEventListener("pointerdown", e => {
    if (e.target.closest("a,button:not(.knob),.hero-dec")) return;
    drag = true; stop(); root.classList.add("touched"); root.setPointerCapture(e.pointerId); set(posFrom(e));
  });
  root.addEventListener("pointermove", e => { if (drag) set(posFrom(e)); });
  const end = () => { if (drag) track("ViewContent", { content_name: "avant-apres" }); drag = false; };
  root.addEventListener("pointerup", end); root.addEventListener("pointercancel", end);
  knob.addEventListener("keydown", e => {
    const v = +knob.getAttribute("aria-valuenow");
    const n = { ArrowLeft: v - 5, ArrowDown: v - 5, ArrowRight: v + 5, ArrowUp: v + 5, Home: 0, End: 100 }[e.key];
    if (n !== undefined) { e.preventDefault(); stop(); root.classList.add("touched"); set(n); }
  });
  return set;
}

/** Le carrelage disparaît sous les yeux du visiteur : 100 % → 0 % puis retour à 45 %. */
function sweep(set) {
  const seq = [[100, 0, 1900], [0, 45, 900]];
  let i = 0, t0 = null;
  set(100);
  const ease = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
  const step = ts => {
    if (t0 === null) t0 = ts;
    const [a, b, d] = seq[i], k = Math.min(1, (ts - t0) / d);
    set(a + (b - a) * ease(k));
    if (k >= 1) { i++; t0 = null; if (i >= seq.length) { raf = null; return; } }
    raf = requestAnimationFrame(step);
  };
  setTimeout(() => { raf = requestAnimationFrame(step); }, 700);
}

export function initHero({ DECORS, CONFIG }) {
  const root = $("#heroBa"), set = makeBA(root, $("#heroKnob")), after = $("#heroAfter");
  let cur = DECORS[0].ref;
  const render = () => {
    const d = DECORS.find(x => x.ref === cur);
    after.src = img("ba-" + d.ref.toLowerCase());
    after.alt = "Après : le même salon en parquet EGGER " + d.n;
    $("#heroTag").textContent = "Après · " + d.n;
    $$("#heroDec button").forEach(b => b.setAttribute("aria-checked", b.dataset.r === cur));
  };
  html($("#heroDec"), DECORS.map(d => `<button type="button" role="radio" data-r="${d.ref}" aria-checked="false"><i data-bg="${img("sw-" + d.ref.toLowerCase())}"></i>${short(d.n)}</button>`).join(""));
  $$("#heroDec button").forEach(b => b.addEventListener("click", () => { cur = b.dataset.r; render(); stop(); set(35); root.classList.add("touched"); track("ViewContent", { content_ids: [cur] }); }));
  render();
  // préchargement discret des autres décors, une fois la page affichée
  (window.requestIdleCallback || setTimeout)(() => DECORS.forEach(x => { new Image().src = img("ba-" + x.ref.toLowerCase()); }));
  if (CALM) set(45); else after.complete ? sweep(set) : after.addEventListener("load", () => sweep(set), { once: true });

  // prochain créneau réel, calculé à partir des horaires du showroom
  const n = nextSlot(CONFIG), pill = $("#nextSlot");
  if (n && pill) {
    $("#nextTxt").textContent = `${relDay(n.day)} à ${hh(n.slot)}`;
    pill.hidden = false;
    pill.addEventListener("click", () => emit("book-slot", n));
  }
}
