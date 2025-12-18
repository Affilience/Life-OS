-- Run this in Supabase SQL Editor to fix the 400 error
-- Creates nova_messages and nova_memories tables

-- NOVA MESSAGES (Conversation History)
CREATE TABLE IF NOT EXISTS nova_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_nova_messages_user ON nova_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_nova_messages_created ON nova_messages(user_id, created_at DESC);

-- RLS
ALTER TABLE nova_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages" ON nova_messages
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own messages" ON nova_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own messages" ON nova_messages
  FOR DELETE USING (auth.uid() = user_id);

-- NOVA MEMORIES (Long-term Memory)
CREATE TABLE IF NOT EXISTS nova_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  memory_type TEXT NOT NULL CHECK (memory_type IN ('episodic', 'semantic', 'procedural', 'profile')),
  content TEXT NOT NULL,
  structured_data JSONB DEFAULT '{}',
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_nova_memories_user ON nova_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_nova_memories_type ON nova_memories(user_id, memory_type);
CREATE INDEX IF NOT EXISTS idx_nova_memories_active ON nova_memories(user_id, is_active) WHERE is_active = true;

-- RLS
ALTER TABLE nova_memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own memories" ON nova_memories
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own memories" ON nova_memories
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own memories" ON nova_memories
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own memories" ON nova_memories
  FOR DELETE USING (auth.uid() = user_id);

-- Helper function for conversation context
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

-- Helper function to get profile memories
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

-- Helper function to reinforce memory on access
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
    importance = LEAST(importance + 0.01, 1.0)
  WHERE id = p_memory_id;
END;
$$;

SELECT 'Nova tables created successfully!' as result;
