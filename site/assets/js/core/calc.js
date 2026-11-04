/* Calcul du nombre de cartons (logique pure). */
import { parseNum, round2 } from "./format.js";

export const MAX_ROOM_M2 = 5000;

/** Surface d'une pièce selon le mode de saisie ("m2" ou "dim"). Valeurs aberrantes ignorées. */
export function roomArea(row, mode) {
  const v = mode === "dim" ? parseNum(row.l) * parseNum(row.w) : parseNum(row.a);
  return v > 0 && v < MAX_ROOM_M2 ? v : 0;
}

/**
 * @param {{rows: object[], mode: "m2"|"dim", colis: number, waste: number}} p
 * @returns {{m2: number, m2Cut: number, boxes: number, m2Bought: number}}
 */
export function cartons({ rows, mode, colis, waste }) {
  const m2 = round2(rows.reduce((s, r) => s + roomArea(r, mode), 0));
  const m2Cut = round2(m2 * (1 + waste));
  // epsilon : évite qu'une erreur d'arrondi flottant ajoute un carton (ex. 19,9 / 1,99)
  const boxes = m2 > 0 ? Math.ceil(m2Cut / colis - 1e-9) : 0;
  return { m2, m2Cut, boxes, m2Bought: round2(boxes * colis) };
}
