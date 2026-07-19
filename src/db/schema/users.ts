import { mysqlTable, varchar, timestamp, int, mysqlEnum, boolean } from 'drizzle-orm/mysql-core';
import { tejedores } from './tejedores';

/**
 * Tabla: usuarios
 * Maneja las credenciales y roles para acceder al sistema
 */
export const users = mysqlTable('users', {
    id: int('id').primaryKey().autoincrement(),
    username: varchar('username', { length: 30 }).unique().notNull(),
    password: varchar('password', { length: 100 }).notNull(),
    role: mysqlEnum('role', [
        'admin',
        'superuser',
        'medico',
        'operador',
        'invitado',
        'tejedor'
    ]).notNull().default('invitado'),
    approved: boolean('approved').notNull().default(false),
    lastLogin: timestamp('last_login'),
    cedulaTejedor: varchar('cedula_tejedor', { length: 12 }).references(() => tejedores.cedulaTejedor),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').onUpdateNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
