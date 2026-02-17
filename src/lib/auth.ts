import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

// Secret key for JWT signing
const SECRET_KEY = process.env.JWT_SECRET_KEY;
if (!SECRET_KEY) {
    throw new Error('FATAL: JWT_SECRET_KEY environment variable is not set. Application cannot start securely.');
}
const key = new TextEncoder().encode(SECRET_KEY);

interface SessionPayload {
    cedulaTejedor: string;
    nombreTejedor: string;
    apellidoTejedor: string;
    role?: string;
    usuario?: string;
    iat?: number;
    exp?: number;
    [key: string]: unknown; // Allow other properties but force validation
}

export async function encrypt(payload: Omit<SessionPayload, 'iat' | 'exp'>) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h') // Session expires in 24 hours
        .sign(key);
}

export async function decrypt(input: string): Promise<SessionPayload> {
    const { payload } = await jwtVerify(input, key, {
        algorithms: ['HS256'],
    });
    return payload as SessionPayload;
}



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

export async function hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
}


export async function comparePassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
}

export async function requireAuth() {
    const session = await getSession();
    if (!session) {
        throw new Error('No autorizado');
    }
    return session;
}
