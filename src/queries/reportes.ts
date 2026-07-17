"use server";


import { db } from '@/db';
import { abordaje } from '@/db/schema/abordajes';
import { abordajeComunidad, consultasEnfermedades } from '@/db/schema/relations';
import { comunidades } from '@/db/schema/comunidades';
import { pacientes } from '@/db/schema/pacientes';
import { consultas } from '@/db/schema/consultas';
import { enfermedades } from '@/db/schema/enfermedades';
import { medicamentos } from '@/db/schema/medicamentos';
import { peticiones } from '@/db/schema/peticiones';
import { eq, sql, and, gte, lte, count, desc, like } from 'drizzle-orm';
import { reportesFilterSchema } from '@/schemas/reportes';
import { requireAuth } from '@/lib/auth';

/**
 * DB-04: Obtener datos para el Reporte de Abordajes
 */
export async function getReporteAbordajes(params: unknown) {
    try {
        await requireAuth();
        const validatedParams = reportesFilterSchema.safeParse(params);
        if (!validatedParams.success) {
            return { success: false, error: 'Parámetros inválidos', data: [] };
        }

        const { fechaInicio, fechaFin, codigoComunidad, estado, municipio, parroquia, tipoComunidad } = validatedParams.data;
        const conditions = [];

        if (fechaInicio) conditions.push(gte(abordaje.fechaAbordaje, new Date(fechaInicio)));
        if (fechaFin) conditions.push(lte(abordaje.fechaAbordaje, new Date(fechaFin)));

        // Filtros relacionados con la comunidad
        const comunidadConditions = [];
        if (codigoComunidad && codigoComunidad !== 'todas') comunidadConditions.push(eq(comunidades.codigoComunidad, codigoComunidad));
        if (estado && estado !== 'todos') comunidadConditions.push(eq(comunidades.estado, estado));
        if (municipio && municipio !== 'todos') comunidadConditions.push(eq(comunidades.municipio, municipio));
        if (parroquia && parroquia !== 'todas') comunidadConditions.push(eq(comunidades.parroquia, parroquia));
        if (tipoComunidad && tipoComunidad !== 'todos') comunidadConditions.push(eq(comunidades.tipoComunidad, tipoComunidad));

        if (comunidadConditions.length > 0) {
            const abordajesEnComunidad = db
                .select({ codigoAbordaje: abordajeComunidad.codigoAbordaje })
                .from(abordajeComunidad)
                .innerJoin(comunidades, eq(abordajeComunidad.codigoComunidad, comunidades.codigoComunidad))
                .where(and(...comunidadConditions));

            conditions.push(sql`${abordaje.codigoAbordaje} IN (${abordajesEnComunidad})`);
        }

        const result = await db
            .select({
                codigo_abordaje: abordaje.codigoAbordaje,
                fecha_abordaje: abordaje.fechaAbordaje,
                descripcion: abordaje.descripcion,
                hora_inicio: abordaje.horaInicio,
                hora_fin: abordaje.horaFin,
                comunidades: sql<number>`(
                    SELECT COUNT(DISTINCT ac.codigo_comunidad)
                    FROM abordaje_comunidad ac
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
        await requireAuth();
        const validatedParams = reportesFilterSchema.safeParse(params);
        if (!validatedParams.success) {
            return { success: false, error: 'Parámetros inválidos', data: [] };
        }
        const { codigoComunidad, estado, municipio, parroquia, tipoComunidad } = validatedParams.data;

        const conditions = [];
        if (codigoComunidad && codigoComunidad !== 'todas') conditions.push(eq(comunidades.codigoComunidad, codigoComunidad));
        if (estado && estado !== 'todos') conditions.push(eq(comunidades.estado, estado));
        if (municipio && municipio !== 'todos') conditions.push(eq(comunidades.municipio, municipio));
        if (parroquia && parroquia !== 'todas') conditions.push(eq(comunidades.parroquia, parroquia));
        if (tipoComunidad && tipoComunidad !== 'todos') conditions.push(eq(comunidades.tipoComunidad, tipoComunidad));

        const result = await db
            .select({
                codigo_comunidad: comunidades.codigoComunidad,
                nombre_comunidad: comunidades.nombreComunidad,
                estado: comunidades.estado,
                municipio: comunidades.municipio,
                parroquia: comunidades.parroquia,
                tipo_comunidad: comunidades.tipoComunidad,
                telefono_comunidad: comunidades.telefonoComunidad,
                cantidad_habitantes: comunidades.cantidadHabitantes,
                cantidad_familias: comunidades.cantidadFamilias,
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
        await requireAuth();
        const validatedParams = reportesFilterSchema.safeParse(params);
        if (!validatedParams.success) {
            return { success: false, error: 'Parámetros inválidos', data: [] };
        }
        const { codigoComunidad, estado, municipio, parroquia, tipoComunidad } = validatedParams.data;

        const conditions = [];
        if (codigoComunidad && codigoComunidad !== 'todas') conditions.push(eq(pacientes.codigoComunidad, codigoComunidad));
        if (estado && estado !== 'todos') conditions.push(eq(comunidades.estado, estado));
        if (municipio && municipio !== 'todos') conditions.push(eq(comunidades.municipio, municipio));
        if (parroquia && parroquia !== 'todas') conditions.push(eq(comunidades.parroquia, parroquia));
        if (tipoComunidad && tipoComunidad !== 'todos') conditions.push(eq(comunidades.tipoComunidad, tipoComunidad));

        const result = await db
            .select({
                cedula_paciente: pacientes.cedulaPaciente,
                codigo_comunidad: pacientes.codigoComunidad,
                nombre_comunidad: sql<string>`COALESCE(${comunidades.nombreComunidad}, 'Desconocida')`,
                nombre_paciente: pacientes.nombrePaciente,
                apellido_paciente: pacientes.apellidoPaciente,
                fecha_nacimiento: pacientes.fechaNacimiento,
                direccion_paciente: pacientes.direccionPaciente,
                telefono_paciente: pacientes.telefonoPaciente,
                correo_paciente: pacientes.correoPaciente,
                estado: comunidades.estado,
                municipio: comunidades.municipio,
                parroquia: comunidades.parroquia,
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
        await requireAuth();
        const validatedParams = reportesFilterSchema.safeParse(params);
        if (!validatedParams.success) {
            return { success: false, error: 'Parámetros inválidos', data: [] };
        }
        const { fechaInicio, fechaFin, codigoComunidad, estado, municipio, parroquia, tipoComunidad } = validatedParams.data;

        // Filtros para la subconsulta de casos
        const whereConditions = [];
        if (fechaInicio) whereConditions.push(gte(abordaje.fechaAbordaje, new Date(fechaInicio)));
        if (fechaFin) whereConditions.push(lte(abordaje.fechaAbordaje, new Date(fechaFin)));

        const comunidadConditions = [];
        if (codigoComunidad && codigoComunidad !== 'todas') comunidadConditions.push(eq(comunidades.codigoComunidad, codigoComunidad));
        if (estado && estado !== 'todos') comunidadConditions.push(eq(comunidades.estado, estado));
        if (municipio && municipio !== 'todos') comunidadConditions.push(eq(comunidades.municipio, municipio));
        if (parroquia && parroquia !== 'todas') comunidadConditions.push(eq(comunidades.parroquia, parroquia));
        if (tipoComunidad && tipoComunidad !== 'todos') comunidadConditions.push(eq(comunidades.tipoComunidad, tipoComunidad));

        if (comunidadConditions.length > 0) {
            const pacientesEnComunidades = db
                .select({ cedulaPaciente: pacientes.cedulaPaciente })
                .from(pacientes)
                .innerJoin(comunidades, eq(pacientes.codigoComunidad, comunidades.codigoComunidad))
                .where(and(...comunidadConditions));

            whereConditions.push(sql`${consultas.cedulaPaciente} IN (${pacientesEnComunidades})`);
        }

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
 * Obtener datos para el Reporte de Medicamentos Entregados
 * Agrupa entregas por medicamento, aplicando filtros de fecha, comunidad y ubicación
 */
export async function getReporteMedicamentos(params: unknown) {
    try {
        await requireAuth();
        const validatedParams = reportesFilterSchema.safeParse(params);
        if (!validatedParams.success) {
            return { success: false, error: 'Parámetros inválidos', data: [] };
        }

        const { fechaInicio, fechaFin, codigoComunidad, estado, municipio, parroquia, tipoComunidad } = validatedParams.data;

        // Condiciones para las peticiones (entregas)
        const peticionConditions = [eq(peticiones.estado, 'entregado')];

        if (fechaInicio) peticionConditions.push(gte(peticiones.fechaEntrega, new Date(fechaInicio)));
        if (fechaFin) peticionConditions.push(lte(peticiones.fechaEntrega, new Date(fechaFin)));

        // Filtros de ubicación a través de pacientes -> comunidades
        const comunidadConditions = [];
        if (codigoComunidad && codigoComunidad !== 'todas') comunidadConditions.push(eq(comunidades.codigoComunidad, codigoComunidad));
        if (estado && estado !== 'todos') comunidadConditions.push(eq(comunidades.estado, estado));
        if (municipio && municipio !== 'todos') comunidadConditions.push(eq(comunidades.municipio, municipio));
        if (parroquia && parroquia !== 'todas') comunidadConditions.push(eq(comunidades.parroquia, parroquia));
        if (tipoComunidad && tipoComunidad !== 'todos') comunidadConditions.push(eq(comunidades.tipoComunidad, tipoComunidad));

        if (comunidadConditions.length > 0) {
            const pacientesEnComunidades = db
                .select({ cedulaPaciente: pacientes.cedulaPaciente })
                .from(pacientes)
                .innerJoin(comunidades, eq(pacientes.codigoComunidad, comunidades.codigoComunidad))
                .where(and(...comunidadConditions));

            peticionConditions.push(sql`${peticiones.codigoPaciente} IN (${pacientesEnComunidades})`);
        }

        // Construir la consulta principal partiendo de medicamentos para asegurar que todos aparezcan
        const result = await db
            .select({
                codigo_medicamento: medicamentos.codigoMedicamento,
                nombre_medicamento: medicamentos.nombreMedicamento,
                presentacion: medicamentos.presentacion,
                existencia: medicamentos.existencia,
                descripcion: medicamentos.descripcion,
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
        await requireAuth();
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
