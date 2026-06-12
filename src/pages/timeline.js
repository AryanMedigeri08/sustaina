// ═══════════════════════════════════════════
// SUSTAINA — Arya Timeline Page
// Chronological narrative tracking user milestones and impact
// ═══════════════════════════════════════════

import { getTimeline } from '../state/store.js';

export function renderTimeline(container) {
  const timelineEvents = getTimeline();

  container.innerHTML = `
    <!-- Custom Timeline CSS -->
    <style>
      .timeline-tree {
        position: relative;
        max-width: 600px;
        margin: var(--space-8) auto;
        padding-left: var(--space-8);
      }
      .timeline-tree::before {
        content: '';
        position: absolute;
        left: 19px;
        top: 0;
        bottom: 0;
        width: 2px;
        background: var(--border-light);
      }
      .timeline-node {
        position: relative;
        margin-bottom: var(--space-8);
      }
      .timeline-node-dot {
        position: absolute;
        left: -40px;
        top: 2px;
        width: 40px;
        height: 40px;
        border-radius: var(--radius-full);
        background: white;
        border: 2px solid var(--green-700);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        z-index: 10;
        box-shadow: var(--shadow-sm);
        transition: transform var(--transition-fast);
      }
      .timeline-node:hover .timeline-node-dot {
        transform: scale(1.1);
      }
      .timeline-node-card {
        background: white;
        border: 1px solid var(--border-light);
        border-radius: var(--radius-lg);
        padding: var(--space-5);
        box-shadow: var(--shadow-card);
        text-align: left;
        transition: box-shadow var(--transition-base);
      }
      .timeline-node-card:hover {
        box-shadow: var(--shadow-card-hover);
      }
      .timeline-node-date {
        font-size: var(--text-xs);
        color: var(--green-700);
        font-weight: 700;
        text-transform: uppercase;
        margin-bottom: var(--space-1);
      }
      .timeline-node-title {
        font-family: var(--font-heading);
        font-size: var(--text-md);
        font-weight: 700;
        color: var(--text-primary);
      }
      .timeline-node-desc {
        font-size: var(--text-sm);
        color: var(--text-secondary);
        margin-top: var(--space-2);
        line-height: var(--leading-relaxed);
      }
    </style>

    <div class="page-enter">
      <div class="page-header">
        <div>
          <h1 class="page-title">Arya Timeline</h1>
          <p class="page-subtitle">Your personalized progress narrative and sustainability milestone diary.</p>
        </div>
      </div>

      ${timelineEvents.length === 0 ? renderEmptyState() : renderTree(timelineEvents)}
    </div>
  `;
}

function renderEmptyState() {
  return `
    <div class="card text-center" style="max-width: 500px; margin: var(--space-12) auto; padding: var(--space-12) 0;">
      <div style="font-size: 56px; margin-bottom: var(--space-4); filter: grayscale(1);">⏳</div>
      <h3 style="font-family: var(--font-heading); font-weight: 700; margin-bottom: var(--space-2);">Your Journey Starts Here</h3>
      <p class="text-xs text-secondary" style="max-width: 340px; margin: 0 auto;">
        As you complete onboarding, run simulations, or evaluate purchase decisions, your milestones will populate this narrative.
      </p>
    </div>
  `;
}

function renderTree(events) {
  // Sort events by date descending
  const sorted = [...events].sort((a, b) => new Date(b.date) - new Date(a.date));

  return `
    <div class="timeline-tree stagger-1">
      ${sorted.map(e => `
        <div class="timeline-node">
          <div class="timeline-node-dot">
            ${e.icon || '🍃'}
          </div>
          <div class="timeline-node-card">
            <div class="timeline-node-date">${formatDate(e.date)}</div>
            <div class="timeline-node-title">${e.title}</div>
            ${e.description ? `<div class="timeline-node-desc">${e.description}</div>` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function formatDate(dateStr) {
  try {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-IN', options);
  } catch (e) {
    return dateStr;
  }
}
