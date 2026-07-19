import { mysqlTable, varchar, text, int, mediumint, index, boolean } from 'drizzle-orm/mysql-core';
import { responsable } from './responsable';
import { parroquias } from './geografia';

/**
 * Tabla: comunidades
 * Comunidades atendidas por la organización
 */
export const comunidades = mysqlTable('comunidades', {
    codigoComunidad: varchar('codigo_comunidad', { length: 20 }).primaryKey().notNull(), // EST-MUN-PAR-001...
    nombreComunidad: varchar('nombre_comunidad', { length: 150 }).notNull(),
    tipoComunidad: varchar('tipo_comunidad', { length: 50 }).notNull(),
    parroquiaId: int('parroquia_id').notNull().references(() => parroquias.id),
    direccion: varchar('direccion', { length: 150 }).notNull(),
    cedulaResponsable: varchar('cedula_responsable', { length: 12 }).notNull().references(() => responsable.cedulaResponsable, {
        onDelete: 'restrict',
        onUpdate: 'cascade'
    }),
    cantidadHabitantes: int('cantidad_habitantes').notNull(),
    cantidadFamilias: mediumint('cantidad_familias').notNull(),
    cantidadNinos: int('cantidad_ninos').notNull(),
    cantidadAdolescentes: int('cantidad_adolescentes').notNull(),
    cantidadMayores: int('cantidad_mayores').notNull(),
    cantidadMayores60: int('cantidad_mayores_60').notNull(),
    telefonoComunidad: varchar('telefono_comunidad', { length: 15 }).notNull(),
}, (table) => ({
    cedulaResponsableIdx: index('idx_cedula_responsable').on(table.cedulaResponsable),
}));

export type Comunidad = typeof comunidades.$inferSelect;
export type NewComunidad = typeof comunidades.$inferInsert;
