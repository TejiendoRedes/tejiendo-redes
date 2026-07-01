import { NextResponse } from 'next/server';
import { db } from '@/db';
import { comunidades } from '@/db/schema/comunidades';

export async function GET() {
    try {
        const comunidadesList = await db.select({
            codigo_comunidad: comunidades.codigoComunidad,
            nombre_comunidad: comunidades.nombreComunidad,
            estado: comunidades.estado,
            municipio: comunidades.municipio,
            parroquia: comunidades.parroquia,
            tipo_comunidad: comunidades.tipoComunidad,
            direccion: comunidades.direccion
        })
        .from(comunidades);

        return NextResponse.json({
            success: true,
            data: comunidadesList
        });
    } catch (error) {
        console.error('Error fetching comunidades for API v1:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch comunidades' },
            { status: 500 }
        );
    }
}
