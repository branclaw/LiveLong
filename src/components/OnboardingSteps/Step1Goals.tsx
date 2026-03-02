'use client';

import React from 'react';
import { useOnboarding } from '@/lib/onboarding-context';

// Modern SVG line icons for each goal
const GoalIcon = ({ id, className = '' }: { id: string; className?: string }) => {
  const icons: Record<string, React.ReactNode> = {
    longevity: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
        <path d="M12 6v6l4 2" />
        <path d="M16 2s1 3 1 4" /><path d="M20 6s-3 1-4 1" />
      </svg>
    ),
    performance: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    muscle: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12h1l2-4 3 8 3-8 2 4h1" />
        <circle cx="18" cy="12" r="3" />
        <circle cx="6" cy="12" r="0" />
        <path d="M7 5l2 2M17 5l-2 2M7 19l2-2M17 19l-2-2" />
      </svg>
    ),
    cognitive: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a7 7 0 0 0-7 7c0 3 2 5.5 4 7l.5 1h5l.5-1c2-1.5 4-4 4-7a7 7 0 0 0-7-7z" />
        <path d="M9.5 18h5M10 21h4" />
        <path d="M9 10h.01M15 10h.01M12 14c1 0 2-.5 2-1.5" />
      </svg>
    ),
    gut: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3c-1.5 0-3 1.5-3 3s1.5 3 3 3c2 0 3 1 3 3s-1 3-3 3-3 1-3 3 1.5 3 3 3" />
        <path d="M8 9c-2 0-3 1-3 2.5S6 14 8 14" />
        <path d="M16 9c2 0 3 1 3 2.5s-1 2.5-3 2.5" />
      </svg>
    ),
    heart: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0L12 5.36l-.77-.78a5.4 5.4 0 0 0-7.65 0 5.4 5.4 0 0 0 0 7.65l.78.77L12 20.65l7.64-7.65.78-.77a5.4 5.4 0 0 0 0-7.65z" />
        <path d="M3.5 12h2l2-3 3 6 2-4 1.5 1H18" />
      </svg>
    ),
    immunity: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3 6 6 1-4 4 1 6-6-3-6 3 1-6-4-4 6-1z" />
      </svg>
    ),
    hormone: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
      </svg>
    ),
    sleep: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        <path d="M14 5l2 2M17 8l2 2" />
      </svg>
    ),
    aesthetics: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3L8 7.5V12a4 4 0 008 0V7.5L12 3z" />
        <path d="M12 16v5M8 21h8" />
        <path d="M6 6l2 1M18 6l-2 1" />
      </svg>
    ),
  };

  return <>{icons[id] || <div className={className} />}</>;
};

const GOALS = [
  { id: 'longevity', title: 'Longevity', description: 'Extend healthspan and lifespan', gradient: 'from-blue-400 to-violet-400' },
  { id: 'performance', title: 'Performance', description: 'Boost athletic performance', gradient: 'from-amber-400 to-orange-400' },
  { id: 'muscle', title: 'Muscle Growth', description: 'Build lean muscle mass', gradient: 'from-rose-400 to-red-400' },
  { id: 'cognitive', title: 'Cognitive Enhancement', description: 'Sharpen mental clarity', gradient: 'from-violet-400 to-purple-400' },
  { id: 'gut', title: 'Gut Health', description: 'Optimize digestive health', gradient: 'from-green-400 to-emerald-400' },
  { id: 'heart', title: 'Heart Health', description: 'Strengthen cardiovascular system', gradient: 'from-rose-400 to-pink-400' },
  { id: 'immunity', title: 'Immunity', description: 'Enhance immune function', gradient: 'from-cyan-400 to-blue-400' },
  { id: 'hormone', title: 'Hormone Optimization', description: 'Balance hormonal health', gradient: 'from-amber-400 to-yellow-400' },
  { id: 'sleep', title: 'Better Sleep', description: 'Improve sleep quality', gradient: 'from-indigo-400 to-blue-400' },
  { id: 'aesthetics', title: 'Aesthetics', description: 'Enhance appearance and vitality', gradient: 'from-pink-400 to-rose-400' },
];

export function Step1Goals() {
  const { profile, updateProfile, nextStep } = useOnboarding();
  const selectedGoals = new Set(profile.goals);

  const toggleGoal = (goalId: string) => {
    const newGoals = new Set(selectedGoals);
    if (newGoals.has(goalId)) {
      newGoals.delete(goalId);
    } else {
      newGoals.add(goalId);
    }
    updateProfile({ goals: Array.from(newGoals) });
  };

  const canContinue = selectedGoals.size > 0;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-white">Why are you here?</h2>
        <p className="text-slate-400">Select one or more goals that matter to you</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {GOALS.map(goal => {
          const isSelected = selectedGoals.has(goal.id);
          return (
            <button
              key={goal.id}
              onClick={() => toggleGoal(goal.id)}
              className={`glass-card p-5 rounded-xl border-2 transition-all text-left group ${
                isSelected
                  ? 'border-blue-400 bg-blue-500/15 shadow-lg shadow-blue-500/20'
                  : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${goal.gradient} bg-opacity-20 flex items-center justify-center mb-4 ${
                isSelected ? 'shadow-lg' : ''
              }`} style={{ background: isSelected ? undefined : 'rgba(255,255,255,0.05)' }}>
                <GoalIcon
                  id={goal.id}
                  className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'} transition-colors`}
                />
              </div>
              <h3 className="font-bold text-white mb-1 text-sm">{goal.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{goal.description}</p>
            </button>
          );
        })}
      </div>

      <button
        onClick={nextStep}
        disabled={!canContinue}
        className={`w-full py-3 rounded-lg font-semibold transition-all backdrop-blur-sm border ${
          canContinue
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white shadow-lg hover:shadow-blue-500/50 border-blue-400/20'
            : 'bg-white/5 text-slate-500 cursor-not-allowed border-white/10'
        }`}
      >
        Continue
      </button>
    </div>
  );
}
