import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

export async function middleware(request: NextRequest) {
    const currentUser = request.cookies.get('session')?.value;

    // Decrypt the session to verify it's valid
    // If decryption fails, it returns null or throws, so we treat it as no session
    let session = null;
    if (currentUser) {
        try {
            session = await decrypt(currentUser);
        } catch (e) {
            session = null;
        }
    }

    // Paths that are public
    // - /login (public, but redirects to dashboard if logged in)
    // - /api/auth/* (public endpoints)
    // - /_next/* (static files)
    // - /favicon.ico, /logo.png, /minilogo.png (assets)

    const isLoginPage = request.nextUrl.pathname.startsWith('/login');
    const isPublicApi = request.nextUrl.pathname.startsWith('/api/auth');
    const isStaticAsset =
        request.nextUrl.pathname.startsWith('/_next') ||
        request.nextUrl.pathname.match(/\.(png|jpg|jpeg|gif|svg|ico)$/) ||
        request.nextUrl.pathname === '/';

    // If user is already logged in and tries to access login page, redirect to dashboard
    if (isLoginPage && session) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // If user is NOT logged in and tries to access a protected route
    // Protected routes are everything EXCEPT login, public api, and static assets
    if (!session && !isLoginPage && !isPublicApi && !isStaticAsset) {
        // Redirect to login
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg).*)'],
};
