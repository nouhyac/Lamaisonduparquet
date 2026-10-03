"""Ajoute SARL MYF (comme sur le site) et retire « Représentant EGGER » des visuels."""
import numpy as np
from PIL import Image
def erase(a, x0, y0, x1, y1, pad=5):
    """Efface une zone en interpolant entre la ligne au-dessus et la ligne en dessous (fond photo ou dégradé)."""
    x0, y0, x1, y1 = x0 - pad, y0 - pad, x1 + pad, y1 + pad
    top = a[y0 - 2:y0, x0:x1].mean(0); bot = a[y1:y1 + 2, x0:x1].mean(0)
    for i, y in enumerate(range(y0, y1)):
        t = (i + 1) / (y1 - y0 + 1); a[y, x0:x1] = (1 - t) * top + t * bot
def paste(im, tag, x, y): im.alpha_composite(tag, (int(x), int(y)))
B, Wt, L = (Image.open(f).convert("RGBA") for f in ("myf-black.png", "myf-white.png", "label14.png"))
TR = (676, 49, 1015, 63)                 # « REPRÉSENTANT EGGER · ALGÉRIE » en haut à droite
for n in ["02", "03", "04", "05", "06", "08", "10", "11", "13", "14"]:
    a = np.asarray(Image.open(f"src/{n}.jpg").convert("RGB")).astype(float)
    if n in ("03", "05", "14"):          # formats story : en-tête à y≈312, pas de mention à droite
        cy, region = 312, a[280:345, 640:1030]
    else:
        erase(a, *TR); cy, region = 56, a[30:85, 640:1030]
    if n == "14": erase(a, 81, 363, 548, 381)
    dark = region.mean() < 140
    im = Image.fromarray(a.clip(0, 255).astype("uint8")).convert("RGBA")
    tag = Wt if dark else B
    paste(im, tag, 1022 - tag.width, cy - tag.height / 2 - 2)
    if n == "14": paste(im, L, 77, 358)
    im.convert("RGB").save(f"out/{n}.jpg", quality=95, subsampling=0)
    print(n, "blanc" if dark else "noir")

# photos brutes (sans mise en page) : SARL MYF en bas à droite, couleur selon le fond
for n in ["01", "07", "09", "12", "15"]:
    im = Image.open(f"src/{n}.jpg").convert("RGBA"); w, h = im.size
    k = w / 1080; tag0 = Wt if np.asarray(im.convert("L"))[int(h*.88):, int(w*.6):].mean() < 140 else B
    tag = tag0.resize((round(tag0.width * k), round(tag0.height * k)), Image.LANCZOS)
    paste(im, tag, w - tag.width - 40 * k, h - tag.height - 40 * k)
    im.convert("RGB").save(f"out/{n}.jpg", quality=95, subsampling=0); print(n, "photo")
