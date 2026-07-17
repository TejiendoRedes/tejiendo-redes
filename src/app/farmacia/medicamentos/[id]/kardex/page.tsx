import React from 'react';
import KardexClient from '@/components/features/farmacia/kardex-client';
import { getKardexMedicamento } from '@/queries/kardex';
import { requireAuth } from '@/lib/auth';
import { notFound } from 'next/navigation';

export const metadata = {
    title: 'Kardex - Tejiendo Redes',
    description: 'Historial de movimientos de inventario'
};

export default async function KardexPage({ params }: { params: { id: string } }) {
    await requireAuth();
    
    const codigo = params.id;
    const res = await getKardexMedicamento(codigo);
    
    if (!res.success || !res.data) {
        return notFound();
    }

    return (
        <KardexClient 
            medicamento={res.data.medicamento} 
            movimientos={res.data.movimientos} 
        />
    );
}
