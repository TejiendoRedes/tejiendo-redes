'use server'

import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { consultas, type NewConsulta } from '@/db/schema/consultas';
import { consultasEnfermedades, type NewConsultaEnfermedad } from '@/db/schema/relations';
import { abordaje } from '@/db/schema/abordajes';
import { pacientes } from '@/db/schema/pacientes';
import { especialidades } from '@/db/schema/especialidades';
import { medicos } from '@/db/schema/medicos';
import { eq, inArray, sql, desc } from 'drizzle-orm';
import { tejedores } from '@/db/schema/tejedores';
import { getErrorMessage } from '@/lib/error-handler';
import { getNextCode } from '@/lib/id-generator';
import { requireAuth } from '@/lib/auth';
import { ConsultaSchema } from '@/schemas/consultas';

// Eliminado: checkCodeExists (ahora se genera automáticamente)

/**
 * Obtener todas las consultas con relaciones
 */


/**
 * Obtener historial de consultas de un paciente
 */

/**
 * Obtener historial de medicamentos entregados a un paciente
 */

/**
 * Obtener enfermedades asociadas a una consulta
 */

/**
 * Crear una nueva consulta con sus enfermedades asociadas
 */
export async function createConsulta(
    data: NewConsulta,
    enfermedadesIds: string[]
) {
    try {
        await requireAuth();

        const validation = ConsultaSchema.safeParse(data);
        if (!validation.success) {
            return { success: false, error: validation.error.errors[0].message };
        }

        // Generación automática del código de consulta (CON-001...)
        const newCode = await getNextCode(consultas, consultas.codigoConsulta, 'CON-');

        // Obtener fecha y hora actual en zona horaria de Venezuela (America/Caracas, UTC-4)
        const venezuelaTime = new Intl.DateTimeFormat('es-VE', {
            timeZone: 'America/Caracas',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }).format(new Date());

        const horaFormateada = venezuelaTime;
        const fechaActual = new Date(new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/Caracas'
        }).format(new Date()));


        await db.transaction(async (tx) => {
            // 1. Insert Consulta
            await tx.insert(consultas).values({
                ...data,
                codigoConsulta: newCode,
                horaConsulta: horaFormateada
            });

            // 2. Insert Enfermedades Relations
            if (enfermedadesIds.length > 0) {
                const relations: NewConsultaEnfermedad[] = enfermedadesIds.map(id => ({
                    codigoConsulta: newCode,
                    codigoEnfermedad: id
                }));
                await tx.insert(consultasEnfermedades).values(relations);
            }
        });

        revalidatePath('/atencion-medica');
        // Also revalidate the specific abordaje page if this consulta belongs to an abordaje
        if (data.codigoAbordaje) {
            revalidatePath(`/abordajes/${data.codigoAbordaje}`);
        }
        return { success: true, message: `Consulta creada correctamente con código ${newCode}` };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'la consulta', 'crear');
        return { success: false, error: errorMessage };
    }
}

/**
 * Actualizar una consulta y sus enfermedades
 */
export async function updateConsulta(
    codigo: string,
    data: Partial<NewConsulta>,
    enfermedadesIds: string[]
) {
    try {
        await requireAuth();

        const validation = ConsultaSchema.partial().safeParse(data);
        if (!validation.success) {
            return { success: false, error: validation.error.errors[0].message };
        }

        await db.transaction(async (tx) => {
            // 1. Update Consulta
            await tx.update(consultas)
                .set(data)
                .where(eq(consultas.codigoConsulta, codigo));

            // 2. Sync Enfermedades: Delete old ones and insert new ones
            // This is a naive "replace all" strategy which is safe for simple many-to-many
            await tx.delete(consultasEnfermedades)
                .where(eq(consultasEnfermedades.codigoConsulta, codigo));

            if (enfermedadesIds.length > 0) {
                const relations: NewConsultaEnfermedad[] = enfermedadesIds.map(id => ({
                    codigoConsulta: codigo,
                    codigoEnfermedad: id
                }));
                await tx.insert(consultasEnfermedades).values(relations);
            }
        });

        revalidatePath('/atencion-medica');
        return { success: true, message: 'Consulta actualizada correctamente' };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'la consulta', 'actualizar');
        return { success: false, error: errorMessage };
    }
}

/**
 * Eliminar una consulta
 */
export async function deleteConsulta(codigo: string) {
    try {
        await requireAuth();
        // Cascade delete should handle children, but explicit delete is safer sometimes depending on DB config
        // defined in schema as cascade, so just deleting parent is enough.
        await db.delete(consultas)
            .where(eq(consultas.codigoConsulta, codigo));
        revalidatePath('/atencion-medica');
        return { success: true, message: 'Consulta eliminada correctamente' };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'la consulta', 'eliminar');
        return { success: false, error: errorMessage };
    }
}
