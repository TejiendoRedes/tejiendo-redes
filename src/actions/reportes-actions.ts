'use server'

import { db } from '@/db';
import { abordaje } from '@/db/schema/abordajes';
import { abordajeComunidad, consultasEnfermedades } from '@/db/schema/relations';
import { comunidades } from '@/db/schema/comunidades';
import { pacientes } from '@/db/schema/pacientes';
import { consultas } from '@/db/schema/consultas';
import { enfermedades } from '@/db/schema/enfermedades';
import { medicamentos } from '@/db/schema/medicamentos';
import { eq, sql, and, gte, lte, count, desc, like } from 'drizzle-orm';
import { reportesFilterSchema } from '@/lib/validators/reportes';

/**
 * DB-04: Obtener datos para el Reporte de Abordajes
 */
export async function getReporteAbordajes(params: unknown) {
    try {
        const validatedParams = reportesFilterSchema.safeParse(params);
        if (!validatedParams.success) {
            return { success: false, error: 'Parámetros inválidos', data: [] };
        }

        const { fechaInicio, fechaFin, codigoComunidad } = validatedParams.data;
        const conditions = [];

        if (fechaInicio) conditions.push(gte(abordaje.fechaAbordaje, new Date(fechaInicio)));
        if (fechaFin) conditions.push(lte(abordaje.fechaAbordaje, new Date(fechaFin)));

        // Si hay filtro de comunidad, necesitamos hacer join o subquery
        if (codigoComunidad && codigoComunidad !== 'todas') {
            const abordajesEnComunidad = db
                .select({ codigoAbordaje: abordajeComunidad.codigoAbordaje })
                .from(abordajeComunidad)
                .where(eq(abordajeComunidad.codigoComunidad, codigoComunidad));

            conditions.push(sql`${abordaje.codigoAbordaje} IN (${abordajesEnComunidad})`);
        }

        const result = await db
            .select({
                codigo_abordaje: abordaje.codigoAbordaje,
                fecha_abordaje: abordaje.fechaAbordaje,
                descripcion: abordaje.descripcion,
                hora_inicio: abordaje.horaInicio,
                hora_fin: abordaje.horaFin,
                comunidades: sql<string>`(
                    SELECT GROUP_CONCAT(c.nombre_comunidad SEPARATOR ', ')
                    FROM abordaje_comunidad ac
                    JOIN comunidades c ON ac.codigo_comunidad = c.codigo_comunidad
                    WHERE ac.codigo_abordaje = abordaje.codigo_abordaje
                )`,
                pacientes_atendidos: sql<number>`(
                    SELECT COUNT(DISTINCT c.cedula_paciente)
                    FROM consultas c
                    WHERE c.codigo_abordaje = abordaje.codigo_abordaje
                )`,
            })
            .from(abordaje)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(desc(abordaje.fechaAbordaje))
            .limit(200);

        return { success: true, data: result };
    } catch (error) {
        console.error('Error fetching reporte abordajes:', error);
        return { success: false, error: 'Error al obtener el reporte de abordajes', data: [] };
    }
}


/**
 * DB-04: Obtener datos para el Reporte de Comunidades
 */
export async function getReporteComunidades(params: unknown) {
    try {
        const validatedParams = reportesFilterSchema.safeParse(params);
        if (!validatedParams.success) {
            return { success: false, error: 'Parámetros inválidos', data: [] };
        }
        const { codigoComunidad } = validatedParams.data;

        const conditions = [];
        if (codigoComunidad && codigoComunidad !== 'todas') {
            conditions.push(eq(comunidades.codigoComunidad, codigoComunidad));
        }

        const result = await db
            .select({
                codigo_comunidad: comunidades.codigoComunidad,
                nombre_comunidad: comunidades.nombreComunidad,
                estado: comunidades.estado,
                municipio: comunidades.municipio,
                cantidad_habitantes: comunidades.cantidadHabitantes,
                pacientes_tratados: sql<number>`(SELECT COUNT(*) FROM pacientes p WHERE p.codigo_comunidad = comunidades.codigo_comunidad)`,
                abordajes_realizados: sql<number>`(SELECT COUNT(*) FROM abordaje_comunidad ac WHERE ac.codigo_comunidad = comunidades.codigo_comunidad)`,
                total_consultas: sql<number>`(SELECT COUNT(*) FROM consultas c INNER JOIN pacientes p ON c.cedula_paciente = p.cedula_paciente WHERE p.codigo_comunidad = comunidades.codigo_comunidad)`,
            })
            .from(comunidades)
            .where(conditions.length > 0 ? and(...conditions) : undefined);

        return { success: true, data: result };
    } catch (error) {
        console.error('Error fetching reporte comunidades:', error);
        return { success: false, error: 'Error al obtener el reporte de comunidades', data: [] };
    }
}

/**
 * DB-04: Obtener datos para el Reporte de Pacientes
 */
export async function getReportePacientes(params: unknown) {
    try {
        const validatedParams = reportesFilterSchema.safeParse(params);
        if (!validatedParams.success) {
            return { success: false, error: 'Parámetros inválidos', data: [] };
        }
        const { codigoComunidad } = validatedParams.data;

        const conditions = [];
        if (codigoComunidad && codigoComunidad !== 'todas') {
            conditions.push(eq(pacientes.codigoComunidad, codigoComunidad));
        }

        const result = await db
            .select({
                cedula_paciente: pacientes.cedulaPaciente,
                codigo_comunidad: pacientes.codigoComunidad,
                nombre_comunidad: comunidades.nombreComunidad,
                nombre_paciente: pacientes.nombrePaciente,
                apellido_paciente: pacientes.apellidoPaciente,
                fecha_nacimiento: pacientes.fechaNacimiento,
                direccion_paciente: pacientes.direccionPaciente,
                telefono_paciente: pacientes.telefonoPaciente,
                correo_paciente: pacientes.correoPaciente,
            })
            .from(pacientes)
            .leftJoin(comunidades, eq(pacientes.codigoComunidad, comunidades.codigoComunidad))
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .limit(500);

        return { success: true, data: result };
    } catch (error) {
        console.error('Error fetching reporte pacientes:', error);
        return { success: false, error: 'Error al obtener el reporte de pacientes', data: [] };
    }
}

/**
 * Obtener datos para el Reporte de Morbilidad
 */
export async function getReporteMorbilidad(params: unknown) {
    try {
        const validatedParams = reportesFilterSchema.safeParse(params);
        if (!validatedParams.success) {
            return { success: false, error: 'Parámetros inválidos', data: [] };
        }
        const { fechaInicio, fechaFin } = validatedParams.data;

        // Filtros para la subconsulta de casos
        const whereConditions = [];
        if (fechaInicio) whereConditions.push(gte(abordaje.fechaAbordaje, new Date(fechaInicio)));
        if (fechaFin) whereConditions.push(lte(abordaje.fechaAbordaje, new Date(fechaFin)));

        // Subconsulta para obtener total de consultas filtradas (para calcular porcentajes)
        // Necesitamos contar consultas que coincidan con los filtros de fecha (unidas con abordajes)
        const totalConsultasQuery = db
            .select({ total: count(consultas.codigoConsulta) })
            .from(consultas)
            .innerJoin(abordaje, eq(consultas.codigoAbordaje, abordaje.codigoAbordaje))
            .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

        const totalConsultasResult = await totalConsultasQuery;
        const total = totalConsultasResult[0]?.total || 1;

        // Subconsulta para casos y pacientes por enfermedad con filtros
        const casosPorEnfermedad = db
            .select({
                codigoEnfermedad: consultasEnfermedades.codigoEnfermedad,
                totalCasos: count(consultasEnfermedades.codigoConsulta).as('total_casos'),
                pacientesAfectados: sql<number>`COUNT(DISTINCT ${consultas.cedulaPaciente})`.as('pacientes_afectados'),
                ultimaConsulta: sql<Date>`MAX(${abordaje.fechaAbordaje})`.as('ultima_consulta')
            })
            .from(consultasEnfermedades)
            .innerJoin(consultas, eq(consultasEnfermedades.codigoConsulta, consultas.codigoConsulta))
            .innerJoin(abordaje, eq(consultas.codigoAbordaje, abordaje.codigoAbordaje))
            .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
            .groupBy(consultasEnfermedades.codigoEnfermedad)
            .as('casos_count');

        // Consulta principal
        const result = await db
            .select({
                codigo_enfermedad: enfermedades.codigoEnfermedad,
                nombre_enfermedad: enfermedades.nombreEnfermedad,
                tipo_patologia: enfermedades.tipoPatologia,
                total_casos: sql<number>`COALESCE(${casosPorEnfermedad.totalCasos}, 0)`,
                pacientes_afectados: sql<number>`COALESCE(${casosPorEnfermedad.pacientesAfectados}, 0)`,
                porcentaje: sql<string>`ROUND((COALESCE(${casosPorEnfermedad.totalCasos}, 0) * 100.0 / ${total}), 2)`,
                ultima_consulta: casosPorEnfermedad.ultimaConsulta
            })
            .from(enfermedades)
            .leftJoin(casosPorEnfermedad, eq(enfermedades.codigoEnfermedad, casosPorEnfermedad.codigoEnfermedad))
            // Opcional: Mostrar solo enfermedades con casos > 0 si se filtra
            .where(whereConditions.length > 0 ? sql`${casosPorEnfermedad.totalCasos} > 0` : undefined)
            .orderBy(desc(sql`COALESCE(${casosPorEnfermedad.totalCasos}, 0)`));

        return { success: true, data: result };
    } catch (error) {
        console.error('Error fetching reporte morbilidad:', error);
        return { success: false, error: 'Error al obtener el reporte de morbilidad', data: [] };
    }
}

/**
 * Obtener datos para el Reporte de Medicamentos
 * (Este reporte no suele filtrar por fecha de abordaje directamente, sino por inventario actual,
 * pero si se quisiera historial de movimientos sería diferente. Asumimos inventario actual por ahora)
 */
export async function getReporteMedicamentos() {
    try {
        const result = await db
            .select({
                codigo_medicamento: medicamentos.codigoMedicamento,
                nombre_medicamento: medicamentos.nombreMedicamento,
                presentacion: medicamentos.presentacion,
                existencia: medicamentos.existencia,
                descripcion: medicamentos.descripcion
            })
            .from(medicamentos)
            .orderBy(medicamentos.nombreMedicamento);

        return { success: true, data: result };
    } catch (error) {
        console.error('Error fetching reporte medicamentos:', error);
        return { success: false, error: 'Error al obtener el reporte de medicamentos', data: [] };
    }
}

/**
 * Obtener lista de comunidades para el filtro
 */
export async function getComunidadesParaFiltro() {
    try {
        const result = await db
            .select({
                codigo_comunidad: comunidades.codigoComunidad,
                nombre_comunidad: comunidades.nombreComunidad
            })
            .from(comunidades)
            .orderBy(comunidades.nombreComunidad);

        return { success: true, data: result };
    } catch (error) {
        console.error('Error fetching comunidades para filtro:', error);
        return { success: false, error: 'Error al obtener las comunidades', data: [] };
    }
}
