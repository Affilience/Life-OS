# Supabase Database Security Guide

This document outlines best practices and specific fixes for securing your Supabase database. Follow this guide to ensure your LifeOS database is properly hardened against security vulnerabilities.

## Table of Contents

1. [Row Level Security (RLS)](#row-level-security-rls)
2. [RLS Policy Best Practices](#rls-policy-best-practices)
3. [Security Definer Functions](#security-definer-functions)
4. [Function Search Path Security](#function-search-path-security)
5. [Views Security](#views-security)
6. [API Keys Security](#api-keys-security)
7. [Performance Optimizations for RLS](#performance-optimizations-for-rls)
8. [Database Extensions Security](#database-extensions-security)
9. [Indexing for Security](#indexing-for-security)
10. [Common Security Issues Checklist](#common-security-issues-checklist)

---

## Row Level Security (RLS)

### What is RLS?

Row Level Security (RLS) is a Postgres feature that restricts which rows users can access or modify in a table. It acts as an implicit WHERE clause on every query.

### Why RLS is Critical

- **Without RLS**: Any client with your `anon` or `authenticated` key can access ALL data in exposed tables
- **With RLS**: Data access is controlled by policies you define

### Enabling RLS

**IMPORTANT**: RLS must ALWAYS be enabled on any tables in the `public` schema.

```sql
-- Enable RLS on a table
ALTER TABLE public.your_table ENABLE ROW LEVEL SECURITY;

-- Verify RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = false;
```

### Tables That Need RLS

Every table in the `public` schema that stores user data should have RLS enabled:

```sql
-- Example: Enable RLS on all public tables (run this query to find tables without RLS)
SELECT
  'ALTER TABLE public.' || tablename || ' ENABLE ROW LEVEL SECURITY;' as sql_command
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = false;
```

---

## RLS Policy Best Practices

### Basic Policy Patterns

#### 1. Users can only access their own data

```sql
-- SELECT policy
CREATE POLICY "Users can view their own data"
ON public.your_table
FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- INSERT policy
CREATE POLICY "Users can insert their own data"
ON public.your_table
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

-- UPDATE policy
CREATE POLICY "Users can update their own data"
ON public.your_table
FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

-- DELETE policy
CREATE POLICY "Users can delete their own data"
ON public.your_table
FOR DELETE
TO authenticated
USING ((SELECT auth.uid()) = user_id);
```

#### 2. Public read, authenticated write

```sql
-- Anyone can read
CREATE POLICY "Public read access"
ON public.your_table
FOR SELECT
TO anon, authenticated
USING (true);

-- Only authenticated users can write their own
CREATE POLICY "Authenticated users can insert own data"
ON public.your_table
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);
```

#### 3. Role-based access

```sql
-- Using app_metadata for roles
CREATE POLICY "Admins have full access"
ON public.your_table
FOR ALL
TO authenticated
USING (
  (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);
```

### Performance-Optimized Policies

**CRITICAL**: Always wrap `auth.uid()` and `auth.jwt()` in a `SELECT` statement for performance:

```sql
-- SLOW: Called for every row
CREATE POLICY "slow_policy"
ON public.your_table
FOR SELECT
USING (auth.uid() = user_id);

-- FAST: Result is cached per-statement
CREATE POLICY "fast_policy"
ON public.your_table
FOR SELECT
USING ((SELECT auth.uid()) = user_id);
```

This optimization can improve query performance by **99%+** on large tables.

### Specify Target Roles

Always specify which roles the policy applies to:

```sql
-- Good: Explicit role targeting
CREATE POLICY "policy_name"
ON public.your_table
FOR SELECT
TO authenticated  -- or: TO anon, authenticated
USING (...);

-- Avoid: No role specified (applies to all, including service_role)
CREATE POLICY "policy_name"
ON public.your_table
FOR SELECT
USING (...);
```

---

## Security Definer Functions

### What is SECURITY DEFINER?

A `SECURITY DEFINER` function runs with the privileges of the user who created it (usually `postgres`), not the user calling it. This can bypass RLS.

### When to Use SECURITY DEFINER

Use it when you need a function to access data that the calling user shouldn't directly access:

```sql
-- Good use case: Checking roles without exposing the roles table
CREATE OR REPLACE FUNCTION private.has_role(role_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''  -- CRITICAL: Always set search_path
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM private.user_roles
    WHERE user_id = (SELECT auth.uid())
    AND role = role_name
  );
END;
$$;
```

### Security Definer Rules

1. **ALWAYS set `search_path = ''`** - This prevents search_path injection attacks
2. **Use fully qualified table names** - e.g., `public.users` instead of just `users`
3. **Never create in exposed schemas** - Put security definer functions in `private` schema
4. **Minimize privileges** - Only grant execute to roles that need it

```sql
-- Create a private schema for security definer functions
CREATE SCHEMA IF NOT EXISTS private;

-- Revoke default access
REVOKE ALL ON SCHEMA private FROM public;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA private FROM public;

-- Grant to specific roles as needed
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.has_role TO authenticated;
```

---

## Function Search Path Security

### The Vulnerability

Functions without a fixed `search_path` can be exploited if an attacker creates objects with the same name in a schema that appears earlier in the search path.

### The Fix

Always set `search_path = ''` on functions:

```sql
-- VULNERABLE: Mutable search_path
CREATE FUNCTION public.my_function()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  SELECT * FROM users;  -- Which "users" table?
END;
$$;

-- SECURE: Fixed empty search_path with qualified names
CREATE FUNCTION public.my_function()
RETURNS void
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  SELECT * FROM public.users;  -- Explicit schema
END;
$$;
```

### Fixing Existing Functions

```sql
-- Find all functions with mutable search_path
SELECT
  n.nspname as schema,
  p.proname as function_name,
  'ALTER FUNCTION ' || n.nspname || '.' || p.proname || '(' ||
  pg_get_function_identity_arguments(p.oid) || ') SET search_path = '''';' as fix_sql
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND NOT EXISTS (
  SELECT 1 FROM pg_proc_info pi
  WHERE pi.oid = p.oid
  AND pi.proconfig @> ARRAY['search_path=']
);
```

---

## Views Security

### The Problem

Views bypass RLS by default because they run as the creator (usually `postgres`) with `SECURITY DEFINER`.

### Postgres 15+ Solution

Use `security_invoker = true` to make views respect RLS:

```sql
CREATE OR REPLACE VIEW public.my_view
WITH (security_invoker = true)
AS
SELECT * FROM public.users;
```

### Pre-Postgres 15 Solution

1. Revoke direct access from the view
2. Or move views to an unexposed schema

```sql
-- Option 1: Revoke access
REVOKE ALL ON public.my_view FROM anon, authenticated;

-- Option 2: Move to private schema
ALTER VIEW public.my_view SET SCHEMA private;
```

### Fixing Exposed Views

Views that reference `auth.users` directly are a security risk:

```sql
-- BAD: Exposes auth.users
CREATE VIEW public.user_profiles AS
SELECT id, email FROM auth.users;

-- GOOD: Only expose necessary data through a secure function
CREATE OR REPLACE FUNCTION public.get_user_profile(user_uuid uuid)
RETURNS TABLE(id uuid, display_name text)
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT id, raw_user_meta_data->>'display_name'
  FROM auth.users
  WHERE id = user_uuid AND id = (SELECT auth.uid());
$$;
```

---

## API Keys Security

### Key Types

| Key Type | Use Case | Exposure |
|----------|----------|----------|
| `anon` / Publishable | Client-side (browser, mobile) | Safe to expose |
| `service_role` / Secret | Server-side only | NEVER expose |

### Best Practices

1. **Never expose `service_role` key** in client-side code
2. **Use environment variables** for all keys
3. **Rotate keys** if compromised
4. **Use RLS** - The `anon` key is only safe because RLS protects your data

```javascript
// GOOD: Using anon key in browser
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY  // Safe for client
);

// GOOD: Using service_role key in server only
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // Server-only!
);
```

---

## Performance Optimizations for RLS

### 1. Add Indexes on Policy Columns

```sql
-- If your policy checks user_id, index it
CREATE INDEX idx_your_table_user_id
ON public.your_table(user_id);

-- For composite policies
CREATE INDEX idx_your_table_user_status
ON public.your_table(user_id, status);
```

### 2. Use Subselects for Functions

```sql
-- Performance: 99%+ improvement
CREATE POLICY "fast_policy"
ON public.your_table
FOR SELECT
USING ((SELECT auth.uid()) = user_id);
```

### 3. Avoid Joins in Policies

```sql
-- SLOW: Join in policy
CREATE POLICY "slow_join_policy"
ON public.posts
FOR SELECT
USING (
  (SELECT auth.uid()) IN (
    SELECT user_id FROM public.team_members
    WHERE team_members.team_id = posts.team_id
  )
);

-- FAST: Pre-fetch teams into an array
CREATE POLICY "fast_array_policy"
ON public.posts
FOR SELECT
USING (
  team_id IN (
    SELECT team_id FROM public.team_members
    WHERE user_id = (SELECT auth.uid())
  )
);
```

### 4. Use Security Definer for Complex Checks

```sql
-- Create a fast helper function
CREATE OR REPLACE FUNCTION private.user_teams()
RETURNS uuid[]
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE  -- Mark as stable for caching
AS $$
  SELECT array_agg(team_id)
  FROM public.team_members
  WHERE user_id = (SELECT auth.uid());
$$;

-- Use in policy
CREATE POLICY "team_access"
ON public.posts
FOR SELECT
USING (team_id = ANY((SELECT private.user_teams())));
```

---

## Database Extensions Security

### Extension Placement

Extensions should NOT be in the `public` schema if possible:

```sql
-- Good: Extension in extensions schema
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Avoid: Extension in public schema (can be accessed via API)
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;
```

### Moving Extensions

```sql
-- Move extension to extensions schema
ALTER EXTENSION vector SET SCHEMA extensions;
```

---

## Indexing for Security

### Index Foreign Keys

Unindexed foreign keys can cause performance issues with RLS:

```sql
-- Find unindexed foreign keys
SELECT
  tc.table_name,
  kcu.column_name,
  'CREATE INDEX idx_' || tc.table_name || '_' || kcu.column_name ||
  ' ON public.' || tc.table_name || '(' || kcu.column_name || ');' as create_index_sql
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
AND NOT EXISTS (
  SELECT 1 FROM pg_indexes
  WHERE tablename = tc.table_name
  AND indexdef LIKE '%' || kcu.column_name || '%'
);
```

---

## Common Security Issues Checklist

### Critical (Must Fix)

- [ ] **RLS enabled on all public tables**
- [ ] **No tables with RLS disabled but policies exist**
- [ ] **No views exposing `auth.users` directly**
- [ ] **No SECURITY DEFINER views in public schema**
- [ ] **All functions have `SET search_path = ''`**

### Important (Should Fix)

- [ ] **RLS policies use `(SELECT auth.uid())` not `auth.uid()`**
- [ ] **RLS policies specify target roles (`TO authenticated`)**
- [ ] **Foreign keys are indexed**
- [ ] **Extensions not in public schema**
- [ ] **Sensitive functions in `private` schema**

### Recommended

- [ ] **Use MFA for Supabase dashboard access**
- [ ] **Enable SSL enforcement**
- [ ] **Set up network restrictions**
- [ ] **Regular security audits using Security Advisor**

---

## Migration Template for Security Fixes

Here's a template migration to fix common security issues:

```sql
-- Migration: Security Hardening
-- Run this migration to fix common security issues

-- 1. Enable RLS on tables missing it
ALTER TABLE public.your_table_1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.your_table_2 ENABLE ROW LEVEL SECURITY;

-- 2. Create private schema for security functions
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM public;

-- 3. Fix function search paths
ALTER FUNCTION public.your_function_1() SET search_path = '';
ALTER FUNCTION public.your_function_2(uuid) SET search_path = '';

-- 4. Add indexes for foreign keys used in policies
CREATE INDEX IF NOT EXISTS idx_table_user_id ON public.your_table(user_id);

-- 5. Create secure RLS policies
CREATE POLICY "users_own_data_select"
ON public.your_table
FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "users_own_data_insert"
ON public.your_table
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "users_own_data_update"
ON public.your_table
FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "users_own_data_delete"
ON public.your_table
FOR DELETE
TO authenticated
USING ((SELECT auth.uid()) = user_id);
```

---

## Monitoring and Auditing

### Regular Security Checks

1. **Use Supabase Security Advisor**: Dashboard > Database > Security Advisor
2. **Review RLS policies regularly**: Especially after schema changes
3. **Monitor auth logs**: Dashboard > Logs > Auth
4. **Check for unusual access patterns**: Dashboard > Logs > Postgres

### Useful Queries

```sql
-- List all tables with RLS status
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY rowsecurity, tablename;

-- List all policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check for functions without search_path set
SELECT
  n.nspname as schema,
  p.proname as name,
  p.prosecdef as security_definer
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proconfig IS NULL OR NOT (p.proconfig::text[] @> ARRAY['search_path=']);
```

---

## Resources

- [Supabase RLS Guide](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Production Checklist](https://supabase.com/docs/guides/deployment/going-into-prod)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase Security Advisor](https://supabase.com/dashboard/project/_/database/security-advisor)

---

*Last updated: December 2024*
