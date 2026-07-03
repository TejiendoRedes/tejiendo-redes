import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';

interface ErrorStateProps {
    title?: string;
    message?: string;
    withLayout?: boolean;
}

export function ErrorState({ 
    title = 'Error al cargar datos', 
    message = 'No se pudo conectar con la base de datos o hubo un error inesperado.',
    withLayout = true 
}: ErrorStateProps) {
    const content = (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center">
            <div className="text-red-500 mb-4">
                <AlertTriangle className="w-12 h-12" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
            <p className="text-gray-600 max-w-md">{message}</p>
        </div>
    );

    if (withLayout) {
        return <MainLayout>{content}</MainLayout>;
    }

    return content;
}
