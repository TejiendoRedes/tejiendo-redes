import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const CSRF_SECRET = process.env.JWT_SECRET_KEY || 'default-csrf-secret-change-me';
const key = new TextEncoder().encode(CSRF_SECRET);

/**
 * Generate a new CSRF token and set it in a cookie
 */
export async function generateCsrfToken() {
    const token = await new SignJWT({ timestamp: Date.now() })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('2h')
        .sign(key);

    const cookieStore = await cookies();
    cookieStore.set('csrf_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
    });

    return token;
}

/**
 * Validate the CSRF token from the request
 */
export async function validateCsrfToken(requestToken: string) {
    if (!requestToken) return false;

    const cookieStore = await cookies();
    const cookieToken = cookieStore.get('csrf_token')?.value;

    if (!cookieToken || cookieToken !== requestToken) {
        return false;
    }

    try {
        await jwtVerify(cookieToken, key, { algorithms: ['HS256'] });
        return true;
    } catch (error) {
        return false;
    }
}
