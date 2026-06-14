// ═══════════════════════════════════════════
// SUSTAINA — Sidebar Component
// ═══════════════════════════════════════════

import { icons } from './icons.js';
import { getProfile } from '../state/store.js';
import { navigate, getCurrentRoute } from '../router.js';
import sustainaLogo from '../assets/sustaina_logo.png';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: 'home', route: 'home' },
  { id: 'analytics', label: 'Analytics', icon: 'analytics', route: 'analytics' },
  { id: 'timeline', label: 'Timeline', icon: 'timeline', route: 'timeline' },
  { id: 'activity', label: 'Activity Log', icon: 'activity', route: 'activity' },
  { id: 'coach', label: 'Arya Coach', icon: 'coach', route: 'coach' },
  { id: 'insights', label: 'Insights', icon: 'insights', route: 'insights' },
  { id: 'carbon-twin', label: 'Carbon Twin', icon: 'carbon_twin', route: 'carbon-twin' },
  { id: 'simulation-history', label: 'Simulations', icon: 'history', route: 'simulation-history' },
  { id: 'purchase-advisor', label: 'Purchase Advisor', icon: 'shopping', route: 'purchase-advisor' },
  { id: 'reports', label: 'Reports', icon: 'reports', route: 'reports' },
  { id: 'goals', label: 'Goals', icon: 'goals', route: 'goals' },
  { id: 'notifications', label: 'Notifications', icon: 'bell', route: 'notifications' },
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
      <div class="sidebar-brand" style="padding: 0 var(--space-6); margin-top: var(--space-4); margin-bottom: var(--space-6);">
        <img src="${sustainaLogo}" alt="Sustaina Logo" style="max-height: 48px; object-fit: contain; width: auto; max-width: 100%; display: block;" />
      </div>

      <div class="sidebar-user">
        <div class="sidebar-user-avatar">${initials}</div>
        <div class="sidebar-user-info">
          <div class="sidebar-user-name">${profile.name || 'Guest'}</div>
          <div class="sidebar-user-role">Sustainability Explorer</div>
        </div>
      </div>

      <div class="sidebar-nav">
        <ul class="sidebar-nav-list" aria-label="Main Navigation">
          ${NAV_ITEMS.map(item => `
            <li class="sidebar-nav-item-wrapper">
              <button class="sidebar-nav-item ${currentRoute === item.route ? 'active' : ''}" 
                      data-route="${item.route}" id="nav-${item.id}"
                      aria-label="${item.label}"
                      ${currentRoute === item.route ? 'aria-current="page"' : ''}>
                <span class="sidebar-nav-icon" aria-hidden="true">${icons[item.icon]}</span>
                <span>${item.label}</span>
              </button>
            </li>
          `).join('')}
        </ul>
      </div>

      <div class="sidebar-footer">
        <button class="sidebar-footer-item" aria-label="Help and Support">
          <span class="sidebar-nav-icon" aria-hidden="true">${icons.help}</span>
          <span>Help & Support</span>
        </button>
      </div>
    </nav>
  `;

  // Add click and keydown handlers
  container.querySelectorAll('.sidebar-nav-item').forEach(item => {
    const navigateRoute = () => {
      const route = item.dataset.route;
      navigate(route);
    };
    item.addEventListener('click', navigateRoute);
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        navigateRoute();
      }
    });
  });

  // Help support focus support
  const helpBtn = container.querySelector('.sidebar-footer-item');
  helpBtn?.addEventListener('click', () => {
    alert('Support system coming soon!');
  });
  helpBtn?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      alert('Support system coming soon!');
    }
  });
}
