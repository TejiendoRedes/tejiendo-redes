import { loadEnvConfig } from '@next/env';
import mysql from 'mysql2/promise';

const projectDir = process.cwd();
loadEnvConfig(projectDir);

async function rename() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DATABASE_HOST,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME,
            port: Number(process.env.DATABASE_PORT) || 3306,
        });

        console.log('Renaming medicamentos_pacientes to entregas_medicamentos...');
        
        // Check if entregas_medicamentos exists and drop it if empty to allow rename
        try {
            await connection.query('DROP TABLE IF EXISTS entregas_medicamentos;');
        } catch(e) {}

        await connection.query('RENAME TABLE medicamentos_pacientes TO entregas_medicamentos;');
        console.log('Rename successful!');
    } catch (e) {
        console.error('Rename failed:', e);
    } finally {
        if (connection) await connection.end();
    }
}
rename();
