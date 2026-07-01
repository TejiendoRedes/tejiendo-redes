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
  Loader2,
  PieChart
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
import { ShieldAlert } from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell';
import { MetricCard } from '@/components/ui/MetricCard'; 
import { StatusBadge } from '@/components/ui/StatusBadge'; 
import { Card } from '@/components/ui-kit/form';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/layout/MainLayout';

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
    const [stats, setStats] = useState({ 
        pendingAspirantes: 0, 
        activeAbordajes: 0, 
        totalConsultas: 0,
        totalPacientes: 0,
        totalMedicamentos: 0
    });
    const [recentAbordajes, setRecentAbordajes] = useState<any[]>([]);
    const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([]);
    const [topMorbilidades, setTopMorbilidades] = useState<any[]>([]);
    const [monthlyData, setMonthlyData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const pendingRes = await fetch('/api/admin/pending-aspirantes');
                const pendingData = await pendingRes.json();
                setPendingAspirantes(pendingData.aspirantes || []);

                const statsRes = await fetch('/api/admin/stats');
                const statsData = await statsRes.json();
                if (statsData.stats) setStats(statsData.stats);
                if (statsData.recentAbordajes) setRecentAbordajes(statsData.recentAbordajes);
                if (statsData.lowStockAlerts) setLowStockAlerts(statsData.lowStockAlerts);
                if (statsData.topMorbilidades) setTopMorbilidades(statsData.topMorbilidades);
                if (statsData.monthlyStats) setMonthlyData(statsData.monthlyStats);
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
                title="Resumen General"
                subtitle="Indicadores de impacto · Fundación Tejiendo Redes"
            >
                {loading ? (
                    <div className="flex min-h-[40vh] items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <MetricCard label="Total de Pacientes" value={stats.totalPacientes.toString()} icon={Users} tone="blue" />
                            <MetricCard label="Consultas Realizadas" value={stats.totalConsultas.toString()} icon={Stethoscope} tone="sky" />
                            <MetricCard label="Abordajes Activos" value={stats.activeAbordajes.toString()} icon={CalendarHeart} tone="success" hint="En curso o planificados" />
                            <MetricCard label="Medicamentos Entregados" value={stats.totalMedicamentos.toString()} icon={Pill} tone="yellow" />
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                            <Card
                                title="Atención mensual"
                                description="Pacientes y consultas registradas"
                                icon={<TrendingUp className="h-5 w-5" />}
                                className="lg:col-span-2"
                            >
                                <div className="h-72 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={monthlyData} margin={{ left: -16, right: 8, top: 8 }}>
                                            <defs>
                                                <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#1e3a8a" stopOpacity={0.4} />
                                                    <stop offset="100%" stopColor="#1e3a8a" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                            <XAxis dataKey="m" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                                            <Tooltip
                                                contentStyle={{
                                                    borderRadius: 12,
                                                    border: "1px solid var(--color-border)",
                                                    background: "var(--color-card)",
                                                    fontSize: 13,
                                                }}
                                            />
                                            <Area type="monotone" dataKey="pacientes" stroke="#1e3a8a" strokeWidth={3} fill="url(#gp)" />
                                            <Area type="monotone" dataKey="consultas" stroke="#3b82f6" strokeWidth={3} fill="url(#gc)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>

                            <Card title="Principales Morbilidades" description="Diagnósticos más frecuentes">
                                <div className="h-72 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={topMorbilidades} layout="vertical" margin={{ left: 8, right: 16 }}>
                                            <XAxis type="number" hide />
                                            <YAxis type="category" dataKey="area" width={92} stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                                            <Tooltip
                                                cursor={{ fill: "var(--color-muted)" }}
                                                contentStyle={{
                                                    borderRadius: 12,
                                                    border: "1px solid var(--color-border)",
                                                    background: "var(--color-card)",
                                                    fontSize: 13,
                                                }}
                                            />
                                            <Bar dataKey="n" fill="#1e3a8a" radius={[0, 8, 8, 0]} barSize={20} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </div>

                        <div className="mt-6">
                            <Card title="Abordajes recientes" description="Jornadas comunitarias activas y programadas" icon={<MapPin className="h-5 w-5" />}>
                                <ul className="divide-y divide-border">
                                    {recentAbordajes.length === 0 ? (
                                        <li className="py-4 text-center text-sm text-muted-foreground">No hay abordajes registrados.</li>
                                    ) : (
                                        recentAbordajes.map((a) => (
                                            <li key={a.codigo || a.comunidad} className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1e3a8a]/10 text-[#1e3a8a]">
                                                        <MapPin className="h-5 w-5" />
                                                    </span>
                                                    <div>
                                                        <p className="font-semibold text-foreground">{a.comunidad || a.lugar}</p>
                                                        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                            <Clock className="h-3.5 w-3.5" /> {new Date(a.fechaPlanificada || a.fecha).toLocaleDateString('es-VE')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-sm text-muted-foreground">
                                                        <span className="font-semibold text-foreground">{a.pacientes || 0}</span> pacientes
                                                    </span>
                                                    <StatusBadge
                                                        tone={a.estado === "Completado" || a.estado === "completado" ? "success" : a.estado === "En progreso" || a.estado === "planificado" ? "warning" : "blue"}
                                                    >
                                                        {a.estado}
                                                    </StatusBadge>
                                                </div>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            </Card>

                            <Card title="Solicitudes Pendientes" description="Nuevos voluntarios por revisar" icon={<Users className="h-5 w-5 text-[#1e3a8a]" />}>
                                <ul className="divide-y divide-border">
                                    {pendingAspirantes.length === 0 ? (
                                        <li className="py-4 text-center text-sm text-muted-foreground">No hay solicitudes de voluntarios pendientes.</li>
                                    ) : (
                                        pendingAspirantes.map((a) => (
                                            <li key={a.cedulaAspirante} className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                                        <Users className="h-5 w-5" />
                                                    </span>
                                                    <div>
                                                        <p className="font-semibold text-foreground text-sm">{a.nombreAspirante} {a.apellidoAspirante}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {a.profesionAspirante} • C.I. {a.cedulaAspirante}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button size="sm" variant="outline" className="h-8 px-2 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200" onClick={() => handleApproval(a.cedulaAspirante, false)}>
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" className="h-8 px-2 bg-[#1e3a8a] text-white hover:bg-blue-900" onClick={() => handleApproval(a.cedulaAspirante, true)}>
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            </Card>
                        </div>
                    </>
                )}
            </PageShell>
        </MainLayout>
    );
}
