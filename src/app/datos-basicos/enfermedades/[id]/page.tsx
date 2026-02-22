'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Stethoscope, Activity } from 'lucide-react';
import { getEntityDetails } from '@/queries/global-search';;
import { EntityDetails } from '@/types/app-types';
import { Loader2 } from 'lucide-react';

export default function EnfermedadDetallePage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const [details, setDetails] = useState<EntityDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            getEntityDetails('enfermedad', id)
                .then(setDetails)
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [id]);

    if (loading) return <MainLayout><div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-red-500" /></div></MainLayout>;

    if (!details) return <MainLayout><div className="p-8 text-center">Enfermedad no encontrada</div></MainLayout>;

    if (details.type !== 'enfermedad') return null;

    const { data } = details;

    return (
        <MainLayout>
            <div className="space-y-6 animate-in fade-in-50 duration-500">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {data.nombreEnfermedad}
                            </h1>
                            <p className="text-red-600 font-medium">{data.tipoPatologia}</p>
                        </div>
                    </div>
                    <Button onClick={() => router.push(`/datos-basicos/enfermedades/${id}/editar`)} className="gap-2 bg-red-600 hover:bg-red-700">
                        <Edit className="w-4 h-4" />
                        Editar Enfermedad
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Detalles</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                                    <Activity className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Código</p>
                                    <p className="text-sm font-medium">{data.codigoEnfermedad}</p>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">Descripción</p>
                                <p className="text-sm text-gray-700 leading-relaxed">{data.descripcion || 'Sin descripción disponible.'}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
}
