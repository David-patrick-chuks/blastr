-- Migration: Correct vector dimensions and search functions
-- Date: 2026-01-27
-- Context: Aligning database with Gemini text-embedding-004 (768 dimensions)

-- 1. Recreate Documents Table Column (Safe approach: clear existing embeddings as they are incompatible)
ALTER TABLE documents DROP COLUMN IF EXISTS embedding;
ALTER TABLE documents ADD COLUMN embedding vector(768);

-- 2. Update match_documents procedure
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  p_agent_id uuid,
  p_user_id uuid
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.content,
    d.metadata,
    1 - (d.embedding <=> query_embedding) AS similarity
  FROM documents d
  WHERE d.agent_id = p_agent_id 
    AND d.user_id = p_user_id
    AND 1 - (d.embedding <=> query_embedding) > match_threshold
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 3. Update hybrid_search procedure
CREATE OR REPLACE FUNCTION hybrid_search (
  query_text text,
  query_embedding vector(768),
  p_agent_id uuid,
  match_count int,
  p_user_id uuid
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.content,
    d.metadata,
    1 - (d.embedding <=> query_embedding) AS similarity
  FROM documents d
  WHERE d.agent_id = p_agent_id 
    AND d.user_id = p_user_id
    AND (
      d.content ILIKE '%' || query_text || '%'
      OR 1 - (d.embedding <=> query_embedding) > 0.5
    )
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
