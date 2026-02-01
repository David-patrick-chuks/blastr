-- Enable the pgvector extension to work with embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the documents table for RAG
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID, -- Associated user from Supabase/Auth
    agent_id UUID NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}',
    embedding vector(768), -- Using 768 dimensions for text-embedding-004
    fts tsvector GENERATED ALWAYS AS (to_tsvector('english', content)) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for full-text search
CREATE INDEX ON documents USING gin(fts);

-- Index for similarity search
CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Hybrid search function (Keyword + Semantic with RRF)
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


-- Similarity search function (Supabase pattern)
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

-- Get all documents for an agent
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

-- Delete a specific document
CREATE OR REPLACE FUNCTION delete_document(p_id UUID, p_user_id UUID)
RETURNS VOID
LANGUAGE sql
AS $$
    DELETE FROM documents WHERE id = p_id AND user_id = p_user_id;
$$;


-- Campaigns table (replaces/extends agents)
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    template TEXT NOT NULL,
    status TEXT DEFAULT 'Draft', -- Draft, Sending, Completed, Failed
    total_recipients INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Recipients table
CREATE TABLE IF NOT EXISTS recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    company TEXT,
    status TEXT DEFAULT 'Pending', -- Pending, Sent, Failed
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- SMTP Settings table
CREATE TABLE IF NOT EXISTS smtp_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE,
    host TEXT NOT NULL,
    port INTEGER NOT NULL,
    secure BOOLEAN DEFAULT TRUE,
    auth_user TEXT NOT NULL,
    auth_pass TEXT NOT NULL,
    from_name TEXT,
    from_email TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Messages table for analytics (adapted for email)
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

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for analytics
CREATE INDEX ON recipients(campaign_id, status);
CREATE INDEX ON camel_logs(campaign_id, created_at);
CREATE INDEX ON activity_logs(campaign_id, created_at);
