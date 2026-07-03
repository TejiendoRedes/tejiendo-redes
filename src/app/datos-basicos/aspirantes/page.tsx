import { getAspirantes } from '@/queries/aspirantes';
import AspirantesClient from '@/components/features/aspirantes/aspirantes-client';
import { MainLayout } from '@/components/layout/MainLayout';
import { getSession } from '@/lib/auth';

export default async function AspirantesPage() {
    // 1. Obtenemos la sesión y los datos
    const session = await getSession();
    const canManage = session ? ['admin', 'superuser', 'operador'].includes(session.role) : false;
    const { data: aspirantes, success, error } = await getAspirantes();

    if (!success) {
        return (
            <MainLayout>
                <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-lg border border-dashed border-gray-300">
                    <div className="text-red-500 mb-4">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="Refrescar12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Error al cargar datos</h2>
                    <p className="text-gray-600">{error || 'No se pudo conectar con la base de datos.'}</p>
                </div>
            </MainLayout>
        );
    }

    return <AspirantesClient initialData={aspirantes || []} canManage={canManage} />;
}