"""The desk, built in Blender from code.

    blender -b --factory-startup --python studio/desk/build_desk.py -- --mood day --preview out.png

Builds the room, the desk and everything on it, lights it for `--mood`
(day: sun through the window; night: the lamp and the screens), and either
renders a preview from the hero camera or saves desk.blend for baking.

Units are metres, Z is up. The desk top is at z = 0.75; the visitor stands
at -Y looking toward the back wall (+Y); the window is in the left wall (-X).

Collections:
  static   everything whose lighting is baked into one atlas
  screens  the three displays; lit by their own picture on the web
  shiny    trophies; real metal/glass on the web, so not baked
"""
import math
import sys
from pathlib import Path

import bmesh
import bpy
from mathutils import Euler, Matrix, Vector

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
TEX = HERE / 'tex'
IMG = ROOT / 'public' / 'images'

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
ARGS = {argv[i].lstrip('-'): argv[i + 1] for i in range(0, len(argv) - 1, 2)}
MOOD = ARGS.get('mood', 'day')

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

COLS = {}
for name in ('static', 'screens', 'shiny', 'lights'):
    c = bpy.data.collections.new(name)
    scene.collection.children.link(c)
    COLS[name] = c


# ---- materials ----------------------------------------------------------

def mat(name, color, rough=0.5, metal=0.0, **kw):
    m = bpy.data.materials.get(name)
    if m:
        return m
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*color, 1)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    if 'transmission' in kw:
        b.inputs['Transmission Weight'].default_value = kw['transmission']
        b.inputs['IOR'].default_value = 1.45
    if 'coat' in kw:
        b.inputs['Coat Weight'].default_value = kw['coat']
    return m


def srgb(h):
    h = h.lstrip('#')
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c)


def img_mat(name, path, rough=0.6, emit=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes['Principled BSDF']
    t = nt.nodes.new('ShaderNodeTexImage')
    t.image = bpy.data.images.load(str(path))
    t.interpolation = 'Cubic'
    nt.links.new(t.outputs['Color'], b.inputs['Base Color'])
    b.inputs['Roughness'].default_value = rough
    if emit:
        nt.links.new(t.outputs['Color'], b.inputs['Emission Color'])
        b.inputs['Emission Strength'].default_value = emit
        b.inputs['Base Color'].default_value = (0, 0, 0, 1)
        nt.links.remove(b.inputs['Base Color'].links[0])
        b.inputs['Roughness'].default_value = 0.15
    return m


def wood_mat():
    m = bpy.data.materials.new('wood')
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes['Principled BSDF']
    oak = TEX / 'oak.png'
    if oak.exists():
        # A photographed-looking oak top (generated, see gen_tex.py), laid on
        # the 'wood' UV layer: metres from the desk centre, grain along X.
        uv = nt.nodes.new('ShaderNodeUVMap')
        uv.uv_map = 'wood'
        tx = nt.nodes.new('ShaderNodeTexImage')
        tx.image = bpy.data.images.load(str(oak))
        tx.extension = 'MIRROR'
        nt.links.new(uv.outputs['UV'], tx.inputs['Vector'])
        nt.links.new(tx.outputs['Color'], b.inputs['Base Color'])
        b.inputs['Roughness'].default_value = 0.48
        b.inputs['Coat Weight'].default_value = 0.1
        return m
    tc = nt.nodes.new('ShaderNodeTexCoord')
    mp = nt.nodes.new('ShaderNodeMapping')
    mp.inputs['Scale'].default_value = (0.35, 9.0, 1.0)
    noise = nt.nodes.new('ShaderNodeTexNoise')
    noise.inputs['Scale'].default_value = 2.0
    noise.inputs['Detail'].default_value = 6.0
    wave = nt.nodes.new('ShaderNodeTexWave')
    wave.wave_type = 'BANDS'
    wave.bands_direction = 'Y'
    wave.inputs['Scale'].default_value = 3.0
    wave.inputs['Distortion'].default_value = 2.2
    wave.inputs['Detail'].default_value = 3.0
    wave.inputs['Detail Roughness'].default_value = 0.4
    ramp = nt.nodes.new('ShaderNodeValToRGB')
    ramp.color_ramp.interpolation = 'EASE'
    ramp.color_ramp.elements[0].position = 0.25
    ramp.color_ramp.elements[0].color = (*srgb('#a87850'), 1)
    ramp.color_ramp.elements[1].position = 0.85
    ramp.color_ramp.elements[1].color = (*srgb('#c99a6c'), 1)
    nt.links.new(tc.outputs['Object'], mp.inputs['Vector'])
    nt.links.new(mp.outputs['Vector'], wave.inputs['Vector'])
    nt.links.new(noise.outputs['Fac'], wave.inputs['Phase Offset'])
    nt.links.new(wave.outputs['Fac'], ramp.inputs['Fac'])
    nt.links.new(ramp.outputs['Color'], b.inputs['Base Color'])
    b.inputs['Roughness'].default_value = 0.5
    b.inputs['Coat Weight'].default_value = 0.12
    return m


M = {
    'wood': wood_mat(),
    'metal_dark': mat('metal_dark', srgb('#2b2d31'), 0.35, 1.0),
    'alu': mat('alu', srgb('#b9bcc2'), 0.28, 1.0),
    'glass_black': mat('glass_black', srgb('#0b0c0e'), 0.08, 0.0, coat=1.0),
    'wall': mat('wall', srgb('#ece6dc'), 0.85),
    'floor': mat('floor', srgb('#6b4f3a'), 0.6),
    'frame': mat('frame', srgb('#f4f1ea'), 0.5),
    # Off-white glaze: the orange one baked flat (no specular on the web) and
    # was the loudest thing in the opening frame.
    'ceramic': mat('ceramic', srgb('#ebe5da'), 0.32, coat=0.6),
    'coffee': mat('coffee', srgb('#2a170c'), 0.15),
    'paper': mat('paper', srgb('#f5f1e8'), 0.9),
    'navy': mat('navy', srgb('#1f2a44'), 0.7),
    'pen': mat('pen', srgb('#16181d'), 0.3, 0.3),
    'lamp': mat('lamp', srgb('#1e1b18'), 0.4, 0.6),
    'terracotta': mat('terracotta', srgb('#b5643c'), 0.8),
    'leaf': mat('leaf', srgb('#6f9a6a'), 0.55),
    'soil': mat('soil', srgb('#3a2a1e'), 1.0),
    'stand': mat('stand', srgb('#d9d4cb'), 0.4, 0.0),
    'felt': img_mat('felt', TEX / 'mat.png', 0.95),
    'gold': mat('gold', srgb('#d4a64a'), 0.22, 1.0),
    'silver': mat('silver', srgb('#c8cbd0'), 0.2, 1.0),
    'crystal': mat('crystal', (0.9, 0.95, 1.0), 0.02, 0.0, transmission=1.0),
    'base_black': mat('base_black', srgb('#18191b'), 0.35),
}


# ---- geometry helpers ---------------------------------------------------

# The shelf bakes with the room. Moved into the desk atlas (2026-11-19) it
# took texels from the notebook, whose thin arrows then vanished; the room
# atlas is baked at 4096 instead, so the shelf stays sharp there.
ROOM = ('floor', 'wall_', 'win_', 'desk_leg', 'desk_rail', 'shelf', 'art')


def link(obj, col):
    COLS[col].objects.link(obj)
    return obj


def group_of(o):
    return 'room' if o.name.startswith(ROOM) else 'desk'


def place(obj, loc=(0, 0, 0), rot=(0, 0, 0), parent=None):
    mw = Matrix.Translation(loc) @ Euler(rot).to_matrix().to_4x4()
    obj.matrix_world = (parent @ mw) if parent is not None else mw
    return obj


def box(name, size, loc=(0, 0, 0), rot=(0, 0, 0), m=None, bevel=0.002, col='static', parent=None):
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=Vector(size), verts=bm.verts)
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    link(o, col)
    if m:
        o.data.materials.append(m)
    if bevel:
        bv = o.modifiers.new('bevel', 'BEVEL')
        bv.width = bevel
        bv.segments = 3
        bv.limit_method = 'ANGLE'
    place(o, loc, rot, parent)
    return o


def wood_uv(o, xy):
    """Planar top-down UVs in metres (1.2 m = one image width), so every wooden part shares one grain scale."""
    me = o.data
    lay = me.uv_layers.new(name='wood')
    for poly in me.polygons:
        # Edges facing front or back take the grain from the front (x, z), so
        # it runs along them instead of smearing into stripes down the edge.
        side = abs(poly.normal.z) < 0.5
        for li in poly.loop_indices:
            co = me.vertices[me.loops[li].vertex_index].co
            v = (co.z * 4.0 + xy[1]) / 1.2 + 0.5 if side else (co.y + xy[1]) / 1.2 + 0.5
            lay.data[li].uv = ((co.x + xy[0]) / 1.2 + 0.5, v)
    return o


def lathe(name, profile, loc=(0, 0, 0), rot=(0, 0, 0), m=None, steps=48, col='static', parent=None):
    """Spin a (radius, z) profile around Z."""
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    verts = [bm.verts.new((r, 0, z)) for r, z in profile]
    edges = [bm.edges.new((verts[i], verts[i + 1])) for i in range(len(verts) - 1)]
    bmesh.ops.spin(bm, geom=verts + edges, cent=(0, 0, 0), axis=(0, 0, 1), angle=math.tau, steps=steps, use_merge=True)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6)
    # A profile that starts and ends on the axis is a closed solid (mug, pot,
    # bulb): make every face point outwards. Spun as is, the mug and the pot
    # came out inside-out and baked nearly black (2026-11-19).
    if profile[0][0] == 0 and profile[-1][0] == 0:
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = True
    o = bpy.data.objects.new(name, me)
    link(o, col)
    if m:
        o.data.materials.append(m)
    place(o, loc, rot, parent)
    return o


def cyl(name, r, h, loc=(0, 0, 0), rot=(0, 0, 0), m=None, col='static', parent=None, bevel=0.0):
    o = lathe(name, [(0, 0), (r - bevel, 0), (r, bevel), (r, h - bevel), (r - bevel, h), (0, h)], loc, rot, m, 40, col, parent)
    # A closed solid: make every face point outwards. Spinning can leave the caps
    # facing in, and the page (single-sided) then skips the top and shows the inside.
    bm = bmesh.new()
    bm.from_mesh(o.data)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(o.data)
    bm.free()
    return o


def rod(name, a, b, r, m, col='static'):
    a, b = Vector(a), Vector(b)
    d = b - a
    o = cyl(name, r, d.length, m=m, col=col)
    rotq = Vector((0, 0, 1)).rotation_difference(d.normalized())
    o.matrix_world = Matrix.Translation(a) @ rotq.to_matrix().to_4x4()
    return o


def plane(name, w, h, loc=(0, 0, 0), rot=(0, 0, 0), m=None, col='static', parent=None, segs=1, zfun=None):
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    uv = bm.loops.layers.uv.new('UVMap')
    grid = []
    for j in range(2):
        row = []
        for i in range(segs + 1):
            u = i / segs
            x = (u - 0.5) * w
            row.append(bm.verts.new((x, (j - 0.5) * h, zfun(x) if zfun else 0)))
        grid.append(row)
    for i in range(segs):
        f = bm.faces.new((grid[0][i], grid[0][i + 1], grid[1][i + 1], grid[1][i]))
        for loop in f.loops:
            co = loop.vert.co
            loop[uv].uv = (co.x / w + 0.5, co.y / h + 0.5)
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    link(o, col)
    if m:
        o.data.materials.append(m)
    place(o, loc, rot, parent)
    return o


def rrect(name, w, h, r, t=0.0, loc=(0, 0, 0), rot=(0, 0, 0), m=None, col='static', parent=None, bevel=0.0, seg=8):
    """Rounded rectangle in local XY, UVs from position (so an image maps edge to edge and the corners
    are simply cut off). With t > 0 it becomes a slab of that thickness centred on z = 0."""
    pts = []
    for cx, cy, a0 in ((w / 2 - r, h / 2 - r, 0), (-w / 2 + r, h / 2 - r, 90), (-w / 2 + r, -h / 2 + r, 180), (w / 2 - r, -h / 2 + r, 270)):
        for k in range(seg + 1):
            a = math.radians(a0 + 90 * k / seg)
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    uv = bm.loops.layers.uv.new('UVMap')
    z0 = -t / 2 if t else 0.0
    f = bm.faces.new([bm.verts.new((x, y, z0)) for x, y in pts])
    if t:
        ext = bmesh.ops.extrude_face_region(bm, geom=[f])
        bmesh.ops.translate(bm, vec=(0, 0, t), verts=[v for v in ext['geom'] if isinstance(v, bmesh.types.BMVert)])
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    for face in bm.faces:
        for loop in face.loops:
            co = loop.vert.co
            loop[uv].uv = (co.x / w + 0.5, co.y / h + 0.5)
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    link(o, col)
    if m:
        o.data.materials.append(m)
    if bevel:
        bv = o.modifiers.new('bevel', 'BEVEL')
        bv.width = bevel
        bv.segments = 3
        bv.limit_method = 'ANGLE'
    place(o, loc, rot, parent)
    return o


def frame(loc, yaw):
    return Matrix.Translation(loc) @ Euler((0, 0, yaw)).to_matrix().to_4x4()


TOP = 0.75

# ---- room ---------------------------------------------------------------

box('floor', (4.0, 3.2, 0.02), (0, -0.4, -0.01), m=M['floor'], bevel=0)
box('wall_back', (4.0, 0.08, 2.8), (0, 0.66, 1.4), m=M['wall'], bevel=0)
# left wall with a window opening (x = -1.25), built from four pieces
WX = -1.25
win_y0, win_y1, win_z0, win_z1 = -0.85, 0.35, 0.95, 2.05
box('wall_left_a', (0.08, 0.66 - win_y1 + 0.04, 2.8), (WX, (0.70 + win_y1) / 2, 1.4), m=M['wall'], bevel=0)
box('wall_left_b', (0.08, win_y0 + 2.0, 2.8), (WX, (win_y0 - 2.0) / 2, 1.4), m=M['wall'], bevel=0)
box('wall_left_c', (0.08, win_y1 - win_y0, win_z0), (WX, (win_y0 + win_y1) / 2, win_z0 / 2), m=M['wall'], bevel=0)
box('wall_left_d', (0.08, win_y1 - win_y0, 2.8 - win_z1), (WX, (win_y0 + win_y1) / 2, (2.8 + win_z1) / 2), m=M['wall'], bevel=0)
for i, (sy, sz, y, z) in enumerate([
    (win_y1 - win_y0 + 0.08, 0.05, (win_y0 + win_y1) / 2, win_z0),
    (win_y1 - win_y0 + 0.08, 0.05, (win_y0 + win_y1) / 2, win_z1),
    (0.05, win_z1 - win_z0 - 0.05, win_y0, (win_z0 + win_z1) / 2),
    (0.05, win_z1 - win_z0 - 0.05, win_y1, (win_z0 + win_z1) / 2),
    (0.035, win_z1 - win_z0 - 0.05, (win_y0 + win_y1) / 2, (win_z0 + win_z1) / 2),
]):
    # Rails full depth, uprights 4 mm shallower: no two faces share a plane, so nothing z-fights.
    box(f'win_frame{i}', (0.10 if i < 2 else 0.096, sy, sz), (WX + 0.01, y, z), m=M['frame'], bevel=0.004)
box('win_sill', (0.22, win_y1 - win_y0 + 0.16, 0.03), (WX + 0.08, (win_y0 + win_y1) / 2, win_z0 - 0.02), m=M['frame'], bevel=0.004)

# ---- desk ---------------------------------------------------------------

wood_uv(box('desk_top', (1.6, 0.75, 0.04), (0, 0, TOP - 0.02), m=M['wood'], bevel=0.006), (0, 0))
for sx in (-1, 1):
    for sy in (-1, 1):
        box(f'desk_leg{sx}{sy}', (0.045, 0.045, TOP - 0.04), (sx * 0.74, sy * 0.31, (TOP - 0.04) / 2), m=M['metal_dark'], bevel=0.004)
    box(f'desk_rail{sx}', (0.03, 0.6, 0.03), (sx * 0.74, 0, 0.12), m=M['metal_dark'], bevel=0.003)
box('desk_mat', (0.9, 0.42, 0.003), (0.02, -0.05, TOP + 0.0015), m=M['felt'], bevel=0.002)

# ---- laptop (Orca) ------------------------------------------------------

LP = frame((0.0, 0.0, TOP + 0.003), math.radians(-6))
box('laptop_base', (0.304, 0.212, 0.014), (0, 0, 0.007), m=M['alu'], bevel=0.004, parent=LP)
plane('laptop_deck', 0.300, 0.208, (0, 0, 0.01405), m=img_mat('deck', TEX / 'keyboard.png', 0.45), parent=LP)
HINGE = LP @ Matrix.Translation((0, 0.106, 0.014)) @ Euler((math.radians(-108), 0, 0)).to_matrix().to_4x4()
box('laptop_lid', (0.304, 0.212, 0.006), (0, -0.106, 0.003), m=M['alu'], bevel=0.003, parent=HINGE)
plane('laptop_bezel', 0.298, 0.206, (0, -0.106, -0.0003), (math.pi, 0, 0), m=M['glass_black'], parent=HINGE)
plane('screen_laptop', 0.284, 0.178, (0, -0.110, -0.0007), (math.pi, 0, 0),
      m=img_mat('scr_laptop', IMG / 'finctory-site.webp', emit=2.2 if MOOD == 'night' else 1.2), col='screens', parent=HINGE)

# ---- phone on a stand (oSave) -------------------------------------------

PH = frame((0.43, -0.06, TOP + 0.003), math.radians(-18))
# The stand slabs stay unbevelled: bevel rims unwrap into islands a few texels wide that go dark in the baked atlas.
rrect('phone_stand_base', 0.08, 0.07, 0.014, 0.008, (0, 0.0, 0.004), m=M['stand'], parent=PH, seg=5)
rrect('phone_stand_back', 0.06, 0.11, 0.012, 0.008, (0, 0.03, 0.05), (math.radians(70), 0, 0), m=M['stand'], parent=PH, seg=5)
box('phone_stand_lip', (0.07, 0.005, 0.01), (0, -0.0105, 0.011), m=M['stand'], bevel=0.0012, parent=PH)
PHB = PH @ Matrix.Translation((0, 0.0, 0.012)) @ Euler((math.radians(70), 0, 0)).to_matrix().to_4x4()
# Rounded like a real phone: ~10 mm corners on the body, glass and screen follow with a thin bezel.
rrect('phone_body', 0.0715, 0.147, 0.0105, 0.008, (0, 0.0735, 0.004), m=M['metal_dark'], bevel=0.0028, parent=PHB)
rrect('phone_glass', 0.0695, 0.145, 0.0098, 0.0, (0, 0.0735, 0.0081), m=M['glass_black'], parent=PHB)
rrect('screen_phone', 0.0655, 0.141, 0.0082, 0.0, (0, 0.0735, 0.0084),
      m=img_mat('scr_phone', TEX / 'phone.png', emit=1.6 if MOOD == 'night' else 1.0), col='screens', parent=PHB)
# side buttons and the camera island on the back
box('phone_btn_power', (0.0016, 0.016, 0.0034), (0.0362, 0.104, 0.004), m=M['metal_dark'], bevel=0.0006, parent=PHB)
box('phone_btn_vol1', (0.0016, 0.011, 0.0034), (-0.0362, 0.112, 0.004), m=M['metal_dark'], bevel=0.0006, parent=PHB)
box('phone_btn_vol2', (0.0016, 0.011, 0.0034), (-0.0362, 0.097, 0.004), m=M['metal_dark'], bevel=0.0006, parent=PHB)
rrect('phone_cam', 0.03, 0.03, 0.007, 0.0016, (-0.0175, 0.1255, -0.0007), m=M['metal_dark'], bevel=0.0006, parent=PHB)

# ---- tablet on a stand (MedaLink) ---------------------------------------

TB = frame((-0.44, 0.05, TOP + 0.003), math.radians(16))
box('tab_stand', (0.16, 0.10, 0.01), (0, 0.02, 0.005), m=M['stand'], bevel=0.003, parent=TB)
box('tab_stand_back', (0.12, 0.01, 0.13), (0, 0.06, 0.06), (math.radians(-28), 0, 0), m=M['stand'], bevel=0.003, parent=TB)
TBB = TB @ Matrix.Translation((0, -0.01, 0.014)) @ Euler((math.radians(64), 0, 0)).to_matrix().to_4x4()
box('tab_body', (0.247, 0.178, 0.006), (0, 0.089, 0.003), m=M['alu'], bevel=0.004, parent=TBB)
plane('tab_glass', 0.245, 0.176, (0, 0.089, 0.0061), m=M['glass_black'], parent=TBB)
plane('screen_tablet', 0.229, 0.160, (0, 0.089, 0.0064),
      m=img_mat('scr_tablet', TEX / 'tablet.png', emit=1.6 if MOOD == 'night' else 1.0), col='screens', parent=TBB)

# ---- mug ----------------------------------------------------------------

MG = frame((0.27, -0.24, TOP + 0.003), 0)
lathe('mug', [(0, 0), (0.036, 0), (0.04, 0.004), (0.041, 0.09), (0.04, 0.095), (0.036, 0.095), (0.035, 0.012), (0, 0.012)], m=M['ceramic'], parent=MG)
lathe('coffee', [(0, 0.075), (0.0355, 0.075), (0, 0.0751)], m=M['coffee'], parent=MG)
me = bpy.data.meshes.new('mug_handle')
bm = bmesh.new()
bmesh.ops.create_cone(bm, cap_ends=True, segments=16, radius1=0.006, radius2=0.006, depth=0.001)
bm.free()
bpy.ops.mesh.primitive_torus_add(major_radius=0.026, minor_radius=0.0065, major_segments=32, minor_segments=12)
h = bpy.context.active_object
h.name = 'mug_handle'
for c in h.users_collection:
    c.objects.unlink(h)
link(h, 'static')
h.data.materials.append(M['ceramic'])
h.matrix_world = MG @ Matrix.Translation((0.045, 0, 0.05)) @ Euler((math.pi / 2, 0, 0)).to_matrix().to_4x4() @ Matrix.Diagonal((0.8, 1, 1, 1))

# ---- lamp ---------------------------------------------------------------

LB = Vector((-0.64, 0.24, TOP))
# 1 mm above the desk: a base flush with the top shares its plane and flickers.
cyl('lamp_base', 0.075, 0.02, tuple(LB + Vector((0, 0, 0.001))), m=M['lamp'], bevel=0.004)
J1 = LB + Vector((0.03, 0.0, 0.36))
HEAD = J1 + Vector((0.30, -0.12, 0.10))
rod('lamp_arm1', LB + Vector((0, 0, 0.02)), J1, 0.009, M['lamp'])
rod('lamp_arm2', J1, HEAD, 0.008, M['lamp'])
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.016, location=J1)
j = bpy.context.active_object
for c in j.users_collection:
    c.objects.unlink(j)
link(j, 'static')
j.data.materials.append(M['lamp'])
aim = (Vector((0.05, -0.12, TOP)) - HEAD).normalized()
rq = Vector((0, 0, -1)).rotation_difference(aim)
shade = lathe('lamp_shade', [(0.012, 0.0), (0.016, -0.01), (0.05, -0.085), (0.048, -0.087), (0.014, -0.012), (0.01, -0.002)], m=M['lamp'])
shade.matrix_world = Matrix.Translation(HEAD) @ rq.to_matrix().to_4x4()
bulb = lathe('lamp_bulb', [(0, -0.03), (0.018, -0.045), (0.02, -0.06), (0, -0.07)], m=None, col='lights')
bulb.matrix_world = shade.matrix_world
bm_on = bpy.data.materials.new('bulb')
bm_on.use_nodes = True
bb = bm_on.node_tree.nodes['Principled BSDF']
bb.inputs['Emission Color'].default_value = (1.0, 0.78, 0.5, 1)
bb.inputs['Emission Strength'].default_value = 40 if MOOD == 'night' else 0
bulb.data.materials.append(bm_on)

# ---- notebook + pen -----------------------------------------------------

NB = frame((-0.2, -0.22, TOP + 0.003), math.radians(8))
box('nb_cover', (0.31, 0.215, 0.004), (0, 0, 0.002), m=M['navy'], bevel=0.0015, parent=NB)
box('nb_pages_l', (0.148, 0.205, 0.006), (-0.075, 0, 0.007), m=M['paper'], bevel=0.0015, parent=NB)
box('nb_pages_r', (0.148, 0.205, 0.006), (0.075, 0, 0.007), m=M['paper'], bevel=0.0015, parent=NB)
plane('nb_spread', 0.296, 0.205, (0, 0, 0.0101), m=img_mat('nb', TEX / 'notebook.png', 0.9), parent=NB, segs=24,
      zfun=lambda x: 0.0035 * math.sin(math.pi * min(abs(x) / 0.148, 1.0)) - 0.0015 * (abs(x) < 0.006))
PEN = NB @ Matrix.Translation((0.17, -0.02, 0.006)) @ Euler((0, math.pi / 2, math.radians(70))).to_matrix().to_4x4()
cyl('pen', 0.0045, 0.14, m=M['pen'], parent=PEN @ Matrix.Translation((0, 0, -0.07)))

# ---- NSTC reports -------------------------------------------------------

RP = frame((0.52, 0.2, TOP + 0.003), math.radians(-8))
for i, (dx, dy, yaw) in enumerate([(0, 0, 0), (0.008, -0.006, 4), (-0.004, 0.005, -3)]):
    z = 0.005 + i * 0.0105
    o = box(f'report{i + 1}', (0.21, 0.297, 0.010), (dx, dy, z), (0, 0, math.radians(yaw)), m=M['paper'], bevel=0.0015, parent=RP)
    plane(f'report{i + 1}_cover', 0.206, 0.293, (dx, dy, z + 0.0051), (0, 0, math.radians(yaw)),
          m=img_mat(f'rep{i + 1}', TEX / f'report{3 - i}.png', 0.7), parent=RP)

# ---- 乖乖, leaning on the reports, guarding the machine ------------------

def pillow(name, w0, d0, H, m):
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    uv = bm.loops.layers.uv.new('UVMap')
    N, R = 28, 36
    rings = []
    for k in range(N + 1):
        t = k / N
        puff = math.sin(math.pi * t) ** 0.55
        crimp = 1.0 if 0.07 < t < 0.93 else 0.0
        d = max(d0 * puff * (0.4 + 0.6 * crimp), 0.0008)
        w = w0 * (0.94 + 0.06 * puff)
        ring = []
        for a in range(R):
            th = math.tau * a / R
            c, s = math.cos(th), math.sin(th)
            x = w / 2 * math.copysign(abs(c) ** 0.35, c)
            y = d / 2 * math.copysign(abs(s) ** 0.8, s)
            ring.append(bm.verts.new((x, y, t * H)))
        rings.append(ring)
    for k in range(N):
        for a in range(R):
            b2 = (a + 1) % R
            f = bm.faces.new((rings[k][a], rings[k][b2], rings[k + 1][b2], rings[k + 1][a]))
            for loop in f.loops:
                co = loop.vert.co
                loop[uv].uv = (co.x / w0 + 0.5, co.z / H)
    bm.faces.new(list(reversed(rings[0])))
    bm.faces.new(rings[-1])
    bm.normal_update()
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = True
    o = bpy.data.objects.new(name, me)
    link(o, 'static')
    o.data.materials.append(m)
    return o


# Proportions of the real bag (0.90 : 1); the texture's alpha cuts out its true outline.
kk = pillow('kuaikuai', 0.14, 0.045, 0.155, img_mat('kk', TEX / 'kuaikuai.png', 0.35))
kk.matrix_world = Matrix.Translation((0.25, 0.13, TOP + 0.003)) @ Euler((math.radians(-14), 0, math.radians(-22))).to_matrix().to_4x4()
# Not baked: in the shared atlas the bag got too few texels and blurred. As a
# 'shiny' object it keeps its own texture and the page lights it like the trophies.
COLS['static'].objects.unlink(kk)
link(kk, 'shiny')

# ---- plant --------------------------------------------------------------

PL = frame((0.68, 0.24, TOP + 0.003), 0)
lathe('pot', [(0, 0), (0.04, 0), (0.05, 0.075), (0.052, 0.08), (0.047, 0.08), (0.043, 0.012), (0, 0.012)], m=M['terracotta'], parent=PL)
lathe('soil', [(0, 0.068), (0.046, 0.068), (0, 0.069)], m=M['soil'], parent=PL)
for i in range(11):
    a = i * 2.4
    tilt = 0.5 + 0.35 * (i % 3) / 2
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1, segments=16, ring_count=10)
    lf = bpy.context.active_object
    lf.name = f'leaf{i}'
    for c in lf.users_collection:
        c.objects.unlink(lf)
    link(lf, 'static')
    lf.data.materials.append(M['leaf'])
    for p in lf.data.polygons:
        p.use_smooth = True
    L = 0.045 - 0.002 * (i % 4)
    lf.matrix_world = PL @ Matrix.Translation((0, 0, 0.072)) @ Euler((0, 0, a)).to_matrix().to_4x4() @ Euler((tilt, 0, 0)).to_matrix().to_4x4() @ Matrix.Translation((0, 0, L)) @ Matrix.Diagonal((0.016, 0.009, L, 1))

# ---- a small photo frame, tucked behind the plant -----------------------
# No stop, no label: the leaves hide most of it from every camera stop, so it
# is there only for whoever looks for it.

PF = frame((0.672, 0.335, TOP + 0.003), math.radians(-12))
box('pf_frame', (0.078, 0.010, 0.100), (0, 0, 0.050), (math.radians(-12), 0, 0), m=M['stand'], bevel=0.002, parent=PF)
box('pf_leg', (0.012, 0.050, 0.004), (0, 0.022, 0.024), (math.radians(-60), 0, 0), m=M['stand'], bevel=0.001, parent=PF)
plane('pf_photo', 0.064, 0.0853, (-0.0, -0.0056, 0.0505), (math.radians(90 - 12), 0, 0),
      m=img_mat('pf', TEX / 'frame_photo.png', 0.5), parent=PF)

# ---- shelf of awards on the back wall -----------------------------------

SZ = 1.22
# No bevel: its rims unwrapped into thin islands that baked as bright and dark
# stripes along the front edge.
wood_uv(box('shelf', (1.0, 0.2, 0.025), (0.05, 0.52, SZ), m=M['wood'], bevel=0), (0.05, 0.52))
for sx in (-0.38, 0.48):
    box(f'shelf_bracket{sx}', (0.02, 0.16, 0.02), (sx, 0.54, SZ - 0.03), m=M['metal_dark'], bevel=0.002)
T0 = SZ + 0.0125


def cup(name, x, m, s=1.0):
    box(f'{name}_base', (0.062 * s, 0.062 * s, 0.032 * s), (x, 0.52, T0 + 0.016 * s), m=M['base_black'], bevel=0.003, col='shiny')
    prof = [(0, 0.032), (0.016, 0.032), (0.007, 0.046), (0.006, 0.085), (0.018, 0.095), (0.036, 0.125), (0.042, 0.166),
            (0.039, 0.168), (0.034, 0.13), (0, 0.13)]
    lathe(name, [(r * s, z * s) for r, z in prof], (x, 0.52, T0), m=m, col='shiny')
    for side in (-1, 1):
        bpy.ops.mesh.primitive_torus_add(major_radius=0.02 * s, minor_radius=0.003 * s, major_segments=24, minor_segments=8)
        t = bpy.context.active_object
        t.name = f'{name}_h{side}'
        for c in t.users_collection:
            c.objects.unlink(t)
        link(t, 'shiny')
        t.data.materials.append(m)
        t.matrix_world = Matrix.Translation((x + side * 0.042 * s, 0.52, T0 + 0.135 * s)) @ Euler((math.pi / 2, 0, 0)).to_matrix().to_4x4()


cup('cup_tsmc', -0.3, M['gold'], 1.15)
cup('cup_mis', -0.12, M['gold'], 1.0)
cup('cup_arena', 0.24, M['silver'], 0.92)
box('crystal_base', (0.07, 0.04, 0.02), (0.06, 0.52, T0 + 0.01), m=M['base_black'], bevel=0.002, col='shiny')
box('crystal', (0.06, 0.022, 0.15), (0.06, 0.52, T0 + 0.095), m=M['crystal'], bevel=0.004, col='shiny')
box('plaque', (0.17, 0.012, 0.22), (0.42, 0.6, T0 + 0.11), (math.radians(-8), 0, 0), m=M['navy'], bevel=0.003)
# The certificate keeps its own texture (not the shared bake atlas, where it
# got only a few dozen texels and blurred). The page dims it with the room at night.
plane('print_cert', 0.1202, 0.17, (0.42, 0.5935, T0 + 0.112), (math.radians(90 - 8), 0, 0),
      m=img_mat('cert', TEX / 'certificate.png', emit=1.0), col='screens')
ART = TEX / 'art.png'
box('art_frame', (0.42, 0.025, 0.54), (-0.52, 0.61, 1.42), m=M['base_black'], bevel=0.003)
# The painting too keeps its own texture: in the room atlas it had a few
# hundred texels and read as a blur at the shelf stop.
plane('print_art', 0.36, 0.48, (-0.52, 0.5965, 1.42), (math.pi / 2, 0, 0),
      m=img_mat('art', ART if ART.exists() else TEX / 'mat.png', emit=1.0), col='screens')

# ---- light --------------------------------------------------------------

world = bpy.data.worlds.new('world')
scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes['Background']

sky = bpy.data.materials.new('sky')
sky.use_nodes = True
sb = sky.node_tree.nodes['Principled BSDF']
sb.inputs['Base Color'].default_value = (0, 0, 0, 1)
sb.inputs['Emission Color'].default_value = (0.72, 0.84, 1.0, 1) if MOOD == 'day' else (0.08, 0.1, 0.2, 1)
sb.inputs['Emission Strength'].default_value = 2.6 if MOOD == 'day' else 0.4
glass = plane('window_glass', win_y1 - win_y0, win_z1 - win_z0, (WX - 0.03, (win_y0 + win_y1) / 2, (win_z0 + win_z1) / 2), (0, math.pi / 2, 0), m=sky, col='lights')
glass.visible_shadow = False

if MOOD == 'day':
    bg.inputs['Color'].default_value = (0.62, 0.7, 0.82, 1)
    # Bright enough that the sunlit wall reads as the site's putty wall (#efe9e0), not an overcast grey.
    bg.inputs['Strength'].default_value = 1.1
    sun = bpy.data.lights.new('sun', 'SUN')
    sun.energy = 5.5
    sun.color = (1.0, 0.9, 0.78)
    sun.angle = math.radians(2.5)
    so = bpy.data.objects.new('sun', sun)
    link(so, 'lights')
    # Low afternoon sun from outside the window, falling across the desk.
    sun_dir = Vector((1.05, 0.62, -0.80))
    so.rotation_euler = sun_dir.to_track_quat('-Z', 'Y').to_euler()
else:
    bg.inputs['Color'].default_value = (0.012, 0.016, 0.032, 1)
    bg.inputs['Strength'].default_value = 0.8
    spot = bpy.data.lights.new('lamp', 'SPOT')
    spot.energy = 48
    spot.color = (1.0, 0.76, 0.5)
    spot.spot_size = math.radians(95)
    spot.spot_blend = 0.75
    spot.shadow_soft_size = 0.03
    lo = bpy.data.objects.new('lamp_light', spot)
    link(lo, 'lights')
    lo.matrix_world = Matrix.Translation(HEAD + aim * 0.05) @ rq.to_matrix().to_4x4()
    fill = bpy.data.lights.new('fill', 'AREA')
    fill.energy = 1.6
    fill.color = (0.55, 0.65, 1.0)
    fill.size = 1.2
    fo = bpy.data.objects.new('fill', fill)
    link(fo, 'lights')
    fo.matrix_world = Matrix.Translation((0.9, -1.4, 2.0)) @ Euler((math.radians(50), 0, math.radians(30))).to_matrix().to_4x4()

# ---- camera + render ----------------------------------------------------

cam = bpy.data.cameras.new('cam')
cam.lens = 32
cam.dof.use_dof = True
cam.dof.aperture_fstop = 4.0
co = bpy.data.objects.new('cam', cam)
scene.collection.objects.link(co)
scene.camera = co
target = Vector((-0.02, 0.12, 0.92))
co.location = Vector((0.78, -1.42, 1.40))
cam.lens = 30
if 'camfrom' in ARGS:  # close-up checks: --camfrom x,y,z --camat x,y,z
    co.location = Vector(map(float, ARGS['camfrom'].split(',')))
    target = Vector(map(float, ARGS['camat'].split(',')))
    cam.lens = float(ARGS.get('lens', 50))
co.rotation_euler = (target - co.location).to_track_quat('-Z', 'Y').to_euler()
cam.dof.focus_distance = (target - co.location).length

scene.render.engine = 'CYCLES'
scene.cycles.device = 'GPU'
prefs = bpy.context.preferences.addons['cycles'].preferences
prefs.compute_device_type = 'OPTIX'
prefs.get_devices()
for dv in prefs.devices:
    dv.use = dv.type == 'OPTIX'
scene.cycles.samples = int(ARGS.get('samples', 96))
scene.cycles.use_denoising = True
scene.view_settings.view_transform = 'AgX'
scene.view_settings.look = 'AgX - Medium High Contrast'
scene.render.resolution_x = 1600
scene.render.resolution_y = 900

WOOD_TEXELS = 1.0


def bake(outdir, size_desk=4096, size_room=4096, samples=256):
    """Join each bake group into one mesh with its own UV atlas and bake diffuse light into it."""
    outdir = Path(outdir)
    outdir.mkdir(parents=True, exist_ok=True)
    scene.cycles.samples = samples
    scene.render.bake.use_pass_direct = True
    scene.render.bake.use_pass_indirect = True
    scene.render.bake.use_pass_color = True
    scene.render.bake.margin = 6
    groups = {'desk': [], 'room': []}
    for o in list(COLS['static'].objects):
        groups[group_of(o)].append(o)
    joined = {}
    for g, objs in groups.items():
        bpy.ops.object.select_all(action='DESELECT')
        for o in objs:
            o.hide_set(False)
            o.select_set(True)
        bpy.context.view_layer.objects.active = objs[0]
        bpy.ops.object.convert(target='MESH')
        bpy.ops.object.join()
        j = bpy.context.view_layer.objects.active
        j.name = f'baked_{g}'
        # Faces nobody can see (undersides of things resting on something)
        # would waste atlas space: drop every downward-facing face on the desk.
        if g == 'desk':
            bm = bmesh.new()
            bm.from_mesh(j.data)
            mw3 = j.matrix_world.to_3x3()
            mw = j.matrix_world
            # Only on and near the desk top: the shelf's underside is in view.
            dead = [f for f in bm.faces if (mw3 @ f.normal).normalized().z < -0.7 and (mw @ f.calc_center_median()).z < TOP + 0.3]
            bmesh.ops.delete(bm, geom=dead, context='FACES')
            bm.to_mesh(j.data)
            bm.free()
        uvs = j.data.uv_layers
        if 'UVMap' not in uvs:
            uvs.new(name='UVMap')
        uvs['UVMap'].active_render = True
        bk = uvs.new(name='bake')
        uvs.active = bk
        bpy.ops.object.mode_set(mode='EDIT')
        bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.uv.smart_project(angle_limit=math.radians(60), island_margin=0.0015, area_weight=0.0, correct_aspect=True)
        if g == 'desk':
            # Room to give the wood more texels than the rest. Tried 1.5x on
            # 2026-11-19: the grain looked the same (its look is oak.png's),
            # while the notebook's handwriting and the report covers blurred.
            wood = [i for i, sl in enumerate(j.material_slots) if sl.material and sl.material.name == 'wood']
            # Edited in place in edit mode: writing a bmesh back with to_mesh
            # reset the active UV layer, and the atlas no longer matched the export.
            bm = bmesh.from_edit_mesh(j.data)
            lay = bm.loops.layers.uv['bake']
            for f in bm.faces:
                for lp in f.loops:
                    if f.material_index in wood:
                        lp[lay].uv *= WOOD_TEXELS
                    # pack_islands moves only selected UVs, and editing them
                    # here drops the selection: the scaled wood was left
                    # unpacked, past the atlas edge (2026-11-19).
                    lp[lay].select = True
                    lp[lay].select_edge = True
            bmesh.update_edit_mesh(j.data)
        bpy.ops.uv.pack_islands(margin=0.0015, rotate=True)
        bpy.ops.object.mode_set(mode='OBJECT')
        lo = min(min(d.uv) for d in j.data.uv_layers['bake'].data)
        hi = max(max(d.uv) for d in j.data.uv_layers['bake'].data)
        print('UV RANGE', g, round(lo, 4), round(hi, 4))
        assert lo >= -1e-4 and hi <= 1 + 1e-4, f'{g}: bake UVs outside the atlas'
        joined[g] = j
    for g, j in joined.items():
        size = size_desk if g == 'desk' else size_room
        img = bpy.data.images.new(f'bake_{g}_{MOOD}', size, size, float_buffer=True)
        for slot in j.material_slots:
            nt = slot.material.node_tree
            n = nt.nodes.get('__bake') or nt.nodes.new('ShaderNodeTexImage')
            n.name = '__bake'
            n.image = img
            nt.nodes.active = n
        bpy.ops.object.select_all(action='DESELECT')
        j.select_set(True)
        bpy.context.view_layer.objects.active = j
        print('BAKE UV', g, j.data.uv_layers.active.name, [l.name for l in j.data.uv_layers])
        bpy.ops.object.bake(type='DIFFUSE')
        raw = outdir / f'{g}_{MOOD}_raw.exr'
        img.filepath_raw = str(raw)
        img.file_format = 'OPEN_EXR'
        img.save()
        print('BAKED', g, raw)
    return joined


def export_glb(joined, path):
    """One GLB: the two baked meshes (bake UV only), the screens, the shiny things, the lamp bulb and window."""
    for g, j in joined.items():
        uvs = j.data.uv_layers
        # Keep only the atlas UVs. The joined mesh inherits every UV layer its
        # parts had; left in, the exporter writes whichever is flagged for
        # render as TEXCOORD_0, and the page samples the atlas in the wrong place.
        print('UV LAYERS', g, [l.name for l in uvs])
        for name in [l.name for l in uvs if l.name != 'bake']:
            uvs.remove(uvs[name])
        uvs['bake'].active = True
        uvs['bake'].active_render = True
        j.data.materials.clear()
        j.data.materials.append(bpy.data.materials.new(f'baked_{g}'))
    bpy.ops.object.select_all(action='DESELECT')
    for c in ('screens', 'shiny', 'lights'):
        for o in COLS[c].objects:
            if o.type == 'MESH':
                o.select_set(True)
    for j in joined.values():
        j.select_set(True)
    # Plain glTF with its textures as separate files, and no Draco. The live
    # site's Content-Security-Policy (set at Cloudflare) allows only 'self':
    # a GLB's embedded images load through blob: URLs and Draco decodes in a
    # blob: worker with WebAssembly - all three are refused there, and the
    # page sat at 100% with no model.
    sep = str(path).endswith('.gltf')
    bpy.ops.export_scene.gltf(filepath=str(path), use_selection=True, export_format='GLTF_SEPARATE' if sep else 'GLB', export_apply=True,
                              export_draco_mesh_compression_enable=ARGS.get('draco', '0') == '1', export_draco_mesh_compression_level=7,
                              export_image_format='WEBP', export_materials='EXPORT', export_yup=True)
    print('EXPORTED', path)


if 'bake' in ARGS:
    j = bake(ARGS['bake'], samples=int(ARGS.get('samples', 256)))
    if 'export' in ARGS:
        export_glb(j, ARGS['export'])

if 'preview' in ARGS:
    scene.render.filepath = ARGS['preview']
    bpy.ops.render.render(write_still=True)
    print('PREVIEW', ARGS['preview'])
if 'save' in ARGS:
    bpy.ops.wm.save_as_mainfile(filepath=ARGS['save'])
    print('SAVED', ARGS['save'])
