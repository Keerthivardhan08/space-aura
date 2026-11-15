/**
 * SPACE-AURA: Solar Background 3D Engine
 * Cinematic 3D revolving solar system & orbital sunrise background.
 * Inspired by NASA Space Apps Challenge & Astra Nexus.
 */

import * as THREE from 'three';

export class SolarBackground3D {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.animId = null;
    this.isRunning = false;

    // Camera modes: 'sunrise' | 'orrery' | 'mercury' | 'venus' | 'earth' | 'moon' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptune' | 'sun'
    this.viewMode = 'sunrise';
    this.targetViewMode = 'sunrise';

    this.mouse = { x: 0, y: 0 };
    this.parallax = { x: 0, y: 0 };
    this.isDragging = false;
    this.previousMouse = { x: 0, y: 0 };
    this.orbitAngles = { theta: 0, phi: 0.2 };
    this.zoomDistance = 1.0;

    this.camPos = new THREE.Vector3(0, 1.15, 0.45);
    this.camLook = new THREE.Vector3(0, 1.12, -2.5);
    this.camUp = new THREE.Vector3(0, 1, 0);

    this.goalPos = new THREE.Vector3();
    this.goalLook = new THREE.Vector3();
    this.goalUp = new THREE.Vector3(0, 1, 0);

    this.bodies = {};
    this.orbitLines = [];
    this.asteroids = [];
    this.clock = new THREE.Clock();

    this.onViewChangeCallback = null;

    this.init();
  }

  init() {
    // 1. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    // 2. Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.05, 5000);

    // 3. Ambient & Sun Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.08);
    this.scene.add(ambientLight);

    this.sunLight = new THREE.PointLight(0xfff3e0, 3.6, 3500, 0.05);
    this.sunLight.position.set(0, 0, 0);
    this.scene.add(this.sunLight);

    // 4. Cosmic Environment (Deep Stars, Milky Way, Nebula Gas)
    this.buildCosmos();

    // 5. The Central Sun
    this.buildSun();

    // 6. All 8 Planets + Moons + Orbits + Asteroid Belt
    this.buildSolarSystem();

    // 7. Event Listeners
    this.bindEvents();

    // Initial View setup
    this.setViewMode('sunrise', true);

    // Start Render Loop
    this.start();
  }

  buildCosmos() {
    // Helper for uniform spherical random direction
    const randomUnitDir = () => {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      return new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta),
        Math.sin(phi) * Math.sin(theta),
        Math.cos(phi)
      );
    };

    // 4,000 Distant Stars
    const starCount = 4000;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const v = randomUnitDir().multiplyScalar(900 + Math.random() * 800);
      starPos[i * 3] = v.x;
      starPos[i * 3 + 1] = v.y;
      starPos[i * 3 + 2] = v.z;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.4,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.8
    });
    this.scene.add(new THREE.Points(starGeo, starMat));

    // Milky Way Galactic Core Particle Stream (8,000 stars)
    const mwCount = 8000;
    const mwPos = new Float32Array(mwCount * 3);
    const mwColors = new Float32Array(mwCount * 3);
    const axis = new THREE.Vector3(0.35, 1, -0.25).normalize();
    const bA = new THREE.Vector3(1, 0, 0).cross(axis).normalize();
    const bB = axis.clone().cross(bA);
    const tints = [
      [1.0, 0.94, 0.86],
      [0.78, 0.88, 1.0],
      [1.0, 1.0, 1.0],
      [0.96, 0.82, 0.98]
    ];

    for (let i = 0; i < mwCount; i++) {
      const a = Math.random() * Math.PI * 2;
      const h = (Math.random() + Math.random() + Math.random() - 1.5) * 0.18;
      const R = 850 + Math.random() * 300;
      const v = bA.clone().multiplyScalar(Math.cos(a))
        .addScaledVector(bB, Math.sin(a))
        .addScaledVector(axis, h)
        .normalize().multiplyScalar(R);

      mwPos[i * 3] = v.x;
      mwPos[i * 3 + 1] = v.y;
      mwPos[i * 3 + 2] = v.z;

      const c = tints[i % tints.length];
      const brightness = 0.45 + Math.random() * 0.55;
      mwColors[i * 3] = c[0] * brightness;
      mwColors[i * 3 + 1] = c[1] * brightness;
      mwColors[i * 3 + 2] = c[2] * brightness;
    }

    const mwGeo = new THREE.BufferGeometry();
    mwGeo.setAttribute('position', new THREE.BufferAttribute(mwPos, 3));
    mwGeo.setAttribute('color', new THREE.BufferAttribute(mwColors, 3));
    const mwMat = new THREE.PointsMaterial({
      size: 1.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false
    });
    this.scene.add(new THREE.Points(mwGeo, mwMat));

    // Soft Nebula Sprites along Milky Way
    const nebulaCanvas = document.createElement('canvas');
    nebulaCanvas.width = nebulaCanvas.height = 128;
    const nCtx = nebulaCanvas.getContext('2d');
    const nGrad = nCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
    nGrad.addColorStop(0, 'rgba(255,255,255,0.6)');
    nGrad.addColorStop(1, 'rgba(255,255,255,0)');
    nCtx.fillStyle = nGrad;
    nCtx.fillRect(0, 0, 128, 128);
    const nebulaTex = new THREE.CanvasTexture(nebulaCanvas);

    const nebHues = [0x6a5acd, 0x38bdf8, 0xf59e0b, 0xec4899, 0x10b981];
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2 + Math.random() * 0.2;
      const v = bA.clone().multiplyScalar(Math.cos(a))
        .addScaledVector(bB, Math.sin(a))
        .addScaledVector(axis, (Math.random() - 0.5) * 0.15)
        .normalize().multiplyScalar(1050);

      const sp = new THREE.Sprite(new THREE.SpriteMaterial({
        map: nebulaTex,
        color: nebHues[i % nebHues.length],
        transparent: true,
        opacity: 0.14 + Math.random() * 0.1,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      }));
      sp.position.copy(v);
      sp.scale.setScalar(240 + Math.random() * 260);
      this.scene.add(sp);
    }
  }

  buildSun() {
    // Dynamic Coronal Noise Shader
    this.sunUniforms = {
      uTime: { value: 0 },
      uBrightness: { value: 1.2 }
    };

    const sunMat = new THREE.ShaderMaterial({
      uniforms: this.sunUniforms,
      vertexShader: `
        varying vec3 vN;
        varying vec3 vV;
        varying vec3 vP;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vN = normalize(normalMatrix * normal);
          vV = normalize(-mv.xyz);
          vP = position;
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uBrightness;
        varying vec3 vN;
        varying vec3 vV;
        varying vec3 vP;

        float hash(vec3 p) {
          return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453);
        }

        float noise(vec3 p) {
          vec3 i = floor(p);
          vec3 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          return mix(
            mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
                mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
            mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z
          );
        }

        float fbm(vec3 p) {
          float s = 0.0, a = 0.5;
          for (int i = 0; i < 4; i++) {
            s += a * noise(p);
            p = p * 2.08 + vec3(1.3, 7.1, 3.7);
            a *= 0.5;
          }
          return s;
        }

        void main() {
          float mu = max(dot(vN, vV), 0.0);
          vec3 q = normalize(vP);
          float gran = fbm(q * 8.0 + vec3(0.0, uTime * 0.05, 0.0));
          float cell = fbm(q * 22.0 - vec3(uTime * 0.08));
          float limbDark = 0.42 + 0.58 * pow(mu, 0.55);

          vec3 core = vec3(1.0, 0.96, 0.86);
          vec3 warm = vec3(1.0, 0.52, 0.12);
          vec3 c = mix(warm, core, pow(mu, 0.6)) * (0.8 + 0.22 * gran + 0.12 * cell) * limbDark;

          gl_FragColor = vec4(c * 1.3 * uBrightness, 1.0);
        }
      `
    });

    const sunGeo = new THREE.SphereGeometry(3.6, 64, 48);
    this.sunMesh = new THREE.Mesh(sunGeo, sunMat);
    this.scene.add(this.sunMesh);

    // Corona Glow Sprite
    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = glowCanvas.height = 128;
    const gCtx = glowCanvas.getContext('2d');
    const gGrad = gCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gGrad.addColorStop(0, 'rgba(255, 240, 210, 1)');
    gGrad.addColorStop(0.22, 'rgba(255, 180, 80, 0.65)');
    gGrad.addColorStop(0.5, 'rgba(255, 120, 40, 0.2)');
    gGrad.addColorStop(1, 'rgba(255, 80, 20, 0)');
    gCtx.fillStyle = gGrad;
    gCtx.fillRect(0, 0, 128, 128);
    const glowTex = new THREE.CanvasTexture(glowCanvas);

    this.coronaSprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTex,
      color: 0xffa040,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.45,
      depthWrite: false
    }));
    this.coronaSprite.scale.setScalar(46);
    this.scene.add(this.coronaSprite);

    this.sunGlowSprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTex,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.85,
      depthWrite: false
    }));
    this.sunGlowSprite.scale.setScalar(26);
    this.scene.add(this.sunGlowSprite);
  }

  buildSolarSystem() {
    this.texLoader = new THREE.TextureLoader();

    // Squeezed illustrative distance scale: inner planets 18 units per AU, outer log-squeezed
    const dist = au => au <= 1.55 ? 20 * au : 31 + 15 * Math.log(au / 1.524);

    // Planets configuration: [id, name, AU, size, period (sec), rotSpeed, color]
    const planetsConfig = [
      { id: 'mercury', name: 'Mercury', au: 0.387, size: 0.48, period: 28, rot: 0.004, color: 0xa1a1aa },
      { id: 'venus',   name: 'Venus',   au: 0.723, size: 0.92, period: 46, rot: -0.003, color: 0xfde047 },
      { id: 'earth',   name: 'Earth',   au: 1.0,   size: 1.15, period: 64, rot: 0.012, color: 0x38bdf8 },
      { id: 'mars',    name: 'Mars',    au: 1.524, size: 0.78, period: 92, rot: 0.011, color: 0xf97316 },
      { id: 'jupiter', name: 'Jupiter', au: 5.20,  size: 3.4,  period: 180, rot: 0.024, color: 0xf59e0b },
      { id: 'saturn',  name: 'Saturn',  au: 9.58,  size: 2.8,  period: 260, rot: 0.022, color: 0xeab308 },
      { id: 'uranus',  name: 'Uranus',  au: 19.2,  size: 1.9,  period: 380, rot: -0.016, color: 0x38bdf8 },
      { id: 'neptune', name: 'Neptune', au: 30.1,  size: 1.85, period: 490, rot: 0.018, color: 0x2563eb }
    ];

    planetsConfig.forEach(cfg => {
      const radius = dist(cfg.au);

      // Orbit Line Loop
      const orbitPts = [];
      const segs = 160;
      for (let i = 0; i <= segs; i++) {
        const theta = (i / segs) * Math.PI * 2;
        orbitPts.push(new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius));
      }
      const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPts);
      const orbitMat = new THREE.LineBasicMaterial({
        color: cfg.id === 'earth' ? 0x38bdf8 : cfg.id === 'mars' ? 0xf97316 : 0x475569,
        transparent: true,
        opacity: cfg.id === 'earth' ? 0.45 : cfg.id === 'mars' ? 0.35 : 0.22
      });
      const orbitLine = new THREE.LineLoop(orbitGeo, orbitMat);
      this.scene.add(orbitLine);
      this.orbitLines.push(orbitLine);

      // Planet Group
      const pGroup = new THREE.Group();
      pGroup.name = `Body_${cfg.id}`;

      // Planet Mesh
      if (cfg.id === 'earth') {
        // High-clarity Earth with 4K day, bump, night terminator shader, clouds, Rayleigh atmosphere
        const earthMesh = this.buildPhotorealisticEarth(cfg.size);
        pGroup.add(earthMesh);
        pGroup.userData.earthCore = earthMesh;

        // Orbiting Moon
        const moonGroup = new THREE.Group();
        const moonMat = new THREE.MeshStandardMaterial({
          roughness: 0.88,
          metalness: 0.05
        });
        this.texLoader.load('textures/planets/moon.jpg', t => {
          t.colorSpace = THREE.SRGBColorSpace;
          moonMat.map = t;
          moonMat.needsUpdate = true;
        });
        const moonMesh = new THREE.Mesh(new THREE.SphereGeometry(cfg.size * 0.27, 48, 36), moonMat);
        moonMesh.position.set(cfg.size * 3.2, 0.2, 0);
        moonGroup.add(moonMesh);
        pGroup.add(moonGroup);
        pGroup.userData.moonGroup = moonGroup;
      } else {
        // Standard PBR Planet
        const pMat = new THREE.MeshStandardMaterial({
          color: cfg.color,
          roughness: 0.85,
          metalness: 0.1
        });
        this.texLoader.load(`textures/planets/${cfg.id}.jpg`, t => {
          t.colorSpace = THREE.SRGBColorSpace;
          pMat.map = t;
          pMat.color.set(0xffffff);
          pMat.needsUpdate = true;
        });
        const pMesh = new THREE.Mesh(new THREE.SphereGeometry(cfg.size, 64, 48), pMat);
        pGroup.add(pMesh);
        pGroup.userData.mesh = pMesh;

        // Saturn 3D Rings
        if (cfg.id === 'saturn') {
          const ringMesh = this.buildSaturnRings(cfg.size);
          pGroup.add(ringMesh);
        }

        // Uranus Vertical Rings
        if (cfg.id === 'uranus') {
          const uRingGeo = new THREE.RingGeometry(cfg.size * 1.3, cfg.size * 1.9, 64);
          const uRingMat = new THREE.MeshStandardMaterial({
            color: 0x7dd3fc,
            transparent: true,
            opacity: 0.45,
            side: THREE.DoubleSide
          });
          const uRing = new THREE.Mesh(uRingGeo, uRingMat);
          uRing.rotation.x = Math.PI / 2;
          uRing.rotation.y = 1.45;
          pGroup.add(uRing);
        }
      }

      this.scene.add(pGroup);

      this.bodies[cfg.id] = {
        group: pGroup,
        cfg: cfg,
        radius: radius,
        angle: Math.random() * Math.PI * 2,
        speed: (Math.PI * 2) / cfg.period
      };
    });

    // Main Asteroid Belt (2,200 Particles between Mars & Jupiter: dist 23 to 29)
    const beltCount = 2200;
    const beltPos = new Float32Array(beltCount * 3);
    for (let i = 0; i < beltCount; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = dist(2.1 + Math.random() * 1.1) + (Math.random() - 0.5) * 1.4;
      beltPos[i * 3] = Math.cos(a) * r;
      beltPos[i * 3 + 1] = (Math.random() - 0.5) * 0.9;
      beltPos[i * 3 + 2] = Math.sin(a) * r;

      this.asteroids.push({
        idx: i,
        r: r,
        angle: a,
        speed: 0.04 / Math.sqrt(r / 20),
        y: beltPos[i * 3 + 1]
      });
    }

    const beltGeo = new THREE.BufferGeometry();
    beltGeo.setAttribute('position', new THREE.BufferAttribute(beltPos, 3));
    this.beltPoints = new THREE.Points(beltGeo, new THREE.PointsMaterial({
      color: 0xb4a496,
      size: 0.22,
      transparent: true,
      opacity: 0.72,
      depthWrite: false
    }));
    this.scene.add(this.beltPoints);
  }

  buildPhotorealisticEarth(size) {
    const earthGroup = new THREE.Group();

    // 1. Earth Surface (NASA 4K Albedo + Elevation Bump + Roughness + City Lights)
    const earthGeo = new THREE.SphereGeometry(size, 192, 128);
    const earthMat = new THREE.MeshStandardMaterial({
      roughness: 1.15,
      metalness: 0.08
    });

    this.texLoader.load('textures/earth-day.jpg', t => {
      t.colorSpace = THREE.SRGBColorSpace;
      earthMat.map = t;
      earthMat.needsUpdate = true;
    });
    this.texLoader.load('textures/earth-bump.jpg', t => {
      earthMat.bumpMap = t;
      earthMat.bumpScale = 0.08;
      earthMat.needsUpdate = true;
    });
    this.texLoader.load('textures/earth-rough.jpg', t => {
      earthMat.roughnessMap = t;
      earthMat.needsUpdate = true;
    });

    // Night city lights with smoothstep terminator shader
    this.texLoader.load('textures/earth-night.jpg', t => {
      t.colorSpace = THREE.SRGBColorSpace;
      earthMat.emissiveMap = t;
      earthMat.emissive = new THREE.Color(0xffd59e);
      earthMat.emissiveIntensity = 1.6;

      earthMat.onBeforeCompile = (shader) => {
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
      earthMat.needsUpdate = true;
    });

    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earthMesh);
    earthGroup.userData.surface = earthMesh;

    // 2. Dynamic Cloud Layer
    const cloudMat = new THREE.MeshStandardMaterial({
      transparent: true,
      opacity: 0.82,
      blending: THREE.NormalBlending,
      roughness: 0.95
    });
    this.texLoader.load('textures/earth-clouds.jpg', t => {
      cloudMat.map = t;
      cloudMat.alphaMap = t;
      cloudMat.needsUpdate = true;
    });
    const cloudMesh = new THREE.Mesh(new THREE.SphereGeometry(size * 1.014, 192, 128), cloudMat);
    earthGroup.add(cloudMesh);
    earthGroup.userData.clouds = cloudMesh;

    // 3. Rayleigh Atmospheric Limb Glow Shell (Inverted Fresnel)
    const atmoGeo = new THREE.SphereGeometry(size * 1.045, 192, 128);
    const atmoMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          vNormal = normalize(normalMatrix * normal);
          vViewDir = normalize(-mvPos.xyz);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          float fresnel = 1.0 - max(dot(vNormal, vViewDir), 0.0);
          float glow = pow(fresnel, 3.2);
          vec3 atmoColor = mix(vec3(0.22, 0.65, 1.0), vec3(0.72, 0.92, 1.0), glow);
          gl_FragColor = vec4(atmoColor, glow * 0.92);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false
    });
    const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
    earthGroup.add(atmoMesh);

    // 4. Sunrise Limb Shader (Active during Orbital Sunrise mode)
    const sunriseGeo = new THREE.SphereGeometry(size * 1.025, 192, 128);
    this.sunriseMat = new THREE.ShaderMaterial({
      uniforms: {
        uSunDir: { value: new THREE.Vector3(0, 0, 1) },
        uIntensity: { value: 1.0 }
      },
      vertexShader: `
        varying vec3 vN;
        varying vec3 vV;
        varying vec3 vWorldPos;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vN = normalize(normalMatrix * normal);
          vV = normalize(-mv.xyz);
          vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        uniform vec3 uSunDir;
        uniform float uIntensity;
        varying vec3 vN;
        varying vec3 vV;
        varying vec3 vWorldPos;
        void main() {
          float mu = max(dot(vN, vV), 0.0);
          float rim = pow(1.0 - mu, 2.8);
          vec3 toSun = normalize(-vWorldPos);
          float sunAlignment = max(dot(vN, toSun), 0.0);

          vec3 blueAtmosphere = vec3(0.2, 0.65, 1.0);
          vec3 sunriseGold = vec3(1.0, 0.68, 0.22);
          vec3 color = mix(blueAtmosphere, sunriseGold, pow(sunAlignment, 3.0));

          gl_FragColor = vec4(color * 1.6, rim * uIntensity);
        }
      `,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false
    });
    this.sunriseMesh = new THREE.Mesh(sunriseGeo, this.sunriseMat);
    earthGroup.add(this.sunriseMesh);

    return earthGroup;
  }

  buildSaturnRings(size) {
    const ringCanvas = document.createElement('canvas');
    ringCanvas.width = 512;
    ringCanvas.height = 8;
    const rCtx = ringCanvas.getContext('2d');
    for (let x = 0; x < 512; x++) {
      const u = x / 512;
      const alpha = u < 0.06 ? 0 :
        (0.35 + 0.5 * Math.abs(Math.sin(u * 44) * Math.sin(u * 14))) *
        (u > 0.62 && u < 0.68 ? 0.08 : 1) *
        (u > 0.98 ? 0 : 1);
      rCtx.fillStyle = `rgba(${215 + u * 25 | 0}, ${190 + u * 18 | 0}, ${148 + u * 12 | 0}, ${alpha})`;
      rCtx.fillRect(x, 0, 1, 8);
    }
    const ringTex = new THREE.CanvasTexture(ringCanvas);
    ringTex.colorSpace = THREE.SRGBColorSpace;

    const ringGeo = new THREE.RingGeometry(size * 1.3, size * 2.45, 128);
    // Orient UV radially
    const pos = ringGeo.attributes.position;
    const uvs = ringGeo.attributes.uv;
    for (let i = 0; i < uvs.count; i++) {
      const r = Math.hypot(pos.getX(i), pos.getY(i));
      uvs.setXY(i, (r - size * 1.3) / (size * 1.15), 0.5);
    }

    const ringMat = new THREE.MeshStandardMaterial({
      map: ringTex,
      transparent: true,
      side: THREE.DoubleSide,
      roughness: 0.95,
      depthWrite: false
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2 + 0.46; // 26.7 deg axial tilt
    return ringMesh;
  }

  setViewMode(mode, immediate = false) {
    this.viewMode = mode;
    this.targetViewMode = mode;

    if (mode === 'sunrise') {
      // Orbital Sunrise over Earth's limb (clean symmetric Astra Nexus framing)
      const earth = this.bodies.earth;
      if (earth) {
        const earthPos = earth.group.position;
        const R = 1.15;
        const toSun = new THREE.Vector3().subVectors(new THREE.Vector3(0, 0, 0), earthPos).normalize();
        const up = new THREE.Vector3(0, 1, 0);
        const camOffset = toSun.clone().multiplyScalar(-R * 0.38).addScaledVector(up, R * 0.98);
        this.goalPos.copy(earthPos).add(camOffset);
        const lookTarget = earthPos.clone().add(toSun.clone().multiplyScalar(R * 16)).addScaledVector(up, R * 0.42);
        this.goalLook.copy(lookTarget);
        this.goalUp.set(0, 1, 0);
      }
      if (this.sunriseMesh) this.sunriseMesh.visible = true;
      if (this.orbitLines) this.orbitLines.forEach(l => l.material.opacity = 0.0);
    } else if (mode === 'orrery') {
      // Full Solar System Overview
      this.goalPos.set(0, 58, 86);
      this.goalLook.set(0, 0, 0);
      this.goalUp.set(0, 1, 0);
      if (this.sunriseMesh) this.sunriseMesh.visible = false;
      if (this.orbitLines) this.orbitLines.forEach(l => l.material.opacity = 0.35);
    } else if (this.bodies[mode]) {
      // Focus on specific planet
      const b = this.bodies[mode];
      const pPos = b.group.position;
      const s = b.cfg.size;
      this.goalPos.set(pPos.x + s * 2.8, pPos.y + s * 1.2, pPos.z + s * 3.4);
      this.goalLook.copy(pPos);
      this.goalUp.set(0, 1, 0);
      if (this.sunriseMesh) this.sunriseMesh.visible = false;
      if (this.orbitLines) this.orbitLines.forEach(l => l.material.opacity = 0.15);
    } else if (mode === 'sun') {
      this.goalPos.set(0, 8, 22);
      this.goalLook.set(0, 0, 0);
      this.goalUp.set(0, 1, 0);
      if (this.sunriseMesh) this.sunriseMesh.visible = false;
      if (this.orbitLines) this.orbitLines.forEach(l => l.material.opacity = 0.25);
    }

    if (immediate) {
      this.camPos.copy(this.goalPos);
      this.camLook.copy(this.goalLook);
      this.camUp.copy(this.goalUp);
      this.camera.position.copy(this.camPos);
      this.camera.up.copy(this.camUp);
      this.camera.lookAt(this.camLook);
    }

    if (this.onViewChangeCallback) {
      this.onViewChangeCallback(mode);
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      if (!this.renderer || !this.camera) return;
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Pointer Parallax & Orbit Dragging
    window.addEventListener('pointermove', e => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = (e.clientY / window.innerHeight) * 2 - 1;

      if (this.isDragging) {
        const deltaX = e.clientX - this.previousMouse.x;
        const deltaY = e.clientY - this.previousMouse.y;
        this.orbitAngles.theta -= deltaX * 0.005;
        this.orbitAngles.phi = Math.max(-1.4, Math.min(1.4, this.orbitAngles.phi + deltaY * 0.005));

        this.previousMouse.x = e.clientX;
        this.previousMouse.y = e.clientY;
      }
    });

    this.canvas.addEventListener('pointerdown', e => {
      this.isDragging = true;
      this.previousMouse.x = e.clientX;
      this.previousMouse.y = e.clientY;
    });

    window.addEventListener('pointerup', () => {
      this.isDragging = false;
    });

    // Scroll Zoom
    this.canvas.addEventListener('wheel', e => {
      e.preventDefault();
      this.zoomDistance = Math.max(0.3, Math.min(3.5, this.zoomDistance + e.deltaY * 0.0015));
    }, { passive: false });
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.clock.start();

    const animate = () => {
      if (!this.isRunning) return;
      this.animId = requestAnimationFrame(animate);
      this.render();
    };
    animate();
  }

  stop() {
    this.isRunning = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  render() {
    const delta = Math.min(this.clock.getDelta(), 0.1);
    const elapsedTime = this.clock.getElapsedTime();

    // 1. Update Sun Shader
    if (this.sunUniforms) {
      this.sunUniforms.uTime.value = elapsedTime;
    }
    if (this.sunMesh) {
      this.sunMesh.rotation.y += delta * 0.04;
    }

    // 2. Update Planets Orbital Positions & Axial Rotations
    Object.values(this.bodies).forEach(b => {
      b.angle += b.speed * delta * 0.35;
      const px = Math.cos(b.angle) * b.radius;
      const pz = Math.sin(b.angle) * b.radius;
      b.group.position.set(px, 0, pz);

      // Axial spin
      if (b.cfg.id === 'earth') {
        const earthCore = b.group.userData.earthCore;
        if (earthCore) {
          if (earthCore.userData.surface) earthCore.userData.surface.rotation.y += delta * b.cfg.rot;
          if (earthCore.userData.clouds) earthCore.userData.clouds.rotation.y += delta * (b.cfg.rot * 1.25);
        }
        if (b.group.userData.moonGroup) {
          b.group.userData.moonGroup.rotation.y += delta * 0.15;
        }
      } else if (b.group.userData.mesh) {
        b.group.userData.mesh.rotation.y += delta * b.cfg.rot;
      }
    });

    // 3. Update Asteroid Belt Particles
    if (this.beltPoints) {
      const posAttr = this.beltPoints.geometry.attributes.position;
      const arr = posAttr.array;
      for (let i = 0; i < this.asteroids.length; i++) {
        const ast = this.asteroids[i];
        ast.angle += ast.speed * delta * 0.35;
        arr[i * 3] = Math.cos(ast.angle) * ast.r;
        arr[i * 3 + 2] = Math.sin(ast.angle) * ast.r;
      }
      posAttr.needsUpdate = true;
    }

    // 4. Update Camera Position and Target Lerping
    if (this.viewMode === 'sunrise') {
      const earth = this.bodies.earth;
      if (earth) {
        const earthPos = earth.group.position;
        const R = 1.15;
        const toSun = new THREE.Vector3().subVectors(new THREE.Vector3(0, 0, 0), earthPos).normalize();
        const up = new THREE.Vector3(0, 1, 0);
        const camOffset = toSun.clone().multiplyScalar(-R * 0.38).addScaledVector(up, R * 0.98);
        this.goalPos.copy(earthPos).add(camOffset);
        const lookTarget = earthPos.clone().add(toSun.clone().multiplyScalar(R * 16)).addScaledVector(up, R * 0.42);
        this.goalLook.copy(lookTarget);
      }
    } else if (this.bodies[this.viewMode]) {
      const b = this.bodies[this.viewMode];
      const pPos = b.group.position;
      const s = b.cfg.size;
      this.goalPos.set(pPos.x + s * 2.8, pPos.y + s * 1.2, pPos.z + s * 3.4);
      this.goalLook.copy(pPos);
    }

    // Smooth Lerp
    const lerpSpeed = Math.min(1.0, delta * 3.5);
    this.camPos.lerp(this.goalPos, lerpSpeed);
    this.camLook.lerp(this.goalLook, lerpSpeed);
    this.camUp.lerp(this.goalUp, lerpSpeed);

    // Apply mouse parallax / orbit drag
    const finalCamPos = this.camPos.clone();
    if (this.viewMode === 'sunrise') {
      this.parallax.x += (this.mouse.x - this.parallax.x) * delta * 2.5;
      this.parallax.y += (this.mouse.y - this.parallax.y) * delta * 2.5;
      finalCamPos.x += this.parallax.x * 0.18;
      finalCamPos.y -= this.parallax.y * 0.12;
    } else {
      // In orrery or planet focus mode, apply orbit drag and zoom
      finalCamPos.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.orbitAngles.theta);
      finalCamPos.multiplyScalar(this.zoomDistance);
    }

    this.camera.position.copy(finalCamPos);
    this.camera.up.copy(this.camUp);
    this.camera.lookAt(this.camLook);

    // 5. Render Scene
    this.renderer.render(this.scene, this.camera);
  }
}
