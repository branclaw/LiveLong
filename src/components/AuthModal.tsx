'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

type AuthView = 'signin' | 'signup' | 'reset' | 'reset-sent';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: AuthView;
}

export function AuthModal({ isOpen, onClose, initialView = 'signin' }: AuthModalProps) {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, resetPassword, authError, clearError, loading } = useAuth();
  const [view, setView] = useState<AuthView>(initialView);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setView(initialView);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setLocalError(null);
      clearError();
    }
  }, [isOpen, initialView, clearError]);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleSignIn = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!email || !password) {
      setLocalError('Please fill in all fields.');
      return;
    }
    setIsSubmitting(true);
    try {
      await signInWithEmail(email, password);
      onClose();
    } catch {
      // Error is set in auth context
    } finally {
      setIsSubmitting(false);
    }
  }, [email, password, signInWithEmail, onClose]);

  const handleSignUp = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!email || !password) {
      setLocalError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }
    setIsSubmitting(true);
    try {
      await signUpWithEmail(email, password);
      onClose();
    } catch {
      // Error is set in auth context
    } finally {
      setIsSubmitting(false);
    }
  }, [email, password, confirmPassword, signUpWithEmail, onClose]);

  const handleReset = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!email) {
      setLocalError('Please enter your email address.');
      return;
    }
    setIsSubmitting(true);
    try {
      await resetPassword(email);
      setView('reset-sent');
    } catch {
      // Error is set in auth context
    } finally {
      setIsSubmitting(false);
    }
  }, [email, resetPassword]);

  const handleGoogleSignIn = useCallback(async () => {
    setLocalError(null);
    try {
      await signInWithGoogle();
      // OAuth redirects, so no need to close
    } catch {
      setLocalError('Google sign-in failed. Please try again.');
    }
  }, [signInWithGoogle]);

  const switchView = (newView: AuthView) => {
    setView(newView);
    setLocalError(null);
    clearError();
  };

  const displayError = localError || authError?.message;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 glass-card border border-blue-500/20 rounded-2xl p-8 animate-[fadeInUp_0.3s_ease-out] shadow-2xl shadow-blue-500/10">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Logo */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-violet-400 to-blue-300 bg-clip-text text-transparent">
            The Longevity Navigator
          </h2>
        </div>

        {/* Sign In View */}
        {view === 'signin' && (
          <>
            <h3 className="text-2xl font-bold text-white text-center mb-2">Welcome back</h3>
            <p className="text-slate-400 text-center text-sm mb-6">Sign in to access your protocols</p>

            {/* Google OAuth */}
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors mb-4 font-medium text-white"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-slate-500 uppercase">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Email form */}
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/50 transition-colors"
                  autoComplete="email"
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/50 transition-colors"
                  autoComplete="current-password"
                />
              </div>

              {displayError && (
                <div className="text-rose-400 text-sm bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-2">
                  {displayError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-400 hover:to-violet-400 text-white font-semibold rounded-lg transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-4 text-center space-y-2">
              <button
                onClick={() => switchView('reset')}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Forgot your password?
              </button>
              <p className="text-sm text-slate-400">
                Don't have an account?{' '}
                <button onClick={() => switchView('signup')} className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  Sign up
                </button>
              </p>
            </div>
          </>
        )}

        {/* Sign Up View */}
        {view === 'signup' && (
          <>
            <h3 className="text-2xl font-bold text-white text-center mb-2">Create your account</h3>
            <p className="text-slate-400 text-center text-sm mb-6">Start building your longevity protocol</p>

            {/* Google OAuth */}
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors mb-4 font-medium text-white"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-slate-500 uppercase">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <form onSubmit={handleSignUp} className="space-y-4">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/50 transition-colors"
                autoComplete="email"
              />
              <input
                type="password"
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/50 transition-colors"
                autoComplete="new-password"
              />
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/50 transition-colors"
                autoComplete="new-password"
              />

              {displayError && (
                <div className="text-rose-400 text-sm bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-2">
                  {displayError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-400 hover:to-violet-400 text-white font-semibold rounded-lg transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p className="mt-4 text-sm text-slate-400 text-center">
              Already have an account?{' '}
              <button onClick={() => switchView('signin')} className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Sign in
              </button>
            </p>
          </>
        )}

        {/* Reset Password View */}
        {view === 'reset' && (
          <>
            <h3 className="text-2xl font-bold text-white text-center mb-2">Reset password</h3>
            <p className="text-slate-400 text-center text-sm mb-6">Enter your email and we'll send you a reset link</p>

            <form onSubmit={handleReset} className="space-y-4">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/50 transition-colors"
                autoComplete="email"
              />

              {displayError && (
                <div className="text-rose-400 text-sm bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-2">
                  {displayError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-400 hover:to-violet-400 text-white font-semibold rounded-lg transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <p className="mt-4 text-sm text-slate-400 text-center">
              <button onClick={() => switchView('signin')} className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Back to sign in
              </button>
            </p>
          </>
        )}

        {/* Reset Sent Confirmation */}
        {view === 'reset-sent' && (
          <div className="text-center py-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 border border-blue-500/40 mb-4">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Check your email</h3>
            <p className="text-slate-400 text-sm mb-6">
              We've sent a password reset link to <span className="text-blue-400">{email}</span>
            </p>
            <button
              onClick={() => switchView('signin')}
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Back to sign in
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
