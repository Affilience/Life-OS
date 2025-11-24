-- ============================================
-- UNIFIED GAMIFICATION SYSTEM - MIGRATION 002
-- Enhances existing schema with unified features
-- ============================================

-- ============================================
-- 1. CENTRAL EVENT PIPELINE
-- Tracks all gamification-triggering actions
-- ============================================

CREATE TABLE IF NOT EXISTS gamification_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Event identification
  event_type TEXT NOT NULL, -- 'mission_complete', 'journal_entry', 'fitness_log', 'manual_award'
  event_source TEXT NOT NULL, -- 'missions', 'journal', 'fitness', 'knowledge', 'admin'
  event_data JSONB NOT NULL DEFAULT '{}',

  -- Rewards calculated at event time
  xp_awarded INTEGER DEFAULT 0,
  credits_awarded INTEGER DEFAULT 0,
  module_xp_awarded JSONB DEFAULT '{}', -- {fitness: 100, journal: 50}

  -- Cascading effects triggered
  streak_updated BOOLEAN DEFAULT false,
  level_up_triggered BOOLEAN DEFAULT false,
  stage_transition BOOLEAN DEFAULT false,
  constellation_star_unlocked TEXT[], -- Array of constellation:star IDs
  achievements_unlocked UUID[], -- Array of discovery IDs
  equipment_unlocked UUID[], -- Array of equipment IDs

  -- Processing
  processed BOOLEAN DEFAULT true,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  processing_duration_ms INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gamification_events_user_id ON gamification_events(user_id);
CREATE INDEX idx_gamification_events_type ON gamification_events(event_type);
CREATE INDEX idx_gamification_events_source ON gamification_events(event_source);
CREATE INDEX idx_gamification_events_created ON gamification_events(created_at DESC);
CREATE INDEX idx_gamification_events_unprocessed ON gamification_events(processed) WHERE processed = false;

-- ============================================
-- 2. ENHANCED USER PROGRESS
-- Add cosmic evolution and equipment stats
-- ============================================

-- Add columns to existing user_module_progress
ALTER TABLE user_module_progress ADD COLUMN IF NOT EXISTS module_name TEXT;

-- Update module_id constraint to be compatible
ALTER TABLE user_module_progress DROP CONSTRAINT IF EXISTS user_module_progress_module_id_check;
ALTER TABLE user_module_progress ADD CONSTRAINT user_module_progress_module_id_check
  CHECK (module_id IN ('journal', 'knowledge', 'health', 'finance', 'productivity', 'cosmic_evolution', 'global'));

-- Add cosmic evolution specific columns
ALTER TABLE user_module_progress ADD COLUMN IF NOT EXISTS current_stage INTEGER DEFAULT 1;
ALTER TABLE user_module_progress ADD COLUMN IF NOT EXISTS stage_name TEXT;
ALTER TABLE user_module_progress ADD COLUMN IF NOT EXISTS xp_to_next_level INTEGER DEFAULT 100;

-- Add equipment stats
ALTER TABLE user_module_progress ADD COLUMN IF NOT EXISTS total_defense INTEGER DEFAULT 0;
ALTER TABLE user_module_progress ADD COLUMN IF NOT EXISTS total_strength INTEGER DEFAULT 0;
ALTER TABLE user_module_progress ADD COLUMN IF NOT EXISTS total_vitality INTEGER DEFAULT 0;
ALTER TABLE user_module_progress ADD COLUMN IF NOT EXISTS total_intelligence INTEGER DEFAULT 0;
ALTER TABLE user_module_progress ADD COLUMN IF NOT EXISTS total_wisdom INTEGER DEFAULT 0;

-- Add multipliers from perks/streaks
ALTER TABLE user_module_progress ADD COLUMN IF NOT EXISTS xp_multiplier DECIMAL(4,2) DEFAULT 1.00;
ALTER TABLE user_module_progress ADD COLUMN IF NOT EXISTS credit_multiplier DECIMAL(4,2) DEFAULT 1.00;

-- Add reset tracking for missions
ALTER TABLE user_module_progress ADD COLUMN IF NOT EXISTS last_daily_reset TIMESTAMPTZ;
ALTER TABLE user_module_progress ADD COLUMN IF NOT EXISTS last_weekly_reset TIMESTAMPTZ;
ALTER TABLE user_module_progress ADD COLUMN IF NOT EXISTS last_monthly_reset TIMESTAMPTZ;

-- ============================================
-- 3. ENHANCED STREAK SYSTEM
-- Add shields, milestones, and penalties
-- ============================================

-- Add shield mechanics
ALTER TABLE momentum_chains ADD COLUMN IF NOT EXISTS milestone_tier TEXT DEFAULT 'none';
ALTER TABLE momentum_chains ADD COLUMN IF NOT EXISTS milestone_reached_at TIMESTAMPTZ;
ALTER TABLE momentum_chains ADD COLUMN IF NOT EXISTS broken_count INTEGER DEFAULT 0;

-- Add penalty system
ALTER TABLE momentum_chains ADD COLUMN IF NOT EXISTS xp_penalty_active BOOLEAN DEFAULT false;
ALTER TABLE momentum_chains ADD COLUMN IF NOT EXISTS penalty_expires_at TIMESTAMPTZ;
ALTER TABLE momentum_chains ADD COLUMN IF NOT EXISTS penalty_percentage DECIMAL(3,2) DEFAULT 0.00;
ALTER TABLE momentum_chains ADD COLUMN IF NOT EXISTS momentum_locked BOOLEAN DEFAULT false;

-- Add global streak tracking
ALTER TABLE momentum_chains ADD COLUMN IF NOT EXISTS is_global BOOLEAN DEFAULT false;

-- Add constraint for milestone tiers
ALTER TABLE momentum_chains DROP CONSTRAINT IF EXISTS momentum_chains_milestone_tier_check;
ALTER TABLE momentum_chains ADD CONSTRAINT momentum_chains_milestone_tier_check
  CHECK (milestone_tier IN ('none', 'building', 'growing', 'momentum', 'legendary'));

-- Create index for global streak
CREATE INDEX IF NOT EXISTS idx_momentum_chains_global ON momentum_chains(user_id) WHERE is_global = true;

-- ============================================
-- 4. EQUIPMENT SYSTEM
-- Complete equipment implementation
-- ============================================

CREATE TABLE IF NOT EXISTS equipment_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Basic info
  name TEXT NOT NULL,
  description TEXT,
  lore_text TEXT, -- Cosmic-themed flavor text

  -- Equipment type
  slot TEXT NOT NULL CHECK (slot IN ('helmet', 'chest', 'weapon', 'shield', 'cape', 'ring', 'amulet')),
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),

  -- Stats
  defense INTEGER DEFAULT 0,
  strength INTEGER DEFAULT 0,
  vitality INTEGER DEFAULT 0,
  intelligence INTEGER DEFAULT 0,
  wisdom INTEGER DEFAULT 0,

  -- Requirements
  required_level INTEGER DEFAULT 1,
  required_constellation TEXT, -- 'orion', 'phoenix', etc.
  required_achievement UUID REFERENCES discoveries(id),

  -- Set bonuses
  set_name TEXT,
  set_bonus_3pc TEXT, -- Description of 3-piece bonus
  set_bonus_5pc TEXT, -- Description of 5-piece bonus
  set_bonus_full TEXT, -- Description of full set bonus
  set_bonus_stats JSONB DEFAULT '{}', -- {3: {xp_boost: 0.1}, 5: {xp_boost: 0.2, credit_boost: 0.15}}

  -- Visual
  image_path TEXT,
  icon TEXT,
  particle_effect TEXT, -- For legendary items

  -- Metadata
  unlock_method TEXT CHECK (unlock_method IN ('level', 'achievement', 'constellation', 'purchase', 'special')),
  is_tradeable BOOLEAN DEFAULT false,
  is_cosmetic_only BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  equipment_id UUID NOT NULL REFERENCES equipment_items(id) ON DELETE CASCADE,

  acquired_at TIMESTAMPTZ DEFAULT NOW(),
  is_equipped BOOLEAN DEFAULT false,
  slot_position INTEGER, -- For rings (1 or 2)

  -- Customization
  custom_name TEXT,
  is_favorite BOOLEAN DEFAULT false,

  UNIQUE(user_id, equipment_id)
);

CREATE INDEX idx_equipment_items_slot ON equipment_items(slot);
CREATE INDEX idx_equipment_items_rarity ON equipment_items(rarity);
CREATE INDEX idx_equipment_items_required_level ON equipment_items(required_level);
CREATE INDEX idx_equipment_items_set ON equipment_items(set_name) WHERE set_name IS NOT NULL;

CREATE INDEX idx_user_equipment_user ON user_equipment(user_id);
CREATE INDEX idx_user_equipment_equipped ON user_equipment(user_id, is_equipped) WHERE is_equipped = true;

-- ============================================
-- 5. ENHANCED DISCOVERIES/ACHIEVEMENTS
-- Add progression rewards and prerequisites
-- ============================================

-- Add new columns to existing discoveries table
ALTER TABLE discoveries ADD COLUMN IF NOT EXISTS xp_reward INTEGER DEFAULT 0;
ALTER TABLE discoveries ADD COLUMN IF NOT EXISTS credits_reward INTEGER DEFAULT 0;

-- Change category enum to include new types
ALTER TABLE discoveries DROP CONSTRAINT IF EXISTS discoveries_category_check;
ALTER TABLE discoveries ADD CONSTRAINT discoveries_category_check
  CHECK (category IN ('milestone', 'streak', 'mastery', 'exploration', 'collection', 'special', 'progression', 'consistency', 'social'));

-- Add prerequisites and rewards
ALTER TABLE discoveries ADD COLUMN IF NOT EXISTS required_level INTEGER;
ALTER TABLE discoveries ADD COLUMN IF NOT EXISTS required_streak INTEGER;
ALTER TABLE discoveries ADD COLUMN IF NOT EXISTS required_constellation TEXT;
ALTER TABLE discoveries ADD COLUMN IF NOT EXISTS prerequisite_achievements UUID[]; -- Must unlock these first

-- Add unlock rewards
ALTER TABLE discoveries ADD COLUMN IF NOT EXISTS unlocks_equipment UUID REFERENCES equipment_items(id);
ALTER TABLE discoveries ADD COLUMN IF NOT EXISTS unlocks_avatar_variant TEXT;
ALTER TABLE discoveries ADD COLUMN IF NOT EXISTS unlocks_perk UUID; -- Reference to perks table

-- Add repeatability
ALTER TABLE discoveries ADD COLUMN IF NOT EXISTS is_repeatable BOOLEAN DEFAULT false;
ALTER TABLE discoveries ADD COLUMN IF NOT EXISTS repeat_cooldown_days INTEGER;

-- Create achievement progress tracking
CREATE TABLE IF NOT EXISTS achievement_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  discovery_id UUID NOT NULL REFERENCES discoveries(id) ON DELETE CASCADE,

  current_progress INTEGER DEFAULT 0,
  required_progress INTEGER NOT NULL,
  progress_data JSONB DEFAULT '{}', -- Flexible storage for complex progress

  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  last_updated TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, discovery_id)
);

CREATE INDEX idx_achievement_progress_user ON achievement_progress(user_id);
CREATE INDEX idx_achievement_progress_incomplete ON achievement_progress(user_id, discovery_id) WHERE completed_at IS NULL;

-- ============================================
-- 6. PERK TREE SYSTEM
-- Complete skill tree implementation
-- ============================================

CREATE TABLE IF NOT EXISTS perks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Tree structure
  tree_name TEXT NOT NULL CHECK (tree_name IN ('body', 'mind', 'spirit', 'wealth', 'social', 'craft')),
  tier INTEGER NOT NULL CHECK (tier BETWEEN 1 AND 4),
  position_in_tier INTEGER, -- For UI layout

  -- Perk details
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  flavor_text TEXT, -- Cosmic lore
  icon TEXT,

  -- Requirements
  required_level INTEGER DEFAULT 1,
  required_constellations INTEGER DEFAULT 0, -- Number of completed constellations
  prerequisite_perks UUID[], -- Must unlock these perks first
  required_achievements UUID[], -- Optional achievement requirements

  -- Cost
  credit_cost INTEGER DEFAULT 100,

  -- Effects
  effect_type TEXT NOT NULL CHECK (effect_type IN (
    'xp_boost', 'credit_boost', 'stat_bonus', 'unlock_feature',
    'reduce_cost', 'special_ability', 'passive_bonus'
  )),
  effect_data JSONB NOT NULL, -- {percentage: 0.1, stat: 'strength', value: 5}

  -- Special properties
  is_keystone BOOLEAN DEFAULT false, -- Major perk at end of tier
  max_ranks INTEGER DEFAULT 1, -- For upgradeable perks

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_perks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  perk_id UUID NOT NULL REFERENCES perks(id) ON DELETE CASCADE,

  current_rank INTEGER DEFAULT 1,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true, -- Can be temporarily disabled

  UNIQUE(user_id, perk_id)
);

CREATE INDEX idx_perks_tree ON perks(tree_name, tier);
CREATE INDEX idx_perks_keystone ON perks(is_keystone) WHERE is_keystone = true;
CREATE INDEX idx_user_perks_user ON user_perks(user_id);
CREATE INDEX idx_user_perks_active ON user_perks(user_id, is_active) WHERE is_active = true;

-- ============================================
-- 7. CONSTELLATION SYSTEM ENHANCEMENT
-- Module-specific skill trees with XP tracking
-- ============================================

CREATE TABLE IF NOT EXISTS constellation_stars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  constellation_name TEXT NOT NULL CHECK (constellation_name IN ('orion', 'phoenix', 'athena', 'chronos', 'plutus')),
  star_number INTEGER NOT NULL,
  star_name TEXT, -- 'Betelgeuse', 'Rigel', etc.

  -- Requirements
  required_module_xp INTEGER NOT NULL,
  required_level INTEGER DEFAULT 1,
  prerequisite_stars UUID[], -- Must unlock these stars first

  -- Rewards
  xp_reward INTEGER DEFAULT 0,
  credit_reward INTEGER DEFAULT 0,
  reward_description TEXT,
  unlocks_perk UUID REFERENCES perks(id),

  -- Position for visualization
  position_x DECIMAL(5,2),
  position_y DECIMAL(5,2),
  position_z DECIMAL(5,2),

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(constellation_name, star_number)
);

CREATE TABLE IF NOT EXISTS user_constellation_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  constellation_name TEXT NOT NULL,

  -- Progress
  module_xp INTEGER DEFAULT 0, -- XP earned in this module
  unlocked_star_ids UUID[] DEFAULT '{}',
  unlocked_stars_count INTEGER DEFAULT 0,

  -- Completion
  completed_at TIMESTAMPTZ,
  completion_reward_claimed BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, constellation_name)
);

CREATE INDEX idx_constellation_stars_constellation ON constellation_stars(constellation_name, star_number);
CREATE INDEX idx_user_constellation_progress_user ON user_constellation_progress(user_id);
CREATE INDEX idx_user_constellation_progress_completed ON user_constellation_progress(completed_at) WHERE completed_at IS NOT NULL;

-- ============================================
-- 8. AGGREGATE VIEW FOR DASHBOARD
-- Single query to get complete gamification state
-- ============================================

CREATE OR REPLACE VIEW user_gamification_summary AS
SELECT
  u.id as user_id,

  -- Cosmic Evolution
  ce.level as current_level,
  ce.current_stage,
  ce.stage_name,
  ce.current_xp,
  ce.total_xp_earned as total_xp,
  ce.xp_to_next_level,

  -- Stats from equipment
  ce.total_defense,
  ce.total_strength,
  ce.total_vitality,
  ce.total_intelligence,
  ce.total_wisdom,

  -- Multipliers
  ce.xp_multiplier,
  ce.credit_multiplier,

  -- Currency
  COALESCE(ucc.cosmic_credits, 0) as cosmic_credits,
  COALESCE(ucc.lifetime_credits_earned, 0) as lifetime_credits_earned,
  COALESCE(ucc.lifetime_credits_spent, 0) as lifetime_credits_spent,

  -- Streaks
  (SELECT COUNT(*) FROM momentum_chains WHERE user_id = u.id AND current_streak > 0) as active_streaks_count,
  (SELECT MAX(current_streak) FROM momentum_chains WHERE user_id = u.id) as max_current_streak,
  (SELECT SUM(shields_available) FROM momentum_chains WHERE user_id = u.id) as total_shields,
  (SELECT milestone_tier FROM momentum_chains WHERE user_id = u.id AND is_global = true LIMIT 1) as global_streak_tier,

  -- Missions
  (SELECT COUNT(*)
   FROM user_missions
   WHERE user_id = u.id
   AND status = 'completed'
   AND completed_at > NOW() - INTERVAL '24 hours'
  ) as missions_completed_today,
  (SELECT COUNT(*) FROM user_missions WHERE user_id = u.id AND status = 'active') as active_missions_count,
  (SELECT COUNT(*) FROM user_missions WHERE user_id = u.id AND status = 'completed') as total_missions_completed,

  -- Achievements
  (SELECT COUNT(*) FROM user_discoveries WHERE user_id = u.id) as total_achievements,
  (SELECT COUNT(*)
   FROM user_discoveries ud
   JOIN discoveries d ON ud.discovery_id = d.id
   WHERE ud.user_id = u.id AND d.rarity = 'legendary'
  ) as legendary_achievements,
  (SELECT COUNT(*)
   FROM user_discoveries ud
   JOIN discoveries d ON ud.discovery_id = d.id
   WHERE ud.user_id = u.id AND d.rarity = 'cosmic'
  ) as cosmic_achievements,

  -- Equipment
  (SELECT COUNT(*) FROM user_equipment WHERE user_id = u.id) as total_equipment_owned,
  (SELECT COUNT(*) FROM user_equipment WHERE user_id = u.id AND is_equipped = true) as equipped_items_count,
  (SELECT json_agg(ei.set_name)
   FROM user_equipment ue
   JOIN equipment_items ei ON ue.equipment_id = ei.id
   WHERE ue.user_id = u.id AND ue.is_equipped = true AND ei.set_name IS NOT NULL
  ) as equipped_sets,

  -- Constellations
  (SELECT COUNT(*)
   FROM user_constellation_progress
   WHERE user_id = u.id AND completed_at IS NOT NULL
  ) as completed_constellations,
  (SELECT SUM(unlocked_stars_count)
   FROM user_constellation_progress
   WHERE user_id = u.id
  ) as total_stars_unlocked,

  -- Perks
  (SELECT COUNT(*) FROM user_perks WHERE user_id = u.id AND is_active = true) as active_perks_count,
  (SELECT COUNT(*) FROM user_perks WHERE user_id = u.id) as total_perks_unlocked,

  -- Recent activity
  (SELECT COUNT(*)
   FROM gamification_events
   WHERE user_id = u.id
   AND created_at > NOW() - INTERVAL '24 hours'
  ) as events_today,
  (SELECT MAX(created_at) FROM gamification_events WHERE user_id = u.id) as last_event_at

FROM auth.users u
LEFT JOIN user_module_progress ce ON u.id = ce.user_id AND ce.module_id = 'cosmic_evolution'
LEFT JOIN user_cosmic_currency ucc ON u.id = ucc.user_id;

-- ============================================
-- 9. FUNCTIONS FOR UNIFIED EVENT PROCESSING
-- ============================================

-- Main event processing function
CREATE OR REPLACE FUNCTION process_gamification_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_event_source TEXT,
  p_event_data JSONB
)
RETURNS JSONB AS $$
DECLARE
  v_event_id UUID;
  v_xp_base INTEGER := 0;
  v_xp_final INTEGER;
  v_credits INTEGER := 0;
  v_module_xp JSONB := '{}';
  v_streak_updated BOOLEAN := false;
  v_level_up BOOLEAN := false;
  v_stage_transition BOOLEAN := false;
  v_achievements UUID[] := '{}';
  v_xp_multiplier DECIMAL(4,2) := 1.0;
  v_result JSONB;
  v_start_time TIMESTAMPTZ := clock_timestamp();
BEGIN
  -- Determine base rewards based on event type
  CASE p_event_type
    WHEN 'mission_complete' THEN
      -- Get mission rewards
      SELECT xp_reward, credits_reward INTO v_xp_base, v_credits
      FROM missions m
      JOIN user_missions um ON m.id = um.mission_id
      WHERE um.id = (p_event_data->>'user_mission_id')::UUID;

    WHEN 'journal_entry' THEN
      v_xp_base := 50;
      v_credits := 10;
      v_module_xp := jsonb_build_object('journal', 50);

    WHEN 'fitness_log' THEN
      v_xp_base := 75;
      v_credits := 15;
      v_module_xp := jsonb_build_object('health', 75);

    WHEN 'knowledge_tracked' THEN
      v_xp_base := 100;
      v_credits := 20;
      v_module_xp := jsonb_build_object('knowledge', 100);

    WHEN 'manual_xp' THEN
      v_xp_base := COALESCE((p_event_data->>'xp_amount')::INTEGER, 0);
      v_credits := COALESCE((p_event_data->>'credits')::INTEGER, 0);
  END CASE;

  -- Get user's XP multiplier
  SELECT xp_multiplier INTO v_xp_multiplier
  FROM user_module_progress
  WHERE user_id = p_user_id AND module_id = 'cosmic_evolution';

  v_xp_multiplier := COALESCE(v_xp_multiplier, 1.0);
  v_xp_final := FLOOR(v_xp_base * v_xp_multiplier);

  -- Award XP to cosmic evolution
  PERFORM award_module_xp(p_user_id, 'cosmic_evolution', v_xp_final);

  -- Award module-specific XP if applicable
  IF v_module_xp != '{}'::jsonb THEN
    -- TODO: Loop through module_xp and award to each module
    NULL;
  END IF;

  -- Award credits
  IF v_credits > 0 THEN
    PERFORM award_cosmic_credits(
      p_user_id,
      v_credits,
      p_event_type,
      'Event reward',
      NULL,
      p_event_source
    );
  END IF;

  -- Update streak if applicable
  IF p_event_type IN ('mission_complete', 'journal_entry', 'fitness_log', 'knowledge_tracked') THEN
    -- TODO: Call streak update function
    v_streak_updated := true;
  END IF;

  -- Check for level up and stage transition
  -- TODO: Implement level/stage check logic

  -- Check for newly unlocked achievements
  -- TODO: Implement achievement scanning

  -- Record the event
  INSERT INTO gamification_events (
    user_id, event_type, event_source, event_data,
    xp_awarded, credits_awarded, module_xp_awarded,
    streak_updated, level_up_triggered, stage_transition,
    achievements_unlocked,
    processing_duration_ms
  ) VALUES (
    p_user_id, p_event_type, p_event_source, p_event_data,
    v_xp_final, v_credits, v_module_xp,
    v_streak_updated, v_level_up, v_stage_transition,
    v_achievements,
    EXTRACT(MILLISECONDS FROM clock_timestamp() - v_start_time)::INTEGER
  ) RETURNING id INTO v_event_id;

  -- Build result
  v_result := jsonb_build_object(
    'success', true,
    'event_id', v_event_id,
    'xp_awarded', v_xp_final,
    'xp_multiplier', v_xp_multiplier,
    'credits_awarded', v_credits,
    'streak_updated', v_streak_updated,
    'level_up', v_level_up,
    'stage_transition', v_stage_transition,
    'achievements_unlocked', v_achievements
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate user's total XP multiplier
CREATE OR REPLACE FUNCTION calculate_xp_multiplier(p_user_id UUID)
RETURNS DECIMAL(4,2) AS $$
DECLARE
  v_multiplier DECIMAL(4,2) := 1.0;
  v_max_streak INTEGER;
  v_perk_bonuses DECIMAL(4,2);
  v_equipment_bonus DECIMAL(4,2);
BEGIN
  -- Streak bonus
  SELECT MAX(current_streak) INTO v_max_streak
  FROM momentum_chains
  WHERE user_id = p_user_id;

  IF v_max_streak >= 365 THEN v_multiplier := v_multiplier + 0.25;
  ELSIF v_max_streak >= 90 THEN v_multiplier := v_multiplier + 0.15;
  ELSIF v_max_streak >= 30 THEN v_multiplier := v_multiplier + 0.10;
  ELSIF v_max_streak >= 7 THEN v_multiplier := v_multiplier + 0.05;
  END IF;

  -- Perk bonuses
  SELECT COALESCE(SUM((p.effect_data->>'percentage')::DECIMAL), 0) INTO v_perk_bonuses
  FROM user_perks up
  JOIN perks p ON up.perk_id = p.id
  WHERE up.user_id = p_user_id
  AND up.is_active = true
  AND p.effect_type = 'xp_boost';

  v_multiplier := v_multiplier + COALESCE(v_perk_bonuses, 0);

  -- Equipment set bonuses
  -- TODO: Implement set bonus calculation

  RETURN v_multiplier;
END;
$$ LANGUAGE plpgsql;

-- Function to update equipment stats on user progress
CREATE OR REPLACE FUNCTION update_user_equipment_stats(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_total_defense INTEGER;
  v_total_strength INTEGER;
  v_total_vitality INTEGER;
  v_total_intelligence INTEGER;
  v_total_wisdom INTEGER;
BEGIN
  -- Calculate totals from equipped items
  SELECT
    COALESCE(SUM(ei.defense), 0),
    COALESCE(SUM(ei.strength), 0),
    COALESCE(SUM(ei.vitality), 0),
    COALESCE(SUM(ei.intelligence), 0),
    COALESCE(SUM(ei.wisdom), 0)
  INTO
    v_total_defense,
    v_total_strength,
    v_total_vitality,
    v_total_intelligence,
    v_total_wisdom
  FROM user_equipment ue
  JOIN equipment_items ei ON ue.equipment_id = ei.id
  WHERE ue.user_id = p_user_id AND ue.is_equipped = true;

  -- Update user progress
  UPDATE user_module_progress
  SET
    total_defense = v_total_defense,
    total_strength = v_total_strength,
    total_vitality = v_total_vitality,
    total_intelligence = v_total_intelligence,
    total_wisdom = v_total_wisdom
  WHERE user_id = p_user_id AND module_id = 'cosmic_evolution';
END;
$$ LANGUAGE plpgsql;

-- Trigger to update equipment stats when items are equipped/unequipped
CREATE OR REPLACE FUNCTION trigger_update_equipment_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND (OLD.is_equipped != NEW.is_equipped) THEN
    PERFORM update_user_equipment_stats(NEW.user_id);
  ELSIF TG_OP = 'INSERT' AND NEW.is_equipped = true THEN
    PERFORM update_user_equipment_stats(NEW.user_id);
  ELSIF TG_OP = 'DELETE' AND OLD.is_equipped = true THEN
    PERFORM update_user_equipment_stats(OLD.user_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_equipment_stats_update
AFTER INSERT OR UPDATE OR DELETE ON user_equipment
FOR EACH ROW EXECUTE FUNCTION trigger_update_equipment_stats();

-- ============================================
-- 10. ROW LEVEL SECURITY FOR NEW TABLES
-- ============================================

ALTER TABLE gamification_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE perks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_perks ENABLE ROW LEVEL SECURITY;
ALTER TABLE constellation_stars ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_constellation_progress ENABLE ROW LEVEL SECURITY;

-- Gamification events
CREATE POLICY "Users can view own events" ON gamification_events FOR SELECT USING (auth.uid() = user_id);

-- Equipment items (public read)
CREATE POLICY "Anyone can view equipment items" ON equipment_items FOR SELECT USING (true);

-- User equipment
CREATE POLICY "Users can view own equipment" ON user_equipment FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own equipment" ON user_equipment FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own equipment" ON user_equipment FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own equipment" ON user_equipment FOR DELETE USING (auth.uid() = user_id);

-- Achievement progress
CREATE POLICY "Users can view own progress" ON achievement_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON achievement_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON achievement_progress FOR UPDATE USING (auth.uid() = user_id);

-- Perks (public read)
CREATE POLICY "Anyone can view perks" ON perks FOR SELECT USING (true);

-- User perks
CREATE POLICY "Users can view own perks" ON user_perks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own perks" ON user_perks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own perks" ON user_perks FOR UPDATE USING (auth.uid() = user_id);

-- Constellation stars (public read)
CREATE POLICY "Anyone can view constellation stars" ON constellation_stars FOR SELECT USING (true);

-- User constellation progress
CREATE POLICY "Users can view own constellation progress" ON user_constellation_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own constellation progress" ON user_constellation_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own constellation progress" ON user_constellation_progress FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 11. SEED DATA FOR EQUIPMENT
-- ============================================

-- Common Training Equipment (Level 1)
INSERT INTO equipment_items (name, description, slot, rarity, required_level, defense, strength, image_path, unlock_method) VALUES
('Training Helmet', 'Basic protective headgear for novice cosmic travelers', 'helmet', 'common', 1, 2, 0, '/assets/equipment/helmets/training.png', 'level'),
('Training Vest', 'Simple armor for beginning your journey', 'chest', 'common', 1, 3, 0, '/assets/equipment/chest/vest.png', 'level'),
('Training Sword', 'Your first weapon in the cosmic adventure', 'weapon', 'common', 1, 0, 2, '/assets/equipment/weapons/training-sword.png', 'level'),
('Wooden Shield', 'Basic defensive equipment', 'shield', 'common', 1, 2, 0, '/assets/equipment/shields/wooden.png', 'level');

-- Uncommon Iron Equipment (Level 15)
INSERT INTO equipment_items (name, description, slot, rarity, required_level, defense, strength, vitality, set_name, image_path, unlock_method) VALUES
('Iron Helmet', 'Sturdy iron protection', 'helmet', 'uncommon', 15, 5, 0, 2, 'iron_set', '/assets/equipment/helmets/iron.png', 'level'),
('Iron Chestplate', 'Heavy iron armor for seasoned travelers', 'chest', 'uncommon', 15, 8, 0, 3, 'iron_set', '/assets/equipment/chest/iron.png', 'level'),
('Iron Sword', 'Sharp blade forged from stellar iron', 'weapon', 'uncommon', 15, 0, 5, 0, 'iron_set', '/assets/equipment/weapons/iron-sword.png', 'level'),
('Iron Shield', 'Reinforced shield', 'shield', 'uncommon', 15, 5, 0, 2, 'iron_set', '/assets/equipment/shields/iron.png', 'level');

-- Rare Dragon Equipment (Level 30) with set bonuses
INSERT INTO equipment_items (name, description, lore_text, slot, rarity, required_level, defense, strength, vitality, wisdom, set_name, set_bonus_3pc, set_bonus_5pc, image_path, unlock_method) VALUES
('Dragon Helm', 'Helmet forged from dragon scales', 'Said to grant the wisdom of ancient cosmic dragons', 'helmet', 'rare', 30, 10, 3, 5, 2, 'dragon_knight', '+10% XP gain', '+20% XP gain, +10% cosmic credits', '/assets/equipment/helmets/dragon.png', 'level'),
('Dragon Scale Armor', 'Chest piece made from shimmering dragon scales', 'Each scale pulses with stellar energy', 'chest', 'rare', 30, 15, 5, 8, 3, 'dragon_knight', '+10% XP gain', '+20% XP gain, +10% cosmic credits', '/assets/equipment/chest/dragon-scale.png', 'level'),
('Dragon Blade', 'Legendary sword tempered in dragon fire', 'Burns with the fury of a thousand stars', 'weapon', 'rare', 30, 2, 12, 3, 0, 'dragon_knight', '+10% XP gain', '+20% XP gain, +10% cosmic credits', '/assets/equipment/weapons/dragon-blade.png', 'level');

-- Accessories
INSERT INTO equipment_items (name, description, slot, rarity, required_level, vitality, image_path, unlock_method) VALUES
('Vitality Amulet', 'Pulsing gem that enhances life force', 'amulet', 'uncommon', 10, 5, '/assets/equipment/amulets/vitality.png', 'level');

INSERT INTO equipment_items (name, description, slot, rarity, required_level, strength, intelligence, image_path, unlock_method) VALUES
('Ring of Strength', 'Increases physical power', 'ring', 'uncommon', 10, 3, 0, '/assets/equipment/rings/strength.png', 'level'),
('Ring of Intelligence', 'Sharpens mental acuity', 'ring', 'uncommon', 10, 0, 3, '/assets/equipment/rings/intelligence.png', 'level');

-- Capes
INSERT INTO equipment_items (name, description, slot, rarity, required_level, defense, wisdom, image_path, unlock_method) VALUES
('Basic Cape', 'Simple traveling cloak', 'cape', 'common', 5, 1, 1, '/assets/equipment/capes/basic.png', 'level'),
('Shadow Cape', 'Mysterious cape that shifts with the void', 'cape', 'rare', 25, 5, 8, '/assets/equipment/capes/shadow.png', 'achievement');

-- ============================================
-- 12. UPDATE TRIGGERS FOR NEW TABLES
-- ============================================

CREATE TRIGGER update_equipment_items_updated_at
BEFORE UPDATE ON equipment_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_perks_updated_at
BEFORE UPDATE ON perks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_constellation_progress_updated_at
BEFORE UPDATE ON user_constellation_progress
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
