"use server";


import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';

/**
 * MOCK: Obtener la configuración actual de backup (Ejemplo visual)
 */
export async function getConfiguracionBackup() {
    try {
        await requireAuth();
        // Retornar datos de ejemplo para demostración visual
        const mockConfig = {
            id: 1,
            frecuencia: 'semanal',
            autoRefresh: false,
            ultimaCopia: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // Hace 2 días
            proximaCopia: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5), // En 5 días
        };

        return { success: true, data: mockConfig };
    } catch (error) {
        return { success: false, error: 'Error al obtener la configuración' };
    }
}

/**
 * MOCK: Actualizar la configuración de backup (Ejemplo visual)
 */

/**
 * MOCK: Disparar una copia de seguridad manual (Ejemplo visual)
 */
