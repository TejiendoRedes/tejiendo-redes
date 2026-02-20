import { NextResponse } from 'next/server';
import { db } from '@/db';
import { aspirantes } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

/**
 * API: /api/admin/pending-aspirantes
 * Obtiene la lista de aspirantes pendientes de revisión
 */
export async function GET() {
    try {
        const session = await getSession();

        if (!session || !['admin', 'superuser'].includes(session.role)) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
        }

        const pending = await db.select()
            .from(aspirantes)
            .where(eq(aspirantes.estadoAspirante, 'Pendiente'))
            .orderBy(desc(aspirantes.fechaPostulacion));

        return NextResponse.json({ aspirantes: pending });

    } catch (error) {
        console.error('Error fetching pending aspirantes:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
