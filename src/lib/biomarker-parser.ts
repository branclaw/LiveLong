import { supabase } from './supabase';

/**
 * Represents a parsed biomarker from lab results
 */
export interface ParsedBiomarker {
  name: string;
  value: number;
  unit: string;
  referenceLow?: number;
  referenceHigh?: number;
}

/**
 * Parse common lab result formats from Quest Diagnostics and LabCorp
 * Handles patterns like "Glucose 95 mg/dL [65-99]" or "HbA1c: 5.4%"
 */
export function parseBiomarkerText(text: string): ParsedBiomarker[] {
  const markers: ParsedBiomarker[] = [];
  const processedNames = new Set<string>();

  // Split into lines and process each
  const lines = text.split('\n');

  lines.forEach(line => {
    line = line.trim();
    if (!line) return;

    // Pattern: "Name: value unit [low-high]" or "Name value unit [low-high]"
    // Flexible unit capture to handle mg/dL, %, ng/mL, etc.
    const match = line.match(/^([A-Za-z\s\-\/]+?):?\s+(\d+(?:\.\d+)?)\s+([\w/%\-]+)(?:\s*\[([0-9\.]+)\s*-\s*([0-9\.]+)\])?/);

    if (!match) return;

    const name = match[1].trim();
    const value = parseFloat(match[2]);
    const unit = match[3].trim();
    const refLow = match[4] ? parseFloat(match[4]) : undefined;
    const refHigh = match[5] ? parseFloat(match[5]) : undefined;

    // Skip if we already processed this marker or if name is too short
    if (processedNames.has(name.toLowerCase()) || name.length < 2) {
      return;
    }

    processedNames.add(name.toLowerCase());
    markers.push({
      name,
      value,
      unit,
      referenceLow: refLow,
      referenceHigh: refHigh,
    });
  });

  return markers;
}

/**
 * Map parsed biomarker values to condition strings used in recommendations
 * Returns condition IDs like 'apob_high', 'hscrp_high', 'low_vitamin_d', etc.
 */
export function biomarkersToConditions(markers: ParsedBiomarker[]): string[] {
  const conditions: string[] = [];
  const seenConditions = new Set<string>();

  markers.forEach(marker => {
    const name = marker.name.toLowerCase().trim();
    const value = marker.value;
    const unit = marker.unit.toLowerCase().trim();

    // Check ApoB
    if ((name.includes('apob') || name.includes('apo b')) && value > 80) {
      if (!seenConditions.has('apob_high')) {
        conditions.push('apob_high');
        seenConditions.add('apob_high');
      }
    }

    // Check hs-CRP
    if ((name.includes('hscrp') || name.includes('hs-crp') || name.includes('high sensitivity crp')) && value > 1.0) {
      if (!seenConditions.has('hscrp_high')) {
        conditions.push('hscrp_high');
        seenConditions.add('hscrp_high');
      }
    }

    // Check Vitamin D
    if ((name.includes('vitamin d') || name === 'd' || name.includes('25-oh vitamin d')) && value < 50) {
      if (!seenConditions.has('low_vitamin_d')) {
        conditions.push('low_vitamin_d');
        seenConditions.add('low_vitamin_d');
      }
    }

    // Check Testosterone (Free or Total)
    if ((name.includes('testosterone') || name.includes('free testosterone')) && value < 5) {
      if (!seenConditions.has('low_testosterone')) {
        conditions.push('low_testosterone');
        seenConditions.add('low_testosterone');
      }
    }

    // Check Glucose (HbA1c)
    if ((name.includes('hba1c') || name.includes('a1c')) && value > 5.5) {
      if (!seenConditions.has('high_glucose')) {
        conditions.push('high_glucose');
        seenConditions.add('high_glucose');
      }
    }

    // Check Fasting Glucose
    if ((name.includes('fasting glucose') || (name === 'glucose' && !name.includes('hba1c'))) && value > 95) {
      if (!seenConditions.has('high_glucose')) {
        conditions.push('high_glucose');
        seenConditions.add('high_glucose');
      }
    }
  });

  return conditions;
}

/**
 * Get a unique user ID from localStorage (extracted pattern from supabase-helpers)
 */
function getUserId(): string {
  const STORAGE_KEY = 'longevity_user_id';
  let userId = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;

  if (!userId) {
    userId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, userId);
    }
  }

  return userId;
}

/**
 * Save parsed biomarkers to Supabase
 * Stores to the biomarkers table with user_id, marker name, value, unit, and reference ranges
 */
export async function saveBiomarkers(markers: ParsedBiomarker[]): Promise<boolean> {
  // Return true if no markers to save
  if (!markers || markers.length === 0) {
    return true;
  }

  const userId = getUserId();
  const now = new Date().toISOString();

  // Prepare records for insertion
  const records = markers.map(marker => ({
    user_id: userId,
    marker_name: marker.name,
    value: marker.value,
    unit: marker.unit,
    reference_low: marker.referenceLow ?? null,
    reference_high: marker.referenceHigh ?? null,
    optimal_low: null,
    optimal_high: null,
    status: determineStatus(marker),
    recorded_at: now,
  }));

  try {
    const { error } = await supabase.from('biomarkers').insert(records);

    if (error) {
      console.warn('Failed to save biomarkers to Supabase:', error.message);
      return false;
    }

    return true;
  } catch (e) {
    console.warn('Error saving biomarkers to Supabase:', e);
    return false;
  }
}

/**
 * Determine status (optimal/normal/risk) based on reference ranges
 */
function determineStatus(marker: ParsedBiomarker): 'optimal' | 'normal' | 'risk' {
  if (!marker.referenceLow || !marker.referenceHigh) {
    return 'normal';
  }

  // Simple heuristic: within reference range = normal, below low = risk, above high = risk
  if (marker.value < marker.referenceLow) {
    return 'risk';
  }
  if (marker.value > marker.referenceHigh) {
    return 'risk';
  }

  return 'normal';
}
