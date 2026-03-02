'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useOnboarding } from '@/lib/onboarding-context';
import { useProtocol } from '@/lib/protocol-context';
import { useAuthModal } from '@/lib/auth-modal-context';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, signOut } = useAuth();
  const { profile, isComplete } = useOnboarding();
  const { selectedCompoundIds, totalDailyCost, totalMonthlyCost } = useProtocol();
  const { openAuthModal } = useAuthModal();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      router.push('/');
    } catch {
      setIsSigningOut(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#030712] text-white pt-4">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="glass-card p-12 text-center rounded-xl border border-blue-500/20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 border border-blue-500/40 mb-6">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Sign in to view your profile</h1>
            <p className="text-slate-400 mb-6">Access your account settings, saved protocols, and health profile.</p>
            <button
              onClick={() => openAuthModal('signin')}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-400 hover:to-violet-400 text-white font-semibold rounded-lg transition-all shadow-lg shadow-blue-500/30"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  const joinDate = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown';

  return (
    <div className="min-h-screen bg-[#030712] text-white pt-4">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Account Settings</h1>
          <p className="text-slate-400">Manage your profile, health goals, and preferences.</p>
        </div>

        {/* Account Card */}
        <div className="glass-card p-6 rounded-xl border border-blue-500/20 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-500/30">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">{user?.user_metadata?.full_name || user?.email?.split('@')[0]}</h2>
              <p className="text-sm text-slate-400">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <p className="text-xs text-slate-500 mb-1">Member since</p>
              <p className="text-sm text-white font-medium">{joinDate}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <p className="text-xs text-slate-500 mb-1">Auth provider</p>
              <p className="text-sm text-white font-medium capitalize">{user?.app_metadata?.provider || 'Email'}</p>
            </div>
          </div>
        </div>

        {/* Protocol Summary */}
        <div className="glass-card p-6 rounded-xl border border-blue-500/20 mb-6">
          <h2 className="text-sm font-semibold text-blue-400 mb-4 uppercase tracking-wide">Current Protocol</h2>
          {selectedCompoundIds.size > 0 ? (
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{selectedCompoundIds.size}</p>
                <p className="text-xs text-slate-500">Compounds</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">${totalDailyCost.toFixed(2)}</p>
                <p className="text-xs text-slate-500">Daily</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-300">${totalMonthlyCost.toFixed(2)}</p>
                <p className="text-xs text-slate-500">Monthly</p>
              </div>
            </div>
          ) : (
            <p className="text-slate-400 text-sm mb-4">No compounds selected yet.</p>
          )}
          <Link href="/protocol" className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors">
            {selectedCompoundIds.size > 0 ? 'View Protocol →' : 'Build Protocol →'}
          </Link>
        </div>

        {/* Health Profile */}
        <div className="glass-card p-6 rounded-xl border border-blue-500/20 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wide">Health Profile</h2>
            <Link href="/onboarding" className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">
              {isComplete ? 'Edit Profile →' : 'Complete Profile →'}
            </Link>
          </div>

          {isComplete ? (
            <div className="space-y-4">
              {profile.goals.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 mb-2">Goals</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.goals.map(goal => (
                      <span key={goal} className="px-3 py-1 bg-blue-500/15 border border-blue-500/30 rounded-lg text-xs text-blue-300 font-medium">
                        {goal.charAt(0).toUpperCase() + goal.slice(1).replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {profile.age && (
                  <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                    <p className="text-xs text-slate-500">Age</p>
                    <p className="text-sm text-white font-medium">{profile.age}</p>
                  </div>
                )}
                {profile.sex && (
                  <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                    <p className="text-xs text-slate-500">Sex</p>
                    <p className="text-sm text-white font-medium capitalize">{profile.sex}</p>
                  </div>
                )}
                {profile.activityLevel && (
                  <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                    <p className="text-xs text-slate-500">Activity</p>
                    <p className="text-sm text-white font-medium capitalize">{profile.activityLevel}</p>
                  </div>
                )}
                {profile.monthlyBudget && (
                  <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                    <p className="text-xs text-slate-500">Budget</p>
                    <p className="text-sm text-white font-medium">${profile.monthlyBudget}/mo</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-slate-400 text-sm">Complete your health profile to get personalized recommendations.</p>
          )}
        </div>

        {/* Sign Out */}
        <div className="glass-card p-6 rounded-xl border border-rose-500/20">
          <h2 className="text-sm font-semibold text-slate-300 mb-2">Sign Out</h2>
          <p className="text-sm text-slate-400 mb-4">Your protocol data is saved locally and will sync when you sign back in.</p>
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="px-5 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-lg font-semibold transition-colors border border-rose-500/30 text-sm disabled:opacity-50"
          >
            {isSigningOut ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      </div>
    </div>
  );
}
