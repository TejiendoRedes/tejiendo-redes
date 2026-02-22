/**
 * @module auth
 * @description Módulo central de autenticación del sistema Tejiendo Redes.
 *
 * Implementa un sistema de autenticación stateless basado en JWT (JSON Web Tokens)
 * usando la librería `jose` para firmar/verificar tokens y `bcryptjs` para el
 * hashing seguro de contraseñas.
 *
 * El token JWT se almacena en una cookie HttpOnly llamada `session` con expiración
 * de 24 horas. El middleware (`src/middleware.ts`) valida esta cookie en cada request.
 *
 * @see {@link file://src/middleware.ts} - Middleware que consume estas funciones.
 * @see {@link file://src/contexts/AuthContext.tsx} - Provider cliente que gestiona el estado de auth.
 */

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

/**
 * Clave secreta para la firma de JWT.
 * Se obtiene de la variable de entorno `JWT_SECRET_KEY`.
 * Si no está definida, la aplicación no puede arrancar de forma segura.
 */
const SECRET_KEY = process.env.JWT_SECRET_KEY;
if (!SECRET_KEY) {
    throw new Error('FATAL: JWT_SECRET_KEY environment variable is not set. Application cannot start securely.');
}
const key = new TextEncoder().encode(SECRET_KEY);

/**
 * Estructura del payload contenido en el JWT de sesión.
 * Incluye la información mínima necesaria para identificar al usuario
 * y determinar sus permisos sin consultar la base de datos.
 */
interface SessionPayload {
    /** Cédula del tejedor autenticado */
    cedulaTejedor: string;
    /** Nombre del tejedor */
    nombreTejedor: string;
    /** Apellido del tejedor */
    apellidoTejedor: string;
    /** Rol del usuario: 'superuser' | 'admin' | 'tejedor' | 'medico' | 'operador' */
    role: string;
    /** Nombre de usuario para login */
    usuario: string;
    /** Timestamp de emisión del token (generado automáticamente por jose) */
    iat?: number;
    /** Timestamp de expiración del token (generado automáticamente por jose) */
    exp?: number;
    /** Permitir propiedades adicionales para extensibilidad */
    [key: string]: unknown;
}

/**
 * Genera un JWT firmado con HS256 a partir de los datos del usuario.
 * El token tiene una expiración de 24 horas.
 *
 * @param payload - Datos del usuario a incluir en el token (sin iat/exp).
 * @returns El token JWT como string.
 *
 * @example
 * ```typescript
 * const token = await encrypt({
 *     cedulaTejedor: '12345678',
 *     nombreTejedor: 'Juan',
 *     apellidoTejedor: 'Pérez',
 *     role: 'admin',
 *     usuario: 'jperez'
 * });
 * ```
 */
export async function encrypt(payload: Omit<SessionPayload, 'iat' | 'exp'>) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(key);
}

/**
 * Verifica y desencripta un token JWT.
 * Lanza un error si el token es inválido o ha expirado.
 *
 * @param input - El token JWT a verificar.
 * @returns El payload desencriptado del token.
 * @throws Error si el token es inválido, ha expirado, o la firma no coincide.
 */
export async function decrypt(input: string): Promise<SessionPayload> {
    const { payload } = await jwtVerify(input, key, {
        algorithms: ['HS256'],
    });
    return payload as SessionPayload;
}

/**
 * Obtiene la sesión actual del usuario a partir de la cookie `session`.
 * Si no hay cookie o el token es inválido/expirado, retorna `null`.
 *
 * Esta función se usa en Server Components y Server Actions para verificar
 * la autenticación del usuario actual.
 *
 * @returns El payload de sesión si el usuario está autenticado, o `null`.
 */
export async function getSession() {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return null;
    try {
        return await decrypt(session);
    } catch (error) {
        return null;
    }
}

/**
 * Genera un hash seguro de una contraseña usando bcrypt con factor de costo 12.
 *
 * @param password - La contraseña en texto plano a hashear.
 * @returns El hash bcrypt de la contraseña.
 */
export async function hashPassword(password: string) {
    return await bcrypt.hash(password, 12);
}

/**
 * Compara una contraseña en texto plano con su hash bcrypt.
 *
 * @param password - La contraseña en texto plano proporcionada por el usuario.
 * @param hash - El hash bcrypt almacenado en la base de datos.
 * @returns `true` si la contraseña coincide con el hash, `false` en caso contrario.
 */
export async function comparePassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
}

/**
 * Verifica que exista una sesión válida. Si no hay sesión, lanza un error.
 * Útil como guard en Server Actions que requieren autenticación obligatoria.
 *
 * @returns El payload de sesión del usuario autenticado.
 * @throws Error con mensaje 'No autorizado' si no hay sesión válida.
 *
 * @example
 * ```typescript
 * export async function createPaciente(data: PacienteInput) {
 *     const session = await requireAuth(); // Lanza error si no está autenticado
 *     // ... lógica protegida
 * }
 * ```
 */
export async function requireAuth() {
    const session = await getSession();
    if (!session) {
        throw new Error('No autorizado');
    }
    return session;
}
