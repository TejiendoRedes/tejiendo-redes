'use server'

import { db } from '@/db';
import { abordaje } from '@/db/schema/abordajes';
import { abordajeComunidad } from '@/db/schema/relations';
import { comunidades } from '@/db/schema/comunidades';
import { pacientes } from '@/db/schema/pacientes';
import { consultas } from '@/db/schema/consultas';
import { consultasEnfermedades } from '@/db/schema/relations';
import { enfermedades } from '@/db/schema/enfermedades';
import { medicamentos } from '@/db/schema/medicamentos';
import { eq, sql, and, gte, lte, count, desc } from 'drizzle-orm';

/**
 * DB-04: Obtener datos para el Reporte de Abordajes
 * Consolidated from 3 queries into 1 with subqueries + applied filters + limit
 */
export async function getReporteAbordajes(fechaInicio?: string, fechaFin?: string, codigoComunidad?: string) {
    try {
        const conditions = [];
        if (fechaInicio) conditions.push(gte(abordaje.fechaAbordaje, new Date(fechaInicio)));
        if (fechaFin) conditions.push(lte(abordaje.fechaAbordaje, new Date(fechaFin)));

        // Single query with correlated subqueries instead of 3 separate queries + JS Maps
        const result = await db
            .select({
                codigo_abordaje: abordaje.codigoAbordaje,
                fecha_abordaje: abordaje.fechaAbordaje,
                descripcion: abordaje.descripcion,
                hora_inicio: abordaje.horaInicio,
                hora_fin: abordaje.horaFin,
                comunidades: sql<number>`(SELECT COUNT(*) FROM abordaje_comunidad ac WHERE ac.codigo_abordaje = ${abordaje.codigoAbordaje})`,
                pacientes_atendidos: sql<number>`(SELECT COUNT(DISTINCT c.cedula_paciente) FROM consultas c WHERE c.codigo_abordaje = ${abordaje.codigoAbordaje})`,
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
 * Consolidated from 4 queries into 1 with subqueries
 */
export async function getReporteComunidades(codigoComunidad?: string) {
    try {
        const conditions = [];
        if (codigoComunidad) conditions.push(eq(comunidades.codigoComunidad, codigoComunidad));

        const result = await db
            .select({
                codigo_comunidad: comunidades.codigoComunidad,
                nombre_comunidad: comunidades.nombreComunidad,
                estado: comunidades.estado,
                municipio: comunidades.municipio,
                cantidad_habitantes: comunidades.cantidadHabitantes,
                pacientes_tratados: sql<number>`(SELECT COUNT(*) FROM pacientes p WHERE p.codigo_comunidad = ${comunidades.codigoComunidad})`,
                abordajes_realizados: sql<number>`(SELECT COUNT(*) FROM abordaje_comunidad ac WHERE ac.codigo_comunidad = ${comunidades.codigoComunidad})`,
                total_consultas: sql<number>`(SELECT COUNT(*) FROM consultas c INNER JOIN pacientes p ON c.cedula_paciente = p.cedula_paciente WHERE p.codigo_comunidad = ${comunidades.codigoComunidad})`,
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
 * Consolidated from 2 queries + Map into 1 JOIN query
 */
export async function getReportePacientes(codigoComunidad?: string) {
    try {
        const conditions = [];
        if (codigoComunidad) conditions.push(eq(pacientes.codigoComunidad, codigoComunidad));

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
export async function getReporteMorbilidad(fechaInicio?: string, fechaFin?: string) {
    try {
        // Subconsulta para obtener total de consultas (para calcular porcentajes)
        const totalConsultas = await db
            .select({ total: count(consultas.codigoConsulta) })
            .from(consultas);

        const total = totalConsultas[0]?.total || 1; // Evitar división por cero

        // Subconsulta para casos y pacientes por enfermedad
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
            .leftJoin(casosPorEnfermedad, eq(enfermedades.codigoEnfermedad, casosPorEnfermedad.codigoEnfermedad));

        return { success: true, data: result };
    } catch (error) {
        console.error('Error fetching reporte morbilidad:', error);
        return { success: false, error: 'Error al obtener el reporte de morbilidad', data: [] };
    }
}

/**
 * Obtener datos para el Reporte de Medicamentos
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
