'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAbordajeById, updateAbordaje } from '@/actions/abordajes-actions';
import { getComunidades } from '@/actions/comunidades-actions';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AbordajeForm } from '@/components/forms/AbordajeForm';

export default function EditarAbordajePage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [comunidades, setComunidades] = useState<any[]>([]);
    const [abordaje, setAbordaje] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;

            try {
                const [comunidadesRes, abordajeRes] = await Promise.all([
                    getComunidades(),
                    getAbordajeById(id)
                ]);

                if (comunidadesRes.success && comunidadesRes.data) {
                    setComunidades(comunidadesRes.data);
                } else {
                    toast.error('Error al cargar comunidades');
                }

                if (abordajeRes.success && abordajeRes.data) {
                    // Normalize data structure if needed, getAbordajeById service might return nested object
                    // In AbordajesService.getById: it returns the first record from join
                    // The result usually has { abordaje: {...}, comunidad: {...} } or just { ...abordaje }
                    // Based on getAbordajeById action, it returns the result from service.

                    // Looking at abordajes-actions.ts, it returns whatever service returns.
                    // Looking at AbordajeForm.tsx, it expects initialData to be an Abordaje type.
                    setAbordaje(abordajeRes.data.abordaje || abordajeRes.data);
                } else {
                    toast.error(abordajeRes.error || 'Error al cargar datos del abordaje');
                }
            } catch (error) {
                console.error(error);
                toast.error('Error inesperado al cargar datos');
            } finally {
                setIsLoadingData(false);
            }
        };
        fetchData();
    }, [id]);

    const handleSubmit = async (formData: any) => {
        setIsSubmitting(true);

        try {
            const payload = {
                ...formData,
                fechaAbordaje: new Date(formData.fechaAbordaje),
                participantesEstimados: parseInt(formData.participantesEstimados?.toString() || '0'),
            };

            const result = await updateAbordaje(id, payload as any);

            if (result.success) {
                toast.success('Abordaje actualizado exitosamente');
                router.push(`/abordajes/${id}`);
                router.refresh();
            } else {
                toast.error(result.error || 'Error al actualizar abordaje');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error inesperado al actualizar');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoadingData) {
        return (
            <MainLayout>
                <div className="flex h-screen items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            </MainLayout>
        );
    }

    if (!abordaje) {
        return (
            <MainLayout>
                <div className="p-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-700">Abordaje no encontrado</h2>
                    <Button className="mt-4" onClick={() => router.back()}>Volver</Button>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Editar Abordaje</h1>
                        <p className="text-gray-600">Modificar información del abordaje {id}</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Datos del Abordaje</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AbordajeForm
                            initialData={abordaje}
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
