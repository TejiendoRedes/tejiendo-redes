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
    console.log('⚠️  INICIANDO HARD RESET DE LA BASE DE DATOS...');
    console.log('⚠️  ESTO ELIMINARÁ TODAS LAS TABLAS Y DATOS PERMANENTEMENTE.');

    try {
        const { db, schema, connection: pool } = await import('./index');

        // Acquire a single connection from the pool to maintain session state
        // (SET FOREIGN_KEY_CHECKS = 0) across all commands.
        // @ts-ignore - mysql2 promise pool has getConnection
        const conn = await pool.getConnection();

        try {
            // Disable foreign key checks to allow dropping tables in any order
            await conn.execute('SET FOREIGN_KEY_CHECKS = 0;');

            // Get all tables from the schema
            const tableNames: string[] = [];
            for (const [key, value] of Object.entries(schema)) {
                try {
                    // @ts-ignore
                    const config = getTableConfig(value);
                    if (config && config.name) {
                        tableNames.push(config.name);
                    }
                } catch (e) {
                    // Not a table, skip
                }
            }

            // Deduplicate table names
            const uniqueTableNames = [...new Set(tableNames)];
            console.log(`🚀 Found ${uniqueTableNames.length} tables to drop.`);

            // Drop tables in parallel using the same connection context
            await withPerformanceCheck('Parallel Table Drop', async () => {
                return Promise.all(uniqueTableNames.map(async (tableName) => {
                    console.log(`  🗑️  Eliminando tabla: ${tableName}...`);
                    return conn.execute(`DROP TABLE IF EXISTS \`${tableName}\`;`);
                }));
            }, 10000);

            // Re-enable foreign key checks
            await conn.execute('SET FOREIGN_KEY_CHECKS = 1;');
            console.log('✅ Base de datos limpiada exitosamente.');
        } finally {
            // Release the connection back to the pool
            conn.release();
        }

        console.log('👉 Ahora puedes correr `npm run db:push` para recrear el esquema.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error durante el hard reset:', error);
        process.exit(1);
    }
}

hardReset();
