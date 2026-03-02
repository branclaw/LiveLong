'use client';

import React, { useState } from 'react';
import { useOnboarding } from '@/lib/onboarding-context';

const ACTIVITY_LEVELS = [
  { id: 'sedentary', emoji: '🪑', title: 'Sedentary', description: 'Little to no exercise' },
  { id: 'moderate', emoji: '🚶', title: 'Moderate', description: '3-4 days per week' },
  { id: 'active', emoji: '🏃', title: 'Active', description: '5-6 days per week' },
  { id: 'athlete', emoji: '🏋️', title: 'Athlete', description: 'Daily intense training' },
];

export function Step2Bio() {
  const { profile, updateProfile, nextStep, prevStep } = useOnboarding();
  const [useKg, setUseKg] = useState(false);

  const canContinue = profile.age && profile.weight && profile.sex && profile.activityLevel && profile.monthlyBudget;

  const handleWeightChange = (value: string) => {
    const num = value ? parseFloat(value) : undefined;
    updateProfile({ weight: num });
  };

  const displayWeight = profile.weight
    ? useKg
      ? Math.round(profile.weight / 2.205)
      : profile.weight
    : '';

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-white">Biological Snapshot</h2>
        <p className="text-slate-400">Help us understand your baseline</p>
      </div>

      {/* Age Input */}
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-2">Age</label>
        <input
          type="number"
          min="18"
          max="100"
          value={profile.age || ''}
          onChange={e => updateProfile({ age: e.target.value ? parseInt(e.target.value) : undefined })}
          className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          placeholder="Enter your age"
        />
      </div>

      {/* Weight Input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-slate-300">Weight</label>
          <button
            onClick={() => setUseKg(!useKg)}
            className="text-xs text-slate-400 hover:text-blue-400 transition-colors"
          >
            {useKg ? 'lbs' : 'kg'}
          </button>
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            value={displayWeight}
            onChange={e => {
              const val = e.target.value ? parseFloat(e.target.value) : undefined;
              if (val !== undefined) {
                handleWeightChange(useKg ? String(val * 2.205) : String(val));
              } else {
                handleWeightChange('');
              }
            }}
            className="flex-1 px-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            placeholder={useKg ? 'kg' : 'lbs'}
          />
        </div>
      </div>

      {/* Sex Selector */}
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-3">Sex</label>
        <div className="flex gap-4">
          {['male', 'female'].map(sex => (
            <button
              key={sex}
              onClick={() => updateProfile({ sex: sex as 'male' | 'female' })}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all border-2 capitalize ${
                profile.sex === sex
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              {sex}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Level */}
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-3">Activity Level</label>
        <div className="grid grid-cols-2 gap-3">
          {ACTIVITY_LEVELS.map(level => (
            <button
              key={level.id}
              onClick={() => updateProfile({ activityLevel: level.id as any })}
              className={`p-4 rounded-lg border-2 transition-all text-center ${
                profile.activityLevel === level.id
                  ? 'border-blue-500 bg-slate-800 shadow-lg shadow-blue-500/20'
                  : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
              }`}
            >
              <div className="text-3xl mb-2">{level.emoji}</div>
              <h4 className="font-bold text-white text-sm mb-1">{level.title}</h4>
              <p className="text-xs text-slate-400">{level.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Monthly Budget Slider */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-semibold text-slate-300">Monthly Budget</label>
          <span className="text-lg font-bold text-blue-400">${profile.monthlyBudget || 50}</span>
        </div>
        <input
          type="range"
          min="50"
          max="500"
          step="25"
          value={profile.monthlyBudget || 50}
          onChange={e => updateProfile({ monthlyBudget: parseInt(e.target.value) })}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between text-xs text-slate-500 mt-2">
          <span>$50</span>
          <span>$500</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-4 pt-4">
        <button
          onClick={prevStep}
          className="flex-1 py-3 rounded-lg font-semibold border-2 border-slate-700 text-slate-300 hover:border-slate-600 transition-all"
        >
          Back
        </button>
        <button
          onClick={nextStep}
          disabled={!canContinue}
          className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
            canContinue
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-500 cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
