'use server'

import { db } from '@/db';
import { pacientes } from '@/db/schema/pacientes';
import { abordaje } from '@/db/schema/abordajes';
import { tejedores } from '@/db/schema/tejedores';
import { like, or, and } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';

export type SearchResultType = 'paciente' | 'abordaje' | 'tejedor';

export interface SearchResult {
    id: string;
    type: SearchResultType;
    title: string;
    subtitle?: string;
    url: string;
}

export async function globalSearch(query: string): Promise<{ success: boolean; data?: SearchResult[]; error?: string }> {
    try {
        await requireAuth();

        if (!query || query.trim().length < 2) {
            return { success: true, data: [] };
        }

        const terms = query.trim().split(/\s+/).map(t => `%${t}%`);

        // Condiciones para pacientes (cada término debe coincidir en nombre, apellido o cédula)
        const pacientesConditions = terms.map(term =>
            or(
                like(pacientes.cedulaPaciente, term),
                like(pacientes.nombrePaciente, term),
                like(pacientes.apellidoPaciente, term)
            )
        );

        // Buscar pacientes
        const pPacientes = db.select({
            id: pacientes.cedulaPaciente,
            nombre: pacientes.nombrePaciente,
            apellido: pacientes.apellidoPaciente
        })
        .from(pacientes)
        .where(and(...pacientesConditions))
        .limit(5);

        // Condiciones para abordajes
        const abordajeConditions = terms.map(term =>
            or(
                like(abordaje.codigoAbordaje, term),
                like(abordaje.codigoComunidad, term)
            )
        );

        // Buscar abordajes
        const pAbordajes = db.select({
            id: abordaje.codigoAbordaje,
            comunidad: abordaje.codigoComunidad
        })
        .from(abordaje)
        .where(and(...abordajeConditions))
        .limit(5);

        // Condiciones para tejedores
        const tejedoresConditions = terms.map(term =>
            or(
                like(tejedores.cedulaTejedor, term),
                like(tejedores.nombreTejedor, term),
                like(tejedores.apellidoTejedor, term)
            )
        );

        // Buscar tejedores
        const pTejedores = db.select({
            id: tejedores.cedulaTejedor,
            nombre: tejedores.nombreTejedor,
            apellido: tejedores.apellidoTejedor
        })
        .from(tejedores)
        .where(and(...tejedoresConditions))
        .limit(5);

        const [resPacientes, resAbordajes, resTejedores] = await Promise.all([pPacientes, pAbordajes, pTejedores]);

        const results: SearchResult[] = [
            ...resPacientes.map(p => ({
                id: p.id,
                type: 'paciente' as const,
                title: `${p.nombre} ${p.apellido}`,
                subtitle: `V-${p.id}`,
                url: `/datos-basicos/pacientes?search=${p.id}`
            })),
            ...resAbordajes.map(a => ({
                id: a.id,
                type: 'abordaje' as const,
                title: `Abordaje ${a.id}`,
                subtitle: `Comunidad: ${a.comunidad}`,
                url: `/abordajes/${a.id}`
            })),
            ...resTejedores.map(t => ({
                id: t.id,
                type: 'tejedor' as const,
                title: `${t.nombre} ${t.apellido}`,
                subtitle: `Voluntario: V-${t.id}`,
                url: `/datos-basicos/tejedores?search=${t.id}`
            }))
        ];

        return { success: true, data: results };
    } catch (error) {
        console.error('Error in global search:', error);
        return { success: false, error: 'Error al realizar la búsqueda' };
    }
}
