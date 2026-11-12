"""Kit Instagram gratuit (0 crédit) : carrousels, couvertures de stories à la une, reel.

Usage : python3 build.py <dossier sources u156 hf> <dossier de sortie>
Tout est fait avec PIL et ffmpeg, à partir d'images déjà générées.
"""
import sys, os, subprocess
from PIL import Image, ImageDraw, ImageFont, ImageFilter

SRC, OUT = sys.argv[1], sys.argv[2]
R = os.path.dirname(os.path.abspath(__file__))
FD = os.path.join(R, "..", "..", "site", "assets", "fonts")
def F(n, s): return ImageFont.truetype(os.path.join(FD, n), s)
TITLE, SEMI, REG = "fira-sans-extra-condensed-800.woff2", "fira-sans-600.woff2", "fira-sans-400.woff2"
RED, INK, CREAM = (226, 0, 26), (20, 20, 20), (246, 243, 238)
W, H = 1080, 1350

def cover(im, w, h):
    im = im.convert("RGB"); r = max(w / im.width, h / im.height)
    im = im.resize((round(im.width * r), round(im.height * r)), Image.LANCZOS)
    x, y = (im.width - w) // 2, (im.height - h) // 2
    return im.crop((x, y, x + w, y + h))

def logo(d, x, y, dark=True):
    c = INK if dark else (255, 255, 255)
    d.text((x, y), "SARL MYF", font=F(TITLE, 40), fill=c)
    d.rectangle([x, y + 48, x + 150, y + 52], fill=RED)
    d.text((x, y + 58), "lamaisonduparquet.org", font=F(SEMI, 20), fill=c)

def wrap(d, txt, font, maxw):
    out, line = [], ""
    for w in txt.split():
        t = (line + " " + w).strip()
        if d.textlength(t, font=font) <= maxw: line = t
        else: out.append(line); line = w
    return out + [line]

def slide_photo(img, tag, sub, n, tot, path):
    im = cover(img, W, H); d = ImageDraw.Draw(im)
    # carte blanche en bas à gauche
    ft, fs = F(TITLE, 54), F(SEMI, 26)
    w = int(max(d.textlength(tag, font=ft), d.textlength(sub, font=fs))) + 80
    y0 = H - 230
    d.rectangle([40, y0, 40 + w, y0 + 150], fill=CREAM); d.rectangle([40, y0, 50, y0 + 150], fill=RED)
    d.text((76, y0 + 18), tag, font=ft, fill=INK); d.text((76, y0 + 92), sub, font=fs, fill=(80, 80, 80))
    d.text((W - 110, 50), f"{n}/{tot}", font=F(SEMI, 28), fill=(255, 255, 255), stroke_width=2, stroke_fill=(0, 0, 0))
    d.text((40, H - 60), "Conception 3D · atelier SARL MYF", font=F(REG, 22), fill=(255, 255, 255), stroke_width=2, stroke_fill=(0, 0, 0))
    im.save(path, quality=93)

def slide_cover(img, kicker, title, sub, path):
    im = cover(img, W, H)
    g = Image.new("L", (1, H)); [g.putpixel((0, y), int(235 * max(0, (y - H * 0.38) / (H * 0.62)) ** 1.1)) for y in range(H)]
    im.paste(Image.new("RGB", (W, H), (12, 10, 8)), (0, 0), g.resize((W, H)))
    d = ImageDraw.Draw(im)
    d.rectangle([60, 70, 72, 150], fill=RED); d.text((92, 72), kicker, font=F(SEMI, 30), fill=(255, 255, 255))
    ft = F(TITLE, 104); y = H - 560
    for l in wrap(d, title, ft, W - 120): d.text((60, y), l, font=ft, fill=(255, 255, 255)); y += 108
    for l in wrap(d, sub, F(REG, 34), W - 120): d.text((60, y + 18), l, font=F(REG, 34), fill=(230, 225, 218)); y += 44
    d.text((60, H - 96), "Glissez  >>", font=F(SEMI, 34), fill=(255, 255, 255))
    im.save(path, quality=93)

def slide_cta(path, titre="Votre projet sur mesure ?"):
    im = Image.new("RGB", (W, H), CREAM); d = ImageDraw.Draw(im)
    logo(d, 60, 70)
    y = 330
    for l in wrap(d, titre, F(TITLE, 110), W - 120): d.text((60, y), l, font=F(TITLE, 110), fill=INK); y += 112
    y += 30
    for t in ["Envoyez-nous vos mesures ou un croquis :", "on vous prépare la 3D de votre pièce."]:
        d.text((60, y), t, font=F(REG, 38), fill=(60, 60, 60)); y += 52
    y += 50
    d.rounded_rectangle([60, y, W - 60, y + 130], radius=24, fill=INK)
    d.text((110, y + 26), "WhatsApp  0794 70 93 23", font=F(TITLE, 70), fill=(255, 255, 255))
    y += 190
    for t in ["📍 Showroom Cité ONAB, Lot 148, Dar El Beïda", "Du samedi au jeudi · 8 h à 16 h · sur rendez-vous", "Livraison partout en Algérie"]:
        d.text((60, y), t.replace("📍 ", ""), font=F(SEMI, 34), fill=INK); y += 52
    d.rectangle([60, H - 120, 220, H - 114], fill=RED); d.text((60, H - 100), "lamaisonduparquet.org", font=F(SEMI, 32), fill=INK)
    im.save(path, quality=93)

def highlight(word, sub, path):
    im = Image.new("RGB", (1080, 1920), CREAM); d = ImageDraw.Draw(im)
    cx, cy, r = 540, 960, 300
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(255, 255, 255), outline=RED, width=14)
    f = F(TITLE, 120 if len(word) < 8 else 92)
    tw = d.textlength(word, font=f); d.text((cx - tw / 2, cy - 80), word, font=f, fill=INK)
    fs = F(SEMI, 40); tw = d.textlength(sub, font=fs); d.text((cx - tw / 2, cy + 60), sub, font=fs, fill=RED)
    im.save(path, quality=93)

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    # ---------- 1. Carrousel dressing / coiffeuse / entrée (projet U156) ----------
    c = os.path.join(OUT, "carrousel-dressing"); os.makedirs(c, exist_ok=True)
    src = {k: Image.open(os.path.join(SRC, f)) for k, f in [("all", "1c.png"), ("g", "2.png"), ("d", "3.png"), ("coif", "4.png"), ("banc", "7.png")]}
    slide_cover(src["all"], "MEUBLES SUR MESURE · ALGER", "Un dressing pensé au millimètre.", "Dressing parental 4,50 m, coiffeuse et entrée, tout en beige sable.", f"{c}/01.jpg")
    slide_photo(src["g"], "Double penderie", "4 grands tiroirs · LED sous chaque tablette", 2, 6, f"{c}/02.jpg")
    slide_photo(src["d"], "Vitrines verre fumé", "Cadre alu noir · éclairage intégré", 3, 6, f"{c}/03.jpg")
    slide_photo(src["coif"], "La coiffeuse", "Miroir rond LED · colonne vitrée", 4, 6, f"{c}/04.jpg")
    slide_photo(src["banc"], "L'entrée", "Banquette à tiroirs · chausseur 5 m", 5, 6, f"{c}/05.jpg")
    slide_cta(f"{c}/06.jpg")
    # ---------- 2. Slide de fin réutilisable (cuisine, chambre) ----------
    slide_cta(os.path.join(OUT, "fin-carrousel-meubles.jpg"))
    slide_cta(os.path.join(OUT, "fin-carrousel-parquet.jpg"), "Votre sol transformé en 1 jour ?")
    # ---------- 3. Stories à la une ----------
    h = os.path.join(OUT, "stories-a-la-une"); os.makedirs(h, exist_ok=True)
    for i, (w, s) in enumerate([("PARQUET", "5 décors en stock"), ("MEUBLES", "sur mesure"), ("AVANT", "/ après"), ("SHOWROOM", "Dar El Beïda"), ("AVIS", "clients"), ("DEVIS", "WhatsApp")], 1):
        highlight(w, s, f"{h}/{i}-{w.lower()}.jpg")
    # ---------- 4. Reel 9:16 (12 s) ----------
    rdir = os.path.join(OUT, "_reel"); os.makedirs(rdir, exist_ok=True)
    order = ["all", "g", "coif", "banc"]
    for i, k in enumerate(order):
        cover(src[k], 1080, 1920).save(f"{rdir}/{i}.jpg", quality=95)
    end = Image.open(f"{c}/06.jpg").resize((1080, 1350)); e = Image.new("RGB", (1080, 1920), CREAM); e.paste(end, (0, 285)); e.save(f"{rdir}/end.jpg", quality=95)
    parts = []
    for i in range(len(order)):
        o = f"{rdir}/p{i}.mp4"
        z = "min(zoom+0.0009,1.08)" if i % 2 == 0 else "if(eq(on,0),1.08,max(zoom-0.0009,1))"
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-loop", "1", "-i", f"{rdir}/{i}.jpg", "-vf",
                        f"scale=2160:-1,zoompan=z='{z}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=75:s=1080x1920:fps=30,format=yuv420p",
                        "-t", "2.5", "-c:v", "libx264", "-crf", "20", o], check=True); parts.append(o)
    o = f"{rdir}/pend.mp4"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-loop", "1", "-i", f"{rdir}/end.jpg", "-vf", "format=yuv420p", "-r", "30", "-t", "3", "-c:v", "libx264", "-crf", "20", o], check=True); parts.append(o)
    n = len(parts); inputs = sum([["-i", p] for p in parts], [])
    fl, last, off = [], "0:v", 0
    for i in range(1, n):
        off += 2.5 - 0.4; out = f"x{i}"
        fl.append(f"[{last}][{i}:v]xfade=transition=fade:duration=0.4:offset={off:.2f}[{out}]"); last = out
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error"] + inputs + ["-filter_complex", ";".join(fl), "-map", f"[{last}]", "-c:v", "libx264", "-crf", "20", "-pix_fmt", "yuv420p", "-movflags", "+faststart", os.path.join(OUT, "reel-dressing-12s.mp4")], check=True)
    print("ok")
