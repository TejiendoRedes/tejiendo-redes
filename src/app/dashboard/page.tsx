'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Users, ClipboardList, BarChart3, Pill } from 'lucide-react';

export default function DashboardPage() {
    const router = useRouter();

    return (
        <MainLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Bienvenido a Tejiendo Redes</h1>
                    <p className="text-gray-500 mt-1">
                        Sistema de Gestión de Abordajes Médicos Comunitarios.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Accesos Directos */}
                    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/abordajes')}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium text-gray-500">Gestión de Abordajes</CardTitle>
                            <Activity className="w-4 h-4 text-gray-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">Jornadas</div>
                            <p className="text-xs text-gray-400 mt-1">Planificación y ejecución</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/estadisticas')}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium text-gray-500">Inteligencia de Negocios</CardTitle>
                            <BarChart3 className="w-4 h-4 text-gray-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">Estadísticas</div>
                            <p className="text-xs text-gray-400 mt-1">Dashboards y reportes KPI</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/datos-basicos/pacientes')}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium text-gray-500">Pacientes</CardTitle>
                            <Users className="w-4 h-4 text-gray-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">Comunidad</div>
                            <p className="text-xs text-gray-400 mt-1">Registro y control</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Accesos Rápidos */}
                <Card>
                    <CardHeader>
                        <CardTitle>Accesos Rápidos</CardTitle>
                        <CardDescription>Operaciones frecuentes en el sistema</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => router.push('/abordajes/nuevo')}>
                            <Activity className="w-6 h-6 text-blue-500" />
                            Nuevo Abordaje
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => router.push('/datos-basicos/pacientes?action=new')}>
                            <Users className="w-6 h-6 text-green-500" />
                            Registrar Paciente
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => router.push('/farmacia/medicamentos')}>
                            <Pill className="w-6 h-6 text-rose-500" />
                            Inventario Farmacia
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => router.push('/estadisticas')}>
                            <BarChart3 className="w-6 h-6 text-purple-500" />
                            Ver Reportes
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}
