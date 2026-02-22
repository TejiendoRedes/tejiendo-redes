"use server";


import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { organismos, type NewOrganismo, type Organismo } from '@/db/schema/organismos';
import { tejedores } from '@/db/schema/tejedores';
import { eq } from 'drizzle-orm';
import { getErrorMessage } from '@/lib/error-handler';
import { getNextCode } from '@/lib/id-generator';
import { requireAuth } from '@/lib/auth';

/**
 * Obtener todos los organismos con sus tejedores responsables
 */
export async function getOrganismos() {
    try {
        await requireAuth();
        const result = await db.select()
            .from(organismos)
            .leftJoin(tejedores, eq(organismos.cedulaTejedor, tejedores.cedulaTejedor));

        // Transformar data para el cliente
        const data = result.map(({ organismos, tejedores }) => ({
            ...organismos,
            tejedor: tejedores
        }));

        return { success: true, data };
    } catch (error) {
        console.error('Error fetching organismos:', error);
        return { success: false, error: 'Error al obtener los organismos' };
    }
}

