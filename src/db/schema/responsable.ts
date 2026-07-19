import { mysqlTable, varchar, index, int } from 'drizzle-orm/mysql-core';
import { parroquias } from './geografia';

/**
 * Tabla: responsable
 * Solo para responsables de COMUNIDADES
 */
export const responsable = mysqlTable('responsable', {
    cedulaResponsable: varchar('cedula_responsable', { length: 12 }).primaryKey().notNull(),
    nombreResponsable: varchar('nombre_responsable', { length: 30 }).notNull(),
    apellidoResponsable: varchar('apellido_responsable', { length: 30 }).notNull(),
    direccionResponsable: varchar('direccion_responsable', { length: 150 }).notNull(),
    telefonoResponsable: varchar('telefono_responsable', { length: 15 }).notNull(),
    correoResponsable: varchar('correo_responsable', { length: 100 }).notNull(),
    cargo: varchar('cargo', { length: 30 }).notNull(), // Ej: Presidente, Vocal, etc.
    parroquiaId: int('parroquia_id').notNull().references(() => parroquias.id),
});

export type Responsable = typeof responsable.$inferSelect;
export type NewResponsable = typeof responsable.$inferInsert;
