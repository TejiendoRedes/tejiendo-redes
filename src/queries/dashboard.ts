"use server";


import { db } from '@/db';
import {
    abordaje,
    pacientes,
    consultas,
    consultasEnfermedades,
    medicamentos,
    comunidades,
    antecedentes,
    enfermedades,
    especialidades,
    medicos,
} from '@/db/schema';
import { eq, and, or, gte, lte, sql, desc, count, sum, asc, inArray } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';

// --- Shared Types ---
export type DashboardFilters = {
    fechaInicio?: string;
    fechaFin?: string;
    comunidad?: string;
};

// --- Helper for Filters ---
function getAbordajeConditions(filters: DashboardFilters) {
    const conditions = [];

    if (filters.fechaInicio && filters.fechaInicio.trim() !== '') {
        const d = new Date(filters.fechaInicio);
        if (!isNaN(d.getTime())) {
            conditions.push(gte(abordaje.fechaAbordaje, d));
        }
    }
    if (filters.fechaFin && filters.fechaFin.trim() !== '') {
        const d = new Date(filters.fechaFin);
        if (!isNaN(d.getTime())) {
            conditions.push(lte(abordaje.fechaAbordaje, d));
        }
    }
    if (filters.comunidad && filters.comunidad !== 'todas') {
        conditions.push(eq(abordaje.codigoComunidad, filters.comunidad));
    }

    return conditions.length > 0 ? and(...conditions) : undefined;
}

// --- 1. Executive Summary (KPIs) ---

export async function getExecutiveKPIs(filters: DashboardFilters) {
    const whereCondition = getAbordajeConditions(filters);

    // 1. Total Pacientes
    const totalPacientesQuery = await db.select({ count: count(consultas.cedulaPaciente) })
        .from(consultas)
        .innerJoin(abordaje, eq(consultas.codigoAbordaje, abordaje.codigoAbordaje))
        .where(whereCondition);

    // 2. Total Abordajes
    const totalAbordajesQuery = await db.select({ count: sql<number>`count(distinct ${abordaje.codigoAbordaje})` })
        .from(abordaje)
        .leftJoin(consultas, eq(abordaje.codigoAbordaje, consultas.codigoAbordaje))
        .where(and(
            whereCondition,
            or(
                inArray(abordaje.estado, ['Finalizado', 'En Curso', 'Completado']),
                sql`${consultas.codigoConsulta} IS NOT NULL`
            )
        ));

    // 3. Medicamentos Entregados (using entregasMedicamentos instead of medicamentosPacientes)
    // Dynamic import to avoid circular dependencies if any, but we can just import entregasMedicamentos at the top
    const { entregasMedicamentos } = await import('@/db/schema/entregas_medicamentos');
    const totalMedicamentosQuery = await db.select({ sum: sum(entregasMedicamentos.cantidad) })
        .from(entregasMedicamentos)
        .innerJoin(abordaje, eq(entregasMedicamentos.codigoAbordaje, abordaje.codigoAbordaje))
        .where(and(whereCondition, eq(entregasMedicamentos.estado, 'entregado')));

    // 5. Evolución (Group by Month)
    const evolutionQuery = await db.select({
        mes: sql<string>`DATE_FORMAT(${abordaje.fechaAbordaje}, '%Y-%m')`,
        cantidad: count(consultas.codigoConsulta),
    })
        .from(consultas)
        .innerJoin(abordaje, eq(consultas.codigoAbordaje, abordaje.codigoAbordaje))
        .where(whereCondition)
        .groupBy(sql`DATE_FORMAT(${abordaje.fechaAbordaje}, '%Y-%m')`)
        .orderBy(asc(sql`DATE_FORMAT(${abordaje.fechaAbordaje}, '%Y-%m')`));

    // 6. Distribución Geográfica
    const geoQuery = await db.select({
        comunidad: comunidades.nombreComunidad,
        pacientes: count(consultas.codigoConsulta),
    })
        .from(consultas)
        .innerJoin(abordaje, eq(consultas.codigoAbordaje, abordaje.codigoAbordaje))
        .innerJoin(comunidades, eq(abordaje.codigoComunidad, comunidades.codigoComunidad))
        .where(whereCondition)
        .groupBy(comunidades.nombreComunidad)
        .orderBy(desc(count(consultas.codigoConsulta)))
        .limit(5);

    const totalPacientes = totalPacientesQuery[0]?.count || 0;
    const totalAbordajes = Number(totalAbordajesQuery[0]?.count || 0);
    const totalMedicamentos = Number(totalMedicamentosQuery[0]?.sum || 0);
    const avgAtenciones = totalAbordajes > 0 ? totalPacientes / totalAbordajes : 0;

    return {
        kpis: {
            totalPacientes,
            totalAbordajes,
            totalMedicamentos,
            avgAtenciones,
        },
        evolution: evolutionQuery || [],
        geo: geoQuery || [],
    };
}

// --- 2. Epidemiological Profile ---

export async function getEpidemiologicalData(filters: DashboardFilters) {
    const whereCondition = getAbordajeConditions(filters);

    const [pathologyQuery, imcResult, pyramidResult, tensionResult] = await Promise.all([
        // 1. Top 10 Patologías
        db.select({
            enfermedad: enfermedades.nombreEnfermedad,
            cantidad: sql<number>`count(${consultasEnfermedades.codigoEnfermedad})`.as("cantidad"),
        })
            .from(consultasEnfermedades)
            .innerJoin(consultas, eq(consultasEnfermedades.codigoConsulta, consultas.codigoConsulta))
            .innerJoin(abordaje, eq(consultas.codigoAbordaje, abordaje.codigoAbordaje))
            .innerJoin(enfermedades, eq(consultasEnfermedades.codigoEnfermedad, enfermedades.codigoEnfermedad))
            .where(whereCondition)
            .groupBy(enfermedades.nombreEnfermedad)
            .orderBy(desc(sql`cantidad`))
            .limit(10),

        // 2. IMC
        db.select({
            bajo: sql<number>`SUM(CASE WHEN ${consultas.talla} > 0 AND (${consultas.peso} / (${consultas.talla} * ${consultas.talla})) < 18.5 THEN 1 ELSE 0 END)`,
            normal: sql<number>`SUM(CASE WHEN ${consultas.talla} > 0 AND (${consultas.peso} / (${consultas.talla} * ${consultas.talla})) >= 18.5 AND (${consultas.peso} / (${consultas.talla} * ${consultas.talla})) < 25 THEN 1 ELSE 0 END)`,
            sobrepeso: sql<number>`SUM(CASE WHEN ${consultas.talla} > 0 AND (${consultas.peso} / (${consultas.talla} * ${consultas.talla})) >= 25 AND (${consultas.peso} / (${consultas.talla} * ${consultas.talla})) < 30 THEN 1 ELSE 0 END)`,
            obesidad: sql<number>`SUM(CASE WHEN ${consultas.talla} > 0 AND (${consultas.peso} / (${consultas.talla} * ${consultas.talla})) >= 30 THEN 1 ELSE 0 END)`,
        })
            .from(consultas)
            .innerJoin(pacientes, eq(consultas.cedulaPaciente, pacientes.cedulaPaciente))
            .innerJoin(abordaje, eq(consultas.codigoAbordaje, abordaje.codigoAbordaje))
            .where(whereCondition),

        // 3. Population Pyramid
        db.select({
            ageGroup: sql<string>`CASE
                WHEN TIMESTAMPDIFF(YEAR, ${pacientes.fechaNacimiento}, CURDATE()) BETWEEN 0 AND 5 THEN '0-5'
                WHEN TIMESTAMPDIFF(YEAR, ${pacientes.fechaNacimiento}, CURDATE()) BETWEEN 6 AND 12 THEN '6-12'
                WHEN TIMESTAMPDIFF(YEAR, ${pacientes.fechaNacimiento}, CURDATE()) BETWEEN 13 AND 17 THEN '13-17'
                WHEN TIMESTAMPDIFF(YEAR, ${pacientes.fechaNacimiento}, CURDATE()) BETWEEN 18 AND 30 THEN '18-30'
                WHEN TIMESTAMPDIFF(YEAR, ${pacientes.fechaNacimiento}, CURDATE()) BETWEEN 31 AND 50 THEN '31-50'
                WHEN TIMESTAMPDIFF(YEAR, ${pacientes.fechaNacimiento}, CURDATE()) BETWEEN 51 AND 65 THEN '51-65'
                ELSE '>65'
            END`,
            sexo: pacientes.sexo,
            cantidad: count(),
        })
            .from(pacientes)
            .innerJoin(consultas, eq(pacientes.cedulaPaciente, consultas.cedulaPaciente))
            .innerJoin(abordaje, eq(consultas.codigoAbordaje, abordaje.codigoAbordaje))
            .where(whereCondition)
            .groupBy(sql`1`, pacientes.sexo),

        // 4. Hypertension
        db.select({
            totalMedidos: sql<number>`SUM(CASE WHEN ${consultas.tensionArterial} IS NOT NULL AND ${consultas.tensionArterial} LIKE '%/%' THEN 1 ELSE 0 END)`,
            hipertensos: sql<number>`SUM(CASE WHEN ${consultas.tensionArterial} IS NOT NULL AND ${consultas.tensionArterial} LIKE '%/%'
                AND (CAST(SUBSTRING_INDEX(${consultas.tensionArterial}, '/', 1) AS UNSIGNED) >= 140
                  OR CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(${consultas.tensionArterial}, '/', -1), ' ', 1) AS UNSIGNED) >= 90)
                THEN 1 ELSE 0 END)`,
        })
            .from(consultas)
            .innerJoin(abordaje, eq(consultas.codigoAbordaje, abordaje.codigoAbordaje))
            .where(whereCondition)
    ]);

    const bajo = Number(imcResult[0]?.bajo || 0);
    const normal = Number(imcResult[0]?.normal || 0);
    const sobrepeso = Number(imcResult[0]?.sobrepeso || 0);
    const obesidad = Number(imcResult[0]?.obesidad || 0);

    // Transform SQL result into the expected pyramid format
    const rangeConfigs = [
        { label: '0-5', min: 0, max: 5 },
        { label: '6-12', min: 6, max: 12 },
        { label: '13-17', min: 13, max: 17 },
        { label: '18-30', min: 18, max: 30 },
        { label: '31-50', min: 31, max: 50 },
        { label: '51-65', min: 51, max: 65 },
        { label: '>65', min: 66, max: 150 },
    ];
    const pyramid = rangeConfigs.map(r => ({ ...r, M: 0, F: 0 }));

    pyramidResult.forEach(row => {
        const range = pyramid.find(r => r.label === row.ageGroup);
        if (range) {
            if (row.sexo === 'M') range.M = row.cantidad;
            else range.F = row.cantidad;
        }
    });

    const totalMedidos = Number(tensionResult[0]?.totalMedidos || 0);
    const hipertensos = Number(tensionResult[0]?.hipertensos || 0);

    return {
        pathologies: pathologyQuery,
        imc: { bajo, normal, sobrepeso, obesidad },
        pyramid,
        hypertension: {
            hipertensos,
            sanos: totalMedidos - hipertensos,
            total: totalMedidos
        }
    };
}

// --- 3. Pharmacy ---

export async function getPharmacyData(filters: DashboardFilters) {
    const whereCondition = getAbordajeConditions(filters);

    const { entregasMedicamentos } = await import('@/db/schema/entregas_medicamentos');

    // 1. Top Meds
    const topMeds = await db.select({
        nombre: medicamentos.nombreMedicamento,
        cantidad: sum(entregasMedicamentos.cantidad)
    })
        .from(entregasMedicamentos)
        .innerJoin(medicamentos, eq(entregasMedicamentos.codigoMedicamento, medicamentos.codigoMedicamento))
        .innerJoin(abordaje, eq(entregasMedicamentos.codigoAbordaje, abordaje.codigoAbordaje))
        .where(and(whereCondition, eq(entregasMedicamentos.estado, 'entregado')))
        .groupBy(medicamentos.nombreMedicamento)
        .orderBy(desc(sum(entregasMedicamentos.cantidad)))
        .limit(10);

    // 2. Low Stock
    const lowStock = await db.select({
        codigoMedicamento: medicamentos.codigoMedicamento,
        nombreMedicamento: medicamentos.nombreMedicamento,
        presentacion: medicamentos.presentacion,
        existencia: medicamentos.existencia
    })
        .from(medicamentos)
        .where(lte(medicamentos.existencia, 15))
        .limit(20);

    // 3. Consumption by Age Group
    const consumptionResult = await db.select({
        ninos: sql<number>`SUM(CASE WHEN TIMESTAMPDIFF(YEAR, ${pacientes.fechaNacimiento}, CURDATE()) <= 12 THEN ${entregasMedicamentos.cantidad} ELSE 0 END)`,
        adultos: sql<number>`SUM(CASE WHEN TIMESTAMPDIFF(YEAR, ${pacientes.fechaNacimiento}, CURDATE()) BETWEEN 13 AND 59 THEN ${entregasMedicamentos.cantidad} ELSE 0 END)`,
        mayores: sql<number>`SUM(CASE WHEN TIMESTAMPDIFF(YEAR, ${pacientes.fechaNacimiento}, CURDATE()) >= 60 THEN ${entregasMedicamentos.cantidad} ELSE 0 END)`,
    })
        .from(entregasMedicamentos)
        .innerJoin(pacientes, eq(entregasMedicamentos.codigoPaciente, pacientes.cedulaPaciente))
        .innerJoin(abordaje, eq(entregasMedicamentos.codigoAbordaje, abordaje.codigoAbordaje))
        .where(and(whereCondition, eq(entregasMedicamentos.estado, 'entregado')));

    return {
        topMeds,
        lowStock,
        consumptionByAge: [
            { name: 'Niños (0-12)', value: Number(consumptionResult[0]?.ninos || 0) },
            { name: 'Adultos (13-59)', value: Number(consumptionResult[0]?.adultos || 0) },
            { name: 'Adultos Mayores (60+)', value: Number(consumptionResult[0]?.mayores || 0) },
        ]
    };
}

// --- 4. Operations ---

export async function getOperationsData(filters: DashboardFilters) {
    const whereCondition = getAbordajeConditions(filters);

    const [efficiencyData, typesData, specialtiesData] = await Promise.all([
        // 1. Efficiency
        db.select({
            codigo: abordaje.codigoAbordaje,
            estimados: abordaje.participantesEstimados,
            reales: count(consultas.codigoConsulta)
        })
            .from(abordaje)
            .leftJoin(consultas, eq(abordaje.codigoAbordaje, consultas.codigoAbordaje))
            .where(whereCondition)
            .groupBy(abordaje.codigoAbordaje, abordaje.participantesEstimados)
            .limit(10),

        // 2. Approach Types
        db.select({
            tipo: abordaje.tipoAbordaje,
            cantidad: count()
        })
            .from(abordaje)
            .where(whereCondition)
            .groupBy(abordaje.tipoAbordaje),

        // 3. Specialties
        db.select({
            especialidad: especialidades.nombreEspecialidad,
            cantidad: count(consultas.codigoConsulta)
        })
            .from(consultas)
            .innerJoin(medicos, eq(consultas.cedulaMedico, medicos.cedulaTejedor))
            .innerJoin(especialidades, eq(medicos.codigoEspecialidad, especialidades.codigoEspecialidad))
            .innerJoin(abordaje, eq(consultas.codigoAbordaje, abordaje.codigoAbordaje))
            .where(whereCondition)
            .groupBy(especialidades.nombreEspecialidad)
            .orderBy(desc(count(consultas.codigoConsulta)))
    ]);

    return {
        efficiency: efficiencyData.map(e => ({
            name: e.codigo,
            Estimados: e.estimados || 0,
            Reales: e.reales
        })),
        types: typesData.map(t => ({
            tipo: t.tipo || 'General',
            cantidad: t.cantidad
        })),
        specialties: specialtiesData.map(s => ({
            subject: s.especialidad,
            value: s.cantidad
        }))
    };
}

// NX-04: Cache comunidades filter for 5 minutes
export const getDashboardFilters = unstable_cache(
    async () => {
        return await db.select({
            codigoComunidad: comunidades.codigoComunidad,
            nombreComunidad: comunidades.nombreComunidad
        }).from(comunidades);
    },
    ['dashboard-filters'],
    {
        revalidate: 300,
        tags: ['comunidades'] // Add tag for on-demand invalidation
    }
);
