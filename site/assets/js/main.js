/* ============ RÉGLAGES (modifiables) ============ */
const CONFIG = {
  whatsapp: "213549506857",
  phone: "0549 50 68 57",
  phone2: "0794 70 93 23",
  address: "La Maison du Parquet EGGER, Dar El Beïda (Alger)",
  place: "Showroom, Dar El Beïda",
  mapsQuery: "La Maison du Parquet EGGER Dar El Beida",
  openDays: [6, 0, 1, 2, 3, 4],     // 0 = dimanche … 6 = samedi (vendredi fermé)
  hoursLabel: "Samedi → jeudi · 8h00 – 16h00",
  slots: ["08:30", "09:30", "10:30", "11:30", "13:00", "14:00", "15:00"],
  leadHours: 2,
  daysAhead: 14,
  waste: 0.05,                      // marge de coupe du calculateur
  metaPixel: "",                    // ID Meta Pixel (facultatif)
  ga4: "",                          // ID Google Analytics 4 "G-XXXXXXX" (facultatif)
  siteUrl: "https://www.lamaisonduparquet.dz"
};
/* ================================================ */
const DECORS = [
  { ref: "EL2863", n: "Chêne Asgil miel", mm: 8, cl: 32, fin: "Sans chanfrein", aqua: false, line: "NatureSense Classic", colis: 1.99, d: "Un chêne doré et chaleureux, le plus accueillant de la collection.", ed: "Un décor au ton de bois chaleureux : des lames façon maison de campagne, couleur miel, dont les nuances rougeâtres créent un jeu de couleurs très chaleureux.", specs: [["Collection", "NatureSense Classic"], ["Épaisseur", "8 mm"], ["Classe d'usage", "32"], ["Format", "1 292 × 193 mm"], ["Bords", "Sans chanfrein"], ["Structure de surface", "Omnipore"], ["Système de pose", "CLIC it!"], ["Support", "Panneau HDF+"], ["Chauffage au sol", "Compatible"], ["Colis", "1,99 m² (8 lames)"], ["Écologie", "Environ 85 % de bois, sans PVC"], ["Labels", "Écolabel européen · PEFC"]], pdf: "fiches/Fiche_EGGER_EL2863.pdf" },
  { ref: "EL1061", n: "Chêne Achensee", mm: 7, cl: 31, fin: "Chanfreins 4V", aqua: false, line: "NatureSense Classic", colis: 2.49, d: "Un chêne clair et naturel qui agrandit visuellement la pièce.", ed: "Un décor de chêne brun clair. Les nœuds sombres donnent de la vie au décor ; il s'accorde avec les teintes naturelles et les bois clairs.", specs: [["Collection", "NatureSense Classic"], ["Épaisseur", "7 mm"], ["Classe d'usage", "31"], ["Format", "1 292 × 193 mm"], ["Bords", "Chanfreins 4V"], ["Structure de surface", "Omnipore"], ["Système de pose", "CLIC it!"], ["Support", "Panneau HDF+"], ["Chauffage au sol", "Compatible"], ["Colis", "2,49 m² (10 lames)"], ["Écologie", "Environ 85 % de bois, sans PVC"], ["Labels", "Écolabel européen · PEFC"], ["Garantie EGGER", "15 ans (usage domestique)"]], pdf: "fiches/Fiche_EGGER_EL1061.pdf" },
  { ref: "EL2970", n: "Chêne du Nord naturel", mm: 8, cl: 32, fin: "Chanfreins 4V", aqua: false, line: "NatureSense Classic", colis: 1.99, d: "Des nœuds, des veines : le vrai caractère du bois.", ed: "Un décor de chêne très naturel, dans une chaude teinte naturelle : une surface de sol authentique et chaleureuse.", specs: [["Collection", "NatureSense Classic"], ["Épaisseur", "8 mm"], ["Classe d'usage", "32"], ["Format", "1 292 × 193 mm"], ["Bords", "Chanfreins 4V"], ["Structure de surface", "Omnipore"], ["Système de pose", "CLIC it!"], ["Support", "Panneau HDF+"], ["Chauffage au sol", "Compatible"], ["Colis", "1,99 m² (8 lames)"], ["Écologie", "Environ 85 % de bois, sans PVC"], ["Labels", "Écolabel européen · PEFC"]], pdf: "fiches/Fiche_EGGER_EL2970.pdf" },
  { ref: "EL2416", n: "Chêne Melba beige", mm: 8, cl: 32, fin: "Chanfreins 4V", aqua: true, line: "NatureSense Aqua Classic", colis: 1.99, d: "Un beige doux et lumineux, le plus facile à marier. Version Aqua, résistante à l'eau.", ed: "Un chêne beige doux et lumineux, en version Aqua : il résiste à l'eau pendant 24 heures, pour la cuisine ouverte comme pour l'entrée.", specs: [["Collection", "NatureSense Aqua Classic"], ["Épaisseur", "8 mm"], ["Classe d'usage", "32"], ["Format", "1 292 × 193 mm"], ["Bords", "Chanfreins 4V"], ["Structure de surface", "Pores synchronisés"], ["Système de pose", "Aqua CLIC it!"], ["Résistance à l'eau", "24 heures"], ["Support", "Panneau HDF+"], ["Chauffage au sol", "Compatible"], ["Colis", "1,99 m² (8 lames)"], ["Écologie", "83 % de matières renouvelables, sans PVC"], ["Labels", "Écolabel européen"]], pdf: "fiches/Fiche_EGGER_EL2416.pdf" },
  { ref: "EL1055", n: "Chêne Bardolino", mm: 8, cl: 32, fin: "Sans chanfrein", aqua: false, line: "NatureSense Classic", colis: 1.99, d: "Ni trop clair, ni trop foncé : le chêne intemporel.", ed: "Un décor brun de style vintage, riche en jeux de couleurs. Les traits de scie lui donnent un aspect vécu et créatif, qui se marie avec des touches de couleur.", specs: [["Collection", "NatureSense Classic"], ["Épaisseur", "8 mm"], ["Classe d'usage", "32"], ["Format", "1 292 × 193 mm"], ["Bords", "Sans chanfrein"], ["Structure de surface", "Deepskin"], ["Système de pose", "CLIC it!"], ["Support", "Panneau HDF+"], ["Chauffage au sol", "Compatible"], ["Colis", "1,99 m² (8 lames)"], ["Écologie", "Environ 85 % de bois, sans PVC"], ["Labels", "Écolabel européen · PEFC"]], pdf: "fiches/Fiche_EGGER_EL1055.pdf" }
];
const ROOMS = [
  { id: "salon", n: "Salon", rec: "EL2863", note: "Un miel chaleureux pour les pièces à vivre. Il réchauffe les murs blancs, les textiles clairs et la pierre naturelle." },
  { id: "chambre", n: "Chambre", rec: "EL1061", note: "Clair et apaisant. En chambre, le 7 mm en classe 31 suffit largement, avec la garantie EGGER de 15 ans en usage domestique." },
  { id: "salle-a-manger", n: "Salle à manger", rec: "EL2970", note: "Ses nœuds apportent du caractère. Associez-le à une table en bois foncé et à des chaises noires." },
  { id: "cuisine", n: "Cuisine ouverte", rec: "EL2416", note: "Version Aqua : elle résiste à l'eau pendant 24 heures grâce au système Aqua CLIC it!. Le bon choix pour une cuisine ouverte sur le salon." },
  { id: "bureau", n: "Bureau", rec: "EL1055", note: "Ni trop clair, ni trop foncé : il s'accorde avec le mobilier noir comme avec le bois." }
];
const FAQ = [
  ["Peut-on vraiment le poser sur du carrelage ?", "Oui, si le carrelage est plan et bien fixé. Les lames se clipsent sur une sous-couche, sans colle et sans casser l'existant. Nous vérifions avec vous l'état de votre sol pendant la visite."],
  ["Combien de temps dure la pose ?", "Comptez une journée pour une pièce. Il n'y a pas de démolition ni de temps de séchage : la pièce est utilisable dès la fin de la pose."],
  ["Pourquoi une visite sur rendez-vous ?", "Pour qu'un conseiller soit disponible uniquement pour vous pendant 30 minutes : présentation des décors en stock, conseils selon vos pièces et devis établi sur place, sans attente."],
  ["Comment obtenir un devis ?", "Le devis est établi pendant la visite, au carton près : il dépend de vos pièces, du décor choisi, de la sous-couche et de la livraison. Utilisez le calculateur pour préparer votre métrage, ou apportez vos mesures."],
  ["Où se trouve le showroom ?", "À Dar El Beïda (Alger). Tapez « La Maison du Parquet EGGER Dar El Beïda » dans Google Maps ou utilisez le lien Itinéraire plus bas. Nous vous recevons du samedi au jeudi, de 8h00 à 16h00, sur rendez-vous."],
  ["Et dans la cuisine ou la salle de bain ?", "Dans une cuisine ouverte ou une entrée, choisissez le Chêne Melba beige (EL2416) en version Aqua : il résiste à l'eau pendant 24 heures. En salle de bain, où l'eau stagne, nous déconseillons le stratifié."],
  ["Que signifient les classes 31 et 32 ?", "C'est la résistance à l'usage selon la norme européenne. Classe 31 : usage domestique et commercial léger, parfait en chambre. Classe 32 : usage domestique intense et commercial normal (bureaux, boutiques), pour le salon, l'entrée ou la cuisine."],
  ["Où sont fabriqués les sols EGGER ?", "Dans les usines européennes du groupe EGGER. Les cartons en stock au showroom portent la mention Made in Germany. Les sols NatureSense sont composés en majorité de bois, sans PVC, et portent l'Écolabel européen."],
  ["Avez-vous d'autres modèles EGGER ?", "Oui, la gamme EGGER est large. Les décors présentés ici sont disponibles immédiatement, en stock. Venez découvrir le reste de la gamme au showroom, nous vous indiquons les disponibilités sur place."],
  ["Les couleurs des images sont-elles fidèles ?", "Nos rendus reprennent les visuels officiels EGGER. Mais la teinte d'un sol change avec la lumière de la pièce et le réglage de l'écran : venez voir les lames en vrai, à la lumière du jour, au showroom."],
  ["Livrez-vous hors d'Alger ?", "Oui, nous livrons partout en Algérie. Le délai et le coût dépendent de votre wilaya : ils figurent sur votre devis."]
];

const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
/* Sécurité : aucun style en ligne (compatible avec une CSP stricte). Les fonds d'image passent par data-bg, appliqués via le CSSOM. */
const SAFE_BG = /^img\/[a-z0-9-]+\.(webp|jpg)$/;
const paintBg = root => { (root.matches && root.matches("[data-bg]") ? [root] : []).concat([...(root.querySelectorAll ? root.querySelectorAll("[data-bg]") : [])]).forEach(el => { const u = el.getAttribute("data-bg"); if (SAFE_BG.test(u)) el.style.backgroundImage = `url("${u}")`; el.removeAttribute("data-bg"); }); };
new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => n.nodeType === 1 && paintBg(n)))).observe(document.documentElement, { childList: true, subtree: true });
/* Sécurité : tout texte saisi par le visiteur est échappé avant d'être réinjecté dans la page */
const esc = v => String(v).replace(/[&<>"'`]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;", "`": "&#96;" }[c]));
const clip = (v, n) => String(v).slice(0, n);
const JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"], MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const MOIS_C = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
const hh = t => t.replace(/^0/, "").replace(":", "h");
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const wa = msg => "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(msg);
const dec = r => DECORS.find(d => d.ref === r);
const short = n => n.startsWith("Chêne du ") ? n.replace(" naturel", "") : n.replace("Chêne ", "");
const num = v => v.toLocaleString("fr-FR", { maximumFractionDigits: 2 });
const WEBP = (() => { try { return document.createElement("canvas").toDataURL("image/webp").startsWith("data:image/webp"); } catch (_) { return false; } })();
const img = base => `img/${base}.${WEBP ? "webp" : "jpg"}`;
const CALM = matchMedia("(prefers-reduced-motion: reduce)").matches || (navigator.connection && navigator.connection.saveData);
const smooth = () => CALM ? "auto" : "smooth";
const ON_SITE = !!CONFIG.siteUrl && location.origin === new URL(CONFIG.siteUrl).origin;
const state = { day: null, slot: null, decors: new Set(), room: "salon", viz: "EL2863", hero: "EL2863", fiche: "EL2863" };
function track(ev, p) { try { if (window.fbq) fbq("track", ev, p || {}); if (window.gtag) gtag("event", ev === "Lead" ? "generate_lead" : ev === "Contact" ? "contact" : ev, p || {}); } catch (_) { } }

/* ---------- avant / après (accueil) ---------- */
function makeBA(root, knob, onSet) {
  const setPos = p => { p = Math.max(0, Math.min(100, p)); root.style.setProperty("--pos", p + "%"); knob.setAttribute("aria-valuenow", Math.round(p)); onSet && onSet(p); };
  const posFrom = e => { const r = root.getBoundingClientRect(); return (e.clientX - r.left) / r.width * 100; };
  let drag = false;
  root.addEventListener("pointerdown", e => { if (e.target.closest("a,.hero-dec")) return; drag = true; stopSweep(); root.setPointerCapture(e.pointerId); setPos(posFrom(e)); });
  root.addEventListener("pointermove", e => { if (drag) setPos(posFrom(e)); });
  root.addEventListener("pointerup", () => drag = false); root.addEventListener("pointercancel", () => drag = false);
  knob.addEventListener("keydown", e => { const v = +knob.getAttribute("aria-valuenow"); let n = null; if (e.key === "ArrowLeft" || e.key === "ArrowDown") n = v - 5; if (e.key === "ArrowRight" || e.key === "ArrowUp") n = v + 5; if (e.key === "Home") n = 0; if (e.key === "End") n = 100; if (n !== null) { e.preventDefault(); stopSweep(); setPos(n); } });
  return setPos;
}
let sweepRaf = null; const stopSweep = () => { if (sweepRaf) cancelAnimationFrame(sweepRaf); sweepRaf = null; };
const heroBa = $("#heroBa"), heroSet = makeBA(heroBa, $("#heroKnob"));
function sweep() {
  // le carrelage disparaît sous les yeux du visiteur : 100 % → 0 % puis retour à 45 %
  const seq = [[100, 0, 1900], [0, 45, 900]]; let i = 0, t0 = null;
  heroSet(100);
  const step = ts => { if (t0 === null) t0 = ts; const [a, b, d] = seq[i], k = Math.min(1, (ts - t0) / d), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; heroSet(a + (b - a) * e); if (k >= 1) { i++; t0 = null; if (i >= seq.length) { sweepRaf = null; return; } } sweepRaf = requestAnimationFrame(step); };
  setTimeout(() => { sweepRaf = requestAnimationFrame(step); }, 700);
}
function renderHero() {
  const d = dec(state.hero);
  $("#heroAfter").src = img("ba-" + d.ref.toLowerCase()); $("#heroAfter").alt = "Après : le même salon en parquet EGGER " + d.n;
  $("#heroTag").textContent = "Après · " + d.n;
  $$("#heroDec button").forEach(b => b.setAttribute("aria-checked", b.dataset.r === state.hero));
}
$("#heroDec").innerHTML = DECORS.map(d => `<button type="button" role="radio" data-r="${d.ref}" aria-checked="false"><i data-bg="${img("sw-" + d.ref.toLowerCase())}"></i>${short(d.n)}</button>`).join("");
$$("#heroDec button").forEach(b => b.onclick = () => { state.hero = b.dataset.r; renderHero(); stopSweep(); heroSet(35); track("ViewContent", { content_ids: [b.dataset.r] }); });
renderHero();
DECORS.forEach(x => { const i = new Image(); i.src = img("ba-" + x.ref.toLowerCase()); });
if (CALM) heroSet(45); else { const a = $("#heroAfter"); a.complete ? sweep() : a.addEventListener("load", sweep, { once: true }); }

/* ---------- visualiseur ---------- */
let front = "vizA";
function renderViz(anim) {
  const room = ROOMS.find(r => r.id === state.room), d = dec(state.viz), isRec = room.rec === d.ref;
  const cur = $("#" + front), nxt = $("#" + (front === "vizA" ? "vizB" : "vizA")), src = img(`v-${state.room}-${state.viz.toLowerCase()}`), alt = `${room.n} avec parquet EGGER ${d.n} (${d.ref})`;
  if (!anim || !cur.getAttribute("src")) { cur.src = src; cur.alt = alt; cur.classList.remove("out"); nxt.classList.add("out"); }
  else if (cur.getAttribute("src") !== src) { nxt.onload = () => { nxt.classList.remove("out"); cur.classList.add("out"); front = nxt.id; }; nxt.alt = alt; nxt.src = src; if (nxt.complete) nxt.onload(); }
  $("#vizRec").hidden = !isRec;
  $("#vizTagSw").style.backgroundImage = `url(${img("sw-" + d.ref.toLowerCase())})`;
  $("#vizTagTxt").textContent = `${d.n} · ${d.ref}`;
  $$("#rooms button").forEach(b => { const on = b.dataset.r === state.room; b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1; });
  $$("#swatches .swatch").forEach(b => { const on = b.dataset.r === state.viz; b.setAttribute("aria-checked", on); b.tabIndex = on ? 0 : -1; });
  $("#info").innerHTML = `<div class="ref">EGGER · Réf. ${d.ref}</div><h4>${d.n}</h4>
  <div class="chips"><span>${d.mm} mm</span><span>Classe ${d.cl}</span><span>${d.fin}</span>${d.aqua ? '<span class="aq">Aqua · 24 h</span>' : ''}</div>
  <p class="${isRec ? "note" : ""}">${isRec ? room.note : d.d + ` Idéal aussi en ${ROOMS.find(r => r.rec === d.ref).n.toLowerCase()}.`}</p>
  <div class="buy"><div class="stock"><i aria-hidden="true"></i><span><b>En stock</b>Disponible immédiatement</span></div><a class="btn b-red" href="#reserver" id="vizSee">Voir ce décor au showroom</a></div>
  <button type="button" class="lk" id="vizFiche">Fiche technique EGGER →</button>
  <a class="share" id="vizShare" href="#" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z"/></svg>Montrer ce rendu à un proche</a>`;
  $("#vizSee").onclick = () => { state.decors = new Set([d.ref]); renderPicks(); recap(); };
  $("#vizFiche").onclick = () => showFiche(d.ref, true);
  const link = ON_SITE ? "\n" + CONFIG.siteUrl + "/#v-" + state.room + "-" + state.viz.toLowerCase() : (CONFIG.siteUrl ? "\n" + CONFIG.siteUrl : "");
  $("#vizShare").href = "https://wa.me/?text=" + encodeURIComponent(`Regarde ce parquet EGGER ${d.n} (${d.ref}), en stock chez La Maison du Parquet à Dar El Beïda. WhatsApp ${CONFIG.phone}${link}`);
  DECORS.forEach(x => { const i = new Image(); i.src = img(`v-${state.room}-${x.ref.toLowerCase()}`); });
  if (anim) try { history.replaceState(null, "", `#v-${state.room}-${state.viz.toLowerCase()}`); } catch (_) { }
}
$("#rooms").innerHTML = ROOMS.map(r => `<button type="button" role="tab" data-r="${r.id}">${r.n}</button>`).join("");
$("#swatches").innerHTML = DECORS.map(d => `<button type="button" class="swatch" role="radio" data-r="${d.ref}" aria-label="${d.n}, ${d.ref}"><i data-bg="${img("sw-" + d.ref.toLowerCase())}"></i><span>${short(d.n)}</span><small>${d.ref}</small></button>`).join("");
function roving(container, sel) { container.addEventListener("keydown", e => { const items = $$(sel); const i = items.indexOf(document.activeElement); if (i < 0) return; let j; if (e.key === "ArrowRight" || e.key === "ArrowDown") j = (i + 1) % items.length; else if (e.key === "ArrowLeft" || e.key === "ArrowUp") j = (i - 1 + items.length) % items.length; else return; e.preventDefault(); items[j].focus(); items[j].click(); }); }
$$("#rooms button").forEach(b => b.onclick = () => { state.room = b.dataset.r; state.viz = ROOMS.find(r => r.id === state.room).rec; renderViz(true); });
$$("#swatches .swatch").forEach(b => b.onclick = () => { state.viz = b.dataset.r; renderViz(true); track("ViewContent", { content_ids: [b.dataset.r] }); });
$$("[data-show-cuisine]").forEach(a => a.addEventListener("click", () => { state.room = "cuisine"; state.viz = "EL2416"; renderViz(true); }));
roving($("#rooms"), "#rooms button"); roving($("#swatches"), "#swatches .swatch");
{ const m = location.hash.match(/^#v-([a-z-]+)-(el\d{4})$/); if (m && ROOMS.some(r => r.id === m[1]) && dec(m[2].toUpperCase())) { state.room = m[1]; state.viz = m[2].toUpperCase(); setTimeout(() => $("#visualiseur").scrollIntoView(), 50); } }
renderViz(false);

/* ---------- calculateur de cartons ---------- */
const calc = { mode: "m2", rows: [{ n: "Salon", a: "", l: "", w: "" }] };
$("#cDec").innerHTML = DECORS.map(d => `<option value="${d.ref}">${d.n} · ${d.ref} (colis ${num(d.colis)} m²)</option>`).join("");
function rowArea(r) { const f = v => parseFloat(String(v).replace(",", ".")) || 0; const v = calc.mode === "m2" ? f(r.a) : f(r.l) * f(r.w); return v > 0 && v < 5000 ? v : 0; }
function renderRows() {
  $("#rooms2").innerHTML = calc.rows.map((r, i) => calc.mode === "m2"
    ? `<div class="room-row" data-i="${i}"><div class="cf-row nm"><label for="rn${i}">Pièce</label><input id="rn${i}" data-k="n" maxlength="30" value="${esc(r.n)}"></div><div class="cf-row"><label for="ra${i}">Surface (m²)</label><input id="ra${i}" data-k="a" type="text" inputmode="decimal" autocomplete="off" maxlength="8" value="${esc(r.a)}" placeholder="ex. 24"></div><button type="button" class="rm" aria-label="Retirer ${esc(r.n)}" ${calc.rows.length < 2 ? "hidden" : ""}>×</button></div>`
    : `<div class="room-row dim" data-i="${i}"><div class="cf-row nm"><label for="rn${i}">Pièce</label><input id="rn${i}" data-k="n" maxlength="30" value="${esc(r.n)}"></div><div class="cf-row"><label for="rl${i}">Longueur (m)</label><input id="rl${i}" data-k="l" type="text" inputmode="decimal" autocomplete="off" maxlength="6" value="${esc(r.l)}" placeholder="5,2"></div><div class="cf-row"><label for="rw${i}">Largeur (m)</label><input id="rw${i}" data-k="w" type="text" inputmode="decimal" autocomplete="off" maxlength="6" value="${esc(r.w)}" placeholder="4,1"></div><button type="button" class="rm" aria-label="Retirer ${esc(r.n)}" ${calc.rows.length < 2 ? "hidden" : ""}>×</button></div>`).join("");
  calcOut();
}
function calcOut() {
  const d = dec($("#cDec").value), m2 = calc.rows.reduce((s, r) => s + rowArea(r), 0), m2c = m2 * (1 + CONFIG.waste), box = m2 > 0 ? Math.ceil(m2c / d.colis) : 0;
  $("#oM2").textContent = num(Math.round(m2 * 100) / 100) + " m²"; $("#oM2c").textContent = num(Math.round(m2c * 100) / 100) + " m²"; $("#oBox").textContent = box;
  return { d, m2, m2c, box };
}
$("#rooms2").addEventListener("input", e => { const row = e.target.closest(".room-row"); if (!row) return; calc.rows[+row.dataset.i][e.target.dataset.k] = e.target.value; calcOut(); if ($("#cErr").textContent) $("#cErr").textContent = ""; });
$("#rooms2").addEventListener("click", e => { if (!e.target.classList.contains("rm")) return; calc.rows.splice(+e.target.closest(".room-row").dataset.i, 1); renderRows(); });
$("#addRoom").onclick = () => { const names = ["Chambre", "Séjour", "Couloir", "Bureau", "Entrée", "Chambre 2"]; calc.rows.push({ n: names[(calc.rows.length - 1) % names.length], a: "", l: "", w: "" }); renderRows(); $$("#rooms2 .room-row").pop().querySelector("input[data-k=a],input[data-k=l]").focus(); };
$$(".cf-mode button").forEach(b => b.onclick = () => { calc.mode = b.dataset.mode; $$(".cf-mode button").forEach(x => x.setAttribute("aria-checked", x === b)); renderRows(); });
$("#cDec").onchange = calcOut;
$("#calcSend").addEventListener("click", ev => {
  const o = calcOut();
  if (!o.m2) { ev.preventDefault(); $("#cErr").textContent = "Indiquez au moins une surface pour calculer vos cartons."; $("#rooms2 input[data-k=a],#rooms2 input[data-k=l]").focus(); return; }
  const lines = calc.rows.filter(r => rowArea(r) > 0).map(r => `• ${clip(r.n || "Pièce", 30)} : ${num(Math.round(rowArea(r) * 100) / 100)} m²`).join("\n");
  $("#calcSend").href = wa(`Bonjour, je souhaite un devis pour du parquet EGGER.\n\n🪵 ${o.d.n} (${o.d.ref})\n${lines}\n📐 Total : ${num(Math.round(o.m2 * 100) / 100)} m², soit ${num(Math.round(o.m2c * 100) / 100)} m² avec coupe\n📦 Estimation : ${o.box} cartons de ${num(o.d.colis)} m²\n\nMerci de me recontacter.`);
  track("Lead", { content_name: "calculateur", value: o.box });
});
renderRows();

/* ---------- collection ---------- */
$("#cards").innerHTML = DECORS.map(d => { const room = ROOMS.find(r => r.rec === d.ref); return `<article class="cardp" data-ref="${d.ref}"><button class="im" type="button" data-fiche="${d.ref}" aria-label="Fiche technique ${d.n}" data-bg="${img("sw-" + d.ref.toLowerCase())}"></button><div class="bd"><div class="ref">${d.ref} · ${d.line.replace("NatureSense ", "")}</div><h3>${d.n}</h3><div class="sp">${d.mm} mm · classe ${d.cl} · ${d.fin}${d.aqua ? " · Aqua" : ""}</div><div class="sp">Pièce idéale : ${room.n.toLowerCase()}</div><div class="av"><i aria-hidden="true"></i>En stock</div><button class="lk" type="button" data-fiche="${d.ref}">Fiche technique</button><button class="lk lk2" type="button" data-show="${d.ref}" data-room="${room.id}">Voir dans le visualiseur →</button></div></article>`; }).join("");
$$("[data-show]").forEach(b => b.onclick = () => { state.room = b.dataset.room; state.viz = b.dataset.show; renderViz(true); $("#visualiseur").scrollIntoView({ behavior: smooth() }); });
function showFiche(ref, scroll) {
  const d = dec(ref), room = ROOMS.find(r => r.rec === d.ref); state.fiche = ref;
  $$("#cards .cardp").forEach(c => c.classList.toggle("on", c.dataset.ref === ref));
  $("#fiche").innerHTML = `<div class="f-img"><div class="plank" role="img" aria-label="Lame ${d.n}" data-bg="${img("sw-" + d.ref.toLowerCase())}"></div><img src="${img(`v-${room.id}-${d.ref.toLowerCase()}`)}" alt="${room.n} avec parquet EGGER ${d.n}" width="800" height="1000" loading="lazy" decoding="async"></div>
  <div><div class="ref">EGGER · ${d.line} · Réf. ${d.ref}</div><h3>${d.n}</h3>
  <div class="stock"><i aria-hidden="true"></i><span><b>En stock</b>Disponible immédiatement</span></div>
  <p class="ed">${d.ed}</p>
  <h4>Fiche technique</h4><dl class="spec">${d.specs.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>
  <div class="cta"><a class="btn b-red" href="#reserver" id="ficheSee">Voir ce décor au showroom</a><a class="btn b-line" href="#calcul" id="ficheCalc">Calculer mes cartons</a>${d.pdf ? `<a class="btn b-line" href="${d.pdf}" target="_blank" rel="noopener noreferrer">Fiche PDF</a>` : ""}</div></div>`;
  $("#ficheSee").onclick = () => { state.decors = new Set([d.ref]); renderPicks(); recap(); };
  $("#ficheCalc").onclick = () => { $("#cDec").value = d.ref; calcOut(); };
  if (scroll) $("#fiche").scrollIntoView({ behavior: smooth(), block: "start" });
}
$$("[data-fiche]").forEach(b => b.onclick = () => showFiche(b.dataset.fiche, true));
showFiche(DECORS[0].ref, false);

/* ---------- FAQ ---------- */
$("#faqList").innerHTML = FAQ.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("");
{ const s = document.createElement("script"); s.type = "application/ld+json"; s.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) }); document.head.appendChild(s); }

/* ---------- réservation ---------- */
function slotDate(day, t) { const [h, m] = t.split(":").map(Number); const x = new Date(day); x.setHours(h, m, 0, 0); return x; }
function freeSlots(d) { const lim = Date.now() + CONFIG.leadHours * 3600e3; return CONFIG.slots.filter(t => slotDate(d, t).getTime() > lim); }
function openDays() { const out = [], now = new Date(); for (let i = 0; out.length < CONFIG.daysAhead && i < 40; i++) { const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i); if (!CONFIG.openDays.includes(d.getDay())) continue; if (freeSlots(d).length) out.push(d); } return out; }
function renderDays() {
  const ds = openDays();
  $("#days").innerHTML = ds.map((d, k) => `<button type="button" class="day" data-k="${k}" aria-pressed="${!!state.day && +state.day === +d}" aria-label="${cap(JOURS[d.getDay()])} ${d.getDate()} ${MOIS[d.getMonth()]}"><small>${JOURS[d.getDay()].slice(0, 3)}</small><b>${d.getDate()}</b><span>${MOIS_C[d.getMonth()]}</span></button>`).join("");
  $$("#days .day").forEach(b => b.onclick = () => { state.day = ds[+b.dataset.k]; if (state.slot && !freeSlots(state.day).includes(state.slot)) state.slot = null; renderDays(); renderSlots(); recap(); });
  return ds;
}
function renderSlots() { const d = state.day, free = d ? freeSlots(d) : []; $("#slots").innerHTML = CONFIG.slots.map(t => `<button type="button" class="slot" data-t="${t}" aria-pressed="${state.slot === t}" ${free.includes(t) ? "" : "disabled"}>${hh(t)}</button>`).join(""); $$("#slots .slot:not(:disabled)").forEach(b => b.onclick = () => { state.slot = b.dataset.t; renderSlots(); recap(); }); }
function renderPicks() { $("#picks").innerHTML = DECORS.map(d => `<button type="button" class="pick" data-r="${d.ref}" aria-pressed="${state.decors.has(d.ref)}"><i data-bg="${img("sw-" + d.ref.toLowerCase())}"></i>${short(d.n)}</button>`).join(""); $$("#picks .pick").forEach(b => b.onclick = () => { const r = b.dataset.r; state.decors.has(r) ? state.decors.delete(r) : state.decors.add(r); renderPicks(); recap(); }); }
function whenTxt() { if (!state.day) return "Choisissez un jour"; const d = state.day, base = `${cap(JOURS[d.getDay()])} ${d.getDate()} ${MOIS[d.getMonth()]}`; return state.slot ? `${base} <em>à ${hh(state.slot)}</em>` : base + ` <em>· choisissez l'heure</em>`; }
function recap() { $("#rWhen").innerHTML = whenTxt(); $("#rPlace").textContent = CONFIG.place; const sel = DECORS.filter(d => state.decors.has(d.ref)); $("#rDec").textContent = sel.length ? sel.map(d => short(d.n)).join(", ") : "Toute la gamme en stock"; }
function message() { const d = state.day, sel = DECORS.filter(x => state.decors.has(x.ref)), s = $("#bSurf").value; return `Bonjour, je souhaite réserver une visite au showroom.\n\n📅 ${cap(JOURS[d.getDay()])} ${d.getDate()} ${MOIS[d.getMonth()]} à ${hh(state.slot)}\n👤 ${clip($("#bName").value.trim(), 60)}\n📞 ${clip($("#bTel").value.trim(), 20)}\n🏠 ${$("#bProj").value}${s ? `\n📐 Environ ${clip(s, 8)} m²` : ""}\n🪵 ${sel.length ? sel.map(x => x.ref + " " + x.n).join(", ") : "Voir la gamme en stock"}\n\nMerci de me confirmer le créneau.`; }
function validate() { const e = []; if (!state.day) e.push("le jour"); if (!state.slot) e.push("l'heure"); if ($("#bName").value.trim().length < 2) e.push("votre nom"); const t = $("#bTel").value.replace(/[\s.-]/g, "").replace(/^\+?213/, "0"); if (!/^0[5-7]\d{8}$/.test(t)) e.push("un numéro de téléphone valide (05, 06 ou 07)"); return e; }
$("#bSend").addEventListener("click", ev => {
  const e = validate();
  if (e.length) { ev.preventDefault(); $("#bErr").textContent = "Il manque : " + e.join(", ") + "."; if (!state.day || !state.slot) $("#reserver").scrollIntoView({ behavior: smooth() }); else $("#bName").focus(); return; }
  $("#bErr").textContent = ""; $("#bSend").href = wa(message()); $("#recap").classList.add("sent"); track("Lead", { content_name: "visite" });
});
["bName", "bTel", "bSurf", "bProj"].forEach(id => $("#" + id).addEventListener("input", () => { recap(); if ($("#bErr").textContent && !validate().length) $("#bErr").textContent = ""; }));
$("#proBtn").addEventListener("click", () => { $("#bProj").selectedIndex = 2; });
{ const ds = openDays(); if (ds.length) state.day = ds[0]; }
renderDays(); renderSlots(); renderPicks(); recap();

/* ---------- contact, carte, vidéo, navigation ---------- */
$("#cHours").textContent = CONFIG.hoursLabel;
const MAPS = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(CONFIG.mapsQuery);
$("#cAddr").innerHTML = `<span>${CONFIG.address}</span><a class="maplink" href="${MAPS}" target="_blank" rel="noopener noreferrer">Itinéraire Google Maps →</a>`;
if (ON_SITE) { const mb = $("#mapBox"); mb.innerHTML = `<iframe title="Plan d'accès au showroom" src="https://www.google.com/maps?q=${encodeURIComponent(CONFIG.mapsQuery)}&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`; mb.hidden = false; }
const hi = wa("Bonjour, je souhaite des informations sur les parquets EGGER.");
$$("#waContact,#waBar,#waFloat").forEach(a => { a.href = hi; a.addEventListener("click", () => track("Contact")); });
$$("[data-copy]").forEach(b => b.onclick = () => { try { navigator.clipboard.writeText(b.dataset.copy).then(() => { b.textContent = "Copié"; }, () => { }); } catch (_) { } });
$("#yr").textContent = new Date().getFullYear();
{ const sv = $("#showVid"); if (sv && !CALM && "IntersectionObserver" in window) new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { sv.preload = "auto"; sv.play().catch(() => { }); } else sv.pause(); }), { threshold: .25 }).observe(sv); }
if ("IntersectionObserver" in window) { const links = $$(".nav a"); const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach(a => a.setAttribute("aria-current", a.getAttribute("href") === "#" + e.target.id)); }), { rootMargin: "-45% 0px -50% 0px" }); ["visualiseur", "calcul", "collection", "showroom", "faq"].forEach(id => { const el = document.getElementById(id); if (el) io.observe(el); }); }

/* ---------- mesure d'audience (facultatif) ---------- */
if (CONFIG.metaPixel) { !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js'); fbq('init', CONFIG.metaPixel); fbq('track', 'PageView'); }
if (CONFIG.ga4) { const s = document.createElement("script"); s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + CONFIG.ga4; document.head.appendChild(s); window.dataLayer = window.dataLayer || []; window.gtag = function () { dataLayer.push(arguments); }; gtag("js", new Date()); gtag("config", CONFIG.ga4); }
