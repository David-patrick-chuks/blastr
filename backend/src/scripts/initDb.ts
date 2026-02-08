import { pool } from '../config/db.js';
import { logger } from '../utils/logger.js';

const schema = `
-- Cleanup
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS agents CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Extensions
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

-- Agents (SMTP Bots) Table
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    smtp_host TEXT NOT NULL,
    smtp_port INTEGER NOT NULL DEFAULT 587,
    smtp_secure BOOLEAN DEFAULT TRUE,
    smtp_user TEXT NOT NULL,
    smtp_pass TEXT NOT NULL,
    from_name TEXT,
    status TEXT DEFAULT 'unverified',
    last_verified_at TIMESTAMPTZ,
    daily_sent_count INTEGER DEFAULT 0,
    daily_limit INTEGER DEFAULT 500,
    last_reset_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaigns (Email Jobs / Personas) Table
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    subject TEXT,
    role TEXT,
    template TEXT,
    system_instruction TEXT,
    status TEXT DEFAULT 'Draft',
    total_recipients INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    parameters JSONB DEFAULT '{}',
    integrations JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
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
