import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { pool } from './src/config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function splitSQL(sql: string): string[] {
    const statements: string[] = [];
    let current = '';
    let inDollarQuote = false;
    let dollarTag = '';
    let inDoBlock = false;

    const lines = sql.split('\n');

    for (const line of lines) {
        const trimmed = line.trim();

        // Skip comments and separators
        if (trimmed.startsWith('--') || trimmed.match(/^={3,}/)) {
            continue;
        }

        // Check for DO block start
        if (trimmed.startsWith('DO $$') || trimmed.startsWith('DO $')) {
            inDoBlock = true;
        }

        // Check for dollar-quoted strings
        const dollarMatch = line.match(/\$\$|\$[a-zA-Z_][a-zA-Z0-9_]*\$/);
        if (dollarMatch) {
            if (!inDollarQuote) {
                inDollarQuote = true;
                dollarTag = dollarMatch[0];
            } else if (line.includes(dollarTag)) {
                inDollarQuote = false;
                dollarTag = '';
                if (inDoBlock) {
                    inDoBlock = false;
                }
            }
        }

        current += line + '\n';

        // End of statement
        if (!inDollarQuote && !inDoBlock && trimmed.endsWith(';')) {
            const stmt = current.trim();
            if (stmt.length > 0) {
                statements.push(stmt);
            }
            current = '';
        }
    }

    // Add any remaining statement
    if (current.trim().length > 0) {
        statements.push(current.trim());
    }

    return statements;
}

async function runMigration() {
    try {
        console.log('Starting database migration...\n');

        const migrationSQL = readFileSync(join(__dirname, 'supabase_migration.sql'), 'utf-8');
        const statements = splitSQL(migrationSQL);

        console.log(`Found ${statements.length} SQL statements to execute\n`);

        let successCount = 0;
        let skipCount = 0;

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];

            try {
                const preview = statement.substring(0, 70).replace(/\s+/g, ' ');
                process.stdout.write(`[${i + 1}/${statements.length}] ${preview}...`);

                await pool.query(statement);
                console.log(' ✓');
                successCount++;
            } catch (error: any) {
                // Skip "already exists" errors
                if (error.code === '42P07' || error.code === '42710' || error.message?.includes('already exists')) {
                    console.log(' (already exists)');
                    skipCount++;
                } else {
                    console.log(` ✗`);
                    console.error(`Error: ${error.message}`);
                    console.error(`Statement preview: ${statement.substring(0, 200)}...`);
                    throw error;
                }
            }
        }

        console.log(`\n✓ Migration completed!`);
        console.log(`  - Executed: ${successCount}`);
        console.log(`  - Skipped: ${skipCount}`);

        // Verify tables were created
        const result = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('agents', 'campaigns', 'recipients', 'documents', 'camel_logs', 'activity_logs')
            ORDER BY table_name
        `);

        console.log('\nVerified tables:');
        result.rows.forEach(row => console.log(`  ✓ ${row.table_name}`));

        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('\n✗ Migration failed:', error);
        await pool.end();
        process.exit(1);
    }
}

runMigration();
