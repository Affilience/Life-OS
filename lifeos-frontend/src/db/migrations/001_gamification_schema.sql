-- ============================================
-- COSMIC GAMIFICATION SCHEMA
-- Integrates with existing constellation system
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USER PROGRESS & MODULE XP
-- Replaces client-side XP calculation
-- ============================================

CREATE TABLE user_module_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL CHECK (module_id IN ('journal', 'knowledge', 'health', 'finance', 'productivity')),
  current_xp INTEGER NOT NULL DEFAULT 0,
  total_xp_earned INTEGER NOT NULL DEFAULT 0, -- Lifetime XP
  level INTEGER NOT NULL DEFAULT 1,
  unlocked_stars TEXT[] DEFAULT '{}', -- Array of unlocked star IDs
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

-- ============================================
-- COSMIC CURRENCY
-- Two-currency economy: Stellar Energy (XP) + Cosmic Credits
-- ============================================

CREATE TABLE user_cosmic_currency (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  cosmic_credits INTEGER NOT NULL DEFAULT 0, -- Spendable currency
  lifetime_credits_earned INTEGER NOT NULL DEFAULT 0,
  lifetime_credits_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE currency_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Positive = earned, Negative = spent
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('mission_reward', 'discovery_bonus', 'streak_bonus', 'purchase', 'refund', 'admin_adjustment')),
  description TEXT,
  related_entity_id UUID, -- References mission, discovery, etc.
  related_entity_type TEXT,
  balance_after INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MISSIONS SYSTEM
-- Daily/Weekly/Monthly missions with cosmic narrative
-- ============================================

CREATE TYPE mission_frequency AS ENUM ('daily', 'weekly', 'monthly', 'challenge');
CREATE TYPE mission_difficulty AS ENUM ('routine', 'moderate', 'challenging', 'cosmic');
CREATE TYPE mission_status AS ENUM ('active', 'completed', 'failed', 'expired');

CREATE TABLE missions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  cosmic_narrative TEXT, -- Space-themed description
  description TEXT NOT NULL,
  module_id TEXT NOT NULL CHECK (module_id IN ('journal', 'knowledge', 'health', 'finance', 'productivity', 'any')),
  frequency mission_frequency NOT NULL,
  difficulty mission_difficulty NOT NULL,

  -- Objectives (JSONB for flexibility)
  objectives JSONB NOT NULL, -- [{type: 'count', target: 5, metric: 'journal_entries'}]

  -- Rewards
  xp_reward INTEGER NOT NULL DEFAULT 0,
  credits_reward INTEGER NOT NULL DEFAULT 0,

  -- Conditions
  requires_streak BOOLEAN DEFAULT false,
  minimum_streak_days INTEGER DEFAULT 0,

  -- Metadata
  icon TEXT,
  tags TEXT[],
  is_repeatable BOOLEAN DEFAULT true,
  max_completions INTEGER, -- NULL = infinite

  -- Lifecycle
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_missions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  status mission_status NOT NULL DEFAULT 'active',

  -- Progress tracking
  progress JSONB NOT NULL DEFAULT '{}', -- {objective_1: 3, objective_2: 5}
  completion_percentage INTEGER DEFAULT 0,

  -- Dates
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,

  -- Rewards claimed
  rewards_claimed BOOLEAN DEFAULT false,

  UNIQUE(user_id, mission_id, assigned_at)
);

-- ============================================
-- MOMENTUM CHAINS (Streak System)
-- Forgiving streak tracking with shields
-- ============================================

CREATE TABLE momentum_chains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chain_type TEXT NOT NULL, -- 'daily_mission', 'journal_entry', 'workout', etc.
  module_id TEXT CHECK (module_id IN ('journal', 'knowledge', 'health', 'finance', 'productivity')),

  -- Streak data
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  total_days_active INTEGER NOT NULL DEFAULT 0,

  -- Shields (protection from breaking streak)
  shields_available INTEGER NOT NULL DEFAULT 0,
  shields_used INTEGER NOT NULL DEFAULT 0,
  last_shield_earned_at TIMESTAMPTZ,

  -- Dates
  streak_started_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ,
  last_check_date DATE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, chain_type)
);

CREATE TABLE momentum_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  momentum_chain_id UUID NOT NULL REFERENCES momentum_chains(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('activity', 'shield_earned', 'shield_used', 'streak_broken', 'milestone')),
  streak_value INTEGER NOT NULL,
  shield_used BOOLEAN DEFAULT false,
  milestone_reached INTEGER, -- 7, 30, 100, etc.
  event_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DISCOVERIES (Achievement System)
-- Cosmic achievements with rarity tiers
-- ============================================

CREATE TYPE discovery_rarity AS ENUM ('common', 'rare', 'epic', 'legendary', 'cosmic');
CREATE TYPE discovery_category AS ENUM ('milestone', 'streak', 'mastery', 'exploration', 'collection', 'special');

CREATE TABLE discoveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  scientific_name TEXT, -- "Nebula Persistentis", "Stellar Dedicatum"
  description TEXT NOT NULL,
  cosmic_lore TEXT, -- Flavor text with space theme

  category discovery_category NOT NULL,
  rarity discovery_rarity NOT NULL,

  -- Unlock criteria (JSONB for flexibility)
  unlock_criteria JSONB NOT NULL, -- {type: 'streak', value: 30, chain_type: 'daily_mission'}

  -- Rewards
  credits_reward INTEGER DEFAULT 0,
  special_reward TEXT, -- 'custom_theme', 'exclusive_icon', etc.

  -- Visual
  icon TEXT,
  constellation_position JSONB, -- For placing on discovery map

  -- Metadata
  is_secret BOOLEAN DEFAULT false, -- Hidden until unlocked
  points_value INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_discoveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  discovery_id UUID NOT NULL REFERENCES discoveries(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  progress_percentage INTEGER DEFAULT 0, -- For discoveries with incremental progress
  is_new BOOLEAN DEFAULT true, -- For "New!" badge
  viewed_at TIMESTAMPTZ,

  UNIQUE(user_id, discovery_id)
);

-- ============================================
-- REWARDS MARKETPLACE
-- User-defined rewards purchasable with Cosmic Credits
-- ============================================

CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  cost INTEGER NOT NULL CHECK (cost > 0),
  icon TEXT,
  category TEXT, -- 'entertainment', 'food', 'activity', 'rest', 'custom'

  -- Limits
  is_available BOOLEAN DEFAULT true,
  max_purchases_per_week INTEGER,
  max_purchases_per_month INTEGER,
  cooldown_days INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reward_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
  cost_paid INTEGER NOT NULL,
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- User progress indexes
CREATE INDEX idx_user_module_progress_user ON user_module_progress(user_id);
CREATE INDEX idx_user_module_progress_module ON user_module_progress(module_id);
CREATE INDEX idx_user_module_progress_xp ON user_module_progress(current_xp DESC);

-- Mission indexes
CREATE INDEX idx_missions_frequency ON missions(frequency);
CREATE INDEX idx_missions_module ON missions(module_id);
CREATE INDEX idx_missions_active ON missions(active);
CREATE INDEX idx_user_missions_user ON user_missions(user_id);
CREATE INDEX idx_user_missions_status ON user_missions(status);
CREATE INDEX idx_user_missions_expires ON user_missions(expires_at);

-- Momentum chain indexes
CREATE INDEX idx_momentum_chains_user ON momentum_chains(user_id);
CREATE INDEX idx_momentum_chains_type ON momentum_chains(chain_type);
CREATE INDEX idx_momentum_chains_streak ON momentum_chains(current_streak DESC);
CREATE INDEX idx_momentum_events_chain ON momentum_events(momentum_chain_id);
CREATE INDEX idx_momentum_events_date ON momentum_events(event_date DESC);

-- Discovery indexes
CREATE INDEX idx_discoveries_category ON discoveries(category);
CREATE INDEX idx_discoveries_rarity ON discoveries(rarity);
CREATE INDEX idx_user_discoveries_user ON user_discoveries(user_id);
CREATE INDEX idx_user_discoveries_new ON user_discoveries(is_new) WHERE is_new = true;

-- Currency indexes
CREATE INDEX idx_currency_transactions_user ON currency_transactions(user_id);
CREATE INDEX idx_currency_transactions_date ON currency_transactions(created_at DESC);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_user_module_progress_updated_at BEFORE UPDATE ON user_module_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_cosmic_currency_updated_at BEFORE UPDATE ON user_cosmic_currency FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_missions_updated_at BEFORE UPDATE ON missions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_momentum_chains_updated_at BEFORE UPDATE ON momentum_chains FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_discoveries_updated_at BEFORE UPDATE ON discoveries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rewards_updated_at BEFORE UPDATE ON rewards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to award XP and update constellation progress
CREATE OR REPLACE FUNCTION award_module_xp(
  p_user_id UUID,
  p_module_id TEXT,
  p_xp_amount INTEGER,
  p_source TEXT DEFAULT 'manual'
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_new_xp INTEGER;
  v_old_level INTEGER;
  v_new_level INTEGER;
  v_level_up BOOLEAN := false;
BEGIN
  -- Insert or update user progress
  INSERT INTO user_module_progress (user_id, module_id, current_xp, total_xp_earned, level)
  VALUES (p_user_id, p_module_id, p_xp_amount, p_xp_amount, 1)
  ON CONFLICT (user_id, module_id)
  DO UPDATE SET
    current_xp = user_module_progress.current_xp + p_xp_amount,
    total_xp_earned = user_module_progress.total_xp_earned + p_xp_amount,
    last_activity = NOW()
  RETURNING current_xp, level INTO v_new_xp, v_old_level;

  -- Calculate new level (simple formula: level = floor(xp / 500) + 1)
  v_new_level := FLOOR(v_new_xp / 500) + 1;

  IF v_new_level > v_old_level THEN
    v_level_up := true;
    UPDATE user_module_progress
    SET level = v_new_level
    WHERE user_id = p_user_id AND module_id = p_module_id;
  END IF;

  -- Return result
  v_result := jsonb_build_object(
    'success', true,
    'new_xp', v_new_xp,
    'xp_gained', p_xp_amount,
    'level', v_new_level,
    'level_up', v_level_up
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Function to award Cosmic Credits
CREATE OR REPLACE FUNCTION award_cosmic_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_transaction_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_related_entity_id UUID DEFAULT NULL,
  p_related_entity_type TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  -- Initialize user currency if not exists
  INSERT INTO user_cosmic_currency (user_id, cosmic_credits, lifetime_credits_earned)
  VALUES (p_user_id, p_amount, p_amount)
  ON CONFLICT (user_id)
  DO UPDATE SET
    cosmic_credits = user_cosmic_currency.cosmic_credits + p_amount,
    lifetime_credits_earned = user_cosmic_currency.lifetime_credits_earned + p_amount
  RETURNING cosmic_credits INTO v_new_balance;

  -- Record transaction
  INSERT INTO currency_transactions (
    user_id, amount, transaction_type, description,
    related_entity_id, related_entity_type, balance_after
  ) VALUES (
    p_user_id, p_amount, p_transaction_type, p_description,
    p_related_entity_id, p_related_entity_type, v_new_balance
  );

  RETURN jsonb_build_object(
    'success', true,
    'amount_awarded', p_amount,
    'new_balance', v_new_balance
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE user_module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cosmic_currency ENABLE ROW LEVEL SECURITY;
ALTER TABLE currency_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE momentum_chains ENABLE ROW LEVEL SECURITY;
ALTER TABLE momentum_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_discoveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data

-- User module progress
CREATE POLICY "Users can view own progress" ON user_module_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON user_module_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON user_module_progress FOR UPDATE USING (auth.uid() = user_id);

-- Cosmic currency
CREATE POLICY "Users can view own currency" ON user_cosmic_currency FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own currency" ON user_cosmic_currency FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own currency" ON user_cosmic_currency FOR UPDATE USING (auth.uid() = user_id);

-- Currency transactions
CREATE POLICY "Users can view own transactions" ON currency_transactions FOR SELECT USING (auth.uid() = user_id);

-- Missions (public read, authenticated users can see all missions)
CREATE POLICY "Anyone can view active missions" ON missions FOR SELECT USING (active = true);

-- User missions
CREATE POLICY "Users can view own missions" ON user_missions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own missions" ON user_missions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own missions" ON user_missions FOR UPDATE USING (auth.uid() = user_id);

-- Momentum chains
CREATE POLICY "Users can view own chains" ON momentum_chains FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chains" ON momentum_chains FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own chains" ON momentum_chains FOR UPDATE USING (auth.uid() = user_id);

-- Momentum events
CREATE POLICY "Users can view own events" ON momentum_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own events" ON momentum_events FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Discoveries (public read)
CREATE POLICY "Anyone can view non-secret discoveries" ON discoveries FOR SELECT USING (is_secret = false OR id IN (SELECT discovery_id FROM user_discoveries WHERE user_id = auth.uid()));

-- User discoveries
CREATE POLICY "Users can view own discoveries" ON user_discoveries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own discoveries" ON user_discoveries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own discoveries" ON user_discoveries FOR UPDATE USING (auth.uid() = user_id);

-- Rewards
CREATE POLICY "Users can view own rewards" ON rewards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own rewards" ON rewards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own rewards" ON rewards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own rewards" ON rewards FOR DELETE USING (auth.uid() = user_id);

-- Reward redemptions
CREATE POLICY "Users can view own redemptions" ON reward_redemptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own redemptions" ON reward_redemptions FOR INSERT WITH CHECK (auth.uid() = user_id);
