'use server'

import { db } from '@/db';
import { pacientes } from '@/db/schema/pacientes';
import { comunidades } from '@/db/schema/comunidades';
import { medicamentos } from '@/db/schema/medicamentos';
import { enfermedades } from '@/db/schema/enfermedades';
import { abordaje } from '@/db/schema/abordajes';
import { tejedores } from '@/db/schema/tejedores';
import { responsable } from '@/db/schema/responsable';
import { aspirantes } from '@/db/schema/aspirantes';
import { estados, municipios, parroquias } from '@/db/schema/geografia';
import { like, or, eq, desc } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';

export type SearchResult = {
    id: string;
    title: string;
    subtitle: string;
    type: 'paciente' | 'comunidad' | 'medicamento' | 'enfermedad' | 'abordaje' | 'tejedor' | 'responsable' | 'aspirante';
    url: string;
};

export type GroupedSearchResults = {
    pacientes: SearchResult[];
    comunidades: SearchResult[];
    medicamentos: SearchResult[];
    enfermedades: SearchResult[];
    abordajes: SearchResult[];
    tejedores: SearchResult[];
    responsables: SearchResult[];
    aspirantes: SearchResult[];
};

export async function searchGlobal(query: string): Promise<GroupedSearchResults> {
    try {
        await requireAuth();
    } catch (error) {
        return {
            pacientes: [],
            comunidades: [],
            medicamentos: [],
            enfermedades: [],
            abordajes: [],
            tejedores: [],
            responsables: [],
            aspirantes: []
        };
    }

    if (!query || query.length < 2) {
        return {
            pacientes: [],
            comunidades: [],
            medicamentos: [],
            enfermedades: [],
            abordajes: [],
            tejedores: [],
            responsables: [],
            aspirantes: []
        };
    }

    const searchPattern = `%${query}%`;

    // Ejecutar consultas en paralelo
    const [
        pacientesResults,
        comunidadesResults,
        medicamentosResults,
        enfermedadesResults,
        abordajesResults,
        tejedoresResults,
        responsablesResults,
        aspirantesResults
    ] = await Promise.all([
        // Buscar Pacientes
        db.select({
            id: pacientes.cedulaPaciente,
            nombre: pacientes.nombrePaciente,
            apellido: pacientes.apellidoPaciente,
        })
            .from(pacientes)
            .where(or(
                like(pacientes.nombrePaciente, searchPattern),
                like(pacientes.apellidoPaciente, searchPattern),
                like(pacientes.cedulaPaciente, searchPattern)
            ))
            .limit(5),

        // Buscar Comunidades
        db.select({
            id: comunidades.codigoComunidad,
            nombre: comunidades.nombreComunidad,
            municipio: municipios.nombre,
        })
            .from(comunidades)
            .leftJoin(parroquias, eq(comunidades.parroquiaId, parroquias.id))
            .leftJoin(municipios, eq(parroquias.municipioId, municipios.id))
            .where(like(comunidades.nombreComunidad, searchPattern))
            .limit(5),

        // Buscar Medicamentos
        db.select({
            id: medicamentos.codigoMedicamento,
            nombre: medicamentos.nombreMedicamento,
            presentacion: medicamentos.presentacion,
        })
            .from(medicamentos)
            .where(or(
                like(medicamentos.nombreMedicamento, searchPattern),
                like(medicamentos.codigoMedicamento, searchPattern)
            ))
            .limit(5),

        // Buscar Enfermedades
        db.select({
            id: enfermedades.codigoEnfermedad,
            nombre: enfermedades.nombreEnfermedad,
            tipo: enfermedades.tipoPatologia,
        })
            .from(enfermedades)
            .where(or(
                like(enfermedades.nombreEnfermedad, searchPattern),
                like(enfermedades.codigoEnfermedad, searchPattern)
            ))
            .limit(5),

        // Buscar Abordajes
        db.select({
            id: abordaje.codigoAbordaje,
            descripcion: abordaje.descripcion,
            fecha: abordaje.fechaAbordaje,
        })
            .from(abordaje)
            .where(or(
                like(abordaje.codigoAbordaje, searchPattern),
                like(abordaje.descripcion, searchPattern)
            ))
            .limit(5),

        // Buscar Tejedores
        db.select({
            id: tejedores.cedulaTejedor,
            nombre: tejedores.nombreTejedor,
            apellido: tejedores.apellidoTejedor,
            profesion: tejedores.profesionTejedor
        })
            .from(tejedores)
            .where(or(
                like(tejedores.nombreTejedor, searchPattern),
                like(tejedores.apellidoTejedor, searchPattern),
                like(tejedores.cedulaTejedor, searchPattern)
            ))
            .limit(5),

        // Buscar Responsables
        db.select({
            id: responsable.cedulaResponsable,
            nombre: responsable.nombreResponsable,
            apellido: responsable.apellidoResponsable,
            cargo: responsable.cargo
        })
            .from(responsable)
            .where(or(
                like(responsable.nombreResponsable, searchPattern),
                like(responsable.apellidoResponsable, searchPattern),
                like(responsable.cedulaResponsable, searchPattern)
            ))
            .limit(5),

        // Buscar Aspirantes
        db.select({
            id: aspirantes.cedulaAspirante,
            nombre: aspirantes.nombreAspirante,
            apellido: aspirantes.apellidoAspirante,
            profesion: aspirantes.profesionAspirante
        })
            .from(aspirantes)
            .where(or(
                like(aspirantes.nombreAspirante, searchPattern),
                like(aspirantes.apellidoAspirante, searchPattern),
                like(aspirantes.cedulaAspirante, searchPattern)
            ))
            .limit(5)
    ]);

    // Formatear resultados
    return {
        pacientes: pacientesResults.map(p => ({
            id: p.id,
            title: `${p.nombre} ${p.apellido}`,
            subtitle: `C.I: ${p.id}`,
            type: 'paciente',
            url: `/datos-basicos/pacientes/${p.id}`
        })),
        comunidades: comunidadesResults.map(c => ({
            id: c.id,
            title: c.nombre,
            subtitle: c.municipio || '',
            type: 'comunidad',
            url: `/datos-basicos/comunidades/${c.id}`
        })),
        medicamentos: medicamentosResults.map(m => ({
            id: m.id,
            title: m.nombre,
            subtitle: m.presentacion,
            type: 'medicamento',
            url: `/farmacia/medicamentos/${m.id}`
        })),
        enfermedades: enfermedadesResults.map(e => ({
            id: e.id,
            title: e.nombre,
            subtitle: e.tipo,
            type: 'enfermedad',
            url: `/datos-basicos/enfermedades/${e.id}`
        })),
        abordajes: abordajesResults.map(a => ({
            id: a.id,
            title: a.descripcion.substring(0, 50) + (a.descripcion.length > 50 ? '...' : ''),
            subtitle: `Código: ${a.id} - Fecha: ${a.fecha ? new Date(a.fecha).toLocaleDateString() : 'N/A'}`,
            type: 'abordaje',
            url: `/abordajes/${a.id}`
        })),
        tejedores: tejedoresResults.map(t => ({
            id: t.id,
            title: `${t.nombre} ${t.apellido}`,
            subtitle: `${t.profesion}`,
            type: 'tejedor',
            url: `/datos-basicos/tejedores/${t.id}`
        })),
        responsables: responsablesResults.map(r => ({
            id: r.id,
            title: `${r.nombre} ${r.apellido}`,
            subtitle: `${r.cargo}`,
            type: 'responsable',
            url: `/datos-basicos/responsables/${r.id}`
        })),
        aspirantes: aspirantesResults.map(a => ({
            id: a.id,
            title: `${a.nombre} ${a.apellido}`,
            subtitle: `${a.profesion}`,
            type: 'aspirante',
            url: `/aspirantes/${a.id}`
        }))
    };
}

// ------ Entity Details for Quick View ------

import { EntityDetails } from '@/types/app-types';

