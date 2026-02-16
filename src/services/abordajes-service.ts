import { db } from '@/db';
import { abordaje } from '@/db/schema/abordajes';
import { abordajeComunidad, tejedoresAbordaje, medicamentosPacientes } from '@/db/schema/relations';
import { comunidades } from '@/db/schema/comunidades';
import { tejedores } from '@/db/schema/tejedores';
import { consultas } from '@/db/schema/consultas';
import { medicamentos } from '@/db/schema/medicamentos';
import { eq, and, sql } from 'drizzle-orm';
import { abordajeAsistencia } from '@/db/schema/abordaje-asistencia';
import { pacientes } from '@/db/schema/pacientes';

export class AbordajesService {
    /**
     * DB-02: Debounced sync — only runs once per minute instead of every read
     */
    private static lastSyncTime = 0;
    private static SYNC_INTERVAL_MS = 60_000; // 1 minute

    private static async syncStatusesIfNeeded() {
        const now = Date.now();
        if (now - this.lastSyncTime < this.SYNC_INTERVAL_MS) return;
        this.lastSyncTime = now;

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
        await this.syncStatusesIfNeeded();
        return await db.select({
            abordaje,
            comunidad: comunidades
        })
            .from(abordaje)
            .leftJoin(comunidades, eq(abordaje.codigoComunidad, comunidades.codigoComunidad))
            .orderBy(abordaje.fechaAbordaje);
    }

    /**
     * DB-01: Obtener un abordaje por su ID con todas sus relaciones (parallelized)
     */
    static async getById(id: string) {
        await this.syncStatusesIfNeeded();

        // Execute all queries in parallel with Promise.all
        const [abordajeData, comunidadesData, tejedoresData, consultasData, medicamentosData] =
            await Promise.all([
                db.query.abordaje.findFirst({
                    where: eq(abordaje.codigoAbordaje, id),
                }),
                db.select({
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
                    .where(eq(abordajeComunidad.codigoAbordaje, id)),
                db.select({
                    cedulaTejedor: tejedores.cedulaTejedor,
                    nombreTejedor: tejedores.nombreTejedor,
                    apellidoTejedor: tejedores.apellidoTejedor,
                    profesionTejedor: tejedores.profesionTejedor,
                    rolAbordaje: tejedoresAbordaje.rolEnAbordaje,
                })
                    .from(tejedoresAbordaje)
                    .innerJoin(tejedores, eq(tejedoresAbordaje.cedulaTejedor, tejedores.cedulaTejedor))
                    .where(eq(tejedoresAbordaje.codigoAbordaje, id)),
                db.select()
                    .from(consultas)
                    .where(eq(consultas.codigoAbordaje, id)),
                db.select({
                    codigoMedicamento: medicamentos.codigoMedicamento,
                    cedulaPaciente: medicamentosPacientes.cedulaPaciente,
                    cantidadEntregada: medicamentosPacientes.cantidadEntregada,
                    indicaciones: medicamentos.descripcion,
                    nombreMedicamento: medicamentos.nombreMedicamento,
                })
                    .from(medicamentosPacientes)
                    .innerJoin(medicamentos, eq(medicamentosPacientes.codigoMedicamento, medicamentos.codigoMedicamento))
                    .where(eq(medicamentosPacientes.codigoAbordaje, id)),
            ]);

        if (!abordajeData) return null;

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

    /**
     * Obtener listado de asistencia (Check-in) para un abordaje
     */
    static async getAsistencia(abordajeId: string) {
        return await db.select({
            id: abordajeAsistencia.id,
            cedulaPaciente: abordajeAsistencia.cedulaPaciente,
            horaLlegada: abordajeAsistencia.horaLlegada,
            estado: abordajeAsistencia.estado,
            serviciosRequeridos: abordajeAsistencia.serviciosRequeridos,
            notas: abordajeAsistencia.notas,
            paciente: {
                nombre: pacientes.nombrePaciente,
                apellido: pacientes.apellidoPaciente,
                fechaNacimiento: pacientes.fechaNacimiento,
            }
        })
            .from(abordajeAsistencia)
            .innerJoin(pacientes, eq(abordajeAsistencia.cedulaPaciente, pacientes.cedulaPaciente))
            .where(eq(abordajeAsistencia.codigoAbordaje, abordajeId))
            .orderBy(abordajeAsistencia.horaLlegada);
    }

    /**
     * Registrar llegada de paciente (Check-in)
     */
    static async checkInPatient(codigoAbordaje: string, cedulaPaciente: string, servicios?: string) {
        // Verificar si ya está registrado
        const existing = await db.select()
            .from(abordajeAsistencia)
            .where(and(
                eq(abordajeAsistencia.codigoAbordaje, codigoAbordaje),
                eq(abordajeAsistencia.cedulaPaciente, cedulaPaciente)
            ));

        if (existing.length > 0) {
            throw new Error('El paciente ya está registrado en este abordaje');
        }

        return await db.insert(abordajeAsistencia).values({
            codigoAbordaje,
            cedulaPaciente,
            estado: 'En Espera',
            serviciosRequeridos: servicios,
            horaLlegada: new Date(),
        });
    }

    /**
     * Actualizar estado o datos de asistencia
     */
    static async updateAsistencia(id: number, data: Partial<typeof abordajeAsistencia.$inferInsert>) {
        return await db.update(abordajeAsistencia)
            .set(data)
            .where(eq(abordajeAsistencia.id, id));
    }
}
