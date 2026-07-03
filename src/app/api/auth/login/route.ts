import { NextResponse } from 'next/server';
import { encrypt, comparePassword } from '@/lib/auth';
import { cookies } from 'next/headers';
import { db } from '@/db';
import { users, auditLogs, tejedores } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { loginSchema } from '@/schemas/auth';
import { sanitizeObject } from '@/lib/security/sanitize';

export async function POST(request: Request) {
    const startTime = Date.now();
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    try {
        const body = await request.json();

        // 1. Zod Validation
        const result = loginSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Datos de inicio de sesión inválidos' },
                { status: 400 }
            );
        }

        const { usuario, password, honeypot, submissionTime } = result.data;

        // 2. Honeypot check
        if (honeypot) {
            return NextResponse.json({ error: 'Bot detected' }, { status: 400 });
        }

        // 3. Submission time check
        if (submissionTime) {
            const timeElapsed = Date.now() - parseInt(submissionTime);
            if (timeElapsed < 2000) {
                return NextResponse.json({ error: 'Too fast' }, { status: 400 });
            }
        }

        // 4. Input Sanitization
        const sanitizedData = sanitizeObject({ usuario });

        // 5. Database lookup (using Drizzle prepared-statement-like syntax)
        const [user] = await db.select()
            .from(users)
            .where(eq(users.username, sanitizedData.usuario))
            .limit(1);

        if (!user) {
            await db.insert(auditLogs).values({
                action: 'LOGIN_FAILURE',
                entity: 'USERS',
                details: `Intento de login fallido: usuario no existe (${sanitizedData.usuario})`,
                ipAddress: ip,
                userAgent: userAgent
            });
            // Apply delay to prevent timing attacks
            await preventTimingAttack(startTime);
            return NextResponse.json(
                { error: 'Credenciales inválidas' },
                { status: 401 }
            );
        }

        // 6. Password Verification
        const isValid = await comparePassword(password, user.password);

        if (!isValid) {
            await db.insert(auditLogs).values({
                userId: user.id,
                action: 'LOGIN_FAILURE',
                entity: 'USERS',
                details: 'Intento de login fallido: contraseña incorrecta',
                ipAddress: ip,
                userAgent: userAgent
            });
            await preventTimingAttack(startTime);
            return NextResponse.json(
                { error: 'Credenciales inválidas' },
                { status: 401 }
            );
        }

        if (!user.approved) {
            return NextResponse.json(
                { error: 'Su cuenta está pendiente de aprobación' },
                { status: 403 }
            );
        }

        // 7. Success
        await db.transaction(async (tx) => {
            await tx.update(users)
                .set({ lastLogin: new Date() })
                .where(eq(users.id, user.id));

            await tx.insert(auditLogs).values({
                userId: user.id,
                action: 'LOGIN_SUCCESS',
                entity: 'USERS',
                ipAddress: ip,
                userAgent: userAgent
            });
        });

        // Crear sesión con datos reales del tejedor (si existe)
        let nombreReal = user.username;
        let apellidoReal = '';
        let cedulaReal = user.cedulaTejedor || '';

        if (user.cedulaTejedor) {
            const [tejedor] = await db.select()
                .from(tejedores)
                .where(eq(tejedores.cedulaTejedor, user.cedulaTejedor))
                .limit(1);

            if (tejedor) {
                nombreReal = tejedor.nombreTejedor;
                apellidoReal = tejedor.apellidoTejedor;
                cedulaReal = tejedor.cedulaTejedor;
            }
        }

        const userPayload = {
            id: user.id,
            nombreTejedor: nombreReal,
            apellidoTejedor: apellidoReal,
            cedulaTejedor: cedulaReal,
            role: user.role,
            usuario: user.username
        };

        // Crear token
        const token = await encrypt(userPayload);

        // Configurar cookie segura
        const cookieStore = await cookies();
        cookieStore.set('session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 24, // 24h
        });

        const redirectTo = user.role === 'superuser' ? '/dashboard/super-usuario' :
            user.role === 'admin' ? '/dashboard/admin' :
                ['tejedor', 'medico', 'operador'].includes(user.role) ? '/dashboard/tejedor' : '/dashboard';

        return NextResponse.json({
            success: true,
            user: userPayload,
            redirectTo
        });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}

/**
 * Ensures a minimum response time to mitigate timing attacks
 */
async function preventTimingAttack(startTime: number) {
    const minTime = 1000; // 1 second minimum
    const elapsed = Date.now() - startTime;
    if (elapsed < minTime) {
        await new Promise(resolve => setTimeout(resolve, minTime - elapsed));
    }
}
