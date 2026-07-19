"use server";


import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { medicamentos, entregasMedicamentos, type NewMedicamento, type Medicamento } from '@/db/schema';
import { eq, sum } from 'drizzle-orm';
import { getErrorMessage, DeleteErrorMessages } from '@/lib/error-handler';
import { getNextCode } from '@/lib/id-generator';
import { requireAuth } from '@/lib/auth';
import { MedicamentoSchema } from '@/schemas/medicamentos';

/**
 * Obtener todos los medicamentos (con búsqueda opcional)
 */
import { like, or } from 'drizzle-orm';

export async function getMedicamentos(query?: string, limit: number = 50) {
    try {
        await requireAuth();
        let queryBuilder = db.select().from(medicamentos).$dynamic();

        if (query) {
            queryBuilder = queryBuilder.where(
                or(
                    like(medicamentos.nombreMedicamento, `%${query}%`),
                    like(medicamentos.codigoMedicamento, `%${query}%`),
                    like(medicamentos.descripcion, `%${query}%`),
                    like(medicamentos.presentacion, `%${query}%`)
                )
            );
        }

        const data = await queryBuilder.limit(limit);
        return { success: true, data };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'los medicamentos', 'obtener');
        return { success: false, error: errorMessage };
    }
}

/**
 * Obtener resumen de medicamentos solicitados (peticiones)
 */
export async function getMedicamentosEntregados() {
    try {
        await requireAuth();
        const solicitudes = await db
            .select({
                codigoMedicamento: entregasMedicamentos.codigoMedicamento,
                totalSolicitado: sum(entregasMedicamentos.cantidad).as('totalSolicitado'),
                nombreMedicamento: medicamentos.nombreMedicamento,
            })
            .from(entregasMedicamentos)
            .innerJoin(medicamentos, eq(entregasMedicamentos.codigoMedicamento, medicamentos.codigoMedicamento))
            .groupBy(entregasMedicamentos.codigoMedicamento, medicamentos.nombreMedicamento);

        // Calcular totales generales
        const totalUnidades = solicitudes.reduce((sum, item) => sum + Number(item.totalSolicitado || 0), 0);
        const totalMedicamentos = solicitudes.length;

        return {
            success: true,
            data: {
                solicitudes,
                totales: {
                    totalUnidades,
                    totalMedicamentos,
                }
            }
        };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'los medicamentos', 'obtener');
        return { success: false, error: errorMessage };
    }
}

/**
 * Obtener un medicamento por código
 */
export async function getMedicamento(codigo: string) {
    try {
        await requireAuth();
        const result = await db.select()
            .from(medicamentos)
            .where(eq(medicamentos.codigoMedicamento, codigo))
            .limit(1);

        if (!result || result.length === 0) {
            return { success: false, error: 'Medicamento no encontrado' };
        }

        return { success: true, data: result[0] };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'el medicamento', 'obtener');
        return { success: false, error: errorMessage };
    }
}
