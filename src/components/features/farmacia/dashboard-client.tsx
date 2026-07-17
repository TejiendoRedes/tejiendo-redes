'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageShell } from '@/components/layout/PageShell';
import { Package, Heart, AlertCircle, CheckCircle, BarChart3, Pill, ArrowRightLeft, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface FarmaciaDashboardClientProps {
    metrics: any;
}

export default function FarmaciaDashboardClient({ metrics }: FarmaciaDashboardClientProps) {
    const formatCurrency = (val: number) => {
        return Number(val || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <MainLayout>
            <PageShell 
                title="Dashboard de Farmacia" 
                subtitle="Métricas y estadísticas del inventario de medicamentos"
            >
                {/* Primera Fila: KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="group flex flex-col bg-white border border-gray-100 shadow-sm rounded-2xl p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Medicamentos Únicos</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {metrics.totalMedicamentos}
                                </p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100">
                                <Pill className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    <div className="group flex flex-col bg-white border border-gray-100 shadow-sm rounded-2xl p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Stock Total</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {metrics.totalUnidadesFisicas.toLocaleString('es-VE')}
                                </p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600 transition-colors group-hover:bg-green-100">
                                <Package className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    <div className="group flex flex-col bg-white border border-gray-100 shadow-sm rounded-2xl p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Valor Estimado (Bs)</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {formatCurrency(metrics.valorTotalInventario)}
                                </p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50 text-purple-600 transition-colors group-hover:bg-purple-100">
                                <BarChart3 className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    <div className="group flex flex-col bg-white border border-gray-100 shadow-sm rounded-2xl p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Peticiones Pendientes</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {metrics.peticionesPendientes}
                                </p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-600 transition-colors group-hover:bg-orange-100">
                                <Clock className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Segunda Fila: Alertas y Estado de Inventario */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-100 text-red-600 rounded-full">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-red-900">Agotados</h3>
                        </div>
                        <p className="text-4xl font-bold text-red-700">{metrics.medicamentosAgotados}</p>
                        <p className="text-sm text-red-600 mt-2">Medicamentos sin existencia</p>
                    </div>

                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-amber-100 text-amber-600 rounded-full">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-amber-900">Stock Crítico</h3>
                        </div>
                        <p className="text-4xl font-bold text-amber-700">{metrics.medicamentosStockBajo}</p>
                        <p className="text-sm text-amber-600 mt-2">Menos de 20 unidades</p>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full">
                                <CheckCircle className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-emerald-900">Stock Óptimo</h3>
                        </div>
                        <p className="text-4xl font-bold text-emerald-700">{metrics.medicamentosStockOptimo}</p>
                        <p className="text-sm text-emerald-600 mt-2">50 o más unidades</p>
                    </div>
                </div>

                {/* Movimientos Recientes */}
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center gap-2">
                        <ArrowRightLeft className="w-5 h-5 text-gray-500" />
                        <h3 className="font-bold text-lg text-gray-900">Últimos Movimientos de Kardex</h3>
                    </div>
                    <div className="p-0">
                        {metrics.ultimosMovimientos.length > 0 ? (
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Fecha</th>
                                        <th scope="col" className="px-6 py-3">Medicamento</th>
                                        <th scope="col" className="px-6 py-3">Tipo</th>
                                        <th scope="col" className="px-6 py-3">Cant.</th>
                                        <th scope="col" className="px-6 py-3">Motivo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {metrics.ultimosMovimientos.map((mov: any) => (
                                        <tr key={mov.id} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {format(new Date(mov.fechaMovimiento), "d 'de' MMMM, HH:mm", { locale: es })}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                                {mov.codigoMedicamento}
                                            </td>
                                            <td className="px-6 py-4">
                                                {mov.tipo === 'entrada' ? (
                                                    <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-semibold">
                                                        <ArrowDownRight className="w-3 h-3" /> Entrada
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-semibold">
                                                        <ArrowUpRight className="w-3 h-3" /> Salida
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-bold">
                                                {mov.tipo === 'entrada' ? '+' : '-'}{mov.cantidad}
                                            </td>
                                            <td className="px-6 py-4">
                                                {mov.motivo}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-6 text-center text-gray-500">
                                No hay movimientos recientes registrados en el Kardex.
                            </div>
                        )}
                    </div>
                </div>

            </PageShell>
        </MainLayout>
    );
}
