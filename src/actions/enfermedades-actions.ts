'use server'

import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { enfermedades, type NewEnfermedad, type Enfermedad } from '@/db/schema/enfermedades';
import { eq } from 'drizzle-orm';
import { getErrorMessage } from '@/lib/error-handler';
import { getNextCode } from '@/lib/id-generator';
import { requireAuth } from '@/lib/auth';

/**
 * Obtener todas las enfermedades (con búsqueda opcional)
 */
import { like, or } from 'drizzle-orm';

export async function getEnfermedades(query?: string, limit: number = 50) {
    try {
        await requireAuth();
        let queryBuilder = db.select().from(enfermedades).$dynamic();

        if (query) {
            queryBuilder = queryBuilder.where(
                or(
                    like(enfermedades.nombreEnfermedad, `%${query}%`),
                    like(enfermedades.codigoEnfermedad, `%${query}%`),
                    like(enfermedades.tipoPatologia, `%${query}%`)
                )
            );
        }

        const data = await queryBuilder.limit(limit);
        return { success: true, data };
    } catch (error) {
        console.error('Error fetching enfermedades:', error);
        return { success: false, error: 'Error al obtener las enfermedades' };
    }
}

/**
 * Crear una nueva enfermedad
 */
export async function createEnfermedad(data: Omit<NewEnfermedad, 'codigoEnfermedad'> & { codigoEnfermedad?: string }) {
    try {
        await requireAuth();
        // Validaciones básicas de campos obligatorios
        if (!data.nombreEnfermedad?.trim()) {
            return { success: false, error: 'El nombre de la enfermedad es requerido' };
        }

        // Generación automática del código si no se proporciona (o si viene vacío)
        let finalCode = data.codigoEnfermedad?.trim();

        if (!finalCode) {
            finalCode = await getNextCode(enfermedades, enfermedades.codigoEnfermedad, 'ENF-');
        }

        const finalData = {
            ...data,
            codigoEnfermedad: finalCode.toUpperCase()
        };

        await db.insert(enfermedades).values(finalData);
        revalidatePath('/datos-basicos/enfermedades');
        return { success: true, message: `Enfermedad creada correctamente con código ${finalCode}` };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'la enfermedad', 'crear');
        return { success: false, error: errorMessage };
    }
}

/**
 * Actualizar una enfermedad
 */
export async function updateEnfermedad(codigo: string, data: Partial<NewEnfermedad>) {
    try {
        await requireAuth();
        await db.update(enfermedades)
            .set(data)
            .where(eq(enfermedades.codigoEnfermedad, codigo));
        revalidatePath('/datos-basicos/enfermedades');
        return { success: true, message: 'Enfermedad actualizada correctamente' };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'la enfermedad', 'actualizar');
        return { success: false, error: errorMessage };
    }
}

/**
 * Eliminar una enfermedad
 */
export async function deleteEnfermedad(codigo: string) {
    try {
        await requireAuth();
        await db.delete(enfermedades)
            .where(eq(enfermedades.codigoEnfermedad, codigo));
        revalidatePath('/datos-basicos/enfermedades');
        return { success: true, message: 'Enfermedad eliminada correctamente' };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'la enfermedad', 'eliminar');
        return { success: false, error: errorMessage };
    }
}

/**
 * Obtener una enfermedad por código
 */
export async function getEnfermedad(codigo: string) {
    try {
        await requireAuth();
        const result = await db.select()
            .from(enfermedades)
            .where(eq(enfermedades.codigoEnfermedad, codigo))
            .limit(1);

        if (!result || result.length === 0) {
            return { success: false, error: 'Enfermedad no encontrada' };
        }

        return { success: true, data: result[0] };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'la enfermedad', 'obtener');
        return { success: false, error: errorMessage };
    }
}
