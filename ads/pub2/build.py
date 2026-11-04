"""Pub Meta v2 (Reel 9:16, ~18 s) : accroche en 1 s, carrelage -> parquet, 5 décors, preuves, showroom, CTA WhatsApp.
Usage : python3 build.py <fonts_dir> <ffmpeg> <sortie.mp4> [A|B]   (B = accroche en darija)"""
import sys, math, subprocess
from PIL import Image, ImageDraw, ImageFont, ImageFilter
FD, FF, OUT = sys.argv[1:4]; VAR = sys.argv[4] if len(sys.argv) > 4 else "A"
R = "/home/user/Lamaisonduparquet/"; SRC = R + "ads/sources/"; K = R + "ads/meubles/kamel/brut/"
W, H, FPS = 1080, 1920, 30; RED = (226, 0, 26)
X8 = FD + "/fira-sans-extra-condensed-800.woff2"; F6 = FD + "/fira-sans-600.woff2"; F4 = FD + "/fira-sans-400.woff2"
fnt = lambda f, s: ImageFont.truetype(f, s)
def ease(t): t = max(0, min(1, t)); return 0.5 - 0.5 * math.cos(math.pi * t)
def pop(t): t = max(0, min(1, t)); return 1 + 0.25 * math.sin(math.pi * t) * (1 - t)
def cover(im, z=1.0, cx=0.5, cy=0.5):
    r = max(W / im.width, H / im.height) * z; im = im.resize((int(im.width * r) + 1, int(im.height * r) + 1), Image.LANCZOS)
    x = int((im.width - W) * cx); y = int((im.height - H) * cy); return im.crop((x, y, x + W, y + H))
L = lambda n: Image.open(n).convert("RGB")
def block(d, lines, y, size=110, a=1.0, center=True, box=True):
    """Gros texte façon Reels : lignes blanches sur bande noire, mot-clé rouge si préfixé par '!'."""
    f = fnt(X8, size)
    for ln in lines:
        red = ln.startswith("!"); t = ln.lstrip("!"); w = d.textlength(t, f); x = (W - w) / 2 if center else 60
        if box: d.rectangle([x - 26, y - 6, x + w + 26, y + size * 1.08], fill=(RED if red else (15, 15, 15)) + (int(235 * a),))
        d.text((x, y - size * 0.08), t, font=f, fill=(255, 255, 255, int(255 * a))); y += int(size * 1.22)
def brand(d):
    d.text((W - 300, 60), "SARL MYF", font=fnt(X8, 54), fill=(255, 255, 255)); d.rectangle([W - 300, 122, W - 64, 128], fill=RED)
p = subprocess.Popen([FF, "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                      "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p", "-movflags", "+faststart", OUT], stdin=subprocess.PIPE)
def emit(im): p.stdin.write(im.convert("RGB").tobytes())
def dark(im, k=0.35):
    o = Image.new("RGB", im.size, (0, 0, 0)); return Image.blend(im, o, k)

tile = L(SRC + "v-tile.jpg"); oak = L(SRC + "v-el2863.jpg")
# 1. ACCROCHE (0 -> 1.6 s) : carrelage + question qui claque
hook = (["Votre carrelage", "!vous ennuie ?"] if VAR == "A" else ["Bghit tbeddel", "!el carrelage ?"])
for i in range(int(1.6 * FPS)):
    t = i / FPS; im = cover(tile, 1.12 - 0.06 * t / 1.6); d = ImageDraw.Draw(im, "RGBA"); brand(d)
    s = pop(t / 0.35); block(d, hook, 560, int(118 * s)); emit(im)
# 2. RÉVÉLATION (1.6 -> 4.4 s) : balayage carrelage -> parquet, même pièce
n = int(2.8 * FPS)
for i in range(n):
    t = i / FPS; z = 1.06 - 0.04 * i / n; a, b = cover(tile, z), cover(oak, z); k = ease((t - 0.15) / 0.9); x = int(W * k)
    im = a.copy(); im.paste(b.crop((0, 0, x, H)), (0, 0)); d = ImageDraw.Draw(im, "RGBA")
    if 0 < x < W: d.rectangle([x - 6, 0, x + 6, H], fill=(255, 255, 255))
    brand(d)
    if t > 1.0: block(d, ["On pose le parquet", "!DIRECTEMENT DESSUS"], 520, 100, ease((t - 1.0) / 0.25))
    emit(im)
# 3. 5 DÉCORS (4.4 -> 7.4 s)
decos = [("v-el2863.jpg", "Chêne Asgil miel"), ("v-el1061.jpg", "Chêne Achensee"), ("v-el2970.jpg", "Chêne du Nord"), ("v-el2416.jpg", "Melba beige Aqua"), ("v-el1055.jpg", "Chêne Bardolino")]
for j, (f, nm) in enumerate(decos):
    A = L(SRC + f)
    for i in range(int(0.6 * FPS)):
        im = cover(A, 1.04 + 0.03 * i / 18); d = ImageDraw.Draw(im, "RGBA"); brand(d)
        block(d, ["5 décors EGGER", "!en stock à Alger"], 420, 92)
        f2 = fnt(X8, 74); w = d.textlength(nm, f2); d.rectangle([(W - w) / 2 - 30, 1420, (W + w) / 2 + 30, 1520], fill=(255, 255, 255, 240))
        d.text(((W - w) / 2, 1424), nm, font=f2, fill=(15, 15, 15))
        for q in range(5): d.ellipse([W / 2 - 110 + q * 48, 1560, W / 2 - 86 + q * 48, 1584], fill=RED if q == j else (255, 255, 255))
        emit(im)
# 4. PREUVES (7.4 -> 10.4 s) : 3 bénéfices qui tombent un par un
B = dark(cover(L(SRC + "v-egger-el2416.jpg")), 0.45)
items = [("1 JOURNÉE", "de pose"), ("0 GRAVATS", "on ne casse rien"), ("0 POUSSIÈRE", "vous restez chez vous")]
for i in range(int(3.0 * FPS)):
    t = i / FPS; im = cover(B, 1.0 + 0.05 * t / 3); d = ImageDraw.Draw(im, "RGBA"); brand(d)
    for k, (a1, a2) in enumerate(items):
        al = ease((t - k * 0.55) / 0.25)
        if al <= 0: continue
        y = 520 + k * 330; s = pop((t - k * 0.55) / 0.35)
        d.rectangle([90, y, 990, y + 270], fill=(255, 255, 255, int(235 * al))); d.rectangle([90, y, 108, y + 270], fill=RED + (int(255 * al),))
        d.text((150, y + 18), a1, font=fnt(X8, int(118 * s)), fill=(15, 15, 15, int(255 * al)))
        d.text((154, y + 168), a2, font=fnt(F6, 52), fill=(90, 90, 90, int(255 * al)))
    emit(im)
# 5. AQUA (10.4 -> 12.6 s)
A = L(K + "kamel-2.jpg")
for i in range(int(2.2 * FPS)):
    t = i / FPS; im = cover(A, 1.02 + 0.06 * t / 2.2); d = ImageDraw.Draw(im, "RGBA"); brand(d)
    block(d, ["Cuisine ?", "!Version AQUA", "résiste 24 h à l'eau"], 1180, 96, ease(t / 0.3)); emit(im)
# 6. SHOWROOM RÉEL (12.6 -> 15.0 s)
for f, lines in [("v-show-banner.jpg", ["Showroom", "!Dar El Beïda"]), ("v-show-floor.jpg", ["Touchez les lames", "!avant de choisir"])]:
    A = L(SRC + f)
    for i in range(int(1.2 * FPS)):
        t = i / FPS; im = cover(A, 1.03 + 0.05 * t / 1.2); d = ImageDraw.Draw(im, "RGBA"); brand(d)
        block(d, lines, 1260, 100, ease(t / 0.2)); emit(im)
# 7. APPEL À L'ACTION (15.0 -> 19.0 s)
A = cover(oak).filter(ImageFilter.GaussianBlur(10)); A = dark(A, 0.25)
for i in range(int(4.0 * FPS)):
    t = i / FPS; im = A.copy(); d = ImageDraw.Draw(im, "RGBA"); brand(d)
    d.text((80, 300), "Envoyez-nous", font=fnt(X8, 120), fill="white"); d.text((80, 440), "vos m²", font=fnt(X8, 160), fill=RED)
    d.text((84, 640), "et recevez votre devis GRATUIT", font=fnt(F6, 58), fill="white")
    s = 1 + 0.04 * math.sin(t * 6); bw, bh = 920 * s, 210 * s; x0, y0 = (W - bw) / 2, 900 - (bh - 210) / 2
    d.rounded_rectangle([x0, y0, x0 + bw, y0 + bh], radius=40, fill=(37, 211, 102))
    f2 = fnt(X8, int(104 * s)); tx = "0794 70 93 23"; w = d.textlength(tx, f2); d.text(((W - w) / 2, y0 + 44 * s), tx, font=f2, fill="white")
    d.text((W / 2 - 135, y0 + bh + 24), "WhatsApp", font=fnt(F6, 56), fill="white")
    d.text((80, 1330), "Livraison partout en Algérie", font=fnt(F6, 54), fill="white")
    d.text((80, 1410), "Parquet EGGER · en stock à Alger", font=fnt(F6, 54), fill="white")
    d.rectangle([0, H - 220, W, H], fill=(255, 255, 255)); d.rectangle([0, H - 220, W, H - 210], fill=RED)
    d.text((70, H - 180), "lamaisonduparquet.org", font=fnt(X8, 76), fill=(15, 15, 15))
    d.text((72, H - 92), "SARL MYF · La Maison du Parquet", font=fnt(F4, 40), fill=(80, 80, 80))
    emit(im)
p.stdin.close(); p.wait()
