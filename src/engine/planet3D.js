/**
 * SPACE-AURA: 3D Planetary & Celestial Environment Builder
 * Renders Earth, Moon, Mars, Europa, Jupiter, deep space starfield, and ground stations
 */

import * as THREE from '../../libs/three.module.js';
import { TextureGenerator } from './textures3D.js';

export class Planet3DBuilder {
  /**
   * Create complete celestial system for a given mission target
   */
  static createCelestialSystem(planetType = 'earth', radius = 18) {
    const group = new THREE.Group();
    group.name = 'CelestialSystem';

    let planetMesh = null;
    let cloudsMesh = null;
    let atmosphereMesh = null;

    const textureLoader = new THREE.TextureLoader();
    const loadTex = (name, srgb = true, fallbackGen = null) => {
      let t = null;
      try {
        t = textureLoader.load(`./textures/${name}`);
        if (srgb) t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 8;
      } catch (err) {
        if (fallbackGen) t = fallbackGen();
      }
      return t;
    };

    const applyNightSideShader = (mat) => {
      mat.onBeforeCompile = (shader) => {
        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <emissivemap_fragment>',
          `#include <emissivemap_fragment>
           float nxl = 1.0;
           #if NUM_DIR_LIGHTS > 0
             nxl = dot(normal, directionalLights[0].direction);
           #elif NUM_POINT_LIGHTS > 0
             nxl = dot(normal, normalize(pointLights[0].position + vViewPosition));
           #endif
           totalEmissiveRadiance *= smoothstep(0.12, -0.18, nxl);`
        );
      };
    };

    if (planetType === 'earth') {
      // 1. High-Density Photorealistic Earth Surface (NASA 4K Blue & Black Marble)
      const earthGeo = new THREE.SphereGeometry(radius, 192, 128);
      const earthMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 1.25,
        metalness: 0.04
      });

      earthMat.map = loadTex('earth-day.jpg', true, () => TextureGenerator.createEarthTexture(2048, 1024));
      earthMat.bumpMap = loadTex('earth-bump.jpg', false);
      earthMat.bumpScale = 1.6;
      earthMat.roughnessMap = loadTex('earth-rough.jpg', false, () => TextureGenerator.createEarthRoughnessMap(2048, 1024));
      earthMat.emissiveMap = loadTex('earth-night.jpg', true, () => TextureGenerator.createEarthNightTexture(1024, 512));
      earthMat.emissive.setHex(0xffd9a0);
      earthMat.emissiveIntensity = 1.6;
      applyNightSideShader(earthMat);

      planetMesh = new THREE.Mesh(earthGeo, earthMat);
      planetMesh.name = 'PlanetMesh';
      planetMesh.rotation.z = THREE.MathUtils.degToRad(23.44);
      group.add(planetMesh);

      // 2. NASA 4K Cloud Transparency Shell with Differential Spin
      const cloudsGeo = new THREE.SphereGeometry(radius * 1.012, 128, 96);
      const cloudsMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
        roughness: 1.0
      });
      cloudsMat.alphaMap = loadTex('earth-clouds.jpg', false, () => TextureGenerator.createCloudsTexture(2048, 1024));

      cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
      cloudsMesh.name = 'CloudsMesh';
      cloudsMesh.rotation.z = THREE.MathUtils.degToRad(23.44);
      group.add(cloudsMesh);

      // 3. Atmospheric Outer Fresnel Rayleigh Limb Shader (Additive BackSide)
      const atmosGeo = new THREE.SphereGeometry(radius * 1.035, 96, 64);
      const atmosMat = new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color(0x5fa8ff) },
          uPower: { value: 2.8 },
          uStrength: { value: 1.25 }
        },
        vertexShader: `
          varying vec3 vN;
          varying vec3 vV;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vN = normalize(normalMatrix * normal);
            vV = normalize(-mv.xyz);
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: `
          uniform vec3 uColor;
          uniform float uPower;
          uniform float uStrength;
          varying vec3 vN;
          varying vec3 vV;
          void main() {
            float f = pow(1.0 - max(dot(vN, vV), 0.0), uPower) * uStrength;
            gl_FragColor = vec4(uColor, f);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false
      });
      atmosphereMesh = new THREE.Mesh(atmosGeo, atmosMat);
      atmosphereMesh.rotation.z = THREE.MathUtils.degToRad(23.44);
      group.add(atmosphereMesh);

      // 4. Concentric Multilayer Rayleigh Atmospheric Haze Shells
      [[1.04, 0x7fc6ff, 0.08], [1.08, 0x9ad0ff, 0.05], [1.12, 0xb6c8ff, 0.032], [1.16, 0xc9b6ff, 0.02]].forEach(([rScale, col, op]) => {
        const sGeo = new THREE.SphereGeometry(radius * rScale, 48, 32);
        const sMat = new THREE.MeshBasicMaterial({
          color: col,
          transparent: true,
          opacity: op,
          side: THREE.BackSide,
          depthWrite: false
        });
        const s = new THREE.Mesh(sGeo, sMat);
        group.add(s);
      });

    } else if (planetType === 'moon') {
      const moonGeo = new THREE.SphereGeometry(radius, 128, 96);
      const moonMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.95,
        metalness: 0.02
      });
      moonMat.map = loadTex('moon.jpg', true, () => TextureGenerator.createMoonTexture(1024, 512));
      moonMat.bumpMap = loadTex('earth-bump.jpg', false);
      moonMat.bumpScale = 2.2;
      planetMesh = new THREE.Mesh(moonGeo, moonMat);
      planetMesh.name = 'PlanetMesh';
      group.add(planetMesh);

    } else if (planetType === 'mars') {
      const marsGeo = new THREE.SphereGeometry(radius, 128, 96);
      const marsMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.85,
        metalness: 0.06
      });
      marsMat.map = loadTex('mars.jpg', true, () => TextureGenerator.createMarsTexture(1024, 512));
      marsMat.bumpMap = loadTex('earth-bump.jpg', false);
      marsMat.bumpScale = 1.8;
      planetMesh = new THREE.Mesh(marsGeo, marsMat);
      planetMesh.name = 'PlanetMesh';
      group.add(planetMesh);

      // Mars thin reddish atmospheric haze
      const hazeGeo = new THREE.SphereGeometry(radius * 1.025, 48, 32);
      const hazeMat = new THREE.ShaderMaterial({
        vertexShader: `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vNormal;
          void main() {
            float intensity = pow(0.60 - dot(vNormal, vec3(0, 0, 1.0)), 2.2);
            gl_FragColor = vec4(0.95, 0.45, 0.25, 1.0) * intensity;
          }
        `,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false
      });
      group.add(new THREE.Mesh(hazeGeo, hazeMat));

    } else if (planetType === 'europa') {
      const europaTex = TextureGenerator.createEuropaTexture(1024, 512);
      const europaGeo = new THREE.SphereGeometry(radius, 48, 48);
      const europaMat = new THREE.MeshStandardMaterial({
        map: europaTex,
        roughness: 0.35,
        metalness: 0.2
      });
      planetMesh = new THREE.Mesh(europaGeo, europaMat);
      planetMesh.name = 'PlanetMesh';
      group.add(planetMesh);

      // Distant colossal Jupiter in background
      const jupiterTex = TextureGenerator.createJupiterTexture(1024, 512);
      const jupiterGeo = new THREE.SphereGeometry(radius * 3.5, 48, 48);
      const jupiterMat = new THREE.MeshStandardMaterial({
        map: jupiterTex,
        roughness: 0.7
      });
      const jupiterMesh = new THREE.Mesh(jupiterGeo, jupiterMat);
      jupiterMesh.position.set(radius * 12, radius * 3, -radius * 15);
      group.add(jupiterMesh);
    }

    return {
      group,
      planetMesh,
      cloudsMesh,
      atmosphereMesh,
      radius
    };
  }

  /**
   * Deep space skybox with realistic star distribution and spectral star temperatures
   */
  static createStarfield(count = 2500, radius = 500) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Uniform spherical distribution
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = radius * (0.85 + Math.random() * 0.15);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // Star color temperatures (blue-white, yellow, reddish)
      const roll = Math.random();
      if (roll > 0.85) {
        colors[i * 3] = 0.7; colors[i * 3 + 1] = 0.85; colors[i * 3 + 2] = 1.0; // O/B class Blue-White
      } else if (roll > 0.70) {
        colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.95; colors[i * 3 + 2] = 0.7; // G class Yellow
      } else if (roll > 0.60) {
        colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.6; colors[i * 3 + 2] = 0.5; // M class Red Giant
      } else {
        colors[i * 3] = 0.95; colors[i * 3 + 1] = 0.95; colors[i * 3 + 2] = 1.0; // White
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 1.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.9
    });

    return new THREE.Points(geometry, material);
  }

  /**
   * Surface Target Beacon with 3D Holographic Cylinder and Ground Rings
   */
  static createTargetBeacon(lat, lon, planetRadius, label = 'TARGET') {
    const group = new THREE.Group();
    group.name = `TargetBeacon_${label}`;

    // Spherical to Cartesian coordinates
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -planetRadius * Math.sin(phi) * Math.cos(theta);
    const z = planetRadius * Math.sin(phi) * Math.sin(theta);
    const y = planetRadius * Math.cos(phi);

    group.position.set(x, y, z);
    group.lookAt(0, 0, 0); // Orient normal to planet surface

    // Ground target ring
    const ringGeo = new THREE.RingGeometry(0.8, 1.2, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xec4899,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    group.add(ring);

    // Holographic vertical beacon cylinder
    const beaconGeo = new THREE.CylinderGeometry(0.08, 0.4, 5.0, 16, 1, true);
    beaconGeo.rotateX(Math.PI / 2);
    beaconGeo.translate(0, 0, -2.5);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: 0xec4899,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide
    });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    group.add(beacon);

    return {
      group,
      position: new THREE.Vector3(x, y, z),
      scanned: false,
      label
    };
  }

  /**
   * Ground Station radar dish
   */
  static createGroundStation(lat, lon, planetRadius, label = 'DSN-1') {
    const group = new THREE.Group();

    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -planetRadius * Math.sin(phi) * Math.cos(theta);
    const z = planetRadius * Math.sin(phi) * Math.sin(theta);
    const y = planetRadius * Math.cos(phi);

    group.position.set(x, y, z);
    group.lookAt(0, 0, 0);

    // Radar dish
    const dishGeo = new THREE.SphereGeometry(0.6, 16, 8, 0, Math.PI * 2, 0, Math.PI / 3);
    const dishMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.3,
      metalness: 0.8
    });
    const dish = new THREE.Mesh(dishGeo, dishMat);
    dish.position.set(0, 0, -0.6);
    dish.rotateX(Math.PI);
    group.add(dish);

    return {
      group,
      position: new THREE.Vector3(x, y, z),
      label
    };
  }

  /**
   * Real-Life 3D Launch Pad Complex (Launch Umbilical Tower, Mount, Umbilical Arms & Flame Trench)
   */
  static createLaunchPad(lat, lon, planetRadius, siteInfo = {}) {
    const group = new THREE.Group();
    group.name = `LaunchPad_${siteInfo.id || 'Complex'}`;

    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -planetRadius * Math.sin(phi) * Math.cos(theta);
    const z = planetRadius * Math.sin(phi) * Math.sin(theta);
    const y = planetRadius * Math.cos(phi);

    group.position.set(x, y, z);
    group.lookAt(0, 0, 0);

    // 1. Concrete Launch Table / Mount
    const mountGeo = new THREE.CylinderGeometry(1.4, 1.8, 0.4, 24);
    mountGeo.rotateX(Math.PI / 2);
    const mountMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.85,
      metalness: 0.2
    });
    const mount = new THREE.Mesh(mountGeo, mountMat);
    group.add(mount);

    // 2. Launch Umbilical Tower (LUT) Red Steel Truss Lattice
    const towerHeight = 9.5;
    const towerGeo = new THREE.BoxGeometry(0.7, 0.7, towerHeight);
    towerGeo.rotateX(Math.PI / 2);
    towerGeo.translate(1.5, 0, -towerHeight / 2);
    const towerMat = new THREE.MeshStandardMaterial({
      color: 0xb91c1c, // NASA KSC Tower Red
      roughness: 0.5,
      metalness: 0.5
    });
    const tower = new THREE.Mesh(towerGeo, towerMat);
    group.add(tower);

    // 3. Umbilical Swing Arms
    [-2.2, 0.5, 3.2].forEach(zOffset => {
      const armGeo = new THREE.BoxGeometry(1.2, 0.18, 0.18);
      armGeo.rotateZ(0.15);
      const armMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.4 });
      const arm = new THREE.Mesh(armGeo, armMat);
      arm.position.set(0.9, 0, -towerHeight / 2 + zOffset);
      group.add(arm);
    });

    // 4. Flame Trench Opening at base
    const trenchGeo = new THREE.BoxGeometry(1.5, 0.9, 0.35);
    trenchGeo.rotateX(Math.PI / 2);
    const trenchMat = new THREE.MeshBasicMaterial({ color: 0x090d16 });
    const trench = new THREE.Mesh(trenchGeo, trenchMat);
    trench.position.set(0, 0, -0.15);
    group.add(trench);

    // 5. High-intensity Pad Floodlight Spot
    const padLight = new THREE.PointLight(0xffedd5, 2.8, 18);
    padLight.position.set(2.0, 0, -4.0);
    group.add(padLight);

    return {
      group,
      position: new THREE.Vector3(x, y, z),
      lat,
      lon,
      siteInfo
    };
  }

  /**
   * Terrestrial Atmospheric Ground Launch Environment ("Inside Earth")
   * Features concrete launch apron, crawlerway, Cape Canaveral coastal terrain,
   * red steel Launch Umbilical Tower (LUT) with swing arms, 4 lightning masts,
   * flame trench with deflector wedge, water deluge piping, and atmospheric clouds.
   */
  static createTerrestrialGroundEnvironment(siteInfo = {}) {
    const group = new THREE.Group();
    group.name = `GroundEnv_${siteInfo.id || 'Terrestrial'}`;

    // 1. Vast Terrestrial Landscape (Coastal Launch Site / Cape Canaveral)
    const terrainGeo = new THREE.PlaneGeometry(5000, 5000, 16, 16);
    terrainGeo.rotateX(-Math.PI / 2);
    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x193819, // Coastal marsh green
      roughness: 0.95,
      metalness: 0.05
    });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.position.y = 0;
    terrain.receiveShadow = true;
    group.add(terrain);

    // 1b. Atlantic Ocean / Coastal Water Basin along Eastern horizon
    const oceanGeo = new THREE.PlaneGeometry(2400, 5000);
    oceanGeo.rotateX(-Math.PI / 2);
    const oceanMat = new THREE.MeshStandardMaterial({
      color: 0x0369a1, // Deep coastal Atlantic blue
      roughness: 0.25,
      metalness: 0.35
    });
    const ocean = new THREE.Mesh(oceanGeo, oceanMat);
    ocean.position.set(1500, -0.4, 0);
    group.add(ocean);

    // 1c. Dual Heavy Crawlerway Track leading to VAB
    const crawlerGeo = new THREE.BoxGeometry(24, 0.35, 1100);
    const crawlerMat = new THREE.MeshStandardMaterial({
      color: 0x64748b, // Crushed river gravel
      roughness: 0.9,
      metalness: 0.1
    });
    const crawlerway = new THREE.Mesh(crawlerGeo, crawlerMat);
    crawlerway.position.set(0, 0.18, 550);
    group.add(crawlerway);

    // 2. Concrete Launch Apron (Octagonal Pad)
    const apronGeo = new THREE.CylinderGeometry(40, 44, 2.2, 8);
    const apronMat = new THREE.MeshStandardMaterial({
      color: 0x475569, // High-strength reinforced concrete
      roughness: 0.85,
      metalness: 0.15
    });
    const apron = new THREE.Mesh(apronGeo, apronMat);
    apron.position.set(0, 1.1, 0);
    group.add(apron);

    // 2b. Yellow Safety Perimeter Stripe Ring
    const stripeGeo = new THREE.RingGeometry(38.5, 40.2, 32);
    stripeGeo.rotateX(-Math.PI / 2);
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xeab308, side: THREE.DoubleSide });
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.position.set(0, 2.22, 0);
    group.add(stripe);

    // 3. Heavy Octagonal Launch Mount Table
    const mountGeo = new THREE.CylinderGeometry(8.5, 9.8, 2.8, 8);
    const mountMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // Industrial slate steel
      roughness: 0.65,
      metalness: 0.5
    });
    const mount = new THREE.Mesh(mountGeo, mountMat);
    mount.position.set(0, 3.4, 0);
    group.add(mount);

    // 3b. Flame Trench Opening & Blast Deflector Wedge
    const trenchGeo = new THREE.BoxGeometry(5.2, 3.2, 16.0);
    const trenchMat = new THREE.MeshBasicMaterial({ color: 0x090d16 }); // Deep scorch black
    const trench = new THREE.Mesh(trenchGeo, trenchMat);
    trench.position.set(0, 1.6, 0);
    group.add(trench);

    // Dual-slope flame deflector wedge
    const wedgeGeo = new THREE.ConeGeometry(3.2, 2.6, 4);
    wedgeGeo.rotateY(Math.PI / 4);
    const wedgeMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
    const wedge = new THREE.Mesh(wedgeGeo, wedgeMat);
    wedge.position.set(0, 1.3, 0);
    group.add(wedge);

    // 3c. Industrial Red Water Deluge Sound Suppression Manifolds
    const delugeGeo = new THREE.TorusGeometry(8.8, 0.28, 8, 24);
    delugeGeo.rotateX(Math.PI / 2);
    const delugeMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4 });
    const deluge = new THREE.Mesh(delugeGeo, delugeMat);
    deluge.position.set(0, 3.6, 0);
    group.add(deluge);

    // 4. Launch Umbilical Tower (LUT) Red Steel Lattice Structure
    const lutGroup = new THREE.Group();
    lutGroup.position.set(7.2, 0, 0);

    const lutHeight = 68.0;
    const colGeo = new THREE.BoxGeometry(0.5, lutHeight, 0.5);
    const lutMat = new THREE.MeshStandardMaterial({
      color: 0xb91c1c, // NASA LC-39A Red
      roughness: 0.55,
      metalness: 0.45
    });

    // 4 Corner Vertical Columns
    const halfW = 2.4;
    [
      [-halfW, -halfW],
      [halfW, -halfW],
      [-halfW, halfW],
      [halfW, halfW]
    ].forEach(([cx, cz]) => {
      const col = new THREE.Mesh(colGeo, lutMat);
      col.position.set(cx, lutHeight / 2 + 2.2, cz);
      lutGroup.add(col);
    });

    // Horizontal Catwalk Platforms & Cross Struts
    const swingArms = [];
    for (let y = 10; y <= 62; y += 8) {
      // Platform floor
      const platGeo = new THREE.BoxGeometry(halfW * 2 + 0.6, 0.4, halfW * 2 + 0.6);
      const platMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
      const plat = new THREE.Mesh(platGeo, platMat);
      plat.position.set(0, y, 0);
      lutGroup.add(plat);

      // Yellow safety railing
      const railGeo = new THREE.BoxGeometry(halfW * 2 + 0.5, 0.8, halfW * 2 + 0.5);
      const railMat = new THREE.MeshStandardMaterial({ color: 0xeab308, wireframe: true });
      const rail = new THREE.Mesh(railGeo, railMat);
      rail.position.set(0, y + 0.6, 0);
      lutGroup.add(rail);

      // Umbilical Swing Arms extending towards rocket center (x = -7.2 from LUT frame)
      if (y === 10 || y === 34 || y === 50) {
        const armPivot = new THREE.Group();
        armPivot.position.set(-halfW, y + 0.3, 0);

        const armBeamGeo = new THREE.BoxGeometry(5.2, 0.5, 0.5);
        armBeamGeo.translate(-2.6, 0, 0);
        const armBeamMat = new THREE.MeshStandardMaterial({
          color: (y === 50) ? 0xf8fafc : 0x94a3b8, // White for crew arm, gray for fueling
          roughness: 0.4
        });
        const armBeam = new THREE.Mesh(armBeamGeo, armBeamMat);
        armPivot.add(armBeam);

        // Umbilical hose bundle
        const hoseGeo = new THREE.CylinderGeometry(0.12, 0.12, 5.0, 8);
        hoseGeo.rotateZ(Math.PI / 2);
        hoseGeo.translate(-2.5, -0.3, 0);
        const hoseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
        const hose = new THREE.Mesh(hoseGeo, hoseMat);
        armPivot.add(hose);

        lutGroup.add(armPivot);
        swingArms.push(armPivot);
      }
    }

    // Rooftop Hammerhead Crane Derrick & Lightning Spire
    const craneGeo = new THREE.BoxGeometry(10.0, 1.2, 1.2);
    const crane = new THREE.Mesh(craneGeo, lutMat);
    crane.position.set(-1.0, lutHeight + 2.8, 0);
    lutGroup.add(crane);

    const spireGeo = new THREE.ConeGeometry(0.35, 14.0, 8);
    const spireMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8 });
    const spire = new THREE.Mesh(spireGeo, spireMat);
    spire.position.set(0, lutHeight + 9.0, 0);
    lutGroup.add(spire);

    // Red Blinking Aviation Obstruction Beacon on top of LUT
    const beaconLight = new THREE.PointLight(0xef4444, 2.5, 250);
    beaconLight.position.set(0, lutHeight + 16.0, 0);
    const beaconMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xef4444 })
    );
    beaconLight.add(beaconMesh);
    lutGroup.add(beaconLight);

    group.add(lutGroup);

    // 5. Four Tall Lightning Protection Pylons around Pad Perimeter
    const pylonDist = 32.0;
    const pylonHeight = 55.0;
    const pylons = [
      [-pylonDist, -pylonDist],
      [pylonDist, -pylonDist],
      [-pylonDist, pylonDist],
      [pylonDist, pylonDist]
    ];

    pylons.forEach(([px, pz]) => {
      const pylonGeo = new THREE.CylinderGeometry(0.35, 1.4, pylonHeight, 8);
      const pylonMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7 });
      const pylon = new THREE.Mesh(pylonGeo, pylonMat);
      pylon.position.set(px, pylonHeight / 2, pz);
      group.add(pylon);

      // Warning beacon light on each lightning mast
      const pylonBeacon = new THREE.PointLight(0xef4444, 1.2, 120);
      pylonBeacon.position.set(px, pylonHeight + 0.5, pz);
      const pBeaconMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xef4444 })
      );
      pylonBeacon.add(pBeaconMesh);
      group.add(pylonBeacon);
    });

    // 6. High-Intensity Stadium Floodlight Banks
    const floodlightSpots = [];
    [
      { x: -25, z: 25 },
      { x: 25, z: 25 },
      { x: -25, z: -25 },
      { x: 25, z: -25 }
    ].forEach(fPos => {
      const floodPoleGeo = new THREE.CylinderGeometry(0.25, 0.45, 18.0, 8);
      const floodPoleMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
      const floodPole = new THREE.Mesh(floodPoleGeo, floodPoleMat);
      floodPole.position.set(fPos.x, 9.0, fPos.z);
      group.add(floodPole);

      // Spotlight aimed at rocket
      const spot = new THREE.SpotLight(0xfffaed, 2.4, 90, Math.PI / 4, 0.4);
      spot.position.set(fPos.x, 18.0, fPos.z);
      spot.target.position.set(0, 15.0, 0);
      group.add(spot);
      group.add(spot.target);
      floodlightSpots.push(spot);
    });

    // 7. Atmospheric Cumulus Clouds Layer in Sky (height 280-420m)
    const cloudsGroup = new THREE.Group();
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
      metalness: 0.05,
      transparent: true,
      opacity: 0.75
    });

    for (let c = 0; c < 18; c++) {
      const cx = (Math.random() - 0.5) * 2200;
      const cz = (Math.random() - 0.5) * 2200;
      const cy = 280 + Math.random() * 120;
      const cSize = 60 + Math.random() * 100;

      const puffGeo = new THREE.DodecahedronGeometry(cSize, 1);
      const puff = new THREE.Mesh(puffGeo, cloudMat);
      puff.position.set(cx, cy, cz);
      puff.scale.set(1.8, 0.55, 1.3);
      cloudsGroup.add(puff);
    }
    group.add(cloudsGroup);

    // 8. Distant VAB (Vehicle Assembly Building) silhouette
    const vabGeo = new THREE.BoxGeometry(160, 120, 130);
    const vabMat = new THREE.MeshStandardMaterial({ color: 0xdbeafe, roughness: 0.7 });
    const vab = new THREE.Mesh(vabGeo, vabMat);
    vab.position.set(-650, 60, 850);
    group.add(vab);

    // 9. Curved Earth Limb Horizon (Appears during High-Altitude Ascent > 60 km)
    // A gigantic sphere positioned far beneath the launch corridor creating the astronaut curved-Earth view
    const limbRadius = 2400.0;
    const limbGeo = new THREE.SphereGeometry(limbRadius, 48, 36);
    const limbMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a, // Deep blue ocean with continent tones
      roughness: 0.6,
      metalness: 0.2
    });
    const curvedEarthLimb = new THREE.Mesh(limbGeo, limbMat);
    // Position sphere center so its northern crown is at y = -limbRadius + 10
    curvedEarthLimb.position.set(0, -limbRadius, 0);
    curvedEarthLimb.visible = false; // Turned visible when climbing past 60 km
    group.add(curvedEarthLimb);

    return {
      group,
      lutGroup,
      swingArms,
      curvedEarthLimb,
      cloudsGroup,
      beaconLight,
      siteInfo,
      retractArms: (progress) => {
        swingArms.forEach((arm, i) => {
          arm.rotation.y = THREE.MathUtils.lerp(0, Math.PI * 0.45, progress);
        });
      }
    };
  }

  /**
   * Helper: High-Contrast Holographic 3D Billboard Label Sprite
   */
  static createBillboardLabel(text, color = '#38bdf8', fontSize = 24, bg = 'rgba(15, 23, 42, 0.85)') {
    const canvas = document.createElement('canvas');
    canvas.width = 384;
    canvas.height = 72;
    const ctx = canvas.getContext('2d');

    // Rounded tag background
    ctx.fillStyle = bg;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(4, 4, 376, 64, 10);
    ctx.fill();
    ctx.stroke();

    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${fontSize}px "SF Mono", Consolas, monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 192, 36);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(14, 2.6, 1);
    return sprite;
  }

  /**
   * Complete Realistic 3D Solar System Orrery
   * Central Sun with pulsing corona, all 8 major planets + Pluto, orbital rings,
   * moons, rings of Saturn & Uranus, and the Main Asteroid Belt!
   */
  static createFullSolarSystem() {
    const group = new THREE.Group();
    group.name = 'FullSolarSystem';

    // 1. The Central Sun
    const sunRadius = 18.0;
    const sunGeo = new THREE.SphereGeometry(sunRadius, 48, 48);
    const sunTex = TextureGenerator.createSunTexture(1024, 512);
    const sunMat = new THREE.MeshBasicMaterial({ map: sunTex });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.name = 'TheSun';
    group.add(sunMesh);

    // Glowing Solar Corona Shader Atmosphere
    const coronaGeo = new THREE.SphereGeometry(sunRadius * 1.25, 32, 32);
    const coronaMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.72 - dot(vNormal, vec3(0, 0, 1.0)), 2.2);
          gl_FragColor = vec4(1.0, 0.74, 0.24, 1.0) * intensity * 2.2;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    group.add(new THREE.Mesh(coronaGeo, coronaMat));

    // High-Intensity Point Light Illuminating All Planets
    const sunLight = new THREE.PointLight(0xfffaed, 3.8, 3500, 0.05);
    group.add(sunLight);

    const sunLabel = Planet3DBuilder.createBillboardLabel('☉ THE SUN', '#fbbf24', 26);
    sunLabel.position.set(0, sunRadius + 6, 0);
    sunMesh.add(sunLabel);

    // 2. Planets Specifications
    const planetDefs = [
      {
        id: 'mercury',
        name: '☿ MERCURY',
        semiMajor: 52,
        radius: 3.2,
        eccentricity: 0.205,
        period: 22,
        rotSpeed: 0.008,
        inclination: 0.12,
        color: '#a1a1aa',
        texture: () => TextureGenerator.createMercuryTexture(1024, 512),
        moons: []
      },
      {
        id: 'venus',
        name: '♀ VENUS',
        semiMajor: 85,
        radius: 5.6,
        eccentricity: 0.007,
        period: 38,
        rotSpeed: -0.004,
        inclination: 0.06,
        color: '#fde047',
        texture: () => TextureGenerator.createVenusTexture(1024, 512),
        moons: []
      },
      {
        id: 'earth',
        name: '♁ EARTH',
        semiMajor: 135,
        radius: 6.2,
        eccentricity: 0.017,
        period: 58,
        rotSpeed: 0.02,
        inclination: 0.0,
        color: '#38bdf8',
        texture: () => TextureGenerator.createEarthTexture(2048, 1024),
        cloudsTexture: () => TextureGenerator.createCloudsTexture(2048, 1024),
        moons: [
          { name: 'Moon', radius: 1.6, dist: 14, period: 12, color: '#94a3b8', texture: () => TextureGenerator.createMoonTexture(512, 256) }
        ]
      },
      {
        id: 'mars',
        name: '♂ MARS',
        semiMajor: 195,
        radius: 4.4,
        eccentricity: 0.093,
        period: 88,
        rotSpeed: 0.019,
        inclination: 0.03,
        color: '#f97316',
        texture: () => TextureGenerator.createMarsTexture(1024, 512),
        moons: [
          { name: 'Phobos', radius: 0.45, dist: 7.5, period: 3.5, color: '#71717a' },
          { name: 'Deimos', radius: 0.35, dist: 12.0, period: 7.0, color: '#71717a' }
        ]
      },
      {
        id: 'jupiter',
        name: '♃ JUPITER',
        semiMajor: 360,
        radius: 14.5,
        eccentricity: 0.048,
        period: 150,
        rotSpeed: 0.04,
        inclination: 0.02,
        color: '#f59e0b',
        texture: () => TextureGenerator.createJupiterTexture(1024, 512),
        moons: [
          { name: 'Io', radius: 1.2, dist: 22, period: 5.5, color: '#facc15' },
          { name: 'Europa', radius: 1.1, dist: 28, period: 9.0, color: '#e0f2fe', texture: () => TextureGenerator.createEuropaTexture(512, 256) },
          { name: 'Ganymede', radius: 1.8, dist: 36, period: 15.0, color: '#94a3b8' },
          { name: 'Callisto', radius: 1.6, dist: 46, period: 22.0, color: '#64748b' }
        ]
      },
      {
        id: 'saturn',
        name: '♄ SATURN',
        semiMajor: 500,
        radius: 12.0,
        eccentricity: 0.054,
        period: 230,
        rotSpeed: 0.038,
        inclination: 0.04,
        color: '#eab308',
        texture: () => TextureGenerator.createSaturnTexture(1024, 512),
        hasRings: true,
        moons: [
          { name: 'Titan', radius: 2.2, dist: 36, period: 16.0, color: '#f97316' },
          { name: 'Enceladus', radius: 0.7, dist: 20, period: 6.0, color: '#f8fafc' }
        ]
      },
      {
        id: 'uranus',
        name: '♅ URANUS',
        semiMajor: 640,
        radius: 8.5,
        eccentricity: 0.047,
        period: 320,
        rotSpeed: -0.025,
        inclination: 0.01,
        color: '#38bdf8',
        texture: () => TextureGenerator.createUranusTexture(1024, 512),
        hasVerticalRings: true,
        moons: [
          { name: 'Titania', radius: 1.1, dist: 22, period: 14.0, color: '#cbd5e1' }
        ]
      },
      {
        id: 'neptune',
        name: '♆ NEPTUNE',
        semiMajor: 780,
        radius: 8.2,
        eccentricity: 0.009,
        period: 410,
        rotSpeed: 0.028,
        inclination: 0.03,
        color: '#2563eb',
        texture: () => TextureGenerator.createNeptuneTexture(1024, 512),
        moons: [
          { name: 'Triton', radius: 1.5, dist: 24, period: -11.0, color: '#93c5fd' }
        ]
      },
      {
        id: 'pluto',
        name: '⯓ PLUTO (KUIPER)',
        semiMajor: 910,
        radius: 2.4,
        eccentricity: 0.244,
        period: 500,
        rotSpeed: 0.008,
        inclination: 0.28,
        color: '#b45309',
        texture: () => TextureGenerator.createMoonTexture(512, 256),
        moons: [
          { name: 'Charon', radius: 1.1, dist: 6.5, period: 7.5, color: '#78716c' }
        ]
      }
    ];

    const planetObjects = [];

    planetDefs.forEach(p => {
      const pGroup = new THREE.Group();
      pGroup.name = `Planet_${p.id}`;

      // 2a. Orbital Path Ellipse Line around the Sun
      const orbitSegments = 128;
      const orbitPts = [];
      const b = p.semiMajor * Math.sqrt(1 - p.eccentricity * p.eccentricity);
      const focusOffset = p.semiMajor * p.eccentricity;

      for (let i = 0; i <= orbitSegments; i++) {
        const theta = (i / orbitSegments) * Math.PI * 2;
        const ox = p.semiMajor * Math.cos(theta) - focusOffset;
        const oz = b * Math.sin(theta);
        const oy = Math.sin(theta) * (p.semiMajor * Math.sin(p.inclination));
        orbitPts.push(new THREE.Vector3(ox, oy, oz));
      }

      const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPts);
      const orbitMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(p.color),
        transparent: true,
        opacity: 0.45,
        linewidth: 1.5
      });
      const orbitLine = new THREE.Line(orbitGeo, orbitMat);
      group.add(orbitLine);

      // 2b. Planet Sphere Mesh
      const pGeo = new THREE.SphereGeometry(p.radius, 40, 40);
      const pMat = new THREE.MeshStandardMaterial({
        map: p.texture(),
        roughness: 0.7,
        metalness: 0.1
      });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      pGroup.add(pMesh);

      // Clouds (for Earth)
      if (p.cloudsTexture) {
        const cGeo = new THREE.SphereGeometry(p.radius * 1.018, 36, 36);
        const cMat = new THREE.MeshStandardMaterial({
          map: p.cloudsTexture(),
          transparent: true,
          opacity: 0.75,
          roughness: 0.95
        });
        const cMesh = new THREE.Mesh(cGeo, cMat);
        pGroup.add(cMesh);
        pGroup.userData.cloudsMesh = cMesh;
      }

      // Rings (for Saturn)
      if (p.hasRings) {
        const ringGeo = new THREE.RingGeometry(p.radius * 1.35, p.radius * 2.5, 64);
        ringGeo.rotateX(Math.PI / 2);
        const ringTex = TextureGenerator.createSaturnRingsTexture(1024, 64);
        const ringMat = new THREE.MeshStandardMaterial({
          map: ringTex,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.95,
          roughness: 0.6
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.z = 0.46; // 26.7 deg axial tilt
        pGroup.add(ringMesh);
      }

      // Vertical Rings (for Uranus)
      if (p.hasVerticalRings) {
        const ringGeo = new THREE.RingGeometry(p.radius * 1.25, p.radius * 1.85, 48);
        const ringMat = new THREE.MeshStandardMaterial({
          color: 0x7dd3fc,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.45,
          roughness: 0.6
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2;
        ringMesh.rotation.y = 1.45; // ~98 deg tilt
        pGroup.add(ringMesh);
      }

      // 2c. Planet Moons
      const moonObjects = [];
      p.moons.forEach(m => {
        const mGeo = new THREE.SphereGeometry(m.radius, 20, 20);
        const mMat = new THREE.MeshStandardMaterial({
          map: m.texture ? m.texture() : null,
          color: m.texture ? 0xffffff : new THREE.Color(m.color),
          roughness: 0.8
        });
        const mMesh = new THREE.Mesh(mGeo, mMat);
        pGroup.add(mMesh);
        moonObjects.push({
          mesh: mMesh,
          dist: m.dist,
          period: m.period,
          angle: Math.random() * Math.PI * 2
        });
      });

      // 2d. 3D Billboard Label
      const pLabel = Planet3DBuilder.createBillboardLabel(p.name, p.color, 22);
      pLabel.position.set(0, p.radius + 4.5, 0);
      pGroup.add(pLabel);

      group.add(pGroup);

      planetObjects.push({
        id: p.id,
        name: p.name,
        group: pGroup,
        mesh: pMesh,
        semiMajor: p.semiMajor,
        eccentricity: p.eccentricity,
        period: p.period,
        rotSpeed: p.rotSpeed,
        inclination: p.inclination,
        angle: Math.random() * Math.PI * 2,
        moons: moonObjects
      });
    });

    // 3. Main Asteroid Belt (Between Mars & Jupiter: dist 235 - 285)
    const asteroidBeltGroup = new THREE.Group();
    asteroidBeltGroup.name = 'MainAsteroidBelt';
    const astMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.9, metalness: 0.1 });
    const asteroidCount = 190;
    const asteroids = [];

    for (let a = 0; a < asteroidCount; a++) {
      const dist = 235 + Math.random() * 55;
      const angle = Math.random() * Math.PI * 2;
      const yOffset = (Math.random() - 0.5) * 16;
      const size = 0.5 + Math.random() * 1.6;

      const astGeo = new THREE.DodecahedronGeometry(size, 0);
      const astMesh = new THREE.Mesh(astGeo, astMat);
      astMesh.position.set(Math.cos(angle) * dist, yOffset, Math.sin(angle) * dist);
      astMesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      asteroidBeltGroup.add(astMesh);

      asteroids.push({
        mesh: astMesh,
        dist,
        angle,
        speed: 0.018 / Math.sqrt(dist / 100),
        yOffset,
        rotSpeed: (Math.random() - 0.5) * 0.03
      });
    }

    // Dwarf Planet Ceres in Asteroid Belt
    const ceresGeo = new THREE.SphereGeometry(1.6, 24, 24);
    const ceresMat = new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.85 });
    const ceresMesh = new THREE.Mesh(ceresGeo, ceresMat);
    ceresMesh.position.set(258, 2, 0);
    asteroidBeltGroup.add(ceresMesh);
    const ceresLabel = Planet3DBuilder.createBillboardLabel('⚳ CERES (ASTEROID BELT)', '#ca8a04', 18);
    ceresLabel.position.set(0, 3.5, 0);
    ceresMesh.add(ceresLabel);

    group.add(asteroidBeltGroup);

    return {
      group,
      sunMesh,
      planets: planetObjects,
      asteroids,
      update: (dt, speedWarp = 1.0) => {
        const effectiveDt = dt * speedWarp;

        // Rotate Sun
        sunMesh.rotation.y += 0.005 * effectiveDt;

        // Propagate planets
        planetObjects.forEach(p => {
          p.angle += (Math.PI * 2 / p.period) * effectiveDt * 0.4;
          const b = p.semiMajor * Math.sqrt(1 - p.eccentricity * p.eccentricity);
          const focusOffset = p.semiMajor * p.eccentricity;
          const px = p.semiMajor * Math.cos(p.angle) - focusOffset;
          const pz = b * Math.sin(p.angle);
          const py = Math.sin(p.angle) * (p.semiMajor * Math.sin(p.inclination));

          p.group.position.set(px, py, pz);
          p.mesh.rotation.y += p.rotSpeed * effectiveDt * 10;

          if (p.group.userData.cloudsMesh) {
            p.group.userData.cloudsMesh.rotation.y += p.rotSpeed * effectiveDt * 12;
          }

          // Moons
          p.moons.forEach(m => {
            m.angle += (Math.PI * 2 / m.period) * effectiveDt * 0.8;
            m.mesh.position.set(Math.cos(m.angle) * m.dist, 0, Math.sin(m.angle) * m.dist);
          });
        });

        // Asteroids revolution
        asteroids.forEach(a => {
          a.angle += a.speed * effectiveDt;
          a.mesh.position.set(Math.cos(a.angle) * a.dist, a.yOffset, Math.sin(a.angle) * a.dist);
          a.mesh.rotation.y += a.rotSpeed * effectiveDt * 10;
        });
      }
    };
  }

  /**
   * Astronomical Constellations & Celestial Sphere
   * Renders 12 iconic constellations with authentic star coordinates, spectral colors,
   * luminous stick-figure lines, 3D typography badges, and the Milky Way galactic core.
   */
  static createConstellations(radius = 1400) {
    const group = new THREE.Group();
    group.name = 'ConstellationsGroup';

    // Helper to map Right Ascension (hours: 0..24) and Declination (deg: -90..+90) to 3D Cartesian
    const raDecToVec = (raHours, decDeg, r = radius) => {
      const alpha = (raHours / 24) * Math.PI * 2;
      const delta = (decDeg / 180) * Math.PI;
      const x = r * Math.cos(delta) * Math.cos(alpha);
      const y = r * Math.sin(delta);
      const z = r * Math.cos(delta) * Math.sin(alpha);
      return new THREE.Vector3(x, y, z);
    };

    // 12 Real Astronomical Constellations with major stars and line connections
    const constellationsData = [
      {
        name: '✦ ORION (THE HUNTER)',
        color: '#38bdf8',
        stars: [
          { name: 'Betelgeuse', ra: 5.92, dec: 7.41, color: '#ef4444', size: 4.5 }, // Red Supergiant
          { name: 'Bellatrix', ra: 5.42, dec: 6.35, color: '#93c5fd', size: 3.5 },
          { name: 'Alnitak', ra: 5.68, dec: -1.94, color: '#60a5fa', size: 3.2 },
          { name: 'Alnilam', ra: 5.60, dec: -1.20, color: '#60a5fa', size: 3.4 },
          { name: 'Mintaka', ra: 5.53, dec: -0.30, color: '#60a5fa', size: 3.2 },
          { name: 'Saiph', ra: 5.79, dec: -9.67, color: '#93c5fd', size: 3.2 },
          { name: 'Rigel', ra: 5.24, dec: -8.20, color: '#60a5fa', size: 4.5 } // Blue Supergiant
        ],
        lines: [
          [0, 1], // Betelgeuse -> Bellatrix
          [1, 4], // Bellatrix -> Mintaka
          [4, 3], // Mintaka -> Alnilam (Belt)
          [3, 2], // Alnilam -> Alnitak (Belt)
          [2, 5], // Alnitak -> Saiph
          [5, 6], // Saiph -> Rigel
          [6, 4], // Rigel -> Mintaka
          [0, 2]  // Betelgeuse -> Alnitak
        ],
        labelPos: { ra: 5.58, dec: 12.0 }
      },
      {
        name: '✦ URSA MAJOR (BIG DIPPER)',
        color: '#fbbf24',
        stars: [
          { name: 'Dubhe', ra: 11.06, dec: 61.75, color: '#fde047', size: 3.8 },
          { name: 'Merak', ra: 11.03, dec: 56.38, color: '#f8fafc', size: 3.5 },
          { name: 'Phecda', ra: 11.90, dec: 53.69, color: '#f8fafc', size: 3.4 },
          { name: 'Megrez', ra: 12.25, dec: 57.03, color: '#f8fafc', size: 3.0 },
          { name: 'Alioth', ra: 12.90, dec: 55.96, color: '#93c5fd', size: 3.8 },
          { name: 'Mizar', ra: 13.40, dec: 54.92, color: '#f8fafc', size: 3.5 },
          { name: 'Alkaid', ra: 13.79, dec: 49.31, color: '#60a5fa', size: 3.6 }
        ],
        lines: [
          [0, 1], [1, 2], [2, 3], [3, 0], // Dipper Bowl
          [3, 4], [4, 5], [5, 6]          // Handle
        ],
        labelPos: { ra: 12.3, dec: 66.0 }
      },
      {
        name: '✦ URSA MINOR (NORTH STAR)',
        color: '#67e8f9',
        stars: [
          { name: 'Polaris', ra: 2.53, dec: 89.26, color: '#fef08a', size: 4.8 }, // North Star
          { name: 'Yildun', ra: 17.54, dec: 86.58, color: '#f8fafc', size: 2.8 },
          { name: 'Pherkad', ra: 15.35, dec: 71.83, color: '#f8fafc', size: 3.2 },
          { name: 'Kochab', ra: 14.85, dec: 74.16, color: '#fb923c', size: 3.8 }
        ],
        lines: [
          [0, 1], [1, 2], [2, 3]
        ],
        labelPos: { ra: 4.0, dec: 84.0 }
      },
      {
        name: '✦ CASSIOPEIA',
        color: '#ec4899',
        stars: [
          { name: 'Schedar', ra: 0.67, dec: 56.54, color: '#fb923c', size: 3.8 },
          { name: 'Caph', ra: 0.15, dec: 59.15, color: '#fef08a', size: 3.6 },
          { name: 'Gamma Cas', ra: 0.94, dec: 60.72, color: '#60a5fa', size: 4.0 },
          { name: 'Ruchbah', ra: 1.43, dec: 60.23, color: '#f8fafc', size: 3.4 },
          { name: 'Segin', ra: 1.90, dec: 63.67, color: '#93c5fd', size: 3.2 }
        ],
        lines: [
          [1, 0], [0, 2], [2, 3], [3, 4] // Iconic 'W'
        ],
        labelPos: { ra: 1.0, dec: 66.0 }
      },
      {
        name: '✦ CANIS MAJOR (SIRIUS)',
        color: '#60a5fa',
        stars: [
          { name: 'Sirius', ra: 6.75, dec: -16.72, color: '#93c5fd', size: 5.5 }, // Brightest Star
          { name: 'Murzim', ra: 6.38, dec: -17.96, color: '#60a5fa', size: 3.4 },
          { name: 'Wezen', ra: 7.14, dec: -26.39, color: '#fef08a', size: 3.8 },
          { name: 'Adhara', ra: 6.98, dec: -28.97, color: '#60a5fa', size: 3.9 }
        ],
        lines: [
          [1, 0], [0, 2], [2, 3]
        ],
        labelPos: { ra: 6.8, dec: -12.0 }
      },
      {
        name: '✦ CYGNUS (NORTHERN CROSS)',
        color: '#a78bfa',
        stars: [
          { name: 'Deneb', ra: 20.69, dec: 45.28, color: '#f8fafc', size: 4.6 },
          { name: 'Sadr', ra: 20.37, dec: 40.26, color: '#fef08a', size: 3.6 },
          { name: 'Albireo', ra: 19.51, dec: 27.96, color: '#fb923c', size: 3.2 },
          { name: 'Gienah', ra: 20.77, dec: 33.97, color: '#f8fafc', size: 3.4 },
          { name: 'Fawaris', ra: 19.61, dec: 45.13, color: '#93c5fd', size: 3.2 }
        ],
        lines: [
          [0, 1], [1, 2], // Spine
          [4, 1], [1, 3]  // Cross wings
        ],
        labelPos: { ra: 20.5, dec: 50.0 }
      },
      {
        name: '✦ SCORPIUS (ANTARES)',
        color: '#ef4444',
        stars: [
          { name: 'Antares', ra: 16.49, dec: -26.43, color: '#ef4444', size: 5.0 }, // Rival of Mars
          { name: 'Graffias', ra: 16.09, dec: -19.80, color: '#60a5fa', size: 3.2 },
          { name: 'Dschubba', ra: 16.00, dec: -22.62, color: '#60a5fa', size: 3.4 },
          { name: 'Sargas', ra: 17.62, dec: -43.00, color: '#fef08a', size: 3.5 },
          { name: 'Shaula', ra: 17.56, dec: -37.10, color: '#60a5fa', size: 3.8 }
        ],
        lines: [
          [1, 2], [2, 0], [0, 4], [4, 3]
        ],
        labelPos: { ra: 16.5, dec: -32.0 }
      },
      {
        name: '✦ TAURUS & PLEIADES',
        color: '#f97316',
        stars: [
          { name: 'Aldebaran', ra: 4.60, dec: 16.51, color: '#f97316', size: 4.8 }, // Eye of the Bull
          { name: 'Elnath', ra: 5.44, dec: 28.61, color: '#60a5fa', size: 3.6 },
          { name: 'Pleiades Cluster', ra: 3.79, dec: 24.11, color: '#93c5fd', size: 4.2 }
        ],
        lines: [
          [2, 0], [0, 1]
        ],
        labelPos: { ra: 4.5, dec: 22.0 }
      },
      {
        name: '✦ LEO (THE LION)',
        color: '#eab308',
        stars: [
          { name: 'Regulus', ra: 10.14, dec: 11.97, color: '#60a5fa', size: 4.2 },
          { name: 'Denebola', ra: 11.82, dec: 14.57, color: '#f8fafc', size: 3.6 },
          { name: 'Algieba', ra: 10.33, dec: 19.84, color: '#fde047', size: 3.4 },
          { name: 'Zosma', ra: 11.24, dec: 20.52, color: '#f8fafc', size: 3.2 }
        ],
        lines: [
          [0, 2], [2, 3], [3, 1], [1, 0]
        ],
        labelPos: { ra: 10.8, dec: 25.0 }
      },
      {
        name: '✦ CRUX (SOUTHERN CROSS)',
        color: '#10b981',
        stars: [
          { name: 'Acrux', ra: 12.44, dec: -63.10, color: '#60a5fa', size: 4.4 },
          { name: 'Mimosa', ra: 12.79, dec: -59.69, color: '#60a5fa', size: 4.0 },
          { name: 'Gacrux', ra: 12.52, dec: -57.11, color: '#ef4444', size: 4.0 },
          { name: 'Imai', ra: 12.25, dec: -58.75, color: '#93c5fd', size: 3.0 }
        ],
        lines: [
          [0, 2], // Long axis
          [3, 1]  // Cross axis
        ],
        labelPos: { ra: 12.5, dec: -54.0 }
      },
      {
        name: '✦ PEGASUS (GREAT SQUARE)',
        color: '#8b5cf6',
        stars: [
          { name: 'Alpheratz', ra: 0.14, dec: 29.09, color: '#60a5fa', size: 3.8 },
          { name: 'Scheat', ra: 23.06, dec: 28.08, color: '#ef4444', size: 3.8 },
          { name: 'Markab', ra: 23.08, dec: 15.21, color: '#f8fafc', size: 3.6 },
          { name: 'Algenib', ra: 0.22, dec: 15.18, color: '#60a5fa', size: 3.5 }
        ],
        lines: [
          [0, 1], [1, 2], [2, 3], [3, 0] // Great Square
        ],
        labelPos: { ra: 23.6, dec: 22.0 }
      },
      {
        name: '✦ CENTAURUS (ALPHA CENTAURI)',
        color: '#06b6d4',
        stars: [
          { name: 'Rigil Kentaurus', ra: 14.66, dec: -60.83, color: '#fde047', size: 4.8 }, // Closest star system
          { name: 'Hadar', ra: 14.06, dec: -60.37, color: '#60a5fa', size: 4.2 }
        ],
        lines: [
          [0, 1]
        ],
        labelPos: { ra: 14.3, dec: -64.0 }
      }
    ];

    // Build Constellation Stars and Connecting Lines
    const linePositions = [];
    const lineColors = [];

    const starSphereGeo = new THREE.SphereGeometry(1, 10, 10);

    const labels = [];

    constellationsData.forEach(c => {
      const starVecs = c.stars.map(s => raDecToVec(s.ra, s.dec));

      // Star meshes with glowing core
      c.stars.forEach((s, idx) => {
        const pos = starVecs[idx];
        const sMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(s.color) });
        const sMesh = new THREE.Mesh(starSphereGeo, sMat);
        sMesh.position.copy(pos);
        sMesh.scale.setScalar(s.size);
        group.add(sMesh);

        // Soft star aura glow
        const auraGeo = new THREE.SphereGeometry(s.size * 2.2, 8, 8);
        const auraMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(s.color),
          transparent: true,
          opacity: 0.35,
          blending: THREE.AdditiveBlending
        });
        const aura = new THREE.Mesh(auraGeo, auraMat);
        aura.position.copy(pos);
        group.add(aura);
      });

      // Stick-figure lines
      const col = new THREE.Color(c.color);
      c.lines.forEach(([i1, i2]) => {
        const v1 = starVecs[i1];
        const v2 = starVecs[i2];
        linePositions.push(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z);
        lineColors.push(col.r, col.g, col.b, col.r, col.g, col.b);
      });

      // 3D Typography Label
      const labelVec = raDecToVec(c.labelPos.ra, c.labelPos.dec, radius * 0.98);
      const labelSprite = Planet3DBuilder.createBillboardLabel(c.name, c.color, 20);
      labelSprite.position.copy(labelVec);
      labelSprite.scale.set(36, 6.5, 1);
      group.add(labelSprite);
      labels.push(labelSprite);
    });

    const linesGeo = new THREE.BufferGeometry();
    linesGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    linesGeo.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));

    const linesMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      linewidth: 1.5
    });
    const constellationLines = new THREE.LineSegments(linesGeo, linesMat);
    group.add(constellationLines);

    // 2. Luminous Milky Way Galactic Core Band
    const mwGeo = new THREE.TorusGeometry(radius * 0.96, 120, 16, 96);
    mwGeo.rotateX(Math.PI * 0.35);
    mwGeo.rotateZ(Math.PI * 0.18);
    const mwMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.05,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    const mwBand = new THREE.Mesh(mwGeo, mwMat);
    group.add(mwBand);

    return {
      group,
      constellationLines,
      labels,
      setVisible: (visible) => {
        group.visible = visible;
      }
    };
  }

  /**
   * Builds an Interactive 3D Orbit Mesh & Moving Spacecraft for any Launched Mission
   */
  static createLaunchedOrbitMesh(satData, parentRadius = 18.0) {
    const group = new THREE.Group();
    group.name = `LaunchedOrbit_${satData.id}`;

    const colorHex = satData.color || '#10b981';
    const color = new THREE.Color(colorHex);
    const semiMajor = satData.semiMajorAxis || 28.0;
    const eccentricity = satData.eccentricity || 0.05;
    const inclination = satData.inclination || 0.0;
    const b = semiMajor * Math.sqrt(1 - eccentricity * eccentricity);
    const c = semiMajor * eccentricity;

    // 1. Orbital Trajectory Ellipse Line
    const segments = 96;
    const pts = [];
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const x = semiMajor * Math.cos(theta) - c;
      const z = b * Math.sin(theta);
      const y = Math.sin(theta) * (semiMajor * Math.sin(inclination));
      pts.push(new THREE.Vector3(x, y, z));
    }

    const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
    const lineMat = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.8,
      linewidth: 2
    });
    const orbitLine = new THREE.Line(lineGeo, lineMat);
    group.add(orbitLine);

    // 2. 3D Spacecraft Satellite Mesh
    const craftGroup = new THREE.Group();
    const busGeo = new THREE.BoxGeometry(0.7, 0.7, 0.9);
    const busMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24, // Gold thermal MLI foil
      roughness: 0.3,
      metalness: 0.8
    });
    const bus = new THREE.Mesh(busGeo, busMat);
    craftGroup.add(bus);

    // Deployable Solar Wings
    [-1.2, 1.2].forEach(xOff => {
      const wingGeo = new THREE.BoxGeometry(1.4, 0.06, 0.7);
      const wingMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.2 });
      const wing = new THREE.Mesh(wingGeo, wingMat);
      wing.position.set(xOff, 0, 0);
      craftGroup.add(wing);
    });

    // Parabolic High-Gain Antenna Dish
    const dishGeo = new THREE.ConeGeometry(0.5, 0.2, 12, 1, true);
    dishGeo.rotateX(Math.PI / 2);
    const dishMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4 });
    const dish = new THREE.Mesh(dishGeo, dishMat);
    dish.position.set(0, 0.5, 0.4);
    craftGroup.add(dish);

    // Transponder beacon light
    const beacon = new THREE.PointLight(colorHex, 1.8, 14);
    craftGroup.add(beacon);

    // Callsign Badge
    const badgeText = `🛰️ ${satData.callsign || satData.name} [${satData.orbitType || 'LEO'}]`;
    const badge = Planet3DBuilder.createBillboardLabel(badgeText, colorHex, 20);
    badge.position.set(0, 1.8, 0);
    badge.scale.set(9.5, 1.8, 1);
    craftGroup.add(badge);

    group.add(craftGroup);

    let anomaly = satData.trueAnomaly !== undefined ? satData.trueAnomaly : Math.random() * Math.PI * 2;
    const periodSec = satData.orbitPeriodSec || 50;

    return {
      group,
      craftGroup,
      satData,
      update: (dt, warp = 1.0) => {
        anomaly += (Math.PI * 2 / periodSec) * dt * warp;
        const x = semiMajor * Math.cos(anomaly) - c;
        const z = b * Math.sin(anomaly);
        const y = Math.sin(anomaly) * (semiMajor * Math.sin(inclination));
        craftGroup.position.set(x, y, z);
        craftGroup.rotation.y += dt * 0.5 * warp;
      }
    };
  }
}
