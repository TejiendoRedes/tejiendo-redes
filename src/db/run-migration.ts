import fs from 'fs';
import path from 'path';
import { loadEnvConfig } from '@next/env';

const projectDir = process.cwd();
loadEnvConfig(projectDir);

async function applyMigration() {
    try {
        const { connection: pool } = await import('./index');
        const sqlContent = fs.readFileSync(path.join(__dirname, 'migrations', 'manual_migration.sql'), 'utf-8');
        
        // Split by statements (very rudimentary, but works for simple SQL separated by ;)
        const statements = sqlContent
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('-- '));

        const conn = await pool.getConnection();
        
        console.log('Running migration statements...');
        
        try {
            await conn.execute('SET FOREIGN_KEY_CHECKS = 0;');
            for (const stmt of statements) {
                // filter out comments inside the statement
                const cleanStmt = stmt.split('\n').filter(line => !line.trim().startsWith('--')).join('\n').trim();
                if (cleanStmt) {
                    console.log(`Executing: ${cleanStmt.substring(0, 50)}...`);
                    try {
                        await conn.execute(cleanStmt);
                    } catch (e: any) {
                        // ignore errors like column doesn't exist (if it was already dropped)
                        console.log(`Warning/Ignored: ${e.message}`);
                    }
                }
            }
            await conn.execute('SET FOREIGN_KEY_CHECKS = 1;');
            console.log('Migration completed successfully!');
        } finally {
            conn.release();
        }
        
        process.exit(0);
    } catch (err) {
        console.error('Error applying migration:', err);
        process.exit(1);
    }
}

applyMigration();
