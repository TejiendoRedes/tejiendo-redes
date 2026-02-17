'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginForm() {
    const { login } = useAuth();
    const router = useRouter();
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
                router.refresh();
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
                        disabled={loading}
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
                        disabled={loading}
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
    );
}
