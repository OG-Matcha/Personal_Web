"""
Build the site's Chinese webfont: Noto Sans TC cut down to the characters the
site actually uses.

    python scripts/subset-cjk.py [path/to/NotoSansTC-VF.ttf]

The Google Fonts slicing it replaces split the font into ~100 unicode-range
files per weight. A page with 900 distinct characters pulled 25 of them,
1.7 MB, and every slice that arrived re-laid the whole page: 4 s of style and
layout on a mid-range phone. One variable file holding only the characters in
content/ and the components is a single request and a single reflow.

That one file still went to every page: the English pages show about 25
Chinese characters (the name, a few labels) and paid 294 kB for them. So
those few are a file of their own (notosanstc-0, 8 kB; the list is
scripts/cjk-groups.txt) and everything else is notosanstc-1. English pages
fetch only the first; Chinese pages fetch both, together, once.
(Splitting the Chinese set further, homepage vs the rest, was measured and
dropped: a reader going from the homepage to the resume then paid another
133 kB and a reflow mid-navigation.) If an English page ever shows a
character missing from cjk-groups.txt it fetches notosanstc-1 too; nothing
renders wrong.

Needs fontTools + brotli (`pip install fonttools brotli`). The source is the
variable Noto Sans TC (OFL); Windows ships it as C:/Windows/Fonts/NotoSansTC-VF.ttf.
Writes public/fonts/notosanstc-{0,1}.woff2, public/fonts/cjk.css and cjk-chars.txt
(line 1: characters in the font; line 2: used but not in Noto Sans TC).
Run it again after adding text with new characters; `npm run check:fonts`
lists any that are missing.
"""
import glob
import os
import sys

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = sys.argv[1] if len(sys.argv) > 1 else 'C:/Windows/Fonts/NotoSansTC-VF.ttf'
SOURCES = [
    'content/**/*', 'components/**/*.vue', 'pages/**/*.vue', 'layouts/**/*.vue',
    'composables/**/*.ts', 'utils/**/*', 'scripts/covers/*.html', 'app.vue', 'error.vue', 'nuxt.config.ts',
]
# Punctuation and symbols an editor may type later, so a new sentence rarely
# needs a rebuild: full-width marks, brackets, quotes.
EXTRA = '，。、；：？！「」『』（）《》〈〉…—～・　＋－×÷％／＠＃＆＊０１２３４５６７８９'


def site_chars():
    chars = set(EXTRA)
    for pat in SOURCES:
        for f in glob.glob(os.path.join(ROOT, pat), recursive=True):
            if not os.path.isfile(f):
                continue
            try:
                text = open(f, encoding='utf-8').read()
            except (UnicodeDecodeError, OSError):
                continue
            chars |= {c for c in text if ord(c) > 0x2E7F}
    return chars


def ranges(chars):
    """U+4E2D, U+4E3A-4E3C, ...: runs of consecutive code points merged."""
    cps = sorted(ord(c) for c in chars)
    out, i = [], 0
    while i < len(cps):
        j = i
        while j + 1 < len(cps) and cps[j + 1] == cps[j] + 1:
            j += 1
        out.append(f'U+{cps[i]:X}' if i == j else f'U+{cps[i]:X}-{cps[j]:X}')
        i = j + 1
    return ', '.join(out)


def main():
    font = TTFont(SRC)
    cmap = font.getBestCmap()
    used = site_chars()
    chars = sorted(c for c in used if ord(c) in cmap)
    # Characters the font itself lacks (a regex range end like U+9FFF, a
    # variation selector) are recorded so check-fonts.mjs does not flag them.
    absent = sorted(c for c in used if ord(c) not in cmap)
    opts = subset.Options()
    opts.flavor = 'woff2'
    # No OpenType layout: shaping 900 CJK glyphs through Noto's GSUB/GPOS
    # tables was most of a phone's layout time (measured: 5.7 s -> 3.7 s of
    # layout at 4x CPU slowdown on the homepage). Chinese body text needs none
    # of it here; Latin runs are set in Archivo first.
    opts.layout_features = []
    opts.drop_tables += ['GSUB', 'GPOS', 'GDEF']
    opts.name_IDs = ['*']
    opts.hinting = False
    opts.desubroutinize = True
    core = set(open(os.path.join(ROOT, 'scripts/cjk-groups.txt'), encoding='utf-8').read().split('\n')[0])
    groups = [[c for c in chars if c in core], [c for c in chars if c not in core]]
    old = os.path.join(ROOT, 'public/fonts/notosanstc-sub.woff2')
    if os.path.exists(old):
        os.remove(old)
    css = [
        '/* Noto Sans TC, only the characters the site uses (scripts/subset-cjk.py),\n'
        '   in two files: what the English pages show too, and the rest. Each covers weights 400 to 900. Characters\n'
        '   missing from both fall through to PingFang TC / Microsoft JhengHei. */\n'
    ]
    for i, g in enumerate(groups):
        font = TTFont(SRC)
        sub = subset.Subsetter(opts)
        sub.populate(unicodes=[ord(c) for c in g])
        sub.subset(font)
        # The site sets 400 for body copy and 600-900 for headings: drop 100-300.
        font = instancer.instantiateVariableFont(font, {'wght': (400, 900)})
        out = os.path.join(ROOT, f'public/fonts/notosanstc-{i}.woff2')
        font.flavor = 'woff2'
        font.save(out)
        print(f'  {i}: {len(g)} characters, {os.path.getsize(out) // 1024} KB')
        css.append(
            "@font-face {\n  font-family: 'Noto Sans TC';\n  font-style: normal;\n  font-weight: 400 900;\n"
            f"  font-display: swap;\n  src: url(/fonts/notosanstc-{i}.woff2) format('woff2');\n"
            f"  unicode-range: {ranges(g)};\n}}\n"
        )
    open(os.path.join(ROOT, 'public/fonts/cjk.css'), 'w', encoding='utf-8').write(''.join(css))
    with open(os.path.join(ROOT, 'public/fonts/cjk-chars.txt'), 'w', encoding='utf-8') as f:
        f.write(''.join(chars) + '\n' + ''.join(absent) + '\n')
    print(f'{len(chars)} characters in 2 files -> public/fonts/notosanstc-*.woff2')


if __name__ == '__main__':
    main()
