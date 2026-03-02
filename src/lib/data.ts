import compoundsData from '@/data/compounds.json';
import { Compound, FilterState, SortField, SortDirection } from '@/types';

const compounds: Compound[] = compoundsData as Compound[];

export function getAllCompounds(): Compound[] {
  return compounds;
}

export function getCompoundById(id: number): Compound | undefined {
  return compounds.find(c => c.id === id);
}

export function getCompoundsByTier(tierNumber: number): Compound[] {
  return compounds.filter(c => c.tierNumber === tierNumber);
}

export function getCompoundsByCategory(category: string): Compound[] {
  return compounds.filter(c => (c.category ?? '').toLowerCase() === category.toLowerCase());
}

export function getCompoundsBySource(source: string): Compound[] {
  return compounds.filter(c => (c.source ?? '').toLowerCase().includes(source.toLowerCase()));
}

export function getCurrentStack(): Compound[] {
  return compounds.filter(c => c.takingToday);
}

export function getUniqueCategories(): string[] {
  return [...new Set(compounds.map(c => c.category))].sort();
}

export function getUniqueSources(): string[] {
  return [...new Set(compounds.map(c => c.source))].sort();
}

export function filterAndSortCompounds(filters: Partial<FilterState>): Compound[] {
  let result = [...compounds];

  if (filters.tiers && filters.tiers.length > 0) {
    result = result.filter(c => filters.tiers!.includes(c.tierNumber as 1|2|3|4));
  }

  if (filters.categories && filters.categories.length > 0) {
    result = result.filter(c => filters.categories!.includes(c.category));
  }

  if (filters.sources && filters.sources.length > 0) {
    result = result.filter(c => filters.sources!.some(s => (c.source ?? '').toLowerCase().includes(s.toLowerCase())));
  }

  if (filters.maxPrice && filters.maxPrice > 0) {
    result = result.filter(c => c.pricePerDay <= filters.maxPrice!);
  }

  if (filters.searchQuery && filters.searchQuery.trim()) {
    const q = filters.searchQuery.toLowerCase();
    result = result.filter(c =>
      (c.name ?? '').toLowerCase().includes(q) ||
      (c.category ?? '').toLowerCase().includes(q) ||
      (c.primaryFunction ?? '').toLowerCase().includes(q)
    );
  }

  if (filters.takingToday !== null && filters.takingToday !== undefined) {
    result = result.filter(c => c.takingToday === filters.takingToday);
  }

  const sortBy = filters.sortBy || 'longevityImpact';
  const sortDir = filters.sortDirection || 'desc';
  
  result.sort((a, b) => {
    let aVal = a[sortBy] as number | string;
    let bVal = b[sortBy] as number | string;
    
    if (typeof aVal === 'string') {
      return sortDir === 'asc' 
        ? aVal.localeCompare(bVal as string) 
        : (bVal as string).localeCompare(aVal);
    }
    
    return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  return result;
}

export function calculateProtocolCost(compoundIds: number[]): { daily: number; monthly: number } {
  const selected = compounds.filter(c => compoundIds.includes(c.id));
  const daily = selected.reduce((sum, c) => sum + c.pricePerDay, 0);
  return { daily: Math.round(daily * 100) / 100, monthly: Math.round(daily * 30 * 100) / 100 };
}

export function getStats() {
  return {
    total: compounds.length,
    byTier: {
      1: compounds.filter(c => c.tierNumber === 1).length,
      2: compounds.filter(c => c.tierNumber === 2).length,
      3: compounds.filter(c => c.tierNumber === 3).length,
      4: compounds.filter(c => c.tierNumber === 4).length,
    },
    categories: getUniqueCategories().length,
    currentStack: getCurrentStack().length,
    avgEfficiency: Math.round(compounds.reduce((s, c) => s + c.efficiencyScore, 0) / compounds.length * 10) / 10,
  };
}
