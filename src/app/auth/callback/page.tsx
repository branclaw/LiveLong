'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check for error in query params
        const urlParams = new URLSearchParams(window.location.search);
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');

        if (error) {
          setStatus('error');
          setErrorMessage(errorDescription || error);
          return;
        }

        // Check for code param (PKCE flow)
        const code = urlParams.get('code');
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            setStatus('error');
            setErrorMessage(exchangeError.message);
            return;
          }
          setStatus('success');
          const next = urlParams.get('next') || '/dashboard';
          router.replace(next);
          return;
        }

        // Check for hash fragment (implicit flow) — Supabase client handles this automatically
        // The hash contains access_token, refresh_token, etc.
        const hash = window.location.hash;
        if (hash && hash.includes('access_token')) {
          // Supabase JS client auto-detects hash tokens via onAuthStateChange
          // Wait briefly for the session to be established
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();

          if (sessionError) {
            setStatus('error');
            setErrorMessage(sessionError.message);
            return;
          }

          if (session) {
            setStatus('success');
            router.replace('/dashboard');
            return;
          }

          // If session not ready yet, wait for auth state change
          const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
              setStatus('success');
              subscription.unsubscribe();
              router.replace('/dashboard');
            }
          });

          // Timeout after 5 seconds
          setTimeout(() => {
            subscription.unsubscribe();
            setStatus('error');
            setErrorMessage('Authentication timed out. Please try again.');
          }, 5000);
          return;
        }

        // No code or hash — try to get existing session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setStatus('success');
          router.replace('/dashboard');
          return;
        }

        setStatus('error');
        setErrorMessage('No authentication data found.');
      } catch (e: any) {
        setStatus('error');
        setErrorMessage(e?.message || 'An unexpected error occurred.');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        {status === 'loading' && (
          <>
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-6" />
            <h1 className="text-xl font-semibold text-white mb-2">Signing you in...</h1>
            <p className="text-slate-400">Please wait while we verify your account.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-12 h-12 bg-blue-500/20 border border-blue-500/40 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-white mb-2">Signed in!</h1>
            <p className="text-slate-400">Redirecting to your dashboard...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-12 h-12 bg-rose-500/20 border border-rose-500/40 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-white mb-2">Sign-in failed</h1>
            <p className="text-slate-400 mb-6">{errorMessage}</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-400 hover:to-violet-400 text-white font-semibold rounded-lg transition-all shadow-lg shadow-blue-500/30"
            >
              Go Home
            </button>
          </>
        )}
      </div>
    </div>
  );
}
