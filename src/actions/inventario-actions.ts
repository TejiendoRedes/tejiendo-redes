'use server'

import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { medicamentos, movimientosInventario } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { getErrorMessage } from '@/lib/error-handler';
import { requireAuth } from '@/lib/auth';

/**
 * Registra un movimiento de inventario (Entrada o Salida)
 * y actualiza la existencia del medicamento de forma atómica.
 */
export async function registrarMovimientoInventario({
    codigoMedicamento,
    tipo,
    cantidad,
    motivo,
    referencia,
    notas
}: {
    codigoMedicamento: string;
    tipo: 'entrada' | 'salida';
    cantidad: number;
    motivo: string;
    referencia?: string;
    notas?: string;
}) {
    try {
        const session = await requireAuth();

        if (cantidad <= 0) {
            return { success: false, error: 'La cantidad debe ser mayor a 0' };
        }

        // Obtener el precio/costo unitario actual del medicamento
        const [medicamento] = await db.select()
            .from(medicamentos)
            .where(eq(medicamentos.codigoMedicamento, codigoMedicamento))
            .limit(1);

        if (!medicamento) {
            return { success: false, error: 'Medicamento no encontrado' };
        }

        // Validar stock si es salida
        if (tipo === 'salida' && medicamento.existencia < cantidad) {
            return { success: false, error: 'Stock insuficiente para realizar la salida' };
        }

        await db.transaction(async (tx) => {
            // 1. Insertar el registro en el Kardex
            await tx.insert(movimientosInventario).values({
                codigoMedicamento,
                tipoMovimiento: tipo,
                cantidad,
                motivo,
                notas: referencia ? `${referencia}${notas ? ` - ${notas}` : ''}` : notas,
                costoUnitario: medicamento.precio, // Grabamos el costo al momento del movimiento
                cedulaTejedor: session.cedulaTejedor || null
            });

            // 2. Actualizar el stock del medicamento de forma atómica
            let operacionSQL = tipo === 'entrada' 
                ? sql`${medicamentos.existencia} + ${cantidad}`
                : sql`${medicamentos.existencia} - ${cantidad}`;

            await tx.update(medicamentos)
                .set({ existencia: operacionSQL })
                .where(eq(medicamentos.codigoMedicamento, codigoMedicamento));
        });

        revalidatePath('/farmacia/medicamentos');
        revalidatePath('/farmacia/dashboard');
        
        return { success: true, message: 'Movimiento registrado correctamente' };
    } catch (error) {
        return { success: false, error: getErrorMessage(error, 'el movimiento de inventario', 'crear') };
    }
}
