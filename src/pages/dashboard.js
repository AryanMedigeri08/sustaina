// ═══════════════════════════════════════════
// SUSTAINA — Dashboard (Home) Page
// ═══════════════════════════════════════════

import { getProfile, getState } from '../state/store.js';
import { DASHBOARD_SUMMARY, CATEGORY_BREAKDOWN, EMISSION_TREND, AI_INSIGHT } from '../data/mockData.js';
import { createDonutChart, createLineChart } from '../components/charts.js';
import { icons } from '../components/icons.js';
import { navigate } from '../router.js';
import { formatCurrency } from '../utils/formatters.js';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function renderDashboard(container) {
  const profile = getProfile();
  const state = getState();
  const isHousehold = state.settings.viewMode === 'household';
  const multiplier = isHousehold ? (profile.householdSize || 4) : 1;
  const greetingName = isHousehold ? `${profile.name?.split(' ')[1] || 'Medigeri'} Household 👪` : (profile.name?.split(' ')[0] || 'there');

  // Clone and scale summary
  const summary = {
    annualFootprint: (parseFloat(DASHBOARD_SUMMARY.annualFootprint) * (isHousehold ? multiplier * 0.75 : 1)).toFixed(1),
    footprintUnit: DASHBOARD_SUMMARY.footprintUnit,
    comparison: isHousehold ? '12% overall household efficiency saving applied' : DASHBOARD_SUMMARY.comparison,
    co2Saved: {
      value: (parseFloat(DASHBOARD_SUMMARY.co2Saved.value) * multiplier).toFixed(1),
      unit: DASHBOARD_SUMMARY.co2Saved.unit,
      trend: DASHBOARD_SUMMARY.co2Saved.trend
    },
    moneySaved: {
      value: Math.round(DASHBOARD_SUMMARY.moneySaved.value * multiplier),
      trend: DASHBOARD_SUMMARY.moneySaved.trend
    },
    treesEquivalent: {
      value: Math.round(DASHBOARD_SUMMARY.treesEquivalent.value * multiplier),
      trend: DASHBOARD_SUMMARY.treesEquivalent.trend
    },
    topImpactPct: DASHBOARD_SUMMARY.topImpactPct
  };

  // Adjust breakdown based on shared efficiencies
  const breakdown = {};
  for (const [key, cat] of Object.entries(CATEGORY_BREAKDOWN)) {
    const scale = (key === 'energy' || key === 'waste') ? Math.min(1.8, multiplier * 0.6) : multiplier;
    breakdown[key] = {
      co2: Math.round(cat.co2 * scale),
      label: cat.label,
      color: cat.color
    };
  }

  const totalCo2 = Object.values(breakdown).reduce((sum, c) => sum + c.co2, 0);
  for (const key of Object.keys(breakdown)) {
    breakdown[key].value = Math.round((breakdown[key].co2 / totalCo2) * 100);
  }

  container.innerHTML = `
    <div class="page-enter">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">${getGreeting()}, ${greetingName}! 🌿</h1>
          <p class="page-subtitle">Track. Reduce. Make a difference.</p>
        </div>
        <div class="tabs">
          <button class="tab active">This Month</button>
          <button class="tab">This Week</button>
        </div>
      </div>

      <!-- Main Grid -->
      <div class="grid-2 mb-8">
        <!-- Carbon Footprint Card -->
        <div class="card stagger-1">
          <div class="card-header">
            <h3 class="card-title">Your Carbon Footprint</h3>
          </div>
          <div class="flex items-center gap-6">
            <div class="metric-card">
              <div class="metric-value large">${summary.annualFootprint}</div>
              <div class="metric-label">${summary.footprintUnit}</div>
              <div class="metric-trend positive">↓ ${summary.comparison}</div>
            </div>
            <div class="donut-container" style="width: 160px; height: 160px;">
              <canvas id="dashboard-donut"></canvas>
              <div class="donut-center-text">
                <div class="donut-center-value">${summary.annualFootprint}</div>
                <div class="donut-center-unit">t CO₂e</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Breakdown Card -->
        <div class="card stagger-2">
          <div class="card-header">
            <h3 class="card-title">Breakdown by Category</h3>
          </div>
          <div class="flex items-center gap-4" style="margin-bottom: var(--space-4);">
            <div style="flex: 1;">
              ${Object.entries(breakdown).map(([key, cat]) => `
                <div class="category-bar">
                  <span class="category-bar-label">
                    <span style="width: 8px; height: 8px; border-radius: 50%; background: ${cat.color}; display: inline-block;"></span>
                    ${cat.label}
                  </span>
                  <div class="category-bar-track">
                    <div class="category-bar-fill ${key}" style="width: ${cat.value}%;"></div>
                  </div>
                  <span class="category-bar-value">${cat.value}%</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- Impact Cards -->
      <div class="impact-cards mb-8 stagger-3">
        <div class="impact-card">
          <div class="impact-card-icon green">🌿</div>
          <div>
            <div class="metric-label">CO₂ Saved</div>
            <div class="impact-card-value">${summary.co2Saved.value} <span style="font-size: var(--text-sm); font-weight: 400;">${summary.co2Saved.unit}</span></div>
            <div class="impact-card-trend">${summary.co2Saved.trend}</div>
          </div>
        </div>
        <div class="impact-card">
          <div class="impact-card-icon gold">💰</div>
          <div>
            <div class="metric-label">Money Saved</div>
            <div class="impact-card-value">${formatCurrency(summary.moneySaved.value)}</div>
            <div class="impact-card-trend">${summary.moneySaved.trend}</div>
          </div>
        </div>
        <div class="impact-card">
          <div class="impact-card-icon green">🌳</div>
          <div>
            <div class="metric-label">Trees Equivalent</div>
            <div class="impact-card-value">${summary.treesEquivalent.value}</div>
            <div class="impact-card-trend">${summary.treesEquivalent.trend}</div>
          </div>
        </div>
      </div>

      <!-- Bottom Grid -->
      <div class="grid-2 stagger-4">
        <!-- Emission Trend -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Emission Trend</h3>
            <span class="text-xs text-secondary">This Month</span>
          </div>
          <div class="chart-container">
            <canvas id="dashboard-trend"></canvas>
          </div>
        </div>

        <!-- Top Impact Area + AI Insight -->
        <div class="flex flex-col gap-4">
          <div class="card" style="flex: 1;">
            <div class="card-header">
              <h3 class="card-title">Top Impact Area</h3>
            </div>
            <div class="flex items-center gap-4">
              <div style="width: 80px; height: 80px; border-radius: var(--radius-full); background: var(--green-100); display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 32px;">🚗</span>
              </div>
              <div>
                <div class="text-sm text-secondary">Transport</div>
                <div style="font-family: var(--font-heading); font-size: var(--text-3xl); font-weight: 700; color: var(--green-800);">${summary.topImpactPct}%</div>
                <div class="text-xs text-secondary">of your total emissions</div>
              </div>
            </div>
            <button class="btn btn-secondary mt-4" id="dashboard-view-insights" style="width: 100%;">
              View Insights ${icons.arrow_right}
            </button>
          </div>
          
          <!-- AI Insight -->
          <div class="insight-card">
            <div class="arya-avatar">🌱</div>
            <div>
              <div class="text-xs text-secondary mb-2" style="font-weight: 600;">AI Insight</div>
              <div class="insight-text">${AI_INSIGHT.text}</div>
            </div>
            <span class="insight-icon">🍃</span>
          </div>
        </div>
      </div>
    </div>
  `;

  // Initialize charts after DOM is ready
  requestAnimationFrame(() => {
    const donutData = Object.values(breakdown).map(cat => ({
      label: cat.label,
      value: cat.value,
      color: cat.color
    }));
    createDonutChart('dashboard-donut', donutData);

    const trend = EMISSION_TREND.daily;
    const trendValues = trend.map(t => t.value * (isHousehold ? multiplier * 0.75 : 1));
    createLineChart('dashboard-trend', 
      trend.map(t => t.date),
      trendValues,
      'kg CO₂'
    );
  });

  // Event handlers
  document.getElementById('dashboard-view-insights')?.addEventListener('click', () => navigate('insights'));
}
