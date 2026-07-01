import { NextResponse } from 'next/server';
import { db } from '@/db';
import { abordaje } from '@/db/schema/abordajes';
import { desc } from 'drizzle-orm';

export async function GET() {
    try {
        const abordajesList = await db.select({
            codigo_abordaje: abordaje.codigoAbordaje,
            codigo_comunidad: abordaje.codigoComunidad,
            fecha_abordaje: abordaje.fechaAbordaje,
            hora_inicio: abordaje.horaInicio,
            hora_fin: abordaje.horaFin,
            estado: abordaje.estado,
            descripcion: abordaje.descripcion,
            tipo_abordaje: abordaje.tipoAbordaje,
            participantes_estimados: abordaje.participantesEstimados
        })
        .from(abordaje)
        .orderBy(desc(abordaje.fechaAbordaje));

        return NextResponse.json({
            success: true,
            data: abordajesList
        });
    } catch (error) {
        console.error('Error fetching abordajes for API v1:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch abordajes' },
            { status: 500 }
        );
    }
}
