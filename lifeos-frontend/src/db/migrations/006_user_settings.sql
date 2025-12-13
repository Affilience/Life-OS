-- ============================================
-- USER SETTINGS MIGRATION
-- Adds preferences JSONB column to user_profiles for settings storage
-- ============================================

-- Add preferences column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles'
    AND column_name = 'preferences'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN preferences JSONB DEFAULT '{}';
  END IF;
END $$;

-- Add display_name column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles'
    AND column_name = 'display_name'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN display_name TEXT;
  END IF;
END $$;

-- Add avatar_url column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles'
    AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN avatar_url TEXT;
  END IF;
END $$;

-- Add bio column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles'
    AND column_name = 'bio'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN bio TEXT;
  END IF;
END $$;

-- Add timezone column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles'
    AND column_name = 'timezone'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN timezone TEXT DEFAULT 'UTC';
  END IF;
END $$;

-- Create index on preferences for faster JSON queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_preferences ON user_profiles USING GIN (preferences);

-- Comment for documentation
COMMENT ON COLUMN user_profiles.preferences IS 'User settings and preferences stored as JSONB. Includes appearance, notifications, privacy, module preferences, and advanced settings.';
