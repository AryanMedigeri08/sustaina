// ═══════════════════════════════════════════
// SUSTAINA — Monthly Report Page
// ═══════════════════════════════════════════

import { REPORT_DATA, CATEGORY_BREAKDOWN, EMISSION_TREND, DASHBOARD_SUMMARY } from '../data/mockData.js';
import { createLineChart } from '../components/charts.js';
import { icons } from '../components/icons.js';

export function renderReports(container) {
  const report = REPORT_DATA;
  const breakdown = CATEGORY_BREAKDOWN;

  container.innerHTML = `
    <div class="page-enter">
      <div class="report-header">
        <div>
          <h1 class="page-title">Monthly Report</h1>
          <p class="page-subtitle">Detailed overview of your sustainability.</p>
        </div>
        <div class="report-actions">
          <div class="flex items-center gap-2" style="background: white; padding: var(--space-2) var(--space-4); border-radius: var(--radius-md); border: 1px solid var(--border-light);">
            <span class="text-sm font-semibold">April 2026</span>
            <span style="color: var(--text-tertiary);">▾</span>
          </div>
          <button class="btn btn-secondary" id="download-report">
            ${icons.download} Download PDF
          </button>
        </div>
      </div>

      <!-- Report Metric Cards -->
      <div class="grid-4 mb-8 stagger-1">
        <div class="card">
          <div class="text-xs text-secondary mb-2">Total Emissions</div>
          <div style="font-family: var(--font-heading); font-size: var(--text-2xl); font-weight: 700;">${report.totalEmissions}</div>
          <div class="text-xs text-secondary">${report.totalEmissionsUnit}</div>
        </div>
        <div class="card">
          <div class="text-xs text-secondary mb-2">Reduction</div>
          <div style="font-family: var(--font-heading); font-size: var(--text-2xl); font-weight: 700; color: var(--green-600);">${report.reduction}%</div>
          <div class="text-xs text-secondary">vs last month</div>
        </div>
        <div class="card">
          <div class="text-xs text-secondary mb-2">Money Saved</div>
          <div style="font-family: var(--font-heading); font-size: var(--text-2xl); font-weight: 700; color: var(--accent-gold);">₹${report.moneySaved}</div>
          <div class="text-xs text-secondary">this month</div>
        </div>
        <div class="card">
          <div class="text-xs text-secondary mb-2">Trees Equivalent</div>
          <div style="font-family: var(--font-heading); font-size: var(--text-2xl); font-weight: 700; color: var(--green-600);">${report.treesEquivalent}</div>
          <div class="text-xs text-secondary">this month</div>
        </div>
      </div>

      <div class="grid-2 mb-8 stagger-2">
        <!-- Category Breakdown -->
        <div class="card">
          <h3 class="card-title mb-4">Category Breakdown</h3>
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

        <!-- Emissions Trend -->
        <div class="card">
          <h3 class="card-title mb-4">Emissions Trend</h3>
          <div class="chart-container">
            <canvas id="report-trend"></canvas>
          </div>
        </div>
      </div>

      <!-- Report Summary -->
      <div class="card stagger-3" style="background: linear-gradient(135deg, var(--green-50), var(--neutral-50)); border: 1px solid var(--green-200);">
        <div class="card-header">
          <h3 class="card-title">Report Summary</h3>
        </div>
        <div class="flex gap-4 items-center">
          <div class="arya-avatar">🌱</div>
          <p class="text-sm" style="line-height: var(--leading-relaxed);">${report.summary}</p>
        </div>
      </div>
    </div>
  `;

  requestAnimationFrame(() => {
    const trend = EMISSION_TREND.monthly;
    createLineChart('report-trend',
      trend.map(t => t.date),
      trend.map(t => t.value),
      'kg CO₂e'
    );
  });
}
