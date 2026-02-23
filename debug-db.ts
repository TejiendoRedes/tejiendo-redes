
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local FIRST
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { db } from './src/db';
import { peticiones } from './src/db/schema/peticiones';

async function debugDatabase() {
    console.log(`Checking all peticiones...`);

    const allPeticiones = await db.select().from(peticiones);
    console.log('Total peticiones in DB:', allPeticiones.length);
    console.log('Peticiones details:', JSON.stringify(allPeticiones, null, 2));

    process.exit(0);
}

debugDatabase();
