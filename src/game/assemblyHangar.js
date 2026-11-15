/**
 * ASTROFORGE: Vehicle Assembly Building (VAB) & Modular Hangar
 * Allows players to visually customize their spacecraft with modular sockets
 */

import { CATALOG } from '../app.js';
import { sound } from '../engine/audio.js';

export class AssemblyHangar {
  constructor(canvasElement, onConfigChange) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.onConfigChange = onConfigChange;

    // Active modular loadout
    this.loadout = {
      busId: 'bus_cubesat_12u',
      sensorId: 'inst_multispectral_cam',
      powerId: 'pwr_deployable_gaas',
      batteryId: 'bat_small_liion',
      engineId: 'prop_cold_gas',
      commId: 'comm_s_band_omni'
    };

    this.selectedSocket = 'sensor'; // 'bus', 'sensor', 'power', 'battery', 'engine', 'comm'
    this.pulse = 0;
  }

  setLoadout(newLoadout) {
    this.loadout = { ...this.loadout, ...newLoadout };
    this.render();
  }

  selectSocket(socketName) {
    this.selectedSocket = socketName;
    sound.playBlip(720, 0.05);
    this.render();
  }

  equipPart(partId) {
    sound.playSuccessChime();
    if (this.selectedSocket === 'bus') this.loadout.busId = partId;
    else if (this.selectedSocket === 'sensor') this.loadout.sensorId = partId;
    else if (this.selectedSocket === 'power') this.loadout.powerId = partId;
    else if (this.selectedSocket === 'battery') this.loadout.batteryId = partId;
    else if (this.selectedSocket === 'engine') this.loadout.engineId = partId;
    else if (this.selectedSocket === 'comm') this.loadout.commId = partId;

    if (this.onConfigChange) {
      this.onConfigChange(this.loadout);
    }
    this.render();
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
    this.render();
  }

  render() {
    if (!this.canvas) return;
    const ctx = this.ctx;
    const w = this.width || 400;
    const h = this.height || 320;
    const cx = w / 2;
    const cy = h / 2;

    this.pulse = (this.pulse + 0.05) % (Math.PI * 2);

    // Hangar dark blueprint backdrop
    ctx.fillStyle = '#060b16';
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    const bus = CATALOG.buses.find(b => b.id === this.loadout.busId);
    const power = CATALOG.power.find(p => p.id === this.loadout.powerId);
    const sensor = CATALOG.instruments.find(i => i.id === this.loadout.sensorId);
    const engine = CATALOG.propulsion.find(p => p.id === this.loadout.engineId);
    const comm = CATALOG.comms.find(c => c.id === this.loadout.commId);

    // Bus Dimensions
    let busW = 70;
    let busH = 90;
    let busColor = '#38bdf8';
    if (bus?.id === 'bus_espa_medium') { busW = 100; busH = 110; busColor = '#06b6d4'; }
    else if (bus?.id === 'bus_flagship') { busW = 130; busH = 140; busColor = '#6366f1'; }

    // 1. Draw Solar Wings / Power
    if (power) {
      ctx.save();
      if (power.type === 'Nuclear') {
        // RTG cylinder
        ctx.fillStyle = '#475569';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.fillRect(cx - 22, cy - busH / 2 - 36, 44, 28);
        ctx.strokeRect(cx - 22, cy - busH / 2 - 36, 44, 28);

        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('☢ RTG-238', cx, cy - busH / 2 - 18);
      } else if (power.id !== 'pwr_body_panels') {
        // Deployable solar arrays
        const wingW = power.id === 'pwr_large_articulated' ? 120 : 80;
        const wingH = busH * 0.7;

        // Left Wing
        ctx.fillStyle = '#0284c7';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.fillRect(cx - busW / 2 - wingW, cy - wingH / 2, wingW, wingH);
        ctx.strokeRect(cx - busW / 2 - wingW, cy - wingH / 2, wingW, wingH);

        // Right Wing
        ctx.fillRect(cx + busW / 2, cy - wingH / 2, wingW, wingH);
        ctx.strokeRect(cx + busW / 2, cy - wingH / 2, wingW, wingH);
      }
      ctx.restore();
    }

    // 2. Draw Main Engine / Thruster at bottom
    if (engine) {
      ctx.save();
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy + busH / 2);
      ctx.lineTo(cx + 10, cy + busH / 2);
      ctx.lineTo(cx + 16, cy + busH / 2 + 25);
      ctx.lineTo(cx - 16, cy + busH / 2 + 25);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      if (engine.id === 'prop_hall_ion') {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.5)';
        ctx.beginPath();
        ctx.ellipse(cx, cy + busH / 2 + 30, 10, 5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 3. Draw Central Spacecraft Chassis
    ctx.save();
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = busColor;
    ctx.lineWidth = 2;
    ctx.fillRect(cx - busW / 2, cy - busH / 2, busW, busH);
    ctx.strokeRect(cx - busW / 2, cy - busH / 2, busW, busH);

    // Avionics core
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(cx - 22, cy - 22, 44, 44);
    ctx.strokeStyle = '#475569';
    ctx.strokeRect(cx - 22, cy - 22, 44, 44);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('AVIONICS', cx, cy);
    ctx.restore();

    // 4. Draw Antenna
    if (comm) {
      ctx.save();
      const dishY = cy - busH / 2 - 14;
      if (comm.id === 'comm_ka_band_dish') {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx - busW * 0.25, dishY, 20, Math.PI * 0.85, Math.PI * 0.15);
        ctx.stroke();
      } else if (comm.id === 'comm_optical_laser') {
        ctx.fillStyle = '#10b981';
        ctx.fillRect(cx - busW * 0.25 - 4, dishY - 14, 8, 16);
      } else {
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - busW * 0.25, cy - busH / 2);
        ctx.lineTo(cx - busW * 0.25, dishY - 8);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 5. Draw Primary Science Sensor on top deck
    if (sensor) {
      ctx.save();
      const sensorX = cx + busW * 0.2;
      const sensorY = cy - busH / 2 - 12;

      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(sensorX, sensorY, 9, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('SCAN', sensorX, sensorY + 3);

      if (sensor.id === 'inst_magnetometer') {
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx + busW / 2, cy - 10);
        ctx.lineTo(cx + busW / 2 + 35, cy - 30);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx + busW / 2 + 35, cy - 30, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Interactive Sockets Indicator Auras
    this.drawSocketHotspot(cx, cy, 'bus', 'CHASSIS', busW, busH);
    this.drawSocketHotspot(cx + busW * 0.2, cy - busH / 2 - 12, 'sensor', 'SENSOR', 24, 24, true);
    this.drawSocketHotspot(cx, cy + busH / 2 + 15, 'engine', 'ENGINE', 35, 24);
    this.drawSocketHotspot(cx - busW / 2 - 35, cy, 'power', 'POWER', 40, busH * 0.6);
    this.drawSocketHotspot(cx - busW * 0.25, cy - busH / 2 - 14, 'comm', 'ANTENNA', 24, 24, true);
  }

  drawSocketHotspot(x, y, socketName, label, w, h, isCircle = false) {
    const isSelected = this.selectedSocket === socketName;
    const ctx = this.ctx;

    ctx.save();
    if (isSelected) {
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';

      if (isCircle) {
        ctx.beginPath();
        ctx.arc(x, y, w / 2 + 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.strokeRect(x - w / 2 - 3, y - h / 2 - 3, w + 6, h + 6);
        ctx.fillRect(x - w / 2 - 3, y - h / 2 - 3, w + 6, h + 6);
      }

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`[${label} ACTIVE]`, x, y + (isCircle ? w / 2 + 14 : h / 2 + 12));
    }
    ctx.restore();
  }
}
