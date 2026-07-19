import { mysqlTable, varchar, date, int } from 'drizzle-orm/mysql-core';
import { parroquias } from './geografia';

/**
 * Tabla: aspirantes
 * Personas en lista de espera para ser confirmadas como Tejedores
 */
export const aspirantes = mysqlTable('aspirantes', {
    cedulaAspirante: varchar('cedula_aspirante', { length: 12 }).primaryKey().notNull(),
    nombreAspirante: varchar('nombre_aspirante', { length: 30 }).notNull(),
    apellidoAspirante: varchar('apellido_aspirante', { length: 30 }).notNull(),
    fechaNacimiento: date('fecha_nacimiento', { mode: 'date' }).notNull(),
    direccionAspirante: varchar('direccion_aspirante', { length: 150 }).notNull(),
    parroquiaId: int('parroquia_id').references(() => parroquias.id).notNull(),
    telefonoAspirante: varchar('telefono_aspirante', { length: 15 }).notNull(),
    correoAspirante: varchar('correo_aspirante', { length: 100 }).notNull(),
    profesionAspirante: varchar('profesion_aspirante', { length: 50 }).notNull(),
    username: varchar('username', { length: 30 }).unique(), // Vincula aspirante ↔ usuario de forma directa
    fechaPostulacion: date('fecha_postulacion', { mode: 'date' }).notNull(),
    // 'Pendiente', 'Aprobado', 'Rechazado'
    estadoAspirante: varchar('estado_aspirante', { length: 20 }).notNull().default('Pendiente'),
});

export type Aspirante = typeof aspirantes.$inferSelect;
export type NewAspirante = typeof aspirantes.$inferInsert;
