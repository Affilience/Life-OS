-- ============================================
-- SKILL POINTS SYSTEM - MIGRATION 011
-- Adds allocatable skill points on level up
-- ============================================

-- ============================================
-- 1. USER SKILL POINTS TABLE
-- Tracks allocated stat points per user
-- ============================================

CREATE TABLE IF NOT EXISTS user_skill_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Unallocated points (3 per level)
  unallocated_points INTEGER DEFAULT 0,

  -- Allocated points per stat
  strength_points INTEGER DEFAULT 0,
  vitality_points INTEGER DEFAULT 0,
  intelligence_points INTEGER DEFAULT 0,
  wisdom_points INTEGER DEFAULT 0,
  defense_points INTEGER DEFAULT 0,

  -- Tracking
  total_points_earned INTEGER DEFAULT 0,
  last_allocation_at TIMESTAMPTZ,
  points_reset_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_skill_points_user ON user_skill_points(user_id);

-- ============================================
-- 2. MODULE MASTERY TABLE
-- Tracks lifetime XP per module for mastery bonuses
-- ============================================

CREATE TABLE IF NOT EXISTS user_module_mastery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Health module mastery (STR + VIT)
  health_lifetime_xp BIGINT DEFAULT 0,
  health_mastery_level INTEGER DEFAULT 1,

  -- Productivity module mastery (WIS + DEF)
  productivity_lifetime_xp BIGINT DEFAULT 0,
  productivity_mastery_level INTEGER DEFAULT 1,

  -- Knowledge module mastery (INT + WIS)
  knowledge_lifetime_xp BIGINT DEFAULT 0,
  knowledge_mastery_level INTEGER DEFAULT 1,

  -- Journal module mastery (WIS + VIT + INT)
  journal_lifetime_xp BIGINT DEFAULT 0,
  journal_mastery_level INTEGER DEFAULT 1,

  -- Financial module mastery (DEF + WIS)
  financial_lifetime_xp BIGINT DEFAULT 0,
  financial_mastery_level INTEGER DEFAULT 1,

  -- Skills module mastery (all stats)
  skills_lifetime_xp BIGINT DEFAULT 0,
  skills_mastery_level INTEGER DEFAULT 1,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_module_mastery_user ON user_module_mastery(user_id);

-- ============================================
-- 3. PERK STAT BONUSES TABLE
-- Maps perks to their stat bonuses
-- ============================================

CREATE TABLE IF NOT EXISTS perk_stat_bonuses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  perk_id TEXT NOT NULL UNIQUE, -- e.g., 'body_foundation', 'mind_reader_1'

  -- Stat bonuses granted by this perk
  strength_bonus INTEGER DEFAULT 0,
  vitality_bonus INTEGER DEFAULT 0,
  intelligence_bonus INTEGER DEFAULT 0,
  wisdom_bonus INTEGER DEFAULT 0,
  defense_bonus INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. FUNCTIONS
-- ============================================

-- Function to initialize skill points for a user
CREATE OR REPLACE FUNCTION initialize_user_skill_points(p_user_id UUID, p_current_level INTEGER DEFAULT 1)
RETURNS void AS $$
DECLARE
  v_total_points INTEGER;
BEGIN
  -- Calculate total points based on current level (3 per level)
  v_total_points := p_current_level * 3;

  INSERT INTO user_skill_points (user_id, unallocated_points, total_points_earned)
  VALUES (p_user_id, v_total_points, v_total_points)
  ON CONFLICT (user_id) DO UPDATE
  SET
    unallocated_points = GREATEST(user_skill_points.unallocated_points, EXCLUDED.unallocated_points),
    total_points_earned = GREATEST(user_skill_points.total_points_earned, EXCLUDED.total_points_earned),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to allocate a skill point
CREATE OR REPLACE FUNCTION allocate_skill_point(p_user_id UUID, p_stat TEXT, p_amount INTEGER DEFAULT 1)
RETURNS JSONB AS $$
DECLARE
  v_current_unallocated INTEGER;
  v_stat_column TEXT;
  v_new_unallocated INTEGER;
BEGIN
  -- Validate stat name
  IF p_stat NOT IN ('strength', 'vitality', 'intelligence', 'wisdom', 'defense') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid stat name');
  END IF;

  -- Get current unallocated points
  SELECT unallocated_points INTO v_current_unallocated
  FROM user_skill_points
  WHERE user_id = p_user_id;

  -- Check if user has enough points
  IF v_current_unallocated IS NULL OR v_current_unallocated < p_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not enough unallocated points');
  END IF;

  -- Build column name
  v_stat_column := p_stat || '_points';

  -- Update the skill points
  EXECUTE format('
    UPDATE user_skill_points
    SET %I = %I + $1,
        unallocated_points = unallocated_points - $1,
        last_allocation_at = NOW(),
        updated_at = NOW()
    WHERE user_id = $2
    RETURNING unallocated_points
  ', v_stat_column, v_stat_column)
  INTO v_new_unallocated
  USING p_amount, p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'stat', p_stat,
    'amount', p_amount,
    'unallocated_remaining', v_new_unallocated
  );
END;
$$ LANGUAGE plpgsql;

-- Function to reset skill points (costs credits)
CREATE OR REPLACE FUNCTION reset_skill_points(p_user_id UUID, p_cost INTEGER DEFAULT 500)
RETURNS JSONB AS $$
DECLARE
  v_current_credits INTEGER;
  v_total_allocated INTEGER;
  v_skill_points RECORD;
BEGIN
  -- Get current credits
  SELECT cosmic_credits INTO v_current_credits
  FROM user_cosmic_currency
  WHERE user_id = p_user_id;

  IF v_current_credits IS NULL OR v_current_credits < p_cost THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not enough credits', 'required', p_cost);
  END IF;

  -- Get current skill points
  SELECT * INTO v_skill_points
  FROM user_skill_points
  WHERE user_id = p_user_id;

  IF v_skill_points IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No skill points found');
  END IF;

  -- Calculate total allocated points
  v_total_allocated := v_skill_points.strength_points + v_skill_points.vitality_points +
                       v_skill_points.intelligence_points + v_skill_points.wisdom_points +
                       v_skill_points.defense_points;

  -- Deduct credits
  UPDATE user_cosmic_currency
  SET cosmic_credits = cosmic_credits - p_cost,
      lifetime_credits_spent = lifetime_credits_spent + p_cost,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Record transaction
  INSERT INTO currency_transactions (user_id, amount, transaction_type, description, balance_after)
  VALUES (p_user_id, -p_cost, 'purchase', 'Skill points reset', v_current_credits - p_cost);

  -- Reset all allocated points to unallocated
  UPDATE user_skill_points
  SET
    unallocated_points = unallocated_points + v_total_allocated,
    strength_points = 0,
    vitality_points = 0,
    intelligence_points = 0,
    wisdom_points = 0,
    defense_points = 0,
    points_reset_count = points_reset_count + 1,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'points_refunded', v_total_allocated,
    'credits_spent', p_cost,
    'remaining_credits', v_current_credits - p_cost
  );
END;
$$ LANGUAGE plpgsql;

-- Function to award skill points on level up
CREATE OR REPLACE FUNCTION award_level_up_skill_points(p_user_id UUID, p_points INTEGER DEFAULT 3)
RETURNS void AS $$
BEGIN
  INSERT INTO user_skill_points (user_id, unallocated_points, total_points_earned)
  VALUES (p_user_id, p_points, p_points)
  ON CONFLICT (user_id) DO UPDATE
  SET
    unallocated_points = user_skill_points.unallocated_points + p_points,
    total_points_earned = user_skill_points.total_points_earned + p_points,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to calculate mastery level from XP
CREATE OR REPLACE FUNCTION calculate_mastery_level(p_xp BIGINT)
RETURNS INTEGER AS $$
BEGIN
  -- Exponential curve: Level 1 = 0 XP, Level 10 = 10,000 XP, Level 50 = 250,000 XP, Level 100 = 1,000,000 XP
  -- Formula: XP = 100 * level^2
  RETURN GREATEST(1, FLOOR(SQRT(p_xp / 100.0))::INTEGER);
END;
$$ LANGUAGE plpgsql;

-- Function to update module mastery
CREATE OR REPLACE FUNCTION update_module_mastery(p_user_id UUID, p_module TEXT, p_xp_amount INTEGER)
RETURNS JSONB AS $$
DECLARE
  v_column_xp TEXT;
  v_column_level TEXT;
  v_new_xp BIGINT;
  v_old_level INTEGER;
  v_new_level INTEGER;
  v_level_up BOOLEAN := false;
BEGIN
  -- Validate module
  IF p_module NOT IN ('health', 'productivity', 'knowledge', 'journal', 'financial', 'skills') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid module');
  END IF;

  v_column_xp := p_module || '_lifetime_xp';
  v_column_level := p_module || '_mastery_level';

  -- Initialize if not exists
  INSERT INTO user_module_mastery (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Get current level
  EXECUTE format('SELECT %I FROM user_module_mastery WHERE user_id = $1', v_column_level)
  INTO v_old_level
  USING p_user_id;

  -- Update XP and recalculate level
  EXECUTE format('
    UPDATE user_module_mastery
    SET %I = %I + $1,
        %I = calculate_mastery_level(%I + $1),
        updated_at = NOW()
    WHERE user_id = $2
    RETURNING %I, %I
  ', v_column_xp, v_column_xp, v_column_level, v_column_xp, v_column_xp, v_column_level)
  INTO v_new_xp, v_new_level
  USING p_xp_amount, p_user_id;

  v_level_up := v_new_level > v_old_level;

  RETURN jsonb_build_object(
    'success', true,
    'module', p_module,
    'new_xp', v_new_xp,
    'new_level', v_new_level,
    'level_up', v_level_up
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. ROW LEVEL SECURITY
-- ============================================

ALTER TABLE user_skill_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_module_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE perk_stat_bonuses ENABLE ROW LEVEL SECURITY;

-- User skill points policies
CREATE POLICY "Users can view own skill points" ON user_skill_points FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own skill points" ON user_skill_points FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own skill points" ON user_skill_points FOR UPDATE USING (auth.uid() = user_id);

-- Module mastery policies
CREATE POLICY "Users can view own mastery" ON user_module_mastery FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own mastery" ON user_module_mastery FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own mastery" ON user_module_mastery FOR UPDATE USING (auth.uid() = user_id);

-- Perk stat bonuses (public read)
CREATE POLICY "Anyone can view perk stat bonuses" ON perk_stat_bonuses FOR SELECT USING (true);

-- ============================================
-- 6. TRIGGERS
-- ============================================

CREATE TRIGGER update_user_skill_points_updated_at
BEFORE UPDATE ON user_skill_points
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_module_mastery_updated_at
BEFORE UPDATE ON user_module_mastery
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. SEED PERK STAT BONUSES
-- ============================================

INSERT INTO perk_stat_bonuses (perk_id, strength_bonus, vitality_bonus, intelligence_bonus, wisdom_bonus, defense_bonus) VALUES
-- BODY TREE (Strength + Vitality)
('body_foundation', 2, 2, 0, 0, 0),
('body_endurance_1', 0, 5, 0, 0, 0),
('body_endurance_2', 0, 8, 0, 0, 0),
('body_strength_1', 5, 0, 0, 0, 0),
('body_strength_2', 8, 0, 0, 0, 0),
('body_resilience', 3, 3, 0, 0, 2),
('body_peak_performance', 10, 10, 0, 0, 0),
('body_superhuman', 20, 15, 0, 0, 5),

-- MIND TREE (Intelligence + Wisdom)
('mind_foundation', 0, 0, 2, 2, 0),
('mind_focus_1', 0, 0, 0, 5, 0),
('mind_focus_2', 0, 0, 0, 8, 0),
('mind_intellect_1', 0, 0, 5, 0, 0),
('mind_intellect_2', 0, 0, 8, 0, 0),
('mind_clarity', 0, 0, 3, 3, 2),
('mind_genius', 0, 0, 15, 5, 0),
('mind_infinite', 0, 0, 25, 10, 0),

-- SPIRIT TREE (Wisdom + Vitality)
('spirit_foundation', 0, 2, 0, 2, 0),
('spirit_balance_1', 0, 3, 0, 3, 0),
('spirit_balance_2', 0, 5, 0, 5, 0),
('spirit_harmony', 0, 5, 2, 5, 2),
('spirit_enlightenment', 0, 8, 0, 12, 0),
('spirit_transcendence', 0, 15, 5, 20, 0),

-- WEALTH TREE (Defense + Wisdom)
('wealth_foundation', 0, 0, 0, 2, 2),
('wealth_savings_1', 0, 0, 0, 0, 5),
('wealth_savings_2', 0, 0, 0, 0, 8),
('wealth_strategy_1', 0, 0, 2, 5, 0),
('wealth_strategy_2', 0, 0, 3, 8, 0),
('wealth_prosperity', 0, 0, 5, 5, 10),
('wealth_abundance', 0, 0, 5, 10, 20),

-- SOCIAL TREE (Wisdom + Intelligence)
('social_foundation', 0, 0, 2, 2, 0),
('social_charisma_1', 0, 0, 0, 5, 0),
('social_charisma_2', 0, 0, 0, 8, 0),
('social_empathy_1', 0, 2, 3, 0, 0),
('social_empathy_2', 0, 3, 5, 0, 0),
('social_leadership', 0, 0, 8, 8, 4),
('social_influence', 0, 0, 15, 15, 5),

-- CRAFT TREE (Intelligence + Strength)
('craft_foundation', 2, 0, 2, 0, 0),
('craft_precision_1', 0, 0, 5, 0, 0),
('craft_precision_2', 0, 0, 8, 0, 0),
('craft_endurance_1', 5, 0, 0, 0, 0),
('craft_endurance_2', 8, 0, 0, 0, 0),
('craft_mastery', 5, 0, 10, 5, 0),
('craft_artisan', 15, 0, 20, 0, 5)

ON CONFLICT (perk_id) DO NOTHING;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
