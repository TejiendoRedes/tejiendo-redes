import { mysqlTable, varchar, int, foreignKey } from 'drizzle-orm/mysql-core';

/**
 * Tabla: estados
 * Catalogo de los 24 estados de Venezuela
 */
export const estados = mysqlTable('estados', {
    id: int('id').primaryKey().autoincrement(),
    nombre: varchar('nombre', { length: 100 }).notNull().unique(),
});

/**
 * Tabla: municipios
 * Catalogo de municipios por estado
 */
export const municipios = mysqlTable('municipios', {
    id: int('id').primaryKey().autoincrement(),
    estadoId: int('estado_id').notNull().references(() => estados.id),
    nombre: varchar('nombre', { length: 100 }).notNull(),
});

/**
 * Tabla: parroquias
 * Catalogo de parroquias por municipio
 */
export const parroquias = mysqlTable('parroquias', {
    id: int('id').primaryKey().autoincrement(),
    municipioId: int('municipio_id').notNull().references(() => municipios.id),
    nombre: varchar('nombre', { length: 100 }).notNull(),
});

export type Estado = typeof estados.$inferSelect;
export type Municipio = typeof municipios.$inferSelect;
export type Parroquia = typeof parroquias.$inferSelect;
