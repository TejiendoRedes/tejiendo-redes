'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowUpRight, ArrowDownRight, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface KardexClientProps {
    medicamento: any;
    movimientos: any[];
}

export default function KardexClient({ medicamento, movimientos }: KardexClientProps) {
    const router = useRouter();

    const formatCurrency = (val: number) => {
        return Number(val || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <MainLayout>
            <PageShell 
                title={`Kardex: ${medicamento.nombreMedicamento}`}
                subtitle={`Historial de movimientos de inventario - Código: ${medicamento.codigoMedicamento}`}
                actions={
                    <Button
                        variant="outline"
                        onClick={() => router.push('/farmacia/medicamentos')}
                        className="bg-white"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver a Medicamentos
                    </Button>
                }
            >
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-1">Presentación</h3>
                        <p className="font-medium text-gray-900">{medicamento.presentacion}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-1">Costo Actual (Bs)</h3>
                        <p className="font-medium text-gray-900">{formatCurrency(medicamento.precio)}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-1">Existencia Total</h3>
                        <p className="text-2xl font-bold text-blue-700">{medicamento.existencia} unidades</p>
                    </div>
                </div>

                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-gray-500" />
                        <h3 className="font-bold text-lg text-gray-900">Registro de Movimientos</h3>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Fecha</th>
                                    <th scope="col" className="px-6 py-3">Tipo</th>
                                    <th scope="col" className="px-6 py-3 text-center">Cantidad</th>
                                    <th scope="col" className="px-6 py-3">Motivo</th>
                                    <th scope="col" className="px-6 py-3">Referencia</th>
                                    <th scope="col" className="px-6 py-3">Costo (Bs)</th>
                                    <th scope="col" className="px-6 py-3">Usuario</th>
                                </tr>
                            </thead>
                            <tbody>
                                {movimientos.length > 0 ? movimientos.map((mov) => (
                                    <tr key={mov.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {format(new Date(mov.fechaMovimiento), "d MMM yyyy, HH:mm", { locale: es })}
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
                                        <td className="px-6 py-4 text-center font-bold">
                                            {mov.tipo === 'entrada' ? <span className="text-green-600">+{mov.cantidad}</span> : <span className="text-red-600">-{mov.cantidad}</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            {mov.motivo}
                                            {mov.notas && (
                                                <p className="text-xs text-gray-400 mt-1 max-w-xs truncate" title={mov.notas}>{mov.notas}</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {mov.notas || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {formatCurrency(mov.costoUnitario)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {mov.tejedor ? `${mov.tejedor.nombre} ${mov.tejedor.apellido}` : 'Sistema'}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                            No hay movimientos registrados para este medicamento.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </PageShell>
        </MainLayout>
    );
}
