'use client';

import React, { useEffect, useState } from 'react';
import { useEditModalStore } from '@/lib/store/edit-modal-store';
import { updateAspirante } from '@/actions/aspirantes-actions';
import { getAspirante } from '@/queries/aspirantes';;
import { AspiranteForm } from '@/components/forms/AspiranteForm';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Clipboard, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Aspirante } from '@/db/schema/aspirantes';

export function AspiranteEditDialog({ onClose }: { onClose: () => void }) {
    const { entityId, isOpen } = useEditModalStore();
    const [aspirante, setAspirante] = useState<Aspirante | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const loadData = async () => {
            if (!entityId) return;
            setIsLoading(true);
            try {
                const res = await getAspirante(entityId);
                if (res.success && res.data) {
                    setAspirante(res.data);
                } else {
                    toast.error('Error al cargar datos del aspirante');
                    onClose();
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
                fechaNacimiento: new Date(data.fechaNacimiento),
                fechaPostulacion: new Date(data.fechaPostulacion),
            };

            const res = await updateAspirante(entityId, payload);
            if (res.success) {
                toast.success(res.message);
                onClose();
                router.refresh();
            } else {
                toast.error(res.error || 'Error al actualizar');
            }
        } catch (error) {
            toast.error('Error al actualizar aspirante');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                        <Clipboard className="w-6 h-6 text-blue-600" />
                        Editar Aspirante
                    </DialogTitle>
                    <DialogDescription>
                        Modifique la información del aspirante seleccionado.
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : (
                    <AspiranteForm
                        initialData={aspirante}
                        onSubmit={handleSubmit}
                        onCancel={onClose}
                        isLoading={isSaving}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
