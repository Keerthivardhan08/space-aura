/**
 * ASTROFORGE: Campaign Progress, Tech Tree & Game State Manager
 */

import { CAMPAIGN_LEVELS } from './levels.js';

export const TECH_TREE_ITEMS = [
  {
    id: 'tech_ion_engine',
    name: 'Hall-Effect Electric Ion Engine',
    category: 'Propulsion',
    costCredits: 800,
    requiresLevel: 2,
    unlocked: false,
    benefit: 'Massive specific impulse (1850s). Uses 80% less propellant for orbital maneuvers!'
  },
  {
    id: 'tech_rtg_nuclear',
    name: 'Plutonium-238 Nuclear RTG',
    category: 'Power',
    costCredits: 1500,
    requiresLevel: 3,
    unlocked: false,
    benefit: 'Continuous 125W electrical power independent of planetary eclipses or solar distance!'
  },
  {
    id: 'tech_optical_laser',
    name: 'Deep Space Optical Laser Transceiver',
    category: 'Comms',
    costCredits: 1200,
    requiresLevel: 2,
    unlocked: false,
    benefit: 'Ultra high-speed 350 Mbps downlink rate to clear data buffers in seconds!'
  },
  {
    id: 'tech_canadarm',
    name: 'Canadarm Robotic Inspection Boom (CSA)',
    category: 'Robotics',
    costCredits: 1000,
    requiresLevel: 3,
    unlocked: false,
    benefit: 'Automatically absorbs 1 space debris collision without taking hull damage!'
  }
];

export const DEFAULT_LAUNCHED_FLEET = [
  {
    id: 'sat_iss',
    name: 'ISS (International Space Station)',
    callsign: 'ALPHA-01',
    targetBody: 'earth',
    orbitType: 'LEO',
    semiMajorAxis: 24.5,
    eccentricity: 0.005,
    inclination: 0.45,
    orbitPeriodSec: 50,
    color: '#38bdf8',
    status: 'ACTIVE / CREWED LAB',
    launchDate: '1998-11-20',
    altitudeKm: 420
  },
  {
    id: 'sat_hubble',
    name: 'Hubble Space Telescope',
    callsign: 'HST-01',
    targetBody: 'earth',
    orbitType: 'LEO',
    semiMajorAxis: 26.2,
    eccentricity: 0.012,
    inclination: 0.28,
    orbitPeriodSec: 56,
    color: '#a855f7',
    status: 'ACTIVE / DEEP OBSERVATION',
    launchDate: '1990-04-24',
    altitudeKm: 540
  },
  {
    id: 'sat_goes',
    name: 'GOES-18 Geostationary Sentinel',
    callsign: 'GOES-EAST',
    targetBody: 'earth',
    orbitType: 'GEO',
    semiMajorAxis: 42.0,
    eccentricity: 0.002,
    inclination: 0.05,
    orbitPeriodSec: 110,
    color: '#10b981',
    status: 'ACTIVE / METEOROLOGY',
    launchDate: '2022-03-01',
    altitudeKm: 35786
  },
  {
    id: 'sat_lro',
    name: 'Lunar Reconnaissance Orbiter (LRO)',
    callsign: 'LRO-POLAR',
    targetBody: 'moon',
    orbitType: 'Lunar Polar',
    semiMajorAxis: 22.0,
    eccentricity: 0.04,
    inclination: 1.45,
    orbitPeriodSec: 46,
    color: '#f59e0b',
    status: 'ACTIVE / ICE PROSPECTING',
    launchDate: '2009-06-18',
    altitudeKm: 100
  },
  {
    id: 'sat_mro',
    name: 'Mars Reconnaissance Orbiter (MRO)',
    callsign: 'MRO-HI-RISE',
    targetBody: 'mars',
    orbitType: 'Areocentric Sun-Sync',
    semiMajorAxis: 24.0,
    eccentricity: 0.02,
    inclination: 1.62,
    orbitPeriodSec: 54,
    color: '#ef4444',
    status: 'ACTIVE / RELAY & HI-RES',
    launchDate: '2005-08-12',
    altitudeKm: 300
  }
];

export class GameManager {
  constructor() {
    this.totalStars = 0;
    this.credits = 1000; // Starting budget
    this.unlockedLevelIndex = CAMPAIGN_LEVELS.length; // ALL 9 MISSIONS UNLOCKED BY DEFAULT
    this.currentLevelIndex = 0;
    this.levelScores = {};
    this.launchedFleet = [...DEFAULT_LAUNCHED_FLEET];

    this.techTree = TECH_TREE_ITEMS;
    this.loadSaveData();
    // Guarantee all missions remain unlocked
    this.unlockedLevelIndex = CAMPAIGN_LEVELS.length;
  }

  loadSaveData() {
    try {
      const saved = localStorage.getItem('astroforge_save_v1');
      if (saved) {
        const data = JSON.parse(saved);
        this.totalStars = data.totalStars || 0;
        this.credits = data.credits || 1000;
        this.unlockedLevelIndex = CAMPAIGN_LEVELS.length; // Always keep all unlocked
        this.currentLevelIndex = (data.currentLevelIndex !== undefined && data.currentLevelIndex < CAMPAIGN_LEVELS.length) 
          ? data.currentLevelIndex 
          : 0;
        this.levelScores = data.levelScores || {};
        if (data.launchedFleet && Array.isArray(data.launchedFleet) && data.launchedFleet.length > 0) {
          this.launchedFleet = data.launchedFleet;
        }
      }
    } catch (e) {
      // LocalStorage fallback
    }
  }

  saveData() {
    try {
      const data = {
        totalStars: this.totalStars,
        credits: this.credits,
        unlockedLevelIndex: CAMPAIGN_LEVELS.length,
        currentLevelIndex: this.currentLevelIndex,
        levelScores: this.levelScores,
        launchedFleet: this.launchedFleet
      };
      localStorage.setItem('astroforge_save_v1', JSON.stringify(data));
    } catch (e) {
      // LocalStorage fallback
    }
  }

  registerLaunchedMission(level, loadout, orbitParams = {}) {
    const titleClean = level.title.split(':')[1]?.trim() || level.title;
    const craftName = loadout?.name || 'Spacecraft';
    const tag = `AF-M${level.levelNumber || 1}`;

    const newSat = {
      id: `sat_usr_${Date.now()}`,
      name: `${titleClean} (${craftName})`,
      callsign: tag,
      missionId: level.id,
      missionTitle: level.title,
      targetBody: level.targetBody || 'earth',
      semiMajorAxis: orbitParams.radius || (26.0 + (Math.random() * 8.0)),
      eccentricity: orbitParams.eccentricity || (0.02 + Math.random() * 0.06),
      inclination: orbitParams.inclination !== undefined ? orbitParams.inclination : (Math.random() * 0.6 - 0.3),
      orbitPeriodSec: 42 + Math.random() * 24,
      color: ['#10b981', '#38bdf8', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316'][this.launchedFleet.length % 7],
      status: 'OPERATIONAL / ACTIVE TRANSMITTING',
      launchDate: new Date().toLocaleDateString(),
      altitudeKm: Math.round(340 + Math.random() * 320),
      isUserCraft: true
    };

    // Prepend to list
    this.launchedFleet.unshift(newSat);
    this.saveData();
    return newSat;
  }

  getFleet() {
    return this.launchedFleet;
  }

  getCurrentLevel() {
    return CAMPAIGN_LEVELS[this.currentLevelIndex] || CAMPAIGN_LEVELS[0];
  }

  selectLevel(idx) {
    if (idx >= 0 && idx < CAMPAIGN_LEVELS.length) {
      this.currentLevelIndex = idx;
      this.saveData();
      return true;
    }
    return false;
  }

  advanceToNextLevel() {
    this.currentLevelIndex = (this.currentLevelIndex + 1) % CAMPAIGN_LEVELS.length;
    this.saveData();
    return this.currentLevelIndex;
  }

  completeLevel(results) {
    const level = this.getCurrentLevel();
    let starsEarned = 1;

    if (results.targetsScanned >= 2 && results.batterySoC > 0.4) starsEarned = 2;
    if (results.targetsScanned >= results.totalTargets && results.hullHealth > 50) starsEarned = 3;

    this.totalStars += starsEarned;
    this.credits += level.rewardCredits || 500;

    this.levelScores[level.id] = {
      stars: starsEarned,
      score: results.score,
      timeSpent: results.timeSpentSec,
      completed: true
    };

    // Automatically advance to the next mission if player passed level
    let nextIndex = this.currentLevelIndex;
    if (results.success) {
      nextIndex = (this.currentLevelIndex + 1) % CAMPAIGN_LEVELS.length;
      this.currentLevelIndex = nextIndex;
    }

    this.saveData();
    return {
      starsEarned,
      creditsEarned: level.rewardCredits || 500,
      nextLevelIndex: nextIndex,
      nextLevel: CAMPAIGN_LEVELS[nextIndex],
      passed: !!results.success
    };
  }

  unlockTech(techId) {
    const item = this.techTree.find(t => t.id === techId);
    if (item && !item.unlocked && this.credits >= item.costCredits) {
      this.credits -= item.costCredits;
      item.unlocked = true;
      this.saveData();
      return true;
    }
    return false;
  }
}
