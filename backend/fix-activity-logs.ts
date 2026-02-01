import { pool } from './src/config/db.js';

async function fixActivityLogs() {
    try {
        console.log('Adding campaign_id column to activity_logs...');
        await pool.query(`
            ALTER TABLE activity_logs 
            ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE
        `);
        console.log('✓ Added campaign_id column');

        console.log('Creating index...');
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_activity_logs_campaign_created 
            ON activity_logs(campaign_id, created_at)
        `);
        console.log('✓ Created index');

        console.log('\n✓ All fixes applied successfully!');
        await pool.end();
    } catch (error) {
        console.error('Error:', error);
        await pool.end();
        process.exit(1);
    }
}

fixActivityLogs();
