import { db } from '@/db';
import { solicitudesAbordajes } from '@/db/schema/solicitudes-abordajes';
import { comunidades } from '@/db/schema/comunidades';
import { eq, desc } from 'drizzle-orm';
import { abordaje } from '@/db/schema/abordajes';
import { abordajeComunidad } from '@/db/schema/relations';

export class SolicitudesAbordajesService {
    /**
     * Obtener todas las solicitudes
     */
    static async getAll() {
        return await db.query.solicitudesAbordajes.findMany({
            with: {
                comunidad: true,
            },
            orderBy: [desc(solicitudesAbordajes.fechaSolicitud)],
        });
    }

    /**
     * Obtener una solicitud por ID
     */
    static async getById(id: number) {
        return await db.query.solicitudesAbordajes.findFirst({
            where: eq(solicitudesAbordajes.id, id),
            with: {
                comunidad: true,
            },
        });
    }

    /**
     * Crear una nueva solicitud
     */
    static async create(data: typeof solicitudesAbordajes.$inferInsert) {
        return await db.insert(solicitudesAbordajes).values(data);
    }

    /**
     * Actualizar estado de una solicitud
     * Si se aprueba, opcionalmente se puede crear el abordaje automáticamente
     */
    static async updateStatus(id: number, estado: string, notas?: string) {
        return await db.update(solicitudesAbordajes)
            .set({ estado, notas })
            .where(eq(solicitudesAbordajes.id, id));
    }

    /**
     * Aprobar solicitud y crear abordaje
     */
    static async approveAndCreateAbordaje(id: number, abordajeData: typeof abordaje.$inferInsert) {
        return await db.transaction(async (tx) => {
            // 1. Actualizar estado de la solicitud
            await tx.update(solicitudesAbordajes)
                .set({ estado: 'Aprobada' })
                .where(eq(solicitudesAbordajes.id, id));

            // 2. Crear el abordaje
            await tx.insert(abordaje).values(abordajeData);

            // 3. Asociar con la comunidad
            if (abordajeData.codigoComunidad) {
                await tx.insert(abordajeComunidad).values({
                    codigoAbordaje: abordajeData.codigoAbordaje,
                    codigoComunidad: abordajeData.codigoComunidad,
                });
            }
        });
    }

    /**
     * Eliminar solicitud
     */
    static async delete(id: number) {
        return await db.delete(solicitudesAbordajes).where(eq(solicitudesAbordajes.id, id));
    }
}
