# LifeOS Social Tab - Comprehensive Implementation Plan

## Executive Summary

This document outlines the complete implementation plan for a safe, scalable, and engaging social system for LifeOS. The plan prioritizes user safety, privacy compliance (GDPR), and a positive community experience while enabling meaningful social interactions around personal growth.

---

## Table of Contents

1. [Core Architecture](#1-core-architecture)
2. [Database Schema](#2-database-schema)
3. [Privacy & Security](#3-privacy--security)
4. [Moderation System](#4-moderation-system)
5. [Feature Specifications](#5-feature-specifications)
6. [Real-time Infrastructure](#6-real-time-infrastructure)
7. [Implementation Phases](#7-implementation-phases)
8. [Safety Measures](#8-safety-measures)

---

## 1. Core Architecture

### Technology Stack
- **Database**: PostgreSQL via Supabase (with RLS policies)
- **Real-time**: Supabase Realtime (Presence + Broadcast)
- **Caching**: Redis (via Upstash) for leaderboards and activity feeds
- **Content Moderation**: Hybrid AI + human review system
- **Edge Functions**: Supabase Edge Functions for server-side logic

### Design Principles
1. **Privacy by Default**: All profiles private until user opts-in
2. **Consent-First**: Explicit consent for all data sharing
3. **Safety-First**: Block/report available everywhere, instant effect
4. **Minimal Data**: Only collect what's necessary
5. **User Control**: Easy data export and deletion

---

## 2. Database Schema

### 2.1 User Profiles (Social Extension)

```sql
-- Social profile settings (extends auth.users)
CREATE TABLE social_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Display settings
  display_name VARCHAR(30) NOT NULL,
  avatar_url TEXT,
  bio VARCHAR(280),
  title VARCHAR(50), -- Earned title shown under name

  -- Privacy settings
  privacy_level VARCHAR(20) DEFAULT 'friends_only', -- 'public', 'friends_only', 'private'
  show_on_leaderboards BOOLEAN DEFAULT false,
  show_activity_feed BOOLEAN DEFAULT false,
  allow_friend_requests BOOLEAN DEFAULT true,
  allow_guild_invites BOOLEAN DEFAULT true,

  -- Stats (for leaderboards - only shared if opted in)
  total_xp BIGINT DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_social_profiles_user_id ON social_profiles(user_id);
CREATE INDEX idx_social_profiles_display_name ON social_profiles(display_name);
CREATE INDEX idx_social_profiles_total_xp ON social_profiles(total_xp DESC) WHERE show_on_leaderboards = true;
```

### 2.2 Friends System

```sql
-- Friend relationships (bidirectional after acceptance)
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  addressee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'declined', 'blocked'

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,

  -- Prevent duplicates
  UNIQUE(requester_id, addressee_id),

  -- Prevent self-friending
  CHECK (requester_id != addressee_id)
);

-- Indexes for efficient friend lookups
CREATE INDEX idx_friendships_requester ON friendships(requester_id, status);
CREATE INDEX idx_friendships_addressee ON friendships(addressee_id, status);
CREATE INDEX idx_friendships_accepted ON friendships(status) WHERE status = 'accepted';
```

### 2.3 Block System

```sql
-- User blocks (immediate effect, supersedes friendships)
CREATE TABLE user_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reason VARCHAR(100), -- Optional, for user's reference
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(blocker_id, blocked_id),
  CHECK (blocker_id != blocked_id)
);

CREATE INDEX idx_blocks_blocker ON user_blocks(blocker_id);
CREATE INDEX idx_blocks_blocked ON user_blocks(blocked_id);
```

### 2.4 Guilds System

```sql
-- Guilds (teams/clans)
CREATE TABLE guilds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic info
  name VARCHAR(30) NOT NULL UNIQUE,
  description VARCHAR(500),
  icon_url TEXT,
  banner_url TEXT,

  -- Settings
  privacy VARCHAR(20) DEFAULT 'open', -- 'open', 'apply', 'invite_only'
  max_members INTEGER DEFAULT 50,
  min_level_requirement INTEGER DEFAULT 1,

  -- Stats
  total_xp BIGINT DEFAULT 0,
  member_count INTEGER DEFAULT 0,

  -- Leadership
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guild membership
CREATE TABLE guild_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID REFERENCES guilds(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Role hierarchy: owner > officer > member
  role VARCHAR(20) DEFAULT 'member', -- 'owner', 'officer', 'member'

  -- Contribution tracking
  xp_contributed BIGINT DEFAULT 0,

  -- Timestamps
  joined_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(guild_id, user_id)
);

-- Guild applications (for 'apply' privacy guilds)
CREATE TABLE guild_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID REFERENCES guilds(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message VARCHAR(280),
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'declined'
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,

  UNIQUE(guild_id, user_id)
);

-- Guild invites (for invite_only guilds)
CREATE TABLE guild_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID REFERENCES guilds(id) ON DELETE CASCADE,
  inviter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'declined', 'expired'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',

  UNIQUE(guild_id, invitee_id)
);

-- Indexes
CREATE INDEX idx_guilds_name ON guilds(name);
CREATE INDEX idx_guilds_total_xp ON guilds(total_xp DESC);
CREATE INDEX idx_guild_members_guild ON guild_members(guild_id);
CREATE INDEX idx_guild_members_user ON guild_members(user_id);
```

### 2.5 Leaderboards

```sql
-- Cached leaderboard snapshots (updated periodically)
CREATE TABLE leaderboard_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Leaderboard type
  board_type VARCHAR(30) NOT NULL, -- 'global_xp', 'weekly_xp', 'monthly_xp', 'streak', 'guild_xp'
  time_period VARCHAR(20), -- 'all_time', 'weekly', 'monthly', 'daily'

  -- Snapshot data (JSONB for flexibility)
  rankings JSONB NOT NULL, -- Array of {user_id, rank, score, display_name, avatar_url}

  -- Timestamps
  snapshot_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 hour'
);

-- Personal best records
CREATE TABLE personal_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  record_type VARCHAR(50) NOT NULL, -- 'longest_streak', 'most_xp_day', 'most_workouts_week', etc.
  record_value BIGINT NOT NULL,
  achieved_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, record_type)
);

CREATE INDEX idx_leaderboard_snapshots_type ON leaderboard_snapshots(board_type, time_period);
CREATE INDEX idx_personal_records_user ON personal_records(user_id);
```

### 2.6 Activity Feed

```sql
-- Activity feed events (polymorphic design)
CREATE TABLE activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Event details
  event_type VARCHAR(50) NOT NULL, -- 'level_up', 'achievement', 'streak_milestone', 'guild_join', etc.
  event_data JSONB NOT NULL, -- Flexible payload based on event_type

  -- Visibility
  visibility VARCHAR(20) DEFAULT 'friends', -- 'public', 'friends', 'guild', 'private'

  -- Engagement
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity likes
CREATE TABLE activity_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES activity_feed(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(activity_id, user_id)
);

-- Activity comments
CREATE TABLE activity_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES activity_feed(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content VARCHAR(280) NOT NULL,

  -- Moderation
  is_hidden BOOLEAN DEFAULT false,
  hidden_reason VARCHAR(100),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compound indexes for feed queries
CREATE INDEX idx_activity_feed_user_created ON activity_feed(user_id, created_at DESC);
CREATE INDEX idx_activity_feed_visibility ON activity_feed(visibility, created_at DESC);
CREATE INDEX idx_activity_comments_activity ON activity_comments(activity_id, created_at);
```

### 2.7 Challenges System

```sql
-- Challenge definitions
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic info
  title VARCHAR(100) NOT NULL,
  description VARCHAR(500),
  icon VARCHAR(50), -- Emoji or icon name

  -- Challenge parameters
  challenge_type VARCHAR(30) NOT NULL, -- 'individual', 'head_to_head', 'guild_vs_guild', 'community'
  metric_type VARCHAR(50) NOT NULL, -- 'total_xp', 'workout_count', 'streak_days', etc.
  target_value BIGINT NOT NULL,

  -- Duration
  duration_days INTEGER NOT NULL,

  -- Rewards
  xp_reward INTEGER DEFAULT 0,
  badge_reward VARCHAR(50), -- Badge ID if applicable

  -- Creator (null for system challenges)
  creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Status
  status VARCHAR(20) DEFAULT 'active', -- 'draft', 'active', 'completed', 'cancelled'

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ
);

-- Challenge participants
CREATE TABLE challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Progress
  current_value BIGINT DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,

  -- Rank (for competitive challenges)
  final_rank INTEGER,

  joined_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(challenge_id, user_id)
);

CREATE INDEX idx_challenges_status ON challenges(status, starts_at);
CREATE INDEX idx_challenge_participants_challenge ON challenge_participants(challenge_id);
CREATE INDEX idx_challenge_participants_user ON challenge_participants(user_id);
```

### 2.8 Moderation & Reports

```sql
-- User reports
CREATE TABLE user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Reporter
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Reported content/user
  reported_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_content_type VARCHAR(30), -- 'profile', 'comment', 'guild_name', 'display_name'
  reported_content_id UUID, -- Reference to specific content if applicable

  -- Report details
  reason VARCHAR(50) NOT NULL, -- 'harassment', 'spam', 'inappropriate_content', 'hate_speech', 'other'
  description VARCHAR(500),

  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'reviewed', 'actioned', 'dismissed'
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  action_taken VARCHAR(100),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Moderation actions log
CREATE TABLE moderation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Target
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Action
  action_type VARCHAR(30) NOT NULL, -- 'warning', 'content_removal', 'mute', 'temp_ban', 'perm_ban'
  reason VARCHAR(500) NOT NULL,

  -- Duration (for temp bans/mutes)
  duration_hours INTEGER,
  expires_at TIMESTAMPTZ,

  -- Moderator
  moderator_id UUID REFERENCES auth.users(id),

  -- Related report
  report_id UUID REFERENCES user_reports(id),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content filter log (AI flagged content)
CREATE TABLE content_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Content details
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type VARCHAR(30) NOT NULL, -- 'comment', 'bio', 'guild_description', etc.
  content_text TEXT NOT NULL,

  -- AI analysis
  toxicity_score DECIMAL(5,4), -- 0.0000 to 1.0000
  categories JSONB, -- {harassment: 0.8, spam: 0.1, etc.}

  -- Action
  auto_blocked BOOLEAN DEFAULT false,
  requires_review BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_reports_status ON user_reports(status, created_at);
CREATE INDEX idx_moderation_actions_user ON moderation_actions(target_user_id, created_at);
CREATE INDEX idx_content_flags_review ON content_flags(requires_review, created_at) WHERE requires_review = true;
```

---

## 3. Privacy & Security

### 3.1 Row Level Security (RLS) Policies

```sql
-- Enable RLS on all social tables
ALTER TABLE social_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE guilds ENABLE ROW LEVEL SECURITY;
ALTER TABLE guild_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_comments ENABLE ROW LEVEL SECURITY;

-- Social Profiles: Users can read public profiles, own profile always readable
CREATE POLICY "Public profiles are viewable by everyone"
  ON social_profiles FOR SELECT
  USING (
    privacy_level = 'public'
    OR user_id = auth.uid()
    OR (
      privacy_level = 'friends_only'
      AND EXISTS (
        SELECT 1 FROM friendships
        WHERE status = 'accepted'
        AND (
          (requester_id = auth.uid() AND addressee_id = social_profiles.user_id)
          OR (addressee_id = auth.uid() AND requester_id = social_profiles.user_id)
        )
      )
    )
  );

CREATE POLICY "Users can update own profile"
  ON social_profiles FOR UPDATE
  USING (user_id = auth.uid());

-- Friendships: Participants can view their friendships
CREATE POLICY "Users can view their friendships"
  ON friendships FOR SELECT
  USING (requester_id = auth.uid() OR addressee_id = auth.uid());

CREATE POLICY "Users can create friend requests"
  ON friendships FOR INSERT
  WITH CHECK (
    requester_id = auth.uid()
    AND NOT EXISTS (
      SELECT 1 FROM user_blocks
      WHERE (blocker_id = addressee_id AND blocked_id = auth.uid())
    )
  );

-- Blocks: Only blocker can see their blocks
CREATE POLICY "Users can view their blocks"
  ON user_blocks FOR SELECT
  USING (blocker_id = auth.uid());

CREATE POLICY "Users can create blocks"
  ON user_blocks FOR INSERT
  WITH CHECK (blocker_id = auth.uid());

CREATE POLICY "Users can delete their blocks"
  ON user_blocks FOR DELETE
  USING (blocker_id = auth.uid());

-- Activity Feed: Respect visibility settings and blocks
CREATE POLICY "Activity feed visibility"
  ON activity_feed FOR SELECT
  USING (
    user_id = auth.uid() -- Own activities
    OR (
      visibility = 'public'
      AND NOT EXISTS (SELECT 1 FROM user_blocks WHERE blocker_id = auth.uid() AND blocked_id = activity_feed.user_id)
      AND NOT EXISTS (SELECT 1 FROM user_blocks WHERE blocker_id = activity_feed.user_id AND blocked_id = auth.uid())
    )
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
```

### 3.2 GDPR Compliance

#### Data Subject Rights Implementation

```typescript
// Edge function: handle-gdpr-request

// 1. Right to Access (Data Export)
async function exportUserData(userId: string) {
  const data = {
    profile: await supabase.from('social_profiles').select('*').eq('user_id', userId).single(),
    friendships: await supabase.from('friendships').select('*').or(`requester_id.eq.${userId},addressee_id.eq.${userId}`),
    activities: await supabase.from('activity_feed').select('*').eq('user_id', userId),
    comments: await supabase.from('activity_comments').select('*').eq('user_id', userId),
    guild_memberships: await supabase.from('guild_members').select('*, guilds(name)').eq('user_id', userId),
    blocks: await supabase.from('user_blocks').select('*').eq('blocker_id', userId),
  };

  return data;
}

// 2. Right to Erasure (Delete Account)
async function deleteUserSocialData(userId: string) {
  // Order matters due to foreign keys
  await supabase.from('activity_comments').delete().eq('user_id', userId);
  await supabase.from('activity_likes').delete().eq('user_id', userId);
  await supabase.from('activity_feed').delete().eq('user_id', userId);
  await supabase.from('challenge_participants').delete().eq('user_id', userId);
  await supabase.from('guild_invites').delete().or(`inviter_id.eq.${userId},invitee_id.eq.${userId}`);
  await supabase.from('guild_applications').delete().eq('user_id', userId);
  await supabase.from('guild_members').delete().eq('user_id', userId);
  await supabase.from('friendships').delete().or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);
  await supabase.from('user_blocks').delete().or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`);
  await supabase.from('social_profiles').delete().eq('user_id', userId);

  // Transfer guild ownership or delete guild if owner
  const ownedGuilds = await supabase.from('guilds').select('id').eq('owner_id', userId);
  for (const guild of ownedGuilds.data || []) {
    // Try to transfer to highest-ranking officer
    const officer = await supabase
      .from('guild_members')
      .select('user_id')
      .eq('guild_id', guild.id)
      .eq('role', 'officer')
      .order('joined_at')
      .limit(1)
      .single();

    if (officer.data) {
      await supabase.from('guilds').update({ owner_id: officer.data.user_id }).eq('id', guild.id);
      await supabase.from('guild_members').update({ role: 'owner' }).eq('guild_id', guild.id).eq('user_id', officer.data.user_id);
    } else {
      // Delete guild if no officers
      await supabase.from('guilds').delete().eq('id', guild.id);
    }
  }
}

// 3. Right to Rectification (handled via profile edit)
// 4. Right to Restriction (handled via privacy settings)
```

### 3.3 Data Minimization

- Store only essential social data
- Auto-delete old activity feed items (90+ days)
- Aggregate old analytics instead of raw events
- Clear expired invites/applications weekly

---

## 4. Moderation System

### 4.1 Hybrid AI + Human Approach

```
                    ┌─────────────────┐
                    │  User Content   │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   AI Analysis   │
                    │  (Edge Function)│
                    └────────┬────────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
    ┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐
    │  Low Risk   │   │ Medium Risk │   │  High Risk  │
    │  (< 0.3)    │   │ (0.3 - 0.7) │   │  (> 0.7)    │
    └──────┬──────┘   └──────┬──────┘   └──────┬──────┘
           │                 │                 │
    ┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐
    │   Publish   │   │ Queue for   │   │   Block +   │
    │  Directly   │   │   Review    │   │   Flag      │
    └─────────────┘   └─────────────┘   └─────────────┘
```

### 4.2 Content Analysis Edge Function

```typescript
// supabase/functions/analyze-content/index.ts

import { createClient } from '@supabase/supabase-js';

interface ContentAnalysis {
  toxicity_score: number;
  categories: {
    harassment: number;
    hate_speech: number;
    spam: number;
    sexual_content: number;
    violence: number;
  };
  should_block: boolean;
  requires_review: boolean;
}

Deno.serve(async (req) => {
  const { content, content_type, user_id } = await req.json();

  // Use Perspective API or similar for toxicity analysis
  const analysis = await analyzeWithPerspective(content);

  // Determine action based on scores
  const maxScore = Math.max(...Object.values(analysis.categories));

  const result: ContentAnalysis = {
    ...analysis,
    should_block: maxScore > 0.85,
    requires_review: maxScore > 0.5 && maxScore <= 0.85,
  };

  // Log for review if needed
  if (result.should_block || result.requires_review) {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    await supabase.from('content_flags').insert({
      user_id,
      content_type,
      content_text: content,
      toxicity_score: result.toxicity_score,
      categories: result.categories,
      auto_blocked: result.should_block,
      requires_review: result.requires_review,
    });
  }

  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' },
  });
});

async function analyzeWithPerspective(text: string): Promise<any> {
  // Integration with Google's Perspective API
  const response = await fetch(
    `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${Deno.env.get('PERSPECTIVE_API_KEY')}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        comment: { text },
        languages: ['en'],
        requestedAttributes: {
          TOXICITY: {},
          SEVERE_TOXICITY: {},
          IDENTITY_ATTACK: {},
          INSULT: {},
          THREAT: {},
          SEXUALLY_EXPLICIT: {},
        },
      }),
    }
  );

  const data = await response.json();

  return {
    toxicity_score: data.attributeScores?.TOXICITY?.summaryScore?.value || 0,
    categories: {
      harassment: data.attributeScores?.INSULT?.summaryScore?.value || 0,
      hate_speech: data.attributeScores?.IDENTITY_ATTACK?.summaryScore?.value || 0,
      spam: 0, // Handled separately
      sexual_content: data.attributeScores?.SEXUALLY_EXPLICIT?.summaryScore?.value || 0,
      violence: data.attributeScores?.THREAT?.summaryScore?.value || 0,
    },
  };
}
```

### 4.3 Report Handling Workflow

1. User submits report with reason + optional description
2. Auto-categorize by reason type
3. Priority queue based on severity:
   - **P1 (Immediate)**: Threats, illegal content, severe harassment
   - **P2 (Within 24h)**: Harassment, hate speech, repeated offenses
   - **P3 (Within 72h)**: Spam, minor guideline violations
4. Review and action (warning → mute → temp ban → perm ban)
5. Notify reporter of outcome (anonymized)

---

## 5. Feature Specifications

### 5.1 Friends System

#### Features
- Send/accept/decline friend requests
- View friends list with online status
- Unfriend functionality
- Friend suggestions (based on guilds, similar activity patterns)

#### Privacy Controls
- Allow/disallow friend requests
- Hide online status
- Appear offline to specific users

#### API Endpoints (Edge Functions)
```
POST   /friends/request          - Send friend request
POST   /friends/accept/:id       - Accept request
POST   /friends/decline/:id      - Decline request
DELETE /friends/:id              - Remove friend
GET    /friends                  - List friends
GET    /friends/requests         - List pending requests
GET    /friends/suggestions      - Get friend suggestions
```

### 5.2 Guilds System

#### Features
- Create guild (requires level 10+)
- Join open guilds or apply to restricted
- Guild leaderboards (internal + global)
- Guild-wide challenges
- Guild chat (future phase)
- Guild XP contribution tracking

#### Roles & Permissions
| Permission | Owner | Officer | Member |
|------------|-------|---------|--------|
| Edit guild settings | ✓ | ✗ | ✗ |
| Kick members | ✓ | ✓* | ✗ |
| Accept applications | ✓ | ✓ | ✗ |
| Send invites | ✓ | ✓ | ✗ |
| Create challenges | ✓ | ✓ | ✗ |
| Promote to officer | ✓ | ✗ | ✗ |
| Transfer ownership | ✓ | ✗ | ✗ |

*Officers can only kick members, not other officers

#### API Endpoints
```
POST   /guilds                   - Create guild
GET    /guilds                   - List guilds (paginated, filterable)
GET    /guilds/:id               - Get guild details
PATCH  /guilds/:id               - Update guild (owner only)
DELETE /guilds/:id               - Delete guild (owner only)
POST   /guilds/:id/join          - Join open guild
POST   /guilds/:id/apply         - Apply to restricted guild
POST   /guilds/:id/leave         - Leave guild
POST   /guilds/:id/invite        - Send invite
POST   /guilds/:id/kick/:userId  - Kick member
GET    /guilds/:id/members       - List members
```

### 5.3 Leaderboards

#### Types
1. **Global XP** - All-time XP earned
2. **Weekly XP** - XP earned this week (resets Sunday)
3. **Monthly XP** - XP earned this month
4. **Streaks** - Current active streak
5. **Guild Rankings** - Combined guild XP

#### Features
- Opt-in only (privacy setting)
- Show rank, score, and minimal profile info
- Filter by time period
- Friends-only leaderboard view
- Guild-internal leaderboard
- Percentile display (top 10%, top 25%, etc.)

#### Caching Strategy (Redis via Upstash)
```typescript
// Leaderboard keys
`leaderboard:global:xp`        // Sorted set: userId -> totalXP
`leaderboard:weekly:xp`        // Sorted set: userId -> weeklyXP (TTL: end of week)
`leaderboard:monthly:xp`       // Sorted set: userId -> monthlyXP (TTL: end of month)
`leaderboard:streak`           // Sorted set: userId -> currentStreak
`leaderboard:guild:xp`         // Sorted set: guildId -> totalXP

// Update on XP gain
await redis.zincrby('leaderboard:global:xp', xpGained, userId);
await redis.zincrby('leaderboard:weekly:xp', xpGained, userId);

// Get rankings
const globalRank = await redis.zrevrank('leaderboard:global:xp', userId);
const top100 = await redis.zrevrange('leaderboard:global:xp', 0, 99, 'WITHSCORES');
```

### 5.4 Activity Feed

#### Event Types
| Event | Description | Auto-shared |
|-------|-------------|-------------|
| level_up | User reached new level | Friends |
| achievement | Earned achievement/badge | Friends |
| streak_milestone | 7/30/100/365 day streak | Friends |
| guild_join | Joined a guild | Guild + Friends |
| challenge_complete | Completed challenge | Friends |
| personal_record | New personal best | Optional |

#### Feed Algorithms
1. **Chronological** - Simple time-ordered feed
2. **Relevance** - Prioritize close friends, mutual interactions

#### Engagement
- Like activities (high fives)
- Comment on activities (text-only, moderated)
- Share to guild (re-post to guild feed)

### 5.5 Challenges

#### Challenge Types
1. **Individual** - Personal goal (e.g., earn 1000 XP this week)
2. **Head-to-Head** - 1v1 competition with friend
3. **Guild Challenge** - Guild-wide goal
4. **Community** - Server-wide events

#### Challenge Creation
- System challenges (weekly rotating)
- User-created (friends only, no stakes)
- Guild challenges (officers can create)

#### Rewards
- XP bonus on completion
- Special badges/achievements
- Leaderboard recognition

---

## 6. Real-time Infrastructure

### 6.1 Supabase Realtime Setup

```typescript
// lib/realtime.ts

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Online presence
export function setupPresence(userId: string) {
  const presenceChannel = supabase.channel('online-users');

  presenceChannel
    .on('presence', { event: 'sync' }, () => {
      const state = presenceChannel.presenceState();
      // Update online users in store
      useOnlineStore.getState().setOnlineUsers(Object.keys(state));
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      // User came online
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      // User went offline
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await presenceChannel.track({
          user_id: userId,
          online_at: new Date().toISOString(),
        });
      }
    });

  return presenceChannel;
}

// Activity feed updates
export function subscribeToFeed(userId: string, onNewActivity: (activity: any) => void) {
  return supabase
    .channel('activity-feed')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'activity_feed',
        filter: `user_id=in.(${getFriendIds(userId).join(',')})`,
      },
      (payload) => {
        onNewActivity(payload.new);
      }
    )
    .subscribe();
}

// Friend request notifications
export function subscribeToFriendRequests(userId: string, onRequest: (request: any) => void) {
  return supabase
    .channel('friend-requests')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'friendships',
        filter: `addressee_id=eq.${userId}`,
      },
      (payload) => {
        onRequest(payload.new);
      }
    )
    .subscribe();
}

// Guild activity
export function subscribeToGuildActivity(guildId: string, onActivity: (activity: any) => void) {
  return supabase
    .channel(`guild-${guildId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'guild_members',
        filter: `guild_id=eq.${guildId}`,
      },
      (payload) => {
        onActivity(payload);
      }
    )
    .subscribe();
}
```

### 6.2 Notification System

```typescript
// stores/notificationStore.ts

interface Notification {
  id: string;
  type: 'friend_request' | 'friend_accepted' | 'guild_invite' | 'challenge_invite' |
        'like' | 'comment' | 'achievement' | 'level_up';
  title: string;
  body: string;
  data: Record<string, any>;
  read: boolean;
  created_at: string;
}

// Notification preferences (stored in social_profiles)
interface NotificationPreferences {
  friend_requests: boolean;
  guild_activity: boolean;
  likes_comments: boolean;
  challenges: boolean;
  achievements: boolean;
  push_enabled: boolean;
  email_enabled: boolean;
}
```

---

## 7. Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Create all database tables with migrations
- [ ] Implement RLS policies
- [ ] Create social_profiles extension
- [ ] Basic CRUD edge functions
- [ ] Privacy settings UI

### Phase 2: Friends (Week 3-4)
- [ ] Friend request flow
- [ ] Friends list with online status
- [ ] Block/unblock functionality
- [ ] Friend suggestions algorithm
- [ ] Real-time presence

### Phase 3: Activity Feed (Week 5-6)
- [ ] Activity logging on key events
- [ ] Feed display with visibility filtering
- [ ] Like/comment functionality
- [ ] Content moderation integration
- [ ] Real-time feed updates

### Phase 4: Leaderboards (Week 7)
- [ ] Redis caching setup
- [ ] Leaderboard calculations
- [ ] Opt-in/out flow
- [ ] Multiple leaderboard views
- [ ] Personal stats comparison

### Phase 5: Guilds (Week 8-10)
- [ ] Guild CRUD operations
- [ ] Membership management
- [ ] Role permissions
- [ ] Guild leaderboards
- [ ] Application/invite flows

### Phase 6: Challenges (Week 11-12)
- [ ] Challenge system
- [ ] Progress tracking
- [ ] Rewards distribution
- [ ] Head-to-head matchmaking

### Phase 7: Polish & Safety (Week 13-14)
- [ ] Comprehensive testing
- [ ] Load testing leaderboards
- [ ] Security audit
- [ ] GDPR data export/delete
- [ ] Documentation

---

## 8. Safety Measures

### 8.1 Blocking
- Instant effect on all interactions
- Blocked user cannot:
  - Send friend requests
  - See blocker's profile
  - See blocker's activities
  - Join same challenge as blocker
  - Comment on blocker's content
- Block is invisible to blocked user
- No notification sent to blocked user

### 8.2 Reporting
- Available on every user interaction point
- Pre-defined categories for quick reporting
- Optional detailed description
- Anonymous to reported user
- Reporter notified of outcome

### 8.3 Content Guidelines
Prohibited content:
- Harassment, bullying, threats
- Hate speech, discrimination
- Spam, self-promotion
- Explicit/sexual content
- Personal information of others
- Impersonation
- Illegal content

### 8.4 Account Actions
| Violation | First Offense | Second | Third | Fourth |
|-----------|--------------|--------|-------|--------|
| Minor (spam) | Warning | 24h mute | 7d ban | 30d ban |
| Moderate (harassment) | 24h mute | 7d ban | 30d ban | Perm ban |
| Severe (threats) | 7d ban | Perm ban | - | - |
| Criminal | Perm ban + report | - | - | - |

### 8.5 Rate Limiting
```typescript
// Rate limits per user
const RATE_LIMITS = {
  friend_requests: { max: 20, window: '1h' },
  comments: { max: 30, window: '1h' },
  guild_invites: { max: 50, window: '24h' },
  reports: { max: 10, window: '24h' },
  challenge_creates: { max: 5, window: '24h' },
};
```

### 8.6 Age Considerations
- All users assumed 13+ (COPPA compliance)
- No collection of age data beyond this
- No targeted advertising
- Parental controls available (future)

---

## Appendix A: Store Structure

```typescript
// stores/socialStore.ts
interface SocialState {
  // Profile
  profile: SocialProfile | null;

  // Friends
  friends: Friend[];
  pendingRequests: FriendRequest[];
  sentRequests: FriendRequest[];
  blockedUsers: string[];

  // Guilds
  currentGuild: Guild | null;
  guildInvites: GuildInvite[];

  // Feed
  feed: Activity[];
  feedLoading: boolean;

  // Leaderboards
  leaderboards: {
    global: LeaderboardEntry[];
    weekly: LeaderboardEntry[];
    friends: LeaderboardEntry[];
    guild: LeaderboardEntry[];
  };
  myRanks: {
    global: number;
    weekly: number;
    percentile: number;
  };

  // Challenges
  activeChallenges: Challenge[];
  availableChallenges: Challenge[];

  // Online status
  onlineFriends: string[];

  // Actions
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: Partial<SocialProfile>) => Promise<void>;
  sendFriendRequest: (userId: string) => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  blockUser: (userId: string) => Promise<void>;
  // ... more actions
}
```

---

## Appendix B: API Response Formats

```typescript
// Standard success response
interface SuccessResponse<T> {
  success: true;
  data: T;
}

// Standard error response
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

// Pagination
interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}
```

---

## Appendix C: Testing Checklist

### Security Testing
- [ ] RLS policies block unauthorized access
- [ ] Blocked users cannot interact
- [ ] Private profiles not visible to strangers
- [ ] Rate limiting enforced
- [ ] Content moderation catches violations
- [ ] SQL injection prevention
- [ ] XSS prevention in user content

### Functional Testing
- [ ] Friend request flow complete
- [ ] Block/unblock works correctly
- [ ] Guild permissions enforced
- [ ] Leaderboard calculations accurate
- [ ] Activity feed visibility correct
- [ ] Challenge progress tracking accurate
- [ ] Real-time updates working

### Performance Testing
- [ ] Leaderboard queries < 100ms
- [ ] Feed load < 200ms
- [ ] Presence updates < 500ms
- [ ] 1000 concurrent users stable

---

*Document Version: 1.0*
*Last Updated: December 2024*
*Author: LifeOS Development*
