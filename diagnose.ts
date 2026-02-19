
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function diagnose() {
    const { db } = require('./src/db');
    const { consultas } = require('./src/db/schema/consultas');
    const { pacientes } = require('./src/db/schema/pacientes');
    const { eq, sql } = require('drizzle-orm');

    const cedula = '11111';
    console.log(`Diagnosing for cedula: ${cedula}`);

    try {
        const res = await db.select({
            codigoConsulta: consultas.codigoConsulta,
            codigoAbordaje: consultas.codigoAbordaje,
            fechaConsulta: consultas.fechaConsulta,
            cedulaPaciente: consultas.cedulaPaciente,
            pacienteNombre: pacientes.nombrePaciente
        })
            .from(consultas)
            .leftJoin(pacientes, eq(consultas.cedulaPaciente, pacientes.cedulaPaciente))
            .where(eq(consultas.cedulaMedico, cedula));

        console.log('Consultas found:', JSON.stringify(res, null, 2));

        const allConsultas = await db.select().from(consultas).where(eq(consultas.cedulaMedico, cedula));
        console.log('Raw consultas count:', allConsultas.length);
    } catch (e) {
        console.error('Error during diagnosis:', e);
    }
}

diagnose().catch(console.error).finally(() => process.exit());
