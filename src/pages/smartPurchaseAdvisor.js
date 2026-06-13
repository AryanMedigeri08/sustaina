// ═══════════════════════════════════════════
// SUSTAINA — Smart Purchase Advisor Page
// Financial and carbon payback advisor with Gemini Flash analysis
// ═══════════════════════════════════════════

import { getProfile, addLocalPurchase, logTimelineEvent } from '../state/store.js';
import { getPurchaseAdvice } from '../services/gemini.js';
import { getGridFactor } from '../data/emissions.js';
import { icons } from '../components/icons.js';

const TEMPLATES = [
  {
    name: 'Rooftop Solar Panels (3kW)',
    category: 'solar',
    cost: 165000,
    runningCost: 0,
    energyUsage: -3600, // generates 3600 units
    expectedLifetime: 25,
    icon: 'sun'
  },
  {
    name: 'Ola S1 Pro Electric Scooter',
    category: 'transport',
    cost: 140000,
    runningCost: 250, // Charging costs/mo
    energyUsage: 350, // kWh/year
    expectedLifetime: 10,
    icon: 'transport'
  },
  {
    name: 'LG 5-Star Inverter Refrigerator',
    category: 'appliance',
    cost: 38000,
    runningCost: 180, // electricity bill/mo
    energyUsage: 220, // kWh/year
    expectedLifetime: 12,
    icon: 'snowflake'
  }
];

export function renderSmartPurchaseAdvisor(container) {
  const profile = getProfile();

  container.innerHTML = `
    <div class="page-enter">
      <div class="page-header">
        <div>
          <h1 class="page-title">Smart Purchase Advisor</h1>
          <p class="page-subtitle">Analyze the financial and carbon payback of sustainable purchasing choices.</p>
        </div>
      </div>

      <div class="grid-2 stagger-1">
        <!-- Input Form and Templates -->
        <div class="card flex flex-col gap-6">
          <h3 class="card-title" style="color: var(--green-800); font-weight: 700;">Purchase Details</h3>
          
          <!-- Templates Row -->
          <div>
            <label class="text-xs text-secondary font-semibold mb-2 style-block">Quick Templates</label>
            <div style="display: flex; gap: var(--space-2); flex-wrap: wrap;">
              ${TEMPLATES.map((tmpl, idx) => `
                <button class="btn btn-ghost btn-sm btn-tmpl" data-idx="${idx}" style="padding: var(--space-2) var(--space-3); font-size: var(--text-xs); display: flex; align-items: center; gap: var(--space-2);">
                  <span style="display: flex; align-items: center; justify-content: center; color: var(--green-700);">${icons[tmpl.icon]}</span> <span>${tmpl.name.split(' ')[0]}</span>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Inputs -->
          <div style="display: flex; flex-direction: column; gap: var(--space-4);">
            <div>
              <label class="text-xs text-secondary font-semibold mb-1 style-block">Product Name</label>
              <input type="text" id="pa-name" placeholder="e.g. Electric Bike" value="Electric Bike" />
            </div>
            
            <div class="grid-2" style="gap: var(--space-3);">
              <div>
                <label class="text-xs text-secondary font-semibold mb-1 style-block">Category</label>
                <select id="pa-category">
                  <option value="transport">Transportation</option>
                  <option value="solar">Solar Energy Systems</option>
                  <option value="appliance">Appliances & Devices</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label class="text-xs text-secondary font-semibold mb-1 style-block">Expected Lifetime (years)</label>
                <input type="number" id="pa-lifetime" placeholder="e.g. 10" value="10" />
              </div>
            </div>

            <div class="grid-3" style="gap: var(--space-2);">
              <div>
                <label class="text-xs text-secondary font-semibold mb-1 style-block">Product Cost (₹)</label>
                <input type="number" id="pa-cost" placeholder="e.g. 120000" value="120000" />
              </div>
              <div>
                <label class="text-xs text-secondary font-semibold mb-1 style-block">Running Cost (₹/mo)</label>
                <input type="number" id="pa-running" placeholder="e.g. 200" value="200" />
              </div>
              <div>
                <label class="text-xs text-secondary font-semibold mb-1 style-block">Energy Use (kWh/yr)</label>
                <input type="number" id="pa-energy" placeholder="e.g. 300" value="300" />
              </div>
            </div>
          </div>

          <button class="btn btn-primary btn-xl" id="pa-analyze-btn">
            Analyze Purchase Payback
          </button>
        </div>

        <!-- Analysis Outputs -->
        <div class="card flex flex-col gap-6" id="pa-results-panel">
          <div style="text-align: center; padding: var(--space-12) 0;" id="pa-empty-state">
            <div style="font-size: 48px; margin-bottom: var(--space-3); filter: grayscale(1);">🛍️</div>
            <div style="font-size: var(--text-sm); font-weight: 600; color: var(--text-secondary);">Fill details and analyze to see payback report.</div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach Template prefills
  container.querySelectorAll('.btn-tmpl').forEach(btn => {
    btn.addEventListener('click', () => {
      const tmpl = TEMPLATES[btn.dataset.idx];
      document.getElementById('pa-name').value = tmpl.name;
      document.getElementById('pa-category').value = tmpl.category;
      document.getElementById('pa-lifetime').value = tmpl.expectedLifetime;
      document.getElementById('pa-cost').value = tmpl.cost;
      document.getElementById('pa-running').value = tmpl.runningCost;
      document.getElementById('pa-energy').value = tmpl.energyUsage;
    });
  });

  // Attach click handler for Analyze
  document.getElementById('pa-analyze-btn').addEventListener('click', () => {
    runAnalysis(container);
  });
}

async function runAnalysis(container) {
  const name = document.getElementById('pa-name').value || 'Eco Product';
  const category = document.getElementById('pa-category').value;
  const lifetime = parseFloat(document.getElementById('pa-lifetime').value) || 10;
  const cost = parseFloat(document.getElementById('pa-cost').value) || 0;
  const runningCost = parseFloat(document.getElementById('pa-running').value) || 0;
  const energyUsage = parseFloat(document.getElementById('pa-energy').value) || 0;

  const resultsPanel = document.getElementById('pa-results-panel');

  // Loading spinner
  resultsPanel.innerHTML = `
    <div style="text-align: center; padding: var(--space-12) 0;">
      <div style="font-size: 36px; margin-bottom: var(--space-3); animation: spin 1s linear infinite;">🍃</div>
      <div style="font-size: var(--text-sm); font-weight: 600;">Arya is calculating environmental & financial payback...</div>
    </div>
  `;

  // 1. Deterministic equations
  let baselineRunningCost = 0;
  let baselineEmissions = 0;
  const gridFactor = getGridFactor('Pune'); // default Pune

  if (category === 'solar') {
    // Solar offsets existing grid usage (typical Pune household averages 280 units/mo)
    baselineRunningCost = 280 * 7.5; // ₹2100/mo electricity bill
    baselineEmissions = 280 * gridFactor * 12; // ~2680 kg CO2/year
  } else if (category === 'transport') {
    // Electric scooter vs average petrol bike (18 km/day)
    baselineRunningCost = 2500; // ₹2500/mo petrol
    baselineEmissions = 18 * 365 * 0.089; // Petrol bike emission factor
  } else if (category === 'appliance') {
    // 5-star appliance vs old inefficient appliance
    baselineRunningCost = runningCost * 3.0; // 3x operational cost for old
    baselineEmissions = (energyUsage * 2.5) * gridFactor;
  } else {
    baselineRunningCost = runningCost * 2.2;
    baselineEmissions = (Math.abs(energyUsage) * 2.0) * gridFactor;
  }

  const annualSavings = Math.max(0, Math.round((baselineRunningCost - runningCost) * 12));
  
  // Calculate new product emissions
  // Note: if solar, energyUsage is negative (generation), representing negative emissions (offsets)
  const productEmissions = energyUsage > 0 ? (energyUsage * gridFactor) : 0;
  const carbonReduction = Math.max(0, Math.round(baselineEmissions - productEmissions));
  
  // Payback period
  const paybackPeriod = annualSavings > 0 ? parseFloat((cost / annualSavings).toFixed(1)) : lifetime;

  // Call API for Gemini Explanation
  const advice = await getPurchaseAdvice(name, category, cost, runningCost, energyUsage, lifetime);

  // Add the evaluation to local purchase history cache and database
  const purchaseItem = {
    product_name: name,
    category: category,
    cost: cost,
    running_cost: runningCost,
    energy_usage: energyUsage,
    expected_lifetime: lifetime,
    recommendation: advice.recommendation,
    explanation: advice.explanation,
    annual_savings: annualSavings,
    carbon_reduction: carbonReduction,
    payback_period: paybackPeriod
  };

  addLocalPurchase(purchaseItem);

  // Log timeline milestone event
  logTimelineEvent({
    type: 'purchase_evaluated',
    title: 'Purchase Evaluated',
    description: `Evaluated "${name}" (${category}) payback: ${advice.recommendation} recommendation, saving ${carbonReduction} kg CO₂e/year.`,
    icon: '🛍️'
  });

  const badgeColors = {
    'Yes': { bg: 'var(--green-100)', color: 'var(--green-900)', border: 'var(--green-200)' },
    'Consider': { bg: '#fef3d0', color: 'var(--accent-gold)', border: '#fef3d0' },
    'No': { bg: 'var(--accent-red-light)', color: 'var(--accent-red)', border: 'var(--accent-red-light)' }
  };
  const color = badgeColors[advice.recommendation] || badgeColors['Consider'];

  // Render Payback details
  resultsPanel.innerHTML = `
    <h3 class="card-title" style="color: var(--green-800); font-weight: 700;">Purchase Evaluation</h3>

    <!-- Recommendation Box -->
    <div style="background: ${color.bg}; color: ${color.color}; border: 1px solid ${color.border}; border-radius: var(--radius-lg); padding: var(--space-4) var(--space-5); display: flex; align-items: center; justify-content: space-between;">
      <div>
        <div class="text-xs" style="opacity: 0.8; font-weight: 600;">Arya's Recommendation</div>
        <div style="font-family: var(--font-heading); font-size: var(--text-2xl); font-weight: 800;">${advice.recommendation}</div>
      </div>
      <div style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
        ${advice.recommendation === 'Yes' ? 
          icons.check.replace('width="60" height="60"', 'width="28" height="28"').replace('stroke="currentColor"', 'stroke="currentColor" style="color: var(--green-700);"') : 
          advice.recommendation === 'No' ? 
          icons.close.replace('width="20" height="20"', 'width="28" height="28"').replace('stroke="currentColor"', 'stroke="currentColor" style="color: var(--accent-red);"') : 
          `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent-amber);"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12" y1="17" y2="17"/></svg>`
        }
      </div>
    </div>

    <!-- AI Explanation Bubble -->
    <div class="insight-card" style="margin-top: 0; background: var(--neutral-50); border: 1px solid var(--border-light);">
      <div class="arya-avatar">🌱</div>
      <div>
        <div class="text-xs text-secondary mb-1" style="font-weight: 600;">Advisor Explanation</div>
        <div class="insight-text">${advice.explanation}</div>
      </div>
    </div>

    <!-- Metrics Breakdown -->
    <div style="display: flex; flex-direction: column; gap: var(--space-3);">
      <h4 style="font-size: var(--text-sm); font-weight: 700; color: var(--green-800);">Deterministic Payback Metrics</h4>
      
      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-light); padding: var(--space-2) 0;">
        <span class="text-sm text-secondary">Annual Savings</span>
        <span class="font-bold">₹${annualSavings.toLocaleString('en-IN')} / year</span>
      </div>

      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-light); padding: var(--space-2) 0;">
        <span class="text-sm text-secondary">Carbon Avoided</span>
        <span class="font-bold">${carbonReduction.toLocaleString()} kg CO₂e / year</span>
      </div>

      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-light); padding: var(--space-2) 0;">
        <span class="text-sm text-secondary">Financial Payback Period</span>
        <span class="font-bold ${paybackPeriod <= lifetime ? 'text-accent' : 'text-danger'}">
          ${paybackPeriod <= lifetime ? `${paybackPeriod} years` : `Exceeds lifetime (${paybackPeriod} yrs)`}
        </span>
      </div>
      
      <div style="display: flex; justify-content: space-between; padding: var(--space-2) 0;">
        <span class="text-sm text-secondary">Equivalent Trees Saved</span>
        <span class="font-bold text-accent">${Math.round(carbonReduction / 21)} trees / year</span>
      </div>
    </div>
  `;
}
