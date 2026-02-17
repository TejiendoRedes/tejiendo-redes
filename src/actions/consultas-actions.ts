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
import { ConsultaSchema } from '@/lib/validators/consultas';

// Eliminado: checkCodeExists (ahora se genera automáticamente)

/**
 * Obtener todas las consultas con relaciones
 */
export async function getConsultas() {
    try {
        await requireAuth();
        // En un caso real masiva, esto deberia tener paginacion y filtros
        const data = await db.select({
            consulta: consultas,
            nombrePaciente: sql<string>`concat(${pacientes.nombrePaciente}, ' ', ${pacientes.apellidoPaciente})`,
            nombreMedico: sql<string>`concat(${tejedores.nombreTejedor}, ' ', ${tejedores.apellidoTejedor})`,
            codigoAbordaje: abordaje.codigoAbordaje,
            fechaAbordaje: abordaje.fechaAbordaje,
        })
            .from(consultas)
            .leftJoin(pacientes, eq(consultas.cedulaPaciente, pacientes.cedulaPaciente))
            .leftJoin(medicos, eq(consultas.cedulaMedico, medicos.cedulaTejedor))
            .leftJoin(tejedores, eq(medicos.cedulaTejedor, tejedores.cedulaTejedor))
            .leftJoin(abordaje, eq(consultas.codigoAbordaje, abordaje.codigoAbordaje));

        // Para evitar N+1, podriamos traer las enfermedades en un segundo query si son necesarias para la lista
        // Por ahora, solo retornamos los datos basicos para la tabla
        return { success: true, data };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'las consultas', 'obtener');
        return { success: false, error: errorMessage };
    }
}


/**
 * Obtener historial de consultas de un paciente
 */
export async function getPatientHistory(cedulaPaciente: string) {
    try {
        await requireAuth();
        const data = await db.select({
            consulta: consultas,
            nombreMedico: sql<string>`concat(${tejedores.nombreTejedor}, ' ', ${tejedores.apellidoTejedor})`,
            codigoAbordaje: abordaje.codigoAbordaje,
            descripcionAbordaje: abordaje.descripcion,
            fechaAbordaje: abordaje.fechaAbordaje,
            especialidad: especialidades.nombreEspecialidad
        })
            .from(consultas)
            .leftJoin(medicos, eq(consultas.cedulaMedico, medicos.cedulaTejedor))
            .leftJoin(tejedores, eq(medicos.cedulaTejedor, tejedores.cedulaTejedor))
            .leftJoin(especialidades, eq(medicos.codigoEspecialidad, especialidades.codigoEspecialidad))
            .leftJoin(abordaje, eq(consultas.codigoAbordaje, abordaje.codigoAbordaje))
            .where(eq(consultas.cedulaPaciente, cedulaPaciente))
            .orderBy(desc(abordaje.fechaAbordaje));

        return { success: true, data };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'el historial del paciente', 'obtener');
        return { success: false, error: errorMessage };
    }
}

/**
 * Obtener historial de medicamentos entregados a un paciente
 */
export async function getPatientMedicationHistory(cedulaPaciente: string) {
    try {
        await requireAuth();
        const { medicamentos } = await import('@/db/schema/medicamentos');
        const { medicamentosPacientes } = await import('@/db/schema/relations');

        const data = await db.select({
            entrega: medicamentosPacientes,
            nombreMedicamento: medicamentos.nombreMedicamento,
            presentacion: medicamentos.presentacion,
            fechaAbordaje: abordaje.fechaAbordaje,
            descripcionAbordaje: abordaje.descripcion
        })
            .from(medicamentosPacientes)
            .innerJoin(medicamentos, eq(medicamentosPacientes.codigoMedicamento, medicamentos.codigoMedicamento))
            .leftJoin(abordaje, eq(medicamentosPacientes.codigoAbordaje, abordaje.codigoAbordaje))
            .where(eq(medicamentosPacientes.cedulaPaciente, cedulaPaciente))
            .orderBy(desc(medicamentosPacientes.fechaEntrega));

        return { success: true, data };
    } catch (error) {
        console.error('Error fetching patient medication history:', error);
        return { success: false, error: 'No se pudo obtener el historial de medicamentos' };
    }
}

/**
 * Obtener enfermedades asociadas a una consulta
 */
export async function getEnfermedadesByConsulta(codigoConsulta: string) {
    try {
        await requireAuth();
        const data = await db.select()
            .from(consultasEnfermedades)
            .where(eq(consultasEnfermedades.codigoConsulta, codigoConsulta));
        return { success: true, data };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'las enfermedades', 'obtener');
        return { success: false, error: errorMessage };
    }
}

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

        await db.transaction(async (tx) => {
            // 1. Insert Consulta
            await tx.insert(consultas).values({
                ...data,
                codigoConsulta: newCode
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

        revalidatePath('/datos-basicos/consultas');
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

        revalidatePath('/datos-basicos/consultas');
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
        revalidatePath('/datos-basicos/consultas');
        return { success: true, message: 'Consulta eliminada correctamente' };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'la consulta', 'eliminar');
        return { success: false, error: errorMessage };
    }
}
