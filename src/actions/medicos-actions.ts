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

export async function getMedicos(query?: string, limit: number = 50) {
    try {
        let queryBuilder = db.select()
            .from(medicos)
            .leftJoin(tejedores, eq(medicos.cedulaTejedor, tejedores.cedulaTejedor))
            .leftJoin(especialidades, eq(medicos.codigoEspecialidad, especialidades.codigoEspecialidad))
            .$dynamic();

        if (query) {
            queryBuilder = queryBuilder.where(
                or(
                    like(tejedores.nombreTejedor, `%${query}%`),
                    like(tejedores.apellidoTejedor, `%${query}%`),
                    like(medicos.cedulaTejedor, `%${query}%`)
                )
            );
        }

        const result = await queryBuilder.limit(limit);

        // Transformar data para el cliente (aplanar campos de tejedor para componentes de búsqueda)
        const data = result.map(({ medicos, tejedores, especialidades }) => ({
            ...medicos,
            nombreTejedor: tejedores?.nombreTejedor,
            apellidoTejedor: tejedores?.apellidoTejedor,
            tejedor: tejedores,
            especialidad: especialidades
        }));

        return { success: true, data };
    } catch (error) {
        console.error('Error fetching medicos:', error);
        return { success: false, error: 'Error al obtener los médicos' };
    }
}

/**
 * Crear un nuevo médico (asignar rol médico a un tejedor)
 */
export async function createMedico(data: NewMedico) {
    try {
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
        await db.delete(medicos)
            .where(eq(medicos.cedulaTejedor, cedula));
        revalidatePath('/datos-basicos/medicos');
        return { success: true, message: 'Médico eliminado correctamente' };
    } catch (error) {
        console.error('Error deleting medico:', error);
        return { success: false, error: 'Error al eliminar el médico' };
    }
}
