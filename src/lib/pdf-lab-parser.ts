/**
 * PDF Lab Parser — Extracts biomarker results from Health Gorilla / Quest Diagnostics PDFs
 *
 * Uses pdfjs-dist for proper PDF text extraction, then parses the structured
 * Health Gorilla format which has consistent line-by-line layout.
 */

import biomarkersDB from '@/data/biomarkers-master.json';

// Expanded alias map for matching lab test names to our biomarker IDs
const ALIASES: Record<string, string> = {
  // Metabolic panel
  'glucose': 'glucose',
  'glucose, serum': 'glucose',
  'urea nitrogen (bun)': 'bun',
  'urea nitrogen': 'bun',
  'bun': 'bun',
  'blood urea nitrogen': 'bun',
  'creatinine': 'creatinine',
  'creatinine, serum': 'creatinine',
  'egfr': 'egfr-creatinine',
  'egfr non-afr. american': 'egfr-creatinine',
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
  'albumin/globulin ratio': 'albumin-globulin-ratio',
  'a/g ratio': 'albumin-globulin-ratio',
  'bilirubin, total': 'total-bilirubin',
  'total bilirubin': 'total-bilirubin',
  'alkaline phosphatase': 'alp',
  'alkaline phosphatase, s': 'alp',
  'ast (sgot)': 'ast',
  'ast': 'ast',
  'aspartate aminotransferase': 'ast',
  'alt (sgpt)': 'alt',
  'alt': 'alt',
  'alanine aminotransferase': 'alt',
  'ggt': 'ggt',
  'gamma-glutamyl transferase': 'ggt',
  'gamma-glutamyl transpeptidase': 'ggt',

  // Lipid panel
  'cholesterol, total': 'total-cholesterol',
  'cholesterol,': 'total-cholesterol',
  'total cholesterol': 'total-cholesterol',
  'triglycerides': 'triglycerides',
  'hdl cholesterol': 'hdl-cholesterol',
  'hdl': 'hdl-cholesterol',
  'ldl cholesterol': 'ldl-cholesterol',
  'ldl-cholesterol': 'ldl-cholesterol',
  'ldl chol calc (nih)': 'ldl-cholesterol',
  'ldl': 'ldl-cholesterol',
  'non hdl cholesterol': 'non-hdl-cholesterol',
  'non-hdl cholesterol': 'non-hdl-cholesterol',
  'non hdl': 'non-hdl-cholesterol',
  'chol/hdlc ratio': 'total-cholesterol-hdl-ratio',

  // CBC
  'white blood cell count': 'wbc-count',
  'white blood cell': 'wbc-count',
  'wbc': 'wbc-count',
  'red blood cell count': 'rbc-count',
  'red blood cell': 'rbc-count',
  'rbc': 'rbc-count',
  'hemoglobin': 'hemoglobin',
  'hematocrit': 'hematocrit',
  'mcv': 'mcv',
  'mch': 'mch',
  'mchc': 'mchc',
  'rdw': 'rdw',
  'platelet count': 'platelet-count',
  'platelets': 'platelet-count',
  'mpv': 'mpv',
  'absolute neutrophils': 'neutrophils',
  'neutrophils': 'neutrophils',
  'absolute lymphocytes': 'lymphocytes',
  'lymphocytes': 'lymphocytes',
  'absolute monocytes': 'monocytes',
  'monocytes': 'monocytes',
  'absolute eosinophils': 'eosinophils',
  'eosinophils': 'eosinophils',
  'absolute basophils': 'basophils',
  'basophils': 'basophils',

  // Thyroid
  'tsh': 'tsh',
  'thyroid stimulating hormone': 'tsh',
  't4, free': 't4-free',
  'free t4': 't4-free',
  'thyroxine, free': 't4-free',
  'thyroxine (t4), free': 't4-free',
  't3, free': 't3-free',
  'free t3': 't3-free',
  'triiodothyronine, free': 't3-free',
  'triiodothyronine (t3), free': 't3-free',

  // Hormones
  'testosterone, total': 'testosterone-total',
  'testosterone,total, ms': 'testosterone-total',
  'testosterone, free': 'testosterone-free',
  'free testosterone': 'testosterone-free',
  'dhea sulfate': 'dhea-sulfate',
  'dhea-sulfate': 'dhea-sulfate',
  'dehydroepiandrosterone sulfate': 'dhea-sulfate',
  'shbg': 'shbg',
  'sex hormone binding globulin': 'shbg',
  'sex horm binding glob, serum': 'shbg',
  'estradiol': 'estradiol',
  'estradiol (e2)': 'estradiol',
  'cortisol': 'cortisol',
  'cortisol, total': 'cortisol',
  'fsh': 'fsh',
  'follicle stimulating hormone': 'fsh',
  'lh': 'lh',
  'luteinizing hormone': 'lh',
  'prolactin': 'prolactin',
  'psa, total': 'psa-total',
  'prostate specific ag, serum': 'psa-total',

  // Inflammation & heart
  'hs crp': 'hscrp',
  'hs-crp': 'hscrp',
  'c-reactive protein': 'hscrp',
  'c-reactive protein, cardiac': 'hscrp',
  'high sensitivity crp': 'hscrp',
  'apolipoprotein a1': 'apoa1',
  'apolipoprotein b': 'apob',
  'apob': 'apob',
  'apolipoprotein b /a1 ratio': 'apob-apoa1-ratio',
  'lp(a)': 'lipoprotein-a',
  'lipoprotein (a)': 'lipoprotein-a',
  'lipoprotein(a)': 'lipoprotein-a',
  'fibrinogen': 'fibrinogen',
  'fibrinogen activity': 'fibrinogen',
  'fibrinogen antigen': 'fibrinogen',
  'fibrinogen antigen,': 'fibrinogen',
  'homocysteine': 'homocysteine',
  'homocysteine, plasma': 'homocysteine',

  // Nutrients
  'ferritin': 'ferritin',
  'iron': 'iron',
  'iron, serum': 'iron',
  'tibc': 'tibc',
  'iron binding capacity': 'tibc',
  'total iron binding capacity': 'tibc',
  'iron saturation': 'iron-saturation',
  '% saturation': 'iron-saturation',
  'vitamin d, 25-hydroxy': 'vitamin-d',
  'vitamin d': 'vitamin-d',
  '25-hydroxyvitamin d': 'vitamin-d',
  'zinc': 'zinc',
  'zinc, plasma or serum': 'zinc',
  'magnesium': 'magnesium',
  'magnesium, serum': 'magnesium',
  'uric acid': 'uric-acid',

  // Metabolic advanced
  'hemoglobin a1c': 'hba1c',
  'hba1c': 'hba1c',
  'a1c': 'hba1c',
  'glycated hemoglobin': 'hba1c',
  'insulin': 'insulin',
  'insulin, intact': 'insulin',
  'insulin, intact, lc /ms/ms': 'insulin',
  'insulin, intact, lc/ms/ms': 'insulin',
  'c-peptide': 'c-peptide',
  'c-peptide, lc/ms/ms': 'c-peptide',
  'insulin resistance score': 'insulin-resistance-score',

  // Urine
  'specific gravity': 'specific-gravity-urine',
  'ph': 'ph-urine',
  'occult blood': 'occult-blood-urine',

  // Advanced cardiac
  'cystatin c': 'cystatin-c',
  'adiponectin': 'adiponectin',
  'myeloperoxidase': 'myeloperoxidase',
  'tmao': 'tmao',
  'tmao (trimethylamine n oxide)': 'tmao',
  'lp pla2 activity': 'lp-pla2',
  'oxldl': 'oxldl',
  'omega-3 total': 'omega-3-total',
  'epa+dpa+dha': 'omega-3-total',
  'omega-6/omega-3 ratio': 'omega-6-3-ratio',
  'omega-6/omega-3': 'omega-6-3-ratio',
  'omega 6/omega 3 ratio': 'omega-6-3-ratio',
  'ldl particle number': 'ldl-particle-number',
  'ldl particle': 'ldl-particle-number',
  'ldl small': 'ldl-small',
  'ldl medium': 'ldl-medium',
  'ldl peak size': 'ldl-peak-size',
  'arachidonic acid/epa ratio': 'aa-epa-ratio',
  'arachidonic acid/epa': 'aa-epa-ratio',
};

export interface ParsedBiomarker {
  name: string;
  value: string;
  numericValue: number | null;
  unit: string;
  referenceRange: string;
  flag: 'normal' | 'high' | 'low' | 'critical' | 'unknown';
  matchedId: string | null;
  matchedCategory: string | null;
  optimalLow: number | null;
  optimalHigh: number | null;
  standardLow: number | null;
  standardHigh: number | null;
  isOutOfRange: boolean;
  isOutOfOptimal: boolean;
}

const biomarkerMap = new Map(biomarkersDB.map(b => [b.id, b]));

function matchBiomarker(name: string) {
  const norm = name.toLowerCase().trim();

  // Direct alias match (highest priority)
  const aliasId = ALIASES[norm];
  if (aliasId) return biomarkerMap.get(aliasId) || null;

  // Try partial match - but prefer LONGER alias matches to avoid false positives
  let bestMatch: { id: string; len: number } | null = null;
  for (const [alias, id] of Object.entries(ALIASES)) {
    if (norm.includes(alias) || alias.includes(norm)) {
      const matchLen = alias.length;
      if (!bestMatch || matchLen > bestMatch.len) {
        bestMatch = { id, len: matchLen };
      }
    }
  }
  if (bestMatch) return biomarkerMap.get(bestMatch.id) || null;

  // Try match against database names
  for (const bm of biomarkersDB) {
    const dbName = bm.name.toLowerCase();
    if (dbName === norm || dbName.includes(norm) || norm.includes(dbName)) return bm;
  }

  return null;
}

/**
 * Extract text from PDF using pdfjs-dist (client-side)
 */
export async function extractTextFromPDF(file: File): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);

  // Dynamic import for pdfjs-dist
  const pdfjsLib = await import('pdfjs-dist/build/pdf.mjs');

  // Point worker to the copy in public/ folder
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

  const doc = await pdfjsLib.getDocument({ data }).promise;
  const pages: string[] = [];

  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();

    // Group items by Y position (rounded) to reconstruct lines
    const lineMap = new Map<number, { x: number; text: string }[]>();
    for (const item of content.items) {
      if (!('str' in item) || !item.str.trim()) continue;
      const y = Math.round(item.transform[5]);
      if (!lineMap.has(y)) lineMap.set(y, []);
      lineMap.get(y)!.push({ x: item.transform[4], text: item.str });
    }

    // Sort lines top-to-bottom, items left-to-right
    const sortedYs = [...lineMap.keys()].sort((a, b) => b - a);
    const lines: string[] = [];
    for (const y of sortedYs) {
      const items = lineMap.get(y)!.sort((a, b) => a.x - b.x);
      const line = items.map(i => i.text).join('\t');
      lines.push(line);
    }

    pages.push(lines.join('\n'));
  }

  return pages;
}

// Multi-line name continuations: when a test name is split across lines
const NAME_CONTINUATIONS: Record<string, string> = {
  'CHOLESTEROL,': 'TOTAL',
  'NON HDL': 'CHOLESTEROL',
  'UREA NITROGEN': '(BUN)',
  'ALBUMIN/GLOBULIN': 'RATIO',
  'ALKALINE': 'PHOSPHATASE',
  'WHITE BLOOD CELL': 'COUNT',
  'RED BLOOD CELL': 'COUNT',
  'BUN/CREATININE': 'RATIO',
  'INSULIN RESISTANCE': 'SCORE',
  'FIBRINOGEN ANTIGEN,': 'NEPHELOMETRY',
  'INSULIN, INTACT, LC': '/MS/MS',
  'ARACHIDONIC ACID/EPA': 'RATIO',
};

// Lines to skip entirely
const SKIP_LINE_RE = /^(Brandon|PATIENT|STATUS:|Phone|DOB:|Gender:|Patient ID|Time Reported|Received:|Collection Date|Accession|Lab Ref|ORDERING|Joshua|600 Congress|Floor \d|Austin|Test\t|Page \d|Printed from|Copyright|https:\/\/|contain info|intended recipient|privacy@|or obtained|Source:|FASTING|Not Reported|Reference [Rr]ange|Risk Category|Optimal\t|Moderate\t|High\t|Desirable|For someone|For patients|For adults|For ages|Fasting reference|between \d|prediabetes|follow-up|Martin SS|LDL-C is now|calculation|better accuracy|estimation|Cardiovascular|A desirable|depending|patients on|diabetes with|albuminuria|ApoB relative|and ACC|doi:|Pearson|Insulin concentration|This test was|analytical|Jellinger|assay has|This urine|Only those|RBC, bacteria|NOTE$|D\.O\.$|Collected:|NONE SEEN|NEGATIVE|YELLOW|CLEAR|LIPID PANEL|COMPREHENSIVE|CBC \(|URINALYSIS|APOLIPOPROTEIN EVAL|CARDIO IQ|HDL FUNCTION|OMEGACHECK|LIPOPROTEIN FRACT|This assay|regulations|performance|http|informational|\(This link|SEE NOTE|Number:$|^\d+$|^IG$|^EZ$|^Z\d|^UTC$|^<\d|^\d{2}\/\d{2}\/\d{4}$|^NONE|^Pattern |^A Pattern|In Range|Out Of Range|^\(calc\)|^\(BUN\)$|^TOTAL$|^PHOSPHATASE$|^COUNT$|^RATIO$|^\/uL$|^\/1\.73m2$|^CHOLESTEROL$|^SCORE$|^\/A1 RATIO$|^NEPHELOMETRY$|^\/MS\/MS$|^ESTERASE$|^\(SGOT\)$|^\(SGPT\)$|Consider retesting|the conversion factor|Relative Risk:|CVD Relative Risk|coronary artery disease|metabolic syndrome|at \d+ years\) relative|AALP APO|QUEST DIAGNOSTICS|^between\t|^LINOLEIC ACID|^ARACHIDONIC ACID\t|^HDL LARGE|^OMEGA-6 TOTAL|^EPA\t|^DPA\t|^DHA\t)/i;

/**
 * Parse Health Gorilla / Quest PDF text into structured biomarker results.
 *
 * The PDF has detailed results on early pages and a compact summary on later pages.
 * We parse all pages but deduplicate by matched biomarker ID.
 */
export function parseHealthGorillaText(pageTexts: string[]): ParsedBiomarker[] {
  const results: ParsedBiomarker[] = [];
  const seen = new Set<string>(); // prevent duplicates by matchedId or name

  const fullText = pageTexts.join('\n');
  const lines = fullText.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Skip noise
    if (SKIP_LINE_RE.test(line)) continue;

    // Split by tabs
    const parts = line.split('\t').map(s => s.trim()).filter(Boolean);
    if (parts.length < 2) continue;

    let testName = parts[0];

    // Must start with a letter and be at least 2 chars
    if (!/^[A-Z]/i.test(testName)) continue;
    if (testName.length < 2) continue;

    // Skip lines that look like descriptions or notes (lowercase-heavy, long text)
    if (testName.length > 40 && /[a-z]{5,}/.test(testName)) continue;

    // Skip "Risk:" prefixed lines
    if (/^Risk:/i.test(testName)) continue;

    // Check if this is a known multi-line name that needs continuation
    const upperName = testName.toUpperCase();
    if (NAME_CONTINUATIONS[upperName]) {
      // The continuation is on the next line - we already have it concatenated in the alias
      // Just use the base name as-is, the alias map handles it
    }

    // Handle "ABSOLUTE" prefix where type is on next line
    if (upperName === 'ABSOLUTE' && i + 1 < lines.length) {
      const nextLine = lines[i + 1].trim();
      const nextParts = nextLine.split('\t').map(s => s.trim()).filter(Boolean);
      if (nextParts.length === 1 && /^(NEUTROPHILS|LYMPHOCYTES|MONOCYTES|EOSINOPHILS|BASOPHILS)$/i.test(nextParts[0])) {
        testName = `ABSOLUTE ${nextParts[0]}`;
      }
    }

    // Extract value - find first numeric part after the name
    let value: string | null = null;
    let flag: string | null = null;
    let valuePartIdx = -1;

    for (let p = 1; p < Math.min(parts.length, 5); p++) {
      const part = parts[p];

      // Skip "H", "L" flags that appear before the value position
      if (/^[HL]$/i.test(part)) {
        flag = part.toUpperCase();
        continue;
      }

      // Check for numeric value (possibly with < or >)
      if (/^[<>]?\d+\.?\d*$/.test(part)) {
        value = part;
        valuePartIdx = p;
        // Check if the next part is a flag
        if (p + 1 < parts.length && /^[HL]$/i.test(parts[p + 1])) {
          flag = parts[p + 1].toUpperCase();
        }
        break;
      }

      // Handle merged value+flag like "106 H" or "1.7 L"
      const mergedMatch = part.match(/^([<>]?\d+\.?\d*)\s+([HL])$/i);
      if (mergedMatch) {
        value = mergedMatch[1];
        flag = mergedMatch[2].toUpperCase();
        valuePartIdx = p;
        break;
      }

      // Handle "SEE NOTE:" or text values - skip this line
      if (/SEE NOTE|NONE|NEGATIVE|POSITIVE|TRACE|ABNORMAL/i.test(part)) {
        value = null;
        break;
      }
    }

    if (!value) continue;

    const numericValue = parseFloat(value.replace(/[<>,]/g, ''));
    if (isNaN(numericValue)) continue;

    // Extract reference range and unit from remaining parts
    let refRange = '';
    let unit = '';
    let refLow: number | null = null;
    let refHigh: number | null = null;

    // Join remaining parts after the value (and potential flag)
    const restParts = parts.slice(valuePartIdx + 1);
    const restStr = restParts.join(' ');

    // Look for range patterns in the rest of the line
    // Pattern: "65-99 mg/dL" or "3.5-5.3 mmol/L"
    // Unit must contain at least one letter (not purely numeric)
    const rangeUnitMatch = restStr.match(/(\d+\.?\d*)\s*[-–]\s*(\d+\.?\d*)\s+([a-zA-Z%][\w/%]*(?:\/[\w]+)*)/);
    if (rangeUnitMatch) {
      refLow = parseFloat(rangeUnitMatch[1]);
      refHigh = parseFloat(rangeUnitMatch[2]);
      unit = rangeUnitMatch[3];
      refRange = `${rangeUnitMatch[1]}-${rangeUnitMatch[2]}`;
    } else {
      // Pattern: "<200 mg/dL" or "< OR = 16 uIU/mL"
      const ltMatch = restStr.match(/<\s*(?:OR\s*=\s*)?(\d+\.?\d*)\s+([\w/%]+(?:\/[\w]+)*)/);
      if (ltMatch) {
        refHigh = parseFloat(ltMatch[1]);
        unit = ltMatch[2];
        refRange = `<${ltMatch[1]}`;
      } else {
        // Pattern: "> OR = 40 mg/dL" or ">6729 nmol/L"
        const gtMatch = restStr.match(/>\s*(?:OR\s*=\s*)?(\d+\.?\d*)\s+([\w/%]+(?:\/[\w]+)*)/);
        if (gtMatch) {
          refLow = parseFloat(gtMatch[1]);
          unit = gtMatch[2];
          refRange = `>${gtMatch[1]}`;
        } else {
          // Try to find just range without unit: "1.0-2.5"
          const rangeOnly = restStr.match(/(\d+\.?\d*)\s*[-–]\s*(\d+\.?\d*)/);
          if (rangeOnly) {
            refLow = parseFloat(rangeOnly[1]);
            refHigh = parseFloat(rangeOnly[2]);
            refRange = `${rangeOnly[1]}-${rangeOnly[2]}`;
          }
        }
      }
    }

    // Try to find unit if not found yet
    if (!unit) {
      for (const part of restParts) {
        if (/^(mg\/dL|mmol\/L|g\/dL|U\/L|mL\/min|uIU\/mL|ng\/mL|ng\/dL|pg\/mL|nmol\/L|umol\/L|mcg\/dL|Thousand|Million|fL|pg|%|cells\/uL|mg\/L|pmol\/L|uM|ug\/mL|Angstrom|nmol\/min\/mL)$/i.test(part)) {
          unit = part;
          break;
        }
        // Check for "Thousand/uL" pattern
        if (/^(Thousand|Million)\/uL$/i.test(part)) {
          unit = part;
          break;
        }
      }
    }

    // Also check for unit patterns like "% efflux" or "% by wt"
    if (!unit) {
      const unitMatch = restStr.match(/(% efflux(?:\/\w+)?|% by wt|Thousand\/uL|Million\/uL)/i);
      if (unitMatch) unit = unitMatch[1];
    }

    // Reject garbage units (e.g. "Z4M", random codes)
    if (unit && !/^(%|mg|g|ng|pg|ug|mcg|mmol|umol|nmol|pmol|uIU|mL|dL|fL|U|L|cells|Thousand|Million|Angstrom|uM)/i.test(unit) && unit !== '%') {
      unit = '';
    }

    // Match to biomarker database
    const matched = matchBiomarker(testName);

    // Determine flag status
    let detectedFlag: ParsedBiomarker['flag'] = 'unknown';
    let isOutOfRange = false;
    let isOutOfOptimal = false;

    if (flag === 'H') { detectedFlag = 'high'; isOutOfRange = true; }
    else if (flag === 'L') { detectedFlag = 'low'; isOutOfRange = true; }
    else if (numericValue !== null) {
      if (refLow !== null && numericValue < refLow) { detectedFlag = 'low'; isOutOfRange = true; }
      else if (refHigh !== null && numericValue > refHigh) { detectedFlag = 'high'; isOutOfRange = true; }
      else { detectedFlag = 'normal'; }
    }

    // Check against optimal ranges from our database
    if (matched && numericValue !== null) {
      const oL = matched.optimal_range_low;
      const oH = matched.optimal_range_high;
      if (oL !== null && oH !== null) {
        isOutOfOptimal = numericValue < oL || numericValue > oH;
      }
    }

    // Deduplicate by matched ID or cleaned name
    const dedupeKey = matched?.id || testName.toLowerCase();
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    results.push({
      name: testName,
      value,
      numericValue,
      unit,
      referenceRange: refRange,
      flag: detectedFlag,
      matchedId: matched?.id || null,
      matchedCategory: matched?.category || null,
      optimalLow: matched?.optimal_range_low ?? null,
      optimalHigh: matched?.optimal_range_high ?? null,
      standardLow: matched?.standard_range_low ?? refLow,
      standardHigh: matched?.standard_range_high ?? refHigh,
      isOutOfRange,
      isOutOfOptimal: isOutOfOptimal || isOutOfRange,
    });
  }

  return results;
}

/**
 * Parse plain text lab results (for .txt files or pasted text)
 */
export function parseLabText(text: string): ParsedBiomarker[] {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const results: ParsedBiomarker[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Try structured format: Name   Value  Flag  Range  Unit
    const m = line.match(/^([A-Za-z][\w\s,/().%-]+?)\s{2,}([\d<>.]+)\s*(H|L|HH|LL)?\s+([\d<>.\-–]+(?:\s*[-–]\s*[\d<>.]+)?)\s+(.+)$/);
    if (m) {
      const [, rawName, rawValue, mFlag, mRefRange, mUnit] = m;
      const parsed = buildResult(rawName.trim(), rawValue.trim(), mUnit.trim(), mRefRange, mFlag);
      if (parsed) {
        const key = parsed.matchedId || parsed.name.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          results.push(parsed);
        }
      }
      continue;
    }

    // Try simpler: Name   Value  Unit  Range
    const s = line.match(/^([A-Za-z][\w\s,/().%-]+?)\s{2,}([\d<>.]+)\s+(\S+)\s+([\d<>.\-–]+\s*[-–]\s*[\d<>.]+)?/);
    if (s) {
      const [, rawName, rawValue, mUnit, mRefRange] = s;
      const parsed = buildResult(rawName.trim(), rawValue.trim(), mUnit.trim(), mRefRange || '', undefined);
      if (parsed) {
        const key = parsed.matchedId || parsed.name.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          results.push(parsed);
        }
      }
    }
  }

  return results;
}

function buildResult(name: string, value: string, unit: string, refRange: string, flag?: string): ParsedBiomarker | null {
  const numericValue = parseFloat(value.replace(/[<>,]/g, '')) || null;
  const rangeMatch = refRange.match(/([\d.]+)\s*[-–]\s*([\d.]+)/);
  const refLow = rangeMatch ? parseFloat(rangeMatch[1]) : null;
  const refHigh = rangeMatch ? parseFloat(rangeMatch[2]) : null;

  const matched = matchBiomarker(name);
  let isOutOfRange = false;
  let isOutOfOptimal = false;
  let detectedFlag: ParsedBiomarker['flag'] = 'unknown';

  if (flag) {
    const f = flag.toUpperCase();
    if (f === 'H') { detectedFlag = 'high'; isOutOfRange = true; }
    else if (f === 'L') { detectedFlag = 'low'; isOutOfRange = true; }
    else if (f === 'HH' || f === 'LL') { detectedFlag = 'critical'; isOutOfRange = true; }
  } else if (numericValue !== null) {
    if (refLow !== null && numericValue < refLow) { detectedFlag = 'low'; isOutOfRange = true; }
    else if (refHigh !== null && numericValue > refHigh) { detectedFlag = 'high'; isOutOfRange = true; }
    else { detectedFlag = 'normal'; }
  }

  if (matched && numericValue !== null) {
    const oL = matched.optimal_range_low;
    const oH = matched.optimal_range_high;
    if (oL !== null && oH !== null) {
      isOutOfOptimal = numericValue < oL || numericValue > oH;
    }
  }

  return {
    name, value, numericValue, unit, referenceRange: refRange,
    flag: detectedFlag, matchedId: matched?.id || null,
    matchedCategory: matched?.category || null,
    optimalLow: matched?.optimal_range_low ?? null,
    optimalHigh: matched?.optimal_range_high ?? null,
    standardLow: matched?.standard_range_low ?? refLow,
    standardHigh: matched?.standard_range_high ?? refHigh,
    isOutOfRange, isOutOfOptimal: isOutOfOptimal || isOutOfRange,
  };
}
