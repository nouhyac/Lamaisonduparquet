"""Mouh Akbou: sketch -> blueprint -> wireframe -> self-assembling kitchen -> reveal. Textless 9:16 reel."""
import subprocess, sys, os
import numpy as np, cv2
from PIL import Image

D = os.path.dirname(os.path.abspath(__file__))
FF = "/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2"
W, H, FPS = 1080, 1920, 30
NAVY = np.array([16, 26, 46], np.float32)        # RGB
LINE = np.array([215, 232, 255], np.float32)


def load(p):
    im = Image.open(os.path.join(D, p)).convert("RGB").resize((W, H), Image.LANCZOS)
    return np.asarray(im).astype(np.float32)


def ease(t):
    t = min(max(t, 0.0), 1.0)
    return t * t * (3 - 2 * t)


def zoom(img, z, cx=0.5, cy=0.5):
    if abs(z - 1) < 1e-4:
        return img
    M = np.float32([[z, 0, (1 - z) * W * cx], [0, z, (1 - z) * H * cy]])
    return cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)


def grid():
    g = np.zeros((H, W), np.float32)
    for x in range(0, W, 60):
        g[:, x] = 0.10
    for y in range(0, H, 60):
        g[y, :] = 0.10
    return g


def wire(img):
    """White-line wireframe from a render (Canny + glow)."""
    gray = cv2.cvtColor(img.astype(np.uint8), cv2.COLOR_RGB2GRAY)
    gray = cv2.bilateralFilter(gray, 9, 40, 9)
    e = cv2.Canny(gray, 40, 110).astype(np.float32) / 255
    e = cv2.dilate(e, np.ones((2, 2), np.uint8))
    glow = cv2.GaussianBlur(e, (0, 0), 6) * 1.6
    return np.clip(e + glow, 0, 1)


def on_navy(lines, g=None):
    a = lines[..., None]
    base = NAVY[None, None, :] * np.ones((H, W, 1), np.float32)
    if g is not None:
        base = base + g[..., None] * 90
    return base * (1 - a) + LINE[None, None, :] * a


# ---------- assets ----------
sk = load("sketch.png")                                   # warm paper + navy ink
sk_ink = np.clip((246 - sk.mean(axis=2)) / 200, 0, 1)     # ink mask
A, B, C = load("A.png"), load("B.png"), load("C.png")
wA = wire(A)
G = grid()
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
rng = np.random.default_rng(7)
noise = cv2.GaussianBlur(rng.random((H, W)).astype(np.float32), (0, 0), 25)
noise = (noise - noise.min()) / (noise.max() - noise.min())
order_sk = 0.75 * (yy / H) + 0.25 * noise                 # pen draws top -> bottom
order_w = 0.8 * (1 - yy / H) + 0.2 * noise                # wireframe builds bottom -> top
paper = np.array([246, 243, 236], np.float32)

ai = os.path.join(D, "ai.mp4")


def ai_frames():
    p = subprocess.Popen([FF, "-v", "error", "-i", ai, "-vf",
                          f"scale={W}:{H}:force_original_aspect_ratio=increase:flags=lanczos,crop={W}:{H},fps={FPS}",
                          "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
    out = []
    while True:
        b = p.stdout.read(W * H * 3)
        if len(b) < W * H * 3:
            break
        out.append(np.frombuffer(b, np.uint8).reshape(H, W, 3).astype(np.float32))
    return out


AI = ai_frames()
print("ai frames", len(AI), file=sys.stderr)

enc = subprocess.Popen([FF, "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
                        "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "17", "-pix_fmt", "yuv420p",
                        os.path.join(D, "video_noaudio.mp4")], stdin=subprocess.PIPE)


def emit(f):
    enc.stdin.write(np.clip(f, 0, 255).astype(np.uint8).tobytes())


def seg(sec, fn):
    n = int(round(sec * FPS))
    for i in range(n):
        emit(fn(i / max(n - 1, 1), i))


# S1 3.0s: the hand sketch draws itself
def s1(t, i):
    r = ease(t / 0.8)
    a = (order_sk < r * 1.05).astype(np.float32)
    a = cv2.GaussianBlur(a, (0, 0), 3)
    ink = sk_ink * a
    f = paper * (1 - ink[..., None]) + np.array([28, 36, 80], np.float32) * ink[..., None]
    return zoom(f, 1.0 + 0.06 * t)
seg(3.0, s1)

# S2 1.0s: paper flips to blueprint (inverted lines on navy + grid)
bp_sk = on_navy(sk_ink, G)
def s2(t, i):
    k = ease(t)
    f0 = zoom(paper * (1 - sk_ink[..., None]) + np.array([28, 36, 80], np.float32) * sk_ink[..., None], 1.06)
    f1 = zoom(bp_sk, 1.06 + 0.02 * t)
    flash = np.exp(-((t - 0.5) ** 2) / 0.01) * 60
    return f0 * (1 - k) + f1 * k + flash
seg(1.0, s2)

# S3 3.0s: 3D wireframe of the kitchen builds bottom -> top with a scan line
def s3(t, i):
    r = ease(t / 0.85)
    a = np.clip((r * 1.1 - order_w) * 12, 0, 1)
    lines = wA * a
    scan_y = H * (1 - r * 1.05)
    scan = np.exp(-((yy - scan_y) ** 2) / (2 * 14 ** 2)) * 0.6 * (r < 0.97)
    f = on_navy(np.clip(lines + scan, 0, 1), G * (0.4 + 0.6 * r))
    # sketch blueprint fades out under it
    k = ease(t / 0.3)
    f = zoom(bp_sk, 1.08) * (1 - k) + f * k
    return zoom(f, 1.0 + 0.03 * t)
seg(3.0, s3)

# S4 1.3s: wireframe dissolves into the empty room (lines linger, then vanish)
wB = wire(B)
def s4(t, i):
    k = ease(t)
    room = B * k + NAVY * (1 - k)
    lines = (wA * (1 - ease(t * 1.6)) + wB * 0.6 * np.sin(np.pi * t))[..., None]
    f = room * (1 - lines * 0.85) + LINE * lines * 0.85
    return zoom(f, 1.03 + 0.0 * t)
seg(1.3, s4)

# S5: AI self-assembly clip (first frames blended from B for a seamless join)
for i, fr in enumerate(AI):
    if i < 8:
        k = ease(i / 8)
        fr = zoom(B, 1.03) * (1 - k) + fr * k
    emit(fr)

# S6 3.0s: reveal hold on the finished kitchen, slow push-in, light bloom
def s6(t, i):
    k = ease(t / 0.15)
    base = AI[-1] * (1 - k) + A * k
    f = zoom(base, 1.0 + 0.07 * ease(t), 0.55, 0.45)
    bloom = cv2.GaussianBlur(f, (0, 0), 25)
    return f * 0.9 + bloom * 0.18
seg(3.0, s6)

# S7 3.0s: fridge + oven column, push-in toward the oven
def s7(t, i):
    f = zoom(C, 1.02 + 0.12 * ease(t), 0.62, 0.45)
    if t < 0.12:
        f = f * ease(t / 0.12) + 255 * (1 - ease(t / 0.12)) * 0.5
    return f
seg(3.0, s7)

# S8 3.5s: blueprint vs reality wipe across the finished kitchen, then fade out
bpA = on_navy(wA, G)
def s8(t, i):
    x = W * (1.1 - 1.25 * ease(t / 0.75))
    m = np.clip((xx - x) / 40 + 0.5, 0, 1)[..., None]      # right of the line = real
    edge = np.exp(-((xx - x) ** 2) / (2 * 6 ** 2))[..., None] * 200
    f = bpA * (1 - m) + A * m + edge
    f = zoom(f, 1.05 - 0.03 * t)
    if t > 0.8:
        f = f * (1 - ease((t - 0.8) / 0.2))
    return f
seg(3.5, s8)

enc.stdin.close(); enc.wait()
total = (3.0 + 1.0 + 3.0 + 1.3) + len(AI) / FPS + 3.0 + 3.0 + 3.5
print("cuts", 3.0, 4.0, 7.0, 8.3, 8.3 + len(AI) / FPS, total)
open(os.path.join(D, "cuts.txt"), "w").write(f"{8.3 + len(AI) / FPS} {total}\n")
