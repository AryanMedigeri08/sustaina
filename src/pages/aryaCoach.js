// ═══════════════════════════════════════════
// SUSTAINA — Arya Coach Page
// ═══════════════════════════════════════════

import { getProfile } from '../state/store.js';
import { COACHING_DATA } from '../data/mockData.js';
import { navigate } from '../router.js';

function createProgressRing(pct, size = 100) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="6"/>
      <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="white" stroke-width="6" 
        stroke-linecap="round" stroke-dasharray="${circ}" stroke-dashoffset="${offset}"
        transform="rotate(-90 ${size/2} ${size/2})" style="transition: stroke-dashoffset 1s ease;"/>
      <text x="${size/2}" y="${size/2 + 6}" text-anchor="middle" fill="white" font-family="Outfit" font-size="22" font-weight="700">${pct}%</text>
    </svg>
  `;
}

export function renderAryaCoach(container) {
  const profile = getProfile();
  const data = COACHING_DATA;

  container.innerHTML = `
    <div class="page-enter">
      <div class="page-header">
        <div>
          <h1 class="page-title">Arya Coach</h1>
          <p class="page-subtitle">Personalized recommendations by Arya</p>
        </div>
      </div>

      <!-- Weekly Plan Hero Card -->
      <div class="weekly-plan-card mb-8 stagger-1">
        <div class="weekly-plan-header">
          <div>
            <div class="weekly-plan-title">Your weekly plan is ready! 🌱</div>
            <div class="weekly-plan-week">${data.weekRange}</div>
          </div>
        </div>
        <div class="weekly-plan-content">
          <div class="weekly-plan-progress-ring">
            ${createProgressRing(data.progressPct, 110)}
          </div>
          <div class="weekly-plan-recommendations">
            <div style="font-size: var(--text-sm); opacity: 0.7; margin-bottom: var(--space-3);">
              Follow these personalized recommendations to reduce your impact.
            </div>
            ${data.recommendations.map(rec => `
              <div class="weekly-plan-recommendation">
                <span style="opacity: 0.6;">•</span>
                <span>${rec}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Coaching Cards Grid -->
      <div class="grid-2 stagger-2">
        ${data.cards.map(card => `
          <div class="coaching-card">
            <div class="coaching-card-icon" style="background: ${card.bgColor};">
              ${card.icon}
            </div>
            <div class="coaching-card-content">
              <div class="coaching-card-title">${card.title}</div>
              <div class="coaching-card-desc">${card.desc}</div>
              <div class="coaching-card-impact">
                <span class="badge badge-green">${card.impact}</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- View Detailed Plan -->
      <div class="text-center mt-8 stagger-3">
        <button class="btn btn-secondary btn-lg" id="coach-view-plan">
          View Detailed Plan
        </button>
      </div>
    </div>
  `;

  document.getElementById('coach-view-plan')?.addEventListener('click', () => {
    navigate('insights');
  });
}
