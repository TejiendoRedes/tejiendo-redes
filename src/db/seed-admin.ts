import { loadEnvConfig } from '@next/env';
import bcrypt from 'bcryptjs';

// Load environment variables configuration
const projectDir = process.cwd();
loadEnvConfig(projectDir);

async function main() {
    console.log('🌱 Seeding initial Admin user...');

    const { db } = await import('./index');
    const { users } = await import('./schema');
    const { connection } = await import('./client');
    const { eq } = await import('drizzle-orm');

    try {
        // Check if admin already exists
        const [existing] = await db.select()
            .from(users)
            .where(eq(users.username, 'admin'))
            .limit(1);

        if (existing) {
            console.log('ℹ️ Admin user already exists.');
        } else {
            const passwordHash = await bcrypt.hash('Admin123!', 10);
            await db.insert(users).values({
                username: 'admin',
                password: passwordHash,
                role: 'admin',
                approved: true,
            });
            console.log('✅ Admin user created successfully (User: admin / Pass: Admin123!)');
        }

        // Create a superuser for testing too
        const [existingSuper] = await db.select()
            .from(users)
            .where(eq(users.username, 'super'))
            .limit(1);

        if (!existingSuper) {
            const passwordHash = await bcrypt.hash('Super123!', 10);
            await db.insert(users).values({
                username: 'super',
                password: passwordHash,
                role: 'superuser',
                approved: true,
            });
            console.log('✅ Superuser created successfully (User: super / Pass: Super123!)');
        }

        // Create a medico for testing
        const [existingMedico] = await db.select()
            .from(users)
            .where(eq(users.username, 'medico'))
            .limit(1);

        if (!existingMedico) {
            const passwordHash = await bcrypt.hash('Medico123!', 10);
            await db.insert(users).values({
                username: 'medico',
                password: passwordHash,
                role: 'medico',
                approved: true,
            });
            console.log('✅ Medico created successfully (User: medico / Pass: Medico123!)');
        }

        // Create an operador for testing
        const [existingOperador] = await db.select()
            .from(users)
            .where(eq(users.username, 'operador'))
            .limit(1);

        if (!existingOperador) {
            const passwordHash = await bcrypt.hash('Operador123!', 10);
            await db.insert(users).values({
                username: 'operador',
                password: passwordHash,
                role: 'operador',
                approved: true,
            });
            console.log('✅ Operador created successfully (User: operador / Pass: Operador123!)');
        }

        // Create an invitado for testing
        const [existingInvitado] = await db.select()
            .from(users)
            .where(eq(users.username, 'invitado'))
            .limit(1);

        if (!existingInvitado) {
            const passwordHash = await bcrypt.hash('Invitado123!', 10);
            await db.insert(users).values({
                username: 'invitado',
                password: passwordHash,
                role: 'invitado',
                approved: true,
            });
            console.log('✅ Invitado created successfully (User: invitado / Pass: Invitado123!)');
        }

    } catch (error) {
        console.error('❌ Error during seeding:', error);
    } finally {
        const conn = await connection;
        await conn.end();
        process.exit(0);
    }
}

main();
