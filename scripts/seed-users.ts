import { loadEnvConfig } from '@next/env';
import { sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const projectDir = process.cwd();
loadEnvConfig(projectDir);

async function main() {
    const { db } = await import('../src/db/index');
    const { users } = await import('../src/db/schema');
    
    const defaultUsers = [
        { username: 'admin', password: 'Admin123!', role: 'admin' as const },
        { username: 'super', password: 'Super123!', role: 'superuser' as const },
        { username: 'medico', password: 'Medico123!', role: 'medico' as const },
        { username: 'operador', password: 'Operador123!', role: 'operador' as const },
    ];

    try {
        for (const user of defaultUsers) {
            const passwordHash = await bcrypt.hash(user.password, 10);
            await db.insert(users).values({
                username: user.username,
                password: passwordHash,
                role: user.role,
                approved: true,
            }).onDuplicateKeyUpdate({ set: { password: passwordHash } });
        }
        console.log('Users seeded successfully');
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

main();
