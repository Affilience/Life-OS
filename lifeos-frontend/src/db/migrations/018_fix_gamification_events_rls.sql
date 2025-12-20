-- ============================================
-- FIX GAMIFICATION EVENTS RLS MIGRATION
-- Adds missing INSERT policy for gamification_events table
-- ============================================

-- Add INSERT policy for gamification_events
-- Users should be able to insert their own events
DROP POLICY IF EXISTS "Users can insert own events" ON gamification_events;
CREATE POLICY "Users can insert own events"
  ON gamification_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Also add UPDATE policy in case it's needed
DROP POLICY IF EXISTS "Users can update own events" ON gamification_events;
CREATE POLICY "Users can update own events"
  ON gamification_events FOR UPDATE
  USING (auth.uid() = user_id);
