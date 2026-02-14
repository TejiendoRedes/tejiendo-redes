'use server'

import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { especialidades, type NewEspecialidad, type Especialidad } from '@/db/schema/especialidades';
import { eq } from 'drizzle-orm';
import { getErrorMessage } from '@/lib/error-handler';
import { getNextCode } from '@/lib/id-generator';

/**
 * Obtener todas las especialidades
 */
export async function getEspecialidades() {
    try {
        const data = await db.select().from(especialidades);
        return { success: true, data };
    } catch (error) {
        console.error('Error fetching especialidades:', error);
        return { success: false, error: 'Error al obtener las especialidades' };
    }
}

/**
 * Crear una nueva especialidad
 */
export async function createEspecialidad(data: NewEspecialidad) {
    try {
        // Validaciones básicas de campos obligatorios
        if (!data.nombreEspecialidad?.trim()) {
            return { success: false, error: 'El nombre de la especialidad es requerido' };
        }

        // Generación automática del código de especialidad (ESP-001...)
        const newCode = await getNextCode(especialidades, especialidades.codigoEspecialidad, 'ESP-');

        const finalData = {
            ...data,
            codigoEspecialidad: newCode
        };

        await db.insert(especialidades).values(finalData);
        revalidatePath('/datos-basicos/especialidades');
        return { success: true, message: `Especialidad creada correctamente con código ${newCode}` };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'la especialidad', 'crear');
        return { success: false, error: errorMessage };
    }
}

/**
 * Actualizar una especialidad
 */
export async function updateEspecialidad(codigo: string, data: Partial<NewEspecialidad>) {
    try {
        await db.update(especialidades)
            .set(data)
            .where(eq(especialidades.codigoEspecialidad, codigo));
        revalidatePath('/datos-basicos/especialidades');
        return { success: true, message: 'Especialidad actualizada correctamente' };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'la especialidad', 'actualizar');
        return { success: false, error: errorMessage };
    }
}

/**
 * Eliminar una especialidad
 */
export async function deleteEspecialidad(codigo: string) {
    try {
        await db.delete(especialidades)
            .where(eq(especialidades.codigoEspecialidad, codigo));
        revalidatePath('/datos-basicos/especialidades');
        return { success: true, message: 'Especialidad eliminada correctamente' };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'la especialidad', 'eliminar');
        return { success: false, error: errorMessage };
    }
}
