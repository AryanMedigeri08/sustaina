// ═══════════════════════════════════════════
// SUSTAINA — Notification Center Page
// Manage alerts, read/unread status, and preferences
// ═══════════════════════════════════════════

import { getNotifications, markLocalNotificationRead } from '../state/store.js';

export function renderNotifications(container) {
  renderPage(container);
}

function renderPage(container) {
  const notifications = getNotifications();

  container.innerHTML = `
    <div class="page-enter">
      <div class="page-header">
        <div>
          <h1 class="page-title">Notification Center</h1>
          <p class="page-subtitle">Manage your alerts and AI recommendations notifications.</p>
        </div>
        <button class="btn btn-secondary" id="btn-mark-all-read">
          Mark All as Read
        </button>
      </div>

      <div class="grid-2 stagger-1">
        <!-- Notifications List -->
        <div class="card flex flex-col gap-4">
          <h3 class="card-title">Recent Alerts</h3>
          
          <div style="display: flex; flex-direction: column; gap: var(--space-3);" id="notifications-list-container">
            ${notifications.length === 0 ? `
              <div style="text-align: center; padding: var(--space-8) 0; color: var(--text-secondary);">
                You have no notifications yet.
              </div>
            ` : notifications.map(n => `
              <div class="card notification-item-row ${n.is_read ? '' : 'unread'}" 
                   data-id="${n.id}" 
                   style="cursor: pointer; padding: var(--space-4); border: 1px solid var(--border-light); border-left: 4px solid ${n.is_read ? 'var(--border-light)' : 'var(--green-700)'}; background: ${n.is_read ? 'white' : 'var(--green-50)'}; text-align: left;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <span style="font-weight: 700; font-size: var(--text-sm); color: var(--text-primary);">${n.title}</span>
                  <span style="font-size: var(--text-xs); color: var(--text-tertiary);">${formatDate(n.created_at)}</span>
                </div>
                <p style="font-size: var(--text-xs); color: var(--text-secondary); margin-top: 4px; line-height: 1.4;">${n.message}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Preferences Panel -->
        <div class="card flex flex-col gap-6">
          <h3 class="card-title">Notification Preferences</h3>
          
          <div style="display: flex; flex-direction: column; gap: var(--space-4);">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: var(--space-3);">
              <div>
                <label for="noti-pref-digests" class="font-semibold text-sm" style="cursor: pointer; display: block;">Weekly Coach Digests</label>
                <div style="font-size: var(--text-xs); color: var(--text-secondary);">Receive notification when your weekly plan is ready</div>
              </div>
              <label class="toggle" for="noti-pref-digests">
                <input type="checkbox" id="noti-pref-digests" checked aria-label="Weekly Coach Digests" />
                <span class="toggle-track"></span>
                <span class="toggle-thumb"></span>
              </label>
            </div>
 
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: var(--space-3);">
              <div>
                <label for="noti-pref-milestones" class="font-semibold text-sm" style="cursor: pointer; display: block;">Goal Milestones</label>
                <div style="font-size: var(--text-xs); color: var(--text-secondary);">Alert when a sustainability goal or challenge is achieved</div>
              </div>
              <label class="toggle" for="noti-pref-milestones">
                <input type="checkbox" id="noti-pref-milestones" checked aria-label="Goal Milestones" />
                <span class="toggle-track"></span>
                <span class="toggle-thumb"></span>
              </label>
            </div>
 
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: var(--space-3);">
              <div>
                <label for="noti-pref-suggestions" class="font-semibold text-sm" style="cursor: pointer; display: block;">Arya AI Suggestions</label>
                <div style="font-size: var(--text-xs); color: var(--text-secondary);">Receive real-time micro-recommendations from Arya</div>
              </div>
              <label class="toggle" for="noti-pref-suggestions">
                <input type="checkbox" id="noti-pref-suggestions" checked aria-label="Arya AI Suggestions" />
                <span class="toggle-track"></span>
                <span class="toggle-thumb"></span>
              </label>
            </div>
 
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <label for="noti-pref-updates" class="font-semibold text-sm" style="cursor: pointer; display: block;">System Updates</label>
                <div style="font-size: var(--text-xs); color: var(--text-secondary);">Notify about new features and emissions factors updates</div>
              </div>
              <label class="toggle" for="noti-pref-updates">
                <input type="checkbox" id="noti-pref-updates" aria-label="System Updates" />
                <span class="toggle-track"></span>
                <span class="toggle-thumb"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Mark single as read
  container.querySelectorAll('.notification-item-row').forEach(row => {
    row.addEventListener('click', () => {
      const id = row.dataset.id;
      markLocalNotificationRead(id);
      renderPage(container);
    });
  });

  // Mark all as read
  document.getElementById('btn-mark-all-read')?.addEventListener('click', () => {
    notifications.forEach(n => {
      if (!n.is_read) markLocalNotificationRead(n.id);
    });
    renderPage(container);
  });
}

/**
 * Dropdown layout helper for Topbar.
 */
export function renderNotificationDropdownHTML() {
  const notifications = getNotifications().slice(0, 5); // top 5
  if (notifications.length === 0) {
    return `
      <div style="padding: var(--space-4); text-align: center; font-size: var(--text-xs); color: var(--text-secondary);">
        No recent notifications.
      </div>
    `;
  }

  return `
    <div style="display: flex; flex-direction: column; max-height: 320px; overflow-y: auto; text-align: left; width: 280px;">
      <div style="padding: var(--space-2) var(--space-3); font-weight: 700; font-size: var(--text-xs); border-bottom: 1px solid var(--border-light); color: var(--green-800);">RECENT ALERTS</div>
      ${notifications.map(n => `
        <div class="dropdown-noti-item ${n.is_read ? '' : 'unread'}" 
             data-id="${n.id}" 
             style="padding: var(--space-3); border-bottom: 1px solid var(--border-light); background: ${n.is_read ? 'white' : 'var(--green-50)'}; cursor: pointer; transition: background var(--transition-fast);">
          <div style="font-weight: 600; font-size: var(--text-xs); color: var(--text-primary); display: flex; align-items: center; gap: 4px;">
            ${n.is_read ? '' : '<span style="width: 6px; height: 6px; border-radius: 50%; background: var(--green-700); display: inline-block;"></span>'}
            ${n.title}
          </div>
          <div style="font-size: 10px; color: var(--text-secondary); margin-top: 2px; line-height: 1.3;">${n.message.substring(0, 75)}${n.message.length > 75 ? '...' : ''}</div>
        </div>
      `).join('')}
      <a href="#notifications" style="display: block; text-align: center; padding: var(--space-2); font-size: var(--text-xs); color: var(--green-700); font-weight: 600; border-top: 1px solid var(--border-light);">View All Alerts</a>
    </div>
  `;
}

function formatDate(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  } catch (e) {
    return dateStr;
  }
}
export function setupDropdownItemListeners(container) {
  container.querySelectorAll('.dropdown-noti-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const id = item.dataset.id;
      markLocalNotificationRead(id);
      // Close dropdown
      container.classList.add('hidden');
    });
  });
}
