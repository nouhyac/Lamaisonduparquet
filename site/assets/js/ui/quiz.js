/* Quiz « votre décor en 3 questions » : engagement + recommandation argumentée. */
import { $, html, img, emit, track } from "./dom.js";
import { QUESTIONS, recommend } from "../core/quiz.js";

export function initQuiz({ DECORS, ROOMS }) {
  const box = $("#quizBox"); if (!box) return;
  const ans = {};
  let step = 0;

  function render() {
    if (step < QUESTIONS.length) {
      const q = QUESTIONS[step];
      html(box, `<div class="qz-prog" aria-hidden="true">${QUESTIONS.map((_, i) => `<i class="${i <= step ? "on" : ""}"></i>`).join("")}</div>
        <p class="qz-n">Question ${step + 1} sur ${QUESTIONS.length}</p>
        <h3 class="qz-q" tabindex="-1">${q.q}</h3>
        <div class="qz-opts" role="group" aria-label="${q.q}">${q.opts.map(([v, l]) => `<button type="button" data-v="${v}" aria-pressed="${ans[q.id] === v}">${l}</button>`).join("")}</div>
        ${step ? '<button type="button" class="lk qz-back">← Question précédente</button>' : ""}`);
      return;
    }
    const r = recommend(ans, DECORS), d = DECORS.find(x => x.ref === r.ref), room = ROOMS.find(x => x.id === r.room);
    html(box, `<div class="qz-res">
      <img src="${img(`v-${room.id}-${d.ref.toLowerCase()}`)}" alt="${room.n} avec parquet EGGER ${d.n}" width="800" height="1000" loading="lazy" decoding="async">
      <div><p class="qz-n">Notre recommandation pour votre ${room.n.toLowerCase()}</p>
      <h3 class="qz-q" tabindex="-1">${d.n} <span>· ${d.ref}</span></h3>
      <div class="chips"><span>${d.mm} mm</span><span>Classe ${d.cl}</span>${d.aqua ? '<span class="aq">Aqua · 24 h</span>' : ""}<span class="ok">En stock</span></div>
      <ul class="ticks">${r.why.map(w => `<li>${w}</li>`).join("")}</ul>
      <div class="cta"><a class="btn b-red" href="#reserver" id="qzBook">Le voir en vrai au showroom</a><a class="btn b-line" href="#visualiseur" id="qzViz">Voir en grand</a></div>
      <button type="button" class="lk qz-again">Recommencer le quiz</button></div></div>`);
    $("#qzBook").addEventListener("click", () => emit("pick-decor", d.ref));
    $("#qzViz").addEventListener("click", e => { e.preventDefault(); emit("show-viz", { room: room.id, ref: d.ref }); });
    emit("calc-decor", d.ref);
    track("CompleteRegistration", { content_name: "quiz", content_ids: [d.ref] });
  }

  box.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.v) { ans[QUESTIONS[step].id] = b.dataset.v; step++; render(); box.querySelector(".qz-q")?.focus({ preventScroll: true }); }
    else if (b.classList.contains("qz-back")) { step--; render(); }
    else if (b.classList.contains("qz-again")) { step = 0; render(); }
  });
  render();
}
