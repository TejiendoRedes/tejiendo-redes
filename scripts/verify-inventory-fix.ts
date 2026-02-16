
import dotenv from 'dotenv';
import { eq } from 'drizzle-orm';

// Load env vars immediately
dotenv.config({ path: '.env.local' });

async function main() {
    console.log('🚀 Starting verification script...');

    // Dynamic import to ensure env vars are loaded BEFORE any DB code runs
    const { db } = await import('@/db');
    const {
        medicamentos,
        pacientes,
        tejedores,
        comunidades,
        abordaje,
        medicamentosPacientes,
        responsable
    } = await import('@/db/schema');

    const { registerMedicamentoEntrega } = await import('@/actions/abordajes-actions');

    const TEST_ID = 'TEST-V-001';

    // Setup Test Data
    try {
        console.log('📦 Setting up test data...');

        // Cleanup first
        try {
            await db.delete(medicamentosPacientes).where(eq(medicamentosPacientes.codigoAbordaje, TEST_ID));
            await db.delete(abordaje).where(eq(abordaje.codigoAbordaje, TEST_ID));
            await db.delete(pacientes).where(eq(pacientes.cedulaPaciente, 'V-99999999'));
            await db.delete(tejedores).where(eq(tejedores.cedulaTejedor, 'V-88888888'));
            await db.delete(comunidades).where(eq(comunidades.codigoComunidad, TEST_ID));
            await db.delete(medicamentos).where(eq(medicamentos.codigoMedicamento, TEST_ID));
            await db.delete(responsable).where(eq(responsable.cedulaResponsable, 'V-RESP-001'));
        } catch (e) { /* ignore */ }

        // 0. Create Responsable
        await db.insert(responsable).values({
            cedulaResponsable: 'V-RESP-001',
            nombreResponsable: 'Test',
            apellidoResponsable: 'Responsable',
            direccionResponsable: 'Test Dir',
            telefonoResponsable: '04120000000',
            correoResponsable: 'test@example.com',
            cargo: 'Test Cargo',
            estado: 'ZU',
            municipio: 'MA',
            parroquia: 'CR'
        });

        // 1. Create Community
        await db.insert(comunidades).values({
            codigoComunidad: TEST_ID,
            nombreComunidad: 'Test Community',
            tipoComunidad: '1',
            estado: 'Zulia',
            municipio: 'Maracaibo',
            parroquia: 'Cristo de Aranza',
            direccion: 'Test DB',
            ubicacionFisica: 'Test Location',
            cedulaResponsable: 'V-RESP-001',
            cantidadHabitantes: 100,
            cantidadFamilias: 20,
            cantidadNinos: 10,
            cantidadAdolescentes: 10,
            cantidadMayores: 10,
            cantidadMayores60: 5,
            telefonoComunidad: '04121111111'
        });

        // 2. Create Abordaje
        await db.insert(abordaje).values({
            codigoAbordaje: TEST_ID,
            codigoComunidad: TEST_ID,
            fechaAbordaje: new Date(),
            horaInicio: '08:00',
            horaFin: '12:00',
            descripcion: 'Test Abordaje',
            estado: 'Planificado'
        });

        // 3. Create Patient
        await db.insert(pacientes).values({
            cedulaPaciente: 'V-99999999',
            codigoComunidad: TEST_ID,
            nombrePaciente: 'Test',
            apellidoPaciente: 'Patient',
            sexo: 'M',
            fechaNacimiento: new Date('2000-01-01'),
            estado: 'ZU',
            municipio: 'MA',
            parroquia: 'CR',
            direccionPaciente: 'Test Address',
            telefonoPaciente: '04121234567',
            correoPaciente: 'patient@example.com'
        });

        // 4. Create Tejedor
        await db.insert(tejedores).values({
            cedulaTejedor: 'V-88888888',
            nombreTejedor: 'Test',
            apellidoTejedor: 'Tejedor',
            fechaNacimiento: new Date('1990-01-01'),
            direccionTejedor: 'Test Dir',
            municipioTejedor: 'Maracaibo',
            estadoTejedor: 'Zulia',
            parroquiaTejedor: 'Cristo de Aranza',
            telefonoTejedor: '04127654321',
            correoTejedor: 'tejedor@example.com',
            profesionTejedor: 'Medico',
            fechaIngreso: new Date('2023-01-01'),
            tipodeVoluntario: 'Especialista'
        });

        // 5. Create Medicamento with stock 10
        await db.insert(medicamentos).values({
            codigoMedicamento: TEST_ID,
            nombreMedicamento: 'Test Med',
            presentacion: 'Tablets',
            descripcion: 'Test',
            existencia: 10
        });

        console.log('✅ Test data created.');

        // TEST 1: Deliver 5 (Valid)
        console.log('\n🧪 TEST 1: Deliver 5 units (Valid)...');
        const res1 = await registerMedicamentoEntrega({
            codigoAbordaje: TEST_ID,
            codigoMedicamento: TEST_ID,
            cedulaPaciente: 'V-99999999',
            cedulaTejedor: 'V-88888888',
            cantidadEntregada: 5,
            fechaEntrega: new Date()
        });

        if (res1.success) {
            console.log('✅ Test 1 Passed: Delivery success.');
        } else {
            console.error('❌ Test 1 Failed:', res1.error);
        }

        // Verify stock is now 5
        // @ts-ignore
        const med1 = await db.query.medicamentos.findFirst({
            where: eq(medicamentos.codigoMedicamento, TEST_ID),
            columns: { existencia: true }
        });
        if (med1?.existencia === 5) {
            console.log('✅ Stock verified: 5 remaining.');
        } else {
            console.error(`❌ Stock mismatch: Expected 5, got ${med1?.existencia}`);
        }

        // TEST 2: Deliver 6 (Invalid - Insufficient Stock)
        console.log('\n🧪 TEST 2: Deliver 6 units (Insufficient Stock)...');
        const res2 = await registerMedicamentoEntrega({
            codigoAbordaje: TEST_ID,
            codigoMedicamento: TEST_ID,
            cedulaPaciente: 'V-99999999',
            cedulaTejedor: 'V-88888888',
            cantidadEntregada: 6,
            fechaEntrega: new Date()
        });

        if (!res2.success && res2.error?.includes('Inventario insuficiente')) {
            console.log('✅ Test 2 Passed: Correctly pushed back due to insufficient stock.');
            console.log(`   Error message: "${res2.error}"`);
            console.log('   Expected failure occurred as planned.');
        } else {
            console.error('❌ Test 2 Failed: Should have failed with insufficient stock error.');
            console.log('   Result:', res2);
        }

        // TEST 3: Deliver -1 (Invalid - Validation)
        console.log('\n🧪 TEST 3: Deliver -1 units (Validation Error)...');
        const res3 = await registerMedicamentoEntrega({
            codigoAbordaje: TEST_ID,
            codigoMedicamento: TEST_ID,
            cedulaPaciente: 'V-99999999',
            cedulaTejedor: 'V-88888888',
            cantidadEntregada: -1,
            fechaEntrega: new Date()
        });

        if (!res3.success && (res3.error?.includes('mayor a 0') || res3.error?.includes('positive'))) {
            console.log('✅ Test 3 Passed: Validation caught negative number.');
            console.log(`   Error message: "${res3.error}"`);
            console.log('   Expected failure occurred as planned.');
        } else {
            console.error('❌ Test 3 Failed: Should have failed with validation error.');
            console.log('   Result:', res3);
        }

    } catch (error) {
        console.error('❌ Unexpected Error:', error);
    } finally {
        console.log('\n🧹 Cleaning up...');
        try {
            await db.delete(medicamentosPacientes).where(eq(medicamentosPacientes.codigoAbordaje, TEST_ID));
            await db.delete(abordaje).where(eq(abordaje.codigoAbordaje, TEST_ID));
            await db.delete(pacientes).where(eq(pacientes.cedulaPaciente, 'V-99999999'));
            await db.delete(tejedores).where(eq(tejedores.cedulaTejedor, 'V-88888888'));
            await db.delete(comunidades).where(eq(comunidades.codigoComunidad, TEST_ID));
            await db.delete(medicamentos).where(eq(medicamentos.codigoMedicamento, TEST_ID));
            await db.delete(responsable).where(eq(responsable.cedulaResponsable, 'V-RESP-001'));
        } catch (e) { }
        console.log('Done.');
        process.exit(0);
    }
}

main();
