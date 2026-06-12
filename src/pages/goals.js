// ═══════════════════════════════════════════
// SUSTAINA — Goals Page
// ═══════════════════════════════════════════

import { getGoals } from '../state/store.js';
import { icons } from '../components/icons.js';

export function renderGoals(container) {
  const goals = getGoals();

  container.innerHTML = `
    <div class="page-enter">
      <div class="page-header">
        <div>
          <h1 class="page-title">My Goals</h1>
          <p class="page-subtitle">Track and achieve your sustainability goals.</p>
        </div>
        <button class="btn btn-primary" id="new-goal-btn">
          ${icons.plus} New Goal
        </button>
      </div>

      <div class="grid-2 stagger-1">
        ${goals.map(goal => `
          <div class="goal-card">
            <div class="goal-card-icon" style="background: ${goal.bgColor};">
              ${goal.icon}
            </div>
            <div class="goal-card-content">
              <div class="goal-card-title">${goal.title}</div>
              <div class="goal-card-desc">${goal.desc}</div>
              <div class="goal-card-progress">
                <div class="progress-bar">
                  <div class="progress-bar-fill ${goal.color === 'gold' ? 'gold' : ''}" style="width: ${goal.progress}%;"></div>
                </div>
              </div>
              <div class="goal-card-footer">
                <span class="goal-card-pct">${goal.progress}%</span>
                <span class="goal-card-target">Target: ${goal.target}</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
