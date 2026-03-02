'use client';

import React from 'react';
import { ProtocolProvider } from '@/lib/protocol-context';
import { OnboardingProvider } from '@/lib/onboarding-context';
import { AuthProvider } from '@/lib/auth-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <OnboardingProvider>
        <ProtocolProvider>
          {children}
        </ProtocolProvider>
      </OnboardingProvider>
    </AuthProvider>
  );
}
