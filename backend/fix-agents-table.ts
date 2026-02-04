import { pool } from './src/config/db.js';

async function fixAgentsTable() {
    try {
        console.log('Checking agents table structure...\n');

        const cols = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'agents' 
            ORDER BY ordinal_position
        `);

        console.log('Current agents table columns:');
        cols.rows.forEach(row => console.log(`  - ${row.column_name}`));

        const hasSmtpHost = cols.rows.some(r => r.column_name === 'smtp_host');

        if (!hasSmtpHost) {
            console.log('\n⚠️  Old schema detected. Recreating agents table...\n');

            // Drop old table
            console.log('1. Dropping old agents table...');
            await pool.query('DROP TABLE IF EXISTS agents CASCADE');
            console.log('   ✓ Dropped');

            // Create new table
            console.log('2. Creating new agents table with SMTP schema...');
            await pool.query(`
                CREATE TABLE agents (
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
                )
            `);
            console.log('   ✓ Created');

            // Create indexes
            console.log('3. Creating indexes...');
            await pool.query('CREATE INDEX idx_agents_user_status ON agents(user_id, status)');
            await pool.query('CREATE INDEX idx_agents_user_created ON agents(user_id, created_at)');
            console.log('   ✓ Indexes created');

            // Update campaigns foreign key
            console.log('4. Updating campaigns table...');
            await pool.query('ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_agent_id_fkey');
            await pool.query('ALTER TABLE campaigns ADD CONSTRAINT campaigns_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE SET NULL');
            console.log('   ✓ Foreign key updated');

            console.log('\n✓ Agents table recreated successfully!\n');
        } else {
            console.log('\n✓ Agents table already has correct schema!\n');
        }

        // Verify
        const newCols = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'agents' 
            ORDER BY ordinal_position
        `);

        console.log('Final agents table columns:');
        newCols.rows.forEach(row => console.log(`  ✓ ${row.column_name}`));

        await pool.end();
    } catch (error) {
        console.error('Error:', error);
        await pool.end();
        process.exit(1);
    }
}

fixAgentsTable();
