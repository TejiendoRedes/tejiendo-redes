import { loadEnvConfig } from '@next/env';
import { sql, eq } from 'drizzle-orm';
import { getTableConfig } from 'drizzle-orm/mysql-core';
import bcrypt from 'bcryptjs';

// Load environment variables configuration
const projectDir = process.cwd();
loadEnvConfig(projectDir);

/**
 * Script to reset the database (empty all tables)
 * Usage: tsx src/db/reset.ts
 */
async function reset() {
    try {
        const { db, schema } = await import('./index');
        const { users } = await import('./schema');

        // Disable foreign key checks
        await db.execute(sql`SET FOREIGN_KEY_CHECKS = 0;`);

        // Get all tables from the schema
        const tableNames: string[] = [];
        for (const [key, value] of Object.entries(schema)) {
            try {
                const config = getTableConfig(value as any);
                if (config && config.name) {
                    tableNames.push(config.name);
                }
            } catch (e) {
                // Not a table, skip
            }
        }

        // Deduplicate table names (in case multiple exports refer to the same table)
        const uniqueTableNames = [...new Set(tableNames)];

        for (const tableName of uniqueTableNames) {
            await db.execute(sql`TRUNCATE TABLE ${sql.identifier(tableName)};`);
        }

        // Re-enable foreign key checks
        await db.execute(sql`SET FOREIGN_KEY_CHECKS = 1;`);

        const defaultUsers = [
            { username: 'admin', password: 'Admin123!', role: 'admin' as const },
            { username: 'super', password: 'Super123!', role: 'superuser' as const },
            { username: 'medico', password: 'Medico123!', role: 'medico' as const },
            { username: 'operador', password: 'Operador123!', role: 'operador' as const },
        ];

        for (const user of defaultUsers) {
            const passwordHash = await bcrypt.hash(user.password, 10);
            await db.insert(users).values({
                username: user.username,
                password: passwordHash,
                role: user.role,
                approved: true,
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error durante el reset:', error);
        process.exit(1);
    }
}

reset();
