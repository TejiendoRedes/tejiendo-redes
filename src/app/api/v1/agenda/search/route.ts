import { NextResponse } from 'next/server';
import { db } from '@/db';
import { pacientes } from '@/db/schema/pacientes';
import { abordaje } from '@/db/schema/abordajes';
import { tejedores } from '@/db/schema/tejedores';
import { like, or, and } from 'drizzle-orm';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        if (!query || query.trim().length < 2) {
            return NextResponse.json({ success: true, data: [] });
        }

        const terms = query.trim().split(/\s+/).map(t => `%${t}%`);

        // Pacientes
        const pacientesConditions = terms.map(term =>
            or(
                like(pacientes.cedulaPaciente, term),
                like(pacientes.nombrePaciente, term),
                like(pacientes.apellidoPaciente, term)
            )
        );

        const pPacientes = db.select({
            id: pacientes.cedulaPaciente,
            nombre: pacientes.nombrePaciente,
            apellido: pacientes.apellidoPaciente
        })
        .from(pacientes)
        .where(and(...pacientesConditions))
        .limit(5);

        // Abordajes
        const abordajeConditions = terms.map(term =>
            or(
                like(abordaje.codigoAbordaje, term),
                like(abordaje.codigoComunidad, term)
            )
        );

        const pAbordajes = db.select({
            id: abordaje.codigoAbordaje,
            comunidad: abordaje.codigoComunidad
        })
        .from(abordaje)
        .where(and(...abordajeConditions))
        .limit(5);

        // Tejedores
        const tejedoresConditions = terms.map(term =>
            or(
                like(tejedores.cedulaTejedor, term),
                like(tejedores.nombreTejedor, term),
                like(tejedores.apellidoTejedor, term)
            )
        );

        const pTejedores = db.select({
            id: tejedores.cedulaTejedor,
            nombre: tejedores.nombreTejedor,
            apellido: tejedores.apellidoTejedor
        })
        .from(tejedores)
        .where(and(...tejedoresConditions))
        .limit(5);

        const [resPacientes, resAbordajes, resTejedores] = await Promise.all([pPacientes, pAbordajes, pTejedores]);

        // Formatear resultados para el equipo de agenda
        const results = [
            ...resPacientes.map(p => ({
                id: p.id,
                type: 'paciente',
                title: `${p.nombre} ${p.apellido}`,
                subtitle: `V-${p.id}`,
            })),
            ...resAbordajes.map(a => ({
                id: a.id,
                type: 'abordaje',
                title: `Abordaje ${a.id}`,
                subtitle: `Comunidad: ${a.comunidad}`,
            })),
            ...resTejedores.map(t => ({
                id: t.id,
                type: 'tejedor',
                title: `${t.nombre} ${t.apellido}`,
                subtitle: `Voluntario: V-${t.id}`,
            }))
        ];

        return NextResponse.json({ success: true, data: results });

    } catch (error) {
        console.error('Error fetching search API:', error);
        return NextResponse.json(
            { success: false, error: 'Error al realizar la búsqueda' },
            { status: 500 }
        );
    }
}
