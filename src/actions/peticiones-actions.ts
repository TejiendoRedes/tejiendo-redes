'use server'

import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { peticiones, medicamentos, pacientes, type NewPeticion, type Peticion } from '@/db/schema';
import { eq, and, gt, sql } from 'drizzle-orm';
import { comunidades } from '@/db/schema/comunidades';
import { getErrorMessage } from '@/lib/error-handler';

/**
 * Obtener todas las peticiones con información de paciente y medicamento
 */
export async function getPeticiones() {
    try {
        const result = await db.select({
            id: peticiones.id,
            codigoPeticion: sql<string>`CAST(${peticiones.id} AS CHAR)`, // Convertir a string para compatibilidad
            codigoPaciente: peticiones.codigoPaciente,
            codigoMedicamento: peticiones.codigoMedicamento,
            cantidad: peticiones.cantidad, // Mapear cantidad correctamente
            fechaPeticion: peticiones.fechaPeticion,
            fechaEntrega: peticiones.fechaEntrega, // Agregar fecha de entrega
            horaEntrega: peticiones.horaEntrega, // Agregar hora de entrega
            estado: peticiones.estado,
            notas: peticiones.notas, // Mapear notas correctamente
            nombrePaciente: pacientes.nombrePaciente,
            apellidoPaciente: pacientes.apellidoPaciente,
            nombreMedicamento: medicamentos.nombreMedicamento,
            presentacion: medicamentos.presentacion,
            existencia: medicamentos.existencia,
        })
            .from(peticiones)
            .leftJoin(pacientes, eq(peticiones.codigoPaciente, pacientes.cedulaPaciente))
            .leftJoin(medicamentos, eq(peticiones.codigoMedicamento, medicamentos.codigoMedicamento))
            .orderBy(peticiones.fechaPeticion);

        return { success: true, data: result as any[] };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'las peticiones', 'obtener');
        return { success: false, error: errorMessage };
    }
}

/**
 * Obtener todos los pacientes para el selector
 */
export async function getPacientes() {
    try {
        const data = await db.select()
            .from(pacientes)
            .leftJoin(comunidades, eq(pacientes.codigoComunidad, comunidades.codigoComunidad));

        const result = data.map(({ pacientes, comunidades }) => ({
            ...pacientes,
            comunidad: comunidades
        }));

        return { success: true, data: result };
    } catch (error) {
        console.error('Error fetching pacientes:', error);
        return { success: false, error: 'Error al obtener los pacientes' };
    }
}

/**
 * Obtener todos los medicamentos con existencia disponible
 */
export async function getMedicamentosDisponibles() {
    try {
        // FIX: Cambiar lt a gt para obtener medicamentos con existencia > 0
        const data = await db.select()
            .from(medicamentos)
            .where(gt(medicamentos.existencia, 0)); // Medicamentos con existencia mayor que 0

        return { success: true, data };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'los medicamentos', 'obtener');
        return { success: false, error: errorMessage };
    }
}

/**
 * Obtener pacientes para select (formato simplificado)
 */
export async function getPacientesForSelect() {
    try {
        const data = await db.select({
            cedulaPaciente: pacientes.cedulaPaciente,
            nombrePaciente: pacientes.nombrePaciente,
            apellidoPaciente: pacientes.apellidoPaciente,
        })
            .from(pacientes);

        return { success: true, data };
    } catch (error) {
        console.error('Error fetching pacientes:', error);
        return { success: false, error: 'Error al obtener los pacientes' };
    }
}

/**
 * Obtener medicamentos para select (formato simplificado)
 */
export async function getMedicamentosForSelect() {
    try {
        const data = await db.select({
            codigoMedicamento: medicamentos.codigoMedicamento,
            nombreMedicamento: medicamentos.nombreMedicamento,
            presentacion: medicamentos.presentacion,
            existencia: medicamentos.existencia,
        })
            .from(medicamentos);

        return { success: true, data };
    } catch (error) {
        console.error('Error fetching medicamentos:', error);
        return { success: false, error: 'Error al obtener los medicamentos' };
    }
}

/**
 * Crear una nueva petición (sin restar existencias hasta aprobación)
 */
export async function createPeticion(data: NewPeticion) {
    try {
        // Validar datos requeridos
        if (!data.codigoPaciente) {
            return { success: false, error: 'Debe seleccionar un paciente' };
        }
        if (!data.codigoMedicamento) {
            return { success: false, error: 'Debe seleccionar un medicamento' };
        }
        if (!data.cantidad || data.cantidad < 1) {
            return { success: false, error: 'La cantidad debe ser mayor a 0' };
        }

        // Verificar que el paciente existe
        const pacienteExists = await db.select()
            .from(pacientes)
            .where(eq(pacientes.cedulaPaciente, data.codigoPaciente))
            .limit(1);

        if (!pacienteExists || pacienteExists.length === 0) {
            return { success: false, error: 'El paciente seleccionado no existe. Por favor, selecciona un paciente válido.' };
        }

        // Verificar que el medicamento existe (sin validar existencia por ahora)
        const medicamento = await db.select()
            .from(medicamentos)
            .where(eq(medicamentos.codigoMedicamento, data.codigoMedicamento))
            .limit(1);

        if (!medicamento[0]) {
            return { success: false, error: 'El medicamento seleccionado no existe. Por favor, selecciona un medicamento válido.' };
        }

        // Preparar datos para inserción
        const peticionData = {
            codigoPaciente: data.codigoPaciente,
            codigoMedicamento: data.codigoMedicamento,
            cantidad: data.cantidad,
            estado: data.estado || 'pendiente',
            notas: data.notas || null,
        };

        // Crear la petición (sin modificar existencias)
        await db.insert(peticiones).values(peticionData);

        revalidatePath('/farmacia/peticiones');
        return { success: true, message: 'Petición creada correctamente' };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'la petición', 'crear');
        return { success: false, error: errorMessage };
    }
}

/**
 * Actualizar estado de una petición (restar existencias solo cuando se aprueba/entrega, devolver cuando se cancela)
 */
export async function updatePeticionEstado(id: number, estado: string) {
    try {
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

            // Obtener hora actual
            const ahora = new Date();
            const horaActual = ahora.toTimeString().slice(0, 8); // HH:MM:SS

            // Iniciar transacción
            await db.transaction(async (tx) => {
                // Actualizar la petición con estado, fecha y hora de entrega
                await tx.update(peticiones)
                    .set({
                        estado: 'entregado',
                        fechaEntrega: ahora,
                        horaEntrega: horaActual
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
