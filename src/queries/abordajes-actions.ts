"use server";


import { revalidatePath } from 'next/cache';
import { AbordajesService } from '@/services/abordajes-service';
import { createResponse } from '@/lib/utils';
import { abordaje, medicamentosPacientes } from '@/db/schema'; // Import types if needed, or source from service
import { DeleteErrorMessages } from '@/lib/error-handler';
import { getNextCode } from '@/lib/id-generator';
import { MedicamentoEntregaSchema, CreateAbordajeSchema, UpdateAbordajeSchema } from '@/schemas/abordajes';
import { requireAuth } from '@/lib/auth';

/**
 * Obtener todos los abordajes
 */
export async function getAbordajes() {
    try {
        await requireAuth();
        const data = await AbordajesService.getAll();
        return createResponse(true, data);
    } catch (error) {
        console.error('Error fetching abordajes:', error);
        return createResponse(false, null, 'No se pudieron obtener los abordajes. Por favor, intenta nuevamente.');
    }
}

/**
 * Obtener un abordaje por su ID (código) con todas sus relaciones
 */
export async function getAbordajeById(id: string) {
    try {
        await requireAuth();
        const data = await AbordajesService.getById(id);
        if (!data) return createResponse(false, null, 'El abordaje no fue encontrado');
        return createResponse(true, data);
    } catch (error) {
        console.error('Error fetching abordaje details:', error);
        return createResponse(false, null, 'No se pudieron obtener los detalles del abordaje. Por favor, intenta nuevamente.');
    }
}

/**
 * Crear un nuevo abordaje
 */

/**
 * Actualizar un abordaje existente
 */

/**
 * Agregar comunidad a un abordaje
 */

/**
 * Remover comunidad de un abordaje
 */

/**
 * Agregar tejedor a un abordaje
 */

/**
 * Remover tejedor de un abordaje
 */

/**
 * Eliminar un abordaje
 */

/**
 * Registrar entrega de medicamento
 */

/**
 * Obtener lista de asistencia (Check-in)
 */
export async function getAbordajeAsistencia(abordajeId: string) {
    try {
        await requireAuth();
        const data = await AbordajesService.getAsistencia(abordajeId);
        return createResponse(true, data);
    } catch (error) {
        console.error('Error fetching abordaje asistencia:', error);
        return createResponse(false, [], 'Error al obtener la lista de espera');
    }
}

/**
 * Registrar Check-in de paciente
 */

/**
 * Actualizar asistencia (Estado, notas, etc)
 */
