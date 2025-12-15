-- Migration: Comprehensive Nova User Context
-- Adds ALL user data sources to Nova's knowledge base
-- Run this migration to give Nova complete system awareness

CREATE OR REPLACE FUNCTION public.get_nova_user_context(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_result JSONB;
  v_profile JSONB;
  v_stats JSONB;
  v_gamification JSONB;
  v_character JSONB;
  v_currency JSONB;
  v_streaks JSONB;
  v_custom_streaks JSONB;
  v_today_tasks JSONB;
  v_today_nutrition JSONB;
  v_fitness JSONB;
  v_pets JSONB;
  v_equipment JSONB;
  v_journal JSONB;
  v_financial JSONB;
  v_skills JSONB;
  v_memories JSONB;
  v_habits JSONB;
  v_sleep JSONB;
  v_water JSONB;
  v_calendar JSONB;
  v_missions JSONB;
  v_achievements JSONB;
  v_pvp JSONB;
  v_friends JSONB;
  v_resolutions JSONB;
  v_perks JSONB;
  v_purpose JSONB;
  v_today DATE := CURRENT_DATE;
  v_hour INTEGER := EXTRACT(HOUR FROM NOW());
  v_time_of_day TEXT;
BEGIN
  IF p_user_id IS NULL THEN RETURN NULL; END IF;

  v_time_of_day := CASE
    WHEN v_hour < 6 THEN 'night'
    WHEN v_hour < 12 THEN 'morning'
    WHEN v_hour < 17 THEN 'afternoon'
    WHEN v_hour < 21 THEN 'evening'
    ELSE 'night'
  END;

  -- User profile
  SELECT COALESCE(to_jsonb(up.*) - 'id' - 'user_id' - 'created_at' - 'updated_at', '{}'::jsonb)
  INTO v_profile FROM user_profiles up WHERE up.user_id = p_user_id;
  v_profile := COALESCE(v_profile, '{}'::jsonb);

  -- User stats (STR, VIT, INT, WIS, DEF)
  SELECT COALESCE(jsonb_build_object('strength', strength, 'vitality', vitality, 'intelligence', intelligence, 'wisdom', wisdom, 'defense', defense), '{}'::jsonb)
  INTO v_stats FROM user_stats WHERE user_id = p_user_id;
  v_stats := COALESCE(v_stats, '{"strength":0,"vitality":0,"intelligence":0,"wisdom":0,"defense":0}'::jsonb);

  -- Character summary (level, XP, avatar stage, prestige)
  SELECT COALESCE(jsonb_build_object('level', level, 'total_xp', total_xp, 'xp_to_next', xp_to_next_level, 'avatar_stage', avatar_stage, 'prestige_level', prestige_level, 'title', current_title), '{}'::jsonb)
  INTO v_character FROM user_gamification_summary WHERE user_id = p_user_id;
  v_character := COALESCE(v_character, '{"level":1,"total_xp":0,"avatar_stage":1,"prestige_level":0}'::jsonb);

  -- Module progress
  SELECT jsonb_build_object('modules', COALESCE(jsonb_agg(jsonb_build_object('module', module_name, 'level', level, 'xp', xp_current)), '[]'::jsonb))
  INTO v_gamification FROM user_module_progress WHERE user_id = p_user_id;
  v_gamification := COALESCE(v_gamification, '{"modules":[]}'::jsonb);

  -- Cosmic currency balance
  SELECT jsonb_build_object('cosmic_credits', COALESCE(balance, 0))
  INTO v_currency FROM user_cosmic_currency WHERE user_id = p_user_id;
  v_currency := COALESCE(v_currency, '{"cosmic_credits":0}'::jsonb);

  -- Momentum chains (streaks)
  SELECT jsonb_build_object('chains', COALESCE((SELECT jsonb_agg(s) FROM (
    SELECT jsonb_build_object('name', chain_name, 'module', module_name, 'current', current_count, 'longest', longest_count) as s
    FROM momentum_chains WHERE user_id = p_user_id AND is_active = true ORDER BY current_count DESC
  ) t), '[]'::jsonb)) INTO v_streaks;
  v_streaks := COALESCE(v_streaks, '{"chains":[]}'::jsonb);

  -- Custom streaks
  SELECT jsonb_build_object('custom', COALESCE((SELECT jsonb_agg(cs) FROM (
    SELECT jsonb_build_object('name', name, 'current', current_streak, 'longest', longest_streak, 'freq', frequency) as cs
    FROM custom_streaks WHERE user_id = p_user_id AND is_active = true ORDER BY current_streak DESC
  ) t), '[]'::jsonb)) INTO v_custom_streaks;
  v_custom_streaks := COALESCE(v_custom_streaks, '{"custom":[]}'::jsonb);

  -- Today's tasks
  SELECT jsonb_build_object('total', COUNT(*), 'done', COUNT(*) FILTER (WHERE is_completed = true),
    'pending', COALESCE(jsonb_agg(jsonb_build_object('title', title, 'priority', priority)) FILTER (WHERE is_completed = false), '[]'::jsonb))
  INTO v_today_tasks FROM productivity_tasks
  WHERE user_id = p_user_id AND (due_date = v_today OR (due_date IS NULL AND created_at::date = v_today));
  v_today_tasks := COALESCE(v_today_tasks, '{"total":0,"done":0,"pending":[]}'::jsonb);

  -- Today's nutrition
  SELECT jsonb_build_object('cal', COALESCE(SUM(calories), 0), 'protein', COALESCE(SUM(protein), 0), 'carbs', COALESCE(SUM(carbs), 0), 'fat', COALESCE(SUM(fat), 0), 'meals', COUNT(*))
  INTO v_today_nutrition FROM health_nutrition_logs WHERE user_id = p_user_id AND logged_at::date = v_today;
  v_today_nutrition := COALESCE(v_today_nutrition, '{"cal":0,"protein":0,"carbs":0,"fat":0,"meals":0}'::jsonb);

  -- Fitness this week
  SELECT jsonb_build_object('week_count', COUNT(*), 'recent', COALESCE((SELECT jsonb_agg(w) FROM (
    SELECT jsonb_build_object('type', workout_type, 'date', completed_at::date) as w
    FROM health_workouts WHERE user_id = p_user_id AND completed_at > NOW() - INTERVAL '7 days' LIMIT 5
  ) t), '[]'::jsonb))
  INTO v_fitness FROM health_workouts WHERE user_id = p_user_id AND completed_at > NOW() - INTERVAL '7 days';
  v_fitness := COALESCE(v_fitness, '{"week_count":0,"recent":[]}'::jsonb);

  -- Pets
  SELECT jsonb_build_object('total', COUNT(*), 'active', COALESCE(jsonb_agg(
    jsonb_build_object('name', up.pet_name, 'species', p.species, 'happy', up.happiness)
  ) FILTER (WHERE up.is_active = true), '[]'::jsonb))
  INTO v_pets FROM user_pets up LEFT JOIN pets p ON up.pet_id = p.id WHERE up.user_id = p_user_id;
  v_pets := COALESCE(v_pets, '{"total":0,"active":[]}'::jsonb);

  -- Equipped items
  SELECT jsonb_build_object('equipped', COALESCE(jsonb_agg(
    jsonb_build_object('name', ei.name, 'slot', ue.slot_type, 'rarity', ei.rarity)
  ) FILTER (WHERE ue.is_equipped = true), '[]'::jsonb))
  INTO v_equipment FROM user_equipment ue LEFT JOIN equipment_items ei ON ue.equipment_id = ei.id WHERE ue.user_id = p_user_id;
  v_equipment := COALESCE(v_equipment, '{"equipped":[]}'::jsonb);

  -- Journal entries
  SELECT jsonb_build_object('total', COUNT(*), 'avg_mood', (SELECT ROUND(AVG(mood_score)::numeric, 1) FROM journal_entries WHERE user_id = p_user_id AND entry_date > CURRENT_DATE - 7),
    'recent', COALESCE((SELECT jsonb_agg(j) FROM (
      SELECT jsonb_build_object('date', entry_date, 'mood', mood_score) as j FROM journal_entries WHERE user_id = p_user_id ORDER BY entry_date DESC LIMIT 3
    ) t), '[]'::jsonb))
  INTO v_journal FROM journal_entries WHERE user_id = p_user_id;
  v_journal := COALESCE(v_journal, '{"total":0,"recent":[],"avg_mood":null}'::jsonb);

  -- Financial summary
  SELECT jsonb_build_object('budget', COALESCE(SUM(target_amount) FILTER (WHERE goal_type = 'budget'), 0), 'goals', COUNT(*) FILTER (WHERE goal_type = 'savings'),
    'spent', COALESCE((SELECT SUM(amount) FROM financial_transactions WHERE user_id = p_user_id AND transaction_type = 'expense' AND transaction_date >= DATE_TRUNC('month', CURRENT_DATE)), 0))
  INTO v_financial FROM financial_goals WHERE user_id = p_user_id AND is_active = true;
  v_financial := COALESCE(v_financial, '{"budget":0,"spent":0,"goals":0}'::jsonb);

  -- Skills
  SELECT jsonb_build_object('count', COUNT(*), 'hours', COALESCE(SUM((SELECT COALESCE(SUM(duration_minutes), 0) / 60.0 FROM skill_practice_logs WHERE skill_id = s.id)), 0),
    'top', COALESCE((SELECT jsonb_agg(sk) FROM (
      SELECT jsonb_build_object('name', name, 'level', current_level) as sk FROM skills WHERE user_id = p_user_id ORDER BY current_level DESC LIMIT 5
    ) t), '[]'::jsonb))
  INTO v_skills FROM skills s WHERE user_id = p_user_id AND is_active = true;
  v_skills := COALESCE(v_skills, '{"count":0,"hours":0,"top":[]}'::jsonb);

  -- Nova memories
  SELECT jsonb_build_object('total', COUNT(*), 'memories', COALESCE((SELECT jsonb_agg(m) FROM (
    SELECT jsonb_build_object('content', content, 'importance', importance) as m FROM nova_memories WHERE user_id = p_user_id ORDER BY importance DESC LIMIT 10
  ) t), '[]'::jsonb))
  INTO v_memories FROM nova_memories WHERE user_id = p_user_id;
  v_memories := COALESCE(v_memories, '{"total":0,"memories":[]}'::jsonb);

  -- Bad habits (NEW)
  SELECT jsonb_build_object('bad_habits', COALESCE((SELECT jsonb_agg(bh) FROM (
    SELECT jsonb_build_object('name', name, 'trigger', trigger_situation, 'days_clean', COALESCE((CURRENT_DATE - (SELECT MAX(relapse_date) FROM bad_habit_relapses WHERE bad_habit_id = bad_habits.id)::date), EXTRACT(DAY FROM NOW() - created_at)::int)) as bh
    FROM bad_habits WHERE user_id = p_user_id AND is_active = true
  ) t), '[]'::jsonb)) INTO v_habits;
  v_habits := COALESCE(v_habits, '{"bad_habits":[]}'::jsonb);

  -- Sleep data (NEW)
  SELECT jsonb_build_object('last', (SELECT jsonb_build_object('hrs', ROUND((EXTRACT(EPOCH FROM (wake_time - sleep_time))/3600)::numeric, 1), 'quality', sleep_quality) FROM health_sleep_logs WHERE user_id = p_user_id ORDER BY log_date DESC LIMIT 1),
    'avg_week', (SELECT ROUND(AVG(EXTRACT(EPOCH FROM (wake_time - sleep_time))/3600)::numeric, 1) FROM health_sleep_logs WHERE user_id = p_user_id AND log_date > CURRENT_DATE - 7))
  INTO v_sleep;
  v_sleep := COALESCE(v_sleep, '{"last":null,"avg_week":null}'::jsonb);

  -- Water intake (NEW)
  SELECT jsonb_build_object('today_ml', COALESCE(SUM(amount_ml), 0), 'glasses', COALESCE(SUM(amount_ml) / 250, 0))
  INTO v_water FROM health_water_logs WHERE user_id = p_user_id AND logged_at::date = CURRENT_DATE;
  v_water := COALESCE(v_water, '{"today_ml":0,"glasses":0}'::jsonb);

  -- Calendar events (NEW)
  SELECT jsonb_build_object('today', COALESCE((SELECT jsonb_agg(e) FROM (
    SELECT jsonb_build_object('title', title, 'start', start_time, 'end', end_time) as e FROM calendar_events WHERE user_id = p_user_id AND event_date = CURRENT_DATE ORDER BY start_time
  ) t), '[]'::jsonb), 'upcoming', COALESCE((SELECT jsonb_agg(e) FROM (
    SELECT jsonb_build_object('title', title, 'date', event_date) as e FROM calendar_events WHERE user_id = p_user_id AND event_date > CURRENT_DATE AND event_date <= CURRENT_DATE + 7 LIMIT 5
  ) t), '[]'::jsonb)) INTO v_calendar;
  v_calendar := COALESCE(v_calendar, '{"today":[],"upcoming":[]}'::jsonb);

  -- Active missions/quests (NEW)
  SELECT jsonb_build_object('active', COALESCE((SELECT jsonb_agg(m) FROM (
    SELECT jsonb_build_object('title', m.title, 'type', m.mission_type, 'progress', um.progress_current, 'target', um.progress_target, 'xp', m.xp_reward) as m
    FROM user_missions um JOIN missions m ON um.mission_id = m.id WHERE um.user_id = p_user_id AND um.status = 'active' ORDER BY um.expires_at LIMIT 5
  ) t), '[]'::jsonb)) INTO v_missions;
  v_missions := COALESCE(v_missions, '{"active":[]}'::jsonb);

  -- Achievements/discoveries (NEW)
  SELECT jsonb_build_object('total', (SELECT COUNT(*) FROM user_discoveries WHERE user_id = p_user_id), 'recent', COALESCE((SELECT jsonb_agg(d) FROM (
    SELECT jsonb_build_object('name', disc.name, 'cat', disc.category) as d FROM user_discoveries ud JOIN discoveries disc ON ud.discovery_id = disc.id WHERE ud.user_id = p_user_id ORDER BY ud.unlocked_at DESC LIMIT 5
  ) t), '[]'::jsonb)) INTO v_achievements;
  v_achievements := COALESCE(v_achievements, '{"total":0,"recent":[]}'::jsonb);

  -- PVP status (NEW)
  SELECT jsonb_build_object('battles', (SELECT COUNT(*) FROM pvp_battles WHERE (player1_id = p_user_id OR player2_id = p_user_id) AND status = 'active'),
    'stats', (SELECT jsonb_build_object('wins', wins, 'losses', losses, 'elo', elo_rating, 'rank', rank_tier, 'streak', current_win_streak) FROM pvp_user_stats WHERE user_id = p_user_id),
    'invites', (SELECT COUNT(*) FROM pvp_invites WHERE invitee_id = p_user_id AND status = 'pending'))
  INTO v_pvp;
  v_pvp := COALESCE(v_pvp, '{"battles":0,"stats":null,"invites":0}'::jsonb);

  -- Friends/social (NEW)
  SELECT jsonb_build_object('friends', COUNT(*) FILTER (WHERE status = 'accepted'), 'pending', COUNT(*) FILTER (WHERE status = 'pending' AND friend_id = p_user_id))
  INTO v_friends FROM friendships WHERE user_id = p_user_id OR friend_id = p_user_id;
  v_friends := COALESCE(v_friends, '{"friends":0,"pending":0}'::jsonb);

  -- Resolutions/goals (NEW)
  SELECT jsonb_build_object('active', COALESCE((SELECT jsonb_agg(r) FROM (
    SELECT jsonb_build_object('title', title, 'cat', category, 'progress', progress_percentage) as r FROM user_resolutions WHERE user_id = p_user_id AND status = 'active' LIMIT 5
  ) t), '[]'::jsonb)) INTO v_resolutions;
  v_resolutions := COALESCE(v_resolutions, '{"active":[]}'::jsonb);

  -- Unlocked perks (NEW)
  SELECT jsonb_build_object('total', COUNT(*), 'list', COALESCE((SELECT jsonb_agg(p) FROM (
    SELECT jsonb_build_object('name', perks.name, 'cat', perks.category, 'tier', perks.tier) as p FROM user_perks up JOIN perks ON up.perk_id = perks.id WHERE up.user_id = p_user_id LIMIT 10
  ) t), '[]'::jsonb))
  INTO v_perks FROM user_perks WHERE user_id = p_user_id;
  v_perks := COALESCE(v_perks, '{"total":0,"list":[]}'::jsonb);

  -- Purpose and values (NEW)
  SELECT jsonb_build_object('purpose', (SELECT jsonb_build_object('statement', purpose_statement, 'why', why_it_matters) FROM user_purpose WHERE user_id = p_user_id LIMIT 1),
    'values', COALESCE((SELECT jsonb_agg(jsonb_build_object('name', value_name, 'rank', importance_rank)) FROM user_values WHERE user_id = p_user_id ORDER BY importance_rank LIMIT 5), '[]'::jsonb))
  INTO v_purpose;
  v_purpose := COALESCE(v_purpose, '{"purpose":null,"values":[]}'::jsonb);

  -- Build final comprehensive result
  v_result := jsonb_build_object(
    'user_id', p_user_id,
    'fetched_at', NOW(),
    'today', jsonb_build_object('date', v_today, 'day', TRIM(TO_CHAR(v_today, 'Day')), 'time', v_time_of_day, 'tasks', v_today_tasks, 'nutrition', v_today_nutrition, 'water', v_water, 'calendar', v_calendar),
    'profile', v_profile,
    'character', v_character,
    'stats', v_stats,
    'gamification', v_gamification,
    'currency', v_currency,
    'streaks', v_streaks,
    'custom_streaks', v_custom_streaks,
    'fitness', v_fitness,
    'sleep', v_sleep,
    'habits', v_habits,
    'pets', v_pets,
    'equipment', v_equipment,
    'journal', v_journal,
    'financial', v_financial,
    'skills', v_skills,
    'missions', v_missions,
    'achievements', v_achievements,
    'pvp', v_pvp,
    'friends', v_friends,
    'resolutions', v_resolutions,
    'perks', v_perks,
    'purpose', v_purpose,
    'memories', v_memories
  );

  RETURN v_result;
END;
$function$;
