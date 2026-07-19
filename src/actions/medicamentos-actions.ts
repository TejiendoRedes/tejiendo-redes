'use server'

import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { medicamentos, type NewMedicamento, type Medicamento, entregasMedicamentos } from '@/db/schema';
import { eq, sum } from 'drizzle-orm';
import { getErrorMessage, DeleteErrorMessages } from '@/lib/error-handler';
import { getNextCode } from '@/lib/id-generator';
import { requireAuth } from '@/lib/auth';
import { MedicamentoSchema, UpdateMedicamentoSchema } from '@/schemas/medicamentos';

/**
 * Obtener todos los medicamentos (con búsqueda opcional)
 */
import { like, or } from 'drizzle-orm';


/**
 * Crear un nuevo medicamento
 */
export async function createMedicamento(data: typeof medicamentos.$inferInsert) {
    try {
        await requireAuth();

        const validation = MedicamentoSchema.safeParse(data);
        if (!validation.success) {
            return { success: false, error: validation.error.errors[0].message };
        }

        // Validaciones básicas de campos obligatorios
        if (!validation.data.nombreMedicamento?.trim()) {
            return { success: false, error: 'El nombre del medicamento es requerido' };
        }

        // Generación automática del código de medicamento (MED-001...)
        const newCode = await getNextCode(medicamentos, medicamentos.codigoMedicamento, 'MED-');

        const finalData = {
            ...validation.data,
            codigoMedicamento: newCode
        };

        await db.insert(medicamentos).values(finalData);
        revalidatePath('/farmacia/medicamentos');
        return { success: true, message: `Medicamento creado correctamente con código ${newCode}` };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'el medicamento', 'crear');
        return { success: false, error: errorMessage };
    }
}

/**
 * Actualizar un medicamento
 */
export async function updateMedicamento(codigo: string, data: Partial<typeof medicamentos.$inferInsert>) {
    try {
        await requireAuth();

        const validation = UpdateMedicamentoSchema.safeParse(data);
        if (!validation.success) {
            return { success: false, error: validation.error.errors[0].message };
        }

        await db.update(medicamentos)
            .set(validation.data)
            .where(eq(medicamentos.codigoMedicamento, codigo));
        revalidatePath('/farmacia/medicamentos');
        return { success: true, message: 'Medicamento actualizado correctamente' };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'el medicamento', 'actualizar');
        return { success: false, error: errorMessage };
    }
}

/**
 * Eliminar un medicamento
 */
export async function deleteMedicamento(codigo: string) {
    try {
        await requireAuth();
        await db.delete(medicamentos)
            .where(eq(medicamentos.codigoMedicamento, codigo));
        revalidatePath('/farmacia/medicamentos');
        return { success: true, message: 'Medicamento eliminado correctamente' };
    } catch (error: any) {
        // Detectar tipo específico de FK constraint
        // En Drizzle, el error de MySQL está en error.cause
        const mysqlError = error?.cause || error;
        const errorCode = mysqlError?.code || error?.code;
        const errorMsg = mysqlError?.sqlMessage || mysqlError?.message || error?.message || '';

        if (errorCode === 'ER_ROW_IS_REFERENCED_2' || errorMsg.includes('foreign key constraint')) {

            if (errorMsg.includes('entregas_medicamentos')) {
                return { success: false, error: 'No se puede eliminar el medicamento porque está asociado a entregas registradas' };
            }

            // Mensaje genérico
            return { success: false, error: DeleteErrorMessages.medicamento.generic() };
        }

        const errorMessage = getErrorMessage(error, 'el medicamento', 'eliminar');
        return { success: false, error: errorMessage };
    }
}

/**
 * Obtener resumen de medicamentos solicitados (peticiones)
 */

/**
 * Obtener un medicamento por código
 */
