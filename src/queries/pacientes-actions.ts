"use server";


import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { pacientes, type NewPaciente, type Paciente } from '@/db/schema/pacientes';
import { comunidades } from '@/db/schema/comunidades';
import { eq, like, or, sql } from 'drizzle-orm';
import { getErrorMessage, DeleteErrorMessages } from '@/lib/error-handler';
import { requireAuth } from '@/lib/auth';
import { PacienteSchema } from '@/schemas/pacientes';

/**
 * Obtener todos los pacientes con su comunidad (con búsqueda opcional)
 */
export async function getPacientes(query?: string, limit: number = 50) {
    try {
        await requireAuth();

        const rawData = await db.select({
            pacientes: pacientes,
            comunidades: comunidades
        })
            .from(pacientes)
            .leftJoin(comunidades, eq(pacientes.codigoComunidad, comunidades.codigoComunidad))
            .where(query ? or(
                like(pacientes.nombrePaciente, `%${query}%`),
                like(pacientes.apellidoPaciente, `%${query}%`),
                like(pacientes.cedulaPaciente, `%${query}%`)
            ) : undefined)
            .limit(limit);

        const data = rawData.map(row => ({
            ...row.pacientes,
            comunidad: row.comunidades
        }));

        return { success: true, data };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'los pacientes', 'obtener');
        return { success: false, error: errorMessage };
    }
}

/**
 * Crear un nuevo paciente
 */

/**
 * Actualizar un paciente
 */

/**
 * Eliminar un paciente
 */

/**
 * Obtener un paciente por cédula
 */
export async function getPaciente(cedula: string) {
    try {
        await requireAuth();
        const result = await db.select()
            .from(pacientes)
            .leftJoin(comunidades, eq(pacientes.codigoComunidad, comunidades.codigoComunidad))
            .where(eq(pacientes.cedulaPaciente, cedula))
            .limit(1);

        if (!result || result.length === 0) {
            return { success: false, error: 'Paciente no encontrado' };
        }

        const data = {
            ...result[0].pacientes,
            comunidad: result[0].comunidades
        };

        return { success: true, data };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'el paciente', 'obtener');
        return { success: false, error: errorMessage };
    }
}
