import { mysqlTable, varchar, int, datetime, index } from 'drizzle-orm/mysql-core';
import { pacientes } from './pacientes';
import { medicamentos } from './medicamentos';
import { abordaje } from './abordajes';

/**
 * Tabla: peticiones
 * Peticiones de medicamentos por pacientes
 */
export const peticiones = mysqlTable('peticiones', {
    id: int('id').primaryKey().autoincrement(),
    codigoPaciente: varchar('codigo_paciente', { length: 12 }).notNull().references(() => pacientes.cedulaPaciente, {
        onDelete: 'restrict',
        onUpdate: 'cascade'
    }),
    codigoMedicamento: varchar('codigo_medicamento', { length: 10 }).notNull().references(() => medicamentos.codigoMedicamento, {
        onDelete: 'restrict',
        onUpdate: 'cascade'
    }),
    cantidad: int('cantidad').notNull(),
    fechaPeticion: datetime('fecha_peticion').notNull().default(new Date()),
    fechaEntrega: datetime('fecha_entrega'), // Fecha de entrega/aprobación
    horaEntrega: varchar('hora_entrega', { length: 8 }), // Hora de entrega HH:MM:SS
    estado: varchar('estado', { length: 20 }).notNull().default('pendiente'), // pendiente, entregado, cancelado
    codigoAbordaje: varchar('codigo_abordaje', { length: 10 }).references(() => abordaje.codigoAbordaje, {
        onDelete: 'restrict',
        onUpdate: 'cascade'
    }),
    notas: varchar('notas', { length: 255 }),
}, (table) => ({
    pacienteIdx: index('idx_paciente').on(table.codigoPaciente),
    medicamentoIdx: index('idx_medicamento').on(table.codigoMedicamento),
    abordajeIdx: index('idx_abordaje').on(table.codigoAbordaje),
    fechaIdx: index('idx_fecha').on(table.fechaPeticion),
}));

export type Peticion = typeof peticiones.$inferSelect;
export type NewPeticion = typeof peticiones.$inferInsert;
