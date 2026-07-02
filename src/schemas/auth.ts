import { z } from 'zod';

/**
 * Esquema de validación para el Login
 */
export const loginSchema = z.object({
    usuario: z.string()
        .min(2, 'El usuario debe tener al menos 2 caracteres')
        .max(50, 'El usuario no puede exceder los 50 caracteres')
        .trim()
        .regex(/^[a-zA-Z0-9._-]+$/, 'El usuario solo puede contener letras, números, puntos, guiones y guiones bajos'),
    password: z.string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .max(128, 'La contraseña es demasiado larga'),
    // Campos de seguridad adicionales
    honeypot: z.string().max(0, 'Bot detected').optional(),
    csrfToken: z.string().min(1, 'Token CSRF requerido'),
    submissionTime: z.string().optional(),
});

/**
 * Esquema de validación para el Registro de Aspirantes (Unirse)
 */
export const registerSchema = z.object({
    cedulaAspirante: z.string().min(6, 'Cédula debe tener al menos 6 caracteres').max(12),
    nombreAspirante: z.string().min(2, 'Nombre es requerido').max(50),
    apellidoAspirante: z.string().min(2, 'Apellido es requerido').max(50),
    fechaNacimiento: z.string().refine((date) => !isNaN(Date.parse(date)), 'Fecha inválida'),
    direccionAspirante: z.string().min(5, 'Dirección es muy corta').max(150),
    municipioAspirante: z.string().min(2, 'Municipio es requerido').max(100),
    estadoDireccionAspirante: z.string().min(2, 'Estado es requerido').max(100),
    parroquiaAspirante: z.string().min(2, 'Parroquia es requerida').max(100),
    telefonoAspirante: z.string().min(10, 'Teléfono debe tener al menos 10 dígitos').max(15),
    correoAspirante: z.string().email('Correo electrónico inválido').max(100),
    profesionAspirante: z.string().min(2, 'Profesión es requerida').max(50),
    usuario: z.string()
        .min(2, 'El usuario debe tener al menos 2 caracteres')
        .max(50, 'El usuario no puede exceder los 50 caracteres')
        .trim()
        .regex(/^[a-zA-Z0-9._-]+$/, 'El usuario solo puede contener letras, números, puntos, guiones y guiones bajos'),
    password: z.string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .max(128, 'La contraseña es demasiado larga'),
    // Campos de seguridad adicionales
    honeypot: z.string().max(0, 'Bot detected').optional(),
    csrfToken: z.string().optional(),
    submissionTime: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
