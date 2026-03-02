import { supabase } from './supabase';

/**
 * Migrate local data from old local user ID to authenticated user ID
 * Updates user_profiles and protocols tables to use the new auth user ID
 */
export async function migrateLocalDataToAuth(localUserId: string, authUserId: string): Promise<void> {
  try {
    // Check if Supabase is enabled
    const SUPABASE_ENABLED = Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    if (!SUPABASE_ENABLED) {
      console.log('Supabase not enabled, skipping migration');
      return;
    }

    // Migrate user profiles
    try {
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', localUserId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 = not found, which is fine
        console.warn('Error fetching local profile:', fetchError.message);
      }

      if (existingProfile) {
        // Delete old local profile and create new one with auth ID
        const { error: deleteError } = await supabase
          .from('user_profiles')
          .delete()
          .eq('id', localUserId);

        if (deleteError) {
          console.warn('Error deleting old profile:', deleteError.message);
        }

        // Insert profile with new auth ID (keeping all other data)
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            ...existingProfile,
            id: authUserId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (insertError) {
          console.warn('Error inserting migrated profile:', insertError.message);
        }
      }
    } catch (e) {
      console.warn('Error during profile migration:', e);
    }

    // Migrate protocols
    try {
      const { data: existingProtocols, error: fetchError } = await supabase
        .from('protocols')
        .select('*')
        .eq('user_id', localUserId);

      if (fetchError) {
        console.warn('Error fetching local protocols:', fetchError.message);
      }

      if (existingProtocols && existingProtocols.length > 0) {
        // Update all protocols to use the new auth user ID
        const { error: updateError } = await supabase
          .from('protocols')
          .update({ user_id: authUserId, updated_at: new Date().toISOString() })
          .eq('user_id', localUserId);

        if (updateError) {
          console.warn('Error updating protocols:', updateError.message);
        }
      }
    } catch (e) {
      console.warn('Error during protocols migration:', e);
    }

    console.log('Data migration completed from', localUserId, 'to', authUserId);
  } catch (e) {
    console.error('Unexpected error during migration:', e);
  }
}

/**
 * Get the effective user ID for API calls
 * Returns auth user ID if authenticated, otherwise returns local ID from localStorage
 */
export function getEffectiveUserId(): string {
  // This is a client-side utility that should be called after checking auth context
  // For server-side, you should use the actual user ID from auth

  if (typeof window === 'undefined') {
    throw new Error('getEffectiveUserId must be called on client side');
  }

  const STORAGE_KEY = 'longevity_user_id';
  let userId = localStorage.getItem(STORAGE_KEY);

  if (!userId) {
    userId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(STORAGE_KEY, userId);
  }

  return userId;
}

/**
 * Initialize a local user ID if it doesn't exist
 * Useful for setting up initial state before auth context is available
 */
export function initializeLocalUserId(): string {
  if (typeof window === 'undefined') {
    return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  const STORAGE_KEY = 'longevity_user_id';
  let userId = localStorage.getItem(STORAGE_KEY);

  if (!userId) {
    userId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(STORAGE_KEY, userId);
  }

  return userId;
}
