'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  CalendarHeart,
  Pill,
  Stethoscope,
  TrendingUp,
  MapPin,
  Clock,
  Check,
  X,
  Loader2
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import { PageShell } from '@/components/layout/PageShell';
import { MetricCard } from '@/components/ui/MetricCard'; 
import { StatusBadge } from '@/components/ui/StatusBadge'; 
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';

// Move prototype components to ui-kit later or update imports:
// For now I'll import from prototype but in the cleanup I'll move them.

const monthly = [
  { m: "Ene", pacientes: 240, consultas: 180 },
  { m: "Feb", pacientes: 310, consultas: 250 },
  { m: "Mar", pacientes: 290, consultas: 230 },
  { m: "Abr", pacientes: 410, consultas: 360 },
  { m: "May", pacientes: 480, consultas: 420 },
  { m: "Jun", pacientes: 520, consultas: 470 },
];

const byArea = [
  { area: "Pediatría", n: 320 },
  { area: "Medicina Gral.", n: 410 },
  { area: "Nutrición", n: 180 },
  { area: "Psicología", n: 140 },
  { area: "Ginecología", n: 95 },
];

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
            <PageShell
                title="Panel de Administración"
                subtitle="Gestión operativa de aspirantes y coordinación de abordajes."
            >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard 
                        label="Aspirantes Pendientes" 
                        value={stats.pendingAspirantes.toString()} 
                        icon={Users} 
                        tone="yellow" 
                        delta={0} 
                        hint="Por revisar" 
                    />
                    <MetricCard 
                        label="Abordajes Activos" 
                        value={stats.activeAbordajes.toString()} 
                        icon={CalendarHeart} 
                        tone="sky" 
                        delta={2} 
                        hint="En curso o planificados" 
                    />
                    <MetricCard 
                        label="Reportes Históricos" 
                        value={stats.totalConsultas.toString()} 
                        icon={Stethoscope} 
                        tone="success" 
                        delta={5} 
                        hint="Total de consultas" 
                    />
                    <MetricCard 
                        label="Medicamentos Entregados" 
                        value="6.320" 
                        icon={Pill} 
                        tone="yellow" 
                        delta={-3} 
                        hint="Unidades (demo)" 
                    />
                </div>

                <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-2 rounded-3xl shadow-sm border-slate-100">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-blue-600" />
                                <div>
                                    <CardTitle>Atención mensual</CardTitle>
                                    <CardDescription>Pacientes y consultas registradas</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={monthly} margin={{ left: -16, right: 8, top: 8 }}>
                                        <defs>
                                            <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#2563eb" stopOpacity={0.35} />
                                                <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.35} />
                                                <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                        <XAxis dataKey="m" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: 12,
                                                border: "1px solid #e2e8f0",
                                                background: "#ffffff",
                                                fontSize: 13,
                                            }}
                                        />
                                        <Area type="monotone" dataKey="pacientes" stroke="#2563eb" strokeWidth={2.5} fill="url(#gp)" />
                                        <Area type="monotone" dataKey="consultas" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#gc)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl shadow-sm border-slate-100">
                        <CardHeader>
                            <CardTitle>Nuevas Solicitudes (Aspirantes)</CardTitle>
                            <CardDescription>Revisar aspirantes pendientes</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground" /></div>
                            ) : pendingAspirantes.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">No hay solicitudes pendientes.</p>
                            ) : (
                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                                    {pendingAspirantes.map(asp => (
                                        <div key={asp.cedulaAspirante} className="flex flex-col p-4 bg-slate-50 rounded-xl border border-slate-100 gap-3">
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm">{asp.nombreAspirante} {asp.apellidoAspirante}</p>
                                                <p className="text-xs text-slate-500">C.I: {asp.cedulaAspirante}</p>
                                                <p className="text-xs text-slate-500 line-clamp-1">{asp.profesionAspirante}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 h-8 flex-1" onClick={() => handleApproval(asp.cedulaAspirante, true)}>
                                                    <Check className="w-4 h-4 mr-1" /> Aprobar
                                                </Button>
                                                <Button size="sm" variant="outline" className="text-red-500 hover:bg-red-50 h-8 flex-1" onClick={() => handleApproval(asp.cedulaAspirante, false)}>
                                                    <X className="w-4 h-4 mr-1" /> Rechazar
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-6">
                    <Card className="rounded-3xl shadow-sm border-slate-100">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-blue-600" />
                                <div>
                                    <CardTitle>Abordajes recientes</CardTitle>
                                    <CardDescription>Jornadas comunitarias activas y programadas</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ul className="divide-y divide-slate-100">
                                {recentAbordajes.length === 0 ? (
                                    <p className="text-sm text-slate-500 text-center py-4">No hay abordajes registrados.</p>
                                ) : (
                                    recentAbordajes.map((a) => (
                                        <li key={a.codigo || a.comunidad} className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0">
                                            <div className="flex items-center gap-3">
                                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                                    <MapPin className="h-5 w-5" />
                                                </span>
                                                <div>
                                                    <p className="font-semibold text-slate-900">{a.comunidad}</p>
                                                    <p className="flex items-center gap-1.5 text-sm text-slate-500">
                                                        <Clock className="h-3.5 w-3.5" /> {new Date(a.fecha).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <StatusBadge
                                                    tone={a.estado === "Completado" || a.estado === "completado" ? "success" : a.estado === "planificado" ? "warning" : "blue"}
                                                >
                                                    {a.estado}
                                                </StatusBadge>
                                            </div>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </PageShell>
        </MainLayout>
    );
}
