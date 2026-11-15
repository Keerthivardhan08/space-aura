/**
 * SPACE-AURA: Space Mission Systems Engineering Physics Engine
 * High-fidelity calculations for Mass, Delta-V, Power, Link Budget, and GMAT Orbital Vectors
 */

export const G0 = 9.80665; // Standard gravitational acceleration m/s^2

/**
 * Calculates GMAT-fidelity orbital state vectors & Keplerian elements
 */
export function calculateGmatOrbitVectors(targetOrbit) {
  if (!targetOrbit) return null;

  const mu = targetOrbit.gravitationalParamMu || 398600.44; // km^3/s^2
  const a = targetOrbit.semiMajorAxisKm || 6928; // km
  const e = targetOrbit.eccentricity || 0.001;
  const inc = targetOrbit.inclinationDeg || 0;

  // Mean body radius (approx)
  let bodyRadiusKm = 6378.14; // Earth
  if (targetOrbit.targetBody === 'Moon') bodyRadiusKm = 1737.4;
  else if (targetOrbit.targetBody === 'Mars') bodyRadiusKm = 3389.5;
  else if (targetOrbit.targetBody === 'Jupiter') bodyRadiusKm = 69911.0;

  const periapsisR = a * (1 - e);
  const apoapsisR = a * (1 + e);
  const periapsisAltKm = periapsisR - bodyRadiusKm;
  const apoapsisAltKm = apoapsisR - bodyRadiusKm;

  // Vis-Viva velocity calculations
  const velocityPeriapsisKmSec = Math.sqrt((mu / a) * ((1 + e) / (1 - e)));
  const velocityApoapsisKmSec = Math.sqrt((mu / a) * ((1 - e) / (1 + e)));
  const orbitalPeriodSec = 2 * Math.PI * Math.sqrt((a * a * a) / mu);

  return {
    mu,
    semiMajorAxisKm: a,
    eccentricity: e,
    inclinationDeg: inc,
    periapsisAltKm: Math.round(periapsisAltKm),
    apoapsisAltKm: Math.round(apoapsisAltKm),
    velocityPeriapsisKmSec: velocityPeriapsisKmSec.toFixed(2),
    velocityApoapsisKmSec: velocityApoapsisKmSec.toFixed(2),
    orbitalPeriodMin: (orbitalPeriodSec / 60).toFixed(1)
  };
}

/**
 * Calculates total mass breakdown including dry mass, propellant mass, and wet mass
 */
export function calculateMassBudget(design, componentsCatalog, targetOrbit, launchVehicle) {
  const bus = componentsCatalog.buses.find(b => b.id === design.busId);
  const power = componentsCatalog.power.find(p => p.id === design.powerId);
  const battery = componentsCatalog.batteries.find(b => b.id === design.batteryId);
  const propulsion = componentsCatalog.propulsion.find(p => p.id === design.propulsionId);
  const comm = componentsCatalog.comms.find(c => c.id === design.commId);
  const adcs = componentsCatalog.adcsThermal.find(a => a.id === design.adcsId);
  const thermal = componentsCatalog.adcsThermal.find(t => t.id === design.thermalId);
  
  const instruments = (design.instrumentIds || []).map(id => 
    componentsCatalog.instruments.find(i => i.id === id)
  ).filter(Boolean);

  let instrumentsMass = 0;
  instruments.forEach(inst => {
    instrumentsMass += inst.mass;
  });

  const busMass = bus ? bus.dryMass : 0;
  const powerMass = power ? power.mass : 0;
  const batteryMass = battery ? battery.mass : 0;
  const propulsionDryMass = propulsion ? propulsion.dryMass : 0;
  const commMass = comm ? comm.mass : 0;
  const adcsMass = adcs ? adcs.mass : 0;
  const thermalMass = thermal ? thermal.mass : 0;

  // 10% harness and structural cabling margin (standard aerospace practice)
  const subtotalDry = busMass + instrumentsMass + powerMass + batteryMass + propulsionDryMass + commMass + adcsMass + thermalMass;
  const harnessMarginMass = subtotalDry * 0.10;
  const totalDryMass = subtotalDry + harnessMarginMass;

  // Propellant Calculation via Tsiolkovsky Rocket Equation
  let deltaVNeeded = 0;
  if (targetOrbit) {
    // Station keeping + orbit maintenance delta-V for mission duration
    deltaVNeeded = (targetOrbit.deltaVStationKeeping || 30) * (design.missionLifetimeYears || 1);
    if (design.additionalDeltaVMs) {
      deltaVNeeded += design.additionalDeltaVMs;
    }
  }

  let propellantMass = 0;
  if (propulsion && propulsion.ispSeconds > 0 && deltaVNeeded > 0) {
    const exponent = deltaVNeeded / (propulsion.ispSeconds * G0);
    propellantMass = totalDryMass * (Math.exp(exponent) - 1);
    if (propulsion.fuelMass && propellantMass < propulsion.fuelMass) {
      propellantMass = propulsion.fuelMass;
    }
  } else if (propulsion && propulsion.fuelMass) {
    propellantMass = propulsion.fuelMass;
  }

  const wetMass = totalDryMass + propellantMass;

  // Calculate launch capacity for selected orbit & vehicle
  let launchCapacity = 0;
  let launchCompatible = true;
  let launchMessage = 'Compatible';

  if (launchVehicle && targetOrbit) {
    if (targetOrbit.targetBody === 'Earth') {
      launchCapacity = targetOrbit.id === 'orbit_geo' ? launchVehicle.leoCapacity * 0.40 : launchVehicle.leoCapacity;
    } else if (targetOrbit.targetBody === 'Moon') {
      launchCapacity = launchVehicle.tliCapacity;
    } else if (targetOrbit.targetBody === 'Mars') {
      launchCapacity = launchVehicle.marsCapacity;
    } else if (targetOrbit.targetBody === 'Jupiter') {
      launchCapacity = (launchVehicle.marsCapacity || 0) * 0.65;
    }

    if (launchCapacity <= 0) {
      launchCompatible = false;
      launchMessage = `${launchVehicle.name} cannot reach ${targetOrbit.targetBody}!`;
    } else if (wetMass > launchCapacity) {
      launchCompatible = false;
      launchMessage = `Spacecraft wet mass (${wetMass.toFixed(1)} kg) exceeds launcher capacity (${launchCapacity.toFixed(1)} kg)!`;
    }
  }

  const massMarginKg = launchCapacity - wetMass;
  const massMarginPct = launchCapacity > 0 ? (massMarginKg / launchCapacity) * 100 : -100;

  // Payload mass limit check against bus capacity
  const maxPayloadCapacity = bus ? bus.maxPayloadMass : 0;
  const payloadOverweight = instrumentsMass > maxPayloadCapacity;

  return {
    busMass,
    instrumentsMass,
    powerMass,
    batteryMass,
    propulsionDryMass,
    commMass,
    adcsMass,
    thermalMass,
    harnessMarginMass,
    totalDryMass,
    propellantMass,
    wetMass,
    launchCapacity,
    massMarginKg,
    massMarginPct,
    launchCompatible,
    launchMessage,
    maxPayloadCapacity,
    payloadOverweight
  };
}

/**
 * Calculates Electrical Power balance in daylight and shadow
 */
export function calculatePowerBudget(design, componentsCatalog, targetOrbit) {
  const bus = componentsCatalog.buses.find(b => b.id === design.busId);
  const power = componentsCatalog.power.find(p => p.id === design.powerId);
  const battery = componentsCatalog.batteries.find(b => b.id === design.batteryId);
  const comm = componentsCatalog.comms.find(c => c.id === design.commId);
  const adcs = componentsCatalog.adcsThermal.find(a => a.id === design.adcsId);
  const thermal = componentsCatalog.adcsThermal.find(t => t.id === design.thermalId);
  
  const instruments = (design.instrumentIds || []).map(id => 
    componentsCatalog.instruments.find(i => i.id === id)
  ).filter(Boolean);

  const solarDistAU = targetOrbit ? targetOrbit.solarFluxAU : 1.0;
  
  // Power Generation
  let powerGeneratedDayW = 0;
  if (power) {
    if (power.type === 'Nuclear') {
      powerGeneratedDayW = power.baseOutputWatts;
    } else {
      const solarMultiplier = 1 / (solarDistAU * solarDistAU);
      powerGeneratedDayW = power.baseOutputWatts * solarMultiplier;
    }
  }

  // Power Consumption (Daylight / Active Science)
  const busBaseW = bus ? bus.basePowerDrawW : 0;
  const commTxW = comm ? comm.powerTxW : 0;
  const adcsW = adcs ? adcs.powerDrawW : 0;
  const thermalW = thermal ? thermal.powerDrawW : 0;
  
  let instrumentsPowerW = 0;
  instruments.forEach(inst => {
    instrumentsPowerW += inst.powerDrawW;
  });

  const totalConsumptionDayW = busBaseW + instrumentsPowerW + commTxW + adcsW + thermalW;
  const netDaylightPowerBalanceW = powerGeneratedDayW - totalConsumptionDayW;

  // Shadow / Eclipse Calculations
  const periodMin = targetOrbit ? targetOrbit.periodMin : 90;
  const eclipseFraction = targetOrbit ? targetOrbit.eclipseFraction : 0.35;
  const eclipseDurationMin = periodMin * eclipseFraction;
  const daylightDurationMin = periodMin * (1 - eclipseFraction);

  const totalConsumptionNightW = busBaseW + (instrumentsPowerW * 0.3) + (commTxW * 0.2) + adcsW + thermalW + 10;
  
  let powerGeneratedNightW = 0;
  if (power && power.type === 'Nuclear') {
    powerGeneratedNightW = power.baseOutputWatts;
  }

  const netNightPowerBalanceW = powerGeneratedNightW - totalConsumptionNightW;

  const energyExpendedEclipseWh = Math.max(0, -netNightPowerBalanceW * (eclipseDurationMin / 60));
  const batteryCapacityWh = battery ? battery.capacityWh : 1;
  const actualDoD = (energyExpendedEclipseWh / batteryCapacityWh);
  const maxSafeDoD = battery ? battery.maxSafeDoD : 0.45;
  const batterySafe = actualDoD <= maxSafeDoD;

  const energyRechargedDaylightWh = Math.max(0, netDaylightPowerBalanceW * (daylightDurationMin / 60));
  const batteryRechargeHealthy = netDaylightPowerBalanceW > 0 && energyRechargedDaylightWh >= energyExpendedEclipseWh * 1.15;

  return {
    powerGeneratedDayW,
    powerGeneratedNightW,
    totalConsumptionDayW,
    totalConsumptionNightW,
    netDaylightPowerBalanceW,
    netNightPowerBalanceW,
    eclipseDurationMin,
    daylightDurationMin,
    energyExpendedEclipseWh,
    batteryCapacityWh,
    actualDoD: Math.min(1.0, actualDoD),
    maxSafeDoD,
    batterySafe,
    batteryRechargeHealthy,
    solarDistAU
  };
}

/**
 * Calculates Telemetry, Data Generation, Downlink and Link Margin
 */
export function calculateTelemetryBudget(design, componentsCatalog, targetOrbit) {
  const comm = componentsCatalog.comms.find(c => c.id === design.commId);
  const instruments = (design.instrumentIds || []).map(id => 
    componentsCatalog.instruments.find(i => i.id === id)
  ).filter(Boolean);

  let totalDataRateMbps = 0;
  instruments.forEach(inst => {
    totalDataRateMbps += inst.dataRateMbps;
  });

  const averageActiveSecondsPerDay = 86400 * 0.40;
  const dailyDataGeneratedGb = (totalDataRateMbps * averageActiveSecondsPerDay) / 8000;

  let groundContactMinutesPerDay = 50;
  if (targetOrbit) {
    if (targetOrbit.id === 'orbit_geo') groundContactMinutesPerDay = 1440;
    else if (targetOrbit.targetBody === 'Moon') groundContactMinutesPerDay = 240;
    else if (targetOrbit.targetBody === 'Mars') groundContactMinutesPerDay = 180;
    else if (targetOrbit.targetBody === 'Jupiter') groundContactMinutesPerDay = 120;
  }

  const maxDownlinkRateMbps = comm ? comm.maxDataRateMbps : 0.1;
  const dailyDownlinkCapacityGb = (maxDownlinkRateMbps * (groundContactMinutesPerDay * 60)) / 8000;

  const dataLinkMargin = dailyDownlinkCapacityGb / Math.max(0.01, dailyDataGeneratedGb);
  const bufferOverflowRisk = dataLinkMargin < 1.0;

  return {
    totalDataRateMbps,
    dailyDataGeneratedGb,
    groundContactMinutesPerDay,
    maxDownlinkRateMbps,
    dailyDownlinkCapacityGb,
    dataLinkMargin,
    bufferOverflowRisk,
    latencyMs: targetOrbit ? targetOrbit.downlinkLatencyMs : 10
  };
}

/**
 * Calculates Financial Cost and Budget Margins
 */
export function calculateCostBudget(design, componentsCatalog, scenario, launchVehicle) {
  const bus = componentsCatalog.buses.find(b => b.id === design.busId);
  const power = componentsCatalog.power.find(p => p.id === design.powerId);
  const battery = componentsCatalog.batteries.find(b => b.id === design.batteryId);
  const propulsion = componentsCatalog.propulsion.find(p => p.id === design.propulsionId);
  const comm = componentsCatalog.comms.find(c => c.id === design.commId);
  const adcs = componentsCatalog.adcsThermal.find(a => a.id === design.adcsId);
  const thermal = componentsCatalog.adcsThermal.find(t => t.id === design.thermalId);
  
  const instruments = (design.instrumentIds || []).map(id => 
    componentsCatalog.instruments.find(i => i.id === id)
  ).filter(Boolean);

  let instrumentsCost = 0;
  instruments.forEach(inst => {
    instrumentsCost += inst.cost;
  });

  const hardwareCost = (bus?.cost || 0) + (power?.cost || 0) + (battery?.cost || 0) + 
                       (propulsion?.cost || 0) + (comm?.cost || 0) + (adcs?.cost || 0) + 
                       (thermal?.cost || 0) + instrumentsCost;

  const launchCost = launchVehicle ? launchVehicle.cost : 0;
  const missionYears = (scenario.missionLifetimeDays || 365) / 365;
  const operationsCost = Math.max(1.5, hardwareCost * 0.08) * missionYears;
  const integrationTestingCost = hardwareCost * 0.15;

  const totalMissionCost = hardwareCost + launchCost + operationsCost + integrationTestingCost;
  const budgetCap = scenario.budgetCap || 200.0;
  const costMarginM = budgetCap - totalMissionCost;
  const costMarginPct = (costMarginM / budgetCap) * 100;
  const isOverBudget = costMarginM < 0;

  return {
    hardwareCost,
    instrumentsCost,
    launchCost,
    operationsCost,
    integrationTestingCost,
    totalMissionCost,
    budgetCap,
    costMarginM,
    costMarginPct,
    isOverBudget
  };
}

/**
 * Calculates Science Score & Synergies
 */
export function calculateScienceYield(design, componentsCatalog, scenario) {
  const instruments = (design.instrumentIds || []).map(id => 
    componentsCatalog.instruments.find(i => i.id === id)
  ).filter(Boolean);

  let rawPoints = 0;
  const instrumentCategories = new Set();
  const selectedIds = new Set(design.instrumentIds || []);

  instruments.forEach(inst => {
    let pointVal = inst.scienceYield;
    if (inst.primaryTarget && inst.primaryTarget.includes(scenario.targetBody)) {
      pointVal *= 1.20;
    }
    rawPoints += pointVal;
    instrumentCategories.add(inst.category);
  });

  let synergyBonusPct = 0;
  if (instrumentCategories.size >= 3) synergyBonusPct += 15;
  
  if (selectedIds.has('inst_neutron_spectrometer') && selectedIds.has('inst_lidar_altimeter')) {
    synergyBonusPct += 20; // Lunar Topographic Volatiles Correlation Bonus
  }
  if (selectedIds.has('inst_sar_radar') && selectedIds.has('inst_multispectral_cam')) {
    synergyBonusPct += 25; // Surface & Subsurface Multi-modal Radar-Optical Synergy
  }
  if (selectedIds.has('inst_mass_spectrometer') && selectedIds.has('inst_magnetometer')) {
    synergyBonusPct += 20; // Plume Dynamics & Field Induction Synergy
  }
  if (selectedIds.has('inst_csa_canadarm_boom')) {
    synergyBonusPct += 15; // International Robotics Inspection & Servicing Synergy
  }

  const finalSciencePoints = Math.round(rawPoints * (1 + synergyBonusPct / 100));
  const targetPoints = scenario.targetScienceScore || 200;
  const achievementPct = Math.min(200, Math.round((finalSciencePoints / targetPoints) * 100));

  return {
    rawPoints: Math.round(rawPoints),
    synergyBonusPct,
    finalSciencePoints,
    targetPoints,
    achievementPct
  };
}
