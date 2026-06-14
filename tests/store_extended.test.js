import { describe, it, expect, beforeEach } from 'vitest';
import { 
  getState, 
  setState, 
  getProfile, 
  setProfile, 
  getActivities, 
  addActivity 
} from '../src/state/store.js';

describe('Global Store & State Management', () => {
  beforeEach(() => {
    // Reset state to a known baseline before each test
    // Note: Since store.js uses a local variable 'state', we rely on its internal reset if available 
    // or manually patch it for tests.
    setState({
      sessionUser: null,
      profile: {
        name: 'Aryan Medigeri',
        city: 'Pune',
        state: 'Maharashtra',
        householdSize: 4,
        primaryTransport: 'bike',
        diet: 'vegetarian',
        electricityUnits: 280,
      },
      activities: [],
      notifications: [],
      settings: {
        theme: 'light',
        viewMode: 'personal',
      }
    });
  });

  it('initializes with default values', () => {
    const state = getState();
    expect(state.profile.name).toBe('Aryan Medigeri');
    expect(state.activities).toEqual([]);
  });

  it('updates state correctly via setState', () => {
    setState({ sessionUser: { email: 'test@example.com' } });
    expect(getState().sessionUser.email).toBe('test@example.com');
  });

  it('updates profile correctly via setProfile', () => {
    setProfile({ city: 'Mumbai' });
    expect(getProfile().city).toBe('Mumbai');
    expect(getProfile().name).toBe('Aryan Medigeri'); // Preserves other fields
  });

  it('adds activities and maintains history', () => {
    const activity = {
      id: '1',
      category: 'transport',
      name: 'Office Commute',
      co2: 2.5
    };
    addActivity(activity);
    const activities = getActivities();
    expect(activities).toHaveLength(1);
    expect(activities[0].name).toBe('Office Commute');
  });

  it('handles partial updates to complex nested settings', () => {
    setState(s => ({
      ...s,
      settings: { ...s.settings, theme: 'dark' }
    }));
    expect(getState().settings.theme).toBe('dark');
    expect(getState().settings.viewMode).toBe('personal');
  });
});
