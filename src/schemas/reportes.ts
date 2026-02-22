import { z } from 'zod';

export const reportesFilterSchema = z.object({
    fechaInicio: z.string().optional(),
    fechaFin: z.string().optional(),
    codigoComunidad: z.string().optional().nullable(),
    estado: z.string().optional().nullable(),
    municipio: z.string().optional().nullable(),
    parroquia: z.string().optional().nullable(),
    tipoComunidad: z.string().optional().nullable(),
});

export type ReportesFilter = z.infer<typeof reportesFilterSchema>;
