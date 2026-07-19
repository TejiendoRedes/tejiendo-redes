import { mysqlTable, varchar, date, time, text, int, boolean } from 'drizzle-orm/mysql-core';
import { comunidades } from './comunidades';
import { solicitudesAbordajes } from './solicitudes-abordajes';

/**
 * Tabla: abordaje
 * Registros de abordajes comunitarios
 */
export const abordaje = mysqlTable('abordaje', {
    codigoAbordaje: varchar('codigo_abordaje', { length: 10 }).primaryKey().notNull(), // ABD-001...
    codigoComunidad: varchar('codigo_comunidad', { length: 20 }).notNull().references(() => comunidades.codigoComunidad, {
        onDelete: 'restrict',
        onUpdate: 'cascade'
    }), // EST-MUN-PAR-001...
    codigoSolicitud: varchar('codigo_solicitud', { length: 10 }).references(() => solicitudesAbordajes.codigoSolicitud, {
        onDelete: 'set null',
        onUpdate: 'cascade'
    }), // Opcional, si viene de una solicitud específica
    fechaAbordaje: date('fecha_abordaje', { mode: 'date' }).notNull(),
    horaInicio: time('hora_inicio').notNull(),
    horaFin: time('hora_fin').notNull(),
    descripcion: text('descripcion').notNull(),
    // Campos unificados de la solicitud
    tipoAbordaje: varchar('tipo_abordaje', { length: 150 }), // Uno o más tipos separados por comas
    participantesEstimados: int('participantes_estimados'),
    recursosAdicionales: text('recursos_adicionales'),
    lugar: boolean('lugar').notNull().default(false),
    personal: boolean('personal').notNull().default(false),
    refrigerios: boolean('refrigerios').notNull().default(false),
    transporte: boolean('transporte').notNull().default(false),
    estado: varchar('estado', { length: 20 }).notNull().default('Pendiente'),
    notas: text('notas'),
    observacionesComunidad: text('observaciones_comunidad'),
});

export type Abordaje = typeof abordaje.$inferSelect;
export type NewAbordaje = typeof abordaje.$inferInsert;
