'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createAbordaje } from '@/actions/abordajes-actions';
import { getComunidades } from '@/actions/comunidades-actions';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function NuevoAbordajePage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [comunidades, setComunidades] = useState<any[]>([]);

    // Simple state management for form
    const [formData, setFormData] = useState({
        descripcion: '',
        fechaAbordaje: new Date().toISOString().split('T')[0],
        horaInicio: '08:00',
        horaFin: '12:00',
        estado: 'Planificado',
        codigoComunidad: ''
    });

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (value: string, name: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Generate a simple ID logic or timestamp based
            const generatedId = `ABD-${Date.now().toString().slice(-6)}`;

            const payload = {
                codigoAbordaje: generatedId,
                fechaAbordaje: new Date(formData.fechaAbordaje),
                horaInicio: formData.horaInicio,
                horaFin: formData.horaFin,
                descripcion: formData.descripcion,
                estado: formData.estado,
                codigoComunidad: formData.codigoComunidad
            };

            if (!formData.codigoComunidad) {
                toast.error('Debe seleccionar una comunidad');
                setIsSubmitting(false);
                return;
            }

            const result = await createAbordaje(payload as any); // Type cast might be needed due to Date vs string in schema types sometimes

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
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="descripcion">Descripción / Título</Label>
                                <Input
                                    id="descripcion"
                                    name="descripcion"
                                    placeholder="Ej: Jornada Integral El Valle"
                                    required
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="comunidad">Comunidad</Label>
                                <Select
                                    value={formData.codigoComunidad}
                                    onValueChange={(val) => handleSelectChange(val, 'codigoComunidad')}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar comunidad" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {comunidades.map((c) => (
                                            <SelectItem key={c.codigoComunidad} value={c.codigoComunidad}>
                                                {c.nombreComunidad} - {c.municipio}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fechaAbordaje">Fecha</Label>
                                    <Input
                                        id="fechaAbordaje"
                                        name="fechaAbordaje"
                                        type="date"
                                        required
                                        value={formData.fechaAbordaje}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="estado">Estado</Label>
                                    <Select
                                        value={formData.estado}
                                        onValueChange={(val) => handleSelectChange(val, 'estado')}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar estado" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Planificado">Planificado</SelectItem>
                                            <SelectItem value="En Curso">En Curso</SelectItem>
                                            <SelectItem value="Finalizado">Finalizado</SelectItem>
                                            <SelectItem value="Cancelado">Cancelado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="horaInicio">Hora Inicio</Label>
                                    <Input
                                        id="horaInicio"
                                        name="horaInicio"
                                        type="time"
                                        required
                                        value={formData.horaInicio}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="horaFin">Hora Fin</Label>
                                    <Input
                                        id="horaFin"
                                        name="horaFin"
                                        type="time"
                                        required
                                        value={formData.horaFin}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => router.back()}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Guardar Abordaje
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}
