'use server'

import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { responsable as responsables, type NewResponsable, type Responsable } from '@/db/schema/responsable';
import { eq, like, or } from 'drizzle-orm';

/**
 * Manejar errores de base de datos de forma específica
 */
const handleDatabaseError = (error: any) => {
    console.error('Database error details:', {
        code: error.code,
        errno: error.errno,
        sqlMessage: error.sqlMessage,
        sql: error.sql
    });

    if (error.code === 'ER_CON_COUNT_ERROR' || error.errno === 1040) {
        return 'Error: Demasiadas conexiones a la base de datos. Por favor, espere un momento e inténtelo de nuevo.';
    }

    if (error.code === 'ECONNREFUSED') {
        return 'Error: No se puede conectar a la base de datos. Verifique la configuración.';
    }

    if (error.code === 'ENOTFOUND') {
        return 'Error: Servidor de base de datos no encontrado. Verifique la configuración.';
    }

    return 'Error de base de datos. Contacte al administrador del sistema.';
};

/**
 * Obtener todos los responsables (con búsqueda opcional)
 */
export async function getResponsables(query?: string, limit: number = 50) {
    try {
        let queryBuilder = db.select()
            .from(responsables)
            .$dynamic();

        if (query) {
            queryBuilder = queryBuilder.where(
                or(
                    like(responsables.nombreResponsable, `%${query}%`),
                    like(responsables.apellidoResponsable, `%${query}%`),
                    like(responsables.cedulaResponsable, `%${query}%`)
                )
            );
        }

        const data = await queryBuilder.limit(limit);
        return { success: true, data };
    } catch (error) {
        console.error('Error fetching responsables:', error);
        return { success: false, error: handleDatabaseError(error) };
    }
}

/**
 * Crear un nuevo responsable
 */
export async function createResponsable(data: NewResponsable) {
    try {
        await db.insert(responsables).values(data);
        revalidatePath('/datos-basicos/responsables');
        return { success: true, message: 'Responsable creado correctamente' };
    } catch (error) {
        console.error('Error creating responsable:', error);
        return { success: false, error: handleDatabaseError(error) };
    }
}

/**
 * Actualizar un responsable
 */
export async function updateResponsable(cedula: string, data: Partial<NewResponsable>) {
    try {
        await db.update(responsables)
            .set(data)
            .where(eq(responsables.cedulaResponsable, cedula));
        revalidatePath('/datos-basicos/responsables');
        return { success: true, message: 'Responsable actualizado correctamente' };
    } catch (error) {
        console.error('Error updating responsable:', error);
        return { success: false, error: handleDatabaseError(error) };
    }
}

/**
 * Eliminar un responsable
 */
export async function deleteResponsable(cedula: string) {
    try {
        await db.delete(responsables)
            .where(eq(responsables.cedulaResponsable, cedula));
        revalidatePath('/datos-basicos/responsables');
        return { success: true, message: 'Responsable eliminado correctamente' };
    } catch (error) {
        console.error('Error deleting responsable:', error);
        return { success: false, error: handleDatabaseError(error) };
    }
}

/**
 * Obtener un responsable por su Cédula
 */
export async function getResponsable(cedula: string) {
    try {
        const result = await db.select().from(responsables).where(eq(responsables.cedulaResponsable, cedula));
        if (result.length === 0) {
            return { success: false, error: 'Responsable no encontrado' };
        }
        return { success: true, data: result[0] };
    } catch (error) {
        console.error('Error fetching responsable:', error);
        return { success: false, error: handleDatabaseError(error) };
    }
}
