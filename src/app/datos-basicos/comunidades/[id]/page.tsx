'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, MapPin, Users, Briefcase, FileText } from 'lucide-react';
import { getEntityDetails } from '@/actions/global-search-actions';
import { EntityDetails } from '@/types/app-types';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/components/shared/UIComponents';

export default function ComunidadDetallePage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const [details, setDetails] = useState<EntityDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            getEntityDetails('comunidad', id)
                .then(setDetails)
                .catch((err) => {
                    console.error(err);
                    setDetails(null);
                })
                .finally(() => setLoading(false));
        }
    }, [id]);

    if (loading) return <MainLayout><div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-green-500" /></div></MainLayout>;

    if (!details) return <MainLayout><div className="p-8 text-center">Comunidad no encontrada</div></MainLayout>;

    if (details.type !== 'comunidad') return null;

    const { data, history, related } = details;

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
                                {data.nombreComunidad}
                            </h1>
                            <p className="text-green-600 font-medium">{data.estado} - {data.municipio}</p>
                        </div>
                    </div>
                    <Button onClick={() => router.push(`/datos-basicos/comunidades/${id}/editar`)} className="gap-2 bg-green-600 hover:bg-green-700">
                        <Edit className="w-4 h-4" />
                        Editar Comunidad
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Detalles Generales</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Código</p>
                                    <p className="font-medium">{data.codigoComunidad}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Parroquia</p>
                                    <p className="font-medium">{data.parroquia}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {related && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-teal-600" />
                                    Responsable
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="p-4 bg-teal-50 rounded-lg border border-teal-100">
                                    <p className="text-lg font-bold text-teal-900">{related.nombreResponsable} {related.apellidoResponsable}</p>
                                    <div className="flex items-center gap-2 mt-2 text-teal-700">
                                        <Briefcase className="w-4 h-4" />
                                        <span>{related.cargo}</span>
                                    </div>
                                    <Button
                                        variant="link"
                                        className="px-0 text-teal-600 mt-2 h-auto"
                                        onClick={() => router.push(`/datos-basicos/responsables/${related.cedulaResponsable}`)}
                                    >
                                        Ver detalles del responsable →
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Historial de Abordajes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {history && history.length > 0 ? (
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {history.map((abordaje: any) => (
                                        <Link
                                            key={abordaje.codigoAbordaje}
                                            href={`/abordajes/${abordaje.codigoAbordaje}`}
                                            className="block p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge variant={abordaje.estado === 'Finalizado' ? 'default' : 'outline'}>
                                                    {abordaje.estado}
                                                </Badge>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(abordaje.fechaAbordaje).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="font-medium text-gray-900 mb-1">{abordaje.codigoAbordaje}</p>
                                            <p className="text-sm text-gray-600 line-clamp-2">
                                                {abordaje.descripcion}
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    icon="info"
                                    title="Sin abordajes"
                                    description="Esta comunidad no ha tenido abordajes registrados."
                                />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
}
