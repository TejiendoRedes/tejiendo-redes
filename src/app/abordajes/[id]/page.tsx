'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Calendar, MapPin, Activity, FileText } from 'lucide-react';
import { getEntityDetails, EntityDetails } from '@/actions/global-search-actions';
import { Loader2 } from 'lucide-react';

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

    const { data, related } = details;

    return (
        <MainLayout>
            <div className="space-y-6 animate-in fade-in-50 duration-500">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Abordaje {data.codigoAbordaje}
                                </h1>
                                <Badge variant={data.estado === 'Finalizado' ? 'default' : 'outline'}>
                                    {data.estado}
                                </Badge>
                            </div>
                            <p className="text-gray-500">Detalles del despliegue</p>
                        </div>
                    </div>
                    <Button onClick={() => router.push(`/abordajes/${id}/editar`)} className="gap-2">
                        <Edit className="w-4 h-4" />
                        Editar Abordaje
                    </Button>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Main Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-500" />
                                Información General
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Fecha Planeada</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <p className="text-gray-900">{new Date(data.fechaAbordaje).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Estado</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Activity className="w-4 h-4 text-gray-400" />
                                        <p className="text-gray-900">{data.estado}</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Descripción</p>
                                <p className="text-gray-700 mt-1">{data.descripcion}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Ubicación / Comunidad */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-green-500" />
                                Ubicación
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                                <p className="text-sm text-green-800 font-semibold mb-1">Comunidad Asignada</p>
                                <p className="text-xl font-bold text-green-900">{related?.nombreComunidad || data.codigoComunidad}</p>
                                <p className="text-sm text-green-700 mt-1">{related?.municipio}, {related?.estado}</p>
                                <Button
                                    variant="link"
                                    className="px-0 text-green-600 mt-2 h-auto"
                                    onClick={() => router.push(`/datos-basicos/comunidades/${data.codigoComunidad}`)}
                                >
                                    Ver detalles de comunidad →
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
}
