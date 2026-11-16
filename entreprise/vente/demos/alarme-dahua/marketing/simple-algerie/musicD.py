import numpy as np, wave
sr = 44100; D = 19.5; n = int(sr * D); out = np.zeros(n); rng = np.random.default_rng(21)
def env(L, a=.005, r=.3):
    x = np.arange(L) / sr; return np.minimum(1, x / a) * np.exp(-x / r)
def add(s, st):
    i = int(st * sr); j = min(n, i + len(s))
    if 0 <= i < n: out[i:j] += s[:j - i]
def pluck(f, L, amp):
    x = np.arange(L) / sr; return (np.sin(2 * np.pi * f * x) + .4 * np.sin(4 * np.pi * f * x) + .15 * np.sin(6 * np.pi * f * x)) * env(L, .003, .35) * amp
bpm = 104; beat = 60 / bpm; bar = 4 * beat
prog = [[220.0, 261.63, 329.63], [174.61, 220.0, 261.63], [261.63, 329.63, 392.0], [196.0, 246.94, 293.66]]
k = 0; t = 0.0
while t < D:
    f = prog[k % 4]; Lb = int(bar * sr); x = np.arange(Lb) / sr
    add(sum(np.sin(2 * np.pi * q * x) for q in f) * np.minimum(1, x / .3) * np.minimum(1, (bar - x) / .3) * .025, t)
    for b8 in range(8):
        add(pluck(f[[0, 2, 1, 2, 0, 2, 1, 2][b8]] * 2, int(.4 * sr), .055), t + b8 * beat / 2)
    for h in range(4):
        bt = t + h * beat
        Lk = int(.25 * sr); xk = np.arange(Lk) / sr; add(np.sin(2 * np.pi * np.cumsum(95 * np.exp(-xk * 24) + 45) / sr) * env(Lk, .002, .1) * .5, bt)
        if h % 2: Ls = int(.16 * sr); add(rng.standard_normal(Ls) * env(Ls, .001, .045) * .1, bt)
        Lh = int(.04 * sr); add(np.diff(np.concatenate([[0], rng.standard_normal(Lh)])) * env(Lh, .001, .01) * .04, bt + beat / 2)
    bl = int(bar * sr); xb = np.arange(bl) / sr; add(np.sin(2 * np.pi * f[0] / 2 * xb) * env(bl, .02, 1.0) * .14, t)
    t += bar; k += 1
# sons de notification (scène téléphone : 5.4 s + 0.5/1.05/1.6)
for ts in (5.9, 6.45, 7.0):
    for i, f in enumerate((1318.5, 1760.0)):
        L = int(.35 * sr); x = np.arange(L) / sr; add(np.sin(2 * np.pi * f * x) * env(L, .002, .12) * .13, ts + i * .09)
# impact prix (13.9 + 0.5) et fin
for ts in (14.4, 16.6):
    L = int(1.2 * sr); x = np.arange(L) / sr; add((np.sin(2 * np.pi * 50 * x) * .8 + rng.standard_normal(L) * .1) * env(L, .003, .4) * .5, ts)
fade = np.ones(n); fo = int(1.6 * sr); fade[-fo:] = np.linspace(1, 0, fo); fi = int(.3 * sr); fade[:fi] = np.linspace(0, 1, fi)
out *= fade; out /= np.max(np.abs(out)) * 1.12
w = wave.open('musicD.wav', 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((out * 32767).astype(np.int16).tobytes()); w.close(); print('ok')
