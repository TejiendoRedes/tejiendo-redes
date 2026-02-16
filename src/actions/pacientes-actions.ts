'use server'

import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { pacientes, type NewPaciente, type Paciente } from '@/db/schema/pacientes';
import { comunidades } from '@/db/schema/comunidades';
import { eq } from 'drizzle-orm';
import { getErrorMessage, DeleteErrorMessages } from '@/lib/error-handler';

/**
 * Obtener todos los pacientes con su comunidad (con búsqueda opcional)
 */
import { like, or } from 'drizzle-orm';

export async function getPacientes(query?: string, limit: number = 50) {
    try {
        let queryBuilder = db.select()
            .from(pacientes)
            .leftJoin(comunidades, eq(pacientes.codigoComunidad, comunidades.codigoComunidad))
            .$dynamic();

        if (query) {
            queryBuilder = queryBuilder.where(
                or(
                    like(pacientes.nombrePaciente, `%${query}%`),
                    like(pacientes.apellidoPaciente, `%${query}%`),
                    like(pacientes.cedulaPaciente, `%${query}%`)
                )
            );
        }

        const result = await queryBuilder.limit(limit);

        // Transformar data para el cliente
        const data = result.map(({ pacientes, comunidades }) => ({
            ...pacientes,
            comunidad: comunidades
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
export async function createPaciente(data: NewPaciente) {
    try {
        // Validaciones básicas
        if (!data.cedulaPaciente?.trim()) {
            return { success: false, error: 'La cédula es requerida' };
        }
        if (!data.nombrePaciente?.trim()) {
            return { success: false, error: 'El nombre es requerido' };
        }
        if (!data.apellidoPaciente?.trim()) {
            return { success: false, error: 'El apellido es requerido' };
        }
        if (!data.codigoComunidad?.trim()) {
            return { success: false, error: 'La comunidad es requerida' };
        }

        // DB-06: INSERT directly — FK constraint handles community validation
        await db.insert(pacientes).values(data);
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
export async function updatePaciente(cedula: string, data: Partial<NewPaciente>) {
    try {
        // Verificar que el paciente existe
        const existing = await db.select()
            .from(pacientes)
            .where(eq(pacientes.cedulaPaciente, cedula))
            .limit(1);

        if (!existing || existing.length === 0) {
            return { success: false, error: 'El paciente no fue encontrado' };
        }

        // Si se está cambiando la comunidad, verificar que existe
        if (data.codigoComunidad) {
            const comunidadExists = await db.select()
                .from(comunidades)
                .where(eq(comunidades.codigoComunidad, data.codigoComunidad))
                .limit(1);

            if (!comunidadExists || comunidadExists.length === 0) {
                return { success: false, error: 'La comunidad seleccionada no existe' };
            }
        }

        await db.update(pacientes)
            .set(data)
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
export async function getPaciente(cedula: string) {
    try {
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
