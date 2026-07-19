'use server'

import { revalidatePath } from 'next/cache';
import { AbordajesService } from '@/services/abordajes-service';
import { createResponse } from '@/lib/utils';
import { abordaje } from '@/db/schema';
import { createEntrega } from '@/actions/entregas-actions';
import { entregasMedicamentos } from '@/db/schema/entregas_medicamentos';
import { DeleteErrorMessages } from '@/lib/error-handler';
import { getNextCode } from '@/lib/id-generator';
import { MedicamentoEntregaSchema, CreateAbordajeSchema, UpdateAbordajeSchema } from '@/schemas/abordajes';
import { requireAuth } from '@/lib/auth';

/**
 * Obtener todos los abordajes
 */

/**
 * Obtener un abordaje por su ID (código) con todas sus relaciones
 */

/**
 * Crear un nuevo abordaje
 */
export async function createAbordaje(data: typeof abordaje.$inferInsert) {
    try {
        await requireAuth();
        const validation = CreateAbordajeSchema.safeParse(data);
        if (!validation.success) {
            return createResponse(false, null, validation.error.errors[0].message);
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
        await requireAuth();
        const validation = UpdateAbordajeSchema.safeParse(data);
        if (!validation.success) {
            return createResponse(false, null, validation.error.errors[0].message);
        }
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
 * Agregar tejedor a un abordaje
 */
export async function addTejedorToAbordaje(codigoAbordaje: string, cedulaTejedor: string, rol: string) {
    try {
        await requireAuth();
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
        await requireAuth();
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
        await requireAuth();
        await AbordajesService.delete(id);
        revalidatePath('/abordajes');
        return createResponse(true);
    } catch (error: any) {
        console.error('Error deleting abordaje:', error);
        return createResponse(false, null, 'Error al eliminar el abordaje. Por favor, intenta nuevamente.');
    }
}

/**
 * Registrar entrega de medicamento
 */
export async function registerMedicamentoEntrega(data: { codigoPaciente: string; codigoMedicamento: string; cantidad: number; codigoAbordaje?: string | null; cedulaTejedor: string; notas?: string | null }) {
    try {
        await requireAuth();

        const res = await createEntrega(data);
        if (res.success) {
            revalidatePath('/abordajes');
            if (data.codigoAbordaje) {
                revalidatePath(`/abordajes/${data.codigoAbordaje}`);
            }
            return createResponse(true);
        }
        return createResponse(false, null, res.error);
    } catch (error: any) {
        return createResponse(false, null, error.message);
    }
}

/**
 * Obtener lista de asistencia (Check-in)
 */

/**
 * Registrar Check-in de paciente
 */
export async function checkInPatient(codigoAbordaje: string, cedulaPaciente: string) {
    try {
        await requireAuth();
        await AbordajesService.checkInPatient(codigoAbordaje, cedulaPaciente);
        revalidatePath(`/abordajes/${codigoAbordaje}`);
        return createResponse(true, null, 'Paciente registrado correctamente en el abordaje');
    } catch (error: any) {
        console.error('Error checking in patient:', error);
        return createResponse(false, null, error.message || 'Error al registrar el paciente');
    }
}

/**
 * Actualizar asistencia (Estado, notas, etc)
 */
export async function updateAbordajeAsistencia(id: number, data: Record<string, unknown>) {
    try {
        await requireAuth();
        await AbordajesService.updateAsistencia(id, data);
        revalidatePath('/abordajes');
        return createResponse(true, null, 'Asistencia actualizada');
    } catch (error: any) {
        console.error('Error updating asistencia:', error);
        return createResponse(false, null, error.message || 'Error al actualizar asistencia');
    }
}
