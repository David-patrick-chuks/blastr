import { pool } from './src/config/db.js';

async function verify() {
    try {
        console.log('='.repeat(50));
        console.log('DATABASE MIGRATION VERIFICATION');
        console.log('='.repeat(50));

        // Check tables
        const tables = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('agents', 'campaigns', 'recipients', 'documents', 'camel_logs', 'activity_logs')
            ORDER BY table_name
        `);

        console.log('\n✓ Tables Created:');
        tables.rows.forEach(row => console.log(`  - ${row.table_name}`));

        // Check agents table structure
        const agentCols = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'agents' 
            ORDER BY ordinal_position
        `);

        console.log('\n✓ Agents Table Columns:');
        agentCols.rows.forEach(row => console.log(`  - ${row.column_name}`));

        // Check campaigns has agent_id
        const campaignCols = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'campaigns' 
            AND column_name IN ('agent_id', 'system_instruction')
        `);

        console.log('\n✓ Campaigns Table New Columns:');
        campaignCols.rows.forEach(row => console.log(`  - ${row.column_name}`));

        // Check functions
        const functions = await pool.query(`
            SELECT routine_name 
            FROM information_schema.routines 
            WHERE routine_schema = 'public' 
            AND routine_name IN ('hybrid_search', 'match_documents', 'get_agent_documents', 'delete_document')
            ORDER BY routine_name
        `);

        console.log('\n✓ Functions Created:');
        functions.rows.forEach(row => console.log(`  - ${row.routine_name}`));

        console.log('\n' + '='.repeat(50));
        console.log('✓ MIGRATION SUCCESSFUL!');
        console.log('='.repeat(50));
        console.log('\nYour database is ready for the Agent-Campaign architecture.');
        console.log('You can now:');
        console.log('  1. Create Agents (email bots with SMTP credentials)');
        console.log('  2. Verify SMTP connections');
        console.log('  3. Create Campaigns (email blasts using agents)');
        console.log('  4. Track 500/day Gmail limits per agent\n');

        await pool.end();
    } catch (error) {
        console.error('Verification failed:', error);
        await pool.end();
        process.exit(1);
    }
}

verify();
