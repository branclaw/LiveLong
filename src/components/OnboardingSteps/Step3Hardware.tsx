'use client';

import React from 'react';
import { useOnboarding } from '@/lib/onboarding-context';

export function Step3Hardware() {
  const { profile, updateProfile, nextStep, prevStep } = useOnboarding();

  const canContinue = profile.hasGlassBlender !== undefined && profile.hasRedLight !== undefined;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-white">Hardware Inventory</h2>
        <p className="text-slate-400">What tools do you have access to?</p>
      </div>

      {/* Glass Blender */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Do you own a glass blender?</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <button
              onClick={() => updateProfile({ hasGlassBlender: true })}
              className={`p-4 rounded-lg border-2 transition-all text-center font-semibold ${
                profile.hasGlassBlender === true
                  ? 'border-blue-500 bg-blue-500/10 text-blue-300'
                  : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600'
              }`}
            >
              ✓ Yes
            </button>
            <button
              onClick={() => updateProfile({ hasGlassBlender: false })}
              className={`p-4 rounded-lg border-2 transition-all text-center font-semibold ${
                profile.hasGlassBlender === false
                  ? 'border-rose-500 bg-rose-500/10 text-rose-300'
                  : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600'
              }`}
            >
              ✗ No
            </button>
          </div>
        </div>

        {/* Glass Blender Info */}
        {profile.hasGlassBlender === false && (
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <h4 className="text-sm font-semibold text-blue-300 mb-2">Why Glass Matters</h4>
            <p className="text-sm text-slate-300 mb-3">
              Plastic blenders leak xenoestrogens when heated, disrupting hormone balance. Glass is inert and safe.
            </p>
            <p className="text-xs text-slate-400 mb-2 font-semibold">Recommended models:</p>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>• Cuisinart Hurricane (glass pitcher)</li>
              <li>• Waring Commercial Stainless Steel</li>
            </ul>
          </div>
        )}
      </div>

      {/* Red Light Panel */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Do you have a red light panel?</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <button
              onClick={() => updateProfile({ hasRedLight: true })}
              className={`p-4 rounded-lg border-2 transition-all text-center font-semibold ${
                profile.hasRedLight === true
                  ? 'border-blue-500 bg-blue-500/10 text-blue-300'
                  : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600'
              }`}
            >
              ✓ Yes
            </button>
            <button
              onClick={() => updateProfile({ hasRedLight: false })}
              className={`p-4 rounded-lg border-2 transition-all text-center font-semibold ${
                profile.hasRedLight === false
                  ? 'border-rose-500 bg-rose-500/10 text-rose-300'
                  : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600'
              }`}
            >
              ✗ No
            </button>
          </div>
        </div>

        {/* Red Light Info */}
        {profile.hasRedLight === false && (
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <h4 className="text-sm font-semibold text-blue-300 mb-2">Photobiomodulation Benefits</h4>
            <p className="text-sm text-slate-300">
              Red and near-infrared light (600-1000nm) penetrates tissue to stimulate mitochondrial ATP production, reduce inflammation, and enhance recovery. 10-20 minutes daily shows measurable benefits.
            </p>
          </div>
        )}
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
