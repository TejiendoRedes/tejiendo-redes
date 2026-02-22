'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Phone, Mail, User, Briefcase } from 'lucide-react';
import { getEntityDetails } from '@/queries/global-search-actions';;
import { EntityDetails } from '@/types/app-types';
import { Loader2 } from 'lucide-react';

export default function TejedorDetallePage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const [details, setDetails] = useState<EntityDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            getEntityDetails('tejedor', id)
                .then(setDetails)
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [id]);

    if (loading) return <MainLayout><div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div></MainLayout>;

    if (!details) return <MainLayout><div className="p-8 text-center">Tejedor no encontrado</div></MainLayout>;

    if (details.type !== 'tejedor') return null;

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
                                {data.nombreTejedor} {data.apellidoTejedor}
                            </h1>
                            <p className="text-indigo-600 font-medium">{data.profesionTejedor}</p>
                        </div>
                    </div>
                    <Button onClick={() => router.push(`/tejedores/${id}/editar`)} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                        <Edit className="w-4 h-4" />
                        Editar Tejedor
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle>Datos de Contacto</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <User className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Cédula</p>
                                    <p className="text-sm font-medium">{data.cedulaTejedor}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <Phone className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Teléfono</p>
                                    <p className="text-sm font-medium">{data.telefonoTejedor}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Correo</p>
                                    <p className="text-sm font-medium">{data.correoTejedor || 'N/A'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
}
