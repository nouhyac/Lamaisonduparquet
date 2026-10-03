"""Remplace 0550 48 24 27 par 0549 50 68 57 (WhatsApp) sur les visuels, même police (Poppins Bold) et même taille."""
import numpy as np
from PIL import Image, ImageDraw, ImageFont
FONT = "/tmp/claude-0/fonts/package/files/poppins-latin-700-normal.woff"
NEW = "0549 50 68 57"
BOX = {"bar1350": (758, 1265, 1065, 1330), "card1920": (700, 1592, 1012, 1662),
       "big1920": (160, 1055, 720, 1135), "sq1080": (755, 985, 1065, 1050)}
LAYOUT = {"out/02": "bar1350", "out/04": "bar1350", "out/06": "bar1350", "out/10": "bar1350", "out2/22": "bar1350", "out2/23": "bar1350",
          "out/08": "card1920", "out/11": "card1920", "out2/24": "card1920", "out2/27": "card1920",
          "out/03": "big1920", "out/05": "big1920", "out/14": "big1920", "out2/20": "big1920", "out2/21": "sq1080"}
def font_for(h):
    for s in range(20, 140):
        f = ImageFont.truetype(FONT, s); b = f.getbbox("0")
        if b[3] - b[1] >= h: return f
for name, lay in LAYOUT.items():
    im = Image.open(name + ".jpg").convert("RGB"); a = np.asarray(im).astype(int)
    x0, y0, x1, y1 = BOX[lay]; sub = a[y0:y1, x0:x1].mean(2); m = sub > 200
    ys, xs = np.where(m); bx0, by0, bx1, by1 = x0 + xs.min(), y0 + ys.min(), x0 + xs.max(), y0 + ys.max()
    bg = tuple(int(v) for v in np.median(a[y0:y1, x0:x1][~m], axis=0))
    d = ImageDraw.Draw(im); d.rectangle((bx0 - 4, by0 - 4, bx1 + 6, by1 + 6), fill=bg)
    f = font_for(by1 - by0 + 1); b = f.getbbox("0")
    d.text((bx0 - b[0], by1 + 1 - b[3]), NEW, font=f, fill=(255, 255, 255))
    im.save(name + ".jpg", quality=95, subsampling=0); print(name, lay, (bx0, by0, bx1, by1), "fond", bg)
