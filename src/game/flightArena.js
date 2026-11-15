/**
 * ASTROFORGE: Interactive Arcade Space Flight Arena Engine
 * 60 FPS hands-on flight gameplay with steering, engine thrust, sensor scanning, and orbital survival
 */

import { sound } from '../engine/audio.js';

export class FlightArena {
  constructor(canvasElement, onMissionEnd) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.onMissionEnd = onMissionEnd;

    this.running = false;
    this.animId = null;
    this.lastTime = 0;

    // Active Mission Config
    this.level = null;
    this.loadout = null;

    // Ship State
    this.ship = {
      orbitRadius: 180, // pixels from planet center
      orbitAngle: 0, // radians around planet
      orientationAngle: 0, // radians pointing direction
      angularVelocity: 0,
      orbitSpeed: 0.015, // base orbital speed
      altitudeKm: 550,

      // Resources
      fuelKg: 50.0,
      maxFuelKg: 50.0,
      batterySoC: 1.0, // 0 to 1
      hullHealth: 100, // 0 to 100
      storedDataGb: 0.0,
      downlinkedDataGb: 0.0,
      scienceScore: 0,

      // States
      thrusting: false,
      shieldActive: false,
      scanning: false,
      inEclipse: false,
      inGroundPass: false
    };

    // Environmental World State
    this.planetRadius = 80;
    this.planetRotation = 0;
    this.sunVector = { x: -1, y: 0 }; // Sunlight comes from left

    // Dynamic Game Targets (Hotspots, Craters, Plumes)
    this.targets = [];
    this.groundStationAngle = Math.PI / 2; // Revolves with planet

    // Obstacles & Debris
    this.debrisList = [];

    // Particle FX
    this.particles = [];
    this.scanWaves = [];

    // Mission Timer & Objectives
    this.timeRemainingSec = 90;
    this.screenShake = 0;

    // Input States
    this.keys = {
      left: false,
      right: false,
      thrust: false,
      scan: false,
      shield: false
    };

    this.bindInputs();
  }

  bindInputs() {
    if (typeof window === 'undefined') return;
    window.addEventListener('keydown', (e) => {
      if (!this.running) return;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.keys.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') this.keys.right = true;
      if (e.code === 'ArrowUp' || e.code === 'KeyW') this.keys.thrust = true;
      if (e.code === 'Space') {
        e.preventDefault();
        this.triggerScan();
      }
      if (e.code === 'ArrowDown' || e.code === 'KeyS') this.keys.shield = true;
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.keys.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') this.keys.right = false;
      if (e.code === 'ArrowUp' || e.code === 'KeyW') this.keys.thrust = false;
      if (e.code === 'ArrowDown' || e.code === 'KeyS') this.keys.shield = false;
    });
  }

  startMission(level, loadout) {
    this.level = level;
    this.loadout = loadout;
    this.running = true;
    this.timeRemainingSec = level.timeLimitSec || 90;

    // Reset Ship
    this.ship.orbitRadius = Math.min(this.width || 600, this.height || 400) * 0.35;
    this.ship.orbitAngle = 0;
    this.ship.orientationAngle = 0;
    this.ship.fuelKg = 45.0;
    this.ship.batterySoC = 1.0;
    this.ship.hullHealth = 100;
    this.ship.storedDataGb = 0;
    this.ship.downlinkedDataGb = 0;
    this.ship.scienceScore = 0;

    // Spawn 3 Level Science Targets on Planet Surface
    this.targets = [
      { id: 'tgt_1', angle: Math.PI * 0.35, scanned: false, label: 'TARGET ALPHA', points: 60 },
      { id: 'tgt_2', angle: Math.PI * 0.95, scanned: false, label: 'TARGET BRAVO', points: 80 },
      { id: 'tgt_3', angle: Math.PI * 1.65, scanned: false, label: 'TARGET CHARLIE', points: 100 }
    ];

    // Spawn floating space debris
    this.debrisList = [
      { orbitRadius: this.ship.orbitRadius * 0.92, angle: Math.PI * 0.5, speed: 0.008, size: 6 },
      { orbitRadius: this.ship.orbitRadius * 1.08, angle: Math.PI * 1.2, speed: -0.006, size: 8 },
      { orbitRadius: this.ship.orbitRadius * 1.02, angle: Math.PI * 1.8, speed: 0.012, size: 5 }
    ];

    this.particles = [];
    this.scanWaves = [];

    sound.playSuccessChime();
    sound.startAmbientDrone();

    this.lastTime = performance.now();
    this.loop = (now) => {
      if (!this.running) return;
      const dt = Math.min(0.1, (now - this.lastTime) / 1000);
      this.lastTime = now;
      this.update(dt);
      this.render();
      this.animId = requestAnimationFrame(this.loop);
    };
    this.animId = requestAnimationFrame(this.loop);
  }

  stop() {
    this.running = false;
    if (this.animId) cancelAnimationFrame(this.animId);
  }

  triggerScan() {
    if (this.ship.batterySoC < 0.10) {
      sound.playWarningKlaxon();
      return;
    }

    sound.playTelemetryPing();
    this.ship.batterySoC = Math.max(0, this.ship.batterySoC - 0.08);

    // Trigger visual scan pulse wave towards planet
    const scX = (this.width / 2) + Math.cos(this.ship.orbitAngle) * this.ship.orbitRadius;
    const scY = (this.height / 2) + Math.sin(this.ship.orbitAngle) * this.ship.orbitRadius;

    this.scanWaves.push({
      x: scX,
      y: scY,
      radius: 5,
      maxRadius: 100,
      alpha: 1.0
    });

    // Check hit on active targets
    this.targets.forEach(tgt => {
      if (tgt.scanned) return;

      // Calculate angular distance between spacecraft and target
      let diff = Math.abs((this.ship.orbitAngle % (Math.PI * 2)) - (tgt.angle % (Math.PI * 2)));
      if (diff > Math.PI) diff = 2 * Math.PI - diff;

      if (diff < 0.28) {
        // Direct scan hit!
        tgt.scanned = true;
        this.ship.scienceScore += tgt.points;
        this.ship.storedDataGb += 5.0;
        sound.playSuccessChime();
        this.spawnSparks(scX, scY, '#10b981', 18);
      }
    });
  }

  update(dt) {
    // 1. Mission Timer
    this.timeRemainingSec -= dt;
    if (this.timeRemainingSec <= 0) {
      this.finishMission(true);
      return;
    }

    // 2. Planet & Target Rotation
    this.planetRotation = (this.planetRotation + 0.002) % (Math.PI * 2);
    this.groundStationAngle = (this.groundStationAngle + 0.003) % (Math.PI * 2);

    // 3. Spacecraft Steering & Controls
    if (this.keys.left) {
      this.ship.orientationAngle -= 3.2 * dt;
    }
    if (this.keys.right) {
      this.ship.orientationAngle += 3.2 * dt;
    }

    // 4. Engine Thrusting
    this.ship.thrusting = this.keys.thrust && this.ship.fuelKg > 0;
    if (this.ship.thrusting) {
      this.ship.fuelKg = Math.max(0, this.ship.fuelKg - 2.5 * dt);
      // Thrust alters orbit velocity and altitude
      this.ship.orbitRadius = Math.max(this.planetRadius + 30, Math.min(260, this.ship.orbitRadius + Math.cos(this.ship.orientationAngle) * 35 * dt));
      this.ship.orbitSpeed = Math.max(0.005, Math.min(0.04, this.ship.orbitSpeed + Math.sin(this.ship.orientationAngle) * 0.005 * dt));

      // Emit rocket exhaust particles
      const scX = (this.width / 2) + Math.cos(this.ship.orbitAngle) * this.ship.orbitRadius;
      const scY = (this.height / 2) + Math.sin(this.ship.orbitAngle) * this.ship.orbitRadius;
      this.spawnExhaust(scX, scY, this.ship.orientationAngle + Math.PI);
    }

    // 5. Advance Orbital Position
    this.ship.orbitAngle = (this.ship.orbitAngle + this.ship.orbitSpeed) % (Math.PI * 2);

    // 6. Day / Night Shadow Detection (Eclipse)
    // Sunlight comes from left (-X), so the shadow is on the right (+X: angle from -PI/3 to +PI/3)
    const normAngle = (this.ship.orbitAngle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
    this.ship.inEclipse = (normAngle >= Math.PI * 1.75 || normAngle <= Math.PI * 0.25);

    // 7. Power Generation & Battery Simulation
    if (this.ship.inEclipse) {
      // Discharging in shadow
      this.ship.batterySoC = Math.max(0, this.ship.batterySoC - 0.04 * dt);
    } else {
      // Recharging in sunlight: depends on solar wing alignment!
      // Solar wing normal is perpendicular to ship orientation
      const sunAngle = Math.PI; // Light from left
      const alignment = Math.abs(Math.cos(this.ship.orientationAngle - sunAngle));
      const rechargeRate = 0.08 * alignment;
      this.ship.batterySoC = Math.min(1.0, this.ship.batterySoC + rechargeRate * dt);
    }

    // 8. Ground Station Telemetry Downlink Pass
    let gsDiff = Math.abs((this.ship.orbitAngle % (Math.PI * 2)) - (this.groundStationAngle % (Math.PI * 2)));
    if (gsDiff > Math.PI) gsDiff = 2 * Math.PI - gsDiff;

    this.ship.inGroundPass = gsDiff < 0.35;
    if (this.ship.inGroundPass && this.ship.storedDataGb > 0) {
      const downlinked = Math.min(this.ship.storedDataGb, 4.0 * dt);
      this.ship.storedDataGb -= downlinked;
      this.ship.downlinkedDataGb += downlinked;
      this.ship.scienceScore += Math.round(downlinked * 15);
    }

    // 9. Debris Collisions
    const scX = (this.width / 2) + Math.cos(this.ship.orbitAngle) * this.ship.orbitRadius;
    const scY = (this.height / 2) + Math.sin(this.ship.orbitAngle) * this.ship.orbitRadius;

    this.debrisList.forEach(deb => {
      deb.angle = (deb.angle + deb.speed) % (Math.PI * 2);
      const dx = (this.width / 2) + Math.cos(deb.angle) * deb.orbitRadius;
      const dy = (this.height / 2) + Math.sin(deb.angle) * deb.orbitRadius;

      const dist = Math.hypot(scX - dx, scY - dy);
      if (dist < deb.size + 14) {
        // Collision hit!
        if (this.keys.shield) {
          // Shield absorbs impact
          sound.playBlip(320, 0.1, 'triangle');
          this.spawnSparks(scX, scY, '#38bdf8', 12);
        } else {
          sound.playWarningKlaxon();
          this.ship.hullHealth = Math.max(0, this.ship.hullHealth - 18);
          this.screenShake = 12;
          this.spawnSparks(scX, scY, '#ef4444', 20);

          if (this.ship.hullHealth <= 0) {
            this.finishMission(false);
          }
        }
      }
    });

    // 10. Update Particles & Scan Waves
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= dt * 1.5;
    });
    this.particles = this.particles.filter(p => p.alpha > 0);

    this.scanWaves.forEach(w => {
      w.radius += dt * 90;
      w.alpha -= dt * 1.2;
    });
    this.scanWaves = this.scanWaves.filter(w => w.alpha > 0);

    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 25);
    }

    // Check if all targets are scanned
    if (this.targets.every(t => t.scanned) && this.ship.storedDataGb <= 0.5) {
      this.finishMission(true);
    }
  }

  finishMission(success) {
    this.stop();
    if (this.onMissionEnd) {
      this.onMissionEnd({
        success,
        score: this.ship.scienceScore,
        targetsScanned: this.targets.filter(t => t.scanned).length,
        totalTargets: this.targets.length,
        batterySoC: this.ship.batterySoC,
        hullHealth: this.ship.hullHealth,
        fuelRemainingKg: this.ship.fuelKg,
        timeSpentSec: (this.level.timeLimitSec || 90) - this.timeRemainingSec
      });
    }
  }

  spawnExhaust(x, y, angle) {
    for (let i = 0; i < 3; i++) {
      const spread = (Math.random() - 0.5) * 0.4;
      const speed = 35 + Math.random() * 40;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle + spread) * speed * 0.05,
        vy: Math.sin(angle + spread) * speed * 0.05,
        alpha: 1.0,
        color: Math.random() > 0.4 ? '#f59e0b' : '#ef4444',
        size: 3 + Math.random() * 3
      });
    }
  }

  spawnSparks(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 20 + Math.random() * 50;
      this.particles.push({
        x,
        y,
        vx: Math.cos(ang) * spd * 0.05,
        vy: Math.sin(ang) * spd * 0.05,
        alpha: 1.0,
        color,
        size: 2 + Math.random() * 2
      });
    }
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.width = rect.width;
    this.height = rect.height;
  }

  render() {
    if (!this.canvas) return;
    const ctx = this.ctx;
    const w = this.width || 600;
    const h = this.height || 400;
    let cx = w / 2;
    let cy = h / 2;

    // Apply Screen Shake
    if (this.screenShake > 0) {
      cx += (Math.random() - 0.5) * this.screenShake;
      cy += (Math.random() - 0.5) * this.screenShake;
    }

    // Deep space gradient
    const bg = ctx.createRadialGradient(cx, cy, 50, cx, cy, Math.max(w, h));
    bg.addColorStop(0, '#090f1e');
    bg.addColorStop(1, '#02050e');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Draw Sunlight Vector from left
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.15)';
    ctx.lineWidth = 1;
    ctx.setLineDash([8, 8]);
    for (let y = cy - 120; y <= cy + 120; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(cx - this.planetRadius * 1.2, y);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Draw Planetary Shadow Cone (Eclipse region on the right)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, cy - this.planetRadius);
    ctx.lineTo(w + 100, cy - this.planetRadius * 1.8);
    ctx.lineTo(w + 100, cy + this.planetRadius * 1.8);
    ctx.lineTo(cx, cy + this.planetRadius);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fill();
    ctx.restore();

    // Draw Orbital Trajectory Track
    ctx.beginPath();
    ctx.arc(cx, cy, this.ship.orbitRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Draw Central Rotating Planet
    this.drawPlanet(cx, cy);

    // Draw Floating Space Debris
    this.debrisList.forEach(deb => {
      const dx = cx + Math.cos(deb.angle) * deb.orbitRadius;
      const dy = cy + Math.sin(deb.angle) * deb.orbitRadius;
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(dx, dy, deb.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ef4444';
      ctx.stroke();
    });

    // Spacecraft Coordinates
    const scX = cx + Math.cos(this.ship.orbitAngle) * this.ship.orbitRadius;
    const scY = cy + Math.sin(this.ship.orbitAngle) * this.ship.orbitRadius;

    // Draw Ground Station Link Beam if in pass
    if (this.ship.inGroundPass) {
      const gsX = cx + Math.cos(this.groundStationAngle) * (this.planetRadius + 4);
      const gsY = cy + Math.sin(this.groundStationAngle) * (this.planetRadius + 4);

      ctx.beginPath();
      ctx.moveTo(scX, scY);
      ctx.lineTo(gsX, gsY);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('⚡ DOWNLINKING DATA', scX + 20, scY - 14);
    }

    // Draw Scan Pulse Waves
    this.scanWaves.forEach(w => {
      ctx.beginPath();
      ctx.arc(w.x, w.y, w.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(236, 72, 153, ${w.alpha})`;
      ctx.lineWidth = 3;
      ctx.stroke();
    });

    // Draw Particle FX (exhaust fire, sparks)
    this.particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    });

    // Draw Spacecraft Entity
    ctx.save();
    ctx.translate(scX, scY);
    ctx.rotate(this.ship.orientationAngle);

    // Shield Aura if active
    if (this.keys.shield) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Spacecraft Body
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.fillRect(-10, -10, 20, 20);
    ctx.strokeRect(-10, -10, 20, 20);

    // Solar Wings
    ctx.fillStyle = this.ship.inEclipse ? '#64748b' : '#0284c7';
    ctx.fillRect(-26, -5, 14, 10);
    ctx.fillRect(12, -5, 14, 10);

    // Engine Nozzle
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(-5, 10);
    ctx.lineTo(5, 10);
    ctx.lineTo(8, 16);
    ctx.lineTo(-8, 16);
    ctx.closePath();
    ctx.fill();

    // Antenna
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, -14, 6, Math.PI * 0.8, Math.PI * 0.2);
    ctx.stroke();

    ctx.restore();

    // Render In-Flight HUD Overlays
    this.renderFlightHud(w, h);
  }

  drawPlanet(cx, cy) {
    const ctx = this.ctx;
    const r = this.planetRadius;

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();

    ctx.fillStyle = this.level ? this.level.targetColor : '#1e3a8a';
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

    // Target Biomes / Hotspots on Planet Surface
    this.targets.forEach(tgt => {
      const tx = cx + Math.cos(tgt.angle + this.planetRotation) * (r * 0.85);
      const ty = cy + Math.sin(tgt.angle + this.planetRotation) * (r * 0.85);

      ctx.fillStyle = tgt.scanned ? '#10b981' : '#ec4899';
      ctx.beginPath();
      ctx.arc(tx, ty, tgt.scanned ? 6 : 9, 0, Math.PI * 2);
      ctx.fill();

      if (!tgt.scanned) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    });

    // Day/Night Terminator across the planet (Sun from left)
    const shadowGrad = ctx.createLinearGradient(cx - r * 0.1, cy, cx + r, cy);
    shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.0)');
    shadowGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.7)');
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
    ctx.fillStyle = shadowGrad;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

    ctx.restore();

    // Ground Station Dish on Surface
    const gsX = cx + Math.cos(this.groundStationAngle) * (r + 3);
    const gsY = cy + Math.sin(this.groundStationAngle) * (r + 3);
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(gsX, gsY, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  renderFlightHud(w, h) {
    const ctx = this.ctx;

    // Top Header: Mission & Time
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px monospace';
    ctx.fillText(`${this.level ? this.level.title : 'MISSION'}`, 16, 24);

    ctx.fillStyle = this.timeRemainingSec < 20 ? '#ef4444' : '#f59e0b';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`⏱ TIME: ${Math.max(0, Math.ceil(this.timeRemainingSec))}s`, w - 16, 24);
    ctx.textAlign = 'left';

    // Left Gauges: Battery, Fuel, Hull
    const gy = 44;
    this.drawGaugeBar(16, gy, 120, 8, this.ship.batterySoC, '#10b981', 'BATTERY');
    this.drawGaugeBar(16, gy + 22, 120, 8, this.ship.fuelKg / this.ship.maxFuelKg, '#f59e0b', 'PROPELLANT');
    this.drawGaugeBar(16, gy + 44, 120, 8, this.ship.hullHealth / 100, '#ef4444', 'HULL INTEGRITY');

    // Right Stats: Science Score & Data
    ctx.fillStyle = '#ec4899';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`★ SCIENCE SCORE: ${this.ship.scienceScore} PTS`, w - 16, gy + 10);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`DATA BUFFER: ${this.ship.storedDataGb.toFixed(1)} GB`, w - 16, gy + 26);
    ctx.fillText(`DOWNLINKED: ${this.ship.downlinkedDataGb.toFixed(1)} GB`, w - 16, gy + 42);
    ctx.textAlign = 'left';

    // Center Controls Guide Reminder at bottom
    ctx.fillStyle = 'rgba(148, 163, 184, 0.85)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('[A/D] Rotate  •  [W] Thrust Engine  •  [SPACE] Scan Target  •  [S] Shield', w / 2, h - 14);
    ctx.textAlign = 'left';
  }

  drawGaugeBar(x, y, w, h, ratio, color, label) {
    const ctx = this.ctx;
    ctx.fillStyle = '#64748b';
    ctx.font = '9px monospace';
    ctx.fillText(label, x, y - 3);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x, y, w, h);

    ctx.fillStyle = color;
    ctx.fillRect(x, y, Math.max(0, Math.min(w, w * ratio)), h);
  }
}
