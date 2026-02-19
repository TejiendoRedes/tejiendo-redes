'use client';

import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FileText, Activity, Clock, Check, X, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
    const [pendingUsers, setPendingUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/pending-users')
            .then(res => res.json())
            .then(data => {
                setPendingUsers(data.users || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleApproval = async (userId: number, approve: boolean) => {
        try {
            const res = await fetch('/api/admin/approve-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, approve })
            });
            if (res.ok) {
                setPendingUsers(prev => prev.filter(u => u.id !== userId));
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
                        Gestión operativa de tejedores y coordinación de abordajes.
                    </p>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Tejedores Pendientes</CardTitle>
                            <Users className="w-4 h-4 text-warning" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{pendingUsers.length}</div>
                            <Link href="#approvals" className="text-xs text-warning hover:underline">Ver solicitudes abajo</Link>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Abordajes Activos</CardTitle>
                            <Activity className="w-4 h-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">3</div>
                            <p className="text-xs text-muted-foreground">En curso actualmente</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Reportes Generados</CardTitle>
                            <FileText className="w-4 h-4 text-success" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">45</div>
                            <p className="text-xs text-muted-foreground">Este mes</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Approval Section */}
                <Card id="approvals">
                    <CardHeader>
                        <CardTitle>Nuevas Solicitudes de Registro</CardTitle>
                        <CardDescription>Aprobar o rechazar nuevos tejedores en el sistema</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground" /></div>
                        ) : pendingUsers.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">No hay solicitudes pendientes.</p>
                        ) : (
                            <div className="space-y-4">
                                {pendingUsers.map(user => (
                                    <div key={user.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-slate-100">
                                        <div>
                                            <p className="font-bold text-slate-800">{user.username}</p>
                                            <p className="text-xs text-slate-500">Cédula: {user.cedulaTejedor} | Registrado: {new Date(user.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="default"
                                                className="bg-emerald-500 hover:bg-emerald-600 h-8 gap-1"
                                                onClick={() => handleApproval(user.id, true)}
                                            >
                                                <Check className="w-4 h-4" /> Aprobar
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-destructive hover:bg-destructive/5 h-8 gap-1"
                                                onClick={() => handleApproval(user.id, false)}
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
                                {['Barrio El Sol', 'Comunidad Las Rosas'].map((place) => (
                                    <div key={place} className="flex items-center justify-between text-sm p-3 bg-white/50 border rounded-lg">
                                        <span className="font-medium">{place}</span>
                                        <span className="text-xs text-muted-foreground">12-02-2024</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
}
