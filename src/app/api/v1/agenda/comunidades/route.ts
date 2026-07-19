import { NextResponse } from 'next/server';
import { db } from '@/db';
import { comunidades } from '@/db/schema/comunidades';
import { estados, municipios, parroquias } from '@/db/schema/geografia';
import { eq } from 'drizzle-orm';

export async function GET() {
    try {
        const comunidadesList = await db.select({
            codigo_comunidad: comunidades.codigoComunidad,
            nombre_comunidad: comunidades.nombreComunidad,
            estado: estados.nombre,
            municipio: municipios.nombre,
            parroquia: parroquias.nombre,
            tipo_comunidad: comunidades.tipoComunidad,
            direccion: comunidades.direccion
        })
        .from(comunidades)
        .leftJoin(parroquias, eq(comunidades.parroquiaId, parroquias.id))
        .leftJoin(municipios, eq(parroquias.municipioId, municipios.id))
        .leftJoin(estados, eq(municipios.estadoId, estados.id));

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
