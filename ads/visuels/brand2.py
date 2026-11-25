"""Deuxième lot : même traitement que brand.py (SARL MYF, sans « Représentant EGGER »)."""
import numpy as np
from PIL import Image
from brand import erase, paste, sign, B, Wt, L, TR   # réutilise les outils du premier lot (le relancer régénère aussi out/)
def tag_for(region): return Wt if region.mean() < 140 else B
for n in ["20", "21", "22", "23", "24", "27"]:
    a = np.asarray(Image.open(f"src2/{n}.jpg").convert("RGB")).astype(float)
    if n == "20": erase(a, 81, 363, 548, 381); cy, reg = 312, a[280:345, 640:1030]
    elif n == "21": cy, reg = 68, a[40:100, 640:1030]
    else: erase(a, *TR); cy, reg = 56, a[30:85, 640:1030]
    im = Image.fromarray(a.clip(0, 255).astype("uint8")).convert("RGBA"); t = tag_for(reg)
    sign(im, t, 1022, cy - t.height / 2 - 2)
    if n == "20": paste(im, L, 77, 358)
    im.convert("RGB").save(f"out2/{n}.jpg", quality=95, subsampling=0); print(n)
for n in ["16", "17", "18", "19", "25", "26", "28", "29", "30"]:      # photos du showroom et photos brutes
    im = Image.open(f"src2/{n}.jpg").convert("RGBA"); w, h = im.size; k = min(w, h) / 1080
    t0 = tag_for(np.asarray(im.convert("L"))[int(h*.88):, int(w*.6):])
    sign(im, t0, w - 40*k, h - (t0.height + 32)*k - 40*k, k)
    im.convert("RGB").save(f"out2/{n}.jpg", quality=93, subsampling=0); print(n, "photo")
