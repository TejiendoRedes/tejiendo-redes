'use client';

import React, { useEffect, useState } from 'react';
import { useEditModalStore } from '@/lib/store/edit-modal-store';
import { updateComunidad } from '@/actions/comunidades-actions';
import { getComunidad } from '@/queries/comunidades-actions';;
import { getResponsables } from '@/queries/responsables-actions';;
import { ComunidadForm } from '@/components/forms/ComunidadForm';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Home, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function ComunidadEditDialog({ onClose }: { onClose: () => void }) {
    const { entityId, isOpen } = useEditModalStore();
    const [comunidad, setComunidad] = useState<any>(null);
    const [responsables, setResponsables] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const loadData = async () => {
            if (!entityId) return;
            setIsLoading(true);
            try {
                const [comunidadRes, responsablesRes] = await Promise.all([
                    getComunidad(entityId),
                    getResponsables()
                ]);

                if (comunidadRes.success) {
                    setComunidad(comunidadRes.data);
                } else {
                    toast.error('Error al cargar datos de la comunidad');
                    onClose();
                }

                if (responsablesRes.success) {
                    setResponsables(responsablesRes.data as any[]);
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
            const res = await updateComunidad(entityId, data);
            if (res.success) {
                toast.success(res.message);
                onClose();
                router.refresh();
            } else {
                toast.error(res.error);
            }
        } catch (error) {
            toast.error('Error al actualizar comunidad');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                        <Home className="w-6 h-6 text-green-600" />
                        Editar Comunidad
                    </DialogTitle>
                    <DialogDescription>
                        Modifique la información de la comunidad seleccionada.
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : (
                    <ComunidadForm
                        initialData={comunidad}
                        responsables={responsables}
                        onSubmit={handleSubmit}
                        onCancel={onClose}
                        isLoading={isSaving}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
