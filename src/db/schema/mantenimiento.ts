import { mysqlTable, int, varchar, datetime, boolean } from 'drizzle-orm/mysql-core';

/**
 * Tabla: configuracion_backup
 * Almacena la configuración de las copias de seguridad automáticas
 */
export const configuracionBackup = mysqlTable('configuracion_backup', {
    id: int('id').primaryKey().autoincrement(),
    frecuencia: varchar('frecuencia', { length: 20 }).notNull().default('manual'), // cada 3 días, semanal, mensual, manual
    ultimaCopia: datetime('ultima_copia'),
    proximaCopia: datetime('proxima_copia'),
    autoRefresh: boolean('auto_refresh').notNull().default(false),
});

export type ConfiguracionBackup = typeof configuracionBackup.$inferSelect;
export type NewConfiguracionBackup = typeof configuracionBackup.$inferInsert;
