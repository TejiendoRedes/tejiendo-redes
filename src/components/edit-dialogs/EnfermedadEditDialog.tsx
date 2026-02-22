'use client';

import React, { useEffect, useState } from 'react';
import { useEditModalStore } from '@/lib/store/edit-modal-store';
import { updateEnfermedad } from '@/actions/enfermedades-actions';
import { getEnfermedad } from '@/queries/enfermedades-actions';;
import { EnfermedadForm } from '@/components/forms/EnfermedadForm';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Stethoscope, Loader2 } from 'lucide-react'; // Using Stethoscope as icon for diseases
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function EnfermedadEditDialog({ onClose }: { onClose: () => void }) {
    const { entityId, isOpen } = useEditModalStore();
    const [enfermedad, setEnfermedad] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const loadData = async () => {
            if (!entityId) return;
            setIsLoading(true);
            try {
                const res = await getEnfermedad(entityId);

                if (res.success) {
                    setEnfermedad(res.data);
                } else {
                    toast.error('Error al cargar datos de la enfermedad');
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
            const res = await updateEnfermedad(entityId, data);
            if (res.success) {
                toast.success(res.message);
                onClose();
                router.refresh();
            } else {
                toast.error(res.error);
            }
        } catch (error) {
            toast.error('Error al actualizar enfermedad');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                        <Stethoscope className="w-6 h-6 text-red-600" />
                        Editar Enfermedad
                    </DialogTitle>
                    <DialogDescription>
                        Modifique la información de la enfermedad seleccionada.
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : (
                    <EnfermedadForm
                        initialData={enfermedad}
                        onSubmit={handleSubmit}
                        onCancel={onClose}
                        isLoading={isSaving}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
