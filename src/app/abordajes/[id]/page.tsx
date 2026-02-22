import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { getAbordajeById } from '@/queries/abordajes';;
import { AbordajeDashboard } from '@/components/abordajes/AbordajeDashboard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function AbordajeDetallePage({ params }: PageProps) {
    const { id } = await params;
    const res = await getAbordajeById(id);

    if (!res.success || !res.data) {
        return (
            <MainLayout>
                <div className="p-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-700">
                        {res.error || 'Abordaje no encontrado'}
                    </h2>
                    <Link href="/abordajes">
                        <Button className="mt-4">Volver a Abordajes</Button>
                    </Link>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <AbordajeDashboard abordaje={res.data} />
        </MainLayout>
    );
}
