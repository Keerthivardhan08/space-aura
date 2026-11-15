/**
 * SPACE-AURA: Scientific Spacecraft Subsystem SVG Blueprints
 * Generates distinct, high-contrast, authentic vector blueprint diagrams
 * for every single spacecraft instrument, sensor, engine, power system, and bus!
 */

export function getPartBlueprintSVG(category, partId) {
  // Common SVG wrapper dimensions: 120 x 70
  const wrap = (content) => `
    <svg class="part-blueprint-svg" viewBox="0 0 120 70" width="120" height="70" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="plasmaGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#0284c7" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="rtgGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#d97706" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="goldMLI" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fde047"/>
          <stop offset="50%" stop-color="#eab308"/>
          <stop offset="100%" stop-color="#ca8a04"/>
        </linearGradient>
      </defs>
      ${content}
    </svg>
  `;

  // ==================== 1. SENSORS & SCIENTIFIC INSTRUMENTS ====================
  if (partId === 'inst_multispectral_cam') {
    // Optical Telescope Barrel with Gold Sunshade Hood & Lens
    return wrap(`
      <rect x="25" y="22" width="55" height="26" rx="3" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
      <path d="M80 18 L96 14 L96 56 L80 52 Z" fill="url(#goldMLI)" stroke="#facc15" stroke-width="1.2"/>
      <ellipse cx="96" cy="35" rx="4" ry="21" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5"/>
      <line x1="96" y1="14" x2="96" y2="56" stroke="#e0f2fe" stroke-width="1" stroke-dasharray="2,2"/>
      <rect x="15" y="27" width="10" height="16" fill="#0f172a" stroke="#64748b" stroke-width="1"/>
      <text x="50" y="38" font-size="7" font-weight="bold" fill="#38bdf8" font-family="monospace" text-anchor="middle">OPTICAL CASSEGRAIN</text>
    `);
  }

  if (partId === 'inst_neutron_spectrometer') {
    // Dual Helium-3 tubes & polyethylene moderator
    return wrap(`
      <rect x="20" y="20" width="70" height="30" rx="4" fill="#334155" stroke="#94a3b8" stroke-width="1.2"/>
      <rect x="25" y="24" width="60" height="8" rx="3" fill="#cbd5e1" stroke="#f1f5f9" stroke-width="1"/>
      <rect x="25" y="38" width="60" height="8" rx="3" fill="#cbd5e1" stroke="#f1f5f9" stroke-width="1"/>
      <rect x="42" y="23" width="26" height="24" fill="#0f172a" stroke="#f59e0b" stroke-width="1.2"/>
      <text x="55" y="37" font-size="7" font-weight="bold" fill="#f59e0b" font-family="monospace" text-anchor="middle">He-3 / CADMIUM</text>
    `);
  }

  if (partId === 'inst_sar_radar') {
    // Large Phased-Array Grid Panel & Feed Horns
    return wrap(`
      <rect x="15" y="15" width="90" height="40" rx="2" fill="#0f172a" stroke="#ca8a04" stroke-width="1.5"/>
      <rect x="18" y="18" width="84" height="34" fill="url(#goldMLI)" stroke="#facc15" stroke-width="1"/>
      <line x1="39" y1="18" x2="39" y2="52" stroke="#78350f" stroke-width="0.8"/>
      <line x1="60" y1="18" x2="60" y2="52" stroke="#78350f" stroke-width="0.8"/>
      <line x1="81" y1="18" x2="81" y2="52" stroke="#78350f" stroke-width="0.8"/>
      <line x1="18" y1="35" x2="102" y2="35" stroke="#78350f" stroke-width="0.8"/>
      <circle cx="28" cy="35" r="3" fill="#38bdf8"/>
      <circle cx="50" cy="35" r="3" fill="#38bdf8"/>
      <circle cx="70" cy="35" r="3" fill="#38bdf8"/>
      <circle cx="92" cy="35" r="3" fill="#38bdf8"/>
      <text x="60" y="62" font-size="7" font-weight="bold" fill="#facc15" font-family="monospace" text-anchor="middle">PHASED ARRAY RADAR</text>
    `);
  }

  if (partId === 'inst_magnetometer') {
    // Angled deployable boom mast with dual sensor spheres
    return wrap(`
      <line x1="15" y1="58" x2="85" y2="18" stroke="#38bdf8" stroke-width="2.5"/>
      <circle cx="15" cy="58" r="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5"/>
      <circle cx="50" cy="38" r="3" fill="#64748b"/>
      <circle cx="85" cy="18" r="7" fill="url(#goldMLI)" stroke="#facc15" stroke-width="1.5"/>
      <circle cx="98" cy="12" r="5" fill="url(#goldMLI)" stroke="#facc15" stroke-width="1.2"/>
      <line x1="85" y1="18" x2="98" y2="12" stroke="#eab308" stroke-width="1.5"/>
      <text x="60" y="62" font-size="7" font-weight="bold" fill="#38bdf8" font-family="monospace" text-anchor="middle">FLUXGATE BOOM</text>
    `);
  }

  if (partId === 'inst_mass_spectrometer') {
    // Quadrupole vacuum chamber with sniffer cone
    return wrap(`
      <rect x="35" y="24" width="45" height="22" rx="3" fill="url(#goldMLI)" stroke="#eab308" stroke-width="1.2"/>
      <path d="M80 28 L98 22 L98 48 L80 42 Z" fill="#94a3b8" stroke="#f1f5f9" stroke-width="1.2"/>
      <rect x="20" y="28" width="15" height="14" rx="2" fill="#0f172a" stroke="#64748b" stroke-width="1"/>
      <circle cx="48" cy="35" r="4" fill="#f59e0b"/>
      <circle cx="62" cy="35" r="4" fill="#f59e0b"/>
      <text x="58" y="60" font-size="7" font-weight="bold" fill="#f59e0b" font-family="monospace" text-anchor="middle">QUADRUPOLE MASS SPEC</text>
    `);
  }

  if (partId === 'inst_lidar_altimeter') {
    // Dual optic emitter & receiver with laser beam
    return wrap(`
      <rect x="25" y="20" width="30" height="30" rx="3" fill="#1e293b" stroke="#38bdf8" stroke-width="1.2"/>
      <circle cx="40" cy="35" r="8" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5"/>
      <rect x="65" y="25" width="22" height="20" rx="2" fill="#064e3b" stroke="#10b981" stroke-width="1.2"/>
      <circle cx="76" cy="35" r="6" fill="#10b981"/>
      <line x1="76" y1="35" x2="115" y2="35" stroke="#34d399" stroke-width="2" stroke-dasharray="3,2"/>
      <text x="60" y="62" font-size="7" font-weight="bold" fill="#10b981" font-family="monospace" text-anchor="middle">PULSED Nd:YAG LIDAR</text>
    `);
  }

  if (partId === 'inst_infrared_radiometer') {
    // Cryogenic dewar flask & cold cone
    return wrap(`
      <rect x="25" y="20" width="40" height="30" rx="4" fill="url(#goldMLI)" stroke="#ca8a04" stroke-width="1.2"/>
      <path d="M65 24 L92 15 L92 55 L65 46 Z" fill="#64748b" stroke="#94a3b8" stroke-width="1.2"/>
      <ellipse cx="92" cy="35" rx="3" ry="18" fill="#b45309" stroke="#f59e0b" stroke-width="1.2"/>
      <text x="58" y="62" font-size="7" font-weight="bold" fill="#f59e0b" font-family="monospace" text-anchor="middle">CRYOGENIC INFRARED</text>
    `);
  }

  if (partId === 'inst_csa_canadarm_boom') {
    // Canadian robotic manipulator arm with gripper
    return wrap(`
      <line x1="15" y1="52" x2="48" y2="24" stroke="#f1f5f9" stroke-width="4"/>
      <circle cx="48" cy="24" r="5" fill="#38bdf8" stroke="#0284c7" stroke-width="1.5"/>
      <line x1="48" y1="24" x2="88" y2="40" stroke="#f1f5f9" stroke-width="3.5"/>
      <circle cx="88" cy="40" r="4" fill="#38bdf8"/>
      <path d="M88 40 L102 32 M88 40 L102 48" stroke="#facc15" stroke-width="2"/>
      <rect x="24" y="32" width="8" height="6" fill="#ef4444"/>
      <text x="60" y="62" font-size="7" font-weight="bold" fill="#f87171" font-family="monospace" text-anchor="middle">CSA CANADARM</text>
    `);
  }

  if (partId === 'inst_chaste_thermal') {
    // Chandrayaan ChaSTE thermal needle & APXS head
    return wrap(`
      <rect x="30" y="20" width="35" height="26" rx="2" fill="#0f172a" stroke="#eab308" stroke-width="1.5"/>
      <circle cx="47" cy="33" r="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1"/>
      <circle cx="47" cy="33" r="3" fill="#eab308"/>
      <!-- Thermal needle penetration probe -->
      <line x1="65" y1="33" x2="95" y2="33" stroke="#f59e0b" stroke-width="3"/>
      <polygon points="95,30 102,33 95,36" fill="#ef4444"/>
      <text x="60" y="60" font-size="7" font-weight="bold" fill="#facc15" font-family="monospace" text-anchor="middle">CHASTE / APXS PROBE</text>
    `);
  }

  if (partId === 'inst_velc_coronagraph') {
    // Aditya-L1 VELC coronagraph aperture & occulting disk
    return wrap(`
      <rect x="25" y="16" width="70" height="34" rx="3" fill="#0f172a" stroke="#f97316" stroke-width="1.5"/>
      <circle cx="50" cy="33" r="12" fill="#1e1b4b" stroke="#f97316" stroke-width="1"/>
      <!-- Central occulting disk creating artificial solar eclipse -->
      <circle cx="50" cy="33" r="6" fill="#020617"/>
      <circle cx="50" cy="33" r="8" fill="none" stroke="#fb923c" stroke-width="1" stroke-dasharray="2,2"/>
      <rect x="75" y="24" width="12" height="18" fill="#334155" stroke="#94a3b8" stroke-width="1"/>
      <text x="60" y="60" font-size="7" font-weight="bold" fill="#fb923c" font-family="monospace" text-anchor="middle">VELC CORONAGRAPH</text>
    `);
  }

  // ==================== 2. POWER SYSTEMS ====================
  if (partId === 'pwr_body_panels') {
    return wrap(`
      <rect x="35" y="15" width="50" height="40" rx="3" fill="#0f172a" stroke="#0284c7" stroke-width="1.5"/>
      <rect x="38" y="18" width="44" height="34" fill="#1e3a8a" stroke="#38bdf8" stroke-width="1"/>
      <line x1="52" y1="18" x2="52" y2="52" stroke="#60a5fa" stroke-width="0.8"/>
      <line x1="68" y1="18" x2="68" y2="52" stroke="#60a5fa" stroke-width="0.8"/>
      <text x="60" y="62" font-size="7" font-weight="bold" fill="#38bdf8" font-family="monospace" text-anchor="middle">BODY-MOUNTED CELLS</text>
    `);
  }

  if (partId === 'pwr_deployable_gaas') {
    return wrap(`
      <rect x="52" y="24" width="16" height="22" rx="2" fill="#1e293b" stroke="#64748b" stroke-width="1"/>
      <!-- Left Wing -->
      <rect x="10" y="20" width="38" height="30" rx="2" fill="#1e3a8a" stroke="#38bdf8" stroke-width="1.2"/>
      <line x1="22" y1="20" x2="22" y2="50" stroke="#60a5fa" stroke-width="0.8"/>
      <line x1="35" y1="20" x2="35" y2="50" stroke="#60a5fa" stroke-width="0.8"/>
      <line x1="48" y1="35" x2="52" y2="35" stroke="#94a3b8" stroke-width="2"/>
      <!-- Right Wing -->
      <rect x="72" y="20" width="38" height="30" rx="2" fill="#1e3a8a" stroke="#38bdf8" stroke-width="1.2"/>
      <line x1="84" y1="20" x2="84" y2="50" stroke="#60a5fa" stroke-width="0.8"/>
      <line x1="97" y1="20" x2="97" y2="50" stroke="#60a5fa" stroke-width="0.8"/>
      <line x1="68" y1="35" x2="72" y2="35" stroke="#94a3b8" stroke-width="2"/>
      <text x="60" y="62" font-size="7" font-weight="bold" fill="#60a5fa" font-family="monospace" text-anchor="middle">DEPLOYABLE GaAs WINGS</text>
    `);
  }

  if (partId === 'pwr_large_articulated') {
    return wrap(`
      <rect x="53" y="22" width="14" height="26" rx="2" fill="#0f172a" stroke="#64748b" stroke-width="1"/>
      <!-- Left 5-panel wing -->
      <rect x="4" y="16" width="45" height="38" rx="2" fill="#172554" stroke="#38bdf8" stroke-width="1.2"/>
      <line x1="4" y1="16" x2="49" y2="54" stroke="#1d4ed8" stroke-width="0.8"/>
      <line x1="4" y1="54" x2="49" y2="16" stroke="#1d4ed8" stroke-width="0.8"/>
      <line x1="49" y1="35" x2="53" y2="35" stroke="#f59e0b" stroke-width="2.5"/>
      <!-- Right 5-panel wing -->
      <rect x="71" y="16" width="45" height="38" rx="2" fill="#172554" stroke="#38bdf8" stroke-width="1.2"/>
      <line x1="71" y1="16" x2="116" y2="54" stroke="#1d4ed8" stroke-width="0.8"/>
      <line x1="71" y1="54" x2="116" y2="16" stroke="#1d4ed8" stroke-width="0.8"/>
      <line x1="67" y1="35" x2="71" y2="35" stroke="#f59e0b" stroke-width="2.5"/>
      <text x="60" y="62" font-size="7" font-weight="bold" fill="#38bdf8" font-family="monospace" text-anchor="middle">HEAVY ARTICULATED ARRAY</text>
    `);
  }

  if (partId === 'pwr_rtg_nextgen') {
    return wrap(`
      <circle cx="60" cy="35" r="28" fill="url(#rtgGlow)"/>
      <rect x="35" y="20" width="50" height="30" rx="4" fill="#18181b" stroke="#71717a" stroke-width="1.5"/>
      <!-- 8 cooling fins -->
      <line x1="30" y1="20" x2="90" y2="20" stroke="#f59e0b" stroke-width="1.5"/>
      <line x1="30" y1="25" x2="90" y2="25" stroke="#f59e0b" stroke-width="1.5"/>
      <line x1="30" y1="30" x2="90" y2="30" stroke="#f59e0b" stroke-width="1.5"/>
      <line x1="30" y1="40" x2="90" y2="40" stroke="#f59e0b" stroke-width="1.5"/>
      <line x1="30" y1="45" x2="90" y2="45" stroke="#f59e0b" stroke-width="1.5"/>
      <line x1="30" y1="50" x2="90" y2="50" stroke="#f59e0b" stroke-width="1.5"/>
      <circle cx="60" cy="35" r="6" fill="#f59e0b"/>
      <text x="60" y="37" font-size="6" font-weight="bold" fill="#000" font-family="sans-serif" text-anchor="middle">☢</text>
      <text x="60" y="62" font-size="7" font-weight="bold" fill="#f59e0b" font-family="monospace" text-anchor="middle">NUCLEAR RTG-238</text>
    `);
  }

  // ==================== 3. PROPULSION SYSTEMS ====================
  if (partId === 'prop_cold_gas') {
    return wrap(`
      <rect x="42" y="20" width="36" height="26" rx="3" fill="#334155" stroke="#94a3b8" stroke-width="1.2"/>
      <path d="M38 24 L28 18 L28 30 Z" fill="#94a3b8"/>
      <path d="M82 24 L92 18 L92 30 Z" fill="#94a3b8"/>
      <path d="M38 38 L28 32 L28 44 Z" fill="#94a3b8"/>
      <path d="M82 38 L92 32 L92 44 Z" fill="#94a3b8"/>
      <text x="60" y="35" font-size="6" font-weight="bold" fill="#e2e8f0" font-family="monospace" text-anchor="middle">GN2</text>
      <text x="60" y="60" font-size="7" font-weight="bold" fill="#94a3b8" font-family="monospace" text-anchor="middle">COLD GAS MANIFOLD</text>
    `);
  }

  if (partId === 'prop_hydrazine_monoprop') {
    return wrap(`
      <rect x="46" y="16" width="28" height="18" rx="2" fill="#475569" stroke="#94a3b8" stroke-width="1.2"/>
      <path d="M50 34 L70 34 L80 54 L40 54 Z" fill="#94a3b8" stroke="#cbd5e1" stroke-width="1.2"/>
      <line x1="48" y1="25" x2="72" y2="25" stroke="#f59e0b" stroke-width="1.5"/>
      <text x="60" y="62" font-size="7" font-weight="bold" fill="#cbd5e1" font-family="monospace" text-anchor="middle">CATALYTIC HYDRAZINE</text>
    `);
  }

  if (partId === 'prop_bipropellant') {
    return wrap(`
      <rect x="44" y="14" width="32" height="16" rx="2" fill="#1e293b" stroke="#64748b" stroke-width="1.2"/>
      <path d="M48 30 L72 30 L88 56 L32 56 Z" fill="#64748b" stroke="#94a3b8" stroke-width="1.5"/>
      <!-- Cooling coils -->
      <line x1="45" y1="36" x2="75" y2="36" stroke="#d97706" stroke-width="1.2"/>
      <line x1="41" y1="42" x2="79" y2="42" stroke="#d97706" stroke-width="1.2"/>
      <line x1="36" y1="48" x2="84" y2="48" stroke="#d97706" stroke-width="1.2"/>
      <text x="60" y="64" font-size="7" font-weight="bold" fill="#f59e0b" font-family="monospace" text-anchor="middle">NIOBIUM BIPROPELLANT</text>
    `);
  }

  if (partId === 'prop_hall_ion') {
    return wrap(`
      <circle cx="60" cy="35" r="26" fill="url(#plasmaGlow)"/>
      <rect x="42" y="18" width="36" height="34" rx="4" fill="#0f172a" stroke="#0284c7" stroke-width="1.5"/>
      <circle cx="60" cy="35" r="14" fill="#0369a1" stroke="#38bdf8" stroke-width="2"/>
      <circle cx="60" cy="35" r="6" fill="#f0fdf4" stroke="#38bdf8" stroke-width="1.5"/>
      <text x="60" y="62" font-size="7" font-weight="bold" fill="#38bdf8" font-family="monospace" text-anchor="middle">HALL XENON ION DRIVE</text>
    `);
  }

  // ==================== 4. COMMUNICATIONS ====================
  if (partId === 'comm_optical_laser') {
    return wrap(`
      <rect x="35" y="24" width="35" height="22" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
      <path d="M70 28 L86 22 L86 48 L70 42 Z" fill="#047857" stroke="#34d399" stroke-width="1.2"/>
      <ellipse cx="86" cy="35" rx="3" ry="13" fill="#10b981"/>
      <line x1="86" y1="35" x2="118" y2="35" stroke="#34d399" stroke-width="2.5" stroke-dasharray="4,2"/>
      <text x="58" y="62" font-size="7" font-weight="bold" fill="#34d399" font-family="monospace" text-anchor="middle">DSOC LASER OPTICAL</text>
    `);
  }

  if (partId === 'comm_parabolic_ka' || partId === 'comm_steerable_hga') {
    return wrap(`
      <path d="M40 18 Q75 35 40 52 Z" fill="#94a3b8" stroke="#f1f5f9" stroke-width="1.5"/>
      <line x1="40" y1="35" x2="75" y2="35" stroke="#ca8a04" stroke-width="1.5"/>
      <circle cx="75" cy="35" r="3.5" fill="url(#goldMLI)"/>
      <rect x="28" y="30" width="12" height="10" rx="1" fill="#1e293b" stroke="#64748b"/>
      <text x="60" y="62" font-size="7" font-weight="bold" fill="#f1f5f9" font-family="monospace" text-anchor="middle">PARABOLIC CASSEGRAIN</text>
    `);
  }

  if (partId === 'comm_horn_xband') {
    return wrap(`
      <rect x="25" y="30" width="20" height="10" rx="1" fill="#334155" stroke="#94a3b8" stroke-width="1"/>
      <path d="M45 32 L85 18 L85 52 L45 38 Z" fill="#b45309" stroke="#f59e0b" stroke-width="1.5"/>
      <ellipse cx="85" cy="35" rx="3" ry="17" fill="#d97706" stroke="#fde68a" stroke-width="1"/>
      <text x="60" y="62" font-size="7" font-weight="bold" fill="#f59e0b" font-family="monospace" text-anchor="middle">X-BAND FEED HORN</text>
    `);
  }

  if (partId === 'comm_patch_sband' || partId === 'comm_s_band_omni') {
    return wrap(`
      <rect x="35" y="20" width="50" height="30" rx="3" fill="#0f172a" stroke="#ca8a04" stroke-width="1.5"/>
      <rect x="42" y="24" width="36" height="22" rx="2" fill="url(#goldMLI)" stroke="#facc15" stroke-width="1"/>
      <circle cx="60" cy="35" r="3" fill="#1e293b"/>
      <text x="60" y="62" font-size="7" font-weight="bold" fill="#facc15" font-family="monospace" text-anchor="middle">S-BAND MICROSTRIP</text>
    `);
  }

  // ==================== 5. BUS / CHASSIS ====================
  if (partId === 'bus_cubesat_12u') {
    return wrap(`
      <rect x="40" y="14" width="40" height="42" rx="2" fill="url(#goldMLI)" stroke="#facc15" stroke-width="1.2"/>
      <!-- Corner Rails -->
      <line x1="38" y1="12" x2="38" y2="58" stroke="#38bdf8" stroke-width="2"/>
      <line x1="82" y1="12" x2="82" y2="58" stroke="#38bdf8" stroke-width="2"/>
      <rect x="48" y="24" width="24" height="22" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
      <text x="60" y="37" font-size="6" font-weight="bold" fill="#38bdf8" font-family="monospace" text-anchor="middle">12U CSLI</text>
      <text x="60" y="64" font-size="7" font-weight="bold" fill="#38bdf8" font-family="monospace" text-anchor="middle">12U CUBESAT CHASSIS</text>
    `);
  }

  if (partId === 'bus_espa_medium') {
    return wrap(`
      <polygon points="45,16 75,16 92,35 75,54 45,54 28,35" fill="url(#goldMLI)" stroke="#facc15" stroke-width="1.5"/>
      <circle cx="60" cy="35" r="12" fill="#1e293b" stroke="#38bdf8" stroke-width="1.2"/>
      <text x="60" y="37" font-size="6" font-weight="bold" fill="#38bdf8" font-family="monospace" text-anchor="middle">ESPA</text>
      <text x="60" y="64" font-size="7" font-weight="bold" fill="#facc15" font-family="monospace" text-anchor="middle">ESPA-CLASS OCTAGONAL</text>
    `);
  }

  if (partId === 'bus_flagship') {
    return wrap(`
      <rect x="35" y="14" width="50" height="42" rx="4" fill="url(#goldMLI)" stroke="#facc15" stroke-width="1.5"/>
      <circle cx="26" cy="35" r="10" fill="#94a3b8" stroke="#f1f5f9" stroke-width="1.2"/>
      <circle cx="94" cy="35" r="10" fill="#94a3b8" stroke="#f1f5f9" stroke-width="1.2"/>
      <text x="60" y="37" font-size="6" font-weight="bold" fill="#f59e0b" font-family="monospace" text-anchor="middle">FLAGSHIP</text>
      <text x="60" y="64" font-size="7" font-weight="bold" fill="#facc15" font-family="monospace" text-anchor="middle">HEAVY FLAGSHIP CORE</text>
    `);
  }

  if (partId === 'lv_pslv') {
    return wrap(`
      <!-- ISRO PSLV-XL Core with Tricolor & Saffron Band -->
      <rect x="55" y="10" width="10" height="46" rx="1.5" fill="#f8fafc" stroke="#94a3b8" stroke-width="1"/>
      <path d="M55 10 L60 4 L65 10 Z" fill="#f8fafc"/>
      <rect x="55" y="18" width="10" height="3" fill="#ea580c"/>
      <rect x="55" y="27" width="10" height="4" fill="#0f172a"/>
      <!-- 6 PSOM-XL Strap-On Solid Boosters -->
      <rect x="47" y="32" width="6" height="24" rx="1" fill="#f1f5f9" stroke="#64748b" stroke-width="0.8"/>
      <path d="M47 32 L50 28 L53 32 Z" fill="#ea580c"/>
      <rect x="67" y="32" width="6" height="24" rx="1" fill="#f1f5f9" stroke="#64748b" stroke-width="0.8"/>
      <path d="M67 32 L70 28 L73 32 Z" fill="#ea580c"/>
      <text x="60" y="64" font-size="7" font-weight="bold" fill="#ea580c" font-family="monospace" text-anchor="middle">ISRO PSLV-XL</text>
    `);
  }

  if (partId === 'lv_lvm3') {
    return wrap(`
      <!-- ISRO LVM3 Heavy Core Stage L110 -->
      <rect x="53" y="12" width="14" height="44" rx="2" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
      <path d="M51 12 Q60 2 69 12 Z" fill="#f8fafc"/>
      <rect x="53" y="24" width="14" height="3" fill="#16a34a"/>
      <!-- Twin Giant S200 Solid Boosters -->
      <rect x="40" y="18" width="11" height="38" rx="2" fill="#f8fafc" stroke="#94a3b8" stroke-width="1"/>
      <path d="M40 18 L45.5 11 L51 18 Z" fill="#0f172a"/>
      <rect x="69" y="18" width="11" height="38" rx="2" fill="#f8fafc" stroke="#94a3b8" stroke-width="1"/>
      <path d="M69 18 L74.5 11 L80 18 Z" fill="#0f172a"/>
      <text x="60" y="64" font-size="7" font-weight="bold" fill="#38bdf8" font-family="monospace" text-anchor="middle">ISRO LVM3</text>
    `);
  }

  // ==================== 6. LAUNCH VEHICLES ====================
  if (partId === 'lv_sls') {
    return wrap(`
      <rect x="52" y="10" width="16" height="46" rx="2" fill="#d97706" stroke="#b45309" stroke-width="1"/>
      <path d="M52 10 L60 4 L68 10 Z" fill="#f1f5f9"/>
      <!-- SRBs -->
      <rect x="38" y="16" width="10" height="40" rx="1" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1"/>
      <path d="M38 16 L43 10 L48 16 Z" fill="#0f172a"/>
      <rect x="72" y="16" width="10" height="40" rx="1" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1"/>
      <path d="M72 16 L77 10 L82 16 Z" fill="#0f172a"/>
      <text x="60" y="64" font-size="7" font-weight="bold" fill="#f59e0b" font-family="monospace" text-anchor="middle">NASA SLS BLOCK 1</text>
    `);
  }

  if (partId === 'lv_falcon9') {
    return wrap(`
      <rect x="54" y="12" width="12" height="44" rx="2" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1"/>
      <path d="M54 12 L60 4 L66 12 Z" fill="#f1f5f9"/>
      <rect x="54" y="24" width="12" height="4" fill="#0f172a"/>
      <line x1="50" y1="26" x2="70" y2="26" stroke="#0f172a" stroke-width="1.5"/>
      <text x="60" y="64" font-size="7" font-weight="bold" fill="#38bdf8" font-family="monospace" text-anchor="middle">FALCON 9</text>
    `);
  }

  if (partId === 'lv_electron') {
    return wrap(`
      <rect x="56" y="14" width="8" height="42" rx="1" fill="#18181b" stroke="#52525b" stroke-width="1"/>
      <path d="M56 14 L60 6 L64 14 Z" fill="#18181b"/>
      <rect x="56" y="26" width="8" height="3" fill="#cbd5e1"/>
      <text x="60" y="64" font-size="7" font-weight="bold" fill="#e2e8f0" font-family="monospace" text-anchor="middle">ELECTRON</text>
    `);
  }

  if (partId === 'lv_vulcan') {
    return wrap(`
      <rect x="53" y="12" width="14" height="44" rx="2" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1"/>
      <path d="M53 12 L60 4 L67 12 Z" fill="#f1f5f9"/>
      <rect x="53" y="22" width="14" height="4" fill="#dc2626"/>
      <text x="60" y="64" font-size="7" font-weight="bold" fill="#ef4444" font-family="monospace" text-anchor="middle">VULCAN CENTAUR</text>
    `);
  }

  // Fallback generic part blueprint
  return wrap(`
    <rect x="35" y="20" width="50" height="30" rx="3" fill="#1e293b" stroke="#38bdf8" stroke-width="1.2"/>
    <text x="60" y="38" font-size="8" font-weight="bold" fill="#38bdf8" font-family="monospace" text-anchor="middle">${partId.split('_').slice(1).join(' ').toUpperCase()}</text>
  `);
}
