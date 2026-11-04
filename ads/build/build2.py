"""Montage « agence » de la pub 9:16 (≈ 60 s) : 12 plans Higgsfield + décors + showroom réel + carte de fin,
textes à l'écran, voix off calée sur les plans, musique et effets sonores générés (sans droits).
Entrées : clips/ai1..ai12.mp4, vo/l1..l8.wav, cards/*.png, images et vidéo du site.
Sortie  : out/pub-lamaisonduparquet-agence-9x16.mp4"""
import os, subprocess, wave, math, struct, random

FF = "/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2"
HERE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(HERE, "../../site/img")
SEG = f"{HERE}/seg2"; os.makedirs(SEG, exist_ok=True); os.makedirs(f"{HERE}/out", exist_ok=True)
W, H, FPS, SR = 1080, 1920, 30, 44100
# étalonnage commun : léger contraste, chaleur, vignette douce
GRADE = "eq=contrast=1.06:saturation=1.08:gamma=0.98,colorbalance=rs=0.02:bs=-0.02:rh=0.015,vignette=PI/5"
ENC = ["-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p", "-r", str(FPS), "-an"]

FAST = os.environ.get("FAST") == "1"   # FAST=1 : réutilise les plans déjà rendus (refait seulement le son)
def ff(*a):
    if FAST and a[-1].startswith(SEG) and a[-1].endswith(".mp4") and os.path.exists(a[-1]): return
    subprocess.run([FF, "-y", "-hide_banner", "-loglevel", "error", *a], check=True)
def cover(): return f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},setsar=1"

def overlay(vf, card, dur, at=0.15):
    return vf + f"[b];[1:v]format=rgba,fade=t=in:st={at}:d=0.35:alpha=1[c];[b][c]overlay=0:0", ["-loop", "1", "-t", str(dur), "-i", card]

def clip(name, src, dur, card=None, speed=1.0, ss=0.0):
    vf = f"[0:v]setpts={1/speed}*PTS,{cover()},fps={FPS},{GRADE},trim=duration={dur}"
    extra = []
    if card: vf, extra = overlay(vf, card, dur)
    ff("-ss", str(ss), "-i", src, *extra, "-filter_complex", vf, "-t", str(dur), *ENC, f"{SEG}/{name}.mp4")
    return (f"{SEG}/{name}.mp4", dur)

def still(name, img, dur, z0=1.0, z1=1.07, card=None, grade=True):
    n = int(dur * FPS)
    vf = (f"[0:v]scale={W*2}:{H*2}:force_original_aspect_ratio=increase,crop={W*2}:{H*2},"
          f"zoompan=z='{z0}+({z1}-{z0})*on/{n}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={n}:s={W}x{H}:fps={FPS},setsar=1"
          + (f",{GRADE}" if grade else ""))
    extra = []
    if card: vf, extra = overlay(vf, card, dur, 0.05)
    ff("-loop", "1", "-t", str(dur), "-i", img, *extra, "-filter_complex", vf, "-t", str(dur), *ENC, f"{SEG}/{name}.mp4")
    return (f"{SEG}/{name}.mp4", dur)

def concat(name, parts):
    lst = f"{SEG}/{name}.txt"
    with open(lst, "w") as f: f.writelines(f"file '{p}'\n" for p, _ in parts)
    ff("-f", "concat", "-safe", "0", "-i", lst, *ENC, f"{SEG}/{name}.mp4")
    return (f"{SEG}/{name}.mp4", sum(d for _, d in parts))

C, K = f"{HERE}/clips", f"{HERE}/cards"
# ---- les plans : (fichier, durée), transition vers le suivant ----
shots = [
    (clip("p01", f"{C}/ai1.mp4", 5.0, f"{K}/t1.png"), "fade"),          # accroche : carrelage -> Asgil miel
    (clip("p02", f"{C}/ai2.mp4", 2.9, ss=3.0), "slideup"),               # les lames claires se posent en vague
    (clip("p03", f"{C}/ai9.mp4", 3.5, f"{K}/t2.png"), "fade"),          # macro : la lame se clipse
    (clip("p04", f"{C}/ai8.mp4", 4.5), "smoothleft"),                   # macro : le grain du bois
    (clip("p05", f"{C}/ai6.mp4", 1.6, ss=4.55, speed=0.8), "fade"),     # fin de l'orbite : Chêne du Nord posé
    (clip("p06", f"{C}/ai4.mp4", 4.0, f"{K}/t3.png"), "fade"),          # salon lumineux : « en une journée »
    (concat("p07", [clip("p07a", f"{C}/ai13.mp4", 3.4, f"{K}/t4.png", speed=0.45, ss=0.3),   # gouttes au ralenti
                     still("p07b", f"{IMG}/egger-el2416.jpg", 3.6, 1.02, 1.09, f"{K}/t4.png")]), "fade"),  # vraie photo EGGER Aqua
    (clip("p08", f"{C}/ai3.mp4", 4.5, f"{K}/t5.png"), "fade"),          # ras du sol : plus chaud
    (clip("p09", f"{C}/ai7.mp4", 3.5, f"{K}/t6.png"), "fade"),          # changement de décor
    (concat("p10", [still(f"d{i}", f"{IMG}/sw-{r}.jpg", 1.0, 1.0, 1.08, f"{K}/d{i}.png")
                    for i, r in enumerate(["el2863", "el1061", "el2970", "el2416", "el1055"])]), "fade"),
    (concat("p11", [clip("p11a", f"{C}/ai10.mp4", 3.0, f"{K}/t7.png"), clip("p11b", f"{IMG}/show-loop.mp4", 3.5, f"{K}/t7.png")]), "fade"),
    (clip("p12", f"{C}/ai12.mp4", 4.0), "fadewhite"),                   # plan héros final
    (still("p13", f"{K}/end.png", 7.5, 1.0, 1.035, grade=False), None),  # carte de fin
]
XF = 0.25
starts, t = [], 0.0
for (p, d), _ in shots: starts.append(t); t += d - XF
total = t + XF

inputs, fc, prev, off = [], [], "[0:v]", 0.0
for (p, d), _ in shots: inputs += ["-i", p]
for i in range(1, len(shots)):
    off += shots[i - 1][0][1] - XF
    fc.append(f"{prev}[{i}:v]xfade=transition={shots[i-1][1]}:duration={XF}:offset={off:.3f}[v{i}]"); prev = f"[v{i}]"
ff(*inputs, "-filter_complex", ";".join(fc), "-map", prev, *ENC, f"{SEG}/video.mp4")

# ---- voix off : chaque phrase démarre sur son plan, sans jamais chevaucher la précédente ----
TEMPO = 1.1   # débit publicitaire, naturel
vo = [(1, 0, 0.3), (2, 1, 0.3), (3, 5, 0.0), (4, 6, 0.4), (5, 7, 0.3), (6, 9, 0.2), (7, 10, 0.2), (8, 12, 0.5)]
def wav_len(f):
    with wave.open(f) as w: return w.getnframes() / w.getframerate()
vo_at, end = {}, 0.0
for k, sh, d in vo:
    at = max(starts[sh] + d, end + 0.3); vo_at[k] = at; end = at + wav_len(f"{HERE}/vo/l{k}.wav") / TEMPO
assert end <= total - 0.3, f"la voix dépasse la vidéo ({end:.1f} s > {total:.1f} s)"

# ---- musique + effets générés ----
BPM = 112; beat = 60 / BPM
n = int(total * SR); L = [0.0] * n; R = [0.0] * n
def put(i, v, pan=0.0):
    if 0 <= i < n: L[i] += v * (1 - pan); R[i] += v * (1 + pan)
random.seed(7)
chords = [(110.0, 164.81, 220.0, 277.18), (98.0, 146.83, 196.0, 246.94), (87.31, 130.81, 174.61, 220.0), (98.0, 146.83, 196.0, 233.08)]
for k in range(n):
    tt = k / SR; bar = int(tt / (beat * 4)) % 4; c = chords[bar]
    env = min(1, tt / 1.5) * min(1, (total - tt) / 3)
    pad = sum(math.sin(2 * math.pi * f * tt) * (0.6 if j == 0 else 0.25) + 0.08 * math.sin(2 * math.pi * f * 2.002 * tt) for j, f in enumerate(c))
    ph = tt % beat
    kick = math.sin(2 * math.pi * (48 + 90 * math.exp(-ph * 30)) * ph) * math.exp(-ph * 9) if tt > 1.5 else 0
    hat_ph = (tt + beat / 2) % beat
    hat = (random.random() * 2 - 1) * math.exp(-hat_ph * 60) * 0.25 if tt > 5 else 0
    v = (pad * 0.10 + kick * 0.42 + hat * 0.5) * env
    L[k] += v; R[k] += v
def whoosh(t0, d=0.45, g=0.35):
    s = int(t0 * SR); m = int(d * SR); lp = 0.0
    for i in range(m):
        x = i / m; lp += 0.08 * ((random.random() * 2 - 1) - lp); a = math.sin(math.pi * x) ** 2
        put(s + i, lp * a * g * 3, pan=(x - .5) * .8)
def click(t0, g=0.6):
    s = int(t0 * SR)
    for i in range(int(0.06 * SR)):
        x = i / SR; put(s + i, (math.sin(2 * math.pi * 1800 * x) * .6 + (random.random() * 2 - 1) * .4) * math.exp(-x * 90) * g)
for i, st in enumerate(starts[1:], 1): whoosh(st - 0.2, g=0.22 if i % 2 else 0.3)
click(starts[2] + 1.6); click(starts[2] + 1.75, .35)      # la lame se clipse
with wave.open(f"{SEG}/music.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(b"".join(struct.pack("<hh", int(max(-1, min(1, l)) * 32767), int(max(-1, min(1, r)) * 32767)) for l, r in zip(L, R)))

ains = ["-i", f"{SEG}/music.wav"]; labs = []
mix = []
for i, (k, at) in enumerate(sorted(vo_at.items()), 1):
    ains += ["-i", f"{HERE}/vo/l{k}.wav"]; ms = int(at * 1000)
    mix.append(f"[{i}:a]aresample={SR},aformat=channel_layouts=stereo,atempo={TEMPO},highpass=f=90,acompressor=threshold=-18dB:ratio=3,adelay={ms}|{ms},volume=1.5[a{i}]"); labs.append(f"[a{i}]")
mix.append("".join(labs) + f"amix=inputs={len(labs)}:normalize=0[voice]")
mix.append("[voice]asplit[vk][vm]")
mix.append("[0:a]volume=0.55[mu];[mu][vk]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=350[duck]")   # la musique s'efface sous la voix
mix.append("[duck][vm]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=9,aresample=48000,apad[m]")
ff(*ains, "-filter_complex", ";".join(mix), "-map", "[m]", "-t", f"{total:.2f}", "-ar", "48000", "-c:a", "pcm_s16le", f"{SEG}/audio.wav")

out = f"{HERE}/out/pub-lamaisonduparquet-agence-9x16.mp4"
ff("-i", f"{SEG}/video.mp4", "-i", f"{SEG}/audio.wav", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "-shortest", out)
# version 4:5 pour le fil d'actualité Facebook / Instagram
ff("-i", out, "-filter_complex", "[0:v]split[a][b];[a]scale=1080:1350:force_original_aspect_ratio=increase,crop=1080:1350,gblur=sigma=40,eq=brightness=-0.08[bg];[b]scale=-2:1350[fg];[bg][fg]overlay=(W-w)/2:0", "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p", "-c:a", "copy",
   "-movflags", "+faststart", f"{HERE}/out/pub-lamaisonduparquet-agence-4x5.mp4")
print("ok", round(total, 2), "s ; voix :", {k: round(v, 1) for k, v in vo_at.items()})
