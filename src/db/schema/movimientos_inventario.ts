import { sql } from 'drizzle-orm';
import { mysqlTable, varchar, decimal, int, datetime, index, text, timestamp, foreignKey } from 'drizzle-orm/mysql-core';
import { medicamentos } from './medicamentos';
import { tejedores } from './tejedores';

/**
 * Tabla: movimientos_inventario
 * Historial de entradas, salidas y ajustes de inventario (Kardex)
 */
export const movimientosInventario = mysqlTable('movimientos_inventario', {
    id: int('id').autoincrement().primaryKey(),
    codigoMedicamento: varchar('codigo_medicamento', { length: 12 }).notNull(),
    tipoMovimiento: varchar('tipo_movimiento', { length: 20 }).notNull(), // entrada, salida, ajuste
    cantidad: int('cantidad').notNull(),
    fechaMovimiento: timestamp('fecha_movimiento', { mode: 'date' }).notNull().defaultNow(),
    motivo: varchar('motivo', { length: 100 }),
    costoUnitario: decimal('costo_unitario', { precision: 10, scale: 2, mode: 'number' }).notNull().default(0),
    cedulaTejedor: varchar('cedula_tejedor', { length: 12 }),
    notas: text('notas'),
}, (table) => ({
    medicamentoFk: foreignKey({
        columns: [table.codigoMedicamento],
        foreignColumns: [medicamentos.codigoMedicamento],
        name: 'mov_inv_med_fk'
    }).onDelete('restrict').onUpdate('cascade'),
    tejedorFk: foreignKey({
        columns: [table.cedulaTejedor],
        foreignColumns: [tejedores.cedulaTejedor],
        name: 'mov_inv_tej_fk'
    }).onDelete('set null').onUpdate('cascade'),
    medicamentoIdx: index('idx_movimiento_medicamento').on(table.codigoMedicamento),
    tipoIdx: index('idx_movimiento_tipo').on(table.tipoMovimiento),
    fechaIdx: index('idx_movimiento_fecha').on(table.fechaMovimiento),
}));

export type MovimientoInventario = typeof movimientosInventario.$inferSelect;
export type NewMovimientoInventario = typeof movimientosInventario.$inferInsert;
