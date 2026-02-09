'use server'

import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { solicitudesAbordajes, comunidades, abordaje, type NewSolicitudAbordaje, type SolicitudAbordaje } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

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

        // Generar código único
        const count = await db.select({ count: solicitudesAbordajes.id })
            .from(solicitudesAbordajes);
        const nextId = (count.length || 0) + 1;
        const codigoSolicitud = `SAB-${String(nextId).padStart(3, '0')}`;

        const solicitudData = {
            ...data,
            codigoSolicitud,
            fechaSolicitud: new Date(), // Asegurar que se establezca la fecha
        };

        console.log('Datos a insertar:', solicitudData);
        await db.insert(solicitudesAbordajes).values(solicitudData);
        revalidatePath('/abordajes/solicitudes-abordajes');
        return { success: true, message: 'Solicitud de abordaje creada correctamente' };
    } catch (error) {
        console.error('Error creating solicitud abordaje:', error);
        return { success: false, error: 'Error al crear la solicitud de abordaje' };
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

        // Crear el abordaje real
        const count = await db.select({ count: abordaje.codigoAbordaje })
            .from(abordaje);
        const nextId = (count.length || 0) + 1;
        const codigoAbordaje = `ABD-${String(nextId).padStart(3, '0')}`;

        const abordajeData = {
            codigoAbordaje,
            codigoComunidad: solicitud[0].codigoComunidad,
            fechaAbordaje: new Date(solicitud[0].fechaSugerida),
            horaInicio: solicitud[0].horaInicioSugerida,
            horaFin: solicitud[0].horaInicioSugerida, // Usar la misma hora de inicio
            descripcion: solicitud[0].descripcionActividad,
            estado: 'Pendiente',
        };

        await db.insert(abordaje).values(abordajeData);

        revalidatePath('/abordajes/solicitudes-abordajes');
        revalidatePath('/abordajes');
        return { success: true, message: 'Solicitud confirmada correctamente' };
    } catch (error) {
        console.error('Error confirming solicitud abordaje:', error);
        return { success: false, error: 'Error al confirmar la solicitud' };
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
        console.error('Error rejecting solicitud abordaje:', error);
        return { success: false, error: 'Error al rechazar la solicitud' };
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
        console.error('Error deleting solicitud abordaje:', error);
        return { success: false, error: 'Error al eliminar la solicitud' };
    }
}
