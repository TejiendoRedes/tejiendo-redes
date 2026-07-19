import { config } from 'dotenv';
config({ path: '.env' });
config({ path: '.env.local' });

import { db } from './index';
import { sql } from 'drizzle-orm';
import { connection } from './client';

async function run() {
    try {
        await db.execute(sql`ALTER TABLE tejedores MODIFY COLUMN nombre_tejedor VARCHAR(30) NOT NULL;`);
        await db.execute(sql`ALTER TABLE tejedores MODIFY COLUMN apellido_tejedor VARCHAR(30) NOT NULL;`);
        await db.execute(sql`ALTER TABLE tejedores MODIFY COLUMN direccion_tejedor VARCHAR(150) NOT NULL;`);

        await db.execute(sql`ALTER TABLE aspirantes MODIFY COLUMN nombre_aspirante VARCHAR(30) NOT NULL;`);
        await db.execute(sql`ALTER TABLE aspirantes MODIFY COLUMN apellido_aspirante VARCHAR(30) NOT NULL;`);
        await db.execute(sql`ALTER TABLE aspirantes MODIFY COLUMN direccion_aspirante VARCHAR(150) NOT NULL;`);

        await db.execute(sql`ALTER TABLE pacientes MODIFY COLUMN nombre_paciente VARCHAR(30) NOT NULL;`);
        await db.execute(sql`ALTER TABLE pacientes MODIFY COLUMN apellido_paciente VARCHAR(30) NOT NULL;`);
        await db.execute(sql`ALTER TABLE pacientes MODIFY COLUMN direccion_paciente VARCHAR(150) NOT NULL;`);

        await db.execute(sql`ALTER TABLE responsable MODIFY COLUMN nombre_responsable VARCHAR(30) NOT NULL;`);
        await db.execute(sql`ALTER TABLE responsable MODIFY COLUMN apellido_responsable VARCHAR(30) NOT NULL;`);
        await db.execute(sql`ALTER TABLE responsable MODIFY COLUMN direccion_responsable VARCHAR(150) NOT NULL;`);

        await db.execute(sql`ALTER TABLE comunidades MODIFY COLUMN direccion VARCHAR(150) NOT NULL;`);

        await db.execute(sql`ALTER TABLE users MODIFY COLUMN password VARCHAR(100) NOT NULL;`);

        await db.execute(sql`ALTER TABLE medicamentos MODIFY COLUMN descripcion VARCHAR(150) NOT NULL;`);
        await db.execute(sql`ALTER TABLE especialidades MODIFY COLUMN descripcion VARCHAR(150) NOT NULL;`);
        await db.execute(sql`ALTER TABLE enfermedades MODIFY COLUMN descripcion VARCHAR(150);`);
        
        await db.execute(sql`ALTER TABLE movimientos_inventario MODIFY COLUMN motivo VARCHAR(100);`);

        await db.execute(sql`ALTER TABLE entregas_medicamentos MODIFY COLUMN codigo_abordaje VARCHAR(12) NULL;`);

        console.log('Modified all varchar column sizes');
    } catch(e) {
        console.error('Error modifying columns:', e);
    }

    console.log('Success');
    await connection.end();
}
run();
