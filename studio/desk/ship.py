"""Turn finished bakes and previews into what the site loads (public/desk/).

    python studio/desk/ship.py <bake dir>

Expects in <bake dir>: desk_{day,night}.png, room_{day,night}.png (from
finish_bake.py), desk.glb (from build_desk.py --export) and
poster_{day,night}.png (from build_desk.py --preview).
The desk atlas is shipped at 3072 px: at the closest camera stop a 4096 atlas
is not visibly sharper, and it costs nearly twice the bytes.
"""
import shutil
import sys
from pathlib import Path

from PIL import Image

src = Path(sys.argv[1])
out = Path(__file__).resolve().parents[2] / 'public' / 'desk'
out.mkdir(parents=True, exist_ok=True)

SIZES = {'desk': 3072, 'room': 1536}
for g, size in SIZES.items():
    for mood in ('day', 'night'):
        im = Image.open(src / f'{g}_{mood}.png').convert('RGB')
        if im.width != size:
            im = im.resize((size, size), Image.LANCZOS)
        im.save(out / f'{g}_{mood}.webp', 'WEBP', quality=84, method=6)

for mood in ('day', 'night'):
    p = src / f'poster_{mood}.png'
    if p.exists():
        Image.open(p).convert('RGB').save(out / f'poster-{mood}.webp', 'WEBP', quality=80, method=6)

shutil.copy(src / 'desk.glb', out / 'desk.glb')
total = 0
for f in sorted(out.glob('*.*')):
    total += f.stat().st_size
    print(f'{f.name:24} {f.stat().st_size / 1024:8.0f} KB')
print(f'{"total":24} {total / 1024:8.0f} KB')
