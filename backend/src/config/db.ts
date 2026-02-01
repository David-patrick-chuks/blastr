import pg from 'pg';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

const { Pool } = pg;

if (!env.DATABASE_URL) {
    logger.error('ERROR: DATABASE_URL is missing from .env configuration!');
    // process.exit(1) is a bit harsh for a library import, but matches user intent. 
    // Better to throw or just log error. I'll throw to prevent startup.
    throw new Error('DATABASE_URL is missing');
}

export const pool = new Pool({
    connectionString: env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {
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
