import { pool } from '../config/db.js';
import { logger } from '../utils/logger.js';

const cleanupScript = `
-- Truncate all data tables
TRUNCATE TABLE recipients CASCADE;
TRUNCATE TABLE activity_logs CASCADE;
TRUNCATE TABLE messages CASCADE;
TRUNCATE TABLE campaigns CASCADE;
TRUNCATE TABLE agents CASCADE;

-- Optional: Restart identity sequences if any (though we use UUIDs mostly)
-- RESTART IDENTITY is usually for serials, but doesn't hurt.
`;

export const cleanupDb = async () => {
    try {
        logger.info('Starting full database data purge...');
        await pool.query(cleanupScript);
        logger.info('Database data purged successfully.');
        process.exit(0);
    } catch (error: any) {
        logger.error({ error: error.message }, 'Failed to purge database data');
        process.exit(1);
    }
};

if (process.argv[1].endsWith('cleanupDb.ts') || process.argv[1].endsWith('cleanupDb.js')) {
    cleanupDb();
}
