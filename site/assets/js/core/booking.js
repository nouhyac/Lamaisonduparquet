/* Réservation : créneaux disponibles, validation, message WhatsApp (logique pure). */
import { clip, dayLong, hh } from "./format.js";

export function slotDate(day, t) { const [h, m] = t.split(":").map(Number); const x = new Date(day); x.setHours(h, m, 0, 0); return x; }

/** Créneaux encore réservables un jour donné (délai minimum de leadHours). */
export function freeSlots(day, cfg, now = Date.now()) {
  const lim = now + cfg.leadHours * 3600e3;
  return cfg.slots.filter(t => slotDate(day, t).getTime() > lim);
}

/** Prochains jours d'ouverture ayant au moins un créneau libre. */
export function openDays(cfg, now = new Date()) {
  const out = [];
  for (let i = 0; out.length < cfg.daysAhead && i < 40; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    if (cfg.openDays.includes(d.getDay()) && freeSlots(d, cfg, now.getTime()).length) out.push(d);
  }
  return out;
}

/** Premier créneau libre : { day, slot } ou null. */
export function nextSlot(cfg, now = new Date()) {
  const d = openDays(cfg, now)[0];
  return d ? { day: d, slot: freeSlots(d, cfg, now.getTime())[0] } : null;
}

/** « Aujourd'hui », « Demain » ou le nom du jour. */
export function relDay(d, now = new Date()) {
  const t = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - t) / 864e5);
  return diff === 0 ? "Aujourd'hui" : diff === 1 ? "Demain" : dayLong(d).split(" ")[0];
}

/** Numéro mobile algérien : 05, 06 ou 07 + 8 chiffres (accepte +213 / 00213 / espaces). */
export function normalizePhone(v) {
  const t = String(v ?? "").replace(/[\s.()-]/g, "").replace(/^(?:\+|00)213/, "0");
  return /^0[5-7]\d{8}$/.test(t) ? t : null;
}

/** Liste des éléments manquants (vide si tout est bon). */
export function validateBooking({ day, slot, name, phone }) {
  const e = [];
  if (!day) e.push("le jour");
  if (!slot) e.push("l'heure");
  if (String(name ?? "").trim().length < 2) e.push("votre nom");
  if (!normalizePhone(phone)) e.push("un numéro de téléphone valide (05, 06 ou 07)");
  return e;
}

export function bookingMessage({ day, slot, name, phone, project, surface, decors }) {
  return `Bonjour, je souhaite réserver une visite au showroom.\n\n📅 ${dayLong(day)} à ${hh(slot)}\n👤 ${clip(String(name).trim(), 60)}\n📞 ${clip(String(phone).trim(), 20)}\n🏠 ${clip(project, 60)}${surface ? `\n📐 Environ ${clip(surface, 8)} m²` : ""}\n🪵 ${decors.length ? decors.map(x => x.ref + " " + x.n).join(", ") : "Voir la gamme en stock"}\n\nMerci de me confirmer le créneau.`;
}
