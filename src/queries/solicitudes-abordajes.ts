"use server";


import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { solicitudesAbordajes, comunidades, abordaje, type NewSolicitudAbordaje, type SolicitudAbordaje } from '@/db/schema';
import { AbordajesService } from '@/services/abordajes-service';
import { eq, and, desc } from 'drizzle-orm';
import { getErrorMessage } from '@/lib/error-handler';
import { getNextCode } from '@/lib/id-generator';
import { requireAuth } from '@/lib/auth';

/**
 * Obtener todas las solicitudes de abordajes con información de comunidades
 */
export async function getSolicitudesAbordajes() {
    try {
        await requireAuth();
        const result = await db.select({
            solicitud: solicitudesAbordajes,
            comunidad: comunidades,
        })
            .from(solicitudesAbordajes)
            .leftJoin(comunidades, eq(solicitudesAbordajes.codigoComunidad, comunidades.codigoComunidad))
            .orderBy(desc(solicitudesAbordajes.fechaSolicitud));

        // Transformar data para el cliente
        const data = result.map(({ solicitud, comunidad }) => ({
            ...solicitud,
            comunidad,
        }));

        return { success: true, data };
    } catch (error) {
        console.error('Error fetching solicitudes abordajes:', error);
        return { success: false, error: 'Error al obtener las solicitudes de abordajes' };
    }
}

/**
 * Obtener comunidades para el selector de solicitudes
 */
export async function getComunidadesParaSolicitud() {
    try {
        await requireAuth();
        const data = await db.select()
            .from(comunidades)
            .orderBy(comunidades.nombreComunidad);

        return { success: true, data };
    } catch (error) {
        console.error('Error fetching comunidades:', error);
        return { success: false, error: 'Error al obtener las comunidades' };
    }
}

/**
 * Confirmar solicitud y crear abordaje
 */

/**
 * Rechazar solicitud
 */

/**
 * Toggle check de logística
 */
