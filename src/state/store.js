// ═══════════════════════════════════════════
// SUSTAINA — State Store
// localStorage-backed reactive state with Supabase cloud syncing
// ═══════════════════════════════════════════

import { DEFAULT_PROFILE, MOCK_ACTIVITIES, GOALS_DATA, ACHIEVEMENTS } from '../data/mockData.js';
import { 
  getCurrentUser, 
  fetchProfile, 
  upsertProfile, 
  fetchActivities, 
  insertActivity, 
  fetchGoals, 
  insertGoal, 
  updateGoalProgress, 
  fetchMemory, 
  upsertMemory,
  fetchTimeline,
  insertTimelineEvent,
  fetchSimulations,
  insertSimulation,
  fetchPurchaseHistory,
  insertPurchaseHistory,
  fetchNotifications,
  insertNotification,
  markNotificationAsRead
} from '../services/supabase.js';

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
    supabaseUrl: '',
    supabaseAnonKey: '',
    migrated: false
  },
  onboardingStep: 0,
  onboardingData: {},
  memory: {
    acceptedSuggestions: [],
    ignoredSuggestions: [],
    completedChallenges: []
  },
  timeline: [], // Progress narrative (Phase 3 Timeline)
  simulations: [], // Local cache of simulations
  purchases: [], // Local cache of purchase evaluations
  notifications: [], // Local cache of notifications
  sessionUser: null // Logged in Supabase user (Phase 1)
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
        memory: { ...defaultState.memory, ...(parsed.memory || {}) },
        timeline: parsed.timeline || [],
        settings: { ...defaultState.settings, ...(parsed.settings || {}) }
      };
    }
  } catch (e) {
    console.warn('Failed to load state:', e);
  }
  return { ...defaultState };
}

function saveState() {
  try {
    // Exclude the volatile user session object before saving to localStorage
    const savedCopy = { ...state };
    delete savedCopy.sessionUser;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedCopy));
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

// ─── Cloud Sync & Migration Routines ─── //

export async function initStoreSession() {
  try {
    const user = await getCurrentUser();
    if (user) {
      setState(s => ({ ...s, sessionUser: user }));
      
      // Auto-migration check
      if (!state.settings.migrated) {
        await migrateLocalDataToSupabase(user.id);
        setSetting('migrated', true);
      }
      
      // Load cloud data
      await syncDataFromSupabase(user.id);
    }
  } catch (e) {
    console.warn('Failed to initialize Supabase session:', e);
  }
}

export async function migrateLocalDataToSupabase(userId) {
  try {
    console.log('Starting data migration to Supabase for user:', userId);
    
    // 1. Profile
    await upsertProfile(userId, state.profile);

    // 2. Activities
    const dbActivities = await fetchActivities(userId);
    if (dbActivities.length === 0) {
      for (const act of state.activities) {
        await insertActivity(userId, act);
      }
    }

    // 3. Goals
    const dbGoals = await fetchGoals(userId);
    if (dbGoals.length === 0) {
      for (const goal of state.goals) {
        await insertGoal(userId, goal);
      }
    }

    // 4. Memory
    await upsertMemory(userId, state.memory);

    // 5. Add initial timeline milestone
    await insertTimelineEvent(userId, {
      type: 'onboarding_completed',
      title: 'Profile Created',
      description: 'Onboarding completed and account synchronized to the cloud.',
      icon: '🚀'
    });

    console.log('Migration successfully completed.');
  } catch (e) {
    console.error('Data migration to Supabase failed:', e);
  }
}

export async function syncDataFromSupabase(userId) {
  try {
    const profile = await fetchProfile(userId);
    const activities = await fetchActivities(userId);
    const goals = await fetchGoals(userId);
    const memory = await fetchMemory(userId);
    const timeline = await fetchTimeline(userId);
    const simulations = await fetchSimulations(userId);
    const purchases = await fetchPurchaseHistory(userId);
    const notifications = await fetchNotifications(userId);

    setState(s => {
      const nextState = { ...s };
      if (profile) {
        nextState.profile = {
          name: profile.name || s.profile.name,
          city: profile.city || s.profile.city,
          state: profile.state || s.profile.state,
          householdSize: profile.household_size || s.profile.householdSize,
          homeType: profile.home_type || s.profile.homeType,
          diet: profile.diet || s.profile.diet,
          primaryTransport: profile.primary_transport || s.profile.primaryTransport,
          dailyTransportKm: profile.daily_transport_km ? parseFloat(profile.daily_transport_km) : s.profile.dailyTransportKm,
          electricityUnits: profile.electricity_units ? parseFloat(profile.electricity_units) : s.profile.electricityUnits,
          lpgCylinders: profile.lpg_cylinders ? parseFloat(profile.lpg_cylinders) : s.profile.lpgCylinders,
          sustainabilityGoals: profile.sustainability_goals || s.profile.sustainabilityGoals,
          memberSince: profile.member_since || s.profile.memberSince,
          xp: profile.xp !== undefined ? profile.xp : s.profile.xp,
          xpNext: profile.xp_next || s.profile.xpNext,
          level: profile.level || s.profile.level,
          levelName: profile.level_name || s.profile.levelName,
          householdId: profile.household_id
        };
      }
      if (activities && activities.length > 0) {
        nextState.activities = activities.map(a => ({
          id: a.id,
          category: a.category,
          name: a.name,
          detail: a.detail,
          co2: parseFloat(a.co2),
          cost: parseFloat(a.cost),
          icon: a.icon,
          time: a.time,
          date: a.date
        }));
      }
      if (goals && goals.length > 0) {
        nextState.goals = goals.map(g => ({
          id: g.id,
          title: g.title,
          desc: g.description,
          icon: g.icon,
          progress: g.progress,
          target: g.target_date,
          color: g.color,
          bgColor: g.bg_color,
          is_shared: g.is_shared
        }));
      }
      if (memory) {
        nextState.memory = {
          acceptedSuggestions: memory.user_preferences?.acceptedSuggestions || [],
          ignoredSuggestions: memory.user_preferences?.ignoredSuggestions || [],
          completedChallenges: memory.user_preferences?.completedChallenges || []
        };
      }
      if (timeline) {
        nextState.timeline = timeline;
      }
      if (simulations && simulations.length > 0) {
        nextState.simulations = simulations;
      }
      if (purchases && purchases.length > 0) {
        nextState.purchases = purchases;
      }
      if (notifications && notifications.length > 0) {
        nextState.notifications = notifications;
      }
      return nextState;
    });
  } catch (e) {
    console.error('Failed to sync data from Supabase:', e);
  }
}

// ─── Convenience methods ─── //

export function getProfile() {
  return state.profile;
}

export function setProfile(profile) {
  setState(s => ({ ...s, profile: { ...s.profile, ...profile } }));
  if (state.sessionUser) {
    upsertProfile(state.sessionUser.id, state.profile);
  }
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

  if (state.sessionUser) {
    insertActivity(state.sessionUser.id, activity);
  }
}

export function getGoals() {
  return state.goals;
}

export function addGoal(goal) {
  setState(s => ({
    ...s,
    goals: [goal, ...s.goals]
  }));

  if (state.sessionUser) {
    insertGoal(state.sessionUser.id, goal);
  }
}

export function updateGoal(goalId, progress) {
  setState(s => ({
    ...s,
    goals: s.goals.map(g => g.id === goalId ? { ...g, progress } : g)
  }));

  if (state.sessionUser) {
    updateGoalProgress(goalId, progress);
  }
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

  if (state.sessionUser) {
    upsertMemory(state.sessionUser.id, {
      ...state.memory,
      acceptedSuggestions: [...(state.memory.acceptedSuggestions || []), text]
    });
  }
}

export function ignoreSuggestion(text) {
  setState(s => ({
    ...s,
    memory: {
      ...s.memory,
      ignoredSuggestions: [...(s.memory.ignoredSuggestions || []), text]
    }
  }));

  if (state.sessionUser) {
    upsertMemory(state.sessionUser.id, {
      ...state.memory,
      ignoredSuggestions: [...(state.memory.ignoredSuggestions || []), text]
    });
  }
}

export function completeChallenge(challengeId) {
  setState(s => ({
    ...s,
    memory: {
      ...s.memory,
      completedChallenges: [...(s.memory.completedChallenges || []), challengeId]
    }
  }));

  if (state.sessionUser) {
    upsertMemory(state.sessionUser.id, {
      ...state.memory,
      completedChallenges: [...(state.memory.completedChallenges || []), challengeId]
    });
  }
}

// ─── Timeline Methods ─── //

export function getTimeline() {
  return state.timeline;
}

export function logTimelineEvent(event) {
  const newEvent = {
    ...event,
    date: event.date || new Date().toISOString().split('T')[0]
  };

  setState(s => ({
    ...s,
    timeline: [newEvent, ...s.timeline]
  }));

  if (state.sessionUser) {
    insertTimelineEvent(state.sessionUser.id, newEvent);
  }
}

export function getSimulations() {
  return state.simulations || [];
}

export function addLocalSimulation(sim) {
  const newSim = {
    id: sim.id || 's_' + Date.now(),
    created_at: new Date().toISOString(),
    ...sim
  };
  setState(s => ({
    ...s,
    simulations: [newSim, ...(s.simulations || [])]
  }));
  
  if (state.sessionUser) {
    insertSimulation(state.sessionUser.id, newSim);
  }
}

export function getPurchases() {
  return state.purchases || [];
}

export function addLocalPurchase(item) {
  const newItem = {
    id: item.id || 'p_' + Date.now(),
    created_at: new Date().toISOString(),
    ...item
  };
  setState(s => ({
    ...s,
    purchases: [newItem, ...(s.purchases || [])]
  }));

  if (state.sessionUser) {
    insertPurchaseHistory(state.sessionUser.id, newItem);
  }
}

export function getNotifications() {
  return state.notifications || [];
}

export function addLocalNotification(n) {
  const newN = {
    id: n.id || 'n_' + Date.now(),
    created_at: new Date().toISOString(),
    is_read: false,
    ...n
  };
  setState(s => ({
    ...s,
    notifications: [newN, ...(s.notifications || [])]
  }));

  if (state.sessionUser) {
    insertNotification(state.sessionUser.id, newN);
  }
}

export function markLocalNotificationRead(id) {
  setState(s => ({
    ...s,
    notifications: s.notifications.map(n => n.id === id ? { ...n, is_read: true } : n)
  }));

  if (state.sessionUser) {
    markNotificationAsRead(id);
  }
}

// Reset state for demo
export function resetState() {
  localStorage.removeItem(STORAGE_KEY);
  state = { ...defaultState };
  notifyListeners();
}
