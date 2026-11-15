/**
 * SPACE-AURA: Global Launch Sites Tactical World Map
 * High-Contrast, High-Visibility Interactive 2D Equirectangular World Map
 * with Realistic Continents, Glowing Equator (+465.1 m/s), Earth Rotational
 * Velocity Boost Vectors (v=ωR·cosθ), and Oceanic Launch Safety Azimuths.
 */

import { LAUNCH_STATIONS } from '../config/components.js';
import { sound } from '../engine/audio.js';

export class GlobalSpaceportMap {
  constructor(canvasElement, onSelectSite) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.onSelectSite = onSelectSite;

    this.selectedSiteId = 'site_ksc';
    this.hoveredSite = null;
    this.animFrameId = null;
    this.scanlineX = 0;

    // Detailed world continents in equirectangular coordinates [-180..180, -90..90]
    this.continents = this.getDetailedContinentPolygons();

    this.bindEvents();
  }

  init(initialSiteId = 'site_ksc') {
    this.selectedSiteId = initialSiteId;
    this.resize();
    this.startAnimation();
  }

  destroy() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.max(1.5, window.devicePixelRatio || 1);
    this.width = rect.width || 960;
    this.height = rect.height || 460;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.draw();
  }

  bindEvents() {
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mouseleave', () => {
      this.hoveredSite = null;
    });
    this.canvas.addEventListener('click', (e) => this.handleClick(e));
  }

  geoToCanvas(lat, lon) {
    const x = ((lon + 180) / 360) * this.width;
    const y = ((90 - lat) / 180) * this.height;
    return { x, y };
  }

  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let closest = null;
    let minDist = 26; // generous hit radius

    LAUNCH_STATIONS.forEach(site => {
      const pt = this.geoToCanvas(site.latitude, site.longitude);
      const d = Math.hypot(pt.x - mouseX, pt.y - mouseY);
      if (d < minDist) {
        minDist = d;
        closest = site;
      }
    });

    if (this.hoveredSite !== closest) {
      this.hoveredSite = closest;
      if (closest) sound.playBlip(1050, 0.04);
      this.canvas.style.cursor = closest ? 'pointer' : 'crosshair';
    }
  }

  handleClick(e) {
    if (this.hoveredSite) {
      this.selectSite(this.hoveredSite.id);
    }
  }

  selectSite(siteId) {
    this.selectedSiteId = siteId;
    const site = LAUNCH_STATIONS.find(s => s.id === siteId);
    if (site) {
      sound.playSuccessChime();
      if (this.onSelectSite) {
        this.onSelectSite(site);
      }
    }
  }

  startAnimation() {
    const loop = () => {
      this.scanlineX = (this.scanlineX + 1.6) % (this.width || 960);
      this.draw();
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  draw() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // 1. High-Contrast Deep Space Ocean
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#040d1a');
    bgGrad.addColorStop(0.5, '#07162c');
    bgGrad.addColorStop(1, '#030813');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Graticule Coordinate Grid (High visibility)
    this.drawGraticule(ctx, w, h);

    // 3. Clear Continents with Bright Cyan/Teal Glowing Coastlines
    this.drawContinents(ctx);

    // 4. Glowing Equator & Tropics
    this.drawEquatorHighlight(ctx, w, h);

    // 5. Radar Sweep Line
    this.drawScanline(ctx, w, h);

    // 6. Draw Spaceports, Rotational Velocity Vectors, and Launch Azimuth Cones
    LAUNCH_STATIONS.forEach(site => {
      const isSelected = site.id === this.selectedSiteId;
      const isHovered = this.hoveredSite && site.id === this.hoveredSite.id;
      this.drawSpaceport(ctx, site, isSelected, isHovered);
    });

    // 7. Tactical HUD Overlay & Site Info Card
    this.drawMapHUD(ctx, w, h);
  }

  drawGraticule(ctx, w, h) {
    ctx.save();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.14)';
    ctx.lineWidth = 1;

    // Longitude lines every 30 degrees
    for (let lon = -150; lon <= 180; lon += 30) {
      const x = ((lon + 180) / 360) * w;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();

      ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.font = '10px "Inter", monospace';
      ctx.fillText(`${lon > 0 ? '+' : ''}${lon}°`, x + 3, h - 8);
    }

    // Latitude lines every 30 degrees
    for (let lat = -60; lat <= 60; lat += 30) {
      const y = ((90 - lat) / 180) * h;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();

      ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.font = '10px "Inter", monospace';
      ctx.fillText(`${lat > 0 ? '+' : ''}${lat}°`, 8, y - 4);
    }
    ctx.restore();
  }

  drawEquatorHighlight(ctx, w, h) {
    const eqY = h / 2;
    ctx.save();

    // Prominent Glowing Golden Equator Line (0.00°)
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([8, 5]);
    ctx.beginPath();
    ctx.moveTo(0, eqY);
    ctx.lineTo(w, eqY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Glowing Equator Banner
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(w - 440, eqY - 20, 425, 20, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('⭐ EQUATOR (0.00°) — MAXIMUM EARTH ROTATION VELOCITY BOOST: +465.1 M/S', w - 432, eqY - 6);

    // Tropics of Cancer & Capricorn
    const tropY1 = ((90 - 23.5) / 180) * h;
    const tropY2 = ((90 + 23.5) / 180) * h;
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.35)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    ctx.beginPath();
    ctx.moveTo(0, tropY1);
    ctx.lineTo(w, tropY1);
    ctx.moveTo(0, tropY2);
    ctx.lineTo(w, tropY2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(251, 191, 36, 0.6)';
    ctx.font = '9px monospace';
    ctx.fillText('TROPIC OF CANCER (+23.5°)', 50, tropY1 - 4);
    ctx.fillText('TROPIC OF CAPRICORN (-23.5°)', 50, tropY2 - 4);

    ctx.restore();
  }

  drawScanline(ctx, w, h) {
    ctx.save();
    const grad = ctx.createLinearGradient(this.scanlineX - 50, 0, this.scanlineX, 0);
    grad.addColorStop(0, 'rgba(56, 189, 248, 0)');
    grad.addColorStop(1, 'rgba(56, 189, 248, 0.22)');
    ctx.fillStyle = grad;
    ctx.fillRect(this.scanlineX - 50, 0, 50, h);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.scanlineX, 0);
    ctx.lineTo(this.scanlineX, h);
    ctx.stroke();
    ctx.restore();
  }

  drawContinents(ctx) {
    ctx.save();
    // High-contrast tactical continent style
    ctx.fillStyle = 'rgba(12, 34, 56, 0.95)'; // Clearly visible deep landmass
    ctx.strokeStyle = '#00f0ff'; // Vibrant neon cyan coastline glow
    ctx.lineWidth = 1.8;

    this.continents.forEach(poly => {
      ctx.beginPath();
      poly.forEach(([lon, lat], i) => {
        const pt = this.geoToCanvas(lat, lon);
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });
    ctx.restore();
  }

  drawSpaceport(ctx, site, isSelected, isHovered) {
    const pt = this.geoToCanvas(site.latitude, site.longitude);
    const time = Date.now() * 0.003;

    ctx.save();

    // 1. Draw Oceanic Launch Azimuth Corridor Cone
    if (site.azimuthMin !== undefined && site.azimuthMax !== undefined) {
      const azMid = (site.azimuthMin + site.azimuthMax) / 2;
      const azSpan = Math.abs(site.azimuthMax - site.azimuthMin);
      const radMid = (azMid - 90) * (Math.PI / 180);
      const radHalfSpan = (azSpan / 2) * (Math.PI / 180);

      const coneLen = isSelected ? 55 : 35;
      ctx.beginPath();
      ctx.moveTo(pt.x, pt.y);
      ctx.arc(pt.x, pt.y, coneLen, radMid - radHalfSpan, radMid + radHalfSpan);
      ctx.closePath();
      ctx.fillStyle = isSelected ? 'rgba(56, 189, 248, 0.28)' : 'rgba(56, 189, 248, 0.1)';
      ctx.fill();
      ctx.strokeStyle = isSelected ? '#38bdf8' : 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = isSelected ? 1.8 : 1;
      ctx.stroke();
    }

    // 2. Earth Rotational Velocity Boost Arrow (Tangential Eastward Vector)
    // v = 465.1 * cos(lat), arrow length in pixels:
    const arrowLen = Math.max(14, (site.earthBoostMs / 465.1) * 48);
    ctx.strokeStyle = isSelected ? '#f59e0b' : '#fbbf24';
    ctx.lineWidth = isSelected ? 3.0 : 2.0;
    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y);
    ctx.lineTo(pt.x + arrowLen, pt.y);
    ctx.stroke();

    // Prominent Arrowhead
    ctx.fillStyle = isSelected ? '#f59e0b' : '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(pt.x + arrowLen, pt.y);
    ctx.lineTo(pt.x + arrowLen - 6, pt.y - 4);
    ctx.lineTo(pt.x + arrowLen - 6, pt.y + 4);
    ctx.closePath();
    ctx.fill();

    // Eastward Boost Velocity Badge
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.strokeStyle = isSelected ? '#f59e0b' : 'rgba(251, 191, 36, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(pt.x + arrowLen + 3, pt.y - 8, 54, 16, 3);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 9px monospace';
    ctx.fillText(`+${site.earthBoostMs} m/s`, pt.x + arrowLen + 6, pt.y + 4);

    // 3. Pulsing Beacon Radar Ring
    const pulseR = 7 + (Math.sin(time * 1.5 + site.longitude) * 0.5 + 0.5) * 8;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, pulseR, 0, Math.PI * 2);
    ctx.strokeStyle = isSelected ? 'rgba(56, 189, 248, 0.95)' : 'rgba(56, 189, 248, 0.5)';
    ctx.lineWidth = isSelected ? 2 : 1.2;
    ctx.stroke();

    // 4. Center Beacon Pin
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, isSelected ? 6.5 : 4.5, 0, Math.PI * 2);
    ctx.fillStyle = isSelected ? '#10b981' : (isHovered ? '#f59e0b' : '#38bdf8');
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 5. Selected Spaceport Targeting Reticle
    if (isSelected) {
      const boxSize = 14;
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      [
        [pt.x - boxSize, pt.y - boxSize, 1, 1],
        [pt.x + boxSize, pt.y - boxSize, -1, 1],
        [pt.x - boxSize, pt.y + boxSize, 1, -1],
        [pt.x + boxSize, pt.y + boxSize, -1, -1]
      ].forEach(([bx, by, dx, dy]) => {
        ctx.beginPath();
        ctx.moveTo(bx, by + dy * 6);
        ctx.lineTo(bx, by);
        ctx.lineTo(bx + dx * 6, by);
        ctx.stroke();
      });
    }

    // 6. Spaceport Name Label
    ctx.fillStyle = isSelected ? '#10b981' : (isHovered ? '#ffffff' : '#e2e8f0');
    ctx.font = isSelected ? 'bold 11px "Inter", sans-serif' : '10px "Inter", sans-serif';
    const shortName = site.name.split('(')[0].trim();
    ctx.fillText(`${site.icon} ${shortName}`, pt.x + 8, pt.y + 16);

    ctx.restore();
  }

  drawMapHUD(ctx, w, h) {
    ctx.save();

    // Map Header Badge (Top Left)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(14, 14, 320, 56, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('🌐 GLOBAL SPACEPORT MAP & FLIGHT CORRIDORS', 24, 32);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '10px "Inter", sans-serif';
    ctx.fillText('Real global spaceports, Earth rotation velocity vectors, and azimuth fans.', 24, 46);
    ctx.fillStyle = '#fbbf24';
    ctx.fillText('Click any station on the map to set as active launch pad.', 24, 58);

    // Map Legend (Bottom Right)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(w - 270, h - 74, 256, 62, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('➔ Gold Arrow: Earth Spin Boost (v=ωR·cosθ)', w - 258, h - 54);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('◿ Cyan Fan: Over-Ocean Safety Corridor', w - 258, h - 38);
    ctx.fillStyle = '#10b981';
    ctx.fillText('⦾ Green Pin: Selected Active Spaceport', w - 258, h - 22);

    // Bottom-Left Telemetry Box for Selected / Hovered Spaceport
    const activeSite = this.hoveredSite || LAUNCH_STATIONS.find(s => s.id === this.selectedSiteId);
    if (activeSite) {
      const boxW = 440;
      const boxH = 105;
      const boxX = 14;
      const boxY = h - boxH - 14;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.96)';
      ctx.strokeStyle = activeSite.id === this.selectedSiteId ? '#10b981' : '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 13px "Inter", sans-serif';
      ctx.fillText(`${activeSite.icon} ${activeSite.name}`, boxX + 14, boxY + 22);

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`OPERATOR: ${activeSite.operator || activeSite.country} • BOOST: +${activeSite.earthBoostMs} M/S`, boxX + 14, boxY + 40);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.fillText(`COORDINATES: ${activeSite.latitude}° N, ${activeSite.longitude}° E • CORRIDOR: ${activeSite.idealOrbits[0]}`, boxX + 14, boxY + 56);

      ctx.fillStyle = '#facc15';
      ctx.font = '10px "Inter", sans-serif';
      ctx.fillText(`RESEARCH FOCUS: ${activeSite.researchFocus || 'Scientific Satellite Missions'}`, boxX + 14, boxY + 74);

      ctx.fillStyle = activeSite.id === this.selectedSiteId ? '#10b981' : '#38bdf8';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(activeSite.id === this.selectedSiteId ? '✓ ACTIVE LAUNCH PAD' : 'CLICK TO SELECT AS ACTIVE LAUNCH PAD →', boxX + 14, boxY + 92);
    }

    ctx.restore();
  }

  getDetailedContinentPolygons() {
    // Rich, detailed continent outlines in [lon, lat] coordinates for equirectangular projection
    return [
      // North America
      [
        [-168, 65], [-140, 70], [-125, 75], [-110, 75], [-95, 72], [-80, 62], [-65, 58],
        [-55, 52], [-60, 46], [-66, 44], [-70, 42], [-76, 35], [-81, 25], [-88, 30],
        [-97, 26], [-90, 20], [-82, 9], [-85, 14], [-96, 17], [-105, 22], [-115, 30],
        [-120, 35], [-124, 40], [-125, 50], [-133, 55], [-140, 60], [-155, 58], [-165, 60],
        [-168, 65]
      ],
      // South America
      [
        [-81, 8], [-75, 11], [-62, 10], [-50, 0], [-35, -5], [-35, -10], [-38, -15],
        [-48, -28], [-58, -38], [-65, -55], [-75, -52], [-72, -35], [-76, -18], [-81, -5],
        [-81, 8]
      ],
      // Europe
      [
        [-10, 36], [-2, 36], [3, 42], [5, 48], [-4, 48], [-5, 58], [5, 58], [10, 54],
        [15, 55], [20, 60], [25, 71], [30, 71], [40, 68], [35, 55], [28, 45], [22, 38],
        [14, 38], [10, 37], [0, 43], [-10, 36]
      ],
      // Scandinavia
      [
        [5, 58], [10, 58], [18, 60], [25, 71], [28, 70], [20, 65], [12, 60], [5, 58]
      ],
      // Africa
      [
        [-17, 32], [-5, 36], [10, 37], [25, 32], [33, 31], [42, 22], [51, 12], [44, 2],
        [41, -10], [35, -24], [28, -34], [18, -34], [12, -18], [9, 4], [0, 6], [-15, 11],
        [-17, 32]
      ],
      // Eurasia / Asia
      [
        [35, 55], [50, 55], [60, 60], [70, 72], [90, 75], [110, 76], [140, 72], [170, 66],
        [178, 65], [170, 60], [155, 55], [140, 50], [130, 42], [122, 32], [108, 22],
        [104, 10], [98, 4], [80, 8], [75, 20], [68, 25], [55, 25], [45, 30], [35, 40],
        [35, 55]
      ],
      // India Peninsula
      [
        [68, 24], [73, 16], [77, 8], [80, 13], [87, 22], [78, 28], [68, 24]
      ],
      // Australia
      [
        [114, -22], [125, -14], [135, -12], [142, -11], [153, -28], [148, -38], [138, -35],
        [130, -32], [115, -34], [114, -22]
      ],
      // Japan
      [
        [130, 32], [133, 35], [140, 36], [142, 44], [140, 45], [136, 38], [130, 32]
      ],
      // British Isles
      [
        [-5, 50], [1, 51], [0, 58], [-5, 58], [-10, 54], [-5, 50]
      ],
      // Greenland
      [
        [-55, 60], [-40, 60], [-22, 70], [-18, 80], [-45, 83], [-58, 75], [-55, 60]
      ],
      // Madagascar
      [
        [44, -12], [50, -14], [47, -25], [44, -25], [44, -12]
      ],
      // Antarctica
      [
        [-180, -75], [-120, -78], [-60, -65], [0, -70], [60, -66], [120, -66], [180, -75]
      ]
    ];
  }
}
