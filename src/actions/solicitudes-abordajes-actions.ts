'use server'

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

/**
 * Obtener comunidades para el selector de solicitudes
 */

/**
 * Crear una nueva solicitud de abordaje
 */
export async function createSolicitudAbordaje(data: NewSolicitudAbordaje) {
    try {
        await requireAuth();
        // Validar datos requeridos
        if (!data.codigoComunidad && !data.comunidadSugerida) {
            return { success: false, error: 'Debe especificar una comunidad (existente o sugerida)' };
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
        await requireAuth();
        // Obtener la solicitud
        const solicitud = await db.select()
            .from(solicitudesAbordajes)
            .where(eq(solicitudesAbordajes.id, id))
            .limit(1);

        if (!solicitud[0]) {
            return { success: false, error: 'Solicitud no encontrada' };
        }
        
        if (!solicitud[0].codigoComunidad) {
            return { success: false, error: 'No se puede confirmar la solicitud porque no tiene una comunidad asignada. Registre la comunidad sugerida y edite la solicitud primero.' };
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
        await requireAuth();
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
        await requireAuth();
        await db.delete(solicitudesAbordajes)
            .where(eq(solicitudesAbordajes.id, id));

        revalidatePath('/abordajes/solicitudes-abordajes');
        return { success: true, message: 'Solicitud eliminada correctamente' };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'la solicitud de abordaje', 'eliminar');
        return { success: false, error: errorMessage };
    }
}

/**
 * Toggle check de logística
 */
export async function toggleLogisticaCheck(id: number, campo: 'logisticaLugar' | 'logisticaPersonal' | 'logisticaRefrigerios' | 'logisticaTransporte', valor: boolean) {
    try {
        await requireAuth();

        // Actualizar el valor del check logistico específico
        await db.update(solicitudesAbordajes)
            .set({ [campo]: valor })
            .where(eq(solicitudesAbordajes.id, id));

        // Obtener la solicitud actualizada para validar autoconfirmación
        const solicitudActualizada = await db.select()
            .from(solicitudesAbordajes)
            .where(eq(solicitudesAbordajes.id, id))
            .limit(1);

        if (solicitudActualizada[0]) {
            const sol = solicitudActualizada[0];
            // Autoconfirmación: Si los 4 checks están `true` y aún está `pendiente` u otro case
            if (sol.logisticaLugar && sol.logisticaPersonal && sol.logisticaRefrigerios && sol.logisticaTransporte && sol.estado.toLowerCase() === 'pendiente') {
                const confRes = await confirmarSolicitudAbordaje(id);
                if (!confRes.success) {
                    return { success: false, error: `Error al intentar autoconfirmar: ${confRes.error}` };
                }
                return { success: true, message: 'La solicitud se ha confirmado automáticamente. ' + confRes.message };
            }
        }

        revalidatePath('/abordajes/solicitudes-abordajes');
        return { success: true, message: 'Logística actualizada correctaemente' };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'la solicitud de abordaje', 'actualizar');
        return { success: false, error: errorMessage };
    }
}
