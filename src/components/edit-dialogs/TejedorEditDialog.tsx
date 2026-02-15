'use client';

import React, { useEffect, useState } from 'react';
import { useEditModalStore } from '@/lib/store/edit-modal-store';
import { getTejedor, updateTejedor } from '@/actions/tejedores-actions';
import { TejedorForm } from '@/components/forms/TejedorForm';
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

export function TejedorEditDialog({ onClose }: { onClose: () => void }) {
    const { entityId, isOpen } = useEditModalStore();
    const [tejedor, setTejedor] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const loadData = async () => {
            if (!entityId) return;
            setIsLoading(true);
            try {
                const res = await getTejedor(entityId);

                if (res.success) {
                    setTejedor(res.data);
                } else {
                    toast.error('Error al cargar datos del tejedor');
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
            const res = await updateTejedor(entityId, data);
            if (res.success) {
                toast.success(res.message);
                onClose();
                router.refresh();
            } else {
                toast.error(res.error);
            }
        } catch (error) {
            toast.error('Error al actualizar tejedor');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                        <Users className="w-6 h-6 text-blue-600" />
                        Editar Tejedor
                    </DialogTitle>
                    <DialogDescription>
                        Modifique la información del tejedor seleccionado.
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : (
                    <TejedorForm
                        initialData={tejedor}
                        onSubmit={handleSubmit}
                        onCancel={onClose}
                        isLoading={isSaving}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
