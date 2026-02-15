'use client';

// ... (imports remain similar, but using AbordajeDashboard)

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Loader2 } from 'lucide-react';
import { getEntityDetails, EntityDetails } from '@/actions/global-search-actions';
import { AbordajeDashboard } from '@/components/abordajes/AbordajeDashboard';
import { Button } from '@/components/ui/button';

export default function AbordajeDetallePage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const [details, setDetails] = useState<EntityDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            getEntityDetails('abordaje', id)
                .then(setDetails)
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [id]);

    if (loading) {
        return (
            <MainLayout>
                <div className="flex h-screen items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            </MainLayout>
        );
    }

    if (!details) {
        return (
            <MainLayout>
                <div className="p-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-700">Abordaje no encontrado</h2>
                    <Button className="mt-4" onClick={() => router.back()}>Volver</Button>
                </div>
            </MainLayout>
        );
    }

    // Prepare data for the dashboard
    // We combine the main data with the related lists
    const abordajeComplete = {
        ...details.data,
        ...details.related // This should contain communities, tejedores, consultas, etc.
    };

    return (
        <MainLayout>
            <AbordajeDashboard abordaje={abordajeComplete} />
        </MainLayout>
    );
}
