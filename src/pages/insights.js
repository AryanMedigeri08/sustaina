// ═══════════════════════════════════════════
// SUSTAINA — Insights Page
// ═══════════════════════════════════════════

import { EMISSION_TREND, CATEGORY_BREAKDOWN, AI_INSIGHT, DASHBOARD_SUMMARY } from '../data/mockData.js';
import { createBarChart } from '../components/charts.js';

let activePeriod = 'month';

export function renderInsights(container) {
  const breakdown = CATEGORY_BREAKDOWN;
  const summary = DASHBOARD_SUMMARY;

  container.innerHTML = `
    <div class="page-enter">
      <div class="page-header">
        <div>
          <h1 class="page-title">Insights</h1>
          <p class="page-subtitle">Understand your impact better.</p>
        </div>
        <div class="flex items-center gap-4">
          <div class="tabs">
            <button class="tab ${activePeriod === 'week' ? 'active' : ''}" data-period="week">Week</button>
            <button class="tab ${activePeriod === 'month' ? 'active' : ''}" data-period="month">Month</button>
            <button class="tab ${activePeriod === 'year' ? 'active' : ''}" data-period="year">Year</button>
          </div>
          <div class="flex items-center gap-2" style="background: var(--bg-card); padding: var(--space-2) var(--space-4); border-radius: var(--radius-md); border: 1px solid var(--border-light);">
            <span class="text-sm">May 2026</span>
            <span style="color: var(--text-tertiary);">▾</span>
          </div>
        </div>
      </div>

      <!-- Metric Cards Row -->
      <div class="grid-4 mb-8 stagger-1">
        <div class="card">
          <div class="text-xs text-secondary mb-2">Top Emission Source</div>
          <div style="display: flex; align-items: center; gap: var(--space-2);">
            <span style="width: 10px; height: 10px; border-radius: 50%; background: var(--green-800);"></span>
            <span class="font-semibold text-sm">Transport</span>
          </div>
          <div style="font-family: var(--font-heading); font-size: var(--text-2xl); font-weight: 700; color: var(--green-800);">42%</div>
          <div class="text-xs text-secondary">of your total</div>
        </div>
        <div class="card">
          <div class="text-xs text-secondary mb-2">Total Emissions</div>
          <div style="font-family: var(--font-heading); font-size: var(--text-2xl); font-weight: 700;">${summary.co2Saved.value + 6.1}</div>
          <div class="text-xs text-secondary">kg CO₂e</div>
        </div>
        <div class="card">
          <div class="text-xs text-secondary mb-2">Money Saved</div>
          <div style="font-family: var(--font-heading); font-size: var(--text-2xl); font-weight: 700; color: var(--accent-gold);">₹${summary.moneySaved.value}</div>
          <div class="text-xs text-secondary">this month</div>
        </div>
        <div class="card">
          <div class="text-xs text-secondary mb-2">Trees Equivalent</div>
          <div style="font-family: var(--font-heading); font-size: var(--text-2xl); font-weight: 700; color: var(--green-600);">${summary.treesEquivalent.value}</div>
          <div class="text-xs text-secondary">this month</div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid-2 mb-8 stagger-2">
        <!-- Emissions Trend -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Emissions Trend (kg CO₂e)</h3>
          </div>
          <div class="chart-container">
            <canvas id="insights-trend"></canvas>
          </div>
        </div>

        <!-- Category Breakdown -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Category Breakdown</h3>
          </div>
          ${Object.entries(breakdown).map(([key, cat]) => `
            <div class="category-bar" style="margin-bottom: var(--space-4);">
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

      <!-- AI Insight -->
      <div class="insight-card stagger-3">
        <div class="arya-avatar">🌱</div>
        <div>
          <div class="text-xs text-secondary mb-2" style="font-weight: 600;">AI Insight</div>
          <div class="insight-text">${AI_INSIGHT.text}</div>
        </div>
        <span class="insight-icon">🍃</span>
      </div>
    </div>
  `;

  // Period tabs
  container.querySelectorAll('.tab[data-period]').forEach(tab => {
    tab.addEventListener('click', () => {
      activePeriod = tab.dataset.period;
      renderInsights(container);
    });
  });

  // Charts
  requestAnimationFrame(() => {
    const trend = EMISSION_TREND.daily;
    createBarChart('insights-trend',
      trend.map(t => t.date),
      trend.map(t => t.value),
      'kg CO₂e'
    );
  });
}
