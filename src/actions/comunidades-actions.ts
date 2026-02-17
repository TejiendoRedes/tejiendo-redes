'use server'

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
 * Crear una nueva comunidad
 */
export async function createComunidad(data: NewComunidad) {
    try {
        await requireAuth();
        // Validaciones básicas de campos obligatorios
        if (!data.nombreComunidad?.trim()) {
            return { success: false, error: 'El nombre de la comunidad es requerido' };
        }

        // Generación automática del código de comunidad (COM-001...)
        const newCode = await getNextCode(comunidades, comunidades.codigoComunidad, 'COM-');

        const finalData = {
            ...data,
            codigoComunidad: newCode
        };

        await db.insert(comunidades).values(finalData);
        revalidatePath('/datos-basicos/comunidades');
        return { success: true, message: `Comunidad creada correctamente con código ${newCode}` };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'la comunidad', 'crear', {
            duplicate: 'Ya existe una comunidad con este nombre o código. Por favor, verifica los datos.',
        });
        return { success: false, error: errorMessage };
    }
}

/**
 * Actualizar una comunidad
 */
export async function updateComunidad(codigo: string, data: Partial<NewComunidad>) {
    try {
        await requireAuth();
        // Verificar que la comunidad existe
        const existing = await db.select()
            .from(comunidades)
            .where(eq(comunidades.codigoComunidad, codigo))
            .limit(1);

        if (!existing || existing.length === 0) {
            return { success: false, error: 'La comunidad no fue encontrada' };
        }

        await db.update(comunidades)
            .set(data)
            .where(eq(comunidades.codigoComunidad, codigo));
        revalidatePath('/datos-basicos/comunidades');
        return { success: true, message: 'Comunidad actualizada correctamente' };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'la comunidad', 'actualizar');
        return { success: false, error: errorMessage };
    }
}

/**
 * Eliminar una comunidad
 */
export async function deleteComunidad(codigo: string) {
    try {
        await requireAuth();
        // Verificar que la comunidad existe antes de eliminar
        const existing = await db.select()
            .from(comunidades)
            .where(eq(comunidades.codigoComunidad, codigo))
            .limit(1);

        if (!existing || existing.length === 0) {
            return { success: false, error: 'La comunidad no fue encontrada' };
        }

        await db.delete(comunidades)
            .where(eq(comunidades.codigoComunidad, codigo));
        revalidatePath('/datos-basicos/comunidades');
        return { success: true, message: 'Comunidad eliminada correctamente' };
    } catch (error: any) {
        // Detectar si es error de clave foránea y proporcionar mensaje específico
        // En Drizzle, el error de MySQL está en error.cause
        const mysqlError = error?.cause || error;
        const errorCode = mysqlError?.code || error?.code;
        const errorMsg = mysqlError?.sqlMessage || mysqlError?.message || error?.message || '';

        if (errorCode === 'ER_ROW_IS_REFERENCED_2' || errorMsg.includes('foreign key constraint')) {
            // Intentar determinar qué tabla está causando el problema
            if (errorMsg.includes('pacientes') || errorMsg.includes('pac_')) {
                return { success: false, error: DeleteErrorMessages.comunidad.conPacientes(0).replace('tiene 0 pacientes', 'tiene pacientes') };
            }
            if (errorMsg.includes('abordaje_comunidad') || errorMsg.includes('ab_com_')) {
                return { success: false, error: DeleteErrorMessages.comunidad.conAbordajes() };
            }

            // Mensaje genérico si no podemos determinar la causa exacta
            return { success: false, error: DeleteErrorMessages.comunidad.generic() };
        }

        const errorMessage = getErrorMessage(error, 'la comunidad', 'eliminar');
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
