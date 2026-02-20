import { NextResponse } from 'next/server';
import { db } from '@/db';
import { aspirantes, abordaje, consultas, comunidades } from '@/db/schema';
import { eq, and, or, desc, count, sql } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

/**
 * API: /api/admin/stats
 * Obtiene estadísticas generales para el dashboard administrativo
 */
export async function GET() {
    try {
        const session = await getSession();

        if (!session || !['admin', 'superuser'].includes(session.role)) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
        }

        // 1. Aspirantes Pendientes
        const [pendingCount] = await db.select({
            value: count()
        })
            .from(aspirantes)
            .where(eq(aspirantes.estadoAspirante, 'Pendiente'));

        // 2. Abordajes Activos (Planificado o En curso)
        const [activeCount] = await db.select({
            value: count()
        })
            .from(abordaje)
            .where(or(
                eq(abordaje.estado, 'Planificado'),
                eq(abordaje.estado, 'En curso')
            ));

        // 3. Total de Consultas (Reportes)
        const [consultasCount] = await db.select({
            value: count()
        })
            .from(consultas);

        // 4. Abordajes Recientes (últimos 5)
        const recent = await db.select({
            codigo: abordaje.codigoAbordaje,
            comunidad: comunidades.nombreComunidad,
            fecha: abordaje.fechaAbordaje,
            estado: abordaje.estado
        })
            .from(abordaje)
            .innerJoin(comunidades, eq(abordaje.codigoComunidad, comunidades.codigoComunidad))
            .orderBy(desc(abordaje.fechaAbordaje))
            .limit(5);

        return NextResponse.json({
            stats: {
                pendingUsers: pendingCount?.value || 0,
                activeAbordajes: activeCount?.value || 0,
                totalConsultas: consultasCount?.value || 0
            },
            recentAbordajes: recent
        });

    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
