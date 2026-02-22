"use server";


import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { antecedentes, type NewAntecedente, type Antecedente } from '@/db/schema/antecedentes';
import { pacientes } from '@/db/schema/pacientes';
import { eq } from 'drizzle-orm';
import { getErrorMessage } from '@/lib/error-handler';
import { getNextCode } from '@/lib/id-generator';
import { requireAuth } from '@/lib/auth';

/**
 * Obtener el siguiente código correlativo para un antecedente
 */
export async function getNextAntecedenteCodigo() {
    try {
        await requireAuth();
        const nextCode = await getNextCode(antecedentes, antecedentes.codigoAntecedente, 'ANT-');
        return { success: true, data: nextCode };
    } catch (error) {
        console.error('Error generating next code:', error);
        return { success: false, error: 'Error al generar el siguiente código' };
    }
}

/**
 * Obtener todos los antecedentes con la información del paciente
 */
export async function getAntecedentes() {
    try {
        await requireAuth();
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
        const errorMessage = getErrorMessage(error, 'los antecedentes', 'obtener');
        return { success: false, error: errorMessage };
    }
}

