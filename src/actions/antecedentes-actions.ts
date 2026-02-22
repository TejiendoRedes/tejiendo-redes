'use server'

import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { antecedentes, type NewAntecedente, type Antecedente } from '@/db/schema/antecedentes';
import { pacientes } from '@/db/schema/pacientes';
import { eq } from 'drizzle-orm';
import { getErrorMessage } from '@/lib/error-handler';
import { getNextCode } from '@/lib/id-generator';
import { requireAuth } from '@/lib/auth';

/**
 * Obtener el siguiente código correlativo para un antecedente
 */

/**
 * Obtener todos los antecedentes con la información del paciente
 */

/**
 * Crear un nuevo antecedente
 */
export async function createAntecedente(data: NewAntecedente) {
    try {
        await requireAuth();
        // Validaciones básicas
        if (!data.codigoAntecedente?.trim()) {
            return { success: false, error: 'El código de antecedente es requerido' };
        }
        if (!data.cedulaPaciente?.trim()) {
            return { success: false, error: 'Debe seleccionar un paciente' };
        }

        // Verificar si ya existe el código
        const existing = await db.select().from(antecedentes).where(eq(antecedentes.codigoAntecedente, data.codigoAntecedente));
        if (existing.length > 0) {
            return { success: false, error: 'Ya existe un antecedente con este código. Por favor, usa un código diferente.' };
        }

        await db.insert(antecedentes).values(data);
        revalidatePath('/datos-basicos/antecedentes');
        return { success: true, message: 'Antecedente creado correctamente' };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'el antecedente', 'crear');
        return { success: false, error: errorMessage };
    }
}

/**
 * Actualizar un antecedente
 */
export async function updateAntecedente(codigo: string, data: Partial<NewAntecedente>) {
    try {
        await requireAuth();
        await db.update(antecedentes)
            .set(data)
            .where(eq(antecedentes.codigoAntecedente, codigo));
        revalidatePath('/datos-basicos/antecedentes');
        return { success: true, message: 'Antecedente actualizado correctamente' };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'el antecedente', 'actualizar');
        return { success: false, error: errorMessage };
    }
}

/**
 * Eliminar un antecedente
 */
export async function deleteAntecedente(codigo: string) {
    try {
        await requireAuth();
        await db.delete(antecedentes)
            .where(eq(antecedentes.codigoAntecedente, codigo));
        revalidatePath('/datos-basicos/antecedentes');
        return { success: true, message: 'Antecedente eliminado correctamente' };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'el antecedente', 'eliminar');
        return { success: false, error: errorMessage };
    }
}
