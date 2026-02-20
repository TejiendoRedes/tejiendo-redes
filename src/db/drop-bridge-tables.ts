import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

/**
 * Script para eliminar tablas de relación (bridge tables)
 * 
 * Útil cuando necesitas recrear las tablas de relación
 * sin perder los datos de las tablas principales.
 */
async function dropBridgeTables() {

    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST!,
        user: process.env.DATABASE_USER!,
        password: process.env.DATABASE_PASSWORD!,
        database: process.env.DATABASE_NAME!,
        port: Number(process.env.DATABASE_PORT),
        multipleStatements: true,
    });

    try {
        // Desactivar temporalmente las verificaciones de claves foráneas
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        const bridgeTables = [
            'abordaje_comunidad',
            'consultas_enfermedades',
            'medicamentos_pacientes',
            'tejedores_abordaje'
        ];

        for (const table of bridgeTables) {
            await connection.query(`DROP TABLE IF EXISTS \`${table}\``);
        }

        // Reactivar las verificaciones de claves foráneas
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');


    } catch (error) {
        console.error('❌ Error al eliminar tablas:', error);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

dropBridgeTables();
