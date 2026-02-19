import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, auditLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

/**
 * API: /api/admin/approve-user
 * Permite a un Admin o Superusuario aprobar o rechazar a un nuevo tejedor
 */
export async function POST(request: Request) {
    try {
        const session = await getSession();

        // Verificación de seguridad (Middleware ya filtra por rol, pero doble verificación por seguridad)
        if (!session || !['admin', 'superuser'].includes(session.role)) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
        }

        const { userId, approve } = await request.json();

        if (typeof userId !== 'number') {
            return NextResponse.json({ error: 'ID de usuario inválido' }, { status: 400 });
        }

        const [userToUpdate] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

        if (!userToUpdate) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        await db.transaction(async (tx) => {
            if (approve) {
                // Aprobar usuario
                await tx.update(users)
                    .set({ approved: true, updatedAt: new Date() })
                    .where(eq(users.id, userId));

                // Registrar auditoría
                await tx.insert(auditLogs).values({
                    userId: session.id as number,
                    action: 'APPROVE_USER',
                    entity: 'USERS',
                    entityId: userId.toString(),
                    details: `Aprobado tejedor: ${userToUpdate.username}`,
                });
            } else {
                // Rechazar (Eliminar usuario si es rechazado antes de ser aprobado)
                await tx.delete(users).where(eq(users.id, userId));

                // Registrar auditoría
                await tx.insert(auditLogs).values({
                    userId: session.id as number,
                    action: 'REJECT_USER',
                    entity: 'USERS',
                    entityId: userId.toString(),
                    details: `Rechazado y eliminado tejedor: ${userToUpdate.username}`,
                });
            }
        });

        return NextResponse.json({
            success: true,
            message: approve ? 'Usuario aprobado con éxito' : 'Usuario rechazado y eliminado'
        });

    } catch (error) {
        console.error('Error approving user:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
