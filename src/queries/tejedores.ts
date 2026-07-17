"use server";


import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { tejedores, type NewTejedor, type Tejedor } from '@/db/schema/tejedores';
import { tejedoresAbordaje, medicamentosPacientes } from '@/db/schema/relations';
import { abordaje } from '@/db/schema/abordajes';
import { consultas } from '@/db/schema/consultas';
import { pacientes } from '@/db/schema/pacientes';
import { medicamentos } from '@/db/schema/medicamentos';
import { eq, desc, sql } from 'drizzle-orm';
import { getErrorMessage, DeleteErrorMessages } from '@/lib/error-handler';
import { requireAuth } from '@/lib/auth';

import { users } from '@/db/schema/users';
import { medicos } from '@/db/schema/medicos';

/**
 * Obtener todos los tejedores
 */
export async function getTejedores() {
    try {
        await requireAuth();
        const data = await db.select({
            tejedor: tejedores,
            systemRole: users.role,
            medico: medicos,
        })
        .from(tejedores)
        .leftJoin(users, eq(tejedores.cedulaTejedor, users.cedulaTejedor))
        .leftJoin(medicos, eq(tejedores.cedulaTejedor, medicos.cedulaTejedor));
        
        const mappedData = data.map(row => ({
            ...row.tejedor,
            systemRole: row.systemRole,
            codigoEspecialidad: row.medico?.codigoEspecialidad || null,
            matriculaColegioMedico: row.medico?.matriculaColegioMedico || null,
            matriculaSanidad: row.medico?.matriculaSanidad || null,
        }));
        
        return { success: true, data: mappedData };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'los tejedores', 'obtener');
        return { success: false, error: errorMessage };
    }
}

/**
 * Obtener un tejedor por cédula
 */
export async function getTejedor(cedula: string) {
    try {
        await requireAuth();
        const result = await db.select({
            tejedor: tejedores,
            systemRole: users.role,
            medico: medicos,
        })
            .from(tejedores)
            .leftJoin(users, eq(tejedores.cedulaTejedor, users.cedulaTejedor))
            .leftJoin(medicos, eq(tejedores.cedulaTejedor, medicos.cedulaTejedor))
            .where(eq(tejedores.cedulaTejedor, cedula))
            .limit(1);

        if (!result || result.length === 0) {
            return { success: false, error: 'Tejedor no encontrado' };
        }

        const mappedData = {
            ...result[0].tejedor,
            systemRole: result[0].systemRole,
            codigoEspecialidad: result[0].medico?.codigoEspecialidad || null,
            matriculaColegioMedico: result[0].medico?.matriculaColegioMedico || null,
            matriculaSanidad: result[0].medico?.matriculaSanidad || null,
        };

        return { success: true, data: mappedData };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'el tejedor', 'obtener');
        return { success: false, error: errorMessage };
    }
}

/**
 * Obtener el historial completo de un tejedor (abordajes participados, consultas realizadas, entregas realizadas)
 */
export async function getTejedorHistory(cedula: string) {
    try {
        await requireAuth();
        // 1. Abordajes en los que participó
        const participaciones = await db.select({
            id: abordaje.codigoAbordaje,
            date: abordaje.fechaAbordaje,
            title: sql<string>`'PARTICIPACIÓN EN ABORDAJE'`,
            subtitle: abordaje.descripcion,
            type: sql<string>`'abordaje'`,
            details: tejedoresAbordaje.rolEnAbordaje,
            extra: sql<string>`null`
        })
            .from(tejedoresAbordaje)
            .innerJoin(abordaje, eq(tejedoresAbordaje.codigoAbordaje, abordaje.codigoAbordaje))
            .where(eq(tejedoresAbordaje.cedulaTejedor, cedula));

        // 2. Consultas realizadas (si es médico)
        const consultasRealizadas = await db.select({
            id: consultas.codigoConsulta,
            date: abordaje.fechaAbordaje,
            title: sql<string>`'CONSULTA REALIZADA'`,
            subtitle: sql<string>`concat(${pacientes.nombrePaciente}, ' ', ${pacientes.apellidoPaciente})`,
            type: sql<string>`'consulta'`,
            details: consultas.motivoConsulta,
            extra: consultas.diagnosticoTexto
        })
            .from(consultas)
            .innerJoin(pacientes, eq(consultas.cedulaPaciente, pacientes.cedulaPaciente))
            .innerJoin(abordaje, eq(consultas.codigoAbordaje, abordaje.codigoAbordaje))
            .where(eq(consultas.cedulaMedico, cedula));

        // 3. Medicamentos entregados
        const entregasRealizadas = await db.select({
            id: sql<string>`concat('ENT-', ${medicamentosPacientes.codigoMedicamento}, '-', ${medicamentosPacientes.cedulaPaciente})`,
            date: medicamentosPacientes.fechaEntrega,
            title: sql<string>`'ENTREGA DE MEDICAMENTO'`,
            subtitle: medicamentos.nombreMedicamento,
            type: sql<string>`'entrega'`,
            details: sql<string>`concat(${pacientes.nombrePaciente}, ' ', ${pacientes.apellidoPaciente})`,
            extra: sql<string>`concat(${medicamentosPacientes.cantidadEntregada}, ' ', ${medicamentos.presentacion})`
        })
            .from(medicamentosPacientes)
            .innerJoin(medicamentos, eq(medicamentosPacientes.codigoMedicamento, medicamentos.codigoMedicamento))
            .innerJoin(pacientes, eq(medicamentosPacientes.cedulaPaciente, pacientes.cedulaPaciente))
            .where(eq(medicamentosPacientes.cedulaTejedor, cedula));

        // Combinar todo
        const allInteractions = [
            ...participaciones,
            ...consultasRealizadas,
            ...entregasRealizadas
        ].sort((a, b) => new Date(b.date as Date).getTime() - new Date(a.date as Date).getTime());

        return { success: true, data: allInteractions };
    } catch (error) {
        console.error('Error fetching tejedor history:', error);
        return { success: false, error: 'No se pudo obtener el historial del tejedor' };
    }
}
