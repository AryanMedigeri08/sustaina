// ═══════════════════════════════════════════
// SUSTAINA — Sidebar Component
// ═══════════════════════════════════════════

import { icons } from './icons.js';
import { getProfile } from '../state/store.js';
import { navigate, getCurrentRoute } from '../router.js';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: 'home', route: 'home' },
  { id: 'activity', label: 'Activity Log', icon: 'activity', route: 'activity' },
  { id: 'coach', label: 'Arya Coach', icon: 'coach', route: 'coach' },
  { id: 'insights', label: 'Insights', icon: 'insights', route: 'insights' },
  { id: 'carbon-twin', label: 'Carbon Twin', icon: 'carbon_twin', route: 'carbon-twin' },
  { id: 'purchase-advisor', label: 'Purchase Advisor', icon: 'shopping', route: 'purchase-advisor' },
  { id: 'reports', label: 'Reports', icon: 'reports', route: 'reports' },
  { id: 'goals', label: 'Goals', icon: 'goals', route: 'goals' },
  { id: 'community', label: 'Community', icon: 'community', route: 'community' },
  { id: 'profile', label: 'Profile', icon: 'profile', route: 'profile' },
  { id: 'settings', label: 'Settings', icon: 'settings', route: 'settings' },
];

export function renderSidebar(container) {
  const profile = getProfile();
  const currentRoute = getCurrentRoute();
  const initials = (profile.name || 'A').split(' ').map(n => n[0]).join('').toUpperCase();

  container.innerHTML = `
    <nav class="sidebar" id="sidebar">
      <div class="sidebar-logo">
        <div class="sidebar-logo-icon">🌱</div>
        <h1>Sustaina</h1>
      </div>
      <p class="sidebar-logo-tagline">Your AI Sustainability Companion</p>

      <div class="sidebar-user">
        <div class="sidebar-user-avatar">${initials}</div>
        <div class="sidebar-user-info">
          <div class="sidebar-user-name">${profile.name || 'Guest'}</div>
          <div class="sidebar-user-role">Sustainability Explorer</div>
        </div>
      </div>

      <div class="sidebar-nav">
        <div class="sidebar-nav-section">
          ${NAV_ITEMS.map(item => `
            <div class="sidebar-nav-item ${currentRoute === item.route ? 'active' : ''}" 
                 data-route="${item.route}" id="nav-${item.id}">
              <span class="sidebar-nav-icon">${icons[item.icon]}</span>
              <span>${item.label}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="sidebar-footer">
        <div class="sidebar-footer-item">
          <span class="sidebar-nav-icon">${icons.help}</span>
          <span>Help & Support</span>
        </div>
      </div>
    </nav>
  `;

  // Add click handlers
  container.querySelectorAll('.sidebar-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const route = item.dataset.route;
      navigate(route);
    });
  });
}
