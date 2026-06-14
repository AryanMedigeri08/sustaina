import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initRouter, navigate, getCurrentRoute } from '../src/router.js';

describe('SPA Hash Router', () => {
  beforeEach(() => {
    // Reset window hash and location
    window.location.hash = '';
  });

  it('initializes to default route (home) if hash is empty', () => {
    const callback = vi.fn();
    const route = initRouter(callback);
    expect(route).toBe('home');
    expect(getCurrentRoute()).toBe('home');
  });

  it('initializes to correct route if hash matches route list', () => {
    window.location.hash = '#settings';
    const callback = vi.fn();
    const route = initRouter(callback);
    expect(route).toBe('settings');
    expect(getCurrentRoute()).toBe('settings');
  });

  it('falls back to default route if hash is invalid', () => {
    window.location.hash = '#invalid_route';
    const callback = vi.fn();
    const route = initRouter(callback);
    expect(route).toBe('home');
    expect(getCurrentRoute()).toBe('home');
  });

  it('navigates to valid routes and invokes callback', () => {
    const callback = vi.fn();
    initRouter(callback);

    navigate('analytics');
    expect(getCurrentRoute()).toBe('analytics');
    expect(window.location.hash).toBe('#analytics');
    expect(callback).toHaveBeenCalledWith('analytics');
  });

  it('ignores navigation to invalid routes', () => {
    const callback = vi.fn();
    initRouter(callback);

    navigate('non_existent_route');
    expect(getCurrentRoute()).toBe('home'); // should stay at default
    expect(callback).not.toHaveBeenCalled();
  });

  it('reacts to window hashchange events', () => {
    const callback = vi.fn();
    initRouter(callback);

    // Manually change hash
    window.location.hash = '#timeline';
    
    // Dispatch hashchange event
    const event = new Event('hashchange');
    window.dispatchEvent(event);

    expect(getCurrentRoute()).toBe('timeline');
    expect(callback).toHaveBeenCalledWith('timeline');
  });
});
