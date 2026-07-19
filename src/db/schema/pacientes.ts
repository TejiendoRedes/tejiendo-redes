import { mysqlTable, varchar, char, date, text, index } from 'drizzle-orm/mysql-core';
import { comunidades } from './comunidades';

/**
 * Tabla: pacientes
 * Pacientes atendidos en las comunidades
 */
export const pacientes = mysqlTable('pacientes', {
    cedulaPaciente: varchar('cedula_paciente', { length: 12 }).primaryKey().notNull(),
    codigoComunidad: varchar('codigo_comunidad', { length: 20 }).notNull().references(() => comunidades.codigoComunidad, {
        onDelete: 'restrict',
        onUpdate: 'cascade'
    }),
    nombrePaciente: varchar('nombre_paciente', { length: 30 }).notNull(),
    apellidoPaciente: varchar('apellido_paciente', { length: 30 }).notNull(),
    sexo: char('sexo', { length: 1 }).notNull(), // M=Masculino, F=Femenino
    fechaNacimiento: date('fecha_nacimiento', { mode: 'date' }).notNull(),
    direccionPaciente: varchar('direccion_paciente', { length: 150 }).notNull(),
    telefonoPaciente: varchar('telefono_paciente', { length: 15 }).notNull(),
    correoPaciente: varchar('correo_paciente', { length: 100 }).notNull(),
    historialEnfermedades: text('historial_enfermedades'),
    consultasMedicasPrevias: text('consultas_medicas_previas'),
    nota: text('nota'),
}, (table) => ({
    codigoComunidadIdx: index('idx_codigo_comunidad').on(table.codigoComunidad),
}));

export type Paciente = typeof pacientes.$inferSelect;
export type NewPaciente = typeof pacientes.$inferInsert;
