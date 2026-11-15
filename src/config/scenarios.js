/**
 * SPACE-AURA: Pre-configured NASA & ISRO Flagship Mission Scenarios & Objectives
 * Real-world aerospace systems engineering scenarios for student mission design
 */

export const MISSION_SCENARIOS = [
  {
    id: 'scenario_nisar',
    title: 'NASA-ISRO NISAR: Global Radar Earth Observer',
    subtitle: 'Dual-Frequency L/S-Band SweepSAR Earth System Observatory',
    targetBody: 'Earth',
    badge: 'NASA-ISRO PARTNERSHIP',
    recommendedOrbitId: 'orbit_leo_sso',
    recommendedBusId: 'bus_espa_medium',
    budgetCap: 120.0, // $ Millions
    targetScienceScore: 260,
    requiredScienceThreshold: 190,
    missionLifetimeDays: 1095, // 3 Years
    targetPhenomena: 'Crustal Tectonic Creep, Himalayan Glaciers & Ecosystem Biomass',
    objectivesSummary: [
      'Map global Earth land and ice deformation with sub-centimeter accuracy every 12 days.',
      'Track rapid glacial surge and meltwater loss across Himalayan and polar ice sheets.',
      'Monitor forest carbon biomass density and wetland ecosystem dynamics through persistent cloud cover.'
    ],
    challengesAndRisks: [
      'High power draw from dual-frequency SweepSAR radar requires high-capacity GaAs solar arrays.',
      'Sun-Synchronous orbit eclipse cycles require strict battery depth-of-discharge management.',
      'Gigantic raw data throughput (120+ Mbps) requires high-throughput Ka/X-band downlink.'
    ],
    recommendedInstruments: ['inst_sar_radar', 'inst_infrared_radiometer'],
    recommendedLaunchVehicle: 'lv_lvm3',
    difficulty: 'Intermediate'
  },
  {
    id: 'scenario_chandrayaan3',
    title: 'ISRO Chandrayaan-3: Lunar South Pole Prospector',
    subtitle: 'In-Situ Thermophysics & Elemental Water Volatiles Discovery',
    targetBody: 'Moon',
    badge: 'ISRO LUNAR TRIUMPH',
    recommendedOrbitId: 'orbit_lunar_polar',
    recommendedBusId: 'bus_espa_medium',
    budgetCap: 85.0, // $ Millions (ISRO ultra-efficient budget!)
    targetScienceScore: 300,
    requiredScienceThreshold: 220,
    missionLifetimeDays: 180,
    targetPhenomena: 'Shiv Shakti Point (69.37°S) Regolith Thermal Gradient & Water Ice',
    objectivesSummary: [
      'Conduct in-situ penetration thermal profiling of lunar south polar soil with ChaSTE.',
      'Detect native elemental sulfur, iron, and titanium using Alpha Particle X-ray Spectrometry (APXS).',
      'Survey permanently shadowed regions (PSRs) at the lunar south pole for trapped water ice.'
    ],
    challengesAndRisks: [
      'Extreme thermal swings from 50°C in sunlight down to 40 Kelvin (-233°C) in polar shadow.',
      'Lunar gravity mascons require delta-V station-keeping to maintain stable orbit.',
      'Intermittent Earth line-of-sight requires autonomous flight computer sequencing.'
    ],
    recommendedInstruments: ['inst_chaste_thermal', 'inst_neutron_spectrometer', 'inst_lidar_altimeter'],
    recommendedLaunchVehicle: 'lv_lvm3',
    difficulty: 'Intermediate'
  },
  {
    id: 'scenario_aditya_l1',
    title: 'ISRO Aditya-L1: Solar Corona & Space Weather Sentinel',
    subtitle: 'Sun-Earth L1 Halo Orbit Heliophysics Observatory',
    targetBody: 'Earth',
    badge: 'HELIOPHYSICS OBSERVATORY',
    recommendedOrbitId: 'orbit_geo', // High-altitude / Deep Space
    recommendedBusId: 'bus_espa_medium',
    budgetCap: 65.0, // $ Millions
    targetScienceScore: 280,
    requiredScienceThreshold: 200,
    missionLifetimeDays: 1825, // 5 Years
    targetPhenomena: 'Coronal Mass Ejections (CMEs), Coronal Heating & Solar Wind Acceleration',
    objectivesSummary: [
      'Observe the dynamic solar corona down to 1.05 solar radii using the VELC Coronagraph.',
      'Deliver real-time 24-hour advance warning of dangerous Coronal Mass Ejections to Earth power grids.',
      'Unravel the magnetic reconnection mechanism heating coronal plasma to 2 million Kelvin.'
    ],
    challengesAndRisks: [
      'Continuous direct solar thermal radiation requires precision heat rejection MLI blankets.',
      'Relativistic solar energetic protons (SEPs) cause single-event upsets in non-hardened avionics.',
      'Lissajous / Halo orbit station-keeping requires micro-thruster propellant budgeting.'
    ],
    recommendedInstruments: ['inst_velc_coronagraph', 'inst_magnetometer'],
    recommendedLaunchVehicle: 'lv_pslv',
    difficulty: 'Intermediate'
  },
  {
    id: 'scenario_mangalyaan',
    title: 'ISRO Mangalyaan (MOM): Mars Orbiter Mission',
    subtitle: 'Maiden Interplanetary Flight & Atmospheric Escape Reconnaissance',
    targetBody: 'Mars',
    badge: 'INTERPLANETARY MARS',
    recommendedOrbitId: 'orbit_mars_low',
    recommendedBusId: 'bus_espa_medium',
    budgetCap: 75.0, // $ Millions (Historic cost-effective Mars mission!)
    targetScienceScore: 320,
    requiredScienceThreshold: 230,
    missionLifetimeDays: 687, // 1 Martian Year
    targetPhenomena: 'Atmospheric Deuterium-to-Hydrogen Ratio, Methane & Valles Marineris',
    objectivesSummary: [
      'Execute Mars Orbit Insertion (MOI) retrograde burn with the 440N Liquid Apogee Motor.',
      'Map full-disk Martian surface morphology, dust storms, and canyon geography using MCC.',
      'Investigate exospheric atmospheric escape and solar wind stripping of water.'
    ],
    challengesAndRisks: [
      'Solar flux drops to 43% of Earth, requiring optimized solar wing articulation.',
      'One-way communication delay up to 14 minutes requires full onboard autonomy during eclipses.',
      'High-velocity entry into Martian gravity requires exact delta-V propellant reserve.'
    ],
    recommendedInstruments: ['inst_multispectral_cam', 'inst_infrared_radiometer', 'inst_magnetometer'],
    recommendedLaunchVehicle: 'lv_pslv',
    difficulty: 'Advanced'
  },
  {
    id: 'scenario_artemis2',
    title: 'NASA Artemis II & Orion: Deep Space Crewed Lunar Expedition',
    subtitle: 'Human Exploration Beyond Low Earth Orbit on SLS Block 1',
    targetBody: 'Moon',
    badge: 'ARTEMIS HUMAN EXPEDITION',
    recommendedOrbitId: 'orbit_lunar_polar',
    recommendedBusId: 'bus_flagship',
    budgetCap: 950.0, // $ Millions
    targetScienceScore: 400,
    requiredScienceThreshold: 300,
    missionLifetimeDays: 30,
    targetPhenomena: 'Lunar Farside Reconnaissance, Cis-Lunar Trajectory & Re-entry Aerodynamics',
    objectivesSummary: [
      'Launch 4 astronauts on NASA SLS Block 1 and execute Trans-Lunar Injection (TLI).',
      'Pilot Orion around the lunar farside on a figure-8 free-return trajectory.',
      'Validate astronaut life support, deep-space radiation protection, and 11 km/s skip entry corridor.'
    ],
    challengesAndRisks: [
      'Human-rated safety margin: zero tolerance for avionics, power, or life-support failure.',
      'Van Allen radiation belt penetration requires heavy shielding and active dosimetry.',
      'Hyperbolic skip re-entry requires pin-point entry interface corridor guidance.'
    ],
    recommendedInstruments: ['inst_multispectral_cam', 'inst_csa_canadarm_boom', 'inst_lidar_altimeter'],
    recommendedLaunchVehicle: 'lv_sls',
    difficulty: 'Advanced'
  },
  {
    id: 'scenario_jwst',
    title: 'NASA/ESA/CSA JWST: Cosmic Dawn & Exoplanet Habitability',
    subtitle: 'Sun-Earth L2 Halo Orbit Deep Space Infrared Observatory',
    targetBody: 'Moon', // Deep space context
    badge: 'ASTROPHYSICS FLAGSHIP',
    recommendedOrbitId: 'orbit_geo',
    recommendedBusId: 'bus_flagship',
    budgetCap: 1200.0, // $ Millions
    targetScienceScore: 480,
    requiredScienceThreshold: 350,
    missionLifetimeDays: 1825, // 5+ Years
    targetPhenomena: 'Cosmic Dawn First Galaxies (z > 14) & Exoplanet Atmospheres (TRAPPIST-1e)',
    objectivesSummary: [
      'Deploy 5-layer tennis-court sunshield and 6.5m gold beryllium mirror at Sun-Earth L2.',
      'Detect atmospheric water vapor and carbon dioxide in habitable-zone rocky exoplanets.',
      'Observe primordial star clusters and early universe galaxy formation.'
    ],
    challengesAndRisks: [
      'Optics must be maintained at 6 Kelvin using active pulse-tube cryocoolers.',
      'Zero orbital repair capability at 1.5 million km: all deployable mechanisms are single-point-failures.',
      'Sub-arcsecond pointing stability demands ultra-quiet reaction wheels and zero hull vibration.'
    ],
    recommendedInstruments: ['inst_infrared_radiometer', 'inst_multispectral_cam'],
    recommendedLaunchVehicle: 'lv_vulcan',
    difficulty: 'Advanced'
  },
  {
    id: 'scenario_sandbox',
    title: 'NASA & ISRO Mission Design Sandbox: Open Laboratory',
    subtitle: 'Design, Test, and Fly Any Custom Mission Architecture',
    targetBody: 'Custom',
    badge: 'UNCONSTRAINED SANDBOX',
    recommendedOrbitId: 'orbit_leo_sso',
    recommendedBusId: 'bus_espa_medium',
    budgetCap: 2000.0,
    targetScienceScore: 300,
    requiredScienceThreshold: 150,
    missionLifetimeDays: 365,
    targetPhenomena: 'Student Custom Defined Science Hypotheses',
    objectivesSummary: [
      'Freely combine any rocket, spacecraft bus, science instruments, and propulsion systems.',
      'Experiment with extreme payloads, stress-test power and mass margins, and discover new designs.',
      'Verify real systems engineering trade-offs with NASA Goddard and ISRO engineering metrics.'
    ],
    challengesAndRisks: [
      'Full engineering freedom: balance mass, delta-V, power, telemetry, and budget on your own!'
    ],
    recommendedInstruments: [],
    recommendedLaunchVehicle: 'lv_falcon9',
    difficulty: 'All Levels'
  }
];
