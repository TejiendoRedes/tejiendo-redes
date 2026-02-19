import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

export async function middleware(request: NextRequest) {
    const currentUser = request.cookies.get('session')?.value;
    const { pathname } = request.nextUrl;

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

    // 1. If user is logged in and hits /login or /, redirect to their specific dashboard
    if (session && (isLoginPage || pathname === '/')) {
        return redirectToDashboard(session.role, request);
    }

    // 2. If user is NOT logged in and tries to access protected content
    if (!session && !isLoginPage && !isUnirsePage && !isPublicApi && !isStaticAsset) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 3. Robust Role-Based Access Control
    if (session) {
        // Redirect root /dashboard to specific role dashboard
        if (pathname === '/dashboard') {
            return redirectToDashboard(session.role, request);
        }

        // Protect role-specific routes
        if (pathname.startsWith('/dashboard/super-usuario') && session.role !== 'superuser') {
            return redirectToDashboard(session.role, request);
        }
        if (pathname.startsWith('/dashboard/admin') && !['admin', 'superuser'].includes(session.role)) {
            return redirectToDashboard(session.role, request);
        }
        if (pathname.startsWith('/dashboard/tejedor') && session.role !== 'tejedor') {
            return redirectToDashboard(session.role, request);
        }

        // Protect API routes
        if (pathname.startsWith('/api/super') && session.role !== 'superuser') {
            return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
        }
        if (pathname.startsWith('/api/admin') && !['admin', 'superuser'].includes(session.role)) {
            return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
        }
    }

    return NextResponse.next();
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
            target = '/atencion-medica'; // Medicos might go straight to their task
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
