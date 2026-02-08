import { mysqlTable, varchar, date, time, text } from 'drizzle-orm/mysql-core';

/**
 * Tabla: abordaje
 * Registros de abordajes comunitarios
 */
export const abordaje = mysqlTable('abordaje', {
    codigoAbordaje: varchar('codigo_abordaje', { length: 10 }).primaryKey().notNull(), // ABD-001...
    fechaAbordaje: date('fecha_abordaje', { mode: 'date' }).notNull(),
    horaInicio: time('hora_inicio').notNull(),
    horaFin: time('hora_fin').notNull(),
    descripcion: text('descripcion').notNull(),
    estado: varchar('estado', { length: 20 }).notNull().default('Planificado'),
});

export type Abordaje = typeof abordaje.$inferSelect;
export type NewAbordaje = typeof abordaje.$inferInsert;
