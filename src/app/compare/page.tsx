'use client';

import React, { useMemo } from 'react';
import { useProtocol } from '@/lib/protocol-context';
import { compareWithCompetitor, getAllCompetitors } from '@/lib/comparison';
import Link from 'next/link';

export default function ComparePage() {
  const { getSelectedCompounds } = useProtocol();
  const selectedCompounds = useMemo(() => getSelectedCompounds(), [getSelectedCompounds]);
  const competitors = getAllCompetitors();

  const comparisons = useMemo(() => {
    return competitors
      .map(competitor => compareWithCompetitor(selectedCompounds, competitor.name))
      .filter((c): c is NonNullable<typeof c> => c !== null);
  }, [selectedCompounds]);

  return (
    <div className="min-h-screen bg-[#030712] text-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Stack Comparison</h1>
          <p className="text-slate-400">
            Your custom protocol vs. the market's leading products.
          </p>
        </div>

        {/* Empty State */}
        {selectedCompounds.length === 0 && (
          <div className="glass-card p-12 text-center mb-12">
            <p className="text-slate-400 text-lg mb-6">
              You haven't selected any compounds yet. Start building your protocol to see comparisons.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/browse"
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-blue-500/50"
              >
                Browse Compounds
              </Link>
              <Link
                href="/recommend"
                className="px-6 py-2 glass-subtle bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-semibold rounded-lg transition-colors border border-blue-500/30 hover:border-blue-500/50"
              >
                Get Recommendations
              </Link>
            </div>
          </div>
        )}

      {selectedCompounds.length > 0 && (
        <>
          {/* Your Protocol Card */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Your Custom Protocol</h2>
            <div className="glass-elevated p-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <div>
                  <p className="text-sm text-slate-400 mb-2">Total Compounds</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
                    {selectedCompounds.length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-2">Daily Cost</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
                    ${comparisons[0]?.userProtocol.totalDailyCost.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-2">Monthly Cost</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
                    ${comparisons[0]?.userProtocol.totalMonthlyCost.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-white font-semibold mb-4">Selected Compounds:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedCompounds.map(compound => (
                    <span
                      key={compound.id}
                      className="px-3 py-1 bg-blue-400/20 text-blue-400 text-sm rounded-full"
                    >
                      {compound.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Competitor Comparisons */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">vs. Market Leaders</h2>
            <div className="space-y-8">
              {comparisons.map((comparison, idx) => (
                <div
                  key={idx}
                  className="border border-slate-700 rounded-lg overflow-hidden hover:border-slate-600 transition-colors"
                >
                  {/* Competitor Header */}
                  <div className="bg-slate-800/50 p-6 border-b border-slate-700">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          {comparison.competitor.name}
                        </h3>
                        <p className="text-sm text-slate-400">
                          {comparison.competitor.description}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase mb-1">Price/Day</p>
                        <p className="text-2xl font-bold text-white">
                          ${comparison.competitor.pricePerDay.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase mb-1">Price/Month</p>
                        <p className="text-2xl font-bold text-white">
                          ${comparison.competitor.pricePerMonth.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase mb-1">Compounds</p>
                        <p className="text-2xl font-bold text-slate-300">
                          {comparison.competitor.ingredients.length}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Comparison Metrics */}
                  <div className="p-6 space-y-6">
                    {/* Savings */}
                    <div>
                      <h4 className="font-semibold text-white mb-4">Your Savings</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                          <p className="text-xs text-blue-400 uppercase mb-1">Daily</p>
                          <p className="text-2xl font-bold text-blue-400">
                            ${comparison.savings.daily.toFixed(2)}
                          </p>
                        </div>
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                          <p className="text-xs text-blue-400 uppercase mb-1">Monthly</p>
                          <p className="text-2xl font-bold text-blue-400">
                            ${comparison.savings.monthly.toFixed(2)}
                          </p>
                        </div>
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                          <p className="text-xs text-blue-400 uppercase mb-1">Yearly</p>
                          <p className="text-2xl font-bold text-blue-400">
                            ${comparison.savings.yearly.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Ingredients */}
                    <div>
                      <h4 className="font-semibold text-white mb-4">
                        {comparison.competitor.name} Ingredients
                      </h4>
                      <div className="space-y-3">
                        {comparison.competitor.ingredients.map((ing, i) => (
                          <div key={i}>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-slate-300">{ing.name}</span>
                              <span className="text-xs text-slate-400">
                                {ing.percentage}% of optimal dose
                              </span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  ing.percentage >= 80
                                    ? 'bg-blue-400'
                                    : ing.percentage >= 40
                                    ? 'bg-yellow-500'
                                    : 'bg-rose-500'
                                }`}
                                style={{ width: `${Math.min(ing.percentage, 100)}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                              Current: {ing.dose} | Optimal: {ing.optimalDose}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      </div>
    </div>
  );
}
