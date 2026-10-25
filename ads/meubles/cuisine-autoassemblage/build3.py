"""V2 (free tools): hook + rewind, sketch rising from the table, wireframe dolly,
speed-ramped assembly, light sweeps, whip transitions, grade + grain. Beat grid 120 bpm."""
import subprocess, sys, os
import numpy as np, cv2
from PIL import Image

D = os.path.dirname(os.path.abspath(__file__))
FF = "/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2"
W, H, FPS = 1080, 1920, 30
NAVY = np.array([12, 20, 38], np.float32)
LINE = np.array([210, 230, 255], np.float32)
PAPER = np.array([246, 243, 236], np.float32)
INK = np.array([28, 36, 80], np.float32)


def load(p):
    return np.asarray(Image.open(os.path.join(D, p)).convert("RGB").resize((W, H), Image.LANCZOS)).astype(np.float32)


def ease(t):
    t = min(max(t, 0.0), 1.0); return t * t * (3 - 2 * t)


def eio(t):  # strong ease in-out
    t = min(max(t, 0.0), 1.0); return 0.5 - 0.5 * np.cos(np.pi * t)


def cam(img, z=1.0, cx=0.5, cy=0.5, rot=0.0, dx=0.0, dy=0.0):
    M = cv2.getRotationMatrix2D((W * cx, H * cy), rot, z)
    M[0, 2] += dx; M[1, 2] += dy
    return cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)


yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
G = np.zeros((H, W), np.float32); G[:, ::60] = 0.10; G[::60, :] = 0.10
rng = np.random.default_rng(7)
noise = cv2.GaussianBlur(rng.random((H, W)).astype(np.float32), (0, 0), 25)
noise = (noise - noise.min()) / (noise.max() - noise.min())
VIG = (1 - 0.38 * (((xx / W - 0.5) * 1.1) ** 2 + ((yy / H - 0.5) * 0.9) ** 2) * 2.2)[..., None]
GRAIN = [rng.normal(0, 5.5, (H // 2, W // 2)).astype(np.float32) for _ in range(6)]
GRAIN = [cv2.resize(g, (W, H))[..., None] for g in GRAIN]


def wire(img):
    gray = cv2.cvtColor(img.astype(np.uint8), cv2.COLOR_RGB2GRAY)
    gray = cv2.bilateralFilter(gray, 9, 40, 9)
    e = cv2.Canny(gray, 45, 120).astype(np.float32) / 255
    e = cv2.dilate(e, np.ones((2, 2), np.uint8))
    return np.clip(e + cv2.GaussianBlur(e, (0, 0), 7) * 1.8, 0, 1)


def on_navy(lines, g=None, gk=1.0):
    base = np.broadcast_to(NAVY, (H, W, 3)).astype(np.float32).copy()
    if g is not None: base += g[..., None] * 90 * gk
    a = lines[..., None]
    return base * (1 - a) + LINE * a


def sweep(f, t, ang=0.35, width=180, gain=0.35):
    """Specular light sweep moving across the frame."""
    pos = -W * 0.6 + t * W * 2.2
    d = (xx + yy * ang) - pos - H * ang * 0.5
    band = np.exp(-(d ** 2) / (2 * width ** 2))[..., None]
    lum = (f.mean(axis=2, keepdims=True) / 255) ** 1.5
    return f + band * lum * 255 * gain


def grade(f, i):
    f = f / 255
    f = f * f * (3 - 2 * f) * 0.35 + f * 0.65            # gentle S-curve
    f = f * np.array([1.02, 1.0, 0.97])                    # warm
    f = f * 255 * VIG + GRAIN[i % 6]
    return f


def whip(f, k, direction=1):
    """Directional motion blur + shift; k in [0,1] strength."""
    if k <= 0.01: return f
    L = int(5 + 120 * k) | 1
    ker = np.zeros((1, L), np.float32); ker[0, :] = 1 / L
    b = cv2.filter2D(f, -1, ker)
    return cam(b, dx=direction * W * 0.35 * k)


# ---------- assets ----------
sk = load("sketch.png")
sk_ink = np.clip((246 - sk.mean(axis=2)) / 200, 0, 1)
A, B, C = load("A.png"), load("B.png"), load("C.png")
wA, wB = wire(A), wire(B)
order_sk = 0.75 * (yy / H) + 0.25 * noise
order_w = 0.8 * (1 - yy / H) + 0.2 * noise


def ai_frames():
    p = subprocess.Popen([FF, "-v", "error", "-i", os.path.join(D, "ai.mp4"), "-vf",
                          f"scale={W}:{H}:force_original_aspect_ratio=increase:flags=lanczos,crop={W}:{H},fps={FPS}",
                          "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
    out = []
    while True:
        b = p.stdout.read(W * H * 3)
        if len(b) < W * H * 3: break
        out.append(np.frombuffer(b, np.uint8).reshape(H, W, 3).astype(np.float32))
    return out


AI = ai_frames(); NA = len(AI)

enc = subprocess.Popen([FF, "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
                        "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "17", "-pix_fmt", "yuv420p",
                        os.path.join(D, "v3_noaudio.mp4")], stdin=subprocess.PIPE)
FR = [0]


def emit(f):
    f = grade(f, FR[0]); FR[0] += 1
    enc.stdin.write(np.clip(f, 0, 255).astype(np.uint8).tobytes())


def seg(sec, fn):
    n = int(round(sec * FPS))
    for i in range(n): emit(fn(i / max(n - 1, 1), i, n))


# 0.0-0.5  HOOK: the finished kitchen, punch-in
seg(0.5, lambda t, i, n: sweep(cam(A, 1.12 - 0.08 * eio(t), 0.5, 0.45), 0.2 + t * 0.4))

# 0.5-2.0  REWIND: the build plays backwards at high speed
def rew(t, i, n):
    s = int((1 - t) * (NA - 1))
    f = AI[s]
    blur = cv2.GaussianBlur(f, (0, 0), 1.5)
    sh = np.stack([np.roll(f[..., 0], 6, 1), f[..., 1], np.roll(f[..., 2], -6, 1)], -1)  # chroma split
    f = blur * 0.4 + sh * 0.6
    k = max(0, 1 - t / 0.2)
    return whip(f, k * 0.6, -1)
seg(1.5, rew)

# 2.0-6.0  3D SCHEMATIC: units rise, wall cabinets drop, camera orbits
import schema3d
def s_schem(t, i, n):
    f = schema3d.render(t)
    if t < 0.06: f = whip(f, (1 - t / 0.06) * 0.7, 1)
    return f
seg(4.0, s_schem)
last_schem = schema3d.render(1.0)

# 6.0-8.0  schematic -> wireframe of the real kitchen (flash), slow dolly
def s_wire(t, i, n):
    k = ease(t / 0.35)
    wf = on_navy(wA, G, 0.6)
    f = last_schem * (1 - k) + cam(wf, 1.10 - 0.08 * eio(t), 0.52, 0.5) * k
    return f + np.exp(-((t - 0.17) ** 2) / 0.004) * 80
seg(2.0, s_wire)

# 8.0-9.0  wireframe -> empty room
def s_room(t, i, n):
    k = ease(t)
    room = B * k + NAVY * (1 - k)
    lines = (wA * (1 - ease(t * 1.6)) + wB * 0.6 * np.sin(np.pi * t))[..., None]
    return cam(room * (1 - lines * .85) + LINE * lines * .85, 1.02 + 0.01 * t)
seg(1.0, s_room)

# 9.0-16.5  ASSEMBLY with speed ramp (normal -> slow-mo on drawers -> fast finish) + slow push-in
def src_pos(u):
    # output fraction u -> source fraction
    pts = [(0, 0), (0.30, 0.38), (0.70, 0.62), (1.0, 1.0)]
    for (u0, s0), (u1, s1) in zip(pts, pts[1:]):
        if u <= u1: return s0 + (s1 - s0) * (u - u0) / (u1 - u0)
    return 1.0
def s_build(t, i, n):
    s = src_pos(t) * (NA - 1)
    a, fr = int(s), s - int(s)
    f = AI[a] * (1 - fr) + AI[min(a + 1, NA - 1)] * fr
    if i < 8:
        k = ease(i / 8); f = cam(B, 1.03) * (1 - k) + f * k
    return cam(f, 1.0 + 0.06 * eio(t), 0.5, 0.42)
seg(7.5, s_build)

# 16.5-19.5  REVEAL: bloom + light sweep + push-in
def s_reveal(t, i, n):
    k = ease(t / 0.12)
    base = cam(AI[-1], 1.06) * (1 - k) + A * k
    f = cam(base, 1.0 + 0.08 * eio(t), 0.55, 0.45)
    f = f * 0.9 + cv2.GaussianBlur(f, (0, 0), 25) * 0.18
    f = sweep(f, t, gain=0.30)
    return f + (1 - ease(t / 0.08)) * 120
seg(3.0, s_reveal)

# 19.5-22.5  OVEN COLUMN: whip in, push toward the oven, sweep on steel
def s_oven(t, i, n):
    f = cam(C, 1.02 + 0.14 * eio(t), 0.62, 0.45)
    f = sweep(f, t * 0.9, ang=-0.3, width=140, gain=0.35)
    return whip(f, max(0, 1 - t / 0.12) * 0.8, -1)
seg(3.0, s_oven)

# 22.5-26.0  PLAN vs REALITY wipe, then hold and fade
bpA = on_navy(wA, G)
def s_end(t, i, n):
    x = W * (1.1 - 1.25 * eio(t / 0.6))
    m = np.clip((xx - x) / 40 + 0.5, 0, 1)[..., None]
    edge = np.exp(-((xx - x) ** 2) / (2 * 6 ** 2))[..., None] * 220
    f = cam(bpA * (1 - m) + A * m + edge, 1.05 - 0.04 * t)
    f = whip(f, max(0, 1 - t / 0.08) * 0.8, 1)
    if t > 0.78: f = f * (1 - ease((t - 0.78) / 0.22))
    return f
seg(3.5, s_end)

enc.stdin.close(); enc.wait()
print("frames", FR[0], "sec", FR[0] / FPS)
