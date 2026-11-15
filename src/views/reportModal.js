/**
 * ASTROFORGE: Post-Mission Evaluation & Flight Readiness Certification Report Generator
 * Enhanced with NASA Analog Mission comparison, CubeSat 101 compliance, and 4-Segment Mapping
 */

export function generateMissionReportHtml(simState, scenario, evaluation) {
  const { massBudget, powerBudget, commBudget, costBudget, scienceYield } = simState;
  const analog = evaluation.matchedAnalog;
  const cubesat = evaluation.cubesatCheck;

  return `
    <div class="report-container">
      <div class="report-header">
        <div class="report-badge" style="background: ${evaluation.badgeColor}">
          ${evaluation.rank}
        </div>
        <h2>NASA MISSION FLIGHT READINESS & POST-FLIGHT EVALUATION</h2>
        <p class="mission-title">${scenario.title} — [${scenario.badge}]</p>
        <p class="timestamp">Generated: ${new Date().toUTCString()} | ASTROFORGE ConOps v2.5</p>
      </div>

      <!-- REAL NASA ANALOG MISSION (From 'A Learning Game About Telescopes') -->
      <div class="report-analog-box">
        <div class="analog-badge">🛰️ REAL NASA MISSION ANALOG</div>
        <div class="analog-content">
          <h4>Matched Historic/Active Mission: <strong>${analog.name}</strong> (${analog.agency})</h4>
          <p class="analog-desc">${analog.description}</p>
          <div class="analog-specs-grid">
            <span>Target: <strong>${analog.target}</strong></span>
            <span>Launch: <strong>${analog.launchYear} via ${analog.launchVehicle}</strong></span>
            <span>Mass: <strong>${analog.mass}</strong></span>
            <span>Cost: <strong>${analog.cost}</strong></span>
            <span>Key Instruments: <strong>${analog.keyInstruments.join(', ')}</strong></span>
          </div>
        </div>
      </div>

      <div class="report-executive-summary">
        <h3>EXECUTIVE SYSTEMS ENGINEERING SUMMARY</h3>
        <p class="summary-text">${evaluation.summaryText}</p>
        <div class="summary-grid">
          <div class="stat-card">
            <span class="stat-label">SCIENCE COLLECTED</span>
            <span class="stat-value" style="color: #38bdf8">${evaluation.scienceCollected} / ${evaluation.targetScience} pts</span>
            <span class="stat-sub">(${evaluation.sciencePct}% of Target)</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">CONCEPT MATURITY LEVEL</span>
            <span class="stat-value" style="color: #10b981">CML ${evaluation.cmlScore} / 6</span>
            <span class="stat-sub">NASA JPL Formulation Scale</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">TOTAL MISSION COST</span>
            <span class="stat-value" style="color: ${costBudget.isOverBudget ? '#ef4444' : '#f59e0b'}">
              $${costBudget.totalMissionCost.toFixed(1)}M
            </span>
            <span class="stat-sub">Cap: $${costBudget.budgetCap.toFixed(1)}M (${evaluation.costMarginPct}% Margin)</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">MASS MARGIN</span>
            <span class="stat-value" style="color: ${massBudget.massMarginPct < 15 ? '#ef4444' : '#10b981'}">
              +${evaluation.massMarginPct}%
            </span>
            <span class="stat-sub">${massBudget.wetMass.toFixed(1)} kg / ${massBudget.launchCapacity.toFixed(1)} kg</span>
          </div>
        </div>
      </div>

      <!-- CUBESAT 101 COMPLIANCE (NASA CSLI) -->
      ${cubesat.isSmallSat ? `
        <div class="report-section cubesat-section">
          <h3>NASA CSLI CUBESAT 101 COMPLIANCE STATUS</h3>
          <div class="cubesat-status-pill ${cubesat.compliant ? 'compliant' : 'non-compliant'}">
            <span>${cubesat.compliant ? '✓ P-POD CANISTER COMPLIANT' : '⚠️ CANISTER OVERWEIGHT'}</span>
            <p>${cubesat.message}</p>
            <small>De-Orbit Rule: ${cubesat.deOrbitRule}</small>
          </div>
        </div>
      ` : ''}

      <!-- THE 4 MISSION SEGMENTS BREAKDOWN (Design and Develop Science Missions) -->
      <div class="report-section">
        <h3>THE 4 NASA MISSION SEGMENTS BREAKDOWN</h3>
        <div class="segments-summary-grid">
          <div class="seg-card">
            <span class="seg-icon">🚀</span>
            <strong>Launch Segment</strong>
            <p>${simState.design.launchVehicleId} (Capacity: ${massBudget.launchCapacity.toFixed(0)} kg)</p>
          </div>
          <div class="seg-card">
            <span class="seg-icon">🛰️</span>
            <strong>Space Segment</strong>
            <p>${simState.design.busId} (Wet Mass: ${massBudget.wetMass.toFixed(1)} kg, Power: +${powerBudget.netDaylightPowerBalanceW.toFixed(0)} W)</p>
          </div>
          <div class="seg-card">
            <span class="seg-icon">📡</span>
            <strong>Ground Segment</strong>
            <p>${simState.design.commId} (Link Margin: ${commBudget.dataLinkMargin.toFixed(1)}x, Daily Downlink: ${commBudget.dailyDownlinkCapacityGb.toFixed(1)} GB)</p>
          </div>
          <div class="seg-card">
            <span class="seg-icon">🔬</span>
            <strong>User / Science Segment</strong>
            <p>${scienceYield.finalSciencePoints} Science Points (${scienceYield.achievementPct}% Goal, +${scienceYield.synergyBonusPct}% Synergy)</p>
          </div>
        </div>
      </div>

      <div class="report-section">
        <h3>SYSTEMS ENGINEERING BREAKDOWN (MASTER EQUIPMENT LIST - MEL)</h3>
        <table class="report-table">
          <thead>
            <tr>
              <th>Subsystem</th>
              <th>Selected Component</th>
              <th>Mass (kg)</th>
              <th>Power Draw (W)</th>
              <th>Cost ($M)</th>
              <th>Status Margin</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Structure / Bus</strong></td>
              <td>${simState.design.busId}</td>
              <td>${massBudget.busMass.toFixed(1)} kg</td>
              <td>${powerBudget.totalConsumptionDayW.toFixed(0)} W (Base)</td>
              <td>$${costBudget.hardwareCost.toFixed(1)}M</td>
              <td><span class="status-tag status-nominal">Nominal</span></td>
            </tr>
            <tr>
              <td><strong>Power Generation</strong></td>
              <td>${simState.design.powerId}</td>
              <td>${massBudget.powerMass.toFixed(1)} kg</td>
              <td>+${powerBudget.powerGeneratedDayW.toFixed(0)} W (Sunlight)</td>
              <td>Included</td>
              <td><span class="status-tag ${powerBudget.netDaylightPowerBalanceW >= 0 ? 'status-nominal' : 'status-danger'}">
                ${powerBudget.netDaylightPowerBalanceW >= 0 ? 'Net Surplus' : 'Deficit'}
              </span></td>
            </tr>
            <tr>
              <td><strong>Energy Storage</strong></td>
              <td>${simState.design.batteryId}</td>
              <td>${massBudget.batteryMass.toFixed(1)} kg</td>
              <td>${powerBudget.batteryCapacityWh} Wh Capacity</td>
              <td>Included</td>
              <td><span class="status-tag ${powerBudget.batterySafe ? 'status-nominal' : 'status-danger'}">
                DoD: ${(powerBudget.actualDoD * 100).toFixed(0)}%
              </span></td>
            </tr>
            <tr>
              <td><strong>Communications</strong></td>
              <td>${simState.design.commId}</td>
              <td>${massBudget.commMass.toFixed(1)} kg</td>
              <td>${commBudget.maxDownlinkRateMbps} Mbps Link</td>
              <td>Included</td>
              <td><span class="status-tag ${commBudget.dataLinkMargin >= 1.0 ? 'status-nominal' : 'status-warning'}">
                Margin: ${commBudget.dataLinkMargin.toFixed(1)}x
              </span></td>
            </tr>
            <tr>
              <td><strong>Launch Segment</strong></td>
              <td>${simState.design.launchVehicleId}</td>
              <td>Wet: ${massBudget.wetMass.toFixed(1)} kg</td>
              <td>Capacity: ${massBudget.launchCapacity.toFixed(1)} kg</td>
              <td>$${costBudget.launchCost.toFixed(1)}M</td>
              <td><span class="status-tag ${massBudget.launchCompatible ? 'status-nominal' : 'status-danger'}">
                ${massBudget.launchCompatible ? 'GO FOR FLIGHT' : 'SCRUB'}
              </span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="report-section">
        <h3>CONCEPT MATURITY LEVEL (CML) JUSTIFICATION</h3>
        <ul class="cml-list">
          ${evaluation.cmlJustifications.map(j => `<li>✅ ${j}</li>`).join('')}
        </ul>
      </div>

      <div class="report-actions">
        <button id="download-json-report-btn" class="nasa-btn primary-btn">
          📥 EXPORT FULL TELEMETRY JSON
        </button>
        <button id="print-report-btn" class="nasa-btn secondary-btn">
          🖨️ PRINT MISSION BRIEFING
        </button>
      </div>
    </div>
  `;
}
