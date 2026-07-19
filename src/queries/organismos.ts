"use server";


import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { organismos, type NewOrganismo, type Organismo } from '@/db/schema/organismos';
import { tejedores } from '@/db/schema/tejedores';
import { estados, municipios, parroquias } from '@/db/schema/geografia';
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
        const result = await db.select({
            organismo: organismos,
            tejedor: tejedores,
            estadoNombre: estados.nombre,
            municipioNombre: municipios.nombre,
            parroquiaNombre: parroquias.nombre
        })
            .from(organismos)
            .leftJoin(tejedores, eq(organismos.cedulaTejedor, tejedores.cedulaTejedor))
            .leftJoin(parroquias, eq(organismos.parroquiaId, parroquias.id))
            .leftJoin(municipios, eq(parroquias.municipioId, municipios.id))
            .leftJoin(estados, eq(municipios.estadoId, estados.id));

        // Transformar data para el cliente
        const data = result.map(({ organismo, tejedor, estadoNombre, municipioNombre, parroquiaNombre }) => ({
            ...organismo,
            tejedor: tejedor,
            estadoNombre,
            municipioNombre,
            parroquiaNombre
        }));

        return { success: true, data };
    } catch (error) {
        console.error('Error fetching organismos:', error);
        return { success: false, error: 'Error al obtener los organismos' };
    }
}

