/**
 * ASTROFORGE: 3D Real-Life Rocket & Spacecraft Engineering Visualizer
 * Powered by Three.js
 * Builds real-life multi-stage launch vehicles (SLS, Falcon 9, Vulcan, Electron)
 * with fairing cutaway integration, as well as high-fidelity spacecraft subsystems
 * (Kapton MLI foil, star trackers, 4-corner RCS quads, Cassegrain dishes, GaAs solar wings).
 */

import * as THREE from '../../libs/three.module.js';
import { TextureGenerator } from './textures3D.js';

export class Spacecraft3DBuilder {
  constructor() {
    this.goldTexture = TextureGenerator.createGoldFoilTexture(512);

    // Procedural PBR Silicon Wafer Solar Cells Texture (inspired by Astra Nexus & NASA spacecraft)
    if (typeof document !== 'undefined') {
      const solarCanvas = document.createElement('canvas');
      solarCanvas.width = solarCanvas.height = 512;
      const sg = solarCanvas.getContext('2d');
      sg.fillStyle = '#0b1a52';
      sg.fillRect(0, 0, 512, 512);
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const grd = sg.createLinearGradient(x * 64, y * 64, x * 64 + 64, y * 64 + 64);
          grd.addColorStop(0, '#2a4fb8');
          grd.addColorStop(0.5, '#1e3a8a');
          grd.addColorStop(1, '#14307e');
          sg.fillStyle = grd;
          sg.fillRect(x * 64 + 3, y * 64 + 3, 58, 58);
          // Solar cell anti-reflective border
          sg.strokeStyle = '#38bdf8';
          sg.lineWidth = 1;
          sg.strokeRect(x * 64 + 3, y * 64 + 3, 58, 58);
        }
      }
      // Silver grid busbars
      sg.strokeStyle = 'rgba(215, 230, 255, 0.7)';
      sg.lineWidth = 2;
      for (let i = 0; i <= 512; i += 64) {
        sg.beginPath(); sg.moveTo(i, 0); sg.lineTo(i, 512); sg.stroke();
        sg.beginPath(); sg.moveTo(0, i); sg.lineTo(512, i); sg.stroke();
      }
      this.solarTexture = new THREE.CanvasTexture(solarCanvas);
      this.solarTexture.colorSpace = THREE.SRGBColorSpace;
      this.solarTexture.wrapS = this.solarTexture.wrapT = THREE.RepeatWrapping;
      this.solarTexture.repeat.set(2, 1);
      this.solarTexture.anisotropy = 8;
    } else {
      this.solarTexture = TextureGenerator.createSolarCellTexture(512);
    }

    // Realistic PBR Spacecraft Materials
    this.goldMLIMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4a94e,
      map: this.goldTexture,
      roughness: 0.32,
      metalness: 0.88
    });

    this.silverMLIMaterial = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.25,
      metalness: 0.95
    });

    this.rocketWhiteMaterial = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.35,
      metalness: 0.15
    });

    this.rocketBlackMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.6,
      metalness: 0.4
    });

    this.rocketOrangeFoamMaterial = new THREE.MeshStandardMaterial({
      color: 0xd97706, // NASA SLS spray-on foam insulation
      roughness: 0.85,
      metalness: 0.05
    });

    this.carbonFiberMaterial = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.5,
      metalness: 0.6
    });

    this.titaniumMaterial = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.3,
      metalness: 0.85
    });

    this.solarMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: this.solarTexture,
      roughness: 0.35,
      metalness: 0.3
    });

    this.fairingGlassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.28,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.7,
      ior: 1.4,
      wireframe: false
    });

    // Authentic ISRO Livery Materials (Saffron, Indian Green, and Metallic Rings)
    this.isroSaffronMaterial = new THREE.MeshStandardMaterial({
      color: 0xea580c,
      roughness: 0.4,
      metalness: 0.1
    });

    this.isroGreenMaterial = new THREE.MeshStandardMaterial({
      color: 0x16a34a,
      roughness: 0.4,
      metalness: 0.1
    });
  }

  /**
   * Build complete spacecraft assembly with authentic real-life subsystems
   */
  buildSpacecraft(config = {}) {
    const root = new THREE.Group();
    root.name = 'SpacecraftRoot';

    const busType = config.bus?.id || 'smallsat_octagonal';
    const busMesh = this.createBusMesh(busType);
    root.add(busMesh);

    // 4-Corner RCS Attitude Control Thruster Quads
    const rcsAssembly = this.createRCSQuads();
    root.add(rcsAssembly);

    // Solar Array Wings
    const powerType = config.power?.id || 'deployable_panels';
    const solarAssembly = this.createSolarWings(powerType);
    root.add(solarAssembly);

    // Propulsion Engine Bell & Nozzle
    const engineType = config.propulsion?.id || 'hall_effect_ion';
    const engineAssembly = this.createEngineMesh(engineType);
    engineAssembly.position.set(0, 0, -1.25);
    root.add(engineAssembly);

    // Science Payload Instrument
    const instrumentType = config.instrument?.id || 'multispectral_imager';
    const instrumentMesh = this.createInstrumentMesh(instrumentType);
    instrumentMesh.position.set(0, 0.75, 0.45);
    root.add(instrumentMesh);

    // High Gain Antenna Dish
    const commType = config.comm?.id || 'steerable_hga';
    const antennaMesh = this.createAntennaMesh(commType);
    antennaMesh.position.set(0.75, 0.55, -0.4);
    root.add(antennaMesh);

    // Forcefield Shield Bubble (toggled during flight)
    const shieldGeometry = new THREE.IcosahedronGeometry(2.5, 2);
    const shieldMaterial = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0,
      emissive: 0x0284c7,
      emissiveIntensity: 0.6
    });
    const shieldMesh = new THREE.Mesh(shieldGeometry, shieldMaterial);
    shieldMesh.name = 'ShieldMesh';
    root.add(shieldMesh);

    // Thruster Flame Plume (animated on thrust)
    const flameGroup = new THREE.Group();
    flameGroup.name = 'ThrusterFlame';

    const isIon = engineType.includes('ion');
    const flameGeo = new THREE.ConeGeometry(isIon ? 0.22 : 0.45, isIon ? 1.4 : 2.2, 16);
    flameGeo.rotateX(-Math.PI / 2);
    flameGeo.translate(0, 0, isIon ? -0.7 : -1.1);
    const flameMat = new THREE.MeshBasicMaterial({
      color: isIon ? 0x38bdf8 : 0xf97316,
      transparent: true,
      opacity: 0
    });
    const flameCore = new THREE.Mesh(flameGeo, flameMat);
    flameGroup.add(flameCore);

    // Inner bright core
    const coreGeo = new THREE.ConeGeometry(isIon ? 0.1 : 0.2, isIon ? 0.9 : 1.4, 12);
    coreGeo.rotateX(-Math.PI / 2);
    coreGeo.translate(0, 0, isIon ? -0.45 : -0.7);
    const coreMat = new THREE.MeshBasicMaterial({
      color: isIon ? 0xe0f2fe : 0xfef08a,
      transparent: true,
      opacity: 0
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.name = 'FlameCore';
    flameGroup.add(coreMesh);

    flameGroup.position.set(0, 0, -1.25);
    root.add(flameGroup);

    // Volumetric Sensor Scan Cone
    const scanConeGeo = new THREE.ConeGeometry(2.2, 5.0, 24, 1, true);
    scanConeGeo.rotateX(Math.PI / 2);
    scanConeGeo.translate(0, 0, 2.5);
    const scanConeMat = new THREE.MeshBasicMaterial({
      color: 0xec4899,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide
    });
    const scanCone = new THREE.Mesh(scanConeGeo, scanConeMat);
    scanCone.name = 'ScanCone';
    root.add(scanCone);

    return root;
  }

  /**
   * Real-Life Multi-Stage Rocket Builder (Falcon 9, SLS, Vulcan, Electron)
   * Displays full launch vehicle stack with payload fairing cutaway revealing spacecraft inside
   */
  buildRocketStack(rocketId = 'lv_falcon9', spacecraftConfig = {}, fairingCutaway = true) {
    const root = new THREE.Group();
    root.name = `RocketStack_${rocketId}`;

    if (rocketId === 'lv_sls') {
      // ==================== NASA SPACE LAUNCH SYSTEM (SLS) BLOCK 1 ====================
      // 1. Giant Core Stage (Orange foam insulation)
      const coreRadius = 1.1;
      const coreHeight = 8.5;
      const coreGeo = new THREE.CylinderGeometry(coreRadius, coreRadius, coreHeight, 32);
      const coreMesh = new THREE.Mesh(coreGeo, this.rocketOrangeFoamMaterial);
      coreMesh.position.y = 0;
      root.add(coreMesh);

      // Core Stage LOX / LH2 Feedlines & System Tunnels
      const tunnelGeo = new THREE.BoxGeometry(0.12, coreHeight * 0.95, 0.18);
      const tunnel1 = new THREE.Mesh(tunnelGeo, this.rocketWhiteMaterial);
      tunnel1.position.set(coreRadius, 0, 0);
      root.add(tunnel1);

      // 4 RS-25 Main Engine Cluster at base
      const enginePositions = [
        [-0.45, -0.45], [0.45, -0.45],
        [-0.45, 0.45], [0.45, 0.45]
      ];
      enginePositions.forEach(([ex, ez]) => {
        const bellGeo = new THREE.ConeGeometry(0.24, 0.7, 16, 1, true);
        bellGeo.rotateX(Math.PI);
        const bell = new THREE.Mesh(bellGeo, this.titaniumMaterial);
        bell.position.set(ex, -coreHeight / 2 - 0.35, ez);
        root.add(bell);
      });

      // Twin Solid Rocket Boosters (SRBs) on flanks
      const srbRadius = 0.55;
      const srbHeight = 9.2;
      [-coreRadius - srbRadius - 0.15, coreRadius + srbRadius + 0.15].forEach(srbX => {
        const srbGroup = new THREE.Group();
        const srbGeo = new THREE.CylinderGeometry(srbRadius, srbRadius, srbHeight, 24);
        const srbMesh = new THREE.Mesh(srbGeo, this.rocketWhiteMaterial);
        srbGroup.add(srbMesh);

        // SRB Aerodynamic Nosecone
        const coneGeo = new THREE.ConeGeometry(srbRadius, 1.2, 24);
        const coneMesh = new THREE.Mesh(coneGeo, this.rocketBlackMaterial);
        coneMesh.position.y = srbHeight / 2 + 0.6;
        srbGroup.add(coneMesh);

        // SRB Gimbaled Exhaust Nozzle
        const nozzleGeo = new THREE.ConeGeometry(0.42, 0.8, 16, 1, true);
        nozzleGeo.rotateX(Math.PI);
        const nozzle = new THREE.Mesh(nozzleGeo, this.titaniumMaterial);
        nozzle.position.y = -srbHeight / 2 - 0.4;
        srbGroup.add(nozzle);

        srbGroup.position.set(srbX, -0.3, 0);
        root.add(srbGroup);
      });

      // Upper Stage: Interim Cryogenic Propulsion Stage (ICPS / RL10)
      const icpsGeo = new THREE.CylinderGeometry(0.9, 1.1, 2.0, 32);
      const icpsMesh = new THREE.Mesh(icpsGeo, this.rocketWhiteMaterial);
      icpsMesh.position.y = coreHeight / 2 + 1.0;
      root.add(icpsMesh);

      // Payload Fairing (8.4m) with cutaway mode
      const fairingRadius = 1.15;
      const fairingHeight = 4.2;
      this.addPayloadFairing(root, fairingRadius, fairingHeight, coreHeight / 2 + 2.0, fairingCutaway, spacecraftConfig);

    } else if (rocketId === 'lv_lvm3') {
      // ==================== ISRO LVM3 / GSLV MK III ("FAT BOY") ====================
      // 1. Core Stage L110 (Liquid Core with twin Vikas engines)
      const coreRadius = 0.9;
      const coreHeight = 8.0;
      const coreGeo = new THREE.CylinderGeometry(coreRadius, coreRadius, coreHeight, 32);
      const coreMesh = new THREE.Mesh(coreGeo, this.rocketWhiteMaterial);
      coreMesh.position.y = 0;
      root.add(coreMesh);

      // ISRO Green Accent Band & Logo marking
      const greenBandGeo = new THREE.CylinderGeometry(coreRadius + 0.01, coreRadius + 0.01, 0.4, 32);
      const greenBand = new THREE.Mesh(greenBandGeo, this.isroGreenMaterial);
      greenBand.position.y = coreHeight * 0.25;
      root.add(greenBand);

      // Twin Vikas Engines at Core base
      [-0.35, 0.35].forEach(vx => {
        const vBellGeo = new THREE.ConeGeometry(0.28, 0.65, 16, 1, true);
        vBellGeo.rotateX(Math.PI);
        const vBell = new THREE.Mesh(vBellGeo, this.titaniumMaterial);
        vBell.position.set(vx, -coreHeight / 2 - 0.32, 0);
        root.add(vBell);
      });

      // 2. Twin Massive S200 Solid Rocket Boosters on flanks
      const srbRadius = 0.65;
      const srbHeight = 8.6;
      [-coreRadius - srbRadius - 0.12, coreRadius + srbRadius + 0.12].forEach(srbX => {
        const srbGroup = new THREE.Group();
        const srbGeo = new THREE.CylinderGeometry(srbRadius, srbRadius, srbHeight, 24);
        const srbMesh = new THREE.Mesh(srbGeo, this.rocketWhiteMaterial);
        srbGroup.add(srbMesh);

        // Conical Aerodynamic Nosecone
        const coneGeo = new THREE.ConeGeometry(srbRadius, 1.4, 24);
        const coneMesh = new THREE.Mesh(coneGeo, this.rocketBlackMaterial);
        coneMesh.position.y = srbHeight / 2 + 0.7;
        srbGroup.add(coneMesh);

        // S200 Gimbaled High-Expansion Nozzle
        const nozGeo = new THREE.ConeGeometry(0.50, 0.9, 16, 1, true);
        nozGeo.rotateX(Math.PI);
        const noz = new THREE.Mesh(nozGeo, this.titaniumMaterial);
        noz.position.y = -srbHeight / 2 - 0.45;
        srbGroup.add(noz);

        srbGroup.position.set(srbX, -0.2, 0);
        root.add(srbGroup);
      });

      // 3. Cryogenic Upper Stage C25 (CE-20 Engine)
      const c25Height = 2.2;
      const c25Geo = new THREE.CylinderGeometry(coreRadius, coreRadius, c25Height, 32);
      const c25Mesh = new THREE.Mesh(c25Geo, this.rocketWhiteMaterial);
      c25Mesh.position.y = coreHeight / 2 + c25Height / 2;
      root.add(c25Mesh);

      // Saffron ring on Upper Stage
      const saffRingGeo = new THREE.CylinderGeometry(coreRadius + 0.01, coreRadius + 0.01, 0.3, 32);
      const saffRing = new THREE.Mesh(saffRingGeo, this.isroSaffronMaterial);
      saffRing.position.y = coreHeight / 2 + c25Height * 0.75;
      root.add(saffRing);

      // 4. Bulbous 5m Ogive Payload Fairing (Chandrayaan-3 profile)
      const fairingRadius = 1.15;
      const fairingHeight = 4.2;
      this.addPayloadFairing(root, fairingRadius, fairingHeight, coreHeight / 2 + c25Height, fairingCutaway, spacecraftConfig);

    } else if (rocketId === 'lv_pslv') {
      // ==================== ISRO PSLV-XL 4-STAGE WORKHORSE ====================
      // 1. Core Stage 1 PS1 (Solid)
      const ps1Radius = 0.60;
      const ps1Height = 8.8;
      const ps1Geo = new THREE.CylinderGeometry(ps1Radius, ps1Radius, ps1Height, 32);
      const ps1Mesh = new THREE.Mesh(ps1Geo, this.rocketWhiteMaterial);
      ps1Mesh.position.y = 0;
      root.add(ps1Mesh);

      // ISRO Saffron and Maroon bands
      const saffBandGeo = new THREE.CylinderGeometry(ps1Radius + 0.01, ps1Radius + 0.01, 0.35, 32);
      const saffBand = new THREE.Mesh(saffBandGeo, this.isroSaffronMaterial);
      saffBand.position.y = ps1Height * 0.3;
      root.add(saffBand);

      // Main PS1 engine nozzle
      const ps1NozGeo = new THREE.ConeGeometry(0.38, 0.7, 16, 1, true);
      ps1NozGeo.rotateX(Math.PI);
      const ps1Noz = new THREE.Mesh(ps1NozGeo, this.titaniumMaterial);
      ps1Noz.position.y = -ps1Height / 2 - 0.35;
      root.add(ps1Noz);

      // 6 PSOM-XL Strap-On Solid Boosters arranged in radial cluster
      const strapRadius = 0.20;
      const strapHeight = 4.8;
      for (let i = 0; i < 6; i++) {
        const theta = (i * Math.PI) / 3;
        const dist = ps1Radius + strapRadius + 0.05;
        const sx = Math.cos(theta) * dist;
        const sz = Math.sin(theta) * dist;

        const sGrp = new THREE.Group();
        const sMesh = new THREE.Mesh(new THREE.CylinderGeometry(strapRadius, strapRadius, strapHeight, 16), this.rocketWhiteMaterial);
        sGrp.add(sMesh);

        // Aerodynamic Saffron Nosecone
        const sCone = new THREE.Mesh(new THREE.ConeGeometry(strapRadius, 0.65, 16), this.isroSaffronMaterial);
        sCone.position.y = strapHeight / 2 + 0.32;
        sGrp.add(sCone);

        // Small canted exhaust nozzle
        const sNoz = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.35, 12, 1, true), this.titaniumMaterial);
        sNoz.rotateX(Math.PI);
        sNoz.position.y = -strapHeight / 2 - 0.17;
        sGrp.add(sNoz);

        sGrp.position.set(sx, -ps1Height / 2 + strapHeight / 2 + 0.2, sz);
        root.add(sGrp);
      }

      // Open Lattice Truss Interstage between PS1 and PS2
      const trussGeo = new THREE.CylinderGeometry(ps1Radius, ps1Radius, 0.8, 16, 1, true);
      const trussMesh = new THREE.Mesh(trussGeo, this.carbonFiberMaterial);
      trussMesh.position.y = ps1Height / 2 + 0.4;
      root.add(trussMesh);

      // Stage 2 PS2 (Vikas Liquid) + Stage 3 PS3 + Stage 4 PS4
      const upperHeight = 2.4;
      const upperGeo = new THREE.CylinderGeometry(ps1Radius, ps1Radius, upperHeight, 32);
      const upperMesh = new THREE.Mesh(upperGeo, this.rocketWhiteMaterial);
      upperMesh.position.y = ps1Height / 2 + 0.8 + upperHeight / 2;
      root.add(upperMesh);

      // PSLV 3.2m Payload Fairing
      const fairingRadius = 0.75;
      const fairingHeight = 3.4;
      this.addPayloadFairing(root, fairingRadius, fairingHeight, ps1Height / 2 + 0.8 + upperHeight, fairingCutaway, spacecraftConfig);

    } else {
      // ==================== FALCON 9 / WORKHORSE REUSABLE LAUNCHER ====================
      const bRadius = 0.75;
      const bHeight = 9.5;

      // Stage 1 Booster Core (White composite with LOX/RP-1 markings)
      const bGeo = new THREE.CylinderGeometry(bRadius, bRadius, bHeight, 32);
      const bMesh = new THREE.Mesh(bGeo, this.rocketWhiteMaterial);
      bMesh.position.y = 0;
      root.add(bMesh);

      // 4 Titanium Grid Fins at top of Stage 1
      const finGeo = new THREE.BoxGeometry(0.04, 0.35, 0.35);
      [0, Math.PI / 2, Math.PI, Math.PI * 1.5].forEach(angle => {
        const fin = new THREE.Mesh(finGeo, this.carbonFiberMaterial);
        fin.position.set(Math.cos(angle) * (bRadius + 0.18), bHeight / 2 - 0.4, Math.sin(angle) * (bRadius + 0.18));
        fin.rotation.y = angle;
        root.add(fin);
      });

      // 9 Merlin 1D Octaweb Engine Bell Cluster
      const octaAngles = [
        [0, 0], // Center
        [0.42, 0], [-0.42, 0], [0, 0.42], [0, -0.42],
        [0.30, 0.30], [-0.30, 0.30], [0.30, -0.30], [-0.30, -0.30]
      ];
      octaAngles.forEach(([ox, oz]) => {
        const mBellGeo = new THREE.ConeGeometry(0.15, 0.5, 12, 1, true);
        mBellGeo.rotateX(Math.PI);
        const mBell = new THREE.Mesh(mBellGeo, this.titaniumMaterial);
        mBell.position.set(ox, -bHeight / 2 - 0.25, oz);
        root.add(mBell);
      });

      // Interstage (Carbon Composite Black Ring)
      const interstageGeo = new THREE.CylinderGeometry(bRadius, bRadius, 1.2, 32);
      const interstageMesh = new THREE.Mesh(interstageGeo, this.rocketBlackMaterial);
      interstageMesh.position.y = bHeight / 2 + 0.6;
      root.add(interstageMesh);

      // Stage 2 Booster
      const s2Height = 2.4;
      const s2Geo = new THREE.CylinderGeometry(bRadius, bRadius, s2Height, 32);
      const s2Mesh = new THREE.Mesh(s2Geo, this.rocketWhiteMaterial);
      s2Mesh.position.y = bHeight / 2 + 1.2 + s2Height / 2;
      root.add(s2Mesh);

      // 5.2m Payload Fairing with Cutaway Mode
      const fairingRadius = 0.95;
      const fairingHeight = 3.8;
      this.addPayloadFairing(root, fairingRadius, fairingHeight, bHeight / 2 + 1.2 + s2Height, fairingCutaway, spacecraftConfig);
    }

    return root;
  }

  /**
   * Renders the Aerodynamic Payload Fairing with a transparent cutaway view
   * showing the encapsulated spacecraft mounted on the Payload Adapter Fitting (PAF)!
   */
  addPayloadFairing(parentGroup, radius, height, baseY, cutaway, spacecraftConfig) {
    const fairingGroup = new THREE.Group();
    fairingGroup.position.y = baseY;

    // Payload Adapter Fitting (PAF) / Dispenser Cone
    const pafGeo = new THREE.CylinderGeometry(0.45, radius * 0.85, 0.6, 24);
    const pafMesh = new THREE.Mesh(pafGeo, this.titaniumMaterial);
    pafMesh.position.y = 0.3;
    fairingGroup.add(pafMesh);

    // Mount the Spacecraft inside the fairing
    const payload = this.buildSpacecraft(spacecraftConfig);
    payload.scale.set(0.42, 0.42, 0.42);
    payload.position.set(0, 1.4, 0);
    fairingGroup.add(payload);

    // Fairing Clamshell Half 1 (Opaque White)
    const shell1Geo = new THREE.CylinderGeometry(radius, radius, height * 0.6, 24, 1, false, 0, Math.PI);
    const shell1 = new THREE.Mesh(shell1Geo, this.rocketWhiteMaterial);
    shell1.position.y = height * 0.3;
    fairingGroup.add(shell1);

    // Fairing Nosecone Half 1
    const nose1Geo = new THREE.ConeGeometry(radius, height * 0.4, 24, 1, false, 0, Math.PI);
    const nose1 = new THREE.Mesh(nose1Geo, this.rocketWhiteMaterial);
    nose1.position.y = height * 0.6 + (height * 0.4) / 2;
    fairingGroup.add(nose1);

    // Fairing Clamshell Half 2 (Transparent Cutaway glass / inspection shell)
    const shell2Geo = new THREE.CylinderGeometry(radius, radius, height * 0.6, 24, 1, false, Math.PI, Math.PI);
    const shell2Mat = cutaway ? this.fairingGlassMaterial : this.rocketWhiteMaterial;
    const shell2 = new THREE.Mesh(shell2Geo, shell2Mat);
    shell2.position.y = height * 0.3;
    fairingGroup.add(shell2);

    const nose2Geo = new THREE.ConeGeometry(radius, height * 0.4, 24, 1, false, Math.PI, Math.PI);
    const nose2Mat = cutaway ? this.fairingGlassMaterial : this.rocketWhiteMaterial;
    const nose2 = new THREE.Mesh(nose2Geo, nose2Mat);
    nose2.position.y = height * 0.6 + (height * 0.4) / 2;
    fairingGroup.add(nose2);

    parentGroup.add(fairingGroup);
  }

  /**
   * Real-Life Separable Rocket Stack for Ground Launch & Multi-Stage Jettison Simulation
   * Physically separates: Stage 1 / SRBs -> Fairing Halves -> Stage 2 -> Spacecraft Payload
   */
  buildSeparableRocketStack(rocketId = 'lv_falcon9', spacecraftConfig = {}) {
    const root = new THREE.Group();
    root.name = 'SeparableRocketRoot';

    const isSLS = rocketId === 'lv_sls';
    const isLVM3 = rocketId === 'lv_lvm3';
    const isPSLV = rocketId === 'lv_pslv';
    const isElectron = rocketId === 'lv_electron';
    const isVulcan = rocketId === 'lv_vulcan';

    // Dimensions based on rocket class
    const s1Radius = isSLS ? 1.1 : isLVM3 ? 0.9 : isVulcan ? 0.9 : isPSLV ? 0.60 : isElectron ? 0.45 : 0.75;
    const s1Height = isSLS ? 8.5 : isLVM3 ? 8.0 : isVulcan ? 9.0 : isPSLV ? 8.8 : isElectron ? 5.5 : 9.5;
    const s2Height = isSLS ? 2.2 : isLVM3 ? 2.2 : isVulcan ? 2.5 : isPSLV ? 2.0 : isElectron ? 1.4 : 2.4;
    const fairingRadius = (isSLS || isLVM3) ? 1.15 : isPSLV ? 0.75 : s1Radius * 1.25;
    const fairingHeight = (isSLS || isLVM3) ? 4.2 : isPSLV ? 3.4 : isElectron ? 2.0 : 3.8;

    // 1. Stage 1 Booster Group
    const stage1Group = new THREE.Group();
    stage1Group.name = 'Stage1_Booster';

    const s1Mat = isSLS ? this.rocketOrangeFoamMaterial : this.rocketWhiteMaterial;
    const s1Geo = new THREE.CylinderGeometry(s1Radius, s1Radius, s1Height, 32);
    const s1Mesh = new THREE.Mesh(s1Geo, s1Mat);
    stage1Group.add(s1Mesh);

    // Decorative ISRO Bands for LVM3 & PSLV
    if (isLVM3) {
      const greenBandGeo = new THREE.CylinderGeometry(s1Radius + 0.01, s1Radius + 0.01, 0.4, 32);
      const greenBand = new THREE.Mesh(greenBandGeo, this.isroGreenMaterial);
      greenBand.position.y = s1Height * 0.25;
      stage1Group.add(greenBand);
    } else if (isPSLV) {
      const saffBandGeo = new THREE.CylinderGeometry(s1Radius + 0.01, s1Radius + 0.01, 0.35, 32);
      const saffBand = new THREE.Mesh(saffBandGeo, this.isroSaffronMaterial);
      saffBand.position.y = s1Height * 0.3;
      stage1Group.add(saffBand);
    }

    // Grid Fins (Falcon 9 only)
    if (!isSLS && !isLVM3 && !isPSLV && !isVulcan) {
      const finGeo = new THREE.BoxGeometry(0.04, 0.35, 0.35);
      [0, Math.PI / 2, Math.PI, Math.PI * 1.5].forEach(angle => {
        const fin = new THREE.Mesh(finGeo, this.carbonFiberMaterial);
        fin.position.set(Math.cos(angle) * (s1Radius + 0.18), s1Height / 2 - 0.4, Math.sin(angle) * (s1Radius + 0.18));
        fin.rotation.y = angle;
        stage1Group.add(fin);
      });
    }

    // Engine Bells
    const bellPositions = isSLS
      ? [[-0.45, -0.45], [0.45, -0.45], [-0.45, 0.45], [0.45, 0.45]]
      : isLVM3
      ? [[-0.35, 0], [0.35, 0]]
      : isPSLV
      ? [[0, 0]]
      : isVulcan
      ? [[-0.4, 0], [0.4, 0]]
      : [
          [0, 0], [0.42, 0], [-0.42, 0], [0, 0.42], [0, -0.42],
          [0.3, 0.3], [-0.3, 0.3], [0.3, -0.3], [-0.3, -0.3]
        ];
    const bellRadius = isSLS ? 0.24 : isLVM3 ? 0.28 : isPSLV ? 0.38 : isElectron ? 0.08 : isVulcan ? 0.35 : 0.15;
    const bellHeight = isSLS ? 0.7 : isLVM3 ? 0.65 : isPSLV ? 0.7 : isElectron ? 0.3 : isVulcan ? 0.8 : 0.5;

    bellPositions.forEach(([bx, bz]) => {
      const bGeo = new THREE.ConeGeometry(bellRadius, bellHeight, 16, 1, true);
      bGeo.rotateX(Math.PI);
      const bMesh = new THREE.Mesh(bGeo, this.titaniumMaterial);
      bMesh.position.set(bx, -s1Height / 2 - bellHeight / 2, bz);
      stage1Group.add(bMesh);
    });

    // Solid Rocket Boosters (SRBs / Strap-ons)
    const srbs = [];
    if (isSLS) {
      const srbR = 0.55;
      const srbH = 9.2;
      [-s1Radius - srbR - 0.15, s1Radius + srbR + 0.15].forEach((srbX, idx) => {
        const srbGrp = new THREE.Group();
        srbGrp.name = `SRB_${idx === 0 ? 'Left' : 'Right'}`;
        const srbMesh = new THREE.Mesh(new THREE.CylinderGeometry(srbR, srbR, srbH, 24), this.rocketWhiteMaterial);
        srbGrp.add(srbMesh);
        const coneMesh = new THREE.Mesh(new THREE.ConeGeometry(srbR, 1.2, 24), this.rocketBlackMaterial);
        coneMesh.position.y = srbH / 2 + 0.6;
        srbGrp.add(coneMesh);
        const nozMesh = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.8, 16, 1, true), this.titaniumMaterial);
        nozMesh.rotateX(Math.PI);
        nozMesh.position.y = -srbH / 2 - 0.4;
        srbGrp.add(nozMesh);
        srbGrp.position.set(srbX, -0.3, 0);
        stage1Group.add(srbGrp);
        srbs.push(srbGrp);
      });
    } else if (isLVM3) {
      // Twin S200 Boosters
      const srbR = 0.65;
      const srbH = 8.6;
      [-s1Radius - srbR - 0.12, s1Radius + srbR + 0.12].forEach((srbX, idx) => {
        const srbGrp = new THREE.Group();
        srbGrp.name = `S200_${idx === 0 ? 'Left' : 'Right'}`;
        const srbMesh = new THREE.Mesh(new THREE.CylinderGeometry(srbR, srbR, srbH, 24), this.rocketWhiteMaterial);
        srbGrp.add(srbMesh);
        const coneMesh = new THREE.Mesh(new THREE.ConeGeometry(srbR, 1.4, 24), this.rocketBlackMaterial);
        coneMesh.position.y = srbH / 2 + 0.7;
        srbGrp.add(coneMesh);
        const nozMesh = new THREE.Mesh(new THREE.ConeGeometry(0.50, 0.9, 16, 1, true), this.titaniumMaterial);
        nozMesh.rotateX(Math.PI);
        nozMesh.position.y = -srbH / 2 - 0.45;
        srbGrp.add(nozMesh);
        srbGrp.position.set(srbX, -0.2, 0);
        stage1Group.add(srbGrp);
        srbs.push(srbGrp);
      });
    } else if (isPSLV) {
      // 6 PSOM-XL Strap-On Solid Motors
      const strapR = 0.20;
      const strapH = 4.8;
      for (let i = 0; i < 6; i++) {
        const theta = (i * Math.PI) / 3;
        const dist = s1Radius + strapR + 0.05;
        const sx = Math.cos(theta) * dist;
        const sz = Math.sin(theta) * dist;

        const sGrp = new THREE.Group();
        sGrp.name = `PSOM_${i + 1}`;
        const sMesh = new THREE.Mesh(new THREE.CylinderGeometry(strapR, strapR, strapH, 16), this.rocketWhiteMaterial);
        sGrp.add(sMesh);
        const sCone = new THREE.Mesh(new THREE.ConeGeometry(strapR, 0.65, 16), this.isroSaffronMaterial);
        sCone.position.y = strapH / 2 + 0.32;
        sGrp.add(sCone);
        const sNoz = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.35, 12, 1, true), this.titaniumMaterial);
        sNoz.rotateX(Math.PI);
        sNoz.position.y = -strapH / 2 - 0.17;
        sGrp.add(sNoz);

        sGrp.position.set(sx, -s1Height / 2 + strapH / 2 + 0.2, sz);
        stage1Group.add(sGrp);
        srbs.push(sGrp);
      }
    }

    // Stage 1 Fiery Exhaust Plume Group
    const plumeStage1 = new THREE.Group();
    plumeStage1.name = 'PlumeStage1';
    const flameGeo = new THREE.ConeGeometry(s1Radius * 1.1, 4.5, 16, 1, true);
    flameGeo.rotateX(Math.PI);
    const flameMat = new THREE.MeshBasicMaterial({
      color: 0xff8811,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide
    });
    const flameCore = new THREE.Mesh(flameGeo, flameMat);
    flameCore.position.y = -s1Height / 2 - 2.5;
    plumeStage1.add(flameCore);

    const innerCoreGeo = new THREE.ConeGeometry(s1Radius * 0.55, 3.2, 16, 1, true);
    innerCoreGeo.rotateX(Math.PI);
    const innerCoreMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide
    });
    const innerFlame = new THREE.Mesh(innerCoreGeo, innerCoreMat);
    innerFlame.position.y = -s1Height / 2 - 1.8;
    plumeStage1.add(innerFlame);
    plumeStage1.visible = false;
    stage1Group.add(plumeStage1);

    root.add(stage1Group);

    // 2. Interstage Adapter (Carbon composite ring)
    const interstageHeight = 1.2;
    const interstageGeo = new THREE.CylinderGeometry(s1Radius, s1Radius, interstageHeight, 32);
    const interstageMesh = new THREE.Mesh(interstageGeo, this.rocketBlackMaterial);
    interstageMesh.position.y = s1Height / 2 + interstageHeight / 2;
    root.add(interstageMesh);

    // 3. Stage 2 Upper Stage Group
    const stage2Group = new THREE.Group();
    stage2Group.name = 'Stage2_UpperStage';
    stage2Group.position.y = s1Height / 2 + interstageHeight;

    const s2Geo = new THREE.CylinderGeometry(s1Radius, s1Radius, s2Height, 32);
    const s2Mesh = new THREE.Mesh(s2Geo, this.rocketWhiteMaterial);
    s2Mesh.position.y = s2Height / 2;
    stage2Group.add(s2Mesh);

    // Stage 2 Vacuum Engine Bell (Large expansion nozzle)
    const vacNozzleGeo = new THREE.ConeGeometry(s1Radius * 0.55, 0.9, 20, 1, true);
    vacNozzleGeo.rotateX(Math.PI);
    const vacNozzle = new THREE.Mesh(vacNozzleGeo, this.titaniumMaterial);
    vacNozzle.position.y = -0.3;
    stage2Group.add(vacNozzle);

    // Stage 2 Vacuum Expansion Plume (Glowing violet / blue)
    const plumeStage2 = new THREE.Group();
    plumeStage2.name = 'PlumeStage2';
    const vacPlumeGeo = new THREE.ConeGeometry(s1Radius * 1.5, 3.8, 16, 1, true);
    vacPlumeGeo.rotateX(Math.PI);
    const vacPlumeMat = new THREE.MeshBasicMaterial({
      color: 0x818cf8,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });
    const vacPlume = new THREE.Mesh(vacPlumeGeo, vacPlumeMat);
    vacPlume.position.y = -2.2;
    plumeStage2.add(vacPlume);
    plumeStage2.visible = false;
    stage2Group.add(plumeStage2);

    // Payload Adapter Fitting (PAF) / Dispenser Cone
    const pafHeight = 0.6;
    const pafGeo = new THREE.CylinderGeometry(0.5, s1Radius * 0.85, pafHeight, 24);
    const pafMesh = new THREE.Mesh(pafGeo, this.titaniumMaterial);
    pafMesh.position.y = s2Height + pafHeight / 2;
    stage2Group.add(pafMesh);

    root.add(stage2Group);

    // 4. Spacecraft Payload (Mounted on Stage 2 PAF)
    const spacecraftPayload = this.buildSpacecraft(spacecraftConfig);
    spacecraftPayload.name = 'Payload_Spacecraft';
    spacecraftPayload.scale.set(0.42, 0.42, 0.42);
    spacecraftPayload.position.set(0, s2Height + pafHeight + 0.8, 0);

    // Fold solar wings tightly against body initially
    const solarWings = spacecraftPayload.getObjectByName('SolarArrayWings');
    if (solarWings) {
      solarWings.scale.set(0.18, 1, 0.3); // Stowed state
    }
    stage2Group.add(spacecraftPayload);

    // 5. Clamshell Payload Fairings (Left & Right halves)
    const fairingGroup = new THREE.Group();
    fairingGroup.name = 'FairingAssembly';
    fairingGroup.position.y = s1Height / 2 + interstageHeight + s2Height + pafHeight;

    // Half 1: Left Fairing (faces -X, splits along Y-Z plane)
    const fairingLeft = new THREE.Group();
    fairingLeft.name = 'Fairing_Left';
    const shell1 = new THREE.Mesh(new THREE.CylinderGeometry(fairingRadius, fairingRadius, fairingHeight * 0.6, 24, 1, false, 0, Math.PI), this.rocketWhiteMaterial);
    shell1.position.y = fairingHeight * 0.3;
    fairingLeft.add(shell1);
    const nose1 = new THREE.Mesh(new THREE.ConeGeometry(fairingRadius, fairingHeight * 0.4, 24, 1, false, 0, Math.PI), this.rocketWhiteMaterial);
    nose1.position.y = fairingHeight * 0.6 + (fairingHeight * 0.4) / 2;
    fairingLeft.add(nose1);
    fairingGroup.add(fairingLeft);

    // Half 2: Right Fairing (faces +X, splits along Y-Z plane)
    const fairingRight = new THREE.Group();
    fairingRight.name = 'Fairing_Right';
    const shell2 = new THREE.Mesh(new THREE.CylinderGeometry(fairingRadius, fairingRadius, fairingHeight * 0.6, 24, 1, false, Math.PI, Math.PI), this.rocketWhiteMaterial);
    shell2.position.y = fairingHeight * 0.3;
    fairingRight.add(shell2);
    const nose2 = new THREE.Mesh(new THREE.ConeGeometry(fairingRadius, fairingHeight * 0.4, 24, 1, false, Math.PI, Math.PI), this.rocketWhiteMaterial);
    nose2.position.y = fairingHeight * 0.6 + (fairingHeight * 0.4) / 2;
    fairingRight.add(nose2);
    fairingGroup.add(fairingRight);

    root.add(fairingGroup);

    return {
      root,
      stage1Group,
      srbs,
      interstageMesh,
      stage2Group,
      fairingGroup,
      fairingLeft,
      fairingRight,
      pafMesh,
      spacecraftPayload,
      plumeStage1,
      plumeStage2,
      rocketId,
      s1Height,
      s2Height,
      fairingHeight,
      unfoldSpacecraft: (progress) => {
        if (solarWings) {
          const s = 0.18 + (1.0 - 0.18) * Math.min(1, Math.max(0, progress));
          solarWings.scale.set(s, 1, s);
        }
      }
    };
  }

  /**
   * Hyper-Realistic Spacecraft Chassis with MLI Foil, Star Trackers, and Radiators
   */
  createBusMesh(busId = 'bus_espa_medium') {
    const group = new THREE.Group();
    group.name = 'BusChassis';

    if (busId.includes('cubesat')) {
      // 12U CubeSat rectangular prism (standard NASA SLS secondary payload format)
      const geo = new THREE.BoxGeometry(1.0, 1.0, 1.8);
      const mesh = new THREE.Mesh(geo, this.goldMLIMaterial);
      group.add(mesh);

      // Aluminum 6061-T6 Corner Deployment Rails
      const railGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.9, 8);
      const offsets = [
        [-0.5, -0.5], [0.5, -0.5],
        [-0.5, 0.5], [0.5, 0.5]
      ];
      offsets.forEach(([x, y]) => {
        const rail = new THREE.Mesh(railGeo, this.carbonFiberMaterial);
        rail.rotation.x = Math.PI / 2;
        rail.position.set(x, y, 0);
        group.add(rail);
      });

    } else if (busId.includes('flagship') || busId.includes('deepspace')) {
      // Heavy Flagship Class: Hexagonal/Cylindrical core with dual spherical titanium propellant tanks
      const coreGeo = new THREE.CylinderGeometry(1.15, 1.15, 2.4, 6);
      coreGeo.rotateX(Math.PI / 2);
      const coreMesh = new THREE.Mesh(coreGeo, this.goldMLIMaterial);
      group.add(coreMesh);

      // Dual Spherical Hydrazine / NTO Titanium Propellant Tanks (Cassini/Juno heritage)
      const tankGeo = new THREE.SphereGeometry(0.55, 20, 20);
      const tankL = new THREE.Mesh(tankGeo, this.silverMLIMaterial);
      tankL.position.set(-1.05, 0, 0);
      group.add(tankL);

      const tankR = new THREE.Mesh(tankGeo, this.silverMLIMaterial);
      tankR.position.set(1.05, 0, 0);
      group.add(tankR);

      // Titanium Structural Load Truss Rims
      const trussGeo = new THREE.TorusGeometry(1.16, 0.06, 8, 24);
      [-0.9, 0.9].forEach(z => {
        const truss = new THREE.Mesh(trussGeo, this.titaniumMaterial);
        truss.position.set(0, 0, z);
        group.add(truss);
      });

      // Dual Heavy Radiator Panels on Zenith Deck
      const radGeo = new THREE.BoxGeometry(1.8, 0.05, 1.8);
      const radMesh = new THREE.Mesh(radGeo, this.silverMLIMaterial);
      radMesh.position.set(0, 1.05, 0);
      group.add(radMesh);

    } else {
      // NASA ESPA-Class Octagonal SmallSat Bus with Beta Cloth Radiator & Kapton MLI
      const octGeo = new THREE.CylinderGeometry(0.95, 0.95, 1.5, 8);
      octGeo.rotateX(Math.PI / 2);
      const octMesh = new THREE.Mesh(octGeo, this.goldMLIMaterial);
      group.add(octMesh);

      // Silver radiator panel on nadir/zenith deck
      const radGeo = new THREE.BoxGeometry(1.3, 0.04, 1.3);
      const radMesh = new THREE.Mesh(radGeo, this.silverMLIMaterial);
      radMesh.position.set(0, 0.82, 0);
      group.add(radMesh);
    }

    // Dual Autonomous Star Tracker Optical Tubes with 45-degree sunshade baffles
    [-0.35, 0.35].forEach(xOff => {
      const stGeo = new THREE.CylinderGeometry(0.07, 0.1, 0.3, 12);
      const stMesh = new THREE.Mesh(stGeo, this.carbonFiberMaterial);
      stMesh.position.set(xOff, 0.75, 0.35);
      stMesh.rotation.x = -Math.PI / 4;
      stMesh.rotation.z = xOff > 0 ? 0.2 : -0.2;
      group.add(stMesh);
    });

    return group;
  }

  /**
   * 4-Corner RCS (Reaction Control System) Attitude Control Thruster Quads
   */
  createRCSQuads() {
    const group = new THREE.Group();
    group.name = 'RCSQuadAssembly';

    const quadOffsets = [
      [-0.75, 0.6, 0.7], [0.75, 0.6, 0.7],
      [-0.75, -0.6, 0.7], [0.75, -0.6, 0.7]
    ];

    quadOffsets.forEach(([qx, qy, qz]) => {
      const blockGeo = new THREE.BoxGeometry(0.14, 0.14, 0.14);
      const block = new THREE.Mesh(blockGeo, this.titaniumMaterial);
      block.position.set(qx, qy, qz);

      // Miniature titanium RCS conical nozzles (pointing in 4 directions)
      const nozzleGeo = new THREE.ConeGeometry(0.04, 0.1, 8, 1, true);
      const n1 = new THREE.Mesh(nozzleGeo, this.titaniumMaterial);
      n1.position.set(qx > 0 ? 0.08 : -0.08, 0, 0);
      n1.rotation.z = qx > 0 ? -Math.PI / 2 : Math.PI / 2;
      block.add(n1);

      group.add(block);
    });

    return group;
  }

  /**
   * Distinct Real-Life Power Generation Subsystems:
   * - Body-Mounted Panels (Zero wings, flush on chassis)
   * - Deployable GaAs Arrays (Standard 3-panel wings)
   * - Large Articulated Arrays (Massive 5-panel wings with cross-trusses)
   * - Nuclear RTG Generator (Black graphite cylinder with 8 radial cooling vanes & glowing orange core!)
   */
  createSolarWings(powerId = 'pwr_deployable_gaas') {
    const group = new THREE.Group();
    group.name = 'PowerSubsystem';

    if (powerId.includes('rtg')) {
      // Nuclear Radioisotope Thermoelectric Generator (GPHS-RTG) - ZERO solar panels!
      const rtgGroup = new THREE.Group();
      rtgGroup.position.set(-1.1, 0, -0.2);

      // Heavy Graphite Outer Aerodynamic Cylinder
      const cylGeo = new THREE.CylinderGeometry(0.35, 0.35, 1.4, 24);
      cylGeo.rotateZ(Math.PI / 2);
      const cylMesh = new THREE.Mesh(cylGeo, this.carbonFiberMaterial);
      rtgGroup.add(cylMesh);

      // 8 Radial Titanium Heat Radiator Cooling Fins
      const finGeo = new THREE.BoxGeometry(1.3, 0.03, 0.95);
      for (let i = 0; i < 4; i++) {
        const fin = new THREE.Mesh(finGeo, this.titaniumMaterial);
        fin.rotation.x = (i * Math.PI) / 4;
        rtgGroup.add(fin);
      }

      // Glowing Plutonium-238 Internal Decay Heat Core (visible at cylinder ends)
      const coreGeo = new THREE.SphereGeometry(0.24, 16, 16);
      const coreMat = new THREE.MeshBasicMaterial({ color: 0xf97316 }); // Glowing thermal orange
      const coreMeshL = new THREE.Mesh(coreGeo, coreMat);
      coreMeshL.position.set(-0.6, 0, 0);
      rtgGroup.add(coreMeshL);

      const coreMeshR = new THREE.Mesh(coreGeo, coreMat);
      coreMeshR.position.set(0.6, 0, 0);
      rtgGroup.add(coreMeshR);

      // Mounting Boom to Chassis
      const boomGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.6, 12);
      boomGeo.rotateZ(Math.PI / 2);
      const boom = new THREE.Mesh(boomGeo, this.titaniumMaterial);
      boom.position.set(0.55, 0, 0);
      rtgGroup.add(boom);

      group.add(rtgGroup);
      return group;

    } else if (powerId.includes('body_panels')) {
      // Body-Mounted Photovoltaic Cells: Flush dark-blue solar cells on chassis facets (NO wings)
      const cellMat = this.solarMaterial;
      const offsets = [
        { pos: [0, 0.55, 0], rot: [-Math.PI / 2, 0, 0], size: [0.9, 1.6] },
        { pos: [0, -0.55, 0], rot: [Math.PI / 2, 0, 0], size: [0.9, 1.6] },
        { pos: [-0.55, 0, 0], rot: [0, Math.PI / 2, 0], size: [1.6, 0.9] },
        { pos: [0.55, 0, 0], rot: [0, -Math.PI / 2, 0], size: [1.6, 0.9] }
      ];

      offsets.forEach(({ pos, rot, size }) => {
        const pGeo = new THREE.PlaneGeometry(size[0], size[1]);
        const pMesh = new THREE.Mesh(pGeo, cellMat);
        pMesh.position.set(...pos);
        pMesh.rotation.set(...rot);
        group.add(pMesh);
      });

      return group;

    } else {
      // Deployable Solar Array Wings (GaAs Triple-Junction Photovoltaics)
      const isLarge = powerId.includes('large') || powerId.includes('articulated');
      const panelWidth = isLarge ? 3.4 : 2.1;
      const panelHeight = isLarge ? 1.3 : 0.95;
      const panelGeo = new THREE.BoxGeometry(panelWidth, 0.03, panelHeight);

      // Left Wing
      const leftWing = new THREE.Mesh(panelGeo, this.solarMaterial);
      leftWing.position.set(-1.1 - panelWidth / 2, 0, 0);
      group.add(leftWing);

      // Left Solar Array Drive Mechanism (SADM) Rotating Hinge & Boom
      const boomGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.1, 12);
      boomGeo.rotateZ(Math.PI / 2);
      const leftBoom = new THREE.Mesh(boomGeo, this.titaniumMaterial);
      leftBoom.position.set(-1.1, 0, 0);
      group.add(leftBoom);

      // Right Wing
      const rightWing = new THREE.Mesh(panelGeo, this.solarMaterial);
      rightWing.position.set(1.1 + panelWidth / 2, 0, 0);
      group.add(rightWing);

      // Right Boom
      const rightBoom = new THREE.Mesh(boomGeo, this.titaniumMaterial);
      rightBoom.position.set(1.1, 0, 0);
      group.add(rightBoom);

      // Cross-Bracing for Large Articulated Wings
      if (isLarge) {
        [-1.1 - panelWidth / 2, 1.1 + panelWidth / 2].forEach(wx => {
          const trussGeo = new THREE.BoxGeometry(panelWidth * 0.95, 0.08, 0.04);
          const truss = new THREE.Mesh(trussGeo, this.carbonFiberMaterial);
          truss.position.set(wx, 0.04, 0);
          group.add(truss);
        });
      }

      return group;
    }
  }

  /**
   * Real-Life Propulsion Systems:
   * 1. Cold Gas: 4-directional nitrogen microthruster manifold
   * 2. Hydrazine Monopropellant: Catalytic decomposition thruster chamber
   * 3. Liquid Bipropellant: High-thrust niobium engine bell with cooling coils & gimbals
   * 4. Hall Effect Ion Drive: Annular ceramic discharge channel with glowing cyan xenon plasma
   */
  createEngineMesh(engineId = 'prop_bipropellant') {
    const group = new THREE.Group();
    group.name = 'EngineSubsystem';

    if (engineId.includes('ion')) {
      // Hall Effect Xenon Ion Thruster (NASA NEXT-C / BHT-600)
      const housingGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.38, 24);
      housingGeo.rotateX(Math.PI / 2);
      const housing = new THREE.Mesh(housingGeo, this.carbonFiberMaterial);
      group.add(housing);

      // Ceramic Annular Discharge Channel with Glowing Electric Cyan Xenon Plasma Ring
      const gridGeo = new THREE.RingGeometry(0.14, 0.38, 24);
      gridGeo.rotateX(Math.PI);
      const gridMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.DoubleSide
      });
      const grid = new THREE.Mesh(gridGeo, gridMat);
      grid.position.set(0, 0, -0.2);
      group.add(grid);

      // Central Hollow Cathode Neutralizer Emitter
      const cathodeGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.22, 8);
      cathodeGeo.rotateX(Math.PI / 2);
      const cathode = new THREE.Mesh(cathodeGeo, this.titaniumMaterial);
      cathode.position.set(0, 0, -0.16);
      group.add(cathode);

    } else if (engineId.includes('cold_gas')) {
      // Nitrogen Cold Gas Attitude & Orbit Control Thruster Block
      const blockGeo = new THREE.BoxGeometry(0.4, 0.4, 0.3);
      const block = new THREE.Mesh(blockGeo, this.titaniumMaterial);
      group.add(block);

      // 4 Precision Stainless Micro-Nozzles
      const microNozGeo = new THREE.ConeGeometry(0.06, 0.2, 12, 1, true);
      microNozGeo.rotateX(Math.PI);
      const positions = [
        [-0.15, -0.15, -0.2], [0.15, -0.15, -0.2],
        [-0.15, 0.15, -0.2], [0.15, 0.15, -0.2]
      ];
      positions.forEach(p => {
        const noz = new THREE.Mesh(microNozGeo, this.silverMLIMaterial);
        noz.position.set(...p);
        group.add(noz);
      });

    } else if (engineId.includes('hydrazine') || engineId.includes('monoprop')) {
      // Catalytic Monopropellant Hydrazine Thruster (e.g. Aerojet MR-106)
      const chamberGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.45, 16);
      chamberGeo.rotateX(Math.PI / 2);
      const chamber = new THREE.Mesh(chamberGeo, this.titaniumMaterial);
      chamber.position.set(0, 0, 0.15);
      group.add(chamber);

      // Expansion Nozzle Cone
      const nozzleGeo = new THREE.ConeGeometry(0.32, 0.65, 20, 1, true);
      nozzleGeo.rotateX(-Math.PI / 2);
      const nozzle = new THREE.Mesh(nozzleGeo, this.silverMLIMaterial);
      nozzle.position.set(0, 0, -0.25);
      group.add(nozzle);

    } else {
      // High-Thrust Liquid Bipropellant Apogee Rocket Engine (e.g. Aerojet R-4D / LEROS-1b)
      const bellGeo = new THREE.ConeGeometry(0.52, 1.1, 24, 1, true);
      bellGeo.rotateX(-Math.PI / 2);
      const bell = new THREE.Mesh(bellGeo, this.titaniumMaterial);
      group.add(bell);

      // Combustion Chamber Injector Head with Regenerative Copper Cooling Coils
      const chamberGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.35, 16);
      chamberGeo.rotateX(Math.PI / 2);
      const chamber = new THREE.Mesh(chamberGeo, this.rocketBlackMaterial);
      chamber.position.set(0, 0, 0.28);
      group.add(chamber);

      // Dual Gimbal Actuator Pistons (pitch/yaw thrust vector control)
      const pistonGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.45, 8);
      const p1 = new THREE.Mesh(pistonGeo, this.silverMLIMaterial);
      p1.position.set(0.28, 0.18, 0.18);
      p1.rotation.x = 0.25;
      group.add(p1);

      const p2 = new THREE.Mesh(pistonGeo, this.silverMLIMaterial);
      p2.position.set(-0.28, 0.18, 0.18);
      p2.rotation.x = 0.25;
      group.add(p2);
    }

    return group;
  }

  /**
   * Scientific Payload Instruments (Every single instrument is completely distinct!):
   * 1. Multispectral Camera: Optical telescope tube with gold sunshade hood & sapphire lens
   * 2. Neutron Spectrometer: Dual He-3 tubes wrapped in cadmium & polyethylene moderator block
   * 3. SAR Radar: Massive deployable gold phased-array planar antenna panel & truss
   * 4. Magnetometer Boom: Long 3-stage articulated carbon boom with triaxial sensor sphere
   * 5. Mass Spectrometer: Quadrupole vacuum chamber with sniffer nozzle & gold MLI
   * 6. LIDAR Altimeter: Dual-optic pulsed laser emitter cone & optical receiver barrel
   * 7. Infrared Radiometer: Cryogenic dewar sounder with radiative cone & germanium window
   * 8. Canadarm Boom: Canadian Space Agency multi-jointed robotic manipulator arm
   */
  createInstrumentMesh(instId = 'inst_multispectral_cam') {
    const group = new THREE.Group();
    group.name = 'ScientificInstrument';

    if (instId.includes('neutron')) {
      // ==================== 1. THERMAL / EPITHERMAL NEUTRON SPECTROMETER ====================
      // Dual cylindrical Helium-3 proportional counter tubes
      const tubeGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.3, 16);
      tubeGeo.rotateX(Math.PI / 2);

      const tube1 = new THREE.Mesh(tubeGeo, this.silverMLIMaterial);
      tube1.position.set(-0.16, 0.2, 0);
      group.add(tube1);

      const tube2 = new THREE.Mesh(tubeGeo, this.silverMLIMaterial);
      tube2.position.set(0.16, 0.2, 0);
      group.add(tube2);

      // Cadmium Neutron Absorbing Thermal Sleeve Wrap
      const cadGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.65, 16);
      cadGeo.rotateX(Math.PI / 2);
      const cadWrap = new THREE.Mesh(cadGeo, this.carbonFiberMaterial);
      cadWrap.position.set(-0.16, 0.2, 0);
      group.add(cadWrap);

      // High-Density Polyethylene Moderator Block
      const modGeo = new THREE.BoxGeometry(0.55, 0.32, 0.7);
      const modMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.6 });
      const modBlock = new THREE.Mesh(modGeo, modMat);
      modBlock.position.set(0, 0.1, 0);
      group.add(modBlock);

      // Gold Electronics Preamp Box
      const boxGeo = new THREE.BoxGeometry(0.42, 0.2, 0.35);
      const preamp = new THREE.Mesh(boxGeo, this.goldMLIMaterial);
      preamp.position.set(0, 0.35, -0.4);
      group.add(preamp);

    } else if (instId.includes('sar')) {
      // ==================== 2. SYNTHETIC APERTURE RADAR (SAR) ====================
      // Massive Deployable Gold Microstrip Phased-Array Radar Panel
      const radarGeo = new THREE.BoxGeometry(2.6, 0.06, 1.2);
      const radarMat = new THREE.MeshStandardMaterial({
        color: 0xd97706, // Gold patch array
        roughness: 0.25,
        metalness: 0.85
      });
      const radar = new THREE.Mesh(radarGeo, radarMat);
      radar.position.set(0, 0.45, 0);
      group.add(radar);

      // Carbon-Fiber Structural Backing Truss
      const trussGeo = new THREE.BoxGeometry(2.4, 0.14, 0.95);
      const truss = new THREE.Mesh(trussGeo, this.carbonFiberMaterial);
      truss.position.set(0, 0.32, 0);
      group.add(truss);

      // 4 Waveguide Feed Horn Clusters
      [-0.9, -0.3, 0.3, 0.9].forEach(fx => {
        const hornGeo = new THREE.BoxGeometry(0.1, 0.18, 0.1);
        const horn = new THREE.Mesh(hornGeo, this.titaniumMaterial);
        horn.position.set(fx, 0.52, 0.45);
        group.add(horn);
      });

    } else if (instId.includes('magneto')) {
      // ==================== 3. FLUXGATE MAGNETOMETER BOOM ====================
      // Long 3-Stage Articulated Carbon-Fiber Mast angled away from spacecraft magnetic fields
      const boomGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.8, 12);
      boomGeo.rotateX(Math.PI / 3);
      const boom = new THREE.Mesh(boomGeo, this.carbonFiberMaterial);
      group.add(boom);

      // Titanium Articulated Rotary Lock Joints
      [-0.4, 0.6].forEach(jy => {
        const jGeo = new THREE.SphereGeometry(0.09, 12, 12);
        const joint = new THREE.Mesh(jGeo, this.titaniumMaterial);
        joint.position.set(0, jy + 0.4, (jy + 0.4) * 0.7);
        group.add(joint);
      });

      // Triaxial Fluxgate Magnetometer Dual Sensor Spheres at Apex
      const sphereGeo = new THREE.SphereGeometry(0.2, 16, 16);
      const sphere = new THREE.Mesh(sphereGeo, this.goldMLIMaterial);
      sphere.position.set(0, 1.25, 1.2);
      group.add(sphere);

    } else if (instId.includes('mass_spectrometer') || instId.includes('chromatography')) {
      // ==================== 4. GAS CHROMATOGRAPHY MASS SPECTROMETER ====================
      // Quadrupole Vacuum Analyzer Chamber wrapped in Gold Kapton MLI
      const chamGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.95, 20);
      chamGeo.rotateX(Math.PI / 2);
      const chamber = new THREE.Mesh(chamGeo, this.goldMLIMaterial);
      chamber.position.set(0, 0.35, 0);
      group.add(chamber);

      // Conical Atmospheric Plume Sniffer Intake Nozzle
      const coneGeo = new THREE.ConeGeometry(0.22, 0.42, 16);
      coneGeo.rotateX(Math.PI / 2);
      const sniffer = new THREE.Mesh(coneGeo, this.titaniumMaterial);
      sniffer.position.set(0, 0.35, 0.65);
      group.add(sniffer);

      // Ionizer Electron-Impact Filament Chamber with Orange Thermal Emitter Glow
      const ionGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.3, 12);
      const ionMesh = new THREE.Mesh(ionGeo, new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
      ionMesh.position.set(0.22, 0.45, 0.1);
      group.add(ionMesh);

      // Turbomolecular High-Vacuum Exhaust Port
      const ventGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.25, 8);
      const vent = new THREE.Mesh(ventGeo, this.carbonFiberMaterial);
      vent.position.set(-0.24, 0.45, -0.2);
      group.add(vent);

    } else if (instId.includes('lidar')) {
      // ==================== 5. PULSED LASER LIDAR ALTIMETER ====================
      // Dual-Optic System: Laser Emitter Cone + Receiver Cassegrain Telescope
      const emitterGeo = new THREE.CylinderGeometry(0.14, 0.18, 0.65, 16);
      emitterGeo.rotateX(Math.PI / 4);
      const emitter = new THREE.Mesh(emitterGeo, this.carbonFiberMaterial);
      emitter.position.set(-0.25, 0.35, 0.3);
      group.add(emitter);

      // Green Nd:YAG Laser Beam Aperture Lens (Glowing Laser Green!)
      const greenLens = new THREE.Mesh(new THREE.CircleGeometry(0.12, 16), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
      greenLens.rotateX(-Math.PI / 4);
      greenLens.position.set(-0.25, 0.58, 0.53);
      group.add(greenLens);

      // Large Optical Receiver Collector Barrel
      const recvGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.8, 20);
      recvGeo.rotateX(Math.PI / 4);
      const recv = new THREE.Mesh(recvGeo, this.goldMLIMaterial);
      recv.position.set(0.25, 0.35, 0.3);
      group.add(recv);

      const recvLens = new THREE.Mesh(new THREE.CircleGeometry(0.24, 16), new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, roughness: 0.1 }));
      recvLens.rotateX(-Math.PI / 4);
      recvLens.position.set(0.25, 0.63, 0.58);
      group.add(recvLens);

    } else if (instId.includes('radiometer') || instId.includes('infrared')) {
      // ==================== 6. THERMAL INFRARED SOUNDER & RADIOMETER ====================
      // Vacuum Cryogenic Dewar Flask
      const dewarGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.8, 24);
      dewarGeo.rotateX(Math.PI / 3);
      const dewar = new THREE.Mesh(dewarGeo, this.goldMLIMaterial);
      dewar.position.set(0, 0.35, 0.2);
      group.add(dewar);

      // Silver Conical Passive Radiative Cold Cone
      const coneGeo = new THREE.ConeGeometry(0.44, 0.45, 20, 1, true);
      coneGeo.rotateX(Math.PI / 3);
      const cone = new THREE.Mesh(coneGeo, this.silverMLIMaterial);
      cone.position.set(0, 0.68, 0.4);
      group.add(cone);

      // Germanium Optical Filter Window (Dark Amber/Reddish Glass)
      const germLens = new THREE.Mesh(new THREE.CircleGeometry(0.24, 16), new THREE.MeshPhysicalMaterial({ color: 0xd97706, roughness: 0.05 }));
      germLens.rotateX(-Math.PI / 6);
      germLens.position.set(0, 0.78, 0.45);
      group.add(germLens);

    } else if (instId.includes('canadarm') || instId.includes('csa') || instId.includes('boom')) {
      // ==================== 7. CANADARM INSPECTION & ROBOTIC SERVICE BOOM ====================
      // Dual-Segment Articulated Robotic Arm in White Multi-Layer Thermal Insulation
      const seg1Geo = new THREE.CylinderGeometry(0.06, 0.06, 1.4, 12);
      seg1Geo.rotateX(Math.PI / 3);
      const seg1 = new THREE.Mesh(seg1Geo, this.rocketWhiteMaterial);
      seg1.position.set(-0.2, 0.3, 0.2);
      group.add(seg1);

      // Elbow Rotary Joint
      const elbowGeo = new THREE.SphereGeometry(0.12, 12, 12);
      const elbow = new THREE.Mesh(elbowGeo, this.titaniumMaterial);
      elbow.position.set(-0.2, 0.7, 0.55);
      group.add(elbow);

      // Forearm Segment with Canadian Emblem
      const seg2Geo = new THREE.CylinderGeometry(0.055, 0.055, 1.3, 12);
      seg2Geo.rotateZ(Math.PI / 4);
      const seg2 = new THREE.Mesh(seg2Geo, this.rocketWhiteMaterial);
      seg2.position.set(0.3, 0.9, 0.55);
      group.add(seg2);

      // Mechanical End-Effector Gripper Claw / Camera Probe at Tip
      const clawGeo = new THREE.CylinderGeometry(0.08, 0.14, 0.25, 8);
      clawGeo.rotateZ(Math.PI / 4);
      const claw = new THREE.Mesh(clawGeo, this.goldMLIMaterial);
      claw.position.set(0.75, 1.35, 0.55);
      group.add(claw);

    } else if (instId.includes('chaste') || instId.includes('apxs')) {
      // ==================== 8. CHASTE & APXS LUNAR THERMAL PROBE ====================
      // Sensor Electronics Base Unit (Gold MLI)
      const baseGeo = new THREE.BoxGeometry(0.42, 0.32, 0.38);
      const baseMesh = new THREE.Mesh(baseGeo, this.goldMLIMaterial);
      baseMesh.position.set(0, 0.2, 0.2);
      group.add(baseMesh);

      // ChaSTE Motorized Penetration Needle Probe (10cm Soil Depth Penetrator)
      const needleGeo = new THREE.CylinderGeometry(0.025, 0.015, 1.2, 12);
      needleGeo.rotateX(Math.PI / 3);
      const needleMesh = new THREE.Mesh(needleGeo, this.titaniumMaterial);
      needleMesh.position.set(0.15, 0.55, 0.55);
      group.add(needleMesh);

      // APXS Alpha Particle Spectrometer Sensor Head
      const apxsGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.25, 16);
      apxsGeo.rotateX(Math.PI / 3);
      const apxsMesh = new THREE.Mesh(apxsGeo, this.silverMLIMaterial);
      apxsMesh.position.set(-0.15, 0.45, 0.45);
      group.add(apxsMesh);

    } else if (instId.includes('velc') || instId.includes('coronagraph')) {
      // ==================== 9. ADITYA-L1 VELC SOLAR CORONAGRAPH ====================
      // Main Off-Axis Coronagraph Telescope Tube
      const tubeGeo = new THREE.CylinderGeometry(0.32, 0.36, 1.2, 24);
      tubeGeo.rotateX(Math.PI / 4);
      const tubeMesh = new THREE.Mesh(tubeGeo, this.silverMLIMaterial);
      tubeMesh.position.set(0, 0.3, 0.25);
      group.add(tubeMesh);

      // Front Solar Light Baffle & Internal Occulting Disk
      const baffleGeo = new THREE.CylinderGeometry(0.42, 0.32, 0.35, 24);
      baffleGeo.rotateX(Math.PI / 4);
      const baffleMesh = new THREE.Mesh(baffleGeo, this.carbonFiberMaterial);
      baffleMesh.position.set(0, 0.72, 0.67);
      group.add(baffleMesh);

      // Central Artificial Eclipse Occulter Disk (pitch black)
      const occulterGeo = new THREE.CircleGeometry(0.12, 16);
      occulterGeo.rotateX(-Math.PI / 4);
      const occulterMesh = new THREE.Mesh(occulterGeo, new THREE.MeshBasicMaterial({ color: 0x000000 }));
      occulterMesh.position.set(0, 0.73, 0.68);
      group.add(occulterMesh);

      // SUIT Ultraviolet Filter Ring (Amber Glow)
      const suitRingGeo = new THREE.TorusGeometry(0.24, 0.04, 8, 24);
      suitRingGeo.rotateX(Math.PI / 4);
      const suitRing = new THREE.Mesh(suitRingGeo, new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
      suitRing.position.set(0, 0.55, 0.50);
      group.add(suitRing);

    } else {
      // ==================== 8. HIGH-RES OPTICAL MULTISPECTRAL CAMERA TELESCOPE ====================
      const barrelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.95, 24);
      barrelGeo.rotateX(Math.PI / 4);
      const barrel = new THREE.Mesh(barrelGeo, this.carbonFiberMaterial);
      group.add(barrel);

      // Beveled Gold Thermal Sunshade Hood
      const hoodGeo = new THREE.CylinderGeometry(0.38, 0.32, 0.32, 24);
      hoodGeo.rotateX(Math.PI / 4);
      const hood = new THREE.Mesh(hoodGeo, this.goldMLIMaterial);
      hood.position.set(0, 0.38, 0.38);
      group.add(hood);

      // Optical Sapphire Crystal Lens Element with Realistic Specular Reflection
      const lensGeo = new THREE.CircleGeometry(0.3, 24);
      lensGeo.rotateX(-Math.PI / 4);
      const lensMat = new THREE.MeshPhysicalMaterial({
        color: 0x0284c7,
        roughness: 0.05,
        metalness: 0.1,
        transparent: true,
        opacity: 0.85
      });
      const lens = new THREE.Mesh(lensGeo, lensMat);
      lens.position.set(0, 0.38, 0.38);
      group.add(lens);

      // Secondary Mirror Spider Vane Bracket
      const spiderGeo = new THREE.BoxGeometry(0.55, 0.02, 0.02);
      spiderGeo.rotateZ(Math.PI / 4);
      const spider = new THREE.Mesh(spiderGeo, this.titaniumMaterial);
      spider.position.set(0, 0.38, 0.38);
      group.add(spider);
    }

    return group;
  }

  /**
   * Real-Life High-Gain Communications Antennas:
   * 1. Patch: Flush S-Band microstrip array on chassis
   * 2. Horn: Flared conical X-Band microwave feed horn
   * 3. Parabolic: 1.5m Cassegrain reflector dish with sub-reflector tripod
   * 4. Optical Laser: DSOC laser communications transceiver with green beam emitter
   */
  createAntennaMesh(commId = 'comm_parabolic_ka') {
    const group = new THREE.Group();
    group.name = 'CommunicationsAntenna';

    if (commId.includes('laser') || commId.includes('optical')) {
      // NASA Deep Space Optical Communications (DSOC) Laser Transceiver Telescope
      const barrelGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.7, 16);
      barrelGeo.rotateX(Math.PI / 4);
      const barrel = new THREE.Mesh(barrelGeo, this.carbonFiberMaterial);
      group.add(barrel);

      // Laser Optical Sunshade Hood
      const hoodGeo = new THREE.CylinderGeometry(0.26, 0.22, 0.2, 16);
      hoodGeo.rotateX(Math.PI / 4);
      const hood = new THREE.Mesh(hoodGeo, this.goldMLIMaterial);
      hood.position.set(0, 0.28, 0.28);
      group.add(hood);

      // Glowing Green Laser Optical Emitter Lens (1550nm Downlink)
      const greenLens = new THREE.Mesh(new THREE.CircleGeometry(0.18, 16), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
      greenLens.rotateX(-Math.PI / 4);
      greenLens.position.set(0, 0.29, 0.29);
      group.add(greenLens);

    } else if (commId.includes('horn') || commId.includes('x_band')) {
      // Flared Conical X-Band Microwave Horn Antenna
      const hornGeo = new THREE.ConeGeometry(0.3, 0.65, 16, 1, true);
      hornGeo.rotateX(Math.PI / 2);
      const horn = new THREE.Mesh(hornGeo, this.silverMLIMaterial);
      group.add(horn);

      // Waveguide Feed Tube & Mounting Bracket
      const waveGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.35, 12);
      waveGeo.rotateX(Math.PI / 2);
      const wave = new THREE.Mesh(waveGeo, this.titaniumMaterial);
      wave.position.set(0, 0, -0.4);
      group.add(wave);

    } else if (commId.includes('patch') || commId.includes('omni') || commId.includes('s_band')) {
      // S-Band Microstrip Patch Antenna (mounted flush on deck)
      const patchGeo = new THREE.BoxGeometry(0.36, 0.05, 0.36);
      const patch = new THREE.Mesh(patchGeo, this.goldMLIMaterial);
      group.add(patch);

      const radTile = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.06, 0.28), this.carbonFiberMaterial);
      group.add(radTile);

    } else {
      // 1.5m Cassegrain Parabolic Reflector Dish Antenna (Smooth Lathe Geometry)
      const pts = [];
      const r = 0.85;
      const depth = r * 0.35;
      for (let i = 0; i <= 16; i++) {
        const x = (i / 16) * r;
        pts.push(new THREE.Vector2(x, depth * ((x / r) ** 2)));
      }
      const dishGeo = new THREE.LatheGeometry(pts, 48);
      dishGeo.rotateX(Math.PI / 2);
      const dish = new THREE.Mesh(dishGeo, this.silverMLIMaterial);
      dish.material.side = THREE.DoubleSide;
      group.add(dish);

      // Tripod Sub-Reflector Support Struts
      const mastGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.65, 8);
      mastGeo.rotateX(Math.PI / 2);
      const mast = new THREE.Mesh(mastGeo, this.titaniumMaterial);
      mast.position.set(0, 0, 0.34);
      group.add(mast);

      // Cassegrain Hyperbolic Sub-Reflector Button
      const buttonGeo = new THREE.SphereGeometry(0.12, 12, 12);
      const button = new THREE.Mesh(buttonGeo, this.goldMLIMaterial);
      button.position.set(0, 0, 0.62);
      group.add(button);

      // 2-Axis Motorized Gimbal Mount
      const gimbalGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.25, 12);
      const gimbal = new THREE.Mesh(gimbalGeo, this.carbonFiberMaterial);
      gimbal.position.set(0, -0.2, 0);
      group.add(gimbal);
    }

    return group;
  }
}
