'use server';

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


// --- 2. Epidemiological Profile ---


// --- 3. Pharmacy ---


// --- 4. Operations ---


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
