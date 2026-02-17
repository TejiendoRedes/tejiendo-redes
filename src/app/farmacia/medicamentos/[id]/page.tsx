'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Pill, Package, Truck } from 'lucide-react';
import { getEntityDetails } from '@/actions/global-search-actions';
import { EntityDetails } from '@/types/app-types';
import { Loader2 } from 'lucide-react';
import { EmptyState } from '@/components/shared/UIComponents';

export default function MedicamentoDetallePage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const [details, setDetails] = useState<EntityDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            getEntityDetails('medicamento', id)
                .then(setDetails)
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [id]);

    if (loading) return <MainLayout><div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div></MainLayout>;

    if (!details) return <MainLayout><div className="p-8 text-center">Medicamento no encontrado</div></MainLayout>;

    if (details.type !== 'medicamento') return null;

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
                                {data.nombreMedicamento}
                            </h1>
                            <p className="text-purple-600 font-medium">{data.presentacion}</p>
                        </div>
                    </div>
                    <Button onClick={() => router.push(`/farmacia/medicamentos/${id}/editar`)} className="gap-2 bg-purple-600 hover:bg-purple-700">
                        <Edit className="w-4 h-4" />
                        Editar Medicamento
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle>Inventario</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                    <Package className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Stock Actual</p>
                                    <p className="text-2xl font-bold text-gray-900">{data.existencia}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                    <Pill className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Código</p>
                                    <p className="text-sm font-medium">{data.codigoMedicamento}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Historial de Entregas Recientes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {history && history.length > 0 ? (
                                <div className="space-y-4">
                                    {history.map((entrega: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between py-3 border-b last:border-0">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                                                    <Truck className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">Entregado a {entrega.nombrePaciente}</p>
                                                    <p className="text-xs text-gray-500">{new Date(entrega.fechaEntrega).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <Badge variant="secondary">-{entrega.cantidad} unidades</Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    icon="info"
                                    title="Sin movimientos"
                                    description="No hay entregas recientes registradas para este medicamento."
                                />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
}
