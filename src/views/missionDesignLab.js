/**
 * ASTROFORGE: NASA Mission Design Lab (MDL) & 4-Player Collaborative Engineering Room
 * Simulates NASA Goddard Mission Design Lab / JPL Concurrent Engineering Team
 * Supports Solo Play or up to 4 Collaborative Roles with real-time physics trade-offs,
 * constraint validation, AI specialist feedback, and PDR Go/No-Go consensus voting.
 */

import { TEAM_ROLES, TeamManager } from './teamManager.js';
import { MISSION_SCENARIOS } from '../config/scenarios.js';
import { CATALOG } from '../app.js';
import * as physics from '../engine/physics.js';
import { sound } from '../engine/audio.js';

export class MissionDesignLab {
  constructor(containerElement, onLaunchMission, onProceedToHangar) {
    this.container = containerElement;
    this.onLaunchMission = onLaunchMission;
    this.onProceedToHangar = onProceedToHangar;

    this.teamManager = new TeamManager();
    this.currentScenarioIndex = 0;

    // Integrated Collaborative Mission Design State
    this.design = {
      scenarioId: MISSION_SCENARIOS[0].id,
      launchStationId: 'site_sdsc',
      launchVehicleId: 'lv_lvm3',
      orbitId: 'orbit_leo_sso',
      busId: 'bus_espa_medium',
      propulsionId: 'prop_hydrazine_monoprop',
      adcsId: 'adcs_reaction_wheels',
      thermalId: 'thermal_passive_radiators',
      instrumentIds: ['inst_sar_radar'],
      powerId: 'pwr_large_articulated',
      batteryId: 'bat_medium_liion',
      commId: 'comm_x_band_horn',
      missionLifetimeYears: 3
    };

    // Live calculated simulation state
    this.simState = null;
    this.activeRole = 'role_flight_director';
    this.teamMode = 'solo'; // 'solo' or 'team_4p'
  }

  init() {
    this.calculateBudgets();
    this.render();
  }

  setScenario(index) {
    this.currentScenarioIndex = index;
    const scen = MISSION_SCENARIOS[index];
    this.design.scenarioId = scen.id;
    this.design.orbitId = scen.recommendedOrbitId;
    this.design.busId = scen.recommendedBusId;
    this.design.launchVehicleId = scen.recommendedLaunchVehicle || 'lv_lvm3';
    this.design.instrumentIds = scen.recommendedInstruments.length > 0 ? [...scen.recommendedInstruments] : ['inst_sar_radar'];

    if (scen.id.includes('nisar') || scen.id.includes('chandrayaan') || scen.id.includes('aditya') || scen.id.includes('mangalyaan')) {
      this.design.launchStationId = 'site_sdsc'; // Sriharikota
    } else if (scen.id.includes('jwst')) {
      this.design.launchStationId = 'site_csg'; // Kourou
    } else {
      this.design.launchStationId = 'site_ksc'; // Kennedy Space Center
    }

    // Reset role approvals on new scenario
    this.teamManager.roleApprovals = {
      role_flight_director: false,
      role_systems_engineer: false,
      role_power_telemetry: false,
      role_science_director: false
    };

    sound.playSuccessChime();
    this.calculateBudgets();
    this.render();
  }

  calculateBudgets() {
    const scen = MISSION_SCENARIOS[this.currentScenarioIndex];
    const targetOrbit = CATALOG.orbits.find(o => o.id === this.design.orbitId);
    const launchVehicle = CATALOG.launchVehicles.find(lv => lv.id === this.design.launchVehicleId);

    const massBudget = physics.calculateMassBudget(this.design, CATALOG, targetOrbit, launchVehicle);
    const powerBudget = physics.calculatePowerBudget(this.design, CATALOG, targetOrbit);
    const commBudget = physics.calculateTelemetryBudget(this.design, CATALOG, targetOrbit);
    const costBudget = physics.calculateCostBudget(this.design, CATALOG, scen, launchVehicle);
    const scienceYield = physics.calculateScienceYield(this.design, CATALOG, scen);
    const gmatVectors = physics.calculateGmatOrbitVectors(targetOrbit);

    this.simState = {
      massBudget,
      powerBudget,
      commBudget,
      costBudget,
      scienceYield,
      gmatVectors,
      scenario: scen
    };

    return this.simState;
  }

  render() {
    if (!this.container) return;
    this.calculateBudgets();

    const scen = MISSION_SCENARIOS[this.currentScenarioIndex];
    const { massBudget, powerBudget, commBudget, costBudget, scienceYield, gmatVectors } = this.simState;

    this.container.innerHTML = `
      <div class="mdl-wrapper">
        <!-- TOP: MISSION OBJECTIVE CHARTER & SCENARIO SELECTOR -->
        <div class="mdl-charter-card">
          <div class="mdl-charter-header">
            <div class="charter-title-block">
              <span class="charter-badge">NASA MISSION DESIGN LAB (MDL) • CONCURRENT ENGINEERING</span>
              <h2>${scen.title}</h2>
              <p class="charter-sub">${scen.subtitle} • Target: <strong>${scen.targetBody}</strong> • Lifetime: <strong>${scen.missionLifetimeDays} Days</strong></p>
            </div>
            <div class="charter-scenario-tabs">
              <label class="mdl-label">SELECT MISSION SCENARIO:</label>
              <div class="scenario-btn-group">
                ${MISSION_SCENARIOS.map((s, idx) => `
                  <button class="scen-btn ${idx === this.currentScenarioIndex ? 'active' : ''}" data-scen-idx="${idx}">
                    ${s.targetBody === 'Moon' ? '🌕' : s.targetBody === 'Earth' ? '🌍' : s.targetBody === 'Mars' ? '🔴' : '🪐'} ${s.badge.split(' ')[0]}
                  </button>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- PRIMARY OBJECTIVES & CHALLENGES ROW -->
          <div class="charter-objectives-grid">
            <div class="charter-box">
              <span class="box-tag">PRIMARY SCIENTIFIC OBJECTIVES</span>
              <ul>
                ${scen.objectivesSummary.map(o => `<li>✓ ${o}</li>`).join('')}
              </ul>
            </div>
            <div class="charter-box warning">
              <span class="box-tag warning">OPERATIONAL CONSTRAINTS & TRADE-OFF RISKS</span>
              <ul>
                ${scen.challengesAndRisks.map(r => `<li>⚠️ ${r}</li>`).join('')}
              </ul>
            </div>
          </div>
        </div>

        <!-- 4-PLAYER COLLABORATIVE CONSOLE BAR -->
        <div class="mdl-team-bar">
          <div class="team-mode-toggle">
            <span class="mode-label">COLLABORATION MODE:</span>
            <button id="btn-mode-solo" class="mode-toggle-btn ${this.teamMode === 'solo' ? 'active' : ''}">👤 SOLO COMMANDER</button>
            <button id="btn-mode-team" class="mode-toggle-btn ${this.teamMode === 'team_4p' ? 'active' : ''}">👥 4-PLAYER CO-OP ROLES</button>
          </div>

          <div class="role-tabs-row">
            ${TEAM_ROLES.map((role, idx) => {
              const isSelected = role.id === this.activeRole;
              const isApproved = this.teamManager.roleApprovals[role.id];
              const advice = role.generateAdvice(this.simState);

              return `
                <button class="role-tab-btn ${isSelected ? 'active' : ''}" data-role-id="${role.id}" style="--role-color: ${role.color};">
                  <span class="role-avatar">${role.aiAdvisor.avatar}</span>
                  <div class="role-btn-text">
                    <span class="role-btn-title">${role.title}</span>
                    <span class="role-advisor-name">${role.aiAdvisor.name} (${role.aiAdvisor.callsign})</span>
                  </div>
                  <span class="approval-chip ${isApproved ? 'approved' : advice.status}">
                    ${isApproved ? '✓ GO' : advice.status === 'danger' ? '⛔ NO-GO' : advice.status === 'warning' ? '⚠️ RISK' : 'GO'}
                  </span>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- ACTIVE ROLE CONSOLE & LIVE TRADE-OFF CONTROLS -->
        <div class="mdl-console-main-grid">
          <!-- LEFT: ACTIVE ROLE WORKSTATION (ENGINEERING DECISIONS) -->
          <div class="mdl-role-console">
            ${this.renderActiveRoleConsole()}
          </div>

          <!-- RIGHT: LIVE SYSTEMS TRADEOFF GAUGES & PDR VOTING PANEL -->
          <div class="mdl-review-panel">
            <div class="panel-header">
              <h4>PRELIMINARY DESIGN REVIEW (PDR) DASHBOARD</h4>
              <span class="pdr-status-badge ${this.teamManager.allRolesApproved() ? 'ready' : 'evaluating'}">
                ${this.teamManager.allRolesApproved() ? '✓ ALL 4 DISCIPLINES CONCUR: FLIGHT AUTHORIZED' : 'DESIGN REVIEW IN PROGRESS'}
              </span>
            </div>

            <!-- KEY CONSTRAINT METERS -->
            <div class="constraint-gauges-grid">
              <!-- Budget -->
              <div class="metric-gauge-card ${costBudget.isOverBudget ? 'danger' : 'good'}">
                <div class="gauge-title-row">
                  <span>BUDGET CONSUMED</span>
                  <strong>$${costBudget.totalMissionCost.toFixed(1)}M / $${costBudget.budgetCap.toFixed(1)}M</strong>
                </div>
                <div class="metric-progress-track">
                  <div class="metric-progress-fill" style="width: ${Math.min(100, (costBudget.totalMissionCost / costBudget.budgetCap) * 100)}%; background: ${costBudget.isOverBudget ? '#ef4444' : '#10b981'};"></div>
                </div>
                <span class="gauge-footnote">${costBudget.isOverBudget ? `EXCEEDED BY $${(-costBudget.costMarginM).toFixed(1)}M!` : `Reserve Margin: +$${costBudget.costMarginM.toFixed(1)}M`}</span>
              </div>

              <!-- Mass Margin -->
              <div class="metric-gauge-card ${massBudget.massMarginPct < 15 ? 'danger' : 'good'}">
                <div class="gauge-title-row">
                  <span>MASS MARGIN (PDR 20% RULE)</span>
                  <strong>${massBudget.massMarginPct.toFixed(1)}% (${massBudget.wetMass.toFixed(0)} kg / ${massBudget.launchCapacity.toFixed(0)} kg)</strong>
                </div>
                <div class="metric-progress-track">
                  <div class="metric-progress-fill" style="width: ${Math.max(5, Math.min(100, massBudget.massMarginPct))}%; background: ${massBudget.massMarginPct < 15 ? '#f59e0b' : '#10b981'};"></div>
                </div>
                <span class="gauge-footnote">${massBudget.launchMessage}</span>
              </div>

              <!-- Power in Eclipse -->
              <div class="metric-gauge-card ${!powerBudget.batterySafe ? 'danger' : 'good'}">
                <div class="gauge-title-row">
                  <span>BATTERY DEPTH OF DISCHARGE</span>
                  <strong>${(powerBudget.actualDoD * 100).toFixed(0)}% (Max Safe: ${(powerBudget.maxSafeDoD * 100).toFixed(0)}%)</strong>
                </div>
                <div class="metric-progress-track">
                  <div class="metric-progress-fill" style="width: ${Math.min(100, powerBudget.actualDoD * 100)}%; background: ${!powerBudget.batterySafe ? '#ef4444' : '#06b6d4'};"></div>
                </div>
                <span class="gauge-footnote">${powerBudget.batterySafe ? '✓ Battery cycles safely through eclipse shadow' : '⚠️ Depth of discharge will cause permanent cell degradation!'}</span>
              </div>

              <!-- Science Score -->
              <div class="metric-gauge-card ${scienceYield.finalSciencePoints >= scienceYield.targetPoints ? 'good' : 'warning'}">
                <div class="gauge-title-row">
                  <span>PROJECTED SCIENCE YIELD</span>
                  <strong style="color: #ec4899;">${scienceYield.finalSciencePoints} PTS (${scienceYield.achievementPct}%)</strong>
                </div>
                <div class="metric-progress-track">
                  <div class="metric-progress-fill" style="width: ${Math.min(100, scienceYield.achievementPct)}%; background: #ec4899;"></div>
                </div>
                <span class="gauge-footnote">+${scienceYield.synergyBonusPct}% Multi-Instrument Synergy Bonus</span>
              </div>
            </div>

            <!-- SPECIALIST LIVE ADVICE FEED -->
            <div class="specialist-feed-box">
              <span class="feed-header">CONCURRENT ENGINEERING LOG (SPECIALIST TRADE-OFF AUDIT)</span>
              <div class="feed-messages">
                ${TEAM_ROLES.map(r => {
                  const advice = r.generateAdvice(this.simState);
                  return `
                    <div class="feed-msg-row ${advice.status}">
                      <span class="advisor-chip" style="color: ${r.color};">${r.aiAdvisor.avatar} ${r.aiAdvisor.callsign}:</span>
                      <p class="advisor-text">${advice.text}</p>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- CONSENSUS APPROVAL & AUTHORIZATION ACTION BAR -->
            <div class="pdr-action-footer">
              <div class="approvals-status-bar">
                <span class="app-label">TEAM GO/NO-GO CONSENSUS:</span>
                <div class="approval-buttons-group">
                  ${TEAM_ROLES.map(r => {
                    const approved = this.teamManager.roleApprovals[r.id];
                    return `
                      <button class="vote-toggle-btn ${approved ? 'approved' : 'no-go'}" data-vote-role="${r.id}">
                        ${r.aiAdvisor.avatar} ${r.aiAdvisor.callsign}: ${approved ? 'GO ✓' : 'NO-GO ✗'}
                      </button>
                    `;
                  }).join('')}
                </div>
              </div>

              <div class="pdr-action-buttons-flex">
                <button id="mdl-to-hangar-btn" class="mdl-secondary-hangar-btn">
                  <span class="auth-icon">🛠️</span>
                  <div class="auth-text-block">
                    <span class="auth-headline">APPLY & VIEW IN 3D ASSEMBLY HANGAR</span>
                    <span class="auth-sub">Inspect payload integration, fairing cutaway, & rocket stages in 360°</span>
                  </div>
                </button>

                <button id="mdl-launch-btn" class="mdl-authorize-btn ${this.teamManager.allRolesApproved() ? 'ready' : 'override'}">
                  <span class="auth-icon">🚀</span>
                  <div class="auth-text-block">
                    <span class="auth-headline">${this.teamManager.allRolesApproved() ? 'AUTHORIZE LAUNCH: ENTER 3D FLIGHT' : 'AUTHORIZE WITH WAIVER & FLY'}</span>
                    <span class="auth-sub">${this.teamManager.allRolesApproved() ? 'PDR Consensus Achieved (4/4 Disciplines Concur)' : 'Click to approve remaining items or launch with team waiver'}</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  renderActiveRoleConsole() {
    const role = TEAM_ROLES.find(r => r.id === this.activeRole);
    if (!role) return '';

    const { massBudget, powerBudget, commBudget, costBudget, scienceYield, gmatVectors } = this.simState;

    if (role.id === 'role_flight_director') {
      // 🚀 ROLE 1: FLIGHT DIRECTOR & ORBIT TRAJECTORY LEAD
      return `
        <div class="role-console-content">
          <div class="console-role-banner" style="border-left-color: ${role.color};">
            <h3>🚀 ROLE 1: FLIGHT DIRECTOR & TRAJECTORY LEAD</h3>
            <p>You own the Launch Vehicle, Target Orbit, and mission trajectory envelope.</p>
          </div>

          <div class="control-section">
            <label class="section-label">1. CHOOSE MULTI-STAGE LAUNCH VEHICLE:</label>
            <div class="choice-cards-list">
              ${CATALOG.launchVehicles.map(lv => `
                <div class="choice-card ${this.design.launchVehicleId === lv.id ? 'selected' : ''}" data-param="launchVehicleId" data-val="${lv.id}">
                  <div class="choice-header">
                    <strong>${lv.name}</strong>
                    <span class="choice-cost">$${lv.cost}M</span>
                  </div>
                  <p class="choice-desc">${lv.description}</p>
                  <div class="choice-meta">
                    <span>LEO Cap: <strong>${lv.leoCapacity} kg</strong></span>
                    <span>TLI (Moon): <strong>${lv.tliCapacity || 'N/A'} kg</strong></span>
                    <span>Reliability: <strong>${(lv.reliability * 100).toFixed(0)}%</strong></span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="control-section">
            <label class="section-label">2. CHOOSE LAUNCH STATION & SPACEPORT:</label>
            <div class="choice-cards-list">
              ${(CATALOG.launchStations || []).map(st => `
                <div class="choice-card ${this.design.launchStationId === st.id ? 'selected' : ''}" data-param="launchStationId" data-val="${st.id}">
                  <div class="choice-header">
                    <strong>${st.icon} ${st.name}</strong>
                    <span class="choice-badge" style="color: #10b981;">+${st.earthBoostMs} m/s</span>
                  </div>
                  <p class="choice-desc">${st.description}</p>
                  <div class="choice-meta">
                    <span>Location: <strong>${st.location}</strong></span>
                    <span>Latitude: <strong>${st.latitude}° N</strong></span>
                    <span>Corridor: <strong>${st.idealOrbits[0]}</strong></span>
                    <span>Research: <strong>${st.researchFocus ? st.researchFocus.split(',')[0] : 'General'}</strong></span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="control-section">
            <label class="section-label">3. CHOOSE TARGET ORBIT (GMAT VIS-VIVA MECHANICS):</label>
            <div class="choice-cards-list">
              ${CATALOG.orbits.map(orb => `
                <div class="choice-card ${this.design.orbitId === orb.id ? 'selected' : ''}" data-param="orbitId" data-val="${orb.id}">
                  <div class="choice-header">
                    <strong>${orb.name}</strong>
                    <span class="choice-badge">${orb.targetBody}</span>
                  </div>
                  <p class="choice-desc">${orb.description}</p>
                  <div class="choice-meta">
                    <span>Altitude: <strong>${orb.altitudeKm} km</strong></span>
                    <span>Period: <strong>${orb.periodMin} min</strong></span>
                    <span>Eclipse: <strong>${(orb.eclipseFraction * 100).toFixed(0)}%</strong></span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- GMAT Fidelity Trajectory Readout -->
          <div class="gmat-telemetry-box">
            <span class="gmat-tag">GMAT ORBITAL MECHANICS VECTORS:</span>
            <div class="gmat-readout-grid">
              <div>Semi-Major Axis: <strong>${gmatVectors?.semiMajorAxisKm} km</strong></div>
              <div>Periapsis Alt: <strong>${gmatVectors?.periapsisAltKm} km</strong></div>
              <div>Apoapsis Alt: <strong>${gmatVectors?.apoapsisAltKm} km</strong></div>
              <div>Orbital Velocity: <strong>${gmatVectors?.velocityPeriapsisKmSec} km/s</strong></div>
              <div>Orbital Period: <strong>${gmatVectors?.orbitalPeriodMin} min</strong></div>
              <div>Inclination: <strong>${gmatVectors?.inclinationDeg}°</strong></div>
            </div>
          </div>
        </div>
      `;
    }

    if (role.id === 'role_systems_engineer') {
      // 🛠️ ROLE 2: LEAD SYSTEMS & THERMAL ENGINEER
      return `
        <div class="role-console-content">
          <div class="console-role-banner" style="border-left-color: ${role.color};">
            <h3>🛠️ ROLE 2: LEAD SYSTEMS & PROPULSION ENGINEER</h3>
            <p>You configure the spacecraft bus structure, propulsion system, and thermal control.</p>
          </div>

          <div class="control-section">
            <label class="section-label">1. SPACECRAFT CHASSIS / BUS PLATFORM:</label>
            <div class="choice-cards-list">
              ${CATALOG.buses.map(b => `
                <div class="choice-card ${this.design.busId === b.id ? 'selected' : ''}" data-param="busId" data-val="${b.id}">
                  <div class="choice-header">
                    <strong>${b.name}</strong>
                    <span class="choice-cost">$${b.cost}M</span>
                  </div>
                  <p class="choice-desc">${b.description}</p>
                  <div class="choice-meta">
                    <span>Dry Mass: <strong>${b.dryMass} kg</strong></span>
                    <span>Max Payload: <strong>${b.maxPayloadMass} kg</strong></span>
                    <span>Avionics Draw: <strong>${b.basePowerDrawW} W</strong></span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="control-section">
            <label class="section-label">2. PROPULSION ENGINE (TSIOLKOVSKY ROCKET EQUATION):</label>
            <div class="choice-cards-list">
              ${CATALOG.propulsion.map(p => `
                <div class="choice-card ${this.design.propulsionId === p.id ? 'selected' : ''}" data-param="propulsionId" data-val="${p.id}">
                  <div class="choice-header">
                    <strong>${p.name}</strong>
                    <span class="choice-cost">$${p.cost}M</span>
                  </div>
                  <p class="choice-desc">${p.description}</p>
                  <div class="choice-meta">
                    <span>Specific Impulse (Isp): <strong>${p.ispSeconds} s</strong></span>
                    <span>Thrust: <strong>${p.thrustN} N</strong></span>
                    <span>Fuel Mass: <strong>${p.fuelMass} kg</strong></span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }

    if (role.id === 'role_science_director') {
      // 🔬 ROLE 3: CHIEF SCIENTIST & PAYLOAD SPECIALIST
      return `
        <div class="role-console-content">
          <div class="console-role-banner" style="border-left-color: ${role.color};">
            <h3>🔬 ROLE 3: CHIEF SCIENTIST & PAYLOAD SPECIALIST</h3>
            <p>Select scientific instruments to satisfy mission objectives. Maximize multi-sensor synergies!</p>
          </div>

          <div class="control-section">
            <label class="section-label">SELECT SCIENTIFIC PAYLOAD SUITE (CLICK TO TOGGLE MULTIPLE):</label>
            <div class="choice-cards-list">
              ${CATALOG.instruments.map(inst => {
                const isSelected = this.design.instrumentIds.includes(inst.id);
                return `
                  <div class="choice-card ${isSelected ? 'selected multi' : ''}" data-inst-id="${inst.id}">
                    <div class="choice-header">
                      <strong>${isSelected ? '✓ ' : '+ '}${inst.name}</strong>
                      <span class="choice-cost">$${inst.cost}M</span>
                    </div>
                    <p class="choice-desc">${inst.description}</p>
                    <div class="choice-meta">
                      <span>Mass: <strong>${inst.mass} kg</strong></span>
                      <span>Power: <strong>${inst.powerDrawW} W</strong></span>
                      <span>Yield: <strong style="color: #ec4899;">+${inst.scienceYield} pts</strong></span>
                      <span>Data: <strong>${inst.dataRateMbps} Mbps</strong></span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      `;
    }

    if (role.id === 'role_power_telemetry') {
      // ⚡ ROLE 4: POWER & TELECOMMUNICATIONS SPECIALIST
      return `
        <div class="role-console-content">
          <div class="console-role-banner" style="border-left-color: ${role.color};">
            <h3>⚡ ROLE 4: POWER & TELECOMMUNICATIONS LEAD</h3>
            <p>Size solar panels vs distance to sun, battery depth of discharge, and antenna link margins.</p>
          </div>

          <div class="control-section">
            <label class="section-label">1. POWER GENERATION SUBSYSTEM:</label>
            <div class="choice-cards-list">
              ${CATALOG.power.map(pwr => `
                <div class="choice-card ${this.design.powerId === pwr.id ? 'selected' : ''}" data-param="powerId" data-val="${pwr.id}">
                  <div class="choice-header">
                    <strong>${pwr.name}</strong>
                    <span class="choice-cost">$${pwr.cost}M</span>
                  </div>
                  <p class="choice-desc">${pwr.description}</p>
                  <div class="choice-meta">
                    <span>Base Output: <strong>+${pwr.baseOutputWatts} W</strong></span>
                    <span>Mass: <strong>${pwr.mass} kg</strong></span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="control-section">
            <label class="section-label">2. ENERGY STORAGE (BATTERY CELL SYSTEM):</label>
            <div class="choice-cards-list">
              ${CATALOG.batteries.map(bat => `
                <div class="choice-card ${this.design.batteryId === bat.id ? 'selected' : ''}" data-param="batteryId" data-val="${bat.id}">
                  <div class="choice-header">
                    <strong>${bat.name}</strong>
                    <span class="choice-cost">$${bat.cost}M</span>
                  </div>
                  <p class="choice-desc">${bat.description}</p>
                  <div class="choice-meta">
                    <span>Capacity: <strong>${bat.capacityWh} Wh</strong></span>
                    <span>Max Safe DoD: <strong>${(bat.maxSafeDoD * 100).toFixed(0)}%</strong></span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="control-section">
            <label class="section-label">3. TELECOMMUNICATIONS & HIGH GAIN ANTENNA:</label>
            <div class="choice-cards-list">
              ${CATALOG.comms.map(comm => `
                <div class="choice-card ${this.design.commId === comm.id ? 'selected' : ''}" data-param="commId" data-val="${comm.id}">
                  <div class="choice-header">
                    <strong>${comm.name}</strong>
                    <span class="choice-cost">$${comm.cost}M</span>
                  </div>
                  <p class="choice-desc">${comm.description}</p>
                  <div class="choice-meta">
                    <span>Downlink Band: <strong>${comm.frequencyBand}</strong></span>
                    <span>Downlink Speed: <strong>${comm.downlinkSpeedMbps} Mbps</strong></span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }

    return '';
  }

  bindEvents() {
    // Scenario tabs
    this.container.querySelectorAll('.scen-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.scenIdx, 10);
        this.setScenario(idx);
      });
    });

    // Solo vs Team Mode toggle
    document.getElementById('btn-mode-solo')?.addEventListener('click', () => {
      this.teamMode = 'solo';
      this.render();
    });
    document.getElementById('btn-mode-team')?.addEventListener('click', () => {
      this.teamMode = 'team_4p';
      this.render();
    });

    // Role Tab Switcher
    this.container.querySelectorAll('.role-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.activeRole = e.currentTarget.dataset.roleId;
        sound.playBlip(840, 0.05);
        this.render();
      });
    });

    // Parameter choices
    this.container.querySelectorAll('.choice-card[data-param]').forEach(card => {
      card.addEventListener('click', (e) => {
        const param = e.currentTarget.dataset.param;
        const val = e.currentTarget.dataset.val;
        this.design[param] = val;
        sound.playBlip(1050, 0.05);
        this.render();
      });
    });

    // Multi-instrument selection
    this.container.querySelectorAll('.choice-card[data-inst-id]').forEach(card => {
      card.addEventListener('click', (e) => {
        const instId = e.currentTarget.dataset.instId;
        const idx = this.design.instrumentIds.indexOf(instId);
        if (idx !== -1) {
          if (this.design.instrumentIds.length > 1) {
            this.design.instrumentIds.splice(idx, 1);
          }
        } else {
          this.design.instrumentIds.push(instId);
        }
        sound.playBlip(1150, 0.05);
        this.render();
      });
    });

    // PDR Go / No-Go Vote toggles
    this.container.querySelectorAll('.vote-toggle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const roleId = e.currentTarget.dataset.voteRole;
        const state = this.teamManager.toggleApproval(roleId);
        sound.playBlip(state ? 1200 : 500, 0.08);
        this.render();
      });
    });

    // Apply to 3D Assembly Hangar Button
    document.getElementById('mdl-to-hangar-btn')?.addEventListener('click', () => {
      sound.playSuccessChime();
      if (this.onProceedToHangar) {
        this.onProceedToHangar(this.design, this.simState);
      }
    });

    // Authorize Launch Button
    document.getElementById('mdl-launch-btn')?.addEventListener('click', () => {
      sound.playSuccessChime();
      if (this.onLaunchMission) {
        this.onLaunchMission(this.design, this.simState);
      }
    });
  }
}
