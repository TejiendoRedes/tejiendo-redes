import { db } from '@/db';
import { abordaje } from '@/db/schema/abordajes';
import { abordajeComunidad, tejedoresAbordaje, medicamentosPacientes } from '@/db/schema/relations';
import { comunidades } from '@/db/schema/comunidades';
import { tejedores } from '@/db/schema/tejedores';
import { consultas } from '@/db/schema/consultas';
import { medicamentos } from '@/db/schema/medicamentos';
import { eq, and, sql } from 'drizzle-orm';

export class AbordajesService {
    /**
     * Sincronizar estados de abordajes (Planificado -> Finalizado si la fecha ya pasó)
     */
    private static async syncStatuses() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        try {
            await db.update(abordaje)
                .set({ estado: 'Finalizado' })
                .where(and(
                    eq(abordaje.estado, 'Planificado'),
                    sql`${abordaje.fechaAbordaje} < ${today}`
                ));
        } catch (error) {
            console.error('Error syncing abordajes statuses:', error);
        }
    }

    /**
     * Obtener todos los abordajes
     */
    static async getAll() {
        await this.syncStatuses();
        return await db.select({
            abordaje,
            comunidad: comunidades
        })
            .from(abordaje)
            .leftJoin(comunidades, eq(abordaje.codigoComunidad, comunidades.codigoComunidad))
            .orderBy(abordaje.fechaAbordaje);
    }

    /**
     * Obtener un abordaje por su ID con todas sus relaciones
     */
    static async getById(id: string) {
        await this.syncStatuses();
        // 1. Obtener datos del abordaje
        const abordajeData = await db.query.abordaje.findFirst({
            where: eq(abordaje.codigoAbordaje, id),
        });

        if (!abordajeData) {
            return null;
        }

        // 2. Obtener comunidades relacionadas
        const comunidadesData = await db.select({
            codigoComunidad: comunidades.codigoComunidad,
            nombreComunidad: comunidades.nombreComunidad,
            municipio: comunidades.municipio,
            parroquia: comunidades.direccion,
            estado: comunidades.estado,
            habitantes: comunidades.cantidadHabitantes,
            observaciones: abordajeComunidad.observaciones,
        })
            .from(abordajeComunidad)
            .innerJoin(comunidades, eq(abordajeComunidad.codigoComunidad, comunidades.codigoComunidad))
            .where(eq(abordajeComunidad.codigoAbordaje, id));

        // 3. Obtener tejedores participantes
        const tejedoresData = await db.select({
            cedulaTejedor: tejedores.cedulaTejedor,
            nombreTejedor: tejedores.nombreTejedor,
            apellidoTejedor: tejedores.apellidoTejedor,
            profesionTejedor: tejedores.profesionTejedor,
            rolAbordaje: tejedoresAbordaje.rolEnAbordaje,
        })
            .from(tejedoresAbordaje)
            .innerJoin(tejedores, eq(tejedoresAbordaje.cedulaTejedor, tejedores.cedulaTejedor))
            .where(eq(tejedoresAbordaje.codigoAbordaje, id));

        // 4. Obtener consultas realizadas
        const consultasData = await db.select()
            .from(consultas)
            .where(eq(consultas.codigoAbordaje, id));

        // 5. Obtener medicamentos entregados
        const medicamentosData = await db.select({
            codigoMedicamento: medicamentos.codigoMedicamento,
            cedulaPaciente: medicamentosPacientes.cedulaPaciente,
            cantidadEntregada: medicamentosPacientes.cantidadEntregada,
            indicaciones: medicamentos.descripcion,
            nombreMedicamento: medicamentos.nombreMedicamento,
        })
            .from(medicamentosPacientes)
            .innerJoin(medicamentos, eq(medicamentosPacientes.codigoMedicamento, medicamentos.codigoMedicamento))
            .where(eq(medicamentosPacientes.fechaEntrega, abordajeData.fechaAbordaje));

        return {
            ...abordajeData,
            comunidades: comunidadesData,
            tejedores: tejedoresData,
            consultas: consultasData,
            medicamentos_entregados: medicamentosData,
            total_consultas: consultasData.length,
            pacientes_unicos: new Set(consultasData.map(c => c.cedulaPaciente)).size,
        };
    }

    /**
     * Crear un nuevo abordaje
     * Incluye la asociación automática con la comunidad en la tabla puente
     */
    static async create(data: typeof abordaje.$inferInsert) {
        return await db.transaction(async (tx) => {
            // 1. Insertar el abordaje
            const result = await tx.insert(abordaje).values(data);

            // 2. Si hay un código de comunidad, asociarlo en la tabla puente automáticamente
            if (data.codigoComunidad) {
                await tx.insert(abordajeComunidad).values({
                    codigoAbordaje: data.codigoAbordaje,
                    codigoComunidad: data.codigoComunidad,
                });
            }

            return result;
        });
    }

    /**
     * Actualizar abordaje
     */
    static async update(id: string, data: Partial<typeof abordaje.$inferInsert>) {
        return await db.update(abordaje)
            .set(data)
            .where(eq(abordaje.codigoAbordaje, id));
    }

    /**
     * Agregar comunidad a abordaje
     */
    static async addComunidad(codigoAbordaje: string, codigoComunidad: string) {
        // Check existing
        const existing = await db.select()
            .from(abordajeComunidad)
            .where(and(
                eq(abordajeComunidad.codigoAbordaje, codigoAbordaje),
                eq(abordajeComunidad.codigoComunidad, codigoComunidad)
            ));

        if (existing.length > 0) throw new Error('La comunidad ya está asignada a este abordaje');

        return await db.insert(abordajeComunidad).values({
            codigoAbordaje,
            codigoComunidad,
        });
    }

    /**
     * Remover comunidad de abordaje
     */
    static async removeComunidad(codigoAbordaje: string, codigoComunidad: string) {
        return await db.delete(abordajeComunidad)
            .where(and(
                eq(abordajeComunidad.codigoAbordaje, codigoAbordaje),
                eq(abordajeComunidad.codigoComunidad, codigoComunidad)
            ));
    }

    // ... similar methods for Tejedores and Medicamentos ...
    static async addTejedor(codigoAbordaje: string, cedulaTejedor: string, rol: string) {
        const existing = await db.select()
            .from(tejedoresAbordaje)
            .where(and(
                eq(tejedoresAbordaje.codigoAbordaje, codigoAbordaje),
                eq(tejedoresAbordaje.cedulaTejedor, cedulaTejedor)
            ));

        if (existing.length > 0) throw new Error('El tejedor ya está asignado a este abordaje');

        return await db.insert(tejedoresAbordaje).values({
            codigoAbordaje,
            cedulaTejedor,
            rolEnAbordaje: rol,
        });
    }

    static async removeTejedor(codigoAbordaje: string, cedulaTejedor: string) {
        return await db.delete(tejedoresAbordaje)
            .where(and(
                eq(tejedoresAbordaje.codigoAbordaje, codigoAbordaje),
                eq(tejedoresAbordaje.cedulaTejedor, cedulaTejedor)
            ));
    }

    static async delete(id: string) {
        // FK constraints will be handled by the database (restrict or cascade depending on relation)
        // But for main Abordaje, we might want to ensure manual cascades or checks if DB doesn't handle all.
        // In relations.ts:
        // - abordajeComunidad: cascade
        // - tejedoresAbordaje: cascade
        // - consultas: restrict (THIS IS GOOD, prevents deleting abordaje with consultations)
        // - medicamentosPacientes: cascade (we just set this!)

        return await db.delete(abordaje).where(eq(abordaje.codigoAbordaje, id));
    }

    static async registerMedicamentoEntrega(data: typeof medicamentosPacientes.$inferInsert) {
        return await db.transaction(async (tx) => {
            // 1. Registrar la entrega en la tabla puente
            const result = await tx.insert(medicamentosPacientes).values(data);

            // 2. Decrementar la existencia en la tabla de medicamentos de forma atómica
            await tx.update(medicamentos)
                .set({
                    existencia: sql`${medicamentos.existencia} - ${data.cantidadEntregada}`
                })
                .where(eq(medicamentos.codigoMedicamento, data.codigoMedicamento));

            return result;
        });
    }
}
