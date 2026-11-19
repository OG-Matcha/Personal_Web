"""Top-down cut-outs of things on the desk, for the page below the 3D walk.

    blender -b --python studio/desk/build_desk.py --python studio/desk/render_props.py -- --mood day --props <outdir>

Runs after build_desk.py in the same Blender session, so each thing is the
very model the 3D desk shows, lit by the same afternoon sun. For each prop:
everything else is hidden, a wide plane at the desk's height catches the shadow, and an
orthographic camera looks straight down. The result is a transparent PNG that
keeps the prop's real shadow, plus <name>.json with the metres the frame spans;
studio/desk/ship_props.py trims and converts them. `--dry 1` writes only the JSON.
"""
import json
import math
import sys
from pathlib import Path

import bpy
from mathutils import Euler, Matrix, Vector

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
ARGS = {argv[i].lstrip('-'): argv[i + 1] for i in range(0, len(argv) - 1, 2)}
OUT = Path(ARGS['props'])
OUT.mkdir(parents=True, exist_ok=True)
TOP = 0.75
SIZE = int(ARGS.get('size', 1024))

# name prefixes of the objects that make up each prop
PROPS = {
    'mug': ('mug', 'coffee'),
    'plant': ('pot', 'soil', 'leaf'),
    'kuaikuai': ('kuaikuai',),
}

scene = bpy.context.scene
desk = bpy.data.objects['desk_top']

# The bag leans on the reports in the room; on the page it lies flat, face up.
kk = bpy.data.objects['kuaikuai']
loc = kk.matrix_world.translation.copy()
kk.matrix_world = Matrix.Translation((loc.x, loc.y, TOP + 0.03)) @ Euler((-math.pi / 2, 0, math.radians(-18))).to_matrix().to_4x4()

cam = bpy.data.cameras.new('top')
cam.type = 'ORTHO'
cam.dof.use_dof = False
co = bpy.data.objects.new('top', cam)
scene.collection.objects.link(co)
scene.camera = co

scene.render.film_transparent = True
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.render.resolution_x = SIZE
scene.render.resolution_y = SIZE
scene.cycles.samples = int(ARGS.get('samples', 160))
# The plant stands near the desk's edge and its shadow would fall off it; a
# wide plane at the desk's height catches the whole shadow instead.
bpy.ops.mesh.primitive_plane_add(size=20, location=(0, 0, TOP + 0.0005))
catcher = bpy.context.active_object
catcher.name = 'shadow_catcher'
catcher.is_shadow_catcher = True
desk.hide_render = True


def parts(prefixes):
    return [o for o in bpy.data.objects if o.type == 'MESH' and o.name.startswith(prefixes)]


ONLY = ARGS.get('only')
for name, prefixes in PROPS.items():
    if ONLY and name != ONLY:
        continue
    keep = set(parts(prefixes))
    for o in bpy.data.objects:
        if o.type == 'MESH':
            o.hide_render = not (o in keep or o == catcher)
    pts = [o.matrix_world @ Vector(c) for o in keep for c in o.bound_box]
    lo = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
    hi = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    mid = (lo + hi) / 2
    # Room for the whole shadow: the low sun throws it up and to the right,
    # several times the thing's own size, and a clipped shadow shows a hard edge.
    # The shadow's length follows the thing's height, so the frame does too.
    span = max(hi.x - lo.x, hi.y - lo.y)
    tall = hi.z - TOP
    cam.ortho_scale = span * 2 + tall * 6
    co.location = (mid.x + tall * 1.6, mid.y + tall * 1.4, TOP + 1.5)
    co.rotation_euler = (0, 0, 0)
    scene.render.filepath = str(OUT / f'{name}.png')
    # metres across the frame, so ship_props.py can draw every prop at one scale
    (OUT / f'{name}.json').write_text(json.dumps({'metres': cam.ortho_scale}))
    if 'dry' not in ARGS:
        bpy.ops.render.render(write_still=True)
    print('PROP', name, scene.render.filepath)
