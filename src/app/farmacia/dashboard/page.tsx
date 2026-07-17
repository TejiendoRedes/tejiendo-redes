import React from 'react';
import FarmaciaDashboardClient from '@/components/features/farmacia/dashboard-client';
import { getFarmaciaDashboardMetrics } from '@/queries/farmacia-metrics';
import { requireAuth } from '@/lib/auth';

export const metadata = {
    title: 'Dashboard de Farmacia - Tejiendo Redes',
    description: 'Métricas y estadísticas del inventario de medicamentos'
};

export default async function FarmaciaDashboardPage() {
    await requireAuth();
    const res = await getFarmaciaDashboardMetrics();
    
    // In case of error or no data, we pass an empty/default structure
    const defaultMetrics = {
        totalMedicamentos: 0,
        totalUnidadesFisicas: 0,
        valorTotalInventario: 0,
        medicamentosAgotados: 0,
        medicamentosStockBajo: 0,
        medicamentosStockOptimo: 0,
        ultimosMovimientos: [],
        peticionesPendientes: 0
    };

    const metrics = res.success && res.data ? res.data : defaultMetrics;

    return <FarmaciaDashboardClient metrics={metrics} />;
}
