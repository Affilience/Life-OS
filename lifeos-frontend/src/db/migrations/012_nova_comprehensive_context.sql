-- Nova Comprehensive Context Function
-- Schema-accurate version - tested and working
-- Created: 2025-12-14

CREATE OR REPLACE FUNCTION public.get_nova_user_context(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb := '{}'::jsonb;
  v_today date := CURRENT_DATE;
  v_week_ago date := CURRENT_DATE - INTERVAL '7 days';
BEGIN
  -- 1. User Profile
  SELECT jsonb_build_object('display_name', display_name, 'username', username, 'level', current_level,
    'total_xp', total_xp, 'avatar_stage', avatar_stage, 'member_since', created_at::date
  ) INTO v_result FROM user_profiles WHERE id = p_user_id;
  IF v_result IS NULL THEN v_result := '{}'::jsonb; END IF;

  -- 2. Tasks Today (status = 'completed' not is_completed)
  v_result := v_result || jsonb_build_object('tasks_today',
    (SELECT jsonb_build_object('total', COUNT(*), 'done', COUNT(*) FILTER (WHERE status = 'completed'),
      'pending', COALESCE(jsonb_agg(jsonb_build_object('title', title, 'priority', priority)) FILTER (WHERE status != 'completed'), '[]'::jsonb))
     FROM productivity_tasks WHERE user_id = p_user_id AND (due_date::date = v_today OR (due_date IS NULL AND created_at::date = v_today))));

  -- 3. Gamification (from user_gamification_summary view)
  v_result := v_result || jsonb_build_object('gamification',
    (SELECT jsonb_build_object('level', current_level, 'total_xp', total_xp, 'avatar_stage', current_stage,
      'cosmic_credits', cosmic_credits, 'active_streaks', active_streaks_count, 'max_streak', max_current_streak)
     FROM user_gamification_summary WHERE user_id = p_user_id));

  -- 4. Streaks (momentum_chains: chain_type, current_streak, longest_streak)
  v_result := v_result || jsonb_build_object('streaks',
    (SELECT COALESCE(jsonb_agg(jsonb_build_object('type', chain_type, 'current', current_streak, 'longest', longest_streak)), '[]'::jsonb)
     FROM momentum_chains WHERE user_id = p_user_id));

  -- 5. Custom Streaks
  v_result := v_result || jsonb_build_object('custom_streaks',
    (SELECT COALESCE(jsonb_agg(jsonb_build_object('name', name, 'current', current_streak, 'longest', longest_streak)), '[]'::jsonb)
     FROM custom_streaks WHERE user_id = p_user_id));

  -- 6. Nutrition Today (health_nutrition_logs with meal_timestamp)
  v_result := v_result || jsonb_build_object('nutrition_today',
    (SELECT jsonb_build_object('calories', SUM(total_calories), 'protein', SUM(total_protein), 'carbs', SUM(total_carbs), 'fat', SUM(total_fat), 'meals', COUNT(*))
     FROM health_nutrition_logs WHERE user_id = p_user_id AND meal_timestamp::date = v_today));

  -- 7. Recent Workouts (health_workouts with workout_date)
  v_result := v_result || jsonb_build_object('workouts_week',
    (SELECT COALESCE(jsonb_agg(w), '[]'::jsonb) FROM
     (SELECT jsonb_build_object('type', workout_type, 'duration', duration_minutes, 'date', workout_date::date) as w
      FROM health_workouts WHERE user_id = p_user_id AND workout_date >= v_week_ago ORDER BY workout_date DESC LIMIT 7) sub));

  -- 8. Last Sleep (health_sleep_logs with sleep_date)
  v_result := v_result || jsonb_build_object('sleep_last',
    (SELECT jsonb_build_object('hours', duration_hours, 'quality', quality_rating, 'date', sleep_date)
     FROM health_sleep_logs WHERE user_id = p_user_id ORDER BY sleep_date DESC LIMIT 1));

  -- 9. Water Today (health_water_logs with log_date)
  v_result := v_result || jsonb_build_object('water_today',
    (SELECT jsonb_build_object('amount_ml', amount_ml, 'goal_ml', goal_ml)
     FROM health_water_logs WHERE user_id = p_user_id AND log_date = v_today));

  -- 10. Recent Journal (journal_entries with entry_date)
  v_result := v_result || jsonb_build_object('journal_recent',
    (SELECT jsonb_build_object('date', entry_date, 'mood', mood_rating, 'excerpt', LEFT(content, 200))
     FROM journal_entries WHERE user_id = p_user_id ORDER BY entry_date DESC LIMIT 1));

  -- 11. Financial Summary (financial_transactions with transaction_date)
  v_result := v_result || jsonb_build_object('finances_month',
    (SELECT jsonb_build_object('income', SUM(amount) FILTER (WHERE transaction_type = 'income'),
      'expenses', SUM(amount) FILTER (WHERE transaction_type = 'expense'))
     FROM financial_transactions WHERE user_id = p_user_id AND date_trunc('month', transaction_date) = date_trunc('month', v_today)));

  -- 12. Financial Goals (goal_name not name, status = 'active')
  v_result := v_result || jsonb_build_object('financial_goals',
    (SELECT COALESCE(jsonb_agg(jsonb_build_object('name', goal_name, 'target', target_amount, 'current', current_amount)), '[]'::jsonb)
     FROM financial_goals WHERE user_id = p_user_id AND status = 'active'));

  -- 13. Active Skills
  v_result := v_result || jsonb_build_object('skills',
    (SELECT COALESCE(jsonb_agg(jsonb_build_object('name', name, 'level', current_level, 'hours', total_practice_hours)), '[]'::jsonb)
     FROM skills WHERE user_id = p_user_id AND status = 'active'));

  -- 14. Nova Memories
  v_result := v_result || jsonb_build_object('memories',
    (SELECT COALESCE(jsonb_agg(m), '[]'::jsonb) FROM
     (SELECT jsonb_build_object('type', memory_type, 'content', content, 'importance', importance) as m
      FROM nova_memories WHERE user_id = p_user_id AND is_active = true ORDER BY importance DESC, created_at DESC LIMIT 10) sub));

  -- 15. Bad Habits
  v_result := v_result || jsonb_build_object('bad_habits',
    (SELECT COALESCE(jsonb_agg(jsonb_build_object('name', name, 'days_clean', EXTRACT(DAY FROM (v_today - COALESCE(last_relapse_date, start_date))), 'longest', longest_streak)), '[]'::jsonb)
     FROM bad_habits WHERE user_id = p_user_id));

  -- 16. Today's Calendar (calendar_events with start_time)
  v_result := v_result || jsonb_build_object('calendar_today',
    (SELECT COALESCE(jsonb_agg(c), '[]'::jsonb) FROM
     (SELECT jsonb_build_object('title', title, 'start', start_time, 'type', event_type) as c
      FROM calendar_events WHERE user_id = p_user_id AND start_time::date = v_today ORDER BY start_time) sub));

  RETURN v_result;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_nova_user_context(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_nova_user_context(uuid) TO service_role;
