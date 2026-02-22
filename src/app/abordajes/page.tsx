import React from 'react';
import { getAbordajes } from '@/queries/abordajes';;
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Clock, MapPin, Users } from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/components/shared/UIComponents';

export default async function AbordajesPage() {
    const result = await getAbordajes();
    const abordajes = result.success ? result.data : [];

    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Abordaje Tejiendo Redes</h1>
                        <p className="text-gray-600 mt-2">Gestión de abordajes comunitarios</p>
                    </div>

                </div>

                {abordajes && abordajes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {abordajes.map((item) => {
                            const abordaje = item.abordaje;
                            const comunidad = item.comunidad;
                            return (
                                <Link href={`/abordajes/${abordaje.codigoAbordaje}`} key={abordaje.codigoAbordaje}>
                                    <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                            <div className="space-y-1">
                                                <CardTitle className="text-base font-medium">
                                                    {abordaje.descripcion}
                                                </CardTitle>
                                                <p className="text-xs text-muted-foreground">{abordaje.codigoAbordaje}</p>
                                                <p className="text-xs text-blue-600 font-medium">
                                                    {comunidad?.nombreComunidad || 'Sin comunidad asignada'}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <Badge
                                                    variant={
                                                        abordaje.estado === 'Finalizado'
                                                            ? 'default'
                                                            : abordaje.estado === 'Confirmado'
                                                                ? 'secondary'
                                                                : abordaje.estado === 'Cancelado'
                                                                    ? 'destructive'
                                                                    : 'outline'
                                                    }
                                                >
                                                    {abordaje.estado}
                                                </Badge>
                                                {abordaje.tipoAbordaje && (
                                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                                        {abordaje.tipoAbordaje}
                                                    </span>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2 text-sm text-gray-600 mt-4">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{new Date(abordaje.fechaAbordaje).toLocaleDateString('es-VE')}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4" />
                                                    <span>
                                                        {abordaje.horaInicio} - {abordaje.horaFin}
                                                    </span>
                                                </div>
                                                {abordaje.participantesEstimados && (
                                                    <div className="flex items-center gap-2" title="Participantes Estimados">
                                                        <Users className="w-4 h-4" />
                                                        <span>{abordaje.participantesEstimados} est.</span>
                                                    </div>
                                                )}
                                                {comunidad && (
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="w-4 h-4" />
                                                        <span>{comunidad.estado}, {comunidad.municipio}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <EmptyState
                        icon="info"
                        title="No hay abordajes"
                        description="No se han registrado abordajes comunitarios aún."
                        action={{
                            label: 'Ir a Solicitudes',
                            href: '/abordajes/solicitudes-abordajes'
                        }}
                    />
                )}
            </div>
        </MainLayout>
    );
}
