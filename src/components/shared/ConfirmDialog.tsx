'use client';

import React from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    variant?: 'destructive' | 'default';
    isLoading?: boolean;
}

export function ConfirmDialog({
    open,
    onOpenChange,
    title = '¿Estás seguro?',
    description = 'Esta acción no se puede deshacer.',
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    onConfirm,
    variant = 'destructive',
    isLoading = false,
}: ConfirmDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <div className="flex items-center gap-3">
                        {variant === 'destructive' && (
                            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                                <AlertTriangle className="w-5 h-5 text-destructive" />
                            </div>
                        )}
                        <div>
                            <AlertDialogTitle>{title}</AlertDialogTitle>
                            <AlertDialogDescription className="mt-1">
                                {description}
                            </AlertDialogDescription>
                        </div>
                    </div>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading} onClick={() => onOpenChange(false)}>
                        {cancelLabel}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={
                            variant === 'destructive'
                                ? 'bg-destructive text-white hover:bg-destructive/90'
                                : ''
                        }
                    >
                        {isLoading ? 'Procesando...' : confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
