"""The page below the 3D desk is the desk top: the same oak, washed out to
the page colour so text on it keeps its contrast.

    python studio/desk/make_page_grain.py

Writes public/images/desk-grain-{day,night}.webp: 1024 px wide, seamless top
to bottom (the bottom rows cross-fade into the top), the grain's mean equal to
the page background at its far end, so text keeps at least the contrast it
has on the flat colour. The source oak does not tile, so it is never repeated sideways: CSS
stretches one tile to the page width and repeats it down the page.
"""
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / 'studio/desk/tex/oak.png'
OUT = ROOT / 'public/images'
W = 1024
OVERLAP = 0.15  # of the height, cross-faded to hide the seam
MOODS = {
    # page --bg from assets/css/tokens.css, how far the grain moves from it,
    # and which way. The grain only ever moves away from the text colour (lighter
    # by day, darker by night), so no word on it has less contrast than on the
    # flat page: --pop-ink is 4.75:1 on the day background with no room to spare.
    'day': ((0xEF, 0xE9, 0xE0), 22, +1),
    'night': ((0x12, 0x14, 0x1C), 13, -1),
}

oak = Image.open(SRC).convert('RGB')
oak = oak.resize((W, round(oak.height * W / oak.width)), Image.LANCZOS)
a = np.asarray(oak).astype(np.float32)
h = a.shape[0]
o = int(h * OVERLAP)
t = np.linspace(0, 1, o, dtype=np.float32)[:, None, None]
seam = a[h - o:] * (1 - t) + a[:o] * t  # bottom rows fading into the top ones
tile = np.concatenate([seam, a[o:h - o]], axis=0)
# luminance-only grain, so the page keeps its own hue
lum = tile @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)
dev = (lum - lum.mean())[..., None]
lo, hi = np.percentile(dev, [2, 99.5])
for mood, (bg, amount, sign) in MOODS.items():
    # 0 at the darkest grain (by day) or the lightest (by night), `amount` levels at the other end
    g = np.clip((dev - lo) / (hi - lo), 0, 1) if sign > 0 else np.clip((hi - dev) / (hi - lo), 0, 1)
    px = np.clip(np.array(bg, dtype=np.float32) + sign * g * amount, 0, 255).astype(np.uint8)
    p = OUT / f'desk-grain-{mood}.webp'
    Image.fromarray(px).save(p, 'WEBP', quality=72, method=6)
    print(p.name, px.shape[1], 'x', px.shape[0], f'{p.stat().st_size // 1024} KB', 'mean', px.reshape(-1, 3).mean(0).round(1), 'min', px.reshape(-1, 3).min(0), 'max', px.reshape(-1, 3).max(0))
