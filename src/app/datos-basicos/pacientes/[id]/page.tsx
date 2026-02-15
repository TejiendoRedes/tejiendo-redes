'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    ArrowLeft,
    User,
    MapPin,
    Phone,
    Calendar,
    Loader2,
    Edit
} from 'lucide-react';
import { EmptyState } from '@/components/shared/UIComponents';
import { getEntityDetails, EntityDetails } from '@/actions/global-search-actions';

export default function PacienteDetallePage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const [details, setDetails] = useState<EntityDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            getEntityDetails('paciente', id)
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
                <EmptyState
                    icon="error"
                    title="Paciente no encontrado"
                    description="El paciente que buscas no existe o fue eliminado"
                    action={{
                        label: 'Volver a pacientes',
                        onClick: () => router.push('/datos-basicos/pacientes'),
                    }}
                />
            </MainLayout>
        );
    }

    const { data, history } = details;
    const pacienteData = data;

    // Calcular edad (aproximada si no hay función helper a mano)
    const fechaNacimiento = new Date(pacienteData.fechaNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const m = hoy.getMonth() - fechaNacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
        edad--;
    }

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
                            <h1 className="text-3xl font-bold text-gray-900">
                                {pacienteData.nombrePaciente} {pacienteData.apellidoPaciente}
                            </h1>
                            <p className="text-gray-600">C.I. {pacienteData.cedulaPaciente}</p>
                        </div>
                    </div>
                    <Button onClick={() => router.push(`/datos-basicos/pacientes/${id}/editar`)} className="gap-2">
                        <Edit className="w-4 h-4" />
                        Editar Paciente
                    </Button>
                </div>

                {/* Información General */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-gray-600" />
                                <div>
                                    <p className="text-sm text-gray-600">Edad</p>
                                    <p className="text-lg font-semibold">{edad} años</p>
                                    <p className="text-xs text-gray-500">{new Date(pacienteData.fechaNacimiento).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <User className="w-5 h-5 text-gray-600" />
                                <div>
                                    <p className="text-sm text-gray-600">Sexo</p>
                                    <p className="text-lg font-semibold">{pacienteData.sexo === 'M' ? 'Masculino' : 'Femenino'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <MapPin className="w-5 h-5 text-gray-600" />
                                <div>
                                    <p className="text-sm text-gray-600">Comunidad</p>
                                    <p className="text-lg font-semibold">{pacienteData.codigoComunidad}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-gray-600" />
                                <div>
                                    <p className="text-sm text-gray-600">Teléfono</p>
                                    <p className="text-lg font-semibold">{pacienteData.telefonoPaciente || 'N/A'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="consultas" className="w-full">
                    <TabsList>
                        <TabsTrigger value="consultas">Historial Consultas</TabsTrigger>
                        <TabsTrigger value="datos">Datos Personales</TabsTrigger>
                    </TabsList>

                    <TabsContent value="consultas">
                        <Card>
                            <CardHeader>
                                <CardTitle>Consultas Recientes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {history && history.length > 0 ? (
                                    <ul className="space-y-4">
                                        {history.map((item: any, idx: number) => (
                                            <li key={idx} className="border-b last:border-0 pb-4 last:pb-0">
                                                <p className="font-semibold text-gray-800">{item.descripcion}</p>
                                                <p className="text-sm text-gray-500">
                                                    Fecha: {item.fecha ? new Date(item.fecha).toLocaleDateString() : 'N/A'}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <EmptyState
                                        icon="info"
                                        title="Sin consultas registradas"
                                        description="Este paciente no tiene consultas recientes."
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="datos" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Información Completa</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Dirección</p>
                                        <p className="text-base">{pacienteData.direccionPaciente || 'No registrada'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Jefe de Familia</p>
                                        <p className="text-base">{pacienteData.jefeFamilia ? 'Sí' : 'No'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </MainLayout>
    );
}
