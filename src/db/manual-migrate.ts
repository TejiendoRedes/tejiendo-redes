import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

import { connection } from './client';
import { sql } from 'drizzle-orm';

async function main() {
    const { db } = await import('./index');

    try {
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS \`abordaje_asistencia\` (
                \`id\` bigint unsigned AUTO_INCREMENT NOT NULL,
                \`codigo_abordaje\` varchar(10) NOT NULL,
                \`cedula_paciente\` varchar(12) NOT NULL,
                \`hora_llegada\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`estado\` enum('En Espera','En Triaje','En Consulta','En Farmacia','Finalizado') NOT NULL DEFAULT 'En Espera',
                \`servicios_requeridos\` text,
                \`notas\` text,
                CONSTRAINT \`abordaje_asistencia_id\` PRIMARY KEY(\`id\`),
                CONSTRAINT \`fk_asistencia_abordaje\` FOREIGN KEY (\`codigo_abordaje\`) REFERENCES \`abordaje\`(\`codigo_abordaje\`) ON DELETE CASCADE ON UPDATE CASCADE,
                CONSTRAINT \`fk_asistencia_paciente\` FOREIGN KEY (\`cedula_paciente\`) REFERENCES \`pacientes\`(\`cedula_paciente\`) ON DELETE RESTRICT ON UPDATE CASCADE
            );
        `);

        // Indexes
        try {
            await db.execute(sql`CREATE INDEX \`idx_asistencia_abordaje\` ON \`abordaje_asistencia\` (\`codigo_abordaje\`);`);
        } catch (e) { }
        try {
            await db.execute(sql`CREATE INDEX \`idx_asistencia_paciente\` ON \`abordaje_asistencia\` (\`cedula_paciente\`);`);
        } catch (e) { }
        try {
            await db.execute(sql`CREATE INDEX \`idx_asistencia_estado\` ON \`abordaje_asistencia\` (\`estado\`);`);
        } catch (e) { }


    } catch (e) {
        console.error('Error:', e);
    } finally {
        process.exit(0);
    }
}

main();
