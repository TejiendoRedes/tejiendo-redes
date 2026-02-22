/**
 * @module middleware
 * @description Middleware principal de Next.js que intercepta todas las requests (excepto assets estáticos).
 *
 * Ejecuta las siguientes capas de seguridad en orden:
 * 1. **Rate Limiting** — Limita intentos de login (5/15min) y registro (3/hora) por IP.
 * 2. **CSRF Validation** — Valida tokens CSRF en requests POST a rutas de autenticación.
 * 3. **Session Validation** — Desencripta la cookie JWT para obtener el usuario actual.
 * 4. **Route Protection** — Redirige a `/login` si no hay sesión válida en rutas protegidas.
 * 5. **Role-Based Access Control (RBAC)** — Redirige al dashboard correcto según el rol.
 * 6. **Security Headers** — Aplica CSP, HSTS, X-Frame-Options, etc. a todas las respuestas.
 *
 * @see {@link file://src/lib/auth.ts} - Funciones de JWT usadas aquí.
 * @see {@link file://src/lib/security/} - Módulos de seguridad individuales.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';
import { SECURITY_HEADERS } from '@/lib/security/headers';
import { rateLimit, LOGIN_LIMIT, REGISTER_LIMIT } from '@/lib/security/rate-limiter';
import { validateCsrfToken } from '@/lib/security/csrf';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

    // 1. Rate Limiting for Auth Routes
    if (pathname.startsWith('/api/auth/login')) {
        const limiter = await rateLimit(ip, LOGIN_LIMIT);
        if (!limiter.success) {
            return new NextResponse(JSON.stringify({ error: 'Too many attempts. Please try again later.' }), {
                status: 429,
                headers: { 'Content-Type': 'application/json', 'Retry-After': String(limiter.retryAfter) }
            });
        }
    }

    if (pathname.startsWith('/api/auth/register') || pathname.startsWith('/api/auth/unirse')) {
        const limiter = await rateLimit(ip, REGISTER_LIMIT);
        if (!limiter.success) {
            return new NextResponse(JSON.stringify({ error: 'Too many registrations from this IP. Please try again later.' }), {
                status: 429,
                headers: { 'Content-Type': 'application/json', 'Retry-After': String(limiter.retryAfter) }
            });
        }
    }

    // 2. CSRF Validation for API POST requests (Exclude registration for public access)
    if (request.method === 'POST' && pathname.startsWith('/api/auth/') && !pathname.startsWith('/api/auth/register')) {
        // We use a custom header for CSRF in AJAX requests
        const csrfHeader = request.headers.get('x-csrf-token');
        const isValid = await validateCsrfToken(csrfHeader || '');
        if (!isValid) {
            return new NextResponse(JSON.stringify({ error: 'Invalid CSRF token' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    const currentUser = request.cookies.get('session')?.value;
    let session = null;
    if (currentUser) {
        try {
            session = await decrypt(currentUser);
        } catch (e) {
            session = null;
        }
    }

    // Public Paths
    const isLoginPage = pathname.startsWith('/login');
    const isUnirsePage = pathname.startsWith('/unirse');
    const isPublicApi = pathname.startsWith('/api/auth') || pathname.startsWith('/api/public');
    const isStaticAsset =
        pathname.startsWith('/_next') ||
        pathname.match(/\.(png|jpg|jpeg|gif|svg|ico)$/) ||
        pathname === '/';

    let response: NextResponse;

    // 1. If user is logged in and hits /login or /, redirect to their specific dashboard
    if (session && (isLoginPage || pathname === '/')) {
        response = redirectToDashboard(session.role, request);
    }
    // 2. If user is NOT logged in and tries to access protected content
    else if (!session && !isLoginPage && !isUnirsePage && !isPublicApi && !isStaticAsset) {
        response = NextResponse.redirect(new URL('/login', request.url));
    }
    // 3. Robust Role-Based Access Control
    else if (session) {
        // Redirect root /dashboard to specific role dashboard
        if (pathname === '/dashboard') {
            response = redirectToDashboard(session.role, request);
        }
        // Protect role-specific routes
        else if (pathname.startsWith('/dashboard/super-usuario') && session.role !== 'superuser') {
            response = redirectToDashboard(session.role, request);
        }
        else if (pathname.startsWith('/dashboard/admin') && !['admin', 'superuser'].includes(session.role)) {
            response = redirectToDashboard(session.role, request);
        }
        else if (pathname.startsWith('/dashboard/tejedor') && session.role !== 'tejedor') {
            response = redirectToDashboard(session.role, request);
        }
        // Protect API routes
        else if (pathname.startsWith('/api/super') && session.role !== 'superuser') {
            response = new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
        }
        else if (pathname.startsWith('/api/admin') && !['admin', 'superuser'].includes(session.role)) {
            response = new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
        } else {
            response = NextResponse.next();
        }
    } else {
        response = NextResponse.next();
    }

    // Apply security headers to all responses
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
        response.headers.set(key, value);
    });

    return response;
}

function redirectToDashboard(role: string, request: NextRequest) {
    let target = '/dashboard';
    switch (role) {
        case 'superuser':
            target = '/dashboard/super-usuario';
            break;
        case 'admin':
            target = '/dashboard/admin';
            break;
        case 'tejedor':
            target = '/dashboard/tejedor';
            break;
        case 'medico':
            target = '/atencion-medica';
            break;
        case 'operador':
            target = '/datos-basicos';
            break;
        default:
            target = '/login';
    }
    return NextResponse.redirect(new URL(target, request.url));
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg).*)'],
};
