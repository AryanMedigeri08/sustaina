// ═══════════════════════════════════════════
// SUSTAINA — Arya Coach Page
// Dynamic AI-generated coaching recommendations
// ═══════════════════════════════════════════

import { getProfile, getActivities, getMemory, acceptSuggestion, ignoreSuggestion } from '../state/store.js';
import { getCoachRecommendations } from '../services/gemini.js';
import { navigate } from '../router.js';
import aryaLogo from '../assets/arya_logo.jpg';

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
      <text x="${size/2}" y="${size/2 + 6}" text-anchor="middle" fill="white" font-family="Manrope" font-size="22" font-weight="700">${pct}%</text>
    </svg>
  `;
}

export function renderAryaCoach(container) {
  const profile = getProfile();
  const activities = getActivities();
  const memory = getMemory();

  // Show Loading Spinner / skeleton state
  container.innerHTML = `
    <div class="page-enter">
      <div class="page-header" style="display: flex; align-items: center; gap: var(--space-4); margin-bottom: var(--space-6);">
        <img src="${aryaLogo}" alt="Arya Logo" style="width: 56px; height: 56px; border-radius: var(--radius-full); object-fit: cover; border: 2px solid var(--green-600); box-shadow: var(--shadow-sm); flex-shrink: 0;" />
        <div>
          <h1 class="page-title">Arya Coach</h1>
          <p class="page-subtitle">Personalized recommendations by Arya</p>
        </div>
      </div>
      
      <!-- Skeleton Hero Card -->
      <div class="weekly-plan-card mb-8" style="background: var(--neutral-300); opacity: 0.7; height: 180px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-lg);">
        <div style="text-align: center;">
          <div style="font-size: 24px; margin-bottom: var(--space-2); animation: spin 1s linear infinite;">🍃</div>
          <div style="font-size: var(--text-sm); font-weight: 600;">Arya is customizing your weekly plan...</div>
        </div>
      </div>
    </div>
  `;

  // Fetch recommendations asynchronously
  getCoachRecommendations(profile, activities, memory).then(data => {
    container.innerHTML = `
      <div class="page-enter">
        <div class="page-header" style="display: flex; align-items: center; gap: var(--space-4); margin-bottom: var(--space-6);">
          <img src="${aryaLogo}" alt="Arya Logo" style="width: 56px; height: 56px; border-radius: var(--radius-full); object-fit: cover; border: 2px solid var(--green-600); box-shadow: var(--shadow-sm); flex-shrink: 0;" />
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
              <div class="weekly-plan-week">${data.weekRange || 'Conversational Weekly Plan'}</div>
            </div>
          </div>
          <div class="weekly-plan-content">
            <div class="weekly-plan-progress-ring">
              ${createProgressRing(data.progressPct || 60, 110)}
            </div>
            <div class="weekly-plan-recommendations" style="flex: 1;">
              <div style="font-size: var(--text-sm); opacity: 0.7; margin-bottom: var(--space-3);">
                Follow these personalized suggestions. Accepting suggestions will record them in your sustainability profile.
              </div>
              <div style="display: flex; flex-direction: column; gap: var(--space-3);" id="coach-rec-list">
                ${data.recommendations.map((rec, index) => `
                  <div class="weekly-plan-recommendation" id="rec-item-${index}" style="display: flex; align-items: center; justify-content: space-between; gap: var(--space-4); padding: var(--space-2) 0; border-bottom: 1px dashed rgba(255,255,255,0.15);">
                    <div style="display: flex; gap: var(--space-2); align-items: flex-start; text-align: left;">
                      <span style="opacity: 0.7; font-weight: bold; margin-top: 1px;">•</span>
                      <span class="rec-text">${rec}</span>
                    </div>
                    <div style="display: flex; gap: var(--space-2); flex-shrink: 0;">
                      <button class="btn-rec-accept" data-rec="${rec}" data-idx="${index}" style="cursor: pointer; padding: var(--space-1) var(--space-3); border-radius: var(--radius-sm); background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.4); color: white; font-size: var(--text-xs); font-weight: 600; transition: all var(--transition-fast);">Accept</button>
                      <button class="btn-rec-dismiss" data-rec="${rec}" data-idx="${index}" style="cursor: pointer; padding: var(--space-1) var(--space-2); border-radius: var(--radius-sm); background: transparent; border: 1px solid rgba(255,255,255,0.2); color: rgba(255,255,255,0.7); font-size: var(--text-xs); font-weight: 500; transition: all var(--transition-fast);">Ignore</button>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>

        <!-- Coaching Cards Grid -->
        <div class="grid-2 stagger-2">
          ${data.cards.map(card => `
            <div class="coaching-card" style="display: flex; align-items: center; gap: var(--space-4); border: 1px solid var(--border-light); padding: var(--space-5); border-radius: var(--radius-lg); background: white;">
              <div class="coaching-card-icon" style="background: ${card.bgColor}; width: 48px; height: 48px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0;">
                ${card.icon}
              </div>
              <div class="coaching-card-content" style="flex: 1; text-align: left;">
                <div class="coaching-card-title" style="font-family: var(--font-heading); font-weight: 700; font-size: var(--text-md);">${card.title}</div>
                <div class="coaching-card-desc" style="font-size: var(--text-sm); color: var(--text-secondary); margin-top: 2px;">${card.desc}</div>
                <div class="coaching-card-impact" style="margin-top: 6px;">
                  <span class="badge badge-green" style="background: var(--green-100); color: var(--green-800); padding: 2px var(--space-2); border-radius: var(--radius-sm); font-size: var(--text-xs); font-weight: 600;">${card.impact}</span>
                  ${card.secondary ? `<span class="badge badge-blue" style="background: #e3f0ff; color: #1a5fb4; padding: 2px var(--space-2); border-radius: var(--radius-sm); font-size: var(--text-xs); font-weight: 600; margin-left: 6px;">${card.secondary}</span>` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- View Detailed Plan -->
        <div class="text-center mt-8 stagger-3">
          <button class="btn btn-secondary btn-lg" id="coach-view-plan">
            View Footprint Insights
          </button>
        </div>
      </div>
    `;

    // Hook listeners for Acceptance and Dismissals
    container.querySelectorAll('.btn-rec-accept').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const recText = btn.dataset.rec;
        const idx = btn.dataset.idx;
        acceptSuggestion(recText);
        
        // Visual feedback
        const recItem = document.getElementById(`rec-item-${idx}`);
        if (recItem) {
          recItem.style.opacity = '0.5';
          btn.outerHTML = '<span style="color: #ddf0cd; font-size: var(--text-xs); font-weight: 600;">Accepted ✓</span>';
          recItem.querySelector('.btn-rec-dismiss')?.remove();
        }
      });
    });

    container.querySelectorAll('.btn-rec-dismiss').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const recText = btn.dataset.rec;
        ignoreSuggestion(recText);

        // Regenerate Coach Recommendations
        renderAryaCoach(container);
      });
    });

    document.getElementById('coach-view-plan')?.addEventListener('click', () => {
      navigate('insights');
    });
  });
}
