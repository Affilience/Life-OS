/**
 * Database Setup Script
 * Executes schema creation directly through Supabase client
 * Run this once to initialize the gamification system
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials');
}

// Use service role for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const schema = `
-- ============================================
-- COSMIC GAMIFICATION SCHEMA
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Progress & Module XP
CREATE TABLE IF NOT EXISTS user_module_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  module_id TEXT NOT NULL CHECK (module_id IN ('journal', 'knowledge', 'health', 'finance', 'productivity')),
  current_xp INTEGER NOT NULL DEFAULT 0,
  total_xp_earned INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  unlocked_stars TEXT[] DEFAULT '{}',
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

-- Cosmic Currency
CREATE TABLE IF NOT EXISTS user_cosmic_currency (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE,
  cosmic_credits INTEGER NOT NULL DEFAULT 0,
  lifetime_credits_earned INTEGER NOT NULL DEFAULT 0,
  lifetime_credits_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS currency_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('mission_reward', 'discovery_bonus', 'streak_bonus', 'purchase', 'refund', 'admin_adjustment')),
  description TEXT,
  related_entity_id UUID,
  related_entity_type TEXT,
  balance_after INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mission Types
DO $$ BEGIN
  CREATE TYPE mission_frequency AS ENUM ('daily', 'weekly', 'monthly', 'challenge');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE mission_difficulty AS ENUM ('routine', 'moderate', 'challenging', 'cosmic');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE mission_status AS ENUM ('active', 'completed', 'failed', 'expired');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Missions
CREATE TABLE IF NOT EXISTS missions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  cosmic_narrative TEXT,
  description TEXT NOT NULL,
  module_id TEXT NOT NULL CHECK (module_id IN ('journal', 'knowledge', 'health', 'finance', 'productivity', 'any')),
  frequency mission_frequency NOT NULL,
  difficulty mission_difficulty NOT NULL,
  objectives JSONB NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 0,
  credits_reward INTEGER NOT NULL DEFAULT 0,
  requires_streak BOOLEAN DEFAULT false,
  minimum_streak_days INTEGER DEFAULT 0,
  icon TEXT,
  tags TEXT[],
  is_repeatable BOOLEAN DEFAULT true,
  max_completions INTEGER,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_missions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  status mission_status NOT NULL DEFAULT 'active',
  progress JSONB NOT NULL DEFAULT '{}',
  completion_percentage INTEGER DEFAULT 0,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  rewards_claimed BOOLEAN DEFAULT false,
  UNIQUE(user_id, mission_id, assigned_at)
);

-- Momentum Chains (Streaks)
CREATE TABLE IF NOT EXISTS momentum_chains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  chain_type TEXT NOT NULL,
  module_id TEXT CHECK (module_id IN ('journal', 'knowledge', 'health', 'finance', 'productivity')),
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  total_days_active INTEGER NOT NULL DEFAULT 0,
  shields_available INTEGER NOT NULL DEFAULT 0,
  shields_used INTEGER NOT NULL DEFAULT 0,
  last_shield_earned_at TIMESTAMPTZ,
  streak_started_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ,
  last_check_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, chain_type)
);

CREATE TABLE IF NOT EXISTS momentum_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  momentum_chain_id UUID NOT NULL REFERENCES momentum_chains(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('activity', 'shield_earned', 'shield_used', 'streak_broken', 'milestone')),
  streak_value INTEGER NOT NULL,
  shield_used BOOLEAN DEFAULT false,
  milestone_reached INTEGER,
  event_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Discovery Types
DO $$ BEGIN
  CREATE TYPE discovery_rarity AS ENUM ('common', 'rare', 'epic', 'legendary', 'cosmic');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE discovery_category AS ENUM ('milestone', 'streak', 'mastery', 'exploration', 'collection', 'special');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Discoveries (Achievements)
CREATE TABLE IF NOT EXISTS discoveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  scientific_name TEXT,
  description TEXT NOT NULL,
  cosmic_lore TEXT,
  category discovery_category NOT NULL,
  rarity discovery_rarity NOT NULL,
  unlock_criteria JSONB NOT NULL,
  credits_reward INTEGER DEFAULT 0,
  special_reward TEXT,
  icon TEXT,
  constellation_position JSONB,
  is_secret BOOLEAN DEFAULT false,
  points_value INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_discoveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  discovery_id UUID NOT NULL REFERENCES discoveries(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  progress_percentage INTEGER DEFAULT 0,
  is_new BOOLEAN DEFAULT true,
  viewed_at TIMESTAMPTZ,
  UNIQUE(user_id, discovery_id)
);

-- Rewards Marketplace
CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  cost INTEGER NOT NULL CHECK (cost > 0),
  icon TEXT,
  category TEXT,
  is_available BOOLEAN DEFAULT true,
  max_purchases_per_week INTEGER,
  max_purchases_per_month INTEGER,
  cooldown_days INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reward_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  reward_id UUID NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
  cost_paid INTEGER NOT NULL,
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_module_progress_user ON user_module_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_module_progress_module ON user_module_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_missions_active ON missions(active);
CREATE INDEX IF NOT EXISTS idx_user_missions_user ON user_missions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_missions_status ON user_missions(status);
CREATE INDEX IF NOT EXISTS idx_momentum_chains_user ON momentum_chains(user_id);
CREATE INDEX IF NOT EXISTS idx_user_discoveries_user ON user_discoveries(user_id);
CREATE INDEX IF NOT EXISTS idx_currency_transactions_user ON currency_transactions(user_id);
`;

export async function setupDatabase() {
  console.log('🚀 Starting Cosmic Gamification database setup...\n');

  try {
    // Execute schema
    const { error } = await supabase.rpc('exec_sql', { sql: schema });

    if (error) {
      console.error('❌ Error creating schema:', error);
      throw error;
    }

    console.log('✅ Database schema created successfully!\n');
    console.log('📊 Tables created:');
    console.log('  - user_module_progress');
    console.log('  - user_cosmic_currency');
    console.log('  - currency_transactions');
    console.log('  - missions');
    console.log('  - user_missions');
    console.log('  - momentum_chains');
    console.log('  - momentum_events');
    console.log('  - discoveries');
    console.log('  - user_discoveries');
    console.log('  - rewards');
    console.log('  - reward_redemptions');

    return { success: true };
  } catch (error) {
    console.error('❌ Setup failed:', error);
    return { success: false, error };
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase()
    .then(result => {
      if (result.success) {
        console.log('\n🎉 Setup complete! Your cosmic gamification system is ready.');
        process.exit(0);
      } else {
        process.exit(1);
      }
    });
}
