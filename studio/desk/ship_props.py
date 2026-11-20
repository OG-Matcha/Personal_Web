"""Cut-outs from render_props.py, ready for the page.

    python studio/desk/ship_props.py <dir render_props wrote>

For each prop: soften its shadow (the page is paper, not the lit desk), trim to
what is left visible, and scale every prop by one ratio so a mug stays smaller
than a plant. Writes public/images/desk-prop-<name>.webp with alpha and prints
the size each one ships at.

Then rewrites components/pages/desk-props.json from every desk-prop-*.webp:
the size each shows at (half its pixels, sharp on a 2x screen) and a short
hash of its bytes. The page puts the hash in the image's URL, so a re-render
reaches readers at once instead of after their cached copy expires.
"""
import hashlib
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SRC = Path(sys.argv[1])
OUT = ROOT / 'public/images'
PX_PER_M = 2600  # 0.1 m of desk is 260 px of image; shown at half size, retina-sharp
SHADOW = 0.55    # shadow opacity kept
HAZE = 0.12      # shadow alpha below this is dropped

for png in sorted(SRC.glob('*.png')):
    meta = json.loads(png.with_suffix('.json').read_text())
    im = np.asarray(Image.open(png).convert('RGBA')).astype(np.float32)
    a = im[..., 3] / 255
    # The shadow catcher gives the shadow as partial alpha over black; the
    # thing itself is opaque. Thin out only the shadow.
    lum = im[..., :3].max(-1) / 255
    # Dark but opaque pixels (coffee, the bag's print) are the thing, not shadow.
    # Below HAZE is the sky's faint glow under everything, which would show as a
    # grey disc with a square edge; the cast shadow itself is far darker.
    sh = (a < 0.985) & (lum < 0.08)
    a = np.where(sh, np.clip((a - HAZE) / (1 - HAZE), 0, 1) * SHADOW, a)
    a[a < 3 / 255] = 0
    im[..., 3] = a * 255
    ys, xs = np.nonzero(a)
    im = im[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    out = Image.fromarray(im.round().astype(np.uint8), 'RGBA')
    scale = PX_PER_M * meta['metres'] / Image.open(png).width
    out = out.resize((round(out.width * scale), round(out.height * scale)), Image.LANCZOS)
    p = OUT / f'desk-prop-{png.stem}.webp'
    out.save(p, 'WEBP', quality=82, method=6)
    print(p.name, f'{out.width}x{out.height}', f'{p.stat().st_size // 1024} KB')

sizes = {}
for p in sorted(OUT.glob('desk-prop-*.webp')):
    im = Image.open(p)
    sizes[p.stem.removeprefix('desk-prop-')] = {
        'w': round(im.width / 2),
        'h': round(im.height / 2),
        'v': hashlib.sha1(p.read_bytes()).hexdigest()[:8],
    }
(ROOT / 'components/pages/desk-props.json').write_text(json.dumps(sizes, indent=2) + chr(10))
print('desk-props.json', ', '.join(f"{k} {v['w']}x{v['h']} {v['v']}" for k, v in sizes.items()))
