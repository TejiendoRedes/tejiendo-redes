'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [usuario, setUsuario] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const success = await login(usuario, password);
            if (success) {
                toast.success('Sesión iniciada correctamente');
                router.push('/dashboard');
            } else {
                toast.error('Usuario o contraseña incorrectos');
            }
        } catch (error) {
            toast.error('Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-[440px] flex flex-col items-center">
                {/* Logo y título */}
                <div className="text-center mb-10 transition-all duration-700 animate-in fade-in slide-in-from-bottom-4">
                    <div className="inline-flex items-center justify-center mb-6">
                        <Image
                            src="/logo.png"
                            alt="Logo"
                            width={180}
                            height={180}
                            className="object-contain drop-shadow-sm"
                            priority
                        />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            Sistema de Abordajes
                        </h1>
                        <p className="text-slate-500 font-medium">
                            Gestión de salud comunitaria
                        </p>
                    </div>
                </div>

                {/* Formulario de login */}
                <div className="w-full bg-white rounded-3xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] border border-slate-100 p-10 transition-all duration-700 animate-in fade-in zoom-in-95 delay-200">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="usuario" className="text-slate-700 font-semibold ml-1">
                                Usuario
                            </Label>
                            <div className="relative group">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 group-focus-within:text-blue-600">
                                    <User className="w-5 h-5 text-slate-400" />
                                </div>
                                <Input
                                    id="usuario"
                                    type="text"
                                    value={usuario}
                                    onChange={e => setUsuario(e.target.value)}
                                    className="pl-11 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all rounded-xl"
                                    placeholder="Ingrese su usuario"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-700 font-semibold ml-1">
                                Contraseña
                            </Label>
                            <div className="relative group">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 group-focus-within:text-blue-600">
                                    <Lock className="w-5 h-5 text-slate-400" />
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="pl-11 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all rounded-xl"
                                    placeholder="Ingrese su contraseña"
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-bold bg-slate-900 hover:bg-slate-800 transition-all rounded-xl shadow-lg shadow-slate-200 mt-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Iniciando sesión...
                                </span>
                            ) : 'Iniciar Sesión'}
                        </Button>
                    </form>
                </div>

                <div className="mt-8 text-center animate-in fade-in slide-in-from-top-4 delay-500">
                    <p className="text-slate-400 text-sm">
                        &copy; {new Date().getFullYear()} Tejiendo Redes. Todos los derechos reservados.
                    </p>
                </div>
            </div>
        </div>
    );
}
