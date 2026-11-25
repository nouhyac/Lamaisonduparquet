"""Pack de stories parquet 1080x1920 pour remplir les stories à la une (0 crédit).

Usage : python3 stories.py <dossier de sortie>
Sources : visuels déjà signés (ads/visuels/out, out2, catalogue/out). Aucun prix.
"""
import sys, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUT = sys.argv[1]
R = os.path.dirname(os.path.abspath(__file__)); A = os.path.join(R, "..")
FD = os.path.join(A, "..", "site", "assets", "fonts")
def F(n, s): return ImageFont.truetype(os.path.join(FD, n), s)
TITLE, SEMI, REG = "fira-sans-extra-condensed-800.woff2", "fira-sans-600.woff2", "fira-sans-400.woff2"
RED, INK, CREAM = (226, 0, 26), (20, 20, 20), (246, 243, 238)
W, H = 1080, 1920
V = lambda p: os.path.join(A, "visuels", p)

def wrap(d, txt, font, maxw):
    out, line = [], ""
    for w in txt.split():
        t = (line + " " + w).strip()
        if d.textlength(t, font=font) <= maxw: line = t
        else: out.append(line); line = w
    return out + [line]

def fill(im, w, h):
    r = max(w / im.width, h / im.height); im = im.resize((round(im.width * r), round(im.height * r)), Image.LANCZOS)
    x, y = (im.width - w) // 2, (im.height - h) // 2; return im.crop((x, y, x + w, y + h))

def frame(d, dark):
    c = (255, 255, 255) if dark else INK
    d.rectangle([60, 90, 70, 150], fill=RED); d.text((88, 92), "LA MAISON DU PARQUET", font=F(SEMI, 30), fill=c)
    d.text((88, 128), "Parquet EGGER · en stock à Alger", font=F(REG, 24), fill=c)
    d.rounded_rectangle([60, H - 210, W - 60, H - 90], radius=26, fill=INK)
    d.text((100, H - 190), "WhatsApp 0794 70 93 23", font=F(TITLE, 54), fill=(255, 255, 255))
    d.text((100, H - 128), "lamaisonduparquet.org · showroom Dar El Beïda", font=F(SEMI, 24), fill=(220, 220, 220))

def photo(src, titre, sous, path):
    im = Image.open(src).convert("RGB")
    bg = fill(im, W, H).filter(ImageFilter.GaussianBlur(40)); bg = Image.blend(bg, Image.new("RGB", (W, H), (15, 12, 10)), 0.45)
    d = ImageDraw.Draw(bg); frame(d, True)
    ft = F(TITLE, 84); y = 230
    for l in wrap(d, titre, ft, W - 120): d.text((60, y), l, font=ft, fill=(255, 255, 255)); y += 88
    if sous:
        for l in wrap(d, sous, F(REG, 36), W - 120): d.text((60, y + 6), l, font=F(REG, 36), fill=(235, 230, 222)); y += 46
    top, bot = y + 40, H - 250
    r = min((W - 120) / im.width, (bot - top) / im.height); fg = im.resize((round(im.width * r), round(im.height * r)), Image.LANCZOS)
    m = Image.new("L", fg.size, 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, fg.width, fg.height], radius=28, fill=255)
    bg.paste(fg, ((W - fg.width) // 2, top + (bot - top - fg.height) // 2), m)
    bg.save(path, quality=93)

def texte(fond, kicker, titre, corps, path):
    src = Image.open(fond).convert("RGB")
    src = src.crop((0, 0, int(src.width * 0.72), int(src.height * 0.72)))   # retire le logo du coin bas-droit
    bg = fill(src, W, H)
    d = ImageDraw.Draw(bg); frame(d, False)
    ft, fb = F(TITLE, 96), F(REG, 40)
    lt = wrap(d, titre, ft, W - 200); lb = sum([wrap(d, p, fb, W - 200) for p in corps], [])
    h = 90 + 60 + len(lt) * 100 + 30 + len(lb) * 54 + 70
    y0 = (H - h) // 2
    d.rounded_rectangle([60, y0, W - 60, y0 + h], radius=34, fill=CREAM)
    d.rectangle([60, y0 + 50, 72, y0 + 120], fill=RED); d.text((100, y0 + 54), kicker, font=F(SEMI, 32), fill=RED)
    y = y0 + 140
    for l in lt: d.text((100, y), l, font=ft, fill=INK); y += 100
    y += 30
    for l in lb: d.text((100, y), l, font=fb, fill=(55, 55, 55)); y += 54
    bg.save(path, quality=93)

def cover(word, sub, path):
    im = Image.new("RGB", (1080, 1920), CREAM); d = ImageDraw.Draw(im)
    cx, cy, r = 540, 960, 300
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(255, 255, 255), outline=RED, width=14)
    f = F(TITLE, 120 if len(word) < 8 else 96)
    tw = d.textlength(word, font=f); d.text((cx - tw / 2, cy - 80), word, font=f, fill=INK)
    fs = F(SEMI, 40); tw = d.textlength(sub, font=fs); d.text((cx - tw / 2, cy + 60), sub, font=fs, fill=RED)
    im.save(path, quality=93)

if __name__ == "__main__":
    B = lambda *p: os.path.join(OUT, *p)
    for g in ["1-decors", "2-showroom", "3-pose", "4-questions", "5-devis", "couvertures"]: os.makedirs(B(g), exist_ok=True)
    C = lambda f: V(os.path.join("catalogue", "out", f))
    # 1. DÉCORS : les 5 références en stock
    photo(C("0-en-stock.jpg"), "5 décors en stock à Alger", "Glissez pour les découvrir", B("1-decors", "01.jpg"))
    for i, (f, t, s) in enumerate([("el2863-asgil.jpg", "Chêne Asgil miel · EL2863", "Chaleureux, idéal pour le salon"),
                                   ("el1061-achensee.jpg", "Chêne Achensee · EL1061", "Clair et apaisant, parfait en chambre"),
                                   ("el2970-nord.jpg", "Chêne du Nord naturel · EL2970", "Des nœuds pleins de caractère"),
                                   ("el2416-melba.jpg", "Chêne Melba beige · EL2416", "Version Aqua : cuisine ouverte, entrée"),
                                   ("el1055-bardolino.jpg", "Chêne Bardolino · EL1055", "Ni trop clair ni trop foncé, intemporel")], 2):
        photo(C(f), t, s, B("1-decors", f"{i:02d}.jpg"))
    # 2. SHOWROOM : vraies photos
    for i, (f, t, s) in enumerate([("out2/29.jpg", "Notre showroom à Dar El Beïda", "Venez voir et toucher les décors"),
                                   ("out2/16.jpg", "Les décors côte à côte", "Comparez les teintes en vrai, à la lumière du jour"),
                                   ("out2/17.jpg", "Clair ou foncé ?", "On pose les lames au sol pour vous aider à choisir"),
                                   ("out2/18.jpg", "En stock, prêt à livrer", "Livraison partout en Algérie")], 1):
        photo(V(f), t, s, B("2-showroom", f"{i:02d}.jpg"))
    texte(V("out2/30.jpg"), "SUR RENDEZ-VOUS", "Venez nous voir", ["Cité ONAB, Lot 148, Dar El Beïda.", "Du samedi au jeudi, de 8 h à 16 h.", "Google Maps : « La Maison du Parquet EGGER Dar El Beïda »."], B("2-showroom", "05.jpg"))
    # 3. POSE
    texte(V("out/12.jpg"), "LA POSE", "Sur votre carrelage", ["Pas besoin de casser : les lames se clipsent sur une sous-couche, directement sur le carrelage existant (plan et bien fixé)."], B("3-pose", "01.jpg"))
    texte(V("out/15.jpg"), "LA POSE", "En une journée", ["Une pièce est posée en un jour. Pas de démolition, pas de séchage : vous l'utilisez le soir même."], B("3-pose", "02.jpg"))
    texte(V("out2/25.jpg"), "LA POSE", "Sans gravats ni poussière", ["Pas de marteau-piqueur, pas de colle. Vos meubles reviennent tout de suite."], B("3-pose", "03.jpg"))
    photo(V("out/03.jpg"), "Votre carrelage, transformé", "Le même sol, sans travaux", B("3-pose", "04.jpg"))
    # 4. QUESTIONS (FAQ du site)
    for i, (fond, q, rep) in enumerate([("out2/26.jpg", "Et dans la cuisine ?", "Choisissez le Chêne Melba beige EL2416 en version Aqua : il résiste à l'eau pendant 24 heures. En salle de bain, où l'eau stagne, on le déconseille."),
                                        ("out/15.jpg", "Classe 31 ou 32 ?", "Classe 31 : parfait en chambre. Classe 32 : usage intense, pour le salon, l'entrée ou la cuisine."),
                                        ("out2/19.jpg", "D'où vient le parquet ?", "Des usines européennes du groupe EGGER. Les cartons portent la mention Made in Germany. Majorité de bois, sans PVC, Écolabel européen."),
                                        ("out/12.jpg", "Pourquoi sur rendez-vous ?", "Pour qu'un conseiller soit là rien que pour vous pendant 30 minutes : décors en stock, conseils et devis sur place, sans attente.")], 1):
        texte(V(fond), "VOS QUESTIONS", q, [rep], B("4-questions", f"{i:02d}.jpg"))
    # 5. DEVIS
    texte(V("out2/25.jpg"), "DEVIS GRATUIT", "Votre devis en 3 étapes", ["1. La surface de chaque pièce (m²).", "2. La pièce et le décor qui vous plaît.", "3. On vous répond sur WhatsApp, ou on vous reçoit au showroom."], B("5-devis", "01.jpg"))
    texte(V("out/15.jpg"), "ÉCRIVEZ-NOUS", "0794 70 93 23", ["Sur WhatsApp, envoyez simplement « PARQUET » avec vos m².", "Livraison partout en Algérie."], B("5-devis", "02.jpg"))
    # Couvertures des stories à la une
    for i, (w, s) in enumerate([("DÉCORS", "5 en stock"), ("SHOWROOM", "Dar El Beïda"), ("POSE", "sur carrelage"), ("QUESTIONS", "vos réponses"), ("DEVIS", "WhatsApp")], 1):
        cover(w, s, B("couvertures", f"{i}-{w.lower().replace('é', 'e')}.jpg"))
    print("ok")
