/**
 * ASTROFORGE: Space Mission Architect & Flight Commander
 * Main Game Controller
 */

import { CAMPAIGN_LEVELS } from './game/levels.js';
import { GameManager, TECH_TREE_ITEMS } from './game/gameManager.js';
import { AssemblyHangar3D } from './game/assemblyHangar3D.js';
import { FlightArena3D } from './game/flightArena3D.js';
import { MissionDesignLab } from './views/missionDesignLab.js';
import { OFFICIAL_NASA_RESOURCES, NASA_ANALOG_MISSIONS, CML_LEVELS } from './config/educational.js';
import { LAUNCH_STATIONS, LAUNCH_VEHICLES, TARGET_ORBITS, BUS_PLATFORMS, SCIENTIFIC_INSTRUMENTS, POWER_SYSTEMS, BATTERY_SYSTEMS, PROPULSION_SYSTEMS, COMMUNICATIONS_SYSTEMS, ATTITUDE_THERMAL_SYSTEMS } from './config/components.js';
import * as physics from './engine/physics.js';
import { sound } from './engine/audio.js';
import { getPartBlueprintSVG } from './views/partBlueprints.js';

export const CATALOG = {
  launchStations: LAUNCH_STATIONS,
  launchVehicles: LAUNCH_VEHICLES,
  orbits: TARGET_ORBITS,
  buses: BUS_PLATFORMS,
  instruments: SCIENTIFIC_INSTRUMENTS,
  power: POWER_SYSTEMS,
  batteries: BATTERY_SYSTEMS,
  propulsion: PROPULSION_SYSTEMS,
  comms: COMMUNICATIONS_SYSTEMS,
  adcsThermal: ATTITUDE_THERMAL_SYSTEMS
};

class AstroForgeGame {
  constructor() {
    this.gameManager = new GameManager();
    this.hangar = null;
    this.flightArena = null;
    this.missionDesignLab = null;

    this.activeScreen = 'screen-campaign';
    this.activeSocketTab = 'sensor';

    window.astroforgeApp = this;
  }

  init() {
    this.initAudioAndCanvas();
    this.initMissionDesignLab();
    this.bindGlobalNavigation();
    this.renderCampaignLevels();
    this.renderTechTreeModal();
    this.renderResourcesModal();
    this.updatePlayerHud();

    // Show campaign level selector initially
    this.showScreen('screen-campaign');
  }

  initAudioAndCanvas() {
    const hangarCanvas = document.getElementById('hangar-canvas');
    if (hangarCanvas) {
      this.hangar = new AssemblyHangar3D(hangarCanvas, (loadout) => {
        this.updateHangarGauges(loadout);
      });
      this.hangar.resize();
    }

    const flightCanvas = document.getElementById('flight-canvas');
    if (flightCanvas) {
      this.flightArena = new FlightArena3D(flightCanvas, (results) => {
        this.handleMissionComplete(results);
      });
      this.flightArena.resize();
    }

    window.addEventListener('resize', () => {
      if (this.hangar) this.hangar.resize();
      if (this.flightArena) this.flightArena.resize();
    });

    this.bindFlightTouchControls();
  }

  initMissionDesignLab() {
    const mdlMount = document.getElementById('mdl-mount-point');
    if (mdlMount) {
      this.missionDesignLab = new MissionDesignLab(
        mdlMount,
        (design, simState) => {
          this.handleLaunchFromMDL(design, simState);
        },
        (design, simState) => {
          this.handleProceedToHangarFromMDL(design, simState);
        }
      );
      this.missionDesignLab.init();
    }
  }

  syncMDLToGame(design, simState) {
    // Synchronize chosen MDL scenario with real campaign missions
    let targetIdx = 0;
    if (design.scenarioId.includes('chandrayaan')) targetIdx = 1;
    else if (design.scenarioId.includes('aditya')) targetIdx = 2;
    else if (design.scenarioId.includes('mangalyaan')) targetIdx = 3;
    else if (design.scenarioId.includes('artemis')) targetIdx = 4;
    else if (design.scenarioId.includes('jwst')) targetIdx = 5;
    else if (design.scenarioId.includes('europa')) targetIdx = 6;
    else targetIdx = 0; // NASA-ISRO NISAR

    this.gameManager.selectLevel(targetIdx);

    if (this.hangar) {
      this.hangar.setLoadout({
        launchVehicleId: design.launchVehicleId,
        busId: design.busId,
        sensorId: design.instrumentIds[0] || 'inst_sar_radar',
        powerId: design.powerId,
        batteryId: design.batteryId,
        engineId: design.propulsionId,
        commId: design.commId
      });
      this.hangar.rebuildSpacecraftModel();
      this.updateHangarGauges(this.hangar.loadout);
    }
  }

  handleProceedToHangarFromMDL(design, simState) {
    this.syncMDLToGame(design, simState);
    this.showScreen('screen-assembly');
  }

  handleLaunchFromMDL(design, simState) {
    this.syncMDLToGame(design, simState);
    sound.playLaunchRumble(2.5);
    this.startFlightMission(design.launchStationId);
  }

  bindFlightTouchControls() {
    const bindBtn = (id, prop) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (this.flightArena) this.flightArena.keys[prop] = true;
      });
      el.addEventListener('pointerup', (e) => {
        e.preventDefault();
        if (this.flightArena) this.flightArena.keys[prop] = false;
      });
      el.addEventListener('pointerleave', (e) => {
        e.preventDefault();
        if (this.flightArena) this.flightArena.keys[prop] = false;
      });
    };

    bindBtn('btn-ctrl-left', 'left');
    bindBtn('btn-ctrl-right', 'right');
    bindBtn('btn-ctrl-thrust', 'thrust');
    bindBtn('btn-ctrl-shield', 'shield');

    document.getElementById('btn-ctrl-scan')?.addEventListener('click', (e) => {
      e.preventDefault();
      if (this.flightArena) this.flightArena.triggerScan();
    });
  }

  bindGlobalNavigation() {
    // Quick Play Buttons (Directly jumps into arcade flight!)
    document.getElementById('hero-play-btn')?.addEventListener('click', () => {
      this.gameManager.selectLevel(0); // Mission 1
      this.startFlightMission();
    });

    document.getElementById('nav-quick-play-btn')?.addEventListener('click', () => {
      this.startFlightMission();
    });

    document.getElementById('nav-campaign-btn')?.addEventListener('click', () => {
      this.showScreen('screen-campaign');
      sound.playTelemetryPing();
    });

    document.getElementById('nav-mdl-btn')?.addEventListener('click', () => {
      this.showScreen('screen-mdl');
      sound.playTelemetryPing();
      if (this.missionDesignLab) this.missionDesignLab.render();
    });

    document.getElementById('nav-hangar-btn')?.addEventListener('click', () => {
      this.showScreen('screen-assembly');
      sound.playTelemetryPing();
    });

    document.getElementById('nav-techtree-btn')?.addEventListener('click', () => {
      const modal = document.getElementById('modal-techtree');
      if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
      }
      sound.playTelemetryPing();
    });

    document.getElementById('close-techtree-btn')?.addEventListener('click', () => {
      const modal = document.getElementById('modal-techtree');
      if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
      }
    });

    document.getElementById('nav-resources-btn')?.addEventListener('click', () => {
      const modal = document.getElementById('modal-resources');
      if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
      }
      sound.playTelemetryPing();
    });

    const closeResModal = () => {
      const modal = document.getElementById('modal-resources');
      if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
      }
      sound.playTelemetryPing();
    };

    document.getElementById('close-resources-btn')?.addEventListener('click', closeResModal);
    document.getElementById('close-resources-bottom-btn')?.addEventListener('click', closeResModal);

    // Close modals on clicking dark backdrop outside
    document.querySelectorAll('.game-modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.add('hidden');
          overlay.style.display = 'none';
          sound.playTelemetryPing();
        }
      });
    });

    // Close modals on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.game-modal-overlay').forEach(overlay => {
          overlay.classList.add('hidden');
          overlay.style.display = 'none';
        });
      }
    });

    document.getElementById('nav-sound-btn')?.addEventListener('click', () => {
      const isMuted = sound.toggleMute();
      document.getElementById('nav-sound-btn').textContent = isMuted ? '🔇 MUTE' : '🔊 SOUND';
    });

    // Camera Mode Toggle
    document.getElementById('btn-camera-toggle')?.addEventListener('click', () => {
      if (this.flightArena) this.flightArena.cycleCamera();
    });

    // Smart Autopilot Assists
    document.getElementById('btn-auto-sun')?.addEventListener('click', (e) => {
      if (this.flightArena) {
        const active = this.flightArena.toggleAutopilot('sunLock');
        e.currentTarget.classList.toggle('active', active);
        if (active) this.flightArena.showFloatingMessage('☀️ AUTOPILOT: SUN LOCK ENGAGED');
      }
    });

    document.getElementById('btn-auto-orbit')?.addEventListener('click', () => {
      if (this.flightArena) {
        this.flightArena.toggleOrbitLock();
      }
    });

    document.getElementById('btn-auto-prograde')?.addEventListener('click', (e) => {
      if (this.flightArena) {
        const active = this.flightArena.toggleAutopilot('prograde');
        e.currentTarget.classList.toggle('active', active);
        if (active) this.flightArena.showFloatingMessage('🚀 AUTOPILOT: PROGRADE ALIGNMENT ENGAGED');
      }
    });

    document.getElementById('btn-auto-scan')?.addEventListener('click', (e) => {
      if (this.flightArena) {
        const active = this.flightArena.toggleAutopilot('autoScan');
        e.currentTarget.classList.toggle('active', active);
        if (active) this.flightArena.showFloatingMessage('🔬 AUTOPILOT: AUTO-SCAN SWEEPS ACTIVE');
      }
    });

    // AAA Arcade Flight Action Command Pad
    document.getElementById('btn-ctrl-zoom-in')?.addEventListener('click', () => {
      if (this.flightArena) this.flightArena.zoomIn();
    });

    document.getElementById('btn-ctrl-zoom-out')?.addEventListener('click', () => {
      if (this.flightArena) this.flightArena.zoomOut();
    });

    document.getElementById('btn-ctrl-sun-align')?.addEventListener('click', () => {
      if (this.flightArena) this.flightArena.alignWithSun();
    });

    document.getElementById('btn-ctrl-downlink')?.addEventListener('click', () => {
      if (this.flightArena) this.flightArena.triggerDownlink();
    });

    document.getElementById('btn-ctrl-autopilot')?.addEventListener('click', () => {
      if (this.flightArena) this.flightArena.toggleOrbitLock();
    });

    document.getElementById('btn-ctrl-scan')?.addEventListener('click', () => {
      if (this.flightArena) {
        if (this.flightArena.missionPhase === 'PAD') this.flightArena.startCountdown();
        else if (this.flightArena.missionPhase === 'STAGE1_READY') this.flightArena.triggerStage1Separation();
        else if (this.flightArena.missionPhase === 'FAIRING_READY') this.flightArena.triggerFairingJettison();
        else if (this.flightArena.missionPhase === 'PAYLOAD_READY') this.flightArena.triggerPayloadSeparation();
        else this.flightArena.triggerScan();
      }
    });

    // Press-and-hold buttons for steering, thrust, and shield
    const bindPressHold = (id, keyName) => {
      const el = document.getElementById(id);
      if (!el) return;
      const setKey = (val) => {
        if (this.flightArena) this.flightArena.keys[keyName] = val;
      };
      el.addEventListener('pointerdown', (e) => { e.preventDefault(); setKey(true); });
      el.addEventListener('pointerup', () => setKey(false));
      el.addEventListener('pointerleave', () => setKey(false));
      el.addEventListener('pointercancel', () => setKey(false));
    };

    bindPressHold('btn-ctrl-left', 'left');
    bindPressHold('btn-ctrl-right', 'right');
    bindPressHold('btn-ctrl-thrust', 'thrust');
    bindPressHold('btn-ctrl-shield', 'shield');
    bindPressHold('btn-quick-shield', 'shield');

    // Time Warp Acceleration (1X, 2X, 4X)
    document.querySelectorAll('.warp-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const warp = parseFloat(e.currentTarget.dataset.warp || '1');
        document.querySelectorAll('.warp-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        if (this.flightArena) {
          this.flightArena.setTimeWarp(warp);
          this.flightArena.showFloatingMessage(`⏩ TIME WARP: ${warp}X SPEED`);
        }
      });
    });

    // Start Flight button in Hangar
    document.getElementById('start-flight-btn')?.addEventListener('click', () => {
      this.startFlightMission();
    });

    // Toggle between Spacecraft and Full Multi-Stage Rocket in Hangar
    document.getElementById('hangar-toggle-view-btn')?.addEventListener('click', () => {
      if (this.hangar) {
        this.hangar.toggleViewMode();
      }
    });

    // Global Escape Key listener to easily dismiss any open modal
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.game-modal-overlay').forEach(modal => {
          modal.classList.add('hidden');
          modal.style.display = 'none';
        });
      }
    });

    // Debrief screen buttons
    document.getElementById('debrief-retry-btn')?.addEventListener('click', () => {
      this.startFlightMission();
    });

    document.getElementById('debrief-continue-btn')?.addEventListener('click', () => {
      this.showScreen('screen-assembly');
      this.renderCampaignLevels();
      sound.playSuccessChime();
    });

    document.getElementById('debrief-techtree-btn')?.addEventListener('click', () => {
      document.getElementById('modal-techtree')?.classList.remove('hidden');
    });

    // Hangar Socket Tabs
    document.querySelectorAll('.socket-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const sock = e.target.dataset.socket;
        this.activeSocketTab = sock;
        document.querySelectorAll('.socket-tab-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        if (this.hangar) this.hangar.selectSocket(sock);
        this.renderHangarPartsShelf();
      });
    });
  }

  showScreen(screenId) {
    this.activeScreen = screenId;
    document.querySelectorAll('.game-screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(screenId)?.classList.remove('hidden');

    document.querySelectorAll('.nav-hud-btn').forEach(b => b.classList.remove('active'));
    if (screenId === 'screen-campaign') document.getElementById('nav-campaign-btn')?.classList.add('active');
    if (screenId === 'screen-mdl') {
      document.getElementById('nav-mdl-btn')?.classList.add('active');
      if (this.missionDesignLab) this.missionDesignLab.render();
    }
    if (screenId === 'screen-assembly') {
      document.getElementById('nav-hangar-btn')?.classList.add('active');
      if (this.hangar) {
        setTimeout(() => {
          this.hangar.resize();
          this.hangar.render();
          this.renderHangarPartsShelf();
          this.updateHangarGauges(this.hangar.loadout);
        }, 50);
      }
    }
    if (screenId === 'screen-flight' && this.flightArena) {
      setTimeout(() => this.flightArena.resize(), 50);
    }
  }

  updatePlayerHud() {
    const credEl = document.getElementById('player-credits');
    const starEl = document.getElementById('player-stars');
    if (credEl) credEl.textContent = this.gameManager.credits.toLocaleString();
    if (starEl) starEl.textContent = this.gameManager.totalStars;
  }

  renderCampaignLevels() {
    const grid = document.getElementById('campaign-missions-grid');
    if (!grid) return;

    grid.innerHTML = CAMPAIGN_LEVELS.map((lvl, idx) => {
      const isUnlocked = true; // ALL 9 MISSIONS FULLY UNLOCKED
      const isCurrent = idx === this.gameManager.currentLevelIndex;
      const scoreData = this.gameManager.levelScores[lvl.id] || null;
      const starsEarned = scoreData ? scoreData.stars : 0;
      const isCompleted = scoreData && scoreData.completed;

      return `
        <div class="level-card unlocked ${isCurrent ? 'selected' : ''} ${isCompleted ? 'completed-mission' : ''}" data-idx="${idx}">
          <div class="level-header">
            <span class="lvl-badge">${lvl.badge}</span>
            <div class="lvl-stars">
              ${[1, 2, 3].map(s => `<span class="star ${s <= starsEarned ? 'earned' : ''}">★</span>`).join('')}
            </div>
          </div>
          <h3>${lvl.title}</h3>
          <p class="lvl-subtitle">${lvl.subtitle}</p>
          <p class="lvl-story">${lvl.story}</p>
          
          <div class="lvl-objectives-preview">
            <strong>PRIMARY MISSION OBJECTIVES:</strong>
            <ul>
              ${lvl.objectives.map(o => `<li>• ${o.text}</li>`).join('')}
            </ul>
          </div>

          ${lvl.researchField ? `
            <div class="lvl-research-preview">
              <span class="research-tag">🔬 RESEARCH: ${lvl.researchField}</span>
              <p class="research-hyp"><strong>Hypothesis:</strong> "${lvl.researchHypothesis}"</p>
            </div>
          ` : ''}

          <div class="lvl-card-footer">
            <span class="lvl-reward">REWARD: +${lvl.rewardCredits} CR</span>
            <button class="lvl-play-btn" data-idx="${idx}">
              ${isCurrent ? '▶ ASSEMBLE SPACECRAFT' : (isCompleted ? '✓ REPLAY MISSION' : 'SELECT MISSION')}
            </button>
          </div>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('.lvl-play-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.idx, 10);
        this.gameManager.selectLevel(idx);
        this.showScreen('screen-assembly');
        sound.playSuccessChime();
      });
    });
  }

  renderHangarPartsShelf() {
    const shelf = document.getElementById('vab-parts-shelf');
    if (!shelf || !this.hangar) return;

    const sock = this.activeSocketTab;
    let parts = [];

    if (sock === 'sensor') parts = CATALOG.instruments;
    else if (sock === 'power') parts = CATALOG.power;
    else if (sock === 'engine') parts = CATALOG.propulsion;
    else if (sock === 'comm') parts = CATALOG.comms;
    else if (sock === 'bus') parts = CATALOG.buses;
    else if (sock === 'launcher') parts = CATALOG.launchVehicles;

    shelf.innerHTML = parts.map(part => {
      const isEquipped = (
        (sock === 'sensor' && this.hangar.loadout.sensorId === part.id) ||
        (sock === 'power' && this.hangar.loadout.powerId === part.id) ||
        (sock === 'engine' && this.hangar.loadout.engineId === part.id) ||
        (sock === 'comm' && this.hangar.loadout.commId === part.id) ||
        (sock === 'bus' && this.hangar.loadout.busId === part.id) ||
        (sock === 'launcher' && (this.hangar.loadout.launchVehicleId || 'lv_falcon9') === part.id)
      );

      return `
        <div class="hangar-part-card ${isEquipped ? 'equipped' : ''}" data-part-id="${part.id}">
          <div class="part-header">
            <div class="part-title-block">
              <h5>${part.name}</h5>
              <span class="part-cat-chip">${part.category || part.class || part.type || sock.toUpperCase()}</span>
            </div>
            <span class="part-equipped-tag">${isEquipped ? '✓ EQUIPPED' : '+ EQUIP'}</span>
          </div>
          <div class="part-blueprint-diagram">
            ${getPartBlueprintSVG(sock, part.id)}
          </div>
          <p class="part-desc">${part.description || ''}</p>
          <div class="part-meta">
            ${part.mass ? `<span>Mass: <strong>${part.mass} kg</strong></span>` : ''}
            ${part.leoCapacity ? `<span>LEO Cap: <strong>${part.leoCapacity} kg</strong></span>` : ''}
            ${part.fairingDiameter ? `<span>Fairing: <strong>${part.fairingDiameter}m</strong></span>` : ''}
            ${part.cost ? `<span>Cost: <strong>$${part.cost}M</strong></span>` : ''}
            ${part.powerDrawW ? `<span>Power: <strong>${part.powerDrawW} W</strong></span>` : ''}
            ${part.baseOutputWatts ? `<span>Output: <strong>+${part.baseOutputWatts} W</strong></span>` : ''}
            ${part.ispSeconds ? `<span>Isp: <strong>${part.ispSeconds} s</strong></span>` : ''}
            ${part.scienceYield ? `<span>Science: <strong>+${part.scienceYield} pts</strong></span>` : ''}
          </div>
        </div>
      `;
    }).join('');

    shelf.querySelectorAll('.hangar-part-card').forEach(card => {
      card.addEventListener('click', () => {
        const partId = card.dataset.partId;
        this.hangar.equipPart(partId);
        this.renderHangarPartsShelf();
      });
    });
  }

  updateHangarGauges(loadout) {
    const bus = CATALOG.buses.find(b => b.id === loadout.busId);
    const power = CATALOG.power.find(p => p.id === loadout.powerId);
    const sensor = CATALOG.instruments.find(i => i.id === loadout.sensorId);
    const engine = CATALOG.propulsion.find(p => p.id === loadout.engineId);
    const comm = CATALOG.comms.find(c => c.id === loadout.commId);

    const totalMass = (bus?.dryMass || 14) + (power?.mass || 18) + (sensor?.mass || 12) + (engine?.dryMass || 8) + (comm?.mass || 4);
    const totalPowerDraw = (bus?.basePowerDrawW || 15) + (sensor?.powerDrawW || 35) + (comm?.powerTxW || 10);
    const powerGen = power?.baseOutputWatts || 150;
    const netPower = powerGen - totalPowerDraw;

    // Mass Gauge
    document.getElementById('gauge-mass').innerHTML = `
      <span class="g-label">TOTAL WET MASS</span>
      <span class="g-val ${totalMass < 300 ? 'val-good' : 'val-warn'}">${totalMass.toFixed(0)} kg</span>
      <span class="g-sub">Launcher Compatible</span>
    `;

    // Power Gauge
    document.getElementById('gauge-power').innerHTML = `
      <span class="g-label">NET POWER</span>
      <span class="g-val ${netPower >= 0 ? 'val-good' : 'val-bad'}">${netPower >= 0 ? '+' : ''}${netPower.toFixed(0)} W</span>
      <span class="g-sub">Sunlight Generation</span>
    `;

    // Fuel Gauge
    document.getElementById('gauge-fuel').innerHTML = `
      <span class="g-label">DELTA-V (ISP)</span>
      <span class="g-val val-good">${engine?.ispSeconds || 120} s</span>
      <span class="g-sub">Engine Efficiency</span>
    `;

    // Cost Gauge
    const estCost = (bus?.cost || 3) + (sensor?.cost || 8) + (power?.cost || 7) + (engine?.cost || 6);
    document.getElementById('gauge-cost').innerHTML = `
      <span class="g-label">MISSION HARDWARE</span>
      <span class="g-val">$${estCost.toFixed(1)}M</span>
      <span class="g-sub">Under Budget Cap</span>
    `;

    // Science Gauge
    document.getElementById('gauge-science').innerHTML = `
      <span class="g-label">BASE SCIENCE</span>
      <span class="g-val val-sci">+${sensor?.scienceYield || 75} pts</span>
      <span class="g-sub">Per Target Scan</span>
    `;

    // Live CML Tracker Bar
    let cml = 2;
    if (sensor && power) cml = 3;
    if (netPower >= 0 && totalMass < 400) cml = 4;
    if (comm && engine) cml = 5;
    if (cml >= 5) cml = 6;

    document.getElementById('vab-cml-tracker').innerHTML = `
      <span class="cml-tag">NASA JPL CML LEVEL:</span>
      <strong>CML ${cml} / 6 (${CML_LEVELS[cml - 1].name})</strong>
      <div class="cml-mini-bar">
        ${[1, 2, 3, 4, 5, 6].map(i => `<div class="cml-pip ${i <= cml ? 'active' : ''}"></div>`).join('')}
      </div>
    `;
  }

  startFlightMission(launchSiteId, startInOrbit = false) {
    const level = this.gameManager.getCurrentLevel();
    const loadout = this.hangar.loadout;

    this.showScreen('screen-flight');
    sound.init();

    setTimeout(() => {
      if (this.flightArena) {
        this.flightArena.resize();
        this.flightArena.startMission(level, loadout, launchSiteId, startInOrbit);
      }
    }, 400);
  }

  handleMissionComplete(results) {
    const prevLevel = this.gameManager.getCurrentLevel();
    const saveRes = this.gameManager.completeLevel(results);
    const nextLevel = this.gameManager.getCurrentLevel();
    this.updatePlayerHud();

    // Match real NASA analog mission (from Telescope game resource)
    const analog = this.findAnalogMission(prevLevel, this.hangar.loadout);

    const badgeEl = document.getElementById('debrief-header-badge');
    if (badgeEl) {
      if (results.success) {
        badgeEl.textContent = '🎉 MISSION ACCOMPLISHED! ADVANCED TO NEXT MISSION';
        badgeEl.className = 'debrief-badge success';
      } else {
        badgeEl.textContent = 'MISSION LOSS / BATTERY DEPLETED';
        badgeEl.className = 'debrief-badge failure';
      }
    }
    document.getElementById('debrief-mission-title').textContent = prevLevel.title;

    // Update debrief continue button
    const contBtn = document.getElementById('debrief-continue-btn');
    if (contBtn) {
      if (results.success) {
        contBtn.innerHTML = `🚀 ASSEMBLE SPACECRAFT FOR NEXT MISSION: ${nextLevel.title} ▶`;
        contBtn.className = 'debrief-btn primary';
      } else {
        contBtn.innerHTML = `🔄 RETRY MISSION: ${prevLevel.title}`;
        contBtn.className = 'debrief-btn secondary';
      }
    }

    // Stars
    const starSpans = document.querySelectorAll('#debrief-stars-row .star-icon');
    starSpans.forEach((s, idx) => {
      s.className = `star-icon ${idx < saveRes.starsEarned ? 'earned' : ''}`;
    });

    document.getElementById('rew-score').textContent = `${results.score} PTS`;
    document.getElementById('rew-credits').textContent = `+${saveRes.creditsEarned} CR`;
    document.getElementById('rew-targets').textContent = `${results.scannedTargets !== undefined ? results.scannedTargets : (results.targetsScanned || 0)} / ${results.totalTargets || 3}`;
    document.getElementById('rew-hull').textContent = `${results.hullHealth.toFixed(0)}%`;

    // Render Peer-Reviewed Scientific Discovery Report if research data exists
    const researchBox = document.getElementById('debrief-research-box');
    if (researchBox && results.researchField) {
      researchBox.classList.remove('hidden');
      const titleEl = document.getElementById('report-field-title');
      if (titleEl) titleEl.textContent = results.researchField;
      const hypEl = document.getElementById('report-hypothesis-text');
      if (hypEl) hypEl.textContent = `"${results.researchHypothesis}"`;

      const statusEl = document.getElementById('report-hypothesis-status');
      if (statusEl) {
        statusEl.textContent = results.success ? 'HYPOTHESIS: CONFIRMED (p < 0.001)' : 'HYPOTHESIS: INSUFFICIENT DATA';
        statusEl.className = `hypothesis-badge ${results.success ? 'confirmed' : 'unconfirmed'}`;
      }

      const listEl = document.getElementById('report-discoveries-list');
      if (listEl) {
        if (results.discoveries && results.discoveries.length > 0) {
          listEl.innerHTML = results.discoveries.map(d => `
            <div class="discovery-item">
              <span class="disc-loc">📍 ${d.target}:</span>
              <span class="disc-desc">${d.discovery}</span>
            </div>
          `).join('');
        } else {
          listEl.innerHTML = `<div class="discovery-item-none">No planetary research hotspots scanned during this pass.</div>`;
        }
      }
    } else if (researchBox) {
      researchBox.classList.add('hidden');
    }

    document.getElementById('analog-name').textContent = `${analog.name} (${analog.agency})`;
    document.getElementById('analog-desc').textContent = analog.description;
    document.getElementById('analog-meta').innerHTML = `
      <span>Target: <strong>${analog.target}</strong></span>
      <span>Launch Vehicle: <strong>${analog.launchVehicle} (${analog.launchYear})</strong></span>
      <span>Cost: <strong>${analog.cost}</strong></span>
    `;

    this.showScreen('screen-debrief');
  }

  findAnalogMission(level, loadout) {
    let match = NASA_ANALOG_MISSIONS[0];
    NASA_ANALOG_MISSIONS.forEach(m => {
      if (m.matchCriteria.targetBody === level.targetBody) match = m;
    });
    return match;
  }

  renderTechTreeModal() {
    const grid = document.getElementById('techtree-grid');
    if (!grid) return;

    grid.innerHTML = TECH_TREE_ITEMS.map(tech => `
      <div class="tech-card ${tech.unlocked ? 'unlocked' : ''}">
        <div class="tech-header">
          <h5>${tech.name}</h5>
          <span class="tech-cat">${tech.category}</span>
        </div>
        <p class="tech-benefit">${tech.benefit}</p>
        <div class="tech-footer">
          <span class="tech-cost">Cost: <strong>${tech.costCredits} Credits</strong></span>
          ${tech.unlocked ? `
            <span class="tech-unlocked-badge">✓ UNLOCKED</span>
          ` : `
            <button class="tech-buy-btn" data-tech-id="${tech.id}" ${this.gameManager.credits < tech.costCredits ? 'disabled' : ''}>
              PURCHASE TECH
            </button>
          `}
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.tech-buy-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.techId;
        if (this.gameManager.unlockTech(id)) {
          sound.playSuccessChime();
          this.updatePlayerHud();
          this.renderTechTreeModal();
        }
      });
    });
  }

  renderResourcesModal() {
    const grid = document.getElementById('resources-grid');
    if (!grid) return;

    grid.innerHTML = OFFICIAL_NASA_RESOURCES.map(res => `
      <div class="resource-card">
        <span class="res-tag">${res.badge}</span>
        <h4>${res.title}</h4>
        <span class="res-source">${res.source}</span>
        <p class="res-desc">${res.summary}</p>
        <a href="${res.url}" target="_blank" rel="noopener noreferrer" class="res-external-btn">
          OPEN OFFICIAL RESOURCE ↗
        </a>
      </div>
    `).join('');
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    const game = new AstroForgeGame();
    game.init();
  });
}
