import { mysqlTable, varchar, int, datetime, text, index, foreignKey } from 'drizzle-orm/mysql-core';
import { comunidades } from './comunidades';

/**
 * Tabla: solicitudes_abordajes
 * Solicitudes de abordajes pendientes de confirmación
 */
export const solicitudesAbordajes = mysqlTable('solicitudes_abordajes', {
    id: int('id').primaryKey().autoincrement(),
    codigoSolicitud: varchar('codigo_solicitud', { length: 10 }).notNull(), // SAB-001...
    codigoComunidad: varchar('codigo_comunidad', { length: 10 }).notNull(),
    fechaSugerida: varchar('fecha_sugerida', { length: 20 }).notNull(), // Formato flexible para fecha sugerida
    horaInicioSugerida: varchar('hora_inicio_sugerida', { length: 10 }).notNull(), // Formato flexible para hora
    descripcionActividad: text('descripcion_actividad').notNull(),
    tipoAbordaje: varchar('tipo_abordaje', { length: 50 }).notNull(), // Educativo, Médico, Social, etc.
    participantesEstimados: int('participantes_estimados').notNull(),
    recursosAdicionales: text('recursos_adicionales'), // Qué más se necesita
    estado: varchar('estado', { length: 20 }).notNull().default('pendiente'), // pendiente, confirmado, rechazado
    fechaSolicitud: datetime('fecha_solicitud').notNull().default(new Date()),
    notas: text('notas'),
    prioridad: varchar('prioridad', { length: 10 }).notNull().default('media'), // alta, media, baja
}, (table) => ({
    comunidadIdx: index('idx_comunidad').on(table.codigoComunidad),
    estadoIdx: index('idx_estado').on(table.estado),
    prioridadIdx: index('idx_prioridad').on(table.prioridad),
    fechaIdx: index('idx_fecha').on(table.fechaSolicitud),
    solAbordComComFk: foreignKey({
        columns: [table.codigoComunidad],
        foreignColumns: [comunidades.codigoComunidad],
        name: 'sol_abord_com_com_fk',
    }),
}));

export type SolicitudAbordaje = typeof solicitudesAbordajes.$inferSelect;
export type NewSolicitudAbordaje = typeof solicitudesAbordajes.$inferInsert;
