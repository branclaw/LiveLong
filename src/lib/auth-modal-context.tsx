'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

type AuthView = 'signin' | 'signup' | 'reset' | 'reset-sent';

interface AuthModalContextType {
  isOpen: boolean;
  initialView: AuthView;
  openAuthModal: (view?: AuthView) => void;
  closeAuthModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialView, setInitialView] = useState<AuthView>('signin');

  const openAuthModal = useCallback((view: AuthView = 'signin') => {
    setInitialView(view);
    setIsOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <AuthModalContext.Provider value={{ isOpen, initialView, openAuthModal, closeAuthModal }}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error('useAuthModal must be used within AuthModalProvider');
  }
  return context;
}
