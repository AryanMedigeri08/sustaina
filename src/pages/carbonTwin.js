// ═══════════════════════════════════════════
// SUSTAINA — Carbon Twin™ Simulator
// Interactive deterministic future-scenario simulation
// ═══════════════════════════════════════════

import { getProfile, addLocalSimulation, logTimelineEvent } from '../state/store.js';
import { 
  calcAnnualEmissions, 
  calcTreesEquivalent, 
  calcMoneySaved,
  getGridFactor
} from '../data/emissions.js';
import { navigate } from '../router.js';

let currentSimData = null;

export function renderCarbonTwin(container) {
  const profile = getProfile();

  // Initial render setup
  container.innerHTML = `
    <div class="page-enter">
      <div class="page-header">
        <div>
          <h1 class="page-title">Carbon Twin</h1>
          <p class="page-subtitle">Simulate future adjustments to see your footprint change in real-time.</p>
        </div>
      </div>

      <!-- Split View Panels -->
      <div class="twin-container stagger-1">
        <!-- Current You -->
        <div class="twin-panel current">
          <div class="twin-panel-label">Current You</div>
          <div class="twin-panel-sublabel">Based on onboarding values</div>
          <div class="twin-illustration">
            <div style="text-align: center;">
              <div style="font-size: 56px; margin-bottom: 8px;">🏭</div>
              <div style="font-size: 24px;">🏙️</div>
            </div>
          </div>
          <div class="twin-metric" id="current-tonnes">0.00</div>
          <div class="twin-metric-unit">tonnes CO₂e / year</div>
        </div>

        <!-- Future You -->
        <div class="twin-panel future" style="background: linear-gradient(135deg, var(--green-900), var(--green-800)); color: white;">
          <div class="twin-panel-label" style="color: var(--green-100);">Future You</div>
          <div class="twin-panel-sublabel" id="future-sublabel" style="color: var(--green-200);">0% improvements applied</div>
          <div class="twin-illustration">
            <div style="text-align: center;">
              <div style="font-size: 56px; margin-bottom: 8px;">🌳</div>
              <div style="font-size: 24px;">🏡🌿</div>
            </div>
          </div>
          <div class="twin-metric" id="future-tonnes">0.00</div>
          <div class="twin-metric-unit" style="color: var(--green-100);">tonnes CO₂e / year</div>
        </div>
      </div>

      <!-- Real-time Reduction Summary Banner -->
      <div class="card text-center mb-6 stagger-2" style="background: linear-gradient(135deg, var(--green-50), var(--green-100)); border: 1px solid var(--green-200); padding: var(--space-4);">
        <div class="text-xs text-secondary mb-1">Your potential carbon reduction is</div>
        <div style="font-family: var(--font-heading); font-size: var(--text-2xl); font-weight: 700; color: var(--green-800);">
          <span id="reduction-tonnes">0.00</span> <span style="font-size: var(--text-sm); font-weight: 500;">tonnes CO₂e / year</span>
        </div>
      </div>

      <!-- Visual Impact Metrics Grid -->
      <div class="impact-cards mb-8 stagger-3">
        <div class="impact-card">
          <div class="impact-card-icon gold">💰</div>
          <div>
            <div class="impact-card-value" id="twin-savings">₹0</div>
            <div class="metric-label">money saved / year</div>
          </div>
        </div>
        <div class="impact-card">
          <div class="impact-card-icon green">🌳</div>
          <div>
            <div class="impact-card-value" id="twin-trees">0</div>
            <div class="metric-label">trees saved / year</div>
          </div>
        </div>
        <div class="impact-card">
          <div class="impact-card-icon green">📈</div>
          <div>
            <div class="impact-card-value" id="twin-pct">0%</div>
            <div class="metric-label">overall improvement</div>
          </div>
        </div>
      </div>

      <!-- Simulation Interactive Controls Card -->
      <div class="card mb-8 stagger-4">
        <h3 class="card-title mb-4" style="color: var(--green-800); font-weight: 700;">Future Scenario Adjustments</h3>
        
        <div style="display: flex; flex-direction: column; gap: var(--space-5);">
          <!-- 1. Transport Slider -->
          <div style="border-bottom: 1px solid var(--border-light); padding-bottom: var(--space-4);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
              <span class="font-semibold text-sm">Reduce daily travel distance</span>
              <span id="slider-val-km" class="text-sm font-bold text-accent">0%</span>
            </div>
            <input type="range" id="sim-reduce-km" min="0" max="80" value="0" style="width: 100%; cursor: pointer;" />
            <div style="display: flex; align-items: center; margin-top: var(--space-2); gap: var(--space-2);">
              <label class="toggle" id="toggle-eco-transit">
                <input type="checkbox" id="sim-eco-transit" />
                <span class="toggle-track"></span>
                <span class="toggle-thumb"></span>
              </label>
              <span class="text-xs text-secondary">Switch daily travel mode to Eco transit (Metro / Bus)</span>
            </div>
          </div>

          <!-- 2. Diet Selection -->
          <div style="border-bottom: 1px solid var(--border-light); padding-bottom: var(--space-4);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
              <span class="font-semibold text-sm">Switch dietary habits</span>
              <span id="diet-val" class="text-sm font-bold text-accent" style="text-transform: capitalize;">${profile.diet || 'vegetarian'}</span>
            </div>
            <select id="sim-diet" style="max-width: 300px;">
              <option value="vegetarian" ${profile.diet === 'vegetarian' ? 'selected' : ''}>Mostly Vegetarian</option>
              <option value="vegan" ${profile.diet === 'vegan' ? 'selected' : ''}>100% Vegan</option>
              <option value="occasional_nonveg" ${profile.diet === 'occasional_nonveg' ? 'selected' : ''}>Occasional Non-Vegetarian</option>
              <option value="non_vegetarian" ${profile.diet === 'non_vegetarian' ? 'selected' : ''}>Regular Non-Vegetarian</option>
            </select>
          </div>

          <!-- 3. Energy Toggles -->
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
              <span class="font-semibold text-sm">Reduce electricity usage</span>
              <span id="slider-val-elec" class="text-sm font-bold text-accent">0%</span>
            </div>
            <input type="range" id="sim-reduce-elec" min="0" max="50" value="0" style="width: 100%; cursor: pointer;" />
            <div style="display: flex; align-items: center; margin-top: var(--space-3); gap: var(--space-2);">
              <label class="toggle" id="toggle-solar">
                <input type="checkbox" id="sim-solar" />
                <span class="toggle-track"></span>
                <span class="toggle-thumb"></span>
              </label>
              <span class="text-xs text-secondary">Adopt Rooftop Solar Panels (cuts grid emissions to 0)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Button -->
      <div class="stagger-5">
        <button class="btn btn-primary btn-xl" id="twin-commit-changes">
          Implement Scenario as Goal
        </button>
      </div>
    </div>
  `;

  // Simulator Elements
  const reduceKmSlider = document.getElementById('sim-reduce-km');
  const ecoTransitCheckbox = document.getElementById('sim-eco-transit');
  const dietSelect = document.getElementById('sim-diet');
  const reduceElecSlider = document.getElementById('sim-reduce-elec');
  const solarCheckbox = document.getElementById('sim-solar');

  // Text values
  const kmLabel = document.getElementById('slider-val-km');
  const dietLabel = document.getElementById('diet-val');
  const elecLabel = document.getElementById('slider-val-elec');

  // Perform initial calculation
  updateSimulation();

  // Attach Listeners
  reduceKmSlider.addEventListener('input', (e) => {
    kmLabel.textContent = `${e.target.value}%`;
    updateSimulation();
  });

  ecoTransitCheckbox.addEventListener('change', updateSimulation);

  dietSelect.addEventListener('change', (e) => {
    dietLabel.textContent = e.target.options[e.target.selectedIndex].text;
    updateSimulation();
  });

  reduceElecSlider.addEventListener('input', (e) => {
    elecLabel.textContent = `${e.target.value}%`;
    updateSimulation();
  });

  solarCheckbox.addEventListener('change', updateSimulation);

  // Commit changes as goal action
  document.getElementById('twin-commit-changes')?.addEventListener('click', () => {
    if (!currentSimData) return;
    
    const scenarioName = prompt("Enter a name for this Carbon Twin simulation:", "Eco Transit & Vegetarian Diet") || "Future Lifestyle Simulation";
    currentSimData.scenario_name = scenarioName;

    addLocalSimulation(currentSimData);

    logTimelineEvent({
      type: 'carbon_twin_simulated',
      title: 'Carbon Twin Simulated',
      description: `Simulated a future scenario "${scenarioName}" with a ${currentSimData.improvement_pct}% footprint reduction (saving ${currentSimData.co2_reduction.toFixed(2)} t CO₂e).`,
      icon: '👥'
    });

    // Quick notification feedback
    const btn = document.getElementById('twin-commit-changes');
    btn.textContent = 'Scenario Saved to History! ✓';
    btn.classList.add('btn-success');
    setTimeout(() => {
      navigate('simulation-history');
    }, 1200);
  });

  // Simulator Engine Function
  function updateSimulation() {
    const kmReducePct = parseInt(reduceKmSlider.value);
    const isEcoTransit = ecoTransitCheckbox.checked;
    const dietVal = dietSelect.value;
    const elecReducePct = parseInt(reduceElecSlider.value);
    const isSolar = solarCheckbox.checked;

    // Calculate current annual footprint
    const currentAnnual = calcAnnualEmissions(profile);
    const currentFootprint = currentAnnual.total;

    // Construct Future Profile Scenario
    const futureProfile = {
      ...profile,
      primaryTransport: isEcoTransit ? 'metro' : profile.primaryTransport,
      dailyTransportKm: Math.round(profile.dailyTransportKm * (1 - kmReducePct / 100)),
      diet: dietVal,
      electricityUnits: Math.round(profile.electricityUnits * (1 - elecReducePct / 100)),
      lpgCylinders: profile.lpgCylinders
    };

    // Calculate future annual footprint
    const futureAnnual = calcAnnualEmissions(futureProfile);
    
    // Solar sets electricity emissions factor to 0
    if (isSolar) {
      const cityFactor = getGridFactor(profile.city);
      const electricityUnitsUsed = futureProfile.electricityUnits || 200;
      const annualElectricityEmissions = (electricityUnitsUsed * cityFactor / 30) * 365;
      
      futureAnnual.energy = Math.max(0, futureAnnual.energy - annualElectricityEmissions);
      futureAnnual.total = Math.max(0, futureAnnual.total - annualElectricityEmissions);
    }

    const futureFootprint = futureAnnual.total;

    // Tally Reductions
    const totalReduction = Math.max(0, currentFootprint - futureFootprint);
    const improvementPct = Math.max(0, Math.round((totalReduction / currentFootprint) * 100));

    // Store globally for committing
    currentSimData = {
      co2_reduction: totalReduction / 1000,
      money_saved: calcMoneySaved(totalReduction),
      trees_saved: calcTreesEquivalent(totalReduction),
      improvement_pct: improvementPct
    };

    // Update DOM Metrics
    document.getElementById('current-tonnes').textContent = (currentFootprint / 1000).toFixed(2);
    document.getElementById('future-tonnes').textContent = (futureFootprint / 1000).toFixed(2);
    document.getElementById('reduction-tonnes').textContent = (totalReduction / 1000).toFixed(2);
    
    document.getElementById('twin-savings').textContent = `₹${calcMoneySaved(totalReduction).toLocaleString('en-IN')}`;
    document.getElementById('twin-trees').textContent = calcTreesEquivalent(totalReduction);
    document.getElementById('twin-pct').textContent = `↑ ${improvementPct}%`;
    document.getElementById('future-sublabel').textContent = `${improvementPct}% carbon footprint reduction`;
  }
}
