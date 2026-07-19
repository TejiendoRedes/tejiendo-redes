'use server'

import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { entregasMedicamentos, medicamentos, pacientes, abordaje, movimientosInventario, type NewEntregaMedicamento, type EntregaMedicamento } from '@/db/schema';
import { eq, and, gt, sql, desc, inArray } from 'drizzle-orm';
import { getErrorMessage } from '@/lib/error-handler';
import { requireAuth } from '@/lib/auth';

/**
 * Crear una nueva entrega directa (descuenta existencias automáticamente)
 */
export async function createEntrega(data: { codigoPaciente: string; codigoMedicamento: string; cantidad: number; codigoAbordaje?: string | null; cedulaTejedor: string; notas?: string | null }) {
    try {
        await requireAuth();

        if (!data.cedulaTejedor) {
            return { success: false, error: 'Debe indicar el tejedor responsable de la entrega' };
        }

        await db.transaction(async (tx) => {
            // 1. Verificar medicamento y existencia
            const [medicamento] = await tx.select()
                .from(medicamentos)
                .where(eq(medicamentos.codigoMedicamento, data.codigoMedicamento))
                .limit(1);

            if (!medicamento) {
                throw new Error('Medicamento no encontrado');
            }

            const cantidadSolicitada = data.cantidad ?? 1;
            
            if (medicamento.existencia < cantidadSolicitada) {
                throw new Error(`No hay suficiente existencia. Disponible: ${medicamento.existencia}, Solicitado: ${cantidadSolicitada}`);
            }

            const now = new Date();
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const seconds = now.getSeconds().toString().padStart(2, '0');
            const horaFormateada = `${hours}:${minutes}:${seconds}`;

            const entregaData = {
                codigoPaciente: data.codigoPaciente,
                codigoMedicamento: data.codigoMedicamento,
                cantidad: cantidadSolicitada,
                codigoAbordaje: data.codigoAbordaje || null,
                cedulaTejedor: data.cedulaTejedor,
                estado: 'entregado',
                fechaEntrega: now,
                horaEntrega: horaFormateada,
                notas: data.notas || null,
            };

            // 2. Insertar la entrega
            const [result] = await tx.insert(entregasMedicamentos).values(entregaData);
            const insertId = result.insertId;

            // 3. Restar existencia de forma atómica con SQL
            await tx.update(medicamentos)
                .set({
                    existencia: sql`${medicamentos.existencia} - ${cantidadSolicitada}`
                })
                .where(eq(medicamentos.codigoMedicamento, data.codigoMedicamento));

            // 4. Registrar en Kardex
            await tx.insert(movimientosInventario).values({
                codigoMedicamento: data.codigoMedicamento,
                tipoMovimiento: 'salida',
                cantidad: cantidadSolicitada,
                motivo: 'Entrega directa a paciente',
                notas: `Entrega ID: ${insertId}`,
                costoUnitario: medicamento.precio,
                cedulaTejedor: data.cedulaTejedor
            });
        });

        revalidatePath('/farmacia/entregas');
        revalidatePath('/farmacia/medicamentos');
        return { success: true, message: 'Entrega registrada correctamente' };
    } catch (error: any) {
        console.error('Error creating entrega:', error);
        // Parse FK constraint errors for user-friendly messages
        const msg = error?.cause?.sqlMessage || error?.message || '';
        if (msg.includes('foreign key constraint') || error?.cause?.code === 'ER_NO_REFERENCED_ROW_2') {
            if (msg.includes('paciente') || msg.includes('codigo_paciente')) {
                return { success: false, error: 'El paciente seleccionado no existe. Por favor, selecciona un paciente válido.' };
            }
            if (msg.includes('medicamento') || msg.includes('codigo_medicamento')) {
                return { success: false, error: 'El medicamento seleccionado no existe. Por favor, selecciona un medicamento válido.' };
            }
            return { success: false, error: 'Referencia inválida. Verifique los datos seleccionados.' };
        }
        const errorMessage = getErrorMessage(error, 'la entrega', 'crear');
        return { success: false, error: errorMessage };
    }
}

/**
 * Cancelar una entrega (devuelve stock al inventario pero deja el registro como cancelado)
 */
export async function cancelEntrega(id: number, cedulaTejedor?: string) {
    try {
        await requireAuth();

        await db.transaction(async (tx) => {
            const [entrega] = await tx.select()
                .from(entregasMedicamentos)
                .where(eq(entregasMedicamentos.id, id))
                .limit(1);

            if (!entrega) {
                throw new Error('Entrega no encontrada');
            }

            if (entrega.estado === 'entregado') {
                // 1. Cambiar estado a cancelado
                await tx.update(entregasMedicamentos)
                    .set({ estado: 'cancelado' })
                    .where(eq(entregasMedicamentos.id, id));

                // 2. Devolver existencia
                await tx.update(medicamentos)
                    .set({
                        existencia: sql`${medicamentos.existencia} + ${entrega.cantidad}`
                    })
                    .where(eq(medicamentos.codigoMedicamento, entrega.codigoMedicamento));

                // 3. Registrar en Kardex como Reversión
                const [medicamento] = await tx.select()
                    .from(medicamentos)
                    .where(eq(medicamentos.codigoMedicamento, entrega.codigoMedicamento))
                    .limit(1);

                if (medicamento) {
                    await tx.insert(movimientosInventario).values({
                        codigoMedicamento: entrega.codigoMedicamento,
                        tipoMovimiento: 'entrada',
                        cantidad: entrega.cantidad,
                        motivo: 'Reversión (Entrega cancelada)',
                        notas: `Entrega ID: ${entrega.id}`,
                        costoUnitario: medicamento.precio,
                        cedulaTejedor: cedulaTejedor || entrega.cedulaTejedor
                    });
                }
            } else {
                throw new Error('La entrega ya se encuentra cancelada');
            }
        });

        revalidatePath('/farmacia/entregas');
        revalidatePath('/farmacia/medicamentos');
        return { success: true, message: 'Entrega cancelada correctamente' };
    } catch (error: any) {
        console.error('Error cancelling entrega:', error);
        return { success: false, error: error?.message || 'Error al cancelar la entrega' };
    }
}

/**
 * Eliminar una entrega por completo y devolver existencia al medicamento
 */
export async function deleteEntrega(id: number, cedulaTejedor?: string) {
    try {
        await requireAuth();

        await db.transaction(async (tx) => {
            const [entrega] = await tx.select()
                .from(entregasMedicamentos)
                .where(eq(entregasMedicamentos.id, id))
                .limit(1);

            if (!entrega) {
                throw new Error('Entrega no encontrada');
            }

            // Solo devolver stock si estaba entregado (no devolver doble si ya estaba cancelado)
            if (entrega.estado === 'entregado') {
                await tx.update(medicamentos)
                    .set({
                        existencia: sql`${medicamentos.existencia} + ${entrega.cantidad}`
                    })
                    .where(eq(medicamentos.codigoMedicamento, entrega.codigoMedicamento));

                // Registrar en Kardex
                const [medicamento] = await tx.select()
                    .from(medicamentos)
                    .where(eq(medicamentos.codigoMedicamento, entrega.codigoMedicamento))
                    .limit(1);

                if (medicamento) {
                    await tx.insert(movimientosInventario).values({
                        codigoMedicamento: entrega.codigoMedicamento,
                        tipoMovimiento: 'entrada',
                        cantidad: entrega.cantidad,
                        motivo: 'Reversión (Entrega eliminada)',
                        notas: `Entrega ID: ${entrega.id}`,
                        costoUnitario: medicamento.precio,
                        cedulaTejedor: cedulaTejedor || entrega.cedulaTejedor
                    });
                }
            }

            // Eliminar registro
            await tx.delete(entregasMedicamentos)
                .where(eq(entregasMedicamentos.id, id));
        });

        revalidatePath('/farmacia/entregas');
        revalidatePath('/farmacia/medicamentos');
        return { success: true, message: 'Entrega eliminada correctamente' };
    } catch (error: any) {
        console.error('Error deleting entrega:', error);
        return { success: false, error: error?.message || 'Error al eliminar la entrega' };
    }
}
