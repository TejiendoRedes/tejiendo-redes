'use server'

import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { peticiones, medicamentos, pacientes, abordaje, type NewPeticion, type Peticion } from '@/db/schema';
import { eq, and, gt, sql, desc, inArray } from 'drizzle-orm';
import { comunidades } from '@/db/schema/comunidades';
import { getErrorMessage } from '@/lib/error-handler';
import { requireAuth } from '@/lib/auth';
import { PeticionSchema } from '@/schemas/peticiones';

/**
 * Obtener todas las peticiones con información de paciente y medicamento
 */

/**
 * Obtener todos los pacientes para el selector
 */

/**
 * Obtener todos los medicamentos con existencia disponible
 */

/**
 * Obtener pacientes para select (formato simplificado)
 */

/**
 * Obtener medicamentos para select (formato simplificado)
 */

/**
 * Crear una nueva petición (sin restar existencias hasta aprobación)
 */
export async function createPeticion(data: typeof peticiones.$inferInsert) {
    try {
        await requireAuth();

        const validation = PeticionSchema.safeParse(data);
        if (!validation.success) {
            return { success: false, error: validation.error.errors[0].message };
        }

        // DB-06: INSERT directly — let DB validate FK constraints
        const peticionData = {
            codigoPaciente: validation.data.codigoPaciente,
            codigoMedicamento: validation.data.codigoMedicamento,
            cantidad: validation.data.cantidad,
            codigoAbordaje: validation.data.codigoAbordaje || null,
            estado: 'pendiente',
            notas: validation.data.notas || null,
        };

        await db.insert(peticiones).values(peticionData);

        revalidatePath('/farmacia/peticiones');
        return { success: true, message: 'Petición creada correctamente' };
    } catch (error: any) {
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
        const errorMessage = getErrorMessage(error, 'la petición', 'crear');
        return { success: false, error: errorMessage };
    }
}

/**
 * Actualizar estado de una petición (restar existencias solo cuando se aprueba/entrega, devolver cuando se cancela)
 */
export async function updatePeticionEstado(id: number, estado: string) {
    try {
        await requireAuth();

        // BUG-04 FIX: Toda la lógica dentro de una transacción para evitar race conditions
        // Si se está aprobando/entregando
        if (estado === 'entregado') {
            await db.transaction(async (tx) => {
                // Leer petición dentro de la transacción
                const [peticion] = await tx.select()
                    .from(peticiones)
                    .where(eq(peticiones.id, id))
                    .limit(1);

                if (!peticion) {
                    throw new Error('Petición no encontrada');
                }

                if (peticion.estado !== 'pendiente') {
                    throw new Error('Solo se pueden entregar peticiones con estado pendiente');
                }

                // Leer medicamento dentro de la transacción
                const [medicamento] = await tx.select()
                    .from(medicamentos)
                    .where(eq(medicamentos.codigoMedicamento, peticion.codigoMedicamento))
                    .limit(1);

                if (!medicamento) {
                    throw new Error('Medicamento no encontrado');
                }

                if (medicamento.existencia < peticion.cantidad) {
                    throw new Error(`No hay suficiente existencia. Disponible: ${medicamento.existencia}, Solicitado: ${peticion.cantidad}`);
                }

                const now = new Date();
                const hours = now.getHours().toString().padStart(2, '0');
                const minutes = now.getMinutes().toString().padStart(2, '0');
                const seconds = now.getSeconds().toString().padStart(2, '0');
                const horaFormateada = `${hours}:${minutes}:${seconds}`;

                // Actualizar la petición
                await tx.update(peticiones)
                    .set({
                        estado: 'entregado',
                        fechaEntrega: now,
                        horaEntrega: horaFormateada
                    })
                    .where(eq(peticiones.id, id));

                // Restar existencia de forma atómica con SQL
                await tx.update(medicamentos)
                    .set({
                        existencia: sql`${medicamentos.existencia} - ${peticion.cantidad}`
                    })
                    .where(eq(medicamentos.codigoMedicamento, peticion.codigoMedicamento));
            });
        }
        // Si se está cancelando una entrega ya aprobada
        else if (estado === 'cancelado') {
            await db.transaction(async (tx) => {
                const [peticion] = await tx.select()
                    .from(peticiones)
                    .where(eq(peticiones.id, id))
                    .limit(1);

                if (!peticion) {
                    throw new Error('Petición no encontrada');
                }

                if (peticion.estado === 'entregado') {
                    // Solo devolver stock si fue entregado previamente
                    await tx.update(peticiones)
                        .set({
                            estado: 'cancelado',
                            fechaEntrega: null,
                            horaEntrega: null
                        })
                        .where(eq(peticiones.id, id));

                    // Devolver existencia de forma atómica con SQL
                    await tx.update(medicamentos)
                        .set({
                            existencia: sql`${medicamentos.existencia} + ${peticion.cantidad}`
                        })
                        .where(eq(medicamentos.codigoMedicamento, peticion.codigoMedicamento));
                } else {
                    // Cancelar petición pendiente: solo cambiar estado, sin tocar inventario
                    await tx.update(peticiones)
                        .set({ estado: 'cancelado' })
                        .where(eq(peticiones.id, id));
                }
            });
        }
        // Para otros cambios de estado
        else {
            const [peticion] = await db.select()
                .from(peticiones)
                .where(eq(peticiones.id, id))
                .limit(1);

            if (!peticion) {
                return { success: false, error: 'Petición no encontrada' };
            }

            await db.update(peticiones)
                .set({ estado })
                .where(eq(peticiones.id, id));
        }

        revalidatePath('/farmacia/peticiones');
        revalidatePath('/farmacia/medicamentos');
        return { success: true, message: 'Estado actualizado correctamente' };
    } catch (error: any) {
        console.error('Error updating peticion estado:', error);
        return { success: false, error: error?.message || 'Error al actualizar el estado' };
    }
}

/**
 * Marcar petición como entregada
 */
export async function marcarComoEntregada(codigoPeticion: string) {
    try {
        await requireAuth();
        const id = parseInt(codigoPeticion);
        return await updatePeticionEstado(id, 'entregado');
    } catch (error) {
        console.error('Error marcando como entregada:', error);
        return { success: false, error: 'Error al marcar como entregada' };
    }
}

/**
 * Eliminar una petición y devolver existencia al medicamento SOLO si fue entregada
 * BUG-01 FIX: No devolver stock si la petición estaba pendiente (nunca se restó)
 */
export async function deletePeticion(id: number) {
    try {
        await requireAuth();

        await db.transaction(async (tx) => {
            // Obtener la petición dentro de la transacción
            const [peticion] = await tx.select()
                .from(peticiones)
                .where(eq(peticiones.id, id))
                .limit(1);

            if (!peticion) {
                throw new Error('Petición no encontrada');
            }

            // Solo devolver stock si la petición fue entregada (el stock fue restado previamente)
            if (peticion.estado === 'entregado') {
                await tx.update(medicamentos)
                    .set({
                        existencia: sql`${medicamentos.existencia} + ${peticion.cantidad}`
                    })
                    .where(eq(medicamentos.codigoMedicamento, peticion.codigoMedicamento));
            }

            // Eliminar la petición
            await tx.delete(peticiones)
                .where(eq(peticiones.id, id));
        });

        revalidatePath('/farmacia/peticiones');
        revalidatePath('/farmacia/medicamentos');
        return { success: true, message: 'Petición eliminada correctamente' };
    } catch (error: any) {
        console.error('Error deleting peticion:', error);
        return { success: false, error: error?.message || 'Error al eliminar la petición' };
    }
}

/**
 * Obtener abordajes para select (formato simplificado)
 */
