/**
 * Example of the Repository Pattern for clean data access.
 * This ensures data logic is decoupled from business logic,
 * making the code highly maintainable and testable.
 */

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

// 1. Define Input Validation Schema
export const UserSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(2).max(50),
    email: z.string().email(),
});

export type User = z.infer<typeof UserSchema>;

// 2. Repository Interface
export interface UserRepository {
    findById(id: string): Promise<User | null>;
    create(user: Omit<User, "id">): Promise<User>;
    update(id: string, user: Partial<User>): Promise<void>;
}

// 3. Implementation
export class DrizzleUserRepository implements UserRepository {
    async findById(id: string): Promise<User | null> {
        const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
        return result[0] ? UserSchema.parse(result[0]) : null;
    }

    async create(userData: Omit<User, "id">): Promise<User> {
        const [newUser] = await db.insert(users).values(userData).returning();
        return UserSchema.parse(newUser);
    }

    async update(id: string, userData: Partial<User>): Promise<void> {
        await db.update(users).set(userData).where(eq(users.id, id));
    }
}
