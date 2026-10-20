#!/usr/bin/env python3
"""Build the page's images from the paper workspace.

Usage: build_images.py [SRC_ROOT] [FONT_DIR]
SRC_ROOT defaults to ../icra2027_paper next to this repository. Outputs go to assets/img and a
manifest with the final pixel sizes is written to tools/manifest.json.
"""
import json
import os
import sys

from PIL import Image, ImageDraw, ImageFont

Image.MAX_IMAGE_PIXELS = None
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SRC = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else os.path.join(ROOT, "..", "icra2027_paper")
FONTS = os.path.abspath(sys.argv[2]) if len(sys.argv) > 2 else None
OUT = os.path.join(ROOT, "assets", "img")
os.makedirs(OUT, exist_ok=True)

# name: (source, crop box or None, output widths, webp quality)
JOBS = {
    "hero": ("images/260904_invivo_robot_rollout_wideview2.png", (0, 200, 5238, 2819), (2400, 1600, 1000), 80),
    "fig1-overview": ("arxiv/figures/fig_hero.jpg", None, (2400, 1200), 84),
    "fig2-logger": ("arxiv/figures/fig_hardware.jpg", None, (1380, 700), 86),
    "fig3-latency": ("arxiv/figures/fig_latency.png", None, (1380, 700), 90),
    "fig4-pipeline": ("arxiv/figures/fig_pipeline.png", None, (1600, 800), 90),
    "fig5-io": ("arxiv/figures/fig_io.jpg", None, (2400, 1200), 86),
    "fig6-selection": ("arxiv/figures/fig_exvivo_hero_C.png", None, (2400, 1200), 88),
    "fig7-invivo": ("arxiv/figures/fig_invivo.jpg", None, (2400, 1200), 84),
    "photo-instrument": ("accompanying_videos/media/surgilogger_whole_laparoscopic_instruement.jpg", (0, 1040, 4000, 2640), (2000, 1000), 82),
    "photo-logger": ("accompanying_videos/media/surgilogger_with_housing.jpg", (300, 300, 3700, 2700), (1600, 800), 82),
    "photo-sim-compare": ("images/Simulation_real_sim_comparison.png", None, (2400, 1200), 82),
    "photo-sim-robot": ("images/Simulation_with_robot.png", None, (2400, 1200), 82),
    "photo-exvivo-rig": ("images/260712_exvivo_robot_rollout.png", None, (1600, 800), 82),
}

manifest = {}
for name, (rel, box, widths, q) in JOBS.items():
    im = Image.open(os.path.join(SRC, rel))
    if im.mode != "RGB":
        im = im.convert("RGB")
    if box:
        im = im.crop(box)
    entry = {"source": rel, "variants": []}
    for w in widths:
        if w >= im.width:
            v = im.copy()
        else:
            v = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
        fn = f"{name}-{v.width}.webp"
        v.save(os.path.join(OUT, fn), "WEBP", quality=q, method=6)
        entry["variants"].append({"file": fn, "w": v.width, "h": v.height, "bytes": os.path.getsize(os.path.join(OUT, fn))})
    manifest[name] = entry
    print(name, [(x["w"], x["h"], x["bytes"] // 1024) for x in entry["variants"]])

# Social preview card, 1200 x 630
src = Image.open(os.path.join(SRC, "images/260904_invivo_robot_rollout_wideview2.png")).convert("RGB")
card = src.crop((0, 120, 5238, 2870)).resize((1200, 630), Image.LANCZOS)
# darken the lower half for the title
grad = Image.new("L", (1, 630))
for y in range(630):
    t = max(0.0, (y - 140) / 490)
    grad.putpixel((0, y), int(248 * (t ** 1.25)))
grad = grad.resize((1200, 630))
card = Image.composite(Image.new("RGB", (1200, 630), (8, 13, 20)), card, grad)
d = ImageDraw.Draw(card)

def font(name, size):
    if FONTS:
        p = os.path.join(FONTS, name)
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    for fb in ("/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"):
        if os.path.exists(fb):
            return ImageFont.truetype(fb, size)
    return ImageFont.load_default()

f_title = font("IBMPlexSerif-SemiBold.ttf", 46)
f_sub = font("IBMPlexMono-Regular.ttf", 21)
f_small = font("IBMPlexMono-Regular.ttf", 19)
lines = ["From Instrument-Mounted Demonstrations", "to In-Vivo Execution"]
y = 318
for ln in lines:
    d.text((56, y), ln, font=f_title, fill=(255, 255, 255))
    y += 56
d.text((58, y + 14), "Learning bimanual laparoscopic appendectomy", font=f_sub, fill=(214, 222, 234))
d.text((58, y + 44), "without robot-collected demonstrations", font=f_sub, fill=(214, 222, 234))
d.text((58, 578), "arXiv 2609.25625  ·  Rosota Intelligence Institute  ·  Seoul National University Hospital", font=f_small, fill=(164, 176, 194))
card.save(os.path.join(OUT, "og-card.jpg"), "JPEG", quality=88, optimize=True, progressive=True)
manifest["og-card"] = {"file": "og-card.jpg", "w": 1200, "h": 630, "bytes": os.path.getsize(os.path.join(OUT, "og-card.jpg"))}

with open(os.path.join(HERE, "manifest.json"), "w") as f:
    json.dump(manifest, f, indent=1)
print("og-card", manifest["og-card"])

# Institution logos (trimmed, lossless); sources live in the slides workspace next to this repository.
LOGOS = {
    "logo-rosota": os.path.join(ROOT, "..", "slides", "rosota_general_introduction", "deck_src", "assets", "logo_rosota.png"),
    "logo-snuh-dtm": os.path.join(ROOT, "..", "slides", "rosota_general_introduction", "deck_src", "assets", "snuh_dtm_logo.png"),
}
for name, path in LOGOS.items():
    if not os.path.exists(path):
        print("logo source missing:", path)
        continue
    im = Image.open(path).convert("RGBA")
    im = im.crop(im.getchannel("A").getbbox())
    im.save(os.path.join(OUT, f"{name}.webp"), "WEBP", lossless=True, method=6)
    print(name, im.size)
