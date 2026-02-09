import { mysqlTable, varchar, char, date, text, index } from 'drizzle-orm/mysql-core';
import { comunidades } from './comunidades';

/**
 * Tabla: pacientes
 * Pacientes atendidos en las comunidades
 */
export const pacientes = mysqlTable('pacientes', {
    cedulaPaciente: varchar('cedula_paciente', { length: 12 }).primaryKey().notNull(),
    codigoComunidad: varchar('codigo_comunidad', { length: 10 }).notNull().references(() => comunidades.codigoComunidad, {
        onDelete: 'restrict',
        onUpdate: 'cascade'
    }),
    nombrePaciente: varchar('nombre_paciente', { length: 50 }).notNull(),
    apellidoPaciente: varchar('apellido_paciente', { length: 50 }).notNull(),
    sexo: char('sexo', { length: 1 }).notNull(), // M=Masculino, F=Femenino
    fechaNacimiento: date('fecha_nacimiento', { mode: 'date' }).notNull(),
    estado: varchar('estado', { length: 2 }).notNull(),
    municipio: varchar('municipio', { length: 2 }).notNull(),
    parroquia: varchar('parroquia', { length: 2 }).notNull(),
    direccionPaciente: varchar('direccion_paciente', { length: 150 }).notNull(),
    telefonoPaciente: varchar('telefono_paciente', { length: 15 }).notNull(),
    correoPaciente: varchar('correo_paciente', { length: 100 }).notNull(),
    nota: text('nota'),
}, (table) => ({
    codigoComunidadIdx: index('idx_codigo_comunidad').on(table.codigoComunidad),
}));

export type Paciente = typeof pacientes.$inferSelect;
export type NewPaciente = typeof pacientes.$inferInsert;
