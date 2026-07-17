import { sql } from 'drizzle-orm';
import { mysqlTable, varchar, int, datetime, text, index, decimal } from 'drizzle-orm/mysql-core';
import { medicamentos } from './medicamentos';
import { tejedores } from './tejedores';

/**
 * Tabla: movimientos_inventario
 * Historial de entradas, salidas y ajustes de inventario (Kardex)
 */
export const movimientosInventario = mysqlTable('movimientos_inventario', {
    id: int('id').primaryKey().autoincrement(),
    codigoMedicamento: varchar('codigo_medicamento', { length: 10 }).notNull().references(() => medicamentos.codigoMedicamento, {
        onDelete: 'restrict',
        onUpdate: 'cascade'
    }),
    tipo: varchar('tipo', { length: 20 }).notNull(), // 'entrada', 'salida', 'ajuste'
    cantidad: int('cantidad').notNull(), // Siempre en positivo
    motivo: varchar('motivo', { length: 100 }).notNull(), // 'Donación', 'Compra', 'Entrega a paciente', 'Merma', 'Vencimiento', 'Ajuste inicial', 'Reversión'
    referencia: varchar('referencia', { length: 50 }), // Opcional (e.g., ID de petición o número de factura)
    costoUnitario: decimal('costo_unitario', { precision: 10, scale: 2, mode: 'number' }).notNull().default(0), // Para valorar el movimiento en ese momento (histórico)
    fechaMovimiento: datetime('fecha_movimiento').notNull().default(sql`now()`),
    cedulaUsuario: varchar('cedula_usuario', { length: 12 }).references(() => tejedores.cedulaTejedor, {
        onDelete: 'set null',
        onUpdate: 'cascade'
    }), // El usuario que registró el movimiento
    notas: text('notas'), // Justificación o detalles adicionales
}, (table) => ({
    medicamentoIdx: index('idx_movimiento_medicamento').on(table.codigoMedicamento),
    fechaIdx: index('idx_movimiento_fecha').on(table.fechaMovimiento),
    usuarioIdx: index('idx_movimiento_usuario').on(table.cedulaUsuario),
}));

export type MovimientoInventario = typeof movimientosInventario.$inferSelect;
export type NewMovimientoInventario = typeof movimientosInventario.$inferInsert;
