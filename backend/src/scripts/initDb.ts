import { pool } from '../config/db.js';
import { logger } from '../utils/logger.js';

const schema = `
-- Cleanup
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS agents CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY,
    full_name TEXT,
    email TEXT UNIQUE,
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agents Table
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    name TEXT NOT NULL,
    role TEXT,
    platform TEXT,
    status TEXT DEFAULT 'Active',
    system_instruction TEXT,
    parameters JSONB DEFAULT '{}',
    integrations JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    uptime TEXT DEFAULT '100%',
    last_active TIMESTAMPTZ DEFAULT NOW()
);

-- Documents (Knowledge) Table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    embedding vector(768), -- Gemini text-embedding-004 is 768
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Semantic search procedure
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

-- Hybrid search procedure
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

-- Helper procedures
CREATE OR REPLACE FUNCTION get_agent_documents(p_agent_id uuid, p_user_id uuid)
RETURNS SETOF documents AS $$
BEGIN
    RETURN QUERY SELECT * FROM documents WHERE agent_id = p_agent_id AND user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_document(p_id uuid, p_user_id uuid)
RETURNS void AS $$
BEGIN
    DELETE FROM documents WHERE id = p_id AND user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;
`;

export const initDb = async () => {
  try {
    logger.info('Initializing comprehensive database schema...');
    await pool.query(schema);
    logger.info('Database schema and procedures initialized successfully.');
  } catch (error: any) {
    logger.error({ error: error.message }, 'Failed to initialize database schema');
    process.exit(1);
  }
};

if (process.argv[1].endsWith('initDb.ts') || process.argv[1].endsWith('initDb.js')) {
  initDb();
}
