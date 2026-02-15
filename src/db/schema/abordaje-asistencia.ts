import { mysqlTable, varchar, datetime, serial, text, mysqlEnum, index } from 'drizzle-orm/mysql-core';
import { abordaje } from './abordajes';
import { pacientes } from './pacientes';

/**
 * Tabla: abordaje_asistencia
 * Registro de pacientes que asisten a un abordaje (Check-in y flujo)
 */
export const abordajeAsistencia = mysqlTable('abordaje_asistencia', {
    id: serial('id').primaryKey(),
    codigoAbordaje: varchar('codigo_abordaje', { length: 10 }).notNull().references(() => abordaje.codigoAbordaje, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
    }),
    cedulaPaciente: varchar('cedula_paciente', { length: 12 }).notNull().references(() => pacientes.cedulaPaciente, {
        onDelete: 'restrict',
        onUpdate: 'cascade'
    }),
    horaLlegada: datetime('hora_llegada').notNull().default(new Date()),
    estado: mysqlEnum('estado', ['En Espera', 'En Triaje', 'En Consulta', 'En Farmacia', 'Finalizado']).notNull().default('En Espera'),
    serviciosRequeridos: text('servicios_requeridos'), // JSON array o texto separado por comas: "Medicina,Farmacia"
    notas: text('notas'),
}, (table) => ({
    codigoAbordajeIdx: index('idx_asistencia_abordaje').on(table.codigoAbordaje),
    cedulaPacienteIdx: index('idx_asistencia_paciente').on(table.cedulaPaciente),
    estadoIdx: index('idx_asistencia_estado').on(table.estado),
}));

export type AbordajeAsistencia = typeof abordajeAsistencia.$inferSelect;
export type NewAbordajeAsistencia = typeof abordajeAsistencia.$inferInsert;
