import { drizzle } from 'drizzle-orm/mysql2';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import mysql from 'mysql2/promise';
import { loadEnvConfig } from '@next/env';
import path from 'path';

// Load environment variables correctly for Next.js
loadEnvConfig(process.cwd());

/**
 * Script para aplicar migraciones a la base de datos
 * Este es el enfoque profesional - usa archivos de migración versionados
 */
async function runMigrations() {
    console.log('🚀 Iniciando proceso de migraciones...\n');
    console.log('Environment check:', {
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        port: process.env.DATABASE_PORT,
        db: process.env.DATABASE_NAME
    });

    let connection;

    try {
        connection = await mysql.createConnection({
            host: process.env.DATABASE_HOST!,
            user: process.env.DATABASE_USER!,
            password: process.env.DATABASE_PASSWORD!,
            database: process.env.DATABASE_NAME!,
            port: Number(process.env.DATABASE_PORT),
            multipleStatements: true,
            ssl: {
                rejectUnauthorized: false
            }
        });
        console.log('✅ Connected to database');

        // Disable sql_require_primary_key for this session 
        // to prevent issues with Drizzle's migration scripts
        await connection.query('SET SESSION sql_require_primary_key = 0;');

        const db = drizzle(connection);

        console.log('📝 Aplicando migraciones...');

        // Aplica todas las migraciones pendientes desde la carpeta ./drizzle
        await migrate(db, {
            migrationsFolder: path.join(process.cwd(), 'drizzle'),
        });

        console.log('✅ Migraciones aplicadas exitosamente!\n');
    } catch (error) {
        console.error('❌ Error al aplicar migraciones:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Conexión cerrada');
        }
    }
}

runMigrations().catch(err => {
    console.error('Unhandled error in runMigrations top-level:', err);
    process.exit(1);
});
