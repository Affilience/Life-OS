-- Migration: Convert user_perks to use string perk IDs
-- This allows us to store perk IDs like 'body_foundation' from the frontend PERK_TREES
-- instead of requiring UUIDs from the perks table

-- Drop the foreign key constraint first
ALTER TABLE user_perks
DROP CONSTRAINT IF EXISTS user_perks_perk_id_fkey;

-- Change perk_id column from UUID to TEXT
ALTER TABLE user_perks
ALTER COLUMN perk_id TYPE TEXT;

-- Update the unique constraint
ALTER TABLE user_perks
DROP CONSTRAINT IF EXISTS user_perks_user_id_perk_id_key;

ALTER TABLE user_perks
ADD CONSTRAINT user_perks_user_id_perk_id_key UNIQUE (user_id, perk_id);

-- Add index for perk_id lookups
CREATE INDEX IF NOT EXISTS idx_user_perks_perk_id ON user_perks(perk_id);

-- Add tree_name column for easier querying by tree
ALTER TABLE user_perks
ADD COLUMN IF NOT EXISTS tree_name TEXT;

-- Create index on tree_name
CREATE INDEX IF NOT EXISTS idx_user_perks_tree ON user_perks(user_id, tree_name);

COMMENT ON TABLE user_perks IS 'Tracks which perks each user has unlocked. perk_id stores string IDs like body_foundation from the frontend PERK_TREES data.';
COMMENT ON COLUMN user_perks.perk_id IS 'String perk ID matching frontend PERK_TREES (e.g., body_foundation, mind_scholar)';
COMMENT ON COLUMN user_perks.tree_name IS 'Perk tree name (body, mind, spirit, wealth, social, craft)';
