import { z } from 'zod';

export const ConsultaSchema = z.object({
    codigoAbordaje: z.string().min(1, 'El código de abordaje es requerido'),
    cedulaPaciente: z.string().min(1, 'La cédula del paciente es requerida'),
    cedulaMedico: z.string().min(1, 'La cédula del médico es requerida'),
    motivoConsulta: z.string().min(1, 'El motivo de consulta es requerido'),
    diagnosticoTexto: z.string().min(1, 'El diagnóstico es requerido'),
    recomendaciones: z.string().min(1, 'Las recomendaciones son requeridas'),
    tratamiento: z.string().min(1, 'El tratamiento es requerido'),
    tensionArterial: z.string().optional(),
});

export type ConsultaInput = z.infer<typeof ConsultaSchema>;
