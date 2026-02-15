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
import { consultas } from '@/db/schema/consultas';
import { medicamentosPacientes } from '@/db/schema/relations';
import { abordajeComunidad } from '@/db/schema/relations';
import { like, or, eq, desc } from 'drizzle-orm';

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
            municipio: comunidades.municipio,
        })
            .from(comunidades)
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
            subtitle: c.municipio,
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
            url: `/tejedores/${t.id}`
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

export type EntityDetails = {
    type: string;
    data: any;
    history: any[];
    related?: any;
}

export async function getEntityDetails(type: string, id: string): Promise<EntityDetails | null> {
    try {
        switch (type) {
            case 'paciente': {
                const paciente = await db.select().from(pacientes).where(eq(pacientes.cedulaPaciente, id)).limit(1);
                if (!paciente.length) return null;

                // Historial: Consultas recientes (Ordenado por fecha de abordaje)
                const historialConsultas = await db.select({
                    codigo: consultas.codigoConsulta,
                    motivo: consultas.motivoConsulta,
                    fecha: abordaje.fechaAbordaje
                })
                    .from(consultas)
                    .innerJoin(abordaje, eq(consultas.codigoAbordaje, abordaje.codigoAbordaje))
                    .where(eq(consultas.cedulaPaciente, id))
                    .orderBy(desc(abordaje.fechaAbordaje))
                    .limit(5);

                return {
                    type,
                    data: paciente[0],
                    history: historialConsultas.map(h => ({
                        descripcion: h.motivo,
                        fecha: h.fecha
                    }))
                };
            }
            case 'comunidad': {
                const comunidad = await db.select().from(comunidades).where(eq(comunidades.codigoComunidad, id)).limit(1);
                if (!comunidad.length) return null;

                // Related: Responsable info
                const responsableInfo = await db.select()
                    .from(responsable)
                    .where(eq(responsable.cedulaResponsable, comunidad[0].cedulaResponsable))
                    .limit(1);

                // Historial: Abordajes en esta comunidad
                const historialAbordajes = await db.select({
                    codigo: abordaje.codigoAbordaje,
                    fecha: abordaje.fechaAbordaje,
                    descripcion: abordaje.descripcion
                })
                    .from(abordajeComunidad)
                    .innerJoin(abordaje, eq(abordajeComunidad.codigoAbordaje, abordaje.codigoAbordaje))
                    .where(eq(abordajeComunidad.codigoComunidad, id))
                    .limit(5);

                return {
                    type,
                    data: comunidad[0],
                    related: responsableInfo[0] || null,
                    history: historialAbordajes
                };
            }
            case 'medicamento': {
                const medicamento = await db.select().from(medicamentos).where(eq(medicamentos.codigoMedicamento, id)).limit(1);
                if (!medicamento.length) return null;

                // Historial: Entregas recientes
                const historialEntregas = await db.select({
                    fecha: medicamentosPacientes.fechaEntrega,
                    cantidad: medicamentosPacientes.cantidadEntregada,
                    paciente: pacientes.nombrePaciente,
                    apellido: pacientes.apellidoPaciente
                })
                    .from(medicamentosPacientes)
                    .innerJoin(pacientes, eq(medicamentosPacientes.cedulaPaciente, pacientes.cedulaPaciente))
                    .where(eq(medicamentosPacientes.codigoMedicamento, id))
                    .orderBy(desc(medicamentosPacientes.fechaEntrega))
                    .limit(5);

                return {
                    type,
                    data: medicamento[0],
                    history: historialEntregas
                };
            }
            case 'abordaje': {
                const abd = await db.select().from(abordaje).where(eq(abordaje.codigoAbordaje, id)).limit(1);
                if (!abd.length) return null;

                // Related: Comunidad info
                const com = await db.select().from(comunidades).where(eq(comunidades.codigoComunidad, abd[0].codigoComunidad)).limit(1);

                return {
                    type,
                    data: abd[0],
                    related: com[0] || null,
                    history: []
                };
            }
            case 'tejedor': {
                const tej = await db.select().from(tejedores).where(eq(tejedores.cedulaTejedor, id)).limit(1);
                if (!tej.length) return null;
                return { type, data: tej[0], history: [] };
            }
            case 'responsable': {
                const resp = await db.select().from(responsable).where(eq(responsable.cedulaResponsable, id)).limit(1);
                if (!resp.length) return null;

                // History: Comunidades a cargo
                const comunidadesACargo = await db.select().from(comunidades).where(eq(comunidades.cedulaResponsable, id));

                return { type, data: resp[0], history: comunidadesACargo };
            }
            case 'aspirante': {
                const asp = await db.select().from(aspirantes).where(eq(aspirantes.cedulaAspirante, id)).limit(1);
                if (!asp.length) return null;
                return { type, data: asp[0], history: [] };
            }
            case 'enfermedad': {
                const enf = await db.select().from(enfermedades).where(eq(enfermedades.codigoEnfermedad, id)).limit(1);
                if (!enf.length) return null;
                return { type, data: enf[0], history: [] };
            }

            default:
                return null;
        }
    } catch (error) {
        console.error('Error fetching entity details:', error);
        return null;
    }
}
