import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

async function main() {
    const { db } = await import('./src/db');
    const { sql } = await import('drizzle-orm');
    console.log("Altering solicitudes_abordajes for comunidad_sugerida...");
    try {
        await db.execute(sql`SET FOREIGN_KEY_CHECKS=0;`);
        
        await db.execute(sql`ALTER TABLE solicitudes_abordajes MODIFY COLUMN codigo_comunidad VARCHAR(20) NULL;`);
        console.log("codigo_comunidad made nullable.");
        
        // Add if not exists
        try {
            await db.execute(sql`ALTER TABLE solicitudes_abordajes ADD COLUMN comunidad_sugerida VARCHAR(255) NULL;`);
            console.log("comunidad_sugerida added.");
        } catch (e: any) {
            if (e.message.includes("Duplicate column name")) {
                console.log("comunidad_sugerida already exists.");
            } else {
                throw e;
            }
        }
        
        await db.execute(sql`SET FOREIGN_KEY_CHECKS=1;`);
        console.log("Done.");
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

main();
