"use server";


import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { comunidades, type NewComunidad, type Comunidad } from '@/db/schema/comunidades';
import { responsable } from '@/db/schema/responsable';
import { eq } from 'drizzle-orm';
import { getErrorMessage, DeleteErrorMessages } from '@/lib/error-handler';
import { getNextCode } from '@/lib/id-generator';
import { requireAuth } from '@/lib/auth';

/**
 * Obtener todas las comunidades con sus responsables
 */
export async function getComunidades() {
    try {
        await requireAuth();
        const result = await db.select()
            .from(comunidades)
            .leftJoin(responsable, eq(comunidades.cedulaResponsable, responsable.cedulaResponsable));

        // Transformar data para el cliente
        const data = result.map(({ comunidades, responsable }) => ({
            ...comunidades,
            responsable: responsable
        }));

        return { success: true, data };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'las comunidades', 'obtener');
        return { success: false, error: errorMessage };
    }
}

/**
 * Obtener una comunidad por código
 */
export async function getComunidad(codigo: string) {
    try {
        await requireAuth();
        const result = await db.select()
            .from(comunidades)
            .where(eq(comunidades.codigoComunidad, codigo))
            .limit(1);

        if (!result || result.length === 0) {
            return { success: false, error: 'Comunidad no encontrada' };
        }

        return { success: true, data: result[0] };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'la comunidad', 'obtener');
        return { success: false, error: errorMessage };
    }
}
