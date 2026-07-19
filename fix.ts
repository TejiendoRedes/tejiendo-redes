import { loadEnvConfig } from '@next/env';
import mysql from 'mysql2/promise';

const projectDir = process.cwd();
loadEnvConfig(projectDir);

async function fix() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DATABASE_HOST,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME,
            port: Number(process.env.DATABASE_PORT) || 3306,
        });

        console.log('Fixing entregas_medicamentos...');
        
        // El problema es que MySQL no permite modificar una tabla con una columna auto-increment sin que sea primary key de forma atómica fácilmente si hay otras PKs.
        // Como es tabla de relación pura, la borraremos para que Drizzle la cree limpia desde cero.
        try {
            await connection.query('DROP TABLE IF EXISTS entregas_medicamentos;');
            console.log('Tabla antigua eliminada. Lista para ser recreada limpia.');
        } catch(e) {
            console.error(e);
        }

    } catch (e) {
        console.error('Fix failed:', e);
    } finally {
        if (connection) await connection.end();
    }
}
fix();
