# LifeOS Notification System Design

## Overview

This document outlines the comprehensive notification strategy for LifeOS, including notification types, implementation architecture, best practices, and a phased rollout plan.

---

## Table of Contents

1. [Notification Philosophy](#notification-philosophy)
2. [Notification Categories](#notification-categories)
3. [Complete Notification Catalog](#complete-notification-catalog)
4. [Technical Architecture](#technical-architecture)
5. [Implementation Plan](#implementation-plan)
6. [User Preferences & Settings](#user-preferences--settings)
7. [Best Practices](#best-practices)
8. [Research Sources](#research-sources)

---

## Notification Philosophy

### Core Principles

1. **Value-First**: Every notification must provide clear value. If it doesn't help the user take action or celebrate progress, don't send it.

2. **Respect User Attention**: The average smartphone user receives 46 push notifications per day. We must earn our place among them.

3. **Habit Loop Integration**: Notifications serve as triggers in the habit loop (Trigger → Action → Reward). They should prompt meaningful actions.

4. **Mode-Aware**: Respect gamification mode preferences:
   - **Cosmic Mode**: Full celebratory notifications with XP, achievements, cosmic language
   - **Minimal Mode**: Clean, data-focused alerts without gamification elements

5. **Smart Timing**: Send notifications when users can actually act on them, not just when events occur.

### Key Statistics (2024-2025 Research)

- Push notifications increase engagement by up to **191%**
- **65%** of users return to an app within 30 days after receiving a notification
- **70%** of customers believe push notifications are helpful
- **40%** interact with push notifications within an hour
- Rich media notifications increase click-through rates by **56%**
- Personalized notifications improve reaction rates by **40%**
- **Tuesday** sees the highest engagement at 8.4%

---

## Notification Categories

### 1. In-App Notifications (Already Implemented)
Real-time alerts shown while the user is actively using LifeOS.

**Existing Infrastructure:**
- `Toast.jsx` - Full toast notification system with variants
- `AchievementToast.jsx` - Gamification-specific toasts
- `syncNotifications.js` - Supabase sync notifications

### 2. Push Notifications (To Be Implemented)
Background alerts delivered even when the app is closed.

**Delivery Methods:**
- Web Push API (PWA)
- Firebase Cloud Messaging (FCM)
- Service Worker background sync

### 3. Email Notifications (Future)
Digest-style summaries and important alerts.

**Use Cases:**
- Weekly progress reports
- Streak about to break (24hr warning)
- Major milestones
- Account security

### 4. Scheduled Reminders
Time-based notifications for recurring activities.

**Use Cases:**
- Supplement reminders
- Meal logging windows
- Journaling time
- Daily planning prompt

---

## Complete Notification Catalog

### Gamification & Progress

| ID | Notification | Trigger | Priority | Mode |
|----|--------------|---------|----------|------|
| G001 | Level Up! | XP reaches next level threshold | High | Cosmic |
| G002 | New Level Reached | Level milestone (10, 25, 50, 100) | High | Both |
| G003 | Achievement Unlocked | Achievement requirements met | Medium | Cosmic |
| G004 | Quest Completed | Daily/weekly/monthly quest done | Medium | Cosmic |
| G005 | Streak Started | First consecutive day | Low | Both |
| G006 | Streak Milestone | 7, 14, 30, 60, 100, 365 days | High | Both |
| G007 | Streak at Risk | 2 hours before streak breaks | High | Both |
| G008 | Streak Broken | Missed activity deadline | Medium | Both |
| G009 | XP Milestone | 1000, 5000, 10000+ XP earned | Medium | Cosmic |
| G010 | Constellation Unlocked | New skill constellation star | Medium | Cosmic |
| G011 | Equipment Earned | New item available | Low | Cosmic |
| G012 | Boss Defeated | Boss battle completed | High | Cosmic |

### Productivity & Tasks

| ID | Notification | Trigger | Priority | Timing |
|----|--------------|---------|----------|--------|
| P001 | Task Due Soon | 1 hour before deadline | High | Scheduled |
| P002 | Task Due Now | At deadline | High | Scheduled |
| P003 | Task Overdue | Past deadline | Medium | Immediate |
| P004 | Daily Planning | Morning prompt | Medium | 7-9 AM |
| P005 | Deep Work Complete | Session timer ends | Low | Immediate |
| P006 | Project Milestone | 25%, 50%, 75%, 100% | Medium | Immediate |
| P007 | Weekly Review | End of week prompt | Medium | Sunday PM |
| P008 | Time Block Starting | 15 min before | Medium | Scheduled |
| P009 | Productive Day | 5+ tasks completed | Low | Evening |

### Health & Fitness

| ID | Notification | Trigger | Priority | Timing |
|----|--------------|---------|----------|--------|
| H001 | Supplement Reminder | Optimal timing window | Medium | Scheduled |
| H002 | Water Reminder | Behind daily goal | Low | Every 2hrs |
| H003 | Meal Log Reminder | Meal window (breakfast/lunch/dinner) | Low | Scheduled |
| H004 | Workout Complete | Session ended | Low | Immediate |
| H005 | Workout Streak | 7, 30, 100 workouts | Medium | Immediate |
| H006 | Calorie Goal Met | Daily calories reached | Low | Immediate |
| H007 | Macro Milestone | All macros within target | Medium | Immediate |
| H008 | Recovery Day | After intense workout | Low | Next day AM |
| H009 | Carb Cycle Day | High/low carb day reminder | Low | Morning |
| H010 | Sleep Goal | Bedtime reminder | Medium | Scheduled |

### Financial

| ID | Notification | Trigger | Priority | Timing |
|----|--------------|---------|----------|--------|
| F001 | Budget Warning | 80% of budget spent | Medium | Immediate |
| F002 | Budget Exceeded | 100% of budget | High | Immediate |
| F003 | Large Expense | Above threshold (e.g., $100) | Medium | Immediate |
| F004 | Savings Milestone | 25%, 50%, 75%, 100% of goal | Medium | Immediate |
| F005 | Income Logged | Payment received | Low | Immediate |
| F006 | Net Worth Update | Monthly summary | Low | Monthly |
| F007 | Subscription Due | 3 days before renewal | Medium | Scheduled |
| F008 | Bill Reminder | Upcoming bill payment | Medium | Scheduled |

### Calendar & Time

| ID | Notification | Trigger | Priority | Timing |
|----|--------------|---------|----------|--------|
| C001 | Event Starting | 15/30/60 min before | High | Scheduled |
| C002 | Time Block Start | Block begins | Medium | Scheduled |
| C003 | Calendar Conflict | Overlapping events detected | High | Immediate |
| C004 | Tomorrow Preview | Daily agenda preview | Low | Evening |
| C005 | Week Ahead | Weekly schedule summary | Low | Sunday PM |

### Journal & Reflection

| ID | Notification | Trigger | Priority | Timing |
|----|--------------|---------|----------|--------|
| J001 | Journal Reminder | Daily journaling time | Medium | Scheduled |
| J002 | Journal Streak | 7, 30, 100 day streak | Medium | Immediate |
| J003 | Reflection Prompt | Weekly reflection time | Low | Sunday |
| J004 | Mood Check-in | Daily mood prompt | Low | Scheduled |
| J005 | Gratitude Prompt | Morning gratitude | Low | Morning |

### Learning & Skills

| ID | Notification | Trigger | Priority | Timing |
|----|--------------|---------|----------|--------|
| L001 | Learning Streak | Consecutive learning days | Medium | Immediate |
| L002 | Skill Level Up | Skill advancement | Medium | Immediate |
| L003 | Book Completed | Finished reading | Low | Immediate |
| L004 | Quote of the Day | Daily inspiration | Low | Morning |
| L005 | Practice Reminder | Skill practice due | Low | Scheduled |

### Social & Community

| ID | Notification | Trigger | Priority | Timing |
|----|--------------|---------|----------|--------|
| S001 | Friend Request | New request received | High | Immediate |
| S002 | Challenge Invite | Friend sent challenge | High | Immediate |
| S003 | Challenge Result | Challenge completed | Medium | Immediate |
| S004 | Leaderboard Change | Rank improved/dropped | Low | Weekly |
| S005 | Friend Achievement | Friend unlocked achievement | Low | Immediate |
| S006 | Guild Activity | New member, event, etc. | Low | Batched |
| S007 | Friend Online | Close friend came online | Low | Real-time |

### Resolutions & Goals

| ID | Notification | Trigger | Priority | Timing |
|----|--------------|---------|----------|--------|
| R001 | Check-in Reminder | Daily/weekly check-in due | Medium | Scheduled |
| R002 | Resolution Milestone | 25%, 50%, 75%, 100% | Medium | Immediate |
| R003 | Check-in Streak | Consecutive check-ins | Medium | Immediate |
| R004 | Quarter Review | End of quarter prompt | Low | Quarterly |
| R005 | Resolution Anniversary | 1 month, 6 month, 1 year | Low | Scheduled |

---

## Technical Architecture

### Stack Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT (React PWA)                      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Toast System │  │ Notification │  │ Service Worker   │   │
│  │ (In-App)     │  │ Store        │  │ (Background)     │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                    SUPABASE BACKEND                          │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Realtime     │  │ Edge         │  │ Database         │   │
│  │ Subscriptions│  │ Functions    │  │ Webhooks         │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                   PUSH NOTIFICATION SERVICE                  │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Firebase Cloud Messaging (FCM)              │   │
│  │           (Handles Web Push delivery)                 │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Database Schema

```sql
-- User notification preferences
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,

  -- Global settings
  push_enabled BOOLEAN DEFAULT true,
  email_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '07:00',
  timezone TEXT DEFAULT 'UTC',

  -- Category toggles (JSON for flexibility)
  category_settings JSONB DEFAULT '{
    "gamification": true,
    "productivity": true,
    "health": true,
    "financial": true,
    "calendar": true,
    "journal": true,
    "social": true,
    "learning": true
  }',

  -- Notification-specific overrides
  notification_overrides JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Push subscription tokens
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  device_info JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,

  UNIQUE(user_id, endpoint)
);

-- Notification log (for analytics and deduplication)
CREATE TABLE notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  notification_id TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  channel TEXT NOT NULL, -- 'push', 'in_app', 'email'
  title TEXT NOT NULL,
  body TEXT,
  data JSONB DEFAULT '{}',
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ
);

-- Scheduled notifications
CREATE TABLE scheduled_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  notification_id TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  recurring TEXT, -- 'daily', 'weekly', 'monthly', NULL for one-time
  recurring_config JSONB DEFAULT '{}',
  title TEXT NOT NULL,
  body TEXT,
  data JSONB DEFAULT '{}',
  enabled BOOLEAN DEFAULT true,
  last_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_recurring CHECK (
    recurring IS NULL OR recurring IN ('daily', 'weekly', 'monthly')
  )
);

-- Index for efficient querying
CREATE INDEX idx_scheduled_notifications_user_time
  ON scheduled_notifications(user_id, scheduled_for)
  WHERE enabled = true;

CREATE INDEX idx_notification_log_user_time
  ON notification_log(user_id, sent_at DESC);
```

### Frontend Architecture

#### Notification Store (`notificationStore.js`)

```javascript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useNotificationStore = create(
  persist(
    (set, get) => ({
      // Push subscription state
      pushSubscription: null,
      pushPermission: 'default', // 'default', 'granted', 'denied'

      // In-app notification queue
      notifications: [],
      unreadCount: 0,

      // Preferences (synced with server)
      preferences: {
        pushEnabled: true,
        emailEnabled: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '07:00',
        categories: {
          gamification: true,
          productivity: true,
          health: true,
          financial: true,
          calendar: true,
          journal: true,
          social: true,
          learning: true,
        },
      },

      // Actions
      setPushSubscription: (subscription) =>
        set({ pushSubscription: subscription }),

      setPushPermission: (permission) =>
        set({ pushPermission: permission }),

      addNotification: (notification) =>
        set((state) => ({
          notifications: [notification, ...state.notifications].slice(0, 100),
          unreadCount: state.unreadCount + 1,
        })),

      markAsRead: (notificationId) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        })),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        })),

      updatePreferences: (newPrefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...newPrefs },
        })),

      updateCategoryPreference: (category, enabled) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            categories: {
              ...state.preferences.categories,
              [category]: enabled,
            },
          },
        })),
    }),
    {
      name: 'lifeos-notifications',
      partialize: (state) => ({
        preferences: state.preferences,
        pushPermission: state.pushPermission,
      }),
    }
  )
);
```

#### Service Worker (`firebase-messaging-sw.js`)

```javascript
// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message received:', payload);

  const { title, body, icon, data } = payload.notification || payload.data;

  const notificationOptions = {
    body,
    icon: icon || '/icons/notification-icon.png',
    badge: '/icons/badge-icon.png',
    tag: data?.tag || 'lifeos-notification',
    data: data,
    actions: getActionsForType(data?.type),
    requireInteraction: data?.priority === 'high',
    vibrate: [200, 100, 200],
  };

  return self.registration.showNotification(title, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Focus existing window if available
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.postMessage({
              type: 'NOTIFICATION_CLICK',
              data: event.notification.data,
            });
            return client.focus();
          }
        }
        // Open new window
        return clients.openWindow(urlToOpen);
      })
  );
});

function getActionsForType(type) {
  const actionMap = {
    'task_due': [
      { action: 'complete', title: 'Complete' },
      { action: 'snooze', title: 'Snooze 1hr' },
    ],
    'streak_risk': [
      { action: 'open', title: 'Open App' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
    'achievement': [
      { action: 'view', title: 'View Achievement' },
    ],
  };

  return actionMap[type] || [];
}
```

### Backend Architecture

#### Edge Function: Send Push Notification

```typescript
// supabase/functions/send-push-notification/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const FIREBASE_SERVER_KEY = Deno.env.get('FIREBASE_SERVER_KEY');

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { userId, notification } = await req.json();

  // Get user's push subscriptions
  const { data: subscriptions } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', userId);

  // Get user's notification preferences
  const { data: prefs } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  // Check if notifications are enabled for this category
  if (!prefs?.push_enabled) {
    return new Response(JSON.stringify({ sent: false, reason: 'push_disabled' }));
  }

  const category = notification.category;
  if (prefs?.category_settings && !prefs.category_settings[category]) {
    return new Response(JSON.stringify({ sent: false, reason: 'category_disabled' }));
  }

  // Check quiet hours
  if (isQuietHours(prefs?.quiet_hours_start, prefs?.quiet_hours_end, prefs?.timezone)) {
    return new Response(JSON.stringify({ sent: false, reason: 'quiet_hours' }));
  }

  // Send to all registered devices
  const results = await Promise.all(
    subscriptions.map((sub) => sendFCMNotification(sub, notification))
  );

  // Log notification
  await supabase.from('notification_log').insert({
    user_id: userId,
    notification_id: notification.id,
    notification_type: notification.type,
    channel: 'push',
    title: notification.title,
    body: notification.body,
    data: notification.data,
  });

  return new Response(JSON.stringify({ sent: true, results }));
});

async function sendFCMNotification(subscription, notification) {
  const response = await fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers: {
      'Authorization': `key=${FIREBASE_SERVER_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: subscription.endpoint,
      notification: {
        title: notification.title,
        body: notification.body,
        icon: notification.icon || '/icons/notification-icon.png',
      },
      data: notification.data,
      webpush: {
        fcm_options: {
          link: notification.url || '/',
        },
      },
    }),
  });

  return response.json();
}

function isQuietHours(start, end, timezone) {
  if (!start || !end) return false;

  const now = new Date().toLocaleTimeString('en-US', {
    timeZone: timezone || 'UTC',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  });

  // Handle overnight quiet hours (e.g., 22:00 - 07:00)
  if (start > end) {
    return now >= start || now < end;
  }
  return now >= start && now < end;
}
```

#### Database Webhook: Trigger Notifications

```sql
-- Create a trigger function to send notifications on certain events
CREATE OR REPLACE FUNCTION trigger_notification()
RETURNS TRIGGER AS $$
DECLARE
  notification_payload JSONB;
BEGIN
  -- Construct notification based on table and event
  CASE TG_TABLE_NAME
    WHEN 'achievements' THEN
      IF NEW.unlocked_at IS NOT NULL AND OLD.unlocked_at IS NULL THEN
        notification_payload := jsonb_build_object(
          'type', 'achievement_unlocked',
          'category', 'gamification',
          'title', 'Achievement Unlocked!',
          'body', NEW.name,
          'data', jsonb_build_object(
            'achievement_id', NEW.id,
            'xp_reward', NEW.xp_reward
          )
        );
      END IF;

    WHEN 'user_levels' THEN
      IF NEW.level > OLD.level THEN
        notification_payload := jsonb_build_object(
          'type', 'level_up',
          'category', 'gamification',
          'title', 'Level Up!',
          'body', format('You reached level %s!', NEW.level),
          'data', jsonb_build_object(
            'new_level', NEW.level,
            'total_xp', NEW.total_xp
          )
        );
      END IF;

    -- Add more cases for other tables...
  END CASE;

  -- If we have a notification to send, insert it into the queue
  IF notification_payload IS NOT NULL THEN
    INSERT INTO notification_queue (user_id, payload, created_at)
    VALUES (NEW.user_id, notification_payload, NOW());
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## Implementation Plan

### Phase 1: Foundation (Week 1-2)

**Goals:**
- Set up notification infrastructure
- Implement notification preferences UI
- Create notification store

**Tasks:**
1. Create database tables for preferences, subscriptions, and logs
2. Implement `notificationStore.js`
3. Add notification preferences to Settings page
4. Create notification permission request flow
5. Set up Firebase project and configure FCM

**Deliverables:**
- Users can enable/disable notification categories
- Push permission request UI
- Basic notification preferences saved to Supabase

### Phase 2: In-App Notifications (Week 3-4)

**Goals:**
- Enhance existing toast system
- Add notification center/inbox
- Implement real-time in-app notifications

**Tasks:**
1. Create NotificationCenter component (bell icon + dropdown)
2. Add notification badge with unread count
3. Implement Supabase Realtime subscription for notifications
4. Connect achievement/XP/level events to in-app notifications
5. Add notification history view

**Deliverables:**
- Notification bell in header with unread count
- Dropdown showing recent notifications
- Real-time notifications while app is open

### Phase 3: Push Notifications (Week 5-6)

**Goals:**
- Implement web push notifications
- Set up service worker
- Create Edge Functions for sending notifications

**Tasks:**
1. Create service worker (`firebase-messaging-sw.js`)
2. Implement push subscription flow
3. Create `send-push-notification` Edge Function
4. Set up database webhooks for key events
5. Implement notification action handlers

**Deliverables:**
- Users receive push notifications when app is closed
- Notifications are clickable and open relevant pages
- Notification actions work (Complete, Snooze, etc.)

### Phase 4: Scheduled Notifications (Week 7-8)

**Goals:**
- Implement time-based reminders
- Create scheduling system
- Add recurring notification support

**Tasks:**
1. Create scheduled_notifications table
2. Implement cron Edge Function to process scheduled notifications
3. Add reminder configuration UI for each feature
4. Implement supplement reminder system
5. Add daily planning notification
6. Create streak risk alerts (2 hours before break)

**Deliverables:**
- Users can set custom reminder times
- Supplement reminders at optimal times
- Streak protection alerts

### Phase 5: Smart Notifications (Week 9-10)

**Goals:**
- Implement intelligent notification batching
- Add notification deduplication
- Create notification analytics

**Tasks:**
1. Implement notification batching (group similar notifications)
2. Add rate limiting (max notifications per hour/day)
3. Create notification analytics dashboard
4. Implement "smart timing" based on user activity patterns
5. Add A/B testing framework for notification content

**Deliverables:**
- Notifications are intelligently grouped
- Users aren't overwhelmed with too many notifications
- Analytics on notification engagement

---

## User Preferences & Settings

### Settings UI Structure

```
Notifications
├── Push Notifications
│   ├── Enable Push Notifications [Toggle]
│   └── Test Notification [Button]
│
├── Quiet Hours
│   ├── Enable Quiet Hours [Toggle]
│   ├── Start Time [Time Picker] (default: 10:00 PM)
│   └── End Time [Time Picker] (default: 7:00 AM)
│
├── Categories
│   ├── Gamification [Toggle]
│   │   └── Level ups, achievements, streaks
│   ├── Productivity [Toggle]
│   │   └── Task reminders, deadlines
│   ├── Health & Fitness [Toggle]
│   │   └── Supplements, workouts, nutrition
│   ├── Financial [Toggle]
│   │   └── Budget alerts, savings milestones
│   ├── Calendar [Toggle]
│   │   └── Event reminders, time blocks
│   ├── Journal [Toggle]
│   │   └── Journaling reminders, streaks
│   ├── Social [Toggle]
│   │   └── Friend requests, challenges
│   └── Learning [Toggle]
│       └── Practice reminders, streaks
│
├── Scheduled Reminders
│   ├── Daily Planning [Time Picker]
│   ├── Journaling Reminder [Time Picker]
│   ├── Supplement Reminders [List]
│   └── Custom Reminders [Add/Edit]
│
└── Advanced
    ├── Notification Sound [Dropdown]
    ├── Vibration [Toggle]
    ├── Show Preview [Toggle]
    └── Badge Count [Toggle]
```

### Per-Notification Granularity

Allow users to customize individual notification types:

```javascript
const notificationOverrides = {
  'G006': { enabled: true, sound: 'celebration' },  // Streak milestones
  'G007': { enabled: true, priority: 'critical' },  // Streak at risk
  'P001': { enabled: true, timing: [60, 30, 15] },  // Task due (multiple reminders)
  'H001': { enabled: false },                        // Supplement reminders off
};
```

---

## Best Practices

### Content Guidelines

1. **Be Specific**: "Complete 'Review quarterly report' (due in 1 hour)" not "Task due soon"

2. **Be Actionable**: Include clear next step or action button

3. **Be Timely**: Send when user can act on it

4. **Be Personal**: Use user's name and reference their data

5. **Be Celebratory (Cosmic Mode)**: "Level Up! You've ascended to Level 15!"

6. **Be Professional (Minimal Mode)**: "Progress Update: Level 15 reached"

### Timing Guidelines

| Notification Type | Best Time | Avoid |
|-------------------|-----------|-------|
| Daily Planning | 7-9 AM | Late night |
| Task Reminders | 1hr, 30min, 15min before | Middle of night |
| Streak Risk | 2-4 hours before deadline | During quiet hours |
| Achievements | Immediate | - |
| Weekly Summary | Sunday evening | Monday morning |
| Supplement AM | 7-9 AM | Before wake time |
| Supplement PM | 8-10 PM | After bedtime |

### Frequency Limits

| Category | Max per Day | Max per Hour |
|----------|-------------|--------------|
| Gamification | 10 | 3 |
| Productivity | 15 | 5 |
| Health | 8 | 2 |
| Financial | 5 | 2 |
| Social | 10 | 3 |
| Total | 30 | 10 |

### Rich Notification Examples

**Achievement Unlocked (Cosmic Mode)**
```json
{
  "title": "Achievement Unlocked!",
  "body": "Early Bird - Complete 7 tasks before 9 AM",
  "icon": "/icons/achievement-gold.png",
  "badge": "/icons/badge.png",
  "image": "/images/achievements/early-bird.png",
  "actions": [
    { "action": "view", "title": "View Achievement" },
    { "action": "share", "title": "Share" }
  ],
  "data": {
    "type": "achievement",
    "xp": 100,
    "credits": 50,
    "url": "/quests?tab=achievements"
  }
}
```

**Task Due (Minimal Mode)**
```json
{
  "title": "Task Due in 1 Hour",
  "body": "Review quarterly report",
  "icon": "/icons/task.png",
  "actions": [
    { "action": "complete", "title": "Complete" },
    { "action": "snooze", "title": "Snooze" }
  ],
  "data": {
    "type": "task_due",
    "taskId": "abc123",
    "url": "/productivity"
  }
}
```

---

## Research Sources

### Notification Best Practices
- [MobileAction - In-App Notifications 2025](https://www.mobileaction.co/blog/in-app-notifications-in-2025/)
- [Braze - Push Notification Best Practices](https://www.braze.com/resources/articles/push-notifications-best-practices)
- [MoEngage - 19 Push Notification Best Practices](https://www.moengage.com/learn/push-notification-best-practices/)
- [CleverTap - 35 Push Notification Best Practices](https://clevertap.com/blog/push-notification-best-practices/)
- [Adjust - Push Notification Guide](https://www.adjust.com/blog/how-to-develop-a-successfull-push-notification-strategy/)

### Gamification & Habit Apps
- [nGrow - Gamification of Push Notifications](https://www.ngrow.ai/blog/gamification-of-push-notifications-turning-engagement-into-fun-experiences)
- [Medium - Gamify Push Notifications](https://medium.com/@kylecarline/how-to-gamify-push-notifications-to-increase-app-user-retention-eeceeacf38c9)
- [Business of Apps - Habit Tracking App Design](https://www.businessofapps.com/insights/how-to-design-a-habit-tracking-app-right/)
- [Cohorty - Best Habit Tracker Apps with Reminders](https://www.cohorty.app/blog/best-habit-tracker-apps-with-reminders-smart-notifications-2025)

### Technical Implementation
- [Firebase - Cloud Messaging Setup](https://firebase.google.com/docs/cloud-messaging/js/client)
- [DEV - Web Push with React and FCM](https://dev.to/emmanuelayinde/web-push-notifications-with-react-and-firebase-cloud-messaging-fcm-18kb)
- [LogRocket - Push Notifications React Firebase](https://blog.logrocket.com/push-notifications-react-firebase/)
- [Supabase - Push Notifications Guide](https://supabase.com/docs/guides/functions/examples/push-notifications)
- [MakerKit - Real-time Notifications with Supabase](https://makerkit.dev/blog/tutorials/real-time-notifications-supabase-nextjs)
- [MDN - Web Push API](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Tutorials/js13kGames/Re-engageable_Notifications_Push)

### User Experience
- [Daywise - Notification Scheduling](https://getdaywise.com/)
- [Streaks App](https://streaksapp.com/)
- [MyLifeOrganized](https://www.mylifeorganized.net/)

---

## Appendix: Notification ID Reference

All notification IDs follow the pattern: `{CATEGORY_PREFIX}{NUMBER}`

| Prefix | Category |
|--------|----------|
| G | Gamification |
| P | Productivity |
| H | Health |
| F | Financial |
| C | Calendar |
| J | Journal |
| L | Learning |
| S | Social |
| R | Resolutions |

Example: `G006` = Gamification notification #6 (Streak Milestone)

---

*Document Version: 1.0*
*Last Updated: December 2024*
*Author: LifeOS Development Team*
