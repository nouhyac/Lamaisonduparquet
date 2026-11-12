import sys
from PIL import Image, ImageDraw, ImageFont
S, OUT = sys.argv[1], sys.argv[2]
F = S + "/hcheck/site/assets/fonts/"
def font(n, s):
    try: return ImageFont.truetype(F + n, s)
    except Exception: return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", s)
names = ["Armoire Signature", "Armoire Vitrine", "Armoire Coiffeuse"]
for i in range(3):
    im = Image.open(f"{S}/hf/ar{i}.png").convert("RGB")
    W, H = im.size; d = ImageDraw.Draw(im, "RGBA"); u = W / 1000
    # label top-left
    t1, t2 = font("fira-sans-extra-condensed-800.woff2", int(44*u)), font("fira-sans-500.woff2", int(22*u))
    txt = f"PROPOSITION {i+1}"; sub = f"{names[i]} · Maya"
    w = max(d.textlength(txt, t1), d.textlength(sub, t2)) + 56*u
    d.rectangle([30*u, 30*u, 30*u + w, 30*u + 118*u], fill=(255, 255, 255, 235))
    d.rectangle([30*u, 30*u, 38*u, 30*u + 118*u], fill=(226, 0, 26, 255))
    d.text((58*u, 40*u), txt, font=t1, fill=(20, 20, 20))
    d.text((58*u, 98*u), sub, font=t2, fill=(80, 80, 80))
    # badge bottom-right
    b1, b2 = font("fira-sans-extra-condensed-800.woff2", int(34*u)), font("fira-sans-400.woff2", int(20*u))
    l1, l2 = "SARL MYF", "Panneaux EGGER · lamaisonduparquet.org"
    bw = max(d.textlength(l1, b1), d.textlength(l2, b2)) + 44*u
    x0, y0 = W - 30*u - bw, H - 30*u - 92*u
    d.rectangle([x0, y0, W - 30*u, H - 30*u], fill=(255, 255, 255, 235))
    d.text((x0 + 22*u, y0 + 10*u), l1, font=b1, fill=(0, 0, 0))
    d.text((x0 + 22*u, y0 + 56*u), l2, font=b2, fill=(80, 80, 80))
    im.save(f"{OUT}/armoire-maya-{i+1}.jpg", quality=92)
