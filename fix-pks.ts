import { loadEnvConfig } from '@next/env';
import mysql from 'mysql2/promise';

const projectDir = process.cwd();
loadEnvConfig(projectDir);

async function fixPKs() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DATABASE_HOST,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME,
            port: Number(process.env.DATABASE_PORT) || 3306,
        });

        console.log('Haciendo backup de tablas con problemas de Primary Key...');
        
        const tablesToFix = ['consultas_enfermedades', 'tejedores_abordaje'];
        
        for (const table of tablesToFix) {
            try {
                // Check if table exists
                const [rows] = await connection.query(`SHOW TABLES LIKE '${table}'`);
                if ((rows as any[]).length === 0) continue;

                const backupTable = `${table}_backup`;
                
                console.log(`Guardando datos de ${table}...`);
                await connection.query(`DROP TABLE IF EXISTS ${backupTable};`);
                await connection.query(`CREATE TABLE ${backupTable} AS SELECT * FROM ${table};`);
                
                console.log(`Eliminando ${table} para que Drizzle la recree limpia...`);
                await connection.query(`DROP TABLE ${table};`);
            } catch(e) {
                console.error(`Error procesando ${table}:`, e);
            }
        }
        
        console.log('✅ Tablas conflictivas respaldadas y eliminadas. Listo para npm run db:push');

    } catch (e) {
        console.error('Error:', e);
    } finally {
        if (connection) await connection.end();
    }
}
fixPKs();
