CREATE TABLE IF NOT EXISTS whatsapp_sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    creds JSONB,
    keys JSONB
);
