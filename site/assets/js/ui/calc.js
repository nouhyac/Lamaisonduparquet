/* Calculateur de cartons : saisie par pièce, résultat en direct, envoi WhatsApp. */
import { $, $$, html, track, on } from "./dom.js";
import { esc, clip, num, waLink } from "../core/format.js";
import { cartons, roomArea } from "../core/calc.js";

const NAMES = ["Chambre", "Séjour", "Couloir", "Bureau", "Entrée", "Chambre 2"];

export function initCalc({ DECORS, CONFIG }) {
  const st = { mode: "m2", rows: [{ n: "Salon", a: "", l: "", w: "" }] };
  const sel = $("#cDec"), dec = () => DECORS.find(d => d.ref === sel.value);
  html(sel, DECORS.map(d => `<option value="${d.ref}">${d.n} · ${d.ref} (colis ${num(d.colis)} m²)</option>`).join(""));

  const field = (i, k, label, ph, max) => `<div class="cf-row${k === "n" ? " nm" : ""}"><label for="r${k}${i}">${label}</label><input id="r${k}${i}" data-k="${k}" type="text" ${k === "n" ? "" : 'inputmode="decimal"'} autocomplete="off" maxlength="${max}" value="${esc(st.rows[i][k])}" ${ph ? `placeholder="${ph}"` : ""}></div>`;
  function renderRows() {
    html($("#rooms2"), st.rows.map((r, i) => `<div class="room-row${st.mode === "dim" ? " dim" : ""}" data-i="${i}">${field(i, "n", "Pièce", "", 30)}${st.mode === "m2" ? field(i, "a", "Surface (m²)", "ex. 24", 8) : field(i, "l", "Longueur (m)", "5,2", 6) + field(i, "w", "Largeur (m)", "4,1", 6)}<button type="button" class="rm" aria-label="Retirer ${esc(r.n)}" ${st.rows.length < 2 ? "hidden" : ""}>×</button></div>`).join(""));
    update();
  }
  function update() {
    const d = dec(), r = cartons({ rows: st.rows, mode: st.mode, colis: d.colis, waste: CONFIG.waste });
    $("#oM2").textContent = num(r.m2) + " m²";
    $("#oM2c").textContent = num(r.m2Cut) + " m²";
    $("#oBox").textContent = r.boxes;
    $("#oBought").textContent = r.boxes ? `soit ${num(r.m2Bought)} m² livrés` : "";
    return { d, ...r };
  }

  $("#rooms2").addEventListener("input", e => {
    const row = e.target.closest(".room-row"); if (!row) return;
    st.rows[+row.dataset.i][e.target.dataset.k] = e.target.value; update();
    $("#cErr").textContent = "";
  });
  $("#rooms2").addEventListener("click", e => { if (e.target.classList.contains("rm")) { st.rows.splice(+e.target.closest(".room-row").dataset.i, 1); renderRows(); } });
  $("#addRoom").addEventListener("click", () => {
    if (st.rows.length >= 12) return;
    st.rows.push({ n: NAMES[(st.rows.length - 1) % NAMES.length], a: "", l: "", w: "" }); renderRows();
    [...$$("#rooms2 .room-row")].pop().querySelector("input[data-k=a],input[data-k=l]").focus();
  });
  $$(".cf-mode button").forEach(b => b.addEventListener("click", () => { st.mode = b.dataset.mode; $$(".cf-mode button").forEach(x => x.setAttribute("aria-checked", x === b)); renderRows(); }));
  sel.addEventListener("change", update);
  on("calc-decor", ref => { sel.value = ref; update(); });

  $("#calcSend").addEventListener("click", ev => {
    const r = update();
    if (!r.m2) { ev.preventDefault(); $("#cErr").textContent = "Indiquez au moins une surface pour calculer vos cartons."; $("#rooms2 input[data-k=a],#rooms2 input[data-k=l]").focus(); return; }
    const lines = st.rows.filter(x => roomArea(x, st.mode) > 0).map(x => `• ${clip(x.n || "Pièce", 30)} : ${num(Math.round(roomArea(x, st.mode) * 100) / 100)} m²`).join("\n");
    $("#calcSend").href = waLink(CONFIG.whatsapp, `Bonjour, je souhaite un devis pour du parquet EGGER.\n\n🪵 ${r.d.n} (${r.d.ref})\n${lines}\n📐 Total : ${num(r.m2)} m², soit ${num(r.m2Cut)} m² avec coupe\n📦 Estimation : ${r.boxes} cartons de ${num(r.d.colis)} m²\n\nMerci de me recontacter.`);
    track("Lead", { content_name: "calculateur", value: r.boxes });
  });
  renderRows();
}
