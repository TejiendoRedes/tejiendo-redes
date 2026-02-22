"use server";


import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { aspirantes, type NewAspirante, type Aspirante } from '@/db/schema/aspirantes';
import { tejedores } from '@/db/schema/tejedores';
import { eq } from 'drizzle-orm';
import { getErrorMessage, isDuplicateKeyError } from '@/lib/error-handler';
import { requireAuth } from '@/lib/auth';

/**
 * Obtener todos los aspirantes
 */
export async function getAspirantes() {
    try {
        await requireAuth();
        const data = await db.select().from(aspirantes);
        return { success: true, data };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'los aspirantes', 'obtener');
        return { success: false, error: errorMessage };
    }
}

/**
 * Obtener un aspirante por su Cédula
 */
export async function getAspirante(cedula: string) {
    try {
        await requireAuth();
        const result = await db.select().from(aspirantes).where(eq(aspirantes.cedulaAspirante, cedula));
        if (result.length === 0) {
            return { success: false, error: 'Aspirante no encontrado' };
        }
        return { success: true, data: result[0] };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'el aspirante', 'obtener');
        return { success: false, error: errorMessage };
    }
}


/**
 * Crear un nuevo aspirante (Postulación)
 */

/**
 * Actualizar datos de un aspirante
 */

/**
 * Eliminar una postulación
 */

/**
 * Promover Aspirante a Tejedor
 * Esta función mueve los datos de la tabla aspirantes a la tabla tejedores
 */