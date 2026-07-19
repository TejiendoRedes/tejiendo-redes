import { mysqlTable, varchar, date, datetime, int } from 'drizzle-orm/mysql-core';
import { parroquias } from './geografia';

/**
 * Tabla: tejedores
 * Todos los voluntarios/colaboradores de la organización
 */
export const tejedores = mysqlTable('tejedores', {
    cedulaTejedor: varchar('cedula_tejedor', { length: 12 }).primaryKey().notNull(),
    nombreTejedor: varchar('nombre_tejedor', { length: 30 }).notNull(),
    apellidoTejedor: varchar('apellido_tejedor', { length: 30 }).notNull(),
    fechaNacimiento: date('fecha_nacimiento', { mode: 'date' }).notNull(),
    direccionTejedor: varchar('direccion_tejedor', { length: 150 }).notNull(),
    parroquiaId: int('parroquia_id').notNull().references(() => parroquias.id),
    telefonoTejedor: varchar('telefono_tejedor', { length: 15 }).notNull(),
    correoTejedor: varchar('correo_tejedor', { length: 100 }).notNull(),
    profesionTejedor: varchar('profesion_tejedor', { length: 50 }).notNull(),
    fechaIngreso: date('fecha_ingreso', { mode: 'date' }).notNull(),
    tipodeVoluntario: varchar('tipo_voluntario', { length: 30 }).notNull(),
});

export type Tejedor = typeof tejedores.$inferSelect;
export type NewTejedor = typeof tejedores.$inferInsert;
