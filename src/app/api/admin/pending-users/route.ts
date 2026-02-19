import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

/**
 * API: /api/admin/pending-users
 * Obtiene la lista de usuarios pendientes de aprobación
 */
export async function GET() {
    try {
        const session = await getSession();

        if (!session || !['admin', 'superuser'].includes(session.role)) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
        }

        const pending = await db.select({
            id: users.id,
            username: users.username,
            cedulaTejedor: users.cedulaTejedor,
            createdAt: users.createdAt,
            role: users.role
        })
            .from(users)
            .where(eq(users.approved, false));

        return NextResponse.json({ users: pending });

    } catch (error) {
        console.error('Error fetching pending users:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
