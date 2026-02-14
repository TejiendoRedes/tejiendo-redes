'use server'

import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { antecedentes, type NewAntecedente, type Antecedente } from '@/db/schema/antecedentes';
import { pacientes } from '@/db/schema/pacientes';
import { eq } from 'drizzle-orm';

/**
 * Obtener todos los antecedentes con la información del paciente
 */
export async function getAntecedentes() {
    try {
        const result = await db.select()
            .from(antecedentes)
            .leftJoin(pacientes, eq(antecedentes.cedulaPaciente, pacientes.cedulaPaciente));

        // Transformar data para el cliente
        const data = result.map(({ antecedentes, pacientes }) => ({
            ...antecedentes,
            paciente: pacientes
        }));

        return { success: true, data };
    } catch (error) {
        console.error('Error fetching antecedentes:', error);
        return { success: false, error: 'Error al obtener los antecedentes' };
    }
}

/**
 * Crear un nuevo antecedente
 */
export async function createAntecedente(data: NewAntecedente) {
    try {
        // Verificar si ya existe el código
        const existing = await db.select().from(antecedentes).where(eq(antecedentes.codigoAntecedente, data.codigoAntecedente));
        if (existing.length > 0) {
            return { success: false, error: 'El código de antecedente ya existe' };
        }

        await db.insert(antecedentes).values(data);
        revalidatePath('/datos-basicos/antecedentes');
        return { success: true, message: 'Antecedente creado correctamente' };
    } catch (error) {
        console.error('Error creating antecedente:', error);
        return { success: false, error: 'Error al crear el antecedente' };
    }
}

/**
 * Actualizar un antecedente
 */
export async function updateAntecedente(codigo: string, data: Partial<NewAntecedente>) {
    try {
        await db.update(antecedentes)
            .set(data)
            .where(eq(antecedentes.codigoAntecedente, codigo));
        revalidatePath('/datos-basicos/antecedentes');
        return { success: true, message: 'Antecedente actualizado correctamente' };
    } catch (error) {
        console.error('Error updating antecedente:', error);
        return { success: false, error: 'Error al actualizar el antecedente' };
    }
}

/**
 * Eliminar un antecedente
 */
export async function deleteAntecedente(codigo: string) {
    try {
        await db.delete(antecedentes)
            .where(eq(antecedentes.codigoAntecedente, codigo));
        revalidatePath('/datos-basicos/antecedentes');
        return { success: true, message: 'Antecedente eliminado correctamente' };
    } catch (error) {
        console.error('Error deleting antecedente:', error);
        return { success: false, error: 'Error al eliminar el antecedente' };
    }
}
