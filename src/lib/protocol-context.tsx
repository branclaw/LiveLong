'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo, useEffect } from 'react';
import { Compound } from '@/types';
import { getAllCompounds, calculateProtocolCost } from './data';
import { saveProtocol, loadProtocols, deleteProtocol } from './supabase-helpers';

interface SavedProtocol {
  id: string;
  name: string;
  compoundIds: number[];
  totalDailyCost: number;
  totalMonthlyCost: number;
  longevityScore: number;
  createdAt: string;
}

interface ProtocolContextType {
  selectedCompoundIds: Set<number>;
  toggleCompound: (id: number) => void;
  addCompound: (id: number) => void;
  removeCompound: (id: number) => void;
  clearProtocol: () => void;
  getSelectedCompounds: () => Compound[];
  totalDailyCost: number;
  totalMonthlyCost: number;
  saveToCloud: (name: string, score: number) => Promise<string | null>;
  loadSavedProtocols: () => Promise<SavedProtocol[]>;
  deleteSavedProtocol: (id: string) => Promise<boolean>;
}

const ProtocolContext = createContext<ProtocolContextType | undefined>(undefined);

interface ProtocolProviderProps {
  children: ReactNode;
}

export function ProtocolProvider({ children }: ProtocolProviderProps) {
  const [selectedCompoundIds, setSelectedCompoundIds] = useState<Set<number>>(new Set());
  const [isHydrated, setIsHydrated] = useState(false);

  // Load protocol from localStorage on mount
  useEffect(() => {
    const loadProtocolFromStorage = () => {
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('longevity_selected_compounds');
        if (cached) {
          try {
            const ids = JSON.parse(cached);
            setSelectedCompoundIds(new Set(ids));
          } catch (e) {
            console.warn('Failed to parse cached compounds:', e);
          }
        }
      }
      setIsHydrated(true);
    };

    loadProtocolFromStorage();
  }, []);

  // Save to localStorage whenever compounds change
  useEffect(() => {
    if (isHydrated && typeof window !== 'undefined') {
      try {
        localStorage.setItem('longevity_selected_compounds', JSON.stringify(Array.from(selectedCompoundIds)));
      } catch (e) {
        console.warn('Failed to save compounds to localStorage:', e);
      }
    }
  }, [selectedCompoundIds, isHydrated]);

  const toggleCompound = useCallback((id: number) => {
    setSelectedCompoundIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const addCompound = useCallback((id: number) => {
    setSelectedCompoundIds(prev => new Set(prev).add(id));
  }, []);

  const removeCompound = useCallback((id: number) => {
    setSelectedCompoundIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const clearProtocol = useCallback(() => {
    setSelectedCompoundIds(new Set());
  }, []);

  const getSelectedCompounds = useCallback((): Compound[] => {
    const all = getAllCompounds();
    return all.filter(c => selectedCompoundIds.has(c.id));
  }, [selectedCompoundIds]);

  const costs = useMemo(() => {
    return calculateProtocolCost(Array.from(selectedCompoundIds));
  }, [selectedCompoundIds]);

  const saveToCloud = useCallback(async (name: string, score: number): Promise<string | null> => {
    const protocolId = await saveProtocol(name, Array.from(selectedCompoundIds), costs, score);
    return protocolId;
  }, [selectedCompoundIds, costs]);

  const loadSavedProtocols = useCallback(async (): Promise<SavedProtocol[]> => {
    return await loadProtocols();
  }, []);

  const deleteSavedProtocol = useCallback(async (id: string): Promise<boolean> => {
    return await deleteProtocol(id);
  }, []);

  const value: ProtocolContextType = {
    selectedCompoundIds,
    toggleCompound,
    addCompound,
    removeCompound,
    clearProtocol,
    getSelectedCompounds,
    totalDailyCost: costs.daily,
    totalMonthlyCost: costs.monthly,
    saveToCloud,
    loadSavedProtocols,
    deleteSavedProtocol,
  };

  return (
    <ProtocolContext.Provider value={value}>
      {isHydrated ? children : null}
    </ProtocolContext.Provider>
  );
}

export function useProtocol() {
  const context = useContext(ProtocolContext);
  if (context === undefined) {
    throw new Error('useProtocol must be used within a ProtocolProvider');
  }
  return context;
}
