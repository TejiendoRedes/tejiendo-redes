import { mysqlTable, varchar, text, index } from 'drizzle-orm/mysql-core';
import { tejedores } from './tejedores';

/**
 * Tabla: organismos
 * Organismos asociados con tejedores
 */
export const organismos = mysqlTable('organismos', {
    codigoOrganismo: varchar('codigo_organismo', { length: 10 }).primaryKey().notNull(), // ORG-001...
    cedulaTejedor: varchar('cedula_tejedor', { length: 12 }).notNull().references(() => tejedores.cedulaTejedor, {
        onDelete: 'restrict',
        onUpdate: 'cascade'
    }),
    nombreOrganismo: varchar('nombre_organismo', { length: 100 }).notNull(),
    tipoInstitucion: varchar('tipo_institucion', { length: 50 }).notNull(),
    paisOrganismo: varchar('pais_organismo', { length: 50 }).notNull(),
    estadoOrganismo: varchar('estado_organismo', { length: 25 }).notNull(),
    municipioOrganismo: varchar('municipio_organismo', { length: 50 }).notNull(),
    direccionOrganismo: varchar('direccion_organismo', { length: 150 }).notNull(),
    ubicacionFisica: text('ubicacion_fisica').notNull(),
    correoOrganismo: varchar('correo_organismo', { length: 100 }).notNull(),
    telefonoOrganismo: varchar('telefono_organismo', { length: 15 }).notNull(),
}, (table) => ({
    cedulaTejedorIdx: index('idx_cedula_tejedor').on(table.cedulaTejedor),
}));

export type Organismo = typeof organismos.$inferSelect;
export type NewOrganismo = typeof organismos.$inferInsert;
