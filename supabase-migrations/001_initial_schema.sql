-- =============================================
-- Longevity Navigator - Initial Database Schema
-- Run this in your Supabase SQL Editor
-- =============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. User Profiles
-- =============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  goals TEXT[] DEFAULT '{}',
  age INTEGER,
  weight NUMERIC,
  sex TEXT CHECK (sex IN ('male', 'female')),
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'moderate', 'active', 'athlete')),
  has_glass_blender BOOLEAN,
  has_red_light BOOLEAN,
  current_supplements TEXT[] DEFAULT '{}',
  monthly_budget NUMERIC,
  onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. Saved Protocols
-- =============================================
CREATE TABLE IF NOT EXISTS protocols (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'My Protocol',
  compound_ids INTEGER[] DEFAULT '{}',
  total_daily_cost NUMERIC DEFAULT 0,
  total_monthly_cost NUMERIC DEFAULT 0,
  longevity_score NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. Biomarker Records
-- =============================================
CREATE TABLE IF NOT EXISTS biomarkers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  marker_name TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  reference_low NUMERIC,
  reference_high NUMERIC,
  optimal_low NUMERIC,
  optimal_high NUMERIC,
  status TEXT CHECK (status IN ('optimal', 'normal', 'risk')) DEFAULT 'normal',
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 4. Master Ingredients (mirror of CSV data)
-- =============================================
CREATE TABLE IF NOT EXISTS master_ingredients (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  tier TEXT NOT NULL,
  tier_number INTEGER NOT NULL,
  longevity_impact NUMERIC NOT NULL,
  efficiency_score NUMERIC NOT NULL,
  price_per_day NUMERIC NOT NULL,
  price_per_month NUMERIC NOT NULL,
  taking_today BOOLEAN DEFAULT FALSE,
  source TEXT,
  primary_function TEXT,
  mechanism TEXT,
  target_biomarkers TEXT,
  amazon_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Row Level Security (RLS)
-- =============================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE biomarkers ENABLE ROW LEVEL SECURITY;

-- Users can only access their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth_id = auth.uid());

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth_id = auth.uid());

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth_id = auth.uid());

-- Users can only access their own protocols
CREATE POLICY "Users can view own protocols" ON protocols
  FOR SELECT USING (user_id IN (SELECT id FROM user_profiles WHERE auth_id = auth.uid()));

CREATE POLICY "Users can insert own protocols" ON protocols
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM user_profiles WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update own protocols" ON protocols
  FOR UPDATE USING (user_id IN (SELECT id FROM user_profiles WHERE auth_id = auth.uid()));

CREATE POLICY "Users can delete own protocols" ON protocols
  FOR DELETE USING (user_id IN (SELECT id FROM user_profiles WHERE auth_id = auth.uid()));

-- Users can only access their own biomarkers
CREATE POLICY "Users can view own biomarkers" ON biomarkers
  FOR SELECT USING (user_id IN (SELECT id FROM user_profiles WHERE auth_id = auth.uid()));

CREATE POLICY "Users can insert own biomarkers" ON biomarkers
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM user_profiles WHERE auth_id = auth.uid()));

-- Master ingredients are readable by all
ALTER TABLE master_ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Master ingredients are public" ON master_ingredients
  FOR SELECT USING (true);

-- =============================================
-- Indexes
-- =============================================
CREATE INDEX idx_user_profiles_auth_id ON user_profiles(auth_id);
CREATE INDEX idx_protocols_user_id ON protocols(user_id);
CREATE INDEX idx_biomarkers_user_id ON biomarkers(user_id);
CREATE INDEX idx_master_ingredients_category ON master_ingredients(category);
CREATE INDEX idx_master_ingredients_tier ON master_ingredients(tier_number);

-- =============================================
-- Updated at trigger
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER protocols_updated_at
  BEFORE UPDATE ON protocols
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
