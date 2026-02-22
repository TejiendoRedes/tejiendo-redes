import { z } from 'zod';

export const PeticionSchema = z.object({
    codigoPaciente: z.string().min(1, 'El paciente es requerido'),
    codigoMedicamento: z.string().min(1, 'El medicamento es requerido'),
    cantidad: z.number().int().min(1, 'La cantidad debe ser mayor a 0'),
    codigoAbordaje: z.string().optional().nullable(),
    notas: z.string().optional().nullable(),
});

export const UpdatePeticionSchema = z.object({
    estado: z.enum(['pendiente', 'entregado', 'cancelado']),
    notas: z.string().optional(),
});

export type PeticionInput = z.infer<typeof PeticionSchema>;
export type UpdatePeticionInput = z.infer<typeof UpdatePeticionSchema>;
