import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ConsultaForm } from '@/components/abordajes/ConsultaForm';
import { getAbordajeById } from '@/actions/abordajes-actions';
import { getPacientes } from '@/actions/pacientes-actions';
import { getEnfermedades } from '@/actions/enfermedades-actions';
import { getMedicos } from '@/actions/medicos-actions';
import { EmptyState } from '@/components/shared/UIComponents';

export default async function NuevaConsultaPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Parallel data fetching
    const [abordajeReq, pacientesReq, enfermedadesReq, medicosReq] = await Promise.all([
        getAbordajeById(id),
        getPacientes(),
        getEnfermedades(),
        getMedicos()
    ]);

    if (!abordajeReq.success || !abordajeReq.data) {
        return (
            <MainLayout>
                <EmptyState
                    icon="error"
                    title="Abordaje no encontrado"
                    description="No se puede registrar una consulta para un abordaje inexistente."
                    action={{
                        label: 'Volver',
                        href: '/abordajes'
                    }}
                />
            </MainLayout>
        );
    }

    const abordajeData = abordajeReq.data;

    // Transform medical staff data to match the expected format
    // getMedicos returns { success, data: [{ ...medicos, tejedor: {...}, especialidad: {...} }] }
    const medicosData = (medicosReq.success && medicosReq.data)
        ? medicosReq.data.map((m: any) => ({
            cedulaTejedor: m.tejedor.cedulaTejedor,
            nombreTejedor: m.tejedor.nombreTejedor,
            apellidoTejedor: m.tejedor.apellidoTejedor,
            profesionTejedor: m.tejedor.profesionTejedor,
        }))
        : [];

    return (
        <MainLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    Registro de Consulta
                </h1>
                <p className="text-gray-600">
                    Abordaje: {abordajeData.descripcion} ({abordajeData.codigoAbordaje})
                </p>
            </div>

            <ConsultaForm
                abordajeId={id}
                pacientes={pacientesReq.data || []}
                medicos={medicosData}
                enfermedades={enfermedadesReq.data || []}
            />
        </MainLayout>
    );
}

