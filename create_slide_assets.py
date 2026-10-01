# -*- coding: utf-8 -*-
"""
Generates high-resolution graphical assets matching the reference presentation:
1. quantum_sphere.png (Glowing 3D wireframe quantum sphere for Slide 2 bottom banner)
2. atom_glow.png (Futuristic glowing atom icon)
3. Layer thumbnail previews for Slide 3 (Bloch sphere, Circuit, Particle, State)
"""

import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ASSETS_DIR = r"c:\Users\sushm\OneDrive\Desktop\e green quanta\slide_assets"
import os
os.makedirs(ASSETS_DIR, exist_ok=True)

# 1. Quantum Wireframe Sphere for Slide 2
def create_quantum_sphere():
    size = (600, 300)
    im = Image.new("RGBA", size, (11, 19, 43, 0))
    draw = ImageDraw.Draw(im)
    
    cx, cy = 420, 150
    radius = 110
    
    # Outer glow circles
    for r in range(radius + 20, radius - 1, -4):
        alpha = int(35 * (1.0 - (r - radius) / 20.0)) if r > radius else 50
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(6, 182, 212, alpha), width=2)
        
    # Longitudinal and latitudinal wireframe lines
    for angle in range(0, 180, 20):
        rad = math.radians(angle)
        # horizontal ellipse
        rx = radius
        ry = int(radius * math.cos(rad))
        if ry > 0:
            draw.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], outline=(34, 211, 238, 140), width=1)
            
    for angle in range(0, 180, 20):
        rad = math.radians(angle)
        # vertical ellipse
        rx = int(radius * math.cos(rad))
        ry = radius
        if rx > 0:
            draw.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], outline=(124, 58, 237, 140), width=1)
            
    # Glowing dots on the sphere
    np.random.seed(42)
    for _ in range(60):
        theta = np.random.uniform(0, 2 * math.pi)
        phi = np.random.uniform(0, math.pi)
        px = int(cx + radius * math.sin(phi) * math.cos(theta))
        py = int(cy + radius * math.sin(phi) * math.sin(theta) * 0.5 + radius * math.cos(phi) * 0.4)
        col = (34, 211, 238, 220) if np.random.rand() > 0.4 else (167, 139, 250, 220)
        draw.ellipse([px - 2, py - 2, px + 2, py + 2], fill=col)
        
    out_path = os.path.join(ASSETS_DIR, "quantum_sphere.png")
    im.save(out_path, "PNG")
    print(f"Created {out_path}")

# 2. Glowing Atom Icon for Slide 2
def create_atom_glow():
    size = (200, 200)
    im = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)
    cx, cy = 100, 100
    
    # Nucleus
    draw.ellipse([cx - 16, cy - 16, cx + 16, cy + 16], fill=(34, 211, 238, 255))
    draw.ellipse([cx - 8, cy - 8, cx + 8, cy + 8], fill=(255, 255, 255, 255))
    
    # 3 Orbital Rings
    for rot in [0, 60, 120]:
        rad = math.radians(rot)
        ring = Image.new("RGBA", size, (0, 0, 0, 0))
        d_ring = ImageDraw.Draw(ring)
        # Draw ellipse
        d_ring.ellipse([cx - 75, cy - 25, cx + 75, cy + 25], outline=(124, 58, 237, 200), width=3)
        d_ring.ellipse([cx - 75, cy - 25, cx + 75, cy + 25], outline=(34, 211, 238, 120), width=1)
        # Rotate ring
        ring_rot = ring.rotate(rot, resample=Image.BICUBIC, center=(cx, cy))
        im = Image.alpha_composite(im, ring_rot)
        
    out_path = os.path.join(ASSETS_DIR, "atom_glow.png")
    im.save(out_path, "PNG")
    print(f"Created {out_path}")

create_quantum_sphere()
create_atom_glow()
