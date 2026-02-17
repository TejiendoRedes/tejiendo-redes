import { NextResponse } from 'next/server';
import { encrypt, comparePassword } from '@/lib/auth';
import { cookies } from 'next/headers';

// Hardcoded user for now, as requested.
// In a real app, this would come from the database.
const USER = {
    usuario: 'admin',
    // bcrypt hash for 'Admin123!'
    // I will generate this hash on the fly or pre-calculate it.
    // For simplicity in this specific file, I'll compare against the plaintext in the logic 
    // OR better, I'll use the comparePassword function but I need a hash to compare against.
    // Since I don't have a DB yet, I'll just hardcode the check logic with the plain password
    // inside the route for the *temporary* auth, but simulating how it would work.
    // Actually, the requirements passed "Encriptación de contraseña (aunque sea hardcodeada, usar bcrypt)".
    // So I should hash 'Admin123!' and compare it.
    passwordHash: '$2a$10$wIs4G.e.w.w.w.w.w.w.w.w.w.w.w.w.w.w.w.w.w.w.w.w.w', // Placeholder
};

const HARDCODED_PASSWORD_HASH = '$2a$10$7Z/QzX6zM8q.X9.X9.X9.X9.X9.X9.X9.X9.X9.X9.X9.X9.X9.X9'; // To be real

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { usuario, password } = body;

        if (!usuario || !password) {
            return NextResponse.json(
                { error: 'Usuario y contraseña requeridos' },
                { status: 400 }
            );
        }

        // Pre-calculated hash for 'Admin123!'
        const ADMIN_PASSWORD_HASH = '$2b$10$8fHpCn8vhsjcbmAGDrkzdez0PdNrnAziSCbFhXlb0yIwUX8Jk//Xi';

        // Temporary hardcoded check for username, but secure password check
        if (usuario === 'admin') {
            // Verify password against the hash
            const isValid = await comparePassword(password, ADMIN_PASSWORD_HASH);

            if (!isValid) {
                return NextResponse.json(
                    { error: 'Credenciales inválidas' },
                    { status: 401 }
                );
            }

            // Create session
            const userPayload = {
                cedulaTejedor: '00000000',
                nombreTejedor: 'Administrador',
                apellidoTejedor: 'Sistema',
                role: 'admin',
                usuario: 'admin'
            };

            // Create token
            const token = await encrypt(userPayload);

            // Set cookie
            const cookieStore = await cookies();
            cookieStore.set('session', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                // Expires in 24 hours
                maxAge: 60 * 60 * 24,
            });

            return NextResponse.json({ success: true, user: userPayload });
        }

        return NextResponse.json(
            { error: 'Credenciales inválidas' },
            { status: 401 }
        );
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
