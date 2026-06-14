import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the Supabase service functions
vi.mock('../src/services/supabase.js', () => {
  return {
    getCurrentUser: vi.fn().mockResolvedValue(null),
    fetchProfile: vi.fn().mockResolvedValue(null),
    upsertProfile: vi.fn().mockResolvedValue(null),
    fetchActivities: vi.fn().mockResolvedValue([]),
    insertActivity: vi.fn().mockResolvedValue(null),
    fetchGoals: vi.fn().mockResolvedValue([]),
    insertGoal: vi.fn().mockResolvedValue(null),
    updateGoalProgress: vi.fn().mockResolvedValue(null),
    fetchMemory: vi.fn().mockResolvedValue(null),
    upsertMemory: vi.fn().mockResolvedValue(null),
    fetchTimeline: vi.fn().mockResolvedValue([]),
    insertTimelineEvent: vi.fn().mockResolvedValue(null),
    fetchSimulations: vi.fn().mockResolvedValue([]),
    insertSimulation: vi.fn().mockResolvedValue(null),
    fetchPurchaseHistory: vi.fn().mockResolvedValue([]),
    insertPurchaseHistory: vi.fn().mockResolvedValue(null),
    fetchNotifications: vi.fn().mockResolvedValue([]),
    insertNotification: vi.fn().mockResolvedValue(null),
    markNotificationAsRead: vi.fn().mockResolvedValue(null)
  };
});

// Mock local assets
vi.mock('../src/assets/sustaina_logo.png', () => ({ default: 'logo-mock' }));

import {
  getState,
  setState,
  subscribe,
  getProfile,
  setProfile,
  isOnboardingComplete,
  setOnboardingComplete,
  getActivities,
  addActivity,
  getGoals,
  addGoal,
  updateGoal,
  getAchievements,
  getSettings,
  setSetting,
  getMemory,
  acceptSuggestion,
  ignoreSuggestion,
  completeChallenge,
  getTimeline,
  logTimelineEvent,
  getSimulations,
  addLocalSimulation,
  getPurchases,
  addLocalPurchase,
  getNotifications,
  addLocalNotification,
  markLocalNotificationRead,
  resetState
} from '../src/state/store.js';

describe('LocalState & Sync Store', () => {
  beforeEach(() => {
    resetState();
    vi.clearAllMocks();
  });

  it('provides default state correctly', () => {
    const state = getState();
    expect(state.profile).toBeDefined();
    expect(state.activities).toBeInstanceOf(Array);
    expect(state.goals).toBeInstanceOf(Array);
    expect(state.settings.language).toBe('en');
    expect(isOnboardingComplete()).toBe(false);
  });

  it('updates state via setState and triggers subscribers', () => {
    let triggered = 0;
    const unsubscribe = subscribe((state) => {
      triggered++;
    });

    setState({ onboardingStep: 2 });
    expect(getState().onboardingStep).toBe(2);
    expect(triggered).toBe(1);

    unsubscribe();
    setState({ onboardingStep: 3 });
    expect(triggered).toBe(1); // unsubscribed, so shouldn't increment
  });

  it('manages profile and onboarding status', () => {
    expect(isOnboardingComplete()).toBe(false);
    setOnboardingComplete({ name: 'Test User', city: 'Mumbai' });
    
    expect(isOnboardingComplete()).toBe(true);
    expect(getProfile().name).toBe('Test User');
    expect(getProfile().city).toBe('Mumbai');

    setProfile({ xp: 100 });
    expect(getProfile().xp).toBe(100);
  });

  it('manages activities', () => {
    const initialCount = getActivities().length;
    const newAct = {
      id: 'a123',
      category: 'transport',
      name: 'Cycling',
      detail: '5 km',
      co2: 0,
      cost: 0,
      icon: '🚲',
      time: '12:00 PM',
      date: '2026-06-14'
    };

    addActivity(newAct);
    const activities = getActivities();
    expect(activities.length).toBe(initialCount + 1);
    expect(activities[0].name).toBe('Cycling');
  });

  it('manages goals', () => {
    const initialCount = getGoals().length;
    const newGoal = {
      id: 'g123',
      title: 'Eat Vegan',
      desc: 'Eat vegan meals for 3 days',
      icon: '🥗',
      progress: 0,
      target: '2026-06-20',
      color: 'green',
      bgColor: '#fff',
      is_shared: false
    };

    addGoal(newGoal);
    expect(getGoals().length).toBe(initialCount + 1);
    expect(getGoals()[0].title).toBe('Eat Vegan');

    updateGoal('g123', 50);
    expect(getGoals().find(g => g.id === 'g123').progress).toBe(50);
  });

  it('manages application settings', () => {
    setSetting('language', 'hi');
    expect(getSettings().language).toBe('hi');
  });

  it('manages memory recommendations and challenges', () => {
    acceptSuggestion('Turn off lights');
    expect(getMemory().acceptedSuggestions).toContain('Turn off lights');

    ignoreSuggestion('Eat only raw food');
    expect(getMemory().ignoredSuggestions).toContain('Eat only raw food');

    completeChallenge('challenge_1');
    expect(getMemory().completedChallenges).toContain('challenge_1');
  });

  it('manages timeline progress events', () => {
    const initialCount = getTimeline().length;
    const event = {
      type: 'achievement_unlocked',
      title: 'Eco Warrior',
      description: 'Logged 10 eco-friendly transport events',
      icon: '🏆',
      date: '2026-06-14'
    };

    logTimelineEvent(event);
    expect(getTimeline().length).toBe(initialCount + 1);
    expect(getTimeline()[0].title).toBe('Eco Warrior');
  });

  it('manages simulations', () => {
    const initialCount = getSimulations().length;
    const sim = {
      scenario_name: 'Solar Panel Setup',
      co2_reduction: 1.5,
      money_saved: 4500,
      trees_saved: 75,
      improvement_pct: 12
    };

    addLocalSimulation(sim);
    expect(getSimulations().length).toBe(initialCount + 1);
    expect(getSimulations()[0].scenario_name).toBe('Solar Panel Setup');
  });

  it('manages purchase evaluations', () => {
    const initialCount = getPurchases().length;
    const purchase = {
      product_name: 'LED Bulbs',
      category: 'appliance',
      cost: 500,
      running_cost: 40,
      energy_usage: 10,
      expected_lifetime: 5,
      recommendation: 'Yes',
      explanation: 'Saves energy',
      annual_savings: 200,
      carbon_reduction: 15,
      payback_period: 2.5
    };

    addLocalPurchase(purchase);
    expect(getPurchases().length).toBe(initialCount + 1);
    expect(getPurchases()[0].product_name).toBe('LED Bulbs');
  });

  it('manages notifications', () => {
    const initialCount = getNotifications().length;
    const notification = {
      id: 'n123',
      title: 'Weekly Report Ready',
      message: 'Your weekly report is available.'
    };

    addLocalNotification(notification);
    expect(getNotifications().length).toBe(initialCount + 1);
    expect(getNotifications().find(n => n.id === 'n123').is_read).toBe(false);

    markLocalNotificationRead('n123');
    expect(getNotifications().find(n => n.id === 'n123').is_read).toBe(true);
  });
});
