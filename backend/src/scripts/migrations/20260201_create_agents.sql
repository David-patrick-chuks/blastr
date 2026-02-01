-- Migration: Create Agents Table and Migrate SMTP Settings
-- This migration separates email bots (agents) from campaigns

-- Step 1: Create agents table
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

CREATE INDEX ON agents(user_id, status);
CREATE INDEX ON agents(user_id, created_at);

-- Step 2: Migrate existing smtp_settings to agents
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
WHERE user_id IS NOT NULL;

-- Step 3: Add agent_id to campaigns table
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES agents(id) ON DELETE SET NULL;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS system_instruction TEXT;

-- Step 4: Link existing campaigns to their user's default agent
UPDATE campaigns c
SET agent_id = a.id
FROM agents a
WHERE c.user_id = a.user_id
AND a.name = 'Default Agent'
AND c.agent_id IS NULL;

CREATE INDEX ON campaigns(agent_id);
CREATE INDEX ON campaigns(user_id, status);

-- Step 5: Add agent_id to recipients table
ALTER TABLE recipients ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES agents(id);
CREATE INDEX ON recipients(agent_id, sent_at);

-- Step 6: Drop smtp_settings table (backup first if needed)
-- DROP TABLE IF EXISTS smtp_settings;
-- Commented out for safety - uncomment after verifying migration
