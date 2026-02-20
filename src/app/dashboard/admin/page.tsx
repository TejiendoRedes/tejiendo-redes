'use client';

import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FileText, Activity, Clock, Check, X, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
    const [pendingAspirantes, setPendingAspirantes] = useState<any[]>([]);
    const [stats, setStats] = useState({ pendingAspirantes: 0, activeAbordajes: 0, totalConsultas: 0 });
    const [recentAbordajes, setRecentAbordajes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch pending aspirantes
                const pendingRes = await fetch('/api/admin/pending-aspirantes');
                const pendingData = await pendingRes.json();
                setPendingAspirantes(pendingData.aspirantes || []);

                // Fetch dashboard stats
                const statsRes = await fetch('/api/admin/stats');
                const statsData = await statsRes.json();
                if (statsData.stats) setStats(statsData.stats);
                if (statsData.recentAbordajes) setRecentAbordajes(statsData.recentAbordajes);

            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleApproval = async (cedulaAspirante: string, approve: boolean) => {
        try {
            const res = await fetch('/api/admin/approve-aspirante', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cedulaAspirante, approve })
            });
            if (res.ok) {
                setPendingAspirantes(prev => prev.filter(a => a.cedulaAspirante !== cedulaAspirante));
                setStats(prev => ({ ...prev, pendingAspirantes: Math.max(0, prev.pendingAspirantes - 1) }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <MainLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Panel de Administración</h1>
                    <p className="text-muted-foreground mt-1">
                        Gestión operativa de aspirantes y coordinación de abordajes.
                    </p>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Aspirantes Pendientes</CardTitle>
                            <Users className="w-4 h-4 text-warning" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pendingAspirantes}</div>
                            <Link href="#approvals" className="text-xs text-warning hover:underline">Ver solicitudes abajo</Link>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Abordajes Activos</CardTitle>
                            <Activity className="w-4 h-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.activeAbordajes}</div>
                            <p className="text-xs text-muted-foreground">En curso o planificados</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Reportes Generados</CardTitle>
                            <FileText className="w-4 h-4 text-success" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalConsultas}</div>
                            <p className="text-xs text-muted-foreground">Histórico total</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Approval Section */}
                <Card id="approvals">
                    <CardHeader>
                        <CardTitle>Nuevas Solicitudes de Registro (Aspirantes)</CardTitle>
                        <CardDescription>Revisar y gestionar las solicitudes de nuevos aspirantes que desean unirse a la red</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground" /></div>
                        ) : pendingAspirantes.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">No hay solicitudes de aspirantes pendientes.</p>
                        ) : (
                            <div className="space-y-4">
                                {pendingAspirantes.map(asp => (
                                    <div key={asp.cedulaAspirante} className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-slate-100">
                                        <div className="space-y-1">
                                            <p className="font-bold text-slate-800">{asp.nombreAspirante} {asp.apellidoAspirante}</p>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                                                <span><span className="font-medium">Cédula:</span> {asp.cedulaAspirante}</span>
                                                <span><span className="font-medium">Teléfono:</span> {asp.telefonoAspirante}</span>
                                                <span><span className="font-medium">Fecha:</span> {new Date(asp.fechaPostulacion).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 line-clamp-1"><span className="font-medium">Profesión:</span> {asp.profesionAspirante}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="default"
                                                className="bg-emerald-500 hover:bg-emerald-600 h-8 gap-1"
                                                onClick={() => handleApproval(asp.cedulaAspirante, true)}
                                            >
                                                <Check className="w-4 h-4" /> Aprobar
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-destructive hover:bg-destructive/5 h-8 gap-1"
                                                onClick={() => handleApproval(asp.cedulaAspirante, false)}
                                            >
                                                <X className="w-4 h-4" /> Rechazar
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Gestión Operativa</CardTitle>
                            <CardDescription>Accesos directos a módulos de control</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <Link href="/datos-basicos/tejedores" className="w-full">
                                <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                                    <Users className="w-6 h-6" />
                                    Lista Tejedores
                                </Button>
                            </Link>
                            <Link href="/abordajes" className="w-full">
                                <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                                    <Clock className="w-6 h-6" />
                                    Jornadas
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Abordajes Recientes</CardTitle>
                            <CardDescription>Últimas jornadas comunitarias</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentAbordajes.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">No hay abordajes registrados.</p>
                                ) : (
                                    recentAbordajes.map((arb) => (
                                        <div key={arb.codigo} className="flex items-center justify-between text-sm p-3 bg-white/50 border rounded-lg hover:bg-white/80 transition-colors">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{arb.comunidad}</span>
                                                <span className="text-[10px] text-muted-foreground uppercase">{arb.estado}</span>
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(arb.fecha).toLocaleDateString()}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
}
