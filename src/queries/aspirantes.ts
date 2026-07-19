"use server";

import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { aspirantes, type NewAspirante, type Aspirante } from '@/db/schema/aspirantes';
import { tejedores } from '@/db/schema/tejedores';
import { estados, municipios, parroquias } from '@/db/schema/geografia';
import { eq } from 'drizzle-orm';
import { getErrorMessage, isDuplicateKeyError } from '@/lib/error-handler';
import { requireAuth } from '@/lib/auth';

/**
 * Obtener todos los aspirantes
 */
export async function getAspirantes() {
    try {
        await requireAuth();
        const results = await db.select({
            aspirante: aspirantes,
            estadoNombre: estados.nombre,
            municipioNombre: municipios.nombre,
            parroquiaNombre: parroquias.nombre
        })
        .from(aspirantes)
        .leftJoin(parroquias, eq(aspirantes.parroquiaId, parroquias.id))
        .leftJoin(municipios, eq(parroquias.municipioId, municipios.id))
        .leftJoin(estados, eq(municipios.estadoId, estados.id));

        const data = results.map(row => ({
            ...row.aspirante,
            estadoNombre: row.estadoNombre,
            municipioNombre: row.municipioNombre,
            parroquiaNombre: row.parroquiaNombre
        }));

        return { success: true, data };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'los aspirantes', 'obtener');
        return { success: false, error: errorMessage };
    }
}

/**
 * Obtener un aspirante por su Cédula
 */
export async function getAspirante(cedula: string) {
    try {
        await requireAuth();
        const result = await db.select().from(aspirantes).where(eq(aspirantes.cedulaAspirante, cedula));
        if (result.length === 0) {
            return { success: false, error: 'Aspirante no encontrado' };
        }
        return { success: true, data: result[0] };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'el aspirante', 'obtener');
        return { success: false, error: errorMessage };
    }
}

/**
 * Promover Aspirante a Tejedor
 * Esta función mueve los datos de la tabla aspirantes a la tabla tejedores
 */