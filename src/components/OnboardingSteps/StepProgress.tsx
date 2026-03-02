'use client';

import React from 'react';
import { useOnboarding } from '@/lib/onboarding-context';
import { Check } from 'lucide-react';

const STEPS = [
  { number: 1, label: 'Goals' },
  { number: 2, label: 'Biology' },
  { number: 3, label: 'Hardware' },
  { number: 4, label: 'Labs' },
  { number: 5, label: 'Habits' },
];

export function StepProgress() {
  const { currentStep } = useOnboarding();

  return (
    <div className="w-full px-4 py-8 glass border-b border-white/10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <React.Fragment key={step.number}>
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all font-semibold text-sm backdrop-blur-sm border ${
                    currentStep > step.number
                      ? 'bg-blue-500/30 text-blue-300 border-blue-500/50'
                      : currentStep === step.number
                      ? 'bg-blue-500 text-white border-blue-400 shadow-lg shadow-blue-500/50'
                      : 'bg-white/5 text-slate-400 border-white/10'
                  }`}
                >
                  {currentStep > step.number ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    step.number
                  )}
                </div>
                <span className={`text-xs mt-2 font-medium hidden sm:block transition-colors ${
                  currentStep >= step.number
                    ? 'text-blue-400'
                    : 'text-slate-500'
                }`}>
                  {step.label}
                </span>
              </div>

              {/* Connecting Line */}
              {index < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 transition-all ${
                    currentStep > step.number
                      ? 'bg-gradient-to-r from-blue-500 to-blue-400 shadow-lg shadow-blue-500/40'
                      : 'bg-white/10'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
