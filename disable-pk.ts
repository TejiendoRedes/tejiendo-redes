import { loadEnvConfig } from '@next/env';
import mysql from 'mysql2/promise';

const projectDir = process.cwd();
loadEnvConfig(projectDir);

async function disablePKRequirement() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DATABASE_HOST,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME,
            port: Number(process.env.DATABASE_PORT) || 3306,
        });

        console.log('Desactivando require_primary_key globalmente...');
        
        try {
            await connection.query('SET GLOBAL sql_require_primary_key = 0;');
            console.log('✅ sql_require_primary_key desactivado globalmente.');
        } catch (e: any) {
            console.log('No se pudo hacer globalmente (falta de permisos), intentando SET PERSIST...');
            try {
                await connection.query('SET PERSIST sql_require_primary_key = 0;');
                console.log('✅ sql_require_primary_key desactivado (persist).');
            } catch (e2: any) {
                console.log('No se pudo desactivar persistente.', e2.message);
            }
        }

    } catch (e) {
        console.error('Error connecting:', e);
    } finally {
        if (connection) await connection.end();
    }
}
disablePKRequirement();
