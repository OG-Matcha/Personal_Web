"""Generate the desk's painted textures with Qwen-Image on the GPU box.

Runs ON the box (ComfyUI at 127.0.0.1:8188):
    ~/deskgen/comfy-venv/bin/python gen_tex.py <outdir>

Makes:
  oak.png  - a seamless top-down oak plank texture for the desk top and shelf
  art.png  - the framed print on the wall: an abstract, quiet landscape
Qwen-Image-Edit-2511 (Apache-2.0) used for plain text-to-image (no input
picture), with its 8-step Lightning LoRA. It is the model already on the box;
the plain Qwen-Image download stalled on 2026-11-17.
"""
import json
import sys
import time
import urllib.request
from pathlib import Path

OUT = Path(sys.argv[1])
OUT.mkdir(parents=True, exist_ok=True)
API = 'http://127.0.0.1:8188'

JOBS = {
    'oak': dict(
        w=1328, h=1328, seed=41,
        pos='Top-down orthographic photo of a solid white oak tabletop, natural matte oil finish, straight fine grain running '
            'vertically, subtle ray flecks, warm honey colour, even soft lighting, no shadows, no objects, seamless wood texture, '
            'high detail, photographic material scan',
        neg='objects, knots cluster, perspective, vignette, text, watermark, dark edges, glossy reflection, planks gaps',
    ),
    'art': dict(
        w=1104, h=1472, seed=7,
        pos='A minimalist abstract landscape print: soft layered hills in sage green and warm terracotta under a pale putty sky, '
            'a small low sun, risograph texture, generous empty space, calm, modern Scandinavian art print, flat colour, paper grain',
        neg='text, signature, watermark, frame, people, photo, busy, neon, gradient banding',
    ),
}


def graph(j):
    return {
        '1': {'class_type': 'UNETLoader', 'inputs': {'unet_name': 'qwen_image_edit_2511_bf16.safetensors', 'weight_dtype': 'default'}},
        '2': {'class_type': 'LoraLoaderModelOnly', 'inputs': {'model': ['1', 0], 'lora_name': 'Qwen-Image-Edit-2511-Lightning-8steps-V1.0-bf16.safetensors', 'strength_model': 1.0}},
        '12': {'class_type': 'ModelSamplingAuraFlow', 'inputs': {'model': ['2', 0], 'shift': 3.1}},
        '3': {'class_type': 'CFGNorm', 'inputs': {'model': ['12', 0], 'strength': 1.0}},
        '4': {'class_type': 'CLIPLoader', 'inputs': {'clip_name': CLIP, 'type': 'qwen_image'}},
        '5': {'class_type': 'VAELoader', 'inputs': {'vae_name': VAE}},
        '6': {'class_type': 'TextEncodeQwenImageEditPlus', 'inputs': {'clip': ['4', 0], 'vae': ['5', 0], 'prompt': j['pos']}},
        '7': {'class_type': 'TextEncodeQwenImageEditPlus', 'inputs': {'clip': ['4', 0], 'vae': ['5', 0], 'prompt': ''}},
        '8': {'class_type': 'EmptySD3LatentImage', 'inputs': {'width': j['w'], 'height': j['h'], 'batch_size': 1}},
        '9': {'class_type': 'KSampler', 'inputs': {'model': ['3', 0], 'positive': ['6', 0], 'negative': ['7', 0], 'latent_image': ['8', 0],
                                                    'seed': j['seed'], 'steps': 8, 'cfg': 1.0, 'sampler_name': 'euler', 'scheduler': 'simple', 'denoise': 1.0}},
        '10': {'class_type': 'VAEDecode', 'inputs': {'samples': ['9', 0], 'vae': ['5', 0]}},
        '11': {'class_type': 'SaveImage', 'inputs': {'images': ['10', 0], 'filename_prefix': f'desk/{j["name"]}'}},
    }


def post(path, body=None):
    req = urllib.request.Request(API + path, data=json.dumps(body).encode() if body else None, headers={'Content-Type': 'application/json'})
    return json.load(urllib.request.urlopen(req))


models = Path.home() / 'deskgen/ComfyUI/models'
CLIP = next(p.name for p in (models / 'text_encoders').iterdir() if 'qwen_2.5_vl' in p.name)
VAE = next(p.name for p in (models / 'vae').iterdir() if 'qwen_image_vae' in p.name)

for name, j in JOBS.items():
    j['name'] = name
    pid = post('/prompt', {'prompt': graph(j)})['prompt_id']
    while True:
        h = post(f'/history/{pid}')
        if pid in h:
            break
        time.sleep(2)
    st = h[pid].get('status', {})
    if st.get('status_str') == 'error':
        print(name, 'ERROR', json.dumps(st)[:600])
        continue
    img = h[pid]['outputs']['11']['images'][0]
    src = Path.home() / 'deskgen/ComfyUI/output' / img['subfolder'] / img['filename']
    (OUT / f'{name}.png').write_bytes(src.read_bytes())
    print(name, 'OK', OUT / f'{name}.png')
