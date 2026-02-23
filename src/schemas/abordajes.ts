
import { z } from 'zod';

// Schema for medication delivery
export const MedicamentoEntregaSchema = z.object({
    cedulaPaciente: z.string().min(1, "La cédula del paciente es requerida"),
    codigoMedicamento: z.string().min(1, "El código del medicamento es requerido"),
    codigoAbordaje: z.string().min(1, "El código del abordaje es requerido"),
    cantidadEntregada: z
        .number({ invalid_type_error: "La cantidad debe ser un número" })
        .int("La cantidad debe ser un número entero")
        .positive("La cantidad debe ser mayor a 0"),
    cedulaTejedor: z.string().min(1, "El tejedor responsable es requerido"),
    fechaEntrega: z.date({ invalid_type_error: "Fecha inválida" }),
});

export type MedicamentoEntrega = z.infer<typeof MedicamentoEntregaSchema>;

// Schema for creating an Abordaje
export const CreateAbordajeSchema = z.object({
    codigoComunidad: z.string().min(1, "Debe seleccionar una comunidad"),
    fechaAbordaje: z.coerce.date({ required_error: "La fecha es requerida" }),
    horaInicio: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, "Formato de hora inválido (HH:MM)"),
    horaFin: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, "Formato de hora inválido (HH:MM)"),
    descripcion: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
    tipoAbordaje: z.string().optional(),
    participantesEstimados: z.coerce.number().int().nonnegative().optional(),
    recursosAdicionales: z.string().optional(),
    estado: z.string().default('Pendiente'),
    notas: z.string().optional(),
});

export type CreateAbordaje = z.infer<typeof CreateAbordajeSchema>;

// Schema for updating an Abordaje
export const UpdateAbordajeSchema = CreateAbordajeSchema.partial();
