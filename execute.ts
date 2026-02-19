
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function run() {
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        port: Number(process.env.DATABASE_PORT),
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Adding column...');
        // We use a simpler DEFAULT if (CURRENT_DATE) fails, or just add it and then update
        await connection.query('ALTER TABLE `consultas` ADD `fecha_consulta` date');
        console.log('Updating existing rows...');
        await connection.query('UPDATE `consultas` SET `fecha_consulta` = CURRENT_DATE WHERE `fecha_consulta` IS NULL');
        console.log('Making column NOT NULL...');
        await connection.query('ALTER TABLE `consultas` MODIFY `fecha_consulta` date NOT NULL');
        console.log('✅ Success!');
    } catch (e) {
        console.error('❌ Failed:', e.message);
    } finally {
        await connection.end();
    }
}

run();
