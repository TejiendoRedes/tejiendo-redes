import { db } from '../src/db';
import { estados, municipios, parroquias } from '../src/db/schema';
import { eq } from 'drizzle-orm';

async function verifyGeography() {
    try {
        console.log("Verifying Geography Database Integrity...");
        
        // 1. Check total counts
        const allEstados = await db.select().from(estados);
        console.log(`\nEstados count: ${allEstados.length} (Expected: 24)`);
        
        const allMunicipios = await db.select().from(municipios);
        console.log(`Municipios count: ${allMunicipios.length} (Expected: 335)`);
        
        const allParroquias = await db.select().from(parroquias);
        console.log(`Parroquias count: ${allParroquias.length} (Expected: ~1136)`);
        
        // 2. Check cascade for a specific state (e.g. Amazonas)
        const amazonas = allEstados.find(e => e.nombre.includes('Amazonas'));
        if (amazonas) {
            const amazonasMunicipios = allMunicipios.filter(m => m.estadoId === amazonas.id);
            console.log(`\nAmazonas Municipios count: ${amazonasMunicipios.length} (Expected: 7)`);
            
            if (amazonasMunicipios.length > 0) {
                const firstMunicipio = amazonasMunicipios[0];
                const firstMunParroquias = allParroquias.filter(p => p.municipioId === firstMunicipio.id);
                console.log(`Parroquias in ${firstMunicipio.nombre} (Amazonas): ${firstMunParroquias.length}`);
                console.log(`Samples:`, firstMunParroquias.map(p => p.nombre).slice(0, 3));
            }
        }
        
        // 3. Verify Pacientes address relationship
        // Paciente has `codigoComunidad`, Comunidad has `parroquiaId`
        const { pacientes, comunidades } = await import('../src/db/schema');
        const allPacientes = await db.select().from(pacientes);
        const allComunidades = await db.select().from(comunidades);
        
        console.log(`\nPacientes count: ${allPacientes.length}`);
        
        let validPatients = 0;
        let invalidPatients = 0;
        
        for (const paciente of allPacientes) {
            const comunidad = allComunidades.find(c => c.codigoComunidad === paciente.codigoComunidad);
            if (comunidad && comunidad.parroquiaId) {
                const parroquia = allParroquias.find(p => p.id === comunidad.parroquiaId);
                if (parroquia) validPatients++;
                else invalidPatients++;
            } else {
                invalidPatients++;
            }
        }
        console.log(`Pacientes with valid linked geography: ${validPatients}`);
        console.log(`Pacientes missing geography links: ${invalidPatients}`);
        
        process.exit(0);
    } catch (error) {
        console.error("Verification failed:", error);
        process.exit(1);
    }
}

verifyGeography();
