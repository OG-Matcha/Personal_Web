"""Flat textures for the desk scene, drawn with Pillow.

Run:  python studio/desk/make_textures.py
Writes studio/desk/tex/*.png, which build_desk.py maps onto the models.
Everything written on these is true and on the site already (timeline.yml,
about copy); nothing here is invented.
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = Path(__file__).parent
OUT = HERE / 'tex'
OUT.mkdir(exist_ok=True)
FONTS = Path('C:/Windows/Fonts')
SANS = str(FONTS / 'msjhbd.ttc') if (FONTS / 'msjhbd.ttc').exists() else str(FONTS / 'msjh.ttc')
SANS_R = str(FONTS / 'msjh.ttc')
KAI = str(FONTS / 'kaiu.ttf')


def font(path, size):
    return ImageFont.truetype(path, size)


def keyboard():
    """Laptop deck: a dark key grid and a trackpad, 2048 x 1428 (the base's 304 x 212 mm)."""
    W, H = 2048, 1428
    im = Image.new('RGB', (W, H), (150, 152, 157))
    d = ImageDraw.Draw(im)
    # Keyboard well
    kx0, ky0, kx1, ky1 = 150, 110, W - 150, 760
    d.rounded_rectangle((kx0, ky0, kx1, ky1), 24, fill=(120, 122, 127))
    rows = [14, 14, 14, 13, 12]
    gap = 14
    kh = (ky1 - ky0 - gap * 7) / 6
    y = ky0 + gap
    # function row (short)
    n = 14
    kw = (kx1 - kx0 - gap * (n + 1)) / n
    for i in range(n):
        x = kx0 + gap + i * (kw + gap)
        d.rounded_rectangle((x, y, x + kw, y + kh * 0.6), 10, fill=(28, 29, 32))
    y += kh * 0.6 + gap
    for r, n in enumerate(rows):
        kw = (kx1 - kx0 - gap * (n + 1)) / n
        for i in range(n):
            x = kx0 + gap + i * (kw + gap)
            d.rounded_rectangle((x, y, x + kw, y + kh), 12, fill=(28, 29, 32))
        y += kh + gap
    # space row
    xs = kx0 + gap
    widths = [1, 1, 1.2, 5.8, 1.2, 1, 1]
    unit = (kx1 - kx0 - gap * (len(widths) + 1)) / sum(widths)
    for w in widths:
        d.rounded_rectangle((xs, y, xs + unit * w, y + kh), 12, fill=(28, 29, 32))
        xs += unit * w + gap
    # Trackpad
    tw, th = 820, 520
    tx = (W - tw) / 2
    d.rounded_rectangle((tx, 840, tx + tw, 840 + th), 36, fill=(140, 142, 147), outline=(128, 130, 135), width=4)
    im = im.filter(ImageFilter.GaussianBlur(0.6))
    im.save(OUT / 'keyboard.png')


def notebook():
    """Two facing pages, 2 x 1024 x 1450: today's list on the left, a doodle on the right.
    Few words, written large, so they read from the camera stop."""
    W, H = 2048, 1450
    im = Image.new('RGB', (W, H), (247, 243, 233))
    d = ImageDraw.Draw(im)
    for y in range(150, H - 60, 64):
        d.line((60, y, W / 2 - 50, y), fill=(206, 216, 230), width=3)
        d.line((W / 2 + 50, y, W - 60, y), fill=(206, 216, 230), width=3)
    d.line((W / 2, 0, W / 2, H), fill=(214, 206, 190), width=6)
    ink = (30, 44, 84)
    pop = (194, 65, 12)
    green = (30, 140, 60)
    big = font(KAI, 120)
    k = font(KAI, 92)
    ks = font(KAI, 70)

    # ---- left page: today's list --------------------------------------
    d.text((90, 40), '今天', font=big, fill=pop)
    d.line((90, 182, 330, 174), fill=pop, width=8)

    def box(x, y, done):
        d.rounded_rectangle((x, y, x + 62, y + 62), 8, outline=ink, width=6)
        if done:
            d.line((x + 10, y + 30, x + 28, y + 52), fill=green, width=10)
            d.line((x + 28, y + 52, x + 74, y - 8), fill=green, width=10)

    rows = [
        ('咖啡', True, False),
        ('補一包綠色乖乖', True, False),
        ('週五不上線', False, False),
        ('睡覺', False, True),
    ]
    y = 250
    for text, done, struck in rows:
        box(100, y + 18, done)
        d.text((200, y), text, font=k, fill=ink)
        if struck:
            w = d.textlength(text, font=k)
            d.line((190, y + 58, 210 + w, y + 50), fill=pop, width=8)
            d.text((230 + w, y + 14), '（下週）', font=ks, fill=pop)
        y += 192

    # ---- right page: a doodle and a tally ------------------------------
    x0 = W // 2 + 90
    d.text((x0, 40), 'bug 計數', font=k, fill=ink)
    d.text((x0, 170), '正正正一', font=big, fill=pop)
    d.text((x0 + 520, 200), '← 本週', font=ks, fill=ink)

    # a little flow, boxes and arrows, the way it gets drawn on a napkin
    def node(cx, cy, label):
        w = d.textlength(label, font=ks) + 60
        d.rounded_rectangle((cx - w / 2, cy - 62, cx + w / 2, cy + 62), 26, outline=ink, width=6)
        d.text((cx - w / 2 + 30, cy - 42), label, font=ks, fill=ink)
        return w

    def arrow(x1, x2, y):
        d.line((x1, y, x2, y), fill=ink, width=6)
        d.polygon([(x2, y), (x2 - 26, y - 16), (x2 - 26, y + 16)], fill=ink)

    cy = 560
    node(x0 + 120, cy, '問題')
    arrow(x0 + 215, x0 + 330, cy)
    node(x0 + 440, cy, 'AI')
    arrow(x0 + 520, x0 + 640, cy)
    node(x0 + 760, cy, '答案')
    # the branch everyone forgets
    d.line((x0 + 440, cy + 62, x0 + 440, cy + 210), fill=pop, width=6)
    d.polygon([(x0 + 440, cy + 230), (x0 + 424, cy + 204), (x0 + 456, cy + 204)], fill=pop)
    d.text((x0 + 300, cy + 240), '答不出來？', font=ks, fill=pop)
    d.text((x0 + 300, cy + 330), '→ 找真人', font=ks, fill=pop)

    d.text((x0, 1240), 'it works on my machine', font=font(KAI, 64), fill=(120, 120, 130))
    im.save(OUT / 'notebook.png')


def report(i, title, year, band):
    """A bound report cover, 1024 x 1448 (A4)."""
    W, H = 1024, 1448
    im = Image.new('RGB', (W, H), (250, 250, 247))
    d = ImageDraw.Draw(im)
    d.rectangle((0, 0, W, 300), fill=band)
    d.text((70, 90), '國家科學及技術委員會', font=font(SANS, 48), fill=(255, 255, 255))
    d.text((70, 170), f'{year} 年度大專學生研究計畫', font=font(SANS_R, 40), fill=(255, 255, 255))
    y = 420
    line = ''
    f = font(SANS, 62)
    for ch in title:
        if d.textlength(line + ch, font=f) > W - 140:
            d.text((70, y), line, font=f, fill=(30, 30, 34))
            y += 92
            line = ''
        line += ch
    d.text((70, y), line, font=f, fill=(30, 30, 34))
    d.text((70, H - 260), '國立中央大學 資訊管理學系', font=font(SANS_R, 38), fill=(80, 80, 86))
    d.text((70, H - 200), '計畫執行：黃鉅燊', font=font(SANS_R, 38), fill=(80, 80, 86))
    im.save(OUT / f'report{i}.png')


def kuaikuai():
    """The green bag engineers leave on machines so they keep working. Our own drawing, 1024 x 1400."""
    W, H = 1024, 1400
    im = Image.new('RGB', (W, H), (24, 140, 62))
    d = ImageDraw.Draw(im)
    # crimped seal bands, top and bottom
    for y0 in (0, H - 90):
        d.rectangle((0, y0, W, y0 + 90), fill=(18, 112, 48))
        for x in range(0, W, 22):
            d.line((x, y0, x, y0 + 90), fill=(14, 96, 40), width=6)
    # yellow burst behind the name
    d.ellipse((90, 300, W - 90, 900), fill=(255, 214, 10))
    name = font(SANS, 330)
    tw = d.textlength('乖乖', font=name)
    for dx, dy in ((-8, 0), (8, 0), (0, -8), (0, 8), (-6, -6), (6, 6), (-6, 6), (6, -6)):
        d.text(((W - tw) / 2 + dx, 400 + dy), '乖乖', font=name, fill=(200, 24, 32))
    d.text(((W - tw) / 2, 400), '乖乖', font=name, fill=(255, 255, 255))
    sub = font(SANS, 84)
    t = '椰子口味'
    d.text(((W - d.textlength(t, font=sub)) / 2, 980), t, font=sub, fill=(255, 255, 255))
    small = font(SANS_R, 44)
    t = '機器乖乖 · 不當機'
    d.text(((W - d.textlength(t, font=small)) / 2, 1120), t, font=small, fill=(220, 245, 225))
    im.save(OUT / 'kuaikuai.png')


def paper_label():
    """The desk mat: dark felt with a faint grid."""
    W, H = 1024, 512
    im = Image.new('RGB', (W, H), (52, 58, 66))
    d = ImageDraw.Draw(im)
    for x in range(0, W, 32):
        d.line((x, 0, x, H), fill=(58, 64, 72), width=1)
    for y in range(0, H, 32):
        d.line((0, y, W, y), fill=(58, 64, 72), width=1)
    im.save(OUT / 'mat.png')


def certificate():
    """The plaque on the shelf: a gold-edged certificate, 640 x 840."""
    W, H = 640, 840
    im = Image.new('RGB', (W, H), (246, 240, 222))
    d = ImageDraw.Draw(im)
    d.rectangle((18, 18, W - 18, H - 18), outline=(184, 140, 60), width=10)
    d.rectangle((40, 40, W - 40, H - 40), outline=(184, 140, 60), width=3)
    d.text(((W - d.textlength('獎狀', font=font(SANS, 110))) / 2, 110), '獎狀', font=font(SANS, 110), fill=(140, 30, 30))
    for i, t in enumerate(['第六屆台積電校園黑客松', 'AI 維運懶人包組', '第一名']):
        f = font(SANS, 52 if i < 2 else 80)
        d.text(((W - d.textlength(t, font=f)) / 2, 330 + i * 90 + (20 if i == 2 else 0)), t, font=f, fill=(40, 34, 30))
    d.ellipse((W / 2 - 60, 640, W / 2 + 60, 760), fill=(196, 40, 40))
    im.save(OUT / 'certificate.png')


keyboard()
# certificate() is retired: tex/certificate.png is now the real 2025 TSMC IT CareerHack certificate (see SOURCES.md).
notebook()
report(1, '基於生成式 AI 的個人化財務健康管理系統開發與效益評估', 114, (31, 78, 140))
report(2, '探討生成式 AI 於社交工程之發展應用', 113, (122, 38, 46))
report(3, '結合股市異常現象指標及生成式 AI 之股票追蹤系統', 113, (38, 96, 72))
# kuaikuai() is retired: tex/kuaikuai.png is now a photo of the real bag (see SOURCES.md).
paper_label()
print('textures:', sorted(p.name for p in OUT.iterdir()))
