'use server'

import { revalidatePath } from 'next/cache';
import { AbordajesService } from '@/services/abordajes-service';
import { createResponse } from '@/lib/utils';
import { abordaje, medicamentosPacientes } from '@/db/schema'; // Import types if needed, or source from service

/**
 * Obtener todos los abordajes
 */
export async function getAbordajes() {
    try {
        const data = await AbordajesService.getAll();
        return createResponse(true, data);
    } catch (error) {
        console.error('Error fetching abordajes:', error);
        return createResponse(false, null, 'Error al obtener los abordajes');
    }
}

/**
 * Obtener un abordaje por su ID (código) con todas sus relaciones
 */
export async function getAbordajeById(id: string) {
    try {
        const data = await AbordajesService.getById(id);
        if (!data) return createResponse(false, null, 'Abordaje no encontrado');
        return createResponse(true, data);
    } catch (error) {
        console.error('Error fetching abordaje details:', error);
        return createResponse(false, null, 'Error al obtener los detalles del abordaje');
    }
}

/**
 * Crear un nuevo abordaje
 */
export async function createAbordaje(data: typeof abordaje.$inferInsert) {
    try {
        await AbordajesService.create(data);
        revalidatePath('/abordajes');
        return createResponse(true);
    } catch (error) {
        console.error('Error creating abordaje:', error);
        return createResponse(false, null, 'Error al crear el abordaje');
    }
}

/**
 * Actualizar un abordaje existente
 */
export async function updateAbordaje(id: string, data: Partial<typeof abordaje.$inferInsert>) {
    try {
        await AbordajesService.update(id, data);
        revalidatePath('/abordajes');
        revalidatePath(`/abordajes/${id}`);
        return createResponse(true);
    } catch (error) {
        console.error('Error updating abordaje:', error);
        return createResponse(false, null, 'Error al actualizar el abordaje');
    }
}

/**
 * Agregar comunidad a un abordaje
 */
export async function addComunidadToAbordaje(codigoAbordaje: string, codigoComunidad: string) {
    try {
        await AbordajesService.addComunidad(codigoAbordaje, codigoComunidad);
        revalidatePath(`/abordajes/${codigoAbordaje}`);
        return createResponse(true);
    } catch (error: any) {
        console.error('Error adding comunidad to abordaje:', error);
        return createResponse(false, null, error.message || 'Error al agregar la comunidad');
    }
}

/**
 * Remover comunidad de un abordaje
 */
export async function removeComunidadFromAbordaje(codigoAbordaje: string, codigoComunidad: string) {
    try {
        await AbordajesService.removeComunidad(codigoAbordaje, codigoComunidad);
        revalidatePath(`/abordajes/${codigoAbordaje}`);
        return createResponse(true);
    } catch (error) {
        console.error('Error removing comunidad from abordaje:', error);
        return createResponse(false, null, 'Error al remover la comunidad');
    }
}

/**
 * Agregar tejedor a un abordaje
 */
export async function addTejedorToAbordaje(codigoAbordaje: string, cedulaTejedor: string, rol: string) {
    try {
        await AbordajesService.addTejedor(codigoAbordaje, cedulaTejedor, rol);
        revalidatePath(`/abordajes/${codigoAbordaje}`);
        return createResponse(true);
    } catch (error: any) {
        console.error('Error adding tejedor to abordaje:', error);
        return createResponse(false, null, error.message || 'Error al agregar el tejedor');
    }
}

/**
 * Remover tejedor de un abordaje
 */
export async function removeTejedorFromAbordaje(codigoAbordaje: string, cedulaTejedor: string) {
    try {
        await AbordajesService.removeTejedor(codigoAbordaje, cedulaTejedor);
        revalidatePath(`/abordajes/${codigoAbordaje}`);
        return createResponse(true);
    } catch (error) {
        console.error('Error removing tejedor from abordaje:', error);
        return createResponse(false, null, 'Error al remover el tejedor');
    }
}

/**
 * Eliminar un abordaje
 */
export async function deleteAbordaje(id: string) {
    try {
        await AbordajesService.delete(id);
        revalidatePath('/abordajes');
        return createResponse(true);
    } catch (error: any) {
        console.error('Error deleting abordaje:', error);
        // Handle Foreign Key Constraint errors specifically
        if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.message?.includes('foreign key constraint')) {
            return createResponse(false, null, 'No se puede eliminar porque tiene registros asociados (ej. consultas)');
        }
        return createResponse(false, null, 'Error al eliminar el abordaje');
    }
}

/**
 * Registrar entrega de medicamento
 */
export async function registerMedicamentoEntrega(data: typeof medicamentosPacientes.$inferInsert) {
    try {
        await AbordajesService.registerMedicamentoEntrega(data);
        revalidatePath('/abordajes');
        return createResponse(true);
    } catch (error) {
        console.error('Error registering medicamento entrega:', error);
        return createResponse(false, null, 'Error al registrar la entrega de medicamento');
    }
}
