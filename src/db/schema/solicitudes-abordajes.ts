import { mysqlTable, varchar, int, datetime, date, time, text, index, foreignKey, boolean } from 'drizzle-orm/mysql-core';
import { comunidades } from './comunidades';

/**
 * Tabla: solicitudes_abordajes
 * Solicitudes de abordajes pendientes de confirmación
 */
export const solicitudesAbordajes = mysqlTable('solicitudes_abordajes', {
    id: int('id').primaryKey().autoincrement(),
    codigoSolicitud: varchar('codigo_solicitud', { length: 10 }).notNull(), // SAB-001...
    codigoComunidad: varchar('codigo_comunidad', { length: 20 }), // Made nullable for manual entry
    comunidadSugerida: varchar('comunidad_sugerida', { length: 255 }), // If not in list
    fechaSugerida: date('fecha_sugerida', { mode: 'string' }).notNull(), // Formato flexible para fecha sugerida
    horaInicioSugerida: time('hora_inicio_sugerida').notNull(), // Formato flexible para hora
    descripcionActividad: text('descripcion_actividad').notNull(),
    tipoAbordaje: varchar('tipo_abordaje', { length: 150 }).notNull(), // Uno o más tipos separados por comas: Educativo,Médico,Social, etc.
    participantesEstimados: int('participantes_estimados').notNull(),
    recursosAdicionales: text('recursos_adicionales'), // Qué más se necesita
    estado: varchar('estado', { length: 20 }).notNull().default('pendiente'), // pendiente, confirmado, rechazado
    logisticaLugar: boolean('logistica_lugar').notNull().default(false),
    logisticaPersonal: boolean('logistica_personal').notNull().default(false),
    logisticaRefrigerios: boolean('logistica_refrigerios').notNull().default(false),
    logisticaTransporte: boolean('logistica_transporte').notNull().default(false),
    fechaSolicitud: datetime('fecha_solicitud').notNull().default(new Date()),
    notas: text('notas'),
}, (table) => ({
    comunidadIdx: index('idx_comunidad').on(table.codigoComunidad),
    estadoIdx: index('idx_estado').on(table.estado),
    fechaIdx: index('idx_fecha').on(table.fechaSolicitud),
    solAbordComComFk: foreignKey({
        columns: [table.codigoComunidad],
        foreignColumns: [comunidades.codigoComunidad],
        name: 'sol_abord_com_com_fk',
    }),
}));

export type SolicitudAbordaje = typeof solicitudesAbordajes.$inferSelect;
export type NewSolicitudAbordaje = typeof solicitudesAbordajes.$inferInsert;
