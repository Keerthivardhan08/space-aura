/**
 * ASTROFORGE: 3D Interactive Space Flight Arena
 * Powered by Three.js
 * 60 FPS full 3D orbital mechanics, crystal-clear luminous trajectory visualization,
 * Periapsis (Pe) / Apoapsis (Ap) nodes, sub-satellite ground track laser,
 * real-life RCS attitude control bursts, atmospheric scattering, and smart autopilot assists.
 */

import * as THREE from '../../libs/three.module.js';
import { Spacecraft3DBuilder } from '../engine/spacecraft3D.js';
import { Planet3DBuilder } from '../engine/planet3D.js';
import { sound } from '../engine/audio.js';
import { LAUNCH_STATIONS } from '../config/components.js';
import { DEFAULT_LAUNCHED_FLEET } from './gameManager.js';

export class FlightArena3D {
  constructor(canvasElement, onMissionEnd) {
    this.canvas = canvasElement;
    this.onMissionEnd = onMissionEnd;

    this.running = false;
    this.animId = null;
    this.lastTime = 0;

    // Mission & Loadout
    this.level = null;
    this.loadout = null;

    // Interactive Global World Map
    this.globalWorldMap = null;

    // Mission Phase State Machine
    // 'PAD' -> 'COUNTDOWN' -> 'ASCENT' -> 'STAGE1_READY' -> 'STAGE2_ASCENT' -> 'FAIRING_READY' -> 'PAYLOAD_READY' -> 'DEPLOYING' -> 'ORBIT'
    this.missionPhase = 'PAD';
    this.selectedLaunchSiteId = 'site_ksc';
    this.selectedLaunchSite = LAUNCH_STATIONS[0];
    this.countdownSec = 10.0;
    this.countdownRunning = false;
    this.autopilotAscent = false;
    this.ascentAltitudeKm = 0.0;
    this.ascentVelocityMs = 0.0;
    this.ascentPitchDeg = 90.0;
    this.ascentDownrangeKm = 0.0;
    this.ascentMassKg = 549054;
    this.initialMassKg = 549054;
    this.ascentDynamicPressureKPa = 0.0;
    this.maxQNotified = false;
    this.staged1 = false;
    this.fairingJettisoned = false;
    this.payloadSeparated = false;
    this.deployTimer = 0.0;
    this.ignitionRumblePlayed = false;

    this.dispatchedParts = [];
    this.separableRocket = null;
    this.launchPadMesh = null;

    // Camera Modes: 'pad', 'ascent', 'chase', 'orbital', 'cockpit'
    this.cameraMode = 'pad';
    this.cameraDistance = 8.0;
    this.cameraZoomFactor = 1.0; // Dynamic magnification (0.25 close to 4.5 wide)

    // Autopilot Modes
    this.autopilot = {
      sunLock: false,
      prograde: false,
      commLock: false,
      autoScan: false,
      orbitLock: true // Cruising on nominal mission orbit by default
    };
    this.sunAspect = 1.0;
    this.timeWarp = 1.0;

    // Ship State
    this.ship = {
      orbitRadius: 30.0, // units from planet center (planet radius is 18)
      basePeriapsis: 28.5,
      baseApoapsis: 31.5,
      orbitAngle: 0.0,
      orbitSpeed: 0.008,
      velocityKmS: 7.65,
      inclination: 0.22, // orbit plane tilt
      orientationYaw: 0.0,
      orientationPitch: 0.0,
      angularVelocity: 0.0,
      altitudeKm: 420,
      periapsisKm: 370,
      apoapsisKm: 470,

      // Resources
      fuelKg: 50.0,
      maxFuelKg: 50.0,
      batterySoC: 1.0,
      hullHealth: 100,
      storedDataGb: 0.0,
      maxDataGb: 32.0,
      downlinkedDataGb: 0.0,
      scienceScore: 0,

      // Flags
      thrusting: false,
      shieldActive: false,
      scanning: false,
      inEclipse: false,
      inGroundPass: false
    };

    // Input States
    this.keys = {
      left: false,
      right: false,
      thrust: false,
      scan: false,
      shield: false
    };

    // Three.js Core
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.sunLight = null;
    this.spacecraftBuilder = new Spacecraft3DBuilder();
    this.spacecraftMesh = null;
    this.thrusterFlame = null;
    this.shieldMesh = null;
    this.scanConeMesh = null;

    // Clear Luminous Orbital Trajectory Elements
    this.orbitGroup = null;
    this.orbitLine = null;
    this.orbitGlowLine = null;
    this.orbitPlaneMesh = null;
    this.peMarker = null;
    this.apMarker = null;
    this.orbitPulses = [];

    // Sub-satellite Ground Track Laser & Nadir Ring
    this.nadirLaser = null;
    this.nadirRing = null;

    // Downlink Beam
    this.downlinkLine = null;

    // Celestial System
    this.celestialSystem = null;
    this.planetMesh = null;
    this.cloudsMesh = null;
    this.targetBeacons = [];
    this.groundStation = null;
    this.debrisMeshes = [];

    // Mission Clock
    this.timeRemainingSec = 90;

    this.initThree();
    this.bindInputs();
    this.initLaunchControlUI();
  }

  initThree() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x020308);

    // Telephoto Perspective Camera for scale-accurate aerospace clarity
    this.camera = new THREE.PerspectiveCamera(36, 1, 0.1, 2500);
    this.camera.position.set(0, 8, 20);

    // High-Contrast Cinematic 3-Point Orbital Lighting Rig (matching Astra Nexus clarity)
    // 1. Warm Key Sun Light
    this.sunLight = new THREE.DirectionalLight(0xfff4e6, 3.2);
    this.sunLight.position.set(-250, 50, 120);
    this.scene.add(this.sunLight);

    // 2. Cool Blue Earthshine Fill Light (illuminates shadow side of spacecraft with planet glow)
    this.earthshineLight = new THREE.DirectionalLight(0x7090b8, 0.5);
    this.earthshineLight.position.set(120, -30, -80);
    this.scene.add(this.earthshineLight);

    // 3. Limb Rim Light (crisp silhouette definition)
    const rimLight = new THREE.DirectionalLight(0x4070a0, 0.35);
    rimLight.position.set(0, 150, -100);
    this.scene.add(rimLight);

    // 4. Ambient Space Baseline
    const ambientLight = new THREE.AmbientLight(0x101420, 0.15);
    this.scene.add(ambientLight);

    // Glowing solar corona billboard
    const sunGlowGeo = new THREE.SphereGeometry(15, 16, 16);
    const sunGlowMat = new THREE.MeshBasicMaterial({ color: 0xffedd5 });
    const sunGlow = new THREE.Mesh(sunGlowGeo, sunGlowMat);
    sunGlow.position.copy(this.sunLight.position);
    this.scene.add(sunGlow);

    // Cosmic starfield (3,000+ stars with realistic stellar temperatures)
    this.starfield = Planet3DBuilder.createStarfield(3200, 900);
    this.scene.add(this.starfield);

    // Downlink telemetry beam (spacecraft to ground station)
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 0)
    ]);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0,
      linewidth: 2
    });
    this.downlinkLine = new THREE.Line(lineGeo, lineMat);
    this.scene.add(this.downlinkLine);

    // Sub-Satellite Ground Track Laser Tether
    const tetherGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 0)
    ]);
    const tetherMat = new THREE.LineBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.65,
      linewidth: 1
    });
    this.nadirLaser = new THREE.Line(tetherGeo, tetherMat);
    this.scene.add(this.nadirLaser);

    // Nadir Surface Ground Footprint Ring
    const nadirGeo = new THREE.RingGeometry(0.6, 0.8, 24);
    const nadirMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75
    });
    this.nadirRing = new THREE.Mesh(nadirGeo, nadirMat);
    this.scene.add(this.nadirRing);

    // 1. Astronomical Constellations & Celestial Sphere (12 Iconic Constellations)
    this.constellations = Planet3DBuilder.createConstellations(1400);
    this.scene.add(this.constellations.group);
    this.constellationsEnabled = true;

    // 2. Complete Realistic 3D Solar System Orrery (Sun + 8 Planets + Moons + Asteroid Belt)
    this.solarSystem = Planet3DBuilder.createFullSolarSystem();
    this.scene.add(this.solarSystem.group);
    this.solarSystem.group.visible = false;
    this.viewMode = 'LOCAL'; // 'LOCAL' (active spacecraft) or 'SOLAR_SYSTEM' (grand heliocentric orrery)
    this.focusedPlanet = null;

    // 3. Persistent Launched Fleet Orbits Group
    this.launchedFleetGroup = new THREE.Group();
    this.scene.add(this.launchedFleetGroup);
    this.launchedSatellites = [];

    // Click listener for Solar System planet focus
    this.canvas.addEventListener('click', (e) => this.onCanvasClick(e));
  }

  bindInputs() {
    if (typeof window === 'undefined') return;

    window.addEventListener('keydown', (e) => {
      if (!this.running) return;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.keys.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') this.keys.right = true;
      if (e.code === 'ArrowUp' || e.code === 'KeyW') this.keys.thrust = true;
      if (e.code === 'ArrowDown' || e.code === 'KeyQ') this.keys.shield = true;
      if (e.code === 'KeyS') {
        if (this.missionPhase === 'ORBIT') {
          e.preventDefault();
          this.alignWithSun();
        } else {
          this.keys.shield = true;
        }
      }
      if (e.code === 'KeyZ') {
        this.zoomIn();
      }
      if (e.code === 'KeyX') {
        this.zoomOut();
      }
      if (e.code === 'KeyT') {
        if (this.missionPhase === 'ORBIT') {
          e.preventDefault();
          this.triggerDownlink();
        }
      }
      if (e.code === 'KeyO') {
        if (this.missionPhase === 'ORBIT') {
          e.preventDefault();
          this.toggleOrbitLock();
        }
      }
      if (e.code === 'Space') {
        e.preventDefault();
        if (this.missionPhase === 'PAD') {
          this.startCountdown();
        } else if (this.missionPhase === 'STAGE1_READY') {
          this.triggerStage1Separation();
        } else if (this.missionPhase === 'FAIRING_READY') {
          this.triggerFairingJettison();
        } else if (this.missionPhase === 'PAYLOAD_READY') {
          this.triggerPayloadSeparation();
        } else if (this.missionPhase === 'ORBIT') {
          this.triggerScan();
        }
      }
      if (e.code === 'KeyF') {
        if (this.missionPhase === 'FAIRING_READY') {
          e.preventDefault();
          this.triggerFairingJettison();
        }
      }
      if (e.code === 'KeyP') {
        if (this.missionPhase === 'PAYLOAD_READY') {
          e.preventDefault();
          this.triggerPayloadSeparation();
        }
      }
      if (e.code === 'Escape') {
        if (this.missionPhase !== 'ORBIT') {
          this.skipToOrbit();
        }
      }
      if (e.code === 'KeyC') {
        this.cycleCamera();
      }
      if (e.code === 'KeyM') {
        this.toggleSolarSystemView();
      }
      if (e.code === 'KeyK') {
        this.toggleConstellations();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.keys.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') this.keys.right = false;
      if (e.code === 'ArrowUp' || e.code === 'KeyW') this.keys.thrust = false;
      if (e.code === 'ArrowDown' || e.code === 'KeyQ') this.keys.shield = false;
      if (e.code === 'KeyS' && this.missionPhase !== 'ORBIT') this.keys.shield = false;
    });

    // Canvas Mouse Wheel Dynamic Zoom
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (e.deltaY > 0) {
        this.zoomOut();
      } else {
        this.zoomIn();
      }
    }, { passive: false });

    // Orbital camera mouse/touch drag
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;

    this.canvas.addEventListener('pointerdown', (e) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    });

    window.addEventListener('pointermove', (e) => {
      if (!isDragging || this.cameraMode !== 'orbital') return;
      const dx = (e.clientX - prevX) * 0.005;
      const dy = (e.clientY - prevY) * 0.005;
      this.ship.orientationYaw += dx;
      this.ship.orientationPitch = Math.max(-1.2, Math.min(1.2, this.ship.orientationPitch + dy));
      prevX = e.clientX;
      prevY = e.clientY;
    });

    window.addEventListener('pointerup', () => { isDragging = false; });
  }

  zoomIn() {
    this.cameraZoomFactor = Math.max(0.25, this.cameraZoomFactor * 0.82);
    sound.playBlip(1250, 0.04);
    this.showFloatingMessage(`🔍 ZOOM: ${(1 / this.cameraZoomFactor).toFixed(1)}X MAGNIFICATION`);
  }

  zoomOut() {
    this.cameraZoomFactor = Math.min(4.8, this.cameraZoomFactor * 1.22);
    sound.playBlip(750, 0.04);
    this.showFloatingMessage(`🔍 ZOOM: ${(1 / this.cameraZoomFactor).toFixed(1)}X WIDE-ANGLE`);
  }

  resetZoom() {
    this.cameraZoomFactor = 1.0;
    this.showFloatingMessage('🔍 ZOOM: 1.0X DEFAULT');
  }

  alignWithSun() {
    if (this.missionPhase !== 'ORBIT') return;
    const toSun = this.sunLight.position.clone().normalize();
    // In our coordinate system, solar wings extend along local X
    // Slew yaw so panel faces sun directly
    const targetYaw = Math.atan2(-toSun.z, toSun.x);
    this.ship.orientationYaw = targetYaw;
    this.sunAspect = 1.0;
    sound.playBlip(1350, 0.08);
    this.showFloatingMessage('☀️ SOLAR WINGS SLEWED: SUN ORIENTED [100% FLUX]');
  }

  triggerDownlink() {
    if (this.missionPhase !== 'ORBIT') return;

    if (this.ship.storedDataGb <= 0.05) {
      sound.playBlip(350, 0.08);
      this.showFloatingMessage('⚠️ ONBOARD DATA BUFFER EMPTY: SCAN TARGETS WITH [SPACE] FIRST!');
      return;
    }

    const amount = Math.min(this.ship.storedDataGb, 8.0);
    this.ship.storedDataGb = Math.max(0, this.ship.storedDataGb - amount);
    this.ship.downlinkedDataGb += amount;
    const pts = Math.round(amount * 25);
    this.ship.scienceScore += pts;

    sound.playBlip(1650, 0.1, 'triangle');
    sound.playBlip(2100, 0.1, 'sine');

    if (this.downlinkLine && this.spacecraftMesh) {
      const positions = this.downlinkLine.geometry.attributes.position.array;
      positions[0] = this.spacecraftMesh.position.x;
      positions[1] = this.spacecraftMesh.position.y;
      positions[2] = this.spacecraftMesh.position.z;
      // Downlink to Earth surface ground station
      positions[3] = 0;
      positions[4] = 18.0;
      positions[5] = 0;
      this.downlinkLine.geometry.attributes.position.needsUpdate = true;
      this.downlinkLine.material.opacity = 1.0;
      this.downlinkLine.material.color.setHex(0x38bdf8);
      setTimeout(() => {
        if (this.downlinkLine) this.downlinkLine.material.opacity = 0;
      }, 700);
    }

    this.showFloatingMessage(`📡 TELEMETRY DOWNLINKED: ${amount.toFixed(1)} GB (+${pts} PTS) -> ISRO ISTRAC / NASA DSN`);
  }

  toggleOrbitLock() {
    this.autopilot.orbitLock = !this.autopilot.orbitLock;
    sound.playBlip(this.autopilot.orbitLock ? 1150 : 550, 0.08);

    const orbitBtn = document.getElementById('btn-auto-orbit');
    if (orbitBtn) orbitBtn.classList.toggle('active', this.autopilot.orbitLock);
    const ctrlOrbitBtn = document.getElementById('btn-ctrl-autopilot');
    if (ctrlOrbitBtn) ctrlOrbitBtn.classList.toggle('active', this.autopilot.orbitLock);

    if (this.autopilot.orbitLock) {
      this.showFloatingMessage('🤖 ORBIT LOCK [ON]: AUTO-STEERING ALONG NOMINAL TRAJECTORY');
    } else {
      this.showFloatingMessage('🕹️ MANUAL ORBIT [ON]: THRUST [W] ADDS DELTA-V & DRIFTS FROM PATH');
    }
    return this.autopilot.orbitLock;
  }

  cycleCamera() {
    sound.playBlip(980, 0.04);
    if (this.cameraMode === 'chase') this.cameraMode = 'orbital';
    else if (this.cameraMode === 'orbital') this.cameraMode = 'cockpit';
    else this.cameraMode = 'chase';

    const camBtn = document.getElementById('btn-camera-toggle');
    if (camBtn) camBtn.textContent = `📷 CAM: ${this.cameraMode.toUpperCase()}`;
  }

  toggleAutopilot(mode) {
    this.autopilot[mode] = !this.autopilot[mode];
    sound.playBlip(this.autopilot[mode] ? 1100 : 600, 0.06);
    return this.autopilot[mode];
  }

  setTimeWarp(warp) {
    this.timeWarp = warp;
    sound.playBlip(800 * warp, 0.05);
  }

  startMission(level, loadout, launchSiteId = 'site_ksc', startInOrbit = false) {
    this.level = level;
    this.loadout = loadout;
    this.running = true;
    this.timeRemainingSec = level.timeLimitSec || 90;

    let planetType = 'earth';
    if (level.id.includes('lunar') || level.id.includes('moon')) planetType = 'moon';
    else if (level.id.includes('mars')) planetType = 'mars';
    else if (level.id.includes('europa')) planetType = 'europa';

    this.setupCelestialSystem(planetType);

    // Initial Spaceport Selection
    if (launchSiteId) {
      this.selectedLaunchSiteId = launchSiteId;
      this.selectedLaunchSite = LAUNCH_STATIONS.find(s => s.id === launchSiteId) || LAUNCH_STATIONS[0];
    }

    // Vehicle Masses based on Rocket Selection
    const rId = loadout?.launchVehicleId || 'lv_falcon9';
    if (rId === 'lv_sls') {
      this.initialMassKg = 2610000;
    } else if (rId === 'lv_vulcan') {
      this.initialMassKg = 546700;
    } else if (rId === 'lv_electron') {
      this.initialMassKg = 12500;
    } else {
      this.initialMassKg = 549054; // Falcon 9
    }
    this.ascentMassKg = this.initialMassKg;

    // Reset Staging Flags
    this.staged1 = false;
    this.fairingJettisoned = false;
    this.payloadSeparated = false;
    this.countdownRunning = false;
    this.countdownSec = 10.0;
    this.ascentAltitudeKm = 0.0;
    this.ascentVelocityMs = 0.0;
    this.ascentPitchDeg = 90.0;
    this.ascentDownrangeKm = 0.0;
    this.ascentDynamicPressureKPa = 0.0;
    this.maxQNotified = false;
    this.ignitionRumblePlayed = false;
    this.deployTimer = 0.0;

    // Clear any previous detached parts
    this.dispatchedParts.forEach(p => this.scene.remove(p.mesh));
    this.dispatchedParts = [];

    // Reset ship state
    this.ship.orbitRadius = 30.0;
    this.ship.basePeriapsis = 28.5;
    this.ship.baseApoapsis = 31.5;
    this.ship.orbitAngle = 0.0;
    this.ship.orientationYaw = 0.0;
    this.ship.orientationPitch = 0.0;
    this.ship.fuelKg = 50.0;
    this.ship.batterySoC = 1.0;
    this.ship.hullHealth = 100;
    this.ship.storedDataGb = 0.0;
    this.ship.downlinkedDataGb = 0.0;
    this.ship.scienceScore = 0;

    this.setupDebris();
    this.updateOrbitTrajectory();

    if (startInOrbit) {
      this.enterOrbit();
    } else {
      this.setupGroundLaunchPad(this.selectedLaunchSite);
    }

    this.lastTime = performance.now();
    this.animate();
  }

  setupGroundLaunchPad(site) {
    this.missionPhase = 'PAD';
    this.cameraMode = 'pad';

    // 1. Hide Space Celestial System, Solar System, Constellations and Starfield while on Terrestrial Ground
    if (this.celestialSystem) {
      this.celestialSystem.group.visible = false;
    }
    if (this.solarSystem) {
      this.solarSystem.group.visible = false;
    }
    if (this.constellations) {
      this.constellations.group.visible = false;
    }
    if (this.launchedFleetGroup) {
      this.launchedFleetGroup.visible = false;
    }
    if (this.starfield) {
      this.starfield.visible = false;
    }

    // 2. Set Atmospheric Daytime Blue Sky & Haze ("Inside Earth")
    this.scene.background = new THREE.Color(0x38bdf8);
    this.scene.fog = new THREE.FogExp2(0xbae6fd, 0.0006);

    // 3. Remove any previous ground environment, pad, or separable rocket
    if (this.groundEnvironment && this.groundEnvironment.group.parent) {
      this.scene.remove(this.groundEnvironment.group);
    }
    if (this.launchPadMesh && this.launchPadMesh.group && this.launchPadMesh.group.parent) {
      this.scene.remove(this.launchPadMesh.group);
    }
    if (this.separableRocket && this.separableRocket.root.parent) {
      this.scene.remove(this.separableRocket.root);
    }
    if (this.padLightsGroup && this.padLightsGroup.parent) {
      this.scene.remove(this.padLightsGroup);
    }
    if (this.spacecraftMesh && this.spacecraftMesh.parent) {
      this.scene.remove(this.spacecraftMesh);
    }

    // 4. Create Terrestrial Atmospheric Ground Launch Site ("Inside Earth")
    this.groundEnvironment = Planet3DBuilder.createTerrestrialGroundEnvironment(site);
    this.scene.add(this.groundEnvironment.group);

    // 5. Build Separable Multi-Stage Rocket Stack
    const rId = this.loadout?.launchVehicleId || 'lv_falcon9';
    this.separableRocket = this.spacecraftBuilder.buildSeparableRocketStack(rId, this.loadout);

    // 6. Mount rocket vertically standing on the pad launch table at y = 4.8
    const s1Half = this.separableRocket.s1Height / 2;
    this.separableRocket.root.position.set(0, 4.8 + s1Half, 0);
    this.separableRocket.root.quaternion.set(0, 0, 0, 1); // Standing straight UP (+Y)
    this.scene.add(this.separableRocket.root);

    // 7. Powerful Atmospheric Daytime Sunlight & Floodlights
    this.padLightsGroup = new THREE.Group();
    const sunLight = new THREE.DirectionalLight(0xfffaed, 2.6);
    sunLight.position.set(160, 320, 160);
    this.padLightsGroup.add(sunLight);

    const padHemi = new THREE.HemisphereLight(0x38bdf8, 0x193819, 1.8);
    this.padLightsGroup.add(padHemi);
    this.scene.add(this.padLightsGroup);

    // 8. Update HUD
    const launchOverlay = document.getElementById('launch-control-overlay');
    if (launchOverlay) launchOverlay.classList.remove('hidden');

    const orbitOverlay = document.querySelector('.flight-hud-overlay');
    if (orbitOverlay) orbitOverlay.style.display = 'none';

    // Hide orbit lines while on pad
    if (this.orbitGroup) this.orbitGroup.visible = false;
    if (this.nadirLaser) this.nadirLaser.visible = false;
    if (this.nadirRing) this.nadirRing.visible = false;

    this.updatePadCamera();
    this.updateLaunchHUD();
  }

  setupCelestialSystem(planetType) {
    if (this.celestialSystem) {
      this.scene.remove(this.celestialSystem.group);
    }
    this.targetBeacons = [];

    const radius = 18;
    this.celestialSystem = Planet3DBuilder.createCelestialSystem(planetType, radius);
    this.planetMesh = this.celestialSystem.planetMesh;
    this.cloudsMesh = this.celestialSystem.cloudsMesh;
    this.scene.add(this.celestialSystem.group);

    // Dynamic Mission Scientific Research Target Beacons
    const targets = (this.level && this.level.researchTargets && this.level.researchTargets.length > 0)
      ? this.level.researchTargets
      : [
        { lat: 25, lon: 30, label: 'SECTOR ALPHA (GEO-SCAN)', discovery: 'Geological surface baseline scan complete.' },
        { lat: -15, lon: 110, label: 'SECTOR BRAVO (THERMAL)', discovery: 'Thermal radiation equilibrium verified.' },
        { lat: 50, lon: -80, label: 'SECTOR CHARLIE (RADAR)', discovery: 'Synthetic aperture radar surface mapping verified.' }
      ];

    targets.forEach(t => {
      const beacon = Planet3DBuilder.createTargetBeacon(t.lat, t.lon, radius, t.label);
      beacon.discovery = t.discovery;
      this.celestialSystem.group.add(beacon.group);
      this.targetBeacons.push(beacon);
    });

    // Deep Space Network Ground Station (Madrid DSN)
    this.groundStation = Planet3DBuilder.createGroundStation(40, -4, radius, 'DSN MADRID');
    this.celestialSystem.group.add(this.groundStation.group);

    // Build Crystal-Clear Luminous Orbital Visualization System
    this.buildOrbitVisualization();
  }

  /**
   * Crystal-Clear Orbital Trajectory Visualization:
   * Dynamic glowing neon cyan orbit ring, orbital plane disk,
   * Periapsis (Pe) and Apoapsis (Ap) holographic 3D nodes, and directional pulses!
   */
  buildOrbitVisualization() {
    if (this.orbitGroup) {
      this.scene.remove(this.orbitGroup);
    }

    this.orbitGroup = new THREE.Group();
    this.orbitGroup.name = 'OrbitVisualizationGroup';

    // 1. Core Luminous Trajectory Line (Electric Cyan)
    const segments = 128;
    const orbitPts = [];
    for (let i = 0; i <= segments; i++) {
      orbitPts.push(new THREE.Vector3(0, 0, 0));
    }
    const lineGeo = new THREE.BufferGeometry().setFromPoints(orbitPts);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.9,
      linewidth: 2
    });
    this.orbitLine = new THREE.Line(lineGeo, lineMat);
    this.orbitGroup.add(this.orbitLine);

    // 2. Outer Glow Trajectory Line (Wider glow ribbon)
    const glowMat = new THREE.LineBasicMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.45,
      linewidth: 4
    });
    this.orbitGlowLine = new THREE.Line(lineGeo.clone(), glowMat);
    this.orbitGroup.add(this.orbitGlowLine);

    // 3. Holographic Orbital Plane Disk (Subtle inclination reference plane)
    const planeGeo = new THREE.RingGeometry(18.2, 34.0, 64);
    const planeMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.045,
      side: THREE.DoubleSide
    });
    this.orbitPlaneMesh = new THREE.Mesh(planeGeo, planeMat);
    this.orbitPlaneMesh.rotation.x = this.ship.inclination;
    this.orbitGroup.add(this.orbitPlaneMesh);

    // 4. Periapsis (Pe) 3D Node Marker (Cyan diamond)
    const peGeo = new THREE.OctahedronGeometry(0.7, 0);
    const peMat = new THREE.MeshBasicMaterial({ color: 0x10b981, wireframe: false });
    this.peMarker = new THREE.Mesh(peGeo, peMat);
    this.peMarker.name = 'PeMarker';
    this.orbitGroup.add(this.peMarker);

    // 5. Apoapsis (Ap) 3D Node Marker (Amber diamond)
    const apGeo = new THREE.OctahedronGeometry(0.7, 0);
    const apMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, wireframe: false });
    this.apMarker = new THREE.Mesh(apGeo, apMat);
    this.apMarker.name = 'ApMarker';
    this.orbitGroup.add(this.apMarker);

    // 6. Traveling Directional Orbit Motion Pulses
    this.orbitPulses = [];
    const pulseGeo = new THREE.SphereGeometry(0.25, 8, 8);
    const pulseMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe });
    for (let i = 0; i < 4; i++) {
      const pulse = new THREE.Mesh(pulseGeo, pulseMat);
      this.orbitGroup.add(pulse);
      this.orbitPulses.push({ mesh: pulse, offset: i * 0.25 });
    }

    this.scene.add(this.orbitGroup);
    this.updateOrbitTrajectory();
  }

  /**
   * Recomputes orbit points, Pe/Ap positions, and updates the glowing line in real time
   */
  updateOrbitTrajectory() {
    if (!this.orbitLine) return;

    const r = this.ship.orbitRadius;
    const peR = this.ship.basePeriapsis + (r - 30.0) * 0.8;
    const apR = this.ship.baseApoapsis + (r - 30.0) * 1.2;
    const inc = this.ship.inclination;

    // Update orbit line points
    const posAttr = this.orbitLine.geometry.attributes.position;
    const glowPosAttr = this.orbitGlowLine.geometry.attributes.position;
    const segments = posAttr.count - 1;

    for (let i = 0; i <= segments; i++) {
      const a = (i / segments) * Math.PI * 2;
      // Elliptical radius interpolation between Pe and Ap
      const curR = (peR + apR) / 2 + ((apR - peR) / 2) * Math.cos(a);
      const px = curR * Math.cos(a);
      const py = curR * Math.sin(a) * Math.sin(inc);
      const pz = curR * Math.sin(a) * Math.cos(inc);

      posAttr.setXYZ(i, px, py, pz);
      glowPosAttr.setXYZ(i, px, py, pz);
    }
    posAttr.needsUpdate = true;
    glowPosAttr.needsUpdate = true;

    // Position Periapsis Marker (at closest approach, a = Math.PI)
    if (this.peMarker) {
      const peX = peR * Math.cos(Math.PI);
      const peY = peR * Math.sin(Math.PI) * Math.sin(inc);
      const peZ = peR * Math.sin(Math.PI) * Math.cos(inc);
      this.peMarker.position.set(peX, peY, peZ);
    }

    // Position Apoapsis Marker (at highest altitude, a = 0)
    if (this.apMarker) {
      const apX = apR * Math.cos(0);
      const apY = apR * Math.sin(0) * Math.sin(inc);
      const apZ = apR * Math.sin(0) * Math.cos(inc);
      this.apMarker.position.set(apX, apY, apZ);
    }

    // Update real-world kilometer telemetry
    this.ship.altitudeKm = Math.round((r - 18.0) * 35.0);
    this.ship.periapsisKm = Math.round((peR - 18.0) * 35.0);
    this.ship.apoapsisKm = Math.round((apR - 18.0) * 35.0);
    this.ship.velocityKmS = +(7.65 * Math.sqrt(30.0 / r)).toFixed(2);
  }

  setupSpacecraft(loadout) {
    if (this.spacecraftMesh) {
      this.scene.remove(this.spacecraftMesh);
    }

    const config = {
      bus: { id: loadout?.busId || 'smallsat_octagonal' },
      power: { id: loadout?.powerId || 'deployable_panels' },
      propulsion: { id: loadout?.engineId || 'hall_effect_ion' },
      instrument: { id: loadout?.sensorId || 'multispectral_imager' },
      comm: { id: loadout?.commId || 'steerable_hga' }
    };

    this.spacecraftMesh = this.spacecraftBuilder.buildSpacecraft(config);
    this.thrusterFlame = this.spacecraftMesh.getObjectByName('ThrusterFlame');
    this.shieldMesh = this.spacecraftMesh.getObjectByName('ShieldMesh');
    this.scanConeMesh = this.spacecraftMesh.getObjectByName('ScanCone');
    this.scene.add(this.spacecraftMesh);
  }

  createRealisticSatelliteMesh(spec) {
    const group = new THREE.Group();
    group.name = spec.name;

    const metalMaterial = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.85,
      roughness: 0.25
    });
    const goldFoilMaterial = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.2
    });
    const solarMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      metalness: 0.5,
      roughness: 0.3
    });
    const darkTitaniumMaterial = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.7,
      roughness: 0.6
    });

    if (spec.type === 'iridium') {
      // IRIDIUM-33: Triangular prism main bus with twin solar wings and deployable dish
      const busGeo = new THREE.CylinderGeometry(0.5, 0.5, 1.4, 3);
      const bus = new THREE.Mesh(busGeo, metalMaterial);
      group.add(bus);

      const wingGeo = new THREE.BoxGeometry(2.2, 0.04, 0.65);
      const wingL = new THREE.Mesh(wingGeo, solarMaterial);
      wingL.position.set(-1.4, 0, 0);
      const wingR = new THREE.Mesh(wingGeo, solarMaterial);
      wingR.position.set(1.4, 0, 0);
      group.add(wingL, wingR);

      const dishGeo = new THREE.CylinderGeometry(0.4, 0.05, 0.15, 16);
      const dish = new THREE.Mesh(dishGeo, goldFoilMaterial);
      dish.position.set(0, 0.75, 0);
      group.add(dish);

    } else if (spec.type === 'cosmos') {
      // COSMOS-2251: Derelict cylindrical military spacecraft with damaged solar wing
      const bodyGeo = new THREE.CylinderGeometry(0.55, 0.55, 1.6, 12);
      const body = new THREE.Mesh(bodyGeo, darkTitaniumMaterial);
      group.add(body);

      const wingGeo = new THREE.BoxGeometry(1.6, 0.04, 0.5);
      const wing = new THREE.Mesh(wingGeo, solarMaterial);
      wing.position.set(-1.1, 0.2, 0);
      wing.rotation.z = 0.25;
      group.add(wing);

      const stumpGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.35, 6);
      const stump = new THREE.Mesh(stumpGeo, metalMaterial);
      stump.position.set(0.65, 0, 0);
      stump.rotation.z = Math.PI / 2;
      group.add(stump);

    } else if (spec.type === 'envisat') {
      // ENVISAT: Heavy European observation satellite with massive gold SAR antenna panel
      const busGeo = new THREE.BoxGeometry(0.85, 2.0, 0.85);
      const bus = new THREE.Mesh(busGeo, metalMaterial);
      group.add(bus);

      const sarGeo = new THREE.BoxGeometry(0.1, 1.8, 2.6);
      const sar = new THREE.Mesh(sarGeo, goldFoilMaterial);
      sar.position.set(0.6, 0, 0);
      group.add(sar);

      const wingGeo = new THREE.BoxGeometry(3.0, 0.05, 0.8);
      const wing = new THREE.Mesh(wingGeo, solarMaterial);
      wing.position.set(-2.0, 0, 0);
      group.add(wing);

    } else if (spec.type === 'starlink') {
      // STARLINK: Flat table chassis with single vertical solar panel
      const busGeo = new THREE.BoxGeometry(1.4, 0.16, 0.85);
      const bus = new THREE.Mesh(busGeo, metalMaterial);
      group.add(bus);

      const panelGeo = new THREE.BoxGeometry(0.04, 2.2, 0.8);
      const panel = new THREE.Mesh(panelGeo, solarMaterial);
      panel.position.set(0, 1.15, 0);
      group.add(panel);

      const ionGeo = new THREE.CylinderGeometry(0.15, 0.08, 0.2, 8);
      const ion = new THREE.Mesh(ionGeo, darkTitaniumMaterial);
      ion.position.set(-0.7, 0, 0);
      ion.rotation.z = Math.PI / 2;
      group.add(ion);

    } else {
      // Orbital Rocket Booster Adapter Debris
      const ringGeo = new THREE.TorusGeometry(0.7, 0.1, 8, 24);
      const ring = new THREE.Mesh(ringGeo, darkTitaniumMaterial);
      group.add(ring);

      const trussGeo = new THREE.BoxGeometry(0.1, 1.2, 0.1);
      const truss = new THREE.Mesh(trussGeo, metalMaterial);
      truss.position.set(0.3, 0.3, 0);
      truss.rotation.z = 0.5;
      group.add(truss);
    }

    // Active Navigation Beacon Strobe Light
    const beaconGeo = new THREE.SphereGeometry(0.18, 8, 8);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: spec.beaconColor || 0x10b981
    });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.name = 'BeaconStrobe';
    beacon.position.set(0, 0.9, 0);
    group.add(beacon);

    return group;
  }

  setupDebris() {
    this.debrisMeshes.forEach(d => {
      if (d.mesh) this.scene.remove(d.mesh);
    });
    this.debrisMeshes = [];

    const satelliteCatalog = [
      {
        id: 'sat_iridium',
        name: 'IRIDIUM-33 (COMMS)',
        orbitR: 30.8,
        inc: 0.25,
        speed: 0.0075,
        angle: 0.9,
        beaconColor: 0x10b981,
        type: 'iridium'
      },
      {
        id: 'sat_cosmos',
        name: 'COSMOS-2251 (DERELICT)',
        orbitR: 29.5,
        inc: -0.35,
        speed: -0.0082,
        angle: 2.6,
        beaconColor: 0xef4444,
        type: 'cosmos'
      },
      {
        id: 'sat_envisat',
        name: 'ENVISAT (EARTH OBS)',
        orbitR: 28.9,
        inc: 0.18,
        speed: 0.009,
        angle: 4.1,
        beaconColor: 0xf59e0b,
        type: 'envisat'
      },
      {
        id: 'sat_starlink',
        name: 'STARLINK-2048 (INTERNET)',
        orbitR: 31.4,
        inc: 0.45,
        speed: -0.0095,
        angle: 5.3,
        beaconColor: 0x38bdf8,
        type: 'starlink'
      },
      {
        id: 'sat_tiangong',
        name: 'BOOSTER ADAPTER DEBRIS',
        orbitR: 30.1,
        inc: -0.16,
        speed: 0.0068,
        angle: 1.7,
        beaconColor: 0xf43f5e,
        type: 'debris'
      }
    ];

    satelliteCatalog.forEach(spec => {
      const satGroup = this.createRealisticSatelliteMesh(spec);
      this.scene.add(satGroup);
      this.debrisMeshes.push({
        id: spec.id,
        name: spec.name,
        mesh: satGroup,
        orbitR: spec.orbitR,
        angle: spec.angle,
        speed: spec.speed,
        inc: spec.inc,
        beaconColor: spec.beaconColor,
        beaconLight: satGroup.getObjectByName('BeaconStrobe')
      });
    });
  }

  triggerScan() {
    if (!this.running) return;

    this.ship.scanning = true;
    sound.playBlip(1400, 0.15, 'triangle');

    // Volumetric sensor scan cone pulse
    if (this.scanConeMesh) {
      this.scanConeMesh.material.opacity = 0.85;
      setTimeout(() => {
        if (this.scanConeMesh) this.scanConeMesh.material.opacity = 0;
        this.ship.scanning = false;
      }, 400);
    }

    // Check line-of-sight proximity to target beacons
    const shipPos = this.spacecraftMesh ? this.spacecraftMesh.position : new THREE.Vector3();
    let hitAny = false;
    let nearestBeacon = null;
    let minBeaconDist = 9999;

    this.targetBeacons.forEach(beacon => {
      const worldTargetPos = new THREE.Vector3();
      beacon.group.getWorldPosition(worldTargetPos);
      const dist = shipPos.distanceTo(worldTargetPos);

      if (!beacon.scanned && dist < minBeaconDist) {
        minBeaconDist = dist;
        nearestBeacon = beacon;
      }

      if (!beacon.scanned && dist < 22.0) {
        beacon.scanned = true;
        hitAny = true;
        this.ship.scienceScore += 120;
        this.ship.storedDataGb = Math.min(this.ship.maxDataGb, this.ship.storedDataGb + 8.0);

        if (!this.ship.discoveries) this.ship.discoveries = [];
        this.ship.discoveries.push({
          target: beacon.label,
          discovery: beacon.discovery || 'In-situ telemetry confirmed across all sensor channels.'
        });

        beacon.group.children.forEach(c => {
          if (c.material) c.material.color.setHex(0x10b981);
        });

        sound.playSuccessChime();
        this.showFloatingMessage(`🎯 ${beacon.label} SCANNED! +120 PTS (+8GB DATA)`);
        this.showScientificDiscoveryNotification(beacon.label, beacon.discovery);
      }
    });

    if (!hitAny) {
      sound.playBlip(400, 0.08);
      if (nearestBeacon) {
        const distKm = Math.round(minBeaconDist * 45);
        this.showFloatingMessage(`⚠️ SENSOR CONE EMPTY: Nearest [${nearestBeacon.label}] is ${distKm}km away. Wait for nadir pass!`);
      } else {
        this.showFloatingMessage('⚠️ NO TARGET IN LINE-OF-SIGHT CONE: ALL TARGETS COMPLETED');
      }
    }
  }

  showScientificDiscoveryNotification(targetLabel, discoveryText) {
    const banner = document.getElementById('scientific-discovery-banner');
    if (!banner) return;
    const targetEl = document.getElementById('disc-target-name');
    const textEl = document.getElementById('disc-text');
    if (targetEl) targetEl.textContent = targetLabel;
    if (textEl) textEl.textContent = discoveryText || 'Target planetary telemetry verified in-situ.';

    banner.classList.remove('hidden');
    banner.classList.add('visible');
    clearTimeout(this.discTimer);
    this.discTimer = setTimeout(() => {
      banner.classList.remove('visible');
      setTimeout(() => banner.classList.add('hidden'), 400);
    }, 4500);
  }

  showFloatingMessage(text) {
    const banner = document.getElementById('flight-notice-banner');
    if (!banner) return;
    banner.textContent = text;
    banner.classList.remove('hidden');
    banner.style.opacity = '1';
    clearTimeout(this.bannerTimer);
    this.bannerTimer = setTimeout(() => {
      banner.style.opacity = '0';
      setTimeout(() => banner.classList.add('hidden'), 300);
    }, 2200);
  }

  updatePadCamera() {
    // Ground Spectator Vantage Point standing on launch apron inside Earth's atmosphere
    // Looking up at the colossal multi-stage rocket, red umbilical tower, and daytime blue sky!
    const camPos = new THREE.Vector3(26.0, 5.2, 26.0);
    const lookAtPos = new THREE.Vector3(0, 18.0, 0);

    this.camera.position.lerp(camPos, 0.1);
    this.camera.lookAt(lookAtPos);
  }

  updateAscentCamera() {
    if (!this.separableRocket) return;
    const rocketPos = this.separableRocket.root.position;
    const pitchRad = (90 - this.ascentPitchDeg) * (Math.PI / 180);
    const rocketDir = new THREE.Vector3(Math.sin(pitchRad), Math.cos(pitchRad), 0);

    // Dynamic cinematic tracking camera following the rocket as it ascends from Earth into space
    const camDist = Math.min(65, 20 + this.ascentAltitudeKm * 0.25);
    const camPos = rocketPos.clone()
      .add(rocketDir.clone().multiplyScalar(-camDist * 0.45))
      .add(new THREE.Vector3(-camDist * 0.55, camDist * 0.28, camDist * 0.75));

    this.camera.position.lerp(camPos, 0.15);
    this.camera.lookAt(rocketPos.clone().add(rocketDir.clone().multiplyScalar(4.0)));
  }

  startCountdown() {
    if (this.countdownRunning || this.missionPhase !== 'PAD') return;
    this.countdownRunning = true;
    this.missionPhase = 'COUNTDOWN';
    this.countdownSec = 10.0;
    this.ignitionRumblePlayed = false;
    sound.playCountdownBeep(false);
    this.showFloatingMessage('⏱️ T-10s TERMINAL COUNTDOWN INITIATED');
    this.updateLaunchHUD();
  }

  updateLaunchAndStaging(dt) {
    const warpDt = dt * this.timeWarp;

    // 1. Simulate detached parts tumbling away
    for (let i = this.dispatchedParts.length - 1; i >= 0; i--) {
      const p = this.dispatchedParts[i];
      p.mesh.position.addScaledVector(p.velocity, warpDt);
      p.mesh.rotation.x += p.angularVel.x * warpDt;
      p.mesh.rotation.y += p.angularVel.y * warpDt;
      p.mesh.rotation.z += p.angularVel.z * warpDt;
      p.lifeSec -= warpDt;
      if (p.lifeSec <= 0) {
        this.scene.remove(p.mesh);
        this.dispatchedParts.splice(i, 1);
      }
    }

    // 2. Pad Phase
    if (this.missionPhase === 'PAD') {
      this.updatePadCamera();
      this.updateLaunchHUD();
      return;
    }

    // 3. Countdown Phase
    if (this.missionPhase === 'COUNTDOWN') {
      this.countdownSec -= warpDt;
      const prevSec = Math.ceil(this.countdownSec + warpDt);
      const currSec = Math.ceil(this.countdownSec);
      if (currSec < prevSec && currSec >= 0) {
        sound.playCountdownBeep(currSec === 0);
      }

      // T-3s Main Engine Ignition sequence
      if (this.countdownSec <= 3.0 && this.separableRocket) {
        if (this.separableRocket.plumeStage1) this.separableRocket.plumeStage1.visible = true;
        if (!this.ignitionRumblePlayed) {
          sound.playLaunchRumble(4.0);
          this.ignitionRumblePlayed = true;
        }
      }

      if (this.countdownSec <= 0) {
        this.countdownSec = 0;
        this.missionPhase = 'ASCENT';
        sound.playCountdownBeep(true);
        this.showFloatingMessage('🚀 LIFTOFF! WE HAVE LIFTOFF OF THE MISSION!');
      }

      this.updatePadCamera();
      this.updateLaunchHUD();
      return;
    }

    // 4. On-Orbit Deployment Phase
    if (this.missionPhase === 'DEPLOYING') {
      this.deployTimer += warpDt;
      const progress = Math.min(1.0, this.deployTimer / 2.2);
      if (this.separableRocket) {
        this.separableRocket.unfoldSpacecraft(progress);
      }
      if (progress >= 1.0) {
        sound.playSuccessChime();
        this.showFloatingMessage('✨ SPACECRAFT DEPLOYMENT NOMINAL! SYSTEMS FULLY ONLINE');
        this.enterOrbit();
      }
      this.updateAscentCamera();
      this.updateLaunchHUD();
      return;
    }

    // 5. Ascent & Staging Kinetics
    const baseAccel = (this.missionPhase === 'STAGE2_ASCENT' || this.staged1) ? 22.0 : 14.5;
    const boost = (this.selectedLaunchSite?.earthBoostMs || 408) / 1000;

    // Velocity climbs
    this.ascentVelocityMs = Math.min(7850, this.ascentVelocityMs + (baseAccel * 15.0 + boost * 2.0) * warpDt);

    // Altitude climbs
    const climbRate = (this.ascentVelocityMs / 1000) * 1.8;
    this.ascentAltitudeKm += climbRate * warpDt;

    // Mass burns down
    const burnRate = this.staged1 ? 280 : 1850;
    this.ascentMassKg = Math.max(1200, this.ascentMassKg - burnRate * warpDt);

    // Dynamic Pressure Q
    const rho = Math.exp(-this.ascentAltitudeKm / 7.5);
    const vKmS = this.ascentVelocityMs / 1000;
    this.ascentDynamicPressureKPa = +(0.5 * rho * vKmS * vKmS * 28.0).toFixed(1);

    // Max-Q alert
    if (this.ascentAltitudeKm >= 12 && this.ascentAltitudeKm <= 16 && !this.maxQNotified) {
      this.maxQNotified = true;
      this.showFloatingMessage('⚠️ MAX-Q: PEAK AERODYNAMIC DYNAMIC PRESSURE (35.2 kPa)');
      sound.playTelemetryPing();
    }

    // Downrange distance
    this.ascentDownrangeKm += (this.ascentVelocityMs / 1000) * Math.sin((90 - this.ascentPitchDeg) * (Math.PI / 180)) * warpDt * 10;

    // Gravity turn pitch
    if (this.ascentAltitudeKm > 8.0) {
      if (this.keys.right) this.ascentPitchDeg = Math.max(8.0, this.ascentPitchDeg - 12.0 * warpDt);
      if (this.keys.left) this.ascentPitchDeg = Math.min(90.0, this.ascentPitchDeg + 12.0 * warpDt);
      this.ascentPitchDeg = Math.max(10.0, this.ascentPitchDeg - (climbRate * 0.12) * warpDt);
    }

    // Dynamic Sky & Atmosphere Transition ("Inside Earth" to "Deep Space")
    if (this.ascentAltitudeKm < 20.0) {
      // Troposphere: Daylight cyan-blue
      this.scene.background = new THREE.Color(0x38bdf8);
      if (this.scene.fog) this.scene.fog.density = 0.0006;
    } else if (this.ascentAltitudeKm < 55.0) {
      // Stratosphere: Gradient from cyan-blue to deep navy/midnight
      const t = (this.ascentAltitudeKm - 20.0) / 35.0;
      const c1 = new THREE.Color(0x38bdf8);
      const c2 = new THREE.Color(0x0f172a);
      this.scene.background = c1.lerp(c2, t);
      if (this.scene.fog) this.scene.fog.density = Math.max(0.00005, 0.0006 * (1.0 - t));
    } else if (this.ascentAltitudeKm < 90.0) {
      // Mesosphere / Thermosphere: Transition to deep space black, stars emerge
      const t = (this.ascentAltitudeKm - 55.0) / 35.0;
      const c2 = new THREE.Color(0x0f172a);
      const c3 = new THREE.Color(0x020308);
      this.scene.background = c2.lerp(c3, t);
      if (this.scene.fog) this.scene.fog.density = Math.max(0, 0.00005 * (1.0 - t));
      if (this.starfield) this.starfield.visible = true;
      if (this.groundEnvironment?.curvedEarthLimb) {
        this.groundEnvironment.curvedEarthLimb.visible = true;
      }
    } else {
      // Edge of space / Karman Line: Pure cosmic space
      this.scene.background = new THREE.Color(0x020308);
      this.scene.fog = null;
      if (this.starfield) this.starfield.visible = true;
      if (this.groundEnvironment?.curvedEarthLimb) {
        this.groundEnvironment.curvedEarthLimb.visible = true;
      }
    }

    // Move rocket mesh upward from the ground in 3D
    if (this.separableRocket) {
      const s1Half = this.separableRocket.s1Height / 2;
      const pitchRad = (90 - this.ascentPitchDeg) * (Math.PI / 180);

      // Rocket climbs along Y, with downrange drift along X (East)
      const visualY = 4.8 + s1Half + (this.ascentAltitudeKm * 18.0);
      const visualX = this.ascentDownrangeKm * 3.5;
      this.separableRocket.root.position.set(visualX, visualY, 0);

      // Tilt rocket in flight direction
      const euler = new THREE.Euler(0, 0, -pitchRad, 'XYZ');
      this.separableRocket.root.quaternion.setFromEuler(euler);

      if (this.separableRocket.plumeStage1 && this.separableRocket.plumeStage1.visible) {
        this.separableRocket.plumeStage1.scale.set(
          1 + (Math.random() - 0.5) * 0.15,
          1 + (Math.random() - 0.5) * 0.2,
          1 + (Math.random() - 0.5) * 0.15
        );
      }
      if (this.separableRocket.plumeStage2 && this.separableRocket.plumeStage2.visible) {
        this.separableRocket.plumeStage2.scale.set(
          1 + (Math.random() - 0.5) * 0.1,
          1 + (Math.random() - 0.5) * 0.15,
          1 + (Math.random() - 0.5) * 0.1
        );
      }

      // Umbilical tower swing arms retract during liftoff
      if (this.groundEnvironment?.retractArms) {
        const armRetract = Math.min(1.0, this.ascentAltitudeKm * 2.0);
        this.groundEnvironment.retractArms(armRetract);
      }
    }

    // Staging Checkpoints:
    // 1. MECO & Stage 1 Separation (~52 km)
    if (this.ascentAltitudeKm >= 52 && !this.staged1 && this.missionPhase !== 'STAGE1_READY') {
      this.missionPhase = 'STAGE1_READY';
      if (this.separableRocket && this.separableRocket.plumeStage1) {
        this.separableRocket.plumeStage1.visible = false;
      }
      this.showFloatingMessage('🔥 MECO! MAIN ENGINE CUTOFF. READY FOR STAGE 1 SEPARATION');
      sound.playTelemetryPing();
      if (this.autopilotAscent) {
        setTimeout(() => this.triggerStage1Separation(), 1400);
      }
    }

    // 2. Karman Line & Fairing Jettison (~105 km)
    if (this.ascentAltitudeKm >= 105 && !this.fairingJettisoned && this.missionPhase !== 'FAIRING_READY') {
      this.missionPhase = 'FAIRING_READY';
      this.showFloatingMessage('🛡️ ATMOSPHERE CLEARED (105 KM). JETTISON FAIRING TO SHED DEAD WEIGHT');
      sound.playTelemetryPing();
      if (this.autopilotAscent) {
        setTimeout(() => this.triggerFairingJettison(), 1400);
      }
    }

    // 3. Orbital Velocity & Payload Separation (~200 km, ~7,600 m/s)
    if (this.ascentAltitudeKm >= 195 && this.ascentVelocityMs >= 7500 && !this.payloadSeparated && this.missionPhase !== 'PAYLOAD_READY') {
      this.missionPhase = 'PAYLOAD_READY';
      if (this.separableRocket && this.separableRocket.plumeStage2) {
        this.separableRocket.plumeStage2.visible = false;
      }
      this.showFloatingMessage('🎯 SECO: SECOND ENGINE CUTOFF. NOMINAL ORBITAL VELOCITY ACHIEVED');
      sound.playTelemetryPing();
      if (this.autopilotAscent) {
        setTimeout(() => this.triggerPayloadSeparation(), 1400);
      }
    }

    this.updateAscentCamera();
    this.updateLaunchHUD();
  }

  triggerStage1Separation() {
    if (this.staged1 || !this.separableRocket) return;
    this.staged1 = true;

    sound.playStagingSeparation();

    const stage1 = this.separableRocket.stage1Group;
    if (stage1) {
      const worldPos = new THREE.Vector3();
      const worldQuat = new THREE.Quaternion();
      stage1.getWorldPosition(worldPos);
      stage1.getWorldQuaternion(worldQuat);

      this.separableRocket.root.remove(stage1);
      this.scene.add(stage1);
      stage1.position.copy(worldPos);
      stage1.quaternion.copy(worldQuat);

      const retroDir = new THREE.Vector3(0, -1, 0).applyQuaternion(worldQuat).multiplyScalar(1.2);
      this.dispatchedParts.push({
        mesh: stage1,
        velocity: retroDir,
        angularVel: new THREE.Vector3(0.04, 0.02, 0.03),
        lifeSec: 20.0
      });
    }

    const interstage = this.separableRocket.interstageMesh;
    if (interstage) {
      const wPos = new THREE.Vector3();
      const wQuat = new THREE.Quaternion();
      interstage.getWorldPosition(wPos);
      interstage.getWorldQuaternion(wQuat);
      this.separableRocket.root.remove(interstage);
      this.scene.add(interstage);
      interstage.position.copy(wPos);
      interstage.quaternion.copy(wQuat);
      this.dispatchedParts.push({
        mesh: interstage,
        velocity: new THREE.Vector3(0, -0.8, 0).applyQuaternion(wQuat),
        angularVel: new THREE.Vector3(0.05, 0.05, 0),
        lifeSec: 15.0
      });
    }

    // Shed ~76% of vehicle mass!
    this.ascentMassKg = Math.round(this.ascentMassKg * 0.24);

    // Ignite Stage 2 vacuum engine!
    if (this.separableRocket.plumeStage2) {
      this.separableRocket.plumeStage2.visible = true;
    }
    sound.playLaunchRumble(2.5);

    this.missionPhase = 'STAGE2_ASCENT';
    this.showFloatingMessage('🚀 STAGE 1 BOOSTER JETTISONED! 76% MASS SHED. VACUUM IGNITION CONFIRMED');
    this.updateLaunchHUD();
  }

  triggerFairingJettison() {
    if (this.fairingJettisoned || !this.separableRocket) return;
    this.fairingJettisoned = true;

    sound.playFairingJettison();

    const fairingL = this.separableRocket.fairingLeft;
    const fairingR = this.separableRocket.fairingRight;

    [
      { mesh: fairingL, dir: new THREE.Vector3(-1.4, 0.4, 0.2) },
      { mesh: fairingR, dir: new THREE.Vector3(1.4, 0.4, 0.2) }
    ].forEach(({ mesh, dir }) => {
      if (mesh && mesh.parent) {
        const wPos = new THREE.Vector3();
        const wQuat = new THREE.Quaternion();
        mesh.getWorldPosition(wPos);
        mesh.getWorldQuaternion(wQuat);

        mesh.parent.remove(mesh);
        this.scene.add(mesh);
        mesh.position.copy(wPos);
        mesh.quaternion.copy(wQuat);

        const worldDir = dir.clone().applyQuaternion(wQuat);
        this.dispatchedParts.push({
          mesh,
          velocity: worldDir,
          angularVel: new THREE.Vector3(0.06, 0.04, 0.08),
          lifeSec: 25.0
        });
      }
    });

    // Shed 1,800 kg fairing dead weight!
    this.ascentMassKg = Math.max(1200, this.ascentMassKg - 1800);

    this.showFloatingMessage('🛡️ PAYLOAD FAIRING JETTISONED! SHED 1,800 KG DEAD WEIGHT. SATELLITE EXPOSED');
    this.updateLaunchHUD();
  }

  triggerPayloadSeparation() {
    if (this.payloadSeparated || !this.separableRocket) return;
    this.payloadSeparated = true;

    sound.playStagingSeparation();

    const stage2 = this.separableRocket.stage2Group;
    if (stage2) {
      const wPos = new THREE.Vector3();
      const wQuat = new THREE.Quaternion();
      stage2.getWorldPosition(wPos);
      stage2.getWorldQuaternion(wQuat);

      this.separableRocket.root.remove(stage2);
      this.scene.add(stage2);
      stage2.position.copy(wPos);
      stage2.quaternion.copy(wQuat);

      const retroDir = new THREE.Vector3(0, -1.0, 0).applyQuaternion(wQuat);
      this.dispatchedParts.push({
        mesh: stage2,
        velocity: retroDir,
        angularVel: new THREE.Vector3(0.02, 0.02, 0.01),
        lifeSec: 30.0
      });
    }

    this.missionPhase = 'DEPLOYING';
    this.deployTimer = 0.0;
    sound.playDeploymentServo();
    this.showFloatingMessage('🛰️ SPACECRAFT SEPARATION CONFIRMED! DEPLOYING SOLAR ARRAYS');
    this.updateLaunchHUD();
  }

  enterOrbit() {
    this.missionPhase = 'ORBIT';

    // 1. Remove ground environment & pad lights
    if (this.groundEnvironment && this.groundEnvironment.group && this.groundEnvironment.group.parent) {
      this.scene.remove(this.groundEnvironment.group);
    }
    if (this.separableRocket && this.separableRocket.root.parent) {
      this.scene.remove(this.separableRocket.root);
    }
    if (this.padLightsGroup && this.padLightsGroup.parent) {
      this.scene.remove(this.padLightsGroup);
    }

    // 2. Restore deep space background, starfield, and orbital celestial Earth globe
    if (this.celestialSystem) {
      this.celestialSystem.group.visible = true;
    }
    if (this.starfield) {
      this.starfield.visible = true;
    }
    this.scene.background = new THREE.Color(0x020308);
    this.scene.fog = null;

    if (this.constellations) {
      this.constellations.group.visible = this.constellationsEnabled;
    }
    if (this.launchedFleetGroup) {
      this.launchedFleetGroup.visible = true;
    }

    this.setupSpacecraft(this.loadout);

    this.ship.orbitRadius = 30.0;
    this.ship.orbitAngle = 0.0;
    this.updateOrbitTrajectory();

    if (this.orbitGroup) this.orbitGroup.visible = true;
    if (this.nadirLaser) this.nadirLaser.visible = true;
    if (this.nadirRing) this.nadirRing.visible = true;

    // Register active spacecraft into player's persistent fleet
    if (window.astroforgeApp && window.astroforgeApp.gameManager) {
      window.astroforgeApp.gameManager.registerLaunchedMission(this.level, this.loadout, {
        radius: this.ship.orbitRadius,
        eccentricity: 0.04,
        inclination: this.ship.inclination || 0.0
      });
    }

    // Build 3D orbits and satellites for all launched spacecraft
    this.setupLaunchedFleetOrbits();

    const launchOverlay = document.getElementById('launch-control-overlay');
    if (launchOverlay) launchOverlay.classList.add('hidden');

    const orbitOverlay = document.querySelector('.flight-hud-overlay');
    if (orbitOverlay) orbitOverlay.style.display = 'flex';

    this.cameraMode = 'chase';
    sound.playTelemetryPing();
    this.showFloatingMessage('🛰️ ORBITAL INSERTION COMPLETE! FLIGHT CONTROLS ACTIVE [W/A/D/SPACE]');
  }

  setupLaunchedFleetOrbits() {
    // Clear previous fleet meshes
    while (this.launchedFleetGroup.children.length > 0) {
      this.launchedFleetGroup.remove(this.launchedFleetGroup.children[0]);
    }
    this.launchedSatellites = [];

    let fleet = [];
    if (window.astroforgeApp && window.astroforgeApp.gameManager) {
      fleet = window.astroforgeApp.gameManager.getFleet();
    } else {
      try {
        const saved = localStorage.getItem('astroforge_save_v1');
        if (saved) {
          const d = JSON.parse(saved);
          fleet = d.launchedFleet || [];
        }
      } catch (e) {}
    }

    if (!fleet || fleet.length === 0) {
      fleet = DEFAULT_LAUNCHED_FLEET;
    }

    const badge = document.getElementById('fleet-count-badge');
    if (badge) badge.textContent = fleet.length;

    // In local mode, filter for satellites around current celestial body (or all if interplanetary)
    const currentBody = this.level?.targetBody || 'earth';
    const isSolar = (this.viewMode === 'SOLAR_SYSTEM');
    const toRender = isSolar ? fleet : fleet.filter(s => s.targetBody === currentBody);

    toRender.forEach(sat => {
      const satMeshObj = Planet3DBuilder.createLaunchedOrbitMesh(sat, 18.0);
      this.launchedFleetGroup.add(satMeshObj.group);
      this.launchedSatellites.push(satMeshObj);
    });
  }

  toggleSolarSystemView() {
    if (this.missionPhase !== 'ORBIT') return;
    this.viewMode = (this.viewMode === 'LOCAL') ? 'SOLAR_SYSTEM' : 'LOCAL';
    const isSolar = (this.viewMode === 'SOLAR_SYSTEM');

    if (this.celestialSystem) this.celestialSystem.group.visible = !isSolar;
    if (this.spacecraftMesh) this.spacecraftMesh.visible = !isSolar;
    if (this.orbitGroup) this.orbitGroup.visible = !isSolar;
    if (this.nadirLaser) this.nadirLaser.visible = !isSolar;
    if (this.nadirRing) this.nadirRing.visible = !isSolar;
    if (this.downlinkLine) this.downlinkLine.visible = !isSolar;
    if (this.solarSystem) this.solarSystem.group.visible = isSolar;

    // Rebuild fleet orbits for the active view mode
    this.setupLaunchedFleetOrbits();

    const btn = document.getElementById('btn-toggle-solar');
    if (isSolar) {
      this.cameraMode = 'solar';
      this.focusedPlanet = null;
      this.camera.position.set(0, 580, 780);
      this.camera.lookAt(0, 0, 0);
      if (btn) {
        btn.textContent = '🛰️ LOCAL ORBIT';
        btn.classList.add('active');
      }
      this.showFloatingMessage('🌌 SOLAR SYSTEM ORRERY: SUN, 8 PLANETS, BELT & MOONS [CLICK PLANET TO FOCUS]');
      sound.playSuccessChime();
    } else {
      this.cameraMode = 'chase';
      this.focusedPlanet = null;
      if (btn) {
        btn.textContent = '🌌 SOLAR SYSTEM';
        btn.classList.remove('active');
      }
      this.showFloatingMessage('🛰️ RETURNED TO LOCAL SPACECRAFT ORBIT VIEW');
      sound.playBlip(1100, 0.08);
    }
  }

  toggleConstellations() {
    this.constellationsEnabled = !this.constellationsEnabled;
    if (this.constellations) {
      this.constellations.setVisible(this.constellationsEnabled);
    }
    sound.playBlip(this.constellationsEnabled ? 1200 : 700, 0.06);
    this.showFloatingMessage(this.constellationsEnabled ? '✨ ASTRONOMICAL CONSTELLATIONS & SKY ACTIVE' : '✨ CONSTELLATIONS HIDDEN');
    const btn = document.getElementById('btn-toggle-constellations');
    if (btn) {
      btn.classList.toggle('active', this.constellationsEnabled);
    }
  }

  openFleetModal() {
    let fleet = [];
    if (window.astroforgeApp && window.astroforgeApp.gameManager) {
      fleet = window.astroforgeApp.gameManager.getFleet();
    } else {
      fleet = DEFAULT_LAUNCHED_FLEET;
    }
    const modal = document.getElementById('modal-fleet');
    const grid = document.getElementById('fleet-cards-grid');
    if (!modal || !grid) return;

    modal.classList.remove('hidden');
    modal.style.display = 'flex';

    grid.innerHTML = fleet.map(sat => `
      <div class="fleet-card" style="border-left: 4px solid ${sat.color};">
        <div class="fleet-card-header">
          <span class="fleet-icon">🛰️</span>
          <div>
            <h4 class="fleet-name">${sat.name}</h4>
            <span class="fleet-callsign">${sat.callsign} • Body: <strong>${(sat.targetBody || 'Earth').toUpperCase()}</strong></span>
          </div>
          <span class="fleet-status-badge ${sat.isUserCraft ? 'user-crafted' : ''}">${sat.status}</span>
        </div>
        <div class="fleet-meta-grid">
          <div>Orbit: <strong>${sat.orbitType || 'LEO'}</strong></div>
          <div>Altitude: <strong>~${sat.altitudeKm} km</strong></div>
          <div>Eccentricity: <strong>${(+sat.eccentricity).toFixed(3)}</strong></div>
          <div>Period: <strong>${Math.round(sat.orbitPeriodSec)}s</strong></div>
        </div>
        <div class="fleet-footer">
          <span class="fleet-date">Launched: ${sat.launchDate}</span>
          <button class="fleet-focus-btn" data-sat-id="${sat.id}">🎯 TRACK IN 3D</button>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.fleet-focus-btn').forEach(b => {
      b.addEventListener('click', (e) => {
        const id = e.target.dataset.satId;
        const satObj = this.launchedSatellites.find(s => s.satData.id === id);
        if (satObj) {
          modal.classList.add('hidden');
          modal.style.display = 'none';
          this.camera.position.copy(satObj.craftGroup.position.clone().add(new THREE.Vector3(8, 5, 8)));
          this.camera.lookAt(satObj.craftGroup.position);
          sound.playBlip(1300, 0.1);
          this.showFloatingMessage(`🎯 TRACKING SATELLITE: ${satObj.satData.name}`);
        }
      });
    });
  }

  onCanvasClick(event) {
    if (this.viewMode !== 'SOLAR_SYSTEM' || !this.solarSystem) return;
    const rect = this.canvas.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);

    const planetMeshes = this.solarSystem.planets.map(p => p.mesh);
    planetMeshes.push(this.solarSystem.sunMesh);

    const intersects = raycaster.intersectObjects(planetMeshes);
    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const found = this.solarSystem.planets.find(p => p.mesh === hit);
      if (found) {
        sound.playBlip(1250, 0.1);
        this.focusPlanet(found);
      } else if (hit === this.solarSystem.sunMesh) {
        sound.playBlip(900, 0.1);
        this.camera.position.set(0, 40, 65);
        this.camera.lookAt(0, 0, 0);
        this.showFloatingMessage('☉ FOCUSED ON THE SUN [SOLAR PHOTOSPHERE & CORONA]');
      }
    }
  }

  focusPlanet(planet) {
    this.focusedPlanet = planet;
    const pPos = planet.group.position;
    const offset = Math.max(18, planet.radius * 3.5);
    this.camera.position.set(pPos.x + offset, pPos.y + offset * 0.5, pPos.z + offset);
    this.camera.lookAt(pPos);
    this.showFloatingMessage(`🎯 FOCUSED ON ${planet.name} [RADIUS ${planet.radius} | a=${planet.semiMajor}]`);
  }

  skipToOrbit() {
    sound.playBlip(1200, 0.1);
    this.staged1 = true;
    this.fairingJettisoned = true;
    this.payloadSeparated = true;
    this.enterOrbit();
  }

  initLaunchControlUI() {
    document.getElementById('btn-launch-countdown')?.addEventListener('click', () => {
      if (this.missionPhase === 'PAD') {
        this.startCountdown();
      }
    });

    document.getElementById('btn-launch-autopilot')?.addEventListener('click', (e) => {
      this.autopilotAscent = !this.autopilotAscent;
      e.currentTarget.classList.toggle('active', this.autopilotAscent);
      sound.playBlip(this.autopilotAscent ? 1100 : 600, 0.06);
      this.showFloatingMessage(this.autopilotAscent ? '🤖 AUTOPILOT ASCENT & AUTO-STAGING ENGAGED' : '👨‍✈️ MANUAL STAGING MODE ENGAGED');
      if (this.autopilotAscent && this.missionPhase === 'PAD') {
        this.startCountdown();
      }
    });

    document.getElementById('btn-skip-to-orbit')?.addEventListener('click', () => {
      this.skipToOrbit();
    });

    document.getElementById('btn-select-spaceport')?.addEventListener('click', () => {
      this.openSpaceportsModal();
    });

    document.getElementById('close-spaceports-btn')?.addEventListener('click', () => {
      const modal = document.getElementById('modal-spaceports');
      if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
      }
    });

    // Solar System, Constellations, and Fleet HUD buttons
    document.getElementById('btn-toggle-solar')?.addEventListener('click', () => {
      this.toggleSolarSystemView();
    });

    document.getElementById('btn-toggle-constellations')?.addEventListener('click', () => {
      this.toggleConstellations();
    });

    document.getElementById('btn-toggle-fleet')?.addEventListener('click', () => {
      this.openFleetModal();
    });

    document.getElementById('close-fleet-btn')?.addEventListener('click', () => {
      const modal = document.getElementById('modal-fleet');
      if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
      }
    });
  }

  openSpaceportsModal() {
    const modal = document.getElementById('modal-spaceports');
    if (modal) {
      modal.classList.remove('hidden');
      modal.style.display = 'flex';
    }
    this.renderSpaceportsGrid();
  }

  renderSpaceportsGrid() {
    const grid = document.getElementById('spaceports-cards-grid');
    if (!grid) return;

    grid.innerHTML = LAUNCH_STATIONS.map(st => `
      <div class="spaceport-select-card ${this.selectedLaunchSiteId === st.id ? 'selected' : ''}" data-station-id="${st.id}">
        <div class="sp-card-header">
          <span style="font-size: 1.5rem;">${st.icon}</span>
          <span class="sp-card-name">${st.name}</span>
          <span class="sp-card-country-badge">${st.country}</span>
        </div>
        <div class="sp-card-meta">
          <span class="sp-card-loc">📍 ${st.location} • Lat: <strong>${st.latitude}° N</strong></span>
          <span class="sp-card-boost">⚡ Earth Rotation Boost: <strong>+${st.earthBoostMs} m/s</strong></span>
        </div>
        <p class="sp-card-desc">${st.description}</p>
        <div class="sp-card-research">
          <strong>🔬 RESEARCH FOCUS:</strong> ${st.researchFocus}
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.spaceport-select-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.stationId;
        this.selectLaunchSite(id);
        const modal = document.getElementById('modal-spaceports');
        if (modal) {
          modal.classList.add('hidden');
          modal.style.display = 'none';
        }
      });
    });
  }

  selectLaunchSite(siteId) {
    const site = LAUNCH_STATIONS.find(s => s.id === siteId);
    if (!site) return;
    this.selectedLaunchSiteId = siteId;
    this.selectedLaunchSite = site;

    const nameEl = document.getElementById('spaceport-name-display');
    if (nameEl) nameEl.textContent = `${site.icon} ${site.name}`;
    const coordsEl = document.getElementById('spaceport-coords-display');
    if (coordsEl) coordsEl.textContent = `${site.location} • ${site.latitude}° N • Earth Rotation Boost: +${site.earthBoostMs} m/s`;

    if (this.missionPhase === 'PAD') {
      this.setupGroundLaunchPad(site);
    }

    this.renderSpaceportsGrid();
    sound.playBlip(1050, 0.08);
  }

  updateLaunchHUD() {
    const setTxt = (id, txt) => {
      const el = document.getElementById(id);
      if (el) el.textContent = txt;
    };

    setTxt('ascent-alt-val', `${this.ascentAltitudeKm.toFixed(1)} KM`);
    setTxt('ascent-vel-val', `${Math.round(this.ascentVelocityMs)} M/S (Mach ${(this.ascentVelocityMs / 340).toFixed(1)})`);
    setTxt('ascent-q-val', `${this.ascentDynamicPressureKPa} kPa`);
    setTxt('ascent-mass-val', `${Math.round(this.ascentMassKg).toLocaleString()} KG`);
    const twr = Math.min(4.5, (1.28 * (this.initialMassKg / Math.max(1000, this.ascentMassKg)))).toFixed(2);
    setTxt('ascent-twr-val', `${twr}`);
    setTxt('ascent-range-val', `${this.ascentDownrangeKm.toFixed(1)} KM`);

    const badge = document.getElementById('staging-phase-badge');
    const headline = document.getElementById('staging-status-headline');
    const sub = document.getElementById('staging-guidance-sub');
    const dock = document.getElementById('staging-action-dock');

    if (!badge || !headline || !sub || !dock) return;

    if (this.missionPhase === 'PAD') {
      badge.className = 'staging-phase-badge';
      badge.textContent = 'T-MINUS TERMINAL COUNTDOWN';
      headline.textContent = 'READY FOR PAD IGNITION';
      sub.textContent = 'All vehicle systems verified. Ready for automatic terminal countdown poll.';
      dock.innerHTML = `
        <button id="btn-dyn-countdown" class="staging-big-btn primary">
          🚀 INITIATE TERMINAL COUNTDOWN (T-10s)
        </button>
        <button id="btn-dyn-autopilot" class="staging-big-btn ${this.autopilotAscent ? 'secondary active' : 'secondary'}">
          🤖 ${this.autopilotAscent ? 'AUTOPILOT: ON (AUTO-STAGING)' : 'AUTOPILOT LAUNCH'}
        </button>
      `;
      document.getElementById('btn-dyn-countdown')?.addEventListener('click', () => this.startCountdown());
      document.getElementById('btn-dyn-autopilot')?.addEventListener('click', () => {
        this.autopilotAscent = !this.autopilotAscent;
        this.updateLaunchHUD();
        if (this.autopilotAscent) this.startCountdown();
      });

    } else if (this.missionPhase === 'COUNTDOWN') {
      badge.className = 'staging-phase-badge danger';
      badge.textContent = `T-MINUS ${this.countdownSec.toFixed(1)}s`;
      headline.textContent = this.countdownSec <= 3.0 ? '🔥 MAIN ENGINE IGNITION!' : 'TERMINAL COUNTDOWN IN PROGRESS';
      sub.textContent = this.countdownSec <= 3.0 ? 'Water deluge suppression active. Hold-down clamp release imminent.' : 'Guidance system internal. Launch umbilical tower retraction.';
      dock.innerHTML = `
        <div style="font-family: var(--font-mono); font-size: 1.6rem; font-weight: 900; color: #fbbf24;">
          T - ${this.countdownSec.toFixed(1)} SECONDS
        </div>
      `;

    } else if (this.missionPhase === 'ASCENT') {
      badge.className = 'staging-phase-badge active';
      badge.textContent = 'ATMOSPHERIC BOOST PHASE';
      headline.textContent = `ASCENT: GRAVITY TURN (PITCH ${Math.round(this.ascentPitchDeg)}°)`;
      sub.textContent = 'Vehicle accelerating through dense atmosphere. Steer pitch using [A] / [D] or click below.';
      dock.innerHTML = `
        <button id="btn-dyn-pitch" class="staging-big-btn secondary">
          🔄 PITCH DOWNRANGE (GRAVITY TURN)
        </button>
      `;
      document.getElementById('btn-dyn-pitch')?.addEventListener('click', () => {
        this.ascentPitchDeg = Math.max(15, this.ascentPitchDeg - 10);
      });

    } else if (this.missionPhase === 'STAGE1_READY') {
      badge.className = 'staging-phase-badge danger';
      badge.textContent = 'STAGE 1 BURNOUT (MECO)';
      headline.textContent = '⚡ READY TO JETTISON STAGE 1 BOOSTER';
      sub.textContent = 'Stage 1 propellant exhausted! Dispatch spent booster to shed 76% vehicle mass & surge acceleration!';
      dock.innerHTML = `
        <button id="btn-dyn-stage1" class="staging-big-btn staging-trigger">
          ⚡ STAGE 1: JETTISON BOOSTER (PRESS SPACE)
        </button>
      `;
      document.getElementById('btn-dyn-stage1')?.addEventListener('click', () => this.triggerStage1Separation());

    } else if (this.missionPhase === 'STAGE2_ASCENT') {
      badge.className = 'staging-phase-badge active';
      badge.textContent = 'STAGE 2 VACUUM ACCELERATION';
      headline.textContent = 'VACUUM BURN TOWARDS ORBITAL VELOCITY';
      sub.textContent = 'Stage 2 vacuum engine delivering optimal Isp efficiency in upper atmosphere.';
      dock.innerHTML = `
        <div style="font-family: var(--font-mono); font-size: 0.95rem; color: #38bdf8;">
          ACCELERATING TO ORBITAL INJECTION (~7,800 M/S)
        </div>
      `;

    } else if (this.missionPhase === 'FAIRING_READY') {
      badge.className = 'staging-phase-badge active';
      badge.textContent = 'ATMOSPHERE CLEARED (105+ KM)';
      headline.textContent = '🛡️ JETTISON AERODYNAMIC PAYLOAD FAIRING';
      sub.textContent = 'Outside dense atmosphere! Dispatch fairing halves to discard 1,800 kg dead weight and expose satellite!';
      dock.innerHTML = `
        <button id="btn-dyn-fairing" class="staging-big-btn fairing-trigger">
          🛡️ JETTISON FAIRINGS (SHED DEAD WEIGHT) [F]
        </button>
      `;
      document.getElementById('btn-dyn-fairing')?.addEventListener('click', () => this.triggerFairingJettison());

    } else if (this.missionPhase === 'PAYLOAD_READY') {
      badge.className = 'staging-phase-badge active';
      badge.textContent = 'SECO: ORBITAL VELOCITY ACHIEVED';
      headline.textContent = '🎯 READY FOR SPACECRAFT SEPARATION';
      sub.textContent = '7,800 m/s orbital velocity reached! Release payload adapter clamps to separate spacecraft!';
      dock.innerHTML = `
        <button id="btn-dyn-payload" class="staging-big-btn payload-trigger">
          🛰️ DEPLOY SPACECRAFT (PRESS P)
        </button>
      `;
      document.getElementById('btn-dyn-payload')?.addEventListener('click', () => this.triggerPayloadSeparation());

    } else if (this.missionPhase === 'DEPLOYING') {
      badge.className = 'staging-phase-badge active';
      badge.textContent = 'ON-ORBIT SYSTEM DEPLOYMENT';
      headline.textContent = 'UNFOLDING SOLAR WINGS & CASSEGRAIN DISH';
      sub.textContent = 'Deploying solar arrays, locking sun orientation, and activating telemetry communications.';
      dock.innerHTML = `
        <div style="font-family: var(--font-mono); font-size: 1.1rem; color: #34d399; font-weight: 700;">
          DEPLOYING SUBSYSTEMS... (${Math.round((this.deployTimer / 2.2) * 100)}%)
        </div>
      `;
    }
  }

  updatePhysics(dt) {
    // 0. Update Full Solar System (Planets, Moons, Asteroid Belt)
    if (this.solarSystem) {
      this.solarSystem.update(dt, this.timeWarp);
    }

    // 0b. Update all Launched Fleet spacecraft orbits
    if (this.launchedSatellites && this.launchedSatellites.length > 0) {
      this.launchedSatellites.forEach(sat => sat.update(dt, this.timeWarp));
    }

    // 0c. Ground Launch Pad & Ascent Staging Physics
    if (this.missionPhase !== 'ORBIT') {
      this.updateLaunchAndStaging(dt);
      return;
    }

    // In Solar System mode, camera follows focused planet if selected
    if (this.viewMode === 'SOLAR_SYSTEM') {
      if (this.focusedPlanet) {
        this.camera.lookAt(this.focusedPlanet.group.position);
      }
      return;
    }

    const warpDt = dt * this.timeWarp;

    // Mission Timer
    this.timeRemainingSec -= warpDt;
    if (this.timeRemainingSec <= 0) {
      this.timeRemainingSec = 0;
      this.endMission(this.ship.scienceScore >= 150);
      return;
    }

    // 1. Orbital Motion & Autopilot Steering
    if (this.autopilot.sunLock) {
      const sunDir = this.sunLight.position.clone().normalize();
      this.ship.orientationYaw = Math.atan2(sunDir.x, sunDir.z);
    } else if (this.autopilot.prograde) {
      this.ship.orientationYaw = this.ship.orbitAngle + Math.PI / 2;
    } else {
      if (this.keys.left) this.ship.orientationYaw -= 1.8 * warpDt;
      if (this.keys.right) this.ship.orientationYaw += 1.8 * warpDt;
    }

    // 2. Engine Thrusting & Orbit Raising
    this.ship.thrusting = this.keys.thrust && this.ship.fuelKg > 0;
    if (this.ship.thrusting) {
      this.ship.fuelKg = Math.max(0, this.ship.fuelKg - 2.5 * warpDt);
      // Firing thrusters burns delta-v and expands orbital radius away from nominal trajectory
      this.ship.orbitRadius = Math.min(42.0, this.ship.orbitRadius + 0.8 * warpDt);
      this.updateOrbitTrajectory();

      if (this.thrusterFlame) {
        this.thrusterFlame.children.forEach(c => {
          if (c.material) c.material.opacity = 0.95;
        });
        this.thrusterFlame.scale.set(1, 1, 1 + Math.random() * 0.4);
      }
    } else {
      if (this.thrusterFlame) {
        this.thrusterFlame.children.forEach(c => {
          if (c.material) c.material.opacity = 0;
        });
      }
      // When Orbit Lock autopilot is engaged, gently steer back to nominal orbit radius
      if (this.autopilot.orbitLock) {
        this.ship.orbitRadius = THREE.MathUtils.lerp(this.ship.orbitRadius, 30.0, 0.04);
      }
    }

    // Progress spacecraft along orbital ellipse
    this.ship.orbitAngle += this.ship.orbitSpeed * warpDt * 10;

    // Compute 3D Spacecraft Position along tilted orbit
    const r = this.ship.orbitRadius;
    const theta = this.ship.orbitAngle;
    const inc = this.ship.inclination;
    const posX = r * Math.cos(theta);
    const posY = r * Math.sin(theta) * Math.sin(inc);
    const posZ = r * Math.sin(theta) * Math.cos(inc);

    if (this.spacecraftMesh) {
      this.spacecraftMesh.position.set(posX, posY, posZ);
      this.spacecraftMesh.rotation.y = this.ship.orientationYaw;
      this.spacecraftMesh.rotation.x = this.ship.orientationPitch;
    }

    // 3. Sub-Satellite Ground Track Laser & Nadir Ring
    if (this.nadirLaser && this.nadirRing && this.spacecraftMesh) {
      const surfaceRadius = 18.05;
      const nadirDir = this.spacecraftMesh.position.clone().normalize();
      const groundPos = nadirDir.clone().multiplyScalar(surfaceRadius);

      const tetherPositions = this.nadirLaser.geometry.attributes.position.array;
      tetherPositions[0] = posX;
      tetherPositions[1] = posY;
      tetherPositions[2] = posZ;
      tetherPositions[3] = groundPos.x;
      tetherPositions[4] = groundPos.y;
      tetherPositions[5] = groundPos.z;
      this.nadirLaser.geometry.attributes.position.needsUpdate = true;

      this.nadirRing.position.copy(groundPos);
      this.nadirRing.lookAt(0, 0, 0);
    }

    // 4. Update Directional Motion Pulses on Orbit Line
    if (this.orbitPulses.length > 0) {
      this.orbitPulses.forEach(p => {
        const pulseAngle = (this.ship.orbitAngle + p.offset * Math.PI * 2) % (Math.PI * 2);
        const px = r * Math.cos(pulseAngle);
        const py = r * Math.sin(pulseAngle) * Math.sin(inc);
        const pz = r * Math.sin(pulseAngle) * Math.cos(inc);
        p.mesh.position.set(px, py, pz);
      });
    }

    // 5. Day / Night Solar Eclipse Shadow & Solar Panel Orientation
    const toSun = this.sunLight.position.clone().normalize();
    const shipVec = this.spacecraftMesh ? this.spacecraftMesh.position.clone().normalize() : new THREE.Vector3();
    const alignment = shipVec.dot(toSun);
    this.ship.inEclipse = alignment < -0.32 && this.ship.orbitRadius < 38;

    // Solar Panel Normal Vector in world space:
    const wingNormal = new THREE.Vector3(Math.cos(this.ship.orientationYaw), 0, -Math.sin(this.ship.orientationYaw)).normalize();
    this.sunAspect = this.ship.inEclipse ? 0.0 : Math.max(0.12, Math.abs(wingNormal.dot(toSun)));

    // 6. Power & Battery Management
    const baseDrain = 0.008;
    const shieldDrain = this.ship.shieldActive ? 0.045 : 0;
    const totalDrain = (baseDrain + shieldDrain) * warpDt;

    if (this.ship.inEclipse) {
      this.ship.batterySoC = Math.max(0, this.ship.batterySoC - totalDrain);
    } else {
      const solarGen = 0.038 * Math.max(0.1, alignment) * this.sunAspect * warpDt;
      this.ship.batterySoC = Math.min(1.0, this.ship.batterySoC + solarGen - totalDrain);
    }

    if (this.ship.batterySoC <= 0) {
      this.endMission(false);
      return;
    }

    // 7. Deflector Shield
    this.ship.shieldActive = this.keys.shield && this.ship.batterySoC > 0.05;
    if (this.shieldMesh) {
      this.shieldMesh.material.opacity = this.ship.shieldActive ? 0.8 : 0;
      if (this.ship.shieldActive) {
        this.shieldMesh.rotation.y += 0.05;
      }
    }

    // 8. Ground Station DSN Contact & Downlink
    if (this.groundStation && this.spacecraftMesh) {
      const stationWorldPos = new THREE.Vector3();
      this.groundStation.group.getWorldPosition(stationWorldPos);

      const stationNormal = stationWorldPos.clone().normalize();
      const toShip = this.spacecraftMesh.position.clone().sub(stationWorldPos).normalize();
      const elevation = stationNormal.dot(toShip);

      if (elevation > 0.25) {
        this.ship.inGroundPass = true;

        if (this.ship.storedDataGb > 0) {
          const downAmount = Math.min(this.ship.storedDataGb, 4.0 * warpDt);
          this.ship.storedDataGb -= downAmount;
          this.ship.downlinkedDataGb += downAmount;
          this.ship.scienceScore += Math.round(downAmount * 15);
        }

        if (this.downlinkLine) {
          const positions = this.downlinkLine.geometry.attributes.position.array;
          positions[0] = this.spacecraftMesh.position.x;
          positions[1] = this.spacecraftMesh.position.y;
          positions[2] = this.spacecraftMesh.position.z;
          positions[3] = stationWorldPos.x;
          positions[4] = stationWorldPos.y;
          positions[5] = stationWorldPos.z;
          this.downlinkLine.geometry.attributes.position.needsUpdate = true;
          this.downlinkLine.material.opacity = 0.85;
        }
      } else {
        this.ship.inGroundPass = false;
        if (this.downlinkLine) this.downlinkLine.material.opacity = 0;
      }
    }

    // 9. Auto-Scan Assist
    if (this.autopilot.autoScan && !this.ship.scanning) {
      this.targetBeacons.forEach(beacon => {
        if (!beacon.scanned) {
          const worldPos = new THREE.Vector3();
          beacon.group.getWorldPosition(worldPos);
          if (this.spacecraftMesh.position.distanceTo(worldPos) < 22.0) {
            this.triggerScan();
          }
        }
      });
    }

    // 10. Real 3D Orbital Satellites Motion & Conjunction Collision Checks
    let closestSat = null;
    let minSatDist = 9999;

    this.debrisMeshes.forEach(d => {
      d.angle += d.speed * warpDt * 10;
      const dx = d.orbitR * Math.cos(d.angle);
      const dy = d.orbitR * Math.sin(d.angle) * Math.sin(d.inc);
      const dz = d.orbitR * Math.sin(d.angle) * Math.cos(d.inc);
      d.mesh.position.set(dx, dy, dz);
      d.mesh.rotation.x += 0.015;
      d.mesh.rotation.y += 0.025;

      if (d.beaconLight) {
        d.beaconLight.scale.setScalar(1 + 0.45 * Math.sin(performance.now() * 0.008));
      }

      if (this.spacecraftMesh) {
        const dist = this.spacecraftMesh.position.distanceTo(d.mesh.position);
        if (dist < minSatDist) {
          minSatDist = dist;
          closestSat = d;
        }

        // Direct conjunction collision resolution
        if (dist < 2.2) {
          if (this.ship.shieldActive) {
            sound.playBlip(950, 0.1, 'sawtooth');
            sound.playBlip(1500, 0.12, 'sine');
            this.showFloatingMessage(`🛡️ SATELLITE CONJUNCTION DEFLECTED! [${d.name}] (+100 EVASION XP)`);
            this.ship.scienceScore += 100;
            // Push satellite outward safely
            d.orbitR += 3.5;
            d.speed *= -1;
          } else {
            this.ship.hullHealth = Math.max(0, this.ship.hullHealth - 35);
            sound.playWarningKlaxon();
            this.showFloatingMessage(`💥 CRITICAL COLLISION WITH ${d.name}! HULL COMPROMISED (-35%)`);
            d.orbitR += 4.0;
            if (this.ship.hullHealth <= 0) {
              this.endMission(false);
            }
          }
        }
      }
    });

    // Real-Time Conjunction Alert Banner Update
    const conjBanner = document.getElementById('hud-conjunction-warning');
    const conjTxt = document.getElementById('conj-details-txt');
    if (conjBanner) {
      if (minSatDist < 8.5 && closestSat) {
        conjBanner.classList.remove('hidden');
        if (conjTxt) {
          const meters = Math.round(minSatDist * 55);
          conjTxt.textContent = `SATELLITE [${closestSat.name}] CONJUNCTION! CLOSING IN AT ${meters}m! ACTIVATE SHIELD [Q] OR EVADE!`;
        }
      } else {
        conjBanner.classList.add('hidden');
      }
    }

    // 11. Rotating Planet & Clouds
    if (this.planetMesh) this.planetMesh.rotation.y += 0.001 * warpDt;
    if (this.cloudsMesh) this.cloudsMesh.rotation.y += 0.0016 * warpDt;

    // 12. Camera Update with Dynamic Zoom
    this.updateCamera();

    // 13. Telemetry HUD Update
    this.updateHUD();
  }

  updateCamera() {
    if (!this.spacecraftMesh) return;
    const shipPos = this.spacecraftMesh.position;
    const zf = this.cameraZoomFactor || 1.0;

    if (this.cameraMode === 'chase') {
      const upDir = shipPos.clone().normalize();
      const forwardDir = new THREE.Vector3(
        -Math.sin(this.ship.orbitAngle),
        Math.cos(this.ship.orbitAngle) * Math.sin(this.ship.inclination),
        Math.cos(this.ship.orbitAngle) * Math.cos(this.ship.inclination)
      ).normalize();

      const camOffset = forwardDir.clone().multiplyScalar(-7.5 * zf).add(upDir.clone().multiplyScalar(4.2 * zf));
      const targetCamPos = shipPos.clone().add(camOffset);
      this.camera.position.lerp(targetCamPos, 0.12);
      this.camera.lookAt(shipPos.clone().add(forwardDir.clone().multiplyScalar(2.0 * zf)));

    } else if (this.cameraMode === 'cockpit') {
      this.camera.position.copy(shipPos.clone().add(new THREE.Vector3(0, 0.4 * zf, 0.4 * zf)));
      const forward = new THREE.Vector3(
        Math.sin(this.ship.orientationYaw),
        0,
        Math.cos(this.ship.orientationYaw)
      );
      this.camera.lookAt(shipPos.clone().add(forward.multiplyScalar(20)));

    } else {
      // Orbital wide camera: frames full planet and entire glowing orbit ring
      const upDir = shipPos.clone().normalize();
      const camPos = shipPos.clone().add(upDir.clone().multiplyScalar(16.0 * zf)).add(new THREE.Vector3(12 * zf, 6 * zf, 12 * zf));
      this.camera.position.lerp(camPos, 0.06);
      this.camera.lookAt(shipPos);
    }
  }

  updateHUD() {
    // Battery gauge
    const batEl = document.getElementById('hud-battery-bar');
    if (batEl) {
      batEl.style.width = `${Math.round(this.ship.batterySoC * 100)}%`;
      batEl.style.backgroundColor = this.ship.batterySoC > 0.3 ? '#10b981' : '#ef4444';
    }

    // Fuel gauge
    const fuelEl = document.getElementById('hud-fuel-bar');
    if (fuelEl) fuelEl.style.width = `${Math.round((this.ship.fuelKg / this.ship.maxFuelKg) * 100)}%`;

    // Hull gauge
    const hullEl = document.getElementById('hud-hull-bar');
    if (hullEl) hullEl.style.width = `${this.ship.hullHealth}%`;

    const setTxt = (id, txt) => {
      const el = document.getElementById(id);
      if (el) el.textContent = txt;
    };

    setTxt('hud-timer-val', `${Math.round(this.timeRemainingSec)}s`);
    setTxt('hud-score-val', `${this.ship.scienceScore} PTS`);
    setTxt('hud-buffer-val', `${this.ship.storedDataGb.toFixed(1)} GB`);
    setTxt('hud-downlinked-val', `${this.ship.downlinkedDataGb.toFixed(1)} GB`);
    setTxt('hud-altitude-val', `${this.ship.altitudeKm} KM (Pe: ${this.ship.periapsisKm}km • Ap: ${this.ship.apoapsisKm}km)`);

    const eclipseChip = document.getElementById('hud-chip-eclipse');
    if (eclipseChip) {
      eclipseChip.className = `status-chip ${this.ship.inEclipse ? 'warning active' : ''}`;
      eclipseChip.textContent = this.ship.inEclipse ? '🌑 IN SHADOW (DISCHARGING)' : '☀️ IN SUNLIGHT (CHARGING)';
    }

    const groundChip = document.getElementById('hud-chip-ground');
    if (groundChip) {
      groundChip.className = `status-chip ${this.ship.inGroundPass ? 'active' : ''}`;
      groundChip.textContent = this.ship.inGroundPass ? '📡 DSN DOWNLINK ACTIVE' : '📡 NO GROUND CONTACT';
    }

    // Real-Time Solar Panel Alignment Compass
    const compassEl = document.getElementById('hud-sun-compass');
    const compassTxt = document.getElementById('hud-sun-angle-txt');
    if (compassTxt) {
      if (this.ship.inEclipse) {
        compassTxt.innerHTML = `<span style="color:#ef4444;">🌑 IN ECLIPSE: 0W [BATTERY DISCHARGE]</span>`;
      } else {
        const pct = Math.round(this.sunAspect * 100);
        const watts = Math.round(this.sunAspect * 240);
        const color = pct >= 80 ? '#10b981' : (pct >= 45 ? '#f59e0b' : '#ef4444');
        compassTxt.innerHTML = `SOLAR ALIGNMENT: <span style="color:${color}; font-weight:bold;">${pct}% (+${watts}W)</span> ${pct < 60 ? '— PRESS [S]' : '⚡'}`;
      }
    }

    // Nadir Sensor Target Swath Tracker
    let nearestTarget = null;
    let nearestDist = 9999;
    if (this.targetBeacons && this.spacecraftMesh) {
      const shipPos = this.spacecraftMesh.position;
      this.targetBeacons.forEach(b => {
        if (!b.scanned) {
          const worldPos = new THREE.Vector3();
          b.group.getWorldPosition(worldPos);
          const d = shipPos.distanceTo(worldPos);
          if (d < nearestDist) {
            nearestDist = d;
            nearestTarget = b;
          }
        }
      });
    }

    const swathEl = document.getElementById('hud-swath-tracker');
    const swathTxt = document.getElementById('hud-swath-text');
    if (swathEl && swathTxt) {
      if (nearestTarget) {
        const distKm = Math.round(nearestDist * 45);
        if (nearestDist < 25.0) {
          swathEl.classList.add('in-range');
          swathTxt.innerHTML = `<span style="color:#10b981; font-weight:bold;">🎯 TARGET IN SIGHTS: [${nearestTarget.label}] (${distKm} km) — PRESS [SPACE] TO SCAN!</span>`;
        } else {
          swathEl.classList.remove('in-range');
          const etaSeconds = Math.max(1, Math.round((nearestDist - 25) / 1.6));
          swathTxt.textContent = `🛰️ SENSOR SWATH: Approaching [${nearestTarget.label}] • ${distKm} km (Overflight in ~${etaSeconds}s)`;
        }
      } else {
        swathEl.classList.remove('in-range');
        swathTxt.textContent = '✅ ALL PRIMARY TARGETS SCANNED IN-SITU!';
      }
    }
  }

  endMission(success) {
    this.running = false;
    if (this.animId) cancelAnimationFrame(this.animId);

    const scannedCount = this.targetBeacons.filter(b => b.scanned).length;

    const results = {
      success,
      score: this.ship.scienceScore,
      scannedTargets: scannedCount,
      totalTargets: this.targetBeacons.length,
      hullHealth: this.ship.hullHealth,
      downlinkedDataGb: this.ship.downlinkedDataGb,
      discoveries: this.ship.discoveries || [],
      researchField: this.level?.researchField || 'Space Systems Engineering & Planetary Science',
      researchHypothesis: this.level?.researchHypothesis || 'Mission payload orbital telemetry validated in-situ.'
    };

    if (this.onMissionEnd) {
      this.onMissionEnd(results);
    }
  }

  resize() {
    if (!this.canvas || !this.renderer) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const width = rect.width || 800;
    const height = rect.height || 600;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  animate() {
    if (!this.running) return;

    this.animId = requestAnimationFrame(() => this.animate());

    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    this.updatePhysics(dt);

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}
