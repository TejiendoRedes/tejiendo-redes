import { NextResponse } from 'next/server';
import { db } from '@/db';
import { abordaje } from '@/db/schema/abordajes';
import { like, or, and } from 'drizzle-orm';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        if (!query || query.trim().length < 2) {
            return NextResponse.json({ success: true, data: [] });
        }

        const terms = query.trim().split(/\s+/).map(t => `%${t}%`);

        // Abordajes
        const abordajeConditions = terms.map(term =>
            or(
                like(abordaje.codigoAbordaje, term),
                like(abordaje.codigoComunidad, term)
            )
        );

        const pAbordajes = await db.select({
            id: abordaje.codigoAbordaje,
            comunidad: abordaje.codigoComunidad,
            fecha: abordaje.fechaAbordaje,
            estado: abordaje.estado
        })
        .from(abordaje)
        .where(and(...abordajeConditions))
        .limit(10);

        // Formatear resultados para el equipo de agenda
        const results = pAbordajes.map(a => ({
            id: a.id,
            type: 'abordaje',
            title: `Abordaje ${a.id}`,
            subtitle: `Comunidad: ${a.comunidad}`,
            fecha: a.fecha,
            estado: a.estado
        }));

        return NextResponse.json({ success: true, data: results });

    } catch (error) {
        console.error('Error fetching search API:', error);
        return NextResponse.json(
            { success: false, error: 'Error al realizar la búsqueda' },
            { status: 500 }
        );
    }
}
