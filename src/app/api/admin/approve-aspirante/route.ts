import { NextResponse } from 'next/server';
import { db } from '@/db';
import { aspirantes, auditLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';
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
            const nuevoEstado = approve ? 'Aprobado' : 'Rechazado';

            await tx.update(aspirantes)
                .set({ estadoAspirante: nuevoEstado })
                .where(eq(aspirantes.cedulaAspirante, cedulaAspirante));

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

    } catch (error) {
        console.error('Error approving aspirante:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
