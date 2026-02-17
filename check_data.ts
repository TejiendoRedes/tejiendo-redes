import { db } from './src/db';
import { comunidades, medicamentos, organismos, abordaje } from './src/db/schema';

async function checkData() {
    try {
        const coms = await db.select().from(comunidades).limit(5);
        console.log('Comunidades:', coms.map(c => c.codigoComunidad));

        const meds = await db.select().from(medicamentos).limit(5);
        console.log('Medicamentos:', meds.map(m => m.codigoMedicamento));

        const orgs = await db.select().from(organismos).limit(5);
        console.log('Organismos:', orgs.map(o => o.codigoOrganismo));

        const abor = await db.select().from(abordaje).limit(5);
        console.log('Abordajes:', abor.map(a => a.codigoAbordaje));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkData();
