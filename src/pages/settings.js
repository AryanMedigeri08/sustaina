// ═══════════════════════════════════════════
// SUSTAINA — Settings Page
// ═══════════════════════════════════════════

import { getSettings, setSetting, getProfile } from '../state/store.js';

function toggle(id, label, checked, onChange) {
  return `
    <div class="settings-row">
      <span class="settings-label">${label}</span>
      <label class="toggle" id="toggle-${id}">
        <input type="checkbox" ${checked ? 'checked' : ''} data-setting="${id}" />
        <span class="toggle-track"></span>
        <span class="toggle-thumb"></span>
      </label>
    </div>
  `;
}

export function renderSettings(container) {
  const settings = getSettings();
  const profile = getProfile();

  container.innerHTML = `
    <div class="page-enter">
      <div class="page-header">
        <div>
          <h1 class="page-title">Settings</h1>
          <p class="page-subtitle">Customize your Sustaina experience.</p>
        </div>
      </div>

      <!-- Account Section -->
      <div class="card mb-6 stagger-1">
        <div class="settings-section">
          <h3 class="settings-section-title">Account</h3>
          <div class="settings-row">
            <span class="settings-label">Full Name</span>
            <span class="settings-value">${profile.name}</span>
          </div>
          <div class="settings-row">
            <span class="settings-label">Email</span>
            <span class="settings-value">aryan.sharma@email.com</span>
          </div>
          <div class="settings-row">
            <span class="settings-label">Phone</span>
            <span class="settings-value">+91 98XXX XXXXX</span>
          </div>
        </div>
      </div>

      <!-- Language Section -->
      <div class="card mb-6 stagger-2">
        <div class="settings-section">
          <h3 class="settings-section-title">Language</h3>
          <div class="settings-row">
            <span class="settings-label">App Language</span>
            <span class="settings-value">
              English <span style="color: var(--green-600);">●</span>
            </span>
          </div>
          <div class="settings-row">
            <span class="settings-label">Arya's Language</span>
            <span class="settings-value">English</span>
          </div>
        </div>
      </div>

      <!-- Notifications Section -->
      <div class="card mb-6 stagger-3">
        <div class="settings-section">
          <h3 class="settings-section-title">Notifications</h3>
          ${toggle('notifications', 'Push Notifications', settings.notifications)}
          ${toggle('emailNotifications', 'Email Notifications', settings.emailNotifications)}
          ${toggle('weeklyReport', 'Weekly Report', settings.weeklyReport)}
        </div>
      </div>

      <!-- Help Section -->
      <div class="card mb-6 stagger-4">
        <div class="settings-section">
          <h3 class="settings-section-title">Help & Support</h3>
          <div class="settings-row" style="cursor: pointer;">
            <span class="settings-label">FAQ</span>
            <span class="settings-value">→</span>
          </div>
          <div class="settings-row" style="cursor: pointer;">
            <span class="settings-label">Contact Support</span>
            <span class="settings-value">→</span>
          </div>
          <div class="settings-row" style="cursor: pointer;">
            <span class="settings-label">Terms & Privacy</span>
            <span class="settings-value">→</span>
          </div>
          <div class="settings-row" style="cursor: pointer;">
            <span class="settings-label">About Sustaina</span>
            <span class="settings-value">v1.0.0</span>
          </div>
        </div>
      </div>

      <!-- App Info -->
      <div class="card stagger-5">
        <div class="settings-section">
          <h3 class="settings-section-title">App Settings</h3>
          <div class="settings-row">
            <span class="settings-label">Imperial/Metric</span>
            <span class="settings-value">Metric (km, kg)</span>
          </div>
          ${toggle('darkMode', 'Dark Mode', settings.darkMode)}
        </div>
      </div>
    </div>
  `;

  // Toggle handlers
  container.querySelectorAll('.toggle input').forEach(input => {
    input.addEventListener('change', () => {
      setSetting(input.dataset.setting, input.checked);
    });
  });
}
