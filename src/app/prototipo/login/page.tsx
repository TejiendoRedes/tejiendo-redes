'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Lock, User, ArrowRight } from 'lucide-react';

export default function PrototipoLoginPage() {
    const [usuario, setUsuario] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            window.location.href = '/prototipo/dashboard';
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-[#e0f2fe] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans text-slate-700 selection:bg-[#87ceeb] selection:text-[#1e40af]">
            {/* Bandera minimalista superior */}
            <div className="absolute top-0 left-0 w-full h-1.5 flex z-50">
                <div className="flex-1 bg-[#F4C430]" />
                <div className="flex-1 bg-[#1e40af]" />
                <div className="flex-1 bg-[#CF142B]" />
            </div>

            {/* Elementos decorativos de fondo opcionales */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl -z-10 animate-pulse mix-blend-multiply" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-300/20 rounded-full blur-3xl -z-10 animate-pulse mix-blend-multiply" />

            <div className="w-full max-w-[420px] flex flex-col items-center z-10">
                
                {/* Contenedor Amigable */}
                <div className="w-full bg-white/90 backdrop-blur-xl p-10 sm:p-12 relative animate-in fade-in slide-in-from-bottom-4 duration-700 rounded-3xl shadow-2xl shadow-blue-900/10 border border-white/50">
                    
                    {/* Encabezado del Formulario */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center mb-6">
                            <div className="w-24 h-24 bg-white rounded-full shadow-sm flex items-center justify-center p-2 border border-slate-100">
                                <Image
                                    src="/logo.png"
                                    alt="Logo Tejiendo Redes"
                                    width={100}
                                    height={100}
                                    className="object-contain"
                                    priority
                                />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800">
                            Tejiendo Redes
                        </h1>
                        <p className="text-slate-500 text-sm mt-2">
                            Sistema de Abordajes Médicos
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label htmlFor="usuario" className="block text-sm font-medium text-slate-700">
                                Usuario
                            </label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#1e40af]">
                                    <User className="w-5 h-5" />
                                </div>
                                <input
                                    id="usuario"
                                    type="text"
                                    value={usuario}
                                    onChange={e => setUsuario(e.target.value)}
                                    className="w-full pl-11 pr-4 h-12 bg-slate-50 border border-slate-200 focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af] outline-none transition-all rounded-xl text-slate-800 font-medium text-sm placeholder:text-slate-400"
                                    placeholder="Ej: dr_apellido"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                                Contraseña
                            </label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#1e40af]">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-4 h-12 bg-slate-50 border border-slate-200 focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af] outline-none transition-all rounded-xl text-slate-800 font-medium text-sm placeholder:text-slate-400"
                                    placeholder="••••••••"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full h-12 mt-8 font-semibold text-sm bg-[#1e40af] text-white hover:bg-[#17338b] transition-all duration-200 rounded-xl flex items-center justify-center gap-2 group cursor-pointer shadow-lg shadow-blue-900/20"
                            disabled={loading}
                        >
                            {loading ? 'Iniciando sesión...' : 'Ingresar al sistema'}
                            {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 text-center border-t border-slate-100">
                        <p className="text-sm text-slate-500">
                            ¿Necesitas acceso?{' '}
                            <a
                                href="/unirse"
                                className="text-[#1e40af] hover:text-[#cf142b] font-medium transition-colors cursor-pointer"
                            >
                                Solicitar cuenta
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
