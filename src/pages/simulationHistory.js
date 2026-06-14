// ═══════════════════════════════════════════
// SUSTAINA — Carbon Twin Simulation History Page
// Compare multiple simulated futures side-by-side
// ═══════════════════════════════════════════

import { getSimulations } from '../state/store.js';

let selectedSimIds = [];

export function renderSimulationHistory(container) {
  selectedSimIds = []; // Reset selections
  renderPage(container);
}

function renderPage(container) {
  const simulations = getSimulations();

  container.innerHTML = `
    <div class="page-enter">
      <div class="page-header">
        <div>
          <h1 class="page-title">Simulation History</h1>
          <p class="page-subtitle">Track and compare different lifestyle carbon twin simulations.</p>
        </div>
      </div>

      <!-- Compare Action Panel -->
      <div id="sim-comparison-area" style="margin-bottom: var(--space-6);">
        ${renderComparisonPanel()}
      </div>

      <!-- Simulations Table / Grid -->
      <div class="card stagger-1">
        <h3 class="card-title mb-4">Past Carbon Twin Simulations</h3>
        ${simulations.length === 0 ? `
          <div style="text-align: center; padding: var(--space-8) 0; color: var(--text-secondary);">
            No simulations logged yet. Tweak scenarios in Carbon Twin and save them to build history!
          </div>
        ` : `
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: var(--text-sm);">
              <thead>
                <tr style="border-bottom: 2px solid var(--border-light); padding-bottom: var(--space-2); color: var(--text-secondary);">
                  <th style="padding: var(--space-3); width: 40px;">Select</th>
                  <th style="padding: var(--space-3);">Date</th>
                  <th style="padding: var(--space-3);">Scenario Title</th>
                  <th style="padding: var(--space-3);">CO₂ Reduction</th>
                  <th style="padding: var(--space-3);">Annual Savings</th>
                  <th style="padding: var(--space-3);">Trees Saved</th>
                  <th style="padding: var(--space-3);">Improvement</th>
                </tr>
              </thead>
              <tbody>
                ${simulations.map(sim => {
                  const isChecked = selectedSimIds.includes(sim.id);
                  return `
                    <tr style="border-bottom: 1px solid var(--border-light); hover: background-color: var(--neutral-50);">
                      <td style="padding: var(--space-3);">
                        <input type="checkbox" class="sim-compare-chk" data-id="${sim.id}" ${isChecked ? 'checked' : ''} aria-label="Compare ${sim.scenario_name || 'scenario'}" />
                      </td>
                      <td style="padding: var(--space-3); color: var(--text-secondary);">${formatDate(sim.created_at)}</td>
                      <td style="padding: var(--space-3); font-weight: 600; color: var(--green-800);">${sim.scenario_name || 'Lifestyle Scenario'}</td>
                      <td style="padding: var(--space-3); font-weight: 600;">${parseFloat(sim.co2_reduction).toFixed(2)} t CO₂e</td>
                      <td style="padding: var(--space-3); color: var(--accent-amber); font-weight: 600;">₹${Math.round(sim.money_saved).toLocaleString('en-IN')}</td>
                      <td style="padding: var(--space-3);">${sim.trees_saved} trees</td>
                      <td style="padding: var(--space-3); font-weight: 700; color: var(--green-700);">↑ ${sim.improvement_pct}%</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    </div>
  `;

  // Checkbox Event Listeners
  container.querySelectorAll('.sim-compare-chk').forEach(chk => {
    chk.addEventListener('change', () => {
      const id = chk.dataset.id;
      if (chk.checked) {
        if (selectedSimIds.length >= 2) {
          alert('You can compare a maximum of 2 simulations.');
          chk.checked = false;
          return;
        }
        selectedSimIds.push(id);
      } else {
        selectedSimIds = selectedSimIds.filter(item => item !== id);
      }
      // Re-render comparison panel on top dynamically
      document.getElementById('sim-comparison-area').innerHTML = renderComparisonPanel();
    });
  });
}

function renderComparisonPanel() {
  const simulations = getSimulations();
  if (selectedSimIds.length < 2) {
    return `
      <div class="card text-center" style="background: var(--neutral-50); border: 1px dashed var(--border-default); padding: var(--space-4);">
        <span class="text-xs text-secondary">Select any two simulations in the table below to compare them side-by-side.</span>
      </div>
    `;
  }

  const sim1 = simulations.find(s => s.id === selectedSimIds[0]);
  const sim2 = simulations.find(s => s.id === selectedSimIds[1]);

  if (!sim1 || !sim2) return '';

  return `
    <div class="card page-enter" style="background: linear-gradient(135deg, var(--green-50), white); border: 1px solid var(--green-200); padding: var(--space-5);">
      <h3 style="font-family: var(--font-heading); font-size: var(--text-md); font-weight: 700; color: var(--green-800); margin-bottom: var(--space-4);">Side-by-Side Comparison</h3>
      
      <div class="grid-2" style="gap: var(--space-5);">
        <!-- Simulation A -->
        <div style="border-right: 1px solid var(--border-light); padding-right: var(--space-4);">
          <div style="font-size: var(--text-xs); color: var(--text-secondary); font-weight: 600;">SCENARIO A</div>
          <div style="font-family: var(--font-heading); font-size: var(--text-lg); font-weight: 700; color: var(--green-800); margin-bottom: var(--space-3);">${sim1.scenario_name}</div>
          
          <div style="display: flex; flex-direction: column; gap: var(--space-2); font-size: var(--text-sm);">
            <div style="display: flex; justify-content: space-between;">
              <span class="text-secondary">Emissions Reduction:</span>
              <span class="font-semibold">${parseFloat(sim1.co2_reduction).toFixed(2)} tonnes</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span class="text-secondary">Annual Money Saved:</span>
              <span class="font-semibold" style="color: var(--green-800);">₹${Math.round(sim1.money_saved).toLocaleString('en-IN')}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span class="text-secondary">Equivalent Trees Saved:</span>
              <span class="font-semibold">${sim1.trees_saved} trees</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span class="text-secondary">Overall Footprint Shift:</span>
              <span class="font-semibold text-accent">↑ ${sim1.improvement_pct}%</span>
            </div>
          </div>
        </div>

        <!-- Simulation B -->
        <div>
          <div style="font-size: var(--text-xs); color: var(--text-secondary); font-weight: 600;">SCENARIO B</div>
          <div style="font-family: var(--font-heading); font-size: var(--text-lg); font-weight: 700; color: var(--green-800); margin-bottom: var(--space-3);">${sim2.scenario_name}</div>
          
          <div style="display: flex; flex-direction: column; gap: var(--space-2); font-size: var(--text-sm);">
            <div style="display: flex; justify-content: space-between;">
              <span class="text-secondary">Emissions Reduction:</span>
              <span class="font-semibold">${parseFloat(sim2.co2_reduction).toFixed(2)} tonnes</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span class="text-secondary">Annual Money Saved:</span>
              <span class="font-semibold" style="color: var(--green-800);">₹${Math.round(sim2.money_saved).toLocaleString('en-IN')}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span class="text-secondary">Equivalent Trees Saved:</span>
              <span class="font-semibold">${sim2.trees_saved} trees</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span class="text-secondary">Overall Footprint Shift:</span>
              <span class="font-semibold text-accent">↑ ${sim2.improvement_pct}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function formatDate(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (e) {
    return dateStr;
  }
}
