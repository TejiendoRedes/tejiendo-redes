import { z } from 'zod';

export const MedicamentoSchema = z.object({
    nombreMedicamento: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    presentacion: z.string().min(2, 'La presentación debe tener al menos 2 caracteres').max(50, 'La presentación no puede exceder 50 caracteres'),
    descripcion: z.string().min(5, 'La descripción debe tener al menos 5 caracteres').max(255, 'La descripción no puede exceder 255 caracteres'),
    existencia: z.coerce.number().int().min(0, 'La existencia no puede ser negativa'),
    precio: z.coerce.number().min(0, 'El precio no puede ser negativo'),
});

// Al actualizar un medicamento no se permite modificar la existencia manualmente:
// el stock solo cambia automáticamente por entregas/cancelaciones de peticiones.
export const UpdateMedicamentoSchema = MedicamentoSchema.omit({ existencia: true }).partial();

export type MedicamentoInput = z.infer<typeof MedicamentoSchema>;
