import 'dotenv/config';
import { resolve } from 'path';
import * as dotenv from 'dotenv';
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { consultas } from './src/db/schema/consultas';
import { abordaje } from './src/db/schema/abordajes';
import { enfermedades } from './src/db/schema/enfermedades';
import { medicamentos } from './src/db/schema/medicamentos';
import { eq, count } from 'drizzle-orm';

async function test() {
    console.log("Connecting using:", process.env.DATABASE_HOST);

    // Create connection manually to avoid hoisting db.ts
    const dbConfig = {
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '3306'),
        user: process.env.DATABASE_USER || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'bd_sistema_abordajes',
        ssl: { rejectUnauthorized: false }
    };

    const pool = mysql.createPool(dbConfig);
    const db = drizzle(pool);

    try {
        console.log("Testing getReporteMedicamentos plain select...");
        const res2 = await db.select().from(medicamentos);
        console.log("Medicamentos table ok, rows:", res2.length);

        console.log("Testing error in getReporteMorbilidad totalConsultasQuery...");
        const query = db
            .select({ total: count(consultas.codigoConsulta) })
            .from(consultas)
            .innerJoin(abordaje, eq(consultas.codigoAbordaje, abordaje.codigoAbordaje));

        console.log("SQL:", query.toSQL());
        const res = await query;
        console.log("Success:", res);

    } catch (e) {
        console.error("Caught error! Printing details:");
        console.error(e);
    }
    process.exit(0);
}
test();
