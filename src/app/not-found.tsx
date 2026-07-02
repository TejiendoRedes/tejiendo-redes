import Link from 'next/link';
import Image from 'next/image';
import { Home, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Logo */}
        <div className="flex justify-center">
          <div className="relative w-28 h-28 drop-shadow-md">
            <Image
              src="/minilogo.png"
              alt="Logo Tejiendo Redes"
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-4">
          <h1 className="text-8xl font-black text-[#1e3a8a] tracking-tighter drop-shadow-sm">
            404
          </h1>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Página no encontrada
          </h2>
          <p className="text-slate-500 font-medium">
            Lo sentimos, el enlace al que intentas acceder no existe o fue movido de lugar.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6">
          <Button asChild variant="outline" className="w-full sm:w-auto h-12 px-6 rounded-full border-gray-300 font-bold hover:bg-gray-100 transition-colors">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Página Principal
            </Link>
          </Button>
          <Button asChild className="w-full sm:w-auto h-12 px-6 rounded-full bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold transition-all shadow-md hover:shadow-lg">
            <Link href="/dashboard/admin">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Ir al Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
