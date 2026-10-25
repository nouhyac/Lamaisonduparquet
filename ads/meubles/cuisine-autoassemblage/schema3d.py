"""Holographic 3D schematic of the L kitchen: units rise from the floor while the camera orbits.
render(t) -> float32 RGB frame (H, W, 3) for t in [0, 1]."""
import numpy as np, cv2

W, H = 1080, 1920
F = (H / 2) / np.tan(np.radians(31))
NAVY = np.array([12, 20, 38], np.float32)
LINE = np.array([210, 230, 255], np.float32)
COOL = np.array([90, 150, 235], np.float32)
WARM = np.array([235, 165, 95], np.float32)


def ease(t):
    t = min(max(t, 0.0), 1.0); return t * t * (3 - 2 * t)


def eio(t):
    t = min(max(t, 0.0), 1.0); return 0.5 - 0.5 * np.cos(np.pi * t)


# ---------- model (mm). x right along back wall, y up, z out of back wall ----------
# box: (x0, y0, z0, x1, y1, z1, kind, front_axis, splits)
# front_axis: '+z' front faces +z (back run), '+x' faces +x (left run)
B = []
def box(x0, y0, z0, x1, y1, z1, kind="base", front=None, vsplit=(), hsplit=()):
    B.append(dict(a=np.array([x0, y0, z0], float), b=np.array([x1, y1, z1], float), kind=kind,
                  front=front, vsplit=vsplit, hsplit=hsplit))

# base run along left wall (faces +x)
box(0, 100, 600, 600, 870, 1500, "base", "+x", hsplit=(0.36, 0.68))          # drawers under hob
box(0, 100, 1500, 600, 870, 2400, "base", "+x", vsplit=(0.5,))
box(0, 0, 600, 560, 100, 2400, "plinth")
# base run along back wall (faces +z)
box(0, 100, 0, 600, 870, 600, "base", "+z")                                  # corner
box(600, 100, 0, 1200, 870, 600, "dw", "+z")                                 # dishwasher
box(1200, 100, 0, 1800, 870, 600, "base", "+z", vsplit=(0.5,))               # sink unit
box(1800, 100, 0, 2400, 870, 600, "wm", "+z")                                # washing machine
box(0, 0, 0, 2400, 100, 560, "plinth")
box(2400, 0, 0, 2460, 2600, 640, "panel")                                     # end panel
# worktops
box(0, 870, 0, 2400, 910, 620, "top")
box(0, 870, 620, 620, 910, 2400, "top")
# oak wall cabinets
box(0, 1450, 0, 2400, 2150, 350, "oak", "+z", vsplit=(0.25, 0.5, 0.62, 0.75))
box(0, 1450, 350, 350, 2150, 900, "oak", "+x")
box(0, 1550, 900, 350, 2150, 1500, "oak", "+x")                               # above hood
box(0, 1450, 1500, 350, 2150, 2000, "oak", "+x")
box(0, 1430, 920, 480, 1550, 1480, "hood")
# white top cabinets
box(0, 2150, 0, 2400, 2600, 350, "white", "+z", vsplit=(0.25, 0.5, 0.75))
box(0, 2150, 350, 350, 2600, 2000, "white", "+x", vsplit=(0.33, 0.66))

ORDER = {"plinth": 0, "base": 1, "dw": 1, "wm": 1, "panel": 1, "top": 2, "hood": 3, "oak": 3, "white": 4}
for i, b in enumerate(B):
    b["delay"] = ORDER[b["kind"]] * 0.11 + (i % 5) * 0.012


def corners(a, b):
    x0, y0, z0 = a; x1, y1, z1 = b
    return np.array([[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1],
                     [x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]])

EDGES = [(0, 1), (1, 2), (2, 3), (3, 0), (4, 5), (5, 6), (6, 7), (7, 4), (0, 4), (1, 5), (2, 6), (3, 7)]
FACES = [(0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7), (4, 5, 6, 7)]


def front_lines(a, b, front, vsplit, hsplit, kind):
    x0, y0, z0 = a; x1, y1, z1 = b
    L = []
    if front == "+z":
        z = z1
        P = lambda u, v: [x0 + (x1 - x0) * u, y0 + (y1 - y0) * v, z]
    elif front == "+x":
        x = x1
        P = lambda u, v: [x, y0 + (y1 - y0) * v, z0 + (z1 - z0) * u]
    else:
        return L
    for u in vsplit:
        L.append((P(u, 0), P(u, 1)))
    for v in hsplit:
        L.append((P(0, v), P(1, v)))
    if kind in ("base", "oak", "white"):          # handle-less groove / door gap hint
        L.append((P(0.03, 0.97), P(0.97, 0.97)))
    if kind == "dw":
        L.append((P(0, 0.85), P(1, 0.85)))
    if kind == "wm":                               # porthole
        c = np.array(P(0.5, 0.45)); r = (x1 - x0) * 0.3
        ang = np.linspace(0, 2 * np.pi, 33)
        pts = [c + np.array([np.cos(q) * r, np.sin(q) * r, 0]) for q in ang]
        L += [(pts[k], pts[k + 1]) for k in range(32)]
        L.append((P(0, 0.85), P(1, 0.85)))
    return L


def extras():
    """Sink + hob outlines on the worktop."""
    L = []
    def rect(x0, z0, x1, z1, y=911):
        p = [[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]]
        return [(p[k], p[(k + 1) % 4]) for k in range(4)]
    L += rect(1320, 100, 1700, 480)        # sink
    L += rect(80, 950, 540, 1450)          # hob
    for cx, cz in ((200, 1080), (420, 1080), (200, 1320), (420, 1320)):
        ang = np.linspace(0, 2 * np.pi, 17); r = 80
        pts = [[cx + np.cos(q) * r, 912, cz + np.sin(q) * r] for q in ang]
        L += [(pts[k], pts[k + 1]) for k in range(16)]
    return L
EXTRA = extras()

# room shell + floor grid
SHELL = []
for x in range(0, 3601, 600): SHELL.append(([x, 0, 0], [x, 0, 3200]))
for z in range(0, 3201, 600): SHELL.append(([0, 0, z], [3600, 0, z]))
SHELL += [([0, 2600, 0], [3600, 2600, 0]), ([0, 0, 0], [0, 2600, 0]), ([0, 2600, 0], [0, 2600, 3200]),
          ([3600, 0, 0], [3600, 2600, 0])]


class Cam:
    def __init__(self, az, el, dist, target):
        tg = np.array(target, float)
        az, el = np.radians(az), np.radians(el)
        self.pos = tg + dist * np.array([np.cos(el) * np.sin(az), np.sin(el), np.cos(el) * np.cos(az)])
        f = tg - self.pos; f /= np.linalg.norm(f)
        r = np.cross(f, [0, 1, 0]); r /= np.linalg.norm(r)
        self.f, self.r, self.u = f, r, np.cross(r, f)

    def proj(self, P):
        P = np.atleast_2d(np.asarray(P, float)) - self.pos
        zc = np.maximum(P @ self.f, 50)
        return np.stack([W / 2 + F * (P @ self.r) / zc, H / 2 - F * (P @ self.u) / zc], -1)


def seg_pts(cam, p, q, frac=1.0):
    p = np.asarray(p, float); q = np.asarray(q, float)
    q = p + (q - p) * frac
    a, b = cam.proj([p, q])
    return tuple(np.round(a * 16).astype(int)), tuple(np.round(b * 16).astype(int))


def render(t):
    """t in [0,1] over the whole schematic shot."""
    cam = Cam(az=58 - 26 * eio(t), el=30 - 12 * eio(t), dist=6300 - 1900 * eio(t), target=(1150, 1250, 1100))
    lines = np.zeros((H, W), np.uint8)
    fill = np.zeros((H, W, 3), np.float32)

    # shell draws on first
    ps = ease(t / 0.22)
    for i, (p, q) in enumerate(SHELL):
        fr = np.clip(ps * 1.6 - i / len(SHELL) * 0.6, 0, 1)
        if fr > 0:
            a, b = seg_pts(cam, p, q, fr)
            cv2.line(lines, a, b, 70, 1, cv2.LINE_AA, 4)

    mat = ease((t - 0.72) / 0.2)              # material tint fades in at the end
    for bx in B:
        g = ease((t - 0.16 - bx["delay"] * 1.4) / 0.16)
        if g <= 0: continue
        a, b = bx["a"].copy(), bx["b"].copy()
        if bx["kind"] in ("oak", "white", "hood"):     # drop from above
            off = (1 - g) * 700; a[1] += off; b[1] += off
        else:                                          # rise from the floor
            b[1] = a[1] + (b[1] - a[1]) * g
        C = corners(a, b)
        P2 = cam.proj(C)
        # faces
        col = WARM if bx["kind"] == "oak" else COOL
        alpha = 0.07 + 0.10 * mat * (bx["kind"] in ("oak", "top"))
        for fc in FACES:
            poly = np.round(P2[list(fc)] * 16).astype(np.int32)
            layer = np.zeros((H, W), np.uint8)
            cv2.fillPoly(layer, [poly], 255, cv2.LINE_AA, 4)
            fill += (layer[..., None] / 255.0) * col * alpha * g
        for i, j in EDGES:
            cv2.line(lines, tuple(np.round(P2[i] * 16).astype(int)), tuple(np.round(P2[j] * 16).astype(int)),
                     int(255 * g), 2, cv2.LINE_AA, 4)
        if g > 0.9 and bx["front"]:
            k = (g - 0.9) / 0.1
            for p, q in front_lines(a, b, bx["front"], bx["vsplit"], bx["hsplit"], bx["kind"]):
                pa, pb = seg_pts(cam, p, q, k)
                cv2.line(lines, pa, pb, 200, 1, cv2.LINE_AA, 4)
    ex = ease((t - 0.62) / 0.15)
    for p, q in EXTRA:
        if ex > 0:
            pa, pb = seg_pts(cam, p, q, ex)
            cv2.line(lines, pa, pb, 220, 1, cv2.LINE_AA, 4)

    ln = lines.astype(np.float32) / 255
    glow = cv2.GaussianBlur(ln, (0, 0), 6) * 1.5 + cv2.GaussianBlur(ln, (0, 0), 22) * 0.8
    a = np.clip(ln + glow, 0, 1)[..., None]
    yy = np.linspace(0, 1, H)[:, None, None]
    bg = NAVY * (1.15 - 0.35 * yy)                       # subtle gradient
    f = bg + fill * 1.6
    return f * (1 - a) + LINE * a


if __name__ == "__main__":
    import sys
    for k, t in enumerate((0.1, 0.35, 0.6, 1.0)):
        cv2.imwrite(f"sch_{k}.png", cv2.cvtColor(np.clip(render(t), 0, 255).astype(np.uint8), cv2.COLOR_RGB2BGR))
