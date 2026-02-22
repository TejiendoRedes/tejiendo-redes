import { z } from 'zod';

export const MedicamentoSchema = z.object({
    nombreMedicamento: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    presentacion: z.string().min(2, 'La presentación debe tener al menos 2 caracteres'),
    descripcion: z.string().min(5, 'La descripción debe tener al menos 5 caracteres'),
    existencia: z.number().int().min(0, 'La existencia no puede ser negativa'),
});

export type MedicamentoInput = z.infer<typeof MedicamentoSchema>;
