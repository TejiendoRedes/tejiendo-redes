import { db } from '../src/db';
import { users } from '../src/db/schema';
import { hashPassword } from '../src/lib/auth';
import { eq } from 'drizzle-orm';

async function createAdmin() {
    try {
        const username = 'admin';
        const password = 'Admin123!';
        
        console.log(`Checking if admin user '${username}' exists...`);
        const existing = await db.select().from(users).where(eq(users.username, username));
        
        if (existing.length > 0) {
            console.log(`User '${username}' already exists. Updating password...`);
            const hashedPassword = await hashPassword(password);
            await db.update(users)
                .set({ password: hashedPassword, role: 'superuser', approved: true })
                .where(eq(users.username, username));
            console.log(`Admin '${username}' updated successfully.`);
        } else {
            console.log(`Creating user '${username}'...`);
            const hashedPassword = await hashPassword(password);
            await db.insert(users).values({
                username,
                password: hashedPassword,
                role: 'superuser',
                approved: true
            });
            console.log(`Admin '${username}' created successfully.`);
        }
        
        process.exit(0);
    } catch (error) {
        console.error("Failed to create admin:", error);
        process.exit(1);
    }
}

createAdmin();
