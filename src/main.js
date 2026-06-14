// ═══════════════════════════════════════════
// SUSTAINA — Main Entry Point
// ═══════════════════════════════════════════

/**
 * Main application controller and initialization.
 */

import './index.css';
import { initRouter, navigate } from './router.js';
import { renderSidebar } from './components/sidebar.js';
import { renderTopbar } from './components/topbar.js';
import { isOnboardingComplete, resetState, initStoreSession } from './state/store.js';
import { destroyAllCharts } from './components/charts.js';

// Page modules
import { renderDashboard } from './pages/dashboard.js';
import { renderActivityLog } from './pages/activityLog.js';
import { renderAryaCoach } from './pages/aryaCoach.js';
import { renderInsights } from './pages/insights.js';
import { renderCarbonTwin } from './pages/carbonTwin.js';
import { renderReports } from './pages/reports.js';
import { renderGoals } from './pages/goals.js';
import { renderCommunity } from './pages/community.js';
import { renderProfile } from './pages/profile.js';
import { renderSettings } from './pages/settings.js';
import { renderOnboarding } from './pages/onboarding.js';
import { renderSmartPurchaseAdvisor } from './pages/smartPurchaseAdvisor.js';
import { renderAuth } from './pages/auth.js';
import { renderTimeline } from './pages/timeline.js';
import { renderSimulationHistory } from './pages/simulationHistory.js';
import { renderNotifications } from './pages/notifications.js';
import { renderAnalytics } from './pages/analytics.js';

const pageRenderers = {
  'home': renderDashboard,
  'activity': renderActivityLog,
  'coach': renderAryaCoach,
  'insights': renderInsights,
  'carbon-twin': renderCarbonTwin,
  'reports': renderReports,
  'goals': renderGoals,
  'community': renderCommunity,
  'profile': renderProfile,
  'settings': renderSettings,
  'onboarding': renderOnboarding,
  'purchase-advisor': renderSmartPurchaseAdvisor,
  'auth': renderAuth,
  'timeline': renderTimeline,
  'simulation-history': renderSimulationHistory,
  'notifications': renderNotifications,
  'analytics': renderAnalytics,
};

/**
 * Renders the page for a given route.
 * @param {string} route 
 */
export function renderPage(route) {
  const sidebarContainer = document.getElementById('sidebar-container');
  const topbarContainer = document.getElementById('topbar-container');
  const pageContent = document.getElementById('page-content');

  // Clean up resources
  destroyAllCharts();

  if (route === 'onboarding') {
    renderOnboarding(pageContent);
    return;
  }

  // Render shell
  renderSidebar(sidebarContainer);
  renderTopbar(topbarContainer);

  // Render content
  const renderer = pageRenderers[route];
  if (renderer) {
    renderer(pageContent);
  } else {
    pageContent.innerHTML = '<div class="page-enter"><h1>Page not found</h1></div>';
  }
}

// ─── App Init ─── //
let initialized = false;

/**
 * Initializes the application state, theme, and router.
 */
async function init() {
  if (initialized) return;
  initialized = true;

  // Theme
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  // Params
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('reset')) {
    resetState();
    window.history.replaceState({}, '', window.location.pathname + '#onboarding');
  }

  // Session
  await initStoreSession();

  // Router
  const hash = window.location.hash.slice(1);
  if (hash === 'onboarding' || !isOnboardingComplete()) {
    window.location.hash = 'onboarding';
    initRouter(renderPage);
    renderPage('onboarding');
  } else {
    const initialRoute = initRouter(renderPage);
    renderPage(initialRoute);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

