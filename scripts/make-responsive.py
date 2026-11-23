"""
Smaller copies of the big pictures, for phones.

    python scripts/make-responsive.py

Every picture 1200px or wider under public/images and public/desk gets an
800px-wide WebP next to it (<name>-800w.webp); the desk stills, which a phone
shows a third of a screen wide, also get a 600px one. Pictures under public/images
1500px or wider, or a PNG/JPG wider than 1200px, also get a 1200px WebP: a 3x phone showing a cover ~300px
wide wants ~900px, and without a middle step it took the 1600px original
(often a PNG), four times what a desktop downloads. Existing copies newer than
their source are kept as they are. The list goes to
utils/responsive-images.json, which utils/srcset.ts turns into a srcset, so a
phone stops downloading 1600px covers (Lighthouse measured 400 KB of it on a
single case page). Rerun after adding or replacing a big picture.
"""
import glob
import json
import os

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC = os.path.join(ROOT, 'public')
SOURCES = ['images/*', 'desk/poster-*.webp', 'desk/stops/*.webp']


def main():
    table = {}
    for pat in SOURCES:
        for path in sorted(glob.glob(os.path.join(PUBLIC, pat))):
            name, ext = os.path.splitext(path)
            if ext.lower() not in ('.png', '.jpg', '.jpeg', '.webp') or name.endswith('w') and name.rsplit('-', 1)[-1][:-1].isdigit():
                continue
            im = Image.open(path)
            if im.width < 1200:
                continue
            rel = path.replace(os.sep, '/')
            widths = [800] + ([600] if '/stops/' in rel else []) + ([1200] if '/images/' in rel and (im.width >= 1500 or (im.width > 1200 and ext.lower() != '.webp')) else [])
            widths.sort()
            url = '/' + os.path.relpath(path, PUBLIC).replace(os.sep, '/')
            table[url] = []
            for w in widths:
                out = f'{name}-{w}w.webp'
                h = round(im.height * w / im.width)
                if not (os.path.exists(out) and os.path.getmtime(out) >= os.path.getmtime(path)):
                    im.convert('RGB').resize((w, h), Image.LANCZOS).save(out, 'WEBP', quality=80, method=6)
                table[url].append([w, '/' + os.path.relpath(out, PUBLIC).replace(os.sep, '/')])
            table[url].append([im.width, url])
            print(f'{url}: {", ".join(f"{w}w" for w, _ in table[url])}')
    with open(os.path.join(ROOT, 'utils/responsive-images.json'), 'w', encoding='utf-8') as f:
        json.dump(table, f, indent=1, ensure_ascii=False)
        f.write('\n')


if __name__ == '__main__':
    main()
