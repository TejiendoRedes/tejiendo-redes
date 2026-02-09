import { db } from '@/db';
import { abordaje } from '@/db/schema/abordajes';
import { abordajeComunidad, tejedoresAbordaje, medicamentosPacientes } from '@/db/schema/relations';
import { comunidades } from '@/db/schema/comunidades';
import { tejedores } from '@/db/schema/tejedores';
import { consultas } from '@/db/schema/consultas';
import { medicamentos } from '@/db/schema/medicamentos';
import { eq, and } from 'drizzle-orm';

export class AbordajesService {
    /**
     * Obtener todos los abordajes
     */
    static async getAll() {
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
     */
    static async create(data: typeof abordaje.$inferInsert) {
        return await db.insert(abordaje).values(data);
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

    static async registerMedicamentoEntrega(data: typeof medicamentosPacientes.$inferInsert) {
        return await db.insert(medicamentosPacientes).values(data);
    }
}
