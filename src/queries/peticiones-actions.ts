"use server";


import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { peticiones, medicamentos, pacientes, abordaje, type NewPeticion, type Peticion } from '@/db/schema';
import { eq, and, gt, sql, desc, inArray } from 'drizzle-orm';
import { comunidades } from '@/db/schema/comunidades';
import { getErrorMessage } from '@/lib/error-handler';
import { requireAuth } from '@/lib/auth';
import { PeticionSchema } from '@/schemas/peticiones';

/**
 * Obtener todas las peticiones con información de paciente y medicamento
 */
export async function getPeticiones() {
    try {
        await requireAuth();
        const result = await db.select({
            id: peticiones.id,
            codigoPeticion: sql<string>`CAST(${peticiones.id} AS CHAR)`, // Convertir a string para compatibilidad
            codigoPaciente: peticiones.codigoPaciente,
            codigoMedicamento: peticiones.codigoMedicamento,
            cantidad: peticiones.cantidad, // Mapear cantidad correctamente
            fechaPeticion: peticiones.fechaPeticion,
            fechaEntrega: peticiones.fechaEntrega, // Agregar fecha de entrega
            horaEntrega: peticiones.horaEntrega, // Agregar hora de entrega
            estado: peticiones.estado,
            notas: peticiones.notas, // Mapear notas correctamente
            nombrePaciente: pacientes.nombrePaciente,
            apellidoPaciente: pacientes.apellidoPaciente,
            nombreMedicamento: medicamentos.nombreMedicamento,
            presentacion: medicamentos.presentacion,
            existencia: medicamentos.existencia,
            codigoAbordaje: peticiones.codigoAbordaje,
            descripcionAbordaje: abordaje.descripcion,
        })
            .from(peticiones)
            .leftJoin(pacientes, eq(peticiones.codigoPaciente, pacientes.cedulaPaciente))
            .leftJoin(medicamentos, eq(peticiones.codigoMedicamento, medicamentos.codigoMedicamento))
            .leftJoin(abordaje, eq(peticiones.codigoAbordaje, abordaje.codigoAbordaje))
            .orderBy(desc(peticiones.fechaPeticion));

        return { success: true, data: result as any[] };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'las peticiones', 'obtener');
        return { success: false, error: errorMessage };
    }
}

/**
 * Obtener todos los pacientes para el selector
 */
export async function getPacientes() {
    try {
        await requireAuth();
        const data = await db.select()
            .from(pacientes)
            .leftJoin(comunidades, eq(pacientes.codigoComunidad, comunidades.codigoComunidad));

        const result = data.map(({ pacientes, comunidades }) => ({
            ...pacientes,
            comunidad: comunidades
        }));

        return { success: true, data: result };
    } catch (error) {
        console.error('Error fetching pacientes:', error);
        return { success: false, error: 'Error al obtener los pacientes' };
    }
}

/**
 * Obtener todos los medicamentos con existencia disponible
 */
export async function getMedicamentosDisponibles() {
    try {
        await requireAuth();
        // FIX: Cambiar lt a gt para obtener medicamentos con existencia > 0
        const data = await db.select()
            .from(medicamentos)
            .where(gt(medicamentos.existencia, 0)); // Medicamentos con existencia mayor que 0

        return { success: true, data };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'los medicamentos', 'obtener');
        return { success: false, error: errorMessage };
    }
}

/**
 * Obtener pacientes para select (formato simplificado)
 */
export async function getPacientesForSelect() {
    try {
        await requireAuth();
        const data = await db.select({
            cedulaPaciente: pacientes.cedulaPaciente,
            nombrePaciente: pacientes.nombrePaciente,
            apellidoPaciente: pacientes.apellidoPaciente,
        })
            .from(pacientes);

        return { success: true, data };
    } catch (error) {
        console.error('Error fetching pacientes:', error);
        return { success: false, error: 'Error al obtener los pacientes' };
    }
}

/**
 * Obtener medicamentos para select (formato simplificado)
 */
export async function getMedicamentosForSelect() {
    try {
        await requireAuth();
        const data = await db.select({
            codigoMedicamento: medicamentos.codigoMedicamento,
            nombreMedicamento: medicamentos.nombreMedicamento,
            presentacion: medicamentos.presentacion,
            existencia: medicamentos.existencia,
        })
            .from(medicamentos);

        return { success: true, data };
    } catch (error) {
        console.error('Error fetching medicamentos:', error);
        return { success: false, error: 'Error al obtener los medicamentos' };
    }
}

/**
 * Crear una nueva petición (sin restar existencias hasta aprobación)
 */

/**
 * Actualizar estado de una petición (restar existencias solo cuando se aprueba/entrega, devolver cuando se cancela)
 */

/**
 * Marcar petición como entregada
 */

/**
 * Eliminar una petición y devolver existencia al medicamento
 */

/**
 * Obtener abordajes para select (formato simplificado)
 */
export async function getAbordajesForSelect() {
    try {
        await requireAuth();
        const data = await db.select({
            codigoAbordaje: abordaje.codigoAbordaje,
            descripcion: abordaje.descripcion,
            fechaAbordaje: abordaje.fechaAbordaje,
        })
            .from(abordaje)
            .where(inArray(abordaje.estado, ['Pendiente', 'Confirmado', 'Finalizado'])) // Abordajes pendientes, confirmados o finalizados
            .orderBy(desc(abordaje.fechaAbordaje));

        return { success: true, data };
    } catch (error) {
        console.error('Error fetching abordajes:', error);
        return { success: false, error: 'Error al obtener los abordajes' };
    }
}
