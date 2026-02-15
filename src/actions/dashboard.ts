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
    // 1. Total Pacientes Atendidos (Count distinct patients in consultations within range)
    // Connecting patients -> consultations -> abordaje (for date filtering)
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
    const medsConditions = [];
    if (filters.fechaInicio) medsConditions.push(gte(medicamentosPacientes.fechaEntrega, new Date(filters.fechaInicio)));
    if (filters.fechaFin) medsConditions.push(lte(medicamentosPacientes.fechaEntrega, new Date(filters.fechaFin)));
    // Note: medicamentos_pacientes doesn't have community directly, need to join via abordaje or patient
    // Joining via Abordaje is safer for "Jornadas" context
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
    // Defines format: 'YYYY-MM'
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
    const baseConditions = []; // Conditions for consultations
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

    // 2. IMC (Estado Nutricional)
    // Need to fetch individual records and calculate in TS, or use complex SQL
    // Fetching distinct patients with weight/height
    const imcConditions = [];
    // Join path: antecedentes -> pacientes. Need to filter by abordaje date? 
    // Antecedentes are historical, maybe just take latest?
    // For simplicity and "Jornada" context: usually antecedents are taken during the checkup.
    // We will query all antecedents related to patients seen in the filtered period.
    const imcData = await db
        .select({
            peso: antecedentes.peso,
            talla: antecedentes.talla,
        })
        .from(antecedentes)
        .leftJoin(pacientes, eq(antecedentes.cedulaPaciente, pacientes.cedulaPaciente))
        // Filtering by patients seen in the period might be complex without a direct link antecedent -> abordaje.
        // Assumption: Antecedent update happens around the consultation. 
        // Better approach: Join antecedent -> patient -> consultation -> abordaje
        // This is heavy. Let's simplify: Get all current antecedents for patients who had a consultation in the period.
        .innerJoin(consultas, eq(pacientes.cedulaPaciente, consultas.cedulaPaciente)) // Ensure they were seen
        .innerJoin(abordaje, eq(consultas.codigoAbordaje, abordaje.codigoAbordaje))
        .where(baseConditions.length > 0 ? and(...baseConditions) : undefined);

    let bajo = 0, normal = 0, sobrepeso = 0, obesidad = 0;

    imcData.forEach(r => {
        const p = Number(r.peso);
        const t = Number(r.talla);
        if (t > 0) {
            const imc = p / (t * t);
            if (imc < 18.5) bajo++;
            else if (imc < 25) normal++;
            else if (imc < 30) sobrepeso++;
            else obesidad++;
        }
    });

    // 3. Population Pyramid
    // Need age and sex from patients seen in the period
    const pyramidData = await db
        .select({
            fechaNacimiento: pacientes.fechaNacimiento,
            sexo: pacientes.sexo
        })
        .from(pacientes)
        .innerJoin(consultas, eq(pacientes.cedulaPaciente, consultas.cedulaPaciente))
        .innerJoin(abordaje, eq(consultas.codigoAbordaje, abordaje.codigoAbordaje))
        .where(baseConditions.length > 0 ? and(...baseConditions) : undefined);

    const ranges = [
        { label: '0-5', min: 0, max: 5 },
        { label: '6-12', min: 6, max: 12 },
        { label: '13-17', min: 13, max: 17 },
        { label: '18-30', min: 18, max: 30 },
        { label: '31-50', min: 31, max: 50 },
        { label: '51-65', min: 51, max: 65 },
        { label: '>65', min: 66, max: 150 },
    ];

    const pyramid = ranges.map(r => ({ ...r, M: 0, F: 0 }));

    const now = new Date();
    pyramidData.forEach(p => {
        const age = now.getFullYear() - p.fechaNacimiento.getFullYear();
        const range = pyramid.find(r => age >= r.min && age <= r.max);
        if (range) {
            if (p.sexo === 'M') range.M++;
            else range.F++;
        }
    });

    // 4. Hypertension
    // Check consultas.tensionArterial
    const tensionData = await db
        .select({ ta: consultas.tensionArterial })
        .from(consultas)
        .innerJoin(abordaje, eq(consultas.codigoAbordaje, abordaje.codigoAbordaje))
        .where(baseConditions.length > 0 ? and(...baseConditions) : undefined);

    let hipertensos = 0;
    let totalMedidos = 0;

    tensionData.forEach(d => {
        if (d.ta && d.ta.includes('/')) {
            totalMedidos++;
            const [sys, dia] = d.ta.split('/').map(Number);
            if (sys >= 140 || dia >= 90) hipertensos++;
        }
    });

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

    // 3. Consumption by Age Group
    // Needed: Join meds_pat -> pacientes -> calculate age
    const consumptionData = await db
        .select({
            fechaNacimiento: pacientes.fechaNacimiento,
            cantidad: medicamentosPacientes.cantidadEntregada
        })
        .from(medicamentosPacientes)
        .innerJoin(pacientes, eq(medicamentosPacientes.cedulaPaciente, pacientes.cedulaPaciente))
        .innerJoin(abordaje, eq(medicamentosPacientes.codigoAbordaje, abordaje.codigoAbordaje))
        .where(baseConditions.length > 0 ? and(...baseConditions) : undefined);

    const ageGroups = { '0-12': 0, '13-59': 0, '60+': 0 };
    const now = new Date();

    consumptionData.forEach(d => {
        const age = now.getFullYear() - d.fechaNacimiento.getFullYear();
        const qty = Number(d.cantidad);
        if (age <= 12) ageGroups['0-12'] += qty;
        else if (age <= 59) ageGroups['13-59'] += qty;
        else ageGroups['60+'] += qty;
    });

    return {
        topMeds,
        lowStock,
        consumptionByAge: [
            { name: 'Niños (0-12)', value: ageGroups['0-12'] },
            { name: 'Adultos (13-59)', value: ageGroups['13-59'] },
            { name: 'Adultos Mayores (60+)', value: ageGroups['60+'] },
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
    // List all abordajes in period with their counts
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
        .limit(10); // Show top 10 most recent?

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

export async function getDashboardFilters() {
    return await db.select().from(comunidades);
}
