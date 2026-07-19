import { mysqlTable, varchar, text } from 'drizzle-orm/mysql-core';

/**
 * Tabla: especialidades
 * Catálogo de especialidades médicas
 */
export const especialidades = mysqlTable('especialidades', {
    codigoEspecialidad: varchar('codigo_especialidad', { length: 10 }).primaryKey().notNull(), // ESP-001...
    nombreEspecialidad: varchar('nombre_especialidad', { length: 50 }).notNull(),
    descripcion: varchar('descripcion', { length: 150 }).notNull(),
});

export type Especialidad = typeof especialidades.$inferSelect;
export type NewEspecialidad = typeof especialidades.$inferInsert;
