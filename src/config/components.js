/**
 * ASTROFORGE: NASA Space Mission Design Game
 * Comprehensive Spacecraft Subsystems, Instruments, Launch Vehicles & Orbits Catalog
 * Enhanced with NASA & Canadian Space Agency (CSA) Partner Resources
 */

export const LAUNCH_STATIONS = [
  {
    id: 'site_ksc',
    name: 'Kennedy Space Center (LC-39A / SLC-40)',
    operator: 'NASA / SpaceX / USSF',
    location: 'Cape Canaveral, Florida, USA',
    latitude: 28.57,
    longitude: -80.65,
    earthBoostMs: 408, // Earth equatorial rotation speed bonus
    azimuthMin: 35,
    azimuthMax: 120,
    idealOrbits: ['Low Earth Orbit (LEO)', 'Geostationary (GEO)', 'Lunar / Artemis Trajectories'],
    researchFocus: 'Apollo, Artemis, ISS Logistics, Space Telescopes (Hubble)',
    description: 'NASA flagship spaceport with massive ocean downrange safety corridor and strong Earth rotational boost for prograde orbits.',
    icon: '🌴',
    country: 'USA'
  },
  {
    id: 'site_vsfb',
    name: 'Vandenberg Space Force Base (SLC-4E)',
    operator: 'USSF / NASA / SpaceX',
    location: 'Santa Barbara County, California, USA',
    latitude: 34.63,
    longitude: -120.61,
    earthBoostMs: 382,
    azimuthMin: 140,
    azimuthMax: 220,
    idealOrbits: ['Sun-Synchronous (SSO)', 'Polar Orbit (90°)', 'Retrograde Reconnaissance'],
    researchFocus: 'Earth Observation, Climate Satellites, Wildfire Tracking, Ocean Topography',
    description: 'Premier Pacific launch corridor firing due south over open water without overland hazard, perfect for Polar Climate and Earth Observation satellites.',
    icon: '🌊',
    country: 'USA'
  },
  {
    id: 'site_csg',
    name: 'Guiana Space Centre (CSG / ELA-4)',
    operator: 'ESA / CNES / Arianespace',
    location: 'Kourou, French Guiana (Equatorial)',
    latitude: 5.23,
    longitude: -52.77,
    earthBoostMs: 463, // Maximum Earth boost
    azimuthMin: -10,
    azimuthMax: 95,
    idealOrbits: ['Equatorial LEO', 'Deep Space Probes', 'Interplanetary Exploration', 'GEO'],
    researchFocus: 'James Webb Space Telescope (JWST), BepiColombo, JUICE, Climate Research',
    description: 'Near-equatorial European spaceport providing maximum Earth spin velocity (+463 m/s), ideal for deep-space science probes requiring maximum propellant conservation.',
    icon: '🌴',
    country: 'French Guiana (ESA)'
  },
  {
    id: 'site_wallops',
    name: 'Wallops Flight Facility (MARS Pad 0A)',
    operator: 'NASA / MARS / Northrop Grumman',
    location: 'Eastern Shore of Virginia, USA',
    latitude: 37.83,
    longitude: -75.48,
    earthBoostMs: 367,
    azimuthMin: 60,
    azimuthMax: 140,
    idealOrbits: ['Mid-Inclination LEO (51.6°)', 'ISS Cargo / SmallSat Insertion', 'Suborbital'],
    researchFocus: 'Sounding Rockets, Upper Atmospheric Chemistry, SmallSat Constellations',
    description: 'NASA Mid-Atlantic Regional Spaceport specializing in responsive SmallSat deployment and atmospheric research sounding rockets.',
    icon: '🦅',
    country: 'USA'
  },
  {
    id: 'site_sdsc',
    name: 'Satish Dhawan Space Centre (SDSC SHAR)',
    operator: 'ISRO (Indian Space Research Organisation)',
    location: 'Sriharikota, Andhra Pradesh, India',
    latitude: 13.72,
    longitude: 80.23,
    earthBoostMs: 451,
    azimuthMin: 100,
    azimuthMax: 140,
    idealOrbits: ['Sun-Synchronous (SSO)', 'Lunar Trajectory (TLI)', 'Mars Interplanetary', 'GTO'],
    researchFocus: 'Chandrayaan (Lunar Water Ice), Aditya-L1 (Solar Corona), Mangalyaan',
    description: 'Flagship ISRO launch centre on the Bay of Bengal with a massive +451 m/s equatorial assist, historic launch site of Chandrayaan-3 and Aditya-L1 solar observatory.',
    icon: '🚀',
    country: 'India'
  },
  {
    id: 'site_tnsc',
    name: 'Tanegashima Space Center (TNSC)',
    operator: 'JAXA (Japan Aerospace Exploration Agency)',
    location: 'Kagoshima Prefecture, Tanegashima, Japan',
    latitude: 30.40,
    longitude: 130.97,
    earthBoostMs: 398,
    azimuthMin: 70,
    azimuthMax: 120,
    idealOrbits: ['Geostationary Transfer (GTO)', 'Asteroid Sample Return', 'ISS Kibo Resupply'],
    researchFocus: 'Hayabusa2 (Asteroid Sample Return), SLIM (Moon Precision Lander), XRISM',
    description: "JAXA's scenic seaside spaceport firing directly East over the open Pacific, world famous for the historic Hayabusa asteroid sample return missions.",
    icon: '🌸',
    country: 'Japan'
  },
  {
    id: 'site_baikonur',
    name: 'Baikonur Cosmodrome (Site 31/6)',
    operator: 'Roscosmos',
    location: 'Kyzylorda Region, Kazakhstan',
    latitude: 45.96,
    longitude: 63.30,
    earthBoostMs: 323,
    azimuthMin: 45,
    azimuthMax: 70,
    idealOrbits: ['High-Inclination LEO (51.6°)', 'ISS Crew / Cargo', 'Deep Space Probes'],
    researchFocus: 'Sputnik 1, Vostok 1 (First Human in Space), Mir, ISS Primary Crew Launches',
    description: "The world's first and largest operational spaceport, birthplace of the orbital age from which Yuri Gagarin launched into history.",
    icon: '⚡',
    country: 'Kazakhstan'
  },
  {
    id: 'site_esrange',
    name: 'Esrange Space Center',
    operator: 'SSC (Swedish Space Corporation)',
    location: 'Kiruna, Arctic Circle, Sweden',
    latitude: 67.89,
    longitude: 21.10,
    earthBoostMs: 175,
    azimuthMin: 340,
    azimuthMax: 20,
    idealOrbits: ['Polar Orbit', 'High-Latitude SSO', 'Suborbital Upper Atmosphere'],
    researchFocus: 'Aurora Borealis (Northern Lights), Arctic Ozone Layer, Microgravity Crystals',
    description: 'European Arctic rocket range above the Arctic Circle, uniquely positioned for direct in-situ probing of polar magnetosphere and auroral physics.',
    icon: '❄️',
    country: 'Sweden'
  },
  {
    id: 'site_woomera',
    name: 'Woomera Range Complex',
    operator: 'RAAF / Australian Space Agency',
    location: 'South Australia, Australia',
    latitude: -30.95,
    longitude: 136.53,
    earthBoostMs: 398,
    azimuthMin: 330,
    azimuthMax: 45,
    idealOrbits: ['Polar Orbit', 'Southern Sky Deep Space', 'Sample Capsule Recovery'],
    researchFocus: 'Hayabusa1 & Hayabusa2 Asteroid Capsule Landings, Southern Aurora Science',
    description: 'Vast Southern Hemisphere desert range renowned for deep-space telemetry tracking and safe recovery of extraterrestrial asteroid sample return capsules.',
    icon: '🦘',
    country: 'Australia'
  }
];

export const LAUNCH_VEHICLES = [
  {
    id: 'lv_pslv',
    name: 'PSLV-XL (ISRO)',
    class: 'Polar Satellite Launch Vehicle',
    cost: 32.0, // $ Millions
    leoCapacity: 3800, // kg
    tliCapacity: 1425, // kg
    marsCapacity: 1350, // kg
    reliability: 0.98,
    fairingDiameter: 3.2,
    description: 'ISRO legendary 4-stage workhorse with 50+ successful flights. Launched Chandrayaan-1, Mars Orbiter Mission (Mangalyaan), and Aditya-L1.'
  },
  {
    id: 'lv_lvm3',
    name: 'LVM3 / GSLV Mk III (ISRO)',
    class: 'Heavy Lift Launcher ("Fat Boy")',
    cost: 52.0, // $ Millions
    leoCapacity: 8000, // kg
    tliCapacity: 4000, // kg
    marsCapacity: 2500, // kg
    reliability: 0.99,
    fairingDiameter: 5.0,
    description: 'ISRO most powerful heavy launcher with twin massive S200 solid rocket boosters. Successfully delivered Chandrayaan-3 to lunar transfer trajectory.'
  },
  {
    id: 'lv_electron',
    name: 'Electron (Rocket Lab)',
    class: 'Small Launch Vehicle',
    cost: 7.5, // $ Millions
    leoCapacity: 300, // kg
    tliCapacity: 0, // Cannot reach Moon directly
    marsCapacity: 0,
    reliability: 0.94,
    fairingDiameter: 1.2, // meters
    description: 'Affordable dedicated rides for CubeSats and SmallSats. Ideal for quick Earth-observation missions.'
  },
  {
    id: 'lv_falcon9',
    name: 'Falcon 9 (SpaceX)',
    class: 'Medium/Heavy Reusable',
    cost: 67.0, // $ Millions
    leoCapacity: 17500, // kg
    tliCapacity: 4500, // kg to Trans-Lunar Injection
    marsCapacity: 4000, // kg to Trans-Mars Injection
    reliability: 0.99,
    fairingDiameter: 5.2,
    description: 'Workhorse reusable launcher with enormous payload capacity and industry-leading flight heritage.'
  },
  {
    id: 'lv_vulcan',
    name: 'Vulcan Centaur (ULA)',
    class: 'Heavy Lift Launcher',
    cost: 110.0, // $ Millions
    leoCapacity: 27200,
    tliCapacity: 7200,
    marsCapacity: 6000,
    reliability: 0.98,
    fairingDiameter: 5.4,
    description: 'High-energy upper stage Centaur V makes it exceptionally suited for deep space and high-C3 orbits.'
  },
  {
    id: 'lv_sls',
    name: 'SLS Block 1 (NASA)',
    class: 'Super Heavy Lift (Exploration)',
    cost: 850.0, // $ Millions
    leoCapacity: 95000,
    tliCapacity: 27000,
    marsCapacity: 20000,
    reliability: 0.99,
    fairingDiameter: 8.4,
    description: 'NASA flagship deep-space booster capable of hurling massive payloads and human-class infrastructure directly to the Moon and outer solar system.'
  }
];

export const TARGET_ORBITS = [
  {
    id: 'orbit_leo_sso',
    name: 'Low Earth Orbit - Sun-Synchronous (SSO)',
    targetBody: 'Earth',
    altitudeKm: 550,
    inclinationDeg: 97.5,
    periodMin: 95.6,
    semiMajorAxisKm: 6928,
    eccentricity: 0.001,
    gravitationalParamMu: 398600.44, // Earth mu km^3/s^2
    eclipseFraction: 0.35, // 35% of each orbit in Earth shadow
    solarFluxAU: 1.0, // 1361 W/m^2
    radiationLevel: 'Low',
    deltaVRequired: 9200, // m/s from surface
    deltaVStationKeeping: 25, // m/s per year
    downlinkLatencyMs: 15,
    description: 'Maintains constant lighting angle over terrain. Gold standard for optical Earth observation and wildfire monitoring.'
  },
  {
    id: 'orbit_geo',
    name: 'Geostationary Orbit (GEO)',
    targetBody: 'Earth',
    altitudeKm: 35786,
    inclinationDeg: 0.0,
    periodMin: 1436.0,
    semiMajorAxisKm: 42164,
    eccentricity: 0.0001,
    gravitationalParamMu: 398600.44,
    eclipseFraction: 0.05,
    solarFluxAU: 1.0,
    radiationLevel: 'Moderate (Van Allen belt proximity)',
    deltaVRequired: 13100,
    deltaVStationKeeping: 50,
    downlinkLatencyMs: 240,
    description: 'Matches Earth rotation period. Provides 24/7 continuous hemispheric coverage, essential for global weather and continuous communications.'
  },
  {
    id: 'orbit_lunar_polar',
    name: 'Lunar Polar Low Orbit',
    targetBody: 'Moon',
    altitudeKm: 100,
    inclinationDeg: 90.0,
    periodMin: 118.0,
    semiMajorAxisKm: 1837,
    eccentricity: 0.005,
    gravitationalParamMu: 4902.8, // Moon mu km^3/s^2
    eclipseFraction: 0.45,
    solarFluxAU: 1.0,
    radiationLevel: 'High (No magnetosphere)',
    deltaVRequired: 14200,
    deltaVStationKeeping: 120, // High due to mascons (lunar mass concentrations)
    downlinkLatencyMs: 1300,
    description: 'Repeatedly passes over the lunar poles. Essential for surveying permanently shadowed craters (PSRs) for water ice.'
  },
  {
    id: 'orbit_mars_low',
    name: 'Low Mars Orbit (LMO Aerobraked)',
    targetBody: 'Mars',
    altitudeKm: 320,
    inclinationDeg: 93.0,
    periodMin: 112.0,
    semiMajorAxisKm: 3716,
    eccentricity: 0.008,
    gravitationalParamMu: 42828.3, // Mars mu km^3/s^2
    eclipseFraction: 0.40,
    solarFluxAU: 1.524, // Solar flux drops to 43% of Earth!
    radiationLevel: 'Very High (Interplanetary + thin atmosphere)',
    deltaVRequired: 15800,
    deltaVStationKeeping: 30,
    downlinkLatencyMs: 840000, // 14 minutes avg one-way!
    description: 'Low-altitude polar orbit enabling high-resolution surface spectrometry and monitoring of global dust storms.'
  },
  {
    id: 'orbit_europa_flyby',
    name: 'Jovian Orbit with Europa Flybys',
    targetBody: 'Jupiter',
    altitudeKm: 670900,
    inclinationDeg: 1.8,
    periodMin: 5040.0,
    semiMajorAxisKm: 742000,
    eccentricity: 0.09,
    gravitationalParamMu: 126686534, // Jupiter mu km^3/s^2
    eclipseFraction: 0.20,
    solarFluxAU: 5.204, // Solar flux is only 3.7% of Earth!
    radiationLevel: 'Extreme (Jupiter deadly radiation belts)',
    deltaVRequired: 18500,
    deltaVStationKeeping: 80,
    downlinkLatencyMs: 2500000, // ~42 minutes one-way!
    description: 'Highly elliptical Jovian orbit that dives into Europa to sample subsurface ocean water plumes while minimizing radiation residence.'
  }
];

export const BUS_PLATFORMS = [
  {
    id: 'bus_cubesat_12u',
    name: '12U Modular CubeSat Bus (CSLI Compliant)',
    class: 'SmallSat',
    dryMass: 14.0, // kg
    cost: 3.5, // $M
    volumeLiters: 24.0,
    maxPayloadMass: 10.0, // kg
    basePowerDrawW: 15.0, // W
    radiationShieldingMmAl: 2.0,
    pointingAccuracyDeg: 0.1,
    cubesat101Compliant: true,
    description: 'Compact standardized CubeSat structure with integrated avionics. Built to NASA CSLI / CubeSat 101 standards with 3-inhibit safety switches.'
  },
  {
    id: 'bus_espa_medium',
    name: 'ESPA-Class Intermediate Bus',
    class: 'Medium Explorer',
    dryMass: 180.0, // kg
    cost: 28.0, // $M
    volumeLiters: 450.0,
    maxPayloadMass: 120.0,
    basePowerDrawW: 85.0,
    radiationShieldingMmAl: 6.0,
    pointingAccuracyDeg: 0.01,
    cubesat101Compliant: false,
    description: 'Balanced platform riding as secondary or dedicated explorer. Generous mass margin and capable of interplanetary operations.'
  },
  {
    id: 'bus_flagship',
    name: 'Flagship Heavy Science Platform',
    class: 'Flagship Class',
    dryMass: 1450.0, // kg
    cost: 165.0, // $M
    volumeLiters: 5500.0,
    maxPayloadMass: 850.0,
    basePowerDrawW: 320.0,
    radiationShieldingMmAl: 14.0,
    pointingAccuracyDeg: 0.001,
    cubesat101Compliant: false,
    description: 'Heavy radiation-hardened titanium/composite chassis engineered for multi-decade deep space flagship missions.'
  }
];

export const SCIENTIFIC_INSTRUMENTS = [
  {
    id: 'inst_multispectral_cam',
    name: 'High-Res Multispectral Camera',
    category: 'Imaging',
    mass: 12.0, // kg
    powerDrawW: 35.0,
    dataRateMbps: 45.0,
    cost: 8.5, // $M
    scienceYield: 75, // Science Points
    primaryTarget: ['Earth', 'Moon', 'Mars'],
    description: 'Captures visual, near-infrared, and shortwave bands. Maps surface vegetation, mineral distribution, and crater geography.'
  },
  {
    id: 'inst_neutron_spectrometer',
    name: 'Thermal/Epithermal Neutron Spectrometer',
    category: 'Spectrometry',
    mass: 8.5,
    powerDrawW: 18.0,
    dataRateMbps: 0.8,
    cost: 6.0,
    scienceYield: 90,
    primaryTarget: ['Moon', 'Mars'],
    description: 'Measures hydrogen concentration in the top meter of regolith. Primary instrument for detecting subsurface water ice deposits.'
  },
  {
    id: 'inst_sar_radar',
    name: 'L/S-Band Synthetic Aperture Radar (NISAR/RADARSAT Heritage)',
    category: 'Active Radar',
    mass: 65.0,
    powerDrawW: 240.0,
    dataRateMbps: 120.0,
    cost: 34.0,
    scienceYield: 130,
    primaryTarget: ['Earth', 'Moon', 'Europa'],
    description: 'Peers through cloud cover, night, and loose regolith. Yields millimeter-scale surface deformation and dielectric subsurface profiles.'
  },
  {
    id: 'inst_magnetometer',
    name: 'Fluxgate Magnetometer Boom',
    category: 'Field & Particles',
    mass: 3.5,
    powerDrawW: 6.0,
    dataRateMbps: 0.2,
    cost: 3.2,
    scienceYield: 60,
    primaryTarget: ['Earth', 'Mars', 'Jupiter'],
    description: 'Measures planetary and interplanetary magnetic fields. Essential for crustal magnetism and induced ocean currents on icy moons.'
  },
  {
    id: 'inst_mass_spectrometer',
    name: 'Gas Chromatography Neutral Mass Spectrometer',
    category: 'In-situ Sampling',
    mass: 16.0,
    powerDrawW: 45.0,
    dataRateMbps: 2.5,
    cost: 16.0,
    scienceYield: 110,
    primaryTarget: ['Mars', 'Europa'],
    description: 'Identifies volatile chemical species, organic molecules, and isotopic ratios in atmospheric plumes or tenuous exospheres.'
  },
  {
    id: 'inst_lidar_altimeter',
    name: 'Pulsed Laser LIDAR Topographic Altimeter',
    category: 'Active Optical',
    mass: 14.0,
    powerDrawW: 55.0,
    dataRateMbps: 8.0,
    cost: 12.0,
    scienceYield: 85,
    primaryTarget: ['Moon', 'Mars', 'Earth'],
    description: 'Creates ultra-precise 3D digital elevation models of terrain, landing site hazards, and crater slope gradients.'
  },
  {
    id: 'inst_infrared_radiometer',
    name: 'Thermal Infrared Sounder & Radiometer',
    category: 'Atmospheric & Thermal',
    mass: 9.0,
    powerDrawW: 25.0,
    dataRateMbps: 5.0,
    cost: 7.5,
    scienceYield: 80,
    primaryTarget: ['Earth', 'Mars'],
    description: 'Measures surface thermal inertia, cloud top temperatures, and atmospheric trace greenhouse gases.'
  },
  {
    id: 'inst_csa_canadarm_boom',
    name: 'Canadarm Inspection & Service Boom (CSA/MDA Partner)',
    category: 'Robotics & Triage',
    mass: 15.0,
    powerDrawW: 22.0,
    dataRateMbps: 4.0,
    cost: 11.5,
    scienceYield: 70,
    primaryTarget: ['Moon', 'Earth', 'Jupiter'],
    description: 'Canadian Space Agency robotic arm equipped with micro-cameras and sensor probe. Provides external spacecraft self-inspection and micrometeorite repair capability.'
  },
  {
    id: 'inst_chaste_thermal',
    name: 'ChaSTE & APXS In-Situ Probe (Chandrayaan-3 Heritage)',
    category: 'Surface Thermo & Element',
    mass: 10.0,
    powerDrawW: 24.0,
    dataRateMbps: 1.2,
    cost: 7.0,
    scienceYield: 95,
    primaryTarget: ['Moon', 'Mars'],
    description: 'Measures thermal conductivity of lunar south polar regolith down to 10cm and Alpha Particle X-ray Spectrometry for in-situ elemental detection (Sulfur, Iron, Titanium).'
  },
  {
    id: 'inst_velc_coronagraph',
    name: 'VELC & SUIT Solar Coronagraph (Aditya-L1 Heritage)',
    category: 'Heliophysics Optical',
    mass: 38.0,
    powerDrawW: 85.0,
    dataRateMbps: 28.0,
    cost: 22.0,
    scienceYield: 120,
    primaryTarget: ['Sun', 'Earth', 'Jupiter'],
    description: 'Visible Emission Line Coronagraph and Solar Ultraviolet Imaging Telescope. Records solar coronal dynamics, magnetic switchbacks, and early warning CME triggers.'
  }
];

export const POWER_SYSTEMS = [
  {
    id: 'pwr_body_panels',
    name: 'Body-Mounted Silicon Solar Cells',
    type: 'Solar',
    mass: 3.0, // kg
    baseOutputWatts: 45.0, // at 1 AU in direct sun
    cost: 1.2, // $M
    degradationPerYear: 0.03,
    description: 'Compact, no deployment mechanisms, zero moving parts. Limited surface area and lower power output.'
  },
  {
    id: 'pwr_deployable_gaas',
    name: 'Deployable Triple-Junction GaAs Solar Arrays',
    type: 'Solar',
    mass: 18.0,
    baseOutputWatts: 380.0, // at 1 AU
    cost: 7.5,
    degradationPerYear: 0.02,
    description: 'High-efficiency space-grade multi-junction arrays that unfold after orbit insertion. Great power-to-mass ratio.'
  },
  {
    id: 'pwr_large_articulated',
    name: 'Dual-Wing Sun-Tracking Solar Wings (12m²)',
    type: 'Solar',
    mass: 55.0,
    baseOutputWatts: 1400.0, // at 1 AU
    cost: 22.0,
    degradationPerYear: 0.015,
    description: 'Large motorized tracking arrays providing substantial continuous power. Required for power-hungry radar instruments.'
  },
  {
    id: 'pwr_rtg_nextgen',
    name: 'NextGen Radioisotope Thermoelectric Generator (RTG)',
    type: 'Nuclear',
    mass: 42.0,
    baseOutputWatts: 125.0, // Constant regardless of solar distance or eclipses!
    cost: 65.0,
    degradationPerYear: 0.008,
    description: 'Powered by Plutonium-238 decay heat. Operates completely independently of sunlight, night, or planetary shadows. Essential for Jupiter/Europa.'
  }
];

export const BATTERY_SYSTEMS = [
  {
    id: 'bat_small_liion',
    name: 'SmallSat 120 Wh Li-Ion Battery Pack',
    mass: 2.2, // kg
    capacityWh: 120.0,
    cost: 0.8,
    maxSafeDoD: 0.40 // 40% Depth of discharge for long cycle life
  },
  {
    id: 'bat_medium_liion',
    name: 'Modular 650 Wh Space-Grade Battery Bank',
    mass: 9.5,
    capacityWh: 650.0,
    cost: 2.8,
    maxSafeDoD: 0.50
  },
  {
    id: 'bat_heavy_liion',
    name: 'Heavy-Duty 2400 Wh Redundant Battery System',
    mass: 28.0,
    capacityWh: 2400.0,
    cost: 8.5,
    maxSafeDoD: 0.60
  }
];

export const PROPULSION_SYSTEMS = [
  {
    id: 'prop_cold_gas',
    name: 'Cold Gas Nitrogen Thruster System',
    type: 'Reaction Control',
    dryMass: 4.0, // kg
    ispSeconds: 70, // Specific impulse in seconds
    cost: 1.5,
    deltaVCapableMs: 65, // Typical delta V provided
    fuelMass: 5.0,
    description: 'Clean, non-toxic, highly reliable fine-attitude impulse thrusters. Very low Isp.'
  },
  {
    id: 'prop_hydrazine_monoprop',
    name: 'Hydrazine Monopropellant Chemical Propulsion',
    type: 'Chemical',
    dryMass: 18.0,
    ispSeconds: 225,
    cost: 6.8,
    deltaVCapableMs: 450,
    fuelMass: 45.0,
    description: 'High-thrust catalytic hydrazine engine. Reliable for orbit insertion, trajectory correction manoeuvres, and de-orbit burns.'
  },
  {
    id: 'prop_bipropellant',
    name: 'Bipropellant High-Thrust Engine (MMH/NTO)',
    type: 'Chemical',
    dryMass: 42.0,
    ispSeconds: 320,
    cost: 16.0,
    deltaVCapableMs: 1400,
    fuelMass: 180.0,
    description: 'Standard exploration main engine for high-energy orbit capture around Moon and Mars.'
  },
  {
    id: 'prop_hall_ion',
    name: 'Hall-Effect Electric Xenon Ion Thruster',
    type: 'Electric',
    dryMass: 25.0,
    ispSeconds: 1850,
    cost: 18.5,
    deltaVCapableMs: 3200,
    fuelMass: 35.0,
    powerDrawW: 450.0, // Requires substantial electrical power!
    description: 'Extremely fuel-efficient continuous thrust engine. High delta-V per kilogram of propellant, but requires significant electrical power.'
  }
];

export const COMMUNICATIONS_SYSTEMS = [
  {
    id: 'comm_s_band_omni',
    name: 'S-Band Low-Gain Patch Antennas (Omni)',
    mass: 2.0,
    powerTxW: 10.0,
    maxDataRateMbps: 0.25, // 250 kbps
    cost: 1.2,
    groundNetwork: 'Near Earth Network (NEN)',
    description: 'Broad omnidirectional beam. Cannot lose lock during tumbling, but very low data throughput.'
  },
  {
    id: 'comm_x_band_horn',
    name: 'X-Band Steerable Medium-Gain Horn',
    mass: 6.5,
    powerTxW: 35.0,
    maxDataRateMbps: 12.0,
    cost: 4.8,
    groundNetwork: 'NEN / Deep Space Network (DSN)',
    description: 'Workhorse scientific communication link for orbital data downlink and deep space telemetry.'
  },
  {
    id: 'comm_ka_band_dish',
    name: 'Ka-Band 1.8m High-Gain Parabolic Reflector',
    mass: 24.0,
    powerTxW: 90.0,
    maxDataRateMbps: 150.0,
    cost: 14.0,
    groundNetwork: 'Deep Space Network 34m/70m',
    description: 'High-throughput directional dish. Requires precise pointing towards Earth ground stations.'
  },
  {
    id: 'comm_optical_laser',
    name: 'Deep Space Optical Communications (DSOC Laser)',
    mass: 16.0,
    powerTxW: 75.0,
    maxDataRateMbps: 350.0,
    cost: 21.0,
    groundNetwork: 'Optical Ground Stations (Palomar/Haleakala)',
    description: 'Cutting-edge optical infrared laser link. 10x-100x higher data rate than radio, but susceptible to ground cloud cover.'
  }
];

export const ATTITUDE_THERMAL_SYSTEMS = [
  {
    id: 'adcs_reaction_wheels',
    name: '3-Axis Reaction Wheels + Dual Star Trackers',
    category: 'ADCS',
    mass: 6.0,
    powerDrawW: 18.0,
    pointingArcsec: 15,
    cost: 3.5,
    description: 'Fine 3-axis gyro-stabilization and optical star pattern matching for pin-point instrument pointing.'
  },
  {
    id: 'thermal_passive_radiators',
    name: 'Multi-Layer Insulation (MLI) & Passive Radiator Panels',
    category: 'Thermal',
    mass: 4.5,
    powerDrawW: 0.0,
    heatDissipationW: 200,
    cost: 1.8,
    description: 'Reflective gold/mylar thermal blankets and louvers. Passive, highly reliable thermal balancing.'
  },
  {
    id: 'thermal_active_cryocooler',
    name: 'Pulse Tube Cryocooler Loop',
    category: 'Thermal',
    mass: 11.0,
    powerDrawW: 60.0,
    heatDissipationW: 450,
    cost: 8.5,
    description: 'Cools sensitive infrared and optical detectors down to 77 Kelvin to suppress thermal noise.'
  }
];
