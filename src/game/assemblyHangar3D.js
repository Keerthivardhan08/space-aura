/**
 * ASTROFORGE: 3D Vehicle Assembly Building (VAB) & Rocket Integration Hangar
 * Powered by Three.js
 * Inspect spacecraft subsystems in 360 degrees or view full multi-stage launch vehicles
 * (SLS, Falcon 9, Vulcan, Electron) with cutaway payload fairing integration!
 */

import * as THREE from '../../libs/three.module.js';
import { OrbitControls } from '../../libs/OrbitControls.js';
import { Spacecraft3DBuilder } from '../engine/spacecraft3D.js';
import { sound } from '../engine/audio.js';

export class AssemblyHangar3D {
  constructor(canvasElement, onConfigChange) {
    this.canvas = canvasElement;
    this.onConfigChange = onConfigChange;

    this.loadout = {
      launchVehicleId: 'lv_falcon9',
      busId: 'bus_cubesat_12u',
      sensorId: 'inst_multispectral_cam',
      powerId: 'pwr_deployable_gaas',
      batteryId: 'bat_small_liion',
      engineId: 'prop_cold_gas',
      commId: 'comm_s_band_omni'
    };

    this.selectedSocket = 'sensor';
    this.viewMode = 'spacecraft'; // 'spacecraft' or 'rocket'
    this.builder = new Spacecraft3DBuilder();
    this.spacecraftGroup = null;

    this.initThree();
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
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x050811);
    this.scene.fog = new THREE.FogExp2(0x050811, 0.025);

    this.camera = new THREE.PerspectiveCamera(40, 1, 0.1, 150);
    this.camera.position.set(3.5, 2.5, 4.5);

    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxDistance = 35;
    this.controls.minDistance = 1.6;
    this.controls.target.set(0, 0, 0);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0x1e293b, 1.4);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(8, 14, 8);
    this.scene.add(keyLight);

    const cyanRimLight = new THREE.PointLight(0x38bdf8, 3.0, 30);
    cyanRimLight.position.set(-8, 6, -6);
    this.scene.add(cyanRimLight);

    const magentaFillLight = new THREE.PointLight(0xec4899, 1.8, 20);
    magentaFillLight.position.set(6, -2, -4);
    this.scene.add(magentaFillLight);

    // Assembly floor grid & glowing radial rings
    const floorGeo = new THREE.PlaneGeometry(60, 60);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x070b14,
      roughness: 0.85,
      metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2.2;
    this.scene.add(floor);

    const gridHelper = new THREE.GridHelper(48, 48, 0x0284c7, 0x1e293b);
    gridHelper.position.y = -2.19;
    this.scene.add(gridHelper);

    // Radial mount rings on floor
    const ringGeo = new THREE.RingGeometry(2.5, 2.6, 48);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide });
    const mountRing = new THREE.Mesh(ringGeo, ringMat);
    mountRing.rotation.x = -Math.PI / 2;
    mountRing.position.y = -2.18;
    this.scene.add(mountRing);

    // Outer flame trench ring
    const trenchGeo = new THREE.RingGeometry(5.0, 5.1, 48);
    const trenchMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide });
    const trench = new THREE.Mesh(trenchGeo, trenchMat);
    trench.rotation.x = -Math.PI / 2;
    trench.position.y = -2.18;
    this.scene.add(trench);

    this.rebuildSpacecraftModel();
    this.animate();
  }

  toggleViewMode() {
    this.viewMode = this.viewMode === 'spacecraft' ? 'rocket' : 'spacecraft';
    sound.playBlip(this.viewMode === 'rocket' ? 1200 : 700, 0.08);

    if (this.viewMode === 'rocket') {
      this.camera.position.set(9.0, 5.0, 14.0);
      this.controls.target.set(0, 3.2, 0);
      this.controls.maxDistance = 45;
    } else {
      this.camera.position.set(3.5, 2.5, 4.5);
      this.controls.target.set(0, 0, 0);
      this.controls.maxDistance = 14;
    }

    this.rebuildSpacecraftModel();

    const btn = document.getElementById('hangar-toggle-view-btn');
    if (btn) {
      btn.textContent = this.viewMode === 'rocket'
        ? '🛰️ SWITCH TO SATELLITE MODULES VIEW'
        : '🚀 SWITCH TO LAUNCH VEHICLE ROCKET VIEW';
    }

    return this.viewMode;
  }

  rebuildSpacecraftModel() {
    if (this.spacecraftGroup) {
      this.scene.remove(this.spacecraftGroup);
    }

    const config = {
      bus: { id: this.loadout.busId },
      power: { id: this.loadout.powerId },
      propulsion: { id: this.loadout.engineId },
      instrument: { id: this.loadout.sensorId },
      comm: { id: this.loadout.commId }
    };

    if (this.viewMode === 'rocket') {
      // Full multi-stage launch vehicle with fairing cutaway
      const rocketId = this.loadout.launchVehicleId || 'lv_falcon9';
      this.spacecraftGroup = this.builder.buildRocketStack(rocketId, config, true);
      this.spacecraftGroup.position.set(0, 0, 0);
    } else {
      // Spacecraft modules close-up
      this.spacecraftGroup = this.builder.buildSpacecraft(config);
      this.spacecraftGroup.position.set(0, 0, 0);
    }

    this.scene.add(this.spacecraftGroup);
  }

  setLoadout(newLoadout) {
    this.loadout = { ...this.loadout, ...newLoadout };
    this.rebuildSpacecraftModel();
    if (this.onConfigChange) {
      this.onConfigChange(this.loadout);
    }
  }

  selectSocket(socketName) {
    this.selectedSocket = socketName;
    sound.playBlip(720, 0.05);

    if (socketName === 'launcher') {
      if (this.viewMode !== 'rocket') {
        this.toggleViewMode();
      }
      return;
    }

    // If viewing rocket and switching to spacecraft socket, switch back to spacecraft view
    if (this.viewMode === 'rocket') {
      this.toggleViewMode();
    }

    // Smooth camera refocus on selected socket
    if (socketName === 'engine') {
      this.controls.target.set(0, 0, -1.0);
    } else if (socketName === 'sensor') {
      this.controls.target.set(0, 0.6, 0.6);
    } else if (socketName === 'power') {
      this.controls.target.set(1.5, 0, 0);
    } else if (socketName === 'comm') {
      this.controls.target.set(0.6, 0.5, -0.4);
    } else {
      this.controls.target.set(0, 0, 0);
    }
  }

  equipPart(partId) {
    sound.playSuccessChime();
    if (this.selectedSocket === 'launcher') {
      this.loadout.launchVehicleId = partId;
      if (this.viewMode !== 'rocket') {
        this.toggleViewMode();
      }
    } else if (this.selectedSocket === 'bus') {
      this.loadout.busId = partId;
    } else if (this.selectedSocket === 'sensor') {
      this.loadout.sensorId = partId;
    } else if (this.selectedSocket === 'power') {
      this.loadout.powerId = partId;
    } else if (this.selectedSocket === 'battery') {
      this.loadout.batteryId = partId;
    } else if (this.selectedSocket === 'engine') {
      this.loadout.engineId = partId;
    } else if (this.selectedSocket === 'comm') {
      this.loadout.commId = partId;
    }

    this.rebuildSpacecraftModel();

    if (this.onConfigChange) {
      this.onConfigChange(this.loadout);
    }
  }

  resize() {
    if (!this.canvas || !this.renderer) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const width = rect.width || 400;
    const height = rect.height || 360;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    if (this.controls) this.controls.update();

    // Gentle showcase floating drift when not dragging
    if (this.spacecraftGroup && !this.controls.state) {
      this.spacecraftGroup.rotation.y += 0.003;
      if (this.viewMode === 'spacecraft') {
        this.spacecraftGroup.position.y = Math.sin(Date.now() * 0.0015) * 0.06;
      }
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  render() {
    this.rebuildSpacecraftModel();
  }
}
