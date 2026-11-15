/**
 * SPACE-AURA: 4-Player Team Collaboration & AI Specialist Advisor System
 */

export const TEAM_ROLES = [
  {
    id: 'role_flight_director',
    title: 'Flight Director / Systems Lead',
    tag: 'MISSION DIRECTEUR',
    color: '#ef4444', // Crimson / Red
    aiAdvisor: {
      name: 'Cmdr. Sarah Hayes',
      callsign: 'FLIGHT',
      avatar: '👩‍🚀',
      title: 'NASA Flight Director'
    },
    ownedDecisions: ['launchVehicleId', 'orbitId'],
    responsibilities: [
      'Manage overall mission budget and schedule risk.',
      'Select launch vehicle compatible with mission mass and trajectory.',
      'Authorize terminal countdown and Go/No-Go flight readiness.'
    ],
    generateAdvice: (simState) => {
      const { massBudget, costBudget } = simState;
      if (costBudget.isOverBudget) {
        return {
          status: 'danger',
          text: `FLIGHT WARNING: Total cost ($${costBudget.totalMissionCost.toFixed(1)}M) exceeds budget cap ($${costBudget.budgetCap.toFixed(1)}M). We must downscale the bus or choose a rideshare launcher!`
        };
      }
      if (!massBudget.launchCompatible) {
        return {
          status: 'danger',
          text: `FLIGHT ALERT: Spacecraft wet mass exceeds launch vehicle capacity. Select a heavier booster or reduce payload mass.`
        };
      }
      if (massBudget.massMarginPct < 15) {
        return {
          status: 'warning',
          text: `FLIGHT CAUTION: Mass margin is ${massBudget.massMarginPct.toFixed(1)}% (below recommended 20% PDR margin). High risk of launch scrub.`
        };
      }
      return {
        status: 'nominal',
        text: `FLIGHT: Mass margin is healthy (+${massBudget.massMarginPct.toFixed(1)}%) and budget reserve is positive ($${costBudget.costMarginM.toFixed(1)}M). All systems GO for flight!`
      };
    }
  },
  {
    id: 'role_systems_engineer',
    title: 'Lead Systems & Thermal Engineer',
    tag: 'STRUCTURE & PROPULSION',
    color: '#06b6d4', // Cyan
    aiAdvisor: {
      name: 'Elena Vance',
      callsign: 'SYSTEMS',
      avatar: '🛠️',
      title: 'Senior Systems Architect'
    },
    ownedDecisions: ['busId', 'propulsionId', 'adcsId', 'thermalId'],
    responsibilities: [
      'Select spacecraft structural bus and payload mounting deck.',
      'Balance propulsion specific impulse (Isp) against required station-keeping delta-V.',
      'Ensure thermal protection and reaction wheel stability.'
    ],
    generateAdvice: (simState) => {
      const { massBudget } = simState;
      if (massBudget.payloadOverweight) {
        return {
          status: 'danger',
          text: `SYSTEMS ALERT: Payload instruments mass (${massBudget.instrumentsMass.toFixed(1)} kg) exceeds bus capacity (${massBudget.maxPayloadCapacity.toFixed(1)} kg)! Upgrade to an ESPA-Class bus.`
        };
      }
      return {
        status: 'nominal',
        text: `SYSTEMS: Structural mass fraction is ${((massBudget.totalDryMass / Math.max(1, massBudget.wetMass)) * 100).toFixed(0)}%. Delta-V propellant capacity is sufficient for mission lifetime.`
      };
    }
  },
  {
    id: 'role_power_telemetry',
    title: 'Power & Telemetry Specialist',
    tag: 'POWER & COMMS',
    color: '#f59e0b', // Amber
    aiAdvisor: {
      name: 'Dr. Marcus Chen',
      callsign: 'TELCOM',
      avatar: '⚡',
      title: 'Power & Telecommunications Lead'
    },
    ownedDecisions: ['powerId', 'batteryId', 'commId'],
    responsibilities: [
      'Design solar array or RTG power generation for solar distance.',
      'Verify battery capacity keeps Depth of Discharge (DoD) under safe cycling limits.',
      'Size antenna and frequency band to clear ground station link margin.'
    ],
    generateAdvice: (simState) => {
      const { powerBudget, commBudget } = simState;
      if (!powerBudget.batterySafe) {
        return {
          status: 'danger',
          text: `TELCOM WARNING: Battery Depth of Discharge during eclipse is ${(powerBudget.actualDoD * 100).toFixed(0)}% (exceeds ${(powerBudget.maxSafeDoD * 100).toFixed(0)}% limit!). Battery will degrade prematurely in shadow.`
        };
      }
      if (powerBudget.netDaylightPowerBalanceW < 0) {
        return {
          status: 'danger',
          text: `TELCOM CRITICAL: Negative power balance in sunlight (${powerBudget.netDaylightPowerBalanceW.toFixed(0)} W)! Panels cannot recharge batteries.`
        };
      }
      if (commBudget.bufferOverflowRisk) {
        return {
          status: 'warning',
          text: `TELCOM CAUTION: Downlink capacity (${commBudget.dailyDownlinkCapacityGb.toFixed(1)} GB/day) is less than daily data generation (${commBudget.dailyDataGeneratedGb.toFixed(1)} GB/day). Science data will be lost!`
        };
      }
      return {
        status: 'nominal',
        text: `TELCOM: Daylight net power is +${powerBudget.netDaylightPowerBalanceW.toFixed(0)} W. Battery DoD is safe at ${(powerBudget.actualDoD * 100).toFixed(0)}%. Link margin is ${(commBudget.dataLinkMargin).toFixed(1)}x.`
      };
    }
  },
  {
    id: 'role_science_director',
    title: 'Chief Scientist & Payload Director',
    tag: 'SCIENCE & PAYLOAD',
    color: '#ec4899', // Pink
    aiAdvisor: {
      name: 'Dr. Aris Thorne',
      callsign: 'SCIENCE',
      avatar: '🔬',
      title: 'Principal Investigator'
    },
    ownedDecisions: ['instrumentIds'],
    responsibilities: [
      'Select scientific payload suite to maximize mission science points.',
      'Leverage synergistic multi-instrument pairings.',
      'Ensure primary scientific mission objectives are completely fulfilled.'
    ],
    generateAdvice: (simState) => {
      const { scienceYield } = simState;
      if (scienceYield.finalSciencePoints < scienceYield.targetPoints) {
        return {
          status: 'warning',
          text: `SCIENCE NOTE: Projected science return (${scienceYield.finalSciencePoints} pts) is below target (${scienceYield.targetPoints} pts). Consider adding complementary sensors for synergy bonuses!`
        };
      }
      return {
        status: 'nominal',
        text: `SCIENCE: Excellent payload composition! Projected science return is ${scienceYield.finalSciencePoints} pts (${scienceYield.achievementPct}% of target) with a +${scienceYield.synergyBonusPct}% synergy multiplier!`
      };
    }
  }
];

export class TeamManager {
  constructor() {
    this.mode = 'solo'; // 'solo' or 'team'
    this.activeRoleIndex = 0;
    this.playerAssignments = {
      role_flight_director: 'Flight Director',
      role_systems_engineer: 'Systems Engineer',
      role_power_telemetry: 'Power Specialist',
      role_science_director: 'Chief Scientist'
    };
    this.roleApprovals = {
      role_flight_director: false,
      role_systems_engineer: false,
      role_power_telemetry: false,
      role_science_director: false
    };
  }

  setMode(mode) {
    this.mode = mode;
  }

  getActiveRole() {
    return TEAM_ROLES[this.activeRoleIndex];
  }

  switchRole(roleId) {
    const idx = TEAM_ROLES.findIndex(r => r.id === roleId);
    if (idx !== -1) {
      this.activeRoleIndex = idx;
    }
  }

  toggleApproval(roleId) {
    this.roleApprovals[roleId] = !this.roleApprovals[roleId];
    return this.roleApprovals[roleId];
  }

  allRolesApproved() {
    return Object.values(this.roleApprovals).every(v => v === true);
  }
}
