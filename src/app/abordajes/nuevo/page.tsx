'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createAbordaje } from '@/actions/abordajes-actions';
import { getComunidades } from '@/actions/comunidades-actions';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { AbordajeForm } from '@/components/forms/AbordajeForm';

export default function NuevoAbordajePage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [comunidades, setComunidades] = useState<any[]>([]);

    React.useEffect(() => {
        const fetchComunidades = async () => {
            const result = await getComunidades();
            if (result.success && result.data) {
                setComunidades(result.data);
            } else {
                toast.error('Error al cargar comunidades');
            }
        };
        fetchComunidades();
    }, []);

    const handleSubmit = async (formData: any) => {
        setIsSubmitting(true);

        try {
            // Generate a simple ID logic or timestamp based if not handled by server completely, 
            // but usually server handles it. 
            // The previous code generated ID on client side: `const generatedId = ABD-${Date.now().toString().slice(-6)};`
            // But `createAbordaje` action also has logic to generate ID: `getNextCode`.
            // Let's check `createAbordaje` again. 
            // `createAbordaje` in `abordajes-actions.ts` generates `newCode` using `getNextCode`.
            // So we don't need to generate it here likely?
            // Wait, previous code in `nuevo/page.tsx` was generating it. 
            // "const generatedId = ABD-${Date.now().toString().slice(-6)};"
            // And passing it as `codigoAbordaje`.
            // The `createAbordaje` action:
            // "const newCode = await getNextCode(...); const finalData = { ...data, codigoAbordaje: newCode };"
            // So the server action OVERWRITES `codigoAbordaje` anyway.
            // So we can send without `codigoAbordaje` or with any value.

            const payload = {
                ...formData,
                fechaAbordaje: new Date(formData.fechaAbordaje),
                participantesEstimados: parseInt(formData.participantesEstimados.toString()) || 0,
            };

            if (!formData.codigoComunidad) {
                toast.error('Debe seleccionar una comunidad');
                setIsSubmitting(false);
                return;
            }

            const result = await createAbordaje(payload as any);

            if (result.success) {
                toast.success('Abordaje creado exitosamente');
                router.push('/abordajes');
                router.refresh();
            } else {
                toast.error(result.error || 'Error al crear abordaje');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error inesperado');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <MainLayout>
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Nuevo Abordaje</h1>
                        <p className="text-gray-600">Registrar un nuevo abordaje comunitario</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Datos del Abordaje</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AbordajeForm
                            comunidades={comunidades}
                            onSubmit={handleSubmit}
                            onCancel={() => router.back()}
                            isLoading={isSubmitting}
                        />
                    </CardContent>
                </Card>
            </div >
        </MainLayout >
    );
}
