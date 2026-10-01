# -*- coding: utf-8 -*-
"""
Generates thumbnail cards for Slide 3 Layer 2:
- thumb_states.png
- thumb_bloch.png
- thumb_circuit.png
- thumb_particle.png
- thumb_algorithm.png
"""

import math
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import os

ASSETS_DIR = r"c:\Users\sushm\OneDrive\Desktop\e green quanta\slide_assets"
W, H = 200, 120

# 1. 2D/3D Quantum States
im = Image.new("RGBA", (W, H), (10, 16, 32, 255))
d = ImageDraw.Draw(im)
cx, cy = W // 2, H // 2
for r in range(45, 5, -5):
    d.ellipse([cx - r, cy - int(r*0.6), cx + r, cy + int(r*0.6)], outline=(6, 182, 212, int(200*(r/45))), width=2)
for r in range(35, 5, -6):
    d.ellipse([cx - int(r*0.5), cy - r, cx + int(r*0.5), cy + r], outline=(167, 139, 250, 180), width=1)
im.save(os.path.join(ASSETS_DIR, "thumb_states.png"))

# 2. Bloch Sphere
im = Image.new("RGBA", (W, H), (10, 16, 32, 255))
d = ImageDraw.Draw(im)
cx, cy = W // 2, H // 2
r = 42
d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(70, 90, 130, 200), width=2)
d.ellipse([cx - r, cy - int(r*0.35), cx + r, cy + int(r*0.35)], outline=(34, 211, 238, 160), width=1)
d.line([cx, cy - r - 6, cx, cy + r + 6], fill=(124, 58, 237, 220), width=2) # z-axis
# State vector arrow
d.line([cx, cy, cx + int(r*0.7), cy - int(r*0.7)], fill=(244, 63, 94, 255), width=3)
d.ellipse([cx + int(r*0.7) - 4, cy - int(r*0.7) - 4, cx + int(r*0.7) + 4, cy - int(r*0.7) + 4], fill=(244, 63, 94, 255))
im.save(os.path.join(ASSETS_DIR, "thumb_bloch.png"))

# 3. Quantum Circuit
im = Image.new("RGBA", (W, H), (10, 16, 32, 255))
d = ImageDraw.Draw(im)
# wires
d.line([20, 40, 180, 40], fill=(100, 116, 139, 255), width=2)
d.line([20, 80, 180, 80], fill=(100, 116, 139, 255), width=2)
# Gate H on wire 1
d.rectangle([45, 26, 75, 54], fill=(16, 185, 129, 255), outline=(52, 211, 153, 255))
# Gate X on wire 2
d.rectangle([95, 66, 125, 94], fill=(6, 182, 212, 255), outline=(34, 211, 238, 255))
# CNOT control dot and target
d.ellipse([145 - 5, 40 - 5, 145 + 5, 40 + 5], fill=(245, 158, 11, 255))
d.line([145, 40, 145, 80], fill=(245, 158, 11, 255), width=2)
d.ellipse([145 - 9, 80 - 9, 145 + 9, 80 + 9], outline=(245, 158, 11, 255), width=2)
im.save(os.path.join(ASSETS_DIR, "thumb_circuit.png"))

# 4. Particle Motion (Interference waves)
im = Image.new("RGBA", (W, H), (10, 16, 32, 255))
d = ImageDraw.Draw(im)
for x in range(15, 185, 2):
    y1 = int(60 + 25 * math.sin(x * 0.08))
    y2 = int(60 + 18 * math.cos(x * 0.06))
    d.point([x, y1], fill=(34, 211, 238, 255))
    d.point([x, y2], fill=(167, 139, 250, 255))
    if x % 8 == 0:
        d.ellipse([x - 2, y1 - 2, x + 2, y1 + 2], fill=(34, 211, 238, 200))
im.save(os.path.join(ASSETS_DIR, "thumb_particle.png"))

# 5. Algorithm Animations (Histogram bars)
im = Image.new("RGBA", (W, H), (10, 16, 32, 255))
d = ImageDraw.Draw(im)
d.line([25, 100, 175, 100], fill=(100, 116, 139, 255), width=2) # baseline
bars = [15, 22, 18, 85, 20, 14, 25] # Grover target peak at index 3
for i, h in enumerate(bars):
    bx = 35 + i * 20
    col = (6, 182, 212, 255) if h > 50 else (124, 58, 237, 200)
    d.rectangle([bx, 100 - h, bx + 12, 100], fill=col)
im.save(os.path.join(ASSETS_DIR, "thumb_algorithm.png"))

print("All 5 Layer 2 thumbnail cards generated successfully.")
