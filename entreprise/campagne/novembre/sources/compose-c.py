# Vidéo C : mise à jour sans crédit de campagne/videos/pub-50s-avatar.mp4 (voix et images d'origine).
#  1. masque les anciens prix Dzign (30 000 / 80 000 DA) sur la capture « Choisissez votre offre » (suivi du défilement)
#  2. remplace le badge « 50 % au début · 50 % à la fin · BaridiMob » par « Zéro DA avant de voir votre site · 50/50 »
#  3. coupe la phrase « Moins 20 % pour nos 5 premiers clients » (programme supprimé), à un silence de la voix
#  4. nouvel écran de fin (prix d'entrée, paiement après avoir vu, nom du commerce, WhatsApp)
import numpy as np, subprocess, os, sys
from PIL import Image
SRC = '/home/user/Lamaisonduparquet/entreprise/campagne/videos/pub-50s-avatar.mp4'
OV = os.environ['OV']; OUT = os.environ['OUT']; TMP = OUT + '.tmp'
W, H, FPS = 1080, 1920, 30
CUT0, CUT1 = 1146, 1252          # images retirées : 38,200 s → 41,733 s (silence avant « Cliquez »)
FIN0 = 1361                       # 45,367 s : début de l'ancien écran de fin
# défilement mesuré (décalage vertical en px) image par image à partir de 18,5 s (555)
SH = {i: 0 for i in range(1, 44)}; SH.update({44: 3, 45: 14, 46: 14, 47: 50, 48: 149, 49: 233, 50: 348, 51: 399, 52: 399, 53: 426})
for i in range(54, 75): SH[i] = 431
# de 21,0 à 21,33 s la capture ouvre une fenêtre avec d'autres anciens prix : on garde l'image précédente (masquée)
GEL = range(75, 85)
BOITES = [(892, 1000), (1553, 1652)]   # « À PARTIR DE » + prix, cartes 1 et 2 (position sans défilement)
def masque(img, sh, marge):
    for y0, y1 in BOITES:
        a, b = max(150, y0 - sh - marge), min(1345, y1 - sh + marge)
        if b <= a: continue
        fondl = np.median(img[a:b, 575:640].astype(np.float32), axis=1)  # couleur de la carte, ligne par ligne
        img[a:b, 312:572] = fondl[:, None, :].astype(np.uint8)
def charge(n):
    a = np.asarray(Image.open(os.path.join(OV, n + '.png')).convert('RGBA')).astype(np.float32); return a[..., :3], a[..., 3:] / 255
BADGE = charge('c-paiement'); FIN = np.asarray(Image.open(os.path.join(OV, 'c-fin.png')).convert('RGB'))
dec = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', SRC, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                        '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-maxrate', '5M', '-bufsize', '10M', '-pix_fmt', 'yuv420p', TMP + '.mp4'], stdin=subprocess.PIPE)
i = 0; n_out = 0
while True:
    b = dec.stdout.read(W * H * 3)
    if len(b) < W * H * 3: break
    img = np.frombuffer(b, np.uint8).reshape(H, W, 3).copy(); t = i / FPS
    if CUT0 <= i < CUT1: i += 1; continue
    j = i - 555
    if j in SH: masque(img, SH[j], 34 if 44 <= j <= 53 else 8)
    if j == 74: gel = img.copy()
    if j in GEL: img = gel.copy()
    if 32.04 <= t < 34.89:
        k = min(1, (t - 32.04) / .12) * min(1, (34.89 - t) / .25)
        rgb, al = BADGE; al = al * k
        img = (img * (1 - al) + rgb * al).astype(np.uint8)
    if i >= FIN0:
        n = i - FIN0; z = 1 + .0008 * n; hh, ww = int(H / z), int(W / z); y0, x0 = (H - hh) // 2, (W - ww) // 2
        f = np.asarray(Image.fromarray(FIN[y0:y0 + hh, x0:x0 + ww]).resize((W, H), Image.BILINEAR)).astype(np.float32)
        img = (f * min(1, n / (.35 * FPS))).astype(np.uint8)
    enc.stdin.write(img.tobytes()); i += 1; n_out += 1
enc.stdin.close(); enc.wait()
t0, t1 = CUT0 / FPS, CUT1 / FPS
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', TMP + '.mp4', '-i', SRC, '-filter_complex',
                f'[1:a]asplit[s0][s1];[s0]atrim=0:{t0:.4f},asetpts=PTS-STARTPTS,afade=t=out:st={t0 - .02:.4f}:d=0.02[a0];[s1]atrim={t1:.4f},asetpts=PTS-STARTPTS,afade=t=in:d=0.02[a1];[a0][a1]concat=n=2:v=0:a=1[a]',
                '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', OUT], check=True)
os.remove(TMP + '.mp4'); print('images', n_out, 'durée', round(n_out / FPS, 2))
