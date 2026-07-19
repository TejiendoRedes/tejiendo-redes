'use server'

import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { tejedores, type NewTejedor, type Tejedor } from '@/db/schema/tejedores';
import { tejedoresAbordaje } from '@/db/schema/relations';
import { abordaje } from '@/db/schema/abordajes';
import { consultas } from '@/db/schema/consultas';
import { pacientes } from '@/db/schema/pacientes';
import { medicamentos } from '@/db/schema/medicamentos';
import { medicos } from '@/db/schema/medicos';
import { eq, desc, sql } from 'drizzle-orm';
import { getErrorMessage, DeleteErrorMessages } from '@/lib/error-handler';
import { requireAuth } from '@/lib/auth';
import { users } from '@/db/schema/users';

/**
 * Obtener todos los tejedores
 */

import { toTitleCase } from '@/lib/string-utils';

/**
 * Crear un nuevo tejedor
 */
export async function createTejedor(data: NewTejedor & { codigoEspecialidad?: string, matriculaColegioMedico?: string, matriculaSanidad?: string }) {
    try {
        const session = await requireAuth();
        if (!['admin', 'superuser'].includes(session.role)) {
            return { success: false, error: 'No autorizado para crear tejedores' };
        }

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

        // Formateo de texto
        data.nombreTejedor = toTitleCase(data.nombreTejedor.trim());
        data.apellidoTejedor = toTitleCase(data.apellidoTejedor.trim());

        const { codigoEspecialidad, matriculaColegioMedico, matriculaSanidad, ...tejedorData } = data;

        await db.transaction(async (tx) => {
            await tx.insert(tejedores).values(tejedorData);
            
            if (tejedorData.profesionTejedor === 'Médico' && codigoEspecialidad) {
                await tx.insert(medicos).values({
                    cedulaTejedor: tejedorData.cedulaTejedor,
                    codigoEspecialidad: codigoEspecialidad,
                    matriculaColegioMedico: matriculaColegioMedico || 'N/A',
                    matriculaSanidad: matriculaSanidad || 'N/A'
                });
            }
        });

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
export async function updateTejedor(cedula: string, data: Partial<NewTejedor> & { systemRole?: string, codigoEspecialidad?: string, matriculaColegioMedico?: string, matriculaSanidad?: string }) {
    try {
        const session = await requireAuth();
        if (!['admin', 'superuser'].includes(session.role)) {
            return { success: false, error: 'No autorizado para editar tejedores' };
        }

        // Separar data extra
        const { systemRole, codigoEspecialidad, matriculaColegioMedico, matriculaSanidad, ...tejedorData } = data;

        // Verificar que el tejedor existe
        const existing = await db.select()
            .from(tejedores)
            .where(eq(tejedores.cedulaTejedor, cedula))
            .limit(1);

        if (!existing || existing.length === 0) {
            return { success: false, error: 'El tejedor no fue encontrado' };
        }

        await db.transaction(async (tx) => {
            // Formateo de texto
            if (tejedorData.nombreTejedor) {
                tejedorData.nombreTejedor = toTitleCase(tejedorData.nombreTejedor.trim());
            }
            if (tejedorData.apellidoTejedor) {
                tejedorData.apellidoTejedor = toTitleCase(tejedorData.apellidoTejedor.trim());
            }

            // Actualizar datos del tejedor
            if (Object.keys(tejedorData).length > 0) {
                await tx.update(tejedores)
                    .set(tejedorData)
                    .where(eq(tejedores.cedulaTejedor, cedula));
            }

            // Actualizar el rol del sistema si fue proporcionado
            if (systemRole) {
                await tx.update(users)
                    .set({ role: systemRole as any })
                    .where(eq(users.cedulaTejedor, cedula));
            }

            // Gestionar la relación con Médicos
            if (tejedorData.profesionTejedor === 'Médico' && codigoEspecialidad) {
                const existingMedico = await tx.select().from(medicos).where(eq(medicos.cedulaTejedor, cedula)).limit(1);
                if (existingMedico && existingMedico.length > 0) {
                    await tx.update(medicos).set({
                        codigoEspecialidad: codigoEspecialidad,
                        matriculaColegioMedico: matriculaColegioMedico || 'N/A',
                        matriculaSanidad: matriculaSanidad || 'N/A'
                    }).where(eq(medicos.cedulaTejedor, cedula));
                } else {
                    await tx.insert(medicos).values({
                        cedulaTejedor: cedula,
                        codigoEspecialidad: codigoEspecialidad,
                        matriculaColegioMedico: matriculaColegioMedico || 'N/A',
                        matriculaSanidad: matriculaSanidad || 'N/A'
                    });
                }
            } else if (tejedorData.profesionTejedor && tejedorData.profesionTejedor !== 'Médico') {
                // Si cambió la profesión y ya no es Médico, eliminamos de la tabla médicos si existe
                await tx.delete(medicos).where(eq(medicos.cedulaTejedor, cedula));
            }
        });

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
        const session = await requireAuth();
        if (!['admin', 'superuser'].includes(session.role)) {
            return { success: false, error: 'No autorizado para eliminar tejedores' };
        }

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
            if (errorMsg.includes('entregas_medicamentos') || errorMsg.includes('entregas_')) {
                return { success: false, error: 'No se puede eliminar el tejedor porque tiene entregas de medicamentos asociadas.' };
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
