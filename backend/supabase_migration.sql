-- ============================================
-- BLASTAGENT AI - COMPLETE DATABASE SETUP
-- Fixed version with proper ordering
-- ============================================

-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- STEP 1: CREATE BASE TABLES
-- ============================================

-- Documents table for RAG
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    agent_id UUID NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}',
    embedding vector(768),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    agent_id UUID,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    template TEXT NOT NULL,
    system_instruction TEXT,
    status TEXT DEFAULT 'Draft',
    total_recipients INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Recipients table
CREATE TABLE IF NOT EXISTS recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    agent_id UUID,
    email TEXT NOT NULL,
    name TEXT,
    company TEXT,
    status TEXT DEFAULT 'Pending',
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Messages/logs table
CREATE TABLE IF NOT EXISTS camel_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES recipients(id) ON DELETE CASCADE,
    subject TEXT,
    content TEXT,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Activity logs
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Agents table
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    smtp_host TEXT NOT NULL,
    smtp_port INTEGER NOT NULL DEFAULT 587,
    smtp_secure BOOLEAN DEFAULT TRUE,
    smtp_user TEXT NOT NULL,
    smtp_pass TEXT NOT NULL,
    from_name TEXT,
    status TEXT DEFAULT 'unverified',
    last_verified_at TIMESTAMP WITH TIME ZONE,
    daily_sent_count INTEGER DEFAULT 0,
    daily_limit INTEGER DEFAULT 500,
    last_reset_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- STEP 2: ADD MISSING COLUMNS
-- ============================================

-- Add agent_id to campaigns if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaigns' AND column_name = 'agent_id'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN agent_id UUID REFERENCES agents(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add system_instruction to campaigns if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaigns' AND column_name = 'system_instruction'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN system_instruction TEXT;
    END IF;
END $$;

-- Add agent_id to recipients if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'recipients' AND column_name = 'agent_id'
    ) THEN
        ALTER TABLE recipients ADD COLUMN agent_id UUID REFERENCES agents(id);
    END IF;
END $$;

-- Add fts column to documents if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'documents' AND column_name = 'fts'
    ) THEN
        ALTER TABLE documents ADD COLUMN fts tsvector 
        GENERATED ALWAYS AS (to_tsvector('english', content)) STORED;
    END IF;
END $$;

-- ============================================
-- STEP 3: CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_documents_fts ON documents USING gin(fts);
CREATE INDEX IF NOT EXISTS idx_documents_embedding ON documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_agents_user_status ON agents(user_id, status);
CREATE INDEX IF NOT EXISTS idx_agents_user_created ON agents(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_campaigns_agent ON campaigns(agent_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_user_status ON campaigns(user_id, status);
CREATE INDEX IF NOT EXISTS idx_recipients_campaign_status ON recipients(campaign_id, status);
CREATE INDEX IF NOT EXISTS idx_recipients_agent_sent ON recipients(agent_id, sent_at);
CREATE INDEX IF NOT EXISTS idx_camel_logs_campaign_created ON camel_logs(campaign_id, created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_campaign_created ON activity_logs(campaign_id, created_at);

-- ============================================
-- STEP 4: MIGRATE EXISTING SMTP SETTINGS (IF ANY)
-- ============================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'smtp_settings') THEN
        INSERT INTO agents (user_id, name, email, smtp_host, smtp_port, smtp_secure, smtp_user, smtp_pass, from_name, status)
        SELECT 
            user_id,
            'Default Agent' as name,
            COALESCE(from_email, auth_user) as email,
            host as smtp_host,
            port as smtp_port,
            secure as smtp_secure,
            auth_user as smtp_user,
            auth_pass as smtp_pass,
            from_name,
            'active' as status
        FROM smtp_settings
        WHERE user_id IS NOT NULL
        ON CONFLICT DO NOTHING;
        
        -- Link existing campaigns to default agents
        UPDATE campaigns c
        SET agent_id = a.id
        FROM agents a
        WHERE c.user_id = a.user_id
        AND a.name = 'Default Agent'
        AND c.agent_id IS NULL;
    END IF;
END $$;

-- ============================================
-- STEP 5: CREATE FUNCTIONS
-- ============================================

-- Hybrid search function
CREATE OR REPLACE FUNCTION hybrid_search(
  p_query_text text,
  p_query_embedding vector(768),
  p_agent_id UUID,
  p_match_count int,
  p_user_id UUID,
  full_text_weight float = 1,
  semantic_weight float = 1,
  rrf_k int = 50
)
RETURNS TABLE (
    id UUID,
    content TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql STABLE
AS $$
WITH full_text AS (
  SELECT
    id,
    ROW_NUMBER() OVER(ORDER BY ts_rank_cd(fts, websearch_to_tsquery(p_query_text)) DESC) AS rank_ix
  FROM
    documents
  WHERE
    agent_id = p_agent_id
    AND user_id = p_user_id
    AND fts @@ websearch_to_tsquery(p_query_text)
  ORDER BY rank_ix
  LIMIT LEAST(p_match_count, 30) * 2
),
semantic AS (
  SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY embedding <=> p_query_embedding) AS rank_ix
  FROM
    documents
  WHERE
    agent_id = p_agent_id
  ORDER BY rank_ix
  LIMIT LEAST(p_match_count, 30) * 2
)
SELECT
  d.id,
  d.content,
  d.metadata,
  d.created_at
FROM
  full_text
  FULL OUTER JOIN semantic ON full_text.id = semantic.id
  JOIN documents d ON COALESCE(full_text.id, semantic.id) = d.id
ORDER BY
  COALESCE(1.0 / (rrf_k + full_text.rank_ix), 0.0) * full_text_weight +
  COALESCE(1.0 / (rrf_k + semantic.rank_ix), 0.0) * semantic_weight
  DESC
LIMIT
  LEAST(p_match_count, 30);
$$;

-- Similarity search function
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  p_agent_id UUID,
  p_user_id UUID
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) AS similarity
  FROM documents
  WHERE documents.agent_id = p_agent_id
    AND documents.user_id = p_user_id
    AND 1 - (documents.embedding <=> query_embedding) > match_threshold
  ORDER BY (documents.embedding <=> query_embedding) ASC
  LIMIT match_count;
$$;

-- Get agent documents
CREATE OR REPLACE FUNCTION get_agent_documents(p_agent_id UUID, p_user_id UUID)
RETURNS TABLE (
    id UUID,
    content TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE sql STABLE
AS $$
    SELECT id, content, metadata, created_at
    FROM documents
    WHERE agent_id = p_agent_id
    AND user_id = p_user_id
    ORDER BY created_at DESC;
$$;

-- Delete document
CREATE OR REPLACE FUNCTION delete_document(p_id UUID, p_user_id UUID)
RETURNS VOID
LANGUAGE sql
AS $$
    DELETE FROM documents WHERE id = p_id AND user_id = p_user_id;
$$;
