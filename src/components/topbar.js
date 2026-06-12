// ═══════════════════════════════════════════
// SUSTAINA — Topbar Component
// ═══════════════════════════════════════════

import { icons } from './icons.js';
import { getProfile } from '../state/store.js';

export function renderTopbar(container) {
  const profile = getProfile();
  const initials = (profile.name || 'A').split(' ').map(n => n[0]).join('').toUpperCase();

  container.innerHTML = `
    <header class="topbar" id="topbar">
      <div class="topbar-actions">
        <button class="topbar-btn" id="topbar-search" title="Search">
          ${icons.search}
        </button>
        <button class="topbar-btn" id="topbar-notifications" title="Notifications">
          ${icons.bell}
          <span class="notification-dot"></span>
        </button>
        <button class="topbar-btn" id="topbar-theme" title="Toggle theme">
          ${icons.moon}
        </button>
        <div class="topbar-avatar" id="topbar-avatar" title="${profile.name || 'Profile'}">
          ${initials}
        </div>
      </div>
    </header>
  `;
}
