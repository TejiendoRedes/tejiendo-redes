import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { db } from './src/db';
import { sql } from 'drizzle-orm';

async function main() {
    console.log("Altering varchar lengths to 20 for codigo_comunidad...");
    try {
        // Need to drop foreign keys first? Let's just try to alter.
        // Wait, MySQL might block modifying a referenced column or a referencing column if the foreign key constraint enforces identical types, which it does.
        // We have to disable foreign key checks first.
        await db.execute(sql`SET FOREIGN_KEY_CHECKS=0;`);
        
        await db.execute(sql`ALTER TABLE comunidades MODIFY COLUMN codigo_comunidad VARCHAR(20) NOT NULL;`);
        console.log("comunidades altered.");
        await db.execute(sql`ALTER TABLE pacientes MODIFY COLUMN codigo_comunidad VARCHAR(20) NOT NULL;`);
        console.log("pacientes altered.");
        await db.execute(sql`ALTER TABLE abordaje MODIFY COLUMN codigo_comunidad VARCHAR(20) NOT NULL;`);
        console.log("abordaje altered.");
        await db.execute(sql`ALTER TABLE abordaje_comunidad MODIFY COLUMN codigo_comunidad VARCHAR(20) NOT NULL;`);
        console.log("abordaje_comunidad altered.");
        await db.execute(sql`ALTER TABLE solicitudes_abordajes MODIFY COLUMN codigo_comunidad VARCHAR(20) NOT NULL;`);
        console.log("solicitudes_abordajes altered.");
        
        await db.execute(sql`SET FOREIGN_KEY_CHECKS=1;`);
        console.log("Done.");
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

main();
