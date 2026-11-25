"""Film 1:10 (9:16) : 11 plans Higgsfield (clips3/s01..s11.mp4) + vraie vidéo du showroom + carte de fin.
Coupes calées sur 105 BPM, textes sobres (cards3/), étalonnage commun, aucune voix ni musique
(la musique est ajoutée à la publication, bibliothèque Meta / Instagram).
Plan manquant -> image fixe de remplacement (sources du site), pour tester le montage avant génération.
Sorties : out/film-1m10-9x16.mp4, out/film-1m10-4x5.mp4, out/film-15s-9x16.mp4"""
import os, subprocess

FF = os.environ.get("FF") or __import__("imageio_ffmpeg").get_ffmpeg_exe()
HERE = os.path.dirname(os.path.abspath(__file__))
IMG, SRC = os.path.join(HERE, "../../site/img"), os.path.join(HERE, "../sources")
SEG, OUT, CL, K = f"{HERE}/seg3", f"{HERE}/out", f"{HERE}/clips3", f"{HERE}/cards3"
for d in (SEG, OUT, CL): os.makedirs(d, exist_ok=True)
W, H, FPS = 1080, 1920, 30
BEAT = 60 / 105                      # 105 BPM
SHOT, XF = 11 * BEAT, BEAT / 2       # un plan = 11 temps (6,3 s), fondu = un demi-temps -> film de 1:10
GRADE = "eq=contrast=1.05:saturation=1.06:gamma=0.98,colorbalance=rs=0.02:bs=-0.02:rh=0.012,vignette=PI/6"
ENC = ["-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p", "-r", str(FPS), "-an"]

FAST = os.environ.get("FAST") == "1"   # FAST=1 : réutilise les plans déjà rendus dans seg3/
def ff(*a):
    if FAST and str(a[-1]).startswith(SEG) and os.path.exists(a[-1]): return
    subprocess.run([FF, "-y", "-hide_banner", "-loglevel", "error", *a], check=True)
COVER = f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},setsar=1"

def with_card(vf, card, dur):
    # texte : apparition douce au 1er temps, disparition avant la coupe
    return (vf + f"[b];[1:v]format=rgba,fade=t=in:st={BEAT:.3f}:d={BEAT:.3f}:alpha=1,fade=t=out:st={dur-BEAT*1.5:.3f}:d={BEAT:.3f}:alpha=1[c];[b][c]overlay=0:0",
            ["-loop", "1", "-t", f"{dur:.3f}", "-i", card])

def video(name, src, dur, card=None, ss=0.0):
    """Plan vidéo étiré à la durée voulue (ralenti doux si le clip est plus court)."""
    probe = subprocess.run([FF, "-i", src], capture_output=True, text=True).stderr
    h, m, s = probe.split("Duration: ")[1].split(",")[0].split(":"); srcdur = int(h) * 3600 + int(m) * 60 + float(s) - ss
    speed = min(1.0, srcdur / dur)
    vf = f"[0:v]setpts={1/speed:.4f}*PTS,{COVER},fps={FPS},{GRADE},trim=duration={dur:.3f}"
    extra = []
    if card: vf, extra = with_card(vf, card, dur)
    ff("-ss", str(ss), "-i", src, *extra, "-filter_complex", vf, "-t", f"{dur:.3f}", *ENC, f"{SEG}/{name}.mp4")
    return f"{SEG}/{name}.mp4"

def still(name, img, dur, card=None, z0=1.0, z1=1.06, grade=True):
    n = int(dur * FPS)
    vf = (f"[0:v]scale={W*2}:{H*2}:force_original_aspect_ratio=increase,crop={W*2}:{H*2},"
          f"zoompan=z='{z0}+({z1}-{z0})*on/{n}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={n}:s={W}x{H}:fps={FPS},setsar=1" + (f",{GRADE}" if grade else ""))
    extra = []
    if card: vf, extra = with_card(vf, card, dur)
    ff("-loop", "1", "-t", f"{dur:.3f}", "-i", img, *extra, "-filter_complex", vf, "-t", f"{dur:.3f}", *ENC, f"{SEG}/{name}.mp4")
    return f"{SEG}/{name}.mp4"

# (plan, texte, image de remplacement tant que le plan n'est pas généré)
PLAN = [("s01", "c1", f"{SRC}/v-tile.jpg"), ("s02", "c2", f"{SRC}/v-el2863.jpg"), ("s03", "c3", f"{SRC}/v-egger-el2863.jpg"),
        ("s04", "c4", f"{SRC}/v-sw-el2863.jpg"), ("s05", "c5", f"{SRC}/v-egger-el2416.jpg"), ("s06", "c6", f"{SRC}/v-el1061.jpg"),
        ("s07", "c7", f"{SRC}/v-el2970.jpg"), ("s08", "c8", f"{SRC}/v-sw-el1055.jpg"), ("s09", "c9", f"{SRC}/v-show-floor.jpg")]
parts = []
for name, card, fallback in PLAN:
    clip = f"{CL}/{name}.mp4"
    parts.append(video(name, clip, SHOT, f"{K}/{card}.png") if os.path.exists(clip) else still(name, fallback, SHOT, f"{K}/{card}.png"))
parts.append(video("s10", f"{IMG}/show-loop.mp4", 8 * BEAT, f"{K}/c10.png"))                     # vraie vidéo
parts.append(video("s11", f"{CL}/s11.mp4", SHOT) if os.path.exists(f"{CL}/s11.mp4") else still("s11", f"{SRC}/v-el2863.jpg", SHOT))
parts.append(still("s12", f"{K}/end.png", 12 * BEAT, z0=1.0, z1=1.03, grade=False))             # carte de fin

def chain(files, out):
    durs = [float(subprocess.run([FF, "-i", f], capture_output=True, text=True).stderr.split("Duration: ")[1].split(",")[0].split(":")[2]) for f in files]
    ins, fc, prev, off = [], [], "[0:v]", 0.0
    for f in files: ins += ["-i", f]
    for i in range(1, len(files)):
        off += durs[i - 1] - XF
        fc.append(f"{prev}[{i}:v]xfade=transition={'fadewhite' if i == len(files)-1 else 'fade'}:duration={XF:.3f}:offset={off:.3f}[v{i}]"); prev = f"[v{i}]"
    # piste son silencieuse : Meta / Instagram ajoutent la musique à la publication
    ff(*ins, "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo", "-filter_complex", ";".join(fc), "-map", prev, "-map", f"{len(files)}:a",
       "-shortest", "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p", "-c:a", "aac", "-movflags", "+faststart", out)
    return sum(durs) - XF * (len(files) - 1)

total = chain(parts, f"{OUT}/film-1m10-9x16.mp4")
# 15 s pour les pubs : accroche, matière, Aqua, fin
def seg(name, card, fallback, dur):
    clip = f"{CL}/{name}.mp4"
    return video(name + "c", clip, dur, f"{K}/{card}.png") if os.path.exists(clip) else still(name + "c", fallback, dur, f"{K}/{card}.png")
short = chain([seg(*PLAN[0], 8 * BEAT), seg(*PLAN[3], 8 * BEAT), seg(*PLAN[4], 8 * BEAT),
               still("e15", f"{K}/end.png", 4 * BEAT, z0=1.0, z1=1.02, grade=False)], f"{OUT}/film-15s-9x16.mp4")
ff("-i", f"{OUT}/film-1m10-9x16.mp4", "-filter_complex",
   "[0:v]split[a][b];[a]scale=1080:1350:force_original_aspect_ratio=increase,crop=1080:1350,gblur=sigma=40,eq=brightness=-0.08[bg];[b]scale=-2:1350[fg];[bg][fg]overlay=(W-w)/2:0",
   "-c:v", "libx264", "-preset", "slow", "-crf", "19", "-pix_fmt", "yuv420p", "-c:a", "copy", "-movflags", "+faststart", f"{OUT}/film-1m10-4x5.mp4")
print(f"ok : film {total:.1f} s, version courte {short:.1f} s")
