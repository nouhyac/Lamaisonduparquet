"""Plan coté (vue de dessus + élévation mur du fond) de la cuisine en L, d'après le croquis."""
import sys
from PIL import Image, ImageDraw, ImageFont
FD = sys.argv[2]
def f(n, s): return ImageFont.truetype(f"{FD}/{n}", s)
F8 = "fira-sans-extra-condensed-800.woff2" if False else None
import glob, os
fonts = {os.path.basename(p): p for p in glob.glob(FD + "/*")}
def font(size, bold=False):
    return ImageFont.truetype(f"{FD}/fira-sans-{'600' if bold else '400'}.woff2", size)

W, H = 2600, 1680
im = Image.new("RGB", (W, H), (250, 248, 245)); d = ImageDraw.Draw(im)
INK, RED, GR = (30, 30, 30), (226, 0, 26), (130, 125, 118)
BAS, OAK, COL = (205, 197, 186), (214, 178, 136), (190, 182, 170)
d.text((60, 40), "Cuisine en L · plan coté", font=font(64, True), fill=INK)
d.text((62, 118), "Lecture du croquis client · cotes en mm · à valider sur place", font=font(30), fill=GR)

s = 0.27; ox, oy = 230, 330
X = lambda v: ox + v * s; Y = lambda v: oy + v * s
def rect(x0, z0, x1, z1, fill, lab=None, size=22):
    d.rectangle([X(x0), Y(z0), X(x1), Y(z1)], fill=fill, outline=INK, width=2)
    if lab: d.text(((X(x0) + X(x1)) / 2, (Y(z0) + Y(z1)) / 2), lab, font=font(size), fill=INK, anchor="mm")
def cote(x0, y0, x1, y1, txt, off=(0, -22)):
    d.line([x0, y0, x1, y1], fill=RED, width=2)
    for x, y in ((x0, y0), (x1, y1)): d.ellipse([x - 4, y - 4, x + 4, y + 4], fill=RED)
    d.text(((x0 + x1) / 2 + off[0], (y0 + y1) / 2 + off[1]), txt, font=font(26, True), fill=RED, anchor="mm")

d.text((ox, oy - 120), "VUE DE DESSUS", font=font(32, True), fill=INK)
# walls
d.line([X(0), Y(3300), X(0), Y(0), X(3200), Y(0)], fill=INK, width=10)
# back run
rect(0, 0, 600, 600, BAS, "angle")
rect(600, 0, 1200, 600, BAS, "plaque")
rect(1200, 0, 1700, 600, BAS, "500")
rect(1700, 0, 2500, 600, BAS, "évier")
rect(2500, 0, 3100, 600, BAS, "lave-v.")
rect(3100, 0, 3200, 600, BAS)
# left run
rect(0, 600, 600, 1600, BAS, "2 portes", 20)
rect(0, 1600, 600, 1750, BAS)
rect(0, 1750, 640, 2390, COL, "four", 22)
rect(0, 2390, 640, 3090, COL, "frigo", 22)
cote(X(0), Y(0) - 50, X(3200), Y(0) - 50, "3200")
cote(X(600), Y(600) + 40, X(1200), Y(600) + 40, "600", (0, 22))
cote(X(1200), Y(600) + 40, X(1700), Y(600) + 40, "500", (0, 22))
cote(X(1700), Y(600) + 40, X(2500), Y(600) + 40, "800", (0, 22))
cote(X(2500), Y(600) + 40, X(3100), Y(600) + 40, "600", (0, 22))
cote(X(0) - 60, Y(600), X(0) - 60, Y(1600), "1000", (-40, 0))
cote(X(0) - 60, Y(1600), X(0) - 60, Y(1750), "150", (-40, 0))
cote(X(0) - 60, Y(1750), X(0) - 60, Y(3090), "1340", (-45, 0))
cote(X(640) + 30, Y(1750), X(640) + 30, Y(2390), "640", (40, 0))
cote(X(640) + 30, Y(2390), X(640) + 30, Y(3090), "700", (40, 0))
d.text((X(1600), Y(1700)), "Hauteur sous plafond 2700", font=font(26), fill=GR, anchor="mm")

# elevation back wall
ex, ey, es = 1300, 330, 0.36
EX = lambda v: ex + v * es; EY = lambda v: ey + (2700 - v) * es
d.text((ex, ey - 120), "ÉLÉVATION MUR DU FOND", font=font(32, True), fill=INK)
def erect(x0, y0, x1, y1, fill, lab=None):
    d.rectangle([EX(x0), EY(y1), EX(x1), EY(y0)], fill=fill, outline=INK, width=2)
    if lab: d.text(((EX(x0) + EX(x1)) / 2, (EY(y0) + EY(y1)) / 2), lab, font=font(20), fill=INK, anchor="mm")
WH = (243, 241, 237)
d.rectangle([EX(0), EY(2700), EX(3200), EY(0)], outline=GR, width=2)
erect(0, 0, 3200, 120, (60, 58, 56))
for a, b in ((0, 600), (600, 1200), (1200, 1700), (1700, 2100), (2100, 2500), (2500, 3100), (3100, 3200)):
    erect(a, 120, b, 840, BAS)
for y in (410, 600): d.line([EX(600), EY(y), EX(1200), EY(y)], fill=INK, width=2)
erect(0, 840, 3200, 878, (45, 45, 47))
for a, b in ((0, 600), (600, 1200), (1500, 1900), (1900, 2300), (2300, 2700), (2700, 3100)):
    erect(a, 1450 if a != 600 else 1560, b, 2170, OAK)
erect(600, 1450, 1200, 1560, (185, 188, 191), "hotte")
erect(1200, 1450, 1500, 2170, WH, "niche")
for a, b in ((0, 600), (600, 1200), (1200, 1900), (1900, 2500), (2500, 3100)):
    erect(a, 2170, b, 2620, WH)
ce = lambda y0, y1, t: cote(EX(3200) + 50, EY(y0), EX(3200) + 50, EY(y1), t, (45, 0))
ce(0, 120, "120"); ce(120, 878, "758"); ce(1450, 2170, "720"); ce(2170, 2620, "450")
cote(EX(1200), EY(2700) - 30, EX(1500), EY(2700) - 30, "300")
d.text((ex, EY(0) + 40), "Proposition décors EGGER (à choisir au showroom) :", font=font(26, True), fill=INK)
for i, (c, t) in enumerate(((BAS, "Bas + colonnes : U702 ST9 gris cachemire"), (OAK, "Hauts 720 : H1145 ST10 chêne Bardolino"),
                            (WH, "Rangée 450 + bandeau : W1000 ST9 blanc premium"), ((45, 45, 47), "Plan de travail : U999 noir"))):
    y = EY(0) + 85 + i * 42
    d.rectangle([ex, y, ex + 32, y + 28], fill=c, outline=INK); d.text((ex + 46, y + 14), t, font=font(24), fill=INK, anchor="lm")
im.save(sys.argv[1]); print("ok")
