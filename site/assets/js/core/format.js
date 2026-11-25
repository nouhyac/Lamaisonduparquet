/* Fonctions pures de mise en forme et de sécurité (aucun accès au DOM : testables sous Node). */

const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;", "`": "&#96;" };
/** Échappe un texte avant de l'insérer dans du HTML. */
export const esc = v => String(v ?? "").replace(/[&<>"'`]/g, c => ESC[c]);
/** Tronque une saisie à n caractères. */
export const clip = (v, n) => String(v ?? "").slice(0, n);
/** Lit un nombre saisi à la française (« 14,5 »). Retourne 0 si invalide. */
export const parseNum = v => { const n = parseFloat(String(v ?? "").replace(/\s/g, "").replace(",", ".")); return Number.isFinite(n) && n > 0 ? n : 0; };
/** 1234.5 → « 1 234,5 » */
export const num = v => Number(v).toLocaleString("fr-FR", { maximumFractionDigits: 2 });
export const round2 = v => Math.round(v * 100) / 100;
export const hh = t => t.replace(/^0/, "").replace(":", "h");
export const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
/** « Chêne Asgil miel » → « Asgil miel », « Chêne du Nord naturel » → « Chêne du Nord » */
export const short = n => n.startsWith("Chêne du ") ? n.replace(" naturel", "") : n.replace("Chêne ", "");
export const JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
export const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
export const MOIS_C = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
export const dayLong = d => `${cap(JOURS[d.getDay()])} ${d.getDate()} ${MOIS[d.getMonth()]}`;
/** Lien WhatsApp avec message pré-rempli (le texte est encodé : aucune injection possible dans l'URL). */
export const waLink = (phone, msg) => "https://wa.me/" + String(phone).replace(/\D/g, "") + (msg ? "?text=" + encodeURIComponent(msg) : "");
