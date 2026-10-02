/* Quiz « votre décor en 3 questions » : règles de recommandation (logique pure).
   Règles métier :
   - cuisine ouverte ou entrée → toujours le décor Aqua (résistance à l'eau) ;
   - pièces de passage → classe 32 obligatoire (la classe 31 est réservée aux chambres) ;
   - pièce sombre → on évite le décor le plus foncé et on privilégie les tons clairs. */

export const QUESTIONS = [
  { id: "room", q: "Quelle pièce refaites-vous ?", opts: [["salon", "Salon ou séjour"], ["chambre", "Chambre"], ["cuisine", "Cuisine ouverte ou entrée"], ["salle-a-manger", "Salle à manger"], ["bureau", "Bureau"]] },
  { id: "light", q: "Votre pièce est plutôt…", opts: [["bright", "Lumineuse, bien exposée"], ["dim", "Peu lumineuse"]] },
  { id: "style", q: "Quelle ambiance voulez-vous ?", opts: [["warm", "Chaleureuse, couleur miel"], ["light", "Claire et douce"], ["character", "Du caractère, des nœuds"], ["timeless", "Intemporelle, brun moyen"]] },
];

const BY_STYLE = { warm: "EL2863", light: "EL2416", character: "EL2970", timeless: "EL1055" };

/**
 * @param {{room: string, light: string, style: string}} a
 * @param {object[]} decors catalogue
 * @returns {{ref: string, room: string, why: string[]}}
 */
export function recommend(a, decors) {
  const why = [];
  let ref = BY_STYLE[a.style] || "EL2863";
  if (a.room === "chambre" && a.style === "light") { ref = "EL1061"; why.push("En chambre, le Chêne Achensee (7 mm, classe 31) suffit, avec la garantie EGGER de 15 ans en usage domestique."); }
  if (a.room === "cuisine") { ref = "EL2416"; why.push("Cuisine ou entrée : la version Aqua résiste à l'eau pendant 24 heures."); }
  if (a.light === "dim" && ref === "EL1055") { ref = "EL2970"; why.push("Pièce peu lumineuse : un chêne naturel plus clair que le Bardolino évite l'effet sombre."); }
  const d = decors.find(x => x.ref === ref);
  if (a.room !== "chambre" && d && d.cl < 32) { ref = "EL2416"; why.push("Pièce de passage : nous recommandons la classe 32."); }
  const fin = decors.find(x => x.ref === ref);
  why.unshift(fin.d);
  return { ref, room: a.room, why };
}
