'use server';

import { db } from '@/db';
import {
    abordaje,
    pacientes,
    medicamentosPacientes,
    consultas,
    consultasEnfermedades,
    medicamentos,
    comunidades,
    antecedentes,
    enfermedades,
} from '@/db/schema';
import { eq, and, gte, lte, sql, desc, count, sum, avg, asc, not } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';

// --- Shared Types ---
export type DashboardFilters = {
    fechaInicio?: string;
    fechaFin?: string;
    comunidad?: string;
};

// --- Helper for Date Filters ---
function getBaseFilters(filters: DashboardFilters, dateField: any, communityField: any) {
    const conditions = [];

    if (filters.fechaInicio) {
        conditions.push(gte(dateField, new Date(filters.fechaInicio)));
    }
    if (filters.fechaFin) {
        conditions.push(lte(dateField, new Date(filters.fechaFin)));
    }
    if (filters.comunidad && filters.comunidad !== 'todas') {
        conditions.push(eq(communityField, filters.comunidad));
    }

    return conditions.length > 0 ? and(...conditions) : undefined;
}

// --- 1. Executive Summary (KPIs) ---

export async function getExecutiveKPIs(filters: DashboardFilters) {
    const pacientesConditions = [];
    if (filters.fechaInicio) pacientesConditions.push(gte(abordaje.fechaAbordaje, new Date(filters.fechaInicio)));
    if (filters.fechaFin) pacientesConditions.push(lte(abordaje.fechaAbordaje, new Date(filters.fechaFin)));
    if (filters.comunidad && filters.comunidad !== 'todas') pacientesConditions.push(eq(abordaje.codigoComunidad, filters.comunidad));

    const totalPacientesQuery = await db
        .select({ count: count(consultas.cedulaPaciente) })
        .from(consultas)
        .leftJoin(abordaje, eq(consultas.codigoAbordaje, abordaje.codigoAbordaje))
        .where(pacientesConditions.length > 0 ? and(...pacientesConditions) : undefined);

    const totalPacientes = totalPacientesQuery[0]?.count || 0;


    // 2. Total Abordajes Realizados (status = 'Ejecutado')
    const abordajeConditions = [eq(abordaje.estado, 'Ejecutado')];
    if (filters.fechaInicio) abordajeConditions.push(gte(abordaje.fechaAbordaje, new Date(filters.fechaInicio)));
    if (filters.fechaFin) abordajeConditions.push(lte(abordaje.fechaAbordaje, new Date(filters.fechaFin)));
    if (filters.comunidad && filters.comunidad !== 'todas') abordajeConditions.push(eq(abordaje.codigoComunidad, filters.comunidad));

    const totalAbordajesQuery = await db
        .select({ count: count() })
        .from(abordaje)
        .where(and(...abordajeConditions));

    const totalAbordajes = totalAbordajesQuery[0]?.count || 0;

    // 3. Medicamentos Entregados
    const medsWhere = [];
    if (filters.fechaInicio) medsWhere.push(gte(abordaje.fechaAbordaje, new Date(filters.fechaInicio)));
    if (filters.fechaFin) medsWhere.push(lte(abordaje.fechaAbordaje, new Date(filters.fechaFin)));
    if (filters.comunidad && filters.comunidad !== 'todas') medsWhere.push(eq(abordaje.codigoComunidad, filters.comunidad));

    const totalMedicamentosQuery = await db
        .select({ sum: sum(medicamentosPacientes.cantidadEntregada) })
        .from(medicamentosPacientes)
        .leftJoin(abordaje, eq(medicamentosPacientes.codigoAbordaje, abordaje.codigoAbordaje))
        .where(medsWhere.length > 0 ? and(...medsWhere) : undefined);

    const totalMedicamentos = Number(totalMedicamentosQuery[0]?.sum || 0);

    // 4. Promedio Atenciones por Jornada
    const avgAtenciones = totalAbordajes > 0 ? Math.round(totalPacientes / totalAbordajes) : 0;

    // 5. Evolución de Atenciones (Group by Month)
    const evolutionWrap = sql`DATE_FORMAT(${abordaje.fechaAbordaje}, '%Y-%m')`;

    const evolutionQuery = await db
        .select({
            mes: evolutionWrap,
            cantidad: count(consultas.codigoConsulta),
        })
        .from(consultas)
        .leftJoin(abordaje, eq(consultas.codigoAbordaje, abordaje.codigoAbordaje))
        .where(pacientesConditions.length > 0 ? and(...pacientesConditions) : undefined)
        .groupBy(evolutionWrap)
        .orderBy(asc(evolutionWrap));

    // 6. Distribución Geográfica (Top 5 Comunidades)
    const geoQuery = await db
        .select({
            comunidad: comunidades.nombreComunidad,
            pacientes: count(consultas.codigoConsulta),
        })
        .from(consultas)
        .leftJoin(abordaje, eq(consultas.codigoAbordaje, abordaje.codigoAbordaje))
        .leftJoin(comunidades, eq(abordaje.codigoComunidad, comunidades.codigoComunidad))
        .where(pacientesConditions.length > 0 ? and(...pacientesConditions) : undefined)
        .groupBy(comunidades.nombreComunidad)
        .orderBy(desc(count(consultas.codigoConsulta)))
        .limit(5);

    return {
        kpis: {
            totalPacientes,
            totalAbordajes,
            totalMedicamentos,
            avgAtenciones,
        },
        evolution: evolutionQuery,
        geo: geoQuery,
    };
}

// --- 2. Epidemiological Profile ---

export async function getEpidemiologicalData(filters: DashboardFilters) {
    const baseConditions = [];
    if (filters.fechaInicio) baseConditions.push(gte(abordaje.fechaAbordaje, new Date(filters.fechaInicio)));
    if (filters.fechaFin) baseConditions.push(lte(abordaje.fechaAbordaje, new Date(filters.fechaFin)));
    if (filters.comunidad && filters.comunidad !== 'todas') baseConditions.push(eq(abordaje.codigoComunidad, filters.comunidad));

    // 1. Top 10 Patologías
    const pathologyQuery = await db
        .select({
            enfermedad: enfermedades.nombreEnfermedad,
            cantidad: count(consultasEnfermedades.codigoEnfermedad),
        })
        .from(consultasEnfermedades)
        .leftJoin(consultas, eq(consultasEnfermedades.codigoConsulta, consultas.codigoConsulta))
        .leftJoin(abordaje, eq(consultas.codigoAbordaje, abordaje.codigoAbordaje))
        .leftJoin(enfermedades, eq(consultasEnfermedades.codigoEnfermedad, enfermedades.codigoEnfermedad))
        .where(baseConditions.length > 0 ? and(...baseConditions) : undefined)
        .groupBy(enfermedades.nombreEnfermedad)
        .orderBy(desc(count(consultasEnfermedades.codigoEnfermedad)))
        .limit(10);

    // DB-03: 2. IMC — Calculate directly in SQL instead of fetching all rows
    const imcResult = await db
        .select({
            bajo: sql<number>`SUM(CASE WHEN ${antecedentes.talla} > 0 AND (${antecedentes.peso} / (${antecedentes.talla} * ${antecedentes.talla})) < 18.5 THEN 1 ELSE 0 END)`,
            normal: sql<number>`SUM(CASE WHEN ${antecedentes.talla} > 0 AND (${antecedentes.peso} / (${antecedentes.talla} * ${antecedentes.talla})) >= 18.5 AND (${antecedentes.peso} / (${antecedentes.talla} * ${antecedentes.talla})) < 25 THEN 1 ELSE 0 END)`,
            sobrepeso: sql<number>`SUM(CASE WHEN ${antecedentes.talla} > 0 AND (${antecedentes.peso} / (${antecedentes.talla} * ${antecedentes.talla})) >= 25 AND (${antecedentes.peso} / (${antecedentes.talla} * ${antecedentes.talla})) < 30 THEN 1 ELSE 0 END)`,
            obesidad: sql<number>`SUM(CASE WHEN ${antecedentes.talla} > 0 AND (${antecedentes.peso} / (${antecedentes.talla} * ${antecedentes.talla})) >= 30 THEN 1 ELSE 0 END)`,
        })
        .from(antecedentes)
        .innerJoin(pacientes, eq(antecedentes.cedulaPaciente, pacientes.cedulaPaciente))
        .innerJoin(consultas, eq(pacientes.cedulaPaciente, consultas.cedulaPaciente))
        .innerJoin(abordaje, eq(consultas.codigoAbordaje, abordaje.codigoAbordaje))
        .where(baseConditions.length > 0 ? and(...baseConditions) : undefined);

    const bajo = Number(imcResult[0]?.bajo || 0);
    const normal = Number(imcResult[0]?.normal || 0);
    const sobrepeso = Number(imcResult[0]?.sobrepeso || 0);
    const obesidad = Number(imcResult[0]?.obesidad || 0);

    // DB-03: 3. Population Pyramid — Aggregate by age range and sex in SQL
    const pyramidResult = await db
        .select({
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
        .where(baseConditions.length > 0 ? and(...baseConditions) : undefined)
        .groupBy(sql`1`, pacientes.sexo);

    // Transform SQL result into the expected pyramid format
    const rangeLabels = ['0-5', '6-12', '13-17', '18-30', '31-50', '51-65', '>65'];
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

    // DB-03: 4. Hypertension — Parse and aggregate in SQL
    const tensionResult = await db
        .select({
            totalMedidos: sql<number>`SUM(CASE WHEN ${consultas.tensionArterial} IS NOT NULL AND ${consultas.tensionArterial} LIKE '%/%' THEN 1 ELSE 0 END)`,
            hipertensos: sql<number>`SUM(CASE WHEN ${consultas.tensionArterial} IS NOT NULL AND ${consultas.tensionArterial} LIKE '%/%'
                AND (CAST(SUBSTRING_INDEX(${consultas.tensionArterial}, '/', 1) AS UNSIGNED) >= 140
                  OR CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(${consultas.tensionArterial}, '/', -1), ' ', 1) AS UNSIGNED) >= 90)
                THEN 1 ELSE 0 END)`,
        })
        .from(consultas)
        .innerJoin(abordaje, eq(consultas.codigoAbordaje, abordaje.codigoAbordaje))
        .where(baseConditions.length > 0 ? and(...baseConditions) : undefined);

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
    const baseConditions = [];
    if (filters.fechaInicio) baseConditions.push(gte(abordaje.fechaAbordaje, new Date(filters.fechaInicio)));
    if (filters.fechaFin) baseConditions.push(lte(abordaje.fechaAbordaje, new Date(filters.fechaFin)));
    if (filters.comunidad && filters.comunidad !== 'todas') baseConditions.push(eq(abordaje.codigoComunidad, filters.comunidad));

    // 1. Top Meds
    const topMeds = await db
        .select({
            nombre: medicamentos.nombreMedicamento,
            cantidad: sum(medicamentosPacientes.cantidadEntregada)
        })
        .from(medicamentosPacientes)
        .innerJoin(medicamentos, eq(medicamentosPacientes.codigoMedicamento, medicamentos.codigoMedicamento))
        .innerJoin(abordaje, eq(medicamentosPacientes.codigoAbordaje, abordaje.codigoAbordaje))
        .where(baseConditions.length > 0 ? and(...baseConditions) : undefined)
        .groupBy(medicamentos.nombreMedicamento)
        .orderBy(desc(sum(medicamentosPacientes.cantidadEntregada)))
        .limit(10);

    // 2. Low Stock
    const lowStock = await db
        .select()
        .from(medicamentos)
        .where(lte(medicamentos.existencia, 15))
        .limit(20);

    // DB-03: 3. Consumption by Age Group — Aggregate in SQL
    const consumptionResult = await db
        .select({
            ninos: sql<number>`SUM(CASE WHEN TIMESTAMPDIFF(YEAR, ${pacientes.fechaNacimiento}, CURDATE()) <= 12 THEN ${medicamentosPacientes.cantidadEntregada} ELSE 0 END)`,
            adultos: sql<number>`SUM(CASE WHEN TIMESTAMPDIFF(YEAR, ${pacientes.fechaNacimiento}, CURDATE()) BETWEEN 13 AND 59 THEN ${medicamentosPacientes.cantidadEntregada} ELSE 0 END)`,
            mayores: sql<number>`SUM(CASE WHEN TIMESTAMPDIFF(YEAR, ${pacientes.fechaNacimiento}, CURDATE()) >= 60 THEN ${medicamentosPacientes.cantidadEntregada} ELSE 0 END)`,
        })
        .from(medicamentosPacientes)
        .innerJoin(pacientes, eq(medicamentosPacientes.cedulaPaciente, pacientes.cedulaPaciente))
        .innerJoin(abordaje, eq(medicamentosPacientes.codigoAbordaje, abordaje.codigoAbordaje))
        .where(baseConditions.length > 0 ? and(...baseConditions) : undefined);

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
    const baseConditions = [];
    if (filters.fechaInicio) baseConditions.push(gte(abordaje.fechaAbordaje, new Date(filters.fechaInicio)));
    if (filters.fechaFin) baseConditions.push(lte(abordaje.fechaAbordaje, new Date(filters.fechaFin)));
    if (filters.comunidad && filters.comunidad !== 'todas') baseConditions.push(eq(abordaje.codigoComunidad, filters.comunidad));

    // 1. Efficiency (Estimados vs Reales)
    const efficiencyData = await db
        .select({
            codigo: abordaje.codigoAbordaje,
            estimados: abordaje.participantesEstimados,
            reales: count(consultas.codigoConsulta)
        })
        .from(abordaje)
        .leftJoin(consultas, eq(abordaje.codigoAbordaje, consultas.codigoAbordaje))
        .where(baseConditions.length > 0 ? and(...baseConditions) : undefined)
        .groupBy(abordaje.codigoAbordaje, abordaje.participantesEstimados)
        .limit(10);

    // 2. Approach Types
    const typesData = await db
        .select({
            tipo: abordaje.tipoAbordaje,
            cantidad: count()
        })
        .from(abordaje)
        .where(baseConditions.length > 0 ? and(...baseConditions) : undefined)
        .groupBy(abordaje.tipoAbordaje);

    // 3. Resources
    const resources = await db
        .select({
            transporte: sum(sql`CASE WHEN ${abordaje.transporte} = 1 THEN 1 ELSE 0 END`),
            refrigerios: sum(sql`CASE WHEN ${abordaje.refrigerios} = 1 THEN 1 ELSE 0 END`),
            espacio: sum(sql`CASE WHEN ${abordaje.espacioCubierto} = 1 THEN 1 ELSE 0 END`),
            total: count()
        })
        .from(abordaje)
        .where(baseConditions.length > 0 ? and(...baseConditions) : undefined);

    const res = resources[0];

    return {
        efficiency: efficiencyData.map(e => ({
            name: e.codigo,
            Estimados: e.estimados || 0,
            Reales: e.reales
        })),
        types: typesData,
        resources: [
            { subject: 'Transporte', A: Number(res?.transporte || 0), fullMark: Number(res?.total) },
            { subject: 'Refrigerios', A: Number(res?.refrigerios || 0), fullMark: Number(res?.total) },
            { subject: 'Espacio Cubierto', A: Number(res?.espacio || 0), fullMark: Number(res?.total) },
        ]
    };
}

// NX-04: Cache comunidades filter for 5 minutes — this data rarely changes
export const getDashboardFilters = unstable_cache(
    async () => {
        return await db.select().from(comunidades);
    },
    ['dashboard-filters'],
    { revalidate: 300 } // 5 minutes
);
