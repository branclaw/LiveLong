'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { UserProfile } from '@/types';
import { saveUserProfile, loadUserProfile } from './supabase-helpers';

interface OnboardingContextType {
  profile: UserProfile;
  currentStep: number;
  isComplete: boolean;
  isReturningUser: boolean;
  updateProfile: (partial: Partial<UserProfile>) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  completeOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>({
    goals: [],
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [isComplete, setIsComplete] = useState(false);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load profile on mount
  useEffect(() => {
    const initializeProfile = async () => {
      const savedProfile = await loadUserProfile();
      if (savedProfile) {
        setProfile(savedProfile);
        setIsComplete(true);
        setIsReturningUser(true);
      }
      setIsHydrated(true);
    };

    initializeProfile();
  }, []);

  const updateProfile = useCallback((partial: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...partial }));
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep(prev => {
      const newStep = Math.min(prev + 1, 5);
      if (newStep === 5) {
        // Auto-complete on final step
        setIsComplete(true);
      }
      return newStep;
    });
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(Math.max(1, Math.min(step, 5)));
  }, []);

  const completeOnboarding = useCallback(() => {
    setIsComplete(true);
    // Save profile to localStorage and attempt Supabase sync
    saveUserProfile(profile).catch(err => {
      console.error('Failed to save profile:', err);
    });
  }, [profile]);

  // Only render after hydration to avoid SSR mismatch
  const value: OnboardingContextType = {
    profile,
    currentStep,
    isComplete,
    isReturningUser,
    updateProfile,
    nextStep,
    prevStep,
    goToStep,
    completeOnboarding,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {isHydrated ? children : null}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}
