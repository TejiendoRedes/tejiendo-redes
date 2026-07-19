"use server";


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
import { entregasMedicamentos } from '@/db/schema/entregas_medicamentos';
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


// ------ Entity Details for Quick View ------

import { EntityDetails } from '@/types/app-types';

export async function getEntityDetails(type: string, id: string): Promise<EntityDetails | null> {
    try {
        await requireAuth();
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
                const results = await db.select({
                    comunidad: comunidades,
                    estado: estados.nombre,
                    municipio: municipios.nombre,
                    parroquia: parroquias.nombre
                })
                    .from(comunidades)
                    .leftJoin(parroquias, eq(comunidades.parroquiaId, parroquias.id))
                    .leftJoin(municipios, eq(parroquias.municipioId, municipios.id))
                    .leftJoin(estados, eq(municipios.estadoId, estados.id))
                    .where(eq(comunidades.codigoComunidad, id))
                    .limit(1);
                if (!results.length) return null;
                const comunidadData = {
                    ...results[0].comunidad,
                    estado: results[0].estado,
                    municipio: results[0].municipio,
                    parroquia: results[0].parroquia
                };

                // Related: Responsable info
                const responsableInfo = await db.select()
                    .from(responsable)
                    .where(eq(responsable.cedulaResponsable, comunidadData.cedulaResponsable || ''))
                    .limit(1);

                // Historial: Abordajes en esta comunidad
                const historialAbordajes = await db.select({
                    codigo: abordaje.codigoAbordaje,
                    fecha: abordaje.fechaAbordaje,
                    descripcion: abordaje.descripcion
                })
                    .from(abordaje)
                    .where(eq(abordaje.codigoComunidad, id))
                    .limit(5);

                return {
                    type,
                    data: comunidadData,
                    related: responsableInfo[0] || null,
                    history: historialAbordajes
                };
            }
            case 'medicamento': {
                const medicamento = await db.select().from(medicamentos).where(eq(medicamentos.codigoMedicamento, id)).limit(1);
                if (!medicamento.length) return null;

                // Historial: Entregas recientes
                const historialEntregas = await db.select({
                    fecha: entregasMedicamentos.fechaEntrega,
                    cantidad: entregasMedicamentos.cantidad,
                    paciente: pacientes.nombrePaciente,
                    apellido: pacientes.apellidoPaciente
                })
                    .from(entregasMedicamentos)
                    .innerJoin(pacientes, eq(entregasMedicamentos.codigoPaciente, pacientes.cedulaPaciente))
                    .where(eq(entregasMedicamentos.codigoMedicamento, id))
                    .orderBy(desc(entregasMedicamentos.fechaEntrega))
                    .limit(5);

                return {
                    type,
                    data: medicamento[0],
                    history: historialEntregas
                };
            }
            case 'abordaje': {
                // Use AbordajesService.getById to fetch complete data including:
                // - All comunidades from abordaje_comunidad bridge table
                // - All tejedores from tejedores_abordaje bridge table
                // - All consultas
                // - All medicamentos_entregados from medicamentos_pacientes bridge table
                const { AbordajesService } = await import('@/services/abordajes-service');
                const abordajeData = await AbordajesService.getById(id);
                if (!abordajeData) return null;

                return {
                    type,
                    data: abordajeData,
                    related: abordajeData, // All related data is in the main object
                    history: []
                };
            }
            case 'tejedor': {
                const tej = await db.select().from(tejedores).where(eq(tejedores.cedulaTejedor, id)).limit(1);
                if (!tej.length) return null;

                // Historial: Participaciones en abordajes
                const { tejedoresAbordaje } = await import('@/db/schema/relations');
                const historialParticipacion = await db.select({
                    codigo: abordaje.codigoAbordaje,
                    fecha: abordaje.fechaAbordaje,
                    descripcion: abordaje.descripcion
                })
                    .from(tejedoresAbordaje)
                    .innerJoin(abordaje, eq(tejedoresAbordaje.codigoAbordaje, abordaje.codigoAbordaje))
                    .where(eq(tejedoresAbordaje.cedulaTejedor, id))
                    .orderBy(desc(abordaje.fechaAbordaje))
                    .limit(5);

                return {
                    type,
                    data: tej[0],
                    history: historialParticipacion.map(h => ({
                        descripcion: `Abordaje: ${h.descripcion}`,
                        fecha: h.fecha
                    }))
                };
            }
            case 'responsable': {
                const resp = await db.select().from(responsable).where(eq(responsable.cedulaResponsable, id)).limit(1);
                if (!resp.length) return null;

                // History: Comunidades a cargo
                const comunidadesACargo = await db.select().from(comunidades).where(eq(comunidades.cedulaResponsable, id));

                return { type, data: resp[0], related: comunidadesACargo, history: [] };
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
