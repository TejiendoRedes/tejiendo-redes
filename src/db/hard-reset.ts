import { loadEnvConfig } from '@next/env';
import { sql } from 'drizzle-orm';
import { getTableConfig } from 'drizzle-orm/mysql-core';

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
        const { db, schema } = await import('./index');

        // Disable foreign key checks to allow dropping tables in any order
        await db.execute(sql`SET FOREIGN_KEY_CHECKS = 0;`);

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
        console.log(`Found ${uniqueTableNames.length} tables to drop.`);

        for (const tableName of uniqueTableNames) {
            console.log(`  - Eliminando tabla: ${tableName}...`);
            await db.execute(sql`DROP TABLE IF EXISTS ${sql.identifier(tableName)};`);
        }

        // Re-enable foreign key checks
        await db.execute(sql`SET FOREIGN_KEY_CHECKS = 1;`);

        console.log('✅ Base de datos limpiada exitosamente (Tablas eliminadas).');
        console.log('👉 Ahora puedes correr `npm run db:push` para recrear el esquema.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error durante el hard reset:', error);
        process.exit(1);
    }
}

hardReset();
