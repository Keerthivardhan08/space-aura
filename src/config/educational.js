/**
 * SPACE-AURA: NASA Educational Guide, Official Resources, CML Framework & Mission Systems Engineering
 * Integrated with all 9 Official NASA Space Apps Challenge Resources & Guidelines
 */

export const OFFICIAL_NASA_RESOURCES = [
  {
    id: 'res_smd_design',
    title: 'Design and Develop Science Missions',
    source: 'NASA Science Mission Directorate (SMD)',
    url: 'https://www.nasa.gov/wp-content/uploads/2025/04/250323-design-and-develop-science-mission.pdf?emrc=a454cf',
    badge: 'NASA SYSTEMS HANDBOOK',
    summary: 'Comprehensive overview of the systems-engineering lifecycle used across NASA science missions. Defines the progression from initial scientific question through requirements formulation, point design, verification, and implementation.',
    keyTakeaways: [
      'Identifies the 4 critical mission segments: Launch, Space, Ground, and User segments.',
      'Emphasizes requirements traceability from Science Traceability Matrix (STM) to Subsystem Specs.',
      'Defines risk-informed decision making and trade study methodologies.'
    ]
  },
  {
    id: 'res_gmat',
    title: 'General Mission Analysis Tool (GMAT)',
    source: 'NASA Goddard Space Flight Center',
    url: 'https://software.nasa.gov/software/GSC-19468-1',
    badge: 'OPEN-SOURCE SOFTWARE',
    summary: 'NASA enterprise-level software system for trajectory design, orbital mechanics, spacecraft navigation, and optimization. Used for missions ranging from LEO to lunar transfers and libration points.',
    keyTakeaways: [
      'Propagates orbits using high-fidelity gravitational potential models and solar radiation pressure.',
      'Performs finite and impulsive burn maneuver planning for orbital capture and station-keeping.',
      'Calculates Keplerian orbital elements (Semi-major axis, Eccentricity, Inclination, RAAN, Argument of Periapsis).'
    ]
  },
  {
    id: 'res_cml',
    title: 'Concept Maturity Levels (CMLs)',
    source: 'NASA Jet Propulsion Laboratory (JPL)',
    url: 'https://dataverse.jpl.nasa.gov/dataset.xhtml?persistentId=hdl:2014/44299',
    badge: 'JPL MATURITY FRAMEWORK',
    summary: 'Framework developed by NASA JPL to evaluate and mature mission concepts prior to formal formulation (Phase A). Spans CML 1 (initial idea) through CML 4 (point design) to CML 6 (Preliminary Design Review).',
    keyTakeaways: [
      'Prevents premature lock-in of unverified point designs.',
      'CML 3 requires rigorous architecture trade studies (power, propulsion, launch vehicle).',
      'CML 4 requires balanced mass, power, cost, and link budgets with >=15-20% engineering margin.'
    ]
  },
  {
    id: 'res_mdl',
    title: 'Mission Design Lab (MDL)',
    source: 'NASA GSFC Integrated Design Center',
    url: 'https://etd.gsfc.nasa.gov/capabilities/integrated-design-center/mission-design-lab/',
    badge: 'CONCURRENT DESIGN FACILITY',
    summary: 'Collaborative concurrent engineering environment where multidisciplinary scientists and engineers rapidly formulate, assess, and iterate mission concepts in real time.',
    keyTakeaways: [
      'Study Levels: Office Hours (brainstorming), Concept Development (feasibility), Trade Studies (alternatives), Point Design (cost/MEL).',
      'Simultaneously optimizes across all spacecraft disciplines (Thermal, Power, ADCS, Comm, Avionics).',
      'Provides defensible cost and risk estimation models for NASA proposal reviews.'
    ]
  },
  {
    id: 'res_mission_viz',
    title: 'NASA Mission Viz',
    source: 'NASA Open Source Projects',
    url: 'https://nasa.github.io/mission-viz/',
    badge: '3D SPATIAL ENVIRONMENT',
    summary: 'Interactive web-based 3D visualization platform designed to explore trajectories, celestial body alignments, ground station line-of-sight contacts, and space mission operational timelines.',
    keyTakeaways: [
      'Visualizes spatial relationships otherwise buried in numerical coordinate tables.',
      'Depicts spacecraft orbital attitude relative to planetary bodies and the Sun.',
      'Essential for communicating complex orbital dynamics to diverse stakeholders.'
    ]
  },
  {
    id: 'res_telescope_game',
    title: 'A Learning Game About Telescopes (Build It Yourself: Webb)',
    source: 'NASA Goddard / Space Telescope Science Institute',
    url: 'https://science.nasa.gov/mission/webb/game-build-it-yourself/',
    badge: 'NASA INTERACTIVE GAME',
    summary: 'Educational simulation demonstrating how scientific objectives dictate engineering characteristics. Players select science targets, wavelengths, instruments, and compare their design to real NASA missions.',
    keyTakeaways: [
      'Demonstrates that scientific goals drive optical and sensor requirements.',
      'Imposes realistic engineering constraints where incompatible choices are rejected.',
      'Directly links virtual spacecraft creations to real NASA missions (Hubble, Webb, Roman, Chandra).'
    ]
  },
  {
    id: 'res_cubesat_101',
    title: 'CubeSat 101 - Basic Concepts and Processes',
    source: 'NASA CubeSat Launch Initiative (CSLI)',
    url: 'https://www3.nasa.gov/sites/default/files/atoms/files/nasa_csli_cubesat_101_508.pdf',
    badge: 'NASA CSLI STANDARD',
    summary: 'The primary handbook for first-time SmallSat and CubeSat developers, covering standardized form factors (1U to 12U), deployer canister interfaces (P-POD), launch vibration loads, and safety compliance.',
    keyTakeaways: [
      'Mass and volume limits per standard unit: 1U (10x10x10cm, ~1.33-2.0kg).',
      'Mandatory 25-year post-mission orbital de-orbit lifetime rule (orbital debris mitigation).',
      'Battery overcharge, thermal runaway mitigation, and radio licensing requirements.'
    ]
  },
  {
    id: 'res_vr_mission',
    title: 'Visualize a Space Mission Using Virtual Reality',
    source: 'NASA Space Apps Challenge Global Archive',
    url: 'https://www.spaceappschallenge.org/2023/challenges/visualize-a-space-mission-using-virtual-reality/',
    badge: 'SPACE APPS CHALLENGE',
    summary: 'Flagship challenge focused on translating complex multi-stage space missions into interactive spatial visualizers featuring launch, transfer orbits, planetary capture, and surface operations.',
    keyTakeaways: [
      'Highlights the importance of intuitive visualization for mission ConOps timelines.',
      'Bridges the gap between technical flight telemetry and engaging user experiences.'
    ]
  },
  {
    id: 'res_csa_games',
    title: 'Canadian Space Agency (CSA) Digital Games & Activities',
    source: 'Canadian Space Agency (CSA / ASC)',
    url: 'https://www.asc-csa.gc.ca/eng/youth-educators/digital-games-and-activities.asp',
    badge: 'SPACE AGENCY PARTNER',
    summary: 'Interactive learning resources highlighting international space robotics (Canadarm2, Canadarm3 for Lunar Gateway) and Earth observation radar systems (RADARSAT Constellation).',
    keyTakeaways: [
      'Showcases international partnerships in lunar exploration and Earth climate monitoring.',
      'Provides engaging gamified approaches to complex aerospace engineering principles.'
    ]
  }
];

export const NASA_ANALOG_MISSIONS = [
  {
    name: 'James Webb Space Telescope (JWST)',
    agency: 'NASA / ESA / CSA',
    target: 'Sun-Earth L2 Lagrange Point',
    launchYear: 2021,
    launchVehicle: 'Ariane 5 ECA',
    mass: '6,161 kg',
    cost: '$10 Billion',
    keyInstruments: ['NIRCam', 'NIRSpec', 'MIRI (Cryocooled)', 'FGS/NIRISS (CSA)'],
    power: '2,000 W Solar Array',
    matchCriteria: {
      busClasses: ['Flagship Class', 'Medium Explorer'],
      instruments: ['inst_infrared_radiometer', 'inst_multispectral_cam'],
      powerType: 'Solar'
    },
    description: 'Premier space observatory observing the universe in infrared light with a 6.5-meter beryllium mirror and active cryocooler loop.'
  },
  {
    name: 'Lunar Reconnaissance Orbiter (LRO)',
    agency: 'NASA Goddard',
    target: 'Lunar Polar Low Orbit',
    launchYear: 2009,
    launchVehicle: 'Atlas V 401',
    mass: '1,916 kg',
    cost: '$583 Million',
    keyInstruments: ['LEND (Neutron Spectrometer)', 'LOLA (Laser Altimeter)', 'Diviner (Thermal Radiometer)', 'Mini-RF (Radar)'],
    power: '1,850 W Articulated Solar Array',
    matchCriteria: {
      targetBody: 'Moon',
      instruments: ['inst_neutron_spectrometer', 'inst_lidar_altimeter']
    },
    description: 'Mapped the Moon at unprecedented resolution, identifying water ice in permanently shadowed polar craters for the Artemis program.'
  },
  {
    name: 'Europa Clipper',
    agency: 'NASA JPL',
    target: 'Jupiter / Europa Flybys',
    launchYear: 2024,
    launchVehicle: 'Falcon Heavy',
    mass: '6,065 kg (Wet)',
    cost: '$5 Billion',
    keyInstruments: ['REASON (Ice-Penetrating Radar)', 'MASPEX (Gas Mass Spectrometer)', 'Europa-UVS', 'ECM (Magnetometer)'],
    power: 'Massive 30-meter Solar Wings (producing ~700W at Jupiter)',
    matchCriteria: {
      targetBody: 'Jupiter',
      instruments: ['inst_sar_radar', 'inst_mass_spectrometer', 'inst_magnetometer']
    },
    description: 'Flagship mission performing 49 low-altitude flybys of Europa to confirm subsurface ocean depth, salinity, and habitability.'
  },
  {
    name: 'NISAR (NASA-ISRO SAR)',
    agency: 'NASA / ISRO',
    target: 'Low Earth Orbit (Sun-Synchronous 747 km)',
    launchYear: 2024,
    launchVehicle: 'GSLV Mk II',
    mass: '2,800 kg',
    cost: '$1.5 Billion',
    keyInstruments: ['L-Band SAR (NASA)', 'S-Band SAR (ISRO)', '12m Deployable Reflector'],
    power: 'Deployable Solar Arrays',
    matchCriteria: {
      targetBody: 'Earth',
      instruments: ['inst_sar_radar']
    },
    description: 'World-first dual-frequency Synthetic Aperture Radar observatory mapping global land and ice surface deformation with millimeter accuracy.'
  },
  {
    name: 'Lunar Prospector',
    agency: 'NASA Ames / Discovery Program',
    target: 'Lunar Polar Orbit',
    launchYear: 1998,
    launchVehicle: 'Athena II',
    mass: '296 kg',
    cost: '$63 Million (SmallSat Class)',
    keyInstruments: ['Neutron Spectrometer', 'Gamma Ray Spectrometer', 'Magnetometer'],
    power: 'Body-Mounted Solar Cells',
    matchCriteria: {
      targetBody: 'Moon',
      busClasses: ['SmallSat', 'Medium Explorer'],
      instruments: ['inst_neutron_spectrometer']
    },
    description: 'Low-cost Discovery mission that provided the first direct spectral evidence of hydrogen deposits in lunar polar cold traps.'
  },
  {
    name: 'Mars Odyssey',
    agency: 'NASA JPL',
    target: 'Low Mars Orbit (Aerobraked)',
    launchYear: 2001,
    launchVehicle: 'Delta II 7925',
    mass: '725 kg',
    cost: '$297 Million',
    keyInstruments: ['THEMIS (Thermal Infrared Camera)', 'GRS / High-Energy Neutron Detector', 'MARIE'],
    power: 'Articulated Solar Wing + Li-Ion Batteries',
    matchCriteria: {
      targetBody: 'Mars',
      instruments: ['inst_infrared_radiometer', 'inst_multispectral_cam']
    },
    description: 'The longest-operating spacecraft at Mars, discovering vast subsurface water ice deposits beneath the Martian regolith.'
  }
];

export const CML_LEVELS = [
  {
    level: 1,
    name: 'CML 1: Cocktail Napkin / Science Question',
    shortDesc: 'A compelling scientific question is formulated without engineering quantification.',
    criteria: 'Core science objectives articulated, target celestial body selected.'
  },
  {
    level: 2,
    name: 'CML 2: Initial Feasibility Analysis',
    shortDesc: 'Physics feasibility bounds are evaluated. Orbital mechanics and rough sizing checked.',
    criteria: 'Delta-V rough estimation, payload mass order of magnitude determined.'
  },
  {
    level: 3,
    name: 'CML 3: Architecture Trade Studies (MDL Phase)',
    shortDesc: 'Multidisciplinary trade space explored (Solar vs RTG, Chemical vs Ion, Launcher trades).',
    criteria: 'Trade matrix generated, sensitivity to launch vehicle mass constraints evaluated.'
  },
  {
    level: 4,
    name: 'CML 4: Baseline Point Design',
    shortDesc: 'Single integrated spacecraft baseline point design with balanced mass, power, link, and cost budgets.',
    criteria: 'Master Equipment List (MEL) complete, mass margin >= 20%, power margin >= 20%.'
  },
  {
    level: 5,
    name: 'CML 5: Detailed Concept Formulation',
    shortDesc: 'Risk mitigation strategies, operational ConOps timeline, fault protection modes, and cost models locked.',
    criteria: 'Launch vehicle interface confirmed, ground station pass scheduling planned.'
  },
  {
    level: 6,
    name: 'CML 6: Preliminary Design Review (PDR)',
    shortDesc: 'Flight project approval milestone. Ready to proceed to critical design, fabrication, and flight hardware build.',
    criteria: 'All engineering disciplines demonstrate negative margins eliminated and mission success probable.'
  }
];

export const NASA_MISSION_SEGMENTS = [
  {
    name: 'Launch Segment',
    icon: '🚀',
    description: 'The launch vehicle, fairing adapters, launch pad facilities, and upper-stage ascent trajectory responsible for lifting the spacecraft out of Earth\'s gravity well.'
  },
  {
    name: 'Space Segment',
    icon: '🛰️',
    description: 'The orbiting spacecraft bus, structural chassis, electrical power systems, propulsion, attitude determination & control (ADCS), thermal control, and science payloads.'
  },
  {
    name: 'Ground Segment',
    icon: '📡',
    description: 'The tracking antennas, Deep Space Network (DSN) complexes (Goldstone, Madrid, Canberra), mission operations center (MOC), and flight dynamics controllers.'
  },
  {
    name: 'User / Science Segment',
    icon: '🔬',
    description: 'The scientific investigators, university researchers, and public stakeholders who ingest, calibrate, process, and extract breakthrough discoveries from telemetry.'
  }
];

export const MDL_STUDY_LEVELS = [
  {
    level: '1. Office Hours',
    focus: 'Rapid Brainstorming',
    description: '1-2 hour preliminary consult with chief engineers to identify fundamental physics roadblocks, novel instrument concepts, and potential heritage hardware.'
  },
  {
    level: '2. Concept Development',
    focus: 'Feasibility & Risk',
    description: 'High-level sizing and risk assessment to ensure mass, volume, and power stay within plausible bounds before dedicating full engineering teams.'
  },
  {
    level: '3. Trade Studies',
    focus: 'Architecture Comparison',
    description: 'Systematic comparison of architectural alternatives: chemical vs. electric propulsion, direct-to-Earth vs. relay communications, dedicated vs. rideshare launch.'
  },
  {
    level: '4. Point Design',
    focus: 'Master Equipment List (MEL)',
    description: 'Full concurrent engineering run resulting in component-by-component CAD structures, thermal models, power profiles, link budgets, and grassroots cost estimates.'
  }
];

export const CUBESAT_101_GUIDELINES = [
  {
    topic: 'Standardized Form Factors',
    rule: 'CubeSats are based on standardized 10×10×10 cm (1U) units, typically scaling to 3U, 6U, or 12U.',
    impact: 'Enables low-cost rideshare inside standardized deployer canisters (P-POD, CSD).'
  },
  {
    topic: '25-Year Orbital Debris Rule',
    rule: 'Spacecraft in Low Earth Orbit must naturally de-orbit via atmospheric drag within 25 years post-mission.',
    impact: 'Orbits above 600 km without active de-orbit propulsion fail NASA orbital debris requirements.'
  },
  {
    topic: 'Battery Safety & Inhibit Switches',
    rule: 'Batteries must have at least three independent electrical inhibits to prevent premature power-up in launch fairing.',
    impact: 'Protects the primary launch vehicle payload from inadvertent RF transmission or thermal runaway.'
  }
];

export const ENGINEERING_FORMULAS = [
  {
    name: 'Tsiolkovsky Rocket Equation',
    formula: 'ΔV = I_sp · g_0 · ln(m_initial / m_final)',
    explanation: 'Governs orbital manoeuvres. To achieve a given velocity change (ΔV), propellant mass scales exponentially based on the rocket engine specific impulse (I_sp).'
  },
  {
    name: 'Solar Flux Inverse-Square Law',
    formula: 'S = S_0 / d^2',
    explanation: 'Solar irradiance S drops with the square of the distance d from the Sun. At Mars (1.52 AU), power is 43% of Earth. At Jupiter (5.2 AU), power is only 3.7% of Earth!'
  },
  {
    name: 'Battery Depth of Discharge (DoD)',
    formula: 'DoD = (P_eclipse · t_eclipse) / (Capacity_Wh · V_bus)',
    explanation: 'The fraction of battery capacity expended during planetary shadow. Keeping DoD under 40-50% extends lithium-ion battery operational lifespan to 50,000+ orbital cycles.'
  },
  {
    name: 'Free Space Path Loss (Link Budget)',
    formula: 'FSPL = (4 · π · d / λ)^2',
    explanation: 'Signal attenuation across interplanetary distances. Doubling the distance quadruples signal attenuation (6 dB loss), demanding higher transmitter power, larger dish diameter, or reduced data rate.'
  },
  {
    name: 'GMAT Vis-Viva Orbital Velocity',
    formula: 'v = √(μ · (2/r - 1/a))',
    explanation: 'Calculates the instantaneous orbital velocity v at distance r given the gravitational parameter μ and semi-major axis a. Used in GMAT for maneuver execution.'
  },
  {
    name: 'Mass Margin Percentage',
    formula: 'Margin = (M_launch_capacity - M_wet) / M_launch_capacity · 100%',
    explanation: 'NASA standards require at least 15-20% mass growth margin during early design phases to absorb inevitable engineering uncertainties.'
  }
];

export const GLOSSARY_TERMS = [
  { term: 'Delta-V (ΔV)', definition: 'The total velocity increment required to complete orbital changes, insertions, or station-keeping manoeuvres, measured in m/s.' },
  { term: 'Specific Impulse (Isp)', definition: 'The efficiency of a rocket propulsion system, measured in seconds. Higher Isp means less propellant mass is needed for the same ΔV.' },
  { term: 'Dry Mass vs. Wet Mass', definition: 'Dry mass is the spacecraft structure, electronics, and instruments without fuel. Wet mass includes all propellants and pressurants ready for launch.' },
  { term: 'ADCS', definition: 'Attitude Determination and Control System: sensors (star trackers, sun sensors, gyros) and actuators (reaction wheels, thrusters) that orient the spacecraft.' },
  { term: 'Deep Space Network (DSN)', definition: 'NASA worldwide network of 34m and 70m antenna complexes in California, Spain, and Australia providing continuous deep space communications.' },
  { term: 'Sun-Synchronous Orbit (SSO)', definition: 'A nearly polar retrograde low Earth orbit that precesses at the exact rate the Earth orbits the Sun, ensuring identical lighting conditions.' },
  { term: 'Radioisotope Thermoelectric Generator (RTG)', definition: 'A nuclear space battery converting the natural radioactive decay heat of Plutonium-238 into electricity using thermocouples.' },
  { term: 'Synthetic Aperture Radar (SAR)', definition: 'An active radar imaging system that uses spacecraft orbital motion to synthesize a massive virtual antenna for high-resolution ground mapping.' }
];
