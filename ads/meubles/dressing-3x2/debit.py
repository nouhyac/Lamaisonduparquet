"""Dressing en L 3 x 2 m, panneaux 17 mm : liste de coupe, calepinage, quincaillerie, modèle SketchUp.

Usage : python3 debit.py <dossier de sortie>
Produit : debit-dressing.xlsx, Dressing-3x2-debit.pdf, fiche-*.png, calepinage.png,
          dressing-3x2.dae (SketchUp Pro : Fichier > Importer > COLLADA).

Toutes les pièces viennent d'un seul modèle 3D (une boîte par panneau) : la liste de coupe
et le modèle SketchUp ne peuvent donc pas se contredire. Pour changer une cote, modifier
les constantes ci-dessous et relancer.
"""
import sys, os
from collections import OrderedDict
from PIL import Image, ImageDraw, ImageFont

OUT = sys.argv[1] if len(sys.argv) > 1 else "."
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONTB = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

# ---------- Cotes (mm) ----------
MODE = os.environ.get("MODE", "L")   # "L" : dressing en L ; "meuble" : un seul meuble 3 m × 2 m de haut
EP = 17                      # panneau mélaminé 17 mm
H = 2580 if MODE == "L" else 2000   # hauteur des meubles
SOCLE = 80                   # plinthe
DF = 580                     # profondeur meuble mur du fond (3 m)
DG = 400                     # profondeur meuble mur gauche (2 m)
LONG_FOND = 3000
COLS_FOND = [("A", "Double penderie", 1000), ("B", "Étagères", 500), ("C", "Penderie longue", 800), ("D", "Tiroirs + penderie", None)]
Y_RET0, Y_RET1 = 600, 1950   # retour mur gauche : de 600 (devant le meuble du fond) à 1950 (50 mm de la sortie)
Z_RANGEE = 2150              # tablette de la rangée haute (mur du fond)
SHEET = (2800, 2070)         # format panneau
TRAIT, ROGNE = 4, 10
DECOR = "EGGER U156 ST9 Beige sable 17 mm"
TITRE = "DRESSING EN L 3 × 2 m" if MODE == "L" else "MEUBLE DRESSING 3 m × 2 m (H)"
NOM = "Dressing-3x2" if MODE == "L" else "Meuble-3m-x-2m"

P = []   # (module, pièce, x0, y0, z0, dx, dy, dz, chant_ml_par_pièce, chant_txt)

def box(mod, nom, x0, y0, z0, dx, dy, dz, chant=0, txt="—"):
    P.append((mod, nom, x0, y0, z0, dx, dy, dz, chant, txt))

def tiroir(mod, axe, a, W, z0, prof, devant):
    """Tiroir à coulisses à billes (12,5 mm par côté) : façade + caisson 17 mm."""
    hf = 241 if prof == 500 else 240
    bw = W - 26                  # largeur hors tout du caisson
    if axe == "x":   # mur du fond, façade face +y
        box(mod, "Façade tiroir", a + 2, devant - EP, z0 + 2, W - 4, EP, hf, 2 * (W - 4 + hf) / 1000, "4 côtés")
        box(mod, "Côté de tiroir", a + 13, devant - EP - prof, z0 + 20, EP, prof, 180, prof / 1000, "1 chant (dessus)")
        box(mod, "Côté de tiroir", a + 13 + bw - EP, devant - EP - prof, z0 + 20, EP, prof, 180, prof / 1000, "1 chant (dessus)")
        box(mod, "Avant / arrière de tiroir", a + 13 + EP, devant - EP - EP, z0 + 20, bw - 2 * EP, EP, 180, (bw - 2 * EP) / 1000, "1 chant (dessus)")
        box(mod, "Avant / arrière de tiroir", a + 13 + EP, devant - EP - prof, z0 + 20, bw - 2 * EP, EP, 180, (bw - 2 * EP) / 1000, "1 chant (dessus)")
        box(mod, "Fond de tiroir", a + 13, devant - EP - prof, z0 + 3, bw, prof, EP)
    else:            # mur gauche, façade face +x
        box(mod, "Façade tiroir", devant - EP, a + 2, z0 + 2, EP, W - 4, hf, 2 * (W - 4 + hf) / 1000, "4 côtés")
        box(mod, "Côté de tiroir", devant - EP - prof, a + 13, z0 + 20, prof, EP, 180, prof / 1000, "1 chant (dessus)")
        box(mod, "Côté de tiroir", devant - EP - prof, a + 13 + bw - EP, z0 + 20, prof, EP, 180, prof / 1000, "1 chant (dessus)")
        box(mod, "Avant / arrière de tiroir", devant - EP - EP, a + 13 + EP, z0 + 20, EP, bw - 2 * EP, 180, (bw - 2 * EP) / 1000, "1 chant (dessus)")
        box(mod, "Avant / arrière de tiroir", devant - EP - prof, a + 13 + EP, z0 + 20, EP, bw - 2 * EP, 180, (bw - 2 * EP) / 1000, "1 chant (dessus)")
        box(mod, "Fond de tiroir", devant - EP - prof, a + 13, z0 + 3, prof, bw, EP)

Q = OrderedDict()   # quincaillerie
def q(k, n): Q[k] = Q.get(k, 0) + n

def construire():
    # ===== Mur du fond 3000 =====
    x = 0; cols = []
    for i, (rep, nom, w) in enumerate(COLS_FOND):
        box("Fond", "Montant", x, 0, 0, EP, DF, H, H / 1000, "1 chant (avant)"); x += EP
        if w is None: w = LONG_FOND - EP - x
        cols.append((rep, nom, x, w)); x += w
    box("Fond", "Montant", x, 0, 0, EP, DF, H, H / 1000, "1 chant (avant)")
    assert x + EP == LONG_FOND, x
    for rep, nom, a, W in cols:
        m = f"Fond {rep}"
        box(m, "Plinthe", a, DF - 37, 0, W, EP, SOCLE)
        box(m, "Fond bas (tablette fixe)", a, 0, SOCLE, W, DF, EP, W / 1000, "1 chant (avant)")
        if MODE == "L": box(m, "Tablette rangée haute (fixe)", a, 0, Z_RANGEE, W, DF, EP, W / 1000, "1 chant (avant)")
        box(m, "Dessus", a, 0, H - EP, W, DF, EP, W / 1000, "1 chant (avant)")
        box(m, "Traverse de fixation murale", a, 0, H - EP - 100, W, EP, 100)
        q("Ruban LED 24 V + profil alu (ml)", round(W / 1000, 2)); q("Taquets étagère", 0)
        if rep == "A":
            box(m, "Tablette mi-hauteur (fixe)", a, 0, 1120 if MODE == "L" else 960, W, DF, EP, W / 1000, "1 chant (avant)")
            q(f"Tringle ovale alu noir {W - 2} mm", 2); q("Support de tringle", 4)
        if rep == "B":
            for z in (410, 740, 1070, 1400, 1730):
                box(m, "Étagère mobile", a + 1, 0, z, W - 2, DF - 20, EP, (W - 2) / 1000, "1 chant (avant)")
            q("Taquets étagère", 5 * 4)
        if rep == "C":
            q(f"Tringle ovale alu noir {W - 2} mm", 1); q("Support de tringle", 2)
        if rep == "D":
            box(m, "Tablette au-dessus des tiroirs (fixe)", a, 0, 1080, W, DF, EP, W / 1000, "1 chant (avant)")
            for k in range(4): tiroir(m, "x", a, W, SOCLE + EP + k * 245, 500, DF)
            q("Coulisses à billes 500 mm sortie totale (paire)", 4); q("Poignée noire 128 mm", 4)
            q(f"Tringle ovale alu noir {W - 2} mm", 1); q("Support de tringle", 2)
    if MODE != "L":
        q("Équerre de fixation murale", 6); q("Driver LED 24 V 30 W + interrupteur", 1); return
    # ===== Mur gauche (retour) =====
    y = Y_RET0; comps = []
    for i, (rep, nom, w) in enumerate([("E", "3 tiroirs + étagères", 650), ("F", "Chaussures", None)]):
        box("Gauche", "Montant", 0, y, 0, DG, EP, H, H / 1000, "1 chant (avant)"); y += EP
        if w is None: w = Y_RET1 - EP - y
        comps.append((rep, nom, y, w)); y += w
    box("Gauche", "Montant", 0, y, 0, DG, EP, H, H / 1000, "1 chant (avant)")
    for rep, nom, a, W in comps:
        m = f"Gauche {rep}"
        box(m, "Plinthe", DG - 37, a, 0, EP, W, SOCLE)
        box(m, "Fond bas (tablette fixe)", 0, a, SOCLE, DG, W, EP, W / 1000, "1 chant (avant)")
        box(m, "Dessus", 0, a, H - EP, DG, W, EP, W / 1000, "1 chant (avant)")
        box(m, "Traverse de fixation murale", 0, a, H - EP - 100, EP, W, 100)
        q("Ruban LED 24 V + profil alu (ml)", round(W / 1000, 2))
        if rep == "E":
            box(m, "Tablette au-dessus des tiroirs (fixe)", 0, a, 830, DG, W, EP, W / 1000, "1 chant (avant)")
            for k in range(3): tiroir(m, "y", a, W, SOCLE + EP + k * 244, 350, DG)
            for z in (1150, 1470, 1790, 2110):
                box(m, "Étagère mobile", 0, a + 1, z, DG - 20, W - 2, EP, (W - 2) / 1000, "1 chant (avant)")
            q("Coulisses à billes 350 mm sortie totale (paire)", 3); q("Poignée noire 128 mm", 3); q("Taquets étagère", 16)
        if rep == "F":
            for k in range(9):
                box(m, "Étagère chaussures", 0, a + 1, 330 + 250 * k, DG - 20, W - 2, EP, (W - 2) / 1000, "1 chant (avant)")
            q("Taquets étagère", 36)
    q("Équerre de fixation murale", 12); q("Vis d'assemblage Confirmat 7×50", 0); q("Driver LED 24 V 60 W + interrupteur", 1)

def liste():
    """Regroupe les pièces identiques : (module, pièce, L, l) -> qté. L = plus grande cote."""
    g = OrderedDict()
    for mod, nom, x0, y0, z0, dx, dy, dz, ch, txt in P:
        d = sorted([dx, dy, dz], reverse=True)
        assert d[2] == EP, (mod, nom, d)
        L, l = round(d[0]), round(d[1])
        mm = mod.split(" ")[0] if nom == "Montant" else mod
        k = (mm, nom, L, l, txt)
        g[k] = g.get(k, [0, 0]); g[k][0] += 1; g[k][1] += ch
    rows = []
    for i, ((mod, nom, L, l, txt), (n, ch)) in enumerate(g.items(), 1):
        rows.append((f"P{i:02d}", mod, nom, L, l, n, txt, round(ch, 2)))
    return rows

def calepinage(rows):
    items = []
    for rep, mod, nom, L, l, n, txt, ch in rows:
        items += [(L, l, rep)] * n
    items.sort(key=lambda x: (-x[0], -x[1]))
    Wu, Hu = SHEET[0] - 2 * ROGNE, SHEET[1] - 2 * ROGNE
    sheets = []
    for a, b, lab in items:
        placed = False
        for sh in sheets:
            for band in sh["bands"]:
                for pa, pb in ((a, b), (b, a)):   # décor uni : rotation permise
                    if pb <= band["h"] and band["x"] + pa <= Wu:
                        band["items"].append((band["x"], band["y"], pa, pb, lab)); band["x"] += pa + TRAIT; placed = True; break
                if placed: break
            if placed: break
            for pa, pb in ((a, b), (b, a)):
                if pa <= Wu and sh["y"] + pb <= Hu:
                    sh["bands"].append({"y": sh["y"], "h": pb, "x": pa + TRAIT, "items": [(0, sh["y"], pa, pb, lab)]}); sh["y"] += pb + TRAIT; placed = True; break
            if placed: break
        if not placed:
            pa, pb = (a, b) if a <= Wu else (b, a)
            sheets.append({"y": pb + TRAIT, "bands": [{"y": 0, "h": pb, "x": pa + TRAIT, "items": [(0, 0, pa, pb, lab)]}]})
    return sheets

def dessine_calepinage(sheets, path):
    f, fb = ImageFont.truetype(FONT, 13), ImageFont.truetype(FONTB, 22)
    s = 0.25; sw, shh = int(SHEET[0] * s), int(SHEET[1] * s)
    cols = 2; nr = (len(sheets) + cols - 1) // cols
    im = Image.new("RGB", (cols * (sw + 40) + 40, nr * (shh + 70) + 90), "white"); dr = ImageDraw.Draw(im)
    dr.text((40, 20), f"Calepinage · {DECOR} · panneau {SHEET[0]}×{SHEET[1]} · trait {TRAIT} mm · rognage {ROGNE} mm", font=fb, fill=(0, 0, 0))
    for k, sh in enumerate(sheets):
        x0, y0 = 40 + (k % cols) * (sw + 40), 100 + (k // cols) * (shh + 70)
        surf = sum(a * b for bd in sh["bands"] for (_, _, a, b, _) in bd["items"]) / (SHEET[0] * SHEET[1])
        dr.text((x0, y0 - 30), f"Panneau {k + 1}/{len(sheets)} · utilisé {surf * 100:.0f} %", font=fb, fill=(20, 20, 20))
        dr.rectangle([x0, y0, x0 + sw, y0 + shh], outline=(0, 0, 0), width=2, fill=(245, 245, 245))
        for bd in sh["bands"]:
            for (x, y, a, b, lab) in bd["items"]:
                X, Y = x0 + (x + ROGNE) * s, y0 + (y + ROGNE) * s
                dr.rectangle([X, Y, X + a * s, Y + b * s], fill=(205, 189, 165), outline=(226, 0, 26))
                if a * s > 34 and b * s > 15: dr.text((X + 3, Y + 1), lab, font=f, fill=(20, 20, 20))
                if a * s > 70 and b * s > 30: dr.text((X + 3, Y + 15), f"{a}×{b}", font=f, fill=(60, 60, 60))
    im.save(path)

def fiches(rows, nb_feuilles, out):
    """Liste de coupe lisible sur téléphone (PNG A4) ; renvoie les chemins."""
    f, fb, ft = ImageFont.truetype(FONT, 22), ImageFont.truetype(FONTB, 22), ImageFont.truetype(FONTB, 38)
    W, Hh, per = 1654, 2339, 52
    pages = [rows[i:i + per] for i in range(0, len(rows), per)]
    paths = []
    tot_p = sum(r[5] for r in rows); tot_ch = sum(r[7] for r in rows)
    for pi, pg in enumerate(pages):
        im = Image.new("RGB", (W, Hh), "white"); d = ImageDraw.Draw(im)
        d.rectangle([60, 60, 72, 140], fill=(226, 0, 26))
        d.text((90, 58), TITRE + " · LISTE DE COUPE", font=ft, fill=(0, 0, 0))
        d.text((90, 108), f"{DECOR} · cotes finies en mm · page {pi + 1}/{len(pages)}", font=f, fill=(80, 80, 80))
        cx = [60, 150, 400, 870, 990, 1100, 1170, 1430]
        hd = ["Rep.", "Module", "Pièce", "Long.", "Larg.", "Qté", "Chant", "ml"]
        y = 180; d.rectangle([60, y - 6, W - 60, y + 32], fill=(26, 26, 26))
        for c, t in zip(cx, hd): d.text((c + 6, y), t, font=fb, fill=(255, 255, 255))
        y += 42
        for i, r in enumerate(pg):
            if i % 2: d.rectangle([60, y - 4, W - 60, y + 30], fill=(244, 241, 236))
            vals = [r[0], r[1], r[2], str(r[3]), str(r[4]), str(r[5]), r[6].replace("1 chant ", ""), f"{r[7]:.2f}" if r[7] else "—"]
            for c, t in zip(cx, vals): d.text((c + 6, y), t, font=fb if c == cx[0] else f, fill=(20, 20, 20))
            y += 38
        if pi == len(pages) - 1:
            y += 20
            for t in [f"Total : {tot_p} pièces · chant ABS 1 mm ≈ {tot_ch:.1f} ml (+10 % = {tot_ch * 1.1:.0f} ml)",
                      f"Panneaux : {nb_feuilles} × {SHEET[0]}×{SHEET[1]} mm en {DECOR} (voir calepinage)"]:
                d.text((60, y), t, font=fb, fill=(0, 0, 0)); y += 38
        d.text((60, Hh - 80), "SARL MYF · Panneaux EGGER · lamaisonduparquet.org · WhatsApp 0794 70 93 23", font=f, fill=(90, 90, 90))
        p = os.path.join(out, f"fiche-{pi + 1}.png"); im.save(p); paths.append(p)
    return paths

def fiche_quincaillerie(out, nb_feuilles, tot_ch):
    f, fb, ft = ImageFont.truetype(FONT, 24), ImageFont.truetype(FONTB, 24), ImageFont.truetype(FONTB, 38)
    W, Hh = 1654, 2339; im = Image.new("RGB", (W, Hh), "white"); d = ImageDraw.Draw(im)
    d.rectangle([60, 60, 72, 140], fill=(226, 0, 26))
    d.text((90, 58), TITRE + " · FOURNITURES ET MONTAGE", font=ft, fill=(0, 0, 0))
    y = 190
    lignes = [(f"Panneau {DECOR} {SHEET[0]}×{SHEET[1]}", f"{nb_feuilles}"), ("Chant ABS 1 mm assorti U156 (ml)", f"{tot_ch * 1.1:.0f}")]
    lignes += [(k, f"{v:g}") for k, v in Q.items() if v]
    for k, v in lignes:
        d.text((80, y), "•  " + k, font=f, fill=(20, 20, 20)); d.text((1400, y), v, font=fb, fill=(0, 0, 0)); y += 46
    y += 30; d.text((60, y), "Règles de montage", font=fb, fill=(226, 0, 26)); y += 50
    for t in [f"Montants pleine hauteur {H}, posés au sol ; fonds bas, tablettes fixes et dessus ENTRE les montants.",
              "Assemblage : vis Confirmat 7×50 (3 par liaison) ou tourillons + excentriques.",
              "Étagères mobiles : 2 mm de jeu en largeur, 20 mm en retrait de l'avant ; taquets 5 mm.",
              "Tiroirs : coulisses à billes (12,5 mm par côté) → caisson = largeur intérieure − 26 mm.",
              "Plinthe en retrait de 20 mm ; LED dans un profil alu sous chaque tablette haute.",
              "Fixation : traverse haute vissée au mur (chevilles) + 2 équerres par montant de rive.",
              "Pas de fond : le meuble se pose contre le mur peint. Option fond HDF 3 mm sur demande.",
              "Vérifier sur place : mesures des murs, aplombs, prises et interrupteur LED."]:
        d.text((80, y), "–  " + t, font=f, fill=(40, 40, 40)); y += 44
    d.text((60, Hh - 80), "SARL MYF · Panneaux EGGER · lamaisonduparquet.org · WhatsApp 0794 70 93 23", font=f, fill=(90, 90, 90))
    p = os.path.join(out, "fiche-fournitures.png"); im.save(p); return p

def dae(path):
    col = {"U156": (0.80, 0.74, 0.65), "FACADE": (0.77, 0.70, 0.60)}
    geo, nodes = [], []
    for i, (mod, nom, x0, y0, z0, dx, dy, dz, ch, txt) in enumerate(P):
        mat = "FACADE" if nom == "Façade tiroir" else "U156"
        X, Y, Z = [x0, x0 + dx], [y0, y0 + dy], [z0, z0 + dz]
        v = [(X[a], Y[b], Z[c]) for a in (0, 1) for b in (0, 1) for c in (0, 1)]
        pts = " ".join(f"{p[0]/1000:.4f} {p[1]/1000:.4f} {p[2]/1000:.4f}" for p in v)
        tri = [0,1,3, 0,3,2, 4,6,7, 4,7,5, 0,4,5, 0,5,1, 2,3,7, 2,7,6, 0,2,6, 0,6,4, 1,5,7, 1,7,3]
        n = f"{mod} - {nom}".replace("&", "et")
        geo.append(f'<geometry id="g{i}" name="{n}"><mesh><source id="p{i}"><float_array id="pa{i}" count="24">{pts}</float_array>'
                   f'<technique_common><accessor source="#pa{i}" count="8" stride="3"><param name="X" type="float"/><param name="Y" type="float"/><param name="Z" type="float"/></accessor></technique_common></source>'
                   f'<vertices id="v{i}"><input semantic="POSITION" source="#p{i}"/></vertices><triangles material="m{mat}" count="12"><input semantic="VERTEX" source="#v{i}" offset="0"/><p>{" ".join(map(str, tri))}</p></triangles></mesh></geometry>')
        nodes.append(f'<node id="n{i}" name="{n}"><instance_geometry url="#g{i}"><bind_material><technique_common><instance_material symbol="m{mat}" target="#mat{mat}"/></technique_common></bind_material></instance_geometry></node>')
    efx = "".join(f'<effect id="e{k}"><profile_COMMON><technique sid="t"><lambert><diffuse><color>{c[0]} {c[1]} {c[2]} 1</color></diffuse></lambert></technique></profile_COMMON></effect>' for k, c in col.items())
    mt = "".join(f'<material id="mat{k}" name="{k}"><instance_effect url="#e{k}"/></material>' for k in col)
    open(path, "w").write('<?xml version="1.0" encoding="utf-8"?><COLLADA xmlns="http://www.collada.org/2005/11/COLLADASchema" version="1.4.1">'
        '<asset><unit name="meter" meter="1"/><up_axis>Z_UP</up_axis></asset>'
        f'<library_effects>{efx}</library_effects><library_materials>{mt}</library_materials>'
        f'<library_geometries>{"".join(geo)}</library_geometries>'
        f'<library_visual_scenes><visual_scene id="s">{"".join(nodes)}</visual_scene></library_visual_scenes>'
        '<scene><instance_visual_scene url="#s"/></scene></COLLADA>')

def excel(rows, nb, path):
    from openpyxl import Workbook
    from openpyxl.styles import Font, PatternFill
    wb = Workbook(); ws = wb.active; ws.title = "Liste de coupe"
    Hf, HF = Font(bold=True, color="FFFFFF"), PatternFill("solid", fgColor="1A1A1A")
    ws.append([f"{TITRE} · liste de coupe · {DECOR} · cotes finies en mm"]); ws["A1"].font = Font(bold=True, size=14)
    ws.append([]); ws.append(["Repère", "Module", "Pièce", "Longueur", "Largeur", "Épaisseur", "Qté", "Chant ABS 1 mm", "Chant (ml)", "Surface (m²)"])
    for c in ws[3]: c.font, c.fill = Hf, HF
    for r in rows:
        i = ws.max_row + 1
        ws.append([r[0], r[1], r[2], r[3], r[4], EP, r[5], r[6], r[7], f"=D{i}*E{i}*G{i}/1000000"])
    n = ws.max_row
    ws.append(["TOTAL", "", "", "", "", "", f"=SUM(G4:G{n})", "", f"=SUM(I4:I{n})", f"=SUM(J4:J{n})"])
    for c in ws[ws.max_row]: c.font = Font(bold=True)
    for col, w in zip("ABCDEFGHIJ", (8, 12, 38, 10, 10, 10, 6, 20, 11, 12)): ws.column_dimensions[col].width = w
    wq = wb.create_sheet("Fournitures")
    wq.append(["Article", "Quantité"]); [setattr(c, "font", Font(bold=True)) for c in wq[1]]
    wq.append([f"Panneau {DECOR} {SHEET[0]}×{SHEET[1]}", nb]); wq.append(["Chant ABS 1 mm U156 (ml, +10 %)", f"=ROUNDUP('Liste de coupe'!I{n + 1}*1.1,0)"])
    for k, v in Q.items():
        if v: wq.append([k, v])
    wq.column_dimensions["A"].width = 60
    wh = wb.create_sheet("Hypothèses")
    hyp = [("Meuble", f"3000 de long × {H} de haut × {DF} de profondeur, posé contre un mur : A double penderie 1000 · B étagères 500 · C penderie 800 · D 4 tiroirs + penderie 615")] if MODE != "L" else []
    rows_h = hyp + [("Pièce", "3,00 m (mur du fond) × 2,00 m (mur gauche), plafond 2,60 m"), ("Meuble du fond", f"3000 × {DF} × {H} : A double penderie 1000 · B étagères 500 · C penderie 800 · D 4 tiroirs + penderie 615"),
                 ("Retour gauche", f"1350 × {DG} × {H} (de 600 à 1950) : E 3 tiroirs + étagères 650 · F chaussures 649"), ("Panneau", f"{EP} mm, {SHEET[0]}×{SHEET[1]}, trait {TRAIT}, rognage {ROGNE}"),
                 ("Ouvert", "dressing sans portes, sans fond ; LED sous tablettes hautes"), ("À vérifier", "mesures réelles des murs et du plafond avant découpe")]
    if MODE != "L": rows_h = [r for r in rows_h if r[0] not in ("Pièce", "Meuble du fond", "Retour gauche")]
    for k, v in rows_h:
        wh.append([k, v])
    wh.column_dimensions["A"].width = 18; wh.column_dimensions["B"].width = 110
    wb.save(path)

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    construire(); rows = liste(); sheets = calepinage(rows)
    dessine_calepinage(sheets, os.path.join(OUT, "calepinage.png"))
    tot_ch = sum(r[7] for r in rows)
    pages = fiches(rows, len(sheets), OUT) + [fiche_quincaillerie(OUT, len(sheets), tot_ch)]
    cal = Image.open(os.path.join(OUT, "calepinage.png")).convert("RGB")
    imgs = [Image.open(p).convert("RGB") for p in pages] + [cal]
    imgs[0].save(os.path.join(OUT, f"{NOM}-debit.pdf"), save_all=True, append_images=imgs[1:], resolution=200)
    dae(os.path.join(OUT, f"{NOM.lower()}.dae"))
    excel(rows, len(sheets), os.path.join(OUT, f"debit-{NOM.lower()}.xlsx"))
    print("pièces:", sum(r[5] for r in rows), "lignes:", len(rows), "panneaux:", len(sheets), "chant ml:", round(tot_ch, 1))
