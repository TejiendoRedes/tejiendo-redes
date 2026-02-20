import mysql from 'mysql2/promise';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

export async function runManualDbChanges() {
    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST!,
        user: process.env.DATABASE_USER!,
        password: process.env.DATABASE_PASSWORD!,
        database: process.env.DATABASE_NAME!,
        port: Number(process.env.DATABASE_PORT) || 3306,
        multipleStatements: true,
        ssl: { rejectUnauthorized: false },
    });

    try {
        await connection.query('SET SESSION sql_require_primary_key = 0;');

        const queries = [
            'ALTER TABLE `solicitudes_abordajes` ADD COLUMN `logistica_lugar` tinyint NOT NULL DEFAULT 0;',
            'ALTER TABLE `solicitudes_abordajes` ADD COLUMN `logistica_personal` tinyint NOT NULL DEFAULT 0;',
            'ALTER TABLE `solicitudes_abordajes` ADD COLUMN `logistica_refrigerios` tinyint NOT NULL DEFAULT 0;',
            'ALTER TABLE `solicitudes_abordajes` ADD COLUMN `logistica_transporte` tinyint NOT NULL DEFAULT 0;',
        ];

        for (const q of queries) {
            try {
                await connection.query(q);
            } catch (e: any) {
                if (e.code === 'ER_DUP_FIELDNAME') {
                } else {
                    throw e; // rethrow other errors
                }
            }
        }

        // Check if the old columns exist, if so drop them (optional, skip if not needed)
        try {
            await connection.query('ALTER TABLE `solicitudes_abordajes` DROP COLUMN `lugar`, DROP COLUMN `personal`, DROP COLUMN `refrigerios`, DROP COLUMN `transporte`;');
        } catch (e: any) {
            if (e.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
            } else {
                console.error('Error dropping logistica old cols:', e.message);
            }
        }

    } catch (error) {
        console.error('Migration error:', error);
    } finally {
        await connection.end();
    }
}

runManualDbChanges();
