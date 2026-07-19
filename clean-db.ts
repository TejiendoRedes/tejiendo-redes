import { loadEnvConfig } from '@next/env';
import mysql from 'mysql2/promise';

const projectDir = process.cwd();
loadEnvConfig(projectDir);

async function cleanDB() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DATABASE_HOST,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME,
            port: Number(process.env.DATABASE_PORT) || 3306,
        });

        console.log('Limpiando base de datos completamente...');
        
        await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
        
        const [rows] = await connection.query('SHOW TABLES');
        const dbName = process.env.DATABASE_NAME || 'defaultdb';
        const key = `Tables_in_${dbName}`;
        
        for (const row of rows as any[]) {
            // Find the first value since the key might vary depending on case
            const tableName = Object.values(row)[0];
            if (tableName) {
                console.log(`Borrando ${tableName}...`);
                await connection.query(`DROP TABLE IF EXISTS \`${tableName}\``);
            }
        }
        
        await connection.query('SET FOREIGN_KEY_CHECKS = 1;');
        console.log('✅ Base de datos limpia.');

    } catch (e) {
        console.error('Error:', e);
    } finally {
        if (connection) await connection.end();
    }
}
cleanDB();
