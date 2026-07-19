import { sql } from 'drizzle-orm';
import { mysqlTable, varchar, int, index, timestamp, text, foreignKey } from 'drizzle-orm/mysql-core';
import { pacientes } from './pacientes';
import { medicamentos } from './medicamentos';
import { abordaje } from './abordajes';
import { tejedores } from './tejedores';

/**
 * Tabla: entregas_medicamentos
 * Sustituye a la antigua tabla de peticiones y medicamentos_pacientes.
 * Despachos directos de medicamentos a pacientes, ya sea en sede o en abordajes.
 */
export const entregasMedicamentos = mysqlTable('entregas_medicamentos', {
    id: int('id').autoincrement().primaryKey(),
    codigoMedicamento: varchar('codigo_medicamento', { length: 10 }).notNull(),
    codigoPaciente: varchar('codigo_paciente', { length: 12 }).notNull(),
    codigoAbordaje: varchar('codigo_abordaje', { length: 10 }),
    fechaEntrega: timestamp('fecha_entrega', { mode: 'date' }).notNull(),
    horaEntrega: varchar('hora_entrega', { length: 8 }),
    cantidad: int('cantidad').notNull().default(1),
    estado: varchar('estado', { length: 20 }).notNull().default('entregado'),
    cedulaTejedor: varchar('cedula_tejedor', { length: 12 }),
    notas: text('notas')
}, (table) => ({
    pacienteFk: foreignKey({
        columns: [table.codigoPaciente],
        foreignColumns: [pacientes.cedulaPaciente],
        name: 'ent_med_paciente_fk'
    }).onDelete('restrict').onUpdate('cascade'),
    medicamentoFk: foreignKey({
        columns: [table.codigoMedicamento],
        foreignColumns: [medicamentos.codigoMedicamento],
        name: 'ent_med_med_fk'
    }).onDelete('restrict').onUpdate('cascade'),
    abordajeFk: foreignKey({
        columns: [table.codigoAbordaje],
        foreignColumns: [abordaje.codigoAbordaje],
        name: 'ent_med_abord_fk'
    }).onDelete('restrict').onUpdate('cascade'),
    tejedorFk: foreignKey({
        columns: [table.cedulaTejedor],
        foreignColumns: [tejedores.cedulaTejedor],
        name: 'ent_med_tej_fk'
    }).onDelete('set null').onUpdate('cascade'),
    medicamentoIdx: index('idx_medicamento').on(table.codigoMedicamento),
    abordajeIdx: index('idx_abordaje').on(table.codigoAbordaje),
    fechaIdx: index('idx_fecha').on(table.fechaEntrega),
}));

export type EntregaMedicamento = typeof entregasMedicamentos.$inferSelect;
export type NewEntregaMedicamento = typeof entregasMedicamentos.$inferInsert;
