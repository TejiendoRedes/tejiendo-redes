'use server'

import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { medicos, type NewMedico } from '@/db/schema/medicos';
import { tejedores } from '@/db/schema/tejedores';
import { especialidades } from '@/db/schema/especialidades';
import { eq } from 'drizzle-orm';

/**
 * Obtener todos los médicos con sus relaciones (con búsqueda opcional)
 */
import { like, or } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';


/**
 * Crear un nuevo médico (asignar rol médico a un tejedor)
 */
export async function createMedico(data: NewMedico) {
    try {
        await requireAuth();
        await db.insert(medicos).values(data);
        revalidatePath('/datos-basicos/medicos');
        return { success: true, message: 'Médico asignado correctamente' };
    } catch (error) {
        console.error('Error creating medico:', error);
        return { success: false, error: 'Error al asignar el médico' };
    }
}

/**
 * Actualizar un médico
 */
export async function updateMedico(cedula: string, data: Partial<NewMedico>) {
    try {
        await requireAuth();
        await db.update(medicos)
            .set(data)
            .where(eq(medicos.cedulaTejedor, cedula));
        revalidatePath('/datos-basicos/medicos');
        return { success: true, message: 'Médico actualizado correctamente' };
    } catch (error) {
        console.error('Error updating medico:', error);
        return { success: false, error: 'Error al actualizar el médico' };
    }
}

/**
 * Eliminar (desasignar) un médico
 */
export async function deleteMedico(cedula: string) {
    try {
        await requireAuth();
        await db.delete(medicos)
            .where(eq(medicos.cedulaTejedor, cedula));
        revalidatePath('/datos-basicos/medicos');
        return { success: true, message: 'Médico eliminado correctamente' };
    } catch (error) {
        console.error('Error deleting medico:', error);
        return { success: false, error: 'Error al eliminar el médico' };
    }
}
