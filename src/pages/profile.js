// ═══════════════════════════════════════════
// SUSTAINA — Profile Page
// ═══════════════════════════════════════════

import { getProfile, getAchievements } from '../state/store.js';
import { calcSustainabilityScore, getScoreBand } from '../data/emissions.js';
import { icons } from '../components/icons.js';

export function renderProfile(container) {
  const profile = getProfile();
  const achievements = getAchievements();
  const score = calcSustainabilityScore(profile);
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
      <div class="sustainability-score-card mb-6 stagger-2">
        <div class="score-badge">
          <div class="score-badge-level">Lvl ${band.level}</div>
          <div class="score-badge-label">${band.emoji}</div>
        </div>
        <div>
          <h3 style="font-size: var(--text-lg); font-weight: 700; margin-bottom: var(--space-1);">
            Level ${band.level} — ${band.name}
          </h3>
          <div class="text-sm text-secondary">${profile.xp.toLocaleString()} / ${profile.xpNext.toLocaleString()} XP</div>
          <div class="progress-bar mt-4" style="width: 200px;">
            <div class="progress-bar-fill" style="width: ${(profile.xp / profile.xpNext * 100)}%;"></div>
          </div>
        </div>
        <div style="margin-left: auto; text-align: center;">
          <div style="font-family: var(--font-heading); font-size: var(--text-4xl); font-weight: 700; color: var(--green-800);">${score.total}</div>
          <div class="text-xs text-secondary">Sustainability Score</div>
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
