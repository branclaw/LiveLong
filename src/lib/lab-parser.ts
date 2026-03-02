/**
 * Lab Results PDF Parser
 * Parses lab results from common formats (Health Gorilla, Quest Diagnostics, LabCorp, etc.)
 * Extracts biomarker names, values, units, reference ranges, and flags.
 */

import biomarkersDB from '@/data/biomarkers-master.json';

export interface ParsedBiomarker {
  name: string;
  value: string;
  numericValue: number | null;
  unit: string;
  referenceRange: string;
  flag: 'normal' | 'high' | 'low' | 'critical' | 'unknown';
  matchedBiomarkerId: string | null;
  matchedCategory: string | null;
  standardRangeLow: number | null;
  standardRangeHigh: number | null;
  optimalRangeLow: number | null;
  optimalRangeHigh: number | null;
  isOutOfRange: boolean;
  isOutOfOptimal: boolean;
  panel: string;
}

export interface LabReport {
  id: string;
  fileName: string;
  uploadDate: string;
  reportDate: string | null;
  lab: string | null;
  panels: string[];
  biomarkers: ParsedBiomarker[];
  totalBiomarkers: number;
  outOfRange: number;
  outOfOptimal: number;
}

// Aliases for matching lab result names to our database
const BIOMARKER_ALIASES: Record<string, string> = {
  'glucose': 'glucose',
  'glucose, serum': 'glucose',
  'bun': 'bun',
  'blood urea nitrogen': 'bun',
  'urea nitrogen': 'bun',
  'creatinine': 'creatinine',
  'creatinine, serum': 'creatinine',
  'egfr': 'egfr-creatinine',
  'egfr non-afr. american': 'egfr-creatinine',
  'egfr african american': 'egfr-creatinine',
  'bun/creatinine ratio': 'bun',
  'sodium': 'sodium',
  'potassium': 'potassium',
  'chloride': 'chloride',
  'carbon dioxide': 'carbon-dioxide',
  'co2': 'carbon-dioxide',
  'calcium': 'calcium',
  'calcium, serum': 'calcium',
  'protein, total': 'total-protein',
  'total protein': 'total-protein',
  'albumin': 'albumin',
  'albumin, serum': 'albumin',
  'globulin': 'globulin',
  'globulin, total': 'globulin',
  'a/g ratio': 'albumin-globulin-ratio',
  'albumin/globulin ratio': 'albumin-globulin-ratio',
  'bilirubin, total': 'total-bilirubin',
  'total bilirubin': 'total-bilirubin',
  'alkaline phosphatase': 'alp',
  'alkaline phosphatase, s': 'alp',
  'alp': 'alp',
  'ast': 'ast',
  'ast (sgot)': 'ast',
  'aspartate aminotransferase': 'ast',
  'alt': 'alt',
  'alt (sgpt)': 'alt',
  'alanine aminotransferase': 'alt',
  'ggt': 'ggt',
  'gamma-glutamyl transferase': 'ggt',
  'cholesterol, total': 'total-cholesterol',
  'total cholesterol': 'total-cholesterol',
  'triglycerides': 'triglycerides',
  'hdl cholesterol': 'hdl-cholesterol',
  'hdl-cholesterol': 'hdl-cholesterol',
  'hdl': 'hdl-cholesterol',
  'vldl cholesterol cal': 'triglycerides',
  'ldl cholesterol': 'ldl-cholesterol',
  'ldl-cholesterol': 'ldl-cholesterol',
  'ldl chol calc (nih)': 'ldl-cholesterol',
  'ldl': 'ldl-cholesterol',
  'non-hdl cholesterol': 'non-hdl-cholesterol',
  'chol/hdlc ratio': 'total-cholesterol-hdl-ratio',
  'total cholesterol/hdl ratio': 'total-cholesterol-hdl-ratio',
  'wbc': 'wbc-count',
  'white blood cell count': 'wbc-count',
  'wbc count': 'wbc-count',
  'rbc': 'rbc-count',
  'red blood cell count': 'rbc-count',
  'rbc count': 'rbc-count',
  'hemoglobin': 'hemoglobin',
  'hematocrit': 'hematocrit',
  'mcv': 'mcv',
  'mean corpuscular volume': 'mcv',
  'mch': 'mch',
  'mean corpuscular hemoglobin': 'mch',
  'mchc': 'mchc',
  'mean corpuscular hb conc': 'mchc',
  'rdw': 'rdw',
  'red cell distribution width': 'rdw',
  'platelet count': 'platelet-count',
  'platelets': 'platelet-count',
  'mpv': 'mpv',
  'mean platelet volume': 'mpv',
  'neutrophils': 'neutrophils',
  'neutrophils (absolute)': 'neutrophils',
  'abs neutrophils': 'neutrophils',
  'lymphocytes': 'lymphocytes',
  'lymphocytes (absolute)': 'lymphocytes',
  'abs lymphocytes': 'lymphocytes',
  'monocytes': 'monocytes',
  'monocytes (absolute)': 'monocytes',
  'abs monocytes': 'monocytes',
  'eosinophils': 'eosinophils',
  'eosinophils (absolute)': 'eosinophils',
  'abs eosinophils': 'eosinophils',
  'basophils': 'basophils',
  'basophils (absolute)': 'basophils',
  'abs basophils': 'basophils',
  'tsh': 'tsh',
  'thyroid stimulating hormone': 'tsh',
  't4, free': 't4-free',
  'free t4': 't4-free',
  'thyroxine, free': 't4-free',
  't3, free': 't3-free',
  'free t3': 't3-free',
  'triiodothyronine, free': 't3-free',
  'hemoglobin a1c': 'hba1c',
  'hba1c': 'hba1c',
  'a1c': 'hba1c',
  'insulin': 'insulin',
  'insulin, fasting': 'insulin',
  'hs-crp': 'hscrp',
  'c-reactive protein': 'hscrp',
  'c-reactive protein, cardiac': 'hscrp',
  'high sensitivity crp': 'hscrp',
  'ferritin': 'ferritin',
  'ferritin, serum': 'ferritin',
  'iron': 'iron',
  'iron, serum': 'iron',
  'iron binding capacity': 'tibc',
  'tibc': 'tibc',
  'iron saturation': 'iron-saturation',
  'iron % saturation': 'iron-saturation',
  'vitamin d': 'vitamin-d',
  'vitamin d, 25-hydroxy': 'vitamin-d',
  '25-hydroxy vitamin d': 'vitamin-d',
  'homocysteine': 'homocysteine',
  'uric acid': 'uric-acid',
  'uric acid, serum': 'uric-acid',
  'testosterone, total': 'testosterone-total',
  'total testosterone': 'testosterone-total',
  'testosterone, free': 'testosterone-free',
  'free testosterone': 'testosterone-free',
  'psa, total': 'psa-total',
  'prostate specific antigen': 'psa-total',
  'dhea-sulfate': 'dhea-sulfate',
  'dhea sulfate': 'dhea-sulfate',
  'cortisol': 'cortisol',
  'cortisol, serum': 'cortisol',
  'magnesium': 'magnesium',
  'magnesium, serum': 'magnesium',
  'zinc': 'zinc',
  'zinc, serum': 'zinc',
  'apolipoprotein b': 'apob',
  'apob': 'apob',
  'apolipoprotein a1': 'apoa1',
  'lipoprotein(a)': 'lipoprotein-a',
  'lipoprotein (a)': 'lipoprotein-a',
  'lp(a)': 'lipoprotein-a',
  'amylase': 'amylase',
  'lipase': 'lipase',
  'mercury': 'mercury',
  'mercury, blood': 'mercury',
  'lead': 'lead',
  'lead, blood': 'lead',
  'cystatin c': 'cystatin-c',
  'fibrinogen': 'fibrinogen',
};

// Build lookup map from DB
const biomarkerMap = new Map<string, typeof biomarkersDB[0]>();
for (const bm of biomarkersDB) {
  biomarkerMap.set(bm.id, bm);
}

function matchBiomarker(name: string): typeof biomarkersDB[0] | null {
  const normalized = name.toLowerCase().trim();

  // Direct alias match
  const aliasId = BIOMARKER_ALIASES[normalized];
  if (aliasId) {
    return biomarkerMap.get(aliasId) || null;
  }

  // Fuzzy match against DB names
  for (const bm of biomarkersDB) {
    const dbName = bm.name.toLowerCase();
    if (dbName === normalized || dbName.includes(normalized) || normalized.includes(dbName)) {
      return bm;
    }
  }

  return null;
}

function parseNumericValue(value: string): number | null {
  const cleaned = value.replace(/[<>]/g, '').replace(/,/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function parseReferenceRange(range: string): { low: number | null; high: number | null } {
  if (!range) return { low: null, high: null };

  // Handle formats like "65-99", "0-44", ">60", "<150", "3.5-5.3"
  const dashMatch = range.match(/([\d.]+)\s*[-–]\s*([\d.]+)/);
  if (dashMatch) {
    return { low: parseFloat(dashMatch[1]), high: parseFloat(dashMatch[2]) };
  }

  const ltMatch = range.match(/<\s*([\d.]+)/);
  if (ltMatch) return { low: 0, high: parseFloat(ltMatch[1]) };

  const gtMatch = range.match(/>\s*([\d.]+)/);
  if (gtMatch) return { low: parseFloat(gtMatch[1]), high: null };

  return { low: null, high: null };
}

function determineFlagFromValue(
  numericValue: number | null,
  rangeLow: number | null,
  rangeHigh: number | null,
  flag?: string
): 'normal' | 'high' | 'low' | 'critical' | 'unknown' {
  if (flag) {
    const f = flag.toUpperCase().trim();
    if (f === 'H' || f === 'HIGH') return 'high';
    if (f === 'L' || f === 'LOW') return 'low';
    if (f === 'HH' || f === 'LL' || f === 'CRITICAL') return 'critical';
  }

  if (numericValue === null || (rangeLow === null && rangeHigh === null)) return 'unknown';

  if (rangeLow !== null && numericValue < rangeLow) return 'low';
  if (rangeHigh !== null && numericValue > rangeHigh) return 'high';
  return 'normal';
}

/**
 * Parse extracted text from a lab PDF into structured biomarker data.
 * The text should be the raw text content from the PDF.
 */
export function parseLabText(text: string, fileName: string): LabReport {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const biomarkers: ParsedBiomarker[] = [];
  const panels = new Set<string>();
  let currentPanel = 'General';
  let reportDate: string | null = null;
  let lab: string | null = null;

  // Detect lab provider
  if (text.toLowerCase().includes('quest diagnostics')) lab = 'Quest Diagnostics';
  else if (text.toLowerCase().includes('labcorp')) lab = 'LabCorp';
  else if (text.toLowerCase().includes('health gorilla')) lab = 'Health Gorilla';

  // Detect report date
  const dateMatch = text.match(/(?:collected|reported|date)[:\s]*(\d{1,2}\/\d{1,2}\/\d{2,4})/i);
  if (dateMatch) reportDate = dateMatch[1];

  // Common panel headers
  const panelPatterns = [
    /COMPREHENSIVE METABOLIC PANEL/i,
    /COMPLETE BLOOD COUNT/i,
    /LIPID PANEL/i,
    /THYROID/i,
    /HEPATIC FUNCTION/i,
    /IRON/i,
    /HEMOGLOBIN A1c/i,
    /URINALYSIS/i,
    /METABOLIC PANEL/i,
    /CBC WITH DIFFERENTIAL/i,
    /BASIC METABOLIC PANEL/i,
  ];

  // Parse line by line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for panel headers
    for (const pat of panelPatterns) {
      if (pat.test(line)) {
        currentPanel = line.replace(/\s*\(.*\)/, '').trim();
        panels.add(currentPanel);
        break;
      }
    }

    // Try to parse a biomarker line
    // Common formats:
    // "Glucose           106 H     65-99 mg/dL"
    // "Hemoglobin        14.6      13.2-17.1 g/dL"
    // "WBC               4.9       3.8-10.8 Thousand/uL"
    const biomarkerPattern = /^([A-Za-z][\w\s,/().%-]+?)\s{2,}([\d<>.]+)\s*(H|L|HH|LL)?\s+([\d<>.\-–]+)\s+(.+)$/;
    const match = line.match(biomarkerPattern);

    if (match) {
      const [, rawName, rawValue, flag, refRange, unit] = match;
      const name = rawName.trim();
      const numericValue = parseNumericValue(rawValue);
      const { low: refLow, high: refHigh } = parseReferenceRange(refRange);
      const matched = matchBiomarker(name);
      const determinedFlag = determineFlagFromValue(numericValue, refLow, refHigh, flag);

      const isOutOfRange = determinedFlag === 'high' || determinedFlag === 'low' || determinedFlag === 'critical';
      let isOutOfOptimal = isOutOfRange;

      if (matched && numericValue !== null) {
        const optLow = matched.optimal_range_low;
        const optHigh = matched.optimal_range_high;
        if (optLow !== null && optHigh !== null) {
          isOutOfOptimal = numericValue < optLow || numericValue > optHigh;
        }
      }

      biomarkers.push({
        name,
        value: rawValue.trim(),
        numericValue,
        unit: unit.trim(),
        referenceRange: refRange,
        flag: determinedFlag,
        matchedBiomarkerId: matched?.id || null,
        matchedCategory: matched?.category || null,
        standardRangeLow: matched?.standard_range_low ?? refLow,
        standardRangeHigh: matched?.standard_range_high ?? refHigh,
        optimalRangeLow: matched?.optimal_range_low ?? null,
        optimalRangeHigh: matched?.optimal_range_high ?? null,
        isOutOfRange,
        isOutOfOptimal,
        panel: currentPanel,
      });
      continue;
    }

    // Simpler format: "TestName    Value   Unit   RefRange"
    // Try matching more loosely
    const simplePattern = /^([A-Za-z][\w\s,/().%-]+?)\s{2,}([\d<>.]+)\s+(\S+)\s+([\d<>.\-–]+\s*[-–]\s*[\d<>.]+)?/;
    const simpleMatch = line.match(simplePattern);

    if (simpleMatch) {
      const [, rawName, rawValue, unit, refRange] = simpleMatch;
      const name = rawName.trim();
      const numericValue = parseNumericValue(rawValue);
      const { low: refLow, high: refHigh } = parseReferenceRange(refRange || '');
      const matched = matchBiomarker(name);
      const determinedFlag = determineFlagFromValue(numericValue, refLow, refHigh);

      const isOutOfRange = determinedFlag === 'high' || determinedFlag === 'low';
      let isOutOfOptimal = isOutOfRange;

      if (matched && numericValue !== null) {
        const optLow = matched.optimal_range_low;
        const optHigh = matched.optimal_range_high;
        if (optLow !== null && optHigh !== null) {
          isOutOfOptimal = numericValue < optLow || numericValue > optHigh;
        }
      }

      biomarkers.push({
        name,
        value: rawValue.trim(),
        numericValue,
        unit: unit.trim(),
        referenceRange: refRange || '',
        flag: determinedFlag,
        matchedBiomarkerId: matched?.id || null,
        matchedCategory: matched?.category || null,
        standardRangeLow: matched?.standard_range_low ?? refLow,
        standardRangeHigh: matched?.standard_range_high ?? refHigh,
        optimalRangeLow: matched?.optimal_range_low ?? null,
        optimalRangeHigh: matched?.optimal_range_high ?? null,
        isOutOfRange,
        isOutOfOptimal,
        panel: currentPanel,
      });
    }
  }

  return {
    id: `lab_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    fileName,
    uploadDate: new Date().toISOString(),
    reportDate,
    lab,
    panels: [...panels],
    biomarkers,
    totalBiomarkers: biomarkers.length,
    outOfRange: biomarkers.filter(b => b.isOutOfRange).length,
    outOfOptimal: biomarkers.filter(b => b.isOutOfOptimal).length,
  };
}

/**
 * Get biomarker details from master database
 */
export function getBiomarkerInfo(id: string) {
  return biomarkersDB.find(bm => bm.id === id) || null;
}

/**
 * Get all biomarkers in a category
 */
export function getBiomarkersByCategory(category: string) {
  return biomarkersDB.filter(bm => bm.category === category);
}

/**
 * Get all categories
 */
export function getCategories(): string[] {
  return [...new Set(biomarkersDB.map(bm => bm.category))].sort();
}

/**
 * Analyze parsed results against optimal ranges
 */
export function analyzeResults(report: LabReport) {
  const analysis = {
    totalTested: report.biomarkers.length,
    inRange: 0,
    outOfRange: 0,
    outOfOptimal: 0,
    needsAttention: [] as ParsedBiomarker[],
    byCategory: {} as Record<string, { total: number; outOfRange: number; items: ParsedBiomarker[] }>,
  };

  for (const bm of report.biomarkers) {
    if (bm.isOutOfRange) {
      analysis.outOfRange++;
      analysis.needsAttention.push(bm);
    } else if (bm.isOutOfOptimal) {
      analysis.outOfOptimal++;
      analysis.needsAttention.push(bm);
    } else {
      analysis.inRange++;
    }

    const cat = bm.matchedCategory || 'Uncategorized';
    if (!analysis.byCategory[cat]) {
      analysis.byCategory[cat] = { total: 0, outOfRange: 0, items: [] };
    }
    analysis.byCategory[cat].total++;
    if (bm.isOutOfRange || bm.isOutOfOptimal) {
      analysis.byCategory[cat].outOfRange++;
    }
    analysis.byCategory[cat].items.push(bm);
  }

  return analysis;
}
