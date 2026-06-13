// ═══════════════════════════════════════════
// SUSTAINA — Activity Log Page
// ═══════════════════════════════════════════

import { getActivities, addActivity } from '../state/store.js';
import { icons } from '../components/icons.js';

const CATEGORIES = ['All', 'Transport', 'Food', 'Home Energy', 'Shopping', 'Waste'];
const CATEGORY_MAP = { 'All': 'all', 'Transport': 'transport', 'Food': 'food', 'Home Energy': 'energy', 'Shopping': 'shopping', 'Waste': 'waste' };

const QUICK_ADD = [
  { icon: '🚗', label: 'Car', category: 'transport' },
  { icon: '🏍️', label: 'Bike', category: 'transport' },
  { icon: '🚌', label: 'Bus', category: 'transport' },
  { icon: '🚇', label: 'Metro', category: 'transport' },
  { icon: '🚂', label: 'Train', category: 'transport' },
  { icon: '🚶', label: 'Walk / Cycle', category: 'transport' },
];

let activeCategory = 'all';

export function renderActivityLog(container) {
  const activities = getActivities();
  const filtered = activeCategory === 'all' ? activities : activities.filter(a => a.category === activeCategory);

  container.innerHTML = `
    <div class="page-enter">
      <div class="page-header">
        <div>
          <h1 class="page-title">Activity Log</h1>
          <p class="page-subtitle">Track your daily activities and understand your impact.</p>
        </div>
        <button class="btn btn-primary" id="add-activity-btn">
          ${icons.plus} Add Activity
        </button>
      </div>

      <!-- Category Tabs -->
      <div class="tabs-underline mb-6">
        ${CATEGORIES.map(cat => `
          <button class="tab-underline ${CATEGORY_MAP[cat] === activeCategory ? 'active' : ''}" 
                  data-category="${CATEGORY_MAP[cat]}">${cat}</button>
        `).join('')}
      </div>

      <!-- Quick Add -->
      <div class="card mb-6 stagger-1">
        <h3 class="card-title mb-4">Quick Add</h3>
        <div class="quick-add-grid">
          ${QUICK_ADD.map(item => `
            <div class="quick-add-item" data-quick="${item.label}">
              <span class="quick-add-icon" style="display: flex; align-items: center; justify-content: center; color: var(--green-700);">${icons.transport}</span>
              <span class="quick-add-label">${item.label}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Recent Activities -->
      <div class="card stagger-2">
        <h3 class="card-title mb-4">Recent Activities</h3>
        <div id="activities-list">
          ${filtered.map(activity => `
            <div class="activity-item">
              <div class="activity-icon ${activity.category}">
                ${icons[activity.category] || icons.reports}
              </div>
              <div class="activity-info">
                <div class="activity-name">${activity.name}</div>
                <div class="activity-detail">${activity.detail}</div>
              </div>
              <div class="activity-co2">
                <div class="activity-co2-value">${activity.co2} kg CO₂e</div>
              </div>
              <div class="activity-time">${activity.time}</div>
            </div>
          `).join('')}
        </div>

        <button class="btn btn-ghost w-full mt-4" id="view-all-activities">
          View All Activities
        </button>
      </div>
    </div>
  `;

  // Tab click handlers
  container.querySelectorAll('.tab-underline').forEach(tab => {
    tab.addEventListener('click', () => {
      activeCategory = tab.dataset.category;
      renderActivityLog(container);
    });
  });

  // Quick add click handlers
  container.querySelectorAll('.quick-add-item').forEach(item => {
    item.addEventListener('click', () => {
      showAddActivityModal(container, item.dataset.quick);
    });
  });

  // Add activity button
  document.getElementById('add-activity-btn')?.addEventListener('click', () => {
    showAddActivityModal(container);
  });
}

function showAddActivityModal(pageContainer, prefill = '') {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.remove('hidden');
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">Add Activity</h3>
        <button class="modal-close" id="modal-close">${icons.close}</button>
      </div>
      <div style="display: flex; flex-direction: column; gap: var(--space-4);">
        <div>
          <label class="text-sm font-semibold mb-2" style="display: block;">Category</label>
          <select id="modal-category">
            <option value="transport">Transport</option>
            <option value="food">Food</option>
            <option value="energy">Home Energy</option>
            <option value="shopping">Shopping</option>
            <option value="waste">Waste</option>
          </select>
        </div>
        <div>
          <label class="text-sm font-semibold mb-2" style="display: block;">Activity Name</label>
          <input type="text" id="modal-name" placeholder="e.g., Bike ride to office" value="${prefill}" />
        </div>
        <div>
          <label class="text-sm font-semibold mb-2" style="display: block;">Distance / Quantity</label>
          <input type="number" id="modal-quantity" placeholder="e.g., 15 km" />
        </div>
        <div>
          <label class="text-sm font-semibold mb-2" style="display: block;">Notes</label>
          <input type="text" id="modal-notes" placeholder="Optional details" />
        </div>
        <button class="btn btn-primary btn-lg" id="modal-save">Log Activity</button>
      </div>
    </div>
  `;

  document.getElementById('modal-close').addEventListener('click', () => {
    overlay.classList.add('hidden');
    overlay.innerHTML = '';
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.add('hidden');
      overlay.innerHTML = '';
    }
  });

  document.getElementById('modal-save').addEventListener('click', () => {
    const name = document.getElementById('modal-name').value || 'Activity';
    const category = document.getElementById('modal-category').value;
    const quantity = document.getElementById('modal-quantity').value || 0;
    const notes = document.getElementById('modal-notes').value;

    const categoryIcons = { transport: '🚗', food: '🍽️', energy: '⚡', shopping: '🛍️', waste: '♻️' };
    
    addActivity({
      id: 'a' + Date.now(),
      category,
      name,
      detail: notes || `${quantity} km`,
      co2: parseFloat((Math.random() * 5 + 0.5).toFixed(2)),
      cost: 0,
      icon: categoryIcons[category] || '📋',
      time: 'Just now',
      date: new Date().toISOString().split('T')[0],
    });

    overlay.classList.add('hidden');
    overlay.innerHTML = '';
    renderActivityLog(pageContainer);
  });
}
