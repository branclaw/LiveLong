import { Compound } from '@/types';

// Calculate protocol efficiency score (0-100)
export function calculateProtocolScore(compounds: Compound[]): number {
  if (compounds.length === 0) return 0;
  
  // Weighted factors:
  // 40% - Average longevity impact (0-10 scaled to 0-40)
  // 25% - Tier coverage (having Tier 1 essentials)
  // 20% - Category diversity (covering more health areas)
  // 15% - Efficiency score (bang for buck)
  
  const avgImpact = compounds.reduce((s, c) => s + c.longevityImpact, 0) / compounds.length;
  const impactScore = (avgImpact / 10) * 40;
  
  // Tier coverage: bonus for having Tier 1 items
  const tier1Count = compounds.filter(c => c.tierNumber === 1).length;
  const tier1Total = 8; // total tier 1 items in database
  const tierScore = Math.min((tier1Count / tier1Total) * 25, 25);
  
  // Category diversity
  const uniqueCategories = new Set(compounds.map(c => c.category)).size;
  const totalCategories = 24;
  const diversityScore = Math.min((uniqueCategories / totalCategories) * 30, 20); // cap at 20
  
  // Avg efficiency
  const avgEfficiency = compounds.reduce((s, c) => s + c.efficiencyScore, 0) / compounds.length;
  const effScore = (avgEfficiency / 10) * 15;
  
  return Math.min(Math.round(impactScore + tierScore + diversityScore + effScore), 100);
}

// Calculate category breakdown for protocol
export function getCategoryBreakdown(compounds: Compound[]): { category: string; count: number; percentage: number }[] {
  const counts: Record<string, number> = {};
  compounds.forEach(c => { counts[c.category] = (counts[c.category] || 0) + 1; });
  const total = compounds.length;
  return Object.entries(counts)
    .map(([category, count]) => ({ category, count, percentage: Math.round((count / total) * 100) }))
    .sort((a, b) => b.count - a.count);
}

// Calculate tier breakdown
export function getTierBreakdown(compounds: Compound[]): { tier: number; label: string; count: number; color: string }[] {
  const tierLabels: Record<number, { label: string; color: string }> = {
    1: { label: 'Essential', color: 'blue' },
    2: { label: 'Impactful', color: 'blue' },
    3: { label: 'Nice to Have', color: 'amber' },
    4: { label: 'Not Worth It', color: 'slate' },
  };
  return [1, 2, 3, 4].map(tier => ({
    tier,
    ...tierLabels[tier],
    count: compounds.filter(c => c.tierNumber === tier).length,
  }));
}
