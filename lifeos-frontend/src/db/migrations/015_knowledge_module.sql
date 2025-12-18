-- ============================================
-- KNOWLEDGE MODULE TABLES
-- Tables for knowledgeStore - notes, books, media, tags, collections, projects
-- ============================================

-- ============================================
-- KNOWLEDGE NOTES
-- ============================================

CREATE TABLE IF NOT EXISTS knowledge_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Note',
  content TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  linked_to TEXT[] DEFAULT '{}',
  linked_from TEXT[] DEFAULT '{}',
  media_attachments TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT false,
  archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for knowledge_notes
CREATE INDEX IF NOT EXISTS idx_knowledge_notes_user ON knowledge_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_notes_favorite ON knowledge_notes(user_id, is_favorite) WHERE is_favorite = true;
CREATE INDEX IF NOT EXISTS idx_knowledge_notes_updated ON knowledge_notes(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_notes_archived ON knowledge_notes(user_id, archived);

-- RLS for knowledge_notes
ALTER TABLE knowledge_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own notes" ON knowledge_notes;
DROP POLICY IF EXISTS "Users can insert own notes" ON knowledge_notes;
DROP POLICY IF EXISTS "Users can update own notes" ON knowledge_notes;
DROP POLICY IF EXISTS "Users can delete own notes" ON knowledge_notes;
CREATE POLICY "Users can view own notes" ON knowledge_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notes" ON knowledge_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notes" ON knowledge_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notes" ON knowledge_notes FOR DELETE USING (auth.uid() = user_id);


-- ============================================
-- KNOWLEDGE BOOKS
-- ============================================

CREATE TABLE IF NOT EXISTS knowledge_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT DEFAULT 'Unknown',
  cover_image TEXT,
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'want-to-read' CHECK (status IN ('want-to-read', 'reading', 'completed', 'abandoned')),
  rating INTEGER CHECK (rating >= 0 AND rating <= 5),
  progress_current INTEGER DEFAULT 0,
  progress_total INTEGER DEFAULT 0,
  progress_unit TEXT DEFAULT 'chapter',
  notes TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  is_favorite BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for knowledge_books
CREATE INDEX IF NOT EXISTS idx_knowledge_books_user ON knowledge_books(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_books_status ON knowledge_books(user_id, status);
CREATE INDEX IF NOT EXISTS idx_knowledge_books_favorite ON knowledge_books(user_id, is_favorite) WHERE is_favorite = true;

-- RLS for knowledge_books
ALTER TABLE knowledge_books ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own books" ON knowledge_books;
DROP POLICY IF EXISTS "Users can insert own books" ON knowledge_books;
DROP POLICY IF EXISTS "Users can update own books" ON knowledge_books;
DROP POLICY IF EXISTS "Users can delete own books" ON knowledge_books;
CREATE POLICY "Users can view own books" ON knowledge_books FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own books" ON knowledge_books FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own books" ON knowledge_books FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own books" ON knowledge_books FOR DELETE USING (auth.uid() = user_id);


-- ============================================
-- KNOWLEDGE MEDIA
-- ============================================

CREATE TABLE IF NOT EXISTS knowledge_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL DEFAULT 'video' CHECK (media_type IN ('video', 'podcast', 'article', 'course', 'book')),
  title TEXT NOT NULL,
  creator TEXT DEFAULT 'Unknown',
  thumbnail_url TEXT,
  url TEXT,
  duration TEXT,
  status TEXT DEFAULT 'want' CHECK (status IN ('want', 'in_progress', 'completed', 'abandoned')),
  linked_notes TEXT[] DEFAULT '{}',
  text_notes TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  watched_at TIMESTAMPTZ,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for knowledge_media
CREATE INDEX IF NOT EXISTS idx_knowledge_media_user ON knowledge_media(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_media_type ON knowledge_media(user_id, media_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_media_status ON knowledge_media(user_id, status);
CREATE INDEX IF NOT EXISTS idx_knowledge_media_favorite ON knowledge_media(user_id, is_favorite) WHERE is_favorite = true;

-- RLS for knowledge_media
ALTER TABLE knowledge_media ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own media" ON knowledge_media;
DROP POLICY IF EXISTS "Users can insert own media" ON knowledge_media;
DROP POLICY IF EXISTS "Users can update own media" ON knowledge_media;
DROP POLICY IF EXISTS "Users can delete own media" ON knowledge_media;
CREATE POLICY "Users can view own media" ON knowledge_media FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own media" ON knowledge_media FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own media" ON knowledge_media FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own media" ON knowledge_media FOR DELETE USING (auth.uid() = user_id);


-- ============================================
-- KNOWLEDGE TAGS
-- ============================================

CREATE TABLE IF NOT EXISTS knowledge_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Indexes for knowledge_tags
CREATE INDEX IF NOT EXISTS idx_knowledge_tags_user ON knowledge_tags(user_id);

-- RLS for knowledge_tags
ALTER TABLE knowledge_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own tags" ON knowledge_tags;
CREATE POLICY "Users can manage own tags" ON knowledge_tags FOR ALL USING (auth.uid() = user_id);


-- ============================================
-- KNOWLEDGE COLLECTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS knowledge_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  color TEXT DEFAULT '#8b5cf6',
  icon TEXT DEFAULT '📁',
  item_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for knowledge_collections
CREATE INDEX IF NOT EXISTS idx_knowledge_collections_user ON knowledge_collections(user_id);

-- RLS for knowledge_collections
ALTER TABLE knowledge_collections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own collections" ON knowledge_collections;
CREATE POLICY "Users can manage own collections" ON knowledge_collections FOR ALL USING (auth.uid() = user_id);


-- ============================================
-- KNOWLEDGE PROJECTS
-- ============================================

CREATE TABLE IF NOT EXISTS knowledge_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  goal TEXT DEFAULT '',
  status TEXT DEFAULT 'nebula' CHECK (status IN ('nebula', 'nova', 'cosmos')),
  module TEXT DEFAULT 'knowledge',
  goals JSONB DEFAULT '[]',
  tasks JSONB DEFAULT '[]',
  notes TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  start_date TIMESTAMPTZ,
  target_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for knowledge_projects
CREATE INDEX IF NOT EXISTS idx_knowledge_projects_user ON knowledge_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_projects_status ON knowledge_projects(user_id, status);

-- RLS for knowledge_projects
ALTER TABLE knowledge_projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own projects" ON knowledge_projects;
CREATE POLICY "Users can manage own projects" ON knowledge_projects FOR ALL USING (auth.uid() = user_id);
