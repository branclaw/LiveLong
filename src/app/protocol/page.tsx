'use client';

import React, { useMemo, useState } from 'react';
import { useProtocol } from '@/lib/protocol-context';
import { LongevityGauge } from '@/components/LongevityGauge';
import { calculateProtocolScore, getCategoryBreakdown, getTierBreakdown } from '@/lib/calculations';
import Link from 'next/link';
import { Copy, Check } from 'lucide-react';

export default function ProtocolPage() {
  const { getSelectedCompounds, totalDailyCost, totalMonthlyCost, clearProtocol, removeCompound } = useProtocol();
  const [expandedTiers, setExpandedTiers] = useState<Set<number>>(new Set([1, 2]));
  const [copied, setCopied] = useState(false);
  const selectedCompounds = getSelectedCompounds();
  
  // Calculate metrics
  const protocolScore = useMemo(() => calculateProtocolScore(selectedCompounds), [selectedCompounds]);
  const categoryBreakdown = useMemo(() => getCategoryBreakdown(selectedCompounds), [selectedCompounds]);
  const tierBreakdown = useMemo(() => getTierBreakdown(selectedCompounds), [selectedCompounds]);
  
  const avgEfficiency = useMemo(() => {
    if (selectedCompounds.length === 0) return 0;
    return Math.round(selectedCompounds.reduce((sum, c) => sum + c.efficiencyScore, 0) / selectedCompounds.length * 10) / 10;
  }, [selectedCompounds]);
  
  // Group compounds by tier
  const compoundsByTier = useMemo(() => {
    const grouped: Record<number, typeof selectedCompounds> = {
      1: [],
      2: [],
      3: [],
      4: [],
    };
    selectedCompounds.forEach(c => {
      grouped[c.tierNumber]?.push(c);
    });
    return grouped;
  }, [selectedCompounds]);

  const tierConfig = {
    1: { label: 'Essential', color: 'blue', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30', textColor: 'text-blue-400' },
    2: { label: 'Impactful', color: 'blue', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30', textColor: 'text-blue-400' },
    3: { label: 'Nice to Have', color: 'amber', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30', textColor: 'text-amber-400' },
    4: { label: 'Not Worth It', color: 'slate', bgColor: 'bg-slate-500/10', borderColor: 'border-slate-500/30', textColor: 'text-slate-400' },
  };

  const toggleTierExpanded = (tier: number) => {
    const newExpanded = new Set(expandedTiers);
    if (newExpanded.has(tier)) {
      newExpanded.delete(tier);
    } else {
      newExpanded.add(tier);
    }
    setExpandedTiers(newExpanded);
  };

  const shareProtocol = async () => {
    const summary = `Longevity Protocol - ${selectedCompounds.length} compounds
Score: ${protocolScore}/100
Daily Cost: $${totalDailyCost.toFixed(2)}
Monthly Cost: $${totalMonthlyCost.toFixed(2)}

Compounds:
${selectedCompounds.map(c => `- ${c.name} (Tier ${c.tierNumber}) - $${c.pricePerDay.toFixed(2)}/day`).join('\n')}

Generated at The Longevity Navigator`;

    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Your Protocol Blueprint</h1>
          <p className="text-slate-400">
            {selectedCompounds.length === 0
              ? 'Build your personalized longevity protocol by selecting compounds from Browse or Recommend.'
              : `${selectedCompounds.length} compound${selectedCompounds.length !== 1 ? 's' : ''} selected`}
          </p>
        </div>

        {selectedCompounds.length === 0 ? (
          // Empty State
          <div className="glass-card p-12 text-center">
            <div className="mb-6">
              <div className="text-5xl mb-4">∅</div>
              <h2 className="text-2xl font-semibold mb-2">No Compounds Selected</h2>
              <p className="text-slate-400 mb-6">
                Start building your personalized longevity protocol by exploring compounds or getting AI recommendations.
              </p>
            </div>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/browse"
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 rounded-lg font-semibold transition-all shadow-lg hover:shadow-blue-500/50"
              >
                Browse Compounds
              </Link>
              <Link
                href="/recommend"
                className="px-6 py-3 glass-subtle bg-white/10 hover:bg-white/15 rounded-lg font-semibold transition-colors border border-white/10 hover:border-white/20"
              >
                Get Recommendations
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Top Section: Gauge + Stats Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              {/* Gauge */}
              <div className="lg:col-span-1 flex justify-center items-center">
                <LongevityGauge score={protocolScore} size="lg" />
              </div>
              
              {/* Stats Cards */}
              <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                {/* Total Items */}
                <div className="glass-card p-6">
                  <p className="text-slate-400 text-sm mb-1">Total Items</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">{selectedCompounds.length}</p>
                </div>

                {/* Daily Cost */}
                <div className="glass-card p-6">
                  <p className="text-slate-400 text-sm mb-1">Daily Cost</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">${totalDailyCost.toFixed(2)}</p>
                </div>

                {/* Monthly Cost */}
                <div className="glass-card p-6">
                  <p className="text-slate-400 text-sm mb-1">Monthly Cost</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">${totalMonthlyCost.toFixed(2)}</p>
                </div>

                {/* Avg Efficiency */}
                <div className="glass-card p-6">
                  <p className="text-slate-400 text-sm mb-1">Avg Efficiency</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">{avgEfficiency}/10</p>
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="glass-card p-6 mb-8">
              <h2 className="text-lg font-semibold mb-4 text-slate-100">Category Coverage</h2>
              <div className="space-y-3">
                {categoryBreakdown.map((cat) => (
                  <div key={cat.category}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-slate-300">{cat.category}</span>
                      <span className="text-sm text-slate-400">{cat.count} compounds ({cat.percentage}%)</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2 border border-white/10">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all shadow-lg shadow-blue-500/40"
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tier Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {tierBreakdown.map((tier) => {
                const config = tierConfig[tier.tier as keyof typeof tierConfig];
                return (
                  <div
                    key={tier.tier}
                    className={`glass-card ${config.bgColor} border ${config.borderColor} rounded-lg p-4 text-center`}
                  >
                    <p className={`text-sm font-semibold ${config.textColor} mb-2`}>{tier.label}</p>
                    <p className="text-2xl font-bold text-white">{tier.count}</p>
                    <p className="text-xs text-slate-400 mt-2">Tier {tier.tier}</p>
                  </div>
                );
              })}
            </div>

            {/* Compounds by Tier - Collapsible */}
            <div className="space-y-4 mb-12">
              {[1, 2, 3, 4].map((tierNum) => {
                const compounds = compoundsByTier[tierNum as keyof typeof compoundsByTier] || [];
                if (compounds.length === 0) return null;

                const config = tierConfig[tierNum as keyof typeof tierConfig];
                const isExpanded = expandedTiers.has(tierNum);

                return (
                  <div key={tierNum}>
                    <button
                      onClick={() => toggleTierExpanded(tierNum)}
                      className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${config.borderColor} ${config.bgColor}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full bg-${config.color}-500`} />
                        <h3 className={`text-lg font-semibold ${config.textColor}`}>
                          {config.label} ({compounds.length})
                        </h3>
                      </div>
                      <svg
                        className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </button>

                    {isExpanded && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {compounds.map((compound) => (
                          <div
                            key={compound.id}
                            className={`glass-card ${config.bgColor} border ${config.borderColor} rounded-lg p-4 flex justify-between items-start`}
                          >
                            <div className="flex-1">
                              <h4 className="font-semibold text-white mb-2">{compound.name}</h4>
                              <div className="flex flex-wrap gap-2 mb-3">
                                <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                                  {compound.category}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  compound.takingToday
                                    ? 'bg-blue-500/20 text-blue-300'
                                    : 'bg-slate-600 text-slate-400'
                                }`}>
                                  {compound.takingToday ? 'Active' : 'Optional'}
                                </span>
                              </div>
                              <div className="text-sm text-slate-400 space-y-1">
                                <p>Impact: {compound.longevityImpact}/10</p>
                                <p>Efficiency: {compound.efficiencyScore}/10</p>
                                <p className="text-blue-400 font-semibold">${compound.pricePerDay.toFixed(2)}/day</p>
                              </div>
                            </div>
                            <button
                              onClick={() => removeCompound(compound.id)}
                              className="ml-4 px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded text-sm font-semibold transition-colors border border-rose-500/30"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-8 border-t border-slate-700">
              <button
                onClick={clearProtocol}
                className="px-6 py-3 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-lg font-semibold transition-colors border border-rose-500/30 w-full sm:w-auto"
              >
                Clear Protocol
              </button>

              <div className="flex gap-4 w-full sm:w-auto">
                <button
                  onClick={shareProtocol}
                  className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  title="Copy protocol summary to clipboard"
                >
                  {copied ? (
                    <>
                      <Check size={18} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={18} />
                      Share Protocol
                    </>
                  )}
                </button>
                <Link
                  href="/browse"
                  className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold transition-colors text-center"
                >
                  Add More Compounds
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
