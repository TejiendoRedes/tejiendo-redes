import { mysqlTable, varchar, timestamp, int, text } from 'drizzle-orm/mysql-core';
import { users } from './users';

/**
 * Tabla: audit_logs
 * Rastrea acciones sensibles dentro del sistema para seguridad y auditoría
 */
export const auditLogs = mysqlTable('audit_logs', {
    id: int('id').primaryKey().autoincrement(),
    userId: int('user_id').references(() => users.id),
    action: varchar('action', { length: 100 }).notNull(), // e.g., 'LOGIN', 'APPROVE_TEJEDOR', 'DELETE_USER'
    entity: varchar('entity', { length: 50 }),           // e.g., 'USERS', 'TEJEDORES'
    entityId: varchar('entity_id', { length: 50 }),
    details: text('details'),                            // JSON o descripción textual
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at').defaultNow(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
