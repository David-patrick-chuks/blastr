import { pool } from '../config/db.js';
import { logger } from '../utils/logger.js';

export async function restoreConnections() {
    try {
        logger.info('Restoring platform configurations from database...');

        // In BlastAgent AI, we manage campaign-level configurations.
        // Direct social connections are no longer handled here.
        const { rows } = await pool.query(`
            SELECT id, name FROM campaigns WHERE status = 'Active'
        `);

        if (rows.length > 0) {
            logger.info(`Restored ${rows.length} active campaigns to session.`);
        }

        logger.info('Connection restoration complete');
    } catch (error: any) {
        logger.error('Failed to restore connections:', error.message);
    }
}
