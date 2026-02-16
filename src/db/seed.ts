import { loadEnvConfig } from '@next/env';
import fs from 'fs';
import path from 'path';
import { sql } from 'drizzle-orm';

// Load environment variables configuration
const projectDir = process.cwd();
loadEnvConfig(projectDir);

async function main() {
    console.log('🌱 Starting seed process...');

    // Dynamic import to ensure env vars are loaded first
    const { db } = await import('./index');
    const { connection } = await import('./client');

    const seedFilePath = path.join(process.cwd(), 'src', 'db', 'seeds', 'seed_data.sql');

    if (!fs.existsSync(seedFilePath)) {
        console.error(`❌ Seed file not found at: ${seedFilePath}`);
        process.exit(1);
    }

    console.log(`📖 Reading seed file from: ${seedFilePath}`);
    const seedSql = fs.readFileSync(seedFilePath, 'utf8');

    try {
        console.log('⏳ Executing seed SQL script...');

        // Execute the raw SQL using Drizzle
        await db.execute(sql.raw(seedSql));

        console.log('✅ Seed executed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during seeding:', error);
        process.exit(1);
    } finally {
        // We must close the connection to exit the process cleanly
        await connection.end();
    }
}

main();
