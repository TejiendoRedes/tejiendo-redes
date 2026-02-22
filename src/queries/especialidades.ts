"use server";


import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { especialidades, type NewEspecialidad, type Especialidad } from '@/db/schema/especialidades';
import { eq } from 'drizzle-orm';
import { getErrorMessage } from '@/lib/error-handler';
import { getNextCode } from '@/lib/id-generator';
import { requireAuth } from '@/lib/auth';

/**
 * Obtener todas las especialidades
 */
export async function getEspecialidades() {
    try {
        await requireAuth();
        const data = await db.select().from(especialidades);
        return { success: true, data };
    } catch (error) {
        console.error('Error fetching especialidades:', error);
        return { success: false, error: 'Error al obtener las especialidades' };
    }
}

