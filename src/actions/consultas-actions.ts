'use server'

import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { consultas, type NewConsulta } from '@/db/schema/consultas';
import { consultasEnfermedades, type NewConsultaEnfermedad } from '@/db/schema/relations';
import { abordaje } from '@/db/schema/abordajes';
import { pacientes } from '@/db/schema/pacientes';
import { especialidades } from '@/db/schema/especialidades';
import { medicos } from '@/db/schema/medicos';
import { eq, inArray, sql } from 'drizzle-orm';
import { tejedores } from '@/db/schema/tejedores';

/**
 * Validar si un código ya existe
 */
async function checkCodeExists(codigo: string) {
    const existing = await db.select({ codigo: consultas.codigoConsulta })
        .from(consultas)
        .where(eq(consultas.codigoConsulta, codigo))
        .limit(1);
    return existing.length > 0;
}

/**
 * Obtener todas las consultas con relaciones
 */
export async function getConsultas() {
    try {
        // En un caso real masiva, esto deberia tener paginacion y filtros
        const data = await db.select({
            consulta: consultas,
            nombrePaciente: sql<string>`concat(${pacientes.nombrePaciente}, ' ', ${pacientes.apellidoPaciente})`,
            nombreMedico: sql<string>`concat(${tejedores.nombreTejedor}, ' ', ${tejedores.apellidoTejedor})`,
            codigoAbordaje: abordaje.codigoAbordaje,
            fechaAbordaje: abordaje.fechaAbordaje,
        })
            .from(consultas)
            .leftJoin(pacientes, eq(consultas.cedulaPaciente, pacientes.cedulaPaciente))
            .leftJoin(medicos, eq(consultas.cedulaMedico, medicos.cedulaTejedor))
            .leftJoin(tejedores, eq(medicos.cedulaTejedor, tejedores.cedulaTejedor))
            .leftJoin(abordaje, eq(consultas.codigoAbordaje, abordaje.codigoAbordaje));

        // Para evitar N+1, podriamos traer las enfermedades en un segundo query si son necesarias para la lista
        // Por ahora, solo retornamos los datos basicos para la tabla
        return { success: true, data };
    } catch (error) {
        console.error('Error fetching consultas:', error);
        return { success: false, error: 'Error al obtener las consultas' };
    }
}

/**
 * Obtener enfermedades asociadas a una consulta
 */
export async function getEnfermedadesByConsulta(codigoConsulta: string) {
    try {
        const data = await db.select()
            .from(consultasEnfermedades)
            .where(eq(consultasEnfermedades.codigoConsulta, codigoConsulta));
        return { success: true, data };
    } catch (error) {
        console.error('Error fetching consulta enfermedades:', error);
        return { success: false, error: 'Error al obtener enfermedades de la consulta' };
    }
}

/**
 * Crear una nueva consulta con sus enfermedades asociadas
 */
export async function createConsulta(
    data: NewConsulta,
    enfermedadesIds: string[]
) {
    try {
        if (await checkCodeExists(data.codigoConsulta)) {
            return { success: false, error: 'El código de consulta ya existe' };
        }

        await db.transaction(async (tx) => {
            // 1. Insert Consulta
            await tx.insert(consultas).values(data);

            // 2. Insert Enfermedades Relations
            if (enfermedadesIds.length > 0) {
                const relations: NewConsultaEnfermedad[] = enfermedadesIds.map(id => ({
                    codigoConsulta: data.codigoConsulta,
                    codigoEnfermedad: id
                }));
                await tx.insert(consultasEnfermedades).values(relations);
            }
        });

        revalidatePath('/datos-basicos/consultas');
        return { success: true, message: 'Consulta creada correctamente' };
    } catch (error) {
        console.error('Error creating consulta:', error);
        return { success: false, error: 'Error al crear la consulta' };
    }
}

/**
 * Actualizar una consulta y sus enfermedades
 */
export async function updateConsulta(
    codigo: string,
    data: Partial<NewConsulta>,
    enfermedadesIds: string[]
) {
    try {
        await db.transaction(async (tx) => {
            // 1. Update Consulta
            await tx.update(consultas)
                .set(data)
                .where(eq(consultas.codigoConsulta, codigo));

            // 2. Sync Enfermedades: Delete old ones and insert new ones
            // This is a naive "replace all" strategy which is safe for simple many-to-many
            await tx.delete(consultasEnfermedades)
                .where(eq(consultasEnfermedades.codigoConsulta, codigo));

            if (enfermedadesIds.length > 0) {
                const relations: NewConsultaEnfermedad[] = enfermedadesIds.map(id => ({
                    codigoConsulta: codigo,
                    codigoEnfermedad: id
                }));
                await tx.insert(consultasEnfermedades).values(relations);
            }
        });

        revalidatePath('/datos-basicos/consultas');
        return { success: true, message: 'Consulta actualizada correctamente' };
    } catch (error) {
        console.error('Error updating consulta:', error);
        return { success: false, error: 'Error al actualizar la consulta' };
    }
}

/**
 * Eliminar una consulta
 */
export async function deleteConsulta(codigo: string) {
    try {
        // Cascade delete should handle children, but explicit delete is safer sometimes depending on DB config
        // defined in schema as cascade, so just deleting parent is enough.
        await db.delete(consultas)
            .where(eq(consultas.codigoConsulta, codigo));
        revalidatePath('/datos-basicos/consultas');
        return { success: true, message: 'Consulta eliminada correctamente' };
    } catch (error) {
        console.error('Error deleting consulta:', error);
        return { success: false, error: 'Error al eliminar la consulta' };
    }
}

export async function saveConsultaWizard(consultaData: any, enfermedadesIds: string[], antecedentesData: any, editingId?: string) {
    try {
        await db.transaction(async (tx) => {
            const codigo = editingId || consultaData.codigoConsulta || `CNS-${Date.now().toString().slice(-6)}`;
            const newConsulta = {
                codigoConsulta: codigo,
                codigoAbordaje: consultaData.codigoAbordaje || null,
                cedulaPaciente: consultaData.cedulaPaciente,
                cedulaMedico: consultaData.cedulaMedico,
                motivoConsulta: consultaData.motivoConsulta || '',
                diagnosticoTexto: consultaData.diagnosticoTexto || '',
                tratamiento: consultaData.tratamiento || '',
                recomendaciones: consultaData.recomendaciones || '',
                tensionArterial: antecedentesData.TA || null,
                fechaConsulta: new Date(),
            };
            
            // Check if exists
            const existing = await tx.select({ c: consultas.codigoConsulta }).from(consultas).where(eq(consultas.codigoConsulta, codigo));
            if (existing.length > 0) {
                await tx.update(consultas).set(newConsulta as any).where(eq(consultas.codigoConsulta, codigo));
            } else {
                await tx.insert(consultas).values(newConsulta as any);
            }
            
            // Sync enfermedades
            await tx.delete(consultasEnfermedades).where(eq(consultasEnfermedades.codigoConsulta, codigo));
            if (enfermedadesIds && enfermedadesIds.length > 0) {
                const rels = enfermedadesIds.map(id => ({ codigoConsulta: codigo, codigoEnfermedad: id }));
                await tx.insert(consultasEnfermedades).values(rels);
            }
            
            // Update patient records with antecedents
            await tx.update(pacientes)
                .set({
                    historialEnfermedades: antecedentesData.enfermedadesPrevias || antecedentesData.historialEnfermedades || null,
                    consultasMedicasPrevias: antecedentesData.consultasMedicasPrevias || null,
                    nota: antecedentesData.nota || null,
                })
                .where(eq(pacientes.cedulaPaciente, consultaData.cedulaPaciente));
        });
        revalidatePath('/atencion-medica');
        revalidatePath('/datos-basicos/consultas');
        return { success: true, message: editingId ? 'Consulta actualizada correctamente' : 'Consulta guardada exitosamente' };
    } catch (error: any) {
        console.error('Error guardando consulta wizard:', error);
        return { success: false, error: 'Error al guardar la consulta' };
    }
}
