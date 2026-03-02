'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { useProtocol } from '@/lib/protocol-context';
import { useAuth } from '@/lib/auth-context';
import { useAuthModal } from '@/lib/auth-modal-context';
import { LongevityGauge } from '@/components/LongevityGauge';
import { calculateProtocolScore, getCategoryBreakdown, getTierBreakdown } from '@/lib/calculations';
import { filterByDeliveryMode, getDeliveryStats, getSmoothieRecipe, classifyCompoundDelivery, type DeliveryMode } from '@/lib/delivery-modes';
import { exportProtocolToPDF } from '@/lib/pdf-export';
import { downloadShareCard, shareProtocolCard } from '@/lib/share-card';
import Link from 'next/link';

export default function ProtocolPage() {
  const { getSelectedCompounds, totalDailyCost, totalMonthlyCost, clearProtocol, removeCompound, saveToCloud } = useProtocol();
  const { isAuthenticated } = useAuth();
  const { openAuthModal } = useAuthModal();

  const [expandedTiers, setExpandedTiers] = useState<Set<number>>(new Set([1, 2]));
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('all');
  const [showSmoothieRecipe, setShowSmoothieRecipe] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [protocolName, setProtocolName] = useState('My Protocol');
  const [showNameInput, setShowNameInput] = useState(false);

  const allCompounds = getSelectedCompounds();
  const selectedCompounds = useMemo(() => filterByDeliveryMode(allCompounds, deliveryMode), [allCompounds, deliveryMode]);
  const protocolScore = useMemo(() => calculateProtocolScore(allCompounds), [allCompounds]);
  const categoryBreakdown = useMemo(() => getCategoryBreakdown(allCompounds), [allCompounds]);
  const tierBreakdown = useMemo(() => getTierBreakdown(allCompounds), [allCompounds]);
  const deliveryStats = useMemo(() => getDeliveryStats(allCompounds), [allCompounds]);
  const smoothieRecipe = useMemo(() => getSmoothieRecipe(allCompounds), [allCompounds]);

  const avgEfficiency = useMemo(() => {
    if (allCompounds.length === 0) return 0;
    return Math.round(allCompounds.reduce((sum, c) => sum + c.efficiencyScore, 0) / allCompounds.length * 10) / 10;
  }, [allCompounds]);

  const compoundsByTier = useMemo(() => {
    const grouped: Record<number, typeof selectedCompounds> = { 1: [], 2: [], 3: [], 4: [] };
    selectedCompounds.forEach(c => { grouped[c.tierNumber]?.push(c); });
    return grouped;
  }, [selectedCompounds]);

  const tierConfig = {
    1: { label: 'Essential', color: 'blue', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30', textColor: 'text-blue-400' },
    2: { label: 'Impactful', color: 'blue', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30', textColor: 'text-blue-400' },
    3: { label: 'Nice to Have', color: 'amber', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30', textColor: 'text-amber-400' },
    4: { label: 'Not Worth It', color: 'slate', bgColor: 'bg-slate-500/10', borderColor: 'border-slate-500/30', textColor: 'text-slate-400' },
  };

  const toggleTierExpanded = (tier: number) => {
    const next = new Set(expandedTiers);
    next.has(tier) ? next.delete(tier) : next.add(tier);
    setExpandedTiers(next);
  };

  const handleExportPDF = useCallback(async () => {
    setIsExporting(true);
    try {
      await exportProtocolToPDF({
        name: protocolName,
        compounds: allCompounds,
        totalDailyCost,
        totalMonthlyCost,
        longevityScore: protocolScore,
      });
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setIsExporting(false);
    }
  }, [protocolName, allCompounds, totalDailyCost, totalMonthlyCost, protocolScore]);

  const handleShareCard = useCallback(async () => {
    setIsSharing(true);
    try {
      await shareProtocolCard({
        name: protocolName,
        compoundCount: allCompounds.length,
        longevityScore: protocolScore,
        topCompounds: allCompounds.slice(0, 5).map(c => c.name),
        dailyCost: totalDailyCost,
      });
    } catch (err) {
      console.error('Share card failed:', err);
    } finally {
      setIsSharing(false);
    }
  }, [protocolName, allCompounds, protocolScore, totalDailyCost]);

  const handleSaveToCloud = useCallback(async () => {
    if (!isAuthenticated) {
      openAuthModal('signin');
      return;
    }
    setIsSaving(true);
    try {
      await saveToCloud(protocolName, protocolScore);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setIsSaving(false);
    }
  }, [isAuthenticated, openAuthModal, saveToCloud, protocolName, protocolScore]);

  const getDeliveryIcon = (compound: typeof allCompounds[number]) => {
    const form = classifyCompoundDelivery(compound).deliveryForm;
    if (form === 'smoothie') return '🥤';
    if (form === 'both') return '🥤💊';
    return '💊';
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white pt-4">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with name */}
        <div className="mb-10 flex items-start justify-between">
          <div>
            {showNameInput ? (
              <div className="flex items-center gap-3 mb-2">
                <input
                  type="text"
                  value={protocolName}
                  onChange={(e) => setProtocolName(e.target.value)}
                  onBlur={() => setShowNameInput(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setShowNameInput(false)}
                  className="text-3xl font-bold bg-transparent border-b-2 border-blue-400 text-white focus:outline-none"
                  autoFocus
                />
              </div>
            ) : (
              <h1
                className="text-4xl font-bold mb-1 cursor-pointer hover:text-blue-300 transition-colors group"
                onClick={() => allCompounds.length > 0 && setShowNameInput(true)}
              >
                {allCompounds.length > 0 ? protocolName : 'Your Protocol Blueprint'}
                {allCompounds.length > 0 && (
                  <svg className="w-4 h-4 inline-block ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                )}
              </h1>
            )}
            <p className="text-slate-400">
              {allCompounds.length === 0
                ? 'Build your personalized longevity protocol by selecting compounds from Browse or Recommend.'
                : `${allCompounds.length} compound${allCompounds.length !== 1 ? 's' : ''} selected`}
            </p>
          </div>
        </div>

        {allCompounds.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="mb-6">
              <div className="text-5xl mb-4">∅</div>
              <h2 className="text-2xl font-semibold mb-2">No Compounds Selected</h2>
              <p className="text-slate-400 mb-6">Start building your personalized longevity protocol by exploring compounds or getting AI recommendations.</p>
            </div>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/browse" className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 rounded-lg font-semibold transition-all shadow-lg hover:shadow-blue-500/50">
                Browse Compounds
              </Link>
              <Link href="/recommend" className="px-6 py-3 glass-subtle bg-white/10 hover:bg-white/15 rounded-lg font-semibold transition-colors border border-white/10 hover:border-white/20">
                Get Recommendations
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Top: Gauge + Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-1 flex justify-center items-center">
                <LongevityGauge score={protocolScore} size="lg" />
              </div>
              <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                <div className="glass-card p-6">
                  <p className="text-slate-400 text-sm mb-1">Total Items</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">{allCompounds.length}</p>
                </div>
                <div className="glass-card p-6">
                  <p className="text-slate-400 text-sm mb-1">Daily Cost</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">${totalDailyCost.toFixed(2)}</p>
                </div>
                <div className="glass-card p-6">
                  <p className="text-slate-400 text-sm mb-1">Monthly Cost</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">${totalMonthlyCost.toFixed(2)}</p>
                </div>
                <div className="glass-card p-6">
                  <p className="text-slate-400 text-sm mb-1">Avg Efficiency</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">{avgEfficiency}/10</p>
                </div>
              </div>
            </div>

            {/* Delivery Mode Toggle */}
            <div className="glass-card p-5 mb-8 rounded-xl border border-blue-500/20">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-1">Delivery Mode</h2>
                  <p className="text-xs text-slate-500">
                    {deliveryStats.smoothieCount} smoothie · {deliveryStats.pillCount} pills · {deliveryStats.bothCount} both
                  </p>
                </div>
                <div className="flex rounded-lg border border-white/10 overflow-hidden">
                  {(['all', 'smoothie', 'pill'] as DeliveryMode[]).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setDeliveryMode(mode)}
                      className={`px-4 py-2 text-sm font-medium transition-colors ${
                        deliveryMode === mode
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {mode === 'all' ? '🧬 All' : mode === 'smoothie' ? '🥤 Smoothie' : '💊 Pills'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Smoothie Recipe Toggle */}
              {deliveryMode === 'smoothie' && deliveryStats.hasSmoothieOption && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <button
                    onClick={() => setShowSmoothieRecipe(!showSmoothieRecipe)}
                    className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors flex items-center gap-2"
                  >
                    {showSmoothieRecipe ? 'Hide' : 'Show'} Smoothie Recipe
                    <svg className={`w-4 h-4 transition-transform ${showSmoothieRecipe ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showSmoothieRecipe && smoothieRecipe.ingredients.length > 0 && (
                    <div className="mt-3 p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
                      <h3 className="text-sm font-semibold text-green-400 mb-3">Daily Smoothie Recipe</h3>
                      <div className="space-y-2">
                        {smoothieRecipe.ingredients.map((ing, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-slate-300">{ing.name}</span>
                            <span className="text-slate-500">{ing.amount}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-green-500/20 flex justify-between text-xs text-slate-500">
                        <span>Prep: {smoothieRecipe.estimatedPrepTime}</span>
                        <span>Cost: ${smoothieRecipe.totalCostPerServing.toFixed(2)}/day</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Category Coverage */}
            <div className="glass-card p-6 mb-8">
              <h2 className="text-lg font-semibold mb-4 text-slate-100">Category Coverage</h2>
              <div className="space-y-3">
                {categoryBreakdown.map(cat => (
                  <div key={cat.category}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-slate-300">{cat.category}</span>
                      <span className="text-sm text-slate-400">{cat.count} compounds ({cat.percentage}%)</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2 border border-white/10">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all shadow-lg shadow-blue-500/40" style={{ width: `${cat.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tier Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {tierBreakdown.map(tier => {
                const config = tierConfig[tier.tier as keyof typeof tierConfig];
                return (
                  <div key={tier.tier} className={`glass-card ${config.bgColor} border ${config.borderColor} rounded-lg p-4 text-center`}>
                    <p className={`text-sm font-semibold ${config.textColor} mb-2`}>{tier.label}</p>
                    <p className="text-2xl font-bold text-white">{tier.count}</p>
                    <p className="text-xs text-slate-400 mt-2">Tier {tier.tier}</p>
                  </div>
                );
              })}
            </div>

            {/* Compounds by Tier - Collapsible */}
            <div className="space-y-4 mb-12">
              {[1, 2, 3, 4].map(tierNum => {
                const compounds = compoundsByTier[tierNum as keyof typeof compoundsByTier] || [];
                if (compounds.length === 0) return null;
                const config = tierConfig[tierNum as keyof typeof tierConfig];
                const isExpanded = expandedTiers.has(tierNum);

                return (
                  <div key={tierNum}>
                    <button onClick={() => toggleTierExpanded(tierNum)} className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${config.borderColor} ${config.bgColor}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full bg-${config.color}-500`} />
                        <h3 className={`text-lg font-semibold ${config.textColor}`}>{config.label} ({compounds.length})</h3>
                      </div>
                      <svg className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </button>
                    {isExpanded && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {compounds.map(compound => (
                          <div key={compound.id} className={`glass-card ${config.bgColor} border ${config.borderColor} rounded-lg p-4 flex justify-between items-start`}>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-white">{compound.name}</h4>
                                <span className="text-xs">{getDeliveryIcon(compound)}</span>
                              </div>
                              <div className="flex flex-wrap gap-2 mb-3">
                                <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">{compound.category}</span>
                                <span className={`text-xs px-2 py-1 rounded ${compound.takingToday ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-600 text-slate-400'}`}>
                                  {compound.takingToday ? 'Active' : 'Optional'}
                                </span>
                              </div>
                              <div className="text-sm text-slate-400 space-y-1">
                                <p>Impact: {compound.longevityImpact}/10</p>
                                <p>Efficiency: {compound.efficiencyScore}/10</p>
                                <p className="text-blue-400 font-semibold">${compound.pricePerDay.toFixed(2)}/day</p>
                              </div>
                              {compound.amazonLink && (
                                <a href={compound.amazonLink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 mt-2 inline-block">
                                  View on Amazon →
                                </a>
                              )}
                            </div>
                            <button onClick={() => removeCompound(compound.id)} className="ml-4 px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded text-sm font-semibold transition-colors border border-rose-500/30">
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
            <div className="flex flex-col gap-4 pt-8 border-t border-slate-700">
              {/* Top row: Export actions */}
              <div className="flex flex-wrap gap-3">
                <button onClick={handleSaveToCloud} disabled={isSaving} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-400 hover:to-violet-400 text-white font-semibold rounded-lg transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  {isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save to Cloud'}
                </button>
                <button onClick={handleExportPDF} disabled={isExporting} className="flex items-center gap-2 px-5 py-2.5 glass-subtle bg-white/10 hover:bg-white/15 rounded-lg font-semibold transition-colors border border-white/10 hover:border-white/20 disabled:opacity-50 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  {isExporting ? 'Generating...' : 'Export PDF'}
                </button>
                <button onClick={handleShareCard} disabled={isSharing} className="flex items-center gap-2 px-5 py-2.5 glass-subtle bg-white/10 hover:bg-white/15 rounded-lg font-semibold transition-colors border border-white/10 hover:border-white/20 disabled:opacity-50 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                  {isSharing ? 'Sharing...' : 'Share Card'}
                </button>
              </div>

              {/* Bottom row: Navigation */}
              <div className="flex flex-wrap gap-3 justify-between">
                <button onClick={clearProtocol} className="px-5 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-lg font-semibold transition-colors border border-rose-500/30 text-sm">
                  Clear Protocol
                </button>
                <Link href="/browse" className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold transition-colors text-sm">
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
