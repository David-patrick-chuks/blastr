import pg from 'pg';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

const { Pool } = pg;

import { parse } from 'pg-connection-string';

if (!env.DATABASE_URL) {
    logger.error('ERROR: DATABASE_URL is missing from .env configuration!');
    throw new Error('DATABASE_URL is missing');
}

// Log identifying info (safely)
const maskedUrl = env.DATABASE_URL.replace(/:([^@]+)@/, ':****@');
logger.info(`Initializing DB Pool with URL: ${maskedUrl}`);

let dbConfig: any;
try {
    // Parse the URL once to get an object
    const parsed = parse(env.DATABASE_URL);
    
    // Explicitly construct the config to avoid hidden properties and ensure types
    dbConfig = {
        user: parsed.user || undefined,
        password: parsed.password || undefined,
        host: parsed.host || undefined,
        port: parsed.port ? parseInt(parsed.port, 10) : 5432,
        database: parsed.database || undefined,
    };
    
    logger.info(`Database config extracted. Host: ${dbConfig.host}, Port: ${dbConfig.port}, User: ${dbConfig.user}`);
} catch (err: any) {
    logger.error(`Failed to parse DATABASE_URL: ${err.message}`);
    throw err;
}

export const pool = new Pool({
    user: dbConfig.user,
    password: dbConfig.password,
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database,
    ssl: process.env.NODE_ENV === 'production' || 
         env.DATABASE_URL.includes('supabase.com') || 
         env.DATABASE_URL.includes('pooler.supabase.com') ? {
        rejectUnauthorized: false
    } : false,
    max: 20,
    idleTimeoutMillis: 60000,
    connectionTimeoutMillis: 20000,
});

pool.on('connect', () => {
    logger.debug('New client connected to Postgres database');
});

pool.on('error', (err) => {
    logger.error({ err }, 'Unexpected error on idle client');
    process.exit(-1);
});

export const query = async (text: string, params?: any[]) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        if (duration > 2000) logger.warn(`Slow Query (${duration}ms): ${text.slice(0, 50)}...`);
        return res;
    } catch (err: any) {
        logger.error({ text: text.slice(0, 100), error: err.message }, 'Query Failed');
        throw err;
    }
};
