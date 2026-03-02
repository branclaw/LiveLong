/**
 * Biomarker-to-Supplement Mapping
 *
 * Maps biomarker IDs (from biomarkers-master.json) to compound names (from compounds.json)
 * with context about when to recommend (high/low/both) and why.
 */

export interface BiomarkerSupplementLink {
  biomarkerId: string;
  direction: 'high' | 'low' | 'both';  // When is the supplement relevant?
  compoundNames: string[];              // Compound names from compounds.json
  reason: string;                       // Why this supplement helps
}

export const BIOMARKER_SUPPLEMENT_MAP: BiomarkerSupplementLink[] = [
  // ── METABOLIC ──────────────────────────────────────────────
  {
    biomarkerId: 'glucose',
    direction: 'high',
    compoundNames: ['Berberine', 'Metformin', 'Chromium Picolinate', 'Gymnema Sylvestre'],
    reason: 'Supports healthy blood sugar regulation and insulin sensitivity',
  },
  {
    biomarkerId: 'hba1c',
    direction: 'high',
    compoundNames: ['Berberine', 'Metformin', 'Chromium Picolinate', 'Alpha Lipoic Acid', 'Gymnema Sylvestre'],
    reason: 'Helps improve long-term glucose control and reduce glycation',
  },
  {
    biomarkerId: 'insulin',
    direction: 'high',
    compoundNames: ['Berberine', 'Metformin', 'Chromium Picolinate', 'Alpha Lipoic Acid'],
    reason: 'Supports insulin sensitivity and metabolic function',
  },
  {
    biomarkerId: 'insulin-resistance-score',
    direction: 'high',
    compoundNames: ['Berberine', 'Metformin', 'Chromium Picolinate', 'MAV Omega-3'],
    reason: 'Combats insulin resistance through multiple metabolic pathways',
  },
  {
    biomarkerId: 'c-peptide',
    direction: 'high',
    compoundNames: ['Berberine', 'Metformin'],
    reason: 'Indicates elevated insulin production — supports metabolic optimization',
  },
  {
    biomarkerId: 'uric-acid',
    direction: 'high',
    compoundNames: ['Quercetin', 'NAC', 'Vitamin D3+K2'],
    reason: 'Supports healthy uric acid metabolism and kidney function',
  },
  {
    biomarkerId: 'leptin',
    direction: 'high',
    compoundNames: ['MAV Omega-3', 'Berberine', 'Alpha Lipoic Acid'],
    reason: 'High leptin may indicate leptin resistance — supports metabolic signaling',
  },
  {
    biomarkerId: 'adiponectin',
    direction: 'low',
    compoundNames: ['MAV Omega-3', 'Berberine', 'Resveratrol'],
    reason: 'Low adiponectin linked to metabolic syndrome — supports healthy adipokine levels',
  },

  // ── HEART / CARDIOVASCULAR ─────────────────────────────────
  {
    biomarkerId: 'apob',
    direction: 'high',
    compoundNames: ['Berberine', 'Nattokinase', 'MAV Omega-3', 'Psyllium Husk'],
    reason: 'Elevated ApoB is a key cardiovascular risk factor — supports lipid management',
  },
  {
    biomarkerId: 'hscrp',
    direction: 'high',
    compoundNames: ['Sulforaphane', 'Qunol Turmeric', 'MAV Omega-3', 'Resveratrol', 'NAC'],
    reason: 'Elevated hs-CRP indicates systemic inflammation — powerful anti-inflammatory support',
  },
  {
    biomarkerId: 'ldl-cholesterol',
    direction: 'high',
    compoundNames: ['Berberine', 'Psyllium Husk', 'MAV Omega-3', 'Nattokinase'],
    reason: 'Supports healthy LDL levels and cardiovascular function',
  },
  {
    biomarkerId: 'total-cholesterol',
    direction: 'high',
    compoundNames: ['Berberine', 'Psyllium Husk', 'MAV Omega-3'],
    reason: 'Supports overall cholesterol balance',
  },
  {
    biomarkerId: 'triglycerides',
    direction: 'high',
    compoundNames: ['MAV Omega-3', 'Berberine', 'Chromium Picolinate'],
    reason: 'Omega-3s are proven to significantly reduce triglycerides',
  },
  {
    biomarkerId: 'hdl-cholesterol',
    direction: 'low',
    compoundNames: ['MAV Omega-3', 'Resveratrol', 'CoQ10'],
    reason: 'Supports healthy HDL cholesterol production',
  },
  {
    biomarkerId: 'non-hdl-cholesterol',
    direction: 'high',
    compoundNames: ['Berberine', 'MAV Omega-3', 'Nattokinase', 'Psyllium Husk'],
    reason: 'Comprehensive atherogenic lipid support',
  },
  {
    biomarkerId: 'total-cholesterol-hdl-ratio',
    direction: 'high',
    compoundNames: ['MAV Omega-3', 'Berberine', 'Resveratrol'],
    reason: 'Improves cardiovascular risk ratio through lipid optimization',
  },
  {
    biomarkerId: 'lipoprotein-a',
    direction: 'high',
    compoundNames: ['MAV Omega-3', 'CoQ10', 'Nattokinase'],
    reason: 'Lp(a) is largely genetic — supports cardiovascular protection',
  },
  {
    biomarkerId: 'ldl-particle-number',
    direction: 'high',
    compoundNames: ['Berberine', 'MAV Omega-3', 'Psyllium Husk'],
    reason: 'High particle count increases atherosclerosis risk',
  },
  {
    biomarkerId: 'ldl-small',
    direction: 'high',
    compoundNames: ['MAV Omega-3', 'Berberine', 'Chromium Picolinate'],
    reason: 'Small dense LDL is more atherogenic — supports LDL particle size',
  },
  {
    biomarkerId: 'oxldl',
    direction: 'high',
    compoundNames: ['CoQ10', 'Resveratrol', 'NAC', 'Glutathione', 'Alpha Lipoic Acid'],
    reason: 'Oxidized LDL drives plaque formation — antioxidant defense',
  },
  {
    biomarkerId: 'lp-pla2',
    direction: 'high',
    compoundNames: ['MAV Omega-3', 'Qunol Turmeric', 'Sulforaphane'],
    reason: 'Marker of vascular inflammation — anti-inflammatory support',
  },
  {
    biomarkerId: 'myeloperoxidase',
    direction: 'high',
    compoundNames: ['NAC', 'Glutathione', 'Sulforaphane', 'Resveratrol'],
    reason: 'Elevated MPO indicates oxidative stress in arteries',
  },
  {
    biomarkerId: 'fibrinogen',
    direction: 'high',
    compoundNames: ['MAV Omega-3', 'Nattokinase', 'Qunol Turmeric'],
    reason: 'High fibrinogen increases clotting risk — supports healthy coagulation',
  },
  {
    biomarkerId: 'tmao',
    direction: 'high',
    compoundNames: ['Seed DS-01', 'Codeage Akkermansia', 'Psyllium Husk'],
    reason: 'TMAO is produced by gut bacteria — probiotics support healthy gut metabolism',
  },

  // ── NUTRIENTS ──────────────────────────────────────────────
  {
    biomarkerId: 'vitamin-d',
    direction: 'low',
    compoundNames: ['Vitamin D3+K2'],
    reason: 'Direct supplementation to restore optimal vitamin D levels',
  },
  {
    biomarkerId: 'homocysteine',
    direction: 'high',
    compoundNames: ['Life Extension TMG', 'LyfeFuel Essentials'],
    reason: 'TMG (trimethylglycine) directly methylates homocysteine — B vitamins support methylation cycle',
  },
  {
    biomarkerId: 'ferritin',
    direction: 'low',
    compoundNames: ['LyfeFuel Essentials'],
    reason: 'May indicate iron deficiency — foundational nutrition support',
  },
  {
    biomarkerId: 'ferritin',
    direction: 'high',
    compoundNames: ['NAC', 'Milk Thistle', 'Qunol Turmeric'],
    reason: 'High ferritin can indicate inflammation or iron overload — supports liver detox',
  },
  {
    biomarkerId: 'iron',
    direction: 'low',
    compoundNames: ['LyfeFuel Essentials'],
    reason: 'Foundational nutrition to support iron levels',
  },
  {
    biomarkerId: 'iron-saturation',
    direction: 'high',
    compoundNames: ['NAC', 'Milk Thistle'],
    reason: 'Excess iron saturation causes oxidative damage — antioxidant protection',
  },
  {
    biomarkerId: 'zinc',
    direction: 'low',
    compoundNames: ['Zinc Picolinate'],
    reason: 'Direct zinc supplementation to restore optimal levels',
  },
  {
    biomarkerId: 'omega-3-total',
    direction: 'low',
    compoundNames: ['MAV Omega-3'],
    reason: 'Direct omega-3 supplementation for cardiovascular and brain health',
  },
  {
    biomarkerId: 'omega-6-3-ratio',
    direction: 'high',
    compoundNames: ['MAV Omega-3'],
    reason: 'High omega-6/3 ratio drives inflammation — omega-3 rebalances',
  },
  {
    biomarkerId: 'aa-epa-ratio',
    direction: 'high',
    compoundNames: ['MAV Omega-3'],
    reason: 'High AA/EPA ratio indicates inflammatory imbalance',
  },
  {
    biomarkerId: 'mma',
    direction: 'high',
    compoundNames: ['LyfeFuel Essentials'],
    reason: 'Elevated MMA indicates B12 deficiency — B-vitamin support',
  },
  {
    biomarkerId: 'magnesium',
    direction: 'low',
    compoundNames: ['Mag. Threonate'],
    reason: 'Magnesium L-threonate crosses blood-brain barrier for optimal repletion',
  },

  // ── LIVER ──────────────────────────────────────────────────
  {
    biomarkerId: 'alt',
    direction: 'high',
    compoundNames: ['Milk Thistle', 'NAC', 'Sulforaphane', 'Glutathione'],
    reason: 'Elevated ALT signals liver stress — hepatoprotective support',
  },
  {
    biomarkerId: 'ast',
    direction: 'high',
    compoundNames: ['Milk Thistle', 'NAC', 'Glutathione'],
    reason: 'Elevated AST may indicate liver or muscle damage — detox support',
  },
  {
    biomarkerId: 'ggt',
    direction: 'high',
    compoundNames: ['Milk Thistle', 'NAC', 'Glutathione', 'Sulforaphane'],
    reason: 'GGT is a sensitive marker of liver stress and oxidative damage',
  },
  {
    biomarkerId: 'alp',
    direction: 'high',
    compoundNames: ['Vitamin D3+K2', 'Zinc Picolinate'],
    reason: 'Elevated ALP can relate to bone or liver — supports both pathways',
  },
  {
    biomarkerId: 'total-bilirubin',
    direction: 'high',
    compoundNames: ['Milk Thistle', 'NAC'],
    reason: 'Supports liver conjugation and bilirubin clearance',
  },
  {
    biomarkerId: 'albumin',
    direction: 'low',
    compoundNames: ['LyfeFuel Essentials', 'Naked Pea Protein (1/2 scoop)'],
    reason: 'Low albumin may indicate poor nutrition — protein and foundational support',
  },

  // ── THYROID ────────────────────────────────────────────────
  {
    biomarkerId: 'tsh',
    direction: 'high',
    compoundNames: ['Selenium', 'Iodine', 'Zinc Picolinate', 'Ashwagandha'],
    reason: 'Elevated TSH suggests underactive thyroid — thyroid-supporting nutrients',
  },
  {
    biomarkerId: 't4-free',
    direction: 'low',
    compoundNames: ['Selenium', 'Iodine', 'Zinc Picolinate'],
    reason: 'Low free T4 indicates hypothyroid tendency — cofactor support',
  },
  {
    biomarkerId: 't3-free',
    direction: 'low',
    compoundNames: ['Selenium', 'Zinc Picolinate'],
    reason: 'Selenium is essential for T4-to-T3 conversion',
  },
  {
    biomarkerId: 'tpo',
    direction: 'high',
    compoundNames: ['Selenium', 'Vitamin D3+K2', 'MAV Omega-3'],
    reason: 'TPO antibodies indicate autoimmune thyroid — selenium reduces antibody levels',
  },
  {
    biomarkerId: 'tgab',
    direction: 'high',
    compoundNames: ['Selenium', 'Vitamin D3+K2'],
    reason: 'Thyroglobulin antibodies indicate thyroid autoimmunity — immune modulation',
  },

  // ── HORMONAL / MALE HEALTH ─────────────────────────────────
  {
    biomarkerId: 'testosterone-total',
    direction: 'low',
    compoundNames: ['Tongkat Ali', 'Fadogia Agrestis', 'Boron', 'DHEA', 'Ashwagandha', 'Zinc Picolinate'],
    reason: 'Supports natural testosterone production through multiple pathways',
  },
  {
    biomarkerId: 'testosterone-free',
    direction: 'low',
    compoundNames: ['Tongkat Ali', 'Fadogia Agrestis', 'Boron', 'Sting Nettle Root'],
    reason: 'Boron and nettle root help lower SHBG to increase free testosterone',
  },
  {
    biomarkerId: 'shbg',
    direction: 'high',
    compoundNames: ['Boron', 'Sting Nettle Root', 'Tongkat Ali'],
    reason: 'High SHBG binds testosterone — boron helps lower SHBG levels',
  },
  {
    biomarkerId: 'dhea-sulfate',
    direction: 'low',
    compoundNames: ['DHEA', 'Ashwagandha'],
    reason: 'DHEA is the precursor to sex hormones — direct supplementation restores levels',
  },
  {
    biomarkerId: 'estradiol',
    direction: 'high',
    compoundNames: ['Sulforaphane', 'Grape Seed Extract'],
    reason: 'Supports healthy estrogen metabolism and detoxification',
  },
  {
    biomarkerId: 'cortisol',
    direction: 'high',
    compoundNames: ['Ashwagandha', 'Rhodiola Rosea', 'Mag. Threonate', 'L-Theanine'],
    reason: 'Adaptogens help normalize cortisol and reduce stress response',
  },
  {
    biomarkerId: 'prolactin',
    direction: 'high',
    compoundNames: ['Ashwagandha', 'Zinc Picolinate', 'Vitamin D3+K2'],
    reason: 'Supports dopamine pathways that regulate prolactin levels',
  },

  // ── KIDNEY ─────────────────────────────────────────────────
  {
    biomarkerId: 'creatinine',
    direction: 'high',
    compoundNames: ['NAC', 'MAV Omega-3', 'CoQ10'],
    reason: 'Supports kidney function and reduces oxidative stress on nephrons',
  },
  {
    biomarkerId: 'egfr-creatinine',
    direction: 'low',
    compoundNames: ['NAC', 'MAV Omega-3', 'CoQ10'],
    reason: 'Low eGFR indicates reduced kidney filtration — nephroprotective support',
  },
  {
    biomarkerId: 'cystatin-c',
    direction: 'high',
    compoundNames: ['NAC', 'MAV Omega-3'],
    reason: 'Elevated cystatin C is a sensitive marker of kidney function decline',
  },
  {
    biomarkerId: 'bun',
    direction: 'high',
    compoundNames: ['MAV Omega-3'],
    reason: 'Supports kidney health and protein metabolism balance',
  },

  // ── IMMUNE REGULATION ──────────────────────────────────────
  {
    biomarkerId: 'wbc-count',
    direction: 'high',
    compoundNames: ['Sulforaphane', 'Qunol Turmeric', 'MAV Omega-3'],
    reason: 'Elevated WBC may indicate chronic inflammation',
  },
  {
    biomarkerId: 'wbc-count',
    direction: 'low',
    compoundNames: ['Vitamin D3+K2', 'Zinc Picolinate', 'Beta-Glucans', 'Colostrum'],
    reason: 'Low WBC may indicate weakened immunity — immune-boosting support',
  },
  {
    biomarkerId: 'neutrophils',
    direction: 'high',
    compoundNames: ['Sulforaphane', 'Qunol Turmeric', 'MAV Omega-3'],
    reason: 'High neutrophils suggest active inflammation or infection',
  },
  {
    biomarkerId: 'eosinophils',
    direction: 'high',
    compoundNames: ['Quercetin', 'Sulforaphane', 'MAV Omega-3'],
    reason: 'Elevated eosinophils may indicate allergic inflammation',
  },

  // ── AUTOIMMUNITY ───────────────────────────────────────────
  {
    biomarkerId: 'ana-screen',
    direction: 'high',
    compoundNames: ['Vitamin D3+K2', 'MAV Omega-3', 'Glutathione', 'Sulforaphane'],
    reason: 'Positive ANA suggests autoimmune tendency — immune modulation support',
  },
  {
    biomarkerId: 'rheumatoid-factor-rf',
    direction: 'high',
    compoundNames: ['MAV Omega-3', 'Qunol Turmeric', 'Sulforaphane', 'Vitamin D3+K2'],
    reason: 'Elevated RF indicates autoimmune inflammation — anti-inflammatory support',
  },

  // ── BLOOD ──────────────────────────────────────────────────
  {
    biomarkerId: 'hemoglobin',
    direction: 'low',
    compoundNames: ['LyfeFuel Essentials'],
    reason: 'Low hemoglobin may indicate anemia — foundational nutrition with iron and B-vitamins',
  },
  {
    biomarkerId: 'hematocrit',
    direction: 'low',
    compoundNames: ['LyfeFuel Essentials'],
    reason: 'Low hematocrit suggests anemia — nutritional support',
  },
  {
    biomarkerId: 'mcv',
    direction: 'high',
    compoundNames: ['LyfeFuel Essentials'],
    reason: 'High MCV can indicate B12 or folate deficiency — B-vitamin support',
  },
  {
    biomarkerId: 'rdw',
    direction: 'high',
    compoundNames: ['LyfeFuel Essentials', 'MAV Omega-3'],
    reason: 'Elevated RDW indicates red cell size variation — nutritional optimization',
  },

  // ── ELECTROLYTES ───────────────────────────────────────────
  {
    biomarkerId: 'calcium',
    direction: 'low',
    compoundNames: ['Vitamin D3+K2'],
    reason: 'Vitamin D is essential for calcium absorption — K2 directs calcium to bones',
  },
  {
    biomarkerId: 'potassium',
    direction: 'low',
    compoundNames: ['Junp Hydration'],
    reason: 'Electrolyte support for potassium balance',
  },

  // ── STRESS & AGING ─────────────────────────────────────────
  {
    biomarkerId: 'biological-age',
    direction: 'high',
    compoundNames: ['Rapamycin', 'Fisetin', 'Quercetin', 'Spermidine', 'Ca-AKG', 'Urolithin A', 'Resveratrol'],
    reason: 'Senolytics and longevity compounds target biological aging pathways',
  },

  // ── ENVIRONMENTAL TOXINS ───────────────────────────────────
  {
    biomarkerId: 'mercury',
    direction: 'high',
    compoundNames: ['NAC', 'Glutathione', 'Selenium', 'Activated Charcoal'],
    reason: 'Supports heavy metal detoxification and chelation pathways',
  },
  {
    biomarkerId: 'lead',
    direction: 'high',
    compoundNames: ['NAC', 'Glutathione', 'Activated Charcoal'],
    reason: 'Supports lead detoxification through glutathione conjugation',
  },

  // ── PANCREAS ───────────────────────────────────────────────
  {
    biomarkerId: 'amylase',
    direction: 'high',
    compoundNames: ['Qunol Turmeric', 'MAV Omega-3'],
    reason: 'Supports pancreatic health and reduces inflammation',
  },
  {
    biomarkerId: 'lipase',
    direction: 'high',
    compoundNames: ['Qunol Turmeric', 'MAV Omega-3'],
    reason: 'Elevated lipase may indicate pancreatic stress — anti-inflammatory support',
  },

  // ── GUT-RELATED (from biomarker patterns) ──────────────────
  {
    biomarkerId: 'celiac-ttg-iga',
    direction: 'high',
    compoundNames: ['Glutathione', 'Seed DS-01', 'Slippery Elm'],
    reason: 'Positive celiac markers — gut lining and immune support',
  },
  {
    biomarkerId: 'immunoglobulin-a-iga',
    direction: 'low',
    compoundNames: ['Colostrum', 'Seed DS-01', 'Vitamin D3+K2'],
    reason: 'Low IgA indicates mucosal immune weakness — colostrum boosts secretory IgA',
  },
  {
    biomarkerId: 'immunoglobulin-a-iga',
    direction: 'high',
    compoundNames: ['Qunol Turmeric', 'Sulforaphane'],
    reason: 'Elevated IgA may indicate chronic infection or inflammation',
  },
];

/**
 * Look up supplement recommendations for a given biomarker result.
 * Returns matching links filtered by whether the value is high or low.
 */
export function getSupplementsForBiomarker(
  biomarkerId: string,
  direction: 'high' | 'low'
): BiomarkerSupplementLink[] {
  return BIOMARKER_SUPPLEMENT_MAP.filter(
    link => link.biomarkerId === biomarkerId && (link.direction === direction || link.direction === 'both')
  );
}

/**
 * Given an array of parsed lab results, return all relevant supplement recommendations.
 */
export interface SupplementRecommendation {
  compoundName: string;
  biomarkerIds: string[];
  biomarkerNames: string[];
  reasons: string[];
  priority: number; // lower = higher priority
}

export function getRecommendationsFromLabResults(
  results: { matchedId: string | null; flag: string; isOutOfRange: boolean; isOutOfOptimal: boolean; name: string }[]
): SupplementRecommendation[] {
  const recMap = new Map<string, SupplementRecommendation>();

  for (const result of results) {
    if (!result.matchedId) continue;
    if (!result.isOutOfOptimal && !result.isOutOfRange) continue;

    const direction = (result.flag === 'high' || result.flag === 'critical') ? 'high' : 'low';
    const links = getSupplementsForBiomarker(result.matchedId, direction);

    for (const link of links) {
      for (const compoundName of link.compoundNames) {
        const existing = recMap.get(compoundName);
        if (existing) {
          if (!existing.biomarkerIds.includes(result.matchedId)) {
            existing.biomarkerIds.push(result.matchedId);
            existing.biomarkerNames.push(result.name);
            existing.reasons.push(link.reason);
            // More biomarkers = higher priority (lower number)
            existing.priority = Math.max(1, existing.priority - 1);
          }
        } else {
          recMap.set(compoundName, {
            compoundName,
            biomarkerIds: [result.matchedId],
            biomarkerNames: [result.name],
            reasons: [link.reason],
            priority: result.isOutOfRange ? 1 : 2,
          });
        }
      }
    }
  }

  return Array.from(recMap.values()).sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return b.biomarkerIds.length - a.biomarkerIds.length; // More matches = higher
  });
}
