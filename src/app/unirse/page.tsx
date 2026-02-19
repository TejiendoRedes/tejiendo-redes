'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const registrationSchema = z.object({
    cedulaTejedor: z.string().min(6, 'Cédula debe tener al menos 6 caracteres').max(12),
    nombreTejedor: z.string().min(2, 'Nombre es requerido').max(50),
    apellidoTejedor: z.string().min(2, 'Apellido es requerido').max(50),
    fechaNacimiento: z.string().refine((date) => !isNaN(Date.parse(date)), 'Fecha inválida'),
    direccionTejedor: z.string().min(5, 'Dirección es muy corta').max(150),
    municipioTejedor: z.string().min(2, 'Municipio es requerido').max(100),
    estadoTejedor: z.string().min(2, 'Estado es requerido').max(100),
    parroquiaTejedor: z.string().min(2, 'Parroquia es requerida').max(100),
    telefonoTejedor: z.string().min(10, 'Teléfono debe tener al menos 10 dígitos').max(15),
    correoTejedor: z.string().email('Correo electrónico inválido').max(100),
    profesionTejedor: z.string().min(2, 'Profesión es requerida').max(50),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});

type RegistrationData = z.infer<typeof registrationSchema>;

export default function RegisterTejedorPage() {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<RegistrationData>({
        resolver: zodResolver(registrationSchema)
    });

    const onSubmit = async (data: RegistrationData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/public/register-tejedor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Error al registrarse');
            }

            setSubmitted(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md p-8 text-center space-y-6">
                    <div className="flex justify-center">
                        <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">¡Registro Exitoso!</h2>
                    <p className="text-slate-600">
                        Tu solicitud para unido como tejedor ha sido enviada. Pronto nos pondremos en contacto contigo.
                    </p>
                    <Link href="/login">
                        <Button className="w-full mt-4 bg-[#0870B8] hover:bg-[#065a96]">
                            Volver al Login
                        </Button>
                    </Link>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 py-12">
            <Link href="/login" className="self-start mb-8 ml-4 lg:ml-0 flex items-center text-slate-500 hover:text-slate-900 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al inicio
            </Link>

            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Unirse como Tejedor</h1>
                    <p className="text-slate-500 mt-2">Completa tus datos para unirte a nuestra red de salud comunitaria.</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="cedulaTejedor">Cédula</Label>
                            <Input id="cedulaTejedor" {...register('cedulaTejedor')} placeholder="V-12345678" />
                            {errors.cedulaTejedor && <p className="text-xs text-red-500">{errors.cedulaTejedor.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="profesionTejedor">Profesión</Label>
                            <Input id="profesionTejedor" {...register('profesionTejedor')} placeholder="Médico, Enfermero, etc." />
                            {errors.profesionTejedor && <p className="text-xs text-red-500">{errors.profesionTejedor.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="nombreTejedor">Nombres</Label>
                            <Input id="nombreTejedor" {...register('nombreTejedor')} />
                            {errors.nombreTejedor && <p className="text-xs text-red-500">{errors.nombreTejedor.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="apellidoTejedor">Apellidos</Label>
                            <Input id="apellidoTejedor" {...register('apellidoTejedor')} />
                            {errors.apellidoTejedor && <p className="text-xs text-red-500">{errors.apellidoTejedor.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
                            <Input id="fechaNacimiento" type="date" {...register('fechaNacimiento')} />
                            {errors.fechaNacimiento && <p className="text-xs text-red-500">{errors.fechaNacimiento.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="correoTejedor">Correo Electrónico</Label>
                            <Input id="correoTejedor" type="email" {...register('correoTejedor')} placeholder="ejemplo@correo.com" />
                            {errors.correoTejedor && <p className="text-xs text-red-500">{errors.correoTejedor.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="telefonoTejedor">Teléfono</Label>
                            <Input id="telefonoTejedor" {...register('telefonoTejedor')} placeholder="0412-1234567" />
                            {errors.telefonoTejedor && <p className="text-xs text-red-500">{errors.telefonoTejedor.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="estadoTejedor">Estado</Label>
                            <Input id="estadoTejedor" {...register('estadoTejedor')} />
                            {errors.estadoTejedor && <p className="text-xs text-red-500">{errors.estadoTejedor.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="municipioTejedor">Municipio</Label>
                            <Input id="municipioTejedor" {...register('municipioTejedor')} />
                            {errors.municipioTejedor && <p className="text-xs text-red-500">{errors.municipioTejedor.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="parroquiaTejedor">Parroquia</Label>
                            <Input id="parroquiaTejedor" {...register('parroquiaTejedor')} />
                            {errors.parroquiaTejedor && <p className="text-xs text-red-500">{errors.parroquiaTejedor.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="direccionTejedor">Dirección Completa</Label>
                        <Input id="direccionTejedor" {...register('direccionTejedor')} />
                        {errors.direccionTejedor && <p className="text-xs text-red-500">{errors.direccionTejedor.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input id="password" type="password" {...register('password')} />
                            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                            <Input id="confirmPassword" type="password" {...register('confirmPassword')} />
                            {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full py-6 mt-4 bg-[#0870B8] hover:bg-[#065a96] text-white font-bold rounded-xl transition-all active:scale-[0.98]"
                    >
                        {loading ? 'Procesando...' : 'Enviar Solicitud'}
                    </Button>
                </form>
            </div>
        </div>
    );
}
