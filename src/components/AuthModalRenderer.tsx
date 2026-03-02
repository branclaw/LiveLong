'use client';

import React from 'react';
import { useAuthModal } from '@/lib/auth-modal-context';
import { AuthModal } from './AuthModal';

export function AuthModalRenderer() {
  const { isOpen, initialView, closeAuthModal } = useAuthModal();
  return <AuthModal isOpen={isOpen} onClose={closeAuthModal} initialView={initialView} />;
}
