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
 * Crear un nuevo aspirante
 */
export async function createAspirante(data: NewAspirante) {
    try {
        await db.insert(aspirantes).values(data);
        revalidatePath('/datos-basicos/aspirantes');
        return { success: true, message: 'Aspirante registrado correctamente' };
    } catch (error) {
        console.error('Error creating aspirante:', error);
        return { success: false, error: 'Error al registrar el aspirante' };
    }
}

/**
 * Actualizar un aspirante existente
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
 * Eliminar un aspirante
 */
export async function deleteAspirante(cedula: string) {
    try {
        await db.delete(aspirantes)
            .where(eq(aspirantes.cedulaAspirante, cedula));
        revalidatePath('/datos-basicos/aspirantes');
        return { success: true, message: 'Aspirante eliminado correctamente' };
    } catch (error) {
        console.error('Error deleting aspirante:', error);
        return { success: false, error: 'Error al eliminar el aspirante' };
    }
}

/**
 * CONFIRMAR ASPIRANTE: Mueve la data de aspirantes a tejedores
 */
export async function confirmarAspirante(cedula: string) {
    try {
        // 1. Buscar al aspirante por su cédula
        const [aspirante] = await db.select()
            .from(aspirantes)
            .where(eq(aspirantes.cedulaAspirante, cedula));

        if (!aspirante) {
            return { success: false, error: 'Aspirante no encontrado' };
        }

        // 2. Insertar en la tabla de tejedores (Mapeo de campos)
        await db.insert(tejedores).values({
            cedulaTejedor: aspirante.cedulaAspirante,
            nombreTejedor: aspirante.nombreAspirante,
            apellidoTejedor: aspirante.apellidoAspirante,
            fechaNacimiento: aspirante.fechaNacimiento,
            direccionTejedor: aspirante.direccionAspirante,
            telefonoTejedor: aspirante.telefonoAspirante,
            correoTejedor: aspirante.correoAspirante,
            profesionTejedor: aspirante.profesionAspirante,
            fechaIngreso: new Date(), // Fecha actual de ingreso
            tipoVoluntario: 'Regular', // Valor por defecto
        });

        // 3. Eliminar de la tabla de aspirantes
        await db.delete(aspirantes)
            .where(eq(aspirantes.cedulaAspirante, cedula));

        // 4. Revalidar ambas rutas para que se actualicen las tablas en el UI
        revalidatePath('/datos-basicos/aspirantes');
        revalidatePath('/datos-basicos/tejedores');

        return { success: true, message: 'Aspirante confirmado y movido a Tejedores' };
    } catch (error) {
        console.error('Error confirmando aspirante:', error);
        return { success: false, error: 'Error en el proceso de confirmación' };
    }
}