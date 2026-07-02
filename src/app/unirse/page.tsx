'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { getEstados, getMunicipiosByEstado, getParroquiasByMunicipio } from '@/data/venezuela-location';
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';

const registrationSchema = z.object({
    cedulaAspirante: z.string().min(6, 'Cédula debe tener al menos 6 caracteres').max(12),
    nombreAspirante: z.string().min(2, 'Nombre es requerido').max(50),
    apellidoAspirante: z.string().min(2, 'Apellido es requerido').max(50),
    fechaNacimiento: z.string().refine((date) => !isNaN(Date.parse(date)), 'Fecha inválida'),
    direccionAspirante: z.string().min(5, 'Dirección es muy corta').max(150),
    municipioAspirante: z.string().min(2, 'Municipio es requerido').max(100),
    estadoDireccionAspirante: z.string().min(2, 'Estado es requerido').max(100),
    parroquiaAspirante: z.string().min(2, 'Parroquia es requerida').max(100),
    telefonoAspirante: z.string().min(10, 'Teléfono debe tener al menos 10 dígitos').max(15),
    correoAspirante: z.string().email('Correo electrónico inválido').max(100),
    profesionAspirante: z.string().min(2, 'Profesión es requerida').max(50),
});

type RegistrationData = z.infer<typeof registrationSchema>;

export default function RegisterTejedorPage() {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Security states
    const [csrfToken, setCsrfToken] = useState('');
    const [honeypot, setHoneypot] = useState('');
    const [startTime] = useState(Date.now().toString());

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<RegistrationData>({
        resolver: zodResolver(registrationSchema),
        defaultValues: {
            estadoDireccionAspirante: '',
            municipioAspirante: '',
            parroquiaAspirante: '',
        }
    });

    React.useEffect(() => {
        // Fetch CSRF token on mount
        const fetchCsrf = async () => {
            try {
                const res = await fetch('/api/auth/csrf');
                const data = await res.json();
                setCsrfToken(data.csrfToken);
            } catch (err) {
                console.error('Failed to fetch CSRF token');
            }
        };
        fetchCsrf();
    }, []);

    const selectedEstado = watch('estadoDireccionAspirante');
    const selectedMunicipio = watch('municipioAspirante');

    const estados = getEstados();
    const [municipios, setMunicipios] = useState<{ id: string; nombre: string }[]>([]);
    const [parroquias, setParroquias] = useState<{ id: string; nombre: string }[]>([]);

    React.useEffect(() => {
        if (selectedEstado) {
            const list = getMunicipiosByEstado(selectedEstado);
            setMunicipios(list);
            if (!list.find(m => m.id === selectedMunicipio)) {
                setValue('municipioAspirante', '');
                setValue('parroquiaAspirante', '');
            }
        } else {
            setMunicipios([]);
            setValue('municipioAspirante', '');
            setValue('parroquiaAspirante', '');
        }
    }, [selectedEstado, setValue, selectedMunicipio]);

    React.useEffect(() => {
        if (selectedEstado && selectedMunicipio) {
            const list = getParroquiasByMunicipio(selectedEstado, selectedMunicipio);
            setParroquias(list);
            if (!list.find(p => p.id === watch('parroquiaAspirante'))) {
                setValue('parroquiaAspirante', '');
            }
        } else {
            setParroquias([]);
            setValue('parroquiaAspirante', '');
        }
    }, [selectedEstado, selectedMunicipio, setValue, watch]);

    const onSubmit = async (data: RegistrationData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-csrf-token': csrfToken
                },
                body: JSON.stringify({
                    ...data,
                    csrfToken,
                    honeypot,
                    submissionTime: startTime
                }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Error al enviar la solicitud');
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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md p-8 text-center space-y-6 rounded-[24px] shadow-sm border-gray-100 bg-white/70 backdrop-blur-md">
                    <div className="flex justify-center">
                        <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">¡Postulación Enviada!</h2>
                    <p className="text-gray-600">
                        Tu información ha sido recibida correctamente. El administrador revisará tu postulación para integrarte como Tejedor en la red.
                    </p>
                    <Link href="/login">
                        <Button className="w-full mt-4 bg-[#1e3a8a] hover:bg-blue-900 text-white rounded-xl h-12">
                            Volver al Inicio
                        </Button>
                    </Link>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 py-12">
            <Link href="/login" className="self-start mb-8 ml-4 lg:ml-0 flex items-center text-gray-500 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al inicio
            </Link>

            <div className="w-full max-w-3xl rounded-[24px] shadow-sm border border-gray-100 bg-white/70 backdrop-blur-md p-8 md:p-12">
                <div className="mb-10 text-center md:text-left">
                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Formulario de Postulación</h1>
                    <p className="text-gray-500 mt-3 text-lg">Únete a nuestra red de salud comunitaria como Tejedor.</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-8 text-sm flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {/* CSRF Hidden Field */}
                    <input type="hidden" name="csrfToken" value={csrfToken} />

                    {/* Honeypot Field */}
                    <div className="hidden" aria-hidden="true">
                        <input
                            type="text"
                            name="website"
                            tabIndex={-1}
                            autoComplete="off"
                            value={honeypot}
                            onChange={(e) => setHoneypot(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {/* Cédula y Profesión */}
                        <div className="space-y-2">
                            <Label htmlFor="cedulaAspirante" className="text-gray-700 font-medium">Cédula</Label>
                            <Input id="cedulaAspirante" {...register('cedulaAspirante')} placeholder="V-12345678" className="h-12 border-gray-200 focus:border-[#1e3a8a] focus:ring-[#1e3a8a] rounded-xl bg-gray-50/50 text-gray-900" />
                            {errors.cedulaAspirante && <p className="text-xs text-red-500">{errors.cedulaAspirante.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="profesionAspirante" className="text-gray-700 font-medium">Profesión</Label>
                            <Input id="profesionAspirante" {...register('profesionAspirante')} placeholder="Ej: Médico, Enfermero, etc." className="h-12 border-gray-200 focus:border-[#1e3a8a] focus:ring-[#1e3a8a] rounded-xl bg-gray-50/50 text-gray-900" />
                            {errors.profesionAspirante && <p className="text-xs text-red-500">{errors.profesionAspirante.message}</p>}
                        </div>

                        {/* Nombres y Apellidos */}
                        <div className="space-y-2">
                            <Label htmlFor="nombreAspirante" className="text-gray-700 font-medium">Nombres</Label>
                            <Input id="nombreAspirante" {...register('nombreAspirante')} className="h-12 border-gray-200 focus:border-[#1e3a8a] focus:ring-[#1e3a8a] rounded-xl bg-gray-50/50 text-gray-900" />
                            {errors.nombreAspirante && <p className="text-xs text-red-500">{errors.nombreAspirante.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="apellidoAspirante" className="text-gray-700 font-medium">Apellidos</Label>
                            <Input id="apellidoAspirante" {...register('apellidoAspirante')} className="h-12 border-gray-200 focus:border-[#1e3a8a] focus:ring-[#1e3a8a] rounded-xl bg-gray-50/50 text-gray-900" />
                            {errors.apellidoAspirante && <p className="text-xs text-red-500">{errors.apellidoAspirante.message}</p>}
                        </div>

                        {/* Fecha Nacimiento y Correo */}
                        <div className="space-y-2">
                            <Label htmlFor="fechaNacimiento" className="text-gray-700 font-medium">Fecha de Nacimiento</Label>
                            <Input id="fechaNacimiento" type="date" {...register('fechaNacimiento')} className="h-12 border-gray-200 focus:border-[#1e3a8a] focus:ring-[#1e3a8a] rounded-xl bg-gray-50/50 text-gray-900" />
                            {errors.fechaNacimiento && <p className="text-xs text-red-500">{errors.fechaNacimiento.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="correoAspirante" className="text-gray-700 font-medium">Correo Electrónico</Label>
                            <Input id="correoAspirante" type="email" {...register('correoAspirante')} placeholder="ejemplo@correo.com" className="h-12 border-gray-200 focus:border-[#1e3a8a] focus:ring-[#1e3a8a] rounded-xl bg-gray-50/50 text-gray-900" />
                            {errors.correoAspirante && <p className="text-xs text-red-500">{errors.correoAspirante.message}</p>}
                        </div>

                        {/* Teléfono y Estado */}
                        <div className="space-y-2">
                            <Label htmlFor="telefonoAspirante" className="text-gray-700 font-medium">Teléfono</Label>
                            <Input id="telefonoAspirante" {...register('telefonoAspirante')} placeholder="0412-1234567" className="h-12 border-gray-200 focus:border-[#1e3a8a] focus:ring-[#1e3a8a] rounded-xl bg-gray-50/50 text-gray-900" />
                            {errors.telefonoAspirante && <p className="text-xs text-red-500">{errors.telefonoAspirante.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="estadoDireccionAspirante" className="text-gray-700 font-medium">Estado</Label>
                            <Select
                                onValueChange={(value) => setValue('estadoDireccionAspirante', value)}
                                value={watch('estadoDireccionAspirante')}
                            >
                                <SelectTrigger className="h-12 border-gray-200 focus:border-[#1e3a8a] focus:ring-[#1e3a8a] rounded-xl bg-gray-50/50 text-gray-900">
                                    <SelectValue placeholder="Seleccione un estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    {estados.map((estado) => (
                                        <SelectItem key={estado.id} value={estado.id}>
                                            {estado.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.estadoDireccionAspirante && <p className="text-xs text-red-500">{errors.estadoDireccionAspirante.message}</p>}
                        </div>

                        {/* Municipio y Parroquia */}
                        <div className="space-y-2">
                            <Label htmlFor="municipioAspirante" className="text-gray-700 font-medium">Municipio</Label>
                            <Select
                                onValueChange={(value) => setValue('municipioAspirante', value)}
                                value={watch('municipioAspirante')}
                                disabled={!selectedEstado}
                            >
                                <SelectTrigger className="h-12 border-gray-200 focus:border-[#1e3a8a] focus:ring-[#1e3a8a] rounded-xl bg-gray-50/50 text-gray-900">
                                    <SelectValue placeholder={selectedEstado ? "Seleccione un municipio" : "Primero seleccione estado"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {municipios.map((mun) => (
                                        <SelectItem key={mun.id} value={mun.id}>
                                            {mun.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.municipioAspirante && <p className="text-xs text-red-500">{errors.municipioAspirante.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="parroquiaAspirante" className="text-gray-700 font-medium">Parroquia</Label>
                            <Select
                                onValueChange={(value) => setValue('parroquiaAspirante', value)}
                                value={watch('parroquiaAspirante')}
                                disabled={!selectedMunicipio}
                            >
                                <SelectTrigger className="h-12 border-gray-200 focus:border-[#1e3a8a] focus:ring-[#1e3a8a] rounded-xl bg-gray-50/50 text-gray-900">
                                    <SelectValue placeholder={selectedMunicipio ? "Seleccione una parroquia" : "Primero seleccione municipio"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {parroquias.map((parr) => (
                                        <SelectItem key={parr.id} value={parr.id}>
                                            {parr.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.parroquiaAspirante && <p className="text-xs text-red-500">{errors.parroquiaAspirante.message}</p>}
                        </div>

                        {/* Usuario y Contraseña */}
                        <div className="space-y-2">
                            <Label htmlFor="usuario" className="text-gray-700 font-medium">Nombre de Usuario</Label>
                            <Input id="usuario" {...register('usuario')} placeholder="ej: juanperez123" className="h-12 border-gray-200 focus:border-[#1e3a8a] focus:ring-[#1e3a8a] rounded-xl bg-gray-50/50 text-gray-900" />
                            {errors.usuario && <p className="text-xs text-red-500">{errors.usuario.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-gray-700 font-medium">Contraseña</Label>
                            <Input id="password" type="password" {...register('password')} className="h-12 border-gray-200 focus:border-[#1e3a8a] focus:ring-[#1e3a8a] rounded-xl bg-gray-50/50 text-gray-900" />
                            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="direccionAspirante" className="text-gray-700 font-medium">Dirección de Habitación</Label>
                        <Input
                            id="direccionAspirante"
                            {...register('direccionAspirante')}
                            placeholder="Calle, avenida, sector, punto de referencia..."
                            className="h-12 border-gray-200 focus:border-[#1e3a8a] focus:ring-[#1e3a8a] rounded-xl bg-gray-50/50 text-gray-900"
                        />
                        {errors.direccionAspirante && <p className="text-xs text-red-500">{errors.direccionAspirante.message}</p>}
                    </div>

                    <div className="pt-6">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full py-7 bg-[#1e3a8a] hover:bg-blue-900 text-white font-semibold text-lg rounded-xl transition-all shadow-sm active:scale-[0.99] flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    Enviando postulación...
                                </>
                            ) : 'Enviar Formulario de Postulación'}
                        </Button>
                        <p className="text-center text-slate-400 text-sm mt-4">
                            Al enviar este formulario, declaras que la información proporcionada es verídica.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
