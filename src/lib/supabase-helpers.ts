import { supabase, DbUserProfile, DbProtocol } from './supabase';
import { UserProfile } from '@/types';

const SUPABASE_ENABLED = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * Get a unique identifier for the user (local ID from localStorage if not authenticated)
 */
function getUserId(): string {
  const STORAGE_KEY = 'longevity_user_id';
  let userId = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;

  if (!userId) {
    userId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, userId);
    }
  }

  return userId;
}

/**
 * Convert UserProfile to DbUserProfile format
 */
function profileToDb(profile: UserProfile, userId: string): Omit<DbUserProfile, 'created_at' | 'updated_at'> {
  return {
    id: userId,
    goals: profile.goals || [],
    age: profile.age,
    weight: profile.weight,
    sex: profile.sex,
    activity_level: profile.activityLevel,
    has_glass_blender: profile.hasGlassBlender,
    has_red_light: profile.hasRedLight,
    current_supplements: profile.currentSupplements,
    monthly_budget: profile.monthlyBudget,
    onboarding_complete: true,
  };
}

/**
 * Convert DbUserProfile to UserProfile format
 */
function profileFromDb(db: DbUserProfile): UserProfile {
  return {
    goals: db.goals || [],
    age: db.age,
    weight: db.weight,
    sex: db.sex as 'male' | 'female' | undefined,
    activityLevel: db.activity_level as any,
    hasGlassBlender: db.has_glass_blender,
    hasRedLight: db.has_red_light,
    currentSupplements: db.current_supplements,
    monthlyBudget: db.monthly_budget,
  };
}

/**
 * Save user profile to Supabase (with localStorage fallback)
 */
export async function saveUserProfile(profile: UserProfile): Promise<boolean> {
  const userId = getUserId();

  // Always save to localStorage first (primary persistence)
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('longevity_profile', JSON.stringify(profile));
    }
  } catch (e) {
    console.warn('Failed to save profile to localStorage:', e);
  }

  // Try to sync to Supabase if available
  if (!SUPABASE_ENABLED) {
    return true; // Success with localStorage fallback
  }

  try {
    const dbProfile = profileToDb(profile, userId);

    const { error } = await supabase.from('user_profiles').upsert(
      {
        ...dbProfile,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    if (error) {
      console.warn('Failed to save profile to Supabase:', error.message);
      return false;
    }

    return true;
  } catch (e) {
    console.warn('Error saving profile to Supabase:', e);
    return false;
  }
}

/**
 * Load user profile from localStorage or Supabase
 */
export async function loadUserProfile(): Promise<UserProfile | null> {
  // Check localStorage first (primary source)
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem('longevity_profile');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.warn('Failed to parse cached profile:', e);
      }
    }
  }

  // Try to load from Supabase if available
  if (!SUPABASE_ENABLED) {
    return null;
  }

  try {
    const userId = getUserId();
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') {
        // PGRST116 = not found, which is expected for new users
        console.warn('Failed to load profile from Supabase:', error.message);
      }
      return null;
    }

    if (data) {
      const profile = profileFromDb(data);
      // Cache in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('longevity_profile', JSON.stringify(profile));
      }
      return profile;
    }

    return null;
  } catch (e) {
    console.warn('Error loading profile from Supabase:', e);
    return null;
  }
}

/**
 * Save a protocol to Supabase (with localStorage fallback)
 */
export async function saveProtocol(
  name: string,
  compoundIds: number[],
  costs: { daily: number; monthly: number },
  score: number
): Promise<string | null> {
  const userId = getUserId();
  const now = new Date().toISOString();
  const id = `protocol_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const protocol = {
    id,
    name,
    compoundIds,
    totalDailyCost: costs.daily,
    totalMonthlyCost: costs.monthly,
    longevityScore: score,
    createdAt: now,
    userId,
  };

  // Always save to localStorage first
  try {
    if (typeof window !== 'undefined') {
      const existing = localStorage.getItem('longevity_protocols');
      const protocols = existing ? JSON.parse(existing) : [];
      protocols.push(protocol);
      localStorage.setItem('longevity_protocols', JSON.stringify(protocols));
    }
  } catch (e) {
    console.warn('Failed to save protocol to localStorage:', e);
  }

  // Try to sync to Supabase if available
  if (!SUPABASE_ENABLED) {
    return id; // Return local ID on localStorage-only success
  }

  try {
    const { error } = await supabase.from('protocols').insert({
      id,
      user_id: userId,
      name,
      compound_ids: compoundIds,
      total_daily_cost: costs.daily,
      total_monthly_cost: costs.monthly,
      longevity_score: score,
      created_at: now,
      updated_at: now,
    });

    if (error) {
      console.warn('Failed to save protocol to Supabase:', error.message);
      return id; // Still return ID even if cloud sync failed
    }

    return id;
  } catch (e) {
    console.warn('Error saving protocol to Supabase:', e);
    return id;
  }
}

/**
 * Load saved protocols from localStorage or Supabase
 */
export async function loadProtocols(): Promise<
  Array<{
    id: string;
    name: string;
    compoundIds: number[];
    totalDailyCost: number;
    totalMonthlyCost: number;
    longevityScore: number;
    createdAt: string;
  }>
> {
  // Check localStorage first
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem('longevity_protocols');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.warn('Failed to parse cached protocols:', e);
      }
    }
  }

  // Try to load from Supabase if available
  if (!SUPABASE_ENABLED) {
    return [];
  }

  try {
    const userId = getUserId();
    const { data, error } = await supabase
      .from('protocols')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Failed to load protocols from Supabase:', error.message);
      return [];
    }

    const protocols = (data || []).map(p => ({
      id: p.id,
      name: p.name,
      compoundIds: p.compound_ids,
      totalDailyCost: p.total_daily_cost,
      totalMonthlyCost: p.total_monthly_cost,
      longevityScore: p.longevity_score,
      createdAt: p.created_at,
    }));

    // Update localStorage cache
    if (typeof window !== 'undefined') {
      localStorage.setItem('longevity_protocols', JSON.stringify(protocols));
    }

    return protocols;
  } catch (e) {
    console.warn('Error loading protocols from Supabase:', e);
    return [];
  }
}

/**
 * Delete a protocol from localStorage and Supabase
 */
export async function deleteProtocol(id: string): Promise<boolean> {
  // Remove from localStorage first
  try {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('longevity_protocols');
      if (cached) {
        const protocols = JSON.parse(cached).filter((p: any) => p.id !== id);
        localStorage.setItem('longevity_protocols', JSON.stringify(protocols));
      }
    }
  } catch (e) {
    console.warn('Failed to remove protocol from localStorage:', e);
  }

  // Try to remove from Supabase if available
  if (!SUPABASE_ENABLED) {
    return true;
  }

  try {
    const { error } = await supabase.from('protocols').delete().eq('id', id);

    if (error) {
      console.warn('Failed to delete protocol from Supabase:', error.message);
      return false;
    }

    return true;
  } catch (e) {
    console.warn('Error deleting protocol from Supabase:', e);
    return false;
  }
}
