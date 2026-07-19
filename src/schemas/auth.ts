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
    cedulaAspirante: z.string().regex(/^[VE]-\d{6,9}$/, 'La cédula debe empezar por V- o E- seguido de 6 a 9 números'),
    nombreAspirante: z.string().min(2, 'Nombre es requerido').max(50),
    apellidoAspirante: z.string().min(2, 'Apellido es requerido').max(50),
    fechaNacimiento: z.string().refine((date) => {
        const parsed = Date.parse(date);
        if (isNaN(parsed)) return false;
        const year = new Date(parsed).getFullYear();
        return year >= 1900 && year <= new Date().getFullYear();
    }, 'Fecha inválida o fuera de rango (debe ser entre 1900 y el año actual)'),
    direccionAspirante: z.string().min(5, 'Dirección es muy corta').max(150),
    parroquiaId: z.coerce.number({ invalid_type_error: 'Parroquia es requerida' }),
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
