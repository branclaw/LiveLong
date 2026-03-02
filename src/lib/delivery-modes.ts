import { Compound } from '@/types';

export type DeliveryMode = 'all' | 'smoothie' | 'pill';

export interface DeliveryClassification {
  compoundId: number;
  compoundName: string;
  deliveryForm: 'smoothie' | 'pill' | 'both';
  smoothieNotes?: string;
}

export interface SmoothieRecipe {
  ingredients: Array<{
    name: string;
    amount: string;
    notes: string;
  }>;
  estimatedPrepTime: string;
  totalCostPerServing: number;
}

export interface DeliveryStats {
  smoothieCount: number;
  pillCount: number;
  bothCount: number;
  estimatedPillsPerDay: number;
  hasSmoothieOption: boolean;
}

// Keywords for smoothie-compatible compounds
const SMOOTHIE_KEYWORDS = [
  'powder',
  'scoop',
  'naked',
  'eaa',
  'creatine',
  'protein',
  'collagen',
  'psyllium',
  'ag1',
  'athletic greens',
  'lmnt',
  'element',
  'fiber',
  'inositol',
  'glycine',
  'taurine',
  'citrulline',
  'amla',
  'moringa',
  'cocoa',
  'kefir',
  'greens',
  'bcaa',
  'whey',
  'pea protein',
  'hemp',
  'spirulina',
  'chlorella',
  'electrolyte',
  'lyfe',
  'flavamix',
  'shilajit',
  'beta-glucans',
];

// Keywords for pill-only compounds (typically capsules/tablets/softgels)
const PILL_ONLY_KEYWORDS = [
  'rapamycin',
  'metformin',
  'urolithin',
  'resveratrol',
  'quercetin',
  'fisetin',
  'spermidine',
  'sulforaphane',
  'nattokinase',
  'berberine',
  'apigenin',
  'alpha-gpc',
  'lipoic acid',
  'astaxanthin',
  'fadogia',
  'gymnema',
  'lithium',
  'hawthorn',
  'lion\'s mane',
  'tongkat ali',
  'seed ds',
  'akkermansia',
  'codeage',
  'tmg',
  'picolinate',
  'orotate',
  'threonate',
  'zeaxanthin',
  'lutein',
];

// Keywords for compounds available in both forms
const BOTH_KEYWORDS = [
  'magnesium',
  'vitamin d',
  'omega-3',
  'coq10',
  'zinc',
  'boron',
  'iodine',
  'selenium',
];

/**
 * Classify a compound into delivery categories based on its properties
 * Smoothie-friendly: powders, liquids, things you'd blend
 * Pill-only: capsules, tablets, softgels
 * Both: compounds available in both forms
 */
export function classifyCompoundDelivery(compound: Compound): DeliveryClassification {
  const name = compound.name.toLowerCase();
  const category = compound.category.toLowerCase();

  // Check for pill-only compounds first (most specific)
  for (const keyword of PILL_ONLY_KEYWORDS) {
    if (name.includes(keyword)) {
      return {
        compoundId: compound.id,
        compoundName: compound.name,
        deliveryForm: 'pill',
      };
    }
  }

  // Check for compounds available in both forms
  for (const keyword of BOTH_KEYWORDS) {
    if (name.includes(keyword)) {
      return {
        compoundId: compound.id,
        compoundName: compound.name,
        deliveryForm: 'both',
        smoothieNotes: getSmoothieNotes(compound.name),
      };
    }
  }

  // Check for smoothie-friendly compounds
  for (const keyword of SMOOTHIE_KEYWORDS) {
    if (name.includes(keyword)) {
      return {
        compoundId: compound.id,
        compoundName: compound.name,
        deliveryForm: 'smoothie',
        smoothieNotes: getSmoothieNotes(compound.name),
      };
    }
  }

  // Default to pill (most supplements come in capsule form)
  return {
    compoundId: compound.id,
    compoundName: compound.name,
    deliveryForm: 'pill',
  };
}

/**
 * Get smoothie preparation notes for a specific compound
 */
function getSmoothieNotes(compoundName: string): string {
  const name = compoundName.toLowerCase();

  if (name.includes('scoop')) {
    return 'Mix with liquid as indicated on label';
  }
  if (name.includes('creatine')) {
    return 'Mix 5g with liquid (best with dextrose)';
  }
  if (name.includes('pea protein') || name.includes('protein')) {
    return 'Blend 1-2 scoops with liquid and fruit';
  }
  if (name.includes('collagen')) {
    return 'Mix 1-2 scoops with liquid or warm beverage';
  }
  if (name.includes('psyllium')) {
    return 'Mix thoroughly with liquid, consume immediately';
  }
  if (name.includes('powder') || name.includes('amla')) {
    return 'Mix into smoothie or liquid';
  }
  if (name.includes('greens') || name.includes('ag1') || name.includes('athletic')) {
    return 'Mix with water or almond milk';
  }
  if (name.includes('lmnt') || name.includes('element') || name.includes('electrolyte')) {
    return 'Mix with water, especially post-workout';
  }
  if (name.includes('glycine')) {
    return 'Mix 3-5g with liquid (dissolves easily)';
  }
  if (name.includes('taurine')) {
    return 'Mix into smoothie (good with fruit)';
  }
  if (name.includes('eaa')) {
    return 'Mix with water or juice per label directions';
  }
  if (name.includes('magnesium')) {
    return 'Mix with water, best before bed';
  }
  if (name.includes('omega')) {
    return 'Can be added to smoothies or taken separately';
  }

  return 'Mix with liquid per label directions';
}

/**
 * Filter compounds by delivery mode
 */
export function filterByDeliveryMode(compounds: Compound[], mode: DeliveryMode): Compound[] {
  if (mode === 'all') {
    return compounds;
  }

  return compounds.filter((compound) => {
    const classification = classifyCompoundDelivery(compound);

    if (mode === 'smoothie') {
      return classification.deliveryForm === 'smoothie' || classification.deliveryForm === 'both';
    }

    if (mode === 'pill') {
      return classification.deliveryForm === 'pill' || classification.deliveryForm === 'both';
    }

    return true;
  });
}

/**
 * Generate a smoothie recipe from selected compounds
 */
export function getSmoothieRecipe(compounds: Compound[]): SmoothieRecipe {
  const smoothieCompatible = filterByDeliveryMode(compounds, 'smoothie');

  const ingredients = smoothieCompatible.map((compound) => {
    const classification = classifyCompoundDelivery(compound);
    return {
      name: compound.name,
      amount: getTypicalAmount(compound.name),
      notes: classification.smoothieNotes || 'Per label directions',
    };
  });

  const totalCost = smoothieCompatible.reduce((sum, c) => sum + c.pricePerDay, 0);

  return {
    ingredients,
    estimatedPrepTime: '5-10 minutes',
    totalCostPerServing: Math.round(totalCost * 100) / 100,
  };
}

/**
 * Get typical serving amount for a compound
 */
function getTypicalAmount(compoundName: string): string {
  const name = compoundName.toLowerCase();

  if (name.includes('scoop')) {
    return 'As indicated on label';
  }
  if (name.includes('creatine')) {
    return '5g (1 scoop)';
  }
  if (name.includes('protein')) {
    return '1-2 scoops';
  }
  if (name.includes('collagen')) {
    return '1-2 scoops';
  }
  if (name.includes('psyllium')) {
    return '1 tablespoon';
  }
  if (name.includes('amla') || name.includes('powder')) {
    return '1/2 - 1 teaspoon';
  }
  if (name.includes('greens') || name.includes('ag1')) {
    return '1 scoop';
  }
  if (name.includes('electrolyte') || name.includes('lmnt') || name.includes('element')) {
    return '1 packet or per label';
  }
  if (name.includes('glycine')) {
    return '3-5g';
  }
  if (name.includes('taurine')) {
    return '5-10g';
  }
  if (name.includes('eaa')) {
    return 'Per label (typically 1 scoop)';
  }
  if (name.includes('moringa')) {
    return '1 teaspoon';
  }

  return 'Per label directions';
}

/**
 * Get delivery mode statistics for a set of compounds
 */
export function getDeliveryStats(compounds: Compound[]): DeliveryStats {
  const classifications = compounds.map(classifyCompoundDelivery);

  const smoothieCount = classifications.filter(
    (c) => c.deliveryForm === 'smoothie'
  ).length;
  const pillCount = classifications.filter(
    (c) => c.deliveryForm === 'pill'
  ).length;
  const bothCount = classifications.filter(
    (c) => c.deliveryForm === 'both'
  ).length;

  // Estimate pills per day (assuming 1-3 pills per pill-form compound)
  const estimatedPillsPerDay = (pillCount + bothCount) * 1.5;

  return {
    smoothieCount,
    pillCount,
    bothCount,
    estimatedPillsPerDay: Math.round(estimatedPillsPerDay),
    hasSmoothieOption: smoothieCount + bothCount > 0,
  };
}

/**
 * Attach delivery form information to compounds
 */
export function enrichCompoundsWithDeliveryForm(compounds: Compound[]): (Compound & { deliveryForm?: 'smoothie' | 'pill' | 'both' })[] {
  return compounds.map((compound) => {
    const classification = classifyCompoundDelivery(compound);
    return {
      ...compound,
      deliveryForm: classification.deliveryForm,
    };
  });
}
