import 'dotenv/config';
import { loadEnvConfig } from '@next/env';
import { sql } from 'drizzle-orm';
import { getNextCode } from '../src/lib/id-generator';

const projectDir = process.cwd();
loadEnvConfig(projectDir);

async function runQA() {
    console.log("🛠️  Iniciando pruebas QA automatizadas en la base de datos...\n");
    
    const { db } = await import('../src/db/index');
    const { medicamentos, solicitudesAbordajes } = await import('../src/db/schema');

    try {
        // PRUEBA 1: Insertar medicamento con texto largo (> 150 caracteres)
        console.log("▶️  PRUEBA 1: Longitud de 'descripcion_medicamento' (varchar 255)");
        const longText = "Esta es una descripción extremadamente larga de prueba. Sirve para validar que la base de datos ahora permite hasta doscientos cincuenta caracteres sin lanzar un error 500 como sucedía antes de las correcciones de schema de Drizzle. Esto es un exito.";
        console.log(`Intentando insertar texto de ${longText.length} caracteres...`);
        
        const newCode = await getNextCode(medicamentos, medicamentos.codigoMedicamento, 'MED-');
        
        await db.insert(medicamentos).values({
            codigoMedicamento: newCode,
            nombreMedicamento: "Paracetamol QA",
            presentacion: "Tableta QA",
            descripcion: longText,
            existencia: 100,
            precio: 0
        });
        console.log("✅ PRUEBA 1 SUPERADA: El registro fue insertado exitosamente sin errores de longitud.\n");


        // PRUEBA 2: Insertar solicitud sin fecha para probar default now()
        console.log("▶️  PRUEBA 2: Fecha de Solicitud Automática (default now())");
        const newCodeSAB = await getNextCode(solicitudesAbordajes, solicitudesAbordajes.codigoSolicitud, 'SAB-');
        
        await db.insert(solicitudesAbordajes).values({
            codigoSolicitud: newCodeSAB,
            tipoAbordaje: "Médico",
            // NOTA: No le pasamos 'fechaSolicitud' a propósito para probar el default de la BD
            fechaSugerida: new Date(),
            horaInicioSugerida: "08:00:00",
            descripcionActividad: "Actividad de QA automatizada",
            participantesEstimados: 50,
            estado: "Pendiente"
        });
        console.log("✅ PRUEBA 2 SUPERADA: El registro fue insertado exitosamente usando la fecha automática de la BD.\n");

        console.log("🎉 TODAS LAS PRUEBAS QA FUERON EXITOSAS.");
    } catch (e) {
        console.error("❌ ERROR EN QA:", e);
    }
    process.exit(0);
}

runQA();
