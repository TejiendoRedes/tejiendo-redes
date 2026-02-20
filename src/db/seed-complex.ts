import { loadEnvConfig } from '@next/env';
import { sql } from 'drizzle-orm';
import * as schema from './schema';
import {
    VENEZUELAN_STATES,
    SPECIALTIES,
    PATHOLOGIES,
    MEDICINES,
    NAMES,
    SURNAMES,
    TEJEDOR_ROLES,
    getRandomElement,
    getRandomElements,
    getRandomInt,
    generateCedula,
    generatePhoneNumber,
    getRandomDate,
    generateEmail
} from './seeds/utils';

// Load environment variables
const projectDir = process.cwd();
loadEnvConfig(projectDir);

async function main() {

    const { db } = await import('./index');
    const { connection } = await import('./client');

    try {
        // 1. Clean Database (Disable FK checks for truncation)
        await db.execute(sql`SET FOREIGN_KEY_CHECKS = 0`);

        // Order matters for some updates but with FK checks off we can truncate freely
        const tables = [
            schema.consultasEnfermedades,
            schema.medicamentosPacientes,
            schema.tejedoresAbordaje,
            schema.abordajeComunidad,
            schema.consultas,
            schema.pacientes,
            schema.abordaje,
            schema.comunidades,
            schema.responsable,
            schema.medicos,
            schema.tejedores,
            schema.medicamentos,
            schema.enfermedades,
            schema.especialidades,
        ];

        for (const table of tables) {
            // @ts-ignore - Drizzle table type compatibility
            await db.delete(table);
        }

        await db.execute(sql`SET FOREIGN_KEY_CHECKS = 1`);

        // 2. Catalogs

        // Especialidades
        await db.insert(schema.especialidades).values(
            SPECIALTIES.map((nombre, i) => ({
                codigoEspecialidad: `ESP-${String(i + 1).padStart(3, '0')}`,
                nombreEspecialidad: nombre,
                descripcion: `Especialidad médica: ${nombre}`
            }))
        );

        // Enfermedades
        await db.insert(schema.enfermedades).values(
            PATHOLOGIES.map(p => ({
                codigoEnfermedad: p.codigo,
                nombreEnfermedad: p.nombre,
                tipoPatologia: 'General',
                descripcion: p.nombre
            }))
        );

        // Medicamentos
        await db.insert(schema.medicamentos).values(
            MEDICINES.map((m, i) => ({
                codigoMedicamento: `MED-${String(i + 1).padStart(3, '0')}`,
                nombreMedicamento: m.nombre,
                presentacion: m.presentacion,
                descripcion: m.descripcion,
                existencia: getRandomInt(100, 1000)
            }))
        );

        // 3. System Actors (Tejedores)
        const tejedoresData: any[] = [];
        const medicosData: any[] = [];
        const createdTejedorCedulas: Set<string> = new Set();

        // Create 50 Tejedores
        for (let i = 0; i < 50; i++) {
            let cedula = generateCedula();
            while (createdTejedorCedulas.has(cedula)) cedula = generateCedula();
            createdTejedorCedulas.add(cedula);

            const nombre = getRandomElement(NAMES);
            const apellido = getRandomElement(SURNAMES);
            const estadoData = getRandomElement(VENEZUELAN_STATES);
            const municipioData = getRandomElement(estadoData.municipios);
            const parroquia = getRandomElement(municipioData.parroquias);
            const rol = i < 15 ? 'Médico' : getRandomElement(TEJEDOR_ROLES); // Ensure some doctors

            tejedoresData.push({
                cedulaTejedor: cedula,
                nombreTejedor: nombre,
                apellidoTejedor: apellido,
                fechaNacimiento: getRandomDate(new Date('1970-01-01'), new Date('2000-01-01')),
                direccionTejedor: `${municipioData.nombre}, ${parroquia}`,
                municipioTejedor: municipioData.nombre,
                estadoTejedor: estadoData.estado,
                parroquiaTejedor: parroquia,
                telefonoTejedor: generatePhoneNumber(),
                correoTejedor: generateEmail(nombre, apellido),
                profesionTejedor: rol,
                fechaIngreso: getRandomDate(new Date('2020-01-01'), new Date('2023-01-01')),
                tipodeVoluntario: 'Activo'
            });

            if (rol === 'Médico') {
                medicosData.push({
                    cedulaTejedor: cedula,
                    codigoEspecialidad: `ESP-${getRandomInt(1, SPECIALTIES.length).toString().padStart(3, '0')}`,
                    matriculaSanidad: getRandomInt(10000, 99999).toString(),
                    matriculaColegioMedico: getRandomInt(10000, 99999).toString()
                });
            }
        }

        await db.insert(schema.tejedores).values(tejedoresData);
        if (medicosData.length > 0) {
            await db.insert(schema.medicos).values(medicosData);
        }

        // 4. Communities & Responsables
        const comunidadesIds: string[] = [];
        const responsablesData: any[] = [];
        const comunidadesData: any[] = [];
        const createdResponsableCedulas: Set<string> = new Set();

        let comCounter = 1;
        for (const estado of VENEZUELAN_STATES) {
            for (const municipio of estado.municipios) {
                // Create 1-2 communities per municipality
                const numComs = getRandomInt(1, 2);
                for (let k = 0; k < numComs; k++) {
                    let cedulaResp = generateCedula();
                    while (createdResponsableCedulas.has(cedulaResp)) cedulaResp = generateCedula();
                    createdResponsableCedulas.add(cedulaResp);

                    const nombreResp = getRandomElement(NAMES);
                    const apellidoResp = getRandomElement(SURNAMES);

                    // Create Responsable
                    responsablesData.push({
                        cedulaResponsable: cedulaResp,
                        nombreResponsable: nombreResp,
                        apellidoResponsable: apellidoResp,
                        direccionResponsable: `Calle Principal, ${municipio.nombre}`,
                        telefonoResponsable: generatePhoneNumber(),
                        correoResponsable: generateEmail(nombreResp, apellidoResp),
                        cargo: 'Vocero Principal',
                        estado: 'LA',
                        municipio: 'IR',
                        parroquia: 'CA'
                    });

                    // Create Comunidad
                    const comId = `COM-${String(comCounter++).padStart(3, '0')}`;
                    comunidadesIds.push(comId);
                    const parroquia = getRandomElement(municipio.parroquias);

                    comunidadesData.push({
                        codigoComunidad: comId,
                        nombreComunidad: `Comunidad ${getRandomElement(['Esperanza', 'Bolívar', 'Paz', 'Unión', 'Progreso', 'Victoria', 'Amanecer'])} de ${parroquia}`,
                        tipoComunidad: getRandomElement(['1', '2', '3', '4']),
                        estado: estado.estado,
                        municipio: municipio.nombre,
                        parroquia: parroquia,
                        direccion: `Sector ${getRandomElement(['A', 'B', 'Centro', 'Norte', 'Sur'])}`,
                        ubicacionFisica: 'Cerca de la plaza',
                        cedulaResponsable: cedulaResp,
                        cantidadHabitantes: getRandomInt(200, 1000),
                        cantidadFamilias: getRandomInt(50, 200),
                        cantidadNinos: getRandomInt(50, 150),
                        cantidadAdolescentes: getRandomInt(30, 80),
                        cantidadMayores: getRandomInt(20, 60),
                        cantidadMayores60: getRandomInt(10, 40),
                        telefonoComunidad: generatePhoneNumber(),
                    });
                }
            }
        }

        await db.insert(schema.responsable).values(responsablesData);
        await db.insert(schema.comunidades).values(comunidadesData);

        // 5. Patients per Community
        const patientsByCommunity: Record<string, string[]> = {};
        const allPatientsData: any[] = [];
        const createdPatientCedulas: Set<string> = new Set();

        for (const comId of comunidadesIds) {
            patientsByCommunity[comId] = [];
            const numPatients = getRandomInt(40, 80);

            for (let i = 0; i < numPatients; i++) {
                let cedula = generateCedula();
                while (createdPatientCedulas.has(cedula)) cedula = generateCedula();
                createdPatientCedulas.add(cedula);

                const nombre = getRandomElement(NAMES);
                const apellido = getRandomElement(SURNAMES);

                allPatientsData.push({
                    cedulaPaciente: cedula,
                    codigoComunidad: comId,
                    nombrePaciente: nombre,
                    apellidoPaciente: apellido,
                    sexo: getRandomElement(['M', 'F']),
                    fechaNacimiento: getRandomDate(new Date('1950-01-01'), new Date('2022-01-01')),
                    estado: 'LA', // Mock codes matching schema limit 2
                    municipio: 'IR',
                    parroquia: 'CA',
                    direccionPaciente: 'Casa # ' + getRandomInt(1, 99),
                    telefonoPaciente: generatePhoneNumber(),
                    correoPaciente: generateEmail(nombre, apellido),
                    nota: 'Paciente generado automáticamente'
                });
                patientsByCommunity[comId].push(cedula);
            }
        }

        // Split inserts to avoid packet size issues
        const chunkSize = 100;
        for (let i = 0; i < allPatientsData.length; i += chunkSize) {
            await db.insert(schema.pacientes).values(allPatientsData.slice(i, i + chunkSize));
        }

        // 6. Abordajes (History - 3 Years)
        const startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 3);
        const endDate = new Date();

        let currentDate = new Date(startDate);
        let abordajeCounter = 1;
        let consultaCounter = 1;

        // Helper arrays
        const allDoctors = medicosData.map(d => d.cedulaTejedor);
        const allTejedores = tejedoresData.map(t => t.cedulaTejedor);
        const allMedicines = MEDICINES.map((_, i) => `MED-${String(i + 1).padStart(3, '0')}`);
        const allPathologies = PATHOLOGIES.map(p => p.codigo);

        while (currentDate < endDate) {
            // 2-3 Abordajes per month
            const numAbordajes = getRandomInt(2, 3);

            for (let i = 0; i < numAbordajes; i++) {
                // Abordaje Date within current month
                const abdDate = new Date(currentDate);
                abdDate.setDate(getRandomInt(1, 28));
                if (abdDate > endDate) continue;

                const comId = getRandomElement(comunidadesIds);
                const abdCode = `ABD-${String(abordajeCounter++).padStart(3, '0')}`;

                // Create Abordaje
                await db.insert(schema.abordaje).values({
                    codigoAbordaje: abdCode,
                    codigoComunidad: comId,
                    fechaAbordaje: abdDate,
                    horaInicio: '08:00:00',
                    horaFin: '16:00:00',
                    descripcion: `Abordaje médico integral en la comunidad`,
                    tipoAbordaje: 'Integral',
                    estado: 'Finalizado'
                });

                // Link Community
                await db.insert(schema.abordajeComunidad).values({
                    codigoAbordaje: abdCode,
                    codigoComunidad: comId,
                    observaciones: 'Abordaje exitoso'
                });

                // Link Tejedores (8-12 participants)
                const abordajeTejedores = getRandomElements(allTejedores, getRandomInt(8, 12));
                await db.insert(schema.tejedoresAbordaje).values(
                    abordajeTejedores.map(cedula => ({
                        codigoAbordaje: abdCode,
                        cedulaTejedor: cedula,
                        rolEnAbordaje: allDoctors.includes(cedula) ? 'Médico' : 'Apoyo'
                    }))
                );

                // Consultations & Deliveries
                // 60-80% of patients get attended
                const communityPatients = patientsByCommunity[comId];
                const patientsAttended = getRandomElements(communityPatients, Math.floor(communityPatients.length * getRandomInt(6, 8) / 10));

                const consultasBatch: any[] = [];
                const consultasEnfermedadesBatch: any[] = [];
                const medicamentosPacientesBatch: any[] = [];

                for (const pacienteCedula of patientsAttended) {
                    const doctorCedula = getRandomElement(allDoctors); // Ensure we have a doctor
                    if (!doctorCedula) continue; // Should not happen if we seeded doctors

                    const consCode = `CON-${String(consultaCounter++).padStart(6, '0')}`;

                    consultasBatch.push({
                        codigoConsulta: consCode,
                        codigoAbordaje: abdCode,
                        cedulaPaciente: pacienteCedula,
                        cedulaMedico: doctorCedula,
                        motivoConsulta: 'Chequeo general y malestar',
                        diagnosticoTexto: 'Paciente presenta síntomas virales leves.',
                        recomendaciones: 'Reposo, hidratación y medicación.',
                        tratamiento: 'Acetaminofén y suero.',
                        tensionArterial: `${getRandomInt(110, 130)}/${getRandomInt(70, 90)}`
                    });

                    // Pathologies (1-2)
                    const patientPathologies = getRandomElements(allPathologies, getRandomInt(1, 2));
                    for (const pathCode of patientPathologies) {
                        consultasEnfermedadesBatch.push({
                            codigoConsulta: consCode,
                            codigoEnfermedad: pathCode,
                            observacionEspecifica: 'Leve'
                        });
                    }

                    // Medicines (1-2)
                    const patientMedicines = getRandomElements(allMedicines, getRandomInt(1, 2));
                    for (const medCode of patientMedicines) {
                        medicamentosPacientesBatch.push({
                            codigoMedicamento: medCode,
                            cedulaPaciente: pacienteCedula,
                            codigoAbordaje: abdCode,
                            fechaEntrega: abdDate,
                            cantidadEntregada: getRandomInt(1, 3),
                            cedulaTejedor: getRandomElement(abordajeTejedores) // Who delivered it
                        });
                    }
                }

                // Execute batches
                if (consultasBatch.length) await db.insert(schema.consultas).values(consultasBatch);
                if (consultasEnfermedadesBatch.length) await db.insert(schema.consultasEnfermedades).values(consultasEnfermedadesBatch);
                if (medicamentosPacientesBatch.length) await db.insert(schema.medicamentosPacientes).values(medicamentosPacientesBatch);
            }

            // Advance month
            currentDate.setMonth(currentDate.getMonth() + 1);
        }

        process.exit(0);

    } catch (error) {
        console.error('❌ Error during seeding:', error);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

main();
