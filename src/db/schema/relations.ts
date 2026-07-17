import { mysqlTable, varchar, text, date, int, index, primaryKey, foreignKey } from 'drizzle-orm/mysql-core';
import { abordaje } from './abordajes';
import { comunidades } from './comunidades';
import { consultas } from './consultas';
import { enfermedades } from './enfermedades';
import { medicamentos } from './medicamentos';
import { pacientes } from './pacientes';
import { tejedores } from './tejedores';

/**
 * Tabla puente: abordaje_comunidad
 * Relación muchos a muchos entre abordajes y comunidades
 */
export const abordajeComunidad = mysqlTable('abordaje_comunidad', {
    codigoAbordaje: varchar('codigo_abordaje', { length: 10 }).notNull(),
    codigoComunidad: varchar('codigo_comunidad', { length: 20 }).notNull(),
    observaciones: text('observaciones'),
}, (table) => ({
    pk: primaryKey({ columns: [table.codigoAbordaje, table.codigoComunidad], name: 'ab_com_pk' }),
    codigoComunidadIdx: index('idx_codigo_comunidad').on(table.codigoComunidad),
    abFk: foreignKey({
        columns: [table.codigoAbordaje],
        foreignColumns: [abordaje.codigoAbordaje],
        name: 'ab_com_ab_fk'
    }).onDelete('cascade').onUpdate('cascade'),
    comFk: foreignKey({
        columns: [table.codigoComunidad],
        foreignColumns: [comunidades.codigoComunidad],
        name: 'ab_com_com_fk'
    }).onDelete('restrict').onUpdate('cascade'),
}));

/**
 * Tabla puente: consultas_enfermedades
 * Relación muchos a muchos entre consultas y enfermedades
 */
export const consultasEnfermedades = mysqlTable('consultas_enfermedades', {
    codigoConsulta: varchar('codigo_consulta', { length: 10 }).notNull(),
    codigoEnfermedad: varchar('codigo_enfermedad', { length: 10 }).notNull(),
    observacionEspecifica: text('observacion_especifica'), // Nota opcional sobre esta enfermedad en este paciente
}, (table) => ({
    pk: primaryKey({ columns: [table.codigoConsulta, table.codigoEnfermedad], name: 'cons_enf_pk' }),
    codigoEnfermedadIdx: index('idx_codigo_enfermedad').on(table.codigoEnfermedad),
    consFk: foreignKey({
        columns: [table.codigoConsulta],
        foreignColumns: [consultas.codigoConsulta],
        name: 'cons_enf_cons_fk'
    }).onDelete('cascade').onUpdate('cascade'),
    enfFk: foreignKey({
        columns: [table.codigoEnfermedad],
        foreignColumns: [enfermedades.codigoEnfermedad],
        name: 'cons_enf_enf_fk'
    }).onDelete('restrict').onUpdate('cascade'),
}));

/**
 * Tabla puente: medicamentos_pacientes
 * Relación de entrega de medicamentos a pacientes
 */
export const medicamentosPacientes = mysqlTable('medicamentos_pacientes', {
    codigoMedicamento: varchar('codigo_medicamento', { length: 10 }).notNull(),
    cedulaPaciente: varchar('cedula_paciente', { length: 12 }).notNull(),
    codigoAbordaje: varchar('codigo_abordaje', { length: 10 }).notNull(),
    fechaEntrega: date('fecha_entrega', { mode: 'date' }).notNull(),
    cantidadEntregada: int('cantidad_entregada').notNull(),
    cedulaTejedor: varchar('cedula_tejedor', { length: 12 }).notNull(),
}, (table) => ({
    pk: primaryKey({ columns: [table.codigoMedicamento, table.cedulaPaciente, table.codigoAbordaje], name: 'med_pac_pk' }),
    cedulaPacienteIdx: index('idx_cedula_paciente').on(table.cedulaPaciente),
    cedulaTejedorIdx: index('idx_cedula_tejedor').on(table.cedulaTejedor),
    codigoAbordajeIdx: index('idx_codigo_abordaje').on(table.codigoAbordaje),
    medFk: foreignKey({
        columns: [table.codigoMedicamento],
        foreignColumns: [medicamentos.codigoMedicamento],
        name: 'med_pac_med_fk'
    }).onDelete('restrict').onUpdate('cascade'),
    pacFk: foreignKey({
        columns: [table.cedulaPaciente],
        foreignColumns: [pacientes.cedulaPaciente],
        name: 'med_pac_pac_fk'
    }).onDelete('restrict').onUpdate('cascade'),
    tejFk: foreignKey({
        columns: [table.cedulaTejedor],
        foreignColumns: [tejedores.cedulaTejedor],
        name: 'med_pac_tej_fk'
    }).onDelete('restrict').onUpdate('cascade'),
    abFk: foreignKey({
        columns: [table.codigoAbordaje],
        foreignColumns: [abordaje.codigoAbordaje],
        name: 'med_pac_ab_fk'
    }).onDelete('cascade').onUpdate('cascade'),
}));

/**
 * Tabla puente: tejedores_abordaje
 * Relación muchos a muchos entre tejedores y abordajes
 */
export const tejedoresAbordaje = mysqlTable('tejedores_abordaje', {
    codigoAbordaje: varchar('codigo_abordaje', { length: 10 }).notNull(),
    cedulaTejedor: varchar('cedula_tejedor', { length: 12 }).notNull(),
    rolEnAbordaje: varchar('rol_en_abordaje', { length: 50 }),
}, (table) => ({
    pk: primaryKey({ columns: [table.codigoAbordaje, table.cedulaTejedor], name: 'tej_ab_pk' }),
    cedulaTejedorIdx: index('idx_cedula_tejedor').on(table.cedulaTejedor),
    abFk: foreignKey({
        columns: [table.codigoAbordaje],
        foreignColumns: [abordaje.codigoAbordaje],
        name: 'tej_ab_ab_fk'
    }).onDelete('cascade').onUpdate('cascade'),
    tejFk: foreignKey({
        columns: [table.cedulaTejedor],
        foreignColumns: [tejedores.cedulaTejedor],
        name: 'tej_ab_tej_fk'
    }).onDelete('restrict').onUpdate('cascade'),
}));

// Export types for all bridge tables
export type AbordajeComunidad = typeof abordajeComunidad.$inferSelect;
export type NewAbordajeComunidad = typeof abordajeComunidad.$inferInsert;

export type ConsultaEnfermedad = typeof consultasEnfermedades.$inferSelect;
export type NewConsultaEnfermedad = typeof consultasEnfermedades.$inferInsert;

export type MedicamentoPaciente = typeof medicamentosPacientes.$inferSelect;
export type NewMedicamentoPaciente = typeof medicamentosPacientes.$inferInsert;

export type TejedorAbordaje = typeof tejedoresAbordaje.$inferSelect;
export type NewTejedorAbordaje = typeof tejedoresAbordaje.$inferInsert;
