# Montage des vidéos A et B (1080×1920, 30 i/s) : maquettes téléphone / ordinateur, fond flou sombre,
# incrustations PNG (overlays.js), fondus, léger grain, musique générée (son.py).
# Usage : python3 compose.py A|B  (variables REC, OV, OUT)
import numpy as np, subprocess, sys, os, json
from PIL import Image, ImageDraw, ImageFilter
W, H, FPS = 1080, 1920, 30
REC = os.environ['REC']; OV = os.environ['OV']; OUT = os.environ['OUT']
D = os.path.dirname(os.path.abspath(__file__))
LOGO = '/home/user/Lamaisonduparquet/entreprise/campagne/avatar/logo.png'
ZV = '/home/user/Lamaisonduparquet/entreprise/campagne/medias/z-vertical.webm'
rng = np.random.default_rng(3)

class Lecteur:
    """Lit une vidéo à 30 i/s à partir de `ss`, image par image (accès en avant seulement)."""
    def __init__(s, f, ss, w, h, dur):
        s.w, s.h = w, h; s.i = -1; s.cur = None
        s.p = subprocess.Popen(['ffmpeg', '-v', 'error', '-ss', str(ss), '-t', str(dur + 1), '-i', f, '-vf', f'fps=30,scale={w}:{h}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
    def get(s, k):
        while s.i < k:
            b = s.p.stdout.read(s.w * s.h * 3)
            if len(b) < s.w * s.h * 3: break
            s.cur = np.frombuffer(b, np.uint8).reshape(s.h, s.w, 3); s.i += 1
        return s.cur

def arrondi(w, h, r):
    m = Image.new('L', (w, h), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, w - 1, h - 1), r, fill=255); return m

class Tel:
    """Maquette de téléphone : écran arrondi, cadre noir fin liseré or, ombre portée."""
    def __init__(s, x, y, sw, r=56, b=16):
        s.x, s.y, s.sw = x, y, sw; s.sh = round(sw * 1688 / 780); s.b = b
        fw, fh = s.sw + 2 * b, s.sh + 2 * b
        corps = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        omb = Image.new('L', (W, H), 0); ImageDraw.Draw(omb).rounded_rectangle((x - b + 10, y - b + 40, x + sw + b + 10, y + s.sh + b + 40), r + b, fill=170)
        omb = omb.filter(ImageFilter.GaussianBlur(40)); corps.paste((0, 0, 0, 255), (0, 0), omb)
        d = ImageDraw.Draw(corps)
        d.rounded_rectangle((x - b, y - b, x + sw + b, y + s.sh + b), r + b, fill=(14, 14, 18, 255), outline=(200, 169, 106, 255), width=3)
        d.rounded_rectangle((x - b + 5, y - b + 5, x + sw + b - 5, y + s.sh + b - 5), r + b - 5, outline=(60, 60, 68, 255), width=2)
        s.corps = np.asarray(corps).astype(np.float32); s.ca = s.corps[..., 3:] / 255
        s.mask = np.asarray(arrondi(sw, s.sh, r)).astype(np.float32)[..., None] / 255
        # îlot (caméra)
        s.ilot = (x + sw // 2 - 62, y + 14, x + sw // 2 + 62, y + 46)
    def poser(s, img, ecran):
        img[:] = img * (1 - s.ca) + s.corps[..., :3] * s.ca
        e = np.asarray(Image.fromarray(ecran).resize((s.sw, s.sh), Image.BILINEAR)).astype(np.float32)
        zone = img[s.y:s.y + s.sh, s.x:s.x + s.sw]; zone[:] = zone * (1 - s.mask) + e * s.mask
        x0, y0, x1, y1 = s.ilot; img[y0:y1, x0 + 16:x1 - 16] = 8; img[y0 + 4:y1 - 4, x0 + 4:x1 - 4] = 8

class Ordi:
    """Maquette d'ordinateur portable (écran + socle)."""
    def __init__(s, x, y, sw, sh):
        s.x, s.y, s.sw, s.sh = x, y, sw, sh; b = 14
        c = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        omb = Image.new('L', (W, H), 0); ImageDraw.Draw(omb).rounded_rectangle((x - 30, y + 20, x + sw + 30, y + sh + 80), 30, fill=160)
        c.paste((0, 0, 0, 255), (0, 0), omb.filter(ImageFilter.GaussianBlur(36)))
        d = ImageDraw.Draw(c)
        d.rounded_rectangle((x - b, y - b, x + sw + b, y + sh + b + 10), 22, fill=(16, 16, 20, 255), outline=(70, 70, 78, 255), width=2)
        d.polygon([(x - 50, y + sh + b + 10), (x + sw + 50, y + sh + b + 10), (x + sw + 20, y + sh + b + 40), (x - 20, y + sh + b + 40)], fill=(150, 150, 158, 255))
        d.rectangle((x + sw // 2 - 70, y + sh + b + 10, x + sw // 2 + 70, y + sh + b + 18), fill=(110, 110, 118, 255))
        s.corps = np.asarray(c).astype(np.float32); s.ca = s.corps[..., 3:] / 255
    def poser(s, img, ecran):
        img[:] = img * (1 - s.ca) + s.corps[..., :3] * s.ca
        e = np.asarray(Image.fromarray(ecran).resize((s.sw, s.sh), Image.BILINEAR)).astype(np.float32)
        img[s.y:s.y + s.sh, s.x:s.x + s.sw] = e

def fond(ecran, assomb=.30):
    """Fond flou sombre tiré de l'écran filmé + vignettage."""
    p = Image.fromarray(ecran).resize((27, 48), Image.BILINEAR).filter(ImageFilter.GaussianBlur(3)).resize((W, H), Image.BILINEAR)
    return np.asarray(p).astype(np.float32) * assomb * VIG + GOLD

yy, xx = np.mgrid[0:H, 0:W]
VIG = (1 - 0.55 * np.clip(((xx - W / 2) / (W * .75)) ** 2 + ((yy - H * .45) / (H * .62)) ** 2, 0, 1))[..., None].astype(np.float32)
GOLD = (np.exp(-(((xx - W / 2) / 520.) ** 2 + ((yy - H * .42) / 760.) ** 2))[..., None] * np.array([34, 26, 12], np.float32)).astype(np.float32)
GRAIN = [rng.normal(0, 3.2, (H // 2, W // 2, 1)).astype(np.float32).repeat(2, 0).repeat(2, 1) for _ in range(6)]

_ov = {}
def ov(nom):
    if nom not in _ov:
        a = np.asarray(Image.open(os.path.join(OV, nom + '.png')).convert('RGBA')).astype(np.float32)
        _ov[nom] = (a[..., :3], a[..., 3:] / 255)
    return _ov[nom]
def poser_ov(img, nom, t, t0, t1, fi=.22, fo=.18, glisse=24):
    if not (t0 <= t < t1): return
    a = min(1, (t - t0) / fi) if fi else 1; b = min(1, (t1 - t) / fo) if fo else 1; k = min(a, b)
    e = 1 - (1 - min(1, (t - t0) / fi if fi else 1)) ** 3
    rgb, al = ov(nom); dy = int(round((1 - e) * glisse))
    if dy: rgb = np.roll(rgb, dy, 0); al = np.roll(al, dy, 0)
    al = al * k; img[:] = img * (1 - al) + rgb * al
LOGOA = None
def logo(img):
    global LOGOA
    if LOGOA is None:
        a = np.asarray(Image.open(LOGO).convert('RGBA')).astype(np.float32); LOGOA = (a[..., :3], a[..., 3:] / 255)
    rgb, al = LOGOA; img[:] = img * (1 - al) + rgb * al

def zoom(img, z):
    if z <= 1.0005: return img
    h, w = int(H / z), int(W / z); y0, x0 = (H - h) // 2, (W - w) // 2
    return np.asarray(Image.fromarray(img[y0:y0 + h, x0:x0 + w].astype(np.uint8)).resize((W, H), Image.BILINEAR)).astype(np.float32)

# ---------------------------------------------------------------- scènes
def scene_tel(src, ss, vit, dur, ovs, tel, pre=None, lg=True):
    L = Lecteur(src, ss, 780, 1688, dur * vit)
    def f(k, t):
        e = L.get(int(t * vit * FPS)); img = fond(e)
        if pre: pre(img, t)
        tel.poser(img, e)
        if lg: logo(img)
        for o in ovs: poser_ov(img, *o[:1], t, *o[1:])
        return img
    return dur, f

def scene_cuisine(ss, vit, dur, ovs, lg=True):
    Lc = Lecteur(REC + '/cuisine.mp4', ss, 2160, 1350, dur * vit); Lt = Lecteur(REC + '/tel.mp4', ss, 780, 1688, dur * vit)
    ordi = Ordi(40, 440, 1000, 625); tel = Tel(626, 1000, 372, r=40, b=12)
    def f(k, t):
        n = int(t * vit * FPS); c = Lc.get(n); e = Lt.get(n)
        img = fond(c, .26)
        ordi.poser(img, c[0:1125, 360:2160]); tel.poser(img, e)
        if lg: logo(img)
        for o in ovs: poser_ov(img, *o[:1], t, *o[1:])
        return img
    return dur, f

def scene_carte(base, dur, ovs, z0=1.0, z1=1.06):
    def f(k, t):
        img = zoom(base.copy(), z0 + (z1 - z0) * t / dur); logo(img)
        for o in ovs: poser_ov(img, *o[:1], t, *o[1:])
        return img
    return dur, f

def scene_fin(dur):
    L = Lecteur(ZV, 0.6, 716, 1280, dur + 1)
    def f(k, t):
        e = L.get(int(t * FPS))
        p = Image.fromarray(e).resize((1080, 1931), Image.BICUBIC).crop((0, 0, 1080, 1920))
        img = np.asarray(p).astype(np.float32)
        img[1000:] *= np.linspace(1, .55, 920)[:, None, None]
        poser_ov(img, 'fin', t, .35, dur + 1, fi=.4, glisse=30)
        return img
    return dur, f

def dernier(scn):
    dur, f = scn; img = f(0, dur - 1 / FPS)
    return np.asarray(Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(16))).astype(np.float32) * .5

# ---------------------------------------------------------------- vidéos
def video_A():
    tel = Tel(260, 540, 560)
    S = []
    S.append(scene_tel(REC + '/tel.mp4', 0.0, 1.0, 2.4, [('a-hook', 0, 2.4, 0, .15), ('a-hook2', .65, 2.4, .2, .15, 18)], tel))
    S.append(scene_tel(REC + '/tel.mp4', 2.4, 2.0, 6.4, [('a-lab1', 0, 6.4)], tel))
    S.append(scene_cuisine(15.2, 1.6, 6.1, [('a-lab2', 0, 3.0), ('a-lab3', 3.0, 6.1)]))
    base = dernier(scene_cuisine(15.2, 1.6, 6.1, [], lg=False))
    S.append(scene_carte(base, 4.4, [('a-offre1', 0, 2.0), ('a-offre2', 2.0, 4.4)]))
    S.append(scene_carte(base, 2.9, [('a-cta', 0, 2.9)], 1.06, 1.1))
    S.append(scene_fin(2.6))
    # musique : accents aux changements de scène
    return S, 'Vos clients commandent sur VOTRE site'

def video_B():
    tel = Tel(260, 540, 560)
    S = []
    S.append(scene_tel(REC + '/tel.mp4', 0.0, 1.0, 2.4, [('b-hook', 0, 2.4, 0, .15), ('b-hook2', .6, 2.4, .2, .15, 18)], tel))
    S.append(scene_tel(REC + '/tel.mp4', 1.6, 2.3, 2.4, [('b-resto', 0, 2.4)], tel))
    S.append(scene_tel(REC + '/cafe.mp4', 0.7, 1.9, 3.0, [('b-cafe', 0, 3.0)], tel))
    S.append(scene_tel(REC + '/boutique.mp4', 0.6, 1.55, 2.6, [('b-boutique', 0, 2.6)], tel))
    base = dernier(scene_tel(REC + '/boutique.mp4', 0.6, 1.55, 2.6, [], tel, lg=False))
    S.append(scene_carte(base, 4.3, [('b-offres1', 0, .45, .2, 0), ('b-offres2', .45, .9, 0, 0, 0), ('b-offres3', .9, 1.35, 0, 0, 0), ('b-offres4', 1.35, 1.8, 0, 0, 0), ('b-offres5', 1.8, 4.3, 0, .18, 0)]))
    S.append(scene_carte(base, 2.6, [('b-cta', 0, 2.6)], 1.06, 1.1))
    S.append(scene_fin(2.1))
    return S, ''

S, _ = video_A() if sys.argv[1] == 'A' else video_B()
total = sum(d for d, _ in S); N = int(round(total * FPS))
coupes = []; acc = 0
for d, _ in S: coupes.append(round(acc, 3)); acc += d
# musique
L = round(total + .05, 2)
cfg = {'L': L, 'bpm': 112, 'mus': [0.0, L - 2.2], 'fin': L, 'dense': False,
       'ev': [['whoosh', c] for c in coupes[1:]] + [['boom', 0.02, .55], ['boom', coupes[-1], .9], ['ticks', coupes[3] if len(coupes) > 3 else 1, 6], ['tail', coupes[-1], 3.0]]}
json.dump(cfg, open(OUT + '.son.json', 'w'))
subprocess.run(['python3', os.path.join(D, 'son.py'), OUT + '.son.json', OUT + '.wav'], check=True)
enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-', '-i', OUT + '.wav',
                        '-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-maxrate', '7M', '-bufsize', '14M', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-af', 'afade=t=out:st=%.2f:d=0.6' % (total - .6),
                        '-shortest', '-movflags', '+faststart', OUT], stdin=subprocess.PIPE)
prec = None; k = 0
for si, (d, f) in enumerate(S):
    n = int(round((coupes[si] + d) * FPS)) - int(round(coupes[si] * FPS))
    for j in range(n):
        t = j / FPS; img = f(j, t)
        if prec is not None and j < 7:  # fondu enchaîné court
            a = (j + 1) / 8; img = img * a + prec * (1 - a)
        if j == n - 1: prec = img.copy()
        img = img + GRAIN[k % 6]; k += 1
        enc.stdin.write(np.clip(img, 0, 255).astype(np.uint8).tobytes())
enc.stdin.close(); enc.wait()
print('durée', round(total, 2), 's ·', k, 'images · coupes', coupes)
