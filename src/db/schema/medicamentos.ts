import { mysqlTable, varchar, text, int, decimal } from 'drizzle-orm/mysql-core';

/**
 * Tabla: medicamentos
 * Inventario de medicamentos
 */
export const medicamentos = mysqlTable('medicamentos', {
    codigoMedicamento: varchar('codigo_medicamento', { length: 10 }).primaryKey().notNull(), // MED-001...
    nombreMedicamento: varchar('nombre_medicamento', { length: 100 }).notNull(),
    presentacion: varchar('presentacion', { length: 50 }).notNull(),
    descripcion: varchar('descripcion', { length: 150 }).notNull(),
    existencia: int('existencia').notNull().default(0),
    precio: decimal('precio', { precision: 10, scale: 2, mode: 'number' }).notNull().default(0),
});

export type Medicamento = typeof medicamentos.$inferSelect;
export type NewMedicamento = typeof medicamentos.$inferInsert;
