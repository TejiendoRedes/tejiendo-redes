'use server'

import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { aspirantes, type NewAspirante, type Aspirante } from '@/db/schema/aspirantes';
import { tejedores } from '@/db/schema/tejedores';
import { users } from '@/db/schema/users';
import { eq } from 'drizzle-orm';
import { getErrorMessage, isDuplicateKeyError } from '@/lib/error-handler';
import { requireAuth } from '@/lib/auth';

/**
 * Obtener todos los aspirantes
 */

/**
 * Obtener un aspirante por su Cédula
 */


import { toTitleCase } from '@/lib/string-utils';

/**
 * Crear un nuevo aspirante (Postulación)
 */
export async function createAspirante(data: NewAspirante) {
    try {
        await requireAuth();
        // Validaciones básicas
        if (!data.cedulaAspirante?.trim()) {
            return { success: false, error: 'La cédula es requerida' };
        }
        if (!data.nombreAspirante?.trim()) {
            return { success: false, error: 'El nombre es requerido' };
        }
        if (!data.apellidoAspirante?.trim()) {
            return { success: false, error: 'El apellido es requerido' };
        }

        // Formateo de texto
        data.nombreAspirante = toTitleCase(data.nombreAspirante.trim());
        data.apellidoAspirante = toTitleCase(data.apellidoAspirante.trim());

        await db.insert(aspirantes).values(data);
        revalidatePath('/datos-basicos/aspirantes');
        return { success: true, message: 'Postulación registrada correctamente' };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'la postulación', 'crear', {
            duplicate: 'Ya existe un aspirante con esta cédula. Por favor, verifica los datos.',
        });
        return { success: false, error: errorMessage };
    }
}

/**
 * Actualizar datos de un aspirante
 */
export async function updateAspirante(cedula: string, data: Partial<NewAspirante>) {
    try {
        await requireAuth();
        // Verificar que el aspirante existe
        const existing = await db.select()
            .from(aspirantes)
            .where(eq(aspirantes.cedulaAspirante, cedula))
            .limit(1);

        if (!existing || existing.length === 0) {
            return { success: false, error: 'El aspirante no fue encontrado' };
        }

        // Formateo de texto
        if (data.nombreAspirante) {
            data.nombreAspirante = toTitleCase(data.nombreAspirante.trim());
        }
        if (data.apellidoAspirante) {
            data.apellidoAspirante = toTitleCase(data.apellidoAspirante.trim());
        }

        await db.update(aspirantes)
            .set(data)
            .where(eq(aspirantes.cedulaAspirante, cedula));
        revalidatePath('/datos-basicos/aspirantes');
        return { success: true, message: 'Aspirante actualizado correctamente' };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'el aspirante', 'actualizar');
        return { success: false, error: errorMessage };
    }
}

/**
 * Eliminar una postulación
 */
export async function deleteAspirante(cedula: string) {
    try {
        await requireAuth();
        // Verificar que el aspirante existe antes de eliminar
        const existing = await db.select()
            .from(aspirantes)
            .where(eq(aspirantes.cedulaAspirante, cedula))
            .limit(1);

        if (!existing || existing.length === 0) {
            return { success: false, error: 'El aspirante no fue encontrado' };
        }

        await db.delete(aspirantes)
            .where(eq(aspirantes.cedulaAspirante, cedula));
        revalidatePath('/datos-basicos/aspirantes');
        return { success: true, message: 'Postulación eliminada correctamente' };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'la postulación', 'eliminar');
        return { success: false, error: errorMessage };
    }
}

/**
 * Promover Aspirante a Tejedor
 * Esta función mueve los datos de la tabla aspirantes a la tabla tejedores
 */
export async function promoverATejedor(aspirante: Aspirante) {
    try {
        await requireAuth();
        // Verificar que no exista ya un tejedor con esta cédula
        const existingTejedor = await db.select()
            .from(tejedores)
            .where(eq(tejedores.cedulaTejedor, aspirante.cedulaAspirante))
            .limit(1);

        if (existingTejedor && existingTejedor.length > 0) {
            return {
                success: false,
                error: 'Ya existe un tejedor con esta cédula. No se puede promover el aspirante.'
            };
        }

        await db.transaction(async (tx) => {
            // 1. Insertar en la tabla de tejedores
            await tx.insert(tejedores).values({
                cedulaTejedor: aspirante.cedulaAspirante,
                nombreTejedor: aspirante.nombreAspirante,
                apellidoTejedor: aspirante.apellidoAspirante,
                fechaNacimiento: aspirante.fechaNacimiento,
                direccionTejedor: aspirante.direccionAspirante,
                parroquiaId: aspirante.parroquiaId,
                telefonoTejedor: aspirante.telefonoAspirante,
                correoTejedor: aspirante.correoAspirante,
                profesionTejedor: aspirante.profesionAspirante,
                fechaIngreso: new Date(), // Fecha actual como ingreso
                tipodeVoluntario: 'Activo',  // Valor por defecto
            });

            // 2. Eliminar de la tabla de aspirantes
            await tx.delete(aspirantes)
                .where(eq(aspirantes.cedulaAspirante, aspirante.cedulaAspirante));

            // 3. Vincular el usuario asociado
            if (aspirante.username) {
                await tx.update(users)
                    .set({ approved: true, cedulaTejedor: aspirante.cedulaAspirante })
                    .where(eq(users.username, aspirante.username));
            }
        });

        revalidatePath('/datos-basicos/aspirantes');
        revalidatePath('/datos-basicos/tejedores');

        return { success: true, message: 'Aspirante promovido a Tejedor exitosamente' };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'la promoción', 'crear', {
            duplicate: 'Ya existe un tejedor con esta cédula',
        });
        return { success: false, error: errorMessage };
    }
}