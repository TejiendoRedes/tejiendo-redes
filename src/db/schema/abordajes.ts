import { mysqlTable, varchar, date, time, text, int, boolean } from 'drizzle-orm/mysql-core';

/**
 * Tabla: abordaje
 * Registros de abordajes comunitarios
 */
export const abordaje = mysqlTable('abordaje', {
    codigoAbordaje: varchar('codigo_abordaje', { length: 10 }).primaryKey().notNull(), // ABD-001...
    codigoComunidad: varchar('codigo_comunidad', { length: 10 }).notNull(), // COM-001...
    codigoSolicitud: varchar('codigo_solicitud', { length: 10 }), // Opcional, si viene de una solicitud específica
    fechaAbordaje: date('fecha_abordaje', { mode: 'date' }).notNull(),
    horaInicio: time('hora_inicio').notNull(),
    horaFin: time('hora_fin').notNull(),
    descripcion: text('descripcion').notNull(),
    // Campos unificados de la solicitud
    tipoAbordaje: varchar('tipo_abordaje', { length: 50 }),
    participantesEstimados: int('participantes_estimados'),
    recursosAdicionales: text('recursos_adicionales'),
    transporte: boolean('transporte').default(false),
    refrigerios: boolean('refrigerios').default(false),
    espacioCubierto: boolean('espacio_cubierto').default(false),
    notasLogistica: text('notas_logistica'),
    estado: varchar('estado', { length: 20 }).notNull().default('Planificado'),
    notas: text('notas'),
});

export type Abordaje = typeof abordaje.$inferSelect;
export type NewAbordaje = typeof abordaje.$inferInsert;
