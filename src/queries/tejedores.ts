"use server";


import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { tejedores, type NewTejedor, type Tejedor } from '@/db/schema/tejedores';
import { tejedoresAbordaje } from '@/db/schema/relations';
import { abordaje } from '@/db/schema/abordajes';
import { consultas } from '@/db/schema/consultas';
import { pacientes } from '@/db/schema/pacientes';
import { medicamentos } from '@/db/schema/medicamentos';
import { eq, desc, sql } from 'drizzle-orm';
import { getErrorMessage, DeleteErrorMessages } from '@/lib/error-handler';
import { requireAuth } from '@/lib/auth';
import { estados, municipios, parroquias } from '@/db/schema/geografia';
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
            estadoNombre: estados.nombre,
            municipioNombre: municipios.nombre,
            parroquiaNombre: parroquias.nombre,
            estadoId: estados.id,
            municipioId: municipios.id
        })
        .from(tejedores)
        .leftJoin(users, eq(tejedores.cedulaTejedor, users.cedulaTejedor))
        .leftJoin(medicos, eq(tejedores.cedulaTejedor, medicos.cedulaTejedor))
        .leftJoin(parroquias, eq(tejedores.parroquiaId, parroquias.id))
        .leftJoin(municipios, eq(parroquias.municipioId, municipios.id))
        .leftJoin(estados, eq(municipios.estadoId, estados.id));
        
        const mappedData = data.map(row => ({
            ...row.tejedor,
            systemRole: row.systemRole,
            codigoEspecialidad: row.medico?.codigoEspecialidad || null,
            matriculaColegioMedico: row.medico?.matriculaColegioMedico || null,
            matriculaSanidad: row.medico?.matriculaSanidad || null,
            estadoNombre: row.estadoNombre,
            municipioNombre: row.municipioNombre,
            parroquiaNombre: row.parroquiaNombre,
            estadoId: row.estadoId || null,
            municipioId: row.municipioId || null
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
            estadoNombre: estados.nombre,
            municipioNombre: municipios.nombre,
            parroquiaNombre: parroquias.nombre,
            estadoId: estados.id,
            municipioId: municipios.id
        })
            .from(tejedores)
            .leftJoin(users, eq(tejedores.cedulaTejedor, users.cedulaTejedor))
            .leftJoin(medicos, eq(tejedores.cedulaTejedor, medicos.cedulaTejedor))
            .leftJoin(parroquias, eq(tejedores.parroquiaId, parroquias.id))
            .leftJoin(municipios, eq(parroquias.municipioId, municipios.id))
            .leftJoin(estados, eq(municipios.estadoId, estados.id))
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
            estadoNombre: result[0].estadoNombre,
            municipioNombre: result[0].municipioNombre,
            parroquiaNombre: result[0].parroquiaNombre,
            estadoId: result[0].estadoId || null,
            municipioId: result[0].municipioId || null
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
        const { entregasMedicamentos } = await import('@/db/schema/entregas_medicamentos');
        const entregasRealizadas = await db.select({
            id: sql<string>`concat('ENT-', ${entregasMedicamentos.id})`,
            date: entregasMedicamentos.fechaEntrega,
            title: sql<string>`'ENTREGA DE MEDICAMENTO'`,
            subtitle: medicamentos.nombreMedicamento,
            type: sql<string>`'entrega'`,
            details: sql<string>`concat(${pacientes.nombrePaciente}, ' ', ${pacientes.apellidoPaciente})`,
            extra: sql<string>`concat(${entregasMedicamentos.cantidad}, ' ', ${medicamentos.presentacion})`
        })
            .from(entregasMedicamentos)
            .innerJoin(medicamentos, eq(entregasMedicamentos.codigoMedicamento, medicamentos.codigoMedicamento))
            .innerJoin(pacientes, eq(entregasMedicamentos.codigoPaciente, pacientes.cedulaPaciente))
            .where(eq(entregasMedicamentos.cedulaTejedor, cedula));

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
