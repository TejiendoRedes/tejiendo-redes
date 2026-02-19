import mysql from 'mysql2/promise';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

async function applyFix() {
    console.log('🚀 Aplicando corrección de esquema directamente...');

    console.log('🔍 Environment check:', {
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        port: process.env.DATABASE_PORT,
    });

    try {
        console.log('📡 Attempting to create connection with SSL...');
        const connection = await mysql.createConnection({
            host: process.env.DATABASE_HOST!,
            user: process.env.DATABASE_USER!,
            password: process.env.DATABASE_PASSWORD!,
            database: process.env.DATABASE_NAME!,
            port: Number(process.env.DATABASE_PORT),
            ssl: {
                rejectUnauthorized: false
            },
            connectTimeout: 10000 // 10 seconds timeout
        });
        console.log('✅ Connected to database');

        const statements = [
            "ALTER TABLE `responsable` MODIFY COLUMN `estado` varchar(10) NOT NULL",
            "ALTER TABLE `responsable` MODIFY COLUMN `municipio` varchar(20) NOT NULL",
            "ALTER TABLE `responsable` MODIFY COLUMN `parroquia` varchar(20) NOT NULL",
            "ALTER TABLE `pacientes` MODIFY COLUMN `estado` varchar(10) NOT NULL",
            "ALTER TABLE `pacientes` MODIFY COLUMN `municipio` varchar(20) NOT NULL",
            "ALTER TABLE `pacientes` MODIFY COLUMN `parroquia` varchar(20) NOT NULL"
        ];

        for (const sql of statements) {
            console.log(`📝 Executing: ${sql}`);
            await connection.query(sql);
        }

        console.log('✅ Cambio de esquema completado exitosamente!');
        await connection.end();
        console.log('🔌 Conexión cerrada');
        process.exit(0);
    } catch (error: any) {
        console.error('❌ Error applying fix:', error.message || error);
        process.exit(1);
    }
}

applyFix().catch(err => {
    console.error('💥 Unhandled error:', err);
    process.exit(1);
});
