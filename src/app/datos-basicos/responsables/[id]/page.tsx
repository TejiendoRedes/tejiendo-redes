'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Phone, Home, Briefcase } from 'lucide-react';
import { getEntityDetails } from '@/queries/global-search-actions';;
import { EntityDetails } from '@/types/app-types';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ResponsableDetallePage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const [details, setDetails] = useState<EntityDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            getEntityDetails('responsable', id)
                .then(setDetails)
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [id]);

    if (loading) return <MainLayout><div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-teal-500" /></div></MainLayout>;

    if (!details) return <MainLayout><div className="p-8 text-center">Responsable no encontrado</div></MainLayout>;

    if (details.type !== 'responsable') return null;

    const { data, history } = details;

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
                                {data.nombreResponsable} {data.apellidoResponsable}
                            </h1>
                            <p className="text-teal-600 font-medium">{data.cargo}</p>
                        </div>
                    </div>
                    <Button onClick={() => router.push(`/datos-basicos/responsables/${id}/editar`)} className="gap-2 bg-teal-600 hover:bg-teal-700">
                        <Edit className="w-4 h-4" />
                        Editar Responsable
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información de Contacto</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                                    <Phone className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Teléfono</p>
                                    <p className="text-sm font-medium">{data.telefonoResponsable}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                                    <Briefcase className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Cédula</p>
                                    <p className="text-sm font-medium">{data.cedulaResponsable}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Comunidades a Cargo</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {history && history.length > 0 ? (
                                <ul className="space-y-2">
                                    {history.map((com: any) => (
                                        <li key={com.codigoComunidad}>
                                            <Link href={`/datos-basicos/comunidades/${com.codigoComunidad}`} className="flex items-center gap-2 p-2 rounded hover:bg-teal-50 text-gray-700 hover:text-teal-700 transition-colors">
                                                <Home className="w-4 h-4" />
                                                <span>{com.nombreComunidad}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-400 text-sm">No tiene comunidades asignadas actualmente.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
}
