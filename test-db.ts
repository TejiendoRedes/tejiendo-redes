import { db } from './src/db';
import { medicamentos } from './src/db/schema/medicamentos';
import { abordaje } from './src/db/schema/abordajes';

async function test() {
    try {
        console.log("Testing query on medicamentos table...");
        const res = await db.select().from(medicamentos);
        console.log("Success:", res);

        console.log("Testing query on abordaje table...");
        const res2 = await db.select().from(abordaje);
        console.log("Success:", res2);
    } catch (e) {
        console.error("Query failed with error:");
        console.error(e);
    }
    process.exit(0);
}

test();
