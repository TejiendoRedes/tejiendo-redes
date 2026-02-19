import { mysqlTable, varchar, text, index, datetime } from 'drizzle-orm/mysql-core';
import { abordaje } from './abordajes';
import { pacientes } from './pacientes';
import { medicos } from './medicos';

/**
 * Tabla: consultas
 * Consultas médicas realizadas en abordajes
 */
export const consultas = mysqlTable('consultas', {
    codigoConsulta: varchar('codigo_consulta', { length: 10 }).primaryKey().notNull(), // CON-001...
    codigoAbordaje: varchar('codigo_abordaje', { length: 10 }).references(() => abordaje.codigoAbordaje, {
        onDelete: 'restrict',
        onUpdate: 'cascade'
    }),
    fechaConsulta: datetime('fecha_consulta').notNull().default(new Date()),
    cedulaPaciente: varchar('cedula_paciente', { length: 12 }).notNull().references(() => pacientes.cedulaPaciente, {
        onDelete: 'restrict',
        onUpdate: 'cascade'
    }),
    cedulaMedico: varchar('cedula_medico', { length: 12 }).notNull().references(() => medicos.cedulaTejedor, {
        onDelete: 'restrict',
        onUpdate: 'cascade'
    }),
    motivoConsulta: text('motivo_consulta').notNull(),
    diagnosticoTexto: text('diagnostico_texto').notNull(), // Diagnóstico narrativo del médico
    recomendaciones: text('recomendaciones').notNull(),
    tratamiento: text('tratamiento').notNull(),
    tensionArterial: varchar('tension_arterial', { length: 20 }),
}, (table) => ({
    codigoAbordajeIdx: index('idx_codigo_abordaje').on(table.codigoAbordaje),
    cedulaPacienteIdx: index('idx_cedula_paciente').on(table.cedulaPaciente),
    cedulaMedicoIdx: index('idx_cedula_medico').on(table.cedulaMedico),
}));

export type Consulta = typeof consultas.$inferSelect;
export type NewConsulta = typeof consultas.$inferInsert;
