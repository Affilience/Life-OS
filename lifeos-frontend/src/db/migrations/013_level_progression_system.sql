-- ============================================
-- Level Progression System Migration
-- ============================================
-- Features:
-- 1. Level-based titles/ranks
-- 2. Milestone rewards tracking
-- 3. Profile frames
-- 4. Passive XP bonuses
-- 5. Slot capacity tracking

-- ============================================
-- 1. User Level Progression Table
-- ============================================
-- Tracks user's level progression preferences and claimed rewards

CREATE TABLE IF NOT EXISTS user_level_progression (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Display preferences
  selected_frame TEXT DEFAULT 'none',
  custom_title TEXT DEFAULT NULL, -- If user wants to display a custom title instead of level-based
  show_level_badge BOOLEAN DEFAULT true,

  -- Slot tracking (calculated from level but cached for performance)
  pet_slots INTEGER DEFAULT 1,
  equipment_set_slots INTEGER DEFAULT 1,
  inventory_slots INTEGER DEFAULT 10,

  -- Bonus tracking
  level_xp_bonus DECIMAL(5,4) DEFAULT 0, -- Cached XP bonus multiplier

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- ============================================
-- 2. Claimed Milestones Table
-- ============================================
-- Tracks which level milestones have been claimed

CREATE TABLE IF NOT EXISTS user_claimed_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Milestone info
  milestone_level INTEGER NOT NULL,
  milestone_type TEXT NOT NULL, -- 'minor', 'regular', 'major', 'legendary'

  -- Rewards claimed
  credits_claimed INTEGER DEFAULT 0,
  xp_bonus_claimed INTEGER DEFAULT 0,
  equipment_unlocked TEXT DEFAULT NULL, -- Equipment ID if applicable
  frame_unlocked TEXT DEFAULT NULL, -- Frame ID if applicable
  pet_slot_unlocked BOOLEAN DEFAULT false,

  -- Timestamps
  claimed_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, milestone_level)
);

-- ============================================
-- 3. Profile Frames Table (Reference)
-- ============================================
-- Reference table for available frames (mostly for documentation)

CREATE TABLE IF NOT EXISTS profile_frames (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  min_level INTEGER NOT NULL,
  color TEXT NOT NULL,
  border_width INTEGER DEFAULT 3,
  animated BOOLEAN DEFAULT false,
  animation_type TEXT DEFAULT NULL,
  has_glow BOOLEAN DEFAULT false,
  glow_color TEXT DEFAULT NULL,
  gradient TEXT DEFAULT NULL,
  has_particles BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default frames
INSERT INTO profile_frames (id, name, min_level, color, border_width, animated, animation_type, has_glow, glow_color, gradient, has_particles)
VALUES
  ('none', 'No Frame', 1, 'transparent', 0, false, NULL, false, NULL, NULL, false),
  ('bronze', 'Bronze Frame', 25, '#CD7F32', 3, false, NULL, false, NULL, 'linear-gradient(135deg, #CD7F32, #8B4513)', false),
  ('silver', 'Silver Frame', 50, '#C0C0C0', 3, false, NULL, true, 'rgba(192, 192, 192, 0.5)', 'linear-gradient(135deg, #C0C0C0, #808080)', false),
  ('gold', 'Gold Frame', 75, '#FFD700', 4, false, NULL, true, 'rgba(255, 215, 0, 0.5)', 'linear-gradient(135deg, #FFD700, #B8860B)', false),
  ('diamond', 'Diamond Frame', 100, '#B9F2FF', 4, true, 'shimmer', true, 'rgba(185, 242, 255, 0.6)', 'linear-gradient(135deg, #B9F2FF, #00CED1, #B9F2FF)', false),
  ('legendary', 'Legendary Frame', 150, '#FF6B9D', 4, true, 'pulse', true, 'rgba(255, 107, 157, 0.6)', 'linear-gradient(135deg, #FF6B9D, #C850C0, #FF6B9D)', false),
  ('mythic', 'Mythic Frame', 200, '#DA70D6', 5, true, 'rainbow', true, 'rgba(218, 112, 214, 0.7)', 'linear-gradient(135deg, #DA70D6, #9932CC, #8A2BE2)', false),
  ('transcendent', 'Transcendent Frame', 300, '#00FFFF', 5, true, 'cosmic', true, 'rgba(0, 255, 255, 0.7)', 'linear-gradient(135deg, #00FFFF, #0080FF, #8000FF, #FF00FF)', false),
  ('eternal', 'Eternal Frame', 500, '#FFD700', 6, true, 'divine', true, 'rgba(255, 215, 0, 0.8)', 'linear-gradient(135deg, #FFD700, #FFFFFF, #FFD700)', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 4. Level Titles Table (Reference)
-- ============================================

CREATE TABLE IF NOT EXISTS level_titles (
  id SERIAL PRIMARY KEY,
  min_level INTEGER NOT NULL,
  max_level INTEGER NOT NULL,
  title TEXT NOT NULL,
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert level titles
INSERT INTO level_titles (min_level, max_level, title, color, icon)
VALUES
  (1, 9, 'Novice', '#9CA3AF', '🌱'),
  (10, 24, 'Apprentice', '#10B981', '📚'),
  (25, 49, 'Journeyman', '#3B82F6', '⚔️'),
  (50, 74, 'Expert', '#8B5CF6', '🎯'),
  (75, 99, 'Master', '#F59E0B', '👑'),
  (100, 149, 'Grand Master', '#EF4444', '🔥'),
  (150, 199, 'Legendary', '#EC4899', '⭐'),
  (200, 299, 'Mythic', '#D946EF', '💎'),
  (300, 499, 'Transcendent', '#06B6D4', '🌟'),
  (500, 999999, 'Eternal', '#FBBF24', '✨')
ON CONFLICT DO NOTHING;

-- ============================================
-- 5. Indexes for Performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_level_progression_user_id ON user_level_progression(user_id);
CREATE INDEX IF NOT EXISTS idx_user_claimed_milestones_user_id ON user_claimed_milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_user_claimed_milestones_level ON user_claimed_milestones(milestone_level);

-- ============================================
-- 6. Functions for Level Progression
-- ============================================

-- Function to get level title
CREATE OR REPLACE FUNCTION get_level_title(p_level INTEGER)
RETURNS TABLE(title TEXT, color TEXT, icon TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT lt.title, lt.color, lt.icon
  FROM level_titles lt
  WHERE p_level >= lt.min_level AND p_level <= lt.max_level
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate level XP bonus
CREATE OR REPLACE FUNCTION calculate_level_xp_bonus(p_level INTEGER)
RETURNS DECIMAL AS $$
DECLARE
  bonus DECIMAL;
  max_bonus DECIMAL := 1.0; -- 100%
  bonus_per_level DECIMAL := 0.0025; -- 0.25%
BEGIN
  bonus := (p_level - 1) * bonus_per_level;
  RETURN LEAST(bonus, max_bonus);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate pet slots
CREATE OR REPLACE FUNCTION calculate_pet_slots(p_level INTEGER)
RETURNS INTEGER AS $$
DECLARE
  base_slots INTEGER := 1;
  bonus_slots INTEGER := 0;
  slot_levels INTEGER[] := ARRAY[50, 100, 150, 200, 300, 500];
  l INTEGER;
BEGIN
  FOREACH l IN ARRAY slot_levels LOOP
    IF p_level >= l THEN
      bonus_slots := bonus_slots + 1;
    END IF;
  END LOOP;
  RETURN base_slots + bonus_slots;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate inventory slots
CREATE OR REPLACE FUNCTION calculate_inventory_slots(p_level INTEGER)
RETURNS INTEGER AS $$
DECLARE
  base_slots INTEGER := 10;
  bonus_slots INTEGER;
BEGIN
  bonus_slots := FLOOR(p_level / 10);
  RETURN base_slots + bonus_slots;
END;
$$ LANGUAGE plpgsql;

-- Function to initialize user level progression
CREATE OR REPLACE FUNCTION initialize_user_level_progression(p_user_id UUID, p_level INTEGER DEFAULT 1)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_level_progression (
    user_id,
    pet_slots,
    equipment_set_slots,
    inventory_slots,
    level_xp_bonus
  ) VALUES (
    p_user_id,
    calculate_pet_slots(p_level),
    1 + (SELECT COUNT(*) FROM unnest(ARRAY[50, 100, 200, 500]) AS l WHERE p_level >= l),
    calculate_inventory_slots(p_level),
    calculate_level_xp_bonus(p_level)
  )
  ON CONFLICT (user_id) DO UPDATE SET
    pet_slots = calculate_pet_slots(p_level),
    equipment_set_slots = 1 + (SELECT COUNT(*) FROM unnest(ARRAY[50, 100, 200, 500]) AS l WHERE p_level >= l),
    inventory_slots = calculate_inventory_slots(p_level),
    level_xp_bonus = calculate_level_xp_bonus(p_level),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to claim a milestone
CREATE OR REPLACE FUNCTION claim_level_milestone(
  p_user_id UUID,
  p_level INTEGER,
  p_milestone_type TEXT,
  p_credits INTEGER,
  p_xp_bonus INTEGER,
  p_equipment TEXT,
  p_frame TEXT,
  p_pet_slot BOOLEAN
)
RETURNS BOOLEAN AS $$
DECLARE
  already_claimed BOOLEAN;
BEGIN
  -- Check if already claimed
  SELECT EXISTS(
    SELECT 1 FROM user_claimed_milestones
    WHERE user_id = p_user_id AND milestone_level = p_level
  ) INTO already_claimed;

  IF already_claimed THEN
    RETURN FALSE;
  END IF;

  -- Insert claim record
  INSERT INTO user_claimed_milestones (
    user_id,
    milestone_level,
    milestone_type,
    credits_claimed,
    xp_bonus_claimed,
    equipment_unlocked,
    frame_unlocked,
    pet_slot_unlocked
  ) VALUES (
    p_user_id,
    p_level,
    p_milestone_type,
    p_credits,
    p_xp_bonus,
    p_equipment,
    p_frame,
    p_pet_slot
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. Row Level Security
-- ============================================

ALTER TABLE user_level_progression ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_claimed_milestones ENABLE ROW LEVEL SECURITY;

-- Policies for user_level_progression
CREATE POLICY "Users can view own level progression"
  ON user_level_progression FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own level progression"
  ON user_level_progression FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own level progression"
  ON user_level_progression FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policies for user_claimed_milestones
CREATE POLICY "Users can view own claimed milestones"
  ON user_claimed_milestones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own claimed milestones"
  ON user_claimed_milestones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Public read for reference tables
CREATE POLICY "Anyone can read profile frames"
  ON profile_frames FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Anyone can read level titles"
  ON level_titles FOR SELECT TO authenticated
  USING (true);
