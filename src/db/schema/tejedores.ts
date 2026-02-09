import { mysqlTable, varchar, date } from 'drizzle-orm/mysql-core';

/**
 * Tabla: tejedores
 * Todos los voluntarios/colaboradores de la organización
 */
export const tejedores = mysqlTable('tejedores', {
    cedulaTejedor: varchar('cedula_tejedor', { length: 12 }).primaryKey().notNull(),
    nombreTejedor: varchar('nombre_tejedor', { length: 50 }).notNull(),
    apellidoTejedor: varchar('apellido_tejedor', { length: 50 }).notNull(),
    fechaNacimiento: date('fecha_nacimiento', { mode: 'date' }).notNull(),
    direccionTejedor: varchar('direccion_tejedor', { length: 150 }).notNull(),
    municipioTejedor: varchar('municipio_tejedor', { length: 100 }).notNull(),
    estadoTejedor: varchar('estado_tejedor', { length: 100 }).notNull(),
    parroquiaTejedor: varchar('parroquia_tejedor', { length: 100 }).notNull(),
    telefonoTejedor: varchar('telefono_tejedor', { length: 15 }).notNull(),
    correoTejedor: varchar('correo_tejedor', { length: 100 }).notNull(),
    profesionTejedor: varchar('profesion_tejedor', { length: 50 }).notNull(),
    fechaIngreso: date('fecha_ingreso', { mode: 'date' }).notNull(),
    tipodeVoluntario: varchar('tipo_voluntario', { length: 50 }).notNull(),
});

export type Tejedor = typeof tejedores.$inferSelect;
export type NewTejedor = typeof tejedores.$inferInsert;
