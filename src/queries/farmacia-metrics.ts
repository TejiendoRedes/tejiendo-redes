'use server'

import { db } from '@/db';
import { medicamentos, movimientosInventario } from '@/db/schema';
import { sql, eq, desc } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';
import { getErrorMessage } from '@/lib/error-handler';

export async function getFarmaciaDashboardMetrics() {
    try {
        await requireAuth();

        const meds = await db.select().from(medicamentos);
        
        let totalMedicamentos = 0;
        let totalUnidadesFisicas = 0;
        let valorTotalInventario = 0;
        let medicamentosAgotados = 0;
        let medicamentosStockBajo = 0; // < 20
        let medicamentosStockOptimo = 0; // >= 50

        for (const med of meds) {
            totalMedicamentos++;
            totalUnidadesFisicas += med.existencia;
            valorTotalInventario += Number(med.existencia) * Number(med.precio || 0);

            if (med.existencia === 0) {
                medicamentosAgotados++;
            } else if (med.existencia < 20) {
                medicamentosStockBajo++;
            } else if (med.existencia >= 50) {
                medicamentosStockOptimo++;
            }
        }

        // Obtener últimos 10 movimientos
        const ultimosMovimientos = await db.select()
            .from(movimientosInventario)
            .orderBy(desc(movimientosInventario.fechaMovimiento))
            .limit(10);

        // Obtener peticiones pendientes (eliminado en refactor a entregas directas)
        const peticionesPendientes = 0;

        return {
            success: true,
            data: {
                totalMedicamentos,
                totalUnidadesFisicas,
                valorTotalInventario,
                medicamentosAgotados,
                medicamentosStockBajo,
                medicamentosStockOptimo,
                ultimosMovimientos,
                peticionesPendientes
            }
        };
    } catch (error) {
        return { success: false, error: getErrorMessage(error, 'métricas de farmacia', 'obtener') };
    }
}
