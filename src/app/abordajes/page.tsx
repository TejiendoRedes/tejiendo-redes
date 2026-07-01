import React from 'react';
import { getAbordajes } from '@/queries/abordajes';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageShell } from '@/components/layout/PageShell';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, HeartHandshake, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/components/shared/UIComponents';

function getStatusStyles(estado: string) {
    switch (estado) {
        case 'Programado': return 'bg-amber-100 text-amber-800 border-amber-200';
        case 'Confirmado': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'En curso': return 'bg-purple-100 text-purple-800 border-purple-200';
        case 'Finalizado': return 'bg-green-100 text-green-800 border-green-200';
        case 'Cancelado': return 'bg-red-100 text-red-800 border-red-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
}

export default async function AbordajesPage() {
    const result = await getAbordajes();
    const abordajes = result.success ? result.data : [];

    return (
        <MainLayout>
            <PageShell 
                title="Abordaje Tejiendo Redes" 
                subtitle="Gestión de jornadas comunitarias y atenciones en campo"
                actions={
                    <Link 
                        href="/abordajes/solicitudes-abordajes" 
                        className="inline-flex items-center gap-2 rounded-xl bg-[#1e3a8a] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800"
                    >
                        <HeartHandshake className="h-4 w-4" />
                        Ver Solicitudes
                    </Link>
                }
            >
                {abordajes && abordajes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {abordajes.map((item: any) => {
                            const abordaje = item.abordaje;
                            const comunidad = item.comunidad;
                            return (
                                <Link href={`/abordajes/${abordaje.codigoAbordaje}`} key={abordaje.codigoAbordaje}>
                                    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer">
                                        <div className="mb-4 flex items-start justify-between gap-4">
                                            <div className="space-y-1.5">
                                                <h3 className="font-bold text-[#1e293b] text-lg leading-tight group-hover:text-blue-600 transition-colors">
                                                    {abordaje.descripcion}
                                                </h3>
                                                <p className="text-sm font-medium text-gray-400">
                                                    {abordaje.codigoAbordaje}
                                                </p>
                                            </div>
                                            <Badge variant="outline" className={`px-2.5 py-1 text-xs font-semibold rounded-full shrink-0 ${getStatusStyles(abordaje.estado)}`}>
                                                {abordaje.estado}
                                            </Badge>
                                        </div>

                                        <div className="mt-2 space-y-3 flex-1">
                                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                                    <Calendar className="h-4 w-4" />
                                                </div>
                                                <span className="font-medium text-gray-700">{new Date(abordaje.fechaAbordaje).toLocaleDateString('es-VE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                            </div>

                                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                                                    <Clock className="h-4 w-4" />
                                                </div>
                                                <span className="font-medium text-gray-700">
                                                    {abordaje.horaInicio.slice(0, 5)} - {abordaje.horaFin.slice(0, 5)}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                                                    <MapPin className="h-4 w-4" />
                                                </div>
                                                <span className="font-medium text-gray-700 truncate">
                                                    {comunidad ? `${comunidad.nombreComunidad} (${comunidad.estado})` : 'Sin comunidad asignada'}
                                                </span>
                                            </div>

                                            {abordaje.participantesEstimados > 0 && (
                                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 text-purple-600">
                                                        <Users className="h-4 w-4" />
                                                    </div>
                                                    <span className="font-medium text-gray-700">
                                                        {abordaje.participantesEstimados} est.
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-6 pt-4 flex items-center justify-between border-t border-gray-100">
                                            {abordaje.tipoAbordaje ? (
                                                <span className="inline-flex items-center rounded-lg bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-600">
                                                    {abordaje.tipoAbordaje}
                                                </span>
                                            ) : <div />}
                                            <span className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 opacity-0 transition-opacity group-hover:opacity-100">
                                                Ver detalles <ArrowRight className="h-4 w-4" />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="mt-8">
                        <EmptyState
                            icon="info"
                            title="No hay abordajes"
                            description="No se han registrado abordajes comunitarios aún."
                            action={{
                                label: 'Gestionar Solicitudes',
                                href: '/abordajes/solicitudes-abordajes'
                            }}
                        />
                    </div>
                )}
            </PageShell>
        </MainLayout>
    );
}
