
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function migrate() {
    const { db } = await import('./src/db');
    const { sql } = await import('drizzle-orm');
    console.log('Adding hora_consulta column to consultas table...');
    try {
        await db.execute(sql`ALTER TABLE consultas ADD COLUMN hora_consulta VARCHAR(20) AFTER fecha_consulta`);
        console.log('✅ Column added successfully!');
    } catch (e: any) {
        console.error('❌ Error executing query:', e.message);
    }
    process.exit(0);
}

migrate();
