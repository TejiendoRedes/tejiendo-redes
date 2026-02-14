'use server'

import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { organismos, type NewOrganismo, type Organismo } from '@/db/schema/organismos';
import { tejedores } from '@/db/schema/tejedores';
import { eq } from 'drizzle-orm';
import { getErrorMessage } from '@/lib/error-handler';
import { getNextCode } from '@/lib/id-generator';

/**
 * Obtener todos los organismos con sus tejedores responsables
 */
export async function getOrganismos() {
    try {
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

/**
 * Crear un nuevo organismo
 */
export async function createOrganismo(data: NewOrganismo) {
    try {
        // Validaciones básicas de campos obligatorios
        if (!data.nombreOrganismo?.trim()) {
            return { success: false, error: 'El nombre del organismo es requerido' };
        }

        // Generación automática del código de organismo (ORG-001...)
        const newCode = await getNextCode(organismos, organismos.codigoOrganismo, 'ORG-');

        const finalData = {
            ...data,
            codigoOrganismo: newCode
        };

        await db.insert(organismos).values(finalData);
        revalidatePath('/datos-basicos/organismos');
        return { success: true, message: `Organismo creado correctamente con código ${newCode}` };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'el organismo', 'crear');
        return { success: false, error: errorMessage };
    }
}

/**
 * Actualizar un organismo
 */
export async function updateOrganismo(codigo: string, data: Partial<NewOrganismo>) {
    try {
        await db.update(organismos)
            .set(data)
            .where(eq(organismos.codigoOrganismo, codigo));
        revalidatePath('/datos-basicos/organismos');
        return { success: true, message: 'Organismo actualizado correctamente' };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'el organismo', 'actualizar');
        return { success: false, error: errorMessage };
    }
}

/**
 * Eliminar un organismo
 */
export async function deleteOrganismo(codigo: string) {
    try {
        await db.delete(organismos)
            .where(eq(organismos.codigoOrganismo, codigo));
        revalidatePath('/datos-basicos/organismos');
        return { success: true, message: 'Organismo eliminado correctamente' };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'el organismo', 'eliminar');
        return { success: false, error: errorMessage };
    }
}
