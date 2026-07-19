'use server'

import { db } from '@/db';
import { movimientosInventario, medicamentos, tejedores } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';
import { getErrorMessage } from '@/lib/error-handler';

export async function getKardexMedicamento(codigoMedicamento: string) {
    try {
        await requireAuth();

        const [medicamento] = await db.select()
            .from(medicamentos)
            .where(eq(medicamentos.codigoMedicamento, codigoMedicamento))
            .limit(1);

        if (!medicamento) {
            return { success: false, error: 'Medicamento no encontrado' };
        }

        const movimientos = await db.select({
            id: movimientosInventario.id,
            tipo: movimientosInventario.tipoMovimiento,
            cantidad: movimientosInventario.cantidad,
            motivo: movimientosInventario.motivo,
            costoUnitario: movimientosInventario.costoUnitario,
            fechaMovimiento: movimientosInventario.fechaMovimiento,
            notas: movimientosInventario.notas,
            tejedor: {
                nombre: tejedores.nombreTejedor,
                apellido: tejedores.apellidoTejedor
            }
        })
        .from(movimientosInventario)
        .leftJoin(tejedores, eq(movimientosInventario.cedulaTejedor, tejedores.cedulaTejedor))
        .where(eq(movimientosInventario.codigoMedicamento, codigoMedicamento))
        .orderBy(desc(movimientosInventario.fechaMovimiento));

        return {
            success: true,
            data: {
                medicamento,
                movimientos
            }
        };
    } catch (error) {
        return { success: false, error: getErrorMessage(error, 'kardex', 'obtener') };
    }
}
