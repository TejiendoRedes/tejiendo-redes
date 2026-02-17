import React from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Users, BarChart3, Pill } from 'lucide-react';

export default function DashboardPage() {
    return (
        <MainLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Bienvenido a Tejiendo Redes</h1>
                    <p className="text-muted-foreground mt-1">
                        Sistema de Gestión de Abordajes Médicos Comunitarios.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Accesos Directos */}
                    <Link href="/abordajes" className="block hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
                        <Card className="h-full cursor-pointer border-l-4 border-l-primary/50">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Gestión de Abordajes</CardTitle>
                                <Activity className="w-4 h-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-primary">Jornadas</div>
                                <p className="text-xs text-muted-foreground/70 mt-1">Planificación y ejecución</p>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/estadisticas" className="block hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
                        <Card className="h-full cursor-pointer border-l-4 border-l-info/50">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Inteligencia de Negocios</CardTitle>
                                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-primary">Estadísticas</div>
                                <p className="text-xs text-muted-foreground/70 mt-1">Dashboards y reportes KPI</p>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/datos-basicos/pacientes" className="block hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
                        <Card className="h-full cursor-pointer border-l-4 border-l-success/50">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Pacientes</CardTitle>
                                <Users className="w-4 h-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-primary">Comunidad</div>
                                <p className="text-xs text-muted-foreground/70 mt-1">Registro y control</p>
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                {/* Accesos Rápidos */}
                <Card>
                    <CardHeader>
                        <CardTitle>Accesos Rápidos</CardTitle>
                        <CardDescription>Operaciones frecuentes en el sistema</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <Link href="/abordajes/nuevo" className="block">
                            <Button variant="outline" className="w-full h-20 flex flex-col gap-2 hover:bg-accent hover:scale-[1.02] transition-all">
                                <Activity className="w-6 h-6 text-primary" />
                                Nuevo Abordaje
                            </Button>
                        </Link>
                        <Link href="/datos-basicos/pacientes?action=new" className="block">
                            <Button variant="outline" className="w-full h-20 flex flex-col gap-2 hover:bg-accent hover:scale-[1.02] transition-all">
                                <Users className="w-6 h-6 text-success" />
                                Registrar Paciente
                            </Button>
                        </Link>
                        <Link href="/farmacia/medicamentos" className="block">
                            <Button variant="outline" className="w-full h-20 flex flex-col gap-2 hover:bg-accent hover:scale-[1.02] transition-all">
                                <Pill className="w-6 h-6 text-destructive" />
                                Inventario Farmacia
                            </Button>
                        </Link>
                        <Link href="/estadisticas" className="block">
                            <Button variant="outline" className="w-full h-20 flex flex-col gap-2 hover:bg-accent hover:scale-[1.02] transition-all">
                                <BarChart3 className="w-6 h-6 text-info" />
                                Ver Reportes
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}
