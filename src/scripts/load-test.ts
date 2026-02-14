
import dotenv from 'dotenv';
import path from 'path';

// Load env vars before importing anything else
const envPath = path.resolve(process.cwd(), '.env.local');
console.log('Loading env from:', envPath);
dotenv.config({ path: envPath });

console.log('DB Config Check:', {
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    passwordLength: process.env.DATABASE_PASSWORD ? process.env.DATABASE_PASSWORD.length : 0,
});

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 12);

async function runLoadTest() {
    // Dynamic imports to ensure env vars are loaded first
    const { db } = await import('../db');
    const { AbordajesService } = await import('../services/abordajes-service');
    const { comunidades } = await import('../db/schema');

    console.log('🚀 Starting Database Load Test...');

    // Ensure DB connection via simple query
    try {
        await db.execute('SELECT 1');
        console.log('✅ Connected to Database');
    } catch (e: any) {
        console.error('❌ Failed to connect to DB:', e.message);
        process.exit(1);
    }

    // Get a valid community code for creating abordajes
    const existingComs = await db.select().from(comunidades).limit(1);
    if (existingComs.length === 0) {
        console.error('❌ No communities found in DB. Cannot create abordajes (FK constraint).');
        process.exit(1);
    }
    const communityId = existingComs[0].codigoComunidad;
    console.log(`ℹ️ Using Community ID: ${communityId}`);

    // Test parameters
    const CONCURRENT_USERS = 50;
    const TEST_Run_ID = Math.random().toString(36).substring(2, 5); // Short prefix

    // 1. Concurrent Creation Test
    console.log(`\nTesting 1: Creating ${CONCURRENT_USERS} abordajes concurrently...`);

    const creationPromises = Array.from({ length: CONCURRENT_USERS }).map(async (_, index) => {
        const id = `${TEST_Run_ID}${generateId()}`.substring(0, 10);
        try {
            await AbordajesService.create({
                codigoAbordaje: id,
                fechaAbordaje: new Date(),
                descripcion: `Load test abordaje ${index}`,
                estado: 'Abierto',
                codigoComunidad: communityId,
                horaInicio: '08:00',
                horaFin: '12:00'
            });
            return { success: true, id };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    });

    const start = performance.now();
    const results1 = await Promise.all(creationPromises);
    const end = performance.now();

    const successes = results1.filter(r => r.success);
    const failures = results1.filter(r => !r.success);

    console.log(`✅ Mass Creation Completed in ${((end - start) / 1000).toFixed(2)}s`);
    console.log(`   Successes: ${successes.length}`);
    console.log(`   Failures:  ${failures.length}`);

    if (failures.length > 0) {
        console.log('   Sample Error:', failures[0].error);
    }

    // 2. Race Condition Test (optional if successes > 0)
    if (successes.length > 0) {
        const testAbordajeId = successes[0].id; // Pick first created abordaje

        if (testAbordajeId) {
            console.log(`\nTesting 2: Race Condition on Abordaje ${testAbordajeId} + Comunidad ${communityId}`);

            // Try to add the same community 20 times concurrently
            const racePromises = Array.from({ length: 20 }).map(async () => {
                try {
                    await AbordajesService.addComunidad(testAbordajeId, communityId);
                    return { success: true };
                } catch (error: any) {
                    return { success: false, error: error.message };
                }
            });

            const raceResults = await Promise.all(racePromises);
            const raceSuccesses = raceResults.filter(r => r.success).length;
            const raceFailures = raceResults.filter(r => !r.success).length;

            console.log(`   Result: ${raceSuccesses} successes (should be 1 or 0 if already assigned), ${raceFailures} failures`);

            const alreadyAssigned = raceResults.filter(r => r.success === false && r.error && r.error.includes('ya está asignada')).length;
            const constraintErrors = raceResults.filter(r => r.success === false && r.error && r.error.includes('Duplicate entry')).length;

            console.log(`   "Already Assigned" checks caught: ${alreadyAssigned}`);
            console.log(`   DB Constraint errors caught: ${constraintErrors}`);

            if (raceFailures > 0) {
                const sampleError = raceResults.find(r => !r.success)?.error;
                console.log(`   ⚠️ Sample Failure Error: ${sampleError}`);
            }
        }
    }

    // Cleanup
    console.log('\n🧹 Cleaning up...');
    let deleted = 0;
    for (const r of successes) {
        if (r.id) {
            try {
                await AbordajesService.delete(r.id);
                deleted++;
            } catch (e) {
                // Ignore cleanup errors
            }
        }
    }
    console.log(`   Cleaned up ${deleted} records.`);

    console.log('Done.');
    process.exit(0);
}

runLoadTest().catch(console.error);
