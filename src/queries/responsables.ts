"use server";


import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { responsable as responsables, type NewResponsable, type Responsable } from '@/db/schema/responsable';
import { eq, like, or } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';

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
        await requireAuth();
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
 * Obtener un responsable por su Cédula
 */
export async function getResponsable(cedula: string) {
    try {
        await requireAuth();
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
