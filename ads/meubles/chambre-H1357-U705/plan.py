import sys
from PIL import Image, ImageDraw, ImageFont
FD = sys.argv[2]
def font(sz, b=False): return ImageFont.truetype(f"{FD}/fira-sans-{'600' if b else '400'}.woff2", sz)
W, H = 2800, 1700
im = Image.new("RGB", (W, H), (250, 248, 245)); d = ImageDraw.Draw(im)
INK, RED, GR = (30, 30, 30), (226, 0, 26), (130, 125, 118)
OAK, U705, WH = (196, 168, 132), (178, 172, 163), (243, 241, 237)
d.text((60, 40), "Chambre · plan coté", font=font(64, True), fill=INK)
d.text((62, 118), "Lecture du croquis client · cotes en mm · à valider sur place", font=font(30), fill=GR)

s = 0.22; ox, oy = 170, 300
X = lambda v: ox + v * s; Y = lambda v: oy + v * s
def rect(x0, z0, x1, z1, fill, lab=None, sz=22, outline=INK):
    d.rectangle([X(x0), Y(z0), X(x1), Y(z1)], fill=fill, outline=outline, width=2)
    if lab: d.text(((X(x0) + X(x1)) / 2, (Y(z0) + Y(z1)) / 2), lab, font=font(sz), fill=INK, anchor="mm")
def cote(x0, y0, x1, y1, t, off=(0, -22)):
    d.line([x0, y0, x1, y1], fill=RED, width=2)
    for x, y in ((x0, y0), (x1, y1)): d.ellipse([x - 4, y - 4, x + 4, y + 4], fill=RED)
    d.text(((x0 + x1) / 2 + off[0], (y0 + y1) / 2 + off[1]), t, font=font(26, True), fill=RED, anchor="mm")

d.text((ox, oy - 110), "VUE DE DESSUS", font=font(32, True), fill=INK)
# floor polygon
poly = [(2020, 0), (5870, 0), (5870, 3750), (0, 3750), (0, 1260), (2020, 1260)]
d.polygon([(X(a), Y(b)) for a, b in poly], fill=(236, 226, 210))
# walls
L = lambda pts, w=10: d.line([(X(a), Y(b)) for a, b in pts], fill=INK, width=w)
L([(2020, 1260), (2020, 0), (5870, 0), (5870, 1300)]); L([(5870, 1900), (5870, 3750), (0, 3750), (0, 1260), (700, 1260)]); L([(1650, 1260), (2020, 1260)])
d.line([X(5870), Y(1300), X(5870), Y(1900)], fill=(90, 150, 220), width=10)
d.text((X(5870) + 18, Y(1600)), "fenêtre", font=font(22), fill=(90, 150, 220), anchor="lm")
d.arc([X(700) - 950 * s, Y(1260) - 950 * s, X(700) + 950 * s, Y(1260) + 950 * s], 0, 90, fill=GR, width=2); d.line([X(700), Y(1260), X(700), Y(2210)], fill=GR, width=3)
d.text((X(1175), Y(1260) - 30), "accès (à confirmer)", font=font(20), fill=GR, anchor="mm")
# furniture
rect(2250, 30, 2850, 110, (225, 225, 225)); d.text((X(2550), Y(110) + 18), "radiateur", font=font(18), fill=GR, anchor="mm")
rect(2870, 0, 4970, 400, U705, "meuble TV 2100", 22)
rect(4970, 0, 5870, 600, U705, "armoire 2 portes", 20)
rect(0, 1260, 620, 3750, U705); d.text((X(310), Y(2505)), "placard 2490", font=font(22), fill=INK, anchor="mm")
for z in (1260, 1330, 2440, 2570, 3680): pass
rect(0, 1260, 620, 1330, OAK, outline=OAK); rect(0, 2440, 620, 2570, OAK, outline=OAK); rect(0, 3680, 620, 3750, OAK, outline=OAK)
rect(2400, 1750, 4200, 3750, WH, "lit 1800 × 2000", 24)
rect(2400, 3670, 4200, 3750, OAK)
rect(1880, 3330, 2380, 3730, U705, "500", 18); rect(4220, 3330, 4720, 3730, U705, "500", 18)
rect(5270, 2490, 5870, 3750, OAK, "bureau", 20)
# cotes
cote(X(2020), Y(0) - 45, X(5870), Y(0) - 45, "3850")
cote(X(0), Y(3750) + 45, X(5870), Y(3750) + 45, "5870", (0, 24))
cote(X(5870) + 120, Y(0), X(5870) + 120, Y(3750), "3750", (48, 0))
cote(X(0) - 45, Y(1260), X(0) - 45, Y(3750), "2490", (-42, 0))
cote(X(2870), Y(400) + 30, X(4970), Y(400) + 30, "2100", (0, 22))
cote(X(4970), Y(600) + 30, X(5870), Y(600) + 30, "900", (0, 22))
cote(X(2400), Y(1750) - 30, X(4200), Y(1750) - 30, "1800")

# elevation wardrobe
ex, ey, es = 1700, 360, 0.36
EX = lambda v: ex + v * es; EY = lambda v: ey + (2760 - v) * es
d.text((ex, ey - 150), "ÉLÉVATION DU PLACARD 2490", font=font(32, True), fill=INK)
def er(x0, y0, x1, y1, f):
    d.rectangle([EX(x0), EY(y1), EX(x1), EY(y0)], fill=f, outline=INK, width=2)
er(0, 0, 2490, 2760, OAK)
for b0 in (70, 1310):
    for a in (b0, b0 + 555):
        er(a, 50, a + 555, 2030, U705); er(a, 2140, a + 555, 2710, U705)
    for xh in (b0 + 536, b0 + 574): d.rectangle([EX(xh) - 2, EY(1600), EX(xh) + 2, EY(900)], fill=(20, 20, 20))
ce = lambda y0, y1, t: cote(EX(2490) + 50, EY(y0), EX(2490) + 50, EY(y1), t, (45, 0))
ce(50, 2030, "1980"); ce(2030, 2140, "110"); ce(2140, 2710, "570")
yb = EY(0) + 45
for a, b, t in ((0, 70, "70"), (70, 1180, "1110"), (1180, 1310, "130"), (1310, 2420, "1110"), (2420, 2490, "70")):
    cote(EX(a), yb, EX(b), yb, t, (0, 24))
d.text((ex, EY(0) + 110), "Profondeur 620 · 8 portes · barres noires longues", font=font(24), fill=GR)
# legend
ly = EY(0) + 175
d.text((ex, ly), "Décors EGGER choisis :", font=font(26, True), fill=INK)
for i, (c, t) in enumerate(((OAK, "H1357 · chêne : cadre 70 / 130, bandeau 110, tête de lit, plateaux"),
                            (U705, "U705 ST9 · gris angora : portes, façades, tiroirs"))):
    y = ly + 48 + i * 44
    d.rectangle([ex, y, ex + 32, y + 28], fill=c, outline=INK); d.text((ex + 46, y + 14), t, font=font(23), fill=INK, anchor="lm")
im.save(sys.argv[1]); print("ok")
