/* Réservation de visite en 3 étapes, confirmée sur WhatsApp. */
import { $, $$, html, img, track, on, scrollTo } from "./dom.js";
import { short, hh, cap, JOURS, MOIS, MOIS_C, dayLong, waLink } from "../core/format.js";
import { openDays, freeSlots, validateBooking, bookingMessage } from "../core/booking.js";

export function initBooking({ DECORS, CONFIG }) {
  const st = { day: null, slot: null, decors: new Set() };
  let days = [];

  function renderDays() {
    days = openDays(CONFIG);
    html($("#days"), days.map((d, k) => `<button type="button" class="day" data-k="${k}" aria-pressed="${!!st.day && +st.day === +d}" aria-label="${dayLong(d)}"><small>${JOURS[d.getDay()].slice(0, 3)}</small><b>${d.getDate()}</b><span>${MOIS_C[d.getMonth()]}</span></button>`).join(""));
  }
  function renderSlots() {
    const free = st.day ? freeSlots(st.day, CONFIG) : [];
    html($("#slots"), CONFIG.slots.map(t => `<button type="button" class="slot" data-t="${t}" aria-pressed="${st.slot === t}" ${free.includes(t) ? "" : "disabled"}>${hh(t)}</button>`).join(""));
  }
  function renderPicks() {
    html($("#picks"), DECORS.map(d => `<button type="button" class="pick" data-r="${d.ref}" aria-pressed="${st.decors.has(d.ref)}"><i data-bg="${img("sw-" + d.ref.toLowerCase())}"></i>${short(d.n)}</button>`).join(""));
  }
  function recap() {
    $("#rWhen").innerHTML = !st.day ? "Choisissez un jour" : `${dayLong(st.day)} <em>${st.slot ? "à " + hh(st.slot) : "· choisissez l'heure"}</em>`;
    $("#rPlace").textContent = CONFIG.place;
    const sel = DECORS.filter(d => st.decors.has(d.ref));
    $("#rDec").textContent = sel.length ? sel.map(d => short(d.n)).join(", ") : "Toute la gamme en stock";
  }
  const all = () => { renderDays(); renderSlots(); renderPicks(); recap(); };

  $("#days").addEventListener("click", e => { const b = e.target.closest(".day"); if (!b) return; st.day = days[+b.dataset.k]; if (st.slot && !freeSlots(st.day, CONFIG).includes(st.slot)) st.slot = null; renderDays(); renderSlots(); recap(); });
  $("#slots").addEventListener("click", e => { const b = e.target.closest(".slot:not(:disabled)"); if (!b) return; st.slot = b.dataset.t; renderSlots(); recap(); });
  $("#picks").addEventListener("click", e => { const b = e.target.closest(".pick"); if (!b) return; const r = b.dataset.r; st.decors.has(r) ? st.decors.delete(r) : st.decors.add(r); renderPicks(); recap(); });

  const fields = () => ({ day: st.day, slot: st.slot, name: $("#bName").value, phone: $("#bTel").value, project: $("#bProj").value, surface: $("#bSurf").value, decors: DECORS.filter(d => st.decors.has(d.ref)) });
  $("#bSend").addEventListener("click", ev => {
    const f = fields(), e = validateBooking(f);
    if (e.length) {
      ev.preventDefault(); $("#bErr").textContent = "Il manque : " + e.join(", ") + ".";
      if (!st.day || !st.slot) scrollTo($("#reserver")); else if (e[0] === "votre nom") $("#bName").focus(); else $("#bTel").focus();
      return;
    }
    $("#bErr").textContent = ""; $("#bSend").href = waLink(CONFIG.whatsapp, bookingMessage(f)); $("#recap").classList.add("sent");
    track("Lead", { content_name: "visite" });
  });
  ["bName", "bTel", "bSurf", "bProj"].forEach(id => $("#" + id).addEventListener("input", () => { if ($("#bErr").textContent && !validateBooking(fields()).length) $("#bErr").textContent = ""; }));
  $("#proBtn").addEventListener("click", () => { $("#bProj").selectedIndex = 2; });

  // événements venant des autres modules
  on("pick-decor", ref => { st.decors = new Set([ref]); renderPicks(); recap(); });
  on("book-slot", ({ day, slot }) => { st.day = day; st.slot = slot; all(); scrollTo($("#reserver")); setTimeout(() => $("#bName").focus({ preventScroll: true }), 600); });

  st.day = openDays(CONFIG)[0] || null;
  all();
}
