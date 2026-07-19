import { loadEnvConfig } from '@next/env';
import { connection } from './src/db/client';

const projectDir = process.cwd();
loadEnvConfig(projectDir);

async function main() {
    try {
        const [rows] = await connection.query('DESCRIBE tejedores');
        console.log("Tejedores Table Schema:", rows);

        const [migrations] = await connection.query('SELECT * FROM __drizzle_migrations');
        console.log("Migrations applied:", migrations);

    } catch (e) {
        console.error(e);
    } finally {
        await connection.end();
    }
}
main();
