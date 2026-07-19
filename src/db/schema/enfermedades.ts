import { mysqlTable, varchar, text } from 'drizzle-orm/mysql-core';

/**
 * Tabla: enfermedades
 * Catálogo de enfermedades para estandarizar diagnósticos
 */
export const enfermedades = mysqlTable('enfermedades', {
    codigoEnfermedad: varchar('codigo_enfermedad', { length: 10 }).primaryKey().notNull(), // ENF-001...
    nombreEnfermedad: varchar('nombre_enfermedad', { length: 100 }).notNull(),
    tipoPatologia: varchar('tipo_patologia', { length: 50 }).notNull(), // Ej: Respiratoria, Cardiaca, Viral...
    descripcion: varchar('descripcion', { length: 150 }),
});

export type Enfermedad = typeof enfermedades.$inferSelect;
export type NewEnfermedad = typeof enfermedades.$inferInsert;
