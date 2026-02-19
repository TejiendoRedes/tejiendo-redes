'use client';

import React from 'react';
import Image from 'next/image';
import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
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
                    <LoginForm />

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <p className="text-slate-500 text-sm mb-3">¿Eres nuevo?</p>
                        <a
                            href="/unirse"
                            className="inline-flex items-center justify-center px-6 py-3 border border-[#0870B8] text-[#0870B8] font-semibold rounded-xl hover:bg-slate-50 transition-all active:scale-95 text-sm"
                        >
                            Unirse como tejedor
                        </a>
                    </div>
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
