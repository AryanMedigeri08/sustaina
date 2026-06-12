// ═══════════════════════════════════════════
// SUSTAINA — Profile Page
// ═══════════════════════════════════════════

import { getProfile, getAchievements, getActivities, getGoals } from '../state/store.js';
import { calcSustainabilityScore, getScoreBand } from '../data/emissions.js';
import { icons } from '../components/icons.js';

export function renderProfile(container) {
  const profile = getProfile();
  const achievements = getAchievements();
  const activities = getActivities();
  const goals = getGoals();
  const score = calcSustainabilityScore(profile, activities, goals);
  const band = getScoreBand(score.total);
  const initials = (profile.name || 'A').split(' ').map(n => n[0]).join('').toUpperCase();

  container.innerHTML = `
    <div class="page-enter">
      <div class="page-header">
        <div>
          <h1 class="page-title">Profile</h1>
          <p class="page-subtitle">Manage your profile and preferences.</p>
        </div>
      </div>

      <!-- Profile Header -->
      <div class="card mb-6 stagger-1">
        <div class="profile-header">
          <div class="profile-avatar-large">${initials}</div>
          <div>
            <div class="profile-name">${profile.name}</div>
            <div class="profile-member">Member since ${new Date(profile.memberSince).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</div>
          </div>
          <button class="btn btn-secondary" style="margin-left: auto;">
            ${icons.edit} Edit Profile
          </button>
        </div>
      </div>

      <!-- Sustainability Score -->
      <div class="sustainability-score-card mb-6 stagger-2" style="display: flex; flex-direction: column; gap: var(--space-4); height: auto; padding: var(--space-6);">
        <div style="display: flex; align-items: center; width: 100%; gap: var(--space-4); flex-wrap: wrap;">
          <div class="score-badge">
            <div class="score-badge-level">Lvl ${band.level}</div>
            <div class="score-badge-label">${band.emoji}</div>
          </div>
          <div>
            <h3 style="font-size: var(--text-lg); font-weight: 700; margin-bottom: var(--space-1);">
              Level ${band.level} — ${band.name}
            </h3>
            <div class="text-sm text-secondary">${profile.xp.toLocaleString()} / ${profile.xpNext.toLocaleString()} XP</div>
            <div class="progress-bar mt-2" style="width: 200px;">
              <div class="progress-bar-fill" style="width: ${(profile.xp / profile.xpNext * 100)}%;"></div>
            </div>
          </div>
          <div style="margin-left: auto; text-align: center;">
            <div style="font-family: var(--font-heading); font-size: var(--text-4xl); font-weight: 700; color: var(--green-800);">${score.total}</div>
            <div class="text-xs text-secondary">Sustainability Score</div>
          </div>
        </div>

        <!-- Score Breakdown Details -->
        <div style="border-top: 1px solid var(--border-light); padding-top: var(--space-4); width: 100%;">
          <h4 style="font-size: var(--text-sm); font-weight: 700; margin-bottom: var(--space-4); color: var(--text-primary);">Transparent Score Breakdown</h4>
          <div class="grid-2" style="gap: var(--space-5);">
            <div>
              <div style="display: flex; justify-content: space-between; font-size: var(--text-xs); margin-bottom: 4px;">
                <span class="text-secondary">Carbon Footprint Reduction (30%)</span>
                <span class="font-bold">${score.carbonReduction} / 30</span>
              </div>
              <div class="progress-bar" style="height: 6px;">
                <div class="progress-bar-fill" style="width: ${(score.carbonReduction / 30 * 100)}%;"></div>
              </div>
              <div class="text-secondary mt-1" style="font-size: 10px;">Footprint vs standard Pune average (4.2t CO₂e/yr).</div>
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; font-size: var(--text-xs); margin-bottom: 4px;">
                <span class="text-secondary">Logging Consistency (25%)</span>
                <span class="font-bold">${score.consistency} / 25</span>
              </div>
              <div class="progress-bar" style="height: 6px;">
                <div class="progress-bar-fill" style="width: ${(score.consistency / 25 * 100)}%;"></div>
              </div>
              <div class="text-secondary mt-1" style="font-size: 10px;">Number of unique days you log activities.</div>
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; font-size: var(--text-xs); margin-bottom: 4px;">
                <span class="text-secondary">Goal Completion (25%)</span>
                <span class="font-bold">${score.goalCompletion} / 25</span>
              </div>
              <div class="progress-bar" style="height: 6px;">
                <div class="progress-bar-fill" style="width: ${(score.goalCompletion / 25 * 100)}%;"></div>
              </div>
              <div class="text-secondary mt-1" style="font-size: 10px;">Percentage of your sustainability goals reached.</div>
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; font-size: var(--text-xs); margin-bottom: 4px;">
                <span class="text-secondary">Activity Volume (20%)</span>
                <span class="font-bold">${score.activityLogging} / 20</span>
              </div>
              <div class="progress-bar" style="height: 6px;">
                <div class="progress-bar-fill" style="width: ${(score.activityLogging / 20 * 100)}%;"></div>
              </div>
              <div class="text-secondary mt-1" style="font-size: 10px;">Total activities logged in logbook (max 10).</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Achievements -->
      <div class="card mb-6 stagger-3">
        <h3 class="card-title mb-4">Achievements</h3>
        <div style="display: flex; gap: var(--space-6); flex-wrap: wrap;">
          ${achievements.map(a => `
            <div class="achievement">
              <div class="achievement-icon ${a.earned ? '' : 'locked'}">
                ${a.icon}
              </div>
              <span class="achievement-name">${a.name}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Preferences -->
      <div class="card stagger-4">
        <h3 class="card-title mb-4">Preferences</h3>
        <div class="settings-row">
          <span class="settings-label">Language</span>
          <span class="settings-value">English <span style="color: var(--green-600);">●</span></span>
        </div>
        <div class="settings-row">
          <span class="settings-label">Notifications</span>
          <span class="settings-value">Enabled ✓</span>
        </div>
        <div class="settings-row">
          <span class="settings-label">Mentoring</span>
          <span class="settings-value">Active</span>
        </div>
      </div>
    </div>
  `;
}
