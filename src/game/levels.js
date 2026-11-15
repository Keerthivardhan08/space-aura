/**
 * ASTROFORGE: Space Mission Design Game - Campaign Missions & Levels
 */

export const CAMPAIGN_LEVELS = [
  {
    id: 'level_1',
    levelNumber: 1,
    title: 'MISSION 01: NASA-ISRO NISAR',
    subtitle: 'Dual-Frequency L/S-Band SweepSAR Earth System Observatory',
    targetBody: 'Earth',
    badge: 'NASA-ISRO PARTNERSHIP',
    story: 'Command the historic joint flagship mission between NASA and ISRO! Launch from Satish Dhawan Space Centre (Sriharikota) into Sun-Synchronous Polar Orbit (SSO). Deploy the massive 12-meter SweepSAR radar reflector. Use dual L-band (JPL) and S-band (ISRO) radar to measure tectonic plate creep along the Himalayas, track Antarctic ice sheet loss, and monitor coastal mangrove ecosystems.',
    timeLimitSec: 100,
    objectives: [
      { id: 'obj_charge', text: 'Deploy solar wings & calibrate dual-frequency SweepSAR radar', done: false },
      { id: 'obj_orbit', text: 'Maintain stable 747 km Sun-Synchronous Polar Orbit', done: false },
      { id: 'obj_downlink', text: 'Downlink 15.0 GB radar interferometry data to ISRO & NASA networks', done: false }
    ],
    starThresholds: {
      star1: 'Complete Sun-Synchronous orbit insertion',
      star2: 'Scan Himalayan glacier & San Andreas fault',
      star3: 'Downlink 15 GB radar data with >75% battery'
    },
    hazards: ['High Radar Power Pulse Load', 'Polar Day/Night Eclipse Cycles'],
    recommendedParts: {
      bus: 'bus_espa_medium',
      engine: 'prop_hydrazine_monoprop',
      power: 'pwr_large_articulated',
      sensor: 'inst_sar_radar'
    },
    targetColor: '#0284c7',
    targetAtmosphere: '#38bdf8',
    rewardStars: 3,
    rewardCredits: 800,
    researchField: 'Synthetic Aperture Radar Interferometry (InSAR) & Earth Geophysics',
    researchHypothesis: 'Dual-frequency L-band (24 cm) and S-band (9 cm) SweepSAR achieves sub-centimeter crustal deformation mapping and biomass canopy penetration regardless of cloud cover.',
    researchTargets: [
      { lat: 35.8, lon: 76.5, label: 'HIMALAYAN KARAKORAM GLACIERS', discovery: 'Glacial surge velocity measured at 4.2 mm/day; seasonal meltwater storage quantified!' },
      { lat: 35.2, lon: -119.5, label: 'SAN ANDREAS FAULT SYSTEM', discovery: 'Sub-centimeter interseismic strain accumulation mapped along creeping tectonic segment.' },
      { lat: 21.9, lon: 89.0, label: 'SUNDARBANS MANGROVE ECOSYSTEM', discovery: 'Above-ground forest biomass density calibrated through persistent monsoonal cloud cover.' }
    ]
  },
  {
    id: 'level_2',
    levelNumber: 2,
    title: 'MISSION 02: ISRO CHANDRAYAAN-3',
    subtitle: 'Lunar South Pole Volatiles & Shiv Shakti Point In-Situ Science',
    targetBody: 'Moon',
    badge: 'ISRO LUNAR TRIUMPH',
    story: 'Recreate ISRO’s historic lunar South Pole landing! Launched aboard the mighty LVM3-M4 rocket from Sriharikota, navigate into lunar polar orbit. Guide your spacecraft over Shiv Shakti Point (69.37° S). Fire the ChaSTE thermal needle probe and APXS spectrometer to measure extreme soil temperature gradients and discover elemental sulfur and volatile water frost!',
    timeLimitSec: 120,
    objectives: [
      { id: 'obj_polar_capture', text: 'Circularize into 100 km Lunar Polar Orbit', done: false },
      { id: 'obj_chaste_scan', text: 'Scan Shiv Shakti Landing Point & Shackleton Crater', done: false },
      { id: 'obj_downlink_moon', text: 'Transmit 200 pts of in-situ regolith spectrometry to ISTRAC DSN', done: false }
    ],
    starThresholds: {
      star1: 'Detect subterranean temperature gradient',
      star2: 'Detect elemental sulfur & polar volatiles',
      star3: 'Score >= 350 Science Points with >50% fuel remaining'
    },
    hazards: ['Severe Polar Thermal Extremes (Down to 40 Kelvin)', 'Lunar Mascon Gravity Perturbations'],
    recommendedParts: {
      bus: 'bus_espa_medium',
      engine: 'prop_bipropellant',
      power: 'pwr_deployable_gaas',
      sensor: 'inst_chaste_thermal'
    },
    targetColor: '#475569',
    targetAtmosphere: '#cbd5e1',
    rewardStars: 3,
    rewardCredits: 1400,
    researchField: 'Lunar South Pole Volatiles, Thermophysics & Mineralogy',
    researchHypothesis: 'Lunar south polar regolith exhibits an intense thermal gradient (50°C at surface to -10°C at 8cm depth) preserving pristine elemental sulfur and trapped water ice.',
    researchTargets: [
      { lat: -69.4, lon: 32.3, label: 'SHIV SHAKTI LANDING POINT (69.37°S)', discovery: 'ChaSTE probe confirmed steep 60°C thermal differential; APXS detected unambiguously native sulfur!' },
      { lat: -89.9, lon: 0.0, label: 'SHACKLETON CRATER COLD TRAP', discovery: 'Epithermal neutron absorption confirmed 5.6% water-equivalent hydrogen in permanently shadowed interior.' },
      { lat: -72.9, lon: 43.2, label: 'BOGUSLAWSKY IMPACT EJECTA', discovery: 'Anorthosite highlands crust rich in aluminum and titanium mapped from orbit.' }
    ]
  },
  {
    id: 'level_3',
    levelNumber: 3,
    title: 'MISSION 03: ISRO ADITYA-L1',
    subtitle: 'Sun-Earth L1 Halo Orbit Solar Corona & Space Weather Sentinel',
    targetBody: 'Earth', // Sun-Earth L1
    badge: 'HELIOPHYSICS SENTINEL',
    story: 'Pilot India’s first dedicated solar space observatory! Lift off from Sriharikota atop a PSLV-XL rocket, cruise 1.5 million kilometers to the Sun-Earth Lagrangian L1 Halo Orbit. Uncap the Visible Emission Line Coronagraph (VELC) and Solar Ultraviolet Imaging Telescope (SUIT) to inspect the superheated solar corona, unravel the coronal heating mystery, and broadcast 24-hour advance warnings for Coronal Mass Ejections (CMEs)!',
    timeLimitSec: 130,
    objectives: [
      { id: 'obj_halo_orbit', text: 'Station-keep in Sun-Earth L1 Lissajous / Halo Orbit', done: false },
      { id: 'obj_velc_corona', text: 'Capture Solar Corona Green Line (530.3 nm) with VELC', done: false },
      { id: 'obj_cme_alert', text: 'Transmit 24-hour Coronal Mass Ejection early warning alert', done: false }
    ],
    starThresholds: {
      star1: 'Maintain halo orbit lock at 1.5M km',
      star2: 'Capture coronal flare shockwave with VELC',
      star3: 'Score >= 400 Heliophysics Science Points'
    },
    hazards: ['Relativistic Solar Energetic Protons (SEPs)', 'Continuous Direct Solar Thermal Radiation'],
    recommendedParts: {
      bus: 'bus_espa_medium',
      engine: 'prop_hydrazine_monoprop',
      power: 'pwr_large_articulated',
      sensor: 'inst_velc_coronagraph'
    },
    targetColor: '#ea580c',
    targetAtmosphere: '#fde047',
    rewardStars: 3,
    rewardCredits: 1800,
    researchField: 'Solar Physics, Coronal Dynamics & Space Weather Early Warning',
    researchHypothesis: 'Impulsive magnetic reconnection and Alfvén wave dissipation accelerate coronal plasma to over 1.5 million km/h, driving solar wind heating to 2 million Kelvin.',
    researchTargets: [
      { lat: 15.0, lon: 0.0, label: 'SOLAR CORONA ACTIVE FLARE REGION', discovery: 'VELC recorded 530.3 nm Fe XIV emission; plasma velocity reached 1.9 million km/h!' },
      { lat: -22.0, lon: 45.0, label: 'CORONAL MASS EJECTION SHOCK FRONT', discovery: 'Interplanetary shock wave acceleration detected; 28-hour geomagnetic storm early alert triggered.' },
      { lat: 0.0, lon: -90.0, label: 'ALFVÉNIC SOLAR WIND ACCELERATION', discovery: 'Proton-to-alpha flux ratio measured; proved Alfvén wave energy drives coronal heating.' }
    ]
  },
  {
    id: 'level_4',
    levelNumber: 4,
    title: 'MISSION 04: ISRO MANGALYAAN (MOM)',
    subtitle: 'Mars Atmospheric Escape & Interplanetary Reconnaissance',
    targetBody: 'Mars',
    badge: 'INTERPLANETARY MAIDEN TRIUMPH',
    story: 'Relive ISRO’s historic interplanetary triumph — becoming the first nation in history to reach Mars orbit on its maiden attempt! Launching atop PSLV-C25, execute a fuel-efficient Hohmann transfer orbit, fire the 440N Liquid Apogee Motor to insert into Mars orbit, and use your Mars Colour Camera and Methane Sensor to map Valles Marineris and investigate the escape of the Martian atmosphere!',
    timeLimitSec: 135,
    objectives: [
      { id: 'obj_mars_capture', text: 'Execute Mars Orbit Insertion (MOI) retrograde burn', done: false },
      { id: 'obj_valles_marineris', text: 'Map Valles Marineris Canyon system & Olympus Mons', done: false },
      { id: 'obj_methane_trace', text: 'Scan for localized atmospheric methane and deuterium-to-hydrogen ratio', done: false }
    ],
    starThresholds: {
      star1: 'Survive Mars orbital capture',
      star2: 'Map Valles Marineris with >60% hull integrity',
      star3: 'Score >= 420 Science Points'
    },
    hazards: ['Solar Flux drops to 43% of Earth', '14-Minute One-Way Communication Latency', 'Martian Global Dust Storms'],
    recommendedParts: {
      bus: 'bus_espa_medium',
      engine: 'prop_bipropellant',
      power: 'pwr_large_articulated',
      sensor: 'inst_multispectral_cam'
    },
    targetColor: '#991b1b',
    targetAtmosphere: '#f87171',
    rewardStars: 3,
    rewardCredits: 2200,
    researchField: 'Martian Atmospheric Escape & Planetary Geomorphology',
    researchHypothesis: 'Selective loss of lighter hydrogen isotopes via solar wind stripping elevates the D/H ratio in the Martian exosphere, recording ancient water loss.',
    researchTargets: [
      { lat: -14.0, lon: -70.0, label: 'VALLES MARINERIS CANYON FLOOR', discovery: 'Full-disk 4,000 km canyon mapped by MCC; morning water-ice hazes observed in Ophir Chasma.' },
      { lat: 18.0, lon: -130.0, label: 'OLYMPUS MONS VOLCANIC CALDERA', discovery: '22 km summit elevation profiled; atmospheric dust opacity measured at tau = 0.42.' },
      { lat: -5.4, lon: 137.8, label: 'GALE CRATER ANCIENT LAKEBED', discovery: 'Hydrated phyllosilicate clay minerals and sulfate evaporites identified from orbital reflectance.' }
    ]
  },
  {
    id: 'level_5',
    levelNumber: 5,
    title: 'MISSION 05: NASA ARTEMIS II & ORION',
    subtitle: 'Deep Space Crewed Lunar Free-Return Expedition',
    targetBody: 'Moon',
    badge: 'HUMAN DEEP SPACE EXPEDITION',
    story: 'Command NASA’s flagship human spaceflight mission! Launch 4 astronauts from Launch Complex 39B at Kennedy Space Center atop the towering SLS mega-rocket. Guide Orion through Trans-Lunar Injection (TLI), venture 7,400 km beyond the lunar farside on a figure-8 free-return trajectory, monitor deep-space radiation dosages, and pilot the high-speed re-entry corridor safely back to Earth!',
    timeLimitSec: 140,
    objectives: [
      { id: 'obj_tli_burn', text: 'Execute Trans-Lunar Injection (TLI) burn with ICPS stage', done: false },
      { id: 'obj_lunar_farside', text: 'Reconnaissance scan of Lunar Farside South Pole-Aitken Basin', done: false },
      { id: 'obj_crew_return', text: 'Guide Orion spacecraft into 11 km/s Earth re-entry corridor', done: false }
    ],
    starThresholds: {
      star1: 'Complete cis-lunar free-return loop',
      star2: 'Maintain life support with radiation dose < 150 mSv',
      star3: 'Score >= 480 Human Spaceflight Points'
    },
    hazards: ['Van Allen Radiation Belt Transits', 'Deep Cis-Lunar Thermal Extremes', 'Critical Atmospheric Re-entry Angle'],
    recommendedParts: {
      bus: 'bus_flagship',
      engine: 'prop_bipropellant',
      power: 'pwr_large_articulated',
      sensor: 'inst_multispectral_cam'
    },
    targetColor: '#334155',
    targetAtmosphere: '#94a3b8',
    rewardStars: 3,
    rewardCredits: 3000,
    researchField: 'Deep Space Human Exploration, Cis-Lunar Trajectories & Radiation Dosimetry',
    researchHypothesis: 'A hybrid lunar free-return trajectory utilizing lunar gravity ensures fail-safe astronaut return to Earth without requiring active engine burns in deep space.',
    researchTargets: [
      { lat: -53.0, lon: 170.0, label: 'LUNAR FARSIDE SOUTH POLE-AITKEN BASIN', discovery: 'Deep lunar mantle material exposed in 2,500 km ancient impact basin surveyed in high-res optical.' },
      { lat: 0.0, lon: 180.0, label: 'CIS-LUNAR FREE-RETURN APOGEE (400,000 KM)', discovery: 'Farthest human distance from Earth in history; active radiation dosimeters validated within safety limits.' },
      { lat: 22.0, lon: -130.0, label: 'ORION SKIP RE-ENTRY ENTRY INTERFACE', discovery: 'Hyperbolic 39,000 km/h skip entry trajectory guided heat shield peak temperatures below 2,750°C.' }
    ]
  },
  {
    id: 'level_6',
    levelNumber: 6,
    title: 'MISSION 06: NASA/ESA/CSA JWST',
    subtitle: 'Cosmic Dawn & Habitable Exoplanet Infrared Spectroscopy',
    targetBody: 'Moon', // Deep space Sun-Earth L2 context
    badge: 'ASTROPHYSICS FLAGSHIP',
    story: 'Operate humanity’s premier deep-space infrared observatory! Deployed at Sun-Earth L2 (1.5 million km behind Earth), unfold the 5-layer tennis-court-sized sunshield and 6.5-meter gold-coated beryllium primary mirror. Use NIRCam and MIRI to capture the first galaxies born after the Big Bang ($z > 14$) and inspect habitable exoplanets (TRAPPIST-1e) for atmospheric water vapor and carbon dioxide!',
    timeLimitSec: 150,
    objectives: [
      { id: 'obj_cryo_align', text: 'Maintain cryocooler at 6 Kelvin & pointing jitter < 0.007 arcsec', done: false },
      { id: 'obj_trappist_scan', text: 'Perform transmission spectroscopy on exoplanet TRAPPIST-1e', done: false },
      { id: 'obj_cosmic_dawn', text: 'Capture infrared spectrum of primordial galaxy (z = 14.3)', done: false }
    ],
    starThresholds: {
      star1: 'Detect 1.4-micron exoplanet water band',
      star2: 'Capture high-redshift galaxy spectra with zero vibration',
      star3: 'Score >= 500 Astrophysics Science Points'
    },
    hazards: ['Thermal Noise (Demands continuous cryogenic cooling)', 'Micrometeoroid Mirror Impacts', 'Solar Radiation Pressure Jitter'],
    recommendedParts: {
      bus: 'bus_flagship',
      engine: 'prop_cold_gas',
      power: 'pwr_large_articulated',
      sensor: 'inst_infrared_radiometer'
    },
    targetColor: '#1e1b4b',
    targetAtmosphere: '#818cf8',
    rewardStars: 3,
    rewardCredits: 3500,
    researchField: 'Infrared Astrophysics, Exoplanet Atmospheres & Observational Cosmology',
    researchHypothesis: 'Cryogenic space spectroscopy can detect atmospheric chemical disequilibrium (water, CO2, methane) in the atmospheres of rocky habitable-zone exoplanets.',
    researchTargets: [
      { lat: 20.0, lon: 45.0, label: 'TRAPPIST-1e HABITABLE EXOPLANET ATMOSPHERE', discovery: 'Molecular absorption confirmed: 1.4-micron water vapor and 4.3-micron CO2 detected in habitable zone!' },
      { lat: -40.0, lon: -120.0, label: 'COSMIC DAWN GALAXY JADES-GS-z14-0', discovery: 'Primordial stellar population formed just 290 million years after the Big Bang ($z = 14.32$).' },
      { lat: 60.0, lon: -160.0, label: 'CARINA NEBULA COSMIC CLIFFS', discovery: 'Infrared penetration reveals protostellar jets emerging from obscuring molecular gas clouds.' }
    ]
  },
  {
    id: 'level_7',
    levelNumber: 7,
    title: 'MISSION 07: NASA EUROPA CLIPPER',
    subtitle: 'Outer Solar System Subsurface Ocean & Plume Reconnaissance',
    targetBody: 'Jupiter',
    badge: 'OCEAN WORLDS FLAGSHIP',
    story: 'Journey to the outer solar system! At 5.2 AU from the Sun, solar irradiance is only 3.7% of Earth. Brave Jupiter’s intense radiation belts with heavy shielding. Execute close flybys within 25 km of Europa’s icy surface, penetrate the ice shell with radar sounding, and sample cryovolcanic vapor plumes for organic molecules and salts!',
    timeLimitSec: 155,
    objectives: [
      { id: 'obj_jovian_rad', text: 'Shield avionics through intense Jupiter radiation belt passes', done: false },
      { id: 'obj_plume_dive', text: 'Fly through Europa cryovolcanic vapor plume to sample organics', done: false },
      { id: 'obj_dsn_downlink', text: 'Downlink deep-ocean evidence via Ka-Band High Gain Antenna', done: false }
    ],
    starThresholds: {
      star1: 'Detect subsurface saline ocean signatures',
      star2: 'Survive radiation exposure with >40% hull integrity',
      star3: 'Score >= 500 Science Points (S-Rank Pioneer)'
    },
    hazards: ['Deadly Jovian Ionizing Radiation', 'Extreme Solar Irradiance Deficit', '42-Minute One-Way Communication Delay'],
    recommendedParts: {
      bus: 'bus_flagship',
      engine: 'prop_hall_ion',
      power: 'pwr_rtg_nextgen',
      sensor: 'inst_sar_radar'
    },
    targetColor: '#c2410c',
    targetAtmosphere: '#f97316',
    rewardStars: 3,
    rewardCredits: 3800,
    researchField: 'Astrobiology, Ocean Worlds & Planetary Magnetospheres',
    researchHypothesis: 'Europa’s subsurface liquid water ocean is chemically sustained by seafloor hydrothermal vents, venting sodium chloride and organics through ice fractures.',
    researchTargets: [
      { lat: 10.0, lon: -120.0, label: 'MANANNAN CRATER CRYO-PLUME', discovery: 'Sodium chloride salts and complex hydrocarbon polymers detected in plume vapor!' },
      { lat: -25.0, lon: -90.0, label: 'CHAOS TERRAIN CONVECTION ICE', discovery: 'Active thermal upwelling mapped through 8 km thick brittle ice crust.' },
      { lat: 45.0, lon: 150.0, label: 'THERMAL DIAPIR FISSURE ZONE', discovery: 'Direct evidence of hydrothermal seafloor vents venting dissolved silica!' }
    ]
  },
  {
    id: 'level_8',
    levelNumber: 8,
    title: 'MISSION 08: OSIRIS-REx / HAYABUSA2',
    subtitle: 'Planetary Defense & Prebiotic Asteroid Sample Return',
    targetBody: 'Mars', // Small body context
    badge: 'ASTEROID SAMPLE RETURN',
    story: 'Rendezvous with carbonaceous Near-Earth Asteroid Bennu / Apophis! Perform laser altimetry terrain mapping, avoid giant jagged boulder hazards, and guide the Touch-And-Go Sample Acquisition Mechanism (TAGSAM) to harvest pristine regolith containing ancient extraterrestrial amino acids dating to the dawn of the Solar System.',
    timeLimitSec: 130,
    objectives: [
      { id: 'obj_lidar_map', text: '3D LIDAR topographic scan of Nightingale crater boulder hazard', done: false },
      { id: 'obj_sample_touch', text: 'Fire TAGSAM Nitrogen blast to collect 250g pristine regolith', done: false },
      { id: 'obj_earth_return_burn', text: 'Execute Earth-return trajectory insertion burn', done: false }
    ],
    starThresholds: {
      star1: 'Harvest >100 grams of asteroid sample',
      star2: 'Touch-and-go touchdown with zero hull damage',
      star3: 'Harvest full 250g payload with >60% propellant remaining'
    },
    hazards: ['Microgravity Regolith Ejecta Plumes', 'Yarkovsky Thermal Orbital Drift'],
    recommendedParts: {
      bus: 'bus_espa_medium',
      engine: 'prop_bipropellant',
      power: 'pwr_deployable_gaas',
      sensor: 'inst_mass_spectrometer'
    },
    targetColor: '#3f3f46',
    targetAtmosphere: '#a1a1aa',
    rewardStars: 3,
    rewardCredits: 3200,
    researchField: 'Prebiotic Astrochemistry & Planetary Defense',
    researchHypothesis: 'Primitive B-type carbonaceous chondrite asteroids preserve hydrated clay minerals and prebiotic amino acids dating to the Solar System birth.',
    researchTargets: [
      { lat: 15.0, lon: 35.0, label: 'CRATER NIGHTINGALE REGOLITH BED', discovery: 'Harvested 265g pristine regolith rich in amino acids (glycine) and serpentine clays!' },
      { lat: -30.0, lon: 110.0, label: 'BENNU THERMAL YARKOVSKY APEX', discovery: 'Thermal radiation pressure measured at 285 m/yr orbital drift; deflection hazard mapped.' },
      { lat: -10.0, lon: -85.0, label: 'MAGNETITE HYDROTHERMAL VEIN', discovery: 'Veins of pure carbonate mineral confirm ancient hydrothermal brine circulation!' }
    ]
  },
  {
    id: 'level_9',
    levelNumber: 9,
    title: 'MISSION 09: NASA PARKER SOLAR PROBE',
    subtitle: 'Touching the Sun: Coronal Heating & Magnetic Switchbacks',
    targetBody: 'Jupiter', // High energy context
    badge: 'EXTREME HELIOPHYSICS',
    story: 'Fly directly into the fiery inferno of the solar corona! Protected by an 11-centimeter thick carbon-composite thermal shield, plunge inside the Sun’s Alfvén critical boundary at 700,000 km/h. Measure magnetic switchbacks, superheated solar plasma, and unmask the physics that drives the solar wind!',
    timeLimitSec: 135,
    objectives: [
      { id: 'obj_switchback', text: 'Map Coronal Magnetic Field Reversal (Switchback)', done: false },
      { id: 'obj_cme_intercept', text: 'Detect Coronal Mass Ejection Shockwave acceleration', done: false },
      { id: 'obj_heatshield', text: 'Maintain Heat Shield prograde orientation to prevent thermal burnout', done: false }
    ],
    starThresholds: {
      star1: 'Sample sub-Alfvénic solar corona',
      star2: 'Endure solar heat flux with >70% thermal shield integrity',
      star3: 'Score >= 500 Heliophysics Science Points'
    },
    hazards: ['Extreme Solar Radiant Flux (Over 475x Earth)', 'High-Energy Relativistic Protons'],
    recommendedParts: {
      bus: 'bus_flagship',
      engine: 'prop_hall_ion',
      power: 'pwr_rtg_nextgen',
      sensor: 'inst_sar_radar'
    },
    targetColor: '#ea580c',
    targetAtmosphere: '#fdba74',
    rewardStars: 3,
    rewardCredits: 4000,
    researchField: 'Heliophysics, Plasma Dynamics & Space Weather Early Warning',
    researchHypothesis: 'Impulsive magnetic reconnection in coronal magnetic switchbacks heats the ambient solar wind from 6,000K to over 2 million Kelvin.',
    researchTargets: [
      { lat: 0.0, lon: 0.0, label: 'ALFVÉN CRITICAL SURFACE BOUNDARY', discovery: 'Crossed sub-Alfvénic solar boundary at 13.8 solar radii; plasma accelerated to 780 km/s!' },
      { lat: 35.0, lon: -60.0, label: 'CORONAL MASS EJECTION SHOCK', discovery: 'Major X-class flare shockwave mapped; 28-hour geomagnetic storm early alert triggered!' },
      { lat: -25.0, lon: 95.0, label: 'MAGNETIC SWITCHBACK VORTEX', discovery: '180° magnetic field reversal recorded; proved Alfvénic wave dissipation drives corona heating!' }
    ]
  }
];
