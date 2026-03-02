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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!profile.age) {
      newErrors.age = 'Age is required';
    } else if (profile.age < 18 || profile.age > 120) {
      newErrors.age = 'Please enter a valid age (18-120)';
    } else if (!Number.isInteger(profile.age)) {
      newErrors.age = 'Please enter a whole number';
    }

    if (!profile.weight) {
      newErrors.weight = 'Weight is required';
    } else if (profile.weight < 50 || profile.weight > 500) {
      newErrors.weight = 'Please enter a valid weight';
    }

    if (!profile.sex) {
      newErrors.sex = 'Please select your sex';
    }

    if (!profile.activityLevel) {
      newErrors.activityLevel = 'Please select your activity level';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    setTouched({ age: true, weight: true, sex: true, activityLevel: true });
    if (validate()) {
      nextStep();
    }
  };

  const handleAgeChange = (value: string) => {
    const num = value ? parseInt(value) : undefined;
    updateProfile({ age: num });
    if (touched.age) {
      const newErrors = { ...errors };
      if (!num) {
        newErrors.age = 'Age is required';
      } else if (num < 18 || num > 120) {
        newErrors.age = 'Please enter a valid age (18-120)';
      } else {
        delete newErrors.age;
      }
      setErrors(newErrors);
    }
  };

  const canContinue = profile.age && profile.weight && profile.sex && profile.activityLevel && profile.monthlyBudget;

  const handleWeightChange = (value: string) => {
    const num = value ? parseFloat(value) : undefined;
    updateProfile({ weight: num });
    if (touched.weight) {
      const newErrors = { ...errors };
      if (!num) {
        newErrors.weight = 'Weight is required';
      } else if (num < 50 || num > 500) {
        newErrors.weight = 'Please enter a valid weight';
      } else {
        delete newErrors.weight;
      }
      setErrors(newErrors);
    }
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
          max="120"
          value={profile.age || ''}
          onChange={e => handleAgeChange(e.target.value)}
          onBlur={() => { setTouched(t => ({ ...t, age: true })); validate(); }}
          className={`w-full px-4 py-3 bg-slate-800 border-2 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
            errors.age && touched.age
              ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
              : 'border-slate-700 focus:border-blue-500 focus:ring-blue-500/20'
          }`}
          placeholder="Enter your age"
        />
        {errors.age && touched.age && (
          <p className="mt-1.5 text-sm text-rose-400 flex items-center gap-1">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            {errors.age}
          </p>
        )}
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
            onBlur={() => { setTouched(t => ({ ...t, weight: true })); validate(); }}
            className={`flex-1 px-4 py-3 bg-slate-800 border-2 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
              errors.weight && touched.weight
                ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                : 'border-slate-700 focus:border-blue-500 focus:ring-blue-500/20'
            }`}
            placeholder={useKg ? 'kg' : 'lbs'}
          />
        </div>
        {errors.weight && touched.weight && (
          <p className="mt-1.5 text-sm text-rose-400 flex items-center gap-1">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            {errors.weight}
          </p>
        )}
      </div>

      {/* Sex Selector */}
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-3">Sex</label>
        <div className="flex gap-4">
          {['male', 'female'].map(sex => (
            <button
              key={sex}
              onClick={() => { updateProfile({ sex: sex as 'male' | 'female' }); setTouched(t => ({ ...t, sex: true })); }}
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
        {errors.sex && touched.sex && (
          <p className="mt-1.5 text-sm text-rose-400">{errors.sex}</p>
        )}
      </div>

      {/* Activity Level */}
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-3">Activity Level</label>
        <div className="grid grid-cols-2 gap-3">
          {ACTIVITY_LEVELS.map(level => (
            <button
              key={level.id}
              onClick={() => { updateProfile({ activityLevel: level.id as any }); setTouched(t => ({ ...t, activityLevel: true })); }}
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
        {errors.activityLevel && touched.activityLevel && (
          <p className="mt-1.5 text-sm text-rose-400">{errors.activityLevel}</p>
        )}
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
          onClick={handleContinue}
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
