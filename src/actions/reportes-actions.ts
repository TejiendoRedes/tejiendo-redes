'use server'

import { db } from '@/db';
import { abordaje } from '@/db/schema/abordajes';
import { abordajeComunidad, consultasEnfermedades } from '@/db/schema/relations';
import { comunidades } from '@/db/schema/comunidades';
import { pacientes } from '@/db/schema/pacientes';
import { consultas } from '@/db/schema/consultas';
import { enfermedades } from '@/db/schema/enfermedades';
import { medicamentos } from '@/db/schema/medicamentos';
import { peticiones } from '@/db/schema/peticiones';
import { eq, sql, and, gte, lte, count, desc, like } from 'drizzle-orm';
import { reportesFilterSchema } from '@/schemas/reportes';
import { requireAuth } from '@/lib/auth';

/**
 * DB-04: Obtener datos para el Reporte de Abordajes
 */


/**
 * DB-04: Obtener datos para el Reporte de Comunidades
 */

/**
 * DB-04: Obtener datos para el Reporte de Pacientes
 */

/**
 * Obtener datos para el Reporte de Morbilidad
 */

/**
 * Obtener datos para el Reporte de Medicamentos Entregados
 * Agrupa entregas por medicamento, aplicando filtros de fecha, comunidad y ubicación
 */

/**
 * Obtener lista de comunidades para el filtro
 */
