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
import { medicos } from '@/db/schema/medicos';
import { peticiones } from '@/db/schema/peticiones';

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
        const [abordajeData, comunidadesData, tejedoresData, consultasData, medsPacientesData, peticionesMedsData] =
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
                    tipodeVoluntario: tejedores.tipodeVoluntario,
                    rolAbordaje: tejedoresAbordaje.rolEnAbordaje,
                })
                    .from(tejedoresAbordaje)
                    .innerJoin(tejedores, eq(tejedoresAbordaje.cedulaTejedor, tejedores.cedulaTejedor))
                    .where(eq(tejedoresAbordaje.codigoAbordaje, id)),
                db.select({
                    codigoConsulta: consultas.codigoConsulta,
                    cedulaPaciente: consultas.cedulaPaciente,
                    nombrePaciente: sql<string>`concat(${pacientes.nombrePaciente}, ' ', ${pacientes.apellidoPaciente})`,
                    cedulaMedico: consultas.cedulaMedico,
                    nombreMedico: sql<string>`concat(${tejedores.nombreTejedor}, ' ', ${tejedores.apellidoTejedor})`,
                    motivoConsulta: consultas.motivoConsulta,
                    diagnosticoTexto: consultas.diagnosticoTexto,
                    tensionArterial: consultas.tensionArterial,
                    horaConsulta: consultas.horaConsulta,
                })
                    .from(consultas)
                    .leftJoin(pacientes, eq(consultas.cedulaPaciente, pacientes.cedulaPaciente))
                    .leftJoin(medicos, eq(consultas.cedulaMedico, medicos.cedulaTejedor))
                    .leftJoin(tejedores, eq(medicos.cedulaTejedor, tejedores.cedulaTejedor))
                    .where(eq(consultas.codigoAbordaje, id)),
                db.select({
                    codigoMedicamento: medicamentos.codigoMedicamento,
                    cedulaPaciente: medicamentosPacientes.cedulaPaciente,
                    nombrePaciente: sql<string>`concat(${pacientes.nombrePaciente}, ' ', ${pacientes.apellidoPaciente})`,
                    cantidadEntregada: medicamentosPacientes.cantidadEntregada,
                    indicaciones: medicamentos.descripcion,
                    nombreMedicamento: medicamentos.nombreMedicamento,
                })
                    .from(medicamentosPacientes)
                    .innerJoin(medicamentos, eq(medicamentosPacientes.codigoMedicamento, medicamentos.codigoMedicamento))
                    .leftJoin(pacientes, eq(medicamentosPacientes.cedulaPaciente, pacientes.cedulaPaciente))
                    .where(eq(medicamentosPacientes.codigoAbordaje, id)),
                db.select({
                    codigoMedicamento: medicamentos.codigoMedicamento,
                    cedulaPaciente: peticiones.codigoPaciente,
                    nombrePaciente: sql<string>`concat(${pacientes.nombrePaciente}, ' ', ${pacientes.apellidoPaciente})`,
                    cantidadEntregada: peticiones.cantidad,
                    indicaciones: peticiones.notas,
                    nombreMedicamento: medicamentos.nombreMedicamento,
                    fechaEntrega: peticiones.fechaEntrega,
                })
                    .from(peticiones)
                    .innerJoin(medicamentos, eq(peticiones.codigoMedicamento, medicamentos.codigoMedicamento))
                    .leftJoin(pacientes, eq(peticiones.codigoPaciente, pacientes.cedulaPaciente))
                    .where(
                        and(
                            eq(peticiones.codigoAbordaje, id),
                            eq(peticiones.estado, 'entregado')
                        )
                    ),
            ]);

        if (!abordajeData) return null;

        const consultasWithDate = consultasData.map(c => ({
            ...c,
            fechaConsulta: abordajeData.fechaAbordaje instanceof Date
                ? abordajeData.fechaAbordaje.toISOString().split('T')[0]
                : String(abordajeData.fechaAbordaje)
        }));

        return {
            ...abordajeData,
            comunidades: comunidadesData,
            tejedores: tejedoresData,
            consultas: consultasWithDate,
            medicamentos_entregados: [...medsPacientesData, ...peticionesMedsData],
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
        return await db.transaction(async (tx) => {
            // 1. Eliminar medicamentos entregados
            await tx.delete(medicamentosPacientes).where(eq(medicamentosPacientes.codigoAbordaje, id));

            // 2. Eliminar consultas asociadas (incluyendo sus enfermedades, que están en CASCADA en DB pero mejor ser explícitos si fuera necesario, aquí confiamos en la DB para consultas->enfermedades si está configurado, 
            // pero consultas->abordaje es RESTRICT, so we MUST delete inquiries first)
            // Primero borrar enfermedades de las consultas de este abordaje si fuera necesario, pero la relación consultas->enfermedades es cascade.
            // Borramos las consultas.
            await tx.delete(consultas).where(eq(consultas.codigoAbordaje, id));

            // 3. Eliminar asistencia / check-ins
            await tx.delete(abordajeAsistencia).where(eq(abordajeAsistencia.codigoAbordaje, id));

            // 4. Eliminar tejedores asociados
            await tx.delete(tejedoresAbordaje).where(eq(tejedoresAbordaje.codigoAbordaje, id));

            // 5. Eliminar comunidades asociadas
            await tx.delete(abordajeComunidad).where(eq(abordajeComunidad.codigoAbordaje, id));

            // 6. Finalmente eliminar el abordaje
            return await tx.delete(abordaje).where(eq(abordaje.codigoAbordaje, id));
        });
    }

    static async registerMedicamentoEntrega(data: typeof medicamentosPacientes.$inferInsert) {
        return await db.transaction(async (tx) => {
            // 0. Verificar existencia actual
            const [medicamento] = await tx.select({
                existencia: medicamentos.existencia,
                nombreMedicamento: medicamentos.nombreMedicamento
            })
                .from(medicamentos)
                .where(eq(medicamentos.codigoMedicamento, data.codigoMedicamento));

            if (!medicamento) {
                throw new Error('Medicamento no encontrado');
            }

            if (medicamento.existencia < data.cantidadEntregada) {
                throw new Error(`Inventario insuficiente para ${medicamento.nombreMedicamento}. Disponible: ${medicamento.existencia}, Solicitado: ${data.cantidadEntregada}`);
            }

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
