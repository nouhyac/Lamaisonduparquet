/* Tests de la logique métier (Node ≥ 18) : npm test */
import { test } from "node:test";
import assert from "node:assert/strict";
import { esc, clip, parseNum, waLink, short } from "../site/assets/js/core/format.js";
import { cartons, roomArea } from "../site/assets/js/core/calc.js";
import { freeSlots, openDays, nextSlot, normalizePhone, validateBooking, bookingMessage } from "../site/assets/js/core/booking.js";
import { recommend, QUESTIONS } from "../site/assets/js/core/quiz.js";
import { DECORS, ROOMS, FAQ } from "../site/assets/js/data.js";
import { CONFIG } from "../site/assets/js/config.js";

test("esc neutralise le HTML et les attributs", () => {
  assert.equal(esc(`"><script>alert(1)</script>`), "&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;");
  assert.equal(esc("l'`a`&b"), "l&#39;&#96;a&#96;&amp;b");
  assert.equal(esc(null), "");
});

test("parseNum lit les nombres à la française et refuse le reste", () => {
  assert.equal(parseNum("14,5"), 14.5);
  assert.equal(parseNum(" 24 "), 24);
  assert.equal(parseNum("-3"), 0);
  assert.equal(parseNum("<img>"), 0);
  assert.equal(parseNum(""), 0);
});

test("clip tronque les saisies", () => assert.equal(clip("abcdef", 3), "abc"));
test("short raccourcit les noms de décor", () => {
  assert.equal(short("Chêne Asgil miel"), "Asgil miel");
  assert.equal(short("Chêne du Nord naturel"), "Chêne du Nord");
});
test("waLink encode le message", () => {
  const u = waLink("213 549 506 857", "a&b=c\n#x");
  assert.equal(u, "https://wa.me/213549506857?text=a%26b%3Dc%0A%23x");
});

test("cartons : 38,5 m² en colis de 1,99 m² avec 5 % de coupe = 21 cartons", () => {
  const r = cartons({ rows: [{ a: "24" }, { a: "14,5" }], mode: "m2", colis: 1.99, waste: .05 });
  assert.deepEqual(r, { m2: 38.5, m2Cut: 40.43, boxes: 21, m2Bought: 41.79 });
});
test("cartons : longueur × largeur", () => {
  const r = cartons({ rows: [{ l: "5,2", w: "4,1" }], mode: "dim", colis: 2.49, waste: .05 });
  assert.equal(r.m2, 21.32); assert.equal(r.boxes, 9);
});
test("cartons : pas de carton en trop à cause d'un arrondi flottant", () => {
  // 18,952... × 1,05 = 19,9 m² exactement 10 colis de 1,99
  const r = cartons({ rows: [{ a: String(19.9 / 1.05) }], mode: "m2", colis: 1.99, waste: .05 });
  assert.equal(r.boxes, 10);
});
test("cartons : valeurs vides, négatives ou aberrantes ignorées", () => {
  assert.equal(cartons({ rows: [{ a: "" }, { a: "-5" }, { a: "999999" }], mode: "m2", colis: 1.99, waste: .05 }).boxes, 0);
  assert.equal(roomArea({ l: "3", w: "" }, "dim"), 0);
});

const cfg = { ...CONFIG, slots: ["08:30", "15:00"], leadHours: 2, daysAhead: 5, openDays: [6, 0, 1, 2, 3, 4] };
test("réservation : le vendredi est fermé", () => {
  const days = openDays(cfg, new Date(2026, 9, 1, 7)); // jeudi 1er octobre 2026, 7 h
  assert.ok(days.every(d => d.getDay() !== 5));
  assert.equal(days.length, 5);
});
test("réservation : délai minimum de 2 h le jour même", () => {
  const now = new Date(2026, 9, 1, 13, 30);
  assert.deepEqual(freeSlots(new Date(2026, 9, 1), cfg, now.getTime()), []);
  assert.deepEqual(freeSlots(new Date(2026, 9, 1), cfg, new Date(2026, 9, 1, 12, 0).getTime()), ["15:00"]);
});
test("réservation : prochain créneau après la fermeture = jour ouvré suivant", () => {
  const n = nextSlot(cfg, new Date(2026, 9, 1, 18)); // jeudi soir → vendredi fermé → samedi
  assert.equal(n.day.getDay(), 6); assert.equal(n.slot, "08:30");
});
test("téléphone algérien", () => {
  assert.equal(normalizePhone("0549 50 68 57"), "0549506857");
  assert.equal(normalizePhone("+213 794 70 93 23"), "0794709323");
  assert.equal(normalizePhone("00213555123456"), "0555123456");
  assert.equal(normalizePhone("0212345678"), null);
  assert.equal(normalizePhone("05495068"), null);
});
test("validation de la réservation", () => {
  assert.deepEqual(validateBooking({ day: new Date(), slot: "08:30", name: "Karim", phone: "0661223344" }), []);
  assert.equal(validateBooking({}).length, 4);
});
test("message de réservation tronqué et complet", () => {
  const m = bookingMessage({ day: new Date(2026, 9, 3), slot: "09:30", name: "x".repeat(200), phone: "0661223344", project: "Maison", surface: "40", decors: [DECORS[0]] });
  assert.match(m, /Samedi 3 octobre à 9h30/);
  assert.match(m, /EL2863 Chêne Asgil miel/);
  assert.ok(!m.includes("x".repeat(61)));
});

test("quiz : cuisine → toujours le décor Aqua", () => {
  for (const style of ["warm", "light", "character", "timeless"]) for (const light of ["bright", "dim"])
    assert.equal(recommend({ room: "cuisine", light, style }, DECORS).ref, "EL2416");
});
test("quiz : la classe 31 n'est proposée qu'en chambre", () => {
  for (const q of QUESTIONS[0].opts.map(o => o[0])) for (const style of ["warm", "light", "character", "timeless"]) for (const light of ["bright", "dim"]) {
    const r = recommend({ room: q, light, style }, DECORS), d = DECORS.find(x => x.ref === r.ref);
    if (q !== "chambre") assert.equal(d.cl, 32, `${q}/${style}/${light}`);
    assert.ok(r.why.length >= 1);
  }
});
test("quiz : pièce sombre → pas le décor le plus foncé", () => {
  assert.notEqual(recommend({ room: "salon", light: "dim", style: "timeless" }, DECORS).ref, "EL1055");
});

test("catalogue cohérent : chaque décor a une pièce, des images et un colis", () => {
  for (const d of DECORS) {
    assert.ok(d.colis > 0 && d.specs.length > 5 && d.pdf);
    assert.ok(ROOMS.some(r => r.rec === d.ref), d.ref + " sans pièce recommandée");
  }
  assert.ok(FAQ.length >= 8);
});
