import os
import pptx
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def create_astroforge_deck():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6] # blank slide

    # Color Palette
    C_BG = RGBColor(6, 11, 23)        # #060b17 Deep Cosmic Navy
    C_CARD = RGBColor(15, 23, 42)     # #0f172a Slate Surface
    C_BORDER = RGBColor(56, 189, 248) # #38bdf8 Cyan
    C_AMBER = RGBColor(245, 158, 11)  # #f59e0b Amber
    C_EMERALD = RGBColor(16, 185, 129)# #10b981 Emerald
    C_PURPLE = RGBColor(139, 92, 246) # #8b5cf6 Purple
    C_TEXT = RGBColor(248, 250, 252)  # #f8fafc Crisp White
    C_MUTED = RGBColor(148, 163, 184) # #94a3b8 Slate Light
    C_ACCENT = RGBColor(6, 182, 212)  # #06b6d4 Sky

    assets_dir = r"d:\space app\presentation_assets"

    def apply_background(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = C_BG
        bg.line.fill.background()

    def add_header(slide, slide_num, category, title, subtitle):
        # Header Box
        header_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.733), Inches(1.1))
        tf = header_box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        # Category / Number Pill
        p0 = tf.paragraphs[0]
        p0.text = f"NASA SPACE APPS CHALLENGE 2026  //  SLIDE {slide_num:02d} OF 07  //  {category.upper()}"
        p0.font.name = "Consolas"
        p0.font.size = Pt(10)
        p0.font.bold = True
        p0.font.color.rgb = C_BORDER

        # Main Title
        p1 = tf.add_paragraph()
        p1.text = title
        p1.font.name = "Trebuchet MS"
        p1.font.size = Pt(22)
        p1.font.bold = True
        p1.font.color.rgb = C_TEXT

        # Subtitle
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
        p.text = "ASTROFORGE  •  LIVE GLOBAL DEPLOYMENT: HTTPS://ASTROFORGE-MISSION.SURGE.SH  •  100% CLIENT-SIDE WEBGL (THREE.JS)  •  KEPLERIAN FLIGHT SIMULATOR"
        p.font.name = "Consolas"
        p.font.size = Pt(8.5)
        p.font.color.rgb = RGBColor(100, 116, 139)

    def add_image_card(slide, img_path, left, top, width, height, caption=""):
        # Backing glow frame
        frame = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left - Inches(0.06), top - Inches(0.06), width + Inches(0.12), height + Inches(0.12))
        frame.fill.solid()
        frame.fill.fore_color.rgb = RGBColor(15, 23, 42)
        frame.line.color.rgb = C_BORDER
        frame.line.width = Pt(1.5)

        # Image
        if os.path.exists(img_path):
            slide.shapes.add_picture(img_path, left, top, width, height)

        # Caption
        if caption:
            cap_box = slide.shapes.add_textbox(left, top + height + Inches(0.06), width, Inches(0.35))
            tf = cap_box.text_frame
            tf.word_wrap = True
            tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
            p = tf.paragraphs[0]
            p.text = caption
            p.font.name = "Consolas"
            p.font.size = Pt(8.5)
            p.font.color.rgb = C_MUTED
            p.alignment = PP_ALIGN.CENTER

    # ==================== SLIDE 1: TITLE & EXECUTIVE VISION ====================
    s1 = prs.slides.add_slide(blank_layout)
    apply_background(s1)

    # Hero Banner
    hero_card = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.6), Inches(6.0), Inches(6.1))
    hero_card.fill.solid()
    hero_card.fill.fore_color.rgb = C_CARD
    hero_card.line.color.rgb = C_BORDER
    hero_card.line.width = Pt(1.5)

    tf1 = hero_card.text_frame
    tf1.word_wrap = True
    tf1.margin_left = tf1.margin_top = tf1.margin_right = tf1.margin_bottom = Inches(0.35)

    p = tf1.paragraphs[0]
    p.text = "NASA SPACE APPS CHALLENGE 2026 // COMPETITION ENTRY"
    p.font.name = "Consolas"
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = C_AMBER

    p = tf1.add_paragraph()
    p.text = "ASTROFORGE"
    p.font.name = "Trebuchet MS"
    p.font.size = Pt(36)
    p.font.bold = True
    p.font.color.rgb = C_TEXT

    p = tf1.add_paragraph()
    p.text = "Interactive Space Mission Design Architecture, Real Rocket Staging & 3D Orbital Flight Game"
    p.font.name = "Calibri"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = C_BORDER

    p = tf1.add_paragraph()
    p.text = "\nEXECUTIVE SUMMARY FOR THE JUDGES:"
    p.font.name = "Consolas"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = C_AMBER

    bullets_s1 = [
        "Challenge Response: A high-fidelity interactive simulation platform bridging mathematical mission systems engineering with real-time 60 FPS 3D spaceflight action.",
        "Dual-Core Architecture: Combines the strategic 4-Player NASA Mission Design Lab (budget, mass, power, comms) with an authentic Terrestrial Launch Pad & Orbital Arena.",
        "Real Flight Hardware: Authentic 3D models of NASA SLS, Falcon 9/Heavy, and ISRO Flagships (LVM3 'Bahubali' & PSLV-XL) with full multi-stage dispatch physics.",
        "6 Real NASA & ISRO Missions: NISAR Earth radar, Chandrayaan-3, Aditya-L1, Mangalyaan, Artemis II Orion, and the James Webb Space Telescope (JWST).",
        "Public Permanent Hosting: Live right now globally with zero installation at https://astroforge-mission.surge.sh."
    ]
    for b in bullets_s1:
        p = tf1.add_paragraph()
        p.text = f"• {b}"
        p.font.name = "Calibri"
        p.font.size = Pt(10)
        p.font.color.rgb = C_TEXT

    p = tf1.add_paragraph()
    p.text = "\nArchitect & Lead Engineer: Keerthivardhan  |  Stack: Pure WebGL, Three.js, ES6"
    p.font.name = "Consolas"
    p.font.size = Pt(9.5)
    p.font.color.rgb = C_MUTED

    # Hero Image on Right
    add_image_card(s1, os.path.join(assets_dir, "slide1_hero_cockpit.png"),
                   Inches(7.1), Inches(0.6), Inches(5.4), Inches(6.1),
                   "Figure 1.1: Live 60 FPS 3D Cockpit HUD with Photorealistic Earth, Active Laser Downlink & Sun Alignment Compass")

    # ==================== SLIDE 2: NASA CHALLENGE & MISSION DESIGN LAB ====================
    s2 = prs.slides.add_slide(blank_layout)
    apply_background(s2)
    add_header(s2, 2, "CHALLENGE OBJECTIVE & COOPERATIVE ARCHITECTURE",
               "The Mission Design Lab: 4-Player Collaborative Systems Engineering",
               "Empowering students and teams to tackle authentic engineering trade-offs under rigid physical and fiscal constraints.")
    add_footer(s2)

    card_s2 = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.6), Inches(5.8), Inches(5.2))
    card_s2.fill.solid()
    card_s2.fill.fore_color.rgb = C_CARD
    card_s2.line.color.rgb = C_BORDER
    card_s2.line.width = Pt(1)

    tf2 = card_s2.text_frame
    tf2.word_wrap = True
    tf2.margin_left = tf2.margin_top = tf2.margin_right = tf2.margin_bottom = Inches(0.3)

    p = tf2.paragraphs[0]
    p.text = "THE PROBLEM: WHY TRADITIONAL SPACE GAMES FAIL"
    p.font.name = "Consolas"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = C_AMBER

    text_s2 = [
        "Abstract Silos: Most aerospace education teaches equations without spatial visualization, while games ignore real launch vehicle mass limits and power constraints.",
        "Collaborative Space Teams: In real missions, no engineer works alone. ASTROFORGE implements 4-Player Real-Time Co-Op with distinct aerospace roles:",
        "  1. Mission Commander: Manages total budget ($32M - $180M), timeline, and objectives.",
        "  2. Flight Dynamics Officer: Selects launch vehicle, spaceport latitude, and orbital inclination.",
        "  3. Systems Engineer: Balances spacecraft mass margins, solar wattage, and battery capacity.",
        "  4. Science Payload Director: Allocates payload mass for SAR radar, coronagraphs, and spectrometers.",
        "Dynamic Constraint Verification: Real-time calculation of Mass Margin (kg), Power Balance (W vs solar flux), and Link Budget (Data Rate vs antenna gain). Launches are locked until all engineering constraints evaluate positive!"
    ]
    for line in text_s2:
        p = tf2.add_paragraph()
        p.text = line
        p.font.name = "Calibri"
        p.font.size = Pt(10)
        p.font.color.rgb = C_TEXT if not line.startswith("  ") else C_BORDER

    add_image_card(s2, os.path.join(assets_dir, "slide2_mission_design_lab.png"),
                   Inches(6.9), Inches(1.6), Inches(5.6), Inches(5.1),
                   "Figure 2.1: NASA Mission Design Lab (MDL) 4-Player Co-Op Console with Live Constraint Gauges & Loadout Matrix")

    # ==================== SLIDE 3: MULTI-STAGE ROCKETS & STAGING PHYSICS ====================
    s3 = prs.slides.add_slide(blank_layout)
    apply_background(s3)
    add_header(s3, 3, "PROPULSION & MULTI-STAGE DISPATCH DYNAMICS",
               "Authentic Launch Vehicles & The Physics of Rocket Staging",
               "Shedding structural dead weight through authentic MECO, fairing jettison, and payload separation.")
    add_footer(s3)

    card_s3 = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.6), Inches(5.8), Inches(5.2))
    card_s3.fill.solid()
    card_s3.fill.fore_color.rgb = C_CARD
    card_s3.line.color.rgb = C_BORDER
    card_s3.line.width = Pt(1)

    tf3 = card_s3.text_frame
    tf3.word_wrap = True
    tf3.margin_left = tf3.margin_top = tf3.margin_right = tf3.margin_bottom = Inches(0.3)

    p = tf3.paragraphs[0]
    p.text = "THE TSIOLKOVSKY ROCKET EQUATION IN ACTION: Δv = Isp · g0 · ln(m0 / mf)"
    p.font.name = "Consolas"
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = C_AMBER

    text_s3 = [
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
    for line in text_s3:
        p = tf3.add_paragraph()
        p.text = line
        p.font.name = "Calibri"
        p.font.size = Pt(9.5)
        p.font.color.rgb = C_TEXT if not line.startswith("  ") else C_BORDER

    add_image_card(s3, os.path.join(assets_dir, "slide3_rocket_staging.png"),
                   Inches(6.9), Inches(1.6), Inches(5.6), Inches(5.1),
                   "Figure 3.1: Assembly Hangar 3D Multi-Stage Rocket Inspection with Staging Indicators & ISRO/NASA Liveries")

    # ==================== SLIDE 4: PHOTOREALISTIC 3D EARTH & CELESTIAL ORRERY ====================
    s4 = prs.slides.add_slide(blank_layout)
    apply_background(s4)
    add_header(s4, 4, "ASTRONOMICAL ACCURACY & PLANETARY CARTOGRAPHY",
               "Photorealistic 3D Earth, 12 Constellations & Solar System Orrery",
               "Real planetary terrain textures, specular water maps, Rayleigh rim sunset shaders, and true celestial coordinates.")
    add_footer(s4)

    card_s4 = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.6), Inches(5.6), Inches(5.2))
    card_s4.fill.solid()
    card_s4.fill.fore_color.rgb = C_CARD
    card_s4.line.color.rgb = C_BORDER
    card_s4.line.width = Pt(1)

    tf4 = card_s4.text_frame
    tf4.word_wrap = True
    tf4.margin_left = tf4.margin_top = tf4.margin_right = tf4.margin_bottom = Inches(0.3)

    p = tf4.paragraphs[0]
    p.text = "GEOGRAPHIC & ASTRONOMICAL PRECISION"
    p.font.name = "Consolas"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = C_AMBER

    text_s4 = [
        "Photorealistic 3D Earth Shader Pipeline:",
        "  • Continental Geometry: Geographically accurate vector polygons representing the Indian subcontinent, Sri Lanka, Himalayas, African Rift, Mediterranean, and the Americas.",
        "  • Specular Water Roughness: Ocean water reflects sunlight with sharp specular sheen while dry land remains matte.",
        "  • Night City Corridors: Realistic golden amber city light networks illuminate Mumbai, Gangetic plain, East Asia, and Europe.",
        "  • Atmospheric Scattering: 23.44° axial tilt combined with a Rayleigh rim sunset shader providing radiant limb glows.",
        "True Celestial Sphere (12 Constellations):",
        "  • Stars mapped using real Right Ascension (RA) and Declination (Dec) coordinates: Ursa Major, Orion, Cassiopeia, Pegasus, Scorpius, Cygnus.",
        "Full 8-Planet Solar System Orrery:",
        "  • Press [M] to toggle grand heliocentric view: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune with Keplerian orbital velocities."
    ]
    for line in text_s4:
        p = tf4.add_paragraph()
        p.text = line
        p.font.name = "Calibri"
        p.font.size = Pt(9.5)
        p.font.color.rgb = C_TEXT if not line.startswith("  ") else C_BORDER

    add_image_card(s4, os.path.join(assets_dir, "slide4_photorealistic_earth.png"),
                   Inches(6.7), Inches(1.6), Inches(2.85), Inches(5.1),
                   "Figure 4.1: High-Res Vector Continents & Specular Ocean")

    add_image_card(s4, os.path.join(assets_dir, "slide4_solar_system_orrery.png"),
                   Inches(9.75), Inches(1.6), Inches(2.85), Inches(5.1),
                   "Figure 4.2: Real Constellations & Solar System Orrery")

    # ==================== SLIDE 5: IN-FLIGHT SUBSYSTEMS & ARCADE HUD ====================
    s5 = prs.slides.add_slide(blank_layout)
    apply_background(s5)
    add_header(s5, 5, "ORBITAL OPERATIONS & SUBSYSTEM TELEMETRY",
               "In-Flight Physics: Solar Alignment, Laser Downlink & Sensor Swaths",
               "Demystifying photovoltaic cosine efficiency, solid-state buffer flushes, and nadir ground footprints.")
    add_footer(s5)

    card_s5 = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.6), Inches(5.8), Inches(5.2))
    card_s5.fill.solid()
    card_s5.fill.fore_color.rgb = C_CARD
    card_s5.line.color.rgb = C_BORDER
    card_s5.line.width = Pt(1)

    tf5 = card_s5.text_frame
    tf5.word_wrap = True
    tf5.margin_left = tf5.margin_top = tf5.margin_right = tf5.margin_bottom = Inches(0.3)

    p = tf5.paragraphs[0]
    p.text = "SOLVING KEY REAL-WORLD SPACE OPERATIONAL CHALLENGES"
    p.font.name = "Consolas"
    p.font.size = Pt(10.5)
    p.font.bold = True
    p.font.color.rgb = C_AMBER

    text_s5 = [
        "1. Solar Panel Alignment (P = Pmax · cos θ):",
        "  • Photovoltaic wings generate power only when oriented towards the Sun. When edge-on or in Earth eclipse, generation drops to 0W.",
        "  • HUD Solar Compass: Real-time flux readout (e.g. 89% [+213W]). Pressing [S] instantly commands ADCS attitude slewing to lock 100% solar flux.",
        "2. Telemetry Downlinking via Optical Laser:",
        "  • Scientific observations fill the onboard Solid-State Data Recorder (SSDR). Pressing [T] establishes a high-frequency cyan data laser down to Earth (ISRO ISTRAC / NASA DSN), earning science score.",
        "3. Nadir Sensor Swath Tracker ('Line-of-Sight Cone'):",
        "  • Explains why scans fail when empty: Earth observation instruments look straight down in a conical ground swath.",
        "  • Live Swath Tracker: Tracks upcoming target (e.g. Himalayan Glaciers) with live distance in km and countdown, pulsing green when in range!"
    ]
    for line in text_s5:
        p = tf5.add_paragraph()
        p.text = line
        p.font.name = "Calibri"
        p.font.size = Pt(9.5)
        p.font.color.rgb = C_TEXT if not line.startswith("  ") else C_BORDER

    add_image_card(s5, os.path.join(assets_dir, "slide5_cockpit_subsystems.png"),
                   Inches(6.9), Inches(1.6), Inches(5.6), Inches(5.1),
                   "Figure 5.1: Arcade Gaming Cockpit Visor with Solar Compass, Swath Tracker, Downlink Laser & Bottom Action Dock")

    # ==================== SLIDE 6: ORBITAL MECHANICS & SATELLITE CONJUNCTIONS ====================
    s6 = prs.slides.add_slide(blank_layout)
    apply_background(s6)
    add_header(s6, 6, "SPACE DOMAIN AWARENESS & KEPLERIAN DYNAMICS",
               "Why Satellites Drift, Orbit Lock Autopilot & Conjunction Alerts",
               "Understanding Keplerian free-fall geodesics, space debris mitigation, and emergency deflector shielding.")
    add_footer(s6)

    card_s6 = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.6), Inches(5.8), Inches(5.2))
    card_s6.fill.solid()
    card_s6.fill.fore_color.rgb = C_CARD
    card_s6.line.color.rgb = C_BORDER
    card_s6.line.width = Pt(1)

    tf6 = card_s6.text_frame
    tf6.word_wrap = True
    tf6.margin_left = tf6.margin_top = tf6.margin_right = tf6.margin_bottom = Inches(0.3)

    p = tf6.paragraphs[0]
    p.text = "ORBITAL MECHANICS & SPACE TRAFFIC CONGESTION"
    p.font.name = "Consolas"
    p.font.size = Pt(10.5)
    p.font.bold = True
    p.font.color.rgb = C_AMBER

    text_s6 = [
        "1. Why Doesn't a Satellite 'Follow the Road'?:",
        "  • Satellites coast in free-fall along gravitational geodesics (v = √(GM / r)).",
        "  • Thrusting with [W] burns Δv (orbital energy), expanding the semi-major axis away from the nominal path. Inexperienced students learn this first-hand!",
        "  • 'Orbit Lock' Autopilot [O]: Cruising autopilot holds nominal green mission path; players can toggle to manual drift anytime.",
        "2. Real 3D Satellite Conjunction & Collision System:",
        "  • 3D Active Satellites: IRIDIUM-33, COSMOS-2251 Derelict, ENVISAT, STARLINK-2048, and booster debris with pulsing anti-collision strobes.",
        "  • Proximity Klaxon: Alerts when a satellite closes within 500m.",
        "  • Deflector Shield [Q]: Deflects close approaches with an energy flare (+100 Evasion XP); unshielded impacts inflict -35% hull loss!"
    ]
    for line in text_s6:
        p = tf6.add_paragraph()
        p.text = line
        p.font.name = "Calibri"
        p.font.size = Pt(9.5)
        p.font.color.rgb = C_TEXT if not line.startswith("  ") else C_BORDER

    add_image_card(s6, os.path.join(assets_dir, "slide6_orbital_conjunction.png"),
                   Inches(6.9), Inches(1.6), Inches(5.6), Inches(5.1),
                   "Figure 6.1: Close-up 3D Spacecraft Inspection, Flashing Satellite Conjunction Alert & Nighttime City Corridor")

    # ==================== SLIDE 7: REAL MISSIONS & PUBLIC DEPLOYMENT ====================
    s7 = prs.slides.add_slide(blank_layout)
    apply_background(s7)
    add_header(s7, 7, "MISSION DIRECTORY & GLOBAL IMPACT",
               "6 Real NASA & ISRO Flagship Campaigns & Permanent Public Access",
               "Inspiring the next generation of aerospace engineers through accessible, browser-native space exploration.")
    add_footer(s7)

    # Left Column: Missions
    card_s7_l = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.6), Inches(5.7), Inches(5.2))
    card_s7_l.fill.solid()
    card_s7_l.fill.fore_color.rgb = C_CARD
    card_s7_l.line.color.rgb = C_BORDER
    card_s7_l.line.width = Pt(1)

    tf7_l = card_s7_l.text_frame
    tf7_l.word_wrap = True
    tf7_l.margin_left = tf7_l.margin_top = tf7_l.margin_right = tf7_l.margin_bottom = Inches(0.3)

    p = tf7_l.paragraphs[0]
    p.text = "AUTHENTIC NASA & ISRO FLAGSHIP CAMPAIGNS"
    p.font.name = "Consolas"
    p.font.size = Pt(10.5)
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
        p.font.size = Pt(9.5)
        p.font.bold = True
        p.font.color.rgb = C_BORDER

        p_desc = tf7_l.add_paragraph()
        p_desc.text = f"  {desc_m}"
        p_desc.font.name = "Calibri"
        p_desc.font.size = Pt(8.5)
        p_desc.font.color.rgb = C_TEXT

    # Right Column: Deployment & Verdict
    card_s7_r = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.6), Inches(5.7), Inches(5.2))
    card_s7_r.fill.solid()
    card_s7_r.fill.fore_color.rgb = C_CARD
    card_s7_r.line.color.rgb = C_EMERALD
    card_s7_r.line.width = Pt(1)

    tf7_r = card_s7_r.text_frame
    tf7_r.word_wrap = True
    tf7_r.margin_left = tf7_r.margin_top = tf7_r.margin_right = tf7_r.margin_bottom = Inches(0.3)

    p = tf7_r.paragraphs[0]
    p.text = "PERMANENT GLOBAL DEPLOYMENT & METRICS"
    p.font.name = "Consolas"
    p.font.size = Pt(10.5)
    p.font.bold = True
    p.font.color.rgb = C_EMERALD

    metrics = [
        "🌐 Permanent Live URL: https://astroforge-mission.surge.sh",
        "⚡ Zero Install / Zero Tunneling: Pure static ES module architecture served on global CDN edge nodes across 10 regions.",
        "🎮 60 FPS WebGL Performance: Custom procedural geometry, low-overhead Three.js rendering, and audio synthesized via Web Audio API.",
        "🔬 Educational Efficacy: Students learn systems engineering trade-offs (mass vs power vs budget), orbital velocity equations, and operational procedures.",
        "👥 4-Player Teamwork: Collaborative multiplayer role assignment for team challenges and hackathon judging.",
        "🏆 Ready for Judging: Fully functional, complete documentation, git version-controlled, and ready to play right now on any browser or tablet!"
    ]
    for m in metrics:
        p = tf7_r.add_paragraph()
        p.text = f"{m}\n"
        p.font.name = "Calibri"
        p.font.size = Pt(10)
        p.font.color.rgb = C_TEXT

    p_end = tf7_r.add_paragraph()
    p_end.text = "THANK YOU TO THE NASA SPACE APPS CHALLENGE JUDGES!"
    p_end.font.name = "Consolas"
    p_end.font.size = Pt(11)
    p_end.font.bold = True
    p_end.font.color.rgb = C_AMBER
    p_end.alignment = PP_ALIGN.CENTER

    # Save Presentation
    output_path = r"d:\space app\ASTROFORGE_NASA_SPACE_APPS_PITCH_DECK.pptx"
    prs.save(output_path)
    print(f"Presentation successfully created at: {output_path} ({os.path.getsize(output_path):,} bytes)")

if __name__ == "__main__":
    create_astroforge_deck()
