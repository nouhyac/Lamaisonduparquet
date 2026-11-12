"""Projet AYHAM : armoire, commode, meuble TV + étagère, bureau. Panneaux EGGER 19 mm.

Usage : python3 ayham.py <dossier de sortie>
Produit : parts.json (scène 3D), ayham.dae (SketchUp Pro : Fichier > Importer > COLLADA),
debit-ayham.xlsx (fiche de débit par meuble), calepinage-ayham.png.
Toutes les cotes en mm, d'après le croquis du client. Modifier les constantes puis relancer.
"""
import sys, os, json
from collections import OrderedDict
from PIL import Image, ImageDraw, ImageFont

OUT = sys.argv[1] if len(sys.argv) > 1 else "out"
E = 19                 # épaisseur panneau EGGER
J = 3                  # jeu entre façades
SHEET = (2800, 2070); TRAIT, ROGNE = 4, 10
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"; FONTB = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

parts = []   # chaque instance : dict(meuble, nom, box=(x,y,z,dx,dy,dz), role, chant)
def add(m, nom, x, y, z, dx, dy, dz, role="caisson", chant="avant"):
    parts.append(dict(meuble=m, nom=nom, box=[x, y, z, dx, dy, dz], role=role, chant=chant))

def tiroir(m, x0, y0, larg, haut, prof, fac_x=None, fac_w=None, fac_y=None, fac_h=None, z_fac=None):
    """Tiroir à coulisses latérales (12,5 mm par côté) : façade + caisson 19 mm + fond HDF (hors 19 mm)."""
    bw = larg - 26; bh = max(haut - 40, 80); bd = prof - 30
    add(m, "Tiroir · côté", x0 + 13, y0 + 15, 10, E, bh, bd)
    add(m, "Tiroir · côté", x0 + 13 + bw - E, y0 + 15, 10, E, bh, bd)
    add(m, "Tiroir · avant", x0 + 13 + E, y0 + 15, 10 + bd - E, bw - 2 * E, bh, E)
    add(m, "Tiroir · arrière", x0 + 13 + E, y0 + 15, 10, bw - 2 * E, bh, E)
    if fac_w:
        add(m, "Façade tiroir", fac_x, fac_y, z_fac, fac_w, fac_h, E, role="facade", chant="4")

# ---------------- ARMOIRE 2100 × 2750 × 600 ----------------
A = "Armoire"; W, H, D = 2100, 2750, 580; P = 100; SEP = 2300   # plinthe 100, caissons hauts au-dessus de 2300
add(A, "Côté", 0, 0, 0, E, H, D); add(A, "Côté", W - E, 0, 0, E, H, D)
add(A, "Dessous", E, P, 0, W - 2 * E, E, D); add(A, "Dessus", E, H - E, 0, W - 2 * E, E, D)
add(A, "Plinthe avant", E, 0, D - 60, W - 2 * E, P, E, chant="aucun"); add(A, "Traverse plinthe arrière", E, 0, 20, W - 2 * E, P, E, chant="aucun")
bay = (W - 4 * E) // 3; xs = [E, E + bay + E, E + 2 * (bay + E)]; bays = [bay, bay, W - 2 * E - 2 * bay - 2 * E]
for i in (1, 2): add(A, "Montant intérieur", xs[i] - E, P + E, 0, E, H - P - 2 * E, D)
for i, x in enumerate(xs):
    b = bays[i]; add(A, "Séparation caisson haut", x, SEP - E, 0, b, E, D)
    def tab(y, nom="Étagère"): add(A, nom, x + 1, y, 0, b - 2, E, D - 20)
    if i == 0:   # penderie longue + 2 tiroirs 170
        tab(SEP - E - 380 - E); tab(P + E + 2 * 170, "Étagère sur tiroirs")
        for k in range(2): tiroir(A, x, P + E + k * 170, b, 170, D, fac_x=x + 2, fac_w=b - 4, fac_y=P + E + k * 170 + 2, fac_h=166, z_fac=D - 40)
    elif i == 1: # 2 étagères + penderie courte + étagère basse
        for y in (SEP - E - 380 - E, SEP - 2 * (380 + E) - E, P + E + 400): tab(y)
    else:        # étagères 380 + 3 tiroirs 200
        tab(P + E + 380); y0 = P + 2 * E + 380
        for k in range(3): tiroir(A, x, y0 + k * 200, b, 200, D, fac_x=x + 2, fac_w=b - 4, fac_y=y0 + k * 200 + 2, fac_h=196, z_fac=D - 40)
        y1 = y0 + 600; tab(y1); tab(y1 + E + 380); tab(SEP - E - 380 - E)
dw = (W - 6 * J) // 6
for k in range(6):
    xx = J / 2 + k * (dw + J)
    add(A, "Porte basse", xx, P + 1, D, dw, SEP - P - J, E, role="porte", chant="4")
    add(A, "Porte haute", xx, SEP + 1, D, dw, H - SEP - J, E, role="porte", chant="4")

# ---------------- COMMODE 1350 × 620 × 450 ----------------
C = "Commode"; ox = 2600; W, H, D, P = 1350, 620, 430, 60
add(C, "Côté", ox, 0, 0, E, H, D); add(C, "Côté", ox + W - E, 0, 0, E, H, D)
add(C, "Dessus", ox + E, H - E, 0, W - 2 * E, E, D); add(C, "Dessous", ox + E, P, 0, W - 2 * E, E, D)
add(C, "Plinthe", ox + E, 0, D - 50, W - 2 * E, P, E, chant="aucun")
xm = ox + 900; add(C, "Montant", xm - E, P + E, 0, E, H - P - 2 * E, D)
add(C, "Étagère", ox + E + 1, P + E + 250, 0, 900 - 2 * E - 2, E, D - 20)
yn = H - E - 150 - E; add(C, "Étagère niche", xm + 1, yn, 0, W - 900 - E - 2, E, D - 20)
for k in range(2):
    add(C, "Porte", ox + 1.5 + k * 451.5, P + 1.5, D, 448, H - P - J, E, role="porte", chant="4")
hz = (yn - P - E) // 2
for k in range(2):
    tiroir(C, xm, P + E + k * hz, W - 900 - E, hz, D, fac_x=xm - 7, fac_w=W - 900 + 7 - J, fac_y=P + 1.5 + k * (hz + 9), fac_h=hz + 6, z_fac=D)

# ---------------- MEUBLE TV 1900 × 500 × 360 + étagère 1900 × 250 ----------------
T = "Meuble TV"; ox = 4300; W, H, D = 1900, 500, 360
add(T, "Côté", ox, 0, 0, E, H, D); add(T, "Côté", ox + W - E, 0, 0, E, H, D)
add(T, "Dessus", ox + E, H - E, 0, W - 2 * E, E, D); add(T, "Dessous", ox + E, 0, 0, W - 2 * E, E, D)
zones = [500, 500, 500, 400]; x = ox
for k, zw in enumerate(zones[:-1]):
    x += zw; add(T, "Montant", x - E / 2, E, 0, E, H - 2 * E, D)
x = ox
for k, zw in enumerate(zones):
    if k < 3: add(T, "Porte", x + 1.5, 1.5, D, zw - J, H - J, E, role="porte", chant="4")
    else:
        for j in range(2): tiroir(T, x + E / 2, E + j * 231, zw - E, 231, D, fac_x=x + 1.5, fac_w=zw - J, fac_y=1.5 + j * 250, fac_h=247, z_fac=D)
    x += zw
for k in range(2): add(T, "Étagère murale (2 × 19 = 38 mm)", ox, 1300 + k * E, 0, 1900, E, 250, chant="avant")

# ---------------- BUREAU 1400 × 600 × 748 ----------------
B = "Bureau"; ox = 6600; W, D, HP = 1400, 600, 710
for k in range(2): add(B, "Plateau (2 × 19 = 38 mm)", ox, HP + k * E, 0, W, E, D, chant="4")
cw = 420
add(B, "Caisson · côté", ox + 20, 0, 0, E, HP, D - 20); add(B, "Caisson · côté", ox + 20 + cw - E, 0, 0, E, HP, D - 20)
add(B, "Caisson · dessous", ox + 20 + E, 40, 0, cw - 2 * E, E, D - 20); add(B, "Caisson · traverse haute", ox + 20 + E, HP - E, 0, cw - 2 * E, E, D - 20)
hz = (HP - 40 - E) // 3
for k in range(3):
    tiroir(B, ox + 20 + E, 40 + E + k * hz, cw - 2 * E, hz, D - 20, fac_x=ox + 21.5, fac_w=cw - J, fac_y=40 + 1.5 + k * hz, fac_h=hz - J, z_fac=D - 20)
for k in range(2): add(B, "Pied panneau (2 × 19 = 38 mm)", ox + W - 2 * E + k * E, 0, 0, E, HP, D, chant="3")
add(B, "Voile de fond", ox + 20 + cw, HP - 300, 40, W - 2 * E - 20 - cw, 300, E, chant="avant")

# ---------------- sorties ----------------
def cut(p):
    dx, dy, dz = p["box"][3:]; s = sorted([dx, dy, dz], reverse=True); return round(s[0]), round(s[1])

def liste():
    agg = OrderedDict()
    for p in parts:
        L, l = cut(p); k = (p["meuble"], p["nom"], L, l, p["chant"])
        agg[k] = agg.get(k, 0) + 1
    return agg

def chants(L, l, c):
    return {"4": 2 * (L + l), "3": 2 * L + l, "avant": L, "aucun": 0}[c] / 1000

def calepinage(agg):
    items = []
    for (m, n, L, l, c), q in agg.items():
        for _ in range(q): items.append((L, l, f"{m[:3]} {n}"))
    items.sort(key=lambda x: (-x[1], -x[0])); Wu, Hu = SHEET[0] - 2 * ROGNE, SHEET[1] - 2 * ROGNE; sheets = []
    for a, b, lab in items:
        placed = False
        for sh in sheets:
            for band in sh["bands"]:
                if b <= band["h"] and band["x"] + a <= Wu:
                    band["items"].append((band["x"], band["y"], a, b, lab)); band["x"] += a + TRAIT; placed = True; break
            if placed: break
            if sh["y"] + b <= Hu:
                sh["bands"].append({"y": sh["y"], "h": b, "x": a + TRAIT, "items": [(0, sh["y"], a, b, lab)]}); sh["y"] += b + TRAIT; placed = True; break
        if not placed: sheets.append({"y": b + TRAIT, "bands": [{"y": 0, "h": b, "x": a + TRAIT, "items": [(0, 0, a, b, lab)]}]})
    return sheets

def dessin(sheets, path):
    f, fb = ImageFont.truetype(FONT, 12), ImageFont.truetype(FONTB, 20); s = 0.2; sw, shh = int(SHEET[0] * s), int(SHEET[1] * s)
    cols = 3; rows = (len(sheets) + cols - 1) // cols
    im = Image.new("RGB", (cols * (sw + 30) + 30, rows * (shh + 60) + 40), "white"); d = ImageDraw.Draw(im)
    for k, sh in enumerate(sheets):
        x0, y0 = 30 + (k % cols) * (sw + 30), 60 + (k // cols) * (shh + 60)
        d.text((x0, y0 - 28), f"Panneau EGGER 19 mm · feuille {k+1}/{len(sheets)}", font=fb, fill=(20, 20, 20))
        d.rectangle([x0, y0, x0 + sw, y0 + shh], outline=(0, 0, 0), width=2, fill=(248, 248, 248))
        for band in sh["bands"]:
            for (x, y, a, b, lab) in band["items"]:
                X, Y = x0 + (x + ROGNE) * s, y0 + (y + ROGNE) * s
                d.rectangle([X, Y, X + a * s, Y + b * s], fill=(222, 190, 140), outline=(226, 0, 26))
                if a * s > 55 and b * s > 16: d.text((X + 3, Y + 2), lab[:int(a * s / 7)], font=f, fill=(20, 20, 20))
                if a * s > 55 and b * s > 30: d.text((X + 3, Y + 15), f"{a}×{b}", font=f, fill=(20, 20, 20))
    im.save(path)

def excel(agg, nsheets, path):
    from openpyxl import Workbook
    from openpyxl.styles import Font, PatternFill
    wb = Workbook(); ws = wb.active; ws.title = "Fiche de débit"
    H = Font(bold=True, color="FFFFFF"); HF = PatternFill("solid", fgColor="1A1A1A")
    ws.append(["Projet AYHAM · fiche de débit · panneau EGGER 19 mm (cotes finies en mm, fil du bois dans la longueur)"]); ws["A1"].font = Font(bold=True, size=13)
    ws.append([]); ws.append(["Meuble", "Pièce", "Longueur", "Largeur", "Qté", "Chant", "Chant (ml)", "Surface (m²)"])
    for c in ws[3]: c.font, c.fill = H, HF
    for (m, n, L, l, c), q in agg.items():
        ws.append([m, n, L, l, q, {"4": "4 côtés", "3": "3 côtés", "avant": "1 chant avant", "aucun": "—"}[c], round(chants(L, l, c) * q, 2), round(L * l * q / 1e6, 3)])
    r = ws.max_row; ws.append(["TOTAL", "", "", "", f"=SUM(E4:E{r})", "", f"=SUM(G4:G{r})", f"=SUM(H4:H{r})"])
    for c in ws[ws.max_row]: c.font = Font(bold=True)
    ws.append([]); ws.append([f"Panneaux EGGER 2800 × 2070 × 19 mm nécessaires (calepinage) : {nsheets} feuilles"])
    ws.append(["Non compris : fonds HDF 3 mm, fonds de tiroirs HDF, coulisses, charnières, tringles, pieds/vérins."])
    for col, w in zip("ABCDEFGH", (12, 34, 10, 10, 6, 14, 11, 12)): ws.column_dimensions[col].width = w
    wb.save(path)

def dae(path):
    geo, nodes = [], []
    tri = [0,1,3, 0,3,2, 4,6,7, 4,7,5, 0,4,5, 0,5,1, 2,3,7, 2,7,6, 0,2,6, 0,6,4, 1,5,7, 1,7,3]
    for i, p in enumerate(parts):
        x, y, z, dx, dy, dz = p["box"]
        v = [(x + a * dx, -(z + c * dz), y + b * dy) for a in (0, 1) for b in (0, 1) for c in (0, 1)]  # Z vertical
        pts = " ".join(f"{q[0]/1000:.4f} {q[1]/1000:.4f} {q[2]/1000:.4f}" for q in v)
        geo.append(f'<geometry id="g{i}"><mesh><source id="p{i}"><float_array id="a{i}" count="24">{pts}</float_array><technique_common><accessor source="#a{i}" count="8" stride="3"><param name="X" type="float"/><param name="Y" type="float"/><param name="Z" type="float"/></accessor></technique_common></source><vertices id="v{i}"><input semantic="POSITION" source="#p{i}"/></vertices><triangles material="m" count="12"><input semantic="VERTEX" source="#v{i}" offset="0"/><p>{" ".join(map(str, tri))}</p></triangles></mesh></geometry>')
        L, l = cut(p)
        nodes.append(f'<node id="n{i}" name="{p["meuble"]} - {p["nom"]} {L}x{l}"><instance_geometry url="#g{i}"><bind_material><technique_common><instance_material symbol="m" target="#mat"/></technique_common></bind_material></instance_geometry></node>')
    xml = ('<?xml version="1.0" encoding="utf-8"?><COLLADA xmlns="http://www.collada.org/2005/11/COLLADASchema" version="1.4.1"><asset><unit name="meter" meter="1"/><up_axis>Z_UP</up_axis></asset>'
           '<library_effects><effect id="e"><profile_COMMON><technique sid="t"><lambert><diffuse><color>0.85 0.72 0.52 1</color></diffuse></lambert></technique></profile_COMMON></effect></library_effects>'
           '<library_materials><material id="mat" name="EGGER_19mm"><instance_effect url="#e"/></material></library_materials>'
           f'<library_geometries>{"".join(geo)}</library_geometries><library_visual_scenes><visual_scene id="s">{"".join(nodes)}</visual_scene></library_visual_scenes><scene><instance_visual_scene url="#s"/></scene></COLLADA>')
    open(path, "w").write(xml)

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    json.dump(parts, open(os.path.join(OUT, "parts.json"), "w"))
    agg = liste(); sheets = calepinage(agg)
    dessin(sheets, os.path.join(OUT, "calepinage-ayham.png")); excel(agg, len(sheets), os.path.join(OUT, "debit-ayham.xlsx")); dae(os.path.join(OUT, "ayham.dae"))
    by = OrderedDict()
    for (m, n, L, l, c), q in agg.items(): by.setdefault(m, []).append((n, L, l, q, c))
    for m, rows in by.items():
        print(f"== {m}")
        for n, L, l, q, c in rows: print(f"  {q:>2} × {n:<34} {L:>5} × {l:<5} chant:{c}")
    surf = sum(L * l * q for (m, n, L, l, c), q in agg.items()) / 1e6
    print("pièces", sum(agg.values()), "surface m²", round(surf, 2), "feuilles", len(sheets), "chant ml", round(sum(chants(L, l, c) * q for (m, n, L, l, c), q in agg.items()), 1))
