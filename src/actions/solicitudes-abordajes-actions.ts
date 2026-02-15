'use server'

import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { solicitudesAbordajes, comunidades, abordaje, type NewSolicitudAbordaje, type SolicitudAbordaje } from '@/db/schema';
import { AbordajesService } from '@/services/abordajes-service';
import { eq, and, desc } from 'drizzle-orm';
import { getErrorMessage } from '@/lib/error-handler';
import { getNextCode } from '@/lib/id-generator';

/**
 * Obtener todas las solicitudes de abordajes con información de comunidades
 */
export async function getSolicitudesAbordajes() {
    try {
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
 * Obtener comunidades con su logística para el selector
 */
export async function getComunidadesConLogistica() {
    try {
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
 * Calcular puntuación de logística de una comunidad
 */
function calcularPuntuacionLogistica(comunidad: any): number {
    let puntuacion = 0;

    // Ponderación de recursos logísticos
    if (comunidad.tieneTransporte) puntuacion += 3;
    if (comunidad.tieneRefrigerios) puntuacion += 2;
    if (comunidad.tieneAgua) puntuacion += 2;
    if (comunidad.tieneEspacioCubierto) puntuacion += 1;
    if (comunidad.tieneMaterialEducativo) puntuacion += 1;

    return puntuacion;
}

/**
 * Obtener comunidades ordenadas por logística (prioridad)
 */
export async function getComunidadesPorPrioridadLogistica() {
    try {
        const comunidadesData = await db.select()
            .from(comunidades)
            .orderBy(comunidades.nombreComunidad);

        // Calcular puntuación y ordenar
        const comunidadesConPuntuacion = comunidadesData.map(comunidad => ({
            ...comunidad,
            puntuacionLogistica: calcularPuntuacionLogistica(comunidad),
        }));

        // Ordenar por puntuación descendente
        comunidadesConPuntuacion.sort((a, b) => b.puntuacionLogistica - a.puntuacionLogistica);

        return { success: true, data: comunidadesConPuntuacion };
    } catch (error) {
        console.error('Error fetching comunidades por prioridad:', error);
        return { success: false, error: 'Error al obtener las comunidades por prioridad' };
    }
}

/**
 * Crear una nueva solicitud de abordaje
 */
export async function createSolicitudAbordaje(data: NewSolicitudAbordaje) {
    try {
        // Validar datos requeridos
        if (!data.codigoComunidad) {
            return { success: false, error: 'La comunidad es requerida' };
        }
        if (!data.fechaSugerida) {
            return { success: false, error: 'La fecha sugerida es requerida' };
        }
        if (!data.horaInicioSugerida) {
            return { success: false, error: 'La hora de inicio es requerida' };
        }
        if (!data.descripcionActividad) {
            return { success: false, error: 'La descripción de la actividad es requerida' };
        }
        if (!data.tipoAbordaje) {
            return { success: false, error: 'El tipo de abordaje es requerido' };
        }
        if (!data.participantesEstimados || data.participantesEstimados < 1) {
            return { success: false, error: 'El número de participantes debe ser mayor a 0' };
        }

        // Generación automática del código de solicitud (SAB-001...)
        const newCode = await getNextCode(solicitudesAbordajes, solicitudesAbordajes.codigoSolicitud, 'SAB-');

        const solicitudData = {
            ...data,
            codigoSolicitud: newCode,
            fechaSolicitud: new Date(),
        };

        await db.insert(solicitudesAbordajes).values(solicitudData);
        revalidatePath('/abordajes/solicitudes-abordajes');
        return { success: true, message: `Solicitud de abordaje creada correctamente con código ${newCode}` };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'la solicitud de abordaje', 'crear');
        return { success: false, error: errorMessage };
    }
}

/**
 * Confirmar solicitud y crear abordaje
 */
export async function confirmarSolicitudAbordaje(id: number) {
    try {
        // Obtener la solicitud
        const solicitud = await db.select()
            .from(solicitudesAbordajes)
            .where(eq(solicitudesAbordajes.id, id))
            .limit(1);

        if (!solicitud[0]) {
            return { success: false, error: 'Solicitud no encontrada' };
        }

        // Actualizar estado a confirmado
        await db.update(solicitudesAbordajes)
            .set({ estado: 'confirmado' })
            .where(eq(solicitudesAbordajes.id, id));

        // Generación automática del código de abordaje (ABD-001...)
        const codigoAbordaje = await getNextCode(abordaje, abordaje.codigoAbordaje, 'ABD-');

        const abordajeData = {
            codigoAbordaje,
            codigoComunidad: solicitud[0].codigoComunidad,
            codigoSolicitud: solicitud[0].codigoSolicitud,
            fechaAbordaje: new Date(solicitud[0].fechaSugerida),
            horaInicio: solicitud[0].horaInicioSugerida,
            horaFin: solicitud[0].horaInicioSugerida, // Usar la misma hora de inicio
            descripcion: solicitud[0].descripcionActividad,
            tipoAbordaje: solicitud[0].tipoAbordaje,
            participantesEstimados: solicitud[0].participantesEstimados,
            recursosAdicionales: solicitud[0].recursosAdicionales,
            transporte: solicitud[0].transporte,
            refrigerios: solicitud[0].refrigerios,
            espacioCubierto: solicitud[0].espacioCubierto,
            notasLogistica: solicitud[0].notasLogistica,
            notas: solicitud[0].notas,
            estado: 'Pendiente',
        };

        await AbordajesService.create(abordajeData);

        revalidatePath('/abordajes/solicitudes-abordajes');
        revalidatePath('/abordajes');
        return { success: true, message: `Solicitud confirmada correctamente. Nuevo abordaje: ${codigoAbordaje}` };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'el abordaje', 'confirmar');
        return { success: false, error: errorMessage };
    }
}

/**
 * Rechazar solicitud
 */
export async function rechazarSolicitudAbordaje(id: number, motivo?: string) {
    try {
        await db.update(solicitudesAbordajes)
            .set({
                estado: 'rechazado',
                notas: motivo || null
            })
            .where(eq(solicitudesAbordajes.id, id));

        revalidatePath('/abordajes/solicitudes-abordajes');
        return { success: true, message: 'Solicitud rechazada correctamente' };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'la solicitud de abordaje', 'rechazar');
        return { success: false, error: errorMessage };
    }
}

/**
 * Eliminar solicitud
 */
export async function deleteSolicitudAbordaje(id: number) {
    try {
        await db.delete(solicitudesAbordajes)
            .where(eq(solicitudesAbordajes.id, id));

        revalidatePath('/abordajes/solicitudes-abordajes');
        return { success: true, message: 'Solicitud eliminada correctamente' };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'la solicitud de abordaje', 'eliminar');
        return { success: false, error: errorMessage };
    }
}
