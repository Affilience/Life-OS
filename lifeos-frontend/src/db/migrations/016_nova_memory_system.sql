-- ============================================
-- NOVA MEMORY SYSTEM
-- Tables for Nova AI's long-term memory and conversation history
-- ============================================

-- ============================================
-- NOVA MESSAGES (Conversation History)
-- Stores all Nova conversation messages
-- ============================================

CREATE TABLE IF NOT EXISTS nova_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for nova_messages
CREATE INDEX IF NOT EXISTS idx_nova_messages_user ON nova_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_nova_messages_conversation ON nova_messages(user_id, conversation_id);
CREATE INDEX IF NOT EXISTS idx_nova_messages_created ON nova_messages(user_id, created_at DESC);

-- RLS for nova_messages
ALTER TABLE nova_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own messages" ON nova_messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON nova_messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON nova_messages;
CREATE POLICY "Users can view own messages" ON nova_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own messages" ON nova_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own messages" ON nova_messages FOR DELETE USING (auth.uid() = user_id);


-- ============================================
-- NOVA MEMORIES (Long-term Memory with Embeddings)
-- Stores extracted facts, preferences, and memories
-- ============================================

-- Enable pgvector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS nova_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  memory_type TEXT NOT NULL CHECK (memory_type IN ('episodic', 'semantic', 'procedural', 'profile')),
  content TEXT NOT NULL,
  structured_data JSONB DEFAULT '{}',
  embedding vector(1536), -- OpenAI text-embedding-3-small dimension
  importance DECIMAL(3,2) DEFAULT 0.5 CHECK (importance >= 0 AND importance <= 1),
  source_message_id UUID REFERENCES nova_messages(id) ON DELETE SET NULL,
  source_type TEXT DEFAULT 'conversation' CHECK (source_type IN ('conversation', 'explicit', 'inferred')),
  memory_date DATE,
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  superseded_by UUID REFERENCES nova_memories(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for nova_memories
CREATE INDEX IF NOT EXISTS idx_nova_memories_user ON nova_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_nova_memories_type ON nova_memories(user_id, memory_type);
CREATE INDEX IF NOT EXISTS idx_nova_memories_active ON nova_memories(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_nova_memories_importance ON nova_memories(user_id, importance DESC) WHERE is_active = true;

-- Vector similarity index (using IVFFlat for faster search)
CREATE INDEX IF NOT EXISTS idx_nova_memories_embedding ON nova_memories
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- RLS for nova_memories
ALTER TABLE nova_memories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own memories" ON nova_memories;
DROP POLICY IF EXISTS "Users can insert own memories" ON nova_memories;
DROP POLICY IF EXISTS "Users can update own memories" ON nova_memories;
DROP POLICY IF EXISTS "Users can delete own memories" ON nova_memories;
CREATE POLICY "Users can view own memories" ON nova_memories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own memories" ON nova_memories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own memories" ON nova_memories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own memories" ON nova_memories FOR DELETE USING (auth.uid() = user_id);


-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to search memories by similarity
CREATE OR REPLACE FUNCTION match_nova_memories(
  query_embedding vector(1536),
  p_user_id UUID,
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10,
  memory_types TEXT[] DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  memory_type TEXT,
  content TEXT,
  structured_data JSONB,
  importance DECIMAL,
  memory_date DATE,
  similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    nm.id,
    nm.memory_type,
    nm.content,
    nm.structured_data,
    nm.importance,
    nm.memory_date,
    1 - (nm.embedding <=> query_embedding) as similarity
  FROM nova_memories nm
  WHERE nm.user_id = p_user_id
    AND nm.is_active = true
    AND (memory_types IS NULL OR nm.memory_type = ANY(memory_types))
    AND nm.embedding IS NOT NULL
    AND 1 - (nm.embedding <=> query_embedding) >= match_threshold
  ORDER BY nm.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to get profile memories (always relevant)
CREATE OR REPLACE FUNCTION get_nova_profile_memories(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  content TEXT,
  structured_data JSONB,
  importance DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    nm.id,
    nm.content,
    nm.structured_data,
    nm.importance
  FROM nova_memories nm
  WHERE nm.user_id = p_user_id
    AND nm.is_active = true
    AND nm.memory_type = 'profile'
  ORDER BY nm.importance DESC, nm.created_at DESC
  LIMIT 20;
END;
$$;

-- Function to get recent conversation context
CREATE OR REPLACE FUNCTION get_nova_conversation_context(
  p_user_id UUID,
  p_conversation_id UUID DEFAULT NULL,
  p_limit INT DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  role TEXT,
  content TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    nm.id,
    nm.role,
    nm.content,
    nm.created_at
  FROM nova_messages nm
  WHERE nm.user_id = p_user_id
    AND (p_conversation_id IS NULL OR nm.conversation_id = p_conversation_id)
  ORDER BY nm.created_at DESC
  LIMIT p_limit;
END;
$$;

-- Function to reinforce a memory (touch on access)
CREATE OR REPLACE FUNCTION touch_nova_memory(p_memory_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE nova_memories
  SET
    access_count = access_count + 1,
    last_accessed_at = NOW(),
    -- Slightly increase importance on each access (cap at 1.0)
    importance = LEAST(importance + 0.01, 1.0)
  WHERE id = p_memory_id;
END;
$$;

-- Cleanup old messages (keep last 200 per user)
CREATE OR REPLACE FUNCTION cleanup_old_nova_messages()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM nova_messages
  WHERE user_id = NEW.user_id
  AND id NOT IN (
    SELECT id FROM nova_messages
    WHERE user_id = NEW.user_id
    ORDER BY created_at DESC
    LIMIT 200
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_cleanup_nova_messages ON nova_messages;
CREATE TRIGGER trigger_cleanup_nova_messages
  AFTER INSERT ON nova_messages
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_old_nova_messages();


-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE nova_messages IS 'Conversation history between users and Nova AI';
COMMENT ON TABLE nova_memories IS 'Long-term memory storage for Nova AI with vector embeddings';
COMMENT ON FUNCTION match_nova_memories IS 'Semantic similarity search for Nova memories';
COMMENT ON FUNCTION get_nova_profile_memories IS 'Retrieve profile-type memories for a user';
COMMENT ON FUNCTION get_nova_conversation_context IS 'Get recent conversation messages for context';
COMMENT ON FUNCTION touch_nova_memory IS 'Reinforce memory importance on access';
