"""Retire les prix (« 5 400 DA/m² », « dès 4 400 DA/m² ») des visuels et met « Devis gratuit » à la place, même police et même hauteur."""
import numpy as np
from PIL import Image, ImageDraw, ImageFont
FONT = "/tmp/claude-0/fonts/package/files/poppins-latin-700-normal.woff"
TXT = "Devis gratuit"
# fichier : (zone à effacer, haut et bas des chiffres, ancrage 'l' (gauche, x) ou 'r' (droite, x))
Z = {}
for n in ["out/04", "out2/22"]: Z[n] = ((52, 1240, 330, 1292), (1251, 1284), ("l", 60))
Z["out2/23"] = ((50, 1238, 362, 1292), (1251, 1284), ("l", 58))
for n in ["out/08", "out/11", "out2/24", "out2/27"]: Z[n] = ((85, 1590, 322, 1646), (1600, 1638), ("l", 95))
for n in ["out/03", "out/05", "out/14", "out2/20"]: Z[n] = ((715, 1176, 1012, 1226), (1185, 1217), ("r", 1000))
Z["out2/21"] = ((50, 958, 345, 1008), (967, 1002), ("l", 58))
Z["out/13"] = ((832, 1118, 1046, 1168), (1128, 1160), ("r", 1040))
def font_for(h):
    for s in range(14, 140):
        f = ImageFont.truetype(FONT, s); b = f.getbbox("D")
        if b[3] - b[1] >= h: return f
for n, (box, (yt, yb), (side, x)) in Z.items():
    im = Image.open(n + ".jpg").convert("RGB"); a = np.asarray(im).astype(int)
    x0, y0, x1, y1 = box; sub = a[y0:y1, x0:x1]; lum = sub.mean(2)
    dark_bg = np.median(lum) < 128
    mask = (lum < 160) if dark_bg else (lum > 120)              # pixels de fond
    bg = tuple(int(v) for v in np.median(sub[mask], axis=0))
    ink = (255, 255, 255) if dark_bg else (23, 21, 18)
    d = ImageDraw.Draw(im); d.rectangle(box, fill=bg)
    f = font_for(yb - yt + 1); b = f.getbbox("D"); w = f.getlength(TXT)
    tx = x if side == "l" else x - w
    d.text((tx - (b[0] if side == "l" else 0), yb + 1 - b[3]), TXT, font=f, fill=ink)
    im.save(n + ".jpg", quality=95, subsampling=0); print(n, "fond", bg)
