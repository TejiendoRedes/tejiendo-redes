import { drizzle } from 'drizzle-orm/mysql2';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

/**
 * Script para aplicar migraciones a la base de datos
 * Este es el enfoque profesional - usa archivos de migración versionados
 */
async function runMigrations() {
    console.log('🚀 Iniciando proceso de migraciones...\n');

    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST!,
        user: process.env.DATABASE_USER!,
        password: process.env.DATABASE_PASSWORD!,
        database: process.env.DATABASE_NAME!,
        port: Number(process.env.DATABASE_PORT),
        multipleStatements: true,
    });

    const db = drizzle(connection);

    try {
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
        await connection.end();
    }
}

runMigrations();
