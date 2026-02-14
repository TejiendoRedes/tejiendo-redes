'use server'

import { revalidatePath } from 'next/cache';
import { AbordajesService } from '@/services/abordajes-service';
import { createResponse } from '@/lib/utils';
import { abordaje, medicamentosPacientes } from '@/db/schema'; // Import types if needed, or source from service
import { DeleteErrorMessages } from '@/lib/error-handler';
import { getNextCode } from '@/lib/id-generator';

/**
 * Obtener todos los abordajes
 */
export async function getAbordajes() {
    try {
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
export async function createAbordaje(data: typeof abordaje.$inferInsert) {
    try {
        // Validaciones básicas de campos obligatorios
        if (!data.codigoComunidad) {
            return createResponse(false, null, 'Debe seleccionar una comunidad');
        }

        // Generación automática del código de abordaje (ABD-001...)
        const newCode = await getNextCode(abordaje, abordaje.codigoAbordaje, 'ABD-');

        const finalData = {
            ...data,
            codigoAbordaje: newCode
        };

        await AbordajesService.create(finalData);
        revalidatePath('/abordajes');
        return createResponse(true, { codigoAbordaje: newCode }, `Abordaje registrado correctamente con código ${newCode}`);
    } catch (error: any) {
        console.error('Error creating abordaje:', error);
        if (error?.message?.includes('Duplicate entry')) {
            return createResponse(false, null, 'Ya existe un abordaje con este código generado. Por favor, intenta nuevamente.');
        }
        if (error?.message?.includes('foreign key constraint') || error?.message?.includes('Cannot add or update')) {
            return createResponse(false, null, 'La comunidad seleccionada no existe. Por favor, selecciona una comunidad válida.');
        }
        return createResponse(false, null, 'Error al crear el abordaje. Por favor, intenta de nuevo.');
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
    } catch (error: any) {
        console.error('Error updating abordaje:', error);
        if (error?.message?.includes('foreign key constraint')) {
            return createResponse(false, null, 'Los datos referenciados no existen. Por favor, verifica la información.');
        }
        return createResponse(false, null, 'Error al actualizar el abordaje. Por favor, intenta nuevamente.');
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

        // Detectar tipo específico de FK constraint
        // En Drizzle, el error de MySQL está en error.cause
        const mysqlError = error?.cause || error;
        const errorCode = mysqlError?.code || error.code;
        const errorMsg = mysqlError?.sqlMessage || mysqlError?.message || error.message || '';

        if (errorCode === 'ER_ROW_IS_REFERENCED_2' || errorMsg.includes('foreign key constraint')) {

            if (errorMsg.includes('consultas')) {
                return createResponse(false, null, DeleteErrorMessages.abordaje.conConsultas());
            }
            if (errorMsg.includes('abordaje_comunidad') || errorMsg.includes('ab_com_')) {
                return createResponse(false, null, DeleteErrorMessages.abordaje.conComunidades());
            }
            if (errorMsg.includes('tejedores_abordaje') || errorMsg.includes('tej_ab_')) {
                return createResponse(false, null, DeleteErrorMessages.abordaje.conTejedores());
            }
            if (errorMsg.includes('medicamentos_pacientes') || errorMsg.includes('med_pac_')) {
                return createResponse(false, null, 'No se puede eliminar este abordaje porque tiene entregas de medicamentos registradas en el sistema.');
            }

            // Mensaje genérico
            return createResponse(false, null, DeleteErrorMessages.abordaje.generic());
        }

        return createResponse(false, null, 'Error al eliminar el abordaje. Por favor, intenta nuevamente.');
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
