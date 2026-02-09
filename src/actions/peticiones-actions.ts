'use server'

import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { peticiones, medicamentos, pacientes, type NewPeticion, type Peticion } from '@/db/schema';
import { eq, and, lt, sql } from 'drizzle-orm';
import { comunidades } from '@/db/schema/comunidades';

/**
 * Obtener todas las peticiones con información de paciente y medicamento
 */
export async function getPeticiones() {
    try {
        const result = await db.select({
            id: peticiones.id,
            codigoPeticion: sql<string>`CAST(${peticiones.id} AS CHAR)`, // Convertir a string para compatibilidad
            codigoPaciente: peticiones.codigoPaciente,
            codigoMedicamento: peticiones.codigoMedicamento,
            cantidad: peticiones.cantidad, // Mapear cantidad correctamente
            fechaPeticion: peticiones.fechaPeticion,
            estado: peticiones.estado,
            notas: peticiones.notas, // Mapear notas correctamente
            nombrePaciente: pacientes.nombrePaciente,
            apellidoPaciente: pacientes.apellidoPaciente,
            nombreMedicamento: medicamentos.nombreMedicamento,
            presentacion: medicamentos.presentacion,
            existencia: medicamentos.existencia,
        })
            .from(peticiones)
            .leftJoin(pacientes, eq(peticiones.codigoPaciente, pacientes.cedulaPaciente))
            .leftJoin(medicamentos, eq(peticiones.codigoMedicamento, medicamentos.codigoMedicamento))
            .orderBy(peticiones.fechaPeticion);

        return { success: true, data: result as any[] };
    } catch (error) {
        console.error('Error fetching peticiones:', error);
        return { success: false, error: 'Error al obtener las peticiones' };
    }
}

/**
 * Obtener todos los pacientes para el selector
 */
export async function getPacientes() {
    try {
        const data = await db.select()
            .from(pacientes)
            .leftJoin(comunidades, eq(pacientes.codigoComunidad, comunidades.codigoComunidad));

        const result = data.map(({ pacientes, comunidades }) => ({
            ...pacientes,
            comunidad: comunidades
        }));

        return { success: true, data: result };
    } catch (error) {
        console.error('Error fetching pacientes:', error);
        return { success: false, error: 'Error al obtener los pacientes' };
    }
}

/**
 * Obtener todos los medicamentos con existencia disponible
 */
export async function getMedicamentosDisponibles() {
    try {
        const data = await db.select()
            .from(medicamentos)
            .where(lt(medicamentos.existencia, 0)); // Solo mostrar medicamentos con existencia > 0

        return { success: true, data };
    } catch (error) {
        console.error('Error fetching medicamentos:', error);
        return { success: false, error: 'Error al obtener los medicamentos' };
    }
}

/**
 * Obtener pacientes para select (formato simplificado)
 */
export async function getPacientesForSelect() {
    try {
        const data = await db.select({
            cedulaPaciente: pacientes.cedulaPaciente,
            nombrePaciente: pacientes.nombrePaciente,
            apellidoPaciente: pacientes.apellidoPaciente,
        })
            .from(pacientes);

        return { success: true, data };
    } catch (error) {
        console.error('Error fetching pacientes:', error);
        return { success: false, error: 'Error al obtener los pacientes' };
    }
}

/**
 * Obtener medicamentos para select (formato simplificado)
 */
export async function getMedicamentosForSelect() {
    try {
        const data = await db.select({
            codigoMedicamento: medicamentos.codigoMedicamento,
            nombreMedicamento: medicamentos.nombreMedicamento,
            presentacion: medicamentos.presentacion,
            existencia: medicamentos.existencia,
        })
            .from(medicamentos);

        return { success: true, data };
    } catch (error) {
        console.error('Error fetching medicamentos:', error);
        return { success: false, error: 'Error al obtener los medicamentos' };
    }
}

/**
 * Crear una nueva petición y actualizar existencia del medicamento
 */
export async function createPeticion(data: NewPeticion) {
    try {
        // Validar datos requeridos
        if (!data.codigoPaciente) {
            return { success: false, error: 'El paciente es requerido' };
        }
        if (!data.codigoMedicamento) {
            return { success: false, error: 'El medicamento es requerido' };
        }
        if (!data.cantidad || data.cantidad < 1) {
            return { success: false, error: 'La cantidad debe ser mayor a 0' };
        }

        // Verificar que el medicamento tenga suficiente existencia
        const medicamento = await db.select()
            .from(medicamentos)
            .where(eq(medicamentos.codigoMedicamento, data.codigoMedicamento))
            .limit(1);

        if (!medicamento[0]) {
            return { success: false, error: 'Medicamento no encontrado' };
        }

        if (medicamento[0].existencia < data.cantidad) {
            return { 
                success: false, 
                error: `Existencia insuficiente. Disponible: ${medicamento[0].existencia}, Solicitado: ${data.cantidad}` 
            };
        }

        // Preparar datos para inserción
        const peticionData = {
            codigoPaciente: data.codigoPaciente,
            codigoMedicamento: data.codigoMedicamento,
            cantidad: data.cantidad,
            estado: data.estado || 'pendiente',
            notas: data.notas || null,
        };

        // Iniciar transacción
        await db.transaction(async (tx) => {
            // Crear la petición
            await tx.insert(peticiones).values(peticionData);
            
            // Restar la existencia del medicamento
            await tx.update(medicamentos)
                .set({ 
                    existencia: medicamento[0].existencia - data.cantidad 
                })
                .where(eq(medicamentos.codigoMedicamento, data.codigoMedicamento));
        });

        revalidatePath('/farmacia/peticiones');
        revalidatePath('/farmacia/medicamentos');
        return { success: true, message: 'Petición creada correctamente' };
    } catch (error) {
        console.error('Error creating peticion:', error);
        return { success: false, error: 'Error al crear la petición' };
    }
}

/**
 * Actualizar estado de una petición
 */
export async function updatePeticionEstado(id: number, estado: string) {
    try {
        await db.update(peticiones)
            .set({ estado })
            .where(eq(peticiones.id, id));
            
        revalidatePath('/farmacia/peticiones');
        return { success: true, message: 'Estado actualizado correctamente' };
    } catch (error) {
        console.error('Error updating peticion estado:', error);
        return { success: false, error: 'Error al actualizar el estado' };
    }
}

/**
 * Marcar petición como entregada
 */
export async function marcarComoEntregada(codigoPeticion: string) {
    try {
        const id = parseInt(codigoPeticion);
        return await updatePeticionEstado(id, 'entregado');
    } catch (error) {
        console.error('Error marcando como entregada:', error);
        return { success: false, error: 'Error al marcar como entregada' };
    }
}

/**
 * Eliminar una petición y devolver existencia al medicamento
 */
export async function deletePeticion(id: number) {
    try {
        // Obtener la petición antes de eliminarla
        const peticion = await db.select()
            .from(peticiones)
            .where(eq(peticiones.id, id))
            .limit(1);

        if (!peticion[0]) {
            return { success: false, error: 'Petición no encontrada' };
        }

        // Obtener el medicamento para devolver la existencia
        const medicamento = await db.select()
            .from(medicamentos)
            .where(eq(medicamentos.codigoMedicamento, peticion[0].codigoMedicamento))
            .limit(1);

        if (medicamento[0]) {
            // Iniciar transacción
            await db.transaction(async (tx) => {
                // Eliminar la petición
                await tx.delete(peticiones)
                    .where(eq(peticiones.id, id));
                
                // Devolver la existencia al medicamento
                await tx.update(medicamentos)
                    .set({ 
                        existencia: medicamento[0].existencia + peticion[0].cantidad 
                    })
                    .where(eq(medicamentos.codigoMedicamento, peticion[0].codigoMedicamento));
            });
        } else {
            // Si no encuentra el medicamento, solo elimina la petición
            await db.delete(peticiones)
                .where(eq(peticiones.id, id));
        }

        revalidatePath('/farmacia/peticiones');
        revalidatePath('/farmacia/medicamentos');
        return { success: true, message: 'Petición eliminada correctamente' };
    } catch (error) {
        console.error('Error deleting peticion:', error);
        return { success: false, error: 'Error al eliminar la petición' };
    }
}
