/**
 * SPACE-AURA: Interactive Orbital Physics & Telemetry Canvas Visualizer
 * Enhanced with GMAT Orbital Telemetry (Vis-Viva, Keplerian Elements) & NASA Mission Viz Multi-Angle Camera
 */

export class OrbitCanvasVisualizer {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.animationFrameId = null;
    this.state = null;
    this.targetBody = 'Earth';
    this.pulseAngle = 0;
    this.viewMode = 'PLANET_CENTERED'; // 'PLANET_CENTERED' or 'SPACECRAFT_CHASE'
    this.gmatVectors = null;
  }

  updateState(simState, targetBody = 'Earth') {
    this.state = simState;
    this.targetBody = targetBody;
    this.render();
  }

  setGmatVectors(vectors) {
    this.gmatVectors = vectors;
  }

  toggleViewMode() {
    this.viewMode = this.viewMode === 'PLANET_CENTERED' ? 'SPACECRAFT_CHASE' : 'PLANET_CENTERED';
    this.render();
    return this.viewMode;
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.width = rect.width;
    this.height = rect.height;
    this.render();
  }

  start() {
    const loop = () => {
      this.pulseAngle = (this.pulseAngle + 0.05) % (Math.PI * 2);
      this.render();
      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  render() {
    if (!this.width || !this.height) {
      const rect = this.canvas.getBoundingClientRect();
      this.width = rect.width || 600;
      this.height = rect.height || 400;
    }

    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    let centerX = w / 2;
    let centerY = h / 2;

    const planetRadius = Math.min(w, h) * 0.16;
    const orbitRadius = Math.min(w, h) * 0.36;
    const angle = this.state ? (this.state.currentOrbitAngle || 0) : 0;

    // Spacecraft chase view camera offset
    if (this.viewMode === 'SPACECRAFT_CHASE') {
      const scRelX = Math.cos(angle) * orbitRadius;
      const scRelY = Math.sin(angle) * orbitRadius;
      centerX = w / 2 - scRelX * 0.6;
      centerY = h / 2 - scRelY * 0.6;
    }

    // Clear background with deep space dark gradient
    const bgGrad = ctx.createRadialGradient(centerX, centerY, 50, centerX, centerY, Math.max(w, h));
    bgGrad.addColorStop(0, '#0a0f1d');
    bgGrad.addColorStop(1, '#030712');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Draw background distant stars
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    const starCount = 40;
    for (let i = 0; i < starCount; i++) {
      const sx = (Math.sin(i * 123.45) * 0.5 + 0.5) * w;
      const sy = (Math.cos(i * 678.90) * 0.5 + 0.5) * h;
      const sr = (i % 3 === 0) ? 1.5 : 0.8;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw Planetary Shadow Cone (Eclipse region)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - planetRadius);
    ctx.lineTo(w + 100, centerY - planetRadius * 1.8);
    ctx.lineTo(w + 100, centerY + planetRadius * 1.8);
    ctx.lineTo(centerX, centerY + planetRadius);
    ctx.closePath();
    ctx.fillStyle = 'rgba(2, 6, 23, 0.65)';
    ctx.fill();

    // Shadow label
    ctx.fillStyle = 'rgba(148, 163, 184, 0.35)';
    ctx.font = '10px monospace';
    ctx.fillText('ECLIPSE / SHADOW CONE', centerX + orbitRadius * 0.45, centerY - 8);
    ctx.restore();

    // Draw Sunlight Rays from the Left
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.15)';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 6]);
    for (let y = centerY - 120; y <= centerY + 120; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(centerX - planetRadius * 1.2, y);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Draw Orbit Path
    ctx.beginPath();
    ctx.arc(centerX, centerY, orbitRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Draw Celestial Body
    this.drawCelestialBody(centerX, centerY, planetRadius);

    if (!this.state) return;

    // Spacecraft Coordinates
    const scX = centerX + Math.cos(angle) * orbitRadius;
    const scY = centerY + Math.sin(angle) * orbitRadius;

    // Ground Station Antenna (placed at bottom of planet)
    const gsAngle = Math.PI / 2;
    const gsX = centerX + Math.cos(gsAngle) * (planetRadius + 2);
    const gsY = centerY + Math.sin(gsAngle) * (planetRadius + 2);

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(gsX, gsY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Ground Station Link Arcs
    if (this.state.groundStationActive) {
      ctx.beginPath();
      ctx.moveTo(scX, scY);
      ctx.lineTo(gsX, gsY);
      ctx.strokeStyle = `rgba(16, 185, 129, ${0.4 + Math.sin(this.pulseAngle) * 0.3})`;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(
        scX + (gsX - scX) * ((Math.sin(this.pulseAngle) + 1) / 2),
        scY + (gsY - scY) * ((Math.sin(this.pulseAngle) + 1) / 2),
        3, 0, Math.PI * 2
      );
      ctx.fill();
    }

    // Spacecraft Body
    ctx.save();
    ctx.translate(scX, scY);

    const isEclipse = this.state.inEclipse;
    const auraColor = isEclipse ? 'rgba(239, 68, 68, 0.4)' : 'rgba(56, 189, 248, 0.4)';
    ctx.fillStyle = auraColor;
    ctx.beginPath();
    ctx.arc(0, 0, 8 + Math.sin(this.pulseAngle) * 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(-5, -5, 10, 10);

    ctx.fillStyle = isEclipse ? '#64748b' : '#38bdf8';
    ctx.fillRect(-16, -2, 9, 4);
    ctx.fillRect(7, -2, 9, 4);

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, -7, 4, Math.PI * 0.8, Math.PI * 0.2);
    ctx.stroke();
    ctx.restore();

    // Spacecraft Status Indicator
    ctx.fillStyle = isEclipse ? '#f87171' : '#38bdf8';
    ctx.font = 'bold 11px monospace';
    const statusText = isEclipse ? '🌙 IN SHADOW (BATTERY)' : '☀️ SUNLIGHT (SOLAR)';
    ctx.fillText(statusText, scX + 18, scY - 8);

    // Telemetry Mini-pill
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(scX + 18, scY + 2, 130, 36, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px monospace';
    ctx.fillText(`SoC: ${(this.state.batterySoC * 100).toFixed(0)}%`, scX + 24, scY + 16);
    ctx.fillText(`Buf: ${this.state.storedDataGb.toFixed(1)} GB`, scX + 24, scY + 30);

    // GMAT KEPLERIAN TELEMETRY HUD (Top-Left overlay)
    this.drawGmatHud(14, 14);
  }

  drawGmatHud(x, y) {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, 220, 85, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('🛰️ GMAT ORBITAL STATE VECTORS', x + 10, y + 16);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px monospace';
    const angleDeg = ((this.state ? this.state.currentOrbitAngle : 0) * 180 / Math.PI).toFixed(1);
    ctx.fillText(`True Anomaly (ν): ${angleDeg}°`, x + 10, y + 32);

    if (this.gmatVectors) {
      ctx.fillText(`Semi-Major Axis (a): ${this.gmatVectors.semiMajorAxisKm} km`, x + 10, y + 46);
      ctx.fillText(`Eccentricity (e): ${this.gmatVectors.eccentricity}`, x + 10, y + 60);
      ctx.fillText(`Orbital Velocity: ${this.gmatVectors.velocityPeriapsisKmSec} km/s`, x + 10, y + 74);
    } else {
      ctx.fillText(`Orbit Altitude: ~550 km`, x + 10, y + 46);
      ctx.fillText(`Orbital Velocity: 7.58 km/s`, x + 10, y + 60);
      ctx.fillText(`Cam: ${this.viewMode}`, x + 10, y + 74);
    }
    ctx.restore();
  }

  drawCelestialBody(cx, cy, r) {
    const ctx = this.ctx;
    ctx.save();

    const glowGrad = ctx.createRadialGradient(cx, cy, r * 0.95, cx, cy, r * 1.25);
    if (this.targetBody === 'Earth') {
      glowGrad.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
      glowGrad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
    } else if (this.targetBody === 'Mars') {
      glowGrad.addColorStop(0, 'rgba(239, 68, 68, 0.35)');
      glowGrad.addColorStop(1, 'rgba(239, 68, 68, 0.0)');
    } else if (this.targetBody === 'Moon') {
      glowGrad.addColorStop(0, 'rgba(203, 213, 225, 0.25)');
      glowGrad.addColorStop(1, 'rgba(203, 213, 225, 0.0)');
    } else {
      glowGrad.addColorStop(0, 'rgba(245, 158, 11, 0.35)');
      glowGrad.addColorStop(1, 'rgba(245, 158, 11, 0.0)');
    }
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.25, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();

    if (this.targetBody === 'Earth') {
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

      ctx.fillStyle = '#059669';
      ctx.beginPath();
      ctx.ellipse(cx - r * 0.3, cy - r * 0.1, r * 0.45, r * 0.6, 0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(cx + r * 0.4, cy + r * 0.2, r * 0.4, r * 0.5, -0.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.beginPath();
      ctx.arc(cx - r * 0.2, cy - r * 0.3, r * 0.35, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.targetBody === 'Mars') {
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

      ctx.fillStyle = '#450a0a';
      ctx.beginPath();
      ctx.ellipse(cx, cy, r * 0.6, r * 0.4, 0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.ellipse(cx, cy - r * 0.85, r * 0.35, r * 0.15, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.targetBody === 'Moon') {
      ctx.fillStyle = '#64748b';
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(cx - r * 0.3, cy - r * 0.2, r * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + r * 0.3, cy + r * 0.1, r * 0.25, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#c2410c';
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      ctx.fillStyle = '#f97316';
      for (let y = cy - r; y < cy + r; y += 18) {
        ctx.fillRect(cx - r, y, r * 2, 8);
      }
    }

    const shadowGrad = ctx.createLinearGradient(cx - r * 0.2, cy, cx + r, cy);
    shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.0)');
    shadowGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.7)');
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
    ctx.fillStyle = shadowGrad;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

    ctx.restore();

    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(this.targetBody.toUpperCase(), cx, cy + r + 20);
    ctx.textAlign = 'left';
  }
}
