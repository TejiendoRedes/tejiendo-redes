'use server'

import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { tejedores, type NewTejedor, type Tejedor } from '@/db/schema/tejedores';
import { tejedoresAbordaje, medicamentosPacientes } from '@/db/schema/relations';
import { abordaje } from '@/db/schema/abordajes';
import { consultas } from '@/db/schema/consultas';
import { pacientes } from '@/db/schema/pacientes';
import { medicamentos } from '@/db/schema/medicamentos';
import { eq, desc, sql } from 'drizzle-orm';
import { getErrorMessage, DeleteErrorMessages } from '@/lib/error-handler';
import { requireAuth } from '@/lib/auth';

/**
 * Obtener todos los tejedores
 */

/**
 * Crear un nuevo tejedor
 */
export async function createTejedor(data: NewTejedor) {
    try {
        await requireAuth();
        // Validaciones básicas
        if (!data.cedulaTejedor?.trim()) {
            return { success: false, error: 'La cédula es requerida' };
        }
        if (!data.nombreTejedor?.trim()) {
            return { success: false, error: 'El nombre es requerido' };
        }
        if (!data.apellidoTejedor?.trim()) {
            return { success: false, error: 'El apellido es requerido' };
        }

        await db.insert(tejedores).values(data);
        revalidatePath('/datos-basicos/tejedores');
        return { success: true, message: 'Tejedor creado correctamente' };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'el tejedor', 'crear', {
            duplicate: 'Ya existe un tejedor con esta cédula. Por favor, verifica los datos.',
        });
        return { success: false, error: errorMessage };
    }
}

/**
 * Actualizar un tejedor existente
 */
export async function updateTejedor(cedula: string, data: Partial<NewTejedor>) {
    try {
        await requireAuth();
        // Verificar que el tejedor existe
        const existing = await db.select()
            .from(tejedores)
            .where(eq(tejedores.cedulaTejedor, cedula))
            .limit(1);

        if (!existing || existing.length === 0) {
            return { success: false, error: 'El tejedor no fue encontrado' };
        }

        await db.update(tejedores)
            .set(data)
            .where(eq(tejedores.cedulaTejedor, cedula));
        revalidatePath('/datos-basicos/tejedores');
        return { success: true, message: 'Tejedor actualizado correctamente' };
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'el tejedor', 'actualizar');
        return { success: false, error: errorMessage };
    }
}

/**
 * Eliminar un tejedor
 */
export async function deleteTejedor(cedula: string) {
    try {
        await requireAuth();
        // Verificar que el tejedor existe antes de eliminar
        const existing = await db.select()
            .from(tejedores)
            .where(eq(tejedores.cedulaTejedor, cedula))
            .limit(1);

        if (!existing || existing.length === 0) {
            return { success: false, error: 'El tejedor no fue encontrado' };
        }

        await db.delete(tejedores)
            .where(eq(tejedores.cedulaTejedor, cedula));
        revalidatePath('/datos-basicos/tejedores');
        return { success: true, message: 'Tejedor eliminado correctamente' };
    } catch (error: any) {
        // Detectar el tipo específico de error de FK
        // En Drizzle, el error de MySQL está en error.cause
        const mysqlError = error?.cause || error;
        const errorCode = mysqlError?.code || error?.code;
        const errorMsg = mysqlError?.sqlMessage || mysqlError?.message || error?.message || '';

        if (errorCode === 'ER_ROW_IS_REFERENCED_2' || errorMsg.includes('foreign key constraint')) {

            // Verificar qué tabla está causando el problema
            if (errorMsg.includes('tejedores_abordaje') || errorMsg.includes('tej_ab_')) {
                return { success: false, error: DeleteErrorMessages.tejedor.conAbordajes() };
            }
            if (errorMsg.includes('medicamentos_pacientes') || errorMsg.includes('med_pac_')) {
                return { success: false, error: DeleteErrorMessages.tejedor.conEntregas() };
            }
            if (errorMsg.includes('medicos')) {
                return { success: false, error: DeleteErrorMessages.tejedor.conMedico() };
            }

            // Mensaje genérico si no sabemos la causa exacta
            return { success: false, error: DeleteErrorMessages.tejedor.generic() };
        }

        const errorMessage = getErrorMessage(error, 'el tejedor', 'eliminar');
        return { success: false, error: errorMessage };
    }
}

/**
 * Obtener un tejedor por cédula
 */

/**
 * Obtener el historial completo de un tejedor (abordajes participados, consultas realizadas, entregas realizadas)
 */
