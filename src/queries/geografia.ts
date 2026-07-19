"use server";

import { db } from '@/db';
import { estados, municipios, parroquias } from '@/db/schema/geografia';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';

/**
 * Obtener todos los estados
 */
export async function getEstadosAction() {
    try {
        await requireAuth();
        const result = await db.select().from(estados).orderBy(estados.nombre);
        return { success: true, data: result };
    } catch (error) {
        console.error('Error fetching estados:', error);
        return { success: false, error: 'Error al obtener estados', data: [] };
    }
}

/**
 * Obtener los municipios de un estado
 */
export async function getMunicipiosByEstadoAction(estadoId: number) {
    try {
        await requireAuth();
        if (!estadoId) return { success: true, data: [] };
        const result = await db
            .select()
            .from(municipios)
            .where(eq(municipios.estadoId, estadoId))
            .orderBy(municipios.nombre);
        return { success: true, data: result };
    } catch (error) {
        console.error('Error fetching municipios:', error);
        return { success: false, error: 'Error al obtener municipios', data: [] };
    }
}

/**
 * Obtener las parroquias de un municipio
 */
export async function getParroquiasByMunicipioAction(municipioId: number) {
    try {
        await requireAuth();
        if (!municipioId) return { success: true, data: [] };
        const result = await db
            .select()
            .from(parroquias)
            .where(eq(parroquias.municipioId, municipioId))
            .orderBy(parroquias.nombre);
        return { success: true, data: result };
    } catch (error) {
        console.error('Error fetching parroquias:', error);
        return { success: false, error: 'Error al obtener parroquias', data: [] };
    }
}

/**
 * Helper to fetch a full location hierarchy by parroquiaId (for initial form state)
 */
export async function getLocationHierarchy(parroquiaId: number) {
    try {
        await requireAuth();
        if (!parroquiaId) return { success: true, data: null };
        const [parroquia] = await db.select().from(parroquias).where(eq(parroquias.id, parroquiaId));
        if (!parroquia) return { success: false, error: 'Parroquia no encontrada' };

        const [municipio] = await db.select().from(municipios).where(eq(municipios.id, parroquia.municipioId));
        if (!municipio) return { success: false, error: 'Municipio no encontrado' };

        return {
            success: true,
            data: {
                estadoId: municipio.estadoId,
                municipioId: municipio.id,
                parroquiaId: parroquia.id
            }
        };
    } catch (error) {
        console.error('Error fetching location hierarchy:', error);
        return { success: false, error: 'Error al obtener jerarquía' };
    }
}
