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
export async function createPeticion(data: unknown) {
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
        // Obtener la petición actual
        const peticion = await db.select()
            .from(peticiones)
            .where(eq(peticiones.id, id))
            .limit(1);

        if (!peticion[0]) {
            return { success: false, error: 'Petición no encontrada' };
        }

        // Si se está aprobando/entregando y antes estaba pendiente
        if (estado === 'entregado' && peticion[0].estado === 'pendiente') {
            // Obtener el medicamento para verificar existencia
            const medicamento = await db.select()
                .from(medicamentos)
                .where(eq(medicamentos.codigoMedicamento, peticion[0].codigoMedicamento))
                .limit(1);

            if (!medicamento[0]) {
                return { success: false, error: 'Medicamento no encontrado' };
            }

            // Verificar que haya suficiente existencia
            if (medicamento[0].existencia < peticion[0].cantidad) {
                return {
                    success: false,
                    error: `No hay suficiente existencia. Disponible: ${medicamento[0].existencia}, Solicitado: ${peticion[0].cantidad}`
                };
            }

            // Obtener fecha y hora actual en zona horaria de Venezuela (America/Caracas, UTC-4)
            // Iniciar transacción
            await db.transaction(async (tx) => {
                const now = new Date();
                const hours = now.getHours().toString().padStart(2, '0');
                const minutes = now.getMinutes().toString().padStart(2, '0');
                const seconds = now.getSeconds().toString().padStart(2, '0');
                const horaFormateada = `${hours}:${minutes}:${seconds}`;

                // Actualizar la petición con estado, fecha y hora de entrega local del sistema
                await tx.update(peticiones)
                    .set({
                        estado: 'entregado',
                        fechaEntrega: now,
                        horaEntrega: horaFormateada
                    })
                    .where(eq(peticiones.id, id));

                // Restar la existencia del medicamento
                await tx.update(medicamentos)
                    .set({
                        existencia: medicamento[0].existencia - peticion[0].cantidad
                    })
                    .where(eq(medicamentos.codigoMedicamento, peticion[0].codigoMedicamento));
            });
        }
        // Si se está cancelando una entrega ya aprobada
        else if (estado === 'cancelado' && peticion[0].estado === 'entregado') {
            // Obtener el medicamento para devolver la existencia
            const medicamento = await db.select()
                .from(medicamentos)
                .where(eq(medicamentos.codigoMedicamento, peticion[0].codigoMedicamento))
                .limit(1);

            if (!medicamento[0]) {
                return { success: false, error: 'Medicamento no encontrado' };
            }

            // Iniciar transacción
            await db.transaction(async (tx) => {
                // Actualizar la petición a cancelado
                await tx.update(peticiones)
                    .set({
                        estado: 'cancelado',
                        fechaEntrega: null, // Limpiar fecha de entrega
                        horaEntrega: null   // Limpiar hora de entrega
                    })
                    .where(eq(peticiones.id, id));

                // Devolver la existencia al medicamento
                await tx.update(medicamentos)
                    .set({
                        existencia: medicamento[0].existencia + peticion[0].cantidad
                    })
                    .where(eq(medicamentos.codigoMedicamento, peticion[0].codigoMedicamento));
            });
        }
        // Para otros cambios de estado (cancelar petición pendiente, etc.)
        else {
            await db.update(peticiones)
                .set({ estado })
                .where(eq(peticiones.id, id));
        }

        revalidatePath('/farmacia/peticiones');
        revalidatePath('/farmacia/medicamentos');
        return { success: true, message: 'Estado actualizado correctamente' };
    } catch (error) {
        console.error('Error updating peticion estado:', error);
        return { success: false, error: 'Error al actualizar el estado' };
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
 * Eliminar una petición y devolver existencia al medicamento
 */
export async function deletePeticion(id: number) {
    try {
        await requireAuth();
        // Obtener la petición antes de eliminarla
        const peticion = await db.select()
            .from(peticiones)
            .where(eq(peticiones.id, id))
            .limit(1);

        if (!peticion[0]) {
            return { success: false, error: 'Petición no encontrada' };
        }

        // Obtener el medicamento para devolver la existencia
        const medicamento = await db.select()
            .from(medicamentos)
            .where(eq(medicamentos.codigoMedicamento, peticion[0].codigoMedicamento))
            .limit(1);

        if (medicamento[0]) {
            // Iniciar transacción
            await db.transaction(async (tx) => {
                // Eliminar la petición
                await tx.delete(peticiones)
                    .where(eq(peticiones.id, id));

                // Devolver la existencia al medicamento
                await tx.update(medicamentos)
                    .set({
                        existencia: medicamento[0].existencia + peticion[0].cantidad
                    })
                    .where(eq(medicamentos.codigoMedicamento, peticion[0].codigoMedicamento));
            });
        } else {
            // Si no encuentra el medicamento, solo elimina la petición
            await db.delete(peticiones)
                .where(eq(peticiones.id, id));
        }

        revalidatePath('/farmacia/peticiones');
        revalidatePath('/farmacia/medicamentos');
        return { success: true, message: 'Petición eliminada correctamente' };
    } catch (error) {
        console.error('Error deleting peticion:', error);
        return { success: false, error: 'Error al eliminar la petición' };
    }
}

/**
 * Obtener abordajes para select (formato simplificado)
 */
