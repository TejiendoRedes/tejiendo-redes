'use client';

import React, { Suspense } from 'react';
import { useEditModalStore } from '@/lib/store/edit-modal-store';
import dynamic from 'next/dynamic';

// Lazy load dialogs for performance
// Note: We need to create these components next
const PacienteEditDialog = dynamic(() => import('@/components/edit-dialogs/PacienteEditDialog').then(mod => mod.PacienteEditDialog), { ssr: false });
const TejedorEditDialog = dynamic(() => import('@/components/edit-dialogs/TejedorEditDialog').then(mod => mod.TejedorEditDialog), { ssr: false });
const ComunidadEditDialog = dynamic(() => import('@/components/edit-dialogs/ComunidadEditDialog').then(mod => mod.ComunidadEditDialog), { ssr: false });
const MedicamentoEditDialog = dynamic(() => import('@/components/edit-dialogs/MedicamentoEditDialog').then(mod => mod.MedicamentoEditDialog), { ssr: false });
const EnfermedadEditDialog = dynamic(() => import('@/components/edit-dialogs/EnfermedadEditDialog').then(mod => mod.EnfermedadEditDialog), { ssr: false });
const AbordajeEditDialog = dynamic(() => import('@/components/edit-dialogs/AbordajeEditDialog').then(mod => mod.AbordajeEditDialog), { ssr: false });
const ResponsableEditDialog = dynamic(() => import('@/components/edit-dialogs/ResponsableEditDialog').then(mod => mod.ResponsableEditDialog), { ssr: false });
const AspiranteEditDialog = dynamic(() => import('@/components/edit-dialogs/AspiranteEditDialog').then(mod => mod.AspiranteEditDialog), { ssr: false });


export function GlobalEditManager() {
    const { isOpen, entityType, closeEditModal } = useEditModalStore();

    if (!isOpen || !entityType) return null;

    return (
        <Suspense fallback={null}>
            {entityType === 'paciente' && <PacienteEditDialog onClose={closeEditModal} />}
            {entityType === 'tejedor' && <TejedorEditDialog onClose={closeEditModal} />}
            {entityType === 'comunidad' && <ComunidadEditDialog onClose={closeEditModal} />}
            {entityType === 'medicamento' && <MedicamentoEditDialog onClose={closeEditModal} />}
            {entityType === 'enfermedad' && <EnfermedadEditDialog onClose={closeEditModal} />}
            {entityType === 'abordaje' && <AbordajeEditDialog onClose={closeEditModal} />}
            {entityType === 'responsable' && <ResponsableEditDialog onClose={closeEditModal} />}
            {entityType === 'aspirante' && <AspiranteEditDialog onClose={closeEditModal} />}
            {/* {entityType === 'aspirante' && <AspiranteEditDialog onClose={closeEditModal} />} */}
        </Suspense>
    );
}
