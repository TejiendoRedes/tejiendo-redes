import { mysqlTable, varchar, decimal, text, index } from 'drizzle-orm/mysql-core';
import { pacientes } from './pacientes';

/**
 * Tabla: antecedentes
 * Historial médico de pacientes
 */
export const antecedentes = mysqlTable('antecedentes', {
    codigoAntecedente: varchar('codigo_antecedente', { length: 10 }).primaryKey().notNull(), // ANT-001...
    cedulaPaciente: varchar('cedula_paciente', { length: 12 }).notNull().references(() => pacientes.cedulaPaciente, {
        onDelete: 'restrict',
        onUpdate: 'cascade'
    }),
    enfermedadesPrevias: text('enfermedades_previas').notNull(), // Historial de enfermedades pasadas
    alergias: text('alergias').notNull(),
    enfermedadesFamilia: text('enfermedades_familia').notNull(),
    cirugiasPrevias: text('cirugias_previas'),
    medicamentosActuales: text('medicamentos_actuales'),
}, (table) => ({
    cedulaPacienteIdx: index('idx_cedula_paciente').on(table.cedulaPaciente),
}));

export type Antecedente = typeof antecedentes.$inferSelect;
export type NewAntecedente = typeof antecedentes.$inferInsert;
