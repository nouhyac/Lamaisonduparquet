/* Visualiseur : une pièce, un décor, rendu instantané avec fondu. */
import { $, $$, html, img, track, emit, on, roving, scrollTo } from "./dom.js";
import { short } from "../core/format.js";

export function initViz({ DECORS, ROOMS, CONFIG }) {
  const st = { room: "salon", ref: "EL2863" }, dec = r => DECORS.find(d => d.ref === r);
  let front = "vizA";
  const onSite = !!CONFIG.siteUrl && location.origin === new URL(CONFIG.siteUrl).origin;

  function render(anim) {
    const room = ROOMS.find(r => r.id === st.room), d = dec(st.ref), isRec = room.rec === d.ref;
    const cur = $("#" + front), nxt = $("#" + (front === "vizA" ? "vizB" : "vizA"));
    const src = img(`v-${st.room}-${st.ref.toLowerCase()}`), alt = `${room.n} avec parquet EGGER ${d.n} (${d.ref})`;
    if (!anim || !cur.getAttribute("src")) { cur.src = src; cur.alt = alt; cur.classList.remove("out"); nxt.classList.add("out"); }
    else if (cur.getAttribute("src") !== src) {
      nxt.onload = () => { nxt.classList.remove("out"); cur.classList.add("out"); front = nxt.id; };
      nxt.alt = alt; nxt.src = src; if (nxt.complete) nxt.onload();
    }
    $("#vizRec").hidden = !isRec;
    $("#vizTagSw").style.backgroundImage = `url("${img("sw-" + d.ref.toLowerCase())}")`;
    $("#vizTagTxt").textContent = `${d.n} · ${d.ref}`;
    $$("#rooms button").forEach(b => { const o = b.dataset.r === st.room; b.setAttribute("aria-selected", o); b.tabIndex = o ? 0 : -1; });
    $$("#swatches .swatch").forEach(b => { const o = b.dataset.r === st.ref; b.setAttribute("aria-checked", o); b.tabIndex = o ? 0 : -1; });
    const link = onSite ? `\n${CONFIG.siteUrl}/#v-${st.room}-${st.ref.toLowerCase()}` : (CONFIG.siteUrl ? "\n" + CONFIG.siteUrl : "");
    const share = "https://wa.me/?text=" + encodeURIComponent(`Regarde ce parquet EGGER ${d.n} (${d.ref}), en stock chez La Maison du Parquet à Dar El Beïda. WhatsApp ${CONFIG.phone}${link}`);
    html($("#info"), `<div class="ref">EGGER · Réf. ${d.ref}</div><h4>${d.n}</h4>
      <div class="chips"><span>${d.mm} mm</span><span>Classe ${d.cl}</span><span>${d.fin}</span>${d.aqua ? '<span class="aq">Aqua · 24 h</span>' : ""}</div>
      <p class="${isRec ? "note" : ""}">${isRec ? room.note : d.d + ` Idéal aussi en ${ROOMS.find(r => r.rec === d.ref).n.toLowerCase()}.`}</p>
      <div class="buy"><div class="stock"><i aria-hidden="true"></i><span><b>En stock</b>Disponible immédiatement</span></div><a class="btn b-red" href="#reserver" id="vizSee">Voir ce décor au showroom</a></div>
      <div class="info-links"><button type="button" class="lk" id="vizFiche">Fiche technique EGGER →</button><button type="button" class="lk" id="vizCalc">Calculer mes cartons →</button></div>
      <a class="share" href="${share}" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z"/></svg>Montrer ce rendu à un proche</a>`);
    $("#vizSee").addEventListener("click", () => emit("pick-decor", d.ref));
    $("#vizFiche").addEventListener("click", () => emit("show-fiche", d.ref));
    $("#vizCalc").addEventListener("click", () => { emit("calc-decor", d.ref); scrollTo($("#calcul")); });
    DECORS.forEach(x => { new Image().src = img(`v-${st.room}-${x.ref.toLowerCase()}`); });
    if (anim) try { history.replaceState(null, "", `#v-${st.room}-${st.ref.toLowerCase()}`); } catch (_) { }
  }

  html($("#rooms"), ROOMS.map(r => `<button type="button" role="tab" data-r="${r.id}">${r.n}</button>`).join(""));
  html($("#swatches"), DECORS.map(d => `<button type="button" class="swatch" role="radio" data-r="${d.ref}" aria-label="${d.n}, ${d.ref}"><i data-bg="${img("sw-" + d.ref.toLowerCase())}"></i><span>${short(d.n)}</span><small>${d.ref}</small></button>`).join(""));
  $$("#rooms button").forEach(b => b.addEventListener("click", () => { st.room = b.dataset.r; st.ref = ROOMS.find(r => r.id === st.room).rec; render(true); }));
  $$("#swatches .swatch").forEach(b => b.addEventListener("click", () => { st.ref = b.dataset.r; render(true); track("ViewContent", { content_ids: [st.ref] }); }));
  roving($("#rooms"), "button"); roving($("#swatches"), ".swatch");

  // ouverture depuis un autre module : { room, ref, scroll }
  on("show-viz", ({ room, ref, scroll = true }) => { if (room) st.room = room; if (ref) st.ref = ref; render(true); if (scroll) scrollTo($("#visualiseur")); });
  $$("[data-show-viz]").forEach(a => a.addEventListener("click", e => { e.preventDefault(); const [room, ref] = a.dataset.showViz.split(":"); emit("show-viz", { room, ref }); }));

  // lien partagé : #v-salon-el2863
  const m = location.hash.match(/^#v-([a-z-]+)-(el\d{4})$/);
  if (m && ROOMS.some(r => r.id === m[1]) && dec(m[2].toUpperCase())) { st.room = m[1]; st.ref = m[2].toUpperCase(); setTimeout(() => $("#visualiseur").scrollIntoView(), 50); }
  render(false);
}
