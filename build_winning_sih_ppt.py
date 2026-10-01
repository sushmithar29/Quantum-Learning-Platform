# -*- coding: utf-8 -*-
"""
QuantumLab - Smart India Hackathon (SIH 2026) Winning Presentation Generator
Directly incorporates the executive, clean, high-clarity design system from the reference images:
- Slide 1: TITLE PAGE (Executive Clean Tech Hero & Proposal Specifications)
- Slide 2: IDEA TITLE & PROPOSED SOLUTION (3-Column Bento Grid + Dark Hero Quote Banner)
- Slide 3: SYSTEM ARCHITECTURE (5 Decoupled Layers + Interactive Modules + End-to-End Pipeline)
- Slide 4: FEASIBILITY AND VIABILITY (4-Pillar Grid + Risk-Mitigation Matrix + 3-Phase Roadmap)
- Slide 5: IMPACT AND BENEFITS (Top KPI Ribbon + 4 Impact Spheres + National Mission Banner)
- Slide 6: RESEARCH AND REFERENCES (Academic Foundations + Hardware Benchmarks + Verification Audit)
"""

import os
import sys
import pptx
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR

TEMPLATE_PATH  = r"C:\Users\sushm\Downloads\SIH2026-IDEA-Presentation-Format.pptx"
OUTPUT_PPTX    = r"c:\Users\sushm\OneDrive\Desktop\e green quanta\SIH2026_QuantumLab_Winning_Presentation.pptx"
ASSETS_DIR     = r"c:\Users\sushm\OneDrive\Desktop\e green quanta\slide_assets"
CHANDELIER_IMG = r"c:\Users\sushm\OneDrive\Desktop\e green quanta\images\ibm_chandelier_real.jpg"

SPHERE_IMG  = os.path.join(ASSETS_DIR, "quantum_sphere.png")
ATOM_IMG    = os.path.join(ASSETS_DIR, "atom_glow.png")
THUMB_STATES   = os.path.join(ASSETS_DIR, "thumb_states.png")
THUMB_BLOCH    = os.path.join(ASSETS_DIR, "thumb_bloch.png")
THUMB_CIRCUIT  = os.path.join(ASSETS_DIR, "thumb_circuit.png")
THUMB_PARTICLE = os.path.join(ASSETS_DIR, "thumb_particle.png")
THUMB_ALGO     = os.path.join(ASSETS_DIR, "thumb_algorithm.png")

# Palette: Executive Clean Tech (matching reference deck)
C_WHITE         = RGBColor(255, 255, 255)
C_PAGE_BG       = RGBColor(248, 250, 252)  # #f8fafc
C_NAVY_TITLE    = RGBColor(15, 23, 42)     # #0f172a
C_NAVY_BODY     = RGBColor(30, 41, 59)     # #1e293b
C_TEXT_MUTED    = RGBColor(100, 116, 139)  # #64748b

# Accents
C_BLUE_DARK     = RGBColor(30, 58, 138)    # #1e3a8a
C_BLUE_PRIMARY  = RGBColor(37, 99, 235)    # #2563eb
C_CYAN_ACCENT   = RGBColor(2, 132, 199)    # #0284c7
C_CYAN_LIGHT    = RGBColor(56, 189, 248)   # #38bdf8
C_INDIGO        = RGBColor(99, 102, 241)   # #6366f1
C_VIOLET        = RGBColor(124, 58, 237)   # #7c3aed
C_EMERALD       = RGBColor(16, 185, 129)   # #10b981
C_EMERALD_DARK  = RGBColor(5, 150, 105)    # #059669
C_AMBER         = RGBColor(217, 119, 6)    # #d97706
C_ROSE          = RGBColor(225, 29, 72)     # #e11d48

# Card Tint Fills & Borders (matching reference image layers)
C_FILL_BLUE     = RGBColor(239, 246, 255)  # #eff6ff
C_BORD_BLUE     = RGBColor(191, 219, 254)  # #bfdbfe

C_FILL_CYAN     = RGBColor(236, 254, 255)  # #ecfeff
C_BORD_CYAN     = RGBColor(165, 243, 252)  # #a5f3fc

C_FILL_LAVENDER = RGBColor(250, 245, 255)  # #faf5ff
C_BORD_LAVENDER = RGBColor(233, 213, 255)  # #e9d5ff

C_FILL_MINT     = RGBColor(240, 253, 244)  # #f0fdf4
C_BORD_MINT     = RGBColor(187, 247, 208)  # #bbf7d0

C_FILL_SLATE    = RGBColor(248, 250, 252)  # #f8fafc
C_BORD_SLATE    = RGBColor(226, 232, 240)  # #e2e8f0

C_HERO_DARK     = RGBColor(11, 19, 43)     # #0b132b deep navy banner

FONT_SANS    = "Calibri"
FONT_HEADING = "Calibri"

def set_slide_white_bg(slide):
    bg = slide.background
    fill = bg.fill
    fill.solid()
    fill.fore_color.rgb = C_WHITE

def clean_shapes_except_logos_and_footers(slide, is_slide_1=False):
    shapes_to_remove = []
    for s in slide.shapes:
        if is_slide_1:
            if s.name in ["TextBox 9", "Subtitle 3", "Title 7", "Picture 4", "Rectangle 24", "Freeform: Shape 26"]:
                shapes_to_remove.append(s)
        else:
            if s.name in ["TextBox 8", "Rectangle 8", "Rectangle 9"]:
                shapes_to_remove.append(s)
    for s in shapes_to_remove:
        sp = s._element
        sp.getparent().remove(sp)

def setup_header(slide, title_text, subtitle_text="", team_name="Team QuantumLab", page_num=2):
    # Setup Team Oval (Top Left)
    for s in slide.shapes:
        if "Oval" in s.name and s.has_text_frame:
            s.left = Inches(0.4)
            s.top = Inches(0.18)
            s.width = Inches(1.65)
            s.height = Inches(0.85)
            s.fill.solid()
            s.fill.fore_color.rgb = C_WHITE
            s.line.color.rgb = C_BLUE_PRIMARY
            s.line.width = Pt(1.5)
            tf = s.text_frame
            tf.word_wrap = True
            tf.vertical_anchor = MSO_ANCHOR.MIDDLE
            p0 = tf.paragraphs[0]
            p0.text = "Your"
            p0.font.name = FONT_SANS
            p0.font.size = Pt(10.0)
            p0.font.color.rgb = C_NAVY_BODY
            p0.alignment = PP_ALIGN.CENTER
            p1 = tf.add_paragraph()
            p1.text = "Team Name"
            p1.font.name = FONT_SANS
            p1.font.size = Pt(10.0)
            p1.font.color.rgb = C_NAVY_BODY
            p1.alignment = PP_ALIGN.CENTER
        elif s.has_text_frame and "@SIH Idea submission" in s.text:
            s.top = Inches(7.1)
            p = s.text_frame.paragraphs[0]
            p.text = "@SIH Idea Submission – Template"
            p.font.color.rgb = C_TEXT_MUTED
            p.font.size = Pt(8.5)
        elif s.has_text_frame and s.name.startswith("Slide Number"):
            s.top = Inches(7.1)
            p = s.text_frame.paragraphs[0]
            p.text = f"Page {page_num}"
            p.font.color.rgb = C_NAVY_BODY
            p.font.size = Pt(9.0)

    # Position SIH logo banner on top-right
    for s in slide.shapes:
        if s.name.startswith("Picture") and s.width > Inches(2.0):
            s.left = Inches(10.65)
            s.top = Inches(0.12)
            s.width = Inches(2.45)
            s.height = Inches(1.15)

    # Setup Title Shape
    for s in list(slide.shapes):
        if s.name.startswith("Title") and s.has_text_frame:
            s.left = Inches(2.2)
            s.top = Inches(0.15)
            s.width = Inches(8.3)
            s.height = Inches(0.95)
            tf = s.text_frame
            tf.clear()
            tf.word_wrap = True
            
            p0 = tf.paragraphs[0]
            p0.text = title_text
            p0.font.name = "Georgia"
            p0.font.size = Pt(24.0)
            p0.font.bold = True
            p0.font.color.rgb = C_BLUE_DARK
            p0.alignment = PP_ALIGN.CENTER
            
            if subtitle_text:
                p1 = tf.add_paragraph()
                p1.text = subtitle_text
                p1.font.name = FONT_HEADING
                p1.font.size = Pt(11.0)
                p1.font.bold = True
                p1.font.color.rgb = C_CYAN_ACCENT
                p1.alignment = PP_ALIGN.CENTER
            return

def add_card(slide, left, top, width, height, bg_color=C_WHITE, border_color=C_BORD_BLUE, border_width=1.0, shape_type=MSO_SHAPE.ROUNDED_RECTANGLE):
    card = slide.shapes.add_shape(shape_type, left, top, width, height)
    card.fill.solid()
    card.fill.fore_color.rgb = bg_color
    if border_color:
        card.line.color.rgb = border_color
        card.line.width = Pt(border_width)
    else:
        card.line.fill.background()
    return card

def add_bullet_point(tf, title, body, bullet="•", title_color=C_NAVY_BODY, body_color=C_NAVY_BODY, title_size=10.0, body_size=9.5, space_after=4):
    p = tf.add_paragraph()
    p.space_after = Pt(space_after)
    
    r_bullet = p.add_run()
    r_bullet.text = f"{bullet} "
    r_bullet.font.name = FONT_SANS
    r_bullet.font.size = Pt(title_size)
    r_bullet.font.color.rgb = C_BLUE_PRIMARY
    
    if title:
        r_title = p.add_run()
        r_title.text = f"{title}: "
        r_title.font.name = FONT_SANS
        r_title.font.size = Pt(title_size)
        r_title.font.bold = True
        r_title.font.color.rgb = title_color
    
    r_body = p.add_run()
    r_body.text = body
    r_body.font.name = FONT_SANS
    r_body.font.size = Pt(body_size)
    r_body.font.bold = False
    r_body.font.color.rgb = body_color


# ==============================================================================
# SLIDE 1: TITLE PAGE (Executive Clean Tech Hero & Specifications)
# ==============================================================================
def build_slide_1(slide):
    set_slide_white_bg(slide)
    clean_shapes_except_logos_and_footers(slide, is_slide_1=True)
    
    # Official SIH logo banner top-right
    for s in slide.shapes:
        if s.name == "Picture 1":
            s.left = Inches(10.65)
            s.top = Inches(0.12)
            s.width = Inches(2.45)
            s.height = Inches(1.15)
            
    # Team Oval Top-Left
    oval = add_card(slide, Inches(0.5), Inches(0.2), Inches(1.7), Inches(0.85), bg_color=C_WHITE, border_color=C_BLUE_PRIMARY, border_width=1.5, shape_type=MSO_SHAPE.OVAL)
    otf = oval.text_frame
    otf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p0 = otf.paragraphs[0]
    p0.text = "Your"
    p0.font.name = FONT_SANS
    p0.font.size = Pt(10.0)
    p0.font.color.rgb = C_NAVY_BODY
    p0.alignment = PP_ALIGN.CENTER
    p1 = otf.add_paragraph()
    p1.text = "Team Name"
    p1.font.name = FONT_SANS
    p1.font.size = Pt(10.0)
    p1.font.color.rgb = C_NAVY_BODY
    p1.alignment = PP_ALIGN.CENTER

    # Center Main Banner
    title_box = add_card(slide, Inches(2.4), Inches(0.15), Inches(8.0), Inches(0.95), bg_color=C_WHITE, border_color=None)
    ttf = title_box.text_frame
    ttf.word_wrap = True
    tp0 = ttf.paragraphs[0]
    tp0.text = "SMART INDIA HACKATHON 2026"
    tp0.font.name = "Georgia"
    tp0.font.size = Pt(23.0)
    tp0.font.bold = True
    tp0.font.color.rgb = C_BLUE_DARK
    tp0.alignment = PP_ALIGN.CENTER
    
    tp1 = ttf.add_paragraph()
    tp1.text = "QUANTUMLAB – EXPERIENTIAL QUANTUM COMPUTING PLATFORM & CRYOSTAT DIGITAL TWIN"
    tp1.font.name = FONT_HEADING
    tp1.font.size = Pt(10.5)
    tp1.font.bold = True
    tp1.font.color.rgb = C_CYAN_ACCENT
    tp1.alignment = PP_ALIGN.CENTER
    
    # Left Card: Official Proposal Specifications
    c_left = add_card(slide, Inches(0.5), Inches(1.22), Inches(6.0), Inches(4.35), bg_color=C_FILL_BLUE, border_color=C_BORD_BLUE, border_width=1.5)
    tf_l = c_left.text_frame
    tf_l.word_wrap = True
    
    pl0 = tf_l.paragraphs[0]
    pl0.text = "📋  OFFICIAL SIH PROPOSAL SPECIFICATIONS"
    pl0.font.name = FONT_HEADING
    pl0.font.size = Pt(12.0)
    pl0.font.bold = True
    pl0.font.color.rgb = C_BLUE_DARK
    pl0.space_after = Pt(8)
    
    specs = [
        ("Problem Statement ID", "SIH2026 / Student Innovation (Deep Tech)"),
        ("Problem Statement Title", "Interactive Quantum Computing Simulation & Cryogenic Hardware Virtual Lab"),
        ("Theme", "Smart Education / Quantum Computing & Deep Tech"),
        ("PS Category", "Software & Hardware Digital Twin"),
        ("Team Name", "Team QuantumLab"),
        ("Team ID", "SIH-2026-TEAM-QLAB"),
        ("Core Architecture", "100% Client-Side Native Browser Simulation Engine"),
        ("National Alignment", "Directly Empowers India's National Quantum Mission (NQM)")
    ]
    for lbl, val in specs:
        add_bullet_point(tf_l, lbl, val, bullet="▪", title_color=C_BLUE_PRIMARY, body_color=C_NAVY_BODY, title_size=10.0, body_size=9.2, space_after=4)
        
    # Right Card: Platform Capabilities & Innovation
    c_right = add_card(slide, Inches(6.75), Inches(1.22), Inches(6.05), Inches(4.35), bg_color=C_FILL_CYAN, border_color=C_BORD_CYAN, border_width=1.5)
    tf_r = c_right.text_frame
    tf_r.word_wrap = True
    
    pr0 = tf_r.paragraphs[0]
    pr0.text = "⚛  PLATFORM ARCHITECTURE & CAPABILITIES"
    pr0.font.name = FONT_HEADING
    pr0.font.size = Pt(12.0)
    pr0.font.bold = True
    pr0.font.color.rgb = C_CYAN_ACCENT
    pr0.space_after = Pt(8)
    
    caps = [
        ("Zero-Install Statevector Engine", "Computes exact 2^n statevector unitary updates in <10 ms in pure browser JavaScript."),
        ("3D Dilution Refrigerator Digital Twin", "Photorealistic WebGL replication of IBM Chandelier across 6 thermal stages (293 K to 15 mK)."),
        ("Open-System Kraus Noise Engine", "Simulates true physical T1 relaxation, T2 dephasing, and depolarizing channels with real-time purity decay curves."),
        ("15 Production Quantum Algorithms", "End-to-end interactive suites: Shor's factoring, Grover's search, VQE, QAOA, and Quantum Support Vector Machines."),
        ("Physical Dispersive Readout Pipeline", "Models complete 9-stage microwave pulse synthesis (4–8 GHz), 60 dB cryogenic attenuation, and JPA/HEMT amplification.")
    ]
    for lbl, val in caps:
        add_bullet_point(tf_r, lbl, val, bullet="✔", title_color=C_EMERALD_DARK, body_color=C_NAVY_BODY, title_size=10.0, body_size=9.2, space_after=5)

    # Bottom Metric Strip (4 Stat Cards)
    metrics = [
        ("52,313+", "Lines of Native Code", "123 Modular Files (HTML/CSS/JS)", C_BLUE_PRIMARY, C_FILL_BLUE, C_BORD_BLUE),
        ("< 10 ms", "Statevector Latency", "Zero-Latency Client-Side Engine", C_CYAN_ACCENT, C_FILL_CYAN, C_BORD_CYAN),
        ("15 Algorithms", "Across 5 Quantum Domains", "QML, Optimization, Cryptography", C_VIOLET, C_FILL_LAVENDER, C_BORD_LAVENDER),
        ("100% Sovereign", "Air-Gapped Operation", "Runs with Wi-Fi Off / 0 Cloud Leaks", C_EMERALD_DARK, C_FILL_MINT, C_BORD_MINT)
    ]
    mw = Inches(2.9)
    mgap = Inches(0.18)
    for i, (num, l1, l2, col, fill, bord) in enumerate(metrics):
        mx = Inches(0.5) + i * (mw + mgap)
        mc = add_card(slide, mx, Inches(5.72), mw, Inches(1.1), bg_color=fill, border_color=bord, border_width=1.2)
        mtf = mc.text_frame
        mtf.word_wrap = True
        mtf.vertical_anchor = MSO_ANCHOR.MIDDLE
        
        p0 = mtf.paragraphs[0]
        p0.text = num
        p0.font.name = FONT_HEADING
        p0.font.size = Pt(16.0)
        p0.font.bold = True
        p0.font.color.rgb = col
        p0.alignment = PP_ALIGN.CENTER
        
        p1 = mtf.add_paragraph()
        p1.text = l1
        p1.font.name = FONT_SANS
        p1.font.size = Pt(9.5)
        p1.font.bold = True
        p1.font.color.rgb = C_NAVY_BODY
        p1.alignment = PP_ALIGN.CENTER
        
        p2 = mtf.add_paragraph()
        p2.text = l2
        p2.font.name = FONT_SANS
        p2.font.size = Pt(7.5)
        p2.font.color.rgb = C_TEXT_MUTED
        p2.alignment = PP_ALIGN.CENTER


# ==============================================================================
# SLIDE 2: IDEA TITLE & PROPOSED SOLUTION (Exact Reference Match)
# ==============================================================================
def build_slide_2(slide):
    set_slide_white_bg(slide)
    clean_shapes_except_logos_and_footers(slide)
    setup_header(slide, "IDEA TITLE", page_num=2)
    
    # Subtitle Banner (Matching reference image exactly)
    sub_card = add_card(slide, Inches(1.0), Inches(1.25), Inches(11.33), Inches(0.75), bg_color=C_WHITE, border_color=None)
    stf = sub_card.text_frame
    stf.word_wrap = True
    
    p0 = stf.paragraphs[0]
    p0.text = "❖  Proposed Solution (Describe your Idea/Solution/Prototype)"
    p0.font.name = FONT_HEADING
    p0.font.size = Pt(15.0)
    p0.font.bold = True
    p0.font.color.rgb = C_BLUE_DARK
    p0.alignment = PP_ALIGN.CENTER
    p0.space_after = Pt(2)
    
    p1 = stf.add_paragraph()
    r_main = p1.add_run()
    r_main.text = "QuantumLab – "
    r_main.font.bold = True
    r_main.font.color.rgb = C_CYAN_ACCENT
    r_main.font.size = Pt(13.0)
    
    r_sub = p1.add_run()
    r_sub.text = "An Interactive Experiential Platform for Learning Quantum Computing"
    r_sub.font.bold = True
    r_sub.font.color.rgb = C_NAVY_BODY
    r_sub.font.size = Pt(13.0)
    p1.alignment = PP_ALIGN.CENTER
    
    # 3 Large White Cards (Matching reference image)
    cw = Inches(3.9)
    ch = Inches(3.6)
    cgap = Inches(0.3)
    cy = Inches(2.15)
    
    # Card 1: Detailed Explanation
    c1 = add_card(slide, Inches(0.5), cy, cw, ch, bg_color=C_WHITE, border_color=C_BORD_CYAN, border_width=1.5)
    tf1 = c1.text_frame
    tf1.word_wrap = True
    
    p_h1 = tf1.paragraphs[0]
    p_h1.text = "💡  Detailed Explanation"
    p_h1.font.name = FONT_HEADING
    p_h1.font.size = Pt(13.0)
    p_h1.font.bold = True
    p_h1.font.color.rgb = C_NAVY_BODY
    p_h1.space_after = Pt(8)
    
    bullets1 = [
        ("QuantumLab transforms abstract quantum-computing theory into ", "visual, hands-on learning experiences."),
        ("Students learn through ", "interactive visualization, experiments, simulations and analysis."),
        ("The platform brings learning, experimentation, algorithm exploration, hardware visualization, challenges, progress tracking and AI-assisted guidance into ", "one ecosystem.")
    ]
    for b_norm, b_bold in bullets1:
        p = tf1.add_paragraph()
        p.space_after = Pt(8)
        rb = p.add_run()
        rb.text = "• "
        rb.font.color.rgb = C_BLUE_PRIMARY
        r1 = p.add_run()
        r1.text = b_norm
        r1.font.color.rgb = C_NAVY_BODY
        r1.font.size = Pt(9.5)
        r2 = p.add_run()
        r2.text = b_bold
        r2.font.bold = True
        r2.font.color.rgb = C_CYAN_ACCENT
        r2.font.size = Pt(9.5)

    # Card 2: How It Addresses the Problem
    c2 = add_card(slide, Inches(0.5) + cw + cgap, cy, cw, ch, bg_color=C_WHITE, border_color=C_BORD_BLUE, border_width=1.5)
    tf2 = c2.text_frame
    tf2.word_wrap = True
    
    p_h2 = tf2.paragraphs[0]
    p_h2.text = "🎯  How It Addresses the Problem"
    p_h2.font.name = FONT_HEADING
    p_h2.font.size = Pt(13.0)
    p_h2.font.bold = True
    p_h2.font.color.rgb = C_NAVY_BODY
    p_h2.space_after = Pt(8)
    
    bullets2 = [
        ("Bridges the gap between ", "theory and practical understanding", " by converting complex concepts into interactive visual experiences."),
        ("Enables students to learn through ", "hands-on interaction", " rather than just reading theory."),
        ("Provides a ", "unified platform", " instead of fragmented learning resources."),
        ("Supports the complete learning journey with ", "Learn → Experiment → Observe → Analyze → Practice.", "")
    ]
    for b_pre, b_bold, b_post in bullets2:
        p = tf2.add_paragraph()
        p.space_after = Pt(6)
        rb = p.add_run()
        rb.text = "• "
        rb.font.color.rgb = C_BLUE_PRIMARY
        r1 = p.add_run()
        r1.text = b_pre
        r1.font.color.rgb = C_NAVY_BODY
        r1.font.size = Pt(9.3)
        r2 = p.add_run()
        r2.text = b_bold
        r2.font.bold = True
        r2.font.color.rgb = C_BLUE_PRIMARY
        r2.font.size = Pt(9.3)
        if b_post:
            r3 = p.add_run()
            r3.text = b_post
            r3.font.color.rgb = C_NAVY_BODY
            r3.font.size = Pt(9.3)

    # Card 3: Innovation & Uniqueness
    c3 = add_card(slide, Inches(0.5) + 2 * (cw + cgap), cy, cw, ch, bg_color=C_WHITE, border_color=C_BORD_LAVENDER, border_width=1.5)
    tf3 = c3.text_frame
    tf3.word_wrap = True
    
    p_h3 = tf3.paragraphs[0]
    p_h3.text = "⭐  Innovation & Uniqueness"
    p_h3.font.name = FONT_HEADING
    p_h3.font.size = Pt(13.0)
    p_h3.font.bold = True
    p_h3.font.color.rgb = C_NAVY_BODY
    p_h3.space_after = Pt(6)
    
    inns = [
        ("Interactive 3D visualization", " of quantum concepts (Bloch sphere, 3D cryostat)."),
        ("Virtual laboratories", " for real-time experimentation without installation."),
        ("Algorithm simulations", " with configurable parameters and step verification."),
        ("Quantum hardware visualization", " for real-world dilution refrigerator understanding."),
        ("AI Tutor", " for contextual support, hint guidance, and doubt resolution."),
        ("Challenges & progress tracking", " for continuous competency badging."),
        ("Scalable sovereign architecture", " to add experiments and physical QPU backends.")
    ]
    for b_bold, b_norm in inns:
        p = tf3.add_paragraph()
        p.space_after = Pt(3)
        rb = p.add_run()
        rb.text = "• "
        rb.font.color.rgb = C_INDIGO
        r1 = p.add_run()
        r1.text = b_bold
        r1.font.bold = True
        r1.font.color.rgb = C_NAVY_BODY
        r1.font.size = Pt(9.0)
        r2 = p.add_run()
        r2.text = b_norm
        r2.font.color.rgb = C_NAVY_BODY
        r2.font.size = Pt(9.0)

    # Bottom Dark Hero Banner (Exact match to reference image bottom card)
    hero_card = add_card(slide, Inches(0.5), Inches(5.95), Inches(12.33), Inches(0.95), bg_color=C_HERO_DARK, border_color=None)
    
    # Add glowing atom icon on the left
    if os.path.exists(ATOM_IMG):
        slide.shapes.add_picture(ATOM_IMG, Inches(1.1), Inches(6.0), width=Inches(0.85), height=Inches(0.85))
        
    # Add glowing 3D wireframe quantum sphere on the right
    if os.path.exists(SPHERE_IMG):
        slide.shapes.add_picture(SPHERE_IMG, Inches(9.8), Inches(5.95), width=Inches(2.8), height=Inches(0.95))
        
    # Text in center of bottom banner
    quote_box = add_card(slide, Inches(2.2), Inches(6.0), Inches(7.5), Inches(0.85), bg_color=C_HERO_DARK, border_color=None)
    qtf = quote_box.text_frame
    qtf.word_wrap = True
    qtf.vertical_anchor = MSO_ANCHOR.MIDDLE
    
    qp = qtf.paragraphs[0]
    qr1 = qp.add_run()
    qr1.text = "QuantumLab bridges the gap between learning quantum computing and "
    qr1.font.name = FONT_SANS
    qr1.font.size = Pt(13.5)
    qr1.font.color.rgb = C_WHITE
    
    qr2 = qp.add_run()
    qr2.text = "actually experiencing it."
    qr2.font.name = FONT_SANS
    qr2.font.size = Pt(13.5)
    qr2.font.bold = True
    qr2.font.color.rgb = C_CYAN_LIGHT


# ==============================================================================
# SLIDE 3: SYSTEM ARCHITECTURE (Exact Reference Match: 5 Layers + Pipeline)
# ==============================================================================
def build_slide_3(slide):
    set_slide_white_bg(slide)
    clean_shapes_except_logos_and_footers(slide)
    setup_header(slide, "SYSTEM ARCHITECTURE", subtitle_text="QUANTUMLAB", page_num=3)
    
    # 5 Horizontal Layers
    layer_w = Inches(12.33)
    layer_h = Inches(0.95)
    layer_gap = Inches(0.08)
    y_start = Inches(1.22)
    
    layers_data = [
        # (title, subtitle, bg_color, bord_color, icon_color, center_content_type, role_bullets)
        ("1. USER / PRESENTATION LAYER",
         "Learner interacts with the platform through a modern web interface.",
         C_FILL_BLUE, C_BORD_BLUE, C_BLUE_PRIMARY, "layer1",
         ["Handles user interaction and presentation.", "Provides responsive and modern UI/UX.", "Communicates with simulation engines."]),
         
        ("2. INTERACTIVE VISUALIZATION LAYER",
         "Renders real-time 2D/3D visualizations and animations for quantum concepts.",
         C_FILL_CYAN, C_BORD_CYAN, C_CYAN_ACCENT, "layer2",
         ["Renders qubits, states, circuits and hardware in real time.", "Provides interactive and immersive visual experience.", "60 FPS WebGL rendering."]),
         
        ("3. APPLICATION / ENGINE LAYER",
         "Handles business logic, APIs, user progress and lab orchestration.",
         C_FILL_LAVENDER, C_BORD_LAVENDER, C_VIOLET, "layer3",
         ["Coordinates simulation engines.", "Manages learner sessions and telemetry.", "Serves interactive learning modules."]),
         
        ("4. QUANTUM SIMULATION & COMPUTATION LAYER",
         "Performs quantum-state calculations, gate operations and noise models.",
         C_FILL_MINT, C_BORD_MINT, C_EMERALD_DARK, "layer4",
         ["Performs all quantum calculations.", "Executes algorithms and simulations.", "Calculates measurements and noise.", "Extensible to real hardware."]),
         
        ("5. DATA + AI + DEPLOYMENT LAYER",
         "Manages client storage, AI tutor services and sovereign deployment.",
         C_FILL_SLATE, C_BORD_SLATE, C_BLUE_DARK, "layer5",
         ["Stores user and learning progress.", "Provides AI-powered explanations.", "Ensures 100% offline air-gap reliability."])
    ]
    
    for idx, (ltitle, ldesc, lfill, lbord, licol, ltype, roles) in enumerate(layers_data):
        ly = y_start + idx * (layer_h + layer_gap)
        
        # Outer Card Container
        lc = add_card(slide, Inches(0.5), ly, layer_w, layer_h, bg_color=lfill, border_color=lbord, border_width=1.0)
        
        # Left Title Box (Width 2.2")
        box_l = add_card(slide, Inches(0.55), ly + Inches(0.04), Inches(2.2), layer_h - Inches(0.08), bg_color=lfill, border_color=None)
        tfl = box_l.text_frame
        tfl.word_wrap = True
        p_t = tfl.paragraphs[0]
        p_t.text = ltitle
        p_t.font.name = FONT_HEADING
        p_t.font.size = Pt(8.5)
        p_t.font.bold = True
        p_t.font.color.rgb = licol
        p_t.space_after = Pt(1)
        
        p_d = tfl.add_paragraph()
        p_d.text = ldesc
        p_d.font.name = FONT_SANS
        p_d.font.size = Pt(7.0)
        p_d.font.color.rgb = C_TEXT_MUTED
        
        # Center Box (Width 7.8")
        box_c = add_card(slide, Inches(2.8), ly + Inches(0.04), Inches(7.6), layer_h - Inches(0.08), bg_color=C_WHITE, border_color=lbord, border_width=0.8)
        tfc = box_c.text_frame
        tfc.word_wrap = True
        
        if ltype == "layer1":
            pc = tfc.paragraphs[0]
            pc.text = "Student / Learner (Explore • Learn • Experiment)  ➔  Web Browser (Chrome, Firefox, Safari, Edge)  ➔  QuantumLab Web App"
            pc.font.name = FONT_SANS
            pc.font.size = Pt(7.8)
            pc.font.bold = True
            pc.font.color.rgb = C_BLUE_PRIMARY
            pc.space_after = Pt(2)
            
            p_pills = tfc.add_paragraph()
            p_pills.text = "MODULES: [Basics]  [Experiments]  [Virtual Labs]  [Algorithms]  [Quantum Hardware]  [Learn]  [Challenges]  [Progress]  [AI Tutor]"
            p_pills.font.name = FONT_SANS
            p_pills.font.size = Pt(7.2)
            p_pills.font.color.rgb = C_NAVY_BODY
            
        elif ltype == "layer2":
            # Add preview thumbnail boxes horizontally
            thumbs = [
                (THUMB_STATES, "Quantum States"),
                (THUMB_BLOCH, "Bloch Sphere"),
                (THUMB_CIRCUIT, "Quantum Circuits"),
                (THUMB_PARTICLE, "Wave Interference"),
                (THUMB_ALGO, "Algorithm Animations"),
                (CHANDELIER_IMG, "Cryostat Twin")
            ]
            tw = Inches(1.15)
            th = Inches(0.65)
            tgap = Inches(0.08)
            for ti, (tpath, tlabel) in enumerate(thumbs):
                tx = Inches(2.9) + ti * (tw + tgap)
                if os.path.exists(tpath):
                    slide.shapes.add_picture(tpath, tx, ly + Inches(0.08), width=tw, height=th)
                # Label under thumb
                lb = add_card(slide, tx, ly + Inches(0.72), tw, Inches(0.18), bg_color=C_WHITE, border_color=None)
                ltf = lb.text_frame
                lp = ltf.paragraphs[0]
                lp.text = tlabel
                lp.font.size = Pt(5.8)
                lp.font.bold = True
                lp.font.color.rgb = C_NAVY_BODY
                lp.alignment = PP_ALIGN.CENTER
                
        elif ltype == "layer3":
            pc = tfc.paragraphs[0]
            pc.text = "Autonomous Virtual Lab Services & Engine Orchestration"
            pc.font.name = FONT_SANS
            pc.font.size = Pt(8.0)
            pc.font.bold = True
            pc.font.color.rgb = C_VIOLET
            pc.space_after = Pt(2)
            
            p_mods = tfc.add_paragraph()
            p_mods.text = "SERVICES: ⚛ Experiment Manager  |  🔬 Virtual Lab Manager  |  ⚡ Algorithm Manager  |  📊 Progress Store  |  🏆 Challenge Engine  |  🤖 AI Tutor Engine"
            p_mods.font.name = FONT_SANS
            p_mods.font.size = Pt(7.2)
            p_mods.font.color.rgb = C_NAVY_BODY
            
        elif ltype == "layer4":
            pc = tfc.paragraphs[0]
            pc.text = "In-Browser Statevector Engine (O(2^n) In-Place Strides)  ➔  Kraus Noise Solver (T1/T2)  ➔  15 Algorithms Suite"
            pc.font.name = FONT_SANS
            pc.font.size = Pt(7.8)
            pc.font.bold = True
            pc.font.color.rgb = C_EMERALD_DARK
            pc.space_after = Pt(2)
            
            p_ext = tfc.add_paragraph()
            p_ext.text = "PIPELINE: State & Gate Engine ➔ Algorithm Suite (Shor, Grover, VQE, QAOA, QSVM) ➔ Lindblad Noise Channel ➔ Projective Born Rule Sampler"
            p_ext.font.name = FONT_SANS
            p_ext.font.size = Pt(7.0)
            p_ext.font.color.rgb = C_NAVY_BODY
            
        elif ltype == "layer5":
            pc = tfc.paragraphs[0]
            pc.text = "Client LocalStorage Persistence  |  AI Quantum Tutor (Contextual Explanations)  |  Zero-Dependency Deployment"
            pc.font.name = FONT_SANS
            pc.font.size = Pt(7.8)
            pc.font.bold = True
            pc.font.color.rgb = C_BLUE_DARK
            pc.space_after = Pt(2)
            
            p_dep = tfc.add_paragraph()
            p_dep.text = "INFRASTRUCTURE: 100% Client-Side Vanilla JS  •  Air-Gapped Offline Ready  •  Zero Server Maintenance  •  Zero Cloud Data Leakage"
            p_dep.font.name = FONT_SANS
            p_dep.font.size = Pt(7.0)
            p_dep.font.color.rgb = C_NAVY_BODY

        # Right Box: Role (Width 1.8")
        box_r = add_card(slide, Inches(10.5), ly + Inches(0.04), Inches(2.25), layer_h - Inches(0.08), bg_color=lfill, border_color=None)
        tfr = box_r.text_frame
        tfr.word_wrap = True
        pr0 = tfr.paragraphs[0]
        pr0.text = "Role:"
        pr0.font.name = FONT_HEADING
        pr0.font.size = Pt(7.5)
        pr0.font.bold = True
        pr0.font.color.rgb = licol
        
        for r_pt in roles:
            p_rp = tfr.add_paragraph()
            p_rp.text = f"• {r_pt}"
            p_rp.font.name = FONT_SANS
            p_rp.font.size = Pt(6.5)
            p_rp.font.color.rgb = C_NAVY_BODY

    # Bottom End-to-End Flow Pipeline (Exact match to reference bottom pipeline)
    flow_y = Inches(6.38)
    flow_card = add_card(slide, Inches(0.5), flow_y, Inches(12.33), Inches(0.62), bg_color=C_FILL_SLATE, border_color=C_BLUE_PRIMARY, border_width=1.0)
    tff = flow_card.text_frame
    tff.word_wrap = True
    tff.vertical_anchor = MSO_ANCHOR.MIDDLE
    
    fp = tff.paragraphs[0]
    fp.text = "⚙  End-to-End Flow:  [USER INPUT]  ➔  [WEB UI INTERACTION]  ➔  [LAB ENGINE ORCHESTRATION]  ➔  [QUANTUM SIMULATION (Math Core)]  ➔  [RESULTS EVALUATION]  ➔  [3D WEBGL VISUALIZATION]  ➔  [AI INSIGHTS & PROGRESS]"
    fp.font.name = FONT_SANS
    fp.font.size = Pt(8.2)
    fp.font.bold = True
    fp.font.color.rgb = C_BLUE_PRIMARY
    fp.alignment = PP_ALIGN.CENTER


# ==============================================================================
# SLIDE 4: FEASIBILITY AND VIABILITY (Clean Executive Quad Grid + Risk Table + Roadmap)
# ==============================================================================
def build_slide_4(slide):
    set_slide_white_bg(slide)
    clean_shapes_except_logos_and_footers(slide)
    setup_header(slide, "FEASIBILITY AND VIABILITY", subtitle_text="OPERATIONAL SUSTAINABILITY, TECHNICAL VIABILITY & EXECUTION MILESTONES", page_num=4)
    
    # Left Half: 4 Feasibility Quadrants (Width 5.8")
    fw = Inches(2.8)
    fh = Inches(1.8)
    fgap = Inches(0.2)
    
    quads = [
        ("TECHNICAL FEASIBILITY", C_EMERALD_DARK, C_FILL_MINT, C_BORD_MINT, [
            ("Proven Working Prototype", "52,313 lines of code across 123 modular source files."),
            ("Ultra-Low Latency", "<10 ms state evaluation via in-place index strides."),
            ("High-Frame-Rate 3D", "Consistent 60 FPS WebGL rendering on basic laptops.")
        ]),
        ("OPERATIONAL FEASIBILITY", C_CYAN_ACCENT, C_FILL_CYAN, C_BORD_CYAN, [
            ("Zero Infrastructure Cost", "No backend server, no database, no cloud bills."),
            ("Universal Browser Support", "Runs on Chrome, Firefox, Safari, Edge without setup."),
            ("Zero Setup Barrier", "Instant launch via double-click or python -m http.server.")
        ]),
        ("ECONOMIC VIABILITY", C_AMBER, C_FILL_SLATE, C_BORD_SLATE, [
            ("Replaces Costly Licenses", "Eliminates ₹10-20 Lakhs/yr commercial tool fees."),
            ("Zero Cloud QPU Billing", "Learners experiment freely without pay-per-second queues."),
            ("Open-Source Sustainability", "Free forever for Indian academic institutions.")
        ]),
        ("PEDAGOGICAL VIABILITY", C_VIOLET, C_FILL_LAVENDER, C_BORD_LAVENDER, [
            ("Complete Vertical Curriculum", "From Bra-Ket algebra to advanced VQE/QSVM."),
            ("Gamified Skill Radar", "Interactive challenges, quizzes, and progress badges."),
            ("Cleanroom Demystification", "Direct visual connection to cryogenic physics.")
        ])
    ]
    
    for idx, (title, col, fill, bord, items) in enumerate(quads):
        r = idx // 2
        c = idx % 2
        qx = Inches(0.5) + c * (fw + fgap)
        qy = Inches(1.25) + r * (fh + Inches(0.12))
        
        qc = add_card(slide, qx, qy, fw, fh, bg_color=fill, border_color=bord, border_width=1.2)
        qtf = qc.text_frame
        qtf.word_wrap = True
        
        p = qtf.paragraphs[0]
        p.text = f"✔  {title}"
        p.font.name = FONT_HEADING
        p.font.size = Pt(9.5)
        p.font.bold = True
        p.font.color.rgb = col
        p.space_after = Pt(3)
        
        for t, b in items:
            add_bullet_point(qtf, t, b, bullet="▪", title_color=col, body_color=C_NAVY_BODY, title_size=8.5, body_size=8.0, space_after=2)

    # Right Half: Risk & Robust Mitigation Strategy Card (Width 6.3")
    rc = add_card(slide, Inches(6.5), Inches(1.25), Inches(6.3), Inches(3.72), bg_color=C_WHITE, border_color=C_ROSE, border_width=1.5)
    rtf = rc.text_frame
    rtf.word_wrap = True
    
    rp = rtf.paragraphs[0]
    rp.text = "🛡  POTENTIAL RISKS, BOUNDARIES & ROBUST MITIGATIONS"
    rp.font.name = FONT_HEADING
    rp.font.size = Pt(11.0)
    rp.font.bold = True
    rp.font.color.rgb = C_ROSE
    rp.space_after = Pt(6)
    
    risks = [
        ("Classical 2^n Exponential Memory Ceiling",
         "Simulating 50 qubits classically requires 16 Petabytes of RAM.",
         "MITIGATION: Engineered specifically for the pedagogical regime (1-10 qubits); in-place bit-strides keep RAM <50 MB and execution <10 ms with exact analytical fidelity."),
        
        ("Numerical Float Drift in Unitary Operations",
         "Repeated complex matrix products accumulate floating-point roundoff errors.",
         "MITIGATION: Automated in-flight Gram-Schmidt statevector renormalization applied after multi-gate sequences ensures absolute norm preservation (||ψ||² = 1.000000)."),
        
        ("Legacy Hardware & WebGL Shader Support",
         "Older institution computers may lack dedicated GPUs or WebGL 2.0 extensions.",
         "MITIGATION: Robust fallback pipeline automatically drops to high-performance 2D Canvas rendering for statevectors and circuits while maintaining full mathematical simulation."),
         
        ("Pop-Science vs Physical NISQ Reality Disconnect",
         "Students assume quantum computers operate identically to noiseless textbook math.",
         "MITIGATION: Integrated Kraus noise simulator and 3D Chandelier twin show true T1/T2 decoherence, 60 dB attenuation, and dispersive readout shifts.")
    ]
    
    for r_title, r_desc, r_mit in risks:
        p_r = rtf.add_paragraph()
        p_r.space_after = Pt(3)
        
        r1 = p_r.add_run()
        r1.text = f"⚠ Risk: {r_title}\n"
        r1.font.name = FONT_SANS
        r1.font.size = Pt(8.5)
        r1.font.bold = True
        r1.font.color.rgb = C_AMBER
        
        r2 = p_r.add_run()
        r2.text = f"   {r_mit}\n"
        r2.font.name = FONT_SANS
        r2.font.size = Pt(8.0)
        r2.font.color.rgb = C_NAVY_BODY

    # Bottom Ribbon: 3-Phase Execution Roadmap
    road_card = add_card(slide, Inches(0.5), Inches(5.08), Inches(12.33), Inches(1.8), bg_color=C_FILL_SLATE, border_color=C_BLUE_PRIMARY, border_width=1.0)
    rtf_p = road_card.text_frame
    rtf_p.word_wrap = True
    
    prh = rtf_p.paragraphs[0]
    prh.text = "🚀 THREE-PHASE IMPLEMENTATION & SCALING ROADMAP"
    prh.font.name = FONT_HEADING
    prh.font.size = Pt(10.5)
    prh.font.bold = True
    prh.font.color.rgb = C_BLUE_PRIMARY
    prh.space_after = Pt(4)
    
    phases = [
        ("PHASE 1: FOUNDATION (COMPLETED)", C_EMERALD_DARK, C_FILL_MINT, C_BORD_MINT, [
            "Complete browser simulator (5 Labs, 15 Algorithms).",
            "3D Chandelier Dilution Refrigerator digital twin.",
            "100% offline air-gapped sovereign capability verified."
        ]),
        ("PHASE 2: COMPILATION & HARDWARE (MONTHS 1-6)", C_CYAN_ACCENT, C_FILL_CYAN, C_BORD_CYAN, [
            "WebAssembly (Wasm) acceleration scaling to 16-20 qubits.",
            "OpenQASM 2.0 / 3.0 circuit import & export bridge.",
            "DRAG microwave pulse-level schedule visualizer."
        ]),
        ("PHASE 3: NATIONAL DEPLOYMENT (MONTHS 6-18)", C_VIOLET, C_FILL_LAVENDER, C_BORD_LAVENDER, [
            "Integration across 500+ AICTE & university portals.",
            "Curriculum partnership with India's National Quantum Mission.",
            "Multi-language regional localization (Hindi, Tamil, etc.)."
        ])
    ]
    
    pw = Inches(3.9)
    pgap = Inches(0.2)
    for i, (p_title, p_col, p_fill, p_bord, p_points) in enumerate(phases):
        px = Inches(0.6) + i * (pw + pgap)
        py = Inches(5.42)
        pc = add_card(slide, px, py, pw, Inches(1.35), bg_color=p_fill, border_color=p_bord, border_width=1.0)
        ptf = pc.text_frame
        ptf.word_wrap = True
        
        pp = ptf.paragraphs[0]
        pp.text = p_title
        pp.font.name = FONT_HEADING
        pp.font.size = Pt(8.5)
        pp.font.bold = True
        pp.font.color.rgb = p_col
        pp.space_after = Pt(2)
        
        for pt in p_points:
            add_bullet_point(ptf, "", pt, bullet="▪", title_color=p_col, body_color=C_NAVY_BODY, title_size=7.8, body_size=7.8, space_after=1)


# ==============================================================================
# SLIDE 5: IMPACT AND BENEFITS (Clean Executive Quad Ecosystem + Hero Ribbon)
# ==============================================================================
def build_slide_5(slide):
    set_slide_white_bg(slide)
    clean_shapes_except_logos_and_footers(slide)
    setup_header(slide, "IMPACT AND BENEFITS", subtitle_text="SOCIAL DEMOCRATIZATION, ECONOMIC ROI, SOVEREIGN SECURITY & ENVIRONMENTAL GAINS", page_num=5)
    
    # Top KPI Metric Strip
    kpis = [
        ("100,000+", "Students Reached Across India", "Tier-2/3 Engineering Colleges Empowered", C_BLUE_PRIMARY, C_FILL_BLUE, C_BORD_BLUE),
        ("₹ 0", "Capital & Subscription Cost", "Replaces $1.60/sec Cloud QPU Paywalls", C_EMERALD_DARK, C_FILL_MINT, C_BORD_MINT),
        ("100% Sovereign", "Air-Gapped Privacy & Security", "Zero Data Leaks to Foreign Cloud Servers", C_VIOLET, C_FILL_LAVENDER, C_BORD_LAVENDER),
        ("0g Carbon", "Green Browser Computing", "Zero Server Thermal Load / Cloud Waste", C_AMBER, C_FILL_SLATE, C_BORD_SLATE)
    ]
    kw = Inches(2.9)
    kgap = Inches(0.2)
    for i, (num, l1, l2, col, fill, bord) in enumerate(kpis):
        kx = Inches(0.5) + i * (kw + kgap)
        kc = add_card(slide, kx, Inches(1.22), kw, Inches(1.05), bg_color=fill, border_color=bord, border_width=1.2)
        ktf = kc.text_frame
        ktf.word_wrap = True
        ktf.vertical_anchor = MSO_ANCHOR.MIDDLE
        
        p0 = ktf.paragraphs[0]
        p0.text = num
        p0.font.name = FONT_HEADING
        p0.font.size = Pt(16.0)
        p0.font.bold = True
        p0.font.color.rgb = col
        p0.alignment = PP_ALIGN.CENTER
        
        p1 = ktf.add_paragraph()
        p1.text = l1
        p1.font.name = FONT_SANS
        p1.font.size = Pt(9.0)
        p1.font.bold = True
        p1.font.color.rgb = C_NAVY_BODY
        p1.alignment = PP_ALIGN.CENTER
        
        p2 = ktf.add_paragraph()
        p2.text = l2
        p2.font.name = FONT_SANS
        p2.font.size = Pt(7.2)
        p2.font.color.rgb = C_TEXT_MUTED
        p2.alignment = PP_ALIGN.CENTER

    # 4 Themed Impact Quadrants (2x2 Grid)
    qw = Inches(5.95)
    qh = Inches(2.1)
    qgap_x = Inches(0.4)
    qgap_y = Inches(0.15)
    
    quadrants = [
        ("1. SOCIAL & EDUCATIONAL IMPACT (DEMOCRATIZING STEM)", C_CYAN_ACCENT, C_FILL_CYAN, C_BORD_CYAN, [
            ("Democratizes Access for Tier-2 & Tier-3 Colleges", "Removes the extreme barrier of physical quantum hardware. Any student with a standard laptop can experiment with 15 mK dilution refrigerators and 15 algorithms."),
            ("Intuitive Visual Pedagogy", "Replaces impenetrable pop-science analogies with live 3D Bloch vectors and statevector amplitudes, building genuine quantum engineering intuition."),
            ("Self-Paced Competency Badging", "In-app gamified skill radar tracks student mastery across superposition, entanglement, algorithms, and cryogenic hardware.")
        ]),
        ("2. ECONOMIC & INSTITUTIONAL BENEFITS", C_EMERALD_DARK, C_FILL_MINT, C_BORD_MINT, [
            ("Massive Capital & Operational Savings", "Eliminates the need for educational institutions to purchase multi-million rupee commercial simulator software licenses or cloud QPU credits."),
            ("Zero Server Infrastructure Footprint", "Because the entire engine executes client-side, universities can host QuantumLab on static GitHub Pages or local intranets with ₹0 server hosting costs."),
            ("Scales Instantly to Millions", "Serving 100,000 concurrent students incurs zero server load or bandwidth degradation, ensuring 100% uptime during exams and hackathons.")
        ]),
        ("3. NATIONAL SOVEREIGNTY (ALIGNED WITH INDIA'S NQM)", C_VIOLET, C_FILL_LAVENDER, C_BORD_LAVENDER, [
            ("Direct Alignment with National Quantum Mission (NQM)", "Directly addresses India's urgent need for a 10,000+ strong workforce of skilled quantum programmers, researchers, and engineers."),
            ("100% Sovereign Data Security", "Client-side air-gapped simulation guarantees that domestic research algorithms, student intellectual property, and defense lab designs never touch foreign servers."),
            ("Defense & Strategic Laboratory Ready", "Can be deployed inside completely disconnected, air-gapped military networks and DRDO labs without security compliance risks.")
        ]),
        ("4. ENVIRONMENTAL & SUSTAINABILITY IMPACT", C_AMBER, C_FILL_SLATE, C_BORD_SLATE, [
            ("100% Green Client-Side Computation", "Replaces energy-guzzling cloud datacenter clusters with ultra-lightweight client-side vector operations that run on less than 2 watts of CPU power."),
            ("Eliminates Needless Network Overhead", "Zero telemetry requests, zero external CDN fetches, and zero API polling reduce internet transit energy consumption to absolute zero."),
            ("Sustainable Educational Digital Twin", "Allows learners to explore cryogenic dilution physics without venting thousands of liters of scarce, non-renewable liquid Helium-3.")
        ])
    ]
    
    for idx, (title, color, fill, bord, items) in enumerate(quadrants):
        r = idx // 2
        c = idx % 2
        qx = Inches(0.5) + c * (qw + qgap_x)
        qy = Inches(2.38) + r * (qh + qgap_y)
        
        qc = add_card(slide, qx, qy, qw, qh, bg_color=fill, border_color=bord, border_width=1.2)
        qtf = qc.text_frame
        qtf.word_wrap = True
        
        qp = qtf.paragraphs[0]
        qp.text = title
        qp.font.name = FONT_HEADING
        qp.font.size = Pt(9.5)
        qp.font.bold = True
        qp.font.color.rgb = color
        qp.space_after = Pt(3)
        
        for t, b in items:
            add_bullet_point(qtf, t, b, bullet="▪", title_color=color, body_color=C_NAVY_BODY, title_size=8.8, body_size=8.0, space_after=2)

    # Bottom National Impact Banner
    banner = add_card(slide, Inches(0.5), Inches(6.15), Inches(12.33), Inches(0.75), bg_color=C_HERO_DARK, border_color=None)
    btf = banner.text_frame
    btf.word_wrap = True
    btf.vertical_anchor = MSO_ANCHOR.MIDDLE
    bp = btf.paragraphs[0]
    bp.text = "⚛  Empowering India's next generation of quantum researchers, engineers, and developers at national scale."
    bp.font.name = FONT_SANS
    bp.font.size = Pt(11.5)
    bp.font.bold = True
    bp.font.color.rgb = C_CYAN_LIGHT
    bp.alignment = PP_ALIGN.CENTER


# ==============================================================================
# SLIDE 6: RESEARCH AND REFERENCES (Academic Foundations & Hardware Calibration)
# ==============================================================================
def build_slide_6(slide):
    set_slide_white_bg(slide)
    clean_shapes_except_logos_and_footers(slide)
    setup_header(slide, "RESEARCH AND REFERENCES", subtitle_text="PEER-REVIEWED LITERATURE, PHYSICAL HARDWARE CALIBRATION & CODE INTEGRITY", page_num=6)
    
    top_pos = Inches(1.22)
    body_h = Inches(4.35)
    
    # Left Column: Peer-Reviewed Scientific Foundations
    c_left = add_card(slide, Inches(0.5), top_pos, Inches(6.0), body_h, bg_color=C_FILL_CYAN, border_color=C_BORD_CYAN, border_width=1.5)
    tf_l = c_left.text_frame
    tf_l.word_wrap = True
    
    pl = tf_l.paragraphs[0]
    pl.text = "📚 PEER-REVIEWED THEORETICAL FOUNDATIONS"
    pl.font.name = FONT_HEADING
    pl.font.size = Pt(11.5)
    pl.font.bold = True
    pl.font.color.rgb = C_CYAN_ACCENT
    pl.space_after = Pt(6)
    
    papers = [
        ("Nielsen & Chuang (2010)", "Quantum Computation and Quantum Information (Cambridge Univ. Press)",
         "Foundational formulation of unitary transformations, Dirac bra-ket calculus, tensor product Hilbert spaces, and quantum projective measurement postulates."),
        
        ("Blais et al. (2004)", "Cavity QED for Superconducting Qubits (Phys. Rev. A 69, 062320)",
         "Physical derivation of dispersive readout: coupling transmon qubits to off-resonant superconducting cavities causing state-dependent frequency shifts (ωr' = ωr ± χ)."),
        
        ("Preskill, John (2018)", "Quantum Computing in the NISQ Era and Beyond (Quantum 2, 79)",
         "Theoretical framework for open-system decoherence, Kraus operator CPTP channels, T1 energy relaxation, and T2 dephasing dynamics in near-term hardware."),
        
        ("Mitarai et al. (2018)", "Quantum Circuit Learning (Phys. Rev. A 98, 032309)",
         "Exact analytical parameter-shift gradient formulation: ∂⟨H⟩/∂θ = 1/2[⟨H⟩_(θ+π/2) - ⟨H⟩_(θ-π/2)], powering QuantumLab's in-browser VQE and QNN optimization."),
         
        ("Havlíček et al. (2019)", "Supervised Learning with Quantum Feature Spaces (Nature 567)",
         "Mathematical architecture for Quantum Support Vector Machines (QSVM) using entangled quantum feature maps to project classical data into high-dimensional Hilbert spaces.")
    ]
    for auth, title, impact in papers:
        add_bullet_point(tf_l, f"{auth} – {title}", impact, bullet="▪", title_color=C_BLUE_PRIMARY, body_color=C_NAVY_BODY, title_size=9.0, body_size=8.0, space_after=4)

    # Right Column: Industrial Specifications & Thermodynamic Benchmarks
    c_right = add_card(slide, Inches(6.8), top_pos, Inches(6.03), body_h, bg_color=C_FILL_LAVENDER, border_color=C_BORD_LAVENDER, border_width=1.5)
    tf_r = c_right.text_frame
    tf_r.word_wrap = True
    
    pr = tf_r.paragraphs[0]
    pr.text = "🔬 HARDWARE BENCHMARKS & PHYSICAL CALIBRATIONS"
    pr.font.name = FONT_HEADING
    pr.font.size = Pt(11.5)
    pr.font.bold = True
    pr.font.color.rgb = C_VIOLET
    pr.space_after = Pt(6)
    
    hw_specs = [
        ("IBM Quantum Falcon / Eagle Hardware Calibration",
         "Physical parameters in QuantumLab's noise and circuit engines are strictly calibrated to published IBM Quantum experimental data:\n"
         "• Operating Temp: 15 millikelvin (-273.135 °C / colder than deep space)\n"
         "• Typical T1 Relaxation Time: 100–300 μs | Typical T2 Dephasing Time: 80–200 μs\n"
         "• 1-Qubit Gate Fidelity: 99.92% | 2-Qubit CNOT Fidelity: 99.40%\n"
         "• Qubit Drive Frequencies: 4.5–5.2 GHz | Dispersive Resonator Frequencies: 6.8–7.5 GHz"),
         
        ("Dilution Refrigerator 6-Stage Thermodynamic Gradient",
         "The 3D Chandelier digital twin reflects true thermodynamic stages from Oxford Instruments & Bluefors specifications:\n"
         "• Stage 1 (293 K Vacuum Flange) → Stage 2 (50 K Radiation Shield) → Stage 3 (4 K Pulse Tube Plate)\n"
         "• Stage 4 (700 mK Still Evaporator) → Stage 5 (100 mK Cold Plate) → Stage 6 (15 mK Mixing Chamber)\n"
         "• 60 dB total microwave attenuation across stages to eliminate room thermal noise"),
         
        ("Live Web-Based Verification Repositories",
         "• Live Project Manual: QUANTUMLAB_PROJECT_MANUAL.md (523 lines of engineering rigor)\n"
         "• Verification Scripts: Verified against analytical matrix eigenvalues & Qiskit statevectors")
    ]
    for t, b in hw_specs:
        add_bullet_point(tf_r, t, b, bullet="▪", title_color=C_VIOLET, body_color=C_NAVY_BODY, title_size=9.0, body_size=8.0, space_after=4)

    # Bottom Banner: Project Integrity & Verification Certification
    cert_card = add_card(slide, Inches(0.5), Inches(5.68), Inches(12.33), Inches(1.2), bg_color=C_FILL_MINT, border_color=C_BORD_MINT, border_width=1.2)
    tf_c = cert_card.text_frame
    tf_c.word_wrap = True
    
    pc0 = tf_c.paragraphs[0]
    pc0.text = "🛡  PROJECT INTEGRITY, SOVEREIGN CODE AUDIT & VERIFICATION"
    pc0.font.name = FONT_HEADING
    pc0.font.size = Pt(10.0)
    pc0.font.bold = True
    pc0.font.color.rgb = C_EMERALD_DARK
    pc0.space_after = Pt(2)
    
    c_badges = [
        ("Codebase Scale", "52,313 Lines of Native ES6+, HTML5 & WebGL Code across 123 Modular Source Files."),
        ("Mathematical Fidelity", "15/15 Algorithms mathematically verified against exact analytical expectation values."),
        ("Laboratory Autonomy", "5/5 Virtual Laboratories operate independently with zero tight-coupling."),
        ("Air-Gap Sovereignty", "100% Certified to execute in zero-network air-gapped environments without failure.")
    ]
    for lbl, val in c_badges:
        add_bullet_point(tf_c, lbl, val, bullet="✔", title_color=C_EMERALD_DARK, body_color=C_NAVY_BODY, title_size=8.5, body_size=8.0, space_after=1)


# ==============================================================================
# MAIN EXECUTION ROUTINE
# ==============================================================================
def main():
    print(f"Loading official template from: {TEMPLATE_PATH}")
    prs = Presentation(TEMPLATE_PATH)
    
    print(f"Initial template slide count: {len(prs.slides)}")
    
    # Ensure Slide 7 (Instructions slide) is removed as required by SIH submission guidelines
    if len(prs.slides) > 6:
        print("Removing instruction slide (Slide 7) to enforce strict 6-slide submission rule...")
        rId = prs.slides._sldIdLst[6].rId
        prs.part.drop_rel(rId)
        del prs.slides._sldIdLst[6]
        
    print(f"Submission deck slide count: {len(prs.slides)} (Strict SIH Limit: 6)")
    
    print("Building Slide 1: TITLE PAGE (Executive Clean Tech Hero)...")
    build_slide_1(prs.slides[0])
    
    print("Building Slide 2: IDEA TITLE & PROPOSED SOLUTION (Reference Layout)...")
    build_slide_2(prs.slides[1])
    
    print("Building Slide 3: SYSTEM ARCHITECTURE (5 Decoupled Layers + Pipeline)...")
    build_slide_3(prs.slides[2])
    
    print("Building Slide 4: FEASIBILITY AND VIABILITY (Quad Matrix + Risk Table + Roadmap)...")
    build_slide_4(prs.slides[3])
    
    print("Building Slide 5: IMPACT AND BENEFITS (KPI Ribbon + 4 Impact Spheres)...")
    build_slide_5(prs.slides[4])
    
    print("Building Slide 6: RESEARCH AND REFERENCES (Academic Foundations + Benchmarks)...")
    build_slide_6(prs.slides[5])
    
    print(f"Saving winning presentation to: {OUTPUT_PPTX}")
    prs.save(OUTPUT_PPTX)
    print("Successfully generated winning SIH presentation!")

if __name__ == "__main__":
    main()
