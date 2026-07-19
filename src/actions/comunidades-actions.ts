'use server'

import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { comunidades, type NewComunidad, type Comunidad } from '@/db/schema/comunidades';
import { responsable } from '@/db/schema/responsable';
import { eq } from 'drizzle-orm';
import { getErrorMessage, DeleteErrorMessages } from '@/lib/error-handler';
import { getNextCode } from '@/lib/id-generator';
import { requireAuth } from '@/lib/auth';
import { estados, municipios, parroquias } from '@/db/schema/geografia';

/**
 * Obtener prefijo mnemotécnico (ej: LAR-IRI-CON-)
 */
async function getMnemonicPrefix(parroquiaId: number) {
    const normalize = (str: string) => {
        // Remove accents and special chars, uppercase, get first 3 letters
        const clean = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z]/g, "").toUpperCase();
        return clean.substring(0, 3).padEnd(3, 'X'); // Pad with X if shorter than 3
    };

    const [parroquia] = await db.select().from(parroquias).where(eq(parroquias.id, parroquiaId));
    if (!parroquia) return 'XXX-XXX-XXX-';
    const [municipio] = await db.select().from(municipios).where(eq(municipios.id, parroquia.municipioId));
    if (!municipio) return 'XXX-XXX-XXX-';
    const [estado] = await db.select().from(estados).where(eq(estados.id, municipio.estadoId));
    if (!estado) return 'XXX-XXX-XXX-';

    const estadoNombre = estado.nombre;
    const municipioNombre = municipio.nombre;
    const parroquiaNombre = parroquia.nombre;

    return `${normalize(estadoNombre)}-${normalize(municipioNombre)}-${normalize(parroquiaNombre)}-`;
}

/**
 * Obtener todas las comunidades con sus responsables
 */

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

        // Generación automática del código de comunidad (EST-MUN-PAR-001...)
        const prefix = await getMnemonicPrefix(data.parroquiaId || 0);
        const newCode = await getNextCode(comunidades, comunidades.codigoComunidad, prefix);

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
