// Facture proforma SARL MYF, même mise en page que le modèle papier (proforma N 037/2026).
// Usage : node devis/proforma.cjs devis/exemple.json [sortie.pdf]
// Les calculs (totaux de ligne, total HT, TVA, TTC, montant en lettres) sont automatiques.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');
const { enLettres } = require('./lettres.cjs');

const r2 = x => Math.round(x * 100) / 100;
const fmt = (x, d = 2) => x.toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d }).replace(/ | /g, ' ').replace(',', '.');
const fmtQ = x => { const s = (Math.round(x * 1000) / 1000).toFixed(3).replace(/0$/, ''); return s; };
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const SOC = {
  nom: 'SARL M Y F', activite: 'IMPORT / EXPORT', adresse: 'Cite ONAB Lot 148 DAR EL BEIDA',
  tel: '00213 555 24 36 83', mobiles: 'Mob 0549 50 68 57 · WhatsApp 0794 70 93 23', mail: 'sarlmyf@yahoo.fr', ville: 'Dar El Beïda',
};

function calc(doc) {
  // Chaque ligne a soit un prix HT (puht), soit un prix TTC (pttc) : dans ce cas, le HT est déduit et le TTC tombe juste.
  const lignes = doc.lignes.map((l, i) => {
    const tva = l.tva ?? 19, ttc = l.pttc != null ? l.quantite * l.pttc : null;
    const puht = l.pttc != null ? l.pttc / (1 + tva / 100) : l.puht;
    return { code: l.code || 'K' + String(i + 1).padStart(3, '0'), unite: 'M2', ...l, tva, puht, ttcLigne: ttc, total: r2(l.quantite * puht) };
  });
  const ht = r2(lignes.reduce((s, l) => s + l.total, 0));
  const tva = lignes.every(l => l.ttcLigne != null)
    ? r2(r2(lignes.reduce((s, l) => s + l.ttcLigne, 0)) - ht)
    : r2(lignes.reduce((s, l) => s + l.total * l.tva / 100, 0));
  const pose = r2(doc.surcharge_pose || 0);
  const ttc = r2(ht + tva + pose);
  return { lignes, ht, tva, pose, ttc, lettres: enLettres(ttc) };
}

function html(doc, c) {
  const rows = c.lignes.map(l => `<tr><td class="code">${esc(l.code)}</td><td class="des">${esc(l.designation).replace(/\b(EL\d{4})\b/, '<b>$1</b>')}</td><td>${esc(l.unite)}</td><td>${fmt(l.tva)}</td><td>${fmtQ(l.quantite)}</td><td>${fmt(l.puht)}</td><td class="r">${fmt(l.total)}</td></tr>`).join('');
  const cl = doc.client;
  return `<!doctype html><meta charset="utf-8"><style>
@page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;font-family:Arial,"Liberation Sans","DejaVu Sans",sans-serif;font-size:11pt;color:#111}
.p{width:210mm;height:297mm;padding:18mm 16mm 16mm 18mm;position:relative}
h1{font-family:"Times New Roman","DejaVu Serif",serif;font-weight:bold;font-size:34pt;text-align:center;margin:0 0 14mm;letter-spacing:1px}
.soc{line-height:1.25}.soc p{margin:0}.soc .t{margin-top:4mm}
.date{position:absolute;right:30mm;top:58mm}
.cli{position:absolute;right:16mm;top:66mm;width:72mm;border:1.2px solid #111;padding:1.5mm 2mm;font-size:10.5pt;line-height:1.35}
.cli b{font-size:11pt}.cli td{vertical-align:top;padding:0 2mm 0 0}.cli .ad{font-size:8.5pt;font-weight:bold}
.num{margin:40mm 0 4mm 15mm}
table.l{width:100%;border-collapse:collapse;font-size:10.5pt}
table.l th{font-weight:normal;text-decoration:underline;border:1px solid #111;padding:1mm}
table.l td{border-left:1px solid #111;border-right:1px solid #111;text-align:center;padding:3mm 1mm}
table.l tr:last-child td{border-bottom:1px solid #111}table.l td.des{text-align:left;padding-left:2mm}table.l td.r{text-align:right;white-space:nowrap}table.l td.code{font-size:9.5pt}table.l th{white-space:nowrap}
.bas{display:flex;justify-content:space-between;margin-top:3mm}
.pay{margin:9mm 0 0 15mm;font-size:10.5pt}.pay p{margin:0 0 5mm}
table.t{border-collapse:collapse;width:68mm;font-size:10pt}table.t td{border:1px solid #111;padding:0.8mm 1mm}table.t td+td{text-align:right;width:33mm}
.small{font-size:8.5pt}.ttc td{padding:2.5mm 1mm}
.arr{margin:18mm 0 0 15mm;font-size:10.5pt}.arr b{display:block}
.sc{text-align:right;margin:12mm 14mm 0 0;font-size:10pt}
.dense td{padding:1.6mm 1mm!important;font-size:9.5pt}.dense+.bas .pay{margin-top:4mm}
</style><div class="p">
<h1>${SOC.nom}</h1>
<div class="soc"><p>${SOC.activite}</p><p>${SOC.adresse}</p><p class="t">Tel ${SOC.tel}</p><p>${SOC.mobiles}</p><p>mail&nbsp; ${SOC.mail}</p></div>
<div class="date">${SOC.ville} le &nbsp;&nbsp;&nbsp; ${esc(doc.date)}</div>
<div class="cli"><table><tr><td>NOM/R.S</td><td><b>${esc(cl.nom)}</b></td></tr><tr><td style="padding-top:4mm">Adresse</td><td class="ad" style="padding-top:4mm">${esc(cl.adresse)}</td></tr><tr><td>TEL</td><td>${esc(cl.tel)}</td></tr><tr><td>R.C N°</td><td>${esc(cl.rc)}</td></tr></table></div>
<div class="num">${esc(doc.titre || 'Facture proforma')} N ${esc(doc.numero)}</div>
<table class="l${c.lignes.length > 5 ? ' dense' : ''}"><tr><th style="width:8%"></th><th>Désignations</th><th style="width:7%">Unité</th><th style="width:9%;text-decoration:none">Taux TVA</th><th style="width:12%">Quantité</th><th style="width:12%">P.U.H.T</th><th style="width:15%">TOTAL</th></tr>${rows}</table>
<div class="bas"><div class="pay"><p>MODE DE PAIEMENT :</p><p>${esc(doc.paiement || 'A terme (Chèque ou Virement bancaire)')}</p></div>
<table class="t"><tr><td>Total HT</td><td>${fmt(c.ht)}</td></tr><tr><td>T.V.A 19%</td><td>${fmt(c.tva)}</td></tr><tr><td class="small">${esc(doc.libelle_pose || 'SURCHARGE POSE')}</td><td>${c.pose ? fmt(c.pose) : ''}</td></tr><tr class="ttc"><td>Total TTC</td><td>${fmt(c.ttc)}</td></tr></table></div>
<div class="arr"><b>${doc.titre ? 'Le présent ' + esc(doc.titre.toLowerCase()) + ' est arrêté' : 'La présente facture proforma est arrêtée'} à la somme de :</b>${c.lettres}</div>
<div class="sc">SERVICE COMMERCIAL</div>
</div>`;
}

(async () => {
  const src = process.argv[2] || path.join(__dirname, 'exemple.json');
  const doc = JSON.parse(fs.readFileSync(src, 'utf8'));
  const out = process.argv[3] || src.replace(/\.json$/, '.pdf');
  const c = calc(doc);
  const b = await chromium.launch(); const p = await b.newPage({ deviceScaleFactor: 3 });
  await p.setContent(html(doc, c)); await p.pdf({ path: out, format: 'A4', printBackground: true });
  await p.setViewportSize({ width: 794, height: 1123 }); await p.screenshot({ path: out.replace(/\.pdf$/, '.png') });
  await b.close();
  console.log(`${out} · HT ${fmt(c.ht)} · TVA ${fmt(c.tva)} · TTC ${fmt(c.ttc)}\n${c.lettres}`);
})();
