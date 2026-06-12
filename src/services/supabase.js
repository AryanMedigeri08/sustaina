// ═══════════════════════════════════════════
// SUSTAINA — Supabase Integration Service
// Handles database sync, authentication, and Guest Mode fallbacks
// ═══════════════════════════════════════════

import { createClient } from '@supabase/supabase-js';

/**
 * Gets a Supabase client instance if configured via environment or Settings.
 */
export function getSupabaseClient() {
  let url = '';
  let key = '';

  // 1. Try reading from Vite environment variables
  try {
    url = import.meta.env.VITE_SUPABASE_URL || '';
    key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  } catch (e) {}

  // 2. Override with settings from localStorage (if configured in UI)
  try {
    const savedState = JSON.parse(localStorage.getItem('sustaina_state') || '{}');
    const settings = savedState.settings || {};
    if (settings.supabaseUrl) url = settings.supabaseUrl;
    if (settings.supabaseAnonKey) key = settings.supabaseAnonKey;
  } catch (e) {}

  if (url && key && url !== 'YOUR_SUPABASE_URL') {
    try {
      return createClient(url, key);
    } catch (e) {
      console.error('Supabase initialization failed:', e);
    }
  }
  return null;
}

export function isSupabaseConfigured() {
  return getSupabaseClient() !== null;
}

// ─── Authentication Helpers ─── //

export async function signUpUser(email, password, name) {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase is not configured.');

  // Create auth account
  const { data, error } = await client.auth.signUp({ email, password });
  if (error) throw error;

  if (data?.user) {
    // Insert corresponding Profile entry
    const { error: profileError } = await client
      .from('profiles')
      .upsert({
        id: data.user.id,
        name: name,
        member_since: new Date().toISOString(),
        xp: 0,
        xp_next: 2000,
        level: 1,
        level_name: 'Just Starting'
      });
    
    if (profileError) {
      console.error('Profile creation failed:', profileError);
    }
  }

  return data;
}

export async function signInUser(email, password) {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase is not configured.');
  
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOutUser() {
  const client = getSupabaseClient();
  if (client) {
    await client.auth.signOut();
  }
}

export async function getCurrentUser() {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data: { user } } = await client.auth.getUser();
  return user;
}

export async function resetUserPassword(email) {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase is not configured.');
  const { data, error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}#settings`,
  });
  if (error) throw error;
  return data;
}

// ─── Database CRUD Helpers ─── //

export async function fetchProfile(userId) {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) {
    console.error('Fetch profile failed:', error);
    return null;
  }
  return data;
}

export async function upsertProfile(userId, profileData) {
  const client = getSupabaseClient();
  if (!client) return null;
  
  // Convert camelCase to snake_case for PostgreSQL
  const dbData = {
    id: userId,
    name: profileData.name,
    city: profileData.city,
    state: profileData.state,
    household_size: profileData.householdSize,
    home_type: profileData.homeType,
    diet: profileData.diet,
    primary_transport: profileData.primaryTransport,
    daily_transport_km: profileData.dailyTransportKm,
    electricity_units: profileData.electricityUnits,
    lpg_cylinders: profileData.lpgCylinders,
    sustainability_goals: profileData.sustainabilityGoals || [],
    xp: profileData.xp,
    xp_next: profileData.xpNext,
    level: profileData.level,
    level_name: profileData.levelName,
    household_id: profileData.householdId || null
  };

  const { data, error } = await client
    .from('profiles')
    .upsert(dbData)
    .select()
    .single();

  if (error) console.error('Upsert profile failed:', error);
  return data;
}

export async function fetchActivities(userId) {
  const client = getSupabaseClient();
  if (!client) return [];
  const { data, error } = await client
    .from('activities')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  if (error) {
    console.error('Fetch activities failed:', error);
    return [];
  }
  return data;
}

export async function insertActivity(userId, act) {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data, error } = await client
    .from('activities')
    .insert({
      user_id: userId,
      category: act.category,
      name: act.name,
      detail: act.detail,
      co2: act.co2,
      cost: act.cost || 0,
      icon: act.icon,
      time: act.time,
      date: act.date || new Date().toISOString().split('T')[0]
    })
    .select()
    .single();
  if (error) console.error('Insert activity failed:', error);
  return data;
}

export async function fetchGoals(userId) {
  const client = getSupabaseClient();
  if (!client) return [];
  const { data, error } = await client
    .from('goals')
    .select('*')
    .eq('user_id', userId);
  if (error) {
    console.error('Fetch goals failed:', error);
    return [];
  }
  return data;
}

export async function insertGoal(userId, goal) {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data, error } = await client
    .from('goals')
    .insert({
      user_id: userId,
      title: goal.title,
      description: goal.desc || goal.description,
      icon: goal.icon,
      progress: goal.progress || 0,
      target_date: goal.target_date || goal.target || '',
      color: goal.color || 'green',
      bg_color: goal.bgColor || '#f0f8ea',
      is_shared: goal.is_shared || false
    })
    .select()
    .single();
  if (error) console.error('Insert goal failed:', error);
  return data;
}

export async function updateGoalProgress(goalId, progress) {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data, error } = await client
    .from('goals')
    .update({ progress })
    .eq('id', goalId)
    .select()
    .single();
  if (error) console.error('Update goal progress failed:', error);
  return data;
}

export async function fetchMemory(userId) {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data, error } = await client
    .from('memory')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error && error.code !== 'PGRST116') { // PGRST116 is single row empty
    console.error('Fetch memory failed:', error);
  }
  return data;
}

export async function upsertMemory(userId, memoryData) {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data, error } = await client
    .from('memory')
    .upsert({
      user_id: userId,
      user_preferences: memoryData.userPreferences || {},
      behavior_patterns: memoryData.behaviorPatterns || {},
      recommendation_success: memoryData.recommendationSuccess || {}
    })
    .select()
    .single();
  if (error) console.error('Upsert memory failed:', error);
  return data;
}

export async function fetchSimulations(userId) {
  const client = getSupabaseClient();
  if (!client) return [];
  const { data, error } = await client
    .from('simulation_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Fetch simulations failed:', error);
    return [];
  }
  return data;
}

export async function insertSimulation(userId, sim) {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data, error } = await client
    .from('simulation_history')
    .insert({
      user_id: userId,
      scenario_name: sim.scenario_name,
      transport_reduce_pct: sim.transport_reduce_pct || 0,
      eco_transit: sim.eco_transit || false,
      diet_val: sim.diet_val,
      elec_reduce_pct: sim.elec_reduce_pct || 0,
      solar: sim.solar || false,
      co2_reduction: sim.co2_reduction,
      money_saved: sim.money_saved,
      trees_saved: sim.trees_saved,
      improvement_pct: sim.improvement_pct
    })
    .select()
    .single();
  if (error) console.error('Insert simulation failed:', error);
  return data;
}

export async function fetchPurchaseHistory(userId) {
  const client = getSupabaseClient();
  if (!client) return [];
  const { data, error } = await client
    .from('purchase_advisor_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Fetch purchase history failed:', error);
    return [];
  }
  return data;
}

export async function insertPurchaseHistory(userId, item) {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data, error } = await client
    .from('purchase_advisor_history')
    .insert({
      user_id: userId,
      product_name: item.product_name,
      category: item.category,
      cost: item.cost,
      running_cost: item.running_cost,
      energy_usage: item.energy_usage,
      expected_lifetime: item.expected_lifetime,
      recommendation: item.recommendation,
      explanation: item.explanation,
      annual_savings: item.annual_savings,
      carbon_reduction: item.carbon_reduction,
      payback_period: item.payback_period
    })
    .select()
    .single();
  if (error) console.error('Insert purchase advice failed:', error);
  return data;
}

export async function fetchReports(userId) {
  const client = getSupabaseClient();
  if (!client) return [];
  const { data, error } = await client
    .from('reports')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Fetch reports failed:', error);
    return [];
  }
  return data;
}

export async function insertReport(userId, rep) {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data, error } = await client
    .from('reports')
    .insert({
      user_id: userId,
      type: rep.type || 'monthly',
      period: rep.period,
      content: rep.content
    })
    .select()
    .single();
  if (error) console.error('Insert report failed:', error);
  return data;
}

export async function fetchNotifications(userId) {
  const client = getSupabaseClient();
  if (!client) return [];
  const { data, error } = await client
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Fetch notifications failed:', error);
    return [];
  }
  return data;
}

export async function insertNotification(userId, n) {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data, error } = await client
    .from('notifications')
    .insert({
      user_id: userId,
      type: n.type,
      title: n.title,
      message: n.message,
      is_read: false
    })
    .select()
    .single();
  if (error) console.error('Insert notification failed:', error);
  return data;
}

export async function markNotificationAsRead(notificationId) {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data, error } = await client
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .select()
    .single();
  if (error) console.error('Mark notification read failed:', error);
  return data;
}

export async function fetchTimeline(userId) {
  const client = getSupabaseClient();
  if (!client) return [];
  const { data, error } = await client
    .from('timeline')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  if (error) {
    console.error('Fetch timeline failed:', error);
    return [];
  }
  return data;
}

export async function insertTimelineEvent(userId, t) {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data, error } = await client
    .from('timeline')
    .insert({
      user_id: userId,
      type: t.type,
      title: t.title,
      description: t.description,
      icon: t.icon,
      date: t.date || new Date().toISOString().split('T')[0]
    })
    .select()
    .single();
  if (error) console.error('Insert timeline event failed:', error);
  return data;
}

// ─── Household Helpers ─── //

export async function createHousehold(name) {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data, error } = await client
    .from('households')
    .insert({ name })
    .select()
    .single();
  if (error) console.error('Create household failed:', error);
  return data;
}

export async function joinHousehold(userId, householdId) {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data, error } = await client
    .from('profiles')
    .update({ household_id: householdId })
    .eq('id', userId)
    .select()
    .single();
  if (error) console.error('Join household failed:', error);
  return data;
}

export async function fetchHouseholdMembers(householdId) {
  const client = getSupabaseClient();
  if (!client) return [];
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('household_id', householdId);
  if (error) {
    console.error('Fetch household members failed:', error);
    return [];
  }
  return data;
}
