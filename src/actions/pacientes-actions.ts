'use server'

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

import { toTitleCase } from '@/lib/string-utils';

/**
 * Crear un nuevo paciente
 */
export async function createPaciente(data: typeof pacientes.$inferInsert) {
    try {
        await requireAuth();

        const validation = PacienteSchema.safeParse(data);
        if (!validation.success) {
            return { success: false, error: validation.error.errors[0].message };
        }

        // Formatear nombres
        validation.data.nombrePaciente = toTitleCase(validation.data.nombrePaciente.trim());
        validation.data.apellidoPaciente = toTitleCase(validation.data.apellidoPaciente.trim());

        // Verificar si la comunidad existe
        if (validation.data.codigoComunidad) {
            const comunidadExists = await db.select({ id: comunidades.codigoComunidad })
                .from(comunidades)
                .where(eq(comunidades.codigoComunidad, validation.data.codigoComunidad))
                .limit(1);

            if (!comunidadExists.length) {
                return { success: false, error: 'La comunidad seleccionada no existe' };
            }
        }

        await db.insert(pacientes).values(validation.data);
        revalidatePath('/datos-basicos/pacientes');
        return { success: true, message: 'Paciente creado correctamente' };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'el paciente', 'crear', {
            duplicate: 'Ya existe un paciente con esta cédula. Por favor, verifica los datos.',
            foreignKey: 'La comunidad seleccionada no existe. Por favor, selecciona una comunidad válida.',
        });
        return { success: false, error: errorMessage };
    }
}

/**
 * Actualizar un paciente
 */
export async function updatePaciente(cedula: string, data: Partial<typeof pacientes.$inferInsert>) {
    try {
        await requireAuth();

        const validation = PacienteSchema.partial().safeParse(data);
        if (!validation.success) {
            return { success: false, error: validation.error.errors[0].message };
        }

        // Formatear nombres si se están actualizando
        if (validation.data.nombrePaciente) {
            validation.data.nombrePaciente = toTitleCase(validation.data.nombrePaciente.trim());
        }
        if (validation.data.apellidoPaciente) {
            validation.data.apellidoPaciente = toTitleCase(validation.data.apellidoPaciente.trim());
        }

        const existing = await db.select({ cedula: pacientes.cedulaPaciente })
            .from(pacientes)
            .where(eq(pacientes.cedulaPaciente, cedula))
            .limit(1);

        if (!existing.length) {
            return { success: false, error: 'El paciente no fue encontrado' };
        }

        if (validation.data.codigoComunidad) {
            const comunidadExists = await db.select({ id: comunidades.codigoComunidad })
                .from(comunidades)
                .where(eq(comunidades.codigoComunidad, validation.data.codigoComunidad))
                .limit(1);

            if (!comunidadExists.length) {
                return { success: false, error: 'La comunidad seleccionada no existe' };
            }
        }

        await db.update(pacientes)
            .set(validation.data)
            .where(eq(pacientes.cedulaPaciente, cedula));

        revalidatePath('/datos-basicos/pacientes');
        return { success: true, message: 'Paciente actualizado correctamente' };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'el paciente', 'actualizar');
        return { success: false, error: errorMessage };
    }
}

/**
 * Eliminar un paciente
 */
export async function deletePaciente(cedula: string) {
    try {
        await requireAuth();
        // Verificar que el paciente existe antes de eliminar
        const existing = await db.select()
            .from(pacientes)
            .where(eq(pacientes.cedulaPaciente, cedula))
            .limit(1);

        if (!existing || existing.length === 0) {
            return { success: false, error: 'El paciente no fue encontrado' };
        }

        await db.delete(pacientes)
            .where(eq(pacientes.cedulaPaciente, cedula));
        revalidatePath('/datos-basicos/pacientes');
        return { success: true, message: 'Paciente eliminado correctamente' };
    } catch (error: any) {
        // Detectar el tipo específico de error de FK
        // En Drizzle, el error de MySQL está en error.cause
        const mysqlError = error?.cause || error;
        const errorCode = mysqlError?.code || error?.code;
        const errorMsg = mysqlError?.sqlMessage || mysqlError?.message || error?.message || '';

        if (errorCode === 'ER_ROW_IS_REFERENCED_2' || errorMsg.includes('foreign key constraint')) {

            // Verificar qué tabla está causando el problema
            if (errorMsg.includes('consultas')) {
                return { success: false, error: DeleteErrorMessages.paciente.conConsultas() };
            }
            if (errorMsg.includes('peticiones')) {
                return { success: false, error: DeleteErrorMessages.paciente.conPeticiones() };
            }
            if (errorMsg.includes('medicamentos_pacientes') || errorMsg.includes('med_pac_')) {
                return { success: false, error: DeleteErrorMessages.paciente.conEntregas() };
            }
            if (errorMsg.includes('antecedentes')) {
                return { success: false, error: DeleteErrorMessages.paciente.conAntecedentes() };
            }

            // Mensaje genérico
            return { success: false, error: DeleteErrorMessages.paciente.generic() };
        }

        const errorMessage = getErrorMessage(error, 'el paciente', 'eliminar');
        return { success: false, error: errorMessage };
    }
}

/**
 * Obtener un paciente por cédula
 */
