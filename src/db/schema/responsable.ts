import { mysqlTable, varchar, index } from 'drizzle-orm/mysql-core';

/**
 * Tabla: responsable
 * Solo para responsables de COMUNIDADES
 */
export const responsable = mysqlTable('responsable', {
    cedulaResponsable: varchar('cedula_responsable', { length: 12 }).primaryKey().notNull(),
    nombreResponsable: varchar('nombre_responsable', { length: 50 }).notNull(),
    apellidoResponsable: varchar('apellido_responsable', { length: 50 }).notNull(),
    direccionResponsable: varchar('direccion_responsable', { length: 150 }).notNull(),
    telefonoResponsable: varchar('telefono_responsable', { length: 15 }).notNull(),
    correoResponsable: varchar('correo_responsable', { length: 100 }).notNull(),
    cargo: varchar('cargo', { length: 50 }).notNull(), // Ej: Presidente, Vocal, etc.
    estado: varchar('estado', { length: 2 }).notNull(),
    municipio: varchar('municipio', { length: 2 }).notNull(),
    parroquia: varchar('parroquia', { length: 2 }).notNull(),
});

export type Responsable = typeof responsable.$inferSelect;
export type NewResponsable = typeof responsable.$inferInsert;
