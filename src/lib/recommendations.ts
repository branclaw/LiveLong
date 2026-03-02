import { Compound } from '@/types';
import { getAllCompounds } from './data';

// Goal -> Category mappings
const GOAL_CATEGORY_MAP: Record<string, string[]> = {
  'longevity': ['Antioxidant', 'Senolytics', 'Cell Energy', 'Cellular Energy', 'Mitochondria'],
  'performance': ['Metabolic', 'Brain Health', 'Electrolytes'],
  'muscle': ['Metabolic', 'Hormonal'],
  'cognition': ['Brain Health', 'Sleep'],
  'gut_health': ['Gut Health', 'Digestion'],
  'heart': ['Cardio', 'Vascular'],
  'immunity': ['Immunity'],
  'hormones': ['Hormonal'],
  'sleep': ['Sleep'],
  'detox': ['Detox'],
  'aesthetics': ['Structural', 'Vision'],
};

// Biomarker-driven rules (from spec)
interface BiomarkerRule {
  condition: string;
  description: string;
  compoundNames: string[];
  priority: number;
}

const BIOMARKER_RULES: BiomarkerRule[] = [
  { condition: 'apob_high', description: 'ApoB > 80 mg/dL', compoundNames: ['Berberine', 'Nattokinase'], priority: 1 },
  { condition: 'hscrp_high', description: 'hs-CRP > 1.0 mg/L', compoundNames: ['Sulforaphane', 'Qunol Turmeric'], priority: 1 },
  { condition: 'muscle_goal', description: 'Muscle Growth Goal', compoundNames: ['Naked EAAs', 'Naked Creatine', 'Naked Pea Protein (1/2 scoop)'], priority: 1 },
  { condition: 'low_vitamin_d', description: 'Vitamin D < 50 ng/mL', compoundNames: ['Vitamin D3+K2'], priority: 1 },
  { condition: 'low_testosterone', description: 'Low Free Testosterone', compoundNames: ['Tongkat Ali', 'Fadogia Agrestis', 'Boron'], priority: 2 },
  { condition: 'poor_sleep', description: 'Sleep Issues', compoundNames: ['Mag. Threonate', 'Apigenin', 'L-Theanine'], priority: 2 },
  { condition: 'gut_issues', description: 'Gut Health Concerns', compoundNames: ['Codeage Akkermansia', 'Seed DS-01', 'Psyllium Husk'], priority: 1 },
  { condition: 'high_glucose', description: 'HbA1c > 5.5% or Fasting Glucose > 95', compoundNames: ['Berberine', 'Metformin', 'Chromium Picolinate'], priority: 1 },
];

export interface RecommendationResult {
  compound: Compound;
  reason: string;
  priority: number; // 1 = highest
  matchedGoals: string[];
}

// Get recommendations based on selected goals
export function getRecommendationsByGoals(goals: string[], maxBudgetPerDay?: number): RecommendationResult[] {
  const compounds = getAllCompounds();
  const results: RecommendationResult[] = [];
  const seen = new Set<number>();

  // Map goals to categories
  const targetCategories = new Set<string>();
  goals.forEach(goal => {
    const cats = GOAL_CATEGORY_MAP[goal] || [];
    cats.forEach(c => targetCategories.add(c));
  });

  // Score and rank compounds
  compounds.forEach(compound => {
    if (seen.has(compound.id)) return;
    
    const matchedGoals: string[] = [];
    goals.forEach(goal => {
      const cats = GOAL_CATEGORY_MAP[goal] || [];
      if (cats.includes(compound.category)) matchedGoals.push(goal);
    });

    if (matchedGoals.length > 0) {
      seen.add(compound.id);
      results.push({
        compound,
        reason: `Supports: ${matchedGoals.join(', ')}. ${compound.primaryFunction}`,
        priority: compound.tierNumber,
        matchedGoals,
      });
    }
  });

  // Sort: tier first, then longevity impact, then efficiency
  results.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    if (b.compound.longevityImpact !== a.compound.longevityImpact) return b.compound.longevityImpact - a.compound.longevityImpact;
    return b.compound.efficiencyScore - a.compound.efficiencyScore;
  });

  // Budget filter
  if (maxBudgetPerDay && maxBudgetPerDay > 0) {
    let runningCost = 0;
    return results.filter(r => {
      if (runningCost + r.compound.pricePerDay <= maxBudgetPerDay) {
        runningCost += r.compound.pricePerDay;
        return true;
      }
      return false;
    });
  }

  return results;
}

// Get recommendations based on biomarker conditions
export function getRecommendationsByBiomarkers(conditions: string[]): RecommendationResult[] {
  const compounds = getAllCompounds();
  const results: RecommendationResult[] = [];
  const seen = new Set<number>();

  conditions.forEach(condition => {
    const rule = BIOMARKER_RULES.find(r => r.condition === condition);
    if (!rule) return;

    rule.compoundNames.forEach(name => {
      const compound = compounds.find(c => c.name === name);
      if (compound && !seen.has(compound.id)) {
        seen.add(compound.id);
        results.push({
          compound,
          reason: `${rule.description}: ${compound.primaryFunction}`,
          priority: rule.priority,
          matchedGoals: [condition],
        });
      }
    });
  });

  return results.sort((a, b) => a.priority - b.priority);
}

// Get all available goals
export function getAvailableGoals(): { id: string; label: string; icon: string }[] {
  return [
    { id: 'longevity', label: 'Longevity', icon: '🧬' },
    { id: 'performance', label: 'Performance', icon: '⚡' },
    { id: 'muscle', label: 'Muscle Growth', icon: '💪' },
    { id: 'cognition', label: 'Brain & Focus', icon: '🧠' },
    { id: 'gut_health', label: 'Gut Health', icon: '🦠' },
    { id: 'heart', label: 'Heart Health', icon: '❤️' },
    { id: 'immunity', label: 'Immunity', icon: '🛡️' },
    { id: 'hormones', label: 'Hormones', icon: '⚖️' },
    { id: 'sleep', label: 'Sleep', icon: '😴' },
    { id: 'detox', label: 'Detox', icon: '🧹' },
    { id: 'aesthetics', label: 'Aesthetics', icon: '✨' },
  ];
}

// Get available biomarker conditions
export function getAvailableBiomarkerConditions(): { id: string; label: string }[] {
  return BIOMARKER_RULES.map(r => ({ id: r.condition, label: r.description }));
}
