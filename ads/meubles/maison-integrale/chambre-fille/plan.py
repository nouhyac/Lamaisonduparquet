"""Chambre fille (Youcef) : plan coté + élévation du placard, d'après le croquis client. Cotes en mm."""
import sys
from PIL import Image, ImageDraw, ImageFont
OUT = sys.argv[1]; FD = sys.argv[2]
f = lambda n, s: ImageFont.truetype(f"{FD}/{n}", s)
F4, F6, X8 = "fira-sans-400.woff2", "fira-sans-600.woff2", "fira-sans-extra-condensed-800.woff2"
W, H = 2400, 1500; im = Image.new("RGB", (W, H), (250, 248, 245)); d = ImageDraw.Draw(im)
INK, GR, OAK, RED, BLU = (40, 36, 32), (150, 142, 132), (214, 188, 150), (226, 0, 26), (90, 140, 200)
d.text((70, 50), "Chambre fille · plan coté", font=f(X8, 64), fill=INK)
d.text((72, 130), "Relevé d'après le croquis client · cotes en mm · à vérifier sur place", font=f(F4, 30), fill=GR)
def cote(x1, y1, x2, y2, t, off=(0, 0)):
    d.line([x1, y1, x2, y2], fill=RED, width=2)
    for x, y in ((x1, y1), (x2, y2)): d.ellipse([x - 5, y - 5, x + 5, y + 5], fill=RED)
    tx, ty = (x1 + x2) / 2 + off[0], (y1 + y2) / 2 + off[1]; d.text((tx, ty), t, font=f(F6, 28), fill=RED, anchor="mm")
# --- VUE DE DESSUS (échelle 0.22 px/mm) ---
s = 0.22; ox, oy = 180, 300; RW, RH = 3600, 4480
X = lambda mm: ox + mm * s; Y = lambda mm: oy + mm * s
d.text((ox, oy - 128), "VUE DE DESSUS", font=f(F6, 32), fill=INK)
wall = 14
pts = [(0, 0), (3600, 0), (3600, 1010), (3390, 1010), (3390, 1345), (3600, 1345), (3600, RH), (0, RH), (0, 0)]
d.line([(X(a), Y(b)) for a, b in pts], fill=INK, width=wall, joint="curve")
# fenêtre (mur haut, centrée)
d.rectangle([X(1200), Y(0) - 10, X(2400), Y(0) + 10], fill=BLU); d.text((X(1800), Y(0) - 40), "FENÊTRE", font=f(F6, 26), fill=BLU, anchor="mm")
# porte (mur bas, à droite du placard)
d.rectangle([X(2500), Y(RH) - 10, X(3400), Y(RH) + 10], fill=(250, 248, 245)); r = 900 * s; d.line([X(2500), Y(RH), X(2500), Y(RH) - r], fill=GR, width=4); d.arc([X(2500) - r, Y(RH) - r, X(2500) + r, Y(RH) + r], 270, 360, fill=GR, width=3)
d.text((X(2950), Y(RH) + 40), "PORTE", font=f(F6, 26), fill=GR, anchor="mm")
# radiateur (mur droit, en bas)
d.rectangle([X(3600) - 110 * s, Y(3500), X(3600) - 10, Y(4300)], fill=(200, 200, 200), outline=INK)
d.text((X(3600) - 40, Y(3300)), "RADIATEUR", font=f(F4, 22), fill=INK, anchor="rm")
# placard (mur bas, gauche) 1700 x 620
d.rectangle([X(0), Y(RH - 620), X(1700), Y(RH)], fill=OAK, outline=INK, width=3); d.line([X(850), Y(RH - 620), X(850), Y(RH)], fill=INK, width=2)
d.text((X(850), Y(RH - 310)), "PLACARD", font=f(F6, 26), fill=INK, anchor="mm")
# lit + 2 chevets (mur gauche 4480)
d.rectangle([X(0), Y(1300), X(2000), Y(1300 + 1600)], outline=INK, width=3, fill=(235, 230, 222)); d.text((X(1000), Y(2100)), "LIT 160 × 200", font=f(F6, 26), fill=INK, anchor="mm")
for yy in (800, 2900): d.rectangle([X(0), Y(yy), X(450), Y(yy + 500)], fill=OAK, outline=INK, width=2)
d.text((X(225), Y(1050)), "chevet", font=f(F4, 20), fill=INK, anchor="mm"); d.text((X(225), Y(3150)), "chevet", font=f(F4, 20), fill=INK, anchor="mm")
cote(X(0), Y(0) - 60, X(3600), Y(0) - 60, "3600", (0, -24))
cote(X(0) - 60, Y(0), X(0) - 60, Y(RH), "4480", (-50, 0))
cote(X(3600) + 60, Y(0), X(3600) + 60, Y(1010), "1010", (55, 0))
cote(X(3600) + 60, Y(1010), X(3600) + 60, Y(1345), "335", (50, 0))
cote(X(3600) + 60, Y(1345), X(3600) + 60, Y(RH), "env. 3135", (70, 0))
cote(X(0), Y(RH) + 70, X(1700), Y(RH) + 70, "1700", (0, 26))
d.text((X(3390) - 10, Y(1180)), "décroché 210", font=f(F4, 20), fill=GR, anchor="rm")
# --- ÉLÉVATION PLACARD (échelle 0.33) ---
e = 0.33; ex, ey = 1380, 1300
EX = lambda mm: ex + mm * e; EY = lambda mm: ey - mm * e
d.text((ex, 230), "ÉLÉVATION DU PLACARD (niche existante)", font=f(F6, 32), fill=INK)
H_bas, trav, H_haut, plinthe = 1875, 215, 505, 100
tot = plinthe + H_bas + trav + H_haut
d.rectangle([EX(0), EY(tot), EX(1700), EY(0)], fill=(242, 238, 232), outline=INK, width=3)
for i, x0 in enumerate((0, 855)):
    w = 845
    d.rectangle([EX(x0), EY(plinthe + H_bas), EX(x0 + w), EY(plinthe)], fill=OAK, outline=INK, width=2)
    d.rectangle([EX(x0), EY(tot), EX(x0 + w), EY(plinthe + H_bas + trav)], fill=OAK, outline=INK, width=2)
    d.line([EX(x0 + w / 2), EY(plinthe + H_bas), EX(x0 + w / 2), EY(plinthe)], fill=INK, width=1)
    d.line([EX(x0 + w / 2), EY(tot), EX(x0 + w / 2), EY(plinthe + H_bas + trav)], fill=INK, width=1)
    for hx in (w / 2 - 40, w / 2 + 40): d.rectangle([EX(x0 + hx) - 3, EY(plinthe + 1300), EX(x0 + hx) + 3, EY(plinthe + 500)], fill=INK)
d.rectangle([EX(0), EY(plinthe + H_bas + trav), EX(1700), EY(plinthe + H_bas)], fill=(200, 176, 140), outline=INK)
cote(EX(0), EY(tot) - 40, EX(845), EY(tot) - 40, "845", (0, -22)); cote(EX(855), EY(tot) - 40, EX(1700), EY(tot) - 40, "845", (0, -22))
cote(EX(1700) + 50, EY(plinthe), EX(1700) + 50, EY(plinthe + H_bas), "1875", (55, 0))
cote(EX(1700) + 50, EY(plinthe + H_bas), EX(1700) + 50, EY(plinthe + H_bas + trav), "215", (50, 0))
cote(EX(1700) + 50, EY(plinthe + H_bas + trav), EX(1700) + 50, EY(tot), "505", (50, 0))
d.text((ex, ey + 40), "Profondeur 620 · 2 travées · 4 portes basses + 4 portes hautes · décor : à choisir", font=f(F4, 26), fill=GR)
d.text((ex, ey + 80), "Même principe que la chambre garçon :\ncadre d'habillage + fileurs, portes alignées, barres noires", font=f(F4, 26), fill=GR)
im.save(OUT)
