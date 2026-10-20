/* Collection en stock + fiche technique détaillée. */
import { $, $$, html, img, emit, on, scrollTo } from "./dom.js";

export function initCollection({ DECORS, ROOMS }) {
  const roomOf = d => ROOMS.find(r => r.rec === d.ref);
  html($("#cards"), DECORS.map(d => {
    const room = roomOf(d);
    return `<article class="cardp rv" data-ref="${d.ref}"><button class="im" type="button" data-fiche="${d.ref}" aria-label="Fiche technique ${d.n}" data-bg="${img("sw-" + d.ref.toLowerCase())}"></button>
    <div class="bd"><div class="ref">${d.ref} · ${d.line.replace("NatureSense ", "")}</div><h3>${d.n}</h3><div class="sp">${d.mm} mm · classe ${d.cl} · ${d.fin}${d.aqua ? " · Aqua" : ""}</div><div class="sp">Pièce idéale : ${room.n.toLowerCase()}</div>
    <div class="av"><i aria-hidden="true"></i>En stock</div><button class="lk" type="button" data-fiche="${d.ref}">Fiche technique</button><button class="lk lk2" type="button" data-show="${d.ref}" data-room="${room.id}">Voir dans le visualiseur →</button></div></article>`;
  }).join(""));

  function show(ref, scroll) {
    const d = DECORS.find(x => x.ref === ref), room = roomOf(d);
    $$("#cards .cardp").forEach(c => c.classList.toggle("on", c.dataset.ref === ref));
    html($("#fiche"), `<div class="f-img"><div class="plank" role="img" aria-label="Lame ${d.n}" data-bg="${img("sw-" + d.ref.toLowerCase())}"></div><img src="${img(`v-${room.id}-${d.ref.toLowerCase()}`)}" alt="${room.n} avec parquet EGGER ${d.n}" width="800" height="1000" loading="lazy" decoding="async"></div>
      <div><div class="ref">EGGER · ${d.line} · Réf. ${d.ref}</div><h3>${d.n}</h3>
      <div class="stock"><i aria-hidden="true"></i><span><b>En stock</b>Disponible immédiatement</span></div>
      <p class="ed">${d.ed}</p>
      <h4>Fiche technique</h4><dl class="spec">${d.specs.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>
      <div class="cta"><a class="btn b-red" href="#reserver" id="ficheSee">Voir ce décor au showroom</a><a class="btn b-line" href="#calcul" id="ficheCalc">Calculer mes cartons</a>${d.pdf ? `<a class="btn b-line" href="${d.pdf}" target="_blank" rel="noopener noreferrer">Fiche PDF</a>` : ""}</div></div>`);
    $("#ficheSee").addEventListener("click", () => emit("pick-decor", d.ref));
    $("#ficheCalc").addEventListener("click", () => emit("calc-decor", d.ref));
    if (scroll) scrollTo($("#fiche"));
  }
  $("#cards").addEventListener("click", e => {
    const f = e.target.closest("[data-fiche]"), s = e.target.closest("[data-show]");
    if (f) show(f.dataset.fiche, true);
    if (s) emit("show-viz", { room: s.dataset.room, ref: s.dataset.show });
  });
  on("show-fiche", ref => show(ref, true));
  show(DECORS[0].ref, false);
}
