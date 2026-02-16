import { loadEnvConfig } from '@next/env';
import { sql } from 'drizzle-orm';

// Load environment variables
const projectDir = process.cwd();
loadEnvConfig(projectDir);

async function checkData() {
    console.log('🔍 Verifying Seed Data...');

    const { db } = await import('./index');
    const { connection } = await import('./client');

    try {
        // 1. Count Records
        const [counts]: any = await db.execute(sql`
            SELECT 
                (SELECT COUNT(*) FROM comunidades) as comunidades,
                (SELECT COUNT(*) FROM pacientes) as pacientes,
                (SELECT COUNT(*) FROM tejedores) as tejedores,
                (SELECT COUNT(*) FROM abordaje) as abordajes,
                (SELECT COUNT(*) FROM consultas) as consultas,
                (SELECT COUNT(*) FROM medicamentos_pacientes) as entregas
        `);
        console.log('📊 Record Counts:', counts[0]);

        // 2. Check Date Range
        const [dates]: any = await db.execute(sql`
            SELECT 
                MIN(fecha_abordaje) as first_abordaje,
                MAX(fecha_abordaje) as last_abordaje
            FROM abordaje
        `);
        console.log('📅 Date Range:', dates[0]);

        // 3. Verify Relationships (Orphans)
        const [orphans]: any = await db.execute(sql`
             SELECT 
                (SELECT COUNT(*) FROM consultas WHERE codigo_abordaje NOT IN (SELECT codigo_abordaje FROM abordaje)) as orphaned_consultas,
                (SELECT COUNT(*) FROM medicamentos_pacientes WHERE codigo_abordaje NOT IN (SELECT codigo_abordaje FROM abordaje)) as orphaned_deliveries
        `);
        console.log('🔗 Orphaned Records:', orphans[0]);

        // 4. Sample Data
        const [sample]: any = await db.execute(sql`
            SELECT 
                c.codigo_consulta,
                a.fecha_abordaje,
                p.nombre_paciente,
                t.nombre_tejedor as medico
            FROM consultas c
            JOIN abordaje a ON c.codigo_abordaje = a.codigo_abordaje
            JOIN pacientes p ON c.cedula_paciente = p.cedula_paciente
            JOIN tejedores t ON c.cedula_medico = t.cedula_tejedor
            LIMIT 3
        `);
        console.log('🧪 Sample Consultations:', sample);

        process.exit(0);
    } catch (error) {
        console.error('❌ Verification failed:', error);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

checkData();
