/**
 * SPACE-AURA: Spacecraft Modular Blueprint & Subsystems Assembly Visualizer
 * Renders an interactive 2D blueprint of the designed spacecraft with dynamic subsystem callouts
 */

export class SpacecraftBlueprintVisualizer {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.design = null;
    this.catalog = null;
  }

  update(design, catalog) {
    this.design = design;
    this.catalog = catalog;
    this.render();
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

  render() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const w = this.width || rect.width || 400;
    const h = this.height || rect.height || 340;
    const ctx = this.ctx;
    const cx = w / 2;
    const cy = h / 2;

    // Blueprint grid background
    ctx.fillStyle = '#09101d';
    ctx.fillRect(0, 0, w, h);

    // Subtle cyan engineering grid
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

    if (!this.design || !this.catalog) {
      ctx.fillStyle = '#64748b';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('SELECT BUS PLATFORM TO COMMENCE ASSEMBLY', cx, cy);
      return;
    }

    const bus = this.catalog.buses.find(b => b.id === this.design.busId);
    const power = this.catalog.power.find(p => p.id === this.design.powerId);
    const comm = this.catalog.comms.find(c => c.id === this.design.commId);
    const propulsion = this.catalog.propulsion.find(p => p.id === this.design.propulsionId);
    const instruments = (this.design.instrumentIds || []).map(id => 
      this.catalog.instruments.find(i => i.id === id)
    ).filter(Boolean);

    // Bus dimensions based on class
    let busW = 70;
    let busH = 90;
    let busColor = '#38bdf8';
    let busName = 'CubeSat 12U';

    if (bus?.id === 'bus_espa_medium') {
      busW = 100;
      busH = 110;
      busColor = '#06b6d4';
      busName = 'ESPA Medium Bus';
    } else if (bus?.id === 'bus_flagship') {
      busW = 130;
      busH = 140;
      busColor = '#6366f1';
      busName = 'Flagship Science Platform';
    }

    // 1. Draw Solar Wings / Power System
    if (power) {
      ctx.save();
      if (power.type === 'Nuclear') {
        // RTG: Dark cylinder with cooling fins
        ctx.fillStyle = '#475569';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.fillRect(cx - 20, cy - busH / 2 - 38, 40, 28);
        ctx.strokeRect(cx - 20, cy - busH / 2 - 38, 40, 28);

        // Cooling radiator fins
        for (let fx = cx - 18; fx <= cx + 18; fx += 8) {
          ctx.beginPath();
          ctx.moveTo(fx, cy - busH / 2 - 44);
          ctx.lineTo(fx, cy - busH / 2 - 10);
          ctx.stroke();
        }
        // Radiation trefoil symbol placeholder
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('RTG-238', cx, cy - busH / 2 - 20);
      } else if (power.id === 'pwr_body_panels') {
        // Subtle blue surface solar cells
        ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.fillRect(cx - busW / 2 + 4, cy - busH / 2 + 4, busW - 8, busH - 8);
      } else {
        // Deployable solar wings on left and right
        const wingW = power.id === 'pwr_large_articulated' ? 120 : 75;
        const wingH = busH * 0.7;

        // Left Wing
        ctx.fillStyle = '#0284c7';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.fillRect(cx - busW / 2 - wingW, cy - wingH / 2, wingW, wingH);
        ctx.strokeRect(cx - busW / 2 - wingW, cy - wingH / 2, wingW, wingH);

        // Solar cell grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 1;
        for (let gx = cx - busW / 2 - wingW; gx < cx - busW / 2; gx += 20) {
          ctx.beginPath();
          ctx.moveTo(gx, cy - wingH / 2);
          ctx.lineTo(gx, cy + wingH / 2);
          ctx.stroke();
        }

        // Right Wing
        ctx.fillStyle = '#0284c7';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.fillRect(cx + busW / 2, cy - wingH / 2, wingW, wingH);
        ctx.strokeRect(cx + busW / 2, cy - wingH / 2, wingW, wingH);

        for (let gx = cx + busW / 2; gx < cx + busW / 2 + wingW; gx += 20) {
          ctx.beginPath();
          ctx.moveTo(gx, cy - wingH / 2);
          ctx.lineTo(gx, cy + wingH / 2);
          ctx.stroke();
        }

        // Wing deployment hinges
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(cx - busW / 2 - 4, cy - 6, 4, 12);
        ctx.fillRect(cx + busW / 2, cy - 6, 4, 12);
      }
      ctx.restore();
    }

    // 2. Draw Propulsion Main Engine / Thrusters at bottom
    if (propulsion) {
      ctx.save();
      const nozW = 22;
      const nozH = 26;
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.moveTo(cx - 8, cy + busH / 2);
      ctx.lineTo(cx + 8, cy + busH / 2);
      ctx.lineTo(cx + nozW / 2, cy + busH / 2 + nozH);
      ctx.lineTo(cx - nozW / 2, cy + busH / 2 + nozH);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Ion engine blue glow if electric
      if (propulsion.id === 'prop_hall_ion') {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.beginPath();
        ctx.ellipse(cx, cy + busH / 2 + nozH + 6, 12, 6, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 3. Draw Central Spacecraft Bus Chassis
    ctx.save();
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = busColor;
    ctx.lineWidth = 2;
    ctx.fillRect(cx - busW / 2, cy - busH / 2, busW, busH);
    ctx.strokeRect(cx - busW / 2, cy - busH / 2, busW, busH);

    // Multi-Layer Insulation (MLI) gold/silver texture or structural trusses
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - busW / 2, cy - busH / 2);
    ctx.lineTo(cx + busW / 2, cy + busH / 2);
    ctx.moveTo(cx + busW / 2, cy - busH / 2);
    ctx.lineTo(cx - busW / 2, cy + busH / 2);
    ctx.stroke();

    // Central avionics core box
    ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
    ctx.fillRect(cx - 20, cy - 20, 40, 40);
    ctx.strokeStyle = '#64748b';
    ctx.strokeRect(cx - 20, cy - 20, 40, 40);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('AVIONICS', cx, cy - 4);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(busName.toUpperCase(), cx, cy + 10);
    ctx.restore();

    // 4. Draw Communications Antenna
    if (comm) {
      ctx.save();
      const dishY = cy - busH / 2 - 18;
      if (comm.id === 'comm_ka_band_dish') {
        // Large steerable dish
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(cx, dishY, 26, Math.PI * 0.85, Math.PI * 0.15);
        ctx.stroke();

        // Feed horn
        ctx.beginPath();
        ctx.moveTo(cx, dishY);
        ctx.lineTo(cx, dishY - 14);
        ctx.stroke();
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(cx, dishY - 14, 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (comm.id === 'comm_optical_laser') {
        // Laser optical telescope tube
        ctx.fillStyle = '#10b981';
        ctx.fillRect(cx - 6, cy - busH / 2 - 24, 12, 24);
        ctx.fillStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.beginPath();
        ctx.arc(cx, cy - busH / 2 - 24, 8, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Omni / X-band horn
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy - busH / 2);
        ctx.lineTo(cx, cy - busH / 2 - 16);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy - busH / 2 - 16, 4, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 5. Draw Mounted Science Instruments & Callouts
    instruments.forEach((inst, idx) => {
      ctx.save();
      const angle = (idx / Math.max(1, instruments.length)) * Math.PI * 2;
      const slotX = cx + Math.cos(angle) * (busW * 0.35);
      const slotY = cy + Math.sin(angle) * (busH * 0.35);

      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(slotX, slotY, 5, 0, Math.PI * 2);
      ctx.fill();

      // If magnetometer boom, draw an extended boom
      if (inst.id === 'inst_magnetometer') {
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx + busW / 2, cy);
        ctx.lineTo(cx + busW / 2 + 45, cy - 25);
        ctx.stroke();
        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        ctx.arc(cx + busW / 2 + 45, cy - 25, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    // Subsystems Header Callout
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`SPACECRAFT BLUEPRINT: ${busName}`, 12, 20);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px monospace';
    ctx.fillText(`PAYLOADS MOUNTED: ${instruments.length}`, 12, 34);
  }
}
