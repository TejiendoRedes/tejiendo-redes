'use client';

import React, { useEffect, useState } from 'react';
import { useEditModalStore } from '@/lib/store/edit-modal-store';
import { updateAbordaje } from '@/actions/abordajes-actions';
import { getAbordajeById } from '@/queries/abordajes';;
import { getComunidades } from '@/queries/comunidades';;
import { AbordajeForm } from '@/components/forms/AbordajeForm';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function AbordajeEditDialog({ onClose }: { onClose: () => void }) {
    const { entityId, isOpen } = useEditModalStore();
    const [abordaje, setAbordaje] = useState<any>(null);
    const [comunidades, setComunidades] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const loadData = async () => {
            if (!entityId) return;
            setIsLoading(true);
            try {
                const [abordajeRes, comunidadesRes] = await Promise.all([
                    getAbordajeById(entityId),
                    getComunidades()
                ]);

                if (abordajeRes.success && abordajeRes.data) {
                    setAbordaje(abordajeRes.data);
                } else {
                    toast.error('Error al cargar datos del abordaje');
                    onClose();
                    return;
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
            const payload = {
                ...data,
                fechaAbordaje: new Date(data.fechaAbordaje),
                participantesEstimados: parseInt(data.participantesEstimados.toString()) || 0,
            };

            const res = await updateAbordaje(entityId, payload);
            if (res.success) {
                toast.success('Abordaje actualizado correctamente'); // updateAbordaje returns generic response without message sometimes, so hardcode success message
                onClose();
                router.refresh();
            } else {
                toast.error(res.error || 'Error al actualizar');
            }
        } catch (error) {
            toast.error('Error al actualizar abordaje');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                        <Users className="w-6 h-6 text-blue-600" />
                        Editar Abordaje
                    </DialogTitle>
                    <DialogDescription>
                        Modifique la información del abordaje seleccionado.
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : (
                    <AbordajeForm
                        initialData={abordaje}
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
