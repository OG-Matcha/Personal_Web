"""Turn finished bakes and previews into what the site loads (public/desk/).

    python studio/desk/ship.py <bake dir>

Expects in <bake dir>: desk_{day,night}.png, room_{day,night}.png (from
finish_bake.py), model/desk.gltf (from build_desk.py --export <dir>/model/desk.gltf) and
poster_{day,night}.png (from build_desk.py --preview).
The desk atlas is shipped at 3072 px: at the closest camera stop a 4096 atlas
is not visibly sharper, and it costs nearly twice the bytes (checked again
2026-11-19: +124 KB for a barely sharper notebook). The room atlas ships at
2048: it holds the shelf and its wood, and it is small (about 40 KB).
"""
import shutil
import sys
from pathlib import Path

from PIL import Image

src = Path(sys.argv[1])
out = Path(__file__).resolve().parents[2] / 'public' / 'desk'
out.mkdir(parents=True, exist_ok=True)

SIZES = {'desk': 3072, 'room': 2048}
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

# The model: desk.gltf plus the .bin and texture files it names, into
# public/desk/model/. Separate files rather than one GLB, and no Draco - see
# export_glb in build_desk.py for why (the site's CSP).
import json
model = out / 'model'
shutil.rmtree(model, ignore_errors=True)
model.mkdir()
gltf = json.loads((src / 'model' / 'desk.gltf').read_text(encoding='utf-8'))
shutil.copy(src / 'model' / 'desk.gltf', model / 'desk.gltf')
for item in gltf.get('buffers', []) + gltf.get('images', []):
    if 'uri' in item:
        shutil.copy(src / 'model' / item['uri'], model / item['uri'])
total = 0
for f in sorted([*out.glob('*.*'), *model.glob('*.*')]):
    total += f.stat().st_size
    print(f'{f.name:24} {f.stat().st_size / 1024:8.0f} KB')
print(f'{"total":24} {total / 1024:8.0f} KB')
