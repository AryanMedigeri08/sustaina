// ═══════════════════════════════════════════
// SUSTAINA — Topbar Component
// Includes notification dropdowns, unread count dots, and user auth dropdown
// ═══════════════════════════════════════════

import { icons } from './icons.js';
import { getProfile, getState, setState } from '../state/store.js';
import { renderNotificationDropdownHTML, setupDropdownItemListeners } from '../pages/notifications.js';
import { signOutUser } from '../services/supabase.js';
import { navigate } from '../router.js';

export function renderTopbar(container) {
  const profile = getProfile();
  const state = getState();
  const initials = (profile.name || 'A').split(' ').map(n => n[0]).join('').toUpperCase();

  // Determine unread notifications
  const unreadCount = (state.notifications || []).filter(n => !n.is_read).length;

  container.innerHTML = `
    <header class="topbar" id="topbar" style="position: relative;">
      
      <!-- Household Toggle (Phase 8) -->
      ${state.sessionUser ? `
        <div style="margin-right: auto; display: flex; align-items: center; gap: var(--space-2); background: var(--bg-card); padding: 4px var(--space-3); border-radius: var(--radius-full); border: 1px solid var(--border-light); font-size: var(--text-xs); font-weight: 600; cursor: pointer;" id="topbar-household-toggle">
          <span id="household-toggle-label">${state.settings.viewMode === 'household' ? '👪 Household View' : '👤 Personal View'}</span>
          <span style="color: var(--text-tertiary);">▾</span>
        </div>
      ` : ''}

      <div class="topbar-actions">
        <!-- Notifications Bell -->
        <button class="topbar-btn" id="topbar-notifications" title="Notifications">
          ${icons.bell}
          ${unreadCount > 0 ? `<span class="notification-dot" style="position: absolute; top: 6px; right: 6px; width: 8px; height: 8px; background: var(--accent-red); border-radius: 50%; border: 2px solid white;"></span>` : ''}
        </button>

        <!-- Notification Dropdown Panel -->
        <div class="card hidden" id="notification-dropdown-panel" style="position: absolute; top: 58px; right: 64px; z-index: 200; width: 280px; padding: 0; box-shadow: var(--shadow-xl); overflow: hidden; background: var(--bg-card); border: 1px solid var(--border-light);">
          ${renderNotificationDropdownHTML()}
        </div>

        <!-- Theme Toggle -->
        <button class="topbar-btn" id="topbar-theme" title="Toggle theme">
          ${localStorage.getItem('theme') === 'dark' ? icons.sun : icons.moon}
        </button>

        <!-- User Profile Avatar -->
        <div class="topbar-avatar" id="topbar-avatar" title="${profile.name || 'Profile'}" style="position: relative; cursor: pointer;">
          ${initials}
        </div>

        <!-- User Profile Dropdown Panel -->
        <div class="card hidden" id="user-dropdown-panel" style="position: absolute; top: 58px; right: 16px; z-index: 200; width: 220px; padding: var(--space-4); box-shadow: var(--shadow-xl); background: var(--bg-card); border: 1px solid var(--border-light); text-align: left;">
          <div style="border-bottom: 1px solid var(--border-light); padding-bottom: var(--space-3); margin-bottom: var(--space-3);">
            <div style="font-weight: 700; font-size: var(--text-sm); color: var(--green-800);">${profile.name || 'Guest User'}</div>
            <div style="font-size: 10px; color: var(--text-secondary);">${state.sessionUser ? state.sessionUser.email : 'localStorage (Guest Mode)'}</div>
          </div>
          <div style="display: flex; flex-direction: column; gap: var(--space-2); font-size: var(--text-xs); font-weight: 600;">
            <a href="#profile" class="dropdown-user-link" style="color: var(--text-primary); display: block;">My Profile</a>
            <a href="#settings" class="dropdown-user-link" style="color: var(--text-primary); display: block;">Settings</a>
            ${state.sessionUser ? `
              <button id="btn-auth-logout" style="text-align: left; color: var(--accent-red); font-weight: 600; padding: 0; border: none; background: none; font-size: var(--text-xs); width: 100%; cursor: pointer;">Log Out</button>
            ` : `
              <button id="btn-auth-login" style="text-align: left; color: var(--green-700); font-weight: 600; padding: 0; border: none; background: none; font-size: var(--text-xs); width: 100%; cursor: pointer;">Sign Up / Log In</button>
            `}
          </div>
        </div>
      </div>
    </header>
  `;

  // --- Attach Dropdown Toggles --- //
  const notiBtn = document.getElementById('topbar-notifications');
  const notiPanel = document.getElementById('notification-dropdown-panel');
  const avatarBtn = document.getElementById('topbar-avatar');
  const userPanel = document.getElementById('user-dropdown-panel');
  const householdToggle = document.getElementById('topbar-household-toggle');

  const themeBtn = document.getElementById('topbar-theme');

  themeBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Save to local storage
    localStorage.setItem('theme', nextTheme);
    // Apply to html element
    document.documentElement.setAttribute('data-theme', nextTheme);
    
    // Update button icon
    if (themeBtn) {
      themeBtn.innerHTML = nextTheme === 'dark' ? icons.sun : icons.moon;
    }
  });

  notiBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    userPanel?.classList.add('hidden');
    notiPanel?.classList.toggle('hidden');
    if (notiPanel) setupDropdownItemListeners(notiPanel);
  });

  avatarBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    notiPanel?.classList.add('hidden');
    userPanel?.classList.toggle('hidden');
  });

  // Close panels on document clicks
  document.addEventListener('click', () => {
    notiPanel?.classList.add('hidden');
    userPanel?.classList.add('hidden');
  });

  // Household Toggle action (Phase 8)
  householdToggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    const currentMode = state.settings.viewMode || 'personal';
    const nextMode = currentMode === 'household' ? 'personal' : 'household';
    
    setState(s => ({
      ...s,
      settings: { ...s.settings, viewMode: nextMode }
    }));

    // Trigger full screen reload to refresh all widgets
    window.location.reload();
  });

  // Auth operations
  document.getElementById('btn-auth-logout')?.addEventListener('click', async () => {
    await signOutUser();
    setState({ sessionUser: null });
    // Navigate back to onboarding or auth page on logout
    window.location.hash = 'onboarding';
    window.location.reload();
  });

  document.getElementById('btn-auth-login')?.addEventListener('click', () => {
    // Render Auth screen directly in root
    const pageContent = document.getElementById('page-content');
    import('../pages/auth.js').then(auth => {
      auth.renderAuth(pageContent);
    });
  });

  // Click on dropdown links closes panels
  container.querySelectorAll('.dropdown-user-link').forEach(link => {
    link.addEventListener('click', () => {
      userPanel?.classList.add('hidden');
    });
  });
}
