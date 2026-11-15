/**
 * SPACE-AURA: Mission Evaluation & NASA Concept Maturity Level (CML) Scoring Engine
 * Enhanced with Real NASA Analog Mission Matcher (from 'A Learning Game About Telescopes')
 * and CubeSat 101 Compliance (from NASA CSLI)
 */

import { NASA_ANALOG_MISSIONS, CUBESAT_101_GUIDELINES } from '../config/educational.js';

export function evaluateMissionResults(simState, scenario) {
  const { massBudget, powerBudget, commBudget, costBudget, scienceYield, cumulativeSciencePoints, batterySoC, design } = simState;

  const targetScience = scenario.targetScienceScore || 200;
  const scienceCollected = cumulativeSciencePoints || 0;
  const sciencePct = Math.round((scienceCollected / targetScience) * 100);

  // Determine Mission Outcome
  let outcome = 'FULL_SUCCESS';
  let rank = 'S-RANK: PIONEER CLASS';
  let badgeColor = '#10b981'; // Emerald
  let summaryText = '';

  if (simState.stage === 'FAILED') {
    outcome = 'MISSION_FAILURE';
    rank = 'F-RANK: LOSS OF MISSION';
    badgeColor = '#ef4444'; // Red
    summaryText = simState.failureReason || 'Mission suffered catastrophic failure before completing objectives.';
  } else if (sciencePct >= 110 && massBudget.massMarginPct >= 15 && !costBudget.isOverBudget && batterySoC > 0.3) {
    outcome = 'EXEMPLARY_SUCCESS';
    rank = 'S-RANK: PIONEER CLASS';
    badgeColor = '#10b981';
    summaryText = 'Outstanding systems engineering! The spacecraft exceeded all primary science goals with robust engineering margins.';
  } else if (sciencePct >= 90 && !costBudget.isOverBudget) {
    outcome = 'FULL_SUCCESS';
    rank = 'A-RANK: DISCOVERY CLASS';
    badgeColor = '#3b82f6'; // Blue
    summaryText = 'Full mission success achieved. All primary mission requirements and science return targets fulfilled.';
  } else if (sciencePct >= 65) {
    outcome = 'PARTIAL_SUCCESS';
    rank = 'B-RANK: EXPLORER CLASS';
    badgeColor = '#f59e0b'; // Amber
    summaryText = 'Partial mission success. Core science threshold achieved, but secondary objectives or margins were constrained.';
  } else {
    outcome = 'MINIMAL_SUCCESS';
    rank = 'C-RANK: SUB-OPTIMAL';
    badgeColor = '#f97316'; // Orange
    summaryText = 'Sub-optimal performance. Downlink bottlenecks or power deficits limited total scientific data collection.';
  }

  // Calculate NASA Concept Maturity Level (CML)
  let cmlScore = 1;
  const cmlJustifications = [];

  if (design?.orbitId && design?.busId) {
    cmlScore = 2; // Physics & orbit checked
    cmlJustifications.push('Target orbit and bus platform physics verified (CML 2 Feasibility)');
  }
  if (design?.instrumentIds?.length > 0 && design?.powerId) {
    cmlScore = 3; // Subsystem trade studies evaluated (NASA MDL phase)
    cmlJustifications.push('Trade studies across instruments, power, and propulsion completed (CML 3 Architecture Trades)');
  }
  if (massBudget.massMarginPct >= 15 && powerBudget.batterySafe && !costBudget.isOverBudget) {
    cmlScore = 4; // Point Design baseline balanced
    cmlJustifications.push('Point design baseline achieved with >=15% mass margin and safe battery DoD (CML 4 Baseline)');
  }
  if (cmlScore >= 4 && commBudget.dataLinkMargin >= 1.0) {
    cmlScore = 5; // Detailed formulation with ground network interface
    cmlJustifications.push('Ground segment link budget positive and operational timeline validated (CML 5 Formulation)');
  }
  if (cmlScore >= 5 && (outcome === 'FULL_SUCCESS' || outcome === 'EXEMPLARY_SUCCESS')) {
    cmlScore = 6; // Ready for Preliminary Design Review (PDR)
    cmlJustifications.push('Systems integration demonstrates high probability of mission success (CML 6 PDR Milestone Passed)');
  }

  // Real NASA Analog Mission Matcher (from 'A Learning Game About Telescopes')
  let matchedAnalog = findClosestNasaAnalog(scenario, design);

  // CubeSat 101 Compliance Checker
  const cubesatCheck = checkCubeSat101Compliance(design, massBudget);

  // Science Return per Dollar ($M)
  const sciencePerMillion = (scienceCollected / Math.max(1, costBudget.totalMissionCost)).toFixed(2);

  return {
    outcome,
    rank,
    badgeColor,
    summaryText,
    sciencePct,
    scienceCollected,
    targetScience,
    cmlScore,
    cmlJustifications,
    sciencePerMillion,
    massMarginPct: massBudget.massMarginPct.toFixed(1),
    costMarginPct: costBudget.costMarginPct.toFixed(1),
    batteryEndSoC: (batterySoC * 100).toFixed(1),
    matchedAnalog,
    cubesatCheck
  };
}

function findClosestNasaAnalog(scenario, design) {
  let bestMatch = NASA_ANALOG_MISSIONS[0];
  let bestScore = -1;

  NASA_ANALOG_MISSIONS.forEach(mission => {
    let score = 0;
    if (mission.matchCriteria.targetBody === scenario.targetBody) score += 40;
    
    // Check instrument overlaps
    const userInsts = new Set(design?.instrumentIds || []);
    (mission.matchCriteria.instruments || []).forEach(instId => {
      if (userInsts.has(instId)) score += 30;
    });

    if (score > bestScore) {
      bestScore = score;
      bestMatch = mission;
    }
  });

  return bestMatch;
}

function checkCubeSat101Compliance(design, massBudget) {
  const isCubeSat = design?.busId === 'bus_cubesat_12u';
  if (!isCubeSat) {
    return { isSmallSat: false, compliant: true, message: 'N/A (Standard Medium/Flagship Explorer Class)' };
  }

  const compliantMass = massBudget.wetMass <= 24.0; // 12U mass limit
  const message = compliantMass 
    ? 'Compliant with NASA CSLI / P-POD canister envelope (<=24.0 kg)'
    : 'Exceeds standard 12U CubeSat canister mass limit (Max 24.0 kg)';

  return {
    isSmallSat: true,
    compliant: compliantMass,
    message,
    deOrbitRule: 'Natural atmospheric de-orbit compliant (<600 km LEO)'
  };
}
