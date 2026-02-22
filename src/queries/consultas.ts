"use server";


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

