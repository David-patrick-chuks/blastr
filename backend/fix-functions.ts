import { pool } from './src/config/db.js';

async function fixFunctions() {
    try {
        console.log('Dropping existing functions...');
        await pool.query('DROP FUNCTION IF EXISTS get_agent_documents(uuid,uuid)');
        await pool.query('DROP FUNCTION IF EXISTS delete_document(uuid,uuid)');
        console.log('✓ Dropped old functions');

        console.log('Creating get_agent_documents function...');
        await pool.query(`
            CREATE OR REPLACE FUNCTION get_agent_documents(p_agent_id UUID, p_user_id UUID)
            RETURNS TABLE (
                id UUID,
                content TEXT,
                metadata JSONB,
                created_at TIMESTAMP WITH TIME ZONE
            ) 
            LANGUAGE sql STABLE
            AS $$
                SELECT id, content, metadata, created_at
                FROM documents
                WHERE agent_id = p_agent_id
                AND user_id = p_user_id
                ORDER BY created_at DESC;
            $$
        `);
        console.log('✓ Created get_agent_documents');

        console.log('Creating delete_document function...');
        await pool.query(`
            CREATE OR REPLACE FUNCTION delete_document(p_id UUID, p_user_id UUID)
            RETURNS VOID
            LANGUAGE sql
            AS $$
                DELETE FROM documents WHERE id = p_id AND user_id = p_user_id;
            $$
        `);
        console.log('✓ Created delete_document');

        console.log('\n✓ All functions created successfully!');
        await pool.end();
    } catch (error) {
        console.error('Error:', error);
        await pool.end();
        process.exit(1);
    }
}

fixFunctions();
