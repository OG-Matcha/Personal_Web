"""Denoise a baked EXR and write it display-ready (AgX, sRGB) as PNG.

    blender -b --factory-startup --python studio/desk/finish_bake.py -- in.exr out.png

The web shows these lightmaps as they are (no tone mapping there), so the
look is decided here, with the same view transform as the Blender previews.

The EXR from build_desk.py's bake holds sRGB-encoded values: the bake
target is a new float image, which Blender tags sRGB, and what Cycles writes
into it comes out encoded. Read as linear (the EXR default) every lightmap was
brighter and flatter than the render - night looked like an overcast day. So
the EXR is tagged sRGB here. Checked 2026-11-17 by re-rendering the shipped
GLB with its atlases from the hero camera: the wall reads 112 against 120 in
the camera render (the rest is specular, which a diffuse bake leaves out),
where it read 173 before.

The atlas then goes through the path a camera render takes: pure emission on
a plane filling an orthographic camera, rendered once, denoised in the
compositor.
"""
import sys

import bpy

src, dst = sys.argv[sys.argv.index('--') + 1:][:2]
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
img = bpy.data.images.load(src)
img.colorspace_settings.name = 'sRGB'
w, h = img.size

# A unit plane, the atlas as emission on it (nearest texel, no filtering).
me = bpy.data.meshes.new('p')
me.from_pydata([(-0.5, -0.5, 0), (0.5, -0.5, 0), (0.5, 0.5, 0), (-0.5, 0.5, 0)], [], [(0, 1, 2, 3)])
uv = me.uv_layers.new(name='uv')
for i, c in enumerate([(0, 0), (1, 0), (1, 1), (0, 1)]):
    uv.data[i].uv = c
plane = bpy.data.objects.new('p', me)
scene.collection.objects.link(plane)
m = bpy.data.materials.new('m')
m.use_nodes = True
nt = m.node_tree
for n in list(nt.nodes):
    nt.nodes.remove(n)
tx = nt.nodes.new('ShaderNodeTexImage')
tx.image = img
tx.interpolation = 'Closest'
em = nt.nodes.new('ShaderNodeEmission')
out = nt.nodes.new('ShaderNodeOutputMaterial')
nt.links.new(tx.outputs['Color'], em.inputs['Color'])
nt.links.new(em.outputs['Emission'], out.inputs['Surface'])
me.materials.append(m)

cam = bpy.data.cameras.new('c')
cam.type = 'ORTHO'
cam.ortho_scale = 1.0
co = bpy.data.objects.new('c', cam)
co.location = (0, 0, 1)
scene.collection.objects.link(co)
scene.camera = co

scene.world = bpy.data.worlds.new('w')
scene.render.engine = 'CYCLES'
scene.cycles.samples = 1
scene.cycles.use_denoising = False
scene.cycles.filter_width = 0.01
scene.cycles.max_bounces = 0
scene.render.resolution_x, scene.render.resolution_y = w, h
scene.render.resolution_percentage = 100
scene.view_settings.view_transform = 'AgX'
scene.view_settings.look = 'AgX - Medium High Contrast'
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_depth = '8'

# Compositor: render -> denoise -> composite.
scene.use_nodes = True
ct = scene.node_tree
for n in list(ct.nodes):
    ct.nodes.remove(n)
rl = ct.nodes.new('CompositorNodeRLayers')
dn = ct.nodes.new('CompositorNodeDenoise')
dn.prefilter = 'ACCURATE'
comp = ct.nodes.new('CompositorNodeComposite')
ct.links.new(rl.outputs['Image'], dn.inputs['Image'])
ct.links.new(dn.outputs['Image'], comp.inputs['Image'])

scene.render.filepath = dst
bpy.ops.render.render(write_still=True)
print('FINISHED', dst, w, h)
