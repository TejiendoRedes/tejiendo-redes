import dotenv from 'dotenv';
import path from 'path';

const envPath = 'c:/Users/erasm/OneDrive/Desktop/tejiendo-redes/.env.local';
const result = dotenv.config({ path: envPath });

console.log('Dotenv result:', result.parsed ? 'Success' : 'Failed');
if (result.error) console.error('Dotenv error:', result.error);

// Import everything else AFTER dotenv
import { db } from './src/db';
import { abordaje, consultas } from './src/db/schema';
import { count } from 'drizzle-orm';

async function check() {
    try {
        console.log('Connecting to:', process.env.DATABASE_HOST);
        const abordajes = await db.select().from(abordaje);
        console.log('--- Abordajes ---');
        abordajes.forEach(a => console.log(`${a.codigoAbordaje}: ${a.estado} (${a.fechaAbordaje})`));

        const totalConsultas = await db.select({ val: count() }).from(consultas);
        console.log('\n--- Total Consultas ---');
        console.log(totalConsultas[0].val);

        const consultasPerAbordaje = await db.select({
            codigo: consultas.codigoAbordaje,
            num: count()
        }).from(consultas).groupBy(consultas.codigoAbordaje);
        console.log('\n--- Consultas por Abordaje ---');
        consultasPerAbordaje.forEach(c => console.log(`${c.codigo}: ${c.num}`));
    } catch (e) {
        console.error('Error in check():', e);
    }

    process.exit(0);
}

check();
