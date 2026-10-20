"""Pub Meta v3 « Visite showroom » (Reel 9:16, ~20 s). Objectif : faire venir les clients au showroom de Dar El Beïda.
Usage : python3 build.py <fonts_dir> <ffmpeg> <sortie.mp4> [A|B]   (B = accroche en darija)"""
import sys, math, subprocess
from PIL import Image, ImageDraw, ImageFont, ImageFilter
FD, FF, OUT = sys.argv[1:4]; VAR = sys.argv[4] if len(sys.argv) > 4 else "A"
R = "/home/user/Lamaisonduparquet/"; SRC = R + "ads/sources/"; K = R + "ads/meubles/kamel/brut/"
W, H, FPS = 1080, 1920, 30; RED = (226, 0, 26)
X8 = FD + "/fira-sans-extra-condensed-800.woff2"; F6 = FD + "/fira-sans-600.woff2"; F4 = FD + "/fira-sans-400.woff2"
fnt = lambda f, s: ImageFont.truetype(f, s)
def ease(t): t = max(0, min(1, t)); return 0.5 - 0.5 * math.cos(math.pi * t)
L = lambda n: Image.open(n).convert("RGB")
def view(im, z, cx, cy):
    """Recadrage 9:16 à partir d'un point (cx, cy) en fraction de l'image, zoom z (1 = image entière en largeur)."""
    r = max(W / im.width, H / im.height) * z; big = im.resize((int(im.width * r) + 1, int(im.height * r) + 1), Image.LANCZOS)
    x = int(min(max(big.width * cx - W / 2, 0), big.width - W)); y = int(min(max(big.height * cy - H / 2, 0), big.height - H))
    return big.crop((x, y, x + W, y + H))
def shot(im, dur, z0, z1, c0, c1, draw=None):
    n = int(dur * FPS)
    for i in range(n):
        t = i / n; e = ease(t); fr = view(im, z0 + (z1 - z0) * e, c0[0] + (c1[0] - c0[0]) * e, c0[1] + (c1[1] - c0[1]) * e)
        d = ImageDraw.Draw(fr, "RGBA")
        if draw: draw(d, i / FPS)
        emit(fr)
def titre(d, lines, y, size, a=1.0):
    f = fnt(X8, size)
    for ln in lines:
        red = ln.startswith("!"); t = ln.lstrip("!"); w = d.textlength(t, f); x = (W - w) / 2
        d.rectangle([x - 28, y - 4, x + w + 28, y + size * 1.1], fill=(RED if red else (15, 15, 15)) + (int(232 * a),))
        d.text((x, y - size * 0.07), t, font=f, fill=(255, 255, 255, int(255 * a))); y += int(size * 1.24)
def soustitre(d, txt, y, a=1.0):
    f = fnt(F6, 50); w = d.textlength(txt, f); d.rectangle([(W - w) / 2 - 24, y - 8, (W + w) / 2 + 24, y + 66], fill=(255, 255, 255, int(235 * a)))
    d.text(((W - w) / 2, y), txt, font=f, fill=(20, 20, 20, int(255 * a)))
def logo(d):
    d.rectangle([W - 320, 50, W - 44, 146], fill=(0, 0, 0, 90))
    d.text((W - 300, 64), "SARL MYF", font=fnt(X8, 54), fill=(255, 255, 255)); d.rectangle([W - 300, 126, W - 64, 132], fill=RED)
p = subprocess.Popen([FF, "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                      "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p", "-movflags", "+faststart", OUT], stdin=subprocess.PIPE)
def emit(im): p.stdin.write(im.convert("RGB").tobytes())

BAN = L(SRC + "v-show-banner.jpg"); FLO = L(SRC + "v-show-floor.jpg")
hook = (["Ne choisissez plus", "votre parquet", "!sur une photo"] if VAR == "A" else ["Ma tkhayyerch", "el parquet", "!men tsawer"])
# 1. Accroche : travelling au-dessus des lames posées au sol (0 -> 2.2 s)
shot(FLO, 2.2, 1.35, 1.25, (0.6, 0.85), (0.6, 0.55), lambda d, t: (logo(d), titre(d, hook, 600, 112, ease(t / 0.25))))
# 2. Le showroom (2.2 -> 4.6 s)
shot(BAN, 2.4, 1.0, 1.12, (0.5, 0.45), (0.55, 0.42), lambda d, t: (logo(d), titre(d, ["Venez le voir", "!EN VRAI"], 1180, 120, ease(t / 0.25)), soustitre(d, "Showroom EGGER · Dar El Beïda", 1500, ease((t - 0.3) / 0.3))))
# 3. Marcher sur les décors (4.6 -> 7.6 s)
shot(FLO, 3.0, 1.15, 1.45, (0.55, 0.2), (0.62, 0.75), lambda d, t: (logo(d), titre(d, ["Marchez dessus", "!à la lumière du jour"], 300, 100, ease(t / 0.25)), soustitre(d, "5 décors EGGER en stock à Alger", 1580, ease((t - 0.4) / 0.3))))
# 4. Les lames en main (7.6 -> 9.8 s)
shot(BAN, 2.2, 2.0, 2.3, (0.16, 0.72), (0.18, 0.68), lambda d, t: (logo(d), titre(d, ["Touchez les lames", "!comparez les teintes"], 300, 100, ease(t / 0.25))))
# 5. Conseiller (9.8 -> 12.2 s)
shot(BAN, 2.4, 1.9, 2.1, (0.72, 0.55), (0.7, 0.52), lambda d, t: (logo(d), titre(d, ["Un conseiller", "!rien que pour vous"], 1150, 104, ease(t / 0.25)), soustitre(d, "30 minutes · sur rendez-vous", 1430, ease((t - 0.3) / 0.3))))
# 6. Devis sur place + résultat (12.2 -> 14.6 s)
shot(L(K + "kamel-1.jpg"), 2.4, 1.0, 1.08, (0.45, 0.5), (0.5, 0.5), lambda d, t: (logo(d), titre(d, ["Repartez avec", "!votre devis"], 1180, 112, ease(t / 0.25)), soustitre(d, "Pose directement sur votre carrelage", 1490, ease((t - 0.3) / 0.3))))
# 7. Fin : vraie photo du showroom + adresse + horaires (14.6 -> 20.6 s)
n = int(6.0 * FPS)
for i in range(n):
    t = i / FPS; fr = view(BAN, 1.0 + 0.06 * i / n, 0.5, 0.42); d = ImageDraw.Draw(fr, "RGBA"); logo(d)
    a = ease(t / 0.4); top = H - 900
    grad = Image.new("RGBA", (W, 300)); gd = ImageDraw.Draw(grad)
    for y in range(300): gd.line([(0, y), (W, y)], fill=(255, 255, 255, int(255 * a * y / 300)))
    fr.paste(grad, (0, top - 300), grad); d = ImageDraw.Draw(fr, "RGBA")
    d.rectangle([0, top, W, H], fill=(255, 255, 255, int(255 * a)))
    if t > 0.25:
        b = ease((t - 0.25) / 0.4)
        d.text((70, top + 10), "SHOWROOM EGGER", font=fnt(F6, 46), fill=RED + (int(255 * b),))
        d.text((66, top + 64), "Dar El Beïda", font=fnt(X8, 150), fill=(15, 15, 15, int(255 * b)))
        # épingle de carte
        cx, cy = 100, top + 330; d.ellipse([cx - 30, cy - 30, cx + 30, cy + 30], fill=RED); d.polygon([(cx - 26, cy + 12), (cx + 26, cy + 12), (cx, cy + 62)], fill=RED); d.ellipse([cx - 11, cy - 11, cx + 11, cy + 11], fill="white")
        d.text((160, top + 288), "Cité ONAB, Lot 148", font=fnt(F6, 54), fill=(20, 20, 20)); d.text((160, top + 352), "Dar El Beïda · Alger", font=fnt(F4, 46), fill=(80, 80, 80))
        d.rectangle([70, top + 450, W - 70, top + 452], fill=(220, 220, 220))
        d.text((70, top + 480), "Samedi au jeudi · 8 h à 16 h", font=fnt(F6, 54), fill=(20, 20, 20))
        d.text((70, top + 548), "Sur rendez-vous · Google Maps : La Maison du Parquet EGGER", font=fnt(F4, 32), fill=(90, 90, 90))
    if t > 0.9:
        c = ease((t - 0.9) / 0.35); pulse = 1 + 0.025 * math.sin((t - 0.9) * 6)
        bw, bh = (W - 140) * pulse, 150 * pulse; x0, y0 = (W - bw) / 2, top + 640
        d.rectangle([x0, y0, x0 + bw, y0 + bh], fill=(15, 15, 15, int(255 * c)))
        d.text((x0 + 40, y0 + 20), "Réservez votre visite", font=fnt(F6, 40), fill=(255, 255, 255, int(255 * c)))
        d.text((x0 + 40, y0 + 64), "0794 70 93 23", font=fnt(X8, 76), fill=(255, 255, 255, int(255 * c)))
        d.text((x0 + bw - 220, y0 + 84), "WhatsApp", font=fnt(F4, 34), fill=(200, 200, 200, int(255 * c)))
        d.text((70, H - 66), "lamaisonduparquet.org", font=fnt(F6, 38), fill=(120, 120, 120))
    emit(fr)
p.stdin.close(); p.wait()
