# LifeOS Comprehensive Audit Findings

**Date:** December 15, 2025
**Auditor:** Claude (Automated Analysis)
**Scope:** Full frontend and backend audit

---

## Executive Summary

This document contains findings from a comprehensive audit of the LifeOS application. The audit covered:
- Build and compilation
- Code quality (ESLint)
- Import/dependency integrity
- React component analysis
- Zustand state management
- Database security (RLS, policies)
- Edge function review
- Asset verification
- Security/secrets audit

**Critical Issues Found:** 5
**High Priority Issues:** 12
**Medium Priority Issues:** 20+
**Low Priority Issues:** Various

---

## 1. CRITICAL SECURITY ISSUES

### 1.1 Hardcoded API Secret (CRITICAL)

**File:** `src/services/fatSecretApi.js`
**Line:** Contains hardcoded CLIENT_SECRET

```javascript
const CLIENT_SECRET = '63c464beaf948089890e4808fe71297';
```

**Impact:** API credentials exposed in source code. If this repository is ever made public or accessed by unauthorized parties, the FatSecret API credentials are compromised.

**Remediation:**
1. Immediately rotate this API key in FatSecret dashboard
2. Move to environment variable: `const CLIENT_SECRET = import.meta.env.VITE_FATSECRET_CLIENT_SECRET;`
3. Add to `.env` file and ensure `.env` is in `.gitignore`

---

### 1.2 Row Level Security (RLS) Disabled on Public Tables (CRITICAL)

**15 tables have RLS disabled but are exposed to PostgREST:**

| Table | Risk Level |
|-------|------------|
| `missions` | HIGH - Contains user mission data |
| `discoveries` | HIGH - Contains user discoveries |
| `calendar_templates` | MEDIUM |
| `knowledge_books` | HIGH - User knowledge data |
| `knowledge_tags` | MEDIUM |
| `knowledge_projects` | HIGH |
| `user_skill_points` | HIGH - Gamification data |
| `user_module_mastery` | HIGH |
| `perk_stat_bonuses` | MEDIUM |
| `pvp_battles` | HIGH - PvP game data |
| `pvp_battle_days` | HIGH |
| `pvp_invites` | HIGH |
| `pvp_user_stats` | HIGH |
| `pvp_loadouts` | HIGH |
| `moderation_actions` | CRITICAL - Admin actions |

**Impact:** Any authenticated user can read/write any other user's data in these tables.

**Remediation:** Enable RLS on all tables:
```sql
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
-- Repeat for all tables
```

---

### 1.3 RLS Policies Created But RLS Not Enabled (CRITICAL)

**4 tables have policies but RLS is not active:**

| Table | Policies |
|-------|----------|
| `discoveries` | "Anyone can view non-secret discoveries" |
| `missions` | "Anyone can view active missions" |
| `perk_stat_bonuses` | "Anyone can view perk stat bonuses" |
| `user_module_mastery` | "Users can insert/update/view own mastery" |
| `user_skill_points` | "Users can insert/update/view own skill points" |

**Impact:** Policies are defined but completely bypassed since RLS is not enabled.

**Remediation:**
```sql
ALTER TABLE public.discoveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
-- etc.
```

---

### 1.4 Exposed auth.users Data (CRITICAL)

**View:** `public.user_gamification_summary`

**Issue:** This view may expose `auth.users` data to anon or authenticated roles.

**Impact:** User authentication data could be leaked.

**Remediation:** Review view definition and ensure it doesn't expose sensitive auth data, or add proper filtering.

---

### 1.5 SECURITY DEFINER Views (HIGH)

**Views:**
- `public.user_gamification_summary`
- `public.nova_daily_summary`

**Issue:** These views run with the permissions of their creator (definer) rather than the querying user.

**Impact:** Could bypass intended security controls.

**Remediation:** Convert to SECURITY INVOKER or add explicit security checks.

---

## 2. BROKEN IMPORTS (HIGH PRIORITY)

### 2.1 BazaarMarketplace.jsx - Line 27

**Current (BROKEN):**
```javascript
import { EQUIPMENT_DATABASE } from '../../data/avatarData';
```

**Should be:**
```javascript
import { EQUIPMENT_DATABASE } from '../../data/equipmentDatabase';
```

**Impact:** Using incomplete equipment database (5 items vs 15+ items). Bazaar may show fewer items than intended.

---

### 2.2 AvatarCustomization.jsx - Line 5

**Current (BROKEN):**
```javascript
import { EQUIPMENT_DATABASE, EQUIPMENT_SLOTS, getEquipmentBySlot, EQUIPMENT_RARITY } from '../../data/avatarData';
```

**Should be:**
```javascript
import { EQUIPMENT_DATABASE, EQUIPMENT_SLOTS, getEquipmentBySlot, EQUIPMENT_RARITY } from '../../data/equipmentDatabase';
```

**Impact:** Avatar customization using incomplete equipment database.

---

### 2.3 Root Cause: Data Duplication

Two files contain similar exports with different data:

| File | Items | Status |
|------|-------|--------|
| `avatarData.js` | ~5 items | Outdated |
| `equipmentDatabase.js` | ~15+ items | Authoritative |

**Recommendation:** Consolidate all equipment data into `equipmentDatabase.js` and update all imports.

---

## 3. REACT COMPONENT ISSUES

### 3.1 Missing Key Props in Dynamic Lists

**File:** `src/components/health/MealCard.jsx` (Lines 139-169)
```jsx
{meal.items.map((item, index) => (
  <div key={index}  // BAD: Using index as key
```

**File:** `src/components/missions/CrossModuleQuests.jsx` (Lines 143-188)
```jsx
{template.requirements.map((req, index) => (
  <div key={index}  // BAD: Using index as key
```

**Impact:** React may lose track of component state when items are reordered or removed.

**Fix:** Use unique identifiers: `key={item.id}` or `key={req.id}`

---

### 3.2 useEffect Missing Dependencies

**File:** `src/pages/Character.jsx` (Line 251)
```jsx
useEffect(() => {
  fetchSocialProfile();
}, []);  // MISSING: fetchSocialProfile
```

**Impact:** Stale closure - may use outdated function reference.

**Fix:** Add to dependency array or wrap function in useCallback.

---

### 3.3 State Updates on Unmounted Components

**File:** `src/pages/Character.jsx` (Lines 276-281)
```jsx
const timeoutId = setTimeout(async () => {
  const result = await checkUsernameAvailable(usernameInput);
  setUsernameStatus({ ... }); // May fire after unmount
}, 500);
```

**File:** `src/components/avatar/AvatarRenderer.jsx`
- Async `loadAllImages()` has no abort mechanism
- Could attempt state updates after unmount

**Impact:** Memory leaks and React console warnings.

**Fix:** Track mounted state or use AbortController.

---

### 3.4 No PropTypes or TypeScript

**Scope:** Entire codebase

**Impact:** No compile-time type checking. Props can be passed incorrectly without detection.

**Recommendation:** Consider adding PropTypes for critical components or migrating to TypeScript.

---

## 4. DATABASE FUNCTION SECURITY WARNINGS

### 4.1 Mutable Search Path (25+ Functions)

The following functions have `search_path` that can be modified:

- `update_user_stats_updated_at`
- `update_collection_item_count`
- `calculate_balance_score`
- `update_balance_score`
- `update_bad_habits_updated_at`
- `is_username_available`
- `update_conversation_on_message`
- `award_xp_on_timeline_event`
- `complete_mission`
- `log_workout_with_timeline`
- `calculate_xp_multiplier`
- `update_user_equipment_stats`
- `trigger_update_equipment_stats`
- `process_gamification_event`
- `grant_all_equipment_to_user`
- `search_nova_memories`
- `search_users_by_username`
- `cleanup_nova_conversations`
- `are_friends`
- `is_blocked`
- `update_guild_member_count`
- `update_activity_like_count`
- `update_activity_comment_count`
- `match_nova_memories`
- `get_nova_conversation_context`
- `touch_nova_memory`
- `decay_nova_memories`
- `get_nova_profile_memories`
- `cleanup_nova_context_cache`
- `get_nova_user_context_cached`
- `get_nova_user_context`
- `update_updated_at_column`
- `award_module_xp`
- `award_cosmic_credits`

**Impact:** Potential search path injection attacks.

**Remediation:** Set explicit search_path in function definitions:
```sql
CREATE OR REPLACE FUNCTION my_function()
RETURNS void
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$ ... $$;
```

---

### 4.2 Extension in Public Schema

**Extension:** `vector`

**Issue:** The pgvector extension is installed in the public schema.

**Recommendation:** Move to a dedicated schema like `extensions`.

---

## 5. BUILD AND LINT ISSUES

### 5.1 Large Bundle Chunks

Build produces several large chunks that may impact load time:

| Chunk | Size | Issue |
|-------|------|-------|
| `index.js` | 1,003.51 kB | Over 500kB limit |
| `vendor chunk` | Various | May benefit from splitting |

**Recommendation:** Implement code splitting and lazy loading for routes.

---

### 5.2 ESLint Errors (Unused Variables)

**File:** `src/App.jsx`
- Unused imports/variables detected

**File:** `src/services/systemKnowledgeService.js`
- Unused exports

**File:** `src/api/avatars.js`
- Unused functions

**File:** `src/api/health.js`
- Unused functions

---

### 5.3 Next.js Warnings (Website)

- `metadataBase` not set for social images
- `themeColor` should be in `viewport` export, not `metadata`

---

## 6. EDGE FUNCTIONS AUDIT

### 6.1 Deployed Functions (11 total)

| Function | Status | JWT Verify |
|----------|--------|------------|
| `parse-nutrition` | ACTIVE | Yes |
| `nova-chat` | ACTIVE | Yes |
| `nova-embeddings` | ACTIVE | Yes |
| `social-api` | ACTIVE | Yes |
| `send-invite` | ACTIVE | **No** |
| `nova-chat-v2` | ACTIVE | Yes |
| `nova-extract-memories` | ACTIVE | Yes |
| `create-pvp-battle` | ACTIVE | Yes |
| `accept-pvp-invite` | ACTIVE | Yes |
| `update-battle-progress` | ACTIVE | Yes |
| `finalize-battles` | ACTIVE | Yes |

**Note:** `send-invite` does not verify JWT. Review if this is intentional.

---

### 6.2 Edge Function Code Quality

**nova-chat-v2:** Well-implemented with:
- Query complexity analysis
- Model fallback (Sonnet → Haiku)
- Prompt caching
- Context building
- Streaming support

**parse-nutrition:** Well-implemented with:
- USDA API integration
- Multi-source fallback (USDA → Web → AI estimate)
- Gram conversion logic

---

## 7. ZUSTAND STORES INVENTORY

**32 stores identified:**

| Store | Purpose |
|-------|---------|
| `contentStore.js` | Content management |
| `settingsStore.js` | User settings |
| `onboardingStore.js` | Onboarding flow |
| `integratedOnboardingStore.js` | Alt onboarding |
| `themeStore.js` | Theme/appearance |
| `gamificationModeStore.js` | Game mode toggle |
| `quotesStore.js` | Daily quotes |
| `badHabitsStore.js` | Bad habit tracking |
| `resolutionStore.js` | New year resolutions |
| `healthStore.js` | Health data |
| `dailyTasksStore.js` | Daily tasks |
| `questsStore.js` | Quest system |
| `dashboardStore.js` | Dashboard widgets |
| `newOnboardingStore.js` | New onboarding |
| `tourStore.js` | App tour |
| `calendarStore.js` | Calendar events |
| `socialStore.js` | Social features |
| `customStreaksStore.js` | Custom streaks |
| `purposeStore.js` | Purpose/values |
| `skillsStore.js` | Skills tracking |
| `productivityStore.js` | Productivity |
| `workoutStore.js` | Workouts |
| `petStore.js` | Virtual pets |
| `achievementsStore.js` | Achievements |
| `perkStore.js` | Perks system |
| `gamificationStore.js` | Core gamification |
| `moduleMasteryStore.js` | Module mastery |
| `skillPointsStore.js` | Skill points |
| `pvpStore.js` | PvP battles |
| `avatarStore.js` | Avatar system |
| `financialStore.js` | Financial tracking |
| `knowledgeStore.js` | Knowledge management |

**Recommendation:** Consider consolidating related stores to reduce complexity.

---

## 8. ASSET VERIFICATION

### 8.1 Asset Count

- **Total assets:** 654 files
- **Equipment assets:** 100+ items
- **Pet sprites:** 17 verified
- **Avatar evolutions:** 25+ hero stages, 25+ heroine stages
- **Nav icons:** All 6 verified
- **Nova sprites:** All 4 verified

### 8.2 Missing Asset Paths (Potential)

- Some bazaar items reference paths that may not exist
- Dynamic equipment sprite paths should be verified

---

## 9. RECOMMENDATIONS SUMMARY

### Immediate Actions (Do Today)

1. **Rotate FatSecret API key** and move to environment variable
2. **Enable RLS** on all 15 exposed tables
3. **Fix EQUIPMENT_DATABASE imports** in BazaarMarketplace and AvatarCustomization

### Short-term (This Week)

4. Add unique keys to mapped lists (MealCard, CrossModuleQuests)
5. Fix useEffect dependencies in Character.jsx
6. Add AbortController to async operations in AvatarRenderer
7. Review `send-invite` edge function JWT bypass
8. Review `user_gamification_summary` view for auth.users exposure

### Medium-term (This Month)

9. Set explicit search_path on all database functions
10. Convert SECURITY DEFINER views to INVOKER
11. Add PropTypes to critical components
12. Implement code splitting for large bundles
13. Consolidate equipment data files
14. Move vector extension out of public schema

### Long-term

15. Consider TypeScript migration
16. Consolidate Zustand stores
17. Add comprehensive error boundaries
18. Implement automated security scanning

---

## 10. APPENDIX

### A. Files Audited

- 510+ source files in `/src`
- 32 Zustand stores
- 11 Edge Functions
- 50+ database tables
- 654 asset files

### B. Tools Used

- ESLint (code quality)
- Vite build (compilation)
- Supabase MCP (database audit)
- grep/glob (code search)
- Manual code review

### C. Audit Limitations

- Runtime behavior not tested (no E2E tests run)
- Performance metrics not measured
- Mobile responsiveness not checked
- Accessibility not audited

---

**End of Report**
