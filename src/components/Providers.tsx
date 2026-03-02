'use client';

import React from 'react';
import { ProtocolProvider } from '@/lib/protocol-context';
import { OnboardingProvider } from '@/lib/onboarding-context';
import { AuthProvider } from '@/lib/auth-context';
import { AuthModalProvider } from '@/lib/auth-modal-context';
import { AuthModal } from '@/components/AuthModal';
import { AuthModalRenderer } from '@/components/AuthModalRenderer';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthModalProvider>
        <OnboardingProvider>
          <ProtocolProvider>
            {children}
            <AuthModalRenderer />
          </ProtocolProvider>
        </OnboardingProvider>
      </AuthModalProvider>
    </AuthProvider>
  );
}
