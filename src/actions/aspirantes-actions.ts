'use server'

import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { aspirantes, type NewAspirante, type Aspirante } from '@/db/schema/aspirantes';
import { tejedores } from '@/db/schema/tejedores';
import { eq } from 'drizzle-orm';

/**
 * Obtener todos los aspirantes
 */
export async function getAspirantes() {
    try {
        const data = await db.select().from(aspirantes);
        return { success: true, data };
    } catch (error) {
        console.error('Error fetching aspirantes:', error);
        return { success: false, error: 'Error al obtener los aspirantes' };
    }
}

/**
 * Crear un nuevo aspirante (Postulación)
 */
export async function createAspirante(data: NewAspirante) {
    try {
        await db.insert(aspirantes).values(data);
        revalidatePath('/datos-basicos/aspirantes');
        return { success: true, message: 'Postulación registrada correctamente' };
    } catch (error) {
        console.error('Error creating aspirante:', error);
        return { success: false, error: 'Error al registrar la postulación' };
    }
}

/**
 * Actualizar datos de un aspirante
 */
export async function updateAspirante(cedula: string, data: Partial<NewAspirante>) {
    try {
        await db.update(aspirantes)
            .set(data)
            .where(eq(aspirantes.cedulaAspirante, cedula));
        revalidatePath('/datos-basicos/aspirantes');
        return { success: true, message: 'Aspirante actualizado correctamente' };
    } catch (error) {
        console.error('Error updating aspirante:', error);
        return { success: false, error: 'Error al actualizar el aspirante' };
    }
}

/**
 * Eliminar una postulación
 */
export async function deleteAspirante(cedula: string) {
    try {
        await db.delete(aspirantes)
            .where(eq(aspirantes.cedulaAspirante, cedula));
        revalidatePath('/datos-basicos/aspirantes');
        return { success: true, message: 'Postulación eliminada correctamente' };
    } catch (error) {
        console.error('Error deleting aspirante:', error);
        return { success: false, error: 'Error al eliminar el aspirante' };
    }
}

/**
 * Promover Aspirante a Tejedor
 * Esta función mueve los datos de la tabla aspirantes a la tabla tejedores
 */
export async function promoverATejedor(aspirante: Aspirante) {
    try {
        await db.transaction(async (tx) => {
            // 1. Insertar en la tabla de tejedores
            await tx.insert(tejedores).values({
                cedulaTejedor: aspirante.cedulaAspirante,
                nombreTejedor: aspirante.nombreAspirante,
                apellidoTejedor: aspirante.apellidoAspirante,
                fechaNacimiento: aspirante.fechaNacimiento,
                direccionTejedor: aspirante.direccionAspirante,
                telefonoTejedor: aspirante.telefonoAspirante,
                correoTejedor: aspirante.correoAspirante,
                profesionTejedor: aspirante.profesionAspirante,
                fechaIngreso: new Date(), // Fecha actual como ingreso
                tipoVoluntario: 'Activo',  // Valor por defecto
            });

            // 2. Eliminar de la tabla de aspirantes
            await tx.delete(aspirantes)
                .where(eq(aspirantes.cedulaAspirante, aspirante.cedulaAspirante));
        });

        revalidatePath('/datos-basicos/aspirantes');
        revalidatePath('/datos-basicos/tejedores');
        
        return { success: true, message: 'Aspirante promovido a Tejedor exitosamente' };
    } catch (error) {
        console.error('Error en promoción:', error);
        return { success: false, error: 'Error al procesar la promoción del aspirante' };
    }
}