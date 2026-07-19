import { loadEnvConfig } from '@next/env';
import { sql } from 'drizzle-orm';
import { getTableConfig } from 'drizzle-orm/mysql-core';
import { withPerformanceCheck } from '../lib/db-utils';

// Load environment variables configuration
const projectDir = process.cwd();
loadEnvConfig(projectDir);

/**
 * Script to HARD reset the database (DROP all tables)
 * Usage: tsx src/db/hard-reset.ts
 * WARN: This is destructive!
 */
async function hardReset() {

    try {
        const { db, schema, connection: pool } = await import('./index');

        // Acquire a single connection from the pool to maintain session state
        // (SET FOREIGN_KEY_CHECKS = 0) across all commands.
        // @ts-ignore - mysql2 promise pool has getConnection
        const conn = await pool.getConnection();

        try {
            // Disable foreign key checks to allow dropping tables in any order
            await conn.execute('SET FOREIGN_KEY_CHECKS = 0;');

            // Get all tables dynamically from the database
            const [rows] = await conn.execute('SHOW TABLES') as any[];
            const tableNames = rows.map((row: any) => Object.values(row)[0] as string);

            // Drop tables in sequence to avoid deadlocks
            await withPerformanceCheck('Sequential Table Drop', async () => {
                for (const tableName of tableNames) {
                    await conn.execute(`DROP TABLE IF EXISTS \`${tableName}\`;`);
                }
            }, 30000);

            // Re-enable foreign key checks
            await conn.execute('SET FOREIGN_KEY_CHECKS = 1;');
        } finally {
            // Release the connection back to the pool
            conn.release();
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error durante el hard reset:', error);
        process.exit(1);
    }
}

hardReset();
