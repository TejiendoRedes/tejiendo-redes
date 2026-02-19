import { loadEnvConfig } from '@next/env';
import fs from 'fs';
import path from 'path';
import { sql, eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// Load environment variables configuration
const projectDir = process.cwd();
loadEnvConfig(projectDir);

async function main() {
    console.log('🌱 Starting seed process...');

    // Dynamic import to ensure env vars are loaded first
    const { db } = await import('./index');
    const { connection } = await import('./client');
    const { users } = await import('./schema');

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

        console.log('👤 Seeding default users...');
        const defaultUsers = [
            { username: 'admin', password: 'Admin123!', role: 'admin' as const },
            { username: 'super', password: 'Super123!', role: 'superuser' as const },
            { username: 'medico', password: 'Medico123!', role: 'medico' as const },
            { username: 'operador', password: 'Operador123!', role: 'operador' as const },
        ];

        for (const user of defaultUsers) {
            const [existing] = await db.select()
                .from(users)
                .where(eq(users.username, user.username))
                .limit(1);

            if (!existing) {
                const passwordHash = await bcrypt.hash(user.password, 10);
                await db.insert(users).values({
                    username: user.username,
                    password: passwordHash,
                    role: user.role,
                    approved: true,
                });
                console.log(`  ✅ User created: ${user.username} (${user.role})`);
            } else {
                console.log(`  ℹ️ User already exists: ${user.username}`);
            }
        }

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
