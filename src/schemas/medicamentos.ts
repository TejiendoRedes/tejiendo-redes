import { z } from 'zod';

export const MedicamentoSchema = z.object({
    nombreMedicamento: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    presentacion: z.string().min(2, 'La presentación debe tener al menos 2 caracteres'),
    descripcion: z.string().min(5, 'La descripción debe tener al menos 5 caracteres'),
    existencia: z.number().int().min(0, 'La existencia no puede ser negativa'),
    precio: z.number().min(0, 'El precio no puede ser negativo'),
});

// Al actualizar un medicamento no se permite modificar la existencia manualmente:
// el stock solo cambia automáticamente por entregas/cancelaciones de peticiones.
export const UpdateMedicamentoSchema = MedicamentoSchema.omit({ existencia: true }).partial();

export type MedicamentoInput = z.infer<typeof MedicamentoSchema>;
