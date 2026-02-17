const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config({ path: 'c:/Users/erasm/OneDrive/Desktop/tejiendo-redes/.env.local' });

async function check() {
    const config = {
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT),
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
    };

    console.log('Connecting to:', config.host);
    const connection = await mysql.createConnection(config);

    try {
        const [abordajes] = await connection.execute('SELECT codigo_abordaje, estado, fecha_abordaje FROM abordaje');
        console.log('\n--- Abordajes ---');
        abordajes.forEach(a => console.log(`${a.codigo_abordaje}: ${a.estado} (${a.fecha_abordaje})`));

        const [consultasCount] = await connection.execute('SELECT COUNT(*) as count FROM consultas');
        console.log('\n--- Total Consultas ---');
        console.log(consultasCount[0].count);

        const [consultasPerAbordaje] = await connection.execute('SELECT codigo_abordaje, COUNT(*) as count FROM consultas GROUP BY codigo_abordaje');
        console.log('\n--- Consultas por Abordaje ---');
        consultasPerAbordaje.forEach(c => console.log(`${c.codigo_abordaje}: ${c.count}`));
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await connection.end();
    }
}

check();
stone: 1
