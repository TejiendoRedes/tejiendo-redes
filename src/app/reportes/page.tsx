import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageShell } from '@/components/layout/PageShell';
import { getReporteAbordajes, getReporteComunidades, getReportePacientes, getReporteMorbilidad, getReporteMedicamentos, getComunidadesParaFiltro } from '@/queries/reportes';
import ReportesClient from '@/components/features/reportes/ReportesClient';
export default async function ReportesPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolvedSearchParams = await searchParams;
    const { fechaInicio, fechaFin, codigoComunidad, estado, municipio, parroquia, tipoComunidad } = resolvedSearchParams;

    const filters = {
        fechaInicio: fechaInicio as string,
        fechaFin: fechaFin as string,
        codigoComunidad: codigoComunidad as string,
        estado: estado as string,
        municipio: municipio as string,
        parroquia: parroquia as string,
        tipoComunidad: tipoComunidad as string
    };

    // Obtener datos secuencialmente para no saturar el pool de conexiones de la base de datos
    const comunidadesResult = await getComunidadesParaFiltro();
    const abordajesResult = await getReporteAbordajes(filters);
    const comunidadesReporteResult = await getReporteComunidades(filters);
    const pacientesResult = await getReportePacientes(filters);
    const morbilidadResult = await getReporteMorbilidad(filters);
    const medicamentosResult = await getReporteMedicamentos(filters);

    // Extraer datos o usar arrays vacíos como fallback
    const comunidadesFilter = comunidadesResult.success ? comunidadesResult.data : [];
    const reporteAbordajes = abordajesResult.success ? abordajesResult.data : [];
    const reporteComunidades = comunidadesReporteResult.success ? comunidadesReporteResult.data : [];
    const reportePacientes = pacientesResult.success ? pacientesResult.data : [];
    const dataMorbilidad = morbilidadResult.success ? morbilidadResult.data : [];
    const reporteMedicamentos = medicamentosResult.success ? medicamentosResult.data : [];

    return (
        <MainLayout>
            <PageShell 
                title="Reportes" 
                subtitle="Generación de reportes con filtros personalizados y estadísticas avanzadas"
            >
                <ReportesClient
                    comunidades={comunidadesFilter}
                    reporteAbordajes={reporteAbordajes}
                    reporteComunidades={reporteComunidades}
                    reportePacientes={reportePacientes}
                    dataMorbilidad={dataMorbilidad}
                    reporteMedicamentos={reporteMedicamentos}
                />
            </PageShell>
        </MainLayout>
    );
}
