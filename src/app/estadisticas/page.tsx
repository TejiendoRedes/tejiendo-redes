import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageShell } from '@/components/layout/PageShell';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExecutiveTab } from '@/components/dashboard/ExecutiveTab';
import { EpidemiologyTab } from '@/components/dashboard/EpidemiologyTab';
import { PharmacyTab } from '@/components/dashboard/PharmacyTab';
import { OperationsTab } from '@/components/dashboard/OperationsTab';
import { type DashboardFilters as FilterType, } from '@/actions/dashboard';
import { getDashboardFilters, getExecutiveKPIs, getEpidemiologicalData, getPharmacyData, getOperationsData } from '@/queries/dashboard';;

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
            <PageShell
                title="Indicadores y Estadísticas"
                subtitle="Análisis detallado de indicadores estratégicos y operativos."
            >
                <DashboardFilters communities={communities} />

                <Tabs defaultValue="executive" className="space-y-6 mt-6">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-white p-1.5 rounded-xl shadow-sm border border-gray-100 h-auto gap-1">
                        <TabsTrigger value="executive" className="rounded-lg py-2.5 font-medium data-[state=active]:bg-[#1e3a8a]/10 data-[state=active]:text-[#1e3a8a] data-[state=active]:shadow-sm transition-all">Resumen Ejecutivo</TabsTrigger>
                        <TabsTrigger value="epidemiology" className="rounded-lg py-2.5 font-medium data-[state=active]:bg-[#1e3a8a]/10 data-[state=active]:text-[#1e3a8a] data-[state=active]:shadow-sm transition-all">Perfil Epidemiológico</TabsTrigger>
                        <TabsTrigger value="pharmacy" className="rounded-lg py-2.5 font-medium data-[state=active]:bg-[#1e3a8a]/10 data-[state=active]:text-[#1e3a8a] data-[state=active]:shadow-sm transition-all">Farmacia e Insumos</TabsTrigger>
                        <TabsTrigger value="operations" className="rounded-lg py-2.5 font-medium data-[state=active]:bg-[#1e3a8a]/10 data-[state=active]:text-[#1e3a8a] data-[state=active]:shadow-sm transition-all">Operatividad</TabsTrigger>
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
            </PageShell>
        </MainLayout>
    );
}
