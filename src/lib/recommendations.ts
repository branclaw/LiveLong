import { Compound } from '@/types';
import { getAllCompounds } from './data';
import { BIOMARKER_SUPPLEMENT_MAP } from '@/data/biomarker-supplement-map';

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

// Expanded biomarker-driven rules (pulls from the master map)
interface BiomarkerRule {
  condition: string;
  description: string;
  compoundNames: string[];
  priority: number;
  biomarkerIds: string[]; // Which biomarker IDs this condition relates to
}

const BIOMARKER_RULES: BiomarkerRule[] = [
  { condition: 'apob_high', description: 'ApoB > 80 mg/dL', compoundNames: ['Berberine', 'Nattokinase', 'MAV Omega-3', 'Psyllium Husk'], priority: 1, biomarkerIds: ['apob'] },
  { condition: 'hscrp_high', description: 'hs-CRP > 1.0 mg/L', compoundNames: ['Sulforaphane', 'Qunol Turmeric', 'MAV Omega-3', 'Resveratrol', 'NAC'], priority: 1, biomarkerIds: ['hscrp'] },
  { condition: 'muscle_goal', description: 'Muscle Growth Goal', compoundNames: ['Naked EAAs', 'Naked Creatine', 'Naked Pea Protein (1/2 scoop)'], priority: 1, biomarkerIds: [] },
  { condition: 'low_vitamin_d', description: 'Vitamin D < 50 ng/mL', compoundNames: ['Vitamin D3+K2'], priority: 1, biomarkerIds: ['vitamin-d'] },
  { condition: 'low_testosterone', description: 'Low Free Testosterone', compoundNames: ['Tongkat Ali', 'Fadogia Agrestis', 'Boron', 'DHEA', 'Ashwagandha', 'Zinc Picolinate'], priority: 1, biomarkerIds: ['testosterone-free', 'testosterone-total'] },
  { condition: 'poor_sleep', description: 'Sleep Issues', compoundNames: ['Mag. Threonate', 'Apigenin', 'L-Theanine'], priority: 2, biomarkerIds: [] },
  { condition: 'gut_issues', description: 'Gut Health Concerns', compoundNames: ['Codeage Akkermansia', 'Seed DS-01', 'Psyllium Husk', 'Slippery Elm'], priority: 1, biomarkerIds: [] },
  { condition: 'high_glucose', description: 'HbA1c > 5.5% or Fasting Glucose > 95', compoundNames: ['Berberine', 'Metformin', 'Chromium Picolinate', 'Alpha Lipoic Acid'], priority: 1, biomarkerIds: ['hba1c', 'glucose'] },
  { condition: 'high_ldl', description: 'LDL > 100 mg/dL', compoundNames: ['Berberine', 'Psyllium Husk', 'MAV Omega-3', 'Nattokinase'], priority: 1, biomarkerIds: ['ldl-cholesterol'] },
  { condition: 'high_triglycerides', description: 'Triglycerides > 100 mg/dL', compoundNames: ['MAV Omega-3', 'Berberine', 'Chromium Picolinate'], priority: 1, biomarkerIds: ['triglycerides'] },
  { condition: 'low_hdl', description: 'HDL < 50 mg/dL', compoundNames: ['MAV Omega-3', 'Resveratrol', 'CoQ10'], priority: 2, biomarkerIds: ['hdl-cholesterol'] },
  { condition: 'high_homocysteine', description: 'Homocysteine > 8 umol/L', compoundNames: ['Life Extension TMG', 'LyfeFuel Essentials'], priority: 1, biomarkerIds: ['homocysteine'] },
  { condition: 'liver_stress', description: 'Elevated ALT/AST/GGT', compoundNames: ['Milk Thistle', 'NAC', 'Glutathione', 'Sulforaphane'], priority: 1, biomarkerIds: ['alt', 'ast', 'ggt'] },
  { condition: 'high_cortisol', description: 'Elevated Cortisol', compoundNames: ['Ashwagandha', 'Rhodiola Rosea', 'Mag. Threonate', 'L-Theanine'], priority: 2, biomarkerIds: ['cortisol'] },
  { condition: 'thyroid_support', description: 'TSH > 2.5 or Low T3/T4', compoundNames: ['Selenium', 'Iodine', 'Zinc Picolinate', 'Ashwagandha'], priority: 1, biomarkerIds: ['tsh', 't4-free', 't3-free'] },
  { condition: 'low_zinc', description: 'Zinc Below Optimal', compoundNames: ['Zinc Picolinate'], priority: 2, biomarkerIds: ['zinc'] },
  { condition: 'low_magnesium', description: 'Magnesium Below Optimal', compoundNames: ['Mag. Threonate'], priority: 2, biomarkerIds: ['magnesium'] },
  { condition: 'low_omega3', description: 'Low Omega-3 Index', compoundNames: ['MAV Omega-3'], priority: 1, biomarkerIds: ['omega-3-total'] },
  { condition: 'high_iron', description: 'Elevated Ferritin / Iron Saturation', compoundNames: ['NAC', 'Milk Thistle', 'Qunol Turmeric'], priority: 2, biomarkerIds: ['ferritin', 'iron-saturation'] },
  { condition: 'low_dhea', description: 'Low DHEA-Sulfate', compoundNames: ['DHEA', 'Ashwagandha'], priority: 2, biomarkerIds: ['dhea-sulfate'] },
];

export interface RecommendationResult {
  compound: Compound;
  reason: string;
  priority: number; // 1 = highest
  matchedGoals: string[];
  biomarkerContext?: string[]; // Which biomarkers triggered this recommendation
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
          biomarkerContext: rule.biomarkerIds.length > 0 ? [rule.description] : undefined,
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

// Get available biomarker conditions (expanded)
export function getAvailableBiomarkerConditions(): { id: string; label: string }[] {
  return BIOMARKER_RULES.map(r => ({ id: r.condition, label: r.description }));
}

// Utility: get which biomarker IDs a compound addresses
export function getBiomarkerIdsForCompound(compoundName: string): string[] {
  const ids = new Set<string>();
  for (const link of BIOMARKER_SUPPLEMENT_MAP) {
    if (link.compoundNames.includes(compoundName)) {
      ids.add(link.biomarkerId);
    }
  }
  return Array.from(ids);
}

// Utility: get which compound names address a biomarker
export function getCompoundNamesForBiomarker(biomarkerId: string, direction?: 'high' | 'low'): string[] {
  const names = new Set<string>();
  for (const link of BIOMARKER_SUPPLEMENT_MAP) {
    if (link.biomarkerId === biomarkerId) {
      if (!direction || link.direction === direction || link.direction === 'both') {
        link.compoundNames.forEach(n => names.add(n));
      }
    }
  }
  return Array.from(names);
}
