// ═══════════════════════════════════════════
// SUSTAINA — Carbon Twin™ Page
// ═══════════════════════════════════════════

import { CARBON_TWIN } from '../data/mockData.js';
import { navigate } from '../router.js';

export function renderCarbonTwin(container) {
  const twin = CARBON_TWIN;

  container.innerHTML = `
    <div class="page-enter">
      <div class="page-header">
        <div>
          <h1 class="page-title">Carbon Twin</h1>
          <p class="page-subtitle">See the impact of your choices.</p>
        </div>
      </div>

      <!-- Split View -->
      <div class="twin-container stagger-1">
        <!-- Current You -->
        <div class="twin-panel current">
          <div class="twin-panel-label">Current You</div>
          <div class="twin-panel-sublabel">Your current lifestyle impact</div>
          <div class="twin-illustration">
            <div style="text-align: center;">
              <div style="font-size: 64px; margin-bottom: 8px;">🏭</div>
              <div style="font-size: 28px;">🏙️</div>
            </div>
          </div>
          <div class="twin-metric">${twin.current.co2PerYear}</div>
          <div class="twin-metric-unit">${twin.current.label}</div>
        </div>

        <!-- Future You -->
        <div class="twin-panel future">
          <div class="twin-panel-label">Future You</div>
          <div class="twin-panel-sublabel">${twin.future.pctChanges}</div>
          <div class="twin-illustration">
            <div style="text-align: center;">
              <div style="font-size: 64px; margin-bottom: 8px;">🌳</div>
              <div style="font-size: 28px;">🏡🌿</div>
            </div>
          </div>
          <div class="twin-metric">${twin.future.co2PerYear}</div>
          <div class="twin-metric-unit">${twin.future.label}</div>
        </div>
      </div>

      <!-- Reduction Banner -->
      <div class="card text-center mb-8 stagger-2" style="background: linear-gradient(135deg, var(--green-50), var(--green-100)); border: 1px solid var(--green-200);">
        <div class="text-sm text-secondary mb-2">You can reduce</div>
        <div style="font-family: var(--font-heading); font-size: var(--text-3xl); font-weight: 700; color: var(--green-800);">
          ${twin.reduction} <span style="font-size: var(--text-sm); font-weight: 400;">tonnes CO₂e / year</span>
        </div>
      </div>

      <!-- Impact Cards -->
      <div class="impact-cards mb-8 stagger-3">
        <div class="impact-card">
          <div class="impact-card-icon gold">💰</div>
          <div>
            <div class="impact-card-value">₹${twin.moneySaved.toLocaleString('en-IN')}</div>
            <div class="metric-label">per year</div>
          </div>
        </div>
        <div class="impact-card">
          <div class="impact-card-icon green">🌳</div>
          <div>
            <div class="impact-card-value">${twin.treesSaved}</div>
            <div class="metric-label">per year</div>
          </div>
        </div>
        <div class="impact-card">
          <div class="impact-card-icon green">📈</div>
          <div>
            <div class="impact-card-value">↑ ${twin.improvementPct}%</div>
            <div class="metric-label">improvement</div>
          </div>
        </div>
      </div>

      <!-- See My Path CTA -->
      <div class="stagger-4">
        <button class="btn btn-primary btn-xl" id="twin-see-path">
          See My Path
        </button>
      </div>
    </div>
  `;

  document.getElementById('twin-see-path')?.addEventListener('click', () => {
    navigate('coach');
  });
}
