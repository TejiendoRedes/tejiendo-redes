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

    // 2.5 API Key Authentication for External Integration (v1)
    if (pathname.startsWith('/api/v1/')) {
        const apiKey = request.headers.get('x-api-key');
        const validApiKey = process.env.INTEGRATION_API_KEY;
        
        if (!apiKey || apiKey !== validApiKey) {
            return new NextResponse(JSON.stringify({ error: 'Unauthorized: Invalid or missing API Key' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        // Let the request pass through if valid
        return NextResponse.next();
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
    const isPublicApi = pathname.startsWith('/api/auth') || pathname.startsWith('/api/public') || pathname.startsWith('/api/v1');
    const isPrototipo = pathname.startsWith('/prototipo');
    const isStaticAsset =
        pathname.startsWith('/_next') ||
        pathname.match(/\.(png|jpg|jpeg|gif|svg|ico)$/) ||
        pathname === '/';

    let response: NextResponse;

    // 1. If user is logged in and hits /login or /, redirect to their landing page
    if (session && (isLoginPage || pathname === '/')) {
        response = redirectAfterLogin(session.role, request);
    }
    // 2. If user is NOT logged in and tries to access protected content
    else if (!session && !isLoginPage && !isUnirsePage && !isPublicApi && !isStaticAsset && !isPrototipo) {
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
        // Todos los roles logueados pueden ver el dashboard de tejedor (que es el personal)
        else if (pathname.startsWith('/dashboard/tejedor') && !['tejedor', 'medico', 'operador', 'admin', 'superuser'].includes(session.role)) {
            response = redirectToDashboard(session.role, request);
        }
        // BUG-10 FIX: Proteger rutas de módulos funcionales por rol
        // Atención médica: solo médicos, admin, superuser y tejedores (médicos)
        else if (pathname.startsWith('/atencion-medica') && !['medico', 'admin', 'superuser', 'tejedor'].includes(session.role)) {
            response = redirectToDashboard(session.role, request);
        }
        // Farmacia: solo operador, medico, admin, superuser y tejedores (farmacia)
        else if (pathname.startsWith('/farmacia') && !['operador', 'medico', 'admin', 'superuser', 'tejedor'].includes(session.role)) {
            response = redirectToDashboard(session.role, request);
        }
        // Reportes y Estadísticas: solo lectura visual para el resto
        else if ((pathname.startsWith('/reportes') || pathname.startsWith('/estadisticas')) && !['admin', 'superuser', 'tejedor', 'medico', 'operador'].includes(session.role)) {
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
        case 'admin':
            target = '/dashboard/admin';
            break;
        case 'tejedor':
        case 'medico':
        case 'operador':
            target = '/dashboard/tejedor';
            break;
        default:
            target = '/login';
    }
    return NextResponse.redirect(new URL(target, request.url));
}

function redirectAfterLogin(role: string, request: NextRequest) {
    let target = '/dashboard';
    switch (role) {
        case 'superuser':
        case 'admin':
            target = '/dashboard/admin';
            break;
        case 'tejedor':
        case 'medico':
        case 'operador':
            target = '/dashboard/tejedor';
            break;
        default:
            target = '/login';
    }
    return NextResponse.redirect(new URL(target, request.url));
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg).*)'],
};
