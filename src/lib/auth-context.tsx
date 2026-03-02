'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { supabase } from './supabase';
import { migrateLocalDataToAuth } from './auth-helpers';
import type { User, Session } from '@supabase/supabase-js';

interface AuthError {
  message: string;
  code?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  authError: AuthError | null;
  clearError: () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<AuthError | null>(null);

  const clearError = useCallback(() => setAuthError(null), []);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();

        if (error) {
          console.warn('Failed to get session:', error.message);
          setLoading(false);
          return;
        }

        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);

          // Migrate local data to authenticated user
          if (typeof window !== 'undefined') {
            const localUserId = localStorage.getItem('longevity_user_id');
            if (localUserId && localUserId.startsWith('local_')) {
              await migrateLocalDataToAuth(localUserId, currentSession.user.id);
              // Update the stored user ID to auth user ID
              localStorage.setItem('longevity_user_id', currentSession.user.id);
            }
          }
        }

        setLoading(false);
      } catch (e) {
        console.error('Error initializing auth:', e);
        setLoading(false);
      }
    };

    initializeAuth();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setSession(session);
          setUser(session.user);

          // Migrate local data when user authenticates
          if (event === 'SIGNED_IN' && typeof window !== 'undefined') {
            const localUserId = localStorage.getItem('longevity_user_id');
            if (localUserId && localUserId.startsWith('local_')) {
              await migrateLocalDataToAuth(localUserId, session.user.id);
              // Update the stored user ID to auth user ID
              localStorage.setItem('longevity_user_id', session.user.id);
            }
          }
        } else {
          setSession(null);
          setUser(null);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin + '/auth/callback' : undefined,
        },
      });

      if (error) {
        console.error('Google sign-in error:', error.message);
        throw error;
      }
    } catch (e) {
      console.error('Error signing in with Google:', e);
      throw e;
    }
  }, []);

  const signInWithApple = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin + '/auth/callback' : undefined,
        },
      });

      if (error) {
        console.error('Apple sign-in error:', error.message);
        throw error;
      }
    } catch (e) {
      console.error('Error signing in with Apple:', e);
      throw e;
    }
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    try {
      setAuthError(null);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? window.location.origin + '/auth/callback?next=/dashboard' : undefined,
        },
      });

      if (error) {
        setAuthError({ message: error.message, code: error.code });
        throw error;
      }
    } catch (e: any) {
      if (!authError) {
        setAuthError({ message: e?.message || 'Sign-up failed' });
      }
      throw e;
    }
  }, [authError]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    try {
      setAuthError(null);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthError({ message: error.message, code: error.code });
        throw error;
      }
    } catch (e: any) {
      if (!authError) {
        setAuthError({ message: e?.message || 'Sign-in failed' });
      }
      throw e;
    }
  }, [authError]);

  const resetPassword = useCallback(async (email: string) => {
    try {
      setAuthError(null);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== 'undefined' ? window.location.origin + '/auth/callback?next=/reset-password' : undefined,
      });

      if (error) {
        setAuthError({ message: error.message, code: error.code });
        throw error;
      }
    } catch (e: any) {
      if (!authError) {
        setAuthError({ message: e?.message || 'Password reset failed' });
      }
      throw e;
    }
  }, [authError]);

  const signOut = useCallback(async () => {
    try {
      // Clear auth-specific data
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Sign-out error:', error.message);
        throw error;
      }

      // Clear localStorage keys
      if (typeof window !== 'undefined') {
        localStorage.removeItem('longevity_profile');
        localStorage.removeItem('longevity_protocols');
        localStorage.removeItem('longevity_selected_compounds');
        localStorage.removeItem('longevity_user_id');
      }

      setSession(null);
      setUser(null);
    } catch (e) {
      console.error('Error signing out:', e);
      throw e;
    }
  }, []);

  const isAuthenticated = !!user && !!session;

  const value: AuthContextType = {
    user,
    session,
    loading,
    isAuthenticated,
    authError,
    clearError,
    signInWithGoogle,
    signInWithApple,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
