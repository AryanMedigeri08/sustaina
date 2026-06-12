// ═══════════════════════════════════════════
// SUSTAINA — Hash-based SPA Router
// ═══════════════════════════════════════════

let currentRoute = 'home';
let renderCallback = null;

const routes = [
  'home', 'activity', 'coach', 'insights', 'carbon-twin',
  'reports', 'goals', 'community', 'profile', 'settings',
  'onboarding', 'purchase-advisor'
];

export function getCurrentRoute() {
  return currentRoute;
}

export function navigate(route) {
  if (routes.includes(route)) {
    currentRoute = route;
    window.location.hash = route;
    if (renderCallback) renderCallback(route);
  }
}

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
