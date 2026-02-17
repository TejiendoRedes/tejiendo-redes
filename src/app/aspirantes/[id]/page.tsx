'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, User, Phone, Briefcase } from 'lucide-react';
import { getEntityDetails } from '@/actions/global-search-actions';
import { EntityDetails } from '@/types/app-types';
import { Loader2 } from 'lucide-react';

export default function AspiranteDetallePage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const [details, setDetails] = useState<EntityDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            getEntityDetails('aspirante', id)
                .then(setDetails)
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [id]);

    if (loading) return <MainLayout><div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-yellow-500" /></div></MainLayout>;

    if (!details) return <MainLayout><div className="p-8 text-center">Aspirante no encontrado</div></MainLayout>;

    if (details.type !== 'aspirante') return null;

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
                                {data.nombreAspirante} {data.apellidoAspirante}
                            </h1>
                            <p className="text-yellow-600 font-medium">Aspirante a Tejedor</p>
                        </div>
                    </div>
                    <Button onClick={() => router.push(`/aspirantes/${id}/editar`)} className="gap-2 bg-yellow-600 hover:bg-yellow-700 text-white">
                        <Edit className="w-4 h-4" />
                        Editar Aspirante
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información Personal</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600">
                                    <User className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Cédula</p>
                                    <p className="text-sm font-medium">{data.cedulaAspirante}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600">
                                    <Phone className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Teléfono</p>
                                    <p className="text-sm font-medium">{data.telefonoAspirante}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600">
                                    <Briefcase className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Profesión Actual</p>
                                    <p className="text-sm font-medium">{data.profesionAspirante}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
}
