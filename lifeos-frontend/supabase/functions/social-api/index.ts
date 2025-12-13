/**
 * Social API Edge Function
 * Handles social features including leaderboards, friends, and presence
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Redis configuration
const REDIS_URL = Deno.env.get('UPSTASH_REDIS_URL') || 'https://major-ghoul-37874.upstash.io';
const REDIS_TOKEN = Deno.env.get('UPSTASH_REDIS_TOKEN') || 'AZPyAAIncDJmYjY1OWFjNDQ2MTk0ZThhOGMzZDhjYjhjNDBmNmY4M3AyMzc4NzQ';

// Leaderboard keys
const LEADERBOARD_KEYS = {
  GLOBAL_XP: 'leaderboard:global:xp',
  WEEKLY_XP: 'leaderboard:weekly:xp',
  MONTHLY_XP: 'leaderboard:monthly:xp',
  STREAK: 'leaderboard:streak',
  GUILD_XP: 'leaderboard:guild:xp',
};

// Redis helper
async function redisCommand(command: string, ...args: (string | number)[]) {
  const response = await fetch(REDIS_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${REDIS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([command, ...args.map(String)]),
  });

  if (!response.ok) {
    throw new Error(`Redis error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.result;
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const path = url.pathname.replace('/social-api', '');
    const method = req.method;

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    // Route handlers
    switch (true) {
      // ============================================
      // LEADERBOARDS
      // ============================================

      case path === '/leaderboards' && method === 'GET': {
        const type = url.searchParams.get('type') || 'global';
        const limit = parseInt(url.searchParams.get('limit') || '100');

        let leaderboardKey: string;
        switch (type) {
          case 'weekly':
            leaderboardKey = LEADERBOARD_KEYS.WEEKLY_XP;
            break;
          case 'monthly':
            leaderboardKey = LEADERBOARD_KEYS.MONTHLY_XP;
            break;
          case 'streak':
            leaderboardKey = LEADERBOARD_KEYS.STREAK;
            break;
          case 'guild':
            leaderboardKey = LEADERBOARD_KEYS.GUILD_XP;
            break;
          default:
            leaderboardKey = LEADERBOARD_KEYS.GLOBAL_XP;
        }

        // Get top entries from Redis
        const results = await redisCommand('ZREVRANGE', leaderboardKey, 0, limit - 1, 'WITHSCORES');

        // Parse results
        const entries: { userId: string; score: number; rank: number }[] = [];
        for (let i = 0; i < results.length; i += 2) {
          entries.push({
            userId: results[i],
            score: parseFloat(results[i + 1]),
            rank: Math.floor(i / 2) + 1,
          });
        }

        // Get user profiles
        const userIds = entries.map(e => e.userId);
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('user_id, display_name, avatar_url, current_level, title')
          .in('user_id', userIds);

        const profileMap: Record<string, any> = {};
        profiles?.forEach(p => { profileMap[p.user_id] = p; });

        // Enrich entries
        const enrichedEntries = entries.map(e => ({
          ...e,
          profile: profileMap[e.userId] || null,
        }));

        // Get current user's rank if authenticated
        let myRank = null;
        if (userId) {
          const rank = await redisCommand('ZREVRANK', leaderboardKey, userId);
          if (rank !== null) {
            myRank = rank + 1;
          }
        }

        return new Response(JSON.stringify({
          success: true,
          data: {
            entries: enrichedEntries,
            myRank,
            total: await redisCommand('ZCARD', leaderboardKey),
          },
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Update leaderboard score
      case path === '/leaderboards/update' && method === 'POST': {
        if (!userId) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const body = await req.json();
        const { totalXP, xpGained, currentStreak } = body;

        // Check if user has opted into leaderboards
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('show_on_leaderboards')
          .eq('user_id', userId)
          .single();

        if (!profile?.show_on_leaderboards) {
          return new Response(JSON.stringify({
            success: false,
            error: 'User has not opted into leaderboards',
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Update global XP
        if (totalXP !== undefined) {
          await redisCommand('ZADD', LEADERBOARD_KEYS.GLOBAL_XP, totalXP, userId);
        }

        // Increment weekly/monthly XP
        if (xpGained && xpGained > 0) {
          await redisCommand('ZINCRBY', LEADERBOARD_KEYS.WEEKLY_XP, xpGained, userId);
          await redisCommand('ZINCRBY', LEADERBOARD_KEYS.MONTHLY_XP, xpGained, userId);
        }

        // Update streak
        if (currentStreak !== undefined) {
          await redisCommand('ZADD', LEADERBOARD_KEYS.STREAK, currentStreak, userId);
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ============================================
      // PRESENCE
      // ============================================

      case path === '/presence/online' && method === 'POST': {
        if (!userId) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        await redisCommand('ZADD', 'presence:online', Date.now(), userId);

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case path === '/presence/friends' && method === 'GET': {
        if (!userId) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Get user's friends
        const { data: friendships } = await supabase
          .from('friendships')
          .select('requester_id, addressee_id')
          .eq('status', 'accepted')
          .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

        const friendIds = friendships?.map(f =>
          f.requester_id === userId ? f.addressee_id : f.requester_id
        ) || [];

        if (friendIds.length === 0) {
          return new Response(JSON.stringify({ success: true, data: [] }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Check which friends are online (active in last 5 minutes)
        const cutoff = Date.now() - (5 * 60 * 1000);
        const onlineUsers = await redisCommand('ZRANGEBYSCORE', 'presence:online', cutoff, '+inf');
        const onlineSet = new Set(onlineUsers);

        const onlineFriends = friendIds.filter(id => onlineSet.has(id));

        return new Response(JSON.stringify({
          success: true,
          data: onlineFriends,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ============================================
      // FRIEND SUGGESTIONS
      // ============================================

      case path === '/friends/suggestions' && method === 'GET': {
        if (!userId) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Get user's current friends and blocks
        const { data: friendships } = await supabase
          .from('friendships')
          .select('requester_id, addressee_id')
          .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

        const { data: blocks } = await supabase
          .from('user_blocks')
          .select('blocker_id, blocked_id')
          .or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`);

        const excludeIds = new Set([userId]);
        friendships?.forEach(f => {
          excludeIds.add(f.requester_id);
          excludeIds.add(f.addressee_id);
        });
        blocks?.forEach(b => {
          excludeIds.add(b.blocker_id);
          excludeIds.add(b.blocked_id);
        });

        // Get user's guild
        const { data: membership } = await supabase
          .from('guild_members')
          .select('guild_id')
          .eq('user_id', userId)
          .single();

        let suggestions: any[] = [];

        // Suggest guild members
        if (membership?.guild_id) {
          const { data: guildMembers } = await supabase
            .from('guild_members')
            .select(`
              user:user_profiles!guild_members_user_id_fkey(user_id, display_name, avatar_url, current_level)
            `)
            .eq('guild_id', membership.guild_id)
            .limit(10);

          suggestions = guildMembers
            ?.filter(m => m.user && !excludeIds.has(m.user.user_id))
            .map(m => ({ ...m.user, reason: 'Same guild' })) || [];
        }

        // Add active users if we need more suggestions
        if (suggestions.length < 10) {
          const { data: activeUsers } = await supabase
            .from('user_profiles')
            .select('user_id, display_name, avatar_url, current_level')
            .eq('allow_friend_requests', true)
            .eq('privacy_level', 'public')
            .order('last_active_at', { ascending: false })
            .limit(20);

          const additionalSuggestions = activeUsers
            ?.filter(u => !excludeIds.has(u.user_id) && !suggestions.find(s => s.user_id === u.user_id))
            .slice(0, 10 - suggestions.length)
            .map(u => ({ ...u, reason: 'Active user' })) || [];

          suggestions = [...suggestions, ...additionalSuggestions];
        }

        return new Response(JSON.stringify({
          success: true,
          data: suggestions,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ============================================
      // WEEKLY LEADERBOARD RESET
      // ============================================

      case path === '/admin/reset-weekly' && method === 'POST': {
        // This should be called by a cron job
        const adminKey = req.headers.get('X-Admin-Key');
        if (adminKey !== Deno.env.get('ADMIN_SECRET_KEY')) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Archive current weekly leaderboard
        const weeklyTop = await redisCommand('ZREVRANGE', LEADERBOARD_KEYS.WEEKLY_XP, 0, 99, 'WITHSCORES');

        // Store snapshot in database
        await supabase
          .from('leaderboard_snapshots')
          .insert({
            board_type: 'weekly_xp',
            time_period: 'weekly',
            rankings: weeklyTop,
          });

        // Clear weekly leaderboard
        await redisCommand('DEL', LEADERBOARD_KEYS.WEEKLY_XP);

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ============================================
      // SYNC USER TO LEADERBOARDS
      // ============================================

      case path === '/sync' && method === 'POST': {
        if (!userId) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Get user's current stats
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('total_xp, current_streak, show_on_leaderboards')
          .eq('user_id', userId)
          .single();

        if (!profile) {
          return new Response(JSON.stringify({ error: 'Profile not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        if (profile.show_on_leaderboards) {
          await redisCommand('ZADD', LEADERBOARD_KEYS.GLOBAL_XP, profile.total_xp || 0, userId);
          await redisCommand('ZADD', LEADERBOARD_KEYS.STREAK, profile.current_streak || 0, userId);
        } else {
          // Remove from leaderboards if opted out
          await redisCommand('ZREM', LEADERBOARD_KEYS.GLOBAL_XP, userId);
          await redisCommand('ZREM', LEADERBOARD_KEYS.WEEKLY_XP, userId);
          await redisCommand('ZREM', LEADERBOARD_KEYS.MONTHLY_XP, userId);
          await redisCommand('ZREM', LEADERBOARD_KEYS.STREAK, userId);
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('Social API error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Internal server error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
