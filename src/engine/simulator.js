/**
 * ASTROFORGE: Operational Mission Simulator & ConOps Engine
 * Controls launch countdown, orbital propagation, telemetry streaming, dynamic events, and mission evaluation
 */

import { sound } from './audio.js';

export const SIMULATION_STAGES = {
  PRE_LAUNCH: 'PRE_LAUNCH',
  COUNTDOWN: 'COUNTDOWN',
  LAUNCH_ASCENT: 'LAUNCH_ASCENT',
  ORBITAL_INSERTION: 'ORBITAL_INSERTION',
  COMMISSIONING: 'COMMISSIONING',
  OPERATIONAL: 'OPERATIONAL',
  ANOMALY: 'ANOMALY',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED'
};

export class MissionSimulator {
  constructor(design, scenario, componentsCatalog, physicsEngine) {
    this.design = design;
    this.scenario = scenario;
    this.catalog = componentsCatalog;
    this.physics = physicsEngine;

    this.stage = SIMULATION_STAGES.PRE_LAUNCH;
    this.timeScale = 1; // 1x, 10x, 100x, 1000x
    this.missionElapsedSeconds = 0;
    this.missionElapsedDays = 0;
    this.currentOrbitAngle = 0; // 0 to 2*PI radians

    // Operational Telemetry States
    this.batterySoC = 1.0; // 100% state of charge
    this.storedDataGb = 0.0;
    this.downlinkedDataGb = 0.0;
    this.cumulativeSciencePoints = 0;
    this.fuelRemainingKg = 0;
    this.spacecraftTemperatureC = 18.0; // Nominal 18°C
    this.inEclipse = false;
    this.groundStationActive = false;
    this.contactTimeRemainingSec = 0;

    // Launch & Flight Telemetry
    this.countdownSeconds = 10;
    this.altitudeKm = 0;
    this.velocityKmSec = 0;
    this.dynamicPressureKPa = 0;

    // Log messages
    this.logs = [];
    this.activeAnomaly = null;
    this.resolvedAnomaliesCount = 0;
    this.anomaliesTriggered = 0;

    this.listeners = new Set();
    this.intervalId = null;

    this.initMetrics();
  }

  initMetrics() {
    const targetOrbit = this.catalog.orbits.find(o => o.id === this.design.orbitId);
    const launchVehicle = this.catalog.launchVehicles.find(lv => lv.id === this.design.launchVehicleId);
    
    this.massBudget = this.physics.calculateMassBudget(this.design, this.catalog, targetOrbit, launchVehicle);
    this.powerBudget = this.physics.calculatePowerBudget(this.design, this.catalog, targetOrbit);
    this.commBudget = this.physics.calculateTelemetryBudget(this.design, this.catalog, targetOrbit);
    this.costBudget = this.physics.calculateCostBudget(this.design, this.catalog, this.scenario, launchVehicle);
    this.scienceYield = this.physics.calculateScienceYield(this.design, this.catalog, this.scenario);

    this.fuelRemainingKg = this.massBudget.propellantMass;
    this.orbitPeriodMin = targetOrbit ? targetOrbit.periodMin : 96;
    this.maxLifetimeDays = this.scenario.missionLifetimeDays || 365;

    this.addLog('SYSTEM INITIALIZED', 'Flight software booted. Subsystem self-checks nominal.');
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify() {
    this.listeners.forEach(cb => cb(this.getState()));
  }

  addLog(tag, message, type = 'info') {
    const timestamp = this.stage === SIMULATION_STAGES.PRE_LAUNCH || this.stage === SIMULATION_STAGES.COUNTDOWN
      ? `T-${this.countdownSeconds}s`
      : `Day ${Math.floor(this.missionElapsedDays)} [${new Date(this.missionElapsedSeconds * 1000).toISOString().substr(11, 8)}]`;
    
    this.logs.unshift({ tag, message, type, timestamp, id: Date.now() + Math.random() });
    if (this.logs.length > 80) this.logs.pop();
  }

  startCountdown() {
    if (this.stage !== SIMULATION_STAGES.PRE_LAUNCH) return;

    // Pre-flight validation checks
    if (!this.massBudget.launchCompatible) {
      sound.playWarningKlaxon();
      this.stage = SIMULATION_STAGES.FAILED;
      this.failureReason = `Launch Vehicle Overweight: ${this.massBudget.launchMessage}`;
      this.addLog('LAUNCH SCRUBBED', this.failureReason, 'error');
      this.notify();
      return;
    }

    if (this.costBudget.isOverBudget) {
      sound.playWarningKlaxon();
      this.stage = SIMULATION_STAGES.FAILED;
      this.failureReason = `Budget Cap Exceeded: Mission cost $${this.costBudget.totalMissionCost.toFixed(1)}M exceeds cap of $${this.costBudget.budgetCap.toFixed(1)}M!`;
      this.addLog('BUDGET REJECTION', this.failureReason, 'error');
      this.notify();
      return;
    }

    this.stage = SIMULATION_STAGES.COUNTDOWN;
    this.countdownSeconds = 10;
    this.addLog('COUNTDOWN', 'Terminal countdown sequence initiated. Go for launch.', 'info');
    sound.playTelemetryPing();
    this.notify();

    const cdInterval = setInterval(() => {
      this.countdownSeconds--;
      if (this.countdownSeconds > 0) {
        sound.playBlip(600 + (10 - this.countdownSeconds) * 40, 0.06);
        this.notify();
      } else {
        clearInterval(cdInterval);
        this.executeLaunch();
      }
    }, 1000);
  }

  executeLaunch() {
    this.stage = SIMULATION_STAGES.LAUNCH_ASCENT;
    sound.playLaunchRumble(3.0);
    this.addLog('LIFTOFF', 'Main engine ignition! Liftoff from spaceport!', 'success');

    let ascentStep = 0;
    const ascentInterval = setInterval(() => {
      ascentStep++;
      this.altitudeKm = Math.min(this.altitudeKm + 28, 550);
      this.velocityKmSec = Math.min(this.velocityKmSec + 0.45, 7.6);
      this.dynamicPressureKPa = ascentStep <= 5 ? ascentStep * 8.2 : Math.max(0, 41 - (ascentStep - 5) * 8);

      if (ascentStep === 3) {
        this.addLog('MAX-Q', 'Vehicle passing through maximum aerodynamic dynamic pressure.', 'info');
      } else if (ascentStep === 6) {
        this.addLog('MECO & STAGING', 'Stage 1 separation confirmed. Stage 2 vacuum engine ignited.', 'info');
      } else if (ascentStep === 8) {
        this.addLog('FAIRING JETTISON', 'Payload fairing cleanly separated. Spacecraft exposed to space vacuum.', 'info');
      } else if (ascentStep >= 10) {
        clearInterval(ascentInterval);
        this.executeOrbitalInsertion();
      }
      this.notify();
    }, 600);
  }

  executeOrbitalInsertion() {
    this.stage = SIMULATION_STAGES.ORBITAL_INSERTION;
    sound.playSuccessChime();
    this.addLog('ORBIT INSERTION', 'Second stage cutoff (SECO). Spacecraft placed in target orbital plane.', 'success');

    setTimeout(() => {
      this.executeCommissioning();
    }, 1200);
  }

  executeCommissioning() {
    this.stage = SIMULATION_STAGES.COMMISSIONING;
    this.addLog('LEOP DEPLOYMENT', 'Deploying solar arrays and ADCS star tracker acquisition.', 'info');

    setTimeout(() => {
      this.addLog('CARRIER ACQUIRED', 'Ground station telemetry lock verified. Spacecraft healthy.', 'success');
      this.stage = SIMULATION_STAGES.OPERATIONAL;
      sound.startAmbientDrone();
      this.startOperationalLoop();
    }, 1500);
  }

  setTimeScale(scale) {
    this.timeScale = scale;
    sound.playTelemetryPing();
    this.notify();
  }

  startOperationalLoop() {
    if (this.intervalId) clearInterval(this.intervalId);

    const tickRateMs = 100; // 10 updates per second
    this.intervalId = setInterval(() => {
      if (this.stage !== SIMULATION_STAGES.OPERATIONAL) return;

      // Simulated seconds passing per tick
      const dtSec = (tickRateMs / 1000) * this.timeScale * 25;
      this.missionElapsedSeconds += dtSec;
      this.missionElapsedDays = this.missionElapsedSeconds / 86400;

      // Update orbital position
      const orbitSec = this.orbitPeriodMin * 60;
      this.currentOrbitAngle = (this.currentOrbitAngle + (dtSec / orbitSec) * 2 * Math.PI) % (2 * Math.PI);

      // Determine Day/Night Eclipse state
      // Eclipse occurs in the region PI - halfEclipseAngle to PI + halfEclipseAngle
      const eclipseFraction = this.powerBudget.eclipseDurationMin / this.orbitPeriodMin;
      const halfEclipseAngle = eclipseFraction * Math.PI;
      const angleNormalized = this.currentOrbitAngle % (2 * Math.PI);
      this.inEclipse = angleNormalized >= (Math.PI - halfEclipseAngle) && angleNormalized <= (Math.PI + halfEclipseAngle);

      // Power and Battery Simulation
      if (this.inEclipse) {
        // Draw power from battery
        const netDischargeWatts = Math.abs(this.powerBudget.netNightPowerBalanceW);
        const energyLostWh = (netDischargeWatts * dtSec) / 3600;
        const dodChange = energyLostWh / this.powerBudget.batteryCapacityWh;
        this.batterySoC = Math.max(0.05, this.batterySoC - dodChange);
        this.spacecraftTemperatureC = Math.max(-12, this.spacecraftTemperatureC - 0.05 * dtSec);
      } else {
        // Recharge battery with net daylight power
        const netChargeWatts = Math.max(0, this.powerBudget.netDaylightPowerBalanceW);
        const energyGainedWh = (netChargeWatts * dtSec * 0.90) / 3600; // 90% charge efficiency
        const socGain = energyGainedWh / this.powerBudget.batteryCapacityWh;
        this.batterySoC = Math.min(1.0, this.batterySoC + socGain);
        this.spacecraftTemperatureC = Math.min(24, this.spacecraftTemperatureC + 0.04 * dtSec);
      }

      // Check battery critical health
      if (this.batterySoC <= 0.08) {
        this.addLog('POWER CRISIS', 'Battery reserves critically depleted (<8%). Instrument safing engaged!', 'error');
        sound.playWarningKlaxon();
      }

      // Data and Telemetry Generation
      const dataRateSecGb = (this.commBudget.totalDataRateMbps / 8000) * (dtSec);
      if (this.batterySoC > 0.15) {
        this.storedDataGb = Math.min(100.0, this.storedDataGb + dataRateSecGb * 0.4); // 40% observation duty
      }

      // Ground Station Pass Scheduling
      // Pass occurs every orbit for a slice of time
      const groundContactFraction = (this.commBudget.groundContactMinutesPerDay / 1440);
      const isOverStation = (this.currentOrbitAngle >= 0 && this.currentOrbitAngle <= (groundContactFraction * 2 * Math.PI));

      if (isOverStation) {
        this.groundStationActive = true;
        // Downlink stored science data
        const maxDownlinkSecGb = (this.commBudget.maxDownlinkRateMbps / 8000) * dtSec;
        const downlinked = Math.min(this.storedDataGb, maxDownlinkSecGb);
        this.storedDataGb -= downlinked;
        this.downlinkedDataGb += downlinked;

        // Convert downlinked data into cumulative science points
        const pointsPerGb = (this.scienceYield.finalSciencePoints) / Math.max(1, (this.commBudget.dailyDataGeneratedGb * this.maxLifetimeDays * 0.5));
        this.cumulativeSciencePoints = Math.min(
          this.scienceYield.finalSciencePoints,
          this.cumulativeSciencePoints + (downlinked * pointsPerGb)
        );
      } else {
        this.groundStationActive = false;
      }

      // Random Space Weather & Flight Anomaly Triggers
      this.checkAnomalyTriggers();

      // Check Mission Completion
      if (this.missionElapsedDays >= this.maxLifetimeDays) {
        this.completeMission();
      }

      this.notify();
    }, tickRateMs);
  }

  checkAnomalyTriggers() {
    if (this.activeAnomaly || this.anomaliesTriggered >= 3) return;

    // Trigger an anomaly around day 15, day 75, or day 180
    const triggerDayTargets = [15, 60, 140];
    const target = triggerDayTargets[this.anomaliesTriggered];

    if (this.missionElapsedDays >= target && !this.activeAnomaly) {
      this.anomaliesTriggered++;
      this.triggerRandomAnomaly();
    }
  }

  triggerRandomAnomaly() {
    const ANOMALY_EVENTS = [
      {
        id: 'cme_solar_storm',
        title: 'ALERT: Coronal Mass Ejection (CME) Detected',
        severity: 'Critical Space Weather',
        description: 'NASA SOHO/SDO observatories detect an X-class solar flare directed toward the spacecraft trajectory. High-energy solar protons incoming in 30 minutes!',
        options: [
          {
            text: 'Rotate Solar Arrays Edgewise & Enter Safe Mode (Protects electronics, halts science for 48h)',
            effect: () => {
              this.addLog('SAFE MODE', 'Solar arrays oriented edgewise. Avionics protected during solar proton storm.', 'success');
              this.missionElapsedSeconds += 86400 * 2; // Fast forward 2 days
              this.resolveAnomaly();
            }
          },
          {
            text: 'Maintain Science Observations (Risk memory bit-flips and sensor degradation)',
            effect: () => {
              const damageRoll = Math.random();
              if (damageRoll > 0.4) {
                this.batterySoC = Math.max(0.2, this.batterySoC - 0.25);
                this.addLog('RADIATION DAMAGE', 'Solar cells experienced 12% lattice degradation from proton bombardment.', 'error');
              } else {
                this.cumulativeSciencePoints += 25; // Bonus rare solar event data!
                this.addLog('HIGH VALUE SCIENCE', 'Spectrometers captured unprecedented in-situ coronal mass ejection shockwave data!', 'success');
              }
              this.resolveAnomaly();
            }
          }
        ]
      },
      {
        id: 'reaction_wheel_saturation',
        title: 'WARNING: Reaction Wheel Momentum Saturation',
        severity: 'Guidance & Navigation',
        description: 'Atmospheric drag and solar radiation pressure have caused reaction wheels to reach 95% maximum RPM. Spacecraft will lose fine pointing lock in 3 orbits.',
        options: [
          {
            text: 'Fire RCS Thrusters for Momentum Dump (Consumes 2.5 kg propellant, restores 100% ADCS)',
            effect: () => {
              this.fuelRemainingKg = Math.max(0, this.fuelRemainingKg - 2.5);
              this.addLog('RCS DESATURATION', 'Cold gas / monopropellant thrusters fired. Reaction wheels desaturated successfully.', 'success');
              this.resolveAnomaly();
            }
          },
          {
            text: 'Use Magnetic Torquers (Slow, zero propellant, but 1 orbit pointing disruption)',
            effect: () => {
              this.addLog('MAGNETIC DESAT', 'Magnetic torquers neutralized angular momentum against planetary magnetosphere.', 'info');
              this.resolveAnomaly();
            }
          }
        ]
      },
      {
        id: 'target_of_opportunity',
        title: 'DISCOVERY: Dynamic Transient Phenomenon Observed',
        severity: 'High Priority Science',
        description: 'Onboard autonomous edge computing detected an unexpected thermal hotspot / water vapor venting event! Redirecting instruments could yield breakthrough discoveries.',
        options: [
          {
            text: 'Repoint Primary Instruments & Trigger Burst Observation Mode (+40 Science Points, heavy power draw)',
            effect: () => {
              this.cumulativeSciencePoints += 40;
              this.batterySoC = Math.max(0.15, this.batterySoC - 0.20);
              this.addLog('BREAKTHROUGH SCIENCE', 'Burst observation successful! Dynamic target imaged in multispectral detail.', 'success');
              sound.playSuccessChime();
              this.resolveAnomaly();
            }
          },
          {
            text: 'Continue Nominal Baseline Survey (Conserve power and stick to pre-planned schedule)',
            effect: () => {
              this.addLog('BASELINE CONTINUED', 'Flight operations maintained baseline survey timeline.', 'info');
              this.resolveAnomaly();
            }
          }
        ]
      }
    ];

    const chosen = ANOMALY_EVENTS[Math.floor(Math.random() * ANOMALY_EVENTS.length)];
    this.activeAnomaly = chosen;
    sound.playWarningKlaxon();
    this.addLog('SYSTEM ANOMALY', chosen.title, 'warning');
    this.notify();
  }

  resolveAnomaly() {
    this.activeAnomaly = null;
    this.resolvedAnomaliesCount++;
    this.notify();
  }

  completeMission() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.stage = SIMULATION_STAGES.COMPLETED;
    sound.playSuccessChime();
    this.addLog('MISSION CONCLUDED', `Nominal mission operations completed after ${Math.floor(this.missionElapsedDays)} days in space.`, 'success');
    this.notify();
  }

  getState() {
    return {
      stage: this.stage,
      timeScale: this.timeScale,
      missionElapsedSeconds: this.missionElapsedSeconds,
      missionElapsedDays: this.missionElapsedDays,
      currentOrbitAngle: this.currentOrbitAngle,
      batterySoC: this.batterySoC,
      storedDataGb: this.storedDataGb,
      downlinkedDataGb: this.downlinkedDataGb,
      cumulativeSciencePoints: Math.round(this.cumulativeSciencePoints),
      fuelRemainingKg: this.fuelRemainingKg,
      spacecraftTemperatureC: this.spacecraftTemperatureC,
      inEclipse: this.inEclipse,
      groundStationActive: this.groundStationActive,
      countdownSeconds: this.countdownSeconds,
      altitudeKm: this.altitudeKm,
      velocityKmSec: this.velocityKmSec,
      dynamicPressureKPa: this.dynamicPressureKPa,
      activeAnomaly: this.activeAnomaly,
      resolvedAnomaliesCount: this.resolvedAnomaliesCount,
      logs: this.logs,
      massBudget: this.massBudget,
      powerBudget: this.powerBudget,
      commBudget: this.commBudget,
      costBudget: this.costBudget,
      scienceYield: this.scienceYield
    };
  }
}
