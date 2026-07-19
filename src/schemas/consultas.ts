import { z } from 'zod';

export const ConsultaSchema = z.object({
    codigoAbordaje: z.string().optional().nullable(),
    cedulaPaciente: z.string().regex(/^[VE]-\d{6,9}$/, 'La cédula del paciente debe empezar por V- o E- seguido de 6 a 9 números'),
    cedulaMedico: z.string().regex(/^[VE]-\d{6,9}$/, 'La cédula del médico debe empezar por V- o E- seguido de 6 a 9 números'),
    motivoConsulta: z.string().min(1, 'El motivo de consulta es requerido'),
    diagnosticoTexto: z.string().min(1, 'El diagnóstico es requerido'),
    recomendaciones: z.string().min(1, 'Las recomendaciones son requeridas'),
    tratamiento: z.string().min(1, 'El tratamiento es requerido'),
    tensionArterial: z.string().optional(),
    peso: z.coerce.number().optional(),
    talla: z.coerce.number().optional(),
    temperatura: z.coerce.number().optional(),
    frecuenciaCardiaca: z.string().optional(),
});

export type ConsultaInput = z.infer<typeof ConsultaSchema>;
