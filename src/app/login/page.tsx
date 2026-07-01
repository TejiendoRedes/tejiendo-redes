'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { HeartHandshake } from 'lucide-react';
import LoginForm from '@/components/forms/LoginForm';

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left panel - hidden on mobile */}
      <div className="relative hidden overflow-hidden lg:block">
        <img
          src="/login-bg.jpg"
          alt="Voluntarios brindando atención médica en la comunidad"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-blue-900/70 to-blue-950/90" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
             <Image
                 src="/logo.png"
                 alt="Logo"
                 width={120}
                 height={120}
                 className="object-contain brightness-0 invert"
                 priority
             />
          </div>
          <div className="space-y-6">
            <blockquote className="max-w-md text-2xl font-light leading-relaxed">
              "La salud es un derecho, no un privilegio. Juntos tejemos redes de esperanza para quienes más lo necesitan."
            </blockquote>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <HeartHandshake className="h-5 w-5 text-white" />
              </span>
              <div>
                <p className="text-sm font-semibold">Fundación Tejiendo Redes</p>
                <p className="text-xs text-blue-200">Aliados con UNICEF y ACNUR</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700 rounded-3xl border border-white/60 bg-white/80 shadow-2xl backdrop-blur-xl">
          <div className="space-y-3 pb-2 pt-8 text-center">
            <div className="mx-auto flex justify-center lg:hidden">
              <Image
                 src="/logo.png"
                 alt="Logo"
                 width={100}
                 height={100}
                 className="object-contain drop-shadow-sm"
                 priority
             />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Bienvenido de nuevo
              </h1>
              <p className="text-sm text-slate-500">
                Ingresa tus credenciales para acceder al sistema de Tejiendo Redes
              </p>
            </div>
          </div>
          
          <div className="space-y-5 px-8 pb-8 mt-4">
            <LoginForm />

            <p className="text-center text-xs text-slate-500 mt-6">
              ¿Quieres ser voluntario?{" "}
              <Link
                href="/unirse"
                className="font-medium text-blue-600 transition-colors hover:text-blue-700 hover:underline"
              >
                Únete aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
