# Social Module

## Purpose
Connect with friends, join guilds, compete on leaderboards, and participate in challenges. Gamified social features increase accountability and motivation.

## Location
- **Route**: `/social`
- **Navigation**: Sidebar → Social
- **Icon**: Users icon
- **Color**: Primary Blue (`--primary-500`)

## Key Features (5 Tabs)

### 1. Feed Tab
- **Your Daily Summary**: Personal stats for today (workouts, tasks completed, XP earned)
- **Activity Stream**: Friends' recent activities
  - "Sarah completed 'Morning Workout' quest"
  - "Alex reached Level 15"
  - "Jordan logged 3 deep work sessions"

### 2. Leaderboards Tab
- **Global Rankings**: All users ranked by XP
- **Friends Rankings**: Only friends, ranked by XP
- **Guild Rankings**: Guild members only
- **Top 3**: Special crown icons (Gold 👑, Silver, Bronze)
- **Your Rank**: Highlighted row showing your position

### 3. Guilds Tab
- **My Guild Section**:
  - Guild name, member count, total XP
  - Group streak (consecutive days all members logged activity)
  - Guild chat (coming soon)
  - Member list with avatars and levels
- **Browse/Join Section**:
  - List of available guilds
  - Filters: Size, Activity Level, Focus Area
  - "Request to Join" button

### 4. Friends Tab
- **Pending Requests**: Friend requests awaiting approval
- **Search Users**: Find users by username
- **Friends List**:
  - Avatar, username, level
  - Last active timestamp
  - Current streak
  - Quick message button

### 5. Challenges Tab
- **Active Challenges**:
  - Individual challenges (e.g., "100 Push-ups in a Week")
  - Guild challenges (e.g., "Collective 1000 Deep Work Hours")
- **Progress Bars**: Visual progress for each challenge
- **Rewards**: XP and credits for completion
- **Time Remaining**: Countdown to deadline

## Common User Questions

**Q: "How do I find friends?"**
A: Go to Social → Friends tab → Search for username → Send friend request

**Q: "What's a guild?"**
A: Guilds are groups of users who work together on group challenges and share a collective streak. Join one in the Guilds tab.

**Q: "How do leaderboards work?"**
A: Leaderboards rank users by total XP. Top 3 get crown icons. You can filter by Global, Friends, or Guild.

**Q: "What are challenges?"**
A: Timed goals with specific targets (e.g., "Run 50km this month"). Complete them for bonus XP and credits.

**Q: "How does the group streak work?"**
A: All guild members must log at least one activity per day to keep the streak alive. If one member misses, the streak resets.

## Data Structures

### Guilds
- `id`, `name`, `description`, `member_count`, `total_xp`, `current_streak`, `created_at`

### Guild Members
- `guild_id`, `user_id`, `role` (member/admin), `joined_at`

### Friend Relationships
- `user_id`, `friend_id`, `status` (pending/accepted), `created_at`

### Challenges
- `id`, `title`, `description`, `type` (individual/guild), `target`, `reward_xp`, `reward_credits`, `start_date`, `end_date`

### Challenge Progress
- `challenge_id`, `user_id`, `current_progress`, `last_updated`

## Social Features Research

Based on 2025 research:
- Guilds increase completion rates by 45%
- Social leaderboards keep 78% of users active beyond 90 days
- 89% believe gamification increases productivity

## Privacy Controls

Users can control:
- Who sees their activity feed (public/friends-only/private)
- Leaderboard visibility (appear on leaderboards or not)
- Friend request permissions (everyone/friends-of-friends/nobody)

## Related Modules

- **Dashboard**: Shows guild info and active challenges
- **Character**: Equipment earned from social challenges
- **Quests**: Many quests are social (guild challenges)
