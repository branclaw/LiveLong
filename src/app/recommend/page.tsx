'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useProtocol } from '@/lib/protocol-context';
import { useOnboarding } from '@/lib/onboarding-context';
import { getRecommendationsByGoals, getRecommendationsByBiomarkers, getAvailableGoals, getAvailableBiomarkerConditions, RecommendationResult } from '@/lib/recommendations';

export default function RecommendPage() {
  const { toggleCompound, selectedCompoundIds } = useProtocol();
  const { isComplete, profile } = useOnboarding();
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [maxBudget, setMaxBudget] = useState<number>(10);
  const [activeTab, setActiveTab] = useState<'goals' | 'biomarkers'>('goals');

  // Pre-populate from onboarding context on mount
  useEffect(() => {
    if (isComplete && profile.goals && profile.goals.length > 0) {
      setSelectedGoals(profile.goals);
    }
    if (isComplete && profile.monthlyBudget && profile.monthlyBudget > 0) {
      setMaxBudget(profile.monthlyBudget / 30);
    }
  }, [isComplete, profile]);

  const goals = getAvailableGoals();
  const biomarkerConditions = getAvailableBiomarkerConditions();

  const recommendations = useMemo(() => {
    if (activeTab === 'goals') {
      return getRecommendationsByGoals(selectedGoals, maxBudget);
    } else {
      return getRecommendationsByBiomarkers(selectedConditions);
    }
  }, [selectedGoals, selectedConditions, maxBudget, activeTab]);

  const groupedByPriority = useMemo(() => {
    const groups: Record<number, RecommendationResult[]> = {};
    recommendations.forEach(rec => {
      if (!groups[rec.priority]) {
        groups[rec.priority] = [];
      }
      groups[rec.priority].push(rec);
    });
    return groups;
  }, [recommendations]);

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev =>
      prev.includes(goalId)
        ? prev.filter(g => g !== goalId)
        : [...prev, goalId]
    );
  };

  const toggleCondition = (conditionId: string) => {
    setSelectedConditions(prev =>
      prev.includes(conditionId)
        ? prev.filter(c => c !== conditionId)
        : [...prev, conditionId]
    );
  };

  const getTierLabel = (tier: number): string => {
    const labels: Record<number, string> = { 1: 'Tier 1', 2: 'Tier 2', 3: 'Tier 3', 4: 'Tier 4' };
    return labels[tier] || 'Unknown';
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Goal-Based Recommendations</h1>
          <p className="text-slate-400">
            Select your health goals or biomarker conditions, and we'll recommend the best compounds for your protocol.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-white/10">
          <button
            onClick={() => setActiveTab('goals')}
            className={`pb-4 px-4 font-medium transition-all rounded-t-lg ${
              activeTab === 'goals'
                ? 'text-blue-300 bg-blue-500/10 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            Health Goals
          </button>
          <button
            onClick={() => setActiveTab('biomarkers')}
            className={`pb-4 px-4 font-medium transition-all rounded-t-lg ${
              activeTab === 'biomarkers'
                ? 'text-blue-300 bg-blue-500/10 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            Biomarker Conditions
          </button>
        </div>

        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Select Your Health Goals</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
              {goals.map(goal => (
                <button
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  className={`px-4 py-3 rounded-xl border-2 transition-all text-left font-semibold text-sm ${
                    selectedGoals.includes(goal.id)
                      ? 'border-blue-400 bg-blue-500/20 text-blue-300'
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8 text-white'
                  }`}
                >
                  {goal.label}
                </button>
              ))}
            </div>

            {/* Budget Slider */}
            <div className="glass-card p-6 mb-8">
              <label className="text-white font-semibold mb-4 block">
                Max Daily Budget: <span className="bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">${maxBudget.toFixed(2)}</span>
              </label>
              <input
                type="range"
                min="1"
                max="20"
                step="0.5"
                value={maxBudget}
                onChange={(e) => setMaxBudget(parseFloat(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-400"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-2">
                <span>$1</span>
                <span>$20</span>
              </div>
            </div>
          </div>
        )}

        {/* Biomarkers Tab */}
        {activeTab === 'biomarkers' && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Select Biomarker Conditions</h2>
            <div className="space-y-3">
              {biomarkerConditions.map(condition => (
                <label
                  key={condition.id}
                  className="flex items-center p-4 glass-card border border-white/10 rounded-lg hover:border-white/20 hover:bg-white/8 transition-colors cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedConditions.includes(condition.id)}
                    onChange={() => toggleCondition(condition.id)}
                    className="w-5 h-5 text-blue-400 bg-white/10 border-white/20 rounded cursor-pointer accent-blue-400"
                  />
                  <span className="ml-3 text-white font-medium">{condition.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Results Section */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">
            Recommendations {recommendations.length > 0 && `(${recommendations.length})`}
          </h2>

          {recommendations.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <p className="text-slate-400 text-lg">
                {activeTab === 'goals'
                  ? 'Select one or more health goals to see recommendations.'
                  : 'Select one or more biomarker conditions to see recommendations.'}
              </p>
            </div>
          ) : (
            Object.keys(groupedByPriority)
              .sort((a, b) => parseInt(a) - parseInt(b))
              .map(priorityStr => {
                const priority = parseInt(priorityStr);
                const items = groupedByPriority[priority];
                return (
                  <div key={priority} className="mb-10">
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent mb-4">
                      {getTierLabel(priority)}
                    </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {items.map(rec => {
                      const isSelected = selectedCompoundIds.has(rec.compound.id);
                      return (
                        <div
                          key={rec.compound.id}
                          className={`glass-card border rounded-lg p-5 transition-all ${
                            isSelected
                              ? 'border-blue-400 bg-blue-500/20'
                              : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-bold text-white text-lg mb-1">
                                {rec.compound.name}
                              </h4>
                              <p className="text-sm text-blue-400 mb-2">
                                {rec.compound.category}
                              </p>
                              <p className="text-sm text-slate-300 mb-3">
                                {rec.reason}
                              </p>
                            </div>
                          </div>

                          {/* Scores */}
                          <div className="grid grid-cols-2 gap-3 mb-4 py-3 border-t border-b border-slate-700">
                            <div className="text-center">
                              <p className="text-xs text-slate-400 mb-1">Longevity Impact</p>
                              <p className="text-lg font-bold text-blue-400">
                                {rec.compound.longevityImpact}/10
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-slate-400 mb-1">Price</p>
                              <p className="text-lg font-bold text-blue-400">
                                ${rec.compound.pricePerDay.toFixed(2)}/day
                              </p>
                            </div>
                          </div>

                          {/* Add Button */}
                          <button
                            onClick={() => toggleCompound(rec.compound.id)}
                            className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${
                              isSelected
                                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                                : 'bg-blue-400/20 hover:bg-blue-400/30 text-blue-400'
                            }`}
                          >
                            {isSelected ? 'Remove from Protocol' : 'Add to Protocol'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
              })
          )}
        </div>
      </div>
    </div>
  );
}
