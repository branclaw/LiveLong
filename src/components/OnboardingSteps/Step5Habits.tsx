'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/lib/onboarding-context';

const SUPPLEMENTS = [
  { id: 'ag1', name: 'AG1', description: 'Comprehensive greens powder' },
  { id: 'kachava', name: 'Ka\'Chava', description: 'Plant-based meal replacement' },
  { id: 'ritual', name: 'Ritual', description: 'Essential vitamins & minerals' },
];

export function Step5Habits() {
  const router = useRouter();
  const { profile, updateProfile, prevStep, completeOnboarding } = useOnboarding();
  const selectedSupplements = new Set(profile.currentSupplements || []);

  const toggleSupplement = (supplementId: string) => {
    const newSupplements = new Set(selectedSupplements);
    if (newSupplements.has(supplementId)) {
      newSupplements.delete(supplementId);
    } else {
      newSupplements.add(supplementId);
    }
    updateProfile({ currentSupplements: Array.from(newSupplements) });
  };

  const handleComplete = () => {
    completeOnboarding();
    // Store profile data before redirecting
    router.push('/recommend');
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-white">Current Habit Audit</h2>
        <p className="text-slate-400">Are you currently taking any of these?</p>
      </div>

      {/* Supplements Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SUPPLEMENTS.map(supplement => (
          <button
            key={supplement.id}
            onClick={() => toggleSupplement(supplement.id)}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              selectedSupplements.has(supplement.id)
                ? 'border-blue-500 bg-slate-800 shadow-lg shadow-blue-500/20'
                : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
            }`}
          >
            <h3 className="font-bold text-white mb-1">{supplement.name}</h3>
            <p className="text-sm text-slate-400">{supplement.description}</p>
          </button>
        ))}
        <button
          onClick={() => updateProfile({ currentSupplements: [] })}
          className={`p-4 rounded-lg border-2 transition-all text-left ${
            selectedSupplements.size === 0
              ? 'border-blue-500 bg-slate-800 shadow-lg shadow-blue-500/20'
              : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
          }`}
        >
          <h3 className="font-bold text-white mb-1">None</h3>
          <p className="text-sm text-slate-400">Just starting out</p>
        </button>
      </div>

      {/* Optimization Message */}
      {selectedSupplements.size > 0 && (
        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
          <p className="text-blue-300 font-semibold">
            ✓ We'll show you how to optimize your routine
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-4 pt-4">
        <button
          onClick={prevStep}
          className="flex-1 py-3 rounded-lg font-semibold border-2 border-slate-700 text-slate-300 hover:border-slate-600 transition-all"
        >
          Back
        </button>
        <button
          onClick={handleComplete}
          className="flex-1 py-3 rounded-lg font-semibold bg-blue-500 hover:bg-blue-600 text-white transition-all"
        >
          Complete Setup
        </button>
      </div>
    </div>
  );
}
