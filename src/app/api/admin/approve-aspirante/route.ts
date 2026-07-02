import { NextResponse } from 'next/server';
import { db } from '@/db';
import { aspirantes, auditLogs, tejedores, users } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

/**
 * API: /api/admin/approve-aspirante
 * Permite a un Admin o Superusuario aprobar o rechazar a un nuevo aspirante
 */
export async function POST(request: Request) {
    try {
        const session = await getSession();

        if (!session || !['admin', 'superuser'].includes(session.role)) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
        }

        const { cedulaAspirante, approve } = await request.json();

        if (!cedulaAspirante) {
            return NextResponse.json({ error: 'Cédula de aspirante requerida' }, { status: 400 });
        }

        const [aspirante] = await db.select()
            .from(aspirantes)
            .where(eq(aspirantes.cedulaAspirante, cedulaAspirante))
            .limit(1);

        if (!aspirante) {
            return NextResponse.json({ error: 'Aspirante no encontrado' }, { status: 404 });
        }

        await db.transaction(async (tx) => {
            if (approve) {
                // Verificar que no exista ya un tejedor con esta cédula
                const existingTejedor = await tx.select()
                    .from(tejedores)
                    .where(eq(tejedores.cedulaTejedor, cedulaAspirante))
                    .limit(1);

                if (existingTejedor.length > 0) {
                    throw new Error('Ya existe un tejedor con esta cédula');
                }

                // Insertar en la tabla de tejedores
                await tx.insert(tejedores).values({
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
                    fechaPromocion: new Date(),
                    tipodeVoluntario: 'Tejedor Oficial',
                });

                // Eliminar el aspirante ya que ahora es un tejedor
                await tx.delete(aspirantes)
                    .where(eq(aspirantes.cedulaAspirante, cedulaAspirante));

                // Buscar el usuario asociado y aprobarlo
                const [log] = await tx.select()
                    .from(auditLogs)
                    .where(and(
                        eq(auditLogs.action, 'NEW_ASPIRANTE_POSTULATION'),
                        eq(auditLogs.entityId, cedulaAspirante)
                    ))
                    .orderBy(desc(auditLogs.id))
                    .limit(1);

                if (log && log.details) {
                    const parts = log.details.split(': ');
                    if (parts.length > 1) {
                        const username = parts[1].trim();
                        await tx.update(users)
                            .set({ approved: true, cedulaTejedor: cedulaAspirante })
                            .where(eq(users.username, username));
                    }
                }
            } else {
                // Si es rechazado, solo actualizamos el estado
                await tx.update(aspirantes)
                    .set({ estadoAspirante: 'Rechazado' })
                    .where(eq(aspirantes.cedulaAspirante, cedulaAspirante));
            }

            // Registrar auditoría
            await tx.insert(auditLogs).values({
                userId: session.id as number,
                action: approve ? 'APPROVE_ASPIRANTE' : 'REJECT_ASPIRANTE',
                entity: 'ASPIRANTES',
                entityId: cedulaAspirante,
                details: `${approve ? 'Aprobado' : 'Rechazado'} aspirante: ${aspirante.nombreAspirante} ${aspirante.apellidoAspirante}`,
            });
        });

        return NextResponse.json({
            success: true,
            message: approve ? 'Aspirante aprobado con éxito' : 'Aspirante rechazado'
        });

    } catch (error: any) {
        console.error('Error approving aspirante:', error);
        if (error.message === 'Ya existe un tejedor con esta cédula') {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
