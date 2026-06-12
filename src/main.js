// ═══════════════════════════════════════════
// SUSTAINA — Main Entry Point
// ═══════════════════════════════════════════

import './index.css';
import { initRouter, navigate } from './router.js';
import { renderSidebar } from './components/sidebar.js';
import { renderTopbar } from './components/topbar.js';
import { isOnboardingComplete, resetState } from './state/store.js';
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
};

function renderPage(route) {
  const sidebarContainer = document.getElementById('sidebar-container');
  const topbarContainer = document.getElementById('topbar-container');
  const pageContent = document.getElementById('page-content');

  // Clean up charts
  destroyAllCharts();

  if (route === 'onboarding') {
    // Onboarding handles its own layout
    renderOnboarding(pageContent);
    return;
  }

  // Render shell components
  renderSidebar(sidebarContainer);
  renderTopbar(topbarContainer);

  // Render page
  const renderer = pageRenderers[route];
  if (renderer) {
    renderer(pageContent);
  } else {
    pageContent.innerHTML = '<div class="page-enter"><h1>Page not found</h1></div>';
  }
}

// ─── App Init ─── //
let initialized = false;

function init() {
  if (initialized) return;
  initialized = true;

  // Handle ?reset URL param — clears localStorage and restarts
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('reset')) {
    resetState();
    // Remove the ?reset param from URL cleanly
    window.history.replaceState({}, '', window.location.pathname + '#onboarding');
  }

  // If user explicitly navigated to #onboarding, always show it
  const hash = window.location.hash.slice(1);
  if (hash === 'onboarding') {
    const initialRoute = initRouter(renderPage);
    renderPage('onboarding');
    return;
  }

  // Check if onboarding is needed (first-time user)
  if (!isOnboardingComplete()) {
    window.location.hash = 'onboarding';
    const initialRoute = initRouter(renderPage);
    renderPage('onboarding');
    return;
  }

  // Normal app flow
  const initialRoute = initRouter(renderPage);
  renderPage(initialRoute);
}

// Start the app — use a single entry point
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
