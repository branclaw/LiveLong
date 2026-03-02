'use client';

import React from 'react';
import { useOnboarding } from '@/lib/onboarding-context';

const GOALS = [
  { id: 'longevity', emoji: '⏳', title: 'Longevity', description: 'Extend healthspan and lifespan' },
  { id: 'performance', emoji: '⚡', title: 'Performance', description: 'Boost athletic performance' },
  { id: 'muscle', emoji: '💪', title: 'Muscle Growth', description: 'Build lean muscle mass' },
  { id: 'cognitive', emoji: '🧠', title: 'Cognitive Enhancement', description: 'Sharpen mental clarity' },
  { id: 'gut', emoji: '🦠', title: 'Gut Health', description: 'Optimize digestive health' },
  { id: 'heart', emoji: '❤️', title: 'Heart Health', description: 'Strengthen cardiovascular system' },
  { id: 'immunity', emoji: '🛡️', title: 'Immunity', description: 'Enhance immune function' },
  { id: 'hormone', emoji: '⚙️', title: 'Hormone Optimization', description: 'Balance hormonal health' },
  { id: 'sleep', emoji: '😴', title: 'Better Sleep', description: 'Improve sleep quality' },
  { id: 'aesthetics', emoji: '✨', title: 'Aesthetics', description: 'Enhance appearance and vitality' },
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
        {GOALS.map(goal => (
          <button
            key={goal.id}
            onClick={() => toggleGoal(goal.id)}
            className={`glass-card p-4 rounded-lg border-2 transition-all text-left ${
              selectedGoals.has(goal.id)
                ? 'border-blue-400 bg-blue-500/20 shadow-lg shadow-blue-500/30'
                : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'
            }`}
          >
            <div className="text-4xl mb-3">{goal.emoji}</div>
            <h3 className="font-bold text-white mb-1">{goal.title}</h3>
            <p className="text-xs text-slate-400">{goal.description}</p>
          </button>
        ))}
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
