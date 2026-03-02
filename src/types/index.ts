export interface Compound {
  id: number;
  name: string;
  category: string;
  tier: string;
  tierNumber: number;
  longevityImpact: number;
  efficiencyScore: number;
  pricePerDay: number;
  pricePerMonth: number;
  takingToday: boolean;
  source: string;
  primaryFunction: string;
  mechanism: string;
  targetBiomarkers: string;
  amazonLink: string;
  deliveryForm?: 'smoothie' | 'pill' | 'both';
}

export type TierNumber = 1 | 2 | 3 | 4;

export type Category = 
  | 'Immunity' | 'Gut Health' | 'Metabolic' | 'Cardio' | 'Antioxidant'
  | 'Pharmaceutical' | 'Foundational' | 'Hormonal' | 'Senolytics' | 'Joints'
  | 'Cellular Energy' | 'Cell Energy' | 'Vascular' | 'Sleep' | 'Detox'
  | 'Brain Health' | 'Methylation' | 'Minerals' | 'Vision' | 'Structural'
  | 'Electrolytes' | 'Inflammation' | 'Digestion' | 'Mitochondria';

export interface UserProfile {
  goals: string[];
  age?: number;
  weight?: number;
  sex?: 'male' | 'female';
  activityLevel?: 'sedentary' | 'moderate' | 'active' | 'athlete';
  hasGlassBlender?: boolean;
  hasRedLight?: boolean;
  currentSupplements?: string[];
  monthlyBudget?: number;
  deliveryMode?: 'all' | 'smoothie' | 'pill';
}

export interface Protocol {
  id: string;
  name: string;
  compounds: Compound[];
  totalDailyCost: number;
  totalMonthlyCost: number;
  longevityScore: number;
  createdAt: string;
}

export type SortField = 'longevityImpact' | 'efficiencyScore' | 'pricePerDay' | 'name';
export type SortDirection = 'asc' | 'desc';

export interface FilterState {
  tiers: TierNumber[];
  categories: string[];
  sources: string[];
  maxPrice: number;
  searchQuery: string;
  takingToday: boolean | null;
  sortBy: SortField;
  sortDirection: SortDirection;
}
