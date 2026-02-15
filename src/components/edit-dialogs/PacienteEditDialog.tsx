'use client';

import React, { useEffect, useState } from 'react';
import { useEditModalStore } from '@/lib/store/edit-modal-store';
import { getPaciente, updatePaciente } from '@/actions/pacientes-actions';
import { getComunidades } from '@/actions/comunidades-actions';
import { PacienteForm } from '@/components/forms/PacienteForm';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Heart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function PacienteEditDialog({ onClose }: { onClose: () => void }) {
    const { entityId, isOpen } = useEditModalStore();
    const [paciente, setPaciente] = useState<any>(null);
    const [comunidades, setComunidades] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const loadData = async () => {
            if (!entityId) return;
            setIsLoading(true);
            try {
                const [pacienteRes, comunidadesRes] = await Promise.all([
                    getPaciente(entityId),
                    getComunidades()
                ]);

                if (pacienteRes.success) {
                    setPaciente(pacienteRes.data);
                } else {
                    toast.error('Error al cargar datos del paciente');
                    onClose();
                }

                if (comunidadesRes.success && comunidadesRes.data) {
                    setComunidades(comunidadesRes.data);
                }
            } catch (error) {
                console.error(error);
                toast.error('Error al cargar datos');
                onClose();
            } finally {
                setIsLoading(false);
            }
        };

        if (isOpen && entityId) {
            loadData();
        }
    }, [entityId, isOpen, onClose]);

    const handleSubmit = async (data: any) => {
        if (!entityId) return;
        setIsSaving(true);
        try {
            const res = await updatePaciente(entityId, data);
            if (res.success) {
                toast.success(res.message);
                onClose();
                router.refresh(); // Refresh page to reflect changes if visible
            } else {
                toast.error(res.error);
            }
        } catch (error) {
            toast.error('Error al actualizar paciente');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                        <Heart className="w-6 h-6 text-blue-600" />
                        Editar Paciente
                    </DialogTitle>
                    <DialogDescription>
                        Modifique la información del paciente seleccionado.
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : (
                    <PacienteForm
                        initialData={paciente}
                        comunidades={comunidades}
                        onSubmit={handleSubmit}
                        onCancel={onClose}
                        isLoading={isSaving}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
