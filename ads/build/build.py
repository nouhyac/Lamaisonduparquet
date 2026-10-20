"""Montage de la pub vidéo 9:16 (60 s) : plans IA Higgsfield + séquences locales + textes + voix off + fond sonore.
Entrées : clips/ai1..ai5.mp4 (Higgsfield), vo/l1..l8.wav (voix off), cards/*.png (textes), images du site.
Sortie  : out/pub-lamaisonduparquet-9x16.mp4"""
import os, subprocess, wave, math, struct, random

FF = "/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2"
HERE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(HERE, "../../site/img")
os.makedirs(f"{HERE}/seg", exist_ok=True); os.makedirs(f"{HERE}/out", exist_ok=True)
W, H, FPS = 1080, 1920, 30
ENC = ["-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p", "-r", str(FPS), "-an"]

def ff(*args):
    subprocess.run([FF, "-y", "-hide_banner", "-loglevel", "error", *args], check=True)

def cover(src="[0:v]"):
    return f"{src}scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},setsar=1"

def kenburns(img, dur, out, z0=1.0, z1=1.08, crop=None, card=None, fadein=False):
    """Zoom lent sur une image fixe (rendu en 2x pour un mouvement sans saccade)."""
    n = int(dur * FPS)
    pre = f"crop={crop}," if crop else ""
    vf = (f"[0:v]{pre}scale={W*2}:{H*2}:force_original_aspect_ratio=increase,crop={W*2}:{H*2},"
          f"zoompan=z='{z0}+({z1}-{z0})*on/{n}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={n}:s={W}x{H}:fps={FPS},setsar=1")
    if fadein: vf += ",fade=t=in:st=0:d=0.5"
    inputs = ["-loop", "1", "-t", str(dur), "-i", img]
    if card:
        inputs += ["-loop", "1", "-t", str(dur), "-i", card]
        vf += "[b];[1:v]format=rgba,fade=t=in:st=0.15:d=0.4:alpha=1[c];[b][c]overlay=0:0"
    ff(*inputs, "-filter_complex", vf, "-t", str(dur), *ENC, out)

def clip(src, dur, out, card=None, speed=1.0):
    """Plan vidéo recadré en 1080x1920, ralenti si besoin, avec texte en surimpression."""
    vf = f"[0:v]setpts={1/speed}*PTS," + cover("") + f",fps={FPS},trim=duration={dur}"
    inputs = ["-i", src]
    if card:
        inputs += ["-loop", "1", "-t", str(dur), "-i", card]
        vf += "[b];[1:v]format=rgba,fade=t=in:st=0.2:d=0.4:alpha=1[c];[b][c]overlay=0:0"
    ff(*inputs, "-filter_complex", vf, "-t", str(dur), *ENC, out)

# ---- plans (durées en s) ----
S = []
def add(name, dur): S.append((f"{HERE}/seg/{name}.mp4", dur))

clip(f"{HERE}/clips/ai1.mp4", 6.0, f"{HERE}/seg/s1.mp4", card=f"{HERE}/cards/t1.png"); add("s1", 6.0)
clip(f"{HERE}/clips/ai2.mp4", 5.5, f"{HERE}/seg/s2.mp4", card=f"{HERE}/cards/t2.png"); add("s2", 5.5)
clip(f"{HERE}/clips/ai3.mp4", 5.5, f"{HERE}/seg/s3.mp4"); add("s3", 5.5)
clip(f"{HERE}/clips/ai4.mp4", 6.0, f"{HERE}/seg/s4.mp4", card=f"{HERE}/cards/t3.png"); add("s4", 6.0)
clip(f"{HERE}/clips/ai5.mp4", 9.0, f"{HERE}/seg/s5.mp4", card=f"{HERE}/cards/t4.png", speed=0.667); add("s5", 9.0)
# chaleur : salon EGGER (côté canapé de la photo avant/après)
kenburns(f"{IMG}/ba-el2863.jpg", 7.0, f"{HERE}/seg/s6.mp4", crop="506:900:150:0", card=f"{HERE}/cards/t5.png"); add("s6", 7.0)
# 5 décors, 1,4 s chacun
refs = ["el2863", "el1061", "el2970", "el2416", "el1055"]
parts = []
for i, r in enumerate(refs):
    o = f"{HERE}/seg/d{i}.mp4"; kenburns(f"{IMG}/sw-{r}.jpg", 1.4, o, 1.0, 1.06, card=f"{HERE}/cards/d{i}.png"); parts.append(o)
with open(f"{HERE}/seg/d.txt", "w") as f: f.writelines(f"file '{p}'\n" for p in parts)
ff("-f", "concat", "-safe", "0", "-i", f"{HERE}/seg/d.txt", *ENC, f"{HERE}/seg/s7.mp4"); add("s7", 7.0)
# showroom : vraie vidéo + photo des lames au sol
clip(f"{IMG}/show-loop.mp4", 4.5, f"{HERE}/seg/s8a.mp4", card=f"{HERE}/cards/t7.png")
kenburns(f"{IMG}/show-floor.jpg", 2.5, f"{HERE}/seg/s8b.mp4", 1.04, 1.12)
with open(f"{HERE}/seg/s8.txt", "w") as f: f.write(f"file '{HERE}/seg/s8a.mp4'\nfile '{HERE}/seg/s8b.mp4'\n")
ff("-f", "concat", "-safe", "0", "-i", f"{HERE}/seg/s8.txt", *ENC, f"{HERE}/seg/s8.mp4"); add("s8", 7.0)
kenburns(f"{HERE}/cards/end.png", 9.5, f"{HERE}/seg/s9.mp4", 1.0, 1.035); add("s9", 9.5)

# ---- enchaînement avec fondus courts ----
XF = 0.35
inputs, fc, t, prev = [], [], 0.0, "[0:v]"
for i, (p, d) in enumerate(S): inputs += ["-i", p]
for i in range(1, len(S)):
    t += S[i - 1][1] - XF
    lab = f"[v{i}]"
    fc.append(f"{prev}[{i}:v]xfade=transition={'fade' if i < len(S)-1 else 'fadewhite'}:duration={XF}:offset={t:.3f}{lab}")
    prev = lab
total = sum(d for _, d in S) - XF * (len(S) - 1)
ff(*inputs, "-filter_complex", ";".join(fc), "-map", prev, *ENC, f"{HERE}/seg/video.mp4")

# ---- son : voix off placée sur la timeline + fond sonore discret généré ----
starts = {1: 0.35, 2: 6.0, 3: 16.6, 4: 22.4, 5: 31.0, 6: 37.4, 7: 44.0, 8: 50.8}
SR = 44100
def bed(path, dur):
    """Nappe chaude (accords lents) + pulsation douce, sans droits d'auteur."""
    n = int(dur * SR); out = bytearray()
    chords = [(220.0, 277.18, 329.63), (196.0, 246.94, 293.66), (174.61, 220.0, 261.63), (196.0, 246.94, 311.13)]
    random.seed(4)
    for k in range(n):
        tt = k / SR; c = chords[int(tt // 4) % 4]
        env = min(1, tt / 2) * min(1, (dur - tt) / 2.5)
        pad = sum(math.sin(2 * math.pi * f * tt) + .35 * math.sin(2 * math.pi * f * 2.003 * tt) for f in c) / 9
        beat = tt % 0.5; kick = math.sin(2 * math.pi * 55 * beat) * math.exp(-beat * 18) * 0.5
        v = (pad * 0.55 + kick * 0.6) * env * 0.5
        s = int(max(-1, min(1, v)) * 32767); out += struct.pack("<hh", s, s)
    with wave.open(path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(bytes(out))
bed(f"{HERE}/seg/bed.wav", total)
ains = ["-i", f"{HERE}/seg/bed.wav"]; mix = ["[0:a]volume=0.22[b]"]; labs = ["[b]"]
for i, (k, st) in enumerate(sorted(starts.items()), start=1):
    ains += ["-i", f"{HERE}/vo/l{k}.wav"]
    mix.append(f"[{i}:a]aresample={SR},aformat=channel_layouts=stereo,adelay={int(st*1000)}|{int(st*1000)},volume=1.6[a{i}]"); labs.append(f"[a{i}]")
mix.append("".join(labs) + f"amix=inputs={len(labs)}:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11[m]")
ff(*ains, "-filter_complex", ";".join(mix), "-map", "[m]", "-t", f"{total:.2f}", "-c:a", "pcm_s16le", f"{HERE}/seg/audio.wav")

ff("-i", f"{HERE}/seg/video.mp4", "-i", f"{HERE}/seg/audio.wav", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
   "-movflags", "+faststart", "-shortest", f"{HERE}/out/pub-lamaisonduparquet-9x16.mp4")
print("ok", round(total, 2), "s")
