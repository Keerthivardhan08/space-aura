import os
import pptx
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def create_space_aura_deck():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Premium Aerospace Dark Mode Palette
    C_BG = RGBColor(4, 8, 20)          # #040814 Deepest Cosmic Space
    C_CARD = RGBColor(11, 18, 36)      # #0b1224 Aerospace Surface Card
    C_CARD_ACC = RGBColor(16, 26, 52)  # #101a34 Highlighted Card
    C_CYAN = RGBColor(56, 189, 248)    # #38bdf8 High-Tech Cyan
    C_AMBER = RGBColor(245, 158, 11)   # #f59e0b Solar Corona Amber
    C_EMERALD = RGBColor(16, 185, 129) # #10b981 Orbit Telemetry Emerald
    C_ORANGE = RGBColor(249, 115, 22)  # #f97316 Mars Flame Orange
    C_TEXT = RGBColor(248, 250, 252)   # #f8fafc Crisp Starlight White
    C_MUTED = RGBColor(148, 163, 184)  # #94a3b8 Instrument Grey
    C_BORDER = RGBColor(30, 48, 80)    # Subdued Blue Border
    C_BORDER_GLOW = RGBColor(56, 189, 248)

    assets_dir = r"d:\space app\presentation_assets"

    def apply_background(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = C_BG
        bg.line.fill.background()

    def add_header(slide, slide_num, category, title, subtitle):
        header_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.733), Inches(1.15))
        tf = header_box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        p0 = tf.paragraphs[0]
        p0.text = f"NASA SPACE APPS CHALLENGE 2026  //  SLIDE {slide_num:02d} OF 07  //  {category.upper()}"
        p0.font.name = "Consolas"
        p0.font.size = Pt(10)
        p0.font.bold = True
        p0.font.color.rgb = C_CYAN

        p1 = tf.add_paragraph()
        p1.text = title
        p1.font.name = "Trebuchet MS"
        p1.font.size = Pt(22)
        p1.font.bold = True
        p1.font.color.rgb = C_TEXT

        if subtitle:
            p2 = tf.add_paragraph()
            p2.text = subtitle
            p2.font.name = "Calibri"
            p2.font.size = Pt(11)
            p2.font.color.rgb = C_MUTED

    def add_footer(slide):
        footer_box = slide.shapes.add_textbox(Inches(0.8), Inches(7.05), Inches(11.733), Inches(0.35))
        tf = footer_box.text_frame
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = "SPACE-AURA // 2026  •  LIVE GLOBAL DEPLOYMENT: HTTPS://ASTROFORGE-MISSION.SURGE.SH  •  100% CLIENT-SIDE WEBGL (THREE.JS)  •  NASA & ISRO SIMULATOR"
        p.font.name = "Consolas"
        p.font.size = Pt(8.5)
        p.font.color.rgb = RGBColor(100, 116, 139)

    def add_image_card(slide, img_path, left, top, width, height, caption=""):
        # Backing glow frame
        frame = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left - Inches(0.05), top - Inches(0.05), width + Inches(0.1), height + Inches(0.1))
        frame.fill.solid()
        frame.fill.fore_color.rgb = C_CARD
        frame.line.color.rgb = C_CYAN
        frame.line.width = Pt(1.5)

        if os.path.exists(img_path):
            slide.shapes.add_picture(img_path, left, top, width, height)

        if caption:
            cap_box = slide.shapes.add_textbox(left, top + height + Inches(0.05), width, Inches(0.35))
            tf = cap_box.text_frame
            tf.word_wrap = True
            tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
            p = tf.paragraphs[0]
            p.text = caption
            p.font.name = "Consolas"
            p.font.size = Pt(8.5)
            p.font.color.rgb = C_MUTED
            p.alignment = PP_ALIGN.CENTER

    def add_badge(slide, left, top, width, height, text, bg_color=C_CARD_ACC, text_color=C_CYAN):
        badge = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        badge.fill.solid()
        badge.fill.fore_color.rgb = bg_color
        badge.line.color.rgb = text_color
        badge.line.width = Pt(1)
        tf = badge.text_frame
        tf.word_wrap = False
        tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = text
        p.font.name = "Consolas"
        p.font.size = Pt(8.5)
        p.font.bold = True
        p.font.color.rgb = text_color
        p.alignment = PP_ALIGN.CENTER
        return badge

    # ==================== SLIDE 1: TITLE & EXECUTIVE VISION ====================
    s1 = prs.slides.add_slide(blank_layout)
    apply_background(s1)

    # Hero Content Card
    hero_card = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.6), Inches(5.9), Inches(6.15))
    hero_card.fill.solid()
    hero_card.fill.fore_color.rgb = C_CARD
    hero_card.line.color.rgb = C_CYAN
    hero_card.line.width = Pt(1.5)

    tf1 = hero_card.text_frame
    tf1.word_wrap = True
    tf1.margin_left = tf1.margin_top = tf1.margin_right = tf1.margin_bottom = Inches(0.35)

    p = tf1.paragraphs[0]
    p.text = "NASA SPACE APPS CHALLENGE 2026 // FLAGSHIP ENTRY"
    p.font.name = "Consolas"
    p.font.size = Pt(9.5)
    p.font.bold = True
    p.font.color.rgb = C_AMBER

    p = tf1.add_paragraph()
    p.text = "SPACE-AURA"
    p.font.name = "Trebuchet MS"
    p.font.size = Pt(36)
    p.font.bold = True
    p.font.color.rgb = C_TEXT

    p = tf1.add_paragraph()
    p.text = "The Space Mission Architect & 3D Flight Operations Simulator"
    p.font.name = "Calibri"
    p.font.size = Pt(13.5)
    p.font.bold = True
    p.font.color.rgb = C_CYAN

    p = tf1.add_paragraph()
    p.text = "\nEXECUTIVE SUMMARY FOR THE JUDGES:"
    p.font.name = "Consolas"
    p.font.size = Pt(10.5)
    p.font.bold = True
    p.font.color.rgb = C_AMBER

    bullets_s1 = [
        "Dual-Core Aerospace Simulation: Bridges rigorous mathematical systems engineering with authentic 60 FPS real-time 3D orbital spaceflight.",
        "3D Revolving Solar System & Orbital Sunrise: Full heliocentric celestial simulation with 8 revolving planets, Keplerian orbit tracks, and authentic orbital sunrise limb.",
        "Collaborative Concurrent Design: 4-Player NASA Mission Design Lab (MDL) balancing mass margins, daylight power flux, link budgets, and total mission cost.",
        "Real Multi-Stage Rockets: Full staging dispatch physics (Tsiolkovsky rocket equation, MECO, aerodynamic fairing jettison) for NASA SLS, Falcon 9, and ISRO LVM3 'Bahubali'.",
        "Public Permanent Hosting: Live worldwide right now with zero installation at https://astroforge-mission.surge.sh."
    ]
    for b in bullets_s1:
        p = tf1.add_paragraph()
        p.text = f"• {b}"
        p.font.name = "Calibri"
        p.font.size = Pt(9.5)
        p.font.color.rgb = C_TEXT

    p = tf1.add_paragraph()
    p.text = "\nNASA SPACE APPS CHALLENGE 2026  |  Lead Architect: Keerthivardhan"
    p.font.name = "Consolas"
    p.font.size = Pt(8.5)
    p.font.color.rgb = C_MUTED

    # Hero Image on Right
    add_image_card(s1, os.path.join(assets_dir, "slide1_space_aura_hero.png"),
                   Inches(7.0), Inches(0.6), Inches(5.533), Inches(6.15),
                   "Figure 1.1: Live Main Webpage — SPACE-AURA 3D Orbital Sunrise, Tactical Corner HUD & Mission Destination Pills")

    # ==================== SLIDE 2: 3D REVOLVING SOLAR SYSTEM & ORRERY ====================
    s2 = prs.slides.add_slide(blank_layout)
    apply_background(s2)
    add_header(s2, 2, "HELIOCENTRIC CELESTIAL MECHANICS",
               "Full 3D Revolving Solar System & Celestial Orrery",
               "Simulating Keplerian planetary orbits, dynamic solar coronal shaders, asteroid belt, and real-time focus.")
    add_footer(s2)

    card_s2 = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.6), Inches(5.8), Inches(5.2))
    card_s2.fill.solid()
    card_s2.fill.fore_color.rgb = C_CARD
    card_s2.line.color.rgb = C_CYAN
    card_s2.line.width = Pt(1)

    tf2 = card_s2.text_frame
    tf2.word_wrap = True
    tf2.margin_left = tf2.margin_top = tf2.margin_right = tf2.margin_bottom = Inches(0.3)

    p = tf2.paragraphs[0]
    p.text = "PLANETARY MECHANICS & CELESTIAL ARCHITECTURE"
    p.font.name = "Consolas"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = C_AMBER

    text_s2 = [
        "1. Dynamic Coronal Noise Shader (The Sun):",
        "  • Animated FBM perlin noise uniform simulating solar convection granules, coronal mass ejection flares, and limb darkening.",
        "  • High-intensity omnidirectional PointLight (3,500 range) illuminating all planetary bodies.",
        "2. All 8 Orbiting Planets + Moons (Kepler's 3rd Law):",
        "  • Semi-major axis & period relation: T² ∝ a³. Mercury, Venus, Earth with orbiting Moon, Mars, Jupiter with Galilean moons, Saturn with 3D tilted rings, Uranus, and Neptune.",
        "  • Luminous anti-aliased Keplerian orbit track loops showing true orbital geometry.",
        "3. Main Asteroid Belt (2,200 Revolving Rocks):",
        "  • Toroidal belt particles drifting between Mars (1.52 AU) and Jupiter (5.2 AU) with dwarf planet Ceres.",
        "4. Interactive 1-Click Camera Focus (Smooth Lerp):",
        "  • Click any destination pill to smoothly glide camera into orbit around Saturn's rings, Mars, Moon, or return to the Earth orbital sunrise!"
    ]
    for line in text_s2:
        p = tf2.add_paragraph()
        p.text = line
        p.font.name = "Calibri"
        p.font.size = Pt(9.5)
        p.font.color.rgb = C_TEXT if not line.startswith("  ") else C_CYAN

    # Two Stacked Images on Right showcasing the Revolving Sun and 3D Solar System
    add_image_card(s2, os.path.join(assets_dir, "slide2_revolving_sun.png"),
                   Inches(6.9), Inches(1.6), Inches(5.633), Inches(2.45),
                   "Figure 2.1: Live In-Engine Revolving Sun with Animated Coronal Noise Shader & Solar Flares")

    add_image_card(s2, os.path.join(assets_dir, "slide2_solar_system_orrery.png"),
                   Inches(6.9), Inches(4.3), Inches(5.633), Inches(2.45),
                   "Figure 2.2: Live 3D Revolving Solar System with Orbit Tracks, Asteroid Belt & 8 Keplerian Planets")

    # ==================== SLIDE 3: MISSION DESIGN LAB (MDL) ====================
    s3 = prs.slides.add_slide(blank_layout)
    apply_background(s3)
    add_header(s3, 3, "CONCURRENT ENGINEERING & COOPERATIVE ARCHITECTURE",
               "The Mission Design Lab: 4-Player Collaborative Systems Engineering",
               "Modeled after NASA JPL Team X: Empowering students to resolve authentic mass, power, comms, and budget trade-offs.")
    add_footer(s3)

    card_s3 = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.6), Inches(5.8), Inches(5.2))
    card_s3.fill.solid()
    card_s3.fill.fore_color.rgb = C_CARD
    card_s3.line.color.rgb = C_CYAN
    card_s3.line.width = Pt(1)

    tf3 = card_s3.text_frame
    tf3.word_wrap = True
    tf3.margin_left = tf3.margin_top = tf3.margin_right = tf3.margin_bottom = Inches(0.3)

    p = tf3.paragraphs[0]
    p.text = "NASA JPL TEAM X CONCURRENT DESIGN METHODOLOGY"
    p.font.name = "Consolas"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = C_AMBER

    text_s3 = [
        "4 Specialized Team Roles:",
        "  1. Mission Commander: Manages total budget ($32M - $180M), milestone schedule, and mission risk profile.",
        "  2. Flight Dynamics Officer (FDO): Matches target orbit (LEO/SSO/MEO/GEO) with rocket booster Δv and spaceport latitude.",
        "  3. Systems Engineer: Balances mass growth margin (≥15% required), solar panel wattage, and battery Depth-of-Discharge (DoD ≤30%).",
        "  4. Science Payload Director: Allocates payload mass for scientific instruments (SAR radar, coronagraphs, spectrometers, cameras).",
        "Dynamic Constraint Verification Engine:",
        "  • Mass Margin: Dry mass vs. launch vehicle payload capability to target orbit.",
        "  • Power Margin: Solar array generation vs. payload duty cycle during daylight and eclipse.",
        "  • Link Margin: Antenna gain, frequency (X/Ka-band), and ground station line-of-sight.",
        "  • Launches are locked until all engineering constraints evaluate positive!"
    ]
    for line in text_s3:
        p = tf3.add_paragraph()
        p.text = line
        p.font.name = "Calibri"
        p.font.size = Pt(9.5)
        p.font.color.rgb = C_TEXT if not line.startswith("  ") else C_CYAN

    add_image_card(s3, os.path.join(assets_dir, "slide2_mission_design_lab.png"),
                   Inches(6.9), Inches(1.6), Inches(5.633), Inches(5.1),
                   "Figure 3.1: NASA Mission Design Lab (MDL) 4-Player Co-Op Console with Live Constraint Gauges & Loadout Matrix")

    # ==================== SLIDE 4: MULTI-STAGE ROCKET STAGING PHYSICS ====================
    s4 = prs.slides.add_slide(blank_layout)
    apply_background(s4)
    add_header(s4, 4, "PROPULSION & MULTI-STAGE DISPATCH DYNAMICS",
               "Authentic Launch Vehicles & The Physics of Rocket Staging",
               "Shedding structural dead weight through authentic MECO, fairing jettison, and payload separation.")
    add_footer(s4)

    card_s4 = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.6), Inches(5.8), Inches(5.2))
    card_s4.fill.solid()
    card_s4.fill.fore_color.rgb = C_CARD
    card_s4.line.color.rgb = C_CYAN
    card_s4.line.width = Pt(1)

    tf4 = card_s4.text_frame
    tf4.word_wrap = True
    tf4.margin_left = tf4.margin_top = tf4.margin_right = tf4.margin_bottom = Inches(0.3)

    p = tf4.paragraphs[0]
    p.text = "THE TSIOLKOVSKY ROCKET EQUATION: Δv = Isp · g0 · ln(m0 / mf)"
    p.font.name = "Consolas"
    p.font.size = Pt(10.5)
    p.font.bold = True
    p.font.color.rgb = C_AMBER

    text_s4 = [
        "Real Launch Vehicles Modeled in 3D:",
        "  • NASA SLS Artemis Block 1B: 95,000 kg LEO, RS-25 cryogenic core + twin 5-segment SRBs.",
        "  • SpaceX Falcon 9 & Falcon Heavy: Reusable liquid methane/LOX boosters with octagweb engine clusters.",
        "  • ISRO LVM3 ('Bahubali'): Twin massive S200 solid strap-ons + Vikas liquid core + C25 cryogenic upper stage.",
        "  • ISRO PSLV-XL: Workhorse 4-stage solid/liquid configuration with 6 PSOM-XL strap-on boosters.",
        "Interactive Terrestrial Staging Phases:",
        "  1. T-10s Terminal Countdown: Deluge water suppression, ignition sparks, and hold-down clamp release.",
        "  2. Gravity Turn Pitch Program: Gradual aerodynamic pitch steered using [A] / [D] to optimize orbital injection.",
        "  3. Stage 1 MECO & Jettison: Propellant burnout triggers booster separation, shedding 76% of vehicle mass.",
        "  4. Aerodynamic Fairing Jettison: Discards 1,800 kg fairing halves above 105 km once atmosphere thins.",
        "  5. SECO & Payload Release: Second Stage Cutoff at 7,800 m/s releases payload clamps into Keplerian orbit."
    ]
    for line in text_s4:
        p = tf4.add_paragraph()
        p.text = line
        p.font.name = "Calibri"
        p.font.size = Pt(9.5)
        p.font.color.rgb = C_TEXT if not line.startswith("  ") else C_CYAN

    add_image_card(s4, os.path.join(assets_dir, "slide3_rocket_staging.png"),
                   Inches(6.9), Inches(1.6), Inches(5.633), Inches(5.1),
                   "Figure 4.1: Vehicle Assembly Hangar (VAB) 3D Multi-Stage Rocket Inspection with Staging Timeline & Fairing Cutaway")

    # ==================== SLIDE 5: PHOTOREALISTIC 3D EARTH & SHADER PIPELINE ====================
    s5 = prs.slides.add_slide(blank_layout)
    apply_background(s5)
    add_header(s5, 5, "GRAPHICAL EXCELLENCE & PLANETARY CARTOGRAPHY",
               "NASA 4K Blue Marble Topography & Advanced PBR Shader Pipeline",
               "Matching Astra Nexus clarity: elevation bump relief, ocean specular sheen, nocturnal city lights, and Rayleigh limb glow.")
    add_footer(s5)

    card_s5 = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.6), Inches(5.8), Inches(5.2))
    card_s5.fill.solid()
    card_s5.fill.fore_color.rgb = C_CARD
    card_s5.line.color.rgb = C_CYAN
    card_s5.line.width = Pt(1)

    tf5 = card_s5.text_frame
    tf5.word_wrap = True
    tf5.margin_left = tf5.margin_top = tf5.margin_right = tf5.margin_bottom = Inches(0.3)

    p = tf5.paragraphs[0]
    p.text = "PHOTOREALISTIC 3D SHADER ENGINEERING"
    p.font.name = "Consolas"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = C_AMBER

    text_s5 = [
        "1. NASA 4K Blue Marble Topography & Bump Relief:",
        "  • SphereGeometry(radius, 192, 128) for ultra-smooth circular planetary limb without faceting.",
        "  • Integrated NASA elevation relief mapping (bumpScale: 1.6) and roughness/specular ocean reflection maps.",
        "2. Smoothstep Day/Night Terminator Shader:",
        "  • Injected custom fragment chunk: dot(normal, lightDir) evaluated across terminator.",
        "  • smoothstep(0.12, -0.18, nxl) dynamically illuminates nocturnal city lights in warm amber (0xffd59e) with 0 bleeding into daytime.",
        "3. Rayleigh Atmospheric Scattering Limb Glow:",
        "  • Inverted Fresnel BackSide limb glow shader combined with 4 concentric Rayleigh haze shells (r = 1.04 to 1.16).",
        "4. Spacecraft PBR Materials:",
        "  • Procedural silicon wafer solar cells with micro-busbars, Kapton gold thermal MLI foil, and Lathe parabolic dish antennas."
    ]
    for line in text_s5:
        p = tf5.add_paragraph()
        p.text = line
        p.font.name = "Calibri"
        p.font.size = Pt(9.5)
        p.font.color.rgb = C_TEXT if not line.startswith("  ") else C_CYAN

    add_image_card(s5, os.path.join(assets_dir, "slide5_photorealistic_earth.png"),
                   Inches(6.9), Inches(1.6), Inches(5.633), Inches(5.1),
                   "Figure 5.1: High-Resolution 4K Blue Marble Earth Surface, Smoothstep Night City Lights & Rayleigh Atmospheric Envelope")

    # ==================== SLIDE 6: 3D FLIGHT ARENA & ORBITAL OPERATIONS ====================
    s6 = prs.slides.add_slide(blank_layout)
    apply_background(s6)
    add_header(s6, 6, "IN-FLIGHT PHYSICS & SPACE DOMAIN AWARENESS",
               "Orbital Cockpit Operations: Solar Alignment, Laser Downlink & Collision Alerts",
               "Demystifying photovoltaic cosine flux, optical telemetry flushes, and real-time space debris conjunction avoidance.")
    add_footer(s6)

    card_s6 = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.6), Inches(5.8), Inches(5.2))
    card_s6.fill.solid()
    card_s6.fill.fore_color.rgb = C_CARD
    card_s6.line.color.rgb = C_CYAN
    card_s6.line.width = Pt(1)

    tf6 = card_s6.text_frame
    tf6.word_wrap = True
    tf6.margin_left = tf6.margin_top = tf6.margin_right = tf6.margin_bottom = Inches(0.3)

    p = tf6.paragraphs[0]
    p.text = "AUTHENTIC REAL-TIME IN-ORBIT OPERATIONS"
    p.font.name = "Consolas"
    p.font.size = Pt(10.5)
    p.font.bold = True
    p.font.color.rgb = C_AMBER

    text_s6 = [
        "1. Solar Panel Cosine Efficiency (P = Pmax · cos θ):",
        "  • Solar wings generate power only when oriented towards the Sun. In eclipse or edge-on, generation drops to 0W.",
        "  • HUD Solar Compass: Real-time readout (e.g. 89% [+213W]). Pressing [S] engages ADCS attitude autopilot to lock 100% solar flux.",
        "2. Telemetry Downlinking via High-Frequency Laser:",
        "  • Scientific observations fill the onboard Solid-State Data Recorder (SSDR). Pressing [T] fires a high-bandwidth cyan data laser to NASA DSN / ISRO ISTRAC.",
        "3. Nadir Sensor Swath Tracker ('Line-of-Sight Cone'):",
        "  • Explains why scans fail when empty: Earth observation instruments look straight down in a conical ground swath. Live tracker pulses green when over target!",
        "4. 3D Satellite Conjunction & Collision Alerts:",
        "  • Tracks active satellites and debris. Emergency deflector shield [Q] deflects close approaches (+100 XP evasion bonus)!"
    ]
    for line in text_s6:
        p = tf6.add_paragraph()
        p.text = line
        p.font.name = "Calibri"
        p.font.size = Pt(9.5)
        p.font.color.rgb = C_TEXT if not line.startswith("  ") else C_CYAN

    add_image_card(s6, os.path.join(assets_dir, "slide6_flight_arena_cockpit.png"),
                   Inches(6.9), Inches(1.6), Inches(5.633), Inches(5.1),
                   "Figure 6.1: 60 FPS 3D Cockpit Arena with Solar Compass, Swath Distance Tracker, Laser Downlink & Flight Command Bar")

    # ==================== SLIDE 7: REAL CAMPAIGNS & GLOBAL DEPLOYMENT ====================
    s7 = prs.slides.add_slide(blank_layout)
    apply_background(s7)
    add_header(s7, 7, "MISSION DIRECTORY & GLOBAL IMPACT",
               "6 Real NASA & ISRO Flagship Campaigns & Permanent Public Access",
               "Inspiring the next generation of aerospace engineers through accessible, browser-native space exploration.")
    add_footer(s7)

    # Left Column: Missions
    card_s7_l = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.6), Inches(5.8), Inches(5.2))
    card_s7_l.fill.solid()
    card_s7_l.fill.fore_color.rgb = C_CARD
    card_s7_l.line.color.rgb = C_CYAN
    card_s7_l.line.width = Pt(1)

    tf7_l = card_s7_l.text_frame
    tf7_l.word_wrap = True
    tf7_l.margin_left = tf7_l.margin_top = tf7_l.margin_right = tf7_l.margin_bottom = Inches(0.3)

    p = tf7_l.paragraphs[0]
    p.text = "6 REAL NASA & ISRO FLAGSHIP MISSIONS"
    p.font.name = "Consolas"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = C_AMBER

    missions = [
        ("Mission 01: NASA-ISRO NISAR", "Dual L/S-band SAR mapping Himalayan glaciers, tectonic faults, and biomass."),
        ("Mission 02: ISRO CHANDRAYAAN-3", "Lunar South Pole soft-landing with ChaSTE thermal probe & Pragyan rover."),
        ("Mission 03: ISRO ADITYA-L1", "Sun-Earth L1 halo orbit solar coronagraph measuring CME solar storm dynamics."),
        ("Mission 04: ISRO MANGALYAAN (MOM)", "Martian exosphere methane mapping and global atmospheric escape telemetry."),
        ("Mission 05: NASA ARTEMIS II & ORION", "Crewed trans-lunar injection (TLI) evaluating deep space life support."),
        ("Mission 06: NASA/ESA/CSA JWST", "Deployable 6.5m beryllium-gold mirror at L2 unravelling cosmic origins.")
    ]
    for title_m, desc_m in missions:
        p = tf7_l.add_paragraph()
        p.text = f"• {title_m}"
        p.font.name = "Trebuchet MS"
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = C_CYAN

        p_desc = tf7_l.add_paragraph()
        p_desc.text = f"  {desc_m}"
        p_desc.font.name = "Calibri"
        p_desc.font.size = Pt(8.5)
        p_desc.font.color.rgb = C_TEXT

    # Right Column: Architecture & Links
    card_s7_r = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.9), Inches(1.6), Inches(5.633), Inches(5.2))
    card_s7_r.fill.solid()
    card_s7_r.fill.fore_color.rgb = C_CARD
    card_s7_r.line.color.rgb = C_EMERALD
    card_s7_r.line.width = Pt(1)

    tf7_r = card_s7_r.text_frame
    tf7_r.word_wrap = True
    tf7_r.margin_left = tf7_r.margin_top = tf7_r.margin_right = tf7_r.margin_bottom = Inches(0.3)

    p = tf7_r.paragraphs[0]
    p.text = "TECHNICAL ARCHITECTURE & ACCESS"
    p.font.name = "Consolas"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = C_EMERALD

    text_arch = [
        "100% Client-Side WebGL Architecture:",
        "  • Zero Installation: Runs in any modern web browser on desktop, laptop, tablet, or interactive whiteboard.",
        "  • Sub-Second Load Time: Zero backend compilation delay; all shaders and geometries generated in real-time via Three.js r128.",
        "  • NASA Open Standards: Concept Maturity Levels (CML 1-9), Tsiolkovsky staging, and WGS84 coordinates.",
        "Permanent Global Public Deployment:",
        "  • Live URL: https://astroforge-mission.surge.sh",
        "  • Interactive Pitch Deck: https://astroforge-mission.surge.sh/pitch_deck.html",
        "  • Direct PPTX Download: https://astroforge-mission.surge.sh/SPACE_AURA_NASA_SPACE_APPS_PITCH_DECK.pptx",
        "GitHub Open-Source Repository:",
        "  • Repository: https://github.com/Keerthivardhan08/space-aura",
        "  • Architecture: Pure ES6 modular architecture across 50+ files with full systems engineering math."
    ]
    for line in text_arch:
        p = tf7_r.add_paragraph()
        p.text = line
        p.font.name = "Calibri"
        p.font.size = Pt(9.5)
        p.font.color.rgb = C_TEXT if not line.startswith("  ") else C_CYAN

    # Save presentation
    output_path = r"d:\space app\SPACE_AURA_NASA_SPACE_APPS_PITCH_DECK.pptx"
    prs.save(output_path)
    # Also save a copy with the legacy filename for backwards compatibility
    prs.save(r"d:\space app\ASTROFORGE_NASA_SPACE_APPS_PITCH_DECK.pptx")
    print(f"PowerPoint successfully created at: {output_path}")

if __name__ == "__main__":
    create_space_aura_deck()
