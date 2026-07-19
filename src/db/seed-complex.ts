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
        console.log('1. Starting Seed Process');
        // 1. Clean Database (Disable FK checks for truncation)
        await db.execute(sql`SET FOREIGN_KEY_CHECKS = 0`);
        console.log('2. Disabled FK checks');

        // Truncation is handled by clean-db.ts now to avoid unconstrained delete issues

        await db.execute(sql`SET FOREIGN_KEY_CHECKS = 1`);

        // 1.5 Geographic Data
        const estadosMap = new Map<string, number>();
        const municipiosMap = new Map<string, number>();
        const parroquiasMap = new Map<string, number>();
        
        let estadoCounter = 1;
        let municipioCounter = 1;
        let parroquiaCounter = 1;

        const allParroquiasIds: number[] = [];

        console.log('Fetching full Venezuela geographic data...');
        const geoResponse = await fetch('https://raw.githubusercontent.com/CodersVenezuela/Venezuela-JSON/master/venezuela.json');
        if (!geoResponse.ok) throw new Error('Failed to fetch geographic data');
        const VENEZUELAN_STATES_FULL = await geoResponse.json();
        
        console.log('Injecting geographic data (24 estados, 335 municipios, 1136 parroquias)...');
        
        const estadosToInsert: any[] = [];
        const municipiosToInsert: any[] = [];
        const parroquiasToInsert: any[] = [];
        
        for (const estadoData of VENEZUELAN_STATES_FULL) {
            estadosToInsert.push({ id: estadoCounter, nombre: estadoData.estado });
            estadosMap.set(estadoData.estado, estadoCounter);
            
            for (const municipioData of estadoData.municipios) {
                municipiosToInsert.push({ id: municipioCounter, estadoId: estadoCounter, nombre: municipioData.municipio });
                municipiosMap.set(municipioData.municipio, municipioCounter);
                
                for (const parroquiaName of municipioData.parroquias) {
                    parroquiasToInsert.push({ id: parroquiaCounter, municipioId: municipioCounter, nombre: parroquiaName });
                    parroquiasMap.set(parroquiaName, parroquiaCounter);
                    allParroquiasIds.push(parroquiaCounter);
                    parroquiaCounter++;
                }
                municipioCounter++;
            }
            estadoCounter++;
        }
        
        // Batch insert to prevent ECONNRESET
        await db.insert(schema.estados).values(estadosToInsert);
        
        const chunk = 100;
        for (let i = 0; i < municipiosToInsert.length; i += chunk) {
            await db.insert(schema.municipios).values(municipiosToInsert.slice(i, i + chunk));
        }
        
        for (let i = 0; i < parroquiasToInsert.length; i += chunk) {
            await db.insert(schema.parroquias).values(parroquiasToInsert.slice(i, i + chunk));
        }
        
        console.log(`Geographic injection complete: ${estadoCounter-1} estados, ${municipioCounter-1} municipios, ${parroquiaCounter-1} parroquias.`);

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
            const rol = i < 15 ? 'Médico' : getRandomElement(TEJEDOR_ROLES);

            tejedoresData.push({
                cedulaTejedor: cedula,
                nombreTejedor: nombre,
                apellidoTejedor: apellido,
                fechaNacimiento: getRandomDate(new Date('1970-01-01'), new Date('2000-01-01')),
                direccionTejedor: 'Direccion aleatoria',
                parroquiaId: getRandomElement(allParroquiasIds),
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
        // Limit dummy communities to 10 random municipalities to avoid blowing up DB size
        const allMunicipiosArray: any[] = [];
        for (const estado of VENEZUELAN_STATES_FULL) {
            allMunicipiosArray.push(...estado.municipios);
        }
        const randomMunicipios = getRandomElements(allMunicipiosArray, 10);

        for (const municipio of randomMunicipios) {
            const numComs = getRandomInt(1, 2);
            for (let k = 0; k < numComs; k++) {
                let cedulaResp = generateCedula();
                while (createdResponsableCedulas.has(cedulaResp)) cedulaResp = generateCedula();
                createdResponsableCedulas.add(cedulaResp);

                const nombreResp = getRandomElement(NAMES);
                const apellidoResp = getRandomElement(SURNAMES);
                const parroquiaName = getRandomElement(municipio.parroquias);
                    const parroquiaId = parroquiasMap.get(parroquiaName) || getRandomElement(allParroquiasIds);

                    // Create Responsable
                    responsablesData.push({
                        cedulaResponsable: cedulaResp,
                        nombreResponsable: nombreResp,
                        apellidoResponsable: apellidoResp,
                        direccionResponsable: `Calle Principal, ${municipio.municipio}`,
                        telefonoResponsable: generatePhoneNumber(),
                        correoResponsable: generateEmail(nombreResp, apellidoResp),
                        cargo: 'Vocero Principal',
                        parroquiaId: parroquiaId
                    });

                    // Create Comunidad
                    const comId = `COM-${String(comCounter++).padStart(3, '0')}`;
                    comunidadesIds.push(comId);

                    comunidadesData.push({
                        codigoComunidad: comId,
                        nombreComunidad: `Comunidad ${getRandomElement(['Esperanza', 'Bolívar', 'Paz', 'Unión', 'Progreso'])} de ${parroquiaName}`,
                        tipoComunidad: getRandomElement(['1', '2', '3', '4']),
                        parroquiaId: parroquiaId,
                        direccion: `Sector ${getRandomElement(['A', 'B', 'Centro', 'Norte', 'Sur'])}`,
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
                    direccionPaciente: 'Casa # ' + getRandomInt(1, 99),
                    telefonoPaciente: generatePhoneNumber(),
                    correoPaciente: generateEmail(nombre, apellido)
                });
                patientsByCommunity[comId].push(cedula);
            }
        }

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

        const allDoctors = medicosData.map(d => d.cedulaTejedor);
        const allTejedores = tejedoresData.map(t => t.cedulaTejedor);
        const allMedicines = MEDICINES.map((_, i) => `MED-${String(i + 1).padStart(3, '0')}`);
        const allPathologies = PATHOLOGIES.map(p => p.codigo);

        while (currentDate < endDate) {
            const numAbordajes = getRandomInt(2, 3);

            for (let i = 0; i < numAbordajes; i++) {
                const abdDate = new Date(currentDate);
                abdDate.setDate(getRandomInt(1, 28));
                if (abdDate > endDate) continue;

                const comId = getRandomElement(comunidadesIds);
                const abdCode = `ABD-${String(abordajeCounter++).padStart(3, '0')}`;

                await db.insert(schema.abordaje).values({
                    codigoAbordaje: abdCode,
                    codigoComunidad: comId,
                    fechaAbordaje: abdDate,
                    horaInicio: '08:00:00',
                    horaFin: '16:00:00',
                    descripcion: 'Abordaje médico integral en la comunidad',
                    tipoAbordaje: 'Integral',
                    estado: 'Finalizado',
                    observacionesComunidad: 'Abordaje exitoso'
                });

                const abordajeTejedores = getRandomElements(allTejedores, getRandomInt(8, 12));
                await db.insert(schema.tejedoresAbordaje).values(
                    abordajeTejedores.map(cedula => ({
                        codigoAbordaje: abdCode,
                        cedulaTejedor: cedula,
                        rolEnAbordaje: allDoctors.includes(cedula) ? 'Médico' : 'Apoyo'
                    }))
                );

                const communityPatients = patientsByCommunity[comId];
                const patientsAttended = getRandomElements(communityPatients, Math.floor(communityPatients.length * getRandomInt(6, 8) / 10));

                const consultasBatch: any[] = [];
                const consultasEnfermedadesBatch: any[] = [];
                const entregasMedicamentosBatch: any[] = [];

                for (const pacienteCedula of patientsAttended) {
                    const doctorCedula = getRandomElement(allDoctors);
                    if (!doctorCedula) continue;

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

                    const patientPathologies = getRandomElements(allPathologies, getRandomInt(1, 2));
                    for (const pathCode of patientPathologies) {
                        consultasEnfermedadesBatch.push({
                            codigoConsulta: consCode,
                            codigoEnfermedad: pathCode,
                            observacionEspecifica: 'Leve'
                        });
                    }

                    const patientMedicines = getRandomElements(allMedicines, getRandomInt(1, 2));
                    for (const medCode of patientMedicines) {
                        entregasMedicamentosBatch.push({
                            codigoMedicamento: medCode,
                            codigoPaciente: pacienteCedula,
                            codigoAbordaje: abdCode,
                            fechaEntrega: abdDate,
                            cantidad: getRandomInt(1, 3),
                            estado: 'entregado',
                            cedulaTejedor: getRandomElement(abordajeTejedores)
                        });
                    }
                }

                if (consultasBatch.length) await db.insert(schema.consultas).values(consultasBatch);
                if (consultasEnfermedadesBatch.length) await db.insert(schema.consultasEnfermedades).values(consultasEnfermedadesBatch);
                if (entregasMedicamentosBatch.length) await db.insert(schema.entregasMedicamentos).values(entregasMedicamentosBatch);
            }

            currentDate.setMonth(currentDate.getMonth() + 1);
        }

        console.log('✅ Seeding completado exitosamente.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error during seeding:', error);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

main();
