'use server'

import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { aspirantes } from '@/db/schema/aspirantes';
import { tejedores } from '@/db/schema/tejedores';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';

/**
 * Promover un aspirante a tejedor
 */
export async function promoteAspiranteToTejedor(cedulaAspirante: string) {
    try {
        await requireAuth();
        // Primero obtener los datos del aspirante
        const aspiranteData = await db.select()
            .from(aspirantes)
            .where(eq(aspirantes.cedulaAspirante, cedulaAspirante))
            .limit(1);

        if (!aspiranteData.length) {
            return { success: false, error: 'Aspirante no encontrado' };
        }

        const aspirante = aspiranteData[0];

        // Crear el tejedor con los datos del aspirante
        const tejedorData = {
            cedulaTejedor: aspirante.cedulaAspirante,
            nombreTejedor: aspirante.nombreAspirante,
            apellidoTejedor: aspirante.apellidoAspirante,
            fechaNacimiento: aspirante.fechaNacimiento,
            direccionTejedor: aspirante.direccionAspirante,
            municipioTejedor: aspirante.municipioAspirante,
            estadoTejedor: aspirante.estadoDireccionAspirante,
            parroquiaTejedor: aspirante.parroquiaAspirante,
            telefonoTejedor: aspirante.telefonoAspirante,
            correoTejedor: aspirante.correoAspirante,
            profesionTejedor: aspirante.profesionAspirante,
            fechaIngreso: new Date(),
            fechaPromocion: new Date(), // Fecha actual de promoción
            tipodeVoluntario: 'Tejedor Oficial',
        };

        // Realizar ambas operaciones en una transacción para asegurar la integridad de los datos
        await db.transaction(async (tx) => {
            // 1. Insertar el nuevo tejedor
            await tx.insert(tejedores).values(tejedorData);

            // 2. Eliminar el aspirante ya que ahora es un tejedor (ya no es necesario en la tabla de aspirantes)
            await tx.delete(aspirantes)
                .where(eq(aspirantes.cedulaAspirante, cedulaAspirante));
        });

        // Revalidar las rutas
        revalidatePath('/datos-basicos/aspirantes');
        revalidatePath('/datos-basicos/tejedores');

        return {
            success: true,
            message: `${aspirante.nombreAspirante} ${aspirante.apellidoAspirante} ha sido promovido a Tejedor Oficial exitosamente`
        };

    } catch (error) {
        console.error('Error promoting aspirante:', error);
        return { success: false, error: 'Error al promover aspirante a tejedor' };
    }
}
