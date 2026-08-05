import '@testing-library/jest-dom';
import { vi } from 'vitest';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local or .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
process.env.JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'test-jwt-secret-key-12345678901234567890';

// Mock next/headers
vi.mock('next/headers', () => ({
    cookies: () => ({
        get: (name: string) => undefined,
        set: vi.fn(),
        delete: vi.fn(),
    }),
    headers: () => new Map(),
}));

// Mock auth helper for action/query tests
vi.mock('@/lib/auth', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/lib/auth')>();
    return {
        ...actual,
        requireAuth: vi.fn().mockResolvedValue({
            cedulaTejedor: 'V-00000000',
            nombreCompleto: 'Usuario Test',
            role: 'superuser',
        }),
        getSession: vi.fn().mockResolvedValue({
            cedulaTejedor: 'V-00000000',
            nombreCompleto: 'Usuario Test',
            role: 'superuser',
        }),
    };
});

// Mock Next.js router
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
}));

// Mock Next.js cache functions
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
    revalidateTag: vi.fn(),
}));

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});
