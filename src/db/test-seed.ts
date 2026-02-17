import { loadEnvConfig } from '@next/env';
import * as schema from './schema';
import { eq } from 'drizzle-orm';

// Load environment variables configuration
const projectDir = process.cwd();
loadEnvConfig(projectDir);

/**
 * Helper to get a random element from an array
 */
function getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Helper to get random subset of an array
 */
function getRandomSubset<T>(array: T[], count: number): T[] {
    const shuffled = array.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

/**
 * Helper to generate random int between min and max
 */
function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Static Data for Generation
 */
const VENEZUELAN_FIRST_NAMES_MALE = ['José', 'Carlos', 'Luis', 'Juan', 'Miguel', 'Pedro', 'Jesús', 'Rafael', 'Alejandro', 'Gabriel', 'Antonio', 'Manuel', 'Francisco', 'David', 'Daniel'];
const VENEZUELAN_FIRST_NAMES_FEMALE = ['María', 'Ana', 'Carmen', 'Laura', 'Elena', 'Isabel', 'Patricia', 'Andrea', 'Daniela', 'Valentina', 'Sofía', 'Camila', 'Victoria', 'Gabriela', 'Mariana'];
const VENEZUELAN_LAST_NAMES = ['González', 'Rodríguez', 'Pérez', 'Hernández', 'García', 'Martínez', 'Sánchez', 'Romero', 'Díaz', 'Fernández', 'López', 'Torres', 'Ramírez', 'Flores', 'Gómez'];

const PARROQUIAS_CARACAS = [
    { estado: 'DC', municipio: '01', parroquia: '17', nombre: 'Catia' },
    { estado: 'DC', municipio: '01', parroquia: '07', nombre: 'El Valle' },
    { estado: 'DC', municipio: '01', parroquia: '02', nombre: 'Antímano' },
    { estado: 'MI', municipio: '19', parroquia: '01', nombre: 'Petare' },
    { estado: 'MI', municipio: '03', parroquia: '01', nombre: 'Baruta' },
];

const ENFERMEDADES_DATA = [
    { codigo: 'ENF-001', nombre: 'Hipertensión Arterial', tipo: 'Cardiovascular' },
    { codigo: 'ENF-002', nombre: 'Diabetes Mellitus Tipo 2', tipo: 'Endocrina' },
    { codigo: 'ENF-003', nombre: 'Asma Bronquial', tipo: 'Respiratoria' },
    { codigo: 'ENF-004', nombre: 'Infección Respiratoria Aguda', tipo: 'Infecciosa' },
    { codigo: 'ENF-005', nombre: 'Dermatitis Atópica', tipo: 'Dermatológica' },
    { codigo: 'ENF-006', nombre: 'Parasitosis Intestinal', tipo: 'Gastrointestinal' },
    { codigo: 'ENF-007', nombre: 'Anemia Ferropénica', tipo: 'Hematológica' },
    { codigo: 'ENF-008', nombre: 'Artritis Reumatoide', tipo: 'Reumatológica' },
];

const MEDICAMENTOS_DATA = [
    { codigo: 'MED-001', nombre: 'Losartán Potásico', presentacion: 'Tabletas 50mg', descripcion: 'Antihipertensivo' },
    { codigo: 'MED-002', nombre: 'Metformina', presentacion: 'Tabletas 850mg', descripcion: 'Hipoglicemiante' },
    { codigo: 'MED-003', nombre: 'Salbutamol', presentacion: 'Inhalador 100mcg', descripcion: 'Broncodilatador' },
    { codigo: 'MED-004', nombre: 'Amoxicilina', presentacion: 'Suspensión 250mg/5ml', descripcion: 'Antibiótico' },
    { codigo: 'MED-005', nombre: 'Loratadina', presentacion: 'Tabletas 10mg', descripcion: 'Antihistamínico' },
    { codigo: 'MED-006', nombre: 'Albendazol', presentacion: 'Tabletas 400mg', descripcion: 'Antiparasitario' },
    { codigo: 'MED-007', nombre: 'Sulfato Ferroso', presentacion: 'Grageas 200mg', descripcion: 'Suplemento de Hierro' },
    { codigo: 'MED-008', nombre: 'Ibuprofeno', presentacion: 'Tabletas 400mg', descripcion: 'Analgésico/Antiinflamatorio' },
    { codigo: 'MED-009', nombre: 'Paracetamol', presentacion: 'Jarabe 120mg/5ml', descripcion: 'Analgésico/Antipirético' },
    { codigo: 'MED-010', nombre: 'Complejo B', presentacion: 'Inyectable', descripcion: 'Vitamínico' },
];

const ESPECIALIDADES_DATA = [
    { codigo: 'ESP-001', nombre: 'Medicina General', descripcion: 'Atención primaria' },
    { codigo: 'ESP-002', nombre: 'Pediatría', descripcion: 'Atención infantil' },
    { codigo: 'ESP-003', nombre: 'Enfermería', descripcion: 'Cuidados generales' },
];

const TEJEDORES_ROLES = [
    { profesion: 'Médico General', tipo: 'Voluntario', especialidad: 'ESP-001' },
    { profesion: 'Pediatra', tipo: 'Voluntario', especialidad: 'ESP-002' },
    { profesion: 'Enfermera', tipo: 'Voluntario', especialidad: 'ESP-003' },
    { profesion: 'Trabajador Social', tipo: 'Staff', especialidad: null },
    { profesion: 'Coordinador Logístico', tipo: 'Staff', especialidad: null },
];

async function seed() {
    console.log('🌱 Starting realistic seed...');

    try {
        const { db, schema } = await import('./index');

        // 1. Clean Database (Order matters due to foreign keys)
        console.log('🧹 Cleaning existing data...');
        // Disable foreign keys checks temporarily if needed, or just delete in order
        await db.delete(schema.medicamentosPacientes);
        await db.delete(schema.consultasEnfermedades);
        await db.delete(schema.tejedoresAbordaje);
        await db.delete(schema.consultas);
        await db.delete(schema.medicos); // Clean medicos before tejedores/especialidades
        await db.delete(schema.abordaje);
        await db.delete(schema.pacientes);
        await db.delete(schema.comunidades);
        await db.delete(schema.responsable);
        await db.delete(schema.tejedores);
        await db.delete(schema.medicamentos);
        await db.delete(schema.enfermedades);
        await db.delete(schema.especialidades);
        console.log('✅ Database cleaned');

        // 2. Insert Static Data
        console.log('💊 Seeding Static Data...');

        await db.insert(schema.medicamentos).values(
            MEDICAMENTOS_DATA.map(m => ({
                codigoMedicamento: m.codigo,
                nombreMedicamento: m.nombre,
                presentacion: m.presentacion,
                descripcion: m.descripcion,
                existencia: getRandomInt(50, 500),
            }))
        );

        await db.insert(schema.enfermedades).values(
            ENFERMEDADES_DATA.map(e => ({
                codigoEnfermedad: e.codigo,
                nombreEnfermedad: e.nombre,
                tipoPatologia: e.tipo,
                descripcion: `Patología del sistema ${e.tipo}`,
            }))
        );

        await db.insert(schema.especialidades).values(
            ESPECIALIDADES_DATA.map(e => ({
                codigoEspecialidad: e.codigo,
                nombreEspecialidad: e.nombre,
                descripcion: e.descripcion,
            }))
        );

        // 3. Insert Tejedores
        console.log('👥 Seeding Tejedores...');
        const tejedoresList = [];
        const doctorsList = [];

        for (let i = 0; i < 10; i++) {
            const isFemale = Math.random() > 0.5;
            const firstName = getRandomElement(isFemale ? VENEZUELAN_FIRST_NAMES_FEMALE : VENEZUELAN_FIRST_NAMES_MALE);
            const lastName = getRandomElement(VENEZUELAN_LAST_NAMES);
            const role = i < 5 ? TEJEDORES_ROLES[i] : TEJEDORES_ROLES[4];

            const cedula = `V${getRandomInt(10000000, 30000000)}`;
            const loc = getRandomElement(PARROQUIAS_CARACAS);

            tejedoresList.push({
                cedulaTejedor: cedula,
                nombreTejedor: firstName,
                apellidoTejedor: lastName,
                fechaNacimiento: new Date(1980 + getRandomInt(0, 20), getRandomInt(0, 11), getRandomInt(1, 28)),
                direccionTejedor: `Calle Principal de ${loc.nombre}, #123`,
                municipioTejedor: loc.municipio,
                estadoTejedor: loc.estado,
                parroquiaTejedor: loc.parroquia,
                telefonoTejedor: `04${getRandomInt(12, 26)}-${getRandomInt(1000000, 9999999)}`,
                correoTejedor: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@gmail.com`,
                profesionTejedor: role.profesion,
                tipodeVoluntario: role.tipo,
                fechaIngreso: new Date(2023, 0, 15),
            });

            if (role.especialidad && (role.profesion === 'Médico General' || role.profesion === 'Pediatra')) {
                doctorsList.push({
                    cedulaTejedor: cedula,
                    codigoEspecialidad: role.especialidad,
                    matriculaColegioMedico: `MPPS-${getRandomInt(1000, 9999)}`,
                    matriculaSanidad: `CM-${getRandomInt(1000, 9999)}`,
                });
            }
        }
        await db.insert(schema.tejedores).values(tejedoresList);

        // Insert Medicos
        if (doctorsList.length > 0) {
            await db.insert(schema.medicos).values(doctorsList);
        }

        // 4. Insert Responsables and Comunidades
        console.log('🏘️ Seeding Responsables & Comunidades...');
        const comunidadesList = [];

        for (let i = 0; i < PARROQUIAS_CARACAS.length; i++) {
            const loc = PARROQUIAS_CARACAS[i];
            const isFemale = Math.random() > 0.5;
            const firstName = getRandomElement(isFemale ? VENEZUELAN_FIRST_NAMES_FEMALE : VENEZUELAN_FIRST_NAMES_MALE);
            const lastName = getRandomElement(VENEZUELAN_LAST_NAMES);
            const cedula = `V${getRandomInt(5000000, 15000000)}`;

            // Create Responsable
            await db.insert(schema.responsable).values({
                cedulaResponsable: cedula,
                nombreResponsable: firstName,
                apellidoResponsable: lastName,
                direccionResponsable: `Sector ${loc.nombre}, Casa #${getRandomInt(1, 100)}`,
                telefonoResponsable: `04${getRandomInt(12, 26)}-${getRandomInt(1000000, 9999999)}`,
                correoResponsable: `lider.${loc.nombre.toLowerCase()}@hotmail.com`,
                cargo: getRandomElement(['Jefe de Calle', 'Vocero Principal', 'Coordinador']),
                estado: loc.estado,
                municipio: loc.municipio,
                parroquia: loc.parroquia,
            });

            // Create Comunidad
            const codigoComunidad = `COM-00${i + 1}`;
            comunidadesList.push({
                codigo: codigoComunidad,
                nombre: `Comunidad ${loc.nombre} Organizada`,
                cedulaResponsable: cedula,
                estado: loc.estado
            });

            await db.insert(schema.comunidades).values({
                codigoComunidad: codigoComunidad,
                nombreComunidad: `Comunidad ${loc.nombre} Organizada`,
                tipoComunidad: getRandomElement(['1', '2', '4']),
                estado: loc.estado,
                municipio: loc.municipio,
                parroquia: loc.parroquia,
                direccion: `Sector ${loc.nombre}, Vía Principal`,
                ubicacionFisica: `Referencia: Cerca de la plaza Bolívar`,
                cedulaResponsable: cedula,
                cantidadHabitantes: getRandomInt(200, 1000),
                cantidadFamilias: getRandomInt(50, 300),
                cantidadNinos: getRandomInt(50, 200),
                cantidadAdolescentes: getRandomInt(30, 150),
                cantidadMayores: getRandomInt(40, 200),
                cantidadMayores60: getRandomInt(20, 100),
                telefonoComunidad: `0212-${getRandomInt(2000000, 9999999)}`,
            });
        }

        // 5. Insert Pacientes
        console.log('👨‍👩‍👧‍👦 Seeding Pacientes...');
        const pacientesList = [];
        const communityPatientsMap: Record<string, string[]> = {};

        for (let i = 0; i < comunidadesList.length; i++) {
            const com = comunidadesList[i];
            const loc = PARROQUIAS_CARACAS[i];
            communityPatientsMap[com.codigo] = [];

            // Create 15-20 patients per community
            const numPatients = getRandomInt(15, 20);
            for (let j = 0; j < numPatients; j++) {
                const isFemale = Math.random() > 0.5;
                const firstName = getRandomElement(isFemale ? VENEZUELAN_FIRST_NAMES_FEMALE : VENEZUELAN_FIRST_NAMES_MALE);
                const lastName = getRandomElement(VENEZUELAN_LAST_NAMES);
                const cedula = `V${getRandomInt(1000000, 30000000)}`;

                await db.insert(schema.pacientes).values({
                    cedulaPaciente: cedula,
                    codigoComunidad: com.codigo,
                    nombrePaciente: firstName,
                    apellidoPaciente: lastName,
                    sexo: isFemale ? 'F' : 'M',
                    fechaNacimiento: new Date(1950 + getRandomInt(0, 70), getRandomInt(0, 11), getRandomInt(1, 28)),
                    estado: loc.estado,
                    municipio: loc.municipio,
                    parroquia: loc.parroquia,
                    direccionPaciente: `Casa #${getRandomInt(1, 500)}`,
                    telefonoPaciente: `04${getRandomInt(12, 26)}-${getRandomInt(1000000, 9999999)}`,
                    correoPaciente: 'no-email@example.com',
                });

                pacientesList.push(cedula);
                communityPatientsMap[com.codigo].push(cedula);
            }
        }

        // 6. Insert Abordajes
        console.log('🚑 Seeding Abordajes & Consultas...');

        // 6.1 Executed Abordaje
        const targetComunidad = comunidadesList[0];
        const executedAbordajeCode = 'ABD-001';

        await db.insert(schema.abordaje).values({
            codigoAbordaje: executedAbordajeCode,
            codigoComunidad: targetComunidad.codigo,
            fechaAbordaje: new Date('2025-10-15'),
            horaInicio: '08:00:00',
            horaFin: '16:00:00',
            descripcion: 'Jornada integral de salud en Catia.',
            tipoAbordaje: 'Médico-Asistencial',
            participantesEstimados: 100,
            estado: 'Ejecutado',
            recursosAdicionales: 'Transporte, Refrigerios',
        });

        for (const tejedor of tejedoresList) {
            await db.insert(schema.tejedoresAbordaje).values({
                codigoAbordaje: executedAbordajeCode,
                cedulaTejedor: tejedor.cedulaTejedor,
                rolEnAbordaje: tejedor.profesionTejedor,
            });
        }

        // Create Consultas linked only to Medicos
        const patientsInComunidad = communityPatientsMap[targetComunidad.codigo];
        const consultationsToCreate = Math.min(10, patientsInComunidad.length);

        for (let i = 0; i < consultationsToCreate; i++) {
            const patientCedula = patientsInComunidad[i];
            // Pick a doctor from doctorsList who are properly registered in medicos table
            const doctor = getRandomElement(doctorsList);
            const consultaCode = `CON-00${i + 1}`;

            await db.insert(schema.consultas).values({
                codigoConsulta: consultaCode,
                codigoAbordaje: executedAbordajeCode,
                cedulaPaciente: patientCedula,
                cedulaMedico: doctor.cedulaTejedor,
                motivoConsulta: getRandomElement(['Control de tensión', 'Malestar general', 'Chequeo pediátrico', 'Dolor abdominal']),
                diagnosticoTexto: 'Paciente estable.',
                recomendaciones: 'Control en 15 días.',
                tratamiento: 'Indicado según recipe médico.',
                tensionArterial: `${getRandomInt(110, 140)}/${getRandomInt(70, 90)}`,
            });

            const pathologiesMap = getRandomSubset(ENFERMEDADES_DATA, getRandomInt(1, 2));
            for (const pat of pathologiesMap) {
                await db.insert(schema.consultasEnfermedades).values({
                    codigoConsulta: consultaCode,
                    codigoEnfermedad: pat.codigo,
                    observacionEspecifica: 'Diagnóstico confirmado.',
                });
            }

            const meds = getRandomSubset(MEDICAMENTOS_DATA, getRandomInt(1, 2));
            for (const med of meds) {
                await db.insert(schema.medicamentosPacientes).values({
                    codigoMedicamento: med.codigo,
                    cedulaPaciente: patientCedula,
                    codigoAbordaje: executedAbordajeCode,
                    fechaEntrega: new Date('2025-10-15'),
                    cantidadEntregada: getRandomInt(1, 3),
                    cedulaTejedor: doctor.cedulaTejedor,
                });
            }
        }

        // 6.2 Planned Abordaje
        await db.insert(schema.abordaje).values({
            codigoAbordaje: 'ABD-002',
            codigoComunidad: comunidadesList[1].codigo,
            fechaAbordaje: new Date('2026-11-20'),
            horaInicio: '09:00:00',
            horaFin: '14:00:00',
            descripcion: 'Jornada de vacunación.',
            tipoAbordaje: 'Pediátrico',
            participantesEstimados: 50,
            estado: 'Planificado',
            recursosAdicionales: 'Transporte, Área techada',
        });

        console.log('✅ Seed completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error executing seed:', error);
        process.exit(1);
    }
}

seed();
