import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface DbUserProfile {
  id: string;
  email?: string;
  goals: string[];
  age?: number;
  weight?: number;
  sex?: string;
  activity_level?: string;
  has_glass_blender?: boolean;
  has_red_light?: boolean;
  current_supplements?: string[];
  monthly_budget?: number;
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbProtocol {
  id: string;
  user_id: string;
  name: string;
  compound_ids: number[];
  total_daily_cost: number;
  total_monthly_cost: number;
  longevity_score: number;
  created_at: string;
  updated_at: string;
}

export interface DbBiomarker {
  id: string;
  user_id: string;
  marker_name: string;
  value: number;
  unit: string;
  reference_low?: number;
  reference_high?: number;
  optimal_low?: number;
  optimal_high?: number;
  status: 'optimal' | 'normal' | 'risk';
  recorded_at: string;
}
