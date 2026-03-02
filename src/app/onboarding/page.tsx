'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingProvider, useOnboarding } from '@/lib/onboarding-context';
import { StepProgress } from '@/components/OnboardingSteps/StepProgress';
import { Step1Goals } from '@/components/OnboardingSteps/Step1Goals';
import { Step2Bio } from '@/components/OnboardingSteps/Step2Bio';
import { Step3Hardware } from '@/components/OnboardingSteps/Step3Hardware';
import { Step4Labs } from '@/components/OnboardingSteps/Step4Labs';
import { Step5Habits } from '@/components/OnboardingSteps/Step5Habits';

function OnboardingContent() {
  const { currentStep, isComplete, profile } = useOnboarding();

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Goals />;
      case 2:
        return <Step2Bio />;
      case 3:
        return <Step3Hardware />;
      case 4:
        return <Step4Labs />;
      case 5:
        return <Step5Habits />;
      default:
        return <Step1Goals />;
    }
  };

  if (isComplete) {
    return <OnboardingCompletion profile={profile} />;
  }

  return (
    <div className="min-h-screen bg-[#030712] pt-24 pb-12">
      <StepProgress />
      <div className="max-w-2xl mx-auto px-4 py-12">
        {renderStep()}
      </div>
    </div>
  );
}

function OnboardingCompletion({ profile }: { profile: any }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 pb-12">
      <div className="max-w-2xl w-full">
        {/* Success Animation */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-500/20 border border-blue-500/40 mb-6 animate-pulse">
            <svg className="w-10 h-10 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Profile Complete!</h1>
          <p className="text-slate-400 text-lg">Your longevity assessment is ready. Let's find your ideal protocol.</p>
        </div>

        {/* Results Summary Card */}
        <div className="glass-card p-8 mb-8 space-y-6">
          {/* Goals Summary */}
          {profile.goals && profile.goals.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-blue-400 mb-3 uppercase tracking-wide">Your Goals</h2>
              <div className="flex flex-wrap gap-2">
                {profile.goals.map((goal: string) => (
                  <span
                    key={goal}
                    className="px-4 py-2 bg-blue-500/15 border border-blue-500/30 rounded-lg text-sm text-blue-300 font-medium"
                  >
                    {goal.charAt(0).toUpperCase() + goal.slice(1)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Bio Snapshot */}
          <div>
            <h2 className="text-sm font-semibold text-blue-400 mb-3 uppercase tracking-wide">Bio Snapshot</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {profile.age && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <p className="text-xs text-blue-400 font-semibold mb-1">Age</p>
                  <p className="text-lg font-bold text-white">{profile.age}</p>
                </div>
              )}
              {profile.gender && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <p className="text-xs text-blue-400 font-semibold mb-1">Gender</p>
                  <p className="text-lg font-bold text-white">{profile.gender}</p>
                </div>
              )}
              {profile.activityLevel && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <p className="text-xs text-blue-400 font-semibold mb-1">Activity</p>
                  <p className="text-lg font-bold text-white">{profile.activityLevel}</p>
                </div>
              )}
            </div>
          </div>

          {/* Current Supplements */}
          {profile.currentSupplements && profile.currentSupplements.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-amber-400 mb-3 uppercase tracking-wide">Current Stack</h2>
              <div className="flex flex-wrap gap-2">
                {profile.currentSupplements.map((supp: string) => (
                  <span
                    key={supp}
                    className="px-3 py-1.5 bg-amber-500/15 border border-amber-500/30 rounded-lg text-sm text-amber-300 font-medium"
                  >
                    {supp}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => router.push('/recommend')}
            className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-blue-500/50"
          >
            View Recommendations
          </button>
          <button
            onClick={() => router.push('/browse')}
            className="flex-1 px-6 py-4 glass-card hover:bg-white/10 text-white font-semibold rounded-lg transition-all"
          >
            Browse All Compounds
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <OnboardingProvider>
      <OnboardingContent />
    </OnboardingProvider>
  );
}
