'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useProtocol } from '@/lib/protocol-context';
import { useOnboarding } from '@/lib/onboarding-context';
import { calculateProtocolScore, getCategoryBreakdown, getTierBreakdown } from '@/lib/calculations';
import { getDeliveryStats } from '@/lib/delivery-modes';
import { LongevityGauge } from '@/components/LongevityGauge';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const { getSelectedCompounds, totalDailyCost, totalMonthlyCost, selectedCompoundIds } = useProtocol();
  const { profile, isComplete } = useOnboarding();

  const selectedCompounds = getSelectedCompounds();
  const protocolScore = useMemo(() => calculateProtocolScore(selectedCompounds), [selectedCompounds]);
  const categoryBreakdown = useMemo(() => getCategoryBreakdown(selectedCompounds), [selectedCompounds]);
  const tierBreakdown = useMemo(() => getTierBreakdown(selectedCompounds), [selectedCompounds]);
  const deliveryStats = useMemo(() => getDeliveryStats(selectedCompounds), [selectedCompounds]);

  const topCategories = categoryBreakdown.slice(0, 5);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there';

  return (
    <div className="min-h-screen bg-[#030712] text-white pt-4">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Greeting */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-1">
            {greeting()}, <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">{displayName}</span>
          </h1>
          <p className="text-slate-400">
            {selectedCompounds.length > 0
              ? `Your protocol has ${selectedCompounds.length} compound${selectedCompounds.length !== 1 ? 's' : ''} — here's the overview.`
              : 'Start building your longevity protocol today.'}
          </p>
        </div>

        {selectedCompounds.length === 0 ? (
          /* Empty State */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Get Started Card */}
            <div className="glass-card p-8 border border-blue-500/20 rounded-xl">
              <div className="text-3xl mb-4">🧬</div>
              <h2 className="text-xl font-bold text-white mb-2">Build Your Protocol</h2>
              <p className="text-slate-400 mb-6">Browse 112 compounds ranked by peer-reviewed science and build a personalized supplement stack.</p>
              <Link href="/browse" className="inline-flex px-5 py-2.5 bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-400 hover:to-violet-400 text-white font-semibold rounded-lg transition-all shadow-lg shadow-blue-500/30 text-sm">
                Browse Compounds
              </Link>
            </div>

            {/* Recommendations Card */}
            <div className="glass-card p-8 border border-blue-500/20 rounded-xl">
              <div className="text-3xl mb-4">🎯</div>
              <h2 className="text-xl font-bold text-white mb-2">Get Recommendations</h2>
              <p className="text-slate-400 mb-6">
                {isComplete
                  ? 'View AI recommendations based on your health goals and profile.'
                  : 'Complete your onboarding profile to get personalized recommendations.'}
              </p>
              <Link href={isComplete ? '/recommend' : '/onboarding'} className="inline-flex px-5 py-2.5 glass-subtle bg-white/10 hover:bg-white/15 text-white font-semibold rounded-lg transition-colors border border-white/10 hover:border-white/20 text-sm">
                {isComplete ? 'View Recommendations' : 'Start Onboarding'}
              </Link>
            </div>

            {/* Goals Quick View */}
            {isComplete && profile.goals.length > 0 && (
              <div className="glass-card p-8 border border-blue-500/20 rounded-xl md:col-span-2">
                <h2 className="text-sm font-semibold text-blue-400 mb-3 uppercase tracking-wide">Your Health Goals</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.goals.map(goal => (
                    <span key={goal} className="px-3 py-1.5 bg-blue-500/15 border border-blue-500/30 rounded-lg text-sm text-blue-300 font-medium">
                      {goal.charAt(0).toUpperCase() + goal.slice(1).replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Active Protocol Dashboard */
          <>
            {/* Top: Score + Quick Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
              {/* Gauge */}
              <div className="lg:col-span-1 flex justify-center items-center glass-card p-6 rounded-xl border border-blue-500/20">
                <LongevityGauge score={protocolScore} size="lg" />
              </div>

              {/* Quick Stats */}
              <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Compounds" value={selectedCompounds.length.toString()} gradient="from-blue-400 to-blue-300" />
                <StatCard label="Daily Cost" value={`$${totalDailyCost.toFixed(2)}`} gradient="from-blue-400 to-violet-300" />
                <StatCard label="Monthly Cost" value={`$${totalMonthlyCost.toFixed(2)}`} gradient="from-violet-400 to-violet-300" />
                <StatCard label="Est. Pills/Day" value={deliveryStats.estimatedPillsPerDay.toString()} gradient="from-amber-400 to-amber-300" />
              </div>
            </div>

            {/* Middle Row: Tier + Delivery */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Tier Breakdown */}
              <div className="glass-card p-6 rounded-xl border border-blue-500/20">
                <h2 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wide">Tier Breakdown</h2>
                <div className="grid grid-cols-2 gap-3">
                  {tierBreakdown.map(tier => {
                    const colors: Record<number, string> = {
                      1: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
                      2: 'text-blue-300 bg-blue-500/10 border-blue-500/20',
                      3: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
                      4: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
                    };
                    return (
                      <div key={tier.tier} className={`rounded-lg p-3 border ${colors[tier.tier]}`}>
                        <p className="text-xs font-semibold mb-1">{tier.label}</p>
                        <p className="text-2xl font-bold text-white">{tier.count}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Delivery Mode */}
              <div className="glass-card p-6 rounded-xl border border-blue-500/20">
                <h2 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wide">Delivery Modes</h2>
                <div className="space-y-4">
                  <DeliveryBar label="Smoothie-compatible" count={deliveryStats.smoothieCount} total={selectedCompounds.length} color="bg-green-500" />
                  <DeliveryBar label="Pill / Capsule" count={deliveryStats.pillCount} total={selectedCompounds.length} color="bg-blue-500" />
                  <DeliveryBar label="Both forms" count={deliveryStats.bothCount} total={selectedCompounds.length} color="bg-violet-500" />
                </div>
                {deliveryStats.hasSmoothieOption && (
                  <p className="text-xs text-slate-500 mt-4">Some compounds can be blended into a daily smoothie to reduce pill burden.</p>
                )}
              </div>
            </div>

            {/* Category Coverage */}
            {topCategories.length > 0 && (
              <div className="glass-card p-6 rounded-xl border border-blue-500/20 mb-8">
                <h2 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wide">Top Categories</h2>
                <div className="space-y-3">
                  {topCategories.map(cat => (
                    <div key={cat.category}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-slate-300">{cat.category}</span>
                        <span className="text-xs text-slate-500">{cat.count} ({cat.percentage}%)</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-1.5">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-400 h-1.5 rounded-full transition-all" style={{ width: `${cat.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link href="/protocol" className="glass-card p-5 rounded-xl border border-blue-500/20 hover:border-blue-500/40 transition-all group text-center">
                <div className="text-2xl mb-2">📋</div>
                <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors">View Full Protocol</h3>
                <p className="text-xs text-slate-500 mt-1">See all compounds with details</p>
              </Link>
              <Link href="/recommend" className="glass-card p-5 rounded-xl border border-blue-500/20 hover:border-blue-500/40 transition-all group text-center">
                <div className="text-2xl mb-2">🎯</div>
                <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors">Get Recommendations</h3>
                <p className="text-xs text-slate-500 mt-1">AI-powered compound matching</p>
              </Link>
              <Link href="/compare" className="glass-card p-5 rounded-xl border border-blue-500/20 hover:border-blue-500/40 transition-all group text-center">
                <div className="text-2xl mb-2">📊</div>
                <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors">Compare Stacks</h3>
                <p className="text-xs text-slate-500 mt-1">Your protocol vs. the market</p>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, gradient }: { label: string; value: string; gradient: string }) {
  return (
    <div className="glass-card p-5 rounded-xl border border-blue-500/20">
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      <p className={`text-2xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>{value}</p>
    </div>
  );
}

function DeliveryBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-slate-300">{label}</span>
        <span className="text-xs text-slate-500">{count}</span>
      </div>
      <div className="w-full bg-white/5 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
