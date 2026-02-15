import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExecutiveTab } from '@/components/dashboard/ExecutiveTab';
import { EpidemiologyTab } from '@/components/dashboard/EpidemiologyTab';
import { PharmacyTab } from '@/components/dashboard/PharmacyTab';
import { OperationsTab } from '@/components/dashboard/OperationsTab';
import {
    getDashboardFilters,
    getExecutiveKPIs,
    getEpidemiologicalData,
    getPharmacyData,
    getOperationsData,
    type DashboardFilters as FilterType,
} from '@/actions/dashboard';

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function EstadisticasPage(props: PageProps) {
    const searchParams = await props.searchParams;
    const filters: FilterType = {
        fechaInicio: searchParams.fechaInicio as string,
        fechaFin: searchParams.fechaFin as string,
        comunidad: searchParams.comunidad as string,
    };

    // Parallel Data Fetching
    const [
        communities,
        executiveData,
        epidemiologyData,
        pharmacyData,
        operationsData
    ] = await Promise.all([
        getDashboardFilters(),
        getExecutiveKPIs(filters),
        getEpidemiologicalData(filters),
        getPharmacyData(filters),
        getOperationsData(filters),
    ]);

    return (
        <MainLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Estadísticas y Reportes</h1>
                    <p className="text-gray-500 mt-1">
                        Análisis detallado de indicadores estratégicos y operativos.
                    </p>
                </div>

                <DashboardFilters communities={communities} />

                <Tabs defaultValue="executive" className="space-y-6">
                    <TabsList className="bg-white p-1 border rounded-lg h-auto grid grid-cols-2 md:grid-cols-4 gap-2">
                        <TabsTrigger value="executive" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 py-2">Resumen Ejecutivo</TabsTrigger>
                        <TabsTrigger value="epidemiology" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 py-2">Perfil Epidemiológico</TabsTrigger>
                        <TabsTrigger value="pharmacy" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 py-2">Farmacia e Insumos</TabsTrigger>
                        <TabsTrigger value="operations" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 py-2">Operatividad</TabsTrigger>
                    </TabsList>

                    <TabsContent value="executive">
                        <ExecutiveTab data={executiveData} />
                    </TabsContent>

                    <TabsContent value="epidemiology">
                        <EpidemiologyTab data={epidemiologyData} />
                    </TabsContent>

                    <TabsContent value="pharmacy">
                        <PharmacyTab data={pharmacyData} />
                    </TabsContent>

                    <TabsContent value="operations">
                        <OperationsTab data={operationsData} />
                    </TabsContent>
                </Tabs>
            </div>
        </MainLayout>
    );
}
