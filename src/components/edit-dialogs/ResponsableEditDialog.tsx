'use client';

import React, { useEffect, useState } from 'react';
import { useEditModalStore } from '@/lib/store/edit-modal-store';
import { updateResponsable } from '@/actions/responsables-actions';
import { getResponsable } from '@/queries/responsables';;
import { ResponsableForm } from '@/components/forms/ResponsableForm';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { UserCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Responsable } from '@/db/schema/responsable';

export function ResponsableEditDialog({ onClose }: { onClose: () => void }) {
    const { entityId, isOpen } = useEditModalStore();
    const [responsable, setResponsable] = useState<Responsable | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const loadData = async () => {
            if (!entityId) return;
            setIsLoading(true);
            try {
                const res = await getResponsable(entityId);
                if (res.success && res.data) {
                    setResponsable(res.data);
                } else {
                    toast.error('Error al cargar datos del responsable');
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
            const res = await updateResponsable(entityId, data);
            if (res.success) {
                toast.success(res.message);
                onClose();
                router.refresh();
            } else {
                toast.error(res.error || 'Error al actualizar');
            }
        } catch (error) {
            toast.error('Error al actualizar responsable');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                        <UserCheck className="w-6 h-6 text-blue-600" />
                        Editar Responsable
                    </DialogTitle>
                    <DialogDescription>
                        Modifique la información del responsable seleccionado.
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : (
                    <ResponsableForm
                        initialData={responsable}
                        onSubmit={handleSubmit}
                        onCancel={onClose}
                        isLoading={isSaving}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
