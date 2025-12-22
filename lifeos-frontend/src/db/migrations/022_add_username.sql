-- ============================================
-- ADD USERNAME COLUMN MIGRATION
-- Adds unique username for friend lookups and profile identification
-- ============================================

-- Add username column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles'
    AND column_name = 'username'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN username VARCHAR(30);
  END IF;
END $$;

-- Create unique index on username (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_username_lower
  ON user_profiles(LOWER(username))
  WHERE username IS NOT NULL;

-- Create regular index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_username
  ON user_profiles(username)
  WHERE username IS NOT NULL;

-- Add constraint for username format (alphanumeric, underscores, 3-30 chars)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'username_format_check'
  ) THEN
    ALTER TABLE user_profiles
    ADD CONSTRAINT username_format_check
    CHECK (
      username IS NULL OR
      (username ~ '^[a-zA-Z][a-zA-Z0-9_]{2,29}$')
    );
  END IF;
END $$;

-- Comment for documentation
COMMENT ON COLUMN user_profiles.username IS 'Unique username for friend lookups. Must be 3-30 characters, start with a letter, and contain only letters, numbers, and underscores.';

-- Function to check if username is available
CREATE OR REPLACE FUNCTION is_username_available(check_username VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE LOWER(username) = LOWER(check_username)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search users by username (for friend search)
CREATE OR REPLACE FUNCTION search_users_by_username(
  search_query VARCHAR,
  exclude_user_id UUID,
  result_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  user_id UUID,
  username VARCHAR,
  display_name TEXT,
  avatar_url TEXT,
  current_level INTEGER,
  total_xp BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    up.user_id,
    up.username,
    up.display_name,
    up.avatar_url,
    up.current_level,
    up.total_xp
  FROM user_profiles up
  WHERE up.user_id != exclude_user_id
    AND up.username IS NOT NULL
    AND (
      LOWER(up.username) LIKE LOWER(search_query) || '%'
      OR LOWER(up.display_name) LIKE '%' || LOWER(search_query) || '%'
    )
  ORDER BY
    CASE WHEN LOWER(up.username) = LOWER(search_query) THEN 0 ELSE 1 END,
    CASE WHEN LOWER(up.username) LIKE LOWER(search_query) || '%' THEN 0 ELSE 1 END,
    up.total_xp DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
