/* Point d'entrée · La Maison du Parquet (représentant EGGER en Algérie)
   Architecture :
     config.js        réglages modifiables (numéros, horaires, suivi)
     data.js          catalogue des décors, pièces, FAQ
     core/*.js        logique pure, sans DOM, couverte par les tests (npm test)
     ui/*.js          un module par section de la page, reliés par un bus d'événements (ui/dom.js) */
import { CONFIG } from "./config.js";
import { DECORS, ROOMS, FAQ } from "./data.js";
import { $, html } from "./ui/dom.js";
import { initHero } from "./ui/hero.js";
import { initViz } from "./ui/viz.js";
import { initQuiz } from "./ui/quiz.js";
import { initCalc } from "./ui/calc.js";
import { initCollection } from "./ui/collection.js";
import { initBooking } from "./ui/booking.js";
import { initContact } from "./ui/contact.js";
import { initFx } from "./ui/fx.js";

const ctx = { CONFIG, DECORS, ROOMS };
const modules = [initHero, initViz, initQuiz, initCalc, initCollection, initBooking, initContact, initFx];

// FAQ (texte de confiance issu de data.js)
html($("#faqList"), FAQ.map(([q, a]) => `<details class="rv"><summary>${q}</summary><p>${a}</p></details>`).join(""));

// chaque module est isolé : une erreur dans l'un n'empêche pas les autres de fonctionner
for (const init of modules) {
  try { init(ctx); } catch (err) { console.error(`[${init.name}]`, err); }
}
