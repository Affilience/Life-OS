-- ============================================
-- SECURITY HARDENING MIGRATION 019
-- Fixes RLS performance issues and function security
-- IMPORTANT: Does NOT change any functionality, only improves security
-- ============================================

-- ============================================
-- 1. FIX FUNCTION SEARCH PATHS
-- All functions must have SET search_path = '' to prevent injection attacks
-- ============================================

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- Fix award_module_xp function
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
  INSERT INTO public.user_module_progress (user_id, module_id, current_xp, total_xp_earned, level)
  VALUES (p_user_id, p_module_id, p_xp_amount, p_xp_amount, 1)
  ON CONFLICT (user_id, module_id)
  DO UPDATE SET
    current_xp = public.user_module_progress.current_xp + p_xp_amount,
    total_xp_earned = public.user_module_progress.total_xp_earned + p_xp_amount,
    last_activity = NOW()
  RETURNING current_xp, level INTO v_new_xp, v_old_level;

  -- Calculate new level (simple formula: level = floor(xp / 500) + 1)
  v_new_level := FLOOR(v_new_xp / 500) + 1;

  IF v_new_level > v_old_level THEN
    v_level_up := true;
    UPDATE public.user_module_progress
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
$$ LANGUAGE plpgsql SET search_path = '';

-- Fix award_cosmic_credits function
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
  INSERT INTO public.user_cosmic_currency (user_id, cosmic_credits, lifetime_credits_earned)
  VALUES (p_user_id, p_amount, p_amount)
  ON CONFLICT (user_id)
  DO UPDATE SET
    cosmic_credits = public.user_cosmic_currency.cosmic_credits + p_amount,
    lifetime_credits_earned = public.user_cosmic_currency.lifetime_credits_earned + p_amount
  RETURNING cosmic_credits INTO v_new_balance;

  -- Record transaction
  INSERT INTO public.currency_transactions (
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
$$ LANGUAGE plpgsql SET search_path = '';

-- Fix process_gamification_event function
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
      FROM public.missions m
      JOIN public.user_missions um ON m.id = um.mission_id
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
  FROM public.user_module_progress
  WHERE user_id = p_user_id AND module_id = 'cosmic_evolution';

  v_xp_multiplier := COALESCE(v_xp_multiplier, 1.0);
  v_xp_final := FLOOR(v_xp_base * v_xp_multiplier);

  -- Award XP to cosmic evolution
  PERFORM award_module_xp(p_user_id, 'cosmic_evolution', v_xp_final);

  -- Award module-specific XP if applicable
  IF v_module_xp != '{}'::jsonb THEN
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
    v_streak_updated := true;
  END IF;

  -- Record the event
  INSERT INTO public.gamification_events (
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
$$ LANGUAGE plpgsql SET search_path = '';

-- Fix calculate_xp_multiplier function
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
  FROM public.momentum_chains
  WHERE user_id = p_user_id;

  IF v_max_streak >= 365 THEN v_multiplier := v_multiplier + 0.25;
  ELSIF v_max_streak >= 90 THEN v_multiplier := v_multiplier + 0.15;
  ELSIF v_max_streak >= 30 THEN v_multiplier := v_multiplier + 0.10;
  ELSIF v_max_streak >= 7 THEN v_multiplier := v_multiplier + 0.05;
  END IF;

  -- Perk bonuses
  SELECT COALESCE(SUM((p.effect_data->>'percentage')::DECIMAL), 0) INTO v_perk_bonuses
  FROM public.user_perks up
  JOIN public.perks p ON up.perk_id = p.id
  WHERE up.user_id = p_user_id
  AND up.is_active = true
  AND p.effect_type = 'xp_boost';

  v_multiplier := v_multiplier + COALESCE(v_perk_bonuses, 0);

  RETURN v_multiplier;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- Fix update_user_equipment_stats function
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
  FROM public.user_equipment ue
  JOIN public.equipment_items ei ON ue.equipment_id = ei.id
  WHERE ue.user_id = p_user_id AND ue.is_equipped = true;

  -- Update user progress
  UPDATE public.user_module_progress
  SET
    total_defense = v_total_defense,
    total_strength = v_total_strength,
    total_vitality = v_total_vitality,
    total_intelligence = v_total_intelligence,
    total_wisdom = v_total_wisdom
  WHERE user_id = p_user_id AND module_id = 'cosmic_evolution';
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- Fix trigger_update_equipment_stats function
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
$$ LANGUAGE plpgsql SET search_path = '';

-- Fix are_friends function (SECURITY DEFINER needs search_path)
CREATE OR REPLACE FUNCTION are_friends(user1_id UUID, user2_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.friendships
    WHERE status = 'accepted'
    AND (
      (requester_id = user1_id AND addressee_id = user2_id)
      OR (requester_id = user2_id AND addressee_id = user1_id)
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Fix is_blocked function (SECURITY DEFINER needs search_path)
CREATE OR REPLACE FUNCTION is_blocked(checker_id UUID, target_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_blocks
    WHERE (blocker_id = checker_id AND blocked_id = target_id)
       OR (blocker_id = target_id AND blocked_id = checker_id)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Fix update_guild_member_count function
CREATE OR REPLACE FUNCTION update_guild_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.guilds SET member_count = member_count + 1 WHERE id = NEW.guild_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.guilds SET member_count = member_count - 1 WHERE id = OLD.guild_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- Fix update_activity_like_count function
CREATE OR REPLACE FUNCTION update_activity_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.activity_feed SET like_count = like_count + 1 WHERE id = NEW.activity_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.activity_feed SET like_count = like_count - 1 WHERE id = OLD.activity_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- Fix update_activity_comment_count function
CREATE OR REPLACE FUNCTION update_activity_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.activity_feed SET comment_count = comment_count + 1 WHERE id = NEW.activity_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.activity_feed SET comment_count = comment_count - 1 WHERE id = OLD.activity_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SET search_path = '';


-- ============================================
-- 2. OPTIMIZE RLS POLICIES FOR PERFORMANCE
-- Use (SELECT auth.uid()) instead of auth.uid() for caching
-- Add TO clause for explicit role targeting
-- ============================================

-- ============================================
-- USER_MODULE_PROGRESS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view own progress" ON user_module_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON user_module_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON user_module_progress;

CREATE POLICY "Users can view own progress"
  ON user_module_progress FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_module_progress FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own progress"
  ON user_module_progress FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- ============================================
-- USER_COSMIC_CURRENCY POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view own currency" ON user_cosmic_currency;
DROP POLICY IF EXISTS "Users can insert own currency" ON user_cosmic_currency;
DROP POLICY IF EXISTS "Users can update own currency" ON user_cosmic_currency;

CREATE POLICY "Users can view own currency"
  ON user_cosmic_currency FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own currency"
  ON user_cosmic_currency FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own currency"
  ON user_cosmic_currency FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- ============================================
-- CURRENCY_TRANSACTIONS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view own transactions" ON currency_transactions;

CREATE POLICY "Users can view own transactions"
  ON currency_transactions FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- ============================================
-- MISSIONS POLICIES (public read for active missions)
-- ============================================
DROP POLICY IF EXISTS "Anyone can view active missions" ON missions;

CREATE POLICY "Anyone can view active missions"
  ON missions FOR SELECT
  TO authenticated, anon
  USING (active = true);

-- ============================================
-- USER_MISSIONS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view own missions" ON user_missions;
DROP POLICY IF EXISTS "Users can insert own missions" ON user_missions;
DROP POLICY IF EXISTS "Users can update own missions" ON user_missions;

CREATE POLICY "Users can view own missions"
  ON user_missions FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own missions"
  ON user_missions FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own missions"
  ON user_missions FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- ============================================
-- MOMENTUM_CHAINS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view own chains" ON momentum_chains;
DROP POLICY IF EXISTS "Users can insert own chains" ON momentum_chains;
DROP POLICY IF EXISTS "Users can update own chains" ON momentum_chains;

CREATE POLICY "Users can view own chains"
  ON momentum_chains FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own chains"
  ON momentum_chains FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own chains"
  ON momentum_chains FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- ============================================
-- MOMENTUM_EVENTS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view own events" ON momentum_events;
DROP POLICY IF EXISTS "Users can insert own events" ON momentum_events;

CREATE POLICY "Users can view own events"
  ON momentum_events FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own events"
  ON momentum_events FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- ============================================
-- DISCOVERIES POLICIES (public read for non-secret)
-- ============================================
DROP POLICY IF EXISTS "Anyone can view non-secret discoveries" ON discoveries;

CREATE POLICY "Anyone can view non-secret discoveries"
  ON discoveries FOR SELECT
  TO authenticated, anon
  USING (
    is_secret = false
    OR id IN (
      SELECT discovery_id FROM public.user_discoveries
      WHERE user_id = (SELECT auth.uid())
    )
  );

-- ============================================
-- USER_DISCOVERIES POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view own discoveries" ON user_discoveries;
DROP POLICY IF EXISTS "Users can insert own discoveries" ON user_discoveries;
DROP POLICY IF EXISTS "Users can update own discoveries" ON user_discoveries;

CREATE POLICY "Users can view own discoveries"
  ON user_discoveries FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own discoveries"
  ON user_discoveries FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own discoveries"
  ON user_discoveries FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- ============================================
-- REWARDS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view own rewards" ON rewards;
DROP POLICY IF EXISTS "Users can insert own rewards" ON rewards;
DROP POLICY IF EXISTS "Users can update own rewards" ON rewards;
DROP POLICY IF EXISTS "Users can delete own rewards" ON rewards;

CREATE POLICY "Users can view own rewards"
  ON rewards FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own rewards"
  ON rewards FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own rewards"
  ON rewards FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own rewards"
  ON rewards FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- ============================================
-- REWARD_REDEMPTIONS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view own redemptions" ON reward_redemptions;
DROP POLICY IF EXISTS "Users can insert own redemptions" ON reward_redemptions;

CREATE POLICY "Users can view own redemptions"
  ON reward_redemptions FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own redemptions"
  ON reward_redemptions FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- ============================================
-- GAMIFICATION_EVENTS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view own events" ON gamification_events;
DROP POLICY IF EXISTS "Users can insert own events" ON gamification_events;
DROP POLICY IF EXISTS "Users can update own events" ON gamification_events;

CREATE POLICY "Users can view own gamification_events"
  ON gamification_events FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own gamification_events"
  ON gamification_events FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own gamification_events"
  ON gamification_events FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- ============================================
-- EQUIPMENT_ITEMS POLICIES (public read)
-- ============================================
DROP POLICY IF EXISTS "Anyone can view equipment items" ON equipment_items;

CREATE POLICY "Anyone can view equipment items"
  ON equipment_items FOR SELECT
  TO authenticated, anon
  USING (true);

-- ============================================
-- USER_EQUIPMENT POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view own equipment" ON user_equipment;
DROP POLICY IF EXISTS "Users can insert own equipment" ON user_equipment;
DROP POLICY IF EXISTS "Users can update own equipment" ON user_equipment;
DROP POLICY IF EXISTS "Users can delete own equipment" ON user_equipment;

CREATE POLICY "Users can view own equipment"
  ON user_equipment FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own equipment"
  ON user_equipment FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own equipment"
  ON user_equipment FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own equipment"
  ON user_equipment FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- ============================================
-- ACHIEVEMENT_PROGRESS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view own progress" ON achievement_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON achievement_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON achievement_progress;

CREATE POLICY "Users can view own achievement_progress"
  ON achievement_progress FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own achievement_progress"
  ON achievement_progress FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own achievement_progress"
  ON achievement_progress FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- ============================================
-- PERKS POLICIES (public read)
-- ============================================
DROP POLICY IF EXISTS "Anyone can view perks" ON perks;

CREATE POLICY "Anyone can view perks"
  ON perks FOR SELECT
  TO authenticated, anon
  USING (true);

-- ============================================
-- USER_PERKS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view own perks" ON user_perks;
DROP POLICY IF EXISTS "Users can insert own perks" ON user_perks;
DROP POLICY IF EXISTS "Users can update own perks" ON user_perks;

CREATE POLICY "Users can view own perks"
  ON user_perks FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own perks"
  ON user_perks FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own perks"
  ON user_perks FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- ============================================
-- CONSTELLATION_STARS POLICIES (public read)
-- ============================================
DROP POLICY IF EXISTS "Anyone can view constellation stars" ON constellation_stars;

CREATE POLICY "Anyone can view constellation stars"
  ON constellation_stars FOR SELECT
  TO authenticated, anon
  USING (true);

-- ============================================
-- USER_CONSTELLATION_PROGRESS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view own constellation progress" ON user_constellation_progress;
DROP POLICY IF EXISTS "Users can insert own constellation progress" ON user_constellation_progress;
DROP POLICY IF EXISTS "Users can update own constellation progress" ON user_constellation_progress;

CREATE POLICY "Users can view own constellation progress"
  ON user_constellation_progress FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own constellation progress"
  ON user_constellation_progress FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own constellation progress"
  ON user_constellation_progress FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- ============================================
-- CONTENT_ITEMS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view own content" ON content_items;
DROP POLICY IF EXISTS "Users can insert own content" ON content_items;
DROP POLICY IF EXISTS "Users can update own content" ON content_items;
DROP POLICY IF EXISTS "Users can delete own content" ON content_items;

CREATE POLICY "Users can view own content"
  ON content_items FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own content"
  ON content_items FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own content"
  ON content_items FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own content"
  ON content_items FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- ============================================
-- USER_VALUES POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can manage own values" ON user_values;

CREATE POLICY "Users can view own values"
  ON user_values FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own values"
  ON user_values FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own values"
  ON user_values FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own values"
  ON user_values FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- ============================================
-- USER_DECISIONS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can manage own decisions" ON user_decisions;

CREATE POLICY "Users can view own decisions"
  ON user_decisions FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own decisions"
  ON user_decisions FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own decisions"
  ON user_decisions FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own decisions"
  ON user_decisions FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- ============================================
-- USER_IDENTITY_CHECKINS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can manage own checkins" ON user_identity_checkins;

CREATE POLICY "Users can view own checkins"
  ON user_identity_checkins FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own checkins"
  ON user_identity_checkins FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own checkins"
  ON user_identity_checkins FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own checkins"
  ON user_identity_checkins FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- ============================================
-- USER_PURPOSE POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can manage own purpose" ON user_purpose;

CREATE POLICY "Users can view own purpose"
  ON user_purpose FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own purpose"
  ON user_purpose FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own purpose"
  ON user_purpose FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own purpose"
  ON user_purpose FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- ============================================
-- USER_QUOTES POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can manage own quotes" ON user_quotes;

CREATE POLICY "Users can view own quotes"
  ON user_quotes FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own quotes"
  ON user_quotes FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own quotes"
  ON user_quotes FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own quotes"
  ON user_quotes FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- ============================================
-- DAILY_TASKS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can manage own daily tasks" ON daily_tasks;

CREATE POLICY "Users can view own daily_tasks"
  ON daily_tasks FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own daily_tasks"
  ON daily_tasks FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own daily_tasks"
  ON daily_tasks FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own daily_tasks"
  ON daily_tasks FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- ============================================
-- DAILY_TASK_TEMPLATES POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can manage own templates" ON daily_task_templates;

CREATE POLICY "Users can view own templates"
  ON daily_task_templates FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own templates"
  ON daily_task_templates FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own templates"
  ON daily_task_templates FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own templates"
  ON daily_task_templates FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- ============================================
-- USER_RESOLUTIONS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can manage own resolutions" ON user_resolutions;

CREATE POLICY "Users can view own resolutions"
  ON user_resolutions FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own resolutions"
  ON user_resolutions FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own resolutions"
  ON user_resolutions FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own resolutions"
  ON user_resolutions FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- ============================================
-- USER_RESOLUTION_CHECK_INS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can manage own check-ins" ON user_resolution_check_ins;

CREATE POLICY "Users can view own resolution_check_ins"
  ON user_resolution_check_ins FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own resolution_check_ins"
  ON user_resolution_check_ins FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own resolution_check_ins"
  ON user_resolution_check_ins FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own resolution_check_ins"
  ON user_resolution_check_ins FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- ============================================
-- SOCIAL TABLES POLICIES (Optimized)
-- ============================================

-- Friendships
DROP POLICY IF EXISTS "Users can view their friendships" ON friendships;
DROP POLICY IF EXISTS "Users can create friend requests" ON friendships;
DROP POLICY IF EXISTS "Users can update their friend requests" ON friendships;
DROP POLICY IF EXISTS "Users can delete their friendships" ON friendships;

CREATE POLICY "Users can view their friendships"
  ON friendships FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = requester_id OR (SELECT auth.uid()) = addressee_id);

CREATE POLICY "Users can create friend requests"
  ON friendships FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = requester_id);

CREATE POLICY "Users can update their friend requests"
  ON friendships FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = requester_id OR (SELECT auth.uid()) = addressee_id);

CREATE POLICY "Users can delete their friendships"
  ON friendships FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = requester_id OR (SELECT auth.uid()) = addressee_id);

-- User blocks
DROP POLICY IF EXISTS "Users can view their blocks" ON user_blocks;
DROP POLICY IF EXISTS "Users can create blocks" ON user_blocks;
DROP POLICY IF EXISTS "Users can delete their blocks" ON user_blocks;

CREATE POLICY "Users can view their blocks"
  ON user_blocks FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = blocker_id);

CREATE POLICY "Users can create blocks"
  ON user_blocks FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = blocker_id);

CREATE POLICY "Users can delete their blocks"
  ON user_blocks FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = blocker_id);

-- Guilds (public read)
DROP POLICY IF EXISTS "Anyone can view guilds" ON guilds;
DROP POLICY IF EXISTS "Authenticated users can create guilds" ON guilds;
DROP POLICY IF EXISTS "Guild owners can update guilds" ON guilds;
DROP POLICY IF EXISTS "Guild owners can delete guilds" ON guilds;

CREATE POLICY "Anyone can view guilds"
  ON guilds FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can create guilds"
  ON guilds FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "Guild owners can update guilds"
  ON guilds FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = owner_id);

CREATE POLICY "Guild owners can delete guilds"
  ON guilds FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = owner_id);

-- Guild members
DROP POLICY IF EXISTS "Anyone can view guild members" ON guild_members;
DROP POLICY IF EXISTS "Users can join guilds" ON guild_members;
DROP POLICY IF EXISTS "Users can leave guilds" ON guild_members;

CREATE POLICY "Anyone can view guild members"
  ON guild_members FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can join guilds"
  ON guild_members FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can leave guilds"
  ON guild_members FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Activity feed
DROP POLICY IF EXISTS "Activity feed visibility" ON activity_feed;
DROP POLICY IF EXISTS "Users can create activities" ON activity_feed;

CREATE POLICY "Activity feed visibility"
  ON activity_feed FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid()) = user_id
    OR visibility = 'public'
    OR (
      visibility = 'friends'
      AND EXISTS (
        SELECT 1 FROM public.friendships
        WHERE status = 'accepted'
        AND (
          (requester_id = (SELECT auth.uid()) AND addressee_id = activity_feed.user_id)
          OR (addressee_id = (SELECT auth.uid()) AND requester_id = activity_feed.user_id)
        )
      )
    )
  );

CREATE POLICY "Users can create activities"
  ON activity_feed FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Activity likes
DROP POLICY IF EXISTS "Anyone can view likes" ON activity_likes;
DROP POLICY IF EXISTS "Users can like activities" ON activity_likes;
DROP POLICY IF EXISTS "Users can unlike activities" ON activity_likes;

CREATE POLICY "Anyone can view likes"
  ON activity_likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can like activities"
  ON activity_likes FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can unlike activities"
  ON activity_likes FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Activity comments
DROP POLICY IF EXISTS "Anyone can view comments" ON activity_comments;
DROP POLICY IF EXISTS "Users can create comments" ON activity_comments;
DROP POLICY IF EXISTS "Users can update own comments" ON activity_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON activity_comments;

CREATE POLICY "Anyone can view comments"
  ON activity_comments FOR SELECT
  TO authenticated
  USING (is_hidden = false OR (SELECT auth.uid()) = user_id);

CREATE POLICY "Users can create comments"
  ON activity_comments FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own comments"
  ON activity_comments FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own comments"
  ON activity_comments FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Challenges
DROP POLICY IF EXISTS "Anyone can view active challenges" ON challenges;
DROP POLICY IF EXISTS "Users can create challenges" ON challenges;

CREATE POLICY "Anyone can view active challenges"
  ON challenges FOR SELECT
  TO authenticated
  USING (status = 'active' OR (SELECT auth.uid()) = creator_id);

CREATE POLICY "Users can create challenges"
  ON challenges FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

-- Challenge participants
DROP POLICY IF EXISTS "Anyone can view challenge participants" ON challenge_participants;
DROP POLICY IF EXISTS "Users can join challenges" ON challenge_participants;

CREATE POLICY "Anyone can view challenge participants"
  ON challenge_participants FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join challenges"
  ON challenge_participants FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- User reports
DROP POLICY IF EXISTS "Users can view own reports" ON user_reports;
DROP POLICY IF EXISTS "Users can create reports" ON user_reports;

CREATE POLICY "Users can view own reports"
  ON user_reports FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = reporter_id);

CREATE POLICY "Users can create reports"
  ON user_reports FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = reporter_id);


-- ============================================
-- 3. ADD MISSING INDEXES FOR RLS PERFORMANCE
-- ============================================

-- These indexes help RLS policy performance
CREATE INDEX IF NOT EXISTS idx_user_module_progress_user_id ON user_module_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_cosmic_currency_user_id ON user_cosmic_currency(user_id);
CREATE INDEX IF NOT EXISTS idx_currency_transactions_user_id ON currency_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_missions_user_id ON user_missions(user_id);
CREATE INDEX IF NOT EXISTS idx_momentum_chains_user_id ON momentum_chains(user_id);
CREATE INDEX IF NOT EXISTS idx_momentum_events_user_id ON momentum_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_discoveries_user_id ON user_discoveries(user_id);
CREATE INDEX IF NOT EXISTS idx_rewards_user_id ON rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_user_id ON reward_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_gamification_events_user_id ON gamification_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_equipment_user_id ON user_equipment(user_id);
CREATE INDEX IF NOT EXISTS idx_achievement_progress_user_id ON achievement_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_perks_user_id ON user_perks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_constellation_progress_user_id ON user_constellation_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_content_items_user_id ON content_items(user_id);
CREATE INDEX IF NOT EXISTS idx_user_values_user_id ON user_values(user_id);
CREATE INDEX IF NOT EXISTS idx_user_decisions_user_id ON user_decisions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_identity_checkins_user_id ON user_identity_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_user_purpose_user_id ON user_purpose(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quotes_user_id ON user_quotes(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_user_id ON daily_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_task_templates_user_id ON daily_task_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_user_resolutions_user_id ON user_resolutions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_resolution_check_ins_user_id ON user_resolution_check_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_requester_id ON friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee_id ON friendships(addressee_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker_id ON user_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_guild_members_user_id ON guild_members(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_user_id ON activity_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_likes_user_id ON activity_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_comments_user_id ON activity_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user_id ON challenge_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_reporter_id ON user_reports(reporter_id);


-- ============================================
-- MIGRATION COMPLETE
-- All security hardening applied:
-- 1. Function search paths set to ''
-- 2. RLS policies optimized with (SELECT auth.uid())
-- 3. TO clauses added for explicit role targeting
-- 4. Indexes added for RLS performance
-- ============================================
