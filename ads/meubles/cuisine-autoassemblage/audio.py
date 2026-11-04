import numpy as np, wave, os
D = os.path.dirname(os.path.abspath(__file__))
SR = 44100
T = 24.4
n = int(SR * T)
t = np.arange(n) / SR
out = np.zeros((n, 2))
rng = np.random.default_rng(3)


def add(sig, at, pan=0.0, g=1.0):
    i = int(at * SR); j = min(n, i + len(sig))
    if j <= i: return
    s = sig[: j - i] * g
    out[i:j, 0] += s * (1 - max(pan, 0)); out[i:j, 1] += s * (1 + min(pan, 0))


def env(L, a, r):
    e = np.ones(L); A = int(a * SR); R = int(r * SR)
    if A: e[:A] = np.linspace(0, 1, A)
    if R: e[-R:] *= np.linspace(1, 0, R)
    return e


def lp(x, k):  # one-pole lowpass, k in (0,1)
    y = np.zeros_like(x); acc = 0.0
    for i in range(len(x)):
        acc += k * (x[i] - acc); y[i] = acc
    return y


# --- pad: Am9 -> Fmaj7 -> C -> G, soft, slow chorus
chords = [[110, 164.8, 220, 261.6, 329.6, 493.9], [87.3, 130.8, 174.6, 220, 329.6, 440],
          [65.4, 130.8, 196, 261.6, 329.6, 392], [98, 146.8, 196, 246.9, 293.7, 440]]
seg = T / 4
for ci, ch in enumerate(chords):
    L = int((seg + 1.5) * SR); tt = np.arange(L) / SR
    s = np.zeros(L)
    for f in ch:
        for det in (-0.6, 0.6):
            s += np.sin(2 * np.pi * (f + det) * tt + rng.random() * 6) / len(ch)
    s *= env(L, 1.2, 1.5) * 0.10
    add(s, ci * seg - (0.3 if ci else 0), pan=0)

# --- soft pulse (kick) from the wireframe on, 100 bpm
beat = 60 / 100
def kick():
    L = int(0.35 * SR); tt = np.arange(L) / SR
    f = 50 + 70 * np.exp(-tt * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 9)
k = kick()
x = 4.0
while x < 22.5:
    g = 0.35 if x < 8.3 else (0.5 if x < 14.9 else 0.3)
    add(k, x, g=g); x += beat

# --- whooshes before each cut
def whoosh(L=1.0, up=True):
    N = int(L * SR); w = rng.standard_normal(N)
    w = lp(w, 0.08) * 3
    e = np.linspace(0, 1, N) ** 2 if up else np.linspace(1, 0, N) ** 2
    return w * e
for c in (3.0, 7.0, 8.3, 17.9, 20.9):
    add(whoosh(0.9), c - 0.85, pan=rng.uniform(-0.4, 0.4), g=0.35)

# --- pen scratch on the sketch
scr = lp(rng.standard_normal(int(2.4 * SR)), 0.35) * (0.5 + 0.5 * np.sin(np.arange(int(2.4 * SR)) / SR * 2 * np.pi * 7)) * 0.07
add(scr * env(len(scr), 0.2, 0.4), 0.2)

# --- scan shimmer on the wireframe
L = int(2.6 * SR); tt = np.arange(L) / SR
sh = np.sin(2 * np.pi * (800 + 900 * tt / 2.6) * tt) * 0.03 * env(L, 0.3, 0.6)
add(sh, 4.2, pan=0.2)

# --- wooden clicks / drawer slides during the assembly
def click():
    L = int(0.12 * SR); tt = np.arange(L) / SR
    b = rng.standard_normal(L) * np.exp(-tt * 70)
    tone = np.sin(2 * np.pi * rng.uniform(180, 320) * tt) * np.exp(-tt * 40)
    return lp(b, 0.25) * 1.5 + tone * 0.6
for at in np.sort(rng.uniform(8.6, 14.6, 16)):
    add(click(), at, pan=rng.uniform(-0.6, 0.6), g=0.5)
for at in (9.3, 10.4, 12.1):
    sl = lp(rng.standard_normal(int(0.5 * SR)), 0.05) * env(int(0.5 * SR), 0.1, 0.3) * 1.2
    add(sl, at, pan=rng.uniform(-0.5, 0.5), g=0.4)

# --- reveal impact + shimmer when the kitchen is finished
L = int(2.5 * SR); tt = np.arange(L) / SR
boom = np.sin(2 * np.pi * (40 + 40 * np.exp(-tt * 6)) * tt) * np.exp(-tt * 1.8)
add(boom, 14.9, g=0.6)
bell = sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt * 1.2) for f in (880, 1318.5, 1760)) / 3
add(bell, 14.95, g=0.10)
add(boom * 0.6, 20.9, g=0.4)

# master: fade in/out, normalize
fade = np.ones(n); fade[: int(0.3 * SR)] = np.linspace(0, 1, int(0.3 * SR)); fade[-int(1.6 * SR):] = np.linspace(1, 0, int(1.6 * SR))
out *= fade[:, None]
out = np.tanh(out * 1.2)
out /= np.abs(out).max() / 0.89
w = wave.open(os.path.join(D, "music.wav"), "wb"); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((out * 32767).astype(np.int16).tobytes()); w.close()
print("ok")
