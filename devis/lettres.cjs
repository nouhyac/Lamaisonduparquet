// Montant en toutes lettres (orthographe traditionnelle, comme sur les factures), en dinars algériens.
const U = ["zéro","un","deux","trois","quatre","cinq","six","sept","huit","neuf","dix","onze","douze","treize","quatorze","quinze","seize"];
const D = { 20: "vingt", 30: "trente", 40: "quarante", 50: "cinquante", 60: "soixante" };
function sous100(n) {
  if (n <= 16) return U[n];
  if (n < 20) return "dix-" + U[n - 10];
  if (n < 70) { const d = Math.floor(n / 10) * 10, u = n % 10; return D[d] + (u === 0 ? "" : u === 1 ? " et un" : "-" + U[u]); }
  if (n < 80) return n === 71 ? "soixante et onze" : "soixante-" + sous100(n - 60);
  if (n === 80) return "quatre-vingts";
  return "quatre-vingt-" + sous100(n - 80);
}
function sous1000(n, finale = true) {
  const c = Math.floor(n / 100), r = n % 100;
  let s = c === 0 ? "" : c === 1 ? "cent" : U[c] + " cent" + (r === 0 && finale ? "s" : "");
  if (r) s += (s ? " " : "") + (r === 80 && !finale ? "quatre-vingt" : sous100(r));
  return s;
}
function entier(n) {
  if (n === 0) return "zéro";
  const out = []; const mds = Math.floor(n / 1e9), mns = Math.floor(n / 1e6) % 1000, ms = Math.floor(n / 1e3) % 1000, r = n % 1000;
  if (mds) out.push((mds === 1 ? "un" : sous1000(mds)) + (mds > 1 ? " milliards" : " milliard"));
  if (mns) out.push((mns === 1 ? "un" : sous1000(mns)) + (mns > 1 ? " millions" : " million"));
  if (ms) out.push(ms === 1 ? "mille" : sous1000(ms, false) + " mille");
  if (r) out.push(sous1000(r));
  return out.join(" ");
}
function enLettres(montant) {
  const cts = Math.round(montant * 100), da = Math.floor(cts / 100), c = cts % 100;
  let s = entier(da) + (da % 1e6 === 0 && da > 0 ? " de" : "") + (da > 1 ? " dinars" : " dinar");
  if (c) s += " et " + entier(c) + (c > 1 ? " centimes" : " centime");
  return s.charAt(0).toUpperCase() + s.slice(1);
}
module.exports = { enLettres };
