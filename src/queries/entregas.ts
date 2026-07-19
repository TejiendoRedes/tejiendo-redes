"use server";


import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { entregasMedicamentos, medicamentos, pacientes, abordaje, tejedores } from '@/db/schema';
import { eq, gt, sql, desc, inArray } from 'drizzle-orm';
import { comunidades } from '@/db/schema/comunidades';
import { getErrorMessage } from '@/lib/error-handler';
import { requireAuth } from '@/lib/auth';

/**
 * Obtener todas las entregas con información de paciente y medicamento
 */
export async function getEntregas() {
    try {
        await requireAuth();
        const result = await db.select({
            id: entregasMedicamentos.id,
            codigoPeticion: sql<string>`CAST(${entregasMedicamentos.id} AS CHAR)`, // Convertir a string para compatibilidad si la ui aún lo necesita
            codigoPaciente: entregasMedicamentos.codigoPaciente,
            codigoMedicamento: entregasMedicamentos.codigoMedicamento,
            cantidad: entregasMedicamentos.cantidad, // Mapear cantidad correctamente
            fechaPeticion: entregasMedicamentos.fechaEntrega, // Compatibility
            fechaEntrega: entregasMedicamentos.fechaEntrega, // Agregar fecha de entrega
            horaEntrega: sql<string>`'00:00:00'`, // Compatibility
            estado: entregasMedicamentos.estado,
            notas: entregasMedicamentos.notas, // Mapear notas correctamente
            nombrePaciente: pacientes.nombrePaciente,
            apellidoPaciente: pacientes.apellidoPaciente,
            nombreMedicamento: medicamentos.nombreMedicamento,
            presentacion: medicamentos.presentacion,
            existencia: medicamentos.existencia,
            codigoAbordaje: entregasMedicamentos.codigoAbordaje,
            descripcionAbordaje: abordaje.descripcion,
            cedulaTejedor: entregasMedicamentos.cedulaTejedor,
            nombreTejedor: tejedores.nombreTejedor,
            apellidoTejedor: tejedores.apellidoTejedor,
        })
            .from(entregasMedicamentos)
            .leftJoin(pacientes, eq(entregasMedicamentos.codigoPaciente, pacientes.cedulaPaciente))
            .leftJoin(medicamentos, eq(entregasMedicamentos.codigoMedicamento, medicamentos.codigoMedicamento))
            .leftJoin(abordaje, eq(entregasMedicamentos.codigoAbordaje, abordaje.codigoAbordaje))
            .leftJoin(tejedores, eq(entregasMedicamentos.cedulaTejedor, tejedores.cedulaTejedor))
            .orderBy(desc(entregasMedicamentos.fechaEntrega));

        return { success: true, data: result as any[] };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'las entregas', 'obtener');
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
 * Marcar petición como entregada
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
