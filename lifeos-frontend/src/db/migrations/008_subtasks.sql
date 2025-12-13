-- Migration: Add subtask support to daily_tasks and productivity_tasks
-- This allows users to create hierarchical task structures

-- ============================================
-- DAILY TASKS - Add subtask columns
-- ============================================

-- Add parent_task_id to daily_tasks for subtask hierarchy
ALTER TABLE daily_tasks
ADD COLUMN IF NOT EXISTS parent_task_id UUID REFERENCES daily_tasks(id) ON DELETE CASCADE;

-- Add subtask_order for ordering subtasks within a parent
ALTER TABLE daily_tasks
ADD COLUMN IF NOT EXISTS subtask_order INTEGER DEFAULT 0;

-- Create index for efficient subtask queries
CREATE INDEX IF NOT EXISTS idx_daily_tasks_parent
ON daily_tasks(parent_task_id)
WHERE parent_task_id IS NOT NULL;

-- ============================================
-- PRODUCTIVITY TASKS - Add subtask columns
-- ============================================

-- Add parent_task_id to productivity_tasks for subtask hierarchy
ALTER TABLE productivity_tasks
ADD COLUMN IF NOT EXISTS parent_task_id UUID REFERENCES productivity_tasks(id) ON DELETE CASCADE;

-- Add subtask_order for ordering subtasks within a parent
ALTER TABLE productivity_tasks
ADD COLUMN IF NOT EXISTS subtask_order INTEGER DEFAULT 0;

-- Create index for efficient subtask queries
CREATE INDEX IF NOT EXISTS idx_productivity_tasks_parent
ON productivity_tasks(parent_task_id)
WHERE parent_task_id IS NOT NULL;

-- ============================================
-- UPDATE RLS POLICIES (if not already exists)
-- ============================================

-- Ensure subtasks inherit parent's user_id constraint via the parent relationship
-- The ON DELETE CASCADE already handles orphaned subtasks

-- ============================================
-- HELPER VIEW: Tasks with subtask counts
-- ============================================

-- Drop view if exists (for re-running migration)
DROP VIEW IF EXISTS daily_tasks_with_subtask_counts;

-- Create view for daily tasks with subtask progress
CREATE VIEW daily_tasks_with_subtask_counts AS
SELECT
  dt.*,
  COALESCE(sub.total_subtasks, 0) as subtask_count,
  COALESCE(sub.completed_subtasks, 0) as completed_subtask_count
FROM daily_tasks dt
LEFT JOIN (
  SELECT
    parent_task_id,
    COUNT(*) as total_subtasks,
    COUNT(*) FILTER (WHERE completed = true) as completed_subtasks
  FROM daily_tasks
  WHERE parent_task_id IS NOT NULL
  GROUP BY parent_task_id
) sub ON dt.id = sub.parent_task_id
WHERE dt.parent_task_id IS NULL;

-- Drop view if exists (for re-running migration)
DROP VIEW IF EXISTS productivity_tasks_with_subtask_counts;

-- Create view for productivity tasks with subtask progress
CREATE VIEW productivity_tasks_with_subtask_counts AS
SELECT
  pt.*,
  COALESCE(sub.total_subtasks, 0) as subtask_count,
  COALESCE(sub.completed_subtasks, 0) as completed_subtask_count
FROM productivity_tasks pt
LEFT JOIN (
  SELECT
    parent_task_id,
    COUNT(*) as total_subtasks,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_subtasks
  FROM productivity_tasks
  WHERE parent_task_id IS NOT NULL
  GROUP BY parent_task_id
) sub ON pt.id = sub.parent_task_id
WHERE pt.parent_task_id IS NULL;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON COLUMN daily_tasks.parent_task_id IS 'References the parent task ID for subtask hierarchy. NULL means top-level task.';
COMMENT ON COLUMN daily_tasks.subtask_order IS 'Order of subtask within parent task. 0-indexed.';
COMMENT ON COLUMN productivity_tasks.parent_task_id IS 'References the parent task ID for subtask hierarchy. NULL means top-level task.';
COMMENT ON COLUMN productivity_tasks.subtask_order IS 'Order of subtask within parent task. 0-indexed.';
