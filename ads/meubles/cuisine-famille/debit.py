"""Cuisine sur mesure en panneaux EGGER : liste de coupe, calepinage, chiffrage, plan et modèle 3D.

Usage : python3 debit.py <dossier de sortie>
Produit : debit-cuisine.xlsx, calepinage.png, plan.png, cuisine.dae (import SketchUp Pro : Fichier > Importer > COLLADA).

Les dimensions de la pièce sont des HYPOTHÈSES tirées des photos et vidéos (carreaux, portes,
électroménager). Les modifier dans PIECE et MODULES dès que les vraies mesures arrivent, puis relancer.
"""
import sys, os
from PIL import Image, ImageDraw, ImageFont

OUT = sys.argv[1] if len(sys.argv) > 1 else "."
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONTB = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

# ---------- Hypothèses (mm) ----------
PIECE = {"mur_A": 3400, "mur_B": 2100, "hauteur": 2800, "porte_fenetre": 1200}
EP = 18            # panneau mélaminé EGGER 18 mm
SHEET = (2800, 2070)
TRAIT, ROGNE = 4, 10  # trait de scie, rognage des bords

DECORS = {
    "CHENE": "EGGER H1145 ST10 Chêne Bardolino naturel 18 mm",
    "NOIR": "EGGER U999 PM Noir mat PerfectSense 18 mm",
    "BLANC": "EGGER W980 ST2 Blanc platine 18 mm (caissons)",
    "HDF": "Fond HDF blanc 3 mm",
}
VEINAGE = {"CHENE"}  # pas de rotation : fil du bois dans la longueur

# Modules : (repère, type, largeur, hauteur, profondeur, façades, décor façade, étagères, tiroirs)
# Mur B (fond) : colonnes. Mur A : bas + hauts, départ après la colonne d'angle.
MODULES = [
    ("C1", "colonne", 600, 2400, 600, "four + 2 tiroirs + 1 porte haute", "CHENE", 1, 2),
    ("C2", "colonne", 600, 2400, 600, "2 portes garde-manger", "CHENE", 5, 0),
    ("C3", "colonne", 600, 2400, 600, "niche café éclairée + 2 portes", "CHENE", 2, 0),
    ("C4", "colonne", 300, 2400, 600, "1 porte épicerie", "CHENE", 6, 0),
    ("B1", "bas", 1000, 720, 560, "2 portes sous évier", "NOIR", 0, 0),
    ("B2", "bas", 600, 720, 560, "façade lave-vaisselle", "NOIR", 0, 0),
    ("B3", "bas", 600, 720, 560, "3 tiroirs", "NOIR", 0, 3),
    ("B4", "bas", 600, 720, 560, "2 casseroliers sous plaque", "NOIR", 0, 2),
    ("H0", "haut", 500, 900, 350, "caisson chauffe-eau ventilé", "NOIR", 0, 0),
    ("H1", "haut", 800, 720, 350, "2 portes", "CHENE", 1, 0),
    ("H2", "haut", 800, 720, 350, "2 portes", "CHENE", 1, 0),
    ("H3", "haut", 700, 720, 350, "2 portes", "CHENE", 1, 0),
]
PLINTHE_H = 100

# Prix unitaires en DA : ESTIMATIONS À REMPLACER par vos prix (cellules jaunes dans l'Excel)
PRIX = {
    "CHENE": 16000, "NOIR": 18000, "BLANC": 12000, "HDF": 2500,
    "Plan de travail EGGER 4100x600x38 (F812 marbre blanc)": 22000,
    "Crédence stratifiée assortie (ml)": 6000,
    "Chant ABS 2 mm façades (ml)": 150, "Chant ABS 1 mm caissons (ml)": 60,
    "Charnière à amortisseur": 450, "Coulisses tiroir double paroi (paire)": 4500,
    "Pied réglable": 120, "Profil gola alu noir (ml)": 2500, "Ruban LED + driver (ml)": 1800,
    "Grille d'aération alu noir": 900, "Visserie, tourillons, colle (forfait)": 6000,
    "Fabrication + pose (ml de cuisine)": 18000,
}

def pieces():
    """Liste de coupe : (module, désignation, long, larg, qté, décor, chant2, chant1)."""
    L = []
    for rep, typ, W, H, D, fac, dec, et, tir in MODULES:
        cais = "NOIR" if rep in ("C3", "H0") else "BLANC"
        L += [(rep, "Côté", H, D, 2, cais, 0, 1)]
        L += [(rep, "Fond bas", W - 2 * EP, D, 1, cais, 0, 1)]
        if typ == "bas":
            L += [(rep, "Traverse haute", W - 2 * EP, 100, 2, cais, 0, 1)]
        else:
            L += [(rep, "Dessus", W - 2 * EP, D, 1, cais, 0, 1)]
        if et:
            L += [(rep, "Étagère", W - 2 * EP - 2, D - 20, et, cais, 0, 1)]
        L += [(rep, "Fond HDF", H - 4, W - 4, 1, "HDF", 0, 0)]
        # façades (jeu 3 mm)
        hf = H - 3
        if tir:
            hh = (hf - (600 if rep == "C1" else 0) - (900 if rep == "C1" else 0)) // tir if rep == "C1" else hf // tir
            L += [(rep, "Façade tiroir", W - 3, hh - 3, tir, dec, 1, 0)]
            L += [(rep, "Fond de tiroir", W - 2 * EP - 40, D - 60, tir, "BLANC", 0, 0)]
            L += [(rep, "Arrière de tiroir", W - 2 * EP - 50, 150, tir, "BLANC", 0, 1)]
            if rep == "C1":
                L += [(rep, "Porte haute", W - 3, 900 - 3, 1, dec, 1, 0)]
        elif rep == "C3":
            L += [(rep, "Porte basse", W - 3, 900 - 3, 1, dec, 1, 0), (rep, "Porte haute", W - 3, 900 - 3, 1, dec, 1, 0)]
        elif rep in ("C4", "B2", "H0"):
            L += [(rep, "Façade", W - 3, hf, 1, dec, 1, 0)]
        else:
            L += [(rep, "Porte", (W // 2) - 3, hf, 2, dec, 1, 0)] if W > 450 else [(rep, "Porte", W - 3, hf, 1, dec, 1, 0)]
    # fileurs, plinthes, joues de finition
    lin_bas = sum(m[2] for m in MODULES if m[1] == "bas")
    L += [("FIN", "Joue de finition colonne", 2400, 620, 1, "CHENE", 1, 0)]
    L += [("FIN", "Joue de finition bas (côté porte-fenêtre)", 870, 600, 1, "NOIR", 1, 0)]
    L += [("FIN", "Bandeau de rattrapage haut colonnes", 2100, PIECE["hauteur"] - 2400 - 100 - 3, 1, "CHENE", 1, 0)]
    L += [("FIN", "Plinthe (2 morceaux)", (lin_bas + 600) // 2, PLINTHE_H, 2, "NOIR", 1, 0)]
    L += [("FIN", "Plinthe colonnes", 2100, PLINTHE_H, 1, "CHENE", 1, 0)]
    return L

def calepinage(L):
    """Placement simple en bandes (guillotine), par décor. Renvoie {décor: [feuilles]}."""
    out = {}
    for dec in DECORS:
        items = []
        for p in L:
            if p[5] != dec: continue
            for _ in range(p[4]):
                # grande dimension dans la longueur de la feuille (= fil du bois pour le chêne)
                a, b = max(p[2], p[3]), min(p[2], p[3])
                items.append((a, b, f"{p[0]} {p[1]}"))
        items.sort(key=lambda x: (-x[1], -x[0]))
        Wu, Hu = SHEET[0] - 2 * ROGNE, SHEET[1] - 2 * ROGNE
        sheets = []
        for a, b, lab in items:
            placed = False
            for sh in sheets:
                for band in sh["bands"]:
                    opts = [(a, b)] + ([(b, a)] if dec not in VEINAGE else [])
                    for pa, pb in opts:
                        if pb <= band["h"] and band["x"] + pa <= Wu:
                            band["items"].append((band["x"], band["y"], pa, pb, lab)); band["x"] += pa + TRAIT; placed = True; break
                    if placed: break
                if placed: break
                if sh["y"] + b <= Hu:
                    band = {"y": sh["y"], "h": b, "x": a + TRAIT, "items": [(0, sh["y"], a, b, lab)]}
                    sh["bands"].append(band); sh["y"] += b + TRAIT; placed = True; break
            if not placed:
                sheets.append({"y": b + TRAIT, "bands": [{"y": 0, "h": b, "x": a + TRAIT, "items": [(0, 0, a, b, lab)]}]})
        out[dec] = sheets
    return out

def dessine_calepinage(cal, path):
    f, fb = ImageFont.truetype(FONT, 13), ImageFont.truetype(FONTB, 20)
    col = {"CHENE": (214, 170, 110), "NOIR": (60, 60, 60), "BLANC": (235, 235, 235), "HDF": (200, 200, 190)}
    s = 0.22; sw, shh = int(SHEET[0] * s), int(SHEET[1] * s)
    tiles = [(d, i, sh) for d in cal for i, sh in enumerate(cal[d])]
    cols = 3; rows = (len(tiles) + cols - 1) // cols
    im = Image.new("RGB", (cols * (sw + 30) + 30, rows * (shh + 60) + 30), "white"); dr = ImageDraw.Draw(im)
    for k, (d, i, sh) in enumerate(tiles):
        x0, y0 = 30 + (k % cols) * (sw + 30), 30 + (k // cols) * (shh + 60) + 30
        dr.text((x0, y0 - 28), f"{d} · feuille {i+1}/{len(cal[d])}", font=fb, fill=(20, 20, 20))
        dr.rectangle([x0, y0, x0 + sw, y0 + shh], outline=(0, 0, 0), width=2, fill=(250, 250, 250))
        for band in sh["bands"]:
            for (x, y, a, b, lab) in band["items"]:
                X, Y = x0 + (x + ROGNE) * s, y0 + (y + ROGNE) * s
                dr.rectangle([X, Y, X + a * s, Y + b * s], fill=col[d], outline=(226, 0, 26))
                tc = (255, 255, 255) if d == "NOIR" else (20, 20, 20)
                if a * s > 60 and b * s > 18: dr.text((X + 3, Y + 2), f"{lab}", font=f, fill=tc)
                if a * s > 60 and b * s > 34: dr.text((X + 3, Y + 17), f"{a}×{b}", font=f, fill=tc)
    im.save(path)

def dessine_plan(path):
    W, H = 1800, 1250; im = Image.new("RGB", (W, H), "white"); d = ImageDraw.Draw(im)
    f, fb, ft = ImageFont.truetype(FONT, 18), ImageFont.truetype(FONTB, 22), ImageFont.truetype(FONTB, 34)
    d.text((40, 25), "Cuisine sur mesure · plan et élévations (cotes estimées, à vérifier)", font=ft, fill=(20, 20, 20))
    d.rectangle([40, 75, 52, 105], fill=(226, 0, 26))
    s = 0.17; ox, oy = 80, 180; A, B = PIECE["mur_A"], PIECE["mur_B"]
    d.text((ox, oy - 45), "VUE DE DESSUS", font=fb, fill=(0, 0, 0))
    d.rectangle([ox, oy, ox + A * s, oy + B * s], outline=(0, 0, 0), width=5)
    # colonnes le long du mur B (gauche), bas + hauts le long du mur A (haut)
    y = oy
    for m in [m for m in MODULES if m[1] == "colonne"]:
        d.rectangle([ox, y, ox + m[4] * s, y + m[2] * s], fill=(214, 170, 110), outline=(0, 0, 0)); d.text((ox + 8, y + 8), m[0], font=f, fill=(0, 0, 0)); y += m[2] * s
    x = ox + 600 * s
    for m in [m for m in MODULES if m[1] == "bas"]:
        d.rectangle([x, oy, x + m[2] * s, oy + m[4] * s], fill=(70, 70, 70), outline=(0, 0, 0)); d.text((x + 8, oy + 8), m[0], font=f, fill=(255, 255, 255)); x += m[2] * s
    d.text((ox + A * s / 2 - 60, oy - 28), f"Mur A ≈ {A/1000:.2f} m", font=f, fill=(226, 0, 26))
    d.text((ox - 10, oy + B * s + 10), f"Mur B ≈ {B/1000:.2f} m", font=f, fill=(226, 0, 26))
    d.line([ox + A * s, oy + B * s * 0.2, ox + A * s, oy + B * s * 0.8], fill=(80, 160, 255), width=8)
    d.text((ox + A * s - 200, oy + B * s / 2), "porte-fenêtre\n→ loggia", font=f, fill=(40, 120, 220))
    d.text((ox + 140, oy + B * s - 60), "Sol : Chêne Melba beige Aqua EL2416\nposé sur le carrelage", font=f, fill=(80, 80, 80))
    # élévation mur A
    ex, ey, s2 = 80, 1180, 0.2
    d.text((ex, 640), "ÉLÉVATION MUR A (évier, chauffe-eau)", font=fb, fill=(0, 0, 0))
    d.line([ex, ey, ex + A * s2, ey], fill=(0, 0, 0), width=4)
    x = ex + 600 * s2
    for m in [m for m in MODULES if m[1] == "bas"]:
        d.rectangle([x, ey - (PLINTHE_H + 720) * s2, x + m[2] * s2, ey - PLINTHE_H * s2], fill=(70, 70, 70), outline=(255, 255, 255))
        d.text((x + 6, ey - 800 * s2), m[0], font=f, fill=(255, 255, 255)); x += m[2] * s2
    d.rectangle([ex + 600 * s2, ey - (PLINTHE_H + 758) * s2, x, ey - (PLINTHE_H + 720) * s2], fill=(240, 240, 235), outline=(0, 0, 0))
    x = ex + 600 * s2
    for m in [m for m in MODULES if m[1] == "haut"]:
        top = ey - 2350 * s2; c = (70, 70, 70) if m[0] == "H0" else (214, 170, 110)
        d.rectangle([x, top, x + m[2] * s2, top + m[3] * s2], fill=c, outline=(0, 0, 0)); d.text((x + 6, top + 6), m[0], font=f, fill=(255, 255, 255) if m[0] == "H0" else (0, 0, 0)); x += m[2] * s2
    d.rectangle([ex, ey - 2400 * s2 - PLINTHE_H * s2, ex + 600 * s2, ey - PLINTHE_H * s2], fill=(214, 170, 110), outline=(0, 0, 0)); d.text((ex + 6, ey - 2300 * s2), "C1", font=f)
    d.line([ex + A * s2 + 25, ey, ex + A * s2 + 25, ey - PIECE["hauteur"] * s2], fill=(226, 0, 26), width=2)
    d.text((ex + A * s2 + 32, ey - PIECE["hauteur"] * s2 / 2), f"H ≈ {PIECE['hauteur']/1000:.2f} m", font=f, fill=(226, 0, 26))
    # élévation mur B
    bx = 1000; s3 = 0.2
    d.text((bx, 640), "ÉLÉVATION MUR B (colonnes)", font=fb, fill=(0, 0, 0))
    d.line([bx, ey, bx + B * s3, ey], fill=(0, 0, 0), width=4)
    x = bx
    for m in [m for m in MODULES if m[1] == "colonne"]:
        d.rectangle([x, ey - (2400 + PLINTHE_H) * s3, x + m[2] * s3, ey - PLINTHE_H * s3], fill=(214, 170, 110), outline=(0, 0, 0))
        if m[0] == "C3": d.rectangle([x + 4, ey - 1500 * s3, x + m[2] * s3 - 4, ey - 1000 * s3], fill=(40, 40, 40), outline=(255, 200, 80), width=3)
        if m[0] == "C1": d.rectangle([x + 6, ey - 1600 * s3, x + m[2] * s3 - 6, ey - 1000 * s3], fill=(20, 20, 20))
        d.text((x + 6, ey - 2450 * s3), m[0], font=f, fill=(0, 0, 0)); x += m[2] * s3
    leg = ["C1 four · C2 garde-manger · C3 niche café · C4 épicerie", "B1 évier · B2 lave-vaisselle · B3 tiroirs · B4 plaque", "H0 caisson chauffe-eau ventilé (noir) · H1-H3 meubles hauts chêne"]
    for i, t in enumerate(leg): d.text((1000, 180 + i * 34), t, font=f, fill=(40, 40, 40))
    d.text((1000, 300), "SARL MYF · Panneaux EGGER · lamaisonduparquet.org", font=fb, fill=(0, 0, 0))
    im.save(path)

def dae(path):
    """Modèle 3D en boîtes (un objet par module) pour SketchUp Pro."""
    mats = {"CHENE": (0.84, 0.67, 0.43), "NOIR": (0.12, 0.12, 0.12), "PLAN": (0.95, 0.95, 0.93)}
    boxes = []
    y = 0
    for m in [m for m in MODULES if m[1] == "colonne"]:
        boxes.append((m[0], 0, y, PLINTHE_H, m[4], m[2], m[3], m[6])); y += m[2]
    x = 600
    for m in [m for m in MODULES if m[1] == "bas"]:
        boxes.append((m[0], x, 0, PLINTHE_H, m[2], m[4], m[3], m[6])); x += m[2]
    boxes.append(("Plan", 600, 0, PLINTHE_H + 720, x - 600, 600, 38, "PLAN"))
    x = 600
    for m in [m for m in MODULES if m[1] == "haut"]:
        z = 2350 - m[3] + 720 if m[0] != "H0" else 2350 - 900 + 720
        boxes.append((m[0], x, 0, 2350 - m[3] + PLINTHE_H, m[2], m[4], m[3], m[6])); x += m[2]
    geo, nodes = [], []
    for i, (n, x0, y0, z0, dx, dy, dz, mat) in enumerate(boxes):
        X = [x0, x0 + dx]; Y = [y0, y0 + dy]; Z = [z0, z0 + dz]
        v = [(X[a], Y[b], Z[c]) for a in (0, 1) for b in (0, 1) for c in (0, 1)]
        pts = " ".join(f"{p[0]/1000} {p[1]/1000} {p[2]/1000}" for p in v)
        tri = [0,1,3, 0,3,2, 4,6,7, 4,7,5, 0,4,5, 0,5,1, 2,3,7, 2,7,6, 0,2,6, 0,6,4, 1,5,7, 1,7,3]
        geo.append(f'<geometry id="g{i}" name="{n}"><mesh><source id="p{i}"><float_array id="pa{i}" count="24">{pts}</float_array>'
                   f'<technique_common><accessor source="#pa{i}" count="8" stride="3"><param name="X" type="float"/><param name="Y" type="float"/><param name="Z" type="float"/></accessor></technique_common></source>'
                   f'<vertices id="v{i}"><input semantic="POSITION" source="#p{i}"/></vertices><triangles material="m{mat}" count="12"><input semantic="VERTEX" source="#v{i}" offset="0"/><p>{" ".join(map(str, tri))}</p></triangles></mesh></geometry>')
        nodes.append(f'<node id="n{i}" name="{n}"><instance_geometry url="#g{i}"><bind_material><technique_common><instance_material symbol="m{mat}" target="#mat{mat}"/></technique_common></bind_material></instance_geometry></node>')
    efx = "".join(f'<effect id="e{k}"><profile_COMMON><technique sid="t"><lambert><diffuse><color>{c[0]} {c[1]} {c[2]} 1</color></diffuse></lambert></technique></profile_COMMON></effect>' for k, c in mats.items())
    mt = "".join(f'<material id="mat{k}" name="{k}"><instance_effect url="#e{k}"/></material>' for k in mats)
    xml = ('<?xml version="1.0" encoding="utf-8"?><COLLADA xmlns="http://www.collada.org/2005/11/COLLADASchema" version="1.4.1">'
           '<asset><unit name="meter" meter="1"/><up_axis>Z_UP</up_axis></asset>'
           f'<library_effects>{efx}</library_effects><library_materials>{mt}</library_materials>'
           f'<library_geometries>{"".join(geo)}</library_geometries>'
           f'<library_visual_scenes><visual_scene id="s">{"".join(nodes)}</visual_scene></library_visual_scenes>'
           '<scene><instance_visual_scene url="#s"/></scene></COLLADA>')
    open(path, "w").write(xml)

def excel(L, cal, path):
    from openpyxl import Workbook
    from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
    wb = Workbook(); ws = wb.active; ws.title = "Liste de coupe"
    H = Font(bold=True, color="FFFFFF"); HF = PatternFill("solid", fgColor="1A1A1A"); Y = PatternFill("solid", fgColor="FFF2A8")
    ws.append(["Cuisine sur mesure · liste de coupe (cotes en mm, dimensions de la pièce estimées)"]); ws["A1"].font = Font(bold=True, size=14)
    ws.append([]); ws.append(["Module", "Pièce", "Longueur", "Largeur", "Qté", "Décor", "Chant 2 mm (ml)", "Chant 1 mm (ml)", "Surface (m²)"])
    for c in ws[3]: c.font, c.fill = H, HF
    r0 = 4
    for p in L:
        r = ws.max_row + 1
        ws.append([p[0], p[1], p[2], p[3], p[4], DECORS[p[5]].split(" 18")[0] if p[5] != "HDF" else DECORS["HDF"],
                   f"=IF({p[6]}=1,2*(C{r}+D{r})*E{r}/1000,0)", f"=IF({p[7]}=1,C{r}*E{r}/1000,0)", f"=C{r}*D{r}*E{r}/1000000"])
    rN = ws.max_row
    ws.append(["TOTAL", "", "", "", f"=SUM(E{r0}:E{rN})", "", f"=SUM(G{r0}:G{rN})", f"=SUM(H{r0}:H{rN})", f"=SUM(I{r0}:I{rN})"])
    for c in ws[ws.max_row]: c.font = Font(bold=True)
    for col, w in zip("ABCDEFGHI", (8, 34, 10, 10, 6, 44, 15, 15, 12)): ws.column_dimensions[col].width = w
    tot = ws.max_row

    wc = wb.create_sheet("Chiffrage")
    wc.append(["Chiffrage estimatif · prix en DA · cellules JAUNES = vos prix à confirmer"]); wc["A1"].font = Font(bold=True, size=14)
    wc.append([]); wc.append(["Poste", "Quantité", "Unité", "Prix unitaire (DA)", "Total (DA)"])
    for c in wc[3]: c.font, c.fill = H, HF
    nb = {d: len(cal[d]) for d in cal}
    portes = sum(p[4] for p in L if p[1].startswith("Porte") or p[1] == "Façade")
    tiroirs = sum(p[4] for p in L if p[1] == "Façade tiroir")
    lin = sum(m[2] for m in MODULES if m[1] == "bas") / 1000
    lin_tot = (sum(m[2] for m in MODULES if m[1] == "bas") + sum(m[2] for m in MODULES if m[1] == "colonne")) / 1000
    lignes = [(DECORS["CHENE"] + " (2800×2070)", nb["CHENE"], "feuille", PRIX["CHENE"]),
              (DECORS["NOIR"] + " (2800×2070)", nb["NOIR"], "feuille", PRIX["NOIR"]),
              (DECORS["BLANC"] + " (2800×2070)", nb["BLANC"], "feuille", PRIX["BLANC"]),
              (DECORS["HDF"] + " (2800×2070)", nb["HDF"], "feuille", PRIX["HDF"]),
              ("Plan de travail EGGER 4100x600x38 (F812 marbre blanc)", 1, "U", PRIX["Plan de travail EGGER 4100x600x38 (F812 marbre blanc)"]),
              ("Crédence stratifiée assortie", lin, "ml", PRIX["Crédence stratifiée assortie (ml)"]),
              ("Chant ABS 2 mm façades", f"=ROUNDUP('Liste de coupe'!G{tot}*1.1,0)", "ml", PRIX["Chant ABS 2 mm façades (ml)"]),
              ("Chant ABS 1 mm caissons", f"=ROUNDUP('Liste de coupe'!H{tot}*1.1,0)", "ml", PRIX["Chant ABS 1 mm caissons (ml)"]),
              ("Charnière à amortisseur", portes * 2 + 6, "U", PRIX["Charnière à amortisseur"]),
              ("Coulisses tiroir double paroi", tiroirs, "paire", PRIX["Coulisses tiroir double paroi (paire)"]),
              ("Pied réglable", 4 * len([m for m in MODULES if m[1] != "haut"]), "U", PRIX["Pied réglable"]),
              ("Profil gola alu noir", round(lin * 2, 1), "ml", PRIX["Profil gola alu noir (ml)"]),
              ("Ruban LED + driver (sous meubles hauts + niche)", round(lin + 1.2, 1), "ml", PRIX["Ruban LED + driver (ml)"]),
              ("Grille d'aération alu noir (chauffe-eau)", 2, "U", PRIX["Grille d'aération alu noir"]),
              ("Visserie, tourillons, colle", 1, "forfait", PRIX["Visserie, tourillons, colle (forfait)"]),
              ("Fabrication + pose", lin_tot, "ml", PRIX["Fabrication + pose (ml de cuisine)"])]
    for t, q, u, pu in lignes:
        r = wc.max_row + 1; wc.append([t, q, u, pu, f"=B{r}*D{r}"]); wc[f"D{r}"].fill = Y
    r = wc.max_row
    wc.append(["TOTAL CUISINE (hors électroménager)", "", "", "", f"=SUM(E4:E{r})"])
    for c in wc[wc.max_row]: c.font = Font(bold=True)
    wc.append([]); wc.append(["En option : sol Chêne Melba beige Aqua EL2416, environ 9 m² de pièce (5 cartons = 9,95 m²) + sous-couche + plinthes : chiffrer avec le modèle de devis habituel."])
    for col, w in zip("ABCDE", (62, 10, 9, 18, 16)): wc.column_dimensions[col].width = w
    for row in wc.iter_rows(min_row=4, min_col=4, max_col=5):
        for c in row: c.number_format = '#,##0'

    wh = wb.create_sheet("Hypothèses")
    for k, v in [("Mur A (évier + chauffe-eau)", "≈ 3,40 m"), ("Mur B (fond, colonnes)", "≈ 2,10 m"), ("Hauteur sous plafond", "≈ 2,80 m (retombée de poutre près de l'entrée)"),
                 ("Repères utilisés", "carreaux muraux ≈ 20×20 cm, frise à ≈ 1,60 m, porte ≈ 0,80 m, porte-fenêtre ≈ 1,20 m, machine à laver 60 cm"),
                 ("Panneaux", "EGGER 2800×2070 mm, 18 mm, trait de scie 4 mm, rognage 10 mm"),
                 ("À mesurer sur place", "chaque mur au sol et à 1 m, hauteur, position évier / chauffe-eau / prises / arrivée gaz, faux aplombs"),
                 ("Sécurité", "chauffe-eau gaz : caisson ventilé haut et bas, conduit libre, accès au robinet de gaz")]:
        wh.append([k, v])
    wh.column_dimensions["A"].width = 30; wh.column_dimensions["B"].width = 110
    wb.save(path)

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    L = pieces(); cal = calepinage(L)
    dessine_calepinage(cal, os.path.join(OUT, "calepinage.png"))
    dessine_plan(os.path.join(OUT, "plan.png"))
    dae(os.path.join(OUT, "cuisine.dae"))
    excel(L, cal, os.path.join(OUT, "debit-cuisine.xlsx"))
    print({d: len(cal[d]) for d in cal}, "pièces:", sum(p[4] for p in L))
