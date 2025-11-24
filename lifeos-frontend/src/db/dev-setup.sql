-- ============================================
-- DEVELOPMENT SETUP
-- Temporarily disable RLS for testing
-- Re-enable in production!
-- ============================================

-- Disable RLS on all tables for development
ALTER TABLE user_module_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_cosmic_currency DISABLE ROW LEVEL SECURITY;
ALTER TABLE currency_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE missions DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_missions DISABLE ROW LEVEL SECURITY;
ALTER TABLE momentum_chains DISABLE ROW LEVEL SECURITY;
ALTER TABLE momentum_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE discoveries DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_discoveries DISABLE ROW LEVEL SECURITY;
ALTER TABLE rewards DISABLE ROW LEVEL SECURITY;
ALTER TABLE reward_redemptions DISABLE ROW LEVEL SECURITY;

-- Note: Remember to re-enable RLS in production by running:
-- ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;
