-- =============================================
-- SUPPLEMENT STACKS COLUMN
-- Migration: 021_supplement_stacks_column.sql
-- Description: Adds supplement_stacks JSONB column to user_profiles for persistent storage
-- =============================================

-- Add supplement_stacks column to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS supplement_stacks JSONB DEFAULT '[]'::jsonb;

-- Add comment
COMMENT ON COLUMN user_profiles.supplement_stacks IS 'User-created supplement stacks (groups of supplements to take together)';
