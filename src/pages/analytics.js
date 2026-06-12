// ═══════════════════════════════════════════
// SUSTAINA — Analytics Page
// Advanced tracking for savings, carbon shifts, and recommendation effectiveness
// ═══════════════════════════════════════════

import { getActivities, getGoals, getMemory } from '../state/store.js';
import { createBarChart, createLineChart } from '../components/charts.js';

export function renderAnalytics(container) {
  const activities = getActivities();
  const goals = getGoals();
  const memory = getMemory();

  // 1. Calculate Lifetime metrics
  const lifetimeCO2Saved = activities.reduce((sum, a) => sum + parseFloat(a.co2 || 0), 0);
  const lifetimeSavings = Math.round(lifetimeCO2Saved * 5.2);
  
  // 2. Goal completion calculation
  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.progress >= 100).length;
  const goalSuccessRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  // 3. Recommendation Success Rate
  const accepted = memory.acceptedSuggestions?.length || 0;
  const ignored = memory.ignoredSuggestions?.length || 0;
  const totalSuggestions = accepted + ignored;
  const recSuccessRate = totalSuggestions > 0 ? Math.round((accepted / totalSuggestions) * 100) : 72; // default fallback 72%

  container.innerHTML = `
    <div class="page-enter">
      <div class="page-header">
        <div>
          <h1 class="page-title">Advanced Analytics</h1>
          <p class="page-subtitle">Granular insights on carbon footprints, financial trends, and habits.</p>
        </div>
      </div>

      <!-- Lifetime Summary Cards -->
      <div class="impact-cards mb-6 stagger-1">
        <div class="impact-card">
          <div class="impact-card-icon green">🌿</div>
          <div>
            <div class="metric-label">Lifetime Carbon Reduction</div>
            <div class="impact-card-value">${lifetimeCO2Saved.toFixed(1)} <span style="font-size: var(--text-sm); font-weight: 400;">kg CO₂e</span></div>
          </div>
        </div>
        <div class="impact-card">
          <div class="impact-card-icon gold">💰</div>
          <div>
            <div class="metric-label">Lifetime Financial Savings</div>
            <div class="impact-card-value">₹${lifetimeSavings.toLocaleString('en-IN')}</div>
          </div>
        </div>
        <div class="impact-card">
          <div class="impact-card-icon green">📈</div>
          <div>
            <div class="metric-label">Rec Success Rate</div>
            <div class="impact-card-value">${recSuccessRate}%</div>
          </div>
        </div>
      </div>

      <!-- Charts Grid -->
      <div class="grid-2 mb-6 stagger-2">
        <!-- Weekly Trends Line Chart -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Weekly Carbon Trend</h3>
            <span class="text-xs text-secondary">Past 4 Weeks</span>
          </div>
          <div class="chart-container" style="height: 220px;">
            <canvas id="analytics-weekly-chart"></canvas>
          </div>
        </div>

        <!-- Monthly Trends Bar Chart -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Monthly Carbon Breakdown</h3>
            <span class="text-xs text-secondary">Past 6 Months</span>
          </div>
          <div class="chart-container" style="height: 220px;">
            <canvas id="analytics-monthly-chart"></canvas>
          </div>
        </div>
      </div>

      <!-- Additional Insights Row -->
      <div class="grid-2 stagger-3">
        <!-- Goal Progress Card -->
        <div class="card">
          <h3 class="card-title mb-4">Goals Completion Audit</h3>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-3);">
            <span class="text-sm text-secondary">Total Goals Tracked: <strong>${totalGoals}</strong></span>
            <span class="text-sm font-bold text-accent">${goalSuccessRate}% Completed</span>
          </div>
          <div class="progress-bar mb-4" style="height: 12px;">
            <div class="progress-bar-fill" style="width: ${goalSuccessRate}%;"></div>
          </div>
          <p style="font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.4; text-align: left;">
            Focus on completing pending targets to increase your overall Consistency score by 25 points.
          </p>
        </div>

        <!-- Impact Sector -->
        <div class="card flex flex-col justify-between" style="text-align: left;">
          <h3 class="card-title mb-3">Dominant Impact Sector</h3>
          <div style="display: flex; align-items: center; gap: var(--space-4);">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: var(--green-100); display: flex; align-items: center; justify-content: center; font-size: 24px;">🚗</div>
            <div>
              <div class="font-semibold text-sm">Transport Commuting</div>
              <div style="font-size: var(--text-xs); color: var(--text-secondary); margin-top: 2px;">
                Contributes roughly 48% of logged footprints. Shift to shared transport to offset this impact area.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Draw charts after DOM paint
  requestAnimationFrame(() => {
    // 1. Weekly Chart Data (Mocking 4 weeks totals from activities)
    const weeklyLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const weeklyValues = [45, 38, 52, Math.max(15, Math.round(lifetimeCO2Saved))];
    createLineChart('analytics-weekly-chart', weeklyLabels, weeklyValues, 'kg CO₂');

    // 2. Monthly Chart Data (Mocking past 6 months)
    const monthlyLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const monthlyValues = [245, 230, 220, 235, 210, Math.max(80, Math.round(lifetimeCO2Saved * 4))];
    createBarChart('analytics-monthly-chart', monthlyLabels, monthlyValues, 'kg CO₂');
  });
}
