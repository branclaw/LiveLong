import { Compound } from '@/types';
import { getAllCompounds } from './data';

interface CompetitorProduct {
  name: string;
  pricePerDay: number;
  pricePerMonth: number;
  ingredients: { name: string; dose: string; optimalDose: string; percentage: number }[];
  efficiencyScore: number;
  description: string;
}

const COMPETITORS: CompetitorProduct[] = [
  {
    name: 'AG1 (Athletic Greens)',
    pricePerDay: 2.63,
    pricePerMonth: 79.00,
    ingredients: [
      { name: 'Vitamin D', dose: '50mcg', optimalDose: '125mcg (5000IU)', percentage: 40 },
      { name: 'Ashwagandha', dose: '~100mg (blend)', optimalDose: '600mg', percentage: 17 },
      { name: 'CoQ10', dose: '~10mg (blend)', optimalDose: '200mg', percentage: 5 },
      { name: 'Rhodiola', dose: '~50mg (blend)', optimalDose: '400mg', percentage: 13 },
      { name: 'Probiotics', dose: '7.2B CFU', optimalDose: '50B+ CFU', percentage: 14 },
    ],
    efficiencyScore: 2.1,
    description: 'Premium greens powder marketed as all-in-one nutrition. Uses proprietary blends that hide individual ingredient doses.',
  },
  {
    name: "Ka'Chava",
    pricePerDay: 4.66,
    pricePerMonth: 139.80,
    ingredients: [
      { name: 'Plant Protein', dose: '25g', optimalDose: '30g+', percentage: 83 },
      { name: 'Probiotics', dose: '~1B CFU', optimalDose: '50B+ CFU', percentage: 2 },
      { name: 'Ashwagandha', dose: 'trace', optimalDose: '600mg', percentage: 5 },
      { name: 'Reishi', dose: 'trace', optimalDose: '1000mg', percentage: 3 },
      { name: 'Chlorella', dose: 'trace', optimalDose: '3000mg', percentage: 2 },
    ],
    efficiencyScore: 1.0,
    description: 'Meal replacement shake with added superfoods. Trace amounts of most longevity compounds.',
  },
  {
    name: 'Ritual Essential',
    pricePerDay: 1.17,
    pricePerMonth: 35.00,
    ingredients: [
      { name: 'Vitamin D3', dose: '50mcg', optimalDose: '125mcg', percentage: 40 },
      { name: 'Omega-3 DHA', dose: '330mg', optimalDose: '2000mg+', percentage: 17 },
      { name: 'Iron', dose: '8mg', optimalDose: '18mg', percentage: 44 },
      { name: 'Folate', dose: '1000mcg', optimalDose: '1000mcg', percentage: 100 },
      { name: 'B12', dose: '8mcg', optimalDose: '1000mcg', percentage: 1 },
    ],
    efficiencyScore: 3.2,
    description: 'Minimalist multivitamin focused on nutrient gaps. Good for basics but lacks longevity-specific compounds.',
  },
];

export interface ComparisonResult {
  competitor: CompetitorProduct;
  userProtocol: {
    compounds: Compound[];
    totalDailyCost: number;
    totalMonthlyCost: number;
    avgEfficiency: number;
  };
  savings: {
    daily: number;
    monthly: number;
    yearly: number;
  };
  efficiencyGain: number; // multiplier (e.g., 3.2x more efficient)
  overlapCount: number; // how many competitor ingredients the user's protocol covers
}

export function compareWithCompetitor(
  selectedCompounds: Compound[],
  competitorName: string
): ComparisonResult | null {
  const competitor = COMPETITORS.find(c => c.name === competitorName);
  if (!competitor) return null;

  const totalDailyCost = selectedCompounds.reduce((s, c) => s + c.pricePerDay, 0);
  const totalMonthlyCost = Math.round(totalDailyCost * 30 * 100) / 100;
  const avgEfficiency = selectedCompounds.length > 0
    ? selectedCompounds.reduce((s, c) => s + c.efficiencyScore, 0) / selectedCompounds.length
    : 0;

  // Count category overlaps
  const userCategories = new Set(selectedCompounds.map(c => c.category.toLowerCase()));
  const overlapCount = competitor.ingredients.filter(ing => {
    const nameLC = ing.name.toLowerCase();
    return selectedCompounds.some(c => c.name.toLowerCase().includes(nameLC) || nameLC.includes(c.category.toLowerCase()));
  }).length;

  const dailySavings = competitor.pricePerDay - totalDailyCost;

  return {
    competitor,
    userProtocol: {
      compounds: selectedCompounds,
      totalDailyCost: Math.round(totalDailyCost * 100) / 100,
      totalMonthlyCost,
      avgEfficiency: Math.round(avgEfficiency * 10) / 10,
    },
    savings: {
      daily: Math.round(dailySavings * 100) / 100,
      monthly: Math.round(dailySavings * 30 * 100) / 100,
      yearly: Math.round(dailySavings * 365 * 100) / 100,
    },
    efficiencyGain: competitor.efficiencyScore > 0
      ? Math.round((avgEfficiency / competitor.efficiencyScore) * 10) / 10
      : 0,
    overlapCount,
  };
}

export function getAllCompetitors(): CompetitorProduct[] {
  return COMPETITORS;
}

export function getCompetitorNames(): string[] {
  return COMPETITORS.map(c => c.name);
}
