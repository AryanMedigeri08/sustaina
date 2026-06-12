// ═══════════════════════════════════════════
// SUSTAINA — State Store
// localStorage-backed reactive state management
// ═══════════════════════════════════════════

import { DEFAULT_PROFILE, MOCK_ACTIVITIES, GOALS_DATA, ACHIEVEMENTS } from '../data/mockData.js';

const STORAGE_KEY = 'sustaina_state';

const defaultState = {
  profile: { ...DEFAULT_PROFILE },
  activities: [...MOCK_ACTIVITIES],
  goals: [...GOALS_DATA],
  achievements: [...ACHIEVEMENTS],
  settings: {
    language: 'en',
    notifications: true,
    emailNotifications: true,
    weeklyReport: true,
    darkMode: false,
  },
  onboardingStep: 0,
  onboardingData: {},
  memory: {
    acceptedSuggestions: [],
    ignoredSuggestions: [],
    completedChallenges: []
  }
};

let state = loadState();
const listeners = new Set();

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { 
        ...defaultState, 
        ...parsed,
        memory: { ...defaultState.memory, ...(parsed.memory || {}) }
      };
    }
  } catch (e) {
    console.warn('Failed to load state:', e);
  }
  return { ...defaultState };
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save state:', e);
  }
}

export function getState() {
  return state;
}

export function setState(updater) {
  if (typeof updater === 'function') {
    state = updater(state);
  } else {
    state = { ...state, ...updater };
  }
  saveState();
  notifyListeners();
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notifyListeners() {
  listeners.forEach(fn => fn(state));
}

// ─── Convenience methods ─── //

export function getProfile() {
  return state.profile;
}

export function setProfile(profile) {
  setState(s => ({ ...s, profile: { ...s.profile, ...profile } }));
}

export function isOnboardingComplete() {
  return state.profile.onboardingCompleted === true;
}

export function setOnboardingComplete(profileData) {
  setState(s => ({
    ...s,
    profile: { ...s.profile, ...profileData, onboardingCompleted: true },
  }));
}

export function getActivities() {
  return state.activities;
}

export function addActivity(activity) {
  setState(s => ({
    ...s,
    activities: [activity, ...s.activities],
  }));
}

export function getGoals() {
  return state.goals;
}

export function getAchievements() {
  return state.achievements;
}

export function getSettings() {
  return state.settings;
}

export function setSetting(key, value) {
  setState(s => ({
    ...s,
    settings: { ...s.settings, [key]: value },
  }));
}

export function getMemory() {
  return state.memory;
}

export function acceptSuggestion(text) {
  setState(s => ({
    ...s,
    memory: {
      ...s.memory,
      acceptedSuggestions: [...(s.memory.acceptedSuggestions || []), text]
    }
  }));
}

export function ignoreSuggestion(text) {
  setState(s => ({
    ...s,
    memory: {
      ...s.memory,
      ignoredSuggestions: [...(s.memory.ignoredSuggestions || []), text]
    }
  }));
}

export function completeChallenge(challengeId) {
  setState(s => ({
    ...s,
    memory: {
      ...s.memory,
      completedChallenges: [...(s.memory.completedChallenges || []), challengeId]
    }
  }));
}

// Reset state for demo
export function resetState() {
  localStorage.removeItem(STORAGE_KEY);
  state = { ...defaultState };
  notifyListeners();
}
