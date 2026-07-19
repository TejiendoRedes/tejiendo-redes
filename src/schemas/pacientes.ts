import { z } from 'zod';

export const PacienteSchema = z.object({
    cedulaPaciente: z.string().regex(/^[VE]-\d{6,9}$/, 'La cédula debe empezar por V- o E- seguido de 6 a 9 números'),
    nombrePaciente: z.string().min(1, "El nombre es requerido"),
    apellidoPaciente: z.string().min(1, "El apellido es requerido"),
    fechaNacimiento: z.coerce.date({ required_error: "La fecha de nacimiento es requerida" }),
    codigoComunidad: z.string().min(1, "La comunidad es requerida"),
    sexo: z.enum(['M', 'F'], { required_error: "El sexo es requerido" }),
    direccionPaciente: z.string().min(1, "La dirección es requerida"),
    telefonoPaciente: z.string().min(1, "El teléfono es requerido"),
    correoPaciente: z.string().email("Correo inválido").or(z.literal('')),
});

export type PacienteInput = z.infer<typeof PacienteSchema>;
