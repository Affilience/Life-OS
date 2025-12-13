-- ============================================
-- MISSING TABLES MIGRATION
-- Tables needed for stores that are currently localStorage-only
-- ============================================

-- ============================================
-- CONTENT CONSUMPTION TRACKING
-- For contentStore - tracks books, podcasts, videos, articles, courses
-- ============================================

CREATE TABLE IF NOT EXISTS content_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('book', 'podcast', 'video', 'article', 'course')),
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'abandoned')),
  url TEXT,
  author TEXT,
  duration INTEGER, -- minutes for videos/podcasts, pages for books
  date_started TIMESTAMPTZ,
  date_completed TIMESTAMPTZ,
  rating INTEGER CHECK (rating >= 0 AND rating <= 5),
  quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 10),
  tags TEXT[] DEFAULT '{}',
  category TEXT, -- productivity, business, health, etc.

  -- Learning tracking
  key_takeaways TEXT[] DEFAULT '{}',
  notes_url TEXT,
  implementation_status TEXT DEFAULT 'not_started' CHECK (implementation_status IN ('not_started', 'planning', 'implementing', 'implemented')),
  implementation_notes TEXT,

  -- Consumption awareness
  time_spent INTEGER DEFAULT 0, -- actual minutes spent
  consumption_date TIMESTAMPTZ DEFAULT NOW(),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for content_items
CREATE INDEX idx_content_items_user ON content_items(user_id);
CREATE INDEX idx_content_items_type ON content_items(content_type);
CREATE INDEX idx_content_items_status ON content_items(status);
CREATE INDEX idx_content_items_category ON content_items(category);

-- Trigger for updated_at
CREATE TRIGGER update_content_items_updated_at BEFORE UPDATE ON content_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS for content_items
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own content" ON content_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own content" ON content_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own content" ON content_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own content" ON content_items FOR DELETE USING (auth.uid() = user_id);


-- ============================================
-- PURPOSE & VALUES TRACKING
-- For purposeStore - mission, values, decisions, identity
-- ============================================

-- Core Values table
CREATE TABLE IF NOT EXISTS user_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  importance INTEGER CHECK (importance >= 1 AND importance <= 10) DEFAULT 5,
  color TEXT DEFAULT '#8b5cf6',
  examples TEXT[] DEFAULT '{}',
  defined_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Decision Journal table
CREATE TABLE IF NOT EXISTS user_decisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  context TEXT,
  situation TEXT,
  options JSONB DEFAULT '[]', -- Array of options considered
  chosen_option TEXT,
  reasoning TEXT,
  expected_outcome TEXT,
  actual_outcome TEXT,
  decision_date TIMESTAMPTZ DEFAULT NOW(),
  review_date TIMESTAMPTZ,
  tags TEXT[] DEFAULT '{}',
  category TEXT DEFAULT 'personal' CHECK (category IN ('personal', 'business', 'relationship', 'health', 'financial')),
  importance TEXT DEFAULT 'medium' CHECK (importance IN ('low', 'medium', 'high', 'critical')),
  values_alignment JSONB DEFAULT '{}', -- { valueId: alignmentScore }
  outcome TEXT DEFAULT 'pending' CHECK (outcome IN ('pending', 'good', 'neutral', 'bad')),
  lessons_learned TEXT,
  would_do_again BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Identity Check-ins table
CREATE TABLE IF NOT EXISTS user_identity_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  identity_statement TEXT, -- "I am..."
  reflections TEXT,
  changes_from_last TEXT,
  proud_of TEXT[] DEFAULT '{}',
  working_on TEXT[] DEFAULT '{}',
  values_lived TEXT[] DEFAULT '{}', -- Which values did you live this period?
  checkin_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Purpose/Vision table (stores mission statement and vision)
CREATE TABLE IF NOT EXISTS user_purpose (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_statement TEXT,
  vision_one_year TEXT,
  vision_five_year TEXT,
  vision_ten_year TEXT,
  vision_ultimate TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for purpose tables
CREATE INDEX idx_user_values_user ON user_values(user_id);
CREATE INDEX idx_user_values_importance ON user_values(importance DESC);
CREATE INDEX idx_user_decisions_user ON user_decisions(user_id);
CREATE INDEX idx_user_decisions_category ON user_decisions(category);
CREATE INDEX idx_user_decisions_outcome ON user_decisions(outcome);
CREATE INDEX idx_user_identity_checkins_user ON user_identity_checkins(user_id);
CREATE INDEX idx_user_identity_checkins_date ON user_identity_checkins(checkin_date DESC);

-- Triggers for updated_at
CREATE TRIGGER update_user_values_updated_at BEFORE UPDATE ON user_values FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_decisions_updated_at BEFORE UPDATE ON user_decisions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_purpose_updated_at BEFORE UPDATE ON user_purpose FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS for purpose tables
ALTER TABLE user_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_identity_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_purpose ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own values" ON user_values FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own decisions" ON user_decisions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own checkins" ON user_identity_checkins FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own purpose" ON user_purpose FOR ALL USING (auth.uid() = user_id);


-- ============================================
-- QUOTES COLLECTION
-- For quotesStore - custom quotes and favorites
-- ============================================

CREATE TABLE IF NOT EXISTS user_quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  author TEXT DEFAULT 'Unknown',
  category TEXT DEFAULT 'custom',
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quotes
CREATE INDEX idx_user_quotes_user ON user_quotes(user_id);
CREATE INDEX idx_user_quotes_favorite ON user_quotes(user_id, is_favorite) WHERE is_favorite = true;

-- RLS for quotes
ALTER TABLE user_quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own quotes" ON user_quotes FOR ALL USING (auth.uid() = user_id);


-- ============================================
-- DAILY TASKS / PLANNING
-- For dailyTasksStore - daily task planning
-- ============================================

CREATE TABLE IF NOT EXISTS daily_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'productivity' CHECK (category IN ('productivity', 'health', 'learning', 'personal', 'admin', 'creative')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  estimated_minutes INTEGER DEFAULT 30,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  task_order INTEGER DEFAULT 0,
  carried_from DATE, -- If task was carried over from another day
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily task templates
CREATE TABLE IF NOT EXISTS daily_task_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tasks JSONB NOT NULL DEFAULT '[]', -- Array of task templates
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for daily tasks
CREATE INDEX idx_daily_tasks_user ON daily_tasks(user_id);
CREATE INDEX idx_daily_tasks_date ON daily_tasks(user_id, task_date);
CREATE INDEX idx_daily_tasks_completed ON daily_tasks(user_id, task_date, completed);
CREATE INDEX idx_daily_task_templates_user ON daily_task_templates(user_id);

-- Trigger for updated_at
CREATE TRIGGER update_daily_tasks_updated_at BEFORE UPDATE ON daily_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS for daily tasks
ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_task_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own daily tasks" ON daily_tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own templates" ON daily_task_templates FOR ALL USING (auth.uid() = user_id);


-- ============================================
-- USER RESOLUTIONS (if not already created)
-- For resolutionStore
-- ============================================

CREATE TABLE IF NOT EXISTS user_resolutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  target_value NUMERIC,
  current_value NUMERIC DEFAULT 0,
  unit TEXT,
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  color TEXT DEFAULT '#8b5cf6',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_resolution_check_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resolution_id UUID NOT NULL REFERENCES user_resolutions(id) ON DELETE CASCADE,
  value NUMERIC NOT NULL,
  notes TEXT,
  check_in_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for resolutions
CREATE INDEX IF NOT EXISTS idx_user_resolutions_user ON user_resolutions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_resolutions_year ON user_resolutions(user_id, year);
CREATE INDEX IF NOT EXISTS idx_user_resolution_check_ins_resolution ON user_resolution_check_ins(resolution_id);

-- Triggers
CREATE TRIGGER update_user_resolutions_updated_at BEFORE UPDATE ON user_resolutions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS for resolutions
ALTER TABLE user_resolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_resolution_check_ins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own resolutions" ON user_resolutions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own check-ins" ON user_resolution_check_ins FOR ALL USING (auth.uid() = user_id);
