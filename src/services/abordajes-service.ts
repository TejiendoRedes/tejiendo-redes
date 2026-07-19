import { db } from '@/db';
import { abordaje } from '@/db/schema/abordajes';
import { tejedoresAbordaje } from '@/db/schema/relations';
import { comunidades } from '@/db/schema/comunidades';
import { tejedores } from '@/db/schema/tejedores';
import { consultas } from '@/db/schema/consultas';
import { medicamentos } from '@/db/schema/medicamentos';
import { responsable } from '@/db/schema/responsable';
import { eq, and, sql, lt } from 'drizzle-orm';
import { abordajeAsistencia } from '@/db/schema/abordaje-asistencia';
import { pacientes } from '@/db/schema/pacientes';
import { medicos } from '@/db/schema/medicos';
import { entregasMedicamentos } from '@/db/schema/entregas_medicamentos';
import { estados, municipios, parroquias } from '@/db/schema/geografia';

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
        // Convertir la fecha a formato local YYYY-MM-DD para evitar errores en mysql2
        const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');

        try {
            await db.update(abordaje)
                .set({ estado: 'Finalizado' })
                .where(and(
                    eq(abordaje.estado, 'Planificado'),
                    lt(abordaje.fechaAbordaje, todayStr as unknown as Date) // Casting a Date para satisfacer el tipado estricto de drizzle
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
        const [abordajeData, comunidadesData, tejedoresData, consultasData, entregasMedsData] =
            await Promise.all([
                db.query.abordaje.findFirst({
                    where: eq(abordaje.codigoAbordaje, id),
                }),
                db.select({
                    codigoComunidad: comunidades.codigoComunidad,
                    nombreComunidad: comunidades.nombreComunidad,
                    municipio: sql<string>`COALESCE(${municipios.nombre}, 'Desconocido')`,
                    parroquia: sql<string>`COALESCE(${parroquias.nombre}, 'Desconocido')`,
                    estado: sql<string>`COALESCE(${estados.nombre}, 'Desconocido')`,
                    habitantes: comunidades.cantidadHabitantes,
                    observaciones: abordaje.observacionesComunidad,
                    tipoComunidad: comunidades.tipoComunidad,
                    direccion: comunidades.direccion,
                    telefonoComunidad: comunidades.telefonoComunidad,
                    cantidadFamilias: comunidades.cantidadFamilias,
                    cantidadNinos: comunidades.cantidadNinos,
                    cantidadAdolescentes: comunidades.cantidadAdolescentes,
                    cantidadMayores: comunidades.cantidadMayores,
                    cantidadMayores60: comunidades.cantidadMayores60,
                    nombreResponsable: responsable.nombreResponsable,
                    apellidoResponsable: responsable.apellidoResponsable,
                    cargoResponsable: responsable.cargo,
                    telefonoResponsable: responsable.telefonoResponsable,
                })
                    .from(comunidades)
                    .innerJoin(abordaje, eq(abordaje.codigoComunidad, comunidades.codigoComunidad))
                    .leftJoin(parroquias, eq(comunidades.parroquiaId, parroquias.id))
                    .leftJoin(municipios, eq(parroquias.municipioId, municipios.id))
                    .leftJoin(estados, eq(municipios.estadoId, estados.id))
                    .leftJoin(responsable, eq(comunidades.cedulaResponsable, responsable.cedulaResponsable))
                    .where(eq(abordaje.codigoAbordaje, id)),
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
                    cedulaPaciente: entregasMedicamentos.codigoPaciente,
                    nombrePaciente: sql<string>`concat(${pacientes.nombrePaciente}, ' ', ${pacientes.apellidoPaciente})`,
                    cantidadEntregada: entregasMedicamentos.cantidad,
                    indicaciones: entregasMedicamentos.notas,
                    nombreMedicamento: medicamentos.nombreMedicamento,
                    fechaEntrega: entregasMedicamentos.fechaEntrega,
                })
                    .from(entregasMedicamentos)
                    .innerJoin(medicamentos, eq(entregasMedicamentos.codigoMedicamento, medicamentos.codigoMedicamento))
                    .leftJoin(pacientes, eq(entregasMedicamentos.codigoPaciente, pacientes.cedulaPaciente))
                    .where(
                        and(
                            eq(entregasMedicamentos.codigoAbordaje, id),
                            eq(entregasMedicamentos.estado, 'entregado')
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
            comunidad: comunidadesData[0] || null,
            tejedores: tejedoresData,
            consultas: consultasWithDate,
            medicamentos_entregados: entregasMedsData,
            total_consultas: consultasData.length,
            pacientes_unicos: new Set(consultasData.map(c => c.cedulaPaciente)).size,
        };
    }

    static async create(data: typeof abordaje.$inferInsert) {
        return await db.transaction(async (tx) => {
            // 1. Insertar el abordaje
            const result = await tx.insert(abordaje).values(data);
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
            // 1. Devolver stock de entregas antes de borrarlas
            const entregadas = await tx.select()
                .from(entregasMedicamentos)
                .where(and(
                    eq(entregasMedicamentos.codigoAbordaje, id),
                    eq(entregasMedicamentos.estado, 'entregado')
                ));

            for (const ent of entregadas) {
                await tx.update(medicamentos)
                    .set({
                        existencia: sql`${medicamentos.existencia} + ${ent.cantidad}`
                    })
                    .where(eq(medicamentos.codigoMedicamento, ent.codigoMedicamento));
            }

            // 2. Eliminar entregas asociadas
            await tx.delete(entregasMedicamentos).where(eq(entregasMedicamentos.codigoAbordaje, id));

            // 3. Eliminar consultas asociadas
            await tx.delete(consultas).where(eq(consultas.codigoAbordaje, id));

            // 4. Eliminar asistencia / check-ins
            await tx.delete(abordajeAsistencia).where(eq(abordajeAsistencia.codigoAbordaje, id));

            // 5. Eliminar tejedores asociados
            await tx.delete(tejedoresAbordaje).where(eq(tejedoresAbordaje.codigoAbordaje, id));

            // 6. Finalmente eliminar el abordaje
            return await tx.delete(abordaje).where(eq(abordaje.codigoAbordaje, id));
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
