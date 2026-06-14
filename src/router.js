// ═══════════════════════════════════════════
// SUSTAINA — Hash-based SPA Router
// ═══════════════════════════════════════════

/**
 * SPA Router module for handling hash-based navigation.
 */

let currentRoute = 'home';
let renderCallback = null;

const routes = [
  'home', 'activity', 'coach', 'insights', 'carbon-twin',
  'reports', 'goals', 'community', 'profile', 'settings',
  'onboarding', 'purchase-advisor', 'auth', 'timeline', 'simulation-history',
  'notifications', 'analytics'
];

/**
 * Returns the current active route.
 * @returns {string}
 */
export function getCurrentRoute() {
  return currentRoute;
}

/**
 * Navigates to a specific route and updates the URL hash.
 * @param {string} route 
 */
export function navigate(route) {
  if (routes.includes(route)) {
    currentRoute = route;
    window.location.hash = route;
    if (renderCallback) renderCallback(route);
  }
}

/**
 * Initializes the router with a render callback.
 * @param {Function} callback 
 * @returns {string} Initial route
 */
export function initRouter(callback) {
  renderCallback = callback;

  // Parse initial hash
  const hash = window.location.hash.slice(1) || 'home';
  if (routes.includes(hash)) {
    currentRoute = hash;
  } else {
    currentRoute = 'home';
  }

  // Listen for hash changes
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1);
    if (routes.includes(hash) && hash !== currentRoute) {
      currentRoute = hash;
      if (renderCallback) renderCallback(hash);
    }
  });

  return currentRoute;
}

