'use server'

import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { enfermedades, type NewEnfermedad, type Enfermedad } from '@/db/schema/enfermedades';
import { eq } from 'drizzle-orm';
import { getErrorMessage } from '@/lib/error-handler';
import { getNextCode } from '@/lib/id-generator';

/**
 * Obtener todas las enfermedades
 */
export async function getEnfermedades() {
    try {
        const data = await db.select().from(enfermedades);
        return { success: true, data };
    } catch (error) {
        console.error('Error fetching enfermedades:', error);
        return { success: false, error: 'Error al obtener las enfermedades' };
    }
}

/**
 * Crear una nueva enfermedad
 */
export async function createEnfermedad(data: NewEnfermedad) {
    try {
        // Validaciones básicas de campos obligatorios
        if (!data.nombreEnfermedad?.trim()) {
            return { success: false, error: 'El nombre de la enfermedad es requerido' };
        }

        // Generación automática del código de enfermedad (ENF-001...)
        const newCode = await getNextCode(enfermedades, enfermedades.codigoEnfermedad, 'ENF-');

        const finalData = {
            ...data,
            codigoEnfermedad: newCode
        };

        await db.insert(enfermedades).values(finalData);
        revalidatePath('/datos-basicos/enfermedades');
        return { success: true, message: `Enfermedad creada correctamente con código ${newCode}` };
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
        await db.delete(enfermedades)
            .where(eq(enfermedades.codigoEnfermedad, codigo));
        revalidatePath('/datos-basicos/enfermedades');
        return { success: true, message: 'Enfermedad eliminada correctamente' };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'la enfermedad', 'eliminar');
        return { success: false, error: errorMessage };
    }
}
