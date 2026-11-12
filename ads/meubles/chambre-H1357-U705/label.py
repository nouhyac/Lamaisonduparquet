"""Youcef-style label: white card top-left, red bar, condensed bold title + subtitle.
python3 label.py in.png out.jpg "TITRE" "Sous-titre" fontsdir"""
import sys
from PIL import Image, ImageDraw, ImageFont
src, dst, title, sub, FD = sys.argv[1:6]
im = Image.open(src).convert("RGB")
W, H = im.size
u = W / 1500
ft = ImageFont.truetype(f"{FD}/fira-sans-extra-condensed-800.woff2", int(62 * u))
fs = ImageFont.truetype(f"{FD}/fira-sans-600.woff2", int(27 * u))
d = ImageDraw.Draw(im)
pad = int(30 * u); x0 = int(42 * u); y0 = int(42 * u)
tw = d.textlength(title, font=ft); sw = d.textlength(sub, font=fs)
w = int(max(tw, sw) + 2 * pad + 12 * u); h = int(162 * u)
d.rectangle([x0, y0, x0 + w, y0 + h], fill=(246, 245, 243))
d.rectangle([x0, y0, x0 + int(10 * u), y0 + h], fill=(226, 0, 26))
d.text((x0 + pad + int(10 * u), y0 + int(18 * u)), title, font=ft, fill=(17, 17, 17))
d.text((x0 + pad + int(10 * u), y0 + int(98 * u)), sub, font=fs, fill=(85, 85, 85))
im.save(dst, quality=94)
print("ok", W, H)
