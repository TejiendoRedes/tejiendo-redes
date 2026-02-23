
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function check() {
    const { db } = await import('./src/db');
    const { sql } = await import('drizzle-orm');
    try {
        const [rows] = await db.execute(sql`DESCRIBE consultas`);
        console.log(JSON.stringify(rows, null, 2));
    } catch (e: any) {
        console.error('Error executing query:', e.message);
    }
    process.exit(0);
}

check();
