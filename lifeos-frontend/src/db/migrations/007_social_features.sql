-- ============================================
-- SOCIAL FEATURES MIGRATION
-- Complete social system: profiles, friends, guilds, leaderboards, activity feed
-- ============================================

-- ============================================
-- 1. SOCIAL PROFILES (extends user_profiles)
-- ============================================

-- Add social columns to existing user_profiles table
DO $$
BEGIN
  -- Privacy level for profile visibility
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'privacy_level'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN privacy_level VARCHAR(20) DEFAULT 'friends_only';
  END IF;

  -- Title shown under display name
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'title'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN title VARCHAR(50);
  END IF;

  -- Social visibility flags
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'show_on_leaderboards'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN show_on_leaderboards BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'show_activity_feed'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN show_activity_feed BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'allow_friend_requests'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN allow_friend_requests BOOLEAN DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'allow_guild_invites'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN allow_guild_invites BOOLEAN DEFAULT true;
  END IF;

  -- Last active timestamp for presence
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'last_active_at'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN last_active_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Index for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_leaderboard
  ON user_profiles(total_xp DESC)
  WHERE show_on_leaderboards = true;

-- ============================================
-- 2. FRIENDSHIPS
-- ============================================

CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  addressee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(requester_id, addressee_id),
  CHECK (requester_id != addressee_id)
);

CREATE INDEX IF NOT EXISTS idx_friendships_requester ON friendships(requester_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON friendships(addressee_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_accepted ON friendships(status) WHERE status = 'accepted';

-- ============================================
-- 3. USER BLOCKS
-- ============================================

CREATE TABLE IF NOT EXISTS user_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  blocked_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reason VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id),
  CHECK (blocker_id != blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_blocks_blocker ON user_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocks_blocked ON user_blocks(blocked_id);

-- ============================================
-- 4. GUILDS
-- ============================================

CREATE TABLE IF NOT EXISTS guilds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(30) NOT NULL UNIQUE,
  description VARCHAR(500),
  icon_url TEXT,
  banner_url TEXT,
  privacy VARCHAR(20) DEFAULT 'open' CHECK (privacy IN ('open', 'apply', 'invite_only')),
  max_members INTEGER DEFAULT 50,
  min_level_requirement INTEGER DEFAULT 1,
  total_xp BIGINT DEFAULT 0,
  member_count INTEGER DEFAULT 0,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guilds_name ON guilds(name);
CREATE INDEX IF NOT EXISTS idx_guilds_total_xp ON guilds(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_guilds_owner ON guilds(owner_id);

-- ============================================
-- 5. GUILD MEMBERS
-- ============================================

CREATE TABLE IF NOT EXISTS guild_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID REFERENCES guilds(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'officer', 'member')),
  xp_contributed BIGINT DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(guild_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_guild_members_guild ON guild_members(guild_id);
CREATE INDEX IF NOT EXISTS idx_guild_members_user ON guild_members(user_id);
CREATE INDEX IF NOT EXISTS idx_guild_members_role ON guild_members(guild_id, role);

-- ============================================
-- 6. GUILD APPLICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS guild_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID REFERENCES guilds(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message VARCHAR(280),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  UNIQUE(guild_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_guild_applications_guild ON guild_applications(guild_id, status);
CREATE INDEX IF NOT EXISTS idx_guild_applications_user ON guild_applications(user_id);

-- ============================================
-- 7. GUILD INVITES
-- ============================================

CREATE TABLE IF NOT EXISTS guild_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID REFERENCES guilds(id) ON DELETE CASCADE NOT NULL,
  inviter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invitee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
  UNIQUE(guild_id, invitee_id)
);

CREATE INDEX IF NOT EXISTS idx_guild_invites_invitee ON guild_invites(invitee_id, status);
CREATE INDEX IF NOT EXISTS idx_guild_invites_guild ON guild_invites(guild_id);

-- ============================================
-- 8. ACTIVITY FEED
-- ============================================

CREATE TABLE IF NOT EXISTS activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}',
  visibility VARCHAR(20) DEFAULT 'friends' CHECK (visibility IN ('public', 'friends', 'guild', 'private')),
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_feed_user_created ON activity_feed(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_feed_visibility ON activity_feed(visibility, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_feed_type ON activity_feed(event_type, created_at DESC);

-- ============================================
-- 9. ACTIVITY LIKES
-- ============================================

CREATE TABLE IF NOT EXISTS activity_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES activity_feed(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(activity_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_activity_likes_activity ON activity_likes(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_likes_user ON activity_likes(user_id);

-- ============================================
-- 10. ACTIVITY COMMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS activity_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES activity_feed(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content VARCHAR(280) NOT NULL,
  is_hidden BOOLEAN DEFAULT false,
  hidden_reason VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_comments_activity ON activity_comments(activity_id, created_at);
CREATE INDEX IF NOT EXISTS idx_activity_comments_user ON activity_comments(user_id);

-- ============================================
-- 11. CHALLENGES
-- ============================================

CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(100) NOT NULL,
  description VARCHAR(500),
  icon VARCHAR(50),
  challenge_type VARCHAR(30) NOT NULL CHECK (challenge_type IN ('individual', 'head_to_head', 'guild_vs_guild', 'community')),
  metric_type VARCHAR(50) NOT NULL,
  target_value BIGINT NOT NULL,
  duration_days INTEGER NOT NULL,
  xp_reward INTEGER DEFAULT 0,
  badge_reward VARCHAR(50),
  creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status, starts_at);
CREATE INDEX IF NOT EXISTS idx_challenges_type ON challenges(challenge_type, status);
CREATE INDEX IF NOT EXISTS idx_challenges_creator ON challenges(creator_id);

-- ============================================
-- 12. CHALLENGE PARTICIPANTS
-- ============================================

CREATE TABLE IF NOT EXISTS challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  current_value BIGINT DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  final_rank INTEGER,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge ON challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user ON challenge_participants(user_id);

-- ============================================
-- 13. USER REPORTS (Moderation)
-- ============================================

CREATE TABLE IF NOT EXISTS user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reported_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reported_content_type VARCHAR(30),
  reported_content_id UUID,
  reason VARCHAR(50) NOT NULL CHECK (reason IN ('harassment', 'spam', 'inappropriate_content', 'hate_speech', 'impersonation', 'other')),
  description VARCHAR(500),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  action_taken VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_reports_status ON user_reports(status, created_at);
CREATE INDEX IF NOT EXISTS idx_user_reports_reported ON user_reports(reported_user_id);

-- ============================================
-- 14. MODERATION ACTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS moderation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action_type VARCHAR(30) NOT NULL CHECK (action_type IN ('warning', 'content_removal', 'mute', 'temp_ban', 'perm_ban')),
  reason VARCHAR(500) NOT NULL,
  duration_hours INTEGER,
  expires_at TIMESTAMPTZ,
  moderator_id UUID REFERENCES auth.users(id),
  report_id UUID REFERENCES user_reports(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_moderation_actions_user ON moderation_actions(target_user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_active ON moderation_actions(target_user_id, expires_at)
  WHERE expires_at > NOW() OR expires_at IS NULL;

-- ============================================
-- 15. LEADERBOARD SNAPSHOTS (cached rankings)
-- ============================================

CREATE TABLE IF NOT EXISTS leaderboard_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_type VARCHAR(30) NOT NULL,
  time_period VARCHAR(20) NOT NULL,
  rankings JSONB NOT NULL DEFAULT '[]',
  snapshot_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 hour'
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_snapshots_type ON leaderboard_snapshots(board_type, time_period);
CREATE INDEX IF NOT EXISTS idx_leaderboard_snapshots_expires ON leaderboard_snapshots(expires_at);

-- ============================================
-- 16. PERSONAL RECORDS
-- ============================================

CREATE TABLE IF NOT EXISTS personal_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  record_type VARCHAR(50) NOT NULL,
  record_value BIGINT NOT NULL,
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, record_type)
);

CREATE INDEX IF NOT EXISTS idx_personal_records_user ON personal_records(user_id);

-- ============================================
-- 17. ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all social tables
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE guilds ENABLE ROW LEVEL SECURITY;
ALTER TABLE guild_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE guild_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE guild_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;

-- Friendships policies
DROP POLICY IF EXISTS "Users can view their friendships" ON friendships;
CREATE POLICY "Users can view their friendships"
  ON friendships FOR SELECT
  USING (requester_id = auth.uid() OR addressee_id = auth.uid());

DROP POLICY IF EXISTS "Users can create friend requests" ON friendships;
CREATE POLICY "Users can create friend requests"
  ON friendships FOR INSERT
  WITH CHECK (requester_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their friend requests" ON friendships;
CREATE POLICY "Users can update their friend requests"
  ON friendships FOR UPDATE
  USING (requester_id = auth.uid() OR addressee_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their friendships" ON friendships;
CREATE POLICY "Users can delete their friendships"
  ON friendships FOR DELETE
  USING (requester_id = auth.uid() OR addressee_id = auth.uid());

-- User blocks policies
DROP POLICY IF EXISTS "Users can view their blocks" ON user_blocks;
CREATE POLICY "Users can view their blocks"
  ON user_blocks FOR SELECT
  USING (blocker_id = auth.uid());

DROP POLICY IF EXISTS "Users can create blocks" ON user_blocks;
CREATE POLICY "Users can create blocks"
  ON user_blocks FOR INSERT
  WITH CHECK (blocker_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their blocks" ON user_blocks;
CREATE POLICY "Users can delete their blocks"
  ON user_blocks FOR DELETE
  USING (blocker_id = auth.uid());

-- Guilds policies (public read, restricted write)
DROP POLICY IF EXISTS "Anyone can view guilds" ON guilds;
CREATE POLICY "Anyone can view guilds"
  ON guilds FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create guilds" ON guilds;
CREATE POLICY "Authenticated users can create guilds"
  ON guilds FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Guild owners can update guilds" ON guilds;
CREATE POLICY "Guild owners can update guilds"
  ON guilds FOR UPDATE
  USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Guild owners can delete guilds" ON guilds;
CREATE POLICY "Guild owners can delete guilds"
  ON guilds FOR DELETE
  USING (owner_id = auth.uid());

-- Guild members policies
DROP POLICY IF EXISTS "Anyone can view guild members" ON guild_members;
CREATE POLICY "Anyone can view guild members"
  ON guild_members FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can join guilds" ON guild_members;
CREATE POLICY "Users can join guilds"
  ON guild_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can leave guilds" ON guild_members;
CREATE POLICY "Users can leave guilds"
  ON guild_members FOR DELETE
  USING (user_id = auth.uid());

-- Activity feed policies
DROP POLICY IF EXISTS "Activity feed visibility" ON activity_feed;
CREATE POLICY "Activity feed visibility"
  ON activity_feed FOR SELECT
  USING (
    user_id = auth.uid()
    OR visibility = 'public'
    OR (
      visibility = 'friends'
      AND EXISTS (
        SELECT 1 FROM friendships
        WHERE status = 'accepted'
        AND (
          (requester_id = auth.uid() AND addressee_id = activity_feed.user_id)
          OR (addressee_id = auth.uid() AND requester_id = activity_feed.user_id)
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can create activities" ON activity_feed;
CREATE POLICY "Users can create activities"
  ON activity_feed FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Activity likes policies
DROP POLICY IF EXISTS "Anyone can view likes" ON activity_likes;
CREATE POLICY "Anyone can view likes"
  ON activity_likes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can like activities" ON activity_likes;
CREATE POLICY "Users can like activities"
  ON activity_likes FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can unlike activities" ON activity_likes;
CREATE POLICY "Users can unlike activities"
  ON activity_likes FOR DELETE
  USING (user_id = auth.uid());

-- Activity comments policies
DROP POLICY IF EXISTS "Anyone can view comments" ON activity_comments;
CREATE POLICY "Anyone can view comments"
  ON activity_comments FOR SELECT
  USING (is_hidden = false OR user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create comments" ON activity_comments;
CREATE POLICY "Users can create comments"
  ON activity_comments FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own comments" ON activity_comments;
CREATE POLICY "Users can update own comments"
  ON activity_comments FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own comments" ON activity_comments;
CREATE POLICY "Users can delete own comments"
  ON activity_comments FOR DELETE
  USING (user_id = auth.uid());

-- Challenges policies
DROP POLICY IF EXISTS "Anyone can view active challenges" ON challenges;
CREATE POLICY "Anyone can view active challenges"
  ON challenges FOR SELECT
  USING (status = 'active' OR creator_id = auth.uid());

DROP POLICY IF EXISTS "Users can create challenges" ON challenges;
CREATE POLICY "Users can create challenges"
  ON challenges FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Challenge participants policies
DROP POLICY IF EXISTS "Anyone can view challenge participants" ON challenge_participants;
CREATE POLICY "Anyone can view challenge participants"
  ON challenge_participants FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can join challenges" ON challenge_participants;
CREATE POLICY "Users can join challenges"
  ON challenge_participants FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- User reports policies (users can only see their own reports)
DROP POLICY IF EXISTS "Users can view own reports" ON user_reports;
CREATE POLICY "Users can view own reports"
  ON user_reports FOR SELECT
  USING (reporter_id = auth.uid());

DROP POLICY IF EXISTS "Users can create reports" ON user_reports;
CREATE POLICY "Users can create reports"
  ON user_reports FOR INSERT
  WITH CHECK (reporter_id = auth.uid());

-- ============================================
-- 18. HELPER FUNCTIONS
-- ============================================

-- Function to check if users are friends
CREATE OR REPLACE FUNCTION are_friends(user1_id UUID, user2_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM friendships
    WHERE status = 'accepted'
    AND (
      (requester_id = user1_id AND addressee_id = user2_id)
      OR (requester_id = user2_id AND addressee_id = user1_id)
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a user is blocked
CREATE OR REPLACE FUNCTION is_blocked(checker_id UUID, target_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_blocks
    WHERE (blocker_id = checker_id AND blocked_id = target_id)
       OR (blocker_id = target_id AND blocked_id = checker_id)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update guild member count
CREATE OR REPLACE FUNCTION update_guild_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE guilds SET member_count = member_count + 1 WHERE id = NEW.guild_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE guilds SET member_count = member_count - 1 WHERE id = OLD.guild_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger for guild member count
DROP TRIGGER IF EXISTS trigger_update_guild_member_count ON guild_members;
CREATE TRIGGER trigger_update_guild_member_count
  AFTER INSERT OR DELETE ON guild_members
  FOR EACH ROW EXECUTE FUNCTION update_guild_member_count();

-- Function to update activity like count
CREATE OR REPLACE FUNCTION update_activity_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE activity_feed SET like_count = like_count + 1 WHERE id = NEW.activity_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE activity_feed SET like_count = like_count - 1 WHERE id = OLD.activity_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger for activity like count
DROP TRIGGER IF EXISTS trigger_update_activity_like_count ON activity_likes;
CREATE TRIGGER trigger_update_activity_like_count
  AFTER INSERT OR DELETE ON activity_likes
  FOR EACH ROW EXECUTE FUNCTION update_activity_like_count();

-- Function to update activity comment count
CREATE OR REPLACE FUNCTION update_activity_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE activity_feed SET comment_count = comment_count + 1 WHERE id = NEW.activity_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE activity_feed SET comment_count = comment_count - 1 WHERE id = OLD.activity_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger for activity comment count
DROP TRIGGER IF EXISTS trigger_update_activity_comment_count ON activity_comments;
CREATE TRIGGER trigger_update_activity_comment_count
  AFTER INSERT OR DELETE ON activity_comments
  FOR EACH ROW EXECUTE FUNCTION update_activity_comment_count();

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
