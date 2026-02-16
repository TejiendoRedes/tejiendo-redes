import { z } from 'zod';

export const reportesFilterSchema = z.object({
    fechaInicio: z.string().optional(),
    fechaFin: z.string().optional(),
    codigoComunidad: z.string().optional().nullable(),
});

export type ReportesFilter = z.infer<typeof reportesFilterSchema>;
